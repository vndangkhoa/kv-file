# Ola (v2.0) — Modern Self-Hosted File Manager

[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?logo=rust&style=flat-square)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&style=flat-square)](https://www.sqlite.org/)

**Ola** is a high-performance, single-binary, self-hosted web file manager engineered with a **Rust (Axum + Tokio)** backend and a **React + Tailwind CSS** frontend. It fuses the familiar hierarchical directory tree and path navigation of **Windows Explorer** with the cascading **Miller Columns** and **Quick Look** of **macOS Finder**.

Ola delivers full feature parity with **FileBrowser Quantum (`gtsteffaniak/filebrowser`)** alongside next-generation capabilities including real-time kernel filesystem watching, soft-delete trash restoration, and streaming HTTP Range seeking.

---

## 🌟 Key Highlights & Design

### 1. Hybrid Desktop UI/UX
- **macOS Finder Column View (Miller Columns):** Cascading multi-column browser where selecting folders smoothly scrolls horizontally into new columns, with keyboard arrow navigation and an integrated Inspector preview in the terminal column.
- **Windows Explorer Navigation:**
  - Collapsible left sidebar with **Quick Access** (Home, Documents, Media, Music), **Storage Drives** with live capacity gauges, and expandable directory tree (`▸` / `▾`).
  - Dual **Address Bar**: Segmented clickable breadcrumbs with instant toggle to an editable path input (`Ctrl+L`).
  - **Action Ribbon / Toolbar**: Quick actions for New Folder, Upload, Cut, Copy, Paste, Rename, Delete, Share, and View mode toggling.
  - **Status Bar**: Live item count, selection byte size, disk free quota, and real-time WebSocket connection pulse.
- **macOS Quick Look (`Spacebar`):** Instant overlay preview for images, video player (with scrubbing), audio player, PDF viewer, Markdown, and syntax-highlighted code.
- **Multi-View Modes:** 1-click switching between **Columns (macOS Miller)**, **Detailed List (Windows Explorer table)**, and **Grid View (Thumbnails)**.

### 2. High-Performance Rust Architecture
- **Single Static Binary:** The compiled React SPA is embedded directly into the Rust executable via `rust-embed`.
- **Zero-Copy Streaming & Seeking:** Implements HTTP `Range` requests (`206 Partial Content`) for instant audio/video scrubbing and low memory utilization.
- **Strict Sandbox Security:** Path traversal prevention using `dunce::canonicalize` protects multi-root mounts from `../` escapes.
- **Real-Time File Sync:** Kernel-level `inotify` watcher broadcasts file creations, deletions, and modifications over WebSockets to all active clients without polling.
- **Soft-Delete Recycle Bin:** Deleted files are safely quarantined in a hidden `.trash` container with original path preservation and 1-click restoration.
- **Embedded SQLite WAL:** Fast local database with Write-Ahead Logging for user accounts, public share links, and trash bin metadata.

---

## 🚀 Quick Start

### 1. Run Pre-Built Binary
```bash
# Clone the repository
git clone https://git.khoavo.vndns.net/vndangkhoa/ola.git
cd ola

# Run the server (mounts ./storage and creates ./data/ola.db by default)
./target/release/ola --port 8866
```
Open **`http://localhost:8866`** in your browser. On first launch, you will be prompted to create your administrator account.

---

### 2. Development Setup

#### Requirements
- Rust 1.75+ (`cargo`, `rustc`)
- Node.js 18+ and `npm`

#### Step 1: Start Rust Backend
```bash
cargo run -- --port 8866 --storage-roots ./storage
```

#### Step 2: Start Vite Dev Server (with HMR)
```bash
cd web
npm install
npm run dev
```
Open **`http://localhost:5173`** with hot module replacement proxying directly to the Rust backend.

---

### 3. Production Build (Single Binary)

```bash
# 1. Compile the React frontend assets
cd web
npm run build
cd ..

# 2. Compile optimized Rust release binary with embedded frontend
cargo build --release

# The standalone binary is ready at:
./target/release/ola
```

---

## ⚙️ Configuration & CLI Options

```bash
Modern Self-Hosted File Manager

Usage: ola [OPTIONS]

Options:
  -H, --host <HOST>                    Host address to bind [default: 0.0.0.0]
  -p, --port <PORT>                    Port to listen on [default: 8866]
      --data-dir <DATA_DIR>            Data directory for SQLite database [default: ./data]
      --storage-roots <STORAGE_ROOTS>  Colon-delimited storage directories to mount [default: ./storage]
  -h, --help                           Print help
  -V, --version                        Print version
```

### Environment Variables
| Variable | Default | Description |
| :--- | :--- | :--- |
| `OLA_HOST` | `0.0.0.0` | Listen host |
| `OLA_PORT` | `8866` | Listen port |
| `OLA_DATA_DIR` | `./data` | Database directory |
| `OLA_STORAGE_ROOTS` | `./storage` | Colon-delimited storage mounts (`/mnt/drive1:/mnt/drive2`) |

---

## 📡 API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/setup-status` | `GET` | Check if initial admin account is created |
| `/api/v1/auth/setup` | `POST` | Create first admin account |
| `/api/v1/auth/login` | `POST` | Authenticate with username and password |
| `/api/v1/auth/me` | `GET` | Get current logged-in user profile |
| `/api/v1/fs/roots` | `GET` | List mounted storage roots and disk quota |
| `/api/v1/fs/list` | `GET` | List directory contents with breadcrumbs |
| `/api/v1/fs/tree` | `GET` | Get directory hierarchy for sidebar tree |
| `/api/v1/fs/raw` | `GET` | Stream file with HTTP Range seeking support |
| `/api/v1/fs/download` | `GET` | Download file with attachment header |
| `/api/v1/fs/upload` | `POST` | Multipart streaming file upload |
| `/api/v1/fs/folder` | `POST` | Create new directory |
| `/api/v1/fs/rename` | `POST` | Rename file or folder |
| `/api/v1/fs/copy` | `POST` | Copy file or folder |
| `/api/v1/fs/move` | `POST` | Move file or folder |
| `/api/v1/fs/item` | `DELETE` | Soft-delete to trash or permanent delete |
| `/api/v1/fs/search` | `GET` | Recursive search by query string |
| `/api/v1/trash/list` | `GET` | List soft-deleted items |
| `/api/v1/trash/restore` | `POST` | Restore item from trash to original location |
| `/api/v1/trash/purge` | `DELETE` | Permanently delete item from trash |
| `/api/v1/trash/empty` | `DELETE` | Empty all items in trash |
| `/api/v1/shares` | `GET`/`POST`/`DELETE`| Manage public share links |
| `/api/v1/public/share/:token` | `GET` | Access public share link |
| `/api/v1/ws` | `GET` | WebSocket for real-time filesystem event sync |

---

## 📄 License
MIT © Khoa Vo (vndangkhoa)
