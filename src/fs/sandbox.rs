use crate::error::{AppError, Result};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Clone)]
pub struct RootManager {
    roots: HashMap<String, PathBuf>,
}

impl RootManager {
    pub fn new(roots_list: Vec<(String, PathBuf)>) -> Result<Self> {
        let mut roots = HashMap::new();
        for (name, path) in roots_list {
            // Ensure directory exists or create it
            if !path.exists() {
                let _ = std::fs::create_dir_all(&path);
            }
            let canonical = dunce::canonicalize(&path)
                .map_err(|e| AppError::Internal(format!("Cannot resolve root '{}' ({}): {}", name, path.display(), e)))?;
            roots.insert(name, canonical);
        }
        Ok(Self { roots })
    }

    pub fn get_roots(&self) -> &HashMap<String, PathBuf> {
        &self.roots
    }

    pub fn get_root(&self, name: &str) -> Option<&PathBuf> {
        self.roots.get(name)
    }

    pub fn get_first_root_name(&self) -> String {
        self.roots
            .keys()
            .next()
            .cloned()
            .unwrap_or_else(|| "storage".to_string())
    }

    /// Safely resolve a client-supplied relative path against a named storage root.
    /// Traversal sequences like `..`, `/`, `\` are strictly sandboxed.
    pub fn resolve_safe(&self, root_name: &str, relative_path: &str) -> Result<PathBuf> {
        let root_dir = self
            .roots
            .get(root_name)
            .ok_or_else(|| AppError::NotFound(format!("Storage root '{}' not found", root_name)))?;

        // Sanitize leading slashes and backslashes
        let sanitized = relative_path.trim_start_matches(['/', '\\']);
        let candidate = root_dir.join(sanitized);

        // If candidate already exists, canonicalize and verify prefix
        if candidate.exists() {
            let canonical = dunce::canonicalize(&candidate)
                .map_err(|e| AppError::NotFound(format!("Failed to resolve path: {}", e)))?;

            if canonical.starts_with(root_dir) {
                Ok(canonical)
            } else {
                Err(AppError::Forbidden("Path traversal detected".to_string()))
            }
        } else {
            // For new files/folders that don't exist yet, verify parent directory
            let parent = candidate.parent().unwrap_or(root_dir);
            if parent.exists() {
                let canonical_parent = dunce::canonicalize(parent)
                    .map_err(|e| AppError::NotFound(format!("Parent directory not found: {}", e)))?;

                if canonical_parent.starts_with(root_dir) {
                    Ok(candidate)
                } else {
                    Err(AppError::Forbidden("Path traversal detected".to_string()))
                }
            } else {
                // If nested parents don't exist, check normalized path
                let mut components = Vec::new();
                for c in Path::new(sanitized).components() {
                    match c {
                        std::path::Component::Normal(p) => components.push(p),
                        std::path::Component::ParentDir => {
                            if components.pop().is_none() {
                                return Err(AppError::Forbidden("Path traversal detected".to_string()));
                            }
                        }
                        _ => {}
                    }
                }
                let mut resolved = root_dir.clone();
                for c in components {
                    resolved.push(c);
                }
                Ok(resolved)
            }
        }
    }
}
