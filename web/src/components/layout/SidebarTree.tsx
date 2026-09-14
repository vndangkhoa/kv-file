import React, { useState, useEffect } from 'react';
import {
  Folder,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Star,
  Trash2,
  Share2,
  FileText,
  Video,
  Music,
  File,
  X,
  FlaskConical,
  Database,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useFavoritesStore, FavoriteItem } from '../../stores/useFavoritesStore';
import { useLongPress } from '../../hooks/useLongPress';
import { api, getDataSourceMode, setDataSourceMode } from '../../services/api';
import { TreeNode, StorageRootInfo } from '../../types';

interface TreeItemProps {
  node: TreeNode;
  level: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, level }) => {
  const {
    currentPath,
    currentRoot,
    navigateTo,
    setSidebarOpen,
    openContextMenu,
    refresh,
    startDirectUpload,
  } = useExplorerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<TreeNode[] | null>(node.children || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const isSelected = currentPath === node.path;

  const toggleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && !children) {
      setIsLoading(true);
      try {
        const loaded = await api.getTree(currentRoot, node.path, 1);
        setChildren(loaded.children || []);
      } catch (err) {
        console.error('Failed to load subfolders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = () => {
    navigateTo(node.path);
    // Auto-close drawer on mobile devices
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, null, { sidebarNode: node });
  };

  const longPressProps = useLongPress({
    onLongPress: (_e, clientX, clientY) => {
      openContextMenu(clientX, clientY, null, { sidebarNode: node });
    },
    onClick: handleSelect,
  });

  const handleDragOver = (e: React.DragEvent) => {
    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
    const isFiles = e.dataTransfer.types.includes('Files');
    if (isInternal || isFiles) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      if (!isDropTarget) setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    // 1. External OS files drag-and-drop upload
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      const files = Array.from(e.dataTransfer.files);
      await startDirectUpload(currentRoot, node.path, files);
      return;
    }

    // 2. Internal move / copy
    const rawData = e.dataTransfer.getData('application/x-kv-file');
    if (!rawData) return;

    try {
      const { root, items } = JSON.parse(rawData) as {
        root: string;
        items: { name: string; path: string; is_dir?: boolean }[];
      };
      const isCopy = e.ctrlKey || e.altKey;

      for (const src of items) {
        if (node.path === src.path || node.path.startsWith(`${src.path}/`)) {
          continue;
        }
        const parentPath = src.path.includes('/')
          ? src.path.substring(0, src.path.lastIndexOf('/'))
          : '';
        if (!isCopy && parentPath === node.path) {
          continue;
        }

        if (isCopy) {
          await api.copyItem(root, src.path, node.path);
        } else {
          await api.moveItem(root, src.path, node.path);
        }
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle sidebar drop:', err);
    }
  };

  return (
    <div>
      <div
        {...longPressProps}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`flex items-center gap-1.5 min-h-[42px] md:min-h-0 py-2 md:py-1 pr-2 rounded-lg md:rounded text-xs cursor-pointer transition-all ${
          isDropTarget
            ? 'ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium'
            : isSelected
            ? 'bg-blue-100 text-blue-800 dark:bg-[#0078d4]/30 dark:text-blue-300 font-medium'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
        }`}
      >
        <button
          onClick={toggleOpen}
          className="p-1.5 md:p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border border-blue-500 border-t-transparent animate-spin rounded-full" />
          ) : isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        <Folder size={15} className="text-amber-500 fill-amber-400/20 shrink-0" />
        <span className="truncate text-sm md:text-xs">{node.name}</span>
      </div>

      {isOpen && children && (
        <div>
          {children.map((child) => (
            <TreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FavoriteRow: React.FC<{
  fav: FavoriteItem;
  onNavigate: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
}> = ({ fav, onNavigate, onContextMenu, icon }) => {
  const { refresh, startDirectUpload } = useExplorerStore();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!fav.is_dir) return;
    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
    const isFiles = e.dataTransfer.types.includes('Files');
    if (isInternal || isFiles) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      if (!isDropTarget) setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!fav.is_dir) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!fav.is_dir) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      const files = Array.from(e.dataTransfer.files);
      await startDirectUpload(fav.root_name, fav.path, files);
      return;
    }

    const rawData = e.dataTransfer.getData('application/x-kv-file');
    if (!rawData) return;

    try {
      const { root, items } = JSON.parse(rawData) as {
        root: string;
        items: { name: string; path: string; is_dir?: boolean }[];
      };
      const isCopy = e.ctrlKey || e.altKey;

      for (const src of items) {
        if (fav.path === src.path || fav.path.startsWith(`${src.path}/`)) {
          continue;
        }
        if (isCopy) {
          await api.copyItem(root, src.path, fav.path);
        } else {
          await api.moveItem(root, src.path, fav.path);
        }
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle favorite drop:', err);
    }
  };

  return (
    <button
      onClick={onNavigate}
      onContextMenu={onContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full group flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded text-left transition-all min-h-[44px] md:min-h-0 text-sm md:text-xs ${
        isDropTarget
          ? 'ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium'
          : 'hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] active:bg-gray-200 dark:active:bg-[#333333] text-gray-700 dark:text-gray-300'
      }`}
    >
      {icon}
      <span className="truncate flex-1 font-medium">{fav.name}</span>
      <Star
        size={11}
        className="text-amber-400/40 group-hover:text-amber-400 fill-amber-400/30 shrink-0"
      />
    </button>
  );
};

interface DriveItemProps {
  r: StorageRootInfo;
  isActive: boolean;
  rootTree?: TreeNode;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const DriveItem: React.FC<DriveItemProps> = ({
  r,
  isActive,
  rootTree,
  onSelect,
  onContextMenu,
}) => {
  const { startDirectUpload, refresh } = useExplorerStore();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const usedPercent =
    r.total_bytes > 0 ? Math.round((r.used_bytes / r.total_bytes) * 100) : 0;

  const handleDragOver = (e: React.DragEvent) => {
    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
    const isFiles = e.dataTransfer.types.includes('Files');
    if (isInternal || isFiles) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      if (!isDropTarget) setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      const files = Array.from(e.dataTransfer.files);
      await startDirectUpload(r.name, '', files);
      return;
    }

    const rawData = e.dataTransfer.getData('application/x-kv-file');
    if (!rawData) return;

    try {
      const { root, items } = JSON.parse(rawData) as {
        root: string;
        items: { name: string; path: string; is_dir?: boolean }[];
      };
      const isCopy = e.ctrlKey || e.altKey;

      for (const src of items) {
        const parentPath = src.path.includes('/')
          ? src.path.substring(0, src.path.lastIndexOf('/'))
          : '';
        if (root === r.name && parentPath === '' && !isCopy) {
          continue;
        }

        if (isCopy) {
          await api.copyItem(root, src.path, '');
        } else {
          await api.moveItem(root, src.path, '');
        }
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle drive drop:', err);
    }
  };

  return (
    <div className="space-y-0.5">
      <button
        onClick={onSelect}
        onContextMenu={onContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full flex items-center gap-2.5 px-3 py-3 md:py-1.5 rounded-xl md:rounded transition-all text-left min-h-[46px] md:min-h-0 text-sm md:text-xs ${
          isDropTarget
            ? 'ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-semibold'
            : isActive
            ? 'bg-blue-50 text-blue-800 dark:bg-[#0078d4]/20 dark:text-blue-300 font-semibold'
            : 'hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] active:bg-gray-200 dark:active:bg-[#333333] text-gray-700 dark:text-gray-300'
        }`}
      >
        <HardDrive
          size={14}
          className={isActive || isDropTarget ? 'text-blue-500' : 'text-gray-500'}
        />
        <span className="truncate flex-1">{r.name}</span>
        <span className="text-[10px] text-gray-400 font-normal">
          {Math.round(r.free_bytes / 1024 / 1024 / 1024)}G
        </span>
      </button>

      {/* Capacity Bar */}
      <div className="mx-2 h-1 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      {/* Subfolder Tree */}
      {isActive && rootTree && (
        <div className="mt-1">
          {rootTree.children?.map((child) => (
            <TreeItem key={child.path} node={child} level={0} />
          ))}
        </div>
      )}
    </div>
  );
};

const TrashBinButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { refresh } = useExplorerStore();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-kv-file')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (!isDropTarget) setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const rawData = e.dataTransfer.getData('application/x-kv-file');
    if (!rawData) return;

    try {
      const { root, items } = JSON.parse(rawData) as {
        root: string;
        items: { name: string; path: string; is_dir?: boolean }[];
      };
      for (const item of items) {
        await api.deleteItem(root, item.path);
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle trash drop:', err);
    }
  };

  return (
    <button
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full flex items-center gap-3 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded transition-all font-medium text-left min-h-[46px] md:min-h-0 text-sm md:text-xs ${
        isDropTarget
          ? 'ring-2 ring-red-500 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
          : 'hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
      }`}
    >
      <Trash2 size={14} className={isDropTarget ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'} />
      <span>Trash Bin</span>
      {isDropTarget && (
        <span className="ml-auto text-[10px] text-red-500 font-bold animate-pulse">
          Drop to Delete
        </span>
      )}
    </button>
  );
};

export const SidebarTree: React.FC = () => {
  const {
    roots,
    currentRoot,
    setCurrentRoot,
    setTrashOpen,
    isSidebarOpen,
    setSidebarOpen,
    navigateTo,
    openContextMenu,
    setActiveSharesOpen,
  } = useExplorerStore();

  const { favorites } = useFavoritesStore();
  const [rootTrees, setRootTrees] = useState<Record<string, TreeNode>>({});
  const [isFavOpen, setIsFavOpen] = useState(true);

  useEffect(() => {
    if (currentRoot) {
      api
        .getTree(currentRoot, '', 1)
        .then((tree) => {
          setRootTrees((prev) => ({ ...prev, [currentRoot]: tree }));
        })
        .catch(console.error);
    }
  }, [currentRoot]);

  const handleNavFavorite = (fav: FavoriteItem) => {
    if (fav.root_name !== currentRoot) {
      setCurrentRoot(fav.root_name);
    }
    navigateTo(fav.path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const getFavIcon = (fav: FavoriteItem) => {
    if (fav.is_dir) {
      if (fav.name.toLowerCase().includes('doc')) return <FileText size={14} className="text-blue-500" />;
      if (fav.name.toLowerCase().includes('media') || fav.name.toLowerCase().includes('video'))
        return <Video size={14} className="text-purple-500" />;
      if (fav.name.toLowerCase().includes('code')) return <Music size={14} className="text-pink-500" />;
      return <Folder size={14} className="text-amber-500 fill-amber-400/20" />;
    }
    return <File size={14} className="text-blue-400" />;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-over Drawer on Mobile */}
      <aside
        onContextMenu={(e) => {
          e.preventDefault();
          openContextMenu(e.clientX, e.clientY, null, { sidebarEmpty: true });
        }}
        className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-0
          w-[85vw] max-w-xs md:w-56 bg-gray-50 dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#333333]
          flex flex-col h-full text-xs select-none shrink-0 overflow-y-auto
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Drawer Header with Close Button & Mode Switcher */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Navigation</span>
            <button
              onClick={() => {
                const currentMode = getDataSourceMode();
                const nextMode = currentMode === 'mock' ? 'real' : 'mock';
                if (
                  confirm(
                    nextMode === 'real'
                      ? 'Switch to Live Server? (Ensure the Rust backend is running on port 8866)'
                      : 'Switch to Mock Demo mode?'
                  )
                ) {
                  setDataSourceMode(nextMode);
                }
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                getDataSourceMode() === 'mock'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {getDataSourceMode() === 'mock' ? (
                <>
                  <FlaskConical size={10} className="animate-pulse" />
                  <span>Mock Demo</span>
                </>
              ) : (
                <>
                  <Database size={10} />
                  <span>Live Server</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. ⭐ Favorites & Pinned Items Section */}
        <div className="p-2">
          <div
            onClick={() => setIsFavOpen(!isFavOpen)}
            className="flex items-center justify-between px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
          >
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-500 fill-amber-400" />
              <span>Favorites</span>
              <span className="text-[10px] text-gray-400 font-normal">({favorites.length})</span>
            </div>
            <button className="text-gray-400">
              {isFavOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          </div>

          {isFavOpen && (
            <div className="space-y-0.5 mt-0.5">
              {favorites.map((fav) => (
                <FavoriteRow
                  key={fav.id}
                  fav={fav}
                  icon={getFavIcon(fav)}
                  onNavigate={() => handleNavFavorite(fav)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openContextMenu(e.clientX, e.clientY, null, { sidebarFavorite: fav });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-[1px] bg-gray-200 dark:bg-[#333333] mx-2 my-1" />

        {/* 2. Storage Drives / Mount Points */}
        <div className="p-2 flex-1">
          <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Storage Drives
          </div>
          <div className="space-y-1 mt-0.5">
            {roots.map((r) => (
              <DriveItem
                key={r.name}
                r={r}
                isActive={r.name === currentRoot}
                rootTree={rootTrees[r.name]}
                onSelect={() => {
                  setCurrentRoot(r.name);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openContextMenu(e.clientX, e.clientY, null, { sidebarDrive: r.name });
                }}
              />
            ))}
          </div>
        </div>

        {/* 3. Bottom Utility Hub: Shared Links & Trash Bin */}
        <div className="p-2 border-t border-gray-200 dark:border-[#333333] space-y-1">
          <button
            onClick={() => {
              setActiveSharesOpen(true);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm md:text-xs text-left min-h-[46px] md:min-h-0"
          >
            <Share2 size={16} className="text-emerald-500 shrink-0" />
            <span>Shared Links Hub</span>
          </button>

          <TrashBinButton
            onClick={() => {
              setTrashOpen(true);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
        </div>
      </aside>
    </>
  );
};
