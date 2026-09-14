---
title: "Configuration"
description: "CLI options, network settings, and environment variables"
icon: "settings"
weight: 300
toc: true
---

kv-file can be configured using command-line arguments or environment variables. Environment variables take precedence over compiled defaults.

## Environment Variables & CLI Options

| Variable | CLI Flag | Default | Description |
| :--- | :--- | :--- | :--- |
| `OLA_HOST` | `-H, --host` | `0.0.0.0` | IP address interface to bind (`0.0.0.0` for all interfaces, `127.0.0.1` for local only). |
| `OLA_PORT` | `-p, --port` | `8866` | Listening TCP port for the web service. |
| `OLA_DATA_DIR` | `--data-dir` | `./data` | Directory where SQLite database (`kv-file.db`) and metadata reside. |
| `OLA_STORAGE_ROOTS` | `--storage-roots` | `./storage` | Colon-separated list of storage paths to mount (e.g. `/mnt/nas:/data/storage`). |
| `RUST_LOG` | N/A | `kv-file=info,tower_http=info` | Tracing log filter expression (`debug`, `info`, `warn`, `error`). |

---

## Example Usage

### Custom Port & Localhost Only
```bash
./kv-file --host 127.0.0.1 --port 9000
```

### Multiple Storage Drives via Environment Variable
```bash
export OLA_STORAGE_ROOTS="/mnt/ssd/fast:/mnt/hdd/archive"
export OLA_DATA_DIR="/var/lib/kv-file/data"
export OLA_PORT=8866
./kv-file
```
