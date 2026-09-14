import React, { useState } from 'react';
import {
  Plus,
  FolderPlus,
  Upload,
  ClipboardPaste,
  Search,
  RotateCw,
  List,
  LayoutGrid,
  Columns,
  X,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';

export const MobileFloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    setNewFolderOpen,
    setUploadOpen,
    clipboard,
    pasteClipboard,
    refresh,
    setCommandPaletteOpen,
    viewMode,
    setViewMode,
  } = useExplorerStore();

  const canPaste = Boolean(clipboard && clipboard.items.length > 0);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  return (
    <>
      {/* Dimmed Backdrop when menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Mobile Action Sheet Menu */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-24 z-50 md:hidden bg-white dark:bg-[#252526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#383838] p-3 text-sm animate-in slide-in-from-bottom-5 duration-200 divide-y divide-gray-100 dark:divide-[#333333] select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pb-2.5">
            <span className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action List */}
          <div className="py-1.5 space-y-1">
            <button
              onClick={() => handleAction(() => setNewFolderOpen(true))}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] active:bg-blue-50 dark:active:bg-blue-950/40 text-gray-800 dark:text-gray-200 font-medium transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <FolderPlus size={18} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">New Folder</div>
                <div className="text-[11px] text-gray-400">Create a subfolder here</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(() => setUploadOpen(true))}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] active:bg-blue-50 dark:active:bg-blue-950/40 text-gray-800 dark:text-gray-200 font-medium transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Upload size={18} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">Upload Files</div>
                <div className="text-[11px] text-gray-400">Add documents, photos, media</div>
              </div>
            </button>

            {canPaste && (
              <button
                onClick={() => handleAction(pasteClipboard)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] active:bg-blue-50 dark:active:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 shrink-0">
                  <ClipboardPaste size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs">
                    Paste {clipboard?.items.length} item{clipboard && clipboard.items.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-[11px] text-gray-400">Insert from clipboard</div>
                </div>
              </button>
            )}

            <button
              onClick={() => handleAction(() => setCommandPaletteOpen(true))}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] active:bg-blue-50 dark:active:bg-blue-950/40 text-gray-800 dark:text-gray-200 font-medium transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Search size={18} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">Power Search</div>
                <div className="text-[11px] text-gray-400">Search files & command palette</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(refresh)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] active:bg-blue-50 dark:active:bg-blue-950/40 text-gray-800 dark:text-gray-200 font-medium transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#333333] flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                <RotateCw size={18} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">Refresh Folder</div>
                <div className="text-[11px] text-gray-400">Reload current directory</div>
              </div>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="pt-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-2">
              View Mode
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-[#1c1c1c] rounded-xl">
              <button
                onClick={() => handleAction(() => setViewMode('list'))}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#2c2c2c] text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={14} />
                <span>List</span>
              </button>

              <button
                onClick={() => handleAction(() => setViewMode('grid'))}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#2c2c2c] text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>

              <button
                onClick={() => handleAction(() => setViewMode('columns'))}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'columns'
                    ? 'bg-white dark:bg-[#2c2c2c] text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Columns size={14} />
                <span>Columns</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) anchored in Thumb Zone */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Actions"
        className={`fixed bottom-9 right-4 z-40 md:hidden w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-2xl flex items-center justify-center transition-transform duration-200 ease-in-out ${
          isOpen ? 'rotate-45 bg-gray-800 dark:bg-gray-700' : ''
        }`}
      >
        <Plus size={26} className="stroke-[2.5]" />
      </button>
    </>
  );
};
