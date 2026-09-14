# kv-file Documentation

This directory contains the documentation website for **kv-file**, built with **Hugo (Extended)** and **Lotus Docs**, styled to match the kv-file Web App design system.

## 🚀 Quick Commands

From the `docs/` directory:
```bash
# Start local dev server with live reloading
hugo server -D

# Build for production
hugo --minify
```

Or from the `web/` directory:
```bash
npm run docs:dev     # Live preview on http://localhost:1313/
npm run docs:build   # Output into docs/public/
```

---

## 📁 Content Map

```text
docs/content/docs/
├── _index.md                             # Documentation home & architecture
│
├── getting-started/                      # Getting Started
│   ├── _index.md                         # Quickstart & setup wizard
│   ├── installation.md                   # Cargo build & native binary
│   ├── docker.md                         # Docker & Compose deployment
│   └── reverse-proxy.md                  # Nginx, Caddy & Traefik setups
│
├── features/                             # Core Features
│   ├── _index.md                         # Feature comparison matrix
│   ├── views.md                          # Miller Columns, Windows List, Grid, Split View
│   ├── preview-and-media.md              # Spacebar Quick Look & Audio Player
│   ├── file-operations.md                # Ribbon, Context Menu & 18 Hotkeys
│   ├── search.md                         # Instant search, filtering & Command Palette
│   ├── realtime-sync.md                  # Inotify watcher & WebSockets
│   └── sharing-and-trash.md              # Public UUID shares & Recycle Bin
│
├── configuration/                        # Configuration & Maintenance
│   ├── _index.md                         # CLI flags & environment variables
│   ├── security-and-roots.md             # Multi-root storage & Argon2id auth
│   └── backup-and-maintenance.md         # SQLite WAL backups & kernel tuning
│
└── api/                                  # Developer Specs
    └── _index.md                         # REST endpoints & WebSocket protocol
```

---

## 🎨 Theme Tokens (`assets/docs/scss/_ola-theme.scss`)

- **Primary Brand**: `#0078d4` (Windows Explorer blue) / `#0062d2` (Finder Selection)
- **Header**: 48px height matching `TitleBar.tsx` with `HardDrive` logo, `v2.0` badge, and `Ctrl+K` search pill
- **Dark Mode**: `#1e1e1e` (canvas), `#252526` (cards/header), `#212224` (sidebar), `#333333` (borders)
- **Light Mode**: `#ffffff` (canvas/cards), `#f6f6f6` (sidebar), `#e5e5e5` (borders)
- **Desktop Scrollbars**: 6px subtle desktop scrollbars matching `web/src/index.css`
- **Typography**: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif`
