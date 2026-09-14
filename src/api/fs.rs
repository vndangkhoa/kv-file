use crate::config::StorageRootInfo;
use crate::error::{AppError, Result};
use crate::fs::operations::FileOperations;
use crate::fs::trash::TrashManager;
use crate::models::{DirectoryListing, FileItem, TreeNode};
use crate::state::AppState;
use axum::{
    body::Body,
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use std::io::SeekFrom;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;

#[derive(Deserialize)]
pub struct ListParams {
    pub root: Option<String>,
    pub path: Option<String>,
}

#[derive(Deserialize)]
pub struct TreeParams {
    pub root: Option<String>,
    pub path: Option<String>,
    pub depth: Option<usize>,
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub root: Option<String>,
    pub q: String,
    pub limit: Option<usize>,
}

#[derive(Deserialize)]
pub struct FolderRequest {
    pub root: Option<String>,
    pub path: String,
}

#[derive(Deserialize)]
pub struct RenameRequest {
    pub root: Option<String>,
    pub path: String,
    pub new_name: String,
}

#[derive(Deserialize)]
pub struct TransferRequest {
    pub root: Option<String>,
    pub source: String,
    pub destination: String,
}

#[derive(Deserialize)]
pub struct DeleteParams {
    pub root: Option<String>,
    pub path: String,
    pub permanent: Option<bool>,
}

#[derive(Deserialize, Clone)]
pub struct FileParams {
    pub root: Option<String>,
    pub path: String,
}

pub async fn get_roots(State(state): State<AppState>) -> Result<Json<Vec<StorageRootInfo>>> {
    let mut infos = Vec::new();
    for (name, path) in state.roots.get_roots() {
        let (total, free, used) = FileOperations::get_disk_info(path);
        infos.push(StorageRootInfo {
            name: name.clone(),
            path: path.clone(),
            total_bytes: total,
            free_bytes: free,
            used_bytes: used,
        });
    }
    infos.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(Json(infos))
}

pub async fn list_directory(
    State(state): State<AppState>,
    Query(params): Query<ListParams>,
) -> Result<Json<DirectoryListing>> {
    let root_name = params
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());
    let path = params.path.unwrap_or_default();

    let listing = FileOperations::list_directory(&state.roots, &root_name, &path).await?;
    Ok(Json(listing))
}

pub async fn get_tree(
    State(state): State<AppState>,
    Query(params): Query<TreeParams>,
) -> Result<Json<TreeNode>> {
    let root_name = params
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());
    let path = params.path.unwrap_or_default();
    let depth = params.depth.unwrap_or(2);

    let tree = FileOperations::get_tree(&state.roots, &root_name, &path, depth).await?;
    Ok(Json(tree))
}

pub async fn create_folder(
    State(state): State<AppState>,
    Json(req): Json<FolderRequest>,
) -> Result<Response> {
    let root_name = req
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    FileOperations::create_folder(&state.roots, &root_name, &req.path).await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "success": true, "message": "Folder created" })),
    )
        .into_response())
}

pub async fn rename_item(
    State(state): State<AppState>,
    Json(req): Json<RenameRequest>,
) -> Result<Response> {
    let root_name = req
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    FileOperations::rename_item(&state.roots, &root_name, &req.path, &req.new_name).await?;

    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Item renamed" })),
    )
        .into_response())
}

pub async fn copy_item(
    State(state): State<AppState>,
    Json(req): Json<TransferRequest>,
) -> Result<Response> {
    let root_name = req
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    FileOperations::copy_item(&state.roots, &root_name, &req.source, &req.destination).await?;

    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Item copied" })),
    )
        .into_response())
}

pub async fn move_item(
    State(state): State<AppState>,
    Json(req): Json<TransferRequest>,
) -> Result<Response> {
    let root_name = req
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    FileOperations::move_item(&state.roots, &root_name, &req.source, &req.destination).await?;

    Ok((
        StatusCode::OK,
        Json(json!({ "success": true, "message": "Item moved" })),
    )
        .into_response())
}

pub async fn delete_item(
    State(state): State<AppState>,
    Query(params): Query<DeleteParams>,
) -> Result<Response> {
    let root_name = params
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    if params.permanent.unwrap_or(false) {
        FileOperations::permanent_delete(&state.roots, &root_name, &params.path).await?;
        Ok((
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Item permanently deleted" })),
        )
            .into_response())
    } else {
        let trash_item =
            TrashManager::soft_delete(&state.roots, &state.db, &root_name, &params.path).await?;
        Ok((
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": "Item moved to trash",
                "trash_item": trash_item
            })),
        )
            .into_response())
    }
}

pub async fn search_items(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<FileItem>>> {
    let root_name = params
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());
    let limit = params.limit.unwrap_or(50);

    let items = FileOperations::search(&state.roots, &root_name, &params.q, limit).await?;
    Ok(Json(items))
}

pub async fn stream_file(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(params): Query<FileParams>,
) -> Result<Response> {
    let root_name = params
        .root
        .unwrap_or_else(|| state.roots.get_first_root_name());

    let abs_path = state.roots.resolve_safe(&root_name, &params.path)?;
    if !abs_path.is_file() {
        return Err(AppError::NotFound("File not found".to_string()));
    }

    let mut file = tokio::fs::File::open(&abs_path).await?;
    let metadata = file.metadata().await?;
    let file_size = metadata.len();

    let mime_type = mime_guess::from_path(&abs_path)
        .first_or_octet_stream()
        .to_string();

    // Check for HTTP Range header (essential for streaming video/audio seeking)
    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some(range) = parse_range(range_str, file_size) {
                let (start, end) = range;
                let length = end - start + 1;

                file.seek(SeekFrom::Start(start)).await?;
                let stream = ReaderStream::new(file.take(length));
                let body = Body::from_stream(stream);

                let content_range = format!("bytes {}-{}/{}", start, end, file_size);

                return Ok((
                    StatusCode::PARTIAL_CONTENT,
                    [
                        (header::CONTENT_TYPE, mime_type),
                        (header::ACCEPT_RANGES, "bytes".to_string()),
                        (header::CONTENT_RANGE, content_range),
                        (header::CONTENT_LENGTH, length.to_string()),
                    ],
                    body,
                )
                    .into_response());
            }
        }
    }

    // Full file stream
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Ok((
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, mime_type),
            (header::ACCEPT_RANGES, "bytes".to_string()),
            (header::CONTENT_LENGTH, file_size.to_string()),
        ],
        body,
    )
        .into_response())
}

pub async fn download_file(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(params): Query<FileParams>,
) -> Result<Response> {
    let root_name = params
        .root
        .clone()
        .unwrap_or_else(|| state.roots.get_first_root_name());

    let abs_path = state.roots.resolve_safe(&root_name, &params.path)?;

    // If target is a directory, automatically package and stream as .zip on the fly!
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

    let mut resp = stream_file(headers, State(state), Query(params.clone())).await?;
    let filename = std::path::Path::new(&params.path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("download");

    let disp = format!("attachment; filename=\"{}\"", filename);
    resp.headers_mut().insert(
        header::CONTENT_DISPOSITION,
        disp.parse().unwrap_or_else(|_| "attachment".parse().unwrap()),
    );

    Ok(resp)
}

fn parse_range(range_str: &str, file_size: u64) -> Option<(u64, u64)> {
    if !range_str.starts_with("bytes=") {
        return None;
    }
    let range_str = &range_str[6..];
    let parts: Vec<&str> = range_str.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<u64>().ok()?;
    let end = if parts[1].is_empty() {
        file_size.saturating_sub(1)
    } else {
        parts[1].parse::<u64>().ok()?.min(file_size.saturating_sub(1))
    };

    if start <= end && start < file_size {
        Some((start, end))
    } else {
        None
    }
}
