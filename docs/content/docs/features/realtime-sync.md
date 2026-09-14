---
title: "Real-Time Inotify Sync"
description: "Kernel filesystem watching, zero-polling WebSocket broadcasting, and multi-client sync"
icon: "sync"
weight: 240
toc: true
---

Traditional web file managers require users to manually refresh their browser to see new files or updates. kv-file eliminates this with an asynchronous **kernel event pipeline**.

---

## How It Works

```
┌──────────────────────────────────────────────────────────┐
│             Filesystem Event (Kernel Level)              │
│       CLI Command • rsync • Git • Docker Volume Write    │
└────────────────────────────┬─────────────────────────────┘
                             │ inotify hook
┌────────────────────────────▼─────────────────────────────┐
│                 Rust 'notify' Watcher                    │
│      Non-blocking background thread with root filter     │
└────────────────────────────┬─────────────────────────────┘
                             │ broadcast::channel(100)
┌────────────────────────────▼─────────────────────────────┐
│               Axum WebSocket Engine (/api/v1/ws)         │
│          Pushes JSON events to all active browsers       │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│               Frontend React Reconciliation              │
│       Updates active directory cache without redraw      │
└──────────────────────────────────────────────────────────┘
```

---

## 1. Zero-Polling Architecture

1. When kv-file starts, it attaches non-blocking Linux `inotify` watchers to every mounted storage root via the Rust `notify` crate.
2. Any filesystem mutation triggers an asynchronous event in a lightweight Tokio thread.
3. The event is broadcast across a multi-producer `tokio::sync::broadcast` channel to all active client WebSocket connections at `/api/v1/ws`.

---

## 2. Event Payload Schema

When an external process writes or deletes a file, clients receive an immediate JSON push:

```json
{
  "type": "fs_change",
  "action": "create",
  "root": "storage",
  "path": "documents/financial_report_2026.pdf",
  "size": 1843200,
  "modified": 1726303200
}
```

### Action Types
- `create`: New file or folder created.
- `modify`: Existing file content updated.
- `delete`: File unlinked or moved out.
- `rename`: Item renamed or moved across folders.

---

## 3. External Tool Integration

Because kv-file listens directly to the OS kernel:
- **rsync / scp**: Running an `rsync -avz` backup into your storage folder reflects immediately in the browser.
- **Background Scripts**: Automated downloaders (e.g. torrent clients, scrapers, ffmpeg transcoders) appear on the screen the millisecond the file is finalized.
- **Docker Mounts**: Changes made inside other containers bound to the same volume update in real time.

---

## 4. Live Connection Indicator

The kv-file **Status Bar** (located at the bottom of the window) maintains a live WebSocket heartbeat pulse:
- 🟢 **Connected**: Real-time push active.
- 🔴 **Reconnecting**: Automatic exponential backoff reconnection if the network disconnects.
