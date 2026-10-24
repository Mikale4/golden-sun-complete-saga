// ---------- Mars Lighthouse ----------
// After map references/golden-sun-the-lost-age-mars-lighthouse-gba-map.webp condensed room by room to the guide's chapter
// 17 and the script's [02'48]: the frozen tower. The forecourt (the Apple on the ladders' ledge), the entrance hall (the
// pinnacles, the Mimic's chest behind the rightmost cone, the three ways), the back room's loop up to the ledge, the left
// way (the cone, Grind at the dead end cracks the sheet a floor below, Burst), the first circle, the flame chamber (the
// statue shoved the length of the top lane to block the last thrower), black ice LURULDL to the dragon head whose Blaze
// cracks the ice of the lower passage (the hidden circle behind it), the right room's head whose fire melts the way south,
// the three doorways (the Orihalcon), the fire lane and its cones, the second black ice (the statue out of the mouth, then
// DLUL and either DLUL to Balm or ULULU up and out), the drop to the Teleport Lapis and the circle back; the hidden
// circle to the stair hall (the Valkyrie Mail below, then the slide), the dragon's head on its way along the wall (Pound,
// the ice, Pound, the circle), the jumps to the Sol Blade and the way left to the two dragons frozen in ice: Blaze and
// Burst, Agatio and Karst, the Mars Star and the northern dragon that thaws the tower for it. Then the hall's leftmost
// head, Burst on the great sheet, Fugue in the back room, the room of four spirits and its four towers (wind: the
// Cyclone swirls, the six blocks under Reveal, the hover, the hidden stones; water: the black ice thrice and the pipes;
// fire: the cracked walls, the button and the torch, the pipes and the statue; earth: the right statue, the left statue,
// the carried stones, the rope, Sand under the flames), the four claws, the circle to the aerie and the end of it all.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const put = (rows, x0, y0, lines) => { lines.forEach((l, j) => { for (let i = 0; i < l.length; i++) if (l[i] !== '?') rows[y0 + j][x0 + i] = l[i]; }); };
  const strs = (rows) => rows.map(r => r.join(''));
  const thawed = () => !!G.flag('mars_thawed');
  const OUT = { map: 'world_tla', x: 142, y: 13, dir: DIR.DOWN };
  const ENC_LOW = [['Raptor'], ['Doodle Bug', 'Doodle Bug'], ['Devil Frog'], ['Minos Warrior']];
  const ENC_HIGH = [['Fire Bird'], ['Aka Manah'], ['Minos Warrior', 'Devil Frog'], ['Raptor', 'Raptor']];
  // the tower's stone: violet walls and teal floors under the ice, warm brick once the beacon's fire has come back
  const FL = () => thawed() ? 'ml_floor_warm' : 'ml_floor';
  const legend = () => ({
    '.': FL(), 'i': thawed() ? FL() : 'ml_ice', 'b': 'ml_blackice', 'g': 'lh_gap', 'p': 'lh_pit', 's': 'jl_slide', 'S': 'ml_sky', 'P': 'ml_platform', 'L': 'ml_lava', 'u': 'ml_puddle', 'R': 'ml_ropeh',
    'e': 'elem_mars', 'c': 'lh_crack', 'h': 'jl_hole', 'q': 'sandsoft', 'x': 'snow', 'T': { ground: 'snow', obj: 'pinesnow' }, 'r': { ground: 'snow', obj: 'rock_snow' }, 'l': { ground: 'snow', obj: 'ladder', walk: true }, 'H': 'block_grey_hover', 'W': { ground: 'ml_walltop', obj: 'ml_wall' },
  });
  const CLIFF = () => thawed() ? { cliff: '#', set: 'lhmarswarm', top: 'ml_walltop_warm', face: 'ml_wall_warm', mid: 'ml_walltop_warm' } : { cliff: '#', set: 'lhmars', top: 'ml_walltop', face: 'ml_wall', mid: 'ml_walltop' };
  const room = (id, name, rows, entry, enc, build, extra) => defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'lighthouse', bg: 'lighthouse', indoor: true, entry, enc, retreat: OUT, build(M) { M.paint(0, 0, strs(rows), legend(), CLIFF()); build(M); } }, extra || {}));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.set(x, y, FL()); M.setObj(x, y, 'door_stone'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const stairs = (M, x, y, to, tx, ty, down) => { M.set(x, y, FL()); M.setObj(x, y, down ? 'stairs_down' : 'stairs_up'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, down ? DIR.DOWN : DIR.UP, { stairs: true }); };
  const way = (M, x, y, w, h, to, tx, ty, dir, opts) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { M.set(x + i, y + j, FL()); M.setObj(x + i, y + j, null); } M.walkable(x, y, w, h); M.exit(x, y, w, h, to, tx, ty, dir, opts); };
  const persistTile = (M, x, y, tile) => { M.set(x, y, tile); M.setObj(x, y, null); M.walkable(x, y); M.finalize(); };
  // an ice cone: Pound shatters it to a scatter of shards
  const cone = (M, id, x, y) => M.object('pillar', x, y, { id, tile: 'ml_cone', sunkTile: 'ml_shards', fixed: true });
  // a rock in the way: Pound crumbles it
  const rock = (M, id, x, y) => M.object('pillar', x, y, { id, tile: 'ml_rock', sunkTile: null, fixed: true });
  // a stopper on the black ice: nothing moves it
  const stop = (M, x, y) => M.object('pillar', x, y, { id: M.id + '_stop_' + x + '_' + y, tile: 'ml_rock', fixed: true, poundable: false });
  // a dragon's head on a wall: Blaze lights its eyes and it breathes what the room says
  const head = (M, id, x, y, onLit, opts) => M.object('torch', x, y, Object.assign({ id, tile: 'ml_head', litTile: 'ml_head_lit', onLit }, opts || {}));
  // a circle of red stone in the floor: Teleport carries the party to its twin (a hidden one shows itself under Reveal)
  const circle = (M, id, x, y, to, hidden) => M.object('tpcircle', x, y, { id, tile: 'ml_circle', hiddenUntilReveal: !!hidden, to });
  // a fireball: from a dragon's mouth along its lane, again and again; struck, the party is thrown back where it came in
  const flung = (map, x, y, dir, text) => function* (E) { Audio.sfx('boom'); Engine.doShake(10); Engine.doFlash(6, '#ff8040'); yield E.say(text || '(The fireball bursts against the party and throws them back the way they came!)'); yield Engine.fadeOut(8); E.warpNow(map, x, y, dir === undefined ? DIR.UP : dir); yield Engine.fadeIn(8); };
  const fireball = (M, id, x0, y0, x1, y1, speed, onHit, active) => {
    const horiz = y0 === y1; const dx = horiz ? Math.sign(x1 - x0) : 0, dy = horiz ? 0 : Math.sign(y1 - y0);
    M.object('tornado', x0, y0, Object.assign({ id, tile: 'fireball', oneway: true, sx: x0, sy: y0, dx, dy, speed: speed || 6, onHit, active }, horiz ? { x0: Math.min(x0, x1), x1: Math.max(x0, x1) } : { y0: Math.min(y0, y1), y1: Math.max(y0, y1) }));   // a lane is a row (x0..x1) or a column (y0..y1), never both
  };
  // a statue the party shoves about; one that stands in a fireball's lane stops it
  const statue = (M, id, x, y, opts) => M.object('statue_move', x, y, Object.assign({ id, tile: 'ml_statue' }, opts || {}));
  const marsStar = () => !!(G.inventory && G.inventory.has('Mars Star'));

  // ====================== the forecourt ======================
  const FC = grid(30, 32, 'x');
  fill(FC, 0, 0, 29, 4, '#'); fill(FC, 4, 0, 25, 3, 'W'); fill(FC, 0, 0, 3, 31, '#'); fill(FC, 26, 0, 29, 31, '#');   // the tower's foot (violet stone) and the cliffs either side
  fill(FC, 4, 8, 25, 11, '#'); fill(FC, 4, 16, 25, 21, '#');                                  // the two terraces' faces
  fill(FC, 18, 8, 18, 11, 'l'); fill(FC, 10, 16, 10, 21, 'l');                                // the ladders up
  for (const [x, y] of [[5, 24], [24, 26], [7, 29], [22, 23], [12, 27], [19, 30]]) FC[y][x] = 'T';
  for (const [x, y] of [[6, 13], [23, 14], [16, 25], [9, 22]]) FC[y][x] = 'r';
  defineMap('mars_lh_1', {
    name: 'Mars Lighthouse', w: 30, h: 32, base: 'snow', music: 'snow', bg: 'snow', entry: { x: 14, y: 30 }, retreat: OUT, enc: [['Wolfkin', 'Wolfkin'], ['Minos Knight'], ['Pyrodra']],
    build(M) {
      M.paint(0, 0, strs(FC), legend(), { cliff: '#', set: 'snowplateau', top: 'snowcliff_top', face: 'snowcliff_face', mid: 'snowcliff_top' });
      M.walkable(13, 31, 4, 1); M.exit(13, 31, 4, 1, 'world_tla', OUT.x, OUT.y, DIR.DOWN);
      door(M, 14, 4, 'ml_hall', 14, 24, DIR.UP); M.setObj(13, 4, 'door_stone'); M.setObj(15, 4, 'door_stone');
      M.chest(5, 13, 'Apple', 1);   // the ledge where the left lift once ran
      M.sign(12, 23, 'Mars Lighthouse. The beacon of the northern flame - dark, and the tower iced to its crown.');
      M.trigger(4, 28, 22, 2, T3.marsEnter, { once: 'mars_entered' });
      M.trigger(12, 6, 6, 1, function* (E) { yield E.say('(Through the doors the cold deepens: the halls beyond are sheathed in ice.)'); }, { once: 'ml_doors_seen', cond: () => !thawed() });
    }
  });
  // ====================== the entrance hall ======================
  // the lower hall (the pinnacles and the Mimic's chest), the right door; the upper ledge (reached round through the
  // back room) with the left door, the three heads and the great sheet before the center stair
  const HL = grid(30, 26, '#');
  fill(HL, 2, 14, 27, 23, '.'); fill(HL, 2, 3, 27, 11, '.'); fill(HL, 13, 5, 15, 5, 'c'); fill(HL, 12, 6, 16, 7, 'i'); fill(HL, 12, 3, 16, 4, '#'); HL[4][14] = '.';   // the stair's alcove: only the sheet's way in
  room('ml_hall', 'Mars Lighthouse - Entrance Hall', HL, { x: 14, y: 24 }, ENC_LOW, (M) => {
    door(M, 14, 25, 'mars_lh_1', 14, 5, DIR.DOWN); M.setObj(13, 25, 'door_stone'); M.setObj(15, 25, 'door_stone');
    door(M, 28, 18, 'ml_east', 2, 10, DIR.RIGHT);          // the right way: the back room
    door(M, 28, 6, 'ml_east', 2, 3, DIR.RIGHT);            // the back room's other door, onto the ledge
    door(M, 1, 6, 'ml_west', 27, 17, DIR.LEFT);            // the left way
    // the pinnacles: cones across the lower hall, the rightmost sealing the chest's alcove
    for (const [i, [x, y]] of [[6, 16], [9, 20], [12, 17], [16, 21], [19, 16], [22, 20], [24, 17], [8, 23], [18, 19]].entries()) cone(M, 'ml_hall_cone' + i, x, y);
    for (const [i, [x, y]] of [[26, 14], [25, 15], [27, 15], [26, 16]].entries()) cone(M, 'ml_hall_cone_r' + i, x, y); M.chest(26, 15, 'Cookie', 1, { mimic: 'Mimic #8 II' });
    // the three heads on the ledge's back wall: the leftmost, once the fire is back in the tower, melts the ice about the stair
    for (const x of [6, 14, 22]) M.setObj(x, 2, 'ml_head');
    if (thawed()) head(M, 'ml_hall_head_l', 6, 2, function* (E) { G.set('ml_hall_melted'); Audio.sfx('fire'); Engine.doShake(6); yield E.say('The head breathes fire across the ledge - the ice about the stair runs to water, and the great sheet before it cracks from top to bottom!'); const Mp = G.field.map; for (let y = 6; y <= 7; y++) for (let x = 12; x <= 16; x++) persistTile(Mp, x, y, FL()); for (const o of Mp.objects) if (o.kind === 'spot' && /ml_hall_sheet/.test(o.id)) { o.gone = true; } for (const x of [13, 14, 15]) Mp.objects.push({ kind: 'crack', x, y: 5, id: 'ml_hall_crack_' + x, key: Mp.id + ':crack:' + x + ',5', tile: 'ml_sheet_cracked', onBurst: sheetBurst }); Mp.finalize(); });
    if (thawed()) { head(M, 'ml_hall_head_c', 14, 2, null); head(M, 'ml_hall_head_r', 22, 2, null); }
    M.trigger(5, 3, 3, 1, function* (E) { yield E.say('(The dragon\'s head is frozen solid: its eyes are rimed shut and no fire would take.)'); }, { cond: () => !thawed() });
    // the great sheet of ice before the center stair: a wall until the head's fire cracks it, then Burst opens the way
    const sheetBurst = function* (E) { const Mp = G.field.map; for (const o of Mp.objects) if (o.kind === 'crack' && /ml_hall_crack/.test(o.id)) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } G.set('ml_hall_burst'); for (const x of [13, 14, 15]) persistTile(Mp, x, 5, FL()); Audio.sfx('boom'); yield E.say('The sheet shatters! The center stair climbs into the dark beyond it.'); };
    if (G.flag('ml_hall_burst')) { for (const x of [13, 14, 15]) persistTile(M, x, 5, FL()); }
    else if (G.flag('ml_hall_melted')) { for (const x of [13, 14, 15]) M.object('crack', x, 5, { id: 'ml_hall_crack_' + x, tile: 'ml_sheet_cracked', onBurst: sheetBurst }); }
    else { for (const x of [13, 14, 15]) M.object('spot', x, 5, { id: 'ml_hall_sheet_' + x, tile: 'ml_sheet' }); }
    stairs(M, 14, 4, 'ml_spirits', 12, 14, false);
    if (thawed()) { for (const [x, y] of [[2, 22], [3, 23], [2, 23], [27, 22], [26, 23], [27, 23]]) { M.set(x, y, 'ml_lava'); M.setObj(x, y, null); } }   // the fire come back: lava seeps in at the hall's corners
    M.sign(3, 22, thawed() ? 'The tower is warm again. The fire in the heads waits to be woken.' : 'A hall of ice. Pinnacles of it stand where the floor should be clear, and the three heads on the far wall are rimed shut.');
    M.trigger(12, 22, 5, 1, function* (E) { yield E.say('Ice everywhere... The whole tower is frozen through. Even the dragon heads on the walls.', 'Jenna'); yield E.say('Without the beacon\'s fire, the cold of the north has had its way. Pound will clear the cones; and there must be a way up that the ice has not shut.', 'Kraden'); }, { once: 'ml_hall_seen' });
  });
  // ====================== the back room: round and up onto the ledge; Fugue's alcove once the ice is gone ======================
  const EA = grid(30, 14, '#');
  fill(EA, 2, 8, 27, 11, '.'); fill(EA, 24, 2, 27, 8, '.'); fill(EA, 2, 2, 27, 4, '.'); fill(EA, 25, 11, 27, 11, 'i');
  room('ml_east', 'Mars Lighthouse - Back Room', EA, { x: 2, y: 10 }, ENC_LOW, (M) => {
    door(M, 1, 10, 'ml_hall', 27, 18, DIR.LEFT); door(M, 1, 3, 'ml_hall', 27, 6, DIR.LEFT);
    for (const [i, [x, y]] of [[8, 9], [14, 10], [20, 9], [10, 3], [18, 3]].entries()) cone(M, 'ml_east_cone' + i, x, y);
    // the far end of the lower room: iced shut until the tower warms; the Mars Djinni waits there
    if (thawed()) M.djinni('Fugue', 27, 11, { fight: true });
    M.sign(3, 9, 'The back room runs round and up. Its far corner is ice to the ceiling.');
  });
  // ====================== the left way: the cone, the dead end, Grind, the sheet ======================
  const westBurst = function* (E) { const Mp = G.field.map; for (const o of Mp.objects) if (o.kind === 'crack' && /ml_west_sheet/.test(o.id)) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } G.set('ml_west_burst'); for (const y of [16, 17]) persistTile(Mp, 2, y, FL()); yield E.say('The sheet bursts apart! A doorway stands behind it.'); };
  const WE = grid(30, 20, '#');
  fill(WE, 3, 15, 27, 18, '.'); fill(WE, 3, 7, 4, 14, '.'); fill(WE, 5, 7, 26, 7, '.'); fill(WE, 2, 16, 2, 17, 'c');
  room('ml_west', 'Mars Lighthouse - Left Way', WE, { x: 27, y: 17 }, ENC_LOW, (M) => {
    door(M, 28, 17, 'ml_hall', 2, 6, DIR.RIGHT);
    M.setObj(3, 14, 'stairs_up'); M.setObj(4, 14, 'stairs_up');
    cone(M, 'ml_west_cone', 12, 7);
    // the dead end: a slab of ice; Grind on it, and the crack runs down through the floor into the great sheet below
    M.object('rock_water', 26, 7, { id: 'ml_west_slab', look: 'ml_sheet', sunkGround: null, flag: 'ml_west_ground', onGrind: null });
    M.trigger(23, 7, 3, 1, function* (E) { yield E.say('A dead end, and a slab of ice grown across it. It sits over the very floor... Grind, Piers - and see what gives.', 'Kraden'); }, { once: 'ml_west_slab_seen', cond: () => !G.flag('ml_west_ground') });
    // the great sheet at the corridor's west end: a wall until the slab above is ground, then Burst
    if (G.flag('ml_west_burst')) { for (const y of [16, 17]) persistTile(M, 2, y, FL()); }
    else if (G.flag('ml_west_ground')) { for (const y of [16, 17]) M.object('crack', 2, y, { id: 'ml_west_sheet_' + y, tile: 'ml_sheet_cracked', onBurst: westBurst }); }
    else { for (const y of [16, 17]) M.object('spot', 2, y, { id: 'ml_west_sheet_' + y, tile: 'ml_sheet' }); }
    door(M, 1, 16, 'ml_tp1', 13, 5, DIR.LEFT, { cond: () => G.flag('ml_west_burst') });
    M.sign(5, 16, 'The great sheet: ice a yard thick across the corridor\'s end. Solid - unless something cracks it.');
  });
  // the slab: Grind sinks it, and the sheet below cracks
  MAPS.ml_west.onPsy = (name, x, y, F, o) => { if (name === 'Grind' && o && o.id === 'ml_west_slab' && o.state !== 'sunk') { return function* (E) { o.state = 'sunk'; G.set('obj:' + o.key, { state: 'sunk' }); G.set('ml_west_ground'); Audio.sfx('boom'); Engine.doShake(10); const Mp = G.field.map; for (const ob of Mp.objects) if (ob.kind === 'spot' && /ml_west_sheet/.test(ob.id)) ob.gone = true; for (const yy of [16, 17]) Mp.objects.push({ kind: 'crack', x: 2, y: yy, id: 'ml_west_sheet_' + yy, key: Mp.id + ':crack:ml_west_sheet_' + yy, tile: 'ml_sheet_cracked', onBurst: westBurst }); Mp.finalize(); yield E.say('The slab grinds to powder - and the crack runs on, down through the floor. Somewhere below, ice splits with a report like thunder.'); }; } return false; };
  // ====================== the first circle ======================
  const T1 = grid(16, 10, '#'); fill(T1, 2, 3, 13, 7, '.');
  room('ml_tp1', 'Mars Lighthouse - Circle Room', T1, { x: 13, y: 5 }, [], (M) => {
    door(M, 14, 5, 'ml_west', 3, 16, DIR.RIGHT); door(M, 1, 5, 'ml_flames', 21, 11, DIR.LEFT);
    circle(M, 'ml_circle_a', 8, 5, { map: 'ml_lapis', x: 5, y: 11, dir: DIR.DOWN });
    M.trigger(7, 6, 3, 1, function* (E) { yield E.say('A circle of red stone set in the floor, and a warmth off it the ice cannot kill. A teleportation circle - the Anemos had them. It wants Teleport, and none of us has it.', 'Kraden'); yield E.say('Then the doorway on the far side. We go on.', 'Felix'); }, { once: 'ml_circle_seen', cond: () => !G.party.hasPsy('Teleport') });
  });
  // ====================== the flame chamber ======================
  // three heads on the east wall breathe fire down the lanes; the statue at the top lane's west end is shoved its length
  const FLM = grid(24, 14, '#'); fill(FLM, 2, 3, 21, 11, '.');
  room('ml_flames', 'Mars Lighthouse - Flame Chamber', FLM, { x: 21, y: 12 }, [], (M) => {
    door(M, 21, 12, 'ml_tp1', 2, 5, DIR.DOWN); door(M, 20, 2, 'ml_ice1', 27, 17, DIR.UP);
    for (const [i, y] of [3, 6, 9].entries()) { M.object('statue', 22, y, { id: 'ml_fl_head' + i, tile: 'ml_head_lit' }); fireball(M, 'ml_fl_fire' + i, 21, y, 2, y, i === 0 ? 4 : 6, flung('ml_flames', 21, 11, DIR.UP)); }
    statue(M, 'ml_fl_statue', 3, 3);
    M.sign(3, 11, 'Three dragon heads, and the fire never stops. The topmost lane runs to the door.');
    M.trigger(19, 10, 3, 2, function* (E) { yield E.say('Fire! Three of them, and they never stop breathing it.', 'Sheba'); yield E.say('The lower two we can slip between. But the top lane runs the whole width to the door, and it does not pause... That statue on the far end - shove it ahead of us and it takes the fire.', 'Piers'); }, { once: 'ml_flames_seen' });
  });
  // ====================== the black ice, the dragon head, the hidden circle, the right room ======================
  const IC1 = grid(30, 20, '#');
  fill(IC1, 16, 3, 27, 17, '.'); fill(IC1, 3, 3, 14, 9, 'b'); IC1[8][15] = '.'; fill(IC1, 3, 12, 15, 17, '.'); fill(IC1, 2, 15, 2, 15, 'c');
  room('ml_ice1', 'Mars Lighthouse - Black Ice', IC1, { x: 27, y: 17 }, ENC_LOW, (M) => {
    door(M, 27, 18, 'ml_flames', 20, 3, DIR.DOWN); door(M, 2, 5, 'ml_dragon1', 9, 5, DIR.LEFT); door(M, 28, 5, 'ml_dragon2', 1, 9, DIR.RIGHT);
    for (const [x, y] of [[6, 5], [13, 5], [3, 6], [4, 9], [12, 9], [14, 9]]) stop(M, x, y);   // the field, solved LURULDL from its foot at (15,8)
    // the lower passage: cracked ice at its end once the head beyond the field has breathed on it
    const burst = function* (E) { G.set('ml_ice1_burst'); persistTile(G.field.map, 2, 15, FL()); yield E.say('The cracked ice bursts. A small door behind it.'); };
    if (G.flag('ml_ice1_burst')) persistTile(M, 2, 15, FL());
    else if (G.flag('ml_ice1_cracked')) M.object('crack', 2, 15, { id: 'ml_ice1_crack', tile: 'ml_sheet_cracked', onBurst: burst });
    else M.object('spot', 2, 15, { id: 'ml_ice1_sheet', tile: 'ml_sheet' });
    door(M, 1, 15, 'ml_tp_hidden', 9, 5, DIR.LEFT, { cond: () => G.flag('ml_ice1_burst') });
    M.sign(16, 12, 'Black ice fills the western hall: it carries the foot where it will. A door on its far side, another to the north-east, and a lower passage west.');
    M.trigger(15, 8, 1, 1, function* (E) { yield E.say('Black ice. Set foot on it and it carries you until something stops you. Left first, I think.', 'Jenna'); }, { once: 'ml_ice1_seen' });
  });
  const DR1 = grid(12, 10, '#'); fill(DR1, 2, 2, 9, 7, '.');
  room('ml_dragon1', 'Mars Lighthouse - Dragon Room', DR1, { x: 10, y: 5 }, [], (M) => {
    door(M, 10, 5, 'ml_ice1', 3, 5, DIR.RIGHT);
    head(M, 'ml_dr1_head', 5, 1, function* (E) { G.set('ml_ice1_cracked'); Audio.sfx('fire'); Engine.doShake(8); yield E.say('The head wakes and breathes - the fire goes through the wall and down. From the lower passage of the ice hall comes the crack of splitting ice.'); });   // the ice hall is rebuilt on return, and reads the flag
    M.sign(3, 6, 'A dragon\'s head on the wall, its mouth pointed at the floor. Blaze wakes such things.');
  });
  const TPH = grid(12, 10, '#'); fill(TPH, 2, 2, 9, 7, '.');
  room('ml_tp_hidden', 'Mars Lighthouse - Hidden Circle', TPH, { x: 10, y: 5 }, [], (M) => {
    door(M, 10, 5, 'ml_ice1', 3, 15, DIR.RIGHT);
    circle(M, 'ml_circle_c', 5, 4, { map: 'ml_vstairs', x: 4, y: 3, dir: DIR.DOWN }, true);
    M.sign(3, 7, 'An empty room. The floor is worn in a ring in the middle, as if something used to be there.');
    M.trigger(4, 4, 3, 1, function* (E) { yield E.say('Nothing here... but the floor is worn in a circle. Reveal would show what the eye cannot.', 'Sheba'); }, { once: 'ml_tph_seen', cond: () => !G.get('obj:ml_tp_hidden:tpcircle:ml_circle_c:seen') });
  });
  const DR2 = grid(16, 12, '#'); fill(DR2, 2, 2, 13, 9, '.'); fill(DR2, 7, 3, 13, 3, 'i'); fill(DR2, 13, 7, 13, 9, 'i');
  room('ml_dragon2', 'Mars Lighthouse - Right Room', DR2, { x: 1, y: 9 }, [], (M) => {
    door(M, 0, 9, 'ml_ice1', 27, 5, DIR.LEFT);
    head(M, 'ml_dr2_head', 2, 3, function* (E) { G.set('ml_dr2_lit'); Audio.sfx('fire'); Engine.doShake(8); yield E.say('A ball of fire rolls from the head\'s mouth across the room - the ice in its path flashes to steam, and the way south is clear!'); const Mp = G.field.map; for (let x = 7; x <= 13; x++) persistTile(Mp, x, 3, FL()); for (let y = 7; y <= 9; y++) persistTile(Mp, 13, y, FL()); });
    if (G.flag('ml_dr2_lit')) { for (let x = 7; x <= 13; x++) persistTile(M, x, 3, FL()); for (let y = 7; y <= 9; y++) persistTile(M, 13, y, FL()); }
    door(M, 13, 10, 'ml_three', 14, 2, DIR.DOWN, { cond: () => G.flag('ml_dr2_lit') });
    M.sign(3, 8, 'The right room. Ice bars the way south - and the dragon\'s head faces straight down the length of it.');
  });
  // ====================== the corridor with three doorways ======================
  const TH = grid(30, 12, '#');
  fill(TH, 2, 2, 27, 4, '.'); fill(TH, 3, 6, 6, 9, '.'); fill(TH, 13, 6, 16, 9, '.');
  room('ml_three', 'Mars Lighthouse - Three Doorways', TH, { x: 14, y: 1 }, ENC_LOW, (M) => {
    door(M, 14, 1, 'ml_dragon2', 13, 9, DIR.UP);
    for (const x of [4, 14]) { M.set(x, 5, FL()); M.walkable(x, 5); }   // the left and center doorways open onto their alcoves
    M.chest(15, 7, 'Orihalcon', 1); M.chest(5, 7, 'Elixir', 1);
    door(M, 25, 5, 'ml_cones', 8, 27, DIR.DOWN);
    M.sign(8, 3, 'Three doorways off the corridor. The rightmost breathes warm air - and something roars beyond it.');
  });
  // ====================== the fire lane ======================
  // a dragon's head at the top breathes fire the length of the corridor; the cones in the side niches are Pounded from
  // the lane, and each niche cleared is a place to stand while the next ball goes by
  const CN = grid(16, 30, '#');
  fill(CN, 8, 2, 8, 27, '.'); fill(CN, 7, 26, 9, 27, '.'); for (const y of [23, 19, 15, 11, 7, 5]) CN[y][7] = '.'; fill(CN, 7, 3, 7, 4, '.');
  room('ml_cones', 'Mars Lighthouse - Fire Lane', CN, { x: 8, y: 27 }, [], (M) => {
    door(M, 8, 28, 'ml_three', 25, 4, DIR.DOWN); door(M, 7, 2, 'ml_ice2', 8, 1, DIR.UP);
    M.object('statue', 8, 1, { id: 'ml_cn_head', tile: 'ml_head_lit' });
    fireball(M, 'ml_cn_fire', 8, 2, 8, 25, 12, flung('ml_cones', 8, 27, DIR.UP));
    for (const [i, y] of [23, 19, 15, 11, 7, 5].entries()) cone(M, 'ml_cn_cone' + i, 7, y);
    M.sign(9, 27, 'The fire lane. Cones of ice stand in the niches along it - Pound them from the lane and the niches are yours.');
    M.trigger(7, 26, 3, 1, function* (E) { yield E.say('The fire comes right down the corridor, ball after ball. There is no dodging it in the open.', 'Isaac'); yield E.say('The niches along the side, Felix - each has a cone in it. Pound one from the lane and step into the gap before the next ball. Then the next.', 'Kraden'); }, { once: 'ml_cones_seen' });
  });
  // ====================== the second black ice: Balm, and the stair up ======================
  const IC2 = [
    '##############',
    '#b#####...####',
    '#bbbbbb...bbb#',
    '#bbbbbb#b#bbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '#bbbbbbbbbbbb#',
    '##############',
  ].map(r => r.split('').map(ch => ch === 'r' || ch === 'J' ? 'b' : ch));
  room('ml_ice2', 'Mars Lighthouse - Black Ice Hall', IC2, { x: 8, y: 1 }, [], (M) => {
    door(M, 8, 0, 'ml_cones', 7, 3, DIR.UP); door(M, 1, 0, 'ml_lapis', 6, 12, DIR.UP);
    for (const [x, y] of [[3, 2], [5, 2], [3, 3], [3, 4], [4, 4], [12, 5], [1, 7], [2, 8], [9, 9], [11, 9], [8, 10], [11, 10], [6, 11], [8, 11]]) stop(M, x, y);   // from the mouth (7,2): LDRURULDRUL to Balm's corner, then ULU up and out (no cell of it is a trap)
    statue(M, 'ml_ice2_statue', 8, 2);   // in the mouth of the pocket: shoved aside (east) before the ice can be set foot on
    M.djinni('Balm', 1, 6, { fight: true });
    M.sign(9, 1, 'A hall of black ice below the pocket. A statue stands in the mouth of it.');
    M.trigger(7, 1, 3, 1, function* (E) { yield E.say('Another ice field, and a statue square in the only way onto it. Move it aside first. Something glimmers in the west corner - and the far door is up there in the north-west.', 'Kraden'); }, { once: 'ml_ice2_seen' });
  });
  // ====================== the stair up, the drop, the Teleport Lapis ======================
  const LP = grid(14, 16, '#');
  fill(LP, 2, 12, 11, 13, '.'); fill(LP, 2, 8, 3, 11, '.'); fill(LP, 2, 3, 11, 7, '.'); fill(LP, 6, 6, 8, 7, 'h'); fill(LP, 5, 9, 11, 11, '.');
  room('ml_lapis', 'Mars Lighthouse - Upper Stair', LP, { x: 6, y: 12 }, [], (M) => {
    door(M, 6, 14, 'ml_ice2', 1, 1, DIR.DOWN); M.setObj(6, 13, 'stairs_up'); M.setObj(7, 13, 'stairs_up');
    // the pit in the upper floor: a drop to the ledge below, where the chest sits with the circle beside it
    M.def.fall = { map: 'ml_lapis', x: 7, y: 10 };
    M.chest(10, 10, 'Teleport Lapis', 1, { onOpen: function* (E) { G.set('teleportUnlocked'); yield E.say('The Teleport Lapis! Equip it, and Teleport is yours: the circles in the floor will carry you, and any town you have seen is a step away.', 'Kraden'); } });
    circle(M, 'ml_circle_b', 5, 11, { map: 'ml_tp1', x: 8, y: 5, dir: DIR.DOWN });
    M.sign(3, 12, 'The upper stair. A pit yawns in the floor above; below it, a ledge with no way up or out but a circle of red stone.');
    M.trigger(5, 5, 4, 1, function* (E) { yield E.say('The floor is out here. There is a ledge below, and a chest on it... and no stair back. We would be trusting to the circle beside it.', 'Piers'); yield E.say('Everything about this tower has been a trust. Jump.', 'Felix'); }, { once: 'ml_lapis_seen' });
  });
  // ====================== the stair hall: the Valkyrie Mail below, and the slide ======================
  const VS = grid(24, 16, '#');
  fill(VS, 2, 2, 21, 5, '.'); fill(VS, 19, 6, 21, 8, '.'); fill(VS, 2, 9, 21, 12, '.');
  room('ml_vstairs', 'Mars Lighthouse - Stair Hall', VS, { x: 4, y: 3 }, ENC_HIGH, (M) => {
    circle(M, 'ml_circle_d', 4, 3, { map: 'ml_tp_hidden', x: 5, y: 4, dir: DIR.DOWN });
    // the slide in the upper floor's south wall: down it is the dragon's gallery, and there is no climbing back
    M.set(8, 6, 'jl_slide'); M.walkable(8, 6); M.def.fall = { map: 'ml_timer', x: 2, y: 4 };
    M.setObj(20, 6, 'stairs_down'); M.setObj(20, 7, 'stairs_down');
    M.chest(3, 10, 'Valkyrie Mail', 1);
    M.sign(6, 4, 'A slide in the wall to the south, and a stair down at the east end. The lower floor runs back west under this one.');
    M.trigger(7, 5, 3, 1, function* (E) { yield E.say('A slide, and no telling where it lets out. The stair first: whatever is on the lower floor will still be there, and what is down the slide may not let us back.', 'Kraden'); }, { once: 'ml_vs_seen' });
  });
  // ====================== the dragon's gallery: the head on the wall makes its way along, and the way must be cleared before it arrives ======================
  // Pound the two rocks, cross the ice by the northern way (RDRUR), Pound the two cones, and stand on the circle
  const TM = grid(30, 12, '#');
  fill(TM, 2, 3, 5, 6, '.'); fill(TM, 6, 6, 7, 6, '.'); fill(TM, 8, 3, 17, 7, 'b'); fill(TM, 18, 3, 18, 3, '.'); fill(TM, 19, 2, 27, 6, '.'); fill(TM, 19, 7, 21, 9, '.'); fill(TM, 2, 1, 27, 1, '.');
  room('ml_timer', 'Mars Lighthouse - Dragon Gallery', TM, { x: 2, y: 4 }, [], (M) => {
    M.setObj(1, 4, 'jl_slide'); M.set(1, 4, FL());
    rock(M, 'ml_tm_rock1', 6, 6); rock(M, 'ml_tm_rock2', 7, 6); for (let x = 2; x <= 27; x++) M.block(x, 1);
    for (const [x, y] of [[8, 3], [14, 3], [13, 4], [12, 5], [12, 6], [14, 6], [17, 7]]) stop(M, x, y);   // the field, RDRUR from (7,6) to (18,3)
    cone(M, 'ml_tm_cone1', 19, 3); cone(M, 'ml_tm_cone2', 20, 3);
    circle(M, 'ml_circle_e', 26, 4, { map: 'ml_jump', x: 2, y: 2, dir: DIR.DOWN });
    // the corridor behind the circle: the statue in it is shoved into the lane of the flame that guards the far side
    statue(M, 'ml_tm_statue', 20, 9);
    M.object('statue', 27, 9, { id: 'ml_tm_head2', tile: 'ml_head_lit' });
    for (let x = 22; x <= 26; x++) { M.set(x, 9, FL()); M.setObj(x, 9, null); M.walkable(x, 9); }
    // the head's way along the north wall: from the east end to the west; at the west end it breathes, and the party is thrown back to the slide's foot
    const wipe = function* (E) { Audio.sfx('boom'); Engine.doShake(20); Engine.doFlash(12, '#ffa040'); yield E.say('(The head reaches the end of the wall and roars - a wall of fire fills the gallery!)'); yield Engine.fadeOut(10); E.warpNow('ml_timer', 2, 4, DIR.RIGHT); yield Engine.fadeIn(10); };
    M.object('tornado', 27, 1, { id: 'ml_tm_dragon', tile: 'ml_head_lit', oneway: true, sx: 27, sy: 1, dx: -1, dy: 0, x0: 2, x1: 27, speed: 100, ghost: true, onEnd: wipe, active: () => !!G.field.mlTimer && !G.flag('ml_timer_done') });   // 26 cells at 100 frames: some forty seconds
    M.trigger(2, 3, 2, 4, function* (E) { if (G.field.mlTimer) return; G.field.mlTimer = true; Audio.sfx('quake'); Engine.doShake(8); yield E.say('(Stone grinds overhead: a dragon\'s head, alight, begins to crawl along the wall from the far end - toward this one.)'); yield E.say('It is coming this way, and it is not coming to talk. Rocks, ice, cones - clear the way to that circle and go, before it gets here!', 'Kraden'); }, { cond: () => !G.field.mlTimer && !G.flag('ml_timer_done') });
    M.sign(3, 6, 'The dragon\'s gallery. The head at the far end of the wall is not fixed there.');
  });
  // ====================== the jumps: the Sol Blade, and the way left to the dragons ======================
  const JP = grid(16, 14, 'p');
  fill(JP, 0, 0, 15, 0, '#'); fill(JP, 0, 13, 15, 13, '#'); fill(JP, 0, 0, 0, 13, '#'); fill(JP, 15, 0, 15, 13, '#');
  JP[2][2] = '.'; JP[3][2] = 'g'; JP[4][2] = '.'; JP[5][2] = 'g'; JP[6][2] = '.'; JP[7][2] = 'g'; fill(JP, 2, 8, 8, 8, '.'); JP[7][8] = 'g'; JP[6][8] = '.';
  JP[6][9] = 'g'; JP[6][10] = '.'; JP[6][11] = 'g'; JP[6][12] = '.'; JP[5][12] = 'g'; JP[4][12] = '.'; JP[3][12] = 'g'; JP[2][12] = '.'; JP[2][13] = '.';
  JP[9][2] = 'g'; JP[10][2] = '.'; JP[11][2] = '.';
  room('ml_jump', 'Mars Lighthouse - Pillared Chasm', JP, { x: 2, y: 2 }, [], (M) => {
    G.set('ml_timer_done'); if (G.field) G.field.mlTimer = false;
    circle(M, 'ml_circle_f', 2, 2, { map: 'ml_timer', x: 26, y: 4, dir: DIR.DOWN });
    // the flame that guards the arrival: the head in the gallery's corridor breathes across the first pillar unless the statue stands in its way
    fireball(M, 'ml_jp_fire', 5, 2, 2, 2, 5, flung('ml_timer', 26, 5, DIR.DOWN, '(The party has scarcely arrived when fire pours over the pillar - and the circle flings them back where they came from!)'), () => { const st = G.get('obj:ml_timer:statue_move:ml_tm_statue'); return !(st && st.y === 9 && st.x >= 22 && st.x <= 26); });
    M.chest(13, 2, 'Sol Blade', 1);
    door(M, 2, 12, 'ml_dragons', 10, 12, DIR.DOWN);
    M.sign(3, 9, 'Pillars over a chasm. The one at the top right holds a chest; the way down at the bottom left leads on.');
  });
  // ====================== the dragons frozen in ice, the star, the northern dragon ======================
  const DG = grid(22, 14, '#');
  fill(DG, 2, 2, 19, 11, '.');
  room('ml_dragons', 'Mars Lighthouse - Frozen Hall', DG, { x: 10, y: 12 }, [], (M) => {
    door(M, 10, 13, 'ml_jump', 2, 11, DIR.DOWN);
    // the two dragons under the ice: Blaze thins it, Burst breaks it, and they wake
    if (!G.flag('flame_dragons_done')) {
      if (!G.flag('ml_dragons_blazed')) { for (const [x, y] of [[8, 5], [9, 5], [12, 5], [13, 5], [8, 6], [13, 6]]) M.setObj(x, y, 'ml_ice'); M.object('burnable', 10, 5, { id: 'ml_dragons_ice', look: 'ml_ice', onBurn: function* (E) { G.set('ml_dragons_blazed'); Audio.sfx('fire'); yield E.say('The fire thins the ice: two shapes stand in it, wings folded, and the ice about them is cracked through - Burst would do the rest.'); const Mp = G.field.map; for (const [x, y] of [[8, 5], [9, 5], [12, 5], [13, 5], [8, 6], [13, 6]]) { Mp.setObj(x, y, null); } Mp.objects.push({ kind: 'crack', x: 10, y: 5, id: 'ml_dragons_crack', key: Mp.id + ':crack:ml_dragons_crack', tile: 'ml_sheet_cracked', onBurst: T3.flameDragons }); Mp.finalize(); } }); M.setObj(11, 5, 'ml_ice'); M.object('spot', 11, 5, { id: 'ml_dragons_ice2', tile: 'ml_ice' }); }
      else { M.object('crack', 10, 5, { id: 'ml_dragons_crack', tile: 'ml_sheet_cracked', onBurst: T3.flameDragons }); M.setObj(11, 5, 'ml_ice'); M.object('spot', 11, 5, { id: 'ml_dragons_ice2', tile: 'ml_ice' }); }
      M.trigger(9, 8, 4, 1, function* (E) { yield E.say('Two dragons... frozen in a block of ice, in the middle of the hall.', 'Jenna'); yield E.say('Yellow dragons, of the kind we fought on Jupiter\'s aerie. Blaze on the ice, then Burst - if we mean to pass, they must be dealt with.', 'Kraden'); }, { once: 'ml_dragons_seen' });
    }
    else if (!G.flag('agatio_karst_gone')) {
      M.npc('AgatioF', 9, 6, { look: NPC_LOOKS.Agatio, name: 'Agatio', text: () => G.flag('mars_star') ? "It's too late for us now... Hurry, light the beacon." : "Felix, you must complete our quest... Please... You have to light the beacon...", mind: "I'm so tired... A fog is rising before my eyes... No! Can't die until the beacon... is lit..." });
      M.npc('KarstF', 12, 6, { look: NPC_LOOKS.Karst, name: 'Karst', text: () => G.flag('mars_star') ? "Your hands... so warm... People have such warm hands... I had forgotten..." : "We can't even stand... We're in no condition to go on. Light the beacon for us... Please.", mind: "I'm so cold, colder than I ever thought possible... All because Mars Lighthouse remains unlit... I have to stay alive... long enough to see its light..." });
      if (!G.flag('mars_star')) M.object('spot', 10, 7, { id: 'ml_mars_star', tile: 'elem_mars', script: function* (E) { if (G.flag('mars_star')) return; G.set('mars_star'); yield E.give('Mars Star'); const o = G.field.map.objects.find(ob => ob.id === 'ml_mars_star'); if (o) o.gone = true; yield E.say('(The party takes up the Mars Star. From the north wall, a voice like stone grinding on stone:)'); yield E.say("You who holds the star, open your heart and listen... If you wish to reach the heavens, give your star to me.", 'Dragon'); } });
    }
    // the northern dragon: it takes the star, and the tower warms
    M.object('statue', 10, 2, { id: 'ml_north_dragon', tile: 'ml_head', script: T3.northernDragon }); M.object('statue', 11, 2, { id: 'ml_north_dragon2', tile: 'ml_head', script: T3.northernDragon });
    if (thawed()) for (const [x, y] of [[2, 10], [3, 11], [2, 11], [19, 10], [18, 11], [19, 11]]) { M.set(x, y, 'ml_lava'); M.setObj(x, y, null); }
  });
  // ====================== the room of four spirits ======================
  const SP = grid(24, 16, '#');
  fill(SP, 2, 2, 21, 13, '.');
  room('ml_spirits', 'Mars Lighthouse - Hall of Four Spirits', SP, { x: 12, y: 14 }, [], (M) => {
    door(M, 12, 15, 'ml_hall', 14, 5, DIR.DOWN); M.setObj(12, 14, 'stairs_down');
    // the great dragon at the north wall, and the four claws before it
    M.object('statue', 11, 1, { id: 'ml_great_dragon', tile: 'ml_head', script: T3.greatDragon }); M.object('statue', 12, 1, { id: 'ml_great_dragon2', tile: 'ml_head', script: T3.greatDragon });
    const claws = [['jupiter', 8, 4], ['mercury', 10, 4], ['mars', 13, 4], ['venus', 15, 4]];
    for (const [el, x, y] of claws) M.object('statue', x, y, { id: 'ml_claw_' + el, tile: G.flag('ml_beacon_' + el) ? 'ml_claw_lit' : 'ml_claw' });
    // the spirits on the walls, their words, and the doors that open beside them for the one who holds the star
    const spirits = [['bird', 'wind', 2, 4, 1, 4, 'Bird... On the wings of truth, they ruled the winds.', 'ml_wind1', 12, 12], ['fish', 'water', 2, 11, 1, 11, 'Fish... With cold courage, they ruled the water.', 'ml_water1', 13, 8], ['dragon', 'fire', 21, 4, 22, 4, 'Dragons... Burning with might, they ruled the fires.', 'ml_fire_out0', 2, 5], ['human', 'earth', 21, 11, 22, 11, 'Mankind... With the power of wisdom, they ruled the earth.', 'ml_earth1', 10, 8]];
    for (const [sp, el, sx, sy, dx, dy, words, to, tx, ty] of spirits) {
      M.setObj(dx, dy - 1, 'ml_spirit_' + sp); M.sign(sx, dy + 1, words);
      if (marsStar()) door(M, dx, dy, to, tx, ty, dx < 12 ? DIR.LEFT : DIR.RIGHT);
    }
    if (G.flag('ml_aerie_open')) circle(M, 'ml_circle_g', 12, 8, { map: 'ml_aerie_out', x: 7, y: 15, dir: DIR.UP });
    if (thawed()) for (const [x, y] of [[2, 13], [3, 13], [21, 13], [20, 13]]) { M.set(x, y, 'ml_lava'); M.setObj(x, y, null); }
    M.sign(4, 13, 'The hall of the four spirits: fish, mankind, bird and dragon on the walls, and the great dragon before the north wall.');
    M.trigger(11, 12, 3, 1, T3.spiritsEnter, { once: 'ml_spirits_seen' });
  });
  // ====================== the wind tower ======================
  // the lower floor and the swirl up; on the ledge the six blocks under Reveal, the hover over the gap, the hidden stones
  const WD = grid(24, 14, '#');
  fill(WD, 2, 8, 21, 11, '.'); fill(WD, 2, 2, 21, 5, '.'); fill(WD, 15, 3, 17, 4, 'g');
  room('ml_wind1', 'Mars Lighthouse - Wind Tower', WD, { x: 12, y: 12 }, ENC_HIGH, (M) => {
    door(M, 12, 12, 'ml_spirits', 2, 4, DIR.DOWN);
    // the swirls: Cyclone on one lifts the party to the ledge, on the other lets them down
    M.object('windstone', 3, 10, { id: 'ml_wd_swirl_up', tile: 'jl_tp', onWind: function* (E) { Audio.sfx('wind'); Engine.doShake(6); yield E.say('(Cyclone spins the swirl, and the wind lifts the party up onto the ledge!)'); yield Engine.fadeOut(8); E.warpNow('ml_wind1', 3, 4, DIR.RIGHT); yield Engine.fadeIn(8); } });
    M.object('windstone', 3, 3, { id: 'ml_wd_swirl_down', tile: 'jl_tp', onWind: function* (E) { Audio.sfx('wind'); yield E.say('(The swirl spins the other way, and the party is set down on the floor below.)'); yield Engine.fadeOut(8); E.warpNow('ml_wind1', 3, 9, DIR.DOWN); yield Engine.fadeIn(8); } });
    // the six blocks across the ledge: under Reveal they are seen for the brush they are, and Cyclone clears them
    for (const [i, [x, y]] of [[7, 2], [7, 3], [7, 4], [7, 5], [8, 3], [8, 4]].entries()) M.object('leaves', x, y, { id: 'ml_wd_block' + i, tile: 'block_grey_hover', hiddenUntilReveal: false, onClear: function* (E) { yield E.say('(The wind scatters the block into leaves and dust.)'); } });
    M.trigger(5, 2, 1, 4, function* (E) { yield E.say('Blocks of stone across the ledge, shoulder to shoulder... Or are they? Sheba - Reveal.', 'Kraden'); yield E.say('(Under Reveal the blocks shimmer: brush and dead leaves packed to look like stone. Cyclone will have them.)'); }, { once: 'ml_wd_blocks_seen' });
    // the statue on the ledge is shoved onto the panel, and the panel wakes: Hover from it carries the party over the gap
    M.set(12, 3, 'elem_jupiter');
    statue(M, 'ml_wd_statue', 10, 4, { onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ml_wd_statue'); if (o && o.x === 12 && o.y === 3 && !G.flag('ml_wd_pad')) { G.set('ml_wd_pad'); Audio.sfx('psy'); yield E.say('The statue settles on the panel - and the panel beside it glows violet. A hover panel!'); const Mp = G.field.map; Mp.objects.push({ kind: 'hoverpad', x: 13, y: 4, id: 'ml_wd_pad', key: Mp.id + ':hoverpad:ml_wd_pad' }); Mp.set(13, 4, 'elem_jupiter'); Mp.finalize(); } } });
    const pad = () => { const st = G.get('obj:ml_wind1:statue_move:ml_wd_statue'); return !!(st && st.x === 12 && st.y === 3) || G.flag('ml_wd_pad'); };
    if (pad()) { G.set('ml_wd_pad'); M.object('hoverpad', 13, 4, { id: 'ml_wd_pad' }); M.set(13, 4, 'elem_jupiter'); }
    for (let x = 15; x <= 17; x++) for (let y = 3; y <= 4; y++) M.object('gap', x, y, { id: 'ml_wd_gap_' + x + '_' + y });
    M.def.fall = { map: 'ml_wind1', x: 12, y: 9 };
    // beyond the gap: the flame across the ledge's end, the Psy Crystal, and the hidden stones out to the face
    M.object('statue', 21, 2, { id: 'ml_wd_head', tile: 'ml_head_lit' }); fireball(M, 'ml_wd_fire', 20, 2, 18, 2, 8, flung('ml_wind1', 12, 9, DIR.UP, '(The fire catches the party on the ledge and pitches them off it to the floor below!)'));
    M.chest(19, 5, 'Psy Crystal', 1);
    for (const [x, y] of [[21, 5], [22, 5]]) { M.set(x, y, 'lh_pit'); M.hidden.push({ x, y, tile: FL() }); }
    door(M, 23, 5, 'ml_wind_out', 1, 4, DIR.RIGHT);
    M.sign(3, 8, 'The wind tower. A swirl in the floor, and a ledge above it that runs east to a gap.');
  });
  const WO = grid(12, 8, 'S'); fill(WO, 1, 2, 9, 5, 'P');
  room('ml_wind_out', 'Mars Lighthouse - Windward Face', WO, { x: 2, y: 4 }, [], (M) => {
    door(M, 0, 4, 'ml_wind1', 22, 5, DIR.LEFT);
    M.object('torch', 8, 1, { id: 'ml_wd_flame', tile: 'ml_claw', litTile: 'ml_claw_lit', state: G.flag('ml_beacon_jupiter') ? 'lit' : null, onLit: function* (E) { G.set('ml_beacon_jupiter'); Audio.sfx('beacon'); Engine.doFlash(15, '#c090ff'); yield E.say('The violet flame roars up - and far below, in the hall of spirits, a claw catches fire. The bird is set aflame!'); } });
    circle(M, 'ml_circle_wo', 2, 5, { map: 'ml_spirits', x: 12, y: 8, dir: DIR.DOWN });
    M.sign(4, 5, 'The windward face. A brazier shaped like a claw stands at the edge; a circle of red stone leads back down.');
  });
  // ====================== the water tower ======================
  const WT = [
    '################',
    '#bBbBrbbbbbbb.##',
    '#bbbbbbbrbbbb###',
    '#rrbbbbbbbbbr###',
    '#bbbbbrbbbBbbb.#',
    '#brbbbbbbbbbb###',
    '#bbrbrbrBbbbb###',
    '#rbbbbbbBbbbb.##',
    '################',
  ].map(r => r.split('').map(ch => ch === 'r' || ch === 'B' ? 'b' : ch));
  const WT_ROCKS = [[5, 1], [8, 2], [1, 3], [2, 3], [12, 3], [6, 4], [2, 5], [3, 6], [5, 6], [7, 6], [1, 7]];
  const WT_BERGS = [[2, 1], [4, 1], [10, 4], [8, 6], [8, 7]];
  room('ml_water1', 'Mars Lighthouse - Water Tower', WT, { x: 13, y: 7 }, ENC_HIGH, (M) => {
    door(M, 14, 7, 'ml_spirits', 2, 11, DIR.RIGHT);
    door(M, 14, 1, 'ml_water2', 7, 10, DIR.RIGHT);
    for (const [x, y] of WT_ROCKS) stop(M, x, y);
    // the icebergs: stoppers too, until the head's fire takes them
    if (!G.flag('ml_wt_melted')) for (const [x, y] of WT_BERGS) M.object('pillar', x, y, { id: 'ml_wt_berg_' + x + '_' + y, tile: 'ml_ice', fixed: true, poundable: false });
    // the frozen pool at the east side: it drains when the pipes run, and the head behind it can be reached
    if (G.flag('ml_pipes_fixed')) { M.set(13, 4, FL()); M.setObj(13, 4, null); M.walkable(13, 4); }
    else { M.set(13, 4, 'ml_ice'); M.setObj(13, 4, 'ml_ice'); }
    head(M, 'ml_wt_head', 14, 4, function* (E) { G.set('ml_wt_melted'); Audio.sfx('fire'); Engine.doShake(8); yield E.say('The head breathes across the hall, and the icebergs on the black ice steam away to nothing - the field is changed!'); const Mp = G.field.map; for (const o of Mp.objects) if (/ml_wt_berg/.test(o.id)) o.gone = true; });
    door(M, 0, 1, 'ml_water_out', 8, 4, DIR.LEFT);
    M.sign(13, 6, 'Black ice fills the tower\'s floor. A door at the top of the east wall, a frozen pool below it, and the way out at the far north-west corner.');
    M.trigger(13, 6, 1, 2, function* (E) { yield E.say('More black ice, and icebergs in it as well as rocks. The door to the north-east first; the pool below it is frozen over, and I would guess the pipes beyond have something to do with that.', 'Kraden'); }, { once: 'ml_wt_seen' });
  });
  // the pipes: the two puddles frozen make the stops the sliding pipes need
  const WP = grid(14, 12, '#'); fill(WP, 1, 1, 12, 10, '.'); WP[2][7] = 'u'; WP[5][6] = 'u';
  room('ml_water2', 'Mars Lighthouse - Pipe Room', WP, { x: 7, y: 10 }, [], (M) => {
    door(M, 7, 11, 'ml_water1', 13, 1, DIR.DOWN);
    M.object('puddle', 7, 2, { id: 'ml_wp_pud1' }); M.object('puddle', 6, 5, { id: 'ml_wp_pud2' });
    M.set(9, 6, FL()); M.setObj(9, 6, 'ml_rock'); M.block(9, 6);
    for (const [x, y] of [[7, 3], [5, 5], [9, 7]]) M.set(x, y, 'elem_mercury');   // the seats
    const seated = () => { const at = (id) => G.get('obj:ml_water2:pillar:' + id); const a = at('ml_wp_ph1'), b = at('ml_wp_pv'), c = at('ml_wp_ph2'); return a && a.x === 7 && a.y === 3 && b && b.x === 5 && b.y === 5 && c && c.x === 9 && c.y === 7; };
    const check = function* (E) { if (G.flag('ml_pipes_fixed') || !seated()) return; G.set('ml_pipes_fixed'); Audio.sfx('water'); yield E.say('The last pipe seats itself with a clang, and water runs the length of the line - down through the wall. Below, in the tower, the frozen pool cracks and drains away.'); };
    M.object('pillar', 7, 6, { id: 'ml_wp_ph1', tile: 'pipe_h', slides: true, poundable: false, onMove: check });
    M.object('pillar', 2, 5, { id: 'ml_wp_pv', tile: 'pipe_v', slides: true, poundable: false, onMove: check });
    M.object('pillar', 9, 9, { id: 'ml_wp_ph2', tile: 'pipe_h', slides: true, poundable: false, onMove: check });
    M.sign(2, 10, "'Freeze what lies in the pipes' way, and shove them home: the line is three, and the water knows its seats.'");
    M.trigger(6, 9, 3, 1, function* (E) { yield E.say('A pipeline in pieces, and the floor under them ice - shove one and it will slide until something stops it. The puddles, Mia: Frost them where a pipe should stop.', 'Kraden'); }, { once: 'ml_wp_seen' });
  });
  const WTO = grid(12, 8, 'S'); fill(WTO, 2, 2, 10, 5, 'P');
  room('ml_water_out', 'Mars Lighthouse - Seaward Face', WTO, { x: 8, y: 4 }, [], (M) => {
    door(M, 11, 4, 'ml_water1', 1, 1, DIR.RIGHT);
    M.object('torch', 3, 1, { id: 'ml_wt_flame', tile: 'ml_claw', litTile: 'ml_claw_lit', state: G.flag('ml_beacon_mercury') ? 'lit' : null, onLit: function* (E) { G.set('ml_beacon_mercury'); Audio.sfx('beacon'); Engine.doFlash(15, '#60c0ff'); yield E.say('The blue flame leaps up - and in the hall of spirits a second claw catches. The fish is set aflame!'); } });
    circle(M, 'ml_circle_wto', 9, 5, { map: 'ml_spirits', x: 12, y: 8, dir: DIR.DOWN });
  });
  // ====================== the fire tower ======================
  const FO0 = grid(14, 8, 'S'); fill(FO0, 1, 2, 12, 5, 'P');
  room('ml_fire_out0', 'Mars Lighthouse - Fire Tower Landing', FO0, { x: 2, y: 5 }, [], (M) => {
    door(M, 0, 5, 'ml_spirits', 21, 4, DIR.LEFT); door(M, 6, 1, 'ml_fire1', 12, 12, DIR.UP);
    M.chest(12, 5, "Alastor's Hood", 1);   // the far right corner outside the dragon tower
    M.sign(3, 3, 'The landing outside the dragon tower. Something glints in the far corner.');
  });
  const FR = grid(24, 14, '#');
  fill(FR, 2, 9, 21, 12, '.'); fill(FR, 2, 4, 10, 7, '.'); fill(FR, 12, 4, 21, 7, '.'); FR[4][11] = '.'; fill(FR, 2, 1, 21, 2, '.');
  room('ml_fire1', 'Mars Lighthouse - Dragon Tower', FR, { x: 12, y: 12 }, ENC_HIGH, (M) => {
    door(M, 12, 13, 'ml_fire_out0', 6, 2, DIR.DOWN);
    // the two cracked walls between the entry corridor and the upper halves
    for (const [i, x] of [6, 16].entries()) { if (G.flag('ml_fr_wall' + i)) { M.set(x, 8, FL()); M.setObj(x, 8, null); M.walkable(x, 8); } else { M.set(x, 8, FL()); M.setObj(x, 8, null); M.object('crack', x, 8, { id: 'ml_fr_crack' + i, tile: 'ml_wall_cracked', onBurst: function* (E) { G.set('ml_fr_wall' + i); persistTile(G.field.map, x, 8, FL()); yield E.say('The cracked wall bursts inward. A way up.'); } }); } }
    // the button in the top-left corner wakes the torch across the room; its fire cracks the center wall
    M.set(3, 4, 'jl_button');
    M.trigger(3, 4, 1, 1, function* (E) { if (G.flag('ml_fr_button')) return; G.set('ml_fr_button'); Audio.sfx('push'); yield E.say('The button sinks under the party\'s feet. Across the room, oil runs into the torch\'s bowl with a gurgle.'); }, { cond: () => !G.flag('ml_fr_button') });
    M.object('torch', 20, 3, { id: 'ml_fr_torch', tile: 'ml_claw', litTile: 'ml_claw_lit', state: G.flag('ml_fr_torch') ? 'lit' : null, onLit: function* (E) { if (!G.flag('ml_fr_button')) { const o = G.field.map.objects.find(ob => ob.id === 'ml_fr_torch'); if (o) { o.state = null; G.set('obj:' + o.key, { state: null }); } yield E.say('(The flame flickers and dies: there is no oil in the bowl.)'); return; } G.set('ml_fr_torch'); Audio.sfx('fire'); Engine.doShake(8); const Mp = G.field.map; for (const ob of Mp.objects) if (ob.id === 'ml_fr_center_wall') ob.gone = true; Mp.objects.push({ kind: 'crack', x: 11, y: 3, id: 'ml_fr_crack_c', key: Mp.id + ':crack:ml_fr_crack_c', tile: 'ml_wall_cracked', onBurst: function* (E2) { G.set('ml_fr_center'); persistTile(G.field.map, 11, 3, FL()); yield E2.say('The center section bursts. Beyond it a corridor runs the width of the tower, and a stair at its west end.'); } }); Mp.finalize(); yield E.say('The torch flares - and its fire runs along the wall like a fuse to the center section, which cracks from top to bottom!'); } });
    M.trigger(19, 4, 2, 1, function* (E) { yield E.say('A torch in a bowl - dry. Nothing for Blaze to take.', 'Jenna'); }, { once: 'ml_fr_torch_seen', cond: () => !G.flag('ml_fr_button') });
    // the center section: the top corridor's only door
    if (G.flag('ml_fr_center')) { M.set(11, 3, FL()); M.setObj(11, 3, null); M.walkable(11, 3); }
    else if (G.flag('ml_fr_torch')) M.object('crack', 11, 3, { id: 'ml_fr_crack_c', tile: 'ml_wall_cracked', onBurst: function* (E) { G.set('ml_fr_center'); persistTile(G.field.map, 11, 3, FL()); yield E.say('The center section bursts. Beyond it a corridor runs the width of the tower, and a stair at its west end.'); } });
    else M.object('spot', 11, 3, { id: 'ml_fr_center_wall', tile: 'ml_wall' });
    M.set(11, 3, FL()); if (!G.flag('ml_fr_center')) M.setObj(11, 3, null);
    stairs(M, 2, 1, 'ml_fire2', 2, 2, false);
    M.sign(4, 11, 'The dragon tower. Two cracked sections in the wall above, and the sound of oil somewhere in the stone.');
  });
  const FR2 = grid(20, 12, '#');
  fill(FR2, 2, 2, 17, 4, '.'); fill(FR2, 6, 5, 6, 7, '.'); FR2[7][7] = '.'; fill(FR2, 2, 8, 17, 9, '.'); fill(FR2, 15, 5, 17, 7, '.'); fill(FR2, 8, 6, 14, 6, '.'); fill(FR2, 12, 7, 12, 7, '.');
  room('ml_fire2', 'Mars Lighthouse - Pipe Gallery', FR2, { x: 2, y: 2 }, ENC_HIGH, (M) => {
    stairs(M, 2, 1, 'ml_fire1', 2, 2, true);
    // the first pipe stands across the corridor down; shoved up into its line it feeds the head, and the way is open
    M.set(7, 7, 'elem_mars');
    M.object('pillar', 6, 7, { id: 'ml_f2_pipe1', tile: 'pipe_v', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ml_f2_pipe1'); if (o && o.x === 7 && o.y === 7 && !G.flag('ml_f2_fed')) { G.set('ml_f2_fed'); Audio.sfx('fire'); yield E.say('The pipe joins the line with a clang - and at the east end of the gallery a dragon\'s head coughs and begins to breathe fire down the lower way.'); } } });
    const fed = () => { const o = G.get('obj:ml_fire2:pillar:ml_f2_pipe1'); return !!(o && o.x === 7 && o.y === 7); };
    M.object('statue', 18, 6, { id: 'ml_f2_head', tile: 'ml_head_lit' });
    const blocked = () => { const st = G.get('obj:ml_fire2:statue_move:ml_f2_statue'); return !!(st && st.y === 6 && st.x >= 13 && st.x <= 17); };
    fireball(M, 'ml_f2_fire', 17, 6, 8, 6, 6, flung('ml_fire2', 2, 2, DIR.DOWN), () => fed() && !blocked());
    statue(M, 'ml_f2_statue', 16, 4);   // shoved down twice from the corridor above, it stands in the head's mouth
    // the lower way: the second pipe blocks the way out; shoved aside, the line breaks and the head runs dry
    M.object('pillar', 10, 9, { id: 'ml_f2_pipe2', tile: 'pipe_h', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ml_f2_pipe2'); if (o && !(o.x === 10 && o.y === 9) && !G.flag('ml_f2_dry')) { G.set('ml_f2_dry'); yield E.say('The pipe grinds out of its seat, and the line is broken: the head\'s fire gutters and dies.'); } } });
    door(M, 10, 10, 'ml_fire_out', 6, 2, DIR.DOWN, { cond: () => { const o = G.get('obj:ml_fire2:pillar:ml_f2_pipe2'); return !!(o && !(o.x === 10 && o.y === 9)); } });
    M.sign(3, 3, 'The pipe gallery. A pipe stands in the way down, with its seat beside it; the corridor to the east ends over the lower way, where a dragon\'s head faces west.');
    M.trigger(4, 2, 1, 3, function* (E) { yield E.say('A pipe right in the way down, and a socket beside it. Shove it in - though I would not swear the line it joins is harmless.', 'Kraden'); }, { once: 'ml_f2_seen' });
  });
  const FO = grid(12, 8, 'S'); fill(FO, 2, 2, 10, 5, 'P');
  room('ml_fire_out', 'Mars Lighthouse - Dragon Face', FO, { x: 6, y: 2 }, [], (M) => {
    door(M, 6, 1, 'ml_fire2', 10, 9, DIR.UP);
    M.object('torch', 9, 4, { id: 'ml_fr_flame', tile: 'ml_claw', litTile: 'ml_claw_lit', state: G.flag('ml_beacon_mars') ? 'lit' : null, onLit: function* (E) { G.set('ml_beacon_mars'); Audio.sfx('beacon'); Engine.doFlash(15, '#ff6040'); yield E.say('The red flame roars - and in the hall of spirits a third claw catches. The dragon is set aflame!'); } });
    circle(M, 'ml_circle_fo', 3, 4, { map: 'ml_spirits', x: 12, y: 8, dir: DIR.DOWN });
  });
  // ====================== the earth tower ======================
  const ER1 = grid(20, 10, '#'); fill(ER1, 2, 3, 17, 7, '.');
  room('ml_earth1', 'Mars Lighthouse - Earth Tower', ER1, { x: 10, y: 8 }, ENC_HIGH, (M) => {
    door(M, 10, 9, 'ml_spirits', 21, 11, DIR.DOWN);
    // three statues against the north wall: only the rightmost hides a doorway; the others are traps
    const trap = function* (E) { Audio.sfx('boom'); Engine.doShake(10); const r = yield* E.ambush(['Minos Warrior', 'Minos Warrior'], { canFlee: false }, { say: 'The statue grinds aside - and the floor under it gives! Two Minos Warriors drop from the dark above.' }); if (r !== 'win') return; };
    statue(M, 'ml_e1_statue_l', 4, 3, { onMove: trap }); statue(M, 'ml_e1_statue_m', 10, 3, { onMove: trap });
    statue(M, 'ml_e1_statue_r', 16, 3, { onMove: function* (E) { if (G.flag('ml_e1_open')) return; G.set('ml_e1_open'); Audio.sfx('push'); yield E.say('The statue slides aside, and a doorway stands in the wall behind where it stood.'); const Mp = G.field.map; Mp.setObj(16, 2, 'door_stone'); Mp.set(16, 2, FL()); Mp.walkable(16, 2); Mp.finalize(); } });
    if (G.flag('ml_e1_open')) door(M, 16, 2, 'ml_earth2', 10, 8, DIR.UP); else M.exit(16, 2, 1, 1, 'ml_earth2', 10, 8, DIR.UP, { door: true, cond: () => G.flag('ml_e1_open') });
    M.sign(3, 7, "'Three keep the door. Two keep it with their teeth.'");
    M.trigger(9, 6, 3, 1, function* (E) { yield E.say('Three statues, and the wall behind them blank. One of them hides the way on - and I would not care to find out which by shoving them all.', 'Piers'); yield E.say('Mankind ruled the earth with wisdom, the wall says. Then think: the doorway was cut on the right hand, where a man would set it.', 'Kraden'); }, { once: 'ml_e1_seen' });
  });
  // the second hall: the left statue's door, the gap, the two stones carried into the pits, the stone shoved into the flame
  const ER2 = grid(24, 12, '#');
  fill(ER2, 2, 6, 21, 9, '.'); fill(ER2, 2, 2, 16, 4, '.'); fill(ER2, 17, 4, 21, 4, '.'); fill(ER2, 5, 2, 6, 4, 'p'); fill(ER2, 14, 2, 15, 4, 'p'); fill(ER2, 5, 3, 6, 3, 'g'); fill(ER2, 14, 3, 15, 3, 'g');   // two-wide breaks: a stone in the first cell, a jump over the second
  room('ml_earth2', 'Mars Lighthouse - Hall of Statues', ER2, { x: 10, y: 8 }, ENC_HIGH, (M) => {
    door(M, 10, 10, 'ml_earth1', 16, 3, DIR.DOWN);
    const trap = function* (E) { Audio.sfx('boom'); Engine.doShake(10); const r = yield* E.ambush(['Aka Manah'], { canFlee: false }, { say: 'The statue grinds aside - and something drops from the dark above!' }); if (r !== 'win') return; };
    // only the leftmost statue on the lower floor's north wall hides the way; behind it the gap is jumped onto the upper ledge
    statue(M, 'ml_e2_statue_l', 3, 6, { onMove: function* (E) { if (G.flag('ml_e2_open')) return; G.set('ml_e2_open'); Audio.sfx('push'); yield E.say('The statue slides aside: a gap in the floor behind it, and the upper ledge beyond.'); const Mp = G.field.map; Mp.set(3, 5, 'lh_gap'); Mp.finalize(); } });
    statue(M, 'ml_e2_statue_m', 10, 6, { onMove: trap }); statue(M, 'ml_e2_statue_r', 17, 6, { onMove: trap });
    if (G.flag('ml_e2_open')) M.set(3, 5, 'lh_gap'); else { M.set(3, 5, 'ml_walltop'); M.block(3, 5); }
    // the two pits in the upper ledge: a carried stone in each makes the way; the stones lie at the ledge's west end
    for (const [i, [x, y]] of [[3, 3], [4, 3]].entries()) M.object('carriable', x, y, { id: 'ml_e2_stone' + i, tile: 'ml_rock' });
    // the flame across the ledge's east end, and the stone shoved along the ledge to the head's mouth
    M.object('statue', 22, 4, { id: 'ml_e2_head', tile: 'ml_head_lit' });
    fireball(M, 'ml_e2_fire', 21, 4, 17, 4, 7, flung('ml_earth2', 10, 8, DIR.UP, '(The fire sweeps the ledge and throws the party down to the floor below!)'));
    M.object('pillar', 17, 4, { id: 'ml_e2_block', tile: 'ml_rock', poundable: false });   // shoved east along the ledge's end into the head's mouth
    door(M, 20, 3, 'ml_earth3', 2, 2, DIR.UP);
    M.sign(4, 9, 'The hall of statues. Three more against the north wall; the ledge above runs east, is broken twice, and ends under a dragon\'s head.');
    M.trigger(8, 8, 4, 1, function* (E) { yield E.say('Three again... And this hall was cut by the same hand: on the left this time, I would say. Behind it, a jump, and two gaps in the ledge to fill - Carry, Felix.', 'Kraden'); }, { once: 'ml_e2_seen' });
  });
  // the rope, the statue shoved down, the sand under the flame
  const ER3 = grid(24, 14, 'S');
  fill(ER3, 1, 1, 8, 3, 'P'); fill(ER3, 9, 2, 14, 2, 'R'); fill(ER3, 15, 1, 22, 3, 'P'); fill(ER3, 18, 4, 18, 9, 'P'); fill(ER3, 1, 10, 18, 10, 'P'); fill(ER3, 4, 10, 12, 10, 'q');
  room('ml_earth3', 'Mars Lighthouse - Earthen Face', ER3, { x: 2, y: 2 }, [], (M) => {
    door(M, 0, 2, 'ml_earth2', 20, 4, DIR.LEFT);
    M.trigger(8, 2, 1, 1, function* (E) { yield E.say('A rope over the drop, and nothing else. Steady, everyone - one at a time.', 'Jenna'); }, { once: 'ml_e3_rope_seen' });
    // the statue at the head of the way down: shoved down, it goes over the edge and the way is open
    statue(M, 'ml_e3_statue', 18, 4, { onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ml_e3_statue'); if (o && o.y >= 5) { o.gone = true; G.set('obj:' + o.key, { gone: true }); Audio.sfx('boom'); yield E.say('The statue topples off the ledge and is gone into the dark. The way down is clear.'); } } });
    // the lower way west under the head: the fire sweeps its whole length, and the soft sand along it is the party's refuge
    M.object('statue', 19, 10, { id: 'ml_e3_head', tile: 'ml_head_lit' });
    fireball(M, 'ml_e3_fire', 17, 10, 1, 10, 8, flung('ml_earth3', 18, 8, DIR.DOWN, '(Fire sweeps the way, and the party is thrown back up to the ledge!)'));
    door(M, 0, 10, 'ml_earth_out', 8, 4, DIR.LEFT);
    M.sign(19, 3, 'The earthen face. A head at the east end of the lower way, and the sand along that way soft enough to sink in.');
    M.trigger(18, 8, 1, 1, function* (E) { yield E.say('The way west runs the whole length under that head, and there is nowhere to stand aside. But the sand along it is soft... Sand, Felix - sink into it when the fire comes, and it will pass over.', 'Kraden'); }, { once: 'ml_e3_way_seen' });
  });
  const EO = grid(12, 8, 'S'); fill(EO, 2, 2, 10, 5, 'P');
  room('ml_earth_out', 'Mars Lighthouse - Earthen Ledge', EO, { x: 8, y: 4 }, [], (M) => {
    door(M, 11, 4, 'ml_earth3', 1, 10, DIR.RIGHT);
    M.object('torch', 3, 1, { id: 'ml_e_flame', tile: 'ml_claw', litTile: 'ml_claw_lit', state: G.flag('ml_beacon_venus') ? 'lit' : null, onLit: function* (E) { G.set('ml_beacon_venus'); Audio.sfx('beacon'); Engine.doFlash(15, '#e0c060'); yield E.say('The golden flame rises - and in the hall of spirits the last claw catches. Mankind is set aflame!'); } });
    circle(M, 'ml_circle_eo', 9, 5, { map: 'ml_spirits', x: 12, y: 8, dir: DIR.DOWN });
  });
  // ====================== the aerie's foot: the floating platforms ======================
  const AO = grid(16, 18, 'S');
  fill(AO, 6, 14, 9, 16, 'P'); for (const y of [12, 10, 8, 6, 4]) { fill(AO, 7, y, 8, y, 'P'); fill(AO, 7, y + 1, 8, y + 1, 'g'); } fill(AO, 5, 2, 10, 3, 'P');
  room('ml_aerie_out', 'Mars Lighthouse - Below the Aerie', AO, { x: 7, y: 15 }, [], (M) => {
    circle(M, 'ml_circle_h', 6, 15, { map: 'ml_spirits', x: 12, y: 8, dir: DIR.DOWN });
    door(M, 7, 1, 'ml_aerie', 12, 17, DIR.UP); M.setObj(8, 1, 'door_stone');
    M.sign(9, 15, 'Platforms hang in the storm over the drop, one above the next. The aerie is at the top of them.');
    M.trigger(6, 14, 4, 1, function* (E) { yield E.say('The top of the tower. The wind... it is a storm up here. And those platforms are the only way up.', 'Sheba'); yield E.say('This is the last of it. Whatever waits on the aerie - we go up together.', 'Felix'); }, { once: 'ml_ao_seen' });
  });
  // ====================== the aerie ======================
  const AE = grid(26, 20, '#');
  fill(AE, 3, 3, 22, 16, '.'); fill(AE, 11, 17, 13, 18, '.');
  room('ml_aerie', 'Mars Lighthouse - Aerie', AE, { x: 12, y: 17 }, [], (M) => {
    door(M, 12, 19, 'ml_aerie_out', 7, 2, DIR.DOWN);
    M.beacon(12, 7, 'mars', !!G.flag('mars_lit'));
    M.trigger(9, 12, 8, 1, T3.marsAerie, { once: 'ml_aerie_scene', cond: () => !G.flag('mars_lit') && !G.flag('ml_aerie_scene') });
    M.sign(4, 15, 'The aerie of Mars Lighthouse. The beacon\'s well lies at its heart, and the wind screams over it.');
  }, { music: 'lighthouse', bg: 'lighthouse', noEscape: true });
  // ====================== the epilogue's stages: the peak of Mt. Aleph, and the hill above Vale ======================
  const PK = grid(18, 16, '#'); fill(PK, 6, 2, 12, 13, '.'); fill(PK, 8, 1, 10, 1, '.');
  defineMap('mt_aleph_peak', { name: 'Mt. Aleph - Summit', w: 18, h: 16, base: 'void', music: 'villain', bg: 'cave', indoor: true, entry: { x: 9, y: 12 }, noEscape: true,
    build(M) { M.paint(0, 0, strs(PK), { '.': 'cave' }, { cliff: '#', set: 'greyrock', faces: 2 }); M.setObj(9, 1, 'psystone'); } });
  const VA = grid(24, 20, 'G'); fill(VA, 0, 0, 23, 0, 'T'); fill(VA, 0, 19, 23, 19, 'T'); fill(VA, 0, 0, 0, 19, 'T'); fill(VA, 23, 0, 23, 19, 'T'); fill(VA, 3, 1, 20, 5, 'C');
  for (const [x, y] of [[2, 8], [21, 9], [3, 14], [20, 15], [6, 18], [17, 18]]) VA[y][x] = 'T';
  defineMap('vale_after', { name: 'The Hill above Vale', w: 24, h: 20, base: 'grass', music: 'ending', bg: 'grass', entry: { x: 12, y: 14 }, noEscape: true,
    build(M) { M.paint(0, 0, strs(VA), { 'G': 'grass', 'T': { ground: 'grass', obj: 'tree' }, 'C': { ground: 'dirt', obj: 'rock_grass' } }); for (let x = 3; x <= 20; x++) for (let y = 1; y <= 5; y++) if ((x + y) % 3) M.setObj(x, y, null); M.setObj(11, 1, 'rock_grass'); M.setObj(12, 1, 'rock_grass'); M.sign(2, 12, 'The last hill before Vale.'); } });
}
