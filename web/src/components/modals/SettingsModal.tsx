import React, { useEffect } from 'react';
import {
  X,
  User,
  Palette,
  FolderTree,
  HardDrive,
  Info,
} from 'lucide-react';
import { useSettingsStore, SettingsTab } from '../../stores/useSettingsStore';
import { AccountTab } from './settings/AccountTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { ExplorerTab } from './settings/ExplorerTab';
import { StorageTab } from './settings/StorageTab';
import { AboutTab } from './settings/AboutTab';

import { LucideIcon } from 'lucide-react';

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'explorer', label: 'Explorer', icon: FolderTree },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'about', label: 'About', icon: Info },
];

export const SettingsModal: React.FC = () => {
  const { isOpen, closeSettings, activeTab, setActiveTab } = useSettingsStore();

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSettings]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in select-none"
      onClick={closeSettings}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-4xl h-[620px] max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#333333] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-gray-100">
              Preferences & Settings
            </span>
          </div>

          <button
            onClick={closeSettings}
            title="Close (Esc)"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Master-Detail Layout */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Left Tabs Sidebar */}
          <aside className="w-full sm:w-52 bg-gray-50/70 dark:bg-[#1e1e1e]/80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-[#333333] p-2 sm:p-3 flex sm:flex-col gap-1 shrink-0 overflow-x-auto sm:overflow-x-visible">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2d2d2d]'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Tab Content View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#252526]">
            {activeTab === 'account' && <AccountTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
            {activeTab === 'explorer' && <ExplorerTab />}
            {activeTab === 'storage' && <StorageTab />}
            {activeTab === 'about' && <AboutTab />}
          </main>
        </div>
      </div>
    </div>
  );
};
