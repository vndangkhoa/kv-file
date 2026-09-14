import React, { useState, useRef } from 'react';
import { X, UploadCloud, File, AlertCircle } from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { formatHumanSize } from '../../utils/format';

export const UploadModal: React.FC = () => {
  const { isUploadOpen, setUploadOpen, currentRoot, currentPath, refresh } = useExplorerStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadOpen) return null;

  const handleFilesChosen = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(Array.from(files));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !currentRoot) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      await api.uploadFiles(currentRoot, currentPath, selectedFiles, (p) => setProgress(p));
      await refresh();
      setIsUploading(false);
      setSelectedFiles([]);
      setUploadOpen(false);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Upload failed');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={() => !isUploading && setUploadOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] p-5 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333]">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Upload Files
          </h3>
          <button
            onClick={() => !isUploading && setUploadOpen(false)}
            disabled={isUploading}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-[#1e1e1e]/50"
        >
          <UploadCloud size={36} className="text-blue-500 mb-2" />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Drag & drop files here, or <span className="text-blue-500">browse</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Uploading to: <span className="font-mono">{currentRoot}/{currentPath || ''}</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFilesChosen(e.target.files)}
          />
        </div>

        {/* Selected File List */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 max-h-32 overflow-y-auto space-y-1 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <File size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono ml-2 shrink-0">
                  {formatHumanSize(file.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setUploadOpen(false)}
            disabled={isUploading}
            className="px-3 py-1.5 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors"
          >
            {isUploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
