---
title: "Features Overview"
description: "Comprehensive guide to all interface modes, tools, and capabilities in kv-file"
icon: "diamond"
weight: 200
toc: true
---

**kv-file** combines the performance of compiled Rust with the fluid interaction design of modern desktop operating systems.

Below is a complete directory of kv-file's feature suite:

<div class="row mt-4">
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">view_column</i>
        <h5 class="mb-0">Hybrid Views & Split Mode</h5>
      </div>
      <p class="text-muted small mb-3">macOS Miller Columns, Windows Explorer table, Grid thumbnails, and Dual-Pane Split View.</p>
      <a href="/docs/features/views/" class="btn btn-sm btn-primary">View Modes &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">visibility</i>
        <h5 class="mb-0">Quick Look & Media Player</h5>
      </div>
      <p class="text-muted small mb-3">Spacebar instant file previews, Range 206 video scrubbing, and persistent docked audio player.</p>
      <a href="/docs/features/preview-and-media/" class="btn btn-sm btn-primary">Media Previews &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">file_download</i>
        <h5 class="mb-0">Download Manager & ZIP Archiving</h5>
      </div>
      <p class="text-muted small mb-3">Multi-task concurrent downloads, live progress bars, pause/cancel, and streaming on-the-fly ZIP generation.</p>
      <a href="/docs/features/download-manager/" class="btn btn-sm btn-primary">Download Manager &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">keyboard</i>
        <h5 class="mb-0">Tools & Keyboard Shortcuts</h5>
      </div>
      <p class="text-muted small mb-3">Command Palette (Ctrl+K), Ribbon Toolbar, Context Menu, and 20+ desktop hotkey shortcuts.</p>
      <a href="/docs/features/file-operations/" class="btn btn-sm btn-primary">Tools & Shortcuts &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">search</i>
        <h5 class="mb-0">Search & Command Palette</h5>
      </div>
      <p class="text-muted small mb-3">Instant filesystem search, fuzzy matching across mounted roots, and Search Results Overlay.</p>
      <a href="/docs/features/search/" class="btn btn-sm btn-primary">Search Engine &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">sync</i>
        <h5 class="mb-0">Real-Time Inotify Sync</h5>
      </div>
      <p class="text-muted small mb-3">Kernel filesystem watcher broadcasting live changes over WebSockets with zero polling.</p>
      <a href="/docs/features/realtime-sync/" class="btn btn-sm btn-primary">Real-Time Engine &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">share</i>
        <h5 class="mb-0">Public Sharing & Trash Bin</h5>
      </div>
      <p class="text-muted small mb-3">Expiring password-protected share links, soft-delete quarantine, and 1-click restore.</p>
      <a href="/docs/features/sharing-and-trash/" class="btn btn-sm btn-primary">Shares & Trash &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">verified_user</i>
        <h5 class="mb-0">Security & 2FA</h5>
      </div>
      <p class="text-muted small mb-3">Time-based One-Time Passwords (TOTP), recovery backup codes, and Argon2id password encryption.</p>
      <a href="/docs/features/security-and-2fa/" class="btn btn-sm btn-primary">Security & 2FA &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">tune</i>
        <h5 class="mb-0">Settings & Customization</h5>
      </div>
      <p class="text-muted small mb-3">Appearance themes (Dark/Light/System), accent colors, UI density, and disk quotas.</p>
      <a href="/docs/features/settings-customization/" class="btn btn-sm btn-primary">Settings Guide &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">smartphone</i>
        <h5 class="mb-0">Mobile Experience & Touch</h5>
      </div>
      <p class="text-muted small mb-3">Mobile Floating Action Button (FAB), touch gestures, off-canvas drawer, and mobile streaming.</p>
      <a href="/docs/features/mobile-and-touch/" class="btn btn-sm btn-primary">Mobile Experience &rarr;</a>
    </div>
  </div>
</div>

---

## Core Feature Matrix

| Capability | kv-file File Manager | Traditional Web File Managers |
| :--- | :--- | :--- |
| **Browsing Metaphor** | Miller Columns + Windows Explorer Table + Grid | Flat Web Grid only |
| **Dual Pane Mode** | Yes (`Alt+S`, with `F5` / `F6` transfer) | Rarely supported |
| **Instant Preview** | Native `Spacebar` Quick Look + Music Bar | Click to download / external player |
| **Download Manager** | Background multi-task queue + on-the-fly ZIP | Single blocking browser downloads |
| **Filesystem Sync** | Kernel `inotify` + WebSockets (Zero-polling) | Manual page reload required |
| **Video Scrubbing** | HTTP `206 Partial Content` seeking | Must buffer full file |
| **Accidental Deletion** | Soft-Delete Recycle Bin with 1-click restore | Permanent immediate loss |
| **Authentication** | Argon2id + Two-Factor Authentication (TOTP) | Basic MD5/SHA or no 2FA |
| **Mobile Experience** | Dedicated Floating Action Button (FAB) + Gestures | Clunky responsive desktop layout |
| **Binary Footprint** | Single compiled binary (~15MB, embedded UI) | Complex multi-container or PHP/Node setup |
