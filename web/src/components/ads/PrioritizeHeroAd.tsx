import React from 'react';
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
  Activity
} from 'lucide-react';

export interface PrioritizeHeroAdProps {
  headlineTop?: string;
  headlineBottom?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  stickyNoteText?: string;
  speedBadgeText?: string;
  enableFloatingAnimation?: boolean;
  format?: 'hero' | 'social-1200x628' | 'square-1080x1080' | 'banner-300x600';
  onCtaClick?: () => void;
  onDemoClick?: () => void;
}

export const PrioritizeHeroAd: React.FC<PrioritizeHeroAdProps> = ({
  headlineTop = "Own, browse, and sync",
  headlineBottom = "every single byte",
  subtitle = "High-performance self-hosted file management with macOS Miller Columns, Windows Explorer view, and live filesystem watcher.",
  ctaPrimary = "Deploy in 60 seconds",
  ctaSecondary = "Try Live Demo",
  stickyNoteText = "Zero cloud telemetry. Pure native Rust speed, inotify live sync, and complete file sovereignty.",
  speedBadgeText = "0.4ms Latency",
  enableFloatingAnimation = true,
  format = 'hero',
  onCtaClick,
  onDemoClick,
}) => {
  const isBanner = format === 'banner-300x600';
  const isSquare = format === 'square-1080x1080';
  const isSocial = format === 'social-1200x628';

  const anim1 = enableFloatingAnimation ? 'animate-float-1' : '';
  const anim2 = enableFloatingAnimation ? 'animate-float-2' : '';
  const anim3 = enableFloatingAnimation ? 'animate-float-3' : '';
  const anim4 = enableFloatingAnimation ? 'animate-float-4' : '';

  return (
    <div
      className={`relative w-full h-full min-h-[640px] bg-[#fbfbfd] dark:bg-[#121316] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden select-none font-sans ${
        isBanner ? 'max-w-[300px] min-h-[600px] mx-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800' : ''
      }`}
    >
      {/* 1. Subtle Dot-Grid Infinite Canvas */}
      <div className="absolute inset-0 dot-grid-pattern pointer-events-none opacity-60 dark:opacity-30" />

      {/* Radial soft glow vignette in center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.06),transparent_65%)]" />

      {/* Navigation Header (only on full Hero mode) */}
      {format === 'hero' && (
        <header className="absolute top-0 left-0 w-full px-6 sm:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25">
              ⯃
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Ola</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#miller-columns" className="hover:text-blue-600 transition-colors">Miller Columns</a>
            <a href="#rust-architecture" className="hover:text-blue-600 transition-colors">Architecture</a>
            <a href="#benchmarks" className="hover:text-blue-600 transition-colors">Benchmarks</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={onDemoClick}
              className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onCtaClick}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm transition-all"
            >
              GitHub 1.4k ★
            </button>
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* FLOATING ARTIFACT 1: Top-Left (Yellow Sticky Note + Frosted Speed Pill)   */}
      {/* ========================================================================= */}
      {!isBanner && (
        <div 
          className={`absolute ${
            isSquare ? 'top-6 left-4 scale-75' : isSocial ? 'top-8 left-8 scale-90' : 'top-20 xl:top-24 left-6 lg:left-14 xl:left-24'
          } hidden md:block z-10 transition-transform ${anim1}`}
          style={{ '--tw-rotate': '-4deg' } as React.CSSProperties}
        >
          {/* Handwritten-feel Post-it note */}
          <div className="relative w-60 p-5 bg-[#fff9c2] dark:bg-[#fef08a] rounded-sm shadow-xl shadow-amber-950/10 border-t-4 border-amber-200/80">
            {/* Red Thumbtack Pin */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md border-2 border-white ring-1 ring-red-400" />
            
            <p className="font-serif italic text-amber-950 text-xs sm:text-sm leading-relaxed pt-1">
              "{stickyNoteText}"
            </p>
          </div>

          {/* Overlapping Frosted Glass Pill Badge */}
          <div className="absolute -bottom-4 -right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-lg flex items-center gap-2 rotate-[5deg]">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {speedBadgeText}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING ARTIFACT 2: Top-Right (macOS Miller Columns Drilldown Preview)   */}
      {/* ========================================================================= */}
      {!isBanner && (
        <div 
          className={`absolute ${
            isSquare ? 'top-6 right-4 scale-75' : isSocial ? 'top-8 right-8 scale-90' : 'top-20 xl:top-24 right-6 lg:right-12 xl:right-24'
          } hidden md:block z-10 transition-transform ${anim2}`}
          style={{ '--tw-rotate': '3deg' } as React.CSSProperties}
        >
          <div className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
            {/* Tab header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Miller Columns</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-semibold">
                  Finder UI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400">Live</span>
              </div>
            </div>

            {/* Tree hierarchy drilldown */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-100 dark:fill-blue-950" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">4K_Projects</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" />
                  <span className="font-semibold text-blue-900 dark:text-blue-200 truncate max-w-[140px]">
                    promo_cut_prores.mov
                  </span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  2.4 GB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTERPIECE: App Icon Badge + 2-Tier Punchy Typography + Big Blue CTA    */}
      {/* ========================================================================= */}
      <div className={`relative z-10 text-center flex flex-col items-center max-w-2xl mx-auto px-4 ${
        isBanner ? 'py-4' : 'py-8'
      }`}>
        {/* Central Logo Box (Glassmorphic) */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-black/40 flex items-center justify-center mb-6 sm:mb-8 hover:scale-105 transition-transform">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-inner">
            ⯃
          </div>
        </div>

        {/* 2-Part Headline with MotionSites Contrast */}
        <h1 className={`font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white ${
          isBanner ? 'text-2xl' : isSquare ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-5xl lg:text-6xl'
        }`}>
          <span>{headlineTop}</span>
          <span className="block text-slate-400 dark:text-slate-400 font-bold mt-1.5">
            {headlineBottom}
          </span>
        </h1>

        {/* One-sentence punchy value proposition */}
        <p className={`mt-4 sm:mt-6 text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-lg mx-auto ${
          isBanner ? 'text-xs' : 'text-sm sm:text-base'
        }`}>
          {subtitle}
        </p>

        {/* High Conversion Electric-Blue CTA */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{ctaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isBanner && (
            <button
              onClick={onDemoClick}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-sm sm:text-base font-semibold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              {ctaSecondary}
            </button>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Self-Hosted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" /> Rust Backend
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" /> SQLite Embedded
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ARTIFACT 3: Bottom-Left (Storage Pools + Inotify Sync Badge)      */}
      {/* ========================================================================= */}
      {!isBanner && (
        <div 
          className={`absolute ${
            isSquare ? 'bottom-6 left-4 scale-75' : isSocial ? 'bottom-8 left-8 scale-90' : 'bottom-10 lg:bottom-14 left-6 lg:left-12 xl:left-24'
          } hidden md:block z-10 transition-transform ${anim3}`}
          style={{ '--tw-rotate': '-3deg' } as React.CSSProperties}
        >
          <div className="w-76 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
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
                  <span className="text-slate-500 text-[11px]">542 GB free</span>
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
                  <span className="text-slate-500 text-[11px]">8.2 TB free</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[38%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING ARTIFACT 4: Bottom-Right (Action Tiles: Share, Zip, Sandbox)     */}
      {/* ========================================================================= */}
      {!isBanner && (
        <div 
          className={`absolute ${
            isSquare ? 'bottom-6 right-4 scale-75' : isSocial ? 'bottom-8 right-8 scale-90' : 'bottom-10 lg:bottom-14 right-6 lg:right-12 xl:right-28'
          } hidden md:block z-10 transition-transform ${anim4}`}
          style={{ '--tw-rotate': '4deg' } as React.CSSProperties}
        >
          <div className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block pb-3 border-b border-slate-100 dark:border-slate-800">
              Instant Native Utilities
            </span>
            <div className="grid grid-cols-3 gap-2.5 mt-3.5">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform cursor-pointer">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Public Link</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform cursor-pointer">
                <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Zip Deflate</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform cursor-pointer">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Sandboxed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
