import React, { useState } from 'react';
import {
  Play,
  FileText,
  FileSpreadsheet,
  Film,
  Music,
  Code,
  Folder,
} from 'lucide-react';
import { FileItem } from '../../types';
import { FileIcon } from './FileIcon';
import { api } from '../../services/api';
import { useExplorerStore } from '../../stores/useExplorerStore';

interface ThumbnailPreviewProps {
  item: FileItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  item,
  size = 'md',
  className = '',
}) => {
  const { currentRoot } = useExplorerStore();
  const [hasError, setHasError] = useState(false);
  const ext = (item.extension || '').toLowerCase();
  const rootName = item.root_name || currentRoot;
  const rawUrl = api.getRawFileUrl(rootName, item.path);

  // 1. Folders
  if (item.is_dir) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-2 select-none bg-amber-50/30 dark:bg-amber-950/10 ${className}`}>
        <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <Folder
            size={size === 'sm' ? 36 : size === 'lg' ? 64 : 48}
            className="text-amber-500 fill-amber-500/20 stroke-[1.7]"
          />
        </div>
        {item.item_count !== undefined && (
          <span className="text-[10px] text-gray-400 font-mono mt-1">
            {item.item_count} {item.item_count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
    );
  }

  // 2. Images (JPEG, PNG, GIF, WebP, SVG, AVIF, BMP, etc.)
  if (item.media_type === 'image' && !hasError) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center ${className}`}>
        <img
          src={rawUrl}
          alt={item.name}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Format tag badge */}
        {ext && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white/90 uppercase tracking-wider font-mono pointer-events-none">
            {ext}
          </div>
        )}
      </div>
    );
  }

  // 3. Videos (MP4, WebM, MOV, MKV, etc.)
  if (item.media_type === 'video' && !hasError) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-black/90 flex items-center justify-center ${className}`}>
        <video
          src={`${rawUrl}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play icon overlay */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 flex items-center justify-center transition-colors">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 text-white flex items-center justify-center shadow-md backdrop-blur-xs group-hover:scale-110 group-hover:bg-blue-600 transition-all">
            <Play size={size === 'sm' ? 14 : 18} className="translate-x-0.5 fill-current" />
          </div>
        </div>
        {ext && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white/90 uppercase tracking-wider font-mono pointer-events-none">
            {ext}
          </div>
        )}
      </div>
    );
  }

  // 4. PDF Documents
  if (item.media_type === 'pdf') {
    return (
      <div className={`w-full h-full p-2 flex items-center justify-center bg-gray-50/50 dark:bg-[#1f1f1f]/50 ${className}`}>
        <div className="w-4/5 h-full max-h-[140px] bg-white dark:bg-[#2a2a2a] rounded-sm shadow-sm border border-gray-200 dark:border-[#383838] flex flex-col overflow-hidden transition-transform group-hover:scale-105 duration-200">
          {/* Top Red PDF Header */}
          <div className="h-4 bg-red-600 dark:bg-red-700 flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[8px] font-bold text-white tracking-wider">PDF</span>
            <FileText size={9} className="text-white/80" />
          </div>
          {/* Document page simulated structure */}
          <div className="flex-1 p-2 flex flex-col justify-between space-y-1.5">
            <div className="space-y-1">
              <div className="h-1.5 w-3/4 bg-red-500/30 rounded-full" />
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-4/6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Office Documents (Word / Apple Pages)
  if (item.media_type === 'doc' || ['doc', 'docx', 'odt', 'pages'].includes(ext)) {
    return (
      <div className={`w-full h-full p-2 flex items-center justify-center bg-gray-50/50 dark:bg-[#1f1f1f]/50 ${className}`}>
        <div className="w-4/5 h-full max-h-[140px] bg-white dark:bg-[#2a2a2a] rounded-sm shadow-sm border border-gray-200 dark:border-[#383838] flex flex-col overflow-hidden transition-transform group-hover:scale-105 duration-200">
          <div className="h-4 bg-blue-600 dark:bg-blue-700 flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[8px] font-bold text-white tracking-wider uppercase">{ext || 'DOC'}</span>
            <FileText size={9} className="text-white/80" />
          </div>
          <div className="flex-1 p-2 flex flex-col justify-between space-y-1.5">
            <div className="space-y-1">
              <div className="h-1.5 w-4/5 bg-blue-500/30 rounded-full" />
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-1 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Spreadsheets (Excel / CSV / Apple Numbers)
  if (item.media_type === 'spreadsheet' || ['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return (
      <div className={`w-full h-full p-2 flex items-center justify-center bg-gray-50/50 dark:bg-[#1f1f1f]/50 ${className}`}>
        <div className="w-4/5 h-full max-h-[140px] bg-white dark:bg-[#2a2a2a] rounded-sm shadow-sm border border-gray-200 dark:border-[#383838] flex flex-col overflow-hidden transition-transform group-hover:scale-105 duration-200">
          <div className="h-4 bg-emerald-600 dark:bg-emerald-700 flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[8px] font-bold text-white tracking-wider uppercase">{ext || 'XLS'}</span>
            <FileSpreadsheet size={9} className="text-white/80" />
          </div>
          <div className="flex-1 p-1.5 grid grid-cols-3 gap-0.5 bg-gray-50/40 dark:bg-[#222]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-[#444] rounded-[1px] h-3 bg-white dark:bg-[#2a2a2a]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 7. Presentations (PowerPoint / Keynote)
  if (item.media_type === 'presentation' || ['ppt', 'pptx', 'keynote', 'key'].includes(ext)) {
    return (
      <div className={`w-full h-full p-2 flex items-center justify-center bg-gray-50/50 dark:bg-[#1f1f1f]/50 ${className}`}>
        <div className="w-[90%] aspect-[16/10] bg-white dark:bg-[#2a2a2a] rounded shadow-sm border border-gray-200 dark:border-[#383838] flex flex-col overflow-hidden transition-transform group-hover:scale-105 duration-200">
          <div className="h-3.5 bg-amber-600 dark:bg-amber-700 flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[8px] font-bold text-white tracking-wider uppercase">{ext || 'PPT'}</span>
            <Film size={9} className="text-white/80" />
          </div>
          <div className="flex-1 p-2 flex flex-col justify-center items-center space-y-1.5 bg-amber-50/20 dark:bg-amber-950/10">
            <div className="h-2 w-1/2 bg-amber-500/40 rounded-full" />
            <div className="h-1 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // 8. Audio Files (MP3, WAV, FLAC, M4A, etc.)
  if (item.media_type === 'audio') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 flex flex-col items-center justify-center p-3 text-white ${className}`}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Music size={size === 'sm' ? 18 : 24} className="text-white" />
        </div>
        <div className="flex items-end gap-0.5 mt-2 h-3">
          <span className="w-1 h-2 bg-white/70 rounded-full" />
          <span className="w-1 h-3 bg-white/90 rounded-full" />
          <span className="w-1 h-1.5 bg-white/60 rounded-full" />
          <span className="w-1 h-3 bg-white rounded-full" />
          <span className="w-1 h-2 bg-white/80 rounded-full" />
        </div>
        {ext && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white/90 uppercase tracking-wider font-mono pointer-events-none">
            {ext}
          </div>
        )}
      </div>
    );
  }

  // 9. Code & Text Files
  if (
    item.media_type === 'code' ||
    item.media_type === 'text' ||
    ['json', 'rs', 'ts', 'tsx', 'js', 'py', 'md', 'html', 'css', 'toml', 'yaml', 'sh', 'sql', 'txt'].includes(ext)
  ) {
    return (
      <div className={`w-full h-full p-2 flex items-center justify-center bg-gray-50/50 dark:bg-[#1f1f1f]/50 ${className}`}>
        <div className="w-4/5 h-full max-h-[140px] bg-white dark:bg-[#1e1e1e] rounded-sm shadow-sm border border-gray-200 dark:border-[#383838] flex flex-col overflow-hidden transition-transform group-hover:scale-105 duration-200">
          <div className="h-3.5 bg-gray-700 dark:bg-[#333333] flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
              {ext || 'TXT'}
            </span>
            <Code size={9} className="text-gray-400" />
          </div>
          <div className="flex-1 p-2 flex flex-col justify-between font-mono text-[9px] space-y-1 bg-gray-50/50 dark:bg-[#1a1a1a]">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-purple-500 font-bold text-[8px]">{'>'}</span>
                <div className="h-1 w-2/3 bg-blue-500/40 rounded-full" />
              </div>
              <div className="h-1 w-4/5 bg-gray-300 dark:bg-gray-600 rounded-full ml-2" />
              <div className="h-1 w-1/2 bg-amber-500/40 rounded-full ml-2" />
              <div className="h-1 w-3/4 bg-emerald-500/40 rounded-full ml-4" />
            </div>
            <div className="h-1 w-1/3 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gray-50/40 dark:bg-[#222]/40 ${className}`}>
      <FileIcon item={item} size={size === 'sm' ? 28 : size === 'lg' ? 52 : 38} />
    </div>
  );
};
