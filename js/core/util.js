// ---------- Utility helpers ----------
'use strict';
const SCREEN_W = 240, SCREEN_H = 160, TILE = 16;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(n) { return Math.floor(Math.random() * n); }
function rndRange(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
function sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function pad(n, w, ch) { let s = String(n); while (s.length < w) s = (ch || ' ') + s; return s; }
function fmtNum(n) { return String(Math.floor(n)); }
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgbToHex(r, g, b) { const c = v => ('0' + clamp(Math.round(v), 0, 255).toString(16)).slice(-2); return '#' + c(r) + c(g) + c(b); }
function shade(hex, f) { const [r, g, b] = hexToRgb(hex); return rgbToHex(r * f, g * f, b * f); }
function tint(hex, f) { const [r, g, b] = hexToRgb(hex); return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }

// Seeded PRNG (mulberry32) for deterministic procedural art / maps
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Direction helpers
const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
const DX = [0, -1, 1, 0], DY = [1, 0, 0, -1];
const DIRNAME = ['down', 'left', 'right', 'up'];
function oppDir(d) { return [3, 2, 1, 0][d]; }

// Element constants (order used throughout: Venus, Mercury, Mars, Jupiter)
const EL = { VENUS: 0, MERCURY: 1, MARS: 2, JUPITER: 3, NONE: 4 };
const ELNAME = ['Venus', 'Mercury', 'Mars', 'Jupiter', 'None'];
const ELCOLOR = ['#e8c040', '#50a8f0', '#f05030', '#c070f0', '#cccccc'];
const ELCHAR = { E: 0, W: 1, F: 2, A: 3, N: 4 };

// Simple event emitter / timer list
class Timers {
  constructor() { this.list = []; }
  add(t, fn) { this.list.push({ t, fn }); }
  update(dt) { for (let i = this.list.length - 1; i >= 0; i--) { const e = this.list[i]; e.t -= dt; if (e.t <= 0) { this.list.splice(i, 1); e.fn(); } } }
  clear() { this.list.length = 0; }
}

// Cooperative coroutine helper: generator-based sequencing for cutscenes/battle animation.
// yield N  -> wait N frames; yield promise-like {done:()=>bool} -> wait until done.
class Coroutine {
  constructor(gen) { this.gen = gen; this.wait = 0; this.cond = null; this.done = false; }
  update() {
    if (this.done) return true;
    if (this.wait > 0) { this.wait--; return false; }
    if (this.cond) { if (!this.cond()) return false; this.cond = null; }
    const r = this.gen.next();
    if (r.done) { this.done = true; return true; }
    const v = r.value;
    if (typeof v === 'number') this.wait = Math.max(0, v - 1);
    else if (typeof v === 'function') this.cond = v;
    else if (v && typeof v.update === 'function') { const sub = v; this.cond = () => sub.update(); }
    return false;
  }
}
