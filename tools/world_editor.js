// The world map editor: paints tile characters over the generated world layouts (Weyard, Angara) with the reference
// rip underneath, and saves the differences to js/maps/<map>_edits.js through serve.py (POST /edit). The game applies
// those edits over the layout when the world map is built, so the generated file is never touched by hand.
'use strict';
(() => {
  const MAPS = {
    world_tla: { layout: () => WORLD_TLA_LAYOUT, edits: () => (typeof WORLD_TLA_EDITS !== 'undefined' ? WORLD_TLA_EDITS : []), rip: '../map references/golden-sun-the-lost-age-weyard-gba-map.webp' },
    world_gs1: { layout: () => WORLD_GS1_LAYOUT, edits: () => (typeof WORLD_GS1_EDITS !== 'undefined' ? WORLD_GS1_EDITS : []), rip: '../map references/golden-sun-world-gba-map.webp' }
  };
  // the tile characters the world builders know (js/maps/world_tla.js, world_gs1.js), their colours here, and whether the party can walk them
  const TILES = [
    ['.', 'plain', '#78b048', false], ['T', 'forest', '#2c7030', false], ['#', 'mountain', '#8a6a48', true], ['h', 'hill', '#a89858', false],
    ['~', 'ocean', '#2050b0', true], ['i', 'shallows', '#4888d8', true], ['r', 'river', '#3870c8', true], ['b', 'bridge', '#b89060', false], ['v', 'bridge (place)', '#c8a070', false],
    [':', 'road', '#d0b878', false], ['a', 'desert', '#e8d080', false], ['m', 'beach', '#f0e0a0', false], ['u', 'snow', '#f0f4f8', false],
    ['s', 'swamp', '#587858', false], ['w', 'wasteland', '#9a8a70', false], ['l', 'lava', '#d04820', true], ['x', 'edge (falls)', '#c0c8d0', true]
  ];
  const COL = {}; const SOLID = {}; TILES.forEach(([c, n, col, s]) => { COL[c] = col; SOLID[c] = s; });
  const KEYS = '1234567890qwertyu';
  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), g = cv.getContext('2d'); const view = $('view');
  let mapId = 'world_tla', rows = [], base = [], W = 0, H = 0, edits = new Map(), saved = new Map(), undo = [];
  let rip = null, ripReady = false; let zoom = 0.5, panX = 0, panY = 0; let cur = '.'; let hover = null; let painting = false, panning = false, panStart = null, space = false;
  let places = [];
  const key = (x, y) => x + ',' + y;
  function load(id) {
    mapId = id; const L = MAPS[id].layout(); base = L.rows.slice(); rows = base.slice(); H = rows.length; W = rows[0].length; places = L.places || [];
    edits = new Map(); saved = new Map(); undo = [];
    for (const [x, y, c] of MAPS[id].edits()) { saved.set(key(x, y), c); edits.set(key(x, y), c); apply(x, y, c); }
    rip = new Image(); ripReady = false; rip.onload = () => { ripReady = true; draw(); }; rip.src = MAPS[id].rip;
    zoom = Math.max(0.25, Math.min(2, Math.floor((view.clientWidth / W) * 16) / 16)); panX = 0; panY = 0;
    listEdits(); draw(); status('loaded ' + id + ' (' + W + 'x' + H + ')');
  }
  function apply(x, y, c) { const r = rows[y]; if (!r || x < 0 || x >= W) return; rows[y] = r.slice(0, x) + c + r.slice(x + 1); }
  function tileAt(x, y) { return rows[y] ? rows[y][x] : null; }
  function setTile(x, y, c, record) {
    if (x < 0 || y < 0 || x >= W || y >= H) return; const was = tileAt(x, y); if (was === c) return;
    if (record) undo.push([x, y, was]);
    apply(x, y, c); const k = key(x, y);
    if (base[y][x] === c) edits.delete(k); else edits.set(k, c);
  }
  function status(t) { $('status').textContent = t; }
  function dirtyMark() { let n = 0; for (const [k, c] of edits) if (saved.get(k) !== c) n++; for (const k of saved.keys()) if (!edits.has(k)) n++; $('dirty').textContent = n ? n + ' unsaved' : ''; }
  function listEdits() { const el = $('edits'); const items = [...edits.entries()].sort(); el.innerHTML = items.length ? items.map(([k, c]) => '<div>' + k + ' &rarr; ' + c + ' <i>' + (TILES.find(t => t[0] === c) || ['', '?'])[1] + '</i></div>').join('') : '<div>none</div>'; dirtyMark(); }
  // ---- drawing ----
  function resize() { cv.width = view.clientWidth; cv.height = view.clientHeight; draw(); }
  function draw() {
    const ts = 16 * zoom; g.fillStyle = '#101018'; g.fillRect(0, 0, cv.width, cv.height);
    const x0 = Math.max(0, Math.floor(-panX / ts)), y0 = Math.max(0, Math.floor(-panY / ts)); const x1 = Math.min(W, Math.ceil((cv.width - panX) / ts)), y1 = Math.min(H, Math.ceil((cv.height - panY) / ts));
    const alpha = $('ripAlpha').value / 100;
    if (rip && ripReady && alpha > 0) { g.imageSmoothingEnabled = zoom < 1; g.globalAlpha = 1; g.drawImage(rip, x0 * 16, y0 * 16, (x1 - x0) * 16, (y1 - y0) * 16, panX + x0 * ts, panY + y0 * ts, (x1 - x0) * ts, (y1 - y0) * ts); }
    const showTiles = $('showTiles').checked, showSolid = $('showSolid').checked;
    if (showTiles || showSolid) {
      g.globalAlpha = showTiles ? (rip && ripReady ? 1 - alpha * 0.85 : 1) : 1;
      for (let y = y0; y < y1; y++) { const r = rows[y]; for (let x = x0; x < x1; x++) { const c = r[x];
        if (showTiles) { g.fillStyle = COL[c] || '#f0f'; g.fillRect(panX + x * ts, panY + y * ts, ts, ts); }
        if (showSolid && SOLID[c]) { g.fillStyle = 'rgba(200,40,40,0.45)'; g.fillRect(panX + x * ts, panY + y * ts, ts, ts); }
      } }
      g.globalAlpha = 1;
    }
    // the edits, outlined
    g.strokeStyle = '#ffd050'; g.lineWidth = 1;
    for (const k of edits.keys()) { const [x, y] = k.split(',').map(Number); if (x < x0 || x >= x1 || y < y0 || y >= y1) continue; g.strokeRect(panX + x * ts + 0.5, panY + y * ts + 0.5, ts - 1, ts - 1); }
    if ($('showGrid').checked && ts >= 8) { g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); for (let x = x0; x <= x1; x++) { g.moveTo(panX + x * ts + 0.5, panY + y0 * ts); g.lineTo(panX + x * ts + 0.5, panY + y1 * ts); } for (let y = y0; y <= y1; y++) { g.moveTo(panX + x0 * ts, panY + y * ts + 0.5); g.lineTo(panX + x1 * ts, panY + y * ts + 0.5); } g.stroke(); }
    if ($('showPlaces').checked) { g.font = Math.max(9, Math.min(14, ts)) + 'px sans-serif'; g.textBaseline = 'top'; for (const p of places) { if (p.x < x0 || p.x >= x1 || p.y < y0 || p.y >= y1) continue; const px = panX + p.x * ts, py = panY + p.y * ts; g.fillStyle = '#ff40c0'; g.fillRect(px, py, ts, ts); if (ts >= 10) { g.fillStyle = '#000'; g.fillText(p.name, px + ts + 3, py + 1); g.fillStyle = '#fff'; g.fillText(p.name, px + ts + 2, py); } } }
    if (hover) { const [hx, hy] = hover; const b = +$('brush').value, o = Math.floor(b / 2); g.strokeStyle = '#fff'; g.strokeRect(panX + (hx - o) * ts + 0.5, panY + (hy - o) * ts + 0.5, b * ts - 1, b * ts - 1); }
  }
  function cellAt(ev) { const r = cv.getBoundingClientRect(); const ts = 16 * zoom; return [Math.floor((ev.clientX - r.left - panX) / ts), Math.floor((ev.clientY - r.top - panY) / ts)]; }
  function paint(x, y) { const b = +$('brush').value, o = Math.floor(b / 2); for (let j = 0; j < b; j++) for (let i = 0; i < b; i++) setTile(x - o + i, y - o + j, cur, true); }
  // ---- input ----
  cv.addEventListener('mousedown', (ev) => { if (ev.button === 1 || space) { panning = true; panStart = [ev.clientX - panX, ev.clientY - panY]; ev.preventDefault(); return; } if (ev.button === 2) { const [x, y] = cellAt(ev); const c = tileAt(x, y); if (c) select(c); return; } if (ev.button === 0) { painting = true; undo.push(null); const [x, y] = cellAt(ev); paint(x, y); listEdits(); draw(); } });
  window.addEventListener('mousemove', (ev) => { if (panning) { panX = ev.clientX - panStart[0]; panY = ev.clientY - panStart[1]; draw(); return; } const [x, y] = cellAt(ev); hover = [x, y]; if (painting) { paint(x, y); listEdits(); } const c = tileAt(x, y); status((x >= 0 && y >= 0 && x < W && y < H) ? '(' + x + ', ' + y + ') ' + (c ? c + ' ' + (TILES.find(t => t[0] === c) || ['', '?'])[1] : '') + (edits.has(key(x, y)) ? ' [edited]' : '') : ''); draw(); });
  window.addEventListener('mouseup', () => { painting = false; panning = false; });
  cv.addEventListener('contextmenu', (ev) => ev.preventDefault());
  cv.addEventListener('wheel', (ev) => { ev.preventDefault(); const r = cv.getBoundingClientRect(); const mx = ev.clientX - r.left, my = ev.clientY - r.top; const old = zoom; zoom = Math.max(0.125, Math.min(4, zoom * (ev.deltaY < 0 ? 1.25 : 0.8))); panX = mx - (mx - panX) * zoom / old; panY = my - (my - panY) * zoom / old; draw(); }, { passive: false });
  window.addEventListener('keydown', (ev) => { if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return; if (ev.code === 'Space') { space = true; ev.preventDefault(); } const k = KEYS.indexOf(ev.key); if (k >= 0 && k < TILES.length) select(TILES[k][0]); if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); doUndo(); } if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') { ev.preventDefault(); save(); } });
  window.addEventListener('keyup', (ev) => { if (ev.code === 'Space') space = false; });
  function doUndo() { let n = 0; while (undo.length) { const u = undo.pop(); if (u === null) { if (n) break; else continue; } const [x, y, was] = u; setTile(x, y, was, false); n++; } listEdits(); draw(); }
  $('undo').onclick = doUndo;
  $('revert').onclick = () => { if (!confirm('Drop every unsaved change?')) return; load(mapId); };
  async function save() { const list = [...edits.entries()].map(([k, c]) => { const [x, y] = k.split(',').map(Number); return [x, y, c]; }); const r = await fetch('/edit?name=' + mapId, { method: 'POST', body: JSON.stringify(list) }); const t = await r.text(); if (r.ok) { saved = new Map(edits); status(t + ' - reload the game tab to see them'); } else status('save failed: ' + t); dirtyMark(); }
  $('save').onclick = save;
  function select(c) { cur = c; document.querySelectorAll('.sw').forEach(el => el.classList.toggle('sel', el.dataset.c === c)); }
  const pal = $('palette'); TILES.forEach(([c, name, col, solid], i) => { const el = document.createElement('div'); el.className = 'sw'; el.dataset.c = c; el.innerHTML = '<span class="key">' + (KEYS[i] || '') + '</span><span class="box" style="background:' + col + '"></span><span>' + c + ' ' + name + '</span>' + (solid ? '<span class="solid">solid</span>' : ''); el.onclick = () => select(c); pal.appendChild(el); });
  select('.');
  $('mapsel').onchange = () => load($('mapsel').value);
  ['ripAlpha', 'showTiles', 'showSolid', 'showGrid', 'showPlaces', 'brush'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', resize);
  window.addEventListener('beforeunload', (ev) => { if ($('dirty').textContent) { ev.preventDefault(); ev.returnValue = ''; } });
  resize(); load(new URLSearchParams(location.search).get('map') || 'world_tla');
})();
