import { FileSystemDataSource } from './dataSource';
import { apiDataSource } from './apiDataSource';
import { mockDataSource } from './mockDataSource';

// Retrieve mode from localStorage or environment
const savedMode = localStorage.getItem('kv_files_data_mode');
// Default to 'real' backend API for production use
const initialMode: 'real' | 'mock' = savedMode === 'mock' ? 'mock' : 'real';

let activeSource: FileSystemDataSource = initialMode === 'mock' ? mockDataSource : apiDataSource;

/**
 * Global `api` client proxying to the active data source (either MockDataSource or Real ApiDataSource).
 * UI components call this exact same interface regardless of which mode is active.
 *
 * To remove mockdata completely in the future:
 * 1. Change `activeSource = apiDataSource`
 * 2. Delete `mockDataSource.ts`
 */
export const api: FileSystemDataSource = new Proxy({} as FileSystemDataSource, {
  get(_target, prop: string | symbol) {
    return (activeSource as any)[prop];
  },
});

export function setDataSourceMode(mode: 'real' | 'mock') {
  localStorage.setItem('kv_files_data_mode', mode);
  activeSource = mode === 'mock' ? mockDataSource : apiDataSource;
  window.location.reload();
}

export function getDataSourceMode(): 'real' | 'mock' {
  return activeSource.isMock ? 'mock' : 'real';
}
