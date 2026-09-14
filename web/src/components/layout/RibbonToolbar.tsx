import {
  FolderPlus,
  Upload,
  Scissors,
  Copy,
  ClipboardPaste,
  Edit,
  Trash2,
  Share2,
  Columns,
  List,
  LayoutGrid,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { api } from '../../services/api';

export const RibbonToolbar: React.FC = () => {
  const {
    currentRoot,
    currentPath,
    selectedItems,
    clipboard,
    viewMode,
    setViewMode,
    setClipboard,
    clearClipboard,
    setNewFolderOpen,
    setUploadOpen,
    setShareModalOpen,
    setRenameOpen,
    setQuickLookOpen,
    refresh,
    isSplitView,
    toggleSplitView,
    setCommandPaletteOpen,
  } = useExplorerStore();

  const { startDownload } = useDownloadStore();

  const hasSelection = selectedItems.length > 0;
  const singleSelection = selectedItems.length === 1;
  const canPaste = Boolean(clipboard && clipboard.items.length > 0);

  const handleCut = () => {
    if (hasSelection) {
      setClipboard('cut', selectedItems);
    }
  };

  const handleCopy = () => {
    if (hasSelection) {
      setClipboard('copy', selectedItems);
    }
  };

  const handlePaste = async () => {
    if (!clipboard || !currentRoot) return;
    try {
      for (const item of clipboard.items) {
        if (clipboard.action === 'cut') {
          await api.moveItem(currentRoot, item.path, currentPath);
        } else {
          await api.copyItem(currentRoot, item.path, currentPath);
        }
      }
      clearClipboard();
      await refresh();
    } catch (err: any) {
      alert(`Paste failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!hasSelection || !currentRoot) return;
    const count = selectedItems.length;
    const msg = count === 1
      ? `Move "${selectedItems[0].name}" to Trash?`
      : `Move ${count} items to Trash?`;

    if (window.confirm(msg)) {
      try {
        for (const item of selectedItems) {
          await api.deleteItem(currentRoot, item.path, false);
        }
        await refresh();
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="h-11 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center justify-between px-3 text-xs select-none shrink-0 overflow-x-auto">
      {/* File Action Commands */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setNewFolderOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200 transition-colors font-medium"
        >
          <FolderPlus size={15} className="text-amber-500" />
          <span>New Folder</span>
        </button>

        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200 transition-colors font-medium"
        >
          <Upload size={15} className="text-blue-500" />
          <span>Upload</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-1" />

        <button
          onClick={handleCut}
          disabled={!hasSelection}
          title="Cut (Ctrl+X)"
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Scissors size={15} />
        </button>

        <button
          onClick={handleCopy}
          disabled={!hasSelection}
          title="Copy (Ctrl+C)"
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Copy size={15} />
        </button>

        <button
          onClick={handlePaste}
          disabled={!canPaste}
          title="Paste (Ctrl+V)"
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ClipboardPaste size={15} />
        </button>

        <button
          onClick={() => setRenameOpen(true)}
          disabled={!singleSelection}
          title="Rename (F2)"
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Edit size={15} />
        </button>

        <button
          onClick={handleDelete}
          disabled={!hasSelection}
          title="Delete to Trash (Delete)"
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Trash2 size={15} />
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-1" />

        <button
          onClick={() => setShareModalOpen(true)}
          disabled={!singleSelection}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Share2 size={14} className="text-emerald-500" />
          <span>Share</span>
        </button>

        <button
          onClick={() => setQuickLookOpen(true)}
          disabled={!singleSelection}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Eye size={14} className="text-indigo-500" />
          <span>Preview</span>
        </button>

        <button
          onClick={() => {
            if (singleSelection && !selectedItems[0].is_dir) {
              startDownload(currentRoot, selectedItems[0]);
            }
          }}
          disabled={!singleSelection || selectedItems[0]?.is_dir}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Direct Download with Live Progress Bar"
        >
          <Download size={14} className="text-blue-500" />
          <span>Download</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-1" />

        {/* Split View Toggle */}
        <button
          onClick={toggleSplitView}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
            isSplitView
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 shadow-inner'
              : 'hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200'
          }`}
          title="Toggle Dual-Pane Split View"
        >
          <Columns size={14} className={isSplitView ? 'text-blue-600 dark:text-blue-400' : 'text-purple-500'} />
          <span className="hidden sm:inline">Split View</span>
        </button>
      </div>

      {/* Right side: Power Search & View Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-600 dark:text-gray-300 transition-colors font-medium border border-gray-200 dark:border-[#383838]"
          title="Power Search & Command Palette (Ctrl+K)"
        >
          <Search size={13} className="text-blue-500" />
          <span className="hidden md:inline text-[11px]">Power Search</span>
          <kbd className="hidden lg:inline text-[10px] opacity-60 font-mono">Ctrl+K</kbd>
        </button>

        {/* View Mode Switcher (Columns / List / Grid) */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1e1e1e] p-0.5 rounded border border-gray-200 dark:border-[#3c3c3c]">
          <button
            onClick={() => setViewMode('columns')}
            title="macOS Column View (Miller Columns)"
            className={`p-1.5 rounded transition-all ${
              viewMode === 'columns'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Columns size={15} />
          </button>

          <button
            onClick={() => setViewMode('list')}
            title="Windows Detailed List"
            className={`p-1.5 rounded transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <List size={15} />
          </button>

          <button
            onClick={() => setViewMode('grid')}
            title="Icon / Grid View"
            className={`p-1.5 rounded transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#333333] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
