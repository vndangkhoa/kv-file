import React, { useState } from 'react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileIcon } from '../common/FileIcon';
import { FileItem } from '../../types';
import { formatDate } from '../../utils/format';
import { ArrowUpDown, MoreVertical, Check } from 'lucide-react';
import { useLongPress } from '../../hooks/useLongPress';
import { api } from '../../services/api';

type SortKey = 'name' | 'mod_time' | 'size' | 'type';

interface DetailedListItemProps {
  item: FileItem;
  isSelected: boolean;
  currentRoot: string;
  selectedItems: FileItem[];
  startDirectUpload: (root: string, path: string, files: File[]) => Promise<void>;
  refresh: () => Promise<void>;
  onSelect: (e: React.MouseEvent, item: FileItem, forceMulti?: boolean) => void;
  onOpen: (item: FileItem) => void;
  onContextMenu: (x: number, y: number, item: FileItem) => void;
}

const DetailedListItem: React.FC<DetailedListItemProps> = ({
  item,
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

    // 1. External files dropped onto folder
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      await startDirectUpload(currentRoot, item.path, Array.from(e.dataTransfer.files));
      return;
    }

    // 2. Internal files dragged onto folder
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
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e.clientX, e.clientY, item);
      }}
      className={`group/row flex md:grid md:grid-cols-12 gap-2 md:gap-2 px-3.5 md:px-3 py-3 md:py-1.5 cursor-pointer items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a] transition-all min-h-[56px] md:min-h-0 active:bg-gray-100/70 dark:active:bg-[#282828] ${
        isDropTarget
          ? 'bg-blue-100/90 dark:bg-blue-900/50 ring-2 ring-blue-500 rounded-md'
          : isSelected
          ? 'bg-blue-100 text-blue-900 dark:bg-[#0078d4]/30 dark:text-blue-200'
          : 'hover:bg-gray-50 dark:hover:bg-[#252526] text-gray-800 dark:text-gray-300'
      }`}
    >
      {/* Left side: Icon + 2-line title/subtitle on mobile, standard layout on desktop */}
      <div className="flex-1 md:flex-initial md:col-span-8 lg:col-span-6 flex items-center gap-3 md:gap-2.5 truncate min-w-0">
        {/* Item Selection Checkbox (desktop only) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e, item, true);
          }}
          className={`hidden md:flex w-4 h-4 rounded border items-center justify-center transition-all shrink-0 cursor-pointer ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 opacity-0 group-hover/row:opacity-100'
          }`}
          title={isSelected ? 'Deselect item' : 'Select item'}
        >
          {isSelected && <Check size={11} className="stroke-[3]" />}
        </div>

        {/* Thumbnail / Icon container on mobile */}
        <div className="w-10 h-10 md:w-auto md:h-auto rounded-xl md:rounded-none bg-gray-100 dark:bg-[#282828] md:bg-transparent md:dark:bg-transparent flex items-center justify-center shrink-0">
          <FileIcon item={item} size={isMobile ? 22 : 16} />
        </div>

        {/* 2-Line Text on mobile */}
        <div className="flex flex-col truncate min-w-0">
          <span className="truncate text-sm md:text-xs font-semibold md:font-medium text-gray-900 dark:text-gray-100">
            {item.name}
          </span>
          <span className="md:hidden text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {item.is_dir ? 'Folder' : item.human_size} • {formatDate(item.mod_time)}
          </span>
        </div>
      </div>

      {/* Desktop Column: Date Modified */}
      <div className="hidden md:block md:col-span-3 text-gray-500 truncate text-xs">
        {formatDate(item.mod_time)}
      </div>

      {/* Desktop Column: File Type */}
      <div className="hidden lg:block lg:col-span-2 text-gray-500 truncate capitalize text-xs">
        {item.is_dir ? 'Folder' : item.extension ? `${item.extension.toUpperCase()} File` : 'File'}
      </div>

      {/* Right side: Desktop size + Mobile action button */}
      <div className="flex md:col-span-4 lg:col-span-1 items-center justify-end gap-1 shrink-0 text-right text-gray-500 font-mono">
        <span className="hidden md:inline truncate text-xs">{item.is_dir ? '--' : item.human_size}</span>
        {/* Mobile More Actions Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e.clientX, e.clientY, item);
          }}
          title="More Actions"
          className="md:hidden p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 active:bg-gray-200 dark:active:bg-[#333333] rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export const DetailedListView: React.FC = () => {
  const {
    currentRoot,
    listing,
    selectedItems,
    activeItem,
    selectItem,
    selectMultiple,
    selectAll,
    clearSelection,
    navigateTo,
    setQuickLookOpen,
    openContextMenu,
    playAudio,
    playVideo,
    startDirectUpload,
    refresh,
  } = useExplorerStore();

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const items = listing?.items || [];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    // Folders always stay at top
    if (a.is_dir && !b.is_dir) return -1;
    if (!a.is_dir && b.is_dir) return 1;

    let res = 0;
    switch (sortKey) {
      case 'name':
        res = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        break;
      case 'size':
        res = a.size - b.size;
        break;
      case 'mod_time':
        res = new Date(a.mod_time).getTime() - new Date(b.mod_time).getTime();
        break;
      case 'type':
        res = (a.extension || '').localeCompare(b.extension || '');
        break;
    }
    return sortAsc ? res : -res;
  });

  const handleItemClick = (e: React.MouseEvent, item: FileItem, forceMulti = false) => {
    if (e.shiftKey && activeItem && sortedItems.length > 0) {
      const fromIdx = sortedItems.findIndex((i) => i.path === activeItem.path);
      const toIdx = sortedItems.findIndex((i) => i.path === item.path);
      if (fromIdx !== -1 && toIdx !== -1) {
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        const range = sortedItems.slice(start, end + 1);
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

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, null);
      }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1e1e1e] select-none text-xs"
    >
      {/* Table Header (Desktop only) */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-200 dark:border-[#333333] text-gray-500 font-medium shrink-0 bg-gray-50 dark:bg-[#252526] items-center">
        <div className="col-span-8 sm:col-span-6 flex items-center gap-2">
          {/* Master Select All Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (selectedItems.length === sortedItems.length && sortedItems.length > 0) {
                clearSelection();
              } else {
                selectAll();
              }
            }}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              selectedItems.length > 0
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
            title={
              selectedItems.length === sortedItems.length && sortedItems.length > 0
                ? 'Deselect all'
                : 'Select all (Ctrl+A)'
            }
          >
            {selectedItems.length > 0 &&
              (selectedItems.length === sortedItems.length ? (
                <Check size={11} className="stroke-[3]" />
              ) : (
                <div className="w-2 h-0.5 bg-white rounded-full" />
              ))}
          </div>

          <div
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
          >
            <span>Name</span>
            <ArrowUpDown size={12} />
          </div>
        </div>

        <div
          onClick={() => handleSort('mod_time')}
          className="hidden sm:flex sm:col-span-3 items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>Date Modified</span>
          <ArrowUpDown size={12} />
        </div>

        <div
          onClick={() => handleSort('type')}
          className="hidden md:flex md:col-span-2 items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>Type</span>
          <ArrowUpDown size={12} />
        </div>

        <div
          onClick={() => handleSort('size')}
          className="col-span-4 sm:col-span-3 md:col-span-1 flex items-center justify-end gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 text-right"
        >
          <span>Size</span>
          <ArrowUpDown size={12} />
        </div>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {sortedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            This folder is empty
          </div>
        ) : (
          sortedItems.map((item) => {
            const isSelected = selectedItems.some((i) => i.path === item.path);

            return (
              <DetailedListItem
                key={item.path}
                item={item}
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
          })
        )}
      </div>
    </div>
  );
};
