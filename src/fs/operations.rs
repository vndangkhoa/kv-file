use crate::error::{AppError, Result};
use crate::fs::sandbox::RootManager;
use crate::models::{
    format_human_size, BreadcrumbItem, DirectoryListing, FileItem, MediaType, TreeNode,
};
use chrono::{DateTime, Utc};
use std::ffi::CString;
use std::path::{Path, PathBuf};

pub fn is_system_name(name: &str) -> bool {
    name.starts_with('.')
        || name.starts_with('@')
        || name == "#recycle"
        || name == ".recycle"
        || name == "$RECYCLE.BIN"
        || name == "System Volume Information"
        || name == "lost+found"
}

pub struct FileOperations;

impl FileOperations {
    pub async fn list_directory(
        roots: &RootManager,
        root_name: &str,
        relative_path: &str,
        show_hidden: bool,
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
        let mut hidden_count = 0usize;

        while let Some(entry) = read_dir.next_entry().await? {
            let file_name = entry.file_name().to_string_lossy().to_string();

            let is_system = is_system_name(&file_name);
            if is_system && !show_hidden {
                hidden_count += 1;
                continue;
            }

            let entry_path = entry.path();
            let metadata = match entry.metadata().await {
                Ok(m) => m,
                Err(_) => continue,
            };

            let is_dir = if metadata.is_symlink() {
                tokio::fs::metadata(&entry_path).await.map(|m| m.is_dir()).unwrap_or(false)
            } else {
                metadata.is_dir()
            };
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
                is_system,
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
            hidden_count,
        })
    }

    pub async fn get_tree(
        roots: &RootManager,
        root_name: &str,
        relative_path: &str,
        max_depth: usize,
        show_hidden: bool,
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

        let is_system = is_system_name(&name);

        let mut node = TreeNode {
            name,
            path: relative_path.trim_matches('/').to_string(),
            root_name: root_name.to_string(),
            has_children: false,
            children: None,
            is_system,
        };

        if max_depth > 0 && abs_path.is_dir() {
            let mut read_dir = match tokio::fs::read_dir(&abs_path).await {
                Ok(rd) => rd,
                Err(_) => return Ok(node),
            };

            let mut children = Vec::new();
            while let Ok(Some(entry)) = read_dir.next_entry().await {
                let fname = entry.file_name().to_string_lossy().to_string();
                if is_system_name(&fname) && !show_hidden {
                    continue;
                }
                if let Ok(meta) = entry.metadata().await {
                    let is_dir = if meta.is_symlink() {
                        tokio::fs::metadata(&entry.path()).await.map(|m| m.is_dir()).unwrap_or(false)
                    } else {
                        meta.is_dir()
                    };
                    if is_dir {
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
                            show_hidden,
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

        let mut text_tokens = Vec::new();
        let mut filter_ext: Option<String> = None;
        let mut filter_type: Option<String> = None;
        let mut min_size: Option<u64> = None;
        let mut max_size: Option<u64> = None;
        let mut path_filter: Option<String> = None;

        for part in query.split_whitespace() {
            let lower_part = part.to_lowercase();
            if let Some(val) = lower_part.strip_prefix("ext:") {
                filter_ext = Some(val.trim_start_matches('.').to_string());
            } else if let Some(val) = lower_part.strip_prefix("type:") {
                filter_type = Some(val.to_string());
            } else if let Some(val) = lower_part.strip_prefix("size:>") {
                min_size = parse_size_str(val);
            } else if let Some(val) = lower_part.strip_prefix("size:<") {
                max_size = parse_size_str(val);
            } else if let Some(val) = lower_part.strip_prefix("in:") {
                path_filter = Some(val.trim_matches('/').to_string());
            } else if !part.is_empty() {
                text_tokens.push(lower_part);
            }
        }

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
                if is_system_name(&name) {
                    continue;
                }

                let entry_path = entry.path();
                let meta = match entry.metadata().await {
                    Ok(m) => m,
                    Err(_) => continue,
                };

                let is_dir = meta.is_dir();
                if is_dir {
                    stack.push(entry_path.clone());
                }

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
                        .to_lowercase()
                };

                let media_type = if is_dir {
                    MediaType::Other
                } else {
                    MediaType::from_extension(&ext)
                };

                let size = if is_dir { 0 } else { meta.len() };

                // Apply power filters
                let mut matches = true;

                if let Some(ref fe) = filter_ext {
                    if is_dir || &ext != fe {
                        matches = false;
                    }
                }

                if matches && filter_type.is_some() {
                    let ft = filter_type.as_ref().unwrap();
                    let type_str = match media_type {
                        MediaType::Video => "video",
                        MediaType::Image => "image",
                        MediaType::Audio => "audio",
                        MediaType::Pdf => "pdf",
                        MediaType::Text => "text",
                        MediaType::Code => "code",
                        MediaType::Archive => "archive",
                        MediaType::Doc => "doc",
                        MediaType::Spreadsheet => "spreadsheet",
                        MediaType::Presentation => "presentation",
                        MediaType::Other => if is_dir { "folder" } else { "other" },
                    };
                    if type_str != ft && !(ft == "doc" && (type_str == "pdf" || type_str == "text" || type_str == "doc" || type_str == "spreadsheet" || type_str == "presentation")) {
                        matches = false;
                    }
                }

                if matches && min_size.is_some() && size < min_size.unwrap() {
                    matches = false;
                }

                if matches && max_size.is_some() && size > max_size.unwrap() {
                    matches = false;
                }

                if matches && path_filter.is_some() {
                    let pf = path_filter.as_ref().unwrap();
                    if !rel.to_lowercase().contains(pf) {
                        matches = false;
                    }
                }

                if matches && !text_tokens.is_empty() {
                    let name_lower = name.to_lowercase();
                    let rel_lower = rel.to_lowercase();
                    for token in &text_tokens {
                        if !name_lower.contains(token) && !rel_lower.contains(token) {
                            matches = false;
                            break;
                        }
                    }
                }

                if matches {
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
                        mime_type: if is_dir {
                            "directory".to_string()
                        } else {
                            mime_guess::from_path(&entry_path)
                                .first_or_octet_stream()
                                .to_string()
                        },
                        item_count: None,
                        is_system: false,
                    });

                    if results.len() >= max_results {
                        break;
                    }
                }
            }
        }

        Ok(results)
    }

    pub async fn create_zip_archive(dir_path: &Path) -> Result<Vec<u8>> {
        use std::io::Write;
        use zip::write::SimpleFileOptions;

        let mut buffer = Vec::new();
        {
            let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut buffer));
            let options = SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);

            let mut stack = vec![dir_path.to_path_buf()];
            while let Some(current_dir) = stack.pop() {
                let mut entries = tokio::fs::read_dir(&current_dir).await?;
                while let Some(entry) = entries.next_entry().await? {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    if file_name.starts_with('.') {
                        continue;
                    }
                    let path = entry.path();
                    let rel_path = path
                        .strip_prefix(dir_path)
                        .map_err(|e| AppError::Internal(e.to_string()))?;
                    let rel_str = rel_path.to_string_lossy().to_string();

                    if path.is_dir() {
                        zip.add_directory(&rel_str, options)
                            .map_err(|e| AppError::Internal(e.to_string()))?;
                        stack.push(path);
                    } else if path.is_file() {
                        zip.start_file(&rel_str, options)
                            .map_err(|e| AppError::Internal(e.to_string()))?;
                        let data = tokio::fs::read(&path).await?;
                        zip.write_all(&data)
                            .map_err(|e| AppError::Internal(e.to_string()))?;
                    }
                }
            }
            zip.finish().map_err(|e| AppError::Internal(e.to_string()))?;
        }
        Ok(buffer)
    }

    pub async fn create_zip_archive_items(items: &[(String, PathBuf)]) -> Result<Vec<u8>> {
        use std::io::Write;
        use zip::write::SimpleFileOptions;

        let mut buffer = Vec::new();
        {
            let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut buffer));
            let options = SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);

            for (archive_name, abs_path) in items {
                if abs_path.is_file() {
                    zip.start_file(archive_name, options)
                        .map_err(|e| AppError::Internal(e.to_string()))?;
                    let data = tokio::fs::read(abs_path).await?;
                    zip.write_all(&data)
                        .map_err(|e| AppError::Internal(e.to_string()))?;
                } else if abs_path.is_dir() {
                    zip.add_directory(archive_name, options)
                        .map_err(|e| AppError::Internal(e.to_string()))?;

                    let mut stack = vec![(abs_path.clone(), archive_name.clone())];
                    while let Some((curr_dir, curr_prefix)) = stack.pop() {
                        let mut entries = tokio::fs::read_dir(&curr_dir).await?;
                        while let Some(entry) = entries.next_entry().await? {
                            let file_name = entry.file_name().to_string_lossy().to_string();
                            if file_name.starts_with('.') {
                                continue;
                            }
                            let child_path = entry.path();
                            let child_rel = format!("{}/{}", curr_prefix.trim_end_matches('/'), file_name);

                            if child_path.is_dir() {
                                zip.add_directory(&child_rel, options)
                                    .map_err(|e| AppError::Internal(e.to_string()))?;
                                stack.push((child_path, child_rel));
                            } else if child_path.is_file() {
                                zip.start_file(&child_rel, options)
                                    .map_err(|e| AppError::Internal(e.to_string()))?;
                                let data = tokio::fs::read(&child_path).await?;
                                zip.write_all(&data)
                                    .map_err(|e| AppError::Internal(e.to_string()))?;
                            }
                        }
                    }
                }
            }
            zip.finish().map_err(|e| AppError::Internal(e.to_string()))?;
        }
        Ok(buffer)
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

fn parse_size_str(s: &str) -> Option<u64> {
    let s = s.trim().to_lowercase();
    let (num_str, multiplier) = if s.ends_with("gb") || s.ends_with('g') {
        (s.trim_end_matches("gb").trim_end_matches('g'), 1024 * 1024 * 1024u64)
    } else if s.ends_with("mb") || s.ends_with('m') {
        (s.trim_end_matches("mb").trim_end_matches('m'), 1024 * 1024u64)
    } else if s.ends_with("kb") || s.ends_with('k') {
        (s.trim_end_matches("kb").trim_end_matches('k'), 1024u64)
    } else if s.ends_with('b') {
        (s.trim_end_matches('b'), 1u64)
    } else {
        (s.as_str(), 1u64)
    };
    num_str.parse::<f64>().ok().map(|n| (n * multiplier as f64) as u64)
}
