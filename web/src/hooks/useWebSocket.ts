import { useEffect, useState, useRef } from 'react';
import { useExplorerStore } from '../stores/useExplorerStore';
import { FsEvent } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const { currentRoot, refresh } = useExplorerStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const fsEvent: FsEvent = JSON.parse(event.data);
          // If the event corresponds to our active root, auto-refresh view!
          if (fsEvent.root_name === currentRoot) {
            refresh();
          }
        } catch (e) {
          console.error('Failed to parse WebSocket event:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect in 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentRoot, refresh]);

  return { isConnected };
}
