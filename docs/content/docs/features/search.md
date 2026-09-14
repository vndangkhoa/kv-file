---
title: "Search & Command Palette"
description: "Instant filesystem searching, live result filtering, and Command Palette (Ctrl+K) workflow"
icon: "search"
weight: 235
toc: true
---

kv-file incorporates a dual-mode search engine designed for rapid navigation across massive storage drives.

---

## 1. Top Search Bar & Search Overlay

Located in the center of the **TitleBar** and accessible anytime:

- **Instant Results View**: When a search query is submitted, kv-file transitions into the **Search Results Overlay**, presenting matching items across your entire filesystem.
- **Contextual Path Indicators**: Each result displays its filename along with its parent path (e.g. `report.pdf in /documents/2026/finance`).
- **Direct Interaction**:
  - **Double-Click Folder**: Instantly navigates to the folder location.
  - **Double-Click Audio**: Plays the audio track immediately in the persistent player bar.
  - **Double-Click Media/File**: Launches the Spacebar Quick Look preview modal.
  - **Right-Click Context Menu**: Allows downloading, sharing, copying, or deleting directly from search results.
- **Clear Search**: Click `Clear Search` or press `Escape` to return to your previous directory view.

---

## 2. Command Palette (`Ctrl + K` or `Cmd + K`)

The Command Palette acts as a global launcher for power users:

```text
┌─────────────────────────────────────────────────────────────┐
│  🔍 Type a command or search files...             [Ctrl+K]  │
├─────────────────────────────────────────────────────────────┤
│  FILES & FOLDERS                                            │
│  📁 Financial_Report_2026.xlsx      /documents/finance/     │
│  🎬 Product_Demo_Final.mp4           /media/videos/          │
│                                                             │
│  QUICK ACTIONS                                              │
│  ⚙️  Toggle Dark Mode                                       │
│  🔀 Switch to macOS Miller Columns View                     │
│  📋 Switch to Windows Detailed List View                    │
│  🪟 Toggle Dual-Pane Split View                    [Alt+S]  │
│  🗑️ Open Recycle Bin                                       │
│  📁 New Folder                               [Ctrl+Shift+N] │
└─────────────────────────────────────────────────────────────┘
```

- **Universal Availability**: Press `Ctrl+K` from any screen, even when inputs or text areas are focused.
- **Fast Fuzzy Matching**: Quickly matches names even with partial or misspelled inputs.
- **Keyboard Execution**: Use `↑` and `↓` arrow keys to navigate and `Enter` to run the selected action or open the file.

---

## 3. Search API Parameters

For automated integrations or custom scripts, kv-file exposes the search endpoint:

<div class="api-endpoint"><span class="badge-method badge-get">GET</span><span class="endpoint-path">/api/v1/fs/search</span></div>

```bash
curl "http://localhost:8866/api/v1/fs/search?q=invoice&root=storage&limit=50"
```


| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `q` | String | *(Required)* | Search query string (case-insensitive substring match). |
| `root` | String | Default Root | Storage root identifier to search within. |
| `limit` | Integer | `100` | Maximum number of matched items returned. |

### Sample Response:
```json
[
  {
    "name": "invoice_september.pdf",
    "path": "documents/invoices/invoice_september.pdf",
    "is_dir": false,
    "size": 425102,
    "human_size": "415.1 KB",
    "modified": 1726300000,
    "media_type": "pdf"
  }
]
```
