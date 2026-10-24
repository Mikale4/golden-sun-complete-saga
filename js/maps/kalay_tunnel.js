// ---------- Kalay Tunnel ----------
// The thieves' way under the bluff, from the Kalay rip: a cave mouth in the sea cliffs north of the docks opens on a
// river cavern; beyond it, the old tunnel proper - long mossy corridors walled in pink brick, torch-lit, with the
// water chambers off the crossings where Scorch waits, the thieves' store and their bunk room - and a last door
// that comes out on the plateau above Kalay's fountain pools.
'use strict';

const KT_ENC = [['Rat Fighter', 'Rat Fighter'], ['Rabid Bat', 'Rabid Bat'], ['Armored Rat'], ['Undead', 'Rabid Bat'], ['Ghost Mage']];
const KT_RETREAT = { map: 'world_gs1', x: 49, y: 66, dir: DIR.DOWN };

// a corridor map: everything is wall until carved. cells: '.' floor, '~' water, letters for doors and props
function ktGrid(w, h) { const g = []; for (let j = 0; j < h; j++) g.push(new Array(w).fill('#')); return g; }
function ktCarve(g, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < g[j].length) g[j][i] = ch || '.'; }
const KT_LEGEND = {
  '.': 'kt_floor', ',': 'kt_moss', '~': 'cave_water', 's': 'cave_sand',
  'W': { ground: 'cave_water', obj: 'waterfall_mid' }, 'j': { ground: 'kt_floor', obj: 'pot' }, 'b': { ground: 'kt_floor', obj: 'barrel' }, 'c': { ground: 'kt_floor', obj: 'crate' },
  'S': { ground: 'kt_floor', obj: 'statue' }, 'P': { ground: 'kt_floor', obj: 'psystone' },
};
function ktPaint(M, g, seed) {
  const r = seededRandom(hashStr(seed));
  for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '.' && r() < 0.14) g[j][i] = ',';   // the moss that glows
  M.paint(0, 0, g.map(a => a.join('')), KT_LEGEND, { cliff: '#', set: 'kt', top: 'kt_walltop', face: 'kt_wall', mid: 'kt_walltop' });
}
function ktDoor(M, x, y, to, tx, ty, dir) { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, { door: true }); }
function ktTorch(M, x, y) { M.setObj(x, y, 'torch'); M.light(x, y, 4); }

// ---- the cliffs: the cave mouth above the shore, the ledge with the jar ----
const KTO_LEGEND = {
  '.': 'grass', 'p': 'path', '~': 'water', 'a': 'sand', 'S': 'stairs',
  'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_grass' },
};
const KTO_ROWS = [
  '##########################',   // 0
  '##########################',   // 1
  '##TT.T..........T.TT.T.T##',   // 2   the ledge: the jar with the Nut at 8,3
  '##T........v.......T....##',   // 3
  '##.T..T............S..TT##',   // 4   the stair down through the face
  '###################S######',   // 5
  '###################S######',   // 6
  '~~~#####.........#.S....T#',   // 7   the cave mouth at 12,6 (in the face)
  '~~~~.....p........p....TT#',   // 8
  '~~~~a....p........p.T.T..#',   // 9
  '~~~~~a...ppppppppppp.....#',   // 10
  '~~~~~~a...T........r..T..#',   // 11
  '~~~~~~~a......v.....p..T.#',   // 12
  '~~~~~~~~a.TT........p....#',   // 13
  '~~~~~~~~~a..........p.TT.#',   // 14
  '~~~~~~~~~~a..T......p..T.#',   // 15
  '~~~~~~~~~~~a....v...p....#',   // 16
  '~~~~~~~~~~~~a.TT....p.TT.#',   // 17
  '~~~~~~~~~~~~~aTTTTT.p.TTT#',   // 18
  '~~~~~~~~~~~~~~TTTTT.p.TTT#',   // 19  the way down to the world
];
defineMap('kalay_tunnel', {
  name: 'Kalay Tunnel', w: 26, h: 20, base: 'grass', music: 'vale', bg: 'cliffs', entry: { x: 20, y: 18 },
  build(M) {
    M.paint(0, 0, KTO_ROWS, KTO_LEGEND, { set: 'cliff', faces: 2 });
    for (let j = 7; j < 20; j++) for (let i = 0; i < 26; i++) if (KTO_ROWS[j][i] === '~' && M.inb(i + 1, j) && KTO_ROWS[j][i + 1] !== '~') M.set(i, j, 'shallow');   // the shore
    M.walkable(19, 4, 1, 4); M.set(19, 7, 'stairs');
    ktDoor(M, 12, 6, 'kalay_tunnel_cave', 12, 27, DIR.UP); M.walkable(12, 7);
    M.exit(20, 19, 1, 1, 'world_gs1', 49, 66, DIR.DOWN);
    M.container(8, 3, 'pot', 'Nut', 1);
    M.tall('tree_red_tall', 15, 18);
    M.npc('kt_fisher', 6, 9, { type: 'villager_m', text: "The thieves of Lunpa use that cave to slip into Kalay by night. Master Hammet knows; he lets it be. A merchant likes a back door." });
  }
});

// ---- the river cavern: the sand path up between the water and the rock, Apple off the eastern branch ----
defineMap('kalay_tunnel_cave', {
  name: 'Kalay Tunnel', w: 24, h: 30, base: 'cavewalltop', music: 'dungeon', bg: 'cave', indoor: true, enc: KT_ENC, retreat: KT_RETREAT, entry: { x: 12, y: 27 },
  build(M) {
    const g = ktGrid(24, 30);
    ktCarve(g, 11, 2, 3, 26, 's');                 // the path
    ktCarve(g, 9, 6, 7, 4, 's'); ktCarve(g, 10, 20, 5, 3, 's');   // where it widens
    ktCarve(g, 14, 13, 7, 6, 's');                 // the eastern branch
    ktCarve(g, 5, 5, 4, 21, '~'); ktCarve(g, 9, 11, 2, 3, '~'); ktCarve(g, 9, 24, 2, 2, '~');   // the river, touching the path in two places
    g[4][6] = 'W'; g[4][7] = 'W'; g[5][6] = '~'; g[5][7] = '~';
    g[13][18] = 'P';
    M.paint(0, 0, g.map(a => a.join('')), { '.': 'cave_sand', 's': 'cave_sand', '~': 'cave_water', 'W': { ground: 'cave_water', obj: 'waterfall_mid' }, 'P': { ground: 'cave_sand', obj: 'psystone' } }, { cliff: '#', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' });
    ktDoor(M, 12, 28, 'kalay_tunnel', 12, 7, DIR.DOWN);
    ktDoor(M, 12, 1, 'kalay_tunnel_1', 4, 2, DIR.UP);
    M.chest(19, 16, 'Apple', 1); M.chest(10, 21, 'Antidote', 2);
    for (const [x, y] of [[14, 8], [15, 21], [20, 14]]) M.light(x, y, 3);
  }
});

// ---- the tunnel: the long gallery down from the cavern, the cross-passage with the doors to the thieves' rooms ----
defineMap('kalay_tunnel_1', {
  name: 'Kalay Tunnel', w: 38, h: 40, base: 'kt_walltop', music: 'dungeon', bg: 'cave', indoor: true, enc: KT_ENC, retreat: KT_RETREAT, entry: { x: 4, y: 2 },
  build(M) {
    const g = ktGrid(38, 40);
    ktCarve(g, 2, 2, 6, 35);                       // the gallery
    ktCarve(g, 2, 32, 34, 5);                      // the cross-passage
    ktCarve(g, 10, 26, 4, 6); ktCarve(g, 32, 26, 4, 6);   // the alcoves before the doors
    ktCarve(g, 1, 2, 1, 9, '~'); g[2][1] = 'W';    // the spring that runs down beside the gallery
    ktPaint(M, g, 'kalay_tunnel_1');
    ktDoor(M, 4, 1, 'kalay_tunnel_cave', 12, 2, DIR.DOWN);
    ktDoor(M, 12, 25, 'kalay_tunnel_2', 12, 2, DIR.UP);
    ktDoor(M, 33, 25, 'kalay_tunnel_2', 10, 27, DIR.UP);
    ktDoor(M, 21, 31, 'kalay_tunnel_bunks', 5, 6, DIR.UP);
    for (const [x, y] of [[1, 16], [8, 16], [1, 24], [8, 24], [16, 31], [26, 31], [30, 31], [1, 34], [36, 34]]) ktTorch(M, x, y);
    M.chest(35, 33, 'Smoke Bomb', 2);
    M.npc('kt_thief1', 6, 20, { type: 'pirate', move: 'wander', text: "Who're you? ...Hammet's lot? Fine, fine. We're only passing through. Everyone's only passing through." });
  }
});
Kit.interior('kalay_tunnel_bunks', { name: 'Kalay Tunnel', w: 10, h: 8, floor: 'floor_wood', wall: 'wall_in_stone', back: { map: 'kalay_tunnel_1', x: 21, y: 32 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bed', 7, 2], ['bed_foot', 7, 3], ['table', 4, 3], ['barrel', 8, 5], ['crate', 1, 5]], chests: [[4, 2, 'Elixir', 1]], npcs: [{ id: 'kt_bunk', x: 6, y: 5, type: 'pirate', text: "Don't mind the beds. Don't mind the chest either. ...Ah, you already did." }] });

// ---- the crossings: two passages off the long north-south run, each with a water chamber to the west ----
defineMap('kalay_tunnel_2', {
  name: 'Kalay Tunnel', w: 22, h: 56, base: 'kt_walltop', music: 'dungeon', bg: 'cave', indoor: true, enc: KT_ENC, retreat: KT_RETREAT, entry: { x: 12, y: 2 },
  build(M) {
    const g = ktGrid(22, 56);
    ktCarve(g, 11, 2, 3, 51);                      // the long run
    ktCarve(g, 9, 27, 2, 3);                       // the niche with the second door from the passage
    // the first crossing: the pool chamber with the gloves, the store's door, the thieves' little treasury
    ktCarve(g, 2, 15, 19, 3); ktCarve(g, 2, 18, 7, 6, '~'); g[18][8] = 'W';
    ktCarve(g, 17, 11, 4, 4); ktCarve(g, 17, 18, 4, 7); g[21][17] = 'S';
    // the second crossing: Scorch on the ledge over the water, the statue, the way up to Kalay
    ktCarve(g, 2, 41, 19, 3); ktCarve(g, 2, 44, 7, 6, '~'); g[44][8] = 'W';
    ktCarve(g, 14, 44, 7, 9); g[42][15] = 'S'; g[42][19] = 'S';
    ktPaint(M, g, 'kalay_tunnel_2');
    ktDoor(M, 12, 1, 'kalay_tunnel_1', 12, 26, DIR.DOWN);
    ktDoor(M, 10, 26, 'kalay_tunnel_1', 33, 26, DIR.DOWN);
    ktDoor(M, 19, 10, 'kalay_tunnel_store', 4, 5, DIR.UP);
    ktDoor(M, 18, 53, 'kalay', 27, 24, DIR.DOWN);
    for (const [x, y] of [[10, 8], [14, 8], [1, 14], [16, 14], [21, 14], [10, 22], [14, 22], [10, 34], [14, 34], [1, 40], [16, 40], [21, 40], [21, 50]]) ktTorch(M, x, y);
    // the iron gates Hammet's household keeps locked across the run: the thieves' half (the crossings above) and
    // the palace half (Scorch's crossing and the way up) are cut from each other until the master comes home this way
    for (let x = 11; x <= 13; x++) M.object('gate', x, 36, { id: 'kt_gate_' + x, tile: 'drawgate_bar', state: G.flag('hammet_rescued') ? 'open' : 'shut', script: function* (E) { yield E.say(G.flag('hammet_rescued') ? 'The iron gate stands open. Master Hammet came home this way.' : "An iron gate across the passage, locked from the palace side. Master Hammet's household keeps the key - and the master is not home."); } });
    if (!G.flag('hammet_rescued')) M.sign(10, 37, 'PROPERTY OF THE HOUSE OF HAMMET. NO PASSAGE. (Somebody has scratched a skull over the seal.)');
    M.chest(2, 15, 'Spirit Gloves', 1);
    M.container(19, 19, 'pot', 'Sleep Bomb', 1); M.container(20, 19, 'pot', 'Lucky Medal', 1); M.container(18, 23, 'barrel', 'Coins', 200); M.container(20, 23, 'crate', 'Potion', 1);
    M.djinni('Scorch', 4, 41, { fight: true });
    M.npc('kt_thief2', 12, 30, { type: 'pirate', move: 'wander', text: "Up the passage and out, and you're in Kalay behind the fountains. Handy, that. Don't tell the guards." });
    M.npc('kt_thief3', 16, 46, { type: 'pirate', text: "Dodonpa's men come through here with the master's caravans... I mean, with GOODS. Ordinary goods." });
  }
});
Kit.interior('kalay_tunnel_store', { name: 'Kalay Tunnel', w: 8, h: 7, floor: 'floor_purple', wall: 'wall_in_stone', back: { map: 'kalay_tunnel_2', x: 19, y: 11 }, furn: [['shelf', 1, 2], ['shelf', 2, 2], ['crate', 6, 2], ['barrel', 6, 4], ['barrel', 1, 4]], chests: [[4, 2, 'Nut', 3]] });
