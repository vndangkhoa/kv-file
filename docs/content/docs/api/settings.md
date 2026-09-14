---
title: "Settings & System API"
description: "Query and update system configuration, theme preferences, and server variables via REST"
icon: "settings"
weight: 418
toc: true
---

The settings API manages persistent key-value configuration flags stored in SQLite.

---

## 1. Retrieve Settings

Fetch all system settings and global preferences. Requires an active authenticated session:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/settings</span></div>

```bash
curl http://localhost:8866/api/v1/settings \
  -H "Authorization: Bearer <session-token>"
```

### Response (200 OK)
```json
{
  "theme": "dark",
  "default_view": "columns",
  "show_hidden_files": "false",
  "accent_color": "blue",
  "density": "compact",
  "allow_public_shares": "true",
  "trash_retention_days": "30"
}
```

---

## 2. Update System Settings

Update one or more configuration keys. Requires administrator role:

<div class="api-endpoint"><span class="badge-method badge-put">PUT</span><span class="endpoint-path">/api/v1/settings</span></div>

```bash
curl -X PUT http://localhost:8866/api/v1/settings \
  -H "Authorization: Bearer <admin-session-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "default_view": "list",
    "show_hidden_files": "true",
    "trash_retention_days": "14"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Settings saved"
}
```
