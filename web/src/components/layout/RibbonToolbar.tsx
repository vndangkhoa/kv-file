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
  EyeOff,
  Download,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { api } from '../../services/api';

export const RibbonToolbar: React.FC = () => {
  const {
    currentRoot,
    selectedItems,
    clipboard,
    viewMode,
    setViewMode,
    setClipboard,
    pasteClipboard,
    setNewFolderOpen,
    setUploadOpen,
    setShareModalOpen,
    setRenameOpen,
    setQuickLookOpen,
    refresh,
    isSplitView,
    toggleSplitView,
    openContextMenu,
    toggleShowHidden,
  } = useExplorerStore();

  const showHiddenFiles = useSettingsStore((s) => s.preferences.showHiddenFiles);
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
    if (!canPaste) return;
    await pasteClipboard();
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
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, null, { toolbar: 'ribbon' });
      }}
      className="hidden md:flex h-11 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] items-center justify-between px-3 text-xs select-none shrink-0 overflow-x-auto scrollbar-none gap-2"
    >
      {/* File Action Commands */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setNewFolderOpen(true)}
          title="New Folder"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200 transition-colors font-medium shrink-0 min-h-[32px]"
        >
          <FolderPlus size={15} className="text-amber-500" />
          <span className="hidden min-[480px]:inline">New Folder</span>
        </button>

        <button
          onClick={() => setUploadOpen(true)}
          title="Upload"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200 transition-colors font-medium shrink-0 min-h-[32px]"
        >
          <Upload size={15} className="text-blue-500" />
          <span className="hidden min-[480px]:inline">Upload</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-0.5 sm:mx-1 shrink-0" />

        <button
          onClick={handleCut}
          disabled={!hasSelection}
          title="Cut (Ctrl+X)"
          className="p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
        >
          <Scissors size={15} />
        </button>

        <button
          onClick={handleCopy}
          disabled={!hasSelection}
          title="Copy (Ctrl+C)"
          className="p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
        >
          <Copy size={15} />
        </button>

        <button
          onClick={handlePaste}
          disabled={!canPaste}
          title="Paste (Ctrl+V)"
          className="p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
        >
          <ClipboardPaste size={15} />
        </button>

        <button
          onClick={() => setRenameOpen(true)}
          disabled={!singleSelection}
          title="Rename (F2)"
          className="p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
        >
          <Edit size={15} />
        </button>

        <button
          onClick={handleDelete}
          disabled={!hasSelection}
          title="Delete to Trash (Delete)"
          className="p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
        >
          <Trash2 size={15} />
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-0.5 sm:mx-1 shrink-0" />

        <button
          onClick={() => setShareModalOpen(true)}
          disabled={!singleSelection}
          title="Share"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0 min-h-[32px]"
        >
          <Share2 size={14} className="text-emerald-500" />
          <span className="hidden md:inline">Share</span>
        </button>

        <button
          onClick={() => setQuickLookOpen(true)}
          disabled={!singleSelection}
          title="Preview"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0 min-h-[32px]"
        >
          <Eye size={14} className="text-indigo-500" />
          <span className="hidden md:inline">Preview</span>
        </button>

        <button
          onClick={() => {
            if (singleSelection && !selectedItems[0].is_dir) {
              startDownload(currentRoot, selectedItems[0]);
            }
          }}
          disabled={!singleSelection || selectedItems[0]?.is_dir}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0 min-h-[32px]"
          title="Direct Download with Live Progress Bar"
        >
          <Download size={14} className="text-blue-500" />
          <span className="hidden md:inline">Download</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#3c3c3c] mx-0.5 sm:mx-1 shrink-0" />

        {/* Split View Toggle */}
        <button
          onClick={toggleSplitView}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 min-h-[32px] ${
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

      {/* Right side: System folder toggle & View Mode Switcher */}
      <div className="flex items-center gap-2">
        {/* Toggle System / Hidden Folders */}
        <button
          onClick={toggleShowHidden}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 min-h-[32px] text-xs ${
            showHiddenFiles
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
              : 'hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-600 dark:text-gray-300'
          }`}
          title={
            showHiddenFiles
              ? 'System folders (@/.) are visible. Click to hide.'
              : 'System folders (@/.) are hidden. Click to show.'
          }
        >
          {showHiddenFiles ? (
            <Eye size={14} className="text-amber-600 dark:text-amber-400" />
          ) : (
            <EyeOff size={14} className="text-gray-400" />
          )}
          <span className="hidden min-[700px]:inline">
            {showHiddenFiles ? 'System: Shown' : 'System: Hidden'}
          </span>
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
