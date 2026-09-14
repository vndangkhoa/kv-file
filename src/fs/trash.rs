use crate::db::Database;
use crate::error::{AppError, Result};
use crate::fs::sandbox::RootManager;
use crate::models::TrashItem;
use uuid::Uuid;

pub struct TrashManager;

impl TrashManager {
    pub async fn soft_delete(
        roots: &RootManager,
        db: &Database,
        root_name: &str,
        relative_path: &str,
    ) -> Result<TrashItem> {
        let abs_path = roots.resolve_safe(root_name, relative_path)?;
        let root_dir = roots
            .get_root(root_name)
            .ok_or_else(|| AppError::NotFound("Root not found".to_string()))?;

        let trash_dir = root_dir.join(".trash");
        if !trash_dir.exists() {
            tokio::fs::create_dir_all(&trash_dir).await?;
        }

        let file_name = abs_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("item");

        let unique_id = Uuid::new_v4().to_string();
        let trash_name = format!("{}_{}", &unique_id[..8], file_name);
        let trash_target = trash_dir.join(&trash_name);

        let metadata = tokio::fs::metadata(&abs_path).await?;
        let is_dir = metadata.is_dir();
        let size = if is_dir { 0 } else { metadata.len() };

        // Move to .trash directory
        tokio::fs::rename(&abs_path, &trash_target).await?;

        // Record in DB
        let item = db
            .add_trash_item(root_name, relative_path, &trash_name, size, is_dir)
            .await?;

        Ok(item)
    }

    pub async fn restore(roots: &RootManager, db: &Database, trash_id: &str) -> Result<()> {
        let trash_item = db
            .get_trash_item(trash_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Trash item not found".to_string()))?;

        let root_dir = roots
            .get_root(&trash_item.root_name)
            .ok_or_else(|| AppError::NotFound("Root not found".to_string()))?;

        let trash_source = root_dir.join(".trash").join(&trash_item.trash_name);
        if !trash_source.exists() {
            // Trash file is missing from disk, clean up DB
            let _ = db.remove_trash_item(trash_id).await;
            return Err(AppError::NotFound("File no longer exists in trash bin".to_string()));
        }

        let mut dest = roots.resolve_safe(&trash_item.root_name, &trash_item.original_path)?;

        // Ensure parent directories exist
        if let Some(parent) = dest.parent() {
            if !parent.exists() {
                tokio::fs::create_dir_all(parent).await?;
            }
        }

        // Handle destination collision by appending timestamp
        if dest.exists() {
            let stem = dest
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("restored");
            let ext = dest
                .extension()
                .and_then(|e| e.to_str())
                .map(|e| format!(".{}", e))
                .unwrap_or_default();
            let new_name = format!("{}_restored_{}{}", stem, chrono::Utc::now().timestamp(), ext);
            dest = dest.with_file_name(new_name);
        }

        tokio::fs::rename(&trash_source, &dest).await?;
        db.remove_trash_item(trash_id).await?;

        Ok(())
    }

    pub async fn purge(roots: &RootManager, db: &Database, trash_id: &str) -> Result<()> {
        let trash_item = db
            .get_trash_item(trash_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Trash item not found".to_string()))?;

        let root_dir = roots
            .get_root(&trash_item.root_name)
            .ok_or_else(|| AppError::NotFound("Root not found".to_string()))?;

        let trash_target = root_dir.join(".trash").join(&trash_item.trash_name);
        if trash_target.exists() {
            if trash_item.is_dir {
                let _ = tokio::fs::remove_dir_all(&trash_target).await;
            } else {
                let _ = tokio::fs::remove_file(&trash_target).await;
            }
        }

        db.remove_trash_item(trash_id).await?;
        Ok(())
    }

    pub async fn empty_trash(roots: &RootManager, db: &Database) -> Result<()> {
        for (_name, root_dir) in roots.get_roots() {
            let trash_dir = root_dir.join(".trash");
            if trash_dir.exists() {
                let _ = tokio::fs::remove_dir_all(&trash_dir).await;
                let _ = tokio::fs::create_dir_all(&trash_dir).await;
            }
        }
        db.clear_trash().await?;
        Ok(())
    }
}
