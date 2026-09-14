---
title: "Quick Look & Media Previews"
description: "Spacebar instant previews, HTTP 206 Range video seeking, and persistent audio player"
icon: "visibility"
weight: 220
toc: true
---

kv-file features a built-in media engine that eliminates the need to download files to your local device just to inspect them.

---

## 1. Spacebar Quick Look (`Space`)

Select any file and hit the `Space` bar to bring up an instant, high-speed preview modal (reminiscent of macOS Quick Look). Hit `Space` or `Escape` again to dismiss it.

### Supported File Formats

| Category | File Extensions | Capabilities |
| :--- | :--- | :--- |
| **Video** | `.mp4`, `.webm`, `.mkv`, `.mov` | Hardware-accelerated HTML5 player, instant seek bar, fullscreen toggle. |
| **Audio** | `.mp3`, `.wav`, `.flac`, `.ogg`, `.m4a`, `.aac` | Waveform visualization, volume slider, loop mode. |
| **Images** | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.ico` | High-res rendering, zoom controls, full image inspection. |
| **Code & Config** | `.rs`, `.ts`, `.tsx`, `.js`, `.py`, `.go`, `.json`, `.yaml`, `.toml`, `.css`, `.html`, `.sh` | Syntax highlighting with line numbering and monospaced typography. |
| **Documents** | `.pdf` | Multi-page reader with page navigation and embedded zoom controls. |
| **Markdown** | `.md`, `.markdown` | Rendered GitHub-flavored markdown view with headers, tables, and code snippets. |

---

## 2. Zero-Copy Video Seeking (HTTP `206 Partial Content`)

Large 4K movies or multi-gigabyte video files can be previewed without lag:

- **Byte-Range Streaming**: kv-file's Axum backend natively handles HTTP `Range: bytes=start-end` requests.
- **Zero Buffer Waiting**: Dragging the video timeline scrubber instantly streams bytes from the exact disk offset without buffering preceding chapters or exhausting server RAM.

---

## 3. Persistent Music Player (`AudioPlayerModal`)

Double-clicking any audio track automatically docks a persistent audio player bar at the bottom of the interface:

- **Background Playback**: Music continues playing seamlessly while you browse other folders, upload archives, or manage storage roots.
- **Player Controls**:
  - Track title and format badge.
  - Play / Pause / Seek bar with elapsed and remaining timestamps.
  - Volume slider and Mute button.
  - Close button to stop playback.
