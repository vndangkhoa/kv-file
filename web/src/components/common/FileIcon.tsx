import React from 'react';
import {
  Folder,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { MediaType } from '../../types';

interface FileIconProps {
  item: {
    media_type?: MediaType | string;
    is_dir?: boolean;
  };
  className?: string;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ item, className = '', size = 20 }) => {
  if (item.is_dir) {
    return <Folder size={size} className={`text-amber-500 fill-amber-400/20 ${className}`} />;
  }

  switch (item.media_type) {
    case 'video':
      return <FileVideo size={size} className={`text-purple-500 ${className}`} />;
    case 'image':
      return <FileImage size={size} className={`text-emerald-500 ${className}`} />;
    case 'audio':
      return <FileAudio size={size} className={`text-pink-500 ${className}`} />;
    case 'pdf':
      return <FileText size={size} className={`text-red-500 ${className}`} />;
    case 'code':
      return <FileCode size={size} className={`text-blue-500 ${className}`} />;
    case 'archive':
      return <FileArchive size={size} className={`text-yellow-600 ${className}`} />;
    case 'doc':
      return <FileText size={size} className={`text-blue-600 ${className}`} />;
    case 'spreadsheet':
      return <FileSpreadsheet size={size} className={`text-emerald-600 ${className}`} />;
    case 'presentation':
      return <FileText size={size} className={`text-orange-500 ${className}`} />;
    case 'text':
      return <FileText size={size} className={`text-gray-500 ${className}`} />;
    default:
      return <File size={size} className={`text-gray-400 ${className}`} />;
  }
};
