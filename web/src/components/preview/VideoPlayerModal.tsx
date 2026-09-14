import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Film,
  PictureInPicture,
} from 'lucide-react';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { api } from '../../services/api';
import { formatHumanSize } from '../../utils/format';

export const VideoPlayerModal: React.FC = () => {
  const { isVideoPlayerOpen, closeVideoPlayer, videoTrack, currentRoot } = useExplorerStore();
  const { startDownload } = useDownloadStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!isVideoPlayerOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [isVideoPlayerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVideoPlayerOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeVideoPlayer();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        seek(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        seek(10);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoPlayerOpen, closeVideoPlayer, isPlaying]);

  if (!isVideoPlayerOpen || !videoTrack) return null;

  const rawUrl = api.getRawFileUrl(videoTrack.root_name || currentRoot, videoTrack.path);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('Picture-in-picture error:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setIsControlsVisible(false);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6 animate-in fade-in select-none"
      onClick={closeVideoPlayer}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl bg-black rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col group"
      >
        {/* Top Floating Bar */}
        <div
          className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Film size={16} className="text-blue-400 shrink-0" />
            <span className="font-medium text-xs md:text-sm text-white truncate">
              {videoTrack.name}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({formatHumanSize(videoTrack.size)})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => startDownload(videoTrack.root_name || currentRoot, videoTrack)}
              title="Direct Download"
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Download size={16} />
            </button>
            <button
              onClick={closeVideoPlayer}
              title="Close (Esc)"
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Canvas */}
        <div className="relative flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
          <video
            ref={videoRef}
            src={rawUrl}
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            className="w-full h-full max-h-[75vh] object-contain cursor-pointer"
          />

          {/* Quick Double Tap Touch Zones for Mobile */}
          <div
            onDoubleClick={() => seek(-10)}
            className="absolute left-0 inset-y-0 w-1/4 z-10 opacity-0 active:opacity-20 bg-white/20 transition-opacity"
            title="Double-tap to rewind 10s"
          />
          <div
            onDoubleClick={() => seek(10)}
            className="absolute right-0 inset-y-0 w-1/4 z-10 opacity-0 active:opacity-20 bg-white/20 transition-opacity"
            title="Double-tap to forward 10s"
          />
        </div>

        {/* Bottom Floating Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 px-4 py-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Scrubber Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-300 w-12 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />
            <span className="text-[11px] font-mono text-gray-400 w-12 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Strip */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/30"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
              </button>

              {/* 10s Skip buttons */}
              <button
                onClick={() => seek(-10)}
                title="Rewind 10s (Left Arrow / J)"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => seek(10)}
                title="Forward 10s (Right Arrow / L)"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCw size={16} />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Right Tools: Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-2 text-xs">
              {/* Playback Speed selector */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                title="Picture in Picture"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <PictureInPicture size={16} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen (F)"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
