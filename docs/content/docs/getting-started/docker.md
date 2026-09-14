---
title: "Docker"
description: "Run Ola in containers with Docker and Docker Compose"
icon: "deployed_code"
weight: 130
toc: true
---

Running Ola with Docker requires just a single command:

```bash
docker run -d \
  --name ola \
  -p 8866:8866 \
  -v /opt/ola/data:/data \
  -v /mnt/storage:/storage \
  -e OLA_HOST=0.0.0.0 \
  -e OLA_PORT=8866 \
  -e OLA_DATA_DIR=/data \
  -e OLA_STORAGE_ROOTS=/storage \
  --restart unless-stopped \
  ghcr.io/vndangkhoa/ola:latest
```

## Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  ola:
    image: ghcr.io/vndangkhoa/ola:latest
    container_name: ola
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
