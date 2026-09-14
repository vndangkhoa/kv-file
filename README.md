<p align="center">
  <img src="web/public/icons/logo.svg" alt="KV Files Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 12px 32px rgba(37,99,235,0.25);">
</p>

<h1 align="center">KV Files (kv-file)</h1>

<p align="center">
  <strong>High-performance, modern self-hosted file manager fusing macOS Miller Columns elegance with Windows Explorer precision.</strong><br>
  Engineered with a pure Rust (Axum + Tokio) backend, embedded SQLite WAL, and a responsive React PWA frontend.
</p>

<p align="center">
  <a href="https://github.com/vndangkhoa/kv-file/releases"><img src="https://img.shields.io/badge/version-2.0.0-blue?style=flat-square&logo=git" alt="Version 2.0.0"></a>
  <a href="https://hub.docker.com/r/vndangkhoa/kv-file"><img src="https://img.shields.io/docker/pulls/vndangkhoa/kv-file?style=flat-square&logo=docker&logoColor=white&label=Docker%20Hub" alt="Docker Hub Pulls"></a>
  <a href="https://github.com/vndangkhoa/kv-file/pkgs/container/kv-file"><img src="https://img.shields.io/badge/GHCR-kv--file-blue?style=flat-square&logo=github&logoColor=white" alt="GitHub Container Registry"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-1.75+-orange?style=flat-square&logo=rust&logoColor=white" alt="Rust 1.75+"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"><img src="https://img.shields.io/badge/PWA-Ready-purple?style=flat-square&logo=pwa&logoColor=white" alt="PWA Ready"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License MIT"></a>
</p>

---

## ⚡ Why KV Files?

Most web file managers force you to choose between slow, bloated enterprise interfaces or bare-bones directory listings. **KV Files** gives you the best of both worlds:

- 🚀 **Blazing Fast**: Single static binary written in pure Rust (Axum + Tokio) with zero external runtime dependencies.
- 🗂️ **Familiar Navigation**: Switch effortlessly between **macOS Miller Columns** (with keyboard navigation `↑`/`↓`/`←`/`→`), **Windows Explorer** detailed list, compact grid, and dual-pane split view.
- 🌐 **Dedicated Public Share Portal**: Generate expiring public share links with optional password protection. Directs visitors to a branded `/share/{token}` landing page with interactive in-browser preview (code/text, images, media, PDFs) and 1-click file/zip download.
- 🏷️ **NAS & Server Intelligent Badges**: Automatically detects and contextualizes directory structures across **Synology DSM**, **TrueNAS CORE/SCALE**, **Unraid**, and **Linux VPS** Docker stacks. Features a **"Simple Mode"** toggle to hide OS internal plumbing for non-technical users.
- 💾 **Multi-Drive Architecture**: Mount and manage multiple named roots (`root`, `storage`, `stacks`) and server shortcut places simultaneously.
- 📱 **Installable PWA & Mobile First**: Full Progressive Web App with off-canvas touch navigation, mobile thumb-zone FAB, and swipe-snap columns.
- 🎵 **Native Lockscreen Playcards**: Full integration with the **W3C Media Session API** gives iOS Dynamic Island / Control Center and Android Notifications rich play/pause, scrub, and artwork controls for audio and video streaming.
- 🍎 **Apple & iPhone Ecosystem**: First-class preview for iPhone media (`.mov`, `.heic`, `.heif`, `.caf`, `.m4a`) and Apple iWork documents (`.pages`, `.numbers`, `.keynote`).
- 🔒 **Hardened Security**: Argon2id password hashing, RFC 6238 TOTP Two-Factor Authentication (2FA) with live QR codes, and strict filesystem sandboxing.
- ⚡ **Real-Time Synchronization**: Kernel-level `inotify` watcher broadcasts remote changes instantly over WebSockets with zero UI flickering.
- 📦 **Zero-Friction Operations**: Drag-and-drop multi-file upload overlay, on-the-fly zip folder streaming, recycle bin with restore/purge, and expiring public share links.

---

## 📸 Screenshots & Interface Overview

| Desktop Miller Columns (macOS Style) | Windows Explorer Detailed List |
| :---: | :---: |
| Horizontal cascading folder columns with instant keyboard arrow navigation and integrated file inspector | Familiar hierarchical directory tree, sorting by name/size/date, and Ribbon action toolbar |

| Mobile View & Thumb-Zone FAB | iOS & Android Lockscreen Playcard |
| :---: | :---: |
| Responsive slide-over drawer navigation and floating action buttons designed for one-handed mobile use | Interactive system playcard with seek bar, playback controls, and metadata |

---

## 🚀 Quick Start with Docker

The fastest way to deploy KV Files in production is using Docker or Docker Compose.

### Option A: Single Command (`docker run`)

```bash
docker run -d \
  --name kv-file \
  -p 8866:8866 \
  -v /opt/kv-file/data:/data \
  -v /mnt/storage:/storage \
  -e KV_HOST=0.0.0.0 \
  -e KV_PORT=8866 \
  -e KV_DATA_DIR=/data \
  -e KV_STORAGE_ROOTS=/storage \
  -e RUST_LOG=kv_files=info,tower_http=info \
  --restart unless-stopped \
  ghcr.io/vndangkhoa/kv-file:latest
```

Open **`http://localhost:8866`** in your browser to complete initial administrator setup.

---

### Option B: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  kv-file:
    image: ghcr.io/vndangkhoa/kv-file:latest
    # Or use Docker Hub:
    # image: vndangkhoa/kv-file:latest
    container_name: kv-file
    restart: unless-stopped
    ports:
      - "8866:8866"
    environment:
      - KV_HOST=0.0.0.0
      - KV_PORT=8866
      - KV_DATA_DIR=/data
      - KV_STORAGE_ROOTS=photos:/storage/photos:documents:/storage/docs:backups:/storage/backups
      - RUST_LOG=kv_files=info,tower_http=info
    volumes:
      # Persistent SQLite database, sessions, and recycle bin
      - ./data:/data
      # Storage mounts (format: host_dir:container_dir)
      - /mnt/storage/photos:/storage/photos
      - /mnt/storage/documents:/storage/docs
      - /mnt/storage/backups:/storage/backups
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8866/api/v1/auth/setup-status || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
```

Start the service:
```bash
docker compose up -d
docker compose logs -f kv-file
```

---

### Available Container Registries

Pre-built multi-arch images are published on all major registries:

| Registry | Image URL |
| :--- | :--- |
| **Docker Hub** | `vndangkhoa/kv-file:latest` |
| **GitHub Packages (GHCR)** | `ghcr.io/vndangkhoa/kv-file:latest` |
| **Forgejo (vndns.net)** | `git.khoavo.vndns.net/vndangkhoa/kv-file:latest` |
| **Forgejo (myds.me)** | `git.khoavo.myds.me/vndangkhoa/kv-file:latest` |

---

## 🛠️ Native Binary & Source Build

### Prerequisites
- **Rust 1.75+** (`rustup default stable`)
- **Node.js 20+** & `npm`
- **Hugo (Extended)** (for compiling the embedded `/docs` site)

### Build Steps

```bash
# 1. Clone repository
git clone https://github.com/vndangkhoa/kv-file.git
cd kv-file

# 2. Compile Web Frontend & Documentation
cd web
npm install
npm run build
cd ..

# 3. Compile Production Rust Binary
cargo build --release

# 4. Run KV Files
./target/release/kv-files --port 8866 --storage-roots ./storage
```

---

## ⚙️ Configuration & Environment Variables

KV Files can be configured via command-line flags or environment variables:

| CLI Flag | Environment Variable | Default | Description |
| :--- | :--- | :--- | :--- |
| `-H, --host` | `KV_HOST` | `0.0.0.0` | Network IP address to bind to |
| `-p, --port` | `KV_PORT` | `8866` | TCP port to listen on |
| `--data-dir` | `KV_DATA_DIR` | `./data` | Directory for persistent SQLite database |
| `--storage-roots` | `KV_STORAGE_ROOTS` | `./storage` | Colon-delimited storage mounts (`drive1:/mnt/d1:drive2:/mnt/d2`) |
| — | `RUST_LOG` | `kv_files=info` | Tracing log filter (`trace`, `debug`, `info`, `warn`, `error`) |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> | Global | Open Quick Command Palette & Search |
| <kbd>Space</kbd> | Selection | Quick Look file preview (macOS style) |
| <kbd>Enter</kbd> | Selection | Open folder / launch default file viewer |
| <kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>←</kbd> / <kbd>→</kbd> | Miller Columns | Column & item keyboard navigation |
| <kbd>F2</kbd> | Selection | Rename selected item |
| <kbd>Delete</kbd> | Selection | Move item to Recycle Bin |
| <kbd>Shift</kbd> + <kbd>Delete</kbd> | Selection | Permanently delete item |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>Ctrl</kbd> + <kbd>X</kbd> | Selection | Copy / Cut selected items |
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Directory | Paste items from clipboard |
| <kbd>Ctrl</kbd> + <kbd>A</kbd> | Explorer | Select all items |
| <kbd>Ctrl</kbd> + <kbd>L</kbd> | Navigation | Focus & edit address bar path |
| <kbd>Esc</kbd> | Modals | Close active modal / viewer / search |

---

## 📡 REST API & WebSocket Endpoints

All API routes are served under `/api/v1` with JSON request/response payloads:

```
Authentication & Users
  GET    /api/v1/auth/setup-status      # Check if admin user is initialized
  POST   /api/v1/auth/setup             # Initial admin account setup
  POST   /api/v1/auth/login             # Authenticate session
  GET    /api/v1/auth/me                # Get current session user
  POST   /api/v1/auth/logout            # Invalidate session
  POST   /api/v1/auth/change-password   # Update password
  POST   /api/v1/auth/2fa/setup         # Generate TOTP secret & QR code
  POST   /api/v1/auth/2fa/enable        # Confirm & enable 2FA
  POST   /api/v1/auth/2fa/verify        # Verify 2FA code during login
  POST   /api/v1/auth/2fa/disable       # Disable 2FA with password
  GET    /api/v1/users                  # List users (Admin)
  POST   /api/v1/users                  # Create user (Admin)
  DELETE /api/v1/users/{id}             # Delete user (Admin)

Filesystem & Operations
  GET    /api/v1/fs/roots               # List mounted storage roots & disk capacity
  GET    /api/v1/fs/list                # List directory items
  GET    /api/v1/fs/tree                # Directory hierarchy tree for sidebar
  POST   /api/v1/fs/folder              # Create directory
  POST   /api/v1/fs/rename              # Rename file or directory
  POST   /api/v1/fs/copy                # Copy file or directory
  POST   /api/v1/fs/move                # Move file or directory
  DELETE /api/v1/fs/item                # Soft-delete item to Recycle Bin
  GET    /api/v1/fs/search              # Recursive keyword search
  GET    /api/v1/fs/raw                 # Stream raw media with HTTP Range support
  GET    /api/v1/fs/download            # Download file or on-the-fly folder zip
  POST   /api/v1/fs/upload              # Multipart streaming file upload

Recycle Bin & Shares
  GET    /api/v1/trash/list             # List quarantined items
  POST   /api/v1/trash/restore          # Restore deleted item to original path
  DELETE /api/v1/trash/purge            # Permanently delete specific item
  DELETE /api/v1/trash/empty            # Empty entire recycle bin
  GET    /api/v1/shares                 # List active shares
  POST   /api/v1/shares                 # Create share link (with expiry & password)
  DELETE /api/v1/shares                 # Revoke share link
  GET    /api/v1/public/share/{token}   # Public share metadata (auto-redirects browsers to /share/{token})
  GET    /api/v1/public/share/{token}/raw      # Public share inline streaming (preview)
  GET    /api/v1/public/share/{token}/download # Public share attachment download (or on-the-fly zip)

Public Web Landing Routes
  GET    /share/{token}                 # Dedicated public share viewer with interactive preview
  GET    /s/{token}                     # Short-link alias for public share viewer

Real-Time Events
  GET    /api/v1/ws                     # WebSocket feed for live inotify filesystem events
```

---

## 🏛️ Architecture & Project Structure

```
kv-file/
├── Cargo.toml                  # Rust workspace dependencies
├── Dockerfile                  # Production Debian-slim runtime
├── docker-compose.yml          # Production stack configuration
├── src/
│   ├── main.rs                 # Server entrypoint & graceful shutdown
│   ├── config.rs               # Multi-root CLI & env parsing
│   ├── db/                     # SQLite WAL database & migrations
│   ├── fs/                     # Filesystem operations & dunce sandbox
│   ├── watcher/                # Kernel inotify watcher & event broadcast
│   ├── models/                 # Data models & serde serializations
│   └── api/                    # Axum REST routes, auth, upload & static embed
├── docs/                       # Hugo Lotus Docs documentation suite (embedded)
└── web/                        # React 18 + TypeScript + Tailwind CSS
    ├── index.html              # PWA entrypoint with mobile meta tags
    ├── public/
    │   ├── icons/              # SVG & PNG app icons (16px to 512px)
    │   ├── manifest.webmanifest# PWA manifest
    │   └── sw.js               # Offline service worker
    └── src/
        ├── components/views/   # Miller Columns, Detailed List, Grid, Split
        ├── components/preview/ # Quick Look, Media Session Audio & Video
        └── services/           # Data source adapter (Real API / Mock)
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Developed with ❤️ by **Khoa Vo ([@vndangkhoa](https://github.com/vndangkhoa))**.
