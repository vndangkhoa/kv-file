---
title: "WebSocket Stream API"
description: "Real-time filesystem push notifications over WebSockets with JavaScript and Python client examples"
icon: "cable"
weight: 440
toc: true
---

Clients establish a persistent WebSocket connection to receive real-time push events whenever files are created, modified, renamed, or deleted on disk.

- **WebSocket Endpoint**: `ws://<server-host>:8866/api/v1/ws`
- **Protocol**: JSON-encoded events

---

## 1. Event Payload Schema

```json
{
  "type": "fs_change",
  "action": "create",
  "root": "storage",
  "path": "documents/report.pdf",
  "size": 1843200,
  "modified": 1726300000
}
```

### Action Types
| Action | Description |
| :--- | :--- |
| `create` | A new file or directory was created. |
| `modify` | An existing file's contents were modified. |
| `delete` | An item was removed or unlinked. |
| `rename` | An item was moved or renamed. |

---

## 2. JavaScript / TypeScript Client

```javascript
const wsUrl = `ws://${window.location.host}/api/v1/ws`;
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
  console.log("Connected to kv-file live event stream");
};

socket.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log(`[EVENT] ${payload.action.toUpperCase()}: ${payload.root}:/${payload.path}`);

  // Trigger UI directory refresh
  if (payload.path.startsWith(currentDirectory)) {
    refreshDirectory();
  }
};

socket.onclose = () => {
  console.warn("WebSocket disconnected. Retrying in 2s...");
  setTimeout(connectWebSocket, 2000);
};
```

---

## 3. Python Client (`websockets`)

```python
import asyncio
import json
import websockets

async def watch_filesystem():
    uri = "ws://localhost:8866/api/v1/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to kv-file WebSocket stream")
        while True:
            raw_message = await websocket.recv()
            event = json.loads(raw_message)
            print(f"[{event['action'].upper()}] Root: {event['root']} -> Path: {event['path']}")

if __name__ == "__main__":
    asyncio.run(watch_filesystem())
```
