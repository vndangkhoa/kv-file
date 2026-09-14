import React, { useEffect, useState } from 'react';
import { X, Trash2, RotateCcw } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { TrashItem } from '../../types';
import { formatDate } from '../../utils/format';

export const TrashBinModal: React.FC = () => {
  const { isTrashOpen, setTrashOpen, refresh } = useExplorerStore();
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTrash = async () => {
    setIsLoading(true);
    try {
      const items = await api.listTrash();
      setTrashItems(items);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isTrashOpen) {
      loadTrash();
    }
  }, [isTrashOpen]);

  if (!isTrashOpen) return null;

  const handleRestore = async (id: string) => {
    try {
      await api.restoreTrash(id);
      await loadTrash();
      await refresh();
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  const handlePurge = async (id: string) => {
    if (window.confirm('Permanently delete this item? This action cannot be undone.')) {
      try {
        await api.purgeTrash(id);
        await loadTrash();
      } catch (err: any) {
        alert(`Purge failed: ${err.message}`);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('Empty all items in Trash? This will permanently delete them.')) {
      try {
        await api.emptyTrash();
        await loadTrash();
        await refresh();
      } catch (err: any) {
        alert(`Empty trash failed: ${err.message}`);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={() => setTrashOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col max-h-[80vh] h-[550px] overflow-hidden select-none"
      >
        {/* Header */}
        <div className="h-12 border-b border-gray-200 dark:border-[#333333] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Recycle Bin / Trash ({trashItems.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {trashItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded font-medium transition-colors"
              >
                Empty Trash
              </button>
            )}
            <button
              onClick={() => setTrashOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              Loading trash items...
            </div>
          ) : trashItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
              <Trash2 size={32} className="opacity-40" />
              <span>Trash Bin is empty</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333333] text-gray-500">
                <tr>
                  <th className="py-2 px-3">Original Path</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Deleted Date</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2d2d2d]">
                {trashItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300"
                  >
                    <td className="py-2 px-3 font-mono truncate max-w-[200px]" title={item.original_path}>
                      {item.original_path}
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-500">
                      {item.is_dir ? 'Folder' : item.human_size}
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {formatDate(item.deleted_at)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRestore(item.id)}
                          title="Restore to original location"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePurge(item.id)}
                          title="Permanently delete"
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
