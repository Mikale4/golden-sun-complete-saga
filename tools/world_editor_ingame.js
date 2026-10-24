// The in-game world map editor: on the overworld, F8 opens a panel beside the screen; clicking the game's own tiles
// paints them (the real tiles, as the game draws them), the whole world can be looked over as a passability map and
// clicked to jump there, and Save writes the corrections to js/maps/<map>_edits.js through serve.py (POST /edit) -
// the same file tools/world_editor.html writes, applied over the generated layout when the world map is built.
// Loaded by index.html; it does nothing until F8 is pressed on a world map (or WorldEdit.start() in the console).
'use strict';
window.WorldEdit = {
  active: false, cur: '.', brush: 1, panel: null, over: null, edits: new Map(), saved: new Map(), undo: [], showSolid: false,
  TILES: [['.', 'plain'], ['T', 'forest'], ['#', 'mountain'], ['h', 'hill'], ['~', 'ocean'], ['i', 'shallows'], ['r', 'river'], ['b', 'bridge'], [':', 'road'], ['a', 'desert'], ['m', 'beach'], ['u', 'snow'], ['s', 'swamp'], ['w', 'wasteland'], ['l', 'lava'], ['x', 'edge']],
  KEYS: '1234567890qwertyu',
  layout() { return G.map.id === 'world_gs1' ? WORLD_GS1_LAYOUT : G.map.id === 'world_tla' ? WORLD_TLA_LAYOUT : null; },
  editsConst() { return G.map.id === 'world_gs1' ? (typeof WORLD_GS1_EDITS !== 'undefined' ? WORLD_GS1_EDITS : []) : (typeof WORLD_TLA_EDITS !== 'undefined' ? WORLD_TLA_EDITS : []); },
  async start() {
    if (!G.map || !G.map.world) { this.say('Go to the world map first (the overworld), then press F8.'); return 'not on a world map'; }
    if (this.active) return 'already open';
    this.active = true; this.mapId = G.map.id; this.edits = new Map(); this.saved = new Map(); this.undo = []; this.base = null;
    for (const [x, y, c] of this.editsConst()) { this.edits.set(x + ',' + y, c); this.saved.set(x + ',' + y, c); }
    this.buildPanel(); this.hook(); G.noEncounters = true; this.status('reading the generated layout...');
    try { const src = await (await fetch('/js/maps/' + this.mapId + '_layout.js?v=' + Date.now())).text(); const i = src.indexOf('rows: ['); const j = src.indexOf('],', i); this.base = src.slice(i, j).match(/'[^']*'/g).map(q => q.slice(1, -1)); } catch (e) { this.base = null; }
    this.status('editing ' + this.mapId + ' - click the tiles on the screen to paint them');
    return 'editor open';
  },
  stop() { if (!this.active) return; this.active = false; G.noEncounters = false; if (this.panel) this.panel.remove(); this.panel = null; if (this.over) this.over.remove(); this.over = null; this.unhook(); },
  // ---- painting the real map ----
  charAt(x, y) { const L = this.layout(); return L && L.rows[y] ? L.rows[y][x] : null; },
  setChar(x, y, c, record) {
    const L = this.layout(), M = G.map; if (!L || x < 0 || y < 0 || y >= L.rows.length || x >= L.rows[0].length) return;
    const was = L.rows[y][x]; if (was === c) return; if (record) this.undo.push([x, y, was]);
    L.rows[y] = L.rows[y].slice(0, x) + c + L.rows[y].slice(x + 1);
    const k = x + ',' + y; const gen = this.generated(x, y); if (gen === c) this.edits.delete(k); else this.edits.set(k, c);
    // the tile itself, and the snow mountains round any snow that changed
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const tx = x + dx, ty = y + dy; const ch = this.charAt(tx, ty); if (ch === null || ch === undefined) continue; if (!M.inb(tx, ty)) continue; if (M.get(tx, ty).place) continue; let tile = WORLD_TILE_CHARS[ch] || 'w_plain'; if (ch === '#') { for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (this.charAt(tx + ex, ty + ey) === 'u') tile = 'w_snowmtn'; } M.set(tx, ty, tile); }
    M.finalize();
  },
  // what the generated layout had here (the edits file is the difference from it)
  generated(x, y) { return this.base && this.base[y] ? this.base[y][x] : undefined; },
  paintAt(x, y) { const o = Math.floor(this.brush / 2); this.undo.push(null); for (let j = 0; j < this.brush; j++) for (let i = 0; i < this.brush; i++) this.setChar(x - o + i, y - o + j, this.cur, true); this.refreshList(); },
  doUndo() { let n = 0; while (this.undo.length) { const u = this.undo.pop(); if (u === null) { if (n) break; else continue; } this.setChar(u[0], u[1], u[2], false); n++; } this.refreshList(); },
  async save() {
    const list = [...this.edits.entries()].map(([k, c]) => { const [x, y] = k.split(',').map(Number); return [x, y, c]; });
    const r = await fetch('/edit?name=' + this.mapId, { method: 'POST', body: JSON.stringify(list) }); const t = await r.text();
    if (r.ok) { this.saved = new Map(this.edits); this.status(t); } else this.status('save failed: ' + t); this.refreshList();
  },
  // ---- the screen ----
  hook() {
    const cv = Engine.canvas; const self = this;
    this._down = (ev) => { if (!self.active) return; const c = self.cellAt(ev); if (!c) return; if (ev.button === 2) { const ch = self.charAt(c[0], c[1]); if (ch) self.select(ch); ev.preventDefault(); return; } if (ev.button === 0) { self.painting = true; self.paintAt(c[0], c[1]); ev.preventDefault(); } };
    this._move = (ev) => { if (!self.active) return; const c = self.cellAt(ev); if (!c) return; if (self.painting) self.paintAt(c[0], c[1]); const ch = self.charAt(c[0], c[1]); self.status('(' + c[0] + ', ' + c[1] + ') ' + (ch || '?') + ' ' + ((self.TILES.find(t => t[0] === ch) || ['', ''])[1]) + (self.edits.has(c[0] + ',' + c[1]) ? ' [edited]' : '')); };
    this._up = () => { self.painting = false; };
    this._ctx = (ev) => { if (self.active) ev.preventDefault(); };
    this._key = (ev) => { if (!self.active || ev.target.tagName === 'INPUT') return; const k = self.KEYS.indexOf(ev.key); if (k >= 0 && k < self.TILES.length) self.select(self.TILES[k][0]); if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); self.doUndo(); } if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') { ev.preventDefault(); self.save(); } };
    cv.addEventListener('mousedown', this._down); window.addEventListener('mousemove', this._move); window.addEventListener('mouseup', this._up); cv.addEventListener('contextmenu', this._ctx); window.addEventListener('keydown', this._key);
    cv.style.cursor = 'crosshair';
  },
  unhook() { const cv = Engine.canvas; cv.removeEventListener('mousedown', this._down); window.removeEventListener('mousemove', this._move); window.removeEventListener('mouseup', this._up); cv.removeEventListener('contextmenu', this._ctx); window.removeEventListener('keydown', this._key); cv.style.cursor = ''; },
  cellAt(ev) { const cv = Engine.canvas; const r = cv.getBoundingClientRect(); const sx = (ev.clientX - r.left) * SCREEN_W / r.width, sy = (ev.clientY - r.top) * SCREEN_H / r.height; if (sx < 0 || sy < 0 || sx >= SCREEN_W || sy >= SCREEN_H) return null; const F = G.field; return [Math.floor((sx + F.cam.x) / TILE), Math.floor((sy + F.cam.y) / TILE)]; },
  // ---- the panel ----
  buildPanel() {
    const p = document.createElement('div'); p.id = 'worldedit'; this.panel = p;
    p.style.cssText = 'position:fixed;right:8px;top:8px;width:230px;max-height:calc(100vh - 16px);overflow:auto;background:#22222acc;color:#ddd;font:12px/1.4 system-ui,sans-serif;border:1px solid #666;border-radius:6px;padding:8px;z-index:50;box-sizing:border-box;';
    const rows = this.TILES.map(([c, n], i) => '<div class="we-t" data-c="' + c + '" style="display:flex;gap:6px;align-items:center;padding:2px 4px;border-radius:3px;cursor:pointer;border:1px solid transparent"><span style="color:#999;width:14px">' + (this.KEYS[i] || '') + '</span><b style="width:12px">' + c + '</b><span>' + n + '</span></div>').join('');
    p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b>World editor</b><button id="we-close">close (F8)</button></div>' +
      '<div id="we-status" style="color:#bbb;margin:4px 0;min-height:16px"></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0"><button id="we-save" style="background:#2c6a3c;color:#fff">Save</button><button id="we-undo">Undo</button><button id="we-map">Whole map</button><label>brush <select id="we-brush"><option>1</option><option>2</option><option>3</option></select></label><label><input type="checkbox" id="we-solid"> show solid</label></div>' +
      '<div style="margin:4px 0"><label>jump to <select id="we-place" style="max-width:150px">' + this.places().map(pl => '<option value="' + pl.x + ',' + pl.y + '">' + pl.name + '</option>').join('') + '</select> <button id="we-go">go</button></label></div>' +
      '<div id="we-pal">' + rows + '</div>' +
      '<div style="color:#999;margin-top:6px">Click the screen to paint, right-click to pick. Number/letter keys pick tiles. Ctrl+Z undo, Ctrl+S save. Walk as usual; "jump to" moves the party.</div>' +
      '<div id="we-edits" style="max-height:120px;overflow:auto;color:#aaa;margin-top:6px"></div>';
    document.body.appendChild(p);
    p.querySelectorAll('.we-t').forEach(el => el.onclick = () => this.select(el.dataset.c));
    p.querySelector('#we-close').onclick = () => this.stop(); p.querySelector('#we-save').onclick = () => this.save(); p.querySelector('#we-undo').onclick = () => this.doUndo();
    p.querySelector('#we-brush').onchange = (e) => { this.brush = +e.target.value; }; p.querySelector('#we-solid').onchange = (e) => { this.showSolid = e.target.checked; };
    p.querySelector('#we-map').onclick = () => this.overview();
    p.querySelector('#we-go').onclick = () => { const [x, y] = p.querySelector('#we-place').value.split(',').map(Number); this.jumpNear(x, y); };
    ['mousedown', 'keydown', 'keyup', 'mouseup', 'wheel'].forEach(t => p.addEventListener(t, ev => ev.stopPropagation()));
    this.select(this.cur); this.refreshList();
  },
  select(c) { this.cur = c; if (!this.panel) return; this.panel.querySelectorAll('.we-t').forEach(el => { const on = el.dataset.c === c; el.style.borderColor = on ? '#ffd050' : 'transparent'; el.style.background = on ? '#3a3a2a' : ''; }); },
  status(t) { if (this.panel) this.panel.querySelector('#we-status').textContent = t; },
  say(t) { if (G.field && G.field.showNotice) G.field.showNotice(t); else console.log(t); },
  refreshList() { if (!this.panel) return; let n = 0; for (const [k, c] of this.edits) if (this.saved.get(k) !== c) n++; for (const k of this.saved.keys()) if (!this.edits.has(k)) n++; const el = this.panel.querySelector('#we-edits'); const items = [...this.edits.entries()].sort(); el.innerHTML = '<b>' + items.length + ' edits' + (n ? ', <span style="color:#ffd050">' + n + ' unsaved</span>' : '') + '</b>' + items.slice(-40).map(([k, c]) => '<div>' + k + ' → ' + c + '</div>').join(''); },
  places() { const L = this.layout(); return (L && L.places ? L.places.slice() : []).sort((a, b) => a.name.localeCompare(b.name)); },
  // beside a place, on the first walkable tile next to it (the party would enter it standing on the place itself)
  jumpNear(x, y) { const M = G.map; for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const nx = x + dx, ny = y + dy; if (M.inb(nx, ny) && !M.isSolid(nx, ny) && !M.get(nx, ny).place) { this.jump(nx, ny); return; } } this.jump(x, y); },
  jump(x, y) { const F = G.field, M = G.map; if (!M.inb(x, y)) return; const p = F.player; p.tx = x; p.ty = y; p.px = x * TILE; p.py = y * TILE; p.moving = false; if (F.gatherFollowers) F.gatherFollowers(); F.updateCamera && F.updateCamera(); this.status('jumped to (' + x + ', ' + y + ')'); },
  // the whole world at a glance: every tile as the game has it, the solid ones dark, the places pink; click to jump there
  overview() {
    if (this.over) { this.over.remove(); this.over = null; return; }
    const M = G.map; const places = this.places(); const s = Math.max(2, Math.floor(Math.min((window.innerWidth - 460) / M.w, (window.innerHeight - 20) / M.h)));
    const cv = document.createElement('canvas'); cv.width = M.w * s; cv.height = M.h * s; const g = cv.getContext('2d');
    const col = { grass: '#78b048', forest: '#2c7030', mountain: '#6c4c30', hill: '#a89858', water: '#2050b0', sand: '#e8d080', snow: '#f0f4f8', dirt: '#c0a878', swamp: '#587858', lava: '#d04820', void: '#404850', bridge: '#b89060', town: '#ff40c0' };
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) { const t = M.get(x, y); g.fillStyle = t.place ? '#ff40c0' : (col[t.kind] || '#f0f'); g.fillRect(x * s, y * s, s, s); if (M.isSolid(x, y) && !t.place) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x * s, y * s, s, s); } }
    for (const k of this.edits.keys()) { const [x, y] = k.split(',').map(Number); g.strokeStyle = '#ffd050'; g.strokeRect(x * s + 0.5, y * s + 0.5, s - 1, s - 1); }
    // the places, named
    g.font = 'bold 10px system-ui, sans-serif'; g.textBaseline = 'middle';
    for (const pl of places) { const px = pl.x * s + s / 2, py = pl.y * s + s / 2; g.fillStyle = '#ff40c0'; g.fillRect(pl.x * s - 1, pl.y * s - 1, s + 2, s + 2); const w = g.measureText(pl.name).width; g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(px + s, py - 6, w + 4, 12); g.fillStyle = '#fff'; g.fillText(pl.name, px + s + 2, py); }
    const p = G.field.player; g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(p.tx * s - 2, p.ty * s - 2, s + 4, s + 4);
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:fixed;left:8px;top:8px;z-index:49;background:#111c;padding:4px;border:1px solid #666;border-radius:6px;display:flex;gap:6px;align-items:flex-start;';
    const list = document.createElement('div'); list.style.cssText = 'max-height:' + cv.height + 'px;overflow:auto;width:170px;color:#ddd;font:12px/1.5 system-ui,sans-serif;'; list.innerHTML = '<b>Places</b> <span style="color:#999">(click to jump)</span>' + places.map(pl => '<div class="we-pl" data-x="' + pl.x + '" data-y="' + pl.y + '" style="cursor:pointer;padding:0 4px;border-radius:3px">' + pl.name + ' <span style="color:#888">' + pl.x + ',' + pl.y + '</span></div>').join('');
    wrap.appendChild(list); wrap.appendChild(cv); this.over = wrap; document.body.appendChild(wrap);
    const go = (x, y) => { this.jumpNear(x, y); this.over.remove(); this.over = null; };
    list.querySelectorAll('.we-pl').forEach(el => { el.onclick = () => go(+el.dataset.x, +el.dataset.y); el.onmouseenter = () => { el.style.background = '#3a3a48'; }; el.onmouseleave = () => { el.style.background = ''; }; });
    cv.style.cursor = 'pointer'; cv.title = 'click a place (or anywhere) to jump there';
    cv.onclick = (ev) => { const r = cv.getBoundingClientRect(); const x = Math.floor((ev.clientX - r.left) / s), y = Math.floor((ev.clientY - r.top) / s); const near = places.find(pl => Math.abs(pl.x - x) <= 1 && Math.abs(pl.y - y) <= 1); if (near) go(near.x, near.y); else { this.jump(x, y); this.over.remove(); this.over = null; } };
    ['mousedown', 'keydown', 'mouseup', 'wheel'].forEach(t => wrap.addEventListener(t, ev => ev.stopPropagation()));
  },
  // the paint's cursor and the solid shading, drawn over the game each frame
  draw(g) {
    if (!this.active || !G.map || !G.map.world) return; const F = G.field, M = G.map;
    if (this.showSolid) { const x0 = Math.floor(F.cam.x / TILE), y0 = Math.floor(F.cam.y / TILE); for (let y = y0; y <= y0 + SCREEN_H / TILE; y++) for (let x = x0; x <= x0 + SCREEN_W / TILE; x++) { if (!M.inb(x, y) || !M.isSolid(x, y)) continue; g.fillStyle = 'rgba(220,40,40,0.35)'; g.fillRect(x * TILE - F.cam.x, y * TILE - F.cam.y, TILE, TILE); } }
    g.strokeStyle = '#ffd050'; g.lineWidth = 1; for (const k of this.edits.keys()) { const [x, y] = k.split(',').map(Number); const sx = x * TILE - F.cam.x, sy = y * TILE - F.cam.y; if (sx < -16 || sy < -16 || sx > SCREEN_W || sy > SCREEN_H) continue; g.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1); }
  }
};
// F8 toggles it; the editor draws its marks after the game has drawn its frame
window.addEventListener('keydown', (ev) => { if (ev.code === 'F8') { ev.preventDefault(); if (WorldEdit.active) WorldEdit.stop(); else WorldEdit.start(); } });
(function () { const tick = () => { if (typeof Engine !== 'undefined' && Engine.g && !Engine._weHooked) { Engine._weHooked = true; const prev = Engine.afterDraw; Engine.afterDraw = () => { if (prev) prev(); WorldEdit.draw(Engine.g); }; } else if (!Engine || !Engine._weHooked) setTimeout(tick, 200); }; setTimeout(tick, 200); })();
