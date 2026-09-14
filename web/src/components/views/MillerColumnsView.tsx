import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Download, Share2, Eye, Trash2, Music, Film, Play, MoreVertical, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { FileIcon } from '../common/FileIcon';
import { FileItem } from '../../types';
import { api } from '../../services/api';
import { formatDate } from '../../utils/format';
import { getSystemFolderHint } from '../../utils/systemFolders';

const InlineTextInspectorPreview: React.FC<{ item: FileItem; onOpenQuickLook: () => void }> = ({
  item,
  onOpenQuickLook,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(api.getRawFileUrl(item.root_name, item.path))
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) {
          const preview = text.split('\n').slice(0, 30).join('\n');
          setContent(preview);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContent(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [item.path, item.root_name]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
        <span>Loading preview...</span>
      </div>
    );
  }

  if (!content) {
    return <FileIcon item={item} size={64} />;
  }

  return (
    <div
      onClick={onOpenQuickLook}
      className="w-full h-full bg-gray-50 dark:bg-[#181818] p-2.5 overflow-hidden text-[10px] font-mono leading-relaxed text-gray-700 dark:text-gray-300 select-text cursor-pointer relative group"
      title="Click to view full preview"
    >
      <pre className="overflow-hidden whitespace-pre-wrap break-all font-mono">
        {content}
      </pre>
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 dark:from-[#181818] to-transparent pointer-events-none flex items-end justify-center pb-0.5">
        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-sans font-medium bg-white/90 dark:bg-[#252526]/90 px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Click for Full Quick Look
        </span>
      </div>
    </div>
  );
};

export const MillerColumnsView: React.FC = () => {
  const {
    columns,
    selectColumnItem,
    activeItem,
    setQuickLookOpen,
    setShareModalOpen,
    refresh,
    openContextMenu,
    navigateTo,
    playAudio,
    playVideo,
    currentRoot,
  } = useExplorerStore();

  const [showAllSystemFolders, setShowAllSystemFolders] = useState(false);

  const { startDownload } = useDownloadStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll horizontally to the rightmost column when a new column is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [columns.length]);

  const handleDownload = (item: FileItem) => {
    startDownload(item.root_name, item);
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
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, null);
      }}
      className="flex-1 flex flex-row overflow-x-auto overflow-y-hidden bg-white dark:bg-[#1e1e1e] select-none scrollbar-subtle snap-x snap-mandatory md:snap-none"
    >
      {columns.map((col, colIdx) => (
        <div
          key={`${col.path}-${colIdx}`}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigateTo(col.path);
            openContextMenu(e.clientX, e.clientY, null);
          }}
          className="w-full min-w-full md:w-64 md:min-w-[16rem] md:max-w-[16rem] snap-start border-r border-gray-200 dark:border-[#333333] flex flex-col h-full shrink-0"
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
          ) : (() => {
            const isAtRoot = col.path === '' && (currentRoot === 'root' || currentRoot === 'rootfs');
            const userItems = col.items.filter((i) => {
              const hint = getSystemFolderHint(i.name, isAtRoot);
              return !hint?.isInternal;
            });
            const internalItems = col.items.filter((i) => {
              const hint = getSystemFolderHint(i.name, isAtRoot);
              return hint?.isInternal === true;
            });
            const shouldFilter = isAtRoot && internalItems.length > 0 && !showAllSystemFolders;
            const displayedItems = shouldFilter ? userItems : col.items;

            return (
              <div className="flex-1 overflow-y-auto py-1">
                {displayedItems.map((item) => {
                  const isSelected = col.selectedName === item.name;
                  const hint = getSystemFolderHint(item.name, isAtRoot);

                  return (
                    <div
                      key={item.path}
                      onClick={() => selectColumnItem(colIdx, item)}
                      onDoubleClick={() => {
                        if (!item.is_dir) {
                          if (item.media_type === 'audio') {
                            playAudio(item);
                          } else if (item.media_type === 'video') {
                            playVideo(item);
                          } else {
                            setQuickLookOpen(true);
                          }
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selectColumnItem(colIdx, item);
                        openContextMenu(e.clientX, e.clientY, item);
                      }}
                      className={`flex items-center justify-between px-3 py-2 sm:py-1.5 min-h-[48px] sm:min-h-0 text-sm sm:text-xs cursor-pointer transition-colors border-b border-gray-100/50 dark:border-gray-800/50 sm:border-0 ${
                        isSelected
                          ? 'bg-[#0062d2] text-white font-medium'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                        <FileIcon item={item} size={18} />
                        <div className="flex flex-col truncate min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate font-medium">{item.name}</span>
                            {hint && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold truncate ${
                                  isSelected
                                    ? 'bg-white/20 text-white border-white/30'
                                    : hint.badgeColor
                                }`}
                              >
                                {hint.badge}
                              </span>
                            )}
                          </div>
                          {hint && !isSelected && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                              {hint.friendlyName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.is_dir ? (
                          <ChevronRight
                            size={18}
                            className={isSelected ? 'text-white' : 'text-gray-400'}
                          />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectColumnItem(colIdx, item);
                              openContextMenu(e.clientX, e.clientY, item);
                            }}
                            className={`md:hidden p-1.5 rounded min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              isSelected ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* OS Internals Collapsible Toggle for Root */}
                {isAtRoot && internalItems.length > 0 && (
                  <div className="p-2 border-t border-gray-100 dark:border-[#2a2a2a] mt-1">
                    <button
                      onClick={() => setShowAllSystemFolders(!showAllSystemFolders)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100/80 dark:bg-[#252526] hover:bg-gray-200 dark:hover:bg-[#2d2d2d] transition-all flex items-center justify-between border border-dashed border-gray-300 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-amber-500 shrink-0" />
                        <span>
                          {showAllSystemFolders
                            ? `Hide ${internalItems.length} OS internal folders`
                            : `Show ${internalItems.length} OS internal folders (bin, proc...)`}
                        </span>
                      </div>
                      {showAllSystemFolders ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ))}

      {/* Terminal Inspector Column when a File is Selected */}
      {activeItem && !activeItem.is_dir && (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu(e.clientX, e.clientY, activeItem);
          }}
          className="w-[85vw] min-w-[85vw] max-w-[85vw] md:w-80 md:min-w-[20rem] md:max-w-[20rem] snap-start border-r border-gray-200 dark:border-[#333333] flex flex-col h-full shrink-0 bg-gray-50/50 dark:bg-[#252526]/50 p-4 overflow-y-auto"
        >
          {/* Large Preview / Icon */}
          <div className="w-full h-44 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#3c3c3c] flex items-center justify-center overflow-hidden mb-4 shadow-sm">
            {activeItem.media_type === 'image' ? (
              <img
                src={api.getRawFileUrl(activeItem.root_name, activeItem.path)}
                alt={activeItem.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setQuickLookOpen(true)}
                title="Click to view full preview"
              />
            ) : activeItem.media_type === 'video' ? (
              <div
                onClick={() => playVideo(activeItem)}
                className="relative w-full h-full flex items-center justify-center cursor-pointer group/vid"
                title="Click to play in Video Player"
              >
                <video
                  src={api.getRawFileUrl(activeItem.root_name, activeItem.path)}
                  className="w-full h-full object-contain"
                  controls={false}
                />
                <div className="absolute inset-0 bg-black/20 group-hover/vid:bg-black/40 flex items-center justify-center transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-600/90 group-hover/vid:bg-blue-600 text-white flex items-center justify-center shadow-lg transform group-hover/vid:scale-110 transition-transform">
                    <Play size={20} className="translate-x-0.5" />
                  </div>
                </div>
              </div>
            ) : activeItem.media_type === 'audio' ? (
              <div
                onClick={() => playAudio(activeItem)}
                className="relative w-full h-full flex items-center justify-center cursor-pointer group/aud"
                title="Click to play in Music Player"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover/aud:scale-105 transition-transform">
                  <Music size={32} />
                </div>
              </div>
            ) : activeItem.media_type === 'text' ||
              activeItem.media_type === 'code' ||
              ['txt', 'toml', 'yaml', 'yml', 'json', 'md', 'ini', 'env', 'conf', 'sql', 'sh', 'log', 'rs', 'ts', 'js', 'py', 'html', 'css', 'db', 'pub'].includes(
                activeItem.extension?.toLowerCase() || ''
              ) ? (
              <InlineTextInspectorPreview
                item={activeItem}
                onOpenQuickLook={() => setQuickLookOpen(true)}
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

            {activeItem.media_type === 'audio' && (
              <button
                onClick={() => playAudio(activeItem)}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors shadow-sm"
              >
                <Music size={14} />
                <span>Play in Music Player</span>
              </button>
            )}

            {activeItem.media_type === 'video' && (
              <button
                onClick={() => playVideo(activeItem)}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors shadow-sm"
              >
                <Film size={14} />
                <span>Play in Video Player</span>
              </button>
            )}

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
