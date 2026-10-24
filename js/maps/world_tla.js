// ---------- World map: The Lost Age (all of Weyard) ----------
'use strict';
// the characters of the world layouts (js/maps/world_*_layout.js and the editor's world_*_edits.js) and the tiles they stand for
const WORLD_TILE_CHARS = { '.': 'w_plain', 'T': 'w_forest', 'F': 'w_forest_dense', '#': 'w_mountain', '~': 'w_ocean', 'i': 'w_sea', 'r': 'w_river', ':': 'w_road', 'a': 'w_desert', 'A': 'w_dunes', 'u': 'w_snow', 'm': 'w_beach', 'h': 'w_hill', 's': 'w_swamp', 'w': 'w_wasteland', 'l': 'w_lava', 'b': 'w_bridge', 'v': 'w_bridge_v', 'x': 'w_edge' };
defineMap('world_tla', {
  name: 'Weyard', w: 320, h: 320, base: 'w_ocean', world: true, music: 'overworld2', bg: 'grass', encRate: 6,
  enc: [['Punch Ant', 'Punch Ant'], ['Giant Bat'], ['Wild Wolf', 'Wild Wolf'], ['Angle Worm'], ['Momonga', 'Momonga'], ['Emu'], ['Dino'], ['Wolfkin Cub', 'Wolfkin Cub']],
  seaEnc: [['Aqua Jelly', 'Aqua Jelly'], ['Seabird'], ['Urchin Beast'], ['Merman', 'Merman'], ['Man o\' War'], ['Sea Dragon'], ['Spiral Shell', 'Spiral Shell'], ['Gillman']],
  // Sea encounters: gentle around Indra/Osenia, fierce in the far oceans and the Sea of Time
  seaEncAt(x, y) {
    if (x >= 200 && x <= 270 && y >= 110 && y <= 150) return [['Sea Dragon'], ['Gillman', 'Gillman'], ['Spiral Shell', 'Spiral Shell'], ['Sea Hedgehog'], ['Ocean Dragon']];   // the Sea of Time
    if (x >= 120 && x <= 305 && y >= 120 && y <= 285) return [['Aqua Jelly', 'Aqua Jelly'], ['Seabird'], ['Urchin Beast', 'Urchin Beast'], ['Merman'], ["Man o' War", "Man o' War"]];   // the inner seas round Indra, Osenia and Apojii
    if (false) return [['Sea Dragon'], ['Gillman', 'Gillman'], ['Spiral Shell', 'Spiral Shell'], ['Sea Hedgehog'], ['Ocean Dragon']];   // the Sea of Time
    return [['Merman', 'Merman'], ['Sea Dragon'], ['Spiral Shell'], ['Gillman'], ['Seafowl', 'Seafowl']];
  },
  // Region-scaled random encounters (roughly follows the story's level curve)
  encAt(x, y) {
    const r = this.regionName(x, y);
    switch (r) {
      case 'Indra': return [['Punch Ant', 'Punch Ant'], ['Giant Bat'], ['Wild Wolf', 'Wild Wolf'], ['Angle Worm'], ['Momonga', 'Momonga'], ['Mini-Goblin']];
      case 'Osenia': return y > 90 ? [['Wild Gorilla'], ['Wyvern Chick'], ['Assassin'], ['Doomsayer'], ['Numb Ant', 'Numb Ant']] : [['Emu'], ['Dino'], ['Kobold II', 'Kobold II'], ['Wolfkin Cub', 'Wolfkin Cub'], ['Flash Ant'], ['Mummy']];
      case 'Gondowan': return y < 60 ? [['Dinox'], ['Wood Walker'], ['Gressil'], ['Devil Scorpion'], ['Roc']] : [['Dread Hound II'], ['Dire Wolf', 'Dire Wolf'], ['Alec Goblin'], ['Red Demon'], ['Fire Worm', 'Fire Worm'], ['Squirrelfang']];
      case 'Hesperia': return [['Living Armor'], ['Minotaurus'], ['Wargold', 'Wargold'], ['Slayer'], ['Pteranodon']];
      case 'Atteka': return [['Talon Runner'], ['Foul Mummy'], ['Grand Chimera'], ['Sand Scorpion'], ['Hydra']];
      case 'Tundaria': return [['Wolfkin', 'Wolfkin'], ['Chimera Worm'], ['Great Seagull'], ['Doodle Bug', 'Doodle Bug']];
      case 'Nihan': case 'Apojii Islands': return [['Wood Walker'], ['Harridan II'], ['Wild Gorilla', 'Wild Gorilla'], ['Fire Worm', 'Fire Worm'], ['Roc']];
      case 'Northern Reaches': return [['Wolfkin', 'Wolfkin'], ['Minos Knight'], ['Pyrodra'], ['Cannibal Ghoul II'], ['Grave Wight']];
      case 'Angara': return [['Minos Warrior'], ['Lesser Demon'], ['Raptor', 'Raptor'], ['Puppet Warrior'], ['Wyvern'], ['Winged Lizard']];
      default: return this.enc;
    }
  },
  // the continents of Weyard, by where the party stands on the picture
  regionName(x, y) {
    if (x < 105 && y < 125) return 'Hesperia'; if (x < 100 && y >= 125 && y < 250) return 'Atteka';
    if ((y >= 242 && x > 80 && x < 155) || (y >= 250 && x > 80 && x < 270)) return 'Tundaria';   // the frozen continent only: the land south of Indra and Osenia (Yampi's coast, y 228-248) is theirs
    if (x >= 240 && y < 130) return 'Nihan'; if (x >= 270 && y >= 130 && y < 200) return 'Apojii Islands';
    if (x >= 175 && y >= 170) return 'Osenia'; if (x >= 200 && y >= 110 && y < 170) return 'Sea of Time';
    if (x >= 140 && x < 180 && y >= 150 && y < 250) return 'Indra';
    if (y < 60 && x >= 105 && x < 200) return 'Northern Reaches';
    if (x >= 105 && x < 240 && y >= 60 && y < 112) return 'Angara';
    if (x >= 100 && y >= 112 && y < 236) return 'Gondowan';
    return 'Weyard';
  },
  build(M) {
    const W = WorldGen; const L = WORLD_TLA_LAYOUT;
    const T = WORLD_TILE_CHARS;
    if (!L._edited && typeof WORLD_TLA_EDITS !== 'undefined') { L._edited = true; for (const [ex, ey, ch] of WORLD_TLA_EDITS) { const r = L.rows[ey]; if (r && ex >= 0 && ex < r.length) L.rows[ey] = r.slice(0, ex) + ch + r.slice(ex + 1); } }   // the editor's hand corrections
    L.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) M.set(x, y, T[row[x]] || 'w_plain'); });
    L.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '#') { let snow = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const r = L.rows[y + dy]; if (r && r[x + dx] === 'u') snow = true; } if (snow) M.set(x, y, 'w_snowmtn'); } });
    // the seas' walls (js/maps/world_tla_seawalls.js): spires, reefs, the ice the cannon breaks, the cliffs between the strait's mouths
    if (typeof worldTlaWallCells === 'function') for (const [x, y, ch] of worldTlaWallCells(L.rows)) { if (ch === '%' && G.flag('ice_wall_broken')) continue; M.set(x, y, ch === '^' ? 'w_spire' : ch === '*' ? 'w_reef' : ch === '%' ? 'w_icewall' : 'w_mountain'); }
    // the ice wall of the Northern Reaches: the ship comes up to it under the spires; Loho's cannon opens it (STORY_TLA.iceWall)
    M.trigger(94, 31, 3, 1, STORY_TLA.iceWall, { cond: () => !G.flag('ice_wall_broken') && (G.flag('ship_cannon') || !G.flag('ice_wall_seen')) });
    M.djinni('Iron', 168, 206, { fight: true }); M.djinni('Sour', 196, 228, { fight: true }); M.djinni('Chill', 124, 193, { fight: true }); M.djinni('Wheeze', 126, 249, { fight: true });
    M.djinni('Core', 53, 144, { fight: true }); M.djinni('Petra', 82, 69, { fight: true });   /* the Western Sea's two: on Atteka's western beach, and at the dead end of Hesperia's northern river */
    // the rusted weapons glinting under the sea, examined from the ship's rail (Sunshine's forge makes them what they were):
    // the Eastern Sea's two, the Western Sea's three (the Soul Brand's ring of reefs only the ship with wings clears)
    const glint = (id, x, y, item) => M.object('spot', x, y, { id, tile: 'sea_glint', script: function* (E) { const key = 'world_tla:hidden:' + x + ',' + y; if (G.flag(key)) { yield E.say('The sea floor glints where something lay.'); return; } G.set(key); yield E.say('Something glints under the water. Piers leans out over the rail and hauls it up... a weapon, rusted through by the sea.'); yield E.give(item, 1); } });
    glint('glint_axe', 242, 148, 'Rusty Axe'); glint('glint_mace', 276, 40, 'Rusty Mace'); glint('glint_sabre', 157, 252, 'Rusty Sword C'); glint('glint_rod', 69, 40, 'Rusty Staff C'); glint('glint_brand', 30, 175, 'Rusty Sword D');   /* the dead-end inlet south-west of Tundaria Tower */   /* 'Naribwe far south (WM)': in the field towards the beach */   /* 'Osenia Cave West (WM)': by the river bed between Mikasalla and the cavern */   /* 'Madra - East (WM)' in the guide: over the little bridge east of the town, down by the water */
    // the places, each opening into its map
    for (const pl of L.places) { const en = WORLD_TLA_ENTRIES[pl.map]; const target = en && (en.map || pl.map); if (!en || !MAPS[target]) { M.set(pl.x, pl.y, pl.tile); continue; } W.place(M, pl.x, pl.y, pl.tile, target, en.tx, en.ty, Object.assign({ dir: DIR.UP, id: pl.map }, en.opts || {})); }   // id: the marker's own name (a place may open into another map's room)
  }
});
// Every place on Weyard, by the map it opens into: where the party stands when it steps in, and what else the place
// needs (a ship berth, a condition, stepping straight ashore). The layout's markers carry the positions.
const WORLD_TLA_ENTRIES = {
  idejima: { tx: 12, ty: 16, opts: { cond: () => G.flag('idejima_landed') } },   /* the island is somewhere to walk up to only once the party has come ashore from it */ daila: { tx: 15, ty: 36 }, kandorean: { tx: 17, ty: 30 }, sea_god_shrine: { tx: 10, ty: 18 },
  dehkan: { tx: 0, ty: 26, opts: { dir: DIR.RIGHT, from: { n: { tx: 0, ty: 26, dir: DIR.RIGHT }, s: { map: 'dehkan_east', tx: 51, ty: 46, dir: DIR.UP } } } }, madra: { tx: 29, ty: 32 },
  madra_bridge: { tx: 7, ty: 20 }, osenia_cliffs_e: { map: 'osenia_cliffs', tx: 35, ty: 23, opts: { dir: DIR.LEFT } }, gondowan_cliffs: { tx: 48, ty: 25, opts: { dir: DIR.LEFT } }, gondowan_cliffs_w: { map: 'gondowan_cliffs', tx: 1, ty: 5, opts: { dir: DIR.RIGHT } }, gondowan_cliffs_n: { map: 'gondowan_cliffs', tx: 1, ty: 1, opts: { dir: DIR.DOWN, ship: true } }, gondowan_cliffs_s: { map: 'gondowan_cliffs', tx: 1, ty: 30, opts: { dir: DIR.UP, ship: true } }, indra_shore: { tx: 15, ty: 1, opts: { dir: DIR.DOWN } },
  yampi: { map: 'yampi_1', tx: 0, ty: 15, opts: { dir: DIR.RIGHT } }, yampi_e: { map: 'yampi_9', tx: 56, ty: 1, opts: { dir: DIR.DOWN } }, yampi_s: { map: 'yampi_10', tx: 16, ty: 21, opts: { dir: DIR.UP } }, alhafra: { tx: 25, ty: 51 }, alhafran_cave: { tx: 2, ty: 10, opts: { dir: DIR.RIGHT } },
  mikasalla: { tx: 27, ty: 15, opts: { dir: DIR.LEFT } }, garoh: { map: 'garoh_approach', tx: 11, ty: 32 }, airs_rock: { tx: 21, ty: 38 }, osenia_cavern: { tx: 11, ty: 22 },
  yallam: { tx: 36, ty: 22 }, taopo: { tx: 1, ty: 14, opts: { dir: DIR.RIGHT } }, aqua_rock: { tx: 21, ty: 38 }, yampi_cave: { tx: 8, ty: 11, opts: { cond: () => false } },   /* the cave's mouth is inside the desert: up the rear entrance's leftmost slide with Sand */
  naribwe: { tx: 13, ty: 25 }, kibombo_mtns: { tx: 30, ty: 40, opts: { dir: DIR.UP, from: { s: { tx: 30, ty: 40, dir: DIR.UP }, w: { map: 'kibombo_mtns_2', tx: 1, ty: 18, dir: DIR.RIGHT } } } }, kibombo: { tx: 14, ty: 42 }, gabomba: { map: 'kibombo', tx: 14, ty: 25 },
  magma_rock: { tx: 14, ty: 27 }, gondowan_settlement: { tx: 10, ty: 20 }, champa: { tx: 27, ty: 39 }, ankohl: { tx: 12, ty: 27 },
  tundaria: { tx: 15, ty: 22 }, e_tundaria_islet: { tx: 20, ty: 18 },
  indra_cavern: { tx: 15, ty: 22 }, angara_cavern: { tx: 11, ty: 19 }, atteka_cavern: { tx: 3, ty: 23 },
  izumo: { tx: 2, ty: 30, opts: { dir: DIR.RIGHT } }, gaia_rock: { tx: 14, ty: 32 }, apojii: { tx: 14, ty: 22 },
  lemuria: { map: 'lemuria_harbor', tx: 14, ty: 4, opts: { cond: () => G.flag('lemuria_open') } }, sea_of_time: { tx: 2, ty: 27, opts: { ship: true, cond: () => G.flag('trident_forged') } }, islet_cave: { map: 'islet_cave_isle', tx: 8, ty: 10, opts: { cond: () => false } },   /* ringed with rocks: no ship comes near it - Lonesome George carries the party there from the Sea of Time Islet */ treasure_isle: { tx: 12, ty: 31 },
  shaman: { map: 'shaman_cave', tx: 12, ty: 30 }, hesperia_settlement: { tx: 15, ty: 30 }, kalt: { tx: 13, ty: 24, opts: { dir: DIR.UP } },
  camp: { tx: 13, ty: 19, opts: { cond: () => G.flag('camp_founded') } }, contigo: { tx: 16, ty: 39 }, jupiter_lh: { tx: 14, ty: 23 }, atteka_inlet: { map: 'atteka_beach', tx: 31, ty: 17, opts: { ashore: true, dir: DIR.LEFT } }, atteka_inlet_n: { map: 'atteka_inlet', tx: 9, ty: 1, opts: { dir: DIR.DOWN } }, anemos: { tx: 11, ty: 19, opts: { cond: () => G.flag('anemos_open') } }, sw_atteka_islet: { tx: 28, ty: 15, opts: { dir: DIR.LEFT } },
  loho: { tx: 1, ty: 19, opts: { dir: DIR.RIGHT } }, prox: { tx: 15, ty: 76 }, mars_lh_1: { tx: 14, ty: 30 },
  se_angara_islet: { tx: 2, ty: 27, opts: { dir: DIR.RIGHT } }, n_osenia_islet: { tx: 12, ty: 21 }, w_indra_islet: { tx: 20, ty: 23 }, sea_of_time_islet: { tx: 2, ty: 3, opts: { dir: DIR.DOWN } }   /* the marker sits inland: the ship puts in at a beach and the party walks up */,
  // Angara's Golden Sun places, revisitable
  vale_south: { tx: 11, ty: 54 }, vault: { tx: 25, ty: 30 }, west_lunpa_cave: { tx: 1, ty: 8, opts: { dir: DIR.RIGHT } }, bilibin: { tx: 20, ty: 48 }, kolima: { tx: 1, ty: 16, opts: { dir: DIR.RIGHT } }, kolima_forest: { tx: 14, ty: 40, opts: { dir: DIR.UP } }, mogall: { tx: 11, ty: 1 }, imil: { tx: 17, ty: 30 }, mercury_lh_out: { tx: 15, ty: 35 },
  xian: { tx: 16, ty: 28 }, altin: { tx: 19, ty: 30 }, kalay: { tx: 14, ty: 52 }, lunpa: { tx: 14, ty: 30 }, tolbi: { tx: 18, ty: 30 }, lalivero: { tx: 15, ty: 26 }, venus_lh_1: { tx: 12, ty: 25 }, suhalla: { tx: 9, ty: 22, opts: { dir: DIR.UP } }, lama: { tx: 12, ty: 31 },
};
// a map's exits onto Weyard land beside its marker (the end its direction points from, for a map with two), on the
// water beside a berth when the party leaves by ship
function worldTlaLanding(mapId, dir, ship) {
  // a room deep inside a place (gaia_rock_inner, venus_lh_top) lands where the place itself does
  const target = (pl) => (WORLD_TLA_ENTRIES[pl.map] && WORLD_TLA_ENTRIES[pl.map].map || pl.map);
  let spots = []; for (let id = mapId; id && !spots.length; id = id.includes('_') ? id.slice(0, id.lastIndexOf('_')) : '') { spots = (WORLD_TLA_LAYOUT.places || []).filter(pl => target(pl) === id); if (!spots.length) spots = (WORLD_TLA_LAYOUT.places || []).filter(pl => target(pl).startsWith(id + '_')); }
  if (!spots.length) return null;
  let pl = spots[0];
  if (spots.length > 1) { const key = (dir === DIR.UP || dir === DIR.DOWN) ? 'y' : 'x'; const pick = (dir === DIR.UP || dir === DIR.LEFT) ? Math.min : Math.max; const v = pick.apply(null, spots.map(q => q[key])); pl = spots.find(q => q[key] === v); }
  const rows = WORLD_TLA_LAYOUT.rows; const at = (x, y) => (y >= 0 && y < rows.length && x >= 0 && x < rows[0].length) ? rows[y][x] : 'x';
  // a berth is water that opens onto the sea, not a puddle shut in by the shore
  const openWater = (x0, y0) => { if (!'~i'.includes(at(x0, y0))) return false; const seen = new Set([x0 + ',' + y0]); const q = [[x0, y0]]; while (q.length && seen.size < 150) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && '~i'.includes(at(x + dx, y + dy))) { seen.add(k); q.push([x + dx, y + dy]); } } } return seen.size >= 150; };
  const ok = ship ? openWater : (x, y) => '.:Tamu'.includes(at(x, y));
  const order = dir === DIR.UP ? [[0, -1], [0, 1], [-1, 0], [1, 0]] : dir === DIR.LEFT ? [[-1, 0], [0, 1], [0, -1], [1, 0]] : dir === DIR.RIGHT ? [[1, 0], [0, 1], [0, -1], [-1, 0]] : [[0, 1], [0, -1], [-1, 0], [1, 0]];
  for (const [dx, dy] of order) if (ok(pl.x + dx, pl.y + dy)) return { x: pl.x + dx, y: pl.y + dy, dir: dx === 0 ? (dy < 0 ? DIR.UP : DIR.DOWN) : (dx < 0 ? DIR.LEFT : DIR.RIGHT) };
  for (let r = 2; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (ok(pl.x + dx, pl.y + dy)) return { x: pl.x + dx, y: pl.y + dy, dir: DIR.DOWN };
  return { x: pl.x, y: pl.y + 1, dir: DIR.DOWN };
}
// Teleport destinations (unlocked with Teleport Lapis): the tile below each town's marker
(() => { if (TELEPORT_DESTS.some(d => d.map === 'world_tla')) return; const at = (label, map) => { const pl = WORLD_TLA_LAYOUT.places.find(p => p.map === map); return { label, map: 'world_tla', x: pl.x, y: pl.y + 1 }; };
  TELEPORT_DESTS.push(at('Daila', 'daila'), at('Madra', 'madra'), at('Alhafra', 'alhafra'), at('Garoh', 'garoh'), at('Mikasalla', 'mikasalla'), at('Naribwe', 'naribwe'), at('Kibombo', 'kibombo'), at('Yallam', 'yallam'), at('Izumo', 'izumo'), at('Champa', 'champa'),
    at('Lemuria', 'lemuria'), at('Shaman Village', 'shaman'), at('Contigo', 'contigo'), at('Loho', 'loho'), at('Prox', 'prox'), at('Vale', 'vale_south'), at('Kalay', 'kalay'), at('Tolbi', 'tolbi')); })();
