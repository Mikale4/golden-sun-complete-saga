// ---------- Aqua Rock ----------
// After map references/golden-sun-the-lost-age-aqua-rock-gba-map.webp (the mountain of blue rock streaming with water,
// and the thirty-odd blue-lit halls inside it), condensed to an exterior of three ledges and thirteen halls inside.
// Per the guide - outside: the five moai at the foot (gone once Apojii's Aqua Stone is doused), the climb up the wet
// rock, the two red moai whose streams wash the party back down (the pillar over the left one's stream, Move on the
// right one), the Nut, the dried moai that Douse sets pouring (its stream carries the party down to the water stone
// that turns it round to carry them up), the Elixir, the little blue rocks pushed into the channel for footing, the
// Oil Drop, the three puddles Frost bridges (two more behind them for the Mist Sabre), the tear rock at the door.
// Inside: the yellow tiles, the two vents and their pillars for the Vial, the moai that lowers the water and the
// Crystal Powder, the water stone and the vents again, the pillar puzzle and the moai + aqua stone, the waterfall hall
// and the Tear Stone, the blue rock on the tiles for the Water of Life, the pillars into their gaps, the tightrope and
// the three-pillar puzzle, the Mimic, the Psynergy stone, the Lucky Pepper and Aquarius Stone, the column that takes
// it and the Parch tablet, the Rusty Sword under the water, and Steam behind the stream Parch stops.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC_OUT = [['Faery', 'Faery'], ["Man o' War"], ['Roc'], ['Virago']];
  const ENC_IN = [['Faery', 'Faery'], ['Ghost Mage II'], ['Lizard Fighter II'], ["Man o' War II"], ['Roc'], ['Sea Dragon'], ['Virago II']];
  const WORLD = { map: 'world_tla', x: 285, y: 177, dir: DIR.DOWN };
  const LEG = {
    '.': 'ar_floor', 'w': 'water', 'W': 'wfall_climb', 's': 'stream', 'p': 'pit', 'x': 'chasm', 'y': 'ar_hop', 'k': 'ar_dark', 'S': 'water_drop', 'd': 'dirt', 'g': 'grass',
    'D': { ground: 'ar_floor', obj: 'lc_door' }, 'L': { ground: 'ar_floor', obj: 'ladder', walk: true }, 'r': { ground: 'ar_floor', obj: 'rock_small' }, 'b': { ground: 'grass', obj: 'bush' }, 't': { ground: 'grass', obj: 'palm' }, 'T': { ground: 'ar_floor', obj: 'ropeh', walk: true }
  };
  const ROCK = { cliff: '#', set: 'greyrock', faces: 2 };
  const stream = (M, id, x, y, to, opts) => M.object('updraft', x, y, Object.assign({ id, to, tile: 'stream', onTile: 'stream', passable: true }, opts || {}));
  const moai = (M, id, x, y, opts) => M.object('pillar', x, y, Object.assign({ id, tile: 'moai', wetTile: 'moai_wet', douseable: true, parchable: true }, opts || {}));
  const bluerock = (M, id, x, y) => M.object('pillar', x, y, { id, tile: 'rock_blue', sinkTile: 'stepstone' });
  // ====================== the exterior ======================
  const X = grid(44, 40, '#');
  // band A: the foot of the mountain (rows 30..38), the ring of moai across row 29, the lower slope above it (24..28)
  fill(X, 2, 30, 41, 38, '.'); fill(X, 20, 39, 23, 39, '.'); fill(X, 0, 36, 1, 38, 'w'); fill(X, 42, 36, 43, 38, 'w');
  for (const x of [18, 20, 22, 24, 26]) X[29][x] = '.';
  fill(X, 2, 24, 41, 28, '.');
  fill(X, 8, 25, 8, 28, 's'); fill(X, 30, 18, 30, 23, 's');   // the pool's outflow down the slope; the dried moai's channel down the cliff
  fill(X, 6, 18, 6, 23, 'W');   // the first climb: the wet face up to band B
  // band B (rows 12..17): the two red moai on the top row and their streams, the dried moai at the east end
  fill(X, 4, 12, 40, 17, '.');
  fill(X, 14, 13, 14, 17, 's'); fill(X, 24, 13, 24, 17, 's');
  fill(X, 38, 6, 38, 11, 'W');   // the second climb, up to the summit shelf
  // band C (rows 3..7): the channel with the blue rocks, the three puddles over the gap, the tear rock and the door
  fill(X, 4, 4, 40, 7, '.');
  fill(X, 31, 3, 31, 7, 'w'); X[3][31] = '.';   // the channel across the shelf, a rock's width
  fill(X, 21, 4, 21, 7, 'x'); X[5][20] = 'x'; X[5][19] = 'x';   // the gap: a column across the shelf, and its one row of three puddles
  fill(X, 18, 2, 18, 3, 'x'); X[1][18] = '.'; X[0][18] = '.';   // the two puddles 'in the back', up to the Mist Sabre's ledge
  X[3][10] = 'D';   // the door into the rock, in the north wall
  for (const [x, y] of [[5, 34], [38, 33], [12, 26], [36, 15], [8, 6], [36, 5], [40, 30], [3, 25], [16, 27], [27, 32], [33, 36], [10, 36], [20, 14], [8, 16], [33, 13], [16, 6], [26, 4], [6, 7]]) X[y][x] = 'r';
  for (const [x0, y0, x1, y1] of [[12, 32, 14, 33], [30, 34, 33, 36], [19, 24, 21, 25], [33, 24, 35, 25], [17, 12, 19, 13], [10, 30, 11, 31], [8, 29, 8, 30], [26, 5, 27, 6], [12, 6, 13, 7]]) fill(X, x0, y0, x1, y1, 'w');   // the pools under the falls, the outflow's own pool
  defineMap('aqua_rock', {
    name: 'Aqua Rock', w: 44, h: 40, base: 'void', music: 'aquarock', bg: 'water', entry: { x: 21, y: 38 }, enc: ENC_OUT, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(X), LEG, ROCK);
      // water sheeting down the cliff faces above the pools (the falls that are not climbed)
      for (const [x, y0, y1] of [[20, 18, 23], [34, 18, 23], [18, 6, 11], [10, 6, 11], [26, 6, 11], [12, 30, 31], [13, 30, 31]]) for (let y = y0; y <= y1; y++) if (X[y][x] === '#') M.setObj(x, y, 'wfall_climb');
      M.exit(20, 39, 4, 1, 'world_tla', 285, 177, DIR.DOWN);

      // the five guardian moai: they stand until the Aqua Stone on Apojii is doused
      if (!G.flag('apojii_stone_doused')) for (const x of [18, 20, 22, 24, 26]) M.object('pillar', x, 29, { id: 'aq_guard' + x, tile: 'moai', fixed: true, script: function* (E) { yield E.say('A moai, stone-faced, shoulder to shoulder with its fellows across the way up. It does not move for Psynergy. The islanders said the Aqua Stone was the key to them.'); } });
      M.sign(16, 31, 'Aqua Rock. The wet faces of the rock can be climbed where the water sheets down them; the streams that pour from the moai will carry whoever steps in them.');
      // band A: the Elixir at the west end, the Nut on the slope, the water stone that turns the dried moai's stream
      M.chest(3, 24, 'Elixir', 1); M.chest(38, 25, 'Nut', 1);
      for (let y = 25; y <= 28; y++) stream(M, 'aq_s0' + y, 8, y, { x: 8, y: 31 });   // the pool's outflow down the slope: it washes whoever steps in it to the foot; the ledge above it is the way past
      M.object('waterstone', 32, 26, { id: 'aq_ws1', onDouse: function* (E) { G.set('aq_stream_up'); Engine.doShake(8); Audio.sfx('water'); yield E.say('The stone shines - and the stream down the cliff shudders, and runs the other way, up the rock!'); } });
      const dryTo = () => G.flag('aq_stream_up') ? { x: 29, y: 17 } : { x: 30, y: 24 };
      for (let y = 17; y <= 23; y++) stream(M, 'aq_dry' + y, 30, y, dryTo, { active: () => { const m = G.field.map.objects.find(o => o.id === 'aq_moai_dry'); return !!(m && m.state === 'wet'); } });
      // band B: the red moai and their streams; the pillar stops the left one, Move shifts the right one
      M.object('pillar', 14, 12, { id: 'aq_red1', tile: 'moai_red', fixed: true }); M.object('pillar', 24, 12, { id: 'aq_red2', tile: 'moai_red' });
      for (let y = 13; y <= 17; y++) stream(M, 'aq_r1' + y, 14, y, { x: 14, y: 25 }, { active: () => !G.field.map.objects.some(o => !o.gone && o.id === 'aq_pil1' && o.x === 14 && o.y === 13) });
      for (let y = 13; y <= 17; y++) stream(M, 'aq_r2' + y, 24, y, { x: 24, y: 25 }, { active: () => { const m = G.field.map.objects.find(o => o.id === 'aq_red2'); return !!(m && m.x === 24 && m.y === 12); } });
      M.object('pillar', 10, 13, { id: 'aq_pil1' });
      M.sign(5, 13, 'Two red moai stand over this ledge, and the water they pour crosses it. Something set in a stream stops it; a moai shifted off its perch pours nowhere.');
      // the dried moai at the east end: Douse sets it pouring down the cliff
      moai(M, 'aq_moai_dry', 30, 16, { fixed: true }); M.sign(32, 16, 'A moai with a dry mouth, over a dry channel down the cliff. It looks thirsty.');
      // band C: the blue rocks into the channel, the Oil Drop, the puddles, the Mist Sabre, the tear rock and the door
      bluerock(M, 'aq_blue1', 34, 5); bluerock(M, 'aq_blue2', 34, 6);
      M.chest(29, 4, 'Oil Drop', 1);
      for (const [x, y] of [[21, 5], [20, 5], [19, 5]]) M.object('puddle', x, y, { id: 'aq_pud' + x });
      for (const [x, y] of [[18, 3], [18, 2]]) M.object('puddle', x, y, { id: 'aq_pudb' + y });
      M.chest(18, 0, 'Mist Sabre', 1);
      M.object('waterstone', 12, 4, { id: 'aq_gate', onDouse: function* (E) { G.set('aq_door_open'); Engine.doShake(10); Audio.sfx('push'); yield E.say('The tear-shaped rock drinks the water and glows blue, and with a groan the door in the rock face grinds open.'); } });
      M.exit(10, 3, 1, 1, 'aqua_rock_in_1', 8, 12, DIR.UP, { door: true, cond: () => !!G.flag('aq_door_open') });
      M.sign(7, 4, 'The door into Aqua Rock. It is shut fast. Beside it a rock shaped like a tear waits for something.');
      M.trigger(19, 36, 6, 3, function* (E) { if (G.flag('apojii_stone_doused')) { yield E.say('The moai have moved. The way up the rock is open.', 'Piers'); return; } yield E.say('Aqua Rock. And there, across the only way up: the guardian moai, five of them, shoulder to shoulder.', 'Piers'); yield E.say('The islanders said the Aqua Stone by their spring was the key to the moai. Perhaps it wants the same thing every other stone of theirs wants: water.', 'Kraden'); }, { once: 'aqua_rock_seen' });
    }
  });
  // ====================== the halls inside ======================
  const hall = (id, name, rows, entry, build, extra) => defineMap(id, Object.assign({ name: 'Aqua Rock - ' + name, w: rows[0].length, h: rows.length, base: 'void', music: 'aquarock', bg: 'water', indoor: true, entry, enc: ENC_IN, retreat: WORLD, build(M) { M.paint(0, 0, strs(rows), LEG, { cliff: '#', set: 'greyrock', faces: 2 }); build(M); } }, extra || {}));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.set(x, y, 'ar_floor'); M.setObj(x, y, 'lc_door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  // 1. the entrance hall: down to the second hall
  const H1 = grid(18, 14, '#'); fill(H1, 2, 2, 15, 11, '.'); H1[12][8] = '.'; H1[13][8] = 'D'; H1[1][12] = 'D';
  hall('aqua_rock_in_1', 'Entrance', H1, { x: 8, y: 12 }, (M) => { door(M, 8, 13, 'aqua_rock', 10, 4, DIR.DOWN); door(M, 12, 1, 'aqua_rock_in_2', 4, 12, DIR.UP); M.sign(3, 3, 'Blue rock, and the sound of water everywhere. The halls run down into the mountain.'); });
  // 2. the yellow tiles along the right wall, hopped, to the passage up
  const H2 = grid(22, 14, '#'); fill(H2, 2, 2, 19, 11, '.'); fill(H2, 8, 2, 17, 11, 'p'); for (const x of [8, 10, 12, 14, 16]) H2[10][x] = 'y'; for (const x of [9, 11, 13, 15, 17]) H2[10][x] = '.'; H2[12][4] = '.'; H2[13][4] = 'D'; H2[1][19] = 'D';
  hall('aqua_rock_in_2', 'Yellow Tiles', H2, { x: 4, y: 12 }, (M) => { door(M, 4, 13, 'aqua_rock_in_1', 12, 2, DIR.DOWN); door(M, 19, 1, 'aqua_rock_in_3', 4, 12, DIR.UP); M.sign(3, 3, 'Yellow tiles run along the right wall over a drop. They are not stood on - they are jumped, one to the next.'); });
  // 3. the two columns, the two vents, the Vial
  const H3 = grid(22, 14, '#'); fill(H3, 2, 2, 19, 11, '.'); H3[12][4] = '.'; H3[13][4] = 'D'; H3[1][17] = 'D';
  fill(H3, 8, 2, 8, 11, '#'); H3[6][8] = '.'; fill(H3, 14, 2, 14, 11, '#'); H3[6][14] = '.';   // two walls across the hall, each with one gap - the vents sit in the gaps
  hall('aqua_rock_in_3', 'Vents', H3, { x: 4, y: 12 }, (M) => {
    door(M, 4, 13, 'aqua_rock_in_2', 19, 2, DIR.DOWN); door(M, 17, 1, 'aqua_rock_in_4', 4, 2, DIR.UP);
    M.object('updraft', 8, 6, { id: 'aq_v1', tile: 'vent', passable: true, to: { x: 4, y: 11 }, active: () => !G.flag('aq_v1_stopped') }); M.object('updraft', 14, 6, { id: 'aq_v2', tile: 'vent', passable: true, to: { x: 4, y: 11 }, active: () => !G.flag('aq_v2_stopped') });
    const capper = (id, vx, vy, flag) => function* (E) { const o = G.field.map.objects.find(ob => ob.id === id); if (o && !o.gone && o.x === vx && o.y === vy && !G.flag(flag)) { G.set(flag); Audio.sfx('psy'); yield E.say('The column settles over the vent, and the air stops. It stays stopped: the column can go on through.'); } };
    M.object('pillar', 5, 6, { id: 'aq_c1', onMove: capper('aq_c1', 8, 6, 'aq_v1_stopped') }); M.object('pillar', 12, 8, { id: 'aq_c2', onMove: capper('aq_c2', 14, 6, 'aq_v2_stopped') });
    M.chest(18, 10, 'Vial', 1);
    M.sign(3, 3, 'Two vents in the gaps of two walls, and a column before each. The air from a vent throws the party back to the door; a column set in it stops it, and Move can draw the column off again from the far side.');
  });
  // 4. the moai that lowers the water, the three puddles, the branch: down to the Crystal Powder, up to the water stone
  const H4 = grid(24, 16, '#'); fill(H4, 2, 2, 21, 13, '.'); H4[1][4] = 'D'; fill(H4, 8, 4, 21, 11, 'w'); fill(H4, 8, 12, 21, 13, '.'); H4[14][20] = '.'; H4[15][20] = 'D'; H4[7][22] = '.'; H4[7][23] = 'D';
  hall('aqua_rock_in_4', 'Flooded Hall', H4, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_3', 17, 2, DIR.UP); door(M, 20, 15, 'aqua_rock_in_5', 4, 2, DIR.DOWN); door(M, 23, 7, 'aqua_rock_in_6', 2, 8, DIR.RIGHT);
    // the moai on the west shore: pushed before the drain (the mark at (6,7)) the water level drops, and puddles are left on the floor
    const drained = !!G.flag('aq_drained');
    M.object('pillar', 4, 7, { id: 'aq_m4', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'aq_m4'); if (o && o.x === 6 && o.y === 7 && !G.flag('aq_drained')) { G.set('aq_drained'); Audio.sfx('water'); Engine.doShake(8); const MM = G.field.map; for (let y = 4; y <= 11; y++) for (let x = 8; x <= 21; x++) { MM.set(x, y, 'ar_floor'); MM.walkable(x, y); } for (const [px, py] of [[10, 6], [14, 8], [18, 6]]) MM.object('puddle', px, py, { id: 'aq_p4' + px }); MM.finalize(); yield E.say('The moai settles over the drain, and the water runs out of the hall, leaving puddles on the floor and the far doors dry.'); } } });
    if (drained) { for (let y = 4; y <= 11; y++) for (let x = 8; x <= 21; x++) { M.set(x, y, 'ar_floor'); M.walkable(x, y); } for (const [px, py] of [[10, 6], [14, 8], [18, 6]]) M.object('puddle', px, py, { id: 'aq_p4' + px }); }
    M.sign(3, 3, 'Water fills the hall from the west shore to the east wall. A moai stands by a drain in the floor.');
  });
  // 5. the lone chest: Crystal Powder
  const H5 = grid(10, 8, '#'); fill(H5, 2, 2, 7, 5, '.'); H5[1][4] = 'D';
  hall('aqua_rock_in_5', 'Side Hall', H5, { x: 4, y: 2 }, (M) => { door(M, 4, 1, 'aqua_rock_in_4', 20, 14, DIR.UP); M.chest(6, 4, 'Crystal Powder', 1); });
  // 6. the water stone that opens the way, the two vents (the pillar over the RIGHT one), the fall down the left one
  const H6 = grid(24, 14, '#'); fill(H6, 2, 2, 21, 11, '.'); H6[8][1] = 'D'; H6[12][20] = '.'; H6[13][20] = 'D';
  fill(H6, 10, 2, 10, 11, '#'); H6[6][10] = '.';   // the wall the water stone opens
  hall('aqua_rock_in_6', 'Water Stone', H6, { x: 2, y: 8 }, (M) => {
    door(M, 1, 8, 'aqua_rock_in_4', 22, 7, DIR.LEFT); M.set(20, 13, 'ar_floor'); M.setObj(20, 13, 'lc_door'); M.block(20, 13);
    M.object('waterstone', 6, 4, { id: 'aq_ws6', onDouse: function* (E) { G.set('aq_ws6_open'); Engine.doShake(8); Audio.sfx('push'); const MM = G.field.map; MM.setObj(10, 6, null); MM.walkable(10, 6); MM.finalize(); yield E.say('The stone glows, and a slab in the wall east of it slides aside: a way through.'); } });
    if (!G.flag('aq_ws6_open')) { M.setObj(10, 6, 'gc_face'); M.block(10, 6); }
    // past the wall: two vents side by side; the pillar over the right one lets the party ride the left one down to the puzzle hall
    M.object('updraft', 15, 8, { id: 'aq_v6l', tile: 'vent', to: { map: 'aqua_rock_in_7', x: 4, y: 3 }, active: () => G.field.map.objects.some(o => !o.gone && o.id === 'aq_c6' && o.x === 18 && o.y === 8) }); M.object('updraft', 18, 8, { id: 'aq_v6r', tile: 'vent', to: { x: 12, y: 3 } });
    M.object('pillar', 18, 5, { id: 'aq_c6' });
    M.sign(3, 3, 'A water stone before a blank wall. Beyond it, they say, two vents: the right one throws you back, the left one, with the right one stopped, carries you down.');
  });
  // 7. the puzzle hall: the upper-right pillar moved one right and one down opens the one path; Douse the moai, then the aqua stone
  const H7 = grid(20, 14, '#'); fill(H7, 2, 2, 17, 11, '.'); H7[12][12] = '.'; H7[13][12] = 'D'; H7[1][12] = 'D';
  fill(H7, 2, 6, 17, 6, 'p');   // the pit across the hall
  hall('aqua_rock_in_7', 'Pillar Hall', H7, { x: 4, y: 3 }, (M) => {
    door(M, 12, 13, 'aqua_rock_in_8', 4, 2, DIR.DOWN); door(M, 12, 1, 'aqua_rock_in_6', 20, 12, DIR.UP);
    // three pillars; only the upper-right one moves: one right, one down, and it fills the gap so the party can cross on it
    M.object('pillar', 4, 4, { id: 'aq_p7a', fixed: true }); M.object('pillar', 14, 4, { id: 'aq_p7b', fixed: true }); M.object('pillar', 8, 5, { id: 'aq_p7c' });
    moai(M, 'aq_m7', 6, 9, { fixed: true, onDouse: function* (E) { G.set('aq_m7_wet'); yield E.say('The moai drinks, and its eyes light. The aqua stone beside it hums.'); } });
    M.object('waterstone', 12, 9, { id: 'aq_as7', onDouse: function* (E) { if (!G.flag('aq_m7_wet')) { yield E.say('The stone drinks the water and does nothing. The moai first, perhaps.'); const o = G.field.map.objects.find(ob => ob.id === 'aq_as7'); if (o) o.state = null; return; } G.set('aq_hall7_open'); Engine.doShake(10); Audio.sfx('push'); const MM = G.field.map; MM.setObj(12, 12, null); MM.walkable(12, 12); MM.finalize(); yield E.say('Moai and stone shine together, and the floor at the south end of the hall opens on a stair down.'); } });
    if (!G.flag('aq_hall7_open')) { M.setObj(12, 12, 'gc_face'); M.block(12, 12); }
    M.sign(3, 3, 'A pit crosses the hall; one pillar of the three can move. Beyond the pit a moai and an aqua stone, and the way on.');
  });
  // 8. the great waterfall hall: the current on the upper level drops the party on the second tile; the pillar Moved for the Tear Stone
  const H8 = grid(26, 18, '#'); fill(H8, 2, 2, 23, 5, '.'); H8[1][4] = 'D'; fill(H8, 2, 6, 23, 8, 'w'); fill(H8, 2, 9, 23, 15, '.'); H8[16][20] = '.'; H8[17][20] = 'D';
  for (const x of [6, 10, 14, 18]) { H8[6][x] = 'S'; }   // the tiles in the current: stepped on, they drop the party to the floor below
  fill(H8, 12, 9, 13, 15, 'x');   // the crack down the lower floor, hopped
  hall('aqua_rock_in_8', 'Waterfall Hall', H8, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_7', 12, 12, DIR.UP); door(M, 20, 17, 'aqua_rock_in_9', 4, 2, DIR.DOWN);
    M.object('hop', 12, 11, { id: 'aq_hop8' }); M.walkable(13, 11); M.set(13, 11, 'ar_floor');
    for (const [x, y] of [[14, 13], [14, 14], [16, 14]]) { M.setObj(x, y, 'gc_face'); M.block(x, y); }
    M.object('pillar', 15, 13, { id: 'aq_p8' }); M.chest(15, 14, 'Tear Stone', 1);
    M.sign(3, 3, 'The great waterfall pours across the middle of the hall. Along the upper edge, tiles in the current - stepped on, they give way and drop you to the floor below.');
  }, { fall: (x, y) => ({ map: 'aqua_rock_in_8', x, y: 10 }) });
  // 9. the hall of many doors: only the leftmost leads on, to the moai; the puzzle of the blue rock and the puddle; the Water of Life
  const H9 = grid(24, 16, '#'); fill(H9, 2, 2, 21, 13, '.'); H9[1][4] = 'D'; H9[14][3] = '.'; H9[15][3] = 'D';
  fill(H9, 2, 8, 21, 8, 'p'); H9[8][10] = 'y'; H9[8][11] = 'y'; H9[8][12] = 'y';
  hall('aqua_rock_in_9', 'Hall of Doors', H9, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_8', 20, 16, DIR.UP); door(M, 3, 15, 'aqua_rock_in_10', 4, 2, DIR.DOWN);
    for (const x of [8, 13, 18]) { M.setObj(x, 1, 'lc_door'); M.set(x, 1, 'ar_floor'); M.walkable(x, 1); M.exit(x, 1, 1, 1, 'aqua_rock_in_9', x, 2, DIR.DOWN, { door: true, cond: () => false }); M.sign(x + 1, 2, 'A doorway, and a blank wall of rock a step inside it. Not this one.'); }
    // the three tiles over the pit, the blue rock for the middle one and Frost on the puddle for the left, then the moai
    for (const x of [10, 11, 12]) { M.set(x, 8, 'chasm'); M.setObj(x, 8, null); }
    M.object('pillar', 11, 5, { id: 'aq_blue9', tile: 'rock_blue' }); M.object('puddle', 10, 8, { id: 'aq_pud9' });
    moai(M, 'aq_m9', 6, 11, { fixed: true, onDouse: function* (E) { G.set('aq_m9_wet'); Engine.doShake(8); const MM = G.field.map; MM.setObj(3, 14, null); MM.walkable(3, 14); MM.finalize(); yield E.say('The moai pours, and the wall at the south end of the hall sinks into the floor: the way on, and a chest beside it.'); } });
    if (G.flag('aq_m9_wet')) { M.setObj(3, 14, null); M.walkable(3, 14); } else { M.setObj(3, 14, 'gc_face'); M.block(3, 14); }
    M.chest(20, 12, 'Water of Life', 1);
    M.sign(3, 3, 'Doors on every side, and all but the leftmost open on rock. A pit crosses the hall; three tiles of the floor are missing over it.');
  });
  // 10. the big chamber: yellow tiles, the pillar into its gap (a shortcut), another pillar into its gap, the stair north
  const H10 = grid(26, 16, '#'); fill(H10, 2, 2, 23, 13, '.'); H10[1][4] = 'D'; fill(H10, 8, 2, 8, 13, 'p'); fill(H10, 16, 2, 16, 13, 'p'); H10[14][21] = '.'; H10[15][21] = 'D';   // pits, not chasms: hopped only at the yellow tiles
  hall('aqua_rock_in_10', 'Great Chamber', H10, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_9', 3, 14, DIR.UP); door(M, 21, 15, 'aqua_rock_in_11', 4, 2, DIR.DOWN);
    M.object('pillar', 6, 7, { id: 'aq_p10a' }); M.object('pillar', 13, 9, { id: 'aq_p10b' });
    M.object('hop', 8, 3, { id: 'aq_hop10a' }); M.object('hop', 16, 11, { id: 'aq_hop10b' });
    M.sign(3, 3, 'Two cracks run the height of the chamber. The pillars go into them for footing; the yellow tile at the top of the first is a jump for now.');
  });
  // 11. the tightrope and the three-pillar puzzle: pillar 1 up to the stone's row, 2 down-left, 3 out; the moai and the aqua stone
  const H11 = grid(26, 16, '#'); fill(H11, 2, 2, 23, 13, '.'); H11[1][4] = 'D'; fill(H11, 2, 5, 9, 5, 'x'); for (let x = 3; x <= 8; x++) H11[5][x] = 'T'; H11[14][21] = '.'; H11[15][21] = 'D';
  fill(H11, 12, 8, 23, 8, 'p'); H11[8][14] = 'y'; H11[8][18] = 'y'; H11[8][22] = 'y';
  hall('aqua_rock_in_11', 'Three Pillars', H11, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_10', 21, 14, DIR.UP); door(M, 21, 15, 'aqua_rock_in_12', 4, 2, DIR.DOWN);
    for (const x of [14, 18, 22]) { M.set(x, 8, 'chasm'); M.setObj(x, 8, null); }
    // the three pillars in the lower right: 1 goes up to the aqua stone's row, 2 down and left, 3 to the right (the guide's picture)
    M.object('pillar', 16, 11, { id: 'aq_t1' }); M.object('pillar', 17, 11, { id: 'aq_t2' }); M.object('pillar', 19, 11, { id: 'aq_t3' });
    const solved = () => { const at = (id, x, y) => G.field.map.objects.some(o => o.id === id && !o.gone && o.x === x && o.y === y); return at('aq_t1', 16, 9) && at('aq_t2', 16, 12) && at('aq_t3', 20, 11); };
    moai(M, 'aq_m11', 14, 10, { fixed: true, onDouse: function* (E) { G.set('aq_m11_wet'); yield E.say('The moai pours; the aqua stone beside it waits on the pillars.'); } });
    M.object('waterstone', 14, 9, { id: 'aq_as11', onDouse: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'aq_as11'); if (!G.flag('aq_m11_wet') || !solved()) { yield E.say('The stone drinks and does nothing. The moai must pour, and the pillars must stand where the marks on the floor show.'); if (o) o.state = null; return; } G.set('aq_hall11_open'); Engine.doShake(10); Audio.sfx('push'); const MM = G.field.map; MM.setObj(21, 14, null); MM.walkable(21, 14); MM.finalize(); yield E.say('Stone and moai shine, the pillars sink to their marks, and the stair at the south end opens.'); } });
    if (!G.flag('aq_hall11_open')) { M.setObj(21, 14, 'gc_face'); M.block(21, 14); }
    M.sign(3, 3, 'A tightrope over the gap by the door; yellow tiles over the pit; and in the lower right, three pillars and the marks on the floor they belong on: one up beside the stone, one down at the left, one out to the right.');
  });
  // 12. the last stairs: the pillar out of the way, the hops, the Mimic in the corner; the Psynergy stone west, the way out south
  const H12 = grid(24, 16, '#'); fill(H12, 2, 2, 21, 13, '.'); H12[1][4] = 'D'; fill(H12, 10, 2, 10, 13, 'p'); H12[7][10] = '.'; H12[14][18] = '.'; H12[15][18] = 'D'; H12[7][1] = 'D';   // a pit, not a chasm: the one way over is the gap the pillar stands in
  hall('aqua_rock_in_12', 'Last Stairs', H12, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_11', 21, 14, DIR.UP); door(M, 18, 15, 'aqua_rock_in_13', 12, 2, DIR.DOWN); door(M, 1, 7, 'aqua_rock_in_psy', 8, 4, DIR.LEFT);
    M.object('pillar', 10, 7, { id: 'aq_p12' }); M.chest(20, 3, 'Potion', 1, { mimic: 'Mimic #4 II' });
    M.sign(3, 3, 'A pillar stands in the one gap of the crack across the hall. A chest waits in the far corner, too easy to reach.');
  });
  const HP = grid(12, 8, '#'); fill(HP, 2, 2, 9, 5, '.'); HP[4][10] = '.'; HP[4][11] = 'D';
  hall('aqua_rock_in_psy', 'Psynergy Stone', HP, { x: 8, y: 4 }, (M) => { door(M, 11, 4, 'aqua_rock_in_12', 2, 7, DIR.RIGHT); M.setObj(5, 3, 'psystone'); M.sign(3, 3, 'A great Psynergy stone in the middle of the little hall.'); });
  // 13. outside again, under the rock: Douse the big rock for the Lucky Pepper and the Aquarius Stone; the far south exit to the column
  const H13 = grid(26, 16, '#'); fill(H13, 2, 2, 23, 13, '.'); H13[1][12] = 'D'; fill(H13, 4, 4, 9, 7, 'w'); H13[14][20] = '.'; H13[15][20] = 'D'; H13[13][3] = 'D';
  hall('aqua_rock_in_13', 'Hidden Pool', H13, { x: 12, y: 2 }, (M) => {
    door(M, 12, 1, 'aqua_rock_in_12', 18, 14, DIR.UP); door(M, 20, 15, 'aqua_rock_in_14', 4, 2, DIR.DOWN); door(M, 3, 13, 'aqua_rock_in_16', 6, 2, DIR.DOWN);
    // the big rock at the pool: doused, it opens the pool's bed and the two chests in it
    M.object('waterstone', 11, 5, { id: 'aq_bigrock', tile: 'rock_blue', wetTile: 'aqua_stone_wet', onDouse: function* (E) { G.set('aq_pool_open'); Audio.sfx('water'); Engine.doShake(8); const MM = G.field.map; for (let y = 4; y <= 7; y++) for (let x = 4; x <= 9; x++) { MM.set(x, y, 'ar_floor'); MM.walkable(x, y); } MM.finalize(); yield E.say('The rock shines and the pool drains through it, leaving two chests on its bed.'); } });
    if (G.flag('aq_pool_open')) for (let y = 4; y <= 7; y++) for (let x = 4; x <= 9; x++) { M.set(x, y, 'ar_floor'); M.walkable(x, y); }
    M.chest(5, 5, 'Lucky Pepper', 1); M.chest(8, 6, 'Aquarius Stone', 1);
    M.sign(13, 3, 'A pool under the open sky, in a fold of the rock. A big blue rock stands at its edge.');
  });
  // 14. the empty column: the Aquarius Stone parts the water; the Parch tablet beyond
  const H14 = grid(20, 18, '#'); fill(H14, 2, 2, 17, 15, '.'); H14[1][4] = 'D'; fill(H14, 2, 7, 17, 9, 'w'); H14[16][15] = '.'; H14[17][15] = 'D';
  hall('aqua_rock_in_14', 'The Column', H14, { x: 4, y: 2 }, (M) => {
    door(M, 4, 1, 'aqua_rock_in_13', 20, 14, DIR.UP); door(M, 15, 17, 'aqua_rock_in_15', 4, 12, DIR.DOWN);
    const parted = !!G.flag('aq_parted');
    if (parted) for (let y = 7; y <= 9; y++) for (let x = 8; x <= 11; x++) { M.set(x, y, 'ar_floor'); M.walkable(x, y); }
    M.object('spot', 9, 5, { id: 'aq_column', tile: 'pillar_sunk', script: function* (E) { if (G.flag('aq_parted')) { yield E.say('The column, with the Aquarius Stone set in it. The water stands parted.'); return; } yield E.say("It's a column with a spot where you can place something."); if (!G.inventory.has('Aquarius Stone')) return; const r = yield* E.ask('Place the Aquarius Stone?'); if (r !== 0) return; G.inventory.remove('Aquarius Stone'); G.set('aq_parted'); Audio.sfx('psy'); Engine.doFlash(12, '#80c0ff'); Engine.doShake(10); const MM = G.field.map; for (let y = 7; y <= 9; y++) for (let x = 8; x <= 11; x++) { MM.set(x, y, 'ar_floor'); MM.walkable(x, y); } MM.finalize(); yield E.say('The stone sinks into the column and shines - and the water between the two ledges draws back to either side, leaving the bed dry!'); } });
    M.sign(3, 3, 'Two ledges, and water between them. On the near ledge a column with an empty socket in its top.');
  });
  // 15. the tablet: Parch; the water rises behind the party, and Parch is the way out
  const H15 = grid(14, 14, '#'); fill(H15, 2, 2, 11, 11, '.'); H15[12][4] = '.'; H15[13][4] = 'D';
  hall('aqua_rock_in_15', 'Tablet', H15, { x: 4, y: 12 }, (M) => {
    door(M, 4, 13, 'aqua_rock_in_14', 15, 16, DIR.DOWN);
    M.object('statue', 6, 3, { id: 'aq_tablet', tile: 'ar_tablet', script: T3.aquaRockParch });
    // once Parch is learned the hall floods: the pool between the tablet and the door, to be dried
    if (G.flag('parch_learned') && !G.flag('aq_hall15_dry')) { for (let y = 7; y <= 9; y++) for (let x = 2; x <= 11; x++) M.set(x, y, 'water'); M.object('pool', 6, 7, { id: 'aq_pool15', tiles: (() => { const t = []; for (let y = 7; y <= 9; y++) for (let x = 2; x <= 11; x++) t.push([x, y]); return t; })(), dryTile: 'ar_floor', onParch: function* (E) { G.set('aq_hall15_dry'); yield E.say('The water is gone as if it had never been. The way out is open.'); } }); }
    M.sign(3, 3, 'A stone slate at the north end of the hall, carved with strange characters.');
  });
  // 16. the southernmost hall: the sunken chest with the Rusty Sword, Parch on the water; the exit outside; and Steam beyond the stream
  const H16 = grid(24, 14, '#'); fill(H16, 2, 2, 21, 11, '.'); H16[1][6] = 'D'; fill(H16, 4, 4, 9, 8, 'w'); H16[12][6] = '.'; H16[13][6] = 'D'; fill(H16, 14, 2, 14, 11, 's'); H16[6][14] = '.';
  hall('aqua_rock_in_16', 'South Hall', H16, { x: 6, y: 2 }, (M) => {
    door(M, 6, 1, 'aqua_rock_in_13', 3, 12, DIR.UP); door(M, 6, 13, 'aqua_rock', 21, 37, DIR.DOWN);
    const dried = !!G.flag('aq_hall16_dry');
    if (!dried) M.object('pool', 9, 6, { id: 'aq_pool16', tiles: (() => { const t = []; for (let y = 4; y <= 8; y++) for (let x = 4; x <= 9; x++) t.push([x, y]); return t; })(), dryTile: 'ar_floor', onParch: function* (E) { G.set('aq_hall16_dry'); yield E.say('The pool dries to its bed, and there in the mud lies a chest.'); } });
    else for (let y = 4; y <= 8; y++) for (let x = 4; x <= 9; x++) { M.set(x, y, 'ar_floor'); M.walkable(x, y); }
    M.chest(7, 6, 'Rusty Sword', 1);   // Robber's Blade, at Sunshine's forge
    // the stream across the east of the hall, from the moai on the far side: Parch on the moai stops it, and Steam waits behind
    for (let y = 2; y <= 11; y++) if (y !== 6) M.object('updraft', 14, y, { id: 'aq_s16_' + y, tile: 'stream', onTile: 'stream', passable: true, to: { x: 12, y: 6 }, active: () => { const m = G.field.map.objects.find(o => o.id === 'aq_m16'); return !(m && m.state === 'dry'); } });
    moai(M, 'aq_m16', 14, 6, { fixed: true, state: 'wet' });
    M.djinni('Steam', 19, 9, { fight: true });
    M.sign(3, 3, 'The southernmost hall. A pool with something under its surface; a stream from a moai across the east of the hall, too strong to cross - and something bright beyond it.');
  });
  // the tablet: Piers learns Parch, and the hall floods
  T3.aquaRockParch = function* (E) {
    if (G.flag('parch_learned')) { yield E.say('The tablet. Its power has passed to Piers.'); return; }
    yield E.say('Felix checked the tablet. It has strange characters carved on it.');
    yield E.say("Wielder of Water's strength... Lay your hands upon this stone. If thou art worthy, the power to drain away the standing water shall be thine.");
    yield E.say("Water's strength, huh? That sounds like my sort of thing, doesn't it?", 'Piers'); yield E.say('(Felix nods.)');
    yield E.say('Piers tried to touch the stone slate.'); Audio.sfx('psy'); Engine.doFlash(20, '#60c0ff'); yield 30;
    G.set('parch_learned'); const p = G.party.get('Piers'); if (p) p.learnExtra('Parch');
    yield E.say('Piers learned Parch!');
    Audio.sfx('water'); Engine.doShake(12); const MM = G.field.map; for (let y = 7; y <= 9; y++) for (let x = 2; x <= 11; x++) MM.set(x, y, 'water'); MM.object('pool', 6, 7, { id: 'aq_pool15', tiles: (() => { const t = []; for (let y = 7; y <= 9; y++) for (let x = 2; x <= 11; x++) t.push([x, y]); return t; })(), dryTile: 'ar_floor', onParch: function* (E2) { G.set('aq_hall15_dry'); yield E2.say('The water is gone as if it had never been. The way out is open.'); } }); MM.finalize();
    yield E.say('Water suddenly fills the space around the ledge, cutting the party off from the door!');
    yield E.say('What went wrong? What are we going to do, Felix? Maybe our power is being tested.', 'Piers');
  };
}
