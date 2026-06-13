import React from 'react';
import { Trash2, X, RefreshCw, Layers } from 'lucide-react';
import { playTone } from '../utils/audio';

interface RecentsScreenProps {
  runningApps: string[];
  onSelectApp: (id: string) => void;
  onCloseApp: (id: string) => void;
  onCloseAll: () => void;
  onCloseRecents: () => void;
}

export default function RecentsScreen({
  runningApps,
  onSelectApp,
  onCloseApp,
  onCloseAll,
  onCloseRecents
}: RecentsScreenProps) {

  const handleSelect = (id: string) => {
    onSelectApp(id);
    playTone(700, 0.05, 'sine');
  };

  const handleClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCloseApp(id);
    playTone(300, 0.1, 'triangle');
  };

  const nameMapping: Record<string, string> = {
    phone: 'Телефон',
    camera: 'Камера',
    gallery: 'Галерея',
    notes: 'Блокнот',
    music: 'Синтезатор',
    settings: 'Параметри'
  };

  const bgMapping: Record<string, string> = {
    phone: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    camera: 'from-zinc-800/20 to-transparent border-zinc-700/30 text-amber-400',
    gallery: 'from-blue-500/10 to-transparent border-blue-500/30 text-blue-400',
    notes: 'from-amber-400/10 to-transparent border-amber-400/30 text-amber-600',
    music: 'from-indigo-600/10 to-transparent border-indigo-600/30 text-indigo-400',
    settings: 'from-zinc-650/10 to-transparent border-zinc-550/30 text-zinc-100'
  };

  return (
    <div className="absolute inset-0 bg-black/90 p-6 z-40 flex flex-col justify-between font-sans text-white relative">
      
      {/* Header bar */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 animate-pulse">
          <Layers size={14} className="text-amber-400" />
          <span>Недавні застосунки B1X1</span>
        </span>
        <button
          onClick={onCloseRecents}
          className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-center hover:bg-zinc-800 cursor-pointer text-zinc-400"
        >
          ✕
        </button>
      </div>

      {/* Main horizontal scrolling active preview cards */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-8">
        {runningApps.length === 0 ? (
          <div className="text-center text-zinc-500 space-y-1">
            <p className="text-xs font-mono uppercase">Немає фонових програм</p>
            <p className="text-[10px] text-zinc-600 max-w-xs">Усі запущені програми з&#39;являтимуться в цьому багатозадачному вікні.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-4 py-2 w-full max-w-md no-scrollbar snap-x justify-start select-none">
            {runningApps.map((appId) => (
              <div
                key={appId}
                onClick={() => handleSelect(appId)}
                className={`flex-none w-44 aspect-[3/4.5] rounded-3xl border bg-gradient-to-t ${bgMapping[appId] || 'from-zinc-900 to-transparent border-zinc-800 text-white'} p-4 flex flex-col justify-between snap-center relative shadow-lg cursor-pointer transform hover:scale-102 transition-all`}
              >
                {/* Swipe up close helper indicator cross */}
                <button
                  onClick={(e) => handleClose(appId, e)}
                  className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-red-500/90 border border-red-400 flex items-center justify-center text-white font-bold text-xs shadow hover:bg-red-650 cursor-pointer"
                  title="Закрити програму"
                >
                  ✕
                </button>

                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">{nameMapping[appId] || appId}</p>
                  <span className="text-[8px] font-mono opacity-50 tracking-widest uppercase">Запущено у RAM</span>
                </div>

                {/* Aesthetic wireframe inside card to simulate app content */}
                <div className="flex-1 flex flex-col justify-center items-center opacity-30 mt-3 border border-dashed border-white/10 rounded-xl bg-white/5 p-2 gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex items-center justify-center text-lg font-bold font-mono">
                    {appId.substring(0,1).toUpperCase()}
                  </div>
                  <span className="text-[8px] font-mono text-center tracking-widest uppercase truncate max-w-full">
                    {appId} ACTIVE STEP
                  </span>
                </div>

                <div className="text-[8.5px] font-mono text-right opacity-40 mt-1.5">
                  ID: B1X1_{appId.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multitasking footer control action button */}
      <div className="shrink-0 flex justify-center pb-6">
        {runningApps.length > 0 ? (
          <button
            onClick={() => {
              onCloseAll();
              playTone(200, 0.15, 'triangle');
              setTimeout(() => playTone(150, 0.2, 'triangle'), 80);
            }}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-5 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer text-rose-400"
          >
            <Trash2 size={14} />
            <span>Закрити всі фонові програми</span>
          </button>
        ) : (
          <button 
            onClick={onCloseRecents}
            className="text-xs text-zinc-500 underline font-mono tracking-widest uppercase"
          >
            Повернутися
          </button>
        )}
      </div>

    </div>
  );
}
