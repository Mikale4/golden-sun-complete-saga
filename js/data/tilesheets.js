// ---------- Drawn tile sheets ----------
// Which cell of each sheet in art/ is which tile, in grid order (left to right, top to bottom). Generated from the
// sheet's .json by the slicer; edit the sheet, not this.
'use strict';
// 'classic': the game's own drawn-in-code tiles, with the sheets adding only the decorations the code never had
// (furniture, props); 'sheets': the hand-drawn sheets in art/ take the place of the code-drawn tiles; 'files': the art
// comes from the named PNGs in assets/ (see js/core/assetfiles.js), with the code drawing whatever is not there
const ART_MODE = 'files';
const TILE_SHEETS = [
  { png: 'art/overworld_tiles.png', names: [
    'w_plain', 'w_plain_b', 'w_forest', 'w_forest_b', 'w_hill', 'w_mountain', 'w_desert', 'w_desert_b',
    'w_snow', 'w_snow_b', 'w_snowmtn', 'w_swamp', 'w_wasteland', 'w_road', 'w_beach', 'w_bridge',
    'w_ocean_0', 'w_ocean_1', 'w_ocean_2', 'w_ocean_3', 'w_sea_0', 'w_sea_1', 'w_sea_2', 'w_sea_3',
    'w_river_0', 'w_river_1', 'w_river_2', 'w_river_3', 'w_lava_0', 'w_lava_1', 'w_lava_2', 'w_lava_3',
    'w_bridge_v', 'w_village', 'w_town', 'w_city', 'w_cave', 'w_cave_snow', 'w_cave_sand', 'w_temple',
    'w_ruins', 'w_ruins_sand', 'w_lh_dark', 'w_lh_venus', 'w_lh_mercury', 'w_lh_mars', 'w_lh_jupiter', 'w_rock',
    'w_tower', 'w_tower_snow', 'w_island', 'w_dock', 'shore_n', 'shore_s', 'shore_w', 'shore_e',
    'shore_nw', 'shore_ne', 'shore_sw', 'shore_se', 'shore_in_nw', 'shore_in_ne', 'shore_in_sw', 'shore_in_se'
  ] },
  // road pieces named by the sides the road continues through, on grass (road_), sand (droad_) and snow (sroad_)
  { png: 'art/road_tiles.png', names: [
    'road_o', 'road_n', 'road_s', 'road_e', 'road_w', 'road_ns', 'road_ew', 'road_ne',
    'road_nw', 'road_se', 'road_sw', 'road_nse', 'road_nsw', 'road_new', 'road_sew', 'road_nsew',
    'droad_o', 'droad_n', 'droad_s', 'droad_e', 'droad_w', 'droad_ns', 'droad_ew', 'droad_ne',
    'droad_nw', 'droad_se', 'droad_sw', 'droad_nse', 'droad_nsw', 'droad_new', 'droad_sew', 'droad_nsew',
    'sroad_o', 'sroad_n', 'sroad_s', 'sroad_e', 'sroad_w', 'sroad_ns', 'sroad_ew', 'sroad_ne',
    'sroad_nw', 'sroad_se', 'sroad_sw', 'sroad_nse', 'sroad_nsw', 'sroad_new', 'sroad_sew', 'sroad_nsew'
  ] },
  // towns: ground, roofs (peak / middle / edge rows), walls, doors and windows, hanging signs, market dressing.
  // 'overlay' cells are transparent and sit on whatever is under them; 'alias' maps a drawn name onto the game's
  // tile name for it; 'extras' are new decorations the sheet offered that no map used before (solid props unless
  // listed under 'walkOver')
  { png: 'art/town_ground.png', names: [
    'grass', 'grass2', 'flowers', 'dirt', 'path', 'sand', 'cobble', 'stonefloor',
    'marble', 'snow', 'cave', 'tallgrass', 'water_0', 'water_1', 'water_2', 'water_3',
    'roof_red_peak', 'roof_red', 'roof_red_edge', 'roof_blue_peak', 'roof_blue', 'roof_blue_edge', 'roof_green_peak', 'roof_green',
    'roof_green_edge', 'roof_thatch_peak', 'roof_thatch', 'roof_thatch_edge', 'roof_purple_peak', 'roof_purple', 'roof_purple_edge', 'roof_brown_peak',
    'roof_brown', 'roof_brown_edge', 'roof_grey_peak', 'roof_grey', 'roof_grey_edge', 'roof_teal_peak', 'roof_teal', 'roof_teal_edge',
    'wall_plaster', 'wall_plaster2', 'wall_stone', 'wall_wood', 'wall_mud', 'wall_blue', 'wall_temple', 'wall_ice',
    'door', 'door_arch', 'window', 'window_shutter', 'window_flower', 'sign', 'sign_hanging', 'lantern',
    'barrel', 'crate', 'pot', 'well', 'market_stall', 'awning_red', 'awning_blue', 'awning_green'
  ], overlay: [
    'door', 'door_arch', 'window', 'window_shutter', 'window_flower', 'sign', 'sign_hanging', 'lantern',
    'barrel', 'crate', 'pot', 'well', 'market_stall', 'awning_red', 'awning_blue', 'awning_green'
  ], alias: { door_arch: 'door_stone', window_shutter: 'window_stone' },
    extras: ['window_flower', 'lantern', 'market_stall', 'awning_red', 'awning_blue', 'awning_green'] },
  // towns: trees, rocks, cliffs, props, torches and Psynergy Stones, pond foam, and a few odds and ends
  { png: 'art/town_props.png', names: [
    'tree', 'tree_top', 'tree_bot', 'pine', 'pinesnow', 'palm', 'bush', 'stump',
    'boulder', 'rock_small', 'rock_grass', 'rock_sand', 'cliff', 'clifftop', 'stairs_down', 'stairs_up',
    'fountain_0', 'fountain_1', 'well', 'cart', 'tent', 'crate', 'barrel', 'pot',
    'chest', 'chest_open', 'sign', 'statue', 'statue_gold', 'torch_0', 'torch_1', 'psystone_0',
    'psystone_1', 'lever', 'savepoint', 'stairs', 'stairs_wood', 'ship_deck', 'ship_rail', 'mast',
    'pond_n', 'pond_s', 'pond_w', 'pond_e', 'pond_nw', 'pond_ne', 'pond_sw', 'pond_se',
    'pond_in_nw', 'pond_in_ne', 'pond_in_sw', 'pond_in_se', 'puddle', 'puddle_large', 'lilypad', 'lilypad_flower',
    'reeds', 'cattails', 'dock', 'boat', 'leaves', 'leaves_pile', 'snowman', 'snow_bush'
  ], overlay: [
    'tree', 'tree_top', 'tree_bot', 'pine', 'pinesnow', 'palm', 'bush', 'stump',
    'boulder', 'rock_small', 'rock_grass', 'rock_sand', 'stairs_down', 'stairs_up', 'fountain_0', 'fountain_1',
    'well', 'cart', 'tent', 'crate', 'barrel', 'pot', 'chest', 'chest_open',
    'sign', 'statue', 'statue_gold', 'torch_0', 'torch_1', 'psystone_0', 'psystone_1', 'lever',
    'savepoint', 'stairs', 'stairs_wood', 'ship_rail', 'mast', 'pond_n', 'pond_s', 'pond_w',
    'pond_e', 'pond_nw', 'pond_ne', 'pond_sw', 'pond_se', 'pond_in_nw', 'pond_in_ne', 'pond_in_sw',
    'pond_in_se', 'puddle', 'puddle_large', 'lilypad', 'lilypad_flower', 'reeds', 'cattails', 'boat',
    'leaves', 'leaves_pile', 'snowman', 'snow_bush'
  ], extras: ['puddle_large', 'lilypad', 'lilypad_flower', 'reeds', 'cattails', 'boat', 'leaves', 'leaves_pile', 'snowman', 'snow_bush'],
    walkOver: ['puddle_large', 'lilypad', 'lilypad_flower', 'leaves', 'leaves_pile'], same: { boulder_grass: 'boulder' } },
  // interiors: floors, carpets, inside walls, furniture, and the outdoor pieces the town sheets left out
  { png: 'art/interiors_tiles.png', names: [
    'floor_wood', 'floor_stone', 'floor_tile', 'carpet_red', 'carpet_red_edge', 'carpet_blue', 'rug', 'wall_in',
    'wall_in_top', 'wall_in_stone', 'wall_in_stone_top', 'table', 'chair', 'bed', 'bed_foot', 'bookshelf',
    'counter', 'shelf', 'fireplace_0', 'fireplace_1', 'chimney', 'fence', 'fence_v', 'bridge',
    'bridge_v', 'ice', 'swamp', 'lavarock', 'sandsoft', 'deepwater_0', 'deepwater_1', 'deepwater_2',
    'deepwater_3', 'puddle_dry', 'sprout', 'vines', 'table_long_l', 'table_long_r', 'stool', 'cupboard',
    'wardrobe', 'painting', 'window_in', 'door_in', 'bar_counter', 'stove', 'anvil', 'toolrack',
    'crate_stack', 'sack', 'hay', 'lantern_in', 'candle', 'stairs_in', 'trapdoor', 'ladder_in',
    'banner_red', 'banner_blue', 'banner_green', 'banner_purple', 'banner_yellow', 'banner_white', 'banner_teal', 'banner_black'
  ], overlay: [
    'table', 'chair', 'bed', 'bed_foot', 'bookshelf', 'counter', 'shelf', 'fireplace_0',
    'fireplace_1', 'chimney', 'fence', 'fence_v', 'puddle_dry', 'sprout', 'vines', 'table_long_l',
    'table_long_r', 'stool', 'cupboard', 'wardrobe', 'painting', 'window_in', 'door_in', 'bar_counter',
    'stove', 'anvil', 'toolrack', 'crate_stack', 'sack', 'hay', 'lantern_in', 'candle',
    'stairs_in', 'trapdoor', 'ladder_in', 'banner_red', 'banner_blue', 'banner_green', 'banner_purple', 'banner_yellow',
    'banner_white', 'banner_teal', 'banner_black'
  ], extras: ['table_long_l', 'table_long_r', 'stool', 'cupboard', 'wardrobe', 'painting', 'window_in', 'door_in', 'bar_counter', 'stove', 'anvil', 'toolrack', 'crate_stack', 'sack', 'hay', 'lantern_in', 'candle', 'stairs_in', 'trapdoor', 'ladder_in', 'banner_red', 'banner_blue', 'banner_green', 'banner_purple', 'banner_yellow', 'banner_white', 'banner_teal', 'banner_black'],
    walkOver: ['trapdoor', 'stairs_in', 'ladder_in'] },
  // dungeons: caves, ruins, the four lighthouses, lava, pillars, ropes, the elemental plates and cave dressing
  { png: 'art/dungeons_tiles.png', names: [
    'cave', 'cave2', 'cavewall', 'cavewalltop', 'caveice', 'cavewallice', 'cavewalltopice', 'cavefire',
    'cavewallfire', 'cavewalltopfire', 'puddle_cave', 'crack', 'hole', 'pit', 'ruins_floor', 'ruins_wall',
    'ruins_walltop', 'lh_floor_venus', 'lh_wall_venus', 'lh_walltop_venus', 'lh_floor_mercury', 'lh_wall_mercury', 'lh_walltop_mercury', 'lh_floor_mars',
    'lh_wall_mars', 'lh_walltop_mars', 'lh_floor_jupiter', 'lh_wall_jupiter', 'lh_walltop_jupiter', 'lava_0', 'lava_1', 'lava_2',
    'lava_3', 'pillar', 'pillar_top', 'pillar_base', 'pillar_sunk', 'pillar_fallen', 'icepillar', 'rope',
    'ropeh', 'ladder', 'vineladder', 'elem_venus', 'elem_mercury', 'elem_mars', 'elem_jupiter', 'whirlwind',
    'teleporter_0', 'teleporter_1', 'teleporter_2', 'teleporter_3', 'crystal', 'crystal_large', 'altar', 'statue_ruins',
    'gate_closed', 'gate_open', 'portcullis', 'spikes', 'pressure_plate', 'button', 'torch_blue', 'torch_red'
  ], overlay: [
    'puddle_cave', 'crack', 'hole', 'pillar', 'pillar_top', 'pillar_base', 'icepillar', 'rope',
    'ropeh', 'ladder', 'vineladder', 'whirlwind', 'teleporter_0', 'teleporter_1', 'teleporter_2', 'teleporter_3',
    'crystal', 'crystal_large', 'altar', 'statue_ruins', 'gate_closed', 'gate_open', 'portcullis', 'spikes',
    'button', 'torch_blue', 'torch_red'
  ], alias: { whirlwind: 'tornado', gate_closed: 'door_locked' },
    extras: ['teleporter', 'crystal', 'crystal_large', 'altar', 'statue_ruins', 'gate_open', 'portcullis', 'spikes', 'pressure_plate', 'button', 'torch_blue', 'torch_red'], walkOver: ['teleporter', 'gate_open', 'pressure_plate'] },
  // lighthouse aeries: statues, rails, floor emblems and steps. The beacons themselves stay drawn in code - the
  // sheet drew each quarter as a whole brazier, so they do not join up as a 2x2
  { png: 'art/beacons_tiles.png', names: [
    'beacon_venus_tl', 'beacon_venus_tr', 'beacon_venus_bl', 'beacon_venus_br',
    'beacon_venus_lit_tl', 'beacon_venus_lit_tr', 'beacon_venus_lit_bl', 'beacon_venus_lit_br',
    'beacon_venus_flame_l_0', 'beacon_venus_flame_r_0', 'beacon_venus_flame_l_1', 'beacon_venus_flame_r_1',
    'beacon_mercury_tl', 'beacon_mercury_tr', 'beacon_mercury_bl', 'beacon_mercury_br',
    'beacon_mercury_lit_tl', 'beacon_mercury_lit_tr', 'beacon_mercury_lit_bl', 'beacon_mercury_lit_br',
    'beacon_mercury_flame_l_0', 'beacon_mercury_flame_r_0', 'beacon_mercury_flame_l_1', 'beacon_mercury_flame_r_1',
    'beacon_mars_tl', 'beacon_mars_tr', 'beacon_mars_bl', 'beacon_mars_br',
    'beacon_mars_lit_tl', 'beacon_mars_lit_tr', 'beacon_mars_lit_bl', 'beacon_mars_lit_br',
    'beacon_mars_flame_l_0', 'beacon_mars_flame_r_0', 'beacon_mars_flame_l_1', 'beacon_mars_flame_r_1',
    'beacon_jupiter_tl', 'beacon_jupiter_tr', 'beacon_jupiter_bl', 'beacon_jupiter_br',
    'beacon_jupiter_lit_tl', 'beacon_jupiter_lit_tr', 'beacon_jupiter_lit_bl', 'beacon_jupiter_lit_br',
    'beacon_jupiter_flame_l_0', 'beacon_jupiter_flame_r_0', 'beacon_jupiter_flame_l_1', 'beacon_jupiter_flame_r_1',
    'statue_venus', 'statue_mercury', 'statue_mars', 'statue_jupiter',
    'lh_pillar_top', 'lh_pillar_base', 'lh_window', 'lh_rail',
    'lh_rail_v', 'lh_floor_centre', 'lh_glyph_venus', 'lh_glyph_mercury',
    'lh_glyph_mars', 'lh_glyph_jupiter', 'lh_steps', 'lh_steps_side'
  ], overlay: [
    'beacon_venus_tl', 'beacon_venus_tr', 'beacon_venus_bl', 'beacon_venus_br',
    'beacon_venus_lit_tl', 'beacon_venus_lit_tr', 'beacon_venus_lit_bl', 'beacon_venus_lit_br',
    'beacon_venus_flame_l_0', 'beacon_venus_flame_r_0', 'beacon_venus_flame_l_1', 'beacon_venus_flame_r_1',
    'beacon_mercury_tl', 'beacon_mercury_tr', 'beacon_mercury_bl', 'beacon_mercury_br',
    'beacon_mercury_lit_tl', 'beacon_mercury_lit_tr', 'beacon_mercury_lit_bl', 'beacon_mercury_lit_br',
    'beacon_mercury_flame_l_0', 'beacon_mercury_flame_r_0', 'beacon_mercury_flame_l_1', 'beacon_mercury_flame_r_1',
    'beacon_mars_tl', 'beacon_mars_tr', 'beacon_mars_bl', 'beacon_mars_br',
    'beacon_mars_lit_tl', 'beacon_mars_lit_tr', 'beacon_mars_lit_bl', 'beacon_mars_lit_br',
    'beacon_mars_flame_l_0', 'beacon_mars_flame_r_0', 'beacon_mars_flame_l_1', 'beacon_mars_flame_r_1',
    'beacon_jupiter_tl', 'beacon_jupiter_tr', 'beacon_jupiter_bl', 'beacon_jupiter_br',
    'beacon_jupiter_lit_tl', 'beacon_jupiter_lit_tr', 'beacon_jupiter_lit_bl', 'beacon_jupiter_lit_br',
    'beacon_jupiter_flame_l_0', 'beacon_jupiter_flame_r_0', 'beacon_jupiter_flame_l_1', 'beacon_jupiter_flame_r_1',
    'statue_venus', 'statue_mercury', 'statue_mars', 'statue_jupiter',
    'lh_pillar_top', 'lh_pillar_base', 'lh_window', 'lh_rail',
    'lh_rail_v', 'lh_steps', 'lh_steps_side'
  ], ignorePrefix: 'beacon_', extras: ['statue_venus', 'statue_mercury', 'statue_mars', 'statue_jupiter', 'lh_pillar_top', 'lh_pillar_base', 'lh_window', 'lh_rail', 'lh_rail_v', 'lh_floor_centre', 'lh_glyph_venus', 'lh_glyph_mercury', 'lh_glyph_mars', 'lh_glyph_jupiter', 'lh_steps', 'lh_steps_side'],
    walkOver: ['lh_floor_centre', 'lh_glyph_venus', 'lh_glyph_mercury', 'lh_glyph_mars', 'lh_glyph_jupiter', 'lh_steps', 'lh_steps_side'] },
  // the beacons themselves, drawn whole at 32x32 and quartered on load: the brazier unlit and lit, and a two-frame
  // flame that rises over the bowl
  { png: 'art/beacons_big.png', cell: 32, names: [
    'beacon_venus', 'beacon_venus_lit', 'beacon_venus_flame_0', 'beacon_venus_flame_1',
    'beacon_mercury', 'beacon_mercury_lit', 'beacon_mercury_flame_0', 'beacon_mercury_flame_1',
    'beacon_mars', 'beacon_mars_lit', 'beacon_mars_flame_0', 'beacon_mars_flame_1',
    'beacon_jupiter', 'beacon_jupiter_lit', 'beacon_jupiter_flame_0', 'beacon_jupiter_flame_1'
  ] },
  // cliffs in three colours (the drawn pieces are raw material: the game assembles its own edge set from their rock
  // and rim), waterfalls, cliff stairs and ladders, bridges and stepping stones
  { png: 'art/cliffs_tiles.png', names: [
    'cliff_mid', 'cliff_n', 'cliff_s', 'cliff_e', 'cliff_w', 'cliff_ne', 'cliff_nw', 'cliff_se',
    'cliff_sw', 'cliff_ns', 'cliff_ew', 'cliff_in_ne', 'cliff_in_nw', 'cliff_in_se', 'cliff_in_sw', 'cliff_lone',
    'dcliff_mid', 'dcliff_n', 'dcliff_s', 'dcliff_e', 'dcliff_w', 'dcliff_ne', 'dcliff_nw', 'dcliff_se',
    'dcliff_sw', 'dcliff_ns', 'dcliff_ew', 'dcliff_in_ne', 'dcliff_in_nw', 'dcliff_in_se', 'dcliff_in_sw', 'dcliff_lone',
    'scliff_mid', 'scliff_n', 'scliff_s', 'scliff_e', 'scliff_w', 'scliff_ne', 'scliff_nw', 'scliff_se',
    'scliff_sw', 'scliff_ns', 'scliff_ew', 'scliff_in_ne', 'scliff_in_nw', 'scliff_in_se', 'scliff_in_sw', 'scliff_lone',
    'waterfall_top_0', 'waterfall_top_1', 'waterfall_mid_0', 'waterfall_mid_1', 'waterfall_foot_0', 'waterfall_foot_1', 'cliff_stairs', 'cliff_ladder',
    'rope_bridge', 'rope_bridge_v', 'log_bridge', 'log_bridge_v', 'stepping_stone', 'stump_stone', 'wooden_platform', 'wooden_platform_v'
  ], overlay: ['cliff_stairs', 'cliff_ladder', 'stepping_stone', 'stump_stone', 'wooden_platform', 'wooden_platform_v'],
    // the cliff pieces themselves are superseded by the whole-block sheet below and are left alone
    ignorePrefix: ['cliff_', 'dcliff_', 'scliff_'], alias: { cliff_stairs: 'rock_stairs', cliff_ladder: 'rock_ladder' },
    extras: ['waterfall_top', 'waterfall_mid', 'waterfall_foot', 'rock_stairs', 'rock_ladder', 'rope_bridge', 'rope_bridge_v', 'log_bridge', 'log_bridge_v', 'stepping_stone', 'stump_stone', 'wooden_platform', 'wooden_platform_v'],
    walkOver: ['rope_bridge', 'rope_bridge_v', 'log_bridge', 'log_bridge_v', 'stepping_stone', 'wooden_platform', 'wooden_platform_v', 'rock_stairs', 'rock_ladder'] },
  // the plants and props that give each region its look, and the dungeons' puzzle objects
  { png: 'art/nature_tiles.png', names: [
    'tree_red', 'tree_red_top', 'tree_red_bot', 'palm_top', 'palm_bot', 'tree_dead', 'tree_jungle', 'tree_willow',
    'bush_jungle', 'bush_flower', 'cactus', 'cactus_small', 'fern', 'flower_bed', 'grass_tuft', 'mushroom_big',
    'dune_rock', 'bones_desert', 'sand_pile', 'driftwood', 'boat_wreck', 'net_rack', 'anchor', 'crab_pot',
    'scarecrow', 'haystack', 'log_pile', 'stone_lantern', 'torii', 'totem', 'drum', 'campfire_0',
    'campfire_1', 'cauldron', 'bench_stone', 'wash_line', 'flower_pot_big', 'bird_bath', 'gravestone', 'signboard',
    'snow_pile', 'ice_boulder', 'pine_dead', 'mine_cart', 'rail', 'rail_v', 'lantern_post', 'cannon',
    'log_roll', 'log_roll_v', 'stake', 'rope_coil', 'dig_spot', 'sand_flow', 'cracked_ground', 'hover_pad',
    'fence_broken', 'fence_spike', 'banner_pole', 'flag', 'windmill', 'well_rope', 'wooden_sign', 'stone_marker'
  ], overlay: [
    'tree_red', 'tree_red_top', 'tree_red_bot', 'palm_top', 'palm_bot', 'tree_dead', 'tree_jungle', 'tree_willow',
    'bush_jungle', 'bush_flower', 'cactus', 'cactus_small', 'fern', 'flower_bed', 'grass_tuft', 'mushroom_big',
    'dune_rock', 'bones_desert', 'sand_pile', 'driftwood', 'boat_wreck', 'net_rack', 'anchor', 'crab_pot',
    'scarecrow', 'haystack', 'log_pile', 'stone_lantern', 'torii', 'totem', 'drum', 'campfire_0',
    'campfire_1', 'cauldron', 'bench_stone', 'wash_line', 'flower_pot_big', 'bird_bath', 'gravestone', 'signboard',
    'snow_pile', 'ice_boulder', 'pine_dead', 'mine_cart', 'lantern_post', 'cannon', 'log_roll', 'log_roll_v',
    'stake', 'rope_coil', 'dig_spot', 'hover_pad', 'fence_broken', 'fence_spike', 'banner_pole', 'flag',
    'windmill', 'well_rope', 'wooden_sign', 'stone_marker'
  ], extras: [
    'tree_red', 'tree_red_top', 'tree_red_bot', 'palm_top', 'palm_bot', 'tree_dead', 'tree_jungle', 'tree_willow',
    'bush_jungle', 'bush_flower', 'cactus', 'cactus_small', 'fern', 'flower_bed', 'grass_tuft', 'mushroom_big',
    'dune_rock', 'bones_desert', 'sand_pile', 'driftwood', 'boat_wreck', 'net_rack', 'anchor', 'crab_pot',
    'scarecrow', 'haystack', 'log_pile', 'stone_lantern', 'torii', 'totem', 'drum', 'campfire_0',
    'campfire_1', 'cauldron', 'bench_stone', 'wash_line', 'flower_pot_big', 'bird_bath', 'gravestone', 'signboard',
    'snow_pile', 'ice_boulder', 'pine_dead', 'mine_cart', 'rail', 'rail_v', 'lantern_post', 'cannon',
    'log_roll', 'log_roll_v', 'stake', 'rope_coil', 'dig_spot', 'sand_flow', 'cracked_ground', 'hover_pad',
    'fence_broken', 'fence_spike', 'banner_pole', 'flag', 'windmill', 'well_rope', 'wooden_sign', 'stone_marker'
  ], walkOver: ['dig_spot', 'sand_flow', 'cracked_ground', 'hover_pad', 'rail', 'rail_v', 'torii', 'flag', 'rope_coil', 'grass_tuft'] },
  // landmark buildings, drawn whole at 64x64 and cut into 4x4 tiles on load (name_r0c0 ... name_r3c3)
  { png: 'art/landmarks_big.png', cell: 64, names: ['sea_temple', 'kandorean_gate', 'gabomba_statue', 'lemurian_palace', 'izumo_shrine', 'alhafra_manor', 'madra_hall', 'prox_hall', 'loho_house', 'champa_cave_house', 'contigo_house', 'shaman_tent', 'garoh_cave_house', 'yallam_forge_house', 'kibombo_hut', 'venus_lh_gate'] },
  // fences as sets of pieces named by the sides they run through (the game picks the piece from the neighbours,
  // like the roads), with gates, a village arch, hedges and rope lines
  { png: 'art/fences_tiles.png', names: [
    'fence_o', 'fence_n', 'fence_s', 'fence_e', 'fence_w', 'fence_ns', 'fence_ew', 'fence_ne',
    'fence_nw', 'fence_se', 'fence_sw', 'fence_nse', 'fence_nsw', 'fence_new', 'fence_sew', 'fence_nsew',
    'swall_o', 'swall_n', 'swall_s', 'swall_e', 'swall_w', 'swall_ns', 'swall_ew', 'swall_ne',
    'swall_nw', 'swall_se', 'swall_sw', 'swall_nse', 'swall_nsw', 'swall_new', 'swall_sew', 'swall_nsew',
    'pfence_o', 'pfence_n', 'pfence_s', 'pfence_e', 'pfence_w', 'pfence_ns', 'pfence_ew', 'pfence_ne',
    'pfence_nw', 'pfence_se', 'pfence_sw', 'pfence_nse', 'pfence_nsw', 'pfence_new', 'pfence_sew', 'pfence_nsew',
    'fence_gate', 'fence_gate_open', 'fence_gate_v', 'swall_gate', 'pfence_gate', 'wooden_arch', 'wooden_arch_l', 'wooden_arch_r',
    'hedge_ew', 'hedge_ns', 'hedge_ne', 'hedge_nw', 'hedge_se', 'hedge_sw', 'rope_line_ew', 'rope_line_ns'
  ], overlay: [
    'fence_o', 'fence_n', 'fence_s', 'fence_e', 'fence_w', 'fence_ns', 'fence_ew', 'fence_ne',
    'fence_nw', 'fence_se', 'fence_sw', 'fence_nse', 'fence_nsw', 'fence_new', 'fence_sew', 'fence_nsew',
    'swall_o', 'swall_n', 'swall_s', 'swall_e', 'swall_w', 'swall_ns', 'swall_ew', 'swall_ne',
    'swall_nw', 'swall_se', 'swall_sw', 'swall_nse', 'swall_nsw', 'swall_new', 'swall_sew', 'swall_nsew',
    'pfence_o', 'pfence_n', 'pfence_s', 'pfence_e', 'pfence_w', 'pfence_ns', 'pfence_ew', 'pfence_ne',
    'pfence_nw', 'pfence_se', 'pfence_sw', 'pfence_nse', 'pfence_nsw', 'pfence_new', 'pfence_sew', 'pfence_nsew',
    'fence_gate', 'fence_gate_open', 'fence_gate_v', 'swall_gate', 'pfence_gate', 'wooden_arch', 'wooden_arch_l', 'wooden_arch_r',
    'hedge_ew', 'hedge_ns', 'hedge_ne', 'hedge_nw', 'hedge_se', 'hedge_sw', 'rope_line_ew', 'rope_line_ns'
  ], fenceSets: ['fence', 'swall', 'pfence'], extras: ['fence_gate', 'fence_gate_open', 'fence_gate_v', 'swall_gate', 'pfence_gate', 'wooden_arch', 'wooden_arch_l', 'wooden_arch_r', 'hedge_ew', 'hedge_ns', 'hedge_ne', 'hedge_nw', 'hedge_se', 'hedge_sw', 'rope_line_ew', 'rope_line_ns'],
    walkOver: ['fence_gate_open', 'wooden_arch', 'wooden_arch_l', 'wooden_arch_r'] },
  // cliffs drawn whole as 3x3 plateaus in six rock colours, cut into edge sets on load (these replace the
  // assembled set from the first cliff sheet), with notched blocks for inner corners and ramps and steps
  { png: 'art/cliff_blocks_big.png', cell: 48, names: [
    'cliff_block', 'pcliff_block', 'dcliff_block', 'scliff_block', 'vcliff_block', 'ccliff_block', 'cliff_notch', 'pcliff_notch',
    'dcliff_notch', 'scliff_notch', 'vcliff_notch', 'ccliff_notch', 'cliff_ramp', 'pcliff_ramp', 'cliff_stairs_block', 'scliff_ramp'
  ], cliffBlocks: ['cliff', 'pcliff', 'dcliff', 'scliff', 'vcliff', 'ccliff'] },
  // tall trees and big things, two tiles high, drawn whole at 32x32: name_tl/_tr hang over the player, _bl/_br are the base
  { png: 'art/tall_big.png', cell: 32, kind: 'tall', names: [
    'tree_tall', 'tree_red_tall', 'tree_gold_tall', 'pine_tall', 'palm_tall', 'jungle_tall', 'pinesnow_tall', 'dead_tall',
    'willow_tall', 'cherry_tall', 'boulder_big', 'rock_spire', 'statue_big', 'fountain_big', 'well_big', 'gate_arch_big'
  ] },
  // Golden Sun's landmarks: Sol Sanctum, Tret, the other lighthouse gates, the palaces, the Mt. Aleph boulder
  { png: 'art/landmarks2_big.png', cell: 64, names: ['sol_sanctum_gate', 'vale_sanctum', 'tret_tree', 'mercury_lh_gate', 'jupiter_lh_gate', 'mars_lh_gate', 'bilibin_palace', 'xian_dojo', 'lama_temple', 'kalay_palace', 'tolbi_palace', 'lunpa_fortress', 'colosso_gate', 'babi_lh_gate', 'tunnel_ruins_gate', 'boulder_huge'] }
];
