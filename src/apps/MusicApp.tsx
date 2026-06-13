import React, { useState, useEffect } from 'react';
import { Music, Play, Square, Activity, Disc, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { playTone, startSimulatedBeat, stopSimulatedBeat } from '../utils/audio';

interface MusicAppProps {
  theme?: 'light' | 'dark';
}

export default function MusicApp({ theme = 'dark' }: MusicAppProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [synthPreset, setSynthPreset] = useState<'sine' | 'triangle' | 'sawtooth' | 'square'>('triangle');
  const [tempo, setTempo] = useState<number>(120);
  const [trackName, setTrackName] = useState<string>('B1X1 Ambient Horizon');

  useEffect(() => {
    return () => {
      stopSimulatedBeat();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSimulatedBeat();
      setIsPlaying(false);
      setActiveStep(-1);
    } else {
      setIsPlaying(true);
      playTone(440, 0.15, 'sine');
      setTimeout(() => playTone(660, 0.15, 'sine'), 100);
      
      startSimulatedBeat((step) => {
        setActiveStep(step);
        // Add random cool ambient backing chord every 4 steps
        if (step === 0) {
          playTone(261.63 / 2, 0.8, synthPreset); // low C root
        } else if (step === 4) {
          playTone(392.00 / 2, 0.8, synthPreset); // low G root
        }
      });
    }
  };

  const handlePresetChange = (preset: 'sine' | 'triangle' | 'sawtooth' | 'square') => {
    setSynthPreset(preset);
    playTone(300, 0.2, preset);
    if (preset === 'sine') setTrackName('Cozy Silicon Sine');
    else if (preset === 'triangle') setTrackName('B1X1 Ambient Horizon');
    else if (preset === 'sawtooth') setTrackName('Neon Cyber Rush');
    else if (preset === 'square') setTrackName('8-Bit Retro Retro');
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'light' ? 'bg-slate-50 text-slate-805 border border-slate-200/50' : 'bg-zinc-950 text-white'} rounded-3xl overflow-hidden relative select-none font-sans`} id="music_app_root">
      
      {/* Header */}
      <div className={`h-14 flex items-center justify-between px-6 border-b shrink-0 ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
        <span className="text-sm font-semibold flex items-center gap-2">
          <Music size={18} className="text-indigo-500" />
          <span>B1X1 СИНТ-ПЛЕЄР</span>
        </span>
        <Activity size={16} className={`text-indigo-500 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
      </div>

      {/* Main player disk visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Animated Background Glow */}
        <div className={`absolute w-44 h-44 rounded-full blur-[44px] transition-all duration-1000 ${
          isPlaying 
            ? 'bg-indigo-500/20 scale-125' 
            : 'bg-transparent scale-90'
        }`} />

        {/* Vinyl disk decoration */}
        <div className={`relative w-40 h-40 rounded-full bg-zinc-900 border-[6px] border-zinc-800 flex items-center justify-center shadow-2xl transition-transform duration-[4000ms] ease-linear ${
          isPlaying ? 'rotate-[360deg] animate-[spin_5s_linear_infinite]' : ''
        }`}>
          {/* Groove rings */}
          <div className="absolute inset-2 rounded-full border border-zinc-800/60" />
          <div className="absolute inset-5 rounded-full border border-zinc-800/40" />
          <div className="absolute inset-8 rounded-full border border-zinc-800/20" />
          
          {/* Main album center label */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center relative shadow-inner">
            <Disc className="text-white/80 animate-spin" size={20} />
            <div className="absolute w-3 h-3 bg-zinc-950 rounded-full border-2 border-zinc-800" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center mt-6 z-10 max-w-xs">
          <p className={`text-xs font-bold truncate tracking-wider uppercase ${theme === 'light' ? 'text-slate-850' : 'text-zinc-100'}`}>{trackName}</p>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1 block">Генератор звуку WebAudio</span>
        </div>

        {/* 8-Step visualization strip */}
        <div className="flex justify-center gap-1.5 mt-6 w-full px-6">
          {Array.from({ length: 8 }).map((_, stepIdx) => (
            <div
              key={stepIdx}
              className={`h-6 flex-1 rounded-md transition-all ${
                activeStep === stepIdx 
                  ? 'bg-indigo-500 scale-y-110 shadow-lg shadow-indigo-500/35' 
                  : isPlaying 
                    ? (theme === 'light' ? 'bg-slate-250 bg-slate-300' : 'bg-zinc-850') 
                    : (theme === 'light' ? 'bg-slate-200 opacity-40' : 'bg-zinc-900 opacity-40')
              }`}
            />
          ))}
        </div>
      </div>

      {/* Control Panel Footer */}
      <div className={`border-t p-5 shrink-0 space-y-4 transition-colors ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
        
        {/* Play toggle */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleTogglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-white cursor-pointer ${
              isPlaying 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
            }`}
          >
            {isPlaying ? <Square size={20} /> : <Play size={20} className="ml-1" />}
          </button>
        </div>

        {/* Oscillator preset settings */}
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Оберіть Хвилю Синтезатора</span>
          <div className="grid grid-cols-4 gap-2">
            {(['triangle', 'sine', 'sawtooth', 'square'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => handlePresetChange(pr)}
                className={`py-1.5 rounded-lg text-[9px] font-mono hover:text-indigo-500 dark:hover:text-white transition-all capitalize border ${
                  synthPreset === pr
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-650 dark:text-indigo-300 font-bold'
                    : (theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-zinc-800 bg-zinc-900/60 text-zinc-500')
                }`}
              >
                {pr === 'sawtooth' ? 'Пила' : pr === 'sine' ? 'Синус' : pr === 'square' ? 'Квадрат' : 'Трикутний'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
