import { useSyncExternalStore } from "react";
import { SOUNDS } from "./media.js";

// One shared audio engine for the whole game, kept outside React so that only one
// AudioContext ever exists. Recorded sounds and synthesized effects share a master bus.
let ctx = null;
let master = null;
let drone = null;
let muted = true;

const decoded = {};
const downloads = {};
let decoding = null;

// Resolves once every sound is decoded, or straight away if sound was never turned on.
export const soundsReady = () => decoding ?? Promise.resolve();

export function preloadAudio() {
  for (const [name, url] of Object.entries(SOUNDS)) {
    if (downloads[name]) continue;
    downloads[name] = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return response.arrayBuffer();
      })
      .catch(() => null);
  }
}

async function decodeSounds() {
  preloadAudio();
  for (const name of Object.keys(SOUNDS)) {
    try {
      const data = await downloads[name];
      if (data) decoded[name] = await ctx.decodeAudioData(data);
    } catch {
      // a sound that fails to decode just stays silent
    }
  }
  if (decoded.ambience) {
    const source = ctx.createBufferSource();
    source.buffer = decoded.ambience;
    source.loop = true;
    source.connect(drone);
    source.start();
  }
}

function audioInit() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // background ambience plays on its own bus
    drone = ctx.createGain();
    drone.gain.value = 0.7;
    drone.connect(master);
    decoding = decodeSounds();
  } catch {
    ctx = null;
  }
}

/* ---------- the sound state React components subscribe to ---------- */
let state = { muted: true, unavailable: false };
const listeners = new Set();
const setState = (next) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useAudioState = () => useSyncExternalStore(subscribe, () => state);
export const isMuted = () => muted;

export function toggleMute() {
  audioInit();
  if (!ctx) {
    setState({ unavailable: true });
    return;
  }
  ctx.resume?.();
  muted = !muted;
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.3);
  setState({ muted });
}

// The first key press or click on the title screen turns sound on.
export function unlockAudio() {
  audioInit();
  if (ctx && muted) toggleMute();
}

export function setDroneLevel(level, timeConstant) {
  if (drone && ctx) drone.gain.setTargetAtTime(level, ctx.currentTime, timeConstant);
}

// `delay` is in seconds, on the audio clock, so it stays exact whatever the page is doing.
export function play(name, vol = 1, offset = 0, delay = 0) {
  if (!ctx || muted || !decoded[name]) return null;
  const src = ctx.createBufferSource();
  src.buffer = decoded[name];
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(master);
  src.start(delay ? ctx.currentTime + delay : 0, offset);
  return src;
}

/* ---------- synthesized effects ---------- */
export function noiseBurst(dur, freq, q, vol){
  if (!ctx || muted) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.sin(Math.PI * i/len);
  const src = ctx.createBufferSource(); src.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master); src.start();
}
export const whisper = () => noiseBurst(.9 + Math.random()*.6, 1800 + Math.random()*1500, 3, .5);
export const hiss = () => noiseBurst(.5, 4200, 1, .9);
export const scrape = () => noiseBurst(.45, 260, 1.2, 1.2);
export const thud = () => { if(!ctx||muted) return; const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.setValueAtTime(90,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(30,ctx.currentTime+.5); g.gain.setValueAtTime(.8,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.6); o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime+.6); };

export const ding = () => {
  if (!ctx || muted) return;
  [[1046,0],[784,.35]].forEach(([f,d]) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + d;
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + 1.4);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.5);
  });
};
export const tick = () => {
  if (!ctx || muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = "triangle"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(260, t + .06);
  g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .09);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + .1);
};
export const thunder = () => noiseBurst(2.2, 90, .7, 2.2);

// the felt feet dragging across the wood
export function slide(){
  if (!ctx || muted) return;
  const t = ctx.currentTime, len = Math.floor(ctx.sampleRate * .9), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++){ const env = Math.sin(Math.PI * i / len); d[i] = (Math.random() * 2 - 1) * env * env; }
  const src = ctx.createBufferSource(); src.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 520; f.Q.value = .9;
  const g = ctx.createGain(); g.gain.value = .3;
  src.connect(f); f.connect(g); g.connect(master); src.start(t);
}
