// ---------- World map: Golden Sun (Angara / Gondowan) ----------
'use strict';
// Helper: generic world painting
const WorldGen = {
  continent(M, pts, fill) { // pts: list of [cx,cy,rx,ry]
    for (const [cx, cy, rx, ry] of pts) M.blob(cx, cy, rx, ry, fill || 'w_plain');
  },
  mountains(M, pts, tile) { for (const [cx, cy, rx, ry] of pts) M.blob(cx, cy, rx, ry, tile || 'w_mountain'); },
  forest(M, pts) { for (const [cx, cy, rx, ry] of pts) M.blob(cx, cy, rx, ry, 'w_forest'); },
  road(M, pts) { for (let i = 0; i + 1 < pts.length; i++) M.path(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'w_road', 1); },
  river(M, pts) { for (let i = 0; i + 1 < pts.length; i++) M.path(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'w_river', 1); },
  beach(M) { // sand ring where land meets water
    const land = new Set(); for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) { const t = M.get(x, y); if (!t.water) land.add(x + ',' + y); }
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) { const t = M.get(x, y); if (t.water || t.place || t.kind === 'mountain' || t.kind === 'bridge' || t.name === 'w_road') continue; let coast = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = M.get(x + dx, y + dy); if (n.water) coast = true; } if (coast && (t.kind === 'grass' || t.kind === 'snow' || t.kind === 'sand' || t.kind === 'dirt' || t.kind === 'hill')) M.set(x, y, 'w_beach'); }
  },
  place(M, x, y, tile, map, tx, ty, opts) { M.set(x, y, tile); M.def.places = M.def.places || {}; M.def.places[x + ',' + y] = Object.assign({ map, tx, ty }, opts || {}); M.set(x, y, tile); }
};

// Every place on the map, by the map it opens into: where the party stands when it steps in, and (for the maps with
// two ends on the world) which end a given exit direction belongs to. The layout's place markers carry the positions.
const WORLD_GS1_ENTRIES = {
  vale_south: { tx: 11, ty: 54, dir: DIR.UP }, vault: { tx: 25, ty: 30, dir: DIR.UP }, lunpa: { tx: 14, ty: 30, dir: DIR.UP },
  goma_out: { tx: 5, ty: 24, dir: DIR.UP }, goma_top: { tx: 32, ty: 16, dir: DIR.UP },
  bilibin: { tx: 20, ty: 48, dir: DIR.UP }, bilibin_barricade: { tx: 7, ty: 20, dir: DIR.UP, from: { w: { tx: 6, ty: 22, dir: DIR.UP }, e: { tx: 22, ty: 9, dir: DIR.LEFT } } }, bilibin_cave: { tx: 1, ty: 11, dir: DIR.RIGHT }, bilibin_cave_2: { tx: 28, ty: 4, dir: DIR.LEFT },
  kolima: { tx: 1, ty: 16, dir: DIR.RIGHT }, kolima_forest: { tx: 14, ty: 40, dir: DIR.UP }, kolima_bridge: { tx: 10, ty: 1, dir: DIR.DOWN, from: { n: { tx: 10, ty: 1, dir: DIR.DOWN }, s: { tx: 10, ty: 24, dir: DIR.UP } } },
  imil: { tx: 17, ty: 30, dir: DIR.UP }, mercury_lh_out: { tx: 15, ty: 35, dir: DIR.UP },
  fuchin: { tx: 19, ty: 31, dir: DIR.UP }, mogall: { tx: 11, ty: 1, dir: DIR.DOWN }, mogall_s: { map: 'mogall_boss', tx: 11, ty: 16, dir: DIR.UP },
  xian: { tx: 16, ty: 28, dir: DIR.UP }, alpine: { tx: 1, ty: 15, dir: DIR.RIGHT, from: { w: { tx: 1, ty: 15, dir: DIR.RIGHT }, e: { tx: 30, ty: 11, dir: DIR.LEFT } } }, altin: { tx: 19, ty: 30, dir: DIR.UP }, lama: { tx: 12, ty: 31, dir: DIR.UP },
  lamakan: { tx: 43, ty: 8, dir: DIR.LEFT }, lamakan_w: { map: 'lamakan_3', tx: 33, ty: 17, dir: DIR.RIGHT },
  kalay: { tx: 14, ty: 52, dir: DIR.UP }, kalay_docks: { tx: 12, ty: 30, dir: DIR.UP }, kalay_tunnel: { tx: 20, ty: 18, dir: DIR.UP },
  tolbi: { tx: 18, ty: 30, dir: DIR.UP }, altmiller: { tx: 27, ty: 30, dir: DIR.UP }, gondowan_passage: { tx: 7, ty: 2, dir: DIR.DOWN, from: { n: { tx: 7, ty: 2, dir: DIR.DOWN }, s: { tx: 7, ty: 26, dir: DIR.UP } } },
  gondowan_cave: { tx: 3, ty: 22, dir: DIR.UP }, gondowan_cave_s: { map: 'gondowan_cave_4', tx: 11, ty: 27, dir: DIR.UP },
  suhalla: { tx: 9, ty: 22, dir: DIR.UP }, suhalla_desert: { tx: 48, ty: 1, dir: DIR.DOWN }, suhalla_desert_s: { map: 'suhalla_desert', tx: 16, ty: 126, dir: DIR.UP }, suhalla_gate: { tx: 107, ty: 29, dir: DIR.LEFT, from: { e: { tx: 107, ty: 29, dir: DIR.LEFT }, w: { tx: 7, ty: 33, dir: DIR.UP } } },
  lalivero: { tx: 15, ty: 26, dir: DIR.UP }, babi_lh: { tx: 14, ty: 52, dir: DIR.UP }, venus_lh_1: { map: 'venus_forest', tx: 1, ty: 15, dir: DIR.RIGHT },
  crossbone: { tx: 12, ty: 24, dir: DIR.UP }, tolbi_docks: { tx: 1, ty: 16, dir: DIR.RIGHT }, vale_cave: { tx: 1, ty: 10, dir: DIR.RIGHT }, west_lunpa_cave: { tx: 1, ty: 8, dir: DIR.RIGHT }, kolima_east: { map: 'kolima', tx: 27, ty: 17, dir: DIR.LEFT },
};
// a map's exits onto the world land beside its marker: the marker of the end the exit's direction points from, and the
// walkable tile on that side of it
function worldGs1Landing(mapId, dir) {
  // a room deep inside a place (gaia_rock_inner, venus_lh_top) lands where the place itself does
  const target = (pl) => (WORLD_GS1_ENTRIES[pl.map] && WORLD_GS1_ENTRIES[pl.map].map || pl.map);
  let spots = []; for (let id = mapId; id && !spots.length; id = id.includes('_') ? id.slice(0, id.lastIndexOf('_')) : '') { spots = (WORLD_GS1_LAYOUT.places || []).filter(pl => target(pl) === id); if (!spots.length) spots = (WORLD_GS1_LAYOUT.places || []).filter(pl => target(pl).startsWith(id + '_')); }
  if (!spots.length) return null;
  let pl = spots[0];
  if (spots.length > 1) { const key = dir === DIR.UP ? 'y' : dir === DIR.DOWN ? 'y' : 'x'; const pick = (dir === DIR.UP || dir === DIR.LEFT) ? Math.min : Math.max; const v = pick.apply(null, spots.map(q => q[key])); pl = spots.find(q => q[key] === v); }
  const M = G.field && G.field.map && G.field.map.id === 'world_gs1' ? G.field.map : null;
  const rows = WORLD_GS1_LAYOUT.rows; const walk = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < rows[0].length && '.:Tamu'.includes(rows[y][x]);
  const order = dir === DIR.UP ? [[0, -1], [0, 1], [-1, 0], [1, 0]] : dir === DIR.LEFT ? [[-1, 0], [0, 1], [0, -1], [1, 0]] : dir === DIR.RIGHT ? [[1, 0], [0, 1], [0, -1], [-1, 0]] : [[0, 1], [0, -1], [-1, 0], [1, 0]];
  for (const [dx, dy] of order) if (walk(pl.x + dx, pl.y + dy)) return { x: pl.x + dx, y: pl.y + dy, dir: dx === 0 ? (dy < 0 ? DIR.UP : DIR.DOWN) : (dx < 0 ? DIR.LEFT : DIR.RIGHT) };
  return { x: pl.x, y: pl.y + 1, dir: DIR.DOWN };
}

defineMap('world_gs1', {
  name: 'Weyard - Angara', w: 137, h: 128, base: 'w_ocean', world: true, music: 'overworld', bg: 'grass', encRate: 6,
  enc: [['Wild Mushroom II', 'Vermin II'], ['Rat', 'Rat'], ['Slime II', 'Slime II', 'Slime II'], ['Spider'], ['Drone Bee', 'Drone Bee'], ['Troll'], ['Gnome', 'Gnome']],
  regionName(x, y) {
    if (y < 30) return 'Northern Angara'; if (x < 46 && y < 55) return 'The Western Sea';
    if (x >= 100 && y < 48) return 'Eastern Angara'; if (x >= 100) return 'Southeastern Angara';
    if (x >= 84 && y < 62) return 'Central Angara'; if (y < 56) return 'Angara';
    if (x < 46) return 'Gondowan'; if (y >= 84) return 'Southern Gondowan'; if (y >= 74 && x < 62) return 'Gondowan';
    return 'Angara';
  },
  // Region-scaled random encounters (roughly follows the story's level curve): the nearest of these places sets the pack
  encAt(x, y) {
    const Z = [
      [56, 39, 'vale'], [64, 49, 'vale'], [65, 35, 'lunpa'], [81, 42, 'goma'], [87, 37, 'goma'], [98, 43, 'goma'], [68, 24, 'goma'],
      [66, 7, 'imil'], [69, 4, 'imil'], [110, 38, 'kolima'], [104, 33, 'kolima'], [117, 43, 'kolima'], [127, 49, 'fuchin'], [126, 58, 'fuchin'], [124, 65, 'fuchin'], [116, 61, 'fuchin'],
      [102, 56, 'altin'], [98, 51, 'altin'], [91, 54, 'altin'], [94, 52, 'altin'], [93, 59, 'kalay'], [73, 69, 'kalay'], [56, 66, 'kalay'], [50, 70, 'kalay'], [49, 65, 'kalay'],
      [33, 71, 'tolbi'], [39, 73, 'tolbi'], [32, 61, 'tolbi'], [56, 75, 'suhalla'], [52, 81, 'suhalla'], [35, 84, 'tolbi'], [50, 89, 'suhalla'], [52, 95, 'suhalla'], [48, 105, 'suhalla'],
      [64, 104, 'lalivero'], [65, 91, 'lalivero'], [68, 87, 'lalivero'], [71, 98, 'lalivero'], [24, 15, 'tolbi'],
    ];
    const PACKS = {
      vale: [['Wild Mushroom II', 'Vermin II'], ['Rat'], ['Slime II', 'Slime II'], ['Bat II', 'Bat II'], ['Amaze II'], ['Vermin II', 'Vermin II']],   // ~L2-5
      lunpa: [['Ant Lion'], ['Salamander', 'Salamander'], ['Grub', 'Grub'], ['Orc'], ['Fighter Bee', 'Fighter Bee'], ['Mad Mole']],                     // ~L17-19 (Lunpa is a late detour)
      goma: [['Rat', 'Rat'], ['Rat Soldier'], ['Drone Bee'], ['Spider'], ['Slime II', 'Slime II', 'Slime II']],                                          // ~L5-7
      imil: [['Cuttle', 'Cuttle'], ['Lizard Man'], ['Ooze', 'Ooze'], ['Ghoul'], ['Rabid Bat', 'Rabid Bat']],                                             // ~L10-12
      kolima: [['Drone Bee', 'Drone Bee'], ['Gnome', 'Gnome'], ['Troll'], ['Creeper', 'Creeper'], ['Spider']],                                            // ~L8-10
      fuchin: [['Ape', 'Ape'], ['Spider', 'Spider'], ['Bone Fighter'], ['Dirge'], ['Death Head'], ['Troll']],                                             // ~L13-16
      altin: [['Slime Beast'], ['Tarantula'], ['Rat Fighter', 'Rat Fighter'], ['Calamar'], ['Worm', 'Worm']],                                             // ~L15-17
      kalay: [['Ant Lion'], ['Salamander', 'Salamander'], ['Grub', 'Grub'], ['Orc'], ['Fighter Bee', 'Fighter Bee'], ['Mad Mole']],                       // ~L17-19
      tolbi: [['Gargoyle'], ['Ghost Mage'], ['Cave Troll'], ['Ravager', 'Ravager'], ['Death Cap'], ['Orc Captain']],                                      // ~L19-21
      suhalla: [['Dread Hound'], ['Worm', 'Worm'], ['Clay Gargoyle'], ['Gnome Mage', 'Gnome'], ['Kobold', 'Kobold'], ['Dirty Ape']],                      // ~L21-23
      lalivero: [['Warrior Bee', 'Warrior Bee'], ['Kobold', 'Kobold'], ['Brigand'], ['Dirty Ape'], ['Plated Rat'], ['Gnome Wizard'], ['Mole Mage', 'Mole Mage']],   // ~L23-26
    };
    let best = null, bd = Infinity; for (const [zx, zy, k] of Z) { const d = (zx - x) * (zx - x) + (zy - y) * (zy - y); if (d < bd) { bd = d; best = k; } }
    return PACKS[best] || PACKS.vale;
  },

  build(M) {
    M.djinni('Hail', 26, 70, { fight: true });   /* 'Tolbi West (WM)' in the guide: the Djinni waits on the road west of the city */
    const W = WorldGen; const L = WORLD_GS1_LAYOUT;
    // the land and sea of the picture, cell by cell
    const T = WORLD_TILE_CHARS;
    if (!L._edited && typeof WORLD_GS1_EDITS !== 'undefined') { L._edited = true; for (const [ex, ey, ch] of WORLD_GS1_EDITS) { const r = L.rows[ey]; if (r && ex >= 0 && ex < r.length) L.rows[ey] = r.slice(0, ex) + ch + r.slice(ex + 1); } }   // the editor's hand corrections
    L.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) M.set(x, y, T[row[x]] || 'w_plain'); });
    // the conditional gates: a bridge that is out until a flag, and stands again after (js/maps/world_gs1_gates.js)
    if (typeof WORLD_GS1_GATES !== 'undefined') for (const g of WORLD_GS1_GATES) for (const [gx, gy] of g.cells) M.set(gx, gy, T[G.flag(g.flag) ? g.open : g.shut] || 'w_plain');
    // the ranges of the north wear snow
    L.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '#') { let snow = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const r = L.rows[y + dy]; if (r && r[x + dx] === 'u') snow = true; } if (snow) M.set(x, y, 'w_snowmtn'); } });
    // the places, each opening into its map
    for (const pl of L.places) { const en = WORLD_GS1_ENTRIES[pl.map]; if (!en || !MAPS[en.map || pl.map]) { M.set(pl.x, pl.y, pl.tile); continue; } W.place(M, pl.x, pl.y, pl.tile, en.map || pl.map, en.tx, en.ty, { dir: en.dir, cond: en.cond, id: pl.map, from: en.from }); }   // id: the marker's own name (a place may open into another map's room)
  }
});
