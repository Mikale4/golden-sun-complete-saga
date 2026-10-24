// ---------- Treasure Isle ----------
// After the rip (map references/golden-sun-the-lost-age-treasure-isle-gba-map.webp, eight screens up the island's
// spine), condensed, and the guide's optional-dungeon section (lines 9840-9960): the winding way in along the left
// wall (161 Coins, the Lucky Medal; the four chests of the side rooms are empty), the button, the spiky rock ground
// down; the pool with its stepping stones and the column shoved onto the switch; the hall of columns (the button,
// the rightmost rock, the climb and the tightrope to the Jester's Armlet, the column into the gap, the six chests
// beyond: 911 Coins, Sylph Feather, Rusty Axe, Psy Crystal, Star Dust, Cookie); the cave along the left wall to the
// Mimic and the stairs; the boulders that want Lift (Isaac's: the sea's monsters beyond them - Iris Robe), the room
// of boulders (Gale on the left, the Fire Brand on the right, the rest lifted for the way up), the last climb, and
// the Star Magician with his balls before Azul's tablet.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC_LOW = [['Stone Soldier'], ['Turtle Dragon'], ['Earth Golem'], ['Cannibal Ghoul', 'Cannibal Ghoul'], ['Harridan'], ['Horned Ghost', 'Horned Ghost']];
  const ENC_HIGH = [['Sea Hedgehog', 'Sea Hedgehog'], ['Great Seagull'], ['Pyrodra'], ['Gillman Lord'], ['Puppet Warrior', 'Puppet Warrior']];
  const RETREAT = { map: 'world_tla', x: 234, y: 42, dir: DIR.DOWN };
  const LEG = {
    '.': 'cave_sand', ',': 'cave_pebbles', '~': 'cave_water', 'p': 'chasm', 'g': 'pit', 'o': { ground: 'cave_sand', obj: 'rock_sand' },
    'L': { ground: 'cave_sand', obj: 'ladder', walk: true }, 'D': { ground: 'cave_sand', obj: 'door_cave', walk: true }, 'b': 'jl_button', 'R': { ground: 'chasm', obj: 'ropeh', walk: true }, 'S': 'stairs_up', 's': 'stairs_down'
  };
  const ROCK = { cliff: '#', set: 'lilacrock', faces: 2 };
  const room = (id, name, rows, entry, enc, build, opts) => defineMap(id, Object.assign({ name: 'Treasure Isle' + (name ? ' - ' + name : ''), w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry, enc, retreat: RETREAT }, opts || {}, { build(M) { M.paint(0, 0, strs(rows), LEG, ROCK); build(M); } }));
  const door = (M, x, y, to, tx, ty, dir) => { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, { door: true }); };
  const gate = (M, id, x, y, flag) => M.object('gate', x, y, { id, tile: 'door_stone', openTile: 'door_stone', state: G.flag(flag) ? 'open' : 'shut', script: function* (E) { if (G.flag(flag)) return; yield E.say('A stone door, shut fast. Something in the room must open it.'); } });
  const openGate = (id, flag) => { G.set(flag); const g = G.field.map.objects.find(o => o.id === id); if (g) g.state = 'open'; G.field.map.finalize(); Engine.doShake(8); Audio.sfx('push'); };
  const spiky = (M, id, x, y, flag) => M.object('rock_water', x, y, { id, look: 'rock_spiky', sunkGround: 'cave_sand', flag });
  const emptyChest = (M, x, y, id) => M.object('spot', x, y, { id, tile: 'chest_blue', script: function* (E) { yield E.say('The chest is empty. Someone has been here before.'); } });

  // ====================== the way in: the winding passage, the side rooms, the button, the spiky rocks ======================
  const T1 = grid(24, 34, '#');
  fill(T1, 11, 28, 13, 32, '.'); fill(T1, 5, 24, 13, 27, '.'); fill(T1, 5, 14, 7, 24, '.'); fill(T1, 5, 10, 17, 13, '.'); fill(T1, 15, 6, 17, 10, '.'); fill(T1, 10, 3, 20, 6, '.');
  fill(T1, 2, 20, 4, 22, '.'); fill(T1, 2, 15, 4, 17, '.'); fill(T1, 9, 16, 12, 19, '.'); fill(T1, 8, 17, 8, 18, '.');   // the three side rooms off the passage
  T1[6][12] = 'b';
  for (const [x, y] of [[6, 26], [16, 12], [11, 4]]) T1[y][x] = 'o'; for (const [x, y] of [[12, 30], [6, 19], [19, 5]]) T1[y][x] = ',';
  room('treasure_isle', null, T1, { x: 12, y: 31 }, ENC_LOW, (M) => {
    M.walkable(11, 33, 3, 1); M.exit(11, 33, 3, 1, 'world_tla', 234, 42, DIR.DOWN);
    M.chest(5, 15, 'Coins', 161, { coins: 161 }); M.chest(5, 22, 'Lucky Medal', 1);
    emptyChest(M, 2, 21, 'ti_empty1'); emptyChest(M, 4, 15, 'ti_empty2'); emptyChest(M, 9, 16, 'ti_empty3'); emptyChest(M, 12, 19, 'ti_empty4');
    // the button at the top of the passage opens the door beside the spiky rocks; the right rock is ground down for the way through
    M.trigger(12, 6, 1, 1, function* (E) { if (G.flag('ti_button1')) return; openGate('ti_gate1', 'ti_button1'); yield E.say('The button sinks under the party\'s feet, and the door at the end of the way grinds open.'); });
    gate(M, 'ti_gate1', 19, 4, 'ti_button1');
    spiky(M, 'ti_spiky_l', 13, 4, null); spiky(M, 'ti_spiky_r', 18, 4, 'ti_spiky_r_gone');
    door(M, 20, 4, 'ti_pool', 2, 16, DIR.RIGHT); { const e = M.exits.find(e => e.to === 'ti_pool'); if (e) e.cond = () => G.flag('ti_button1'); }
    M.trigger(11, 30, 3, 2, function* (E) { yield E.say('Treasure Isle. The tales the sailors tell are of a hoard somewhere in here - and of what guards it.', 'Kraden'); }, { once: 'ti_seen' });
    M.trigger(17, 4, 1, 1, function* (E) { yield E.say('Spiky rocks in the way, like the ones at the cliffs. Grind takes them down.', 'Piers'); }, { once: 'ti_spiky_seen' });
    M.sign(6, 11, 'The way in. Follow the left wall: the chests on it are the ones worth opening.');
  });
  // ====================== the pool: stepping stones, the column shoved onto the switch ======================
  const T2 = grid(24, 20, '#');
  fill(T2, 2, 2, 21, 17, '~'); fill(T2, 1, 14, 5, 17, '.'); for (const y of [14, 12, 10]) T2[y][7] = '.'; fill(T2, 7, 7, 12, 8, '.'); fill(T2, 10, 3, 12, 6, '.'); fill(T2, 14, 4, 20, 8, '.'); fill(T2, 16, 10, 20, 16, '.');   // the stones a hop apart, the shelf, the way up to the door
  T2[5][11] = 'b'; T2[2][11] = 'D';
  for (const [x, y] of [[18, 6], [19, 14]]) T2[y][x] = 'o';
  room('ti_pool', 'The Pool', T2, { x: 2, y: 16 }, ENC_LOW, (M) => {
    door(M, 1, 16, 'treasure_isle', 19, 4, DIR.LEFT);
    // the stones are hopped one from the next; the column stands on the far shelf, and the switch is above it
    M.object('pillar', 11, 7, { id: 'ti_column1', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ti_column1'); if (o && o.x === 11 && o.y === 5 && !G.flag('ti_switch1')) { openGate('ti_gate2', 'ti_switch1'); yield E.say('The column settles onto the switch, and the door in the north wall opens.'); } } });
    gate(M, 'ti_gate2', 11, 3, 'ti_switch1');
    door(M, 11, 2, 'ti_columns', 12, 20, DIR.UP); { const e = M.exits.find(e => e.to === 'ti_columns'); if (e) e.cond = () => G.flag('ti_switch1'); }
    M.trigger(2, 14, 3, 3, function* (E) { yield E.say('A pool with stones standing in it, a step apart. Out in the middle a column stands on a shelf, and a switch beside it.', 'Sheba'); yield E.say('Two shoves and it sits on the switch.', 'Felix'); }, { once: 'ti_pool_seen' });
    M.sign(16, 11, 'The pool. The stones are hopped; the column is shoved from the south.');
  });
  // ====================== the hall of columns: the button, the rocks, the climb to the tightrope, the gap, the six chests ======================
  const T3g = grid(26, 24, '#');
  fill(T3g, 2, 2, 23, 21, '~'); fill(T3g, 10, 18, 14, 21, '.'); fill(T3g, 2, 12, 8, 21, '.'); fill(T3g, 10, 14, 23, 16, '.'); fill(T3g, 20, 6, 23, 13, '.'); fill(T3g, 12, 6, 18, 8, '.'); fill(T3g, 12, 9, 12, 13, '.');
  fill(T3g, 2, 6, 8, 9, '.'); T3g[7][9] = 'R'; T3g[7][10] = 'R'; T3g[7][11] = 'R';   // the left ledge, and the tightrope over the water to it
  fill(T3g, 2, 2, 8, 4, '.'); T3g[5][5] = 'p';   // the six chests' chamber above the ledge, a chasm between: the column fills it
  T3g[13][4] = 'b'; T3g[21][12] = 'D'; T3g[5][22] = 'D';
  for (const [x, y] of [[6, 15], [21, 15]]) T3g[y][x] = 'o';
  room('ti_columns', 'The Hall of Columns', T3g, { x: 12, y: 20 }, ENC_LOW, (M) => {
    door(M, 12, 21, 'ti_pool', 11, 4, DIR.DOWN);
    // the button on the left floor opens the door at the top right; the rightmost spiky rock bars the way up to it
    M.trigger(4, 13, 1, 1, function* (E) { if (G.flag('ti_button2')) return; openGate('ti_gate3', 'ti_button2'); yield E.say('The button sinks, and somewhere above a door grinds open.'); });
    gate(M, 'ti_gate3', 22, 6, 'ti_button2'); spiky(M, 'ti_spiky_2', 22, 13, null);
    // the middle shelf: the tightrope west to the Jester's Armlet; the column that goes into the chasm for the six chests
    M.chest(2, 7, "Jester's Armlet", 1);
    spiky(M, 'ti_spiky_l', 5, 6, null); M.object('pillar', 5, 8, { id: 'ti_column2', poundable: false });
    M.chest(2, 2, 'Coins', 911, { coins: 911 }); M.chest(4, 2, 'Sylph Feather', 1); M.chest(6, 2, 'Rusty Axe B', 1); M.chest(8, 2, 'Psy Crystal', 1); M.chest(3, 4, 'Star Dust', 1); M.chest(7, 4, 'Cookie', 1);
    door(M, 22, 5, 'ti_cave', 10, 18, DIR.UP); { const e = M.exits.find(e => e.to === 'ti_cave'); if (e) e.cond = () => G.flag('ti_button2'); }
    M.trigger(10, 18, 5, 2, function* (E) { yield E.say('A hall of water and columns. A button on the floor to the left; a rock like the last in the way up the right side; and out on the middle shelf a tightrope, and a column.', 'Kraden'); }, { once: 'ti_columns_seen' });
    M.trigger(12, 9, 1, 1, function* (E) { yield E.say('The tightrope runs west over the water to a ledge with a chest on it. Above that ledge a chamber, and a chasm between - the column on the ledge would fill it, once the rock before it is ground down.', 'Piers'); }, { once: 'ti_rope_seen' });
    M.sign(20, 15, 'The hall of columns. The button first; then the rock on the right.');
  });
  // ====================== the cave: the left wall to the Mimic, the stairs north ======================
  const T4 = grid(22, 20, '#');
  fill(T4, 9, 15, 11, 18, '.'); fill(T4, 3, 11, 18, 14, '.'); fill(T4, 3, 3, 6, 11, '.'); fill(T4, 3, 3, 12, 5, '.'); fill(T4, 14, 4, 18, 10, '.');
  T4[18][10] = 'D'; T4[3][11] = 'S';
  for (const [x, y] of [[8, 13], [16, 8], [4, 8]]) T4[y][x] = 'o'; T4[12][15] = ',';
  room('ti_cave', 'The Cave', T4, { x: 10, y: 17 }, ENC_LOW, (M) => {
    door(M, 10, 18, 'ti_columns', 22, 6, DIR.DOWN);
    M.chest(3, 4, 'Power Bread', 1, { mimic: 'Mimic #9' });
    M.walkable(11, 3); M.exit(11, 3, 1, 1, 'ti_boulders', 4, 16, DIR.UP, { stairs: true });
    M.trigger(9, 15, 3, 2, function* (E) { yield E.say('Dry cave at last. Keep to the left wall, the sailors said - and mind the chests here: not all of them are chests.', 'Jenna'); }, { once: 'ti_cave_seen' });
  });
  // ====================== beyond the boulders: Lift, the sea's monsters, the Iris Robe ======================
  const T5 = grid(22, 18, '#');
  fill(T5, 3, 14, 6, 16, '.'); fill(T5, 3, 4, 6, 14, '.'); fill(T5, 6, 4, 18, 6, '.'); fill(T5, 15, 6, 18, 12, '.'); fill(T5, 10, 9, 15, 12, '.');
  T5[16][4] = 's'; T5[3][17] = 'D';
  for (const [x, y] of [[12, 11], [5, 8]]) T5[y][x] = 'o';
  room('ti_boulders', 'Beyond the Boulders', T5, { x: 4, y: 15 }, ENC_HIGH, (M) => {
    M.walkable(4, 16); M.exit(4, 16, 1, 1, 'ti_cave', 11, 4, DIR.DOWN, { stairs: true });
    // the boulder across the way at the foot of the passage: Lift (Isaac's), and the monsters beyond are the sea's
    M.object('boulder', 4, 12, { id: 'ti_boulder1', onLift: function* (E) { yield E.say('The boulder lifts away. Air moves up the passage from somewhere ahead - and something else moves with it. The things beyond here will be harder.', 'Isaac'); } });
    M.chest(11, 10, 'Iris Robe', 1);
    M.object('boulder', 17, 5, { id: 'ti_boulder2' });
    door(M, 17, 3, 'ti_gale', 10, 14, DIR.UP);
    M.trigger(3, 13, 4, 1, function* (E) { yield E.say('A boulder fills the passage. It is Lift work - the sort Isaac does.', 'Felix'); }, { once: 'ti_boulder_seen', cond: () => !G.flag('obj:ti_boulders:boulder:ti_boulder1') });
    M.sign(7, 5, 'Beyond the first boulder. Another one stands in the door at the end.');
  });
  // ====================== the room of boulders: Gale on the left, the Fire Brand on the right, the rest for the way up ======================
  const T6 = grid(20, 16, '#');
  fill(T6, 2, 2, 17, 13, '.'); fill(T6, 9, 13, 11, 14, '.'); fill(T6, 8, 6, 12, 10, '#'); T6[8][10] = '.';   // the rock in the middle of the room, the boulder's niche in it
  fill(T6, 14, 6, 17, 6, 'g'); fill(T6, 14, 2, 17, 5, '#'); fill(T6, 16, 2, 17, 5, '.'); T6[2][17] = 'D';   // the pit under the door's corner (too sheer to jump): the column shoved up into it is the way
  for (const [x, y] of [[4, 12], [15, 12]]) T6[y][x] = 'o';
  room('ti_gale', 'The Room of Boulders', T6, { x: 10, y: 14 }, ENC_HIGH, (M) => {
    door(M, 10, 15, 'ti_boulders', 17, 4, DIR.DOWN);
    // the boulders: the centre one before Gale's side, the two on the right before the Fire Brand and the way up
    M.object('boulder', 5, 8, { id: 'ti_b_center' }); M.djinni('Gale', 3, 8, { fight: true }); M.walkable(3, 8);
    M.object('boulder', 15, 8, { id: 'ti_b_right' }); M.chest(17, 8, 'Fire Brand', 1);
    M.object('boulder', 16, 4, { id: 'ti_b_upper' }); M.object('boulder', 13, 3, { id: 'ti_b_upper2' });
    M.object('pillar', 16, 8, { id: 'ti_column3', poundable: false });   // shoved up into the pit: the way to the door's corner
    M.trigger(9, 12, 3, 2, function* (E) { yield E.say('Boulders everywhere. One on the left, with something moving beyond it; two on the right, and a door in the top corner past a gap.', 'Sheba'); }, { once: 'ti_gale_seen' });
    door(M, 17, 2, 'ti_climb', 3, 14, DIR.UP);
  });
  // ====================== the last climb: up by the right branch to the guardian's hall ======================
  const T7 = grid(20, 18, '#');
  fill(T7, 2, 12, 5, 15, '.'); fill(T7, 5, 12, 16, 13, '.'); fill(T7, 14, 4, 16, 12, '.'); fill(T7, 5, 4, 9, 8, '.'); fill(T7, 9, 6, 14, 6, 'p'); fill(T7, 9, 5, 14, 5, '.');
  T7[15][3] = 'D'; T7[3][15] = 'D';
  for (const [x, y] of [[8, 13], [15, 9]]) T7[y][x] = 'o';
  room('ti_climb', 'The Climb', T7, { x: 3, y: 14 }, ENC_HIGH, (M) => {
    door(M, 3, 15, 'ti_gale', 17, 3, DIR.DOWN);
    door(M, 15, 3, 'ti_hall', 8, 13, DIR.UP);
    M.trigger(2, 13, 3, 2, function* (E) { yield E.say('The top of the island is close. Something up there is awake - the air hums with it.', 'Kraden'); }, { once: 'ti_climb_seen' });
  });
  // ====================== the guardian's hall: the Star Magician and his balls, the tablet of Azul ======================
  const T8 = grid(16, 16, '#');
  fill(T8, 3, 2, 12, 12, '.'); fill(T8, 7, 12, 9, 14, '.'); fill(T8, 3, 2, 12, 2, ',');
  room('ti_hall', "The Guardian's Hall", T8, { x: 8, y: 13 }, [], (M) => {
    door(M, 8, 14, 'ti_climb', 15, 4, DIR.DOWN);
    if (!G.flag('star_magician_done')) M.boss('Star Magician', 8, 5, { done: 'star_magician_done' });
    M.trigger(6, 8, 5, 1, T3.starMagician, { once: 'star_magician_scene', cond: () => !G.flag('star_magician_done') });
    M.object('statue', 8, 3, { id: 'ti_tablet', tile: 'ar_tablet', script: function* (E) { if (!G.flag('star_magician_done')) { yield E.say('The guardian floats between the party and the tablet.'); return; } if (G.flag('azul_taken')) { yield E.say('The tablet of Azul. Its power is already the party\'s.'); return; } yield E.say('The tablet behind the guardian, cut with a dragon of the sea. The party reads it - and the deep answers.'); G.set('azul_taken'); Engine.doFlash(14, '#a0d0ff'); Audio.sfx('summon'); yield E.summon('Azul'); } });
    M.sign(4, 12, 'The top of Treasure Isle. What the sailors tell of is here.');
  });
  T3.starMagician = function* (E) {
    if (G.flag('star_magician_done')) return;
    yield E.face('player', DIR.UP);
    yield E.say('So. Treasure hunters, come for the prize behind me. Many have. None have taken it - and you will not either, unless you can take it from me.', 'Star Magician');
    yield E.say("(A hooded sorcerer floats above the floor, and four glowing spheres circle him.)");
    const r = yield* E.battle(['Star Magician', 'Refresh Ball', 'Guardian Ball', 'Thunder Ball', 'Anger Ball'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('star_magician_done'); E.despawn('boss_Star Magician'); for (const n of G.field.npcs.slice()) if (/Star Magician/.test(n.id)) G.field.removeNpc(n.id);
    yield E.say('The sorcerer\'s spheres wink out one by one, and he sinks to the floor and is gone. The tablet behind him stands open to the party.');
  };
}
