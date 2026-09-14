import React, { useEffect, useRef } from 'react';
import { ChevronRight, Download, Share2, Eye, Trash2 } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileIcon } from '../common/FileIcon';
import { FileItem } from '../../types';
import { api } from '../../services/api';
import { formatDate } from '../../utils/format';

export const MillerColumnsView: React.FC = () => {
  const {
    columns,
    selectColumnItem,
    activeItem,
    setQuickLookOpen,
    setShareModalOpen,
    refresh,
  } = useExplorerStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll horizontally to the rightmost column when a new column is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [columns.length, activeItem]);

  const handleDownload = (item: FileItem) => {
    window.open(api.getDownloadUrl(item.root_name, item.path), '_blank');
  };

  const handleDelete = async (item: FileItem) => {
    if (window.confirm(`Move "${item.name}" to Trash?`)) {
      try {
        await api.deleteItem(item.root_name, item.path, false);
        await refresh();
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-row overflow-x-auto overflow-y-hidden bg-white dark:bg-[#1e1e1e] select-none scrollbar-subtle snap-x snap-mandatory md:snap-none"
    >
      {columns.map((col, colIdx) => (
        <div
          key={`${col.path}-${colIdx}`}
          className="w-[82vw] min-w-[82vw] max-w-[82vw] md:w-64 md:min-w-[16rem] md:max-w-[16rem] snap-start border-r border-gray-200 dark:border-[#333333] flex flex-col h-full shrink-0"
        >
          {col.isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
              <span>Loading...</span>
            </div>
          ) : col.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
              Folder is empty
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-1">
              {col.items.map((item) => {
                const isSelected = col.selectedName === item.name;

                return (
                  <div
                    key={item.path}
                    onClick={() => selectColumnItem(colIdx, item)}
                    onDoubleClick={() => {
                      if (!item.is_dir) setQuickLookOpen(true);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0062d2] text-white font-medium'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon item={item} size={15} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.is_dir && (
                      <ChevronRight
                        size={14}
                        className={isSelected ? 'text-white' : 'text-gray-400'}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Terminal Inspector Column when a File is Selected */}
      {activeItem && !activeItem.is_dir && (
        <div className="w-[85vw] min-w-[85vw] max-w-[85vw] md:w-80 md:min-w-[20rem] md:max-w-[20rem] snap-start border-r border-gray-200 dark:border-[#333333] flex flex-col h-full shrink-0 bg-gray-50/50 dark:bg-[#252526]/50 p-4 overflow-y-auto">
          {/* Large Preview / Icon */}
          <div className="w-full h-40 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#3c3c3c] flex items-center justify-center overflow-hidden mb-4 shadow-sm">
            {activeItem.media_type === 'image' ? (
              <img
                src={api.getRawFileUrl(activeItem.root_name, activeItem.path)}
                alt={activeItem.name}
                className="w-full h-full object-contain"
              />
            ) : activeItem.media_type === 'video' ? (
              <video
                src={api.getRawFileUrl(activeItem.root_name, activeItem.path)}
                className="w-full h-full object-contain"
                controls={false}
              />
            ) : (
              <FileIcon item={activeItem} size={64} />
            )}
          </div>

          {/* File Name */}
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 break-words mb-3">
            {activeItem.name}
          </div>

          {/* Metadata List */}
          <div className="space-y-2 text-xs border-t border-gray-200 dark:border-[#333333] pt-3 text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Kind</span>
              <span className="text-gray-900 dark:text-gray-200 capitalize">
                {activeItem.media_type} ({activeItem.extension ? `.${activeItem.extension}` : 'File'})
              </span>
            </div>

            <div className="flex justify-between">
              <span>Size</span>
              <span className="text-gray-900 dark:text-gray-200">{activeItem.human_size}</span>
            </div>

            <div className="flex justify-between">
              <span>Modified</span>
              <span className="text-gray-900 dark:text-gray-200">{formatDate(activeItem.mod_time)}</span>
            </div>

            <div className="flex justify-between">
              <span>MIME Type</span>
              <span className="text-gray-900 dark:text-gray-200 truncate max-w-[140px]" title={activeItem.mime_type}>
                {activeItem.mime_type}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-[#333333] pt-4">
            <button
              onClick={() => setQuickLookOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Eye size={14} />
              <span>Quick Look (Space)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownload(activeItem)}
                className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#333333] dark:hover:bg-[#3c3c3c] text-gray-800 dark:text-gray-200 rounded text-xs font-medium transition-colors"
              >
                <Download size={13} />
                <span>Download</span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#333333] dark:hover:bg-[#3c3c3c] text-gray-800 dark:text-gray-200 rounded text-xs font-medium transition-colors"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>

            <button
              onClick={() => handleDelete(activeItem)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded text-xs font-medium transition-colors"
            >
              <Trash2 size={13} />
              <span>Move to Trash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
