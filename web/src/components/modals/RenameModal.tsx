import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';

export const RenameModal: React.FC = () => {
  const { isRenameOpen, setRenameOpen, selectedItems, currentRoot, refresh } = useExplorerStore();
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const item = selectedItems.length === 1 ? selectedItems[0] : null;

  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  if (!isRenameOpen || !item) return null;

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !currentRoot || newName === item.name) return;

    setIsLoading(true);
    try {
      await api.renameItem(currentRoot, item.path, newName.trim());
      await refresh();
      setRenameOpen(false);
    } catch (err: any) {
      alert(`Rename failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={() => setRenameOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] p-5 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
            <Edit size={16} className="text-blue-500" />
            <span>Rename Item</span>
          </div>
          <button
            onClick={() => setRenameOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleRename} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">New Name</label>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full text-xs p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRenameOpen(false)}
              className="px-3 py-1.5 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || newName === item.name || isLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors"
            >
              {isLoading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
