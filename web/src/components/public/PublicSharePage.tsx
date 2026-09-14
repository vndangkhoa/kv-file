import React, { useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Lock,
  ExternalLink,
  FileText,
  AlertCircle,
  Eye,
  Calendar,
  HardDrive,
  FolderArchive,
  Sun,
  Moon,
  ArrowLeft,
  Code,
  FileCode,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { PublicShareInfo, PublicShareBundleItem } from '../../types';
import { FileIcon } from '../common/FileIcon';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface PublicSharePageProps {
  token: string;
}

const TEXT_EXTENSIONS = [
  'txt', 'md', 'markdown', 'yml', 'yaml', 'json', 'toml', 'xml', 'html', 'css', 'scss',
  'js', 'jsx', 'ts', 'tsx', 'rs', 'go', 'py', 'sh', 'bash', 'zsh', 'env', 'conf', 'ini',
  'sql', 'c', 'cpp', 'h', 'hpp', 'java', 'kt', 'php', 'rb', 'dockerfile', 'lock', 'log'
];

export const PublicSharePage: React.FC<PublicSharePageProps> = ({ token }) => {
  const { preferences, updatePreferences } = useSettingsStore();
  const [shareInfo, setShareInfo] = useState<PublicShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bundle active preview item
  const [activeBundleItem, setActiveBundleItem] = useState<PublicShareBundleItem | null>(null);

  // Password state
  const [password, setPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Content preview state for text/code
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [markdownMode, setMarkdownMode] = useState<'rendered' | 'raw'>('raw');

  // Clipboard states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const fetchShareInfo = useCallback(async (pw?: string) => {
    try {
      setLoading(true);
      setError(null);
      setPasswordError(null);
      const data = await api.getPublicShareInfo(token, pw);
      setShareInfo(data);
      if (pw) {
        setPassword(pw);
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('password')) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Shared link not found or expired.');
      }
    } finally {
      setLoading(false);
      setIsVerifyingPassword(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShareInfo();
  }, [fetchShareInfo]);

  // Determine active item to preview (either single share item or chosen bundle sub-item)
  const previewItem = shareInfo?.is_bundle ? activeBundleItem : shareInfo;
  const ext = (previewItem?.extension || '').toLowerCase();
  const isTextOrCode =
    previewItem &&
    !previewItem.is_dir &&
    (previewItem.media_type === 'text' ||
      previewItem.media_type === 'code' ||
      TEXT_EXTENSIONS.includes(ext) ||
      previewItem.name.toLowerCase().includes('dockerfile') ||
      previewItem.name.toLowerCase().includes('compose') ||
      previewItem.mime_type.startsWith('text/'));

  // Fetch text/code content when previewItem is loaded and doesn't require password
  useEffect(() => {
    if (shareInfo && !shareInfo.requires_password && previewItem && isTextOrCode) {
      if (previewItem.size > 15 * 1024 * 1024) {
        setTextContent('// File is larger than 15MB. Please download the file to inspect its full contents.');
        return;
      }
      setLoadingContent(true);
      const rawUrl = shareInfo.is_bundle && activeBundleItem
        ? api.getPublicShareRawUrl(token, password, activeBundleItem.path)
        : api.getPublicShareRawUrl(token, password);
      fetch(rawUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load content');
          return res.text();
        })
        .then((text) => setTextContent(text))
        .catch(() => setTextContent('// Unable to load preview content from server.'))
        .finally(() => setLoadingContent(false));
    } else {
      setTextContent(null);
    }
  }, [shareInfo, previewItem, activeBundleItem, isTextOrCode, token, password]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsVerifyingPassword(true);
    fetchShareInfo(passwordInput.trim());
  };

  const handleDownload = () => {
    if (!shareInfo || !shareInfo.allow_download) return;
    const downloadUrl = api.getPublicShareDownloadUrl(token, password);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const downloadName = shareInfo.is_bundle ? `${shareInfo.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip` : shareInfo.name;
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadItem = (bundleItem: PublicShareBundleItem) => {
    if (!shareInfo || !shareInfo.allow_download) return;
    const downloadUrl = api.getPublicShareDownloadUrl(token, password, bundleItem.path);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const downloadName = bundleItem.is_dir ? `${bundleItem.name}.zip` : bundleItem.name;
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContent = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const toggleTheme = () => {
    const next = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: next });
  };

  const lines = textContent ? textContent.split('\n') : [];
  const currentRawUrl = shareInfo
    ? shareInfo.is_bundle && activeBundleItem
      ? api.getPublicShareRawUrl(token, password, activeBundleItem.path)
      : api.getPublicShareRawUrl(token, password)
    : '';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#f8fafc] dark:bg-[#121212] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500/20">
      {/* Top Brand Header */}
      <header className="h-16 border-b border-gray-200 dark:border-[#2a2a2a] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
            title="Go to KV Files Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
              <HardDrive size={20} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
                  KV Files
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  Share
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                Secure File Distribution
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#282828] transition-colors"
            title="Toggle theme"
          >
            {preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>KV Files Explorer</span>
          </a>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start">
        {loading ? (
          /* Loading State */
          <div className="my-auto flex flex-col items-center gap-4 py-20 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin shadow-md" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Accessing Shared File...
              </h3>
              <p className="text-xs text-gray-400">Verifying security token and permissions</p>
            </div>
          </div>
        ) : error ? (
          /* Error / Expired / Revoked State */
          <div className="my-auto w-full max-w-md bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-2xl p-8 shadow-xl text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500 shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Shared Link Not Found or Expired
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {error || 'This link may have been revoked by the owner, deleted, or exceeded its expiration time.'}
              </p>
            </div>
            <a
              href="/"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to KV Files</span>
            </a>
          </div>
        ) : shareInfo?.requires_password ? (
          /* Password Protected Prompt */
          <div className="my-auto w-full max-w-md bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-2xl p-8 shadow-xl text-center flex flex-col items-center gap-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500 shadow-inner">
              <Lock size={30} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Password Protected
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The owner has secured <span className="font-semibold text-gray-700 dark:text-gray-200">"{shareInfo.name}"</span> with a password. Please enter it below to access.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Enter share password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-all"
                />
                {passwordError && (
                  <p className="text-xs text-red-500 font-medium text-left mt-1.5 pl-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingPassword || !passwordInput.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isVerifyingPassword ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Unlock & Access File</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : shareInfo ? (
          /* Active Shared Item View */
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Top Card: Meta & Primary Actions */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-[#383838] flex items-center justify-center shadow-inner">
                  {shareInfo.is_bundle ? (
                    <Layers size={30} className="text-emerald-500" />
                  ) : shareInfo.is_dir ? (
                    <FolderArchive size={30} className="text-amber-500" />
                  ) : (
                    <FileIcon item={{ media_type: shareInfo.media_type, is_dir: shareInfo.is_dir }} size={30} />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {shareInfo.name}
                    </h1>
                    {shareInfo.has_password && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                        <Lock size={10} />
                        <span>Protected</span>
                      </span>
                    )}
                    {shareInfo.is_bundle && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <Layers size={10} />
                        <span>Bundle ({shareInfo.bundle_items?.length || 0})</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {shareInfo.is_bundle
                        ? `${shareInfo.bundle_items?.length || 0} items (${shareInfo.human_size})`
                        : shareInfo.is_dir
                        ? 'Folder Archive'
                        : shareInfo.human_size}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300">
                      {shareInfo.is_bundle ? 'BUNDLE' : (shareInfo.extension || (shareInfo.is_dir ? 'FOLDER' : shareInfo.media_type))}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      <span>{shareInfo.view_count} views</span>
                    </span>
                    {shareInfo.expires_at && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Calendar size={13} />
                          <span>Expires: {new Date(shareInfo.expires_at).toLocaleDateString()}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                  title="Copy public link"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                {!shareInfo.is_bundle && !shareInfo.is_dir && (
                  <a
                    href={currentRawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2.5 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
                    title="Open raw file in new tab"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                {shareInfo.allow_download ? (
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all min-w-[140px]"
                  >
                    <Download size={15} />
                    <span>
                      {shareInfo.is_bundle
                        ? `Download All as .ZIP (${shareInfo.human_size})`
                        : shareInfo.is_dir
                        ? 'Download as .ZIP'
                        : `Download (${shareInfo.human_size})`}
                    </span>
                  </button>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] text-gray-400 text-xs font-medium">
                    Download disabled by owner
                  </div>
                )}
              </div>
            </div>

            {/* Bundle Item Selection View (when in bundle mode and no single sub-item selected) */}
            {shareInfo.is_bundle && !activeBundleItem ? (
              <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#222]/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Layers size={16} className="text-emerald-500" />
                      <span>Bundle Contents ({shareInfo.bundle_items?.length || 0} items)</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Click any file to preview or download individually</p>
                  </div>
                  {shareInfo.allow_download && (
                    <button
                      onClick={handleDownload}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download size={13} />
                      <span>Download All (.ZIP)</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-100 dark:divide-[#282828] overflow-y-auto max-h-[600px]">
                  {shareInfo.bundle_items && shareInfo.bundle_items.length > 0 ? (
                    shareInfo.bundle_items.map((bItem, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveBundleItem(bItem)}
                        className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#252525] flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center shrink-0">
                            {bItem.is_dir ? (
                              <FolderArchive size={20} className="text-amber-500" />
                            ) : (
                              <FileIcon item={{ media_type: bItem.media_type, is_dir: bItem.is_dir }} size={20} />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {bItem.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {bItem.is_dir ? 'Directory' : bItem.human_size} • {bItem.extension?.toUpperCase() || (bItem.is_dir ? 'FOLDER' : bItem.media_type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveBundleItem(bItem);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-[#2c2c2c] hover:bg-gray-200 dark:hover:bg-[#383838] text-gray-700 dark:text-gray-300 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Preview</span>
                          </button>
                          {shareInfo.allow_download && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadItem(bItem);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                              title="Download this item"
                            >
                              <Download size={12} />
                              <span>{bItem.is_dir ? 'ZIP' : 'Get'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">
                      This bundle has no items available.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Preview Section for single share OR active bundle item */
              <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[420px]">
                {/* Preview Container Header */}
                <div className="h-11 px-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50/70 dark:bg-[#242424]/70 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {shareInfo.is_bundle && (
                      <>
                        <button
                          onClick={() => setActiveBundleItem(null)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                        >
                          <ArrowLeft size={13} />
                          <span>All Items</span>
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                      </>
                    )}
                    <Eye size={14} className="text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {previewItem?.name || 'Preview'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-normal shrink-0">
                      ({previewItem?.human_size || previewItem?.mime_type || ''})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isTextOrCode && textContent && (
                      <>
                        {ext === 'md' && (
                          <button
                            onClick={() => setMarkdownMode(markdownMode === 'rendered' ? 'raw' : 'rendered')}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#3e3e3e] transition-colors"
                          >
                            <Code size={13} />
                            <span>{markdownMode === 'rendered' ? 'Raw Code' : 'Preview'}</span>
                          </button>
                        )}
                        <button
                          onClick={handleCopyContent}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#3e3e3e] transition-colors"
                          title="Copy file text"
                        >
                          {copiedContent ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          <span>{copiedContent ? 'Copied' : 'Copy'}</span>
                        </button>
                      </>
                    )}

                    {shareInfo.is_bundle && activeBundleItem && shareInfo.allow_download && (
                      <button
                        onClick={() => handleDownloadItem(activeBundleItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Body based on Media Type */}
                <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-[#181818]/50 overflow-hidden">
                  {previewItem?.is_dir ? (
                    /* Folder Archive Banner */
                    <div className="m-auto p-8 flex flex-col items-center text-center gap-4 max-w-md">
                      <div className="w-18 h-18 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                        <FolderArchive size={40} />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                          Folder Directory: {previewItem.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          This folder can be downloaded compressed as a .ZIP archive.
                        </p>
                      </div>
                      {shareInfo.allow_download && (
                        <button
                          onClick={() => {
                            if (activeBundleItem) handleDownloadItem(activeBundleItem);
                            else handleDownload();
                          }}
                          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                        >
                          <Download size={16} />
                          <span>Download Folder as .ZIP</span>
                        </button>
                      )}
                    </div>
                  ) : previewItem?.media_type === 'image' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) ? (
                    /* Image Preview */
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-[400px]">
                      <img
                        src={currentRawUrl}
                        alt={previewItem?.name || ''}
                        className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md select-none border border-gray-200 dark:border-[#333] bg-white dark:bg-[#222]"
                      />
                    </div>
                  ) : previewItem?.media_type === 'video' || ['mp4', 'webm', 'mov', 'mkv', 'm4v', '3gp'].includes(ext) ? (
                    /* Video Player */
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-black">
                      <video
                        src={currentRawUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-w-full max-h-[70vh] rounded-xl shadow-2xl bg-black"
                      />
                    </div>
                  ) : previewItem?.media_type === 'audio' || ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext) ? (
                    /* Audio Player Card */
                    <div className="m-auto p-8 w-full max-w-lg flex flex-col items-center gap-5 text-center">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <FileText size={36} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                          {previewItem?.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {previewItem?.human_size} • {previewItem?.mime_type}
                        </p>
                      </div>
                      <audio src={currentRawUrl} controls className="w-full mt-2" />
                    </div>
                  ) : previewItem?.media_type === 'pdf' || ext === 'pdf' ? (
                    /* PDF Document Viewer */
                    <div className="w-full h-[75vh] flex flex-col">
                      <object
                        data={currentRawUrl}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <iframe
                          src={currentRawUrl}
                          title={previewItem?.name || 'PDF'}
                          className="w-full h-full border-0"
                        >
                          <div className="m-auto p-8 flex flex-col items-center justify-center gap-3 text-center">
                            <FileText size={48} className="text-red-500 opacity-70" />
                            <p className="text-sm font-medium">PDF preview not supported in this browser.</p>
                            <a
                              href={currentRawUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                            >
                              <ExternalLink size={14} />
                              <span>Open PDF in Tab</span>
                            </a>
                          </div>
                        </iframe>
                      </object>
                    </div>
                  ) : isTextOrCode ? (
                    /* Text / Code File Preview (YAML, JSON, Python, etc.) */
                    loadingContent ? (
                      <div className="m-auto p-12 flex flex-col items-center gap-3 text-center">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        <span className="text-xs text-gray-400">Loading file contents...</span>
                      </div>
                    ) : textContent !== null ? (
                      <div className="flex-1 flex flex-col overflow-hidden text-xs">
                        <div className="flex-1 flex overflow-auto font-mono">
                          {/* Line gutter */}
                          <div className="bg-gray-100/70 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2e2e2e] py-4 px-3 select-none text-right text-gray-400 font-mono text-[11px] shrink-0">
                            {lines.map((_, idx) => (
                              <div key={idx} className="leading-5">
                                {idx + 1}
                              </div>
                            ))}
                          </div>

                          {/* Code pre */}
                          <pre className="flex-1 py-4 px-5 font-mono overflow-auto whitespace-pre leading-5 text-gray-800 dark:text-gray-200 bg-white dark:bg-[#191919]">
                            {textContent}
                          </pre>
                        </div>

                        {/* Footer meta */}
                        <div className="px-4 py-1.5 bg-gray-100 dark:bg-[#202020] border-t border-gray-200 dark:border-[#2e2e2e] flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                          <span>{lines.length} lines • {textContent.length} characters</span>
                          <span className="uppercase text-emerald-600 dark:text-emerald-400 font-semibold">UTF-8</span>
                        </div>
                      </div>
                    ) : (
                      <div className="m-auto p-12 text-center text-xs text-gray-400">
                        No text content available.
                      </div>
                    )
                  ) : (
                    /* Generic File Preview / Download Prompt */
                    <div className="m-auto p-8 sm:p-12 flex flex-col items-center text-center gap-4 max-w-md">
                      <div className="w-18 h-18 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-500 shadow-inner">
                        <FileCode size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                          {previewItem?.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Inline browser preview is not available for this file type. You can download the file to inspect or use it on your device.
                        </p>
                      </div>
                      {shareInfo.allow_download && (
                        <button
                          onClick={() => {
                            if (activeBundleItem) handleDownloadItem(activeBundleItem);
                            else handleDownload();
                          }}
                          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                        >
                          <Download size={16} />
                          <span>Download File ({previewItem?.human_size})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-[#222] text-center text-xs text-gray-400 dark:text-gray-500 flex flex-col items-center gap-1">
        <p>Powered by <span className="font-semibold text-gray-700 dark:text-gray-300">KV Files</span> — High-Performance Self-Hosted Storage</p>
        <p className="text-[11px] opacity-75">End-to-End Secure File Hosting & Streaming</p>
      </footer>
    </div>
  );
};
