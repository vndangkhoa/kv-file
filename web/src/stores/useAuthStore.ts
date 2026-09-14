import { create } from 'zustand';
import { api } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'setup' | 'login';

  // 2FA state during login challenge
  requires2fa: boolean;
  preAuthToken: string | null;

  checkAuth: () => Promise<void>;
  login: (u: string, p: string) => Promise<void>;
  verify2fa: (code: string) => Promise<void>;
  cancel2fa: () => void;
  setup: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthModalOpen: (open: boolean, mode?: 'setup' | 'login') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialized: true,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: 'login',
  requires2fa: false,
  preAuthToken: null,

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
      // Not logged in or unauthorized: prompt login modal
      set({ user: null, isLoading: false, isAuthModalOpen: true, authMode: 'login' });
    }
  },

  login: async (username, password) => {
    const res = await api.login(username, password);
    if (res.requires_2fa && res.pre_auth_token) {
      set({ requires2fa: true, preAuthToken: res.pre_auth_token });
      return;
    }
    set({
      user: res.user || null,
      isAuthModalOpen: false,
      requires2fa: false,
      preAuthToken: null,
    });
  },

  verify2fa: async (code) => {
    const { preAuthToken } = get();
    if (!preAuthToken) {
      throw new Error('No 2FA challenge found. Please log in again.');
    }
    const res = await api.verifyLogin2fa(preAuthToken, code);
    set({
      user: res.user || null,
      isAuthModalOpen: false,
      requires2fa: false,
      preAuthToken: null,
    });
  },

  cancel2fa: () => {
    set({ requires2fa: false, preAuthToken: null });
  },

  setup: async (username, password) => {
    const res = await api.initialSetup(username, password);
    set({ user: res.user, isInitialized: true, isAuthModalOpen: false });
  },

  logout: async () => {
    await api.logout();
    set({
      user: null,
      isAuthModalOpen: true,
      authMode: 'login',
      requires2fa: false,
      preAuthToken: null,
    });
  },

  setAuthModalOpen: (open, mode = 'login') =>
    set({
      isAuthModalOpen: open,
      authMode: mode,
      requires2fa: false,
      preAuthToken: null,
    }),
}));
