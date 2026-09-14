---
title: "Settings & Customization"
description: "Appearance themes, UI density, Explorer behaviors, storage quota visualizers, and user preferences"
icon: "tune"
weight: 260
toc: true
---

**kv-file** provides a centralized **Settings Modal** (`SettingsModal.tsx`) organized into 5 dedicated configuration tabs.

---

## 1. Appearance Tab (`AppearanceTab`)

Tailor the look and feel of the interface to match your desktop environment:

- **Interface Themes**:
  - 🌙 **Dark Mode**: Sleek dark slate palette optimized for low-light environments and OLED displays.
  - ☀️ **Light Mode**: Crisp, high-contrast Windows 11 / macOS Finder-inspired theme.
  - 🖥️ **System Default**: Automatically synchronizes with your operating system's dark/light schedule.
- **Display Density**:
  - **Comfortable**: Generous spacing, larger icons, touch-friendly tap targets.
  - **Compact**: Tighter row height, reduced padding, maximum visible files per screen for power users.
- **Accent Colors**: Choose your brand accent (`Blue`, `Emerald`, `Purple`, `Amber`, `Rose`).

---

## 2. Explorer Tab (`ExplorerTab`)

Configure default browsing and interaction behaviors:

- **Default View Mode**: Set whether kv-file opens in **Miller Columns**, **Detailed List**, or **Large Grid** on initial load.
- **Show Hidden Files (Dotfiles)**: Toggle visibility of Unix hidden files (e.g. `.env`, `.gitignore`, `.config`).
- **Safety Confirmations**: Toggle confirmation dialogs before emptying the Recycle Bin or permanently unlinking files.
- **Double-Click Action**: Choose whether double-clicking a file immediately downloads it or opens the Spacebar Quick Look preview.

---

## 3. Storage Tab (`StorageTab`)

Live telemetry on mounted disks and partitions:

- **Storage Meter**: Visual progress bar depicting used versus free capacity across all mounted storage roots.
- **Quota Warnings**: Alerts when disk usage exceeds 85% or 95% capacity.
- **Mount Point Paths**: Displays canonical filesystem paths (e.g. `/mnt/storage`, `/data/media`) for administrators.

---

## 4. Account Tab (`AccountTab`)

Manage identity, security, and authentication:

- **Change Password**: Update credentials with instant Argon2id re-hashing.
- **Two-Factor Authentication (2FA)**: Launch the TOTP setup wizard or view 2FA protection status.
- **Active Sessions**: View current login session and security tokens.

---

## 5. About & Diagnostics Tab (`AboutTab`)

System telemetry and build diagnostics:
- Installed **kv-file** version and build hash.
- Rust Axum backend runtime status and SQLite database size.
- Links to open-source repository, documentation, and release notes.
