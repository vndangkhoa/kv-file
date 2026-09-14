---
title: "User Management API"
description: "Creating users, role-based access control, listing active accounts, and user deletion"
icon: "people"
weight: 415
toc: true
---

The user management API allows administrators to provision accounts, assign roles (`admin` vs `user`), and manage credentials.

---

## 1. List Users

Retrieve all registered accounts in the database. Requires administrator privileges:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/users</span></div>

```bash
curl http://localhost:8866/api/v1/users \
  -H "Authorization: Bearer <admin-session-token>"
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "has_2fa": true,
    "created_at": "2026-09-14T08:00:00Z"
  },
  {
    "id": 2,
    "username": "developer",
    "role": "user",
    "has_2fa": false,
    "created_at": "2026-09-14T09:30:00Z"
  }
]
```

---

## 2. Create User

Provision a new account with credentials encrypted via Argon2id:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/users</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/users \
  -H "Authorization: Bearer <admin-session-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer",
    "password": "SecurePassword2026!",
    "role": "user"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "developer",
    "role": "user",
    "created_at": "2026-09-14T09:30:00Z"
  }
}
```

---

## 3. Delete User

Permanently remove a user account and immediately invalidate all their active sessions:

<div class="api-endpoint"><span class="badge-method badge-delete">DELETE</span><span class="endpoint-path">/api/v1/users/{id}</span></div>

```bash
curl -X DELETE http://localhost:8866/api/v1/users/2 \
  -H "Authorization: Bearer <admin-session-token>"
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```
