import React, { useEffect, useState } from 'react';
import { X, Download, Maximize2, Minimize2, Copy, Check, Music } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { api } from '../../services/api';
import { formatHumanSize } from '../../utils/format';

export const QuickLookModal: React.FC = () => {
  const { isQuickLookOpen, setQuickLookOpen, activeItem, selectedItems, currentRoot, playAudio } =
    useExplorerStore();
  const { startDownload } = useDownloadStore();

  const [textContent, setTextContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const item = activeItem || (selectedItems.length > 0 ? selectedItems[0] : null);

  useEffect(() => {
    if (isQuickLookOpen && item && (item.media_type === 'text' || item.media_type === 'code')) {
      fetch(api.getRawFileUrl(item.root_name || currentRoot, item.path))
        .then((res) => res.text())
        .then((text) => setTextContent(text))
        .catch(() => setTextContent('Failed to load file text preview.'));
    } else {
      setTextContent(null);
    }
  }, [isQuickLookOpen, item, currentRoot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuickLookOpen) return;
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        setQuickLookOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickLookOpen, setQuickLookOpen]);

  if (!isQuickLookOpen || !item) return null;

  const rootName = item.root_name || currentRoot;
  const rawUrl = api.getRawFileUrl(rootName, item.path);

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    startDownload(rootName, item);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setQuickLookOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[85vh] h-[75vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="h-10 bg-gray-100 dark:bg-[#252526] border-b border-gray-200 dark:border-[#333333] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
              {item.name}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              ({formatHumanSize(item.size)})
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
              {item.extension || item.media_type}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              title="Direct Download with Live Progress"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              className="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              onClick={() => setQuickLookOpen(false)}
              title="Close (Space / Esc)"
              className="p-1 rounded text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 dark:bg-[#181818]">
          {item.media_type === 'image' ? (
            <img
              src={rawUrl}
              alt={item.name}
              className="max-w-full max-h-full object-contain select-none rounded shadow-sm"
            />
          ) : item.media_type === 'video' ? (
            <video
              src={rawUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded shadow-md"
            />
          ) : item.media_type === 'audio' ? (
            <div className="w-full max-w-md p-6 bg-white dark:bg-[#252526] rounded-2xl shadow-xl border border-gray-200 dark:border-[#333333] flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Music size={32} />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  {item.name}
                </div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">
                  {item.extension.toUpperCase()} • {formatHumanSize(item.size)}
                </div>
              </div>
              <audio src={rawUrl} controls autoPlay className="w-full" />
              <button
                onClick={() => {
                  setQuickLookOpen(false);
                  playAudio(item);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                <Music size={15} />
                <span>Open in Persistent Music Player</span>
              </button>
            </div>
          ) : item.media_type === 'pdf' ? (
            <iframe
              src={rawUrl}
              title={item.name}
              className="w-full h-full rounded border-0"
            />
          ) : textContent !== null ? (
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded border border-gray-200 dark:border-[#333333] overflow-hidden text-xs">
              <div className="flex justify-end p-1.5 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#444] transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="flex-1 p-4 font-mono overflow-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200 selection:bg-blue-500/30">
                {textContent}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs">
              Preview not directly renderable for this format.
              <div className="mt-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors"
                >
                  <Download size={14} />
                  <span>Download File ({formatHumanSize(item.size)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
