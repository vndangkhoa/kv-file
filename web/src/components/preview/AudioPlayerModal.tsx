import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Repeat,
  FastForward,
  Rewind,
  Music,
} from 'lucide-react';
import { FileItem } from '../../types';
import { api } from '../../services/api';

interface AudioPlayerProps {
  item: FileItem | null;
  root: string;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerProps> = ({ item, root, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!item) return;
    setIsPlaying(true);
    setCurrentTime(0);

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay may be restricted
        setIsPlaying(false);
      });
    }
  }, [item]);

  if (!item) return null;

  const audioSrc = api.getRawFileUrl(root, item.path);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (!duration && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const nextTime = Math.max(0, Math.min(duration || 1000, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[32rem] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#202227]/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-2xl shadow-purple-950/20 p-4 transition-all animate-in fade-in slide-in-from-bottom-6 duration-200">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
        loop={isLooping}
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Music size={20} className={isPlaying ? 'animate-pulse' : ''} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="uppercase font-mono font-medium text-purple-600 dark:text-purple-400">
                {item.extension || 'AUDIO'}
              </span>
              <span>•</span>
              <span>{item.human_size}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Close player"
        >
          <X size={16} />
        </button>
      </div>

      {/* Visualizer bars animation */}
      <div className="flex items-end justify-between h-5 gap-1 mb-2 px-1">
        {[40, 70, 30, 85, 60, 95, 45, 80, 50, 90, 35, 75, 55, 65, 85, 40, 95, 60, 80, 50].map(
          (height, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full bg-purple-500/50 transition-all duration-150 ${
                isPlaying ? 'bg-gradient-to-t from-purple-600 to-pink-400' : 'opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 100)}%` : '20%',
              }}
            />
          )
        )}
      </div>

      {/* Timeline Scrubber */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-400"
        />
        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Playback Controls & Volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isLooping
                ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
            title="Loop track"
          >
            <Repeat size={15} />
          </button>

          {/* Speed badge */}
          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Playback speed"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Center Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-10)}
            className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Rewind 10s"
          >
            <Rewind size={18} />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Fast forward 10s"
          >
            <FastForward size={18} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>
    </div>
  );
};
