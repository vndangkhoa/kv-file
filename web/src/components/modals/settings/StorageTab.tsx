import React, { useEffect, useState } from 'react';
import { HardDrive, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { useExplorerStore } from '../../../stores/useExplorerStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { api } from '../../../services/api';
import { formatHumanSize } from '../../../utils/format';

export const StorageTab: React.FC = () => {
  const { roots, fetchRoots } = useExplorerStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [retentionDays, setRetentionDays] = useState('30');
  const [maxUploadMb, setMaxUploadMb] = useState('1024');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchRoots();
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin, fetchRoots]);

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      if (s.trash_retention_days) setRetentionDays(s.trash_retention_days);
      if (s.max_upload_size_mb) setMaxUploadMb(s.max_upload_size_mb);
    } catch (err) {
      console.error('Failed to load server settings:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings({
        trash_retention_days: retentionDays,
        max_upload_size_mb: maxUploadMb,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(`Failed to save server settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl text-xs">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
          Storage Roots & Quotas
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Inspect mounted storage pools, available disk space, and lifecycle retention policies.
        </p>
      </div>

      {/* Mounted Storage Drives */}
      <div className="space-y-3">
        <label className="font-medium text-gray-700 dark:text-gray-300 block">
          Mounted Drives ({roots.length})
        </label>
        <div className="space-y-3">
          {roots.map((root) => {
            const usedPct =
              root.total_bytes > 0
                ? Math.min(100, Math.round((root.used_bytes / root.total_bytes) * 100))
                : 0;

            return (
              <div
                key={root.name}
                className="p-3.5 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333333] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {root.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">({root.path})</span>
                  </div>
                  <span className="font-mono text-gray-600 dark:text-gray-300 font-medium">
                    {usedPct}% used
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usedPct > 90 ? 'bg-red-500' : usedPct > 75 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Used: {formatHumanSize(root.used_bytes)}</span>
                  <span>Free: {formatHumanSize(root.free_bytes)}</span>
                  <span>Total: {formatHumanSize(root.total_bytes)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Policies (Admin only) */}
      {isAdmin && (
        <form
          onSubmit={handleSaveSettings}
          className="p-4 bg-gray-50/50 dark:bg-[#1e1e1e]/60 rounded-xl border border-gray-200 dark:border-[#333333] space-y-3"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-[#333333]">
            <ShieldCheck size={15} className="text-amber-500" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
              Storage Policies (Admin)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trash Auto-Purge (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#252526] border border-gray-300 dark:border-[#3c3c3c] rounded-lg text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Items older than this are eligible for cleanup.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Upload Chunk Size (MB)
              </label>
              <input
                type="number"
                min="10"
                max="10240"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#252526] border border-gray-300 dark:border-[#3c3c3c] rounded-lg text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Maximum single payload upload buffer size.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              {savedSuccess && <Check size={13} />}
              <span>{savedSuccess ? 'Policies Saved' : 'Save Policies'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
