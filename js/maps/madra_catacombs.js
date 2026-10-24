// ---------- Madra Catacombs ----------
// Under the town, after the rip (map references/golden-sun-the-lost-age-mandra-and-mandra-catacombs-gba-map.webp,
// the panels left of and below the town): three tan caves joined by narrow passages, the deserted subterranean
// village in its great cavern - a sand floor between the roofless stone houses of a town older than Madra, walked
// along the tops of its walls - and the broken temple in the cavern's west wall, three floors of it, with the
// Tremor Bit at the bottom, the Ruin Key that falls through from the floor above, and Moloch's tablet behind the
// red door. Two ways down from the town: the watch's ladder by the inn (into the first cave), and the doorway under
// the rock behind the graves (into the far cave), which the town fills in once the party has gone on to Osenia.
// The guide's route: from the graves, two caves and a ladder to the village's high ledge, Move the pillar, the
// door in the wall, down to the bottom floor, up one room: the Tremor Bit. From the town ladder, later, with
// Reveal and Frost: the lower level, the temple's main door, the hidden button, the town; Frost across the water
// for the Apple, the two pillars up onto the walls, the rope to the upper floor, Tremor on the bookshelf, the
// Lucky Medal round the gallery; the Mist Potion down the ladder, the slide, the Ruin Key where it fell, the red
// door below and the tablet.
'use strict';
{
  const T3 = STORY_TLA;
  const CAT_ENC = [['Rat II', 'Rat II'], ['Rat Soldier II'], ['Drone Bee II', 'Drone Bee II'], ['Mini-Goblin', 'Mini-Goblin'], ['Troll II']];
  // a grid of one character, filled by rectangles
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  // tan cave walls: the picture's sand cliffs
  const SAND = { cliff: '#', set: 'sandcliff', faces: 1 };
  const CAVE_LEGEND = { '.': 'cave_sand', 'L': { ground: 'cave_sand', obj: 'ladder', walk: true }, 'D': { ground: 'cave_sand', obj: 'door_cave', walk: true }, 'x': { ground: 'cave_sand', obj: 'rock_sand' }, 'm': 'cave_moss', 's': 'cave_pebbles' };

  // ======================= THE CAVES =======================
  // Cave A: under the watch's ladder. The floor runs down the west side to the doorway out to the village's lower
  // level; the ledge on the east, reached by its ladder, has the doorway up to cave C.
  const A = grid(18, 22, '#');
  fill(A, 3, 2, 8, 18, '.'); fill(A, 1, 4, 2, 6, '.'); fill(A, 9, 15, 15, 18, '.'); fill(A, 10, 7, 15, 13, '.');
  A[1][5] = 'L'; A[5][0] = 'D'; A[6][12] = 'D'; A[14][12] = 'L'; A[10][4] = 'x'; A[16][7] = 'x'; A[12][14] = 'x'; A[17][11] = 's'; A[3][6] = 's';
  defineMap('madra_cave_a', {
    name: 'Madra Catacombs', w: 18, h: 22, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 5, y: 2 }, enc: CAT_ENC, retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(A), CAVE_LEGEND, SAND);
      M.exit(5, 1, 1, 1, 'madra', 33, 11, DIR.DOWN, { stairs: true });                 // the ladder up to the town
      M.exit(0, 5, 1, 1, 'madra_village', 44, 31, DIR.LEFT, { door: true });          // out to the village's lower level
      M.exit(12, 6, 1, 1, 'madra_cave_c', 7, 7, DIR.UP, { door: true });              // up from the ledge to cave C
      M.sign(2, 8, 'Scratched into the rock: "The old town lies below. Let it lie."');
    }
  });
  // Cave C: the far cave, under the graves. Its bottom doorway drops to cave A's ledge, its top-left leads on to cave B.
  const C = grid(16, 10, '#');
  fill(C, 2, 2, 13, 7, '.'); C[1][13] = 'D'; C[1][2] = 'D'; C[8][7] = 'D'; C[4][6] = 'x'; C[6][10] = 'x'; C[3][9] = 's';
  defineMap('madra_cave_c', {
    name: 'Madra Catacombs', w: 16, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 13, y: 2 }, enc: CAT_ENC, retreat: { map: 'madra', x: 46, y: 11, dir: DIR.DOWN },
    build(M) {
      M.exit(13, 1, 1, 1, 'madra', 46, 11, DIR.DOWN, { door: true });                 // back up behind the graves
      M.exit(2, 1, 1, 1, 'madra_cave_b', 11, 24, DIR.UP, { door: true });
      M.exit(7, 8, 1, 1, 'madra_cave_a', 12, 7, DIR.DOWN, { door: true });
      M.paint(0, 0, strs(C), CAVE_LEGEND, SAND);
                                                               // the guide's Nut, in the catacombs
    }
  });
  // Cave B: the upper path. The passage climbs the east side to the high gallery; the ladder at its west end goes
  // down into the pocket whose doorway opens on the village's ledge.
  const B = grid(16, 26, '#');
  fill(B, 10, 8, 12, 24, '.'); fill(B, 2, 2, 13, 5, '.'); fill(B, 10, 6, 12, 7, '.'); fill(B, 1, 7, 6, 10, '.'); B[6][4] = 'L'; B[25][11] = 'D'; B[8][0] = 'D';
  B[3][7] = 'x'; B[12][11] = 'x'; B[19][10] = 's'; B[9][3] = 's'; B[4][12] = 'm';
  defineMap('madra_cave_b', {
    name: 'Madra Catacombs', w: 16, h: 26, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 11, y: 24 }, enc: CAT_ENC, retreat: { map: 'madra', x: 46, y: 11, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(B), CAVE_LEGEND, SAND);
      M.exit(11, 25, 1, 1, 'madra_cave_c', 2, 2, DIR.DOWN, { door: true });
      M.exit(0, 8, 1, 1, 'madra_village', 44, 2, DIR.LEFT, { door: true });          // the up-left passageway: out onto the village's ledge
    }
  });

  // ======================= THE DESERTED VILLAGE =======================
  // 46 x 36. The ledge along the north (rows 2-3) with the pillar across it and the temple's side door at its west
  // end; the main floor below with the roofless houses, walked along their wall tops; the water for Frost and the
  // Apple beyond it; the ladder down to the shelf with the Mist Potion and the slide to the lower level, where the
  // temple's main door and the way out to cave A are.
  const V = grid(46, 36, '#');
  fill(V, 5, 2, 44, 3, '.'); V[3][30] = 'p';                                           // the ledge, the gap beside the pillar's place
  fill(V, 5, 5, 44, 25, '.');                                                           // the main floor
  fill(V, 36, 27, 44, 28, '.');                                                         // the shelf
  fill(V, 5, 30, 44, 33, '.');                                                          // the lower level
  // the great house: a raised floor ringed by its wall tops, the two gaps in the ring where a pillar can be sunk
  fill(V, 13, 9, 27, 21, 'W'); fill(V, 14, 10, 26, 20, 'w'); V[9][20] = 'p'; V[15][27] = 'p';
  // the bridge of wall top west to the temple's upper door, its collapsed span
  fill(V, 6, 9, 12, 11, 'W'); fill(V, 6, 10, 13, 10, 'w'); fill(V, 9, 10, 11, 10, 'p'); V[9][5] = 'W'; V[11][5] = 'W';   // the door at its end is reached along it and no other way
  // a second house, fallen in, and a third: decoration
  fill(V, 31, 18, 40, 24, 'W'); fill(V, 32, 19, 39, 23, 'r'); fill(V, 34, 20, 36, 22, 'm');
  fill(V, 6, 14, 10, 19, 'W'); fill(V, 7, 15, 9, 18, 'r'); V[16][8] = 'm';
  // the water across the east, the Apple's pocket beyond it
  fill(V, 36, 11, 36, 15, 'c'); fill(V, 37, 11, 40, 15, '.'); fill(V, 37, 10, 41, 10, '#'); fill(V, 41, 10, 41, 16, '#'); fill(V, 37, 16, 41, 16, '#'); fill(V, 35, 10, 35, 10, '#'); fill(V, 35, 16, 35, 16, '#');
  // the ladder down to the shelf, the slide off the shelf
  V[26][42] = 'L'; V[28][37] = 'S';
  // doorways: the temple's side door on the ledge, its back door on the main floor, its main door on the lower level;
  // the caves at the ledge's east end and the lower level's east end
  V[2][4] = 'D'; V[12][4] = 'D'; V[31][4] = 'D'; V[10][5] = 'D'; V[2][45] = 'D'; V[31][45] = 'D';
  // rocks and moss
  for (const [x, y] of [[8, 6], [30, 7], [33, 13], [12, 23], [22, 24], [40, 6], [29, 26], [8, 32], [20, 31], [38, 33], [43, 5]]) V[y][x] = 'x';
  for (const [x, y] of [[10, 22], [31, 9], [16, 24], [42, 20], [7, 12]]) V[y][x] = 'm';
  const V_LEGEND = Object.assign({}, CAVE_LEGEND, {
    'w': { ground: 'ruins_floor', obj: null, walk: true }, 'W': { ground: 'cave_sand', obj: 'ruins_walltop' }, 'r': 'ruins_floor', 'p': 'pit', 'c': 'water',
    'S': { ground: 'cb_slide' }, 'L': { ground: 'cave_sand', obj: 'ladder', walk: true }
  });
  defineMap('madra_village', {
    name: 'Deserted Village', w: 46, h: 36, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 44, y: 31 }, enc: CAT_ENC, retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(V), V_LEGEND, SAND);
      M.def.fall = () => ({ map: 'madra_village', x: 37, y: 31 });                       // the slide lands on the lower level
      // the ledge: the pillar across it, sunk into the gap beside it with Move
      M.object('pillar', 30, 2, { id: 'mv_ledge_pillar' });
      // the great house: the pillars that become its steps, north and east
      M.object('pillar', 20, 7, { id: 'mv_pillar_n' }); M.object('pillar', 29, 15, { id: 'mv_pillar_e' });
      // the rope across the fallen span of the bridge
      M.object('rope', 12, 10, { id: 'mv_rope', len: 4, dx: -1, dy: 0 });
      // the water, and the Apple beyond it
      M.object('puddle', 36, 13, { id: 'mv_puddle' }); M.chest(39, 13, 'Apple', 1);
      // the shelf's chest
      M.chest(43, 28, 'Mist Potion', 1);
      // the doors
      M.exit(4, 2, 1, 1, 'madra_ruins_1', 2, 6, DIR.DOWN, { door: true });
      M.exit(4, 12, 1, 1, 'madra_ruins_1', 12, 1, DIR.DOWN, { door: true });
      M.exit(4, 31, 1, 1, 'madra_ruins_1', 12, 15, DIR.UP, { door: true });
      M.exit(5, 10, 1, 1, 'madra_ruins_up', 12, 12, DIR.UP, { door: true });
      M.exit(45, 2, 1, 1, 'madra_cave_b', 1, 8, DIR.RIGHT, { door: true });
      M.exit(45, 31, 1, 1, 'madra_cave_a', 1, 5, DIR.RIGHT, { door: true });
      M.sign(24, 6, 'A stone tablet, worn nearly smooth: "...the sea rose, and we went down into the earth, and built again..."');
      M.sign(38, 31, 'A broken signpost. The carving might once have been an arrow, pointing west.');
    }
  });

  // ======================= THE BROKEN TEMPLE =======================
  const RUIN = { floor: 'ruins_floor', wall: 'ruins_wall', top: 'ruins_walltop' };
  const ruin = (M, x, y, w, h) => M.cave(x, y, w, h, RUIN.floor, RUIN.wall, RUIN.top);
  // the ground floor: the main hall, its closed doorway north to the back room and the town beyond, the side rooms
  // with their stairs down; the side door from the village ledge
  defineMap('madra_ruins_1', {
    name: 'Broken Temple', w: 24, h: 18, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 15 }, retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      ruin(M, 0, 5, 7, 12); ruin(M, 17, 5, 7, 12); ruin(M, 6, 5, 12, 12); ruin(M, 9, 0, 6, 7);
      M.fill(11, 7, 2, 9, 'carpet_red'); M.fill(8, 10, 8, 2, 'carpet_red');
      M.open(6, 10); M.open(17, 10); M.open(12, 16); M.open(12, 5, 1, 2); M.open(12, 0, 1, 2); M.open(2, 5, 1, 2);
      M.fill(12, 5, 1, 2, 'ruins_floor'); M.fill(12, 0, 1, 2, 'ruins_floor'); M.fill(2, 5, 1, 2, 'ruins_floor');
      M.walkable(12, 5, 1, 2); M.walkable(12, 0, 1, 2); M.walkable(2, 5, 1, 2);
      for (const [x, y] of [[8, 7], [15, 7], [1, 7], [5, 7], [18, 7], [22, 7]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      M.setObj(2, 14, 'stairs_down'); M.walkable(2, 14); M.exit(2, 14, 1, 1, 'madra_ruins_b1', 2, 4, DIR.DOWN, { stairs: true });
      M.setObj(21, 14, 'stairs_down'); M.walkable(21, 14); M.exit(21, 14, 1, 1, 'madra_ruins_b1', 21, 4, DIR.DOWN, { stairs: true });
      M.exit(12, 16, 1, 1, 'madra_village', 5, 31, DIR.RIGHT, { door: true });         // the main door, onto the lower level
      M.exit(12, 0, 1, 1, 'madra_village', 5, 12, DIR.RIGHT, { door: true });          // the back door, onto the main floor
      M.exit(2, 5, 1, 1, 'madra_village', 5, 2, DIR.RIGHT, { door: true });            // the side door, onto the ledge
      // the closed doorway: a slab of stone, until the button beside it - which only Reveal shows - is pressed
      const open = G.flag('madra_ruins_door');
      M.object('gate', 12, 6, { id: 'mr_slab', state: open ? 'open' : 'shut', tile: 'gate_stone', openTile: null, script: open ? null : function* (E) { yield E.say('A slab of stone fills the doorway. It does not move. The wall beside it is blank... or looks it.'); } });
      if (open) M.walkable(12, 6); else M.block(12, 6);
      M.object('lever', 14, 6, { id: 'mr_button', hiddenUntilReveal: true, tile: 'lh_switch', onPull: function* (E) {
        if (G.flag('madra_ruins_door')) { yield E.say('The button is pressed in. The doorway stands open.'); return; }
        yield E.say('A push button, set into the stone where Reveal showed it. Felix presses it.'); Audio.sfx('push'); Engine.doShake(12); G.set('madra_ruins_door');
        const g = G.field.objectAt(12, 6); if (g) g.state = 'open'; G.field.map.walkable(12, 6); G.field.map.finalize();
        yield E.say('The slab grinds aside. Beyond it, the way runs on toward the old town.');
      } });
      // the chest that fell through from the floor above
      if (G.flag('madra_shelf_shaken')) M.chest(10, 3, 'Ruin Key', 1);
      M.sign(15, 3, G.flag('madra_shelf_shaken') ? 'Splintered boards and dust: something came through the ceiling here.' : 'The ceiling here is rotten boards, sagging. Something heavy rests on them from above.');
    }
  });
  // the upper floor: the rope's door in the south; the hall with the bookshelf; the gallery round it, entered by the
  // door in the back left, with the red chest at the end of its far side
  defineMap('madra_ruins_up', {
    name: 'Broken Temple - Upper Floor', w: 24, h: 14, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 12 }, retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      ruin(M, 0, 0, 24, 14); ruin(M, 5, 3, 14, 9);
      M.open(12, 11); M.open(6, 3, 1, 2); M.fill(6, 3, 1, 2, 'ruins_floor'); M.walkable(6, 3, 1, 2);
      M.open(12, 13); M.fill(12, 13, 1, 1, 'ruins_floor'); M.walkable(12, 13); M.exit(12, 13, 1, 1, 'madra_village', 6, 10, DIR.RIGHT, { door: true });
      // the south gallery is cut off either side of the door: the way round is the long way
      M.setObj(10, 12, 'ruins_walltop'); M.block(10, 12); M.setObj(14, 12, 'ruins_walltop'); M.block(14, 12);
      M.fill(11, 5, 2, 6, 'carpet_red');
      for (const [x, y] of [[7, 5], [16, 5]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      M.setObj(8, 5, 'bookshelf'); M.setObj(15, 5, 'bookshelf'); M.setObj(9, 5, 'shelf'); M.setObj(14, 5, 'shelf');
      // the bookshelf over the rotten floor: Tremor sends what is on it through
      if (!G.flag('madra_shelf_shaken')) M.object('shakeable', 12, 5, { id: 'mr_shelf', tile: 'bookshelf', onShake: function* (E) {
        G.set('madra_shelf_shaken'); yield E.say('The bookshelf shudders - and the chest on top of it tips off, and goes straight through the rotten boards behind it with a crash.');
        yield E.say("It's fallen through to the floor below.", 'Sheba');
      } }); else M.setObj(12, 5, 'bookshelf');
      M.chest(2, 12, 'Lucky Medal', 1);
      M.sign(21, 12, 'The gallery ends in rubble.');
    }
  });
  // the first floor down: the two stairs up, the red door north with Moloch behind it, the stair on down
  defineMap('madra_ruins_b1', {
    name: 'Broken Temple - Below', w: 24, h: 14, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 10 }, enc: [['Rat II', 'Rat II'], ['Mini-Goblin', 'Mini-Goblin'], ['Troll II']], retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      ruin(M, 0, 0, 24, 14);
      M.setObj(2, 3, 'stairs_up'); M.walkable(2, 3); M.exit(2, 3, 1, 1, 'madra_ruins_1', 2, 13, DIR.UP, { stairs: true });
      M.setObj(21, 3, 'stairs_up'); M.walkable(21, 3); M.exit(21, 3, 1, 1, 'madra_ruins_1', 21, 13, DIR.UP, { stairs: true });
      M.setObj(12, 11, 'stairs_down'); M.walkable(12, 11); M.exit(12, 11, 1, 1, 'madra_ruins_b2', 8, 15, DIR.DOWN, { stairs: true });
      for (const [x, y] of [[9, 2], [15, 2], [5, 2], [19, 2]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      M.fill(11, 3, 2, 8, 'carpet_red');
      // the red door: the Ruin Key opens it
      M.open(12, 1); M.fill(12, 1, 1, 1, 'ruins_floor'); M.walkable(12, 1); M.exit(12, 1, 1, 1, 'madra_ruins_tablet', 6, 8, DIR.UP, { door: true });
      const open = G.flag('madra_ruin_door');
      M.object('gate', 12, 2, { id: 'mr_reddoor', state: open ? 'open' : 'shut', tile: 'door_temple_red', openTile: null, script: open ? null : function* (E) {
        if (!G.inventory.has('Ruin Key')) { yield E.say('A great door of red-lacquered iron, locked. The keyhole is the size of a fist.'); return; }
        yield E.say('The Ruin Key turns in the lock with a sound like a bell.'); G.inventory.remove('Ruin Key'); G.set('madra_ruin_door'); Audio.sfx('push');
        const g = G.field.objectAt(12, 2); if (g) g.state = 'open'; G.field.map.walkable(12, 2); G.field.map.finalize();
        yield E.say('The red door swings wide.');
      } });
      if (open) M.walkable(12, 2); else M.block(12, 2);
      M.sign(4, 10, 'Scratched into the floor: "the tablet keeps the fire, the fire keeps the tablet".');
    }
  });
  // Moloch's chamber: the tablet on its dais, the braziers that light when it is taken up
  defineMap('madra_ruins_tablet', {
    name: 'Broken Temple - Shrine', w: 12, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 6, y: 8 }, retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      ruin(M, 0, 0, 12, 10); M.open(6, 9); M.fill(6, 9, 1, 1, 'ruins_floor'); M.walkable(6, 9); M.exit(6, 9, 1, 1, 'madra_ruins_b1', 12, 3, DIR.DOWN, { door: true });
      M.fill(4, 2, 4, 3, 'marble'); M.fill(6, 5, 1, 4, 'carpet_red');
      const lit = G.flag('moloch_taken');
      for (const [x, y] of [[3, 2], [8, 2]]) { M.setObj(x, y, lit ? 'torch' : 'lantern_stone'); if (lit) M.light(x, y, 4); }
      M.object('statue', 6, 2, { id: 'moloch_tablet', tile: lit ? 'statue_gold' : 'psystone', script: T3.molochTablet });
    }
  });
  // the bottom floor, and the room above it with the Tremor Bit
  defineMap('madra_ruins_b2', {
    name: 'Broken Temple - Bottom', w: 16, h: 18, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 8, y: 15 }, enc: [['Rat Soldier II'], ['Drone Bee II', 'Drone Bee II']], retreat: { map: 'madra', x: 33, y: 11, dir: DIR.DOWN },
    build(M) {
      ruin(M, 0, 0, 16, 18); M.fillObj(1, 7, 14, 1, 'ruins_walltop'); M.fillObj(1, 8, 14, 1, 'ruins_wall'); M.open(8, 7, 1, 2); M.walkable(8, 7, 1, 2);
      M.setObj(8, 16, 'stairs_up'); M.walkable(8, 16); M.exit(8, 16, 1, 1, 'madra_ruins_b1', 12, 10, DIR.UP, { stairs: true });
      for (const [x, y] of [[3, 9], [12, 9], [5, 2], [10, 2]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      M.chest(8, 3, 'Tremor Bit', 1);
      M.scatter(1, 9, 14, 7, 'cave_pebbles', 0.08, 3);
      M.sign(2, 15, 'Water has stood in here, once. The walls are stained to shoulder height.');
    }
  });
  // the market's storerooms: the two doorways in the pocket's face open on the stall-keepers' stock
  defineMap('madra_store', {
    name: "Madra - Stall Keepers' Store", w: 14, h: 8, base: 'void', music: 'town', bg: 'cave', indoor: true, entry: { x: 3, y: 6 },
    build(M) {
      M.cave(0, 0, 6, 8); M.cave(7, 0, 7, 8); M.fill(1, 2, 4, 5, 'grass'); M.fill(8, 2, 5, 5, 'grass'); M.fill(2, 3, 2, 2, 'carpet_red'); M.fill(9, 3, 3, 2, 'carpet_red');
      M.open(3, 7); M.fill(3, 7, 1, 1, 'grass'); M.walkable(3, 7); M.exit(3, 7, 1, 1, 'madra', 17, 6, DIR.DOWN, { door: true });
      M.open(10, 7); M.fill(10, 7, 1, 1, 'grass'); M.walkable(10, 7); M.exit(10, 7, 1, 1, 'madra', 20, 6, DIR.DOWN, { door: true });
      for (const [x, y] of [[1, 2], [4, 2], [8, 2], [12, 2], [12, 5]]) M.setObj(x, y, 'crate'); for (const [x, y] of [[1, 5], [8, 5]]) M.setObj(x, y, 'barrel');
      M.npc('store_boy', 11, 4, { type: 'child_m', name: 'Boy', text: "This is where the stalls keep their stock. Don't touch anything, the smith counts it every night." });
      M.sign(4, 5, 'Crates of ironware, bolts of Osenian cloth, a sack of nuts. Stock, all of it, and none of it for sale from here.');
    }
  });
  // ---- the tablet ----
  T3.molochTablet = function* (E) {
    if (G.flag('moloch_taken')) { yield E.say('The dais is empty. The braziers burn on with a light that needs no fuel.'); return; }
    yield E.say('A stone tablet stands on the dais, carved with a horned figure wreathed in water. It is warm to the touch.');
    G.set('moloch_taken'); Engine.doFlash(14, '#e0f0ff'); Audio.sfx('summon');
    yield E.summon('Moloch');
    yield E.say('The braziers either side of the dais burst into flame.'); yield E.say("Moloch... A summon of Mercury and Jupiter. The old town kept this a long time.", 'Sheba');
    const M = G.field.map; for (const [x, y] of [[3, 2], [8, 2]]) { M.setObj(x, y, 'torch'); M.light(x, y, 4); } M.finalize();
    const o = G.field.objectAt(6, 2); if (o) o.tile = 'statue_gold';
  };
}
