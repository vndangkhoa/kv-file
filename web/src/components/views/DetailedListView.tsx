import React, { useState } from 'react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileIcon } from '../common/FileIcon';
import { FileItem } from '../../types';
import { formatDate } from '../../utils/format';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'mod_time' | 'size' | 'type';

export const DetailedListView: React.FC = () => {
  const {
    listing,
    selectedItems,
    selectItem,
    navigateTo,
    setQuickLookOpen,
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

  const handleItemClick = (e: React.MouseEvent, item: FileItem) => {
    const isMulti = e.ctrlKey || e.metaKey;
    selectItem(item, isMulti);
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.is_dir) {
      navigateTo(item.path);
    } else {
      setQuickLookOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1e1e1e] select-none text-xs">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-200 dark:border-[#333333] text-gray-500 font-medium shrink-0 bg-gray-50 dark:bg-[#252526]">
        <div
          onClick={() => handleSort('name')}
          className="col-span-6 flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>Name</span>
          <ArrowUpDown size={12} />
        </div>

        <div
          onClick={() => handleSort('mod_time')}
          className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>Date Modified</span>
          <ArrowUpDown size={12} />
        </div>

        <div
          onClick={() => handleSort('type')}
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        >
          <span>Type</span>
          <ArrowUpDown size={12} />
        </div>

        <div
          onClick={() => handleSort('size')}
          className="col-span-1 flex items-center justify-end gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 text-right"
        >
          <span>Size</span>
          <ArrowUpDown size={12} />
        </div>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto">
        {sortedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            This folder is empty
          </div>
        ) : (
          sortedItems.map((item) => {
            const isSelected = selectedItems.some((i) => i.path === item.path);

            return (
              <div
                key={item.path}
                onClick={(e) => handleItemClick(e, item)}
                onDoubleClick={() => handleDoubleClick(item)}
                className={`grid grid-cols-12 gap-2 px-3 py-1.5 cursor-pointer items-center border-b border-gray-100 dark:border-[#2a2a2a] transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-900 dark:bg-[#0078d4]/30 dark:text-blue-200'
                    : 'hover:bg-gray-50 dark:hover:bg-[#252526] text-gray-800 dark:text-gray-300'
                }`}
              >
                <div className="col-span-6 flex items-center gap-2 truncate">
                  <FileIcon item={item} size={16} />
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="col-span-3 text-gray-500 truncate">
                  {formatDate(item.mod_time)}
                </div>

                <div className="col-span-2 text-gray-500 truncate capitalize">
                  {item.is_dir ? 'Folder' : item.extension ? `${item.extension.toUpperCase()} File` : 'File'}
                </div>

                <div className="col-span-1 text-right text-gray-500 truncate font-mono">
                  {item.is_dir ? '--' : item.human_size}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
