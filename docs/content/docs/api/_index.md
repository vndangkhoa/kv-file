---
title: "API Reference"
description: "Production REST API endpoints catalog and WebSocket event specifications for kv-file"
icon: "terminal"
weight: 400
toc: true
---

**kv-file** exposes a complete, high-performance JSON REST API alongside a real-time WebSocket event pipeline. All REST endpoints are rooted at `/api/v1`.

- **Base URL**: `http://<server-host>:8866/api/v1`
- **Content-Type**: `application/json` (except multipart uploads and raw binary streaming)
- **Authentication**: Session cookie or `Authorization: Bearer <token>` header

---

## 🧭 API Sections

<div class="row mt-4">
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">lock</i>
        <h6 class="mb-0 fw-bold">Authentication & 2FA</h6>
      </div>
      <p class="text-muted small mb-3">Setup status, login sessions, user verification, password updates, and TOTP 2FA.</p>
      <a href="/docs/api/authentication/" class="btn btn-sm btn-primary">Auth API &rarr;</a>
    </div>
  </div>
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">people</i>
        <h6 class="mb-0 fw-bold">User Management</h6>
      </div>
      <p class="text-muted small mb-3">List accounts, provision users with roles (admin/user), and account deletion.</p>
      <a href="/docs/api/users/" class="btn btn-sm btn-primary">Users API &rarr;</a>
    </div>
  </div>
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">settings</i>
        <h6 class="mb-0 fw-bold">Settings & System</h6>
      </div>
      <p class="text-muted small mb-3">Read and update system-wide preferences, theme keys, and retention policies.</p>
      <a href="/docs/api/settings/" class="btn btn-sm btn-primary">Settings API &rarr;</a>
    </div>
  </div>
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">folder</i>
        <h6 class="mb-0 fw-bold">Filesystem & Streaming</h6>
      </div>
      <p class="text-muted small mb-3">Roots listing, directory trees, file CRUD, Range 206 streaming, and uploads.</p>
      <a href="/docs/api/filesystem/" class="btn btn-sm btn-primary">Filesystem API &rarr;</a>
    </div>
  </div>
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">share</i>
        <h6 class="mb-0 fw-bold">Shares & Recycle Bin</h6>
      </div>
      <p class="text-muted small mb-3">Expiring links with Argon2id passwords, quarantine listing, and 1-click restore.</p>
      <a href="/docs/api/shares-and-trash/" class="btn btn-sm btn-primary">Shares & Trash &rarr;</a>
    </div>
  </div>
  <div class="col-md-4 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">cable</i>
        <h6 class="mb-0 fw-bold">WebSocket Stream</h6>
      </div>
      <p class="text-muted small mb-3">Real-time push event stream for kernel inotify filesystem change events.</p>
      <a href="/docs/api/websocket/" class="btn btn-sm btn-primary">WebSocket Specs &rarr;</a>
    </div>
  </div>
</div>

---

## ⚡ Master Endpoint Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/setup-status` | Check if initial admin account exists. | No |
| `POST` | `/api/v1/auth/setup` | Create first-time admin account. | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain session token. | No |
| `GET` | `/api/v1/auth/me` | Fetch active user profile. | Yes |
| `POST` | `/api/v1/auth/logout` | Invalidate current session token. | Yes |
| `POST` | `/api/v1/auth/change-password` | Update user password with Argon2id. | Yes |
| `POST` | `/api/v1/auth/2fa/setup` | Generate TOTP secret and QR URI. | Yes |
| `POST` | `/api/v1/auth/2fa/enable` | Verify code and activate 2FA. | Yes |
| `POST` | `/api/v1/auth/2fa/verify` | Validate 2FA code during login. | No (Temp Token) |
| `POST` | `/api/v1/auth/2fa/disable` | Deactivate 2FA protection. | Yes |
| `GET` | `/api/v1/users` | List all accounts. | Admin |
| `POST` | `/api/v1/users` | Create a new user account. | Admin |
| `DELETE` | `/api/v1/users/{id}` | Permanently delete a user. | Admin |
| `GET` | `/api/v1/settings` | Retrieve system preferences. | Yes |
| `PUT` | `/api/v1/settings` | Update system configuration. | Admin |
| `GET` | `/api/v1/fs/roots` | List mounted storage roots. | Yes |
| `GET` | `/api/v1/fs/list` | List directory contents. | Yes |
| `GET` | `/api/v1/fs/tree` | Fetch recursive directory tree. | Yes |
| `POST` | `/api/v1/fs/folder` | Create a new directory. | Yes |
| `POST` | `/api/v1/fs/rename` | Rename file or folder. | Yes |
| `POST` | `/api/v1/fs/copy` | Copy item to target directory. | Yes |
| `POST` | `/api/v1/fs/move` | Move item to target directory. | Yes |
| `DELETE` | `/api/v1/fs/item` | Move item to Recycle Bin. | Yes |
| `GET` | `/api/v1/fs/raw` | Stream file with HTTP 206 Range seeking. | Yes |
| `GET` | `/api/v1/fs/download` | Single file or on-the-fly ZIP download. | Yes |
| `POST` | `/api/v1/fs/upload` | Multipart file upload. | Yes |
| `GET` | `/api/v1/fs/search` | Fast fuzzy filesystem search. | Yes |
| `GET` | `/api/v1/shares` | List active public shares. | Yes |
| `POST` | `/api/v1/shares` | Create public share link. | Yes |
| `DELETE` | `/api/v1/shares` | Revoke a public share link. | Yes |
| `GET` | `/api/v1/public/share/{token}` | Access public shared item. | Public (PW if set) |
| `GET` | `/api/v1/public/share/{token}/download` | Download public share content. | Public (PW if set) |
| `GET` | `/api/v1/trash/list` | List quarantined Recycle Bin items. | Yes |
| `POST` | `/api/v1/trash/restore` | Restore item to original path. | Yes |
| `DELETE` | `/api/v1/trash/purge` | Permanently unlink single trashed item. | Yes |
| `DELETE` | `/api/v1/trash/empty` | Empty all contents of Recycle Bin. | Yes |
| `GET` | `/api/v1/ws` | Persistent WebSocket change event stream. | Yes |
