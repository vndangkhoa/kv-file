---
title: "API Reference"
description: "REST API endpoints catalog and WebSocket event protocol"
icon: "terminal"
weight: 400
toc: true
---

kv-file exposes a full JSON REST API alongside a real-time WebSocket event pipeline. All API routes are prefixed with `/api/v1`.

## Authentication

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/auth/setup-status` | Returns whether initial admin account is configured. |
| `POST` | `/api/v1/auth/setup` | Register the initial admin credentials. |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain session token. |
| `GET` | `/api/v1/auth/me` | Return currently authenticated user profile. |
| `POST` | `/api/v1/auth/logout` | Invalidate active session token. |

---

## Filesystem Operations

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/fs/roots` | List mounted storage roots and free/total capacities. |
| `GET` | `/api/v1/fs/list?root={r}&path={p}` | List files and folders inside a given path. |
| `GET` | `/api/v1/fs/tree?root={r}` | Fetch complete folder tree hierarchy. |
| `POST` | `/api/v1/fs/folder` | Create a new subfolder. |
| `POST` | `/api/v1/fs/rename` | Rename a file or directory. |
| `POST` | `/api/v1/fs/copy` | Copy an item to destination path. |
| `POST` | `/api/v1/fs/move` | Move an item to destination path. |
| `DELETE` | `/api/v1/fs/item` | Move an item to Trash. |
| `GET` | `/api/v1/fs/search?q={query}` | Search files across mounted volumes. |
| `GET` | `/api/v1/fs/raw?root={r}&path={p}` | Stream raw content for inline preview with HTTP 206 Range. |
| `GET` | `/api/v1/fs/download` | Stream single file or compressed ZIP archive. |
| `POST` | `/api/v1/fs/upload` | Multipart file upload. |

---

## Shares & Trash

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/shares` | List all active public shares. |
| `POST` | `/api/v1/shares` | Create a new public share token with optional password/expiry. |
| `DELETE` | `/api/v1/shares?id={id}` | Revoke an active share. |
| `GET` | `/api/v1/public/share/{token}` | Access public shared item. |
| `GET` | `/api/v1/trash/list` | List items currently in Trash. |
| `POST` | `/api/v1/trash/restore` | Restore a trashed item to its original location. |
| `DELETE` | `/api/v1/trash/purge` | Permanently delete a specific trashed item. |
| `DELETE` | `/api/v1/trash/empty` | Empty the entire trash bin. |

---

## WebSocket Stream

Clients subscribe to live filesystem events by connecting to `/api/v1/ws`:

```javascript
const ws = new WebSocket(`ws://${window.location.host}/api/v1/ws`);

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log("Filesystem event:", payload);
};
```

### Event Payload Schema
```json
{
  "type": "fs_change",
  "action": "create",
  "root": "storage",
  "path": "documents/report.pdf",
  "size": 1048576,
  "modified": 1726302000
}
```
