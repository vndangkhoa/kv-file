---
title: "Running Behind a Reverse Proxy"
description: "Production reverse proxy setups for Nginx, Caddy, and Traefik with WebSocket and Range streaming support"
icon: "router"
weight: 140
toc: true
---

Running kv-file behind a reverse proxy provides HTTPS encryption (SSL/TLS), custom domain names, and automated certificate renewals.

> [!IMPORTANT]
> kv-file relies on **WebSockets** (`/api/v1/ws`) for real-time filesystem updates and **HTTP Range headers** (`206 Partial Content`) for instant video seeking. Your reverse proxy must pass upgrade headers and allow large request bodies for file uploads.

---

## 1. Nginx

Add the following server block to `/etc/nginx/sites-available/kv-file.conf`:

```nginx
server {
    listen 80;
    server_name files.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name files.example.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/files.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/files.example.com/privkey.pem;

    # Allow unlimited upload sizes for large media & ISOs
    client_max_body_size 0;

    location / {
        proxy_pass http://127.0.0.1:8866;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for real-time inotify push events
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Disable buffering for low-latency streaming
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 2. Caddy

Caddy enables automatic HTTPS via Let's Encrypt with a two-line configuration. Add to `/etc/caddy/Caddyfile`:

```caddy
files.example.com {
    reverse_proxy 127.0.0.1:8866 {
        # WebSockets and streaming are supported natively in Caddy
    }
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

## 3. Traefik (Docker Compose)

When deploying kv-file with Traefik as a container ingress, configure router labels in your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  kv-file:
    image: ghcr.io/vndangkhoa/kv-file:latest
    container_name: kv-file
    restart: unless-stopped
    volumes:
      - /opt/kv-file/data:/data
      - /mnt/storage:/storage
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kv-file.rule=Host(`files.example.com`)"
      - "traefik.http.routers.kv-file.entrypoints=websecure"
      - "traefik.http.routers.kv-file.tls.certresolver=letsencrypt"
      - "traefik.http.services.kv-file.loadbalancer.server.port=8866"
```

---

## 4. Key Proxy Checklist

Ensure your proxy satisfies these requirements:
1. **WebSocket Upgrade Headers**: `Upgrade $http_upgrade` and `Connection "upgrade"` on `/api/v1/ws`.
2. **Client Max Body Size**: Set to `0` (or `10G`+) to prevent `413 Request Entity Too Large` on bulk file uploads.
3. **HTTP Range Requests**: Enable `proxy_buffering off` so streaming media requests (`bytes=...`) stream without buffering the entire media file.
