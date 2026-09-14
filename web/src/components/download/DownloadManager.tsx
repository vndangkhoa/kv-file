import React from 'react';
import {
  DownloadCloud,
  X,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileDown,
} from 'lucide-react';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { formatHumanSize } from '../../utils/format';

export const DownloadManager: React.FC = () => {
  const { tasks, isOpen, setOpen, cancelDownload, clearCompleted, retryDownload } =
    useDownloadStore();

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter((t) => t.status === 'downloading');
  const activeCount = activeTasks.length;
  const currentActive = activeTasks[0];

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* 1. Collapsed Floating Status Pill (Always visible when minimized or when active) */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 border border-blue-400/30 backdrop-blur-md"
        >
          <div className="relative">
            <DownloadCloud size={16} className={activeCount > 0 ? 'animate-bounce' : ''} />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </div>
          <span>
            {activeCount > 0
              ? `${activeCount} downloading (${currentActive?.progress || 0}%) • ${currentActive?.speedMBps || 0} MB/s`
              : `${tasks.length} download${tasks.length > 1 ? 's' : ''}`}
          </span>
          <ChevronUp size={14} className="opacity-80" />
        </button>
      )}

      {/* 2. Expanded Floating Download Card */}
      {isOpen && (
        <div className="pointer-events-auto w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#333333] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[28rem] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333333]">
            <div className="flex items-center gap-2">
              <DownloadCloud size={16} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Downloads ({tasks.length})
              </span>
              {activeCount > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompleted}
                title="Clear completed"
                className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#333333]"
              >
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          {/* Download Tasks List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2d2d2d] p-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-[#2a2d2e] rounded-lg transition-colors flex flex-col gap-2"
              >
                {/* Filename & Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileDown
                      size={16}
                      className={
                        task.status === 'completed'
                          ? 'text-emerald-500'
                          : task.status === 'error'
                          ? 'text-red-500'
                          : 'text-blue-500 shrink-0'
                      }
                    />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {task.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {task.status === 'downloading' && (
                      <button
                        onClick={() => cancelDownload(task.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Cancel download"
                      >
                        <X size={14} />
                      </button>
                    )}
                    {task.status === 'error' && (
                      <button
                        onClick={() => retryDownload(task.id)}
                        className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Retry download"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <CheckCircle2 size={15} className="text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 dark:bg-[#333333] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-emerald-500'
                        : task.status === 'error'
                        ? 'bg-red-500'
                        : task.status === 'canceled'
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {/* Status Metrics */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <div>
                    {task.status === 'downloading' && (
                      <span>
                        {formatHumanSize(task.loadedBytes)} / {formatHumanSize(task.totalBytes)}
                        {task.speedMBps > 0 && ` • ${task.speedMBps} MB/s`}
                      </span>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans">
                        Downloaded {formatHumanSize(task.loadedBytes)}
                      </span>
                    )}
                    {task.status === 'canceled' && (
                      <span className="text-gray-500 dark:text-gray-400 font-sans">Canceled</span>
                    )}
                    {task.status === 'error' && (
                      <span className="text-red-500 font-sans">{task.error || 'Failed'}</span>
                    )}
                  </div>

                  <div>
                    {task.status === 'downloading' && (
                      <span>
                        {task.etaSeconds > 0 ? `${task.etaSeconds}s left` : `${task.progress}%`}
                      </span>
                    )}
                    {task.status === 'completed' && <span>100%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
