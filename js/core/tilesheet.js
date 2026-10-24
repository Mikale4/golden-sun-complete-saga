// ---------- Drawn tilesets ----------
// Hand-drawn sheets in art/ take the place of the procedural tiles they name as soon as they load; until then (and
// for anything no sheet covers) the drawn-in-code tiles stand. A sheet is a grid of 16x16 cells in the order its list
// gives: "name_N" cells are the animation frames of name, "name_b" is an alternate scattered through big fields so
// they do not visibly repeat, "shore_*" cells are the world map's foam overlays, and "road_ns" / "droad_ne" / ...
// are road pieces picked by which neighbours the road continues into (on grass, sand or snow).
'use strict';
const TileSheets = {
  ready: {},
  get classic() { return typeof ART_MODE !== 'undefined' && ART_MODE === 'classic'; },
  get files() { return typeof ART_MODE !== 'undefined' && ART_MODE === 'files'; },   // the sheets' cells come from assets/tiles/ through AssetFiles
  loadAll() {
    if (typeof TILE_SHEETS === 'undefined') return;
    for (const s of TILE_SHEETS) {
      // which tiles are see-through is known before the picture arrives, so maps built in the meantime lay their
      // walls under the windows all the same
      if (this.classic && (s.cell || TILE) !== TILE) continue;   // big objects (trees, landmarks) are drawn in code in classic mode
      for (const n of (s.overlay || [])) { const nm = (s.alias || {})[n] || n; if (this.classic && !(s.extras || []).includes(nm.replace(/_\d+$/, ''))) continue; const t = Tiles.defs[nm] || Tiles.defs[nm.replace(/_\d+$/, '')]; if (t) t.overlay = true; }   // torch_0 flags torch
      for (const n of (s.extras || [])) if (!Tiles.defs[n]) Tiles.reg(n, { kind: 'furniture', solid: !(s.walkOver || []).includes(n), overlay: true }, g => { });   // a blank stand-in until the picture arrives
      if (!this.files) this.load(s);   // in files mode AssetFiles gathers the cells from assets/ and calls apply itself
    }
  },
  load(sheet) {
    const img = new Image();
    img.onload = () => { this.apply(img, sheet); this.ready[sheet.png] = true; };
    img.onerror = () => console.warn('tile sheet missing', sheet.png);
    img.src = sheet.png;
  },
  apply(img, sheet, fromFiles) {
    if (sheet.cell === 32 || sheet.cell === 48 || sheet.cell === 64) return this.applyBig(img, sheet);
    const names = sheet.names, alias = sheet.alias || {}, extras = sheet.extras || [], walkOver = sheet.walkOver || [];
    const cols = Math.floor(img.width / TILE);
    const framesGiven = {};   // how many frames the sheet drew for each animated tile
    const given = fromFiles instanceof Set ? fromFiles : null;   // from assets/: the cells that had a file; the rest keep the code's drawing
    names.forEach((drawn, k) => {
      if (given && !given.has(drawn)) return;
      const c = Gfx.canvas(TILE, TILE);
      Gfx.ctx(c).drawImage(img, (k % cols) * TILE, Math.floor(k / cols) * TILE, TILE, TILE, 0, 0, TILE, TILE);
      const name = alias[drawn] || drawn;
      let m;
      if (sheet.ignorePrefix && [].concat(sheet.ignorePrefix).some(pre => name.startsWith(pre))) return;
      if (name === 'sign_hanging') { this.signs(c); return; }
      if (name === 'tornado') { const flip = Gfx.canvas(TILE, TILE); const fg = Gfx.ctx(flip); fg.translate(TILE, 0); fg.scale(-1, 1); fg.drawImage(c, 0, 0); Tiles.defs.tornado.frames = [c, flip]; return; }   // one drawing, spun by mirroring
      // a new decoration: registered on its first cell, later "_N" cells become its animation frames
      const base = (m = name.match(/^(.*)_(\d+)$/)) && extras.includes(m[1]) ? m[1] : name;
      if (extras.includes(base)) {
        if (!Tiles.defs[base]) Tiles.reg(base, { kind: 'furniture', solid: !walkOver.includes(base), overlay: (sheet.overlay || []).includes(drawn) }, g => g.drawImage(c, 0, 0));
        else if (base !== name) Tiles.defs[base].frames[+m[2]] = c; else Tiles.defs[base].frames = [c];
        return;
      }
      if (this.classic) return;   // everything else on the sheet stands in for a tile the code draws itself
      if (name.startsWith('shore_')) { Tiles.edges['w_' + name] = c; return; }
      if (name.startsWith('pond_')) { Tiles.edges[name] = c; return; }
      if ((m = name.match(/^([ds]?)road_(\w+)$/))) { const set = { '': 'grass', d: 'sand', s: 'snow' }[m[1]]; Tiles.roads = Tiles.roads || {}; (Tiles.roads[set] = Tiles.roads[set] || {})[m[2]] = c; return; }
      if ((m = name.match(/^(.*)_b$/)) && Tiles.defs[m[1]]) { Tiles.defs[m[1]].variant = c; return; }
      if ((m = name.match(/^(.*)_(\d+)$/)) && Tiles.defs[m[1]]) { Tiles.defs[m[1]].frames[+m[2]] = c; framesGiven[m[1]] = Math.max(framesGiven[m[1]] || 0, +m[2] + 1); return; }
      if (Tiles.defs[name]) { Tiles.defs[name].frames = [c]; if (name === 'w_road') this.roadSet(Tiles.defs[name], c); return; }
      if ((sheet.cliffSets || []).some(set => name.startsWith(set + '_'))) { Tiles.reg(name, { kind: 'cliff', solid: true }, g => g.drawImage(c, 0, 0)); return; }   // raw material for cliffSet()
      if ((sheet.fenceSets || []).some(set => name.startsWith(set + '_'))) { Tiles.reg(name, { kind: 'fence', solid: true, overlay: true }, g => g.drawImage(c, 0, 0)); return; }   // one piece of a fence set
      console.warn('sheet names a tile the game does not have:', name);
    });
    if (this.classic) return;
    // an animation the sheet drew shorter than the code did loops over the drawn frames only, never a mix of both
    for (const [n, count] of Object.entries(framesGiven)) Tiles.defs[n].frames.length = count;
    // a puddle is drawn on whatever it lies in: the sheet's overlay laid over grass, cave rock or water
    if (names.includes('puddle')) {
      const over = Tiles.defs.puddle.frames[0], dry = Tiles.defs.puddle_dry && Tiles.defs.puddle_dry.frames[0];
      const lay = (baseName, n, ov) => { const t = Tiles.defs[n], b = Tiles.defs[baseName]; if (!t || !b) return; t.frames = b.frames.map(bf => { const c = Gfx.canvas(TILE, TILE); const g = Gfx.ctx(c); g.drawImage(bf, 0, 0); g.drawImage(ov, 0, 0); return c; }); };
      lay('grass', 'puddle', over); lay('cave', 'puddle_cave', over); lay('water', 'puddle_water', over); if (dry) lay('grass', 'puddle_dry', dry);
    }
    for (const set of (sheet.cliffSets || [])) this.cliffSet(set);
    // a fence set: its base tile (placed by maps) is drawn as whichever piece its neighbours call for. 'fence' and
    // 'fence_v' already exist; the stone wall and picket fence get a base of their own
    for (const set of (sheet.fenceSets || [])) { for (const base of set === 'fence' ? ['fence', 'fence_v'] : [set]) { if (!Tiles.defs[base]) Tiles.reg(base, { kind: 'fence', solid: true, overlay: true }, g => { }); Tiles.defs[base].autofence = set; if (Tiles.defs[set + '_ew']) Tiles.defs[base].frames = Tiles.defs[base === 'fence_v' ? set + '_ns' : set + '_ew'].frames; } }
    if (Tiles.defs.hedge_ew) { if (!Tiles.defs.hedge) Tiles.reg('hedge', { kind: 'fence', solid: true, overlay: true }, g => { }); Tiles.defs.hedge.autofence = 'hedge'; Tiles.defs.hedge.frames = Tiles.defs.hedge_ew.frames; }
    // the middle of a cliff face, tiled, is the plain rock a thick band of cliff is filled with
    if (names.includes('cliff') && Tiles.defs.cliff) { const face = Tiles.defs.cliff.frames[0]; const mid = Gfx.canvas(TILE, TILE); const mg = Gfx.ctx(mid); mg.drawImage(face, 0, 4, 16, 8, 0, 0, 16, 8); mg.drawImage(face, 0, 4, 16, 8, 0, 8, 16, 8); if (!Tiles.defs.cliff_mid) Tiles.reg('cliff_mid', { kind: 'cliff', solid: true }, g => g.drawImage(mid, 0, 0)); else Tiles.defs.cliff_mid.frames = [mid]; }
    // tiles that are the same picture as another (a boulder is a boulder whatever it stands on)
    for (const [n, from] of Object.entries(sheet.same || {})) if (Tiles.defs[n] && Tiles.defs[from]) { Tiles.defs[n].frames = Tiles.defs[from].frames; Tiles.defs[n].overlay = Tiles.defs[from].overlay; }
  },
  // a sheet of 32x32 objects: each is quartered into the game's 16x16 tiles, named by corner - a brazier drawn as
  // 'beacon_venus' becomes beacon_venus_tl/_tr/_bl/_br, and 'beacon_venus_flame_0' the first frame of the four
  // flame quarters. Quarters the game has no tile for are registered as they come (the flames, drawn over the bowl).
  applyBig(img, sheet) {
    const cell = sheet.cell, cols = Math.floor(img.width / cell), framesGiven = {}, n = cell / TILE;
    // 32px objects are quartered into tl/tr/bl/br; 64px landmarks are cut into r0c0 .. r3c3
    const parts = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) parts.push([n === 2 ? (j ? 'b' : 't') + (i ? 'r' : 'l') : 'r' + j + 'c' + i, i * TILE, j * TILE]);
    sheet.names.forEach((name, k) => {
      let m = name.match(/^(.*)_(\d+)$/); const base = m ? m[1] : name, frame = m ? +m[2] : null;
      for (const [q, ox, oy] of parts) {
        const c = Gfx.canvas(TILE, TILE); Gfx.ctx(c).drawImage(img, (k % cols) * cell + ox, Math.floor(k / cols) * cell + oy, TILE, TILE, 0, 0, TILE, TILE);
        const tn = base + '_' + q;
        // a tall object's upper half hangs over the player's head and can be walked under; its base is solid
        const props = sheet.kind === 'tall' ? (oy === 0 ? { kind: 'tall', overlay: true, over: true } : { kind: 'tall', overlay: true, solid: true })
          : n === 2 ? { kind: sheet.kind || 'beacon_fx', overlay: true, over: true } : oy === 0 && n === 4 ? { kind: 'landmark', solid: false, over: true, overlay: true } : { kind: 'landmark', solid: true, overlay: true };   // a building's top row can be walked behind
        if (!Tiles.defs[tn]) Tiles.reg(tn, props, g => g.drawImage(c, 0, 0));
        const t = Tiles.defs[tn];
        if (frame === null) t.frames = [c]; else { t.frames[frame] = c; framesGiven[tn] = Math.max(framesGiven[tn] || 0, frame + 1); }
      }
    });
    for (const [n, count] of Object.entries(framesGiven)) Tiles.defs[n].frames.length = count;
    for (const set of (sheet.cliffBlocks || [])) this.cliffBlock(set);
  },
  // A cliff drawn as one whole 3x3 plateau gives nine pieces: rim (nw n ne), sides and top (w mid e), face (sw s se).
  // The sixteen edge combinations a map can need are put together from their quadrants, a plain face for tall
  // cliffs is cut from the face row, the notched block gives the inner corners, and the ramp its two walkable steps.
  cliffBlock(set) {
    const P = q => Tiles.defs[set + '_block_' + q]; if (!P('r0c0')) return;
    const piece = { nw: P('r0c0'), n: P('r0c1'), ne: P('r0c2'), w: P('r1c0'), mid: P('r1c1'), e: P('r1c2'), sw: P('r2c0'), s: P('r2c1'), se: P('r2c2') };
    const img = t => t.frames[0];
    const reg = (name, c, props) => { if (!Tiles.defs[name]) Tiles.reg(name, Object.assign({ kind: 'cliff', solid: true }, props || {}), g => g.drawImage(c, 0, 0)); else Tiles.defs[name].frames = [c]; };
    // quadrant composition: each 8x8 corner of the tile comes from the piece that has the same edges on that corner
    const H = TILE / 2;
    const compose = (tl, tr, bl, br) => { const c = Gfx.canvas(TILE, TILE); const g = Gfx.ctx(c); g.drawImage(img(tl), 0, 0, H, H, 0, 0, H, H); g.drawImage(img(tr), H, 0, H, H, H, 0, H, H); g.drawImage(img(bl), 0, H, H, H, 0, H, H, H); g.drawImage(img(br), H, H, H, H, H, H, H, H); return c; };
    const combos = ['', 'n', 's', 'e', 'w', 'ns', 'ne', 'nw', 'se', 'sw', 'ew', 'nse', 'nsw', 'new', 'sew', 'nsew'];
    for (const ed of combos) {
      const n = ed.includes('n'), s = ed.includes('s'), e = ed.includes('e'), w = ed.includes('w');
      const tl = n && w ? piece.nw : n ? piece.n : w ? piece.w : piece.mid, tr = n && e ? piece.ne : n ? piece.n : e ? piece.e : piece.mid;
      const bl = s && w ? piece.sw : s ? piece.s : w ? piece.w : piece.mid, br = s && e ? piece.se : s ? piece.s : e ? piece.e : piece.mid;
      reg(set + '_' + (ed || 'mid'), compose(tl, tr, bl, br));
    }
    // a plain face for the rows of a tall cliff between the rim and the foot: the face piece without its base line
    const face = Gfx.canvas(TILE, TILE); const fg = Gfx.ctx(face); fg.drawImage(img(piece.s), 0, 3, TILE, 9, 0, 0, TILE, 9); fg.drawImage(img(piece.s), 0, 3, TILE, 9, 0, 9, TILE, 7);
    reg(set + '_face', face);
    const faceW = compose(piece.sw, piece.s, piece.sw, piece.s), faceE = compose(piece.s, piece.se, piece.s, piece.se);
    reg(set + '_face_w', faceW); reg(set + '_face_e', faceE);
    // the notch: its middle tile is the inner corner where the face turns into a side
    const N = q => Tiles.defs[set + '_notch_' + q];
    if (N('r1c1')) { reg(set + '_in_se', img(N('r1c1'))); const m = Gfx.canvas(TILE, TILE); const mg = Gfx.ctx(m); mg.translate(TILE, 0); mg.scale(-1, 1); mg.drawImage(img(N('r1c1')), 0, 0); reg(set + '_in_sw', m); }
    // the ramp and the stairs: the two tiles of the slope are walkable
    const R = q => Tiles.defs[set + '_ramp_' + q]; if (R('r1c1')) { reg(set + '_ramp_top', img(R('r1c1')), { solid: false }); reg(set + '_ramp_bot', img(R('r2c1')), { solid: false }); }
    const S = q => Tiles.defs[set + '_stairs_block_' + q]; if (S('r1c1')) { reg(set + '_steps_top', img(S('r1c1')), { solid: false }); reg(set + '_steps_bot', img(S('r2c1')), { solid: false }); }
  },
  // A cliff band's sixteen edge pieces, assembled from the drawn material: the rock inside the drawn 'mid' piece
  // becomes the fill, the drawn 'n' piece (ground giving way to rock along a ragged rim) becomes the top row with
  // the game's own ground laid over its grass, and the face base and the lit sides are painted on. Registered as
  // set_<edges> with the edges the mass has on that tile, in n/s/e/w order ('cliff_ns', 'dcliff_e' ...), and
  // set_mid for the inside.
  cliffSet(set) {
    const midT = Tiles.defs[set + '_mid'], nT = Tiles.defs[set + '_n']; if (!midT || !nT) return;
    const groundName = { cliff: 'grass', dcliff: 'sand', scliff: 'snow' }[set] || 'grass';
    const isGround = { cliff: (r, g, b) => g > r + 30 && g > b + 30, dcliff: (r, g, b) => r > 190 && g > 160 && b < 140 && r - b > 60, scliff: (r, g, b) => Math.min(r, g, b) > 185 }[set];
    const pix = c => Gfx.ctx(c).getImageData(0, 0, TILE, TILE);
    let rockData, rimData; try { rockData = pix(midT.frames[0]); rimData = pix(nT.frames[0]); } catch (e) { return; }   // opened from disk: no pixel access, the plain tiles will do
    const put = (c, d) => Gfx.ctx(c).putImageData(d, 0, 0);
    // the rock: the lowest 8 rows of the drawn mid piece, repeated
    const rock = Gfx.ctx(Gfx.canvas(TILE, TILE)).createImageData(TILE, TILE);
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) for (let k = 0; k < 4; k++) rock.data[(y * TILE + x) * 4 + k] = rockData.data[((8 + (y % 8)) * TILE + x) * 4 + k];
    // the rim: the drawn n piece, its grass replaced by the game's ground tile
    const ground = pix(Tiles.defs[groundName].frames[0]);
    const rim = Gfx.ctx(Gfx.canvas(TILE, TILE)).createImageData(TILE, TILE);
    for (let i = 0; i < TILE * TILE; i++) { const o = i * 4, r = rimData.data[o], g = rimData.data[o + 1], b = rimData.data[o + 2]; const src = isGround(r, g, b) ? ground : rimData; for (let k = 0; k < 4; k++) rim.data[o + k] = src.data[o + k]; }
    const shade = (d, x, y, f) => { const o = (y * TILE + x) * 4; d.data[o] = Math.min(255, d.data[o] * f); d.data[o + 1] = Math.min(255, d.data[o + 1] * f); d.data[o + 2] = Math.min(255, d.data[o + 2] * f); };
    const combos = ['', 'n', 's', 'e', 'w', 'ns', 'ne', 'nw', 'se', 'sw', 'ew', 'nse', 'nsw', 'new', 'sew', 'nsew'];
    for (const edges of combos) {
      const d = Gfx.ctx(Gfx.canvas(TILE, TILE)).createImageData(TILE, TILE); d.data.set((edges.includes('n') ? rim : rock).data);
      if (edges.includes('s')) for (let x = 0; x < TILE; x++) { shade(d, x, 13, 0.7); shade(d, x, 14, 0.5); shade(d, x, 15, 0.35); }
      if (edges.includes('w')) for (let y = 0; y < TILE; y++) { shade(d, 0, y, 1.3); shade(d, 1, y, 1.15); shade(d, 2, y, 0.8); }
      if (edges.includes('e')) for (let y = 0; y < TILE; y++) { shade(d, 15, y, 1.3); shade(d, 14, y, 1.15); shade(d, 13, y, 0.8); }
      const c = Gfx.canvas(TILE, TILE); put(c, d);
      const name = set + '_' + (edges || 'mid');
      if (!Tiles.defs[name]) Tiles.reg(name, { kind: 'cliff', solid: true }, g => g.drawImage(c, 0, 0)); else Tiles.defs[name].frames = [c];
    }
  },
  // the four shop signs are the one drawn hanging sign with a small emblem painted on its board
  signs(board) {
    const glyphs = {
      inn_sign: g => { Gfx.rect(g, 6, 8, 5, 1, '#ffffff'); Gfx.rect(g, 6, 9, 5, 2, '#d04040'); Gfx.px(g, 6, 7, '#ffffff'); },
      shop_sign: g => { Gfx.rect(g, 7, 7, 3, 4, '#f0c040'); Gfx.px(g, 8, 8, '#a07020'); },
      weapon_sign: g => { Gfx.line(g, 6, 11, 10, 7, '#e0e8f0'); Gfx.px(g, 7, 10, '#806040'); Gfx.px(g, 10, 7, '#ffffff'); },
      sanctum_sign: g => { Gfx.rect(g, 8, 6, 1, 6, '#ffffff'); Gfx.rect(g, 6, 8, 5, 1, '#ffffff'); }
    };
    for (const [name, draw] of Object.entries(glyphs)) {
      const t = Tiles.defs[name]; if (!t) continue;
      const c = Gfx.canvas(TILE, TILE); const g = Gfx.ctx(c); g.drawImage(board, 0, 0); draw(g);
      t.frames = [c]; t.overlay = true;
    }
  },
  // the road is drawn running up the tile; a turned copy serves the stretches that run across, and a crossing is the
  // two laid together with the grass of the top one cut away
  roadSet(t, c) {
    const turn = Gfx.canvas(TILE, TILE); const g = Gfx.ctx(turn); g.translate(TILE / 2, TILE / 2); g.rotate(Math.PI / 2); g.drawImage(c, -TILE / 2, -TILE / 2);
    t.road = true; t.across = turn;
    try {
      const cross = Gfx.canvas(TILE, TILE); const cg = Gfx.ctx(cross); cg.drawImage(c, 0, 0);
      const top = Gfx.ctx(turn).getImageData(0, 0, TILE, TILE), d = top.data;
      for (let i = 0; i < d.length; i += 4) if (d[i + 1] > d[i] + 20 && d[i + 1] > d[i + 2] + 20) d[i + 3] = 0;   // green = grass, not road
      const lay = Gfx.canvas(TILE, TILE); Gfx.ctx(lay).putImageData(top, 0, 0); cg.drawImage(lay, 0, 0);
      t.cross = cross;
    } catch (e) { t.cross = turn; }   // a page opened straight from disk cannot read pixels back; the turned road will do
  }
};
