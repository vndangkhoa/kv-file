use crate::error::{AppError, Result};
use crate::models::ShareItem;
use crate::state::AppState;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHasher};
use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use tokio_util::io::ReaderStream;

#[derive(Deserialize)]
pub struct CreateShareRequest {
    pub root: Option<String>,
    pub path: String,
    pub is_dir: Option<bool>,
    pub password: Option<String>,
    pub expires_at: Option<String>,
    pub allow_download: Option<bool>,
}

#[derive(Deserialize)]
pub struct ShareDeleteParams {
    pub id: String,
}

pub async fn list_shares(State(state): State<AppState>) -> Result<Json<Vec<ShareItem>>> {
    let shares = state.db.list_shares().await?;
    Ok(Json(shares))
}

pub async fn create_share(
    State(state): State<AppState>,
    Json(req): Json<CreateShareRequest>,
) -> Result<Json<ShareItem>> {
    let root_name = req
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    let abs_path = state.roots.resolve_safe(&root_name, &req.path)?;
    let is_dir = req.is_dir.unwrap_or_else(|| abs_path.is_dir());

    let password_hash = if let Some(ref pw) = req.password {
        if !pw.is_empty() {
            let salt_bytes = uuid::Uuid::new_v4();
            let salt = SaltString::encode_b64(salt_bytes.as_bytes())
                .map_err(|e| AppError::Internal(e.to_string()))?;
            Some(
                Argon2::default()
                    .hash_password(pw.as_bytes(), &salt)
                    .map_err(|e| AppError::Internal(e.to_string()))?
                    .to_string(),
            )
        } else {
            None
        }
    } else {
        None
    };

    let item = state
        .db
        .create_share(
            &root_name,
            &req.path,
            is_dir,
            password_hash,
            req.expires_at,
            req.allow_download.unwrap_or(true),
        )
        .await?;

    Ok(Json(item))
}

pub async fn delete_share(
    State(state): State<AppState>,
    Query(params): Query<ShareDeleteParams>,
) -> Result<Response> {
    state.db.delete_share(&params.id).await?;
    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Share revoked" })),
    )
        .into_response())
}

pub async fn get_public_share(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<Json<ShareItem>> {
    let (item, _) = state
        .db
        .get_share_by_token(&token)
        .await?
        .ok_or_else(|| AppError::NotFound("Shared link not found or expired".to_string()))?;

    // Check expiration
    if let Some(ref exp_str) = item.expires_at {
        if let Ok(exp) = chrono::DateTime::parse_from_rfc3339(exp_str) {
            if chrono::Utc::now() > exp {
                return Err(AppError::NotFound("Shared link has expired".to_string()));
            }
        }
    }

    state.db.increment_share_view(&token).await?;
    Ok(Json(item))
}

pub async fn download_public_share(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<Response> {
    let (item, _) = state
        .db
        .get_share_by_token(&token)
        .await?
        .ok_or_else(|| AppError::NotFound("Shared link not found".to_string()))?;

    if !item.allow_download {
        return Err(AppError::Forbidden("Downloading is disabled for this link".to_string()));
    }

    let abs_path = state.roots.resolve_safe(&item.root_name, &item.path)?;
    if !abs_path.is_file() {
        return Err(AppError::NotFound("Shared file not found on disk".to_string()));
    }

    let file = tokio::fs::File::open(&abs_path).await?;
    let metadata = file.metadata().await?;
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    let mime_type = mime_guess::from_path(&abs_path)
        .first_or_octet_stream()
        .to_string();

    let file_name = abs_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("download");

    let disp = format!("attachment; filename=\"{}\"", file_name);

    Ok((
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, mime_type),
            (header::CONTENT_LENGTH, metadata.len().to_string()),
            (header::CONTENT_DISPOSITION, disp),
        ],
        body,
    )
        .into_response())
}
