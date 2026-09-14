import React, { useEffect, useState } from 'react';
import { X, Download, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { formatHumanSize } from '../../utils/format';

export const QuickLookModal: React.FC = () => {
  const { isQuickLookOpen, setQuickLookOpen, activeItem, selectedItems } = useExplorerStore();
  const [textContent, setTextContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const item = activeItem || (selectedItems.length > 0 ? selectedItems[0] : null);

  useEffect(() => {
    if (isQuickLookOpen && item && (item.media_type === 'text' || item.media_type === 'code')) {
      fetch(api.getRawFileUrl(item.root_name, item.path))
        .then((res) => res.text())
        .then((text) => setTextContent(text))
        .catch(() => setTextContent('Failed to load file text preview.'));
    } else {
      setTextContent(null);
    }
  }, [isQuickLookOpen, item]);

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

  const rawUrl = api.getRawFileUrl(item.root_name, item.path);
  const downloadUrl = api.getDownloadUrl(item.root_name, item.path);

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          </div>

          <div className="flex items-center gap-1">
            <a
              href={downloadUrl}
              download
              title="Download File"
              className="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              <Download size={15} />
            </a>

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
            <div className="w-full max-w-md p-6 bg-white dark:bg-[#252526] rounded-xl shadow border border-gray-200 dark:border-[#333333] flex flex-col items-center gap-4">
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate w-full text-center">
                {item.name}
              </div>
              <audio src={rawUrl} controls autoPlay className="w-full" />
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
              Preview not supported for this file type.
              <div className="mt-2">
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                >
                  <Download size={14} />
                  <span>Download File</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
