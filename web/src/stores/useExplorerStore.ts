import { create } from 'zustand';
import { api } from '../services/api';
import { DirectoryListing, FileItem, StorageRootInfo, ViewMode, TreeNode } from '../types';

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

  // Live Direct Upload Tracking
  uploadStatus: {
    isUploading: boolean;
    progress: number;
    count: number;
    currentFileName?: string;
  } | null;
  startDirectUpload: (root: string, path: string, files: File[]) => Promise<void>;
  dismissUploadStatus: () => void;

  // Context Menu
  contextMenu: {
    x: number;
    y: number;
    item?: FileItem | null;
    sidebarNode?: TreeNode | null;
    sidebarDrive?: string | null;
    sidebarFavorite?: any | null;
    breadcrumb?: { name: string; path: string } | null;
    sidebarEmpty?: boolean | null;
    toolbar?: 'titlebar' | 'ribbon' | 'addressbar' | 'statusbar' | null;
    searchResultsBackground?: boolean | null;
    targetPath?: string | null;
  } | null;
  openContextMenu: (
    x: number,
    y: number,
    item?: FileItem | null,
    options?: {
      sidebarNode?: TreeNode | null;
      sidebarDrive?: string | null;
      sidebarFavorite?: any | null;
      breadcrumb?: { name: string; path: string } | null;
      sidebarEmpty?: boolean | null;
      toolbar?: 'titlebar' | 'ribbon' | 'addressbar' | 'statusbar' | null;
      searchResultsBackground?: boolean | null;
      targetPath?: string | null;
    }
  ) => void;
  closeContextMenu: () => void;

  // Dedicated Video Player
  isVideoPlayerOpen: boolean;
  videoTrack: FileItem | null;
  playVideo: (item: FileItem) => void;
  closeVideoPlayer: () => void;

  // Active Shares Hub
  isActiveSharesOpen: boolean;
  setActiveSharesOpen: (open: boolean) => void;

  // Split View (Dual Pane)
  isSplitView: boolean;
  activePane: 'left' | 'right';
  rightPanePath: string;
  rightPaneListing: DirectoryListing | null;
  rightPaneViewMode: ViewMode;
  rightPaneSelectedItems: FileItem[];
  rightPaneActiveItem: FileItem | null;
  toggleSplitView: () => void;
  setActivePane: (pane: 'left' | 'right') => void;
  navigateRightPane: (path: string) => Promise<void>;
  setRightPaneViewMode: (mode: ViewMode) => void;
  selectRightPaneItem: (item: FileItem, isMulti?: boolean) => void;
  selectRightPaneMultiple: (items: FileItem[]) => void;
  copyToOtherPane: () => Promise<void>;
  moveToOtherPane: () => Promise<void>;
  syncPanes: () => Promise<void>;

  // Power Search & Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Dedicated Audio Player
  audioTrack: FileItem | null;
  playAudio: (item: FileItem) => void;
  closeAudioPlayer: () => void;

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
  selectMultiple: (items: FileItem[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActiveItem: (item: FileItem | null) => void;

  // Column view actions
  selectColumnItem: (columnIndex: number, item: FileItem) => Promise<void>;

  // Clipboard & Operations
  setClipboard: (action: 'copy' | 'cut', items: FileItem[]) => void;
  clearClipboard: () => void;
  pasteClipboard: () => Promise<void>;
  deleteSelectedItem: (item: FileItem, permanent?: boolean) => Promise<void>;

  // Search
  setSearchQuery: (query: string) => void;
  executeSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

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

  viewMode: typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'columns',
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
  isSidebarOpen: false,

  contextMenu: null,
  isSplitView: false,
  activePane: 'left',
  rightPanePath: '',
  rightPaneListing: null,
  rightPaneViewMode: 'list',
  rightPaneSelectedItems: [],
  rightPaneActiveItem: null,
  isCommandPaletteOpen: false,
  audioTrack: null,
  isVideoPlayerOpen: false,
  videoTrack: null,
  isActiveSharesOpen: false,

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

    const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');

    set({ isLoading: true, error: null });

    try {
      const listing = await api.listDirectory(root, cleanPath);

      // Manage history
      let { history, historyIndex } = get();
      if (saveHistory) {
        history = history.slice(0, historyIndex + 1);
        history.push(cleanPath);
        historyIndex = history.length - 1;
      }

      // Rebuild column stack for Miller Column View
      const segments = cleanPath.split('/').filter(Boolean);
      const cols: ColumnLevel[] = [];

      // First column is root folder
      const rootListing = cleanPath === '' ? listing : await api.listDirectory(root, '');
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
        const isCurrent = curAcc === cleanPath;
        const colListing = isCurrent ? listing : await api.listDirectory(root, curAcc);
        cols.push({
          path: curAcc,
          items: colListing.items,
          selectedName: segments[i + 1] || null,
          isLoading: false,
        });
      }

      set({
        currentPath: cleanPath,
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

  selectMultiple: (items: FileItem[]) => {
    set({ selectedItems: items, activeItem: items[items.length - 1] || null });
  },

  selectAll: () => {
    const { listing, isSplitView, activePane, rightPaneListing } = get();
    if (isSplitView && activePane === 'right') {
      if (rightPaneListing && rightPaneListing.items) {
        set({
          rightPaneSelectedItems: [...rightPaneListing.items],
          rightPaneActiveItem: rightPaneListing.items[0] || null,
        });
      }
    } else {
      if (listing && listing.items) {
        set({
          selectedItems: [...listing.items],
          activeItem: listing.items[0] || null,
        });
      }
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
      const cleanPath = item.path.trim().replace(/^\/+|\/+$/g, '');
      // Append loading child column
      newCols.push({
        path: cleanPath,
        items: [],
        selectedName: null,
        isLoading: true,
      });
      set({ columns: newCols, currentPath: cleanPath });

      try {
        const childListing = await api.listDirectory(currentRoot, cleanPath);
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

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
  setQuickLookOpen: (open: boolean) => set({ isQuickLookOpen: open }),
  setShareModalOpen: (open: boolean) => set({ isShareModalOpen: open }),
  setTrashOpen: (open: boolean) => set({ isTrashOpen: open }),
  setUploadOpen: (open: boolean) => set({ isUploadOpen: open }),
  setNewFolderOpen: (open: boolean) => set({ isNewFolderOpen: open }),
  setRenameOpen: (open: boolean) => set({ isRenameOpen: open }),

  // Direct Drag & Drop Upload
  uploadStatus: null,
  startDirectUpload: async (root: string, path: string, files: File[]) => {
    if (!root || files.length === 0) return;
    const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
    const fileName = files.length === 1 ? files[0].name : `${files.length} files`;

    set({
      uploadStatus: {
        isUploading: true,
        progress: 0,
        count: files.length,
        currentFileName: fileName,
      },
    });

    try {
      await api.uploadFiles(root, cleanPath, files, (p) => {
        const current = get().uploadStatus;
        if (current) {
          set({ uploadStatus: { ...current, progress: p } });
        }
      });
      await get().refresh();
      set({
        uploadStatus: {
          isUploading: false,
          progress: 100,
          count: files.length,
          currentFileName: fileName,
        },
      });
      setTimeout(() => {
        get().dismissUploadStatus();
      }, 3500);
    } catch (err: any) {
      set({ uploadStatus: null });
      alert(`Upload failed: ${err.message}`);
    }
  },
  dismissUploadStatus: () => set({ uploadStatus: null }),

  // Context Menu
  openContextMenu: (x, y, item = null, options = {}) =>
    set({
      contextMenu: {
        x,
        y,
        item,
        sidebarNode: options.sidebarNode || null,
        sidebarDrive: options.sidebarDrive || null,
        sidebarFavorite: options.sidebarFavorite || null,
        breadcrumb: options.breadcrumb || null,
        sidebarEmpty: options.sidebarEmpty || null,
        toolbar: options.toolbar || null,
        searchResultsBackground: options.searchResultsBackground || null,
        targetPath: options.targetPath || null,
      },
    }),
  closeContextMenu: () => set({ contextMenu: null }),

  // Video Player
  playVideo: (item) => set({ videoTrack: item, isVideoPlayerOpen: true }),
  closeVideoPlayer: () => set({ videoTrack: null, isVideoPlayerOpen: false }),

  // Active Shares Hub
  setActiveSharesOpen: (open) => set({ isActiveSharesOpen: open }),

  // Split View
  toggleSplitView: () => {
    const next = !get().isSplitView;
    set({ isSplitView: next });
    if (next && !get().rightPaneListing) {
      get().navigateRightPane(get().currentPath);
    }
  },
  setActivePane: (pane) => set({ activePane: pane }),
  navigateRightPane: async (path: string) => {
    const root = get().currentRoot;
    if (!root) return;
    const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
    try {
      const listing = await api.listDirectory(root, cleanPath);
      set({
        rightPanePath: cleanPath,
        rightPaneListing: listing,
        rightPaneSelectedItems: [],
        rightPaneActiveItem: null,
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  setRightPaneViewMode: (mode) => set({ rightPaneViewMode: mode }),
  selectRightPaneItem: (item, isMulti = false) => {
    const { rightPaneSelectedItems } = get();
    if (isMulti) {
      const exists = rightPaneSelectedItems.some((i) => i.path === item.path);
      if (exists) {
        const next = rightPaneSelectedItems.filter((i) => i.path !== item.path);
        set({ rightPaneSelectedItems: next, rightPaneActiveItem: next[next.length - 1] || null });
      } else {
        set({ rightPaneSelectedItems: [...rightPaneSelectedItems, item], rightPaneActiveItem: item });
      }
    } else {
      set({ rightPaneSelectedItems: [item], rightPaneActiveItem: item });
    }
  },
  selectRightPaneMultiple: (items) => {
    set({ rightPaneSelectedItems: items, rightPaneActiveItem: items[items.length - 1] || null });
  },
  copyToOtherPane: async () => {
    const { activePane, currentRoot, currentPath, rightPanePath, selectedItems, rightPaneSelectedItems } = get();
    const sourceItems = activePane === 'left' ? selectedItems : rightPaneSelectedItems;
    const destFolder = activePane === 'left' ? rightPanePath : currentPath;
    if (sourceItems.length === 0) return;

    for (const item of sourceItems) {
      const dest = destFolder ? `${destFolder}/${item.name}` : item.name;
      await api.copyItem(currentRoot, item.path, dest);
    }
    await get().refresh();
    await get().navigateRightPane(rightPanePath);
  },
  moveToOtherPane: async () => {
    const { activePane, currentRoot, currentPath, rightPanePath, selectedItems, rightPaneSelectedItems } = get();
    const sourceItems = activePane === 'left' ? selectedItems : rightPaneSelectedItems;
    const destFolder = activePane === 'left' ? rightPanePath : currentPath;
    if (sourceItems.length === 0) return;

    for (const item of sourceItems) {
      const dest = destFolder ? `${destFolder}/${item.name}` : item.name;
      await api.moveItem(currentRoot, item.path, dest);
    }
    await get().refresh();
    await get().navigateRightPane(rightPanePath);
  },
  syncPanes: async () => {
    const { activePane, currentPath, rightPanePath } = get();
    if (activePane === 'left') {
      await get().navigateRightPane(currentPath);
    } else {
      await get().navigateTo(rightPanePath);
    }
  },

  // Power Search & Command Palette
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  // Audio Player
  playAudio: (item) => set({ audioTrack: item }),
  closeAudioPlayer: () => set({ audioTrack: null }),

  // Clipboard & Delete
  pasteClipboard: async () => {
    const { clipboard, currentRoot, currentPath, isSplitView, rightPanePath } = get();
    if (!clipboard || clipboard.items.length === 0) return;

    for (const item of clipboard.items) {
      const destPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      if (clipboard.action === 'copy') {
        await api.copyItem(currentRoot, item.path, destPath);
      } else {
        await api.moveItem(currentRoot, item.path, destPath);
      }
    }

    if (clipboard.action === 'cut') {
      set({ clipboard: null });
    }
    await get().refresh();
    if (isSplitView) {
      await get().navigateRightPane(rightPanePath);
    }
  },

  deleteSelectedItem: async (item, permanent = false) => {
    const root = get().currentRoot;
    await api.deleteItem(root, item.path, permanent);
    await get().refresh();
    if (get().isSplitView) {
      await get().navigateRightPane(get().rightPanePath);
    }
  },
}));
