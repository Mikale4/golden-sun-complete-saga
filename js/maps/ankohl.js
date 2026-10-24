// ---------- Ankohl Ruins ----------
// After map references/golden-sun-the-lost-age-ankohl-ruins-gba-map.webp, condensed from its forty-odd rooms to the
// ones the guide walks: the ziggurat in its field; the entrance hall of empty chests and fake bushes (Whirlwind on
// the centre one); the central chamber with the six stone faces Moved off their mouths (Crystal Powder, the
// overgrowth and the column, 210 coins, Sand to the Nut); the left way (the lowest path, Sand to the Thanatos Mace,
// the left half of a face pushed into its place and the hall below filled with sand, Whirlwind on the upper-left
// bush for the hidden stair); the cellar (Power Bread, Sand under the wall, the pillar Moved left through the wall
// and Sand under it for the Vial, 365 coins); the switch room (the sand rises, the second switch), the corridor of
// gaps and the slide, the brown pillar into the chasm and the face's part into its socket, the pillar Moved in the
// upper passage, the way back with Sand; the right way (Sand to the stair, Whirlwind for the Muni Robe, the square
// blocks passed with Sand once that pillar is moved, the Sylph Feather, the quicker switch room, the pillar and the
// vines and the gap for the Potion, the right half of the face pushed home so its eyes light, the face that roams
// its corridor, Sand under the upper wall, the pillar between the two halls, Reveal for the gap in the stones and
// the face's part pushed into it, the last face set below, Sand to the corner stair) and the Left Prong in the mouth
// of the face on the roof.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 64, y: 58, dir: DIR.DOWN };
  const ENC = [['Dinox', 'Dinox'], ['Harridan II', 'Harridan II'], ['Living Armor'], ['Minotaurus'], ['Squirrelfang', 'Squirrelfang'], ['Wood Walker', 'Wood Walker']];
  const LEG = {
    '.': 'ak_floor', 'k': 'ak_floor_dark', 's': 'ak_sand', 'x': 'ak_pit', 'g': 'ak_gap', 'S': 'ak_slide', 'o': 'ak_slot', 'r': 'grass', 'T': { ground: 'grass', obj: 'tree' }, 'p': 'path',
    'v': { ground: 'ak_floor', obj: 'ak_vine', walk: true }, 'D': { ground: 'ak_floor', obj: 'ak_door', walk: true }, 'u': { ground: 'ak_floor', obj: 'stairs_up', walk: true }, 'd': { ground: 'ak_floor', obj: 'stairs_down', walk: true },
    'L': { ground: 'ak_sand', obj: 'ak_lowwall' }, 'b': { ground: 'ak_floor', obj: 'bush' }, 'c': { ground: 'ak_floor', obj: 'chest_open' }, 'R': { ground: 'ak_floor', obj: 'ak_stone_red' }, 'B': { ground: 'ak_floor', obj: 'ak_stone_brown' }
  };
  const WALL = { cliff: '#', set: 'ankohl', faces: 1 };
  const room = (id, rows, opts) => defineMap(id, Object.assign({ name: 'Ankohl Ruins', w: rows[0].length, h: rows.length, base: 'void', music: 'ankohl', bg: 'ruins', indoor: true, enc: ENC, retreat: WORLD }, opts, { build(M) { M.paint(0, 0, rows, LEG, WALL); if (opts.build) opts.build(M); } }));
  const door = (M, x, y, to, tx, ty, dir) => M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.UP : dir, { door: true });
  const bushes = (M, id, x, y, onClear) => M.object('leaves', x, y, { id, onClear });
  const gone = (o) => { o.gone = true; G.set('obj:' + o.key, { gone: true }); };
  // a floor switch: pulled once, it does its work and stays down
  const sw = (M, id, x, y, flag, script) => { if (G.flag(flag)) { M.setObj(x, y, 'ak_switch_on'); return; } M.object('lever', x, y, { id, tile: 'ak_switch', onPull: function* (E) { if (G.flag(flag)) return; G.set(flag); const MM = G.field.map; const o = MM.objects.find(q => q.id === id); if (o) gone(o); persistObjTile(MM, x, y, 'ak_switch_on'); MM.finalize(); Audio.sfx('push'); yield* script(E); } }); };
  // the sand pouring into a low floor: row by row, from the bottom up, the pit becomes sand to walk on
  const sandFill = function* (E, cells, pace) { const MM = G.field.map; const rows = [...new Set(cells.map(c => c[1]))].sort((a, b) => b - a); for (const y of rows) { for (const [x, yy] of cells) if (yy === y) persistGround(MM, x, yy, 'ak_sand'); MM.finalize(); Engine.doShake(4); Audio.sfx('push'); yield pace || 18; } };
  const pitCells = (x0, y0, x1, y1) => { const t = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) t.push([x, y]); return t; };
  // a part of a stone face that must be Moved onto its socket: there it settles (flag), and stays
  const facePart = (M, id, x, y, tile, sx, sy, flag, text) => M.object('statue_move', G.flag(flag) ? sx : x, G.flag(flag) ? sy : y, { id, tile, poundable: false, fixed: G.flag(flag), onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === id); if (!o || G.flag(flag) || o.x !== sx || o.y !== sy) return; G.set(flag); o.fixed = true; Engine.doShake(16); Audio.sfx('quake'); yield E.say(text); } });
  // ====================== outside: the ziggurat in its field ======================
  const X = grid(26, 30, 'r');
  fill(X, 0, 0, 25, 1, 'T'); fill(X, 0, 0, 1, 29, 'T'); fill(X, 24, 0, 25, 29, 'T'); fill(X, 0, 28, 25, 29, 'T'); fill(X, 12, 28, 13, 29, 'p');
  for (const [x, y] of [[3, 4], [22, 4], [3, 24], [22, 24], [4, 14], [21, 14], [7, 26], [18, 26], [2, 9], [23, 19]]) X[y][x] = 'T';
  fill(X, 5, 12, 20, 20, '#'); fill(X, 8, 8, 17, 12, '#'); fill(X, 10, 5, 15, 8, '#');   // the three tiers
  fill(X, 12, 21, 13, 27, 'p'); X[20][12] = 'D'; X[20][13] = 'D';
  defineMap('ankohl', {
    name: 'Ankohl Ruins', w: 26, h: 30, base: 'grass', music: 'ankohl', bg: 'grass', entry: { x: 12, y: 26 }, enc: [['Squirrelfang', 'Squirrelfang'], ['Dinox']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(X), LEG, WALL);
      M.walkable(12, 28, 2, 2); M.exit(12, 29, 2, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN);
      M.exit(12, 20, 2, 1, 'ank_1', 9, 13, DIR.UP, { door: true });
      M.sign(10, 22, 'The ruins of Ankohl: the great sanctum of Champa\'s ancestors. The trident\'s Left Prong is said to lie at the top.');
      M.trigger(11, 24, 4, 2, T3.ankohlEnter, { once: 'ankohl_entered' });
    }
  });
  T3.ankohlEnter = function* (E) { yield E.say('Ankohl Ruins. Obaba said the Left Prong is here - "at the top", the people of Champa say, and the way to the top is through the ruins.', 'Kraden'); yield E.say('The stones move for Psynergy. Sand, I think, more than anything.', 'Felix'); };
  // ====================== the roof: the Left Prong ======================
  room('ankohl_top', [
    '####################',
    '#..................#',
    '#..................#',
    '#....########......#',
    '#....########......#',
    '#..d...............#',
    '#..................#',
    '#..................#',
    '####################'], {
    name: 'Ankohl Ruins - Roof', entry: { x: 3, y: 6 }, enc: [],
    build(M) {
      M.exit(3, 5, 1, 1, 'ank_end', 1, 6, DIR.DOWN, { stairs: true });
      M.setObj(8, 3, 'ak_face_lit'); M.setObj(9, 3, 'ak_face_lit');
      M.object('spot', 9, 4, { id: 'ank_prong', script: function* (E) { if (G.flag('left_prong_found')) { yield E.say('The stone face on the roof. Its mouth is empty now.'); return; } yield E.say('A great stone face, set into the roof... There is something in its mouth.'); G.set('left_prong_found'); yield E.give('Left Prong', 1); yield E.say('The Left Prong! That makes all three - Obaba can forge the trident whole again.', 'Kraden'); } });
      M.sign(3, 6, 'The roof of the ruins. The whole of the Angara coast lies below.');
    }
  });
  // ====================== the entrance hall ======================
  room('ank_1', [
    '####################',
    '####################',
    '#########D##########',
    '#c......#.#.......c#',
    '#.......#.#........#',
    '#....b.............#',
    '#c............b...c#',
    '#..................#',
    '#..b..........b....#',
    '#....b......b......#',
    '#c................c#',
    '#..................#',
    '#..................#',
    '#########..#########',
    '#########D##########',
    '####################'], {
    name: 'Ankohl Ruins - Entrance', entry: { x: 9, y: 13 },
    build(M) {
      door(M, 9, 14, 'ankohl', 12, 21, DIR.DOWN); door(M, 9, 2, 'ank_hub', 13, 13);
      bushes(M, 'ank_bush1', 9, 4, function* (E) { yield E.say('The overgrowth is torn away. The way north stands open.'); });
      M.sign(4, 12, 'Six chests, all empty long ago. Overgrowth everywhere - most of it hides nothing.');
    }
  });
  // ====================== the central chamber: the six faces ======================
  const HB = grid(26, 16, '#');
  fill(HB, 2, 5, 23, 13, '.'); HB[14][13] = 'D'; for (const x of [3, 7, 11, 15, 19, 23]) { HB[4][x] = '.'; HB[3][x] = 'D'; } HB[2][3] = '.'; HB[2][7] = '.'; HB[3][3] = '.'; HB[3][7] = '.'; HB[12][1] = 'D'; HB[8][24] = 'D'; HB[6][1] = 'D';
  room('ank_hub', strs(HB), {
    name: 'Ankohl Ruins - Central Chamber', entry: { x: 13, y: 13 },
    build(M) {
      door(M, 13, 14, 'ank_1', 9, 3, DIR.DOWN); door(M, 11, 3, 'ank_m3', 5, 8); door(M, 15, 3, 'ank_m4', 4, 6); door(M, 19, 3, 'ank_m5', 6, 8); door(M, 23, 3, 'ank_m6', 4, 6);
      door(M, 1, 12, 'ank_l1', 22, 4, DIR.LEFT); door(M, 24, 8, 'ank_r1', 1, 6, DIR.RIGHT); door(M, 1, 6, 'ank_back', 17, 3, DIR.LEFT);
      // the six stone faces before the six mouths: Moved aside, each shows its passage
      for (const [i, x] of [3, 7, 11, 15, 19, 23].entries()) M.object('statue_move', x, 5, { id: 'ank_face' + i, tile: i % 2 ? 'ak_face_r' : 'ak_face_l', poundable: false });
      M.sign(13, 7, 'Six mouths in the north wall, and a stone face before each one. Two of the mouths are shallow. West and east, the ways on.');
    }
  });
  // mouth 3: Sand under the low wall to the Nut; 4: 210 coins; 5: the overgrowth and the column; 6: Crystal Powder
  room('ank_m3', ['############', '#..#.......#', '#..#.......#', '#s.L.......#', '####.......#', '#..........#', '#..........#', '#..........#', '#..........#', '#####D######'], {
    name: 'Ankohl Ruins - Third Mouth', entry: { x: 5, y: 8 },
    build(M) { door(M, 5, 9, 'ank_hub', 11, 4, DIR.DOWN); M.set(2, 3, 'ak_sand'); M.set(4, 3, 'ak_sand'); M.chest(2, 1, 'Nut', 1); M.sign(8, 3, 'A walled-off corner, and soft sand under the low wall.'); }
  });
  room('ank_m4', ['##########', '#........#', '#........#', '#........#', '#........#', '#........#', '#........#', '####D#####'], {
    name: 'Ankohl Ruins - Fourth Mouth', entry: { x: 4, y: 6 },
    build(M) { door(M, 4, 7, 'ank_hub', 15, 4, DIR.DOWN); M.chest(4, 1, 'Coins', 1, { coins: 210 }); }
  });
  room('ank_m5', ['##############', '#......#.....#', '#......#.....#', '#......D.....#', '#......#.....#', '#bbbbb.bbbbb.#', '#............#', '#............#', '#............#', '######D#######'], {
    name: 'Ankohl Ruins - Fifth Mouth', entry: { x: 6, y: 8 },
    build(M) {
      door(M, 6, 9, 'ank_hub', 19, 4, DIR.DOWN);
      M.setObj(12, 5, 'bush'); bushes(M, 'ank_bush5', 6, 5, function* (E) { yield E.say('The overgrowth is torn away. A column stands in the doorway of the back room.'); });
      // the column in the doorway through to the right way: Moved aside, the door is open
      M.object('pillar', 6, 3, { id: 'ank_col5', onMove: function* (E) { if (G.flag('ank_col5')) return; G.set('ank_col5'); Engine.doShake(8); yield E.say('The column grinds aside - and behind it a door leads on, east through the ruins.'); } });
      M.exit(7, 3, 1, 1, 'ank_r1', 1, 10, DIR.RIGHT, { door: true, cond: () => G.flag('ank_col5') });
      M.sign(11, 7, 'Overgrowth right across the room. A doorway in the wall behind it, and a column standing before it.');
    }
  });
  room('ank_m6', ['##########', '#........#', '#........#', '#........#', '#........#', '#........#', '#........#', '####D#####'], {
    name: 'Ankohl Ruins - Sixth Mouth', entry: { x: 4, y: 6 },
    build(M) { door(M, 4, 7, 'ank_hub', 23, 4, DIR.DOWN); M.chest(4, 1, 'Crystal Powder', 1); }
  });
  // ====================== the left way ======================
  // the lowest path west to the stair; the upper-left bush over the low floor the sand fills
  room('ank_l1', [
    '########################',
    '#.........##############',
    '#.........##############',
    '#xxxxxxxx.##############',
    '#xxxxxxxx.###..........D',
    '#xxxxxxxx.###..........#',
    '#.........###..........#',
    '#.....######..........##',
    '#.....######.........###',
    '#....................###',
    '#....................###',
    '#u...................###',
    '########################'], {
    name: 'Ankohl Ruins - West Hall', entry: { x: 22, y: 4 },
    build(M) {
      door(M, 23, 4, 'ank_hub', 2, 12, DIR.RIGHT); M.exit(1, 11, 1, 1, 'ank_l2', 2, 8, DIR.UP, { stairs: true });
      if (G.flag('ank_sand1')) for (let y = 3; y <= 5; y++) for (let x = 1; x <= 8; x++) M.set(x, y, 'ak_sand');
      // the upper-left bush: the hidden stair down is under it
      bushes(M, 'ank_bush_l1', 1, 1, function* (E) { if (G.flag('ank_stairs')) return; G.set('ank_stairs'); Engine.doShake(8); Audio.sfx('push'); const MM = G.field.map; persistObjTile(MM, 1, 1, 'stairs_down'); persistWalkable(MM, 1, 1); MM.finalize(); yield E.say('Under the bush: a stairway, cut down into the dark!'); });
      if (G.flag('ank_stairs')) { M.setObj(1, 1, 'stairs_down'); M.walkable(1, 1); }
      M.exit(1, 1, 1, 1, 'ank_b1', 2, 1, DIR.DOWN, { stairs: true, cond: () => G.flag('ank_stairs') });
      M.sign(3, 9, G.flag('ank_sand1') ? 'The low floor is full of sand now. The bush in the top corner can be reached.' : 'A low floor, sunk below the hall, and a bush in the top corner across it. The stair up is at the far left.');
    }
  });
  // Sand under the wall to the Thanatos Mace; the back room's door up top
  room('ank_l2', [
    '##################',
    '#######D##########',
    '#.......#........#',
    '#.......#........#',
    '#.......#........#',
    '#......sLs.......#',
    '#.......#........#',
    '#.......#........#',
    '#.......#........#',
    '#.u.....#........#',
    '##################'], {
    name: 'Ankohl Ruins - The Sandy Room', entry: { x: 2, y: 8 },
    build(M) { M.exit(2, 9, 1, 1, 'ank_l1', 1, 10, DIR.DOWN, { stairs: true }); door(M, 7, 1, 'ank_l3', 6, 8); M.chest(11, 2, 'Thanatos Mace', 1); M.sign(4, 3, 'The east half of the room is walled off; soft sand lies under the low wall. The door up top leads to the back room.'); }
  });
  // the left half of a face: pushed into its place, the sand pours into the west hall's low floor
  room('ank_l3', [
    '##############',
    '#............#',
    '#......o.....#',
    '#............#',
    '#............#',
    '#............#',
    '#............#',
    '#............#',
    '#............#',
    '######D#######'], {
    name: 'Ankohl Ruins - Back Room', entry: { x: 6, y: 8 },
    build(M) {
      door(M, 6, 9, 'ank_l2', 7, 2, DIR.DOWN);
      facePart(M, 'ank_half_l', 3, 2, 'ak_face_l', 7, 2, 'ank_sand1', 'The half of the face settles into its place with a boom - and a hiss of sand starts up somewhere below: the low floor of the west hall is filling!');
      M.sign(10, 7, 'A carved socket in the floor, and the left half of a stone face lying to the west of it.');
    }
  });
  // ====================== the cellar ======================
  // down the stair: Power Bread; Sand under the wall into the far corner, and the stair up from it
  room('ank_b1', [
    '##################',
    '#d....#..........#',
    '#.....#..........#',
    '#.....#..........#',
    '#.....D..........#',
    '#.....######L#####',
    '#.....#..........#',
    '#.....#..........#',
    '#.....#.........u#',
    '##################'], {
    name: 'Ankohl Ruins - Cellar', entry: { x: 2, y: 1 },
    build(M) {
      M.exit(1, 1, 1, 1, 'ank_l1', 1, 2, DIR.DOWN, { stairs: true }); M.exit(16, 8, 1, 1, 'ank_b2', 2, 11, DIR.UP, { stairs: true });
      M.set(12, 4, 'ak_sand'); M.set(12, 6, 'ak_sand'); M.chest(2, 7, 'Power Bread', 1);
      M.sign(9, 2, 'The cellar. Its far corner is walled off but for a low wall over soft sand.');
    }
  });
  // the long cellar corridor: the back room's pillar (Moved left, through the wall), the way to the switch room
  room('ank_b2', [
    '##D#######################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................D',
    '#........................#',
    '#...............####D#####',
    '#...............#........#',
    '#...............#........#',
    '#...............#........#',
    '#...............#........#',
    '#.u.............#........#',
    '##########################'], {
    name: 'Ankohl Ruins - Cellar Corridor', entry: { x: 2, y: 11 },
    build(M) {
      M.exit(2, 12, 1, 1, 'ank_b1', 16, 7, DIR.DOWN, { stairs: true }); door(M, 2, 0, 'ank_b3', 6, 10); door(M, 25, 5, 'ank_sw1', 1, 8, DIR.RIGHT);
      // the back room's pillar in its upper-left corner: Moved left, it breaks through into the room beyond
      if (!G.flag('ank_b2_pillar')) M.object('pillar', 18, 8, { id: 'ank_b2_pil', onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === 'ank_b2_pil'); if (!o || o.x !== 17 || o.y !== 8) return; G.set('ank_b2_pillar'); gone(o); Engine.doShake(14); Audio.sfx('quake'); yield E.say('The pillar grinds into the wall - and the old stones give! It topples through into the room beyond and stands there in the soft sand.'); } });
      M.sign(6, 2, 'A long corridor. A door up top, the far right on to the switch room, and a back room at the lower right.');
    }
  });
  // the Vial behind the wall the pillar came through (Sand under the pillar), 365 coins to the south
  room('ank_b3', [
    '##############',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '#.....#......#',
    '######.......#',
    '######D#######'], {
    name: 'Ankohl Ruins - Sealed Room', entry: { x: 6, y: 10 },
    build(M) {
      door(M, 6, 11, 'ank_b2', 2, 1, DIR.DOWN);
      M.chest(2, 1, 'Vial', 1); M.chest(11, 9, 'Coins', 1, { coins: 365 });
      // the wall between: the pillar that came through it stands in the gap, on sand - Sand goes under it
      if (G.flag('ank_b2_pillar')) { M.setObj(6, 5, null); M.set(6, 5, 'ak_sand'); M.walkable(6, 5); M.set(7, 5, 'ak_sand'); M.set(5, 5, 'ak_sand'); M.object('pillar', 6, 5, { id: 'ank_b3_pil', poundable: false }); }
      M.sign(9, 2, G.flag('ank_b2_pillar') ? 'The pillar from the corridor stands in the broken wall, on soft sand.' : 'The west half of this room is sealed off by a wall. Nothing here moves it.');
    }
  });
  // ====================== the switch rooms: the sand rises ======================
  const swRoom = (id, name, backTo, backX, backY, onTo, onX, onY, flagA, flagB, pace) => {
    const R = grid(20, 12, '#'); fill(R, 1, 2, 18, 9, '.'); fill(R, 5, 2, 14, 9, 'x'); R[8][0] = 'D'; R[1][10] = 'D';
    defineMap(id, {
      name, w: 20, h: 12, base: 'void', music: 'ankohl', bg: 'ruins', indoor: true, entry: { x: 1, y: 8 }, enc: ENC, retreat: WORLD,
      build(M) {
        const rows = R.map(r => r.slice()); if (G.flag(flagA)) fill(rows, 5, 2, 14, 9, 's');
        M.paint(0, 0, strs(rows), LEG, WALL);
        door(M, 0, 8, backTo, backX, backY, DIR.LEFT); M.exit(10, 1, 1, 1, onTo, onX, onY, DIR.UP, { door: true, cond: () => G.flag(flagB) });
        sw(M, id + '_sw1', 2, 4, flagA, function* (E) { yield E.say('The switch sinks - and sand begins to pour into the low floor from the walls!' + (pace < 12 ? ' It is rising fast!' : '')); yield* sandFill(E, pitCells(5, 2, 14, 9), pace); yield E.say('The low floor is full of sand. The second switch can be reached.'); });
        sw(M, id + '_sw2', 17, 4, flagB, function* (E) { Engine.doShake(10); yield E.say('The second switch sinks, and the door in the north wall grinds open!'); });
        M.sign(3, 8, 'Two switches, and a low floor between them too wide to jump. The door north is sealed.');
      }
    });
  };
  swRoom('ank_sw1', 'Ankohl Ruins - Switch Room', 'ank_b2', 24, 5, 'ank_gaps', 1, 8, 'ank_sw1_sand', 'ank_sw1_done', 18);
  swRoom('ank_sw2', 'Ankohl Ruins - Second Switch Room', 'ank_r4', 14, 4, 'ank_r5', 11, 7, 'ank_sw2_sand', 'ank_sw2_done', 6);
  // the corridor of gaps and the slide down
  defineMap('ank_gaps', {
    name: 'Ankohl Ruins - The Gaps', w: 22, h: 11, base: 'void', music: 'ankohl', bg: 'ruins', indoor: true, entry: { x: 1, y: 8 }, enc: ENC, retreat: WORLD, fall: { map: 'ank_pillars', x: 10, y: 2 },
    build(M) {
      M.paint(0, 0, [
        '######################',
        '#....................#',
        '#.g..g..g..g..g..g.S.#',
        '#.g..g..g..g..g..g...#',
        '#.g..g..g..g..g..g...#',
        '#.g..g..g..g..g..g...#',
        '#.g..g..g..g..g..g...#',
        '#.g..g..g..g..g..g...#',
        '#.g..g..g..g..g..g...#',
        '#D...................#',
        '######################'], LEG, WALL);
      for (let y = 2; y <= 8; y++) for (const x of [2, 5, 8, 11, 14, 17]) M.setObj(x, y, null);
      for (const x of [2, 5, 8, 11, 14, 17]) { M.set(x, 1, 'ak_gap'); M.set(x, 9, 'ak_gap'); }
      door(M, 1, 9, 'ank_sw1', 10, 2, DIR.DOWN); M.setObj(1, 9, 'ak_door'); M.set(1, 9, 'ak_floor'); M.set(1, 1, 'ak_floor');
      M.sign(20, 1, 'Cracks across the corridor, one after another, and a slide at the end of it.');
    }
  });
  // below the slide: the chasm across the room, the brown pillar into it, the face's part over it into its socket
  room('ank_pillars', [
    '####################',
    '####D###############',
    '#........x.........#',
    '#........x.........#',
    '#........x.........#',
    '#........x.........#',
    '#........x.........#',
    '#....o...x.........#',
    '#........x.........#',
    '#........x.........#',
    '#........x........v#',
    '####################'], {
    name: 'Ankohl Ruins - Below the Slide', entry: { x: 10, y: 2 },
    build(M) {
      M.exit(4, 1, 1, 1, 'ank_p2', 9, 9, DIR.UP, { door: true, cond: () => G.flag('ank_face2') }); M.exit(18, 10, 1, 1, 'ank_back', 1, 2, DIR.DOWN, { cond: () => G.flag('ank_face2') });
      M.object('pillar', 11, 7, { id: 'ank_brown', tile: 'gr_rock', poundable: false });
      facePart(M, 'ank_part2', 14, 7, 'ak_face_r', 5, 7, 'ank_face2', 'The face\'s part settles into its socket. The door in the north wall and the vines at the far corner shudder free of their stone.');
      M.sign(3, 2, 'A chasm across the room, a carved socket on its west side, a stone face\'s part and a brown pillar on its east. The doors are sealed.');
    }
  });
  // the upper passage round the block: the pillar in the right-hand corridor, Moved up and out of the way
  room('ank_p2', [
    '####################',
    '#..................#',
    '#.################.#',
    '#.################.#',
    '#.################.#',
    '#.################.#',
    '#.################.#',
    '#.################.#',
    '#.################.#',
    '#..................#',
    '#########D##########',
    '####################'], {
    name: 'Ankohl Ruins - Upper Passage', entry: { x: 9, y: 9 },
    build(M) {
      door(M, 9, 10, 'ank_pillars', 4, 2, DIR.DOWN);
      M.object('pillar', 18, 5, { id: 'ank_p2_pil', onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === 'ank_p2_pil'); if (!o || G.flag('ank_p2_pillar') || o.y !== 1) return; G.set('ank_p2_pillar'); yield E.say('The pillar is out of the corridor. Somewhere east, a way that was blocked is open.'); } });
      M.sign(4, 9, 'A passage round three sides of a great block of stone. A pillar stands in the right-hand corridor.');
    }
  });
  // the way back to the central chamber: down the vine, along the passage, Sand under the wall
  room('ank_back', [
    '####################',
    '#v.................#',
    '#.##################',
    '#......sLs........D#',
    '####################'], {
    name: 'Ankohl Ruins - The Way Back', entry: { x: 1, y: 2 },
    build(M) { M.exit(1, 1, 1, 1, 'ank_pillars', 18, 9, DIR.UP); door(M, 18, 3, 'ank_hub', 2, 6, DIR.RIGHT); M.set(1, 1, 'ak_floor'); M.setObj(1, 1, 'ak_vine'); M.walkable(1, 1); }
  });
  // ====================== the right way ======================
  // Sand to the stair in the middle of the room
  room('ank_r1', [
    '####################',
    '#..................#',
    '#..................#',
    '#....########......#',
    '#....#......#......#',
    '#....#..u...#......#',
    'D...sLs.....#......#',
    '#....#......#......#',
    '#....########......#',
    '#..................#',
    'D..................#',
    '####################'], {
    name: 'Ankohl Ruins - East Hall', entry: { x: 1, y: 6 },
    build(M) { door(M, 0, 6, 'ank_hub', 23, 8, DIR.LEFT); door(M, 0, 10, 'ank_m5', 6, 3, DIR.LEFT); M.exit(8, 5, 1, 1, 'ank_r2', 9, 8, DIR.UP, { stairs: true }); M.sign(16, 2, 'A walled square in the middle of the hall, with a stair inside it. Soft sand runs under its west wall.'); }
  });
  // upstairs: the Muni Robe behind the overgrowth, the doorway west to the blocks
  room('ank_r2', [
    '####################',
    '#..#...............#',
    '#..#...............#',
    '##.#...............#',
    'D..................#',
    '#.....########.....#',
    '#.....########.....#',
    '#.....########.....#',
    '#..................#',
    '#........d.........#',
    '####################'], {
    name: 'Ankohl Ruins - Upper East Hall', entry: { x: 9, y: 8 },
    build(M) {
      M.exit(9, 9, 1, 1, 'ank_r1', 8, 6, DIR.DOWN, { stairs: true }); door(M, 0, 4, 'ank_r3', 17, 6, DIR.LEFT);
      bushes(M, 'ank_bush_r2', 2, 3, function* (E) { yield E.say('The overgrowth is torn away from a nook in the wall.'); }); M.chest(1, 1, 'Muni Robe', 1);
      M.sign(15, 3, 'Overgrowth over a nook on the left; a doorway in the west wall below it.');
    }
  });
  // the square blocks on the sand: Sand goes under them; the far door is held until the pillar in the upper passage moves
  room('ank_r3', [
    '####################',
    '#.......sss........#',
    '#.......sss........#',
    '#.......sss........#',
    '#.......sss........#',
    '#.......sss........#',
    'D.......sss.......D#',
    '#.......sss........#',
    '#.......sss........#',
    '#.......sss........#',
    '####################'], {
    name: 'Ankohl Ruins - The Blocks', entry: { x: 17, y: 6 },
    build(M) {
      door(M, 18, 6, 'ank_r2', 1, 4, DIR.RIGHT); door(M, 0, 6, 'ank_r4', 7, 6, DIR.LEFT);
      for (let y = 1; y <= 9; y++) for (let x = 8; x <= 10; x++) M.object('block', x, y, { id: 'ank_blk_' + x + '_' + y, tile: 'ak_block' });
      M.object('gate', 1, 6, { id: 'ank_r3_gate', tile: 'ak_block', state: G.flag('ank_p2_pillar') ? 'open' : null, script: function* (E) { yield E.say('A block wedged in the doorway. It is held from somewhere else - a pillar, further in.'); } });
      M.sign(13, 2, 'Square blocks stand three deep across the room, on soft sand.');
    }
  });
  // the Sylph Feather behind the overgrowth; the east door to the second switch room
  room('ank_r4', [
    '################',
    '#..#...........#',
    '#..#...........#',
    '##.#...........#',
    '#..............D',
    '#..............#',
    '#..............#',
    '#......D.......#',
    '################'], {
    name: 'Ankohl Ruins - The Feather', entry: { x: 7, y: 6 },
    build(M) {
      door(M, 7, 7, 'ank_r3', 1, 6, DIR.DOWN); door(M, 15, 4, 'ank_sw2', 1, 8, DIR.RIGHT);
      bushes(M, 'ank_bush_r4', 2, 3, function* (E) { yield E.say('The overgrowth is torn away from a nook in the wall.'); }); M.chest(1, 1, 'Sylph Feather', 1);
      M.sign(9, 2, 'Overgrowth over a nook on the left. A door east.');
    }
  });
  // past the quicker switches: the overgrowth on the right, the pillar, the vines and the gap to the Potion; the leftmost door
  room('ank_r5', [
    '####################',
    '#..#..........#..g.#',
    '#..#..........####v#',
    '#D.#..........##.#v#',
    '#..#...............#',
    '#.............######',
    '#..#...............#',
    '#..#...............#',
    '#..#.......D.......#',
    '####################'], {
    name: 'Ankohl Ruins - The Potion', entry: { x: 11, y: 7 },
    build(M) {
      door(M, 11, 8, 'ank_sw2', 10, 2, DIR.DOWN); door(M, 1, 3, 'ank_face_r', 8, 7, DIR.LEFT);
      bushes(M, 'ank_bush_r5', 14, 4, function* (E) { yield E.say('The overgrowth is torn off a doorway in the wall.'); });
      M.object('pillar', 16, 4, { id: 'ank_r5_pil' }); M.chest(15, 1, 'Potion', 1);
      M.sign(6, 2, 'A walled nook on the right, under overgrowth. The leftmost door leads on.');
    }
  });
  // the right half of the face: pushed home, the eyes light; the vines down into the face's corridor
  room('ank_face_r', [
    '##############',
    '#v...........#',
    '#............#',
    '#....o.......#',
    '#............#',
    '#............#',
    '#............#',
    '#............#',
    '#.......D....#',
    '##############'], {
    name: 'Ankohl Ruins - The Face', entry: { x: 8, y: 7 },
    build(M) {
      door(M, 8, 8, 'ank_r5', 1, 4, DIR.DOWN);
      M.setObj(4, 3, 'ak_face_l');   // the left half, already in its socket
      if (G.flag('ank_eyes')) { M.setObj(4, 3, 'ak_face_lit'); M.setObj(5, 3, 'ak_face_lit'); }
      else M.object('statue_move', 9, 5, { id: 'ank_half_r', tile: 'ak_face_r', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === 'ank_half_r'); if (!o || o.x !== 5 || o.y !== 3) return; G.set('ank_eyes'); gone(o); const MM = G.field.map; persistObjTile(MM, 4, 3, 'ak_face_lit'); persistObjTile(MM, 5, 3, 'ak_face_lit'); MM.finalize(); Engine.doFlash(12, '#a0ff80'); Audio.sfx('quake'); yield E.say('The right half settles against the left, and the face is whole - its eyes glow a sickly green! Far below, stone grinds: the face in the corridor is awake.'); } });
      M.exit(1, 1, 1, 1, 'ank_chase', 1, 2, DIR.DOWN, { cond: () => G.flag('ank_eyes') });
      M.sign(11, 7, 'The left half of a stone face sits in its socket; the right half lies loose. Vines hang down the west wall.');
    }
  });
  // the corridor the awake face roams: the sand hides the party from it; then Sand under the upper wall
  room('ank_chase', [
    '######################',
    '#v##################D#',
    '#.##################L#',
    '#.##################.#',
    '#.##################.#',
    '#.......ss...........#',
    '######################'], {
    name: 'Ankohl Ruins - The Awake Face', entry: { x: 1, y: 2 },
    build(M) {
      M.exit(1, 1, 1, 1, 'ank_face_r', 1, 2, DIR.UP); door(M, 20, 1, 'ank_f2', 8, 9);
      M.set(20, 3, 'ak_sand');
      // the face slides along the corridor; caught, the party is shoved back to the vines. In the sand, it passes over
      const shoved = function* (E) { Audio.sfx('push'); Engine.doShake(10); yield E.say('The stone face bears down on the party and shoves them back the way they came!'); yield Engine.fadeOut(10); E.warpNow('ank_chase', 1, 2, DIR.DOWN); yield Engine.fadeIn(10); };
      M.object('tornado', 19, 5, { id: 'ank_awake', tile: 'ak_face_lit', x0: 2, x1: 19, speed: 20, dx: -1, onHit: shoved, active: () => G.flag('ank_eyes') });
      M.sign(3, 4, 'A long low corridor with a patch of soft sand in it, and a way up at its far end under a low wall.');
    }
  });
  // the two halls: the pillar in the doorway between them, Moved for the way through (and the shortcut back)
  room('ank_f2', [
    '####################',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    'D........#.........D',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '########D###########'], {
    name: 'Ankohl Ruins - Two Halls', entry: { x: 8, y: 9 },
    build(M) {
      door(M, 8, 10, 'ank_chase', 20, 3, DIR.DOWN); door(M, 19, 4, 'ank_reveal', 1, 5, DIR.RIGHT); M.exit(0, 4, 1, 1, 'ank_end', 14, 3, DIR.LEFT, { door: true, cond: () => G.flag('ank_face3') });
      M.setObj(9, 4, null); M.set(9, 4, 'ak_floor'); M.walkable(9, 4); M.object('pillar', 9, 4, { id: 'ank_f2_pil' });
      M.sign(3, 2, 'Two halls, a pillar in the doorway between them. East, on; west, a way that is sealed.');
    }
  });
  // brown and red stones, a part of a stone face: Reveal shows the gap in the stones, the part is pushed into it
  room('ank_reveal', [
    '####################',
    '#......R....B......#',
    '#..B.......R.......#',
    '#........R.........#',
    '#..R....B......B...#',
    'D..................#',
    '#..........R...B...#',
    '#....R.......B.....#',
    '#.B.......R........#',
    '#...........d......#',
    '####################'], {
    name: 'Ankohl Ruins - The Stones', entry: { x: 1, y: 5 },
    build(M) {
      door(M, 0, 5, 'ank_f2', 18, 4, DIR.LEFT);
      M.exit(12, 9, 1, 1, 'ank_end', 6, 2, DIR.DOWN, { stairs: true, cond: () => G.flag('ank_gap_filled') });
      // the gap in the floor only Reveal shows: the part of the face, pushed onto it while it is seen, drops in
      M.hidden.push({ x: 8, y: 6, tile: 'ak_crack' });
      if (!G.flag('ank_gap_filled')) M.object('statue_move', 5, 6, { id: 'ank_part3', tile: 'ak_face_l', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === 'ank_part3'); if (!o || o.x !== 8 || o.y !== 6) return; if (!G.field.revealed(8, 6)) { yield E.say('The part of the face stands over the floor here. The stones under it look no different from the rest... to the eye.'); return; } G.set('ank_gap_filled'); gone(o); const MM = G.field.map; persistObjTile(MM, 8, 6, 'pillar_sunk'); MM.finalize(); Engine.doShake(14); Audio.sfx('quake'); yield E.say('The part drops into the gap Reveal showed, and fills it! The stair in the corner grinds open.'); } });
      else M.setObj(8, 6, 'pillar_sunk');
      M.sign(15, 9, 'Brown and red stones lie all about, and a part of a stone face among them. The stair in the corner is sealed.');
    }
  });
  // downstairs: the last face into its socket; Sand under the low wall to the corner stair, and up to the roof
  room('ank_end', [
    '################',
    '#.....d........#',
    '#..............#',
    '#o.............D',
    '#..............#',
    '##L#############',
    '#...############',
    '#u..############',
    '################'], {
    name: 'Ankohl Ruins - The Last Face', entry: { x: 6, y: 2 },
    build(M) {
      M.exit(6, 1, 1, 1, 'ank_reveal', 12, 8, DIR.UP, { stairs: true }); door(M, 15, 3, 'ank_f2', 1, 4, DIR.RIGHT);
      M.exit(1, 7, 1, 1, 'ankohl_top', 3, 6, DIR.UP, { stairs: true, cond: () => G.flag('ank_face3') });
      facePart(M, 'ank_part4', 5, 3, 'ak_face_r', 1, 3, 'ank_face3', 'The last face is in its place. The whole ruin seems to sigh - the sealed ways stand open, and the stair in the far corner leads up.');
      M.sign(9, 4, 'A socket in the west wall, a face\'s part to push into it, and a low wall over soft sand before the corner stair.');
    }
  });
}
