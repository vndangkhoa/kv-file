---
title: "Hybrid Views & Split Mode"
description: "macOS Miller Columns, Windows Explorer Table, Grid View, and Dual-Pane Split Mode"
icon: "view_column"
weight: 210
toc: true
---

kv-file brings desktop-grade file organization to the browser by supporting four specialized browsing modes.

---

## 1. macOS Finder Miller Columns (`viewMode: columns`)

Inspired by NeXTSTEP and macOS Finder, Miller columns arrange your directory tree in horizontal cascading columns:

- **Cascading Exploration**: Clicking a folder automatically appends a new column to the right and smoothly scrolls the viewport horizontally.
- **Terminal Inspector Preview**: Selecting a file in the final column renders an instant Inspector pane displaying file dimensions, MIME type, modified timestamp, and action buttons.
- **Keyboard Navigation**: Navigate the filesystem entirely with the keyboard:
  - `↑` / `↓`: Move selection up and down within the active column.
  - `→`: Open child folder and jump focus to the new column.
  - `←`: Jump focus back to the parent column.
  - `Enter`: Open file or trigger preview.

---

## 2. Windows Explorer Detailed List (`viewMode: list`)

The Detailed List view delivers the traditional Windows Explorer table layout:

- **Multi-Column Sorting**: Click any header (`Name`, `Date Modified`, `Size`, `Type`) to toggle ascending or descending sorting.
- **Range & Multi-Selection**:
  - `Click`: Select a single item.
  - `Ctrl + Click`: Toggle selection on individual items.
  - `Shift + Click`: Select a continuous block of files.
  - `Ctrl + A`: Select all items in the active directory.
- **Inline Renaming**: Press `F2` or click the filename to rename files in place without opening a dialog.

---

## 3. Large Thumbnail Grid View (`viewMode: grid`)

Optimized for browsing media, photo libraries, and visual assets:

- **Rich Previews**: Generates fast image and video thumbnails on the fly.
- **Fluid Responsive Layout**: Automatically adjusts card sizes to fill screen width cleanly.
- **Keyboard Navigation**: Arrow keys navigate the 2D grid smoothly.

---

## 4. Dual-Pane Split View (`Alt + S`)

For heavy file management workflows (copying, moving, and organizing files across disks), kv-file includes a full dual-pane Commander view:

- **Toggle Shortcut**: Press `Alt + S` to split the viewport into two independent panels.
- **Independent Mounts**: The left and right panels can browse completely different storage roots or subdirectories.
- **One-Key File Transfer**:
  - `F5`: Instantly copy selected items from the active pane to the target pane.
  - `F6`: Instantly move selected items from the active pane to the target pane.
- **Active Focus Indicator**: A subtle accent border highlights whichever pane currently holds keyboard focus.

---

## 5. Dual Address Bar (`Ctrl + L`)

Located directly above the main file viewport:

- **Clickable Breadcrumbs**: Click any parent folder in the breadcrumb trail to navigate upward immediately.
- **Editable Path Hotkey (`Ctrl + L`)**: Press `Ctrl + L` to toggle the address bar into a raw text input. Type or paste any path (e.g., `/documents/reports/2026/`) and press `Enter` to jump directly.
