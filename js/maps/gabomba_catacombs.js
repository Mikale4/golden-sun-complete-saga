// ---------- Gabomba Catacombs ----------
// Under the Great Gabomba, down the ladder that shows in the statue's last chamber once it has spoken (gabomba.js).
// The guide's chapter 8A (lines 3272-3335) and the script's [02'20] scene: the lower level, up along the right
// wall to a dead end of rocks before a patch of bushes - Cyclone there wakes a teleporter stone hidden to the
// north, and the party is carried a level down to where Mud waits in plain sight (it fights); the slide down, the
// stairs back up, a little south and Cyclone again on a second stone, which drops the party on the lower level's far
// side; along the right wall to the next room, Mint under its bushes; the ladder down, five bushes over a puddle
// (Frost: the way across the gap), the dead end and Reveal on its wall; the stream crossed on its three poles to
// the upper-left, Cyclone and Frost once more, the stairway; the last bushes hide the first of the Mad Plants
// (Game Ticket), and the little Gabomba at the top gives the Tomegathericon on its terms (Akafubu is not to know).
// No rip of it in the references: laid from the text.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const GC_ENC = [['Bone Fighter'], ['Death Head', 'Death Head'], ['Doomsayer'], ['Red Demon'], ['Salamander'], ['Spirit', 'Spirit']];
  const RETREAT = { map: 'kibombo', x: 14, y: 12, dir: DIR.DOWN };
  const LEG = {
    '.': 'cave_moss', ',': 'cave', 'p': 'pit', '~': 'cave_water', 's': 'cave_pebbles',
    'L': { ground: 'cave_moss', obj: 'ladder', walk: true }, 'U': { ground: 'cave_moss', obj: 'stairs_up', walk: true }, 'N': { ground: 'cave_moss', obj: 'stairs_down', walk: true },
    'o': { ground: 'cave_moss', obj: 'grey_rock' }, 'S': 'cb_slide', 'D': { ground: 'cave_moss', obj: 'door_cave', walk: true }
  };
  const ROCK = { cliff: '#', set: 'mossrock', faces: 2 };
  const room = (id, name, rows, opts, build) => defineMap(id, Object.assign({ name: 'Gabomba Catacombs' + (name ? ' - ' + name : ''), w: rows[0].length, h: rows.length, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, enc: GC_ENC, retreat: RETREAT }, opts, { build(M) { M.paint(0, 0, strs(rows), LEG, ROCK); build(M); } }));
  const stairs = (M, x, y, to, tx, ty, dir) => M.exit(x, y, 1, 1, to, tx, ty, dir, { stairs: true });
  const bush = (M, id, x, y, onClear) => M.object('leaves', x, y, { id, onClear });
  // a teleporter stone under its bushes: Cyclone bares it and wakes it, and the whirl carries the party elsewhere
  const stone = (M, id, x, y, to, tx, ty, dir, seen) => {
    if (G.flag(seen)) { M.setObj(x, y, 'gc_stone'); M.walkable(x, y); M.trigger(x, y, 1, 1, function* (E) { Audio.sfx('psy'); Engine.doFlash(10, '#c0f0ff'); E.warpNow(to, tx, ty, dir); }); return; }
    bush(M, id, x, y, function* (E) { G.set(seen); const Mp = G.field.map; Mp.setObj(x, y, 'gc_stone'); Mp.walkable(x, y); Mp.finalize(); Audio.sfx('psy'); Engine.doFlash(10, '#c0f0ff'); yield E.say('The bushes tear away from a flat stone cut with a spiral - and it wakes under the wind! A whirl of light takes the party...'); E.warpNow(to, tx, ty, dir); });
  };
  // ====================== the upper level: the ladder from the statue, the stairs down, the second stone ======================
  const U = grid(22, 16, '#');
  fill(U, 2, 2, 19, 13, '.'); fill(U, 12, 2, 19, 7, '#'); fill(U, 2, 9, 4, 13, '#'); fill(U, 12, 9, 13, 13, ','); U[2][4] = 'L'; U[3][9] = 'N';
  for (const [x, y] of [[7, 3], [16, 11], [18, 9]]) U[y][x] = 'o'; U[12][7] = 's'; U[5][17] = 's';
  room('gabomba_catacombs', null, U, { entry: { x: 4, y: 3 } }, (M) => {
    stairs(M, 4, 2, 'gabomba_heart', 2, 10, DIR.UP);   // the ladder up into the statue's last chamber
    stairs(M, 9, 3, 'gc_lower', 3, 4, DIR.DOWN);
    M.trigger(3, 3, 3, 2, function* (E) { yield E.say('Catacombs, under the statue. So this is what the Gabomba keeps below it.', 'Kraden'); yield E.say('The stairs go down. Whatever it promised Akafubu is down there.', 'Piers'); }, { once: 'gc_seen' });
    // a little south of the stairs, under the bushes: the second stone (the lower level's far side)
    for (const [x, y] of [[6, 9], [7, 9], [8, 9], [6, 11], [8, 11], [6, 10], [8, 10]]) bush(M, 'gc_u_bush_' + x + '_' + y, x, y);
    stone(M, 'gc_stone2', 7, 10, 'gc_lower', 14, 12, DIR.UP, 'gc_stone2_seen');
    M.sign(15, 12, 'The Great Gabomba watches over the old bones of Kibombo. Those who prove their power reach the end.');
  });
  // ====================== the lower level: the dead end of rocks, the first stone; the far side, the slide's landing ======================
  const W = grid(22, 16, '#');
  fill(W, 2, 2, 9, 13, '.'); fill(W, 12, 2, 19, 13, '.'); fill(W, 5, 2, 6, 5, '#');   // the west half, the wall that makes its top right a nook; the east half beyond the middle wall
  fill(W, 7, 4, 9, 4, 'o'); W[3][3] = 'U'; fill(W, 2, 9, 3, 13, ','); W[1][19] = 'D';
  for (const [x, y] of [[4, 8], [14, 5], [17, 9]]) W[y][x] = 'o'; W[12][6] = 's'; W[4][16] = 's';
  room('gc_lower', 'Lower Level', W, { entry: { x: 3, y: 4 } }, (M) => {
    stairs(M, 3, 3, 'gabomba_catacombs', 9, 4, DIR.UP);
    // the nook up the right wall ends at three rocks; the bushes beyond them hide the first stone, and Cyclone reaches over
    for (const [x, y] of [[7, 2], [8, 2], [9, 2], [7, 3], [9, 3]]) bush(M, 'gc_w_bush_' + x + '_' + y, x, y);
    stone(M, 'gc_stone1', 8, 3, 'gc_hollow', 6, 9, DIR.UP, 'gc_stone1_seen');
    M.trigger(7, 5, 3, 1, function* (E) { yield E.say('A dead end. Rocks across the way, and a patch of bushes past them.', 'Jenna'); yield E.say("Cyclone reaches further than Whirlwind ever did. Try it from here, Sheba - the wind may find something in those bushes.", 'Kraden'); }, { once: 'gc_deadend_seen' });
    M.exit(19, 1, 1, 1, 'gc_bones', 2, 12, DIR.UP, { door: true });
    M.sign(13, 3, 'The lower level. A wall through the middle of it, and the way on is along the right side.');
  });
  // ====================== the hollow: Mud in plain sight, and the slide back down ======================
  const H = grid(14, 12, '#');
  fill(H, 2, 2, 11, 9, '.'); H[10][6] = 'S'; fill(H, 2, 2, 3, 3, ','); fill(H, 10, 8, 11, 9, ',');
  room('gc_hollow', 'Hollow', H, { entry: { x: 6, y: 9 }, fall: { map: 'gc_lower', x: 3, y: 12 } }, (M) => {
    M.walkable(6, 10);
    M.djinni('Mud', 6, 5, { fight: true });
    M.trigger(5, 8, 3, 2, function* (E) { yield E.say('The stone set the party down in a hollow - and there, in plain sight, a Venus Djinni. It has seen the party too.', 'Sheba'); }, { once: 'gc_hollow_seen' });
    M.sign(3, 4, 'A slide in the floor at the south end. Down it, and the lower level again.');
  });
  // ====================== the hall of bones: Mint under the bushes, the ladder down ======================
  const B = grid(20, 14, '#');
  fill(B, 2, 2, 17, 11, '.'); fill(B, 2, 12, 3, 12, '.'); B[13][2] = 'D'; B[2][10] = 'L'; fill(B, 6, 4, 11, 6, '#'); fill(B, 5, 9, 6, 10, 'p');
  for (const [x, y] of [[3, 4], [15, 3], [14, 10]]) B[y][x] = 'o'; B[7][8] = 's'; B[11][12] = 's';
  room('gc_bones', 'Hall of Bones', B, { entry: { x: 2, y: 12 } }, (M) => {
    M.exit(2, 13, 1, 1, 'gc_lower', 19, 2, DIR.DOWN, { door: true });
    stairs(M, 10, 2, 'gc_stream', 3, 16, DIR.UP);   // the ladder down to the stream
    for (const [x, y] of [[12, 8], [13, 8], [14, 8], [12, 9], [14, 9], [12, 10], [13, 10]]) bush(M, 'gc_b_bush_' + x + '_' + y, x, y);   // Mint's patch (HIDDEN_ITEMS: the one at 13,9)
    M.sign(4, 3, 'Bones in the walls, older than Kibombo. The ladder at the top goes further down.');
  });
  // ====================== the stream: the puddle under the bushes, the hidden wall, the three poles, the stairway ======================
  const S = grid(26, 20, '#');
  fill(S, 2, 11, 11, 17, '.'); fill(S, 6, 11, 6, 17, 'p'); S[16][3] = 'L';           // the ladder's pocket, the gap, the floor past it
  fill(S, 8, 7, 11, 9, '.');                                                            // the nook behind the hidden wall, onto the stream
  fill(S, 12, 2, 14, 17, '~'); fill(S, 15, 2, 23, 17, '.'); fill(S, 15, 4, 23, 6, '~'); // the stream down the middle, the east side and its cross-band
  fill(S, 2, 2, 11, 6, '.'); fill(S, 7, 2, 7, 6, 'p'); S[4][4] = 'U';                    // the upper left: the second gap, the stairway
  for (const [x, y] of [[9, 15], [18, 12], [21, 15], [3, 3]]) S[y][x] = 'o'; S[13][10] = 's'; S[9][20] = 's'; S[2][17] = 's';
  room('gc_stream', 'The Stream', S, { entry: { x: 3, y: 16 } }, (M) => {
    stairs(M, 3, 16, 'gc_bones', 10, 3, DIR.DOWN);   // the ladder up to the hall of bones
    // five bushes over the gap, and the puddle under the middle one: Frost makes the way across
    for (const [x, y] of [[6, 12], [6, 14], [5, 12], [5, 14]]) bush(M, 'gc_s_bush_' + x + '_' + y, x, y);
    if (G.flag('gc_puddle1_seen')) M.object('puddle', 6, 13, { id: 'gc_puddle1' });
    else bush(M, 'gc_s_bush_6_13', 6, 13, function* (E) { G.set('gc_puddle1_seen'); G.field.map.objects.push({ kind: 'puddle', x: 6, y: 13, id: 'gc_puddle1', key: 'gc_stream:puddle:gc_puddle1' }); yield E.say('Under the middle bush, water lies in the gap - a puddle. Frost would make a footing of it.', 'Piers'); });
    // the dead end at the top of the floor past the gap: Reveal shows the wall for what it is
    M.hidden.push({ x: 9, y: 10, tile: 'cave_moss' });
    M.trigger(8, 11, 3, 1, function* (E) { yield E.say('Another dead end. The wall here looks no different from the rest...', 'Jenna'); yield E.say('Looks. Reveal it, Sheba.', 'Felix'); }, { once: 'gc_wall_seen' });
    // the three poles across the stream: along the top of the vertical one, up the cross-band, and back over to the upper left
    M.object('log', 12, 8, { id: 'gc_pole1', len: 3, horiz: true, afloat: true, fixed: true });
    M.object('log', 19, 4, { id: 'gc_pole2', len: 3, horiz: false, afloat: true, fixed: true });
    M.object('log', 12, 3, { id: 'gc_pole3', len: 3, horiz: true, afloat: true, fixed: true });
    M.trigger(11, 8, 1, 1, function* (E) { yield E.say('The stream runs the length of the room. Look - a pole lies across it just there, half under the water. Walk along it, and it holds.', 'Kraden'); }, { once: 'gc_pole_seen' });
    // the upper left: bushes over the second gap, the puddle under them, and the stairway beyond
    for (const [x, y] of [[7, 3], [7, 5], [8, 3], [8, 5]]) bush(M, 'gc_s2_bush_' + x + '_' + y, x, y);
    if (G.flag('gc_puddle2_seen')) M.object('puddle', 7, 4, { id: 'gc_puddle2' });
    else bush(M, 'gc_s2_bush_7_4', 7, 4, function* (E) { G.set('gc_puddle2_seen'); G.field.map.objects.push({ kind: 'puddle', x: 7, y: 4, id: 'gc_puddle2', key: 'gc_stream:puddle:gc_puddle2' }); yield E.say('Another puddle in the gap. The same trick, then.', 'Sheba'); });
    stairs(M, 4, 4, 'gc_shrine', 4, 11, DIR.UP);
    M.sign(16, 13, 'Water out of the rock, and poles felled across it by whoever walked here before.');
  });
  // ====================== the shrine: the Mad Plant's bushes, the little Gabomba and its book ======================
  const R = grid(18, 14, '#');
  fill(R, 2, 2, 15, 12, '.'); fill(R, 6, 5, 11, 7, '#'); fill(R, 7, 5, 10, 7, '.'); R[1][9] = '.'; fill(R, 2, 2, 5, 3, ','); fill(R, 12, 2, 15, 3, ',');
  for (const [x, y] of [[3, 11], [14, 11]]) R[y][x] = 'o'; R[9][12] = 's';
  room('gc_shrine', 'Shrine', R, { entry: { x: 4, y: 11 } }, (M) => {
    stairs(M, 4, 11, 'gc_stream', 4, 5, DIR.DOWN); M.setObj(4, 11, 'stairs_down'); M.walkable(4, 11);
    // the bushes across the way up: the first of the Mad Plants is in them
    for (const [x, y] of [[7, 5], [8, 5], [10, 5], [7, 6], [8, 6], [9, 6], [10, 6], [7, 7], [8, 7], [10, 7]]) bush(M, 'gc_r_bush_' + x + '_' + y, x, y);
    bush(M, 'gc_r_bush_9_7', 9, 7, function* (E) { if (G.flag('gc_plant_done')) return; const r = yield* E.ambush(['Mad Plant #1'], { boss: true, canFlee: false }, { at: [[9, 7]], say: 'Something in the bushes rears up - a Mad Plant!' }); if (r !== 'win') return; G.set('gc_plant_done'); yield E.give('Game Ticket'); });
    // the little Gabomba at the top of the room
    M.setObj(9, 1, 'mini_gabomba');
    M.trigger(8, 2, 3, 1, T3.gabombaBook, { cond: () => !G.flag('gc_tome_got') });
    M.sign(13, 4, 'The little Gabomba, in the deepest room. It has been waiting.');
  });
  // the script's scene: the book appears in the idol's hands, on the Gabomba's terms
  T3.gabombaBook = function* (E) {
    if (G.flag('gc_tome_got')) return;
    yield E.face('player', DIR.UP);
    Audio.sfx('psy'); Engine.doFlash(12, '#60c0ff');
    yield E.say('By reaching this place, you have proven your power.', 'Gabomba');
    yield E.say('(A book appears in the hands of the little statue: the Tomegathericon, which changes the class of its bearer.)');
    yield E.say('By rights, Akafubu should bear this power... But I shall keep my promise and bestow it upon the one to reach this place first!', 'Gabomba');
    yield E.say('I am grateful for your promise... But I am worried that we have done Akafubu and the Kibombo a great wrong.', 'Kraden');
    yield E.say('Akafubu has not honed his own powers, and the fault lies with him alone... And yet, there is a hint of truth to what you say...', 'Gabomba');
    yield E.say("Then what are we to do? Does this mean we won't receive your magic?", 'Kraden');
    yield E.say('As I have said, I will give the power to you. Your concern is misplaced. But I must add some small conditions to our agreement...', 'Gabomba');
    yield E.say('Wh-What kind of conditions?', 'Kraden');
    yield E.say('You must not... mention this to Akafubu. Akafubu was plainly ill prepared for this test. He will lose heart if he hears what you have done. And yet... the Kibombo have need of this ill-prepared leader...', 'Gabomba');
    yield E.say('If Akafubu ever reaches this place, I shall teach him the magic as well. Promise me that you will not tell Akafubu that you earned this magic. Can you do this?', 'Gabomba');
    yield E.say('Of course!', 'Kraden');
    yield E.give('Tomegathericon'); G.set('gc_tome_got');
    yield E.say('And now I shall sleep. Farewell, successor to the witch doctor.', 'Gabomba');
  };
}
