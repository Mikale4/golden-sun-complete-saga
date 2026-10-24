// ---------- Touch controls: the pad a phone or tablet plays with ----------
// The game is played with the keyboard and the pad; a touch screen has neither, so this draws a d-pad and the
// buttons over the page and feeds them into Input exactly as a key would (Input.keys + the latch that makes a
// press an edge). It appears only on a touch screen - ?touch=1 forces it on for testing, ?touch=0 off.
// In portrait the pad takes a band along the bottom and the screen sits above it; in landscape it lies over the
// corners, where the thumbs already are. Engine.resize asks Touch.layout() how much room the band wants.
'use strict';
const Touch = {
  on: false, el: null, h: 0, zones: [], held: new Map(),   // held: pointer id -> the key it is holding
  // the buttons, in the order they are built: [key, label, class]
  BUTTONS: [['b', 'X', 'b'], ['a', 'Z', 'a'], ['r', 'C', 'r']],
  EXTRAS: [['q1', 'A'], ['q2', 'S'], ['select', '!']],
  wanted() {
    const q = location.search;
    if (/[?&]touch=1/.test(q)) return true; if (/[?&]touch=0/.test(q)) return false;
    return (navigator.maxTouchPoints || 0) > 0 || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
  },
  init() {
    if (this.on || !this.wanted()) return; this.on = true;
    document.body.classList.add('touch');
    const pad = this.el = document.createElement('div'); pad.id = 'pad';
    const dpad = document.createElement('div'); dpad.id = 'dpad';
    for (const d of ['up', 'left', 'right', 'down']) { const z = document.createElement('div'); z.className = 'd ' + d; z.dataset.key = d; dpad.appendChild(z); }
    dpad.appendChild(Object.assign(document.createElement('div'), { className: 'd hub' }));
    pad.appendChild(dpad);
    const btns = document.createElement('div'); btns.id = 'btns';
    for (const [key, label, cls] of this.BUTTONS) { const b = document.createElement('div'); b.className = 'btn ' + cls; b.dataset.key = key; b.textContent = label; btns.appendChild(b); }
    pad.appendChild(btns);
    const ex = document.createElement('div'); ex.id = 'extras';
    for (const [key, label] of this.EXTRAS) { const b = document.createElement('div'); b.className = 'mini'; b.dataset.key = key; b.textContent = label; ex.appendChild(b); }
    for (const [act, label] of [['fs', '[ ]'], ['mute', 'M']]) { const b = document.createElement('div'); b.className = 'mini'; b.dataset.act = act; b.textContent = label; ex.appendChild(b); }
    pad.appendChild(ex);
    document.body.appendChild(pad);
    this.zones = [...pad.querySelectorAll('[data-key]')];
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) pad.addEventListener(ev, (e) => this.handle(e), { passive: false });
    window.addEventListener('contextmenu', (e) => { if (this.on && e.target.closest && e.target.closest('#pad')) e.preventDefault(); });
    this.layout();
  },
  // which control is under a point (the d-pad's zones overlap its hub, so the list order decides)
  at(x, y) { for (const z of this.zones) { const r = z.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z; } return null; },
  press(key, down) {
    if (!key) return;
    if (down) { if (!Input.keys[key]) Input.latch[key] = true; Input.keys[key] = true; } else Input.keys[key] = false;
  },
  handle(e) {
    e.preventDefault();
    const id = e.pointerId;
    if (e.type === 'pointerup' || e.type === 'pointercancel') { this.press(this.held.get(id), false); this.held.delete(id); return; }
    if (e.type === 'pointerdown') {
      // the demo plays until somebody touches the screen, as it does until somebody presses a key
      if (typeof Demo !== 'undefined' && Demo.running) { Demo.stop(); return; }
      const t = e.target.closest ? e.target.closest('[data-act]') : null;
      if (t) { const a = t.dataset.act; if (a === 'fs') Input.toggleFullscreen(); else if (a === 'mute' && typeof Audio !== 'undefined') Audio.toggleMute(); return; }
      try { this.el.setPointerCapture(id); } catch (x) { }
    }
    if (e.type === 'pointermove' && !this.held.has(id)) return;   // a finger that started on nothing stays on nothing
    const z = this.at(e.clientX, e.clientY); const key = z && z.dataset.key;
    const was = this.held.get(id);
    if (was === key) return;
    this.press(was, false);                                        // a thumb sliding from one button to the next
    if (key) { this.press(key, true); this.held.set(id, key); } else this.held.delete(id);
  },
  // the room the pad wants under the screen (portrait only; in landscape it lies over the corners) - called by Engine.resize
  layout() {
    if (!this.on) return 0;
    const w = window.innerWidth, h = window.innerHeight; const portrait = h > w;
    document.body.classList.toggle('portrait', portrait);
    const band = portrait ? Math.round(Math.min(h * 0.38, Math.max(200, w * 0.62))) : 0;
    this.h = band;
    document.documentElement.style.setProperty('--pad-h', band + 'px');
    return band;
  },
  // every key the pad is holding, let go of (a scene change, a lost touch)
  release() { for (const k of this.held.values()) this.press(k, false); this.held.clear(); }
};
