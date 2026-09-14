use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Video,
    Image,
    Audio,
    Pdf,
    Text,
    Code,
    Archive,
    Doc,
    Spreadsheet,
    Presentation,
    Other,
}

impl MediaType {
    pub fn from_extension(ext: &str) -> Self {
        match ext.to_lowercase().as_str() {
            "mp4" | "mkv" | "mov" | "webm" | "avi" | "flv" | "wmv" | "m4v" | "3gp" | "mts" | "m2ts" | "rmvb" => {
                MediaType::Video
            }
            "jpg" | "jpeg" | "png" | "gif" | "webp" | "svg" | "bmp" | "heic" | "heif" | "ico"
            | "avif" | "tiff" | "tif" | "raw" | "cr2" | "nef" => MediaType::Image,
            "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "wma" | "opus" | "alac" | "aiff"
            | "mid" | "midi" => MediaType::Audio,
            "pdf" => MediaType::Pdf,
            "doc" | "docx" | "dot" | "dotx" | "odt" | "rtf" | "pages" => MediaType::Doc,
            "xls" | "xlsx" | "xlt" | "xltx" | "ods" | "numbers" => MediaType::Spreadsheet,
            "ppt" | "pptx" | "pot" | "potx" | "odp" | "keynote" => MediaType::Presentation,
            "txt" | "md" | "markdown" | "log" | "csv" => MediaType::Text,
            "rs" | "ts" | "tsx" | "js" | "jsx" | "json" | "yaml" | "yml" | "toml" | "html" | "css"
            | "scss" | "go" | "py" | "c" | "cpp" | "h" | "sh" | "bash" | "sql" | "xml" | "env"
            | "swift" | "kt" | "kts" | "dart" | "vue" | "svelte" | "lua" | "zig" | "ini" | "conf" => MediaType::Code,
            "zip" | "tar" | "gz" | "bz2" | "xz" | "7z" | "rar" | "apk" | "aab" | "ipa" | "iso"
            | "dmg" | "pkg" | "deb" | "rpm" => MediaType::Archive,
            _ => MediaType::Other,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub root_name: String,
    pub is_dir: bool,
    pub size: u64,
    pub human_size: String,
    pub mod_time: DateTime<Utc>,
    pub extension: String,
    pub media_type: MediaType,
    pub mime_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub item_count: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BreadcrumbItem {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectoryListing {
    pub root_name: String,
    pub current_path: String,
    pub breadcrumbs: Vec<BreadcrumbItem>,
    pub items: Vec<FileItem>,
    pub total_items: usize,
    pub total_folders: usize,
    pub total_files: usize,
    pub total_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeNode {
    pub name: String,
    pub path: String,
    pub root_name: String,
    pub has_children: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<TreeNode>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShareItem {
    pub id: String,
    pub token: String,
    pub root_name: String,
    pub path: String,
    pub is_dir: bool,
    pub has_password: bool,
    pub expires_at: Option<String>,
    pub view_count: i64,
    pub allow_download: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrashItem {
    pub id: String,
    pub root_name: String,
    pub original_path: String,
    pub trash_name: String,
    pub size: u64,
    pub human_size: String,
    pub is_dir: bool,
    pub deleted_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FsEvent {
    pub event_type: String, // "created", "modified", "deleted", "renamed"
    pub root_name: String,
    pub path: String,
    pub is_dir: bool,
}

pub fn format_human_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;
    const TB: u64 = GB * 1024;

    if bytes >= TB {
        format!("{:.2} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}
