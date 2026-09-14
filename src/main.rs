mod api;
mod config;
mod db;
mod error;
mod fs;
mod models;
mod state;
mod watcher;

use clap::Parser;
use config::Config;
use db::Database;
use fs::sandbox::RootManager;
use state::AppState;
use std::net::SocketAddr;
use tokio::sync::broadcast;
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use watcher::FileWatcher;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ola=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::parse();
    info!("Starting Ola File Manager v2.0.0");

    // Ensure data directory exists
    std::fs::create_dir_all(&config.data_dir)?;
    let db_path = config.data_dir.join("ola.db");
    info!("SQLite database path: {}", db_path.display());

    let database = Database::new(&db_path)?;

    // Parse and initialize storage roots
    let roots_config = config.parse_roots();
    let root_manager = RootManager::new(roots_config)?;

    for (name, path) in root_manager.get_roots() {
        info!("Mounted storage root '{}' -> {}", name, path.display());
    }

    // Set up real-time event broadcasting channel
    let (tx, _) = broadcast::channel(100);

    // Start background inotify filesystem watcher
    let _watcher = match FileWatcher::start(&root_manager, tx.clone()) {
        Ok(w) => {
            info!("Inotify filesystem watcher started successfully");
            Some(w)
        }
        Err(e) => {
            warn!("Could not start inotify watcher: {}. Falling back without watcher.", e);
            None
        }
    };

    let state = AppState::new(database, root_manager, tx);
    let app = api::create_router(state);

    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    info!("🚀 Ola File Manager listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    info!("Ola server shut down gracefully");
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
