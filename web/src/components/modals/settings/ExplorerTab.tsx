import React from 'react';
import { Columns, List, LayoutGrid, Eye, AlertTriangle, LucideIcon } from 'lucide-react';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { ViewMode } from '../../../types';

export const ExplorerTab: React.FC = () => {
  const { preferences, updatePreferences } = useSettingsStore();

  const viewModes: { id: ViewMode; label: string; desc: string; icon: LucideIcon }[] = [
    {
      id: 'columns',
      label: 'Miller Columns',
      desc: 'macOS Finder style cascading column navigation',
      icon: Columns,
    },
    {
      id: 'list',
      label: 'Detailed List',
      desc: 'Windows Explorer style with sortable columns',
      icon: List,
    },
    {
      id: 'grid',
      label: 'Icons / Grid',
      desc: 'Visual thumbnail grid for folders and media',
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl text-xs">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
          File Explorer Preferences
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Configure default browsing modes and file manipulation behaviors.
        </p>
      </div>

      {/* Default View Mode */}
      <div className="space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-300 block">
          Default View Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {viewModes.map((m) => {
            const Icon = m.icon;
            const isSelected = preferences.defaultViewMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => updatePreferences({ defaultViewMode: m.id })}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-[#1e1e1e]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{m.label}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#333333]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333]">
          <div className="flex items-start gap-3">
            <Eye size={16} className="text-gray-400 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200 block">
                Show Hidden Files & Dotfiles
              </span>
              <span className="text-[11px] text-gray-400">
                Display system dotfiles like <code className="font-mono">.gitignore</code> or{' '}
                <code className="font-mono">.env</code> in listings.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.showHiddenFiles}
            onChange={(e) => updatePreferences({ showHiddenFiles: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333]">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200 block">
                Confirm Before Deletion
              </span>
              <span className="text-[11px] text-gray-400">
                Ask for confirmation before moving files or folders into the Trash bin.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.confirmDelete}
            onChange={(e) => updatePreferences({ confirmDelete: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
