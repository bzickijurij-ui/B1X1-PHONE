import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, ArrowLeft, Layers, Home, Phone, Camera, Image as ImageIcon, Music, Pocket } from 'lucide-react';
import { playTone, playTapSound } from '../utils/audio';

interface PhoneFrameProps {
  children: React.ReactNode;
  theme: 'dark' | 'light';
  onHardwareBack: () => void;
  onHardwareRecents: () => void;
  onHardwareHome: () => void;
  onHardwareVolume: () => void;
  isMusicPlaying: boolean;
  isCameraActive: boolean;
  volume: number;
}

export default function PhoneFrame({
  children,
  theme,
  onHardwareBack,
  onHardwareRecents,
  onHardwareHome,
  onHardwareVolume,
  isMusicPlaying,
  isCameraActive,
  volume
}: PhoneFrameProps) {
  const [frameTime, setFrameTime] = useState(new Date());

  useEffect(() => {
    const frameTimer = setInterval(() => setFrameTime(new Date()), 1000);
    return () => clearInterval(frameTimer);
  }, []);

  const timeStr = frameTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none font-sans bg-transparent">
      
      {/* Outer Phone Shell Case with polished neon chrome edge shadows */}
      <div className="w-[360px] h-[750px] rounded-[52px] bg-zinc-950 p-3.5 border-[6px] border-zinc-800 shadow-[0_30px_100px_rgba(0,0,0,0.95),_0_0_40px_rgba(99,102,241,0.15)] flex flex-col relative transition-transform hover:scale-[1.005] duration-500">
        
        {/* PHYSICAL HARDWARE SIDE BUTTONS ACCENTS */}
        {/* Left Side: Volume rockers */}
        <div className="absolute top-28 -left-[9px] w-2 h-14 bg-zinc-700 rounded-l cursor-pointer hover:bg-indigo-500 select-none active:scale-y-95 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]" onClick={onHardwareVolume} title="Збільшити звук" />
        <div className="absolute top-46 -left-[9px] w-2 h-14 bg-zinc-700 rounded-l cursor-pointer hover:bg-indigo-500 select-none active:scale-y-95 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]" onClick={onHardwareVolume} title="Зменшити звук" />
        
        {/* Right Side: Power dynamic */}
        <div className="absolute top-36 -right-[9px] w-2 h-16 bg-zinc-700 rounded-r cursor-pointer hover:bg-indigo-500 active:scale-y-95 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]" onClick={onHardwareHome} title="Кнопка Живлення / Додому" />

        {/* TOP STATUS BAR SPEAKER WITH SHINY ACCENT */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-4 rounded-full bg-black flex items-center justify-center z-50 border border-white/5">
          {/* Speaker grill mesh */}
          <div className="w-10 h-1 bg-zinc-900 rounded-full" />
        </div>

        {/* ACTIVE SCREEN IN FRAME SCREEN VIEWPORT WITH FINE GLASS EFFECT */}
        <div 
          className={`flex-1 rounded-[38px] ${
            theme === 'dark' ? 'dark bg-zinc-950/90 text-white border-white/5' : 'bg-slate-50 text-zinc-900 border-slate-200/50'
          } border overflow-hidden relative flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]`}
          id="system_internal_screen"
        >
          {/* HIGH-END SIMULATED BAR PILL / DYNAMIC ISLAND OVERLAY CONTROL */}
          <div className="h-10 flex items-center justify-between px-6 bg-zinc-950/45 backdrop-blur-md border-b border-white/5 text-white select-none relative z-50 shrink-0">
            
            {/* Status Time left */}
            <span className="text-[11.5px] font-bold tracking-wide font-mono select-none text-zinc-200">{timeStr}</span>

            {/* DYNAMIC PILL CENTRE (Dynamic Island with professional gloss) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-5 rounded-full bg-zinc-900/90 border border-white/10 px-3.5 flex items-center justify-center gap-1.5 min-w-[85px] hover:min-w-[125px] transition-all duration-300 pointer-events-none shadow-md">
              {isMusicPlaying && (
                <span className="flex items-center gap-1 text-[8px] text-indigo-400 font-bold uppercase animate-pulse">
                  <Music size={8} className="animate-bounce" /> СИНТ
                </span>
              )}
              {isCameraActive && (
                <span className="flex items-center gap-1 text-[8px] text-red-500 font-bold uppercase animate-pulse">
                  <Camera size={8} /> LIVE
                </span>
              )}
              {!isMusicPlaying && !isCameraActive && (
                <span className="text-[8.5px] font-bold text-zinc-300 tracking-widest font-mono">B1X1 OS</span>
              )}
            </div>

            {/* Status Indicators Right */}
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="px-1.5 py-0.5 bg-indigo-500/80 rounded text-[7.5px] font-bold uppercase tracking-widest">5G</span>
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-bold font-mono text-zinc-300">98%</span>
                <Battery size={11} className="text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>

          </div>

          {/* ACTIVE CONTENT VIEW REGION */}
          <div className="flex-1 min-h-0 relative">
            {children}
          </div>

          {/* INNER SCREEN WORKSPACE GESTURE LINE SLIDER WITH SLICK ACCENT */}
          <div 
            onClick={onHardwareHome}
            className="h-4 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer shrink-0 border-t border-white/5"
            title="Жест Свайп вгору"
          >
            <div className="w-24 h-1.5 bg-zinc-400/40 hover:bg-zinc-300 rounded-full transition-all active:scale-y-125 saturate-150 shadow-[0_1px_5px_rgba(255,255,255,0.1)]" />
          </div>

        </div>

        {/* BOTTOM SIMULATED PHYSICAL BEZEL LOWER BAR CAPACITIVE CORE BUTTONS WITH SHINY FINISH */}
        <div 
          className="h-14 flex items-center justify-around bg-zinc-950 border-t border-zinc-900 px-8 select-none pt-2 shrink-0 rounded-b-[40px] shadow-[inset_0_10px_15px_-10px_rgba(0,0,0,0.8)]"
          id="hardware_capacitive_panel"
        >
          {/* BUTTON 1: Back Button */}
          <button
            onClick={() => {
              playTapSound();
              onHardwareBack();
            }}
            className="flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400/90 active:scale-95 transition-all outline-none border border-transparent hover:border-zinc-700/30 p-1.5 rounded-xl cursor-pointer"
            title="Назад"
          >
            <ArrowLeft size={16} />
            <span className="text-[9px] font-mono mt-1 font-bold">Назад</span>
          </button>

          {/* BUTTON 2: Recents Tasks View */}
          <button
            onClick={() => {
              playTapSound();
              onHardwareRecents();
            }}
            className="flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400/90 active:scale-95 transition-all outline-none border border-transparent hover:border-zinc-700/30 p-1.5 rounded-xl cursor-pointer"
            title="Недавні програми"
          >
            <Layers size={16} />
            <span className="text-[9px] font-mono mt-1 font-bold">Недавні</span>
          </button>

          {/* BUTTON 3: Home Button */}
          <button
            onClick={() => {
              playTapSound();
              onHardwareHome();
            }}
            className="flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400/95 active:scale-90 transition-all outline-none border border-transparent hover:border-zinc-700/30 p-1.5 rounded-xl cursor-pointer"
            title="Додому"
          >
            <Home size={16} />
            <span className="text-[9px] font-mono mt-1 font-bold">Додомік</span>
          </button>

          {/* BUTTON 4: Volume Adjustment Panel slider overlay */}
          <button
            onClick={() => {
              playTapSound();
              onHardwareVolume();
            }}
            className="flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400/90 active:scale-95 transition-all outline-none border border-transparent hover:border-zinc-700/30 p-1.5 rounded-xl cursor-pointer"
            title="Налаштування звуку"
          >
            <Volume2 size={16} />
            <span className="text-[9px] font-mono mt-1 font-bold">Звук</span>
          </button>
        </div>

      </div>

      {/* Decorative prompt reminder text to keep app humble literal */}
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest mt-3.5 leading-relaxed uppercase">
        B1X1 OS (Test Sandbox Mobile Simulator v1.0)
      </span>

    </div>
  );
}
