export interface SystemFolderInfo {
  friendlyName: string;
  badge: string;
  badgeColor: string;
  description: string;
  iconType?: 'docker' | 'config' | 'media' | 'storage' | 'system' | 'web' | 'user' | 'log';
  isInternal?: boolean;
}

export type ServerPlatform = 'synology' | 'unraid' | 'truenas' | 'vps' | 'homeserver' | 'generic';

export const LINUX_SYSTEM_FOLDERS: Record<string, SystemFolderInfo> = {
  // --- Linux VPS & Generic Server ---
  opt: {
    friendlyName: 'Applications & Docker',
    badge: 'Docker Apps',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Docker Compose stacks, container data, and self-hosted apps',
    iconType: 'docker',
  },
  stacks: {
    friendlyName: 'Docker Stacks',
    badge: 'Docker Stacks',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Docker container service definitions and compose files',
    iconType: 'docker',
  },
  dockhand: {
    friendlyName: 'Dockhand Manager',
    badge: 'Dockhand',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Dockhand container management data and stacks',
    iconType: 'docker',
  },
  etc: {
    friendlyName: 'Configurations',
    badge: 'Configs',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'System configurations, web server rules, and network settings',
    iconType: 'config',
  },
  var: {
    friendlyName: 'Logs & Dynamic Data',
    badge: 'Logs & Web',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    description: 'Web hosting directories, system logs, caches, and databases',
    iconType: 'log',
  },
  home: {
    friendlyName: 'User Accounts',
    badge: 'User Accounts',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Home directories for non-root user accounts',
    iconType: 'user',
  },
  root: {
    friendlyName: 'Administrator Home',
    badge: 'Root Admin',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Administrator personal home directory, scripts, and keys',
    iconType: 'user',
  },
  data: {
    friendlyName: 'Persistent Storage',
    badge: 'Persistent Data',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    description: 'Application databases, media libraries, and mounted volumes',
    iconType: 'storage',
  },
  srv: {
    friendlyName: 'Web & Service Data',
    badge: 'Services',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    description: 'Public sites, FTP roots, and server services',
    iconType: 'web',
  },
  tmp: {
    friendlyName: 'Temporary Files',
    badge: 'Temp Cache',
    badgeColor: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    description: 'Temporary files automatically cleaned on server reboot',
    iconType: 'system',
  },
  mnt: {
    friendlyName: 'Mounted Storage',
    badge: 'Disks & Mounts',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    description: 'External hard drives, NAS shares, and secondary storage mounts',
    iconType: 'storage',
  },
  media: {
    friendlyName: 'Removable Media',
    badge: 'Media Mounts',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: 'Mounted USB drives and removable storage media',
    iconType: 'media',
  },

  // --- 🔵 Synology DSM Structure ---
  volume1: {
    friendlyName: 'Synology Volume 1',
    badge: 'Synology Vol 1',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'Primary Synology Btrfs storage volume pool',
    iconType: 'storage',
  },
  volume2: {
    friendlyName: 'Synology Volume 2',
    badge: 'Synology Vol 2',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'Secondary Synology storage volume pool',
    iconType: 'storage',
  },
  volumeusb1: {
    friendlyName: 'Synology USB Storage',
    badge: 'Synology USB',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    description: 'External USB storage drive connected to Synology NAS',
    iconType: 'storage',
  },
  '@appstore': {
    friendlyName: 'Synology Package Center',
    badge: 'DSM Packages',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    description: 'Installed Synology DSM native packages (.spk) and apps',
    iconType: 'docker',
  },
  '@appdata': {
    friendlyName: 'DSM Application Data',
    badge: 'DSM AppData',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    description: 'Synology package runtime state and configurations',
    iconType: 'config',
  },
  docker: {
    friendlyName: 'Docker Container Projects',
    badge: 'Docker Apps',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'Self-hosted Docker Compose configurations and app data',
    iconType: 'docker',
  },
  video: {
    friendlyName: 'Movies & Series Library',
    badge: 'Video Library',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    description: 'Video collection for Plex, Jellyfin, or Synology Video Station',
    iconType: 'media',
  },
  music: {
    friendlyName: 'Music & Audio Library',
    badge: 'Music Library',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-700',
    description: 'Music files for Navidrome, Audio Station, and Subsonic',
    iconType: 'media',
  },
  photo: {
    friendlyName: 'Photo Gallery & Albums',
    badge: 'Photo Gallery',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    description: 'Photos and memories for Immich or Synology Photos',
    iconType: 'media',
  },
  photos: {
    friendlyName: 'Photo Gallery & Albums',
    badge: 'Photo Gallery',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    description: 'Photos and memories for Immich or Synology Photos',
    iconType: 'media',
  },
  homes: {
    friendlyName: 'User Home Folders',
    badge: 'NAS User Homes',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    description: 'Private home directories for NAS user accounts',
    iconType: 'user',
  },
  surveillance: {
    friendlyName: 'Security Camera Recordings',
    badge: 'CCTV Camera',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-700',
    description: 'NVR surveillance footage and IP camera archives',
    iconType: 'media',
  },
  web: {
    friendlyName: 'Web Hosting Root',
    badge: 'Web Sites',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    description: 'Public websites, PHP scripts, and HTML assets',
    iconType: 'web',
  },

  // --- 🟠 Unraid Structure ---
  user: {
    friendlyName: 'Unraid User Shares',
    badge: 'Unraid Shares',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    description: 'Consolidated Unraid user shares pooled across array drives',
    iconType: 'storage',
  },
  appdata: {
    friendlyName: 'Docker AppData',
    badge: 'Docker AppData',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    description: 'Unraid container persistent state, databases, and configs',
    iconType: 'docker',
  },
  domains: {
    friendlyName: 'Virtual Machines (VMs)',
    badge: 'VM Disks',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'KVM virtual machine disk images and virtual appliances',
    iconType: 'system',
  },
  isos: {
    friendlyName: 'Operating System ISOs',
    badge: 'OS ISO Images',
    badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-700',
    description: 'Linux, Windows, and installer ISO image downloads',
    iconType: 'storage',
  },
  system: {
    friendlyName: 'Unraid System State',
    badge: 'Unraid System',
    badgeColor: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
    description: 'Docker image files and libvirt VM definitions',
    iconType: 'system',
  },

  // --- 🔷 TrueNAS Structure ---
  'ix-applications': {
    friendlyName: 'TrueNAS Scale Apps',
    badge: 'TrueNAS Apps',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
    description: 'TrueNAS Scale Kubernetes & Docker application datasets',
    iconType: 'docker',
  },
  tank: {
    friendlyName: 'ZFS Storage Pool',
    badge: 'ZFS Pool',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'Primary ZFS RAID storage pool and datasets',
    iconType: 'storage',
  },
  pool: {
    friendlyName: 'ZFS Storage Pool',
    badge: 'ZFS Pool',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'ZFS RAID storage pool and datasets',
    iconType: 'storage',
  },

  // --- 🏠 CasaOS / ZimaOS / Umbrel Home Server ---
  DATA: {
    friendlyName: 'CasaOS Data Drive',
    badge: 'CasaOS Data',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    description: 'CasaOS and ZimaOS consolidated storage mount',
    iconType: 'storage',
  },
  AppData: {
    friendlyName: 'Home Server Apps',
    badge: 'Home AppData',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    description: 'Persistent app directories and database volumes',
    iconType: 'docker',
  },
  Downloads: {
    friendlyName: 'Downloads & Influx',
    badge: 'Downloads',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-700',
    description: 'Torrent, HTTP, and browser downloads directory',
    iconType: 'storage',
  },
  Documents: {
    friendlyName: 'Personal Documents',
    badge: 'Documents',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'PDFs, spreadsheets, text files, and notes',
    iconType: 'storage',
  },
  documents: {
    friendlyName: 'Personal Documents',
    badge: 'Documents',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'PDFs, spreadsheets, text files, and notes',
    iconType: 'storage',
  },
  code: {
    friendlyName: 'Software Code & Repos',
    badge: 'Developer Code',
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-700',
    description: 'Git repositories, scripts, and source projects',
    iconType: 'config',
  },

  // --- 🛠️ Linux Kernel / Low-Level Internals ---
  bin: {
    friendlyName: 'System Binaries',
    badge: 'OS Binaries',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Essential Linux command-line executables and utilities',
    isInternal: true,
  },
  'bin.usr-is-merged': {
    friendlyName: 'Merged Binaries',
    badge: 'OS Internal',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'System link for merged /usr architecture',
    isInternal: true,
  },
  sbin: {
    friendlyName: 'Admin System Binaries',
    badge: 'Admin Binaries',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'System administration binaries (fdisk, reboot, etc.)',
    isInternal: true,
  },
  'sbin.usr-is-merged': {
    friendlyName: 'Merged Admin Binaries',
    badge: 'OS Internal',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'System link for merged /usr architecture',
    isInternal: true,
  },
  lib: {
    friendlyName: 'Core Libraries',
    badge: 'OS Libraries',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Essential shared libraries needed by system binaries',
    isInternal: true,
  },
  'lib.usr-is-merged': {
    friendlyName: 'Merged Libraries',
    badge: 'OS Internal',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'System link for merged /usr architecture',
    isInternal: true,
  },
  lib64: {
    friendlyName: '64-bit Libraries',
    badge: '64-bit Libs',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: '64-bit architecture shared libraries',
    isInternal: true,
  },
  boot: {
    friendlyName: 'Linux Bootloader',
    badge: 'OS Kernel',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Linux kernel images, initrd, and GRUB bootloader files',
    isInternal: true,
  },
  cdrom: {
    friendlyName: 'CD-ROM Mount',
    badge: 'CD-ROM',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Legacy CD/DVD-ROM mount point',
    isInternal: true,
  },
  dev: {
    friendlyName: 'Device Nodes',
    badge: 'Hardware Nodes',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Hardware device files (null, random, sda, disks)',
    isInternal: true,
  },
  proc: {
    friendlyName: 'Process Runtime',
    badge: 'Kernel Proc',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Virtual filesystem presenting real-time kernel & process states',
    isInternal: true,
  },
  sys: {
    friendlyName: 'Kernel Sysfs',
    badge: 'Kernel Sys',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Kernel hardware and driver subsystem exports',
    isInternal: true,
  },
  run: {
    friendlyName: 'Runtime State',
    badge: 'Runtime',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Runtime information for system daemons and PID locks',
    isInternal: true,
  },
  snap: {
    friendlyName: 'Snap Packages',
    badge: 'Snap Apps',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Canonical Snap package mount directory',
    isInternal: true,
  },
  usr: {
    friendlyName: 'User System Software',
    badge: 'Installed Apps',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    description: 'Secondary hierarchy for read-only user utilities and share data',
    isInternal: true,
  },
  'lost+found': {
    friendlyName: 'Filesystem Recovery',
    badge: 'fsck Recovery',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Corrupted file fragments recovered by fsck',
    isInternal: true,
  },
  swapfile: {
    friendlyName: 'Virtual Memory Swap',
    badge: 'Swap Memory',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    description: 'Virtual memory swap file',
    isInternal: true,
  },
};

export function getSystemFolderHint(name: string, isAtRoot: boolean = true): SystemFolderInfo | null {
  const rawKey = name.toLowerCase();

  // 1. Synology DSM internal system folders (@appstore, @eaDir, @database, etc.)
  if (name.startsWith('@')) {
    return {
      friendlyName: `DSM Package/System (${name})`,
      badge: 'DSM System',
      badgeColor: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700',
      description: 'Synology DSM system package, cache, database, or runtime data',
      iconType: 'system',
      isInternal: true,
    };
  }

  // 2. Hidden dotfiles (.git, .trash, .system, etc.)
  if (name.startsWith('.')) {
    return {
      friendlyName: `Hidden System (${name})`,
      badge: 'Hidden',
      badgeColor: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700',
      description: 'Unix hidden configuration or runtime data',
      iconType: 'system',
      isInternal: true,
    };
  }

  // 3. Recycle Bins
  if (rawKey === '#recycle' || rawKey === '.recycle' || rawKey === '$recycle.bin') {
    return {
      friendlyName: 'Network Recycle Bin',
      badge: 'Recycle Bin',
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800',
      description: 'NAS network share recycle bin',
      iconType: 'storage',
      isInternal: true,
    };
  }

  // 4. Standard NAS Shares (Photos, Videos, Docker, Music, Documents, Downloads, Homes)
  const cleanKey = rawKey.replace(/^[@._#]+/, '');
  switch (cleanKey) {
    case 'photo':
    case 'photos':
    case 'pictures':
    case 'images':
    case 'gallery':
      return {
        friendlyName: 'Photo Library',
        badge: 'Photos',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        description: 'Photo collection and album storage',
        iconType: 'media',
      };
    case 'video':
    case 'videos':
    case 'movie':
    case 'movies':
    case 'film':
    case 'films':
    case 'series':
    case 'tv':
    case 'tvshows':
      return {
        friendlyName: 'Video & Movie Library',
        badge: 'Videos',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700',
        description: 'Movies, TV shows, and video media collection',
        iconType: 'media',
      };
    case 'music':
    case 'audio':
    case 'songs':
      return {
        friendlyName: 'Music & Audio Library',
        badge: 'Music',
        badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-700',
        description: 'Music tracks, albums, and audio recordings',
        iconType: 'media',
      };
    case 'docker':
    case 'appdata':
    case 'stacks':
    case 'containers':
      return {
        friendlyName: 'Docker Containers & Apps',
        badge: 'Docker',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
        description: 'Docker Compose stacks and container persistent data',
        iconType: 'docker',
      };
    case 'documents':
    case 'docs':
    case 'document':
      return {
        friendlyName: 'Documents & Records',
        badge: 'Documents',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
        description: 'Documents, office files, spreadsheets, and archives',
        iconType: 'storage',
      };
    case 'download':
    case 'downloads':
      return {
        friendlyName: 'Downloads Folder',
        badge: 'Downloads',
        badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
        description: 'Downloaded packages, media, and torrent client output',
        iconType: 'storage',
      };
    case 'home':
    case 'homes':
    case 'user':
    case 'users':
      return {
        friendlyName: 'User Home Directories',
        badge: 'Homes',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        description: 'Personal storage folders for NAS user accounts',
        iconType: 'user',
      };
    case 'backup':
    case 'backups':
    case 'snapshots':
      return {
        friendlyName: 'System & Data Backups',
        badge: 'Backups',
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700',
        description: 'Server snapshots, Hyper Backup targets, and archives',
        iconType: 'storage',
      };
    case 'web':
    case 'www':
      return {
        friendlyName: 'Web Hosting Root',
        badge: 'Web',
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700',
        description: 'Web server websites and public hosting directories',
        iconType: 'web',
      };
  }

  // 5. If at root, check Linux / platform system dictionaries
  if (isAtRoot) {
    if (LINUX_SYSTEM_FOLDERS[name]) return LINUX_SYSTEM_FOLDERS[name];
    if (LINUX_SYSTEM_FOLDERS[rawKey]) return LINUX_SYSTEM_FOLDERS[rawKey];
    if (rawKey.startsWith('volume')) {
      return {
        friendlyName: `Synology Storage (${name})`,
        badge: `Synology ${name}`,
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700',
        description: 'Synology Btrfs/ext4 storage volume pool',
        iconType: 'storage',
      };
    }
  }

  return null;
}
