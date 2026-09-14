import React from 'react';
import { FolderTree, ExternalLink, Code2, Database, ShieldCheck, Cpu } from 'lucide-react';
import { getDataSourceMode } from '../../../services/api';

export const AboutTab: React.FC = () => {
  const currentMode = getDataSourceMode();

  return (
    <div className="space-y-6 max-w-2xl text-xs">
      {/* Brand Hero */}
      <div className="flex items-center gap-3.5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
          <FolderTree size={28} />
        </div>
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>KV Files</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
              v2.0.0
            </span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[11px]">
            High-performance hybrid file explorer powered by Rust and modern web standards.
          </p>
        </div>
      </div>

      {/* System Architecture Details */}
      <div className="space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-300 block">
          Architecture & Runtime
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] flex items-center gap-3">
            <Cpu size={20} className="text-amber-500" />
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                Backend Engine
              </span>
              <span className="text-[11px] text-gray-400">
                Rust 1.80+ • Axum 0.7 • Tokio Async
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] flex items-center gap-3">
            <Database size={20} className="text-emerald-500" />
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                Database Store
              </span>
              <span className="text-[11px] text-gray-400">
                SQLite 3 (WAL Mode & ACID Safe)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] flex items-center gap-3">
            <Code2 size={20} className="text-blue-500" />
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                Frontend Client
              </span>
              <span className="text-[11px] text-gray-400">
                React 18 • TypeScript • Tailwind CSS
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] flex items-center gap-3">
            <ShieldCheck size={20} className="text-indigo-500" />
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                Data Mode
              </span>
              <span className="text-[11px] text-gray-400 capitalize">
                {currentMode === 'mock' ? 'In-Memory Mock / Demo' : 'Live Server Backend'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div className="pt-2 border-t border-gray-200 dark:border-[#333333] flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span>© 2026 KV Files Project. Open source under MIT license.</span>
        <div className="flex items-center gap-4">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            <span>Documentation</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};
