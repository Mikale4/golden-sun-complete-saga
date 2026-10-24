// ---------- UI widgets: windows, textbox, menus (Golden Sun style) ----------
'use strict';
const UI = {
  cursorCache: null, blink: 0,
  window(g, x, y, w, h, opts) {
    opts = opts || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const sk = UI.skin || {};
    const c0 = opts.c0 || sk.c0 || '#2048b0', c1 = opts.c1 || sk.c1 || '#102060';
    // rounded body
    g.fillStyle = opts.border || sk.border || '#f0f0f8';
    g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
    const inner = Gfx.canvas ? null : null;
    for (let i = 0; i < h - 4; i++) { g.fillStyle = mix(c0, c1, i / Math.max(1, h - 5)); g.fillRect(x + 2, y + 2 + i, w - 4, 1); }
    g.fillStyle = opts.border2 || '#8898c8'; g.fillRect(x + 2, y + 2, w - 4, 1); g.fillRect(x + 2, y + 2, 1, h - 4);
    g.fillStyle = '#081040'; g.fillRect(x + 2, y + h - 3, w - 4, 1); g.fillRect(x + w - 3, y + 2, 1, h - 4);
    if (opts.alpha !== undefined) { }
  },
  // Progress bar (the summon gauge): dark trough with a rim, two-tone fill that grows left to right, flashing gold once full
  gauge(g, x, y, w, h, f, frame) {
    g.fillStyle = '#080c20'; g.fillRect(x, y, w, h);
    g.fillStyle = '#3a4468'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
    const full = f >= 1, fw = Math.round((w - 2) * Math.max(0, Math.min(1, f)));
    if (fw > 0) { const blink = full && ((frame || 0) % 30) < 15; g.fillStyle = full ? (blink ? '#fff0a0' : '#ffd040') : '#2ea8e8'; g.fillRect(x + 1, y + 1, fw, h - 2); g.fillStyle = full ? '#fffbe0' : '#a0f0ff'; g.fillRect(x + 1, y + 1, fw, 1); if (!full) { g.fillStyle = '#1a6aa8'; g.fillRect(x + 1, y + h - 2, fw, 1); } }
    return full;
  },
  panel(g, x, y, w, h) { g.fillStyle = 'rgba(8,16,48,0.85)'; g.fillRect(x, y, w, h); g.fillStyle = '#c0c8e0'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); },
  cursor(g, x, y, col) {
    // small pointing hand / arrow
    const c = col || '#f8f0d0';
    Gfx.rect(g, x, y + 2, 4, 2, c); Gfx.rect(g, x + 4, y + 1, 1, 4, c); Gfx.rect(g, x + 5, y + 2, 1, 2, c); Gfx.px(g, x + 6, y + 3, c);
    Gfx.rect(g, x, y + 4, 4, 1, '#c0a060'); Gfx.px(g, x + 5, y + 4, '#c0a060');
  },
  arrowDown(g, x, y) { const t = (Math.floor(this.blink / 15) % 2); Gfx.tri(g, x - 3, y + t, x + 3, y + t, x, y + 3 + t, '#f8f0d0'); },
  bar(g, x, y, w, h, frac, col, bg) { Gfx.rect(g, x, y, w, h, bg || '#101830'); Gfx.rect(g, x, y, Math.round(w * clamp(frac, 0, 1)), h, col); },
  update() { this.blink++; }
};

// ---- Textbox ----
class Textbox {
  constructor() { this.active = false; this.lines = []; this.page = 0; this.charIdx = 0; this.speed = 2; this.name = ''; this.done = false; this.choice = null; this.choiceIdx = 0; this.result = null; this.portrait = null; this.instant = false; this.y = 100; this.h = 56; this.callback = null; }
  // show text (may contain \n). returns a condition fn for coroutine waiting
  show(text, name, opts) {
    opts = opts || {};
    this.active = true; this.name = name || ''; this.done = false; this.result = null; this.choice = opts.choice || null; this.choiceIdx = 0;
    this.y = opts.top ? 4 : 100; this.h = 56;
    const maxW = SCREEN_W - 28;
    const lines = Font.wrap(text, maxW);
    this.pages = []; for (let i = 0; i < lines.length; i += 3) this.pages.push(lines.slice(i, i + 3));
    if (!this.pages.length) this.pages.push(['']);
    this.page = 0; this.charIdx = 0; this.tick = 0; this.waiting = false;
    return () => this.done;
  }
  pageText() { return this.pages[this.page].join('\n'); }
  pageLen() { return this.pages[this.page].reduce((a, l) => a + l.length, 0); }
  update() {
    if (!this.active) return;
    const fast = Input.held('a') || Input.held('b');
    if (!this.waiting) {
      this.tick++;
      const set = typeof Settings !== 'undefined' ? Settings.textChars() : this.speed; const step = fast ? Math.max(6, set) : set;   // holding A/B hurries the text along
      this.charIdx += step;
      if (this.charIdx >= this.pageLen()) { this.charIdx = this.pageLen(); this.waiting = true; }
      return;
    }
    const lastPage = this.page === this.pages.length - 1;
    if (lastPage && this.choice) {
      if (Input.pressed('up')) { this.choiceIdx = (this.choiceIdx + this.choice.length - 1) % this.choice.length; Audio.sfx('cursor'); }
      if (Input.pressed('down')) { this.choiceIdx = (this.choiceIdx + 1) % this.choice.length; Audio.sfx('cursor'); }
      if (Input.pressed('a')) { this.result = this.choiceIdx; this.active = false; this.done = true; Audio.sfx('confirm'); }
      return;
    }
    if (Input.pressed('a') || Input.pressed('b')) {
      if (lastPage) { this.active = false; this.done = true; }
      else { this.page++; this.charIdx = 0; this.waiting = false; }
    }
  }
  draw(g) {
    if (!this.active) return;
    const x = 4, y = this.y, w = SCREEN_W - 8, h = this.h;
    UI.window(g, x, y, w, h);
    let ty = y + 6;
    if (this.name) { UI.window(g, x + 4, y - 8, Font.width(this.name) + 12, 14, { c0: '#3060c0', c1: '#204090' }); Font.draw(g, this.name, x + 10, y - 5, '#f8f0c0'); ty = y + 8; }
    const lines = this.pages[this.page]; let remain = Math.floor(this.charIdx);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]; const n = Math.min(l.length, remain); remain -= n;
      Font.draw(g, l.slice(0, n), x + 10, ty + i * 12, '#ffffff');
      if (remain <= 0) break;
    }
    if (this.waiting) {
      const lastPage = this.page === this.pages.length - 1;
      if (lastPage && this.choice) {
        const cw = Math.max(60, Math.max(...this.choice.map(c => Font.width(c))) + 24), ch = this.choice.length * 12 + 10, cx = SCREEN_W - cw - 8, cy = y - ch + 2;   // wide enough for the longest name
        UI.window(g, cx, cy, cw, ch);
        this.choice.forEach((c, i) => { Font.draw(g, c, cx + 16, cy + 5 + i * 12, '#ffffff'); if (i === this.choiceIdx) UI.cursor(g, cx + 5, cy + 5 + i * 12); });
      } else UI.arrowDown(g, x + w - 12, y + h - 9);
    }
  }
}

// ---- Generic menu list ----
class MenuList {
  constructor(items, opts) {
    this.items = items || []; this.idx = 0; this.scroll = 0; this.opts = opts || {};
    this.rows = this.opts.rows || 6; this.cols = this.opts.cols || 1; this.x = this.opts.x || 0; this.y = this.opts.y || 0; this.w = this.opts.w || 100; this.colW = this.opts.colW || Math.floor(this.w / this.cols);
    this.lineH = this.opts.lineH || 12; this.wrap = this.opts.wrap !== false; this.active = true; this.cancelled = false; this.chosen = null;
  }
  get count() { return this.items.length; }
  reset(items) { this.items = items; this.idx = Math.min(this.idx, Math.max(0, items.length - 1)); this.chosen = null; this.cancelled = false; this.fixScroll(); }
  fixScroll() { const row = Math.floor(this.idx / this.cols); if (row < this.scroll) this.scroll = row; if (row >= this.scroll + this.rows) this.scroll = row - this.rows + 1; if (this.scroll < 0) this.scroll = 0; }
  update() {
    this.chosen = null; this.cancelled = false;
    if (!this.items.length) { if (Input.pressed('b')) { this.cancelled = true; Audio.sfx('cancel'); } return; }
    const n = this.items.length;
    let moved = false;
    if (Input.repeat('down')) { if (this.idx + this.cols < n) { this.idx += this.cols; moved = true; } else if (this.wrap) { this.idx = this.idx % this.cols; moved = true; } }
    if (Input.repeat('up')) { if (this.idx - this.cols >= 0) { this.idx -= this.cols; moved = true; } else if (this.wrap) { const rows = Math.ceil(n / this.cols); let t = this.idx % this.cols + (rows - 1) * this.cols; if (t >= n) t -= this.cols; this.idx = Math.max(0, t); moved = true; } }
    if (this.cols > 1) {
      if (Input.repeat('right')) { if (this.idx + 1 < n && (this.idx + 1) % this.cols !== 0) { this.idx++; moved = true; } else if (this.wrap) { this.idx -= this.idx % this.cols; moved = true; } }
      if (Input.repeat('left')) { if (this.idx % this.cols !== 0) { this.idx--; moved = true; } else if (this.wrap) { this.idx = Math.min(n - 1, this.idx + this.cols - 1); moved = true; } }
    } else if (this.opts.pageKeys) {
      if (Input.repeat('right')) { this.idx = Math.min(n - 1, this.idx + this.rows); moved = true; }
      if (Input.repeat('left')) { this.idx = Math.max(0, this.idx - this.rows); moved = true; }
    }
    if (moved) { Audio.sfx('cursor'); this.fixScroll(); }
    if (Input.pressed('a')) { const it = this.items[this.idx]; if (it && it.disabled) Audio.sfx('buzz'); else { this.chosen = it; Audio.sfx('confirm'); } }
    if (Input.pressed('b')) { this.cancelled = true; Audio.sfx('cancel'); }
  }
  draw(g, opts) {
    opts = opts || {};
    const start = this.scroll * this.cols, end = Math.min(this.items.length, start + this.rows * this.cols);
    for (let i = start; i < end; i++) {
      const it = this.items[i]; const r = Math.floor((i - start) / this.cols), c = i % this.cols;
      const x = this.x + c * this.colW, y = this.y + r * this.lineH;
      const label = typeof it === 'string' ? it : it.label;
      const col = it.disabled ? '#8890a8' : (it.color || '#ffffff');
      Font.draw(g, label, x + 9, y, col);
      if (it.right !== undefined) Font.draw(g, String(it.right), x + this.colW - 4, y, it.rightColor || col, { align: 'right' });
      if (it.icon) g.drawImage(it.icon, x, y - 1);
      if (i === this.idx && this.active) UI.cursor(g, x, y);
    }
    if (this.items.length > this.rows * this.cols) {
      if (this.scroll > 0) Gfx.tri(g, this.x + this.w - 6, this.y - 2, this.x + this.w - 2, this.y - 2, this.x + this.w - 4, this.y - 5, '#f8f0d0');
      if (end < this.items.length) { const by = this.y + this.rows * this.lineH; Gfx.tri(g, this.x + this.w - 6, by, this.x + this.w - 2, by, this.x + this.w - 4, by + 3, '#f8f0d0'); }
    }
  }
  get current() { return this.items[this.idx]; }
}
