---
title: "Download Manager & Batch Archiving"
description: "Concurrent file transfers, live progress bars, pause/resume, and instant on-the-fly ZIP generation"
icon: "file_download"
weight: 225
toc: true
---

**kv-file** includes a dedicated, non-blocking **Download Manager** (`DownloadManager.tsx`) that manages single and bulk file downloads seamlessly in the background.

---

## 1. Concurrent Download Engine

When you download large files or multi-gigabyte media collections:
- **Non-Blocking Execution**: Downloads proceed in the background while you continue browsing, moving files, or editing settings.
- **Docked Floating Widget**: A floating progress card appears in the lower-right corner of the interface showing active tasks, transfer speeds, and time remaining.
- **Multi-Task Queue**: Manage multiple concurrent transfers with individual:
  - **Progress Bars**: Precise byte-level percentage tracking.
  - **Transfer Speeds**: Real-time speed indicators (e.g. `24.5 MB/s`).
  - **Cancel / Pause**: Instantly abort or pause individual transfers without impacting other queued tasks.

---

## 2. Automatic On-The-Fly ZIP Archiving

Downloading entire directory hierarchies or multi-item selections does not require manual archiving beforehand:

```
┌─────────────────────────────────────────────────────────────┐
│                    Selected Files / Folders                 │
│       photo1.jpg • report.pdf • /documents/archive/         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Click "Download" (or Ctrl+D)
┌──────────────────────────────▼──────────────────────────────┐
│                  Rust Streaming ZIP Writer                  │
│       Generates compressed ZIP stream chunk-by-chunk        │
│          Zero temporary disk writes • Low RAM usage         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Transfer
┌──────────────────────────────▼──────────────────────────────┐
│                    Browser Direct Download                  │
│                 Saves as: 'kv-file_archive.zip'             │
└─────────────────────────────────────────────────────────────┘
```

- **Zero Disk Bloat**: The backend dynamically compresses files into a standard `.zip` archive on the fly and streams the bytes directly into the HTTP response. No temporary files are generated on the server's hard drive.
- **Folder Preservation**: Relative subfolder hierarchies are strictly preserved inside the generated archive.
- **Instant Start**: The download stream begins in under 50ms, regardless of the folder size.

---

## 3. Keyboard & Context Shortcuts

- Select one or more files and press `Ctrl + D` or click **Download** in the Ribbon Toolbar.
- Right-click any file or folder and select **Download** from the context menu.
- In the **Command Palette (`Ctrl + K`)**, type `Download` to trigger downloading of the active selection.

---

## 4. API Download Endpoint

For scripts, headless automation, and external download managers (like `wget` or `aria2`):

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/download</span></div>

```bash
# Single file direct download (forces Content-Disposition: attachment)
curl -O "http://localhost:8866/api/v1/fs/download?root=storage&path=documents/report.pdf"
```

```bash
# Batch download multiple items as an on-the-fly ZIP archive
curl -o backup_bundle.zip \
  "http://localhost:8866/api/v1/fs/download?root=storage&path=documents/2026&archive=zip"
```
