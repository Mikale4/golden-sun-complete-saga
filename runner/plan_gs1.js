// Golden Sun (part 1) playthrough plan for runner.js
// Each entry is [op, ...args]. See runner.js exec() for the ops.
window.PLAN_GS1 = [
  ['new'], ['shot', 'title_newgame'],
  // ---- Prologue: the storm in Vale ----
  ['idle'], ['shot', 'prologue_isaac_house'], ['expectMap', 'vale_past'],
  ['go', 13, 46], ['idle'], ['expect', 'storm_rock1'], ['shot', 'prologue_rockfall'],                               // the rocks come down across the road to the bridge
  ['talk', 'GaretNPC'], ['expect', 'garet_joined'], ['shot', 'prologue_garet'],
  ['go', 10, 21], ['idle'], ['expect', 'storm_bridge'], ['shot', 'prologue_boulder'], ['go', 5, 35], ['idle'], ['expect', 'storm_rock2'],   // over the upper bridge: the elders hold the Boulder; the west bank is blocked too
  ['enter', 'vale_west_past'], ['go', 22, 16], ['idle'], ['go', 16, 11], ['idle'], ['go', 8, 10], ['idle'], ['expect', 'storm_battle3'],   // along the terraces, three fixed fights
  ['talk', 'injured'], ['expect', 'storm_injured_done'],
  ['enter', 'vale_past'], ['go', 1, 66], ['idle'], ['expect', 'felix_seen'], ['shot', 'prologue_felix'],
  ['enter', 'vale_south_past'], ['go', 12, 47], ['idle'], ['expect', 'jenna_help'], ['shot', 'prologue_plaza'],
  ['enter', 'vale_past'], ['go', 13, 82], ['idle'], ['shot', 'prologue_after_battle'], ['expectMap', 'vale'], ['expect', 'prologue_done'],
  ['idle'], ['expect', 'vale_morning'], ['shot', 'vale_present'], ['expectParty', ['Isaac', 'Garet', 'Jenna']],
  ['enter', 'vale_west'], ['go', 24, 15], ['idle'], ['expect', 'vale_saturos_scene'],
  ['enter', 'vale_kraden_house'], ['shot', 'kraden_house'], ['talk', 'Kraden'], ['expect', 'sanctum_open'], ['expectParty', ['Isaac', 'Garet', 'Jenna']], ['enter', 'vale_west'],
  ['enter', 'vale'], ['enter', 'vale_south'], ['enter', 'vale_shop'], ['shop'], ['enter', 'vale_south'],
  ['enter', 'vale'], ['ckpt', 'vale_before_sanctum'],
  // ---- Sol Sanctum ----
  ['enter', 'sol_sanctum_1'], ['expect', 'sanctum_entered'], ['shot', 'sol_sanctum_1'],
  ['go', 44, 12], ['go', 30, 3], ['go', 3, 39], ['go', 4, 30], ['chest', 4, 7], ['shot', 'sol_hop2'],      // the first puzzle, the corridors round, the second puzzle, the jewel
  ['use', 9, 14], ['expect', 'sol_minotaur1'], ['go', 15, 8],                                              // the Minotaur's eye, the antechamber
  ['enter', 'sol_sanctum_hall'], ['go', 12, 20], ['expect', 'sanctum_hall_scene'], ['shot', 'sol_hall'],
  ['push', 'hall_statue_r', 3, 2], ['go', 22, 3],                                                          // the rightmost statue hides the stairs
  ['enter', 'sol_sanctum_maze'], ['chest', 6, 8], ['shot', 'sol_maze'],
  ['enter', 'sol_sanctum_mino'], ['go', 8, 7], ['expect', 'sanctum_mino_scene'], ['shot', 'sol_mino'],
  ['cast', 'Move', 2, 3, 3], ['use', 2, 2], ['expect', 'sol_minotaur2'], ['cast', 'Move', 22, 3, 3], ['go', 22, 1],   // the first statue aside, the jewel, the last statue aside
  ['enter', 'sol_sanctum_loop'], ['enter', 'sol_sanctum_2'], ['chest', 1, 11], ['go', 16, 10], ['expect', 'sanctum_sun_scene'], ['shot', 'sol_sun'],
  ['use', 16, 2], ['go', 39, 18], ['enter', 'sol_sanctum_statues'], ['go', 3, 4], ['expect', 'sanctum_statues_scene'],
  ['push', 'three_0', 0, 1], ['push', 'three_1', 0, 1], ['push', 'three_2', 0, 1], ['expect', 'sol_three_placed'],
  ['push', 'four_0', 2, 1], ['push', 'four_1', 1, 1], ['push', 'four_2', 2, 1], ['push', 'four_3', 1, 1], ['expect', 'sol_moon_placed'], ['shot', 'sol_statues'],
  ['enter', 'sol_sanctum_2'], ['enter', 'sol_sanctum_3'], ['go', 25, 18], ['expect', 'sanctum_chamber_intro'], ['shot', 'sol_sanctum_3'],
  ['use', 42, 28], ['expect', 'got_Venus Star'], ['use', 41, 8], ['expect', 'got_Mercury Star'], ['use', 11, 28], ['expect', 'got_Jupiter Star'],
  ['shot', 'sanctum_saturos'], ['use', 11, 7], ['expect', 'sanctum_done'], ['expectMap', 'vale'], ['shot', 'vale_after_sanctum'],
  // ---- Leaving Vale (Flint) ----
  ['enter', 'vale_inn'], ['inn'], ['enter', 'vale'],
  ['enter', 'world_gs1'], ['expect', 'left_vale_first'], ['expectMap', 'world_gs1'], ['shot', 'world_angara'], ['ckpt', 'world_first'],
  // ---- Vault ----
  ['world', 'vault'], ['shot', 'vault'], ['enter', 'vault_mayor'], ['talk', 'IvanNPC'], ['expectParty', ['Isaac', 'Garet', 'Ivan']], ['enter', 'vault'],
  ['enter', 'vault_weaponshop'], ['shop'], ['enter', 'vault'], ['enter', 'world_gs1'], ['grind', 5], ['world', 'vault'], ['enter', 'vault_weaponshop'], ['shop'], ['enter', 'vault'], ['enter', 'vault_inn'], ['inn'], ['ckpt', 'vault_pre_thieves'],
  ['enter', 'vault_inn_attic'], ['shot', 'vault_attic'], ['talk', 'thief1'], ['expect', 'vault_thieves_done'],
  ['enter', 'vault_inn'], ['inn'], ['enter', 'vault'], ['expectParty', ['Isaac', 'Garet']],
  ['ckpt', 'vault_done'], ['enter', 'world_gs1'], ['level', 4],
  // ---- Goma Cave -> Bilibin ----
  ['world', 'goma_out'], ['shot', 'goma_out'], ['go', 12, 4], ['idle'], ['expect', 'goma_ivan_scene'], ['expectParty', ['Isaac', 'Garet', 'Ivan']],
  ['enter', 'goma_left'], ['shot', 'goma_cave'], ['enter', 'goma_right'], ['push', 'goma_tall', DIR.RIGHT, 1], ['go', 24, 7], ['go', 24, 5], ['chest', 25, 4], ['expect', 'item:Lucky Medal'], ['go', 22, 6], ['push', 'goma_pillar', DIR.DOWN, 3], ['expect', 'goma_gate'], ['djinni', 'Forge'],
  ['enter', 'goma_left'], ['enter', 'goma_top'], ['enter', 'world_gs1'],
  ['world', 'bilibin'], ['shot', 'bilibin'], ['talk', 'bilibin_guard_r'], ['expect', 'mccoy_refused'], ['expect', 'barricade_hint'],
  ['enter', 'bilibin_weaponshop'], ['shop'], ['enter', 'bilibin'], ['enter', 'bilibin_itemshop'], ['shop'], ['enter', 'bilibin'], ['enter', 'bilibin_inn'], ['inn'], ['enter', 'bilibin'],
  ['go', 8, 25], ['cast', 'Whirlwind', 8, 24, DIR.UP], ['expect', 'bilibin_ivy_cleared'], ['go', 8, 24], ['expectMap', 'bilibin_gust_cave'], ['try', ['go', 6, 11]], ['idle'], ['go', 11, 4], ['push', 'gust_statue', DIR.RIGHT, 1], ['djinni', 'Gust'],
  ['go', 19, 12], ['idle'], ['expectMap', 'bilibin'], ['expect', 'bilibin_statue_moved'], ['ckpt', 'bilibin'], ['enter', 'world_gs1'],
  ['world', 'bilibin_barricade'], ['shot', 'barricade'], ['go', 7, 16], ['push', 'barricade_crate', DIR.UP, 1], ['go', 7, 14], ['go', 23, 9], ['expectMap', 'world_gs1'], ['ckpt', 'barricade'],
  // ---- Kolima Forest / Tret ----
  ['level', 7], ['world', 'kolima'], ['enter', 'world_gs1'], ['go', 107, 38], ['use', 108, 38], ['expect', 'item:Turtle Boots'], ['world', 'kolima'], ['shot', 'kolima'], ['go', 4, 16], ['expect', 'kolima_arrived'], ['enter', 'kolima_house_e'], ['enter', 'kolima_cave'], ['shot', 'kolima_cave'], ['go', 18, 16], ['go', 18, 15], ['expectMap', 'kolima'], ['djinni', 'Granite'],
  ['go', 22, 20], ['expectMap', 'kolima_cave'], ['go', 12, 17], ['go', 12, 16], ['expectMap', 'kolima_house_e'], ['enter', 'kolima'], ['enter', 'kolima_weaponshop'], ['shop'], ['enter', 'kolima'], ['ckpt', 'kolima'], ['enter', 'world_gs1'],
  // the first screen: the leftmost log rolled into the narrow stretch of the stream is the only bridge across it
  ['world', 'kolima_forest'], ['shot', 'kolima_forest'], ['go', 14, 38], ['expect', 'kforest_entered'], ['roll', 'log_left', DIR.LEFT], ['go', 16, 18], ['go', 1, 7], ['enter', 'kolima_forest_w'], ['shot', 'kforest_w'],
  // the second: the first log rolled left off the corridor, the lower one rolled down out of the way, the third left alone; the Nut in the tree
  ['roll', 'log_a', DIR.LEFT], ['try', ['cast', 'Catch', 19, 18, DIR.UP]], ['go', 20, 24], ['roll', 'log_b', DIR.DOWN], ['go', 5, 26], ['go', 5, 5], ['go', 19, 3], ['enter', 'kolima_forest_n'], ['shot', 'kforest_n'],
  ['roll', 'log_upper', DIR.UP], ['roll', 'log_first', DIR.LEFT], ['go', 7, 21], ['go', 7, 18], ['go', 8, 8], ['go', 30, 5], ['enter', 'kolima_forest_pond'], ['shot', 'kforest_pond'],
  // the pond: drained, the logs rolled on its bed; filled, they float and bridge the water - first to the Fur Coat's ledge, then, rolled again, to the ledge with the way on
  ['lever', 'kf_sluice'], ['idle'], ['expect', 'kf_pond_drained'], ['roll', 'log_v2', DIR.RIGHT], ['roll', 'log_h2', DIR.DOWN], ['go', 16, 16], ['lever', 'kf_sluice'], ['idle'], ['go', 17, 13], ['go', 21, 8], ['chest', 23, 7], ['expect', 'item:Fur Coat'], ['go', 17, 13],
  ['lever', 'kf_sluice'], ['idle'], ['expect', 'kf_pond_drained'], ['roll', 'log_v2', DIR.LEFT], ['roll', 'log_h1', DIR.DOWN], ['roll', 'log_v1', DIR.LEFT], ['go', 16, 16], ['lever', 'kf_sluice'], ['idle'], ['go', 10, 13], ['go', 10, 4], ['enter', 'kolima_forest_top'], ['shot', 'tret_clearing'], ['go', 8, 20], ['expect', 'tret_clearing'], ['talk', 'Laurel'], ['ckpt', 'tret_clearing'],
  ['go', 22, 13], ['go', 22, 5], ['enter', 'tret_room_5'], ['shot', 'tret_inside'], ['go', 3, 1], ['idle'], ['expectMap', 'tret_room_4'], ['go', 16, 8], ['expectMap', 'tret_branches'], ['shot', 'tret_branches'],
  ['go', 42, 24], ['go', 42, 18], ['go', 26, 18], ['expectMap', 'tret_room_3'], ['chest', 8, 6], ['use', 5, 3], ['go', 13, 1], ['idle'], ['expectMap', 'tret_room_2'], ['go', 8, 13], ['go', 8, 14], ['expectMap', 'tret_branches'],
  ['go', 37, 16], ['go', 37, 6], ['go', 44, 6], ['go', 44, 2], ['djinni', 'Breeze'], ['go', 44, 6], ['go', 26, 6], ['expectMap', 'tret_room_1'], ['chest', 13, 4],
  ['go', 14, 8], ['go', 12, 8], ['go', 10, 8], ['go', 8, 8], ['go', 8, 7], ['go', 8, 8], ['idle'], ['expectMap', 'tret_heart'], ['expect', 'tret_beaten'], ['shot', 'tret_beaten'],
  ['go', 15, 4], ['expectMap', 'tret_room_5'], ['enter', 'kolima_forest_top'], ['enter', 'world_gs1'], ['ckpt', 'tret_beaten'],
  // ---- the hunting grounds north of the forest (class item: the Hunter's Talisman, off the Tusked Mauler) ----
  ['enter', 'kolima_forest_n'], ['enter', 'hunt_grounds'], ['shot', 'hunt_grounds'], ['psyat', 'Whirlwind', 'hg_bush1'], ['psyat', 'Whirlwind', 'hg_bush2'], ['chest', 17, 8], ['healhere'], ['talk', 'boss_mauler'], ['idle'], ['expect', 'mauler_done'], ['expect', "item:Hunter's Talisman"], ['shot', 'mauler_beaten'],
  ['cast', 'Grapple', 12, 13, DIR.RIGHT], ['chest', 20, 13], ['cast', 'Grapple', 16, 13, DIR.LEFT], ['enter', 'kolima_forest_n'], ['enter', 'kolima_forest'], ['enter', 'world_gs1'], ['ckpt', 'hunt_grounds'],
  // ---- Imil / Mercury Lighthouse ----
  // ---- Bilibin Cave: the pass under the mountain to Imil (the Elven Rapier's ledge and the fires wait for Growth, Douse and Reveal) ----
  ['level', 10], ['world', 'bilibin_cave'], ['shot', 'bilibin_cave'], ['enter', 'bilibin_cave_1'], ['shot', 'bilibin_cave_1'], ['enter', 'bilibin_cave_2'], ['shot', 'bilibin_cave_2'],
  ['push', 'bc_torch', 0, 1], ['push', 'bc_torch', 2, 1], ['expect', 'bc_ice_melted'], ['chest', 27, 2], ['enter', 'world_gs1'],
  ['world', 'imil'], ['shot', 'imil'], ['go', 17, 28], ['expect', 'imil_arrived'], ['enter', 'imil_weaponshop'], ['shop'], ['enter', 'imil'], ['enter', 'imil_inn'], ['inn'], ['enter', 'imil'],
  ['enter', 'imil_sanctum'], ['talk', 'justin'], ['expect', 'imil_kids'], ['enter', 'imil'], ['enter', 'imil_mia_house'], ['chest', 9, 4], ['talk', 'MiaNPC'], ['expect', 'mia_left_for_lh'], ['enter', 'imil'],
  ['go', 17, 4], ['push', 'imil_snowman', DIR.LEFT, 1], ['go', 13, 4], ['enter', 'imil_falls_cave'], ['djinni', 'Fever'], ['enter', 'imil'], ['go', 17, 5], ['go', 20, 8], ['ckpt', 'imil_done'], ['enter', 'world_gs1'],
  ['world', 'mercury_lh_out'], ['shot', 'mercury_lh_out'], ['go', 14, 19], ['idle'], ['expect', 'mia_lh_door_scene'], ['push', 'lh_door_statue', DIR.LEFT, 1], ['idle'], ['expect', 'mia_lh_door'],
  ['enter', 'mercury_lh_hall'], ['shot', 'mercury_lh_hall'], ['go', 7, 6], ['idle'], ['expect', 'lh_lizard_done'], ['enter', 'mercury_lh_corr'], ['enter', 'mercury_lh_stairs'], ['shot', 'mercury_lh_stairs'],
  ['go', 5, 12], ['idle'], ['expect', 'mia_statue_scene'], ['cast', 'Move', 9, 12, DIR.RIGHT], ['idle'], ['expectParty', ['Isaac', 'Garet', 'Ivan', 'Mia']], ['ckpt', 'mia_joined'],
  ['enter', 'mercury_lh_pipes'], ['shot', 'mercury_lh_pipes'], ['push', 'lh_pipe1', DIR.UP, 1], ['expect', 'lh_pipe1_seated'], ['push', 'lh_pipe2', DIR.RIGHT, 1], ['expect', 'lh_pipe2_seated'], ['chest', 9, 11],
  ['enter', 'mercury_lh_pillar'], ['shot', 'mercury_lh_pillar'], ['push', 'lh_pillar', DIR.LEFT, 3], ['expect', 'lh_pillar_set'], ['go', 16, 6], ['go', 18, 6], ['enter', 'mercury_lh_goddess'], ['shot', 'mercury_lh_goddess'],
  ['go', 7, 10], ['go', 7, 8], ['go', 7, 6], ['go', 7, 5], ['cast', 'Ply', 7, 3, DIR.UP], ['expect', 'mercury_ply'], ['shot', 'mercury_ply'], ['go', 5, 5], ['go', 2, 3],
  ['enter', 'mercury_lh_cross'], ['shot', 'mercury_lh_cross'], ['enter', 'mercury_lh_falls3'], ['shot', 'mercury_lh_falls3'], ['chest', 14, 3], ['chest', 27, 8], ['idle'], ['expect', 'mercury_lh_falls3:chest:27,8'],   // the Water of Life may go straight onto whoever fell in the tower
  ['go', 29, 2], ['go', 29, 1], ['expectMap', 'mercury_lh_armor'], ['chest', 15, 3], ['enter', 'mercury_lh_falls3'], ['go', 13, 2], ['go', 13, 1], ['expectMap', 'mercury_lh_pool'], ['shot', 'mercury_lh_pool'],
  ['go', 13, 19], ['go', 13, 21], ['go', 3, 21], ['go', 3, 13], ['chest', 6, 10], ['go', 3, 13], ['go', 3, 21], ['go', 25, 21], ['go', 25, 4], ['go', 25, 3], ['enter', 'mercury_lh_fallsb'],
  ['go', 22, 2], ['go', 22, 1], ['expectMap', 'mercury_lh_pipeline'], ['shot', 'mercury_lh_pipeline'], ['push', 'lh_switch_statue', DIR.RIGHT, 3], ['expect', 'lh_switch_down'],
  ['enter', 'mercury_lh_nut'], ['push', 'lh_nut_statue2', DIR.RIGHT, 1], ['chest', 7, 3], ['enter', 'mercury_lh_pipeline'], ['enter', 'mercury_lh_fallsmany'], ['shot', 'mercury_lh_fallsmany'],
  ['go', 14, 2], ['go', 14, 1], ['expectMap', 'mercury_lh_sleet'], ['djinni', 'Sleet'], ['enter', 'mercury_lh_fallsmany'], ['go', 26, 2], ['go', 26, 1], ['expectMap', 'mercury_lh_rainbow'], ['shot', 'mercury_lh_rainbow'],
  ['cast', 'Ply', 10, 4, DIR.RIGHT], ['expect', 'lh_rainbow'], ['ckpt', 'hermes'], ['go', 7, 5], ['go', 7, 4], ['expectMap', 'mercury_lh_top'], ['shot', 'mercury_lh_top'], ['heal'], ['use', 23, 12],
  ['go', 23, 16], ['go', 20, 16], ['go', 16, 16], ['go', 14, 16], ['idle'], ['expect', 'mercury_lit'], ['shot', 'mercury_lit'],
  ['heal'], ['go', 23, 19], ['go', 23, 20], ['expectMap', 'mercury_lh_rainbow'], ['enter', 'mercury_lh_out'], ['use', 14, 26], ['expect', 'hermes_water'], ['ckpt', 'mercury_done'], ['enter', 'world_gs1'],
  // ---- back to Tret, Kolima bridge ----
  ['world', 'imil'], ['enter', 'imil_inn'], ['inn'], ['enter', 'imil'], ['enter', 'world_gs1', 13, 29],
  ['world', 'kolima_forest'], ['go', 16, 18], ['go', 1, 7], ['enter', 'kolima_forest_w'], ['go', 20, 24], ['go', 5, 26], ['go', 5, 5], ['go', 19, 3], ['enter', 'kolima_forest_n'], ['go', 30, 5], ['enter', 'kolima_forest_pond'], ['go', 10, 13], ['go', 10, 4], ['enter', 'kolima_forest_top'], ['talk', 'TretFace'], ['enter', 'tret_room_5'], ['go', 8, 8], ['idle'], ['expectMap', 'tret_heart'], ['talk', 'Tret'], ['expect', 'tret_cured'], ['shot', 'tret_cured'], ['go', 15, 4], ['enter', 'kolima_forest_top'], ['enter', 'world_gs1'],
  ['world', 'bilibin'], ['enter', 'bilibin_palace'], ['enter', 'bilibin_palace_2'], ['talk', 'McCoy'], ['expect', 'mccoy_reward'], ['enter', 'bilibin_palace'], ['enter', 'bilibin_palace_cellar'], ['use', 9, 3], ['expect', 'mccoy_chest'], ['enter', 'bilibin_palace'], ['enter', 'bilibin'], ['enter', 'world_gs1'],
  ['world', 'kolima_bridge'], ['shot', 'kolima_bridge'], ['go', 10, 8], ['idle'], ['expect', 'kolima_bridge_fixed'], ['ckpt', 'bridge'], ['enter', 'world_gs1', 10, 25],
  // ---- Fuchin / Mogall / Xian ----
  ['level', 13], ['world', 'fuchin'], ['shot', 'fuchin'], ['enter', 'fuchin_hall'], ['cast', 'Mind Read', 6, 4, DIR.UP], ['idle'], ['expect', 'nyunpa_trial'], ['enter', 'fuchin'],
  ['go', 16, 26], ['go', 10, 23], ['enter', 'fuchin_cave_1'], ['shot', 'fuchin_cave_1'], ['ride', 'fc1_right', DIR.UP], ['chest', 19, 3], ['idle'], ['expect', 'item:Game Ticket'],
  ['enter', 'fuchin_cave_5'], ['shot', 'fuchin_cave_5'], ['ride', 'fc5_v', DIR.RIGHT], ['djinni', 'Zephyr'], ['ride', 'fc5_v', DIR.LEFT], ['ride', 'fc5_h', DIR.UP], ['enter', 'fuchin_cave_6'], ['use', 7, 4], ['expect', "item:Dragon's Eye"],
  ['enter', 'fuchin_cave_5'], ['ride', 'fc5_h', DIR.DOWN], ['enter', 'fuchin_cave_1'], ['ride', 'fc1_right', DIR.DOWN], ['ride', 'fc1_left', DIR.UP], ['enter', 'fuchin_cave_2'], ['shot', 'fuchin_cave_2'],
  ['ride', 'fc2_b', DIR.UP], ['chest', 3, 3], ['ride', 'fc2_b', DIR.DOWN], ['ride', 'fc2_a', DIR.UP], ['enter', 'fuchin_cave_3'], ['shot', 'fuchin_cave_3'], ['use', 3, 2], ['expect', 'fuchin_dragon_eye'], ['chest', 20, 3], ['expect', 'item:Orb of Force'], ['shot', 'fuchin_orb'],
  ['enter', 'fuchin_cave_2'], ['ride', 'fc2_a', DIR.DOWN], ['enter', 'fuchin_cave_1'], ['ride', 'fc1_left', DIR.DOWN], ['enter', 'fuchin'], ['enter', 'fuchin_hall'], ['talk', 'Nyunpa'], ['expect', 'nyunpa_done'], ['enter', 'fuchin'], ['enter', 'world_gs1'],
  ['world', 'mogall'], ['shot', 'mogall'], ['go', 11, 4], ['expect', 'mogall_entered'], ['enter', 'mogall_b'], ['enter', 'mogall_c'], ['enter', 'mogall_h'], ['enter', 'mogall_i'], ['enter', 'mogall_g'], ['shot', 'mogall_logs'],
  ['roll', 'log_g2', DIR.UP], ['roll', 'log_g1', DIR.RIGHT], ['try', ['cast', 'Catch', 3, 6, DIR.UP]], ['try', ['cast', 'Force', 4, 12, DIR.UP]], ['go', 9, 8], ['go', 12, 2], ['enter', 'mogall_i'], ['enter', 'mogall_h'], ['enter', 'mogall_j'], ['push', 'mj_rock', DIR.RIGHT, 2], ['roll', 'log_j1', DIR.DOWN], ['go', 13, 10], ['djinni', 'Quartz'], ['try', ['cast', 'Force', 6, 5, DIR.UP]], ['heal'], ['enter', 'mogall_boss'], ['trig', 'STORY.killerApe'], ['expect', 'killer_ape_done'], ['shot', 'killer_ape'], ['ckpt', 'mogall'], ['enter', 'mogall'],
  // ---- the wolves' den under the forest (class item: the Wolf Fang Pendant, off the Matriarch); Prowl into the east cave for its chest ----
  ['enter', 'mogall_den'], ['shot', 'mogall_den'], ['chest', 2, 13], ['psyat', 'Whirlwind', 'md_bush'], ['healhere'], ['talk', 'boss_matriarch'], ['idle'], ['expect', 'matriarch_done'], ['expect', 'item:Wolf Fang Pendant'], ['shot', 'matriarch_beaten'],
  ['cast', 'Prowl', 8, 5, DIR.UP], ['chest', 17, 2], ['go', 8, 6], ['enter', 'mogall'], ['ckpt', 'mogall_den'], ['enter', 'world_gs1'],
  ['world', 'xian'], ['shot', 'xian'], ['enter', 'xian_weaponshop'], ['shop'], ['enter', 'xian'], ['enter', 'xian_inn'], ['inn'], ['enter', 'xian'], ['enter', 'xian_dojo'], ['cast', 'Force', 7, 6, 3], ['expect', 'feh_force_done'], ['shot', 'xian_dojo'], ['enter', 'xian'], ['talk', 'Feizhi'], ['expect', 'feizhi_done'], ['talk', 'xian_water'], ['expect', 'xian_hollow_wet'], ['cast', 'Frost', 22, 15, 2], ['djinni', 'Mist'],
  // ---- the shrine off the Silk Road (class item: the Assassin's Mask, off the Shadow) ----
  ['enter', 'silk_shrine'], ['shot', 'silk_shrine'], ['cast', 'Force', 9, 8, DIR.UP], ['chest', 2, 2], ['chest', 17, 2], ['healhere'], ['talk', 'boss_shadow'], ['idle'], ['expect', 'shadow_done'], ['expect', "item:Assassin's Mask"], ['cast', 'Shadow Step', 9, 6, DIR.UP], ['chest', 9, 5], ['enter', 'xian'], ['ckpt', 'silk_shrine'], ['enter', 'world_gs1'],
  // ---- Alpine crossing / Altin ----
  ['world', 'alpine'], ['shot', 'alpine'], ['djinni', 'Corona'], ['enter', 'world_gs1'],
  ['level', 15], ['world', 'altin'], ['shot', 'altin'], ['enter', 'altin_weaponshop'], ['shop'], ['enter', 'altin'], ['enter', 'altin_inn'], ['inn'], ['enter', 'altin'],
  ['enter', 'altin_mine_1'], ['shot', 'altin_mine_1'], ['use', 3, 3], ['expect', 'altin_statue1'], ['lever', 'am1_switch'], ['expect', 'altin_points'], ['use', 19, 9], ['idle'], ['expect', 'am1_cart_up'], ['djinni', 'Spritz'], ['chest', 21, 4], ['use', 19, 4], ['idle'],
  ['enter', 'altin_mine_2'], ['shot', 'altin_mine_2'], ['use', 3, 3], ['expect', 'altin_statue2'], ['chest', 23, 8], ['cast', 'Force', 21, 2, 3], ['idle'], ['expect', 'altin_gap'], ['shot', 'altin_boulder'], ['go', 21, 1], ['idle'],
  ['expectMap', 'altin_mine_3'], ['shot', 'altin_mine_3'], ['chest', 22, 15], ['chest', 25, 17], ['heal'], ['use', 10, 23], ['expect', 'hydros_done'], ['shot', 'hydros'],
  // ---- the deep shaft below the mine (class item: the Miner's Lantern, off the Ore Golem); Lantern for the dark, Grapple over the chasm ----
  ['enter', 'altin_shaft'], ['shot', 'altin_shaft'], ['chest', 2, 16], ['cast', 'Lift', 10, 9, DIR.UP], ['chest', 5, 6], ['healhere'], ['talk', 'boss_ore_golem'], ['idle'], ['expect', 'ore_golem_done'], ['expect', "item:Miner's Lantern"], ['shot', 'ore_golem_beaten'],
  ['try', ['cast', 'Lantern', 6, 2, DIR.UP]], ['cast', 'Grapple', 9, 1, DIR.RIGHT], ['chest', 14, 1], ['chest', 17, 6], ['cast', 'Grapple', 11, 1, DIR.LEFT], ['enter', 'altin_mine_3'], ['ckpt', 'altin_shaft'], ['cast', 'Lift', 8, 7, 3], ['chest', 8, 6], ['enter', 'altin_mine_2'], ['cast', 'Lift', 8, 4, 3], ['chest', 8, 3], ['enter', 'altin_mine_3'], ['idle'], ['cast', 'Lift', 4, 22, 1], ['ckpt', 'altin_done'],
  ['enter', 'altin'], ['enter', 'altin_inn'], ['inn'], ['enter', 'altin'], ['enter', 'world_gs1'],
  // ---- Lama / Lamakan / Kalay ----
  ['world', 'lama'], ['shot', 'lama'], ['enter', 'lama_hall'], ['talk', 'Hama'], ['expect', 'reveal_learned'], ['enter', 'lama'], ['enter', 'world_gs1'],
  // ---- Alpine Crossing: Hsu under the boulder (Reveal shows the way onto the ledge, Lift frees him), then Hama again ----
  ['world', 'alpine'], ['cast', 'Reveal', 9, 15, 3], ['go', 9, 14], ['talk', 'HamaNPC'], ['cast', 'Lift', 5, 14, 0], ['expect', 'hsu_rescued'], ['shot', 'hsu_rescued'], ['enter', 'world_gs1'],
  ['world', 'lama'], ['enter', 'lama_hall'], ['talk', 'Hama'], ['expect', 'hama_told'], ['teacher', 'master_poi', 'poi_done', 3], ['expect', 'poi_done'], ['expect', "item:Monk's Prayer Beads"],   /* the class item: Master Poi's beads, for standing a round against him */ ['enter', 'lama'], ['enter', 'world_gs1'],
  ['level', 17], ['world', 'lamakan'], ['shot', 'lamakan'], ['trig', 'STORY.lamakanEnter'], ['expect', 'lamakan_entered'], ['chest', 5, 6], ['oasis', 5, 9], ['enter', 'lamakan_tunnel_1'], ['enter', 'lamakan_2'], ['shot', 'lamakan_2'], ['oasis', 14, 7], ['djinni', 'Smog'], ['chest', 4, 7], ['oasis', 22, 28],
  ['enter', 'lamakan_tunnel_2'], ['enter', 'lamakan_3'], ['shot', 'lamakan_3'], ['oasis', 28, 14], ['chest', 4, 5], ['djinni', 'Vine'], ['oasis', 6, 25], ['heal'], ['trig', 'STORY.manticore'], ['expect', 'manticore_done'], ['shot', 'manticore'], ['ckpt', 'lamakan'], ['enter', 'world_gs1'],
  ['world', 'kalay'], ['shot', 'kalay'], ['enter', 'kalay_weaponshop'], ['shop'], ['enter', 'kalay'], ['enter', 'kalay_armory'], ['shop'], ['enter', 'kalay'], ['enter', 'kalay_inn'], ['inn'], ['teacher', 'dorian', 'dorian_done', 3], ['expect', 'dorian_done'], ['expect', "item:Bard's Lyre"],   /* the class item: Dorian's lyre, won in a duel of songs */ ['enter', 'kalay'],
  ['enter', 'kalay_palace'], ['talk', 'Layana'], ['expect', 'layana_met'], ['enter', 'kalay'], ['enter', 'world_gs1'],
  ['world', 'kalay_tunnel'], ['shot', 'kalay_tunnel'], ['enter', 'kalay_tunnel_cave'], ['shot', 'kalay_tunnel_cave'], ['enter', 'kalay_tunnel_1'], ['shot', 'kalay_tunnel_1'], ['enter', 'kalay_tunnel_2'], ['shot', 'kalay_tunnel_2'], ['chest', 2, 15], ['enter', 'kalay_tunnel_1', 10, 26], ['enter', 'kalay_tunnel_cave'], ['enter', 'kalay_tunnel'], ['enter', 'world_gs1'], ['world', 'kalay'], ['enter', 'kalay_tunnel_2'], ['djinni', 'Scorch'], ['enter', 'kalay'], ['enter', 'world_gs1'],
  // ---- Kalay docks -> ship -> Tolbi ----
  // ---- Some backtracking (the guide's chapter 8): Vale Cave for Kite, Vault's graveyard for Sap, the back way into Lunpa ----
  ['world', 'vale_south'], ['enter', 'vale'], ['enter', 'vale_isaac_house'], ['talk', 'dora_home'], ['expect', 'dora_revisit'], ['enter', 'vale'], ['enter', 'vale_garet_house'], ['talk', 'garet_mom'], ['expect', 'garet_revisit'], ['enter', 'vale'], ['enter', 'world_gs1'],
  ['world', 'vale_south'], ['enter', 'vale'], ['enter', 'vale_west'], ['cast', 'Lift', 4, 13, 3], ['enter', 'vale_north'], ['enter', 'vale_cave'], ['shot', 'vale_cave'], ['chest', 3, 1], ['chest', 1, 12], ['push', 'vc_crate_1', 2, 1], ['cast', 'Reveal', 16, 8, 2], ['go', 17, 8], ['chest', 21, 12], ['haltnpc', 'KiteNPC'], ['expect', 'kite_caught'], ['enter', 'vale_north'], ['enter', 'vale_west'], ['enter', 'world_gs1'],
  ['world', 'bilibin_cave'], ['enter', 'bilibin_cave_1'], ['cast', 'Douse', 22, 22, 3], ['expect', 'bc_fire1_out'], ['go', 22, 19], ['chest', 24, 17], ['cast', 'Reveal', 25, 15, 3], ['go', 25, 15], ['expect', 'bc_hidden_seen'], ['enter', 'bilibin_cave_3'], ['cast', 'Douse', 4, 3, 3], ['expect', 'bc_fire2_out'], ['chest', 1, 1], ['chest', 7, 1], ['enter', 'bilibin_cave_1'], ['enter', 'bilibin_cave'], ['enter', 'world_gs1'],
  ['world', 'vault'], ['use', 17, 3], ['expect', 'vault_bell'], ['cast', 'Reveal', 13, 23, 3], ['go', 13, 23], ['expectMap', 'vault_cave'], ['shot', 'vault_cave'], ['chest', 6, 11], ['chest', 24, 14], ['djinni', 'Sap'], ['enter', 'vault'], ['enter', 'world_gs1'],
  ['world', 'kalay_docks'], ['shot', 'kalay_docks'], ['djinni', 'Ground'], ['enter', 'kalay_docks_house'], ['talk', 'dh'], ['expect', 'item:Boat Ticket'], ['enter', 'kalay_docks'], ['heal'], ['talk', 'dock_captain'], ['expectMap', 'ship_deck'], ['shot', 'ship_deck'], ['talk', 'ship_captain'], ['expect', 'charm_missing'],
  ['enter', 'ship_nest'], ['use', 1, 1], ['enter', 'ship_deck'], ['enter', 'ship_room'], ['shot', 'ship_room'], ['use', 10, 6], ['enter', 'ship_deck'], ['talk', 'ship_captain'], ['expect', 'charm_returned'],
  ['enter', 'ship_hold'], ['shot', 'ship_hold'], ['use', 1, 7], ['talk', 'rowing_master'], ['expect', 'crew_met'], ['enter', 'ship_deck'], ['heal'], ['talk', 'ship_captain'], ['expect', 'kraken_done'], ['expectMap', 'tolbi_docks'], ['shot', 'tolbi_docks'], ['use', 23, 12], ['push', 'td_crate_r', 3, 3], ['chest', 3, 1], ['ckpt', 'tolbi_arrival'], ['enter', 'world_gs1', 0, 16], ['world', 'tolbi'],
  ['expectMap', 'tolbi'], ['shot', 'tolbi'], ['enter', 'tolbi_weaponshop'], ['shop'], ['enter', 'tolbi'], ['enter', 'tolbi_inn'], ['inn'], ['enter', 'tolbi'],
  ['enter', 'tolbi_yard'], ['talk', 'Iodem'], ['expect', 'babi_missing'], ['enter', 'tolbi_palace'], ['talk', 'ShebaCaptive'], ['enter', 'colosso_tribune'], ['idle'], ['expect', 'colosso_qual_seen'], ['shot', 'colosso_tribune'], ['enter', 'tolbi_palace'], ['enter', 'tolbi_yard'], ['enter', 'tolbi'], ['enter', 'world_gs1'],
  // ---- Altmiller Cave: the unseen figure, the five stones, the Mystic Draught, Lord Babi ----
  ['go', 26, 70], ['djinni', 'Hail'],
  ['level', 21], ['world', 'altmiller'], ['shot', 'altmiller'], ['chest', 15, 13], ['enter', 'altmiller_2'], ['shot', 'altmiller_2'], ['enter', 'altmiller_3'], ['chest', 20, 10], ['chest', 4, 25], ['enter', 'altmiller_4'], ['shot', 'altmiller_4'], ['talk', 'BabiCave'], ['expect', 'babi_asked'], ['cast', 'Frost', 8, 8, DIR.UP], ['djinni', 'Squall'], ['heal'], ['enter', 'altmiller_5'], ['chest', 12, 8], ['enter', 'altmiller_6'], ['shot', 'altmiller_6'], ['enter', 'altmiller_7'], ['use', 3, 7], ['use', 7, 6], ['use', 11, 7], ['use', 5, 6], ['use', 9, 6], ['expect', 'altmiller_lights'], ['enter', 'altmiller_8'], ['chest', 4, 2], ['enter', 'altmiller_7'], ['enter', 'altmiller_6'], ['enter', 'altmiller_5'], ['enter', 'altmiller_4'], ['talk', 'BabiCave'], ['expect', 'babi_found'], ['enter', 'world_gs1'],
  // ---- Colosso: three courses, three fights; Isaac collapses and wakes in the palace; Babi's tale, the Cloak Ball ----
  ['world', 'tolbi'], ['djinni', 'Ember'], ['heal'], ['enter', 'tolbi_yard'], ['enter', 'colosso'], ['shot', 'colosso'],
  ['talk', 'colosso_ref'], ['expectMap', 'colosso_r1'], ['shot', 'colosso_r1'], ['go', 6, 5], ['try', ['cast', 'Move', 8, 5, 2]], ['go', 16, 5], ['go', 24, 5], ['go', 33, 5], ['try', ['cast', 'Move', 35, 5, 2]], ['go', 44, 5], ['expectMap', 'colosso'],
  ['talk', 'colosso_ref'], ['expectMap', 'colosso_r2'], ['go', 6, 5], ['try', ['cast', 'Move', 8, 5, 2]], ['go', 16, 5], ['go', 25, 5], ['go', 29, 5], ['go', 42, 5], ['try', ['cast', 'Move', 44, 5, 2]], ['go', 53, 5], ['expectMap', 'colosso'],
  ['talk', 'colosso_ref'], ['expectMap', 'colosso_r3'], ['go', 7, 5], ['go', 15, 5], ['try', ['cast', 'Move', 17, 5, 2]], ['go', 25, 5], ['go', 33, 5], ['go', 42, 5], ['try', ['cast', 'Move', 44, 5, 2]], ['go', 47, 5], ['go', 62, 5], ['expectMap', 'tolbi_bedroom'], ['expect', 'colosso_woke'], ['shot', 'tolbi_bedroom'],
  ['enter', 'tolbi_palace'], ['talk', 'Babi'], ['expect', 'babi_permission'], ['use', 13, 5], ['expect', 'cloak_ball_taken'], ['enter', 'tolbi_yard'], ['teacher', 'brannock', 'brannock_done', 3], ['expect', 'brannock_done'], ['expect', "item:Gladiator's Emblem"], ['cast', 'Shove', 23, 5, DIR.RIGHT], ['chest', 23, 5],   /* the class item: the champion's emblem, and Shove for the crate on the chest */ ['enter', 'tolbi'], ['ckpt', 'colosso'],
  ['fountain'], ['try', ['enter', 'tolbi_lucky']], ['wheel'], ['try', ['enter', 'tolbi']], ['enter', 'tolbi_inn'], ['inn'], ['enter', 'tolbi'], ['ckpt', 'babi_permission'], ['enter', 'world_gs1'],
  // ---- Rescuing Master Hammet (the guide's chapter 12): the back way into Lunpa with the Cloak Ball, Dodonpa's fortress ----
  ['world', 'west_lunpa_cave'], ['shot', 'west_lunpa_cave'], ['chest', 2, 2], ['cast', 'Frost', 20, 4, 2], ['expect', 'lunpa_gate_propped'], ['enter', 'lunpa'], ['enter', 'world_gs1'],
  ['level', 19], ['world', 'lunpa'], ['shot', 'lunpa'], ['cast', 'Cloak', 8, 9, 3], ['enter', 'lunpa_yard'], ['enter', 'lunpa_fortress'], ['shot', 'lunpa_fortress'], ['enter', 'lunpa_fortress_2'], ['shot', 'lunpa_fortress_2'], ['djinni', 'Tonic'], ['enter', 'lunpa_fortress_3'], ['chest', 4, 12], ['heal'], ['talk', 'Dodonpa'], ['expect', 'hammet_freed'], ['shot', 'dodonpa'], ['enter', 'lunpa_fortress_2'], ['enter', 'lunpa_fortress'], ['enter', 'lunpa_yard'], ['enter', 'lunpa'], ['enter', 'lunpa_inn'], ['inn'], ['enter', 'lunpa'], ['enter', 'lunpa_weaponshop'], ['shop'], ['enter', 'lunpa'],
  // the thieves' secret cavern above the north gate, then out by the west cave to Hammet and Bunza's wagon, and Hammet at home in Kalay
  ['cast', 'Frost', 11, 5, 2], ['go', 11, 2], ['cast', 'Reveal', 10, 2, 1], ['go', 10, 2], ['idle'], ['expectMap', 'lunpa_secret'], ['shot', 'lunpa_secret'], ['chest', 2, 2], ['chest', 4, 2], ['chest', 6, 2], ['chest', 8, 2], ['chest', 10, 2], ['chest', 6, 5], ['enter', 'lunpa'], ['ckpt', 'lunpa'],
  // ---- Tolo the cutpurse (class item: the Thief's Bandana); Lockpick on the chest behind him ----
  ['enter', 'lunpa_inn'], ['teacher', 'tolo', 'tolo_done', 3], ['expect', 'tolo_done'], ['expect', "item:Thief's Bandana"], ['cast', 'Lockpick', 12, 2, DIR.UP], ['enter', 'lunpa'],
  ['enter', 'west_lunpa_cave'], ['go', 1, 8], ['idle'], ['expect', 'hammet_rescued'], ['expectMap', 'kalay'], ['shot', 'bunza_kalay'], ['enter', 'kalay_palace'], ['talk', 'HammetHome'], ['expect', 'hammet_hesperia'], ['enter', 'kalay'], ['enter', 'world_gs1'],
  // ---- Gondowan: Suhalla -> Desert -> Gate -> Lalivero ----
  ['world', 'gondowan_passage'], ['shot', 'gondowan_passage'], ['enter', 'world_gs1'],
  ['world', 'suhalla'], ['shot', 'suhalla'], ['enter', 'suhalla_inn'], ['inn'], ['enter', 'suhalla'], ['enter', 'world_gs1'],
  ['level', 23], ['world', 'suhalla_desert'], ['shot', 'suhalla_desert'], ['djinni', 'Flash'], ['heal'], ['trig', 'STORY.stormLizard'], ['expect', 'storm_lizard_done'], ['ckpt', 'storm_lizard'],
  ['enter', 'world_gs1', 16, 127], ['world', 'suhalla_gate'], ['shot', 'suhalla_gate'],   // out of the desert's south mouth, east along the world to the Gate ['talk', 'gate_guard1'], ['expect', 'gate_opened'], ['chest', 23, 18], ['djinni', 'Dew'], ['enter', 'gateway_cave'], ['shot', 'gateway_cave'], ['trig', 'STORY.gatewayWreck'], ['expect', 'gateway_wreck'], ['chest', 3, 9], ['enter', 'suhalla_gate'], ['enter', 'world_gs1'],
  ['world', 'lalivero'], ['shot', 'lalivero'], ['enter', 'lalivero_weaponshop'], ['shop'], ['enter', 'lalivero'], ['enter', 'lalivero_inn'], ['inn'], ['enter', 'lalivero'], ['djinni', 'Torch'],
  ['enter', 'lalivero_faran'], ['talk', 'Faran'], ['expect', 'sheba_kidnapped'], ['enter', 'lalivero'], ['ckpt', 'lalivero'],
  // ---- Babi's workshop under the reservoir (class item: the Engineer's Goggles, off the Clockwork Sentinel); Repair for the bridge and the pump ----
  ['enter', 'lalivero_reservoir'], ['enter', 'babi_workshop'], ['shot', 'babi_workshop'], ['cast', 'Move', 10, 8, DIR.UP, DIR.UP], ['cast', 'Move', 10, 7, DIR.UP, DIR.UP], ['chest', 2, 5], ['chest', 19, 5], ['healhere'], ['talk', 'boss_clockwork'], ['idle'], ['expect', 'clockwork_done'], ['expect', "item:Engineer's Goggles"], ['shot', 'clockwork_beaten'],
  ['cast', 'Repair', 10, 3, DIR.UP], ['chest', 10, 1], ['cast', 'Repair', 3, 9, DIR.RIGHT], ['expect', 'bw_pump'], ['enter', 'lalivero_reservoir'], ['enter', 'lalivero'], ['ckpt', 'babi_workshop'], ['enter', 'world_gs1'],
  // ---- Venus Lighthouse (front is sealed) -> Babi Lighthouse -> Tunnel Ruins ----
  ['world', 'venus_forest'], ['shot', 'venus_forest'], ['enter', 'venus_lh_1'], ['shot', 'venus_lh_1'], ['trig', 'STORY.venusDeadEnd'], ['enter', 'venus_forest'], ['enter', 'world_gs1'],
  ['level', 26], ['world', 'babi_lh'], ['shot', 'babi_lh'], ['enter', 'babi_ravine'], ['djinni', 'Luff'], ['enter', 'babi_lh'], ['enter', 'babi_lh_1'], ['enter', 'babi_lh_2'], ['lever', 'babi_lever'], ['expect', 'babi_gate'], ['enter', 'babi_lh_3'], ['shot', 'babi_lh_3'],
  ['enter', 'tunnel_ruins'], ['shot', 'tunnel_ruins'],
  ['enter', 'venus_lh_2'], ['shot', 'venus_lh_2'], ['trig', 'STORY.venusInnerEnter'], ['expect', 'venus_inner_entered'],
  ['push', 'vp1', 3, 8], ['push', 'vp2', 3, 8], ['expect', 'venus_gate'], ['ckpt', 'venus_gate'],
  // ---- Crossbone Isle (the guide's Appendix C), with Carry in hand: the tornado at the desert's end carries the
  // party there and back. Up the west face on three vines, the Nut, the slides to the 1 Coin and the Mint, Whirlwind
  // on the bush, then nine doors and nine puzzle floors down to Deadbeard's ship ----
  ['world', 'suhalla_desert'], ['use', 23, 68], ['idle'], ['try', ['use', 23, 68]], ['idle'], ['expectMap', 'crossbone'], ['shot', 'crossbone'],
  ['cast', 'Growth', 3, 22, 3], ['go', 3, 19], ['cast', 'Growth', 3, 16, 3], ['go', 3, 13], ['cast', 'Growth', 3, 11, 3], ['go', 3, 9], ['cast', 'Catch', 25, 2, 3], ['expect', 'item:Nut'],
  ['try', ['go', 15, 10]], ['idle'], ['chest', 15, 12], ['try', ['go', 15, 16]], ['idle'], ['go', 3, 9], ['try', ['go', 21, 10]], ['idle'], ['roll', 'cb_log', 3], ['chest', 23, 11], ['try', ['go', 21, 16]], ['idle'],
  ['go', 3, 9], ['try', ['go', 8, 10]], ['idle'], ['cast', 'Whirlwind', 8, 11, 3], ['expect', 'cb_mouth_open'], ['enter', 'crossbone_path'], ['shot', 'crossbone_path'], ['enter', 'crossbone_l1'],
  // B1: the hopping tiles
  ['use', 12, 6], ['expect', 'cb_guard_1'], ['enter', 'crossbone_b1'], ['shot', 'crossbone_b1'], ['chest', 24, 6], ['cast', 'Move', 6, 6, 1], ['chest', 2, 6], ['cast', 'Move', 6, 16, 1], ['chest', 2, 16], ['cast', 'Move', 20, 16, 2], ['chest', 24, 16], ['chest', 14, 12],
  ['cast', 'Move', 12, 6, 3], ['enter', 'crossbone_l1', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l2'],
  // B2: the poles about the Mystery Blade
  ['use', 12, 6], ['expect', 'cb_guard_2'], ['enter', 'crossbone_b2'], ['shot', 'crossbone_b2'], ['chest', 22, 2], ['chest', 22, 12], ['chest', 12, 18], ['roll', 'cb2_vd', 2], ['roll', 'cb2_vc', 2], ['roll', 'cb2_hb', 0], ['chest', 2, 10],
  ['enter', 'crossbone_l2', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l3'],
  // B3: the keys
  ['use', 12, 6], ['expect', 'cb_guard_3'], ['enter', 'crossbone_b3'], ['shot', 'crossbone_b3'], ['cast', 'Catch', 7, 8, 3], ['cast', 'Catch', 16, 6, 3], ['cast', 'Catch', 20, 12, 3], ['cast', 'Catch', 5, 15, 3],
  ['use', 4, 2], ['chest', 4, 1], ['use', 9, 2], ['chest', 9, 1], ['use', 14, 2], ['chest', 14, 1], ['use', 19, 2], ['chest', 19, 1], ['cast', 'Reveal', 22, 6, 3], ['cast', 'Catch', 22, 6, 3], ['expect', 'item:Red Key'], ['use', 2, 3], ['enter', 'crossbone_l3', 1, 3],
  ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l4'],
  // B4: the watching statues, passed in the Cloak
  ['use', 12, 6], ['expect', 'cb_guard_4'], ['enter', 'crossbone_b4'], ['shot', 'crossbone_b4'], ['cast', 'Cloak', 12, 12, 3], ['chest', 12, 1], ['cast', 'Cloak', 12, 5, 3], ['chest', 24, 6], ['cast', 'Cloak', 12, 5, 3], ['chest', 4, 6],
  ['go', 3, 17], ['cast', 'Cloak', 3, 16, 3], ['chest', 4, 1], ['enter', 'crossbone_l4', 2, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l5'],
  // B5: the poles and the drained pool
  ['use', 12, 6], ['expect', 'cb_guard_5'], ['enter', 'crossbone_b5'], ['shot', 'crossbone_b5'], ['chest', 8, 1], ['roll', 'cb5_vb', 2], ['chest', 2, 2], ['roll', 'cb5_va', 2], ['chest', 2, 11], ['lever', 'cb5_lever'], ['idle'], ['expect', 'cb5_drained'], ['chest', 22, 2],
  ['enter', 'crossbone_l5', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l6'],
  // B6: Bane
  ['use', 12, 6], ['expect', 'cb_guard_6'], ['enter', 'crossbone_b6'], ['shot', 'crossbone_b6'], ['push', 'cb6_p3', DIR.LEFT, 1], ['go', 21, 4], ['chest', 24, 1], ['cast', 'Frost', 4, 5, 1], ['chest', 1, 5], ['cast', 'Move', 12, 7, DIR.UP], ['cast', 'Move', 12, 6, DIR.UP], ['chest', 12, 4], ['cast', 'Move', 12, 17, 2], ['chest', 12, 14],
  ['haltnpc', 'BaneNPC'], ['expect', 'bane_caught'], ['enter', 'crossbone_l6', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l7'],
  // B7: the block Carried into the gaps
  ['use', 12, 6], ['expect', 'cb_guard_7'], ['enter', 'crossbone_b7'], ['shot', 'crossbone_b7'], ['chest', 20, 1], ['cast', 'Carry', 12, 19, 3], ['cast', 'Carry', 2, 7, 3], ['chest', 2, 1], ['cast', 'Carry', 2, 7, 3],
  ['cast', 'Carry', 17, 12, 2], ['chest', 24, 12], ['cast', 'Carry', 17, 12, 2], ['cast', 'Carry', 5, 16, 1], ['chest', 1, 16], ['enter', 'crossbone_l7', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l8'],
  // B8: the puddles frozen over the cracks
  ['use', 12, 6], ['expect', 'cb_guard_8'], ['enter', 'crossbone_b8'], ['shot', 'crossbone_b8'], ['go', 12, 8], ['cast', 'Frost', 4, 4, 1], ['chest', 1, 4], ['cast', 'Frost', 20, 4, 2], ['chest', 24, 4], ['chest', 16, 1],
  ['try', ['go', 5, 9]], ['idle'], ['cast', 'Move', 8, 18, 1], ['chest', 1, 18], ['enter', 'crossbone_l8', 12, 0], ['cast', 'Move', 12, 11, 3], ['enter', 'crossbone_l9'],
  // B9: the poles afloat
  ['use', 12, 6], ['expect', 'cb_guard_9'], ['enter', 'crossbone_b9'], ['shot', 'crossbone_b9'], ['chest', 12, 4], ['ride', 'cb9_h1', 2], ['chest', 19, 8], ['ride', 'cb9_h1', 1], ['ride', 'cb9_v2', 3], ['chest', 2, 1], ['ride', 'cb9_v2', 0],
  ['ride', 'cb9_v1', 3], ['chest', 22, 1], ['enter', 'crossbone_l9', 12, 0], ['cast', 'Move', 12, 11, 3],
  // B10: the pirate ship
  ['healhere'], ['enter', 'crossbone_ship'], ['shot', 'crossbone_ship'], ['chest', 13, 9], ['enter', 'crossbone_cabin'], ['talk', 'boss_Deadbeard'], ['try', ['expect', 'deadbeard_done']], ['healhere'], ['try', ['enter', 'crossbone_cabin']], ['try', ['talk', 'boss_Deadbeard']], ['try', ['chest', 5, 1]], ['shot', 'deadbeard'], ['ckpt', 'crossbone_done'],
  ['enter', 'crossbone_ship'], ['enter', 'crossbone_l9'], ['enter', 'crossbone_l8'], ['enter', 'crossbone_l7'], ['enter', 'crossbone_l6'], ['enter', 'crossbone_l5'], ['enter', 'crossbone_l4'], ['enter', 'crossbone_l3'], ['enter', 'crossbone_l2'], ['enter', 'crossbone_l1'], ['enter', 'crossbone_path'], ['enter', 'crossbone'],
  ['try', ['go', 8, 16]], ['idle'], ['go', 12, 32], ['idle'], ['expectMap', 'suhalla_desert'],
  // ---- the Heart of Aleph under Sol Sanctum, with all twenty-eight Djinn (class item: the Crown of Sol, off the Colossus - harder than Deadbeard); Grapple over the chasm ----
  ['heal'], ['enter', 'sol_sanctum_statues'], ['enter', 'aleph_heart'], ['expectMap', 'aleph_heart'], ['shot', 'aleph_heart'], ['cast', 'Grapple', 11, 8, DIR.UP], ['chest', 3, 3], ['chest', 20, 3], ['healhere'], ['talk', 'boss_colossus'], ['idle'], ['expect', 'colossus_done'], ['expect', 'item:Crown of Sol'], ['shot', 'colossus_beaten'],
  ['cast', 'Grapple', 11, 7, DIR.DOWN], ['psy', 'Retreat'], ['idle'], ['ckpt', 'aleph_heart'],
  ['world', 'babi_lh'], ['enter', 'babi_lh_1'], ['enter', 'babi_lh_2'], ['enter', 'babi_lh_3'], ['enter', 'tunnel_ruins'], ['enter', 'venus_lh_2'],
  ['heal'], ['enter', 'venus_lh_top'], ['shot', 'venus_lh_top'], ['trig', 'STORY.venusAerie'], ['expect', 'venus_lit'], ['shot', 'venus_aerie_end'],
  // The Lost Age opens in Jenna's hands: down the Lighthouse's hall, Babi's soldiers outside, the Ruffians on the
  // road to Suhalla Gate and in the crevice, Gateway Cave's ant and stone, and Idejima tearing loose
  ['expectMap', 'venus_lh_1'], ['shot', 'tla_prologue'], ['go', 11, 26], ['idle'], ['expectMap', 'venus_forest'], ['expect', 'prologue_out'], ['shot', 'tla_soldiers'],
  ['enter', 'world_gs1'], ['world', 'suhalla_gate'], ['go', 104, 29], ['expect', 'prologue_ruffian_1'], ['go', 99, 29], ['expect', 'prologue_ruffian_2'], ['go', 95, 28], ['expect', 'prologue_ruffian_3'],
  ['enter', 'gateway_cave'], ['go', 10, 2], ['expect', 'gateway_ant'], ['use', 10, 1], ['enter', 'idejima'], ['idle'],
  ['expectMap', 'idejima'], ['expectParty', ['Felix', 'Jenna', 'Sheba', 'Kraden']], ['shot', 'tla_idejima'], ['ckpt', 'tla_start'],
];
'plan gs1 loaded';
