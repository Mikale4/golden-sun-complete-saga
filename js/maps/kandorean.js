// Kandorean Temple, from its rip (map references/golden-sun-the-lost-age-kandorean-temple-gba-map.webp) by
// tools/caves/kandorean_build.py: the purple temple in the forest - forecourt, great hall (Master Poi, the hole to the
// caves), middle and top rooms drawn from the rip's pictures - and the mossy caves under and behind it classified from
// the rip and joined as its arrows show: the middle cave the party drops into (the Chestbeater, the rope Lash ties,
// Fog), the pillar cave, the vertical cave up to the top room, the waterfall cave, the wide eastern cave and its side
// room, and the cave under the temple's front that opens on the forecourt at both ends.
'use strict';
const KAN_ENC = [['Punch Ant', 'Punch Ant'], ['Giant Bat'], ['Wild Wolf']];
const KAN_CAVE_ENC = [['Giant Bat'], ['Amaze II', 'Amaze II'], ['Skeleton II'], ['Punch Ant', 'Giant Bat']];
const KAN_RETREAT = { map: 'world_tla', x: 66, y: 63, dir: DIR.DOWN };
const KAN_EXT_ROWS = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTT...KKKKKKKKKKKKKKKKKKKKK...TT',
  'TT....KKKKKKKKKKKKKKKKKKKKK....T',
  'TT....KKKKKKKKKKKKKKKKKKKKK....T',
  'TT.....KKKKKKKKKKKKKKKKKKK.....T',
  'TT.....KKKKKKKKKKKKKKKKKKK.....T',
  'TT.....KKKKKKKKKKKKKKKKKKK.....T',
  'TT...KKKKKKKKKKKKKKKKKKKKKKKK..T',
  'TT...KKKKKKKKKKKKKKKKKKKKKKKK..T',
  'TT...KKKKKKKKKKKKKKKKKKKKKKKK..T',
  'TT...KKKKKKKKKKKKKKKKKKKKKKKK..T',
  'TT...KKKKKKKKKKKKKKKKKKKKKKKK..T',
  'TTT.................ppp........T',
  'TTT...T..........pppppppp..r...T',
  'TT.......TT......ppppppp.......T',
  'TT..r..........pppppppp....T...T',
  'TT.............ppppppp.........T',
  'TT..T..........ppppp......T....T',
  'TTT.....T......ppppp...........T',
  'TT.......T.....ppppp...........T',
  'TT.............ppppp....T....TTT',
  'TTT..T.........ppppp.........TTT',
  'TTTT...........ppppp.....T..TTTT',
  'TTTTT..........ppppp.......TTTTT',
  'TTTTTT.........ppppp......TTTTTT',
  'TTTTTTT.....T..ppppp....TTTTTTTT',
  'TTTTTTTT.......ppppp...TTTTTTTTT',
  'TTTTTTTTT......ppppp..TTTTTTTTTT',
  'TTTTTTTTTT.....ppppp.TTTTTTTTTTT',
  'TTTTTTTTTTT....ppppp.TTTTTTTTTTT',
  'TTTTTTTTTTTTTT.ppppp.TTTTTTTTTTT',
];
defineMap('kandorean', {
  name: 'Kandorean Temple', w: 32, h: 32, base: 'grass', music: 'vale', bg: 'temple', entry: { x: 17, y: 30 }, enc: KAN_ENC, retreat: KAN_RETREAT,
  build(M) {
    M.paint(0, 0, KAN_EXT_ROWS, { '.': 'grass', 'p': 'cobble', 'K': { ground: 'cobble', obj: 'wall_kandor' }, 'r': { ground: 'grass', obj: 'rock_grass' } }, { cliff: 'T', set: 'canopy', faces: 1 });
    for (let x = 6; x <= 26; x++) if (M.getObj(x, 2) && M.getObj(x, 2).name === 'wall_kandor') M.setObj(x, 2, 'kandor_top');
    for (const [x0, x1, y] of [[7, 25, 5], [5, 28, 8]]) for (let x = x0; x <= x1; x++) if (M.getObj(x, y) && M.getObj(x, y).name === 'wall_kandor') M.setObj(x, y, 'kandor_top');
    for (const [x, y] of [[9, 10], [12, 10], [20, 10], [23, 10], [8, 6], [24, 6]]) M.setObj(x, y, 'window_kandor');
    M.setObj(15, 12, 'door_kandor'); M.setObj(16, 12, 'door_kandor'); M.walkable(15, 12, 2, 1); M.exit(15, 12, 2, 1, 'kandorean_inner', 12, 23, DIR.UP, { door: true });
    M.setObj(6, 12, 'door_kandor'); M.walkable(6, 12); M.exit(6, 12, 1, 1, 'kandorean_f', 6, 3, DIR.DOWN, { door: true });
    M.setObj(25, 12, 'door_kandor'); M.walkable(25, 12); M.exit(25, 12, 1, 1, 'kandorean_f', 25, 11, DIR.DOWN, { door: true });
    M.exit(15, 31, 5, 1, 'world_tla', 66, 63, DIR.DOWN);
    M.setObj(26, 15, 'well');
    M.npc('kt_monk_gate', 13, 14, { type: 'monk', name: 'Monk', dir: DIR.RIGHT, text: "Kandorean Temple. Master Poi tests all who would learn from him. Not with words - with the caves." });
    M.npc('kt_monk_yard', 23, 19, { type: 'monk', name: 'Monk', move: 'wander', text: "The side doors lead under the temple front. Novices sweep the cave there. Sweep, and sweep, and sweep." });
    M.sign(18, 14, "Kandorean Temple. 'Discipline is the door; the caves are the key.'");
  }
});
const KAN_HALL_ROWS = [
  '########################',
  '########################',
  '##....................##',
  '##.k..........k.......##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....~~~~~~~~~~~~....##',
  '##....~~~~~~~~~~~~....##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##..H.................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '###########DD###########',
];
const KAN_ROOM_LEGEND = { '.': 'floor_kandor', 'D': 'floor_kandor', 'H': 'floor_kandor', '~': 'water', 'k': { ground: 'floor_kandor', obj: 'lh_column' } };
function ktRoom(M, rows) { M.paint(0, 0, rows, KAN_ROOM_LEGEND, { cliff: '#', set: 'kandorrock', top: 'kandor_top', face: 'wall_kandor', mid: 'kandor_top' }); }
defineMap('kandorean_inner', {
  name: 'Kandorean Temple - Hall', w: 24, h: 26, base: 'void', music: 'lighthouse', bg: 'temple', indoor: true, entry: { x: 12, y: 23 }, enc: [['Giant Bat', 'Giant Bat'], ['Punch Ant'], ['Amaze II']], retreat: { map: 'kandorean', x: 15, y: 13, dir: DIR.DOWN },
  build(M) {
    ktRoom(M, KAN_HALL_ROWS);
    M.setObj(11, 25, 'door_kandor'); M.setObj(12, 25, 'door_kandor'); M.walkable(11, 25, 2, 1); M.exit(11, 25, 2, 1, 'kandorean', 15, 13, DIR.DOWN, { door: true });
    // the pool across the hall: the rope the monks left hangs over it, Lash ties it fast
    for (let x = 6; x <= 17; x++) { M.set(x, 12, 'water'); M.set(x, 13, 'water'); } M.set(11, 12, 'bridge_v'); M.set(11, 13, 'bridge_v'); M.set(12, 12, 'bridge_v'); M.set(12, 13, 'bridge_v');
    // the hole in the floor drops into the cave below
    M.set(4, 20, 'hole'); M.def.fall = { map: 'kandorean_cave', x: 21, y: 30 };
    M.setObj(4, 2, 'door_kandor'); M.walkable(4, 2); M.exit(4, 2, 1, 1, 'kandorean_mid', 6, 7, DIR.UP, { door: true });
    M.npc('KandoreanMaster', 12, 5, { type: 'monk', name: 'Master Poi', script: T3.kandoreanMaster });
    M.npc('kt_monk_1', 8, 6, { type: 'monk', name: 'Monk', dir: DIR.RIGHT, text: "Master Poi has not moved from that spot in three days. He says the floor is thinking." });
    M.npc('kt_monk_2', 16, 6, { type: 'monk', name: 'Monk', dir: DIR.LEFT, text: "The hole by the west wall? That is the way to the caves. Novices go down; masters come up." });
    M.sign(6, 20, 'A hole in the floor leads to the cave below.');
  }
});
const KAN_MID_ROWS = [
  '#############',
  '######D######',
  '##.........##',
  '##.k.....k.##',
  '##.........##',
  '##.........##',
  '##.k.....k.##',
  '##.........##',
  '######D######',
];
defineMap('kandorean_mid', {
  name: 'Kandorean Temple', w: 13, h: 9, base: 'void', music: 'lighthouse', bg: 'temple', indoor: true, entry: { x: 6, y: 7 }, enc: [], retreat: KAN_RETREAT,
  build(M) {
    ktRoom(M, KAN_MID_ROWS);
    M.setObj(6, 8, 'door_kandor'); M.walkable(6, 8); M.exit(6, 8, 1, 1, 'kandorean_inner', 4, 3, DIR.DOWN, { door: true });
    M.setObj(6, 1, 'door_kandor'); M.walkable(6, 1); M.exit(6, 1, 1, 1, 'kandorean_top', 4, 19, DIR.UP, { door: true });
    M.npc('kt_monk_3', 3, 4, { type: 'monk', name: 'Monk', text: "Up the stair is the Master's cell. He is rarely in it. He prefers the hall, where the drafts are." });
  }
});
const KAN_TOP_ROWS = [
  '#########',
  '####D####',
  '##.....##',
  '##.....##',
  '##.....##',
  '##.....##',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '###...###',
  '##.....##',
  '##.....##',
  '##.....##',
  '##.....##',
  '####D####',
  '#########',
];
defineMap('kandorean_top', {
  name: 'Kandorean Temple', w: 9, h: 22, base: 'void', music: 'lighthouse', bg: 'temple', indoor: true, entry: { x: 4, y: 19 }, enc: [], retreat: KAN_RETREAT,
  build(M) {
    ktRoom(M, KAN_TOP_ROWS);
    M.setObj(4, 20, 'door_kandor'); M.walkable(4, 20); M.exit(4, 20, 1, 1, 'kandorean_mid', 6, 2, DIR.DOWN, { door: true });
    M.setObj(4, 1, 'stairs_down'); M.walkable(4, 1); M.exit(4, 1, 1, 1, 'kandorean_c', 10, 5, DIR.DOWN, { stairs: true });
    M.sign(2, 3, "'The stair goes down into the mountain. The caves go on for ever, as the discipline does.'");
  }
});
// ---- the caves ----
const KAN_CAVE_LEGEND = { '.': 'cave_moss', 'w': 'water', 'L': 'post_water', 'o': { ground: 'cave_moss', obj: 'grey_rock' }, 'X': 'cave_moss', 'D': 'cave_moss', 'K': 'cave_moss', 'P': 'cave_moss', 'S': 'stairs' };
function ktCave(id, rows, exits, build, entry) {
  defineMap(id, { name: 'Kandorean Temple - Cave', w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, enc: KAN_CAVE_ENC, retreat: KAN_RETREAT, entry,
    build(M) {
      M.paint(0, 0, rows, KAN_CAVE_LEGEND, { cliff: '#', set: 'mossrock', faces: 2 });
      for (const [x, y, to, tx, ty, dir] of exits) { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir); }
      if (build) build(M);
    } });
}
const KANDOREAN_CAVE_ROWS = [
  '        #########                         ',
  '       ###############                    ',
  '       ################                   ',
  '       ##P..o.#########      ############ ',
  '        #...o.........####################',
  '         #....##    #.####################',
  '         #.#      ###..###################',
  '    ######.##    ####...........#     #..#',
  '   #######.##    ####..#          ######.#',
  '   #######.##    ####..#         ######..#',
  '   ###.....#      ##..######     ###.....#',
  '    #..#            #..##  #  #  ##..# #  ',
  '  ###..#            #...###########.#     ',
  ' #####.#####         #....########..#     ',
  ' ####..########        #..#........#      ',
  ' ##....#########       #.K...#            ',
  '##..# ##########        #...#             ',
  '##..#############                         ',
  '   .                                      ',
  '##X.###.....##### ######                  ',
  ' #D.##..#  .###### #..###                 ',
  '  #....# ##.######  #.###                 ',
  '        ###.####### #..## # ###           ',
  '        ###.####.#####..# ######          ',
  '        ###..##..#####X.########          ',
  '         #......#####.D.########          ',
  '            #............######           ',
  '             #....# #.o.......            ',
  '                   ##..#     .            ',
  '                   ##.D#     .            ',
  '                   ##DX#     .......K     ',
  '                    #.#                   ',
  '                    #.#                   ',
];
ktCave('kandorean_cave', KANDOREAN_CAVE_ROWS, [[2, 19, 'kandorean_b', 22, 22], [22, 24, 'kandorean_c', 15, 40], [22, 30, 'kandorean_inner', 4, 21, DIR.UP]], (M) => {
    M.trigger(20, 29, 3, 3, T3.chestbeater, { once: 'chestbeater_done' }); M.boss('Chestbeater', 23, 30, { done: 'chestbeater_done' });
    // the shaft up to Fog's ledge: a rope hangs down it, and only Lash makes it climbable
    M.object('rope', 10, 9, { id: 'kan_rope', len: 4 });
    if (!G.flag('obj:kandorean_cave:rope:kan_rope')) for (const y of [6, 7, 8]) { M.setObj(10, y, 'cavewall'); M.block(10, y); }
    M.djinni('Fog', 9, 3, { fight: true });
}, { x: 2, y: 20 });
const KANDOREAN_B_ROWS = [
  '      ########                        ',
  '   ########### ###                    ',
  '  ##########.######                   ',
  ' #####..###...######                  ',
  '###....####....#####                  ',
  '##..########.......#                  ',
  '#..#####..######.#.#    ### ###       ',
  '#...##.....####..#.#############   #  ',
  ' ##.#.K....####.##.######## ######### ',
  ' #.....##...###.#..###################',
  ' #.......##.###.##......###.#######.##',
  ' #....#..###########..#####.#.####...#',
  '  #....#############.####.#...#####..#',
  '   #...#############.##....##.######.#',
  '   #.#.###..####...........#....#.##.#',
  '   ###.###..#.##.###.##.#.#..o.....#.#',
  '   ###.####.#..#..###  #...#...o.....#',
  '   #....###.##..#...#  #....##...#### ',
  '   #......#........##  #..##....#     ',
  '    ####......##### ####......##      ',
  '        ######      ####..#..#        ',
  '                  #####...##.#        ',
  '                  ###XD.###..#        ',
  '                  ########...#        ',
  '                  #######..D#         ',
  '                  ####.....X#         ',
  '                  ##.....###          ',
  '                   ######             ',
];
ktCave('kandorean_b', KANDOREAN_B_ROWS, [[21, 22, 'kandorean_cave', 2, 20], [27, 25, 'kandorean_d', 4, 6]], (M) => {
    M.chest(6, 8, 'Mysterious Card', 1);   // the guide's one chest: the Pierrot's card, on the ledge the platforms reach
}, { x: 22, y: 22 });
const KANDOREAN_C_ROWS = [
  '       ###           ',
  '      #####          ',
  '     #######         ',
  '    ###..####        ',
  '    ###...X##        ',
  '    #.....D.#        ',
  '    #.......#        ',
  '     #.#.#.#         ',
  '      ##.##          ',
  '       #.#           ',
  '       #.#           ',
  '       #.#           ',
  '      ##.##          ',
  '      ##.##          ',
  '      #...#          ',
  '      #..##          ',
  '      #...#          ',
  '      #..##          ',
  '      ##..#          ',
  '      ##..#          ',
  '      #...#          ',
  '      #...#          ',
  '       #.#           ',
  '       #.#           ',
  '      ##.##          ',
  '  ######.###         ',
  ' #######.#######     ',
  '######.....######    ',
  '######.....#######   ',
  '#######....########  ',
  '###.###.############ ',
  '#.....#.#####.###### ',
  '#........###...###.##',
  ' #####.....#.....#.##',
  '      ###...K.##...##',
  '         #..##  #..# ',
  '         #.######.## ',
  '         #.######.## ',
  '         #.## ###.## ',
  '         #... #X..## ',
  '         #.....D###  ',
  '          ### ##     ',
];
ktCave('kandorean_c', KANDOREAN_C_ROWS, [[15, 39, 'kandorean_cave', 22, 25], [10, 4, 'kandorean_top', 4, 19, DIR.DOWN]], (M) => {
}, { x: 10, y: 5 });
const KANDOREAN_D_ROWS = [
  '                               #                  ',
  '                  ######## ##### ##     #         ',
  '  #              ########o #########   ###        ',
  ' ## ####        #########o #####.#### ######      ',
  '#############   ###.###  o #####..###########     ',
  '###.X##############.  #    ###.....#####.######   ',
  '#...D.###########...       ###.###.........#####  ',
  '#.###........####...        #XD################## ',
  '#.##########.......#         ...##### #######..## ',
  '#.##.###############         #... # #  ##   ....##',
  '#.........###########        ..## #     #   #.#.##',
  '#..................#.....   ..###            ##..#',
  ' ########..........#.o.#......###      ##    ###.#',
  '        #..#####....#...........#..   ####   ..#.#',
  '        ####    #.......######...#...DX###  #....#',
  '                #..#...#      #...............o..#',
  '                ##....###     ##......##.........#',
  '               ####....##      #####.##......#...#',
  '               ###.....##           ##....#......#',
  '               #...#####            #....###.#.## ',
  '               #..##                #..##   ####  ',
  '              ##.#             ######...#         ',
  '              ##.##           ########..##        ',
  '              #..##          #########..##        ',
  '              #...#         #######....###        ',
  '              #.###         ##...#####.###        ',
  '               ###          #..#######.###        ',
  '               ###          #.####.###.###        ',
  '                             ...........##        ',
  '                             ##...##.....         ',
  '                             #...#  ### ......K   ',
  '                             #...#                ',
  '                              ###                 ',
  '                              ###                 ',
];
ktCave('kandorean_d', KANDOREAN_D_ROWS, [[4, 5, 'kandorean_b', 27, 24], [29, 7, 'kandorean_w', 18, 45], [38, 14, 'kandorean_r', 16, 11]], (M) => {
}, { x: 4, y: 6 });
const KANDOREAN_W_ROWS = [
  '           ##   .#             ',
  '           ##  o.#             ',
  '       #   ## o .#             ',
  '      #######   .#             ',
  '  ###########   .##            ',
  ' ######.####.   .###           ',
  '######....#..   .####          ',
  '##.....#.....   ...##          ',
  '##....# ##.##   ##.##          ',
  ' #####  ##.##   ##.##          ',
  '        ##..     #.##          ',
  '        #..      #.##          ',
  '        ##.      ..##          ',
  '       ##.. oo    .#           ',
  '      ###..o   o# .#           ',
  '     ####...o   o .#           ',
  '     #####.o     o.##          ',
  '     #####.o    o..###         ',
  '     #####.o#  o ..####        ',
  '     ###....oo  o...###        ',
  '     ##...##   o .###.#        ',
  '     #....#.  #  .###.##       ',
  '     #.###..........#.#### ##  ',
  '     #.....o     #....######## ',
  '     ##.##.. o  ##.....### ####',
  '     ##...##   o ..#.#..## ####',
  '      ###..##    ..#.##########',
  '         #..##  o.#..####DX####',
  '        ##..  o  .##.##...#####',
  '        ##..   o .#.##..##...##',
  '        ###.o o  ....#.#.#...# ',
  '        #.#.     ..#........#  ',
  '       ##.#.    o.# ########   ',
  '       ##...     .#            ',
  '       ##..o     .#            ',
  '        ##..     .##           ',
  '         #..  # #.###          ',
  '        ##..  ## .###          ',
  '        ###. #   .###          ',
  '        ###.#    .###          ',
  '        ###.     .........K    ',
  '        ##..     ..##          ',
  '        #...     ...#          ',
  '        #...     ...#          ',
  '        #...     ...#          ',
  '        #...     XD.#          ',
  '        #...     ...#          ',
];
ktCave('kandorean_w', KANDOREAN_W_ROWS, [[17, 45, 'kandorean_d', 30, 7], [26, 27, 'kandorean_r', 4, 11]], (M) => {
}, { x: 25, y: 27 });
const KANDOREAN_R_ROWS = [
  '          # #     ###     ',
  '         ## ##########    ',
  '   ####################   ',
  '  ########...#####...##   ',
  ' ########......##..#.###  ',
  ' ########.####....# ..### ',
  ' ########.######### #.####',
  ' #####..#.##..#######...##',
  '####...........######....#',
  '####..............######.#',
  ' # #X#....#...o...########',
  ' ###D....###....D.###..###',
  ' ##....o..#....#X###..o.##',
  ' #............. ........##',
  ' #...#............##..K.# ',
  '  #.....###.... ##  ####  ',
  '  #....#   ####           ',
  '   #.###                  ',
  '    ###                   ',
  '    ###                   ',
];
ktCave('kandorean_r', KANDOREAN_R_ROWS, [[16, 12, 'kandorean_d', 37, 14], [4, 10, 'kandorean_w', 25, 27]], (M) => {
}, { x: 4, y: 11 });
const KANDOREAN_F_ROWS = [
  '###########################',
  '###########################',
  '#####.X....################',
  '####..D.....###############',
  '###.K........##############',
  '###...wwww....#############',
  '####..wwwww....############',
  '#####..wwwww....###########',
  '######..wwwww....######....',
  '#######..wwwwww...........#',
  '########..wwwwww..........#',
  '#########..wwwww.........D.',
  '##########.........#####.X.',
  '###########.......#########',
  '############.....######### ',
  '#############...########## ',
  '##############.########### ',
  '###########################',
  '###########################',
];
ktCave('kandorean_f', KANDOREAN_F_ROWS, [[6, 2, 'kandorean', 6, 13, DIR.DOWN], [25, 12, 'kandorean', 25, 13, DIR.DOWN]], (M) => {
}, { x: 6, y: 3 });
