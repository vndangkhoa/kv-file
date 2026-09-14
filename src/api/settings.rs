use crate::api::auth::extract_token;
use crate::error::{AppError, Result};
use crate::state::AppState;
use axum::{
    extract::State,
    http::HeaderMap,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::collections::HashMap;

pub async fn get_settings(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<HashMap<String, String>>> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let _user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    let settings = state.db.get_all_settings().await?;
    Ok(Json(settings))
}

pub async fn update_settings(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(updates): Json<HashMap<String, String>>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    if user.role != "admin" {
        return Err(AppError::Forbidden(
            "Only administrators can update system settings".to_string(),
        ));
    }

    for (k, v) in updates {
        state.db.set_setting(&k, &v).await?;
    }

    Ok(Json(json!({ "success": true, "message": "Settings saved" })).into_response())
}
