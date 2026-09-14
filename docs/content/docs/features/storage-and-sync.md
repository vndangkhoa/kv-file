---
title: "Sync, Shares & Trash"
description: "Kernel-level filesystem watching, secure link sharing, and safe soft deletion"
icon: "sync"
weight: 210
toc: true
---

Beyond its desktop user interface, kv-file provides powerful backend capabilities:

## 1. Real-Time Inotify File Watcher

kv-file hooks directly into the Linux kernel `inotify` subsystem using the Rust `notify` crate:
- Automatically detects file creations, renames, writes, and deletions initiated from external tools (rsync, CLI, Docker volumes, or background scripts).
- Broadcasts changes over WebSockets (`/api/v1/ws`) to all open browser sessions in milliseconds without polling.

## 2. Public Link Sharing

Share files or directories with external colleagues safely:
- **Unguessable UUID Tokens**: Unique 128-bit tokens prevent enumeration (`/api/v1/public/share/{token}`).
- **Optional Password Protection**: Argon2id salted hashes protect sensitive downloads.
- **Configurable Expiration**: Expire links after 1 hour, 1 day, 7 days, or a custom deadline.
- **HTTP Range Streaming**: Supports streaming audio/video with `206 Partial Content`.

## 3. Soft-Delete Recycle Bin (Trash)

Protect against accidental deletions:
- Deleted items are moved to `.kv-file_trash` with original path and timestamp metadata preserved in SQLite.
- Users can review the Trash bin and click **Restore** to return files to their exact original location.
- **Purge** and **Empty Trash** permanently remove files from the storage drive.
