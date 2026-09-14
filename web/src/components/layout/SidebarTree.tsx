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
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useFavoritesStore, FavoriteItem } from '../../stores/useFavoritesStore';
import { useLongPress } from '../../hooks/useLongPress';
import { api } from '../../services/api';
import { TreeNode } from '../../types';

interface TreeItemProps {
  node: TreeNode;
  level: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, level }) => {
  const { currentPath, currentRoot, navigateTo, setSidebarOpen, openContextMenu } =
    useExplorerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<TreeNode[] | null>(node.children || null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div>
      <div
        {...longPressProps}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`flex items-center gap-1.5 py-1.5 md:py-1 pr-2 rounded text-xs cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-800 dark:bg-[#0078d4]/30 dark:text-blue-300 font-medium'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
        }`}
      >
        <button
          onClick={toggleOpen}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-blue-500 border-t-transparent animate-spin rounded-full" />
          ) : isOpen ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronRight size={13} />
          )}
        </button>

        <Folder size={14} className="text-amber-500 fill-amber-400/20 shrink-0" />
        <span className="truncate">{node.name}</span>
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
        className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-0
          w-64 md:w-56 bg-gray-50 dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#333333]
          flex flex-col h-full text-xs select-none shrink-0 overflow-y-auto
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#333333]">
          <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
          >
            <X size={16} />
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
                <button
                  key={fav.id}
                  onClick={() => handleNavFavorite(fav)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openContextMenu(e.clientX, e.clientY, null, { sidebarFavorite: fav });
                  }}
                  className="w-full group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300 text-left transition-colors"
                >
                  {getFavIcon(fav)}
                  <span className="truncate flex-1 font-medium">{fav.name}</span>
                  <Star
                    size={11}
                    className="text-amber-400/40 group-hover:text-amber-400 fill-amber-400/30 shrink-0"
                  />
                </button>
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
            {roots.map((r) => {
              const isActive = r.name === currentRoot;
              const usedPercent =
                r.total_bytes > 0 ? Math.round((r.used_bytes / r.total_bytes) * 100) : 0;

              return (
                <div key={r.name} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setCurrentRoot(r.name);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openContextMenu(e.clientX, e.clientY, null, { sidebarDrive: r.name });
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 md:py-1.5 rounded transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-800 dark:bg-[#0078d4]/20 dark:text-blue-300 font-semibold'
                        : 'hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <HardDrive size={14} className={isActive ? 'text-blue-500' : 'text-gray-500'} />
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
                  {isActive && rootTrees[r.name] && (
                    <div className="mt-1">
                      {rootTrees[r.name].children?.map((child) => (
                        <TreeItem key={child.path} node={child} level={0} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Utility Hub: Shared Links & Trash Bin */}
        <div className="p-2 border-t border-gray-200 dark:border-[#333333] space-y-1">
          <button
            onClick={() => {
              setActiveSharesOpen(true);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-left"
          >
            <Share2 size={14} className="text-emerald-500" />
            <span>Shared Links Hub</span>
          </button>

          <button
            onClick={() => {
              setTrashOpen(true);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-left"
          >
            <Trash2 size={14} className="text-gray-500 group-hover:text-red-500" />
            <span>Trash Bin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
