---
title: "Docker"
description: "Run kv-file in containers with Docker and Docker Compose"
icon: "deployed_code"
weight: 130
toc: true
---

Running kv-file with Docker requires just a single command:

```bash
docker run -d \
  --name kv-file \
  -p 8866:8866 \
  -v /opt/kv-file/data:/data \
  -v /mnt/storage:/storage \
  -e OLA_HOST=0.0.0.0 \
  -e OLA_PORT=8866 \
  -e OLA_DATA_DIR=/data \
  -e OLA_STORAGE_ROOTS=/storage \
  --restart unless-stopped \
  ghcr.io/vndangkhoa/kv-file:latest
```

## Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  kv-file:
    image: ghcr.io/vndangkhoa/kv-file:latest
    container_name: kv-file
    ports:
      - "8866:8866"
    environment:
      - OLA_HOST=0.0.0.0
      - OLA_PORT=8866
      - OLA_DATA_DIR=/data
      - OLA_STORAGE_ROOTS=/storage/photos:/storage/documents
    volumes:
      - ./data:/data
      - /mnt/storage/photos:/storage/photos
      - /mnt/storage/documents:/storage/documents
    restart: unless-stopped
```

Start the container stack:
```bash
docker compose up -d
```
