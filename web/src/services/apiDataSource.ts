import { FileSystemDataSource } from './dataSource';
import {
  AuthResponse,
  DirectoryListing,
  FileItem,
  Setup2faResponse,
  PublicShareInfo,
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
  async login(username: string, password: string): Promise<AuthResponse> {
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
  async changePassword(current_password: string, new_password: string): Promise<void> {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  },
  async listUsers(): Promise<User[]> {
    return request('/users');
  },
  async createUser(username: string, password: string, role?: string): Promise<User> {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },
  async deleteUser(id: string): Promise<void> {
    await request(`/users/${id}`, { method: 'DELETE' });
  },

  async setup2fa(): Promise<Setup2faResponse> {
    return request('/auth/2fa/setup', { method: 'POST' });
  },
  async enable2fa(code: string): Promise<void> {
    await request('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
  async verifyLogin2fa(pre_auth_token: string, code: string): Promise<AuthResponse> {
    return request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ pre_auth_token, code }),
    });
  },
  async disable2fa(password: string): Promise<void> {
    await request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
  async getSettings(): Promise<Record<string, string>> {
    return request('/settings');
  },
  async updateSettings(settings: Record<string, string>): Promise<void> {
    await request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
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

  async getPublicShareInfo(token: string, password?: string): Promise<PublicShareInfo> {
    const params = new URLSearchParams();
    if (password) params.set('password', password);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/public/share/${token}${qs}`);
  },

  getPublicShareDownloadUrl(token: string, password?: string): string {
    const params = new URLSearchParams();
    if (password) params.set('password', password);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `${BASE_URL}/public/share/${token}/download${qs}`;
  },

  getPublicShareRawUrl(token: string, password?: string): string {
    const params = new URLSearchParams();
    if (password) params.set('password', password);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `${BASE_URL}/public/share/${token}/raw${qs}`;
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
