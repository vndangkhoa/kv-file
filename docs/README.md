# Ola Documentation

This directory contains the documentation site for **Ola File Manager**, built with **Hugo** and **Lotus Docs**, styled to match the Ola Web App design system.

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

## 📁 Content Structure

Documentation is organized in `docs/content/docs/`:

```text
docs/content/docs/
├── _index.md                    # Documentation home & architecture
├── getting-started/             # Quickstart, installation & Docker
│   ├── _index.md                # Quickstart guide (icon: rocket_launch)
│   ├── installation.md          # Cargo build & native binary
│   └── docker.md                # Docker & Compose
├── features/                    # UI & capabilities
│   ├── _index.md                # Miller Columns & Windows Explorer view (icon: diamond)
│   └── storage-and-sync.md      # Real-time sync, sharing & trash
├── configuration/               # Configuration
│   ├── _index.md                # Environment variables & flags (icon: settings)
│   └── security-and-roots.md    # Multi-root storage & Argon2id auth
└── api/                         # Developer specs
    └── _index.md                # REST endpoints & WebSockets (icon: terminal)
```

---

## 🎨 Theme Tokens (`assets/docs/scss/_ola-theme.scss`)

- **Primary Brand**: `#0078d4` (Windows Explorer blue) / `#0062d2` (Finder Selection)
- **Dark Mode**: `#1e1e1e` (canvas background), `#252526` (cards), `#212224` (sidebar), `#333333` (borders)
- **Light Mode**: `#ffffff` (canvas), `#f6f6f6` (sidebar), `#e5e5e5` (borders)
- **Desktop Scrollbars**: 6px subtle desktop scrollbars matching `web/src/index.css`
- **Typography**: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif`
