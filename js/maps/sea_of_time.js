// ---------- The Sea of Time ----------
// The currents round Lemuria, sailed the way Yepp's three songs tell it (Yallam's children sing them): four fields
// of lanes between the rocks. The stars: north past the twins and two swirls, twice deasil round the trunk (the
// stars ring it and the current east falls calm), east past three swirls to the north, thrice round the second
// trunk, then the waves - when they stop, north to the stars. The moon: west from the stars past three swirls,
// twice round, south, one swirl west, thrice round, wait for the waves, south to the moon. The sun: south from the
// moon through two swirls, twice round, west, six swirls to the north, thrice round, the waves, north to the sun.
// A wrong lane ends in a current that carries the ship back to the field's start (a watery grave, the song says);
// the last field has few currents - left, then up, to Poseidon, whose force field only the Trident breaks.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = { 'R': 'sea_rock', 'w': 'water', 'S': 'whirlpool', 'A': 'volcano_tl', 'B': 'volcano_tr', 'C': 'volcano_bl', 'D': 'volcano_br' };
  const WORLD_IN = { map: 'world_tla', x: 222, y: 130, dir: DIR.DOWN };
  const WAVE_ON = 240, WAVE_OFF = 200;
  // the waves: on, then off, on a clock everyone shares (the runner waits for the calm)
  const wavesUp = () => (Engine.frame % (WAVE_ON + WAVE_OFF)) < WAVE_ON;
  window.SOT_WAVES_UP = wavesUp;
  // a trunk (a volcano) to run round: its four sides in deasil order (north, east, south, west); a full turn is a lap,
  // a wrong turn starts the count again, and at `need` laps the stars ring it and the flag is set
  const trunk = (M, x, y, flag, need, text) => {
    M.setObj(x, y, 'volcano_tl'); M.setObj(x + 1, y, 'volcano_tr'); M.setObj(x, y + 1, 'volcano_bl'); M.setObj(x + 1, y + 1, 'volcano_br');
    for (const [dx, dy] of [[0, -1], [1, -1], [2, 0], [2, 1], [0, 2], [1, 2], [-1, 0], [-1, 1]]) M.set(x + dx, y + dy, 'water');
    M.set(x - 1, y - 1, 'water'); M.set(x + 2, y - 1, 'water'); M.set(x - 1, y + 2, 'water'); M.set(x + 2, y + 2, 'water');
    if (G.flag(flag)) { for (const [dx, dy] of [[-1, -1], [2, -1], [-1, 2], [2, 2]]) M.setOver(x + dx, y + dy, 'volcano_star'); return; }
    const st = { next: 0, laps: 0 };
    const sides = [[[x, y - 1], [x + 1, y - 1]], [[x + 2, y], [x + 2, y + 1]], [[x, y + 2], [x + 1, y + 2]], [[x - 1, y], [x - 1, y + 1]]];
    sides.forEach((cells, k) => { for (const [cx, cy] of cells) M.trigger(cx, cy, 1, 1, function* (E) {
      if (G.flag(flag)) return;
      if (k === st.next) { st.next = (k + 1) % 4; if (k === 0 && st.started) { st.laps++; if (st.laps >= need) { G.set(flag); const MM = G.field.map; for (const [dx, dy] of [[-1, -1], [2, -1], [-1, 2], [2, 2]]) MM.setOver(x + dx, y + dy, 'volcano_star'); Audio.sfx('summon'); Engine.doFlash(10, '#ffffa0'); yield E.say(text); } else G.field.showNotice('Round the trunk: ' + st.laps + ' of ' + need); } if (k === 0) st.started = true; }
      else if (k !== (st.next + 3) % 4) { if (st.laps || st.started) G.field.showNotice('The wrong way round - the song says deasil.'); st.laps = 0; st.started = k === 0; st.next = (k + 1) % 4; }
    }); });
  };
  // a current: the ship that sails onto it is carried back to the field's start; calm once its flag is set
  const current = (M, id, cells, flag, back) => { for (const [x, y] of cells) M.object('updraft', x, y, { id: id + '_' + x + '_' + y, onTile: 'sea_current', tile: null, quiet: true, passable: true, to: back, active: () => !(flag && G.flag(flag)), onRide: T3.seaCurrent }); };
  // the waves before a way on: always there until the trunk's laps are run, then they come and go
  const waves = (M, id, cells, flag, back) => { for (const [x, y] of cells) M.object('updraft', x, y, { id: id + '_' + x + '_' + y, onTile: 'sea_wave', tile: null, quiet: true, passable: true, to: back, active: () => !G.flag(flag) || wavesUp(), onRide: T3.seaWaves }); };
  T3.seaCurrent = function* (E) {
    if (G.flag('sot_current_seen')) { G.field.showNotice('The current carries the ship back!'); return; }
    G.set('sot_current_seen');
    yield E.say('Hold on to that tiller! Do you want us to get swallowed by the waves!?', 'Sheba'); yield E.say("I know you're worried, Sheba, but he's doing the best he can...", 'Jenna');
    yield E.say('That was an incredibly strong whirlpool, but I doubt it could sink us or destroy the ship.', 'Piers'); yield E.say("See, Sheba? There's nothing to worry about. Even if we hit a whirlpool, we should be fine.", 'Jenna');
    yield E.say("But still... Piers, can't you show Felix how to get past the whirlpools and into Lemuria?", 'Sheba'); yield E.say('Er, yes, well...', 'Piers');
    yield E.say("What's wrong, Piers? Lemuria's just beyond these whirlpools, isn't it?", 'Kraden'); yield E.say('Yeah, I... think so...', 'Piers'); yield E.say('You... "think so"!?', 'Sheba');
    yield E.say("Aren't you... FROM Lemuria? Shouldn't you know exactly where it is?", 'Jenna');
    yield E.say("Yes, I'm from Lemuria... I've never had to get back INTO it before! And besides, the tidal wave carried me out of Lemuria. I didn't come through here.", 'Piers');
    yield E.say("Oh, I see. So that must mean... You don't actually know which direction Lemuria is in, do you?", 'Kraden'); yield E.say("Don't be silly! I mean... I just need to get my bearings.", 'Piers');
    yield E.say("Hm... That doesn't sound good. If Lemuria really is beyond these currents, then we'll need to find a way to get through them. And until we do... We won't be getting into Lemuria.", 'Kraden');
    if (!G.flag('yepp_songs_heard')) yield E.say("The children of Yallam sing songs their boatsman Yepp wrote - about the stars, the moon and the sun, and the way through the whirlpools. We should hear them.", 'Piers');
  };
  T3.seaWaves = function* (E) { G.field.showNotice('The waves throw the ship back! Wait for them to stop.'); };
  const field = (id, name, rows, entry, build) => defineMap(id, {
    name, w: rows[0].length, h: rows.length, base: 'water', music: 'sailing', bg: 'water', world: false, entry, enc: [], retreat: WORLD_IN,
    build(M) { M.paint(0, 0, strs(rows), LEG); build(M); }
  });
  // ====================== the stars ======================
  const F1 = grid(40, 30, 'R');
  fill(F1, 1, 6, 4, 28, 'w'); F1[22][1] = 'R'; F1[22][4] = 'R'; F1[16][2] = 'S'; F1[12][3] = 'S';   // north past the twins and two swirls
  fill(F1, 9, 4, 31, 5, 'w'); F1[4][14] = 'S'; F1[5][19] = 'S'; F1[4][24] = 'S';   // east past three swirls
  fill(F1, 33, 0, 34, 2, 'w');   // north to the stars
  fill(F1, 4, 14, 12, 15, 'w'); fill(F1, 6, 0, 7, 2, 'w'); fill(F1, 20, 6, 21, 12, 'w'); fill(F1, 5, 27, 20, 28, 'w');   // the wrong ways
  field('sea_of_time', 'Sea of Time', F1, { x: 2, y: 27 }, (M) => {
    M.exit(1, 29, 4, 1, 'world_tla', WORLD_IN.x, WORLD_IN.y, DIR.DOWN, { ship: true }); for (let x = 1; x <= 4; x++) { M.set(x, 29, 'water'); }
    trunk(M, 6, 4, 'sot1_laps1', 2, 'Stars ring the trunk! Out along the lane east, the current falls calm.');
    trunk(M, 33, 4, 'sot1_laps2', 3, 'Stars ring the second trunk - and beyond it the waves begin to rise and fall. When they stop, north to the stars!');
    M.set(5, 6, 'water'); M.set(4, 6, 'water'); M.set(32, 4, 'water'); M.set(32, 5, 'water');
    const back = { x: 2, y: 27, dir: DIR.UP };
    current(M, 'sot1_c1', [[10, 4], [10, 5], [11, 4], [11, 5]], 'sot1_laps1', back);
    current(M, 'sot1_d1', [[11, 14], [11, 15], [12, 14], [12, 15]], null, back); current(M, 'sot1_d2', [[6, 0], [7, 0], [6, 1], [7, 1]], null, back); current(M, 'sot1_d3', [[20, 11], [21, 11], [20, 12], [21, 12]], null, back); current(M, 'sot1_d4', [[19, 27], [20, 27], [19, 28], [20, 28]], null, back);
    waves(M, 'sot1_w', [[33, 2], [34, 2]], 'sot1_laps2', { x: 32, y: 4, dir: DIR.RIGHT });
    M.exit(33, 0, 2, 1, 'sea_of_time_2', 34, 1, DIR.LEFT, { ship: true });
    M.trigger(1, 26, 4, 2, T3.seaOfTimeEnter, { once: 'sot_entered' });
  });
  T3.seaOfTimeEnter = function* (E) { yield E.say('The Sea of Time. The currents run every way between the rocks - and somewhere past them is Lemuria.', 'Kraden'); if (G.flag('yepp_songs_heard')) yield E.say("Yepp's songs: north past the twins, past two swirls, twice round the trunk. Then east.", 'Sheba'); };
  // ====================== the moon ======================
  const F2 = grid(40, 30, 'R');
  fill(F2, 9, 1, 35, 2, 'w'); F2[1][28] = 'S'; F2[2][22] = 'S'; F2[1][16] = 'S';   // west from the stars past three swirls
  fill(F2, 6, 6, 7, 21, 'w'); fill(F2, 2, 20, 7, 21, 'w'); F2[20][4] = 'S';   // south, then one swirl west
  fill(F2, 2, 26, 3, 29, 'w');   // south to the moon
  fill(F2, 20, 3, 21, 10, 'w'); fill(F2, 8, 14, 16, 15, 'w'); fill(F2, 30, 3, 31, 12, 'w'); fill(F2, 8, 20, 18, 21, 'w');   // the wrong ways
  field('sea_of_time_2', 'Sea of Time - The Moon', F2, { x: 34, y: 1 }, (M) => {
    M.set(35, 0, 'water'); M.set(34, 0, 'water'); M.exit(34, 0, 2, 1, 'sea_of_time', 33, 1, DIR.UP, { ship: true });
    trunk(M, 6, 3, 'sot2_laps1', 2, 'Stars ring the trunk! Down the lane south, the current falls calm.');
    trunk(M, 2, 23, 'sot2_laps2', 3, 'Stars ring the second trunk - and below it the waves begin to rise and fall. When they stop, south to the moon!');
    const back = { x: 34, y: 1, dir: DIR.LEFT };
    current(M, 'sot2_c1', [[6, 7], [7, 7], [6, 8], [7, 8]], 'sot2_laps1', back);
    current(M, 'sot2_d1', [[20, 9], [21, 9], [20, 10], [21, 10]], null, back); current(M, 'sot2_d2', [[15, 14], [16, 14], [15, 15], [16, 15]], null, back); current(M, 'sot2_d3', [[30, 11], [31, 11], [30, 12], [31, 12]], null, back); current(M, 'sot2_d4', [[17, 20], [18, 20], [17, 21], [18, 21]], null, back);
    waves(M, 'sot2_w', [[2, 26], [3, 26]], 'sot2_laps2', { x: 1, y: 23, dir: DIR.RIGHT });
    M.exit(2, 29, 2, 1, 'sea_of_time_3', 36, 1, DIR.DOWN, { ship: true });
  });
  // ====================== the sun ======================
  const F3 = grid(40, 32, 'R');
  fill(F3, 36, 1, 37, 16, 'w'); F3[5][36] = 'S'; F3[10][37] = 'S';   // south from the moon through two swirls
  fill(F3, 8, 19, 34, 20, 'w');   // west
  fill(F3, 8, 7, 9, 18, 'w'); F3[17][8] = 'S'; F3[15][9] = 'S'; F3[13][8] = 'S'; F3[11][9] = 'S'; F3[9][8] = 'S'; F3[7][9] = 'S';   // six swirls to the north
  fill(F3, 8, 0, 9, 2, 'w');   // north to the sun
  fill(F3, 20, 8, 35, 9, 'w'); fill(F3, 20, 21, 21, 28, 'w'); fill(F3, 26, 4, 27, 16, 'w'); fill(F3, 2, 19, 7, 20, 'w'); fill(F3, 2, 21, 3, 28, 'w');   // the wrong ways
  field('sea_of_time_3', 'Sea of Time - The Sun', F3, { x: 36, y: 1 }, (M) => {
    M.set(36, 0, 'water'); M.set(37, 0, 'water'); M.exit(36, 0, 2, 1, 'sea_of_time_2', 2, 28, DIR.UP, { ship: true });
    trunk(M, 36, 18, 'sot3_laps1', 2, 'Stars ring the trunk! Out along the lane west, the current falls calm.');
    trunk(M, 8, 4, 'sot3_laps2', 3, 'Stars ring the last trunk - and above it the waves begin to rise and fall. When they stop, north to the sun!');
    const back = { x: 36, y: 1, dir: DIR.DOWN };
    current(M, 'sot3_c1', [[32, 19], [33, 19], [32, 20], [33, 20]], 'sot3_laps1', back);
    current(M, 'sot3_d1', [[20, 8], [21, 8], [20, 9], [21, 9]], null, back); current(M, 'sot3_d2', [[20, 27], [21, 27], [20, 28], [21, 28]], null, back); current(M, 'sot3_d3', [[26, 4], [27, 4], [26, 5], [27, 5]], null, back); current(M, 'sot3_d4', [[2, 27], [3, 27], [2, 28], [3, 28]], null, back);
    waves(M, 'sot3_w', [[8, 2], [9, 2]], 'sot3_laps2', { x: 7, y: 4, dir: DIR.RIGHT });
    M.exit(8, 0, 2, 1, 'sea_of_time_4', 30, 28, DIR.UP, { ship: true });
  });
  // ====================== Poseidon ======================
  const F4 = grid(40, 32, 'R');
  fill(F4, 6, 27, 31, 28, 'w'); fill(F4, 30, 29, 31, 31, 'w'); fill(F4, 6, 11, 7, 26, 'w'); fill(F4, 3, 2, 11, 10, 'w'); fill(F4, 7, 0, 8, 1, 'w');   // left, then up, to the pool
  fill(F4, 14, 14, 15, 26, 'w'); fill(F4, 22, 20, 23, 26, 'w');   // the few currents
  field('sea_of_time_4', "Sea of Time - Poseidon's Reach", F4, { x: 30, y: 28 }, (M) => {
    M.exit(30, 31, 2, 1, 'sea_of_time_3', 8, 1, DIR.DOWN, { ship: true });
    const back = { x: 30, y: 28, dir: DIR.LEFT };
    current(M, 'sot4_d1', [[14, 14], [15, 14], [14, 15], [15, 15]], null, back); current(M, 'sot4_d2', [[22, 20], [23, 20], [22, 21], [23, 21]], null, back);
    if (!G.flag('poseidon_done')) { M.boss('Poseidon', 7, 4, { done: 'poseidon_done', scale: 2.4 }); M.trigger(3, 8, 9, 1, T3.poseidon, { once: 'poseidon_done' }); }
    M.exit(7, 0, 2, 1, 'world_tla', 229, 137, DIR.UP, { ship: true, cond: () => G.flag('poseidon_done') });
    M.trigger(28, 27, 3, 2, function* (E) { yield E.say('The currents are almost still here. Left, then up... Something is waiting at the top of this reach.', 'Piers'); }, { once: 'sot4_seen' });
  });
  T3.poseidon = function* (E) {
    Audio.play('boss'); yield E.say('The sea churns... Poseidon, guardian of Lemuria, rises from the depths!');
    if (!G.inventory.has('Trident') && !G.party.members.some(m => Object.values(m.equip || {}).includes('Trident'))) { yield E.say("Without the Trident, Poseidon's force field cannot be broken! We must turn back!", 'Piers'); yield E.move('player', DIR.DOWN, 3); return; }
    yield E.say('The Trident, Felix! Use it now - before the force field is shattered, nothing we do will touch him!', 'Piers');
    Engine.doFlash(16, '#a0e0ff'); Audio.sfx('summon'); yield E.say("(Felix raises the Trident of Ankohl. A bolt of light strikes Poseidon, and his force field shatters!)");
    const r = yield* E.battle(['Poseidon'], { boss: true, canFlee: false, music: 'boss', bg: 'water', weaken: { hp: 0.6, def: 0.5, atk: 0.75 } });
    if (r !== 'win') return;
    yield E.say('Poseidon sinks beneath the waves. The mists of the Sea of Time part... Lemuria lies ahead!');
    G.set('poseidon_done'); G.set('lemuria_open'); Audio.play('sailing');
    yield E.say("Beyond this reach is the open water round Lemuria. Go north and you'll be out of the currents - and you'll see it, at last.", 'Piers');
  };
}
