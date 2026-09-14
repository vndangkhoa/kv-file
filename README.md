# KV Files (v2.0) — Modern Self-Hosted File Manager

[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?logo=rust&style=flat-square)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&style=flat-square)](https://www.sqlite.org/)

**KV Files** is a high-performance, single-binary, self-hosted web file manager engineered with a **Rust (Axum + Tokio)** backend and a **React + Tailwind CSS** frontend. It fuses the familiar hierarchical directory tree and path navigation of **Windows Explorer** with the cascading **Miller Columns** and **Quick Look** of **macOS Finder**.

---

## 🌟 Key Highlights & Design

### 1. Dual Desktop & Mobile View System
- **Desktop View (`>= 768px`)**:
  - Full collapsible directory tree in left sidebar with drive capacity gauges.
  - Multi-column horizontal **macOS Miller Columns** with keyboard arrow navigation (`↑`/`↓`/`←`/`→`) and terminal Inspector preview.
  - Interactive breadcrumbs + `Ctrl+L` editable address bar.
  - Action ribbon toolbar with full buttons (New Folder, Upload, Cut, Copy, Paste, Delete, Share).
  - Status bar with live byte counts, storage quota, and WebSocket sync pulse.
- **Mobile View (`< 768px`)**:
  - **Off-canvas Slide-over Drawer**: Sidebar tree smoothly slides in as a mobile drawer triggered by a touch hamburger menu (`☰`).
  - **Touch Snap-Scroll Columns**: Miller columns automatically adapt to phone viewports (`82vw` per column) with smooth swipe snapping (`snap-x snap-mandatory`).
  - **Adaptive Inspector**: Terminal preview pane scales full-width with large touch action buttons.
  - **Mobile-Responsive List & Grid**: Hides less critical table metadata on narrow screens while preserving name, size, and tap targets.

### 2. Mock Data vs. Real Data Architecture
The application uses the **Repository / Data Source Adapter Pattern** (`web/src/services/dataSource.ts`):
- **Mock Demo Mode (`mockDataSource.ts`)**:
  - In-memory virtual filesystem with realistic sample files (PDF documents, spreadsheets, Markdown, 4K video, audio, Rust/TS code, and zip archives).
  - Simulates all mutations in memory (create folder, rename, copy, move, soft-delete to trash, restore, upload).
  - Allows full UI testing, iteration, and demonstration without running a backend or touching physical files.
- **Real Server Mode (`apiDataSource.ts`)**:
  - Direct HTTP & WebSocket communication with the high-concurrency Rust backend, streaming disk I/O, SQLite WAL database, and `inotify` kernel watcher.
- **1-Click Switching & Future Cleanup**:
  - Click the mode badge in the TitleBar (`[🧪 Demo (Mock)]` $\leftrightarrow$ `[🟢 Live Server]`) to toggle between mock demo and live backend.
  - When ready to remove mock data in production, simply point `activeSource = apiDataSource` in `web/src/services/api.ts` and delete `mockDataSource.ts`—zero component or view refactoring required!

### 3. High-Performance Rust Backend
- **Single Static Binary**: `rust-embed` bundles the compiled React SPA directly into the Rust executable.
- **Zero-Copy Streaming & Seeking**: Implements HTTP `Range` requests (`206 Partial Content`) for instant video and audio scrubbing.
- **Strict Sandbox Security**: Path traversal prevention using `dunce::canonicalize` protects multi-root storage directories from `../` exploits.
- **Real-Time File Sync**: Kernel-level `inotify` watcher broadcasts file events over WebSockets to all connected browsers.
- **Soft-Delete Recycle Bin**: Deleting files quarantines them into `.trash` with 1-click restore or permanent purge.

---

## 🚀 Quick Start

### 1. Run Pre-Built Binary
```bash
# Build release binary
cargo build --release

# Run the server
./target/release/kv-files --port 8866 --storage-roots ./storage
```
Open **`http://localhost:8866`** in your browser.

---

### 2. Development Setup

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
Open **`http://localhost:5173`**.

---

## ⚙️ Configuration & CLI Options

```bash
KV Files — Modern Self-Hosted File Manager

Usage: kv-files [OPTIONS]

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
| `KV_FILES_HOST` | `0.0.0.0` | Listen host |
| `KV_FILES_PORT` | `8866` | Listen port |
| `KV_FILES_DATA_DIR` | `./data` | Database directory |
| `KV_FILES_STORAGE_ROOTS` | `./storage` | Colon-delimited storage mounts (`/mnt/drive1:/mnt/drive2`) |

---

## 📄 License
MIT © Khoa Vo (vndangkhoa)
