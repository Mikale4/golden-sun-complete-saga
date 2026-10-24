// ---------- Bilibin Cave ----------
// The pass under the mountains between Bilibin and Imil, laid out after map references/golden-sun-bilibin-cave-gba-map.webp
// and the walkthrough: the valley with its waterfall and the two cave mouths (a sprout by the lower one - Growth
// raises a vine to the upper mouth); the mossy lower cave, entered high by the upper mouth beside the Elven Rapier
// with a drop down to the floor, or low by the lower mouth; the little fire in the second room that Douse puts
// out, and the rock face by the Rapier that Reveal shows a way through, to the two chests beyond (Psy Crystal, Water
// of Life); the icy cave beyond, its puddles frozen into stepping pillars across the cracks, the torch that is
// Moved to melt the last pillar, the Vial, and the way out toward Imil.
'use strict';
const BC_ENC = [['Ghoul'], ['Gnome', 'Gnome'], ['Ooze', 'Ooze'], ['Troll']];
const BC_RETREAT = { map: 'world_gs1', x: 68, y: 25, dir: DIR.DOWN };
// ---- the valley ----
const BCX_LEGEND = { '.': 'grass', 'p': 'path', 'w': 'water', 'W': 'waterfall', 'T': { ground: 'grass', obj: 'tree' }, 'R': { ground: 'grass', obj: 'tree_red' }, 'v': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'grass', obj: 'rock_grass' }, 'f': { ground: 'grass', obj: 'flower' }, 'b': 'bridge' };
const BCX_ROWS = [
  '################################',
  '################################',
  '####........####.......#########',
  '####........####.......####..###',
  '####..v................####..###',
  '####........####......f......###',
  '####........#####..........o####',
  '#####.......######...............',
  '######......######wwww##########',
  '######.....o######wwww##########',
  '#######.....######wwww##########',
  '.......######.....wwww.......###',
  '..T...............wwww.......###',
  '..R.f.............wwww..###..###',
  '..................wwww..###..###',
  '..T....v.....p....wwwwp......###',
  '.T.R...T.....p....wwwwp.o....###',
  '.......T.....pp..bbbbbbp.....###',
  '..R...T.T....ppppwwwwppp....o###',
  '....f.T.......pppwwwwpp......###',
  '.......TT.....ppwwwwwwp..T...###',
  '..T.....T.....ppwwwwwwp......###',
  'oo....T..T....ppwwwwwwp....v.###',
  'ooo...T...T...ppwwwwwwp......###',
  'oooo...T..T...ppwwwwwwpp.T...###',
  'ooooo.....T...ppwwwwwwpp.....###',
  'oooooo.......ppppwwwwppp.....###',
  'ooooooo.....pppppwwwwppp....o###',
  'ooooooooo..pppppwwwwwwpp.....###',
  '###############wwwwwwww#########',
  '###############wwwwwwww#########',
  '###############wwwwwwww#########',
];
defineMap('bilibin_cave', {
  name: 'Bilibin Cave', w: 32, h: 32, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 1, y: 11 }, enc: [['Bat II', 'Bat II'], ['Gnome'], ['Ooze', 'Ooze']], retreat: BC_RETREAT,
  build(M) {
    M.paint(0, 0, BCX_ROWS, BCX_LEGEND, { set: 'cliff', faces: 2 });
    for (let y = 8; y <= 10; y++) for (let x = 18; x <= 21; x++) M.set(x, y, 'waterfall');
    M.exit(0, 11, 1, 2, 'world_gs1', 67, 24, DIR.LEFT); M.walkable(0, 11, 1, 2);
    // the two cave mouths: A on the lower field, B up on the terrace
    M.setObj(22, 12, 'door_cave'); M.walkable(22, 12); M.exit(22, 12, 1, 1, 'bilibin_cave_1', 10, 43, DIR.UP, { door: true });
    M.setObj(27, 4, 'door_cave'); M.walkable(27, 4); M.exit(27, 4, 1, 1, 'bilibin_cave_1', 23, 19, DIR.UP, { door: true });
    // the sprout against the terrace's face: Growth makes a vine of it, up to the upper terrace, which runs east along the
    // cliff top to the ledge before mouth B (the ledge must lead somewhere: mouth B is a way out of the cave as well)
    M.object('sprout', 8, 12, { id: 'bc_sprout' });
    M.object('hop', 10, 11, { id: 'bc_ledge', only: DIR.DOWN });   /* the terrace's edge: a jump down to the field (the vine is the only way up) */
    M.sign(14, 15, 'Bilibin Cave. The road to Imil runs under the mountain. A second mouth opens on the terrace above - if you can reach it.');
    M.npc('bc_traveler', 5, 18, { type: 'villager_m', name: 'Traveler', text: () => G.flag('barricade_open') ? "The cave's the only way north to Imil. It gets cold in there - there's ice on the far side, real ice, in summer." : "The lord's barricade has the road shut. I'll wait here till it opens." });
  }
});
// ---- the mossy lower cave ----
const BC1_LEGEND = { '.': 'cave_moss', 'g': 'cave_moss', 'X': 'cave_moss', 'h': 'water_hop' };
const BC1_ROWS = [
  '##########################',
  '###......########....#####',
  '###......#####.......#####',
  '###......####...#....#####',
  '###..#...####.#..#########',
  '####.#...###..#.##########',
  '####.###.#...##.##########',
  '####.###....#....#########',
  '####.###..###....#########',
  '####.###.####....#########',
  '####.###.####.#..#########',
  '####.####.###.#..#########',
  '####.####.###.#..#########',
  '####.....#####...#########',
  '#######.#######.##########',
  '#######.#######.##########',
  '#######.#######.#####.....',
  '#######.#######.#####.....',
  '#######.#######.#####.....',
  '#######.#######.#####....#',
  '#######..........#####h###',
  '#######.......##.#####.###',
  '#######.......##.####...##',
  '#######.......##.####....#',
  '#######.......##.###.....#',
  '#######.......##.........#',
  '#######.......#####......#',
  '########......#####......#',
  '########....#####........#',
  '#########..######........#',
  '#########..######....#####',
  '#########..######....#####',
  '#########..######....#####',
  '#########..######...######',
  '#########..######...######',
  '#########..#####....######',
  '#########..#####...#######',
  '#########..#####...#######',
  '#########..#####...#######',
  '#########..#####...#######',
  '#########..#####...#######',
  '#########..#####...#######',
  '#########..######..#######',
  '#########..######..#######',
  '#########..######..#######',
  '##########################',
];
defineMap('bilibin_cave_1', {
  name: 'Bilibin Cave', w: 26, h: 46, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 10, y: 43 }, enc: BC_ENC, retreat: BC_RETREAT,
  build(M) {
    M.paint(0, 0, BC1_ROWS, BC1_LEGEND, { cliff: '#', set: 'mossrock', faces: 2 });
    // the two mouths from the valley: A at the bottom, B up on the Rapier's ledge
    M.setObj(10, 44, 'door_cave'); M.walkable(10, 44); M.exit(10, 44, 1, 1, 'bilibin_cave', 22, 13, DIR.DOWN, { door: true });
    M.setObj(24, 19, 'door_cave'); M.walkable(24, 19); M.exit(24, 19, 1, 1, 'bilibin_cave', 27, 5, DIR.DOWN, { door: true });   // mouth B opens on the ledge
    M.chest(24, 17, 'Elven Rapier', 1);
    // the second room's little fire: Douse puts it out, and the way on to the icy cave is open
    if (!G.flag('bc_fire1_out')) { M.object('fire', 22, 22, { id: 'bc_fire1', onDouse: function* (E) { G.set('bc_fire1_out'); G.map.walkable(22, 22); G.map.finalize(); yield E.say('The little fire hisses out. The way up to the ledge is clear.'); } }); M.block(22, 22); }
    M.exit(20, 1, 1, 1, 'bilibin_cave_2', 1, 6, DIR.RIGHT); M.walkable(20, 1);
    M.sign(14, 3, "A draught of cold air comes down the passage from the north-east. The icy cave lies that way.");
    // the rock face above the Rapier's ledge: Reveal shows a way through it
    M.hidden.push({ x: 25, y: 15, tile: 'cave_moss' });
    M.walkable(25, 14); M.exit(25, 14, 1, 1, 'bilibin_cave_3', 4, 8, DIR.UP, { cond: () => true });
    M.setObj(25, 14, null); M.set(25, 14, 'cave_moss'); M.block(25, 14);
    M.trigger(25, 15, 1, 1, function* (E) { if (G.flag('bc_hidden_seen')) return; G.set('bc_hidden_seen'); const M2 = G.map; M2.setObj(25, 15, null); M2.walkable(25, 15); M2.walkable(25, 14); M2.hidden = M2.hidden.filter(h => !(h.x === 25 && h.y === 15)); M2.finalize(); yield E.say('The rock face is only a curtain of moss over an opening - a passage climbs north behind it.'); });
    if (G.flag('bc_hidden_seen')) { M.setObj(25, 15, null); M.walkable(25, 15); M.walkable(25, 14); M.hidden = M.hidden.filter(h => !(h.x === 25 && h.y === 15)); }
    M.sign(21, 16, "An odd formation in the rock face to the north, above the chest. As if the moss hid something.");
  }
});
// ---- the chests behind the hidden way: a little fire, then the Psy Crystal and the Water of Life ----
const BC3_ROWS = [
  '#########',
  '#.......#',   // 1
  '#.......#',
  '#..#.#..#',   // 3
  '#..#.#..#',
  '#..#.#..#',   // 5
  '#..#.#..#',
  '#..#.#..#',   // 7
  '#..#.#..#',
  '#########',   // 9
];
defineMap('bilibin_cave_3', {
  name: 'Bilibin Cave', w: 9, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 4, y: 8 }, enc: BC_ENC, retreat: BC_RETREAT,
  build(M) {
    M.paint(0, 0, BC3_ROWS, BC1_LEGEND, { cliff: '#', set: 'mossrock', faces: 2 });
    M.walkable(4, 9); M.set(4, 9, 'cave_moss'); M.setObj(4, 9, null); M.exit(4, 9, 1, 1, 'bilibin_cave_1', 25, 16, DIR.DOWN);
    if (!G.flag('bc_fire2_out')) { M.object('fire', 4, 3, { id: 'bc_fire2', onDouse: function* (E) { G.set('bc_fire2_out'); G.map.walkable(4, 3); G.map.finalize(); yield E.say('The fire goes out. The chests beyond are yours.'); } }); M.block(4, 3); }
    M.chest(1, 1, 'Psy Crystal', 1); M.chest(7, 1, 'Water of Life', 1);
  }
});
// ---- the icy cave: puddles to freeze across the cracks, a torch to move, the Vial, and Imil beyond ----
const BC2_LEGEND = { '.': 'cave', 'c': 'chasm', 'P': 'puddle_gap', 'i': 'cave' };
const BC2_ROWS = [
  '##############################',
  '#.......c..c.........#.......#',   // 1   the west room, two cracks (x8, x11) with puddles at row 3, room C, the doorway at 21,4, room D
  '#.......c..c.........#.......#',
  '#.......P..P.........#.......#',   // 3   the puddles: Frost raises a pillar over each crack
  '#.......c..c.........i.......#',   // 4   the doorway east, shut with old ice
  '#.......c..c.........#.......#',   // 5
  '#.......c..c.........#.......#',
  '#.......c..c.........#.......#',   // 7
  '##############################',
];
defineMap('bilibin_cave_2', {
  name: 'Bilibin Cave', w: 30, h: 9, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 1, y: 6 }, enc: BC_ENC, retreat: BC_RETREAT,
  build(M) {
    M.paint(0, 0, BC2_ROWS, BC2_LEGEND, { cliff: '#', set: 'greyrock', faces: 2 });
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if (BC2_ROWS[y][x] === 'c') M.block(x, y);
    M.walkable(0, 6); M.set(0, 6, 'cave'); M.setObj(0, 6, null); M.exit(0, 6, 1, 1, 'bilibin_cave_1', 20, 2, DIR.LEFT);
    // pillars of ice stand in the cracks, and the party steps across on them
    M.object('icepillar', 8, 3, { id: 'bc_pillar_a', state: 'ice' }); M.object('icepillar', 11, 3, { id: 'bc_pillar_b', state: 'ice' });   // old ice standing in the cracks: stepping stones
    // the doorway east is frozen shut: old ice that the torch, moved down and right to stand by it, melts
    if (!G.flag('bc_ice_melted')) M.object('block', 21, 4, { id: 'bc_ice_last', tile: 'icepillar' }); else M.walkable(21, 4);
    M.object('statue_move', 19, 2, { id: 'bc_torch', tile: 'torch', onMove: function* (E) { const o = G.map.objects.find(ob => ob.id === 'bc_torch'); const ice = G.map.objects.find(ob => ob.id === 'bc_ice_last'); if (!o || !ice || ice.gone) return; if (Math.max(Math.abs(o.x - ice.x), Math.abs(o.y - ice.y)) === 1) { ice.gone = true; G.set('obj:' + ice.key, { gone: true }); G.set('bc_ice_melted'); Audio.sfx('heal'); yield E.say('The old ice in the doorway runs to water beside the torch. The way east is open.'); } } });
    M.chest(27, 2, 'Vial', 1);
    // out toward Imil: the far mouth on the mountain's north side
    M.walkable(29, 4); M.set(29, 4, 'cave'); M.setObj(29, 4, null); M.exit(29, 4, 1, 1, 'world_gs1', 74, 18, DIR.RIGHT);
    M.sign(2, 2, "The cave breathes cold here. Cracks split the floor, and old ice stands in them like posts - enough to step across on.");
  }
});
