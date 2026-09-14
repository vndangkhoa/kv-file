use crate::error::{AppError, Result};
use crate::models::{ShareItem, TrashItem, User, format_human_size};
use rusqlite::{params, Connection};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(db_path: &Path) -> Result<Self> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(db_path)
            .map_err(|e| AppError::Db(format!("Failed to open SQLite database: {}", e)))?;

        // Enable SQLite WAL mode & performance tuning
        conn.pragma_update(None, "journal_mode", "WAL")
            .map_err(|e| AppError::Db(format!("Failed to set journal_mode: {}", e)))?;
        conn.pragma_update(None, "busy_timeout", 5000)
            .map_err(|e| AppError::Db(format!("Failed to set busy_timeout: {}", e)))?;
        conn.pragma_update(None, "synchronous", "NORMAL")
            .map_err(|e| AppError::Db(format!("Failed to set synchronous: {}", e)))?;

        Self::init_tables(&conn)?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    fn init_tables(conn: &Connection) -> Result<()> {
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'admin',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS shares (
                id TEXT PRIMARY KEY,
                token TEXT UNIQUE NOT NULL,
                root_name TEXT NOT NULL,
                path TEXT NOT NULL,
                is_dir INTEGER NOT NULL DEFAULT 0,
                password_hash TEXT,
                expires_at TEXT,
                view_count INTEGER NOT NULL DEFAULT 0,
                allow_download INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS trash (
                id TEXT PRIMARY KEY,
                root_name TEXT NOT NULL,
                original_path TEXT NOT NULL,
                trash_name TEXT NOT NULL,
                size INTEGER NOT NULL DEFAULT 0,
                is_dir INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            ",
        )
        .map_err(|e| AppError::Db(format!("Failed to initialize database schema: {}", e)))?;

        Ok(())
    }

    // --- Users ---
    pub async fn has_users(&self) -> Result<bool> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT COUNT(*) FROM users")
            .map_err(|e| AppError::Db(e.to_string()))?;
        let count: i64 = stmt
            .query_row([], |r| r.get(0))
            .map_err(|e| AppError::Db(e.to_string()))?;
        Ok(count > 0)
    }

    pub async fn create_user(&self, username: &str, password_hash: &str, role: &str) -> Result<User> {
        let id = Uuid::new_v4().to_string();
        let created_at = chrono::Utc::now().to_rfc3339();

        let conn = self.conn.lock().await;
        conn.execute(
            "INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, username, password_hash, role, created_at],
        )
        .map_err(|e| AppError::Db(format!("Failed to create user: {}", e)))?;

        Ok(User {
            id,
            username: username.to_string(),
            role: role.to_string(),
            created_at,
        })
    }

    pub async fn get_user_by_username(&self, username: &str) -> Result<Option<(User, String)>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let user_opt = stmt
            .query_row(params![username], |row| {
                let user = User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(3)?,
                    created_at: row.get(4)?,
                };
                let hash: String = row.get(2)?;
                Ok((user, hash))
            })
            .ok();

        Ok(user_opt)
    }

    #[allow(dead_code)]
    pub async fn get_user_by_id(&self, id: &str) -> Result<Option<User>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, username, role, created_at FROM users WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let user_opt = stmt
            .query_row(params![id], |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })
            .ok();

        Ok(user_opt)
    }

    // --- Shares ---
    pub async fn create_share(
        &self,
        root_name: &str,
        path: &str,
        is_dir: bool,
        password_hash: Option<String>,
        expires_at: Option<String>,
        allow_download: bool,
    ) -> Result<ShareItem> {
        let id = Uuid::new_v4().to_string();
        let token = Uuid::new_v4().to_string().replace('-', "")[..12].to_string();
        let created_at = chrono::Utc::now().to_rfc3339();

        let conn = self.conn.lock().await;
        conn.execute(
            "INSERT INTO shares (id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9)",
            params![
                id,
                token,
                root_name,
                path,
                is_dir as i32,
                password_hash,
                expires_at,
                allow_download as i32,
                created_at
            ],
        )
        .map_err(|e| AppError::Db(format!("Failed to create share: {}", e)))?;

        Ok(ShareItem {
            id,
            token,
            root_name: root_name.to_string(),
            path: path.to_string(),
            is_dir,
            has_password: password_hash.is_some(),
            expires_at,
            view_count: 0,
            allow_download,
            created_at,
        })
    }

    pub async fn get_share_by_token(&self, token: &str) -> Result<Option<(ShareItem, Option<String>)>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at FROM shares WHERE token = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let res = stmt
            .query_row(params![token], |row| {
                let is_dir: i32 = row.get(4)?;
                let pw_hash: Option<String> = row.get(5)?;
                let allow_dl: i32 = row.get(8)?;

                let item = ShareItem {
                    id: row.get(0)?,
                    token: row.get(1)?,
                    root_name: row.get(2)?,
                    path: row.get(3)?,
                    is_dir: is_dir != 0,
                    has_password: pw_hash.is_some(),
                    expires_at: row.get(6)?,
                    view_count: row.get(7)?,
                    allow_download: allow_dl != 0,
                    created_at: row.get(9)?,
                };
                Ok((item, pw_hash))
            })
            .ok();

        Ok(res)
    }

    pub async fn increment_share_view(&self, token: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE shares SET view_count = view_count + 1 WHERE token = ?1",
            params![token],
        )
        .map_err(|e| AppError::Db(e.to_string()))?;
        Ok(())
    }

    pub async fn list_shares(&self) -> Result<Vec<ShareItem>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at FROM shares ORDER BY created_at DESC")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                let is_dir: i32 = row.get(4)?;
                let pw_hash: Option<String> = row.get(5)?;
                let allow_dl: i32 = row.get(8)?;

                Ok(ShareItem {
                    id: row.get(0)?,
                    token: row.get(1)?,
                    root_name: row.get(2)?,
                    path: row.get(3)?,
                    is_dir: is_dir != 0,
                    has_password: pw_hash.is_some(),
                    expires_at: row.get(6)?,
                    view_count: row.get(7)?,
                    allow_download: allow_dl != 0,
                    created_at: row.get(9)?,
                })
            })
            .map_err(|e| AppError::Db(e.to_string()))?;

        let mut shares = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                shares.push(item);
            }
        }
        Ok(shares)
    }

    pub async fn delete_share(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute("DELETE FROM shares WHERE id = ?1", params![id])
            .map_err(|e| AppError::Db(e.to_string()))?;
        Ok(())
    }

    // --- Trash Bin ---
    pub async fn add_trash_item(
        &self,
        root_name: &str,
        original_path: &str,
        trash_name: &str,
        size: u64,
        is_dir: bool,
    ) -> Result<TrashItem> {
        let id = Uuid::new_v4().to_string();
        let deleted_at = chrono::Utc::now().to_rfc3339();

        let conn = self.conn.lock().await;
        conn.execute(
            "INSERT INTO trash (id, root_name, original_path, trash_name, size, is_dir, deleted_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                id,
                root_name,
                original_path,
                trash_name,
                size as i64,
                is_dir as i32,
                deleted_at
            ],
        )
        .map_err(|e| AppError::Db(format!("Failed to record trash item: {}", e)))?;

        Ok(TrashItem {
            id,
            root_name: root_name.to_string(),
            original_path: original_path.to_string(),
            trash_name: trash_name.to_string(),
            size,
            human_size: format_human_size(size),
            is_dir,
            deleted_at,
        })
    }

    pub async fn get_trash_item(&self, id: &str) -> Result<Option<TrashItem>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, root_name, original_path, trash_name, size, is_dir, deleted_at FROM trash WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let res = stmt
            .query_row(params![id], |row| {
                let size_i64: i64 = row.get(4)?;
                let is_dir: i32 = row.get(5)?;
                let size = size_i64 as u64;

                Ok(TrashItem {
                    id: row.get(0)?,
                    root_name: row.get(1)?,
                    original_path: row.get(2)?,
                    trash_name: row.get(3)?,
                    size,
                    human_size: format_human_size(size),
                    is_dir: is_dir != 0,
                    deleted_at: row.get(6)?,
                })
            })
            .ok();

        Ok(res)
    }

    pub async fn list_trash(&self) -> Result<Vec<TrashItem>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, root_name, original_path, trash_name, size, is_dir, deleted_at FROM trash ORDER BY deleted_at DESC")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                let size_i64: i64 = row.get(4)?;
                let is_dir: i32 = row.get(5)?;
                let size = size_i64 as u64;

                Ok(TrashItem {
                    id: row.get(0)?,
                    root_name: row.get(1)?,
                    original_path: row.get(2)?,
                    trash_name: row.get(3)?,
                    size,
                    human_size: format_human_size(size),
                    is_dir: is_dir != 0,
                    deleted_at: row.get(6)?,
                })
            })
            .map_err(|e| AppError::Db(e.to_string()))?;

        let mut items = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                items.push(item);
            }
        }
        Ok(items)
    }

    pub async fn remove_trash_item(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute("DELETE FROM trash WHERE id = ?1", params![id])
            .map_err(|e| AppError::Db(e.to_string()))?;
        Ok(())
    }

    pub async fn clear_trash(&self) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute("DELETE FROM trash", [])
            .map_err(|e| AppError::Db(e.to_string()))?;
        Ok(())
    }
}
