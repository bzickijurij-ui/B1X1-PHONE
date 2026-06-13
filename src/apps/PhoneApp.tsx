import React, { useState } from 'react';
import { Phone, MessageSquare, Send, Delete, UserCheck, X, Volume2, Sparkles } from 'lucide-react';
import { playDialTone, playTone, playTapSound } from '../utils/audio';

interface PhoneAppProps {
  theme?: 'light' | 'dark';
}

export default function PhoneApp({ theme = 'dark' }: PhoneAppProps) {
  const [activeTab, setActiveTab] = useState<'dialer' | 'messenger'>('dialer');
  
  // Dialer states
  const [typedNumber, setTypedNumber] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('Набір номера...');
  const [isEasterEgg, setIsEasterEgg] = useState(false);

  // Chat message states
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'b1x1'; text: string; time: string }>>([
    { sender: 'b1x1', text: 'Привіт! Я твій інтелектуальний асистент B1X1 OS. Чим я можу допомогти?', time: '12:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  const handleKeyPress = (num: string) => {
    playDialTone(num);
    const nextVal = typedNumber + num;
    setTypedNumber(nextVal);

    if (nextVal === '67') {
      setIsEasterEgg(true);
      playTone(150, 0.4, 'sawtooth');
      
      const synthInt = setInterval(() => {
        playTone(Math.random() * 320 + 90, 0.15, 'sawtooth');
      }, 200);

      setTimeout(() => {
        clearInterval(synthInt);
        setIsEasterEgg(false);
        setTypedNumber('');
        playTone(880, 0.25, 'sine');
      }, 10000);
    }
  };

  const handleBackspace = () => {
    playTapSound();
    setTypedNumber((prev) => prev.slice(0, -1));
  };

  const handleStartCall = () => {
    if (!typedNumber) return;
    playTone(400, 0.2, 'sine');
    setInCall(true);
    setCallStatus('Дзвінок...');

    // Simulate ringtone details
    let ringInterval = setInterval(() => {
      playTone(425, 0.5, 'sine');
    }, 1500);

    // After 4 seconds, fake connect call
    setTimeout(() => {
      clearInterval(ringInterval);
      setCallStatus('З\'єднано (Служба Підтримки OS)');
      
      // Voice simulation welcome pitch
      playTone(660, 0.1, 'sine');
      setTimeout(() => playTone(880, 0.1, 'sine'), 80);
      setTimeout(() => playTone(1200, 0.2, 'sine'), 160);
    }, 3500);

    (window as any)._callTimer = setTimeout(() => {
      setCallStatus('Дзвінок завершено');
      setTimeout(() => {
        setInCall(false);
      }, 1500);
    }, 12000);
  };

  const handleEndCall = () => {
    playTone(300, 0.3, 'sine');
    clearTimeout((window as any)._callTimer);
    setInCall(false);
  };

  // Messenger logic
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    playTone(800, 0.05, 'sine');

    // Simulate response delay
    setTimeout(() => {
      let replyText = 'Я зафіксував ваш запит по B1X1 OS! Створена система працює з надзвичайною швидкістю іконок та One UI 7 анімаціями.';
      
      const q = userMsg.text.toLowerCase();
      if (q.includes('привіт') || q.includes('hello')) {
        replyText = 'Привіт! Радий бачити тебе в системі B1X1 OS. Спробуй налаштувати кольори іконок!';
      } else if (q.includes('камера') || q.includes('галере')) {
        replyText = 'Дозволи на Камеру налаштовані чудово! Всі зроблені фотознімки попадають прямо до Галереї.';
      } else if (q.includes('анімац')) {
        replyText = 'Анімації на вибір: One UI 7 (масштабування в іконку) або iOS 18 (пружні гумові рухи). Можна змінити швидкість від 0.5x до 2.0x!';
      } else if (q.includes('темна') || q.includes('тема')) {
        replyText = 'Система підтримує справжній темний режим. Змінити можна в Параметрах або шторці керування!';
      } else if (q.includes('хто розробник') || q.includes('автор')) {
        replyText = 'Розробник цього чудового тесту OS — Юра Білицький! Дякую за чудові ідеї♥️';
      }

      const assistantMsg = {
        sender: 'b1x1' as const,
        text: replyText,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      playTone(1100, 0.08, 'sine');
    }, 1200);
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'light' ? 'bg-slate-50 text-slate-900 border border-slate-200/50' : 'bg-zinc-950 text-white'} rounded-3xl overflow-hidden relative select-none font-sans transition-all ${isEasterEgg ? 'animate-shake-crazy border-4 border-red-650' : ''}`} id="phone_app_root">
      
      {/* EASTER EGG FULLSCREEN SHAKE OVERLAY */}
      {isEasterEgg && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-6 animate-pulse select-none">
          <div className="absolute inset-0 bg-red-950/25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/60 via-black to-black pointer-events-none" />
          
          <div className="z-10 space-y-4">
            <h1 className="text-7xl font-black font-display text-red-500 tracking-tighter drop-shadow-[0_0_35px_rgba(239,68,68,0.9)] animate-bounce select-none">
              67!!!
            </h1>
            <p className="text-[11px] font-mono text-zinc-300 font-bold uppercase tracking-widest animate-pulse">
              🚨 СИСТЕМНИЙ ЗБІЙ B1X1 OS 🚨
            </p>
            <div className="w-16 h-1.5 bg-red-600 mx-auto rounded-full animate-ping" />
            <p className="text-[9.5px] text-zinc-400 font-mono tracking-wide max-w-[210px] mx-auto leading-relaxed uppercase pt-3">
              ЕМУЛЯТОР ЕКРАНУ ПОЧАВ ТРУСИТИСЯ! ВІДНОВЛЕННЯ ЧЕРЕЗ 10 СЕКУНД.
            </p>
          </div>
        </div>
      )}

      {/* Header Tabs switcher */}
      <div className={`h-14 flex items-center justify-between px-6 border-b shrink-0 transition-colors ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Мобільна Служба B1X1</span>
        <div className={`flex p-1 rounded-xl transition-colors ${theme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'}`}>
          <button
            onClick={() => {
              setActiveTab('dialer');
              playTone(600, 0.04, 'sine');
            }}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${
              activeTab === 'dialer' 
                ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-zinc-900 text-white') 
                : (theme === 'light' ? 'text-slate-500' : 'text-zinc-500')
            }`}
          >
            Дзвонилка
          </button>
          <button
            onClick={() => {
              setActiveTab('messenger');
              playTone(600, 0.04, 'sine');
            }}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${
              activeTab === 'messenger' 
                ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-zinc-900 text-white') 
                : (theme === 'light' ? 'text-slate-500' : 'text-zinc-500')
            }`}
          >
            Повідомлення
          </button>
        </div>
      </div>

      {activeTab === 'dialer' ? (
        /* DIALER TAB VIEW */
        <div className="flex-1 flex flex-col justify-between p-6 pb-8 min-h-0">
          
          {/* Dialer Screen Display */}
          <div className="flex flex-col items-center justify-center p-3 h-24 text-center">
            <span className="text-2xl font-display font-semibold tracking-wider text-amber-500 truncate max-w-full">
              {typedNumber || 'Введіть номер'}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 mt-1 uppercase">Режим дзвінка B1X1</span>
          </div>

          {/* Keypad standard grids */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
            {keys.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer border transition-all ${
                  theme === 'light' 
                    ? 'bg-slate-200/60 hover:bg-slate-200 active:scale-95 border-slate-350 text-slate-800' 
                    : 'bg-zinc-900 hover:bg-zinc-800 active:scale-95 border-zinc-850 text-white'
                }`}
              >
                <span className="text-xl font-bold font-display">{key}</span>
                <span className="text-[7px] text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-widest leading-none mt-0.5">
                  {key === '1' ? 'o_o' : key === '2' ? 'abc' : key === '3' ? 'def' : key === '4' ? 'ghi' : key === '5' ? 'jkl' : key === '6' ? 'mno' : key === '7' ? 'pqrs' : key === '8' ? 'tuv' : key === '9' ? 'wxyz' : ' '}
                </span>
              </button>
            ))}
          </div>

          {/* Controls call & delete row */}
          <div className="flex items-center justify-between px-8 mt-5 shrink-0">
            <div className="w-14 h-14" /> {/* empty space spacer */}

            {/* CALL BUTTON */}
            <button
              onClick={handleStartCall}
              disabled={!typedNumber}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                typedNumber 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 cursor-pointer' 
                  : (theme === 'light' ? 'bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed' : 'bg-zinc-800 text-zinc-650 opacity-40 cursor-not-allowed')
              }`}
            >
              <Phone size={22} className="text-white fill-white" />
            </button>

            {/* BACKSPACE BUTTON */}
            <button
              onClick={handleBackspace}
              disabled={!typedNumber}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                typedNumber 
                  ? (theme === 'light' ? 'hover:bg-slate-200 text-slate-700 cursor-pointer' : 'hover:bg-zinc-900 text-zinc-300 cursor-pointer') 
                  : 'text-zinc-400 opacity-30 cursor-not-allowed'
              }`}
            >
              <Delete size={20} />
            </button>
          </div>

          {/* SIMULATED CONNECTED CALL VIEW OVERLAY */}
          {inCall && (
            <div className="absolute inset-0 bg-zinc-950/95 z-50 flex flex-col justify-between p-8 text-center animate-fade-in font-sans">
              
              <div className="pt-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 mx-auto flex items-center justify-center shadow-lg uppercase font-bold text-2xl font-mono text-black">
                  {typedNumber.slice(-2) || 'OS'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-wider">{typedNumber}</h3>
                  <p className="text-xs text-amber-500 font-mono tracking-widest uppercase">{callStatus}</p>
                </div>
              </div>

              {/* Status active simulation */}
              <div className="py-8 text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-mono">
                Виклик направлено через хмарний сервер B1X1 OS Link.
              </div>

              {/* Call Hang Up */}
              <div className="pb-8">
                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-650 flex items-center justify-center mx-auto transition-transform active:scale-90 cursor-pointer shadow-lg shadow-red-500/20"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* MESSENGER CHATBOT TAB VIEW */
        <div className={`flex-1 flex flex-col justify-between min-h-0 ${theme === 'light' ? 'bg-slate-100/50' : 'bg-zinc-900/40'}`}>
          
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  m.sender === 'user' ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start animate-fade-in'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-snug shadow-sm text-left ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-black rounded-tr-none font-medium shadow-sm shadow-amber-500/10'
                    : (theme === 'light' 
                        ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200' 
                        : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-750')
                }`}>
                  {m.text}
                </div>
                <span className="text-[8px] text-zinc-400 font-mono mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Form write fields inputs */}
          <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 transition-colors ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-zinc-900 border-zinc-800'}`}>
            <input
              type="text"
              placeholder="Введіть повідомлення..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                theme === 'light' 
                  ? 'border-slate-350 bg-white text-slate-850 placeholder-slate-400' 
                  : 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-650'
              }`}
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center justify-center transition-transform active:scale-95 shrink-0 cursor-pointer shadow-md shadow-amber-400/10"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
