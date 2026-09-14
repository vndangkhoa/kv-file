---
title: "Mobile Experience & Touch Controls"
description: "Mobile-responsive design, Floating Action Button (FAB), touch gestures, and mobile media playback"
icon: "smartphone"
weight: 265
toc: true
---

**kv-file** is engineered from the ground up to feel like a native mobile app when accessed from smartphones and tablets, with no app store download required.

---

## 1. Mobile Floating Action Button (FAB)

On screens narrower than 768px (smartphones and small tablets), the top desktop ribbon collapses and is replaced by the **Mobile Floating Action Button** (`MobileFloatingActionButton.tsx`):

- **Floating Trigger (+)**: Anchored conveniently in the lower-right corner for easy one-handed thumb access.
- **Radial Action Sheet**: Tapping the button dims the background and reveals a quick action menu:
  - 📁 **New Folder**: Instantly name and create directories.
  - 📤 **Upload**: Direct file picker supporting mobile cameras and photo libraries.
  - 📋 **Paste**: One-tap clipboard pasting if items have been copied or cut.
  - 🔍 **Search & Commands**: Instant fuzzy search across storage roots.
  - 🔀 **View Switcher**: Quick toggle between Mobile List, Grid, and Columns.
  - 🔄 **Refresh**: Immediate directory re-sync.

---

## 2. Off-Canvas Sidebar Drawer

- **Hamburger Menu Toggle**: Tapping the menu icon in the mobile header slides out the full storage roots tree.
- **Storage Meters**: Tap on any storage volume to switch directories smoothly.
- **Auto-Dismiss**: Selecting a destination or tapping the backdrop automatically closes the drawer, restoring maximum screen space for file browsing.

---

## 3. Touch Gestures & Interactions

| Gesture | Action |
| :--- | :--- |
| **Tap** | Select item and reveal action bar. |
| **Double-Tap** | Open folder or launch file preview. |
| **Long-Press (500ms)** | Open right-click context menu (Share, Rename, Delete, Download). |
| **Horizontal Swipe** | In Miller Columns, swipe left and right to navigate parent and child folders. |

---

## 4. Mobile Quick Look & Media Streaming

- **Responsive Previews**: Images, PDFs, and code viewports automatically adapt to screen dimensions.
- **Native Video Fullscreen**: Videos previewed with the Spacebar Quick Look modal support iOS and Android native fullscreen and picture-in-picture modes.
- **Docked Mobile Audio Bar**: The music player docks unobtrusively above the bottom navigation, allowing uninterrupted audio playback while navigating the filesystem on the go.
