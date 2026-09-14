import React from 'react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { formatHumanSize } from '../../utils/format';

interface StatusBarProps {
  wsConnected: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ wsConnected }) => {
  const { listing, selectedItems, roots, currentRoot } = useExplorerStore();

  const totalItems = listing?.total_items || 0;
  const selectedCount = selectedItems.length;
  const selectedSize = selectedItems.reduce((acc, i) => acc + i.size, 0);

  const activeRoot = roots.find((r) => r.name === currentRoot);
  const freeGB = activeRoot ? Math.round(activeRoot.free_bytes / 1024 / 1024 / 1024) : 0;
  const totalGB = activeRoot ? Math.round(activeRoot.total_bytes / 1024 / 1024 / 1024) : 0;

  return (
    <footer className="h-6 bg-gray-100 dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-[#333333] flex items-center justify-between px-3 text-[11px] text-gray-500 dark:text-gray-400 select-none shrink-0">
      {/* Items & Selection */}
      <div className="flex items-center gap-3">
        <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        {selectedCount > 0 && (
          <>
            <span>|</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {selectedCount} selected ({formatHumanSize(selectedSize)})
            </span>
          </>
        )}
      </div>

      {/* Drive Capacity & Live Sync Pulse */}
      <div className="flex items-center gap-3">
        {activeRoot && (
          <span>
            Storage: {freeGB} GB free of {totalGB} GB
          </span>
        )}

        <span>|</span>

        {/* Live WebSocket Status */}
        <div className="flex items-center gap-1.5" title={wsConnected ? 'Real-time sync connected' : 'Connecting real-time sync...'}>
          <div
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[10px]">{wsConnected ? 'Live' : 'Connecting'}</span>
        </div>
      </div>
    </footer>
  );
};
