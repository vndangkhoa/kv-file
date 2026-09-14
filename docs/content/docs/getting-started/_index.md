---
title: "Getting Started"
description: "Quickstart guide and first-time setup for Ola"
icon: "rocket_launch"
weight: 100
toc: true
---

Get up and running with **Ola File Manager** in seconds.

## Instant Run

If you already have the compiled `ola` binary, run it directly:

```bash
./ola
```

By default, Ola will:
1. Create `./data/` and initialize an embedded SQLite database (`ola.db`).
2. Mount the local `./storage/` folder.
3. Start the web server on **`http://0.0.0.0:8866`**.

```
[INFO] Starting Ola File Manager v2.0.0
[INFO] SQLite database path: ./data/ola.db
[INFO] Mounted storage root 'storage' -> ./storage
[INFO] Inotify filesystem watcher started successfully
[INFO] 🚀 Ola File Manager listening on http://0.0.0.0:8866
```

---

## First-Time Admin Setup

1. Open your browser and navigate to **`http://localhost:8866`**.
2. Ola automatically detects that no administrative account exists and launches the **Setup Wizard**.
3. Enter your desired username and password. Passwords are encrypted with **Argon2id**.
4. Once created, you are logged in and taken directly to the file browser.

---

## Deployment Options

Choose your preferred deployment method:
- **[Docker Deployment](/docs/getting-started/docker/)**: Run via Docker or Docker Compose in 1 command.
- **[Installation Guide](/docs/getting-started/installation/)**: Build from source using Rust & Node.js or run as a systemd service.
