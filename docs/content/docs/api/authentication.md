---
title: "Authentication API"
description: "Initial admin setup, login sessions, user verification, and logout"
icon: "lock"
weight: 410
toc: true
---

The authentication subsystem manages initial setup checks, admin registration, and session token lifecycle.

---

## 1. Check Initialization Status

Determine whether the kv-file instance has already been initialized with an administrative user:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/auth/setup-status</span></div>

```bash
curl http://localhost:8866/api/v1/auth/setup-status
```

### Response (200 OK)
```json
{
  "is_initialized": true
}
```

---

## 2. Initial Setup (First-Time Admin)

Create the initial administrator credentials. Only permitted when `is_initialized` is `false`:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/setup</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "SuperSecretPassword123!"
  }'
```

### Response (200 OK)
Sets the `kv_session` cookie and returns:
```json
{
  "success": true,
  "token": "4f28e3b1-9b8c-4a3d-9d7a-1e6f5c8b2a19",
  "user": {
    "id": 1,
    "username": "admin",
    "is_admin": true,
    "created_at": "2026-09-14T08:00:00Z"
  }
}
```

---

## 3. Login

Authenticate with an existing account:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/login</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "SuperSecretPassword123!"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "token": "4f28e3b1-9b8c-4a3d-9d7a-1e6f5c8b2a19",
  "user": {
    "id": 1,
    "username": "admin",
    "is_admin": true,
    "created_at": "2026-09-14T08:00:00Z"
  }
}
```

---

## 4. Current User Profile

Fetch the profile of the authenticated session:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/auth/me</span></div>

```bash
curl http://localhost:8866/api/v1/auth/me \
  -H "Authorization: Bearer 4f28e3b1-9b8c-4a3d-9d7a-1e6f5c8b2a19"
```

### Response (200 OK)
```json
{
  "id": 1,
  "username": "admin",
  "is_admin": true,
  "created_at": "2026-09-14T08:00:00Z"
}
```

---

## 5. Logout

Invalidate the active session token:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/logout</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/logout \
  -H "Authorization: Bearer 4f28e3b1-9b8c-4a3d-9d7a-1e6f5c8b2a19"
```

### Response (200 OK)
```json
{
  "success": true
}
```

---

## 6. Change Password

Update account password with immediate Argon2id re-hashing:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/change-password</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/change-password \
  -H "Authorization: Bearer <session-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewSuperSecretPassword2026!"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 7. Two-Factor Authentication (2FA / TOTP)

### Setup 2FA
Generate a new TOTP secret and QR code URI:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/2fa/setup</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/2fa/setup \
  -H "Authorization: Bearer <session-token>"
```

#### Response (200 OK)
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_uri": "otpauth://totp/kv-file:admin?secret=JBSWY3DPEHPK3PXP&issuer=kv-file",
  "recovery_codes": [
    "A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0",
    "U1V2-W3X4", "Y5Z6-A7B8", "C9D0-E1F2", "G3H4-I5J6", "K7L8-M9N0"
  ]
}
```

### Enable 2FA
Validate a 6-digit code to finalize enabling 2FA:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/2fa/enable</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/2fa/enable \
  -H "Authorization: Bearer <session-token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "492019"}'
```

### Verify 2FA During Login
Provide 6-digit code or recovery code during two-stage authentication:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/2fa/verify</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token": "temp-token-from-step-1",
    "code": "492019"
  }'
```

### Disable 2FA
Disable 2FA protection on the authenticated user account:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/auth/2fa/disable</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/auth/2fa/disable \
  -H "Authorization: Bearer <session-token>" \
  -H "Content-Type: application/json" \
  -d '{"password": "CurrentPassword123!"}'
```


