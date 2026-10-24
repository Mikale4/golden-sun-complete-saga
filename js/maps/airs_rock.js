// ---------- Air's Rock (exterior) ----------
// After map references/golden-sun-the-lost-age-airs-rock-gba-map.webp, condensed: the base is the two-level maze of
// sunken sand passages between bright ledges, pink rock all round; above it the rock's face is climbed by rope,
// ledge by ledge, with the whirls off the statues' mouths for the long lifts and brown pillars dropped into the
// gaps; the second face is where the twisters roam. Per the guide: the Wind Stones amplify Whirlwind into a gust
// that blows the sand barriers away, the twister rocks clear the mud off the wall, the Mimic on the upper-left
// way, Cookie behind five stones' worth of barriers, Smoke Bomb below the second twister rock, Storm Brand down
// the far right of the first face, Vial (Frost) off the first ledge, Sleep Bomb in the pocket under the second
// face's top, Fujin Shield up the right-hand route, and the summit's twister rock opens the way inside.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const AR_ENC = [['Creeper II', 'Creeper II'], ['Dino'], ['Emu', 'Emu'], ['Ghoul II'], ['Harpy II', 'Harpy II'], ['Kobold II', 'Kobold II']];
  const WORLD = { map: 'world_tla', x: 211, y: 219, dir: DIR.DOWN };
  const LEG = {
    '.': 'ar_floor', 'L': 'ar_ledge', 'r': 'ar_ramp', 'p': 'ar_pebbles', 'v': 'pk_drop', 'g': 'pit',
    'c': { ground: 'ar_floor', obj: 'pk_climb', walk: true }, 'C': { ground: 'ar_ledge', obj: 'pk_climb', walk: true },
    'h': { ground: 'pit' }, 't': { ground: 'ar_ledge', obj: 'tree_dead' }, 'b': { ground: 'ar_ledge', obj: 'bush' }
  };
  const PINK = { cliff: '#', set: 'pinkrock', faces: 2 };
  // ---- the Wind Stones and twister rocks: Whirlwind on one runs its gust ----
  const windStone = (M, id, x, y, onWind) => M.object('windstone', x, y, { id, onWind });
  const twisterRock = (M, id, x, y, onWind, top) => { M.object('twister', x, y, { id, tile: 'twister_rock', onWind }); if (top !== false) M.setObj(x, y - 1, 'twister_rock_top'); };
  const barrier = (M, id, x, y, tile) => M.object('sandwall', x, y, { id, tile: tile || 'sandwall' });
  const blowAway = function* (E, ids, flag, text) { const MM = G.field.map; let any = false; for (const o of MM.objects) if (ids.includes(o.id) && !o.gone) { o.gone = true; G.set('obj:' + o.key, { gone: true }); any = true; } if (flag) G.set(flag); if (any) { Engine.doShake(12); Audio.sfx('push'); yield E.say(text); } else yield E.say('The rock shudders, but the wind finds nothing more to move.'); };
  // ====================== the base: the maze ======================
  const B = grid(44, 40, '#');
  fill(B, 1, 34, 42, 38, 'L'); fill(B, 20, 39, 22, 39, 'L');   // the open sand along the bottom, the way in
  B[33][21] = 'r'; fill(B, 20, 20, 21, 32, '.'); B[27][22] = '.';   // the ramp down, the first passage north, the Wind Stone's alcove
  fill(B, 6, 20, 19, 21, '.'); fill(B, 22, 20, 29, 21, '.');   // the crossways west and east
  fill(B, 8, 22, 9, 27, '.'); B[28][8] = '.';   // the lower-left branch, to the second Wind Stone
  fill(B, 8, 8, 9, 19, '.'); fill(B, 8, 6, 33, 7, '.'); B[5][8] = '.';   // the upper-left way, the long passage along the top, the Mimic's nook
  fill(B, 16, 3, 17, 5, 'p');   // the fork: a dead end of pebbles
  fill(B, 28, 8, 29, 19, '.');   // the east crossway's way up to the top passage
  fill(B, 32, 2, 33, 5, '.'); fill(B, 32, 8, 33, 31, '.'); B[19][34] = '.'; B[31][34] = '.';   // the third stone's spur, the long way down the east side, the fourth and fifth stones' alcoves
  fill(B, 34, 12, 39, 13, 'p');   // pebbles off the east side
  fill(B, 9, 30, 31, 31, '.'); fill(B, 5, 28, 8, 31, '.');   // the low passage west to the Cookie's pocket
  B[32][6] = 'v'; B[33][6] = 'v';   // the slope off the pocket down to the open sand
  fill(B, 2, 4, 3, 32, '.'); B[33][2] = 'r'; B[33][3] = 'r';   // the left path, the whole height of the rock
  fill(B, 2, 4, 9, 5, '.');   // the chamber under the mud wall
  fill(B, 8, 0, 9, 3, 'c');   // the climb the mud hides
  fill(B, 36, 3, 41, 6, '.'); fill(B, 38, 0, 38, 2, 'c');   // the pocket under the first face's far right: Storm Brand
  fill(B, 12, 22, 13, 26, '.'); fill(B, 12, 24, 17, 27, '.'); fill(B, 24, 22, 25, 25, 'p');   // dead ends off the crossways
  fill(B, 18, 8, 19, 10, '.'); fill(B, 14, 11, 26, 16, '.'); B[13][27] = '.'; B[14][27] = '.';   // the hollow in the middle of the rock, off the top passage and the east way up
  for (const [x, y] of [[16, 12], [22, 14], [19, 15], [25, 12], [15, 26], [13, 25]]) B[y][x] = 'p';
  fill(B, 34, 26, 40, 27, '.'); for (const [x, y] of [[37, 26], [39, 27]]) B[y][x] = 'p';   // a pocket east of the long way down, past the fourth stone's barrier
  for (const [x, y] of [[3, 20], [3, 26], [2, 8], [9, 12], [8, 17], [21, 29], [30, 21], [33, 14], [33, 28], [11, 31], [22, 31]]) B[y][x] = 'p';
  for (const [x, y] of [[3, 35], [10, 37], [15, 35], [27, 36], [33, 38], [39, 35], [6, 38], [24, 37], [36, 34]]) B[y][x] = 't';
  for (const [x, y] of [[8, 35], [18, 37], [30, 38], [41, 37], [13, 34], [26, 34]]) B[y][x] = 'b';
  defineMap('airs_rock', {
    name: "Air's Rock", w: 44, h: 40, base: 'void', music: 'airsrock', bg: 'airs_rock_outside', entry: { x: 21, y: 38 }, enc: AR_ENC, retreat: WORLD,
    fall: () => ({ map: 'airs_rock', x: 6, y: 34 }),
    build(M) {
      M.paint(0, 0, strs(B), LEG, PINK);
      M.exit(20, 39, 3, 1, 'world_tla', 211, 219, DIR.DOWN);
      M.exit(8, 0, 2, 1, 'airs_rock_wall', 4, 42, DIR.UP, { cond: () => G.flag('airs_mud_cleared') });
      M.exit(38, 0, 1, 1, 'airs_rock_wall', 36, 42, DIR.UP);
      M.sign(23, 36, 'Beware the Wind Stones. The stones magnify the power of the wind. Use caution when approaching Air\'s Rock.');
      M.trigger(19, 37, 5, 2, T3.airsRockEnter, { once: 'airs_entered' });
      // the Wind Stones and the sand they blow away
      windStone(M, 'ws1', 22, 27, function* (E) { yield* blowAway(E, ['sb1', 'sb1b'], null, 'The gust roars off the stone and the barrier of sand ahead is blown to nothing!'); }); barrier(M, 'sb1', 20, 23); barrier(M, 'sb1b', 21, 23);
      windStone(M, 'ws2', 8, 28, function* (E) { yield* blowAway(E, ['sb2', 'sb2b'], null, 'The gust goes over the rock, and somewhere to the south a barrier of sand is blown away.'); }); barrier(M, 'sb2', 9, 30); barrier(M, 'sb2b', 9, 31);
      windStone(M, 'ws3', 32, 2, function* (E) { yield* blowAway(E, ['sb3', 'sb3b'], null, 'The gust tears down the passage and the barrier of sand below is blown to nothing!'); }); barrier(M, 'sb3', 32, 9); barrier(M, 'sb3b', 33, 9);
      windStone(M, 'ws4', 34, 19, function* (E) { yield* blowAway(E, ['sb4', 'sb4b'], null, 'The gust tears down the passage and the barrier of sand below is blown to nothing!'); }); barrier(M, 'sb4', 32, 24); barrier(M, 'sb4b', 33, 24);
      barrier(M, 'sb5b', 25, 30); barrier(M, 'sb5b2', 25, 31); barrier(M, 'sb5a', 17, 30); barrier(M, 'sb5a2', 17, 31);
      windStone(M, 'ws5', 34, 31, function* (E) {
        const MM = G.field.map; const first = MM.objects.find(o => o.id === 'sb5b' && !o.gone);
        if (first) yield* blowAway(E, ['sb5b', 'sb5b2'], null, 'The gust goes west along the low passage and the first barrier of sand is blown away!');
        else yield* blowAway(E, ['sb5a', 'sb5a2'], null, 'The gust goes further along the passage and the second barrier of sand is blown away!');
      });
      // the twister rocks: the mud off the left path, then off the wall itself
      for (const [x, y] of [[2, 30], [3, 30]]) barrier(M, 'mw1_' + x, x, y, 'mudwall');
      twisterRock(M, 'tr1', 1, 32, function* (E) { yield* blowAway(E, ['mw1_2', 'mw1_3'], null, 'The twister rock spins up a gale and the mud choking the passage north is torn off the rock!'); }, false);
      for (const [x, y] of [[2, 12], [3, 12]]) barrier(M, 'mw2_' + x, x, y, 'mudwall');
      twisterRock(M, 'tr2', 1, 14, function* (E) { yield* blowAway(E, ['mw2_2', 'mw2_3'], null, 'The twister rock spins up a gale and the mud ahead is torn off the rock!'); }, false);
      for (const [x, y] of [[8, 1], [9, 1], [8, 2], [9, 2], [8, 3], [9, 3]]) barrier(M, 'mw3_' + x + '_' + y, x, y, 'mudwall');
      twisterRock(M, 'tr3', 6, 4, function* (E) { yield* blowAway(E, ['mw3_8_1', 'mw3_9_1', 'mw3_8_2', 'mw3_9_2', 'mw3_8_3', 'mw3_9_3'], 'airs_mud_cleared', 'The great twister rock howls, and the mud is stripped off the wall above - there are ropes under it, all the way up!'); });
      // the treasure
      M.chest(8, 5, 'Lucky Medal', 1, { mimic: 'Mimic #2 II' }); M.chest(5, 28, 'Cookie', 1); M.chest(3, 16, 'Smoke Bomb', 1); M.chest(39, 3, 'Storm Brand', 1);
      M.sign(20, 33, 'The passages are sunk into the rock; the sand drifts fill them where the wind sets it. Ramps lead down.');
    }
  });
  T3.airsRockEnter = function* (E) {
    yield E.say("Air's Rock! The Jupiter Clan trained here, long ago, and Reveal is what they left in it. Sheba, this is where you learn it.", 'Kraden');
    yield E.say('A sign, by the ramp... "Beware the Wind Stones. The stones magnify the power of the wind."', 'Jenna');
    yield E.say('Magnify it. Then Whirlwind at a stone should do more than stir the leaves.', 'Felix');
  };
  // ====================== the first face: rope by rope ======================
  // a cliff face seen side-on: rock everywhere, the ledges cut across it, ropes between them. The rock over a ledge
  // is drawn as a face down to it; the rock under a ledge's lip carries its rim
  const faceMap = (M, rows) => {
    const L = Object.assign({}, LEG, { '#': { ground: 'pk_mid' } });
    M.paint(0, 0, strs(rows), L, { cliff: null });
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] !== '#') continue; const above = y > 0 ? rows[y - 1][x] : '#', below = y < rows.length - 1 ? rows[y + 1][x] : '#';
      if (above !== '#' && above !== 'c' && above !== 'C') M.setObj(x, y, 'pinkrock_n'); else if (below !== '#' && below !== 'c' && below !== 'C') M.setObj(x, y, 'pk_face');
    }
  };
  const fallBelow = (id, rows) => (x, y) => { for (let yy = y + 1; yy < rows.length; yy++) if ('L.rp'.includes(rows[yy][x])) return { map: id, x, y: yy }; return null; };
  const updraft = (M, id, x, y, to, opts) => M.object('updraft', x, y, Object.assign({ id, to }, opts || {}));
  const W1 = grid(40, 44, '#');
  fill(W1, 2, 41, 14, 41, 'L'); fill(W1, 4, 42, 4, 43, 'c'); fill(W1, 3, 37, 3, 40, 'c');   // the foot of the face, the ropes down to the base and up to the first ledge
  fill(W1, 2, 36, 6, 36, 'L'); fill(W1, 3, 32, 3, 35, 'c'); fill(W1, 2, 31, 10, 31, 'L'); W1[31][10] = 'v';   // the first two ledges on the left, the drop off the second
  fill(W1, 8, 36, 10, 36, 'L');   // the pocket under it with the first whirl
  fill(W1, 8, 26, 16, 26, 'L'); W1[26][16] = 'v'; fill(W1, 14, 31, 16, 31, 'L');   // the third ledge, its drop, the pocket with the second whirl
  fill(W1, 14, 21, 36, 21, 'L'); W1[21][22] = 'g'; W1[21][30] = 'g'; fill(W1, 33, 17, 33, 20, 'c'); fill(W1, 36, 22, 36, 43, 'c');   // the long fourth ledge, its two gaps, the rope up and the long rope down to Storm Brand
  fill(W1, 26, 16, 36, 16, 'L'); fill(W1, 30, 12, 30, 15, 'c'); fill(W1, 24, 11, 36, 11, 'L');   // the fifth and sixth ledges on the right
  fill(W1, 14, 6, 31, 6, 'L'); W1[6][21] = 'g'; W1[6][17] = 'h'; fill(W1, 14, 0, 14, 5, 'c');   // the top ledge, its gap and its hop, the rope on up
  fill(W1, 12, 37, 12, 40, 'c'); fill(W1, 12, 36, 14, 36, 'L'); W1[36][15] = 'g'; fill(W1, 16, 36, 20, 36, 'L');   // the Vial's ledge: a rope from the foot, a puddle to freeze
  defineMap('airs_rock_wall', {
    name: "Air's Rock - The Face", w: 40, h: 44, base: 'void', music: 'airsrock', bg: 'airs_rock_outside', entry: { x: 4, y: 42 }, enc: AR_ENC, retreat: WORLD,
    fall: fallBelow('airs_rock_wall', W1),
    build(M) {
      faceMap(M, W1);
      M.exit(4, 43, 1, 1, 'airs_rock', 8, 1, DIR.DOWN); M.exit(36, 43, 1, 1, 'airs_rock', 38, 1, DIR.DOWN); M.exit(14, 0, 1, 1, 'airs_rock_wall2', 2, 40, DIR.UP);
      updraft(M, 'w1_u1', 10, 36, { x: 10, y: 26 }); updraft(M, 'w1_u2', 16, 31, { x: 16, y: 21 });
      M.setObj(36, 10, 'statue'); updraft(M, 'w1_u3', 35, 11, { x: 28, y: 6 });
      M.object('pillar', 19, 21, { id: 'w1_p1' }); M.object('pillar', 27, 21, { id: 'w1_p2' }); M.object('pillar', 25, 6, { id: 'w1_p3' }); M.object('hop', 17, 6, { id: 'w1_hop' });
      M.object('puddle', 15, 36, { id: 'w1_puddle' }); M.chest(20, 36, 'Vial', 1);
      M.sign(6, 40, 'The ropes are old but they hold. Whirls rise off the rock where the statues breathe.');
    }
  });
  // ====================== the second face: the twisters ======================
  const W2 = grid(42, 42, '#');
  fill(W2, 2, 37, 40, 37, 'L'); fill(W2, 2, 38, 2, 41, 'c');   // the foot, the rope down to the first face
  fill(W2, 6, 33, 6, 36, 'c'); fill(W2, 6, 31, 28, 32, 'L'); fill(W2, 16, 32, 18, 32, '#'); W2[31][7] = '#'; W2[31][27] = '#'; fill(W2, 28, 27, 28, 30, 'c');   // the first twister ledge: two deep, the rock that pinches it to the twister's row
  fill(W2, 9, 25, 28, 26, 'L'); fill(W2, 18, 26, 20, 26, '#'); W2[25][10] = '#'; W2[25][27] = '#'; fill(W2, 28, 21, 28, 24, 'c');   // the second twister ledge
  fill(W2, 2, 25, 7, 26, 'L'); W2[25][8] = 'g';   // the pocket under the top: the Sleep Bomb, the statue's whirl, the pillar for the gap
  fill(W2, 4, 20, 28, 20, 'L'); W2[20][4] = 'v';   // the top of the twisters' climb, the drop into the pocket
  fill(W2, 4, 15, 30, 15, 'L'); fill(W2, 24, 5, 24, 14, 'c'); fill(W2, 20, 4, 41, 4, 'L');   // the ledge the whirl lifts to, the rope to the top ledge and the way off the face
  fill(W2, 40, 33, 40, 36, 'c'); fill(W2, 38, 32, 40, 32, 'L'); fill(W2, 38, 28, 38, 31, 'c'); fill(W2, 36, 27, 40, 27, 'L'); fill(W2, 40, 23, 40, 26, 'c'); fill(W2, 38, 22, 40, 22, 'L');
  fill(W2, 38, 18, 38, 21, 'c'); fill(W2, 36, 17, 40, 17, 'L'); fill(W2, 40, 12, 40, 16, 'c'); fill(W2, 34, 11, 40, 11, 'L');   // the right-hand route: five ropes to the Fujin Shield
  defineMap('airs_rock_wall2', {
    name: "Air's Rock - The Upper Face", w: 42, h: 42, base: 'void', music: 'airsrock', bg: 'airs_rock_outside', entry: { x: 2, y: 40 }, enc: AR_ENC, retreat: WORLD,
    fall: fallBelow('airs_rock_wall2', W2),
    build(M) {
      faceMap(M, W2);
      M.exit(2, 41, 1, 1, 'airs_rock_wall', 14, 1, DIR.DOWN); M.exit(41, 4, 1, 1, 'airs_rock_summit', 1, 16, DIR.RIGHT);
      const flung = function* (E) { Audio.sfx('push'); Engine.doShake(10); yield E.say('The twister catches the party up and flings them off the ledge!'); yield Engine.fadeOut(12); E.warpNow('airs_rock_wall2', 8, 37, DIR.UP); yield Engine.fadeIn(12); };
      M.object('tornado', 8, 31, { id: 'w2_t1', x0: 8, x1: 26, speed: 9, onHit: flung }); M.object('tornado', 26, 25, { id: 'w2_t2', x0: 11, x1: 26, speed: 8, dx: -1, onHit: flung });
      for (const [x, y] of [[8, 30], [26, 30], [11, 24], [26, 24]]) M.setObj(x, y, 'statue');   // the statues that breathe them out
      M.setObj(2, 24, 'statue'); updraft(M, 'w2_u4', 2, 25, { x: 6, y: 15 }); M.object('pillar', 6, 25, { id: 'w2_p4' }); M.chest(2, 26, 'Sleep Bomb', 1);
      M.chest(34, 11, 'Fujin Shield', 1);
      M.sign(4, 36, 'Two ways up: the ledges the statues watch, or the ropes on the right.');
    }
  });
  // ====================== the summit ======================
  const S = grid(30, 24, '#');
  fill(S, 1, 12, 27, 20, 'L'); fill(S, 0, 16, 0, 16, 'L');   // the terrace, the way in from the face
  fill(S, 7, 0, 22, 11, 'R'); fill(S, 12, 6, 17, 11, 'm'); fill(S, 11, 4, 18, 5, 'm');   // the great face of lilac stone, the stair cut up into it, the landing before the door
  fill(S, 23, 9, 25, 11, 'L');   // the back door's step
  for (const [x, y] of [[4, 14], [22, 18], [8, 19], [25, 13]]) S[y][x] = 'b';
  defineMap('airs_rock_summit', {
    name: "Air's Rock - Summit", w: 30, h: 24, base: 'void', music: 'airsrock', bg: 'airs_rock_outside', entry: { x: 1, y: 16 }, enc: [['Harpy II', 'Harpy II'], ['Kobold II']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(S), Object.assign({ 'm': 'marble' }, LEG), PINK); M.paint(0, 0, strs(S), {}, { cliff: 'R', set: 'lilacrock', faces: 2 });
      M.exit(0, 16, 1, 1, 'airs_rock_wall2', 40, 4, DIR.LEFT);
      for (const [x, y] of [[11, 6], [18, 6], [11, 9], [18, 9]]) { M.setObj(x, y, 'pillar_base'); M.setObj(x, y - 1, 'pillar_top'); }   // the columns up the stair
      M.setObj(12, 3, 'statue'); M.setObj(17, 3, 'statue'); M.setObj(11, 3, 'twister_rock_top'); M.setObj(18, 3, 'twister_rock_top');   // the carved guardians either side of the door
      // the door into the rock, under its mud, and the twister rock that clears it
      M.setObj(14, 3, 'lc_door'); M.setObj(15, 3, 'lc_door'); M.walkable(14, 3, 2, 1); M.exit(14, 3, 2, 1, 'airs_rock_in_entry', 6, 12, DIR.UP, { door: true, cond: () => G.flag('airs_door_open') });
      barrier(M, 'mw4_14', 14, 3, 'mudwall'); barrier(M, 'mw4_15', 15, 3, 'mudwall');
      twisterRock(M, 'tr4', 12, 8, function* (E) { yield* blowAway(E, ['mw4_14', 'mw4_15'], 'airs_door_open', 'The twister rock howls and the mud is stripped off the face above the stair - a doorway, cut into the rock!'); });
      M.setObj(24, 8, 'lc_door'); M.walkable(24, 8); M.exit(24, 8, 1, 1, 'airs_rock_in_hall', 27, 30, DIR.UP, { door: true });
      M.sign(19, 14, 'The summit of Air\'s Rock. The wind never stops here.');
      M.trigger(1, 15, 2, 3, function* (E) { yield E.say('The top. And that is a door, up there behind the mud - the twister rock beside the stair will have it off.', 'Kraden'); }, { once: 'airs_summit_seen' });
    }
  });
}
