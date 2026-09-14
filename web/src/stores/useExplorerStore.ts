import { create } from 'zustand';
import { api } from '../services/api';
import { DirectoryListing, FileItem, StorageRootInfo, ViewMode } from '../types';

export interface ColumnLevel {
  path: string;
  items: FileItem[];
  selectedName: string | null;
  isLoading: boolean;
}

interface ExplorerState {
  // Navigation
  currentRoot: string;
  currentPath: string;
  roots: StorageRootInfo[];
  listing: DirectoryListing | null;
  isLoading: boolean;
  error: string | null;

  // History stack
  history: string[];
  historyIndex: number;

  // Views & Selection
  viewMode: ViewMode;
  selectedItems: FileItem[];
  activeItem: FileItem | null;

  // macOS Miller Columns
  columns: ColumnLevel[];

  // Clipboard
  clipboard: {
    action: 'copy' | 'cut';
    root: string;
    items: FileItem[];
  } | null;

  // Search
  searchQuery: string;
  searchResults: FileItem[] | null;
  isSearching: boolean;

  // Modals & Panels
  isQuickLookOpen: boolean;
  isShareModalOpen: boolean;
  isTrashOpen: boolean;
  isUploadOpen: boolean;
  isNewFolderOpen: boolean;
  isRenameOpen: boolean;

  // Actions
  fetchRoots: () => Promise<void>;
  setCurrentRoot: (root: string) => void;
  navigateTo: (path: string, saveHistory?: boolean) => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  goUp: () => Promise<void>;
  refresh: () => Promise<void>;

  // Selection
  setViewMode: (mode: ViewMode) => void;
  selectItem: (item: FileItem, isMulti?: boolean) => void;
  clearSelection: () => void;
  setActiveItem: (item: FileItem | null) => void;

  // Column view actions
  selectColumnItem: (columnIndex: number, item: FileItem) => Promise<void>;

  // Clipboard
  setClipboard: (action: 'copy' | 'cut', items: FileItem[]) => void;
  clearClipboard: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  executeSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Modals
  setQuickLookOpen: (open: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setTrashOpen: (open: boolean) => void;
  setUploadOpen: (open: boolean) => void;
  setNewFolderOpen: (open: boolean) => void;
  setRenameOpen: (open: boolean) => void;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  currentRoot: '',
  currentPath: '',
  roots: [],
  listing: null,
  isLoading: false,
  error: null,

  history: [''],
  historyIndex: 0,

  viewMode: 'columns', // Default to macOS Column View!
  selectedItems: [],
  activeItem: null,

  columns: [],

  clipboard: null,

  searchQuery: '',
  searchResults: null,
  isSearching: false,

  isQuickLookOpen: false,
  isShareModalOpen: false,
  isTrashOpen: false,
  isUploadOpen: false,
  isNewFolderOpen: false,
  isRenameOpen: false,

  fetchRoots: async () => {
    try {
      const roots = await api.getRoots();
      set({ roots });
      if (roots.length > 0 && !get().currentRoot) {
        const firstRoot = roots[0].name;
        set({ currentRoot: firstRoot });
        await get().navigateTo('');
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setCurrentRoot: (root: string) => {
    set({ currentRoot: root, currentPath: '', history: [''], historyIndex: 0 });
    get().navigateTo('');
  },

  navigateTo: async (path: string, saveHistory: boolean = true) => {
    const root = get().currentRoot;
    if (!root) return;

    set({ isLoading: true, error: null });

    try {
      const listing = await api.listDirectory(root, path);

      // Manage history
      let { history, historyIndex } = get();
      if (saveHistory) {
        history = history.slice(0, historyIndex + 1);
        history.push(path);
        historyIndex = history.length - 1;
      }

      // Rebuild column stack for Miller Column View
      const segments = path.split('/').filter(Boolean);
      const cols: ColumnLevel[] = [];

      // First column is root folder
      const rootListing = path === '' ? listing : await api.listDirectory(root, '');
      cols.push({
        path: '',
        items: rootListing.items,
        selectedName: segments[0] || null,
        isLoading: false,
      });

      // Subsequent columns
      let curAcc = '';
      for (let i = 0; i < segments.length; i++) {
        curAcc = curAcc ? `${curAcc}/${segments[i]}` : segments[i];
        const isCurrent = curAcc === path;
        const colListing = isCurrent ? listing : await api.listDirectory(root, curAcc);
        cols.push({
          path: curAcc,
          items: colListing.items,
          selectedName: segments[i + 1] || null,
          isLoading: false,
        });
      }

      set({
        currentPath: path,
        listing,
        columns: cols,
        isLoading: false,
        history,
        historyIndex,
        selectedItems: [],
        activeItem: null,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  goBack: async () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      set({ historyIndex: nextIndex });
      await get().navigateTo(history[nextIndex], false);
    }
  },

  goForward: async () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({ historyIndex: nextIndex });
      await get().navigateTo(history[nextIndex], false);
    }
  },

  goUp: async () => {
    const { currentPath } = get();
    if (!currentPath) return;
    const segments = currentPath.split('/').filter(Boolean);
    segments.pop();
    const parentPath = segments.join('/');
    await get().navigateTo(parentPath);
  },

  refresh: async () => {
    const { currentPath } = get();
    await get().navigateTo(currentPath, false);
  },

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  selectItem: (item: FileItem, isMulti: boolean = false) => {
    const { selectedItems } = get();
    if (isMulti) {
      const exists = selectedItems.some((i) => i.path === item.path);
      if (exists) {
        const next = selectedItems.filter((i) => i.path !== item.path);
        set({ selectedItems: next, activeItem: next[next.length - 1] || null });
      } else {
        set({ selectedItems: [...selectedItems, item], activeItem: item });
      }
    } else {
      set({ selectedItems: [item], activeItem: item });
    }
  },

  clearSelection: () => set({ selectedItems: [], activeItem: null }),

  setActiveItem: (item: FileItem | null) => set({ activeItem: item }),

  selectColumnItem: async (columnIndex: number, item: FileItem) => {
    const { columns, currentRoot } = get();
    const newCols = columns.slice(0, columnIndex + 1);

    // Update selection in current column
    newCols[columnIndex].selectedName = item.name;
    set({ activeItem: item, selectedItems: [item] });

    if (item.is_dir) {
      // Append loading child column
      newCols.push({
        path: item.path,
        items: [],
        selectedName: null,
        isLoading: true,
      });
      set({ columns: newCols, currentPath: item.path });

      try {
        const childListing = await api.listDirectory(currentRoot, item.path);
        newCols[columnIndex + 1].items = childListing.items;
        newCols[columnIndex + 1].isLoading = false;
        set({ columns: [...newCols], listing: childListing });
      } catch (err: any) {
        newCols[columnIndex + 1].isLoading = false;
        set({ columns: [...newCols], error: err.message });
      }
    } else {
      // File selected - terminal column will act as Inspector
      set({ columns: newCols });
    }
  },

  setClipboard: (action: 'copy' | 'cut', items: FileItem[]) => {
    set({
      clipboard: {
        action,
        root: get().currentRoot,
        items,
      },
    });
  },

  clearClipboard: () => set({ clipboard: null }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  executeSearch: async (query: string) => {
    const root = get().currentRoot;
    if (!root || !query.trim()) return;
    set({ isSearching: true, searchQuery: query });
    try {
      const results = await api.searchItems(root, query);
      set({ searchResults: results, isSearching: false });
    } catch (err: any) {
      set({ isSearching: false, error: err.message });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: null, isSearching: false }),

  setQuickLookOpen: (open: boolean) => set({ isQuickLookOpen: open }),
  setShareModalOpen: (open: boolean) => set({ isShareModalOpen: open }),
  setTrashOpen: (open: boolean) => set({ isTrashOpen: open }),
  setUploadOpen: (open: boolean) => set({ isUploadOpen: open }),
  setNewFolderOpen: (open: boolean) => set({ isNewFolderOpen: open }),
  setRenameOpen: (open: boolean) => set({ isRenameOpen: open }),
}));
