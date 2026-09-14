---
title: "Public Sharing & Trash Bin"
description: "Expiring share links, password protection, soft-delete quarantine, and trash recovery"
icon: "share"
weight: 250
toc: true
---

kv-file provides enterprise-grade data sharing alongside fail-safe accidental deletion recovery.

---

## 1. Public Link Sharing (`ShareModal`)

Share any file or folder with outside recipients without requiring them to register an account on your server:

- **Cryptographically Unguessable Tokens**: Every share generates a 128-bit random UUID token:
  ```
  http://your-server:8866/api/v1/public/share/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  ```
- **Argon2id Password Protection**: Lock sensitive folders with a custom access password. The password hash is securely validated using Argon2id before granting download access.
- **Expiration Schedules**:
  - `1 Hour` (Quick temporary transfers)
  - `24 Hours`
  - `7 Days`
  - `Never / Permanent`
- **Active Shares Dashboard**: Click the **Shares** tab in the sidebar or ribbon toolbar to inspect all active links, check visitor access counts, and revoke links with a single click.

---

## 2. Soft-Delete Recycle Bin (`TrashBinModal`)

Accidental file deletion is prevented through kv-file's non-destructive soft-delete system:

### Deletion Mechanics
1. When an item is deleted in the UI (or with `Delete` / `Backspace`), kv-file performs an atomic zero-copy move into the internal storage staging folder (`.kv_trash/`).
2. The SQLite database stores an audit record containing:
   - Original path before deletion.
   - Exact timestamp when deleted.
   - File size and owner identifier.

### Restoration & Purge
- **1-Click Restore**: Open the **Recycle Bin** from the sidebar or Command Palette. Click **Restore** next to any item to move it back to its original directory.
- **Selective Purge**: Permanently unlinks a single item from the disk.
- **Empty Trash**: Permanently wipes all items from the quarantine folder once confirmed.
