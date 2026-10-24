// ---------- Golden Sun dungeons ----------
'use strict';
// ======================= SOL SANCTUM =======================
// Sol Sanctum lives in js/maps/sol_sanctum.js
// ======================= GOMA CAVE =======================
// Goma Cave lives in js/maps/goma.js
// bilibin_cave: js/maps/bilibin_cave.js
// ======================= KOLIMA FOREST & TRET =======================
// ======================= ALPINE CROSSING / ALTIN MINE =======================
// alpine: js/maps/alpine.js
// ======================= LAMA TEMPLE =======================
// ======================= LAMAKAN DESERT =======================
// ======================= ALTMILLER CAVE =======================
// ======================= GONDOWAN PASSAGE / SUHALLA DESERT / GATE =======================
// the tunnel through the range south of Kalay Docks that joins Angara to Gondowan on foot: the way back north from
// Suhalla and Tolbi once the ship has carried the party across the Karagol Sea (a plain passage until it is rebuilt from its rip)
// ======================= BABI LIGHTHOUSE / VENUS LIGHTHOUSE =======================
defineMap('venus_lh_top', {
  name: 'Venus Lighthouse - Aerie', w: 26, h: 24, base: 'void', music: 'lighthouse', bg: 'lighthouse', indoor: true, entry: { x: 12, y: 20 },
  build(M) {
    M.cave(1, 1, 24, 22, 'lh_floor_venus', 'lh_wall_venus', 'lh_walltop_venus');
    M.setObj(12, 23, 'door_stone'); M.setObj(13, 23, 'door_stone'); M.exit(12, 23, 2, 1, 'venus_lh_2', 19, 3, DIR.DOWN, { door: true }); M.walkable(12, 23, 2, 1); M.open(12, 22, 2, 1); M.walkable(12, 22, 2, 1);
    M.fill(10, 5, 6, 6, 'void'); M.fill(12, 7, 2, 2, 'marble'); M.fill(10, 5, 6, 1, 'marble'); M.fill(10, 10, 6, 1, 'marble'); M.fill(10, 5, 1, 6, 'marble'); M.fill(15, 5, 1, 6, 'marble'); M.set(12, 11, 'marble'); M.set(13, 11, 'marble');
    M.setObj(4, 4, 'statue_gold'); M.setObj(21, 4, 'statue_gold'); M.setObj(4, 18, 'torch'); M.setObj(21, 18, 'torch'); for (const [x, y] of [[9, 5], [16, 5], [9, 10], [16, 10]]) M.setObj(x, y, 'torch'); M.beacon(12, 7, 'venus', G.flag('venus_lit'));
    M.trigger(2, 16, 22, 1, STORY.venusAerie, { once: 'venus_aerie_scene' });
    if (G.flag('venus_escape')) { M.trigger(11, 21, 4, 2, STORY_TLA.escapeStairs); M.def.escaping = true; }
  }
});
// ======================= LUNPA FORTRESS =======================
// ======================= CROSSBONE ISLE =======================
// crossbone: js/maps/crossbone.js
// ======================= VALE CAVE / VAULT CAVE (optional) =======================
// vale_cave: js/maps/gs1_optional.js
