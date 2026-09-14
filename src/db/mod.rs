use crate::error::{AppError, Result};
use crate::models::{ShareItem, TrashItem, User, format_human_size};
use rusqlite::{params, Connection};
use std::collections::HashMap;
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
                created_at TEXT NOT NULL,
                is_totp_enabled INTEGER NOT NULL DEFAULT 0,
                totp_secret TEXT,
                backup_codes TEXT
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
                created_at TEXT NOT NULL,
                items_json TEXT
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

        Self::migrate_schema(conn)?;

        Ok(())
    }

    fn migrate_schema(conn: &Connection) -> Result<()> {
        let mut stmt = conn
            .prepare("PRAGMA table_info(users)")
            .map_err(|e| AppError::Db(e.to_string()))?;
        let columns: Vec<String> = stmt
            .query_map([], |row| row.get(1))
            .map_err(|e| AppError::Db(e.to_string()))?
            .filter_map(|r| r.ok())
            .collect();

        if !columns.contains(&"is_totp_enabled".to_string()) {
            conn.execute(
                "ALTER TABLE users ADD COLUMN is_totp_enabled INTEGER NOT NULL DEFAULT 0",
                [],
            )
            .map_err(|e| AppError::Db(e.to_string()))?;
        }
        if !columns.contains(&"totp_secret".to_string()) {
            conn.execute("ALTER TABLE users ADD COLUMN totp_secret TEXT", [])
                .map_err(|e| AppError::Db(e.to_string()))?;
        }
        if !columns.contains(&"backup_codes".to_string()) {
            conn.execute("ALTER TABLE users ADD COLUMN backup_codes TEXT", [])
                .map_err(|e| AppError::Db(e.to_string()))?;
        }

        let mut stmt_shares = conn
            .prepare("PRAGMA table_info(shares)")
            .map_err(|e| AppError::Db(e.to_string()))?;
        let share_columns: Vec<String> = stmt_shares
            .query_map([], |row| row.get(1))
            .map_err(|e| AppError::Db(e.to_string()))?
            .filter_map(|r| r.ok())
            .collect();

        if !share_columns.contains(&"items_json".to_string()) {
            conn.execute("ALTER TABLE shares ADD COLUMN items_json TEXT", [])
                .map_err(|e| AppError::Db(e.to_string()))?;
        }

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
            is_totp_enabled: false,
        })
    }

    pub async fn get_user_by_username(&self, username: &str) -> Result<Option<(User, String)>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, username, password_hash, role, created_at, is_totp_enabled FROM users WHERE username = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let user_opt = stmt
            .query_row(params![username], |row| {
                let is_totp: i32 = row.get(5).unwrap_or(0);
                let user = User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(3)?,
                    created_at: row.get(4)?,
                    is_totp_enabled: is_totp != 0,
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
            .prepare("SELECT id, username, role, created_at, is_totp_enabled FROM users WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let user_opt = stmt
            .query_row(params![id], |row| {
                let is_totp: i32 = row.get(4).unwrap_or(0);
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(2)?,
                    created_at: row.get(3)?,
                    is_totp_enabled: is_totp != 0,
                })
            })
            .ok();

        Ok(user_opt)
    }

    pub async fn get_user_with_hash_by_id(&self, id: &str) -> Result<Option<(User, String)>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, username, password_hash, role, created_at, is_totp_enabled FROM users WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let user_opt = stmt
            .query_row(params![id], |row| {
                let is_totp: i32 = row.get(5).unwrap_or(0);
                let user = User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(3)?,
                    created_at: row.get(4)?,
                    is_totp_enabled: is_totp != 0,
                };
                let hash: String = row.get(2)?;
                Ok((user, hash))
            })
            .ok();

        Ok(user_opt)
    }

    pub async fn list_users(&self) -> Result<Vec<User>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, username, role, created_at, is_totp_enabled FROM users ORDER BY created_at ASC")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                let is_totp: i32 = row.get(4).unwrap_or(0);
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    role: row.get(2)?,
                    created_at: row.get(3)?,
                    is_totp_enabled: is_totp != 0,
                })
            })
            .map_err(|e| AppError::Db(e.to_string()))?;

        let mut users = Vec::new();
        for r in rows {
            if let Ok(u) = r {
                users.push(u);
            }
        }
        Ok(users)
    }

    pub async fn update_user_password(&self, id: &str, password_hash: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE users SET password_hash = ?1 WHERE id = ?2",
            params![password_hash, id],
        )
        .map_err(|e| AppError::Db(format!("Failed to update password: {}", e)))?;
        Ok(())
    }

    pub async fn save_pending_totp(&self, user_id: &str, secret: &str, backup_codes_json: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE users SET totp_secret = ?1, backup_codes = ?2 WHERE id = ?3",
            params![secret, backup_codes_json, user_id],
        )
        .map_err(|e| AppError::Db(format!("Failed to save 2FA setup: {}", e)))?;
        Ok(())
    }

    pub async fn enable_totp(&self, user_id: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE users SET is_totp_enabled = 1 WHERE id = ?1",
            params![user_id],
        )
        .map_err(|e| AppError::Db(format!("Failed to enable 2FA: {}", e)))?;
        Ok(())
    }

    pub async fn update_totp_secret(&self, user_id: &str, secret: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE users SET totp_secret = ?1 WHERE id = ?2",
            params![secret, user_id],
        )
        .map_err(|e| AppError::Db(format!("Failed to update 2FA secret: {}", e)))?;
        Ok(())
    }

    pub async fn disable_totp(&self, user_id: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "UPDATE users SET is_totp_enabled = 0, totp_secret = NULL, backup_codes = NULL WHERE id = ?1",
            params![user_id],
        )
        .map_err(|e| AppError::Db(format!("Failed to disable 2FA: {}", e)))?;
        Ok(())
    }

    pub async fn get_totp_secret(&self, user_id: &str) -> Result<Option<String>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT totp_secret FROM users WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;
        let secret: Option<String> = stmt
            .query_row(params![user_id], |row| row.get(0))
            .ok();
        Ok(secret)
    }

    pub async fn validate_and_consume_backup_code(&self, user_id: &str, code: &str) -> Result<bool> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT backup_codes FROM users WHERE id = ?1")
            .map_err(|e| AppError::Db(e.to_string()))?;
        let codes_json_opt: Option<String> = stmt
            .query_row(params![user_id], |row| row.get(0))
            .ok()
            .flatten();

        let Some(json_str) = codes_json_opt else {
            return Ok(false);
        };

        let Ok(mut codes): std::result::Result<Vec<String>, _> = serde_json::from_str(&json_str) else {
            return Ok(false);
        };

        let clean_code = code.trim().to_uppercase();
        if let Some(pos) = codes.iter().position(|c| c.to_uppercase() == clean_code) {
            codes.remove(pos);
            let updated_json = serde_json::to_string(&codes)
                .map_err(|e| AppError::Internal(e.to_string()))?;
            conn.execute(
                "UPDATE users SET backup_codes = ?1 WHERE id = ?2",
                params![updated_json, user_id],
            )
            .map_err(|e| AppError::Db(format!("Failed to update backup codes: {}", e)))?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn delete_user(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute("DELETE FROM users WHERE id = ?1", params![id])
            .map_err(|e| AppError::Db(format!("Failed to delete user: {}", e)))?;
        Ok(())
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
        items_json: Option<String>,
    ) -> Result<ShareItem> {
        let id = Uuid::new_v4().to_string();
        let token = Uuid::new_v4().to_string().replace('-', "")[..12].to_string();
        let created_at = chrono::Utc::now().to_rfc3339();

        let conn = self.conn.lock().await;
        conn.execute(
            "INSERT INTO shares (id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at, items_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9, ?10)",
            params![
                id,
                token,
                root_name,
                path,
                is_dir as i32,
                password_hash,
                expires_at,
                allow_download as i32,
                created_at,
                items_json
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
            items_json,
        })
    }

    pub async fn get_share_by_token(&self, token: &str) -> Result<Option<(ShareItem, Option<String>)>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at, items_json FROM shares WHERE token = ?1")
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
                    items_json: row.get(10)?,
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
            .prepare("SELECT id, token, root_name, path, is_dir, password_hash, expires_at, view_count, allow_download, created_at, items_json FROM shares ORDER BY created_at DESC")
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
                    items_json: row.get(10)?,
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

    // --- Settings ---
    pub async fn get_all_settings(&self) -> Result<HashMap<String, String>> {
        let conn = self.conn.lock().await;
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings")
            .map_err(|e| AppError::Db(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                let k: String = row.get(0)?;
                let v: String = row.get(1)?;
                Ok((k, v))
            })
            .map_err(|e| AppError::Db(e.to_string()))?;

        let mut map = HashMap::new();
        for r in rows {
            if let Ok((k, v)) = r {
                map.insert(k, v);
            }
        }
        Ok(map)
    }

    pub async fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().await;
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
            params![key, value],
        )
        .map_err(|e| AppError::Db(format!("Failed to save setting '{}': {}", key, e)))?;
        Ok(())
    }
}
