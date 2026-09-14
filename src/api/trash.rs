use crate::error::Result;
use crate::fs::trash::TrashManager;
use crate::models::TrashItem;
use crate::state::AppState;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize)]
pub struct TrashActionRequest {
    pub id: String,
}

pub async fn list_trash(State(state): State<AppState>) -> Result<Json<Vec<TrashItem>>> {
    let items = state.db.list_trash().await?;
    Ok(Json(items))
}

pub async fn restore_trash(
    State(state): State<AppState>,
    Json(req): Json<TrashActionRequest>,
) -> Result<Response> {
    TrashManager::restore(&state.roots, &state.db, &req.id).await?;
    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Item restored" })),
    )
        .into_response())
}

pub async fn purge_trash(
    State(state): State<AppState>,
    Query(req): Query<TrashActionRequest>,
) -> Result<Response> {
    TrashManager::purge(&state.roots, &state.db, &req.id).await?;
    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Item purged" })),
    )
        .into_response())
}

pub async fn empty_trash(State(state): State<AppState>) -> Result<Response> {
    TrashManager::empty_trash(&state.roots, &state.db).await?;
    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Trash emptied" })),
    )
        .into_response())
}
