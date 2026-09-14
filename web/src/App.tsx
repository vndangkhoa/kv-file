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
import { DownloadManager } from './components/download/DownloadManager';
import { CommandPalette } from './components/search/CommandPalette';
import { useExplorerStore } from './stores/useExplorerStore';
import { useAuthStore } from './stores/useAuthStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { FileIcon } from './components/common/FileIcon';

export const App: React.FC = () => {
  const {
    currentRoot,
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
  } = useExplorerStore();

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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f3f3f3] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
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
          <div className="flex-1 flex flex-col overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e]">
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
                    onClick={() => {
                      selectItem(item, false);
                      if (!item.is_dir) {
                        if (item.media_type === 'video') {
                          playVideo(item);
                        } else if (item.media_type === 'audio') {
                          playAudio(item);
                        }
                      }
                    }}
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
    </div>
  );
};
