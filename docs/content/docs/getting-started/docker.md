---
title: "Docker & Container Deployment"
description: "Run kv-file in containers with Docker, Docker Compose, multi-root volume mounts, and permission mapping"
icon: "deployed_code"
weight: 130
toc: true
---

Deploying **kv-file** via Docker allows sandboxed operation, persistent volume mounting across host disks, and painless container updates.

---

## 1. Quick Start (Docker Run)

Run kv-file with a single terminal command:

```bash
docker run -d \
  --name kv-file \
  -p 8866:8866 \
  -v /opt/kv-file/data:/data \
  -v /mnt/storage:/storage \
  -e KV_HOST=0.0.0.0 \
  -e KV_PORT=8866 \
  -e KV_DATA_DIR=/data \
  -e KV_STORAGE_ROOTS="storage:/storage" \
  -e RUST_LOG=kv_file=info \
  --restart unless-stopped \
  ghcr.io/vndangkhoa/kv-file:latest
```

---

## 2. Production Docker Compose

Using `docker-compose.yml` provides repeatable, version-controlled infrastructure:

```yaml
version: '3.8'

services:
  kv-file:
    image: ghcr.io/vndangkhoa/kv-file:latest
    container_name: kv-file
    ports:
      - "8866:8866"
    environment:
      - KV_HOST=0.0.0.0
      - KV_PORT=8866
      - KV_DATA_DIR=/data
      - KV_STORAGE_ROOTS=photos:/storage/photos:documents:/storage/docs:backups:/storage/backups
      - RUST_LOG=kv_file=info
    volumes:
      # Persistent SQLite database, sessions, and trash
      - ./data:/data
      # Storage root mounts
      - /mnt/disks/media/photos:/storage/photos
      - /mnt/disks/storage/documents:/storage/docs
      - /mnt/disks/backup_drive:/storage/backups
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8866/api/v1/auth/setup-status || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped
```

### Starting the Container Stack
```bash
# Start container in detached background mode
docker compose up -d

# Inspect live container logs
docker compose logs -f kv-file

# Check container health status
docker compose ps
```

---

## 3. Host File Permissions & User Mapping

To ensure kv-file can write and delete files on your host storage mounts without permission errors:

1. Check your host user's ID:
   ```bash
   id -u  # Typically 1000
   id -g  # Typically 1000
   ```
2. Ensure the host storage folders are owned by that user:
   ```bash
   sudo chown -R 1000:1000 /mnt/disks/media /opt/kv-file/data
   ```
3. If running container as a specific user, add `user: "1000:1000"` to your `docker-compose.yml` service block.

---

## 4. Updating the Container

To upgrade to the latest release of kv-file:

```bash
docker compose pull
docker compose up -d --remove-orphans
```
