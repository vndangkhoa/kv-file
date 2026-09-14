use crate::fs::sandbox::RootManager;
use crate::models::FsEvent;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tokio::sync::broadcast;
use tracing::{error, info};

pub struct FileWatcher {
    _watcher: RecommendedWatcher,
}

impl FileWatcher {
    pub fn start(
        roots: &RootManager,
        tx: broadcast::Sender<FsEvent>,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let roots_clone = roots.clone();
        let tx_clone = tx.clone();

        let mut watcher = RecommendedWatcher::new(
            move |res: Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    Self::handle_event(&roots_clone, &tx_clone, event);
                }
            },
            Config::default(),
        )?;

        for (name, path) in roots.get_roots() {
            // Avoid inotify watch storms, recursive /proc loops, and OS watch exhaustion
            // by skipping inotify watch on full system root mounts.
            if name == "root" || name == "rootfs" || path == std::path::Path::new("/") || path == std::path::Path::new("/root") {
                info!("Skipping recursive inotify watch on system root '{}' ({})", name, path.display());
                continue;
            }

            if path.exists() {
                if let Err(e) = watcher.watch(path, RecursiveMode::Recursive) {
                    error!("Failed to watch storage root '{}': {}", name, e);
                } else {
                    info!("Watching storage root '{}' at {}", name, path.display());
                }
            }
        }

        Ok(Self { _watcher: watcher })
    }

    fn handle_event(
        roots: &RootManager,
        tx: &broadcast::Sender<FsEvent>,
        event: Event,
    ) {
        let event_type = match event.kind {
            EventKind::Create(_) => "created",
            EventKind::Modify(_) => "modified",
            EventKind::Remove(_) => "deleted",
            _ => return,
        };

        for path in event.paths {
            // Ignore hidden files, temporary files, and internal directories
            let path_str = path.to_string_lossy();
            if path_str.contains("/.")
                || path_str.contains("/proc/")
                || path_str.contains("/sys/")
                || path_str.contains("/dev/")
                || path_str.contains("/run/")
                || path_str.ends_with("-wal")
                || path_str.ends_with("-shm")
                || path_str.ends_with(".journal")
                || path_str.ends_with(".tmp")
                || path_str.ends_with(".swp")
                || path_str.ends_with(".lock")
                || path_str.ends_with(".pid")
                || path_str.contains("/beszel_data/")
            {
                continue;
            }

            for (root_name, root_path) in roots.get_roots() {
                if let Ok(rel) = path.strip_prefix(root_path) {
                    let rel_str = rel.to_string_lossy().to_string();
                    let is_dir = path.is_dir();

                    let fs_event = FsEvent {
                        event_type: event_type.to_string(),
                        root_name: root_name.clone(),
                        path: rel_str,
                        is_dir,
                    };

                    let _ = tx.send(fs_event);
                    break;
                }
            }
        }
    }
}
