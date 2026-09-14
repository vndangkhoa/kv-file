import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { api } from '../../services/api';

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
  } = useExplorerStore();

  const { startDownload } = useDownloadStore();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavoritesStore();
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const { x, y, item, sidebarNode, sidebarDrive, sidebarFavorite } = contextMenu;

  // Viewport bounding
  const menuWidth = 230;
  const menuHeight = item || sidebarNode || sidebarFavorite ? 320 : 180;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  const isAudio = item && item.media_type === 'audio';
  const isVideo = item && (item.media_type === 'video' || ['mp4', 'mov', 'webm', 'mkv'].includes(item.extension?.toLowerCase() || ''));

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-56 bg-white/95 dark:bg-[#252526]/95 backdrop-blur-md border border-gray-200 dark:border-[#3a3d41] rounded-xl shadow-2xl py-1.5 text-xs text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-[#333333] animate-in fade-in zoom-in-95 duration-100 select-none"
    >
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-colors"
            >
              <StarOff size={15} />
              <span>Remove from Favorites</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(sidebarFavorite.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              <HardDrive size={15} />
              <span>Open Drive "{sidebarDrive}"</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors text-amber-600 dark:text-amber-400"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Archive size={15} />
              <span>Download Folder as ZIP</span>
            </button>
          </div>

          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                navigator.clipboard.writeText(sidebarNode.path);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Copy size={15} />
              <span>Copy Path</span>
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
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye size={15} />
                    <span className="font-medium">Quick Look</span>
                  </div>
                  <kbd className="text-[10px] opacity-60">Space</kbd>
                </button>

                {isAudio && (
                  <button
                    onClick={() => {
                      closeContextMenu();
                      playAudio(item);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-purple-600 dark:text-purple-400"
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
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 dark:text-blue-400 font-medium"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors text-amber-600 dark:text-amber-400"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Scissors size={15} />
                <span>Cut</span>
              </div>
              <kbd className="text-[10px] opacity-60">Ctrl+X</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setClipboard('copy', [item]);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Copy size={15} />
                <span>Copy</span>
              </div>
              <kbd className="text-[10px] opacity-60">Ctrl+C</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setRenameOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Edit2 size={15} />
                <span>Rename</span>
              </div>
              <kbd className="text-[10px] opacity-60">F2</kbd>
            </button>
          </div>

          {/* Delete actions */}
          <div className="px-1 py-1">
            <button
              onClick={() => {
                closeContextMenu();
                deleteSelectedItem(item, false);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-amber-600 hover:text-white text-amber-600 dark:text-amber-400 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={15} />
                <span>Move to Trash</span>
              </div>
              <kbd className="text-[10px] opacity-60">Del</kbd>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                if (confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
                  deleteSelectedItem(item, true);
                }
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trash size={15} />
                <span>Delete Permanently</span>
              </div>
              <kbd className="text-[10px] opacity-60">Shift+Del</kbd>
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FolderPlus size={15} />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                setUploadOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Upload size={15} />
              <span>Upload Files</span>
            </button>
          </div>

          <div className="px-1 py-1">
            {clipboard && (
              <button
                onClick={() => {
                  closeContextMenu();
                  pasteClipboard();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium text-blue-600 dark:text-blue-400"
              >
                <div className="flex items-center gap-2.5">
                  <Copy size={15} />
                  <span>Paste {clipboard.items.length} item{clipboard.items.length > 1 ? 's' : ''}</span>
                </div>
                <kbd className="text-[10px] opacity-60">Ctrl+V</kbd>
              </button>
            )}

            <button
              onClick={() => {
                closeContextMenu();
                refresh();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                closeContextMenu();
                toggleSplitView();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Columns size={15} />
              <span>{isSplitView ? 'Close Split View' : 'Toggle Split View'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
