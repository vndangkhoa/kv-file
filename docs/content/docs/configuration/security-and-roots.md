---
title: "Storage Roots & Security Hardening"
description: "Multi-root volume mounting, strict dunce sandboxing, directory traversal defense, and Argon2id cryptography"
icon: "shield"
weight: 310
toc: true
---

**kv-file** enforces rigorous filesystem isolation, zero-trust path sandboxing, and modern cryptographic defense to protect self-hosted storage.

---

## 1. Multi-Root Storage Mounts

kv-file allows mounting multiple independent physical disks, partitions, or folders simultaneously under custom volume aliases:

```bash
# Mounting with explicit volume aliases: alias:path
./kv-file --storage-roots "photos:/mnt/fast_nvme/photos:documents:/mnt/nas/docs:backups:/mnt/cold_storage"
```

```
┌─────────────────────────────────────────────────────────────┐
│                       Sidebar Tree                          │
├─────────────────────────────────────────────────────────────┤
│  📁 STORAGE ROOTS                                           │
│  ├── 📷 photos          [====......] 42% (210 GB free)      │
│  ├── 📄 documents       [========..] 78% (15 GB free)       │
│  └── 💾 backups         [==........] 19% (1.2 TB free)      │
└─────────────────────────────────────────────────────────────┘
```

- **Independent Disk Gauges**: Each root volume reports its own total, used, and available disk capacity live.
- **Cross-Root Transfers**: Users can drag and drop, copy (`F5`), or move (`F6`) files smoothly across different physical drives.
- **Independent Inotify Watchers**: An independent OS filesystem watcher is attached to each mounted root.

---

## 2. Path Sandboxing & Traversal Defense

File managers accessible over the internet are prime targets for directory traversal attacks. kv-file employs multi-stage path sandboxing:

```
┌─────────────────────────────────────────────────────────────┐
│                    Incoming API Request                     │
│               GET /api/v1/fs/raw?path=../../etc/shadow      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Normalization
┌──────────────────────────────▼──────────────────────────────┐
│                  dunce::canonicalize()                      │
│            Resolves all '..' and symlink pointers           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Boundary Check
┌──────────────────────────────▼──────────────────────────────┐
│         canonical_path.starts_with(canonical_root)          │
└──────────────────────────────┬──────────────────────────────┘
                 ┌─────────────┴─────────────┐
                 │ True                      │ False
        ┌────────▼────────┐         ┌────────▼────────┐
        │  Permit Access  │         │  403 Forbidden  │
        └─────────────────┘         └─────────────────┘
```

### Defense Mechanisms
1. **Dunce Normalization**: Incoming relative paths are joined with the root directory and canonicalized with `dunce::canonicalize`.
2. **Prefix Boundary Assertion**: The backend verifies `canonical_target.starts_with(&canonical_root)`. If a path resolves outside the root boundary, kv-file immediately returns `403 Forbidden` and logs a security warning.
3. **Symbolic Link Policy**:
   - Internal symlinks (pointing within the root volume) are safely resolved.
   - External symlinks (symlinks intentionally pointing to `/etc`, `/root`, or `/var`) are blocked by the boundary check.
4. **Hidden Dotfiles**: Dotfiles (`.env`, `.ssh`, `.git`) are hidden from directory listings by default unless explicitly toggled on by an authenticated administrator.

---

## 3. Cryptography & Password Security: Argon2id

User passwords and public share passcodes are protected with **Argon2id** (RFC 9106):

- **Memory-Hard Defense**: Configured with high memory cost parameters to neutralize GPU and ASIC hardware password cracking.
- **Cryptographic Salting**: Every password uses a unique, cryptographically random 128-bit salt generated via the OS CSPRNG (`rand::thread_rng`).
- **Timing Attack Resistance**: Password comparisons are performed in constant time, preventing side-channel timing analysis.

---

## 4. Session Hardening

- **High-Entropy Tokens**: Authentication sessions issue 128-bit UUID v4 tokens.
- **Cookie Flags**: When running with HTTPS/SSL, cookies automatically include `HttpOnly`, `SameSite=Strict`, and `Secure` attributes.
- **Immediate Invalidation**: Calling `/api/v1/auth/logout` unlinks the session from SQLite and in-memory caches instantly.
