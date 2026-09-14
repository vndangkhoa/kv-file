---
title: "Documentation"
description: "High-performance self-hosted file manager with Windows Explorer and macOS Miller Columns UI"
icon: "article"
toc: true
weight: 10
---

**Ola** is a high-performance, single-binary, self-hosted web file manager built with a **Rust (Axum + Tokio)** backend and a **React + Tailwind CSS** frontend. It fuses the familiar hierarchical directory tree and path navigation of **Windows Explorer** with the cascading **Miller Columns** and **Quick Look** of **macOS Finder**.

Ola delivers full feature parity with **FileBrowser Quantum** while adding next-generation capabilities including real-time kernel filesystem watching, soft-delete trash restoration, and streaming HTTP Range seeking.

---

## Quick Navigation

<div class="row mt-4">
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">rocket_launch</i>
        <h5 class="mb-0">Getting Started</h5>
      </div>
      <p class="text-muted small mb-3">Quickstart guide, Docker containers, and source installation.</p>
      <a href="/docs/getting-started/" class="btn btn-sm btn-primary">Start Here &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">diamond</i>
        <h5 class="mb-0">Features</h5>
      </div>
      <p class="text-muted small mb-3">Miller columns, dual-view modes, real-time inotify, and public shares.</p>
      <a href="/docs/features/" class="btn btn-sm btn-primary">Explore Features &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">settings</i>
        <h5 class="mb-0">Configuration</h5>
      </div>
      <p class="text-muted small mb-3">Environment variables, multi-root mounts, and Argon2id security.</p>
      <a href="/docs/configuration/" class="btn btn-sm btn-primary">Configure &rarr;</a>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card p-3 h-100 border">
      <div class="d-flex align-items-center mb-2">
        <i class="material-icons text-primary me-2">terminal</i>
        <h5 class="mb-0">API Reference</h5>
      </div>
      <p class="text-muted small mb-3">Complete REST endpoints catalog and live WebSocket subscription streams.</p>
      <a href="/docs/api/" class="btn btn-sm btn-primary">API Specs &rarr;</a>
    </div>
  </div>
</div>

---

## Architectural Overview

- **Backend Runtime**: High-throughput asynchronous engine powered by [Axum](https://github.com/tokio-rs/axum) and [Tokio](https://tokio.rs).
- **Embedded Database**: Local metadata, public share links, and trash bin state are stored in an embedded [SQLite](https://www.sqlite.org/) instance via `rusqlite` with WAL mode.
- **Kernel Watcher**: Real-time Linux `inotify` watches filesystem directories and broadcasts changes to all active browsers via WebSockets without polling.
- **Single-Binary Packaging**: The web application is bundled directly into the executable using `rust-embed`.
- **Zero-Trust Security**: Strict path canonicalization prevents path-escape attacks (`../../etc/passwd`), and passwords are protected by Argon2id key derivation.
