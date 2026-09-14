---
title: "Database, Backups & Maintenance"
description: "SQLite WAL mode, live database backups, data directory layout, and kernel tuning"
icon: "storage"
weight: 320
toc: true
---

**kv-file** utilizes an embedded **SQLite** database configured in Write-Ahead Logging (WAL) mode for fast, atomic, zero-maintenance state persistence.

---

## 1. Data Directory Structure (`KV_DATA_DIR` / `--data-dir`)

Inside the directory specified by `--data-dir` (default: `./data`), kv-file maintains:

```text
data/
├── kv.db                # Primary SQLite database (users, shares, trash audit)
├── kv.db-wal            # SQLite Write-Ahead Log (active write buffer)
├── kv.db-shm            # SQLite shared-memory index
└── .kv_trash/           # Quarantined soft-deleted files
```

---

## 2. Live Database Backups (Zero Downtime)

Because SQLite runs in **WAL mode**, you can create a consistent backup without stopping the kv-file server or locking user sessions:

```bash
# Using the sqlite3 CLI tool
sqlite3 /opt/kv-file/data/kv.db ".backup '/opt/kv-file/backups/kv_$(date +%Y%m%d).db'"
```

### Automated Nightly Backup Script
Add the following cron script to `/etc/cron.daily/backup-kv-file`:

```bash
#!/bin/bash
BACKUP_DIR="/mnt/backup/kv-file"
DATA_DIR="/opt/kv-file/data"
mkdir -p "$BACKUP_DIR"

# Hot backup database
sqlite3 "$DATA_DIR/kv.db" ".backup '$BACKUP_DIR/kv_$(date +%Y%m%d).db'"

# Remove backups older than 14 days
find "$BACKUP_DIR" -name "kv_*.db" -mtime +14 -delete
```

Ensure the script is executable:
```bash
sudo chmod +x /etc/cron.daily/backup-kv-file
```

---

## 3. Kernel Tuning for Massive Filesystems

If you are managing filesystems containing over 100,000 directories, increase the Linux kernel `inotify` watch limits to ensure the real-time event watcher covers all subfolders:

```bash
# Check current inotify watch limit
cat /proc/sys/fs/inotify/max_user_watches

# Increase limit permanently in /etc/sysctl.d/99-inotify.conf
echo "fs.inotify.max_user_watches = 524288" | sudo tee /etc/sysctl.d/99-inotify.conf
echo "fs.inotify.max_user_instances = 1024" | sudo tee -a /etc/sysctl.d/99-inotify.conf

# Apply sysctl changes immediately
sudo sysctl --system
```

---

## 4. Logging & Diagnostics (`RUST_LOG`)

kv-file leverages the high-performance `tracing` ecosystem. You can adjust log granularity dynamically using the standard `RUST_LOG` environment variable:

```bash
# Standard production logging
export RUST_LOG="kv_file=info,tower_http=info"

# In-depth debugging (displays SQL queries and inotify event details)
export RUST_LOG="kv_file=debug,tower_http=debug"

# Maximum trace verbosity
export RUST_LOG="kv_file=trace,tower_http=trace"
```
