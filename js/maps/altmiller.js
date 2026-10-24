// Altmiller Cave, traced from its rip (map references/golden-sun-altmiller-cave-gba-map.webp): eight sections of blue crystal
// rock over sand, joined by the lettered doors of the rip - the entrance loop (A) - the winding passage (B) - the Vial
// galleries (C) - Babi's hall (D) - the Cookie galleries (E) - the pillar hall - the crystal room - the draught's chamber.
// Lord Babi lies collapsed before door D; the party carries him back to Tolbi (STORY.findBabi). Deeper, the five crystals
// must be touched in the order the flames name to open the way to the Mystic Draught.
'use strict';
const ALT_ENC = [['Gargoyle'], ['Ghost Mage'], ['Cave Troll'], ['Ravager', 'Ravager'], ['Death Cap']];
const ALT_RETREAT = { map: 'world_gs1', x: 14, y: 31, dir: DIR.DOWN };
const ALT_LEGEND = {
  '.': 'cave_sand', 'p': 'stonefloor', 'S': 'stairs', 'w': 'cave_sand', 'o': { ground: 'cave_sand', obj: 'crystal_rock' }, 'k': { ground: 'cave_sand', obj: 'pillar' },
  'M': 'cave_sand', 'V': 'cave_sand', 'L': 'cave_sand', 'K': 'cave_sand', 'Q': 'cave_sand', 'b': 'cave_sand', 'c': 'cave_sand', 's': 'cave_sand', 'm': 'cave_sand',
};
function altMap(id, name, rows, build, def) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, enc: ALT_ENC, retreat: ALT_RETREAT,
    build(M) {
      // the doorways and braziers are rock to the ridge-facing pass, then get their own pieces
      M.paint(0, 0, rows.map(r => r.replace(/[ABCDEUYT]/g, '#')), ALT_LEGEND, { cliff: '#', set: 'crystal', faces: 2 });
      rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { if (r[x] === 'T') { M.setObj(x, y, 'alt_torch'); M.light(x, y, 4); } if (r[x] === 'w') M.object('puddle', x, y, {}); } });
      build(M);
    } }, def || {}));
}
// a doorway cut in a ridge: the party comes out below it, facing down
function altDoor(M, x, y, to, tx, ty) { M.setObj(x, y, 'alt_door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.DOWN, { door: true }); }
const ALTMILLER_ROWS = [
  '              ########           ',
  '         ################        ',
  '        ##################       ',
  '       #######........#####      ',
  '    ####.......#####.....##      ',
  '   #####..#...#     ###...#      ',
  '  ######.....#         #..#      ',
  ' ##......####           #.#      ',
  ' #...####    ###AT##    #.#####  ',
  ' #..#      #####.####  ##.###### ',
  ' #..#     ###.......## ##.#######',
  ' #..###   #..#..#..#.# #........#',
  ' #..####  #..#.....###  #####..##',
  '##...#### ##......#..#       #..#',
  '##......# #...###....# #######..#',
  '#.......###........## #######..# ',
  '#..#.....# ####...#  #######...# ',
  ' #..#....#     #.#   ##...##...# ',
  '  #......##    #.#   #.........# ',
  '   ####..#######.##   #....####  ',
  '       #.#######.###   #..#      ',
  '       #...####...##   #..##     ',
  '        #..........#  ##.####    ',
  '         ##########   ##...###   ',
  '                      #......#   ',
  '                      #......#   ',
  '                       ##....#   ',
  '                         #...#   ',
  '                         #...#   ',
  '                         #...#   ',
  '                          #.#    ',
  '                          #.#    ',
];
altMap('altmiller', 'Altmiller Cave', ALTMILLER_ROWS, (M) => {
  M.walkable(27, 31); M.exit(27, 31, 1, 1, 'world_gs1', 14, 31, DIR.DOWN);
  altDoor(M, 16, 8, 'altmiller_2', 20, 27);
  M.chest(15, 13, 'Elixir', 1);
}, { entry: { x: 27, y: 30 } });
const ALTMILLER_2_ROWS = [
  '  ###                      ',
  ' #TT####                   ',
  '####B####                  ',
  '##.#.########              ',
  '#.......######             ',
  ' ######..######            ',
  '       #......#            ',
  '        #.....#            ',
  '        #.....#            ',
  '        #.....#T           ',
  '        #......##          ',
  '        #.......#    ###   ',
  '        #......##########  ',
  '        #.......#TT####### ',
  '         #.......###....## ',
  '          ##......#......# ',
  '            #...........#  ',
  '       ######.....######   ',
  '      ##TT###....#         ',
  '     ######...###          ',
  '     #.......#             ',
  '     #.......#             ',
  '     #.......#             ',
  '     #......#              ',
  '    ##..####               ',
  '   ##..#          ###      ',
  '   #...#    #######TA#     ',
  '   #...#############.##    ',
  '   #...###TT#####.....#    ',
  '   #....###...........#    ',
  '   #....#.............#T#  ',
  '   #.....#.............### ',
  '    #..........####....####',
  '     #........#      #..M.#',
  '      ########       #....#',
  '                     #....#',
  '                     #....#',
  '                      #### ',
];
altMap('altmiller_2', 'Altmiller Cave', ALTMILLER_2_ROWS, (M) => {
  altDoor(M, 4, 2, 'altmiller_3', 9, 9);
  altDoor(M, 20, 26, 'altmiller', 16, 9);
  M.chest(24, 33, 'Water of Life', 1, { mimic: 'Mimic #3' });   // the rip's Mimic
}, { entry: { x: 20, y: 27 } });
const ALTMILLER_3_ROWS = [
  '   #########     ######         ',
  '  ######################        ',
  ' ########################       ',
  ' #..........#####.......#       ',
  ' #..#######.......####..T#      ',
  ' #.#       #######    #..##     ',
  ' #.###                #...#     ',
  '##.#########        ###...#     ',
  '#...####TB###      ####...#     ',
  '#......##.####    ##T#....#     ',
  '#............###  ##V.....#     ',
  '#...##.......##C# #.......#     ',
  '#..#  ####..#.#.## #######      ',
  '#..#      ##.....########       ',
  '#..#      #......#############  ',
  '#..#     ##..###...############ ',
  '#..#     #.##   #........#######',
  '#..T#    #..#   ####...#.......#',
  '#..###   #..##  #.....# #...#..#',
  ' #...#   #...#  #.##.#  #..# #.#',
  '  #..#####...#  #...##  #..###.#',
  '  #...TT##...#   #...####..###.#',
  '  #..#.##....#    #..T####..#..#',
  '  #.o........#     #..##.......#',
  '  #..........#     #..........# ',
  '  #.L....o...###   ##........#  ',
  '   #.........####T##.o......#   ',
  '    #######..######........#    ',
  '           #.....#.........#    ',
  '            #........o..o..#    ',
  '            #....o.........#    ',
  '             #............#     ',
  '              ############      ',
];
altMap('altmiller_3', 'Altmiller Cave', ALTMILLER_3_ROWS, (M) => {
  altDoor(M, 9, 8, 'altmiller_2', 4, 3);
  altDoor(M, 15, 11, 'altmiller_4', 8, 18);
  M.chest(20, 10, 'Vial', 1); M.chest(4, 25, 'Lucky Medal', 1);
}, { entry: { x: 9, y: 9 } });
const ALTMILLER_4_ROWS = [
  '              ####              ',
  '             #########          ',
  '            ###########         ',
  '           ###.....#####        ',
  '         ####..##..#...##       ',
  '        ####Q.#..####...#       ',
  '       ####...##ppppp#p.#       ',
  '   #####.....####pppppp##       ',
  '  ######..###..##pppppp##       ',
  ' ###TT##SS#.....#ppwppo.#       ',
  '########SS####..#pppppp.######  ',
  '########.###########..o.####### ',
  '###...............#...o...##D###',
  '#...####...........###.........#',
  '#..#    ####.............##....#',
  '##.#        #..#####....##.#####',
  '##.#######  #...###########.####',
  '#..#####C## #.......####.......#',
  '#.######.### #............#....#',
  '#...###....#  ############ #### ',
  '#....##....#                    ',
  ' #...##.####                    ',
  '  #.....####                    ',
  '   #.......#                    ',
  '    #######                     ',
];
altMap('altmiller_4', 'Altmiller Cave', ALTMILLER_4_ROWS, (M) => {
  altDoor(M, 8, 17, 'altmiller_3', 15, 12);
  altDoor(M, 28, 12, 'altmiller_5', 42, 8);
  // the crack across the passage up to Squall's ledge: a puddle lies in it, and Frost's pillar of ice is the footing over it
  M.set(8, 8, 'pit'); M.set(9, 8, 'pit'); M.setObj(8, 8, null); M.setObj(9, 8, null); M.block(8, 8); M.block(9, 8); M.object('puddle', 8, 8, { id: 'alt4_puddle' });
  M.sign(9, 9, 'A crack across the passage, too wide to jump - and a puddle lying in it.');
  M.djinni('Squall', 12, 5, { fight: true });
  M.npc('BabiCave', 26, 12, { animal: 'none', name: '???', hideIf: 'babi_found', dir: DIR.DOWN, script: STORY.findBabi });   // Lord Babi, cloaked: a voice on the cavern floor until he has his draught
}, { entry: { x: 8, y: 18 } });
const ALTMILLER_5_ROWS = [
  '             #####                              ',
  '            #######                             ',
  '          ###########                           ',
  '         ####.....####                          ',
  '        ###...###..#########                    ',
  '        #.#..#   #...#####TT#                   ',
  '        #..####   #...########          ###     ',
  '        #.#####   #..........#         ##TD#    ',
  '        #.#.K###   ######....#        ####.##   ',
  '        #.#...#######    #...#        ##....#   ',
  '        #.#...########    #..######   #.....#   ',
  '      ###..#....#######   #..#######   #...#    ',
  '  #######.............##  #...##########..#     ',
  ' #ET####........####...## #........#####..#     ',
  '##.##..........#    #...#  #...###...##...#     ',
  '##.........#...##    #..#  ##.#   #..#....##    ',
  '#.....##### #.####   #..#  #.##    #.......#    ',
  ' #...#      ##..######..## #..#    #..##...###  ',
  ' #..#       #.....####...# #..#    #.#  T..#### ',
  ' ##.#       #......##...## #..#    #.#   #..####',
  ' #.##########...#...#..o.# #..######.#   #.....#',
  ' #...####TT###...##...#..#  #..#####.#####..o..#',
  '  #..#######..o.#..###...#  #...###..####......#',
  '   #.............#.......####.........##.......#',
  '    #####.........###....#####.................#',
  '         #...........#....##...............#### ',
  '         #..o..####..#.........o..###.....#     ',
  '         #....#    #.#....#......#   #....#     ',
  '          ####     #..#.........#     #...#     ',
  '                   #...........#      #.o.#     ',
  '                    ###########       #...#     ',
  '                                       #.#      ',
];
altMap('altmiller_5', 'Altmiller Cave', ALTMILLER_5_ROWS, (M) => {
  altDoor(M, 42, 7, 'altmiller_4', 28, 13);
  altDoor(M, 2, 13, 'altmiller_6', 8, 2);
  M.chest(12, 8, 'Cookie', 1);
}, { entry: { x: 42, y: 8 } });
const ALTMILLER_6_ROWS = [
  '        ################  ',
  '      ##E################ ',
  '     ###.#################',
  '    ###....SSTT#U#TT.....#',
  '    ###...#SS###.######..#',
  '    #######...#.....####.#',
  '    ##.###..p##ppppppp.#.#',
  '    #......op##pppp#pp...#',
  '     #####..p##ppop#pp...#',
  '          #.ppoooooppp...#',
  '          #.poppppoppp...#',
  '          #.poppppo##p..# ',
  '   ########.ooppppo#pp.#  ',
  '  #########.popopppp##.#  ',
  ' ###########pppppppopp.## ',
  ' #...#..###.oopppopopp.###',
  '##...#####..pooppppopp..##',
  '#...#.####...............#',
  '#..#........oo..........# ',
  '#.......................# ',
  '#.......................# ',
  '#.......................# ',
  '#...............########  ',
  '#...........####          ',
  ' ###########              ',
];
altMap('altmiller_6', 'Altmiller Cave', ALTMILLER_6_ROWS, (M) => {
  altDoor(M, 8, 1, 'altmiller_5', 2, 14);
  altDoor(M, 16, 3, 'altmiller_7', 7, 9);
}, { entry: { x: 8, y: 2 } });
const ALTMILLER_7_ROWS = [
  '    #######    ',
  ' ############# ',
  '###############',
  '#TT####U####TT#',
  '#TT#.......#TT#',
  '##...........##',
  '#....c.c.c....#',
  '#..b...s...m..#',
  '#.............#',
  '#######.#######',
  '      #.#      ',
];
altMap('altmiller_7', 'Altmiller Cave', ALTMILLER_7_ROWS, (M) => {
  M.walkable(7, 10); M.exit(7, 10, 1, 1, 'altmiller_6', 16, 4, DIR.DOWN);
  if (G.flag('altmiller_lights')) altDoor(M, 7, 3, 'altmiller_8', 4, 8);
  else M.object('statue', 7, 3, { id: 'alt_shut', tile: 'alt_door_shut', script: function* (E) { yield E.say('The doorway is sealed by a curtain of light. The five crystals around the room glimmer faintly.'); } });
  altGems(M);
  M.trigger(6, 8, 3, 1, STORY.altmillerFlames, { once: 'alt_flames_seen' });
}, { entry: { x: 7, y: 9 } });
const ALTMILLER_8_ROWS = [
  ' ####### ',
  '#########',
  '###...###',
  '##.....##',
  '##.k.k.##',
  '#..k.k..#',
  '#.......#',
  '##.....##',
  ' ###.### ',
  '   #.#   ',
  '   ###   ',
];
altMap('altmiller_8', 'Altmiller Cave', ALTMILLER_8_ROWS, (M) => {
  M.walkable(4, 9); M.exit(4, 9, 1, 1, 'altmiller_7', 7, 4, DIR.DOWN);
  M.chest(4, 2, 'Mystic Draught', 1);
}, { entry: { x: 4, y: 8 }, enc: [] });

// ---- the crystal room: touch the five crystals in the order the flames named (blue, green, pink, cyan, white) ----
const ALT_GEM_ORDER = ['blue', 'green', 'pink', 'cyan', 'white'];
const ALT_GEM_AT = { blue: [3, 7], green: [7, 6], pink: [11, 7], cyan: [5, 6], white: [9, 6] };
function altGems(M) {
  for (const c of ALT_GEM_ORDER) {
    const [x, y] = ALT_GEM_AT[c];
    M.object('statue', x, y, { id: 'gem_' + c, tile: 'gem_' + c, script: function* (E) {
      if (G.flag('altmiller_lights')) { yield E.say('The ' + c + ' crystal shines steadily.'); return; }
      const objs = G.field.map.objects, lit = objs.filter(o => o.id && o.id.startsWith('gem_') && o.lit).length;
      if (ALT_GEM_ORDER[lit] === c) {
        const o = objs.find(o => o.id === 'gem_' + c); o.lit = true; o.tile = 'gem_' + c + '_lit'; Audio.sfx('chime');
        if (lit + 1 === ALT_GEM_ORDER.length) { G.set('altmiller_lights'); yield E.say('The five crystals blaze together, and the curtain of light over the doorway fades away.'); G.field.loadMap('altmiller_7', G.field.player.tx, G.field.player.ty, G.field.player.dir, { noAutosave: true }); }
        else yield E.say('The ' + c + ' crystal lights up.');
      } else {
        for (const o of objs) if (o.id && o.id.startsWith('gem_')) { o.lit = false; o.tile = o.id; }
        yield E.say('The crystals flicker and go dark. That was not the order the flames showed.');
      }
    } });
  }
}
STORY.altmillerFlames = function* (E) {
  yield E.say('The great braziers flare, one colour after another: blue... green... pink... cyan... white.');
  yield E.say('(The crystals in the room must be touched in that order.)');
};
