import { FileSystemDataSource } from './dataSource';
import {
  BreadcrumbItem,
  DirectoryListing,
  FileItem,
  MediaType,
  ShareItem,
  StorageRootInfo,
  TrashItem,
  TreeNode,
  User,
} from '../types';
import { formatHumanSize } from '../utils/format';

interface VirtualItem extends FileItem {
  content?: string;
  previewUrl?: string;
}

const INITIAL_ITEMS: VirtualItem[] = [
  // Root level folders
  {
    name: 'documents',
    path: 'documents',
    root_name: 'storage',
    is_dir: true,
    size: 0,
    human_size: '0 B',
    mod_time: new Date().toISOString(),
    extension: '',
    media_type: 'other',
    mime_type: 'directory',
  },
  {
    name: 'media',
    path: 'media',
    root_name: 'storage',
    is_dir: true,
    size: 0,
    human_size: '0 B',
    mod_time: new Date().toISOString(),
    extension: '',
    media_type: 'other',
    mime_type: 'directory',
  },
  {
    name: 'code',
    path: 'code',
    root_name: 'storage',
    is_dir: true,
    size: 0,
    human_size: '0 B',
    mod_time: new Date().toISOString(),
    extension: '',
    media_type: 'other',
    mime_type: 'directory',
  },
  {
    name: 'archives',
    path: 'archives',
    root_name: 'storage',
    is_dir: true,
    size: 0,
    human_size: '0 B',
    mod_time: new Date().toISOString(),
    extension: '',
    media_type: 'other',
    mime_type: 'directory',
  },
  {
    name: 'README.md',
    path: 'README.md',
    root_name: 'storage',
    is_dir: false,
    size: 4200,
    human_size: '4.1 KB',
    mod_time: new Date().toISOString(),
    extension: 'md',
    media_type: 'text',
    mime_type: 'text/markdown',
    content: `# KV Files — Modern Self-Hosted File Manager

Welcome to the KV Files demo!
- Windows Explorer directory tree & address bar
- macOS Finder Miller Columns
- Quick Look preview (press Spacebar)
- Real-time sync & soft-delete trash bin`,
  },

  // Documents folder
  {
    name: 'System_Architecture_v2.pdf',
    path: 'documents/System_Architecture_v2.pdf',
    root_name: 'storage',
    is_dir: false,
    size: 2450000,
    human_size: '2.34 MB',
    mod_time: new Date(Date.now() - 3600000 * 24).toISOString(),
    extension: 'pdf',
    media_type: 'pdf',
    mime_type: 'application/pdf',
    previewUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
  },
  {
    name: 'Q3_Financial_Review.xlsx',
    path: 'documents/Q3_Financial_Review.xlsx',
    root_name: 'storage',
    is_dir: false,
    size: 540000,
    human_size: '527.3 KB',
    mod_time: new Date(Date.now() - 3600000 * 48).toISOString(),
    extension: 'xlsx',
    media_type: 'other',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    name: 'Project_Sprint_Plan.md',
    path: 'documents/Project_Sprint_Plan.md',
    root_name: 'storage',
    is_dir: false,
    size: 14200,
    human_size: '13.8 KB',
    mod_time: new Date(Date.now() - 3600000 * 12).toISOString(),
    extension: 'md',
    media_type: 'text',
    mime_type: 'text/markdown',
    content: `## Sprint 42 Plan
- [x] Rust backend Axum HTTP Range support
- [x] macOS Miller Columns responsive component
- [x] Windows Explorer left sidebar tree
- [ ] Mobile drawer view and gestures`,
  },

  // Media folder
  {
    name: 'Mountain_Sunrise.jpg',
    path: 'media/Mountain_Sunrise.jpg',
    root_name: 'storage',
    is_dir: false,
    size: 4200000,
    human_size: '4.01 MB',
    mod_time: new Date(Date.now() - 3600000 * 5).toISOString(),
    extension: 'jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
  },
  {
    name: 'Tokyo_Neon_Night.jpg',
    path: 'media/Tokyo_Neon_Night.jpg',
    root_name: 'storage',
    is_dir: false,
    size: 6800000,
    human_size: '6.48 MB',
    mod_time: new Date(Date.now() - 3600000 * 18).toISOString(),
    extension: 'jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    previewUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
  },
  {
    name: 'Sample_Nature_Video.mp4',
    path: 'media/Sample_Nature_Video.mp4',
    root_name: 'storage',
    is_dir: false,
    size: 18400000,
    human_size: '17.55 MB',
    mod_time: new Date(Date.now() - 3600000 * 30).toISOString(),
    extension: 'mp4',
    media_type: 'video',
    mime_type: 'video/mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    name: 'Acoustic_Guitar_Theme.mp3',
    path: 'media/Acoustic_Guitar_Theme.mp3',
    root_name: 'storage',
    is_dir: false,
    size: 8500000,
    human_size: '8.11 MB',
    mod_time: new Date(Date.now() - 3600000 * 60).toISOString(),
    extension: 'mp3',
    media_type: 'audio',
    mime_type: 'audio/mpeg',
    previewUrl: 'https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg',
  },

  // Code folder
  {
    name: 'main.rs',
    path: 'code/main.rs',
    root_name: 'storage',
    is_dir: false,
    size: 3200,
    human_size: '3.12 KB',
    mod_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    extension: 'rs',
    media_type: 'code',
    mime_type: 'text/x-rust',
    content: `// KV Files — Rust Entrypoint
use axum::Router;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("KV Files backend initialized!");
    Ok(())
}`,
  },
  {
    name: 'App.tsx',
    path: 'code/App.tsx',
    root_name: 'storage',
    is_dir: false,
    size: 4500,
    human_size: '4.39 KB',
    mod_time: new Date(Date.now() - 3600000 * 1).toISOString(),
    extension: 'tsx',
    media_type: 'code',
    mime_type: 'text/typescript',
    content: `import React from 'react';

export const App = () => {
  return <div>KV Files File Manager</div>;
};`,
  },
  {
    name: 'Cargo.toml',
    path: 'code/Cargo.toml',
    root_name: 'storage',
    is_dir: false,
    size: 980,
    human_size: '980 B',
    mod_time: new Date(Date.now() - 3600000 * 4).toISOString(),
    extension: 'toml',
    media_type: 'code',
    mime_type: 'text/plain',
    content: `[package]
name = "kv-files"
version = "2.0.0"
edition = "2021"`,
  },

  // Archives folder
  {
    name: 'Release_Assets_2026.zip',
    path: 'archives/Release_Assets_2026.zip',
    root_name: 'storage',
    is_dir: false,
    size: 148900000,
    human_size: '142.0 MB',
    mod_time: new Date(Date.now() - 3600000 * 72).toISOString(),
    extension: 'zip',
    media_type: 'archive',
    mime_type: 'application/zip',
  },
];

class MockFileSystem implements FileSystemDataSource {
  isMock = true;
  private items: VirtualItem[] = [...INITIAL_ITEMS];
  private trash: TrashItem[] = [
    {
      id: 'trash-1',
      root_name: 'storage',
      original_path: 'documents/old_draft_spec.txt',
      trash_name: 'old_draft_spec.txt',
      size: 1200,
      human_size: '1.17 KB',
      is_dir: false,
      deleted_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
  private shares: ShareItem[] = [
    {
      id: 'share-1',
      token: 'demo8866share',
      root_name: 'storage',
      path: 'documents/System_Architecture_v2.pdf',
      is_dir: false,
      has_password: false,
      view_count: 14,
      allow_download: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  async checkSetup(): Promise<{ is_initialized: boolean }> {
    return { is_initialized: true };
  }

  async initialSetup(username: string): Promise<{ success: boolean; token: string; user: User }> {
    const user: User = { id: 'mock-admin', username, role: 'admin', created_at: new Date().toISOString() };
    return { success: true, token: 'mock-token', user };
  }

  async login(username: string): Promise<{ success: boolean; token: string; user: User }> {
    const user: User = { id: 'mock-user', username: username || 'demo_admin', role: 'admin', created_at: new Date().toISOString() };
    return { success: true, token: 'mock-token', user };
  }

  async getMe(): Promise<User> {
    return { id: 'mock-user', username: 'demo_admin', role: 'admin', created_at: new Date().toISOString() };
  }

  async logout(): Promise<void> {}

  async getRoots(): Promise<StorageRootInfo[]> {
    return [
      {
        name: 'storage',
        path: '/mnt/storage',
        total_bytes: 1000 * 1024 * 1024 * 1024,
        free_bytes: 820 * 1024 * 1024 * 1024,
        used_bytes: 180 * 1024 * 1024 * 1024,
      },
      {
        name: 'backup_drive',
        path: '/mnt/backup',
        total_bytes: 4000 * 1024 * 1024 * 1024,
        free_bytes: 1850 * 1024 * 1024 * 1024,
        used_bytes: 2150 * 1024 * 1024 * 1024,
      },
    ];
  }

  async listDirectory(root: string, path: string): Promise<DirectoryListing> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const directChildren = this.items.filter((item) => {
      if (item.root_name !== root) return false;
      const itemParent = item.path.includes('/')
        ? item.path.substring(0, item.path.lastIndexOf('/'))
        : '';
      return itemParent === cleanPath;
    });

    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '' }];
    if (cleanPath) {
      let acc = '';
      for (const seg of cleanPath.split('/')) {
        acc = acc ? `${acc}/${seg}` : seg;
        breadcrumbs.push({ name: seg, path: acc });
      }
    }

    const totalFolders = directChildren.filter((i) => i.is_dir).length;
    const totalFiles = directChildren.filter((i) => !i.is_dir).length;
    const totalSize = directChildren.reduce((acc, i) => acc + i.size, 0);

    return {
      root_name: root,
      current_path: cleanPath,
      breadcrumbs,
      items: directChildren,
      total_items: directChildren.length,
      total_folders: totalFolders,
      total_files: totalFiles,
      total_size: totalSize,
    };
  }

  async getTree(root: string, path: string = '', depth: number = 2): Promise<TreeNode> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const name = cleanPath.includes('/')
      ? cleanPath.substring(cleanPath.lastIndexOf('/') + 1)
      : cleanPath || root;

    const node: TreeNode = {
      name,
      path: cleanPath,
      root_name: root,
      has_children: false,
    };

    if (depth > 0) {
      const children = this.items.filter((i) => {
        if (!i.is_dir || i.root_name !== root) return false;
        const parent = i.path.includes('/') ? i.path.substring(0, i.path.lastIndexOf('/')) : '';
        return parent === cleanPath;
      });

      if (children.length > 0) {
        node.has_children = true;
        node.children = await Promise.all(
          children.map((c) => this.getTree(root, c.path, depth - 1))
        );
      }
    }

    return node;
  }

  async createFolder(root: string, path: string): Promise<void> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const name = cleanPath.includes('/') ? cleanPath.substring(cleanPath.lastIndexOf('/') + 1) : cleanPath;

    this.items.push({
      name,
      path: cleanPath,
      root_name: root,
      is_dir: true,
      size: 0,
      human_size: '0 B',
      mod_time: new Date().toISOString(),
      extension: '',
      media_type: 'other',
      mime_type: 'directory',
    });
  }

  async renameItem(root: string, path: string, new_name: string): Promise<void> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const item = this.items.find((i) => i.root_name === root && i.path === cleanPath);
    if (!item) throw new Error('Item not found');

    const parent = cleanPath.includes('/') ? cleanPath.substring(0, cleanPath.lastIndexOf('/')) : '';
    const newPath = parent ? `${parent}/${new_name}` : new_name;

    item.name = new_name;
    item.path = newPath;
    item.mod_time = new Date().toISOString();
  }

  async copyItem(root: string, source: string, destination: string): Promise<void> {
    const item = this.items.find((i) => i.root_name === root && i.path === source);
    if (!item) throw new Error('Source not found');

    const newPath = destination ? `${destination}/${item.name}` : item.name;
    this.items.push({
      ...item,
      path: newPath,
      mod_time: new Date().toISOString(),
    });
  }

  async moveItem(root: string, source: string, destination: string): Promise<void> {
    const item = this.items.find((i) => i.root_name === root && i.path === source);
    if (!item) throw new Error('Source not found');

    const newPath = destination ? `${destination}/${item.name}` : item.name;
    item.path = newPath;
    item.mod_time = new Date().toISOString();
  }

  async deleteItem(root: string, path: string, permanent: boolean = false): Promise<void> {
    const idx = this.items.findIndex((i) => i.root_name === root && i.path === path);
    if (idx === -1) return;

    const [deleted] = this.items.splice(idx, 1);
    if (!permanent) {
      this.trash.push({
        id: `trash-${Date.now()}`,
        root_name: root,
        original_path: deleted.path,
        trash_name: deleted.name,
        size: deleted.size,
        human_size: deleted.human_size,
        is_dir: deleted.is_dir,
        deleted_at: new Date().toISOString(),
      });
    }
  }

  async searchItems(root: string, q: string): Promise<FileItem[]> {
    const lower = q.toLowerCase();
    return this.items.filter((i) => i.root_name === root && i.name.toLowerCase().includes(lower));
  }

  async uploadFiles(root: string, path: string, files: File[]): Promise<void> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    for (const file of files) {
      const targetPath = cleanPath ? `${cleanPath}/${file.name}` : file.name;
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1) : '';

      this.items.push({
        name: file.name,
        path: targetPath,
        root_name: root,
        is_dir: false,
        size: file.size,
        human_size: formatHumanSize(file.size),
        mod_time: new Date().toISOString(),
        extension: ext,
        media_type: MediaTypeFromExt(ext),
        mime_type: file.type || 'application/octet-stream',
      });
    }
  }

  async listTrash(): Promise<TrashItem[]> {
    return [...this.trash];
  }

  async restoreTrash(id: string): Promise<void> {
    const idx = this.trash.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const [restored] = this.trash.splice(idx, 1);
    const name = restored.trash_name;
    const ext = name.includes('.') ? name.substring(name.lastIndexOf('.') + 1) : '';

    this.items.push({
      name,
      path: restored.original_path,
      root_name: restored.root_name,
      is_dir: restored.is_dir,
      size: restored.size,
      human_size: restored.human_size,
      mod_time: new Date().toISOString(),
      extension: ext,
      media_type: MediaTypeFromExt(ext),
      mime_type: 'application/octet-stream',
    });
  }

  async purgeTrash(id: string): Promise<void> {
    this.trash = this.trash.filter((t) => t.id !== id);
  }

  async emptyTrash(): Promise<void> {
    this.trash = [];
  }

  async listShares(): Promise<ShareItem[]> {
    return [...this.shares];
  }

  async createShare(
    root: string,
    path: string,
    is_dir: boolean,
    password?: string,
    expires_at?: string,
    allow_download: boolean = true
  ): Promise<ShareItem> {
    const share: ShareItem = {
      id: `share-${Date.now()}`,
      token: `demo_${Math.random().toString(36).substring(2, 10)}`,
      root_name: root,
      path,
      is_dir,
      has_password: Boolean(password),
      expires_at,
      view_count: 0,
      allow_download,
      created_at: new Date().toISOString(),
    };
    this.shares.push(share);
    return share;
  }

  async deleteShare(id: string): Promise<void> {
    this.shares = this.shares.filter((s) => s.id !== id);
  }

  getRawFileUrl(root: string, path: string): string {
    const item = this.items.find((i) => i.root_name === root && i.path === path);
    if (item?.previewUrl) return item.previewUrl;
    return `/api/v1/fs/raw?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`;
  }

  getDownloadUrl(root: string, path: string): string {
    return `/api/v1/fs/download?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`;
  }
}

function MediaTypeFromExt(ext: string): MediaType {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'image';
    case 'mp4':
    case 'mov':
    case 'webm':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'audio';
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'md':
      return 'text';
    case 'rs':
    case 'ts':
    case 'tsx':
    case 'js':
    case 'toml':
    case 'json':
      return 'code';
    case 'zip':
    case 'tar':
    case 'gz':
      return 'archive';
    default:
      return 'other';
  }
}

export const mockDataSource: FileSystemDataSource = new MockFileSystem();
