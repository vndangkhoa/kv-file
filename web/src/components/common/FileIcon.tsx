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
  Camera,
  Film,
  Music,
  Layers,
  Download,
  Users,
  Shield,
  Share2,
  Globe,
  Video,
  Trash2,
  Settings,
} from 'lucide-react';
import { MediaType } from '../../types';

interface FileIconProps {
  item: {
    name?: string;
    media_type?: MediaType | string;
    is_dir?: boolean;
    is_system?: boolean;
  };
  className?: string;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ item, className = '', size = 20 }) => {
  if (item.is_dir) {
    const rawName = (item.name || '').toLowerCase();
    const cleanName = rawName.replace(/^[@._#]+/, '');

    // 1. NAS System / Internal folders
    if (item.is_system || rawName.startsWith('@') || rawName.startsWith('.')) {
      return <Settings size={size} className={`text-gray-400 opacity-60 ${className}`} />;
    }
    if (rawName === '#recycle' || rawName === '.recycle' || rawName === '$recycle.bin') {
      return <Trash2 size={size} className={`text-red-500/80 ${className}`} />;
    }

    // 2. Standard NAS User Shares & Categories
    switch (cleanName) {
      case 'docker':
      case 'appdata':
      case 'stacks':
      case 'containers':
      case 'portainer':
        return <Layers size={size} className={`text-indigo-500 ${className}`} />;

      case 'photo':
      case 'photos':
      case 'picture':
      case 'pictures':
      case 'images':
      case 'gallery':
      case 'dcim':
        return <Camera size={size} className={`text-emerald-500 ${className}`} />;

      case 'video':
      case 'videos':
      case 'movie':
      case 'movies':
      case 'film':
      case 'films':
      case 'series':
      case 'tv':
      case 'tvshows':
        return <Film size={size} className={`text-purple-500 ${className}`} />;

      case 'music':
      case 'audio':
      case 'song':
      case 'songs':
      case 'podcast':
      case 'podcasts':
        return <Music size={size} className={`text-pink-500 ${className}`} />;

      case 'doc':
      case 'docs':
      case 'document':
      case 'documents':
      case 'paper':
      case 'papers':
        return <FileText size={size} className={`text-blue-500 ${className}`} />;

      case 'download':
      case 'downloads':
        return <Download size={size} className={`text-cyan-500 ${className}`} />;

      case 'home':
      case 'homes':
      case 'user':
      case 'users':
        return <Users size={size} className={`text-amber-500 ${className}`} />;

      case 'backup':
      case 'backups':
      case 'snapshot':
      case 'snapshots':
      case 'archive':
      case 'archives':
        return <Shield size={size} className={`text-orange-500 ${className}`} />;

      case 'share':
      case 'shares':
      case 'shared':
      case 'public':
        return <Share2 size={size} className={`text-teal-500 ${className}`} />;

      case 'web':
      case 'www':
      case 'html':
      case 'site':
      case 'sites':
        return <Globe size={size} className={`text-sky-500 ${className}`} />;

      case 'surveillance':
      case 'cctv':
      case 'cam':
      case 'cameras':
        return <Video size={size} className={`text-rose-500 ${className}`} />;

      default:
        return <Folder size={size} className={`text-amber-500 fill-amber-400/20 ${className}`} />;
    }
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
