// Babi Lighthouse, from its rip (map references/golden-sun-babi-lighthouse-gba-map.webp) by tools/caves/babi_build.py: the
// pink facade of the unfinished tower over the construction site and its scaffolds, the ravine beside the site with
// Luff, and the halls inside drawn from the rip's room pictures - the entrance hall with its three doors, the block
// hall whose lever raises the gate, the goddess hall, and the Tunnel Ruins under them all with Asura's Armor, the
// Oracle's Robe and the sealed door into the Venus Lighthouse.
'use strict';
const BL_ENC = [['Plated Rat'], ['Gnome Wizard'], ['Mole Mage', 'Mole Mage'], ['Willowisp']];
const BL_RETREAT = { map: 'world_gs1', x: 38, y: 59, dir: DIR.DOWN };
const BL_EXT_ROWS = [
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKwKKKKKKKKKwKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   llllllllllllllllllllllll   ',
  '   KKKKKKKKKKKKKKKKKKdKKKKK   ',
  '   KKKKKKKKKKKdKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKdKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   llllllllllllllllllllllll   ',
  '   KKKKKKKwKKKKKwKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKwKKKKKKKKKKKKKKKKKwKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   llllllllllllllllllllllll   ',
  '   KKKKKKKKKKKKKKKKKKKKKKKK   ',
  '   KKKAKKKKKKKKKKKKKBKKKKKK   ',
  '..............................',
  '.............SSSS.............',
  '.............SSSS.............',
  '.............SSSS.............',
  '.............SSSS.............',
  '.............SSSS.............',
  '........L.....................',
  '..............................',
  '.....##.L.....................',
  '.....##.L.....................',
  '........L...#.................',
  '......L.....######............',
  '.L...........#########LLLL#...',
  '............##########.####...',
  '.##.#.....############C######.',
  '###.#...#.###########...#####.',
  '#.....L.#####################.',
  '..##..L..####################.',
  '..##.L.....###.##############.',
  '.....................#####....',
  '.......LLLLLLL..............L.',
  '.......L..L...................',
  '.##.......L...LLL.L...........',
  '...###....LLLLLLL.......L.....',
  'V....#........................',
  '..L..#........................',
  '..............................',
  '........L.L...................',
  '..............................',
  '..............................',
  '..............................',
];
const BL_EXT_LEGEND = {
  '.': 'sand', 'S': 'stairs', 'K': { ground: 'sand', obj: 'wall_kalay' }, 'd': { ground: 'sand', obj: 'door_kalay' }, 'w': { ground: 'sand', obj: 'window_kalay' }, 'l': { ground: 'sand', obj: 'roof_slate_edge' },
  'L': { ground: 'sand', obj: 'ladder', walk: true }, 'A': 'sand', 'B': 'sand', 'C': 'sand', 'V': 'sand',
};
defineMap('babi_lh', {
  name: 'Babi Lighthouse', w: 30, h: 54, base: 'void', music: 'lighthouse', bg: 'ruins', entry: { x: 14, y: 52 }, enc: BL_ENC, retreat: BL_RETREAT,
  build(M) {
    M.paint(0, 0, BL_EXT_ROWS, BL_EXT_LEGEND, { cliff: '#', set: 'sandcliff', faces: 1 });
    M.setObj(6, 22, 'door_kalay'); M.walkable(6, 22); M.exit(6, 22, 1, 1, 'babi_lh_1', 3, 19, DIR.UP, { door: true });
    M.setObj(20, 22, 'door_kalay'); M.walkable(20, 22); M.exit(20, 22, 1, 1, 'babi_lh_1', 14, 19, DIR.UP, { door: true });
    M.setObj(0, 47, 'sd_door'); M.walkable(0, 47); M.exit(0, 47, 1, 1, 'babi_ravine', 10, 5, DIR.DOWN, { door: true });
    M.exit(12, 53, 6, 1, 'world_gs1', 38, 59, DIR.DOWN);
    M.chest(22, 37, 'Lucky Pepper', 1);
    M.npc('babi_worker', 8, 42, { type: 'villager_m', name: 'Laborer', text: "Lord Babi built this tower to reach the Venus Lighthouse from below. The tunnel ruins connect them." });
    M.npc('babi_worker2', 25, 45, { type: 'villager_m', name: 'Laborer', text: "The scaffolds go up to the doors. Mind the drop - two men went over last week." });
    M.npc('babi_foreman', 16, 25, { type: 'guard', name: 'Foreman', dir: DIR.DOWN, text: "Lord Babi's orders: no one inside but the work crews. ...You carry his seal? Then go on. The way down is through the halls." });
    M.sign(11, 25, "Babi Lighthouse. Under construction by order of Lord Babi of Tolbi.");
  }
});
const BL_RAV_ROWS = [
  '            ##    ',
  '         ######   ',
  '        ########  ',
  '       ###X#####  ',
  '       ###.#...#  ',
  '       #.......#  ',
  '       #.....###  ',
  '        ##....##  ',
  '           #.##   ',
  '           #.##   ',
  '          ##.###  ',
  '         ###.#### ',
  '        ####.#####',
  '        ####.#####',
  '  ####  ####..#..#',
  ' ###### #.#......#',
  '#########...o..###',
  '#########.......##',
  '#.#....###...o..# ',
  '#...#..####....#  ',
  ' #.# #.####.o..#  ',
  ' ### #..###....#  ',
  '      #......##   ',
  '        ##.##     ',
];
defineMap('babi_ravine', {
  name: 'Babi Lighthouse', w: 18, h: 24, base: 'void', music: 'dungeon', bg: 'sand', indoor: true, entry: { x: 10, y: 5 }, enc: BL_ENC, retreat: BL_RETREAT,
  build(M) {
    M.paint(0, 0, BL_RAV_ROWS, { '.': 'sand', 'o': { ground: 'sand', obj: 'rock_sand' }, 'X': 'sand' }, { cliff: '#', set: 'brownrock', faces: 2 });
    M.exit(10, 3, 1, 1, 'babi_lh', 1, 47, DIR.LEFT);
    M.djinni('Luff', 12, 17, { fight: true });
    M.chest(13, 20, 'Nut', 2);
  }
});
// ---- the halls: pale stone floors walled in the ruins' blocks ----
const BL_ROOM_LEGEND = { '.': 'ruins_floor', 'p': { ground: 'ruins_floor', obj: 'pillar' }, 'k': { ground: 'ruins_floor', obj: 'lh_column' }, 'S': 'stairs', 'A': 'ruins_floor', 'B': 'ruins_floor', 'C': 'ruins_floor', 'D': 'ruins_floor', 'e': 'elem_venus' };
function blRoom(id, name, rows, build, def) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'lighthouse', bg: 'ruins', indoor: true, enc: BL_ENC, retreat: BL_RETREAT,
    build(M) { M.paint(0, 0, rows, BL_ROOM_LEGEND, { cliff: '#', set: 'ruinsrock', top: 'ruins_walltop', face: 'ruins_wall', mid: 'ruins_walltop' }); build(M); } }, def || {}));
}
function blDoor(M, x, y, to, tx, ty, dir) { M.setObj(x, y, 'door_stone'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir, { door: true }); }
// the entrance hall: doors A and B open on the tower's foot, the stair between the columns climbs to door C
const BL1_ROWS = [
  '##################',
  '#########C########',
  '##...............#',
  '##.k...........k.#',
  '##...............#',
  '##...............#',
  '##.k....SS.....k.#',
  '##......SS.......#',
  '##...............#',
  '##...............#',
  '##.k...........k.#',
  '##...............#',
  '##...............#',
  '##......kk.......#',
  '##...............#',
  '##...............#',
  '##...............#',
  '##...............#',
  '##...............#',
  '##...............#',
  '###A##########B###',
];
blRoom('babi_lh_1', 'Babi Lighthouse', BL1_ROWS, (M) => {
  blDoor(M, 3, 20, 'babi_lh', 6, 23); blDoor(M, 14, 20, 'babi_lh', 20, 23);
  blDoor(M, 9, 1, 'babi_lh_2', 7, 20, DIR.UP);
  M.chest(3, 17, 'Psy Crystal', 1); M.chest(14, 17, 'Potion', 1);
}, { entry: { x: 3, y: 19 } });
// the block hall: the yellow blocks of the rip, and the lever that raises the gate over the way on
const BL2_ROWS = [
  '###############',
  '#######G#######',
  '##...........##',
  '##..k.....k..##',
  '##...........##',
  '##...pp......##',
  '##...pp......##',
  '##...........##',
  '##......pp...##',
  '##......pp...##',
  '##...........##',
  '##..k.....k..##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '##...........##',
  '#######D#######',
];
blRoom('babi_lh_2', 'Babi Lighthouse', BL2_ROWS, (M) => {
  blDoor(M, 7, 21, 'babi_lh_1', 9, 2);
  if (G.flag('babi_gate')) blDoor(M, 7, 1, 'babi_lh_3', 6, 17, DIR.UP);
  else M.object('gate', 7, 1, { id: 'bgate', state: 'closed', script: function* (E) { yield E.say('A heavy gate of stone bars. A lever on the wall must raise it.'); } });
  M.object('statue', 12, 3, { id: 'babi_lever', tile: 'lever', script: function* (E) {
    if (G.flag('babi_gate')) { yield E.say('The lever is thrown. The gate stands open.'); return; }
    Audio.sfx('push'); G.set('babi_gate'); yield E.say('The lever grinds over... and the gate at the far end of the hall rises into the wall.');
    G.field.loadMap('babi_lh_2', G.field.player.tx, G.field.player.ty, G.field.player.dir, { noAutosave: true });
  } });
  M.chest(3, 18, 'Nut', 2);
}, { entry: { x: 7, y: 20 } });
// the goddess hall: the great statue Babi's masons raised, and the stair down into the ruins
const BL3_ROWS = [
  '#############',
  '#####...#####',
  '####.....####',
  '##.........##',
  '##.........##',
  '##.k.....k.##',
  '##.........##',
  '##.........##',
  '##.k.....k.##',
  '##.........##',
  '##.........##',
  '##.k.....k.##',
  '##.........##',
  '##.........##',
  '##.........##',
  '##.........##',
  '##.........##',
  '##.........##',
  '######D######',
];
blRoom('babi_lh_3', 'Babi Lighthouse', BL3_ROWS, (M) => {
  blDoor(M, 6, 18, 'babi_lh_2', 7, 2);
  for (const [q, dx, dy] of [['tl', 5, 1], ['tr', 6, 1], ['bl', 5, 2], ['br', 6, 2]]) M.setObj(dx, dy, 'goddess_' + q);
  M.setObj(2, 16, 'stairs_down'); M.walkable(2, 16); M.exit(2, 16, 1, 1, 'tunnel_ruins', 3, 2, DIR.DOWN, { stairs: true });
  M.chest(10, 16, 'Elixir', 1);
  M.npc('babi_mason', 6, 6, { type: 'villager_m', name: 'Mason', text: "Lord Babi had us carve the goddess from the lighthouse's own likeness. He says she watched over him in Lemuria. Whatever that is." });
}, { entry: { x: 6, y: 17 } });
// ---- the Tunnel Ruins: the old halls under the tower, from the rip's lower complex ----
const TR_ROWS = [
  '##############################',
  '#..........###################',
  '#.k......k.###################',
  '#..........###################',
  '#..........#########.....#####',
  '#..k....k..#########.....#####',
  '#..........#####.........#####',
  '#.....#########.###.#....#####',
  '#.....#########.###.#....#####',
  '#.....#########.....#....#####',
  '###.#######....#.###......####',
  '###.#######....#.###......####',
  '###.#######.......##......####',
  '###.###############.....######',
  '###.......#########.....######',
  '###.......###########.########',
  '###.......###########.########',
  '###.......###########.########',
  '###.......###########.########',
  '###...........#####.....######',
  '#########...#..............###',
  '#########...#..............###',
  '#########...#..............###',
  '#########...#..............###',
  '#########...####..........####',
  '#########.......####..########',
  '##########.........#..########',
  '##########...........#########',
  '##########....######..........',
  '##########....######..........',
  '##########....######......k.k.',
  '#######.......######..........',
  '#######.......######..........',
  '#######.......######......k.k.',
  '#######..k.k..######..........',
  '#######.......######..........',
  '#######..k.k..######..........',
  '#######.......###############.',
  '#######.......###############.',
  '##############################',
];
blRoom('tunnel_ruins', 'Tunnel Ruins', TR_ROWS, (M) => {
  M.setObj(3, 1, 'stairs_up'); M.walkable(3, 1); M.exit(3, 1, 1, 1, 'babi_lh_3', 2, 15, DIR.UP, { stairs: true });
  M.chest(24, 5, "Asura's Armor", 1); M.chest(21, 30, "Oracle's Robe", 1); M.chest(9, 35, "Cleric's Ring", 1); M.chest(1, 9, 'Water of Life', 1);
  M.chest(4, 8, 'Game Ticket', 2, { hidden: true });
  M.setObj(29, 28, 'door_stone'); M.setObj(29, 29, 'door_stone'); M.walkable(29, 28, 1, 2); M.exit(29, 28, 1, 2, 'venus_lh_2', 36, 51, DIR.RIGHT, { door: true });
  M.sign(27, 27, "'Beyond this door: the Venus Lighthouse. Turn back, for the beacon's sake.'");
}, { entry: { x: 3, y: 2 }, enc: [['Plated Rat', 'Plated Rat'], ['Chimera Mage'], ['Ice Gargoyle'], ['Skull Warrior']], music: 'dungeon' });
