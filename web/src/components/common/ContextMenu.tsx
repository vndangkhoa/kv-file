import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Download,
  Share2,
  Scissors,
  Copy,
  FolderPlus,
  Upload,
  Edit2,
  Trash2,
  Trash,
  RefreshCw,
  Columns,
  Music,
  Film,
  Link,
  Terminal,
  Archive,
  Star,
  StarOff,
  Folder,
  HardDrive,
  List,
  LayoutGrid,
  CheckSquare,
  Search,
  Settings,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FileIcon } from './FileIcon';
import { api } from '../../services/api';
import { formatDisplayPath } from '../layout/AddressBar';

export const ContextMenu: React.FC = () => {
  const {
    contextMenu,
    closeContextMenu,
    currentRoot,
    setCurrentRoot,
    setQuickLookOpen,
    setShareModalOpen,
    setRenameOpen,
    setNewFolderOpen,
    setUploadOpen,
    setClipboard,
    clipboard,
    pasteClipboard,
    deleteSelectedItem,
    refresh,
    navigateTo,
    playAudio,
    playVideo,
    toggleSplitView,
    isSplitView,
    navigateRightPane,
    viewMode,
    setViewMode,
    selectAll,
    fetchRoots,
    clearSearch,
  } = useExplorerStore();

  const { openSettings } = useSettingsStore();
  const { startDownload } = useDownloadStore();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavoritesStore();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close context menu on click outside or Escape
  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleDown);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu) return null;

  const {
    x,
    y,
    item,
    sidebarNode,
    sidebarDrive,
    sidebarFavorite,
    breadcrumb,
    sidebarEmpty,
    toolbar,
    searchResultsBackground,
  } = contextMenu;

  // Viewport bounding
  const menuWidth = 230;
  const menuHeight =
    item || sidebarNode || sidebarFavorite || toolbar || breadcrumb ? 340 : 220;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  const isAudio = item && item.media_type === 'audio';
  const isVideo = item && (item.media_type === 'video' || ['mp4', 'mov', 'webm', 'mkv'].includes(item.extension?.toLowerCase() || ''));

  return (
    <>
      {/* Mobile Dimmed Backdrop */}
      {isMobile && (
        <div
          onClick={closeContextMenu}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
        />
      )}

      <div
        ref={menuRef}
        style={isMobile ? undefined : { left: `${adjustedX}px`, top: `${adjustedY}px` }}
        className={`fixed z-50 bg-white dark:bg-[#252526] md:bg-white/95 md:dark:bg-[#252526]/95 md:backdrop-blur-md border border-gray-200 dark:border-[#3a3d41] text-gray-800 dark:text-gray-200 select-none divide-y divide-gray-100 dark:divide-[#333333] shadow-2xl transition-all ${
          isMobile
            ? 'inset-x-0 bottom-0 rounded-t-2xl p-3 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm'
            : 'w-56 rounded-xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100'
        }`}
      >
        {/* Mobile Header with Drag Handle & Item Title */}
        {isMobile && (
          <div className="flex flex-col items-center pb-2.5 pt-1 shrink-0">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
            {(item || sidebarNode || sidebarFavorite || sidebarDrive || breadcrumb || toolbar || sidebarEmpty || searchResultsBackground) && (
              <div className="flex items-center gap-2 px-2 text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[90%]">
                {item ? (
                  <FileIcon item={item} size={16} />
                ) : sidebarDrive ? (
                  <HardDrive size={15} className="text-blue-500" />
                ) : sidebarFavorite ? (
                  <Star size={15} className="text-amber-500" />
                ) : breadcrumb ? (
                  <Folder size={15} className="text-amber-500" />
                ) : toolbar ? (
                  <Settings size={15} className="text-blue-500" />
                ) : sidebarEmpty ? (
                  <HardDrive size={15} className="text-blue-500" />
                ) : (
                  <Folder size={15} className="text-amber-500" />
                )}
                <span className="truncate">
                  {item?.name ||
                    sidebarNode?.name ||
                    sidebarFavorite?.name ||
                    sidebarDrive ||
                    breadcrumb?.name ||
                    (toolbar ? 'Quick Actions' : sidebarEmpty ? 'Storage Navigation' : 'Actions')}
                </span>
              </div>
            )}
          </div>
        )}
      {/* 1. Sidebar Favorite Item Actions */}
      {sidebarFavorite ? (
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setCurrentRoot(sidebarFavorite.root_name);
                navigateTo(sidebarFavorite.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Eye size={15} />
              <span className="font-medium">Open {sidebarFavorite.name}</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                if (!isSplitView) toggleSplitView();
                navigateRightPane(sidebarFavorite.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>Open in Split View</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                removeFavorite(sidebarFavorite.id);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-colors"
            >
              <StarOff size={15} />
              <span>Remove from Favorites</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(formatDisplayPath(sidebarFavorite.path));
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Path</span>
            </button>
          </div>
        </>
      ) : sidebarDrive ? (
        /* 2. Sidebar Storage Drive Actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setCurrentRoot(sidebarDrive);
                navigateTo('');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <HardDrive size={15} />
              <span>Open Drive "{sidebarDrive}"</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh Drive Tree</span>
            </button>
          </div>
        </>
      ) : sidebarNode ? (
        /* 3. Sidebar Folder Tree Node Actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigateTo(sidebarNode.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <Folder size={15} />
              <span>Open Folder</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                if (!isSplitView) toggleSplitView();
                navigateRightPane(sidebarNode.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>Open in Split View</span>
            </button>

            {/* Toggle Favorite */}
            <button
              onClick={() => {
                closeContextMenu();
                toggleFavorite(currentRoot, {
                  name: sidebarNode.name,
                  path: sidebarNode.path,
                  is_dir: true,
                });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-yellow-500 hover:text-white transition-colors text-amber-600 dark:text-amber-400"
            >
              {isFavorite(currentRoot, sidebarNode.path) ? (
                <>
                  <StarOff size={15} />
                  <span>Remove from Favorites</span>
                </>
              ) : (
                <>
                  <Star size={15} className="fill-amber-400/30" />
                  <span>Pin to Favorites</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                startDownload(currentRoot, {
                  name: sidebarNode.name,
                  path: sidebarNode.path,
                  is_dir: true,
                  root_name: currentRoot,
                  size: 0,
                  human_size: '0 B',
                  mod_time: new Date().toISOString(),
                  extension: '',
                  media_type: 'archive',
                  mime_type: 'application/zip',
                });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Archive size={15} />
              <span>Download Folder as ZIP</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(formatDisplayPath(sidebarNode.path));
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Path</span>
            </button>
          </div>
        </>
      ) : breadcrumb ? (
        /* 4. Breadcrumb actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigateTo(breadcrumb.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <Folder size={15} />
              <span>Open "{breadcrumb.name}"</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                if (!isSplitView) toggleSplitView();
                navigateRightPane(breadcrumb.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>Open in Split View</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(formatDisplayPath(breadcrumb.path));
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Full Path</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(breadcrumb.name);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Name</span>
            </button>
          </div>
        </>
      ) : sidebarEmpty ? (
        /* 5. Empty Sidebar Canvas Actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigateTo('');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <HardDrive size={15} />
              <span>Go to Root Drive</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
                fetchRoots();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh Drives & Tree</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setNewFolderOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FolderPlus size={15} />
              <span>New Folder in Current Drive</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setUploadOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Upload size={15} />
              <span>Upload Files</span>
            </button>
          </div>
        </>
      ) : toolbar ? (
        /* 6. Title Bar / Ribbon / Address Bar / Status Bar Actions */
        <>
          <div className="px-1 py-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              View Layout
            </div>
            <button
              onClick={() => {
                closeContextMenu();
                setViewMode('columns');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg transition-colors ${
                viewMode === 'columns'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'hover:bg-blue-600 hover:text-white'
              }`}
            >
              <Columns size={15} />
              <span>Miller Columns View</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setViewMode('list');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'hover:bg-blue-600 hover:text-white'
              }`}
            >
              <List size={15} />
              <span>Detailed List View</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setViewMode('grid');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'hover:bg-blue-600 hover:text-white'
              }`}
            >
              <LayoutGrid size={15} />
              <span>Grid Icons View</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                toggleSplitView();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>{isSplitView ? 'Close Split View' : 'Open Split View'}</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh Window (F5)</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                openSettings('account');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Settings size={15} />
              <span>Open Settings (Ctrl+,)</span>
            </button>
          </div>
        </>
      ) : searchResultsBackground ? (
        /* 7. Search Results Canvas Actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                clearSearch();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <Search size={15} />
              <span>Clear Search Results</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setNewFolderOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FolderPlus size={15} />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setUploadOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Upload size={15} />
              <span>Upload Files</span>
            </button>
          </div>
        </>
      ) : item ? (
        /* 4. Explorer Item-specific actions */
        <>
          <div className="px-1 py-1">
            {/* Open / Preview */}
            {item.is_dir ? (
              <button
                onClick={() => {
                  closeContextMenu();
                  navigateTo(item.path);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Eye size={15} />
                <span className="font-medium">Open Folder</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeContextMenu();
                    setQuickLookOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye size={15} />
                    <span className="font-medium">Quick Look</span>
                  </div>
                  <kbd className="hidden sm:inline text-[10px] opacity-60">Space</kbd>
                </button>

                {isAudio && (
                  <button
                    onClick={() => {
                      closeContextMenu();
                      playAudio(item);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-purple-600 dark:text-purple-400"
                  >
                    <Music size={15} />
                    <span className="font-medium">Play in Music Player</span>
                  </button>
                )}

                {isVideo && (
                  <button
                    onClick={() => {
                      closeContextMenu();
                      playVideo(item);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 dark:text-blue-400 font-medium"
                  >
                    <Film size={15} />
                    <span>Play in Video Player</span>
                  </button>
                )}
              </>
            )}

            {/* Favorite Pin / Unpin */}
            <button
              onClick={() => {
                closeContextMenu();
                toggleFavorite(currentRoot, item);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-yellow-500 hover:text-white transition-colors text-amber-600 dark:text-amber-400"
            >
              {isFavorite(currentRoot, item.path) ? (
                <>
                  <StarOff size={15} />
                  <span>Remove from Favorites</span>
                </>
              ) : (
                <>
                  <Star size={15} className="fill-amber-400/30" />
                  <span>Add to Favorites</span>
                </>
              )}
            </button>

            {/* Direct Download with live progress / ZIP for folders */}
            <button
              onClick={() => {
                closeContextMenu();
                startDownload(currentRoot, item);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              {item.is_dir ? <Archive size={15} /> : <Download size={15} />}
              <span>{item.is_dir ? 'Download Folder as ZIP' : 'Direct Download'}</span>
            </button>

            {/* Copy Download Link */}
            <button
              onClick={() => {
                closeContextMenu();
                const url = `${window.location.origin}${api.getDownloadUrl(currentRoot, item.path)}`;
                navigator.clipboard.writeText(url);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Link size={15} />
              <span>Copy Download Link</span>
            </button>

            {/* Copy curl Command */}
            <button
              onClick={() => {
                closeContextMenu();
                const url = `${window.location.origin}${api.getDownloadUrl(currentRoot, item.path)}`;
                const cmd = `curl -OJ "${url}"`;
                navigator.clipboard.writeText(cmd);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Terminal size={15} />
              <span>Copy curl Command</span>
            </button>

            {/* Share Link */}
            <button
              onClick={() => {
                closeContextMenu();
                setShareModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Share2 size={15} />
              <span>Share Link...</span>
            </button>
          </div>

          {/* Clipboard & Edit */}
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setClipboard('cut', [item]);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Scissors size={15} />
                <span>Cut</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">Ctrl+X</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setClipboard('copy', [item]);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Copy size={15} />
                <span>Copy</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">Ctrl+C</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(formatDisplayPath(item.path));
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Path</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setRenameOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Edit2 size={15} />
                <span>Rename</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">F2</kbd>
            </button>
          </div>

          {/* Delete actions */}
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                deleteSelectedItem(item, false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-amber-600 hover:text-white text-amber-600 dark:text-amber-400 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={15} />
                <span>Move to Trash</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">Del</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                if (confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
                  deleteSelectedItem(item, true);
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trash size={15} />
                <span>Delete Permanently</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">Shift+Del</kbd>
            </button>
          </div>
        </>
      ) : (
        /* 5. Background canvas actions */
        <>
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                setNewFolderOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FolderPlus size={15} />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setUploadOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Upload size={15} />
              <span>Upload Files</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                selectAll();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare size={15} />
                <span>Select All</span>
              </div>
              <kbd className="hidden sm:inline text-[10px] opacity-60">Ctrl+A</kbd>
            </button>
          </div>

          <div className="px-1 py-1">
            {clipboard && (
              <button
                onClick={() => {
                  closeContextMenu();
                  pasteClipboard();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium text-blue-600 dark:text-blue-400"
              >
                <div className="flex items-center gap-2.5">
                  <Copy size={15} />
                  <span>Paste {clipboard.items.length} item{clipboard.items.length > 1 ? 's' : ''}</span>
                </div>
                <kbd className="hidden sm:inline text-[10px] opacity-60">Ctrl+V</kbd>
              </button>
            )}

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                toggleSplitView();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>{isSplitView ? 'Close Split View' : 'Toggle Split View'}</span>
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
};
