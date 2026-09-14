---
title: "Getting Started"
description: "Quickstart guide and first-time setup for kv-file"
icon: "rocket_launch"
weight: 100
toc: true
---

Get up and running with **kv-file** in seconds.

## Instant Run

If you already have the compiled `kv-file` binary, run it directly:

```bash
./kv-file
```

By default, kv-file will:
1. Create `./data/` and initialize an embedded SQLite database (`kv-file.db`).
2. Mount the local `./storage/` folder.
3. Start the web server on **`http://0.0.0.0:8866`**.

```
[INFO] Starting kv-file v2.0.0
[INFO] SQLite database path: ./data/kv-file.db
[INFO] Mounted storage root 'storage' -> ./storage
[INFO] Inotify filesystem watcher started successfully
[INFO] 🚀 kv-file listening on http://0.0.0.0:8866
```

---

## First-Time Admin Setup

1. Open your browser and navigate to **`http://localhost:8866`**.
2. kv-file automatically detects that no administrative account exists and launches the **Setup Wizard**.
3. Enter your desired username and password. Passwords are encrypted with **Argon2id**.
4. Once created, you are logged in and taken directly to the file browser.

---

## Deployment Options

Choose your preferred deployment method:
- **[Docker Deployment](/docs/getting-started/docker/)**: Run via Docker or Docker Compose in 1 command.
- **[Installation Guide](/docs/getting-started/installation/)**: Build from source using Rust & Node.js or run as a systemd service.
