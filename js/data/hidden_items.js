// ---------- The hidden items of both games ----------
// Everything the guides list under "Hidden Items": what is in the jars, barrels, boxes, ovens and gravestones, the
// Nuts caught out of trees, what Scoop digs up and what Cyclone blows out of the bushes. Each entry names the map it
// belongs on and where: exact tiles (`at`), a spot beside a doorway (`near` the map that door leads to, offset by
// dx/dy), or a corner or side of the room (`spot`); the nearest free floor from there is used, so the entries survive
// a room being rebuilt. `how` is 'container' unless it is 'catch', 'dig', 'cyclone' or 'chest'. Towns rebuilt from
// their reference rips place these exactly where the originals did (Vale and Daila keep theirs in their own map
// files); until then a town's item sits in the closest building the town has, marked "approx".
'use strict';
const HIDDEN_ITEMS = {
  // ---- Golden Sun ----
  vault_itemshop: [{ item: 'Sleep Bomb', tile: 'barrel', spot: 'r' }],
  vault: [{ item: 'Nut', tile: 'crate', at: [4, 7] }, { item: 'Nut', how: 'catch', spot: 'b' }, { item: 'Sleep Bomb', tile: 'gravestone', at: [12, 22] }, { item: 'Nut', tile: 'barrel', at: [27, 21] }],
  vault_mayor: [{ item: 'Coins', qty: 7, tile: 'pot', spot: 'r' }, { item: 'Lucky Medal', tile: 'crate', spot: 'br' }],   // approx: the 7 coins belong to the home by the lower entrance
  vault_weaponshop: [{ item: 'Coins', qty: 4, tile: 'barrel', spot: 'l' }, { item: 'Vial', tile: 'barrel', spot: 'tr' }],   // approx: the 4 coins belong to the home in the middle of town
  vault_inn: [{ item: 'Mint', tile: 'crate', spot: 'l' }],
  bilibin: [{ item: 'Coins', qty: 5, tile: 'pot', at: [15, 37] }, { item: 'Herb', tile: 'pot', at: [27, 26] }, { item: 'Nut', how: 'catch', at: [13, 17] }],
  bilibin_house_f: [{ item: 'Hard Nut', tile: 'barrel', spot: 'r' }],
  world_gs1: [{ item: 'Turtle Boots', how: 'ground', at: [108, 38] }],   // the forest at the end of the long island past the barricade, found by checking the ground
  bilibin_palace: [{ item: 'Elixir', tile: 'barrel', at: [4, 2] }],        // near the chimney on the main floor
  bilibin_palace_2: [{ item: 'Smoke Bomb', tile: 'barrel', spot: 'bl' }],   // the lower left corner of the office upstairs
  bilibin_house_a: [{ item: 'Sleep Bomb', tile: 'barrel', spot: 'l' }],
  bilibin_house_b: [{ item: 'Antidote', tile: 'barrel', spot: 'l' }],
  kolima: [{ item: 'Apple', tile: 'barrel', at: [23, 8] }, { item: 'Herb', tile: 'barrel', at: [14, 22] }],
  kolima_inn_2: [{ item: 'Lucky Medal', tile: 'pot', spot: 'tr' }],
  kolima_weaponshop_2: [{ item: 'Coins', qty: 7, tile: 'pot', spot: 'tr' }],
  kolima_forest_w: [{ item: 'Nut', how: 'catch', at: [19, 18] }],   // up the tree left of the first log
  imil_inn: [{ item: 'Lucky Pepper', tile: 'stove', at: [7, 1] }],
  imil: [{ item: 'Coins', qty: 9, tile: 'pot', at: [9, 9] }, { item: 'Lucky Medal', tile: 'gravestone', at: [7, 24] }],
  imil_weaponshop: [{ item: 'Sleep Bomb', tile: 'barrel', at: [1, 5] }],
  fuchin: [{ item: 'Unicorn Ring', tile: 'pot', at: [24, 10] }],
  mogall: [{ item: 'Nut', how: 'catch', spot: 't' }],
  xian_house1: [{ item: 'Elixir', tile: 'barrel', spot: 'r' }],
  xian: [{ item: 'Lucky Medal', tile: 'well', at: [4, 16] }],   // the well below the bridge (the guide's jar by the orchard)
  xian_house2: [{ item: 'Sleep Bomb', tile: 'pot', spot: 'l' }],
  xian_dojo: [{ item: 'Antidote', tile: 'barrel', spot: 'r' }],
  altin_house1: [{ item: 'Nut', tile: 'barrel', spot: 'r' }],
  altin_weaponshop: [{ item: 'Coins', qty: 9, tile: 'barrel', spot: 'l' }],
  lama_hall: [{ item: 'Coins', qty: 6, tile: 'pot', spot: 'r' }],
  lama: [{ item: 'Water of Life', how: 'chest', hidden: true, spot: 'r' }],
  kalay_palace: [{ item: 'Nut', tile: 'barrel', spot: 'r' }],
  kalay: [{ item: 'Sleep Bomb', tile: 'pot', at: [6, 30] }, { item: 'Nut', tile: 'pot', at: [3, 42] }, { item: 'Vial', tile: 'pot', at: [5, 47] }],   // the jars of the guide's map: under the cliff by house E, among the trees west of the road, beside the sanctum
  kalay_inn: [{ item: 'Elixir', tile: 'barrel', spot: 'bl' }],
  kalay_house2: [{ item: 'Smoke Bomb', tile: 'stove', spot: 'tr' }],
  kalay_house1: [{ item: 'Coins', qty: 11, tile: 'barrel', spot: 'br' }],
  // the Tolbi-bound ship's four (23 Coins, Nut, Lucky Medal, Anchor Charm) are placed aboard in js/maps/ship.js
  tolbi: [{ item: 'Power Bread', how: 'chest', hidden: true, near: 'tolbi_sanctum', dx: -3, dy: 0 }, { item: 'Coins', qty: 9, tile: 'barrel', near: 'tolbi_palace', dx: -2, dy: 1 }],
  tolbi_palace: [{ item: 'Hard Nut', tile: 'pot', spot: 'bl' }],
  tolbi_house1: [{ item: 'Vial', tile: 'barrel', spot: 'r' }],
  lunpa_house1: [{ item: 'Vial', tile: 'pot', spot: 'r' }],
  suhalla: [{ item: 'Coins', qty: 5, tile: 'pot', at: [0, 15] }, { item: 'Lucky Medal', tile: 'pot', at: [13, 5] }, { item: 'Hard Nut', how: 'chest', at: [1, 1] }],   // the rip's labels: the jar by the shop, the jar under the store, the chest at the top-left
  suhalla_house1: [{ item: 'Smoke Bomb', tile: 'stove', spot: 'tr' }],
  lalivero: [{ item: 'Psy Crystal', tile: 'pot', at: [13, 12] }],   // the rip's label by the obelisk
  lalivero_inn: [{ item: 'Lucky Medal', tile: 'barrel', spot: 'l' }],
  lalivero_house1: [{ item: 'Lucky Medal', tile: 'barrel', spot: 'r' }],
  lalivero_itemshop: [{ item: 'Antidote', tile: 'barrel', spot: 'r' }, { item: 'Water of Life', tile: 'pot', spot: 'tr' }],   // approx: the jar stands on the shop's roof
  // ---- The Lost Age ----
  madra: [{ item: 'Antidote', tile: 'crate', near: 'madra_house5', dx: -2, dy: 1 }],
  madra_house5: [{ item: 'Smoke Bomb', tile: 'barrel', spot: 'l' }],
  madra_inn_up: [{ item: 'Sleep Bomb', tile: 'pot', spot: 'l' }],
  madra_cave_home: [{ item: 'Elixir', tile: 'pot', spot: 'l' }],
  madra_mayor: [{ item: 'Coins', qty: 15, tile: 'crate', spot: 'r' }],
  alhafra: [{ item: 'Coins', qty: 32, tile: 'crate', at: [25, 8] }, { item: 'Lucky Medal', tile: 'pot', at: [42, 30] }],   // the crate east of the mansion, the jar between the broken houses
  alhafra_house2: [{ item: 'Elixir', tile: 'barrel', spot: 'tr' }],
  alhafra_mayor: [{ item: 'Coins', qty: 7, tile: 'barrel', spot: 'br' }],
  alhafra_inn_up: [{ item: 'Apple', tile: 'pot', spot: 'l' }],
  mikasalla: [{ item: 'Nut', tile: 'crate', at: [2, 20] }, { item: 'Elixir', tile: 'barrel', at: [27, 22] }],   // the box by the sheep, the barrel in the lower-right corner
  mikasalla_inn: [{ item: 'Lucky Pepper', tile: 'barrel', at: [8, 2] }],   // by the oven
  mikasalla_h3: [{ item: 'Herb', tile: 'pot', spot: 'r' }],
  prox: [{ item: 'Cookie', tile: 'pot', at: [29, 41] }],   // the jar just outside the inn, on the left
  prox_inn: [{ item: 'Potion', tile: 'pot', spot: 'r' }],   // the green jar in the inn
  prox_basement: [{ item: 'Sacred Feather', tile: 'crate', at: [8, 4] }],   // the wooden box in the cellar of the northernmost house
  loho: [{ item: 'Crystal Powder', tile: 'barrel', at: [28, 30] }, { item: 'Mythril Silver', how: 'dig', at: [14, 35] }, { item: 'Golem Core', how: 'dig', at: [34, 4] }],   // the barrel by the healer's house; Scoop by the lower-left ruin's wall; Scoop beyond the blasted wall (the other Golem Core is under the boulder, in loho.js)
  garoh: [{ item: 'Smoke Bomb', tile: 'barrel', at: [25, 23] }, { item: 'Nut', tile: 'barrel', at: [3, 5] }],   // by the inn; the upper-left corner of the terrace
  garoh_inn: [{ item: 'Elixir', tile: 'pot', at: [10, 2] }],   // between the two beds
  garoh_item: [{ item: 'Sleep Bomb', tile: 'pot', spot: 'l' }],   // the blue jar in the home in the upper-left corner
  naribwe: [{ item: 'Elixir', tile: 'pot', at: [2, 21] }],
  naribwe_inn: [{ item: 'Sleep Bomb', tile: 'pot', spot: 'r' }],
  naribwe_home1: [{ item: 'Coins', qty: 18, tile: 'pot', at: [1, 5] }],   // the jar in the upper left home
  gc_bones: [{ item: 'Mint', how: 'cyclone', at: [13, 9] }],   // Gabomba Catacombs: under the bushes in the hall of bones
  e_tundaria_hut: [{ item: 'Lucky Medal', tile: 'pot', at: [2, 2] }],                 // the blue left jar inside the hut
  se_angara_islet: [{ item: 'Lucky Medal', tile: 'crate', at: [18, 28] }],           // the wooden box at the dock's end
  n_osenia_home: [{ item: 'Lucky Medal', tile: 'barrel', at: [1, 2] }],              // the leftmost barrel in the lonely home
  w_indra_islet: [{ item: 'Lucky Medal', tile: 'barrel', at: [3, 5] }],              // the barrel on the pier near the upper left corner
  sea_of_time_islet: [{ item: 'Lucky Medal', tile: 'barrel', at: [5, 4] }],          // the barrel in the left corner outside the only hut
  kibombo: [{ item: 'Lucky Pepper', tile: 'pot', spot: 'l' }],
  kibombo_inn: [{ item: 'Nut', tile: 'barrel', spot: 'l' }],
  kibombo_house1: [{ item: 'Lucky Medal', tile: 'pot', spot: 'tr' }],
  yallam_inn: [{ item: 'Elixir', tile: 'crate', spot: 'r' }],
  yallam: [{ item: 'Coins', qty: 16, tile: 'pot', near: 'yallam_inn', dx: -2, dy: 1 }, { item: 'Antidote', how: 'cyclone', spot: 't' }, { item: 'Nut', how: 'cyclone', spot: 'br' }, { item: 'Crystal Powder', tile: 'barrel', spot: 'br' }, { item: 'Mythril Silver', how: 'dig', spot: 'bl' }],
  yallam_forge: [{ item: 'Oil Drop', tile: 'barrel', spot: 'tr' }],
  // taopo: its digs and the Bramble Seed are placed by js/maps/taopo.js
  // the five islets' Lucky Medals: placed above, at the guide's spots (islets.js)
  apojii: [{ item: 'Coins', qty: 182, tile: 'pot', spot: 'b' }, { item: 'Mint', how: 'cyclone', spot: 'br' }, { item: 'Herb', how: 'cyclone', spot: 'l' }],
  apojii_east: [{ item: 'Bramble Seed', how: 'cyclone', spot: 'r' }],
  apojii_house1: [{ item: 'Coins', qty: 32, tile: 'barrel', spot: 'r' }],
  izumo: [{ item: 'Antidote', qty: 2, how: 'cyclone', at: [28, 34] }, { item: 'Lucky Medal', how: 'cyclone', at: [10, 13] }, { item: 'Elixir', tile: 'pot', at: [15, 10] }, { item: 'Water of Life', tile: 'pot', at: [24, 2] }],
  izumo_house7: [{ item: 'Festival Coat', tile: 'crate', at: [10, 3] }],   // the wooden box in the south-east home
  izumo_house5: [{ item: 'Smoke Bomb', tile: 'pot', at: [9, 6] }],   // the white jar in the most eastern home
  champa: [{ item: 'Smoke Bomb', tile: 'crate', at: [12, 27] }, { item: 'Coins', qty: 12, tile: 'crate', at: [28, 8] }, { item: 'Lucky Medal', tile: 'pot', at: [38, 17] }],
  champa_inn: [{ item: 'Elixir', tile: 'crate', spot: 'r' }],
  champa_cliff_2: [{ item: 'Sleep Bomb', tile: 'barrel', at: [21, 3] }],   // the rightmost room inside the cliff
  lemuria_palace: [{ item: 'Lucky Medal', tile: 'barrel', at: [20, 8] }],   // the barracks' barrel
  kalt: [{ item: 'Apple', how: 'catch', at: [2, 15] }],   // the tree left of the river; Catch
  gondowan_settlement: [{ item: 'Lucky Medal', tile: 'gravestone', at: [15, 16] }],   // the middle-left grave on the hill
  contigo: [{ item: 'Bramble Seed', how: 'cyclone', at: [3, 9] }, { item: 'Power Bread', tile: 'barrel', near: 'contigo_sanctum', dx: 3, dy: 0 }],   // the bush in the top-left corner; the barrel by the sanctum's east side
  contigo_inn: [{ item: 'Corn', tile: 'table', at: [9, 6] }],   // the lower part of the chef's corn table
  shaman_inn_cellar: [{ item: 'Elixir', tile: 'pot', at: [4, 4] }],   // the white jar downstairs at the inn
  shaman_moapa_cellar: [{ item: "Weasel's Claw", tile: 'barrel', at: [7, 3] }],   // the right barrel downstairs in Moapa's house
  // the Lucky Pepper in the Shaman's hut and the Lucky Medal on the balcony come after Trial Road: js/maps/shaman.js
};
