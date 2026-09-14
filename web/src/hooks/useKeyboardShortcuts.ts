import { useEffect } from 'react';
import { useExplorerStore } from '../stores/useExplorerStore';

export function useKeyboardShortcuts() {
  const {
    selectedItems,
    listing,
    viewMode,
    isQuickLookOpen,
    isUploadOpen,
    isShareModalOpen,
    isTrashOpen,
    isNewFolderOpen,
    isRenameOpen,
    setQuickLookOpen,
    setRenameOpen,
    setNewFolderOpen,
    selectItem,
    clearSelection,
    refresh,
    goUp,
  } = useExplorerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore global hotkeys if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if any modal is active
      const anyModalOpen =
        isQuickLookOpen ||
        isUploadOpen ||
        isShareModalOpen ||
        isTrashOpen ||
        isNewFolderOpen ||
        isRenameOpen;

      // 1. Space -> Quick Look
      if (e.code === 'Space' && !anyModalOpen) {
        e.preventDefault();
        if (selectedItems.length > 0 && !selectedItems[0].is_dir) {
          setQuickLookOpen(true);
        }
        return;
      }

      // 2. F2 -> Rename
      if (e.key === 'F2' && !anyModalOpen) {
        e.preventDefault();
        if (selectedItems.length === 1) {
          setRenameOpen(true);
        }
        return;
      }

      // 3. Ctrl+Shift+N -> New Folder
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewFolderOpen(true);
        return;
      }

      // 4. Ctrl+A -> Select All
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !anyModalOpen) {
        e.preventDefault();
        if (listing && listing.items.length > 0) {
          for (const item of listing.items) {
            selectItem(item, true);
          }
        }
        return;
      }

      // 5. Backspace or Alt+Up -> Go Up
      if ((e.key === 'Backspace' || (e.altKey && e.key === 'ArrowUp')) && !anyModalOpen) {
        e.preventDefault();
        goUp();
        return;
      }

      // 6. Escape -> Clear selection
      if (e.key === 'Escape' && !anyModalOpen) {
        clearSelection();
        return;
      }

      // 7. Arrow navigation (Up/Down) in List and Grid
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !anyModalOpen && listing) {
        const items = listing.items;
        if (items.length === 0) return;

        e.preventDefault();
        const currentSelected = selectedItems[0];
        const currentIndex = currentSelected
          ? items.findIndex((i) => i.path === currentSelected.path)
          : -1;

        let nextIndex = 0;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }

        selectItem(items[nextIndex], false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedItems,
    listing,
    viewMode,
    isQuickLookOpen,
    isUploadOpen,
    isShareModalOpen,
    isTrashOpen,
    isNewFolderOpen,
    isRenameOpen,
    setQuickLookOpen,
    setRenameOpen,
    setNewFolderOpen,
    selectItem,
    clearSelection,
    refresh,
    goUp,
  ]);
}
