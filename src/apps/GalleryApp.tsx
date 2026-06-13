import React, { useState } from 'react';
import { CapturedPhoto } from '../types';
import { Trash2, Image as ImageIcon, Sparkles, Check, ArrowLeft, Wallpaper } from 'lucide-react';
import { playTone } from '../utils/audio';

interface GalleryAppProps {
  photos: CapturedPhoto[];
  onDeletePhoto: (id: string) => void;
  onSetWallpaper: (url: string) => void;
  currentWallpaper: string;
  theme?: 'light' | 'dark';
}

// Solid initial backup system wallpapers matching each icon tint style!
export const SYSTEM_WALLPAPERS = [
  { id: 'wp_gold', name: 'Золота Енергія', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_cobalt', name: 'Кобальтовий Спектр', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_pink', name: 'Рожевий Вогонь', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_mint', name: 'М\'ятна Свіжість', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_lavender', name: 'Лавандовий Сон', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_carmine', name: 'Карміновий Абстракт', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80' },
  { id: 'wp_mono', name: 'Монохромна Еліта', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80' }
];

export default function GalleryApp({ photos, onDeletePhoto, onSetWallpaper, currentWallpaper, theme = 'dark' }: GalleryAppProps) {
  const [selectedItem, setSelectedItem] = useState<CapturedPhoto | typeof SYSTEM_WALLPAPERS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'wallpapers'>('camera');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetWallpaper = (url: string) => {
    onSetWallpaper(url);
    playTone(900, 0.1, 'sine');
    setTimeout(() => playTone(1200, 0.1, 'sine'), 80);
    setSuccessMsg('Шпалери успішно встановлено!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePhoto(id);
    playTone(300, 0.15, 'triangle');
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    playTone(700, 0.05, 'sine');
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'light' ? 'bg-slate-50 text-slate-800 border border-slate-200/50' : 'bg-zinc-950 text-white'} rounded-3xl overflow-hidden relative select-none font-sans`} id="gallery_app_root">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500/95 text-white text-xs px-4 py-2.5 rounded-full shadow-lg border border-emerald-450 z-50 flex items-center gap-2 animate-bounce">
          <Check size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className={`h-14 flex items-center justify-between px-6 border-b shrink-0 transition-colors ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <span className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon size={18} className="text-amber-500" />
          <span>B1X1 ГАЛЕРЕЯ</span>
        </span>
        <span className="text-xs font-mono text-zinc-500">{photos.length} Світлин</span>
      </div>

      {/* View Mode Swapping Tabs */}
      <div className={`flex border-b p-1 transition-colors ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <button
          onClick={() => {
            setActiveTab('camera');
            playTone(600, 0.04, 'sine');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'camera' 
              ? (theme === 'light' ? 'bg-white text-amber-600 shadow-sm' : 'bg-zinc-800 text-amber-400 font-bold shadow') 
              : (theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white')
          }`}
        >
          Камера ({photos.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('wallpapers');
            playTone(600, 0.04, 'sine');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'wallpapers' 
              ? (theme === 'light' ? 'bg-white text-amber-600 shadow-sm' : 'bg-zinc-800 text-amber-400 font-bold shadow') 
              : (theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white')
          }`}
        >
          Шпалери OS ({SYSTEM_WALLPAPERS.length})
        </button>
      </div>

      {/* Scrollable grid area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'camera' ? (
          photos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-550 gap-2 font-sans py-16">
              <div className={`p-4 rounded-full border ${theme === 'light' ? 'bg-slate-200/50 border-slate-300' : 'bg-zinc-900/50 border-zinc-800'}`}>
                <ImageIcon size={32} className={theme === 'light' ? 'text-slate-400' : 'text-zinc-600'} />
              </div>
              <p className={`text-xs font-mono font-bold tracking-widest uppercase ${theme === 'light' ? 'text-slate-650' : 'text-zinc-400'}`}>Галерея порожня</p>
              <p className="text-[10px] text-zinc-500 max-w-xs">Перейдіть в Камеру щоб зробити перші знімки або встановіть стокові шпалери.</p>
            </div>
          ) : (
             <div className="grid grid-cols-2 gap-3 pb-8">
              {photos.map((ph) => {
                const isSavedWallpaper = currentWallpaper === ph.url;
                
                // Parse out the zoom level from the composite timestamp
                const matchZoom = ph.timestamp.match(/\[(.*?)\]/);
                const zoomText = matchZoom ? matchZoom[1] : null;
                const cleanTimestamp = ph.timestamp.replace(/\s*\[.*?\]/, '');

                return (
                  <div 
                    key={ph.id}
                    onClick={() => handleItemClick(ph)}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer hover:border-amber-500/50 transition-all shadow-md flex flex-col ${
                      theme === 'light' ? 'bg-slate-100 border-slate-200 shadow-slate-100' : 'bg-zinc-900 border-zinc-800 shadow-zinc-950/20'
                    }`}
                  >
                    {/* Zoom level overlay badge */}
                    {zoomText && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 border border-white/10 text-[8px] font-bold font-mono tracking-wider text-amber-400 z-10 shadow-sm uppercase">
                        {zoomText}
                      </span>
                    )}

                    <img 
                      src={ph.url} 
                      alt="Capture" 
                      className="w-full flex-1 object-cover hover:scale-105 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                    <div className={`p-2 flex items-center justify-between text-[10px] font-mono border-t shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}>
                      <span>{cleanTimestamp}</span>
                      <div className="flex items-center gap-1">
                        {isSavedWallpaper && (
                          <span className="text-amber-500 mr-1 animate-pulse" title="Активні шпалери">★</span>
                        )}
                        <button
                          onClick={(e) => handleDelete(ph.id, e)}
                          className={`p-1 rounded transition-colors ${
                            theme === 'light' ? 'text-slate-400 hover:text-red-500 hover:bg-slate-200' : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                          }`}
                          title="Видалити"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* OS System Wallpapers Grid */
          <div className="grid grid-cols-2 gap-3 pb-8">
            {SYSTEM_WALLPAPERS.map((wp) => {
              const isActive = currentWallpaper === wp.url;
              return (
                <div
                  key={wp.id}
                  onClick={() => handleItemClick(wp)}
                  className={`relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border hover:scale-[1.02] transition-all ${
                    isActive ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-zinc-800'
                  }`}
                >
                  <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2 text-left">
                    <p className="text-[10px] font-bold truncate">{wp.name}</p>
                    <span className="text-[8px] font-mono text-zinc-400 tracking-wider">B1X1 BACKGROUND</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-black px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono">
                      АКТИВНО
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Layer */}
      {selectedItem && (
        <div className="absolute inset-0 bg-black z-40 flex flex-col justify-between animate-fade-in">
          
          {/* Top Bar inside Lightbox */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50">
            <button 
              onClick={() => {
                setSelectedItem(null);
                playTone(500, 0.05, 'sine');
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} />Назад
            </button>
            <span className="text-[10px] font-mono text-zinc-400">
              {'timestamp' in selectedItem ? (() => {
                const matchZoom = selectedItem.timestamp.match(/\[(.*?)\]/);
                const zoomLabel = matchZoom ? ` [${matchZoom[1]}]` : '';
                const cleanTime = selectedItem.timestamp.replace(/\s*\[.*?\]/, '');
                return `ЗНІМОК ${cleanTime}${zoomLabel}`;
              })() : `СТОК ${selectedItem.name}`}
            </span>
            {'timestamp' in selectedItem ? (
              <button
                onClick={(e) => {
                  handleDelete(selectedItem.id, e);
                  setSelectedItem(null);
                }}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                title="Видалити"
              >
                <Trash2 size={14} />
              </button>
            ) : <div className="w-[30px]" />}
          </div>

          {/* Core Image view */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={selectedItem.url} 
              alt="Lightbox" 
              className="max-h-[75%] max-w-full rounded-2xl object-contain shadow-2xl border border-zinc-900"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Action Footer inside Lightbox */}
          <div className="p-6 bg-gradient-to-t from-black/90 to-transparent z-50 flex justify-center pb-8">
            <button
              onClick={() => handleSetWallpaper(selectedItem.url)}
              className="flex items-center gap-2 bg-amber-400 text-black px-5 py-2.5 rounded-full font-bold text-xs shadow-xl active:scale-95 transition-all hover:bg-amber-300"
            >
              <Wallpaper size={16} />
              <span>Встановити як шпалери B1X1</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
