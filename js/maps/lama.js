// ---------- Lama Temple ----------
// Hama's temple in the autumn wood, traced from the reference rip: the blue-tiled hall on its terrace above the
// cliff, the fall coming down beside it into the river that runs out under the wooden bridge, the Psynergy Stone
// on the ledge below the terrace, the Water of Life across the water, and the road south to the world.
'use strict';

const LAMA_LEGEND = {
  '.': 'grass', ':': 'path', '~': 'water', 'x': 'flowers',
  'W': { ground: 'water', obj: 'waterfall_mid' },
  'B': { ground: 'water', obj: 'bridge_v', walk: true },
  'T': { ground: 'grass', obj: 'tree' },
  'p': { ground: 'grass', obj: 'pot' }, 'l': { ground: 'grass', obj: 'lantern_stone' }, 'S': { ground: 'grass', obj: 'psystone' }, 'c': { ground: 'grass', obj: 'crate' },
};
// 27 x 33; the hall is set over the '.' block at 4..12 rows 2..7
const LAMA_ROWS = [
  '################WW#########',   // 0
  '################WW#########',   // 1
  'TTT............#WW#########',   // 2   the hall 4..12 rows 2..7
  'TTT............#WW#########',   // 3
  'TT.............#WW#########',   // 4
  'TT.............#WW#########',   // 5
  'TT.............#WW.........',   // 6
  'TT.............#~~.........',   // 7
  'TT..p.l...l.p..~~~~........',   // 8   the Water of Life chest at 21,8
  'TT.............~~~~........',   // 9
  'T.....#########.~~.........',   // 10  the terrace's edge; the slope down on the left
  'T.....#########.~~.........',   // 11
  '##.....:::::....~~....TTTTT',   // 12
  '##.....c:::.....~~x...TTTTT',   // 13
  '#...S....:::....~~....TT.TT',   // 14  the Psynergy Stone
  'TT........:::...~~....TTTTT',   // 15
  'TTTT......:::...~~....TTTTT',   // 16
  'TTTT....~~~BBB~~~~....TTTTT',   // 17  the bridge
  'TTTT....~~~BBB~~~.....TTTTT',   // 18
  'TTTTTT.~~~.:::......TTTTTTT',   // 19
  'TTTTTT.~~~.:::......TTTTTTT',   // 20
  'TTTTTT.~~~.:::.....TTTTTTTT',   // 21
  'TTTTTT.~~~.:::....TTTTTTTTT',   // 22
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 23
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 24
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 25
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 26
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 27
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 28
  'TTTTTT.~~~.:::...TTTTTTTTTT',   // 29
  'TTTTTT.~~~.:::..TTTTTTTTTTT',   // 30
  'TTTTTT.~~~.:::..TTTTTTTTTTT',   // 31
  'TTTTTTT~~~T:::TTTTTTTTTTTTT',   // 32
];

defineMap('lama', {
  name: 'Lama Temple', w: 27, h: 33, base: 'grass', music: 'vale', bg: 'world_forest', entry: { x: 12, y: 31 },
  build(M) {
    M.paint(0, 0, LAMA_ROWS, LAMA_LEGEND, { set: 'cliff', faces: 2 });
    M.house(4, 2, 9, 6, 'roof_tile_blue', { wall: 'wall_temple_red', doorTile: 'door_temple_red', windowTile: 'window_temple_red', doorX: 4, to: 'lama_hall', tx: 7, ty: 10 });
    for (const [x, y, red] of [[1, 5, 1], [24, 12, 1], [2, 20, 0], [24, 22, 1], [3, 27, 1], [22, 27, 0], [19, 31, 1], [5, 31, 0]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    M.exit(11, 32, 3, 1, 'world_gs1', 76, 39, DIR.DOWN);
    M.chest(21, 8, 'Water of Life', 1);
    M.npc('lama_monk1', 7, 8, { type: 'monk', text: "Master Hama leads our temple. She sees things others cannot." });
    M.npc('lama_monk2', 12, 14, { type: 'monk', move: 'wander', text: "The Lamakan Desert lies to the west. The mirages there have claimed many travelers. Only Reveal shows the true path." });
    M.npc('lama_monk3', 19, 18, { type: 'monk', text: "We keep the bridge. Nobody crosses it who has not first crossed themselves. That is a saying. It sounds better in the old tongue." });
    M.npc('lama_monk4', 21, 18, { type: 'monk', text: "Beyond the water is the Water of Life. A joke of the elders. It is also true." });
    M.npc('lama_old', 10, 18, { type: 'elder_f', text: "I came up from Kalay to hear Master Hama. Now I cannot face the desert again. The temple is kind to old women." });
  }
});
Kit.interior('lama_hall', { name: 'Lama Temple Hall', w: 14, h: 12, floor: 'floor_tile', wall: 'wall_in_stone', back: { map: 'lama', x: 8, y: 8 }, furn: [['statue', 2, 2], ['statue', 11, 2], ['torch', 5, 1], ['torch', 8, 1], ['carpet', 6, 3, 2, 7]], npcs: [
  { id: 'Hama', x: 6, y: 4, look: NPC_LOOKS.Hama, name: 'Hama', dir: DIR.DOWN, script: function* (E) { if (G.flag('hsu_rescued')) yield* STORY.hamaAfter(E); else yield* STORY.hama(E); }, cond: () => !(G.flag('hama_hsu') && !G.flag('hsu_rescued')) },
  { id: 'lh1', x: 3, y: 8, type: 'monk', text: "Master Hama has waited a long time for someone. She would not say who." }, { id: 'lh2', x: 10, y: 8, type: 'monk', text: "Sit. Breathe. The desert can wait an hour; it has waited a thousand years." }] });
