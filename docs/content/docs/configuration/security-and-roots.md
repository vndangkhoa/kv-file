---
title: "Storage & Security"
description: "Multi-root mounting, strict path sandboxing, and Argon2id authentication"
icon: "shield"
weight: 310
toc: true
---

Ola enforces rigorous filesystem isolation and modern cryptographic standards:

## Multi-Root Storage Mounts

Ola allows mounting independent filesystems under distinct root names:

```bash
./ola --storage-roots "/mnt/photos:/mnt/documents:/mnt/backups"
```

- Each directory is exposed in the sidebar as an independent volume with live storage meters.
- Users can browse, copy, and move items across mounted roots.

## Path Sandboxing & Traversal Defense

- **Canonicalized Path Checking**: Every incoming filesystem path is normalized using `dunce::canonicalize`.
- **Escape Prevention**: Requests with path traversal sequences (`../../etc/passwd`) or symlinks resolving outside the root boundary return `403 Forbidden`.

## Password Hashing: Argon2id

- User credentials are encrypted using **Argon2id** (memory-hard key derivation).
- Prevents GPU and ASIC offline password-cracking attacks.
- Session tokens are tracked securely with automatic timeout.
