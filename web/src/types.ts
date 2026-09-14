export type MediaType = 'video' | 'image' | 'audio' | 'pdf' | 'text' | 'code' | 'archive' | 'other';

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
}

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
