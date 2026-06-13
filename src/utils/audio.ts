// Audio engine for system UI tones, dialing beeps, and music generator
let audioCtx: AudioContext | null = null;
let systemVolume = 0.5;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSystemVolume(vol: number) {
  systemVolume = Math.max(0, Math.min(1, vol));
}

export function getSystemVolume() {
  return systemVolume;
}

// Low level tone generator
export function playTone(freq: number, duration: number, type: OscillatorType = 'sine', clickEffect = false) {
  if (systemVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Initial gain control to prevent popping
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    if (clickEffect) {
      gainNode.gain.exponentialRampToValueAtTime(systemVolume * 0.15, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    } else {
      gainNode.gain.linearRampToValueAtTime(systemVolume * 0.25, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + duration);
    }

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context init fail or permission issue:", e);
  }
}

// Tactical tap sound
export function playTapSound() {
  playTone(850, 0.06, 'sine', true);
}

let transitionSoundsEnabled = true;

export function setTransitionSoundsEnabled(enabled: boolean) {
  transitionSoundsEnabled = enabled;
}

// App launch sound (Whoosh pitch up)
export function playLaunchSound() {
  if (!transitionSoundsEnabled) return;
  if (systemVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.18);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(systemVolume * 0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

// App close sound (Whoosh pitch down)
export function playCloseSound() {
  if (!transitionSoundsEnabled) return;
  if (systemVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(systemVolume * 0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

// Lock screen chime
export function playLockChime() {
  playTone(330, 0.12, 'sine');
  setTimeout(() => playTone(220, 0.15, 'sine'), 100);
}

// Unlock screen chime
export function playUnlockChime() {
  playTone(220, 0.12, 'sine');
  setTimeout(() => playTone(330, 0.15, 'sine'), 100);
}

// Keypad tone dial frequencies standard DTMF representation
const DTMF_FREQS_ROW = [697, 770, 852, 941];
const DTMF_FREQS_COL = [1209, 1336, 1477];

export function playDialTone(key: string) {
  if (systemVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    let rIdx = -1, cIdx = -1;

    if (['1', '2', '3'].includes(key)) rIdx = 0;
    else if (['4', '5', '6'].includes(key)) rIdx = 1;
    else if (['7', '8', '9'].includes(key)) rIdx = 2;
    else if (['*', '0', '#'].includes(key)) rIdx = 3;

    if (['1', '4', '7', '*'].includes(key)) cIdx = 0;
    else if (['2', '5', '8', '0'].includes(key)) cIdx = 1;
    else if (['3', '6', '9', '#'].includes(key)) cIdx = 2;

    if (rIdx === -1 || cIdx === -1) {
      // fallback tone
      playTone(600, 0.15, 'sine');
      return;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    const gainNode2 = ctx.createGain();

    osc1.frequency.value = DTMF_FREQS_ROW[rIdx];
    osc2.frequency.value = DTMF_FREQS_COL[cIdx];

    osc1.connect(gainNode1);
    osc2.connect(gainNode2);

    const out = ctx.createGain();
    gainNode1.connect(out);
    gainNode2.connect(out);
    out.connect(ctx.destination);

    out.gain.setValueAtTime(systemVolume * 0.15, ctx.currentTime);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

// Melody synthesis
let synthInterval: any = null;
export function startSimulatedBeat(onStep: (step: number) => void) {
  if (systemVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (synthInterval) clearInterval(synthInterval);

    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major
    let step = 0;

    synthInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * melody.length);
      const freq = melody[idx];
      // Play note
      playTone(freq, 0.25, 'triangle');
      onStep(step);
      step = (step + 1) % 8;
    }, 300);
  } catch (e) {}
}

export function stopSimulatedBeat() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}
