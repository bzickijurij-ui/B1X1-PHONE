import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Zap, ShieldAlert, Circle, Grid3X3, Sliders, Image as ImageIcon } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playTone } from '../utils/audio';

interface CameraAppProps {
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  onGalleryOpen: () => void;
}

export default function CameraApp({ onPhotoCaptured, onGalleryOpen }: CameraAppProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  // Filter Presets
  const filtersList = [
    { id: 'none', label: 'ORIGINAL', class: '' },
    { id: 'mono', label: 'MONO', class: 'grayscale' },
    { id: 'sepia', label: 'SEPIA', class: 'sepia' },
    { id: 'warm', label: 'WARM', class: 'hue-rotate-15 saturate-150' },
    { id: 'cool', label: 'COOL', class: 'hue-rotate-240 saturate-110 contrast-125' },
    { id: 'vintage', label: 'RETRO', class: 'contrast-75 brightness-110 sepia-50' }
  ];

  // Initialize Camera Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setPermissionError(false);
      } catch (err) {
        console.warn("Real Camera API failed or blocked (probably in iframe environment):", err);
        setPermissionError(true);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // White flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);

    // Audio sound for capture (short high frequency note)
    playTone(1000, 0.08, 'sine');
    setTimeout(() => playTone(600, 0.12, 'sine'), 50);

    let photoUrl = '';

    if (!permissionError && videoRef.current && canvasRef.current) {
      // Capture from actual HTML5 web camera
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        // Apply filters in 2d context for saving
        if (activeFilter === 'mono') ctx.filter = 'grayscale(100%)';
        else if (activeFilter === 'sepia') ctx.filter = 'sepia(100%)';
        else if (activeFilter === 'warm') ctx.filter = 'hue-rotate(15deg) saturate(150%)';
        else if (activeFilter === 'cool') ctx.filter = 'hue-rotate(240deg) saturate(110%) contrast(125%)';
        else if (activeFilter === 'vintage') ctx.filter = 'contrast(75%) brightness(110%) sepia(50%)';
        else ctx.filter = 'none';

        // Horizontal flip for front-facing webcam parity
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        // Zoom logic for video stream: crop and zoom
        if (zoom < 1) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);
          const targetW = w * zoom;
          const targetH = h * zoom;
          const targetX = (w - targetW) / 2;
          const targetY = (h - targetH) / 2;
          ctx.drawImage(video, 0, 0, w, h, targetX, targetY, targetW, targetH);
        } else {
          const cropW = w / zoom;
          const cropH = h / zoom;
          const cropX = (w - cropW) / 2;
          const cropY = (h - cropH) / 2;
          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, w, h);
        }

        photoUrl = canvas.toDataURL('image/jpeg');
      }
    } else {
      // Create beautifully generated static scenery if camera is unavailable in web container iframe
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      // Let's draw the landscape on a virtual high-quality asset canvas
      const virtualCanvas = document.createElement('canvas');
      virtualCanvas.width = 640;
      virtualCanvas.height = 480;
      const vctx = virtualCanvas.getContext('2d');
      
      if (ctx && vctx) {
        // Draw background on virtual canvas
        const gradient = vctx.createLinearGradient(0, 0, 0, 480);
        gradient.addColorStop(0, '#10172a');
        gradient.addColorStop(0.5, '#f43f5e');
        gradient.addColorStop(1, '#020617');
        vctx.fillStyle = gradient;
        vctx.fillRect(0, 0, 640, 480);

        // Cyber Grid base
        vctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        vctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 30) {
          vctx.beginPath();
          vctx.moveTo(i, 280);
          vctx.lineTo(i - 120, 480);
          vctx.stroke();
        }
        for (let i = 280; i < 480; i += 20) {
          vctx.beginPath();
          vctx.moveTo(0, i);
          vctx.lineTo(640, i);
          vctx.stroke();
        }

        // Beautiful solid glowing cyber sun
        vctx.fillStyle = '#fbe585';
        vctx.shadowColor = '#f43f5e';
        vctx.shadowBlur = 30;
        vctx.beginPath();
        vctx.arc(320, 220, 80, 0, Math.PI * 2);
        vctx.fill();
        vctx.shadowBlur = 0; // reset shadow

        // Polygon mountain peaks
        vctx.fillStyle = '#0f172a';
        vctx.beginPath();
        vctx.moveTo(30, 480);
        vctx.lineTo(240, 180);
        vctx.lineTo(450, 480);
        vctx.fill();

        vctx.fillStyle = '#1e1b4b';
        vctx.beginPath();
        vctx.moveTo(260, 480);
        vctx.lineTo(440, 210);
        vctx.lineTo(620, 480);
        vctx.fill();

        // Apply filters in 2d context for saving
        if (activeFilter === 'mono') ctx.filter = 'grayscale(100%)';
        else if (activeFilter === 'sepia') ctx.filter = 'sepia(100%)';
        else if (activeFilter === 'warm') ctx.filter = 'hue-rotate(15deg) saturate(150%)';
        else if (activeFilter === 'cool') ctx.filter = 'hue-rotate(240deg) saturate(110%) contrast(125%)';
        else if (activeFilter === 'vintage') ctx.filter = 'contrast(75%) brightness(110%) sepia(50%)';
        else ctx.filter = 'none';

        // Crop & Draw onto output canvas according to Zoom parameter
        const w = 640;
        const h = 480;
        if (zoom < 1) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);
          const targetW = w * zoom;
          const targetH = h * zoom;
          const targetX = (w - targetW) / 2;
          const targetY = (h - targetH) / 2;
          ctx.drawImage(virtualCanvas, 0, 0, w, h, targetX, targetY, targetW, targetH);
        } else {
          const cropW = w / zoom;
          const cropH = h / zoom;
          const cropX = (w - cropW) / 2;
          const cropY = (h - cropH) / 2;
          ctx.drawImage(virtualCanvas, cropX, cropY, cropW, cropH, 0, 0, w, h);
        }

        // Draw HUD labels at fixed size on top of the zoomed composition!
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`B1X1 MOCK SHOT (${zoom}x)`, 320, 50);

        ctx.font = '10px Courier';
        ctx.fillText(new Date().toLocaleTimeString('uk-UA'), 320, 75);

        photoUrl = canvas.toDataURL('image/jpeg');
      }
    }

    if (photoUrl) {
      const newPhoto: CapturedPhoto = {
        id: 'photo_' + Date.now(),
        url: photoUrl,
        timestamp: `${new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} [${zoom}x]`
      };
      onPhotoCaptured(newPhoto);
    }
  };

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    playTone(700, 0.05, 'sine', true);
    setTimeout(() => setFocusPoint(null), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white rounded-3xl overflow-hidden relative select-none font-sans" id="camera_app_root">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="h-14 flex items-center justify-between px-6 bg-zinc-900 border-b border-zinc-800 shrink-0 z-10">
        <button 
          onClick={() => setFlash(!flash)} 
          className={`p-2 rounded-full transition-colors ${flash ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'}`}
          title="Flash"
        >
          <Zap size={18} />
        </button>

        <span className="text-xs font-mono tracking-widest text-zinc-400">B1X1 LENSE v2.0</span>

        <button 
          onClick={() => setShowGrid(!showGrid)} 
          className={`p-2 rounded-full transition-colors ${showGrid ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}`}
          title="Grid Layout"
        >
          <Grid3X3 size={18} />
        </button>
      </div>

      {/* Camera Viewfinder */}
      <div 
        className="relative flex-1 bg-zinc-950 overflow-hidden flex items-center justify-center cursor-crosshair"
        onClick={handleScreenTap}
      >
        {/* Flash Overlay */}
        {flashActive && (
          <div className="absolute inset-0 bg-white z-50 transition-opacity duration-75" />
        )}

        {/* Real Stream OR Mock Simulator View */}
        {!permissionError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: `scaleX(-1) scale(${zoom})` }}
            className={`w-full h-full object-cover transition-transform ${
              filtersList.find(f => f.id === activeFilter)?.class
            }`}
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Real-time zoomable interactive vector scenery (Live simulator preview) */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                filtersList.find(f => f.id === activeFilter)?.class
              }`}
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Retro Sunset Sun with radiant neon glow */}
              <div className="absolute w-48 h-48 rounded-full bg-gradient-to-t from-rose-500 via-orange-400 to-yellow-300 shadow-[0_0_50px_rgba(244,63,94,0.3)]" />
              
              {/* Cyber mountain peaks */}
              <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[55%] flex items-end justify-center pointer-events-none">
                <svg className="w-full h-full fill-indigo-950/95" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="0,100 35,28 70,100" />
                  <polygon points="30,100 68,36 106,100" />
                </svg>
              </div>
              
              {/* Perspective grid floor */}
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[linear-gradient(rgba(244,63,94,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 [transform:rotateX(55deg)] origin-bottom" />
            </div>

            {/* Simulated target grid lines HUD */}
            <div className="absolute inset-x-6 top-1/4 bottom-1/4 border-y border-white/10 pointer-events-none z-10 flex justify-between">
              <div className="w-px h-full bg-white/10" />
              <div className="w-px h-full bg-white/10" />
            </div>

            {/* Active Simulation Info Indicator Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/70 border border-zinc-800 px-2.5 py-1 rounded-md text-[8.5px] font-mono tracking-widest text-emerald-400 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>СИМУЛЯТОР КАМЕРИ [{zoom}x]</span>
            </div>

            {/* Tap-to-focus helper prompt */}
            <div className="absolute bottom-20 inset-x-0 text-center pointer-events-none z-10">
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur border border-white/5">
                Клікніть де завгодно для фокусування
              </span>
            </div>
          </div>
        )}

        {/* Focus indicator */}
        {focusPoint && (
          <div 
            className="absolute border border-yellow-400 w-16 h-16 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          />
        )}

        {/* Grid lines overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
            <div className="border-b border-r border-white/20" />
            <div className="border-b border-r border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-b border-r border-white/20" />
            <div className="border-b border-r border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        )}

        {/* Zoom Overlay Pill */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center bg-black/70 border border-zinc-800 rounded-full py-1.5 px-3 backdrop-blur z-20 gap-3">
          {[0.5, 1.0, 2.0, 5.0].map((zVal) => (
            <button
              key={zVal}
              onClick={(e) => {
                e.stopPropagation();
                setZoom(zVal);
                playTone(400 + zVal * 100, 0.05, 'triangle');
              }}
              className={`w-8 h-8 rounded-full text-[10px] font-mono flex items-center justify-center transition-all ${
                zoom === zVal 
                  ? 'bg-amber-400 text-black font-semibold scale-110' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {zVal}x
            </button>
          ))}
        </div>
      </div>

      {/* Filter Selector & Shutter Bar */}
      <div className="bg-zinc-950 px-4 py-4 flex flex-col gap-3 shrink-0 border-t border-zinc-900 z-10">
        
        {/* Filters Scrollable list */}
        <div className="flex gap-3 overflow-x-auto py-1 px-2 no-scrollbar justify-start md:justify-center">
          {filtersList.map((filt) => (
            <button
              key={filt.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter(filt.id);
                playTone(600, 0.04, 'sine');
              }}
              className={`flex-none flex flex-col items-center gap-1.5 ${
                activeFilter === filt.id ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg border-2 overflow-hidden bg-gradient-to-tr from-rose-500 to-indigo-500 ${
                activeFilter === filt.id ? 'border-amber-400' : 'border-transparent'
              }`} />
              <span className="text-[9px] uppercase font-mono tracking-wider">{filt.label}</span>
            </button>
          ))}
        </div>

        {/* Shutter Main Controls */}
        <div className="flex items-center justify-between px-8 mt-1">
          {/* Gallery roll shortcut */}
          <button 
            onClick={onGalleryOpen}
            className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 transition-transform active:scale-95"
            title="Open Gallery"
          >
            <ImageIcon size={20} />
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            className="group flex items-center justify-center bg-white p-1 rounded-full transition-transform active:scale-90"
            title="Take Photo"
          >
            <div className="w-14 h-14 rounded-full border-4 border-black bg-white group-hover:bg-zinc-200 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-500 transform scale-50 opacity-0 group-active:scale-95 group-active:opacity-100 transition-all duration-100" />
            </div>
          </button>

          {/* Camera Flip Simulator */}
          <button 
            onClick={() => {
              setPermissionError(!permissionError);
              playTone(500, 0.1, 'sine');
            }}
            className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 transition-transform active:scale-95"
            title="Switch Mode Simulator"
          >
            <RefreshCw size={20} className="animate-[spin_20s_linear_infinite]" />
          </button>
        </div>
      </div>
    </div>
  );
}
