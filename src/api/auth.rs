#![allow(deprecated)]
use crate::error::{AppError, Result};
use crate::models::User;
use crate::state::AppState;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use totp_rs::{Algorithm, Secret, Totp};

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

#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub role: Option<String>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub requires_2fa: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pre_auth_token: Option<String>,
}

#[derive(Serialize)]
pub struct Setup2faResponse {
    pub secret: String,
    pub qr_code: String,
    pub otpauth_url: String,
    pub backup_codes: Vec<String>,
}

#[derive(Deserialize)]
pub struct Verify2faRequest {
    pub code: String,
}

#[derive(Deserialize)]
pub struct Login2faRequest {
    pub pre_auth_token: String,
    pub code: String,
}

#[derive(Deserialize)]
pub struct Disable2faRequest {
    pub password: String,
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
            token: Some(token),
            user: Some(user),
            requires_2fa: None,
            pre_auth_token: None,
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

    if user.is_totp_enabled {
        let pre_auth_token = state.create_pre_auth_session(user).await;
        return Ok((
            StatusCode::OK,
            Json(AuthResponse {
                success: true,
                token: None,
                user: None,
                requires_2fa: Some(true),
                pre_auth_token: Some(pre_auth_token),
            }),
        )
            .into_response());
    }

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
            token: Some(token),
            user: Some(user),
            requires_2fa: None,
            pre_auth_token: None,
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

pub async fn change_password(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    let (_curr_user, hash) = state
        .db
        .get_user_with_hash_by_id(&user.id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let parsed_hash = PasswordHash::new(&hash)
        .map_err(|e| AppError::Internal(format!("Corrupt password hash: {}", e)))?;

    Argon2::default()
        .verify_password(req.current_password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::BadRequest("Current password is incorrect".to_string()))?;

    if req.new_password.len() < 6 {
        return Err(AppError::BadRequest(
            "New password must be at least 6 characters long".to_string(),
        ));
    }

    let salt_bytes = uuid::Uuid::new_v4();
    let salt = SaltString::encode_b64(salt_bytes.as_bytes())
        .map_err(|e| AppError::Internal(e.to_string()))?;
    let new_password_hash = Argon2::default()
        .hash_password(req.new_password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(e.to_string()))?
        .to_string();

    state
        .db
        .update_user_password(&user.id, &new_password_hash)
        .await?;

    Ok(Json(json!({ "success": true, "message": "Password changed successfully" })).into_response())
}

pub async fn list_users(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<Vec<User>>> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    if user.role != "admin" {
        return Err(AppError::Forbidden("Only administrators can view users".to_string()));
    }

    let users = state.db.list_users().await?;
    Ok(Json(users))
}

pub async fn create_user(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(req): Json<CreateUserRequest>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let caller = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    if caller.role != "admin" {
        return Err(AppError::Forbidden("Only administrators can create users".to_string()));
    }

    if req.username.trim().is_empty() || req.password.len() < 6 {
        return Err(AppError::BadRequest(
            "Username must not be empty and password must be at least 6 characters".to_string(),
        ));
    }

    let salt_bytes = uuid::Uuid::new_v4();
    let salt = SaltString::encode_b64(salt_bytes.as_bytes())
        .map_err(|e| AppError::Internal(e.to_string()))?;
    let password_hash = Argon2::default()
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(e.to_string()))?
        .to_string();

    let role = req.role.unwrap_or_else(|| "viewer".to_string());
    let new_user = state
        .db
        .create_user(&req.username, &password_hash, &role)
        .await?;

    Ok((StatusCode::CREATED, Json(new_user)).into_response())
}

pub async fn delete_user(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let caller = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    if caller.role != "admin" {
        return Err(AppError::Forbidden("Only administrators can delete users".to_string()));
    }

    if caller.id == id {
        return Err(AppError::BadRequest("You cannot delete your own account".to_string()));
    }

    state.db.delete_user(&id).await?;
    Ok(Json(json!({ "success": true, "message": "User deleted" })).into_response())
}

fn parse_totp_secret(secret_str: &str) -> Result<Secret> {
    let clean = secret_str.trim().replace(' ', "");
    // 1. Try standard Base32 (canonical RFC4648)
    if let Ok(sec) = Secret::try_from_base32(&clean.to_uppercase()) {
        return Ok(sec);
    }
    // 2. Fallback for legacy 40-character hex strings
    if clean.len() == 40 && clean.chars().all(|c| c.is_ascii_hexdigit()) {
        let mut bytes = Vec::with_capacity(20);
        for i in 0..20 {
            if let Ok(byte) = u8::from_str_radix(&clean[i * 2..i * 2 + 2], 16) {
                bytes.push(byte);
            } else {
                break;
            }
        }
        if bytes.len() == 20 {
            return Ok(Secret::from(bytes));
        }
    }
    Err(AppError::Internal("Invalid secret format".to_string()))
}

pub async fn setup_2fa(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<Setup2faResponse>> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    let secret = Secret::generate();
    let secret_encoded = secret.to_base32();
    let secret_bytes = secret.to_bytes().map_err(|e| AppError::Internal(e.to_string()))?;

    let totp = Totp::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret_bytes,
        Some("KV Files".to_string()),
        user.username.clone(),
    )
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let otpauth_url = totp.to_url().map_err(|e| AppError::Internal(e.to_string()))?;
    let qr_base64 = totp.to_qr_base64().map_err(|e| AppError::Internal(e.to_string()))?;
    let qr_code = format!("data:image/png;base64,{}", qr_base64);

    let backup_codes: Vec<String> = (0..8)
        .map(|_| {
            let u = uuid::Uuid::new_v4().to_string().replace('-', "").to_uppercase();
            format!("{}-{}", &u[0..4], &u[4..8])
        })
        .collect();

    let backup_codes_json = serde_json::to_string(&backup_codes)
        .map_err(|e| AppError::Internal(e.to_string()))?;

    state
        .db
        .save_pending_totp(&user.id, &secret_encoded, &backup_codes_json)
        .await?;

    Ok(Json(Setup2faResponse {
        secret: secret_encoded,
        qr_code,
        otpauth_url,
        backup_codes,
    }))
}

pub async fn enable_2fa(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(req): Json<Verify2faRequest>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let mut user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    let secret_str = state
        .db
        .get_totp_secret(&user.id)
        .await?
        .ok_or_else(|| AppError::BadRequest("No 2FA setup in progress. Please start setup first.".to_string()))?;

    let secret = parse_totp_secret(&secret_str)?;
    let secret_bytes = secret.to_bytes().map_err(|e| AppError::Internal(e.to_string()))?;

    let totp = Totp::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret_bytes,
        Some("KV Files".to_string()),
        user.username.clone(),
    )
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let is_valid = totp.check_current(&req.code).is_some();
    if !is_valid {
        return Err(AppError::BadRequest("Invalid 6-digit verification code. Please check your authenticator app.".to_string()));
    }

    state.db.enable_totp(&user.id).await?;
    let _ = state.db.update_totp_secret(&user.id, &secret.to_base32()).await;

    user.is_totp_enabled = true;
    let mut sessions = state.sessions.write().await;
    sessions.insert(token, user);

    Ok(Json(json!({ "success": true, "message": "Two-factor authentication enabled successfully" })).into_response())
}

pub async fn verify_2fa_login(
    State(state): State<AppState>,
    Json(req): Json<Login2faRequest>,
) -> Result<Response> {
    let user = state
        .get_pre_auth_user(&req.pre_auth_token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Login challenge expired or invalid. Please sign in again.".to_string()))?;

    let code = req.code.trim();
    let mut is_valid = false;

    // Check TOTP code if 6 digits
    if code.len() == 6 && code.chars().all(|c| c.is_ascii_digit()) {
        if let Some(secret_str) = state.db.get_totp_secret(&user.id).await? {
            if let Ok(secret) = parse_totp_secret(&secret_str) {
                if let Ok(secret_bytes) = secret.to_bytes() {
                    if let Ok(totp) = Totp::new(
                        Algorithm::SHA1,
                        6,
                        1,
                        30,
                        secret_bytes,
                        Some("KV Files".to_string()),
                        user.username.clone(),
                    ) {
                        if totp.check_current(code).is_some() {
                            is_valid = true;
                        }
                    }
                }
            }
        }
    }

    // If TOTP check didn't pass, check backup recovery code
    if !is_valid {
        if state.db.validate_and_consume_backup_code(&user.id, code).await? {
            is_valid = true;
        }
    }

    if !is_valid {
        return Err(AppError::Unauthorized("Invalid authentication code or recovery code.".to_string()));
    }

    // Success! Consume pre_auth_session
    state.remove_pre_auth_session(&req.pre_auth_token).await;

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
            token: Some(token),
            user: Some(user),
            requires_2fa: None,
            pre_auth_token: None,
        }),
    )
        .into_response())
}

pub async fn disable_2fa(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(req): Json<Disable2faRequest>,
) -> Result<Response> {
    let token = extract_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    let mut user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired".to_string()))?;

    let (_curr_user, hash) = state
        .db
        .get_user_with_hash_by_id(&user.id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let parsed_hash = PasswordHash::new(&hash)
        .map_err(|e| AppError::Internal(format!("Corrupt password hash: {}", e)))?;

    Argon2::default()
        .verify_password(req.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::BadRequest("Password incorrect".to_string()))?;

    state.db.disable_totp(&user.id).await?;

    user.is_totp_enabled = false;
    let mut sessions = state.sessions.write().await;
    sessions.insert(token, user);

    Ok(Json(json!({ "success": true, "message": "Two-factor authentication disabled" })).into_response())
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

pub async fn auth_middleware(
    State(state): State<AppState>,
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> core::result::Result<Response, AppError> {
    let headers = request.headers();
    let token = extract_token(headers).or_else(|| {
        request.uri().query().and_then(|q| {
            for pair in q.split('&') {
                if let Some(t) = pair.strip_prefix("token=") {
                    return Some(t.to_string());
                }
            }
            None
        })
    });

    let token = token.ok_or_else(|| AppError::Unauthorized("Authentication required".to_string()))?;
    let user = state
        .get_session_user(&token)
        .await
        .ok_or_else(|| AppError::Unauthorized("Session expired or invalid".to_string()))?;

    let mut request = request;
    request.extensions_mut().insert(user);

    Ok(next.run(request).await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_totp_secret_base32_and_hex() {
        let secret = Secret::generate();
        let b32 = secret.to_base32();
        let hex = secret.to_string();

        let parsed_b32 = parse_totp_secret(&b32).expect("Must parse Base32");
        let parsed_hex = parse_totp_secret(&hex).expect("Must parse Hex");

        assert_eq!(parsed_b32.as_bytes(), secret.as_bytes());
        assert_eq!(parsed_hex.as_bytes(), secret.as_bytes());

        let totp1 = Totp::new(Algorithm::SHA1, 6, 1, 30, parsed_b32.to_bytes().unwrap(), None, "test".into()).unwrap();
        let totp2 = Totp::new(Algorithm::SHA1, 6, 1, 30, parsed_hex.to_bytes().unwrap(), None, "test".into()).unwrap();

        let code1 = totp1.generate_current();
        assert!(totp2.check_current(&code1.to_string()).is_some(), "Hex and Base32 secrets must generate matching TOTP tokens");
    }
}
