---
title: "Filesystem & Streaming API"
description: "Listing storage roots, directory trees, file CRUD operations, search, and Range streaming"
icon: "folder"
weight: 420
toc: true
---

The filesystem API provides complete control over directory hierarchies, file operations, and streaming content delivery.

---

## 1. List Storage Roots

Fetch all mounted storage roots with total, used, and available disk capacity:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/roots</span></div>

```bash
curl http://localhost:8866/api/v1/fs/roots
```

### Response (200 OK)
```json
[
  {
    "name": "storage",
    "path": "/data/storage",
    "total_bytes": 1000204886016,
    "free_bytes": 654311424000,
    "used_bytes": 345893462016
  }
]
```

---

## 2. List Directory Contents

List files and subfolders within a directory:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/list</span></div>

```bash
curl "http://localhost:8866/api/v1/fs/list?root=storage&path=documents/2026"
```

### Response (200 OK)
```json
{
  "root": "storage",
  "path": "documents/2026",
  "items": [
    {
      "name": "annual_report.pdf",
      "path": "documents/2026/annual_report.pdf",
      "is_dir": false,
      "size": 1843200,
      "human_size": "1.76 MB",
      "modified": 1726300000,
      "media_type": "pdf"
    },
    {
      "name": "receipts",
      "path": "documents/2026/receipts",
      "is_dir": true,
      "size": 4096,
      "human_size": "4.0 KB",
      "modified": 1726301200,
      "media_type": "folder"
    }
  ]
}
```

---

## 3. Directory Hierarchy Tree

Retrieve recursive directory tree structure for sidebar rendering:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/tree</span></div>

```bash
curl "http://localhost:8866/api/v1/fs/tree?root=storage&path=&depth=2"
```

---

## 4. File Streaming with HTTP 206 Range Seeking

Stream audio, video, or documents directly to the browser with byte-range offsets:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/raw</span></div>

```bash
curl -i "http://localhost:8866/api/v1/fs/raw?root=storage&path=videos/demo.mp4" \
  -H "Range: bytes=1048576-2097151"
```

### Response (206 Partial Content)
```text
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 1048576-2097151/524288000
Content-Length: 1048576
Accept-Ranges: bytes
```

---

## 5. File Operations (CRUD)

### Create Folder
<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/fs/folder</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/fs/folder \
  -H "Content-Type: application/json" \
  -d '{"root":"storage","path":"documents/new_project"}'
```

### Rename Item
<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/fs/rename</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/fs/rename \
  -H "Content-Type: application/json" \
  -d '{"root":"storage","path":"old_name.txt","new_name":"new_name.txt"}'
```

### Copy or Move Item
<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/fs/copy</span></div>

```bash
curl -X POST http://localhost:8866/api/v1/fs/copy \
  -H "Content-Type: application/json" \
  -d '{"root":"storage","source":"notes.txt","destination":"archive/notes.txt"}'
```
*(Use `POST /api/v1/fs/move` with the same payload to move items).*

### Move Item to Trash
<div class="api-endpoint"><span class="badge-method badge-delete">DELETE</span><span class="endpoint-path">/api/v1/fs/item</span></div>

```bash
curl -X DELETE http://localhost:8866/api/v1/fs/item \
  -H "Content-Type: application/json" \
  -d '{"root":"storage","path":"obsolete.docx"}'
```

---

## 6. Multipart Upload

Upload one or more files directly into the target directory:

<div class="api-endpoint"><span class="badge-method badge-post">POST</span><span class="endpoint-path">/api/v1/fs/upload</span></div>

```bash
curl -X POST "http://localhost:8866/api/v1/fs/upload?root=storage&path=documents" \
  -F "file=@presentation.pdf"
```

