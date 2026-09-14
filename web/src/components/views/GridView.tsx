import React from 'react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileIcon } from '../common/FileIcon';
import { FileItem } from '../../types';
import { api } from '../../services/api';

export const GridView: React.FC = () => {
  const {
    listing,
    selectedItems,
    selectItem,
    navigateTo,
    setQuickLookOpen,
    openContextMenu,
    playAudio,
    playVideo,
  } = useExplorerStore();

  const items = listing?.items || [];

  const handleItemClick = (e: React.MouseEvent, item: FileItem) => {
    const isMulti = e.ctrlKey || e.metaKey;
    selectItem(item, isMulti);
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.is_dir) {
      navigateTo(item.path);
    } else if (item.media_type === 'audio') {
      playAudio(item);
    } else if (item.media_type === 'video') {
      playVideo(item);
    } else {
      setQuickLookOpen(true);
    }
  };

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, null);
      }}
      className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e] select-none"
    >
      {items.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 italic text-xs">
          This folder is empty
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {items.map((item) => {
            const isSelected = selectedItems.some((i) => i.path === item.path);

            return (
              <div
                key={item.path}
                onClick={(e) => handleItemClick(e, item)}
                onDoubleClick={() => handleDoubleClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectItem(item, false);
                  openContextMenu(e.clientX, e.clientY, item);
                }}
                className={`flex flex-col items-center p-2 rounded-lg cursor-pointer border transition-all text-center group ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500/40 text-blue-900 dark:bg-[#0078d4]/20 dark:border-blue-500/60 dark:text-blue-200 shadow-sm'
                    : 'border-transparent hover:bg-gray-100/70 dark:hover:bg-[#252526] text-gray-800 dark:text-gray-200'
                }`}
              >
                {/* Thumbnail / Icon Container */}
                <div className="w-16 h-16 rounded flex items-center justify-center mb-1 overflow-hidden bg-gray-50 dark:bg-[#2a2a2a]/40">
                  {item.media_type === 'image' ? (
                    <img
                      src={api.getRawFileUrl(item.root_name, item.path)}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon item={item} size={36} />
                  )}
                </div>

                {/* File Name */}
                <span className="text-xs break-words line-clamp-2 w-full px-1">
                  {item.name}
                </span>

                {/* File Size (for non-directories) */}
                {!item.is_dir && (
                  <span className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {item.human_size}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
