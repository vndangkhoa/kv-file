import { FileSystemDataSource } from './dataSource';
import {
  AuthResponse,
  BreadcrumbItem,
  DirectoryListing,
  FileItem,
  MediaType,
  Setup2faResponse,
  PublicShareInfo,
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
    previewUrl: '/media/system_architecture.pdf',
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
    media_type: 'spreadsheet',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    name: 'Annual_Product_Strategy.docx',
    path: 'documents/Annual_Product_Strategy.docx',
    root_name: 'storage',
    is_dir: false,
    size: 320000,
    human_size: '312.5 KB',
    mod_time: new Date(Date.now() - 3600000 * 30).toISOString(),
    extension: 'docx',
    media_type: 'doc',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    name: 'Product_Launch_Deck.pptx',
    path: 'documents/Product_Launch_Deck.pptx',
    root_name: 'storage',
    is_dir: false,
    size: 1450000,
    human_size: '1.38 MB',
    mod_time: new Date(Date.now() - 3600000 * 18).toISOString(),
    extension: 'pptx',
    media_type: 'presentation',
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
    previewUrl: '/media/sample_video.mp4',
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
    previewUrl: '/media/sample_audio.mp3',
  },
  {
    name: 'Shot_On_iPhone_15_Pro.heic',
    path: 'media/Shot_On_iPhone_15_Pro.heic',
    root_name: 'storage',
    is_dir: false,
    size: 5120000,
    human_size: '4.88 MB',
    mod_time: new Date(Date.now() - 3600000 * 4).toISOString(),
    extension: 'heic',
    media_type: 'image',
    mime_type: 'image/heic',
    previewUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200',
  },
  {
    name: 'Cinematic_Clip_ProRes.mov',
    path: 'media/Cinematic_Clip_ProRes.mov',
    root_name: 'storage',
    is_dir: false,
    size: 24500000,
    human_size: '23.36 MB',
    mod_time: new Date(Date.now() - 3600000 * 10).toISOString(),
    extension: 'mov',
    media_type: 'video',
    mime_type: 'video/quicktime',
    previewUrl: '/media/sample_video.mp4',
  },
  {
    name: 'Voice_Memo_Studio.m4a',
    path: 'media/Voice_Memo_Studio.m4a',
    root_name: 'storage',
    is_dir: false,
    size: 3800000,
    human_size: '3.62 MB',
    mod_time: new Date(Date.now() - 3600000 * 8).toISOString(),
    extension: 'm4a',
    media_type: 'audio',
    mime_type: 'audio/mp4',
    previewUrl: '/media/sample_audio.mp3',
  },
  {
    name: 'Sticker_Animation.webp',
    path: 'media/Sticker_Animation.webp',
    root_name: 'storage',
    is_dir: false,
    size: 890000,
    human_size: '869.1 KB',
    mod_time: new Date(Date.now() - 3600000 * 22).toISOString(),
    extension: 'webp',
    media_type: 'image',
    mime_type: 'image/webp',
    previewUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
  },
  {
    name: 'Voice_Note_Discord.opus',
    path: 'media/Voice_Note_Discord.opus',
    root_name: 'storage',
    is_dir: false,
    size: 1200000,
    human_size: '1.14 MB',
    mod_time: new Date(Date.now() - 3600000 * 36).toISOString(),
    extension: 'opus',
    media_type: 'audio',
    mime_type: 'audio/ogg',
    previewUrl: '/media/sample_audio.mp3',
  },
  {
    name: 'Drone_4K_Hyperlapse.webm',
    path: 'media/Drone_4K_Hyperlapse.webm',
    root_name: 'storage',
    is_dir: false,
    size: 32400000,
    human_size: '30.90 MB',
    mod_time: new Date(Date.now() - 3600000 * 40).toISOString(),
    extension: 'webm',
    media_type: 'video',
    mime_type: 'video/webm',
    previewUrl: '/media/sample_video.mp4',
  },
  {
    name: 'Studio_Master_Ambient.flac',
    path: 'media/Studio_Master_Ambient.flac',
    root_name: 'storage',
    is_dir: false,
    size: 28500000,
    human_size: '27.18 MB',
    mod_time: new Date(Date.now() - 3600000 * 50).toISOString(),
    extension: 'flac',
    media_type: 'audio',
    mime_type: 'audio/flac',
    previewUrl: '/media/sample_audio.mp3',
  },
  {
    name: 'Podcast_Episode_12.wav',
    path: 'media/Podcast_Episode_12.wav',
    root_name: 'storage',
    is_dir: false,
    size: 44200000,
    human_size: '42.15 MB',
    mod_time: new Date(Date.now() - 3600000 * 70).toISOString(),
    extension: 'wav',
    media_type: 'audio',
    mime_type: 'audio/wav',
    previewUrl: '/media/sample_audio.mp3',
  },
  {
    name: 'Synthwave_Sunset_Beat.mp3',
    path: 'media/Synthwave_Sunset_Beat.mp3',
    root_name: 'storage',
    is_dir: false,
    size: 9200000,
    human_size: '8.77 MB',
    mod_time: new Date(Date.now() - 3600000 * 15).toISOString(),
    extension: 'mp3',
    media_type: 'audio',
    mime_type: 'audio/mpeg',
    previewUrl: '/media/sample_audio.mp3',
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
  private users: User[] = [
    { id: 'usr-1', username: 'demo_admin', role: 'admin', created_at: new Date('2026-01-01').toISOString() },
    { id: 'usr-2', username: 'alex_editor', role: 'editor', created_at: new Date('2026-02-15').toISOString() },
    { id: 'usr-3', username: 'sarah_viewer', role: 'viewer', created_at: new Date('2026-03-10').toISOString() },
  ];
  private isTotpEnabled = false;
  private settings: Record<string, string> = {
    trash_retention_days: '30',
    max_upload_size_mb: '1024',
    site_title: 'KV Files Storage',
  };

  async checkSetup(): Promise<{ is_initialized: boolean }> {
    return { is_initialized: true };
  }

  async initialSetup(username: string): Promise<{ success: boolean; token: string; user: User }> {
    const user: User = { id: 'mock-admin', username, role: 'admin', created_at: new Date().toISOString() };
    return { success: true, token: 'mock-token', user };
  }

  async login(username: string): Promise<AuthResponse> {
    const user: User = {
      id: 'mock-user',
      username: username || 'demo_admin',
      role: 'admin',
      created_at: new Date().toISOString(),
      is_totp_enabled: this.isTotpEnabled,
    };
    if (this.isTotpEnabled) {
      return {
        success: true,
        requires_2fa: true,
        pre_auth_token: 'mock-pre-auth-token-12345',
      };
    }
    return { success: true, token: 'mock-token', user };
  }

  async getMe(): Promise<User> {
    return {
      id: 'mock-user',
      username: 'demo_admin',
      role: 'admin',
      created_at: new Date().toISOString(),
      is_totp_enabled: this.isTotpEnabled,
    };
  }

  async setup2fa(): Promise<Setup2faResponse> {
    return {
      secret: 'JBSWY3DPEHPK3PXP',
      qr_code:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><path d='M10 10h30v30h-30zM50 10h10v10h-10zM70 10h20v20h-20zM15 15v20h20v-20zM20 20h10v10h-10zM75 15v10h10v-10zM10 50h10v10h-10zM30 50h20v10h-20zM10 70h30v30h-30zM15 75v20h20v-20zM20 80h10v10h-10zM60 50h10v30h-10zM80 50h10v10h-10zM50 70h10v10h-10zM70 70h20v20h-20zM50 90h20v10h-20z' fill='%231e293b'/></svg>",
      otpauth_url: 'otpauth://totp/KV%20Files:demo_admin?secret=JBSWY3DPEHPK3PXP&issuer=KV%20Files',
      backup_codes: [
        'A1B2-C3D4',
        'E5F6-G7H8',
        'J9K0-L1M2',
        'N3P4-Q5R6',
        'S7T8-U9V0',
        'W1X2-Y3Z4',
        'B5C6-D7E8',
        'F9G0-H1J2',
      ],
    };
  }

  async enable2fa(_code: string): Promise<void> {
    this.isTotpEnabled = true;
  }

  async verifyLogin2fa(_pre_auth_token: string, _code: string): Promise<AuthResponse> {
    const user: User = {
      id: 'mock-user',
      username: 'demo_admin',
      role: 'admin',
      created_at: new Date().toISOString(),
      is_totp_enabled: true,
    };
    return { success: true, token: 'mock-token', user };
  }

  async disable2fa(_password: string): Promise<void> {
    this.isTotpEnabled = false;
  }

  async logout(): Promise<void> {}

  async changePassword(_current_password: string, new_password: string): Promise<void> {
    if (new_password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  async listUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(username: string, _password: string, role: string = 'viewer'): Promise<User> {
    if (this.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username,
      role,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }

  async getSettings(): Promise<Record<string, string>> {
    return { ...this.settings };
  }

  async updateSettings(settings: Record<string, string>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
  }

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

  async listDirectory(root: string, path: string, showHidden: boolean = false): Promise<DirectoryListing> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const isSystemItem = (name: string) =>
      name.startsWith('.') || name.startsWith('@') || name === '#recycle' || name === 'lost+found';

    const directChildren = this.items.filter((item) => {
      if (item.root_name !== root) return false;
      const itemParent = item.path.includes('/')
        ? item.path.substring(0, item.path.lastIndexOf('/'))
        : '';
      return itemParent === cleanPath;
    });

    const hiddenCount = directChildren.filter((i) => isSystemItem(i.name) && !showHidden).length;
    const visibleChildren = directChildren.filter((i) => {
      if (isSystemItem(i.name) && !showHidden) return false;
      i.is_system = isSystemItem(i.name);
      return true;
    });

    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '' }];
    if (cleanPath) {
      let acc = '';
      for (const seg of cleanPath.split('/')) {
        acc = acc ? `${acc}/${seg}` : seg;
        breadcrumbs.push({ name: seg, path: acc });
      }
    }

    const totalFolders = visibleChildren.filter((i) => i.is_dir).length;
    const totalFiles = visibleChildren.filter((i) => !i.is_dir).length;
    const totalSize = visibleChildren.reduce((acc, i) => acc + i.size, 0);

    return {
      root_name: root,
      current_path: cleanPath,
      breadcrumbs,
      items: visibleChildren,
      total_items: visibleChildren.length,
      total_folders: totalFolders,
      total_files: totalFiles,
      total_size: totalSize,
      hidden_count: hiddenCount,
    };
  }

  async getTree(root: string, path: string = '', depth: number = 2, showHidden: boolean = false): Promise<TreeNode> {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const name = cleanPath.includes('/')
      ? cleanPath.substring(cleanPath.lastIndexOf('/') + 1)
      : cleanPath || root;
    const isSystemItem = (n: string) =>
      n.startsWith('.') || n.startsWith('@') || n === '#recycle' || n === 'lost+found';

    const node: TreeNode = {
      name,
      path: cleanPath,
      root_name: root,
      has_children: false,
      is_system: isSystemItem(name),
    };

    if (depth > 0) {
      const children = this.items.filter((i) => {
        if (!i.is_dir || i.root_name !== root) return false;
        if (isSystemItem(i.name) && !showHidden) return false;
        const parent = i.path.includes('/') ? i.path.substring(0, i.path.lastIndexOf('/')) : '';
        return parent === cleanPath;
      });

      if (children.length > 0) {
        node.has_children = true;
        node.children = await Promise.all(
          children.map((c) => this.getTree(root, c.path, depth - 1, showHidden))
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
    if (!q.trim()) return [];

    let textTokens: string[] = [];
    let filterExt: string | null = null;
    let filterType: string | null = null;
    let minSize: number | null = null;
    let maxSize: number | null = null;
    let inPath: string | null = null;

    for (const part of q.split(/\s+/)) {
      const lower = part.toLowerCase();
      if (lower.startsWith('ext:')) {
        filterExt = lower.slice(4).replace(/^\./, '');
      } else if (lower.startsWith('type:')) {
        filterType = lower.slice(5);
      } else if (lower.startsWith('size:>')) {
        minSize = parseSize(lower.slice(6));
      } else if (lower.startsWith('size:<')) {
        maxSize = parseSize(lower.slice(6));
      } else if (lower.startsWith('in:')) {
        inPath = lower.slice(3).replace(/^\/+|\/+$/g, '');
      } else if (part.trim()) {
        textTokens.push(lower);
      }
    }

    return this.items.filter((item) => {
      if (item.root_name !== root) return false;

      if (filterExt) {
        if (item.is_dir || item.extension.toLowerCase() !== filterExt) return false;
      }

      if (filterType) {
        const typeStr = item.is_dir ? 'folder' : item.media_type;
        if (filterType === 'doc') {
          if (item.media_type !== 'pdf' && item.media_type !== 'text') return false;
        } else if (typeStr !== filterType) {
          return false;
        }
      }

      if (minSize !== null && item.size < minSize) return false;
      if (maxSize !== null && item.size > maxSize) return false;

      if (inPath) {
        if (!item.path.toLowerCase().includes(inPath.toLowerCase())) return false;
      }

      if (textTokens.length > 0) {
        const nameLower = item.name.toLowerCase();
        const pathLower = item.path.toLowerCase();
        for (const token of textTokens) {
          if (!nameLower.includes(token) && !pathLower.includes(token)) {
            return false;
          }
        }
      }

      return true;
    });
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
    allow_download: boolean = true,
    paths?: string[]
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
      items_json: paths && paths.length > 0 ? JSON.stringify(paths) : undefined,
    };
    this.shares.push(share);
    return share;
  }

  async deleteShare(id: string): Promise<void> {
    this.shares = this.shares.filter((s) => s.id !== id);
  }

  async getPublicShareInfo(token: string, _password?: string): Promise<PublicShareInfo> {
    const share = this.shares.find((s) => s.token === token);
    if (!share) throw new Error('Shared link not found');
    const name = share.path.split('/').pop() || 'file';
    return {
      id: share.id,
      token: share.token,
      name,
      path: share.path,
      is_dir: share.is_dir,
      is_bundle: Boolean(share.items_json),
      size: 1024,
      human_size: '1.0 KB',
      mime_type: 'application/octet-stream',
      media_type: 'other',
      has_password: share.has_password,
      requires_password: false,
      allow_download: share.allow_download,
      expires_at: share.expires_at,
      view_count: share.view_count,
      created_at: share.created_at,
    };
  }

  getPublicShareDownloadUrl(token: string, password?: string, item?: string): string {
    const params = new URLSearchParams();
    if (password) params.set('password', password);
    if (item) params.set('item', item);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `/api/v1/public/share/${token}/download${qs}`;
  }

  getPublicShareRawUrl(token: string, password?: string, item?: string): string {
    const params = new URLSearchParams();
    if (password) params.set('password', password);
    if (item) params.set('item', item);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `/api/v1/public/share/${token}/raw${qs}`;
  }

  getRawFileUrl(root: string, path: string): string {
    const item = this.items.find((i) => i.root_name === root && i.path === path);
    if (item?.previewUrl) return item.previewUrl;
    return `/api/v1/fs/raw?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`;
  }

  getDownloadUrl(root: string, path: string): string {
    const item = this.items.find((i) => i.root_name === root && i.path === path);
    if (item?.previewUrl) return item.previewUrl;
    if (item?.content) return `data:text/plain;charset=utf-8,${encodeURIComponent(item.content)}`;
    return `/api/v1/fs/download?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`;
  }
}

function parseSize(s: string): number | null {
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(gb|mb|kb|b)?$/i);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = (match[2] || 'b').toLowerCase();
  if (unit === 'gb') return num * 1024 * 1024 * 1024;
  if (unit === 'mb') return num * 1024 * 1024;
  if (unit === 'kb') return num * 1024;
  return num;
}

function MediaTypeFromExt(ext: string): MediaType {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
    case 'heic':
    case 'heif':
    case 'ico':
    case 'avif':
    case 'tiff':
    case 'tif':
      return 'image';
    case 'mp4':
    case 'mkv':
    case 'mov':
    case 'webm':
    case 'avi':
    case 'flv':
    case 'wmv':
    case 'm4v':
    case '3gp':
    case 'mts':
    case 'm2ts':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'm4a':
    case 'opus':
    case 'wma':
    case 'mid':
    case 'midi':
    case 'caf':
    case 'aif':
    case 'aiff':
    case 'alac':
      return 'audio';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
    case 'dot':
    case 'dotx':
    case 'odt':
    case 'rtf':
    case 'pages':
      return 'doc';
    case 'xls':
    case 'xlsx':
    case 'xlt':
    case 'xltx':
    case 'ods':
    case 'numbers':
      return 'spreadsheet';
    case 'ppt':
    case 'pptx':
    case 'pot':
    case 'potx':
    case 'odp':
    case 'keynote':
    case 'key':
      return 'presentation';
    case 'txt':
    case 'md':
    case 'log':
    case 'csv':
      return 'text';
    case 'rs':
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'html':
    case 'css':
    case 'swift':
    case 'kt':
    case 'dart':
    case 'py':
    case 'go':
    case 'ini':
    case 'conf':
    case 'env':
    case 'sql':
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'plist':
    case 'mobileconfig':
      return 'code';
    case 'zip':
    case 'tar':
    case 'gz':
    case '7z':
    case 'rar':
    case 'apk':
    case 'aab':
    case 'ipa':
    case 'iso':
    case 'dmg':
      return 'archive';
    default:
      return 'other';
  }
}

export const mockDataSource: FileSystemDataSource = new MockFileSystem();
