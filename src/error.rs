use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Database error: {0}")]
    Db(String),

    #[error("Filesystem error: {0}")]
    Io(#[from] std::io::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::NotFound(ref msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::BadRequest(ref msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Unauthorized(ref msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::Forbidden(ref msg) => (StatusCode::FORBIDDEN, msg.clone()),
            AppError::Internal(ref msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::Db(ref msg) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", msg)),
            AppError::Io(ref err) => {
                match err.kind() {
                    std::io::ErrorKind::NotFound => (StatusCode::NOT_FOUND, "File or folder not found".to_string()),
                    std::io::ErrorKind::PermissionDenied => (StatusCode::FORBIDDEN, "Permission denied".to_string()),
                    _ => (StatusCode::INTERNAL_SERVER_ERROR, format!("I/O error: {}", err)),
                }
            }
        };

        let body = Json(json!({
            "success": false,
            "error": error_message,
        }));

        (status, body).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
