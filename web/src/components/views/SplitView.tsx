import React, { useState } from 'react';
import {
  Copy,
  FolderInput,
  RefreshCw,
  X,
  Columns,
  List,
  LayoutGrid,
  Play,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileItem } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { MillerColumnsView } from './MillerColumnsView';

export const SplitView: React.FC = () => {
  const {
    currentPath,
    listing,
    selectedItems,
    selectItem,
    navigateTo,
    viewMode,
    setViewMode,

    rightPanePath,
    rightPaneListing,
    rightPaneViewMode,
    setRightPaneViewMode,
    rightPaneSelectedItems,
    selectRightPaneItem,
    navigateRightPane,

    activePane,
    setActivePane,

    copyToOtherPane,
    moveToOtherPane,
    syncPanes,
    toggleSplitView,

    openContextMenu,
    setQuickLookOpen,
    playAudio,
    playVideo,
  } = useExplorerStore();

  // Mobile active tab ('left' | 'right')
  const [mobileTab, setMobileTab] = useState<'left' | 'right'>('left');

  const handleItemClick = (pane: 'left' | 'right', item: FileItem, e: React.MouseEvent) => {
    setActivePane(pane);
    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
    if (pane === 'left') {
      selectItem(item, isMulti);
    } else {
      selectRightPaneItem(item, isMulti);
    }
    if (!isMulti && !item.is_dir) {
      if (item.media_type === 'video') {
        playVideo(item);
      } else if (item.media_type === 'audio') {
        playAudio(item);
      }
    }
  };

  const handleItemDoubleClick = (pane: 'left' | 'right', item: FileItem) => {
    if (item.is_dir) {
      if (pane === 'left') {
        navigateTo(item.path);
      } else {
        navigateRightPane(item.path);
      }
    } else if (item.media_type === 'audio') {
      playAudio(item);
    } else if (item.media_type === 'video') {
      playVideo(item);
    } else {
      if (pane === 'left') {
        selectItem(item, false);
      } else {
        selectRightPaneItem(item, false);
      }
      setQuickLookOpen(true);
    }
  };

  const renderPaneContent = (pane: 'left' | 'right') => {
    const isLeft = pane === 'left';
    const items = isLeft ? listing?.items || [] : rightPaneListing?.items || [];
    const mode = isLeft ? viewMode : rightPaneViewMode;
    const selected = isLeft ? selectedItems : rightPaneSelectedItems;

    if (isLeft && mode === 'columns') {
      return <MillerColumnsView />;
    }

    if (mode === 'grid') {
      return (
        <div
          onClick={() => setActivePane(pane)}
          onContextMenu={(e) => {
            e.preventDefault();
            openContextMenu(e.clientX, e.clientY, null);
          }}
          className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 content-start bg-white dark:bg-[#1e1e1e]"
        >
          {items.map((item) => {
            const isSel = selected.some((s) => s.path === item.path);
            return (
              <div
                key={item.path}
                onClick={(e) => handleItemClick(pane, item, e)}
                onDoubleClick={() => handleItemDoubleClick(pane, item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleItemClick(pane, item, e);
                  openContextMenu(e.clientX, e.clientY, item);
                }}
                className={`group flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSel
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                    : 'border-gray-200/60 dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                }`}
              >
                <div className="relative mb-2 transition-transform group-hover:scale-105">
                  <FileIcon item={item} size={36} />
                  {(item.media_type === 'video' || item.media_type === 'audio') && (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center rounded-lg transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Play size={10} className="translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate w-full">
                  {item.name}
                </span>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {item.is_dir ? 'Folder' : item.human_size}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Default: Detailed List
    return (
      <div
        onClick={() => setActivePane(pane)}
        onContextMenu={(e) => {
          e.preventDefault();
          openContextMenu(e.clientX, e.clientY, null);
        }}
        className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2d2d2d] bg-white dark:bg-[#1e1e1e]"
      >
        {items.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 italic">This folder is empty</div>
        ) : (
          items.map((item) => {
            const isSel = selected.some((s) => s.path === item.path);
            return (
              <div
                key={item.path}
                onClick={(e) => handleItemClick(pane, item, e)}
                onDoubleClick={() => handleItemDoubleClick(pane, item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleItemClick(pane, item, e);
                  openContextMenu(e.clientX, e.clientY, item);
                }}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-xs ${
                  isSel
                    ? 'bg-blue-100/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-50 dark:hover:bg-[#25282a] text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileIcon item={item} size={16} />
                  <span className="font-medium truncate">{item.name}</span>
                  {(item.media_type === 'video' || item.media_type === 'audio') && (
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      {item.media_type === 'video' ? '▶ Video' : '♫ Audio'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 text-gray-400 font-mono text-[11px]">
                  <span>{item.is_dir ? '—' : item.human_size}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const activeSelectedCount =
    activePane === 'left' ? selectedItems.length : rightPaneSelectedItems.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-[#181818]">
      {/* 1. Split View Top Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-white dark:bg-[#222427] border-b border-gray-200 dark:border-[#333333] gap-2 text-xs">
        {/* Left Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={copyToOtherPane}
            disabled={activeSelectedCount === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeSelectedCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-400 cursor-not-allowed'
            }`}
            title="Copy selected to opposite pane (F5)"
          >
            <Copy size={13} />
            <span>Copy to Other Pane</span>
            {activeSelectedCount > 0 && (
              <span className="bg-blue-500/50 px-1 rounded text-[10px]">
                {activeSelectedCount}
              </span>
            )}
          </button>

          <button
            onClick={moveToOtherPane}
            disabled={activeSelectedCount === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeSelectedCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-400 cursor-not-allowed'
            }`}
            title="Move selected to opposite pane (F6)"
          >
            <FolderInput size={13} />
            <span>Move to Other Pane</span>
          </button>

          <button
            onClick={syncPanes}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 font-medium transition-colors"
            title="Sync paths between left and right pane"
          >
            <RefreshCw size={13} />
            <span>Sync Paths</span>
          </button>
        </div>

        {/* Right Actions: Close */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-gray-400 font-mono">
            Active: <strong className="text-blue-500 uppercase">{activePane} Pane</strong>
          </span>
          <button
            onClick={toggleSplitView}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Close Split View"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close Split</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile Tab Switcher (< 768px) */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1a1a1a]">
        <button
          onClick={() => {
            setMobileTab('left');
            setActivePane('left');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-colors ${
            mobileTab === 'left'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#202020]'
              : 'border-transparent text-gray-500'
          }`}
        >
          <span>Pane 1: /{currentPath || 'root'}</span>
        </button>
        <button
          onClick={() => {
            setMobileTab('right');
            setActivePane('right');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-colors ${
            mobileTab === 'right'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#202020]'
              : 'border-transparent text-gray-500'
          }`}
        >
          <span>Pane 2: /{rightPanePath || 'root'}</span>
        </button>
      </div>

      {/* 3. Dual Pane Container */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Pane */}
        <div
          className={`flex-1 flex flex-col border-r border-gray-200 dark:border-[#333333] overflow-hidden ${
            mobileTab !== 'left' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Pane Header */}
          <div
            onClick={() => setActivePane('left')}
            className={`flex items-center justify-between px-3 py-1.5 border-b cursor-pointer select-none transition-colors ${
              activePane === 'left'
                ? 'bg-blue-50 dark:bg-[#1e2330] border-blue-300 dark:border-blue-800/80 text-blue-900 dark:text-blue-100'
                : 'bg-gray-50 dark:bg-[#1a1c20] border-gray-200 dark:border-[#2d2d2d] text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-semibold">Pane 1</span>
              <span className="text-gray-400 font-normal">/{currentPath}</span>
            </div>

            {/* View Switcher for Left Pane */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('columns');
                }}
                className={`p-1 rounded ${viewMode === 'columns' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                title="Miller Columns"
              >
                <Columns size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('list');
                }}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                title="List View"
              >
                <List size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('grid');
                }}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                title="Grid View"
              >
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>

          {/* Left Pane Body */}
          {renderPaneContent('left')}
        </div>

        {/* Right Pane */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            mobileTab !== 'right' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Pane Header */}
          <div
            onClick={() => setActivePane('right')}
            className={`flex items-center justify-between px-3 py-1.5 border-b cursor-pointer select-none transition-colors ${
              activePane === 'right'
                ? 'bg-blue-50 dark:bg-[#1e2330] border-blue-300 dark:border-blue-800/80 text-blue-900 dark:text-blue-100'
                : 'bg-gray-50 dark:bg-[#1a1c20] border-gray-200 dark:border-[#2d2d2d] text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-semibold">Pane 2</span>
              <span className="text-gray-400 font-normal">/{rightPanePath}</span>
            </div>

            {/* View Switcher for Right Pane */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRightPaneViewMode('list');
                }}
                className={`p-1 rounded ${rightPaneViewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                title="List View"
              >
                <List size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRightPaneViewMode('grid');
                }}
                className={`p-1 rounded ${rightPaneViewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                title="Grid View"
              >
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>

          {/* Right Pane Body */}
          {renderPaneContent('right')}
        </div>
      </div>
    </div>
  );
};
