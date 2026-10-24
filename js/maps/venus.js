// Venus Lighthouse, from its rip (map references/golden-sun-venus-lighthouse-gba-map.webp) by tools/caves/venus_build.py:
// the forest approach to the front gate (classified from the rip), the front hall behind it that ends at a sealed
// door - the way in is the Tunnel Ruins - and the inner halls drawn as the rip's rooms: the entrance hall, the Gaia
// Blade maze, the Thunder Crown room, the statue gallery with the Lucky Cap and Carry Stone, the stair hall, and the
// pillar hall whose gate opens once both pillars stand on their plates, then the stair up to the aerie.
'use strict';
const VL_ENC = [['Grand Golem'], ['Recluse', 'Recluse'], ['Boulder Beast'], ['Thunder Lizard'], ['Fenrir']];
const VL_RETREAT = { map: 'world_gs1', x: 40, y: 65, dir: DIR.DOWN };
const VF_ROWS = [
  '################################',
  '################################',
  '################################',
  '...................##########...',
  '..##..##.....####..####A#####...',
  '##########..####.....#...#.....#',
  '###########..#####...s...s......',
  '###############....#.......#...#',
  '#################...............',
  '#################......F......##',
  '##################...........###',
  '###################..........###',
  '###################..........###',
  '######################....######',
  '..#...################...#######',
  'X......###############..########',
  '...........############..#######',
  '....#......###########...#######',
  '.#####......##########....######',
  '#######.#...##########....######',
  '##########...##########...######',
  '##########...##########..#######',
  '##########..###########..#######',
  '#########...########...#..####..',
  '#########...#####...............',
  '##########..#####...............',
  '#########....####.......#.......',
  '#########..#..##....#..###.#....',
  '##########..........##########.#',
  '##########........##############',
  '###########.####################',
  '################################',
  '################################',
  '################################',
];
defineMap('venus_forest', {
  name: 'Venus Lighthouse', w: 32, h: 34, base: 'void', music: 'overworld', bg: 'forest', entry: { x: 1, y: 15 }, enc: [['Warrior Bee', 'Warrior Bee'], ['Brigand'], ['Dirty Ape']], retreat: VL_RETREAT,
  build(M) {
    M.paint(0, 0, VF_ROWS, { '.': 'path', 'A': 'marble', 'X': 'path', 's': { ground: 'marble', obj: 'statue' }, 'F': { ground: 'marble', obj: 'fountain' } }, { cliff: '#', set: 'canopy', faces: 1 });
    for (let y = 5; y <= 12; y++) for (let x = 17; x <= 31; x++) if (VF_ROWS[y][x] === '.') M.set(x, y, 'marble');
    M.exit(0, 15, 1, 1, 'world_gs1', 40, 65, DIR.LEFT);
    M.setObj(23, 4, 'door_stone'); M.walkable(23, 4); M.exit(23, 4, 1, 1, 'venus_lh_1', 11, 26, DIR.UP, { door: true });
    M.sign(20, 5, "Venus Lighthouse. 'Let none who are not of the Elemental Clans pass the gate.'");
  }
});
// the front hall: a dead end. The doors at its back are sealed; the party learns the true way is under Babi's tower
const VL1_ROWS = [
  '########################',
  '#......................#',
  '#......................#',
  '#..k................k..#',
  '#......................#',
  '#......................#',
  '#......................#',
  '#..k................k..#',
  '#......................#',
  '#......................#',
  '#......................#',
  '#...################...#',
  '#...#######DD#######...#',
  '#......................#',
  '#......................#',
  '#..k................k..#',
  '#......................#',
  '#......................#',
  '#......P...............#',
  '#......................#',
  '#..k................k..#',
  '#......................#',
  '#......................#',
  '#......................#',
  '#......................#',
  '#......................#',
  '#......................#',
  '###########EE###########',
];
const VL_LEGEND = { '.': 'lh_floor_venus', 'k': { ground: 'lh_floor_venus', obj: 'lh_column' }, 'P': { ground: 'lh_floor_venus', obj: 'psystone' }, 'D': 'lh_floor_venus', 'E': 'lh_floor_venus', 'G': 'lh_floor_venus', 'e': 'elem_venus' };
function vlPaint(M, rows) { M.paint(0, 0, rows, VL_LEGEND, { cliff: '#', set: 'venusrock', top: 'lh_walltop_venus', face: 'lh_wall_venus', mid: 'lh_walltop_venus' }); }
defineMap('venus_lh_1', {
  name: 'Venus Lighthouse', w: 24, h: 28, base: 'void', music: 'lighthouse', bg: 'lighthouse', indoor: true, entry: { x: 11, y: 26 }, enc: VL_ENC, retreat: VL_RETREAT,
  build(M) {
    vlPaint(M, VL1_ROWS);
    M.setObj(11, 27, 'door_stone'); M.setObj(12, 27, 'door_stone'); M.walkable(11, 27, 2, 1); M.exit(11, 27, 2, 1, 'venus_forest', 23, 5, DIR.DOWN, { door: true });
    M.setObj(11, 12, 'door_locked'); M.setObj(12, 12, 'door_locked'); M.block(11, 12, 2, 1);
    // in Jenna's prologue the hall holds the guide's one chest, a Herb; Isaac's loot is his own game's
    if (G.flag('prologue_jenna')) M.chest(18, 9, 'Herb', 1); else { M.chest(3, 14, 'Potion', 1); M.chest(20, 14, 'Mythril Shirt', 1); }
    M.sign(10, 14, "'Dead end. The true entrance to the Venus Lighthouse lies through the Tunnel Ruins below.'");
    M.trigger(11, 13, 2, 1, STORY.venusDeadEnd, { once: 'venus_deadend' });
    if (!G.flag('prologue_jenna')) M.chest(16, 8, 'Psy Crystal', 1, { hidden: true });
    if (G.flag('venus_escape')) { M.encounters = []; M.trigger(10, 26, 4, 1, STORY_TLA.escapeOut); }
  }
});
const VL2_ROWS = [
  '                                        ',
  '                 ######                 ',
  '                 #....#                 ',
  '   ###############....###############   ',
  '   #................................#   ',
  '   #................................#   ',
  '   ################GG################   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  '   #................................#   ',
  ' #################....###############   ',
  ' #..............##....#                 ',
  ' #..............##....#######           ',
  ' #..........................#           ',
  ' #..........................########### ',
  ' #....................................# ',
  ' #....................................# ',
  ' #..............##########............# ',
  ' #..............#        #............# ',
  ' #####....#######        #............# ',
  '     #....#              #............# ',
  '     #....#              #............# ',
  '     #....#              #............# ',
  '     #....#              #............# ',
  '     #....#              #............# ',
  '     #....#              #............# ',
  ' #####....#####          #............# ',
  ' #............#          #............# ',
  ' #............#          #............# ',
  ' #..########..#          #............# ',
  ' #..#.........#          #............# ',
  ' #..#.######..#          #####..####### ',
  ' #..#.#.......#        #######..####### ',
  ' #....#.####..#        #..............# ',
  ' #..#.#....#..##########..............# ',
  ' #..#......#..........................# ',
  ' #..######............................# ',
  ' #....................................# ',
  ' ######.#####.........................# ',
  ' #..........#.##########..............# ',
  ' #............#        #..............# ',
  ' ##############        ################ ',
  '                                        ',
];
defineMap('venus_lh_2', {
  name: 'Venus Lighthouse - Inner', w: 40, h: 58, base: 'void', music: 'lighthouse', bg: 'lighthouse', indoor: true, entry: { x: 36, y: 51 }, enc: [['Grand Golem', 'Recluse'], ['Thunder Lizard'], ['Fenrir'], ['Boulder Beast', 'Boulder Beast'], ['Mimic #3']], retreat: VL_RETREAT,
  build(M) {
    vlPaint(M, VL2_ROWS);
    // in from the Tunnel Ruins on the east wall of the entrance hall
    M.setObj(38, 51, 'door_stone'); M.setObj(38, 52, 'door_stone'); M.walkable(38, 51, 1, 2); M.exit(38, 51, 1, 2, 'tunnel_ruins', 28, 28, DIR.LEFT, { door: true });
    M.trigger(25, 50, 12, 1, STORY.venusInnerEnter, { once: 'venus_inner_entered' });
    // the pillar hall: two pillars pushed north onto the plates raise the gate
    M.set(10, 8, 'elem_venus'); M.set(29, 8, 'elem_venus'); M.object('pillar', 10, 16, { id: 'vp1' }); M.object('pillar', 29, 16, { id: 'vp2' });
    M.object('gate', 19, 6, { id: 'vgate', state: G.flag('venus_gate') ? 'open' : 'closed' }); M.object('gate', 20, 6, { id: 'vgate2', state: G.flag('venus_gate') ? 'open' : 'closed' });
    M.def.onPsy = (name, x, y, F, o) => { if (name === 'Move' && o && (o.id === 'vp1' || o.id === 'vp2')) { const d = F.player.dir; const nx = o.x + DX[d], ny = o.y + DY[d]; if (!G.map.isSolid(nx, ny) && !F.objectAt(nx, ny) && !(F.player.tx === nx && F.player.ty === ny)) { o.x = nx; o.y = ny; G.set('obj:' + o.key, { x: nx, y: ny }); Audio.sfx('push'); const on = (p) => G.map.get(p.x, p.y).name === 'elem_venus'; const a = G.map.objects.find(q => q.id === 'vp1'), b = G.map.objects.find(q => q.id === 'vp2'); if (a && b && on(a) && on(b) && !G.flag('venus_gate')) { G.set('venus_gate'); for (const q of G.map.objects) if (q.kind === 'gate') q.state = 'open'; Audio.sfx('quake'); F.run(function* (E) { yield E.say('The plates sink under the pillars... and the gate at the head of the hall grinds open.'); }); } } return true; } return false; };
    M.setObj(19, 2, 'stairs_up'); M.setObj(20, 2, 'stairs_up'); M.walkable(19, 2, 2, 1); M.exit(19, 2, 2, 1, 'venus_lh_top', 12, 20, DIR.UP, { stairs: true });
    // the treasures of the halls
    M.chest(3, 55, 'Gaia Blade', 1); M.chest(3, 27, 'Thunder Crown', 1); M.chest(27, 31, 'Lucky Cap', 1); M.chest(36, 31, 'Carry Stone', 1);
    M.chest(5, 5, 'Dragon Scales', 1); M.chest(34, 5, 'Water of Life', 1); M.chest(25, 55, 'Psy Crystal', 1);
    M.chest(18, 8, 'Lucky Medal', 2, { hidden: true });
    M.setObj(28, 44, 'psystone');
    for (const [x, y] of [[28, 33], [31, 33], [34, 33], [28, 39], [31, 39], [34, 39]]) M.setObj(x, y, 'statue');
    for (const [x, y] of [[6, 10], [33, 10], [6, 20], [33, 20], [14, 26], [1, 30], [16, 30]]) M.setObj(x, y, 'lh_column');
    M.sign(30, 49, "'The beacon sleeps until the Venus Star is set in its cradle. Seek the pillars and the plates.'");
  }
});
