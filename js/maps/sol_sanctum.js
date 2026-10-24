// ---------- Sol Sanctum ----------
// The shrine above Vale, room for room from the reference rip (SOL_LAYOUT in js/maps/sol_layout.js, written by
// tools/sol_gen.py): the corridors in from Vale with their two jumping puzzles and the one-eyed Minotaur, the hall
// where the end statues hide the way on, the little maze with the second jewel, the corridor of statues, the loop
// with the Herb, the central chamber under the Sun's crest with the Moon room beside it, the two rooms of statues
// and the Psynergy Stone below them, and the chamber of the Elemental Stars behind the crack in the north wall.
'use strict';

// k wall (painted), e blue tiled floor, : dirt, u purple floor, a sandstone floor, i a gap to jump, S a stepping
// tile, l a torch set in the wall
const SOL_LEGEND = {
  'e': 'marble', ':': 'dirt', 'u': 'floor_purple', 'a': 'floor_tile', 'i': 'chasm', 'w': 'water',
  'S': { ground: 'stonefloor', walk: true }, 'l': { obj: 'torch' }
};
const SOL_ENC = [['Vermin', 'Bat'], ['Slime', 'Slime'], ['Wild Mushroom', 'Wild Mushroom'], ['Amaze'], ['Bat', 'Bat', 'Vermin']];
const SOL_RETREAT = { map: 'vale', x: 6, y: 2, dir: DIR.DOWN };
function solRoom(M, rows) {
  M.paint(0, 0, rows, SOL_LEGEND, { cliff: 'k', set: 'temple', top: 'ruins_walltop', face: 'wall_temple', mid: 'ruins_walltop' });
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'l') M.light(x, y, 3); });
}
function solMap(id, name, rows, entry, build, extra) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'void', music: 'lighthouse', bg: 'temple', indoor: true, entry, enc: SOL_ENC, retreat: SOL_RETREAT,
    build(M) { solRoom(M, rows); build(M);
      // every doorway between rooms gets its arch, every stair its steps, instead of a bare gap in the wall
      for (const e of M.exits) { if (e.edge) continue; for (let j = 0; j < e.h; j++) for (let i = 0; i < e.w; i++) { const x = e.x + i, y = e.y + j; if (!M.inb(x, y)) continue; if (e.door) { M.set(x, y, 'stonefloor'); M.setObj(x, y, e.w > 1 ? (i === 0 ? 'temple_arch_l' : i === e.w - 1 ? 'temple_arch_r' : null) : 'temple_arch'); M.walkable(x, y); } else if (e.stairs && !M.getObj(x, y)) { M.set(x, y, 'stonefloor'); M.setObj(x, y, 'stairs'); M.walkable(x, y); } } }
    } }, extra || {}));
}
// a gate in a wall that a puzzle opens, remembered by its flag
function solGate(M, x, y, id, flag) { M.object('gate', x, y, { id, state: G.flag(flag) ? 'open' : 'closed', openTile: 'temple_arch' }); }
function solOpenGate(id, flag) { G.set(flag); const g = G.map.objects.find(o => o.id === id); if (g) { g.state = 'open'; G.set('obj:' + g.key, { state: 'open' }); } Engine.doShake(8); Audio.sfx('quake'); }
// a relief of the Minotaur with an empty eye socket: a Small Jewel fitted into it opens a way
function solMinotaur(M, x, y, gateId, flag, what) {
  M.setObj(x, y, G.flag(flag) ? 'relief_minotaur_lit' : 'relief_minotaur');   // carved into the wall, plain to see
  M.object('relief', x, y, { id: 'minotaur_' + x + '_' + y, script: function* (E) {
    if (G.flag(flag)) { yield E.say('The relief of the Minotaur. Both of its eyes gleam now.'); return; }
    yield E.say('A relief of a Minotaur is carved into the wall. One of its eyes is an empty socket.');
    if (!G.inventory.has('Small Jewel')) return;
    const r = yield* E.ask('Set the Small Jewel into the empty socket?', null, ['Yes', 'No']); if (r !== 0) return;
    G.inventory.remove('Small Jewel'); Audio.sfx('item'); Engine.doFlash(8, '#ffe080'); G.map.setObj(x, y, 'relief_minotaur_lit');
    yield E.say("The jewel fits the socket exactly... The Minotaur's eyes flash!"); solOpenGate(gateId, flag); yield E.say(what);
  } });
}

// ---- the way in: the corridors from Vale, two jumping puzzles, the first Minotaur ----
solMap('sol_sanctum_1', 'Sol Sanctum', SOL_LAYOUT.entry, { x: 44, y: 37 }, M => {
  M.exit(44, 39, 2, 1, 'vale', 6, 2, DIR.DOWN, { door: true });
  M.exit(15, 4, 2, 1, 'sol_sanctum_hall', 12, 25, DIR.UP, { door: true });
  M.chest(4, 7, 'Small Jewel', 1);
  // the Minotaur above the corridor under the antechamber; the jewel opens the antechamber's gate
  solMinotaur(M, 9, 14, 'sol_gate1', 'sol_minotaur1', 'Somewhere near, stone grinds on stone: a gate has opened.');
  solGate(M, 15, 9, 'sol_gate1', 'sol_minotaur1');
  M.trigger(43, 32, 4, 2, STORY.sanctumEnter, { once: 'sanctum_entered' });
  M.chest(30, 39, 'Game Ticket', 1, { hidden: true });
});

// ---- the hall of statues: the leftmost and rightmost hide the ways on ----
solMap('sol_sanctum_hall', 'Sol Sanctum - Hall of Statues', SOL_LAYOUT.hall, { x: 12, y: 25 }, M => {
  M.exit(12, 26, 2, 1, 'sol_sanctum_1', 15, 5, DIR.DOWN, { door: true });
  M.exit(23, 1, 1, 1, 'sol_sanctum_maze', 18, 37, DIR.UP, { stairs: true });
  // the statues of the wings and the aisle; the two at the ends can be moved, and the passages behind them are one
  // tile wide beside the wall, so it takes two pushes to get by
  for (const [x, y] of [[6, 14], [11, 14], [15, 14], [20, 14], [11, 20], [15, 20], [11, 23], [15, 23], [12, 12]]) M.setObj(x, y, 'statue');
  M.setObj(2, 13, 'ruins_walltop'); M.setObj(22, 13, 'ruins_walltop');
  M.object('statue_move', 3, 13, { id: 'hall_statue_l' }); M.object('statue_move', 23, 13, { id: 'hall_statue_r' });
  M.setObj(3, 2, 'statue');   // the alcove behind the left one holds a statue no Psynergy can shift: a dead end
  M.trigger(10, 19, 6, 2, STORY.sanctumHall, { once: 'sanctum_hall_scene' });
});

// ---- the little maze and the second jewel ----
solMap('sol_sanctum_maze', 'Sol Sanctum - Maze', SOL_LAYOUT.maze, { x: 18, y: 38 }, M => {
  M.exit(18, 36, 1, 1, 'sol_sanctum_hall', 23, 2, DIR.DOWN, { stairs: true });
  M.exit(15, 1, 1, 1, 'sol_sanctum_mino', 8, 8, DIR.UP, { stairs: true });
  M.chest(6, 8, 'Small Jewel', 1);
});

// ---- the corridor of statues: Move slides one aside, the Minotaur behind the first wants the jewel, the door
// behind the last opens for it ----
solMap('sol_sanctum_mino', 'Sol Sanctum - Corridor of Statues', SOL_LAYOUT.mino, { x: 8, y: 8 }, M => {
  M.exit(8, 9, 1, 1, 'sol_sanctum_maze', 15, 2, DIR.DOWN, { stairs: true });
  for (const x of [2, 6, 10, 14, 18, 22]) M.object('statue_move', x, 3, { id: 'mino_statue_' + x });
  solMinotaur(M, 2, 2, 'sol_gate2', 'sol_minotaur2', 'Far along the corridor, the wall behind the last statue slides away!');
  M.set(6, 2, 'floor_purple'); M.setObj(6, 2, 'door_stone'); M.walkable(6, 2);   // the doorway behind the second: a niche, nothing more
  M.set(22, 2, 'floor_purple'); M.setObj(22, 2, null); M.walkable(22, 2); solGate(M, 22, 2, 'sol_gate2', 'sol_minotaur2');
  M.set(22, 1, 'floor_purple'); M.setObj(22, 1, null); M.walkable(22, 1); M.set(22, 0, 'floor_purple'); M.setObj(22, 0, null); M.walkable(22, 0);
  M.exit(22, 0, 1, 1, 'sol_sanctum_loop', 22, 10, DIR.UP, { door: true });
  M.trigger(1, 7, 25, 1, STORY.sanctumMino, { once: 'sanctum_mino_scene' });
  // here Move slides a statue sideways out of its place rather than pushing it away
  M.def.onPsy = (name, x, y, F, o) => { if (name !== 'Move' || !o || !String(o.id).startsWith('mino_statue')) return; const M2 = G.map; for (const nx of [o.x + 1, o.x - 1]) { if (!M2.isSolid(nx, o.y) && !F.objectAt(nx, o.y)) { o.x = nx; G.set('obj:' + o.key, { x: o.x, y: o.y }); Audio.sfx('push'); return true; } } return false; };
});

// ---- the loop, and the way east to the central chamber ----
solMap('sol_sanctum_loop', 'Sol Sanctum', SOL_LAYOUT.loop, { x: 22, y: 10 }, M => {
  M.exit(22, 11, 2, 1, 'sol_sanctum_mino', 22, 1, DIR.DOWN, { door: true });
  M.exit(26, 10, 1, 1, 'sol_sanctum_2', 1, 27, DIR.RIGHT);
});

// ---- the central chamber under the Sun's crest, the Moon room, and the corridors below with the Herb ----
solMap('sol_sanctum_2', 'Sol Sanctum - Central Chamber', SOL_LAYOUT.sun, { x: 1, y: 27 }, M => {
  M.exit(0, 27, 1, 1, 'sol_sanctum_loop', 25, 10, DIR.LEFT);
  M.chest(1, 11, 'Herb', 1);
  for (const [x, y] of [[11, 4], [21, 4], [11, 9], [21, 9]]) M.setObj(x, y, 'statue');
  M.set(15, 7, 'elem_mars'); M.set(16, 7, 'elem_mars'); M.set(15, 8, 'elem_mars'); M.set(16, 8, 'elem_mars');   // the Sun's crest
  for (const [x, y] of [[29, 4], [39, 4], [29, 9], [39, 9]]) M.setObj(x, y, 'statue');
  M.set(33, 7, 'elem_mercury'); M.set(34, 7, 'elem_mercury'); M.set(33, 8, 'elem_mercury'); M.set(34, 8, 'elem_mercury');   // the Moon's
  M.exit(39, 17, 1, 1, 'sol_sanctum_statues', 29, 16, DIR.LEFT, { door: true });
  // the crack in the north wall: a beam of light, and once the statues have turned the Moon to the Sun, a portal
  M.setObj(16, 1, 'door_stone'); M.walkable(16, 1); M.walkable(16, 2);
  M.exit(16, 1, 1, 1, 'sol_sanctum_3', 25, 15, DIR.UP, { door: true, cond: () => G.flag('sol_portal_open') });
  M.trigger(16, 2, 1, 1, STORY.sanctumCrack, { cond: () => !G.flag('sol_portal_open') });
  M.trigger(15, 10, 3, 1, STORY.sanctumSunChamber, { once: 'sanctum_sun_scene' });
});

// ---- the two rooms of statues, the Psynergy Stone below ----
solMap('sol_sanctum_statues', 'Sol Sanctum - Rooms of Statues', SOL_LAYOUT.moon, { x: 29, y: 16 }, M => {
  M.exit(30, 16, 1, 1, 'sol_sanctum_2', 39, 18, DIR.DOWN, { door: true });
  M.exit(30, 25, 1, 1, 'sol_sanctum_statues', 11, 24, DIR.UP, { door: true });     // door C: the passage to the Psynergy Stone's cave
  M.exit(11, 25, 1, 1, 'sol_sanctum_statues', 29, 25, DIR.LEFT, { door: true });
  M.setObj(10, 21, 'psystone');
  // three statues on the left, their places one step south; then four on the right, theirs one step inward
  const three = [[3, 5], [7, 5], [11, 5]], four = [[21, 5], [31, 5], [21, 9], [31, 9]];
  const spots3 = three.map(([x, y]) => [x, y + 1]), spots4 = four.map(([x, y]) => [x < 26 ? x + 1 : x - 1, y]);
  for (const [x, y] of spots3) M.set(x, y, 'elem_venus'); for (const [x, y] of spots4) M.set(x, y, 'elem_mercury');
  M.set(6, 8, 'elem_mars'); M.set(7, 8, 'elem_mars'); M.set(26, 8, 'elem_mercury'); M.set(27, 8, 'elem_mercury');   // the crests of the two rooms
  const placed = (objs, spots) => objs.every(o => spots.some(([x, y]) => o.x === x && o.y === y));
  three.forEach(([x, y], i) => M.object('statue_move', x, y, { id: 'three_' + i, onMove: function* (E) {
    const objs = G.map.objects.filter(o => String(o.id).startsWith('three_'));
    if (!G.flag('sol_three_placed') && placed(objs, spots3)) { G.set('sol_three_placed'); Engine.doShake(10); Audio.sfx('quake'); yield E.say('The three statues stand on their marks. From the room beside, a low rumble... something has been unlocked.'); }
  } }));
  four.forEach(([x, y], i) => M.object('statue_move', x, y, { id: 'four_' + i, onMove: function* (E) {
    const objs = G.map.objects.filter(o => String(o.id).startsWith('four_'));
    if (!G.flag('sanctum_kraden_returns')) { yield* STORY.sanctumKradenReturns(E); }
    if (!G.flag('sol_moon_placed') && placed(objs, spots4)) { G.set('sol_moon_placed'); G.set('sol_portal_open'); Engine.doFlash(16, '#ffffff'); Audio.sfx('quake'); Engine.doShake(20);
      yield E.say('The four statues turn on their marks. Light floods the crest between them: the Moon has become the Sun!');
      yield E.say("Kraden: 'The mural in the central chamber... I saw it change too. Back, everyone - to the crack in the north wall!'", 'Kraden'); }
  } }));
  // the four cannot be shifted until the three have been placed
  M.def.onPsy = (name, x, y, F, o) => { if (name === 'Move' && o && String(o.id).startsWith('four_') && !G.flag('sol_three_placed')) return function* (E) { yield E.say("The statue will not budge. Something still holds it in place."); }; };
  M.trigger(1, 4, 13, 1, STORY.sanctumStatueRooms, { once: 'sanctum_statues_scene' });
});

// ---- the chamber of the Elemental Stars ----
solMap('sol_sanctum_3', 'Sol Sanctum - Elemental Chamber', SOL_LAYOUT.stars, { x: 25, y: 15 }, M => {
  M.exit(25, 13, 1, 1, 'sol_sanctum_2', 16, 3, DIR.DOWN, { door: true });
  M.setObj(24, 13, 'statue'); M.setObj(26, 13, 'statue');
  for (const [x, y, el] of [[11, 7, 'elem_mars'], [41, 8, 'elem_mercury'], [11, 28, 'elem_jupiter'], [42, 28, 'elem_venus']]) { M.set(x, y, el); M.walkable(x, y); }
  M.def.onBeacon = STORY.sanctumStars;
  M.trigger(23, 17, 5, 2, STORY.sanctumChamber, { once: 'sanctum_chamber_intro' });
  M.chest(4, 15, 'Vial', 2, { hidden: true });
}, { enc: null });
