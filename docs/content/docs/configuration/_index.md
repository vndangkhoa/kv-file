---
title: "Configuration"
description: "Reference guide for all supported CLI flags, environment variables, and configuration precedence"
icon: "settings"
weight: 300
toc: true
---

kv-file configuration is managed through command-line flags and environment variables. Environment variables take precedence over compiled defaults.

---

## ⚙️ Environment Variables & CLI Options

| Environment Variable | CLI Flag | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `KV_HOST` | `-H, --host` | `0.0.0.0` | Network IP address to bind (`0.0.0.0` listens on all network adapters; `127.0.0.1` restricts to localhost only). |
| `KV_PORT` | `-p, --port` | `8866` | TCP port on which the web server and REST API listen. |
| `KV_DATA_DIR` | `--data-dir` | `./data` | Directory where SQLite database (`kv-file.db`), logs, and internal metadata are persisted. |
| `KV_STORAGE_ROOTS` | `--storage-roots` | `./storage` | Colon-delimited list of root paths to mount (e.g. `/mnt/nvme:/mnt/nas/media`). |
| `RUST_LOG` | N/A | `kv_file=info,tower_http=info` | Tracing logging level filter expression (`trace`, `debug`, `info`, `warn`, `error`). |

---

## 💡 Practical Configuration Scenarios

### Scenario 1: Private Localhost Instance
Bind only to localhost on port 9000 for local development or behind an existing reverse proxy:
```bash
./kv-file --host 127.0.0.1 --port 9000 --data-dir ~/.kv-file/data --storage-roots ~/Documents
```

### Scenario 2: Multi-Drive Homelab NAS
Expose multiple storage drives simultaneously with debug logging:
```bash
export KV_HOST="0.0.0.0"
export KV_PORT="8866"
export KV_DATA_DIR="/opt/kv-file/data"
export KV_STORAGE_ROOTS="/mnt/fast_nvme/workspace:/mnt/raidz2_nas/media:/mnt/usb_backup/archive"
export RUST_LOG="kv_file=debug,tower_http=info"
./kv-file
```

---

## 📂 Configuration Topics

Explore in-depth topics below:
- **[Storage Roots & Security](/docs/configuration/security-and-roots/)**: How to mount multiple drives, strict path sandboxing with `dunce::canonicalize`, and Argon2id authentication.
- **[Database, Backups & Maintenance](/docs/configuration/backup-and-maintenance/)**: SQLite WAL mode checkpointing, safe live database backups, data migration, and troubleshooting.
