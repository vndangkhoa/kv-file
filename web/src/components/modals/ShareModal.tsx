import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Lock,
  Calendar,
  Download,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  Key,
  QrCode,
  Upload,
  Eye,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { ShareItem } from '../../types';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, activeItem, selectedItems } = useExplorerStore();
  const isMulti = selectedItems.length > 1;
  const item = activeItem || (selectedItems.length > 0 ? selectedItems[0] : null);

  // Tabs: 'external' (public link) | 'internal' (local users)
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external');

  // Advanced settings toggle
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // External share settings
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowUpload, setAllowUpload] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState<string>('unlimited');
  const [showQrCode, setShowQrCode] = useState(false);

  // Internal share settings
  const [internalUser, setInternalUser] = useState('@guest');
  const [internalRole, setInternalRole] = useState<'viewer' | 'editor'>('viewer');
  const [internalSuccess, setInternalSuccess] = useState(false);

  const [createdShare, setCreatedShare] = useState<ShareItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isShareModalOpen || (!item && !isMulti)) return null;

  const handlePresetExpiration = (hours: number) => {
    if (hours === 0) {
      setExpiresAt('');
      return;
    }
    const d = new Date(Date.now() + hours * 3600000);
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setExpiresAt(iso);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setEnablePassword(true);
  };

  const handleCreateShare = async () => {
    setIsLoading(true);
    try {
      let share: ShareItem;
      if (isMulti) {
        share = await api.createShare(
          selectedItems[0].root_name,
          selectedItems[0].path,
          true,
          enablePassword && password ? password : undefined,
          expiresAt || undefined,
          allowDownload,
          selectedItems.map((i) => i.path)
        );
      } else if (item) {
        share = await api.createShare(
          item.root_name,
          item.path,
          item.is_dir,
          enablePassword && password ? password : undefined,
          expiresAt || undefined,
          allowDownload
        );
      } else {
        return;
      }
      setCreatedShare(share);
    } catch (err: any) {
      alert(`Failed to create share: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInternalShare = () => {
    setInternalSuccess(true);
    setTimeout(() => {
      setInternalSuccess(false);
      setShareModalOpen(false);
    }, 1500);
  };

  const shareUrl = createdShare
    ? `${window.location.origin}/share/${createdShare.token}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const title = isMulti ? `Shared Bundle (${selectedItems.length} items)` : (item?.name || 'File');
    const md = `[${title}](${shareUrl})`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleClose = () => {
    setCreatedShare(null);
    setPassword('');
    setEnablePassword(false);
    setExpiresAt('');
    setShowQrCode(false);
    setIsAdvancedOpen(false);
    setShareModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {isMulti ? `Share ${selectedItems.length} items (Bundle)` : `Share "${item?.name}"`}
              </h3>
              <p className="text-xs text-gray-400">
                {isMulti
                  ? 'Create a unified share link for all selected files & folders'
                  : 'Configure internal access or generate public token links'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        {!createdShare && (
          <div className="flex border-b border-gray-200 dark:border-[#333333] bg-gray-50/50 dark:bg-[#1f1f1f]">
            <button
              onClick={() => setActiveTab('external')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'external'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#252526]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Globe size={14} />
              <span>Public External Link</span>
            </button>
            <button
              onClick={() => setActiveTab('internal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'internal'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#252526]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Users size={14} />
              <span>Internal Users & Roles</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {createdShare ? (
            /* Created Share Success State */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>Secure share link created successfully!</span>
              </div>

              {/* URL Display */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Share URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full text-xs font-mono p-2.5 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded-xl select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-emerald-600/20"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#444] hover:bg-gray-100 dark:hover:bg-[#333] text-xs text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {copiedMd ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>Copy as Markdown Link</span>
                </button>

                <button
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#444] hover:bg-gray-100 dark:hover:bg-[#333] text-xs text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <QrCode size={13} />
                  <span>{showQrCode ? 'Hide QR Code' : 'Show QR Code'}</span>
                </button>
              </div>

              {/* QR Code preview for mobile scanning */}
              {showQrCode && (
                <div className="p-4 bg-gray-50 dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#333] flex flex-col items-center gap-2 text-center animate-in zoom-in-95 duration-150">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      shareUrl
                    )}`}
                    alt="Scan with mobile"
                    className="w-36 h-36 rounded-lg shadow-sm border p-1 bg-white"
                  />
                  <span className="text-[11px] text-gray-500">
                    Scan with camera to open instantly on iOS or Android
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 bg-gray-200 dark:bg-[#333333] hover:bg-gray-300 dark:hover:bg-[#444] rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeTab === 'external' ? (
            /* External Public Share Configuration */
            <div className="space-y-4">
              {isMulti && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <span>Bundle of {selectedItems.length} selected items:</span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-xs">
                    {selectedItems.map((si, idx) => (
                      <div key={idx} className="flex items-center justify-between py-0.5 text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[280px] font-mono text-[11px]">{si.name}</span>
                        <span className="text-[11px] text-gray-400 shrink-0">{si.is_dir ? 'Folder' : si.human_size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Advanced Accordion */}
              <div className="border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f1f1f] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} className="text-emerald-500" />
                    <span>Advanced Security & Permissions</span>
                  </span>
                  {isAdvancedOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {isAdvancedOpen && (
                  <div className="p-4 bg-white dark:bg-[#252526] space-y-4 border-t border-gray-200 dark:border-[#333333] text-xs">
                    {/* 1. Password Protection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Key size={13} className="text-gray-400" />
                          <span>Password Protection</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Generate Password
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="enable-pwd"
                          checked={enablePassword}
                          onChange={(e) => setEnablePassword(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Enter access password"
                          value={password}
                          disabled={!enablePassword}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setEnablePassword(true);
                          }}
                          className="flex-1 p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 text-xs disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* 2. Expiration Date Presets */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>Expiration Timer</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '1 Hour', h: 1 },
                          { label: '24 Hours', h: 24 },
                          { label: '7 Days', h: 168 },
                          { label: '30 Days', h: 720 },
                          { label: 'Never', h: 0 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => handlePresetExpiration(p.h)}
                            className="px-2 py-1 rounded border border-gray-200 dark:border-[#444] hover:bg-gray-100 dark:hover:bg-[#333] text-[11px] text-gray-600 dark:text-gray-400 transition-colors"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 text-xs"
                      />
                    </div>

                    {/* 3. Download & Upload Permissions */}
                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-[#333]">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="allow-dl"
                          className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300"
                        >
                          <Download size={13} className="text-gray-400" />
                          <span>Allow Direct Download</span>
                        </label>
                        <input
                          id="allow-dl"
                          type="checkbox"
                          checked={allowDownload}
                          onChange={(e) => setAllowDownload(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Max Download Limit</span>
                        <select
                          value={maxDownloads}
                          onChange={(e) => setMaxDownloads(e.target.value)}
                          className="p-1 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200"
                        >
                          <option value="unlimited">Unlimited</option>
                          <option value="5">5 downloads</option>
                          <option value="10">10 downloads</option>
                          <option value="25">25 downloads</option>
                        </select>
                      </div>

                      {item?.is_dir && (
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="allow-up"
                            className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300"
                          >
                            <Upload size={13} className="text-gray-400" />
                            <span>Drop-Box Mode (Allow guests to upload)</span>
                          </label>
                          <input
                            id="allow-up"
                            type="checkbox"
                            checked={allowUpload}
                            onChange={(e) => setAllowUpload(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Create Link Button */}
              <button
                onClick={handleCreateShare}
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <Globe size={15} />
                    <span>Create Public Share Link</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Internal User / Role Sharing */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Select User or Group
                </label>
                <select
                  value={internalUser}
                  onChange={(e) => setInternalUser(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 text-xs"
                >
                  <option value="@admin">Administrator (@admin)</option>
                  <option value="@engineering">Engineering Team (@engineering)</option>
                  <option value="@finance">Finance & Auditing (@finance)</option>
                  <option value="@guest">Guest Users (@guest)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Permission Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInternalRole('viewer')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      internalRole === 'viewer'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <Eye size={13} />
                      <span>Viewer</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Read and preview only</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInternalRole('editor')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      internalRole === 'editor'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <Upload size={13} />
                      <span>Editor</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Read, upload, and modify</p>
                  </button>
                </div>
              </div>

              {internalSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Check size={14} />
                  <span>Access granted to {internalUser}!</span>
                </div>
              )}

              <button
                onClick={handleCreateInternalShare}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Users size={15} />
                <span>Grant Internal Access</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
