import React, { useState } from 'react';
import {
  Copy,
  FolderInput,
  RefreshCw,
  X,
  Columns,
  List,
  LayoutGrid,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileItem } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { ThumbnailPreview } from '../common/ThumbnailPreview';
import { MillerColumnsView } from './MillerColumnsView';
import { formatDisplayPath } from '../layout/AddressBar';
import { api } from '../../services/api';

export const SplitView: React.FC = () => {
  const {
    currentRoot,
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
    rightPaneActiveItem,
    selectRightPaneItem,
    selectRightPaneMultiple,
    navigateRightPane,

    activeItem,
    selectMultiple,
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
    startDirectUpload,
    refresh,
  } = useExplorerStore();

  // Mobile active tab ('left' | 'right')
  const [mobileTab, setMobileTab] = useState<'left' | 'right'>('left');
  const [leftPaneDropping, setLeftPaneDropping] = useState(false);
  const [rightPaneDropping, setRightPaneDropping] = useState(false);

  const handleItemClick = (pane: 'left' | 'right', item: FileItem, e: React.MouseEvent) => {
    setActivePane(pane);
    const isLeft = pane === 'left';
    const active = isLeft ? activeItem : rightPaneActiveItem;
    const items = isLeft ? listing?.items || [] : rightPaneListing?.items || [];

    if (e.shiftKey && active && items.length > 0) {
      const fromIdx = items.findIndex((i) => i.path === active.path);
      const toIdx = items.findIndex((i) => i.path === item.path);
      if (fromIdx !== -1 && toIdx !== -1) {
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        const range = items.slice(start, end + 1);
        if (isLeft) {
          selectMultiple(range);
        } else {
          selectRightPaneMultiple(range);
        }
        return;
      }
    }

    const isMulti = e.ctrlKey || e.metaKey;
    if (isLeft) {
      selectItem(item, isMulti);
    } else {
      selectRightPaneItem(item, isMulti);
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

  const handleDragStart = (
    pane: 'left' | 'right',
    item: FileItem,
    e: React.DragEvent
  ) => {
    const isLeft = pane === 'left';
    const selected = isLeft ? selectedItems : rightPaneSelectedItems;
    const isSelectedAlready = selected.some((i) => i.path === item.path);
    const itemsToDrag = isSelectedAlready ? selected : [item];

    if (!isSelectedAlready) {
      if (isLeft) {
        selectItem(item, false);
      } else {
        selectRightPaneItem(item, false);
      }
    }

    e.dataTransfer.setData(
      'application/x-kv-file',
      JSON.stringify({
        root: currentRoot,
        items: itemsToDrag.map((i) => ({ name: i.name, path: i.path, is_dir: i.is_dir })),
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';

    if (itemsToDrag.length > 1) {
      const ghost = document.createElement('div');
      ghost.className =
        'fixed -top-[9999px] -left-[9999px] bg-blue-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 z-50 pointer-events-none border border-white/20';
      ghost.innerHTML = `<span>${itemsToDrag.length} items</span>`;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 20, 20);
      setTimeout(() => document.body.removeChild(ghost), 100);
    }
  };

  const handlePaneDragOver = (pane: 'left' | 'right', e: React.DragEvent) => {
    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
    const isFiles = e.dataTransfer.types.includes('Files');
    if (isInternal || isFiles) {
      e.preventDefault();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      if (pane === 'left' && !leftPaneDropping) setLeftPaneDropping(true);
      if (pane === 'right' && !rightPaneDropping) setRightPaneDropping(true);
    }
  };

  const handlePaneDragLeave = (pane: 'left' | 'right', e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (pane === 'left') setLeftPaneDropping(false);
      if (pane === 'right') setRightPaneDropping(false);
    }
  };

  const handlePaneDrop = async (
    pane: 'left' | 'right',
    targetFolderPath: string,
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (pane === 'left') setLeftPaneDropping(false);
    if (pane === 'right') setRightPaneDropping(false);

    // 1. External OS file upload
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      const files = Array.from(e.dataTransfer.files);
      await startDirectUpload(currentRoot, targetFolderPath, files);
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
        if (targetFolderPath === src.path || targetFolderPath.startsWith(`${src.path}/`)) {
          continue;
        }
        const parentPath = src.path.includes('/')
          ? src.path.substring(0, src.path.lastIndexOf('/'))
          : '';
        if (!isCopy && parentPath === targetFolderPath) {
          continue;
        }

        if (isCopy) {
          await api.copyItem(root, src.path, targetFolderPath);
        } else {
          await api.moveItem(root, src.path, targetFolderPath);
        }
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle split view drop:', err);
    }
  };

  const renderPaneContent = (pane: 'left' | 'right') => {
    const isLeft = pane === 'left';
    const items = isLeft ? listing?.items || [] : rightPaneListing?.items || [];
    const mode = isLeft ? viewMode : rightPaneViewMode;
    const selected = isLeft ? selectedItems : rightPaneSelectedItems;
    const isDropping = isLeft ? leftPaneDropping : rightPaneDropping;
    const targetPath = isLeft ? currentPath : rightPanePath;

    let content: React.ReactNode = null;

    if (isLeft && mode === 'columns') {
      content = <MillerColumnsView />;
    } else if (mode === 'grid') {
      content = (
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
                draggable={true}
                onDragStart={(e) => handleDragStart(pane, item, e)}
                onDragOver={(e) => {
                  if (item.is_dir) {
                    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
                    const isFiles = e.dataTransfer.types.includes('Files');
                    if (isInternal || isFiles) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
                    }
                  }
                }}
                onDrop={(e) => {
                  if (item.is_dir) {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePaneDrop(pane, item.path, e);
                  }
                }}
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
                <div className="w-full h-24 mb-1.5 rounded-lg overflow-hidden border border-gray-200/50 dark:border-[#383838] bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                  <ThumbnailPreview item={item} size="sm" />
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
    } else {
      // Default: Detailed List
      content = (
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
                  draggable={true}
                  onDragStart={(e) => handleDragStart(pane, item, e)}
                  onDragOver={(e) => {
                    if (item.is_dir) {
                      const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
                      const isFiles = e.dataTransfer.types.includes('Files');
                      if (isInternal || isFiles) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
                      }
                    }
                  }}
                  onDrop={(e) => {
                    if (item.is_dir) {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePaneDrop(pane, item.path, e);
                    }
                  }}
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
    }

    return (
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        onDragOver={(e) => handlePaneDragOver(pane, e)}
        onDragLeave={(e) => handlePaneDragLeave(pane, e)}
        onDrop={(e) => handlePaneDrop(pane, targetPath, e)}
      >
        {isDropping && (
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 border-2 border-dashed border-blue-500 z-20 pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white/95 dark:bg-[#202020]/95 px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/50">
              <span>Drop to transfer into {isLeft ? 'Pane 1' : 'Pane 2'}</span>
            </div>
          </div>
        )}
        {content}
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
          <span>Pane 1: {formatDisplayPath(currentPath)}</span>
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
          <span>Pane 2: {formatDisplayPath(rightPanePath)}</span>
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
              <span className="text-gray-400 font-normal">{formatDisplayPath(currentPath)}</span>
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
              <span className="text-gray-400 font-normal">{formatDisplayPath(rightPanePath)}</span>
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
