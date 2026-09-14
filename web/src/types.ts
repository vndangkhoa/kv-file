export type MediaType = 'video' | 'image' | 'audio' | 'pdf' | 'text' | 'code' | 'archive' | 'doc' | 'spreadsheet' | 'presentation' | 'other';

export interface FileItem {
  name: string;
  path: string;
  root_name: string;
  is_dir: boolean;
  size: number;
  human_size: string;
  mod_time: string;
  extension: string;
  media_type: MediaType;
  mime_type: string;
  item_count?: number;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface DirectoryListing {
  root_name: string;
  current_path: string;
  breadcrumbs: BreadcrumbItem[];
  items: FileItem[];
  total_items: number;
  total_folders: number;
  total_files: number;
  total_size: number;
}

export interface TreeNode {
  name: string;
  path: string;
  root_name: string;
  has_children: boolean;
  children?: TreeNode[];
}

export interface StorageRootInfo {
  name: string;
  path: string;
  total_bytes: number;
  free_bytes: number;
  used_bytes: number;
}

export interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
  is_totp_enabled?: boolean;
}

export interface Setup2faResponse {
  secret: string;
  qr_code: string;
  otpauth_url: string;
  backup_codes: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  requires_2fa?: boolean;
  pre_auth_token?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export type ServerSettings = Record<string, string>;

export interface ShareItem {
  id: string;
  token: string;
  root_name: string;
  path: string;
  is_dir: boolean;
  has_password: boolean;
  expires_at?: string;
  view_count: number;
  allow_download: boolean;
  created_at: string;
  items_json?: string;
}

export interface PublicShareBundleItem {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  human_size: string;
  mime_type: string;
  media_type: 'video' | 'image' | 'audio' | 'pdf' | 'text' | 'code' | 'archive' | 'doc' | 'spreadsheet' | 'presentation' | 'other';
  extension?: string;
}

export interface PublicShareInfo {
  id: string;
  token: string;
  name: string;
  path: string;
  is_dir: boolean;
  is_bundle?: boolean;
  bundle_items?: PublicShareBundleItem[];
  size: number;
  human_size: string;
  mime_type: string;
  media_type: 'video' | 'image' | 'audio' | 'pdf' | 'text' | 'code' | 'archive' | 'doc' | 'spreadsheet' | 'presentation' | 'other';
  extension?: string;
  has_password: boolean;
  requires_password?: boolean;
  allow_download: boolean;
  expires_at?: string;
  view_count: number;
  created_at: string;
}

export interface TrashItem {
  id: string;
  root_name: string;
  original_path: string;
  trash_name: string;
  size: number;
  human_size: string;
  is_dir: boolean;
  deleted_at: string;
}

export type ViewMode = 'columns' | 'list' | 'grid';

export interface FsEvent {
  event_type: 'created' | 'modified' | 'deleted' | 'renamed';
  root_name: string;
  path: string;
  is_dir: boolean;
}
