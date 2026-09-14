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

export interface FileSystemDataSource {
  isMock: boolean;

  // Auth & User Management
  checkSetup(): Promise<{ is_initialized: boolean }>;
  initialSetup(username: string, password: string): Promise<{ success: boolean; token: string; user: User }>;
  login(username: string, password: string): Promise<AuthResponse>;
  getMe(): Promise<User>;
  logout(): Promise<void>;
  changePassword(current_password: string, new_password: string): Promise<void>;
  listUsers(): Promise<User[]>;
  createUser(username: string, password: string, role?: string): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Two-Factor Authentication
  setup2fa(): Promise<Setup2faResponse>;
  enable2fa(code: string): Promise<void>;
  verifyLogin2fa(pre_auth_token: string, code: string): Promise<AuthResponse>;
  disable2fa(password: string): Promise<void>;

  // System Settings
  getSettings(): Promise<Record<string, string>>;
  updateSettings(settings: Record<string, string>): Promise<void>;

  // Filesystem
  getRoots(): Promise<StorageRootInfo[]>;
  listDirectory(root: string, path: string, showHidden?: boolean): Promise<DirectoryListing>;
  getTree(root: string, path?: string, depth?: number, showHidden?: boolean): Promise<TreeNode>;
  createFolder(root: string, path: string): Promise<void>;
  renameItem(root: string, path: string, new_name: string): Promise<void>;
  copyItem(root: string, source: string, destination: string): Promise<void>;
  moveItem(root: string, source: string, destination: string): Promise<void>;
  deleteItem(root: string, path: string, permanent?: boolean): Promise<void>;
  searchItems(root: string, q: string): Promise<FileItem[]>;
  uploadFiles(
    root: string,
    path: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<void>;

  // Trash
  listTrash(): Promise<TrashItem[]>;
  restoreTrash(id: string): Promise<void>;
  purgeTrash(id: string): Promise<void>;
  emptyTrash(): Promise<void>;

  // Shares
  listShares(): Promise<ShareItem[]>;
  createShare(
    root: string,
    path: string,
    is_dir: boolean,
    password?: string,
    expires_at?: string,
    allow_download?: boolean,
    paths?: string[]
  ): Promise<ShareItem>;
  deleteShare(id: string): Promise<void>;
  getPublicShareInfo(token: string, password?: string): Promise<PublicShareInfo>;
  getPublicShareDownloadUrl(token: string, password?: string, item?: string): string;
  getPublicShareRawUrl(token: string, password?: string, item?: string): string;

  // URLs
  getRawFileUrl(root: string, path: string): string;
  getDownloadUrl(root: string, path: string): string;
}
