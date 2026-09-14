import React, { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { AddressBar } from './components/layout/AddressBar';
import { RibbonToolbar } from './components/layout/RibbonToolbar';
import { SidebarTree } from './components/layout/SidebarTree';
import { StatusBar } from './components/layout/StatusBar';
import { MillerColumnsView } from './components/views/MillerColumnsView';
import { DetailedListView } from './components/views/DetailedListView';
import { GridView } from './components/views/GridView';
import { SplitView } from './components/views/SplitView';
import { QuickLookModal } from './components/preview/QuickLookModal';
import { AudioPlayerModal } from './components/preview/AudioPlayerModal';
import { VideoPlayerModal } from './components/preview/VideoPlayerModal';
import { UploadModal } from './components/modals/UploadModal';
import { ShareModal } from './components/modals/ShareModal';
import { ActiveSharesModal } from './components/modals/ActiveSharesModal';
import { TrashBinModal } from './components/modals/TrashBinModal';
import { NewFolderModal } from './components/modals/NewFolderModal';
import { RenameModal } from './components/modals/RenameModal';
import { SetupLoginModal } from './components/modals/SetupLoginModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ContextMenu } from './components/common/ContextMenu';
import { MobileFloatingActionButton } from './components/common/MobileFloatingActionButton';
import { DownloadManager } from './components/download/DownloadManager';
import { CommandPalette } from './components/search/CommandPalette';
import { useExplorerStore } from './stores/useExplorerStore';
import { useAuthStore } from './stores/useAuthStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { FileIcon } from './components/common/FileIcon';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import { useWindowFileDrop } from './hooks/useWindowFileDrop';

export const App: React.FC = () => {
  const {
    currentRoot,
    currentPath,
    viewMode,
    isSplitView,
    fetchRoots,
    searchResults,
    clearSearch,
    navigateTo,
    setQuickLookOpen,
    selectItem,
    openContextMenu,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    audioTrack,
    playAudio,
    playVideo,
    closeAudioPlayer,
    setViewMode,
    startDirectUpload,
    uploadStatus,
    dismissUploadStatus,
  } = useExplorerStore();

  const { isDraggingOver } = useWindowFileDrop({
    onFilesDrop: (files) => {
      if (currentRoot) {
        startDirectUpload(currentRoot, currentPath, files);
      }
    },
  });

  const { checkAuth } = useAuthStore();
  const { preferences } = useSettingsStore();
  const { isConnected: wsConnected } = useWebSocket();
  useKeyboardShortcuts();

  useEffect(() => {
    fetchRoots();
    checkAuth();
    if (preferences.defaultViewMode) {
      setViewMode(preferences.defaultViewMode);
    }
  }, [fetchRoots, checkAuth, preferences.defaultViewMode, setViewMode]);

  // Global right-click interceptor:
  // Disables default browser context menu everywhere across the app,
  // while preserving native copy/cut/paste on editable inputs/textareas.
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const isEditable =
          (target instanceof HTMLInputElement &&
            !target.readOnly &&
            !target.disabled &&
            ['text', 'search', 'password', 'url', 'number', 'email'].includes(target.type)) ||
          (target instanceof HTMLTextAreaElement && !target.readOnly && !target.disabled) ||
          target.isContentEditable;

        if (isEditable) {
          return;
        }
      }

      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, []);

  return (
    <div className="flex flex-col h-screen h-[100dvh] max-h-[100dvh] w-screen bg-[#f3f3f3] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 overflow-hidden font-sans pb-[env(safe-area-inset-bottom,0px)]">
      {/* 1. Windows Explorer Top Title & Search Bar */}
      <TitleBar />

      {/* 2. Windows Explorer Breadcrumb & Address Bar */}
      <AddressBar />

      {/* 3. Action Ribbon Toolbar */}
      <RibbonToolbar />

      {/* 4. Main Body: Windows Explorer Left Tree + macOS Finder Center/Right View */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        <SidebarTree />

        {/* Search Results Overlay View */}
        {searchResults !== null ? (
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              openContextMenu(e.clientX, e.clientY, null, { searchResultsBackground: true });
            }}
            className="flex-1 flex flex-col overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333] mb-4">
              <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                Search Results ({searchResults.length} found)
              </span>
              <button
                onClick={clearSearch}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-gray-400 text-xs italic text-center py-8">
                No matching files or folders found.
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => selectItem(item, false)}
                    onDoubleClick={async () => {
                      clearSearch();
                      if (item.is_dir) {
                        await navigateTo(item.path);
                      } else {
                        const lastSlash = item.path.lastIndexOf('/');
                        const parentDir = lastSlash !== -1 ? item.path.slice(0, lastSlash) : '';
                        await navigateTo(parentDir);
                        selectItem(item, false);
                        if (item.media_type === 'video') {
                          playVideo(item);
                        } else if (item.media_type === 'audio') {
                          playAudio(item);
                        } else {
                          setQuickLookOpen(true);
                        }
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      selectItem(item, false);
                      openContextMenu(e.clientX, e.clientY, item);
                    }}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2d2e] cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon item={item} size={16} />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="text-[11px] text-gray-400 truncate">in /{item.path}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {item.is_dir ? 'Folder' : item.human_size}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isSplitView ? (
          /* Dual-Pane Split View */
          <SplitView />
        ) : (
          /* Main Single-Pane Explorer Views */
          <main className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'columns' && <MillerColumnsView />}
            {viewMode === 'list' && <DetailedListView />}
            {viewMode === 'grid' && <GridView />}
          </main>
        )}
      </div>

      {/* 5. Status Bar */}
      <StatusBar wsConnected={wsConnected} />

      {/* 6. Modals & Overlays */}
      <QuickLookModal />
      <UploadModal />
      <ShareModal />
      <ActiveSharesModal />
      <TrashBinModal />
      <NewFolderModal />
      <RenameModal />
      <SetupLoginModal />
      <SettingsModal />
      <VideoPlayerModal />

      {/* 7. Universal Context Menu */}
      <ContextMenu />

      {/* 8. Live Progress Download Manager */}
      <DownloadManager />

      {/* 9. Power Search & Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* 10. Persistent Music Player */}
      <AudioPlayerModal
        item={audioTrack}
        root={currentRoot}
        onClose={closeAudioPlayer}
      />

      {/* 11. External Drag & Drop Upload Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 dark:bg-blue-500/25 backdrop-blur-xs border-4 border-dashed border-blue-500 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="bg-white/95 dark:bg-[#252526]/95 border border-blue-500/40 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-center max-w-sm mx-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <UploadCloud size={36} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Drop Files to Upload
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Files will be uploaded directly to{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  /{currentPath || currentRoot}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 12. Floating Direct Upload Status Pill */}
      {uploadStatus && (
        <div className="fixed bottom-8 left-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3c3c3c] rounded-full shadow-2xl text-xs select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="relative flex items-center justify-center">
            {uploadStatus.isUploading ? (
              <UploadCloud size={16} className="text-blue-500 animate-pulse" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-500" />
            )}
          </div>

          <div className="flex flex-col min-w-[120px] max-w-[200px]">
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {uploadStatus.isUploading
                ? `Uploading ${uploadStatus.currentFileName || ''}`
                : `Uploaded ${uploadStatus.count} item${uploadStatus.count > 1 ? 's' : ''}`}
            </span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-150 ${
                  uploadStatus.isUploading ? 'bg-blue-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${uploadStatus.progress}%` }}
              />
            </div>
          </div>

          <span className="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400">
            {uploadStatus.progress}%
          </span>

          <button
            onClick={dismissUploadStatus}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#333333] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 11. Mobile Thumb-Zone Floating Action Button */}
      <MobileFloatingActionButton />
    </div>
  );
};
