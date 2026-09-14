import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';

export const NewFolderModal: React.FC = () => {
  const { isNewFolderOpen, setNewFolderOpen, currentRoot, currentPath, refresh } = useExplorerStore();
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isNewFolderOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !currentRoot) return;

    setIsLoading(true);
    const targetPath = currentPath ? `${currentPath}/${folderName.trim()}` : folderName.trim();

    try {
      await api.createFolder(currentRoot, targetPath);
      await refresh();
      setFolderName('');
      setNewFolderOpen(false);
    } catch (err: any) {
      alert(`Create folder failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={() => setNewFolderOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] p-5 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
            <FolderPlus size={16} className="text-amber-500" />
            <span>New Folder</span>
          </div>
          <button
            onClick={() => setNewFolderOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Folder Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Invoices 2026"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full text-xs p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewFolderOpen(false)}
              className="px-3 py-1.5 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
