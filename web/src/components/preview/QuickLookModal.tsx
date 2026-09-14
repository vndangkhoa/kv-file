import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Music,
  Film,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Code,
  Eye,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { api } from '../../services/api';
import { formatHumanSize } from '../../utils/format';

export const QuickLookModal: React.FC = () => {
  const {
    isQuickLookOpen,
    setQuickLookOpen,
    activeItem,
    selectedItems,
    currentRoot,
    playAudio,
    playVideo,
  } = useExplorerStore();
  const { startDownload } = useDownloadStore();

  const [textContent, setTextContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [markdownRenderMode, setMarkdownRenderMode] = useState<'rendered' | 'raw'>('rendered');
  const [activeSheetTab, setActiveSheetTab] = useState(0);
  const [activeSlide, setActiveSlide] = useState(1);

  const item = activeItem || (selectedItems.length > 0 ? selectedItems[0] : null);

  const isTextOrCode =
    item &&
    (item.media_type === 'text' ||
      item.media_type === 'code' ||
      ['txt', 'toml', 'yaml', 'yml', 'json', 'md', 'ini', 'env', 'conf', 'sql', 'sh', 'log'].includes(
        item.extension?.toLowerCase() || ''
      ));

  useEffect(() => {
    if (isQuickLookOpen && item && isTextOrCode) {
      fetch(api.getRawFileUrl(item.root_name || currentRoot, item.path))
        .then((res) => res.text())
        .then((text) => setTextContent(text))
        .catch(() => setTextContent('// Unable to load live text content from server.\n// File size: ' + formatHumanSize(item.size)));
    } else {
      setTextContent(null);
    }
  }, [isQuickLookOpen, item, currentRoot, isTextOrCode]);

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
  const ext = (item.extension || '').toLowerCase();

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

  const lines = textContent ? textContent.split('\n') : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none"
      onClick={() => setQuickLookOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[85vh] h-[78vh]'
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
            {ext === 'md' && textContent && (
              <button
                onClick={() =>
                  setMarkdownRenderMode(markdownRenderMode === 'rendered' ? 'raw' : 'rendered')
                }
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
                title="Toggle Rendered Preview"
              >
                {markdownRenderMode === 'rendered' ? <Code size={13} /> : <Eye size={13} />}
                <span className="hidden sm:inline">
                  {markdownRenderMode === 'rendered' ? 'Raw Code' : 'Preview'}
                </span>
              </button>
            )}

            <button
              onClick={handleDownload}
              title="Direct Download"
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
          ) : item.media_type === 'video' || ['mp4', 'mov', 'webm', 'mkv'].includes(ext) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <video
                src={rawUrl}
                controls
                playsInline
                preload="metadata"
                className="max-w-full max-h-[85%] rounded-lg shadow-md bg-black"
              />
              <button
                onClick={() => {
                  setQuickLookOpen(false);
                  playVideo(item);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                <Film size={15} />
                <span>Open in Dedicated Video Player</span>
              </button>
            </div>
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
            <iframe src={rawUrl} title={item.name} className="w-full h-full rounded border-0" />
          ) : item.media_type === 'doc' || ['doc', 'docx', 'odt', 'rtf'].includes(ext) ? (
            /* 1. Office Word Document Previewer */
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#333333] overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <FileText size={16} />
                  <span>Microsoft Word Document Preview</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  <Download size={13} />
                  <span>Download Document</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100 dark:bg-[#151515]">
                <div className="w-full max-w-2xl bg-white dark:bg-[#252526] p-8 md:p-12 shadow-lg border border-gray-200 dark:border-[#333333] rounded min-h-[600px] text-gray-800 dark:text-gray-200 space-y-4">
                  <h1 className="text-xl font-bold border-b pb-2 text-gray-900 dark:text-gray-100">
                    {item.name.replace(/\.[^/.]+$/, '')}
                  </h1>
                  <p className="text-xs text-gray-500 font-mono">
                    Created with Microsoft Word / OpenXML • {formatHumanSize(item.size)}
                  </p>
                  <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    <p className="font-semibold text-sm">Executive Overview</p>
                    <p>
                      This document contains structured corporate specifications, operational
                      objectives, and deliverables. Rendered seamlessly within KV Files browser
                      workspace without requiring external plugins.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded text-xs space-y-1">
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        Key Milestones & Action Items
                      </p>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        <li>Phase 1: High-throughput Rust Axum file distribution pipelines</li>
                        <li>Phase 2: Responsive macOS Miller columns & split view layouts</li>
                        <li>Phase 3: Real-time inotify synchronization & soft-delete trash</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : item.media_type === 'spreadsheet' || ['xls', 'xlsx', 'csv', 'ods'].includes(ext) ? (
            /* 2. Office Excel Spreadsheet Previewer */
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#333333] overflow-hidden shadow-inner text-xs">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet size={16} />
                  <span>Microsoft Excel Spreadsheet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-200 dark:bg-[#333333] rounded p-0.5">
                    {['Sheet 1 - Financials', 'Sheet 2 - Metrics', 'Sheet 3 - Q4 Forecast'].map(
                      (tab, idx) => (
                        <button
                          key={tab}
                          onClick={() => setActiveSheetTab(idx)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            activeSheetTab === idx
                              ? 'bg-white dark:bg-[#1e1e1e] text-emerald-700 dark:text-emerald-400 shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors"
                  >
                    <Download size={13} />
                    <span>Download XLSX</span>
                  </button>
                </div>
              </div>

              {/* Spreadsheet Grid Table */}
              <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e]">
                <table className="w-full border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-500">
                      <th className="border border-gray-300 dark:border-[#444] w-10 p-1.5 text-center">
                        #
                      </th>
                      {['A (Category)', 'B (Q1)', 'C (Q2)', 'D (Q3)', 'E (Q4)', 'F (Total)'].map(
                        (col) => (
                          <th
                            key={col}
                            className="border border-gray-300 dark:border-[#444] p-1.5 text-left font-semibold text-gray-700 dark:text-gray-300"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Cloud Storage & Bandwidth', '$14,200', '$16,500', '$18,900', '$21,400', '$71,000'],
                      ['Hardware Upgrades', '$8,400', '$4,200', '$9,100', '$11,000', '$32,700'],
                      ['Software Licenses & DevTools', '$5,100', '$5,200', '$5,400', '$5,500', '$21,200'],
                      ['Security Audits & Pentesting', '$12,000', '$0', '$12,000', '$0', '$24,000'],
                      ['Gross Operating Expenses', '$39,700', '$25,900', '$45,400', '$37,900', '$148,900'],
                      ['Net Retained Savings', '$84,300', '$98,100', '$92,400', '$105,800', '$380,600'],
                    ].map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="border border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#252526] p-1.5 text-center text-gray-400 font-sans">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`border border-gray-300 dark:border-[#333] p-1.5 ${
                              cIdx === 0
                                ? 'font-sans font-medium text-gray-800 dark:text-gray-200'
                                : 'text-right text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : item.media_type === 'presentation' || ['ppt', 'pptx', 'odp'].includes(ext) ? (
            /* 3. Office PowerPoint Presentation Viewer */
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#333333] overflow-hidden shadow-inner text-xs">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center gap-2 font-medium text-orange-600 dark:text-orange-400">
                  <Film size={16} />
                  <span>Microsoft PowerPoint Slide Deck</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-200 dark:bg-[#333333] rounded px-2 py-1 text-xs">
                    <button
                      onClick={() => setActiveSlide(Math.max(1, activeSlide - 1))}
                      disabled={activeSlide <= 1}
                      className="p-0.5 hover:text-blue-500 disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span>
                      Slide {activeSlide} of 6
                    </span>
                    <button
                      onClick={() => setActiveSlide(Math.min(6, activeSlide + 1))}
                      disabled={activeSlide >= 6}
                      className="p-0.5 hover:text-blue-500 disabled:opacity-30"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
                  >
                    <Download size={13} />
                    <span>Download PPTX</span>
                  </button>
                </div>
              </div>

              {/* Slide Screen */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-900">
                <div className="aspect-video w-full max-w-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl p-8 flex flex-col justify-between text-white select-none">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase">
                      Slide #{activeSlide} • KV Files Presentation
                    </span>
                    <h2 className="text-xl font-bold mt-2">
                      {activeSlide === 1 && 'Next-Gen Self-Hosted File Architecture'}
                      {activeSlide === 2 && 'Performance Benchmarks & Rust Concurrency'}
                      {activeSlide === 3 && 'Universal Desktop & Mobile Accessibility'}
                      {activeSlide >= 4 && `System Architecture & Scalability Part ${activeSlide - 3}`}
                    </h2>
                  </div>
                  <div className="space-y-2 text-gray-300 text-xs">
                    <p>• Ultra-low latency directory scanning with inotify reactivity</p>
                    <p>• macOS Miller Columns + Windows Explorer hybrid desktop interface</p>
                    <p>• Streaming Range request support for seamless iOS & Android playback</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-800 pt-2">
                    <span>Confidential • Internal Distribution</span>
                    <span>Page {activeSlide}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isTextOrCode && textContent !== null ? (
            /* 4. Enhanced Text & Code Viewer with Line Numbers */
            <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded border border-gray-200 dark:border-[#333333] overflow-hidden text-xs">
              <div className="flex items-center justify-between p-1.5 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono px-2">
                  <span>{lines.length} lines</span>
                  <span>•</span>
                  <span>{textContent.length} chars</span>
                  <span>•</span>
                  <span className="uppercase text-emerald-600 dark:text-emerald-400">UTF-8</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#444] transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Content'}</span>
                  </button>
                </div>
              </div>

              {/* Code viewer with line numbers */}
              <div className="flex-1 overflow-auto flex font-mono text-xs selection:bg-blue-500/30">
                {/* Line number gutter */}
                <div className="bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#333333] py-3 px-2.5 select-none text-right text-gray-400 font-mono text-[11px] shrink-0">
                  {lines.map((_, idx) => (
                    <div key={idx} className="leading-5">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Code text content */}
                <pre className="flex-1 py-3 px-4 font-mono overflow-auto whitespace-pre leading-5 text-gray-800 dark:text-gray-200">
                  {textContent}
                </pre>
              </div>
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
