import React, { useState } from 'react';
import {
  HardDrive,
  Search,
  User,
  LogOut,
  Moon,
  X,
  Server,
  Sparkles,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useAuthStore } from '../../stores/useAuthStore';

interface TitleBarProps {
  onOpenAdStudio?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenAdStudio }) => {
  const {
    roots,
    currentRoot,
    setCurrentRoot,
    searchQuery,
    setSearchQuery,
    executeSearch,
    clearSearch,
    isSearching,
  } = useExplorerStore();

  const { user, logout, setAuthModalOpen } = useAuthStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch(searchQuery);
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <header className="h-12 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center justify-between px-3 shrink-0 gap-4 select-none">
      {/* Brand & Root Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-base tracking-tight text-blue-600 dark:text-blue-400">
          <Server size={20} className="stroke-[2.2]" />
          <span>Ola</span>
        </div>

        {/* Multi-Root Storage Selector */}
        {roots.length > 0 && (
          <div className="relative flex items-center">
            <HardDrive size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
            <select
              value={currentRoot}
              onChange={(e) => setCurrentRoot(e.target.value)}
              className="pl-8 pr-6 py-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-[#2d2d2d] transition-colors appearance-none cursor-pointer"
            >
              {roots.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({Math.round(r.free_bytes / 1024 / 1024 / 1024)}GB free)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search files and folders... (Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={13} />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
        )}
      </div>

      {/* Right Controls: Theme + User */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          title="Toggle Dark / Light Theme"
          className="p-1.5 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                {user.username.slice(0, 2)}
              </div>
              <span className="hidden sm:inline">{user.username}</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#333333] rounded transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true, 'login')}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
