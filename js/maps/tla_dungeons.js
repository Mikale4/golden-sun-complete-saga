// ---------- The Lost Age dungeons ----------
'use strict';
const T3 = STORY_TLA;
// ======================= KANDOREAN TEMPLE =======================
// ======================= DEHKAN PLATEAU: js/maps/dehkan.js =======================
// ======================= MADRA CATACOMBS =======================
// madra_catacombs: js/maps/madra_catacombs.js
// ======================= CLIFFS =======================
// osenia_cliffs, madra_bridge: js/maps/osenia_cliffs.js
// gondowan_cliffs, gondowan_cliffs_cave: js/maps/gondowan_cliffs.js
// trial_road, its eight stages, the summit and the cavern behind it: js/maps/trial_road.js
// ======================= YAMPI DESERT =======================
// yampi_1..10, yampi_s1..s3, yampi_pit, yampi_tunnel, yampi_cave_in: js/maps/yampi.js
// Yampi Desert Cave (stub; in the game it opens off the desert's northern screen, by Sand - not from the world)
// yampi_cave (the outer cave) and the inner dungeon (ydc_*): js/maps/yampi_cave.js
// alhafran cave: js/maps/alhafra_cave.js
defineMap('alhafran_cave', {
  name: 'Alhafran Cave', w: 26, h: 16, base: 'void', music: 'dungeon', bg: 'cave', entry: { x: 2, y: 10 }, enc: [['Wolfkin Cub', 'Wolfkin Cub'], ['Wyvern Chick'], ['Mummy']],
  build(M) { M.cave(0, 0, 26, 16); M.open(0, 9, 1, 3); M.walkable(0, 9, 1, 3); M.exit(0, 9, 1, 3, 'world_tla', 93, 70, DIR.LEFT); M.object('pillar', 8, 6, { id: 'ac1' }); M.set(8, 3, 'pit'); M.chest(22, 4, 'Psy Crystal', 1); M.chest(22, 12, 'Ixion Mail', 1); M.chest(12, 12, 'Lucky Medal', 2); M.sign(3, 4, 'The Alhafran Cave - treasures of the old kingdom lie within.'); }
});
// airs_rock, airs_rock_wall, airs_rock_wall2, airs_rock_summit, airs_rock_in_*: js/maps/airs_rock.js, airs_rock_inside.js
// osenia_cavern: js/maps/osenia_cavern.js
// ======================= KIBOMBO MOUNTAINS / GABOMBA =======================
// kibombo_mtns*: js/maps/kibombo_mtns.js; gabomba, gabomba_gears, gabomba_cogs, gabomba_pit, gabomba_shrine, gabomba_eyes, gabomba_heart: js/maps/gabomba.js
// gabomba_catacombs and its levels (gc_*): js/maps/gabomba_catacombs.js
// ======================= TAOPO SWAMP / AQUA ROCK =======================
// taopo and its caves (taopo_cave_w/e/n, taopo_cave_c1..c3): js/maps/taopo.js
// aqua_rock and its halls (aqua_rock_in_1..16, aqua_rock_in_psy): js/maps/aqua_rock.js
// gaia_rock, its faces, summit and interior: js/maps/gaia_rock.js
// ======================= ANKOHL RUINS / TUNDARIA TOWER =======================
// ankohl, its rooms (ank_*) and its roof: js/maps/ankohl.js
// tundaria and its rooms (tt_*): js/maps/tundaria.js
// sea_of_time and its four fields: js/maps/sea_of_time.js
// lemuria_ancient: js/maps/lemuria.js
// trial_road and its stages: js/maps/trial_road.js
// jupiter_lh and its rooms (jl_*): js/maps/jupiter_lh.js
// ======================= MAGMA ROCK / NORTHERN REACHES / MARS LIGHTHOUSE =======================
// magma_rock, its faces (magma_rock_b/c/d/e/top) and its rooms (mr_*): js/maps/magma_rock.js
defineMap('northern_reaches', {
  name: 'Northern Reaches', w: 40, h: 22, base: 'snow', music: 'snow', bg: 'snow', entry: { x: 20, y: 19 }, enc: [['Wolfkin', 'Wolfkin'], ['Minos Knight'], ['Pyrodra'], ['Cannibal Ghoul II'], ['Great Seagull']], retreat: { map: 'world_tla', x: 78, y: 11, dir: DIR.DOWN },
  build(M) { M.fillObj(0, 0, 40, 3, 'clifftop'); M.fillObj(0, 3, 40, 1, 'cliff'); M.fillObj(0, 0, 2, 22, 'clifftop'); M.fillObj(38, 0, 2, 22, 'clifftop'); M.scatterObj(2, 4, 36, 16, 'pinesnow', 0.1, 3); M.fill(6, 8, 28, 4, 'ice'); M.fillObj(6, 8, 28, 4, null); M.fillObj(12, 9, 1, 1, 'rock_small'); M.fillObj(24, 10, 1, 1, 'rock_small'); M.fillObj(19, 21, 3, 1, null); M.walkable(19, 20, 3, 2); M.exit(19, 21, 3, 1, 'world_tla', 78, 11, DIR.DOWN); M.fillObj(19, 0, 3, 4, null); M.walkable(19, 0, 3, 4); M.exit(19, 0, 3, 1, 'world_tla', 80, 8, DIR.UP); M.object('pillar', 20, 14, { id: 'nr_p' }); M.fill(19, 6, 3, 1, 'pit'); M.set(20, 6, 'pit'); M.fillObj(2, 5, 17, 2, 'rock_small'); M.fillObj(22, 5, 16, 2, 'rock_small'); M.chest(4, 6, 'Water of Life', 2); M.chest(35, 16, 'Psy Crystal', 1); M.trigger(19, 17, 3, 1, T3.northernReaches, { once: 'nr_entered' });  M.chest(13, 12, 'Lucky Medal', 1, { hidden: true }); M.setObj(31, 16, 'psystone');}
});
// mars_lh_1 (the forecourt) and the tower's rooms (ml_*): js/maps/mars_lh.js
// ======================= OPTIONAL: TREASURE ISLE / ISLET CAVE / ANEMOS =======================
// treasure_isle and its rooms (ti_*): js/maps/treasure_isle.js
// islet_cave and its rooms: js/maps/islets.js
// anemos_gate, anemos (the hall of circles) and the sanctum's rooms: js/maps/anemos.js
