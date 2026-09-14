import React, { useState, useEffect } from 'react';
import {
  Folder,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Star,
  Trash2,
  FileText,
  Video,
  Music,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { api } from '../../services/api';
import { TreeNode } from '../../types';

interface TreeItemProps {
  node: TreeNode;
  level: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, level }) => {
  const { currentPath, currentRoot, navigateTo } = useExplorerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<TreeNode[] | null>(node.children || null);
  const [isLoading, setIsLoading] = useState(false);

  const isSelected = currentPath === node.path;

  const toggleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && !children) {
      setIsLoading(true);
      try {
        const loaded = await api.getTree(currentRoot, node.path, 1);
        setChildren(loaded.children || []);
      } catch (err) {
        console.error('Failed to load subfolders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = () => {
    navigateTo(node.path);
  };

  return (
    <div>
      <div
        onClick={handleSelect}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`flex items-center gap-1.5 py-1 pr-2 rounded text-xs cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-800 dark:bg-[#0078d4]/30 dark:text-blue-300 font-medium'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2d2e]'
        }`}
      >
        <button
          onClick={toggleOpen}
          className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-blue-500 border-t-transparent animate-spin rounded-full" />
          ) : isOpen ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronRight size={13} />
          )}
        </button>

        <Folder size={14} className="text-amber-500 fill-amber-400/20 shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>

      {isOpen && children && (
        <div>
          {children.map((child) => (
            <TreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarTree: React.FC = () => {
  const { roots, currentRoot, setCurrentRoot, setTrashOpen } = useExplorerStore();
  const [rootTrees, setRootTrees] = useState<Record<string, TreeNode>>({});

  useEffect(() => {
    if (currentRoot) {
      api.getTree(currentRoot, '', 1).then((tree) => {
        setRootTrees((prev) => ({ ...prev, [currentRoot]: tree }));
      }).catch(console.error);
    }
  }, [currentRoot]);

  return (
    <aside className="w-56 bg-gray-50 dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#333333] flex flex-col h-full text-xs select-none shrink-0 overflow-y-auto">
      {/* Quick Access Section */}
      <div className="p-2">
        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          Quick Access
        </div>
        <div className="space-y-0.5 mt-0.5">
          <button
            onClick={() => useExplorerStore.getState().navigateTo('')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300 font-medium text-left"
          >
            <Star size={14} className="text-yellow-500" />
            <span>Home</span>
          </button>
          <button
            onClick={() => useExplorerStore.getState().navigateTo('documents')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300 text-left"
          >
            <FileText size={14} className="text-blue-500" />
            <span>Documents</span>
          </button>
          <button
            onClick={() => useExplorerStore.getState().navigateTo('media')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300 text-left"
          >
            <Video size={14} className="text-purple-500" />
            <span>Media</span>
          </button>
          <button
            onClick={() => useExplorerStore.getState().navigateTo('music')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300 text-left"
          >
            <Music size={14} className="text-pink-500" />
            <span>Music</span>
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 dark:bg-[#333333] mx-2 my-1" />

      {/* Storage Drives / Mount Points */}
      <div className="p-2 flex-1">
        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          Storage Drives
        </div>
        <div className="space-y-1 mt-0.5">
          {roots.map((r) => {
            const isActive = r.name === currentRoot;
            const usedPercent = r.total_bytes > 0 ? Math.round((r.used_bytes / r.total_bytes) * 100) : 0;

            return (
              <div key={r.name} className="space-y-0.5">
                <button
                  onClick={() => setCurrentRoot(r.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 dark:bg-[#0078d4]/20 dark:text-blue-300 font-semibold'
                      : 'hover:bg-gray-200/60 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <HardDrive size={14} className={isActive ? 'text-blue-500' : 'text-gray-500'} />
                  <span className="truncate flex-1">{r.name}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {Math.round(r.free_bytes / 1024 / 1024 / 1024)}G
                  </span>
                </button>

                {/* Capacity Bar */}
                <div className="mx-2 h-1 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                {/* Subfolder Tree */}
                {isActive && rootTrees[r.name] && (
                  <div className="mt-1">
                    {rootTrees[r.name].children?.map((child) => (
                      <TreeItem key={child.path} node={child} level={0} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trash Bin */}
      <div className="p-2 border-t border-gray-200 dark:border-[#333333]">
        <button
          onClick={() => setTrashOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-left"
        >
          <Trash2 size={14} className="text-gray-500 group-hover:text-red-500" />
          <span>Trash Bin</span>
        </button>
      </div>
    </aside>
  );
};
