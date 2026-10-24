// Dehkan Plateau, from its rip (map references/golden-sun-the-lost-age-dehkan-plateau-gba-map.webp) by
// tools/caves/dehkan_build.py: three screens of terraced tan rock - west, middle, east - classified from the rip, and
// under them the thirteen lilac caves the cracked ground drops the party into, whose doors come out on other
// terraces, joined as the rip's arrows show. The rope bridge over the lake at the east screen's top, the Mars Djinni
// Cannon and the Pound Cube in the cave under the east screen's first cracks, the pillars that Pound sinks at the way out.
'use strict';
const DK_ENC = [['Mini-Goblin', 'Mini-Goblin'], ['Rat Soldier II'], ['Troll II'], ['Will Head II'], ['Kobold II']];
const DK_CAVE_ENC = [['Mini-Goblin'], ['Rat II'], ['Will Head II'], ['Rat Soldier II', 'Mini-Goblin']];
const DK_RETREAT = { map: 'world_tla', x: 72, y: 77, dir: DIR.DOWN };
const DK_LEGEND = { '.': 'dk_sand', 'g': 'dk_grass', 'o': { ground: 'dk_sand', obj: 'dk_boulder' }, 'w': 'deepwater', 'S': 'dk_bridge', 'Y': 'dk_sky', 'X': 'dk_sand', 'D': 'dk_sand', 'K': 'dk_sand', 'P': 'dk_sand' };
const DK_CAVE_LEGEND = { '.': 'lc_floor', 'X': 'lc_floor', 'D': 'lc_floor', 'K': 'lc_floor', 'P': 'lc_floor' };
function dkScreen(id, rows, exits, build, entry) {
  defineMap(id, { name: 'Dehkan Plateau', w: rows[0].length, h: rows.length, base: 'dk_sand', music: 'overworld2', bg: 'cliffs', enc: DK_ENC, retreat: DK_RETREAT, entry,
    build(M) {
      M.paint(0, 0, rows, DK_LEGEND, { cliff: '#', set: 'plateau', faces: 2 });
      for (const [x, y, to, tx, ty, dir] of exits) {
        M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir, { door: /_c[0-9]/.test(to) });
        if (/_c[0-9]/.test(to)) { const up = M.getObj(x, y - 1); if (up && up.kind === 'cliff') M.setObj(x, y - 1, 'dk_door'); }   // a dark opening in the terrace face
      }
      if (build) build(M);
    } });
}
function dkCave(id, rows, exits, build, entry) {
  defineMap(id, { name: 'Dehkan Plateau - Cave', w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, enc: DK_CAVE_ENC, retreat: DK_RETREAT, entry,
    build(M) {
      M.paint(0, 0, rows, DK_CAVE_LEGEND, { cliff: '#', set: 'lilacrock', faces: 2 });
      for (const [x, y, to, tx, ty, dir] of exits) {
        M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir, { door: true });
        const up = M.getObj(x, y - 1); if (up && up.kind === 'cliff') M.setObj(x, y - 1, 'lc_door');
      }
      if (build) build(M);
    } });
}
const DEHKAN_ROWS = [
  'oggg##o..ggg.......o............##........####o.o#o##g#Xgggg##gg',
  'gg......ggg.......o..o......oo.#....####.####o...####g#D....##gg',
  'g..gggg.........oo............##.##########.o...#####g####..##gg',
  'o..gg#gggg......g.....o.#........####..###.K....####gg####..g#.g',
  'g.Kggggggg..#...g......##....................g......ggggg##..#..',
  'gggg##gggg..###...##..........###.####...###.gg.#...gggggg#.....',
  '#gggggggg...############...######.##########.gg.#...g....g#.....',
  '#gggggggg.......###..##########...#gg#####...gg.#........gg.....',
  'ggggggggg#..###.......######.....##g..###...#####.o.....##.....g',
  'gggggggg#######.############.######..############.o..#####.#....',
  'ggggggggg####...##################g..##..#######.....####..#...#',
  'ggggggggg..#.o..#.#..###ggg###ggggg.........#........#..#..#.###',
  'gg##gg..g............#ggggggggggggg.##......#........##......###',
  '#ggggg.....o..o.o.....ggggggggg...####..###..#.......#...o...###',
  '##g#g............#...gggggX.......#####.##...#....##.##...o...##',
  'ggggg..###..o..###.##ggg..Dg......#..##......#....####.o.#....##',
  '#ggg...###...#####.###g#..g#g.....#.................##....#.....',
  '#gggo..##########..######..ggg.............................o.o..',
  'gg.......######....#######....g...................g.#.o.o.....oo',
  'g.........#######...X#####...ggg.#g............g.g..#....o....g.',
  'go..#..############.D####....ggg.##g...........g.g.##........gg.',
  '###.#######....#####.##.....g#####gg.##..........####g..........',
  'o##.########....####.##.o..#######...##.#..#########gg..........',
  'g#############.##..#.......######g...#gg##########gggg...#.#...o',
  'gg######..####.............###gg....##gg####gggggggggg.###.#####',
  '...gggg.....##..............gg...#####ggggggggggggggg..###D#####',
  'D...ggg.#..##.............gg...#######gggggg####ggg....###X#####',
  'X..ggg.##.g...............ggg..#################################',
  '#g.....................#gg....###############g##################',
  'og...........#.....gg..##g....##################################',
  '###...#....gg#..o.g#gg##gg...###################################',
  '#########.gg##g.o..#####g#######################################',
];
dkScreen('dehkan', DEHKAN_ROWS, [[55, 0, 'dehkan_mid', 22, 31], [26, 14, 'dehkan_c1', 15, 6], [20, 19, 'dehkan_c1', 11, 6], [58, 26, 'dehkan_c2', 2, 3], [0, 27, 'world_tla', 71, 76, DIR.UP]], (M) => {
    M.set(13, 12, 'dk_hole'); M.set(18, 12, 'dk_hole'); M.set(11, 14, 'dk_hole'); M.set(54, 13, 'dk_hole'); M.set(54, 15, 'dk_hole'); M.set(57, 16, 'dk_hole'); M.set(15, 12, 'dk_crack'); M.set(14, 14, 'dk_crack'); M.set(56, 14, 'dk_crack'); M.set(55, 16, 'dk_crack'); 
    M.def.fall = (x, y) => x < 40 ? { map: 'dehkan_c1', x: 6, y: 6 } : { map: 'dehkan_c3', x: 4, y: 5 };
    M.sign(2, 25, 'Dehkan Plateau. The ground here is cracked and crumbling - mind your step.');
    M.chest(2, 4, 'Nut', 1);
}, { x: 55, y: 1 });
const DEHKAN_MID_ROWS = [
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYo...g..oYYYYYYYYYYYYYYYYYYYYYYYYY...',
  'Yo..oYYYYYYYYYYYYYYYYYYYYo...g..g....#YYYYYY#..oYYYYYYYYo.......',
  '.......oYYYYYYYYYYYYYYYYY...g...gg.o.#YYYYYY#...YYYYYYYY........',
  '.....g......ggggggg...#g....g....g...###o..##..#######.....####.',
  'gg.....##.#.gggggggg..#..#.......g.###.o#o..#..###.#o...########',
  'gg.########.ggggggggg....##...#....###.....o..##...##...####..##',
  'g..#####....g....ggggggggg###.##..##.#..o.....#....##....##...##',
  'g..###....g.g......ggggggg###.######.#........#...###....##..gg#',
  '...###......g#g........ggggg#..####.....o.....#...####.......g.X',
  'g.####.#######....#.......ggg..g.......#......#....###.........D',
  '..###..#######.####.......ggg....g.######...g.....#####.........',
  '.##.#..#...#######.#..g....gg..g...#####......#.#########.......',
  '###....#.....#####.###..##.gg#.....##gg....########..####....#.#',
  '##.....#......####.#######.gg#..##.#ggg....####.#.D....###...###',
  '..g.#.##..#...##g#..g####..gg##.#.##.......#....#.X#..####.#.###',
  '.g..##....###.##g##........ogg#...##.......#......##...###.#....',
  '....#.....###..#########.g..gg#...#g#.###..#....o......###.#....',
  '..g.#..........#########.g..ggg...#g#####.....o...o...........g.',
  '.####...o.....#######..#.g..ggg...#g#####XD.o..o.......#......gg',
  '.#.##.........#..#####...g.#gg..g..gggggg.......oo.##..#......g#',
  '...#..........#.o..###.....##g.......gg.............#####....ggg',
  'o..#..#.....###......#..#.##gg..g................o..#..##..#..g.',
  '...#.##.##..##..........####gg#..####.....g..##.....#...##.#....',
  '...#...###..............###ggg#################..........###..gg',
  '........#......#........#...gg####g###########...........####...',
  'g.......#......####.........gggggggggg######g............#.##.g.',
  '........#..#...###.......#..gggggggggggg####gggg......#.....#...',
  '......o.#..###...........#........g...gg###gggg.....o.##....#...',
  '...g..o.#..##...........##............gggggg.......o..#...###...',
  '.....................g..................gg.......o.o..#.###.#.#.',
  'g......K............gg..................................##....#.',
  '#g....g..............XD..g.....g........................#..o..##',
];
dkScreen('dehkan_mid', DEHKAN_MID_ROWS, [[21, 31, 'dehkan', 55, 1], [63, 8, 'dehkan_east', 1, 6], [41, 18, 'dehkan_c6', 2, 3], [50, 14, 'dehkan_c4', 12, 9]], (M) => {
    M.set(40, 5, 'dk_hole'); M.set(44, 6, 'dk_hole'); M.set(39, 7, 'dk_hole'); M.set(49, 22, 'dk_hole'); M.set(46, 20, 'dk_hole'); M.set(42, 7, 'dk_crack'); M.set(42, 5, 'dk_crack'); M.set(47, 21, 'dk_crack'); M.set(50, 20, 'dk_crack'); 
    M.def.fall = (x, y) => y < 15 ? { map: 'dehkan_c4', x: 5, y: 5 } : { map: 'dehkan_c5', x: 5, y: 6 };
}, { x: 63, y: 9 });
const DEHKAN_EAST_ROWS = [
  'wwwwwwwwwwwwwwwwwwwwwwwwwwYYYYo....oYYYYYYYYYYYYYYYYYYYYo...gg.g',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwYYo...og.....oYYYYYYYYYYYYo.......gg..',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwYY..#...........oYYYYYYYYY....#......g',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwY#..###.......#..#......o.....########',
  'wwwwwwwwwwwwwwwwwwwwwwwwwo.##.###.g....##..#..o.o...###.########',
  'wwwwwwwwwwwwwwwwwwwwwwwww...######g..####....o.##o..#####.######',
  'XDSSSSSSSSSSSSSSSSSSSSSSS...###X.#######.......###o...###....###',
  'w.wwwwwwwwwwwwwwwwwwwwwww.....#D..####.....#.....#..............',
  'wwwwwwwwwwwwwwwwwwwwwwwww...#...g.......#####...######...#...ggg',
  'wwwwwwwwwwwwwwwwwwwwwwwww#...o..g.......################.#...g##',
  'wwwwwwwwwwwwwwwwwwwwwwwww##....######..##.X..####....###.##...gg',
  '#####.######......o..#...##o.############.D..#.........##.##.DX#',
  '############.....o........#..#.###gg######...#..........#.####.g',
  '#.#####.###.o........##.g##....ggggggg..##...#..........#..gg#..',
  '........##........#...#####......gggg..#.##..#..#..........gg...',
  '.###...##....#....###.####.........gg..#..#..#..##.......#......',
  '.########....#....###...#..........gg..#..#..#..##....#..##...gg',
  '..######...#.##.....##.#....#.......gg...........##..###.##..ggg',
  '..###....###..#......#####..##...#.....#...#.o....######....g...',
  '.#.###........#......########....##..####..##.....####......gg..',
  '.#.###..o.............#########.##.#####...#..o....#.#.......g#.',
  '.#.#................#########.####.###......##..#..#.#...##...#.',
  '.........#.#####..#####..####.###..#.#......######........###.#.',
  '..oo..##.#####.######...#...#......#.#......#####..o.o....###.X.',
  '.......#####...####....##.......gg.#..................oo..gg#.D.',
  'g......###.......#...#..........g..#....................o..gg...',
  '....................##....................................ggg...',
  '............###.........................o.................gg...g',
  '...........###..........g.............gg...#.........o........g#',
  '....oo...........................o.####g...###...#............go',
  '.o..............................#..####g...########.##...##.....',
  '........g....gg................##.#####g#....#####..##.####..#..',
  '.............g.................#######gg#######....##...g##..##.',
  'g.........g...........g.......#######################....g....##',
  'g......o.g..........g.....g..####..##################.##...#..##',
  'g........................g..###.#..##...#############.####.#....',
  '........................gg..##..#.###.....##########..######....',
  'g.................###.gggg.....##.###...##########...########g#g',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYY##.###.##..######..######.###ggg####g',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYY##.....##..###.......####.#.#...g####',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYY#..##..#..##.......######...##.gg####',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY.###....###.....#########...#.g.####',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY.#####...##.....####........#..K..##',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY.#.#####........#ggggg..##..........',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY....####........#####.######.#....gg',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY#######...#ggg.######.###########..g',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY#################......Dggg#########',
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYY###########ggg###......X##gg#ggg####',
];
dkScreen('dehkan_east', DEHKAN_EAST_ROWS, [[0, 6, 'dehkan_mid', 63, 9], [31, 6, 'dehkan_c7', 4, 2], [42, 10, 'dehkan_c9', 5, 3], [62, 11, 'dehkan_c10', 2, 7], [62, 23, 'dehkan_c10', 9, 14], [51, 47, 'world_tla', 66, 79, DIR.DOWN]], (M) => {
    M.set(47, 4, 'dk_hole'); M.set(45, 7, 'dk_hole'); M.set(28, 9, 'dk_hole'); M.set(29, 10, 'dk_hole'); M.set(46, 5, 'dk_crack'); M.set(43, 5, 'dk_crack'); M.set(29, 8, 'dk_crack'); 
    M.def.fall = (x, y) => x < 40 ? { map: 'dehkan_c7', x: 4, y: 6 } : { map: 'dehkan_c8', x: 6, y: 4 };
    // the Mars Djinni pounds a pillar into the ground and drops down the hole: follow it
    M.trigger(26, 6, 2, 3, T3.cannonDjinni, { once: 'cannon_seen', cond: () => !(G.party ? G.party.djinnFound : []).includes('Cannon') });
    // the way out is blocked by a stone pillar: Pound sinks it
    M.object('pillar', 49, 44, { id: 'dp_pillar' });
}, { x: 1, y: 6 });
const DEHKAN_C7_ROWS = [
  '###########',
  '####.######',
  '##..DX#####',
  '#.....#####',
  '#......####',
  '#......####',
  '#...D..####',
  '#......####',
  '###P..K####',
  '####.######',
  '###########',
];
dkCave('dehkan_c7', DEHKAN_C7_ROWS, [[5, 2, 'dehkan_east', 31, 7]], (M) => {
    M.set(4, 6, 'light_shaft');
    M.chest(6, 8, 'Pound Cube', 1);
    M.djinni('Cannon', 3, 8, { fight: true });
}, { x: 4, y: 2 });
const DEHKAN_C1_ROWS = [
  '#################',
  '#################',
  '#################',
  '#####....########',
  '#....#........###',
  '...#....#........',
  '......D....D...DX',
  '.#.........X...K.',
  '...........######',
  '##.....##########',
];
dkCave('dehkan_c1', DEHKAN_C1_ROWS, [[16, 6, 'dehkan', 26, 15], [11, 7, 'dehkan', 20, 20]], (M) => {
    M.set(6, 6, 'light_shaft');
    M.chest(15, 7, 'Elixir', 1);
}, { x: 6, y: 6 });
const DEHKAN_C2_ROWS = [
  '#######',
  '#######',
  '#.X####',
  '..D...X',
  '......D',
  '.......',
  '###....',
];
dkCave('dehkan_c2', DEHKAN_C2_ROWS, [[2, 2, 'dehkan', 58, 25], [6, 3, 'dehkan_c3', 10, 13]], (M) => {

}, { x: 2, y: 3 });
const DEHKAN_C3_ROWS = [
  '############',
  '############',
  '############',
  '############',
  '##....##..##',
  '#...D##.....',
  '...#####....',
  '..####...#..',
  '............',
  '###.........',
  '##.........#',
  '...........#',
  '........K...',
  '..........D.',
  '##........X.',
  '############',
];
dkCave('dehkan_c3', DEHKAN_C3_ROWS, [[10, 14, 'dehkan_c2', 6, 4]], (M) => {
    M.set(4, 5, 'light_shaft');
    M.chest(8, 12, 'Full Metal Vest', 1);
}, { x: 4, y: 5 });
const DEHKAN_C4_ROWS = [
  '##############',
  '##############',
  '##############',
  '##############',
  '##...#########',
  '#....D..###...',
  '#.............',
  '..............',
  '..............',
  '##..........DX',
  '############.#',
];
dkCave('dehkan_c4', DEHKAN_C4_ROWS, [[13, 9, 'dehkan_mid', 50, 13]], (M) => {
    M.set(5, 5, 'light_shaft');

}, { x: 5, y: 5 });
const DEHKAN_C5_ROWS = [
  '##########',
  '##########',
  '##....####',
  '##.......#',
  '#........#',
  '#.........',
  '#....D...#',
  '#....D..K#',
  '#....X..##',
  '###..#####',
];
dkCave('dehkan_c5', DEHKAN_C5_ROWS, [[5, 8, 'dehkan_c6', 9, 12]], (M) => {
    M.set(5, 6, 'light_shaft');
}, { x: 5, y: 6 });
const DEHKAN_C6_ROWS = [
  '##########',
  '##########',
  '#.X#######',
  '..D#######',
  '...#######',
  '...#######',
  '#..#######',
  '#.########',
  '#.########',
  '#..#######',
  '...#######',
  '....###..X',
  '#........D',
  '#........K',
];
dkCave('dehkan_c6', DEHKAN_C6_ROWS, [[2, 2, 'dehkan_mid', 42, 18], [9, 11, 'dehkan_c5', 5, 7]], (M) => {
    M.chest(9, 13, 'Mint', 1);
}, { x: 2, y: 3 });
const DEHKAN_C8_ROWS = [
  '###########',
  '###########',
  '###########',
  '###########',
  '###...D.###',
  '##.......X#',
  '##XD.#...D#',
  '###.......#',
  '##.#..#...#',
  '........#..',
  '....#......',
  '...........',
  '.....#.....',
  '#........DX',
  '#...DX....#',
  '####.######',
];
dkCave('dehkan_c8', DEHKAN_C8_ROWS, [[2, 6, 'dehkan_c11', 4, 6], [9, 5, 'dehkan_c11', 10, 3], [5, 14, 'dehkan_c9', 12, 11], [10, 13, 'dehkan_c10', 10, 3]], (M) => {
    M.set(6, 4, 'light_shaft');

}, { x: 6, y: 4 });
const DEHKAN_C9_ROWS = [
  '#############',
  '#############',
  '###..X#######',
  '##...D#######',
  '##....#######',
  '#.....#######',
  '#.....#######',
  '#.#...#######',
  '#.###########',
  '...##########',
  '........###.X',
  '............D',
  '##...........',
  '###......####',
  '###..#...####',
  '###..########',
  '####..#######',
  '####.....####',
  '####.....####',
  '######...####',
];
dkCave('dehkan_c9', DEHKAN_C9_ROWS, [[5, 2, 'dehkan_east', 42, 11], [12, 10, 'dehkan_c8', 4, 14]], (M) => {

}, { x: 5, y: 3 });
const DEHKAN_C10_ROWS = [
  '#############',
  '#############',
  '#######...X##',
  '#######...D##',
  '#######....##',
  '#######.#####',
  '..X###..#####',
  '..D.....#####',
  '........#####',
  '##......#####',
  '##......#####',
  '###.#########',
  '###.#########',
  '##...##..X..X',
  '##.......D..D',
  '##...........',
  '#######....##',
];
dkCave('dehkan_c10', DEHKAN_C10_ROWS, [[2, 6, 'dehkan_east', 61, 11], [9, 13, 'dehkan_east', 62, 24], [10, 2, 'dehkan_c8', 9, 13], [12, 13, 'dehkan_c13', 2, 4]], (M) => {

}, { x: 10, y: 3 });
const DEHKAN_C11_ROWS = [
  '#################',
  '#################',
  '#########.X....##',
  '########..D......',
  '########.##....D.',
  '####X....###...X#',
  '#.#.D.....#.#####',
  '..##.....##.#####',
  '............#####',
  '...........######',
  '#..........######',
  '#..........######',
  '#.###......######',
  '#.###.....#######',
  '#.........#######',
  '#......##########',
];
dkCave('dehkan_c11', DEHKAN_C11_ROWS, [[4, 5, 'dehkan_c8', 3, 6], [10, 2, 'dehkan_c8', 9, 6], [15, 5, 'dehkan_c12', 2, 4]], (M) => {

}, { x: 10, y: 3 });
const DEHKAN_C12_ROWS = [
  '###################',
  '###################',
  '###################',
  '#.X##..#####.....##',
  '..D....#...#.......',
  '....###.....##.....',
  '#.######.....###...',
  '#.####......#..K...',
  '#...##.....##......',
  '#..................',
  '####.............DX',
  '#######...........#',
];
dkCave('dehkan_c12', DEHKAN_C12_ROWS, [[2, 3, 'dehkan_c11', 15, 4], [18, 10, 'dehkan_c13', 12, 3]], (M) => {
    M.chest(15, 7, "Themis' Axe", 1);
}, { x: 2, y: 4 });
const DEHKAN_C13_ROWS = [
  '#############',
  '#############',
  '###########.X',
  '#.X#######..D',
  '..D..#####...',
  '............#',
  '###.K.......#',
];
dkCave('dehkan_c13', DEHKAN_C13_ROWS, [[2, 3, 'dehkan_c10', 12, 14], [12, 2, 'dehkan_c12', 17, 10]], (M) => {
}, { x: 12, y: 3 });
