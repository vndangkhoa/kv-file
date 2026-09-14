import React, { useEffect, useState } from 'react';
import { X, Share2, Trash2, Copy, Check, Lock, Calendar, RefreshCw } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { ShareItem } from '../../types';

export const ActiveSharesModal: React.FC = () => {
  const { isActiveSharesOpen, setActiveSharesOpen } = useExplorerStore();
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadShares = async () => {
    setIsLoading(true);
    try {
      const list = await api.listShares();
      setShares(list);
    } catch (err) {
      console.error('Failed to load active shares:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isActiveSharesOpen) {
      loadShares();
    }
  }, [isActiveSharesOpen]);

  if (!isActiveSharesOpen) return null;

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (confirm('Revoke this share link immediately? Anyone with the link will lose access.')) {
      try {
        await api.deleteShare(id);
        setShares((prev) => prev.filter((s) => s.id !== id));
      } catch (err: any) {
        alert(`Failed to revoke share: ${err.message}`);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none"
      onClick={() => setActiveSharesOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden max-h-[80vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Shared Links Hub
              </h3>
              <p className="text-xs text-gray-500">
                {shares.length} active public and internal shared item{shares.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadShares}
              title="Refresh"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setActiveSharesOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Shares List */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && shares.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full mb-2" />
              <span>Loading active shares...</span>
            </div>
          ) : shares.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-center text-xs">
              <Share2 size={36} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300">No active shared links</p>
              <p className="text-gray-400 mt-1 max-w-sm">
                Right-click any file or folder and click "Share Link..." to generate public or
                password-protected access links.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-xl hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
                        {share.path.split('/').pop() || share.path}
                      </span>
                      {share.has_password && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                          <Lock size={10} /> Password
                        </span>
                      )}
                      {share.is_dir && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-[10px] font-medium text-blue-700 dark:text-blue-400">
                          Folder
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                      Root: {share.root_name} • Path: /{share.path}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1.5">
                      <span>Created: {new Date(share.created_at).toLocaleDateString()}</span>
                      {share.expires_at ? (
                        <span className="flex items-center gap-1 text-red-500">
                          <Calendar size={11} /> Expires {new Date(share.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Never expires</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(share.token)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-200 dark:bg-[#2e2e2e] hover:bg-gray-300 dark:hover:bg-[#3e3e3e] text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {copiedId === share.token ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>{copiedId === share.token ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleRevoke(share.id)}
                      title="Revoke Share Link"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
