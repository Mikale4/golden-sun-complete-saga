// ---------- Engine: loop, scene stack, transitions ----------
'use strict';
const Engine = {
  canvas: null, g: null, scenes: [], fade: 0, fadeDir: 0, fadeCol: '#000000', fadeCb: null, frame: 0, shake: 0, flash: 0, flashCol: '#ffffff', paused: false,
  init() {
    this.canvas = document.getElementById('screen');
    this.g = this.canvas.getContext('2d'); this.g.imageSmoothingEnabled = false;
    if (typeof Touch !== 'undefined') Touch.init();   // the on-screen pad, on a phone or tablet: built before the first resize, which leaves room for it
    this.resize(); window.addEventListener('resize', () => this.resize()); window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120));
    Input.init(this.canvas); Font.init(); Tiles.init(); TileSheets.loadAll(); if (typeof AssetFiles !== 'undefined' && !/[?&]export=assets/.test(location.search)) AssetFiles.loadAll();   /* the export writes the code-drawn art, so it must not load the files first */ Audio.init();
    this.last = performance.now(); this.acc = 0;
    requestAnimationFrame(t => this.loop(t));
    // keep simulating at full speed while the tab is hidden: rAF pauses and page timers get throttled to ~1 Hz, but a
    // Worker's timer keeps ticking, so let it drive the loop whenever the page is hidden
    try {
      const w = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 1000 / 60);'], { type: 'application/javascript' })));
      w.onmessage = () => { if (document.hidden) { this.last = performance.now(); this.step(); this.draw(); } };
    } catch (e) { setInterval(() => { if (document.hidden) { this.last = performance.now(); this.step(); this.draw(); } }, 1000 / 60); }
  },
  resize() {
    // on a touch screen the pad takes a band along the bottom (portrait) and the picture is scaled in half steps so
    // it fills a narrow screen instead of sitting tiny in the middle of it
    const pad = (typeof Touch !== 'undefined' && Touch.on) ? Touch.layout() : 0;
    const ww = window.innerWidth, wh = window.innerHeight - (pad || 30);
    const fit = Math.min(ww / SCREEN_W, wh / SCREEN_H);
    const s = (typeof Touch !== 'undefined' && Touch.on) ? Math.max(1, Math.floor(fit * 2) / 2) : Math.max(1, Math.floor(fit));
    this.canvas.style.width = (SCREEN_W * s) + 'px'; this.canvas.style.height = (SCREEN_H * s) + 'px';
  },
  push(scene) { this.scenes.push(scene); if (scene.enter) scene.enter(); Input.clear(); },
  pop() { const s = this.scenes.pop(); if (s && s.exit) s.exit(); const top = this.top; if (top && top.resume) top.resume(); Input.clear(); return s; },
  replace(scene) { const s = this.scenes.pop(); if (s && s.exit) s.exit(); this.push(scene); },
  get top() { return this.scenes[this.scenes.length - 1]; },
  // Fade: dir -1 = fade to black, +1 = fade in. Returns condition fn
  fadeOut(frames, col) { this.fadeCol = col || '#000000'; this.fadeDir = -1; this.fadeSpeed = 1 / (frames || 20); return () => this.fade >= 1; },
  fadeIn(frames) { this.fadeDir = 1; this.fadeSpeed = 1 / (frames || 20); return () => this.fade <= 0; },
  loop(now) {
    // the next frame is asked for first: an error in a step or a draw is logged (and counted), never a frozen game
    requestAnimationFrame(t => this.loop(t));
    try {
      const dt = Math.min(100, now - this.last); this.last = now; this.acc += dt;
      let steps = 0;
      while (this.acc >= 1000 / 60 && steps < 4) { this.acc -= 1000 / 60; this.step(); steps++; }
      this.draw();
    } catch (e) { this.errors = (this.errors || 0) + 1; this.lastError = (e && e.stack) || String(e); if (this.errors <= 20 || this.errors % 600 === 0) console.error('frame error #' + this.errors, e); }
  },
  // debug: advance n frames synchronously
  stepN(n) { for (let i = 0; i < n; i++) this.step(); this.draw(); },
  step() {
    this.frame++; Input.update(); UI.update();
    if (Input.pressed('mute')) Audio.toggleMute();
    if (this.fadeDir < 0) { this.fade = Math.min(1, this.fade + this.fadeSpeed); if (this.fade >= 1) this.fadeDir = 0; }
    else if (this.fadeDir > 0) { this.fade = Math.max(0, this.fade - this.fadeSpeed); if (this.fade <= 0) this.fadeDir = 0; }
    if (this.shake > 0) this.shake--;
    if (this.flash > 0) this.flash--;
    // update top scene (and those flagged updateBelow)
    for (let i = this.scenes.length - 1; i >= 0; i--) { const s = this.scenes[i]; if (i === this.scenes.length - 1 || s.updateBelow) { if (s.update) s.update(); } if (!s.updateBelow && i !== this.scenes.length - 1) break; if (i === this.scenes.length - 1 && !s.updateBelow) break; }

    if (this.afterStep) this.afterStep(); // automation hook (runner real-time mode)
  },
  draw() {
    const g = this.g;
    g.save();
    if (this.shake > 0) g.translate(rnd(5) - 2, rnd(5) - 2);
    g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    // find lowest opaque scene
    let start = this.scenes.length - 1; while (start > 0 && this.scenes[start].transparent) start--;
    for (let i = start; i < this.scenes.length; i++) { const s = this.scenes[i]; if (s.draw) s.draw(g); }
    g.restore();
    if (this.flash > 0) { g.fillStyle = this.flashCol; g.globalAlpha = Math.min(1, this.flash / 6); g.fillRect(0, 0, SCREEN_W, SCREEN_H); g.globalAlpha = 1; }
    if (this.fade > 0) { g.fillStyle = this.fadeCol; g.globalAlpha = this.fade; g.fillRect(0, 0, SCREEN_W, SCREEN_H); g.globalAlpha = 1; }
    if (this.afterDraw) this.afterDraw(g);   // tools that draw over the frame (the world editor's marks)
  },
  doShake(n) { this.shake = n || 12; },
  doFlash(n, col) { this.flash = n || 8; this.flashCol = col || '#ffffff'; }
};

// Global game state container
const G = {
  flags: {}, party: null, inventory: null, coins: 0, map: null, playtime: 0, chapter: 0, game: 1, // game: 1 = GS1 half, 2 = TLA half
  quick: {}, // quick Psynergy slots: { q1: name, q2: name } (A / S keys on the field)
  flag(k) { return !!this.flags[k]; }, set(k, v) { this.flags[k] = v === undefined ? true : v; if (this.field && this.field.map && typeof v !== 'object') this.field.refreshNpcs(); }, get(k) { return this.flags[k]; },
  count(k, n) { this.flags[k] = (this.flags[k] || 0) + (n || 1); return this.flags[k]; }
};
