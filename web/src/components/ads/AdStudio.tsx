import React, { useState } from 'react';
import { 
  PrioritizeHeroAd, 
  PrioritizeHeroAdProps 
} from './PrioritizeHeroAd';
import { 
  Monitor, 
  Smartphone, 
  Square, 
  Columns, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Sliders, 
  ArrowLeft, 
  Sun, 
  Moon,
  ExternalLink
} from 'lucide-react';

interface AdStudioProps {
  onBackToApp?: () => void;
}

export const AdStudio: React.FC<AdStudioProps> = ({ onBackToApp }) => {
  const [format, setFormat] = useState<'hero' | 'social-1200x628' | 'square-1080x1080' | 'banner-300x600'>('hero');
  const [enableFloat, setEnableFloat] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [copied, setCopied] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Editable ad parameters
  const [adProps, setAdProps] = useState<PrioritizeHeroAdProps>({
    headlineTop: "Own, browse, and sync",
    headlineBottom: "every single byte",
    subtitle: "High-performance self-hosted file management with macOS Miller Columns, Windows Explorer view, and live filesystem watcher.",
    ctaPrimary: "Deploy in 60 seconds",
    ctaSecondary: "Try Live Demo",
    stickyNoteText: "Zero cloud telemetry. Pure native Rust speed, inotify live sync, and complete file sovereignty.",
    speedBadgeText: "0.4ms Latency",
  });

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const copyEmbedSnippet = () => {
    const snippet = `<!-- Ola Prioritize Ad Embed -->\n<iframe src="https://ola-files.local/?view=ad&format=${format}" width="${
      format === 'banner-300x600' ? '300' : format === 'square-1080x1080' ? '600' : '100%'
    }" height="${
      format === 'banner-300x600' ? '600' : format === 'square-1080x1080' ? '600' : '700'
    }" style="border:none;border-radius:16px;"></iframe>`;

    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-[#0d0e12] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Studio Top Navigation */}
      <header className="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Return to File Manager"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MotionSites AI "Prioritize" Ad Studio
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Interactive
              </span>
            </h1>
          </div>
        </div>

        {/* Format Selector Pill Buttons */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <button
            onClick={() => setFormat('hero')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              format === 'hero' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Landing Hero</span>
          </button>

          <button
            onClick={() => setFormat('social-1200x628')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              format === 'social-1200x628' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Feed (1200×628)</span>
          </button>

          <button
            onClick={() => setFormat('square-1080x1080')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              format === 'square-1080x1080' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Square (1:1)</span>
          </button>

          <button
            onClick={() => setFormat('banner-300x600')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              format === 'banner-300x600' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Banner (300×600)</span>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Floating Animation */}
          <button
            onClick={() => setEnableFloat(!enableFloat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              enableFloat 
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Float Animation"
          >
            {enableFloat ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{enableFloat ? 'Float On' : 'Float Off'}</span>
          </button>

          {/* Toggle Dark / Light */}
          <button
            onClick={toggleDark}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Edit Ad Copy Panel Toggle */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              isPanelOpen 
                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize Copy</span>
          </button>

          {/* Copy Embed snippet */}
          <button
            onClick={copyEmbedSnippet}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Export Ad'}</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Ad Viewport Container */}
        <main className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
          <div
            className={`transition-all duration-300 overflow-hidden ${
              format === 'hero'
                ? 'w-full h-full rounded-2xl shadow-xl'
                : format === 'social-1200x628'
                ? 'w-[960px] h-[502px] max-w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800'
                : format === 'square-1080x1080'
                ? 'w-[580px] h-[580px] max-w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800'
                : 'w-[300px] h-[600px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800'
            }`}
          >
            <PrioritizeHeroAd
              {...adProps}
              enableFloatingAnimation={enableFloat}
              format={format}
              onCtaClick={() => alert('CTA Clicked: Ready to deploy Ola with Docker or Binary!')}
              onDemoClick={onBackToApp}
            />
          </div>
        </main>

        {/* Slide-out Customization Drawer */}
        {isPanelOpen && (
          <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto shrink-0 space-y-4 shadow-2xl z-40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ad Creative Settings
              </h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Headline Top */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline Top (Bold)
              </label>
              <input
                type="text"
                value={adProps.headlineTop}
                onChange={(e) => setAdProps({ ...adProps, headlineTop: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Headline Bottom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline Bottom (Muted)
              </label>
              <input
                type="text"
                value={adProps.headlineBottom}
                onChange={(e) => setAdProps({ ...adProps, headlineBottom: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Value Proposition Subtitle
              </label>
              <textarea
                rows={3}
                value={adProps.subtitle}
                onChange={(e) => setAdProps({ ...adProps, subtitle: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* CTA Button Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary CTA Button
              </label>
              <input
                type="text"
                value={adProps.ctaPrimary}
                onChange={(e) => setAdProps({ ...adProps, ctaPrimary: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sticky Note Quote */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sticky Note Text
              </label>
              <textarea
                rows={3}
                value={adProps.stickyNoteText}
                onChange={(e) => setAdProps({ ...adProps, stickyNoteText: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Speed Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Speed Badge
              </label>
              <input
                type="text"
                value={adProps.speedBadgeText}
                onChange={(e) => setAdProps({ ...adProps, speedBadgeText: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* MotionSites AI attribution */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Inspired by <a href="https://motionsites.ai/?prompt=prioritize-hero" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">MotionSites.ai Prioritize <ExternalLink className="w-2.5 h-2.5" /></a>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
