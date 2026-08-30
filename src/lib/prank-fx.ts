/**
 * Tiny zero-dependency feedback layer for the runaway button:
 * WebAudio blips + haptics. Everything degrades silently.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, duration: number, gain: number, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.6), ac.currentTime + duration);
  amp.gain.setValueAtTime(0.0001, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

/** Short whoosh each time the button dodges. Pitch rises with panic level. */
export function playDodge(intensity: number) {
  blip(420 + intensity * 380, 0.1, 0.05, "triangle");
}

/** Little confirmation when a field becomes valid. */
export function playUnlock() {
  blip(660, 0.12, 0.05);
  window.setTimeout(() => blip(880, 0.16, 0.045), 90);
}

/** Warm chord when the button finally surrenders. */
export function playSettle() {
  [523.25, 659.25, 783.99].forEach((f, i) => window.setTimeout(() => blip(f, 0.32, 0.04), i * 70));
}

export function playError() {
  blip(180, 0.24, 0.06, "sawtooth");
}

export function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
