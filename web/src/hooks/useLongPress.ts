import { useRef, useCallback } from 'react';

interface LongPressOptions {
  onLongPress: (e: React.TouchEvent | TouchEvent, clientX: number, clientY: number) => void;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  threshold?: number; // ms
}

export function useLongPress({ onLongPress, onClick, threshold = 500 }: LongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const start = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      startCoordsRef.current = { x: touch.clientX, y: touch.clientY };
      isLongPressTriggeredRef.current = false;

      timerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        if (navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {
            // ignore
          }
        }
        onLongPress(e, touch.clientX, touch.clientY);
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const clear = useCallback(
    (e: React.TouchEvent, shouldTriggerClick: boolean = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (shouldTriggerClick && !isLongPressTriggeredRef.current && onClick) {
        onClick(e);
      }
      startCoordsRef.current = null;
    },
    [onClick]
  );

  const move = useCallback((e: React.TouchEvent) => {
    if (!startCoordsRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startCoordsRef.current.x;
    const dy = touch.clientY - startCoordsRef.current.y;
    // Cancel if finger moved more than 10 pixels (user is scrolling)
    if (Math.hypot(dx, dy) > 10) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onTouchMove: move,
  };
}
