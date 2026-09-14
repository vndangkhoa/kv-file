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
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedCargo, setCopiedCargo] = useState(false);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const copyCommand = (cmd: string, type: 'docker' | 'cargo') => {
    navigator.clipboard.writeText(cmd);
    if (type === 'docker') {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
    } else {
      setCopiedCargo(true);
      setTimeout(() => setCopiedCargo(false), 2000);
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#miller-columns" className="hover:text-blue-600 transition-colors">Miller Columns</a>
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
              href="docs/"
              className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
            >
              Docs
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

            {/* Cargo / Binary Command Card */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" /> Rust Cargo Install
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
          </div>
          <p>
            Built by <a href="https://github.com/vndangkhoa" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">github.com/vndangkhoa</a>
          </p>
          <div className="flex items-center gap-4">
            <a href="#deploy" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Deploy</a>
            <a href="#features" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Features</a>
            <a href="docs/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Documentation</a>
            <a href="https://github.com/vndangkhoa/kv-file" target="_blank" rel="noreferrer" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
