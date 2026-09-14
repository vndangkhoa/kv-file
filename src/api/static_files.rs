use axum::{
    body::Body,
    http::{header, StatusCode, Uri},
    response::IntoResponse,
};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "web/dist/"]
struct Assets;

pub async fn static_handler(uri: Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');

    // Check if the requested file exists in embedded assets
    let target_path = match path {
        "landing" => "landing.html",
        "docs" | "docs/" => "docs/index.html",
        _ => path,
    };

    if let Some(content) = Assets::get(target_path) {
        let mime = mime_guess::from_path(target_path).first_or_octet_stream();
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, mime.as_ref())],
            Body::from(content.data),
        )
            .into_response();
    }

    // Directory index fallback (e.g. /docs/docs/api -> /docs/docs/api/index.html)
    let dir_index = format!("{}/index.html", target_path.trim_end_matches('/'));
    if let Some(content) = Assets::get(&dir_index) {
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
            Body::from(content.data),
        )
            .into_response();
    }

    // SPA fallback: Return index.html for client-side routing
    if let Some(index) = Assets::get("index.html") {
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
            Body::from(index.data),
        )
            .into_response();
    }

    // If web/dist is not built yet (in early dev)
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
        Body::from(
            "<!DOCTYPE html><html><head><title>KV Files</title></head><body><h1>KV Files Backend is Running</h1><p>Run <code>cd web && npm run build</code> to compile the frontend assets.</p></body></html>",
        ),
    )
        .into_response()
}
