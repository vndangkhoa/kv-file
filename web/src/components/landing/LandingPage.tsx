import React, { useState } from 'react';
import { 
  Zap, 
  Folder, 
  HardDrive, 
  ShieldCheck, 
  Share2, 
  FileArchive, 
  Play, 
  ChevronRight, 
  ArrowRight,
  Activity,
  Terminal,
  Copy,
  Check,
  Moon,
  Sun,
  Layers,
  Code2,
  Cpu,
  BookOpen,
  Eye,
  Film,
  Download,
  FileText,
  Sparkles,
  Box,
  Palette,
  Type,
  Workflow,
  Archive,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  Crown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedCargo, setCopiedCargo] = useState(false);
  const [copiedProDocker, setCopiedProDocker] = useState(false);
  const [activeProStudio, setActiveProStudio] = useState<'cad' | 'adobe' | 'font' | 'sysvis' | 'archive' | 'license'>('cad');

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const copyCommand = (cmd: string, type: 'docker' | 'cargo' | 'pro') => {
    navigator.clipboard.writeText(cmd);
    if (type === 'docker') {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
    } else if (type === 'cargo') {
      setCopiedCargo(true);
      setTimeout(() => setCopiedCargo(false), 2000);
    } else {
      setCopiedProDocker(true);
      setTimeout(() => setCopiedProDocker(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfd] dark:bg-[#0d0e12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR                                                     */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#fbfbfd]/80 dark:bg-[#0d0e12]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25">
              ⯃
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight">kv-file</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                v2.0
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#miller-columns" className="hover:text-blue-600 transition-colors">Miller Columns</a>
            <a href="#pro" className="hover:text-amber-500 transition-colors flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>KV Files PRO</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                COMING SOON
              </span>
            </a>
            <a href="#editions" className="hover:text-blue-600 transition-colors">Comparison</a>
            <a href="docs/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </a>
            <a href="#deploy" className="hover:text-blue-600 transition-colors">Deploy</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="#pro"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>PRO (Coming Soon)</span>
            </a>

            <a
              href="#deploy"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: PRIORITIZE-INSPIRED BLUEPRINT CANVAS                     */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-12 sm:pt-20 pb-16 lg:pb-32 px-4 sm:px-8 overflow-hidden">
        {/* Geometric Dot-Grid Pattern */}
        <div className="absolute inset-0 dot-grid-pattern pointer-events-none opacity-50 dark:opacity-25" />

        {/* Soft Radial Ambient Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

        <div className="max-w-7xl mx-auto relative">
          
          {/* --------------------------------------------------------------------- */}
          {/* DESKTOP-ONLY FLOATING ARTIFACTS (Absolute Orbit Layout)               */}
          {/* --------------------------------------------------------------------- */}
          
          {/* Top-Left: Sticky Note + Frosted Glass Speed Badge */}
          <div 
            className="hidden lg:block absolute -top-4 left-2 xl:left-8 z-10 animate-float-1 pointer-events-auto"
            style={{ '--tw-rotate': '-4deg' } as React.CSSProperties}
          >
            <div className="relative w-64 p-5 bg-[#fff9c2] dark:bg-[#fef08a] rounded-sm shadow-xl shadow-amber-950/10 border-t-4 border-amber-200/90">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md border-2 border-white ring-1 ring-red-400" />
              <p className="font-serif italic text-amber-950 text-sm leading-relaxed pt-1">
                "Zero cloud telemetry. Pure native Rust speed, inotify real-time sync, and complete file sovereignty."
              </p>
            </div>
            <div className="absolute -bottom-4 -right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-lg flex items-center gap-2 rotate-[4deg]">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">0.4ms Latency</span>
            </div>
          </div>

          {/* Top-Right: macOS Miller Columns Drilldown Card */}
          <div 
            className="hidden lg:block absolute -top-6 right-2 xl:right-8 z-10 animate-float-2 pointer-events-auto"
            style={{ '--tw-rotate': '3deg' } as React.CSSProperties}
          >
            <div className="w-76 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Miller Columns</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-semibold">
                    Finder UI
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Live</span>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-100 dark:fill-blue-950" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Raw_Footage</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" />
                    <span className="font-semibold text-blue-900 dark:text-blue-200 truncate max-w-[130px]">
                      launch_4k.mp4
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    2.8 GB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Left: Mounted Storage Pools + Inotify Badge */}
          <div 
            className="hidden lg:block absolute bottom-0 left-2 xl:left-8 z-10 animate-float-3 pointer-events-auto"
            style={{ '--tw-rotate': '-3deg' } as React.CSSProperties}
          >
            <div className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Storage Pools</span>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Inotify Live
                </div>
              </div>
              <div className="mt-3.5 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <HardDrive className="w-3.5 h-3.5 text-blue-500" /> /mnt/nvme-pool
                    </span>
                    <span className="text-slate-500 text-[11px]">64% used</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[64%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <HardDrive className="w-3.5 h-3.5 text-amber-500" /> /mnt/synology-nas
                    </span>
                    <span className="text-slate-500 text-[11px]">38% used</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[38%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Right: Instant File Utilities */}
          <div 
            className="hidden lg:block absolute bottom-0 right-2 xl:right-8 z-10 animate-float-4 pointer-events-auto"
            style={{ '--tw-rotate': '4deg' } as React.CSSProperties}
          >
            <div className="w-76 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block pb-3 border-b border-slate-100 dark:border-slate-800">
                Instant Native Utilities
              </span>
              <div className="grid grid-cols-3 gap-2.5 mt-3.5">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Public Link</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                  <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Zip Stream</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Sandboxed</span>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CENTER HERO COPY & ACTIONS (Universal: Mobile & Desktop)              */}
          {/* --------------------------------------------------------------------- */}
          <div className="relative z-20 max-w-2xl mx-auto text-center flex flex-col items-center pt-4 sm:pt-8 pb-10">
            {/* PRO Announcement Pill */}
            <a
              href="#pro"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-6 transition-all shadow-xs hover:-translate-y-0.5 group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Coming Soon: <strong>KV Files PRO</strong> — 3D CAD/BIM, Adobe Studio & Offline Licensing</span>
              <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Glassmorphic Logo Card */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-black/40 flex items-center justify-center mb-6 sm:mb-8 hover:scale-105 transition-transform">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-inner">
                ⯃
              </div>
            </div>

            {/* High-Impact 2-Tone Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Own, browse, and sync
              <span className="block text-slate-400 dark:text-slate-400 font-bold mt-1.5">
                every single byte
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
              High-performance self-hosted file management with macOS Miller Columns, Windows Explorer view, and live inotify watcher.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <a
                href="#deploy"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>Deploy in 60 seconds</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="docs/"
                className="w-full sm:w-auto px-6 py-4 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-sm sm:text-base font-semibold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Documentation</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Private
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" /> Pure Rust Axum
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> SQLite Embedded
              </span>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* MOBILE/TABLET-ONLY BENTO STACK (< 1024px)                             */}
          {/* Replaces absolute orbits with a clean stacked vertical grid           */}
          {/* --------------------------------------------------------------------- */}
          <div className="block lg:hidden mt-8 w-full max-w-lg mx-auto space-y-4">
            
            {/* Mobile Card 1: Sticky Note Quote */}
            <div className="p-5 bg-[#fff9c2] dark:bg-[#fef08a] rounded-2xl shadow-lg border border-amber-200/80">
              <p className="font-serif italic text-amber-950 text-sm leading-relaxed">
                "Zero cloud telemetry. Pure native Rust speed, inotify real-time sync, and complete file sovereignty."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <Zap className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs font-bold text-amber-950">0.4ms Latency</span>
              </div>
            </div>

            {/* Mobile Card 2: Miller Columns Drilldown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Miller Columns</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-semibold">
                    Finder UI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                </div>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-100 dark:fill-blue-950" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Raw_Footage</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" />
                    <span className="font-semibold text-blue-900 dark:text-blue-200">launch_4k.mp4</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">2.8 GB</span>
                </div>
              </div>
            </div>

            {/* Mobile Card 3: Storage Gauges */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Storage Pools</span>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Inotify Active
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">/mnt/nvme-pool</span>
                    <span className="text-slate-500">64%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[64%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">/mnt/synology-nas</span>
                    <span className="text-slate-500">38%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[38%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card 4: Action Tiles */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block pb-3 border-b border-slate-100 dark:border-slate-800">
                Instant Native Utilities
              </span>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <Share2 className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold">Share Link</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <FileArchive className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[10px] font-bold">Zip Stream</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-bold">Sandboxed</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE ARCHITECTURE & FEATURES BENTO SECTION                             */}
      {/* ========================================================================= */}
      <section id="features" className="w-full py-20 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Engineered for Speed
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900 dark:text-white">
              Why Engineers & Creators Switch to kv-file
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Say goodbye to sluggish web portals and heavy Electron clients. kv-file gives you bare-metal speed with modern desktop elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                macOS Miller Columns View
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drill through complex nested folders with effortless horizontal column navigation, instant video/audio QuickLook previews, and seamless keyboard navigation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Inotify Kernel Watcher
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No need to hit refresh. Changes on the disk from CLI tools, rsync, or background jobs broadcast to all connected browser tabs via WebSockets instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Multi-Root Sandbox Security
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mount any number of storage roots (`/mnt/nas`, `/data/media`). Protected by path canonicalization to eliminate directory traversal risks completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5. MILLER COLUMNS DEDICATED SHOWCASE SECTION                            */}
      {/* ========================================================================= */}
      <section id="miller-columns" className="w-full py-24 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-[#f8f9fc] dark:bg-[#111217]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              macOS Finder Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3 text-slate-900 dark:text-white">
              Miller Columns View
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Drill down through endless directories without losing parent context. Experience the precision of macOS Finder with live horizontal cascading columns, full keyboard navigation, and instant file inspection.
            </p>
          </div>

          {/* Interactive Visual Miller Columns Display Mockup */}
          <div className="w-full rounded-3xl bg-white dark:bg-[#18191e] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Window title bar */}
            <div className="h-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1.5">
                <span>/Storage_Pools/Projects/4K_Assets/launch_reel_prores.mov</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                Miller Columns Mode (Ctrl+1)
              </div>
            </div>

            {/* 3 Columns + 1 Inspector Viewport */}
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-xs min-h-[380px]">
              
              {/* Column 1: Root Directories */}
              <div className="p-3 space-y-1 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Root Pools</div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> Documents</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 fill-white text-white" /> Projects</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> Media_Library</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> Backups_Archive</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Column 2: Projects subfolders */}
              <div className="p-3 space-y-1 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projects (4)</div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> rust-engine</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 fill-white text-white" /> 4K_Assets</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> web-frontend</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500 fill-blue-100" /> benchmarks</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Column 3: 4K_Assets files */}
              <div className="p-3 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">4K_Assets (3)</div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2 truncate"><FileText className="w-4 h-4 text-slate-400" /> storyboards.pdf</span>
                  <span className="text-[10px] text-slate-400">12 MB</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                  <span className="flex items-center gap-2 truncate"><Film className="w-4 h-4 text-white" /> launch_reel_prores.mov</span>
                  <span className="text-[10px] text-white/90">2.8 GB</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2 truncate"><FileArchive className="w-4 h-4 text-amber-500" /> audio_stems.zip</span>
                  <span className="text-[10px] text-slate-400">450 MB</span>
                </div>
              </div>

              {/* Column 4: Quick Look Inspector Panel */}
              <div className="p-5 flex flex-col items-center text-center justify-between bg-white dark:bg-[#18191e]">
                <div className="w-full">
                  <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center text-white relative shadow-inner mb-4 overflow-hidden group">
                    <Film className="w-8 h-8 text-blue-400" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">Preview (Space)</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    launch_reel_prores.mov
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">QuickTime Movie • 2.8 GB</p>

                  <div className="mt-4 text-left text-[11px] space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between"><span className="text-slate-400">Resolution:</span> <span className="font-mono font-medium">3840 × 2160</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Duration:</span> <span className="font-mono font-medium">01:42</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Codec:</span> <span className="font-mono font-medium">Apple ProRes 422</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Modified:</span> <span className="font-mono font-medium">Today, 14:02</span></div>
                  </div>
                </div>

                <div className="w-full pt-4 flex gap-2">
                  <a
                    href="/"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>QuickLook</span>
                  </a>
                  <a 
                    href="/"
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Feature Highlights beneath columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Zero Breadcrumb Blindness
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Never wonder where you are in a deeply nested file tree. Parent folders stay fixed side-by-side as you navigate downwards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Lightning Fast Keyboard Nav
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Use your keyboard arrow keys (←, →, ↑, ↓) to glide between hierarchy levels without touching your mouse.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Integrated QuickLook
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hit Spacebar to instantly inspect 4K videos, listen to lossless audio, zoom full-res photos, or read source code.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.8. KV FILES PRO STUDIO SHOWCASE SECTION (#pro)                          */}
      {/* ========================================================================= */}
      <section id="pro" className="w-full py-24 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-amber-500/5 via-[#f8f9fd] to-[#fbfbfd] dark:from-amber-950/20 dark:via-[#0f1015] dark:to-[#0d0e12] relative overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_70%)]" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Commercial & Enterprise Edition</span>
              <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] shadow-xs">
                COMING SOON
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Studio-Grade Power. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400">Zero Cloud Telemetry.</span>
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Currently in active development. Built for engineering firms, architecture studios, creative teams, and privacy-first enterprises. Inspect multi-gigabyte 3D CAD models, Adobe PSD layer hierarchies, typography specimens, and architecture flows with zero data leaving your server.
            </p>
          </div>

          {/* 6 PRO Superpowers Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            {/* 1. 3D CAD & BIM Viewport */}
            <div 
              onClick={() => setActiveProStudio('cad')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'cad' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Box className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  WebGL 3D
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span>Universal 3D CAD & BIM Studio</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Native WebGL viewport for AutoCAD (<code className="text-amber-600 dark:text-amber-400 font-mono">.dwg</code>, <code className="text-amber-600 dark:text-amber-400 font-mono">.dxf</code>), IFC BIM, STEP/IGES solid geometries, STL & OBJ with 3D sectioning, exploded assembly, and ViewCube.
              </p>
            </div>

            {/* 2. Adobe Creative Suite Studio */}
            <div 
              onClick={() => setActiveProStudio('adobe')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'adobe' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300">
                  Layer Tree
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Adobe Creative Suite Studio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deep layer-tree inspection and canvas rendering for Photoshop (<code className="text-orange-600 dark:text-orange-400 font-mono">.psd</code>, <code className="text-orange-600 dark:text-orange-400 font-mono">.psb</code>), Illustrator (<code className="text-orange-600 dark:text-orange-400 font-mono">.ai</code>, <code className="text-orange-600 dark:text-orange-400 font-mono">.eps</code>), InDesign, XD, and CorelDRAW (<code className="text-orange-600 dark:text-orange-400 font-mono">.cdr</code>).
              </p>
            </div>

            {/* 3. Typography Specimen Studio */}
            <div 
              onClick={() => setActiveProStudio('font')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'font' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Type className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                  Unicode Glyphs
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Typography Specimen Studio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive dynamic waterfall size scales (12px to 96px), OpenType feature flags, full Unicode glyph table inspection, and character code lookups for <code className="text-blue-600 dark:text-blue-400 font-mono">.ttf</code>, <code className="text-blue-600 dark:text-blue-400 font-mono">.otf</code>, <code className="text-blue-600 dark:text-blue-400 font-mono">.woff</code>, <code className="text-blue-600 dark:text-blue-400 font-mono">.woff2</code>.
              </p>
            </div>

            {/* 4. SysVis Flow Animator */}
            <div 
              onClick={() => setActiveProStudio('sysvis')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'sysvis' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Workflow className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                  SVG Animator
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                SysVis Architecture Flow Animator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive system DAGs and architecture workflows with real-time animated SVG packet pulses, node latency inspection, and integrated Mermaid diagram visualization.
              </p>
            </div>

            {/* 5. Deep Archive Explorer */}
            <div 
              onClick={() => setActiveProStudio('archive')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'archive' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Archive className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  Virtual Browsing
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Archive Deep Virtual Explorer
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Virtual tree navigation inside <code className="text-emerald-600 dark:text-emerald-400 font-mono">.zip</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">.tar.gz</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">.7z</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">.rar</code> with instant file preview and single-file extraction without disk unpacking.
              </p>
            </div>

            {/* 6. Ed25519 Offline Licensing */}
            <div 
              onClick={() => setActiveProStudio('license')}
              className={`p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border ${
                activeProStudio === 'license' 
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300">
                  Air-Gapped
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Asymmetric Ed25519 Offline Licensing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cryptographically signed lifetime license keys (<code className="text-red-600 dark:text-red-400 font-mono">KVPRO-...</code>) verified offline with embedded public keys. Zero phone-home DRM, zero analytics, completely air-gapped safe.
              </p>
            </div>

          </div>

          {/* Interactive Live PRO Studio Viewport Showcase */}
          <div className="w-full rounded-3xl bg-[#0e1017] border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden">
            
            {/* Viewport Header */}
            <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-1.5 hidden sm:block" />
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-[11px] text-amber-300">KV Files PRO Studio Host</span>
                </div>
              </div>

              {/* Quick Tab Switcher */}
              <div className="flex items-center gap-1 text-[11px] font-medium bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveProStudio('cad')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'cad' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>3D CAD</span>
                </button>
                <button
                  onClick={() => setActiveProStudio('adobe')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'adobe' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  <span>Adobe Suite</span>
                </button>
                <button
                  onClick={() => setActiveProStudio('font')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'font' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  <span>Typography</span>
                </button>
                <button
                  onClick={() => setActiveProStudio('sysvis')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'sysvis' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Workflow className="w-3 h-3" />
                  <span>SysVis</span>
                </button>
                <button
                  onClick={() => setActiveProStudio('archive')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'archive' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={() => setActiveProStudio('license')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeProStudio === 'license' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Ed25519</span>
                </button>
              </div>
            </div>

            {/* Viewport Content Area */}
            <div className="p-4 sm:p-6 min-h-[420px] bg-slate-950 text-slate-200">
              
              {/* CAD STUDIO VIEW */}
              {activeProStudio === 'cad' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                  {/* Left Parts Tree */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Assembly Structure</span>
                        <span className="text-amber-400 font-mono">14 Parts</span>
                      </div>
                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-slate-200 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                          <span className="flex items-center gap-1.5 text-amber-300">
                            <Box className="w-3.5 h-3.5 text-amber-400" /> Turbine_Housing.step
                          </span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-slate-300 px-1.5 py-1">
                          <span className="flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-blue-400" /> Titanium_Rotor_Shaft
                          </span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-slate-300 px-1.5 py-1">
                          <span className="flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-indigo-400" /> Bearing_Assembly_SKF
                          </span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-slate-300 px-1.5 py-1">
                          <span className="flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-orange-400" /> HighPressure_Nozzle_Ring
                          </span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-400">
                      <div className="flex justify-between"><span>Format:</span> <span className="font-mono text-slate-200">ISO 10303 STEP AP242</span></div>
                      <div className="flex justify-between"><span>Polygons:</span> <span className="font-mono text-slate-200">324,800 Triangles</span></div>
                      <div className="flex justify-between"><span>Bounding:</span> <span className="font-mono text-slate-200">320 × 240 × 195 mm</span></div>
                    </div>
                  </div>

                  {/* Center WebGL 3D Canvas Mockup */}
                  <div className="lg:col-span-3 bg-gradient-to-b from-slate-900/60 to-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                    {/* Viewport Toolbar */}
                    <div className="flex items-center justify-between text-xs z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">ViewCube: ISO Top-Front-Right</span>
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">Z-Section Clipping: ON</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">Exploded View (35%)</span>
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">Wireframe: Off</span>
                      </div>
                    </div>

                    {/* Visual 3D Mesh Wireframe Representation */}
                    <div className="my-8 flex items-center justify-center relative">
                      <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
                        {/* 3D Wireframe Rings & Geometry Simulation */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: '30s' }} />
                        <div className="absolute inset-4 rounded-full border border-blue-500/30 -rotate-45" />
                        <div className="absolute inset-12 rounded-full border-2 border-amber-400/40 rotate-12" />
                        <div className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-blue-600/30 backdrop-blur-md border border-amber-400/50 rotate-45 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                          <Box className="w-16 h-16 text-amber-400 stroke-[1.2]" />
                        </div>
                        {/* 3D Coordinate Axis Compass */}
                        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400 space-y-0.5 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                          <div className="text-red-400">X: +142.50 mm</div>
                          <div className="text-emerald-400">Y: +088.20 mm</div>
                          <div className="text-blue-400">Z: -012.80 mm</div>
                        </div>
                      </div>
                    </div>

                    {/* Viewport Footer Status */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 z-10">
                      <span>Interactive Three.js WebGL Engine • Hardware Accelerated (60 FPS)</span>
                      <span className="text-amber-400 font-medium">AutoCAD DWG / DXF / STEP / IFC / STL / OBJ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ADOBE SUITE VIEW */}
              {activeProStudio === 'adobe' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                  {/* Left Layers Tree */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>PSD Layer Hierarchy</span>
                      <span className="text-orange-400 font-mono">16-bit RGB</span>
                    </div>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between text-orange-300 font-bold">
                          <span>📁 Lighting FX (Screen)</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="pl-4 text-[10px] text-slate-400 flex justify-between">
                          <span>Aura Flare [85% Opacity]</span>
                          <Eye className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between text-slate-200">
                          <span>📁 Branding & Vector Typography</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="pl-4 text-[10px] text-slate-400 flex justify-between">
                          <span>"KV FILES PRO" (Bold)</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between text-slate-200">
                          <span>📁 3D Key Visual & Shading</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="pl-4 text-[10px] text-slate-400 flex justify-between">
                          <span>Ambient Shadow (Multiply)</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Canvas Viewport */}
                  <div className="lg:col-span-3 bg-gradient-to-b from-slate-900/60 to-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                      <span className="font-mono text-slate-300">hero_brand_visual_v2.psd • 3840 × 2160 (4K UHD) • 184 MB</span>
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold text-[10px]">Layer Visibility Active</span>
                    </div>
                    <div className="py-12 flex items-center justify-center">
                      <div className="w-72 h-44 rounded-xl border-2 border-dashed border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-indigo-500/10 flex flex-col items-center justify-center shadow-xl">
                        <Palette className="w-10 h-10 text-orange-400 mb-2" />
                        <span className="text-sm font-bold text-white">Full In-Browser Vector & Raster Parser</span>
                        <span className="text-[11px] text-slate-400 mt-1">PSD / PSB / AI / EPS / INDD / XD / CDR</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                      <span>Zero Adobe Cloud dependency • Complete layer blending engine</span>
                      <span className="text-orange-400 font-mono">100% Client-Side Render</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TYPOGRAPHY VIEW */}
              {activeProStudio === 'font' && (
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-blue-300 font-bold">GeistMono-Variable.woff2 [OpenType Features, Kerning & Waterfall]</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">Unicode 15.0 Ready</span>
                  </div>
                  <div className="space-y-3 py-2 text-slate-100">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">48px • Title Display</span>
                      <div className="text-3xl font-extrabold tracking-tight text-white">KV Files PRO Studio Engine</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">28px • Subheader</span>
                      <div className="text-xl font-semibold text-slate-200">The quick brown fox jumps over the lazy dog 0123456789</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">16px • Body Specimen & Ligatures</span>
                      <div className="text-sm text-slate-400 font-mono">function verifyLicense(key: string): boolean &#123; return key.startsWith("KVPRO-"); &#125;</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Supports TTF, OTF, WOFF, WOFF2 with dynamic glyph maps and font metrics table</span>
                    <span className="text-blue-400 font-semibold">Instant In-Browser Specimen</span>
                  </div>
                </div>
              )}

              {/* SYSVIS VIEW */}
              {activeProStudio === 'sysvis' && (
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-indigo-300 font-bold">architecture_pipeline.json [SysVis Flow Graph]</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] animate-pulse">Live Pulses Active</span>
                  </div>
                  <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center w-40">
                      <div className="text-slate-400 text-[10px]">Edge Layer</div>
                      <div className="font-bold text-white mt-1">Web / Mobile PWA</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse hidden sm:block" />
                    <div className="p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-center w-44">
                      <div className="text-indigo-300 text-[10px]">Axum + Tokio Engine</div>
                      <div className="font-bold text-white mt-1">kv-files (Port 8866)</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse hidden sm:block" />
                    <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center w-40">
                      <div className="text-slate-400 text-[10px]">Kernel Watcher</div>
                      <div className="font-bold text-white mt-1">Linux inotify</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Interactive JSON workflows, DAG layouts, and Mermaid architecture diagrams</span>
                    <span className="text-indigo-400 font-semibold">Animated SVG Flow</span>
                  </div>
                </div>
              )}

              {/* ARCHIVE VIEW */}
              {activeProStudio === 'archive' && (
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-emerald-300 font-bold">production_assets_2026.tar.gz [1.42 GB Archive]</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">Virtual Navigation</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="p-2 rounded bg-slate-800/80 flex items-center justify-between text-slate-200">
                      <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-amber-400" /> /3d_models/assembly_chassis.step</span>
                      <span className="text-slate-400 text-[11px]">48.2 MB • [QuickLook]</span>
                    </div>
                    <div className="p-2 rounded bg-slate-800/40 flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-blue-400" /> /textures/albedo_4k_hdr.png</span>
                      <span className="text-slate-400 text-[11px]">18.4 MB • [QuickLook]</span>
                    </div>
                    <div className="p-2 rounded bg-slate-800/40 flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-emerald-400" /> /specs/schematics_blueprint.dwg</span>
                      <span className="text-slate-400 text-[11px]">12.8 MB • [QuickLook]</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Inspect & extract individual files without uncompressing multi-gigabyte files to disk</span>
                    <span className="text-emerald-400 font-semibold">Zero Disk Overhead</span>
                  </div>
                </div>
              )}

              {/* LICENSE VIEW */}
              {activeProStudio === 'license' && (
                <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-red-300 font-bold">Asymmetric Ed25519 Cryptographic Verification</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offline Valid
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Master License Signature</div>
                      <div className="font-mono text-[11px] text-amber-300 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        KVPRO-7F9A-4E2B-91C8-5834-A19D-D402-98EF
                      </div>
                      <div className="text-[11px] text-slate-400">Customer: <strong className="text-white">Commercial Enterprise Organization</strong></div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Privacy & Air-Gap Compliance</div>
                      <div className="space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline Digital Signature Verification</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Zero Network Phone-Home / Zero Telemetry DRM</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Permanent Lifetime License / Unlimited Bandwidth</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Issue and verify customer licenses instantly using CLI (<code className="text-red-400 font-mono">./launch.sh keygen</code>)</span>
                    <span className="text-amber-400 font-semibold">True Digital Sovereignty</span>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* PRO Call to Action Banner */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                In Active Development • Coming Soon
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>Get Early Access & Updates</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                KV Files PRO is launching soon. Star the repository or follow the development progress to be notified on general availability.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="#editions"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all text-center cursor-pointer"
              >
                Compare Editions
              </a>
              <a
                href="https://github.com/vndangkhoa/kv-file-pro"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
              >
                <span>View PRO Progress</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.9. EDITION COMPARISON MATRIX SECTION (#editions)                        */}
      {/* ========================================================================= */}
      <section id="editions" className="w-full py-24 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              Transparent & Uncompromised
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
              Choose the Edition Built for Your Needs
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              The <strong>Community Edition</strong> is 100% free and open source forever. The <strong>PRO Edition</strong> equips engineering studios, architecture firms, and design teams with professional viewports and offline Ed25519 licensing.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="w-full overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
                  <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Feature / Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white w-1/3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">⯃</div>
                      <span>Community Edition</span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">Free & Open Source Forever</div>
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 w-1/3 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">KV Files PRO</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">COMING SOON</span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">Commercial & Studio Workspace (In Development)</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">macOS Miller Columns & Explorer Views</td>
                  <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</td>
                  <td className="p-4 sm:p-5 font-semibold text-emerald-600 dark:text-emerald-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Inotify Real-time Kernel Sync & WebSockets</td>
                  <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</td>
                  <td className="p-4 sm:p-5 font-semibold text-emerald-600 dark:text-emerald-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Dual-Pane Commander Mode (`Alt+S`)</td>
                  <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</td>
                  <td className="p-4 sm:p-5 font-semibold text-emerald-600 dark:text-emerald-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">W3C Media Session Lockscreen Player</td>
                  <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</td>
                  <td className="p-4 sm:p-5 font-semibold text-emerald-600 dark:text-emerald-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Universal 3D CAD & BIM Studio (DWG, DXF, IFC, STEP, STL, OBJ)</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Not Included</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Full 3D WebGL Studio</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Adobe Creative Suite Studio (PSD, PSB, AI, EPS, INDD, XD)</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Basic raster only</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Deep Layer Tree & Blending</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">CorelDRAW Studio (.cdr Decoder)</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Not Included</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Native Vector Visualizer</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Typography Specimen Studio (OTF, TTF, WOFF, WOFF2)</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Generic file icon</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Waterfall & Unicode Matrix</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">SysVis Architecture Flow Animator</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Text editor only</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Animated SVG Pulses & DAGs</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Archive Deep Virtual Explorer (Zip, Tar, 7z)</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Download zip only</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> In-Browser Virtual Browsing</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Licensing & DRM Model</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Free (GPL/MIT)</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-amber-500" /> 100% Offline Ed25519 Lifetime Key</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Production CLI & Management Daemon</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Systemd / Docker</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-amber-500" /> Included (`./launch.sh`)</span></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Commercial Rights & Priority Support</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Community GitHub Issues</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 border-l border-amber-500/20"><span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-amber-500" /> Commercial Rights & Direct Support</span></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ONE-COMMAND DEPLOY TERMINAL SECTION                                     */}
      {/* ========================================================================= */}
      <section id="deploy" className="w-full py-20 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Self-Host Anywhere
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900 dark:text-white">
            Up and Running in 60 Seconds
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Available as a single static Linux/macOS binary or a lightweight multi-arch Docker container.
          </p>

          <div className="mt-10 space-y-4 text-left">
            {/* Docker Command Card */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" /> Docker Run
                </span>
                <button
                  onClick={() => copyCommand('docker run -d -p 8866:8866 -v /data:/data ghcr.io/vndangkhoa/kv-file:latest', 'docker')}
                  className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedDocker ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDocker ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-xs sm:text-sm font-mono text-emerald-400 break-all select-all">
                docker run -d -p 8866:8866 -v /data:/data ghcr.io/vndangkhoa/kv-file:latest
              </code>
            </div>

            {/* KV Files PRO Docker Command Card */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 text-slate-200 rounded-2xl p-5 border border-amber-500/40 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> KV Files PRO — Docker Image
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Coming Soon
                  </span>
                </span>
                <button
                  onClick={() => copyCommand('docker run -d -p 8866:8866 -v ./data:/data -v /path/to/storage:/storage vndangkhoa/kv-file-pro:latest', 'pro')}
                  className="text-xs flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedProDocker ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedProDocker ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-xs sm:text-sm font-mono text-amber-300 break-all select-all">
                docker run -d -p 8866:8866 -v ./data:/data -v /path/to/storage:/storage vndangkhoa/kv-file-pro:latest
              </code>
            </div>

            {/* Cargo / Binary Command Card */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" /> Rust Cargo Install (Community)
                </span>
                <button
                  onClick={() => copyCommand('cargo install kv-file && kv-file --port 8866', 'cargo')}
                  className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCargo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCargo ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-xs sm:text-sm font-mono text-amber-400 break-all select-all">
                cargo install kv-file && kv-file --port 8866
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full py-12 px-4 sm:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0a0b0e] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              ⯃
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">kv-file v2.0.0</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-500/30">
              PRO Coming Soon
            </span>
          </div>
          <p>
            Built with ❤️ by <a href="https://github.com/vndangkhoa" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Khoa Vo (@vndangkhoa)</a>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#deploy" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Deploy</a>
            <a href="#features" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Features</a>
            <a href="#pro" className="hover:text-amber-500 font-semibold transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> PRO (Coming Soon)
            </a>
            <a href="#editions" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Comparison</a>
            <a href="docs/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Documentation</a>
            <a href="https://github.com/vndangkhoa/kv-file" target="_blank" rel="noreferrer" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">GitHub (Community)</a>
            <a href="https://github.com/vndangkhoa/kv-file-pro" target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline transition-colors">KV Files PRO</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
