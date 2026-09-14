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
  } = useExplorerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const canGoUp = Boolean(currentPath);

  useEffect(() => {
    setInputVal(currentPath);
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
      setInputVal(currentPath);
    }
  };

  return (
    <div className="h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center px-2 gap-1.5 select-none shrink-0">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-300">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          title="Back (Alt+Left)"
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          title="Forward (Alt+Right)"
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ArrowRight size={16} />
        </button>

        <button
          onClick={goUp}
          disabled={!canGoUp}
          title="Up to Parent Directory (Alt+Up)"
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ArrowUp size={16} />
        </button>

        <button
          onClick={refresh}
          title="Refresh (F5)"
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors ${
            isLoading ? 'animate-spin text-blue-500' : ''
          }`}
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* Address Bar / Breadcrumbs Container */}
      <div className="flex-1 h-7 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded flex items-center px-2 text-xs overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="w-full flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsEditing(false)}
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
                setIsEditing(true);
              }
            }}
          >
            {/* Root pill */}
            <button
              onClick={() => navigateTo('')}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] px-1.5 py-0.5 rounded transition-colors shrink-0 font-medium"
            >
              <Folder size={13} className="text-amber-500" />
              <span>{currentRoot || 'Root'}</span>
            </button>

            {/* Breadcrumb segments */}
            {listing?.breadcrumbs
              .filter((b) => b.path !== '')
              .map((crumb) => (
                <React.Fragment key={crumb.path}>
                  <ChevronRight size={12} className="text-gray-400 shrink-0 mx-0.5" />
                  <button
                    onClick={() => navigateTo(crumb.path)}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] px-1.5 py-0.5 rounded transition-colors shrink-0"
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}

            {/* Blank filler to trigger edit on click */}
            <div className="flex-1 h-full min-w-[20px]" onClick={() => setIsEditing(true)} />

            <button
              onClick={() => setIsEditing(true)}
              title="Edit Path (Ctrl+L)"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded shrink-0"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
