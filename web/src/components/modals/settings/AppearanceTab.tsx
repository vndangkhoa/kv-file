import { Moon, Sun, Monitor, Check, LucideIcon } from 'lucide-react';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export const AppearanceTab: React.FC = () => {
  const { preferences, updatePreferences } = useSettingsStore();

  const themes: { id: 'dark' | 'light' | 'system'; label: string; icon: LucideIcon }[] = [
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'system', label: 'System Default', icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-2xl text-xs">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
          Appearance & Theme
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Customize the visual interface and display density of KV Files.
        </p>
      </div>

      {/* Theme Cards */}
      <div className="space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-300 block">
          Interface Theme
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updatePreferences({ theme: t.id })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-[#1e1e1e]/50'
                }`}
              >
                <div className="p-2 rounded-full bg-white dark:bg-[#252526] shadow-sm">
                  <Icon size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{t.label}</span>
                  {isSelected && <Check size={13} className="stroke-[2.5]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* UI Density */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#333333] space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-300 block">
          Display Density
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updatePreferences({ density: 'comfortable' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              preferences.density === 'comfortable'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-800 dark:text-gray-200">Comfortable</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Standard row heights and spacing across tree and column views.
            </div>
          </button>

          <button
            type="button"
            onClick={() => updatePreferences({ density: 'compact' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              preferences.density === 'compact'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-800 dark:text-gray-200">Compact</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Denser rows with reduced padding for large directories.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
