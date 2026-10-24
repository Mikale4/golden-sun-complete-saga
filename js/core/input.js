// ---------- Input (keyboard + gamepad) ----------
'use strict';
const Input = {
  keys: {}, prev: {}, cur: {}, latch: {},
  // Keyboard: arrows move, Z/Enter confirm, X/Esc cancel/menu, C Psynergy, A/S quick Psynergy, Space challenge a traveler, F fullscreen, M mute
  map: {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyZ: 'a', Enter: 'a', NumpadEnter: 'a',
    KeyX: 'b', Escape: 'b',
    KeyC: 'r',
    KeyA: 'q1', KeyS: 'q2',
    KeyF: 'fs', KeyM: 'mute',
    Space: 'select'
  },
  keyMap: { Enter: 'a', z: 'a', Z: 'a', x: 'b', X: 'b', Escape: 'b', c: 'r', C: 'r', a: 'q1', A: 'q1', s: 'q2', S: 'q2', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', m: 'mute', M: 'mute' },
  keyOf(e) { return this.map[e.code] || this.keyMap[e.key]; },
  init(canvas) {
    window.addEventListener('keydown', e => {
      const k = this.keyOf(e); if (k) { if (!this.keys[k]) this.latch[k] = true; this.keys[k] = true; if (e.code !== 'F5' && e.code !== 'F12') e.preventDefault(); }
      if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    });
    window.addEventListener('keyup', e => { const k = this.keyOf(e); if (k) this.keys[k] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
  },
  toggleFullscreen() {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); document.body.classList.add('fs'); }
    else { document.exitFullscreen && document.exitFullscreen(); document.body.classList.remove('fs'); }
  },
  pollGamepad() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gps && gps[0]; if (!gp) return;
    const b = i => gp.buttons[i] && gp.buttons[i].pressed;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    this.gpk = {
      up: b(12) || ay < -0.5, down: b(13) || ay > 0.5, left: b(14) || ax < -0.5, right: b(15) || ax > 0.5,
      a: b(0) || b(2), b: b(1), r: b(5) || b(3), l: b(4), select: b(8) || b(9)
    };
  },
  gpk: {},
  update() {
    this.pollGamepad();
    this.prev = this.cur; this.cur = {};
    for (const k of ['up', 'down', 'left', 'right', 'a', 'b', 'r', 'l', 'q1', 'q2', 'select', 'mute'])
      this.cur[k] = !!((this.keys[k] || this.gpk[k] || this.latch[k]) && (!this.blocked || k === 'mute'));   /* blocked: the demo is playing (mute still works) */
    this.latch = {};
    for (const k in this.holdT) { if (this.holdT[k] > 0) { this.cur[k] = true; this.holdT[k]--; } }
    // Repeat timers for menu navigation
    for (const k of ['up', 'down', 'left', 'right']) {
      if (this.cur[k]) { this.rep[k] = (this.rep[k] || 0) + 1; } else this.rep[k] = 0;
    }
  },
  rep: {}, holdT: {}, blocked: false,
  // debug/automation helper: hold a key for N frames
  hold(k, frames) { this.holdT[k] = frames || 10; },
  held(k) { return !!this.cur[k]; },
  pressed(k) { return !!this.cur[k] && !this.prev[k]; },
  // pressed OR auto-repeat (for menus)
  repeat(k) { const r = this.rep[k] || 0; return r === 1 || (r > 14 && (r - 14) % 4 === 0); },
  dirPressed() { for (let d = 0; d < 4; d++) if (this.pressed(DIRNAME[d])) return d; return -1; },
  dirHeld() { if (this.held('down')) return 0; if (this.held('left')) return 1; if (this.held('right')) return 2; if (this.held('up')) return 3; return -1; },
  dirRepeat() { for (let d = 0; d < 4; d++) if (this.repeat(DIRNAME[d])) return d; return -1; },
  clear() { this.latch = {}; }
};
