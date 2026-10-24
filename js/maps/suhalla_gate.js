// Suhalla Gate, traced from its rip (map references/golden-sun-suhalla-gate-gba-map.webp) by tools/caves/suhalla_gate_build.py:
// the pass from the desert to Lalivero, four screens wide - the palisade gate and Babi's guards, the guard hut, sand
// ledges under brown rock climbed by vine ladders, the Mint, Dew, a cave mouth with a Psynergy Stone, and the descent
// east. STORY.suhallaGate opens the palisade once the party carries Babi's leave.
'use strict';
const SG_ROWS = [
  '               #########################                                                                      ',
  '               #########################                                                                      ',
  '.....##...################...g######################################################                          ',
  '...###.........############...######################################################                          ',
  '..##....####################g.##############################################g####### ###########..............',
  '.#...##################ggg##g..############################################gg####### ######......#............',
  '....###...###########....##.gg.....#########..############################gg###g#### ##########...............',
  '...#.....############...#g#.###....######ggg..############################.##ggg#### ############.............',
  '..#..###A#g........##.##gg..########........##############################.#ggggg### ########..#####..........',
  '..#.###...............#g....########.......##g..#....##...###gg.g##....##.....ggg### ####gg###....#g#.........',
  '...##.....................ggg#######.#######gg....g.....ggg..............V.....##### ##gg.....#.#..g..........',
  '...gg....g..........g.ggg...g.gg##...######gg....##....###gg.##....##...#V#g....#.............................',
  '....g...............ggg##.......................#########################V#ggg...... ..............#.#........',
  '.................g..#######...#V.............##.#######################..V.####..... ......g...###...#........',
  '.#GGGGGGGG..#####gg.###########V###ggg#########..######################..V.g####.... ..####g...#######........',
  '#g........#..###..g.###########V#############gg..########################Vgg#####... ######g#...#gg##.........',
  '#.................g############V##g##ggg#####gg########.################g.#######.## #...#####..##....#.......',
  'g..........####.#..###########g.##g....###############...g##....##....##g########### ..###############........',
  '...#g......g###...####g.gg###....ggg.#################gggg.g....##......g####B###### .##....#########.........',
  '..#g..####......gg####....####V.gg###############...##.####...######V....###...##### ......#########...##.....',
  '..########.##...######.#######V##################......########...##V#g..gggg.gg#### ...#######gggg#####gg....',
  '#.######...#########...##...##V#####################........#.........############## .#######.....g######.....',
  '..####.....#########.........#V###########################.....###..g.############## ..gggg.......######......',
  '#.##########################....#################################################### ..ggg..#...##########....',
  '#...########..###################################################################### ...gg################....',
  '##...#######...##################################################################### ....#################....',
  '##..######..#..##################################################################### .....############..##....',
  '##.#######.....#########################                                             ##.#.##gg###...gg........',
  '##....#####....                                                                      #....g........ggg........',
  '#.....###......                                                                      ..###..........g.........',
  '.....#.......#.                                                                      #####...##...............',
  '###...........#                                                                      #########...#.........#g.',
  '##..#.........#                                                                      #######....#######..###gg',
  '............gg.                                                                                               ',
  '   .........                                                                                                  ',
];
const SG_LEGEND = { '.': 'sand', 'g': 'grass', 'V': { ground: 'sand', obj: 'vineladder', walk: true }, 'G': { ground: 'sand', obj: 'palisade_face' }, 'A': 'sand', 'B': 'sand' };
defineMap('suhalla_gate', {
  name: 'Suhalla Gate', w: 110, h: 35, base: 'void', music: 'desert', bg: 'sand', entry: { x: 7, y: 33 }, enc: [['Ruffian', 'Ruffian'], ['Kobold'], ['Dirty Ape']],
  retreat: { map: 'world_gs1', x: 34, y: 61, dir: DIR.RIGHT },
  build(M) {
    M.setObj(95, 27, 'sg_door'); M.walkable(95, 27); M.exit(95, 27, 1, 1, 'gateway_cave', 9, 14, DIR.UP, { door: true });   // Gateway Cave, the cove under the gate
    if (G.flag('prologue_jenna')) { M.trigger(104, 28, 1, 4, T3.ruffian, { once: 'prologue_ruffian_1', data: 1 }); M.trigger(99, 28, 1, 4, T3.ruffian, { once: 'prologue_ruffian_2', data: 1 }); M.trigger(94, 28, 3, 1, T3.ruffian, { once: 'prologue_ruffian_3', data: 3 }); }
    M.paint(0, 0, SG_ROWS, SG_LEGEND, { cliff: '#', set: 'brownrock', faces: 2 });
    if (G.flag('gate_opened')) for (let x = 2; x <= 9; x++) M.setObj(x, 14, x === 5 || x === 6 ? 'palisade_gate' : 'palisade_face');
    M.exit(3, 34, 9, 1, 'world_gs1', 63, 104, DIR.LEFT);   /* the west door: out onto the world west of the Gate's marker (the desert's south mouth lies that way) */ M.exit(109, 29, 1, 1, 'world_gs1', 34, 61, DIR.RIGHT);
    M.setObj(8, 8, 'sg_door'); M.walkable(8, 8); M.exit(8, 8, 1, 1, 'suhalla_gate_hut', 6, 10, DIR.DOWN, { door: true });
    M.setObj(77, 18, 'sg_door'); M.walkable(77, 18); M.exit(77, 18, 1, 1, 'suhalla_gate_cave', 5, 7, DIR.DOWN, { door: true });
    M.chest(23, 18, 'Mint', 1);
    M.djinni('Dew', 55, 16, { fight: true });
    M.npc('gate_guard1', 5, 16, { type: 'guard', name: 'Gate Guard', dir: DIR.DOWN, text: () => G.flag('babi_permission') ? "Lord Babi's seal! You may pass to Lalivero." : "Halt! None may pass Suhalla Gate without Lord Babi's permission!", script: STORY.suhallaGate });
    M.npc('gate_guard2', 7, 16, { type: 'guard', name: 'Gate Guard', dir: DIR.DOWN, text: "Beyond this gate lies Lalivero and the Venus Lighthouse. Lord Babi's tower rises beside it." });
    M.sign(3, 17, "Suhalla Gate. Lalivero lies beyond the pass. No passage without Lord Babi's leave.");
  }
});
Kit.interior('suhalla_gate_hut', { name: 'Suhalla Gate', w: 12, h: 12, floor: 'floor_wood', wall: 'wall_in', back: { map: 'suhalla_gate', x: 8, y: 9 },
  furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bed', 3, 2], ['bed_foot', 3, 3], ['table', 7, 4], ['chair', 6, 4], ['barrel', 9, 2], ['barrel', 10, 2], ['crate', 10, 3]],
  npcs: [{ id: 'sg_hut_guard', x: 7, y: 6, type: 'guard', name: 'Guard', text: "Off duty. The desert wind gets into everything - the bread, the beds, the boots." }] });
// the cave under the pass: a purple hollow with a Psynergy Stone
const SGC_ROWS = [
  '###########',
  '##.......##',
  '#....P....#',
  '#.........#',
  '#.o.....o.#',
  '#.........#',
  '##.......##',
  '#####.#####',
  '#####.#####',
];
defineMap('suhalla_gate_cave', {
  name: 'Suhalla Gate', w: 11, h: 9, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 5, y: 7 }, enc: [],
  build(M) {
    M.paint(0, 0, SGC_ROWS, { '.': 'cave_sand', 'P': { ground: 'cave_sand', obj: 'psystone' }, 'o': { ground: 'cave_sand', obj: 'crystal_rock' } }, { cliff: '#', set: 'crystal', faces: 2 });
    M.exit(5, 8, 1, 1, 'suhalla_gate', 77, 19, DIR.DOWN);
  }
});
