---
title: "Getting Started"
description: "Quickstart guide, initial setup wizard, and deployment overview for kv-file"
icon: "rocket_launch"
weight: 100
toc: true
---

Get up and running with **kv-file File Manager** in under two minutes.

---

## 🚀 Instant Run

If you have downloaded or compiled the `kv-file` binary, run it directly with default settings:

```bash
# Start kv-file listening on http://0.0.0.0:8866
./kv-file
```

When started, kv-file will automatically:
1. Create a data directory at `./data` and initialize an embedded SQLite database (`./data/kv-file.db`).
2. Create and mount a default storage directory at `./storage`.
3. Start the non-blocking inotify filesystem watcher.
4. Bind the HTTP web service to **`http://0.0.0.0:8866`**.

```text
[INFO] Starting kv-file File Manager v2.0.0
[INFO] SQLite database path: ./data/kv-file.db
[INFO] Mounted storage root 'storage' -> ./storage
[INFO] Inotify filesystem watcher started successfully
[INFO] 🚀 kv-file File Manager listening on http://0.0.0.0:8866
```

---

## 🔑 First-Time Admin Setup Wizard

1. Open your web browser and navigate to **`http://localhost:8866`**.
2. Because no users exist in the database on a fresh installation, kv-file automatically renders the **Initial Setup Wizard** (`SetupLoginModal`).
3. Enter your desired **Admin Username** and a secure **Password** (minimum 6 characters).
4. kv-file encrypts the credentials using **Argon2id** with a unique 128-bit random salt and persists the user in SQLite.
5. Upon submission, you will be automatically logged in and redirected to the file explorer interface.

---

## 📦 Deployment Guides

Select your preferred production environment:

- **[Installation Guide](/docs/getting-started/installation/)**: Compile from source using the Rust toolchain, install native binaries, or configure a Linux `systemd` service.
- **[Docker & Docker Compose](/docs/getting-started/docker/)**: Run pre-built container images with persistent volume mounts, custom ports, and user permissions.
- **[Running Behind a Reverse Proxy](/docs/getting-started/reverse-proxy/)**: Production configurations for **Nginx**, **Caddy**, and **Traefik**, including WebSocket proxying (`/api/v1/ws`) and HTTP Range streaming support.
