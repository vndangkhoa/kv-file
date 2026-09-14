---
title: "Installation"
description: "How to compile Ola from source or install standalone binaries"
icon: "download"
weight: 120
toc: true
---

Ola is distributed both as pre-compiled native binaries and as an easily buildable Rust crate.

## Prerequisites

To build Ola from source, ensure you have the following installed:
- **Rust toolchain** (Rust 1.75+ or 2021 edition): [rustup.rs](https://rustup.rs/)
- **Node.js** (v18+ or v20+) & **npm**: Required to build the frontend single-page application.
- **SQLite build tools** / C compiler (e.g., `build-essential` on Debian/Ubuntu).

## Building From Source

```bash
# 1. Clone repository
git clone https://github.com/vndangkhoa/ola.git
cd ola

# 2. Build the frontend web UI
cd web
npm ci
npm run build
cd ..

# 3. Compile the release binary with embedded assets
cargo build --release

# The compiled single-file binary will be ready at:
./target/release/ola --version
```

## Running as a Systemd Service

To keep Ola running permanently on Linux:

```ini
# /etc/systemd/system/ola.service
[Unit]
Description=Ola File Manager
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/lib/ola
ExecStart=/usr/local/bin/ola --host 0.0.0.0 --port 8866 --data-dir /var/lib/ola/data --storage-roots /mnt/storage
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ola
```
