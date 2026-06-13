import React, { useState, useEffect } from 'react';
import { Widget, AppIcon, SystemSettings } from '../types';
import { 
  Camera, Image as ImageIcon, Settings, StickyNote, Music, Phone, Plus, Minus,
  CloudSun, Sun, CloudRain, Clock, Cpu, Battery, Disc, ChevronRight, Activity, Trash
} from 'lucide-react';
import { playTone, playTapSound } from '../utils/audio';

interface HomeScreenProps {
  settings: SystemSettings;
  wallpaperUrl: string;
  onLaunchApp: (appId: string, elementRect?: DOMRect) => void;
  // Widget customization handlers
  widgets: Widget[];
  onAddWidget: (type: Widget['type']) => void;
  onRemoveWidget: (id: string) => void;
}

export const APPS_LIST: AppIcon[] = [
  { id: 'phone', name: 'Телефон', icon: 'Phone', color: 'bg-emerald-500 text-white', category: 'core' },
  { id: 'camera', name: 'Камера', icon: 'Camera', color: 'bg-zinc-800 text-amber-400', category: 'core' },
  { id: 'gallery', name: 'Галерея', icon: 'ImageIcon', color: 'bg-blue-500 text-white', category: 'core' },
  { id: 'notes', name: 'Блокнот', icon: 'StickyNote', color: 'bg-amber-400 text-amber-950', category: 'tools' },
  { id: 'music', name: 'Синтезатор', icon: 'Music', color: 'bg-indigo-600 text-white', category: 'media' },
  { id: 'settings', name: 'Параметри', icon: 'Settings', color: 'bg-zinc-600 text-zinc-100', category: 'core' },
];

export default function HomeScreen({
  settings,
  wallpaperUrl,
  onLaunchApp,
  widgets,
  onAddWidget,
  onRemoveWidget
}: HomeScreenProps) {
  const [systime, setSystime] = useState(new Date());
  const [simCpu, setSimCpu] = useState(5);
  const [simRam, setSimRam] = useState(44);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStep, setOptimizeStep] = useState('');

  // CPU and Clock tickers
  useEffect(() => {
    const timer = setInterval(() => setSystime(new Date()), 1000);
    const cpuTimer = setInterval(() => {
      if (isOptimizing) return; // hold stats low during active optimization
      setSimCpu(Math.floor(Math.random() * 8) + 4);
      setSimRam(Math.floor(Math.random() * 4) + 42); // around 44% RAM
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(cpuTimer);
    };
  }, [isOptimizing]);

  const handleOptimize = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setOptimizeStep('Очищення залишків кешу...');
    playTone(350, 0.1, 'sine');
    
    setTimeout(() => {
      setOptimizeStep('Закриття фонових процесів...');
      playTone(550, 0.1, 'sine');
    }, 500);

    setTimeout(() => {
      setOptimizeStep('Звільнення RAM та дефрагментація...');
      playTone(750, 0.15, 'sine');
    }, 1000);

    setTimeout(() => {
      setSimCpu(2);
      setSimRam(18);
      setOptimizeStep('ОПТИМІЗОВАНО НА 100%!');
      playTone(880, 0.15, 'sine');
      setTimeout(() => playTone(1320, 0.25, 'sine'), 100);
    }, 1500);

    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizeStep('');
    }, 2700);
  };

  const getLucideIcon = (name: string, tintColor?: string) => {
    const defaultColor = settings.iconTintStyle === 'tinted' ? tintColor || '#fff' : undefined;
    const isTinted = settings.iconTintStyle === 'tinted';
    const size = 26;

    switch (name) {
      case 'Phone': return <Phone size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      case 'Camera': return <Camera size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      case 'ImageIcon': return <ImageIcon size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      case 'StickyNote': return <StickyNote size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      case 'Music': return <Music size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      case 'Settings': return <Settings size={size} style={isTinted ? { color: settings.iconTintColor } : undefined} />;
      default: return <Settings size={size} />;
    }
  };

  const formattedDate = systime.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const formattedTime = systime.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>, appId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onLaunchApp(appId, rect);
  };

  const handleWidgetAdd = (type: Widget['type']) => {
    onAddWidget(type);
    setShowAddWidgetModal(false);
    playTone(800, 0.1, 'sine');
  };

  const handleWidgetRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveWidget(id);
    playTone(400, 0.1, 'triangle');
  };

  return (
    <div 
      className="absolute inset-0 bg-cover bg-center flex flex-col justify-between p-4 relative font-sans select-none overflow-y-auto no-scrollbar"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
      id="home_screen_root"
    >
      {/* Background Dimmer/Tint Overlay for Dark Theme parity */}
      <div className={`absolute inset-0 z-0 transition-colors pointer-events-none ${
        settings.theme === 'dark' ? 'bg-black/35' : 'bg-black/5'
      }`} />

      {/* Main Screen Content Grid Stack */}
      <div className="z-10 flex-1 flex flex-col space-y-4 min-h-0">
        
        {/* Dynamic Installed Widgets Section */}
        <div className="space-y-3 shrink-0">
          {widgets.map((wd) => (
            <div
              key={wd.id}
              className="relative group p-5 rounded-[32px] bg-white/10 border border-white/10 text-white backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden text-left"
            >
              {/* Delete Mini Widget badge - Touch/Mobile safe always visible */}
              <button
                onClick={(e) => handleWidgetRemove(wd.id, e)}
                className="absolute top-3 right-3 w-5.5 h-5.5 rounded-full bg-black/45 border border-white/20 text-[10px] flex items-center justify-center hover:bg-red-500 hover:text-white text-white/90 cursor-pointer shadow transition-all duration-200 z-20"
                title="Видалити віджет"
              >
                ✕
              </button>

              {/* Render specific widget core component layout */}
              {wd.type === 'clock' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-mono tracking-widest text-indigo-300 capitalize font-bold">{formattedDate}</p>
                      <h2 className="text-3xl font-display font-light leading-none tracking-tight">{formattedTime}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-505 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg">
                      <Clock size={20} className="text-zinc-100 animate-pulse" />
                    </div>
                  </div>
                  {/* Decorative timeline tracks from the request design HTML */}
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-indigo-400"></div></div>
                    <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
                    <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              )}

              {wd.type === 'weather' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="text-2xl font-light italic font-serif">+22°C</div>
                      <div className="text-[9px] opacity-60 uppercase tracking-widest mt-1">Kyiv, Ukraine</div>
                      <p className="text-[9.5px] text-amber-300 flex items-center gap-1 font-semibold mt-1">Ясно, комфортне літо</p>
                    </div>
                    {/* Glowing yellow orb matching the spec exactly */}
                    <div className="w-12 h-12 bg-yellow-400 rounded-full blur-[2px] shadow-[0_0_20px_rgba(250,204,21,0.65)]" />
                  </div>
                  {/* Glass indicator timeline tracks */}
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-white"></div></div>
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-white/50"></div></div>
                    <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              )}

              {wd.type === 'sysinfo' && (
                <div className="space-y-3.5">
                  <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Ресурси Процесора</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-white">
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <Cpu size={14} className="mx-auto text-amber-400" />
                      <span className="text-[8px] font-mono block text-zinc-400 font-bold">ЦП</span>
                      <span className="text-[10px] font-bold font-mono">{simCpu}%</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <Activity size={14} className="mx-auto text-indigo-400" />
                      <span className="text-[8px] font-mono block text-zinc-400 font-bold">ОЗП</span>
                      <span className="text-[10px] font-bold font-mono">{simRam}%</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <Battery size={14} className="mx-auto text-emerald-400" />
                      <span className="text-[8px] font-mono block text-zinc-400 font-bold">ЗАРЯД</span>
                      <span className="text-[10px] font-bold font-mono">98%</span>
                    </div>
                  </div>
                </div>
              )}

              {wd.type === 'shortcuts' && (
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 border border-white/10 flex items-center justify-center">
                      <Disc size={18} className="text-white animate-[spin_8s_linear_infinite]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-pink-300">Супутник B1X1</p>
                      <span className="text-[8.5px] font-mono text-zinc-300">Синтезатор мелодій</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onLaunchApp('music');
                      playTone(600, 0.05, 'sine');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-bold font-mono uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
                  >
                    Відкрити
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Quick Add Widget button when limit is not reached */}
          {widgets.length < 3 && (
            <button
              onClick={() => {
                setShowAddWidgetModal(true);
                playTapSound();
              }}
              className="w-full py-1.5 border border-dashed border-white/20 rounded-2xl text-white/50 text-[10px] font-mono uppercase hover:bg-white/5 tracking-widest transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus size={12} /> Додати віджет на стіл
            </button>
          )}

          {/* OPTIMIZE DEVICE ACTION PILL */}
          <button
            onClick={handleOptimize}
            className="w-full py-2 bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 rounded-[20px] text-[10px] font-mono uppercase hover:bg-emerald-500/25 tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Оптимізувати B1X1 (Очистити ОЗУ)
          </button>
        </div>

        {/* Dynamic Desktop App Grid Icons */}
        <div className="flex-1 min-h-0 pt-2">
          <div className="grid grid-cols-4 gap-4 justify-items-center">
            {APPS_LIST.map((app) => {
              const { id, name, color } = app;
              const isTintedStyle = settings.iconTintStyle === 'tinted';
              return (
                <button
                  key={id}
                  onClick={(e) => handleIconClick(e, id)}
                  className="flex flex-col items-center p-1 group relative outline-none select-none active:scale-90 transition-transform cursor-pointer"
                  id={`app_icon_button_${id}`}
                >
                  {/* Dynamic Color Tint application like iOS 18 custom tinting */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 relative overflow-hidden ${
                    isTintedStyle 
                      ? 'bg-zinc-900 border border-zinc-800' 
                      : color
                  }`}>
                    {/* Simulated OLED reflection glass lines inside icons */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
                    
                    {getLucideIcon(app.icon)}
                  </div>
                  <span className="text-[9px] font-semibold text-white mt-1.5 drop-shadow-md text-center tracking-wide group-hover:text-amber-300 truncate max-w-[65px]">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Persistent Static Dock Bar at absolute bottom of Screen (classic launcher) */}
      <div 
        className="z-10 bg-white/15 dark:bg-black/35 border border-white/10 p-2.5 rounded-3xl backdrop-blur-xl shrink-0 flex justify-around items-center w-full shadow-inner mt-4"
        id="desktop_static_dock"
      >
        {/* Dock icons shortcut references */}
        {APPS_LIST.slice(0, 4).map((app) => (
          <button
            key={`dock_${app.id}`}
            id={`dock_button_${app.id}`}
            onClick={(e) => handleIconClick(e, app.id)}
            style={{ 
              background: settings.iconTintStyle === 'tinted' ? '#18181b' : undefined,
              border: settings.iconTintStyle === 'tinted' ? '1px solid #27272a' : undefined
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer relative shadow-md ${
              settings.iconTintStyle === 'tinted' ? 'bg-zinc-900 border border-zinc-800' : app.color
            }`}
          >
            {getLucideIcon(app.icon)}
          </button>
        ))}
      </div>

      {/* Widget Pick Popup Modal Overlay */}
      {showAddWidgetModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur z-50 flex items-end justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-5 space-y-4 text-white text-left animate-fade-in pb-8">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-400">Додати нові віджети</span>
              <button 
                onClick={() => setShowAddWidgetModal(false)}
                className="w-6 h-6 rounded-full bg-zinc-800 text-xs flex items-center justify-center cursor-pointer hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              
              {/* Type 1: Clock */}
              <button
                onClick={() => handleWidgetAdd('clock')}
                className="w-full p-3 bg-zinc-800/40 hover:bg-zinc-800 rounded-2xl text-left border border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans">Системний Годинник B1X1</h4>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Класичний годинник, день тижня та дата</p>
                </div>
                <Clock className="text-amber-400" size={18} />
              </button>

              {/* Type 2: Weather */}
              <button
                onClick={() => handleWidgetAdd('weather')}
                className="w-full p-3 bg-zinc-800/40 hover:bg-zinc-800 rounded-2xl text-left border border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans">Служба погоди України</h4>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Поточна температура, вологість та хмари</p>
                </div>
                <CloudSun className="text-sky-400" size={18} />
              </button>

              {/* Type 3: Core Resources System info */}
              <button
                onClick={() => handleWidgetAdd('sysinfo')}
                className="w-full p-3 bg-zinc-800/40 hover:bg-zinc-800 rounded-2xl text-left border border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans">Стан Обчислювача</h4>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Завантаження процесора, ОЗУ та батарея</p>
                </div>
                <Cpu className="text-emerald-400" size={18} />
              </button>

              {/* Type 4: Music mini play */}
              <button
                onClick={() => handleWidgetAdd('shortcuts')}
                className="w-full p-3 bg-zinc-800/40 hover:bg-zinc-800 rounded-2xl text-left border border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans">Шорткат Синтезатора</h4>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Швидкий перехід у генератор синтезу аудіо</p>
                </div>
                <Disc className="text-rose-400" size={18} />
              </button>

            </div>
          </div>
        </div>
      )}

      {/* OPTIMIZING FULLSCREEN RADAR OVERLAY */}
      {isOptimizing && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in font-sans rounded-[38px]">
          
          {/* Circular clean radar visual */}
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            {/* Outer spinning dash circle */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
            {/* Middle pulsating orb */}
            <div className="absolute w-16 h-16 border border-emerald-400/40 rounded-full animate-ping" />
            {/* Center core badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Cpu size={20} className="text-black animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5 z-10">
            <h3 className="text-xs font-bold font-mono tracking-widest text-emerald-400">
              B1X1 BOOST ENGINE
            </h3>
            <p className="text-[10px] text-zinc-300 font-medium h-4">
              {optimizeStep}
            </p>
            <div className="w-32 h-1 bg-zinc-800 rounded-full mx-auto overflow-hidden mt-2">
              <div className="h-full bg-emerald-400 rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
