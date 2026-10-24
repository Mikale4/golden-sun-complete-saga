// Gondowan Passage, traced from its rip (map references/golden-sun-gondowan-passage-gba-map.webp): Tolbi's gate-house
// of pink stone across the road at the north end, its guards turning back anyone without Lord Babi's leave, the
// drawbridge between its two stone posts, and the long pink bridge over the river south into Gondowan.
'use strict';
const GP_ROWS = [
  '.T..WWcccWWWWW.',   // 0   the gate wall, the tower on the right, the road north through the arch
  '.T..WWcccWWdWW.',   // 1
  '....WWcccW.....',   // 2   the arch's foot
  '.T.r..ccc..r..T',   // 3
  '.T#...ccc.G...T',   // 4   the guards
  '..#G.Gccc.....T',   // 5
  '.##...ccc.....r',   // 6
  '.##...ccc..T.##',   // 7
  '##...PcccP..###',   // 8   the drawbridge's posts
  '#....PcccPw..##',   // 9   the winch
  '#....PcccP....#',   // 10
  '~~~..~bbb~..~~~',   // 11  the lowered drawbridge over the river
  '~~~~~~bbb~~~~~~',   // 12
  '~~~~~~bbb~~~~~~',   // 13
  '~~~~~~bbb~~~~~~',   // 14
  '~~~~~pBBBp~~~~~',   // 15  the stone bridge
  '~~~~~pBBBp~~~~~',   // 16
  '~~~~~pBBBp~~~~~',   // 17
  '~~~~~pBBBp~~~~~',   // 18
  '~~~~~pBBBp~~~~~',   // 19
  '~~~~~pBBBp~~~~~',   // 20
  '~~~~~pBBBp~~~~~',   // 21
  '~~~~~pBBBp~~~~~',   // 22
  '~~~~~pBBBp~~~~~',   // 23
  '~~~~~pBBBp~~~~~',   // 24
  '~~~~.pBBBp.~~~~',   // 25  the south bank
  '.r...pBBBp.....',   // 26
  '.....BBBBB..r..',   // 27
];
const GP_LEGEND = {
  '.': 'grass', 'c': 'cobble', '~': 'water', 'B': 'stonefloor', 'b': 'bridge_v',
  'W': { ground: 'grass', obj: 'wall_kalay' }, 'd': { ground: 'grass', obj: 'door_kalay' }, 'p': { ground: 'water', obj: 'wall_kalay' },
  'P': { ground: 'grass', obj: 'drawgate_post' }, 'w': { ground: 'grass', obj: 'winch' }, 'T': { ground: 'grass', obj: 'tree' }, 'r': { ground: 'grass', obj: 'rock_grass' }, 'G': 'grass',
};
STORY.gondowanGate = function* (E) {
  yield E.say("Halt! Not a step further. No one crosses into Gondowan without Lord Babi's leave!", 'Captain');
  yield E.move('player', DIR.UP, 2);
  yield E.say("(The party is turned back to the gate.)");
};
defineMap('gondowan_passage', {
  name: 'Gondowan Passage', w: 15, h: 28, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 7, y: 2 },
  build(M) {
    M.paint(0, 0, GP_ROWS, GP_LEGEND, { set: 'cliff', faces: 2 });
    // the deck of logs over the river, and its bridge-ends
    for (const y of [11, 12, 13, 14]) for (const x of [6, 7, 8]) M.set(x, y, 'plank_v_' + (x === 6 ? 'w' : x === 8 ? 'e' : '') + '_' + (y === 11 ? 't' : y === 14 ? 'b' : ''));
    M.exit(6, 0, 3, 1, 'world_gs1', 20, 47, DIR.UP); M.exit(5, 27, 5, 1, 'world_gs1', 20, 49, DIR.DOWN);
    // Babi's guards: the captain stands in the road until the party carries Babi's leave to cross
    const leave = G.flag('babi_permission');
    M.npc('gp_captain', 7, 5, { type: 'guard', name: 'Captain', dir: DIR.DOWN, hideIf: 'babi_permission', text: "Halt! No one crosses into Gondowan without Lord Babi's leave. Turn back." });
    M.npc('gp_guard1', leave ? 3 : 6, 5, { type: 'guard', name: 'Guard', dir: leave ? DIR.RIGHT : DIR.DOWN, text: leave ? "Lord Babi's own word? Then the bridge is yours. Mind the Suhalla winds." : "Gondowan lies beyond the river. Bandits, sandstorms... Lord Babi lets no one through without cause." });
    M.npc('gp_guard2', 10, 4, { type: 'guard', name: 'Guard', dir: DIR.LEFT, text: "This gate-house has stood since Lord Babi first took Tolbi's throne. The bridge is older still." });
    M.npc('gp_guard3', leave ? 5 : 8, 5, { type: 'guard', name: 'Guard', dir: leave ? DIR.RIGHT : DIR.DOWN, text: "The drawbridge stays down these days. Nothing worth raising it for comes up from Gondowan." });
    M.sign(4, 3, "Gondowan Passage. South: Suhalla, the desert, Lalivero. Show Lord Babi's leave at the gate.");
    // no slipping past along the grass: the captain calls the party back to the gate until Babi's leave is given
    M.trigger(1, 7, 13, 1, STORY.gondowanGate, { cond: () => !G.flag('babi_permission') });
  }
});

// Gondowan Cave, traced from its rip (map references/golden-sun-gondowan-cave-gba-map.webp): grey rock over mossy floors
// with a channel of water winding through, four halls joined by dark doorways - the way through the mountains from the
// coast south of Kalay Docks to Suhalla on foot. Lift clears the boulders, the lily pads cross the channel to the Lucky Medal.
'use strict';
const GC_ENC = [['Dread Hound'], ['Worm', 'Worm'], ['Clay Gargoyle'], ['Kobold', 'Kobold']];
const GC_LEGEND = {
  '.': 'cave_moss', 'w': 'water', 'S': 'stairs', 'L': 'post_water', 'o': { ground: 'cave_moss', obj: 'grey_rock' },
  'K': 'cave_moss', 'b': 'cave_moss', 'X': 'cave_moss', 'Y': 'cave_moss',
};
function gcMap(id, name, rows, build, def) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, enc: GC_ENC,
    build(M) {
      M.paint(0, 0, rows.map(r => r.replace(/[DET]/g, '#')), GC_LEGEND, { cliff: '#', set: 'greyrock', faces: 2 });
      rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { if (r[x] === 'T') { M.setObj(x, y, 'gc_torch'); M.light(x, y, 4); } if (r[x] === 'b') M.object('boulder', x, y, {}); } });
      build(M);
    } }, def || {}));
}
function gcDoor(M, x, y, to, tx, ty) { M.setObj(x, y, 'gc_door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.DOWN, { door: true }); }
const GONDOWAN_CAVE_ROWS = [
  '                    #                    ',
  '                ###########   #####      ',
  '            ######T##T##T###########T    ',
  '         ##########.K.###############    ',
  '        ###T#####.#....###..#.#.#.###    ',
  '       ####.##....................####   ',
  '    ####.##.....##############.#.....##  ',
  '   ###T#....##.wwwwwwwwwwwwwwwwww#....#  ',
  '  #####...#www.owwwwwwwwwwwwww####w...#  ',
  '  #.....Lw#w#wLwL#LwL.L.L.Lwwww# #ww.##  ',
  ' ##..#...wwwww..K....wwwww.....# ##w..#  ',
  ' #...###www####....####ww#w..#.#  #ww.## ',
  ' ##.wwww####   ####   #########   #ww..##',
  ' #..#####                         #ww...#',
  ' #.w#                            ##w#...#',
  ' #.w##                          ###w#..# ',
  '##.w##                          #####..# ',
  '#...w#                          #ww# #D# ',
  '##.#.#                                   ',
  '#....#                                   ',
  ' #...#                                   ',
  '  ...                                    ',
  '  #.#                                    ',
  '  #X#                                    ',
];
gcMap('gondowan_cave', 'Gondowan Cave', GONDOWAN_CAVE_ROWS, (M) => {
  M.exit(3, 23, 1, 1, 'world_gs1', 56, 74, DIR.UP);
  gcDoor(M, 38, 17, 'gondowan_cave_2', 6, 4);
  M.chest(20, 3, 'Apple', 1); M.chest(16, 10, 'Lucky Medal', 1);
}, { entry: { x: 3, y: 22 } });
const GONDOWAN_CAVE_2_ROWS = [
  '#ww#  #                              ',
  '#ww#####                             ',
  '#ww######                            ',
  '#ww###D##    ##                      ',
  '#ww###.######T##                     ',
  '#ww##...#########                    ',
  '#ww##..#####..#.#                    ',
  '#www#..##T##....#    ###             ',
  '##wwww...####..#    ##T##            ',
  ' ##www#...####.#   ############      ',
  '  #www.........##  #..######T###     ',
  '  #wwww.######..# ##.#..#.#######    ',
  '  ##w##.wwwww..####...........#.##   ',
  '   ### .wwwww.#..#T.......###...###  ',
  '      #.wwwww.#....#......##.....### ',
  '     ##.#.www.#.......#..#####.....# ',
  '    ###...www...SS.....#..####.##..# ',
  '   ####...www.####..#..###ww#.S##### ',
  '   ###T#.www...####...####www..##### ',
  '   ###...www..#.#########wwwww...####',
  '   #.#...www.....#####wwwwwwwww....##',
  '   #....#wwww#########wwwwwwwww#...##',
  '   #...#####wwwwwwwwwwwwwwwww##.....#',
  '    ...    #############wwww#...#...#',
  '    #.#                ###### .#...# ',
  '    #X#                       Y ###  ',
];
gcMap('gondowan_cave_2', 'Gondowan Cave', GONDOWAN_CAVE_2_ROWS, (M) => {
  gcDoor(M, 6, 3, 'gondowan_cave', 38, 16);
  M.exit(5, 25, 1, 1, 'gondowan_cave_3', 2, 2, DIR.DOWN); M.exit(30, 25, 1, 1, 'gondowan_cave_4', 18, 8, DIR.DOWN);
  M.npc('gc_hermit', 25, 11, { type: 'elder_m', name: 'Hermit', text: "Lost? Everyone who comes through here is. The channel runs south to the sea, if you can follow it. I stopped trying years ago." });
}, { entry: { x: 6, y: 4 } });
const GONDOWAN_CAVE_3_ROWS = [
  '  #                        ',
  ' #D#                       ',
  '##.#####          ####     ',
  '#...##T##      #####T####  ',
  '#....###################T# ',
  '##...#.#.###T####.##.#.####',
  '#.........####.#.......####',
  ' #....#..................##',
  '  #### ##############..#..#',
  '                     ###.# ',
  '                     ###b# ',
  '                     #...# ',
  '                      ##.  ',
  '                      #..  ',
  '                      ##Y  ',
];
gcMap('gondowan_cave_3', 'Gondowan Cave', GONDOWAN_CAVE_3_ROWS, (M) => {
  gcDoor(M, 2, 1, 'gondowan_cave_2', 5, 24);
  M.exit(24, 14, 1, 1, 'gondowan_cave_4', 5, 2, DIR.DOWN);
}, { entry: { x: 2, y: 2 } });
const GONDOWAN_CAVE_4_ROWS = [
  '     #                ',
  '    #D#               ',
  '   ##.##              ',
  '  ##...#              ',
  '  #....#              ',
  '  ##...#              ',
  '  #...#           #   ',
  '  #..#           #E#  ',
  '  #.##          ##.## ',
  ' ##..#          #...##',
  ' #...##         #....#',
  ' ##.#####   #####TK.##',
  '###.w########T####b###',
  '#....w##########...###',
  '#....w#####.##......# ',
  ' ##...www##......#.#  ',
  '   ##.www.....#####   ',
  '   #...w....##        ',
  '    #.....##          ',
  '     ###...#          ',
  '        #..##         ',
  '        #...##        ',
  '        ##...#        ',
  '        ##...#        ',
  '        ##...#        ',
  '        #...#         ',
  '        #...#         ',
  '        #....         ',
  '         ##X          ',
];
gcMap('gondowan_cave_4', 'Gondowan Cave', GONDOWAN_CAVE_4_ROWS, (M) => {
  gcDoor(M, 5, 1, 'gondowan_cave_3', 24, 13); gcDoor(M, 18, 7, 'gondowan_cave_2', 30, 24);
  M.exit(11, 28, 1, 1, 'world_gs1', 52, 82, DIR.DOWN);
  M.chest(19, 11, 'Elixir', 1);   // in the nook beside the corridor (the corridor itself is the only way between the two mouths of the cave)
}, { entry: { x: 11, y: 27 } });
