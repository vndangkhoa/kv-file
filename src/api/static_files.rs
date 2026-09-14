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
    if let Some(content) = Assets::get(path) {
        let mime = mime_guess::from_path(path).first_or_octet_stream();
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, mime.as_ref())],
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
            "<!DOCTYPE html><html><head><title>Ola File Manager</title></head><body><h1>Ola Backend is Running</h1><p>Run <code>cd web && npm run build</code> to compile the frontend assets.</p></body></html>",
        ),
    )
        .into_response()
}
