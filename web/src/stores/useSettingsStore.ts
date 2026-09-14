import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode } from '../types';

export type SettingsTab = 'account' | 'appearance' | 'explorer' | 'storage' | 'about';

export interface Preferences {
  theme: 'dark' | 'light' | 'system';
  showHiddenFiles: boolean;
  confirmDelete: boolean;
  defaultViewMode: ViewMode;
  density: 'compact' | 'comfortable';
}

interface SettingsState {
  isOpen: boolean;
  activeTab: SettingsTab;
  preferences: Preferences;

  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setActiveTab: (tab: SettingsTab) => void;
  updatePreferences: (updates: Partial<Preferences>) => void;
}

const applyTheme = (theme: 'dark' | 'light' | 'system') => {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeTab: 'account',
      preferences: {
        theme: 'dark',
        showHiddenFiles: false,
        confirmDelete: true,
        defaultViewMode: 'columns',
        density: 'comfortable',
      },

      openSettings: (tab = 'account') => set({ isOpen: true, activeTab: tab }),
      closeSettings: () => set({ isOpen: false }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      updatePreferences: (updates) => {
        const next = { ...get().preferences, ...updates };
        set({ preferences: next });
        if (updates.theme !== undefined) {
          applyTheme(updates.theme);
        }
      },
    }),
    {
      name: 'kv_file_settings_v2',
      partialize: (state) => ({ preferences: state.preferences }),
      onRehydrateStorage: () => (state) => {
        if (state?.preferences?.theme) {
          applyTheme(state.preferences.theme);
        }
      },
    }
  )
);
