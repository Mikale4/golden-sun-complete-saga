// Golden Sun: The Lost Age playthrough plan for runner.js (continues after PLAN_GS1's 'tla_start' checkpoint)
// the Sea of Time: n laps deasil round a trunk = its north, east, south and west sides in turn, ending on the north
window.SOT_LAPS = (N, E, S, W, n) => { const out = []; for (let i = 0; i < n; i++) out.push(['go', N[0], N[1]], ['go', E[0], E[1]], ['go', S[0], S[1]], ['go', W[0], W[1]]); out.push(['go', N[0], N[1]], ['idle']); return out; };
window.SOT_CALM = () => { const t = Engine.frame % 440; return t >= 240 && t < 252; };   // the first frames of the waves' lull
window.TR_F = (k) => () => Math.floor(Engine.frame / 90) % 3 === k && Engine.frame % 90 < 40;   // Trial Road's fountains: the k-th one is up, and freshly
window.TW_PAST = (id, x, dx) => () => { const o = G.map.objects.find(ob => ob.id === id && !ob.gone); return !o || (o.dx === dx && (dx > 0 ? o.x > x : o.x < x)); };   // a whirlwind has gone past column x, moving away (dx)
window.PLAN_TLA = [
  // ---- Idejima -> Daila ----
  ['idle'], ['expectMap', 'idejima'], ['shot', 'idejima_prologue_done'],
  ['enter', 'world_tla'], ['expectMap', 'world_tla'], ['shot', 'world_indra'],
  ['world', 'daila'], ['trig', 'TLA.dailaArrive'], ['expect', 'daila_arrived'], ['shot', 'daila'],
  ['enter', 'daila_weaponshop'], ['shop'], ['enter', 'daila'], ['shop'],   // the item seller keeps a stall in the square
  ['trig', 'TLA.echoJoins'], ['expect', 'echo_joined'], ['enter', 'daila_inn'], ['inn'], ['enter', 'daila'], ['ckpt', 'daila'], ['enter', 'world_tla'],
  // ---- Kandorean Temple (Lash) ----
  ['level', 6], ['world', 'kandorean'], ['shot', 'kandorean'], ['enter', 'kandorean_inner'], ['shot', 'kandorean_inner'], ['talk', 'KandoreanMaster'], ['expect', 'lash_got'],
  ['go', 4, 21], ['go', 4, 20], ['expectMap', 'kandorean_cave'], ['shot', 'kandorean_cave'], ['trig', 'TLA.chestbeater'], ['expect', 'chestbeater_done'],
  ['psyat', 'Lash', 'kan_rope'], ['djinni', 'Fog'], ['enter', 'kandorean_b'], ['chest', 6, 8], ['expect', 'item:Mysterious Card'], ['enter', 'kandorean_cave'], ['enter', 'kandorean_inner'], ['enter', 'kandorean'], ['ckpt', 'kandorean_done'], ['enter', 'world_tla'],
  // ---- Dehkan Plateau (Pound) ----
  ['world', 'dehkan'], ['shot', 'dehkan'], ['chest', 2, 4], ['go', 13, 12], ['expectMap', 'dehkan_c1'], ['shot', 'dehkan_c1'], ['chest', 15, 7], ['enter', 'dehkan'],
  ['chest', 43, 3], ['enter', 'dehkan_mid'], ['shot', 'dehkan_mid'], ['chest', 7, 30], ['enter', 'dehkan_east'], ['shot', 'dehkan_east'],
  ['trig', 'TLA.cannonDjinni'], ['go', 28, 9], ['expectMap', 'dehkan_c7'], ['shot', 'dehkan_c7'], ['djinni', 'Cannon'], ['chest', 6, 8], ['enter', 'dehkan_east'],
  ['go', 47, 4], ['expectMap', 'dehkan_c8'], ['shot', 'dehkan_c8'], ['enter', 'dehkan_c11'], ['enter', 'dehkan_c12'], ['chest', 15, 7], ['enter', 'dehkan_c13'], ['chest', 4, 6], ['enter', 'dehkan_c10'], ['enter', 'dehkan_east'],
  ['cast', 'Pound', 49, 44, 0], ['ckpt', 'dehkan_done'], ['enter', 'world_tla', 51, 47],
  // ---- Madra ----
  ['world', 'madra'], ['idle'], ['expect', 'madra_gate_checked'], ['shot', 'madra'], ['shop', 'madra_stall_weapon'], ['shop', 'madra_stall_armor'], ['shop', 'madra_stall_item'], ['enter', 'madra_inn'], ['inn'], ['enter', 'madra_inn_up'], ['enter', 'madra'], ['chest', 14, 7], ['enter', 'madra_inn_up'], ['enter', 'madra_inn'], ['enter', 'madra'],
  ['enter', 'madra_mayor'], ['talk', 'madra_daughter'], ['use', 8, 1], ['enter', 'madra'], ['enter', 'madra_prison'], ['idle'], ['expect', 'madra_jail_seen'], ['shot', 'madra_prison'], ['talk', 'PiersJail'], ['enter', 'madra'], ['expect', 'madra_permission'], ['ckpt', 'madra'],
  // the catacombs, the first time: in behind the graves, through the far caves to the old town's ledge, the pillar
  // shoved into the gap, the temple's side door, down to the bottom and up one room for the Tremor Bit; out by the
  // temple's main door, the lower level, the first cave and the watch's ladder
  ['enter', 'madra_cave_c'], ['shot', 'madra_cave_c'], ['chest', 4, 6], ['enter', 'madra_cave_b'], ['shot', 'madra_cave_b'], ['enter', 'madra_village'], ['shot', 'madra_village'],
  ['cast', 'Move', 30, 2, 1, 0], ['enter', 'madra_ruins_1', 4, 2], ['shot', 'madra_ruins_1'], ['enter', 'madra_ruins_b1', 2, 14], ['shot', 'madra_ruins_b1'], ['enter', 'madra_ruins_b2'], ['shot', 'madra_ruins_b2'], ['chest', 8, 3], ['expect', 'item:Tremor Bit'],
  ['enter', 'madra_ruins_b1'], ['enter', 'madra_ruins_1', 2, 3], ['enter', 'madra_village', 12, 16], ['shot', 'madra_village_low'], ['enter', 'madra_cave_a'], ['shot', 'madra_cave_a'], ['enter', 'madra'], ['ckpt', 'madra_tremor'], ['enter', 'world_tla'],
  // ---- Osenia: cliffs, Yampi, Alhafra ----
  ['level', 9], ['world', 'madra_bridge'], ['try', ['trig', 'TLA.drawbridge']], ['expect', 'madra_bridge_told'], ['shot', 'madra_bridge'], ['enter', 'osenia_cliffs'], ['shot', 'osenia_cliffs'], ['go', 18, 14], ['go', 18, 12], ['cast', 'Lash', 18, 9, 3], ['chest', 18, 6], ['expect', 'osenia_cliffs:chest:18,6'], ['enter', 'world_tla', 36, 23],
  // Yampi Desert, first pass: the pole and the ring, the Madrans at the spring, the pillars and Blitz, the scorpion
  // woken on two screens and trapped on the third, the pit and the King Scorpion, the Scoop Gem, out by the puddle
  ['world', 'yampi_1'], ['shot', 'yampi_1'], ['pound', 'yd1_pole'], ['chest', 44, 34], ['enter', 'yampi_2'], ['shot', 'yampi_2'], ['talk', 'yd_meg3'], ['enter', 'yampi_3'], ['shot', 'yampi_3'],
  // ---- the Scorpion Den under the sand (class item: the Nomad's Veil, off the Scorpion Queen); Sandstorm for the side chambers ----
  ['enter', 'scorpion_den'], ['shot', 'scorpion_den'], ['pound', 'sd_pillar'], ['chest', 2, 2], ['chest', 19, 2], ['healhere'], ['talk', 'boss_scorpion_queen'], ['idle'], ['expect', 'scorpion_queen_done'], ['expect', "item:Nomad's Veil"], ['shot', 'scorpion_queen_beaten'],
  ['cast', 'Sandstorm', 6, 12, DIR.LEFT], ['chest', 3, 6], ['cast', 'Sandstorm', 15, 12, DIR.RIGHT], ['chest', 18, 10], ['chest', 18, 6], ['enter', 'yampi_3'], ['ckpt', 'scorpion_den'],
  ['pound', 'yd3_p1'], ['pound', 'yd3_p2'], ['chest', 38, 20], ['pound', 'yd3_p4'], ['djinni', 'Blitz'], ['enter', 'yampi_s1'], ['shot', 'yampi_s1'], ['pound', 'yds1_col'], ['enter', 'yampi_s2'], ['pound', 'yds2_col'], ['enter', 'yampi_s3'], ['shot', 'yampi_s3'],
  ['heal'], ['scorpion'], ['shot', 'scorpion_trapped'], ['trig', 'TLA.scorpionNear'], ['idle'], ['expectMap', 'yampi_pit'], ['expect', 'king_scorpion_done'], ['shot', 'king_scorpion'], ['ckpt', 'yampi'],
  ['psyat', 'Scoop', 'ydpit_puddle'], ['go', 7, 6], ['idle'], ['expectMap', 'world_tla'],
  // the second pass: the puddle by the spring, the tunnel to the plateau behind the Madrans, the north screen, the
  // slide cave, the eastern screens and out toward Alhafra
  ['world', 'yampi_1'], ['enter', 'yampi_2'], ['psyat', 'Scoop', 'yd2_puddle'], ['go', 8, 30], ['idle'], ['expectMap', 'yampi_tunnel'], ['shot', 'yampi_tunnel'], ['enter', 'yampi_2', 23, 3], ['trig', 'TLA.yampiMadrans'], ['expect', 'yampi_madrans_moved'],
  ['enter', 'yampi_7'], ['shot', 'yampi_7'], ['psyat', 'Scoop', 'yd7_coins'], ['enter', 'yampi_cave_in'], ['shot', 'yampi_cave_in'], ['pound', 'ydc_pillar'], ['chest', 40, 10], ['enter', 'yampi_8'], ['shot', 'yampi_8'], ['enter', 'yampi_9'], ['shot', 'yampi_9'],
  ['psyat', 'Lash', 'yd9_rope'], ['chest', 6, 9], ['ckpt', 'yampi_east'], ['enter', 'world_tla', 56, 0],   // out by the north way, up the top of the upper sand: Alhafra along the coast
  // Alhafra: the Madrans arrive behind the party, the stalls, Alex upstairs at the inn, the wharf and the ship;
  // below deck the eavesdropping and the fight with Briggs; the stores' box (Tremor) and the Large Bread for the
  // crying boy, which opens the caves' back door: Pound and Lash to the three chests; the jail and Chaucha's visit
  ['world', 'alhafra'], ['idle'], ['expect', 'alhafra_arrived'], ['shot', 'alhafra'], ['shop', 'alh_stall_weapon'], ['shop', 'alh_stall_armor'], ['enter', 'alhafra_item'], ['shop'], ['enter', 'alhafra'],
  ['enter', 'alhafra_inn'], ['inn'], ['enter', 'alhafra_inn_up'], ['talk', 'AlexInn'], ['enter', 'alhafra_inn'], ['enter', 'alhafra'],
  ['enter', 'alhafra_east'], ['shot', 'alhafra_east'], ['go', 8, 26], ['idle'], ['heal'], ['enter', 'alhafra_ship_cabin'], ['idle'], ['expect', 'briggs_caught'], ['shot', 'briggs_caught'],
  ['enter', 'alhafra_ship_back'], ['cast', 'Tremor', 6, 5, 2], ['expect', 'item:Large Bread'], ['enter', 'alhafra_ship_cabin'], ['enter', 'alhafra_east'], ['go', 20, 23], ['idle'], ['expect', 'alhafra_mast_seen'], ['enter', 'alhafra'],
  ['talk', 'alh_boy'], ['expect', 'alhafra_boy_fed'], ['enter', 'alhafra_cave_1'], ['enter', 'alhafra_cave'], ['shot', 'alhafra_cave'], ['pound', 'ac_pillar'], ['psyat', 'Lash', 'ac_rope'], ['chest', 29, 21], ['chest', 31, 23], ['chest', 29, 25], ['enter', 'alhafra_cave_1'], ['enter', 'alhafra'],
  ['enter', 'alhafra_jail'], ['idle'], ['expect', 'alhafra_jail_scene'], ['shot', 'alhafra_jail'], ['enter', 'alhafra'], ['enter', 'alhafra_mayor'], ['talk', 'alh_mayor'], ['enter', 'alhafra'], ['enter', 'alhafra_inn'], ['inn'], ['enter', 'alhafra'], ['ckpt', 'briggs'], ['enter', 'world_tla'],
  // ---- Mikasalla, the field with Sour, Osenia Cavern (Megaera) ----
  // back into the desert's east end and down the wind-cut slide (one way) to the southern gap: Air's Rock, Garoh and Mikasalla lie beyond it
  ['level', 13], ['world', 'yampi_9'], ['drop', 58, 43], ['enter', 'yampi_10'], ['shot', 'yampi_10'], ['enter', 'world_tla', 16, 22], ['world', 'mikasalla'], ['shot', 'mikasalla'], ['shop', 'mik_smith'], ['enter', 'mikasalla_inn'], ['inn'], ['enter', 'mikasalla'],
  ['psyat', 'Scoop', 'mik_dig'], ['go', 4, 8], ['idle'], ['expectMap', 'mikasalla_under'], ['enter', 'mikasalla_yard'], ['djinni', 'Spark'], ['enter', 'mikasalla_under'], ['enter', 'mikasalla'],
  ['go', 22, 12], ['go', 22, 8], ['go', 21, 5], ['enter', 'mikasalla_north'], ['chest', 8, 2], ['enter', 'mikasalla'], ['ckpt', 'mikasalla'], ['enter', 'world_tla'],
  ['world', 'osenia_cavern'], ['shot', 'osenia_cavern'], ['psyat', 'Scoop', 'oc_dig'], ['go', 17, 9], ['idle'], ['expectMap', 'osenia_cavern_low'], ['enter', 'osenia_cavern_tablet'], ['use', 4, 2], ['expect', 'megaera_taken'], ['enter', 'osenia_cavern_low'], ['enter', 'osenia_cavern'], ['enter', 'world_tla'],
  // ---- Garoh / Air's Rock (Reveal) ----
  // Garoh by night: the stair, the werewolf at the pond, the village in hoods, Maha out of the boulder and gone
  ['world', 'garoh_approach'], ['shot', 'garoh_approach'], ['enter', 'garoh_path'], ['go', 8, 14], ['idle'], ['expect', 'garoh_wolf_seen'], ['shot', 'garoh_path'], ['enter', 'garoh'], ['shot', 'garoh'], ['go', 22, 11], ['idle'], ['expect', 'garoh_maha_peek'],
  ['enter', 'garoh_item'], ['shop'], ['enter', 'garoh'], ['enter', 'garoh_inn'], ['inn'], ['enter', 'garoh'], ['ckpt', 'garoh_night'], ['enter', 'garoh_path'], ['enter', 'garoh_approach'], ['enter', 'world_tla'],
  // Air's Rock. The base: five Wind Stones' worth of sand barriers, the Mimic on the upper-left way, the Cookie
  // at the far end of the low passage, the slope off its pocket, the three twister rocks (the left path's mud, the
  // Smoke Bomb, the mud off the wall). The face: ropes and whirls up, the pillars into the gaps, down the far right
  // for Storm Brand, the statue's whirl to the top ledge. The upper face: the Fujin Shield up the right-hand ropes
  // first, then the twisters' ledges, the drop into the pocket (Sleep Bomb, the pillar, the statue's lift), the
  // rope to the top. The summit's twister rock, and inside: the cones, the vents, the turning walls, the crystal
  // room's rock that wakes the statues, the whirl to the Vial, the left room to the Circlet and the coins, five
  // blue dots, the platform's door to the centre, Reveal; Flora on the way out, Retreat down
  ['world', 'airs_rock'], ['idle'], ['expect', 'airs_entered'], ['shot', 'airs_rock'],
  ['cast', 'Whirlwind', 22, 27, 2], ['go', 21, 22], ['cast', 'Whirlwind', 8, 28, 0], ['chest', 8, 5], ['expect', 'item:Lucky Medal'],
  ['cast', 'Whirlwind', 32, 2, 3], ['cast', 'Whirlwind', 34, 19, 2], ['cast', 'Whirlwind', 34, 31, 2], ['cast', 'Whirlwind', 34, 31, 2],
  ['chest', 5, 28], ['expect', 'item:Cookie'], ['drop', 6, 32], ['expectMap', 'airs_rock'],
  ['cast', 'Whirlwind', 1, 32, 1], ['cast', 'Whirlwind', 1, 14, 1], ['chest', 3, 16], ['expect', 'item:Smoke Bomb'],
  ['cast', 'Whirlwind', 6, 4, 3], ['expect', 'airs_mud_cleared'], ['ckpt', 'airs_base'], ['enter', 'airs_rock_wall'], ['shot', 'airs_rock_wall'],
  ['go', 3, 31], ['drop', 10, 31], ['drop', 16, 26], ['expectMap', 'airs_rock_wall'],
  ['push', 'w1_p1', 2, 3], ['push', 'w1_p2', 2, 3], ['go', 36, 42], ['enter', 'airs_rock'], ['chest', 39, 3], ['expect', 'item:Storm Brand'], ['enter', 'airs_rock_wall'],
  ['go', 30, 11], ['ride', 35, 11], ['push', 'w1_p3', 1, 4], ['go', 14, 6], ['ckpt', 'airs_face'], ['enter', 'airs_rock_wall2'], ['shot', 'airs_rock_wall2'],
  ['chest', 34, 11], ['expect', 'item:Fujin Shield'], ['go', 6, 37], ['dodge', 28, 31], ['dodge', 28, 26], ['go', 5, 20], ['drop', 4, 20], ['expectMap', 'airs_rock_wall2'],
  ['push', 'w2_p4', 2, 2], ['chest', 2, 26], ['expect', 'item:Sleep Bomb'], ['ride', 2, 25], ['go', 24, 15], ['go', 24, 4], ['ckpt', 'airs_upper'], ['enter', 'airs_rock_summit'], ['shot', 'airs_rock_summit'],
  ['idle'], ['cast', 'Whirlwind', 12, 8, 1], ['expect', 'airs_door_open'], ['enter', 'airs_rock_in_entry'], ['enter', 'airs_rock_in_hall'], ['idle'], ['shot', 'airs_rock_hall'], ['ckpt', 'airs_inside'],
  // the cones and the red room
  ['enter', 'airs_rock_in_cones'], ['push', 'cone_p1', 3, 3], ['push', 'cone_p2', 3, 3], ['pound', 'cone_g2'], ['cast', 'Whirlwind', 20, 9, 1], ['expect', 'airs_cones_open'],
  ['cast', 'Whirlwind', 3, 3, 1], ['push', 'cone_p3', 2, 4], ['enter', 'airs_rock_in_red3'], ['shot', 'airs_rock_red3'],
  ['cast', 'Move', 22, 12, 3, 2], ['cast', 'Move', 23, 8, 3, 1], ['enter', 'airs_rock_in_hall'],
  // three and four blue dots
  ['enter', 'airs_rock_in_blue3'], ['cast', 'Whirlwind', 16, 4, 3], ['go', 9, 7], ['cast', 'Whirlwind', 4, 10, 3], ['push', 'b3_p', 2, 3], ['enter', 'airs_rock_in_blue4'], ['shot', 'airs_rock_blue4'],
  ['chest', 2, 13], ['expect', 'item:Elixir'], ['go', 13, 7], ['cast', 'Whirlwind', 20, 6, 3], ['cast', 'Whirlwind', 19, 3, 3], ['chest', 23, 2], ['push', 'b4_p', 2, 3], ['go', 4, 5], ['enter', 'airs_rock_in_hall'], ['ckpt', 'airs_blue'],
  // the crystal room wakes the statues; the whirl to the Vial's room
  ['enter', 'airs_rock_in_crystal'], ['cast', 'Whirlwind', 16, 7, 1], ['expect', 'airs_statues_on'], ['use', 10, 3], ['ride', 10, 10], ['expectMap', 'airs_rock_in_vial'],
  ['cast', 'Whirlwind', 10, 3, 3], ['ride', 10, 8], ['chest', 17, 3], ['ride', 14, 4], ['enter', 'airs_rock_in_hall'],
  // the left room, four blue dots again, five blue dots
  ['enter', 'airs_rock_in_left'], ['shot', 'airs_rock_left'], ['cast', 'Move', 20, 9, 1, 1], ['ride', 20, 9], ['go', 10, 2], ['cast', 'Move', 8, 1, 3, 2], ['ride', 8, 1], ['chest', 2, 1], ['expect', 'item:Clarity Circlet'],
  ['ride', 4, 2], ['cast', 'Move', 10, 13, 3, 1], ['ride', 10, 13], ['enter', 'airs_rock_in_blue4'], ['enter', 'airs_rock_in_blue5'], ['chest', 2, 11], ['cast', 'Move', 9, 5, 2, 2], ['enter', 'airs_rock_in_hall'], ['ckpt', 'airs_left'],
  // the centre: the whirl to the platform, the stones, the tablet
  ['ride', 14, 27], ['enter', 'airs_rock_in_center'], ['go', 11, 7], ['idle'], ['go', 11, 12], ['idle'], ['expect', 'reveal_tla'], ['shot', 'reveal'],
  ['cast', 'Reveal', 2, 15, 3], ['chest', 2, 15], ['expect', 'item:Psy Crystal'], ['enter', 'airs_rock_in_hall'], ['ckpt', 'reveal'],
  // Flora, and out
  ['enter', 'airs_rock_in_red3'], ['push', 'r3_pf', 3, 3], ['ride', 12, 10], ['use', 4, 9], ['expect', 'flora_taken'], ['ride', 2, 12], ['enter', 'airs_rock_in_hall'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'], ['ckpt', 'airs_done'],
  // Garoh again, with Reveal: the crevice in the boulder, the chase and Maha, the night at the inn, Ether in the morning, the six platforms
  ['world', 'garoh_approach'], ['enter', 'garoh_path'], ['enter', 'garoh'], ['cast', 'Reveal', 22, 10, 3], ['go', 22, 10], ['idle'], ['expectMap', 'garoh_cave'], ['go', 8, 11], ['idle'], ['go', 2, 5], ['idle'], ['expect', 'garoh_maha_met'],
  ['enter', 'garoh'], ['enter', 'garoh_inn'], ['inn'], ['idle'], ['expect', 'garoh_slept'], ['enter', 'garoh'], ['enter', 'garoh_smith'], ['shop'], ['enter', 'garoh'], ['enter', 'garoh_cave'], ['talk', 'Maha'], ['expect', 'ether_got'], ['enter', 'garoh'],
  ['enter', 'garoh_cavern'], ['shot', 'garoh_cavern'], ['revealwalk', 13, 5], ['chest', 8, 2], ['revealwalk', 3, 9], ['enter', 'garoh'], ['ckpt', 'ether'], ['enter', 'garoh_path'], ['enter', 'garoh_approach'], ['enter', 'world_tla'],
  // ---- Back to Madra, free Piers, then west to Gondowan ----
  ['world', 'osenia_cliffs'], ['enter', 'madra_bridge'], ['enter', 'world_tla', 7, 21],   // home to Madra on foot: north past Mikasalla, over the two bridges, the cliffs and the drawbridge
  ['world', 'madra'], ['go', 29, 22], ['idle'], ['expect', 'piers_freed'], ['expect', 'kibombo_raid'], ['shot', 'madra_kibombo'], ['enter', 'madra_mayor'], ['talk', 'madra_daughter'], ['enter', 'madra'], ['ckpt', 'piers_freed'], ['enter', 'world_tla'],
  // Gondowan Cliffs: the men of Kibombo in the cave behind the foliage, Scoop for the geyser, the middle slide to
  // the pocket, the pillar into the water, the vine down and the rocks across the river, the vines up to the Sleep
  // Bomb, Kindle on the top terrace, the tightrope out to Gondowan
  ['level', 16], ['world', 'gondowan_cliffs'], ['idle'], ['shot', 'gondowan_cliffs'],
  ['cast', 'Whirlwind', 41, 21, 3], ['enter', 'gondowan_cliffs_cave'], ['idle'], ['expect', 'gc_cave_seen'], ['enter', 'gondowan_cliffs'],
  ['psyat', 'Scoop', 'gc_dig'], ['expect', 'gc_geyser'], ['ride', 32, 25], ['drop', 20, 17], ['go', 17, 21], ['push', 'gc_pillar', 1, 3], ['go', 11, 21], ['go', 3, 22], ['go', 4, 8],
  ['chest', 10, 3], ['expect', 'item:Sleep Bomb'], ['djinni', 'Kindle'], ['ckpt', 'gondowan_cliffs'], ['enter', 'world_tla', 0, 5],
  // Naribwe: the armory and the mat, the inn, the seer's reading, the back yard of the upper-left home (Whirlwind
  // on the ivy, the ladder, Reveal on the stone for the Unicorn Ring), Lash up the rope on the right for the Thorn
  // Crown; Chill in the field to the south
  ['world', 'naribwe'], ['idle'], ['shot', 'naribwe'], ['enter', 'naribwe_weaponshop'], ['shop'], ['enter', 'naribwe'], ['shop', 'nar_item'], ['enter', 'naribwe_inn'], ['inn'], ['enter', 'naribwe'],
  ['enter', 'naribwe_fortune'], ['talk', 'fortune'], ['expect', 'fortune_read'], ['enter', 'naribwe'],
  ['enter', 'naribwe_home1'], ['enter', 'naribwe', 9, 0], ['cast', 'Whirlwind', 2, 8, 3], ['go', 2, 6], ['cast', 'Reveal', 1, 4, 1], ['use', 1, 4], ['expect', 'item:Unicorn Ring'], ['enter', 'naribwe_home1', 3, 10], ['enter', 'naribwe', 5, 8],
  ['psyat', 'Lash', 'nar_rope'], ['go', 26, 7], ['chest', 27, 5], ['expect', 'item:Thorn Crown'], ['ckpt', 'naribwe'], ['enter', 'world_tla', 11, 0], ['djinni', 'Chill'],
  // Kibombo Mountains, watched: the road to the gate (the guards' talk), the first vine and the two crates into the
  // gap, the second vine and the pillar for the shortcut, the third vine and the crate pushed along under the first
  // watcher, the Disk Axe down the slide and the vine back, the fourth vine behind the crate that then goes ahead
  // of the party past the second watcher, the rope up, the tight edge north. The second screen: the crate dropped
  // on the warrior below (Power Bread), the pillar dropped to pen the dog above (Tear Stone), the screen left and
  // entered again for the pillar, the dog penned below, the corridor's top, the cavern (Smoke Bomb), the bone for
  // the dog, the overgrowth and the second cavern, the river hopped, out west
  ['world', 'kibombo_mtns'], ['idle'], ['shot', 'kibombo_mtns'], ['go', 16, 32], ['idle'], ['expect', 'kib_pass_seen'],
  ['go', 30, 33], ['go', 30, 29], ['push', 'kib_c1', 1, 4], ['push', 'kib_c2', 1, 4], ['go', 20, 28], ['go', 20, 23], ['push', 'kib_p1', 1, 2],
  ['go', 14, 22], ['go', 14, 17], ['push', 'kib_c3', 2, 8], ['drop', 30, 17], ['chest', 31, 20], ['expect', 'item:Disk Axe'], ['go', 27, 21], ['go', 27, 28],
  ['go', 20, 23], ['go', 14, 22], ['go', 14, 17], ['go', 6, 16], ['go', 6, 11], ['push', 'kib_c4', 2, 5], ['go', 11, 8], ['psyat', 'Lash', 'kib_rope'], ['go', 11, 3], ['ckpt', 'kibombo_pass'], ['enter', 'kibombo_mtns_2'], ['shot', 'kibombo_mtns_2'],
  ['go', 4, 29], ['go', 4, 24], ['dropon', 'kib_c5', 0, 'kib_g3', 'at', 16, 26], ['expect', 'kib_g3_out'], ['go', 8, 24], ['go', 8, 26], ['chest', 24, 27], ['expect', 'item:Power Bread'],
  ['go', 20, 23], ['go', 20, 21], ['go', 26, 18], ['go', 26, 16], ['dropon', 'kib_p2', 2, 'kib_dog', 'above', 30, 14, 2], ['go', 29, 22], ['go', 30, 20], ['chest', 33, 20], ['expect', 'item:Tear Stone'],
  ['go', 20, 23], ['go', 4, 24], ['go', 4, 29], ['enter', 'kibombo_mtns'], ['enter', 'kibombo_mtns_2'], ['go', 4, 24], ['go', 20, 23], ['go', 20, 21], ['go', 26, 16], ['dropon', 'kib_p2', 2, 'kib_dog', 'below', 30, 14, 2],
  ['go', 26, 12], ['go', 26, 7], ['go', 30, 7], ['go', 30, 5], ['enter', 'kibombo_mtns_cave'], ['use', 8, 3], ['expect', 'item:Smoke Bomb'], ['enter', 'kibombo_mtns_2'],
  ['go', 34, 5], ['cast', 'Tremor', 34, 12, 3], ['expect', 'kib_bone'], ['go', 34, 5], ['cast', 'Whirlwind', 36, 2, 3], ['enter', 'kibombo_mtns_cave2'], ['enter', 'kibombo_mtns_2', 2, 1],
  ['go', 9, 11], ['go', 7, 18], ['go', 5, 18], ['ckpt', 'kibombo_mtns'], ['enter', 'world_tla', 0, 18],
  // Kibombo by night: the crowd before the Great Gabomba, Lash up the rope in the corner, the poles hopped along the
  // ledge to the cliff above the statue, the ceremony watched, Piers found; Move on the stump across the gap (Piers
  // joins), round the back of the statue, Scoop on the marked sand, the shaft up into the statue
  ['world', 'kibombo'], ['idle'], ['shot', 'kibombo'], ['enter', 'kibombo_inn'], ['inn'], ['enter', 'kibombo'], ['enter', 'kibombo_itemshop'], ['shop'], ['enter', 'kibombo'],
  ['psyat', 'Lash', 'kib_rope'], ['go', 2, 36], ['go', 2, 7], ['idle'], ['expect', 'kib_ceremony_seen'], ['shot', 'kibombo_ceremony'],
  ['go', 3, 7], ['psy', 'Move', 2, 1], ['idle'], ['expect', 'piers_joined'], ['expectParty', ['Felix', 'Jenna', 'Sheba', 'Piers']], ['shot', 'piers_joins'], ['ckpt', 'piers'],
  ['go', 7, 6], ['idle'], ['psyat', 'Scoop', 'kib_dig'], ['go', 9, 4], ['idle'], ['expectMap', 'kibombo_vent'], ['enter', 'gabomba'], ['idle'], ['shot', 'gabomba'],
  // ---- Gabomba Statue: the gear room, the cog room and Steel, the idol room, the eyes, the inner chamber ----
  ['enter', 'gabomba_gears'], ['chest', 3, 12], ['expect', 'item:Hard Nut'], ['chest', 14, 12], ['expect', 'item:Bone Armlet'], ['psyat', 'Lash', 'gab_rope'], ['expect', 'gab_gears_stopped'], ['enter', 'gabomba_cogs'], ['shot', 'gabomba_cogs'],
  ['idle'], ['chest', 3, 13], ['pound', 'gab_cone2'], ['pound', 'gab_cone1'], ['expect', 'gab_cogs_reversed'], ['go', 12, 9], ['idle'], ['expectMap', 'gabomba_pit'], ['djinni', 'Steel'], ['psyat', 'Lash', 'gab_rope2'], ['enter', 'gabomba_cogs'],
  ['enter', 'gabomba_shrine'], ['enter', 'gabomba_eyes'], ['idle'], ['expect', 'gab_eyes_seen'], ['shot', 'gabomba_eyes'],
  ['pound', 'gab_cone3'], ['go', 8, 8], ['go', 8, 9], ['pound', 'gab_tile_a'], ['pound', 'gab_tile_b'], ['go', 8, 8], ['go', 8, 9], ['pound', 'gab_tile_c'], ['idle'], ['expect', 'gab_ceremony_done'], ['expectMap', 'gabomba_shrine'],
  ['idle'], ['expect', 'gab_passage_open'], ['enter', 'gabomba_heart'], ['idle'], ['use', 14, 5], ['expect', 'gab_statue_spoke'], ['use', 14, 5], ['expect', 'black_orb_got'], ['ckpt', 'black_orb'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'kibombo'], ['enter', 'kibombo_akafubu'], ['idle'], ['expect', 'gabomba_done'], ['shot', 'kibombo_day'], ['enter', 'kibombo'],
  ['enter', 'kibombo_weaponshop'], ['shop'], ['enter', 'kibombo'], ['ckpt', 'kibombo'], ['enter', 'world_tla'],
  // Kibombo Mountains again, with Piers: the warriors gone, Frost on the puddle by the river, Growth on the sprout, Waft on his ledge
  ['world', 'kibombo_mtns'], ['enter', 'kibombo_mtns_2'], ['go', 4, 24], ['go', 20, 23], ['go', 20, 21], ['go', 26, 16], ['go', 26, 7], ['go', 30, 5], ['enter', 'kibombo_mtns_cave2', 36, 2], ['enter', 'kibombo_mtns_2', 2, 1],
  ['go', 9, 11], ['go', 5, 18], ['cast', 'Frost', 3, 11, 3], ['go', 3, 10], ['cast', 'Growth', 3, 9, 3], ['djinni', 'Waft'], ['enter', 'kibombo_mtns', 16, 31], ['enter', 'world_tla', 29, 41],   // out by the mountains' south mouth: the cliffs and the shore are on that side
  // ---- Healing Fungus for Madra's old man (Char Djinni) and the Lemurian ship ----
  // Gondowan Cliffs again, in over the tightrope from the west with Frost: the puddle under the top terrace's east end frozen, the Healing Fungus on the ledge, the slides down and out east
  ['world', 'gondowan_cliffs'], ['expectMap', 'gondowan_cliffs'], ['go', 12, 6], ['cast', 'Frost', 38, 8, 0], ['go', 38, 9], ['use', 36, 10], ['expect', 'item:Healing Fungus'],
  ['try', ['use', 40, 5]], ['drop', 38, 12], ['drop', 22, 17], ['enter', 'world_tla', 49, 25],
  // East Indra Shore: Piers before his ship, and the word about Madra's mayor first
  ['world', 'indra_shore'], ['go', 17, 12], ['idle'], ['expect', 'shore_visited'], ['shot', 'indra_shore'], ['cast', 'Frost', 4, 6, 3], ['use', 4, 4], ['expect', 'item:Cookie'], ['enter', 'world_tla'],
  // Madra: the old man's Char for the fungus; Karst outside the residence, the reunion inside, the Cyclone Chip and Karst's word on the doorstep
  ['world', 'madra'], ['talk', 'madra_old'], ['expect', 'char_given'], ['go', 19, 27], ['idle'], ['enter', 'madra_mayor'], ['idle'], ['expect', 'madra_revisited'], ['enter', 'madra'], ['idle'], ['expect', 'cyclone_got'], ['expect', 'karst_gone'], ['shot', 'karst'], ['ckpt', 'cyclone'],
  // ---- Pupetta's theatre (class item: the Puppeteer's Strings); Puppet walks the doll onto the switch ----
  ['enter', 'madra_house1'], ['teacher', 'pupetta', 'pupetta_done', 3], ['expect', 'pupetta_done'], ['expect', "item:Puppeteer's Strings"], ['enter', 'madra_theatre'], ['shot', 'madra_theatre'], ['cast', 'Puppet', 6, 4, DIR.UP], ['puppet', 'RRRRR'], ['expect', 'theatre_open'], ['chest', 12, 5], ['enter', 'madra_house1'], ['enter', 'madra'], ['ckpt', 'theatre'],
  // the catacombs again, with Frost and Reveal: down the watch's ladder to the lower level, the temple's main door,
  // Reveal for the button and the slab, out the back onto the old town's floor; Frost across the water for the
  // Apple; the two pillars sunk into the great house's ring, up over its walls to the bridge, Lash across the fallen
  // span, the upper floor: Tremor on the bookshelf, the Lucky Medal round the gallery; back down, the ladder to the
  // shelf for the Mist Potion, the slide, the Ruin Key where it fell, the red door below and Moloch
  ['enter', 'madra_cave_a'], ['enter', 'madra_village', 0, 5], ['enter', 'madra_ruins_1', 4, 31], ['go', 14, 7], ['cast', 'Reveal', 14, 6, 3], ['use', 14, 6], ['expect', 'madra_ruins_door'],
  ['enter', 'madra_village', 12, 0], ['shot', 'madra_village_main'], ['cast', 'Frost', 36, 13, 2], ['chest', 39, 13],
  ['cast', 'Move', 20, 7, 0], ['cast', 'Move', 20, 8, 0], ['cast', 'Move', 29, 15, 1], ['cast', 'Move', 28, 15, 1], ['go', 20, 10], ['go', 13, 10], ['cast', 'Lash', 12, 10, 1], ['go', 8, 10],
  ['enter', 'madra_ruins_up', 5, 10], ['shot', 'madra_ruins_up'], ['cast', 'Tremor', 12, 5, 3], ['expect', 'madra_shelf_shaken'], ['chest', 2, 12], ['enter', 'madra_village', 12, 13],
  ['go', 42, 25], ['go', 42, 27], ['chest', 43, 28], ['try', ['go', 37, 28]], ['idle'], ['expectMap', 'madra_village'], ['enter', 'madra_ruins_1', 4, 31], ['chest', 10, 3], ['expect', 'item:Ruin Key'],
  ['enter', 'madra_ruins_b1', 21, 14], ['go', 12, 3], ['use', 12, 2], ['expect', 'madra_ruin_door'], ['enter', 'madra_ruins_tablet'], ['shot', 'madra_ruins_tablet'], ['use', 6, 2], ['expect', 'moloch_taken'], ['shot', 'moloch'],
  ['enter', 'madra_ruins_b1'], ['enter', 'madra_ruins_1', 21, 3], ['enter', 'madra'], ['ckpt', 'madra_moloch'], ['enter', 'world_tla', 49, 11],
  // the ship: the sealed door opened with the Black Crystal, the jellies below (the puddles they leave frozen for the
  // Potion, the crates, the one that runs to the lower level, the platform, the Oil Drop), the Aqua Hydra, Douse on
  // the right-hand pillar and the pillar onto the mark, the power chamber; the ship sails
  ['world', 'indra_shore'], ['go', 17, 12], ['go', 21, 20], ['idle'], ['expect', 'ship_door_open'], ['enter', 'lem_1'], ['shot', 'lemurian_ship'], ['enter', 'lem_2'],
  ['talk', 'jelly_a'], ['talk', 'jelly_b'], ['cast', 'Frost', 13, 3, 2], ['chest', 16, 3], ['expect', 'item:Potion'], ['enter', 'lem_3'],
  ['talk', 'jelly_c'], ['talk', 'jelly_d'], ['talk', 'jelly_e'], ['talk', 'jelly_f'], ['talk', 'jelly_g'], ['talk', 'jelly_h'], ['cast', 'Frost', 6, 7, 0], ['enter', 'lem_4'],
  ['talk', 'jelly_j'], ['talk', 'jelly_k'], ['cast', 'Move', 5, 4, 0, 0], ['talk', 'jelly_i'], ['cast', 'Frost', 4, 4, 1], ['enter', 'lem_5'],
  ['go', 7, 5], ['idle'], ['expect', 'lem_j9_fled'], ['enter', 'lem_5b'], ['talk', 'jelly_l'], ['cast', 'Frost', 9, 5, 2], ['enter', 'lem_6'], ['enter', 'lem_7'], ['shot', 'aqua_hydra'],
  ['talk', 'jelly_hydra'], ['expect', 'aqua_hydra_done'], ['enter', 'lem_8'], ['cast', 'Douse', 11, 5, 1], ['push', 'lem_pil_r', 1, 3], ['push', 'lem_pil_r', 0, 3], ['expect', 'lem_corridor_open'],
  ['enter', 'lem_engine'], ['go', 8, 5], ['idle'], ['expect', 'hasShip'], ['expectMap', 'world_tla'], ['shot', 'ship_sails'], ['ckpt', 'ship'],
  // ---- Indra Cavern, the small cave west of the ship's shore: Move on the pillar in the gap, Lash up the cliff, Zagan's tablet ----
  ['world', 'indra_cavern'], ['expectMap', 'indra_cavern'], ['shot', 'indra_cavern'], ['cast', 'Move', 11, 7, DIR.RIGHT], ['go', 16, 6], ['psy', 'Lash', DIR.UP], ['go', 16, 4], ['use', 9, 3], ['expect', 'zagan_taken'], ['shot', 'zagan'], ['enter', 'world_tla'],
  // ---- 8A: the Gabomba's catacombs, now that the wind is Cyclone - back to Kibombo by sea and down through the statue:
  // the lower level's dead end (Cyclone over the rocks wakes the stone: Mud), the slide, the second stone south of the
  // stairs, the hall of bones (Mint), the stream (Frost over the gap, Reveal on the dead end, the three poles, Frost
  // again), the shrine's bushes (Mad Plant #1) and the little Gabomba's book ----
  ['world', 'kibombo'], ['enter', 'gabomba'], ['enter', 'gabomba_gears'], ['enter', 'gabomba_cogs'], ['enter', 'gabomba_shrine'], ['enter', 'gabomba_heart'], ['enter', 'gabomba_catacombs'], ['expectMap', 'gabomba_catacombs'], ['shot', 'gabomba_catacombs'],
  ['enter', 'gc_lower'], ['go', 8, 5], ['psy', 'Cyclone', DIR.UP], ['idle'], ['expectMap', 'gc_hollow'], ['shot', 'gc_hollow'], ['djinni', 'Mud'], ['go', 6, 9], ['drop', 6, 10], ['idle'], ['expectMap', 'gc_lower'],
  ['enter', 'gabomba_catacombs'], ['go', 5, 10], ['psy', 'Cyclone', DIR.RIGHT], ['idle'], ['expectMap', 'gc_lower'], ['enter', 'gc_bones'], ['shot', 'gc_bones'], ['go', 13, 7], ['psy', 'Cyclone', DIR.DOWN], ['idle'], ['expect', 'gc_bones:hidden:13,9'],
  ['enter', 'gc_stream'], ['shot', 'gc_stream'], ['go', 4, 13], ['psy', 'Cyclone', DIR.RIGHT], ['idle'], ['go', 5, 13], ['psy', 'Frost', DIR.RIGHT], ['go', 7, 13], ['go', 9, 11], ['psy', 'Reveal'], ['go', 9, 9], ['go', 11, 8], ['go', 15, 8], ['go', 19, 7], ['go', 19, 3], ['go', 15, 3], ['go', 11, 3],
  ['go', 9, 4], ['psy', 'Cyclone', DIR.LEFT], ['idle'], ['go', 8, 4], ['psy', 'Frost', DIR.LEFT], ['go', 6, 4], ['enter', 'gc_shrine'], ['shot', 'gc_shrine'], ['go', 9, 8], ['psy', 'Cyclone', DIR.UP], ['idle'], ['expect', 'gc_plant_done'], ['go', 9, 2], ['idle'], ['expect', 'gc_tome_got'], ['shot', 'tomegathericon'], ['ckpt', 'gabomba_catacombs'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'kibombo'], ['enter', 'world_tla'],
  // ---- back to Daila with Piers: the Sea God's Tear waits behind two frozen puddles in the Sanctum ----
  ['world', 'daila'], ['enter', 'daila_sanctum'], ['cast', 'Frost', 3, 5, DIR.UP], ['cast', 'Frost', 3, 4, DIR.UP], ['chest', 4, 3], ['expect', "item:Sea God's Tear"], ['enter', 'daila'], ['enter', 'world_tla'],
  // ---- Sea God's shrine (Right Prong, Breath) ----
  ['world', 'sea_god_shrine'], ['shot', 'sea_god_shrine'], ['enter', 'ssg_temple'], ['enter', 'ssg_1'], ['enter', 'ssg_2'], ['shot', 'ssg_2'], ['enter', 'ssg_3'], ['enter', 'ssg_4'], ['chest', 9, 3], ['chest', 12, 19], ['expect', 'item:Rusty Staff'], ['enter', 'ssg_8'], ['djinni', 'Breath'], ['enter', 'ssg_7'], ['djinni', 'Spring'], ['enter', 'ssg_3'], ['enter', 'ssg_2'], ['lever', 'seagod'], ['expect', 'sea_god_tear'], ['enter', 'ssg_1'], ['enter', 'ssg_temple'], ['enter', 'sea_god_shrine'], ['enter', 'world_tla'],
  // ---- Osenia by sea: Yallam, Taopo (Star Dust), Aqua Rock (Parch) ----
  ['world', 'yallam'], ['shot', 'yallam'], ['enter', 'yallam_weaponshop'], ['shop'], ['enter', 'yallam'], ['enter', 'yallam_inn'], ['inn'], ['enter', 'yallam'], ['ckpt', 'yallam'], ['enter', 'world_tla'],
  // ---- Taopo Swamp: the little pillar into its pit, the west cave's Tear Stone; the mud crossed bubble to bubble (the
  // Cookie up the west stairs); the east cave (the vent up to the Bramble Seed and the second Tear Stone, the slide
  // down, the pillar over the vent to knock Flower off his ledge, the Mad Plant in the bush); Growth up the hill and
  // the caves under it (steam vent capped with Douse+Frost, the cooled rock into the lava, the Vial, Tremor on the
  // boulder, the last cooled rock's light on the Star Dust, Lash up the rope) ----
  ['world', 'taopo'], ['shot', 'taopo'], ['push', 'tao_p1', DIR.RIGHT, 1], ['psyat', 'Whirlwind', 'tao_ivy1'], ['enter', 'taopo_cave_w'], ['psyat', 'Scoop', 'tao_dig1'], ['expect', 'item:Tear Stone'], ['enter', 'taopo'],
  ['go', 14, 14], ['go', 14, 19], ['go', 10, 18], ['chest', 10, 16], ['expect', 'item:Cookie'], ['go', 14, 15], ['go', 18, 14], ['go', 22, 14], ['go', 26, 14], ['go', 30, 14], ['go', 34, 14], ['go', 38, 14], ['go', 41, 18], ['shot', 'taopo_mud'],
  ['psyat', 'Whirlwind', 'tao_ivy2'], ['enter', 'taopo_cave_e'], ['shot', 'taopo_cave_e'], ['ride', 8, 13], ['psyat', 'Whirlwind', 'tao_leaves'], ['expect', 'item:Bramble Seed'], ['enter', 'taopo_cave_n'], ['psyat', 'Scoop', 'tao_dig2'], ['enter', 'taopo_cave_e'],
  ['drop', 6, 9], ['push', 'tao_pv', DIR.UP, 1], ['push', 'tao_pv', DIR.RIGHT, 2], ['expect', 'tao_vent_redirect'], ['expect', 'tao_flower_down'], ['djinni', 'Flower'], ['psyat', 'Whirlwind', 'tao_bush'], ['expect', 'tao_madplant'], ['enter', 'taopo'],
  ['go', 38, 14], ['go', 34, 14], ['go', 30, 14], ['go', 30, 11], ['go', 29, 9], ['psyat', 'Growth', 'tao_sprout'], ['go', 29, 6], ['psyat', 'Whirlwind', 'tao_ivy3'], ['enter', 'taopo_cave_c1'], ['shot', 'taopo_cave_c1'],
  ['psyat', 'Douse', 'tao_steam'], ['psyat', 'Frost', 'tao_steam'], ['go', 13, 7], ['psyat', 'Douse', 'tao_rock1'], ['push', 'tao_rock1', DIR.RIGHT, 2], ['go', 18, 7], ['enter', 'taopo_cave_c2'], ['shot', 'taopo_cave_c2'],
  ['go', 10, 9], ['go', 7, 3], ['psyat', 'Douse', 'tao_rock2'], ['push', 'tao_rock2', DIR.UP, 1], ['chest', 3, 3], ['expect', 'item:Vial'], ['psyat', 'Tremor', 'tao_shake'], ['expect', 'tao_wall_open'], ['enter', 'taopo_cave_c3'],
  ['psyat', 'Douse', 'tao_rock3'], ['expect', 'tao_light'], ['psyat', 'Scoop', 'tao_dig3'], ['expect', 'item:Star Dust'], ['shot', 'taopo_star_dust'], ['psyat', 'Lash', 'tao_rope'], ['go', 2, 1], ['idle'], ['expectMap', 'taopo'], ['ckpt', 'taopo'],
  ['go', 29, 9], ['go', 30, 11], ['go', 30, 14], ['go', 26, 14], ['go', 22, 14], ['go', 18, 14], ['go', 14, 14], ['enter', 'world_tla'],
  ['world', 'yallam'], ['enter', 'yallam_forge'], ['try', ['forge']], ['enter', 'yallam'], ['enter', 'world_tla'],   // Sunshine opens a screen of his own; forge() knows how to work it
  // ---- Apojii Islands: the merchant with the Dragon Axe, the inn, Douse on the Aqua Stone by the spring (rain, and
  // across the sea the five moai of Aqua Rock move aside) ----
  ['world', 'apojii'], ['shot', 'apojii'], ['enter', 'apojii_shop'], ['shop'], ['enter', 'apojii'], ['enter', 'apojii_inn'], ['inn'], ['enter', 'apojii'], ['psyat', 'Douse', 'apo_stone'], ['expect', 'apojii_stone_doused'], ['shot', 'apojii_rain'], ['ckpt', 'apojii'], ['enter', 'world_tla'],
  // ---- Aqua Rock. Outside: the Elixir, the climb, the pillar over the left red moai's stream and Move on the right
  // one, Douse on the dried moai and its stream down to the Nut and the water stone, the stream turned to carry the
  // party up, the second climb, the blue rock into the channel, the Oil Drop, Frost across the gap (and up to the
  // Mist Sabre), Douse on the tear rock at the door ----
  ['level', 22], ['world', 'aqua_rock'], ['shot', 'aqua_rock'], ['go', 22, 30], ['chest', 3, 24], ['expect', 'item:Elixir'], ['go', 6, 24], ['go', 6, 17], ['go', 9, 13],
  ['push', 'aq_pil1', DIR.RIGHT, 4], ['go', 14, 15], ['go', 23, 12], ['psy', 'Move', DIR.RIGHT], ['go', 24, 15], ['go', 29, 16], ['psyat', 'Douse', 'aq_moai_dry'], ['ride', 30, 17], ['chest', 38, 25], ['expect', 'item:Nut'],
  ['psyat', 'Douse', 'aq_ws1'], ['expect', 'aq_stream_up'], ['ride', 30, 23], ['go', 38, 12], ['go', 38, 5], ['shot', 'aqua_rock_top'], ['push', 'aq_blue1', DIR.LEFT, 3], ['go', 30, 5], ['chest', 29, 4], ['expect', 'item:Oil Drop'],
  ['go', 22, 5], ['cast', 'Frost', 21, 5, DIR.LEFT], ['go', 21, 5], ['cast', 'Frost', 20, 5, DIR.LEFT], ['go', 20, 5], ['cast', 'Frost', 19, 5, DIR.LEFT], ['go', 18, 5],
  ['go', 18, 4], ['cast', 'Frost', 18, 3, DIR.UP], ['go', 18, 3], ['cast', 'Frost', 18, 2, DIR.UP], ['go', 18, 1], ['chest', 18, 0], ['expect', 'item:Mist Sabre'],
  ['psyat', 'Douse', 'aq_gate'], ['expect', 'aq_door_open'], ['ckpt', 'aqua_outside'], ['enter', 'aqua_rock_in_1'], ['shot', 'aqua_rock_in'],
  // inside: the yellow tiles; the two vents stopped with their columns and the Vial; the moai over the drain and the
  // Crystal Powder; the water stone, the right vent capped and the left one ridden down; the pillar into the pit,
  // moai then aqua stone; the waterfall hall's tiles and the Tear Stone; the blue rock and the frozen puddle over the
  // pit, the moai, the Water of Life; the pillars into the cracks; the three pillars on their marks, moai and stone;
  // the pillar out of the gap, the Mimic, the Psynergy stone; the big rock doused for the Lucky Pepper and the
  // Aquarius Stone; the column, the tablet (Parch), the flood dried; the sunken Rusty Sword; Parch on the moai and Steam
  ['enter', 'aqua_rock_in_2'], ['enter', 'aqua_rock_in_3'], ['push', 'aq_c1', DIR.RIGHT, 5], ['expect', 'aq_v1_stopped'], ['push', 'aq_c2', DIR.UP, 2], ['push', 'aq_c2', DIR.RIGHT, 4], ['expect', 'aq_v2_stopped'], ['chest', 18, 10], ['expect', 'item:Vial'],
  ['enter', 'aqua_rock_in_4'], ['push', 'aq_m4', DIR.RIGHT, 2], ['expect', 'aq_drained'], ['enter', 'aqua_rock_in_5'], ['chest', 6, 4], ['expect', 'item:Crystal Powder'], ['enter', 'aqua_rock_in_4'], ['enter', 'aqua_rock_in_6'],
  ['psyat', 'Douse', 'aq_ws6'], ['expect', 'aq_ws6_open'], ['push', 'aq_c6', DIR.DOWN, 3], ['ride', 15, 8], ['expectMap', 'aqua_rock_in_7'],
  ['push', 'aq_p7c', DIR.RIGHT, 1], ['push', 'aq_p7c', DIR.DOWN, 1], ['go', 9, 7], ['psyat', 'Douse', 'aq_m7'], ['psyat', 'Douse', 'aq_as7'], ['expect', 'aq_hall7_open'], ['enter', 'aqua_rock_in_8'], ['shot', 'aqua_rock_waterfall'],
  ['drop', 6, 6], ['go', 11, 11], ['go', 15, 12], ['cast', 'Move', 15, 13, DIR.DOWN, DIR.RIGHT], ['chest', 15, 14], ['expect', 'item:Tear Stone'], ['enter', 'aqua_rock_in_9'],
  ['push', 'aq_blue9', DIR.DOWN, 3], ['cast', 'Frost', 10, 8, DIR.DOWN], ['go', 11, 9], ['psyat', 'Douse', 'aq_m9'], ['expect', 'aq_m9_wet'], ['chest', 20, 12], ['expect', 'item:Water of Life'], ['enter', 'aqua_rock_in_10'],
  ['push', 'aq_p10a', DIR.RIGHT, 2], ['push', 'aq_p10b', DIR.RIGHT, 3], ['enter', 'aqua_rock_in_11'], ['ckpt', 'aqua_pillars'],
  ['push', 'aq_t3', DIR.RIGHT, 1], ['push', 'aq_t1', DIR.UP, 2], ['push', 'aq_t2', DIR.DOWN, 1], ['push', 'aq_t2', DIR.LEFT, 1], ['psyat', 'Douse', 'aq_m11'], ['psyat', 'Douse', 'aq_as11'], ['expect', 'aq_hall11_open'], ['enter', 'aqua_rock_in_12'],
  ['push', 'aq_p12', DIR.RIGHT, 2], ['chest', 20, 3], ['enter', 'aqua_rock_in_psy'], ['use', 5, 3], ['enter', 'aqua_rock_in_12'], ['enter', 'aqua_rock_in_13'],
  ['psyat', 'Douse', 'aq_bigrock'], ['expect', 'aq_pool_open'], ['chest', 5, 5], ['chest', 8, 6], ['expect', 'item:Aquarius Stone'], ['ckpt', 'aquarius'], ['enter', 'aqua_rock_in_14'],
  ['use', 9, 5], ['expect', 'aq_parted'], ['enter', 'aqua_rock_in_15'], ['use', 6, 3], ['expect', 'parch_learned'], ['shot', 'parch'], ['cast', 'Parch', 6, 7, DIR.DOWN], ['expect', 'aq_hall15_dry'], ['ckpt', 'parch'],
  ['enter', 'aqua_rock_in_14'], ['enter', 'aqua_rock_in_13'], ['enter', 'aqua_rock_in_16'], ['cast', 'Parch', 9, 6, DIR.LEFT], ['expect', 'aq_hall16_dry'], ['chest', 7, 6], ['expect', 'item:Rusty Sword'],
  ['cast', 'Parch', 14, 6, DIR.RIGHT], ['go', 15, 7], ['djinni', 'Steam'], ['enter', 'aqua_rock'], ['ckpt', 'aqua_done'], ['enter', 'world_tla'],
  // ---- Tundaria Tower (Center Prong): Parch on the two pools; the right way, the 365 coins, the black ice (the
  // Mint, then the way back and the centre way up); the hub: Pound on the icy columns (Crystal Powder, Hard Nut),
  // the lower ice and Reflux, the right way's columns and the pillar under the ladder, the back room's icy wall
  // (Reveal), outside the pillar and the Burst Brooch, Burst on the brown wall; the ice crystal (Center Prong);
  // Burst on the left way's wall for the four chests; Wheeze in the inlet ----
  ['world', 'tundaria'], ['shot', 'tundaria'], ['enter', 'tt_1'], ['shot', 'tundaria_hall'], ['cast', 'Parch', 6, 8, DIR.LEFT], ['expect', 'tt_pool_l_dry'], ['cast', 'Parch', 17, 8, DIR.RIGHT], ['expect', 'tt_pool_r_dry'],
  ['enter', 'tt_2'], ['chest', 16, 3], ['enter', 'tt_ice1'], ['go', 17, 10], ['slide', 'U'], ['enter', 'tt_ice2'], ['shot', 'tundaria_ice'],
  ['slide', 'RURURDR'], ['chest', 20, 8], ['expect', 'item:Mint'], ['slide', 'URD'], ['expectMap', 'tt_2'], ['enter', 'tt_ice1'], ['go', 17, 10], ['slide', 'U'], ['enter', 'tt_ice2'], ['slide', 'RURURUL'], ['expectMap', 'tt_hub'], ['ckpt', 'tundaria_hub'],
  ['enter', 'tt_pound'], ['psyat', 'Pound', 'tt_col1'], ['enter', 'tt_pound2'], ['psyat', 'Pound', 'tt_col2'], ['chest', 3, 2], ['expect', 'item:Crystal Powder'], ['psyat', 'Pound', 'tt_col4'], ['chest', 12, 2], ['expect', 'item:Hard Nut'], ['enter', 'tt_pound'], ['enter', 'tt_hub'],
  ['enter', 'tt_ice3'], ['slide', 'URDRURDRU'], ['djinni', 'Reflux'], ['slide', 'LDL'], ['enter', 'tt_hub'],
  ['enter', 'tt_ice4'], ['go', 2, 10], ['psyat', 'Pound', 'tt_col5'], ['push', 'tt_p4', DIR.RIGHT, 1], ['enter', 'tt_back'], ['go', 6, 7], ['psy', 'Reveal'], ['go', 6, 5], ['enter', 'tundaria'],
  ['go', 27, 13], ['cast', 'Move', 28, 13, DIR.RIGHT, DIR.DOWN], ['chest', 29, 13], ['expect', 'item:Burst Brooch'], ['go', 26, 20], ['cast', 'Burst', 20, 19, DIR.UP], ['expect', 'tt_shortcut'], ['enter', 'tt_1'],
  ['enter', 'tt_center'], ['psyat', 'Burst', 'tt_crystal'], ['expect', 'item:Center Prong'], ['ckpt', 'center_prong'], ['enter', 'tt_1'],
  ['enter', 'tt_left'], ['psyat', 'Burst', 'tt_icewall'], ['expect', 'tt_left_open'], ['enter', 'tt_left2'], ['chest', 3, 3], ['chest', 8, 3], ['enter', 'tt_left3'], ['chest', 3, 3], ['chest', 8, 3], ['expect', 'item:Lightning Sword'], ['expect', 'item:Sylph Feather'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  ['sail', 126, 248], ['djinni', 'Wheeze'], ['ckpt', 'tundaria_done'],   /* Wheeze's beach is a dead-end inlet: sailed to, not walked to (the river cuts it off from the tower) */
  // ---- Izumo under the serpent: the inn, the market stand, Kushinada in her house, Uzume; Gaia Rock: the pillar off
  // its ledge and into the gap, the right wall to the Nut, the slide, the leftmost route to the vine (Whirlwind swings
  // the party across), the brown pillar off its edge and into the lower gap, the faces (the right-hand climbs, then
  // the centre), the summit's Apple past the sunk pillar, the pillar Moved down to clear the altar, Reveal for the
  // Dancing Idol; inside: the idol on the altar, the right way's bushes for the platforms, the left way over them to
  // the great hall - the Mad Plant, the first altar, the junctions to the cobweb (the altar falls), the bushes and
  // the two altars below (four lights); the centre way's two rocks, the twelve plants of the maze (Growth), Mimic 5
  // and the Rusty Mace, the Serpent in the light, Sand, the Cloud Brand under the water behind its tail ----
  ['world', 'izumo'], ['shot', 'izumo'], ['enter', 'izumo_inn'], ['inn'], ['enter', 'izumo'], ['shop', 'izumo_item_seller'], ['shop', 'izumo_weapon_seller'],
  ['enter', 'izumo_house1'], ['expect', 'kushinada_seen'], ['enter', 'izumo'], ['enter', 'izumo_uzume'], ['talk', 'Uzume'], ['enter', 'izumo'], ['ckpt', 'izumo'], ['enter', 'world_tla'],
  ['level', 26], ['world', 'gaia_rock'], ['shot', 'gaia_rock'], ['go', 14, 26], ['expect', 'gaia_entered'],
  ['go', 2, 16], ['push', 'gr_p1', DIR.RIGHT, 2], ['go', 6, 20], ['push', 'gr_p1', DIR.RIGHT, 2], ['go', 12, 20], ['enter', 'gaia_rock_2'], ['shot', 'gaia_rock_2'],
  ['go', 33, 18], ['go', 33, 12], ['chest', 25, 16], ['expect', 'item:Nut'], ['go', 24, 12], ['drop', 23, 12], ['expectMap', 'gaia_rock_2'],
  ['go', 12, 9], ['cast', 'Whirlwind', 13, 9, DIR.RIGHT], ['idle'], ['go', 19, 9], ['push', 'gr_p2', DIR.LEFT, 3], ['go', 22, 9], ['go', 22, 15], ['push', 'gr_p2', DIR.LEFT, 3], ['go', 8, 15], ['ckpt', 'gaia_wall'],
  ['enter', 'gaia_rock_3'], ['shot', 'gaia_rock_3'], ['go', 31, 30], ['dodge', 31, 24], ['dodge', 18, 18], ['dodge', 18, 12], ['dodge', 18, 6], ['go', 18, 1], ['enter', 'gaia_rock_top'], ['shot', 'gaia_rock_top'],
  ['chest', 4, 9], ['expect', 'item:Apple'], ['cast', 'Move', 2, 14, DIR.LEFT, DIR.DOWN], ['go', 2, 6], ['cast', 'Reveal', 2, 5, DIR.UP], ['use', 2, 5], ['expect', 'item:Dancing Idol'], ['ckpt', 'dancing_idol'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  ['world', 'gaia_rock'], ['enter', 'gaia_rock_in_1'], ['shot', 'gaia_rock_in_1'], ['use', 10, 10], ['expect', 'gaia_idol_placed'],
  ['enter', 'gaia_rock_in_r'], ['psyat', 'Whirlwind', 'gr_bushes_r'], ['expect', 'gaia_platforms'], ['enter', 'gaia_rock_in_p'], ['shot', 'gaia_platforms'], ['enter', 'gaia_rock_in_r'], ['enter', 'gaia_rock_in_1'],
  ['enter', 'gaia_rock_in_l'], ['enter', 'gaia_rock_in_p'], ['enter', 'gaia_rock_in_hub'], ['shot', 'gaia_hub'], ['ckpt', 'gaia_hub'],
  ['enter', 'gaia_rock_in_plant'], ['psyat', 'Whirlwind', 'gr_mad'], ['expect', 'gaia_mad_plant'], ['enter', 'gaia_rock_in_hub'],
  ['enter', 'gaia_rock_in_a1'], ['use', 3, 10], ['expect', 'gaia_light1'], ['enter', 'gaia_rock_in_hub'],
  ['enter', 'gaia_rock_in_x'], ['enter', 'gaia_rock_in_web'], ['psyat', 'Whirlwind', 'gr_web'], ['expect', 'gaia_altar_fell'], ['drop', 7, 3], ['expectMap', 'gaia_rock_in_a2'],
  ['use', 7, 4], ['expect', 'gaia_light3'], ['psyat', 'Whirlwind', 'gr_bushes_2'], ['expect', 'gaia_light2'], ['use', 3, 10], ['expect', 'gaia_light4'], ['shot', 'gaia_lights'], ['ckpt', 'gaia_lights'], ['enter', 'gaia_rock_in_hub'],
  ['enter', 'gaia_rock_in_p'], ['enter', 'gaia_rock_in_l'], ['enter', 'gaia_rock_in_1'], ['enter', 'gaia_rock_in_c'],
  ['push', 'gr_rock1', DIR.UP, 2], ['cast', 'Move', 8, 10, DIR.UP, DIR.RIGHT], ['cast', 'Move', 8, 5, DIR.UP, DIR.LEFT], ['enter', 'gaia_maze_1'], ['shot', 'gaia_maze'],
  ['psyat', 'Growth', 'gm_sprout1'], ['expect', 'gaia_maze_1'], ['enter', 'gaia_maze_2'],
  ['psyat', 'Growth', 'gm_sprout2'], ['expect', 'gaia_maze_2'], ['enter', 'gaia_maze_3'],
  ['psyat', 'Growth', 'gm_sprout3'], ['expect', 'gaia_maze_3'], ['chest', 2, 7], ['expect', 'item:Game Ticket'], ['enter', 'gaia_maze_4'],
  ['psyat', 'Growth', 'gm_sprout4'], ['expect', 'gaia_maze_4'], ['enter', 'gaia_maze_5'],
  ['psyat', 'Growth', 'gm_sprout5'], ['expect', 'gaia_maze_5'], ['enter', 'gaia_maze_6'],
  ['psyat', 'Growth', 'gm_sprout6'], ['expect', 'gaia_maze_6'], ['enter', 'gaia_maze_7'],
  ['psyat', 'Growth', 'gm_sprout7'], ['expect', 'gaia_maze_7'], ['chest', 9, 7], ['expect', 'item:Rusty Mace B'], ['enter', 'gaia_maze_8'],
  ['psyat', 'Growth', 'gm_sprout8'], ['expect', 'gaia_maze_8'], ['enter', 'gaia_maze_9'],
  ['psyat', 'Growth', 'gm_sprout9'], ['expect', 'gaia_maze_9'], ['enter', 'gaia_maze_10'],
  ['psyat', 'Growth', 'gm_sprout10'], ['expect', 'gaia_maze_10'], ['enter', 'gaia_maze_11'],
  ['psyat', 'Growth', 'gm_sprout11'], ['expect', 'gaia_maze_11'], ['enter', 'gaia_maze_12'],
  ['psyat', 'Growth', 'gm_sprout12'], ['expect', 'gaia_maze_12'], ['enter', 'gaia_rock_in_lair'],
  ['shot', 'serpent_lair'], ['healhere'], ['ckpt', 'serpent_lair'], ['trig', 'TLA.serpent'], ['idle'], ['expect', 'serpent_done'], ['shot', 'serpent_beaten'], ['use', 14, 12], ['expect', 'sand_learned'],
  ['go', 21, 10], ['psy', 'Sand', DIR.UP], ['go', 21, 7], ['use', 25, 6], ['expect', 'item:Cloud Brand'], ['psy', 'Sand', DIR.DOWN], ['go', 21, 10], ['ckpt', 'gaia'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- Susa's bout (class item: the Dancer's Anklet); Rhythm on the shrine's three chimes ----
  ['world', 'izumo'], ['teacher', 'susa_spar', 'susa_done', 3], ['expect', 'susa_done'], ['expect', "item:Dancer's Anklet"], ['cast', 'Rhythm', 20, 5, DIR.UP], ['cast', 'Rhythm', 21, 5, DIR.UP], ['cast', 'Rhythm', 27, 5, DIR.UP], ['expect', 'izumo_chimes'], ['enter', 'world_tla'], ['ckpt', 'susa'],
  // ---- Izumo again: Susa at the foot of the rock, the heroes' welcome, the Dancing Idol for Coal, Susa's token; the
  // ring of stones (Move), Reveal for the way down, the ruins: Sand under the columns, Frost on the two puddles, Pound
  // and Sand and the brown pillar into the gap, Phantasmal Mail, Pound, Parch, Ulysses ----
  ['world', 'gaia_rock'], ['try', ['talk', 'SusaOut']], ['enter', 'world_tla'],
  ['world', 'izumo'], ['enter', 'izumo_uzume'], ['idle'], ['expect', 'izumo_after'], ['talk', 'Uzume'], ['expect', 'coal_got'], ['enter', 'izumo'], ['idle'], ['expect', 'susa_token'], ['enter', 'izumo_inn'], ['inn'], ['enter', 'izumo'],
  ['go', 20, 7], ['cast', 'Move', 20, 8, DIR.DOWN, DIR.RIGHT], ['expect', 'izumo_ring'], ['talk', 'iz_008'], ['go', 24, 9], ['cast', 'Reveal', 24, 8, DIR.UP], ['go', 24, 8], ['idle'], ['expectMap', 'izumo_ruins'], ['shot', 'izumo_ruins'],
  ['go', 8, 9], ['psy', 'Sand', DIR.RIGHT], ['go', 13, 9], ['go', 17, 9], ['cast', 'Frost', 18, 9, DIR.RIGHT], ['go', 18, 9], ['cast', 'Frost', 19, 9, DIR.RIGHT], ['go', 21, 9], ['enter', 'izumo_ruins_2'], ['shot', 'izumo_ruins_2'],
  ['go', 9, 15], ['psyat', 'Pound', 'ir_col'], ['go', 15, 15], ['psy', 'Sand', DIR.RIGHT], ['go', 18, 15], ['go', 20, 15], ['push', 'ir_brown', DIR.UP, 5], ['go', 21, 10], ['go', 22, 6], ['enter', 'izumo_ruins_3'], ['shot', 'izumo_ruins_3'],
  ['chest', 21, 9], ['expect', 'item:Phantasmal Mail'], ['psyat', 'Pound', 'ir_col2'], ['go', 8, 10], ['cast', 'Parch', 6, 9, DIR.LEFT], ['expect', 'ir_pool_dry'], ['use', 4, 2], ['expect', 'ulysses_taken'], ['ckpt', 'izumo_ruins'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'izumo'], ['enter', 'world_tla'],
  // ---- 8C: the animal trade across the islets, now that Sand is known - E Tundaria (the floes across the cold sea,
  // the log into the channel, Pengulina home: the Pretty Stone), SE Angara (the crate into the gap, Frost on the
  // puddle, the vines to the nest: the Red Cloth), N Osenia (Sand under the yard's fence: Milk), West Indra (the dog
  // in the salt water: the Li'l Turtle), the Sea of Time Islet (Lonesome George and his secret spot), and the Islet
  // Cave's first rooms (Turtle Boots, the poles, Meld, the Rusty Staff) ----
  ['world', 'e_tundaria_islet'], ['expectMap', 'e_tundaria_islet'], ['shot', 'e_tundaria_islet'], ['enter', 'e_tundaria_hut'], ['enter', 'e_tundaria_islet'],
  ['go', 17, 15], ['berg', 'et_berg1', 11, 15], ['go', 10, 15], ['berg', 'et_berg2', 4, 15], ['go', 3, 8], ['roll', 'et_log', DIR.RIGHT], ['idle'], ['expect', 'et_log_rolled'], ['talk', 'pengulina'], ['idle'], ['expect', 'pengulina_home'],
  ['go', 7, 8], ['talk', 'pengus'], ['expect', 'item:Pretty Stone'], ['shot', 'pengus'], ['enter', 'world_tla'],
  ['world', 'se_angara_islet'], ['expectMap', 'se_angara_islet'], ['shot', 'se_angara_islet'], ['try', ['talk', 'sa_man1']], ['enter', 'se_angara_tent'], ['enter', 'se_angara_islet'],
  ['push', 'sa_crate', DIR.LEFT, 3], ['push', 'sa_crate', DIR.UP, 2], ['cast', 'Move', 6, 23, DIR.UP], ['go', 6, 22], ['psy', 'Frost', DIR.UP], ['go', 6, 17], ['talk', 'sa_bird'], ['expect', 'item:Red Cloth'], ['shot', 'fancy_bird'], ['enter', 'world_tla'],
  ['world', 'n_osenia_islet'], ['expectMap', 'n_osenia_islet'], ['shot', 'n_osenia_islet'], ['enter', 'n_osenia_home'], ['enter', 'n_osenia_islet'],
  ['go', 12, 6], ['psy', 'Sand', DIR.RIGHT], ['go', 16, 6], ['talk', 'no_cow'], ['idle'], ['expect', 'item:Milk'], ['go', 16, 6], ['psy', 'Sand', DIR.LEFT], ['go', 12, 6], ['enter', 'world_tla'],
  ['world', 'w_indra_islet'], ['expectMap', 'w_indra_islet'], ['shot', 'w_indra_islet'], ['enter', 'w_indra_hut'], ['enter', 'w_indra_islet'], ['talk', 'wi_dog'], ['expect', "item:Li'l Turtle"], ['enter', 'world_tla'],
  ['world', 'sea_of_time_islet'], ['expectMap', 'sea_of_time_islet'], ['shot', 'sea_of_time_islet'], ['enter', 'sea_of_time_hut'], ['enter', 'sea_of_time_islet'], ['talk', 'lonesome_george'], ['idle'], ['expect', 'islet_open'], ['expectMap', 'islet_cave_isle'], ['shot', 'islet_cave_isle'],
  ['enter', 'islet_cave'], ['expectMap', 'islet_cave'], ['shot', 'islet_cave'], ['chest', 4, 20], ['expect', 'item:Turtle Boots'], ['enter', 'islet_cave_e'], ['expectMap', 'islet_cave_e'], ['shot', 'islet_cave_e'],
  ['go', 7, 26], ['ride', 'ice_pole1', DIR.RIGHT], ['go', 21, 26], ['go', 21, 20], ['ride', 'ice_pole2', DIR.UP], ['go', 20, 4], ['djinni', 'Meld'], ['go', 8, 3], ['ride', 'ice_pole3', DIR.LEFT], ['go', 3, 3], ['chest', 2, 3], ['expect', 'item:Rusty Staff'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'islet_cave_isle'], ['talk', 'george_here'], ['idle'], ['expectMap', 'sea_of_time_islet'], ['ckpt', 'islet_trade'], ['enter', 'world_tla'],
  // ---- Ankohl Ruins (Left Prong), Tundaria Tower (Center Prong), Champa (Trident) ----
  // ---- Ankohl Ruins: the centre bush, the six faces (Crystal Powder, 210 coins, Sand to the Nut, the overgrowth and
  // the column), the west hall's lowest path, Sand to the Thanatos Mace, the face's left half, the bush over the
  // sand-filled floor, the cellar (Power Bread, Sand, the pillar through the wall, Sand under it for the Vial, 365
  // coins), the switches and the rising sand, the gaps and the slide, the brown pillar and the face's part, the
  // pillar in the upper passage, Sand on the way back; the east hall (Sand to the stair, Muni Robe, the blocks,
  // Sylph Feather, the quicker switches, the Potion past the pillar and the vines and the gap), the face made whole,
  // its corridor and the sand, the pillar between the halls, Reveal and the part into the gap, the last face, Sand
  // to the corner stair, and the Left Prong from the face on the roof ----
  ['world', 'ankohl'], ['shot', 'ankohl'], ['go', 12, 24], ['expect', 'ankohl_entered'], ['enter', 'ank_1'], ['shot', 'ank_1'], ['psyat', 'Whirlwind', 'ank_bush1'], ['enter', 'ank_hub'], ['shot', 'ank_hub'],
  ['cast', 'Move', 23, 5, DIR.UP, DIR.LEFT], ['enter', 'ank_m6'], ['chest', 4, 1], ['expect', 'item:Crystal Powder'], ['enter', 'ank_hub'],
  ['cast', 'Move', 19, 5, DIR.UP, DIR.LEFT], ['enter', 'ank_m5'], ['psyat', 'Whirlwind', 'ank_bush5'], ['cast', 'Move', 6, 3, DIR.UP, DIR.UP], ['expect', 'ank_col5'], ['enter', 'ank_hub'],
  ['cast', 'Move', 15, 5, DIR.UP, DIR.LEFT], ['enter', 'ank_m4'], ['chest', 4, 1], ['enter', 'ank_hub'],
  ['cast', 'Move', 11, 5, DIR.UP, DIR.LEFT], ['enter', 'ank_m3'], ['go', 4, 3], ['psy', 'Sand', DIR.LEFT], ['go', 1, 3], ['chest', 2, 1], ['expect', 'item:Nut'], ['go', 1, 3], ['psy', 'Sand', DIR.RIGHT], ['go', 5, 5], ['enter', 'ank_hub'],
  ['cast', 'Move', 7, 5, DIR.UP, DIR.LEFT], ['cast', 'Move', 3, 5, DIR.UP, DIR.LEFT], ['ckpt', 'ankohl_hub'],
  ['enter', 'ank_l1'], ['shot', 'ank_l1'], ['enter', 'ank_l2'], ['go', 7, 5], ['psy', 'Sand', DIR.RIGHT], ['go', 10, 5], ['chest', 11, 2], ['expect', 'item:Thanatos Mace'], ['go', 9, 5], ['psy', 'Sand', DIR.LEFT], ['go', 7, 3], ['enter', 'ank_l3'],
  ['push', 'ank_half_l', DIR.RIGHT, 4], ['expect', 'ank_sand1'], ['enter', 'ank_l2'], ['enter', 'ank_l1'], ['go', 1, 2], ['psyat', 'Whirlwind', 'ank_bush_l1'], ['expect', 'ank_stairs'], ['enter', 'ank_b1'], ['shot', 'ank_b1'],
  ['chest', 2, 7], ['expect', 'item:Power Bread'], ['go', 12, 4], ['psy', 'Sand', DIR.DOWN], ['go', 12, 7], ['enter', 'ank_b2'], ['shot', 'ank_b2'],
  ['go', 20, 8], ['push', 'ank_b2_pil', DIR.LEFT, 1], ['expect', 'ank_b2_pillar'], ['enter', 'ank_b3'], ['chest', 11, 9], ['go', 7, 5], ['psy', 'Sand', DIR.LEFT], ['go', 5, 5], ['chest', 2, 1], ['expect', 'item:Vial'], ['go', 5, 5], ['psy', 'Sand', DIR.RIGHT], ['go', 7, 5], ['enter', 'ank_b2'], ['ckpt', 'ankohl_cellar'],
  ['enter', 'ank_sw1'], ['shot', 'ank_sw1'], ['use', 2, 4], ['expect', 'ank_sw1_sand'], ['use', 17, 4], ['expect', 'ank_sw1_done'], ['enter', 'ank_gaps'], ['shot', 'ank_gaps'], ['go', 19, 3], ['drop', 19, 2], ['expectMap', 'ank_pillars'], ['shot', 'ank_pillars'],
  ['push', 'ank_brown', DIR.LEFT, 2], ['push', 'ank_part2', DIR.LEFT, 9], ['expect', 'ank_face2'], ['enter', 'ank_p2'], ['go', 18, 6], ['push', 'ank_p2_pil', DIR.UP, 4], ['expect', 'ank_p2_pillar'], ['enter', 'ank_pillars'],
  ['go', 18, 9], ['enter', 'ank_back'], ['go', 6, 3], ['psy', 'Sand', DIR.RIGHT], ['go', 10, 3], ['enter', 'ank_hub'], ['ckpt', 'ankohl_back'],
  ['enter', 'ank_r1'], ['shot', 'ank_r1'], ['go', 3, 6], ['psy', 'Sand', DIR.RIGHT], ['go', 7, 6], ['enter', 'ank_r2'], ['psyat', 'Whirlwind', 'ank_bush_r2'], ['chest', 1, 1], ['expect', 'item:Muni Robe'], ['enter', 'ank_r3'], ['shot', 'ank_r3'],
  ['go', 11, 6], ['psy', 'Sand', DIR.LEFT], ['go', 7, 6], ['go', 2, 6], ['enter', 'ank_r4'], ['psyat', 'Whirlwind', 'ank_bush_r4'], ['chest', 1, 1], ['expect', 'item:Sylph Feather'],
  ['enter', 'ank_sw2'], ['use', 2, 4], ['expect', 'ank_sw2_sand'], ['use', 17, 4], ['expect', 'ank_sw2_done'], ['enter', 'ank_r5'], ['psyat', 'Whirlwind', 'ank_bush_r5'], ['cast', 'Move', 16, 4, DIR.RIGHT, DIR.UP], ['chest', 15, 1], ['expect', 'item:Potion'],
  ['enter', 'ank_face_r'], ['push', 'ank_half_r', DIR.UP, 2], ['push', 'ank_half_r', DIR.LEFT, 4], ['expect', 'ank_eyes'], ['ckpt', 'ankohl_face'],
  ['enter', 'ank_chase'], ['dodge', 8, 5], ['psy', 'Sand'], ['until', () => { const o = G.map.objects.find(x => x.id === 'ank_awake'); return !!o && o.dx < 0 && o.x <= 5; }, 1500], ['dodge', 20, 5], ['go', 20, 4],   /* burrowed in the sand patch the face passes over; once it is past and heading west, run east behind it */ ['psy', 'Sand', DIR.UP], ['go', 20, 1], ['enter', 'ank_f2'], ['cast', 'Move', 9, 4, DIR.RIGHT, DIR.RIGHT], ['cast', 'Move', 10, 4, DIR.RIGHT, DIR.RIGHT], ['go', 18, 4], ['enter', 'ank_reveal'], ['shot', 'ank_reveal'],
  ['push', 'ank_part3', DIR.RIGHT, 2], ['go', 7, 5], ['cast', 'Reveal', 8, 6, DIR.DOWN], ['push', 'ank_part3', DIR.RIGHT, 1], ['expect', 'ank_gap_filled'], ['enter', 'ank_end'], ['shot', 'ank_end'],
  ['push', 'ank_part4', DIR.LEFT, 4], ['expect', 'ank_face3'], ['go', 2, 4], ['psy', 'Sand', DIR.DOWN], ['go', 2, 6], ['enter', 'ankohl_top'], ['shot', 'ankohl_top'], ['use', 9, 4], ['expect', 'item:Left Prong'], ['ckpt', 'left_prong'],
  ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- Alhafra: Burst on the rock on the mast, the mayor's night, Briggs' escape and the ship sailing off ----
  ['world', 'alhafra'], ['enter', 'alhafra_east'], ['shot', 'alhafra_wreck'], ['go', 20, 23], ['cast', 'Move', 21, 23, DIR.RIGHT, DIR.DOWN], ['go', 22, 23], ['roll', 'ae_log', DIR.RIGHT], ['go', 25, 23], ['cast', 'Move', 25, 24, DIR.DOWN, DIR.RIGHT], ['go', 25, 24], ['cast', 'Move', 25, 25, DIR.DOWN, DIR.RIGHT],
  ['go', 30, 29], ['cast', 'Move', 30, 28, DIR.UP, DIR.UP], ['go', 30, 25], ['psyat', 'Pound', 'ae_cone'], ['go', 30, 23], ['psyat', 'Lash', 'ae_rope'], ['go', 29, 23], ['use', 28, 23], ['idle'], ['try', ['use', 28, 23]], ['idle'], ['expect', 'alhafra_ship_fixed'], ['expect', 'briggs_escaped'], ['shot', 'briggs_escaped'],
  ['enter', 'alhafra'], ['enter', 'alhafra_east'], ['go', 8, 22], ['idle'], ['expect', 'alhafra_tirade'], ['enter', 'alhafra'], ['enter', 'alhafra_inn'], ['inn'], ['enter', 'alhafra'], ['ckpt', 'briggs_escaped'], ['enter', 'world_tla'],
  // ---- Champa: the fed village, the pirates at the cave door, up the cliff (the Sleep Bomb, the Lucky Medal on the
  // ledge), Obaba's Avimander, the reconciliation, the prongs and the Trident, Alex and Karst and Agatio on the way out ----
  ['world', 'champa'], ['shot', 'champa'], ['enter', 'champa_inn'], ['inn'], ['enter', 'champa'], ['enter', 'champa_itemshop'], ['shop'], ['enter', 'champa'], ['enter', 'champa_sanctum'], ['enter', 'champa'], ['cast', 'Reveal', 21, 23, DIR.RIGHT], ['chest', 21, 23], ['expect', 'item:Viking Helm'],
  ['go', 27, 27], ['idle'], ['expect', 'champa_briggs_run'], ['enter', 'champa_cliff_1'], ['shot', 'champa_cliff'], ['enter', 'champa_cliff_2'], ['enter', 'champa_cliff_3'], ['enter', 'champa'], ['enter', 'champa_cliff_3'],
  ['healhere'], ['ckpt', 'champa_forge'], ['enter', 'champa_obaba'], ['idle'], ['expect', 'champa_avimander'], ['shot', 'avimander_beaten'], ['talk', 'Obaba'], ['expect', 'trident_forged'], ['shot', 'trident'], ['ckpt', 'trident'],
  ['enter', 'champa_cliff_3'], ['enter', 'champa_cliff_2'], ['enter', 'champa_cliff_1'], ['enter', 'champa'], ['go', 27, 33], ['idle'], ['expect', 'champa_alex'], ['shot', 'champa_alex'], ['ckpt', 'champa_done'], ['teacher', 'redbeard', 'redbeard_done', 3], ['expect', 'redbeard_done'], ['expect', "item:Pirate's Bandana"],   /* the class item: Redbeard's bandana, won on the dock */ ['enter', 'world_tla'],
  // ---- Sea of Time -> Lemuria ----
  ['world', 'izumo'], ['shop', 'izumo_weapon_seller'], ['enter', 'izumo_inn'], ['inn'], ['enter', 'izumo'], ['enter', 'world_tla'],
  // ---- the open sea: everything a ship unlocks before Poseidon - Djinn, caves and shops across the Eastern Sea (the west waits for the Grindstone) ----
  ['world', 'alhafra'], ['enter', 'alhafra_jail'], ['enter', 'alhafra_cave'], ['cast', 'Frost', 25, 11, 2], ['chest', 26, 10], ['chest', 27, 12], ['chest', 26, 13], ['enter', 'alhafra_jail'], ['enter', 'alhafra'], ['enter', 'world_tla'],
  // Air's Rock's face again, with Frost: the puddle off the first ledge frozen, the Vial beyond it
  ['world', 'airs_rock'], ['enter', 'airs_rock_wall'], ['go', 14, 36], ['cast', 'Frost', 15, 36, 2], ['chest', 20, 36], ['expect', 'item:Vial'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // Apojii again, with Sand: under the rocks on the east beach, down the cascade, Whirlwind on the third overgrowth in the cave, Haze
  ['world', 'apojii'], ['enter', 'apojii_east'], ['go', 12, 12], ['psy', 'Sand', DIR.RIGHT], ['go', 20, 12], ['drop', 27, 12], ['enter', 'apojii_cave'], ['cast', 'Whirlwind', 16, 2, DIR.UP], ['enter', 'apojii_cave_2'], ['djinni', 'Haze'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],   /* the cascade dropped is not climbed back: Retreat puts the party on the world map */
  ['world', 'e_tundaria_islet'], ['shot', 'e_tundaria_islet'], ['explore'], ['enter', 'world_tla'],
  ['ckpt', 'open_sea'], ['try', ['sail', 126, 248]], ['try', ['djinni', 'Wheeze']],   /* the inlet west of the tower, in case Wheeze was passed by */
  ['optional'],
  // ---- the Sea of Time, the way Yepp's songs tell it: the stars (twice round the trunk, east, thrice round, the waves),
  // the moon (west, twice round, south, one swirl west, thrice round, the waves), the sun (south, twice round, west,
  // six swirls north, thrice round, the waves), then left and up to Poseidon with the Trident ----
  ['level', 27], ['heal'], ['world', 'sea_of_time'], ['shot', 'sea_of_time'], ['go', 2, 7], ...SOT_LAPS([6, 3], [8, 4], [7, 6], [5, 5], 2), ['expect', 'sot1_laps1'],
  ['go', 30, 4], ...SOT_LAPS([33, 3], [35, 4], [34, 6], [32, 5], 3), ['expect', 'sot1_laps2'], ['until', SOT_CALM, 900], ['go', 33, 1], ['enter', 'sea_of_time_2'], ['shot', 'sea_of_time_2'],
  ['go', 9, 2], ...SOT_LAPS([6, 2], [8, 3], [7, 5], [5, 4], 2), ['expect', 'sot2_laps1'], ['go', 6, 19], ['go', 2, 21], ...SOT_LAPS([2, 22], [4, 23], [3, 25], [1, 24], 3), ['expect', 'sot2_laps2'], ['until', SOT_CALM, 900], ['go', 2, 27], ['enter', 'sea_of_time_3'], ['shot', 'sea_of_time_3'],
  ['go', 36, 16], ...SOT_LAPS([36, 17], [38, 18], [37, 20], [35, 19], 2), ['expect', 'sot3_laps1'], ['go', 8, 19], ['go', 8, 7], ...SOT_LAPS([8, 3], [10, 4], [9, 6], [7, 5], 3), ['expect', 'sot3_laps2'], ['until', SOT_CALM, 900], ['go', 8, 1], ['enter', 'sea_of_time_4'], ['shot', 'sea_of_time_4'],
  ['go', 6, 27], ['go', 6, 11], ['ckpt', 'poseidon_reach'], ['trig', 'TLA.poseidon'], ['expect', 'poseidon_done'], ['shot', 'poseidon_beaten'], ['go', 7, 1], ['enter', 'world_tla'], ['expectMap', 'world_tla'], ['ckpt', 'lemuria_open'],
  // ---- Lemuria: the harbour (the Mist Potion under the water in the hold), the old quarter's statue and the
  // guards, the city (the scoop patches, Growth to the Hard Nut, the spring), Piers's uncle, Lunpa's tower by the
  // rope, the council with Hydros (the Grindstone), Grind on the brown rock for Ancient Lemuria and Rime, and
  // Piers's age on the way out ----
  ['world', 'lemuria'], ['shot', 'lemuria_harbor'], ['enter', 'lemuria_ship_hold'], ['cast', 'Parch', 6, 5, DIR.UP], ['expect', 'lem_hold_dry'], ['chest', 8, 2], ['expect', 'item:Mist Potion'], ['enter', 'lemuria_harbor'],
  ['enter', 'lemuria_road'], ['shot', 'lemuria_road'], ['cast', 'Move', 14, 10, DIR.UP, DIR.LEFT], ['idle'], ['expect', 'lemuria_arrived'], ['enter', 'lemuria'], ['shot', 'lemuria'], ['ckpt', 'lemuria'],
  ['go', 25, 27], ['idle'], ['go', 25, 13], ['idle'], ['go', 25, 8], ['idle'], ['expect', 'lem_palace_talk'],
  ['psyat', 'Scoop', 'lem_dig3'], ['expect', 'item:Star Dust'], ['psyat', 'Scoop', 'lem_dig4'], ['psyat', 'Scoop', 'lem_dig1'], ['psyat', 'Scoop', 'lem_dig2'], ['psyat', 'Growth', 'lem_sprout'], ['go', 42, 32], ['psyat', 'Whirlwind', 'lem_bushes'], ['expect', 'item:Hard Nut'],
  ['talk', 'lem_010'], ['expect', 'lem_spring_open'], ['enter', 'lemuria_spring'], ['fountain'], ['enter', 'lemuria'],
  ['enter', 'lemuria_uncle'], ['talk', 'PiersUncle'], ['expect', 'piers_mother'], ['enter', 'lemuria'], ['expect', 'lunpa_letter'],
  ['go', 42, 24], ['idle'], ['expect', 'lunpa_seen'], ['psyat', 'Lash', 'lem_rope'], ['go', 42, 21], ['idle'], ['expectMap', 'lemuria_lunpa'], ['talk', 'LunpaL'], ['expect', 'lunpa_council'], ['enter', 'lemuria'],
  ['enter', 'lemuria_palace'], ['shot', 'lemuria_palace'], ['talk', 'lem_hguard'], ['go', 12, 9], ['idle'], ['expect', 'lemuria_council'], ['expect', 'item:Grindstone'], ['shot', 'hydros'], ['ckpt', 'grindstone'], ['enter', 'lemuria'],
  ['go', 5, 8], ['psyat', 'Grind', 'lem_grind_rock'], ['enter', 'lemuria_ancient'], ['shot', 'lemuria_ancient'], ['cast', 'Whirlwind', 3, 9, DIR.LEFT], ['expect', 'rime_hidden'], ['psyat', 'Tremor', 'anc_statue'], ['djinni', 'Rime'], ['enter', 'lemuria'],
  ['enter', 'lemuria_road'], ['enter', 'lemuria_harbor'], ['go', 14, 22], ['idle'], ['expect', 'piers_age'], ['ckpt', 'lemuria_done'],
  // ---- the vault under Lemuria (class item: the Lemurian Circlet, off the Leviathan Spawn); Ebb for the alcoves ----
  ['enter', 'lemuria'], ['enter', 'sunken_vault'], ['shot', 'sunken_vault'], ['cast', 'Move', 4, 12, DIR.UP, DIR.UP], ['chest', 11, 1], ['healhere'], ['talk', 'boss_leviathan'], ['idle'], ['expect', 'leviathan_done'], ['expect', 'item:Lemurian Circlet'], ['shot', 'leviathan_beaten'],
  ['go', 2, 6], ['psy', 'Ebb'], ['chest', 1, 3], ['chest', 2, 3], ['go', 2, 6], ['go', 21, 6], ['psy', 'Ebb'], ['chest', 21, 3], ['chest', 22, 3], ['go', 21, 6], ['enter', 'lemuria'], ['ckpt', 'sunken_vault'], ['enter', 'world_tla'], ['optional'],
  ['try', ['sail', 126, 248]], ['try', ['djinni', 'Wheeze']],   /* Wheeze, if the Tundaria inlet was passed by (the run that skipped it inside Apojii) */
  // ---- the way west: down the strait through the Gondowan Cliffs from the bay north of them, Grind on the rock in the
  // river, and out to the Western Sea; the rusted sword glinting off Tundaria's coast (the Pirate's Sabre) ----
  ['world', 'gondowan_cliffs'], ['expectMap', 'gondowan_cliffs'], ['cast', 'Grind', 1, 12, DIR.DOWN], ['expect', 'gc_strait_open'], ['go', 1, 30], ['enter', 'world_tla', 1, 31], ['expectMap', 'world_tla'], ['shot', 'western_sea'], ['ckpt', 'western_sea'],
  ['sail', 157, 251], ['use', 157, 252], ['expect', 'item:Rusty Sword C'],
  // ---- SW Atteka Islet at the edge of the world: the pillar off the lower terrace into the rapids, the crate off the
  // upper terrace down the falls to wedge behind it, the Dragon Skin on the islet (the boulder waits for Lift) ----
  ['world', 'sw_atteka_islet'], ['shot', 'sw_atteka_islet'], ['talk', 'swa_man2'], ['go', 13, 29], ['cast', 'Move', 12, 29, DIR.LEFT], ['cast', 'Move', 11, 29, DIR.LEFT], ['expect', 'swa_pillar_sunk'],
  ['go', 13, 16], ['cast', 'Move', 12, 16, DIR.LEFT], ['cast', 'Move', 11, 16, DIR.LEFT], ['expect', 'swa_crate_done'], ['chest', 8, 26], ['expect', 'item:Dragon Skin'], ['ckpt', 'sw_atteka'], ['enter', 'world_tla'],
  // ---- Kalt Island: the old couple in the hut, the frozen river from its foot (LDRULURULURULDL), Lash up the rope at
  // its head, Gel on the ledge; the Apple in the tree waits for Catch ----
  ['world', 'kalt'], ['shot', 'kalt'], ['enter', 'kalt_hut'], ['talk', 'kalt_oldman'], ['talk', 'kalt_oldwoman'], ['enter', 'kalt'], ['go', 9, 22], ['slide', 'LDRULURULURULDL'], ['psyat', 'Lash', 'kalt_rope'], ['djinni', 'Gel'], ['ckpt', 'kalt'], ['enter', 'world_tla'],
  // the rusted staff glinting in the sea's far north-west corner (the Goblin's Rod)
  ['sail', 69, 41], ['use', 69, 40], ['expect', 'item:Rusty Staff C'],
  // ---- Gondowan Settlement under Magma Rock: Cyclone on the leftmost bush for the stair to the Star Dust, the Lucky
  // Medal in the middle-left grave ----
  ['world', 'gondowan_settlement'], ['shot', 'gondowan_settlement'], ['talk', 'gs_man'], ['psyat', 'Cyclone', 'gs_bush'], ['expect', 'gs_stair_found'], ['enter', 'gondowan_cellar'], ['chest', 6, 3], ['expect', 'item:Star Dust'], ['enter', 'gondowan_settlement'], ['try', ['use', 15, 16]], ['ckpt', 'gondowan_settlement'], ['enter', 'world_tla'],
  // ---- Hesperia Settlement: up the left vine, Growth on the plant, the crate down the leftmost gap, down again, right
  // into the pit at the pen's wall, over it to Tinder and the back room's 166 coins ----
  ['world', 'hesperia_settlement'], ['shot', 'hesperia_settlement'], ['enter', 'hesperia_home'], ['talk', 'hs_woman'], ['enter', 'hesperia_settlement'], ['go', 8, 21], ['psyat', 'Growth', 'hs_sprout'], ['go', 6, 13],
  ['cast', 'Move', 4, 11, DIR.DOWN], ['cast', 'Move', 4, 12, DIR.DOWN], ['cast', 'Move', 4, 13, DIR.DOWN], ['drop', 7, 14], ['expectMap', 'hesperia_settlement'],
  ['cast', 'Move', 4, 17, DIR.DOWN], ['cast', 'Move', 4, 18, DIR.DOWN], ['cast', 'Move', 4, 19, DIR.DOWN], ['cast', 'Move', 4, 20, DIR.DOWN], ['cast', 'Move', 4, 21, DIR.DOWN], ['drop', 4, 22],
  ['cast', 'Move', 4, 25, DIR.RIGHT], ['cast', 'Move', 5, 25, DIR.RIGHT], ['cast', 'Move', 6, 25, DIR.RIGHT], ['cast', 'Move', 7, 25, DIR.RIGHT], ['cast', 'Move', 8, 25, DIR.RIGHT], ['cast', 'Move', 9, 25, DIR.RIGHT], ['expect', 'hs_crate_placed'],
  ['djinni', 'Tinder'], ['enter', 'hesperia_back'], ['chest', 3, 2], ['enter', 'hesperia_settlement'], ['ckpt', 'hesperia_settlement'], ['enter', 'world_tla'],
  // ---- Hesperia's north: ashore on the north-east beach and up the river's left bank to its dead end, where Petra
  // wanders; then Atteka's western beach, and Core in the clearing east of it ----
  ['heal'], ['land', 54, 144], ['djinni', 'Core'], ['ckpt', 'core'],
  // ---- Atteka Inlet: the ship at its berth, the Wings of Anemos on the sand and the four who guard them; the garden
  // under the road, the ladder to the shrine's terrace and along the cliff, down the vine to the Vial ----
  ['world', 'atteka_beach'], ['expectMap', 'atteka_beach'], ['shot', 'atteka_beach'], ['talk', 'ai_g2'],   // the inlet's beach is the berth: put in there (by sea, or on foot along the shore) ['enter', 'atteka_inlet'], ['shot', 'atteka_inlet'], ['go', 14, 9], ['enter', 'atteka_beach', 26, 5], ['chest', 27, 13], ['expect', 'item:Vial'], ['enter', 'atteka_inlet', 0, 5], ['ckpt', 'atteka_inlet'], ['enter', 'world_tla', 9, 0], ['expectMap', 'world_tla'],
  // ---- Contigo, the village of the Anemos: the armory, the item shop and the inn (the Corn on the chef's table),
  // Lucky Wheels and the dice tents, Scoop in the open middle of the bush patch for Salt, Cyclone on the corner
  // bush for the Bramble Seed, the Power Bread by the sanctum, the wing building on the geoglyph in the crater and
  // the sealed sanctum; the stump waits for Force, with Isaac ----
  ['world', 'contigo'], ['shot', 'contigo'], ['enter', 'contigo_weaponshop'], ['shop'], ['enter', 'contigo'], ['enter', 'contigo_itemshop'], ['shop'], ['enter', 'contigo'], ['enter', 'contigo_inn'], ['inn'], ['enter', 'contigo'],
  ['enter', 'contigo_lucky'], ['try', ['talk', 'contigo_game_master']], ['enter', 'contigo'], ['psyat', 'Scoop', 'contigo_salt'], ['djinni', 'Salt'], ['go', 33, 20], ['talk', 'con_021'], ['go', 23, 4], ['enter', 'contigo_house4'], ['talk', 'con_ahri'], ['enter', 'contigo'], ['ckpt', 'contigo'], ['enter', 'world_tla'],
  // ---- Shaman Village Cave from the Hesperian coast: the middle way blocked by the boulder (Eddy's, for Lift), the
  // left way and Whirlwind on the overgrowth, the ring round to the cave beyond, the brown pillar two spots right and
  // off the ledge for the shortcut, the cleric, and out into Shaman Village ----
  ['level', 30], ['world', 'shaman_cave'], ['expectMap', 'shaman_cave'], ['shot', 'shaman_cave'], ['enter', 'shaman_cave_3', 12, 0], ['try', ['go', 14, 16]], ['enter', 'shaman_cave', 14, 25], ['enter', 'shaman_cave_3', 4, 0],
  ['psyat', 'Whirlwind', 'svc_vines'], ['shot', 'shaman_cave_3'], ['enter', 'shaman_cave_2', 27, 14], ['cast', 'Move', 17, 4, DIR.RIGHT], ['cast', 'Move', 18, 4, DIR.RIGHT], ['expect', 'svc_shortcut'], ['shot', 'shaman_cave_2'], ['talk', 'svc_cleric'], ['enter', 'shaman', 31, 11], ['expectMap', 'shaman'], ['shot', 'shaman'], ['ckpt', 'shaman_village'],
  // ---- Shaman Village, silent: the inn (the Elixir in the cellar's white jar), out the cellar's back door and north to
  // the plant, Growth up to the Spirit Gloves; Moapa's house (the Weasel's Claw in the cellar's barrel) and Moapa on
  // his step: the rod shown, and the way of the vanishing sand ----
  ['talk', 'sv_001'], ['enter', 'shaman_inn'], ['inn'], ['enter', 'shaman_inn_cellar'], ['enter', 'shaman', 8, 6], ['expectMap', 'shaman'], ['psyat', 'Growth', 'sv_sprout'], ['chest', 2, 12], ['expect', 'item:Spirit Gloves'], ['enter', 'shaman_inn_cellar'], ['enter', 'shaman_inn'], ['enter', 'shaman'],
  ['go', 7, 10], ['idle'], ['expect', 'moapa_trial'], ['enter', 'shaman_moapa'], ['enter', 'shaman_moapa_cellar'], ['enter', 'shaman_moapa'], ['enter', 'shaman'], ['ckpt', 'moapa_met'],
  // ---- Trial Road: the sand and the Wind Stone (Sheba), Moapa's rules at the two mouths, then the left road - Sand up
  // the stream and the overgrowth's vine; the upright log rolled aside, the pillar Moved, the long log rolled up into
  // the water; the bush-hidden pillar into the gap, the left vine, the hop, the centre vine; the pillar in the centre
  // spot, the vine, the fountains by turns - a piece of gear at each door, and Moapa with his knights at the summit:
  // the Hover Jade for the rod, and the night at the inn ----
  ['heal'], ['enter', 'trial_road'], ['shot', 'trial_road'], ['psyat', 'Whirlwind', 'tr_windstone'], ['expect', 'tr_sand_gone'], ['expect', 'tr_rules_heard'], ['go', 8, 4], ['idle'], ['expect', 'tr_started'], ['enter', 'trl_1', 8, 3], ['expectMap', 'trl_1'],
  ['go', 10, 12], ['psy', 'Sand', DIR.UP], ['go', 10, 8], ['go', 13, 8], ['psyat', 'Whirlwind', 'trl1_vines'], ['go', 15, 4], ['use', 9, 2], ['expect', 'trl_1_open'], ['shot', 'trial_road_1'], ['enter', 'trl_2', 10, 1], ['expectMap', 'trl_2'],
  ['roll', 'trl2_log_v', DIR.LEFT], ['cast', 'Move', 10, 8, DIR.LEFT], ['roll', 'trl2_log_h', DIR.UP], ['go', 11, 5], ['use', 9, 2], ['expect', 'trl_2_open'], ['shot', 'trial_road_2'], ['enter', 'trl_3', 10, 1], ['expectMap', 'trl_3'],
  ['psyat', 'Whirlwind', 'trl3_bush'], ['cast', 'Move', 15, 13, DIR.UP], ['cast', 'Move', 15, 12, DIR.UP], ['chest', 16, 9], ['go', 4, 8], ['go', 8, 8], ['go', 10, 4], ['use', 9, 2], ['expect', 'trl_3_open'], ['shot', 'trial_road_3'], ['enter', 'trl_4', 10, 1], ['expectMap', 'trl_4'],
  ['cast', 'Move', 6, 16, DIR.RIGHT], ['cast', 'Move', 7, 16, DIR.RIGHT], ['cast', 'Move', 8, 16, DIR.RIGHT], ['cast', 'Move', 9, 16, DIR.RIGHT], ['cast', 'Move', 10, 16, DIR.UP], ['cast', 'Move', 10, 15, DIR.UP], ['cast', 'Move', 10, 14, DIR.UP], ['go', 10, 5], ['until', TR_F(1), 400], ['ride', 10, 4], ['expectMap', 'trl_4'], ['use', 9, 2], ['expect', 'trl_4_open'], ['shot', 'trial_road_4'],
  ['healhere'], ['enter', 'trial_road_top', 10, 1], ['expectMap', 'trial_road_top'], ['go', 12, 9], ['idle'], ['expect', 'trial_road_won'], ['expect', 'item:Hover Jade'], ['shot', 'moapa_beaten'], ['ckpt', 'moapa'], ['expectMap', 'shaman_inn'],
  // ---- the village speaks: the sanctum, the seer's fortune, the tepee that was shut, Moapa's name-taking; the
  // rightmost home's stairs to the balcony (the Lucky Medal jar) and out to the east screen, the pillar Moved into
  // the gap, the Shaman's hut (the Lucky Pepper); Lash on the rope by Moapa's house, Aroma ----
  ['enter', 'shaman'], ['talk', 'sv_001'], ['enter', 'shaman_tepee_seer'], ['talk', 'sv_seer'], ['enter', 'shaman'], ['enter', 'shaman_tepee2'], ['enter', 'shaman'], ['enter', 'shaman_moapa'], ['talk', 'sv_moapa_in'], ['expect', 'moapa_names'], ['enter', 'shaman'],
  ['enter', 'shaman_house8'], ['enter', 'shaman_house8_up'], ['enter', 'shaman_east', 5, 5], ['expectMap', 'shaman_east'], ['shot', 'shaman_east'], ['enter', 'shaman_hut'], ['enter', 'shaman_east'], ['cast', 'Move', 7, 9, DIR.DOWN], ['cast', 'Move', 7, 10, DIR.DOWN], ['cast', 'Move', 7, 11, DIR.DOWN], ['cast', 'Move', 7, 12, DIR.DOWN], ['expect', 'sv_pillar_gap'],
  ['enter', 'shaman', 0, 10], ['expectMap', 'shaman'], ['psyat', 'Lash', 'sv_rope'], ['djinni', 'Aroma'], ['ckpt', 'shaman_done'], ['teacher', 'whitefeather', 'whitefeather_done', 3], ['expect', 'whitefeather_done'], ['expect', "item:Shaman's Drum"], ['psy', 'Spirit Sight'], ['talk', 'sv_ghost'], ['idle'], ['expect', 'sv_ghost_done'],   /* the class item: Whitefeather's drum, and the spirit by the hut */ ['enter', 'shaman_cave_2', 23, 7], ['enter', 'shaman_cave', 0, 10], ['enter', 'world_tla', 12, 31], ['expectMap', 'world_tla'], ['optional'],
  // ---- Jupiter Lighthouse: Contigo's shops and inn first; the forecourt (Cyclone on the bushes: Mint; the swirl in the
  // west lane), the undercroft (the Mad Plant in the corner, Hover over the drop, the swirl up), the gatehouse (the
  // pillar onto the button), and in through the gates to the central hall ----
  ['level', 32], ['world', 'contigo'], ['enter', 'contigo_weaponshop'], ['shop'], ['enter', 'contigo'], ['enter', 'contigo_inn'], ['inn'], ['enter', 'contigo'], ['enter', 'world_tla'],
  ['heal'], ['world', 'jupiter_lh'], ['expectMap', 'jupiter_lh'], ['shot', 'jupiter_lh'], ['expect', 'jupiter_entered'], ['psyat', 'Cyclone', 'jl_bush_mint'], ['expect', 'item:Mint'],
  ['go', 14, 10], ['idle'], ['psyat', 'Cyclone', 'jl_tp_down'], ['idle'], ['expectMap', 'jl_under'], ['shot', 'jl_under'], ['psyat', 'Cyclone', 'jl_plant4'], ['idle'], ['expect', 'jl_plant4_done'],
  ['go', 21, 3], ['idle'], ['hover', 21, 4, 24, 4], ['psyat', 'Cyclone', 'jl_tp_gh'], ['idle'], ['expectMap', 'jl_gatehouse'], ['shot', 'jl_gatehouse'],
  ['cast', 'Move', 5, 4, DIR.RIGHT], ['cast', 'Move', 6, 4, DIR.RIGHT], ['cast', 'Move', 7, 4, DIR.RIGHT], ['cast', 'Move', 8, 4, DIR.UP], ['expect', 'jl_gates_open'],
  ['enter', 'jupiter_lh', 5, 8], ['expectMap', 'jupiter_lh'], ['enter', 'jl_central', 14, 9], ['expectMap', 'jl_central'], ['shot', 'jl_central'], ['go', 14, 3], ['idle'], ['ckpt', 'jl_hall'],
  // ---- the left way: the fallen pillars (1 up, 3 left: the Erinyes Tunic; 2 down, 4 right: the door), out and Cyclone up
  // the face, the west way's shortcut pillar, out the west side, Reveal across the pit to the stair, the hops and the
  // slide, the upper pillar into the pit for the Meditation Rod, the ladder down and out, the grey block onto the seam
  // and the button: the block drops into the hall's north way ----
  ['enter', 'jl_logs', 3, 14], ['expectMap', 'jl_logs'], ['shot', 'jl_logs'], ['roll', 'jl_log1', DIR.UP], ['roll', 'jl_log3', DIR.LEFT], ['chest', 11, 4], ['expect', 'item:Erinyes Tunic'], ['roll', 'jl_log2', DIR.DOWN], ['roll', 'jl_log4', DIR.RIGHT], ['enter', 'jl_left_out', 11, 13], ['expectMap', 'jl_left_out'],
  ['psyat', 'Cyclone', 'jl_tp_lo'], ['idle'], ['expectMap', 'jl_left_up'], ['cast', 'Move', 18, 6, DIR.RIGHT], ['cast', 'Move', 19, 6, DIR.RIGHT], ['cast', 'Move', 20, 6, DIR.RIGHT], ['expect', 'jl_sc1'], ['enter', 'jl_left_out2', 17, 14], ['expectMap', 'jl_left_out2'], ['shot', 'jl_left_out2'],
  ['enter', 'jl_reveal', 4, 7], ['expectMap', 'jl_reveal'], ['go', 9, 9], ['psy', 'Reveal'], ['go', 16, 3], ['chest', 17, 3], ['expect', 'item:Psy Crystal'], ['go', 9, 9], ['psy', 'Reveal'], ['enter', 'jl_jumps', 9, 3], ['expectMap', 'jl_jumps'], ['shot', 'jl_jumps'],
  ['go', 9, 6], ['drop', 9, 5], ['expectMap', 'jl_pillars3'], ['shot', 'jl_pillars3'], ['cast', 'Move', 8, 4, DIR.LEFT], ['cast', 'Move', 7, 4, DIR.LEFT], ['chest', 3, 3], ['expect', 'item:Meditation Rod'], ['go', 19, 10], ['enter', 'jl_left_out2', 18, 14], ['expectMap', 'jl_left_out2'],
  ['cast', 'Move', 4, 10, DIR.RIGHT], ['go', 6, 10], ['idle'], ['expect', 'jl_block_dropped'], ['ckpt', 'jl_block'],
  // ---- the aerie seen (the lid), the core: the slide down, the voice, Hover on the platform - the lighthouse wakes; the
  // Red Key (Hover to the ledge, the block into the pit, the hop, the stair down) ----
  ['enter', 'jl_pillars3', 8, 7], ['enter', 'jl_aerie_stair', 2, 12], ['enter', 'jl_aerie', 12, 1], ['expectMap', 'jl_aerie'], ['go', 12, 12], ['idle'], ['expect', 'jl_aerie_seen'], ['shot', 'jl_aerie_lid'],
  ['enter', 'jl_core_stairs', 19, 19], ['expectMap', 'jl_core_stairs'], ['go', 8, 6], ['drop', 8, 7], ['expectMap', 'jl_core'], ['go', 9, 7], ['idle'], ['expect', 'jl_voice'], ['go', 9, 3], ['psy', 'Hover'], ['idle'], ['expect', 'jl_lit'], ['shot', 'jl_core'], ['ckpt', 'jl_lit'],
  ['enter', 'jl_redkey', 1, 8], ['expectMap', 'jl_redkey'], ['hover', 16, 6, 12, 6], ['chest', 10, 4], ['expect', 'item:Red Key'], ['cast', 'Move', 10, 6, DIR.LEFT], ['cast', 'Move', 9, 6, DIR.LEFT], ['go', 8, 6], ['go', 6, 6], ['enter', 'jl_central', 3, 3], ['expectMap', 'jl_central'],
  // ---- the east way: the swirl up, the Red Door, the windward ledge notch by notch as the whirlwind passes, the Left
  // Tower: the Mimic's chest, the blue pillar rolled up, the cracked tile (the coins, and the fall back), the column
  // into the ravine (Mist Potion), the cracked hall (Hover to the pocket, the pillar onto the button, Hover up the
  // lit column), the archer's block: the left half of the lid; then the dark tile: two floors down to the Blue Key ----
  ['enter', 'jl_right_low', 26, 14], ['expectMap', 'jl_right_low'], ['psyat', 'Cyclone', 'jl_tp_rl'], ['idle'], ['expectMap', 'jl_reddoor'], ['use', 18, 6], ['idle'], ['expect', 'jl_red_open'], ['enter', 'jl_faces', 18, 6], ['expectMap', 'jl_faces'], ['shot', 'jl_faces'],
  ['ledge', 'jl_tw1', [[8, 6], [13, 6], [18, 6], [23, 6], [27, 7]]], ['enter', 'jl_lt1', 28, 7], ['expectMap', 'jl_lt1'], ['shot', 'jl_lt1'],
  ['healhere'], ['chest', 3, 3], ['idle'], ['roll', 'jl_blog', DIR.UP], ['enter', 'jl_lt2', 17, 3], ['expectMap', 'jl_lt2'], ['shot', 'jl_lt2'], ['go', 5, 7], ['chest', 18, 3], ['go', 5, 8], ['idle'], ['expectMap', 'jl_lt1'], ['enter', 'jl_lt2', 17, 3], ['enter', 'jl_lt3', 18, 12], ['expectMap', 'jl_lt3'], ['shot', 'jl_lt3'],
  ['cast', 'Move', 4, 9, DIR.UP], ['cast', 'Move', 4, 8, DIR.UP], ['chest', 18, 3], ['expect', 'item:Mist Potion'], ['enter', 'jl_lt4', 18, 5], ['expectMap', 'jl_lt4'], ['shot', 'jl_lt4'],
  ['hover', 3, 10, 3, 4], ['cast', 'Move', 3, 3, DIR.RIGHT], ['cast', 'Move', 4, 3, DIR.RIGHT], ['expect', 'jl_lt4_button'], ['hover', 3, 4, 3, 10], ['hover', 11, 10, 11, 4], ['enter', 'jl_lt_top', 11, 2], ['expectMap', 'jl_lt_top'], ['shot', 'jl_lt_top'],
  ['push', 'jl_eb_l', DIR.RIGHT, 6], ['expect', 'jl_lid_left'], ['ckpt', 'jl_lid_left'], ['enter', 'jl_lt4', 5, 11], ['hover', 11, 4, 11, 10], ['go', 4, 12], ['enter', 'jl_lt3', 4, 13], ['expectMap', 'jl_lt3'], ['go', 10, 5], ['go', 10, 4], ['idle'], ['expectMap', 'jl_bluekey'], ['chest', 10, 3], ['expect', 'item:Blue Key'], ['enter', 'jl_lt1', 6, 8], ['expectMap', 'jl_lt1'],
  // ---- back through the main tower: the ledge again, the swirl down, the east way's shortcut pillar, the five blocks'
  // bridge, the energy block into the hall's gap, the east side's block (the east ledge's panel), Hover to the beam
  // and up to the gallery: the grey block aside for the Potion, the Blue Key on the blue door, Hover to the Right Tower ----
  ['go', 2, 8], ['enter', 'jl_faces', 1, 8], ['expectMap', 'jl_faces'], ['ledge', 'jl_tw1', [[23, 6], [18, 6], [13, 6], [8, 6], [4, 7]]], ['enter', 'jl_reddoor', 1, 7], ['expectMap', 'jl_reddoor'],
  ['psyat', 'Cyclone', 'jl_tp_rd'], ['idle'], ['expectMap', 'jl_right_low'], ['cast', 'Move', 18, 6, DIR.RIGHT], ['cast', 'Move', 19, 6, DIR.RIGHT], ['cast', 'Move', 20, 6, DIR.RIGHT], ['expect', 'jl_sc2'], ['enter', 'jl_blocks', 22, 6], ['expectMap', 'jl_blocks'], ['shot', 'jl_blocks'],
  ['cast', 'Move', 16, 3, DIR.DOWN], ['cast', 'Move', 16, 4, DIR.DOWN], ['cast', 'Move', 16, 5, DIR.DOWN], ['expect', 'jl_blocks_bridge'], ['go', 7, 6], ['go', 17, 6], ['enter', 'jl_right_low', 22, 6], ['enter', 'jl_east_out', 15, 12], ['expectMap', 'jl_east_out'], ['push', 'jl_eb_e', DIR.RIGHT, 5], ['expect', 'jl_east_pad'],
  ['enter', 'jl_right_low', 6, 2], ['enter', 'jl_central', 1, 8], ['expectMap', 'jl_central'], ['cast', 'Move', 24, 17, DIR.UP], ['cast', 'Move', 24, 16, DIR.UP], ['cast', 'Move', 24, 15, DIR.UP], ['cast', 'Move', 24, 14, DIR.LEFT], ['expect', 'jl_beam_block'], ['hover', 22, 14, 14, 14], ['idle'], ['expectMap', 'jl_central_up'], ['shot', 'jl_central_up'],
  ['cast', 'Move', 17, 5, DIR.RIGHT], ['chest', 17, 3], ['expect', 'item:Potion'], ['use', 22, 6], ['idle'], ['expect', 'jl_blue_open'], ['enter', 'jl_east_face', 22, 6], ['expectMap', 'jl_east_face'], ['hover', 4, 6, 10, 6], ['enter', 'jl_rt1', 18, 6], ['expectMap', 'jl_rt1'], ['shot', 'jl_rt1'], ['ckpt', 'jl_right_tower'],
  // ---- the Right Tower: Whorl's hall (Hover to the left ledge, the block off it, the slide after it, the block into its
  // pit: two panels wake; Whorl; Hover to the right ledge, the other block down and into its pit: the cone; Pound: the
  // gate), the two ravines (Pound the cone, a block into each), the pillar onto the button (the shortcut stair), the
  // cracked way past the two faces, the hover hall (Phaeton's Blade), the archer's block: the right half of the lid ----
  ['healhere'], ['enter', 'jl_rt2', 10, 1], ['expectMap', 'jl_rt2'], ['shot', 'jl_rt2'], ['hover', 3, 8, 3, 5], ['cast', 'Move', 7, 3, DIR.DOWN], ['cast', 'Move', 7, 4, DIR.DOWN], ['cast', 'Move', 7, 5, DIR.DOWN], ['go', 6, 5], ['drop', 6, 6], ['push', 'jl_eb_r2a', DIR.RIGHT, 3], ['expect', 'jl_r2_a'],
  ['hover', 6, 12, 3, 12], ['djinni', 'Whorl'], ['hover', 3, 11, 6, 11],
  ['hover', 17, 8, 17, 5], ['cast', 'Move', 15, 3, DIR.DOWN], ['cast', 'Move', 15, 4, DIR.DOWN], ['cast', 'Move', 15, 5, DIR.DOWN], ['go', 16, 5], ['drop', 16, 6], ['push', 'jl_eb_r2b', DIR.LEFT, 3], ['expect', 'jl_r2_b'], ['psyat', 'Pound', 'jl_cone_r2'], ['idle'], ['expect', 'jl_r2_pound'],
  ['hover', 17, 8, 17, 5], ['enter', 'jl_rt3', 20, 1], ['expectMap', 'jl_rt3'], ['shot', 'jl_rt3'], ['psyat', 'Pound', 'jl_cone_r3'], ['idle'], ['expect', 'jl_r3_pound'], ['push', 'jl_r3_b1', DIR.RIGHT, 2], ['cast', 'Move', 6, 10, DIR.UP], ['cast', 'Move', 6, 9, DIR.UP], ['cast', 'Move', 6, 8, DIR.UP], ['push', 'jl_r3_b2', DIR.RIGHT, 7],
  ['chest', 18, 12], ['expect', 'item:Water of Life'], ['cast', 'Move', 15, 3, DIR.RIGHT], ['cast', 'Move', 16, 3, DIR.RIGHT], ['cast', 'Move', 17, 3, DIR.RIGHT], ['expect', 'jl_rt3_shortcut'], ['enter', 'jl_rt4', 16, 8], ['expectMap', 'jl_rt4'], ['shot', 'jl_rt4'],
  ['go', 20, 4], ['until', TW_PAST('jl_tw4a', 16, -1), 900], ['go', 20, 6], ['go', 20, 9], ['until', TW_PAST('jl_tw4b', 16, -1), 900], ['go', 20, 11], ['enter', 'jl_rt5', 20, 14], ['expectMap', 'jl_rt5'], ['shot', 'jl_rt5'],
  ['hover', 11, 11, 11, 4], ['go', 3, 4], ['chest', 3, 3], ['expect', "item:Phaeton's Blade"], ['equip', "Phaeton's Blade"], ['go', 21, 4], ['enter', 'jl_rt_top', 22, 3], ['expectMap', 'jl_rt_top'], ['shot', 'jl_rt_top'], ['push', 'jl_eb_r', DIR.RIGHT, 6], ['expect', 'jl_lid_right'], ['ckpt', 'jl_lid_right'],
  // ---- back to the aerie the short way (the block room's stair, the east ledge, the gallery's stair, the hall's north
  // way): Garet and Mia on the ledge, Isaac and Ivan, Karst and Agatio, Alex; the star cast, the Mars Star taken, the
  // fight (Jenna and Sheba joining by rounds), the elevator down; Contigo: the reunion, Hama, Isaac's party joins ----
  ['enter', 'jl_rt5', 5, 11], ['hover', 17, 4, 17, 11], ['enter', 'jl_rt4', 11, 14], ['expectMap', 'jl_rt4'], ['go', 20, 11], ['until', TW_PAST('jl_tw4b', 16, -1), 900], ['go', 20, 9], ['go', 20, 6], ['until', TW_PAST('jl_tw4a', 16, -1), 900], ['go', 20, 4], ['enter', 'jl_rt3', 3, 2], ['expectMap', 'jl_rt3'], ['enter', 'jl_rt1', 19, 13], ['expectMap', 'jl_rt1'],
  ['enter', 'jl_east_face', 1, 8], ['expectMap', 'jl_east_face'], ['hover', 11, 6, 5, 6], ['enter', 'jl_central_up', 1, 6], ['expectMap', 'jl_central_up'], ['enter', 'jl_central', 3, 3], ['expectMap', 'jl_central'], ['healhere'], ['enter', 'jl_core_stairs', 14, 1], ['expectMap', 'jl_core_stairs'],
  ['enter', 'jl_aerie', 8, 1], ['idle'], ['expectMap', 'jl_aerie'], ['go', 19, 16], ['idle'], ['expect', 'jl_isaac_scene'], ['shot', 'jl_aerie_trap'], ['go', 12, 13], ['idle'], ['expect', 'jupiter_lit'], ['expect', 'jupiter_done'], ['expectMap', 'jupiter_lh'], ['shot', 'jupiter_lit'], ['ckpt', 'jupiter'],
  ['enter', 'world_tla', 14, 25], ['world', 'contigo'], ['enter', 'contigo_house1'], ['idle'], ['expect', 'contigo_reunion'], ['expect', 'isaac_test_done'], ['expectParty', ['Felix', 'Jenna', 'Sheba', 'Piers', 'Isaac', 'Garet', 'Ivan', 'Mia']], ['enter', 'contigo'],
  // ---- the observatory above Contigo (class item: the Oracle's Eye, off Hama's Shade); Shadow Step for the alcove ----
  ['enter', 'anemos_observatory'], ['shot', 'anemos_observatory'], ['psyat', 'Cyclone', 'ao_growth'], ['chest', 2, 2], ['chest', 17, 2], ['healhere'], ['talk', 'boss_hama_shade'], ['idle'], ['expect', 'hama_shade_done'], ['expect', "item:Oracle's Eye"], ['shot', 'hama_shade_beaten'],
  ['unless', 'anemos_observatory:chest:9,4', [['try', ['cast', 'Shadow Step', 9, 5, DIR.UP]], ['try', ['chest', 9, 4]]]], ['enter', 'contigo'], ['ckpt', 'observatory'],   /* the alcove wants the Assassin's Mask: a run that has not been back for Golden Sun's items gets it with them */ ['enter', 'contigo_house1'], ['expectParty', ['Felix', 'Jenna', 'Sheba', 'Piers', 'Isaac', 'Garet', 'Ivan', 'Mia']], ['shot', 'contigo_reunion'], ['enter', 'contigo'], ['enter', 'contigo_inn'], ['inn'], ['enter', 'contigo'], ['ckpt', 'reunion'], ['party'], ['enter', 'world_tla'],
  // ---- Atteka Inlet: Hama at the wings, the Wings of Anemos fitted to the ship (it flies over reefs, rivers and low land;
  // no fights in the air), Sheba's word; the reef ring round the western glint: the Soul Brand's rusty sword ----
  ['world', 'atteka_inlet'], ['try', ['enter', 'atteka_beach', 26, 17]], ['idle'], ['expectMap', 'atteka_beach'], ['expect', 'ship_wings'], ['shot', 'atteka_wings'], ['enter', 'world_tla', 33, 17], ['expectMap', 'world_tla'], ['ckpt', 'wings'],
  ['try', ['land', 82, 70]], ['try', ['djinni', 'Petra']],   /* Hesperia North's Petra sits between rivers: only the flying ship puts in there (the beach at 83,70) */
  ['sail', 30, 176], ['use', 30, 175], ['expect', 'item:Rusty Sword D'], ['shot', 'soul_brand'],
  // ---- Isaac's day: what only his party's Psynergy reaches - Force on Contigo's stump (Shine), the Colosso gladiators'
  // rematch and Lift at the boulders of Shaman Village Cave (Eddy), Hover and Lift into the spring behind Trial Road's
  // summit (the Mad Plant's Lucky Pepper, Reveal through the pools, the Elixir, Gasp), Lift and Cyclone at the inlet
  // (Geode), Lift on the islet's boulder, Catch on Kalt's Apple ----
  ['world', 'contigo'], ['psyat', 'Force', 'contigo_stump'], ['idle'], ['try', ['djinni', 'Shine']], ['enter', 'world_tla'],
  ['world', 'shaman'], ['expectMap', 'shaman_cave'], ['try', ['trig', 'T3.colossoRematch']], ['idle'], ['try', ['expect', 'colosso_rematch_done']],
  ['enter', 'shaman_cave_3'], ['psyat', 'Lift', 'svc_boulder_mid'], ['idle'], ['expect', 'svc_mid_open'], ['try', ['djinni', 'Eddy']],
  // the road again, by the left way (the doors stand open since the race; the logs and pillars sit where they were left, but the stream wants Sand and the fountain its timing each time)
  ['enter', 'shaman_cave_2'], ['enter', 'shaman'], ['enter', 'trial_road'], ['enter', 'trl_1', 8, 3], ['expectMap', 'trl_1'],
  ['go', 10, 12], ['psy', 'Sand', DIR.UP], ['go', 10, 8], ['go', 13, 8], ['try', ['psyat', 'Whirlwind', 'trl1_vines']], ['go', 15, 4], ['enter', 'trl_2', 10, 1], ['expectMap', 'trl_2'],
  ['try', ['roll', 'trl2_log_v', DIR.LEFT]], ['try', ['cast', 'Move', 10, 8, DIR.LEFT]], ['try', ['roll', 'trl2_log_h', DIR.UP]], ['go', 11, 5], ['enter', 'trl_3', 10, 1], ['expectMap', 'trl_3'],
  ['try', ['psyat', 'Whirlwind', 'trl3_bush']], ['try', ['cast', 'Move', 15, 13, DIR.UP]], ['try', ['cast', 'Move', 15, 12, DIR.UP]], ['go', 4, 8], ['go', 8, 8], ['go', 10, 4], ['enter', 'trl_4', 10, 1], ['expectMap', 'trl_4'],
  ['try', ['cast', 'Move', 6, 16, DIR.RIGHT]], ['try', ['cast', 'Move', 7, 16, DIR.RIGHT]], ['try', ['cast', 'Move', 8, 16, DIR.RIGHT]], ['try', ['cast', 'Move', 9, 16, DIR.RIGHT]], ['try', ['cast', 'Move', 10, 16, DIR.UP]], ['try', ['cast', 'Move', 10, 15, DIR.UP]], ['try', ['cast', 'Move', 10, 14, DIR.UP]], ['go', 10, 5], ['until', TR_F(1), 400], ['ride', 10, 4], ['expectMap', 'trl_4'],
  ['enter', 'trial_road_top', 10, 1], ['expectMap', 'trial_road_top'], ['hover', 5, 9, 2, 9], ['enter', 'trial_road_cavern'], ['expectMap', 'trial_road_cavern'], ['shot', 'trial_road_cavern'],
  ['psyat', 'Lift', 'trc_rock'], ['psyat', 'Cyclone', 'trc_bush1'], ['idle'], ['expect', 'trc_plant_done'], ['go', 7, 6], ['psy', 'Reveal'], ['go', 7, 2], ['djinni', 'Gasp'], ['chest', 12, 2], ['go', 7, 2], ['psy', 'Reveal'], ['go', 7, 7], ['ckpt', 'isaacs_day'],
  ['enter', 'trial_road_top'], ['hover', 2, 9, 5, 9], ['psy', 'Retreat'], ['expectMap', 'trial_road'], ['enter', 'shaman'], ['enter', 'shaman_cave_2', 23, 7], ['enter', 'shaman_cave', 0, 10], ['enter', 'world_tla', 12, 31], ['expectMap', 'world_tla'],
  ['world', 'atteka_inlet'], ['try', ['enter', 'atteka_beach', 26, 17]], ['expectMap', 'atteka_beach'], ['psyat', 'Lift', 'ai_boulder'], ['psyat', 'Cyclone', 'ai_bush'], ['idle'], ['try', ['djinni', 'Geode']], ['enter', 'world_tla', 33, 17],
  ['world', 'sw_atteka_islet'], ['psyat', 'Lift', 'swa_boulder'], ['idle'], ['explore'], ['js', () => G.set('swa_islet_seen')], ['enter', 'world_tla'],
  ['world', 'kalt'], ['psyat', 'Catch', 'kalt_apple'], ['expect', 'item:Apple'], ['enter', 'world_tla'],
  // ---- Angara Cavern, the big cave north of Loho: four levels down, the grey blocks carried into the two chasms, Haures' tablet ----
  ['world', 'angara_cavern'], ['expectMap', 'angara_cavern'], ['shot', 'angara_cavern'], ['enter', 'angara_cavern_2'], ['enter', 'angara_cavern_3'], ['enter', 'angara_cavern_4'], ['shot', 'angara_cavern_4'],
  ['psyat', 'Carry', 'ac_block1'], ['cast', 'Carry', 7, 12, DIR.UP], ['psyat', 'Carry', 'ac_block2'], ['go', 7, 12], ['cast', 'Carry', 7, 11, DIR.UP], ['go', 7, 10], ['psyat', 'Carry', 'ac_block3'], ['cast', 'Carry', 7, 7, DIR.UP], ['psyat', 'Carry', 'ac_block4'], ['go', 7, 7], ['cast', 'Carry', 7, 6, DIR.UP], ['go', 7, 5],
  ['use', 8, 4], ['expect', 'haures_taken'], ['shot', 'haures'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- Treasure Isle, in the north-east corner of the sea (Grind and Lift in hand): the way in along the left wall, the
  // button, the spiky rock; the pool's stones and the column onto the switch; the hall of columns (the button, the
  // rightmost rock, the tightrope, the left rock, the column into the chasm, the six chests); the cave and its Mimic;
  // the boulders (Lift), the Iris Robe; Gale's room (Gale, the Fire Brand, the way up); the climb; the Star Magician; Azul ----
  ['world', 'treasure_isle'], ['expectMap', 'treasure_isle'], ['shot', 'treasure_isle'], ['go', 12, 6], ['idle'], ['expect', 'ti_button1'], ['psyat', 'Grind', 'ti_spiky_r'], ['enter', 'ti_pool'], ['expectMap', 'ti_pool'], ['shot', 'ti_pool'],
  ['cast', 'Move', 11, 7, DIR.UP], ['cast', 'Move', 11, 6, DIR.UP], ['idle'], ['expect', 'ti_switch1'], ['enter', 'ti_columns'], ['expectMap', 'ti_columns'], ['shot', 'ti_columns'], ['go', 4, 13], ['idle'], ['expect', 'ti_button2'],
  ['psyat', 'Grind', 'ti_spiky_2'], ['go', 12, 7], ['go', 8, 7], ['chest', 2, 7], ['psyat', 'Grind', 'ti_spiky_l'], ['push', 'ti_column2', DIR.UP, 2], ['cast', 'Move', 5, 6, DIR.UP], ['go', 5, 4], ['chest', 2, 2], ['chest', 4, 2], ['chest', 6, 2], ['chest', 8, 2], ['chest', 3, 4], ['chest', 7, 4], ['expect', 'item:Rusty Axe B'],
  ['enter', 'ti_cave'], ['expectMap', 'ti_cave'], ['shot', 'ti_cave'], ['chest', 3, 4], ['idle'], ['enter', 'ti_boulders'], ['expectMap', 'ti_boulders'], ['psyat', 'Lift', 'ti_boulder1'], ['chest', 11, 10], ['expect', 'item:Iris Robe'], ['psyat', 'Lift', 'ti_boulder2'], ['enter', 'ti_gale'], ['expectMap', 'ti_gale'], ['shot', 'ti_gale'],
  ['psyat', 'Lift', 'ti_b_center'], ['djinni', 'Gale'], ['psyat', 'Lift', 'ti_b_right'], ['chest', 17, 8], ['expect', 'item:Fire Brand'], ['psyat', 'Lift', 'ti_b_upper2'], ['cast', 'Move', 16, 8, DIR.UP], ['cast', 'Move', 16, 7, DIR.UP], ['go', 16, 5], ['psyat', 'Lift', 'ti_b_upper'], ['enter', 'ti_climb'], ['expectMap', 'ti_climb'], ['chest', 6, 5],
  ['healhere'], ['enter', 'ti_hall'], ['expectMap', 'ti_hall'], ['shot', 'ti_hall'], ['go', 8, 8], ['idle'], ['expect', 'star_magician_done'], ['use', 8, 3], ['expect', 'azul_taken'], ['shot', 'azul'], ['ckpt', 'treasure_isle'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- Atteka Cavern, at the continent's south tip, by air: Parch on the pool from its right side, the ladder up the island, Coatlicue's tablet ----
  ['world', 'atteka_cavern'], ['expectMap', 'atteka_cavern'], ['shot', 'atteka_cavern'], ['go', 17, 13], ['psy', 'Parch', DIR.LEFT], ['expect', 'atc_pool_dry'], ['go', 12, 13], ['use', 13, 13], ['expect', 'coatlicue_taken'], ['shot', 'coatlicue'], ['enter', 'world_tla'],
  // ---- Magma Rock, the faces: Lift on the boulder (the Mimic's Apple in the cave), the climb, Burst on the statue (the
  // column crumbles into holds), the pillar into the gap, the slide, the statue's breath up, the pillar, the next face;
  // the Oil Drop pocket, Growth on the right plant, Burst clears the column, the slide to the Moai (Burst: the way down),
  // Growth on the left plant, the breath up, the pillar far left; the four slides (the 383 coins, Lash on the rope, the
  // Moai's breath), the cracked stones, the statue's column, the Salamander Tail below, the rock volleyed along the last
  // ledge, and the summit's Moai with the Psynergy rock: the mountain opens ----
  ['level', 34], ['world', 'magma_rock'], ['expectMap', 'magma_rock'], ['shot', 'magma_rock'], ['psyat', 'Lift', 'mr_boulder'], ['expect', 'mr_boulder_lifted'], ['enter', 'mr_mimic', 14, 24], ['chest', 6, 3], ['idle'], ['enter', 'magma_rock', 6, 10], ['expectMap', 'magma_rock'],
  ['psyat', 'Burst', 'mr_st1'], ['expect', 'mr_col1'], ['cast', 'Move', 10, 14, DIR.RIGHT], ['cast', 'Move', 11, 14, DIR.RIGHT], ['go', 7, 8], ['drop', 6, 8], ['psyat', 'Burst', 'mr_st2'], ['expect', 'mr_st2_woke'], ['ride', 4, 11], ['cast', 'Move', 8, 5, DIR.RIGHT], ['cast', 'Move', 9, 5, DIR.RIGHT], ['enter', 'magma_rock_b', 12, 0], ['expectMap', 'magma_rock_b'], ['shot', 'magma_rock_b'],
  ['chest', 23, 30], ['expect', 'item:Oil Drop'], ['psyat', 'Growth', 'mr_sprout1'], ['go', 24, 19], ['psyat', 'Burst', 'mr_st3'], ['expect', 'mr_col2'], ['go', 4, 13], ['drop', 3, 13], ['psyat', 'Burst', 'mr_st4'], ['expect', 'mr_col3'], ['go', 5, 26],
  ['psyat', 'Growth', 'mr_sprout2'], ['go', 9, 20], ['psyat', 'Burst', 'mr_st5'], ['expect', 'mr_st5_woke'], ['ride', 2, 20], ['push', 'mr_pil3', DIR.LEFT, 8], ['enter', 'magma_rock_c', 2, 2], ['expectMap', 'magma_rock_c'], ['shot', 'magma_rock_c'], ['ckpt', 'magma_faces'],
  ['go', 16, 20], ['drop', 16, 21], ['chest', 15, 24], ['go', 18, 21], ['go', 10, 20], ['drop', 10, 21], ['psyat', 'Lash', 'mr_rope'], ['go', 7, 24], ['psyat', 'Burst', 'mr_st6'], ['expect', 'mr_st6_woke'], ['ride', 3, 24], ['try', ['push', 'mr_pil4', DIR.RIGHT, 2]], ['enter', 'magma_rock_d', 2, 2], ['expectMap', 'magma_rock_d'], ['shot', 'magma_rock_d'],
  ['push', 'mr_pil5', DIR.RIGHT, 2], ['go', 16, 22], ['psyat', 'Burst', 'mr_st7'], ['expect', 'mr_col4'], ['go', 11, 21], ['drop', 10, 21], ['enter', 'magma_rock_e', 2, 27], ['expectMap', 'magma_rock_e'], ['chest', 3, 8], ['expect', 'item:Salamander Tail'], ['enter', 'magma_rock_d', 2, 1], ['expectMap', 'magma_rock_d'],
  ['go', 26, 14], ['ledge', 'mr_rock1', [[24, 14], [18, 14], [12, 14], [6, 14], [2, 13]]], ['enter', 'magma_rock_top', 2, 2], ['expectMap', 'magma_rock_top'], ['shot', 'magma_rock_top'],
  ['psyat', 'Burst', 'mr_moai_top'], ['idle'], ['expect', 'mr_open'], ['ckpt', 'magma_open'], ['healhere'], ['enter', 'mr_hub', 12, 13], ['expectMap', 'mr_hub'], ['shot', 'mr_hub'],
  // ---- inside: across the dry basin to the Moai (Burst: the hall floods), the rafts west (the Lucky Medal, the button
  // that drains it, the channel back to the hall's upper floor); the south way while it is dry (the pillar up, the blue
  // gem's stair, the pillar down three squares, Fury); the Moai again and the rafts east (the hop, the tightrope, the
  // Mist Potion, the pillar into the lava, the ferry, the two cracked pillars and the door back to the hall) ----
  ['go', 12, 2], ['idle'], ['psyat', 'Burst', 'mr_moai1'], ['idle'], ['until', () => G.get('mr_flood1') === 1, 300], ['shot', 'mr_hub_flooded'], ['enter', 'mr_w1', 1, 11], ['expectMap', 'mr_w1'], ['enter', 'mr_w3', 3, 1], ['chest', 5, 2], ['expect', 'item:Lucky Medal'], ['enter', 'mr_w1', 5, 7], ['enter', 'mr_w2', 12, 1], ['expectMap', 'mr_w2'],
  ['go', 5, 3], ['idle'], ['until', () => G.get('mr_flood1') === 0, 300], ['enter', 'mr_hub', 8, 0], ['expectMap', 'mr_hub'], ['enter', 'mr_s1', 20, 22], ['expectMap', 'mr_s1'], ['shot', 'mr_s1'], ['push', 'mr_pil_s1', DIR.UP, 3], ['enter', 'mr_s2', 10, 2], ['expectMap', 'mr_s2'], ['enter', 'mr_s4', 3, 1], ['push', 'mr_pil_s4', DIR.DOWN, 4], ['expect', 'mr_gem_open'],
  ['enter', 'mr_s2', 8, 13], ['enter', 'mr_s3', 3, 15], ['expectMap', 'mr_s3'], ['djinni', 'Fury'], ['ckpt', 'fury'], ['enter', 'mr_s2', 8, 1], ['enter', 'mr_s1', 12, 1], ['enter', 'mr_hub', 10, 15], ['expectMap', 'mr_hub'],
  ['go', 12, 2], ['psyat', 'Burst', 'mr_moai1'], ['idle'], ['until', () => G.get('mr_flood1') === 1, 300], ['enter', 'mr_e1', 24, 11], ['expectMap', 'mr_e1'], ['shot', 'mr_e1'], ['enter', 'mr_e2', 18, 7], ['expectMap', 'mr_e2'], ['chest', 13, 3], ['expect', 'item:Mist Potion'], ['push', 'mr_pil_e2', DIR.UP, 3], ['enter', 'mr_e3', 8, 1], ['expectMap', 'mr_e3'],
  ['ride', 7, 7], ['psyat', 'Burst', 'mr_crack_a'], ['psyat', 'Burst', 'mr_crack_b'], ['expect', 'mr_e_cracks'], ['enter', 'mr_hub', 14, 1], ['expectMap', 'mr_hub'], ['ckpt', 'magma_east'],
  // ---- the north way: the blue gem's passage, the second hall (across its dry basin to the Moai: Burst; the rafts down
  // the west wall to the Golem Core's room and the button that drains it; the three pillars into the pits; Whirlwind on
  // the chains: the Salamander Tail), the burning ledge, the Heart (the flame wall), the chute to the tablet: Blaze
  // (Jenna); Blaze on the torch (the stair back), Blaze on the torch by the alcove, Blaze on the flame: the Magma Ball;
  // the blue gem's door back to the hall, west to drain it, and out ----
  ['enter', 'mr_n1', 4, 1], ['expectMap', 'mr_n1'], ['enter', 'mr_n2', 8, 1], ['expectMap', 'mr_n2'], ['shot', 'mr_n2'], ['go', 14, 2], ['psyat', 'Burst', 'mr_moai2'], ['idle'], ['until', () => G.get('mr_flood2') === 1, 300],
  ['enter', 'mr_n4', 1, 9], ['expectMap', 'mr_n4'], ['chest', 11, 3], ['expect', 'item:Golem Core'], ['enter', 'mr_n2', 15, 6], ['go', 2, 17], ['idle'], ['until', () => G.get('mr_flood2') === 0, 300],
  ['push', 'mr_npil0', DIR.LEFT, 2], ['push', 'mr_npil1', DIR.LEFT, 2], ['push', 'mr_npil2', DIR.LEFT, 2], ['go', 20, 2], ['psyat', 'Whirlwind', 'mr_chains'], ['enter', 'mr_n3', 20, 0], ['expectMap', 'mr_n3'], ['chest', 3, 3], ['enter', 'mr_n2', 8, 9],
  ['enter', 'mr_n4', 1, 9], ['enter', 'mr_n5', 8, 1], ['expectMap', 'mr_n5'], ['shot', 'mr_n5'], ['enter', 'mr_ball', 4, 1], ['expectMap', 'mr_ball'], ['go', 10, 6], ['idle'], ['go', 16, 10], ['drop', 16, 11], ['expectMap', 'mr_tablet'], ['go', 12, 5], ['idle'], ['expect', 'blaze_learned'], ['shot', 'mr_tablet'],
  ['psyat', 'Blaze', 'mr_torch_t'], ['expect', 'mr_tablet_torch'], ['enter', 'mr_ball', 3, 1], ['expectMap', 'mr_ball'], ['psyat', 'Blaze', 'mr_torch_l'], ['expect', 'mr_torch_l'], ['psyat', 'Blaze', 'mr_flamewall'], ['expect', 'mr_flame_gone'], ['use', 13, 3], ['expect', 'item:Magma Ball'], ['shot', 'magma_ball'], ['ckpt', 'magma'],
  ['enter', 'mr_tablet', 16, 11], ['enter', 'mr_hub', 16, 10], ['expectMap', 'mr_hub'], ['enter', 'mr_w1', 1, 11], ['enter', 'mr_w2', 12, 1], ['go', 5, 3], ['idle'], ['until', () => G.get('mr_flood1') === 0, 300], ['enter', 'mr_hub', 8, 0], ['enter', 'magma_rock_top', 12, 22], ['expectMap', 'magma_rock_top'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- Loho: the diggers' cannon (the Magma Ball is its shot); Lull and a Golem Core past the wall, a Golem Core under the boulder ----
  ['world', 'loho'], ['shot', 'loho'], ['enter', 'loho_inn'], ['inn'], ['shop', 'loho_shop'], ['enter', 'loho'],
  ['talk', 'loho_d1'], ['use', 31, 10], ['idle'], ['expect', 'loho_cannon_given'], ['shot', 'loho_blasted'], ['djinni', 'Lull'], ['explore'],
  ['cast', 'Lift', 10, 10, DIR.UP], ['psyat', 'Scoop', 'loho_core2'], ['expect', 'item:Golem Core'], ['ckpt', 'loho'],
  // ---- Vorn the alchemist (class item: the Mad Alchemist's Vial); Transmute on his lead statues ----
  ['enter', 'loho_house5'], ['teacher', 'vorn', 'vorn_done', 3], ['expect', 'vorn_done'], ['expect', "item:Mad Alchemist's Vial"], ['cast', 'Transmute', 2, 2, DIR.UP], ['cast', 'Transmute', 4, 2, DIR.UP], ['enter', 'loho'], ['ckpt', 'vorn'], ['enter', 'world_tla'], ['idle'], ['expect', 'ship_cannon'],
  // ---- the Northern Reaches: the ice wall under the spires, the cannon ----
  ['sail', 95, 31], ['idle'], ['expect', 'ice_wall_broken'], ['ckpt', 'ice_wall'],
  // ---- Prox: the village of the northern flame (js/maps/prox.js) - the welcome at the south gate, the store and the inn, Mold
  // (it dives into the snow by the pool; Scoop it out), the Dark Matter under the boulder by the east cliff, the parents' empty
  // room at the mayor's, the Sacred Feather in his cellar, then Puelle's council at the north edge -> Chapter 7 ----
  ['level', 36], ['party'], ['world', 'prox'], ['trig', 'T3.proxArrive'], ['expect', 'prox_arrived'], ['shot', 'prox'],
  ['use', 29, 41], ['enter', 'prox_inn'], ['inn'], ['enter', 'prox'], ['enter', 'prox_shop'], ['shop', 'prox_weapon'], ['shop', 'prox_item'], ['enter', 'prox'],
  ['talk', 'mold_npc'], ['idle'], ['expect', 'mold_hidden'], ['psyat', 'Scoop', 'prox_mold'], ['idle'], ['djinni', 'Mold'],
  ['psyat', 'Lift', 'prox_rock'], ['psyat', 'Scoop', 'prox_dark'], ['expect', 'item:Dark Matter'],
  ['trig', 'T3.proxParentsGone'], ['expect', 'prox_parents_gone'], ['enter', 'prox_mayor'], ['talk', 'prox_mayor_npc'], ['enter', 'prox_basement'], ['use', 8, 4], ['expect', 'item:Sacred Feather'], ['enter', 'prox_mayor'], ['enter', 'prox'],
  ['trig', 'T3.proxCouncil'], ['expect', 'prox_council'], ['shot', 'prox_council'], ['ckpt', 'prox'], ['enter', 'prox_house8'], ['teacher', 'kaldr', 'kaldr_done', 3], ['expect', 'kaldr_done'], ['expect', "item:Warlord's Helm"], ['enter', 'prox'],   /* the class item: Kaldr's helm */ ['enter', 'prox_inn'], ['inn'], ['enter', 'prox'], ['enter', 'world_tla', 7, 0],
  // ---- Mars Lighthouse (js/maps/mars_lh.js): the frozen tower, room by room to the guide's chapter 17 ----
  ['heal'], ['world', 'mars_lh_1'], ['expect', 'mars_entered'], ['shot', 'mars_lh_1'], ['chest', 5, 13],
  ['enter', 'ml_hall'], ['shot', 'ml_hall'], ['psyat', 'Pound', 'ml_hall_cone_r0'], ['chest', 26, 15], ['idle'],   // the Mimic's chest behind the rightmost cone
  ['enter', 'ml_east'], ['go', 2, 3], ['enter', 'ml_hall'],   // round the back room and up onto the ledge
  ['enter', 'ml_west'], ['psyat', 'Pound', 'ml_west_cone'], ['psyat', 'Grind', 'ml_west_slab'], ['expect', 'ml_west_ground'], ['psyat', 'Burst', 'ml_west_sheet_16'], ['expect', 'ml_west_burst'],
  ['enter', 'ml_tp1'], ['enter', 'ml_flames'], ['shot', 'ml_flames'], ['dodge', 2, 4], ['push', 'ml_fl_statue', DIR.RIGHT, 18], ['go', 20, 3], ['enter', 'ml_ice1'], ['shot', 'ml_ice1'],
  ['go', 15, 8], ['slide', 'LURULDL'], ['idle'], ['expectMap', 'ml_dragon1'], ['psyat', 'Blaze', 'ml_dr1_head'], ['expect', 'ml_ice1_cracked'], ['enter', 'ml_ice1'], ['psyat', 'Burst', 'ml_ice1_crack'], ['expect', 'ml_ice1_burst'],
  ['enter', 'ml_dragon2'], ['psyat', 'Blaze', 'ml_dr2_head'], ['expect', 'ml_dr2_lit'], ['enter', 'ml_three'], ['chest', 15, 7], ['chest', 5, 7], ['enter', 'ml_cones'], ['shot', 'ml_cones'], ['ckpt', 'fire_lane'],
  ['lane', 8, 23, 150], ['psyat', 'Pound', 'ml_cn_cone0'], ['go', 7, 23],
  ['lane', 8, 19, 150], ['psyat', 'Pound', 'ml_cn_cone1'], ['go', 7, 19],
  ['lane', 8, 15, 150], ['psyat', 'Pound', 'ml_cn_cone2'], ['go', 7, 15],
  ['lane', 8, 11, 150], ['psyat', 'Pound', 'ml_cn_cone3'], ['go', 7, 11],
  ['lane', 8, 7, 150], ['psyat', 'Pound', 'ml_cn_cone4'], ['go', 7, 7],
  ['lane', 8, 5, 150], ['psyat', 'Pound', 'ml_cn_cone5'], ['go', 7, 5],
  ['go', 7, 3], ['enter', 'ml_ice2'], ['shot', 'ml_ice2'],
  ['go', 7, 2], ['push', 'ml_ice2_statue', DIR.RIGHT, 1], ['slide', 'LDRURULDRUL'], ['idle'], ['djinni', 'Balm'], ['slide', 'ULU'], ['idle'], ['expectMap', 'ml_lapis'], ['shot', 'ml_lapis'],
  ['go', 7, 5], ['drop', 7, 6], ['idle'], ['chest', 10, 10], ['expect', 'teleportUnlocked'], ['equip', 'Teleport Lapis'], ['psyat', 'Teleport', 'ml_circle_b'], ['idle'], ['expectMap', 'ml_tp1'], ['ckpt', 'teleport'],
  ['enter', 'ml_flames'], ['dodge', 20, 3], ['enter', 'ml_ice1'], ['enter', 'ml_tp_hidden'], ['go', 5, 5], ['psy', 'Reveal'], ['psyat', 'Teleport', 'ml_circle_c'], ['idle'], ['expectMap', 'ml_vstairs'], ['shot', 'ml_vstairs'],
  ['chest', 3, 10], ['expect', 'item:Valkyrie Mail'], ['equip', 'Valkyrie Mail'], ['go', 8, 5], ['drop', 8, 6], ['idle'], ['expectMap', 'ml_timer'], ['shot', 'ml_timer'],
  ['psyat', 'Pound', 'ml_tm_rock1'], ['psyat', 'Pound', 'ml_tm_rock2'], ['go', 7, 6], ['slide', 'RDRUR'], ['idle'], ['psyat', 'Pound', 'ml_tm_cone1'], ['psyat', 'Pound', 'ml_tm_cone2'], ['push', 'ml_tm_statue', DIR.RIGHT, 3], ['psyat', 'Teleport', 'ml_circle_e'], ['idle'], ['expectMap', 'ml_jump'], ['shot', 'ml_jump'],
  ['go', 2, 4], ['go', 2, 6], ['go', 2, 8], ['go', 8, 8], ['go', 8, 6], ['go', 10, 6], ['go', 12, 6], ['go', 12, 4], ['go', 12, 2], ['chest', 13, 2], ['expect', 'item:Sol Blade'], ['equip', 'Sol Blade'],
  ['go', 12, 4], ['go', 12, 6], ['go', 10, 6], ['go', 8, 6], ['go', 8, 8], ['go', 2, 8], ['go', 2, 10], ['enter', 'ml_dragons'], ['shot', 'ml_dragons'], ['ckpt', 'flame_dragons_pre'],
  ['healhere'], ['psyat', 'Blaze', 'ml_dragons_ice'], ['expect', 'ml_dragons_blazed'], ['psyat', 'Burst', 'ml_dragons_crack'], ['idle'], ['expect', 'flame_dragons_done'], ['shot', 'flame_dragons'], ['ckpt', 'flame_dragons'],
  ['use', 10, 7], ['idle'], ['expect', 'mars_star'], ['use', 10, 2], ['idle'], ['expect', 'mars_thawed'], ['shot', 'mars_thawed'],
  ['healhere'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'], ['world', 'mars_lh_1'], ['enter', 'ml_hall'], ['shot', 'ml_hall_warm'], ['enter', 'ml_east'], ['go', 2, 3], ['enter', 'ml_hall'], ['psyat', 'Blaze', 'ml_hall_head_l'], ['expect', 'ml_hall_melted'], ['psyat', 'Burst', 'ml_hall_crack_14'], ['expect', 'ml_hall_burst'],
  ['enter', 'ml_east'], ['djinni', 'Fugue'], ['enter', 'ml_hall'], ['enter', 'ml_spirits'], ['shot', 'ml_spirits'], ['use', 12, 1], ['idle'], ['expect', 'ml_spirit_doors'], ['ckpt', 'spirits'],
  // the wind tower
  ['enter', 'ml_wind1'], ['shot', 'ml_wind1'], ['psyat', 'Cyclone', 'ml_wd_swirl_up'], ['idle'], ['psy', 'Reveal'], ['psyat', 'Cyclone', 'ml_wd_block0'], ['psyat', 'Cyclone', 'ml_wd_block1'], ['psyat', 'Cyclone', 'ml_wd_block2'], ['psyat', 'Cyclone', 'ml_wd_block3'], ['psyat', 'Cyclone', 'ml_wd_block4'], ['psyat', 'Cyclone', 'ml_wd_block5'],
  ['push', 'ml_wd_statue', DIR.RIGHT, 2], ['push', 'ml_wd_statue', DIR.UP, 1], ['expect', 'ml_wd_pad'], ['hover', 13, 4, 18, 4], ['chest', 19, 5], ['psy', 'Reveal'], ['go', 22, 5], ['enter', 'ml_wind_out'], ['psyat', 'Blaze', 'ml_wd_flame'], ['expect', 'ml_beacon_jupiter'], ['psyat', 'Teleport', 'ml_circle_wo'], ['idle'], ['expectMap', 'ml_spirits'],
  // the water tower
  ['enter', 'ml_water1'], ['shot', 'ml_water1'], ['go', 13, 7], ['slide', 'LURULURR'], ['idle'], ['expectMap', 'ml_water2'], ['shot', 'ml_water2'], ['psyat', 'Frost', 'ml_wp_pud1'], ['push', 'ml_wp_ph1', DIR.UP, 1], ['psyat', 'Frost', 'ml_wp_pud2'], ['push', 'ml_wp_pv', DIR.RIGHT, 1], ['push', 'ml_wp_ph2', DIR.UP, 1], ['idle'], ['expect', 'ml_pipes_fixed'],
  ['enter', 'ml_water1'], ['idle'], ['slide', 'LDLDRUR'], ['idle'], ['psyat', 'Blaze', 'ml_wt_head'], ['expect', 'ml_wt_melted'], ['slide', 'LDLUL'], ['idle'], ['expectMap', 'ml_water_out'], ['psyat', 'Blaze', 'ml_wt_flame'], ['expect', 'ml_beacon_mercury'], ['psyat', 'Teleport', 'ml_circle_wto'], ['idle'], ['expectMap', 'ml_spirits'],
  // the dragon tower
  ['enter', 'ml_fire_out0'], ['chest', 12, 5], ['equip', "Alastor's Hood"], ['enter', 'ml_fire1'], ['shot', 'ml_fire1'], ['psyat', 'Burst', 'ml_fr_crack0'], ['psyat', 'Burst', 'ml_fr_crack1'], ['go', 3, 4], ['idle'], ['expect', 'ml_fr_button'], ['psyat', 'Blaze', 'ml_fr_torch'], ['expect', 'ml_fr_torch'], ['psyat', 'Burst', 'ml_fr_crack_c'], ['expect', 'ml_fr_center'],
  ['enter', 'ml_fire2'], ['shot', 'ml_fire2'], ['go', 6, 6], ['psy', 'Move', DIR.DOWN, DIR.RIGHT], ['idle'], ['expect', 'ml_f2_fed'], ['push', 'ml_f2_statue', DIR.DOWN, 2], ['go', 12, 6], ['go', 12, 7], ['push', 'ml_f2_pipe2', DIR.LEFT, 1], ['expect', 'ml_f2_dry'], ['enter', 'ml_fire_out'], ['psyat', 'Blaze', 'ml_fr_flame'], ['expect', 'ml_beacon_mars'], ['psyat', 'Teleport', 'ml_circle_fo'], ['idle'], ['expectMap', 'ml_spirits'],
  // the earth tower
  ['enter', 'ml_earth1'], ['shot', 'ml_earth1'], ['push', 'ml_e1_statue_r', DIR.RIGHT, 1], ['idle'], ['expect', 'ml_e1_open'], ['enter', 'ml_earth2'], ['shot', 'ml_earth2'], ['push', 'ml_e2_statue_l', DIR.RIGHT, 1], ['idle'], ['expect', 'ml_e2_open'], ['go', 3, 6], ['go', 3, 4],
  ['psyat', 'Carry', 'ml_e2_stone1'], ['go', 4, 3], ['cast', 'Carry', 5, 3, DIR.RIGHT], ['psyat', 'Carry', 'ml_e2_stone0'], ['go', 5, 3], ['go', 7, 3], ['go', 13, 3], ['cast', 'Carry', 14, 3, DIR.RIGHT], ['go', 14, 3], ['go', 16, 3], ['push', 'ml_e2_block', DIR.RIGHT, 4], ['go', 20, 4], ['enter', 'ml_earth3'], ['shot', 'ml_earth3'],
  ['go', 16, 2], ['push', 'ml_e3_statue', DIR.DOWN, 1], ['idle'], ['go', 18, 8], ['lane', 12, 10, 60], ['psy', 'Sand'], ['go', 4, 10], ['lane', 1, 10, 30], ['enter', 'ml_earth_out'], ['psyat', 'Blaze', 'ml_e_flame'], ['expect', 'ml_beacon_venus'], ['psyat', 'Teleport', 'ml_circle_eo'], ['idle'], ['expectMap', 'ml_spirits'], ['ckpt', 'four_flames'],
  // ---- before the Doom Dragon: everything optional that is left, and every optional boss (the rule: all of it before the last
  // battle). Out of the tower and round the world - the Islet Cave's inner corridors, the Yampi Desert Cave, the Anemos
  // Inner Sanctum with all seventy-two Djinn - and back up to the hall of spirits ----
  ['healhere'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'world_tla'],
  // ---- the Islet Cave's inner corridors, with Teleport (George's ride, the hall's circle, five corridors each
  // darker than the last, Tremor on the rock for Serac, the Sentinel and Catastrophe) ----
  ['world', 'sea_of_time_islet'], ['expectMap', 'sea_of_time_islet'], ['talk', 'lonesome_george'], ['idle'], ['expectMap', 'islet_cave_isle'], ['enter', 'islet_cave'], ['expectMap', 'islet_cave'],
  ['psyat', 'Teleport', 'ic_circle_top'], ['idle'], ['expectMap', 'islet_corridor_1'], ['shot', 'islet_corridor_1'], ['enter', 'islet_corridor_2'], ['psyat', 'Tremor', 'ico_serac_rock'], ['idle'], ['djinni', 'Serac'], ['enter', 'islet_corridor_3'], ['enter', 'islet_corridor_4'], ['enter', 'islet_corridor_5'], ['shot', 'islet_corridor_5'],
  ['healhere'], ['enter', 'islet_shrine'], ['expectMap', 'islet_shrine'], ['go', 8, 8], ['idle'], ['expect', 'sentinel_done'], ['use', 8, 3], ['expect', 'catastrophe_taken'], ['shot', 'catastrophe'], ['ckpt', 'islet_inner'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'islet_cave_isle'], ['talk', 'george_here'], ['idle'], ['expectMap', 'sea_of_time_islet'],
  // ---- Yampi Desert Cave (Sand, Teleport, Burst, Scoop, Pound): the rear entrance's slide, the crack, the outer cave and
  // its circle; the inner dungeon's rooms and Crystal in the sand; Valukar and Daedalus ----
  ['world', 'yampi_s'], ['expectMap', 'yampi_10'], ['go', 9, 10], ['psy', 'Sand', DIR.LEFT], ['go', 7, 10], ['enter', 'yampi_cave'], ['expectMap', 'yampi_cave'], ['shot', 'yampi_cave'], ['chest', 4, 8],
  ['psyat', 'Teleport', 'ydc_circle'], ['idle'], ['expectMap', 'ydc_1'], ['shot', 'ydc_1'], ['go', 9, 6], ['psy', 'Sand', DIR.UP], ['go', 9, 3], ['psy', 'Burst', DIR.LEFT], ['enter', 'ydc_2'], ['expectMap', 'ydc_2'],
  ['roll', 'ydc_log_a', DIR.LEFT], ['go', 5, 4], ['psy', 'Sand', DIR.UP], ['go', 5, 2], ['enter', 'ydc_3'], ['expectMap', 'ydc_3'], ['shot', 'ydc_3'], ['psyat', 'Scoop', 'ydc_dig'], ['expect', 'item:Mythril Silver'],
  ['go', 8, 8], ['psy', 'Sand', DIR.RIGHT], ['go', 10, 8], ['push', 'ydc_pillar', DIR.UP, 2], ['cast', 'Move', 16, 6, DIR.LEFT], ['cast', 'Move', 15, 6, DIR.LEFT], ['idle'], ['expect', 'ydc_pillar_tile'],
  ['enter', 'ydc_4'], ['chest', 4, 6], ['expect', 'item:Dark Matter'], ['enter', 'ydc_3'], ['enter', 'ydc_5'], ['expectMap', 'ydc_5'], ['shot', 'ydc_5'], ['roll', 'ydc_log4', DIR.RIGHT], ['enter', 'ydc_col'], ['cast', 'Move', 8, 5, DIR.UP], ['cast', 'Move', 8, 4, DIR.UP], ['idle'], ['expect', 'ydc_column_done'], ['chest', 9, 7],
  ['enter', 'ydc_5'], ['chest', 10, 13], ['enter', 'ydc_6'], ['expectMap', 'ydc_6'], ['chest', 4, 5], ['expect', 'item:Orihalcon'], ['go', 10, 7], ['psy', 'Burst', DIR.UP], ['enter', 'ydc_3'], ['expectMap', 'ydc_3'],
  ['enter', 'ydc_2'], ['enter', 'ydc_1'], ['enter', 'ydc_djinn'], ['expectMap', 'ydc_djinn'], ['psyat', 'Scoop', 'ydc_crystal_dig'], ['idle'], ['until', () => G.party.djinnFound.includes('Crystal'), 300], ['enter', 'ydc_1'],
  ['pound', 'ydc_cone'], ['healhere'], ['enter', 'ydc_boss'], ['expectMap', 'ydc_boss'], ['go', 8, 8], ['idle'], ['expect', 'valukar_done'], ['use', 8, 3], ['expect', 'daedalus_taken'], ['shot', 'daedalus'], ['ckpt', 'yampi_cave'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'yampi_10'],
  // ---- Anemos Inner Sanctum (all 72 Djinn, Teleport): the sealed gate's dead end (Reveal: Dragon Skin), the town's circle,
  // the hall of circles, Charon's slate, the mimic stone, the seven buttons, the cracked tiles, the boulders and columns,
  // the second stone, the Orihalcon and the sand, the bird of six blocks, Hover, Dullahan and Iris ----
  ['world', 'contigo'], ['enter', 'anemos_gate'], ['expectMap', 'anemos_gate'], ['go', 4, 8], ['psy', 'Reveal'], ['go', 4, 4], ['chest', 3, 3], ['expect', 'item:Dragon Skin'], ['enter', 'contigo'],
  ['psyat', 'Teleport', 'contigo_circle'], ['idle'], ['expectMap', 'anemos'], ['shot', 'anemos'], ['go', 6, 6], ['idle'], ['go', 17, 6], ['idle'], ['go', 6, 14], ['idle'], ['go', 17, 14], ['idle'], ['expect', 'an_hall_open'],
  ['enter', 'anemos_charon'], ['expectMap', 'anemos_charon'], ['use', 8, 5], ['idle'], ['expect', 'charon_taken'], ['shot', 'charon'],
  ['enter', 'anemos_mimic1'], ['expectMap', 'anemos_mimic1'], ['shot', 'anemos_mimic1'], ['walk', 'URRRRRRRRRRRRRDLLLLLLLLLLLLUUL'], ['idle'], ['expect', 'an_mimic1_done'],
  ['enter', 'anemos_buttons'], ['expectMap', 'anemos_buttons'], ['go', 4, 3], ['go', 9, 3], ['go', 15, 3], ['go', 15, 8], ['go', 12, 11], ['go', 7, 11], ['go', 4, 8], ['idle'], ['expect', 'an_buttons_done'], ['go', 9, 6], ['idle'], ['expectMap', 'anemos_lights'], ['shot', 'anemos_lights'],
  ['go', 7, 9], ['walk', 'URRRULLLURRRULLLU'], ['idle'], ['expect', 'an_lights_open'], ['enter', 'anemos_lift'], ['expectMap', 'anemos_lift'], ['shot', 'anemos_lift'],
  ['psyat', 'Lift', 'an_boulder1'], ['push', 'an_column1', DIR.UP, 1], ['push', 'an_column1', DIR.RIGHT, 2], ['cast', 'Move', 14, 7, DIR.UP], ['go', 14, 5], ['push', 'an_column2', DIR.RIGHT, 3], ['idle'], ['expect', 'an_lift_done'],
  ['enter', 'anemos_mimic2'], ['expectMap', 'anemos_mimic2'], ['walk', 'URRRRRRRRRRRRRLLLLLLLLLLLLLUUUUU'], ['idle'], ['expect', 'an_mimic2_done'],
  ['enter', 'anemos_orihalcon'], ['expectMap', 'anemos_orihalcon'], ['shot', 'anemos_orihalcon'], ['chest', 3, 6], ['expect', 'item:Orihalcon'], ['chest', 17, 13], ['go', 11, 4], ['psy', 'Sand', DIR.RIGHT], ['go', 18, 4], ['enter', 'anemos_bird'], ['expectMap', 'anemos_bird'], ['shot', 'anemos_bird'],
  ['push', 'an_bird_0', DIR.RIGHT, 4], ['push', 'an_bird_0', DIR.DOWN, 2], ['push', 'an_bird_1', DIR.LEFT, 5], ['push', 'an_bird_1', DIR.DOWN, 2], ['push', 'an_bird_2', DIR.RIGHT, 5], ['push', 'an_bird_2', DIR.UP, 4], ['push', 'an_bird_3', DIR.LEFT, 6], ['push', 'an_bird_3', DIR.UP, 4], ['push', 'an_bird_4', DIR.DOWN, 2], ['push', 'an_bird_4', DIR.RIGHT, 5], ['push', 'an_bird_5', DIR.UP, 4], ['push', 'an_bird_5', DIR.LEFT, 6], ['idle'], ['expect', 'an_bird_done'],
  ['healhere'], ['go', 9, 7], ['psy', 'Hover'], ['idle'], ['expectMap', 'anemos_aerie'], ['shot', 'anemos_aerie'], ['go', 8, 8], ['idle'], ['expect', 'dullahan_done'], ['use', 8, 3], ['expect', 'iris_taken'], ['shot', 'iris'], ['ckpt', 'anemos'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'contigo'],
  // ---- class items a run may have passed by (a run that began before they existed): each only while its flag is unset ----
  ['enter', 'world_tla'],
  ['unless', 'swa_islet_seen', [['world', 'sw_atteka_islet'], ['try', ['psyat', 'Lift', 'swa_boulder']], ['idle'], ['explore'], ['js', () => G.set('swa_islet_seen')], ['enter', 'world_tla']]],   /* the south-west islet, if the first pass could not put in there */
  // ---- Golden Sun's class items, for a run whose first journey predates them (Angara is on this map too): each only while its flag is unset ----
  ['unless', 'mauler_done', [['world', 'kolima_forest'], ['enter', 'kolima_forest_n'], ['enter', 'hunt_grounds'], ['psyat', 'Whirlwind', 'hg_bush1'], ['psyat', 'Whirlwind', 'hg_bush2'], ['chest', 17, 8], ['healhere'], ['talk', 'boss_mauler'], ['idle'], ['expect', 'mauler_done'], ['cast', 'Grapple', 12, 13, DIR.RIGHT], ['chest', 20, 13], ['cast', 'Grapple', 16, 13, DIR.LEFT], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'matriarch_done', [['world', 'mogall'], ['enter', 'mogall_den'], ['chest', 2, 13], ['psyat', 'Whirlwind', 'md_bush'], ['healhere'], ['talk', 'boss_matriarch'], ['idle'], ['expect', 'matriarch_done'], ['cast', 'Prowl', 8, 5, DIR.UP], ['chest', 17, 2], ['go', 8, 6], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'ore_golem_done', [['world', 'altin'], ['enter', 'altin_shaft'], ['chest', 2, 16], ['cast', 'Lift', 10, 9, DIR.UP], ['chest', 5, 6], ['healhere'], ['talk', 'boss_ore_golem'], ['idle'], ['expect', 'ore_golem_done'], ['try', ['cast', 'Lantern', 6, 2, DIR.UP]], ['cast', 'Grapple', 9, 1, DIR.RIGHT], ['chest', 14, 1], ['chest', 17, 6], ['cast', 'Grapple', 11, 1, DIR.LEFT], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'shadow_done', [['world', 'xian'], ['enter', 'silk_shrine'], ['cast', 'Force', 9, 8, DIR.UP], ['chest', 2, 2], ['chest', 17, 2], ['healhere'], ['talk', 'boss_shadow'], ['idle'], ['expect', 'shadow_done'], ['cast', 'Shadow Step', 9, 6, DIR.UP], ['chest', 9, 5], ['enter', 'xian'], ['enter', 'world_tla']]],
  ['unless', 'anemos_observatory:chest:9,4', [['world', 'contigo'], ['enter', 'contigo'], ['enter', 'anemos_observatory'], ['cast', 'Shadow Step', 9, 5, DIR.UP], ['chest', 9, 4], ['enter', 'contigo'], ['enter', 'world_tla']]],   /* the observatory's alcove, now that the mask is ours */
  ['unless', 'dorian_done', [['world', 'kalay'], ['enter', 'kalay_inn'], ['teacher', 'dorian', 'dorian_done', 3], ['expect', 'dorian_done'], ['enter', 'kalay'], ['enter', 'world_tla']]],
  ['unless', 'poi_done', [['world', 'lama'], ['enter', 'lama_hall'], ['teacher', 'master_poi', 'poi_done', 3], ['expect', 'poi_done'], ['enter', 'lama'], ['enter', 'world_tla']]],
  ['unless', 'brannock_done', [['world', 'tolbi'], ['enter', 'tolbi_yard'], ['teacher', 'brannock', 'brannock_done', 3], ['expect', 'brannock_done'], ['cast', 'Shove', 23, 5, DIR.RIGHT], ['chest', 23, 5], ['enter', 'tolbi'], ['enter', 'world_tla']]],
  ['unless', 'tolo_done', [['world', 'lunpa'], ['enter', 'lunpa_inn'], ['teacher', 'tolo', 'tolo_done', 3], ['expect', 'tolo_done'], ['cast', 'Lockpick', 12, 2, DIR.UP], ['enter', 'lunpa'], ['enter', 'world_tla']]],
  ['unless', 'clockwork_done', [['world', 'lalivero'], ['enter', 'lalivero_reservoir'], ['enter', 'babi_workshop'], ['cast', 'Move', 10, 8, DIR.UP, DIR.UP], ['cast', 'Move', 10, 7, DIR.UP, DIR.UP], ['chest', 2, 5], ['chest', 19, 5], ['healhere'], ['talk', 'boss_clockwork'], ['idle'], ['expect', 'clockwork_done'], ['cast', 'Repair', 10, 3, DIR.UP], ['chest', 10, 1], ['cast', 'Repair', 3, 9, DIR.RIGHT], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'colossus_done', [['world', 'vale_south'], ['enter', 'sol_sanctum_statues'], ['enter', 'aleph_heart'], ['cast', 'Grapple', 11, 8, DIR.UP], ['chest', 3, 3], ['chest', 20, 3], ['healhere'], ['talk', 'boss_colossus'], ['idle'], ['expect', 'colossus_done'], ['cast', 'Grapple', 11, 7, DIR.DOWN], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  // ---- the loot behind those bosses, for a run whose catch-up blocks stopped at the boss (each only while its chest is shut) ----
  ['unless', 'hunt_grounds:chest:20,13', [['world', 'kolima_forest'], ['enter', 'kolima_forest_n'], ['enter', 'hunt_grounds'], ['cast', 'Grapple', 12, 13, DIR.RIGHT], ['chest', 20, 13], ['cast', 'Grapple', 16, 13, DIR.LEFT], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'mogall_den:chest:17,2', [['world', 'mogall'], ['enter', 'mogall_den'], ['cast', 'Prowl', 8, 5, DIR.UP], ['chest', 17, 2], ['go', 8, 6], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'altin_shaft:chest:17,6', [['world', 'altin'], ['enter', 'altin_shaft'], ['try', ['cast', 'Lantern', 6, 2, DIR.UP]], ['cast', 'Grapple', 9, 1, DIR.RIGHT], ['try', ['chest', 14, 1]], ['chest', 17, 6], ['cast', 'Grapple', 11, 1, DIR.LEFT], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'silk_shrine:chest:9,5', [['world', 'xian'], ['enter', 'silk_shrine'], ['try', ['cast', 'Force', 9, 8, DIR.UP]], ['cast', 'Shadow Step', 9, 6, DIR.UP], ['chest', 9, 5], ['enter', 'xian'], ['enter', 'world_tla']]],
  ['unless', 'scorpion_queen_done', [['world', 'yampi_1'], ['enter', 'yampi_3'], ['enter', 'scorpion_den'], ['pound', 'sd_pillar'], ['chest', 2, 2], ['chest', 19, 2], ['healhere'], ['talk', 'boss_scorpion_queen'], ['idle'], ['expect', 'scorpion_queen_done'], ['cast', 'Sandstorm', 6, 12, DIR.LEFT], ['chest', 3, 6], ['cast', 'Sandstorm', 15, 12, DIR.RIGHT], ['chest', 18, 10], ['chest', 18, 6], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'pupetta_done', [['world', 'madra'], ['enter', 'madra_house1'], ['teacher', 'pupetta', 'pupetta_done', 3], ['expect', 'pupetta_done'], ['enter', 'madra_theatre'], ['cast', 'Puppet', 6, 4, DIR.UP], ['puppet', 'RRRRR'], ['try', ['chest', 12, 5]], ['enter', 'madra_house1'], ['enter', 'madra'], ['enter', 'world_tla']]],
  ['unless', 'redbeard_done', [['world', 'champa'], ['teacher', 'redbeard', 'redbeard_done', 3], ['expect', 'redbeard_done'], ['enter', 'world_tla']]],
  ['unless', 'susa_done', [['world', 'izumo'], ['teacher', 'susa_spar', 'susa_done', 3], ['expect', 'susa_done'], ['cast', 'Rhythm', 20, 5, DIR.UP], ['cast', 'Rhythm', 21, 5, DIR.UP], ['cast', 'Rhythm', 27, 5, DIR.UP], ['enter', 'world_tla']]],
  ['unless', 'leviathan_done', [['world', 'lemuria'], ['enter', 'lemuria'], ['enter', 'sunken_vault'], ['cast', 'Move', 4, 12, DIR.UP, DIR.UP], ['chest', 11, 1], ['healhere'], ['talk', 'boss_leviathan'], ['idle'], ['expect', 'leviathan_done'], ['go', 2, 6], ['psy', 'Ebb'], ['chest', 1, 3], ['chest', 2, 3], ['go', 2, 6], ['go', 21, 6], ['psy', 'Ebb'], ['chest', 21, 3], ['chest', 22, 3], ['go', 21, 6], ['psy', 'Retreat'], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'whitefeather_done', [['world', 'shaman'], ['teacher', 'whitefeather', 'whitefeather_done', 3], ['expect', 'whitefeather_done'], ['try', ['psy', 'Spirit Sight']], ['try', ['talk', 'sv_ghost']], ['idle'], ['enter', 'world_tla']]],
  ['unless', 'vorn_done', [['world', 'loho'], ['enter', 'loho_house5'], ['teacher', 'vorn', 'vorn_done', 3], ['expect', 'vorn_done'], ['cast', 'Transmute', 2, 2, DIR.UP], ['cast', 'Transmute', 4, 2, DIR.UP], ['enter', 'loho'], ['enter', 'world_tla']]],
  ['unless', 'hama_shade_done', [['world', 'contigo'], ['enter', 'anemos_observatory'], ['psyat', 'Cyclone', 'ao_growth'], ['chest', 2, 2], ['chest', 17, 2], ['healhere'], ['talk', 'boss_hama_shade'], ['idle'], ['expect', 'hama_shade_done'], ['try', ['cast', 'Shadow Step', 9, 5, DIR.UP]], ['try', ['chest', 9, 4]], ['enter', 'contigo'], ['enter', 'world_tla']]],
  ['unless', 'kaldr_done', [['world', 'prox'], ['enter', 'prox_house8'], ['teacher', 'kaldr', 'kaldr_done', 3], ['expect', 'kaldr_done'], ['enter', 'prox'], ['enter', 'world_tla']]],
  // ---- the last three class items, the hardest: the Halls of Time under the Sea of Time islet (Dive), the Frostwyrm's
  // hollow past the Mars Lighthouse (Warmth), and Weyard's Edge behind Atteka Cavern once the wyrm has fallen ----
  ['enter', 'world_tla'], ['heal'], ['world', 'sea_of_time_islet'], ['expectMap', 'sea_of_time_islet'], ['psyat', 'Dive', 'sot_dive'], ['idle'], ['expectMap', 'halls_of_time'], ['shot', 'halls_of_time'], ['chest', 3, 3], ['chest', 18, 3], ['try', ['psy', 'Spirit Sight']], ['try', ['talk', 'ht_ghost']], ['idle'], ['healhere'], ['talk', 'boss_chronos'], ['idle'], ['expect', 'chronos_done'], ['expect', 'item:Chronos Sigil'], ['shot', 'chronos_beaten'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'sea_of_time_islet'], ['ckpt', 'halls_of_time'],
  ['enter', 'world_tla'], ['heal'], ['world', 'mars_lh_1'], ['enter', 'frostwyrm_hollow'], ['shot', 'frostwyrm_hollow'], ['chest', 2, 13], ['chest', 19, 13], ['go', 11, 12], ['psy', 'Warmth'], ['go', 11, 4], ['chest', 2, 1], ['chest', 19, 1], ['healhere'], ['talk', 'boss_frostwyrm'], ['idle'], ['expect', 'frostwyrm_done'], ['expect', 'item:Dragon Scale Amulet'], ['shot', 'frostwyrm_beaten'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'mars_lh_1'], ['ckpt', 'frostwyrm'],
  ['enter', 'world_tla'], ['heal'], ['world', 'atteka_cavern'], ['enter', 'weyard_edge'], ['shot', 'weyard_edge'], ['chest', 6, 4], ['chest', 17, 4], ['healhere'], ['talk', 'boss_void'], ['idle'], ['expect', 'void_done'], ['expect', 'item:Void Mantle'], ['shot', 'void_beaten'], ['psy', 'Retreat'], ['idle'], ['expectMap', 'atteka_cavern'], ['ckpt', 'weyard_edge'], ['enter', 'world_tla'],
  ['world', 'mars_lh_1'], ['enter', 'ml_hall'], ['enter', 'ml_east'], ['go', 2, 3], ['enter', 'ml_hall'], ['enter', 'ml_spirits'], ['expectMap', 'ml_spirits'], ['ckpt', 'all_optional_done'],   /* the ledge with the centre stair is reached through the back room, as on the first pass */
  // the aerie
  ['use', 12, 1], ['idle'], ['expect', 'ml_aerie_open'], ['healhere'],
  ['psyat', 'Teleport', 'ml_circle_g'], ['idle'], ['expectMap', 'ml_aerie_out'], ['shot', 'ml_aerie_out'], ['go', 7, 12], ['go', 7, 10], ['go', 7, 8], ['go', 7, 6], ['go', 7, 4], ['go', 7, 2], ['enter', 'ml_aerie'], ['shot', 'ml_aerie'], ['ckpt', 'aerie'],
  ['healhere'], ['trig', 'TLA.marsAerie'], ['idle'], ['expect', 'doom_dragon_done'], ['expect', 'mars_lit'], ['expect', 'game_complete'], ['shot', 'ending'], ['ckpt', 'ending'],
  ['enter', 'world_tla'], ['optional'], ['shot', 'post_game'], ['ckpt', 'post_game'],
  // ==================== the post-game (js/game/story_post.js, js/maps/postgame.js) ====================
  // the Wise One's warning (played by the epilogue; a run finished before it existed gets it here), then Alex under the
  // sunken summit, the Wise One in the Heart of Aleph, the Eyes to Hydros, and the Cradle: four grounds and the heart
  ['unless', 'postgame_open', [['world', 'prox'], ['js', () => { G.field.run(STORY_TLA.wiseOneWarning); }], ['idle'], ['expect', 'postgame_open']]],
  ['forge', 60],   // whatever raw material the road left in the bag becomes gear before the post-game's bosses (nothing held: no trip)
  ['enter', 'world_tla'], ['heal'], ['world', 'vale_south'], ['enter', 'sol_sanctum_statues'], ['enter', 'aleph_sunken'], ['expectMap', 'aleph_sunken'], ['shot', 'aleph_sunken'], ['healhere'], ['talk', 'alex_sealed'], ['idle'], ['expect', 'alex_beaten'], ['expect', 'alex_joined'], ['expectParty', ['Felix', 'Jenna', 'Sheba', 'Piers', 'Isaac', 'Garet', 'Ivan', 'Mia', 'Kraden', 'Alex']], ['shot', 'alex_joins'], ['ckpt', 'alex'],
  ['enter', 'sol_sanctum_statues'], ['enter', 'aleph_heart'], ['expectMap', 'aleph_heart'], ['cast', 'Grapple', 11, 8, DIR.UP], ['healhere'], ['bossTalk', 'wise_one_h', 'wise_one_done'], ['expect', 'wise_one_done'], ['expect', 'item:Eyes of Alchemy'], ['shot', 'wise_one_beaten'], ['ckpt', 'wise_one'], ['cast', 'Grapple', 11, 7, DIR.DOWN], ['psy', 'Retreat'], ['idle'],
  ['enter', 'world_tla'], ['heal'], ['world', 'lemuria'], ['enter', 'lemuria'], ['enter', 'lemuria_palace'], ['expectMap', 'lemuria_palace'], ['talk', 'Hydros'], ['idle'], ['expect', 'cradle_open'], ['shot', 'hydros_eyes'], ['ckpt', 'cradle_open'],
  ['enter', 'cradle_shore'], ['expectMap', 'cradle_shore'], ['idle'], ['shot', 'cradle_shore'], ['enter', 'cradle'], ['expectMap', 'cradle'], ['shot', 'cradle'],
  ['enter', 'cradle_grove'], ['expectMap', 'cradle_grove'], ['psyat', 'Lift', 'cg_rock1'], ['psyat', 'Lift', 'cg_rock2'], ['chest', 3, 3], ['chest', 18, 3], ['healhere'], ['talk', 'boss_terragon'], ['idle'], ['expect', 'terragon_done'], ['shot', 'terragon_beaten'], ['ckpt', 'terragon'], ['enter', 'cradle'],
  ['enter', 'cradle_deep'], ['expectMap', 'cradle_deep'], ['psyat', 'Frost', 'cd_puddle_8'], ['go', 10, 8], ['psyat', 'Frost', 'cd_puddle_7'], ['go', 10, 7], ['psyat', 'Frost', 'cd_puddle_6'], ['go', 10, 6], ['go', 10, 5], ['chest', 7, 4], ['chest', 12, 4], ['healhere'], ['talk', 'boss_thalassa'], ['idle'], ['expect', 'thalassa_done'], ['shot', 'thalassa_beaten'], ['ckpt', 'thalassa'], ['enter', 'cradle'],
  ['enter', 'cradle_forge'], ['expectMap', 'cradle_forge'], ['cast', 'Move', 10, 8, DIR.UP], ['chest', 4, 3], ['chest', 17, 3], ['healhere'], ['talk', 'boss_ignis'], ['idle'], ['expect', 'ignis_done'], ['shot', 'ignis_beaten'], ['ckpt', 'ignis'], ['enter', 'cradle'],
  ['enter', 'cradle_spire'], ['expectMap', 'cradle_spire'], ['psyat', 'Whirlwind', 'cs_leaves'], ['psyat', 'Whirlwind', 'cs_leaves2'], ['chest', 5, 2], ['chest', 14, 2], ['healhere'], ['talk', 'boss_zephyros'], ['idle'], ['expect', 'zephyros_done'], ['expect', 'cradle_heart_open'], ['shot', 'zephyros_beaten'], ['ckpt', 'zephyros'], ['enter', 'cradle'],
  ['enter', 'cradle_heart'], ['expectMap', 'cradle_heart'], ['healhere'], ['talk', 'boss_alkahest'], ['idle'], ['expect', 'alkahest_done'], ['expect', 'cradle_done'], ['expect', 'item:Alkahest Crown'], ['shot', 'cradle_done'], ['ckpt', 'cradle_done'],
  ['enter', 'cradle'], ['enter', 'cradle_shore'], ['enter', 'lemuria_palace'], ['expectMap', 'lemuria_palace'], ['shot', 'home_again'], ['ckpt', 'everything_done'],
];
'plan tla loaded';
