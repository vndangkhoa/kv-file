import { FileSystemDataSource } from './dataSource';
import {
  DirectoryListing,
  FileItem,
  ShareItem,
  StorageRootInfo,
  TrashItem,
  TreeNode,
  User,
} from '../types';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const apiDataSource: FileSystemDataSource = {
  isMock: false,

  async checkSetup(): Promise<{ is_initialized: boolean }> {
    return request('/auth/setup-status');
  },
  async initialSetup(username: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    return request('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async getMe(): Promise<User> {
    return request('/auth/me');
  },
  async logout(): Promise<void> {
    return request('/auth/logout', { method: 'POST' });
  },

  async getRoots(): Promise<StorageRootInfo[]> {
    return request('/fs/roots');
  },
  async listDirectory(root: string, path: string): Promise<DirectoryListing> {
    const params = new URLSearchParams({ root, path });
    return request(`/fs/list?${params.toString()}`);
  },
  async getTree(root: string, path: string = '', depth: number = 2): Promise<TreeNode> {
    const params = new URLSearchParams({ root, path, depth: depth.toString() });
    return request(`/fs/tree?${params.toString()}`);
  },
  async createFolder(root: string, path: string): Promise<void> {
    return request('/fs/folder', {
      method: 'POST',
      body: JSON.stringify({ root, path }),
    });
  },
  async renameItem(root: string, path: string, new_name: string): Promise<void> {
    return request('/fs/rename', {
      method: 'POST',
      body: JSON.stringify({ root, path, new_name }),
    });
  },
  async copyItem(root: string, source: string, destination: string): Promise<void> {
    return request('/fs/copy', {
      method: 'POST',
      body: JSON.stringify({ root, source, destination }),
    });
  },
  async moveItem(root: string, source: string, destination: string): Promise<void> {
    return request('/fs/move', {
      method: 'POST',
      body: JSON.stringify({ root, source, destination }),
    });
  },
  async deleteItem(root: string, path: string, permanent: boolean = false): Promise<void> {
    const params = new URLSearchParams({ root, path, permanent: permanent.toString() });
    return request(`/fs/item?${params.toString()}`, { method: 'DELETE' });
  },
  async searchItems(root: string, q: string): Promise<FileItem[]> {
    const params = new URLSearchParams({ root, q });
    return request(`/fs/search?${params.toString()}`);
  },
  async uploadFiles(
    root: string,
    path: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const formData = new FormData();
    formData.append('root', root);
    formData.append('path', path);
    for (const file of files) {
      formData.append('file', file);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/fs/upload`);
      xhr.withCredentials = true;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.send(formData);
    });
  },

  async listTrash(): Promise<TrashItem[]> {
    return request('/trash/list');
  },
  async restoreTrash(id: string): Promise<void> {
    return request('/trash/restore', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
  async purgeTrash(id: string): Promise<void> {
    return request(`/trash/purge?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  async emptyTrash(): Promise<void> {
    return request('/trash/empty', { method: 'DELETE' });
  },

  async listShares(): Promise<ShareItem[]> {
    return request('/shares');
  },
  async createShare(
    root: string,
    path: string,
    is_dir: boolean,
    password?: string,
    expires_at?: string,
    allow_download: boolean = true
  ): Promise<ShareItem> {
    return request('/shares', {
      method: 'POST',
      body: JSON.stringify({
        root,
        path,
        is_dir,
        password: password || undefined,
        expires_at: expires_at || undefined,
        allow_download,
      }),
    });
  },
  async deleteShare(id: string): Promise<void> {
    return request(`/shares?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  getRawFileUrl(root: string, path: string): string {
    const params = new URLSearchParams({ root, path });
    return `${BASE_URL}/fs/raw?${params.toString()}`;
  },
  getDownloadUrl(root: string, path: string): string {
    const params = new URLSearchParams({ root, path });
    return `${BASE_URL}/fs/download?${params.toString()}`;
  },
};
