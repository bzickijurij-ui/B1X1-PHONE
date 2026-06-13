import React, { useState } from 'react';
import { Wifi, WifiOff, Bluetooth, Sun, Moon, Volume2, Shield, Zap, Plane, Sliders, Battery, Bell, BellOff } from 'lucide-react';
import { playTone } from '../utils/audio';

interface ControlCenterProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  systemBrightness: number;
  onBrightnessChange: (bright: number) => void;
}

export default function ControlCenter({
  onClose,
  theme,
  onThemeToggle,
  volume,
  onVolumeChange,
  systemBrightness,
  onBrightnessChange
}: ControlCenterProps) {
  // Quick status toggles
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const handleToggle = (name: string, current: boolean, setter: (val: boolean) => void) => {
    setter(!current);
    playTone(600 + (current ? -100 : 100), 0.05, 'sine');
  };

  const handleSliderVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onVolumeChange(val);
  };

  const handleSliderBrightness = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onBrightnessChange(val);
  };

  return (
    <div 
      className="absolute inset-x-2 top-2 max-h-[85%] rounded-[32px] bg-white/10 border border-white/25 backdrop-blur-3xl z-50 p-5 text-white flex flex-col justify-between font-sans shadow-2xl shadow-indigo-950/20 animate-fade-in"
      id="control_center_panel"
    >
      
      {/* Top Header pull bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <span className="text-[11px] font-bold font-mono tracking-widest text-indigo-200">ПАНЕЛЬ КЕРУВАННЯ B1X1</span>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
        >
          ✕
        </button>
      </div>

      {/* Main grids of connection icons */}
      <div className="grid grid-cols-4 gap-3 py-4 shrink-0">
        
        {/* Wifi */}
        <button
          onClick={() => handleToggle('wifi', wifi, setWifi)}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            wifi 
              ? 'bg-blue-600 border-blue-500 text-white shadow shadow-blue-500/30' 
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          {wifi ? <Wifi size={18} /> : <WifiOff size={18} />}
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{wifi ? 'Мережа' : 'Вимк'}</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => handleToggle('bluetooth', bluetooth, setBluetooth)}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            bluetooth 
              ? 'bg-blue-500 border-blue-400 text-white shadow shadow-blue-500/30' 
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Bluetooth size={18} />
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{bluetooth ? 'Bluetooth' : 'Вимк'}</span>
        </button>

        {/* Dark theme toggle inside quick control */}
        <button
          onClick={() => {
            onThemeToggle();
            playTone(800, 0.05, 'sine');
          }}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-indigo-650 border-indigo-500 bg-white/20 border-white/25 text-white shadow shadow-white/5'
              : 'bg-white text-zinc-950 border-transparent shadow shadow-black/10'
          }`}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{theme === 'dark' ? 'Темна' : 'Світла'}</span>
        </button>

        {/* Flashlight */}
        <button
          onClick={() => handleToggle('flashlight', flashlight, setFlashlight)}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            flashlight 
              ? 'bg-amber-500 border-amber-400 text-black shadow shadow-amber-400/30' 
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Zap size={18} className={flashlight ? 'animate-pulse' : ''} />
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{flashlight ? 'Лампа' : 'Ліхтар'}</span>
        </button>

        {/* Airplane */}
        <button
          onClick={() => handleToggle('airplane', airplane, setAirplane)}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            airplane
              ? 'bg-orange-500 border-orange-400 text-white'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Plane size={18} />
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{airplane ? 'Політ' : 'Авто'}</span>
        </button>

        {/* Quiet DND mode */}
        <button
          onClick={() => handleToggle('dnd', doNotDisturb, setDoNotDisturb)}
          className={`flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border transition-all cursor-pointer ${
            doNotDisturb
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          {doNotDisturb ? <BellOff size={18} /> : <Bell size={18} />}
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">{doNotDisturb ? 'Тиша' : 'Звуки'}</span>
        </button>

        {/* Power Saver */}
        <div
          className="flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border border-white/10 bg-white/5 text-zinc-350"
        >
          <Battery size={18} className="text-emerald-400" />
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">Заряд 98%</span>
        </div>

        {/* Security Shield */}
        <div
          className="flex flex-col items-center justify-center p-3 aspect-square rounded-2xl border border-white/10 bg-white/5 text-zinc-350"
        >
          <Shield size={18} className="text-sky-400" />
          <span className="text-[8px] font-bold mt-1.5 uppercase tracking-wider">Безпека</span>
        </div>

      </div>

      {/* Real time slider adjustments slider panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 mt-2 shadow-inner">
        
        {/* Brightness slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-300 uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1"><Sun size={12} className="text-amber-400" />Яскравість екрану</span>
            <span className="font-mono font-bold">{systemBrightness}%</span>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            step="5"
            value={systemBrightness}
            onChange={handleSliderBrightness}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-450"
          />
        </div>

        {/* Volume slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-300 uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1"><Volume2 size={12} className="text-indigo-300" />Гучність динаміка</span>
            <span className="font-mono font-bold">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={volume}
            onChange={handleSliderVolume}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>

      </div>

      {/* Quick message banner info on simulated environment */}
      <div className="text-[8.5px] text-center text-zinc-400 font-mono mt-4 leading-normal select-none uppercase tracking-widest opacity-65">
        B1X1 SYSTEM PANE • BUILD v1.2 • POLISHED
      </div>

    </div>
  );
}
