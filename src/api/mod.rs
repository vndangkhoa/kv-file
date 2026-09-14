pub mod auth;
pub mod fs;
pub mod settings;
pub mod shares;
pub mod static_files;
pub mod trash;
pub mod upload;
pub mod ws;

use crate::state::AppState;
use axum::{
    routing::{delete, get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let api_router = Router::new()
        // Auth & User Management
        .route("/api/v1/auth/setup-status", get(auth::setup_status))
        .route("/api/v1/auth/setup", post(auth::initial_setup))
        .route("/api/v1/auth/login", post(auth::login))
        .route("/api/v1/auth/me", get(auth::get_me))
        .route("/api/v1/auth/logout", post(auth::logout))
        .route("/api/v1/auth/change-password", post(auth::change_password))
        .route("/api/v1/auth/2fa/setup", post(auth::setup_2fa))
        .route("/api/v1/auth/2fa/enable", post(auth::enable_2fa))
        .route("/api/v1/auth/2fa/verify", post(auth::verify_2fa_login))
        .route("/api/v1/auth/2fa/disable", post(auth::disable_2fa))
        .route("/api/v1/users", get(auth::list_users).post(auth::create_user))
        .route("/api/v1/users/{id}", delete(auth::delete_user))
        // System Settings
        .route("/api/v1/settings", get(settings::get_settings).put(settings::update_settings))
        // Filesystem
        .route("/api/v1/fs/roots", get(fs::get_roots))
        .route("/api/v1/fs/list", get(fs::list_directory))
        .route("/api/v1/fs/tree", get(fs::get_tree))
        .route("/api/v1/fs/folder", post(fs::create_folder))
        .route("/api/v1/fs/rename", post(fs::rename_item))
        .route("/api/v1/fs/copy", post(fs::copy_item))
        .route("/api/v1/fs/move", post(fs::move_item))
        .route("/api/v1/fs/item", delete(fs::delete_item))
        .route("/api/v1/fs/search", get(fs::search_items))
        .route("/api/v1/fs/raw", get(fs::stream_file))
        .route("/api/v1/fs/download", get(fs::download_file))
        .route("/api/v1/fs/upload", post(upload::upload_file))
        // Trash
        .route("/api/v1/trash/list", get(trash::list_trash))
        .route("/api/v1/trash/restore", post(trash::restore_trash))
        .route("/api/v1/trash/purge", delete(trash::purge_trash))
        .route("/api/v1/trash/empty", delete(trash::empty_trash))
        // Shares
        .route("/api/v1/shares", get(shares::list_shares).post(shares::create_share))
        .route("/api/v1/shares", delete(shares::delete_share))
        .route("/api/v1/public/share/{token}", get(shares::get_public_share))
        .route("/api/v1/public/share/{token}/download", get(shares::download_public_share))
        .route("/api/v1/public/share/{token}/raw", get(shares::raw_public_share))
        // Real-time WebSocket
        .route("/api/v1/ws", get(ws::ws_handler))
        .with_state(state);

    Router::new()
        .merge(api_router)
        .fallback(static_files::static_handler)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
}
