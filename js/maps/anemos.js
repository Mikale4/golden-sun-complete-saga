// ---------- Anemos Inner Sanctum ----------
// After the rip (map references/golden-sun-the-lost-age-contigo-and-anemos-sanctum-gba-map.webp: the sanctum's
// screens above the town), condensed hard, and the guide's last optional section (lines 10242-10340) with the
// script's [02'50] lines. The sealed door in Contigo hides only a dead end and the Dragon Skin (Reveal); the way
// in is Teleport on the circle in the town's middle. Inside: the hall of the four circles, where every Djinni of
// an element lights its eighteen dots and all seventy-two light the four flames and the door; Charon's tablet on
// the drawing of a skeleton ("attack this slate"); the mimic stone guided onto its button; the seven buttons and
// the one-tile elevator; the cracked tiles lit one by one in one walk; the boulders (Lift) and the columns; a
// second mimic stone; the Orihalcon and the nine cracked tiles with Sand; the six blocks of the bird, Hover from
// it, and Dullahan - "the shadow, the keeper of light" - before Iris.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC = [['Mad Demon'], ['Grave Wight', 'Grave Wight'], ['Sky Dragon'], ['Bombander', 'Bombander']];
  const RETREAT = { map: 'contigo', x: 20, y: 21, dir: DIR.DOWN };
  const LEG = {
    '.': 'marble', ',': 'lh_crack', 'p': 'chasm', 'g': 'pit', 's': 'sandsoft', 'b': 'jl_button', 'c': 'lh_crack', 'e': 'elem_jupiter',
    'D': { ground: 'marble', obj: 'lc_door', walk: true }, 'U': { ground: 'marble', obj: 'stairs_up', walk: true }, 'N': { ground: 'marble', obj: 'stairs_down', walk: true }, 'L': { ground: 'marble', obj: 'ladder', walk: true },
    'V': 'elem_venus', 'M': 'elem_mercury', 'R': 'elem_mars', 'J': 'elem_jupiter'
  };
  const WALL = { cliff: '#', set: 'ankohl', faces: 2 };
  const room = (id, name, rows, entry, build, opts) => defineMap(id, Object.assign({ name: 'Anemos Inner Sanctum' + (name ? ' - ' + name : ''), w: rows[0].length, h: rows.length, base: 'void', music: 'sol', bg: 'dark', indoor: true, entry, enc: ENC, retreat: RETREAT }, opts || {}, { build(M) { M.paint(0, 0, strs(rows), LEG, WALL); build(M); } }));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const stairs = (M, x, y, to, tx, ty, dir) => { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, { stairs: true }); };
  const gate = (M, id, x, y, flag) => M.object('gate', x, y, { id, tile: 'door_stone', openTile: 'door_stone', state: G.flag(flag) ? 'open' : 'shut', script: function* (E) { if (G.flag(flag)) return; yield E.say('A stone door, sealed. The room must be answered first.'); } });
  const openGate = (id, flag) => { G.set(flag); const g = G.field.map.objects.find(o => o.id === id); if (g) g.state = 'open'; G.field.map.finalize(); Engine.doShake(8); Audio.sfx('push'); };
  const mimic = (M, id, x, y, button, flag, gateId) => M.object('mimic', x, y, { id, sx: x, sy: y, mirror: true, button, onButton: function* (E) { if (G.flag(flag)) return; openGate(gateId, flag); yield E.say('The stone settles onto the button, and the door answers.'); } });

  // ====================== the sealed door's dead end: Reveal, and the Dragon Skin ======================
  const GA = grid(14, 12, '#');
  fill(GA, 3, 3, 10, 9, '.'); fill(GA, 6, 9, 7, 10, '.'); fill(GA, 3, 5, 6, 7, 'p'); GA[10][6] = 'D';
  room('anemos_gate', 'The Sealed Gate', GA, { x: 6, y: 9 }, (M) => {
    door(M, 6, 10, 'contigo', 23, 3, DIR.DOWN);
    // the chest stands past a chasm: the floor across it is there, if Reveal is cast
    for (const [x, y] of [[4, 5], [4, 6], [4, 7]]) M.hidden.push({ x, y, tile: 'marble' });
    M.chest(3, 3, 'Dragon Skin', 1);
    M.trigger(5, 7, 4, 2, function* (E) { yield E.say('The sanctum, past the sealed door - and nothing. A chasm, and a chest on the far side of it, and no way over.', 'Sheba'); yield E.say('No way we can see. Reveal.', 'Kraden'); }, { once: 'ang_seen' });
    M.sign(9, 4, 'The gate of the sanctum. What is behind it goes no further; the Anemos left by another way.');
  }, { enc: [] });

  // ====================== the hall of the four circles: every Djinni lights a dot, and all of them the flames ======================
  const HA = grid(24, 22, '#');
  fill(HA, 2, 2, 21, 19, '.'); fill(HA, 10, 19, 13, 20, '.'); HA[1][11] = 'D'; HA[1][12] = 'D';
  for (const [x, y, ch] of [[6, 6, 'V'], [17, 6, 'M'], [6, 14, 'R'], [17, 14, 'J']]) { HA[y][x] = ch; }
  room('anemos', 'The Hall of Circles', HA, { x: 11, y: 19 }, (M) => {
    // the circle the party came in by, at the hall's foot: its twin is Contigo's
    M.object('tpcircle', 11, 18, { id: 'an_circle', tile: 'ml_circle', to: { map: 'contigo', x: 20, y: 21 } });
    const EL = [['venus', 0, 6, 6], ['mercury', 1, 17, 6], ['mars', 2, 6, 14], ['jupiter', 3, 17, 14]];
    const lit = (el) => !!G.flag('an_lit_' + el);
    for (const [el, idx, x, y] of EL) {
      // eighteen dots round each circle: lit when every Djinni of that element stands with the party
      for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; const dx = Math.round(Math.cos(a) * 2.6), dy = Math.round(Math.sin(a) * 2.6); if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2 && !(dx === 0 && dy === 0)) { M.set(x + dx, y + dy, lit(el) ? 'an_dot_lit' : 'an_dot'); } }
      M.trigger(x, y, 1, 1, function* (E) { if (lit(el)) return; const have = G.party.members.reduce((a, m) => a + m.djinn.filter(d => DJINN[d.name] && DJINN[d.name].el === idx).length, 0); if (have < 18) { yield E.say("(The circle glows faintly under the party's feet: " + have + ' of the eighteen ' + el[0].toUpperCase() + el.slice(1) + ' Djinn are with them. It wants them all.)'); return; } G.set('an_lit_' + el); Audio.sfx('summon'); Engine.doFlash(12, '#ffffff'); const Mp = G.field.map; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; const dx = Math.round(Math.cos(a) * 2.6), dy = Math.round(Math.sin(a) * 2.6); if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2 && !(dx === 0 && dy === 0)) Mp.set(x + dx, y + dy, 'an_dot_lit'); } Mp.finalize(); yield E.say('The eighteen dots round the circle light one after another - every ' + el[0].toUpperCase() + el.slice(1) + ' Djinni of Weyard, counted.'); if (EL.every(e => lit(e[0]))) { openGate('an_gate_hall', 'an_hall_open'); openGate('an_gate_hall2', 'an_hall_open'); yield E.say('Four flames go up at the corners of the hall, and the door in the north wall opens. Seventy-two: the Anemos have their number.'); } });
    }
    gate(M, 'an_gate_hall', 11, 2, 'an_hall_open'); gate(M, 'an_gate_hall2', 12, 2, 'an_hall_open');
    door(M, 11, 1, 'anemos_charon', 8, 13, DIR.UP, { cond: () => G.flag('an_hall_open') }); door(M, 12, 1, 'anemos_charon', 8, 13, DIR.UP, { cond: () => G.flag('an_hall_open') });
    M.trigger(10, 17, 4, 1, function* (E) { yield E.say("The inner sanctum of the Anemos. Four circles in the floor, one for each element, and eighteen marks round each of them - seventy-two in all.", 'Kraden'); yield E.say('One for every Djinni there is. Stand on each circle, and let them be counted.', 'Sheba'); }, { once: 'an_hall_seen' });
    M.sign(3, 3, 'The hall of circles. Venus, Mercury, Mars, Jupiter: the Djinn of each are counted on its circle.');
  }, { enc: [] });

  // ====================== Charon's slate, on the drawing of a skeleton ======================
  const CH = grid(16, 16, '#');
  fill(CH, 3, 3, 12, 13, '.'); fill(CH, 7, 13, 9, 14, '.'); CH[14][8] = 'D'; CH[2][12] = 'N';
  room('anemos_charon', 'The Slate', CH, { x: 8, y: 13 }, (M) => {
    door(M, 8, 14, 'anemos', 11, 2, DIR.DOWN);
    M.set(7, 6, 'an_skeleton'); M.set(8, 6, 'an_skeleton'); M.set(7, 7, 'an_skeleton'); M.set(8, 7, 'an_skeleton');
    M.object('statue', 8, 5, { id: 'an_charon', tile: 'ar_tablet', script: function* (E) { if (G.flag('charon_taken')) { yield E.say("The slate of Charon. Its power is already the party's."); return; } yield E.say('We inherited the power of the land to create a great darkness. If you crave this power, attack this slate!', '?????'); const r = yield* E.ask('Attack the slate?', null, ['Yes', 'No']); if (r !== 0) return; Engine.doShake(12); Audio.sfx('hit'); yield E.say('(Felix strikes the slate - and it does not break. A cold comes up out of the drawing under it.)'); G.set('charon_taken'); Engine.doFlash(14, '#a0a0c0'); Audio.sfx('summon'); yield E.summon('Charon'); } });
    stairs(M, 12, 2, 'anemos_mimic1', 3, 14, DIR.UP);
    M.trigger(7, 12, 3, 1, function* (E) { yield E.say('A slate, standing on a drawing in the floor - a skeleton, arms out. Nothing guards it.', 'Jenna'); }, { once: 'an_charon_seen' });
  }, { enc: [] });

  // ====================== the first mimic stone: guided onto its button ======================
  const M1 = grid(20, 18, '#');
  fill(M1, 2, 2, 17, 15, '.'); fill(M1, 2, 12, 2, 15, '#'); M1[14][3] = 'U'; fill(M1, 9, 4, 9, 11, 'p'); M1[8][9] = '.'; M1[2][15] = 'D'; M1[6][15] = 'b';
  room('anemos_mimic1', 'The Mimic Stone', M1, { x: 3, y: 14 }, (M) => {
    stairs(M, 3, 14, 'anemos_charon', 12, 3, DIR.DOWN);
    // the stone on the room's left: it steps when the party steps - up and down with them, across against them - and must come to rest on the button
    mimic(M, 'an_mimic1', 5, 8, { x: 15, y: 6 }, 'an_mimic1_done', 'an_gate_m1');
    gate(M, 'an_gate_m1', 15, 3, 'an_mimic1_done'); door(M, 15, 2, 'anemos_buttons', 3, 12, DIR.UP, { cond: () => G.flag('an_mimic1_done') });
    M.trigger(3, 12, 2, 2, function* (E) { yield E.say('A grey stone stands on the left of the room. Watch it: it steps when we step. Up and down as we do - and across, the other way.', 'Kraden'); yield E.say('The button is in the top right, past the gap in the floor. Walk it there without letting it fall.', 'Piers'); }, { once: 'an_m1_seen' });
    M.sign(4, 3, 'The mimic stone: it goes where you go, but mirrored across. The gap takes it if it steps over the edge.');
  });

  // ====================== the seven buttons and the one-tile elevator ======================
  const BU = grid(20, 16, '#');
  fill(BU, 2, 2, 17, 13, '.'); BU[13][3] = 'D'; for (const [x, y] of [[4, 3], [9, 3], [15, 3], [4, 8], [15, 8], [7, 11], [12, 11]]) BU[y][x] = 'b'; BU[6][9] = 'e';
  room('anemos_buttons', 'The Seven Buttons', BU, { x: 3, y: 12 }, (M) => {
    door(M, 3, 13, 'anemos_mimic1', 15, 3, DIR.DOWN);
    M.object('pillar', 11, 7, { id: 'an_pillar_short', poundable: false });   // the shortcut pillar, pushed right out of the way of the buttons' row
    const BTN = [[4, 3], [9, 3], [15, 3], [4, 8], [15, 8], [7, 11], [12, 11]];
    for (const [x, y] of BTN) M.trigger(x, y, 1, 1, function* (E) { const k = 'an_btn_' + x + '_' + y; if (G.flag(k)) return; G.set(k); Audio.sfx('cursor'); const n = BTN.filter(([bx, by]) => G.flag('an_btn_' + bx + '_' + by)).length; if (n < 7) { yield E.say('(The button sinks. ' + n + ' of seven.)'); return; } G.set('an_buttons_done'); Engine.doShake(8); Audio.sfx('psy'); yield E.say('The seventh button sinks - and the tile in the middle of the room begins to hum, and lift, and settle: an elevator, one tile wide.'); });
    M.trigger(9, 6, 1, 1, function* (E) { yield Engine.fadeOut(20); E.warpNow('anemos_lights', 3, 13, DIR.UP); yield Engine.fadeIn(20); }, { cond: () => G.flag('an_buttons_done') });
    M.trigger(2, 11, 3, 2, function* (E) { yield E.say('Seven buttons in the floor of this room. The single tile in the middle of it is marked like the panels of the lighthouse - and does nothing yet.', 'Sheba'); }, { once: 'an_btn_seen' });
    M.sign(16, 12, 'Seven buttons, one tile. Press them all.');
  });

  // ====================== the cracked tiles: lit one by one, in one walk ======================
  const LI = grid(20, 16, '#');
  fill(LI, 2, 2, 17, 13, '.'); fill(LI, 7, 5, 10, 8, 'c'); LI[2][8] = 'D'; LI[2][9] = 'D';
  room('anemos_lights', 'The Cracked Tiles', LI, { x: 3, y: 13 }, (M) => {
    // the elevator's landing: the tile at the room's foot goes back down
    M.trigger(3, 13, 1, 1, function* (E) { const r = yield* E.ask('Ride the tile back down?', null, ['Yes', 'No']); if (r !== 0) return; yield Engine.fadeOut(20); E.warpNow('anemos_buttons', 9, 7, DIR.DOWN); yield Engine.fadeIn(20); }, { cond: () => G.flag('an_lights_landed') });
    M.trigger(3, 13, 1, 1, function* (E) { G.set('an_lights_landed'); }, { cond: () => !G.flag('an_lights_landed') });
    // the sixteen cracked tiles: each lights under the first step and breaks under a second; all sixteen lit in one walk, the door opens
    const TILES = []; for (let y = 5; y <= 8; y++) for (let x = 7; x <= 10; x++) TILES.push([x, y]);
    const reset = () => { for (const [x, y] of TILES) { G.set('an_tile_' + x + '_' + y, false); const o = G.field.map.objects.find(ob => ob.id === 'an_tile_' + x + '_' + y); if (o) o.trod = false; G.field.map.set(x, y, 'lh_crack'); } G.field.map.finalize(); };
    for (const [x, y] of TILES) M.object('spot', x, y, { id: 'an_tile_' + x + '_' + y, tile: null, crackOnce: true, onStep: function* (E) { if (G.flag('an_lights_done')) return; const o = G.field.map.objects.find(ob => ob.id === 'an_tile_' + x + '_' + y); if (!o.trod) { o.trod = true; G.set('an_tile_' + x + '_' + y); G.field.map.set(x, y, 'an_tile_lit'); G.field.map.finalize(); Audio.sfx('cursor'); if (TILES.every(([tx, ty]) => G.flag('an_tile_' + tx + '_' + ty))) { G.set('an_lights_done'); openGate('an_gate_li', 'an_lights_open'); openGate('an_gate_li2', 'an_lights_open'); yield E.say('The last tile lights, and all sixteen shine together - and the doors at the top of the room open.'); } return; } Audio.sfx('cancel'); yield E.say('The tile breaks under a second step! The party scrambles back to the floor - and the lights go out again.'); reset(); E.warpNow('anemos_lights', 8, 10, DIR.UP); } });
    gate(M, 'an_gate_li', 8, 3, 'an_lights_open'); gate(M, 'an_gate_li2', 9, 3, 'an_lights_open');
    door(M, 8, 2, 'anemos_lift', 10, 14, DIR.UP, { cond: () => G.flag('an_lights_open') }); door(M, 9, 2, 'anemos_lift', 10, 14, DIR.UP, { cond: () => G.flag('an_lights_open') });
    M.trigger(7, 10, 4, 1, function* (E) { yield E.say('Sixteen cracked tiles, four by four. Each lights when it is stepped on - and breaks under a second step. All sixteen, in one walk, and never twice the same one.', 'Kraden'); }, { once: 'an_lights_seen' });
  });

  // ====================== the boulders and the columns: Lift, and the column onto the button ======================
  const LF = grid(22, 18, '#');
  fill(LF, 2, 2, 19, 15, '.'); fill(LF, 9, 13, 11, 16, '.'); fill(LF, 2, 6, 19, 6, '#'); fill(LF, 2, 11, 19, 11, '#'); LF[6][5] = '.'; LF[11][16] = '.'; LF[6][14] = 'p'; LF[6][15] = 'p'; LF[3][18] = 'b'; LF[1][10] = 'D';
  room('anemos_lift', 'The Boulders', LF, { x: 10, y: 14 }, (M) => {
    door(M, 10, 16, 'anemos_lights', 8, 3, DIR.DOWN);
    // the lowest floor: the boulder in the break of the wall (Lift) - the middle floor: the column into the chasm, the boulder in the next break
    M.object('boulder', 16, 11, { id: 'an_boulder1' });
    M.object('pillar', 12, 8, { id: 'an_column1', poundable: false });   // shoved up and along into the chasm at (14..15, 6)
    M.object('boulder', 5, 6, { id: 'an_boulder2' });
    // the top floor: the column onto the button in the corner
    M.object('pillar', 15, 3, { id: 'an_column2', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'an_column2'); if (o && o.x === 18 && o.y === 3 && !G.flag('an_lift_done')) { openGate('an_gate_lf', 'an_lift_done'); yield E.say('The column settles onto the button, and the door in the north wall opens.'); } } });
    gate(M, 'an_gate_lf', 10, 2, 'an_lift_done'); door(M, 10, 1, 'anemos_mimic2', 3, 14, DIR.UP, { cond: () => G.flag('an_lift_done') });
    M.trigger(9, 13, 3, 1, function* (E) { yield E.say('Three floors, one above the next, and a boulder in each wall - Lift, Isaac. The chasm on the middle floor wants a column in it, and the top floor has a button in its corner.', 'Kraden'); }, { once: 'an_lift_seen' });
  });

  // ====================== the second mimic stone ======================
  const M2 = grid(20, 18, '#');
  fill(M2, 2, 2, 17, 15, '.'); M2[14][3] = 'D'; fill(M2, 8, 5, 8, 12, 'p'); M2[9][8] = '.'; M2[3][10] = '#'; M2[2][15] = 'D'; M2[4][15] = 'b';
  room('anemos_mimic2', 'The Second Stone', M2, { x: 3, y: 14 }, (M) => {
    door(M, 3, 14, 'anemos_lift', 10, 2, DIR.DOWN);
    mimic(M, 'an_mimic2', 4, 10, { x: 15, y: 4 }, 'an_mimic2_done', 'an_gate_m2');
    gate(M, 'an_gate_m2', 15, 3, 'an_mimic2_done'); door(M, 15, 2, 'anemos_orihalcon', 3, 14, DIR.UP, { cond: () => G.flag('an_mimic2_done') });
    M.trigger(3, 12, 2, 2, function* (E) { yield E.say('Another stone that steps with us. The gap is longer this time, with one crossing, and a lone block stands near the button: the stone can be caught against it, and walked round.', 'Piers'); }, { once: 'an_m2_seen' });
  });

  // ====================== the Orihalcon, the nine cracked tiles and the sand ======================
  const OR = grid(22, 18, '#');
  fill(OR, 2, 2, 19, 15, '.'); OR[14][3] = 'D'; fill(OR, 9, 8, 11, 10, 'c'); fill(OR, 12, 4, 17, 4, 's'); fill(OR, 5, 2, 8, 5, '#'); fill(OR, 12, 2, 19, 3, '#'); OR[2][18] = 'D'; fill(OR, 18, 2, 18, 3, '.');
  room('anemos_orihalcon', 'The Orihalcon', OR, { x: 3, y: 14 }, (M) => {
    door(M, 3, 14, 'anemos_mimic2', 15, 3, DIR.DOWN);
    M.chest(3, 6, 'Orihalcon', 1); M.chest(17, 13, 'Dark Matter', 1);
    // the nine cracked tiles in the middle: a way across them, and the ones on the right and top left whole for the way back
    for (let y = 8; y <= 10; y++) for (let x = 9; x <= 11; x++) M.object('spot', x, y, { id: 'an_nine_' + x + '_' + y, tile: null, crackOnce: true, onStep: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'an_nine_' + x + '_' + y); if (!o.trod) { o.trod = true; Audio.sfx('cursor'); return; } Audio.sfx('cancel'); yield E.say('The tile gives way! The party drops to the floor below and climbs back up.'); E.warpNow('anemos_orihalcon', 3, 13, DIR.UP); } });
    // the sand along the top right is piled solid: only Sand takes the party through it to the last door
    for (let x = 12; x <= 17; x++) M.object('sandwall', x, 4, { id: 'an_sand_' + x, tile: 'sandwall' });
    door(M, 18, 2, 'anemos_bird', 9, 14, DIR.UP);
    M.trigger(3, 12, 2, 2, function* (E) { yield E.say('The Orihalcon is in the chest on the left. The way on is through the sand piled along the top right - Sand - to the last door.', 'Kraden'); }, { once: 'an_ori_seen' });
  });

  // ====================== the bird of six blocks, and Hover from it ======================
  const BI = grid(20, 18, '#');
  fill(BI, 2, 2, 17, 15, '.'); BI[15][9] = 'D'; for (const [x, y] of [[7, 5], [9, 4], [11, 5], [8, 8], [10, 8], [9, 10]]) BI[y][x] = 'e';
  const padHover = function* (E) { yield Engine.fadeOut(24); E.warpNow('anemos_aerie', 8, 13, DIR.UP); yield Engine.fadeIn(24); };
  room('anemos_bird', 'The Bird', BI, { x: 9, y: 14 }, (M) => {
    door(M, 9, 15, 'anemos_orihalcon', 18, 3, DIR.DOWN);
    // six blocks about the room, and six marked tiles in the shape of a bird: each block onto a tile, and the bird wakes
    const SPOTS = [[7, 5], [9, 4], [11, 5], [8, 8], [10, 8], [9, 10]];
    const check = function* (E) { const blocks = G.field.map.objects.filter(o => /^an_bird_/.test(o.id) && !o.gone); const done = SPOTS.every(([x, y]) => blocks.some(b => b.x === x && b.y === y)); if (!done || G.flag('an_bird_done')) return; G.set('an_bird_done'); Engine.doFlash(16, '#e0e0ff'); Audio.sfx('summon'); const Mp = G.field.map; Mp.objects.push({ kind: 'hoverpad', x: 9, y: 7, id: 'an_bird_pad', key: 'anemos_bird:hoverpad:an_bird_pad', onHover: padHover }); Mp.set(9, 7, 'elem_jupiter'); Mp.finalize(); yield E.say("The six blocks sit in the shape of a bird, and the floor between them glows violet: a panel, at the bird's heart. Hover from it, and the wind will carry the party up."); };
    const starts = [[3, 3], [16, 3], [3, 12], [16, 12], [4, 8], [15, 8]];
    for (const [i, [x, y]] of starts.entries()) M.object('pillar', x, y, { id: 'an_bird_' + i, tile: 'block_grey', poundable: false, onMove: check });
    if (G.flag('an_bird_done')) { M.object('hoverpad', 9, 7, { id: 'an_bird_pad', onHover: padHover }); M.set(9, 7, 'elem_jupiter'); }
    M.trigger(8, 13, 3, 1, function* (E) { yield E.say('Six marked tiles in the middle of the floor, in the shape of a bird; and six grey blocks about the room. One onto each. This is the last of it - whatever waits above waits for us to finish this.', 'Kraden'); }, { once: 'an_bird_seen' });
    M.sign(3, 14, 'The bird. Save here, and Retreat if you would: past the panel is the shadow.');
  }, { enc: [] });

  // ====================== the aerie: Dullahan, and Iris ======================
  const AE = grid(16, 16, '#');
  fill(AE, 3, 2, 12, 12, '.'); fill(AE, 7, 12, 9, 14, '.'); fill(AE, 3, 2, 12, 2, ',');
  room('anemos_aerie', 'The Aerie', AE, { x: 8, y: 13 }, (M) => {
    M.object('hoverpad', 8, 13, { id: 'an_aerie_pad', onHover: function* (E) { yield Engine.fadeOut(24); E.warpNow('anemos_bird', 9, 8, DIR.DOWN); yield Engine.fadeIn(24); } }); M.set(8, 13, 'elem_jupiter');
    if (!G.flag('dullahan_done')) M.boss('Dullahan', 8, 5, { done: 'dullahan_done' });
    M.trigger(6, 8, 5, 1, T3.dullahan, { once: 'dullahan_scene', cond: () => !G.flag('dullahan_done') });
    M.object('statue', 8, 3, { id: 'an_iris', tile: 'ar_tablet', script: function* (E) { if (!G.flag('dullahan_done')) { yield E.say('The knight stands between the party and the tablet.'); return; } if (G.flag('iris_taken')) { yield E.say("The tablet of Iris. Its power is already the party's."); return; } yield E.say('The tablet the shadow kept, cut with a goddess in a bow of colour. The party reads it - and the sun itself seems to answer.'); G.set('iris_taken'); Engine.doFlash(16, '#ffe0a0'); Audio.sfx('summon'); yield E.summon('Iris'); } });
  }, { enc: [] });
  T3.dullahan = function* (E) {
    if (G.flag('dullahan_done')) return;
    yield E.face('player', DIR.UP);
    yield E.say("I am the shadow, the keeper of light. If you want the sun's power, show me your own.", 'Dullahan');
    yield E.say('(A headless suit of armour steps forward, its helm carried in the crook of its arm.)');
    const r = yield* E.battle(['Dullahan'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('dullahan_done'); for (const n of G.field.npcs.slice()) if (/Dullahan/.test(n.id)) G.field.removeNpc(n.id);
    yield E.say('The armour falls to pieces, and the pieces to dust. Behind where it stood, the last tablet.');
  };
}
