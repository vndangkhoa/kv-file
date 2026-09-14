import { useEffect, useState, useRef } from 'react';

interface UseWindowFileDropOptions {
  onFilesDrop: (files: File[]) => void;
  disabled?: boolean;
}

export function useWindowFileDrop({ onFilesDrop, disabled = false }: UseWindowFileDropOptions) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (disabled) return;

    const isExternalFileDrag = (e: DragEvent): boolean => {
      if (!e.dataTransfer) return false;
      // 'Files' is present when dragging files from desktop/OS
      return (
        e.dataTransfer.types.includes('Files') &&
        !e.dataTransfer.types.includes('application/x-kv-file')
      );
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (isExternalFileDrag(e)) {
        dragCounter.current += 1;
        setIsDraggingOver(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (isExternalFileDrag(e)) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy';
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (isExternalFileDrag(e)) {
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDraggingOver(false);
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (isExternalFileDrag(e)) {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDraggingOver(false);

        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          const fileList = Array.from(e.dataTransfer.files);
          onFilesDrop(fileList);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFilesDrop, disabled]);

  return { isDraggingOver };
}
