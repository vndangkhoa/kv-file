import { create } from 'zustand';
import { FileItem } from '../types';
import { api } from '../services/api';

export interface DownloadTask {
  id: string;
  name: string;
  path: string;
  root: string;
  totalBytes: number;
  loadedBytes: number;
  progress: number; // 0 to 100
  speedMBps: number;
  etaSeconds: number;
  status: 'downloading' | 'completed' | 'canceled' | 'error';
  error?: string;
  startedAt: number;
  abortController?: AbortController;
}

interface DownloadState {
  tasks: DownloadTask[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  startDownload: (root: string, item: FileItem) => Promise<void>;
  cancelDownload: (id: string) => void;
  clearCompleted: () => void;
  retryDownload: (id: string) => void;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  tasks: [],
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),

  startDownload: async (root: string, item: FileItem) => {
    const taskId = `dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const abortController = new AbortController();
    const downloadFilename = item.is_dir
      ? (item.name.endsWith('.zip') ? item.name : `${item.name}.zip`)
      : item.name;

    const initialTask: DownloadTask = {
      id: taskId,
      name: downloadFilename,
      path: item.path,
      root,
      totalBytes: item.size || (item.is_dir ? 5 * 1024 * 1024 : 1024 * 1024),
      loadedBytes: 0,
      progress: 0,
      speedMBps: 0,
      etaSeconds: 0,
      status: 'downloading',
      startedAt: Date.now(),
      abortController,
    };

    set((state) => ({
      tasks: [initialTask, ...state.tasks],
      isOpen: true, // Automatically show download floater
    }));

    try {
      const downloadUrl = api.getDownloadUrl(root, item.path);

      // Stream with ReadableStream & progress tracking
      const response = await fetch(downloadUrl, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : item.size || 1024 * 1024;

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback to direct blob
        const blob = await response.blob();
        triggerBrowserSave(blob, item.name);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, progress: 100, loadedBytes: total, status: 'completed', etaSeconds: 0 }
              : t
          ),
        }));
        return;
      }

      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];
      const startTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const speedMBps = elapsedSeconds > 0 ? (receivedBytes / (1024 * 1024)) / elapsedSeconds : 0;
        const progress = Math.min(Math.round((receivedBytes / total) * 100), 99);
        const remainingBytes = Math.max(0, total - receivedBytes);
        const etaSeconds = speedMBps > 0 ? Math.round(remainingBytes / (speedMBps * 1024 * 1024)) : 0;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  loadedBytes: receivedBytes,
                  progress,
                  speedMBps: Math.round(speedMBps * 10) / 10,
                  etaSeconds,
                }
              : t
          ),
        }));
      }

      // Assemble all chunks into final blob
      const combinedBlob = new Blob(chunks as BlobPart[], {
        type: item.is_dir ? 'application/zip' : item.mime_type || 'application/octet-stream',
      });
      triggerBrowserSave(combinedBlob, downloadFilename);

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                loadedBytes: total,
                progress: 100,
                status: 'completed',
                etaSeconds: 0,
              }
            : t
        ),
      }));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'canceled', etaSeconds: 0 } : t
          ),
        }));
      } else {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'error', error: err.message, etaSeconds: 0 }
              : t
          ),
        }));
      }
    }
  },

  cancelDownload: (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task && task.status === 'downloading') {
      task.abortController?.abort();
    }
  },

  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status === 'downloading'),
    }));
  },

  retryDownload: (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    get().startDownload(task.root, {
      name: task.name,
      path: task.path,
      root_name: task.root,
      is_dir: false,
      size: task.totalBytes,
      human_size: '',
      mod_time: '',
      extension: '',
      media_type: 'other',
      mime_type: 'application/octet-stream',
    });
  },
}));

function triggerBrowserSave(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
