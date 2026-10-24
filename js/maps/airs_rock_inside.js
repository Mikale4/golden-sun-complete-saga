// ---------- Air's Rock (interior) ----------
// After map references/Air's Rock Interior Map.png, condensed: one passage in, then the great chamber on three
// levels with its dot-marked doors, and the rooms off it. Per the guide: the cone-pillar room (Pound the right
// cone, the gust off the twister rock breaks on the left one and into the wall, the Wind Stone beyond, a pillar
// for a stepping stone) to the three-red-dots room (the vents in the floor: a pillar over one stops it, a pillar
// off one frees it to ride; the lone pillar and the statue's whirl up to Flora's tablet); three blue dots (the
// wall segments a Wind Stone turns, to bridge the chasm one way or the other; a pillar for the shortcut); four
// blue dots (Elixir, the tightrope north, the wall turned again, the slide not to take, the hop, 666 Coins on the
// island); the crystal room below (the Psynergy stone, the twister rock that wakes every statue, the face south
// that lifts the party to the Vial's room); the room on the left (the pillar off the shaft, the whirl across, the
// statue moved off the second, Clarity Circlet, the vent freed for the way out); five blue dots (Vial, the statue
// moved so the right-hand way is safe); the centre (the stepping stones, the tablet where Sheba learns Reveal,
// Psy Crystal for Reveal to find); the back door out to the summit.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const IN_ENC = [['Creeper II', 'Creeper II'], ['Dino'], ['Emu', 'Emu'], ['Ghoul II'], ['Harpy II', 'Harpy II'], ['Kobold II', 'Kobold II'], ['Mummy']];
  const WORLD = { map: 'world_tla', x: 211, y: 219, dir: DIR.DOWN };
  const LEG = {
    '.': 'ar_infloor', 'g': 'pit', 'x': 'chasm', 'm': 'marble', 'k': 'ar_crystal', 'y': 'ar_dots_y2', '3': 'ar_dots_r3', 'b': 'ar_dots_b3', '4': 'ar_dots_b4', '5': 'ar_dots_b5',
    'c': { ground: 'ar_infloor', obj: 'ladder', walk: true }, 'r': { ground: 'pit', obj: 'rope', walk: true }, 'S': 'cb_slide', 'D': { ground: 'ar_infloor', obj: 'lc_door' }, 'h': 'pit', 'v': 'vent',
    'o': { ground: 'ar_infloor', obj: 'grey_rock' }, 'K': { ground: 'ar_crystal', obj: 'crystal_rock' }, 'P': { ground: 'ar_infloor', obj: 'pillar_base' }
  };
  const BROWN = { cliff: '#', set: 'brownrock', faces: 2 };
  const room = (id, name, rows, opts, build) => defineMap(id, Object.assign({ name: "Air's Rock - " + name, w: rows[0].length, h: rows.length, base: 'void', music: 'airsrock', bg: 'ruins', indoor: true, enc: IN_ENC, retreat: WORLD }, opts, {
    build(M) { M.paint(0, 0, strs(rows), LEG, BROWN); rows.forEach((r, y) => r.forEach((ch, x) => { if (ch === 'P' && y > 0) M.setObj(x, y - 1, 'pillar_top'); })); build(M); }
  }));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.setObj(x, y, 'lc_door'); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const windStone = (M, id, x, y, onWind) => M.object('windstone', x, y, { id, onWind });
  const twisterRock = (M, id, x, y, onWind, top) => { M.object('twister', x, y, { id, tile: 'twister_rock', onWind }); if (top !== false) M.setObj(x, y - 1, 'twister_rock_top'); };
  const barrier = (M, id, x, y, tile) => M.object('sandwall', x, y, { id, tile: tile || 'sandwall' });
  const updraft = (M, id, x, y, to, opts) => M.object('updraft', x, y, Object.assign({ id, to }, opts || {}));
  const vent = (M, id, x, y, to, opts) => M.object('updraft', x, y, Object.assign({ id, to, tile: 'vent' }, opts || {}));
  const blowAway = function* (E, ids, flag, text) { const MM = G.field.map; let any = false; for (const o of MM.objects) if (ids.includes(o.id) && !o.gone) { o.gone = true; G.set('obj:' + o.key, { gone: true }); any = true; } if (flag) G.set(flag); if (any) { Engine.doShake(12); Audio.sfx('push'); yield E.say(text); } else yield E.say('The gust finds nothing more to move.'); };
  const statuesOn = () => !!G.flag('airs_statues_on');
  // a wall segment that turns: across (cx-1..cx+1, cy) or along (cx, cy-1..cy+1), a bridge over the chasm either way
  const rotWall = (M, id, cx, cy, start) => {
    const state = () => G.get('rw:' + id) || start || 'v';
    const apply = () => { const st = state(); for (const [x, y] of [[cx - 1, cy], [cx + 1, cy]]) M.set(x, y, st === 'h' ? 'ar_span' : 'pit'); for (const [x, y] of [[cx, cy - 1], [cx, cy + 1]]) M.set(x, y, st === 'v' ? 'ar_span_v' : 'pit'); M.set(cx, cy, st === 'h' ? 'ar_span' : 'ar_span_v'); };
    apply();
    return function* (E) { G.set('rw:' + id, state() === 'h' ? 'v' : 'h'); apply(); M.finalize(); Engine.doShake(10); Audio.sfx('push'); yield E.say(state() === 'h' ? 'The gust catches the wall segment and it grinds round - it lies across the chasm now, a bridge.' : 'The gust catches the wall segment and it grinds round - it lies along the chasm now.'); };
  };
  // ====================== the way in ======================
  const E1 = grid(14, 14, '#');
  fill(E1, 5, 9, 7, 12, '.'); fill(E1, 2, 7, 7, 8, '.'); fill(E1, 2, 3, 3, 6, '.'); fill(E1, 2, 2, 11, 3, '.'); fill(E1, 10, 1, 11, 2, '.'); E1[13][6] = 'D'; E1[0][11] = 'D';
  room('airs_rock_in_entry', 'Passage', E1, { entry: { x: 6, y: 12 } }, (M) => {
    door(M, 6, 13, 'airs_rock_summit', 14, 4, DIR.DOWN); door(M, 11, 0, 'airs_rock_in_hall', 14, 2, DIR.UP);
    M.sign(3, 5, 'One way in. The wind comes down the passage from the chamber beyond, always.');
  });
  // ====================== the great chamber ======================
  const H = grid(30, 34, '#');
  fill(H, 2, 2, 27, 9, '.'); H[2][14] = 'y'; H[1][14] = 'D'; H[5][1] = 'D'; H[5][2] = 'b'; H[5][28] = 'D'; H[8][28] = 'D';   // the upper level: in from the passage, three blue dots west, the cone room and the red room's way back east
  fill(H, 6, 10, 6, 11, 'c');
  fill(H, 2, 12, 27, 19, '.'); H[15][1] = 'D'; H[15][2] = '4'; H[15][28] = 'D';   // the middle level: four blue dots west, the Vial's room east
  fill(H, 11, 16, 17, 16, '#'); fill(H, 11, 17, 11, 19, '#'); fill(H, 17, 17, 17, 19, '#'); fill(H, 11, 19, 17, 19, '#'); H[19][14] = 'D';   // the walled platform in the middle: the whirl lands on it, its door leads to the centre
  fill(H, 23, 20, 23, 21, 'c');
  fill(H, 2, 22, 27, 30, '.'); H[26][1] = 'D'; H[26][28] = 'D'; H[31][6] = 'D'; H[30][6] = '5'; H[31][14] = 'D'; H[31][27] = 'D';   // the lower level: the left room, the crystal room, five blue dots' way back, the centre's way back, the back door
  for (const [x, y] of [[4, 8], [25, 3], [9, 13], [20, 18], [4, 24], [25, 24], [10, 29]]) H[y][x] = 'o';
  for (const [x, y] of [[6, 4], [10, 4], [18, 4], [22, 4], [6, 14], [22, 14], [6, 25], [22, 25], [10, 24], [18, 24]]) H[y][x] = 'P';   // the columns
  room('airs_rock_in_hall', 'Great Chamber', H, { entry: { x: 14, y: 2 } }, (M) => {
    door(M, 14, 1, 'airs_rock_in_entry', 11, 1, DIR.UP); door(M, 1, 5, 'airs_rock_in_blue3', 22, 7, DIR.LEFT); door(M, 28, 5, 'airs_rock_in_cones', 1, 15, DIR.RIGHT); door(M, 28, 8, 'airs_rock_in_red3', 1, 3, DIR.RIGHT);
    door(M, 1, 15, 'airs_rock_in_blue4', 1, 5, DIR.LEFT); door(M, 28, 15, 'airs_rock_in_vial', 1, 7, DIR.RIGHT); door(M, 14, 19, 'airs_rock_in_center', 11, 1, DIR.DOWN);
    door(M, 1, 26, 'airs_rock_in_left', 24, 9, DIR.LEFT); door(M, 28, 26, 'airs_rock_in_crystal', 1, 7, DIR.RIGHT); door(M, 6, 31, 'airs_rock_in_blue5', 16, 7, DIR.DOWN); door(M, 14, 31, 'airs_rock_in_center', 20, 12, DIR.DOWN); door(M, 27, 31, 'airs_rock_summit', 24, 9, DIR.DOWN);
    // the statue on the lowest floor: its whirl, once the twister rock below has woken it, lifts the party to the walled platform
    M.setObj(14, 28, 'statue'); updraft(M, 'hall_u', 14, 27, { x: 14, y: 17 }, { active: statuesOn });
    M.sign(16, 3, 'The tiles before the doors are marked: dots of yellow, of red, of blue. Someone counted the rooms.');
    M.sign(16, 27, 'The statue faces the walled platform above. Its mouth is dry; nothing breathes from it yet.');
    M.trigger(13, 2, 3, 2, function* (E) { yield E.say('Look at the size of this place... and the doors. Two yellow dots under our feet. Red ones over there, blue on the other side.', 'Sheba'); yield E.say("The clan wrote in dots. Count them and we won't lose our way.", 'Kraden'); }, { once: 'airs_hall_seen' });
  });
  // ====================== the cone room ======================
  const C = grid(24, 20, '#');
  fill(C, 1, 2, 21, 4, '.'); fill(C, 10, 2, 10, 4, '#'); C[3][10] = '.'; C[2][17] = '#'; C[4][17] = '#'; C[3][17] = 'g'; C[3][22] = 'D'; C[3][21] = '3';   // the section behind the wall: the Wind Stone, its barrier, the pit for the stepping stone, three red dots
  C[6][9] = '.'; C[5][9] = '.';   // the crack the gust breaks open, and the step beyond it
  fill(C, 1, 7, 22, 11, '.'); fill(C, 3, 12, 20, 12, 'g'); fill(C, 1, 13, 22, 17, '.'); C[15][0] = 'D';   // the gust's row, the channel of pits, the floor the pillars start on
  room('airs_rock_in_cones', 'Cone Room', C, { entry: { x: 1, y: 15 } }, (M) => {
    door(M, 0, 15, 'airs_rock_in_hall', 27, 5, DIR.LEFT); door(M, 22, 3, 'airs_rock_in_red3', 1, 18, DIR.RIGHT);
    M.object('pillar', 6, 15, { id: 'cone_p1', tile: 'pillar_brown' }); M.object('pillar', 12, 15, { id: 'cone_p2', tile: 'pillar_brown' });
    M.object('pillar', 9, 9, { id: 'cone_g1', tile: 'cone' }); M.object('pillar', 15, 9, { id: 'cone_g2', tile: 'cone' });
    barrier(M, 'cone_crack', 9, 6, 'crack');
    twisterRock(M, 'cone_tr', 20, 9, function* (E) {
      const MM = G.field.map; const g1 = MM.objects.find(o => o.id === 'cone_g1'), g2 = MM.objects.find(o => o.id === 'cone_g2');
      if (G.flag('airs_cones_open')) { yield E.say('The gust goes along the row and out through the broken wall. It is done here.'); return; }
      if (g2.state !== 'sunk') { yield E.say('The gust howls along the row and breaks against the first cone. Nothing.'); return; }
      if (g1.state === 'sunk') { yield E.say('The gust howls the whole length of the row and dies against the far wall. Nothing.'); return; }
      Engine.doShake(12); yield 10; yield* blowAway(E, ['cone_crack'], 'airs_cones_open', 'The gust howls along the row, turns off the second cone and hits the wall north of it - the crack splits open!');
    });
    windStone(M, 'cone_ws', 3, 3, function* (E) { yield* blowAway(E, ['cone_sb'], null, 'The gust goes down the section and the barrier of sand is blown away!'); }); barrier(M, 'cone_sb', 10, 3);
    M.object('pillar', 13, 3, { id: 'cone_p3', tile: 'pillar_brown' });
    M.sign(2, 9, 'Two cones stand in the line of the twister rock. The gust that the cone turns is the one that matters.');
  });
  // ====================== three red dots ======================
  const R3 = grid(26, 22, '#');
  fill(R3, 1, 14, 24, 20, '.'); R3[18][0] = 'D'; R3[18][2] = '3';   // the floor at the entry
  fill(R3, 22, 6, 23, 13, '.');   // the way north, two wide, with its vents
  fill(R3, 1, 2, 23, 5, '.'); R3[3][0] = 'D';   // the top, back to the chamber
  fill(R3, 2, 8, 8, 12, '.');   // Flora's ledge, walled in
  fill(R3, 10, 8, 14, 12, 'g'); fill(R3, 11, 9, 13, 11, '.'); fill(R3, 10, 13, 14, 13, '.');   // the statue's island in its ring of pits, the approach below it
  room('airs_rock_in_red3', 'Three Red Dots', R3, { entry: { x: 1, y: 18 } }, (M) => {
    door(M, 0, 18, 'airs_rock_in_cones', 21, 3, DIR.LEFT); door(M, 0, 3, 'airs_rock_in_hall', 27, 8, DIR.LEFT);
    // the vents: a pillar pushed over one stops it; the way past is the other cell
    vent(M, 'r3_v1', 23, 12, { x: 22, y: 16 }); M.object('pillar', 22, 12, { id: 'r3_pa' });
    vent(M, 'r3_v2', 22, 8, { x: 22, y: 16 }); M.object('pillar', 23, 8, { id: 'r3_pb' });
    // the lone pillar, the pit it fills, the statue whose whirl (once woken) lifts the party to Flora's ledge
    M.object('pillar', 12, 15, { id: 'r3_pf' }); M.setObj(12, 9, 'statue'); updraft(M, 'r3_u', 12, 10, { x: 5, y: 10 }, { active: statuesOn });
    updraft(M, 'r3_back', 2, 12, { x: 12, y: 17 });
    M.object('statue', 4, 9, { id: 'flora_tablet', tile: 'ar_tablet', script: T3.floraTablet });
    M.sign(4, 16, 'Shafts run under this floor; the wind comes up through the gratings. Something heavy over a grating holds it.');
  });
  T3.floraTablet = function* (E) {
    if (G.flag('flora_taken')) { yield E.say('The tablet is blank now; Flora\'s summons is with Felix.'); return; }
    yield E.say('A stone tablet, cut with a woman in leaves and wind. The air around it is warm and green.');
    G.set('flora_taken'); Engine.doFlash(14, '#c0f0a0'); Audio.sfx('summon'); yield E.summon('Flora');
    yield E.say('Flora... a Venus summons, with the help of two Jupiter Djinn. She puts a whole field of foes to sleep.', 'Kraden');
  };
  // ====================== three blue dots ======================
  const B3 = grid(24, 16, '#');
  fill(B3, 1, 2, 9, 13, '.'); fill(B3, 14, 2, 22, 13, '.'); B3[7][23] = 'D'; B3[7][22] = 'b';   // the two sides of the chasm; in from the chamber on the east
  fill(B3, 10, 2, 13, 13, 'g'); B3[7][10] = '.'; B3[7][14] = '.'; B3[3][10] = '.'; fill(B3, 11, 3, 12, 3, '.'); fill(B3, 12, 4, 12, 5, '.'); fill(B3, 12, 9, 12, 11, '.');   // the chasm, the landings, the spurs north and south of the turning wall
  fill(B3, 11, 12, 13, 14, '.'); B3[15][12] = 'D';   // the block at the south with the door on to four blue dots
  room('airs_rock_in_blue3', 'Three Blue Dots', B3, { entry: { x: 22, y: 7 } }, (M) => {
    door(M, 23, 7, 'airs_rock_in_hall', 2, 5, DIR.RIGHT); door(M, 12, 15, 'airs_rock_in_blue4', 13, 16, DIR.DOWN);
    const turn = rotWall(M, 'b3', 12, 7, 'v');
    windStone(M, 'b3_ws_e', 16, 4, turn); windStone(M, 'b3_ws_w', 4, 10, turn);
    M.object('pillar', 7, 13, { id: 'b3_p' });   // the shortcut: into the chasm at the south block's side
    M.sign(20, 10, 'A wall segment stands on a pivot in the chasm. The Wind Stones on either side turn it.');
  });
  // ====================== four blue dots ======================
  const B4 = grid(26, 18, '#');
  fill(B4, 1, 12, 24, 16, '.'); B4[17][13] = 'D'; B4[16][13] = '4'; fill(B4, 22, 12, 22, 14, 'g'); B4[13][25] = 'D';   // the south floor: in from three blue dots, the Elixir, the pillar's pit before the door east
  fill(B4, 1, 8, 24, 11, 'g'); fill(B4, 13, 8, 13, 11, 'r');   // the chasm and the tightrope over it
  fill(B4, 1, 2, 24, 7, '.'); B4[1][13] = 'D'; fill(B4, 5, 2, 7, 7, 'g'); fill(B4, 4, 2, 4, 7, '#'); B4[5][4] = '.'; B4[6][4] = 'S'; fill(B4, 3, 2, 3, 7, 'g'); B4[5][3] = 'h'; B4[5][0] = 'D';   // the north floor: the chasm column with the turning wall, the landing, the slide off it, the hop west, the door
  fill(B4, 21, 2, 21, 3, 'g'); fill(B4, 22, 4, 24, 4, 'g');   // the island with the coins
  room('airs_rock_in_blue4', 'Four Blue Dots', B4, { entry: { x: 13, y: 16 }, fall: () => ({ map: 'airs_rock_in_blue4', x: 4, y: 13 }) }, (M) => {
    door(M, 13, 17, 'airs_rock_in_blue3', 12, 14, DIR.DOWN); door(M, 25, 13, 'airs_rock_in_blue5', 1, 7, DIR.RIGHT); door(M, 0, 5, 'airs_rock_in_hall', 2, 15, DIR.LEFT); door(M, 13, 1, 'airs_rock_in_left', 17, 14, DIR.UP);
    M.chest(2, 13, 'Elixir', 1);
    const turn = rotWall(M, 'b4', 6, 5, 'v'); windStone(M, 'b4_ws', 20, 6, turn);
    M.object('hop', 3, 5, { id: 'b4_hop' }); M.object('pillar', 19, 13, { id: 'b4_p' });
    // 666 Coins on the island: the Wind Stone before it lays the span
    M.chest(23, 2, 'Coins', 1, { coins: 666 });
    windStone(M, 'b4_ws2', 19, 3, function* (E) { if (G.flag('airs_b4_span')) { yield E.say('The span holds. The gust has nothing more to do here.'); return; } G.set('airs_b4_span'); const MM = G.field.map; MM.set(21, 2, 'ar_span'); MM.set(21, 3, 'ar_span'); MM.finalize(); Engine.doShake(8); Audio.sfx('push'); yield E.say('The gust drives a slab out of the wall and it drops across the pit - a span to the island!'); });
    if (G.flag('airs_b4_span')) { M.set(21, 2, 'ar_span'); M.set(21, 3, 'ar_span'); }
    M.sign(10, 4, 'Left of here the wall turns, and past it the floor drops away on a slide. Mind the gap after.');
  });
  // ====================== the crystal room ======================
  const CR = grid(20, 14, '#');
  fill(CR, 1, 2, 18, 12, 'k'); CR[7][0] = 'D'; for (const [x, y] of [[3, 3], [16, 3], [3, 11], [16, 11], [8, 2], [12, 12]]) CR[y][x] = 'K';
  room('airs_rock_in_crystal', 'Crystal Room', CR, { entry: { x: 1, y: 7 }, enc: [['Mummy'], ['Ghoul II', 'Ghoul II']] }, (M) => {
    door(M, 0, 7, 'airs_rock_in_hall', 27, 26, DIR.LEFT);
    M.setObj(10, 3, 'psystone');
    twisterRock(M, 'cr_tr', 16, 7, function* (E) { if (statuesOn()) { yield E.say('The statues breathe on. The rock has nothing more to give.'); return; } G.set('airs_statues_on'); Engine.doShake(20); Audio.sfx('push'); yield E.say('The twister rock howls, and the sound goes up through the whole rock - and everywhere in it, the statues draw breath and blow!'); yield E.say('Every statue in the place! That one in the chamber, the one up in the red room... they are all breathing now.', 'Sheba'); });
    M.setObj(10, 11, 'statue'); updraft(M, 'cr_u', 10, 10, { map: 'airs_rock_in_vial', x: 10, y: 11 }, { active: statuesOn });
    M.sign(5, 6, 'The crystal grows here in the dark. A Psynergy stone stands by the north wall; the little face by the south wall looks up.');
  });
  // ====================== the Vial's room ======================
  const V = grid(20, 14, '#');
  fill(V, 1, 2, 18, 12, '.'); V[7][0] = 'D'; fill(V, 6, 5, 6, 12, '#'); V[8][6] = '.';   // the wall down the west with the one gap the pillar stands in
  fill(V, 13, 1, 18, 5, '#'); fill(V, 14, 2, 17, 4, '.');   // the walled platform with the Vial
  room('airs_rock_in_vial', "Vial Room", V, { entry: { x: 10, y: 11 } }, (M) => {
    door(M, 0, 7, 'airs_rock_in_hall', 27, 15, DIR.LEFT);
    M.object('pillar', 6, 8, { id: 'vial_p' });
    twisterRock(M, 'vial_tr', 10, 3, function* (E) { if (G.flag('airs_vial_statues')) { yield E.say('The statues here breathe already.'); return; } G.set('airs_vial_statues'); Engine.doShake(12); Audio.sfx('push'); yield E.say('The twister rock howls and the two statues in the room draw breath and blow!'); });
    const on = () => !!G.flag('airs_vial_statues');
    M.setObj(10, 9, 'statue'); updraft(M, 'vial_u1', 10, 8, { x: 15, y: 3 }, { active: on }); M.setObj(14, 5, 'statue'); updraft(M, 'vial_u2', 14, 4, { x: 3, y: 10 }, { active: on });
    M.chest(17, 3, 'Vial', 1);
    M.sign(9, 12, 'The whirl that brought the party up ends here. The statue above looks at the walled shelf.');
  });
  // ====================== the room on the left ======================
  const LF = grid(26, 18, '#');
  fill(LF, 16, 2, 24, 11, '.'); LF[9][25] = 'D';   // the east floor, in from the chamber
  fill(LF, 7, 3, 13, 9, 'g'); fill(LF, 8, 4, 12, 8, '.');   // the platform in its ring of pits
  fill(LF, 8, 1, 12, 2, '.'); LF[3][10] = 'h'; fill(LF, 1, 1, 5, 2, '.'); fill(LF, 6, 1, 6, 2, 'g');   // the strip north of it, the hop to it, the shelf with the Circlet beyond a pit
  fill(LF, 1, 11, 14, 15, '.');   // the path along the bottom
  fill(LF, 16, 13, 18, 15, '.'); LF[16][17] = 'D';   // the nook with the stairs out, walled off from the east floor
  room('airs_rock_in_left', 'Left Room', LF, { entry: { x: 24, y: 9 } }, (M) => {
    door(M, 25, 9, 'airs_rock_in_hall', 2, 26, DIR.RIGHT); door(M, 17, 16, 'airs_rock_in_blue4', 13, 2, DIR.DOWN);
    vent(M, 'lf_u1', 20, 9, { x: 10, y: 6 }); M.object('pillar', 20, 9, { id: 'lf_p1' });   // the shaft the pillar sits on
    M.object('hop', 10, 3, { id: 'lf_hop' });
    vent(M, 'lf_u2', 8, 1, { x: 3, y: 2 }); M.object('statue_move', 8, 1, { id: 'lf_statue' });   // the statue over the second shaft
    M.chest(2, 1, 'Clarity Circlet', 1);
    updraft(M, 'lf_u3', 4, 2, { x: 3, y: 13 }); M.setObj(4, 1, 'statue');   // wait: (4,1) is floor on the shelf; the statue stands at the shelf's edge
    vent(M, 'lf_u4', 10, 13, { x: 17, y: 14 }); M.object('pillar', 10, 13, { id: 'lf_p2' });   // the shaft the last pillar sits on: freed, it lifts the party to the stairs
    M.sign(22, 4, 'Shafts under the floor here too. The pillars sit on them.');
  });
  // ====================== five blue dots ======================
  const B5 = grid(18, 14, '#');
  fill(B5, 1, 2, 8, 12, '.'); B5[7][0] = 'D'; B5[7][1] = '5'; fill(B5, 9, 1, 9, 12, '#'); B5[5][9] = '.'; B5[6][9] = '.';   // the west half, the wall with the statue in its gap
  fill(B5, 10, 2, 16, 12, '.'); B5[7][17] = 'D';   // the east half, the door back to the chamber
  room('airs_rock_in_blue5', 'Five Blue Dots', B5, { entry: { x: 1, y: 7 }, enc: [] }, (M) => {
    door(M, 0, 7, 'airs_rock_in_blue4', 24, 13, DIR.LEFT); door(M, 17, 7, 'airs_rock_in_hall', 6, 30, DIR.RIGHT);
    M.chest(2, 11, 'Vial', 1);
    M.object('statue_move', 9, 5, { id: 'b5_statue' });
    const flung = function* (E) { Audio.sfx('push'); Engine.doShake(10); yield E.say('The twister catches the party and throws them back to the door!'); yield Engine.fadeOut(12); E.warpNow('airs_rock_in_blue5', 11, 3, DIR.DOWN); yield Engine.fadeIn(12); };
    M.object('tornado', 12, 7, { id: 'b5_t', x0: 11, x1: 15, speed: 8, onHit: flung, active: () => { const s = G.field.map.objects.find(o => o.id === 'b5_statue'); return s && s.x === 9; } });
    M.sign(3, 3, 'No one has died in this room. The statue in the wall breathes across the right-hand half; move it and it breathes at nothing.');
  });
  // ====================== the centre ======================
  const CE = grid(22, 18, '#');
  fill(CE, 9, 1, 13, 3, '.'); CE[0][11] = 'D';   // in from the platform's door
  fill(CE, 1, 4, 20, 6, 'x'); CE[5][11] = '.';   // the chasm, the stone in its middle
  fill(CE, 1, 7, 20, 16, '.'); fill(CE, 9, 9, 13, 11, 'm'); CE[12][21] = 'D';   // the floor below, the dais, the door back to the chamber
  room('airs_rock_in_center', 'Centre', CE, { entry: { x: 11, y: 1 }, enc: [] }, (M) => {
    door(M, 11, 0, 'airs_rock_in_hall', 14, 18, DIR.UP); door(M, 21, 12, 'airs_rock_in_hall', 14, 30, DIR.RIGHT);
    M.object('hop', 11, 4, { id: 'ce_hop1' }); M.object('hop', 11, 6, { id: 'ce_hop2' });
    M.trigger(11, 7, 1, 1, function* (E) { const MM = G.field.map; MM.set(11, 5, 'chasm'); MM.finalize(); Audio.sfx('push'); yield E.say('The stone the party stood on a moment ago sinks into the dark and is gone.'); }, { once: 'airs_stones_gone', cond: () => true });
    if (G.flag('airs_stones_gone')) M.set(11, 5, 'chasm');
    M.object('statue', 11, 10, { id: 'reveal_tablet', tile: 'ar_tablet', script: T3.airsRockTablet });
    M.trigger(10, 12, 3, 1, T3.airsRockReveal, { once: 'reveal_tla' });
    M.chest(2, 15, 'Psy Crystal', 1, { hidden: true });
    M.sign(16, 9, 'The tablet on the dais. The left-hand way is bare stone... or seems so.');
  });
  T3.airsRockTablet = function* (E) { if (G.flag('reveal_tla')) yield E.say('The tablet: "Wielder of Wind\'s might... Lay your hands upon this stone... We bestow upon thee the power to see the truth unclouded."'); else yield* T3.airsRockReveal(E); };
  T3.airsRockReveal = function* (E) {
    if (G.party.get('Sheba') && G.party.get('Sheba').hasPsy('Reveal')) return;
    yield E.say('Felix checked the tablet. It has strange characters written on it.');
    yield E.say('"Wielder of Wind\'s might... Lay your hands upon this stone... We bestow upon thee the power to see the truth unclouded..."');
    yield E.say('Do you think I ought to touch it?', 'Sheba'); yield E.say('Felix nods.');
    yield E.say('Sheba touched the tablet.'); Engine.doFlash(15, '#c0a0ff'); Audio.sfx('psy'); Engine.doShake(10); yield 20;
    yield E.say('It rises into the air, as does Sheba, as the tablet\'s energy surrounds her.'); yield 20;
    const sheba = G.party.get('Sheba'); if (sheba) sheba.learnExtra('Reveal'); G.set('reveal_tla');
    yield E.say('Sheba learned Reveal!');
    yield E.say('With Reveal, hidden paths and secrets become visible. The rock beside the sanctum in Garoh... we can find what is in it now.', 'Sheba');
  };
}
