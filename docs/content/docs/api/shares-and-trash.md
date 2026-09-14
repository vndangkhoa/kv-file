---
title: "Shares & Recycle Bin API"
description: "Public link generation, expiration, password hashing, and Trash recovery endpoints"
icon: "share"
weight: 430
toc: true
---

The Shares and Recycle Bin endpoints handle safe accidental deletion recovery and secure link distribution to external users.

---

## 1. Public Shares

### List Active Shares
<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/shares</span></div>

```bash
curl http://localhost:8866/api/v1/shares
```

### Create Share Link
<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/shares</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/shares \
  -H "Content-Type: application/json" \
  -d '{
    "root": "storage",
    "path": "photos/event_2026",
    "password": "OptionalAccessPassword",
    "expires_at": "2026-10-01T00:00:00Z",
    "allow_download": true
  }'
```

#### Response (200 OK)
```json
{
  "id": "e891c109-c124-4f4a-8d19-4829104bc123",
  "token": "e891c109-c124-4f4a-8d19-4829104bc123",
  "root_name": "storage",
  "path": "photos/event_2026",
  "is_dir": true,
  "has_password": true,
  "expires_at": "2026-10-01T00:00:00Z"
}
```

### Access Public Share (No Auth Required)
<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/public/share/{token}</span></div>

```bash
curl http://localhost:8866/api/v1/public/share/e891c109-c124-4f4a-8d19-4829104bc123
```

### Revoke / Delete Share
<div class="api-endpoint"><span class="badge-method badge-delete">DELETE</span><span class="endpoint-path">/api/v1/shares</span></div>

```bash
curl -X DELETE "http://localhost:8866/api/v1/shares?id=e891c109-c124-4f4a-8d19-4829104bc123"
```

---

## 2. Recycle Bin (Trash)

### List Trashed Items
<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/trash/list</span></div>

```bash
curl http://localhost:8866/api/v1/trash/list
```

#### Response (200 OK)
```json
[
  {
    "id": "t-84920412",
    "name": "draft.txt",
    "original_path": "documents/draft.txt",
    "root_name": "storage",
    "deleted_at": 1726300000,
    "size": 1420
  }
]
```

### Restore Trashed Item
Moves the quarantined item back to its original location:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/trash/restore</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/trash/restore \
  -H "Content-Type: application/json" \
  -d '{"id":"t-84920412"}'
```

### Purge Single Item
Permanently deletes the specified trashed item:

<div class="api-endpoint"><span class="badge-method badge-delete">DELETE</span><span class="endpoint-path">/api/v1/trash/purge</span></div>

```bash
curl -X DELETE http://localhost:8866/api/v1/trash/purge \
  -H "Content-Type: application/json" \
  -d '{"id":"t-84920412"}'
```

### Empty Entire Trash Bin
Permanently unlinks all quarantined items in `.kv_trash/`:

<div class="api-endpoint"><span class="badge-method badge-delete">DELETE</span><span class="endpoint-path">/api/v1/trash/empty</span></div>

```bash
curl -X DELETE http://localhost:8866/api/v1/trash/empty
```

