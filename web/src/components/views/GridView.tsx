import React, { useState } from 'react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileItem } from '../../types';
import { ThumbnailPreview } from '../common/ThumbnailPreview';
import { useLongPress } from '../../hooks/useLongPress';
import { MoreVertical, Check, Eye, ZoomIn, ZoomOut, LayoutGrid } from 'lucide-react';
import { api } from '../../services/api';

type GridSize = 'compact' | 'medium' | 'large';

interface GridItemCardProps {
  item: FileItem;
  gridSize: GridSize;
  isSelected: boolean;
  currentRoot: string;
  selectedItems: FileItem[];
  startDirectUpload: (root: string, path: string, files: File[]) => Promise<void>;
  refresh: () => Promise<void>;
  onSelect: (e: React.MouseEvent, item: FileItem, forceMulti?: boolean) => void;
  onOpen: (item: FileItem) => void;
  onContextMenu: (x: number, y: number, item: FileItem) => void;
}

const GridItemCard: React.FC<GridItemCardProps> = ({
  item,
  gridSize,
  isSelected,
  currentRoot,
  selectedItems,
  startDirectUpload,
  refresh,
  onSelect,
  onOpen,
  onContextMenu,
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isDropTarget, setIsDropTarget] = useState(false);

  const longPressProps = useLongPress({
    onLongPress: (_e, clientX, clientY) => {
      onContextMenu(clientX, clientY, item);
    },
    onClick: (e) => {
      if (isMobile) {
        onOpen(item);
      } else {
        onSelect(e as unknown as React.MouseEvent, item);
      }
    },
  });

  const handleDragStart = (e: React.DragEvent) => {
    const isSelectedAlready = selectedItems.some((i) => i.path === item.path);
    const itemsToDrag = isSelectedAlready ? selectedItems : [item];

    if (!isSelectedAlready) {
      onSelect(e as unknown as React.MouseEvent, item, false);
    }

    e.dataTransfer.setData(
      'application/x-kv-file',
      JSON.stringify({ root: currentRoot, items: itemsToDrag })
    );
    e.dataTransfer.effectAllowed = 'copyMove';

    if (itemsToDrag.length > 1) {
      const badge = document.createElement('div');
      badge.className =
        'px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xl border border-blue-400 fixed -top-[1000px] left-0 pointer-events-none';
      badge.innerText = `Moving ${itemsToDrag.length} items`;
      document.body.appendChild(badge);
      e.dataTransfer.setDragImage(badge, 10, 10);
      setTimeout(() => document.body.removeChild(badge), 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (
      item.is_dir &&
      (e.dataTransfer.types.includes('application/x-kv-file') ||
        e.dataTransfer.types.includes('Files'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!item.is_dir) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    // 1. External files dropped onto folder card
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      await startDirectUpload(currentRoot, item.path, Array.from(e.dataTransfer.files));
      return;
    }

    // 2. Internal files dragged onto folder card
    const raw = e.dataTransfer.getData('application/x-kv-file');
    if (!raw) return;

    try {
      const payload: { root: string; items: FileItem[] } = JSON.parse(raw);
      const isCopy = e.ctrlKey || e.altKey;

      for (const src of payload.items) {
        if (item.path === src.path || item.path.startsWith(`${src.path}/`)) {
          continue;
        }
        if (isCopy) {
          await api.copyItem(payload.root, src.path, item.path);
        } else {
          await api.moveItem(payload.root, src.path, item.path);
        }
      }
      await refresh();
    } catch (err: any) {
      alert(`Move/copy failed: ${err.message}`);
    }
  };

  return (
    <div
      {...longPressProps}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => onSelect(e, item, false)}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e.clientX, e.clientY, item);
      }}
      className={`group relative flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all text-center active:scale-[0.99] ${
        isDropTarget
          ? 'bg-blue-100/90 dark:bg-blue-900/60 border-blue-500 ring-2 ring-blue-500 shadow-md scale-105'
          : isSelected
          ? 'bg-blue-50/80 border-blue-500/60 text-blue-900 dark:bg-blue-950/30 dark:border-blue-500/80 dark:text-blue-200 shadow-sm ring-2 ring-blue-500/20'
          : 'border-gray-200/50 dark:border-[#2f2f2f] hover:border-gray-300 dark:hover:border-[#444] hover:bg-gray-50/80 dark:hover:bg-[#252526] text-gray-800 dark:text-gray-200 shadow-2xs hover:shadow-sm'
      }`}
    >
      {/* Top-left Selection Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e, item, true);
        }}
        className={`absolute top-3 left-3 z-20 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
          isSelected
            ? 'bg-blue-600 border-blue-600 text-white shadow-xs opacity-100 scale-100'
            : 'border-gray-300 dark:border-gray-500 hover:border-blue-500 bg-white/90 dark:bg-[#1e1e1e]/90 opacity-0 group-hover:opacity-100 scale-95 hover:scale-105'
        }`}
        title={isSelected ? 'Deselect item' : 'Select item'}
      >
        {isSelected && <Check size={11} className="stroke-[3]" />}
      </div>

      {/* Top-right Quick Look Eye Button */}
      {!item.is_dir && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item);
          }}
          title="Quick Look (Space)"
          className="hidden sm:flex absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 hover:bg-blue-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs scale-90 group-hover:scale-100"
        >
          <Eye size={12} />
        </button>
      )}

      {/* Mobile More Actions Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e.clientX, e.clientY, item);
        }}
        title="More Actions"
        className="md:hidden absolute top-2 right-2 z-20 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 rounded-full bg-white/90 dark:bg-[#202020]/90 backdrop-blur-xs min-w-[38px] min-h-[38px] flex items-center justify-center shadow-xs active:scale-95"
      >
        <MoreVertical size={16} />
      </button>

      {/* Thumbnail Preview Area */}
      <div
        className={`w-full rounded-lg overflow-hidden border border-gray-200/50 dark:border-[#383838] bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center transition-shadow shadow-2xs group-hover:shadow-xs relative ${
          gridSize === 'compact'
            ? 'h-24'
            : gridSize === 'large'
            ? 'h-44 sm:h-52'
            : 'h-32 sm:h-36'
        }`}
      >
        <ThumbnailPreview
          item={item}
          size={gridSize === 'compact' ? 'sm' : gridSize === 'large' ? 'lg' : 'md'}
        />
      </div>

      {/* File Name & Metadata */}
      <div className="w-full mt-2 flex flex-col items-center px-1">
        <span
          className="text-xs break-words line-clamp-2 w-full font-medium leading-tight"
          title={item.name}
        >
          {item.name}
        </span>

        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mt-1 truncate">
          {!item.is_dir && <span>{item.human_size}</span>}
          {item.is_dir && item.item_count !== undefined && (
            <span>{item.item_count} items</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const GridView: React.FC = () => {
  const {
    listing,
    currentRoot,
    selectedItems,
    activeItem,
    selectItem,
    selectMultiple,
    navigateTo,
    setQuickLookOpen,
    openContextMenu,
    playAudio,
    playVideo,
    startDirectUpload,
    refresh,
  } = useExplorerStore();

  const [gridSize, setGridSize] = useState<GridSize>(() => {
    const saved = localStorage.getItem('kv_grid_size');
    return (saved as GridSize) || 'medium';
  });

  const handleGridSizeChange = (size: GridSize) => {
    setGridSize(size);
    localStorage.setItem('kv_grid_size', size);
  };

  const items = listing?.items || [];

  const handleItemClick = (e: React.MouseEvent, item: FileItem, forceMulti = false) => {
    if (e.shiftKey && activeItem && items.length > 0) {
      const fromIdx = items.findIndex((i) => i.path === activeItem.path);
      const toIdx = items.findIndex((i) => i.path === item.path);
      if (fromIdx !== -1 && toIdx !== -1) {
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        const range = items.slice(start, end + 1);
        selectMultiple(range);
        return;
      }
    }
    const isMulti = forceMulti || e.ctrlKey || e.metaKey;
    selectItem(item, isMulti);
  };

  const handleOpenItem = (item: FileItem) => {
    if (item.is_dir) {
      navigateTo(item.path);
    } else if (item.media_type === 'audio') {
      playAudio(item);
    } else if (item.media_type === 'video') {
      playVideo(item);
    } else {
      selectItem(item, false);
      setQuickLookOpen(true);
    }
  };

  const gridClass =
    gridSize === 'compact'
      ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3'
      : gridSize === 'large'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, null);
      }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1e1e1e] select-none text-xs"
    >
      {/* Grid Toolbar: Item summary + Thumbnail size switcher */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-[#333333] bg-gray-50/70 dark:bg-[#252526]/70 text-gray-500 shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          <span>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          {selectedItems.length > 0 && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              • {selectedItems.length} selected
            </span>
          )}
        </div>

        {/* Thumbnail Size Switcher */}
        <div className="flex items-center gap-1 bg-gray-200/60 dark:bg-[#1f1f1f] p-0.5 rounded border border-gray-200 dark:border-[#383838]">
          <button
            onClick={() => handleGridSizeChange('compact')}
            title="Compact Thumbnails"
            className={`p-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              gridSize === 'compact'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ZoomOut size={12} />
            <span className="hidden sm:inline">Small</span>
          </button>

          <button
            onClick={() => handleGridSizeChange('medium')}
            title="Medium Thumbnails"
            className={`p-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              gridSize === 'medium'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LayoutGrid size={12} />
            <span className="hidden sm:inline">Medium</span>
          </button>

          <button
            onClick={() => handleGridSizeChange('large')}
            title="Large Gallery Previews"
            className={`p-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              gridSize === 'large'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ZoomIn size={12} />
            <span className="hidden sm:inline">Large</span>
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 pb-24 md:pb-4">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic text-xs">
            This folder is empty
          </div>
        ) : (
          <div className={gridClass}>
            {items.map((item) => {
              const isSelected = selectedItems.some((i) => i.path === item.path);

              return (
                <GridItemCard
                  key={item.path}
                  item={item}
                  gridSize={gridSize}
                  isSelected={isSelected}
                  currentRoot={currentRoot}
                  selectedItems={selectedItems}
                  startDirectUpload={startDirectUpload}
                  refresh={refresh}
                  onSelect={handleItemClick}
                  onOpen={handleOpenItem}
                  onContextMenu={(x, y, item) => {
                    selectItem(item, false);
                    openContextMenu(x, y, item);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
