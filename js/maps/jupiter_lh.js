// ---------- Jupiter Lighthouse ----------
// After map references/golden-sun-the-lost-age-jupiter-lighthouse-gba-map.webp (533x280 - the main tower, the two
// sub-towers and their outdoor faces) condensed room by room to the guide's chapter 14: the forecourt (Cyclone on the
// bushes for the Mint, the Cyclone teleporter down), the undercroft (Mad Plant, Hover across, the teleporter back up),
// the gatehouse (the pillar onto the button opens the gates), the central hall and its left way (the four fallen
// pillars for the Erinyes Tunic, the doorway out and the Cyclone lift up the face, the west way and its shortcut
// pillar, the hidden floors Reveal shows to the jumping room's stair and to the Psy Crystal, the hops and the slide,
// the three pillars for the Meditation Rod, the grey block outside that the button drops through the floors into the
// hall's north way), the core (the voice, Hover on the raised platform: the lighthouse wakes), the Red Key and the
// block, the east way's Cyclone lift to the Red Door, the windward ledge and its face, the Left Tower (the archer, the
// Mimic's easy chest, the blue log, the cracked floors and the 306 coins, the column into the ravine and the Mist
// Potion, the cracked hall's dark tiles and the button, the archer's block and the left half of the lid; the drop to
// the Blue Key), back through the main tower (the five grey blocks' bridge, the energy block into the hall's gap and
// the hover to the beam, the grey block and the Potion, the Blue Door, the east block that wakes the east ledge's
// panel), the Right Tower (Whorl's hall: the two energy blocks pushed off the ledge, down the slides and into their
// pits, the Djinni's panel, the cone and Pound; the two-block bridge to the Water of Life and the button's shortcut,
// the cracked way and the two faces, the hover hall and Phaeton's Blade, the archer and the right half of the lid),
// and the aerie: Garet and Mia's trap, Isaac and Ivan against Karst and Agatio, Alex's healing, the Mars Star handed
// over, the Jupiter Star thrown, Jenna and Sheba joining the fight by rounds, the Mars Star taken, the elevator down.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const lit = () => !!G.flag('jl_lit');
  const ENC_LOW = [['Devil Scorpion'], ['Ghost Army', 'Ghost Army'], ['Macetail'], ['Foul Mummy']];
  const ENC_HIGH = [['Blue Dragon'], ['Wyvern', 'Wyvern'], ['Ghost Army', 'Ghost Army'], ['Foul Mummy']];
  const OUT = { map: 'world_tla', x: 68, y: 131, dir: DIR.DOWN };
  const FL = 'lh_floor_jupiter';
  const LEG = {
    '.': FL, 'p': 'lh_pit', 'h': 'jl_hole', 'q': 'jl_pit', 'g': 'lh_gap', 's': 'jl_slide', 'c': 'lh_crack', 'b': 'jl_button', 'H': 'block_grey_hover', 'e': 'elem_jupiter',
    'L': { ground: FL, obj: 'ladder', walk: true }, 'G': 'grass', 'T': { ground: 'grass', obj: 'tree' }, 'B': { ground: 'grass', obj: 'bush' }
  };
  const CLIFF = { cliff: '#', set: 'lhjupiter', top: 'lh_walltop_jupiter', face: 'lh_wall_jupiter', mid: 'lh_walltop_jupiter' };   // no autotile set of that name: the plain top/face/mid painting
  const room = (id, name, rows, entry, enc, build, extra) => defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'jupiterlh', bg: 'lighthouse', indoor: true, entry, enc, retreat: OUT, build(M) { M.paint(0, 0, strs(rows), LEG, CLIFF); build(M); } }, extra || {}));
  // a door in a wall cell, a stair, an open way at the edge
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.set(x, y, FL); M.setObj(x, y, 'door_stone'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const stairs = (M, x, y, to, tx, ty, down) => { M.set(x, y, FL); M.setObj(x, y, down ? 'stairs_down' : 'stairs_up'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, down ? DIR.DOWN : DIR.UP, { stairs: true }); };
  const way = (M, x, y, w, h, to, tx, ty, dir, opts) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { M.set(x + i, y + j, FL); M.setObj(x + i, y + j, null); } M.walkable(x, y, w, h); M.exit(x, y, w, h, to, tx, ty, dir, opts); };
  // the Cyclone teleporters: a swirl in the floor that the wind lifts (or drops) the party through
  const teleporter = (M, id, x, y, to, tx, ty, text) => M.object('windstone', x, y, { id, tile: 'jl_tp', onWind: function* (E) { Audio.sfx('wind'); Engine.doShake(6); yield E.say(text || '(The swirl catches the wind and lifts the party away!)'); yield Engine.fadeOut(12); E.warpNow(to, tx, ty, DIR.DOWN); yield Engine.fadeIn(12); } });
  // a violet panel: dead until the lighthouse wakes (unless it is one of the few that never slept, or a flag woke it)
  const pad = (M, id, x, y, cond) => { M.set(x, y, 'elem_jupiter'); const on = cond === true || (cond ? cond() : lit()); if (on) M.object('hoverpad', x, y, { id }); else M.object('spot', x, y, { id: id + '_dead', tile: null, deadPad: true, script: function* (E) { yield E.say('A panel of violet stone in the floor. It is dark, and nothing in it answers to Hover.'); } }); };
  const wakePad = (M, id, x, y) => { M.objects = M.objects.filter(o => o.id !== id + '_dead'); if (!M.objects.some(o => o.id === id)) M.objects.push({ kind: 'hoverpad', x, y, id, key: M.id + ':hoverpad:' + id }); M.set(x, y, 'elem_jupiter'); M.finalize(); };
  // the drops the party hovers over: open floor-holes (the wind failing over one is a fall), walled off on foot
  const gaps = (M, id, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { M.set(x, y, 'jl_hole'); M.object('gap', x, y, { id: id + '_' + x + '_' + y }); } };
  // a cracked tile: one tread, and the second in the same visit gives way to the room the map falls to; a dark tile gives at once
  const fallThrough = function* (E) { const Mp = G.field.map, p = G.field.player; const d = typeof Mp.def.fall === 'function' ? Mp.def.fall(p.tx, p.ty) : Mp.def.fall; if (!d) return; Audio.sfx('jump'); Engine.doShake(6); yield E.say('(The cracked floor gives way under the party!)'); yield Engine.fadeOut(10); E.warpNow(d.map || Mp.id, d.x, d.y, DIR.DOWN); yield Engine.fadeIn(10); };
  const crack = (M, id, x, y) => { M.set(x, y, 'lh_crack'); M.object('spot', x, y, { id, tile: null, crackOnce: true, onStep: function* (E) { const o = G.field.map.objects.find(ob => ob.id === id); if (!o) return; if (!o.trod) { o.trod = true; Audio.sfx('cursor'); return; } yield* fallThrough(E); } }); };
  const dark = (M, id, x, y) => { M.set(x, y, 'lh_crack_big'); M.object('spot', x, y, { id, tile: null, dark: true, onStep: fallThrough }); };
  // a pillar onto a button, and the energy-path blocks (pillars with the block's look) that seat in a pit to close a circuit
  const button = (M, id, x, y, flag, text) => { M.set(x, y, 'jl_button'); return { x, y, flag, text }; };
  const pillarFor = (M, id, x, y, btn) => M.object('pillar', x, y, { id, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === id); if (!o || o.x !== btn.x || o.y !== btn.y || G.flag(btn.flag)) return; G.set(btn.flag); Audio.sfx('push'); Engine.doShake(8); yield E.say(btn.text); if (btn.then) yield* btn.then(E); } });
  const energyBlock = (M, id, x, y, gapX, gapY, onSeat) => { M.set(gapX, gapY, 'jl_pit'); M.object('pillar', x, y, { id, tile: 'block_energy', sinkTile: 'block_energy_set', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === id); if (!o || !o.gone) return; Audio.sfx('psy'); Engine.doFlash(10, '#c0a0ff'); yield* onSeat(E); } }); };
  const archer = (M, x, y, text) => { M.setObj(x, y, 'jl_archer'); M.setObj(x + 1, y, 'jl_archer'); M.sign(x - 1, y, text); };
  const keyDoor = (M, id, x, y, colour, item, flag, to, tx, ty) => {
    M.set(x, y, FL); M.setObj(x, y, null); M.walkable(x, y);
    M.object('gate', x, y, { id, tile: 'door_' + colour, openTile: 'door_stone', state: G.flag(flag) ? 'open' : 'shut', script: function* (E) { if (G.flag(flag)) return; if (!G.inventory.has(item)) { yield E.say('A door painted ' + colour + ', sealed fast. It wants a key of its own colour.'); return; } G.inventory.remove(item, 1); G.set(flag); const g = G.field.map.objects.find(o => o.id === id); if (g) g.state = 'open'; G.field.map.finalize(); Audio.sfx('push'); yield E.say('The ' + item + ' turns, and the ' + colour + ' door swings open.'); } });
    M.exit(x, y, 1, 1, to, tx, ty, DIR.RIGHT, { door: true, cond: () => !!G.flag(flag) });
  };
  const blown = (map, x, y, text) => function* (E) { Audio.sfx('wind'); Engine.doShake(8); yield E.say(text || '(A whirlwind off the face catches the party and flings them back!)'); yield Engine.fadeOut(8); E.warpNow(map, x, y, DIR.RIGHT); yield Engine.fadeIn(8); };

  // ====================== the forecourt ======================
  const F = grid(30, 26, 'G');
  fill(F, 0, 0, 29, 0, 'T'); fill(F, 0, 0, 0, 25, 'T'); fill(F, 29, 0, 29, 25, 'T'); fill(F, 0, 25, 29, 25, 'T');
  fill(F, 9, 2, 20, 9, '#'); F[9][14] = '.'; F[9][15] = '.'; fill(F, 13, 10, 16, 24, '.');   // the tower's front, its gates, and the road up to them
  fill(F, 2, 13, 12, 13, 'T'); fill(F, 2, 16, 12, 16, 'T'); fill(F, 2, 14, 12, 15, '.');   // the dead-end lane west, and the swirl at its end
  for (const [x, y] of [[22, 17], [24, 18], [22, 18], [25, 17]]) F[y][x] = 'B';
  for (const [x, y] of [[4, 4], [25, 5], [3, 20], [26, 22], [6, 9], [23, 8], [21, 12], [7, 19], [24, 13]]) F[y][x] = 'T';
  defineMap('jupiter_lh', {
    name: 'Jupiter Lighthouse', w: 30, h: 26, base: 'grass', music: 'jupiterlh', bg: 'grass', entry: { x: 14, y: 23 }, retreat: OUT,
    build(M) {
      M.paint(0, 0, strs(F), LEG, CLIFF);
      M.walkable(13, 25, 4, 1); M.exit(13, 25, 4, 1, 'world_tla', OUT.x, OUT.y, DIR.DOWN);
      // the gates: shut until the pillar in the gatehouse sits on its button
      if (G.flag('jl_gates_open')) { for (const x of [14, 15]) { M.setObj(x, 9, 'door_stone'); M.walkable(x, 9); M.exit(x, 9, 1, 1, 'jl_central', x, 27, DIR.UP, { door: true }); } }
      else { M.setObj(14, 9, 'gate_stone'); M.setObj(15, 9, 'gate_stone'); }
      M.trigger(13, 10, 4, 1, function* (E) { yield E.say('The gates of the lighthouse: shut, and no lock on them to pick. Something inside holds them.'); yield E.say('The lane to the west ends at a swirl in the ground. The Anemos rode the wind, Sheba - try Cyclone on it.', 'Kraden'); }, { once: 'jl_gates_seen', cond: () => !G.flag('jl_gates_open') });
      teleporter(M, 'jl_tp_down', 3, 14, 'jl_under', 4, 4, '(Cyclone spins the swirl the other way, and the ground opens under the party!)');
      // the bushes at the lower right: Cyclone lifts a Mint out of them
      M.object('leaves', 23, 17, { id: 'jl_bush_mint', onClear: function* (E) { const key = 'jupiter_lh:hidden:23,17'; if (G.flag(key)) return; G.set(key); yield E.give('Mint', 1); } });
      M.sign(12, 23, 'Jupiter Lighthouse. Its beacon has slept since the age of the Anemos.');
      M.trigger(13, 22, 4, 2, T3.jupiterEnter, { once: 'jupiter_entered' });
      M.trigger(13, 11, 4, 2, function* (E) { yield E.say('(The elevator has set the party down at the gates. The beacon burns overhead: three of four.)'); yield E.say('Contigo, then. The others will be waiting - and Garet and Mia need a healer.', 'Felix'); }, { once: 'jl_out_seen', cond: () => G.flag('jupiter_done') });
    }
  });
  // ====================== the undercroft ======================
  const U = grid(30, 14, '#');
  fill(U, 2, 2, 8, 6, '.'); fill(U, 6, 7, 8, 8, '.'); fill(U, 6, 9, 27, 11, '.'); fill(U, 20, 2, 27, 7, '.'); fill(U, 20, 8, 21, 8, '.');
  room('jl_under', 'Jupiter Lighthouse - Undercroft', U, { x: 4, y: 4 }, ENC_LOW, (M) => {
    teleporter(M, 'jl_tp_up', 3, 3, 'jupiter_lh', 4, 14, '(Cyclone spins the swirl, and the party is lifted back up into the daylight.)');
    // the Mad Plant in the corner: Cyclone on the bushes, and it comes out fighting; a Mint in its roots
    M.object('leaves', 26, 10, { id: 'jl_plant4', onClear: function* (E) { if (G.flag('jl_plant4_done')) return; const r = yield* E.ambush(['Mad Plant #4'], { boss: true, canFlee: false }, { at: [[26, 10]], scale: 1.2, say: 'The bushes thrash - a Mad Plant, and a big one!' }); if (r !== 'win') return; G.set('jl_plant4_done'); yield E.give('Mint', 1); } });
    // the right room: the one violet panel that never slept, the drop Hover carries the party over, the swirl beyond
    pad(M, 'jl_pad_u', 21, 4, true); gaps(M, 'jl_ug', 22, 2, 23, 7);
    teleporter(M, 'jl_tp_gh', 26, 3, 'jl_gatehouse', 5, 7, '(The swirl lifts the party up through the stone, into the lighthouse itself.)');
    M.sign(3, 5, 'The undercroft. A violet panel glows at the far end of the right-hand room, and the wind stirs over it.');
    M.trigger(20, 3, 2, 3, function* (E) { yield E.say('A drop, and a panel of violet stone glowing beside it. Hover, Felix - the panel will hold the wind under you as far as the other side.', 'Sheba'); }, { once: 'jl_hover_hint' });
  });
  // ====================== the gatehouse: the pillar and the button ======================
  const GH = grid(12, 10, '#');
  fill(GH, 2, 2, 9, 7, '.');
  room('jl_gatehouse', 'Jupiter Lighthouse - Gatehouse', GH, { x: 5, y: 7 }, ENC_LOW, (M) => {
    const b = button(M, 'jl_btn_gate', 8, 3, 'jl_gates_open', 'The button sinks under the pillar, and somewhere below the great gates grind open!');
    pillarFor(M, 'jl_pil_gate', 5, 4, b);
    door(M, 5, 8, 'jupiter_lh', 14, 10, DIR.DOWN, { cond: () => !!G.flag('jl_gates_open') });
    M.trigger(4, 7, 3, 1, function* (E) { yield E.say('A little room over the gates, and a button in its floor. The pillar will weigh what the party cannot.', 'Piers'); }, { once: 'jl_gh_seen' });
  });
  // ====================== the central hall ======================
  const C = grid(30, 30, '#');
  fill(C, 4, 4, 25, 25, '.'); fill(C, 13, 26, 16, 28, '.'); fill(C, 14, 1, 15, 3, '.'); C[2][14] = 'q'; C[2][15] = 'q';
  fill(C, 8, 8, 21, 21, 'p'); C[14][14] = '.'; fill(C, 15, 14, 21, 14, 'h'); C[14][22] = 'e'; C[14][23] = 'q';
  room('jl_central', 'Jupiter Lighthouse - Central Hall', C, { x: 14, y: 27 }, ENC_LOW, (M) => {
    for (const x of [14, 15]) door(M, x, 29, 'jupiter_lh', x, 10, DIR.DOWN);
    way(M, 3, 14, 1, 2, 'jl_logs', 22, 8, DIR.LEFT); way(M, 26, 14, 1, 2, 'jl_right_low', 2, 8, DIR.RIGHT);
    // the north way: a gap in its floor that only the grey block, dropped through the floors above, fills
    way(M, 14, 1, 1, 1, 'jl_core_stairs', 8, 13, DIR.UP); way(M, 15, 1, 1, 1, 'jl_core', 8, 15, DIR.UP);
    if (G.flag('jl_block_dropped')) { M.set(14, 2, 'block_grey_set'); M.walkable(14, 2); } else { M.set(14, 2, 'jl_pit'); M.set(15, 2, 'jl_pit'); }
    M.trigger(14, 3, 2, 1, function* (E) { yield E.say('The north way, and a gap in its floor two paces across. Nothing to bridge it with - not from here.'); }, { once: 'jl_north_gap', cond: () => !G.flag('jl_block_dropped') });
    // the well of the hall: a beam of light waits dead in its middle; the east ledge's panel and the energy block's gap
    M.object('updraft', 14, 14, { id: 'jl_beam', to: { map: 'jl_central_up', x: 14, y: 12 }, active: () => lit() && !!G.flag('jl_beam_block'), onTile: 'jl_beam', tile: 'jl_beam_off', quiet: true });
    for (let x = 15; x <= 21; x++) M.object('gap', x, 14, { id: 'jl_cg_' + x });
    pad(M, 'jl_pad_c', 22, 14, () => lit() && G.flag('jl_beam_block'));
    energyBlock(M, 'jl_eb_c', 24, 17, 23, 14, function* (E) { G.set('jl_beam_block'); if (lit()) wakePad(G.field.map, 'jl_pad_c', 22, 14); yield E.say('The block seats itself in the gap, and light runs from it along the ledge to the violet panel beside the well. From there Felix can hover out toward the beam.', 'Sheba'); });
    M.sign(12, 24, 'The central hall. A well in its floor, and a beam of pale light waits in the middle of it, dead.');
  });
  // ====================== the left way: the four fallen pillars ======================
  const LG = grid(24, 18, '#');
  fill(LG, 2, 2, 21, 3, '.'); fill(LG, 2, 14, 19, 15, '.'); fill(LG, 2, 2, 3, 15, '.'); fill(LG, 20, 2, 21, 13, '.'); fill(LG, 22, 8, 23, 8, '.'); LG[4][11] = '.';
  room('jl_logs', 'Jupiter Lighthouse - Fallen Pillars', LG, { x: 22, y: 8 }, ENC_LOW, (M) => {
    way(M, 23, 8, 1, 1, 'jl_central', 4, 15, DIR.RIGHT);
    // 1 up, 3 left (the chest), 2 down, 4 right (the door): the pillars roll to the ends of their corridors
    M.object('log', 20, 5, { id: 'jl_log1', len: 2, horiz: true }); M.object('log', 2, 9, { id: 'jl_log2', len: 2, horiz: true });
    M.object('log', 14, 2, { id: 'jl_log3', len: 2, horiz: false }); M.object('log', 8, 14, { id: 'jl_log4', len: 2, horiz: false });
    M.chest(11, 4, 'Erinyes Tunic', 1);
    door(M, 11, 13, 'jl_left_out', 5, 3, DIR.DOWN);
    M.sign(20, 9, 'Four pillars lie fallen across the corridors. Walked into, they roll as far as the way allows.');
  });
  // the doorway down and the Cyclone lift up the tower's face, outside
  const LO = grid(12, 12, 'G');
  fill(LO, 0, 0, 11, 0, 'T'); fill(LO, 0, 0, 0, 11, 'T'); fill(LO, 11, 0, 11, 11, 'T'); fill(LO, 0, 11, 11, 11, 'T'); fill(LO, 1, 1, 10, 2, '#');
  room('jl_left_out', 'Jupiter Lighthouse - West Foot', LO, { x: 5, y: 3 }, ENC_LOW, (M) => {
    door(M, 5, 2, 'jl_logs', 11, 14, DIR.UP); M.set(5, 2, 'grass');
    teleporter(M, 'jl_tp_lo', 8, 8, 'jl_left_up', 4, 12, '(Cyclone lifts the party a level up the tower\'s face.)');
    M.sign(2, 4, 'A strip of turf under the tower\'s west wall. A swirl in the grass, and no other way but back.');
  }, { base: 'grass', bg: 'grass' });
  // the west way a level up: the door out to the west side, and the pillar that opens the passage to the five blocks
  const LU = grid(24, 16, '#');
  fill(LU, 2, 2, 17, 13, '.'); fill(LU, 18, 6, 20, 6, '.'); LU[6][21] = 'q';
  room('jl_left_up', 'Jupiter Lighthouse - West Way', LU, { x: 4, y: 12 }, ENC_LOW, (M) => {
    teleporter(M, 'jl_tp_lu', 3, 12, 'jl_left_out', 8, 9, '(The swirl drops the party back down the tower\'s face.)');
    door(M, 17, 14, 'jl_left_out2', 6, 3, DIR.DOWN);
    M.object('pillar', 18, 6, { id: 'jl_pil_sc1', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_pil_sc1'); if (o && o.gone && !G.flag('jl_sc1')) { G.set('jl_sc1'); yield E.say('The pillar drops into the gap at the passage\'s end and lies flush with the floor: the way east runs straight through now.', 'Jenna'); } } });
    way(M, 22, 6, 1, 1, 'jl_blocks', 2, 6, DIR.RIGHT);
    M.sign(3, 3, 'West way. A door south, and a pillar standing in the narrow passage east.');
  });
  // outside west: the two doors, and the grey block the button drops through the floors
  const LO2 = grid(14, 14, 'G');
  fill(LO2, 0, 0, 13, 0, 'T'); fill(LO2, 0, 0, 0, 13, 'T'); fill(LO2, 13, 0, 13, 13, 'T'); fill(LO2, 0, 13, 13, 13, 'T'); fill(LO2, 1, 1, 12, 2, '#'); fill(LO2, 1, 6, 9, 7, '#');
  room('jl_left_out2', 'Jupiter Lighthouse - West Side', LO2, { x: 6, y: 3 }, ENC_LOW, (M) => {
    door(M, 6, 2, 'jl_left_up', 17, 13, DIR.UP); M.set(6, 2, 'grass');
    door(M, 4, 7, 'jl_reveal', 6, 12, DIR.UP); M.set(4, 7, 'grass'); door(M, 8, 7, 'jl_pillars3', 18, 13, DIR.UP); M.set(8, 7, 'grass');
    M.object('pillar', 4, 10, { id: 'jl_block_sc', tile: 'block_grey', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_block_sc'); if (o && o.x === 5 && o.y === 10) yield E.say('The block sits over a seam in the ground now. And there is a button beside it.'); } });
    M.set(6, 10, 'jl_button');
    M.trigger(6, 10, 1, 1, function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_block_sc'); if (!o || o.gone || o.x !== 5 || o.y !== 10) { yield E.say('(The button sinks and rises again. Nothing lies on the seam beside it to drop.)'); return; } o.gone = true; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: true }); Engine.doShake(14); Audio.sfx('push'); G.set('jl_block_dropped'); yield E.say('The seam opens and the block drops away, floor after floor, and lands with a boom far below - somewhere in the tower\'s north way.'); yield E.say('That gap in the hall\'s north way. It will fill it.', 'Kraden'); }, { cond: () => !G.flag('jl_block_dropped') });
    M.sign(11, 4, 'The tower\'s west side. Two doors in the lower wall, a grey block on the grass, a button beside a seam in the ground.');
  }, { base: 'grass', bg: 'grass' });
  // the hidden floors: Reveal shows the way across the pit to the stair, and across the other to the Psy Crystal
  const RV = grid(20, 14, '#');
  fill(RV, 2, 2, 17, 11, '.'); fill(RV, 5, 12, 7, 12, '.'); fill(RV, 8, 2, 10, 8, 'p'); RV[3][9] = '.'; fill(RV, 14, 2, 17, 5, 'p'); RV[3][17] = '.';
  room('jl_reveal', 'Jupiter Lighthouse - Hidden Floor', RV, { x: 6, y: 12 }, ENC_LOW, (M) => {
    door(M, 6, 13, 'jl_left_out2', 4, 8, DIR.DOWN);
    stairs(M, 9, 3, 'jl_jumps', 4, 12, false);
    if (G.flag('jl_reveal_seen')) for (const y of [4, 5, 6, 7, 8]) { M.set(9, y, FL); M.walkable(9, y); } else for (const y of [4, 5, 6, 7, 8]) M.hidden.push({ x: 9, y, tile: FL });
    M.chest(17, 3, 'Psy Crystal', 1);
    if (G.flag('jl_reveal:chest:17,3')) for (const x of [14, 15, 16]) { M.set(x, 3, FL); M.walkable(x, 3); } else for (const x of [14, 15, 16]) M.hidden.push({ x, y: 3, tile: FL });
    M.sign(3, 3, 'A stair at the back, cut off by a pit; a chest on the right, cut off by another. The floor here is not all it seems.');
  });
  // the jumping room: hop after hop, and the slide down in the middle
  const JP = grid(20, 16, 'p');
  fill(JP, 0, 0, 19, 1, '#'); fill(JP, 0, 14, 19, 15, '#'); fill(JP, 0, 0, 1, 15, '#'); fill(JP, 18, 0, 19, 15, '#');
  fill(JP, 2, 11, 5, 13, '.'); fill(JP, 7, 11, 10, 13, '.'); fill(JP, 12, 11, 14, 13, '.'); fill(JP, 12, 3, 17, 9, '.'); fill(JP, 8, 3, 10, 8, '.');
  JP[12][6] = 'g'; JP[12][11] = 'g'; JP[10][13] = 'g'; JP[6][11] = 'g'; JP[5][9] = 's';
  room('jl_jumps', 'Jupiter Lighthouse - Jumping Room', JP, { x: 4, y: 12 }, ENC_LOW, (M) => {
    G.set('jl_reveal_seen');
    stairs(M, 3, 13, 'jl_reveal', 9, 4, true);
    M.sign(2, 11, 'Gaps in the floor, one after another, and a slide in the middle of the far ledge: a one-way ride down.');
  }, { fall: () => ({ map: 'jl_pillars3', x: 10, y: 3 }) });
  // the three pillars: the upper one left into the pit (the chest), the lower right one aside, the leftmost up (the other way to it)
  const P3 = grid(22, 16, '#');
  fill(P3, 2, 2, 19, 13, '.'); fill(P3, 6, 2, 6, 8, 'q'); fill(P3, 2, 9, 19, 9, 'q'); P3[9][19] = 'L';
  room('jl_pillars3', 'Jupiter Lighthouse - Three Pillars', P3, { x: 10, y: 3 }, ENC_LOW, (M) => {
    M.object('pillar', 8, 4, { id: 'jl_p3a' }); M.object('pillar', 4, 10, { id: 'jl_p3b' }); M.object('pillar', 4, 12, { id: 'jl_p3c' });
    M.chest(3, 3, 'Meditation Rod', 1);
    door(M, 18, 14, 'jl_left_out2', 8, 8, DIR.DOWN);
    stairs(M, 2, 12, 'jl_aerie_stair', 4, 9, false);
    M.sign(12, 3, 'The slide let the party down onto a ledge. A pit cuts it off from the chest on the left, and from the floor below; a ladder at the right end.');
  });
  // the stair to the aerie
  const AS = grid(16, 12, '#');
  fill(AS, 2, 2, 13, 10, '.');
  room('jl_aerie_stair', 'Jupiter Lighthouse - Upper Way', AS, { x: 4, y: 9 }, ENC_HIGH, (M) => {
    stairs(M, 4, 10, 'jl_pillars3', 3, 12, true); door(M, 12, 1, 'jl_aerie', 6, 18, DIR.UP);
    M.sign(3, 3, 'The way up. Only one, and it climbs.');
  });
  // ====================== the aerie ======================
  const AE = grid(26, 20, '#');
  fill(AE, 4, 4, 21, 17, '.'); fill(AE, 5, 18, 7, 18, '.'); fill(AE, 18, 18, 20, 18, '.');
  room('jl_aerie', 'Jupiter Lighthouse - Aerie', AE, { x: 6, y: 18 }, [], (M) => {
    door(M, 6, 19, 'jl_aerie_stair', 12, 2, DIR.DOWN); door(M, 19, 19, 'jl_core_stairs', 8, 2, DIR.DOWN);
    // the beacon's well, and the lid of stone over it: two halves, lifted by the two archers' angels
    const lidL = G.flag('jl_lid_left'), lidR = G.flag('jl_lid_right');
    if (lidL && lidR) M.beacon(12, 9, 'jupiter', !!G.flag('jupiter_lit'));
    else { for (let y = 8; y <= 11; y++) { for (const x of [11, 12]) M.setObj(x, y, lidL ? null : 'jl_lid'); for (const x of [13, 14]) M.setObj(x, y, lidR ? null : 'jl_lid'); } if (lidL || lidR) { M.setObj(12, 9, 'beacon_jupiter_tl'); M.setObj(13, 9, 'beacon_jupiter_tr'); M.setObj(12, 10, 'beacon_jupiter_bl'); M.setObj(13, 10, 'beacon_jupiter_br'); if (!lidL) { M.setObj(12, 9, 'jl_lid'); M.setObj(12, 10, 'jl_lid'); } if (!lidR) { M.setObj(13, 9, 'jl_lid'); M.setObj(13, 10, 'jl_lid'); } } }
    M.trigger(10, 12, 6, 1, function* (E) { yield E.say('The aerie. And the beacon\'s well is shut under a lid of stone - the star cannot be cast into it like this.', 'Kraden'); yield E.say('Then whatever holds this lid down is worked from inside the towers. The other door, and the core first: the lighthouse itself is still asleep.', 'Felix'); }, { once: 'jl_aerie_seen', cond: () => !lit() });
    M.trigger(10, 12, 6, 1, function* (E) { yield E.say('Half the lid is up. The other tower holds the other half.', 'Piers'); }, { once: 'jl_aerie_half', cond: () => lit() && (lidL !== lidR) });
    M.trigger(5, 17, 3, 1, T3.jupiterTrap, { cond: () => G.flag('jl_lid_left') && G.flag('jl_lid_right') && !G.flag('jl_isaac_scene') }); M.trigger(18, 17, 3, 1, T3.jupiterTrap, { cond: () => G.flag('jl_lid_left') && G.flag('jl_lid_right') && !G.flag('jl_isaac_scene') });
    M.trigger(9, 13, 8, 1, T3.jupiterAerie, { cond: () => lit() && G.flag('jl_lid_left') && G.flag('jl_lid_right') && G.flag('jl_isaac_scene') && !G.flag('jupiter_lit') });
  });
  // the stair hall behind the aerie's other door: the slide down into the core
  const CS = grid(20, 16, '#');
  fill(CS, 2, 2, 17, 13, '.'); CS[7][8] = 's'; fill(CS, 8, 14, 9, 14, '.');
  room('jl_core_stairs', 'Jupiter Lighthouse - Core Stair', CS, { x: 8, y: 13 }, ENC_HIGH, (M) => {
    door(M, 8, 1, 'jl_aerie', 19, 18, DIR.UP); way(M, 8, 15, 2, 1, 'jl_central', 14, 3, DIR.DOWN);
    M.sign(3, 3, 'A stair hall. A slide in its floor drops into the core of the lighthouse.');
  }, { fall: () => ({ map: 'jl_core', x: 10, y: 8 }) });
  const CO = grid(20, 18, '#');
  fill(CO, 2, 2, 17, 15, '.'); fill(CO, 7, 2, 12, 5, 'p'); fill(CO, 8, 2, 11, 4, '.'); CO[5][9] = 'L'; fill(CO, 8, 16, 9, 16, '.');
  room('jl_core', 'Jupiter Lighthouse - Core', CO, { x: 10, y: 8 }, ENC_HIGH, (M) => {
    M.trigger(7, 6, 6, 2, function* (E) { yield E.say('(A voice, from everywhere and nowhere, like wind in a shell:)'); yield E.say('SHOW THE POWER OF THE ANEMOS, AND THE LIGHT SHALL WAKE.'); yield E.say('The power of the Anemos... Jupiter Psynergy. Up there, on the raised platform - Hover, Felix!', 'Sheba'); }, { once: 'jl_voice' });
    M.set(9, 3, 'elem_jupiter'); M.object('hoverpad', 9, 3, { id: 'jl_pad_core', onHover: T3.jupiterWake });
    way(M, 1, 8, 1, 2, 'jl_redkey', 20, 8, DIR.LEFT); way(M, 8, 17, 2, 1, 'jl_central', 15, 3, DIR.DOWN);
    M.sign(3, 3, 'The core of the lighthouse. A raised platform above the floor, a ladder up to it, and a violet panel in its middle.');
  });
  T3.jupiterWake = function* (E) { if (lit()) return; G.set('jl_lit'); Audio.sfx('beacon'); Engine.doFlash(30, '#c0a0ff'); Engine.doShake(20); yield E.say('The platform blazes violet under Felix, and the light runs out from it along every seam of the tower - up the walls, into the floors, through the halls! Every panel in the lighthouse wakes!'); yield E.say('The lighthouse is alive. Now the violet panels will carry us wherever they lie.', 'Kraden'); for (const o of G.field.map.objects.slice()) if (o.deadPad) wakePad(G.field.map, o.id.replace(/_dead$/, ''), o.x, o.y); };
  // the Red Key past the core: Hover from the panel to the ledge; the block into the pit, the hop, the stair down
  const RK = grid(22, 14, '#');
  fill(RK, 2, 2, 19, 11, '.'); fill(RK, 13, 2, 14, 11, 'h'); fill(RK, 8, 2, 8, 11, 'q'); fill(RK, 7, 2, 7, 11, 'h'); fill(RK, 20, 8, 21, 9, '.');
  room('jl_redkey', 'Jupiter Lighthouse - Red Key', RK, { x: 20, y: 8 }, ENC_HIGH, (M) => {
    way(M, 21, 8, 1, 2, 'jl_core', 2, 8, DIR.RIGHT);
    pad(M, 'jl_pad_rk', 16, 6); for (let y = 2; y <= 11; y++) { M.object('gap', 13, y, { id: 'jl_rkg_13_' + y }); M.object('gap', 14, y, { id: 'jl_rkg_14_' + y }); M.object('gap', 7, y, { id: 'jl_rkg_7_' + y }); }
    M.chest(10, 4, 'Red Key', 1);
    M.object('pillar', 10, 6, { id: 'jl_block_rk', tile: 'block_grey', sinkTile: 'block_grey_set' });
    stairs(M, 3, 3, 'jl_central', 5, 5, true);
    M.sign(18, 3, 'A violet panel, and beyond the drop a ledge with a chest on it - a red glint in it. Another drop cuts the ledge off on its far side.');
  });
  // the east way from the hall: the swirl up to the Red Door, the pillar for the shortcut east, the door outside
  const RL = grid(24, 14, '#');
  fill(RL, 2, 2, 17, 11, '.'); fill(RL, 18, 6, 20, 6, '.'); RL[6][21] = 'q';
  room('jl_right_low', 'Jupiter Lighthouse - East Way', RL, { x: 2, y: 8 }, ENC_LOW, (M) => {
    way(M, 1, 8, 1, 2, 'jl_central', 25, 14, DIR.LEFT);
    teleporter(M, 'jl_tp_rl', 16, 3, 'jl_reddoor', 4, 10, '(The swirl lifts the party a floor.)');
    M.object('pillar', 18, 6, { id: 'jl_pil_sc2', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_pil_sc2'); if (o && o.gone && !G.flag('jl_sc2')) { G.set('jl_sc2'); yield E.say('Another pillar into its gap: from here the room of the five blocks is a short walk, and the west way beyond it.', 'Piers'); } } });
    way(M, 22, 6, 1, 1, 'jl_blocks', 21, 6, DIR.RIGHT);
    door(M, 15, 12, 'jl_east_out', 6, 3, DIR.DOWN);
    M.sign(3, 3, 'East way. A swirl on the floor in the far corner, a pillar in the narrow passage east, and a door south to the open air.');
  });
  // the five grey blocks: four hang over the pit in a line, the fifth is pushed down into its place, and the line is a bridge
  const BK = grid(24, 12, '#');
  fill(BK, 2, 2, 21, 9, '.'); fill(BK, 8, 2, 15, 9, 'p'); for (const x of [8, 10, 12, 14]) BK[6][x] = 'H'; for (const x of [9, 11, 13, 15]) BK[6][x] = 'g'; fill(BK, 16, 7, 16, 9, 'p'); BK[6][16] = 'q';
  room('jl_blocks', 'Jupiter Lighthouse - Five Blocks', BK, { x: 2, y: 6 }, ENC_HIGH, (M) => {
    way(M, 1, 6, 1, 1, 'jl_left_up', 21, 6, DIR.LEFT); way(M, 22, 6, 1, 1, 'jl_right_low', 21, 6, DIR.RIGHT);
    M.object('pillar', 16, 3, { id: 'jl_block5', tile: 'block_grey', sinkTile: 'block_grey_set', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_block5'); if (o && o.gone && !G.flag('jl_blocks_bridge')) { G.set('jl_blocks_bridge'); yield E.say('The fifth block settles into line with the four that hang over the pit: a bridge, hop by hop, across the room.', 'Jenna'); } } });
    M.sign(3, 3, 'Five grey blocks. Four hang in the air over the pit in a line; the fifth waits at the top of the lane on the far side for its place.');
  });
  // ====================== outside east: the Red Door and the face ======================
  const RD = grid(20, 14, '#');
  fill(RD, 2, 2, 17, 11, '.');
  room('jl_reddoor', 'Jupiter Lighthouse - Red Door', RD, { x: 4, y: 10 }, ENC_HIGH, (M) => {
    teleporter(M, 'jl_tp_rd', 3, 10, 'jl_right_low', 16, 4, '(The swirl drops the party a floor.)');
    keyDoor(M, 'jl_red_door', 18, 6, 'red', 'Red Key', 'jl_red_open', 'jl_faces', 2, 7);
    M.sign(3, 3, 'A door painted red at the end of the hall, and no handle on it.');
  });
  const FA = grid(30, 12, '#');
  fill(FA, 2, 7, 27, 7, '.'); for (const x of [8, 13, 18, 23]) FA[6][x] = '.';
  room('jl_faces', 'Jupiter Lighthouse - Windward Ledge', FA, { x: 2, y: 7 }, ENC_HIGH, (M) => {
    way(M, 1, 7, 1, 1, 'jl_reddoor', 17, 6, DIR.LEFT); way(M, 28, 7, 1, 1, 'jl_lt1', 2, 8, DIR.RIGHT);
    M.setObj(4, 6, 'jl_face');
    M.object('tornado', 6, 7, { id: 'jl_tw1', x0: 6, x1: 23, speed: 9, onHit: blown('jl_faces', 3, 7, 'A whirlwind off the face catches the party and flings them back along the ledge!') });
    M.sign(2, 6, 'The ledge to the west tower, a single pace wide. A face in the wall breathes whirlwinds along it; notches in the rock above are shelter.');
  });
  // ====================== the Left Tower ======================
  const T1 = grid(22, 16, '#');
  fill(T1, 2, 2, 19, 13, '.'); fill(T1, 15, 2, 15, 6, '#'); fill(T1, 18, 6, 19, 6, '#');
  room('jl_lt1', 'Jupiter Lighthouse - Left Tower', T1, { x: 2, y: 8 }, ENC_HIGH, (M) => {
    way(M, 1, 8, 1, 1, 'jl_faces', 27, 7, DIR.LEFT);
    archer(M, 9, 3, 'An archer of stone, bow drawn, aimed east across the tower.');
    M.chest(3, 3, 'Psy Crystal', 1, { mimic: 'Mimic #6' });   // the easy chest on the left, and what is in it
    M.object('log', 16, 5, { id: 'jl_blog', len: 2, horiz: true });   // the blue pillar across the alcove: rolled up, the stair is free
    stairs(M, 17, 3, 'jl_lt2', 4, 12, false);
    M.sign(18, 12, 'A fallen pillar of blue stone lies across the alcove with the stair. Somewhere above lies a blue key - and no way up to it, only down.');
  });
  const T2 = grid(22, 16, '#');
  fill(T2, 2, 2, 19, 13, '.'); fill(T2, 2, 8, 19, 8, 'p'); T2[8][5] = 'c';
  room('jl_lt2', 'Jupiter Lighthouse - Cracked Floor', T2, { x: 4, y: 12 }, ENC_HIGH, (M) => {
    stairs(M, 4, 13, 'jl_lt1', 17, 4, true);
    crack(M, 'jl_c2', 5, 8);
    M.set(10, 5, 'lh_crack_big'); M.object('spot', 10, 5, { id: 'jl_bigcrack', tile: null, script: function* (E) { yield E.say('A great dark crack in the floor. It would take more than a step to open it - a fall from higher up, perhaps.'); } });
    M.chest(18, 3, 'Coins', 306, { coins: 306 });
    stairs(M, 18, 12, 'jl_lt3', 4, 12, false);
    M.sign(3, 12, 'A pit across the room, and one cracked tile bridging it. Such a tile bears one tread; the second time, it gives.');
  }, { fall: () => ({ map: 'jl_lt1', x: 10, y: 10 }) });
  const T3r = grid(22, 16, '#');
  fill(T3r, 2, 2, 19, 13, '.'); fill(T3r, 2, 7, 19, 7, 'q');
  room('jl_lt3', 'Jupiter Lighthouse - Column Room', T3r, { x: 4, y: 12 }, ENC_HIGH, (M) => {
    stairs(M, 4, 13, 'jl_lt2', 18, 11, true);
    M.object('pillar', 4, 9, { id: 'jl_col3', tile: 'lh_column', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'jl_col3'); if (o && o.gone) yield E.say('The column drops into the ravine and lies across it: a bridge to the far side of the room.'); } });
    M.chest(18, 3, 'Mist Potion', 1);
    M.set(10, 4, 'lh_crack_big'); M.object('spot', 10, 4, { id: 'jl_drop3', tile: null, dark: true, onStep: function* (E) { Audio.sfx('jump'); Engine.doShake(8); yield E.say('(The dark floor gives way - and the floor below it too! The party falls through two storeys.)'); yield Engine.fadeOut(12); E.warpNow('jl_bluekey', 6, 4, DIR.DOWN); yield Engine.fadeIn(12); } });
    stairs(M, 18, 5, 'jl_lt4', 4, 12, false);
    M.sign(3, 3, 'A ravine cuts the room in two. The column by the near wall is the only thing long enough to span it.');
  });
  const T4 = grid(24, 16, '#');
  fill(T4, 2, 10, 21, 13, '.'); fill(T4, 2, 5, 21, 9, 'h'); fill(T4, 2, 2, 5, 4, '.'); fill(T4, 10, 2, 12, 4, '.'); fill(T4, 10, 5, 12, 9, 'p');
  room('jl_lt4', 'Jupiter Lighthouse - Cracked Hall', T4, { x: 4, y: 12 }, ENC_HIGH, (M) => {
    stairs(M, 4, 13, 'jl_lt3', 18, 6, true);
    for (let y = 5; y <= 9; y++) for (let x = 2; x <= 21; x++) if (x < 10 || x > 12) M.object('gap', x, y, { id: 'jl_4g_' + x + '_' + y });
    // the dark tiles: hovering cannot cross them until the pillar in the left pocket sits on the button
    if (G.flag('jl_lt4_button')) for (let y = 5; y <= 9; y++) for (let x = 10; x <= 12; x++) { M.set(x, y, 'jl_hole'); M.object('gap', x, y, { id: 'jl_4d_' + x + '_' + y }); }
    pad(M, 'jl_pad_4l', 3, 10); pad(M, 'jl_pad_4r', 11, 10); pad(M, 'jl_pad_4p', 3, 4); pad(M, 'jl_pad_4t', 11, 4);
    const b = button(M, 'jl_btn_4', 5, 3, 'jl_lt4_button', 'The pillar settles on the button, and the dark tiles over the pit light one after another, violet, in a column up the middle of the hall.');
    b.then = function* () { const Mp = G.field.map; for (let y = 5; y <= 9; y++) for (let x = 10; x <= 12; x++) { Mp.set(x, y, 'jl_hole'); Mp.objects.push({ kind: 'gap', x, y, id: 'jl_4d_' + x + '_' + y, key: Mp.id + ':gap:jl_4d_' + x + '_' + y }); } Mp.finalize(); };
    pillarFor(M, 'jl_pil_4', 3, 3, b);
    for (const [x, y] of [[7, 11], [9, 12], [14, 11], [17, 12], [19, 11]]) crack(M, 'jl_c4_' + x + '_' + y, x, y);
    stairs(M, 11, 2, 'jl_lt_top', 5, 10, false);
    M.sign(2, 11, 'The whole middle of the hall is a pit, and a column of dark tiles crosses it to a stair. Violet panels on the near side; a pocket with a pillar above the left one.');
  }, { fall: () => ({ map: 'jl_lt3', x: 10, y: 12 }) });
  const TT = grid(20, 12, '#');
  fill(TT, 2, 2, 17, 9, '.'); fill(TT, 4, 10, 6, 10, '.');
  room('jl_lt_top', 'Jupiter Lighthouse - Left Tower Top', TT, { x: 5, y: 10 }, ENC_HIGH, (M) => {
    stairs(M, 5, 11, 'jl_lt4', 11, 3, true);
    archer(M, 9, 2, 'The great archer of the left tower, aimed at the angel over the aerie.');
    energyBlock(M, 'jl_eb_l', 6, 6, 12, 6, function* (E) { G.set('jl_lid_left'); yield E.say('The archer\'s bow hums, and an arrow of light flies to the left angel above the aerie! The angel lifts, and the left half of the lid rises with it!'); yield E.say('One half. The right tower has the other.', 'Kraden'); });
    M.sign(3, 3, 'The top of the left tower, open to the sky. A block with a channel of light in it, and a gap in the floor before the archer.');
  });
  const BKR = grid(14, 10, '#');
  fill(BKR, 2, 2, 11, 7, '.');
  room('jl_bluekey', 'Jupiter Lighthouse - Blue Key', BKR, { x: 6, y: 4 }, ENC_HIGH, (M) => {
    M.chest(10, 3, 'Blue Key', 1);
    door(M, 6, 8, 'jl_lt1', 10, 12, DIR.DOWN);
    M.sign(3, 3, 'A little room under the cracked floors. A blue glint in the chest, and a door back to the tower\'s foot.');
  });
  // ====================== the beam's landing, the Potion and the Blue Door ======================
  const CU = grid(24, 14, '#');
  fill(CU, 2, 2, 21, 11, '.'); CU[12][14] = '.'; CU[3][16] = '#'; CU[4][16] = '#'; CU[3][18] = '#'; CU[4][18] = '#'; CU[2][17] = '#';
  room('jl_central_up', 'Jupiter Lighthouse - Upper Gallery', CU, { x: 14, y: 12 }, ENC_HIGH, (M) => {
    M.object('pillar', 17, 5, { id: 'jl_block_pot', tile: 'block_grey' }); M.chest(17, 3, 'Potion', 1);
    stairs(M, 3, 3, 'jl_central', 5, 5, true);
    teleporter(M, 'jl_tp_cu', 20, 10, 'jl_central', 14, 24, '(Cyclone... and the swirl drops the party all the way down to the hall floor. The long way round again.)');
    keyDoor(M, 'jl_blue_door', 22, 6, 'blue', 'Blue Key', 'jl_blue_open', 'jl_east_face', 2, 6);
    M.sign(3, 10, 'The upper gallery. A grey block in the mouth of a nook with a chest, a swirl in the corner (leave it be), and a blue door east.');
  });
  const EF = grid(20, 10, '#');
  fill(EF, 2, 5, 17, 7, '.'); fill(EF, 6, 5, 9, 7, 'h');
  room('jl_east_face', 'Jupiter Lighthouse - East Ledge', EF, { x: 2, y: 6 }, ENC_HIGH, (M) => {
    way(M, 1, 6, 1, 1, 'jl_central_up', 21, 6, DIR.LEFT);
    pad(M, 'jl_pad_ef', 4, 6, () => lit() && G.flag('jl_east_pad')); pad(M, 'jl_pad_ef2', 11, 6, () => lit() && G.flag('jl_east_pad')); for (let y = 5; y <= 7; y++) for (let x = 6; x <= 9; x++) M.object('gap', x, y, { id: 'jl_efg_' + x + '_' + y });
    way(M, 18, 6, 1, 1, 'jl_rt1', 2, 8, DIR.RIGHT);
    M.sign(3, 4, 'The ledge to the east tower breaks off over nothing. A violet panel at its edge.');
  });
  const EO = grid(14, 12, 'G');
  fill(EO, 0, 0, 13, 0, 'T'); fill(EO, 0, 0, 0, 11, 'T'); fill(EO, 13, 0, 13, 11, 'T'); fill(EO, 0, 11, 13, 11, 'T'); fill(EO, 1, 1, 12, 2, '#');
  room('jl_east_out', 'Jupiter Lighthouse - East Side', EO, { x: 6, y: 3 }, ENC_LOW, (M) => {
    door(M, 6, 2, 'jl_right_low', 15, 11, DIR.UP); M.set(6, 2, 'grass');
    energyBlock(M, 'jl_eb_e', 4, 7, 9, 7, function* (E) { G.set('jl_east_pad'); yield E.say('The block seats in the gap, and light runs up the tower\'s face from it. Somewhere high on the east side, a panel wakes.', 'Felix'); });
    M.sign(2, 4, 'The tower\'s east side. A block with a channel of light in it, and a gap in the turf.');
  }, { base: 'grass', bg: 'grass' });
  // ====================== the Right Tower ======================
  const R1 = grid(22, 16, '#');
  fill(R1, 2, 2, 19, 13, '.'); fill(R1, 10, 1, 11, 1, '.');
  room('jl_rt1', 'Jupiter Lighthouse - Right Tower', R1, { x: 2, y: 8 }, ENC_HIGH, (M) => {
    way(M, 1, 8, 1, 1, 'jl_east_face', 17, 6, DIR.LEFT);
    archer(M, 9, 3, 'An archer of stone, bow drawn, aimed west across the tower.');
    way(M, 10, 1, 2, 1, 'jl_rt2', 10, 18, DIR.UP);
    M.trigger(17, 12, 2, 2, function* (E) { yield E.say('A stair opens in the corner: the short cut down from the block room above.'); }, { once: 'jl_rt_sc_seen', cond: () => !!G.flag('jl_rt3_shortcut') });
  });
  // Whorl's hall: the two ledges, the blocks pushed off them to the floor, the slides after them, the pits, the Djinni's panel, the cone
  const R2 = grid(24, 20, '#');
  fill(R2, 2, 2, 21, 5, '.'); fill(R2, 13, 2, 13, 5, 'q'); fill(R2, 2, 6, 21, 7, 'h'); R2[6][6] = 's'; R2[6][16] = 's';
  fill(R2, 2, 8, 21, 17, '.'); fill(R2, 2, 9, 3, 10, 'p'); fill(R2, 2, 14, 3, 15, 'p'); fill(R2, 4, 9, 5, 15, 'h'); R2[8][10] = 'q'; R2[8][12] = 'q'; fill(R2, 10, 18, 11, 18, '.');
  room('jl_rt2', 'Jupiter Lighthouse - Whorl\'s Hall', R2, { x: 10, y: 18 }, ENC_HIGH, (M) => {
    way(M, 10, 19, 2, 1, 'jl_rt1', 10, 2, DIR.DOWN);
    for (let x = 2; x <= 21; x++) for (const y of [6, 7]) if (!(y === 6 && (x === 6 || x === 7 || x === 15 || x === 16))) M.object('gap', x, y, { id: 'jl_r2g_' + x + '_' + y });
    for (let y = 9; y <= 15; y++) for (const x of [4, 5]) M.object('gap', x, y, { id: 'jl_r2d_' + x + '_' + y });
    pad(M, 'jl_pad_r2a', 3, 8); pad(M, 'jl_pad_r2b', 6, 12, () => lit() && G.flag('jl_r2_a')); pad(M, 'jl_pad_r2w', 3, 11, () => lit() && G.flag('jl_r2_a')); pad(M, 'jl_pad_r2c', 17, 8, () => lit() && G.flag('jl_r2_a'));
    energyBlock(M, 'jl_eb_r2a', 7, 3, 10, 8, function* (E) { G.set('jl_r2_a'); wakePad(G.field.map, 'jl_pad_r2b', 6, 12); wakePad(G.field.map, 'jl_pad_r2w', 3, 11); wakePad(G.field.map, 'jl_pad_r2c', 17, 8); yield E.say('The block seats in its pit and two panels light: one by the Djinni\'s ledge on the left, one under the right-hand ledge.', 'Sheba'); });
    energyBlock(M, 'jl_eb_r2b', 15, 3, 12, 8, function* (E) { G.set('jl_r2_b'); const Mp = G.field.map; Mp.objects.push({ kind: 'pillar', x: 11, y: 14, id: 'jl_cone_r2', key: Mp.id + ':pillar:jl_cone_r2', fixed: true, onPound: T3.whorlCone }); Engine.doShake(10); yield E.say('The second block seats, and a cone-shaped pillar rises out of the floor in the middle of the hall!'); });
    if (G.flag('jl_r2_b')) M.object('pillar', 11, 14, { id: 'jl_cone_r2', fixed: true, onPound: T3.whorlCone });
    M.object('gate', 20, 1, { id: 'jl_r2_gate', tile: 'gate_stone', openTile: null, state: G.flag('jl_r2_pound') ? 'open' : 'shut' }); M.set(20, 1, FL); M.setObj(20, 1, null); M.walkable(20, 1); M.exit(20, 1, 1, 1, 'jl_rt3', 4, 13, DIR.UP, { cond: () => !!G.flag('jl_r2_pound') });
    M.djinni('Whorl', 2, 12, { fight: true });
    M.sign(12, 16, 'A hall of drops and slides. A Jupiter Djinni sits on a ledge at the left, out of reach; two blocks wait on the upper ledges, and a gate in the north wall is shut.');
  }, { fall: (x, y) => ({ map: 'jl_rt2', x, y: 8 }) });
  T3.whorlCone = function* (E) { if (G.flag('jl_r2_pound')) return; G.set('jl_r2_pound'); const g = G.field.map.objects.find(o => o.id === 'jl_r2_gate'); if (g) g.state = 'open'; G.field.map.finalize(); Engine.doShake(10); yield E.say('The cone sinks into the floor, and the gate in the north wall grinds open.'); };
  // the block puzzle: the cone raises two blocks; one into each ravine, the second pushed over the first's back
  const R3 = grid(22, 16, '#');
  fill(R3, 2, 2, 19, 13, '.'); fill(R3, 8, 2, 8, 13, 'q'); fill(R3, 13, 2, 13, 13, 'q'); R3[14][4] = '.';
  room('jl_rt3', 'Jupiter Lighthouse - Block Puzzle', R3, { x: 4, y: 13 }, ENC_HIGH, (M) => {
    way(M, 4, 14, 1, 1, 'jl_rt2', 20, 2, DIR.DOWN);
    M.object('pillar', 5, 4, { id: 'jl_cone_r3', fixed: true, onPound: function* (E) { if (G.flag('jl_r3_pound')) return; G.set('jl_r3_pound'); const Mp = G.field.map; Mp.objects.push({ kind: 'pillar', x: 6, y: 7, id: 'jl_r3_b1', key: Mp.id + ':pillar:jl_r3_b1', tile: 'block_grey', sinkTile: 'block_grey_set' }, { kind: 'pillar', x: 6, y: 10, id: 'jl_r3_b2', key: Mp.id + ':pillar:jl_r3_b2', tile: 'block_grey', sinkTile: 'block_grey_set' }); Engine.doShake(10); yield E.say('The cone sinks, and two grey blocks rise out of the floor beside the first ravine.'); } });
    if (G.flag('jl_r3_pound')) { M.object('pillar', 6, 7, { id: 'jl_r3_b1', tile: 'block_grey', sinkTile: 'block_grey_set' }); M.object('pillar', 6, 10, { id: 'jl_r3_b2', tile: 'block_grey', sinkTile: 'block_grey_set' }); }
    M.chest(18, 12, 'Water of Life', 1);
    const b = button(M, 'jl_btn_r3', 18, 3, 'jl_rt3_shortcut', 'The pillar settles on the button, and a stair opens in the corner below: a short cut down to the tower\'s foot.');
    pillarFor(M, 'jl_pil_r3', 15, 3, b);
    if (G.flag('jl_rt3_shortcut')) stairs(M, 19, 13, 'jl_rt1', 18, 12, true);
    stairs(M, 16, 8, 'jl_rt4', 4, 3, false);
    M.sign(3, 3, 'Two ravines cross the room. Pound the cone and the blocks come up; a block into each ravine, and the second goes over the back of the first.');
  });
  const R4 = grid(24, 16, '#');
  fill(R4, 2, 2, 21, 13, '.');
  room('jl_rt4', 'Jupiter Lighthouse - Cracked Way', R4, { x: 4, y: 3 }, ENC_HIGH, (M) => {
    stairs(M, 3, 2, 'jl_rt3', 16, 9, true);
    for (const [x, y] of [[7, 7], [12, 4], [15, 11], [9, 12], [18, 8], [6, 10]]) dark(M, 'jl_d4_' + x + '_' + y, x, y);
    for (const [x, y] of [[10, 7], [13, 7], [8, 9], [16, 6], [11, 11]]) crack(M, 'jl_c4r_' + x + '_' + y, x, y);
    M.setObj(1, 5, 'jl_face'); M.setObj(22, 10, 'jl_face');
    M.object('tornado', 5, 5, { id: 'jl_tw4a', x0: 2, x1: 21, speed: 9, onHit: blown('jl_rt4', 4, 3, 'A whirlwind from the face in the wall throws the party back to the stair!') });
    M.object('tornado', 18, 10, { id: 'jl_tw4b', x0: 2, x1: 21, speed: 10, dx: -1, onHit: blown('jl_rt4', 4, 3, 'A whirlwind from the face in the wall throws the party back to the stair!') });
    way(M, 20, 14, 1, 1, 'jl_rt5', 11, 13, DIR.DOWN);
    M.sign(3, 4, 'Cracked tiles all over the floor, and two faces in the walls breathing wind across it. Keep off the dark ones.');
  }, { fall: () => ({ map: 'jl_rt3', x: 10, y: 12 }) });
  const R5 = grid(24, 16, '#');
  fill(R5, 2, 2, 21, 4, '.'); fill(R5, 2, 5, 21, 10, 'h'); fill(R5, 2, 11, 21, 13, '.'); R5[7][8] = '.'; R5[8][14] = '.'; R5[14][11] = '.';
  room('jl_rt5', 'Jupiter Lighthouse - Hover Hall', R5, { x: 11, y: 13 }, ENC_HIGH, (M) => {
    way(M, 11, 14, 1, 1, 'jl_rt4', 20, 13, DIR.DOWN);
    for (let y = 5; y <= 10; y++) for (let x = 2; x <= 21; x++) if (!((x === 8 && y === 7) || (x === 14 && y === 8))) M.object('gap', x, y, { id: 'jl_5g_' + x + '_' + y });
    for (const [x, y] of [[5, 11], [11, 11], [17, 11], [8, 7], [14, 8], [5, 4], [17, 4]]) pad(M, 'jl_pad_5_' + x + '_' + y, x, y);
    M.chest(3, 3, "Phaeton's Blade", 1);
    M.object('tornado', 8, 3, { id: 'jl_tw5', x0: 5, x1: 18, speed: 9, onHit: blown('jl_rt5', 11, 13, 'The wind off the statues throws the party back to the hall\'s foot!') });
    M.setObj(1, 3, 'jl_face');
    way(M, 22, 3, 1, 1, 'jl_rt_top', 5, 10, DIR.RIGHT);
    M.sign(12, 12, 'Violet panels all over the floor: the party can hover almost without pause. A face at the far side breathes wind along the upper floor.');
  });
  const RT = grid(20, 12, '#');
  fill(RT, 2, 2, 17, 9, '.'); fill(RT, 4, 10, 6, 10, '.');
  room('jl_rt_top', 'Jupiter Lighthouse - Right Tower Top', RT, { x: 5, y: 10 }, ENC_HIGH, (M) => {
    way(M, 5, 11, 1, 1, 'jl_rt5', 21, 3, DIR.DOWN);
    archer(M, 9, 2, 'The great archer of the right tower, aimed at the angel over the aerie.');
    energyBlock(M, 'jl_eb_r', 6, 6, 12, 6, function* (E) { G.set('jl_lid_right'); yield E.say('The archer looses, and the right angel lifts its half of the lid! The well of the beacon lies open at last.'); yield E.say('Back to the aerie, then. The Jupiter Star goes home tonight.', 'Felix'); });
    M.sign(3, 3, 'The top of the right tower. A block with a channel of light in it, and a gap in the floor before the archer.');
  });
  // ====================== the aerie: the trap, Alex, the beacon, Karst and Agatio ======================
  T3.jupiterEnter = function* (E) { yield E.say("The Jupiter Lighthouse. This is where Alex said he'd meet us. And Isaac's party... they'll be close behind.", 'Felix'); yield E.say("Karst and Agatio came from Prox to finish what Saturos started. They won't be friendly, whatever Alex says.", 'Piers'); };
  T3.jupiterTrap = function* (E) {
    G.set('jl_isaac_scene');
    Audio.play('trouble');
    E.spawn('jl_garet', 9, 6, { look: CHARACTERS.Garet.look, name: 'Garet', dir: DIR.DOWN }); E.spawn('jl_mia', 15, 6, { look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.DOWN });
    yield E.say('(Voices, from the aerie\'s far side. Two figures cling to the broken edge of the ledge there - a big man in red, a girl in blue.)');
    yield E.say('Mia! Hold on! Whatever you do, don\'t look down!', 'Garet'); yield E.say('I... I can\'t hold on much longer, Garet...', 'Mia');
    E.spawn('jl_isaac', 11, 9, { look: CHARACTERS.Isaac.look, name: 'Isaac', dir: DIR.UP }); E.spawn('jl_ivan', 13, 9, { look: CHARACTERS.Ivan.look, name: 'Ivan', dir: DIR.UP });
    yield E.say('Garet! Mia! We\'re coming - Ivan, the rope!', 'Isaac'); yield E.say('Isaac, wait. Something is wrong here. I feel... someone watching.', 'Ivan');
    yield E.say('Isaac! Garet... Mia... It IS them!', 'Jenna'); yield E.say('And that is Ivan. So this is where the road brought both of us.', 'Kraden');
    yield E.say('Well, well. So the Venus Adept comes running to his friends. Just as I said he would.', 'Agatio');
    E.spawn('jl_agatio', 12, 4, { look: NPC_LOOKS.Agatio, name: 'Agatio', dir: DIR.DOWN }); E.spawn('jl_karst', 14, 4, { look: NPC_LOOKS.Karst, name: 'Karst', dir: DIR.DOWN });
    yield E.say('Agatio! And Karst! Then the ledge - it was a trap!', 'Ivan'); yield E.say('The girl and the big one were bait, boy. And you two are the catch. Menardi died at your hands, Isaac. Now you die at mine.', 'Karst');
    yield E.say('(Isaac and Ivan fight the two Mars Adepts, two on two - and it goes badly.)'); Engine.doShake(20); Audio.sfx('hit2');
    yield E.say('We have to help them!', 'Sheba'); yield E.say('Felix - wait.', 'Kraden');
    Engine.doFlash(10, '#a0e0ff'); E.spawn('jl_alex', 6, 15, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.UP });
    yield E.say('Felix. A moment.', 'Alex'); yield E.say('Alex! Where have you been?!', 'Jenna');
    const r = yield* E.ask('You are going to light this beacon, are you not, Felix?', 'Alex', ['Yes', 'No']);
    yield E.say(r === 0 ? 'Good. Then save them, so that you can.' : 'You will. Save them first, so that you can.', 'Alex');
    for (const m of G.party.members) { m.status = {}; m.hp = m.maxHp(); m.pp = m.maxPp(); } Audio.sfx('heal'); Engine.doFlash(12, '#a0e0ff'); yield E.say('(Alex raises a hand, and cool light runs over the party: every wound closed, every drop of Psynergy restored.)');
    yield E.say('Go. I will be at the top.', 'Alex'); E.despawn('jl_alex');
    yield E.say('(Out on the ledge, Ivan goes down under a wall of flame. Isaac takes a blow that would have felled a horse - and stays on his feet, barely.)'); Engine.doShake(16);
    yield E.say('Enough. He has the Mars Star on him - and the lighthouse is not lit yet. Felix will do that for us. Karst, the beacon.', 'Agatio'); yield E.say('We will be waiting, Felix. Bring your star.', 'Karst');
    E.despawn('jl_agatio'); E.despawn('jl_karst');
    yield E.say('Isaac! Ivan! Are you-', 'Jenna'); yield E.say('...Felix. Jenna. You came.', 'Isaac'); yield E.say('The lighthouse, Felix. They mean to have it lit. If they leave here with the Mars Star and this beacon dark... Go. Light it. Take the star - it is safer with you than with me now.', 'Isaac');
    yield E.say('(Isaac presses the Mars Star into Felix\'s hand. Felix puts it in the Mythril Bag, beside the Jupiter Star.)'); G.inventory.add('Mars Star', 1); Audio.sfx('item');
    yield E.say('Jenna, Sheba, Kraden - see to Mia and Garet on the ledge. Piers, with me.', 'Felix');
    yield E.say('(Jenna, Sheba and Kraden go to Garet and Mia. Felix and Piers walk on toward the beacon.)');
    for (const id of ['jl_garet', 'jl_mia', 'jl_isaac', 'jl_ivan']) E.despawn(id);
    const P = G.party; for (const n of ['Jenna', 'Sheba']) { const m = P.get(n); if (m && P.active.includes(m)) { P.active.splice(P.active.indexOf(m), 1); P.reserve.push(m); } }
    E.field.rebuildFollowers(); E.gather();
  };
  T3.jupiterAerie = function* (E) {
    Audio.play('villain');
    E.spawn('KarstJ', 10, 6, { look: NPC_LOOKS.Karst, name: 'Karst', dir: DIR.DOWN }); E.spawn('AgatioJ', 15, 6, { look: NPC_LOOKS.Agatio, name: 'Agatio', dir: DIR.DOWN });
    yield E.say('Here he is. The star, Felix. Into the well with it.', 'Agatio');
    yield E.say('(Felix takes the Jupiter Star from the Mythril Bag and casts it into the beacon!)'); G.inventory.remove('Jupiter Star', 1);
    Engine.doFlash(20, '#c070f0'); Audio.sfx('beacon'); yield E.shake(30); G.set('jupiter_lit'); G.map.beacon(12, 9, 'jupiter', true); G.map.finalize();
    yield E.say('(A pillar of violet light erupts from the Jupiter Lighthouse and climbs into the sky!)');
    yield E.say('Three of four. And now, boy - the Mars Star.', 'Karst'); yield E.say('The Mars Lighthouse is ours to light. It stands beside Prox, our own home. We do not need you for it, Felix. We never did.', 'Agatio');
    yield E.say('(Karst snatches the Mythril Bag from Felix - and the Mars Star with it!)'); G.inventory.remove('Mars Star', 1); G.set('mars_star_taken'); Audio.sfx('hit');
    yield E.say('Your parents, Felix? Free, the moment this beacon lit - that was the bargain, and Prox keeps its bargains. But no one will guide them home across the ice. They will live out their years where they are.', 'Karst');
    yield E.say('You... give that back!', 'Felix'); yield E.say('Take it, then.', 'Agatio');
    yield E.say('(Jenna and Sheba are running up the far stair. Felix and Piers cannot wait for them.)');
    const r = yield* E.battle(['Karst', 'Agatio'], { boss: true, canFlee: false, music: 'karstagatio', joinAt: { Jenna: 2, Sheba: 4 } });
    if (r !== 'win') return;
    yield E.say('(Karst and Agatio fall, and lie still - then a cool light washes over them, and they stir.)'); Engine.doFlash(10, '#a0e0ff');
    E.spawn('AlexJ', 12, 12, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.UP });
    yield E.say('That is enough, Felix. If they die here, your parents die in Prox. You know it.', 'Alex');
    yield E.say('Get up, both of you. The Mars Lighthouse waits, and the star with it. We go.', 'Alex');
    yield E.say('This is not over, Felix. Come to Mars. Come and take it back, if you can.', 'Karst');
    for (const id of ['KarstJ', 'AgatioJ', 'AlexJ']) E.despawn(id);
    yield E.say('(The three are gone down the stair. And up it, as the light settles, come the others.)');
    E.spawn('jl_isaac2', 11, 15, { look: CHARACTERS.Isaac.look, name: 'Isaac', dir: DIR.UP });
    yield E.say('Felix... the beacon. And the Mars Star?', 'Isaac'); yield E.say('Taken. Karst and Agatio have it, and Alex with them. They go to Prox - to the Mars Lighthouse.', 'Felix');
    yield E.say('Then so do we. All of us. But not from here, and not tonight - Garet and Mia need a bed and a healer. Contigo.', 'Kraden');
    yield E.say('We\'ll wait for you there, Felix. Contigo. We have a great deal to talk about.', 'Isaac');
    E.despawn('jl_isaac2');
    const P = G.party; for (const n of ['Jenna', 'Sheba']) { const m = P.get(n); if (m && P.reserve.includes(m) && P.active.length < 4) { P.reserve.splice(P.reserve.indexOf(m), 1); P.active.push(m); } } E.field.rebuildFollowers();
    G.set('jupiter_done');
    yield E.say('(The aerie\'s floor shudders, and sinks: the lighthouse\'s own way down carries the party to its foot.)'); yield Engine.fadeOut(30); E.warpNow('jupiter_lh', 14, 12, DIR.DOWN); yield Engine.fadeIn(30);
    yield* E.chapter('Chapter 6: Reunion');
  };
  // ====================== Contigo: the reunion in the upper-left home ======================
  T3.contigoReunion = function* (E) {
    G.set('contigo_reunion');
    Audio.play('sad');
    E.spawn('cr_isaac', 5, 4, { look: CHARACTERS.Isaac.look, name: 'Isaac', dir: DIR.DOWN }); E.spawn('cr_garet', 3, 3, { look: CHARACTERS.Garet.look, name: 'Garet', dir: DIR.RIGHT }); E.spawn('cr_ivan', 8, 3, { look: CHARACTERS.Ivan.look, name: 'Ivan', dir: DIR.LEFT }); E.spawn('cr_mia', 7, 5, { look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.DOWN });
    yield E.say('Felix. Come in - all of you. Garet is on his feet again, and Mia is mending.', 'Isaac');
    yield E.say('Isaac... I owe you an account of three years. Sit, and hear it whole.', 'Felix');
    yield E.say('The day the storm broke over Mt. Aleph, when the boulder fell: you saw me swept into the river with my mother, my father, and yours, Isaac. You all thought us dead. Nobody died that day.', 'Felix');
    yield E.say('Saturos and Menardi pulled us from the river below the falls. They were on the mountain for the Elemental Stars, and they had failed - and they would not leave empty-handed. They took us to Prox, all of us, and there we were kept.', 'Felix');
    yield E.say('My father... Kyle is alive? In Prox?', 'Isaac'); yield E.say('Alive. And Prox is dying, Isaac - the edge of the world creeps closer every winter. Their elders learned that only the beacons, all four, will halt it. Saturos was sent for the stars for that. I came to believe it, and I went with them.', 'Felix');
    yield E.say('And we killed them at Venus. And then we hunted you.', 'Isaac'); yield E.say('You did what the Wise One asked. So did I. He told each of us half.', 'Felix');
    yield E.say('Then Kyle and your parents live only as long as Prox keeps its bargain - and Karst and Agatio hold the Mars Star now. Whatever they told Felix, that beacon is the whole of it.', 'Kraden');
    Audio.play('contigo');
    E.spawn('cr_hama', 6, 8, { look: NPC_LOOKS.Hama, name: 'Hama', dir: DIR.UP }); yield E.say('(The door opens. A woman in the robes of a seer stands in it - and Ivan starts to his feet.)');
    yield E.say('Hama!', 'Ivan'); yield E.say('Ivan. Contigo, at last - and in the company I hoped for.', 'Hama');
    yield E.say('You know her, Ivan?', 'Sheba'); yield E.say('She taught me Reveal, at Lama Temple. But I did not know then... you are of the Anemos, Hama. Of Contigo.', 'Ivan');
    yield E.say('As are you. We are brother and sister, Ivan, born of the line of the Anemos who stayed behind when the city rose into the sky. Our mother gave you to the merchant Hammet so that you might live free of it. That is the whole of the secret you have carried.', 'Hama');
    yield E.say('Brother and... sister.', 'Ivan');
    yield E.say('Listen now, all of you, for there is little time. Agatio cannot light the Mars beacon. Something in that lighthouse bars him - I have seen it. He will need the Mars Adepts of Vale, or of Prox, and the star. And you will need each other: eight Adepts, two of every element, or the last lighthouse will not open to you at all.', 'Hama');
    yield E.say('Then it is settled. We go to Prox together - all eight of us.', 'Isaac'); yield E.say('Together, Isaac.', 'Felix');
    yield E.say('Go to the inlet south of here, where your ship is tied. Meet me there; the people of Contigo have been waiting three years for this day, and they have something to give you.', 'Hama');
    for (const id of ['cr_hama', 'cr_isaac', 'cr_garet', 'cr_ivan', 'cr_mia']) E.despawn(id);
    yield* STORY_TLA.isaacJoins(E);
    G.set('hama_inlet_waiting');
  };
}
