import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Folder,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';

interface BreadcrumbPillProps {
  name: string;
  path: string;
  icon?: React.ReactNode;
  title?: string;
  onNavigate: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const BreadcrumbPill: React.FC<BreadcrumbPillProps> = ({
  name,
  path,
  icon,
  title,
  onNavigate,
  onContextMenu,
}) => {
  const { currentRoot, refresh, startDirectUpload } = useExplorerStore();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    const isInternal = e.dataTransfer.types.includes('application/x-kv-file');
    const isFiles = e.dataTransfer.types.includes('Files');
    if (isInternal || isFiles) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = e.ctrlKey || e.altKey ? 'copy' : 'move';
      if (!isDropTarget) setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    // 1. External file upload to crumb directory
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0 &&
      !e.dataTransfer.types.includes('application/x-kv-file')
    ) {
      const files = Array.from(e.dataTransfer.files);
      await startDirectUpload(currentRoot, path, files);
      return;
    }

    // 2. Internal move / copy
    const rawData = e.dataTransfer.getData('application/x-kv-file');
    if (!rawData) return;

    try {
      const { root, items } = JSON.parse(rawData) as {
        root: string;
        items: { name: string; path: string; is_dir?: boolean }[];
      };
      const isCopy = e.ctrlKey || e.altKey;

      for (const src of items) {
        if (path === src.path || path.startsWith(`${src.path}/`)) {
          continue;
        }
        const parentPath = src.path.includes('/')
          ? src.path.substring(0, src.path.lastIndexOf('/'))
          : '';
        if (!isCopy && parentPath === path) {
          continue;
        }

        if (isCopy) {
          await api.copyItem(root, src.path, path);
        } else {
          await api.moveItem(root, src.path, path);
        }
      }
      await refresh();
    } catch (err) {
      console.error('Failed to handle breadcrumb drop:', err);
    }
  };

  return (
    <button
      onClick={onNavigate}
      onContextMenu={onContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title={title}
      className={`flex items-center gap-1.5 sm:gap-1 min-h-[32px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 sm:py-0.5 rounded-md sm:rounded transition-all shrink-0 font-medium text-xs ${
        isDropTarget
          ? 'ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333]'
      }`}
    >
      {icon}
      <span>{name}</span>
    </button>
  );
};

export const formatDisplayPath = (path: string): string => {
  const clean = path.trim().replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}` : '/';
};

export const AddressBar: React.FC = () => {
  const {
    currentPath,
    currentRoot,
    listing,
    navigateTo,
    goBack,
    goForward,
    goUp,
    refresh,
    history,
    historyIndex,
    isLoading,
    openContextMenu,
  } = useExplorerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(() => formatDisplayPath(currentPath));
  const inputRef = useRef<HTMLInputElement>(null);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const canGoUp = Boolean(currentPath);

  useEffect(() => {
    setInputVal(formatDisplayPath(currentPath));
  }, [currentPath]);

  const startEditing = () => {
    setInputVal(formatDisplayPath(currentPath));
    setIsEditing(true);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        startEditing();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentPath]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const cleaned = inputVal.trim().replace(/^\/+|\/+$/g, '');
    navigateTo(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setInputVal(formatDisplayPath(currentPath));
    }
  };

  const breadcrumbSegments = React.useMemo(() => {
    if (listing?.breadcrumbs && listing.breadcrumbs.length > 0) {
      return listing.breadcrumbs.filter((b) => b.path !== '');
    }
    const clean = currentPath.trim().replace(/^\/+|\/+$/g, '');
    if (!clean) return [];
    const segments = clean.split('/').filter(Boolean);
    let acc = '';
    return segments.map((seg) => {
      acc = acc ? `${acc}/${seg}` : seg;
      return { name: seg, path: acc };
    });
  }, [listing?.breadcrumbs, currentPath]);

  return (
    <div
      onContextMenu={(e) => {
        if (!isEditing) {
          e.preventDefault();
          openContextMenu(e.clientX, e.clientY, null, { toolbar: 'addressbar' });
        }
      }}
      className="h-12 sm:h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center px-3 sm:px-2 gap-2 sm:gap-1.5 select-none shrink-0"
    >
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 sm:gap-0.5 text-gray-600 dark:text-gray-300 shrink-0">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          title="Back (Alt+Left)"
          className="p-2 sm:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[38px] min-h-[38px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          title="Forward (Alt+Right)"
          className="p-2 sm:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[38px] min-h-[38px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center active:scale-95"
        >
          <ArrowRight size={16} />
        </button>

        <button
          onClick={goUp}
          disabled={!canGoUp}
          title="Up to Parent Directory (Alt+Up)"
          className="p-2 sm:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[38px] min-h-[38px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center active:scale-95"
        >
          <ArrowUp size={16} />
        </button>

        <button
          onClick={() => refresh()}
          title="Refresh (F5)"
          className={`p-2 sm:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors min-w-[38px] min-h-[38px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center active:scale-95 ${
            isLoading ? 'animate-spin text-blue-500' : ''
          }`}
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* Address Bar / Breadcrumbs Container */}
      <div className="flex-1 h-9 sm:h-7 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded-lg flex items-center px-2 text-xs overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="w-full flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditing(false);
                setInputVal(formatDisplayPath(currentPath));
              }}
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none font-mono text-xs"
              placeholder="/"
            />
          </form>
        ) : (
          <div
            className="w-full h-full flex items-center overflow-x-auto scrollbar-none cursor-text"
            onClick={(e) => {
              // If clicked on blank area
              if (e.target === e.currentTarget) {
                startEditing();
              }
            }}
          >
            {/* Root pill */}
            <BreadcrumbPill
              name="/"
              path=""
              icon={<Folder size={13} className="text-amber-500" />}
              title={`Root: / (${currentRoot || 'storage'})`}
              onNavigate={() => navigateTo('')}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContextMenu(e.clientX, e.clientY, null, {
                  breadcrumb: { name: currentRoot || 'Root', path: '' },
                });
              }}
            />

            {/* Breadcrumb segments */}
            {breadcrumbSegments.map((crumb) => (
              <React.Fragment key={crumb.path}>
                <ChevronRight size={12} className="text-gray-400 shrink-0 mx-0.5" />
                <BreadcrumbPill
                  name={crumb.name}
                  path={crumb.path}
                  onNavigate={() => navigateTo(crumb.path)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openContextMenu(e.clientX, e.clientY, null, {
                      breadcrumb: crumb,
                    });
                  }}
                />
              </React.Fragment>
            ))}

            {/* Blank filler to trigger edit on click */}
            <div className="flex-1 h-full min-w-[20px]" onClick={startEditing} />

            <button
              onClick={startEditing}
              title="Edit Path (Ctrl+L)"
              className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
