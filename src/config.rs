use clap::Parser;
use std::path::PathBuf;

#[derive(Parser, Debug, Clone)]
#[command(name = "ola", author = "Khoa Vo", version = "2.0.0", about = "Modern Self-Hosted File Manager")]
pub struct Config {
    #[arg(short = 'H', long, env = "OLA_HOST", default_value = "0.0.0.0")]
    pub host: String,

    #[arg(short, long, env = "OLA_PORT", default_value_t = 8866)]
    pub port: u16,

    #[arg(long, env = "OLA_DATA_DIR", default_value = "./data")]
    pub data_dir: PathBuf,

    #[arg(long, env = "OLA_STORAGE_ROOTS", value_delimiter = ':', default_value = "./storage")]
    pub storage_roots: Vec<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct StorageRootInfo {
    pub name: String,
    pub path: PathBuf,
    pub total_bytes: u64,
    pub free_bytes: u64,
    pub used_bytes: u64,
}

impl Config {
    pub fn parse_roots(&self) -> Vec<(String, PathBuf)> {
        let mut roots = Vec::new();
        for r in &self.storage_roots {
            let path = PathBuf::from(r);
            let name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("storage")
                .to_string();
            roots.push((name, path));
        }
        if roots.is_empty() {
            roots.push(("storage".to_string(), PathBuf::from("./storage")));
        }
        roots
    }
}
