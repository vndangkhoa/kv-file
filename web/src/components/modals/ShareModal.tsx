import React, { useState } from 'react';
import { X, Share2, Copy, Check, Lock, Calendar, Download } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { ShareItem } from '../../types';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, activeItem, selectedItems } = useExplorerStore();
  const item = activeItem || (selectedItems.length > 0 ? selectedItems[0] : null);

  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [createdShare, setCreatedShare] = useState<ShareItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isShareModalOpen || !item) return null;

  const handleCreateShare = async () => {
    setIsLoading(true);
    try {
      const share = await api.createShare(
        item.root_name,
        item.path,
        item.is_dir,
        password || undefined,
        expiresAt || undefined,
        allowDownload
      );
      setCreatedShare(share);
    } catch (err: any) {
      alert(`Failed to create share: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = createdShare
    ? `${window.location.origin}/api/v1/public/share/${createdShare.token}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCreatedShare(null);
    setPassword('');
    setExpiresAt('');
    setShareModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] p-5 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Share "{item.name}"
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {createdShare ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
              Public share link created successfully!
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Share URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full text-xs font-mono p-2 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-1.5 bg-gray-200 dark:bg-[#333333] hover:bg-gray-300 dark:hover:bg-[#444] rounded text-xs font-medium text-gray-800 dark:text-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                <Lock size={13} className="text-gray-400" />
                <span>Password Protection (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank for public access"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-gray-400" />
                <span>Expiration Date (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full text-xs p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Allow Download */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="allow-dl"
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <label htmlFor="allow-dl" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1">
                <Download size={13} className="text-gray-400" />
                <span>Allow viewers to download this file</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-[#333333]">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShare}
                disabled={isLoading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Share Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
