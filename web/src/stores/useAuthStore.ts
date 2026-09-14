import { create } from 'zustand';
import { api } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'setup' | 'login';

  checkAuth: () => Promise<void>;
  login: (u: string, p: string) => Promise<void>;
  setup: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthModalOpen: (open: boolean, mode?: 'setup' | 'login') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: true,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: 'login',

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const status = await api.checkSetup();
      set({ isInitialized: status.is_initialized });

      if (!status.is_initialized) {
        set({ isAuthModalOpen: true, authMode: 'setup', isLoading: false });
        return;
      }

      const user = await api.getMe();
      set({ user, isLoading: false, isAuthModalOpen: false });
    } catch {
      // Not logged in or unauthorized
      set({ user: null, isLoading: false });
    }
  },

  login: async (username, password) => {
    const res = await api.login(username, password);
    set({ user: res.user, isAuthModalOpen: false });
  },

  setup: async (username, password) => {
    const res = await api.initialSetup(username, password);
    set({ user: res.user, isInitialized: true, isAuthModalOpen: false });
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthModalOpen: true, authMode: 'login' });
  },

  setAuthModalOpen: (open, mode = 'login') => set({ isAuthModalOpen: open, authMode: mode }),
}));
