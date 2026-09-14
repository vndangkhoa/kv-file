use crate::error::{AppError, Result};
use crate::models::User;
use crate::state::AppState;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize)]
pub struct SetupStatusResponse {
    pub is_initialized: bool,
}

#[derive(Deserialize)]
pub struct SetupRequest {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub success: bool,
    pub token: String,
    pub user: User,
}

pub async fn setup_status(State(state): State<AppState>) -> Result<Json<SetupStatusResponse>> {
    let has_users = state.db.has_users().await?;
    Ok(Json(SetupStatusResponse {
        is_initialized: has_users,
    }))
}

pub async fn initial_setup(
    State(state): State<AppState>,
    Json(req): Json<SetupRequest>,
) -> Result<Response> {
    if state.db.has_users().await? {
        return Err(AppError::BadRequest("System is already initialized".to_string()));
    }

    if req.username.trim().is_empty() || req.password.len() < 6 {
        return Err(AppError::BadRequest(
            "Username must not be empty and password must be at least 6 characters".to_string(),
        ));
    }

    let salt_bytes = uuid::Uuid::new_v4();
    let salt = SaltString::encode_b64(salt_bytes.as_bytes())
        .map_err(|e| AppError::Internal(e.to_string()))?;
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(e.to_string()))?
        .to_string();

    let user = state
        .db
        .create_user(&req.username, &password_hash, "admin")
        .await?;

    let token = state.create_session(user.clone()).await;

    let cookie = format!(
        "ola_session={}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000",
        token
    );

    let mut headers = HeaderMap::new();
    headers.insert(header::SET_COOKIE, cookie.parse().unwrap());

    Ok((
        StatusCode::CREATED,
        headers,
        Json(AuthResponse {
            success: true,
            token,
            user,
        }),
    )
        .into_response())
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Response> {
    let (user, hash) = state
        .db
        .get_user_by_username(&req.username)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid username or password".to_string()))?;

    let parsed_hash = PasswordHash::new(&hash)
        .map_err(|e| AppError::Internal(format!("Corrupt password hash: {}", e)))?;

    Argon2::default()
        .verify_password(req.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::Unauthorized("Invalid username or password".to_string()))?;

    let token = state.create_session(user.clone()).await;

    let cookie = format!(
        "ola_session={}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000",
        token
    );

    let mut headers = HeaderMap::new();
    headers.insert(header::SET_COOKIE, cookie.parse().unwrap());

    Ok((
        StatusCode::OK,
        headers,
        Json(AuthResponse {
            success: true,
            token,
            user,
        }),
    )
        .into_response())
}

pub async fn get_me(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<User>> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    Ok(Json(user))
}

pub async fn logout(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Response> {
    if let Some(token) = extract_token(&headers) {
        state.remove_session(&token).await;
    }

    let cookie = "ola_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
    let mut headers = HeaderMap::new();
    headers.insert(header::SET_COOKIE, cookie.parse().unwrap());

    Ok((
        StatusCode::OK,
        headers,
        Json(json!({ "success": true, "message": "Logged out" })),
    )
        .into_response())
}

pub fn extract_token(headers: &HeaderMap) -> Option<String> {
    // 1. Check Authorization: Bearer <token>
    if let Some(auth) = headers.get(header::AUTHORIZATION) {
        if let Ok(val) = auth.to_str() {
            if let Some(token) = val.strip_prefix("Bearer ") {
                return Some(token.trim().to_string());
            }
        }
    }

    // 2. Check Cookie: ola_session=<token>
    if let Some(cookie) = headers.get(header::COOKIE) {
        if let Ok(val) = cookie.to_str() {
            for part in val.split(';') {
                let part = part.trim();
                if let Some(token) = part.strip_prefix("ola_session=") {
                    return Some(token.to_string());
                }
            }
        }
    }

    None
}
