import { useEffect, useState, useRef } from 'react';
import { useExplorerStore } from '../stores/useExplorerStore';
import { getDataSourceMode } from '../services/api';
import { FsEvent } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const currentRoot = useExplorerStore((state) => state.currentRoot);
  const refresh = useExplorerStore((state) => state.refresh);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const isUnloadingRef = useRef(false);

  useEffect(() => {
    // Track page unload to prevent "connection interrupted" warning in Firefox
    const handleBeforeUnload = () => {
      isUnloadingRef.current = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Page unloading');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // If running in Mock Demo mode, do not open network WebSocket!
    // Instead simulate connected sync state with in-memory reactivity.
    if (getDataSourceMode() === 'mock') {
      setIsConnected(true);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }

    function connect() {
      if (isUnloadingRef.current) return;

      // Max 6 consecutive attempts with exponential backoff before backing off
      if (retryCountRef.current >= 6) {
        setIsConnected(false);
        // Retry gently every 30s in background
        reconnectTimeoutRef.current = setTimeout(() => {
          retryCountRef.current = 0;
          connect();
        }, 30000);
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          retryCountRef.current = 0; // Reset backoff on successful connect
        };

        ws.onmessage = (event) => {
          try {
            const fsEvent: FsEvent = JSON.parse(event.data);
            if (fsEvent.root_name === currentRoot) {
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
              }
              debounceTimeoutRef.current = setTimeout(() => {
                refresh();
              }, 500);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket event:', e);
          }
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          wsRef.current = null;

          // Do not attempt to reconnect if user is navigating away or normal close
          if (isUnloadingRef.current || event.code === 1000) return;

          retryCountRef.current += 1;
          const delay = Math.min(2000 * Math.pow(1.5, retryCountRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        };

        ws.onerror = () => {
          // Browser will trigger onclose after onerror, let onclose handle retry
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (wsRef.current) {
        // Normal closure (code 1000) to prevent Firefox error log on unmount
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Component unmounted');
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [currentRoot, refresh]);

  return { isConnected };
}
