import React, { useState } from 'react';
import {
  HardDrive,
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  X,
  FolderTree,
  Menu,
  Database,
  FlaskConical,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { getDataSourceMode, setDataSourceMode } from '../../services/api';

export const TitleBar: React.FC = () => {
  const {
    roots,
    currentRoot,
    setCurrentRoot,
    searchQuery,
    setSearchQuery,
    executeSearch,
    clearSearch,
    isSearching,
    toggleSidebar,
  } = useExplorerStore();

  const { user, logout, setAuthModalOpen } = useAuthStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const currentMode = getDataSourceMode();

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleToggleMode = () => {
    const nextMode = currentMode === 'mock' ? 'real' : 'mock';
    if (
      confirm(
        nextMode === 'real'
          ? 'Switch to Live Server? (Ensure the Rust backend is running on port 8866)'
          : 'Switch to Mock Demo mode? (Uses simulated in-memory storage)'
      )
    ) {
      setDataSourceMode(nextMode);
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
    <header className="h-12 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center justify-between px-2.5 sm:px-3 shrink-0 gap-2 sm:gap-4 select-none">
      {/* Brand & Mobile Hamburger Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={toggleSidebar}
          title="Toggle Navigation Menu"
          className="md:hidden p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight text-blue-600 dark:text-blue-400">
          <FolderTree size={19} className="stroke-[2.2]" />
          <span className="truncate">KV Files</span>
        </div>

        {/* Multi-Root Storage Selector */}
        {roots.length > 0 && (
          <div className="relative hidden lg:flex items-center">
            <HardDrive size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
            <select
              value={currentRoot}
              onChange={(e) => setCurrentRoot(e.target.value)}
              className="pl-7 pr-5 py-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-[#2d2d2d] transition-colors appearance-none cursor-pointer"
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
      <div className="flex-1 max-w-xs sm:max-w-md relative min-w-[120px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search files... (Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-8 sm:pl-9 pr-7 py-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3c3c3c] rounded-md text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={12} />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-7 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
        )}
      </div>

      {/* Right Controls: Mode Switcher + Theme + User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mock / Real Mode Toggle Button */}
        <button
          onClick={handleToggleMode}
          title={
            currentMode === 'mock'
              ? 'Click to switch to Live Server backend'
              : 'Click to switch to Mock Demo mode'
          }
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
            currentMode === 'mock'
              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100'
          }`}
        >
          {currentMode === 'mock' ? (
            <>
              <FlaskConical size={12} className="animate-pulse" />
              <span className="hidden sm:inline">Demo (Mock)</span>
              <span className="sm:hidden">Mock</span>
            </>
          ) : (
            <>
              <Database size={12} />
              <span className="hidden sm:inline">Live Server</span>
              <span className="sm:hidden">Live</span>
            </>
          )}
        </button>

        <button
          onClick={toggleTheme}
          title="Toggle Dark / Light Theme"
          className="p-1.5 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {user ? (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
              {user.username.slice(0, 2)}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#333333] rounded transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true, 'login')}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            <User size={12} />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
