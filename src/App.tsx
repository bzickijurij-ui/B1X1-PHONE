import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SystemSettings, Widget, CapturedPhoto, TaskItem, UserNote } from './types';
import PhoneFrame from './components/PhoneFrame';
import HomeScreen from './components/HomeScreen';
import ControlCenter from './components/ControlCenter';
import RecentsScreen from './components/RecentsScreen';

// Core Application modules
import CameraApp from './apps/CameraApp';
import GalleryApp, { SYSTEM_WALLPAPERS } from './apps/GalleryApp';
import SettingsApp from './apps/SettingsApp';
import NotesApp from './apps/NotesApp';
import MusicApp from './apps/MusicApp';
import PhoneApp from './apps/PhoneApp';

import { playTone, playTapSound, playLaunchSound, playCloseSound, playLockChime, playUnlockChime, setTransitionSoundsEnabled } from './utils/audio';
import { Volume2, Sliders, ChevronDown, Palette, Check } from 'lucide-react';

// Helper to convert HSL to Hex color
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to HSL (Hue only)
function hexToHue(hex: string): number {
  if (!hex || hex[0] !== '#') return 45; // Default to warm gold/amber
  const cleanHex = hex.length === 4 
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` 
    : hex;
  let r = parseInt(cleanHex.slice(1, 3), 16) / 255;
  let g = parseInt(cleanHex.slice(3, 5), 16) / 255;
  let b = parseInt(cleanHex.slice(5, 7), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 45;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    let d = max - min;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return Math.round(h * 360);
}

// Default initial settings
const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  iconTintColor: '#fbbf24', // Amber tint Gold
  iconTintStyle: 'original',
  animationSpeed: 1.0,
  animationStyle: 'oneui7',
  transitionSoundsEnabled: true
};

// Initial setup of widgets on desktop
const INITIAL_WIDGETS: Widget[] = [
  { id: 'w_clock', type: 'clock', title: 'Годинник', x: 0, y: 0, w: 4, h: 2 },
  { id: 'w_weather', type: 'weather', title: 'Синоптик', x: 0, y: 2, w: 4, h: 1 }
];

export default function App() {
  // System settings state
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('b1x1_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Active workspace Wallpaper
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() => {
    return localStorage.getItem('b1x1_wallpaper') || SYSTEM_WALLPAPERS[0].url;
  });

  // Core records lists (Gallery, Tasks, Sticky Notes)
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => {
    const saved = localStorage.getItem('b1x1_photos');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('b1x1_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't1', text: 'Спробувати колір іконок як на iOS 18', completed: false },
      { id: 't2', text: 'Пограти мелодію в Синтезаторі', completed: true },
      { id: 't3', text: 'Увімкнути темну тему B1X1 OS', completed: false }
    ];
  });

  const [notes, setNotes] = useState<UserNote[]>(() => {
    const saved = localStorage.getItem('b1x1_notes');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: 'Пасхалка', content: 'B1X1 OS розроблена ексклюзивно на AI Studio. Спробуйте One UI 7 анімації!', timestamp: '12:05' }
    ];
  });

  // Desktop Widgets
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('b1x1_widgets');
    return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
  });

  // Running Active / Background Multitasking Stacks
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [runningApps, setRunningApps] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState<boolean>(false);
  const [showControlCenter, setShowControlCenter] = useState<boolean>(false);

  // Volume Adjustment floating box state
  const [showVolumePopup, setShowVolumePopup] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(50); // 50%
  const [screenBrightness, setScreenBrightness] = useState<number>(85); // 85%

  // Welcome and custom configuration Onboarding Setup Wizard state
  const [showSetupWizard, setShowSetupWizard] = useState<boolean>(() => {
    return !localStorage.getItem('b1x1_setup_done');
  });

  // Launch Animations state variables
  const [launchOrigin, setLaunchOrigin] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animType, setAnimType] = useState<'open' | 'close' | null>(null);

  // Persists values
  useEffect(() => {
    localStorage.setItem('b1x1_settings', JSON.stringify(settings));
    setTransitionSoundsEnabled(settings.transitionSoundsEnabled !== false);
    // Apply styling class
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('b1x1_wallpaper', wallpaperUrl);
  }, [wallpaperUrl]);

  useEffect(() => {
    localStorage.setItem('b1x1_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('b1x1_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('b1x1_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('b1x1_widgets', JSON.stringify(widgets));
  }, [widgets]);

  // Volume float close helper
  useEffect(() => {
    if (showVolumePopup) {
      const timer = setTimeout(() => setShowVolumePopup(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [showVolumePopup]);

  // Launch application with customized coordinates source origins
  const handleLaunchApp = (appId: string, rect?: DOMRect) => {
    if (isAnimating) return;
    
    playLaunchSound();

    let targetRect = rect;
    if (!targetRect) {
      const desktopButton = document.getElementById(`app_icon_button_${appId}`) || document.getElementById(`dock_button_${appId}`);
      if (desktopButton) {
        targetRect = desktopButton.getBoundingClientRect();
      }
    }

    if (targetRect) {
      // Find the screen relative container offset coordinates
      const targetScreen = document.getElementById('system_internal_screen');
      if (targetScreen) {
        const screenRect = targetScreen.getBoundingClientRect();
        setLaunchOrigin({
          x: targetRect.left - screenRect.left + (targetRect.width / 2),
          y: targetRect.top - screenRect.top + (targetRect.height / 2),
          w: targetRect.width,
          h: targetRect.height
        });
      }
    } else {
      setLaunchOrigin({ x: 180, y: 350, w: 48, h: 48 }); // fallbacks to screen center
    }

    setAnimType('open');
    setIsAnimating(true);
    setActiveApp(appId);
    
    if (!runningApps.includes(appId)) {
      setRunningApps((prev) => [...prev, appId]);
    }

    const duration = settings.animationStyle === 'oneui7' ? 450 : 800;
    // End transition sequence based on animation style speed slider
    setTimeout(() => {
      setIsAnimating(false);
      setAnimType(null);
    }, duration * settings.animationSpeed);
  };

  // Close / Minimize active application with reverse scaling back into origin
  const handleMinimizeApp = () => {
    if (!activeApp || isAnimating) return;

    playCloseSound();
    setAnimType('close');
    setIsAnimating(true);

    const duration = settings.animationStyle === 'oneui7' ? 420 : 750;
    setTimeout(() => {
      setActiveApp(null);
      setIsAnimating(false);
      setAnimType(null);
    }, duration * settings.animationSpeed);
  };

  // CAPACITIVE HARDWARE ACTION BEZEL HANDLERS
  const handleHardwareBack = () => {
    if (showRecents) {
      setShowRecents(false);
    } else if (showControlCenter) {
      setShowControlCenter(false);
    } else if (activeApp) {
      handleMinimizeApp();
    }
  };

  const handleHardwareRecents = () => {
    setShowControlCenter(false);
    setShowRecents(!showRecents);
  };

  const handleHardwareHome = () => {
    setShowRecents(false);
    setShowControlCenter(false);
    if (activeApp) {
      handleMinimizeApp();
    }
  };

  const handleHardwareVolume = () => {
    setShowVolumePopup(true);
    setVolumeLevel((prev) => {
      const next = prev < 100 ? prev + 10 : 0;
      playTone(350 + next * 3, 0.1, 'sine');
      return next;
    });
  };

  // Multitasking stack operations
  const handleSelectRecentApp = (id: string) => {
    setShowRecents(false);
    handleLaunchApp(id);
  };

  const handleCloseRecentApp = (id: string) => {
    setRunningApps((prev) => prev.filter((item) => item !== id));
    if (activeApp === id) {
      setActiveApp(null);
    }
  };

  const handleCloseAllRecents = () => {
    setRunningApps([]);
    setActiveApp(null);
    setShowRecents(false);
  };

  // Widget Addition handlers
  const handleAddWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: 'widget_' + Date.now(),
      type,
      title: type === 'clock' ? 'Годинник' : type === 'weather' ? 'Погода' : type === 'sysinfo' ? 'Стан системи' : 'Синтезатор',
      x: 0,
      y: 0,
      w: 4,
      h: 2
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  // Render animation transitions based on styles:
  // - "oneui7" style: pure scales & translations directly focused on origin x, y
  // - "ios18" style: springy elastic transforms with bouncy bezier timing!
  const getAnimationStyles = () => {
    return {};
  };

  const getAppStartTransform = () => {
    return {};
  };

  const getAnimationTransition = () => {
    const isIos = settings.animationStyle === 'ios18';
    const speedFactor = settings.animationSpeed || 1.0;
    
    if (isIos) {
      // Snappy and springy elastic iOS 18 style transition
      return {
        type: "spring",
        stiffness: 280 / speedFactor,
        damping: 24 * speedFactor,
        mass: 0.8 * speedFactor,
      };
    } else {
      // Rapid, fixed fluid, organic, non-rubbery scale transition for One UI 7!
      // This is 100% fixed scale zoom without back-and-forth bounce wobble.
      return {
        type: "tween",
        ease: [0.22, 1, 0.36, 1], // easeOutQuart: rapid expansion and pristine decelerations
        duration: 0.38 * speedFactor
      };
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center overflow-hidden relative font-sans text-white" 
      style={{ background: 'radial-gradient(circle at top left, #1e1b4b, #000000)' }}
    >
      
      {/* Top Banner mock info for widescreen immersion based on the Design HTML top header */}
      <div className="absolute top-0 inset-x-0 flex justify-between items-center px-6 py-2.5 backdrop-blur-md bg-white/5 border-b border-white/5 z-20 text-xs hidden sm:flex select-none">
        <div className="font-bold tracking-tight">B1X1 OS <span className="font-light opacity-50 text-[10px] ml-1">v1.1.0</span></div>
        <div className="flex items-center gap-4 text-[11px] font-medium opacity-80">
          <span>5G</span>
          <span>98%</span>
          <span className="px-2 py-0.5 bg-indigo-600 rounded-full text-[9px] uppercase tracking-wider font-bold">PRO POLISH EDITION</span>
          <div className="w-3.5 h-3.5 bg-white/20 rounded-full" />
          <div className="font-semibold text-xs text-amber-400">12:48</div>
        </div>
      </div>

      {/* Visual background screen lighting decoration to match premium layout design with elegant neon gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main smartphone emulator */}
      <PhoneFrame
        theme={settings.theme}
        onHardwareBack={handleHardwareBack}
        onHardwareRecents={handleHardwareRecents}
        onHardwareHome={handleHardwareHome}
        onHardwareVolume={handleHardwareVolume}
        isMusicPlaying={activeApp === 'music' || runningApps.includes('music')}
        isCameraActive={activeApp === 'camera'}
        volume={volumeLevel}
      >
        {/* INNER SCREEN CONTAINER */}
        <div 
          className="relative w-full h-full"
          style={{ filter: `brightness(${screenBrightness}%)` }}
        >
          {/* ONBOARDING INITIAL CONFIGURATION SYSTEM WIZARD OVERLAY */}
          {showSetupWizard && (
            <div className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col justify-between p-5 text-white select-none rounded-[38px] overflow-y-auto no-scrollbar font-sans animate-fade-in text-left">
              {/* Header block with glowing badge labels */}
              <div className="pt-4 text-center space-y-1.5 shrink-0">
                <span className="px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full">
                  Перший запуск B1X1 OS
                </span>
                <h2 className="text-xl font-bold font-display tracking-tight text-white pt-2">
                  Майстер Налаштування
                </h2>
                <p className="text-[10px] text-zinc-400 max-w-[210px] mx-auto leading-relaxed">
                  Будь ласка, налаштуйте свій перший інтерфейс перед запуском системи.
                </p>
              </div>

              {/* Wizard Form blocks */}
              <div className="flex-1 my-5 space-y-4 text-left">
                {/* 1. WALLPAPER CHOOSER */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                    крок 1: Оберіть Шпалери системи
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SYSTEM_WALLPAPERS.slice(0, 3).map((wp) => (
                      <button
                        key={wp.url}
                        onClick={() => {
                          setWallpaperUrl(wp.url);
                          playTone(450, 0.05, 'sine');
                        }}
                        className={`relative aspect-[9/16] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          wallpaperUrl === wp.url ? 'border-amber-400 scale-[1.03] shadow-md shadow-amber-400/10' : 'border-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={wp.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 right-1 text-[7px] font-mono bg-black/60 px-1 py-0.5 rounded text-zinc-300">
                          {wp.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ICON STYLE AND TINTING */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                    крок 2: Колір ікон і Тональність
                  </span>
                  <div className="bg-zinc-900/60 border border-zinc-850/80 rounded-2xl p-2.5 space-y-2.5">
                    {/* Style buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSettings((prev) => ({ ...prev, iconTintStyle: 'original' }));
                          playTone(550, 0.05, 'sine');
                        }}
                        className={`py-1.5 rounded-xl text-[9px] font-bold uppercase border tracking-wider transition-all cursor-pointer text-center ${
                          settings.iconTintStyle === 'original' ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-zinc-400 border-zinc-800'
                        }`}
                      >
                        Оригінал
                      </button>
                      <button
                        onClick={() => {
                          setSettings((prev) => ({ ...prev, iconTintStyle: 'tinted' }));
                          playTone(650, 0.05, 'sine');
                        }}
                        className={`py-1.5 rounded-xl text-[9px] font-bold uppercase border tracking-wider transition-all cursor-pointer text-center ${
                          settings.iconTintStyle === 'tinted' ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-zinc-400 border-zinc-800'
                        }`}
                      >
                        Тонування
                      </button>
                    </div>

                    {/* Tint colors circles preset under conditions */}
                    {settings.iconTintStyle === 'tinted' && (
                      <div className="space-y-2.5 pt-1 animate-fade-in text-left">
                        <div className="flex flex-wrap gap-2 items-center justify-center">
                          {[
                            { color: '#fbbf24', bg: 'bg-amber-400' },
                            { color: '#3b82f6', bg: 'bg-blue-500' },
                            { color: '#ec4899', bg: 'bg-pink-500' },
                            { color: '#10b981', bg: 'bg-emerald-500' },
                            { color: '#8b5cf6', bg: 'bg-violet-500' },
                          ].map((c) => {
                            const isSelected = settings.iconTintColor.toLowerCase() === c.color.toLowerCase();
                            return (
                              <button
                                key={c.color}
                                onClick={() => {
                                  setSettings((prev) => ({ ...prev, iconTintColor: c.color }));
                                  playTone(700, 0.05, 'sine');
                                }}
                                className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-transform cursor-pointer border ${
                                  isSelected ? 'ring-2 ring-white scale-110 border-black' : 'border-zinc-700 opacity-80 hover:opacity-100'
                                }`}
                              />
                            );
                          })}

                          {/* Concentric Palette Picker circle container */}
                          <div
                            className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 via-violet-600 to-emerald-400 relative flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow cursor-pointer overflow-hidden border border-zinc-700"
                            title="Власний колір"
                          >
                            <input
                              type="color"
                              value={settings.iconTintColor}
                              onChange={(e) => {
                                setSettings((prev) => ({ ...prev, iconTintColor: e.target.value }));
                                playTone(700, 0.05, 'sine');
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            />
                            <Palette size={10} className="text-white drop-shadow pointer-events-none" />
                          </div>
                        </div>

                        {/* Hue spectrum range controller */}
                        <div className="space-y-1 bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                          <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-400">
                            <span>Тон (Hue): {hexToHue(settings.iconTintColor)}°</span>
                            <span style={{ color: settings.iconTintColor }} className="font-bold">{settings.iconTintColor.toUpperCase()}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={hexToHue(settings.iconTintColor)}
                            onChange={(e) => {
                              const h = parseInt(e.target.value);
                              const hex = hslToHex(h, 92, 54);
                              setSettings((prev) => ({ ...prev, iconTintColor: hex }));
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. ANIMATION STYLE */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                    крок 3: Стиль Плавних Анімацій
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, animationStyle: 'oneui7' }));
                        playTone(550, 0.05, 'sine');
                      }}
                      className={`py-2 rounded-2xl text-[9px] font-bold uppercase border tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center p-2 text-center leading-normal ${
                        settings.animationStyle === 'oneui7' ? 'bg-amber-400/10 text-amber-300 border-amber-400' : 'bg-transparent text-zinc-400 border-zinc-900'
                      }`}
                    >
                      <span className="font-bold">One UI 7 Scale</span>
                      <span className="text-[7px] font-light text-zinc-400 block pt-0.5">Швидке масштабування</span>
                    </button>
                    <button
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, animationStyle: 'ios18' }));
                        playTone(650, 0.05, 'sine');
                      }}
                      className={`py-2 rounded-2xl text-[9px] font-bold uppercase border tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center p-2 text-center leading-normal ${
                        settings.animationStyle === 'ios18' ? 'bg-amber-400/10 text-amber-300 border-amber-400' : 'bg-transparent text-zinc-400 border-zinc-900'
                      }`}
                    >
                      <span className="text-amber-300 font-bold">iOS 18 Rubber</span>
                      <span className="text-[7px] font-light text-zinc-400 block pt-0.5">Пружні гумові рухи</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready Submit bar footer */}
              <div className="pt-4 pb-2 shrink-0">
                <button
                  onClick={() => {
                    localStorage.setItem('b1x1_setup_done', 'true');
                    setShowSetupWizard(false);
                    playUnlockChime();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-black font-semibold uppercase text-[11px] tracking-widest rounded-2xl transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-amber-400/20 cursor-pointer text-center font-display"
                >
                  Запустити B1X1 OS! 🚀
                </button>
                <p className="text-[8px] text-zinc-500 text-center uppercase tracking-wider font-mono mt-2.5">
                  Ви зможете змінити параметри у будь-який момент в Параметрах.
                </p>
              </div>
            </div>
          )}

          {/* 1. HOME SCREEN BACKGROUND DASHBOARD */}
          <HomeScreen
            settings={settings}
            wallpaperUrl={wallpaperUrl}
            onLaunchApp={handleLaunchApp}
            widgets={widgets}
            onAddWidget={handleAddWidget}
            onRemoveWidget={handleRemoveWidget}
          />

          {/* 2. CORE RUNNING APP SYSTEM VIEWS LAYER WITH SMOOTH ON-CLICK COORDINATE ZOOM */}
          {activeApp && (
            <motion.div 
              className="absolute inset-0 z-30 overflow-hidden bg-black rounded-[38px] shadow-2xl"
              style={{
                transformOrigin: launchOrigin ? `${launchOrigin.x}px ${launchOrigin.y}px` : 'center',
              }}
              initial={
                settings.animationStyle === 'oneui7'
                  ? { scale: 0.01, opacity: 1 }
                  : { scale: 0.08, opacity: 0 }
              }
              animate={
                animType === 'open' || !isAnimating
                  ? { scale: 1, opacity: 1 }
                  : (settings.animationStyle === 'oneui7' ? { scale: 0.01, opacity: 1 } : { scale: 0.08, opacity: 0 })
              }
              transition={getAnimationTransition()}
            >
              {activeApp === 'camera' && (
                <CameraApp
                  onPhotoCaptured={(ph) => setPhotos((prev) => [ph, ...prev])}
                  onGalleryOpen={() => handleLaunchApp('gallery')}
                />
              )}
              {activeApp === 'gallery' && (
                <GalleryApp
                  photos={photos}
                  onDeletePhoto={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
                  onSetWallpaper={setWallpaperUrl}
                  currentWallpaper={wallpaperUrl}
                  theme={settings.theme}
                />
              )}
              {activeApp === 'settings' && (
                <SettingsApp
                  settings={settings}
                  onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
                  wallpaperUrl={wallpaperUrl}
                  onSetWallpaper={setWallpaperUrl}
                  onResetWizard={() => {
                    setShowSetupWizard(true);
                    setActiveApp(null);
                    playTone(600, 0.15, 'sine');
                  }}
                />
              )}
              {activeApp === 'notes' && (
                <NotesApp
                  tasks={tasks}
                  notes={notes}
                  onAddTask={(txt) => setTasks((prev) => [{ id: 'task_' + Date.now(), text: txt, completed: false }, ...prev])}
                  onToggleTask={(tid) => setTasks((prev) => prev.map((t) => t.id === tid ? { ...t, completed: !t.completed } : t))}
                  onDeleteTask={(tid) => setTasks((prev) => prev.filter((t) => t.id !== tid))}
                  onAddNote={(tit, con) => setNotes((prev) => [{ id: 'note_' + Date.now(), title: tit, content: con, timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }, ...prev])}
                  onDeleteNote={(nid) => setNotes((prev) => prev.filter((n) => n.id !== nid))}
                />
              )}
              {activeApp === 'music' && (
                <MusicApp theme={settings.theme} />
              )}
              {activeApp === 'phone' && (
                <PhoneApp theme={settings.theme} />
              )}
            </motion.div>
          )}

          {/* 3. MULTITASKING RECENTS VIEW OVERLAY */}
          {showRecents && (
            <RecentsScreen
              runningApps={runningApps}
              onSelectApp={handleSelectRecentApp}
              onCloseApp={handleCloseRecentApp}
              onCloseAll={handleCloseAllRecents}
              onCloseRecents={() => setShowRecents(false)}
            />
          )}

          {/* 4. OVERLAY: QUICK SWIPE-DOWN SYSTEM STATUS OR CONTROL CENTER SHUTTER */}
          <div 
            className="absolute top-0 inset-x-0 h-4 bg-transparent z-40 cursor-row-resize"
            onDoubleClick={() => {
              setShowControlCenter(!showControlCenter);
              playTone(600, 0.05, 'sine');
            }}
            title="Двічі клацніть для шторки керування"
          />

          {showControlCenter && (
            <ControlCenter
              onClose={() => setShowControlCenter(false)}
              theme={settings.theme}
              onThemeToggle={() => setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
              volume={volumeLevel}
              onVolumeChange={setVolumeLevel}
              systemBrightness={screenBrightness}
              onBrightnessChange={setScreenBrightness}
            />
          )}

          {/* 5. FLOATING HARDWARE SYSTEM LEVEL VOLUME POPUP SLIDER */}
          {showVolumePopup && (
            <div className="absolute top-1/3 left-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl py-3.5 px-2 flex flex-col items-center gap-2 text-white z-50 shadow-2xl animate-[fade-in_0.15s_ease-out]">
              <Volume2 size={14} className="text-amber-400" />
              <div className="h-16 w-1 bg-zinc-800 rounded relative">
                <div 
                  className="absolute bottom-0 inset-x-0 bg-amber-400 rounded-b transition-all"
                  style={{ height: `${volumeLevel}%` }}
                />
              </div>
              <span className="text-[7.5px] font-mono font-bold">{volumeLevel}%</span>
            </div>
          )}

        </div>
      </PhoneFrame>

      {/* Top Bar Floating Guide Helper Panel (Ukrainian) */}
      <div className="max-w-sm mt-4 p-4 rounded-3xl bg-white/70 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-850 backdrop-blur text-center text-xs space-y-2 text-zinc-650 dark:text-zinc-400 font-sans shadow shadow-black/5 animate-fade-in mx-1 z-10">
        <p className="font-bold flex items-center justify-center gap-1.5 uppercase font-display text-[10px] text-amber-500">
          <Sliders size={12} /> Інтерактивні підказки B1X1 OS
        </p>
        <ul className="text-[10px] space-y-1 font-medium text-left">
          <li>• <strong>Шторка керування:</strong> Клацніть двічі по самій верхній панелі статус-бару (біля годинника), або відкрийте в <u>Параметрах</u>.</li>
          <li>• <strong>Жести та Кнопки:</strong> Ви можете натискати <i>Назад</i> / <i>Недавні</i> / <i>Домікі</i> на рамці під пристроєм.</li>
          <li>• <strong>Налаштування іконок:</strong> Змініть колір у <i>Параметрах</i> (iOS 18 стиль).</li>
        </ul>
      </div>

    </div>
  );
}
