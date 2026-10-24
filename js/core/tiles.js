// ---------- Procedural tileset (16x16) ----------
'use strict';
const Tiles = {
  defs: {}, list: [], byId: [],
  // props: solid, water, kind (for autotile), anim frames, over (draw above player), enc (encounter zone)
  reg(name, props, drawFn) {
    const frames = props.frames || 1; const cvs = [];
    for (let f = 0; f < frames; f++) { const c = Gfx.canvas(16, 16); const g = Gfx.ctx(c); drawFn(g, f, seededRandom(hashStr(name) + f * 7919)); cvs.push(c); }
    const id = this.list.length;
    const t = Object.assign({ name, id, solid: false, water: false, kind: name }, props); t.frames = cvs; t.animFrames = frames;
    this.defs[name] = t; this.list.push(t); this.byId[id] = t; return t;
  },
  get(name) { const t = this.defs[name]; if (!t) { console.warn('missing tile', name); return this.defs['void']; } return t; },
  id(name) { return this.get(name).id; },
  // ----- texture helpers -----
  noiseFill(g, r, base, vars, density) {
    Gfx.rect(g, 0, 0, 16, 16, base);
    for (let i = 0; i < (density || 24); i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), pick.call(null, vars) || vars[Math.floor(r() * vars.length)]);
  },
  speckle(g, r, cols, n) { for (let i = 0; i < n; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), cols[Math.floor(r() * cols.length)]); },
  bricks(g, r, base, mortar, bh, bw) {
    bh = bh || 4; bw = bw || 8; Gfx.rect(g, 0, 0, 16, 16, base);
    for (let y = 0; y < 16; y += bh) { Gfx.hline(g, 0, y, 16, mortar); const off = ((y / bh) % 2) * (bw / 2); for (let x = off; x < 16; x += bw) Gfx.vline(g, x, y, bh, mortar); }
    for (let i = 0; i < 6; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), shade(base, 0.9));
  },
  init() {
    const T = this;
    const GRASS = '#5cb04c', GRASS_D = '#48984c', GRASS_L = '#78c458';
    const DIRT = '#c8a060', DIRT_D = '#a88048', SAND = '#ecd890', SAND_D = '#d8c070';
    const STONE = '#9aa0b0', STONE_D = '#767c8c', STONE_L = '#bcc2d0';
    const WATER = '#3878d8', WATER_D = '#2860c0', WATER_L = '#58a0f0';
    T.reg('void', { solid: true }, g => Gfx.rect(g, 0, 0, 16, 16, '#000000'));
    T.reg('black', { solid: true }, g => Gfx.rect(g, 0, 0, 16, 16, '#000000'));
    // ---- Outdoor ground ----
    T.reg('grass', { kind: 'grass', enc: true }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L, GRASS_D], 20); });
    T.reg('grass2', { kind: 'grass', enc: true }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 14); Gfx.px(g, 4, 5, GRASS_D); Gfx.px(g, 5, 4, GRASS_D); Gfx.px(g, 11, 10, GRASS_D); Gfx.px(g, 12, 9, GRASS_D); });
    T.reg('tallgrass', { kind: 'grass', enc: true, encHigh: true }, (g, f, r) => { T.noiseFill(g, r, GRASS_D, [GRASS, '#3c8040'], 24); for (let i = 0; i < 7; i++) { const x = Math.floor(r() * 14), y = 4 + Math.floor(r() * 10); Gfx.vline(g, x, y - 4, 5, GRASS_L); Gfx.vline(g, x + 1, y - 3, 4, GRASS); } });
    T.reg('flowers', { kind: 'grass' }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 14); const cols = ['#f8f0f0', '#f8d040', '#f07090', '#90b0f8']; for (let i = 0; i < 4; i++) { const x = 2 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 12); Gfx.px(g, x, y, cols[i % 4]); Gfx.px(g, x + 1, y, cols[i % 4]); Gfx.px(g, x, y + 1, cols[i % 4]); Gfx.px(g, x + 1, y + 1, cols[i % 4]); } });
    T.reg('dirt', { kind: 'dirt' }, (g, f, r) => { T.noiseFill(g, r, DIRT, [DIRT_D, tint(DIRT, 0.15)], 18); });
    T.reg('path', { kind: 'dirt' }, (g, f, r) => { T.noiseFill(g, r, '#d8b878', [DIRT, '#e8c888', DIRT_D], 22); });
    T.reg('sand', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, SAND, [SAND_D, '#f8e8a8'], 18); });
    T.reg('sand_high', { kind: 'sand' }, (g, f, r) => { T.noiseFill(g, r, '#ecc4a4', ['#e4bc9c', '#f0ccac', '#e8c0a0'], 14); T.speckle(g, r, ['#d8b090', '#f4d4b4'], 5); });   // the upper sand of Yampi's plateaus, rose-tinted in the picture
    T.reg('sandsoft', { kind: 'sand', softsand: true }, (g, f, r) => { T.noiseFill(g, r, '#e8cc80', [SAND_D, '#d0b060'], 22); Gfx.hline(g, 2, 5, 5, '#d0b060'); Gfx.hline(g, 8, 10, 6, '#d0b060'); });
    T.reg('cobble', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, STONE_D); for (let y = 0; y < 16; y += 4) for (let x = ((y / 4) % 2) * 2; x < 16; x += 5) { Gfx.rect(g, x, y, 4, 3, STONE); Gfx.px(g, x, y, STONE_L); } });
    T.reg('stonefloor', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, STONE, STONE_D, 8, 8); Gfx.px(g, 1, 1, STONE_L); Gfx.px(g, 9, 9, STONE_L); });
    T.reg('marble', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8d8e8', '#b0b0c8', 8, 8); Gfx.px(g, 2, 2, '#f0f0f8'); Gfx.px(g, 10, 10, '#f0f0f8'); });
    T.reg('snow', { kind: 'snow', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0', '#ffffff'], 16); });
    T.reg('ice', { kind: 'ice', slippery: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b8e0f8'); Gfx.line(g, 2, 3, 9, 8, '#e0f4ff'); Gfx.line(g, 10, 2, 14, 13, '#e0f4ff'); Gfx.px(g, 4, 12, '#90c8e8'); Gfx.px(g, 12, 6, '#90c8e8'); });
    T.reg('swamp', { kind: 'swamp', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#587848', ['#486838', '#688858', '#405830'], 24); Gfx.rect(g, 3 + f, 6, 4, 2, '#38583c'); Gfx.rect(g, 9, 11, 5, 2, '#38583c'); });
    T.reg('lavarock', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#584040', ['#483030', '#685050'], 20); });
    T.reg('lava', { kind: 'lava', solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#e05020'); for (let i = 0; i < 10; i++) { const x = Math.floor(r() * 16), y = Math.floor(r() * 16); Gfx.rect(g, (x + f * 2) % 16, y, 3, 1, '#f8a030'); } Gfx.px(g, (3 + f * 3) % 16, 5, '#ffe060'); Gfx.px(g, (11 + f * 2) % 16, 12, '#ffe060'); });
    T.reg('water_hop', { kind: 'water', water: true, solid: true, hop: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); for (let i = 0; i < 5; i++) { const y = (i * 3 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 16, y, 4, WATER_L); } Gfx.px(g, (f * 4 + 2) % 16, 9, WATER_D); });   // water one tile wide between footings: hopped
    T.reg('water', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); for (let i = 0; i < 5; i++) { const y = (i * 3 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 16, y, 4, WATER_L); } Gfx.px(g, (f * 4 + 2) % 16, 9, WATER_D); });
    // the shallows at a river's edge, walked through with wet feet
    T.reg('shallow', { kind: 'water', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER_L); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 16, y, 3, '#c8e8f8'); } Gfx.px(g, (f * 4 + 3) % 16, 11, WATER); Gfx.px(g, (f * 5 + 9) % 16, 4, '#d8c890'); });
    T.reg('stepstone', { kind: 'bridge', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); for (let i = 0; i < 3; i++) { const y = (i * 5 + f) % 16; Gfx.hline(g, (i * 6 + f * 2) % 16, y, 3, WATER_L); } Gfx.ellipse(g, 8, 9, 7, 5, '#6a6a78'); Gfx.ellipse(g, 8, 8, 6, 4, '#9a9aa8'); Gfx.ellipse(g, 7, 7, 3, 2, '#b8b8c4'); });
    // an underground stream: dark, and narrow enough to jump where it is one tile wide
    T.reg('cave_water', { kind: 'water', water: true, solid: true, hop: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1e6878'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 12, y, 4, '#3a98a8'); } Gfx.px(g, (f * 3) % 16, (f * 7) % 16, '#5ac0d0'); });
    T.reg('deepwater', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2050b0'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 6 + f * 2) % 16, y, 3, '#3870d0'); } });
    // a puddle on the grass is a ground tile, so it paints its grass first; the bare ellipse is what a puddle object lays over whatever ground it sits on
    T.reg('puddle', { kind: 'grass', puddle: true, solid: true }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 14); Gfx.ellipse(g, 8, 9, 6, 4, WATER_L); Gfx.ellipse(g, 8, 9, 5, 3, WATER); Gfx.px(g, 6, 8, '#a0d0ff'); });
    T.reg('puddle_top', { kind: 'grass', puddle: true, solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 6, 4, WATER_L); Gfx.ellipse(g, 8, 9, 5, 3, WATER); Gfx.px(g, 6, 8, '#a0d0ff'); });
    T.reg('sand_puddle', { kind: 'sand' }, (g, f, r) => { T.noiseFill(g, r, '#e8d090', ['#dcc484', '#f0d89c'], 12); Gfx.ellipse(g, 8, 9, 6, 4, '#c8a860'); Gfx.ellipse(g, 8, 9, 4, 2, '#b89850'); Gfx.ellipse(g, 7, 8, 2, 1, '#d8b870'); });   // a dip in the sand where something lies under it (Scoop)
    T.reg('puddle_dry', { kind: 'grass' }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D], 10); Gfx.ellipse(g, 8, 9, 6, 4, DIRT_D); Gfx.ellipse(g, 8, 9, 5, 3, DIRT); });
    T.reg('puddle_water', { kind: 'puddle', puddle: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.ellipse(g, 8, 9, 6, 4, WATER_L); Gfx.ellipse(g, 8, 9, 5, 3, '#78b8f8'); Gfx.px(g, 6 + (f % 2), 8, '#ffffff'); });   // a puddle sitting in a pool: Frost makes it a stepping stone
    T.reg('puddle_cave', { kind: 'cave', puddle: true, solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 6, 4, WATER_L); Gfx.ellipse(g, 8, 9, 5, 3, WATER); Gfx.px(g, 6, 8, '#a0d0ff'); });
    // ---- Cliffs / mountains ----
    T.reg('cliff', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8a7a68', ['#7a6a58', '#9a8a78'], 16); Gfx.hline(g, 0, 0, 16, '#a89880'); Gfx.hline(g, 0, 15, 16, '#5a4a38'); for (let i = 0; i < 3; i++) Gfx.vline(g, 3 + i * 5, 3 + i, 5, '#6a5a48'); });
    T.reg('cliff_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8a7a68', ['#7a6a58', '#9a8a78', '#847462'], 22); });   // the rock inside a thick cliff band
    T.reg('clifftop', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6c9c4c', ['#5c8c44', '#7cac58'], 14); });
    // the sixteen edge pieces a band of rock painted from a picture can need, put together from the top and the face
    // above: a piece with open ground below it shows the face on its lower half, so even a band one tile thick reads
    // as a wall; open ground beside it darkens that side, and the top edge gets its light rim. The same builder makes
    // the snow-topped set of the north (tops white, faces the pale rock of Imil's banks)
    const cliffSet = (name, topT, faceT, midT, rim, sideTop, sideFace, dark) => {
      const top = T.defs[topT].frames[0], face = T.defs[faceT].frames[0], mid = T.defs[midT].frames[0];
      for (const ed of ['n', 's', 'e', 'w', 'ns', 'ne', 'nw', 'se', 'sw', 'ew', 'nse', 'nsw', 'new', 'sew', 'nsew']) {
        T.reg(name + '_' + ed, { kind: 'cliff', solid: true }, g => {
          g.drawImage(ed.includes('s') || ed.includes('n') ? top : mid, 0, 0);
          if (ed.includes('s')) { g.drawImage(face, 0, 0, 16, 9, 0, 7, 16, 9); }
          if (ed.includes('n')) Gfx.hline(g, 0, 0, 16, rim);
          if (ed.includes('e')) { Gfx.vline(g, 15, 0, 16, dark); Gfx.vline(g, 14, 0, 16, ed.includes('s') ? sideFace : sideTop); }
          if (ed.includes('w')) { Gfx.vline(g, 0, 0, 16, dark); Gfx.vline(g, 1, 0, 16, ed.includes('s') ? sideFace : sideTop); }
        });
      }
      if (!T.defs[name + '_mid']) T.defs[name + '_mid'] = T.defs[midT];   // the rock inside a thick band, as paint() names it
      T.reg(name + '_face', { kind: 'cliff', solid: true }, g => { g.drawImage(face, 0, 1, 16, 14, 0, 0, 16, 16); });
      T.reg(name + '_face_w', { kind: 'cliff', solid: true }, g => { g.drawImage(face, 0, 1, 16, 14, 0, 0, 16, 16); Gfx.vline(g, 0, 0, 16, dark); });
      T.reg(name + '_face_e', { kind: 'cliff', solid: true }, g => { g.drawImage(face, 0, 1, 16, 14, 0, 0, 16, 16); Gfx.vline(g, 15, 0, 16, dark); });
    };
    cliffSet('cliff', 'clifftop', 'cliff', 'cliff_mid', '#8cbc68', '#5c8c44', '#5a4a38', '#4a3a28');
    T.reg('snowcliff_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8eef8', ['#d8e0f0', '#f4f8ff'], 12); });
    T.reg('snowcliff_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a89070', ['#987f60', '#b8a080'], 16); Gfx.hline(g, 0, 0, 16, '#e8eef8'); Gfx.hline(g, 0, 15, 16, '#6a5a48'); for (let i = 0; i < 3; i++) Gfx.vline(g, 3 + i * 5, 3 + i, 5, '#8a7458'); });
    T.reg('snowcliff_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a89070', ['#987f60', '#b8a080', '#a08868'], 22); });
    cliffSet('snowcliff', 'snowcliff_top', 'snowcliff_face', 'snowcliff_mid', '#ffffff', '#c8d0e0', '#8a7458', '#5a4a38');
    // Fuchin Falls Cave: mossy green rock over dark faces that weep with water, tan sand floors, the pebbled patches
    // where the hidden path shows, the round poles standing in the pools that are hopped between
    T.reg('mosscliff_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#58a048', ['#489038', '#68b058', '#3c8038'], 18); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#8cd070'); });
    T.reg('mosscliff_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5a4838', ['#4a3828', '#6a5848'], 16); Gfx.hline(g, 0, 0, 16, '#58a048'); Gfx.hline(g, 0, 15, 16, '#302018'); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, 1, 3 + Math.floor(r() * 4), '#489038'); });
    T.reg('mosscliff_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#4a3828', ['#3a2818', '#5a4838', '#443020'], 22); });
    cliffSet('mosscliff', 'mosscliff_top', 'mosscliff_face', 'mosscliff_mid', '#8cd070', '#3c8038', '#302018', '#201810');
    // Lamakan's ridges: wind-cut sandstone, pale on top, banded on the faces
    T.reg('sandcliff_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e0c480', ['#d4b870', '#e8cc8c', '#dcc07c'], 16); });
    T.reg('sandcliff_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c09050', ['#b08448', '#c89858'], 14); Gfx.hline(g, 0, 0, 16, '#e0c480'); Gfx.hline(g, 0, 5, 16, '#a87840'); Gfx.hline(g, 0, 10, 16, '#a87840'); Gfx.hline(g, 0, 15, 16, '#7a5830'); });
    T.reg('sandcliff_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b08448', ['#a07840', '#b88c50', '#a88048'], 20); Gfx.hline(g, 0, 4, 16, '#a07840'); Gfx.hline(g, 0, 11, 16, '#a07840'); });
    cliffSet('sandcliff', 'sandcliff_top', 'sandcliff_face', 'sandcliff_mid', '#f0dca0', '#d4b870', '#9c7038', '#7a5830');
    // a wood's canopy as a cliff set: the tops are the leaf roof, the face is the trunks along its southern edge
    T.reg('canopy_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#2c6a34', ['#245c2c', '#347a3c', '#3c8844'], 18); });
    T.reg('canopy_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#2c6a34', ['#245c2c', '#347a3c'], 12); Gfx.rect(g, 0, 8, 16, 8, '#1c3c20'); for (let x = 2; x < 16; x += 6) { Gfx.rect(g, x, 6, 3, 10, '#5a3a20'); Gfx.vline(g, x + 3, 6, 10, '#3a2410'); } });
    T.reg('canopy_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#2c6a34', ['#245c2c', '#347a3c'], 18); });
    cliffSet('canopy', 'canopy_top', 'canopy_face', 'canopy_mid', '#58a860', '#3c8844', '#1c3c20', '#142c18');
    // Lunpa's fortress rock: the cavern set's shapes until its own purple pictures arrive
    T.reg('lf_walltop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#3a2c50', ['#30244a', '#443458'], 16); });
    T.reg('lf_wall', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5a4a70', ['#4a3c60', '#6a5a80'], 20); Gfx.hline(g, 0, 15, 16, '#2a2038'); Gfx.rect(g, 2, 3, 5, 4, '#665878'); Gfx.rect(g, 9, 8, 5, 4, '#665878'); });
    // Altmiller Cave: pale crystal ridges over navy faces, sand floors, the rock clusters and coloured crystals of its rooms
    T.reg('alt_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a8ccec', ['#98bce0', '#b8d8f4', '#c8e4f8'], 16); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 13), y = Math.floor(r() * 13); Gfx.rect(g, x, y, 3, 3, '#dceefc'); Gfx.px(g, x + 1, y + 1, '#f4faff'); } });
    T.reg('alt_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#2c4890', ['#24387c', '#3454a0', '#2c4088'], 14); Gfx.hline(g, 0, 0, 16, '#c8e4f8'); Gfx.hline(g, 0, 1, 16, '#88b0e0'); Gfx.hline(g, 0, 15, 16, '#142860'); for (let i = 0; i < 2; i++) { const x = 2 + Math.floor(r() * 10), y = 4 + Math.floor(r() * 8); Gfx.rect(g, x, y, 2, 4, '#4870b8'); Gfx.px(g, x, y, '#98c0e8'); } });
    T.reg('alt_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#24387c', ['#1c2c68', '#2c4488', '#203474'], 18); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#4870b8'); });
    cliffSet('crystal', 'alt_top', 'alt_face', 'alt_mid', '#dceefc', '#88b0e0', '#1c2c68', '#101c48');
    T.reg('alt_torch', { kind: 'wall', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#2c4890', ['#24387c', '#3454a0'], 14); Gfx.hline(g, 0, 15, 16, '#142860'); Gfx.rect(g, 5, 9, 6, 5, '#6a5a48'); Gfx.rect(g, 4, 8, 8, 2, '#8a7a60'); Gfx.ellipse(g, 8, 6, 3 + f, 4, '#f08020'); Gfx.ellipse(g, 8, 6, 2, 3 - f, '#ffd040'); Gfx.px(g, 7 + f, 2 - f, '#ffe080'); });
    T.reg('alt_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#2c4890', ['#24387c', '#3454a0'], 14); Gfx.rect(g, 3, 5, 10, 11, '#060a1c'); Gfx.ellipse(g, 8, 5, 5, 4, '#060a1c'); Gfx.hline(g, 0, 0, 16, '#c8e4f8'); });
    T.reg('alt_door_shut', { kind: 'door', solid: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#2c4890', ['#24387c', '#3454a0'], 14); Gfx.rect(g, 3, 5, 10, 11, '#060a1c'); Gfx.ellipse(g, 8, 5, 5, 4, '#060a1c'); Gfx.rect(g, 4, 6 + f, 8, 9, 'rgba(200,240,255,0.55)'); Gfx.vline(g, 6, 6, 10, '#e8fcff'); Gfx.vline(g, 10, 7, 9, '#e8fcff'); Gfx.hline(g, 0, 0, 16, '#c8e4f8'); });
    T.reg('crystal_rock', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 11, 7, 4, '#1c2c68'); Gfx.ellipse(g, 6, 9, 4, 5, '#2c4890'); Gfx.ellipse(g, 10, 8, 4, 5, '#3454a0'); Gfx.rect(g, 5, 5, 2, 4, '#88b0e0'); Gfx.rect(g, 10, 4, 2, 3, '#c8e4f8'); Gfx.px(g, 6, 5, '#f4faff'); Gfx.px(g, 10, 4, '#f4faff'); });
    const gem = (name, col, colL, colD) => {
      T.reg('gem_' + name, { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 13, 6, 2, '#1c2c68'); Gfx.tri(g, 3, 13, 8, 2, 13, 13, colD); Gfx.tri(g, 5, 13, 8, 4, 11, 13, col); Gfx.tri(g, 6, 12, 8, 6, 9, 12, colL); });
      T.reg('gem_' + name + '_lit', { kind: 'statue', solid: true, frames: 2, light: true }, (g, f, r) => { Gfx.ellipse(g, 8, 13, 7, 3, colL); Gfx.tri(g, 3, 13, 8, 2, 13, 13, col); Gfx.tri(g, 5, 13, 8, 4, 11, 13, colL); Gfx.tri(g, 6, 12, 8, 6, 9, 12, '#ffffff'); Gfx.px(g, 8, 1 + f, '#ffffff'); Gfx.px(g, 2 + f, 8, '#ffffff'); Gfx.px(g, 13 - f, 8, '#ffffff'); });
    };
    gem('blue', '#3060e0', '#80a8ff', '#1838a0'); gem('green', '#40c040', '#a0ff90', '#208030'); gem('pink', '#e050c0', '#ffa0f0', '#902080'); gem('cyan', '#40d0e0', '#a0ffff', '#2090a8'); gem('white', '#d0d8f0', '#ffffff', '#9098c0');
    // Gondowan Cave: grey rock, mossy floors, its torches, doorways and boulders
    T.reg('gc_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8c8c94', ['#7c7c84', '#9c9ca4', '#888890'], 16); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); Gfx.rect(g, x, y, 4, 3, '#a4a4ac'); Gfx.hline(g, x, y + 3, 4, '#686870'); } });
    T.reg('gc_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c5c64', ['#505058', '#686870'], 14); Gfx.hline(g, 0, 0, 16, '#b0b0b8'); Gfx.hline(g, 0, 15, 16, '#303038'); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, 2 + Math.floor(r() * 4), 4 + Math.floor(r() * 6), '#404048'); });
    T.reg('gc_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#505058', ['#444450', '#5c5c64'], 16); });
    cliffSet('greyrock', 'gc_top', 'gc_face', 'gc_mid', '#b8b8c0', '#787880', '#404048', '#282830');
    T.reg('gc_torch', { kind: 'wall', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#5c5c64', ['#505058', '#686870'], 14); Gfx.hline(g, 0, 15, 16, '#303038'); Gfx.rect(g, 5, 9, 6, 5, '#6a5a48'); Gfx.rect(g, 4, 8, 8, 2, '#8a7a60'); Gfx.ellipse(g, 8, 6, 3 + f, 4, '#f08020'); Gfx.ellipse(g, 8, 6, 2, 3 - f, '#ffd040'); Gfx.px(g, 7 + f, 2 - f, '#ffe080'); });
    T.reg('gc_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#5c5c64', ['#505058', '#686870'], 14); Gfx.rect(g, 3, 5, 10, 11, '#08080c'); Gfx.ellipse(g, 8, 5, 5, 4, '#08080c'); Gfx.hline(g, 0, 0, 16, '#b0b0b8'); });
    T.reg('grey_rock', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 11, 7, 4, '#3c3c44'); Gfx.ellipse(g, 6, 9, 4, 5, '#7c7c84'); Gfx.ellipse(g, 10, 8, 4, 5, '#8c8c94'); Gfx.ellipse(g, 6, 8, 2, 2, '#a4a4ac'); Gfx.px(g, 10, 6, '#b8b8c0'); });
    T.reg('cave_moss', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#6c8438', ['#5c7430', '#7c9440', '#647c34'], 16); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.rect(g, x, y, 2, 2, '#8ca850'); } Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#a0a0a8'); });
    // Suhalla: purple rock streams, adobe and sand-brick houses, the teal shrubs of the desert's edge
    T.reg('pr_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#9868c8', ['#8858b8', '#a878d8', '#9060c0'], 16); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#c8a0f0'); });
    T.reg('pr_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6c40a0', ['#603890', '#7848b0'], 14); Gfx.hline(g, 0, 0, 16, '#b890e0'); Gfx.hline(g, 0, 15, 16, '#3c2060'); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, 3 + Math.floor(r() * 3), 4 + Math.floor(r() * 5), '#502c80'); });
    T.reg('pr_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#603890', ['#583080', '#6c40a0'], 16); });
    cliffSet('purplerock', 'pr_top', 'pr_face', 'pr_mid', '#c8a0f0', '#8858b8', '#3c2060', '#281448');
    T.reg('wall_adobe', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8c890', ['#dcbc84', '#f0d09c'], 8); Gfx.hline(g, 0, 15, 16, '#a88050'); Gfx.hline(g, 0, 0, 16, '#f4dcb0'); });
    T.reg('door_adobe', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#e8c890', ['#dcbc84', '#f0d09c'], 8); Gfx.rect(g, 3, 3, 10, 13, '#3a2810'); Gfx.rect(g, 4, 4, 8, 12, '#584020'); Gfx.hline(g, 0, 0, 16, '#f4dcb0'); Gfx.px(g, 10, 10, '#e0c040'); });
    T.reg('wall_sandbrick', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#e0b848', '#b89030', 4, 8); Gfx.hline(g, 0, 15, 16, '#886820'); });
    T.reg('desert_shrub', { kind: 'bush', solid: true }, (g, f, r) => { for (const [x0, y0, x1, y1] of [[8, 13, 2, 4], [8, 13, 14, 3], [8, 13, 5, 1], [8, 13, 11, 1], [8, 13, 8, 0]]) Gfx.line(g, x0, y0, x1, y1, '#40b0a0'); for (const [x0, y0, x1, y1] of [[8, 13, 4, 7], [8, 13, 12, 6]]) Gfx.line(g, x0, y0, x1, y1, '#70d8c8'); Gfx.rect(g, 7, 12, 3, 3, '#308878'); });
    // Suhalla Gate: the brown rock of the pass and its cave mouths; the desert's cacti and whirlwinds
    T.reg('br_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8c6c48', ['#7c5c3c', '#9c7c54', '#84643f'], 16); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b08c60'); });
    T.reg('br_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6c4c30', ['#5c3c24', '#7c5838'], 14); Gfx.hline(g, 0, 0, 16, '#b08c60'); Gfx.hline(g, 0, 15, 16, '#3c2414'); for (let i = 0; i < 4; i++) Gfx.vline(g, 1 + i * 4, 1 + Math.floor(r() * 3), 6 + Math.floor(r() * 8), '#503020'); });
    T.reg('br_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c3c24', ['#503320', '#68482c'], 16); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, Math.floor(r() * 8), 6, '#4a2c1a'); });
    cliffSet('brownrock', 'br_top', 'br_face', 'br_mid', '#c8a070', '#8c6c48', '#3c2414', '#281808');
    T.reg('sg_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#6c4c30', ['#5c3c24', '#7c5838'], 14); Gfx.rect(g, 3, 5, 10, 11, '#0c0804'); Gfx.ellipse(g, 8, 5, 5, 4, '#0c0804'); Gfx.hline(g, 0, 0, 16, '#b08c60'); });
    T.reg('sd_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#c09050', ['#b08448', '#c89858'], 14); Gfx.rect(g, 3, 5, 10, 11, '#1c1408'); Gfx.ellipse(g, 8, 5, 5, 4, '#1c1408'); Gfx.hline(g, 0, 0, 16, '#e0c480'); });
    T.reg('cactus', { kind: 'bush', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 3, 4, 13, '#3c8848'); Gfx.rect(g, 2, 6, 3, 5, '#3c8848'); Gfx.rect(g, 2, 6, 5, 2, '#3c8848'); Gfx.rect(g, 11, 4, 3, 6, '#3c8848'); Gfx.rect(g, 9, 8, 5, 2, '#3c8848'); Gfx.vline(g, 7, 3, 13, '#58a860'); Gfx.px(g, 8, 2, '#f0a0c0'); });
    T.reg('whirlwind', { kind: 'stone', frames: 3 }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6 - f, 2, '#a8c8f0'); Gfx.ellipse(g, 8 + f - 1, 10, 4, 2, '#c0dcf8'); Gfx.ellipse(g, 8 - f + 1, 6, 3, 2, '#d8ecff'); Gfx.ellipse(g, 8, 2, 2, 1, '#f0f8ff'); Gfx.px(g, 6 + f, 12, '#ffffff'); Gfx.px(g, 10 - f, 8, '#ffffff'); });
    T.reg('whirlwind_big', { kind: 'stone', frames: 3 }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 7 - f, 3, '#d8c8a0'); Gfx.ellipse(g, 8 + f - 1, 9, 6, 3, '#e8dcc0'); Gfx.ellipse(g, 8 - f + 1, 4, 4, 2, '#f4ecd8'); Gfx.px(g, 5 + f, 12, '#ffffff'); Gfx.px(g, 11 - f, 7, '#ffffff'); });
    // Lalivero's golden obelisk, two tiles tall: the spire hangs over the party, the base stands in the way
    T.reg('obelisk', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 4, 10, 8, 6, '#b89030'); Gfx.rect(g, 3, 14, 10, 2, '#8a6820'); Gfx.rect(g, 5, 0, 6, 10, '#e0b840'); Gfx.vline(g, 5, 0, 10, '#f8e080'); Gfx.vline(g, 10, 0, 10, '#a07c28'); Gfx.hline(g, 4, 10, 8, '#f8e080'); });
    T.reg('obelisk_top', { kind: 'statue', solid: false, over: true }, (g, f, r) => { Gfx.tri(g, 5, 16, 8, 2, 11, 16, '#e0b840'); Gfx.tri(g, 5, 16, 8, 2, 8, 16, '#f8e080'); Gfx.px(g, 8, 1, '#ffffff'); Gfx.px(g, 8, 0, '#fff8c0'); });
    // Kandorean Temple: purple stone, olive tiled floors, and the mossy teal rock of the caves beneath it
    T.reg('wall_kandor', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#9878d0', '#6850a0', 4, 8); Gfx.hline(g, 0, 15, 16, '#483070'); });
    T.reg('kandor_top', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#584088', ['#503878', '#604898'], 12); Gfx.hline(g, 0, 0, 16, '#b898e8'); });
    T.reg('door_kandor', { kind: 'door', door: true }, (g, f, r) => { T.bricks(g, r, '#9878d0', '#6850a0', 4, 8); Gfx.rect(g, 3, 3, 10, 13, '#1c1030'); Gfx.ellipse(g, 8, 3, 5, 3, '#1c1030'); Gfx.rect(g, 4, 0, 8, 1, '#c8b0f0'); });
    T.reg('window_kandor', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#9878d0', '#6850a0', 4, 8); Gfx.rect(g, 5, 4, 6, 8, '#2c1848'); Gfx.rect(g, 6, 5, 4, 6, '#f0d878'); Gfx.hline(g, 0, 15, 16, '#483070'); });
    T.reg('floor_kandor', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#b8a868', '#8c7c48', 8, 8); Gfx.px(g, 2, 2, '#d0c080'); Gfx.px(g, 10, 10, '#d0c080'); });
    T.reg('moss_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#88c8a0', ['#78b890', '#98d8b0', '#80c098'], 16); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#c0f0d0'); });
    T.reg('moss_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#3c8888', ['#307878', '#489898'], 14); Gfx.hline(g, 0, 0, 16, '#a0e0c0'); Gfx.hline(g, 0, 15, 16, '#184848'); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, 2 + Math.floor(r() * 3), 4 + Math.floor(r() * 6), '#286868'); });
    T.reg('moss_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#307878', ['#286868', '#388888'], 16); });
    cliffSet('mossrock', 'moss_top', 'moss_face', 'moss_mid', '#c0f0d0', '#78b890', '#184848', '#103030');
    // Dehkan Plateau: tan sand terraces edged with grey-purple rock faces, sage grass, purple boulders, the cracked
    // ground and the black holes it opens into, the lilac caves underneath with the beams of light where the party lands
    T.reg('antlion_pit', { kind: 'sand' }, (g, f, r) => { T.noiseFill(g, r, SAND, [SAND_D, '#f8e8a8'], 18); Gfx.ellipse(g, 8, 9, 7, 5, '#c8a860'); Gfx.ellipse(g, 8, 9, 5, 3, '#a88848'); Gfx.ellipse(g, 8, 10, 3, 2, '#3c2c18'); Gfx.line(g, 5, 8, 3, 4, '#5c4020'); Gfx.line(g, 11, 8, 13, 4, '#5c4020'); Gfx.px(g, 6, 7, '#e0d0a0'); Gfx.px(g, 10, 7, '#e0d0a0'); });
    T.reg('cloak_ball', { kind: 'item' }, (g, f, r) => { Gfx.rect(g, 5, 11, 6, 3, '#6a5a48'); Gfx.rect(g, 4, 13, 8, 2, '#4a3a28'); Gfx.circle(g, 8, 8, 4, '#101018'); Gfx.circle(g, 7, 7, 2, '#383848'); Gfx.px(g, 6, 6, '#8080a0'); });
    T.reg('puddle_gap', { kind: 'pit', solid: true, puddle: true }, (g, f, r) => { T.noiseFill(g, r, '#181420', ['#100c18', '#201828'], 8); Gfx.ellipse(g, 8, 9, 6, 3, '#4878b0'); Gfx.ellipse(g, 7, 8, 3, 1, '#88b8e0'); });
    if (!T.defs.waterfall) T.reg('waterfall', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3878d0'); for (let i = 0; i < 6; i++) Gfx.vline(g, (i * 3 + 1), (f * 4 + i * 5) % 16, 6, '#c8e8ff'); Gfx.hline(g, 0, 15 - f, 16, '#e8f4ff'); });
    // a dark arched doorway in a sanctum wall: the passage beyond, with a stone post either side (or one side of a wide arch)
    const arch = (name, left, right) => T.reg(name, { kind: 'door', door: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#141018'); Gfx.rect(g, 0, 0, 16, 3, '#2a2230'); Gfx.rect(g, 3, 3, 10, 2, '#1e1826'); if (left) { Gfx.rect(g, 0, 0, 3, 16, '#b0a080'); Gfx.rect(g, 0, 0, 1, 16, '#8a7a5a'); Gfx.rect(g, 1, 4, 1, 12, '#d0c0a0'); } if (right) { Gfx.rect(g, 13, 0, 3, 16, '#b0a080'); Gfx.rect(g, 15, 0, 1, 16, '#8a7a5a'); Gfx.rect(g, 14, 4, 1, 12, '#d0c0a0'); } for (let y = 6; y < 16; y += 3) Gfx.hline(g, left ? 4 : 0, y, right ? 8 + (left ? 0 : 4) : 12 + (left ? 0 : 4), '#1c1622'); });
    arch('temple_arch', true, true); arch('temple_arch_l', true, false); arch('temple_arch_r', false, true);
    // the sideways ramps of Vale's terraces: a slope of packed earth cut slantwise across the cliff face, walked
    // diagonally (field.js rampTarget); 'ne' rises to the upper right, 'nw' to the upper left
    const ramp = (name, ne) => T.reg(name, { kind: 'stairs', ramp: ne ? 'ne' : 'nw', solid: false }, (g, f, r) => {
      const X = (i) => ne ? i : 15 - i;   // drawn over the cliff face it is cut into: the band, its lip, its shadow, and nothing else
      for (let i = -6; i < 22; i++) { const y = 15 - i; Gfx.rect(g, X(i) - 6, y, 11, 1, '#c8a468'); Gfx.rect(g, X(i) + 4, y, 2, 1, '#e8d4a4'); Gfx.px(g, X(i) + 6, y, '#9a8058'); Gfx.rect(g, X(i) - 8, y, 2, 1, '#3a2c20'); Gfx.px(g, X(i) - 9, y, '#46382a'); }
      for (let i = -6; i < 22; i += 3) { const y = 15 - i; Gfx.rect(g, X(i) - 6, y, 10, 1, '#8a6c44'); Gfx.rect(g, X(i) - 6, y - 1, 10, 1, '#dcbc84'); }
    });
    ramp('ramp_ne', true); ramp('ramp_nw', false);
    // a sealed stone door in a sanctum wall: a slab with a sun mark, shut until something opens it
    T.reg('gate_stone', { kind: 'door', solid: true, locked: true }, (g, f, r) => { T.bricks(g, r, '#c8b898', '#a09070', 4, 8); Gfx.rect(g, 2, 1, 12, 15, '#8a7c66'); Gfx.rect(g, 3, 2, 10, 13, '#a89880'); Gfx.vline(g, 8, 2, 13, '#6a5c48'); Gfx.circle(g, 8, 7, 3, '#d8b860'); Gfx.circle(g, 8, 7, 1, '#8a7030'); Gfx.hline(g, 3, 14, 10, '#6a5c48'); });
    T.reg('cb_floor', { kind: 'floor' }, (g, f, r) => { T.bricks(g, r, '#c0a0c0', '#9c7c9c', 8, 8); T.speckle(g, r, ['#b494b4', '#ccaccc'], 6); });
    T.reg('cb_slide', { kind: 'stairs', hole: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c8b070'); for (let y = 1; y < 16; y += 3) Gfx.hline(g, 2, y, 12, '#e0cc90'); Gfx.rect(g, 0, 0, 2, 16, '#7a6040'); Gfx.rect(g, 14, 0, 2, 16, '#7a6040'); });
    T.reg('cb_pedestal', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3a2838'); Gfx.rect(g, 2, 2, 12, 12, '#c8a8c0'); Gfx.rect(g, 3, 3, 10, 10, '#e0c8d8'); Gfx.rect(g, 2, 12, 12, 2, '#9a7890'); });
    T.reg('key_blue', { kind: 'floor' }, (g, f, r) => { Gfx.circle(g, 6, 6, 3, '#4080e0'); Gfx.circle(g, 6, 6, 1, '#101828'); Gfx.rect(g, 8, 5, 6, 2, '#4080e0'); Gfx.rect(g, 12, 7, 2, 2, '#4080e0'); Gfx.rect(g, 9, 7, 2, 1, '#4080e0'); });
    T.reg('key_red', { kind: 'floor' }, (g, f, r) => { Gfx.circle(g, 6, 6, 3, '#e04040'); Gfx.circle(g, 6, 6, 1, '#281010'); Gfx.rect(g, 8, 5, 6, 2, '#e04040'); Gfx.rect(g, 12, 7, 2, 2, '#e04040'); Gfx.rect(g, 9, 7, 2, 1, '#e04040'); });
    T.reg('dk_sand', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#a8986c', ['#a09064', '#b0a074', '#a89870'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#948458'); });
    T.reg('dk_grass', { kind: 'grass', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#8ca070', ['#809464', '#98ac7c', '#88a06c'], 14); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 12); Gfx.px(g, x, y + 2, '#a8bc88'); Gfx.px(g, x + 1, y + 1, '#a8bc88'); } });
    T.reg('dk_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8c8078', ['#807470', '#988c84', '#8a7e76'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#a8a098'); });
    T.reg('dk_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6c5c78', ['#605068', '#786888'], 14); Gfx.hline(g, 0, 0, 16, '#a89c90'); Gfx.hline(g, 0, 15, 16, '#302848'); for (let i = 0; i < 4; i++) Gfx.vline(g, 1 + i * 4, 1 + Math.floor(r() * 3), 6 + Math.floor(r() * 8), '#3c3058'); Gfx.vline(g, 3 + Math.floor(r() * 10), 2, 10, '#8c7c98'); });
    T.reg('dk_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c4c68', ['#503f5c', '#685874'], 16); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, Math.floor(r() * 8), 6, '#3c3058'); });
    cliffSet('plateau', 'dk_top', 'dk_face', 'dk_mid', '#b8ac9c', '#8c8078', '#302848', '#201838');
    T.reg('dk_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#6c5c78', ['#605068', '#786888'], 14); Gfx.rect(g, 3, 5, 10, 11, '#0c0810'); Gfx.ellipse(g, 8, 5, 5, 4, '#0c0810'); Gfx.hline(g, 0, 0, 16, '#a89c90'); });
    T.reg('dk_boulder', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 4, '#3c3058'); Gfx.ellipse(g, 8, 8, 6, 5, '#6c5880'); Gfx.ellipse(g, 7, 7, 4, 3, '#8870a0'); Gfx.px(g, 6, 5, '#a890c0'); Gfx.px(g, 5, 6, '#a890c0'); });
    T.reg('dk_hole', { kind: 'hole', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#a8986c', ['#a09064', '#b0a074'], 14); Gfx.ellipse(g, 8, 9, 7, 5, '#3c3020'); Gfx.ellipse(g, 8, 8, 6, 4, '#000000'); });
    T.reg('dk_crack', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#a8986c', ['#a09064', '#b0a074'], 14); Gfx.line(g, 3, 3, 8, 8, '#5c5038'); Gfx.line(g, 8, 8, 13, 4, '#5c5038'); Gfx.line(g, 8, 8, 6, 13, '#5c5038'); Gfx.line(g, 8, 8, 12, 12, '#5c5038'); Gfx.px(g, 8, 8, '#3c3020'); });
    T.reg('dk_sky', { kind: 'void', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#88b0d8'); Gfx.rect(g, 0, 10, 16, 6, '#a8b8c8'); Gfx.tri(g, 0, 16, 5, 9, 10, 16, '#98a8b8'); Gfx.tri(g, 8, 16, 13, 11, 16, 16, '#98a8b8'); Gfx.hline(g, 2, 3, 5, '#c0d8f0'); });
    T.reg('dk_bridge', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2050b0'); Gfx.hline(g, 0, 2, 16, '#6a4a2a'); Gfx.hline(g, 0, 13, 16, '#6a4a2a'); for (let x = 0; x < 16; x += 3) { Gfx.rect(g, x, 4, 2, 8, '#b08050'); Gfx.vline(g, x + 2, 4, 8, '#7a5830'); } });
    T.reg('lc_floor', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#a8acc8', ['#a0a4c0', '#b0b4d0', '#a4a8c4'], 14); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#c0c4dc'); Gfx.px(g, x + 1, y + 1, '#8c90b0'); } });
    T.reg('lc_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8c78b0', ['#8070a4', '#9880bc', '#8874ac'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b8a4d8'); });
    T.reg('lc_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#7c60a8', ['#705498', '#886cb4'], 14); Gfx.hline(g, 0, 0, 16, '#c0a8e0'); Gfx.hline(g, 0, 15, 16, '#3c2860'); for (let i = 0; i < 4; i++) Gfx.vline(g, 1 + i * 4, 1 + Math.floor(r() * 3), 6 + Math.floor(r() * 8), '#503878'); });
    T.reg('lc_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#68509c', ['#5c4490', '#7058a8'], 16); });
    cliffSet('lilacrock', 'lc_top', 'lc_face', 'lc_mid', '#d0bce8', '#8c78b0', '#3c2860', '#281848');
    // Air's Rock: pink rock, the olive sand of its sunken passages, the bright ledges above them, the ramps between
    // the two levels, the rope climbs up its faces, the worn edges the party drops off, the Wind Stones and twister
    // rocks that Whirlwind stirs, and the drifts of sand and smears of mud they blow away
    T.reg('pk_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c88098', ['#d890a8', '#b87088', '#c08090'], 16); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#e8a8c0'); Gfx.px(g, x + 1, y + 1, '#a06078'); } });
    T.reg('pk_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b86880', ['#a85870', '#c07890'], 14); Gfx.hline(g, 0, 0, 16, '#e8a8c0'); Gfx.hline(g, 0, 15, 16, '#6c3048'); for (let i = 0; i < 4; i++) Gfx.vline(g, 1 + i * 4, 1 + Math.floor(r() * 3), 5 + Math.floor(r() * 8), '#904860'); });
    T.reg('pk_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a85870', ['#985068', '#b06078', '#a05470'], 16); for (let i = 0; i < 2; i++) Gfx.vline(g, 2 + i * 7, Math.floor(r() * 6), 4 + Math.floor(r() * 6), '#88405c'); });
    cliffSet('pinkrock', 'pk_top', 'pk_face', 'pk_mid', '#f0c0d0', '#c88098', '#6c3048', '#4c2038');
    T.reg('ar_floor', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8d060', ['#d0c858', '#e0d868', '#d4cc5c'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#c0b850'); });
    T.reg('ar_ledge', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#f0e058', ['#e8d848', '#f8e868', '#ecdc50'], 14); T.speckle(g, r, ['#e0d040', '#f8f080'], 4); });
    T.reg('ar_ramp', { kind: 'stairs' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#e8d848'); for (let y = 1; y < 16; y += 3) Gfx.hline(g, 1, y, 14, '#f8ec80'); for (let y = 2; y < 16; y += 3) Gfx.hline(g, 1, y, 14, '#d0c040'); Gfx.vline(g, 0, 0, 16, '#a06078'); Gfx.vline(g, 15, 0, 16, '#a06078'); });
    T.reg('pk_climb', { kind: 'ladder', ladder: true }, (g, f, r) => { T.noiseFill(g, r, '#a85870', ['#985068', '#b06078'], 14); Gfx.vline(g, 5, 0, 16, '#7a5030'); Gfx.vline(g, 10, 0, 16, '#7a5030'); for (let y = 1; y < 16; y += 4) { Gfx.hline(g, 4, y, 8, '#c89060'); Gfx.hline(g, 4, y + 1, 8, '#8a6038'); } });
    T.reg('pk_drop', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#c88098', ['#d890a8', '#b87088'], 16); Gfx.tri(g, 0, 16, 16, 16, 8, 3, '#e8d848'); Gfx.tri(g, 3, 16, 13, 16, 8, 7, '#d0c040'); Gfx.hline(g, 0, 15, 16, '#a06078'); });
    T.reg('ar_pebbles', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8d060', ['#d0c858', '#e0d868'], 14); for (let i = 0; i < 5; i++) { const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13); Gfx.ellipse(g, x, y, 2, 1, '#d890a8'); Gfx.px(g, x, y - 1, '#f0c0d0'); } });
    T.reg('windstone', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#6c3048'); Gfx.rect(g, 5, 4, 6, 10, '#9078c0'); Gfx.ellipse(g, 8, 4, 3, 3, '#a890d0'); Gfx.vline(g, 5, 4, 10, '#b8a0e0'); Gfx.vline(g, 10, 4, 10, '#604890'); Gfx.px(g, 7, 7, '#f0f0ff'); Gfx.px(g, 8, 8, '#f0f0ff'); Gfx.px(g, 9, 7, '#f0f0ff'); Gfx.px(g, 8, 6, '#f0f0ff'); Gfx.px(g, 7, 9, '#f0f0ff'); Gfx.px(g, 9, 9, '#f0f0ff'); });
    T.reg('twister_rock', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 7, 2, '#4c2038'); Gfx.tri(g, 2, 15, 14, 15, 8, 0, '#8060b0'); Gfx.tri(g, 4, 15, 12, 15, 8, 2, '#9878c8'); for (let y = 2; y < 15; y += 3) Gfx.line(g, 8 - Math.floor((y - 1) / 2), y, 8 + Math.floor((y - 1) / 2), y + 1, '#604890'); Gfx.px(g, 8, 1, '#c0a8e0'); });
    T.reg('twister_rock_top', { kind: 'statue', solid: false, over: true }, (g, f, r) => { Gfx.tri(g, 5, 16, 11, 16, 8, 4, '#8060b0'); Gfx.tri(g, 6, 16, 10, 16, 8, 6, '#9878c8'); Gfx.px(g, 8, 4, '#c0a8e0'); Gfx.line(g, 6, 12, 10, 13, '#604890'); Gfx.line(g, 7, 9, 9, 10, '#604890'); });
    T.reg('sandwall', { kind: 'stone', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#d8d060', ['#d0c858', '#e0d868'], 14); Gfx.ellipse(g, 8, 11, 8, 5, '#f0e058'); Gfx.ellipse(g, 8, 8, 6, 4, '#f8ec80'); Gfx.ellipse(g, 7, 6, 3, 2, '#fff4a0'); Gfx.ellipse(g, 8, 14, 8, 2, '#c0b850'); });
    T.reg('mudwall', { kind: 'stone', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a85870', ['#985068', '#b06078'], 14); Gfx.ellipse(g, 8, 8, 8, 8, '#8a6a30'); Gfx.ellipse(g, 7, 7, 6, 6, '#a88040'); Gfx.ellipse(g, 6, 6, 3, 3, '#c09850'); Gfx.px(g, 12, 11, '#6c5020'); Gfx.px(g, 4, 12, '#6c5020'); });
    // inside Air's Rock: tan stone floors, the dot-marked tiles before its doors, the vents in the floors, the wall
    // segments that turn to bridge its chasms, the crystal floor of the lower room
    T.reg('ar_infloor', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#c8a070', ['#c09868', '#d0a878', '#c4a06c'], 14); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#dcb888'); Gfx.px(g, x + 1, y + 1, '#a88050'); } });
    const dots = (name, n, col) => T.reg(name, { kind: 'cave' }, (g, f, r) => { T.noiseFill(g, r, '#c8a070', ['#c09868', '#d0a878'], 14); Gfx.rect(g, 2, 2, 12, 12, '#b89060'); const pos = n === 2 ? [[5, 8], [11, 8]] : n === 3 ? [[4, 8], [8, 8], [12, 8]] : n === 4 ? [[5, 5], [11, 5], [5, 11], [11, 11]] : [[4, 4], [12, 4], [8, 8], [4, 12], [12, 12]]; for (const [x, y] of pos) { Gfx.circle(g, x, y, 1.5, col); Gfx.px(g, x, y, '#ffffff'); } });
    dots('ar_dots_y2', 2, '#f0d040'); dots('ar_dots_r3', 3, '#e04040'); dots('ar_dots_b3', 3, '#4070f0'); dots('ar_dots_b4', 4, '#4070f0'); dots('ar_dots_b5', 5, '#4070f0');
    T.reg('vent', { kind: 'cave' }, (g, f, r) => { T.noiseFill(g, r, '#c8a070', ['#c09868', '#d0a878'], 14); Gfx.rect(g, 3, 3, 10, 10, '#5a4a38'); for (let y = 4; y < 13; y += 2) Gfx.hline(g, 4, y, 8, '#8a7a68'); });
    T.reg('ar_span', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.rect(g, 1, 3, 14, 10, '#a08868'); Gfx.hline(g, 1, 3, 14, '#c8b090'); Gfx.hline(g, 1, 12, 14, '#5a4a38'); for (let x = 4; x < 16; x += 5) Gfx.vline(g, x, 4, 8, '#8a7458'); });
    T.reg('ar_span_v', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.rect(g, 3, 0, 10, 16, '#a08868'); Gfx.vline(g, 3, 0, 16, '#c8b090'); Gfx.vline(g, 12, 0, 16, '#5a4a38'); for (let y = 4; y < 16; y += 5) Gfx.hline(g, 4, y, 8, '#8a7458'); });
    T.reg('ar_crystal', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#b8a8d8', ['#b0a0d0', '#c0b0e0', '#b4a4d4'], 14); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#e8e0ff'); Gfx.px(g, x + 1, y, '#9080b8'); } });
    T.reg('pillar_brown', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 3, 1, 10, 14, '#a07850'); Gfx.rect(g, 3, 1, 3, 14, '#c09868'); Gfx.rect(g, 2, 0, 12, 3, '#c09868'); Gfx.rect(g, 2, 13, 12, 3, '#6c4c30'); Gfx.hline(g, 3, 6, 10, '#6c4c30'); });
    T.reg('cone', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#404048'); Gfx.tri(g, 2, 14, 14, 14, 8, 1, '#8a8a98'); Gfx.tri(g, 4, 14, 8, 14, 8, 3, '#b0b0c0'); Gfx.px(g, 8, 1, '#d0d0e0'); });
    T.reg('ar_tablet', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 2, 10, 13, '#9088b0'); Gfx.rect(g, 4, 3, 8, 11, '#b0a8d0'); Gfx.rect(g, 2, 14, 12, 2, '#605880'); for (let y = 5; y < 13; y += 3) Gfx.hline(g, 5, y, 6, '#605880'); Gfx.px(g, 8, 4, '#f0e8ff'); });
    T.reg('mushroom', { kind: 'grass' }, (g, f, r) => { T.noiseFill(g, r, '#d8c8a0', ['#ccbc94', '#e0d0a8'], 12); Gfx.rect(g, 7, 9, 3, 5, '#e8e0c8'); Gfx.ellipse(g, 8, 8, 5, 3, '#c8a860'); Gfx.px(g, 6, 7, '#f0e0b0'); Gfx.px(g, 10, 8, '#f0e0b0'); Gfx.rect(g, 2, 11, 2, 3, '#e8e0c8'); Gfx.ellipse(g, 3, 10, 3, 2, '#c8a860'); });
    T.reg('mushroom_red', { kind: 'grass' }, (g, f, r) => { T.noiseFill(g, r, '#d8c8a0', ['#ccbc94', '#e0d0a8'], 12); Gfx.rect(g, 7, 9, 3, 5, '#e8e0c8'); Gfx.ellipse(g, 8, 8, 5, 3, '#d04040'); Gfx.px(g, 6, 7, '#ffffff'); Gfx.px(g, 10, 8, '#ffffff'); Gfx.px(g, 8, 6, '#ffffff'); });
    T.reg('campfire', { kind: 'furniture', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#d8c088', ['#ccb478', '#e0c890'], 14); Gfx.ellipse(g, 8, 13, 7, 2, '#5a4a38'); Gfx.rect(g, 3, 12, 10, 2, '#6c4c30'); Gfx.tri(g, 3, 12, 13, 12, 8, 3 + f, '#f08030'); Gfx.tri(g, 5, 12, 11, 12, 8, 6 + f, '#f8d040'); Gfx.px(g, 8, 2 - f, '#f8f0a0'); });
    // Naribwe's totem poles (two tiles tall: the base stands in the way, the painted top hangs over the party) and its fire pit
    T.reg('totem', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e0c890', ['#d4bc84', '#e8d09c'], 12); Gfx.rect(g, 5, 0, 6, 16, '#c85030'); Gfx.rect(g, 5, 4, 6, 3, '#f0e8d8'); Gfx.rect(g, 5, 10, 6, 3, '#f0e8d8'); Gfx.px(g, 6, 5, '#101010'); Gfx.px(g, 9, 5, '#101010'); Gfx.rect(g, 6, 11, 4, 1, '#3c8c3c'); Gfx.rect(g, 4, 14, 8, 2, '#8a6030'); });
    T.reg('totem_top', { kind: 'statue', solid: false, over: true }, (g, f, r) => { Gfx.rect(g, 5, 4, 6, 12, '#e8d8b8'); Gfx.ellipse(g, 8, 4, 4, 3, '#e8d8b8'); Gfx.rect(g, 5, 8, 6, 3, '#c85030'); Gfx.px(g, 6, 6, '#101010'); Gfx.px(g, 9, 6, '#101010'); Gfx.rect(g, 6, 12, 4, 2, '#3c8c3c'); Gfx.px(g, 8, 1, '#c85030'); });
    T.reg('firepit', { kind: 'furniture', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#c0a878', ['#b49c6c', '#c8b084'], 12); Gfx.ellipse(g, 8, 9, 7, 5, '#5a4a38'); Gfx.ellipse(g, 8, 9, 5, 3, '#8a6a30'); Gfx.tri(g, 4, 10, 12, 10, 8, 2 + f, '#f08030'); Gfx.tri(g, 6, 10, 10, 10, 8, 5 + f, '#f8d040'); });
    T.reg('bone', { kind: 'grass' }, (g, f, r) => { T.noiseFill(g, r, '#d8c088', ['#ccb478', '#e0c890'], 12); Gfx.line(g, 3, 11, 12, 5, '#f0ece0'); Gfx.line(g, 3, 12, 12, 6, '#f0ece0'); Gfx.ellipse(g, 3, 11, 2, 2, '#f0ece0'); Gfx.ellipse(g, 12, 6, 2, 2, '#f0ece0'); Gfx.px(g, 3, 10, '#a09880'); Gfx.px(g, 12, 7, '#a09880'); });
    T.reg('gate_wood', { kind: 'fence', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#d8c088', ['#ccb478', '#e0c890'], 12); Gfx.rect(g, 1, 2, 3, 14, '#8a6030'); Gfx.rect(g, 12, 2, 3, 14, '#8a6030'); Gfx.rect(g, 0, 4, 16, 2, '#a87848'); Gfx.rect(g, 0, 9, 16, 2, '#a87848'); Gfx.rect(g, 0, 13, 16, 2, '#a87848'); Gfx.px(g, 2, 1, '#c8a060'); Gfx.px(g, 13, 1, '#c8a060'); });
    // Kibombo: the Great Gabomba's face (four tiles), the gears and conduits inside it, the little idol
    const gabFace = (q) => (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#6c8c3c'); const L = q[1] === 'l', T_ = q[0] === 't'; Gfx.rect(g, L ? 2 : 0, T_ ? 2 : 0, 14, 14, '#8cac48'); if (T_) { Gfx.ellipse(g, L ? 11 : 5, 9, 3, 2, '#f0e060'); Gfx.px(g, L ? 11 : 5, 9, '#c02020'); Gfx.rect(g, L ? 4 : 0, 2, 12, 2, '#c8a030'); } else { Gfx.rect(g, L ? 6 : 0, 3, L ? 10 : 10, 5, '#3c2010'); Gfx.hline(g, L ? 6 : 0, 5, 10, '#d04040'); Gfx.rect(g, L ? 2 : 0, 12, 14, 3, '#c8a030'); } };
    for (const q of ['tl', 'tr', 'bl', 'br']) T.reg('gab_' + q, { kind: 'statue', solid: true }, gabFace(q));
    T.reg('cog', { kind: 'stone', frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.circle(g, 8, 8, 6, '#b0a060'); for (let k = 0; k < 8; k++) { const a = (k + f * 0.5) * Math.PI / 4; Gfx.rect(g, Math.round(8 + Math.cos(a) * 6.5) - 1, Math.round(8 + Math.sin(a) * 6.5) - 1, 2, 2, '#b0a060'); } Gfx.circle(g, 8, 8, 4, '#d8c880'); Gfx.circle(g, 8, 8, 1.5, '#605030'); });
    T.reg('cog_pink', { kind: 'stone', frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.circle(g, 8, 8, 6, '#c07090'); for (let k = 0; k < 8; k++) { const a = (k + f * 0.5) * Math.PI / 4; Gfx.rect(g, Math.round(8 + Math.cos(a) * 6.5) - 1, Math.round(8 + Math.sin(a) * 6.5) - 1, 2, 2, '#c07090'); } Gfx.circle(g, 8, 8, 4, '#e0a0c0'); Gfx.circle(g, 8, 8, 1.5, '#703050'); });
    T.reg('gab_floor', { kind: 'stone', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#88b070', ['#80a868', '#90b878', '#84ac6c'], 14); Gfx.px(g, 3, 3, '#a0c888'); Gfx.px(g, 11, 12, '#6c9458'); });
    T.reg('gab_wall_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a07040', ['#946838', '#ac7848'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#c89058'); });
    T.reg('gab_wall_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#805020', ['#744818', '#8c5828'], 14); Gfx.hline(g, 0, 0, 16, '#c89058'); Gfx.hline(g, 0, 15, 16, '#402808'); for (let i = 0; i < 3; i++) Gfx.vline(g, 2 + i * 5, 2, 10, '#684018'); });
    T.reg('gab_wall_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#744818', ['#684010', '#805020'], 16); });
    cliffSet('gabwall', 'gab_wall_top', 'gab_wall_face', 'gab_wall_mid', '#d0a070', '#a07040', '#402808', '#2c1804');
    T.reg('conduit', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#88b070', ['#80a868', '#90b878'], 14); Gfx.rect(g, 0, 6, 16, 4, '#405030'); Gfx.hline(g, 0, 7, 16, '#607850'); });
    T.reg('conduit_v', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#88b070', ['#80a868', '#90b878'], 14); Gfx.rect(g, 6, 0, 4, 16, '#405030'); Gfx.vline(g, 7, 0, 16, '#607850'); });
    const arrowTile = (name, dir, up) => T.reg(name, { kind: 'stone', solid: up }, (g, f, r) => { T.noiseFill(g, r, up ? '#b0a888' : '#88b070', up ? ['#a8a080', '#b8b090'] : ['#80a868', '#90b878'], 14); Gfx.rect(g, 2, 2, 12, 12, up ? '#c8c0a0' : '#98a880'); const c = '#402818'; if (dir === 0) { Gfx.rect(g, 7, 4, 2, 8, c); Gfx.tri(g, 4, 9, 12, 9, 8, 13, c); } else if (dir === 1) { Gfx.rect(g, 4, 7, 8, 2, c); Gfx.tri(g, 7, 4, 7, 12, 3, 8, c); } else if (dir === 2) { Gfx.rect(g, 4, 7, 8, 2, c); Gfx.tri(g, 9, 4, 9, 12, 13, 8, c); } else { Gfx.rect(g, 7, 4, 2, 8, c); Gfx.tri(g, 4, 7, 12, 7, 8, 3, c); } });
    for (let d = 0; d < 4; d++) { arrowTile('cond_tile_' + d, d, false); arrowTile('cond_tile_' + d + '_up', d, true); }
    T.reg('arrow_panel', { kind: 'stone', frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#88b070', ['#80a868', '#90b878'], 14); Gfx.circle(g, 8, 8, 6, f ? '#e0c060' : '#c8a848'); Gfx.rect(g, 5, 7, 4, 2, '#402818'); Gfx.tri(g, 9, 4, 9, 12, 13, 8, '#402818'); });
    T.reg('mini_gabomba', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 4, 10, 11, '#8cac48'); Gfx.rect(g, 2, 13, 12, 3, '#c8a030'); Gfx.px(g, 5, 7, '#f0e060'); Gfx.px(g, 10, 7, '#f0e060'); Gfx.rect(g, 5, 10, 6, 2, '#3c2010'); Gfx.rect(g, 4, 2, 8, 2, '#c8a030'); });
    T.reg('pillar_wet', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 3, 1, 10, 14, '#7890b8'); Gfx.rect(g, 3, 1, 3, 14, '#a0c0e0'); Gfx.rect(g, 2, 0, 12, 3, '#a0c0e0'); Gfx.rect(g, 2, 13, 12, 3, '#405878'); Gfx.hline(g, 3, 6, 10, '#405878'); Gfx.px(g, 8, 8, '#d0f0ff'); });
    T.reg('gab_pit', { kind: 'pit', solid: true, hop: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); for (let i = 0; i < 3; i++) Gfx.px(g, 2 + i * 5, 4 + i * 3, '#282838'); });
    T.reg('gab_hole', { kind: 'hole', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#88b070', ['#80a868', '#90b878'], 14); Gfx.ellipse(g, 8, 8, 6, 5, '#101008'); Gfx.ellipse(g, 8, 7, 4, 3, '#000000'); });
    // Taopo Swamp: the mud the party sinks into step by step, the bubbles that lift them out of it, the rock that glows
    // with the heat of the lava until it is doused, the stone it makes in the lava, the steam vent Douse and Frost cap
    T.reg('swamp_mud', { kind: 'mud', enc: true, mud: true }, (g, f, r) => { T.noiseFill(g, r, '#5a6838', ['#4c5a2c', '#687644', '#546430'], 16); Gfx.ellipse(g, 5, 10, 3, 1, '#404c20'); Gfx.ellipse(g, 12, 5, 2, 1, '#7a8850'); });
    T.reg('swamp_bubble', { kind: 'mud', enc: true, mud: true, bubble: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#5a6838', ['#4c5a2c', '#687644'], 16); Gfx.circle(g, 8, 8, 5 - f, '#98c0d8'); Gfx.circle(g, 8, 8, 3 - f, '#c8e8f8'); Gfx.px(g, 6, 6, '#ffffff'); Gfx.circle(g, 13, 3 + f, 1.5, '#98c0d8'); });
    T.reg('rock_hot', { kind: 'boulder', solid: true, light: true, frames: 2 }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 7, 6, '#803020'); Gfx.ellipse(g, 7, 8, 5, 4, f ? '#e06030' : '#d05020'); Gfx.ellipse(g, 6, 7, 2, 1, '#ffd080'); Gfx.px(g, 10, 10, '#ffa040'); Gfx.ellipse(g, 8, 14, 7, 2, '#40180c'); });
    T.reg('rock_cool', { kind: 'boulder', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 7, 6, '#605050'); Gfx.ellipse(g, 7, 8, 5, 4, '#807070'); Gfx.ellipse(g, 6, 7, 2, 1, '#a09090'); Gfx.ellipse(g, 8, 14, 7, 2, '#302020'); });
    T.reg('lava_stone', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#e05020'); Gfx.ellipse(g, 8, 8, 7, 6, '#605050'); Gfx.ellipse(g, 7, 7, 5, 4, '#807070'); });
    T.reg('steam_vent', { kind: 'cave', frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#a8acc8', ['#a0a4c0', '#b0b4d0'], 14); Gfx.circle(g, 8, 9, 5, '#5c5c74'); Gfx.circle(g, 8, 9, 3, '#3c3c50'); Gfx.ellipse(g, 8, 4 - f, 3, 2, '#e0e0f0'); Gfx.ellipse(g, 10, 2 - f, 2, 1, '#f0f0ff'); });
    T.reg('lc_dark', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#484860', ['#404058', '#505068'], 12); });
    // Apojii and Aqua Rock: the tear-shaped water stones Douse wakes, the moai (a stone head; wet, it pours a stream),
    // the streams themselves (a current that carries whoever steps in), the wet rock faces the party climbs, the
    // little blue rocks that go into the water, the yellow tiles hopped, the great blue-lit halls' floor and walls
    T.reg('aqua_stone', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 12, 10, 3, '#6a7088'); Gfx.rect(g, 4, 11, 8, 1, '#8a90a8'); Gfx.tri(g, 3, 12, 8, 1, 13, 12, '#3868b0'); Gfx.tri(g, 5, 11, 8, 4, 11, 11, '#5090d0'); Gfx.px(g, 7, 6, '#a0d0ff'); });
    T.reg('aqua_stone_wet', { kind: 'stone', solid: true, light: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 3, 12, 10, 3, '#6a7088'); Gfx.rect(g, 4, 11, 8, 1, '#8a90a8'); Gfx.tri(g, 3, 12, 8, 1, 13, 12, f ? '#60b0ff' : '#4898f0'); Gfx.tri(g, 5, 11, 8, 4, 11, 11, '#a0e0ff'); Gfx.px(g, 7, 6, '#ffffff'); Gfx.px(g, 8 + f, 8, '#e0f8ff'); });
    T.reg('moai', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 4, 2, 8, 13, '#787890'); Gfx.rect(g, 3, 1, 10, 3, '#8c8ca4'); Gfx.rect(g, 5, 6, 2, 2, '#404058'); Gfx.rect(g, 9, 6, 2, 2, '#404058'); Gfx.rect(g, 7, 8, 2, 4, '#606078'); Gfx.rect(g, 5, 12, 6, 1, '#404058'); Gfx.rect(g, 3, 14, 10, 2, '#505068'); });
    T.reg('moai_wet', { kind: 'pillar', solid: true, pushable: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 4, 2, 8, 13, '#6878a8'); Gfx.rect(g, 3, 1, 10, 3, '#8090b8'); Gfx.rect(g, 5, 6, 2, 2, f ? '#a0e0ff' : '#60c0ff'); Gfx.rect(g, 9, 6, 2, 2, f ? '#a0e0ff' : '#60c0ff'); Gfx.rect(g, 7, 8, 2, 4, '#506088'); Gfx.rect(g, 5, 12, 6, 1, '#a0d8ff'); Gfx.rect(g, 3, 14, 10, 2, '#405878'); });
    T.reg('moai_red', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 4, 2, 8, 13, '#a05050'); Gfx.rect(g, 3, 1, 10, 3, '#b86868'); Gfx.rect(g, 5, 6, 2, 2, '#402020'); Gfx.rect(g, 9, 6, 2, 2, '#402020'); Gfx.rect(g, 7, 8, 2, 4, '#804040'); Gfx.rect(g, 5, 12, 6, 1, '#402020'); Gfx.rect(g, 3, 14, 10, 2, '#603030'); });
    T.reg('stream', { kind: 'water', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4090e0'); for (let i = 0; i < 6; i++) { const y = (i * 3 + f * 2) % 16; Gfx.hline(g, (i * 5) % 12, y, 4, '#a0d8ff'); } Gfx.vline(g, 3, 0, 16, '#70b8f8'); Gfx.vline(g, 12, 0, 16, '#70b8f8'); });
    T.reg('stream_h', { kind: 'water', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4090e0'); for (let i = 0; i < 6; i++) { const x = (i * 3 + f * 2) % 16; Gfx.vline(g, x, (i * 5) % 12, 4, '#a0d8ff'); } Gfx.hline(g, 0, 3, 16, '#70b8f8'); Gfx.hline(g, 0, 12, 16, '#70b8f8'); });
    T.reg('wfall_climb', { kind: 'stairs', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#5890c8'); for (let x = 1; x < 16; x += 3) Gfx.vline(g, x, 0, 16, '#88b8e8'); for (let i = 0; i < 4; i++) Gfx.px(g, (i * 4 + 2) % 16, (i * 5 + f * 3) % 16, '#e0f4ff'); Gfx.hline(g, 0, (f * 4) % 16, 16, '#c0e0ff'); });   // a wet rock face with water sheeting down it: climbed
    T.reg('rock_blue', { kind: 'boulder', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 5, '#3858a0'); Gfx.ellipse(g, 7, 9, 4, 3, '#5878c0'); Gfx.ellipse(g, 6, 8, 2, 1, '#88a8e0'); Gfx.ellipse(g, 8, 14, 6, 2, '#203058'); });
    T.reg('ar_floor', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#8aa0c8', ['#8098c0', '#94a8d0', '#7c94bc'], 16); if (r() < 0.2) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b0c4e8'); });
    T.reg('ar_hop', { kind: 'cave', hop: true, solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8aa0c8', ['#8098c0', '#94a8d0'], 16); Gfx.rect(g, 2, 2, 12, 12, '#d8c060'); Gfx.rect(g, 4, 4, 8, 8, '#f0d878'); Gfx.rect(g, 6, 6, 4, 4, '#ffe890'); });   // the yellow tiles: hopped over, never stood on
    T.reg('water_drop', { kind: 'stairs', hole: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4090e0'); for (let i = 0; i < 6; i++) { const y = (i * 3 + f * 2) % 16; Gfx.hline(g, (i * 5) % 12, y, 4, '#a0d8ff'); } Gfx.ellipse(g, 8, 8, 5, 3, '#2860b0'); Gfx.ellipse(g, 8, 8, 3, 2, '#1c4890'); });   // a tile in a current that gives way: stepped on, it drops the party to the floor below
    // Tundaria Tower: pale stone floors, the black ice the party slides on, the icy columns Pound sinks, the ice
    // crystal with the prong in it and the icy walls Burst breaks, the brown patch of the outer wall
    T.reg('iw_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#dce8f8', ['#d0dcf0', '#e8f0ff', '#d4e0f4'], 14); Gfx.hline(g, 0, 7, 16, '#c0d0e8'); Gfx.vline(g, 7, 0, 8, '#c0d0e8'); Gfx.vline(g, 15, 8, 8, '#c0d0e8'); });   // blocks of pale stone
    T.reg('iw_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a8c0e0', ['#9cb4d8', '#b4cce8'], 14); Gfx.hline(g, 0, 0, 16, '#e8f0ff'); Gfx.hline(g, 0, 15, 16, '#3c5480'); Gfx.hline(g, 0, 7, 16, '#7c98c0'); Gfx.vline(g, 7, 0, 8, '#7c98c0'); Gfx.vline(g, 15, 8, 8, '#7c98c0'); });
    T.reg('iw_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#88a4cc', ['#7c98c0', '#94b0d8'], 16); Gfx.hline(g, 0, 7, 16, '#6484b0'); });
    cliffSet('icewall', 'iw_top', 'iw_face', 'iw_mid', '#eef4ff', '#b0c8e8', '#3c5480', '#243c60');
    T.reg('tt_floor', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#c8d8ec', ['#bccce0', '#d4e4f4', '#c0d0e4'], 16); if (r() < 0.15) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#e8f4ff'); });
    T.reg('tt_ice', { kind: 'ice', slippery: true, enc: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#283c58'); Gfx.line(g, 2, 3, 9, 8, '#405c80'); Gfx.line(g, 10, 2, 14, 13, '#405c80'); Gfx.px(g, 4, 12, '#6080a8'); Gfx.px(g, 12, 5, '#8098b8'); });
    T.reg('ice_column', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 3, 1, 10, 14, '#a8d0f0'); Gfx.rect(g, 3, 1, 3, 14, '#d8f0ff'); Gfx.rect(g, 2, 0, 12, 3, '#d8f0ff'); Gfx.rect(g, 2, 13, 12, 3, '#6890b8'); Gfx.px(g, 8, 6, '#ffffff'); Gfx.px(g, 6, 10, '#ffffff'); });
    T.reg('ice_crystal', { kind: 'stone', solid: true, frames: 2 }, (g, f, r) => { Gfx.tri(g, 2, 15, 14, 15, 8, 1, f ? '#b8e4ff' : '#a0d8ff'); Gfx.tri(g, 5, 15, 11, 15, 8, 5, '#e0f4ff'); Gfx.rect(g, 7, 8, 2, 4, '#c0a040'); Gfx.px(g, 8, 4, '#ffffff'); });
    T.reg('ice_wall_crack', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b0c8e8', ['#a0b8d8', '#c0d8f0'], 12); Gfx.line(g, 3, 2, 8, 8, '#405880'); Gfx.line(g, 8, 8, 6, 14, '#405880'); Gfx.line(g, 8, 8, 13, 10, '#405880'); });
    T.reg('tt_brown', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8c6c48', ['#7c5c38', '#9c7c58'], 12); Gfx.line(g, 4, 3, 9, 9, '#3c2414'); Gfx.line(g, 9, 9, 12, 14, '#3c2414'); });
    T.reg('ar_dark', { kind: 'cave' }, (g, f, r) => { T.noiseFill(g, r, '#405070', ['#384868', '#485878'], 12); });
    T.reg('lc_slide', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#8c78b0', ['#8070a4', '#9880bc'], 14); Gfx.tri(g, 0, 16, 16, 16, 8, 2, '#d8c8a0'); Gfx.tri(g, 3, 16, 13, 16, 8, 6, '#c0b088'); for (let y = 8; y < 16; y += 3) Gfx.hline(g, 5, y, 6, '#e8dcc0'); Gfx.hline(g, 0, 15, 16, '#3c2860'); });   // a worn slope off a lilac ledge: stepped onto, it drops the party to the level below
    T.reg('lc_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#7c60a8', ['#705498', '#886cb4'], 14); Gfx.rect(g, 3, 5, 10, 11, '#100818'); Gfx.ellipse(g, 8, 5, 5, 4, '#100818'); Gfx.hline(g, 0, 0, 16, '#c0a8e0'); });
    T.reg('light_shaft', { kind: 'cave', enc: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#a8acc8', ['#a0a4c0', '#b0b4d0'], 14); Gfx.rect(g, 4, 0, 8, 16, '#d8d0b8'); Gfx.rect(g, 6, 0, 4, 16, '#f0e8cc'); Gfx.ellipse(g, 8, 13, 6, 3, '#f8f0d8'); Gfx.px(g, 5 + f * 4, 4 + f * 3, '#ffffff'); });
    T.reg('cave_sand', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8c088', ['#ccb478', '#e0c890', '#d4bc84'], 14); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b8a068'); });
    T.reg('cave_pebbles', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8c088', ['#ccb478', '#e0c890'], 14); for (let i = 0; i < 6; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.rect(g, x, y, 2, 2, '#a89060'); Gfx.px(g, x, y, '#c8b080'); } });
    T.reg('cave_hidden', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); for (let i = 0; i < 5; i++) { const y = (i * 3 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 16, y, 4, WATER_L); } });   // water over the hidden path, before the dragon shows it
    T.reg('cave_shown', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.rect(g, 1, 1, 14, 14, '#88b0a0'); for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); Gfx.rect(g, x + 1, y + 1, 2, 2, '#a89060'); } });   // the path the dragon's eye reveals: stones just under the surface
    T.reg('post_water', { kind: 'bridge', frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.hline(g, 2 + f, 14, 4, WATER_L); Gfx.ellipse(g, 8, 8, 7, 7, '#8a5a2a'); Gfx.ellipse(g, 8, 8, 6, 6, '#c89860'); Gfx.ellipse(g, 8, 8, 4, 4, '#b88650'); Gfx.ellipse(g, 8, 8, 2, 2, '#d8a870'); Gfx.px(g, 8, 8, '#8a5a2a'); });
    T.reg('dragon_statue', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 10, 12, 5, '#6c5a88'); Gfx.ellipse(g, 8, 6, 6, 5, '#8878a8'); Gfx.rect(g, 3, 3, 3, 3, '#8878a8'); Gfx.rect(g, 10, 3, 3, 3, '#8878a8'); Gfx.px(g, 6, 6, '#302040'); Gfx.px(g, 10, 6, '#302040'); Gfx.rect(g, 6, 8, 4, 2, '#504068'); });
    T.reg('dragon_statue_eye', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 2, 10, 12, 5, '#6c5a88'); Gfx.ellipse(g, 8, 6, 6, 5, '#8878a8'); Gfx.rect(g, 3, 3, 3, 3, '#8878a8'); Gfx.rect(g, 10, 3, 3, 3, '#8878a8'); Gfx.px(g, 6, 6, f ? '#ff6060' : '#ff2020'); Gfx.px(g, 10, 6, f ? '#ff6060' : '#ff2020'); Gfx.rect(g, 6, 8, 4, 2, '#504068'); });
    T.reg('lantern_stone', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 8, 4, 7, '#a0a0a8'); Gfx.rect(g, 3, 5, 10, 3, '#b8b8c0'); Gfx.rect(g, 5, 2, 6, 3, '#909098'); Gfx.rect(g, 6, 3, 4, 2, '#f0d060'); Gfx.rect(g, 4, 0, 8, 2, '#b8b8c0'); Gfx.rect(g, 4, 14, 8, 2, '#909098'); });
    T.reg('roof_tile_blue', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4870a8'); for (let y = 0; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, '#6890c8'); Gfx.hline(g, 0, y + 3, 16, '#305080'); } for (let x = 0; x < 16; x += 4) Gfx.vline(g, x, 0, 16, '#3c6090'); });
    T.reg('roof_tile_blue_edge', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4870a8'); for (let y = 0; y < 12; y += 4) { Gfx.hline(g, 0, y, 16, '#6890c8'); Gfx.hline(g, 0, y + 3, 16, '#305080'); } Gfx.rect(g, 0, 12, 16, 4, '#88b0e0'); for (let x = 0; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#3c6090'); Gfx.ellipse(g, x + 2, 14, 2, 2, '#c0d8f0'); } });
    T.reg('roof_tile_blue_peak', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4870a8'); Gfx.rect(g, 0, 0, 16, 4, '#88b0e0'); for (let y = 4; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, '#6890c8'); Gfx.hline(g, 0, y + 3, 16, '#305080'); } for (let x = 0; x < 16; x += 4) Gfx.vline(g, x, 4, 12, '#3c6090'); });
    T.reg('wall_temple_red', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c84030'); Gfx.rect(g, 0, 0, 16, 3, '#f0d060'); Gfx.rect(g, 0, 13, 16, 3, '#802018'); Gfx.vline(g, 3, 3, 10, '#e06050'); Gfx.vline(g, 12, 3, 10, '#a03028'); });
    T.reg('door_temple_red', { kind: 'door', door: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c84030'); Gfx.rect(g, 0, 0, 16, 3, '#f0d060'); Gfx.rect(g, 3, 4, 10, 12, '#502010'); Gfx.rect(g, 4, 5, 8, 11, '#8a5030'); Gfx.vline(g, 8, 5, 11, '#502010'); Gfx.px(g, 6, 11, '#f0d060'); Gfx.px(g, 10, 11, '#f0d060'); });
    T.reg('window_temple_red', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c84030'); Gfx.rect(g, 0, 0, 16, 3, '#f0d060'); Gfx.rect(g, 3, 5, 10, 8, '#f0d060'); Gfx.rect(g, 4, 6, 8, 6, '#803020'); Gfx.hline(g, 4, 9, 8, '#f0d060'); Gfx.vline(g, 8, 6, 6, '#f0d060'); });
    T.reg('mountain', { kind: 'mountain', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#7a6a58'); Gfx.tri(g, 0, 15, 8, 2, 15, 15, '#9a8a78'); Gfx.tri(g, 3, 15, 8, 5, 12, 15, '#8a7a68'); Gfx.tri(g, 5, 7, 8, 2, 11, 7, '#f0f4ff'); Gfx.line(g, 8, 2, 8, 12, '#6a5a48'); });
    T.reg('cavewall', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048', '#5a5068'], 20); Gfx.hline(g, 0, 15, 16, '#2a2038'); Gfx.rect(g, 2, 3, 5, 4, '#565064'); Gfx.rect(g, 9, 8, 5, 4, '#565064'); });
    T.reg('cavewalltop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#2a2438', ['#221c30', '#342c44'], 16); });
    T.defs.cavewall_top = T.defs.cavewalltop;   // so a room walled in cavewall gets its top (M.room asks for <wall>_top)
    T.reg('cave', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060', '#7a7080'], 20); });
    T.reg('cave2', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060', '#7a7080'], 12); Gfx.rect(g, 4, 6, 3, 2, '#585060'); Gfx.rect(g, 10, 10, 2, 3, '#585060'); });
    T.reg('caveice', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#8898b8', ['#7888a8', '#98a8c8'], 16); });
    T.reg('cavewallice', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5870a0', ['#4860908', '#6880b0'], 16); Gfx.hline(g, 0, 15, 16, '#304070'); Gfx.rect(g, 2, 3, 5, 4, '#6a82b2'); });
    T.reg('cavewalltopice', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#304060', ['#283858', '#384868'], 12); });
    T.reg('cavefire', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#705048', ['#604038', '#806058'], 20); });
    T.reg('cavewallfire', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#604040', ['#503030', '#705050'], 16); Gfx.hline(g, 0, 15, 16, '#382020'); });
    T.reg('cavewalltopfire', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#382020', ['#301818', '#402828'], 12); });
    // ---- Trees / plants ----
    const treeTop = (g, r, col, colD, colL) => { Gfx.ellipse(g, 8, 9, 7, 6, col); Gfx.ellipse(g, 6, 7, 4, 3, colL); Gfx.ellipse(g, 8, 12, 6, 3, colD); T.speckle(g, r, [colD, colL], 8); };
    T.reg('tree', { kind: 'tree', solid: true, over: false }, (g, f, r) => { Gfx.rect(g, 6, 10, 4, 6, '#6a4a2a'); Gfx.rect(g, 7, 10, 1, 6, '#8a6a3a'); treeTop(g, r, '#3c8c3c', '#2c6c30', '#58a848'); });
    T.reg('tree_top', { kind: 'tree', solid: true, over: true }, (g, f, r) => { treeTop(g, r, '#3c8c3c', '#2c6c30', '#58a848'); });
    T.reg('tree_bot', { kind: 'tree', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 0, 4, 12, '#6a4a2a'); Gfx.rect(g, 7, 0, 1, 12, '#8a6a3a'); Gfx.ellipse(g, 8, 3, 7, 4, '#2c6c30'); Gfx.ellipse(g, 8, 13, 5, 2, '#3c7c3c'); });
    T.reg('pine', { kind: 'tree', solid: true }, (g, f, r) => { Gfx.rect(g, 7, 12, 2, 4, '#5a3a1a'); Gfx.tri(g, 1, 14, 8, 6, 15, 14, '#2c6c30'); Gfx.tri(g, 3, 9, 8, 1, 13, 9, '#3c8c3c'); Gfx.tri(g, 5, 5, 8, 0, 11, 5, '#58a848'); });
    T.reg('pinesnow', { kind: 'tree', solid: true }, (g, f, r) => { Gfx.rect(g, 7, 12, 2, 4, '#5a3a1a'); Gfx.tri(g, 1, 14, 8, 6, 15, 14, '#2c6c30'); Gfx.tri(g, 3, 9, 8, 1, 13, 9, '#3c8c3c'); Gfx.hline(g, 4, 9, 9, '#ffffff'); Gfx.hline(g, 2, 14, 13, '#ffffff'); Gfx.tri(g, 5, 5, 8, 0, 11, 5, '#e8f0ff'); });
    T.reg('palm', { kind: 'tree', solid: true }, (g, f, r) => { Gfx.rect(g, 7, 7, 2, 9, '#8a6a3a'); Gfx.px(g, 7, 9, '#a88050'); Gfx.px(g, 7, 12, '#a88050'); Gfx.ellipse(g, 4, 5, 4, 2, '#3c8c3c'); Gfx.ellipse(g, 12, 5, 4, 2, '#3c8c3c'); Gfx.ellipse(g, 8, 3, 5, 2, '#48a848'); Gfx.ellipse(g, 5, 8, 3, 1, '#2c6c30'); Gfx.ellipse(g, 11, 8, 3, 1, '#2c6c30'); Gfx.px(g, 8, 6, '#805030'); Gfx.px(g, 9, 6, '#c08040'); });
    // trees twice a person's height, drawn whole at 32x32 and cut into four tiles: the crown's upper half hangs over
    // the player (tl/tr), the trunk row is solid (bl/br)
    const bigTree = (name, col, colD, colL, trunk) => {
      const big = Gfx.canvas(32, 32); const g = Gfx.ctx(big); const r = seededRandom(hashStr(name));
      Gfx.ellipse(g, 16, 30, 9, 2, 'rgba(0,0,0,0.25)');
      Gfx.rect(g, 13, 18, 6, 12, trunk); Gfx.rect(g, 14, 18, 2, 12, '#8a6a3a'); Gfx.rect(g, 11, 27, 3, 2, trunk); Gfx.rect(g, 18, 27, 3, 2, trunk);
      // the small tree's crown, twice the size: a round head, light on the upper left, dark underneath
      Gfx.ellipse(g, 16, 11, 14, 11, colD); Gfx.ellipse(g, 16, 10, 13, 10, col); Gfx.ellipse(g, 12, 6, 7, 5, colL); Gfx.ellipse(g, 16, 17, 11, 4, colD);
      for (let i = 0; i < 30; i++) { const a = r() * Math.PI * 2, d = r(); Gfx.px(g, Math.round(16 + Math.cos(a) * 12 * d), Math.round(10 + Math.sin(a) * 9 * d), [colD, colL][Math.floor(r() * 2)]); }
      for (const [q, x, y] of [['tl', 0, 0], ['tr', 16, 0], ['bl', 0, 16], ['br', 16, 16]]) {
        const props = y === 0 ? { kind: 'tall', overlay: true, over: true } : { kind: 'tall', overlay: true, solid: true };
        T.reg(name + '_' + q, props, gg => gg.drawImage(big, x, y, 16, 16, 0, 0, 16, 16));
      }
    };
    bigTree('tree_tall', '#3c8c3c', '#2c6c30', '#58a848', '#6a4a2a');
    bigTree('tree_red_tall', '#c04828', '#8a3018', '#e07038', '#6a4a2a');
    bigTree('tree_gold_tall', '#d0a030', '#a07020', '#f0c850', '#6a4a2a');
    T.reg('bush', { kind: 'bush', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 4, '#3c8c3c'); Gfx.ellipse(g, 7, 8, 4, 3, '#58a848'); Gfx.ellipse(g, 8, 13, 5, 1, '#2c6c30'); });
    T.reg('vines', { kind: 'vines', solid: true, vines: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048'], 8); for (let i = 0; i < 4; i++) { const x = 1 + i * 4; Gfx.vline(g, x, 0, 16, '#3c8c3c'); Gfx.px(g, x + 1, 3 + i, '#58a848'); Gfx.px(g, x - 1, 8 + i, '#58a848'); Gfx.px(g, x + 1, 12, '#2c6c30'); } });
    T.reg('sprout', { kind: 'grass', sprout: true }, (g, f, r) => { Gfx.rect(g, 7, 9, 2, 5, '#3c8c3c'); Gfx.px(g, 6, 9, '#58a848'); Gfx.px(g, 9, 8, '#58a848'); Gfx.px(g, 5, 10, '#58a848'); Gfx.px(g, 10, 9, '#58a848'); });
    T.reg('vineladder', { kind: 'ladder', ladder: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048'], 8); Gfx.vline(g, 4, 0, 16, '#3c8c3c'); Gfx.vline(g, 11, 0, 16, '#3c8c3c'); for (let y = 2; y < 16; y += 4) Gfx.hline(g, 4, y, 8, '#58a848'); });
    T.reg('stump', { kind: 'stump', solid: true, stump: true }, (g, f, r) => { Gfx.rect(g, 4, 6, 8, 8, '#6a4a2a'); Gfx.ellipse(g, 8, 6, 5, 3, '#a88050'); Gfx.ellipse(g, 8, 6, 3, 2, '#c8a070'); Gfx.px(g, 8, 6, '#a88050'); });
    T.reg('stumphole', { kind: 'stump', hole: true }, (g, f, r) => { Gfx.rect(g, 4, 6, 8, 8, '#6a4a2a'); Gfx.ellipse(g, 8, 6, 5, 3, '#a88050'); Gfx.ellipse(g, 8, 6, 3, 2, '#201818'); });
    // ---- Structures ----
    const roof = (name, col) => {
      const d = shade(col, 0.7), l = tint(col, 0.25);
      T.reg(name, { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, col); for (let y = 0; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, d); const off = ((y / 4) % 2) * 4; for (let x = off; x < 16; x += 8) Gfx.px(g, x, y + 1, l); } });
      T.reg(name + '_edge', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, col); for (let y = 0; y < 12; y += 4) { Gfx.hline(g, 0, y, 16, d); const off = ((y / 4) % 2) * 4; for (let x = off; x < 16; x += 8) Gfx.px(g, x, y + 1, l); } Gfx.rect(g, 0, 12, 16, 4, d); Gfx.hline(g, 0, 12, 16, l); });
      // the ridge of a roof: you can walk behind it, and it is drawn over you
      T.reg(name + '_peak', { kind: 'roof', solid: false, over: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, col); Gfx.hline(g, 0, 0, 16, l); Gfx.hline(g, 0, 1, 16, l); for (let y = 4; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, d); } });
    };
    // the canvas awnings of a market: striped cloth stretched over the stalls, the front row hemmed with scallops
    const awning = (name, a, b) => {
      T.reg(name, { kind: 'roof', solid: true }, (g, f, r) => { for (let x = 0; x < 16; x += 4) Gfx.rect(g, x, 0, 4, 16, (x / 4) % 2 ? a : b); Gfx.hline(g, 0, 0, 16, tint(b, 0.3)); Gfx.hline(g, 0, 8, 16, shade(a, 0.85)); });
      T.reg(name + '_edge', { kind: 'roof', solid: true }, (g, f, r) => { for (let x = 0; x < 16; x += 4) Gfx.rect(g, x, 0, 4, 12, (x / 4) % 2 ? a : b); for (let x = 0; x < 16; x += 4) { const c = (x / 4) % 2 ? a : b; Gfx.rect(g, x, 12, 4, 2, c); Gfx.rect(g, x + 1, 14, 2, 1, c); } Gfx.hline(g, 0, 8, 16, shade(a, 0.85)); Gfx.vline(g, 1, 12, 4, '#5a4a38'); Gfx.vline(g, 14, 12, 4, '#5a4a38'); });
    };
    awning('awning_teal', '#48a0a0', '#e8e0c8');
    roof('roof_red', '#c04838'); roof('roof_blue', '#3858b0'); roof('roof_green', '#3c8850'); roof('roof_thatch', '#c8a050'); roof('roof_purple', '#7050a0'); roof('roof_brown', '#8a5a3a'); roof('roof_grey', '#6a7080'); roof('roof_slate', '#8a94ac'); roof('roof_teal', '#3a8a90'); roof('roof_adobe', '#c8a068'); roof('roof_sandbrick', '#d8b848');
    T.reg('wall_plaster', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0', '#f0e8d0'], 8); Gfx.hline(g, 0, 15, 16, '#a89878'); Gfx.rect(g, 2, 2, 12, 2, '#8a6a4a'); });
    T.reg('wall_plaster2', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0', '#f0e8d0'], 8); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('wall_stone', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a8a8b8', '#787888', 4, 8); Gfx.hline(g, 0, 15, 16, '#585868'); });
    // Kalay's pink stone, and the peach domes of its palace and sanctum (an ellipse drawn in a 48 x 48 frame, a tile at a time)
    T.reg('wall_kalay', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#ecc8dc', '#b890b4', 4, 8); Gfx.hline(g, 0, 15, 16, '#906890'); });
    T.reg('door_kalay', { kind: 'door', door: true }, (g, f, r) => { T.bricks(g, r, '#ecc8dc', '#b890b4', 4, 8); Gfx.rect(g, 3, 4, 10, 12, '#283060'); Gfx.ellipse(g, 8, 4, 5, 3, '#283060'); Gfx.rect(g, 4, 0, 8, 1, '#f8e8f0'); Gfx.px(g, 11, 10, '#e0c040'); });
    T.reg('window_kalay', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#ecc8dc', '#b890b4', 4, 8); Gfx.rect(g, 5, 5, 6, 8, '#303860'); Gfx.ellipse(g, 8, 5, 3, 2, '#303860'); Gfx.rect(g, 6, 6, 4, 6, '#88b0e0'); Gfx.hline(g, 0, 15, 16, '#906890'); });
    const dome = (row, col) => T.reg('dome_' + row + col, { kind: 'roof', solid: true }, (g, f, r) => {
      g.save(); g.translate(col === 'l' ? 0 : col === 'r' ? -32 : -16, -row * 16);
      Gfx.ellipse(g, 24, 30, 24, 27, '#c89058'); Gfx.ellipse(g, 24, 29, 22, 25, '#f0c890'); Gfx.ellipse(g, 24, 21, 10, 9, '#f8e0b0');
      g.restore();
      if (row === 0 && col === 'm') Gfx.rect(g, 7, 0, 2, 4, '#c89058');
    });
    for (const row of [0, 1, 2]) for (const col of ['l', 'm', 'r']) dome(row, col);
    dome(0, 'c'); dome(0, 'cl'); dome(0, 'cr');   // the crown tile with the finial: the middle of a dome of odd width, or the two halves astride the middle of an even one
    T.reg('wall_wood', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a87848'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#886038'); Gfx.hline(g, 0, 15, 16, '#604020'); for (let i = 0; i < 4; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#c89868'); });
    T.reg('wall_wood_top', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#604020'); for (let y = 2; y < 16; y += 5) Gfx.hline(g, 0, y, 16, '#503418'); });   // the top edge of a room walled in timber
    T.reg('wall_mud', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c8a878', ['#b89868', '#d8b888'], 12); Gfx.hline(g, 0, 15, 16, '#886848'); });
    T.reg('wall_blue', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#7890c8', '#5870a8', 4, 8); Gfx.hline(g, 0, 15, 16, '#405088'); });
    T.reg('wall_ice', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#b8d8f0', '#88a8d0', 4, 8); Gfx.hline(g, 0, 15, 16, '#5878a8'); });
    // the Minotaur carved into Sol Sanctum's wall: horns, a muzzle, and an eye socket that a jewel fills (then both eyes gleam)
    const minotaur = (g, r, lit) => { T.bricks(g, r, '#c8b898', '#a09070', 4, 8); Gfx.rect(g, 2, 2, 12, 12, '#b0a080'); Gfx.rect(g, 3, 3, 10, 10, '#c8b898'); Gfx.ellipse(g, 8, 8, 4, 4, '#8a7a5a'); Gfx.rect(g, 6, 9, 4, 3, '#6a5a40'); Gfx.line(g, 4, 4, 2, 1, '#6a5a40'); Gfx.line(g, 11, 4, 13, 1, '#6a5a40'); Gfx.px(g, 6, 7, lit ? '#ffe040' : '#f0d8b8'); Gfx.px(g, 10, 7, lit ? '#ffe040' : '#201810'); if (lit) { Gfx.px(g, 5, 7, '#ffffff'); Gfx.px(g, 9, 7, '#ffffff'); } };
    T.reg('relief_minotaur', { kind: 'wall', solid: true }, (g, f, r) => minotaur(g, r, false));
    T.reg('relief_minotaur_lit', { kind: 'wall', solid: true, frames: 2 }, (g, f, r) => { minotaur(g, r, true); if (f) { Gfx.px(g, 6, 7, '#fff8a0'); Gfx.px(g, 10, 7, '#fff8a0'); } });
    T.reg('wall_temple', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#c8b898', '#a09070', 4, 8); Gfx.hline(g, 0, 15, 16, '#786850'); Gfx.rect(g, 6, 5, 4, 4, '#e8d8b8'); });
    T.reg('door', { kind: 'door', solid: false, door: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 3, 2, 10, 14, '#6a4020'); Gfx.rect(g, 4, 3, 8, 13, '#8a5a30'); Gfx.rect(g, 4, 3, 8, 1, '#a87a48'); Gfx.px(g, 10, 10, '#f0d060'); });
    // the red brick of McCoy's hall, between its stone towers
    T.reg('wall_brick', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a05038', '#7a3828', 4, 8); Gfx.hline(g, 0, 15, 16, '#502018'); });
    T.reg('window_brick', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a05038', '#7a3828', 4, 8); Gfx.rect(g, 4, 2, 8, 10, '#e8dcc0'); Gfx.rect(g, 5, 3, 6, 8, '#404050'); Gfx.rect(g, 6, 4, 4, 6, '#88c0f0'); Gfx.px(g, 8, 4, '#404050'); Gfx.hline(g, 6, 7, 4, '#404050'); });
    T.reg('door_brick', { kind: 'door', door: true }, (g, f, r) => { T.bricks(g, r, '#a05038', '#7a3828', 4, 8); Gfx.rect(g, 2, 1, 12, 15, '#e8dcc0'); Gfx.rect(g, 3, 2, 10, 14, '#202030'); Gfx.ellipse(g, 8, 4, 5, 3, '#202030'); });
    T.reg('door_stone', { kind: 'door', door: true }, (g, f, r) => { T.bricks(g, r, '#a8a8b8', '#787888', 4, 8); Gfx.rect(g, 3, 2, 10, 14, '#202030'); Gfx.rect(g, 4, 1, 8, 1, '#c8c8d8'); });
    T.reg('door_cave', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048'], 10); Gfx.ellipse(g, 8, 10, 6, 7, '#101018'); Gfx.rect(g, 2, 10, 12, 6, '#101018'); });
    T.reg('door_locked', { kind: 'door', solid: true, locked: true }, (g, f, r) => { T.bricks(g, r, '#a8a8b8', '#787888', 4, 8); Gfx.rect(g, 3, 2, 10, 14, '#404050'); Gfx.rect(g, 6, 7, 4, 4, '#e8c040'); Gfx.px(g, 8, 9, '#202020'); });
    T.reg('window', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 4, 3, 8, 8, '#6a4020'); Gfx.rect(g, 5, 4, 6, 6, '#88c0f0'); Gfx.px(g, 8, 4, '#6a4020'); Gfx.hline(g, 5, 7, 6, '#6a4020'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('window_stone', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a8a8b8', '#787888', 4, 8); Gfx.rect(g, 4, 3, 8, 8, '#404050'); Gfx.rect(g, 5, 4, 6, 6, '#88c0f0'); Gfx.px(g, 8, 4, '#404050'); Gfx.hline(g, 5, 7, 6, '#404050'); });
    T.reg('chimney', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c04838'); Gfx.rect(g, 5, 2, 6, 12, '#787888'); Gfx.rect(g, 4, 1, 8, 2, '#585868'); });
    T.reg('bars', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 1, 16, 2, '#505058'); Gfx.rect(g, 0, 13, 16, 2, '#505058'); for (let x = 1; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#787888'); Gfx.vline(g, x + 1, 0, 16, '#404048'); } });   // the bars of a cell
    T.reg('fence', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 6, 16, 2, '#a87848'); Gfx.rect(g, 0, 11, 16, 2, '#a87848'); Gfx.rect(g, 3, 3, 2, 12, '#886038'); Gfx.rect(g, 11, 3, 2, 12, '#886038'); });
    T.reg('fence_v', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 7, 0, 2, 16, '#a87848'); Gfx.rect(g, 5, 3, 6, 2, '#886038'); Gfx.rect(g, 5, 11, 6, 2, '#886038'); });
    // plank bridges: planks laid across the way, rope rails knotted along the open sides, posts at the ends. A piece
    // is named by its crossing (h: walked east-west, v: north-south), its rails and its end posts, so a painter can
    // put a whole bridge together from where the water and the other planks are
    const plankH = (g, r, rails, ends) => {
      Gfx.rect(g, 0, 0, 16, 16, '#b0824c');
      for (let x = 0; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#7a5230'); Gfx.vline(g, x + 1, 0, 16, '#c89860'); }
      for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#8a6238');
      if (rails.includes('n')) { Gfx.hline(g, 0, 1, 16, '#e0c898'); Gfx.hline(g, 0, 2, 16, '#8a6238'); for (let x = 1; x < 16; x += 5) Gfx.rect(g, x, 0, 2, 3, '#e8d0a0'); }
      if (rails.includes('s')) { Gfx.hline(g, 0, 13, 16, '#e0c898'); Gfx.hline(g, 0, 14, 16, '#8a6238'); for (let x = 3; x < 16; x += 5) Gfx.rect(g, x, 12, 2, 3, '#e8d0a0'); Gfx.hline(g, 0, 15, 16, '#4a3018'); }
      if (ends.includes('l')) { Gfx.rect(g, 0, 0, 3, 16, '#5a3a20'); Gfx.vline(g, 1, 0, 16, '#8a6238'); }
      if (ends.includes('r')) { Gfx.rect(g, 13, 0, 3, 16, '#5a3a20'); Gfx.vline(g, 14, 0, 16, '#8a6238'); }
    };
    const plankV = (g, r, rails, ends) => {
      Gfx.rect(g, 0, 0, 16, 16, '#b0824c');
      for (let y = 0; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, '#7a5230'); Gfx.hline(g, 0, y + 1, 16, '#c89860'); }
      for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#8a6238');
      if (rails.includes('w')) { Gfx.vline(g, 1, 0, 16, '#e0c898'); Gfx.vline(g, 2, 0, 16, '#8a6238'); for (let y = 1; y < 16; y += 5) Gfx.rect(g, 0, y, 3, 2, '#e8d0a0'); }
      if (rails.includes('e')) { Gfx.vline(g, 13, 0, 16, '#e0c898'); Gfx.vline(g, 14, 0, 16, '#8a6238'); for (let y = 3; y < 16; y += 5) Gfx.rect(g, 12, y, 3, 2, '#e8d0a0'); Gfx.vline(g, 15, 0, 16, '#4a3018'); }
      if (ends.includes('t')) { Gfx.rect(g, 0, 0, 16, 3, '#5a3a20'); Gfx.hline(g, 0, 1, 16, '#8a6238'); }
      if (ends.includes('b')) { Gfx.rect(g, 0, 13, 16, 3, '#5a3a20'); Gfx.hline(g, 0, 14, 16, '#8a6238'); }
    };
    for (const rails of ['', 'n', 's', 'ns']) for (const ends of ['', 'l', 'r', 'lr']) T.reg('plank_h_' + rails + '_' + ends, { kind: 'bridge' }, (g, f, r) => plankH(g, r, rails, ends));
    for (const rails of ['', 'w', 'e', 'we']) for (const ends of ['', 't', 'b', 'tb']) T.reg('plank_v_' + rails + '_' + ends, { kind: 'bridge' }, (g, f, r) => plankV(g, r, rails, ends));
    T.reg('bridge', { kind: 'bridge' }, (g, f, r) => plankH(g, r, 'ns', ''));
    T.reg('bridge_v', { kind: 'bridge' }, (g, f, r) => plankV(g, r, 'we', ''));
    // wreckage afloat: a raft of deck planking that takes a foot, and a board that only a hop clears
    T.reg('raft', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.rect(g, 0, 1, 16, 14, '#a88858'); for (let y = 1; y < 15; y += 4) Gfx.hline(g, 0, y, 16, '#705838'); Gfx.hline(g, 0, 15, 16, '#4a3820'); T.speckle(g, r, ['#b89868'], 3); });
    T.reg('flotsam', { kind: 'water', water: true, solid: true, hop: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); const dy = [0, 1, 0, -1][f]; Gfx.rect(g, 3, 6 + dy, 10, 4, '#a88858'); Gfx.hline(g, 3, 7 + dy, 10, '#705838'); Gfx.px(g, 1, 10 + dy, '#e0f0ff'); Gfx.px(g, 14, 5 + dy, '#e0f0ff'); });
    T.reg('dock', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b08858'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#886038'); });
    // a flight of stairs is drawn from pieces: rows t/m/b (top, middle, bottom) by columns l/c/r/s (left edge, centre,
    // right edge, a single column), picked at draw time from what surrounds the tile (field.js). The base tile stands
    // in for any piece that has no picture of its own.
    const stairSet = (name, lo, hi, dark, rail) => {
      const steps = (g) => { for (let y = 0; y < 16; y += 4) { Gfx.rect(g, 0, y, 16, 4, y % 8 ? lo : hi); Gfx.hline(g, 0, y + 3, 16, dark); } };
      T.reg(name, { kind: 'stairs', auto: true }, (g, f, r) => steps(g));
      for (const row of ['t', 'm', 'b']) for (const col of ['l', 'c', 'r', 's']) T.reg(name + '_' + row + col, { kind: 'stairs' }, (g, f, r) => {
        steps(g);
        if (col === 'l' || col === 's') { Gfx.rect(g, 0, 0, 2, 16, rail); Gfx.vline(g, 2, 0, 16, dark); }
        if (col === 'r' || col === 's') { Gfx.rect(g, 14, 0, 2, 16, rail); Gfx.vline(g, 13, 0, 16, dark); }
        if (row === 't') { Gfx.rect(g, 0, 0, 16, 2, rail); Gfx.hline(g, 0, 2, 16, dark); }
        if (row === 'b') { Gfx.rect(g, 0, 14, 16, 2, dark); }
      });
    };
    stairSet('stairs', STONE, STONE_L, STONE_D, '#c8c8d0'); stairSet('stairs_wood', '#a87848', '#c89868', '#604020', '#8a6a48');
    T.reg('stairs_down', { kind: 'stairs', warp: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#202030'); for (let y = 0; y < 12; y += 3) { Gfx.rect(g, 2 + y / 3, y, 12 - y / 1.5, 3, mix(STONE, '#202030', y / 12)); } });
    T.reg('stairs_up', { kind: 'stairs', warp: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, STONE_D); for (let y = 0; y < 16; y += 4) { Gfx.rect(g, 0, y, 16, 3, y % 8 ? STONE : STONE_L); } Gfx.rect(g, 0, 0, 16, 3, '#202030'); });
    T.reg('ladder', { kind: 'ladder', ladder: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048'], 8); Gfx.vline(g, 4, 0, 16, '#a87848'); Gfx.vline(g, 11, 0, 16, '#a87848'); for (let y = 2; y < 16; y += 4) Gfx.hline(g, 4, y, 8, '#c89868'); });
    T.reg('rope', { kind: 'rope', ladder: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#8a7a68'); Gfx.vline(g, 7, 0, 16, '#c8a060'); Gfx.vline(g, 8, 0, 16, '#a88040'); for (let y = 1; y < 16; y += 3) Gfx.px(g, 7 + (y % 2), y, '#e8c080'); });
    T.reg('ropeh', { kind: 'rope' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.hline(g, 0, 7, 16, '#c8a060'); Gfx.hline(g, 0, 8, 16, '#a88040'); });
    // a gap in a sanctum floor the player can jump across (one tile wide): dark water far below
    T.reg('chasm', { kind: 'pit', solid: true, hop: true }, (g, f, r) => { T.noiseFill(g, r, '#184858', ['#103848', '#205868'], 14); Gfx.hline(g, 0, 0, 16, '#0c2c38'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#3a8898'); });
    T.reg('floor_purple', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#5a3878'); T.speckle(g, r, ['#4e2e6a', '#684488'], 12); Gfx.hline(g, 0, 15, 16, '#4a2860'); });
    T.reg('pit', { kind: 'pit', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.hline(g, 0, 0, 16, '#3a3048'); });
    T.reg('hole', { kind: 'hole', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.ellipse(g, 8, 8, 6, 5, '#101018'); Gfx.ellipse(g, 8, 7, 5, 3, '#000000'); });
    T.reg('crack', { kind: 'cave', crack: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.line(g, 3, 2, 8, 8, '#2a2438'); Gfx.line(g, 8, 8, 6, 14, '#2a2438'); Gfx.line(g, 8, 8, 13, 11, '#2a2438'); Gfx.line(g, 9, 3, 8, 8, '#2a2438'); });
    T.reg('pillar', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 3, 1, 10, 14, STONE); Gfx.rect(g, 3, 1, 3, 14, STONE_L); Gfx.rect(g, 2, 0, 12, 3, STONE_L); Gfx.rect(g, 2, 13, 12, 3, STONE_D); Gfx.hline(g, 3, 6, 10, STONE_D); });
    T.reg('pillar_top', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 2, 10, 14, STONE); Gfx.rect(g, 3, 2, 3, 14, STONE_L); Gfx.rect(g, 2, 0, 12, 4, STONE_L); Gfx.rect(g, 2, 3, 12, 1, STONE_D); });
    T.reg('pillar_base', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 0, 10, 14, STONE); Gfx.rect(g, 3, 0, 3, 14, STONE_L); Gfx.rect(g, 2, 12, 12, 4, STONE_D); });
    T.reg('pillar_sunk', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.rect(g, 2, 3, 12, 10, STONE_D); Gfx.rect(g, 3, 4, 10, 8, STONE); });
    T.reg('pillar_fallen', { kind: 'bridge' }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.rect(g, 0, 4, 16, 8, STONE); Gfx.rect(g, 0, 4, 16, 2, STONE_L); Gfx.rect(g, 0, 10, 16, 2, STONE_D); });
    T.reg('boulder', { kind: 'boulder', solid: true, liftable: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 7, 6, '#8a8a98'); Gfx.ellipse(g, 6, 7, 4, 3, '#aaaab8'); Gfx.ellipse(g, 8, 13, 6, 2, '#5a5a68'); });
    T.reg('boulder_grass', { kind: 'boulder', solid: true, liftable: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 7, 6, '#8a8a98'); Gfx.ellipse(g, 6, 7, 4, 3, '#aaaab8'); Gfx.ellipse(g, 8, 13, 6, 2, '#5a5a68'); });
    T.reg('rock_small', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 5, 4, '#8a8a98'); Gfx.ellipse(g, 7, 9, 3, 2, '#aaaab8'); });
    T.reg('rock_grass', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 5, 4, '#8a8a98'); Gfx.ellipse(g, 7, 9, 3, 2, '#aaaab8'); });
    T.reg('rock_sand', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 5, 4, '#b8a888'); Gfx.ellipse(g, 7, 9, 3, 2, '#d8c8a8'); });
    T.reg('icepillar', { kind: 'pillar', solid: true, icepillar: true }, (g, f, r) => { Gfx.rect(g, 4, 0, 8, 16, '#b8e0f8'); Gfx.rect(g, 4, 0, 3, 16, '#e0f4ff'); Gfx.rect(g, 3, 13, 10, 3, '#88b8d8'); Gfx.px(g, 9, 4, '#ffffff'); });
    T.reg('crate', { kind: 'crate', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 14, '#a87848'); Gfx.rect(g, 1, 1, 14, 2, '#c89868'); Gfx.rect(g, 1, 13, 14, 2, '#604020'); Gfx.line(g, 2, 2, 13, 13, '#886038'); Gfx.line(g, 13, 2, 2, 13, '#886038'); });
    T.reg('barrel', { kind: 'barrel', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 2, 10, 13, '#8a5a30'); Gfx.rect(g, 3, 4, 10, 1, '#585868'); Gfx.rect(g, 3, 11, 10, 1, '#585868'); Gfx.ellipse(g, 8, 2, 5, 2, '#a87848'); Gfx.rect(g, 4, 2, 2, 13, '#a87848'); });
    T.reg('pot', { kind: 'pot', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 5, 5, '#b87848'); Gfx.rect(g, 5, 3, 6, 2, '#906030'); Gfx.ellipse(g, 6, 7, 2, 2, '#d8a070'); });
    T.reg('chest', { kind: 'chest', solid: true, chest: true }, (g, f, r) => { Gfx.rect(g, 2, 5, 12, 9, '#a06030'); Gfx.rect(g, 2, 4, 12, 4, '#c08040'); Gfx.rect(g, 2, 8, 12, 1, '#604020'); Gfx.rect(g, 7, 7, 2, 3, '#e8c040'); Gfx.rect(g, 2, 13, 12, 1, '#604020'); });
    T.reg('chest_open', { kind: 'chest', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 7, 12, 7, '#a06030'); Gfx.rect(g, 2, 2, 12, 4, '#c08040'); Gfx.rect(g, 3, 7, 10, 3, '#402010'); Gfx.rect(g, 2, 13, 12, 1, '#604020'); });
    T.reg('sign', { kind: 'sign', solid: true, sign: true }, (g, f, r) => { Gfx.rect(g, 7, 8, 2, 7, '#886038'); Gfx.rect(g, 2, 2, 12, 7, '#c89868'); Gfx.rect(g, 3, 3, 10, 5, '#a87848'); Gfx.hline(g, 4, 4, 6, '#604020'); Gfx.hline(g, 4, 6, 8, '#604020'); });
    T.reg('lever', { kind: 'lever', solid: true }, (g, f, r) => { Gfx.rect(g, 4, 10, 8, 4, '#787888'); Gfx.rect(g, 5, 11, 6, 2, '#9aa0b0'); Gfx.rect(g, 7, 3, 2, 8, '#c8a060'); Gfx.circle(g, 8, 3, 2, '#e04040'); });
    T.reg('torch', { kind: 'wall', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4058', ['#3a3048'], 10); Gfx.rect(g, 7, 8, 2, 6, '#886038'); Gfx.ellipse(g, 8, 6, 3, 3 + f, '#f8a030'); Gfx.ellipse(g, 8, 6 - f, 1, 2, '#ffe060'); });
    T.reg('statue', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.rect(g, 3, 12, 10, 3, STONE_D); Gfx.rect(g, 5, 4, 6, 8, STONE); Gfx.circle(g, 8, 3, 2, STONE_L); Gfx.rect(g, 3, 6, 2, 4, STONE); Gfx.rect(g, 11, 6, 2, 4, STONE); });
    T.reg('statue_gold', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.rect(g, 3, 12, 10, 3, '#a08030'); Gfx.rect(g, 5, 4, 6, 8, '#e8c040'); Gfx.circle(g, 8, 3, 2, '#f8e080'); Gfx.rect(g, 3, 6, 2, 4, '#e8c040'); Gfx.rect(g, 11, 6, 2, 4, '#e8c040'); });
    T.reg('psystone', { kind: 'psystone', solid: true, psystone: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, STONE_D, [STONE], 8); Gfx.rect(g, 4, 12, 8, 3, STONE); Gfx.tri(g, 3, 12, 8, 1 + f, 13, 12, '#60c0f0'); Gfx.tri(g, 5, 10, 8, 4 + f, 10, 10, '#c0f0ff'); });
    T.reg('savepoint', { kind: 'stone', save: true }, (g, f, r) => { T.bricks(g, r, STONE, STONE_D, 8, 8); Gfx.circle(g, 8, 8, 5, '#f0e060'); Gfx.circle(g, 8, 8, 3, '#fff8c0'); });
    // Lighthouse beacons: a 2x2 stone brazier holding the elemental crystal (object layer, solid) plus a 2x1 flame
    // overlay above it when the beacon is lit. Drawn once as a 32x48 image and sliced into tiles.
    const drawBeacon = (g, f, lit, col, colD, colL, ox, oy) => {
      const c = Gfx.canvas(32, 48), q = Gfx.ctx(c);
      Gfx.ellipse(q, 16, 44, 14, 3, '#2a2438');                                   // floor shadow
      Gfx.rect(q, 5, 34, 22, 10, '#6a6480'); Gfx.rect(q, 3, 31, 26, 4, '#7a7490'); // basin + wide rim
      Gfx.rect(q, 3, 31, 26, 1, '#a8a2c0'); Gfx.rect(q, 6, 34, 20, 1, '#524c68'); Gfx.rect(q, 5, 43, 22, 2, '#3e3850');
      for (let i = 0; i < 4; i++) { Gfx.px(q, 8 + i * 5, 38, '#4a4458'); Gfx.px(q, 8 + i * 5, 39, '#9a94b0'); }
      Gfx.rect(q, 7, 30, 18, 1, colD);                                           // element band on the rim
      if (!lit) { Gfx.circle(q, 16, 25, 6, shade(col, 0.45)); Gfx.circle(q, 16, 25, 4, shade(col, 0.65)); Gfx.px(q, 14, 23, tint(col, 0.15)); }
      else {
        const sway = [0, 1, -1][f % 3];
        q.globalAlpha = 0.28; Gfx.circle(q, 16, 22, 10 + (f % 2), colL); q.globalAlpha = 1;   // soft halo
        Gfx.circle(q, 16, 25, 8, col); Gfx.circle(q, 16, 25, 5, colL); Gfx.circle(q, 15, 24, 2, '#ffffff');
        Gfx.ellipse(q, 16 + sway, 13, 5, 9, col); Gfx.ellipse(q, 16 - sway, 9, 3, 6, colL); Gfx.ellipse(q, 16 + sway, 5, 1 + (f % 2), 3, '#ffffff'); // flame plume
        Gfx.px(q, 10 - sway, 15 - f, colL); Gfx.px(q, 22 + sway, 13 + f, colL); Gfx.px(q, 9 + f, 7, colL); Gfx.px(q, 23 - f, 9, colL);
      }
      g.drawImage(c, -ox, -oy);
    };
    [['venus', '#e8c040', '#c09030', '#fff0a0', 0], ['mercury', '#50a8f0', '#3070c0', '#c0e8ff', 1], ['mars', '#f05030', '#c03020', '#ffc0a0', 2], ['jupiter', '#c070f0', '#8040c0', '#f0d0ff', 3]].forEach(([el, col, colD, colL, idx]) => {
      for (const [qn, ox, oy] of [['tl', 0, 16], ['tr', 16, 16], ['bl', 0, 32], ['br', 16, 32]]) {
        T.reg('beacon_' + el + '_' + qn, { kind: 'beacon', solid: true, beacon: idx }, (g, f, r) => drawBeacon(g, 0, false, col, colD, colL, ox, oy));
        T.reg('beacon_' + el + '_lit_' + qn, { kind: 'beacon', solid: true, beacon: idx, frames: 3, light: true }, (g, f, r) => drawBeacon(g, f, true, col, colD, colL, ox, oy));
      }
      T.reg('beacon_' + el + '_flame_l', { kind: 'beacon_fx', frames: 3 }, (g, f, r) => drawBeacon(g, f, true, col, colD, colL, 0, 0));
      T.reg('beacon_' + el + '_flame_r', { kind: 'beacon_fx', frames: 3 }, (g, f, r) => drawBeacon(g, f, true, col, colD, colL, 16, 0));
    });
    T.reg('elem_venus', { kind: 'stone', beacon: 0 }, (g, f, r) => { T.bricks(g, r, '#c8b898', '#a09070', 8, 8); Gfx.circle(g, 8, 8, 5, '#c09030'); Gfx.circle(g, 8, 8, 3, '#e8c040'); Gfx.px(g, 7, 7, '#fff0a0'); });
    T.reg('elem_mercury', { kind: 'stone', beacon: 1 }, (g, f, r) => { T.bricks(g, r, '#b8c8e8', '#8898c0', 8, 8); Gfx.circle(g, 8, 8, 5, '#3070c0'); Gfx.circle(g, 8, 8, 3, '#50a8f0'); Gfx.px(g, 7, 7, '#c0e8ff'); });
    T.reg('elem_mars', { kind: 'stone', beacon: 2 }, (g, f, r) => { T.bricks(g, r, '#e8b8a8', '#c08878', 8, 8); Gfx.circle(g, 8, 8, 5, '#c03020'); Gfx.circle(g, 8, 8, 3, '#f05030'); Gfx.px(g, 7, 7, '#ffc0a0'); });
    T.reg('tornado', { kind: 'stone', frames: 3 }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6 - f, 2, '#e8a8d0'); Gfx.ellipse(g, 8 + f - 1, 10, 4, 2, '#f0c0e0'); Gfx.ellipse(g, 8 - f + 1, 6, 3, 2, '#ffd8f0'); Gfx.ellipse(g, 8, 2, 2, 1, '#fff0ff'); Gfx.px(g, 6 + f, 12, '#ffffff'); Gfx.px(g, 10 - f, 8, '#ffffff'); });
    T.reg('elem_jupiter', { kind: 'stone', beacon: 3 }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#a890c0', 8, 8); Gfx.circle(g, 8, 8, 5, '#8040c0'); Gfx.circle(g, 8, 8, 3, '#c070f0'); Gfx.px(g, 7, 7, '#f0d0ff'); });
    T.reg('lh_floor_venus', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8c8a0', '#b0a078', 8, 8); });
    T.reg('lh_wall_venus', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#c0a870', '#907848', 4, 8); Gfx.hline(g, 0, 15, 16, '#605030'); Gfx.rect(g, 6, 5, 4, 4, '#e8c040'); });
    T.reg('lh_walltop_venus', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#605030', ['#504020'], 8); });
    T.reg('lh_floor_mercury', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#c0d0e8', '#98a8c8', 8, 8); });
    T.reg('lh_wall_mercury', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#8098c8', '#5870a0', 4, 8); Gfx.hline(g, 0, 15, 16, '#304070'); Gfx.rect(g, 6, 5, 4, 4, '#50a8f0'); });
    T.reg('lh_walltop_mercury', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#304070', ['#283860'], 8); });
    T.reg('lh_floor_mars', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#e0b8a8', '#b89080', 8, 8); });
    T.reg('lh_wall_mars', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#b87060', '#885040', 4, 8); Gfx.hline(g, 0, 15, 16, '#583020'); Gfx.rect(g, 6, 5, 4, 4, '#f05030'); });
    T.reg('lh_walltop_mars', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#583020', ['#482818'], 8); });
    T.reg('lh_floor_jupiter', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); });
    T.reg('lh_wall_jupiter', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#9878c0', '#705098', 4, 8); Gfx.hline(g, 0, 15, 16, '#403060'); Gfx.rect(g, 6, 5, 4, 4, '#c070f0'); });
    T.reg('lh_walltop_jupiter', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#403060', ['#382850'], 8); });
    T.reg('ruins_floor', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#b0a890', '#8a8270', 8, 8); T.speckle(g, r, ['#9a9280', '#c0b8a0'], 6); });
    T.reg('ruins_wall', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#9a9280', '#6a6250', 4, 8); Gfx.hline(g, 0, 15, 16, '#4a4230'); });
    T.reg('ruins_walltop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#4a4230', ['#3a3220'], 8); });
    // the Kalay Tunnel: mossy flags glowing here and there, pink brick walls under a dark purple top
    T.reg('kt_floor', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#5c7a48', '#3c5430', 8, 8); T.speckle(g, r, ['#6a8a54', '#506c40'], 6); });
    T.reg('kt_moss', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#5c7a48', '#3c5430', 8, 8); Gfx.ellipse(g, 8, 8, 6, 5, '#78b058'); Gfx.ellipse(g, 8, 8, 3, 2, '#a0e070'); });
    T.reg('kt_wall', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#b878b8', '#703c78', 4, 8); Gfx.hline(g, 0, 15, 16, '#4a2050'); });
    T.reg('kt_walltop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#3a2048', ['#2e1838', '#462858'], 12); Gfx.hline(g, 0, 15, 16, '#8a5a98'); });
    // ---- Interior ----
    T.reg('floor_wood', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c89058'); for (let y = 0; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, '#a87040'); Gfx.px(g, ((y / 4) * 5) % 16, y + 2, '#a87040'); } });
    T.reg('floor_stone', { kind: 'floor' }, (g, f, r) => { T.bricks(g, r, '#a8a8b8', '#888898', 8, 8); });
    T.reg('floor_tile', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#d8c8a8'); Gfx.rect(g, 0, 0, 8, 8, '#c0b090'); Gfx.rect(g, 8, 8, 8, 8, '#c0b090'); });
    T.reg('carpet_red', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b03030'); T.speckle(g, r, ['#c04040', '#a02828'], 10); });
    T.reg('carpet_red_edge', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b03030'); Gfx.rect(g, 0, 0, 16, 2, '#e0c040'); T.speckle(g, r, ['#c04040'], 6); });
    T.reg('carpet_blue', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3050a0'); T.speckle(g, r, ['#4060b0', '#284890'], 10); });
    T.reg('wall_in', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e0d0b0', ['#d0c0a0'], 6); Gfx.rect(g, 0, 12, 16, 4, '#8a6a4a'); Gfx.hline(g, 0, 12, 16, '#a88a6a'); });
    T.reg('wall_in_top', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4a3a2a'); });
    T.reg('wall_in_stone', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#9898a8', '#707080', 4, 8); Gfx.rect(g, 0, 13, 16, 3, '#505060'); });
    T.reg('wall_in_stone_top', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#303040'); });
    // the sides and foot of a room, seen edge-on: a sliver of wall against the dark, the way the real rooms end
    const roomEdges = (wall, col, dark) => {
      T.reg(wall + '_l', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 11, 0, 5, 16, col); Gfx.vline(g, 11, 0, 16, dark); });
      T.reg(wall + '_r', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 0, 0, 5, 16, col); Gfx.vline(g, 4, 0, 16, dark); });
      T.reg(wall + '_l2', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 11, 0, 5, 16, col); Gfx.vline(g, 11, 0, 16, dark); });
      T.reg(wall + '_r2', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 0, 0, 5, 16, col); Gfx.vline(g, 4, 0, 16, dark); });
      T.reg(wall + '_b', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 0, 0, 16, 4, dark); Gfx.hline(g, 0, 0, 16, col); });
      T.reg(wall + '_bl', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 11, 0, 5, 4, col); Gfx.rect(g, 11, 0, 5, 4, dark); Gfx.hline(g, 11, 0, 5, col); });
      T.reg(wall + '_br', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 0, 0, 5, 4, dark); Gfx.hline(g, 0, 0, 5, col); });
      T.reg(wall + '_tl', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 11, 4, 5, 12, col); Gfx.rect(g, 11, 0, 5, 4, dark); });
      T.reg(wall + '_tr', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#000000'); Gfx.rect(g, 0, 4, 5, 12, col); Gfx.rect(g, 0, 0, 5, 4, dark); });
    };
    roomEdges('wall_in', '#e0d0b0', '#4a3a2a'); roomEdges('wall_in_stone', '#9898a8', '#303040');
    roomEdges('cavewall', '#4a4058', '#2a2038'); roomEdges('lf_wall', '#5a4a70', '#2a2038'); roomEdges('kt_wall', '#b878b8', '#4a2050'); roomEdges('wall_temple', '#b0a890', '#4a4230'); roomEdges('wall_bark', '#8a6a48', '#3a2410');
    // a tree-house of Kolima: a landmark five tiles wide and four tall, blank until its picture is loaded
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) T.reg('treehouse_r' + j + 'c' + i, j === 0 ? { kind: 'landmark', solid: false, over: true } : { kind: 'landmark', solid: true }, g => { });
    // a waterfall is one sheet of falling water: pieces by row (the lip, the fall, the foam) and column, two frames
    const fall = (g, f, row, col) => {
      Gfx.rect(g, 0, 0, 16, 16, '#78b8f0'); for (let x = 1; x < 16; x += 3) { const y0 = (x * 5 + f * 8) % 16; Gfx.rect(g, x, 0, 1, 16, '#a8d8ff'); Gfx.rect(g, x, y0, 1, 5, '#f0f8ff'); if (y0 + 5 > 16) Gfx.rect(g, x, 0, 1, y0 + 5 - 16, '#f0f8ff'); }
      if (row === 't') { Gfx.rect(g, 0, 0, 16, 3, '#3878c8'); Gfx.hline(g, 0, 3, 16, '#e8f4ff'); }
      if (row === 'b') { for (let x = 0; x < 16; x += 2) { Gfx.px(g, x + (f ? 1 : 0), 13 + ((x / 2) % 2), '#ffffff'); Gfx.px(g, x, 15, '#d0ecff'); } }
      if (col === 'l' || col === 's') { Gfx.rect(g, 0, 0, 1, 16, '#5090d0'); }
      if (col === 'r' || col === 's') { Gfx.rect(g, 15, 0, 1, 16, '#5090d0'); }
    };
    T.reg('waterfall_mid', { kind: 'water', water: true, solid: true, frames: 2, auto: true }, (g, f, r) => fall(g, f, 'm', 'c'));
    for (const row of ['t', 'm', 'b']) for (const col of ['l', 'c', 'r', 's']) T.reg('waterfall_mid_' + row + col, { kind: 'water', water: true, solid: true, frames: 2 }, (g, f, r) => fall(g, f, row, col));
    T.reg('table', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 3, 14, 8, '#c89058'); Gfx.rect(g, 1, 3, 14, 2, '#e0a868'); Gfx.rect(g, 1, 10, 14, 1, '#804820'); Gfx.rect(g, 2, 11, 2, 4, '#804820'); Gfx.rect(g, 12, 11, 2, 4, '#804820'); });
    T.reg('chair', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 4, 2, 8, 6, '#a87040'); Gfx.rect(g, 4, 8, 8, 4, '#c89058'); Gfx.rect(g, 4, 12, 2, 3, '#804820'); Gfx.rect(g, 10, 12, 2, 3, '#804820'); });
    T.reg('bed', { kind: 'furniture', solid: true, bed: true }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 15, '#a87040'); Gfx.rect(g, 2, 2, 12, 5, '#f0f0f8'); Gfx.rect(g, 2, 7, 12, 9, '#4870c0'); Gfx.rect(g, 2, 7, 12, 1, '#3058a0'); Gfx.rect(g, 3, 3, 10, 3, '#d8d8e8'); Gfx.vline(g, 1, 1, 15, '#8a5830'); Gfx.vline(g, 14, 1, 15, '#8a5830'); });   // the head of a bed; the blanket runs on into bed_foot below without a seam
    T.reg('bed_foot', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 0, 14, 14, '#a87040'); Gfx.rect(g, 2, 0, 12, 11, '#4870c0'); Gfx.rect(g, 2, 11, 12, 2, '#3058a0'); Gfx.vline(g, 1, 0, 14, '#8a5830'); Gfx.vline(g, 14, 0, 14, '#8a5830'); Gfx.hline(g, 1, 13, 14, '#6a4020'); });
    T.reg('bookshelf', { kind: 'furniture', solid: true, book: true }, (g, f, r) => { Gfx.rect(g, 1, 0, 14, 16, '#8a5a30'); for (let y = 1; y < 15; y += 5) { Gfx.rect(g, 2, y, 12, 4, '#604020'); for (let x = 2; x < 14; x += 2) Gfx.rect(g, x, y, 1, 4, ['#c04040', '#4060c0', '#40a060', '#e0c040', '#a060c0'][Math.floor(r() * 5)]); } });
    T.reg('counter', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 2, 16, 12, '#a87040'); Gfx.rect(g, 0, 2, 16, 3, '#c89058'); Gfx.rect(g, 0, 13, 16, 2, '#604020'); });
    T.reg('fireplace', { kind: 'furniture', solid: true, frames: 2 }, (g, f, r) => { T.bricks(g, r, '#8a8a98', '#606070', 4, 8); Gfx.rect(g, 3, 5, 10, 10, '#201818'); Gfx.ellipse(g, 8, 11, 3, 3 + f, '#f8a030'); Gfx.ellipse(g, 8, 11 - f, 1, 2, '#ffe060'); });
    T.reg('shelf', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 0, 14, 16, '#8a5a30'); Gfx.rect(g, 2, 2, 12, 4, '#604020'); Gfx.rect(g, 2, 9, 12, 4, '#604020'); Gfx.rect(g, 3, 3, 3, 3, '#e04040'); Gfx.rect(g, 8, 3, 3, 3, '#40a0e0'); Gfx.rect(g, 4, 10, 4, 3, '#e0c040'); });
    T.reg('rug', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c89058'); Gfx.ellipse(g, 8, 8, 7, 5, '#b03030'); Gfx.ellipse(g, 8, 8, 5, 3, '#e0c040'); Gfx.ellipse(g, 8, 8, 3, 2, '#b03030'); });
    T.reg('inn_sign', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 2, 3, 12, 8, '#4870c0'); Gfx.rect(g, 3, 4, 10, 6, '#f0f0f8'); Gfx.rect(g, 5, 6, 6, 2, '#4870c0'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('shop_sign', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 2, 3, 12, 8, '#c04040'); Gfx.rect(g, 3, 4, 10, 6, '#f0f0f8'); Gfx.circle(g, 8, 7, 2, '#e8c040'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('weapon_sign', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 2, 3, 12, 8, '#606070'); Gfx.line(g, 4, 9, 11, 4, '#f0f0f8'); Gfx.px(g, 11, 4, '#e8c040'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('armor_sign', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 2, 3, 12, 8, '#4060a0'); Gfx.rect(g, 5, 4, 6, 6, '#c0c8d8'); Gfx.px(g, 7, 6, '#4060a0'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('sanctum_sign', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8dcc0', ['#d8ccb0'], 6); Gfx.rect(g, 2, 3, 12, 8, '#f0f0f8'); Gfx.rect(g, 7, 4, 2, 6, '#e0c040'); Gfx.rect(g, 5, 6, 6, 2, '#e0c040'); Gfx.hline(g, 0, 15, 16, '#a89878'); });
    T.reg('fountain', { kind: 'furniture', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, STONE); Gfx.ellipse(g, 8, 8, 7, 6, STONE_D); Gfx.ellipse(g, 8, 8, 5, 4, WATER_L); Gfx.px(g, 8, 4 - f, '#c0e8ff'); Gfx.px(g, 7, 5 - f, '#c0e8ff'); Gfx.px(g, 9, 5 - f, '#c0e8ff'); });
    // Kolima's tree-houses: the hollowed trunks' bark, the cut tops the roofs are made of, the doors and windows in
    // the wood, and the roots spread over the grass around them
    const barkFill = (g, r) => { Gfx.rect(g, 0, 0, 16, 16, '#7a4a28'); for (let x = 0; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#5a3418'); Gfx.vline(g, x + 2, 0, 16, '#9a6a3a'); } for (let i = 0; i < 4; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#5a3418'); };
    T.reg('bark', { kind: 'wall', solid: true }, (g, f, r) => barkFill(g, r));
    T.reg('door_tree', { kind: 'door', door: true }, (g, f, r) => { barkFill(g, r); Gfx.rect(g, 3, 4, 10, 12, '#201810'); Gfx.ellipse(g, 8, 5, 5, 3, '#201810'); Gfx.rect(g, 2, 4, 1, 12, '#c8a060'); Gfx.rect(g, 13, 4, 1, 12, '#c8a060'); });
    T.reg('window_tree', { kind: 'wall', solid: true }, (g, f, r) => { barkFill(g, r); Gfx.rect(g, 4, 3, 8, 9, '#c8a060'); Gfx.rect(g, 5, 4, 6, 7, '#88c0f0'); Gfx.ellipse(g, 8, 4, 3, 2, '#88c0f0'); Gfx.px(g, 8, 6, '#c8a060'); Gfx.hline(g, 5, 8, 6, '#c8a060'); });
    const barkTop = (g, r, edge) => { Gfx.rect(g, 0, 0, 16, 16, '#c8a060'); for (let i = 0; i < 5; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b08850'); if (edge) { Gfx.rect(g, 0, 12, 16, 4, '#8a5a30'); Gfx.hline(g, 0, 12, 16, '#a87848'); } };
    T.reg('bark_top', { kind: 'roof', solid: true }, (g, f, r) => { barkTop(g, r); Gfx.hline(g, 0, 5, 16, '#a88040'); Gfx.hline(g, 0, 11, 16, '#a88040'); });
    T.reg('bark_top_edge', { kind: 'roof', solid: true }, (g, f, r) => { barkTop(g, r, true); Gfx.hline(g, 0, 4, 16, '#a88040'); });
    T.reg('bark_top_peak', { kind: 'roof', solid: false, over: true }, (g, f, r) => { barkTop(g, r); Gfx.ellipse(g, 8, 14, 7, 6, '#b08850'); Gfx.ellipse(g, 8, 14, 5, 4, '#c8a060'); Gfx.ellipse(g, 8, 14, 2, 1, '#a88040'); Gfx.hline(g, 0, 0, 16, '#e0c080'); });
    // a root runs on toward whichever neighbours are root or trunk: sixteen joints, named by the sides they reach
    for (let m = 0; m < 16; m++) T.reg('root_' + m, { kind: 'rock', solid: true }, (g, f, r) => {
      T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 12);
      const seg = (x, y, w, h) => { Gfx.rect(g, x, y, w, h, '#7a4a28'); };
      if (m & 1) seg(5, 0, 6, 9); if (m & 2) seg(5, 7, 6, 9); if (m & 4) seg(7, 5, 9, 6); if (m & 8) seg(0, 5, 9, 6);
      if (!m) { Gfx.ellipse(g, 8, 9, 5, 3, '#7a4a28'); Gfx.ellipse(g, 7, 8, 2, 1, '#9a6a3a'); return; }
      Gfx.rect(g, 5, 5, 6, 6, '#7a4a28');
      if (m & 1) Gfx.vline(g, 5, 0, 8, '#9a6a3a'); if (m & 2) Gfx.vline(g, 10, 8, 8, '#5a3418'); if (m & 4) Gfx.hline(g, 8, 5, 8, '#9a6a3a'); if (m & 8) Gfx.hline(g, 0, 10, 8, '#5a3418');
      Gfx.px(g, 6, 6, '#9a6a3a'); Gfx.px(g, 9, 9, '#5a3418');
    });
    // Kolima Forest's felled logs: rolled along the ground a tile at a time, and afloat in the river once they land in it
    const logH = (g, i, water) => { if (water) { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.hline(g, 2, 2, 5, WATER_L); Gfx.hline(g, 9, 13, 5, WATER_L); } Gfx.rect(g, 0, 4, 16, 9, '#a87848'); Gfx.hline(g, 0, 4, 16, '#c89868'); Gfx.hline(g, 0, 12, 16, '#604020'); Gfx.hline(g, 0, 8, 16, '#8a5a30'); if (i === 'a') { Gfx.ellipse(g, 2, 8, 2, 4, '#c8a060'); Gfx.px(g, 2, 8, '#8a5a30'); } if (i === 'c') { Gfx.ellipse(g, 13, 8, 2, 4, '#c8a060'); Gfx.px(g, 13, 8, '#8a5a30'); } };
    const logV = (g, i, water) => { if (water) { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.hline(g, 0, 3, 3, WATER_L); Gfx.hline(g, 13, 11, 3, WATER_L); } Gfx.rect(g, 4, 0, 9, 16, '#a87848'); Gfx.vline(g, 4, 0, 16, '#c89868'); Gfx.vline(g, 12, 0, 16, '#604020'); Gfx.vline(g, 8, 0, 16, '#8a5a30'); if (i === 'a') { Gfx.ellipse(g, 8, 2, 4, 2, '#c8a060'); Gfx.px(g, 8, 2, '#8a5a30'); } if (i === 'c') { Gfx.ellipse(g, 8, 13, 4, 2, '#c8a060'); Gfx.px(g, 8, 13, '#8a5a30'); } };
    for (const i of ['a', 'b', 'c']) { T.reg('log_h_' + i, { kind: 'log', solid: true }, (g, f, r) => logH(g, i, false)); T.reg('log_v_' + i, { kind: 'log', solid: true }, (g, f, r) => logV(g, i, false)); }
    // the same logs a quarter turn on, for the roll: the grain and the shadow swap sides
    for (const i of ['a', 'b', 'c']) { T.reg('log_h_' + i + '2', { kind: 'log', solid: true }, (g, f, r) => { logH(g, i, false); Gfx.hline(g, 0, 4, 16, '#604020'); Gfx.hline(g, 0, 12, 16, '#c89868'); Gfx.hline(g, 0, 6, 16, '#c89868'); Gfx.hline(g, 0, 10, 16, '#8a5a30'); }); T.reg('log_v_' + i + '2', { kind: 'log', solid: true }, (g, f, r) => { logV(g, i, false); Gfx.vline(g, 4, 0, 16, '#604020'); Gfx.vline(g, 12, 0, 16, '#c89868'); Gfx.vline(g, 6, 0, 16, '#c89868'); Gfx.vline(g, 10, 0, 16, '#8a5a30'); }); }
    T.reg('log_float_h', { kind: 'bridge' }, (g, f, r) => logH(g, 'b', true)); T.reg('log_float_v', { kind: 'bridge' }, (g, f, r) => logV(g, 'b', true));
    // inside Tret: the wood-grain floor of the hollow, its bark walls and the ridges across it, the spider webs
    // over the drops, the leaves that hold once, and the holes down to the room below
    const grain = (g, r, base, dark, light) => { Gfx.rect(g, 0, 0, 16, 16, base); for (let y = 0; y < 16; y += 3) Gfx.hline(g, 0, y, 16, dark); for (let i = 0; i < 5; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), light); };
    T.reg('floor_bark', { kind: 'floor' }, (g, f, r) => grain(g, r, '#b08a58', '#9a7448', '#c8a068'));
    T.reg('wall_bark', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#6a4628'); for (let x = 0; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#4a2e18'); Gfx.vline(g, x + 2, 0, 16, '#8a6038'); } });
    T.reg('wall_bark_top', { kind: 'walltop', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4a2e18'); Gfx.rect(g, 0, 10, 16, 6, '#6a4628'); Gfx.hline(g, 0, 10, 16, '#8a6038'); });
    T.reg('ridge', { kind: 'wall', solid: true }, (g, f, r) => { grain(g, r, '#b08a58', '#9a7448', '#c8a068'); Gfx.rect(g, 0, 5, 16, 7, '#8a6038'); Gfx.hline(g, 0, 5, 16, '#d8b880'); Gfx.hline(g, 0, 11, 16, '#5a3a20'); for (let x = 1; x < 16; x += 4) Gfx.rect(g, x, 2, 2, 4, '#c8a068'); });
    const web = (g, r) => { Gfx.rect(g, 0, 0, 16, 16, '#201810'); for (let i = 0; i < 4; i++) { Gfx.hline(g, 0, 2 + i * 4, 16, '#8a8aa0'); Gfx.vline(g, 2 + i * 4, 0, 16, '#8a8aa0'); } Gfx.line(g, 0, 0, 15, 15, '#b0b0c8'); Gfx.line(g, 15, 0, 0, 15, '#b0b0c8'); };
    T.reg('web', { kind: 'web', solid: true, hop: true }, (g, f, r) => web(g, r));
    T.reg('web_leaf', { kind: 'floor' }, (g, f, r) => web(g, r));
    T.reg('web_torn', { kind: 'hole', hole: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#100c08'); Gfx.line(g, 0, 3, 6, 9, '#8a8aa0'); Gfx.line(g, 15, 2, 10, 8, '#8a8aa0'); Gfx.line(g, 2, 15, 7, 11, '#8a8aa0'); });
    T.reg('leaf', { kind: 'leaf' }, (g, f, r) => { Gfx.ellipse(g, 8, 8, 7, 5, '#d8b830'); Gfx.ellipse(g, 8, 8, 6, 4, '#f0d040'); Gfx.line(g, 2, 8, 14, 8, '#b09020'); Gfx.line(g, 5, 5, 8, 8, '#b09020'); Gfx.line(g, 9, 8, 12, 5, '#b09020'); Gfx.line(g, 5, 11, 8, 8, '#b09020'); });
    T.reg('hole_bark', { kind: 'hole', hole: true }, (g, f, r) => { grain(g, r, '#b08a58', '#9a7448', '#c8a068'); Gfx.ellipse(g, 8, 8, 7, 6, '#4a2e18'); Gfx.ellipse(g, 8, 8, 5, 4, '#100c08'); });
    T.reg('vine_bark', { kind: 'ladder', ladder: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#7a4a28'); for (let x = 0; x < 16; x += 4) Gfx.vline(g, x, 0, 16, '#5a3418'); Gfx.vline(g, 7, 0, 16, '#3c8c3c'); Gfx.vline(g, 8, 0, 16, '#58a848'); for (let y = 1; y < 16; y += 4) { Gfx.px(g, 5, y, '#58a848'); Gfx.px(g, 10, y + 2, '#58a848'); } });
    T.reg('vine_sky', { kind: 'ladder', ladder: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c0e8'); Gfx.vline(g, 7, 0, 16, '#3c8c3c'); Gfx.vline(g, 8, 0, 16, '#58a848'); for (let y = 1; y < 16; y += 4) { Gfx.px(g, 5, y, '#58a848'); Gfx.px(g, 10, y + 2, '#58a848'); } });
    // Tret's branches, walked along high above the forest, and the sky and canopy around them
    T.reg('branch', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#d8b040'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#b89030'); for (let i = 0; i < 4; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#f0d060'); });
    T.reg('branch_edge', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#d8b040'); for (let y = 0; y < 12; y += 4) Gfx.hline(g, 0, y, 16, '#b89030'); Gfx.rect(g, 0, 12, 16, 4, '#8a6820'); });
    T.reg('sky', { kind: 'void', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c0e8'); if (r() < 0.2) Gfx.ellipse(g, 8, 8, 6, 2, '#a8d8f0'); });
    T.reg('sky_gap', { kind: 'gap', solid: true, hop: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c0e8'); Gfx.hline(g, 0, 0, 16, '#a8d8f0'); });
    T.reg('sky_canopy', { kind: 'void', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c0e8'); Gfx.ellipse(g, 8, 9, 7, 5, '#3c8c3c'); Gfx.ellipse(g, 7, 7, 4, 3, '#58a848'); });
    T.reg('trunk_face', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c8a040'); for (let x = 0; x < 16; x += 4) { Gfx.vline(g, x, 0, 16, '#8a6820'); Gfx.vline(g, x + 2, 0, 16, '#e0c060'); } });
    T.reg('door_trunk', { kind: 'door', door: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c8a040'); for (let x = 0; x < 16; x += 4) Gfx.vline(g, x, 0, 16, '#8a6820'); Gfx.rect(g, 3, 3, 10, 13, '#201810'); Gfx.ellipse(g, 8, 4, 5, 3, '#201810'); });
    // Tret's and Laurel's faces in the bark: two tiles wide, two tall
    const faceCol = { skin: '#c8a060', dark: '#8a6030', eye: '#f0e040' };
    T.reg('face_tl', { kind: 'wall', solid: true }, (g, f, r) => { barkFill(g, r); Gfx.ellipse(g, 16, 16, 12, 12, faceCol.skin); Gfx.ellipse(g, 10, 11, 3, 2, '#ffffff'); Gfx.px(g, 10, 11, '#101010'); });
    T.reg('face_tr', { kind: 'wall', solid: true }, (g, f, r) => { barkFill(g, r); Gfx.ellipse(g, 0, 16, 12, 12, faceCol.skin); Gfx.ellipse(g, 5, 11, 3, 2, '#ffffff'); Gfx.px(g, 5, 11, '#101010'); });
    T.reg('face_bl', { kind: 'wall', solid: true }, (g, f, r) => { barkFill(g, r); Gfx.ellipse(g, 16, 0, 12, 12, faceCol.skin); Gfx.line(g, 9, 5, 15, 7, faceCol.dark); });
    T.reg('face_br', { kind: 'wall', solid: true }, (g, f, r) => { barkFill(g, r); Gfx.ellipse(g, 0, 0, 12, 12, faceCol.skin); Gfx.line(g, 0, 7, 6, 5, faceCol.dark); Gfx.px(g, 0, 3, faceCol.dark); });
    // a drained pond: the wet sand of its bed, walked, and the deep mud, not
    T.reg('pond_bed', { kind: 'dirt' }, (g, f, r) => { T.noiseFill(g, r, '#b8a070', ['#a89060', '#c8b080'], 22); Gfx.px(g, (f * 5 + 3) % 16, 9, '#889870'); });
    T.reg('mud', { kind: 'mud', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6a5838', ['#5a4a30', '#7a6840'], 16); Gfx.ellipse(g, 6, 9, 3, 1, '#4a3a28'); Gfx.ellipse(g, 12, 4, 2, 1, '#8a7850'); });
    // Imil in the snow: boulders under their caps of snow, the rocks that stop a slide on the ice, snow-heaped roofs
    // on dark timber, the frozen falls
    T.reg('rock_snow', { kind: 'rock', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0'], 10); Gfx.ellipse(g, 8, 10, 6, 4, '#8a8a98'); Gfx.ellipse(g, 8, 8, 5, 3, '#f8fcff'); Gfx.px(g, 5, 11, '#6a6a78'); });
    T.reg('rock_ice', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b8e0f8'); Gfx.line(g, 2, 3, 9, 8, '#e0f4ff'); Gfx.ellipse(g, 8, 10, 5, 4, '#a08060'); Gfx.ellipse(g, 8, 8, 4, 2, '#f8fcff'); Gfx.px(g, 6, 11, '#7a6040'); });
    T.reg('fence_snow', { kind: 'fence', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0'], 8); Gfx.rect(g, 3, 4, 3, 11, '#886038'); Gfx.rect(g, 10, 4, 3, 11, '#886038'); Gfx.rect(g, 2, 3, 5, 2, '#ffffff'); Gfx.rect(g, 9, 3, 5, 2, '#ffffff'); Gfx.hline(g, 0, 8, 16, '#a87848'); Gfx.hline(g, 0, 12, 16, '#a87848'); });
    // a cabin's snow roof: the ridge, the slope, the eave with its icicles over the timber fascia, and the gable edges
    const snowSlope = (g, r, shade) => { T.noiseFill(g, r, '#e2e9f7', ['#d8e0f2', '#eef3fc', '#dce4f4'], 10); for (let k = -16; k < 16; k += 5) Gfx.line(g, k, 15, k + 15, 0, shade); };
    const snowRidge = (g, r) => { snowSlope(g, r, '#c9d3e8'); Gfx.rect(g, 0, 0, 16, 3, '#ffffff'); Gfx.hline(g, 0, 3, 16, '#c8d2e6'); Gfx.hline(g, 0, 0, 16, '#8c98b4'); };
    const snowEave = (g, r) => { snowSlope(g, r, '#c9d3e8'); Gfx.rect(g, 0, 10, 16, 6, '#5a3a20'); Gfx.hline(g, 0, 10, 16, '#7a5030'); Gfx.hline(g, 0, 15, 16, '#2a1808'); for (let x = 0; x < 16; x += 4) { Gfx.rect(g, x, 9, 4, 2, '#e8eef8'); Gfx.rect(g, x + 1, 11, 2, 2, '#dce4f4'); Gfx.px(g, x + 1, 13, '#c8d2e6'); } };
    const gable = (g, side) => { const x = side === 'l' ? 0 : 14; Gfx.rect(g, x, 0, 2, 16, '#8c98b4'); Gfx.vline(g, side === 'l' ? 0 : 15, 0, 16, '#5c6880'); };
    T.reg('roof_snow', { kind: 'roof', solid: true }, (g, f, r) => snowSlope(g, r, '#c9d3e8'));
    T.reg('roof_snow_l', { kind: 'roof', solid: true }, (g, f, r) => { snowSlope(g, r, '#c9d3e8'); gable(g, 'l'); });
    T.reg('roof_snow_r', { kind: 'roof', solid: true }, (g, f, r) => { snowSlope(g, r, '#c9d3e8'); gable(g, 'r'); });
    T.reg('roof_snow_edge', { kind: 'roof', solid: true }, (g, f, r) => snowEave(g, r));
    T.reg('roof_snow_edge_l', { kind: 'roof', solid: true }, (g, f, r) => { snowEave(g, r); gable(g, 'l'); });
    T.reg('roof_snow_edge_r', { kind: 'roof', solid: true }, (g, f, r) => { snowEave(g, r); gable(g, 'r'); });
    T.reg('roof_snow_peak', { kind: 'roof', solid: false, over: true }, (g, f, r) => snowRidge(g, r));
    T.reg('roof_snow_peak_l', { kind: 'roof', solid: false, over: true }, (g, f, r) => { snowRidge(g, r); gable(g, 'l'); Gfx.rect(g, 0, 0, 3, 3, '#8c98b4'); });
    T.reg('roof_snow_peak_r', { kind: 'roof', solid: false, over: true }, (g, f, r) => { snowRidge(g, r); gable(g, 'r'); Gfx.rect(g, 13, 0, 3, 3, '#8c98b4'); });
    T.reg('chimney_snow', { kind: 'roof', solid: true }, (g, f, r) => { snowSlope(g, r, '#c9d3e8'); Gfx.rect(g, 5, 2, 6, 12, '#787888'); for (let y = 4; y < 14; y += 3) Gfx.hline(g, 5, y, 6, '#606070'); Gfx.rect(g, 4, 1, 8, 2, '#585868'); Gfx.rect(g, 4, 0, 8, 1, '#f4f7ff'); });
    T.reg('wall_timber', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#5a3a20'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#3a2410'); for (let y = 1; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#7a5030'); Gfx.hline(g, 0, 15, 16, '#2a1808'); });
    T.reg('door_timber', { kind: 'door', door: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#5a3a20'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#3a2410'); Gfx.rect(g, 3, 2, 10, 14, '#201810'); Gfx.ellipse(g, 8, 3, 5, 3, '#201810'); Gfx.rect(g, 2, 2, 1, 14, '#a87848'); Gfx.rect(g, 13, 2, 1, 14, '#a87848'); });
    T.reg('window_timber', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#5a3a20'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#3a2410'); Gfx.rect(g, 4, 3, 8, 8, '#e8d8a0'); Gfx.rect(g, 5, 4, 6, 6, '#f8e8b0'); Gfx.px(g, 8, 4, '#5a3a20'); Gfx.hline(g, 5, 7, 6, '#5a3a20'); });
    T.reg('ice_fall', { kind: 'cliff', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b8e0f8'); for (let x = 1; x < 16; x += 3) Gfx.vline(g, x, 0, 16, '#e0f4ff'); for (let x = 2 + f; x < 16; x += 5) Gfx.vline(g, x, 0, 16, '#98c8e8'); Gfx.hline(g, 0, 15, 16, '#78a8c8'); });
    // the Mercury Lighthouse: teal stone, the grates over the channels, the jump tiles that glow on the water, the
    // gaps between the walkways, the pipes of the waterworks, the falls that hide doorways, and the goddess
    const LHT = '#40b8a0', LHD = '#2c8878', LHL = '#78e0c8';
    // the rip's palette: pale mint paving set with a diamond pattern, cyan brick faces below the mint wall tops, bright blue water, dark purple void
    const lhDiamond = (g, base, line, hi) => { Gfx.rect(g, 0, 0, 16, 16, base); for (let i = 0; i < 8; i++) { Gfx.px(g, 8 + i, i, line); Gfx.px(g, 15 - i, 8 + i, line); Gfx.px(g, 7 - i, 8 + i, line); Gfx.px(g, i, 8 - i - 1, line); } Gfx.px(g, 8, 8, hi); Gfx.px(g, 7, 8, hi); Gfx.px(g, 8, 7, hi); Gfx.px(g, 7, 7, hi); };
    T.reg('lh_floor', { kind: 'stone', enc: true }, (g, f, r) => { lhDiamond(g, '#a4ecd4', '#78d0b8', '#c8f8e8'); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#b8f4e0'); });
    T.reg('lh_wall', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#48c0c8', '#2890a0', 4, 8); Gfx.hline(g, 0, 0, 16, '#a0f0e8'); Gfx.hline(g, 0, 15, 16, '#186070'); });
    T.reg('lh_walltop', { kind: 'walltop', solid: true }, (g, f, r) => { lhDiamond(g, '#8cdcc4', '#68c0a8', '#b0ecd8'); Gfx.hline(g, 0, 0, 16, '#c8f8e8'); Gfx.vline(g, 0, 0, 16, '#c8f8e8'); });
    T.reg('lh_void', { kind: 'void', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#300828'); });
    T.reg('lh_gap', { kind: 'gap', solid: true, hop: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2a0a24'); Gfx.hline(g, 0, 0, 16, '#48b0b8'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#402038'); });
    T.reg('lh_pit', { kind: 'gap', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2a0a24'); Gfx.hline(g, 0, 0, 16, '#48b0b8'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#402038'); });   // the same drop, too wide to jump
    T.reg('lh_grate', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2a6880'); for (let i = 0; i < 4; i++) { Gfx.line(g, i * 4 + 4, 0, 0, i * 4 + 4, '#9cd8d8'); Gfx.line(g, 15, i * 4 + 4, i * 4 + 4, 15, '#9cd8d8'); Gfx.line(g, 15 - i * 4 - 4, 0, 15, i * 4 + 4, '#9cd8d8'); Gfx.line(g, 0, i * 4 + 4, i * 4 + 4 - 0, 15, '#7cb8c0'); } });
    T.reg('lh_jump', { kind: 'bridge', frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.rect(g, 2, 2, 12, 12, f ? '#f0c8ff' : '#a4ecd4'); Gfx.rect(g, 4, 4, 8, 8, f ? '#e0a8f8' : '#78d0b8'); Gfx.rect(g, 6, 6, 4, 4, f ? '#f8e0ff' : '#c8f8e8'); });
    T.reg('lh_jump_off', { kind: 'water', water: true, solid: true, hop: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); Gfx.rect(g, 3, 3, 10, 10, '#78c8d0'); Gfx.rect(g, 5, 5, 6, 6, '#58a8c0'); Gfx.hline(g, 2 + f, 2, 3, WATER_L); });
    T.reg('lh_water', { kind: 'water', water: true, solid: true, hop: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, WATER); for (let i = 0; i < 5; i++) { const y = (i * 3 + f) % 16; Gfx.hline(g, (i * 5 + f * 2) % 16, y, 4, WATER_L); } Gfx.px(g, (f * 4 + 2) % 16, 9, WATER_D); });
    T.reg('lh_deep', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858c0'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 6 + f * 2) % 16, y, 3, '#4878d8'); } });
    T.reg('lh_column', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 0, 10, 16, '#c8e8f0'); Gfx.rect(g, 3, 0, 3, 16, '#e8f8ff'); Gfx.rect(g, 10, 0, 3, 16, '#88b8c8'); Gfx.rect(g, 2, 0, 12, 2, '#e8f8ff'); Gfx.rect(g, 2, 14, 12, 2, '#88b8c8'); });
    T.reg('lh_fall', { kind: 'door', door: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c8f8'); for (let x = 1 + f; x < 16; x += 3) Gfx.vline(g, x, 0, 16, '#e0f4ff'); for (let x = 2 - f; x < 16; x += 5) Gfx.vline(g, x, 0, 16, '#a0d8ff'); Gfx.hline(g, 0, 15, 16, '#ffffff'); });
    T.reg('lh_fall_wall', { kind: 'wall', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c8f8'); for (let x = 1 + f; x < 16; x += 3) Gfx.vline(g, x, 0, 16, '#e0f4ff'); for (let x = 2 - f; x < 16; x += 5) Gfx.vline(g, x, 0, 16, '#a0d8ff'); });
    T.reg('lh_slide', { kind: 'stairs' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78c0d8'); for (let y = 0; y < 16; y += 4) { Gfx.hline(g, 0, y, 16, '#a8e0f0'); Gfx.hline(g, 0, y + 2, 16, '#5898b8'); } });
    T.reg('lh_switch', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a4ecd4'); Gfx.rect(g, 3, 3, 10, 10, '#405880'); Gfx.rect(g, 4, 4, 8, 8, '#6888b0'); Gfx.rect(g, 6, 6, 4, 4, '#c8d8f0'); });
    T.reg('lh_switch_on', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a4ecd4'); Gfx.rect(g, 3, 3, 10, 10, '#405880'); Gfx.rect(g, 4, 4, 8, 8, '#60d0f0'); });
    T.reg('pipe_h', { kind: 'crate', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 0, 4, 16, 8, '#c8a878'); Gfx.hline(g, 0, 4, 16, '#e8d0a0'); Gfx.hline(g, 0, 11, 16, '#8a6a48'); Gfx.rect(g, 6, 3, 4, 10, '#a88860'); });
    T.reg('pipe_v', { kind: 'crate', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 4, 0, 8, 16, '#c8a878'); Gfx.vline(g, 4, 0, 16, '#e8d0a0'); Gfx.vline(g, 11, 0, 16, '#8a6a48'); Gfx.rect(g, 3, 6, 10, 4, '#a88860'); });
    T.reg('pipe_socket', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a4ecd4'); Gfx.rect(g, 0, 5, 16, 6, '#3a8878'); Gfx.rect(g, 6, 3, 4, 10, '#2c6860'); });
    const goddess = (g, r, part) => { Gfx.rect(g, 0, 0, 16, 16, '#48b0b8'); if (part === 'tl') { Gfx.ellipse(g, 16, 12, 9, 9, '#f0d8d0'); Gfx.px(g, 12, 10, '#101010'); Gfx.ellipse(g, 16, 4, 8, 4, '#e8c0b8'); } if (part === 'tr') { Gfx.ellipse(g, 0, 12, 9, 9, '#f0d8d0'); Gfx.px(g, 3, 10, '#101010'); Gfx.ellipse(g, 0, 4, 8, 4, '#e8c0b8'); } if (part === 'bl') { Gfx.rect(g, 6, 0, 10, 12, '#f0d8d0'); Gfx.ellipse(g, 12, 13, 6, 3, '#f8e8e0'); } if (part === 'br') { Gfx.rect(g, 0, 0, 10, 12, '#f0d8d0'); Gfx.ellipse(g, 4, 13, 6, 3, '#f8e8e0'); } };
    for (const q of ['tl', 'tr', 'bl', 'br']) T.reg('goddess_' + q, { kind: 'statue', solid: true }, (g, f, r) => goddess(g, r, q));
    T.reg('statue_blue', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 12, 10, 3, '#5878a8'); Gfx.rect(g, 5, 4, 6, 8, '#78b8f0'); Gfx.circle(g, 8, 3, 2, '#a0d8ff'); Gfx.rect(g, 3, 6, 2, 4, '#78b8f0'); Gfx.rect(g, 11, 6, 2, 4, '#78b8f0'); });
    T.reg('rainbow', { kind: 'void', solid: false, over: true }, (g, f, r) => { const cols = ['#ff6060', '#ffc040', '#f0f060', '#60e060', '#60c0ff', '#a070ff']; cols.forEach((c, i) => Gfx.hline(g, 0, 2 + i * 2, 16, c)); });
    // Bilibin's log palisade: the round tops of the logs are walked along, their faces stand solid below them
    T.reg('palisade_top', { kind: 'floor' }, (g, f, r) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 12); Gfx.ellipse(g, 8, 8, 8, 8, '#8a5a2a'); Gfx.ellipse(g, 8, 8, 7, 7, '#c89860'); Gfx.ellipse(g, 8, 8, 5, 5, '#b88650'); Gfx.ellipse(g, 8, 8, 3, 3, '#d8a870'); Gfx.px(g, 8, 8, '#8a5a2a'); });
    T.reg('palisade_face', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a87848'); Gfx.rect(g, 0, 0, 7, 16, '#b88650'); Gfx.rect(g, 8, 0, 7, 16, '#b08048'); Gfx.vline(g, 7, 0, 16, '#604020'); Gfx.vline(g, 15, 0, 16, '#604020'); Gfx.vline(g, 2, 0, 16, '#c89860'); Gfx.vline(g, 10, 0, 16, '#c89860'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#8a5a2a'); });
    T.reg('palisade_gate', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#8a5a2a'); for (let y = 1; y < 16; y += 4) Gfx.rect(g, 0, y, 16, 3, '#c89860'); Gfx.vline(g, 3, 0, 16, '#604020'); Gfx.vline(g, 12, 0, 16, '#604020'); });
    // the lumber yard's timber frame: posts and beams, and the stacks of logs cut for the palace
    T.reg('timber_v', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 0, 4, 16, '#b88650'); Gfx.vline(g, 6, 0, 16, '#d8a870'); Gfx.vline(g, 9, 0, 16, '#604020'); });
    T.reg('timber_h', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 5, 16, 5, '#b88650'); Gfx.hline(g, 0, 5, 16, '#d8a870'); Gfx.hline(g, 0, 9, 16, '#604020'); });
    T.reg('timber_x', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 0, 4, 16, '#b88650'); Gfx.vline(g, 6, 0, 16, '#d8a870'); Gfx.vline(g, 9, 0, 16, '#604020'); Gfx.rect(g, 0, 5, 16, 5, '#b88650'); Gfx.hline(g, 0, 5, 16, '#d8a870'); Gfx.hline(g, 0, 9, 16, '#604020'); });
    T.reg('logpile', { kind: 'rock', solid: true }, (g, f, r) => { for (const [x, y] of [[1, 9], [8, 9], [4, 3]]) { Gfx.rect(g, x, y, 7, 6, '#a87848'); Gfx.ellipse(g, x + 3, y + 3, 3, 3, '#c89860'); Gfx.ellipse(g, x + 3, y + 3, 1, 1, '#8a5a2a'); } Gfx.hline(g, 1, 15, 14, '#604020'); });
    // Kolima Bridge's drawbridge: the purple stone frame, the bar across its top that the road passes under, the deck of
    // logs standing raised inside it, and the winch with its chain
    T.reg('drawgate_post', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 0, 14, 16, '#9c78c8'); Gfx.rect(g, 1, 0, 3, 16, '#c0a0e0'); Gfx.rect(g, 12, 0, 3, 16, '#6c50a0'); for (let y = 3; y < 16; y += 4) Gfx.hline(g, 4, y, 8, '#8868b8'); });
    T.reg('drawgate_bar', { kind: 'void', solid: false, over: true }, (g, f, r) => { Gfx.rect(g, 0, 4, 16, 7, '#9c78c8'); Gfx.hline(g, 0, 4, 16, '#c0a0e0'); Gfx.hline(g, 0, 10, 16, '#6c50a0'); });
    T.reg('drawbridge_up', { kind: 'wall', solid: true }, (g, f, r) => { for (let x = 0; x < 16; x += 5) { Gfx.rect(g, x, 0, 5, 16, '#b88650'); Gfx.vline(g, x, 0, 16, '#d8a870'); Gfx.vline(g, x + 4, 0, 16, '#704828'); } });
    T.reg('winch', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 6, 12, 8, '#6c50a0'); Gfx.ellipse(g, 8, 9, 5, 4, '#9c78c8'); Gfx.ellipse(g, 8, 9, 2, 2, '#403060'); for (let y = 0; y < 6; y += 2) Gfx.px(g, 8 + (y % 4 ? 1 : 0), y, '#808090'); });
    // a big stone well, two tiles across
    const wellRing = (g, r, cx, cy) => { T.noiseFill(g, r, GRASS, [GRASS_D, GRASS_L], 12); Gfx.ellipse(g, cx, cy, 15, 9, STONE_D); Gfx.ellipse(g, cx, cy - 2, 14, 8, STONE); Gfx.ellipse(g, cx, cy - 2, 10, 5, '#101828'); Gfx.ellipse(g, cx, cy - 1, 8, 3, '#182840'); };
    T.reg('well_tl', { kind: 'furniture', solid: true }, (g, f, r) => wellRing(g, r, 16, 16)); T.reg('well_tr', { kind: 'furniture', solid: true }, (g, f, r) => wellRing(g, r, 0, 16));
    T.reg('well_bl', { kind: 'furniture', solid: true }, (g, f, r) => wellRing(g, r, 16, 0)); T.reg('well_br', { kind: 'furniture', solid: true }, (g, f, r) => wellRing(g, r, 0, 0));
    T.reg('well', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 4, STONE_D); Gfx.ellipse(g, 8, 10, 4, 2, '#101828'); Gfx.rect(g, 3, 2, 2, 8, '#886038'); Gfx.rect(g, 11, 2, 2, 8, '#886038'); Gfx.rect(g, 2, 1, 12, 2, '#c04838'); });
    // mine-cart rails on dirt: straight, four bends (named by the two sides they join), and the buffers at the ends
    const railBase = (g, r) => { T.noiseFill(g, r, DIRT, [DIRT_D, tint(DIRT, 0.15)], 12); };
    const railH = (g) => { for (const x of [0, 4, 8, 12]) Gfx.rect(g, x + 1, 4, 2, 8, '#8a6a3a'); Gfx.hline(g, 0, 5, 16, '#9098a8'); Gfx.hline(g, 0, 6, 16, '#d0d8e0'); Gfx.hline(g, 0, 10, 16, '#9098a8'); Gfx.hline(g, 0, 11, 16, '#d0d8e0'); };
    const railV = (g) => { for (const y of [0, 4, 8, 12]) Gfx.rect(g, 4, y + 1, 8, 2, '#8a6a3a'); Gfx.vline(g, 5, 0, 16, '#9098a8'); Gfx.vline(g, 6, 0, 16, '#d0d8e0'); Gfx.vline(g, 10, 0, 16, '#9098a8'); Gfx.vline(g, 11, 0, 16, '#d0d8e0'); };
    T.reg('rail_h', { kind: 'rail' }, (g, f, r) => { railBase(g, r); railH(g); });
    T.reg('rail_v', { kind: 'rail' }, (g, f, r) => { railBase(g, r); railV(g); });
    const bend = (name, n, e, s, w) => T.reg(name, { kind: 'rail' }, (g, f, r) => { railBase(g, r); Gfx.rect(g, 4, 4, 8, 8, '#8a6a3a'); const arm = (x, y, w2, h2) => { Gfx.rect(g, x, y, w2, h2, '#9098a8'); }; if (n) { Gfx.vline(g, 5, 0, 6, '#9098a8'); Gfx.vline(g, 6, 0, 6, '#d0d8e0'); Gfx.vline(g, 10, 0, 6, '#9098a8'); Gfx.vline(g, 11, 0, 6, '#d0d8e0'); } if (s) { Gfx.vline(g, 5, 10, 6, '#9098a8'); Gfx.vline(g, 6, 10, 6, '#d0d8e0'); Gfx.vline(g, 10, 10, 6, '#9098a8'); Gfx.vline(g, 11, 10, 6, '#d0d8e0'); } if (w) { Gfx.hline(g, 0, 5, 6, '#9098a8'); Gfx.hline(g, 0, 6, 6, '#d0d8e0'); Gfx.hline(g, 0, 10, 6, '#9098a8'); Gfx.hline(g, 0, 11, 6, '#d0d8e0'); } if (e) { Gfx.hline(g, 10, 5, 6, '#9098a8'); Gfx.hline(g, 10, 6, 6, '#d0d8e0'); Gfx.hline(g, 10, 10, 6, '#9098a8'); Gfx.hline(g, 10, 11, 6, '#d0d8e0'); } Gfx.rect(g, 5, 5, 7, 7, '#9098a8'); Gfx.rect(g, 6, 6, 5, 5, '#d0d8e0'); Gfx.rect(g, 7, 7, 3, 3, '#8a6a3a'); void arm; });
    bend('rail_nw', 1, 0, 0, 1); bend('rail_ne', 1, 1, 0, 0); bend('rail_sw', 0, 0, 1, 1); bend('rail_se', 0, 1, 1, 0);
    T.reg('rail_end_w', { kind: 'rail' }, (g, f, r) => { railBase(g, r); railH(g); Gfx.rect(g, 1, 3, 3, 10, '#5a3a1a'); });
    T.reg('rail_end_e', { kind: 'rail' }, (g, f, r) => { railBase(g, r); railH(g); Gfx.rect(g, 12, 3, 3, 10, '#5a3a1a'); });
    T.reg('rail_end_n', { kind: 'rail' }, (g, f, r) => { railBase(g, r); railV(g); Gfx.rect(g, 3, 1, 10, 3, '#5a3a1a'); });
    T.reg('cart', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 4, 12, 7, '#a87848'); Gfx.rect(g, 2, 4, 12, 2, '#c89868'); Gfx.circle(g, 4, 12, 2, '#584020'); Gfx.circle(g, 12, 12, 2, '#584020'); });
    T.reg('tent', { kind: 'roof', solid: true }, (g, f, r) => { Gfx.tri(g, 0, 15, 8, 1, 15, 15, '#d8c8a0'); Gfx.tri(g, 3, 15, 8, 5, 12, 15, '#b8a880'); Gfx.rect(g, 6, 9, 4, 6, '#584838'); });
    T.reg('ship_deck', { kind: 'floor' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b08858'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#886038'); T.speckle(g, r, ['#c09868'], 4); });
    T.reg('ship_rail', { kind: 'fence', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b08858'); Gfx.rect(g, 0, 4, 16, 3, '#604020'); Gfx.rect(g, 3, 4, 2, 10, '#604020'); Gfx.rect(g, 11, 4, 2, 10, '#604020'); });
    T.reg('mast', { kind: 'furniture', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#b08858'); Gfx.rect(g, 6, 0, 4, 16, '#604020'); Gfx.rect(g, 7, 0, 1, 16, '#8a6a3a'); });
    // ---- World map tiles ----
    T.reg('w_edge', { kind: 'void', solid: true, world: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c8d0e8'); for (let i = 0; i < 4; i++) Gfx.hline(g, (i * 5 + f * 2) % 16, (i * 4 + f) % 16, 5, '#e8f0ff'); Gfx.px(g, (f * 3 + 4) % 16, 11, '#a8b8d8'); });   // the mist over the falls at the rim of Weyard
    T.reg('w_ocean', { kind: 'water', water: true, solid: true, frames: 4, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858c8'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 7 + f * 2) % 16, y, 3, '#4880e0'); } });
    T.reg('w_sea', { kind: 'water', water: true, solid: true, frames: 4, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3878d8'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 7 + f * 2) % 16, y, 3, '#58a0f0'); } });
    T.reg('w_plain', { kind: 'grass', enc: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848', '#88c868'], 16); });
    T.reg('w_forest', { kind: 'forest', enc: true, world: true, slow: true }, (g, f, r) => { T.noiseFill(g, r, '#3c8c3c', ['#2c6c30', '#48a048'], 12); for (let i = 0; i < 4; i++) { const x = (i % 2) * 8 + 2 + (i > 1 ? 2 : 0), y = Math.floor(i / 2) * 8 + 1; Gfx.ellipse(g, x + 2, y + 3, 3, 3, '#48a048'); Gfx.ellipse(g, x + 2, y + 5, 3, 2, '#2c6c30'); Gfx.px(g, x + 1, y + 2, '#68c058'); } });
    T.reg('w_hill', { kind: 'hill', enc: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 10); Gfx.ellipse(g, 5, 10, 5, 4, '#8cc060'); Gfx.ellipse(g, 11, 12, 5, 3, '#8cc060'); Gfx.ellipse(g, 5, 9, 3, 2, '#a0d070'); });
    T.reg('w_mountain', { kind: 'mountain', solid: true, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78b858'); Gfx.tri(g, 0, 15, 7, 2, 14, 15, '#8a7a68'); Gfx.tri(g, 4, 15, 7, 6, 10, 15, '#7a6a58'); Gfx.tri(g, 5, 6, 7, 2, 9, 6, '#f0f4ff'); Gfx.tri(g, 8, 15, 13, 7, 16, 15, '#9a8a78'); });
    T.reg('w_desert', { kind: 'sand', enc: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#ecd890', ['#d8c070', '#f8e8a8'], 16); Gfx.hline(g, 2, 5, 6, '#d8c070'); Gfx.hline(g, 8, 11, 6, '#d8c070'); });
    T.reg('w_snow', { kind: 'snow', enc: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0', '#ffffff'], 12); });
    T.reg('w_snowmtn', { kind: 'mountain', solid: true, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#f0f4ff'); Gfx.tri(g, 0, 15, 7, 2, 14, 15, '#b8c0d0'); Gfx.tri(g, 4, 15, 7, 6, 10, 15, '#98a0b0'); Gfx.tri(g, 4, 7, 7, 2, 10, 7, '#ffffff'); });
    T.reg('w_swamp', { kind: 'swamp', enc: true, world: true, slow: true }, (g, f, r) => { T.noiseFill(g, r, '#587848', ['#486838', '#688858'], 20); Gfx.rect(g, 3, 6, 5, 2, '#38583c'); Gfx.rect(g, 9, 11, 5, 2, '#38583c'); });
    T.reg('w_wasteland', { kind: 'dirt', enc: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#a89070', ['#988060', '#b8a080'], 16); });
    T.reg('w_lava', { kind: 'lava', solid: true, frames: 4, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#e05020'); for (let i = 0; i < 8; i++) Gfx.rect(g, (Math.floor(r() * 16) + f * 2) % 16, Math.floor(r() * 16), 3, 1, '#f8a030'); });
    T.reg('w_road', { kind: 'dirt', world: true, enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8b878', ['#c8a868', '#e8c888'], 16); });
    T.reg('w_beach', { kind: 'sand', world: true }, (g, f, r) => { T.noiseFill(g, r, '#ecd890', ['#d8c070'], 10); });
    T.reg('w_river', { kind: 'water', water: true, solid: true, river: true, frames: 4, world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4890e0'); for (let i = 0; i < 3; i++) Gfx.hline(g, (i * 5 + f * 2) % 16, (i * 5 + f) % 16, 3, '#68b0f0'); });
    T.reg('w_bridge', { kind: 'bridge', world: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4890e0'); Gfx.rect(g, 0, 5, 16, 6, '#a87848'); Gfx.hline(g, 0, 5, 16, '#604020'); Gfx.hline(g, 0, 10, 16, '#604020'); });
    T.reg('w_bridge_v', { kind: 'bridge', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4890e0'); Gfx.rect(g, 5, 0, 6, 16, '#a87848'); Gfx.vline(g, 5, 0, 16, '#604020'); Gfx.vline(g, 10, 0, 16, '#604020'); });
    T.reg('w_town', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 8); Gfx.rect(g, 2, 8, 5, 6, '#e8dcc0'); Gfx.tri(g, 1, 8, 4, 4, 8, 8, '#c04838'); Gfx.rect(g, 9, 9, 5, 5, '#e8dcc0'); Gfx.tri(g, 8, 9, 11, 5, 15, 9, '#3858b0'); Gfx.px(g, 4, 11, '#604020'); Gfx.px(g, 11, 11, '#604020'); });
    T.reg('w_village', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 8); Gfx.rect(g, 4, 8, 7, 6, '#e8dcc0'); Gfx.tri(g, 3, 8, 7, 3, 12, 8, '#c8a050'); Gfx.px(g, 7, 11, '#604020'); });
    T.reg('w_city', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 8); Gfx.rect(g, 1, 6, 14, 9, '#d8d0c0'); Gfx.rect(g, 3, 2, 4, 5, '#c8c0b0'); Gfx.rect(g, 9, 3, 4, 4, '#c8c0b0'); Gfx.rect(g, 1, 6, 14, 1, '#a09080'); Gfx.px(g, 5, 10, '#4060a0'); Gfx.px(g, 10, 10, '#4060a0'); });
    T.reg('w_gate', { kind: 'gate', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78b858'); Gfx.rect(g, 0, 6, 16, 4, '#d8b878'); Gfx.rect(g, 3, 3, 10, 10, '#a87848'); Gfx.rect(g, 4, 4, 8, 8, '#c89868'); Gfx.vline(g, 7, 4, 8, '#604020'); Gfx.hline(g, 4, 7, 8, '#604020'); });
    T.reg('w_cave', { kind: 'cave_entrance', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#78b858'); Gfx.tri(g, 0, 15, 8, 2, 16, 15, '#8a7a68'); Gfx.ellipse(g, 8, 12, 3, 4, '#101018'); });
    T.reg('w_cave_snow', { kind: 'cave_entrance', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#f0f4ff'); Gfx.tri(g, 0, 15, 8, 2, 16, 15, '#b8c0d0'); Gfx.ellipse(g, 8, 12, 3, 4, '#101018'); });
    T.reg('w_cave_sand', { kind: 'cave_entrance', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#ecd890'); Gfx.tri(g, 0, 15, 8, 2, 16, 15, '#b8a888'); Gfx.ellipse(g, 8, 12, 3, 4, '#101018'); });
    T.reg('w_temple', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 8); Gfx.rect(g, 2, 7, 12, 8, '#d8d0b8'); Gfx.rect(g, 1, 5, 14, 2, '#b8b098'); Gfx.tri(g, 1, 5, 8, 1, 15, 5, '#c8b898'); Gfx.rect(g, 4, 9, 2, 6, '#a09880'); Gfx.rect(g, 10, 9, 2, 6, '#a09880'); });
    T.reg('w_ruins', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 8); Gfx.rect(g, 3, 9, 3, 6, '#a8a090'); Gfx.rect(g, 8, 6, 3, 9, '#a8a090'); Gfx.rect(g, 12, 11, 2, 4, '#a8a090'); Gfx.rect(g, 3, 8, 8, 1, '#c0b8a8'); });
    T.reg('w_ruins_sand', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#ecd890', ['#d8c070'], 8); Gfx.rect(g, 3, 9, 3, 6, '#a8a090'); Gfx.rect(g, 8, 6, 3, 9, '#a8a090'); Gfx.rect(g, 12, 11, 2, 4, '#a8a090'); });
    const lh = (name, col) => T.reg(name, { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 6); Gfx.rect(g, 5, 4, 6, 12, '#d8d8e8'); Gfx.rect(g, 6, 4, 1, 12, '#f0f0f8'); Gfx.rect(g, 4, 14, 8, 2, '#a0a0b0'); Gfx.rect(g, 4, 2, 8, 3, col); Gfx.circle(g, 8, 2, 2, tint(col, 0.5)); });
    lh('w_lh_venus', '#e8c040'); lh('w_lh_mercury', '#50a8f0'); lh('w_lh_mars', '#f05030'); lh('w_lh_jupiter', '#c070f0');
    T.reg('w_lh_dark', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 6); Gfx.rect(g, 5, 4, 6, 12, '#a8a8b8'); Gfx.rect(g, 4, 14, 8, 2, '#808090'); Gfx.rect(g, 4, 2, 8, 3, '#606070'); });
    T.reg('w_rock', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 6); Gfx.tri(g, 1, 15, 8, 1, 15, 15, '#a89070'); Gfx.tri(g, 4, 15, 8, 5, 12, 15, '#907858'); Gfx.px(g, 8, 4, '#f8e8a8'); });
    T.reg('w_tower', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#78b858', ['#68a848'], 6); Gfx.rect(g, 5, 3, 6, 13, '#b8b8c8'); Gfx.rect(g, 4, 1, 8, 3, '#8888a0'); Gfx.px(g, 7, 8, '#303040'); });
    T.reg('w_tower_snow', { kind: 'town', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0'], 6); Gfx.rect(g, 5, 3, 6, 13, '#b8c8e0'); Gfx.rect(g, 4, 1, 8, 3, '#88a0c0'); Gfx.px(g, 7, 8, '#303040'); });
    T.reg('w_island', { kind: 'sand', world: true, place: true }, (g, f, r) => { T.noiseFill(g, r, '#ecd890', ['#d8c070'], 8); Gfx.ellipse(g, 8, 9, 5, 3, '#3c8c3c'); Gfx.px(g, 6, 8, '#58a848'); });
    T.reg('w_dock', { kind: 'bridge', world: true, place: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3878d8'); Gfx.rect(g, 4, 0, 8, 16, '#a87848'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 4, y, 8, '#886038'); });
    // shadow overlay tile for darkness edges
    T.reg('shadow', { kind: 'overlay' }, (g) => { Gfx.rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.35)'); });
    // ---- Autotile edge overlays ----
    this.edges = {};
    const mkEdge = (name, fn) => { const c = Gfx.canvas(16, 16); fn(Gfx.ctx(c)); this.edges[name] = c; };
    // water shore: foam on the water tile side facing land
    mkEdge('water_n', g => { Gfx.hline(g, 0, 0, 16, '#a0d0ff'); Gfx.hline(g, 0, 1, 16, '#78b8f8'); });
    mkEdge('water_s', g => { Gfx.hline(g, 0, 15, 16, '#a0d0ff'); Gfx.hline(g, 0, 14, 16, '#78b8f8'); });
    mkEdge('water_w', g => { Gfx.vline(g, 0, 0, 16, '#a0d0ff'); Gfx.vline(g, 1, 0, 16, '#78b8f8'); });
    mkEdge('water_e', g => { Gfx.vline(g, 15, 0, 16, '#a0d0ff'); Gfx.vline(g, 14, 0, 16, '#78b8f8'); });
    // cliff face rendered on the land tile just south of a clifftop (i.e. the lower level shows the wall)
    mkEdge('cliff_face', g => { Gfx.rect(g, 0, 0, 16, 16, '#8a7a68'); Gfx.hline(g, 0, 0, 16, '#a89880'); Gfx.hline(g, 0, 15, 16, '#5a4a38'); Gfx.vline(g, 3, 3, 6, '#6a5a48'); Gfx.vline(g, 9, 6, 7, '#6a5a48'); Gfx.vline(g, 13, 2, 5, '#6a5a48'); });
    mkEdge('cliff_face_snow', g => { Gfx.rect(g, 0, 0, 16, 16, '#98a8c0'); Gfx.hline(g, 0, 0, 16, '#e8f0ff'); Gfx.hline(g, 0, 15, 16, '#687890'); Gfx.vline(g, 3, 3, 6, '#788898'); Gfx.vline(g, 9, 6, 7, '#788898'); });
    mkEdge('cliff_face_sand', g => { Gfx.rect(g, 0, 0, 16, 16, '#c8a878'); Gfx.hline(g, 0, 0, 16, '#e8d0a0'); Gfx.hline(g, 0, 15, 16, '#886848'); Gfx.vline(g, 3, 3, 6, '#a88858'); Gfx.vline(g, 9, 6, 7, '#a88858'); });
    mkEdge('cliff_edge_n', g => { Gfx.hline(g, 0, 0, 16, '#98c870'); });
    mkEdge('cliff_edge_w', g => { Gfx.vline(g, 0, 0, 16, '#98c870'); });
    mkEdge('cliff_edge_e', g => { Gfx.vline(g, 15, 0, 16, '#98c870'); });
    mkEdge('cliff_edge_s', g => { Gfx.hline(g, 0, 15, 16, '#4c7c34'); Gfx.hline(g, 0, 14, 16, '#5c8c44'); });
    mkEdge('dark_n', g => { Gfx.rect(g, 0, 0, 16, 4, 'rgba(0,0,0,0.25)'); });
    mkEdge('wall_shadow', g => { Gfx.rect(g, 0, 0, 16, 5, 'rgba(0,0,0,0.3)'); });
    // ---- GAIA ROCK / IZUMO (hot-syncable block: TK.hotTiles evaluates it with cliffSet and roof in scope) ----
    // Gaia Rock's tan rock: the climbed faces are the bumpy ones, the ledges pale sand, the worn edges drop a level;
    // inside, mauve floors between the same rock, altars, the dragon-head doors, the light orbs and their sunbeams
    T.reg('gr_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e0b868', ['#d4ac5c', '#ecc474', '#dcb464'], 16); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#f4d488'); Gfx.px(g, x + 1, y + 1, '#b89048'); } });
    T.reg('gr_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c88848', ['#b87840', '#d09454'], 14); Gfx.hline(g, 0, 0, 16, '#f0cc80'); Gfx.hline(g, 0, 15, 16, '#6c3c18'); for (let i = 0; i < 4; i++) { const x = 1 + i * 4 + Math.floor(r() * 2), y = 2 + Math.floor(r() * 9); Gfx.ellipse(g, x, y, 2, 1, '#e0a860'); Gfx.px(g, x, y + 1, '#8c5020'); } });
    T.reg('gr_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b87840', ['#a86c38', '#c08448', '#b07040'], 16); for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13); Gfx.ellipse(g, x, y, 2, 1, '#d09858'); Gfx.px(g, x, y + 1, '#8c5020'); } });
    cliffSet('gaiarock', 'gr_top', 'gr_face', 'gr_mid', '#f8dc98', '#d4ac5c', '#6c3c18', '#4c2810');
    T.reg('gr_ledge', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#f0d888', ['#e8d080', '#f8e090', '#ecd484'], 14); T.speckle(g, r, ['#d8c070', '#f8f0a0'], 4); });
    T.reg('gr_climb', { kind: 'ladder', ladder: true }, (g, f, r) => { T.noiseFill(g, r, '#b87840', ['#a86c38', '#c08448'], 12); for (let y = 1; y < 16; y += 4) { Gfx.hline(g, 3, y, 4, '#e8b870'); Gfx.hline(g, 9, y + 2, 4, '#e8b870'); Gfx.hline(g, 3, y + 1, 4, '#7c4818'); Gfx.hline(g, 9, y + 3, 4, '#7c4818'); } });   // the bumpy face, climbed hold by hold
    T.reg('gr_drop', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#e0b868', ['#d4ac5c', '#ecc474'], 16); Gfx.tri(g, 0, 16, 16, 16, 8, 3, '#f0d888'); Gfx.tri(g, 3, 16, 13, 16, 8, 7, '#d8c070'); Gfx.hline(g, 0, 15, 16, '#a87838'); });   // a worn edge: stepped on, the party slides down a level
    T.reg('gr_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#c88848', ['#b87840', '#d09454'], 14); Gfx.rect(g, 3, 5, 10, 11, '#0c0804'); Gfx.ellipse(g, 8, 5, 5, 4, '#0c0804'); Gfx.hline(g, 0, 0, 16, '#f0cc80'); });
    T.reg('torii_post', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 0, 4, 16, '#c03828'); Gfx.vline(g, 6, 0, 16, '#e05840'); Gfx.rect(g, 4, 14, 8, 2, '#484048'); });
    T.reg('torii_beam', { kind: 'stone', over: true }, (g, f, r) => { Gfx.rect(g, 0, 2, 16, 3, '#c03828'); Gfx.rect(g, 0, 2, 16, 1, '#e05840'); Gfx.rect(g, 0, 8, 16, 2, '#c03828'); Gfx.rect(g, 0, 0, 16, 2, '#303038'); });
    T.reg('statue_face', { kind: 'stone', frames: 2 }, (g, f, r) => { Gfx.ellipse(g, 8, 8, 7, 7, '#c8a058'); Gfx.ellipse(g, 8, 8, 6, 6, '#e0b868'); Gfx.ellipse(g, 5, 6, 2, 1 + f, '#3c2410'); Gfx.ellipse(g, 11, 6, 2, 1 + f, '#3c2410'); Gfx.ellipse(g, 8, 11, 3, 1 + f, '#3c2410'); Gfx.px(g, 8, 8, '#a87838'); });   // the carved faces that push out of the wall
    T.reg('wind_statue', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#6c3c18'); Gfx.rect(g, 4, 3, 8, 11, '#c8a870'); Gfx.ellipse(g, 8, 4, 4, 3, '#d8b880'); Gfx.ellipse(g, 8, 6, 2, 1, '#3c2410'); Gfx.vline(g, 4, 3, 11, '#e8c890'); Gfx.vline(g, 11, 3, 11, '#8c6030'); Gfx.px(g, 12, 6, '#f0f8ff'); Gfx.px(g, 14, 5, '#f0f8ff'); Gfx.px(g, 13, 8, '#f0f8ff'); });
    T.reg('vine_hang', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { const sx = f ? 1 : -1; Gfx.line(g, 8, 0, 8 + sx * 2, 8, '#3c8038'); Gfx.line(g, 8 + sx * 2, 8, 8 + sx * 3, 15, '#48a040'); for (let y = 2; y < 15; y += 3) Gfx.px(g, 8 + sx * Math.floor(y / 4) + (y % 2 ? 1 : -1), y, '#78d060'); });   // a vine hung over a gap: Whirlwind swings the party across on it
    T.reg('vine_deco', { kind: 'stone', over: true, frames: 2 }, (g, f, r) => { const sx = f ? 2 : -2; Gfx.line(g, 8, 0, 8 + sx, 9, '#3c8038'); Gfx.line(g, 8 + sx, 9, 8 + sx * 2, 15, '#48a040'); Gfx.px(g, 8 + sx, 5, '#78d060'); Gfx.px(g, 8 + sx * 2, 12, '#78d060'); });
    T.reg('gr_floor', { kind: 'cave', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#a898b0', ['#a090a8', '#b0a0b8', '#a494ac'], 14); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#c0b0c8'); Gfx.px(g, x + 1, y + 1, '#887890'); } });
    T.reg('gr_pit', { kind: 'pit', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#181018'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#302030'); });   // too wide to jump
    T.reg('gr_platform', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#181018'); Gfx.rect(g, 1, 2, 14, 12, '#48a048'); Gfx.rect(g, 1, 2, 14, 2, '#78d070'); Gfx.rect(g, 1, 12, 14, 2, '#2c6c30'); for (let i = 0; i < 4; i++) Gfx.px(g, 2 + Math.floor(r() * 12), 4 + Math.floor(r() * 8), '#90e088'); });   // the green platforms the bushes hid
    T.reg('gr_slide', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#a898b0', ['#a090a8', '#b0a0b8'], 14); Gfx.tri(g, 0, 16, 16, 16, 8, 2, '#584858'); Gfx.tri(g, 3, 16, 13, 16, 8, 6, '#302030'); });
    T.reg('altar_stone', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 6, 12, 9, '#8c8090'); Gfx.rect(g, 1, 4, 14, 3, '#b0a4b8'); Gfx.rect(g, 1, 4, 14, 1, '#d0c4d8'); Gfx.rect(g, 4, 8, 8, 5, '#6c6070'); Gfx.hline(g, 5, 10, 6, '#a898b0'); });
    T.reg('altar_lit', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 2, 6, 12, 9, '#8c8090'); Gfx.rect(g, 1, 4, 14, 3, '#b0a4b8'); Gfx.rect(g, 1, 4, 14, 1, '#d0c4d8'); Gfx.rect(g, 4, 8, 8, 5, '#6c6070'); Gfx.rect(g, 6, 0, 4, 5, f ? '#c88848' : '#e0a060'); Gfx.px(g, 7, 1, '#f8e0a0'); Gfx.px(g, 8, 2, '#f8e0a0'); });   // the idol dancing on it
    T.reg('dancing_idol', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 6, 5, 4, 8, '#c88848'); Gfx.ellipse(g, 8, 4, 3, 3, '#e0a060'); Gfx.px(g, 7, 3, '#3c2410'); Gfx.px(g, 9, 3, '#3c2410'); Gfx.line(g, 6, 7, f ? 2 : 4, f ? 4 : 10, '#c88848'); Gfx.line(g, 10, 7, f ? 14 : 12, f ? 10 : 4, '#c88848'); Gfx.line(g, 7, 13, 6, 16, '#8c5020'); Gfx.line(g, 9, 13, 10, 16, '#8c5020'); });
    T.reg('dragon_head', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 7, 6, '#6c5c70'); Gfx.ellipse(g, 8, 8, 6, 5, '#9088a0'); Gfx.ellipse(g, 5, 7, 2, 1, '#e04040'); Gfx.ellipse(g, 11, 7, 2, 1, '#e04040'); Gfx.rect(g, 4, 11, 8, 2, '#4c3c50'); for (let x = 4; x < 12; x += 2) Gfx.px(g, x, 11, '#f0f0f0'); Gfx.tri(g, 2, 4, 5, 4, 3, 0, '#9088a0'); Gfx.tri(g, 11, 4, 14, 4, 13, 0, '#9088a0'); });
    T.reg('light_orb', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 5, 10, 6, 6, '#6c6070'); Gfx.ellipse(g, 8, 7, 5, 5, '#6a6a80'); Gfx.ellipse(g, 7, 6, 2, 2, '#8a8aa0'); });
    T.reg('light_orb_lit', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 5, 10, 6, 6, '#6c6070'); Gfx.ellipse(g, 8, 7, 5, 5, f ? '#f8e890' : '#f0d860'); Gfx.ellipse(g, 7, 6, 2, 2, '#ffffff'); for (let i = 0; i < 4; i++) Gfx.px(g, 1 + Math.floor(r() * 14), Math.floor(r() * 5), '#fff8c0'); });
    T.reg('sunbeam', { kind: 'stone', over: true, frames: 2 }, (g, f, r) => { g.globalAlpha = f ? 0.45 : 0.35; Gfx.rect(g, 4, 0, 8, 16, '#fff0a0'); Gfx.rect(g, 6, 0, 4, 16, '#ffffe0'); g.globalAlpha = 1; });
    T.reg('cobweb', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#181018'); for (let i = 0; i < 8; i++) Gfx.line(g, 8, 8, 8 + Math.round(9 * Math.cos(i * Math.PI / 4)), 8 + Math.round(9 * Math.sin(i * Math.PI / 4)), '#d8d8e8'); for (const rr of [3, 6]) for (let i = 0; i < 8; i++) Gfx.line(g, 8 + Math.round(rr * Math.cos(i * Math.PI / 4)), 8 + Math.round(rr * Math.sin(i * Math.PI / 4)), 8 + Math.round(rr * Math.cos((i + 1) * Math.PI / 4)), 8 + Math.round(rr * Math.sin((i + 1) * Math.PI / 4)), '#c0c0d0'); });
    T.reg('gr_rock', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 7, 5, '#8c6c48'); Gfx.ellipse(g, 7, 8, 6, 4, '#b08c60'); Gfx.ellipse(g, 6, 7, 3, 2, '#c8a478'); Gfx.hline(g, 3, 14, 10, '#4c3418'); });
    T.reg('serpent_head', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 9, 9, 7, 6, '#586048'); Gfx.ellipse(g, 9, 8, 6, 5, '#788860'); Gfx.ellipse(g, 6, 7, 2, 1, '#c0c0a0'); Gfx.ellipse(g, 12, 7, 2, 1, '#c0c0a0'); Gfx.rect(g, 3, 11, 12, 2, '#3c4030'); Gfx.px(g, 5, 11, '#e8e8d8'); Gfx.px(g, 8, 11, '#e8e8d8'); Gfx.px(g, 11, 11, '#e8e8d8'); });
    T.reg('serpent_body', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 4, 16, 9, '#586048'); Gfx.rect(g, 0, 5, 16, 6, '#788860'); Gfx.rect(g, 0, 5, 16, 2, '#98a878'); for (let x = 1; x < 16; x += 4) Gfx.rect(g, x, 7, 2, 3, '#687850'); });
    T.reg('serpent_tail', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.tri(g, 0, 4, 0, 13, 15, 9, '#586048'); Gfx.tri(g, 0, 5, 0, 11, 12, 8, '#788860'); });
    T.reg('sand_tablet', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 3, 2, 10, 13, '#a89060'); Gfx.rect(g, 4, 3, 8, 11, '#d0b878'); Gfx.rect(g, 2, 14, 12, 2, '#6c5030'); for (let y = 5; y < 13; y += 3) Gfx.hline(g, 5, y, 6, '#8c7040'); Gfx.px(g, 8, 4, f ? '#fff8d0' : '#f0d888'); });
    roof('roof_pink', '#e070a0');
    T.reg('wall_izumo', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c89058'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#8c6030'); for (let y = 1; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#e0a868'); Gfx.hline(g, 0, 15, 16, '#5c3c18'); });   // the plank walls of Izumo's houses on their stilts
    T.reg('door_izumo', { kind: 'door', solid: false, door: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c89058'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#8c6030'); Gfx.rect(g, 3, 1, 10, 15, '#3c2410'); Gfx.rect(g, 4, 2, 8, 13, '#6c4820'); Gfx.hline(g, 4, 8, 8, '#3c2410'); });
    T.reg('window_izumo', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#c89058'); for (let y = 0; y < 16; y += 4) Gfx.hline(g, 0, y, 16, '#8c6030'); Gfx.rect(g, 3, 3, 10, 8, '#3c2410'); Gfx.rect(g, 4, 4, 8, 6, '#f0e0a0'); Gfx.vline(g, 8, 4, 6, '#3c2410'); });
    T.reg('stilt_steps', { kind: 'stairs' }, (g, f, r) => { T.noiseFill(g, r, '#5cb04c', ['#48984c', '#78c458'], 14); Gfx.rect(g, 4, 0, 8, 16, '#a87848'); for (let y = 1; y < 16; y += 3) Gfx.hline(g, 4, y, 8, '#e0b078'); Gfx.vline(g, 4, 0, 16, '#6c4820'); Gfx.vline(g, 11, 0, 16, '#6c4820'); });   // the wooden steps up to a stilt-house door
    T.reg('ring_stone', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#385830'); Gfx.rect(g, 4, 2, 8, 12, '#8890a0'); Gfx.rect(g, 4, 2, 2, 12, '#b0b8c8'); Gfx.ellipse(g, 8, 2, 4, 2, '#b0b8c8'); Gfx.rect(g, 10, 4, 2, 10, '#606878'); Gfx.px(g, 7, 7, '#606878'); });   // one of Izumo's ring of giant stones
    T.reg('ir_sand', { kind: 'sand', softsand: true, enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8c890', ['#ccbc84', '#e0d09c'], 22); Gfx.hline(g, 2, 5, 5, '#c0b078'); Gfx.hline(g, 8, 10, 6, '#c0b078'); });   // the soft sand of Izumo Ruins, sunk into with Sand
    // ---- END GAIA ROCK / IZUMO ----
    // ---- ANKOHL (hot-syncable block) ----
    // Ankohl Ruins: the yellow sandstone of the old sanctum, its halves of stone faces, the switches and the sand
    T.reg('ak_top', { kind: 'walltop', solid: true }, (g, f, r) => { T.bricks(g, r, '#d8c060', '#a89040', 8, 8); T.speckle(g, r, ['#e8d078', '#c0a850'], 5); });
    T.reg('ak_face', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#c0a850', '#8c7430', 4, 8); Gfx.hline(g, 0, 0, 16, '#f0dc90'); Gfx.hline(g, 0, 15, 16, '#5c4c20'); });
    T.reg('ak_mid', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#b09848', '#806a2c', 4, 8); });
    cliffSet('ankohl', 'ak_top', 'ak_face', 'ak_mid', '#f0dc90', '#c0a850', '#5c4c20', '#3c3010');
    T.reg('ak_floor', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#d0c898', '#a8a070', 8, 8); T.speckle(g, r, ['#c0b888', '#e0d8a8'], 5); });
    T.reg('ak_floor_dark', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#b0a878', '#888060', 8, 8); });
    T.reg('ak_pit', { kind: 'pit', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1c1810'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#302818'); });   // the low floors the sand fills; too wide to jump
    T.reg('ak_gap', { kind: 'pit', solid: true, hop: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1c1810'); Gfx.hline(g, 0, 0, 16, '#5c4c20'); Gfx.hline(g, 0, 15, 16, '#5c4c20'); });   // a crack across a corridor: jumped
    T.reg('ak_slide', { kind: 'stairs', hole: true }, (g, f, r) => { T.bricks(g, r, '#d0c898', '#a8a070', 8, 8); Gfx.tri(g, 0, 16, 16, 16, 8, 2, '#5c4c20'); Gfx.tri(g, 3, 16, 13, 16, 8, 6, '#302818'); });
    T.reg('ak_lowwall', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8cc80', ['#d8c070'], 10); Gfx.rect(g, 0, 0, 16, 9, '#c0a850'); Gfx.rect(g, 0, 0, 16, 2, '#f0dc90'); Gfx.rect(g, 0, 9, 16, 2, '#8c7430'); for (let x = 2; x < 16; x += 5) Gfx.vline(g, x, 2, 7, '#a89040'); });   // a low wall on the soft sand: only Sand goes under it
    T.reg('ak_block', { kind: 'pillar', solid: true, pushable: true }, (g, f, r) => { Gfx.rect(g, 2, 3, 12, 12, '#8c7430'); Gfx.rect(g, 2, 3, 12, 10, '#c0a850'); Gfx.rect(g, 2, 3, 12, 2, '#e8d078'); Gfx.rect(g, 2, 3, 2, 10, '#e8d078'); Gfx.hline(g, 4, 8, 8, '#a89040'); });   // the square blocks
    T.reg('ak_face_l', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 4, 1, 12, 15, '#b8a888'); Gfx.rect(g, 4, 1, 12, 2, '#d8c8a8'); Gfx.ellipse(g, 11, 7, 3, 2, '#3c3010'); Gfx.rect(g, 6, 11, 10, 2, '#7c6c50'); Gfx.rect(g, 4, 1, 1, 15, '#7c6c50'); Gfx.px(g, 11, 7, '#80a060'); });   // the left half of a stone face
    T.reg('ak_face_r', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 1, 12, 15, '#b8a888'); Gfx.rect(g, 0, 1, 12, 2, '#d8c8a8'); Gfx.ellipse(g, 4, 7, 3, 2, '#3c3010'); Gfx.rect(g, 0, 11, 10, 2, '#7c6c50'); Gfx.rect(g, 11, 1, 1, 15, '#7c6c50'); Gfx.px(g, 4, 7, '#80a060'); });   // the right half
    T.reg('ak_face_lit', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 15, '#b8a888'); Gfx.rect(g, 1, 1, 14, 2, '#d8c8a8'); Gfx.ellipse(g, 5, 7, 2, 2, f ? '#a0ff80' : '#60d050'); Gfx.ellipse(g, 11, 7, 2, 2, f ? '#a0ff80' : '#60d050'); Gfx.rect(g, 3, 11, 10, 2, '#7c6c50'); });   // the whole face, its eyes lit
    T.reg('ak_slot', { kind: 'stone', enc: true }, (g, f, r) => { T.bricks(g, r, '#d0c898', '#a8a070', 8, 8); Gfx.rect(g, 2, 2, 12, 12, '#a8a070'); Gfx.rect(g, 3, 3, 10, 10, '#c0b888'); Gfx.rect(g, 6, 6, 4, 4, '#8c7430'); });   // the place a face's half belongs
    T.reg('ak_switch', { kind: 'lever', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 8, 12, 6, '#a89040'); Gfx.rect(g, 3, 9, 10, 4, '#c0a850'); Gfx.rect(g, 6, 3, 4, 6, '#e04040'); Gfx.rect(g, 6, 3, 4, 2, '#ff8080'); });   // a floor switch
    T.reg('ak_switch_on', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d0c898', '#a8a070', 8, 8); Gfx.rect(g, 2, 8, 12, 6, '#a89040'); Gfx.rect(g, 3, 9, 10, 4, '#c0a850'); Gfx.rect(g, 6, 7, 4, 2, '#802020'); });
    T.reg('ak_crack', { kind: 'stone', over: true }, (g, f, r) => { Gfx.line(g, 3, 1, 8, 7, '#3c3010'); Gfx.line(g, 8, 7, 6, 14, '#3c3010'); Gfx.line(g, 8, 7, 13, 10, '#3c3010'); Gfx.px(g, 9, 8, '#e8d078'); });   // the gap Reveal shows in the stones
    T.reg('ak_stone_red', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 5, '#802828'); Gfx.ellipse(g, 7, 8, 5, 4, '#b04040'); Gfx.px(g, 6, 7, '#e07070'); });
    T.reg('ak_stone_brown', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 5, '#5c4020'); Gfx.ellipse(g, 7, 8, 5, 4, '#8c6030'); Gfx.px(g, 6, 7, '#c09060'); });
    T.reg('ak_vine', { kind: 'ladder', ladder: true }, (g, f, r) => { T.bricks(g, r, '#c0a850', '#8c7430', 4, 8); Gfx.vline(g, 6, 0, 16, '#3c8038'); Gfx.vline(g, 9, 0, 16, '#48a040'); for (let y = 2; y < 16; y += 4) { Gfx.px(g, 5, y, '#78d060'); Gfx.px(g, 10, y + 2, '#78d060'); } });   // the vines down the old walls
    T.reg('ak_door', { kind: 'door', door: true }, (g, f, r) => { T.bricks(g, r, '#c0a850', '#8c7430', 4, 8); Gfx.rect(g, 3, 3, 10, 13, '#1c1810'); Gfx.rect(g, 3, 3, 10, 1, '#5c4c20'); Gfx.hline(g, 0, 0, 16, '#f0dc90'); });
    T.reg('ak_sand', { kind: 'sand', softsand: true, enc: true }, (g, f, r) => { T.noiseFill(g, r, '#ecd890', ['#e0cc80', '#f4e0a0'], 22); Gfx.hline(g, 2, 5, 5, '#d8c070'); Gfx.hline(g, 8, 10, 6, '#d8c070'); });   // the sand of the ruins, sunk into with Sand
    T.reg('gravestone', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#385830'); Gfx.rect(g, 4, 4, 8, 10, '#8890a0'); Gfx.ellipse(g, 8, 4, 4, 3, '#8890a0'); Gfx.rect(g, 4, 4, 2, 10, '#b0b8c8'); Gfx.hline(g, 6, 7, 4, '#606878'); Gfx.hline(g, 6, 9, 4, '#606878'); });   // Champa's graves
    T.reg('forge_rim', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#807060', '#504030', 4, 8); Gfx.hline(g, 0, 0, 16, '#a09080'); });
    T.reg('forge_fire', { kind: 'lava', solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#e05020'); for (let i = 0; i < 6; i++) { const x = (i * 5 + f * 3) % 16, y = (i * 7 + f * 5) % 16; Gfx.px(g, x, y, '#ffd060'); Gfx.px(g, (x + 8) % 16, (y + 3) % 16, '#ff8040'); } Gfx.ellipse(g, 8, 8, 5, 3, f % 2 ? '#ffc040' : '#ff9030'); });   // Obaba's forge, its heart
    // ---- END ANKOHL ----
    // ---- SEA OF TIME (hot-syncable block) ----
    T.reg('sea_rock', { kind: 'rock', solid: true, water: false }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); Gfx.ellipse(g, 8, 9, 7, 6, '#405060'); Gfx.ellipse(g, 7, 8, 5, 4, '#687888'); Gfx.px(g, 6, 6, '#98a8b8'); Gfx.hline(g, 2, 14, 12, '#a0d0f0'); });   // a rock in the sea
    T.reg('volcano_tl', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); Gfx.tri(g, 2, 16, 16, 16, 16, 2, '#6c4830'); Gfx.tri(g, 6, 16, 16, 16, 16, 6, '#8c6040'); });
    T.reg('volcano_tr', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); Gfx.tri(g, 0, 16, 14, 16, 0, 2, '#6c4830'); Gfx.tri(g, 0, 16, 10, 16, 0, 6, '#8c6040'); Gfx.ellipse(g, 1, 3, 3, 2, '#e04020'); });
    T.reg('volcano_bl', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); Gfx.rect(g, 2, 0, 14, 12, '#6c4830'); Gfx.rect(g, 6, 0, 10, 8, '#8c6040'); Gfx.ellipse(g, 9, 12, 7, 3, '#4c3020'); });
    T.reg('volcano_br', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); Gfx.rect(g, 0, 0, 14, 12, '#6c4830'); Gfx.rect(g, 0, 0, 10, 8, '#8c6040'); Gfx.ellipse(g, 7, 12, 7, 3, '#4c3020'); });
    T.reg('volcano_star', { kind: 'stone', over: true, frames: 2 }, (g, f, r) => { for (const [x, y] of [[3, 3], [12, 5], [7, 11], [13, 12], [2, 13]]) { Gfx.px(g, x, y, f ? '#ffffa0' : '#ffe060'); Gfx.px(g, x + 1, y, '#ffffff'); Gfx.px(g, x, y + 1, '#ffffff'); } });   // the stars that ring a trunk run round
    T.reg('whirlpool', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); for (let i = 0; i < 3; i++) { const rr = 7 - i * 2, a = f * 0.8 + i; for (let k = 0; k < 10; k++) { const t = a + k * 0.5; Gfx.px(g, Math.round(8 + rr * Math.cos(t)), Math.round(8 + rr * Math.sin(t)), '#a0d0f0'); } } Gfx.px(g, 8, 8, '#103060'); });   // a swirl: sailed through, and counted
    T.reg('sea_current', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f * 2) % 16; Gfx.hline(g, 0, y, 16, '#78b8f0'); Gfx.px(g, (i * 5 + f * 3) % 16, y + 1, '#ffffff'); } });   // a current that takes the ship
    T.reg('sea_wave', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a8'); for (let x = 0; x < 16; x += 4) { const h = 3 + ((x / 4 + f) % 3); Gfx.rect(g, x, 12 - h, 3, h, '#c0e8ff'); Gfx.rect(g, x, 12 - h, 3, 1, '#ffffff'); } Gfx.hline(g, 0, 13, 16, '#a0d0f0'); });   // the waves that must be waited out
    // ---- END SEA OF TIME ----
    // ---- WEYARD SEA WALLS (hot-syncable block) ----
    // the rock spires, reefs and ice that wall Weyard's seas (js/maps/world_tla_seawalls.js), and the mouths of the strait through the Gondowan Cliffs
    T.reg('w_spire', { kind: 'rock', solid: true, world: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858c8'); Gfx.hline(g, (f * 3) % 12, 1, 4, '#4880e0'); Gfx.tri(g, 0, 15, 4, 3, 8, 15, '#586070'); Gfx.tri(g, 7, 15, 11, 5, 16, 15, '#707888'); Gfx.tri(g, 2, 15, 4, 6, 6, 15, '#8890a0'); Gfx.tri(g, 9, 15, 11, 8, 13, 15, '#98a0b0'); Gfx.hline(g, 0, 15, 16, '#a8d8f8'); Gfx.px(g, (f * 5) % 14 + 1, 14, '#ffffff'); });
    T.reg('w_reef', { kind: 'rock', solid: true, world: true, reef: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3878d8'); Gfx.hline(g, (f * 3) % 12, 2, 4, '#58a0f0'); Gfx.tri(g, 1, 13, 4, 8, 7, 13, '#707888'); Gfx.tri(g, 8, 14, 11, 9, 14, 14, '#8890a0'); Gfx.hline(g, 0, 13, 8, '#a8d8f8'); Gfx.hline(g, 7, 14, 9, '#a8d8f8'); Gfx.px(g, (f * 5) % 14 + 1, 15, '#ffffff'); });
    T.reg('w_icewall', { kind: 'ice', solid: true, world: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858c8'); Gfx.rect(g, 0, 3, 16, 13, '#c8e8ff'); Gfx.rect(g, 0, 3, 16, 2, '#ffffff'); Gfx.rect(g, 0, 8, 16, 1, '#a0c8f0'); Gfx.vline(g, 5, 5, 11, '#a0c8f0'); Gfx.vline(g, 11, 4, 12, '#a0c8f0'); Gfx.px(g, (f * 4) % 16, 1, '#78b8f8'); });
    T.reg('w_strait', { kind: 'water', water: true, solid: true, world: true, place: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3878d8'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 7 + f * 2) % 16, y, 3, '#58a0f0'); } Gfx.tri(g, 0, 0, 0, 16, 4, 8, '#8a7a68'); Gfx.tri(g, 16, 0, 16, 16, 12, 8, '#8a7a68'); Gfx.vline(g, 0, 0, 16, '#6a5a48'); Gfx.vline(g, 15, 0, 16, '#6a5a48'); });
    T.reg('sea_glint', { kind: 'glint', frames: 4 }, (g, f, r) => { const pts = [[4, 5], [11, 9], [7, 12]]; for (let i = 0; i < 3; i++) { const [x, y] = pts[i]; if ((f + i) % 4 === 0) continue; const c = (f + i) % 2 ? '#ffffff' : '#c0e8ff'; Gfx.px(g, x, y, c); Gfx.px(g, x - 1, y, c); Gfx.px(g, x + 1, y, c); Gfx.px(g, x, y - 1, c); Gfx.px(g, x, y + 1, c); } });   // something under the water, catching the light
    T.reg('ropeh_open', { kind: 'rope' }, (g, f, r) => { Gfx.hline(g, 0, 7, 16, '#c8a060'); Gfx.hline(g, 0, 8, 16, '#a88040'); });   // a tightrope strung over water, the river showing under it
    // the Western Sea's small places (js/maps/western_sea.js): the rapids and the falls at the edge of the world, a crate afloat or sunk, a sandstone wall's low step and the gaps in a parapet
    T.reg('sw_rapids', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#58b8e8'); for (let i = 0; i < 5; i++) { const y = (i * 4 + f * 3) % 16; Gfx.hline(g, (i * 3) % 8, y, 6, '#c0f0ff'); Gfx.px(g, (i * 5 + f) % 16, (y + 2) % 16, '#ffffff'); } });
    T.reg('sw_falls', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a0e0f8'); for (let x = 0; x < 16; x += 2) { const h = 6 + ((x / 2 + f) % 4) * 2; Gfx.vline(g, x, (f * 4 + x) % 16, h, '#e8f8ff'); } Gfx.hline(g, 0, (f * 5) % 16, 16, '#ffffff'); });
    T.reg('crate_float', { kind: 'bridge', frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#58b8e8'); Gfx.hline(g, (f * 3) % 8, 2, 6, '#c0f0ff'); Gfx.rect(g, 1, 4, 14, 11, '#a87848'); Gfx.rect(g, 1, 4, 14, 2, '#c89868'); Gfx.rect(g, 1, 13, 14, 2, '#604020'); Gfx.vline(g, 1, 4, 11, '#604020'); Gfx.vline(g, 14, 4, 11, '#604020'); Gfx.px(g, 7, 9, '#604020'); Gfx.px(g, 8, 9, '#604020'); });
    T.reg('crate_sunk', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#101018'); Gfx.rect(g, 1, 1, 14, 14, '#a87848'); Gfx.rect(g, 1, 1, 14, 2, '#c89868'); Gfx.rect(g, 1, 13, 14, 2, '#604020'); Gfx.vline(g, 1, 1, 14, '#604020'); Gfx.vline(g, 14, 1, 14, '#604020'); Gfx.px(g, 7, 7, '#604020'); Gfx.px(g, 8, 8, '#604020'); });
    T.reg('sand_step', { kind: 'bridge' }, (g, f, r) => { T.bricks(g, r, '#e0b848', '#b89030', 4, 8); Gfx.rect(g, 0, 10, 16, 6, '#d8b060'); Gfx.hline(g, 0, 10, 16, '#f0d080'); });
    T.reg('sand_gap', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#e0c480', ['#d4b870', '#e8cc8c'], 16); Gfx.rect(g, 2, 2, 12, 12, '#101018'); Gfx.rect(g, 2, 2, 12, 2, '#3a3048'); });
    T.reg('rope_end', { kind: 'rope' }, (g, f, r) => { Gfx.vline(g, 7, 0, 10, '#c8a060'); Gfx.vline(g, 8, 0, 10, '#a88040'); Gfx.ellipse(g, 8, 11, 3, 2, '#c8a060'); Gfx.ellipse(g, 8, 13, 3, 2, '#a88040'); });   // the coiled end of a rope hanging down a cliff, before Lash
    T.reg('snow_gap', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#f0f4ff', ['#d8e0f0', '#ffffff'], 16); Gfx.rect(g, 2, 2, 12, 12, '#283040'); Gfx.rect(g, 2, 2, 12, 2, '#606880'); });   // a drop off a snowy ledge
    // the Wings of Anemos on the sand at the Atteka Inlet, two tiles wide and two tall
    const wingTop = (g, flip) => { const X = (x) => flip ? 15 - x : x; Gfx.tri(g, X(0), 15, X(15), 0, X(15), 15, '#f4f4fc'); Gfx.tri(g, X(4), 15, X(15), 4, X(15), 8, '#d8dce8'); Gfx.tri(g, X(9), 15, X(15), 9, X(15), 12, '#c0c4d4'); Gfx.px(g, X(14), 1, '#ffffff'); };
    const wingBase = (g, flip) => { const X = (x) => flip ? 15 - x : x; Gfx.rect(g, 0, 0, 16, 9, '#f4f4fc'); Gfx.tri(g, X(0), 9, X(0), 0, X(8), 9, '#d8dce8'); Gfx.hline(g, 0, 3, 16, '#d8dce8'); Gfx.hline(g, 0, 6, 16, '#d8dce8'); Gfx.rect(g, X(6) - (flip ? 9 : 0), 9, 10, 7, '#c8a040'); Gfx.rect(g, X(7) - (flip ? 7 : 0), 10, 8, 5, '#e8c860'); };
    T.reg('anemos_wing_l', { kind: 'statue', solid: true }, (g, f, r) => wingTop(g, false)); T.reg('anemos_wing_r', { kind: 'statue', solid: true }, (g, f, r) => wingTop(g, true));
    T.reg('anemos_wing_bl', { kind: 'statue', solid: true }, (g, f, r) => wingBase(g, false)); T.reg('anemos_wing_br', { kind: 'statue', solid: true }, (g, f, r) => wingBase(g, true));
    T.reg('geoglyph', { kind: 'sand' }, (g, f, r) => { T.noiseFill(g, r, '#e8d890', ['#dcc880', '#f0e0a0'], 12); Gfx.line(g, 0, 9, 15, 5, '#a89058'); Gfx.line(g, 5, 0, 10, 15, '#a89058'); Gfx.line(g, 0, 3, 6, 3, '#a89058'); Gfx.px(g, 12, 12, '#a89058'); Gfx.px(g, 13, 11, '#a89058'); });   // the Anemos geoglyph: lines cut into the crater's floor
    // Trial Road: the blue chests that want the weight of weapons and armour, and the fountains between their gusts
    T.reg('chest_blue', { kind: 'chest', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 5, 12, 9, '#3858b0'); Gfx.rect(g, 2, 5, 12, 3, '#5878d0'); Gfx.rect(g, 2, 8, 12, 1, '#c8a040'); Gfx.rect(g, 7, 7, 2, 3, '#e8c860'); Gfx.hline(g, 2, 14, 12, '#203060'); });
    T.reg('fountain_dry', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#e0c480', ['#d4b870', '#e8cc8c'], 12); Gfx.ellipse(g, 8, 9, 7, 5, '#b8a888'); Gfx.ellipse(g, 8, 9, 5, 3, '#787068'); Gfx.ellipse(g, 8, 8, 3, 2, '#585048'); });
    // Jupiter Lighthouse: the drops hovered over (open, so the party falls if the wind gives out), the pits blocks and
    // columns sink into, the slides, the cracked floors, the buttons, the swirls Cyclone lifts the party through,
    // the beam, the lid over the beacon's well, the grey and energy-path blocks, the coloured doors, the faces
    const jlPit = (g, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1a0a24'); Gfx.hline(g, 0, 0, 16, '#8060b0'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#302040'); };
    T.reg('jl_hole', { kind: 'gap', hole: true }, (g, f, r) => jlPit(g, r));
    T.reg('jl_pit', { kind: 'pit', solid: true }, (g, f, r) => jlPit(g, r));
    T.reg('jl_slide', { kind: 'gap', hole: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#6858a0'); for (let y = -2 + f * 2; y < 16; y += 5) { Gfx.tri(g, 2, y, 8, y + 4, 14, y, '#a898d8'); Gfx.tri(g, 2, y + 1, 8, y + 5, 14, y + 1, '#8878c0'); } Gfx.vline(g, 0, 0, 16, '#403060'); Gfx.vline(g, 15, 0, 16, '#403060'); });
    T.reg('lh_crack', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); Gfx.line(g, 3, 2, 7, 7, '#7060a0'); Gfx.line(g, 7, 7, 5, 12, '#7060a0'); Gfx.line(g, 7, 7, 12, 9, '#7060a0'); Gfx.line(g, 12, 9, 13, 14, '#7060a0'); });
    T.reg('lh_crack_big', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#8878b0', '#605090', 8, 8); Gfx.line(g, 1, 3, 6, 8, '#201838'); Gfx.line(g, 6, 8, 3, 14, '#201838'); Gfx.line(g, 6, 8, 12, 6, '#201838'); Gfx.line(g, 12, 6, 15, 12, '#201838'); Gfx.line(g, 9, 7, 10, 14, '#201838'); Gfx.rect(g, 5, 7, 3, 2, '#100818'); });
    T.reg('jl_button', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); Gfx.rect(g, 3, 3, 10, 10, '#605080'); Gfx.rect(g, 4, 4, 8, 8, '#9080c0'); Gfx.rect(g, 5, 5, 6, 6, '#b0a0e0'); });
    T.reg('jl_tp', { kind: 'psystone', solid: true, frames: 2 }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); Gfx.circle(g, 8, 8, 7, '#7050b0'); Gfx.circle(g, 8, 8, 5, '#9070d0'); Gfx.ellipse(g, 8 + f, 7, 3, 2, '#c8b0f0'); Gfx.ellipse(g, 7 - f, 10, 2, 1, '#e8d8ff'); Gfx.px(g, 8, 8, '#ffffff'); });
    T.reg('jl_beam_off', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); Gfx.circle(g, 8, 8, 6, '#504070'); Gfx.circle(g, 8, 8, 4, '#302050'); });
    T.reg('jl_beam', { kind: 'stone', frames: 3, light: true }, (g, f, r) => { T.bricks(g, r, '#d8c8e8', '#b0a0c8', 8, 8); Gfx.circle(g, 8, 8, 6, '#9070d0'); Gfx.rect(g, 5, 0, 6, 16, '#c0a0ff'); Gfx.rect(g, 6 + (f % 2), 0, 3, 16, '#ffffff'); Gfx.circle(g, 8, 8, 2 + f, '#f0e0ff'); });
    T.reg('jl_lid', { kind: 'stone', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#8a8a98', ['#7a7a88', '#9a9aa8'], 10); Gfx.hline(g, 0, 0, 16, '#b0b0c0'); Gfx.vline(g, 0, 0, 16, '#b0b0c0'); Gfx.hline(g, 0, 15, 16, '#505060'); Gfx.vline(g, 15, 0, 16, '#505060'); });
    T.reg('block_grey', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 14, '#8a8a98'); Gfx.rect(g, 1, 1, 14, 4, '#b0b0c0'); Gfx.rect(g, 1, 11, 14, 4, '#585868'); Gfx.rect(g, 1, 1, 2, 14, '#a0a0b0'); Gfx.rect(g, 13, 1, 2, 14, '#686878'); });
    T.reg('block_grey_set', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1a0a24'); Gfx.rect(g, 1, 1, 14, 14, '#7a7a88'); Gfx.rect(g, 1, 1, 14, 3, '#9a9aa8'); Gfx.rect(g, 1, 12, 14, 3, '#585868'); });
    T.reg('block_grey_hover', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1a0a24'); Gfx.rect(g, 2, 3, 12, 11, '#8a8a98'); Gfx.rect(g, 2, 3, 12, 3, '#b0b0c0'); Gfx.rect(g, 2, 11, 12, 3, '#585868'); Gfx.hline(g, 3, 15, 10, '#4a3a70'); });
    T.reg('block_energy', { kind: 'pillar', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 14, '#8a8a98'); Gfx.rect(g, 1, 1, 14, 4, '#b0b0c0'); Gfx.rect(g, 1, 11, 14, 4, '#585868'); Gfx.rect(g, 6, 1, 4, 14, f ? '#c0a0ff' : '#9070d0'); Gfx.rect(g, 1, 6, 14, 4, f ? '#c0a0ff' : '#9070d0'); });
    T.reg('block_energy_set', { kind: 'stone', frames: 2, light: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1a0a24'); Gfx.rect(g, 1, 1, 14, 14, '#7a7a88'); Gfx.rect(g, 6, 1, 4, 14, f ? '#e0d0ff' : '#c0a0ff'); Gfx.rect(g, 1, 6, 14, 4, f ? '#e0d0ff' : '#c0a0ff'); });
    T.reg('door_red', { kind: 'door', solid: true, locked: true }, (g, f, r) => { T.bricks(g, r, '#9878c0', '#705098', 4, 8); Gfx.rect(g, 2, 1, 12, 15, '#802020'); Gfx.rect(g, 3, 2, 10, 13, '#c03030'); Gfx.vline(g, 8, 2, 13, '#601818'); Gfx.circle(g, 8, 7, 3, '#e8c060'); Gfx.circle(g, 8, 7, 1, '#802020'); });
    T.reg('door_blue', { kind: 'door', solid: true, locked: true }, (g, f, r) => { T.bricks(g, r, '#9878c0', '#705098', 4, 8); Gfx.rect(g, 2, 1, 12, 15, '#203080'); Gfx.rect(g, 3, 2, 10, 13, '#3050c0'); Gfx.vline(g, 8, 2, 13, '#182060'); Gfx.circle(g, 8, 7, 3, '#e8c060'); Gfx.circle(g, 8, 7, 1, '#203080'); });
    T.reg('jl_face', { kind: 'wall', solid: true, frames: 2 }, (g, f, r) => { T.bricks(g, r, '#9878c0', '#705098', 4, 8); Gfx.ellipse(g, 8, 8, 7, 7, '#b8a0d8'); Gfx.ellipse(g, 8, 8, 6, 6, '#d0b8f0'); Gfx.ellipse(g, 5, 6, 2, 1 + f, '#302048'); Gfx.ellipse(g, 11, 6, 2, 1 + f, '#302048'); Gfx.ellipse(g, 8, 11, 3, 1 + f, '#302048'); });
    T.reg('jl_archer', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#6a6070', ['#5a5060'], 10); Gfx.rect(g, 3, 12, 10, 3, '#504858'); Gfx.rect(g, 6, 4, 4, 8, '#b8b0c8'); Gfx.circle(g, 8, 3, 2, '#c8c0d8'); Gfx.line(g, 2, 3, 2, 13, '#8a7050'); Gfx.line(g, 2, 3, 6, 8, '#d8d0e0'); Gfx.line(g, 2, 13, 6, 8, '#d8d0e0'); });
    // Magma Rock: the red faces of the exterior (the Gaia Rock drawings in a red palette), its ledges, climbs, drops
    // and slides, the cracked columns Burst crumbles, the statues' volleyed rocks; inside, the grey floors and the
    // red-brown walls, the basins lava fills (rafts float up, the low floor drowns), the gates, buttons, blue gems,
    // chains, the flame wall, the Magma Ball's rock and the tablet
    T.reg('mr_top', { kind: 'clifftop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c85838', ['#b84c30', '#d06040', '#c05434'], 16); for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#e07850'); Gfx.px(g, x + 1, y + 1, '#8c3018'); } });
    T.reg('mr_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a83c24', ['#983420', '#b04428'], 14); Gfx.hline(g, 0, 0, 16, '#e07850'); Gfx.hline(g, 0, 15, 16, '#5c1c0c'); for (let i = 0; i < 4; i++) { const x = 1 + i * 4 + Math.floor(r() * 2), y = 2 + Math.floor(r() * 9); Gfx.ellipse(g, x, y, 2, 1, '#c85030'); Gfx.px(g, x, y + 1, '#701c0c'); } });
    T.reg('mr_mid', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#983420', ['#8c3020', '#a03c24', '#943420'], 16); for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13); Gfx.ellipse(g, x, y, 2, 1, '#b84c30'); Gfx.px(g, x, y + 1, '#601c0c'); } });
    cliffSet('magmarock', 'mr_top', 'mr_face', 'mr_mid', '#f0a070', '#c85838', '#5c1c0c', '#401008');
    T.reg('mr_ledge', { kind: 'sand', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#d8a878', ['#d0a070', '#e0b080', '#d4a474'], 14); T.speckle(g, r, ['#b88858', '#e8c090'], 4); });
    T.reg('mr_climb', { kind: 'ladder', ladder: true }, (g, f, r) => { T.noiseFill(g, r, '#983420', ['#8c3020', '#a03c24'], 12); for (let y = 1; y < 16; y += 4) { Gfx.hline(g, 3, y, 4, '#e0a070'); Gfx.hline(g, 9, y + 2, 4, '#e0a070'); Gfx.hline(g, 3, y + 1, 4, '#601c0c'); Gfx.hline(g, 9, y + 3, 4, '#601c0c'); } });
    T.reg('mr_drop', { kind: 'stairs', hole: true }, (g, f, r) => { T.noiseFill(g, r, '#c85838', ['#b84c30', '#d06040'], 16); Gfx.tri(g, 0, 16, 16, 16, 8, 3, '#d8a878'); Gfx.tri(g, 3, 16, 13, 16, 8, 7, '#b88858'); Gfx.hline(g, 0, 15, 16, '#8c3018'); });
    T.reg('mr_door', { kind: 'door', door: true }, (g, f, r) => { T.noiseFill(g, r, '#a83c24', ['#983420', '#b04428'], 14); Gfx.rect(g, 3, 5, 10, 11, '#0c0804'); Gfx.ellipse(g, 8, 5, 5, 4, '#0c0804'); Gfx.hline(g, 0, 0, 16, '#e07850'); });
    T.reg('mr_column', { kind: 'pillar', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#983420', ['#8c3020'], 10); Gfx.rect(g, 4, 0, 8, 16, '#c8a080'); Gfx.rect(g, 4, 0, 2, 16, '#e0c0a0'); Gfx.rect(g, 10, 0, 2, 16, '#a08060'); Gfx.line(g, 6, 2, 9, 7, '#503020'); Gfx.line(g, 9, 7, 7, 13, '#503020'); });
    T.reg('mr_statue', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#983420', ['#8c3020'], 10); Gfx.rect(g, 4, 2, 8, 13, '#8c7060'); Gfx.rect(g, 5, 3, 6, 5, '#a89080'); Gfx.px(g, 6, 5, '#302020'); Gfx.px(g, 9, 5, '#302020'); Gfx.rect(g, 6, 9, 4, 2, '#605040'); Gfx.rect(g, 3, 14, 10, 2, '#605040'); });
    T.reg('mr_rock', { kind: 'stone', frames: 2 }, (g, f, r) => { Gfx.circle(g, 8, 8, 5 + f, '#f06020'); Gfx.circle(g, 8, 8, 3, '#ffb040'); Gfx.circle(g, 7, 7, 1, '#fff0a0'); Gfx.px(g, 3 + f * 2, 4, '#ff8030'); Gfx.px(g, 12 - f, 12, '#ff8030'); });
    T.reg('mr_wtop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c2418', ['#501c10', '#682c1c'], 8); });
    T.reg('mr_wface', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a04828', '#803418', 8, 4); Gfx.hline(g, 0, 15, 16, '#401008'); Gfx.hline(g, 0, 0, 16, '#c86040'); });
    T.reg('mr_floor', { kind: 'stone', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890', '#a898a0', '#9c8c94'], 14); for (let i = 0; i < 2; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); Gfx.px(g, x, y, '#b8a8b0'); Gfx.px(g, x + 1, y + 1, '#786870'); } });
    T.reg('mr_low', { kind: 'stone', enc: true }, (g, f, r) => { T.noiseFill(g, r, '#807078', ['#786870', '#887880'], 14); Gfx.hline(g, 0, 0, 16, '#605058'); for (let i = 0; i < 2; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#a04030'); });
    T.reg('mr_pit', { kind: 'pit', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#1c1014'); Gfx.hline(g, 0, 0, 16, '#605058'); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), 2 + Math.floor(r() * 12), '#302028'); });
    T.reg('mr_raft', { kind: 'bridge', frames: 2 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#f07020'); Gfx.rect(g, 1, 1 + f, 14, 13, '#605058'); Gfx.rect(g, 1, 1 + f, 14, 2, '#807078'); Gfx.rect(g, 1, 12 + f, 14, 2, '#403038'); Gfx.px(g, 3, 6 + f, '#a09098'); Gfx.px(g, 11, 8 + f, '#a09098'); });
    T.reg('mr_gate', { kind: 'wall', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c2418', ['#501c10'], 8); for (let x = 2; x < 16; x += 4) Gfx.vline(g, x, 0, 16, '#c0b0a0'); Gfx.hline(g, 0, 4, 16, '#c0b0a0'); Gfx.hline(g, 0, 11, 16, '#c0b0a0'); });
    T.reg('mr_gate_open', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890'], 14); Gfx.hline(g, 0, 0, 16, '#c0b0a0'); Gfx.hline(g, 0, 1, 16, '#5c2418'); });
    T.reg('mr_button', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890'], 14); Gfx.rect(g, 3, 3, 10, 10, '#605058'); Gfx.rect(g, 4, 4, 8, 8, '#c05030'); Gfx.rect(g, 5, 5, 6, 6, '#e07050'); });
    T.reg('mr_gem', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a04828', '#803418', 8, 4); Gfx.hline(g, 0, 15, 16, '#401008'); Gfx.tri(g, 8, 3, 13, 8, 8, 13, '#4080f0'); Gfx.tri(g, 8, 3, 3, 8, 8, 13, '#2050c0'); Gfx.px(g, 7, 6, '#c0e0ff'); });
    T.reg('mr_chain', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a04828', '#803418', 8, 4); for (let y = 0; y < 16; y += 4) { Gfx.rect(g, 5, y, 2, 3, '#c0c0c8'); Gfx.rect(g, 9, y + 2, 2, 3, '#c0c0c8'); } });
    T.reg('mr_chainclimb', { kind: 'ladder', ladder: true }, (g, f, r) => { T.bricks(g, r, '#a04828', '#803418', 8, 4); for (let y = 0; y < 16; y += 4) { Gfx.rect(g, 4, y, 3, 3, '#e0e0e8'); Gfx.rect(g, 9, y + 2, 3, 3, '#e0e0e8'); } });
    T.reg('mr_flame', { kind: 'wall', solid: true, frames: 3, light: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a09098'); Gfx.ellipse(g, 8, 10, 7, 6, '#f06020'); Gfx.ellipse(g, 8 + (f % 2), 8 - f, 4, 6, '#ffb040'); Gfx.ellipse(g, 8 - (f % 2), 6 - f, 2, 4, '#fff0a0'); });
    T.reg('mr_ballrock', { kind: 'statue', solid: true, frames: 2, light: true }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890'], 14); Gfx.ellipse(g, 8, 11, 7, 4, '#602018'); Gfx.circle(g, 8, 7, 5, '#f04010'); Gfx.circle(g, 8, 7, 3 + f, '#ff9030'); Gfx.circle(g, 7, 6, 1, '#fff0a0'); });
    T.reg('mr_ballrock_empty', { kind: 'statue', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890'], 14); Gfx.ellipse(g, 8, 11, 7, 4, '#602018'); Gfx.ellipse(g, 8, 9, 5, 2, '#401410'); });
    T.reg('mr_tablet', { kind: 'psystone', solid: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#a09098', ['#988890'], 14); Gfx.rect(g, 4, 2, 8, 13, '#606070'); Gfx.rect(g, 5, 3, 6, 11, '#8080a0'); Gfx.circle(g, 8, 7, 2 + f, '#f06020'); });
    // ---- END WEYARD SEA WALLS ----
    // ---- WORLD GATES (hot-syncable block): the ground the world map is gated with, and the desert slide ----
    T.reg('w_forest_dense', { kind: 'forest', solid: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#245c28', ['#1c4c20', '#2c6c30'], 12); for (let i = 0; i < 6; i++) { const x = (i % 3) * 5 + 1, y = Math.floor(i / 3) * 8 + 1; Gfx.ellipse(g, x + 2, y + 3, 3, 3, '#2c7434'); Gfx.ellipse(g, x + 2, y + 5, 3, 2, '#1c4c20'); Gfx.px(g, x + 1, y + 2, '#48a048'); } });   // a forest's heart: too dense to walk, crossed only through the forest itself
    T.reg('w_dunes', { kind: 'sand', solid: true, world: true }, (g, f, r) => { T.noiseFill(g, r, '#e0c880', ['#d0b468', '#ecd890'], 16); Gfx.ellipse(g, 5, 6, 5, 2, '#c8ac60'); Gfx.ellipse(g, 11, 11, 5, 2, '#c8ac60'); Gfx.hline(g, 1, 4, 8, '#f4e4a0'); Gfx.hline(g, 7, 9, 8, '#f4e4a0'); });   // the dunes of a desert's heart: crossed only through the desert itself
    T.reg('yd_slide', { kind: 'stairs', hole: true, softsand: true }, (g, f, r) => { T.noiseFill(g, r, '#e8cc88', ['#dcc078', '#f0d898'], 16); for (let i = 0; i < 4; i++) { Gfx.line(g, 1 + i * 4, 14, 5 + i * 4, 2, '#f8e8b0'); Gfx.line(g, 2 + i * 4, 14, 6 + i * 4, 2, '#c8a860'); } Gfx.rect(g, 0, 14, 16, 2, '#b89850'); });   // the desert's wind-cut slide: stepped onto, the sand carries the party down and there is no climbing it
    // ---- LOHO (hot-syncable block): the blue-stone ruins the diggers of Loho live in, and their cannon ----
    T.reg('lo_top', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c4d0e0', ['#b8c4d8', '#ccd8e8', '#bcc8dc'], 14); Gfx.hline(g, 0, 15, 16, '#a0b0c8'); });
    T.reg('lo_face', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#7c94b8', '#5c7498', 8, 6); Gfx.hline(g, 0, 0, 16, '#a8b8d0'); Gfx.hline(g, 0, 15, 16, '#3c4c68'); });
    T.reg('lo_mid', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#6c84a8', '#4c6488', 8, 6); Gfx.hline(g, 0, 15, 16, '#3c4c68'); });
    cliffSet('lohostone', 'lo_top', 'lo_face', 'lo_mid', '#d4e0ec', '#a8b8cc', '#506890', '#344c6c');
    T.reg('lo_floor', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#c0ccdc', '#a4b4c8', 8, 8); T.speckle(g, r, ['#d8c8a0', '#ccd8e4'], 5); });   // the pale flags of the ruins, sand blown over them
    T.reg('lo_block', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 7, 5, '#5c7498'); Gfx.rect(g, 2, 3, 12, 9, '#9cb0cc'); Gfx.rect(g, 3, 4, 10, 3, '#b8c8dc'); Gfx.rect(g, 2, 10, 12, 2, '#6c84a8'); Gfx.px(g, 4, 5, '#d0dcea'); });   // a loose block of the old wall
    T.reg('lo_rubble', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#c8b088', ['#b89c70', '#d0b890', '#a89068'], 16); Gfx.ellipse(g, 4, 5, 3, 2, '#8c7050'); Gfx.ellipse(g, 11, 10, 3, 2, '#8c7050'); Gfx.ellipse(g, 7, 12, 2, 1, '#7c6040'); });   // the wall after the cannon
    T.reg('lo_urn', { kind: 'pot', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 5, 5, '#5c7498'); Gfx.ellipse(g, 8, 8, 4, 3, '#7c94b8'); Gfx.rect(g, 5, 2, 6, 3, '#4c6488'); Gfx.hline(g, 5, 2, 6, '#9cb0cc'); Gfx.px(g, 6, 7, '#a8b8d0'); });
    T.reg('lo_hole', { kind: 'hole', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#c8b088', ['#b89c70'], 12); Gfx.ellipse(g, 8, 8, 8, 7, '#3c3028'); Gfx.ellipse(g, 8, 7, 6, 5, '#1c1410'); Gfx.hline(g, 2, 1, 12, '#a89068'); });   // the diggers' pit, a well-deep hole
    T.reg('lo_cannon', { kind: 'cannon', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 9, 12, 4, '#5a4a38'); Gfx.ellipse(g, 4, 13, 3, 2, '#3c2c1c'); Gfx.ellipse(g, 12, 13, 3, 2, '#3c2c1c'); Gfx.rect(g, 6, 1, 4, 10, '#48505c'); Gfx.rect(g, 5, 1, 6, 2, '#606870'); Gfx.rect(g, 7, 2, 2, 8, '#2c3038'); Gfx.px(g, 6, 3, '#8c949c'); });   // the ancient cannon, aimed north
    T.reg('lo_cannon_gone', { kind: 'stone' }, (g, f, r) => { T.noiseFill(g, r, '#e0c880', ['#d4b870', '#ecd890'], 16); Gfx.ellipse(g, 4, 13, 3, 2, '#c0a860'); Gfx.ellipse(g, 12, 13, 3, 2, '#c0a860'); });   // the marks its wheels left
    // ---- PROX (hot-syncable block): the frozen river and pool, the snow piles, the icebound boats, the igloo ----
    T.reg('snow_river', { kind: 'snow' }, (g, f, r) => { T.noiseFill(g, r, '#dce8f8', ['#d0e0f4', '#e8f0fc', '#c8d8f0'], 14); if (r() < 0.3) Gfx.hline(g, Math.floor(r() * 8), Math.floor(r() * 16), 6, '#b8cce8'); });   // the riverbed under its snow: walked
    T.reg('pool_ice', { kind: 'ice', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b8d4f0', ['#a8c8ec', '#c4dcf4', '#b0cef0'], 14); Gfx.px(g, 3, 4, '#e8f4ff'); Gfx.px(g, 11, 10, '#e8f4ff'); Gfx.hline(g, 5, 8, 5, '#9cbce4'); });   // the frozen pool under the falls
    T.reg('snow_pile', { kind: 'pot', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 11, 6, 3, '#c0d0e4'); Gfx.ellipse(g, 8, 9, 5, 4, '#f0f6ff'); Gfx.ellipse(g, 7, 8, 3, 2, '#ffffff'); Gfx.px(g, 10, 10, '#d8e4f4'); });
    T.reg('boat_ice_top', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 12, 6, 5, '#8c6c48'); Gfx.rect(g, 3, 8, 10, 8, '#8c6c48'); Gfx.rect(g, 4, 9, 8, 6, '#c8b088'); Gfx.rect(g, 7, 2, 2, 8, '#5a4a38'); Gfx.hline(g, 4, 6, 8, '#5a4a38'); });
    T.reg('boat_ice_hull', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 0, 10, 8, '#8c6c48'); Gfx.rect(g, 4, 0, 8, 6, '#c8b088'); Gfx.ellipse(g, 8, 6, 6, 5, '#8c6c48'); Gfx.ellipse(g, 8, 5, 4, 3, '#c8b088'); Gfx.hline(g, 4, 11, 8, '#e8f0fc'); });
    T.reg('igloo_ul', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.ellipse(g, 16, 16, 15, 14, '#dce4f0'); Gfx.ellipse(g, 16, 16, 13, 12, '#f0f4fc'); Gfx.hline(g, 6, 10, 10, '#b8c4d8'); Gfx.hline(g, 4, 13, 12, '#b8c4d8'); });
    T.reg('igloo_um', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 2, 16, 14, '#dce4f0'); Gfx.rect(g, 0, 4, 16, 12, '#f0f4fc'); Gfx.hline(g, 0, 7, 16, '#b8c4d8'); Gfx.hline(g, 0, 11, 16, '#b8c4d8'); Gfx.vline(g, 5, 7, 4, '#b8c4d8'); Gfx.vline(g, 11, 11, 5, '#b8c4d8'); });
    T.reg('igloo_ur', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.ellipse(g, 0, 16, 15, 14, '#dce4f0'); Gfx.ellipse(g, 0, 16, 13, 12, '#f0f4fc'); Gfx.hline(g, 0, 10, 10, '#b8c4d8'); Gfx.hline(g, 0, 13, 12, '#b8c4d8'); });
    T.reg('igloo_l', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 0, 14, 16, '#f0f4fc'); Gfx.rect(g, 0, 0, 3, 16, '#dce4f0'); Gfx.hline(g, 2, 4, 14, '#b8c4d8'); Gfx.hline(g, 2, 9, 14, '#b8c4d8'); Gfx.hline(g, 2, 14, 14, '#b8c4d8'); Gfx.vline(g, 8, 4, 5, '#b8c4d8'); Gfx.vline(g, 12, 9, 5, '#b8c4d8'); });
    T.reg('igloo_r', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 14, 16, '#f0f4fc'); Gfx.rect(g, 13, 0, 3, 16, '#dce4f0'); Gfx.hline(g, 0, 4, 14, '#b8c4d8'); Gfx.hline(g, 0, 9, 14, '#b8c4d8'); Gfx.hline(g, 0, 14, 14, '#b8c4d8'); Gfx.vline(g, 4, 4, 5, '#b8c4d8'); Gfx.vline(g, 9, 9, 5, '#b8c4d8'); });
    T.reg('igloo_door', { kind: 'door' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#f0f4fc'); Gfx.hline(g, 0, 4, 16, '#b8c4d8'); Gfx.rect(g, 4, 3, 8, 13, '#dce4f0'); Gfx.ellipse(g, 8, 9, 4, 5, '#1c2430'); Gfx.rect(g, 4, 9, 8, 7, '#1c2430'); });
    // ---- END PROX ----
    // ---- END LOHO ----
    // ---- END WORLD GATES ----
    // ---- MARS LIGHTHOUSE (hot-syncable block): the frozen tower's violet stone and teal ice, black ice, the cones, the sheets,
    // the dragon heads and their fire, the teleport circles, the spirits on the walls and the claw torches ----
    T.reg('ml_floor', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#9cc4cc', '#6c98a4', 8, 8); if (r() < 0.5) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#d8f0f4'); });
    T.reg('ml_wall', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#8868b8', '#5c4088', 4, 8); Gfx.hline(g, 0, 15, 16, '#3c2860'); Gfx.hline(g, 0, 0, 16, '#b090e0'); });
    T.reg('ml_walltop', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#3c2c5c', ['#342450', '#443468'], 8); });
    T.reg('ml_floor_warm', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8b0a0', '#a88070', 8, 8); });
    T.reg('ml_wall_warm', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#a86858', '#784038', 4, 8); Gfx.hline(g, 0, 15, 16, '#4c2418'); Gfx.hline(g, 0, 0, 16, '#d09080'); });
    T.reg('ml_walltop_warm', { kind: 'walltop', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#4c2820', ['#40201a', '#583028'], 8); });
    T.reg('ml_blackice', { kind: 'ice', slippery: true }, (g, f, r) => { T.noiseFill(g, r, '#243c68', ['#1c3058', '#2c4878'], 10); Gfx.line(g, 2, 12, 9, 5, '#4c6ca0'); Gfx.line(g, 10, 13, 14, 9, '#4c6ca0'); Gfx.px(g, 4, 3, '#8cb0e0'); Gfx.px(g, 12, 6, '#8cb0e0'); });
    T.reg('ml_ice', { kind: 'ice', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#b0dcf4', ['#a0d0f0', '#c8e8f8'], 12); Gfx.line(g, 2, 3, 9, 8, '#e8f8ff'); Gfx.line(g, 9, 12, 14, 4, '#e8f8ff'); });   // ice fill: a wall until it melts
    T.reg('ml_sheet', { kind: 'ice', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a8d4f0'); Gfx.hline(g, 0, 0, 16, '#e0f4ff'); Gfx.vline(g, 0, 0, 16, '#e0f4ff'); Gfx.line(g, 3, 13, 12, 3, '#cce8f8'); });
    T.reg('ml_sheet_cracked', { kind: 'ice', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#a8d4f0'); Gfx.hline(g, 0, 0, 16, '#e0f4ff'); Gfx.line(g, 1, 14, 7, 8, '#204060'); Gfx.line(g, 7, 8, 6, 3, '#204060'); Gfx.line(g, 7, 8, 14, 5, '#204060'); Gfx.line(g, 8, 8, 12, 14, '#204060'); });
    T.reg('ml_cone', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 14, 6, 2, '#6c98b0'); Gfx.tri(g, 2, 14, 8, 1, 14, 14, '#c0e4f8'); Gfx.tri(g, 4, 14, 8, 3, 9, 14, '#e8f8ff'); Gfx.line(g, 10, 6, 12, 13, '#88b8d4'); });
    T.reg('ml_shards', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#9cc4cc', '#6c98a4', 8, 8); for (let k = 0; k < 5; k++) Gfx.px(g, 2 + Math.floor(r() * 12), 4 + Math.floor(r() * 10), '#e8f8ff'); });
    T.reg('fireball', { kind: 'fx', frames: 2 }, (g, f, r) => { Gfx.circle(g, 8, 8, 6, '#ff6820'); Gfx.circle(g, 8, 8, 4, '#ffb030'); Gfx.circle(g, 7, 7, 2, '#fff0a0'); if (f) { Gfx.px(g, 2, 3, '#ff8030'); Gfx.px(g, 13, 12, '#ff8030'); } else { Gfx.px(g, 13, 3, '#ff8030'); Gfx.px(g, 2, 12, '#ff8030'); } });
    const dragonHead = (g, lit) => { Gfx.rect(g, 1, 4, 14, 11, '#7c6098'); Gfx.rect(g, 3, 2, 10, 4, '#8c70a8'); Gfx.tri(g, 3, 2, 5, 0, 6, 3, '#5c4078'); Gfx.tri(g, 10, 3, 11, 0, 13, 2, '#5c4078'); Gfx.rect(g, 4, 6, 3, 2, lit ? '#ffd040' : '#302048'); Gfx.rect(g, 9, 6, 3, 2, lit ? '#ffd040' : '#302048'); Gfx.rect(g, 4, 10, 8, 4, lit ? '#ff7020' : '#201830'); if (lit) { Gfx.rect(g, 6, 11, 4, 2, '#ffe080'); } else { Gfx.hline(g, 5, 11, 6, '#403058'); } };
    T.reg('ml_head', { kind: 'statue', solid: true }, (g, f, r) => dragonHead(g, false));
    T.reg('ml_head_lit', { kind: 'statue', solid: true, frames: 2, light: true }, (g, f, r) => { dragonHead(g, true); if (f) Gfx.rect(g, 7, 12, 2, 2, '#ffffff'); });
    T.reg('ml_circle', { kind: 'psystone', frames: 2 }, (g, f, r) => { T.bricks(g, r, '#9cc4cc', '#6c98a4', 8, 8); Gfx.circle(g, 8, 8, 7, '#c04838'); Gfx.circle(g, 8, 8, 5, f ? '#ff9060' : '#e86848'); Gfx.circle(g, 8, 8, 2, '#fff0c0'); Gfx.px(g, 8, 2, '#ffe0a0'); Gfx.px(g, 8, 14, '#ffe0a0'); Gfx.px(g, 2, 8, '#ffe0a0'); Gfx.px(g, 14, 8, '#ffe0a0'); });
    T.reg('ml_statue', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 13, 10, 3, '#5c4078'); Gfx.rect(g, 5, 4, 6, 9, '#a888c8'); Gfx.circle(g, 8, 4, 3, '#b898d8'); Gfx.rect(g, 4, 7, 2, 5, '#9070b0'); Gfx.rect(g, 10, 7, 2, 5, '#9070b0'); Gfx.px(g, 7, 3, '#302048'); Gfx.px(g, 9, 3, '#302048'); });
    T.reg('ml_rock', { kind: 'pillar', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 7, 5, '#6c5c88'); Gfx.ellipse(g, 7, 8, 5, 4, '#9484b0'); Gfx.ellipse(g, 6, 7, 2, 1, '#b8a8d0'); });
    const spirit = (g, r, draw) => { T.bricks(g, r, '#8868b8', '#5c4088', 4, 8); Gfx.rect(g, 2, 2, 12, 12, '#3c2860'); draw(g); };
    T.reg('ml_spirit_fish', { kind: 'wall', solid: true }, (g, f, r) => spirit(g, r, g2 => { Gfx.ellipse(g2, 8, 8, 4, 2, '#60c0e0'); Gfx.tri(g2, 12, 8, 14, 5, 14, 11, '#60c0e0'); Gfx.px(g2, 6, 7, '#ffffff'); }));
    T.reg('ml_spirit_human', { kind: 'wall', solid: true }, (g, f, r) => spirit(g, r, g2 => { Gfx.circle(g2, 8, 5, 2, '#e0c060'); Gfx.rect(g2, 6, 7, 4, 4, '#e0c060'); Gfx.vline(g2, 6, 11, 3, '#e0c060'); Gfx.vline(g2, 9, 11, 3, '#e0c060'); Gfx.hline(g2, 4, 8, 8, '#e0c060'); }));
    T.reg('ml_spirit_bird', { kind: 'wall', solid: true }, (g, f, r) => spirit(g, r, g2 => { Gfx.tri(g2, 3, 9, 8, 5, 8, 9, '#c090f0'); Gfx.tri(g2, 8, 9, 8, 5, 13, 9, '#c090f0'); Gfx.px(g2, 8, 10, '#c090f0'); Gfx.px(g2, 8, 4, '#ffffff'); }));
    T.reg('ml_spirit_dragon', { kind: 'wall', solid: true }, (g, f, r) => spirit(g, r, g2 => { Gfx.rect(g2, 4, 7, 8, 4, '#f07040'); Gfx.rect(g2, 10, 5, 4, 3, '#f07040'); Gfx.tri(g2, 4, 7, 2, 4, 6, 7, '#f07040'); Gfx.px(g2, 12, 6, '#ffffff'); Gfx.px(g2, 13, 8, '#ffe060'); }));
    T.reg('ml_claw', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 8, 4, 8, '#5c4078'); Gfx.tri(g, 2, 8, 6, 2, 7, 8, '#8c70a8'); Gfx.tri(g, 9, 8, 10, 2, 14, 8, '#8c70a8'); Gfx.rect(g, 5, 7, 6, 2, '#8c70a8'); });
    T.reg('ml_claw_lit', { kind: 'statue', solid: true, frames: 2, light: true }, (g, f, r) => { Gfx.rect(g, 6, 8, 4, 8, '#5c4078'); Gfx.tri(g, 2, 8, 6, 2, 7, 8, '#8c70a8'); Gfx.tri(g, 9, 8, 10, 2, 14, 8, '#8c70a8'); Gfx.rect(g, 5, 7, 6, 2, '#8c70a8'); Gfx.tri(g, 5, 7, 8, f ? 0 : 1, 11, 7, '#ff7020'); Gfx.tri(g, 6, 7, 8, 3, 10, 7, '#ffe060'); });
    T.reg('ml_lava', { kind: 'water', solid: true, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#e04820', ['#ff7030', '#c03018'], 12); if (f) { Gfx.px(g, 3, 5, '#ffd060'); Gfx.px(g, 11, 12, '#ffd060'); } else { Gfx.px(g, 12, 4, '#ffd060'); Gfx.px(g, 4, 11, '#ffd060'); } });
    T.reg('ml_sky', { kind: 'void', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#5c3c78', ['#684488', '#503068'], 6); });
    T.reg('ml_platform', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8b0a0', '#a88070', 8, 8); Gfx.hline(g, 0, 0, 16, '#f0d0c0'); Gfx.hline(g, 0, 15, 16, '#704838'); });
    T.reg('ml_puddle', { kind: 'stone', puddle: true }, (g, f, r) => { T.bricks(g, r, '#9cc4cc', '#6c98a4', 8, 8); Gfx.ellipse(g, 8, 9, 6, 4, '#4880c0'); Gfx.ellipse(g, 7, 8, 3, 2, '#78b0e0'); });
    T.reg('ml_wall_cracked', { kind: 'wall', solid: true }, (g, f, r) => { T.bricks(g, r, '#8868b8', '#5c4088', 4, 8); Gfx.hline(g, 0, 15, 16, '#3c2860'); Gfx.line(g, 2, 14, 7, 8, '#201030'); Gfx.line(g, 7, 8, 6, 2, '#201030'); Gfx.line(g, 7, 8, 13, 6, '#201030'); Gfx.line(g, 8, 9, 11, 14, '#201030'); });
    T.reg('ml_ropeh', { kind: 'rope' }, (g, f, r) => { T.noiseFill(g, r, '#5c3c78', ['#684488', '#503068'], 6); Gfx.hline(g, 0, 7, 16, '#c8a060'); Gfx.hline(g, 0, 8, 16, '#a08040'); });
    // ---- END MARS LIGHTHOUSE ----
    // ---- GABOMBA CATACOMBS (hot-syncable block): the teleporter stone under the bushes ----
    T.reg('gc_stone', { kind: 'stone', frames: 4 }, (g, f, r) => { T.noiseFill(g, r, '#6a7a60', ['#5a6a50', '#7a8a70'], 14); Gfx.ellipse(g, 8, 8, 7, 6, '#b8b0a0'); Gfx.ellipse(g, 8, 8, 6, 5, '#d0c8b8'); const c = ['#60a0c0', '#80c0e0', '#a0e0ff', '#80c0e0'][f % 4]; Gfx.px(g, 8, 8, c); Gfx.px(g, 9, 8, c); Gfx.px(g, 9, 9, c); Gfx.px(g, 8, 10, c); Gfx.px(g, 7, 10, c); Gfx.px(g, 6, 9, c); Gfx.px(g, 6, 8, c); Gfx.px(g, 6, 7, c); Gfx.px(g, 7, 6, c); Gfx.px(g, 8, 6, c); Gfx.px(g, 9, 6, c); Gfx.px(g, 10, 7, c); Gfx.px(g, 10, 8, c); Gfx.px(g, 10, 9, c); Gfx.px(g, 10, 10, c); });
    // ---- END GABOMBA CATACOMBS ----
    // ---- ISLETS (hot-syncable block): the cold sea of E Tundaria and the floes adrift on it, the bird's nest ----
    T.reg('icewater', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4c8cc8'); for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; Gfx.hline(g, (i * 5) % 8, y, 5, '#7cb4e0'); } Gfx.px(g, 3, (f * 3) % 16, '#b0d8f0'); });
    T.reg('berg', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#4c8cc8'); Gfx.ellipse(g, 8, 9, 8, 6, '#a8d0e8'); Gfx.ellipse(g, 8, 8, 7, 5, '#e8f4fc'); Gfx.ellipse(g, 7, 7, 4, 2, '#ffffff'); Gfx.px(g, 3, 10, '#c0e0f0'); Gfx.px(g, 12, 10, '#c0e0f0'); });
    T.reg('nest', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 7, 5, '#8a6838'); Gfx.ellipse(g, 8, 10, 5, 3, '#c8a060'); Gfx.ellipse(g, 8, 10, 3, 2, '#6a4828'); for (let i = 0; i < 6; i++) Gfx.px(g, 2 + i * 2, 7 + (i % 2) * 6, '#a88048'); });
    T.reg('rock_spiky', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 6, 4, '#707880'); Gfx.ellipse(g, 7, 9, 4, 2, '#98a0a8'); for (const [x, y] of [[2, 6], [5, 3], [8, 2], [11, 3], [14, 6], [4, 13], [12, 13]]) { Gfx.tri(g, x - 1, y + 3, x + 1, y + 3, x, y - 1, '#c8d0d8'); } Gfx.rect(g, 3, 13, 10, 2, '#404850'); });
    T.reg('yd_arrow', { kind: 'sand', softsand: true }, (g, f, r) => { T.noiseFill(g, r, '#e8cc88', ['#dcc078', '#f0d898'], 16); Gfx.ellipse(g, 8, 8, 5, 4, '#a08858'); Gfx.ellipse(g, 7, 7, 3, 2, '#c0a878'); });
    // ---- ANEMOS (hot-syncable block): the dots round the circles, the lit tile, the skeleton drawing ----
    T.reg('an_dot', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#d8d8e8', '#b0b0c8', 8, 8); Gfx.circle(g, 8, 8, 3, '#606070'); Gfx.circle(g, 8, 8, 2, '#404050'); });
    T.reg('an_dot_lit', { kind: 'stone', frames: 4 }, (g, f, r) => { T.bricks(g, r, '#d8d8e8', '#b0b0c8', 8, 8); Gfx.circle(g, 8, 8, 3, ['#e0c040', '#f0e080', '#ffffc0', '#f0e080'][f % 4]); Gfx.circle(g, 8, 8, 1, '#ffffff'); });
    T.reg('an_tile_lit', { kind: 'stone', frames: 2 }, (g, f, r) => { T.bricks(g, r, '#e8e0f8', '#c0b0e0', 8, 8); Gfx.rect(g, 3, 3, 10, 10, f ? '#c0e0ff' : '#a0d0ff'); Gfx.line(g, 4, 12, 9, 6, '#7090c0'); });
    T.reg('an_skeleton', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#c8c0d0', '#a098b0', 8, 8); Gfx.rect(g, 6, 2, 4, 4, '#f0f0f0'); Gfx.rect(g, 7, 7, 2, 6, '#f0f0f0'); Gfx.hline(g, 3, 8, 10, '#f0f0f0'); Gfx.hline(g, 4, 10, 8, '#f0f0f0'); });
    // ---- END ANEMOS ----
    // ---- END ISLETS ----
    // ---- CLASSITEMS (hot-syncable block): the things the new class Psynergy works on ----
    T.reg('chest_locked', { kind: 'chest', solid: true }, (g, f, r) => { Gfx.rect(g, 2, 5, 12, 9, '#605878'); Gfx.rect(g, 2, 4, 12, 4, '#8078a0'); Gfx.rect(g, 2, 8, 12, 1, '#302848'); Gfx.rect(g, 6, 7, 4, 4, '#e8c040'); Gfx.rect(g, 7, 9, 2, 2, '#302848'); Gfx.rect(g, 2, 13, 12, 1, '#302848'); });
    T.reg('hookpost', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 3, 4, 12, '#886038'); Gfx.rect(g, 6, 3, 4, 2, '#a87848'); Gfx.circle(g, 8, 4, 3, '#c0c8d0'); Gfx.circle(g, 8, 4, 1, '#404850'); Gfx.rect(g, 4, 14, 8, 2, '#604020'); });
    T.reg('tunnel', { kind: 'rock', solid: true }, (g, f, r) => { Gfx.ellipse(g, 8, 9, 8, 6, '#585060'); Gfx.ellipse(g, 8, 10, 5, 4, '#100c18'); Gfx.ellipse(g, 8, 11, 3, 2, '#000000'); Gfx.px(g, 3, 5, '#787080'); Gfx.px(g, 12, 6, '#787080'); });
    T.reg('beast_sleeping', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.ellipse(g, 8, 10, 7, 5 - (f ? 0 : 1), '#8a6a48'); Gfx.ellipse(g, 5, 8, 3, 2, '#a88058'); Gfx.px(g, 4, 8, '#302020'); Gfx.px(g, 6, 8, '#302020'); Gfx.tri(g, 3, 6, 5, 6, 4, 4, '#8a6a48'); Gfx.tri(g, 6, 6, 8, 6, 7, 4, '#8a6a48'); Gfx.ellipse(g, 12, 12, 3, 1, '#6a4a28'); if (f) { Gfx.px(g, 13, 3, '#f0f0f0'); Gfx.px(g, 14, 2, '#f0f0f0'); } });
    T.reg('bars', { kind: 'wall', solid: true }, (g, f, r) => { Gfx.rect(g, 0, 1, 16, 2, '#505860'); Gfx.rect(g, 0, 13, 16, 2, '#505860'); for (let x = 2; x < 16; x += 4) Gfx.vline(g, x, 1, 14, '#788088'); for (let x = 2; x < 16; x += 4) Gfx.px(g, x, 4, '#a8b0b8'); });
    T.reg('bridge_broken', { kind: 'water', water: true, solid: true }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3868a8'); Gfx.rect(g, 0, 4, 5, 8, '#a87848'); Gfx.rect(g, 11, 4, 5, 8, '#a87848'); Gfx.hline(g, 0, 6, 5, '#604020'); Gfx.hline(g, 11, 6, 5, '#604020'); Gfx.px(g, 7, 9, '#886038'); Gfx.px(g, 8, 12, '#886038'); });
    T.reg('bridge_fixed', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3868a8'); Gfx.rect(g, 0, 3, 16, 10, '#a87848'); Gfx.hline(g, 0, 5, 16, '#604020'); Gfx.hline(g, 0, 9, 16, '#604020'); Gfx.rect(g, 0, 3, 16, 1, '#c89868'); });
    T.reg('gear_broken', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.circle(g, 8, 8, 6, '#787078'); Gfx.circle(g, 8, 8, 4, '#484048'); Gfx.circle(g, 8, 8, 2, '#a8a0a8'); for (const [x, y] of [[8, 1], [14, 8], [8, 15], [2, 8], [3, 3], [13, 13]]) Gfx.rect(g, x - 1, y - 1, 2, 2, '#787078'); Gfx.line(g, 4, 12, 12, 4, '#e04040'); });
    T.reg('gear_fixed', { kind: 'statue', solid: true, frames: 4 }, (g, f, r) => { Gfx.circle(g, 8, 8, 6, '#a8a0a8'); Gfx.circle(g, 8, 8, 4, '#585058'); Gfx.circle(g, 8, 8, 2, '#d8d0d8'); const a = f * Math.PI / 8; for (let i = 0; i < 6; i++) { const t = a + i * Math.PI / 3; Gfx.rect(g, Math.round(8 + 6 * Math.cos(t)) - 1, Math.round(8 + 6 * Math.sin(t)) - 1, 2, 2, '#a8a0a8'); } });
    T.reg('crate_iron', { kind: 'crate', solid: true }, (g, f, r) => { Gfx.rect(g, 1, 1, 14, 14, '#606870'); Gfx.rect(g, 1, 1, 14, 2, '#889098'); Gfx.rect(g, 1, 13, 14, 2, '#303840'); Gfx.rect(g, 1, 1, 2, 14, '#788088'); Gfx.rect(g, 13, 1, 2, 14, '#484f58'); for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) Gfx.px(g, x, y, '#c0c8d0'); });
    T.reg('crate_iron_sunk', { kind: 'bridge' }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3868a8'); Gfx.rect(g, 2, 6, 12, 8, '#606870'); Gfx.rect(g, 2, 6, 12, 2, '#889098'); Gfx.hline(g, 0, 5, 16, '#6090c8'); });
    T.reg('dive_spot', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#2858a0'); Gfx.ellipse(g, 8, 8, 3 + f, 2 + (f >> 1), '#4c8cc8'); Gfx.ellipse(g, 8, 8, 1 + (f >> 1), 1, '#a0d0f0'); Gfx.px(g, 3, 3, '#6090c8'); Gfx.px(g, 12, 12, '#6090c8'); });
    T.reg('sand_drift', { kind: 'sand', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#e8cc88', ['#dcc078', '#f0d898'], 16); Gfx.ellipse(g, 8, 10, 8, 6, '#d8b868'); Gfx.ellipse(g, 7, 8, 6, 4, '#ecd090'); Gfx.ellipse(g, 6, 7, 3, 2, '#f8e8b0'); });
    T.reg('doll', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 6, 8, 4, 6, '#c04060'); Gfx.circle(g, 8, 5, 3, '#f0d0b0'); Gfx.rect(g, 5, 2, 6, 2, '#e0c040'); Gfx.px(g, 7, 5, '#202020'); Gfx.px(g, 9, 5, '#202020'); Gfx.rect(g, 4, 9, 2, 3, '#f0d0b0'); Gfx.rect(g, 10, 9, 2, 3, '#f0d0b0'); Gfx.rect(g, 6, 14, 1, 2, '#402020'); Gfx.rect(g, 9, 14, 1, 2, '#402020'); });
    T.reg('floor_switch', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 2, 2, 12, 12, '#807888'); Gfx.rect(g, 4, 4, 8, 8, '#a8a0b0'); Gfx.rect(g, 6, 6, 4, 4, '#c04040'); });
    T.reg('floor_switch_down', { kind: 'stone' }, (g, f, r) => { Gfx.rect(g, 2, 2, 12, 12, '#807888'); Gfx.rect(g, 4, 4, 8, 8, '#686070'); Gfx.rect(g, 6, 6, 4, 4, '#40c040'); });
    T.reg('chime', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 7, 1, 2, 4, '#886038'); Gfx.rect(g, 4, 5, 8, 8, '#c8a040'); Gfx.rect(g, 5, 5, 6, 2, '#e8d080'); Gfx.rect(g, 7, 13, 2, 2, '#e8c040'); Gfx.px(g, 6, 9, '#a08030'); Gfx.px(g, 9, 9, '#a08030'); });
    T.reg('chime_rung', { kind: 'statue', solid: true, frames: 2 }, (g, f, r) => { Gfx.rect(g, 7, 1, 2, 4, '#886038'); Gfx.rect(g, 4 + (f ? 1 : 0), 5, 8, 8, '#e8c060'); Gfx.rect(g, 5, 5, 6, 2, '#fff0a0'); Gfx.rect(g, 7, 13, 2, 2, '#ffe060'); if (f) { Gfx.px(g, 2, 7, '#fff0a0'); Gfx.px(g, 13, 7, '#fff0a0'); } });
    T.reg('tide_high', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3070b0'); for (let i = 0; i < 3; i++) Gfx.hline(g, (i * 5 + f) % 12, 3 + i * 5, 4, '#68a0d8'); });
    T.reg('tide_low', { kind: 'stone' }, (g, f, r) => { T.bricks(g, r, '#7890a8', '#587088', 8, 8); Gfx.px(g, 3, 4, '#a0c0d8'); Gfx.px(g, 11, 12, '#a0c0d8'); Gfx.hline(g, 5, 9, 4, '#90b0c8'); });
    T.reg('lead_statue', { kind: 'statue', solid: true }, (g, f, r) => { Gfx.rect(g, 3, 12, 10, 3, '#404048'); Gfx.rect(g, 5, 4, 6, 8, '#606068'); Gfx.circle(g, 8, 3, 2, '#787880'); Gfx.rect(g, 3, 6, 2, 4, '#606068'); Gfx.rect(g, 11, 6, 2, 4, '#606068'); Gfx.px(g, 6, 6, '#909098'); });
    T.reg('blizzard', { kind: 'snow', solid: true, frames: 4 }, (g, f, r) => { T.noiseFill(g, r, '#e8f0ff', ['#d0dcf0', '#ffffff'], 12); for (let i = 0; i < 8; i++) { const x = (i * 7 + f * 3) % 16, y = (i * 5 + f * 2) % 16; Gfx.px(g, x, y, '#ffffff'); Gfx.px(g, (x + 8) % 16, (y + 3) % 16, '#c8d8f0'); } Gfx.hline(g, 0, 8 + (f % 2), 16, '#ffffff'); });
    T.reg('spirit_mark', { kind: 'stone', frames: 2 }, (g, f, r) => { T.bricks(g, r, '#8a8090', '#6a6070', 8, 8); Gfx.circle(g, 8, 8, 4, f ? '#c0b8e0' : '#a8a0d0'); Gfx.circle(g, 8, 8, 2, '#e0d8ff'); });
    // ---- END CLASSITEMS ----
    // ---- CRADLE (hot-syncable block): the post-game's sunless world - dark in colour, not in light; every element raw ----
    T.reg('cr_ground', { kind: 'cave', enc: false }, (g, f, r) => { T.noiseFill(g, r, '#3a3050', ['#2e2640', '#463a5c', '#342c48'], 22); for (let i = 0; i < 3; i++) Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), ['#8a60c0', '#40a0a0', '#c08040'][i]); });
    T.reg('cr_rune', { kind: 'cave', enc: false, frames: 2 }, (g, f, r) => { T.noiseFill(g, r, '#3a3050', ['#2e2640', '#463a5c'], 20); Gfx.circle(g, 8, 8, 5, f ? '#5a4880' : '#4e3c70'); Gfx.circle(g, 8, 8, 3, '#3a3050'); Gfx.px(g, 8, 4, f ? '#f0d060' : '#c0a040'); Gfx.px(g, 12, 8, f ? '#60d0d0' : '#40a0a0'); Gfx.px(g, 8, 12, f ? '#f07040' : '#c05030'); Gfx.px(g, 4, 8, f ? '#c080f0' : '#9060c0'); });
    T.reg('cr_void', { kind: 'pit', solid: true, hop: true }, (g, f, r) => { T.noiseFill(g, r, '#100818', ['#0a0410', '#180c24'], 10); Gfx.px(g, Math.floor(r() * 16), Math.floor(r() * 16), '#4a3070'); });
    T.reg('cr_ichor', { kind: 'water', water: true, solid: true, frames: 4 }, (g, f, r) => { T.noiseFill(g, r, '#221838', ['#1a1030', '#2c2048'], 12); for (let i = 0; i < 3; i++) { const y = (i * 5 + f * 2) % 16; Gfx.hline(g, (i * 3 + f) % 10, y, 5, '#4a3878'); } });
    T.reg('cr_ember', { kind: 'lava', solid: true, frames: 4 }, (g, f, r) => { Gfx.rect(g, 0, 0, 16, 16, '#3a0c10'); for (let i = 0; i < 5; i++) { const x = (i * 5 + f * 3) % 16, y = (i * 7 + f) % 16; Gfx.rect(g, x, y, 3, 2, '#a02818'); Gfx.px(g, x + 1, y, '#e06030'); } });
    T.reg('cr_glass', { kind: 'stone', solid: true }, (g, f, r) => { Gfx.tri(g, 3, 15, 13, 15, 8, 1, '#2a2050'); Gfx.tri(g, 5, 15, 8, 15, 8, 3, '#5a48a0'); Gfx.vline(g, 8, 3, 12, '#8a78d0'); Gfx.px(g, 8, 2, '#c0b0ff'); });
    T.reg('cr_top', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#4a3868', ['#3e2c5c', '#564474'], 16); });
    T.reg('cr_face', { kind: 'cliff', solid: true }, (g, f, r) => { T.noiseFill(g, r, '#221838', ['#1a1030', '#2c2048'], 14); for (let x = 1; x < 16; x += 5) Gfx.vline(g, x, 2, 10, '#160c28'); });
    cliffSet('voidrock', 'cr_top', 'cr_face', 'cr_face', '#6a5890', '#3e2c5c', '#181028', '#0c0818');
    // ---- END CRADLE ----
    if (typeof registerPropTiles === 'function') registerPropTiles();   // js/core/tiles_props.js: the furniture, signs, plants and dressings
  }
};
