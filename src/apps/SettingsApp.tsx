import React, { useState } from 'react';
import { SystemSettings, ThemeMode, AnimationStyle } from '../types';
import { Settings, Sliders, Smartphone, Palette, Sun, Moon, Volume2, Info, Check, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { playTone, setSystemVolume, getSystemVolume } from '../utils/audio';
import { SYSTEM_WALLPAPERS } from './GalleryApp';

interface SettingsAppProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => void;
  wallpaperUrl: string;
  onSetWallpaper: (url: string) => void;
  onResetWizard?: () => void;
}

// Preset color choices for IOS 18 layout tinted icons
export const ICON_TINTS = [
  { name: 'Золотий', color: '#fbbf24', bg: 'bg-amber-400' },
  { name: 'Кобальт', color: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Неон Рожевий', color: '#ec4899', bg: 'bg-pink-500' },
  { name: 'М\'ята', color: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Лаванда', color: '#8b5cf6', bg: 'bg-violet-500' },
  { name: 'Кармін', color: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Монохром', color: '#9ca3af', bg: 'bg-gray-400' }
];

// Helper to convert HSL to Hex color
export function hslToHex(h: number, s: number, l: number): string {
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
export function hexToHue(hex: string): number {
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

export default function SettingsApp({ settings, onUpdateSettings, wallpaperUrl, onSetWallpaper, onResetWizard }: SettingsAppProps) {
  const [volVal, setVolVal] = useState<number>(getSystemVolume() * 100);

  const triggerBeep = (freq: number) => {
    playTone(freq, 0.1, 'sine');
  };

  const handleTintStyleChange = (style: 'original' | 'tinted') => {
    onUpdateSettings({ iconTintStyle: style });
    triggerBeep(550 + (style === 'tinted' ? 150 : 0));
  };

  const handleTintColorChange = (color: string) => {
    onUpdateSettings({ iconTintColor: color });
    triggerBeep(700);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
    triggerBeep(theme === 'dark' ? 440 : 880);
  };

  const handleAnimSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ animationSpeed: val });
  };

  const handleAnimStyleChange = (style: AnimationStyle) => {
    onUpdateSettings({ animationStyle: style });
    triggerBeep(style === 'ios18' ? 800 : 650);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolVal(val);
    setSystemVolume(val / 100);
  };

  const handleVolumeRelease = () => {
    triggerBeep(440 + volVal * 2);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-white rounded-3xl overflow-hidden relative select-none font-sans" id="settings_app_root" style={settings.theme === 'dark' ? { background: 'radial-gradient(circle at bottom right, #1e1b4b, #000000)' } : undefined}>
      
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-6 bg-slate-100 dark:bg-zinc-900/60 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shrink-0">
        <Settings size={18} className="text-zinc-500 dark:text-zinc-400" />
        <span className="text-sm font-semibold uppercase tracking-wider">Параметри Системи</span>
      </div>

      {/* Settings Options Scroll Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-12 text-left">
        
        {/* BRAND NEW: PREMIUM TOP BRAND HEADER (DEVICE SUMMARY B1X1 Phone 1) */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/30 dark:from-zinc-900/80 dark:to-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/80 p-4 rounded-3xl relative overflow-hidden flex items-center justify-between shadow-sm">
          {/* Neon decorative background glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-1.5 z-10 text-left">
            <span className="px-2 py-0.5 bg-amber-450 text-slate-950 font-extrabold uppercase tracking-widest text-[8.5px] rounded-full font-mono">
              B1X1 Phone 1
            </span>
            <h2 className="text-base font-extrabold tracking-wider text-slate-800 dark:text-zinc-100">
              B1X1 PHONE
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>B1X1 Test OS • v1.1 • Octa-Core</span>
            </div>
          </div>

          {/* Interactive animated neon smartphone badge */}
          <div className="w-[45px] h-[65px] rounded-xl bg-zinc-900 border border-zinc-700/80 flex flex-col justify-between p-1.5 shadow-md relative select-none">
            <div className="w-6 h-0.5 bg-zinc-700 mx-auto rounded-full" />
            <div className="w-full h-8 rounded bg-zinc-950 flex flex-col items-center justify-center border border-white/5 relative">
              <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping absolute" />
              <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] z-10" />
            </div>
            <div className="text-[5.5px] font-mono tracking-widest leading-none text-zinc-500 text-center select-none">B1X1</div>
          </div>
        </div>
        
        {/* SECTION: Screen Theme Settings */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Palette size={12} /> Персоналізація Інтерфейсу
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/60 rounded-2xl p-4 space-y-4 shadow-sm">
            
            {/* Dark & Light System Theme */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Системна тема</span>
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    settings.theme === 'light' 
                      ? 'bg-white text-amber-500 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sun size={14} />
                  <span>Світла</span>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    settings.theme === 'dark' 
                      ? 'bg-zinc-900 text-amber-400 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Moon size={14} />
                  <span>Темна</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-zinc-800/80" />

            {/* Tinted Icons Color Options (like iOS 18 Customize icons) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Стиль іконок (iOS 18 Tint)</span>
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => handleTintStyleChange('original')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      settings.iconTintStyle === 'original' 
                        ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-zinc-500'
                    }`}
                  >
                    Класично
                  </button>
                  <button
                    onClick={() => handleTintStyleChange('tinted')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      settings.iconTintStyle === 'tinted' 
                        ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm' 
                        : 'text-zinc-500'
                    }`}
                  >
                    Тонування
                  </button>
                </div>
              </div>

              {settings.iconTintStyle === 'tinted' && (
                <div className="space-y-4.5 pt-1.5 animate-fade-in text-left">
                  <div className="space-y-2 font-sans">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Оберіть колір для тонування іконок:</span>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {ICON_TINTS.map((t) => {
                        const isSelected = settings.iconTintColor.toLowerCase() === t.color.toLowerCase();
                        return (
                          <button
                            key={t.name}
                            onClick={() => handleTintColorChange(t.color)}
                            className={`w-7 h-7 rounded-full ${t.bg} relative flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow-sm cursor-pointer border ${
                              isSelected ? 'ring-2 ring-amber-400 dark:ring-white scale-110 border-black/10' : 'border-transparent'
                            }`}
                            title={t.name}
                          >
                            {isSelected && (
                              <Check size={14} className="text-white drop-shadow font-bold" />
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Hue Color picker concentric circle with inline input */}
                      <div
                        className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 via-violet-600 to-emerald-400 relative flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow-sm cursor-pointer overflow-hidden border border-slate-100 dark:border-white/10"
                        title="Власний колір"
                      >
                        <input
                          type="color"
                          value={settings.iconTintColor}
                          onChange={(e) => handleTintColorChange(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                        />
                        <Palette size={12} className="text-white drop-shadow font-bold pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* iOS 18 Slider spectrum adjustments */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 font-sans">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Точне регулювання відтінку (iOS 18)</span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 font-bold px-2 py-0.5 roundedbg bg-slate-100 dark:bg-zinc-800 text-[9.5px]" style={{ color: settings.iconTintColor }}>
                        {settings.iconTintColor.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                        <span>Колірний Тон (Hue Angle)</span>
                        <span className="font-semibold">{hexToHue(settings.iconTintColor)}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(settings.iconTintColor)}
                        onChange={(e) => {
                          const h = parseInt(e.target.value);
                          const hex = hslToHex(h, 92, 54); // sweet spot saturation/luminance
                          handleTintColorChange(hex);
                        }}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer shadow-inner border border-slate-200/50 dark:border-zinc-800/50"
                        style={{
                          background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECTION: Wallpaper Selection */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <ImageIcon size={12} /> Шпалери Системи
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/60 rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Оберіть шпалери нижче або синхронізуйте їх автоматично з колірною схемою іконок.
            </p>

            {/* Sync magic button */}
            <button
              onClick={() => {
                const activeColor = settings.iconTintColor;
                const matchMap: Record<string, string> = {
                  '#fbbf24': SYSTEM_WALLPAPERS[0].url, // Золота Енергія
                  '#3b82f6': SYSTEM_WALLPAPERS[1].url, // Кобальтовий Спектр
                  '#ec4899': SYSTEM_WALLPAPERS[2].url, // Рожевий Вогонь
                  '#10b981': SYSTEM_WALLPAPERS[3].url, // М'ятна Свіжість
                  '#8b5cf6': SYSTEM_WALLPAPERS[4].url, // Лавандовий Сон
                  '#f43f5e': SYSTEM_WALLPAPERS[5].url, // Карміновий Абстракт
                  '#9ca3af': SYSTEM_WALLPAPERS[6].url, // Монохромна Еліта
                };
                const matchingUrl = matchMap[activeColor] || SYSTEM_WALLPAPERS[0].url;
                onSetWallpaper(matchingUrl);
                triggerBeep(900);
              }}
              className="w-full py-2 mb-1 bg-amber-400/10 hover:bg-amber-400/20 active:scale-95 text-amber-500 dark:text-amber-400 border border-amber-400/30 text-[9.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              🎨 СИНХРОНІЗУВАТИ ОБОЇ ПІД КОЛІР ІКОНОК
            </button>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {SYSTEM_WALLPAPERS.map((wp) => {
                const isActive = wallpaperUrl === wp.url;
                return (
                  <button
                    key={wp.id}
                    onClick={() => {
                      onSetWallpaper(wp.url);
                      triggerBeep(700);
                    }}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border text-left cursor-pointer transition-all hover:scale-[1.03] active:scale-95 shadow-sm ${
                      isActive 
                        ? 'border-amber-400 ring-2 ring-amber-400/20' 
                        : 'border-slate-100 dark:border-zinc-800/80'
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-[2px] p-1.5 flex justify-between items-center shrink-0">
                      <span className="text-[8.5px] font-bold text-white truncate max-w-[70px] uppercase font-mono tracking-wide">{wp.name}</span>
                      {isActive && <Check size={10} className="text-amber-400 font-bold" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION: Smooth Animations Selector */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders size={12} /> Анімації та Плавність
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/60 rounded-2xl p-4 space-y-4 shadow-sm">
            
            {/* Speed slider customizable */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Швидкість анімації: {settings.animationSpeed}x</span>
                <span className="text-[9px] font-mono text-zinc-400">0.5x (Швидше) - 2.0x (Плавніше)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.animationSpeed}
                onChange={handleAnimSpeedChange}
                className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <hr className="border-slate-100 dark:border-zinc-800/80" />

            {/* Animation curve style select details */}
            <div className="space-y-3">
              <span className="text-xs font-semibold block">Стиль системних переходів:</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleAnimStyleChange('oneui7')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                    settings.animationStyle === 'oneui7'
                      ? 'border-amber-400 bg-amber-400/5 dark:bg-amber-400/10'
                      : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <p className="text-[10px] font-bold">One UI 7 Style</p>
                  <p className="text-[9px] text-zinc-400 leading-tight mt-1">Вилітає в іконку та з неї за масштабом</p>
                  {settings.animationStyle === 'oneui7' && (
                    <span className="absolute top-2 right-2 text-amber-500 font-bold text-xs">●</span>
                  )}
                </button>

                <button
                  onClick={() => handleAnimStyleChange('ios18')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                    settings.animationStyle === 'ios18'
                      ? 'border-amber-400 bg-amber-400/5 dark:bg-amber-400/10'
                      : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <p className="text-[10px] font-bold">iOS 18 Elastic Style</p>
                  <p className="text-[9px] text-zinc-400 leading-tight mt-1">Гумові, пружні та еластичні переходи</p>
                  {settings.animationStyle === 'ios18' && (
                    <span className="absolute top-2 right-2 text-amber-500 font-bold text-xs">●</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION: Volume & Sound Effects */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 size={12} /> Гучність та Звук
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/60 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">Рівень звуку B1X1 OS</span>
              <span className="text-[10px] font-mono tracking-wider font-semibold">{volVal}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 size={14} className="text-zinc-400" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volVal}
                onChange={handleVolumeChange}
                onMouseUp={handleVolumeRelease}
                onTouchEnd={handleVolumeRelease}
                className="flex-1 h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Transition sounds mute/unmute toggle as requested */}
            <hr className="border-slate-100 dark:border-zinc-800/80 my-2" />
            
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5 text-left pr-4">
                <span className="text-xs font-semibold block">Звуки переходу програм</span>
                <span className="text-[8.5px] text-zinc-450 dark:text-zinc-500 font-medium block leading-normal">
                  Програвати звуковий ефект при запуску застосунків або виході з них
                </span>
              </div>
              <button
                onClick={() => {
                  const nextVal = settings.transitionSoundsEnabled === false;
                  onUpdateSettings({ transitionSoundsEnabled: nextVal });
                  triggerBeep(nextVal ? 700 : 450);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-all duration-205 outline-none cursor-pointer flex-shrink-0 relative ${
                  settings.transitionSoundsEnabled !== false ? 'bg-amber-400' : 'bg-slate-200 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white dark:bg-zinc-950 shadow transition-transform duration-205 ${
                  settings.transitionSoundsEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-[8.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-mono pt-1">
              *Виберіть для вимкнення звуку при заході/виході із застосунків.
            </p>
          </div>
        </div>

        {/* SECTION: Technical Device details */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Info size={12} /> Про Систему
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/60 rounded-2xl p-4 space-y-3.5 shadow-sm text-xs leading-snug">
            
            <div className="flex justify-between items-center text-[10px] pb-1">
              <span className="font-semibold text-zinc-400">Назва Прошивки:</span>
              <span className="font-mono text-amber-500 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">B1X1 Test OS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-[10px] pt-1 border-t border-slate-50 dark:border-zinc-800/80">
              <div>
                <p className="text-zinc-400">Процесор (Імітація):</p>
                <p className="font-semibold">B1X1 Core Nano x8</p>
              </div>
              <div>
                <p className="text-zinc-400">Оперативна пам&#39;ять:</p>
                <p className="font-semibold">8.0 ГБ LPDDR5X</p>
              </div>
              <div>
                <p className="text-zinc-400">Режим Тестування:</p>
                <p className="font-semibold text-emerald-500">Працює стабільно</p>
              </div>
              <div>
                <p className="text-zinc-400">Розробник:</p>
                <p className="font-semibold">Юра Білицький</p>
              </div>
            </div>

            <div className="flex gap-2 items-start bg-amber-400/5 dark:bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 text-[9px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              <ShieldAlert size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>УВАГА:</strong> Це ТЕСТОВА ПРОГРАМА для демонстрації красивого UX дизайну та анімацій! Це <strong>НЕ СПРАВЖНЯ ОС</strong>, і її НЕ ПОТРІБНО встановлювати через TWRP Recovery!
              </span>
            </div>

            {onResetWizard && (
              <button
                onClick={() => {
                  onResetWizard();
                }}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold uppercase text-[9px] tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer text-center"
              >
                🔄 Запустити Майстер Налаштування знову
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
