// ---------- Magma Rock ----------
// After map references/golden-sun-the-lost-age-magma-rock-gba-map.webp (5035x3616: the red faces of the exterior
// stacked three screens high, and thirty-odd lava rooms) condensed to the guide's chapter 15: the boulder Lift
// raises from the cave mouth (the Mimic inside), the faces climbed hold by hold - Burst on the statues (a cracked
// column crumbles into a climb, a statue's breath fires the party up), the pillars into the gaps, the slides, the
// plants Growth grows up the rock, the four slides of the upper ledge (the 383 coins, the rope Lash ties across, the
// statue's ride), the cracked stones hopped, the rocks the statues volley along the last ledge, the Salamander Tail
// down the lower way, and the Moai at the summit whose Burst the Psynergy rock turns into the blast that opens the
// mountain. Inside: the great hall whose Moai floods it with lava (the rafts float up, the low floor drowns) and the
// switch that drains it, the Lucky Medal, the south way when it is dry (the pillar up, the blue gem's stair, the
// pillar down three squares that opens the north passage, Fury and the Mars Djinni that GS1 may have missed), the
// east way when it is flooded (the hop, the tightrope, the Mist Potion, the pillar into the lava, the ferry across,
// the two cracked pillars), the north way (the second hall's Moai and its button, the chains Whirlwind drops, the
// Salamander Tail, the three pillars into the pits, the Golem Core), the ledge of volleyed rocks and fireballs, the
// Magma Ball on its red rock behind the flame wall, the Blaze tablet (Jenna), Blaze on the torch for the way back and
// on the flame for the ball.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 120, y: 138, dir: DIR.DOWN };
  const OUT_ENC = [['Raging Rock'], ['Phoenix'], ['Lich'], ['Little Death', 'Little Death'], ['Wise Gryphon']];
  const IN_ENC = [['Lesser Demon', 'Lesser Demon'], ['Grand Chimera'], ['Lich'], ['Phoenix', 'Little Death'], ['Raging Rock']];
  const flooded = (n) => G.get('mr_flood' + (n || 1)) === 1;
  // ====================== the exterior: red faces, ledges cut across them ======================
  const XLEG = {
    'L': 'mr_ledge', 'c': { ground: 'mr_mid', obj: 'mr_climb', walk: true }, 'v': 'mr_drop', 'p': 'mr_pit', 'g': { ground: 'mr_pit', obj: null }, 'D': { ground: 'mr_mid', obj: 'mr_door', walk: true },
    'K': { ground: 'mr_mid', obj: 'mr_column' }, 'G': 'grass', 'T': { ground: 'grass', obj: 'tree' }, 'd': 'path'
  };
  const faceMap = (M, rows) => {
    M.paint(0, 0, strs(rows), Object.assign({ '#': { ground: 'mr_mid' } }, XLEG), { cliff: null });
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] !== '#') continue; const above = y > 0 ? rows[y - 1][x] : '#', below = y < rows.length - 1 ? rows[y + 1][x] : '#';
      if (above !== '#' && above !== 'c' && above !== 'K') M.setObj(x, y, 'magmarock_n'); else if (below !== '#' && below !== 'c' && below !== 'K') M.setObj(x, y, 'mr_face'); else M.setObj(x, y, 'mr_mid');
    }
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (rows[y][x] === 'g') { M.set(x, y, 'mr_pit'); M.object('hop', x, y, { id: 'hop_' + x + '_' + y }); }   // a cracked stone across a gap: hopped
  };
  const fallBelow = (id, rows) => (x, y) => { for (let yy = y + 1; yy < rows.length; yy++) if ('LGd'.includes(rows[yy][x])) return { map: id, x, y: yy }; return null; };
  const outMap = (id, name, rows, entry, build, extra) => defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'mr_mid', music: 'magmarock', bg: 'lava', entry, enc: OUT_ENC, retreat: WORLD, fall: fallBelow(id, rows), build(M) { faceMap(M, rows); build(M); } }, extra || {}));
  // a statue Burst wakes: the column it guards crumbles into a climb (flag + the cells), or it fires the party up (an updraft)
  const statue = (M, id, x, y, onBurst) => M.object('crack', x, y, { id, tile: 'mr_statue', reveal: 'mr_statue', onBurst });
  const columnClimb = (M, flag, x, y0, y1) => { if (G.flag(flag)) for (let y = y0; y <= y1; y++) { M.setObj(x, y, 'mr_climb'); M.walkable(x, y); } };
  const crumble = (flag, x, y0, y1, text) => function* (E) { G.set(flag); Engine.doShake(12); Audio.sfx('boom'); const Mp = G.field.map; for (let y = y0; y <= y1; y++) { persistObjTile(Mp, x, y, 'mr_climb'); persistWalkable(Mp, x, y); } Mp.finalize(); yield E.say(text || 'The cracked column shudders and crumbles - and its broken stub is a stair of holds up the face.'); };
  const breath = (M, id, x, y, tx, ty, flag) => { if (G.flag(flag)) M.object('updraft', x, y, { id: id + '_up', to: { x: tx, y: ty }, onTile: 'whirlwind', tile: null, passable: true }); else statue(M, id, x, y, function* (E) { G.set(flag); const Mp = G.field.map; Mp.objects = Mp.objects.filter(o => o.id !== id); persistObjTile(Mp, x, y, null); persistWalkable(Mp, x, y); Mp.objects.push({ kind: 'updraft', x, y, id: id + '_up', key: Mp.id + ':updraft:' + id + '_up', to: { x: tx, y: ty }, onTile: 'whirlwind', tile: null, passable: true }); Mp.finalize(); Engine.doShake(8); Audio.sfx('wind'); yield E.say('The statue\'s mouth opens, and a hot wind roars up out of it! Stand on its head, and it will carry the party up the face.'); }); };
  const pillarGap = (M, id, x, y) => M.object('pillar', x, y, { id });
  // --- screen A: the foot, the cave mouth, the first faces ---
  const A = grid(30, 30, '#');
  fill(A, 1, 25, 28, 28, 'L'); fill(A, 13, 29, 16, 29, 'L'); A[24][14] = 'D';
  fill(A, 2, 19, 2, 24, 'c'); fill(A, 2, 18, 13, 18, 'L'); fill(A, 7, 15, 7, 17, 'K');
  fill(A, 2, 14, 16, 14, 'L'); A[14][12] = 'p'; fill(A, 16, 9, 16, 13, 'c'); fill(A, 5, 8, 27, 8, 'L'); A[8][6] = 'v';
  fill(A, 2, 11, 8, 11, 'L'); fill(A, 2, 5, 12, 5, 'L'); A[5][10] = 'p'; fill(A, 12, 0, 12, 4, 'c');
  for (const [x, y] of [[3, 26], [26, 27], [9, 28], [20, 28]]) A[y][x] = 'T';
  outMap('magma_rock', 'Magma Rock', A, { x: 14, y: 27 }, (M) => {
    M.walkable(13, 29, 4, 1); M.exit(13, 29, 4, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN);
    M.exit(14, 24, 1, 1, 'mr_mimic', 6, 8, DIR.UP, { door: true });
    M.object('boulder', 14, 25, { id: 'mr_boulder', onLift: function* (E) { G.set('mr_boulder_lifted'); yield E.say('The boulder rises off the cave mouth. A way in - though the air out of it is stale, and short.', 'Isaac'); } });
    statue(M, 'mr_st1', 13, 18, crumble('mr_col1', 7, 15, 17));
    columnClimb(M, 'mr_col1', 7, 15, 17);
    pillarGap(M, 'mr_pil1', 10, 14); M.set(12, 14, 'mr_pit');
    breath(M, 'mr_st2', 4, 11, 4, 5, 'mr_st2_woke');
    pillarGap(M, 'mr_pil2', 8, 5); M.set(10, 5, 'mr_pit');
    M.exit(12, 0, 1, 1, 'magma_rock_b', 12, 27, DIR.UP);
    M.sign(22, 27, 'Magma Rock. The mountain that burns from within. The way up is the face itself: the holds, the ledges, the statues of the old people who lived by fire.');
    M.trigger(1, 25, 28, 1, function* (E) { yield E.say('Magma Rock. Loho\'s diggers say the mountain breathes fire and holds a ball of it - the shot for their cannon.', 'Kraden'); yield E.say('The cave mouth is stopped with a boulder. Lift, Isaac.', 'Felix'); }, { once: 'mr_seen' });
  });
  // the shallow cave behind the boulder: the Mimic's chest, and nothing else until the mountain is opened from above
  const MI = grid(14, 12, '#');
  fill(MI, 2, 2, 11, 9, '.');
  defineMap('mr_mimic', { name: 'Magma Rock - Cave Mouth', w: 14, h: 12, base: 'void', music: 'magmarock', bg: 'lava', indoor: true, entry: { x: 6, y: 8 }, enc: IN_ENC, retreat: WORLD, build(M) {
    M.paint(0, 0, strs(MI), { '.': 'mr_floor' }, { cliff: '#', set: 'mrwall', top: 'mr_wtop', face: 'mr_wface', mid: 'mr_wtop' });
    M.set(6, 10, 'mr_floor'); M.setObj(6, 10, 'mr_door'); M.walkable(6, 10); M.exit(6, 10, 1, 1, 'magma_rock', 14, 25, DIR.DOWN, { door: true });
    M.chest(6, 3, 'Apple', 1, { mimic: 'Mimic #7' });
    M.sign(3, 3, 'A shallow cave, and a chest in it. The mountain\'s heart is not reached this way: the rock behind is solid.');
  } });
  // --- screen B: the Oil Drop pocket, the plants, the slide, the Moai, the ride up, the pillar far left ---
  const B = grid(30, 32, '#');
  fill(B, 2, 26, 27, 26, 'L'); fill(B, 12, 27, 12, 31, 'c'); fill(B, 26, 27, 26, 29, 'c'); fill(B, 22, 30, 27, 30, 'L');
  fill(B, 14, 19, 27, 19, 'L'); B[19][18] = 'K'; fill(B, 14, 14, 14, 18, 'c'); fill(B, 2, 13, 16, 13, 'L'); B[13][3] = 'v';
  fill(B, 2, 16, 8, 16, 'L'); fill(B, 2, 20, 12, 20, 'L'); fill(B, 2, 9, 20, 9, 'L'); B[9][4] = 'p'; fill(B, 2, 3, 2, 8, 'c'); fill(B, 20, 3, 20, 8, 'c'); fill(B, 14, 2, 27, 2, 'L');
  outMap('magma_rock_b', 'Magma Rock - The Faces', B, { x: 12, y: 27 }, (M) => {
    M.exit(12, 31, 1, 1, 'magma_rock', 12, 1, DIR.DOWN); M.set(12, 31, 'mr_ledge');
    M.chest(23, 30, 'Oil Drop', 1);
    // the right plant: Growth grows it up the rock to the ledge above; the statue there crumbles the column across that ledge
    M.object('sprout', 24, 26, { id: 'mr_sprout1' });
    statue(M, 'mr_st3', 26, 19, crumble('mr_col2', 18, 19, 19, 'The statue shudders, and the cracked column across the ledge crumbles to rubble the party can walk over.'));
    if (G.flag('mr_col2')) { M.setObj(18, 19, null); M.set(18, 19, 'mr_ledge'); M.walkable(18, 19); }
    // the slide off the upper ledge lands on a shelf with a Moai: Burst, and the column under the shelf crumbles into the way down
    statue(M, 'mr_st4', 6, 16, crumble('mr_col3', 5, 17, 25, 'The Moai\'s eyes flare, and the rock under the shelf splits into holds all the way down to the foot.'));
    columnClimb(M, 'mr_col3', 5, 17, 25);
    // the left plant: Growth up to the shelf whose statue breathes the party up to the long ledge; the pillar there far left
    M.object('sprout', 9, 26, { id: 'mr_sprout2' });
    breath(M, 'mr_st5', 2, 20, 14, 9, 'mr_st5_woke');
    pillarGap(M, 'mr_pil3', 12, 9);
    M.exit(2, 2, 1, 1, 'magma_rock_c', 2, 29, DIR.UP); M.set(2, 2, 'mr_ledge'); M.walkable(2, 2);
    M.sign(26, 2, 'The upper ledge ends in the rock. A dead end, for now.');
    M.sign(3, 26, 'Plants grow in the cracks of the face here, thin and dry. Growth would run them up the rock.');
  });
  // --- screen C: the four slides, the rope, the Moai's ride, the pillar shortcut ---
  const Cc = grid(30, 32, '#');
  fill(Cc, 2, 28, 27, 28, 'L'); fill(Cc, 2, 29, 2, 31, 'c'); fill(Cc, 27, 21, 27, 27, 'c'); fill(Cc, 2, 20, 27, 20, 'L');
  for (const x of [6, 10, 16, 22]) Cc[21][x] = 'v';   // the worn edges hang off the ledge's lip: stepped down onto, a slide
  fill(Cc, 14, 24, 18, 24, 'L'); fill(Cc, 18, 21, 18, 23, 'c');   // the coins pocket and its climb back
  fill(Cc, 9, 24, 12, 24, 'L'); Cc[24][8] = 'p'; fill(Cc, 2, 24, 7, 24, 'L');   // the rope's ledge, the gap, the Moai's shelf
  fill(Cc, 2, 16, 12, 16, 'L'); Cc[16][10] = 'p'; fill(Cc, 12, 17, 12, 19, 'c'); fill(Cc, 2, 3, 2, 15, 'c');
  outMap('magma_rock_c', 'Magma Rock - The Slides', Cc, { x: 2, y: 29 }, (M) => {
    M.exit(2, 31, 1, 1, 'magma_rock_b', 2, 3, DIR.DOWN); M.set(2, 31, 'mr_ledge');
    M.chest(15, 24, 'Coins', 383, { coins: 383 });
    M.object('rope', 9, 24, { id: 'mr_rope', len: 2, dx: -1, dy: 0 });
    breath(M, 'mr_st6', 3, 24, 3, 16, 'mr_st6_woke');
    pillarGap(M, 'mr_pil4', 8, 16);
    M.exit(2, 2, 1, 1, 'magma_rock_d', 2, 29, DIR.UP); M.set(2, 2, 'mr_ledge'); M.walkable(2, 2);
    M.sign(4, 20, 'Four worn edges along this ledge, and four drops. Not every shelf below has a way off it.');
  });
  // --- screen D: the cracked stones, the statue's column, the volleyed rocks ---
  const Dd = grid(30, 32, '#');
  fill(Dd, 2, 28, 27, 28, 'L'); fill(Dd, 2, 29, 2, 31, 'c'); Dd[28][8] = 'p'; Dd[28][12] = 'g'; Dd[28][14] = 'g';
  fill(Dd, 16, 22, 16, 27, 'c'); fill(Dd, 10, 21, 27, 21, 'L'); Dd[21][13] = 'K'; Dd[21][10] = 'v';
  fill(Dd, 2, 25, 10, 25, 'L'); fill(Dd, 2, 26, 2, 27, 'c'); fill(Dd, 10, 26, 10, 27, 'c');   // the shelf under the slide: down to the lower way's screen, or down to the foot ledge
  fill(Dd, 26, 14, 26, 20, 'c'); fill(Dd, 2, 13, 27, 13, 'L'); for (const x of [6, 12, 18, 24]) Dd[14][x] = 'L'; fill(Dd, 2, 3, 2, 12, 'c');
  outMap('magma_rock_d', 'Magma Rock - The High Faces', Dd, { x: 2, y: 29 }, (M) => {
    M.exit(2, 31, 1, 1, 'magma_rock_c', 2, 3, DIR.DOWN); M.set(2, 31, 'mr_ledge');
    pillarGap(M, 'mr_pil5', 6, 28);
    statue(M, 'mr_st7', 27, 21, crumble('mr_col4', 13, 21, 21, 'The statue shudders, and the cracked column on the ledge crumbles to rubble.'));
    if (G.flag('mr_col4')) { M.setObj(13, 21, null); M.set(13, 21, 'mr_ledge'); M.walkable(13, 21); }
    // the lower way: the drop off the ledge's left end, the shelf and the climb down to the Salamander Tail's screen
    M.exit(2, 27, 1, 1, 'magma_rock_e', 2, 2, DIR.DOWN); M.walkable(2, 27);
    // the last ledge: two statues in the face above volley a rock along it; the notches below the ledge are shelter
    M.setObj(8, 12, 'mr_statue'); M.setObj(20, 12, 'mr_statue');
    M.object('tornado', 20, 13, { id: 'mr_rock1', tile: 'mr_rock', x0: 3, x1: 26, speed: 8, dx: -1, onHit: function* (E) { Audio.sfx('hit'); Engine.doShake(10); yield E.say('A ball of burning rock bowls the party off the ledge!'); yield Engine.fadeOut(8); E.warpNow('magma_rock_d', 26, 21, DIR.UP); yield Engine.fadeIn(8); } });
    M.exit(2, 2, 1, 1, 'magma_rock_top', 2, 17, DIR.UP); M.set(2, 2, 'mr_ledge'); M.walkable(2, 2);
    M.sign(27, 13, 'The right way along the ledge ends in the rock. The statues in the face above spit fire along it.');
  });
  const Ee = grid(20, 12, '#');
  fill(Ee, 2, 2, 2, 5, 'c'); fill(Ee, 2, 6, 17, 6, 'L'); fill(Ee, 2, 7, 5, 9, 'L');
  outMap('magma_rock_e', 'Magma Rock - The Lower Way', Ee, { x: 2, y: 2 }, (M) => {
    M.exit(2, 1, 1, 1, 'magma_rock_d', 2, 26, DIR.UP); M.set(2, 1, 'mr_ledge'); M.walkable(2, 1);
    M.chest(3, 8, 'Salamander Tail', 1);
    M.sign(16, 6, 'A shelf below the high faces, going nowhere. Something glints in the corner.');
  });
  // --- the summit: the Moai on the right, the Psynergy rock beside it; Burst, and the mountain opens ---
  const S = grid(26, 20, '#');
  fill(S, 2, 17, 23, 17, 'L'); fill(S, 2, 18, 2, 19, 'c'); fill(S, 2, 14, 23, 16, 'L'); S[13][12] = 'D';
  outMap('magma_rock_top', 'Magma Rock - Summit', S, { x: 2, y: 17 }, (M) => {
    M.exit(2, 19, 1, 1, 'magma_rock_d', 2, 3, DIR.DOWN); M.set(2, 19, 'mr_ledge');
    if (G.flag('mr_open')) M.exit(12, 13, 1, 1, 'mr_hub', 12, 20, DIR.UP, { door: true }); else { M.setObj(12, 13, 'mr_face'); M.block(12, 13); }
    M.setObj(20, 16, 'psystone');
    statue(M, 'mr_moai_top', 22, 16, function* (E) { G.set('mr_open'); Audio.sfx('boom'); Engine.doShake(30); Engine.doFlash(20, '#ffb040'); yield E.say('The Psynergy rock beside the Moai takes the Burst and throws it back a hundredfold - the whole face shakes, and where the rock was blank a dark mouth gapes in it!'); const Mp = G.field.map; Mp.setObj(12, 13, 'mr_door'); Mp.walkable(12, 13); Mp.exits.push({ x: 12, y: 13, w: 1, h: 1, to: 'mr_hub', tx: 12, ty: 20, dir: DIR.UP, door: true }); Mp.finalize(); yield E.say('The heart of the mountain. Fire answers fire: Jenna, this is your road.', 'Kraden'); });
    M.sign(4, 15, 'The summit of Magma Rock. A Moai at the far right, and beside it a Psynergy stone, humming.');
  });
  // ====================== the interior ======================
  const ILEG = { '.': 'mr_floor', 'l': 'mr_low', 'P': 'mr_pit', 'L': 'lava', 'p': 'mr_pit', 'g': 'mr_pit', 'r': 'ropeh', 'c': { ground: 'mr_wtop', obj: 'mr_climb', walk: true }, 'x': { ground: 'mr_wtop', obj: 'mr_chain' }, 'G': { ground: 'mr_wtop', obj: 'mr_gem' } };
  const IW = { cliff: '#', set: 'mrwall', top: 'mr_wtop', face: 'mr_wface', mid: 'mr_wtop' };
  // a room with a basin: 'l' is low floor, drowned when the level floods; 'P' is a raft that floats up then, a pit when not
  const inRoom = (id, name, rows, entry, build, extra) => defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'magmarock', bg: 'lava', indoor: true, entry, enc: IN_ENC, retreat: WORLD, build(M) {
    M.paint(0, 0, strs(rows), ILEG, IW);
    const lv = extra && extra.level || 1; const on = flooded(lv);
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) { const ch = rows[y][x]; if (ch === 'l' && on) M.set(x, y, 'lava'); if (ch === 'P' && on) M.set(x, y, 'mr_raft'); if (ch === 'g') M.object('hop', x, y, { id: 'hop_' + x + '_' + y }); }
    build(M);
  } }, extra || {}));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.set(x, y, 'mr_floor'); M.setObj(x, y, 'mr_door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const way = (M, x, y, w, h, to, tx, ty, dir, opts) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { M.set(x + i, y + j, 'mr_floor'); M.setObj(x + i, y + j, null); } M.walkable(x, y, w, h); M.exit(x, y, w, h, to, tx, ty, dir, opts); };
  const stairs = (M, x, y, to, tx, ty, down) => { M.set(x, y, 'mr_floor'); M.setObj(x, y, down ? 'stairs_down' : 'stairs_up'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, down ? DIR.DOWN : DIR.UP, { stairs: true }); };
  const reflood = function* (E, lv, on, text) { G.set('mr_flood' + lv, on ? 1 : 0); Engine.doShake(16); Audio.sfx(on ? 'fire' : 'push'); yield E.say(text); yield Engine.fadeOut(10); const p = G.field.player; E.warpNow(G.map.id, p.tx, p.ty, p.dir); yield Engine.fadeIn(10); };
  // a Moai statue Burst floods a level: the object is only there while the level is dry (drained, the statue waits again)
  const moai = (M, id, x, y, lv, text) => { if (flooded(lv)) { M.setObj(x, y, 'moai_red'); M.block(x, y); return; } delete G.flags['obj:' + M.id + ':crack:' + id]; M.object('crack', x, y, { id, tile: 'moai_red', reveal: 'moai_red', onBurst: function* (E) { yield* reflood(E, lv, true, text || 'The Moai\'s eyes blaze, and lava wells up out of the floor of the hall! The low floor drowns under it - and the stone rafts float up on the flood.'); } }); };
  const drainButton = (M, id, x, y, lv, text) => { M.set(x, y, 'mr_button'); M.trigger(x, y, 1, 1, function* (E) { if (!flooded(lv)) { yield E.say('(The button sinks and rises. The gate beside it stands open; the lava is already gone.)'); return; } yield* reflood(E, lv, false, text || 'The button sinks, and with a grinding of stone the gate rises: the lava runs away through it, and the low floors stand bare and steaming.'); }); };
  // --- the great hall ---
  const H = grid(26, 24, '#');
  fill(H, 2, 2, 23, 7, '.'); fill(H, 2, 8, 23, 15, 'l'); fill(H, 2, 16, 23, 19, '.'); fill(H, 12, 20, 12, 21, '.'); fill(H, 20, 20, 20, 21, '.');
  fill(H, 2, 11, 23, 11, 'P'); fill(H, 13, 8, 13, 10, 'P'); H[11][12] = '.';
  inRoom('mr_hub', 'Magma Rock - The Great Hall', H, { x: 12, y: 20 }, (M) => {
    door(M, 12, 22, 'magma_rock_top', 12, 14, DIR.DOWN);
    way(M, 1, 11, 1, 1, 'mr_w1', 14, 7, DIR.LEFT); way(M, 24, 11, 1, 1, 'mr_e1', 2, 7, DIR.RIGHT);
    moai(M, 'mr_moai1', 12, 1, 1);
    // the passage marked by the blue gem: shut until the pillar in the south way has gone down its three squares
    M.setObj(4, 1, 'mr_gem'); if (G.flag('mr_gem_open')) { M.set(4, 1, 'mr_floor'); M.setObj(4, 1, 'mr_door'); M.walkable(4, 1); M.exit(4, 1, 1, 1, 'mr_n1', 8, 12, DIR.UP, { door: true }); }
    M.trigger(3, 2, 3, 1, function* (E) { yield E.say('A blue gem set in the wall, and no door under it. The stone is seamless.'); }, { once: 'mr_gem_seen', cond: () => !G.flag('mr_gem_open') });
    door(M, 20, 22, 'mr_s1', 10, 13, DIR.DOWN, { cond: () => !flooded(1) });
    M.trigger(19, 19, 3, 1, function* (E) { yield E.say('A low door in the south wall - and the lava laps over its sill. Nothing gets through it while the hall is flooded.'); }, { once: 'mr_sdoor_seen', cond: () => flooded(1) });
    M.sign(3, 18, () => flooded(1) ? 'The hall is a lake of lava. Rafts of stone ride on it in a line from wall to wall.' : 'The great hall. Its floor steps down into a wide basin, with a line of pits across it; a Moai stares from the north wall.');
    M.trigger(11, 16, 3, 1, function* (E) { yield E.say('The basin is dry, and there is a way straight across it to the statue. Burst, then - it woke the ones on the face.', 'Piers'); }, { once: 'mr_hub_seen', cond: () => !flooded(1) });
  });
  // --- the west way: the fork to the Lucky Medal and to the switch that drains the hall ---
  const W1 = grid(16, 10, '#');
  fill(W1, 2, 2, 13, 7, '.');
  inRoom('mr_w1', 'Magma Rock - West Way', W1, { x: 14, y: 7 }, (M) => {
    way(M, 15, 7, 1, 1, 'mr_hub', 2, 11, DIR.RIGHT, { cond: () => flooded(1) });
    M.trigger(14, 7, 1, 1, function* (E) { yield E.say('The doorway to the hall opens on a drop: the raft that floated here has gone down with the lava.'); }, { cond: () => !flooded(1) });
    door(M, 3, 1, 'mr_w3', 5, 6, DIR.UP); door(M, 12, 1, 'mr_w2', 5, 10, DIR.UP);
    M.sign(7, 3, 'Two doors. The left leads on to a small chamber, the right to the gate the lava runs out by.');
  });
  const W2 = grid(12, 12, '#');
  fill(W2, 2, 2, 9, 9, '.'); fill(W2, 5, 10, 5, 10, '.');
  inRoom('mr_w2', 'Magma Rock - The Gate', W2, { x: 5, y: 10 }, (M) => {
    door(M, 5, 11, 'mr_w1', 12, 2, DIR.DOWN);
    for (const x of [7, 8, 9]) M.setObj(x, 1, flooded(1) ? 'mr_gate' : 'mr_gate_open');
    if (!flooded(1)) { M.set(8, 0, 'mr_floor'); M.walkable(8, 0); M.walkable(8, 1); M.exit(8, 0, 1, 1, 'mr_hub', 4, 3, DIR.UP); }
    drainButton(M, 'mr_btn1', 5, 3, 1);
    M.sign(2, 3, 'A gate of bars in the north wall, and a button in the floor before it. Beyond the bars, a dark channel runs down into the mountain.');
  });
  const W3 = grid(10, 8, '#');
  fill(W3, 2, 2, 7, 5, '.'); W3[6][5] = '.';
  inRoom('mr_w3', 'Magma Rock - West Chamber', W3, { x: 5, y: 6 }, (M) => { door(M, 5, 7, 'mr_w1', 3, 2, DIR.DOWN); M.chest(5, 2, 'Lucky Medal', 1); });
  // --- the south way, when the hall is dry: the pillar up, the blue gem's stair, the pillar down three, Fury ---
  const S1 = grid(20, 16, '#');
  fill(S1, 2, 2, 17, 4, '.'); fill(S1, 2, 5, 17, 5, 'p'); fill(S1, 2, 6, 17, 13, '.'); fill(S1, 10, 14, 10, 14, '.');
  inRoom('mr_s1', 'Magma Rock - South Way', S1, { x: 10, y: 13 }, (M) => {
    door(M, 10, 15, 'mr_hub', 20, 19, DIR.DOWN);
    M.object('pillar', 10, 8, { id: 'mr_pil_s1' });
    M.setObj(10, 1, 'mr_gem'); stairs(M, 10, 2, 'mr_s2', 12, 2, false); M.setObj(10, 1, 'mr_gem');
    M.sign(3, 7, 'A trench across the room, too wide to jump, and a pillar on the near side of it. A blue gem marks a stair beyond.');
  });
  const S2 = grid(24, 16, '#');
  fill(S2, 12, 2, 12, 2, '.'); fill(S2, 12, 3, 12, 6, 'c'); fill(S2, 2, 7, 21, 13, '.'); fill(S2, 3, 14, 3, 14, '.'); fill(S2, 3, 2, 3, 6, '.');
  inRoom('mr_s2', 'Magma Rock - The Descent', S2, { x: 12, y: 2 }, (M) => {
    stairs(M, 12, 1, 'mr_s1', 10, 3, true);
    door(M, 3, 1, 'mr_s4', 8, 12, DIR.UP); door(M, 3, 15, 'mr_s3', 8, 2, DIR.DOWN);
    M.sign(18, 8, 'The stair comes down a wall of holds into a wide low room. Doors at the upper left and the lower left.');
  });
  const S4 = grid(16, 14, '#');
  fill(S4, 2, 2, 13, 12, '.'); S4[9][8] = 'p';
  inRoom('mr_s4', 'Magma Rock - The Counterweight', S4, { x: 8, y: 12 }, (M) => {
    door(M, 8, 13, 'mr_s2', 3, 2, DIR.DOWN);
    M.object('pillar', 8, 5, { id: 'mr_pil_s4', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'mr_pil_s4'); if (o && o.gone && !G.flag('mr_gem_open')) { G.set('mr_gem_open'); Engine.doShake(14); Audio.sfx('boom'); yield E.say('The pillar drops into the pit - three squares down it went, and it goes on down, and somewhere far above a great weight shifts and a door grinds open. The blue gem\'s passage in the hall!', 'Sheba'); } } });
    M.sign(3, 3, 'A pillar, and a pit three squares below it. The pit goes down into the dark a long way.');
  });
  const S3 = grid(20, 18, '#');
  fill(S3, 2, 2, 17, 15, '.'); fill(S3, 8, 1, 8, 1, '.');
  inRoom('mr_s3', 'Magma Rock - The Deep', S3, { x: 8, y: 2 }, (M) => {
    door(M, 8, 1, 'mr_s2', 3, 14, DIR.UP);
    M.djinni('Fury', 9, 12, { fight: true });
    const missing = ['Forge', 'Fever', 'Corona', 'Scorch', 'Ember', 'Flash', 'Torch'].find(n => !G.party.djinnFound.includes(n));
    if (missing && flooded(1)) M.djinni(missing, 15, 14, { fight: true });
    M.sign(3, 3, 'The deepest room of the south way. Hot, and quiet - something waits in it.');
  });
  // --- the east way, when the hall is flooded: the hop, the tightrope, the Mist Potion, the pillar into the lava, the ferry, the cracked pillars ---
  const E1 = grid(20, 12, '#');
  fill(E1, 2, 2, 17, 9, '.'); E1[7][4] = 'g'; fill(E1, 6, 5, 12, 9, 'L'); fill(E1, 6, 7, 12, 7, 'r');
  inRoom('mr_e1', 'Magma Rock - The Tightrope', E1, { x: 2, y: 7 }, (M) => {
    way(M, 1, 7, 1, 1, 'mr_hub', 23, 11, DIR.LEFT, { cond: () => flooded(1) }); for (let x = 6; x <= 12; x++) M.walkable(x, 7);
    M.set(5, 7, 'mr_floor'); M.set(13, 7, 'mr_floor');
    door(M, 18, 7, 'mr_e2', 3, 8, DIR.RIGHT);
    M.sign(3, 3, 'A crack in the floor to hop, and beyond it a rope stretched over a pool of lava. It holds.');
  });
  const E2 = grid(16, 12, '#');
  fill(E2, 2, 2, 13, 9, '.'); fill(E2, 4, 5, 11, 5, 'L'); E2[4][8] = '.';
  inRoom('mr_e2', 'Magma Rock - The Pillar', E2, { x: 3, y: 8 }, (M) => {
    door(M, 1, 8, 'mr_e1', 17, 7, DIR.LEFT);
    M.chest(13, 3, 'Mist Potion', 1);
    M.object('pillar', 8, 8, { id: 'mr_pil_e2' });
    door(M, 8, 1, 'mr_e3', 4, 12, DIR.UP);
    M.sign(3, 3, 'A channel of lava across the room. The pillar on this side is the only thing that will bridge it.');
  });
  const E3 = grid(18, 14, '#');
  fill(E3, 2, 2, 7, 12, '.'); fill(E3, 8, 2, 12, 12, 'L'); fill(E3, 13, 2, 16, 12, '.');
  inRoom('mr_e3', 'Magma Rock - The Ferry', E3, { x: 4, y: 12 }, (M) => {
    door(M, 4, 13, 'mr_e2', 8, 2, DIR.DOWN);
    M.object('updraft', 7, 7, { id: 'mr_ferry_w', to: { x: 13, y: 7 }, onTile: 'mr_raft', tile: 'mr_raft', quiet: true });
    M.object('updraft', 13, 7, { id: 'mr_ferry_e', to: { x: 7, y: 7 }, onTile: 'mr_raft', tile: 'mr_raft', quiet: true });
    // the cracked pillars before the north door: both must go
    M.object('crack', 14, 3, { id: 'mr_crack_a', tile: 'mr_column', reveal: null, onBurst: function* (E) { yield E.say('The cracked pillar bursts to gravel.'); } });
    M.object('crack', 14, 2, { id: 'mr_crack_b', tile: 'mr_column', reveal: null, onBurst: function* (E) { G.set('mr_e_cracks'); yield E.say('And the second. The door behind them is clear: a way back into the great hall.'); } });
    door(M, 14, 1, 'mr_hub', 22, 3, DIR.UP);
    M.sign(3, 3, 'A raft on the lava, tethered on this side. Step on, and it crosses - and it is the only raft.');
  });
  // --- the north way: the blue gem's passage, the second hall, the chains, the pillars, the Golem Core ---
  const N1 = grid(16, 14, '#');
  fill(N1, 8, 12, 8, 12, '.'); fill(N1, 2, 2, 13, 11, '.');
  inRoom('mr_n1', 'Magma Rock - The Gem Passage', N1, { x: 8, y: 12 }, (M) => {
    door(M, 8, 13, 'mr_hub', 4, 2, DIR.DOWN);
    door(M, 8, 1, 'mr_n2', 12, 17, DIR.UP);
    M.sign(3, 3, 'The passage behind the blue gem: a short hall, and another door north. Heat breathes down through it.');
  });
  const N2 = grid(26, 20, '#');
  fill(N2, 2, 2, 23, 17, 'l'); fill(N2, 2, 2, 23, 5, '.'); fill(N2, 10, 14, 23, 17, '.'); fill(N2, 12, 18, 12, 18, '.');
  fill(N2, 2, 6, 3, 17, 'P'); N2[9][2] = '.'; N2[9][3] = '.'; fill(N2, 2, 16, 3, 17, '.'); fill(N2, 6, 6, 6, 13, 'p'); N2[1][20] = 'x';
  inRoom('mr_n2', 'Magma Rock - The Second Hall', N2, { x: 12, y: 18 }, (M) => {
    door(M, 12, 19, 'mr_n1', 8, 2, DIR.DOWN);
    moai(M, 'mr_moai2', 14, 1, 2, 'The second Moai blazes, and this hall too fills with lava to the brim of its upper floor. The rafts along the west wall float up in a line.');
    // the three pillars: pushed into the pit column, they bridge it in either state (the way east to west along the low floor when it is dry)
    for (const [i, y] of [[0, 8], [1, 9], [2, 10]]) M.object('pillar', 8, y, { id: 'mr_npil' + i });
    way(M, 1, 9, 1, 1, 'mr_n4', 14, 6, DIR.LEFT);
    drainButton(M, 'mr_btn2', 2, 17, 2, 'The button sinks, and the gate under the west wall rises: the lava runs away, and the low floor of the hall stands bare.');
    // the chains on the north wall: Whirlwind shakes them down into a climb, to the shelf of the Salamander Tail
    M.object('vines', 20, 1, { id: 'mr_chains', tile: 'mr_chain', reveal: 'mr_chainclimb', onClear: function* (E) { yield E.say('The chains rattle down the wall and hang taut: a way up to the shelf above the hall.'); } });
    M.exit(20, 0, 1, 1, 'mr_n3', 8, 8, DIR.UP); M.walkable(20, 0);
    M.sign(11, 3, () => flooded(2) ? 'The second hall, brimming with lava. Rafts ride along the west wall and across the middle.' : 'The second hall: an upper floor along the north wall, a wide low basin under it with a column of pits down its middle, a Moai in the north wall, chains beside it.');
  }, { level: 2 });
  const N3 = grid(16, 10, '#');
  fill(N3, 2, 2, 13, 7, '.'); N3[8][8] = '.';
  inRoom('mr_n3', 'Magma Rock - The Shelf', N3, { x: 8, y: 8 }, (M) => { M.exit(8, 9, 1, 1, 'mr_n2', 20, 2, DIR.DOWN); M.walkable(8, 9); M.set(8, 9, 'mr_floor'); M.chest(3, 3, 'Salamander Tail', 1); M.sign(12, 3, 'A shelf above the second hall, reached by the chains.'); });
  const N4 = grid(16, 14, '#');
  fill(N4, 2, 2, 13, 11, '.'); N4[6][14] = '.';
  inRoom('mr_n4', 'Magma Rock - The Second Gate', N4, { x: 14, y: 6 }, (M) => {
    way(M, 15, 6, 1, 1, 'mr_n2', 2, 9, DIR.RIGHT);
    for (const x of [3, 4, 5]) M.setObj(x, 1, 'mr_gate');
    M.chest(11, 3, 'Golem Core', 1);
    door(M, 8, 1, 'mr_n5', 4, 12, DIR.UP);
    M.sign(3, 9, 'A second gate of bars, shut, and a door north beside it. The chest here has lain untouched a long time.');
  });
  // --- the ledge of rocks and fireballs, the Magma Ball's chamber, the tablet ---
  const N5 = grid(24, 14, '#');
  fill(N5, 2, 2, 21, 12, '.'); fill(N5, 8, 4, 21, 6, 'L'); fill(N5, 8, 3, 21, 3, '.');
  inRoom('mr_n5', 'Magma Rock - The Burning Ledge', N5, { x: 4, y: 12 }, (M) => {
    door(M, 4, 13, 'mr_n4', 8, 2, DIR.DOWN);
    for (let x = 9; x <= 20; x += 4) M.object('tornado', x, 3, { id: 'mr_fire' + x, tile: 'mr_rock', x0: 8, x1: 21, speed: 12, dx: x % 8 ? 1 : -1, active: true, onHit: function* (E) { Audio.sfx('hit'); yield E.say('A fireball off the lava scorches the party back!'); yield Engine.fadeOut(6); E.warpNow('mr_n5', 5, 8, DIR.UP); yield Engine.fadeIn(6); } });
    door(M, 4, 1, 'mr_ball', 6, 12, DIR.UP);
    M.sign(3, 9, 'A ledge over a lake of lava. Rocks and fireballs burst up out of it and roll along the ledge - and now and then a ball of magma, red and whole. Nothing to be done about it from here.');
  });
  const BA = grid(20, 14, '#');
  fill(BA, 2, 2, 17, 12, '.'); fill(BA, 11, 2, 15, 5, '.');
  inRoom('mr_ball', 'Magma Rock - The Heart', BA, { x: 6, y: 12 }, (M) => {
    door(M, 6, 13, 'mr_n5', 4, 2, DIR.DOWN);
    // the Magma Ball on its red rock, walled off by a wall of flame that only a torch lit beside it will draw off
    if (!G.flag('mr_flame_gone')) { M.object('burnable', 10, 4, { id: 'mr_flamewall', look: 'mr_flame', onBurn: function* (E) { G.set('mr_flame_gone'); Audio.sfx('fire'); yield E.say('The flame wall leaps to the torch\'s fire, and follows it - and the alcove behind it stands open. The Magma Ball!'); } }); M.block(10, 4); }
    M.object('torch', 8, 6, { id: 'mr_torch_l', state: G.flag('mr_torch_l') ? 'lit' : null, onLit: function* (E) { G.set('mr_torch_l'); yield E.say('The left torch takes the flame. The wall of fire beside the alcove leans toward it.'); } });
    if (!G.flag('mr_ball_got')) M.object('catchable', 13, 3, { id: 'mr_magma_ball', look: 'mr_ballrock', item: 'Magma Ball', onTake: function* (E) { G.set('mr_ball_got'); } });
    else M.setObj(13, 3, 'mr_ballrock_empty');
    M.trigger(9, 5, 3, 2, function* (E) { yield E.say('A wall of flame across the alcove\'s mouth, and a red rock behind it with a ball of magma sitting on it like an egg. No water will put that out; fire answers fire, and we have none yet.', 'Kraden'); }, { once: 'mr_ball_seen', cond: () => !G.party.members.some(m => m.hasPsy('Blaze')) });
    // the way on: a slide down into the tablet's chamber - one way, until Blaze lights the torch down there
    M.set(16, 11, 'gr_slide');   // the chute: a one-way drop to the tablet's chamber, until the torch down there turns it into a stair
    if (G.flag('mr_tablet_torch')) { M.set(16, 11, 'mr_floor'); M.setObj(16, 11, 'stairs_down'); M.walkable(16, 11); M.exit(16, 11, 1, 1, 'mr_tablet', 3, 2, DIR.DOWN, { stairs: true }); }
    M.sign(3, 3, 'The heart of the mountain. A torch stands unlit by the alcove of flame; in the corner the floor slopes away down a chute.');
  }, { fall: () => ({ map: 'mr_tablet', x: 4, y: 3 }) });
  const TB = grid(20, 12, '#');
  fill(TB, 2, 2, 17, 9, '.');
  inRoom('mr_tablet', 'Magma Rock - The Tablet', TB, { x: 4, y: 3 }, (M) => {
    M.object('windstone', 12, 4, { id: 'mr_tabletstone', tile: 'mr_tablet' });
    M.trigger(11, 5, 3, 1, T3.magmaBlaze, { once: 'blaze_learned' });
    M.object('torch', 4, 2, { id: 'mr_torch_t', state: G.flag('mr_tablet_torch') ? 'lit' : null, onLit: function* (E) { G.set('mr_tablet_torch'); Engine.doShake(8); yield E.say('The torch flares, and the chute the party slid down grinds itself into a stair. The way back up is open.'); const Mp = G.field.map; Mp.setObj(3, 1, 'stairs_up'); Mp.set(3, 1, 'mr_floor'); Mp.walkable(3, 1); Mp.exits.push({ x: 3, y: 1, w: 1, h: 1, to: 'mr_ball', tx: 16, ty: 10, dir: DIR.UP, stairs: true }); Mp.finalize(); } });
    if (G.flag('mr_tablet_torch')) stairs(M, 3, 1, 'mr_ball', 16, 10, false);
    door(M, 16, 10, 'mr_hub', 22, 3, DIR.DOWN); M.setObj(17, 10, 'mr_gem');
    M.sign(15, 3, 'A tablet of dark stone, a flame carved in it. A torch by the chute, unlit; a door in the corner under a blue gem - the way back to the great hall.');
  });
}
