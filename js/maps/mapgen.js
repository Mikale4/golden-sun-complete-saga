// ---------- Map builder DSL ----------
'use strict';
const MAPS = {};        // id -> definition {name, w, h, build(M), ...}
const MAP_CACHE = {};   // id -> built map
const TELEPORT_DESTS = []; // filled by world maps
function defineMap(id, def) { def.id = id; MAPS[id] = def; }

class MapBuilder {
  constructor(def) {
    this.def = def; this.id = def.id; this.w = def.w; this.h = def.h; this.name = def.name || def.id;
    const n = this.w * this.h;
    this.ground = new Uint16Array(n); this.obj = new Uint16Array(n); this.over = new Uint16Array(n); this.solidOverride = new Int8Array(n); // -1 none, 0 force walkable, 1 force solid
    this.solidOverride.fill(-1);
    this.npcs = []; this.exits = []; this.triggers = []; this.chests = []; this.objects = []; this.hidden = []; this.signs = []; this.lights = [];
    this.music = def.music || 'town'; this.battleBg = def.bg || 'grass'; this.encounters = def.enc || []; this.encRate = def.encRate || 0; this.indoor = !!def.indoor; this.world = !!def.world; this.dark = !!def.dark; this.darkLevel = def.darkLevel;
    this.entry = def.entry || { x: 1, y: 1 }; this.entries = def.entries || {}; this.tint = def.tint || null; this.rain = !!def.rain; this.parent = def.parent || null; this.shipMap = !!def.ship;
    this.fill(0, 0, this.w, this.h, def.base || 'grass');
  }
  idx(x, y) { return y * this.w + x; }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  t(name) { return Tiles.id(name); }
  // ---- primitives ----
  set(x, y, name) { if (this.inb(x, y)) this.ground[this.idx(x, y)] = this.t(name); return this; }
  setObj(x, y, name) {
    if (!this.inb(x, y)) return this;
    const i = this.idx(x, y), cur = this.obj[i];
    // a drawn window, sign or door is see-through: the wall it replaces drops into the ground layer and shows round it
    if (name && cur && Tiles.defs[name] && Tiles.defs[name].overlay) {
      const ct = Tiles.byId[cur], k = ct.kind;
      if (k === 'wall' || k === 'roof') this.ground[i] = cur;
      // a torch on the top of a wall hangs on the wall's face, not on the dark strip seen from above
      else if (k === 'walltop') { const face = ct.name.replace('walltop', 'wall').replace(/_top$/, ''); this.ground[i] = Tiles.defs[face] ? this.t(face) : cur; }
    }
    this.obj[i] = name ? this.t(name) : 0; return this;
  }
  setOver(x, y, name) { if (this.inb(x, y)) this.over[this.idx(x, y)] = name ? this.t(name) : 0; return this; }
  get(x, y) { return this.inb(x, y) ? Tiles.byId[this.ground[this.idx(x, y)]] : Tiles.get('void'); }
  getObj(x, y) { return this.inb(x, y) && this.obj[this.idx(x, y)] ? Tiles.byId[this.obj[this.idx(x, y)]] : null; }
  fill(x, y, w, h, name) { const id = this.t(name); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.inb(i, j)) this.ground[this.idx(i, j)] = id; return this; }
  fillObj(x, y, w, h, name) { const id = name ? this.t(name) : 0; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.inb(i, j)) this.obj[this.idx(i, j)] = id; return this; }
  rectOutline(x, y, w, h, name) { for (let i = x; i < x + w; i++) { this.set(i, y, name); this.set(i, y + h - 1, name); } for (let j = y; j < y + h; j++) { this.set(x, j, name); this.set(x + w - 1, j, name); } return this; }
  walkable(x, y, w, h) { for (let j = y; j < y + (h || 1); j++) for (let i = x; i < x + (w || 1); i++) if (this.inb(i, j)) this.solidOverride[this.idx(i, j)] = 0; return this; }
  block(x, y, w, h) { for (let j = y; j < y + (h || 1); j++) for (let i = x; i < x + (w || 1); i++) if (this.inb(i, j)) this.solidOverride[this.idx(i, j)] = 1; return this; }
  scatter(x, y, w, h, name, density, seed) { const r = seededRandom(hashStr(this.id + name + (seed || 0))); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (r() < density) this.set(i, j, name); return this; }
  scatterObj(x, y, w, h, name, density, seed) { const r = seededRandom(hashStr(this.id + name + (seed || 1))); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (r() < density && !this.obj[this.idx(i, j)]) this.setObj(i, j, name); return this; }
  // ellipse of ground
  blob(cx, cy, rx, ry, name) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1) this.set(x, y, name); } return this; }
  blobObj(cx, cy, rx, ry, name) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1) this.setObj(x, y, name); } return this; }
  // path from (x0,y0) to (x1,y1), L-shaped, width w
  path(x0, y0, x1, y1, name, w) {
    w = w || 1; name = name || 'path';
    const hw = Math.floor((w - 1) / 2);
    const hl = (xa, xb, y) => { for (let x = Math.min(xa, xb); x <= Math.max(xa, xb); x++) for (let k = -hw; k < w - hw; k++) this.set(x, y + k, name); };
    const vl = (ya, yb, x) => { for (let y = Math.min(ya, yb); y <= Math.max(ya, yb); y++) for (let k = -hw; k < w - hw; k++) this.set(x + k, y, name); };
    hl(x0, x1, y0); vl(y0, y1, x1); return this;
  }
  // ---- painting from a picture ----
  // rows of characters, one per tile, read straight off a gridded reference map. The legend maps a character to a
  // ground tile name, or to { obj } for the object layer, or { ground, obj } for both. Solid rock ('#' by default)
  // is drawn as clifftop, and every rock tile with open ground below it becomes the cliff face - the view from
  // above and slightly in front, like the originals: the top row of a mass shows its grassy rim, everything under
  // it the rock face, so a thick band of rock reads as a tall wall.
  paint(x0, y0, rows, legend, opts) {
    opts = opts || {}; const cliffCh = opts.cliff === undefined ? '#' : opts.cliff;
    rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
      const ch = row[i], x = x0 + i, y = y0 + j; if (ch === ' ' || !this.inb(x, y)) continue;
      const L = legend[ch]; if (L === undefined) continue;
      if (typeof L === 'string') { this.set(x, y, L); continue; }
      if (L.ground) this.set(x, y, L.ground); if (L.obj !== undefined) this.setObj(x, y, L.obj); if (L.walk) this.walkable(x, y);
    } });
    if (cliffCh && legend[cliffCh] === undefined) rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
      if (row[i] !== cliffCh) continue; const x = x0 + i, y = y0 + j; if (!this.inb(x, y)) continue;
      const at = (dj, di) => { const r = rows[j + dj]; return r === undefined || r[i + di] === undefined ? cliffCh : r[i + di]; };   // off the picture counts as more rock
      const set = opts.set || 'cliff';
      if (Tiles.defs[set + '_nsew']) {
        const n = at(-1, 0) !== cliffCh, s = at(1, 0) !== cliffCh, e = at(0, 1) !== cliffCh, w = at(0, -1) !== cliffCh;
        // a tall cliff: the rows just above its foot are plain face, the top row keeps the rim
        let below = 0; while (below < (opts.faces || 1) - 1 && at(below + 1, 0) === cliffCh) below++;
        let above = 0; while (above < (opts.faces || 1) && at(-above - 1, 0) === cliffCh) above++;
        const inFace = !s && !n && above >= 1 && (() => { let d = 0; while (at(d + 1, 0) === cliffCh && d < 8) d++; return d < (opts.faces || 1) && at(d + 1, 0) !== cliffCh; })();
        if (inFace && Tiles.defs[set + '_face']) { this.setObj(x, y, set + (w ? '_face_w' : e ? '_face_e' : '_face')); continue; }
        this.setObj(x, y, set + '_' + ((n ? 'n' : '') + (s ? 's' : '') + (e ? 'e' : '') + (w ? 'w' : '') || 'mid')); continue;
      }
      const above = at(-1, 0), below = at(1, 0);
      this.setObj(x, y, above !== cliffCh ? (opts.top || 'clifftop') : below !== cliffCh ? (opts.face || 'cliff') : (opts.mid || (Tiles.defs.cliff_mid ? 'cliff_mid' : (opts.face || 'cliff'))));
    } });
    return this;
  }
  // a landmark building from the 64x64 sheet, four tiles square, placed by its top-left corner. Its doorway is the
  // middle two tiles of the bottom row: they stay walkable and lead where opts.to says
  landmark(name, x, y, opts) {
    opts = opts || {}; const w = opts.w || 4, h = opts.h || 4; const dx = opts.doorX !== undefined ? opts.doorX : 1, dw = opts.doorW || (opts.doorX !== undefined ? 1 : 2);
    if (!Tiles.defs[name + '_r0c0']) { this.house(x, y, w, h, 'roof_grey', { wall: 'wall_stone', doorX: dx, door: opts.door !== false, windows: false }); if (opts.door !== false && dw > 1) this.setObj(x + dx + 1, y + h - 1, 'door_stone'); }   // no picture of it: a stone building of the same size
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const tn = name + '_r' + j + 'c' + i; if (Tiles.defs[tn]) this.setObj(x + i, y + j, tn); }
    if (opts.door !== false) { this.walkable(x + dx, y + h - 1, dw, 1); if (opts.to) this.exit(x + dx, y + h - 1, dw, 1, opts.to, opts.tx, opts.ty, DIR.UP, { door: true }); }
    this.walkable(x, y, w, 1);   // behind the building
    return this;
  }
  // a two-tile-tall object from the 32x32 sheet (a tall tree, a big boulder), placed by the tile its trunk stands on:
  // the top half goes above it and hangs over the player
  tall(name, x, y) {
    const parts = [['tl', 0, -1], ['tr', 1, -1], ['bl', 0, 0], ['br', 1, 0]];
    // never on top of a building: a tree list drawn up from the picture can stray onto a roof
    for (const [q, dx, dy] of parts) { const o = this.inb(x + dx, y + dy) && this.obj[this.idx(x + dx, y + dy)]; if (o && /^(roof|wall|door|landmark)$/.test(Tiles.byId[o].kind)) return this; }
    for (const [q, dx, dy] of parts) { const tn = name + '_' + q; if (Tiles.defs[tn]) this.setObj(x + dx, y + dy, tn); }
    return this;
  }
  // an area drawn whole (tools/area_to_tiles.py): each cell's tile from the table, and the solidity it worked out;
  // the map then only adds what moves or opens - doors, chests, jars, people
  picture(P) {
    for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) { if (!this.inb(x, y)) continue; this.ground[this.idx(x, y)] = this.t(P.names[P.grid[y][x]]); if (P.solid[y][x]) this.block(x, y); else this.walkable(x, y); }
    return this;
  }
  // a jar, barrel or crate with something inside: searched once, then it is just a jar again
  container(x, y, tile, item, qty) {
    const key = this.id + ':container:' + x + ',' + y;
    this.objects.push({ kind: 'container', tile, x, y, key, hasItem: !!item, id: 'container_' + x + '_' + y, script: function* (E) {
      if (!item || G.flag(key)) { yield E.say({ barrel: 'An empty barrel.', crate: 'An empty crate.', stove: 'A cold oven.', gravestone: 'A weathered gravestone.', stone_marker: 'A worn stone pillar.', table: 'Nothing else on the table.' }[tile] || 'An empty jar.'); return; }
      G.set(key); if (item === 'Coins') { yield E.coins(qty || 1); } else { yield E.give(item, qty || 1); }
    } });
    return this;
  }
  // ---- structures ----
  // House exterior: roof rows then wall row with door. x,y = top-left; w >= 3, h >= 3 (roof h-1 rows, wall 1 row... we use 2 wall rows for taller houses)
  house(x, y, w, h, roof, opts) {
    opts = opts || {}; roof = roof || 'roof_red';
    const wallRows = opts.wallRows || 2; const roofRows = h - wallRows;
    for (let j = 0; j < roofRows; j++) for (let i = 0; i < w; i++) { let t = j === 0 ? roof + '_peak' : j === roofRows - 1 ? roof + '_edge' : roof; if (i === 0 && Tiles.defs[t + '_l']) t += '_l'; else if (i === w - 1 && Tiles.defs[t + '_r']) t += '_r'; this.setObj(x + i, y + j, t); }   // a roof set with gable variants shows its edges
    const wall = opts.wall || 'wall_plaster';
    for (let j = 0; j < wallRows; j++) for (let i = 0; i < w; i++) this.setObj(x + i, y + roofRows + j, j === 0 && wall === 'wall_plaster' ? 'wall_plaster' : (wall === 'wall_plaster' ? 'wall_plaster2' : wall));
    const dx = opts.doorX !== undefined ? x + opts.doorX : x + Math.floor(w / 2);
    const dy = y + h - 1;
    if (opts.door !== false) { this.setObj(dx, dy, opts.doorTile || (wall === 'wall_stone' || wall === 'wall_temple' ? 'door_stone' : 'door')); this.walkable(dx, dy); }
    if (opts.sign) this.setObj(dx - 1 < x ? dx + 1 : dx - 1, dy, opts.sign);
    // a window either side of the front, never on the door itself (a door at the end of the wall keeps its place)
    if (opts.windows !== false && w >= 4) { for (const wx of w >= 5 ? [x + 1, x + w - 2] : [x + 1]) if (wx !== dx && !(opts.sign && wx === (dx - 1 < x ? dx + 1 : dx - 1))) this.setObj(wx, dy, opts.windowTile || (wall === 'wall_stone' ? 'window_stone' : wall === 'wall_timber' ? 'window_timber' : 'window')); }
    if (opts.chimney) this.setObj(x + w - 2, y + 1, Tiles.defs['chimney_' + roof.replace('roof_', '')] ? 'chimney_' + roof.replace('roof_', '') : 'chimney');   // a chimney on the roof's own snow, when the set has one
    if (opts.to) this.exit(dx, dy, 1, 1, opts.to, opts.tx, opts.ty, DIR.UP, { door: true });
    return { doorX: dx, doorY: dy };
  }
  // Interior room: walls around a floor rect; wall top row is dark, second row wall face
  room(x, y, w, h, floor, wall) {
    floor = floor || 'floor_wood'; wall = wall || 'wall_in';
    const top = wall + '_top';
    this.fill(x, y, w, h, floor);
    // the top row is the wall's dark head, the row under it the wall's face; the sides and the foot are the wall
    // seen edge-on when such pieces exist for this wall (wall_in, wall_in_stone), else the plain top piece
    const piece = (k, alt) => Tiles.defs[wall + '_' + k] ? wall + '_' + k : alt;
    for (let i = x; i < x + w; i++) { this.setObj(i, y, top); this.setObj(i, y + 1, wall); this.setObj(i, y + h - 1, piece('b', top)); }
    for (let j = y; j < y + h; j++) { this.setObj(x, j, piece('l', top)); this.setObj(x + w - 1, j, piece('r', top)); }
    this.setObj(x, y + 1, piece('l2', piece('l', top))); this.setObj(x + w - 1, y + 1, piece('r2', piece('r', top)));   // the sides beside the wall's face
    this.setObj(x, y, piece('tl', top)); this.setObj(x + w - 1, y, piece('tr', top)); this.setObj(x, y + h - 1, piece('bl', top)); this.setObj(x + w - 1, y + h - 1, piece('br', top));
    return this;
  }
  // Cave/dungeon room: floor rect with wall ring (walltop above wall face)
  cave(x, y, w, h, floor, wall, top) {
    floor = floor || 'cave'; wall = wall || 'cavewall'; top = top || 'cavewalltop';
    this.fill(x, y, w, h, floor);
    for (let i = x; i < x + w; i++) { this.setObj(i, y, top); this.setObj(i, y + 1, wall); this.setObj(i, y + h - 1, top); }
    for (let j = y; j < y + h; j++) { this.setObj(x, j, top); this.setObj(x + w - 1, j, top); }
    return this;
  }
  // carve an opening in a cave wall (removes obj)
  open(x, y, w, h) { for (let j = y; j < y + (h || 1); j++) for (let i = x; i < x + (w || 1); i++) this.setObj(i, j, null); return this; }
  // raised plateau (clifftop area): interior floor + cliff faces on south edge
  plateau(x, y, w, h, floor) {
    floor = floor || 'grass2';
    this.fill(x, y, w, h, floor);
    for (let i = x; i < x + w; i++) { this.setObj(i, y + h - 1, 'cliff'); }
    for (let j = y; j < y + h - 1; j++) { this.setObj(x, j, 'clifftop'); this.setObj(x + w - 1, j, 'clifftop'); }
    for (let i = x; i < x + w; i++) this.setObj(i, y, 'clifftop');
    return this;
  }
  water(x, y, w, h, name) { this.fill(x, y, w, h, name || 'water'); return this; }
  // a plank bridge over the cells marked ch in rows: each piece gets rails where no plank lies beside it and posts
  // where it meets the bank, the planks laid across the way the bridge is walked (over a river, that is across the water)
  plankBridge(x0, y0, rows, ch) {
    const at = (i, j) => (rows[j] || '')[i] === ch;
    rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
      if (row[i] !== ch) continue; const x = x0 + i, y = y0 + j; if (!this.inb(x, y)) continue;
      const l = at(i - 1, j), r = at(i + 1, j), u = at(i, j - 1), d = at(i, j + 1);
      const wu = this.inb(x, y - 1) && this.get(x, y - 1).water, wd = this.inb(x, y + 1) && this.get(x, y + 1).water;
      const horiz = (l || r) || (!u && !d && wu && wd);
      const tile = horiz ? 'plank_h_' + (u ? '' : 'n') + (d ? '' : 's') + '_' + (l ? '' : 'l') + (r ? '' : 'r') : 'plank_v_' + (l ? '' : 'w') + (r ? '' : 'e') + '_' + (u ? '' : 't') + (d ? '' : 'b');
      this.setObj(x, y, tile); this.walkable(x, y);
    } });
    return this;
  }
  bridgeH(x, y, len) { for (let i = 0; i < len; i++) { this.set(x + i, y, 'bridge'); this.setObj(x + i, y, null); } return this; }
  bridgeV(x, y, len) { for (let i = 0; i < len; i++) { this.set(x, y + i, 'bridge_v'); this.setObj(x, y + i, null); } return this; }
  trees(x, y, w, h, density, kind, seed) { const r = seededRandom(hashStr(this.id + 'tree' + (seed || 0))); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (r() < (density || 0.5) && !this.obj[this.idx(i, j)]) this.setObj(i, j, kind || 'tree'); return this; }
  fenceH(x, y, len) { for (let i = 0; i < len; i++) this.setObj(x + i, y, 'fence'); return this; }
  fenceV(x, y, len) { for (let i = 0; i < len; i++) this.setObj(x, y + i, 'fence_v'); return this; }
  border(name) { name = name || 'tree'; for (let i = 0; i < this.w; i++) { this.setObj(i, 0, name); this.setObj(i, this.h - 1, name); } for (let j = 0; j < this.h; j++) { this.setObj(0, j, name); this.setObj(this.w - 1, j, name); } return this; }
  // ---- entities ----
  // a boss seen on the field before it is fought: its battle picture stands at (x, y) until the flag is set. It is
  // not solid (the scene starts from the trigger around it before the party could reach it) unless asked to be
  boss(name, x, y, opts) {
    opts = opts || {}; const done = opts.done;
    return this.npc(opts.id || ('boss_' + name.replace(/\W+/g, '_')), x, y, Object.assign({ foe: name, name, dir: DIR.DOWN, solid: !!opts.solid, cond: () => !(done && G.flag(done)) && (!opts.cond || opts.cond()), script: opts.script, foeScale: opts.scale }, opts));
  }
  npc(id, x, y, opts) { opts = opts || {}; const n = Object.assign({ id, x, y, dir: DIR.DOWN, look: opts.look || npcLook(opts.type || 'villager_m', hashStr(this.id + id)), type: opts.type, move: opts.move || 'static', text: opts.text, script: opts.script, cond: opts.cond, name: opts.name, animal: opts.animal, mind: opts.mind, shop: opts.shop, inn: opts.inn, solid: opts.solid !== false, hideIf: opts.hideIf, showIf: opts.showIf }, opts); if (!n.look) n.look = npcLook(opts.type || 'villager_m', hashStr(this.id + id)); this.npcs.push(n); return this; }   // an undefined look in opts must not shadow the computed one
  exit(x, y, w, h, to, tx, ty, dir, opts) { this.exits.push(Object.assign({ x, y, w: w || 1, h: h || 1, to, tx, ty, dir: dir === undefined ? DIR.DOWN : dir }, opts || {})); return this; }
  // world-map style edge exits: leaving map bounds in a direction
  edgeExit(side, to, tx, ty, dir) { this.exits.push({ edge: side, to, tx, ty, dir }); return this; }
  trigger(x, y, w, h, script, opts) { this.triggers.push(Object.assign({ x, y, w: w || 1, h: h || 1, script }, opts || {})); return this; }
  chest(x, y, item, qty, opts) { opts = opts || {}; const key = this.id + ':chest:' + x + ',' + y; this.chests.push({ x, y, item, qty: qty || 1, key, coins: opts.coins, hidden: opts.hidden, mimic: opts.mimic, onOpen: opts.onOpen });
    if (opts.hidden) { this.hidden.push({ x, y, tile: 'chest' }); if (G.flag(key)) this.setObj(x, y, 'chest_open'); } // invisible until Reveal shows it (or it has been opened)
    else this.setObj(x, y, G.flag(key) ? 'chest_open' : 'chest');
    return this; }
  sign(x, y, text) { this.setObj(x, y, 'sign'); this.signs.push({ x, y, text }); return this; }
  // puzzle object: kind pillar|boulder|stump|sprout|vines|puddle|crate|rope|crack|scoop|leaves|hoverpad|torch|statue_move|djinni
  object(kind, x, y, opts) { opts = opts || {}; const key = this.id + ':' + kind + ':' + (opts.id || (x + ',' + y)); this.objects.push(Object.assign({ kind, x, y, key, id: opts.id }, opts)); return this; }
  djinni(name, x, y, opts) { opts = opts || {}; if (G.party && G.party.djinnFound.includes(name)) return this; if (opts.cond && !opts.cond()) return this; this.objects.push(Object.assign({ kind: 'djinni', x, y, name, key: 'djinn:' + name, fight: opts.fight !== false, el: DJINN[name].el }, opts)); return this; }
  light(x, y, r) { this.lights.push({ x, y, r: r || 3 }); return this; }
  // Lighthouse beacon: 2x2 brazier at (x,y) with its flame drawn in the overlay row above when lit
  beacon(x, y, el, lit) {
    const base = 'beacon_' + el + (lit ? '_lit' : '');
    this.setObj(x, y, base + '_tl'); this.setObj(x + 1, y, base + '_tr'); this.setObj(x, y + 1, base + '_bl'); this.setObj(x + 1, y + 1, base + '_br');
    // a drawn flame is two tiles tall and rises out of the bowl itself; the code-drawn one is a single row above it
    const fx = 'beacon_' + el + '_flame_';
    if (Tiles.defs[fx + 'tl']) { this.setOver(x, y - 1, lit ? fx + 'tl' : null); this.setOver(x + 1, y - 1, lit ? fx + 'tr' : null); this.setOver(x, y, lit ? fx + 'bl' : null); this.setOver(x + 1, y, lit ? fx + 'br' : null); }
    else { this.setOver(x, y - 1, lit ? fx + 'l' : null); this.setOver(x + 1, y - 1, lit ? fx + 'r' : null); }
    if (lit) this.light(x, y, 4); return this;
  }
  // ---- finalize ----
  finalize() {
    // compute solidity
    const n = this.w * this.h; this.solid = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const gt = Tiles.byId[this.ground[i]], ot = this.obj[i] ? Tiles.byId[this.obj[i]] : null;
      let s = gt.solid ? 1 : 0; if (ot && ot.solid) s = 1;
      if (ot && ot.door) s = 0;
      if (this.solidOverride[i] === 0) s = 0; else if (this.solidOverride[i] === 1) s = 1;
      this.solid[i] = s;
    }
    return this;
  }
  isSolid(x, y) { if (!this.inb(x, y)) return true; return this.solid[this.idx(x, y)] === 1; }
}

// Where an Angara map's exit lands on Weyard's full map: the first walkable land tile next to its place marker (south preferred)
let _tlaWorld = null;
function tlaLandingFor(mapId) {
  if (!MAPS.world_tla) return null;
  if (!_tlaWorld) { _tlaWorld = new MapBuilder(MAPS.world_tla); MAPS.world_tla.build(_tlaWorld); _tlaWorld.finalize(); }
  const alias = { suhalla_gate: 'lalivero', suhalla_desert: 'suhalla', sol_sanctum_1: 'vale', crossbone: 'kalay' }; const want = alias[mapId] || mapId;
  const hit = Object.entries(MAPS.world_tla.places || {}).find(([k, v]) => v.map === want); if (!hit) return null;
  const [px, py] = hit[0].split(',').map(Number); const W = _tlaWorld;
  for (const [dx, dy, dir] of [[0, 1, DIR.DOWN], [0, -1, DIR.UP], [-1, 0, DIR.LEFT], [1, 0, DIR.RIGHT]]) { const x = px + dx, y = py + dy; if (W.inb(x, y) && !W.isSolid(x, y) && !W.get(x, y).water) return { x, y, dir }; }
  return { x: px, y: py, dir: DIR.DOWN };
}
// the track the audio map gives a map: its own entry, or its town's when it is one of the town's buildings
function musicFor(id) {
  let own = MAP_MUSIC[id];
  if (own === undefined) { const town = MAP_MUSIC_PREFIX.find(p => id.startsWith(p + '_')); if (town && MAP_MUSIC[town] !== undefined) own = MAP_MUSIC[town]; }
  if (typeof own === 'function') own = own();
  return own;
}
// The hidden items of js/data/hidden_items.js, put down on the map they belong to once it is built: at the tile
// given, beside the doorway named, or in the corner or side of the room asked for, on the nearest free floor
function placeHiddenItems(M, id) {
  const list = typeof HIDDEN_ITEMS !== 'undefined' ? HIDDEN_ITEMS[id] : null; if (!list) return;
  const exitAt = (x, y) => M.exits.some(e => !e.edge && Math.abs(x - (e.x + (e.w - 1) / 2)) <= e.w / 2 + 1 && Math.abs(y - (e.y + (e.h - 1) / 2)) <= e.h / 2 + 1);
  const tileOf = (x, y) => { const i = M.idx(x, y); return { g: Tiles.byId[M.ground[i]], o: M.obj[i] ? Tiles.byId[M.obj[i]] : null }; };
  const isTree = t => t && (t.kind === 'tree' || t.kind === 'tall');
  const free = (x, y, how) => {
    if (!M.inb(x, y) || exitAt(x, y) || M.solidOverride[M.idx(x, y)] === 1 || M.objects.some(o => o.x === x && o.y === y) || M.npcs.some(n => n.x === x && n.y === y)) return false;   // (a drawn area's scenery is solid by override)
    const { g, o } = tileOf(x, y);
    if (how === 'catch') return isTree(o);
    return !o && g && !g.solid && !g.water && g.kind !== 'void' && !(M.def.entry && M.def.entry.x === x && M.def.entry.y === y);
  };
  const nearest = (x, y, how) => { for (let r = 0; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && free(x + dx, y + dy, how)) return { x: x + dx, y: y + dy }; return null; };
  for (const e of list) {
    let x, y;
    if (e.at) { [x, y] = e.at; }
    else if (e.near) { const ex = M.exits.find(z => !z.edge && z.to === e.near); if (!ex) { console.warn('hidden item: no door to', e.near, 'on', id); continue; } x = ex.x + (e.dx || 0); y = ex.y + (e.dy === undefined ? 1 : e.dy); }
    else { const w = M.w, h = M.h; const S = { tl: [2, 2], tr: [w - 3, 2], bl: [2, h - 3], br: [w - 3, h - 3], l: [1, h >> 1], r: [w - 2, h >> 1], t: [w >> 1, 2], b: [w >> 1, h - 3] }; [x, y] = S[e.spot || 'r']; }
    const p = nearest(x, y, e.how); if (!p) { console.warn('hidden item: nowhere to put', e.item, 'on', id); continue; }
    const item = e.item, qty = e.qty || 1;
    if (e.how === 'catch') M.object('catchable', p.x, p.y, { id: 'hidden_' + p.x + '_' + p.y, item, look: null });
    else if (e.how === 'dig') M.object('scoop', p.x, p.y, { id: 'hidden_' + p.x + '_' + p.y, item, look: 'dig_spot' });
    else if (e.how === 'cyclone') M.object('leaves', p.x, p.y, { id: 'hidden_' + p.x + '_' + p.y, onClear: function* (E) { const key = id + ':hidden:' + p.x + ',' + p.y; if (G.flag(key)) return; G.set(key); yield E.give(item, qty); } });
    else if (e.how === 'chest') M.chest(p.x, p.y, item, qty, { hidden: !!e.hidden });
    else if (e.how === 'ground') M.object('spot', p.x, p.y, { id: 'hidden_' + p.x + '_' + p.y, item, script: function* (E) { const key = id + ':hidden:' + p.x + ',' + p.y; if (G.flag(key)) { yield E.say('Nothing else here but the ground.'); return; } G.set(key); yield E.say('Something is half buried in the ground here...'); yield E.give(item, qty); } });   // found by checking the ground
    else M.container(p.x, p.y, e.tile || 'pot', item, qty);
  }
}
function buildMap(id) {
  const def = MAPS[id]; if (!def) { console.error('No map', id); return buildMap('vale'); }
  const M = new MapBuilder(def);
  def.build(M);
  placeHiddenItems(M, id);
  if (typeof MAP_MUSIC !== 'undefined') {
    let own = musicFor(id);
    // a house, inn or shop keeps playing the music of the town it stands in, unless it was given a track of its own
    if (own === undefined && def.indoor && (!def.music || def.music === 'town')) {
      let home = M.exits.map(e => e.to).find(t => MAPS[t] && !MAPS[t].indoor && !MAPS[t].world);
      if (home && !G.flag('prologue_done') && G.game !== 2 && MAPS[home + '_past']) home += '_past';   // the night of the storm: the storm's music, not the morning's
      if (home) own = musicFor(home) || MAPS[home].music;
    }
    if (own) M.music = own;
  }
  // In The Lost Age, Angara's maps (built for the Golden Sun world) exit onto Weyard's full map at their place there
  if (G.game === 2 && !G.flag('prologue_jenna') && id !== 'world_gs1' && MAPS.world_tla && M.exits.some(e => e.to === 'world_gs1')) {   // (not in the prologue: Jenna walks Gondowan's own map)
    const land = tlaLandingFor(id);
    for (const e of M.exits) if (e.to === 'world_gs1') { e.to = 'world_tla'; if (land) { e.tx = land.x; e.ty = land.y; e.dir = land.dir; } }
  }
  // apply persisted object state (pillars moved etc.)
  for (const o of M.objects) {
    const st = G.flags['obj:' + o.key];
    if (st && st.x !== undefined) { o.x = st.x; o.y = st.y; }
    if (st && st.gone) o.gone = true;
    if (st && st.state) o.state = st.state;
    if (st && st.kind) o.kind = st.kind;   // a puddle frozen into a pillar of ice stays one
  }
  for (const [fx, fy] of (G.flags['fallen:' + id] || [])) M.set(fx, fy, 'pillar_fallen');
  for (const [gx, gy, gt] of (G.flags['ground:' + id] || [])) M.set(gx, gy, gt);
  for (const [ox, oy, ot] of (G.flags['objtile:' + id] || [])) M.setObj(ox, oy, ot);
  for (const [wx, wy] of (G.flags['walk:' + id] || [])) M.walkable(wx, wy);
  M.finalize();
  return M;
}
// Persistent tile edits (survive map rebuilds)
function persistGround(M, x, y, name) { M.set(x, y, name); const l = G.flags['ground:' + M.id] || []; l.push([x, y, name]); G.flags['ground:' + M.id] = l; }
function persistObjTile(M, x, y, name) { M.setObj(x, y, name); const l = G.flags['objtile:' + M.id] || []; l.push([x, y, name]); G.flags['objtile:' + M.id] = l; }
function persistWalkable(M, x, y) { M.walkable(x, y); const l = G.flags['walk:' + M.id] || []; l.push([x, y]); G.flags['walk:' + M.id] = l; }

// ---------- Town / interior kit ----------
const Kit = {
  // Generic house interior. cfg: {w,h,floor,wall,furn:[[tile,x,y]],npcs:[{id,x,y,...}],chests:[[x,y,item,qty]],back:{map,x,y},stairs:{x,y,to,tx,ty}, name, music}
  interior(id, cfg) {
    const w = cfg.w || 12, h = cfg.h || 10;
    defineMap(id, {
      name: cfg.name || 'House', w, h, base: 'void', indoor: true, music: cfg.music || 'town', bg: cfg.bg || 'grass', entry: { x: Math.floor(w / 2), y: h - 3 }, retreat: cfg.retreat,
      build(M) {
        M.room(0, 0, w, h, cfg.floor || 'floor_wood', cfg.wall || 'wall_in');
        const dx = cfg.doorX !== undefined ? cfg.doorX : Math.floor(w / 2);
        if (dx >= 0) { M.setObj(dx, h - 1, null); M.set(dx, h - 1, 'floor_wood'); M.walkable(dx, h - 1); }   // an upstairs room has no street door
        if (cfg.back && dx >= 0) M.exit(dx, h - 1, 1, 1, cfg.back.map, cfg.back.x, cfg.back.y, DIR.DOWN, { door: true });
        for (const f of cfg.furn || []) { if (f[0] === 'rug') M.set(f[1], f[2], 'rug'); else if (f[0] === 'carpet') M.fill(f[1], f[2], f[3] || 1, f[4] || 1, 'carpet_red'); else M.setObj(f[1], f[2], f[0]); }
        for (const c of cfg.chests || []) M.chest(c[0], c[1], c[2], c[3], c[4]);
        for (const n of cfg.npcs || []) M.npc(n.id, n.x, n.y, n);
        if (cfg.stairs) { M.set(cfg.stairs.x, cfg.stairs.y, cfg.stairs.down ? 'stairs_down' : 'stairs_up'); M.setObj(cfg.stairs.x, cfg.stairs.y, null); M.walkable(cfg.stairs.x, cfg.stairs.y); M.exit(cfg.stairs.x, cfg.stairs.y, 1, 1, cfg.stairs.to, cfg.stairs.tx, cfg.stairs.ty, DIR.DOWN, { stairs: true }); }
        if (cfg.build) cfg.build(M);
      }
    });
  },
  // Standard furnished home
  home(id, cfg) {
    cfg = cfg || {}; const w = cfg.w || 12, h = cfg.h || 10;
    const furn = cfg.furn || [['bed', 1, 2], ['bed_foot', 1, 3], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['bookshelf', w - 3, 2], ['shelf', 3, 2], ['pot', w - 2, h - 3], ['fireplace', Math.floor(w / 2) + 2, 1]];
    this.interior(id, Object.assign({ w, h, furn }, cfg));
  },
  inn(id, cfg) {
    const w = cfg.w || 14, h = cfg.h || 11;
    this.interior(id, Object.assign({ w, h, name: cfg.name || 'Inn', furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['bed', w - 3, 2], ['bed_foot', w - 3, 3], ['bed', w - 5, 2], ['bed_foot', w - 5, 3], ['table', 5, 6], ['chair', 4, 6], ['chair', 6, 6], ['pot', 1, h - 3], ['shelf', 1, 2]], npcs: [{ id: id + '_keeper', x: 3, y: 2, type: 'merchant', inn: cfg.price || 20, name: 'Innkeeper', dir: DIR.DOWN }] }, cfg, { npcs: [{ id: id + '_keeper', x: 3, y: 2, type: 'merchant', inn: cfg.price || 20, name: 'Innkeeper', dir: DIR.DOWN }].concat(cfg.npcs || []) })); // extra NPCs never replace the keeper
  },
  shop(id, cfg) {
    const w = cfg.w || 12, h = cfg.h || 9;
    this.interior(id, Object.assign({ w, h, name: cfg.name || 'Shop', furn: [['counter', 3, 3], ['counter', 4, 3], ['counter', 5, 3], ['counter', 6, 3], ['counter', 7, 3], ['shelf', 2, 2], ['shelf', w - 3, 2], ['barrel', 1, h - 3], ['crate', w - 2, h - 3]], npcs: [{ id: id + '_keeper', x: 5, y: 2, type: 'merchant', shop: cfg.shop, name: 'Shopkeeper', dir: DIR.DOWN }] }, cfg, { npcs: [{ id: id + '_keeper', x: 5, y: 2, type: 'merchant', shop: cfg.shop, name: 'Shopkeeper', dir: DIR.DOWN }].concat(cfg.npcs || []) })); // extra NPCs never replace the keeper
  },
  sanctum(id, cfg) {
    const w = cfg.w || 12, h = cfg.h || 11;
    this.interior(id, Object.assign({ w, h, name: cfg.name || 'Sanctum', floor: 'floor_tile', wall: 'wall_in_stone', furn: [['statue_gold', Math.floor(w / 2), 2], ['carpet', Math.floor(w / 2) - 1, 3, 3, h - 5], ['torch', 2, 1], ['torch', w - 3, 1], ['bookshelf', 1, 2], ['bookshelf', w - 2, 2]], npcs: [] }, cfg, { npcs: [{ id: id + '_priest', x: Math.floor(w / 2), y: 4, type: 'priest', sanctum: true, name: 'Priest', dir: DIR.DOWN }].concat(cfg.npcs || []) }));
  }
};
