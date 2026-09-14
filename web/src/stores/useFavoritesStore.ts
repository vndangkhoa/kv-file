import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileItem } from '../types';

export interface FavoriteItem {
  id: string; // root:path
  name: string;
  path: string;
  root_name: string;
  is_dir: boolean;
  extension?: string;
  added_at: number;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (root: string, item: FileItem | { name: string; path: string; is_dir: boolean; extension?: string }) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (root: string, path: string) => boolean;
  toggleFavorite: (root: string, item: FileItem | { name: string; path: string; is_dir: boolean; extension?: string }) => void;
  renameFavorite: (id: string, newName: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [
        {
          id: 'storage:documents',
          name: 'Documents',
          path: 'documents',
          root_name: 'storage',
          is_dir: true,
          added_at: Date.now() - 100000,
        },
        {
          id: 'storage:media',
          name: 'Media',
          path: 'media',
          root_name: 'storage',
          is_dir: true,
          added_at: Date.now() - 50000,
        },
        {
          id: 'storage:code',
          name: 'Code',
          path: 'code',
          root_name: 'storage',
          is_dir: true,
          added_at: Date.now() - 10000,
        },
      ],

      addFavorite: (root, item) => {
        const id = `${root}:${item.path}`;
        const existing = get().favorites.find((f) => f.id === id);
        if (existing) return;

        const newFav: FavoriteItem = {
          id,
          name: item.name,
          path: item.path,
          root_name: root,
          is_dir: item.is_dir,
          extension: (item as any).extension || '',
          added_at: Date.now(),
        };

        set((state) => ({
          favorites: [...state.favorites, newFav],
        }));
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      isFavorite: (root, path) => {
        const id = `${root}:${path}`;
        return get().favorites.some((f) => f.id === id);
      },

      toggleFavorite: (root, item) => {
        const id = `${root}:${item.path}`;
        if (get().isFavorite(root, item.path)) {
          get().removeFavorite(id);
        } else {
          get().addFavorite(root, item);
        }
      },

      renameFavorite: (id, newName) => {
        set((state) => ({
          favorites: state.favorites.map((f) => (f.id === id ? { ...f, name: newName } : f)),
        }));
      },
    }),
    {
      name: 'kv-files-favorites',
    }
  )
);
