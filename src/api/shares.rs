use crate::error::{AppError, Result};
use crate::fs::operations::FileOperations;
use crate::models::{format_human_size, MediaType, ShareItem};
use crate::state::AppState;
use argon2::password_hash::{PasswordHash, PasswordVerifier, SaltString};
use argon2::{Argon2, PasswordHasher};
use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tokio_util::io::ReaderStream;

use crate::models::PublicShareBundleItem;

#[derive(Debug, Deserialize)]
pub struct PublicShareQuery {
    pub password: Option<String>,
    pub inline: Option<bool>,
    pub item: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PublicShareInfo {
    pub id: String,
    pub token: String,
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_bundle: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bundle_items: Option<Vec<PublicShareBundleItem>>,
    pub size: u64,
    pub human_size: String,
    pub mime_type: String,
    pub media_type: MediaType,
    pub extension: Option<String>,
    pub has_password: bool,
    pub requires_password: bool,
    pub allow_download: bool,
    pub expires_at: Option<String>,
    pub view_count: i64,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateShareRequest {
    pub root: Option<String>,
    pub path: Option<String>,
    pub paths: Option<Vec<String>>,
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

    let (path, is_dir, items_json) = if let Some(ref paths) = req.paths {
        if paths.len() > 1 {
            let first_path = paths.first().cloned().unwrap_or_default();
            let parent_dir = if let Some(slash_idx) = first_path.rfind('/') {
                first_path[..slash_idx].to_string()
            } else {
                String::new()
            };
            let json_str = serde_json::to_string(paths).map_err(|e| AppError::Internal(e.to_string()))?;
            (parent_dir, true, Some(json_str))
        } else if let Some(single) = paths.first() {
            let abs = state.roots.resolve_safe(&root_name, single)?;
            (single.clone(), abs.is_dir(), None)
        } else {
            return Err(AppError::BadRequest("No paths provided for share".to_string()));
        }
    } else if let Some(ref single_path) = req.path {
        let abs = state.roots.resolve_safe(&root_name, single_path)?;
        let is_dir = req.is_dir.unwrap_or_else(|| abs.is_dir());
        (single_path.clone(), is_dir, None)
    } else {
        return Err(AppError::BadRequest("No path provided for share".to_string()));
    };

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
            &path,
            is_dir,
            password_hash,
            req.expires_at,
            req.allow_download.unwrap_or(true),
            items_json,
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
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(token): Path<String>,
    Query(params): Query<PublicShareQuery>,
) -> Result<Response> {
    // If request comes from a web browser directly (Accept: text/html), redirect to frontend /share/{token}
    if let Some(accept) = headers.get(header::ACCEPT) {
        if let Ok(accept_str) = accept.to_str() {
            if accept_str.contains("text/html") {
                return Ok(axum::response::Redirect::temporary(&format!("/share/{}", token)).into_response());
            }
        }
    }

    let (item, password_hash) = state
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

    // Check password if set
    let has_password = password_hash.is_some();
    let mut requires_password = false;

    if let Some(ref hash) = password_hash {
        let pw = params.password.as_deref().unwrap_or("");
        let parsed = PasswordHash::new(hash)
            .map_err(|e| AppError::Internal(e.to_string()))?;
        if Argon2::default().verify_password(pw.as_bytes(), &parsed).is_err() {
            requires_password = true;
        }
    }

    if requires_password {
        let name = if item.items_json.is_some() {
            "Shared Bundle".to_string()
        } else {
            item.path.split('/').last().unwrap_or("file").to_string()
        };
        return Ok(Json(json!({
            "id": item.id,
            "token": item.token,
            "name": name,
            "is_dir": item.is_dir,
            "is_bundle": item.items_json.is_some(),
            "has_password": true,
            "requires_password": true,
            "allow_download": item.allow_download,
            "expires_at": item.expires_at,
            "created_at": item.created_at,
        })).into_response());
    }

    state.db.increment_share_view(&token).await?;

    if let Some(ref json_str) = item.items_json {
        let paths: Vec<String> = serde_json::from_str(json_str).unwrap_or_default();
        let mut bundle_items = Vec::new();
        let mut total_size: u64 = 0;

        for rel in &paths {
            if let Ok(abs) = state.roots.resolve_safe(&item.root_name, rel) {
                if abs.exists() {
                    let item_name = abs.file_name().and_then(|n| n.to_str()).unwrap_or("item").to_string();
                    let is_dir = abs.is_dir();
                    let size = if is_dir {
                        0
                    } else {
                        tokio::fs::metadata(&abs).await.map(|m| m.len()).unwrap_or(0)
                    };
                    total_size += size;
                    let human_size = format_human_size(size);
                    let mime = mime_guess::from_path(&abs).first_or_octet_stream().to_string();
                    let ext = abs.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase());
                    let media_type = if is_dir {
                        MediaType::Other
                    } else {
                        MediaType::from_extension(ext.as_deref().unwrap_or(""))
                    };

                    bundle_items.push(PublicShareBundleItem {
                        name: item_name,
                        path: rel.clone(),
                        is_dir,
                        size,
                        human_size,
                        mime_type: mime,
                        media_type,
                        extension: ext,
                    });
                }
            }
        }

        let name = format!("Bundle ({} items)", bundle_items.len());
        let info = PublicShareInfo {
            id: item.id,
            token: item.token,
            name,
            path: item.path,
            is_dir: true,
            is_bundle: true,
            bundle_items: Some(bundle_items),
            size: total_size,
            human_size: format_human_size(total_size),
            mime_type: "application/zip".to_string(),
            media_type: MediaType::Archive,
            extension: Some("zip".to_string()),
            has_password,
            requires_password: false,
            allow_download: item.allow_download,
            expires_at: item.expires_at,
            view_count: item.view_count + 1,
            created_at: item.created_at,
        };

        return Ok(Json(info).into_response());
    }

    let abs_path = state.roots.resolve_safe(&item.root_name, &item.path)?;
    let (name, size, human_size, mime_type, media_type, extension) = if abs_path.exists() {
        let name = abs_path.file_name().and_then(|n| n.to_str()).unwrap_or("file").to_string();
        let size = if abs_path.is_dir() {
            0
        } else {
            tokio::fs::metadata(&abs_path).await.map(|m| m.len()).unwrap_or(0)
        };
        let human_size = format_human_size(size);
        let mime = mime_guess::from_path(&abs_path).first_or_octet_stream().to_string();
        let ext = abs_path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase());
        let media_type = if abs_path.is_dir() {
            MediaType::Other
        } else {
            MediaType::from_extension(ext.as_deref().unwrap_or(""))
        };
        (name, size, human_size, mime, media_type, ext)
    } else {
        let name = item.path.split('/').last().unwrap_or("file").to_string();
        (name, 0, "0 B".to_string(), "application/octet-stream".to_string(), MediaType::Other, None)
    };

    let info = PublicShareInfo {
        id: item.id,
        token: item.token,
        name,
        path: item.path,
        is_dir: item.is_dir,
        is_bundle: false,
        bundle_items: None,
        size,
        human_size,
        mime_type,
        media_type,
        extension,
        has_password,
        requires_password: false,
        allow_download: item.allow_download,
        expires_at: item.expires_at,
        view_count: item.view_count + 1,
        created_at: item.created_at,
    };

    Ok(Json(info).into_response())
}

pub async fn download_public_share(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(token): Path<String>,
    Query(params): Query<PublicShareQuery>,
) -> Result<Response> {
    download_public_share_inner(headers, state, token, params, false).await
}

pub async fn raw_public_share(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(token): Path<String>,
    Query(params): Query<PublicShareQuery>,
) -> Result<Response> {
    download_public_share_inner(headers, state, token, params, true).await
}

async fn download_public_share_inner(
    _headers: HeaderMap,
    state: AppState,
    token: String,
    params: PublicShareQuery,
    is_inline: bool,
) -> Result<Response> {
    let (item, password_hash) = state
        .db
        .get_share_by_token(&token)
        .await?
        .ok_or_else(|| AppError::NotFound("Shared link not found".to_string()))?;

    // Check expiration
    if let Some(ref exp_str) = item.expires_at {
        if let Ok(exp) = chrono::DateTime::parse_from_rfc3339(exp_str) {
            if chrono::Utc::now() > exp {
                return Err(AppError::NotFound("Shared link has expired".to_string()));
            }
        }
    }

    // Check password if set
    if let Some(ref hash) = password_hash {
        let pw = params.password.as_deref().unwrap_or("");
        let parsed = PasswordHash::new(hash)
            .map_err(|e| AppError::Internal(e.to_string()))?;
        if Argon2::default().verify_password(pw.as_bytes(), &parsed).is_err() {
            return Err(AppError::Unauthorized("Password incorrect for this shared file".to_string()));
        }
    }

    if !is_inline && !item.allow_download {
        return Err(AppError::Forbidden("Downloading is disabled for this link".to_string()));
    }

    // Bundle handling
    if let Some(ref json_str) = item.items_json {
        let paths: Vec<String> = serde_json::from_str(json_str).unwrap_or_default();

        // If a specific sub-item within bundle is requested
        if let Some(ref sub_path) = params.item {
            let matches = paths.iter().find(|p| {
                *p == sub_path || p.trim_start_matches('/') == sub_path.trim_start_matches('/')
            });
            let valid_rel = matches.ok_or_else(|| AppError::Forbidden("Item not part of this shared bundle".to_string()))?;
            let abs_path = state.roots.resolve_safe(&item.root_name, valid_rel)?;
            if !abs_path.exists() {
                return Err(AppError::NotFound("Shared item not found on disk".to_string()));
            }

            if abs_path.is_dir() {
                let zip_data = FileOperations::create_zip_archive(&abs_path).await?;
                let folder_name = abs_path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("folder");
                let zip_filename = format!("{}.zip", folder_name);
                let disp = format!("attachment; filename=\"{}\"", zip_filename);

                return Ok((
                    StatusCode::OK,
                    [
                        (header::CONTENT_TYPE, "application/zip".to_string()),
                        (header::CONTENT_DISPOSITION, disp),
                        (header::CONTENT_LENGTH, zip_data.len().to_string()),
                    ],
                    Body::from(zip_data),
                )
                    .into_response());
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

            let disp = if is_inline || params.inline.unwrap_or(false) {
                format!("inline; filename=\"{}\"", file_name)
            } else {
                format!("attachment; filename=\"{}\"", file_name)
            };

            return Ok((
                StatusCode::OK,
                [
                    (header::CONTENT_TYPE, mime_type),
                    (header::CONTENT_LENGTH, metadata.len().to_string()),
                    (header::CONTENT_DISPOSITION, disp),
                ],
                body,
            )
                .into_response());
        }

        // Entire bundle download as zip
        let mut items_to_zip: Vec<(String, std::path::PathBuf)> = Vec::new();
        for rel in &paths {
            if let Ok(abs) = state.roots.resolve_safe(&item.root_name, rel) {
                if abs.exists() {
                    let name = abs.file_name().and_then(|n| n.to_str()).unwrap_or("item").to_string();
                    items_to_zip.push((name, abs));
                }
            }
        }

        let zip_data = FileOperations::create_zip_archive_items(&items_to_zip).await?;
        let zip_filename = "shared_bundle.zip";
        let disp = format!("attachment; filename=\"{}\"", zip_filename);

        return Ok((
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, "application/zip".to_string()),
                (header::CONTENT_DISPOSITION, disp),
                (header::CONTENT_LENGTH, zip_data.len().to_string()),
            ],
            Body::from(zip_data),
        )
            .into_response());
    }

    let abs_path = state.roots.resolve_safe(&item.root_name, &item.path)?;
    if !abs_path.exists() {
        return Err(AppError::NotFound("Shared file not found on disk".to_string()));
    }

    if abs_path.is_dir() {
        let zip_data = FileOperations::create_zip_archive(&abs_path).await?;
        let folder_name = abs_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("archive");
        let zip_filename = format!("{}.zip", folder_name);
        let disp = format!("attachment; filename=\"{}\"", zip_filename);

        return Ok((
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, "application/zip".to_string()),
                (header::CONTENT_DISPOSITION, disp),
                (header::CONTENT_LENGTH, zip_data.len().to_string()),
            ],
            Body::from(zip_data),
        )
            .into_response());
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

    let disp = if is_inline || params.inline.unwrap_or(false) {
        format!("inline; filename=\"{}\"", file_name)
    } else {
        format!("attachment; filename=\"{}\"", file_name)
    };

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
