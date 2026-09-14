---
title: "Installation"
description: "How to compile kv-file from source or install standalone binaries on Linux and macOS"
icon: "download"
weight: 120
toc: true
---

**kv-file** is distributed as a single static binary with embedded web assets (~15MB), requiring no external runtime dependencies like Python, Node.js, or PHP on the host server.

---

## 1. Pre-Compiled Standalone Binaries

Download native release binaries directly from GitHub Releases:

```bash
# Example for Linux x86_64
curl -L -o kv-file https://github.com/vndangkhoa/kv-file/releases/latest/download/kv-file-linux-amd64
chmod +x kv-file

# Verify installation
./kv-file --version
```

### Available Architectures
- **Linux x86_64** (AMD64)
- **Linux aarch64** (ARM64 / Raspberry Pi 4/5)
- **macOS Apple Silicon** (M1/M2/M3)
- **macOS Intel** (x86_64)

---

## 2. Compiling From Source

If you prefer compiling directly on your target machine:

### Prerequisites
- **Rust Toolchain** (1.75+ or 2021 edition): Install via [rustup.rs](https://rustup.rs/)
- **Node.js** (v18+ or v20+) & **npm**: Required to bundle the React frontend.
- **C Compiler / SQLite Dev**: `build-essential` (Ubuntu/Debian) or `base-devel` (Arch).

```bash
# 1. Clone repository
git clone https://github.com/vndangkhoa/kv-file.git
cd kv-file

# 2. Bundle the React single-page frontend
cd web
npm ci
npm run build
cd ..

# 3. Compile the release binary with embedded assets
cargo build --release

# The compiled binary is ready at:
./target/release/kv-file --version
```

---

## 3. Production Linux Systemd Service

To keep `kv-file` running permanently with automatic restart on server reboot:

### Step 1: Create Dedicated Service User
```bash
sudo useradd -r -s /bin/false -d /var/lib/kv-file kvfile
sudo mkdir -p /var/lib/kv-file/data /mnt/storage
sudo chown -R kvfile:kvfile /var/lib/kv-file /mnt/storage
sudo cp target/release/kv-file /usr/local/bin/kv-file
sudo chmod +x /usr/local/bin/kv-file
```

### Step 2: Create Systemd Unit File
Create `/etc/systemd/system/kv-file.service`:

```ini
[Unit]
Description=kv-file Self-Hosted File Manager
After=network.target

[Service]
Type=simple
User=kvfile
Group=kvfile
WorkingDirectory=/var/lib/kv-file
ExecStart=/usr/local/bin/kv-file \
  --host 0.0.0.0 \
  --port 8866 \
  --data-dir /var/lib/kv-file/data \
  --storage-roots "storage:/mnt/storage"
Restart=always
RestartSec=5
LimitNOFILE=65536
Environment=RUST_LOG=kv_file=info

[Install]
WantedBy=multi-user.target
```

### Step 3: Enable and Start Service
```bash
# Reload daemon and enable service
sudo systemctl daemon-reload
sudo systemctl enable --now kv-file

# Check live service status and journal logs
sudo systemctl status kv-file
journalctl -u kv-file -f
```
