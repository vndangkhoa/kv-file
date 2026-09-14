use crate::error::{AppError, Result};
use crate::fs::sandbox::RootManager;
use crate::models::{
    format_human_size, BreadcrumbItem, DirectoryListing, FileItem, MediaType, TreeNode,
};
use chrono::{DateTime, Utc};
use std::ffi::CString;
use std::path::Path;

pub struct FileOperations;

impl FileOperations {
    pub async fn list_directory(
        roots: &RootManager,
        root_name: &str,
        relative_path: &str,
    ) -> Result<DirectoryListing> {
        let abs_path = roots.resolve_safe(root_name, relative_path)?;
        let root_dir = roots
            .get_root(root_name)
            .ok_or_else(|| AppError::NotFound(format!("Storage root '{}' not found", root_name)))?;

        if !abs_path.exists() {
            return Err(AppError::NotFound(format!("Path '{}' does not exist", relative_path)));
        }

        if !abs_path.is_dir() {
            return Err(AppError::BadRequest("Target is not a directory".to_string()));
        }

        let mut read_dir = tokio::fs::read_dir(&abs_path).await?;
        let mut items = Vec::new();
        let mut total_size = 0u64;
        let mut total_folders = 0usize;
        let mut total_files = 0usize;

        while let Some(entry) = read_dir.next_entry().await? {
            let file_name = entry.file_name().to_string_lossy().to_string();

            // Ignore hidden files and internal directories like .trash
            if file_name.starts_with('.') {
                continue;
            }

            let entry_path = entry.path();
            let metadata = match entry.metadata().await {
                Ok(m) => m,
                Err(_) => continue,
            };

            let is_dir = metadata.is_dir();
            let size = if is_dir { 0 } else { metadata.len() };
            if is_dir {
                total_folders += 1;
            } else {
                total_files += 1;
                total_size += size;
            }

            let rel = match entry_path.strip_prefix(root_dir) {
                Ok(p) => p.to_string_lossy().to_string(),
                Err(_) => file_name.clone(),
            };

            let extension = if is_dir {
                String::new()
            } else {
                entry_path
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("")
                    .to_lowercase()
            };

            let media_type = if is_dir {
                MediaType::Other
            } else {
                MediaType::from_extension(&extension)
            };

            let mime_type = if is_dir {
                "directory".to_string()
            } else {
                mime_guess::from_path(&entry_path)
                    .first_or_octet_stream()
                    .to_string()
            };

            let mod_time = metadata
                .modified()
                .ok()
                .map(DateTime::<Utc>::from)
                .unwrap_or_else(Utc::now);

            items.push(FileItem {
                name: file_name,
                path: rel,
                root_name: root_name.to_string(),
                is_dir,
                size,
                human_size: format_human_size(size),
                mod_time,
                extension,
                media_type,
                mime_type,
                item_count: None,
            });
        }

        // Sort folders first, then alphabetical (case-insensitive)
        items.sort_by(|a, b| match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        });

        // Build breadcrumbs
        let breadcrumbs = Self::build_breadcrumbs(relative_path);

        Ok(DirectoryListing {
            root_name: root_name.to_string(),
            current_path: relative_path.trim_matches('/').to_string(),
            breadcrumbs,
            total_items: items.len(),
            total_folders,
            total_files,
            total_size,
            items,
        })
    }

    pub async fn get_tree(
        roots: &RootManager,
        root_name: &str,
        relative_path: &str,
        max_depth: usize,
    ) -> Result<TreeNode> {
        let abs_path = roots.resolve_safe(root_name, relative_path)?;
        let name = if relative_path.is_empty() || relative_path == "/" {
            root_name.to_string()
        } else {
            abs_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(root_name)
                .to_string()
        };

        let mut node = TreeNode {
            name,
            path: relative_path.trim_matches('/').to_string(),
            root_name: root_name.to_string(),
            has_children: false,
            children: None,
        };

        if max_depth > 0 && abs_path.is_dir() {
            let mut read_dir = match tokio::fs::read_dir(&abs_path).await {
                Ok(rd) => rd,
                Err(_) => return Ok(node),
            };

            let mut children = Vec::new();
            while let Ok(Some(entry)) = read_dir.next_entry().await {
                let fname = entry.file_name().to_string_lossy().to_string();
                if fname.starts_with('.') {
                    continue;
                }
                if let Ok(meta) = entry.metadata().await {
                    if meta.is_dir() {
                        let child_rel = if relative_path.is_empty() || relative_path == "/" {
                            fname.clone()
                        } else {
                            format!("{}/{}", relative_path.trim_matches('/'), fname)
                        };

                        let child_node = Box::pin(Self::get_tree(
                            roots,
                            root_name,
                            &child_rel,
                            max_depth - 1,
                        ))
                        .await?;
                        children.push(child_node);
                    }
                }
            }

            children.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
            node.has_children = !children.is_empty();
            node.children = Some(children);
        }

        Ok(node)
    }

    pub fn build_breadcrumbs(relative_path: &str) -> Vec<BreadcrumbItem> {
        let clean = relative_path.trim_matches('/');
        let mut crumbs = vec![BreadcrumbItem {
            name: "Home".to_string(),
            path: "".to_string(),
        }];

        if clean.is_empty() {
            return crumbs;
        }

        let mut acc = String::new();
        for seg in clean.split('/') {
            if seg.is_empty() {
                continue;
            }
            if !acc.is_empty() {
                acc.push('/');
            }
            acc.push_str(seg);
            crumbs.push(BreadcrumbItem {
                name: seg.to_string(),
                path: acc.clone(),
            });
        }
        crumbs
    }

    pub async fn create_folder(roots: &RootManager, root_name: &str, relative_path: &str) -> Result<()> {
        let abs_path = roots.resolve_safe(root_name, relative_path)?;
        tokio::fs::create_dir_all(&abs_path).await?;
        Ok(())
    }

    pub async fn rename_item(
        roots: &RootManager,
        root_name: &str,
        old_path: &str,
        new_name: &str,
    ) -> Result<()> {
        let old_abs = roots.resolve_safe(root_name, old_path)?;
        let parent = old_abs
            .parent()
            .ok_or_else(|| AppError::BadRequest("Cannot rename root".to_string()))?;

        // Sanitize new_name to avoid slashes
        let clean_new_name = new_name.trim_matches(['/', '\\']);
        if clean_new_name.is_empty() || clean_new_name.contains('/') || clean_new_name.contains('\\') {
            return Err(AppError::BadRequest("Invalid new filename".to_string()));
        }

        let new_abs = parent.join(clean_new_name);
        if new_abs.exists() {
            return Err(AppError::BadRequest("An item with that name already exists".to_string()));
        }

        tokio::fs::rename(&old_abs, &new_abs).await?;
        Ok(())
    }

    pub async fn move_item(
        roots: &RootManager,
        root_name: &str,
        source_path: &str,
        dest_folder_path: &str,
    ) -> Result<()> {
        let src_abs = roots.resolve_safe(root_name, source_path)?;
        let dest_dir = roots.resolve_safe(root_name, dest_folder_path)?;

        if !dest_dir.is_dir() {
            return Err(AppError::BadRequest("Destination is not a directory".to_string()));
        }

        let file_name = src_abs
            .file_name()
            .ok_or_else(|| AppError::BadRequest("Invalid source item".to_string()))?;

        let dest_abs = dest_dir.join(file_name);
        if dest_abs.exists() {
            return Err(AppError::BadRequest("Target file already exists in destination".to_string()));
        }

        tokio::fs::rename(&src_abs, &dest_abs).await?;
        Ok(())
    }

    pub async fn copy_item(
        roots: &RootManager,
        root_name: &str,
        source_path: &str,
        dest_folder_path: &str,
    ) -> Result<()> {
        let src_abs = roots.resolve_safe(root_name, source_path)?;
        let dest_dir = roots.resolve_safe(root_name, dest_folder_path)?;

        if !dest_dir.is_dir() {
            return Err(AppError::BadRequest("Destination is not a directory".to_string()));
        }

        let file_name = src_abs
            .file_name()
            .ok_or_else(|| AppError::BadRequest("Invalid source item".to_string()))?;

        let dest_abs = dest_dir.join(file_name);
        if dest_abs.exists() {
            return Err(AppError::BadRequest("Target file already exists in destination".to_string()));
        }

        if src_abs.is_dir() {
            Self::copy_dir_recursive(&src_abs, &dest_abs).await?;
        } else {
            tokio::fs::copy(&src_abs, &dest_abs).await?;
        }

        Ok(())
    }

    pub async fn permanent_delete(roots: &RootManager, root_name: &str, relative_path: &str) -> Result<()> {
        let abs_path = roots.resolve_safe(root_name, relative_path)?;
        if abs_path.is_dir() {
            tokio::fs::remove_dir_all(&abs_path).await?;
        } else {
            tokio::fs::remove_file(&abs_path).await?;
        }
        Ok(())
    }

    fn copy_dir_recursive<'a>(
        src: &'a Path,
        dst: &'a Path,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<()>> + Send + 'a>> {
        Box::pin(async move {
            tokio::fs::create_dir_all(dst).await?;
            let mut read_dir = tokio::fs::read_dir(src).await?;
            while let Some(entry) = read_dir.next_entry().await? {
                let entry_path = entry.path();
                let file_name = entry.file_name();
                let target_path = dst.join(file_name);

                if entry.file_type().await?.is_dir() {
                    Self::copy_dir_recursive(&entry_path, &target_path).await?;
                } else {
                    tokio::fs::copy(&entry_path, &target_path).await?;
                }
            }
            Ok(())
        })
    }

    pub async fn search(
        roots: &RootManager,
        root_name: &str,
        query: &str,
        max_results: usize,
    ) -> Result<Vec<FileItem>> {
        let root_dir = roots
            .get_root(root_name)
            .ok_or_else(|| AppError::NotFound(format!("Root '{}' not found", root_name)))?;

        let q = query.to_lowercase();
        let mut results = Vec::new();
        let mut stack = vec![root_dir.clone()];

        while let Some(dir) = stack.pop() {
            if results.len() >= max_results {
                break;
            }

            let mut read_dir = match tokio::fs::read_dir(&dir).await {
                Ok(rd) => rd,
                Err(_) => continue,
            };

            while let Ok(Some(entry)) = read_dir.next_entry().await {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with('.') {
                    continue;
                }

                let entry_path = entry.path();
                let is_match = name.to_lowercase().contains(&q);

                if let Ok(meta) = entry.metadata().await {
                    let is_dir = meta.is_dir();
                    if is_dir {
                        stack.push(entry_path.clone());
                    }

                    if is_match {
                        let rel = entry_path
                            .strip_prefix(root_dir)
                            .map(|p| p.to_string_lossy().to_string())
                            .unwrap_or_else(|_| name.clone());

                        let ext = if is_dir {
                            String::new()
                        } else {
                            entry_path
                                .extension()
                                .and_then(|e| e.to_str())
                                .unwrap_or("")
                                .to_string()
                        };

                        let media_type = if is_dir {
                            MediaType::Other
                        } else {
                            MediaType::from_extension(&ext)
                        };

                        let size = if is_dir { 0 } else { meta.len() };
                        let mod_time = meta
                            .modified()
                            .ok()
                            .map(DateTime::<Utc>::from)
                            .unwrap_or_else(Utc::now);

                        results.push(FileItem {
                            name,
                            path: rel,
                            root_name: root_name.to_string(),
                            is_dir,
                            size,
                            human_size: format_human_size(size),
                            mod_time,
                            extension: ext,
                            media_type,
                            mime_type: "application/octet-stream".to_string(),
                            item_count: None,
                        });

                        if results.len() >= max_results {
                            break;
                        }
                    }
                }
            }
        }

        Ok(results)
    }

    pub fn get_disk_info(path: &Path) -> (u64, u64, u64) {
        let c_path = match CString::new(path.to_string_lossy().as_bytes()) {
            Ok(c) => c,
            Err(_) => return (0, 0, 0),
        };

        unsafe {
            let mut stat: libc::statvfs = std::mem::zeroed();
            if libc::statvfs(c_path.as_ptr(), &mut stat) == 0 {
                let total = stat.f_blocks * stat.f_frsize;
                let free = stat.f_bavail * stat.f_frsize;
                let used = total.saturating_sub(free);
                (total, free, used)
            } else {
                (0, 0, 0)
            }
        }
    }
}
