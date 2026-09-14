import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Command,
  ArrowRight,
  FolderPlus,
  Upload,
  Columns,
  Trash2,
  Sliders,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { FileItem } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { api } from '../../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    currentRoot,
    navigateTo,
    selectItem,
    setQuickLookOpen,
    setNewFolderOpen,
    setUploadOpen,
    setTrashOpen,
    setViewMode,
    toggleSplitView,
    isSplitView,
    playAudio,
    playVideo,
  } = useExplorerStore();

  // Global Escape key capture listener to guarantee escape works regardless of focus
  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Built-in commands
  const commands: PaletteCommand[] = [
    {
      id: 'cmd-new-folder',
      title: 'New Folder',
      subtitle: 'Create a new directory in current location',
      icon: <FolderPlus size={16} className="text-blue-500" />,
      action: () => {
        onClose();
        setNewFolderOpen(true);
      },
      shortcut: 'Alt+N',
    },
    {
      id: 'cmd-upload',
      title: 'Upload Files',
      subtitle: 'Upload files to current folder',
      icon: <Upload size={16} className="text-emerald-500" />,
      action: () => {
        onClose();
        setUploadOpen(true);
      },
      shortcut: 'Alt+U',
    },
    {
      id: 'cmd-split-view',
      title: isSplitView ? 'Close Split View' : 'Open Split View (Dual-Pane)',
      subtitle: 'Toggle side-by-side dual explorer panes',
      icon: <Columns size={16} className="text-purple-500" />,
      action: () => {
        onClose();
        toggleSplitView();
      },
      shortcut: 'Alt+S',
    },
    {
      id: 'cmd-view-columns',
      title: 'Switch View: macOS Miller Columns',
      subtitle: 'Browse directories with cascading Miller columns',
      icon: <Columns size={16} className="text-sky-500" />,
      action: () => {
        onClose();
        setViewMode('columns');
      },
    },
    {
      id: 'cmd-view-list',
      title: 'Switch View: Detailed List',
      subtitle: 'View items in table format with columns',
      icon: <Sliders size={16} className="text-indigo-500" />,
      action: () => {
        onClose();
        setViewMode('list');
      },
    },
    {
      id: 'cmd-trash',
      title: 'Open Trash Bin',
      subtitle: 'Inspect and restore soft-deleted files',
      icon: <Trash2 size={16} className="text-red-500" />,
      action: () => {
        onClose();
        setTrashOpen(true);
      },
    },
  ];

  const isCommandMode = query.startsWith('>') || query.startsWith('/');
  const filteredCommands = isCommandMode
    ? commands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.slice(1).trim().toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.slice(1).trim().toLowerCase())
      )
    : [];

  // Execute power search as user types
  useEffect(() => {
    if (!isOpen || isCommandMode) {
      setResults([]);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const hits = await api.searchItems(currentRoot, query);
        setResults(hits);
        setSelectedIndex(0);
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [query, isOpen, isCommandMode, currentRoot]);

  const handleSelectFileItem = async (item: FileItem, openPreview: boolean = true) => {
    onClose();
    if (item.is_dir) {
      await navigateTo(item.path);
    } else {
      const lastSlash = item.path.lastIndexOf('/');
      const parentDir = lastSlash !== -1 ? item.path.slice(0, lastSlash) : '';
      await navigateTo(parentDir);
      selectItem(item, false);

      if (openPreview) {
        if (item.media_type === 'video') {
          playVideo(item);
        } else if (item.media_type === 'audio') {
          playAudio(item);
        } else {
          setQuickLookOpen(true);
        }
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    const listLength = isCommandMode ? filteredCommands.length : results.length;
    if (listLength === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isCommandMode) {
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else {
        const item = results[selectedIndex];
        if (item) {
          handleSelectFileItem(item, true);
        }
      }
    }
  };

  if (!isOpen) return null;

  const quickFilterChips = [
    { label: 'ext:pdf', query: 'ext:pdf' },
    { label: 'ext:mp4', query: 'ext:mp4' },
    { label: 'ext:heic', query: 'ext:heic' },
    { label: 'type:audio', query: 'type:audio' },
    { label: 'size:>10mb', query: 'size:>10mb' },
    { label: 'in:documents', query: 'in:documents' },
    { label: '> commands', query: '>' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3d41] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-[#2d2d2d] gap-3">
          <Search size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files (e.g. ext:heic, type:audio, size:>5mb) or type '>' for commands..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X size={15} />
            </button>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#2d2d2d] dark:hover:bg-[#383838] text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 text-[11px] font-mono border border-gray-200 dark:border-[#404040] transition-colors"
              title="Close search and return to files (Esc)"
            >
              ESC
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
              title="Close search"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick Filter Operator Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50/60 dark:bg-[#181818]/60 border-b border-gray-100 dark:border-[#282828] overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-gray-400 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles size={12} className="text-amber-500" /> Filters:
          </span>
          {quickFilterChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                setQuery((prev) => (prev ? `${prev.trim()} ${chip.query} ` : `${chip.query} `));
                inputRef.current?.focus();
              }}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] hover:border-blue-400 dark:hover:border-blue-500 text-gray-600 dark:text-gray-300 font-mono shrink-0 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Command mode list */}
          {isCommandMode ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                System Commands
              </div>
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-gray-400">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <div
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      selectedIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-[#2a2d2e] text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedIndex === idx ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#282828]'
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{cmd.title}</div>
                        <div
                          className={`text-[11px] ${
                            selectedIndex === idx ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {cmd.subtitle}
                        </div>
                      </div>
                    </div>
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          selectedIndex === idx
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-400'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : query.trim() ? (
            /* File search results */
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Matching Items</span>
                <span>{results.length} found</span>
              </div>

              {isSearching ? (
                <div className="px-4 py-8 text-center text-xs text-gray-400">Searching...</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-gray-400">
                  No files or folders matched your query.
                </div>
              ) : (
                results.map((item, idx) => (
                  <div
                    key={item.path}
                    onClick={() => handleSelectFileItem(item, true)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      selectedIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-[#2a2d2e] text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon item={item} size={18} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{item.name}</div>
                        <div
                          className={`text-[11px] truncate ${
                            selectedIndex === idx ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          /{item.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-mono ${
                          selectedIndex === idx ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {item.is_dir ? 'Folder' : item.human_size}
                      </span>
                      {!item.is_dir && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFileItem(item, false);
                          }}
                          title="Reveal in folder (don't open preview)"
                          className={`p-1 rounded-md transition-colors ${
                            selectedIndex === idx
                              ? 'text-white/80 hover:text-white hover:bg-white/20'
                              : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FolderOpen size={14} />
                        </button>
                      )}
                      <ArrowRight
                        size={14}
                        className={selectedIndex === idx ? 'opacity-100' : 'opacity-0'}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Empty default suggestions */
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Command size={22} />
              </div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Power Search & Command Center
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                Instant search with operators like <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-blue-600">ext:heic</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-blue-600">size:&gt;10mb</code>, or type <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-purple-600">&gt;</code> for quick actions.
              </p>
            </div>
          )}
        </div>

        {/* Footer info & Exit button */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#181818] border-t border-gray-100 dark:border-[#282828] text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline font-sans font-medium"
          >
            ← Return to File Browser
          </button>
        </div>
      </div>
    </div>
  );
};
