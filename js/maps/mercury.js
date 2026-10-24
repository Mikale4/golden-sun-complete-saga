// ---------- Mercury Lighthouse ----------
// The lighthouse north of Imil, room by room after the reference rip: the courtyard with the fountain of Hermes
// and the statue in Mia's way, the halls and channels of the waterworks inside (the pipes seated in the channel,
// the pillar set on its mark, the goddess whose Ply wakes the jump tiles, the pool crossed on them, the waterfalls
// that are doorways, the pipeline and its switch, the rainbow fall that runs upward), and the aerie where the beacon
// already burns.
'use strict';

const LH_LEGEND = {
  '.': 'lh_floor', '~': 'lh_water', '=': 'lh_deep', ' ': 'lh_void', 'i': 'lh_gap', 'g': 'lh_grate', 'S': 'lh_jump_off', 'l': { ground: 'lh_floor', obj: 'lh_column' },
  'y': { ground: 'lh_floor', obj: 'stairs', walk: true }, 'V': 'lh_slide', 'D': 'lh_floor', 'W': { ground: 'lh_floor', obj: 'lh_fall', walk: true }, 'F': { ground: 'lh_floor', obj: 'lh_fall_wall' },
  'o': 'pipe_socket', 'x': 'lh_switch', 'p': 'lh_pit', 'm': 'marble', 'B': 'lh_grate', 'k': 'lh_void', 'T': { ground: 'sky', obj: 'lh_wall' }, 'j': 'sky_gap'
};
const LH_ENC = [['Cuttle', 'Cuttle'], ['Lizard Man'], ['Mauler'], ['Harpy', 'Harpy'], ['Siren']];
// a room built from rows: k is the void round the floors, and where it touches a floor it is the brick wall that edges
// every platform of the house, as in the rip; the jump tiles come alive once the goddess is honoured
function lhRoom(id, name, rows, opts) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'lh_void', music: 'lighthouse', bg: 'lighthouse', indoor: true, enc: LH_ENC, retreat: { map: 'mercury_lh_out', x: 15, y: 31, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, rows, LH_LEGEND, { cliff: '' });
      const k = (x, y) => { const r = rows[y]; return r === undefined || r[x] === undefined || r[x] === 'k'; };
      // under the open sky the void is sky, and T is the brick body of a tower
      rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { if (row[x] !== 'k') continue; let edge = false; for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !k(x + dx, y + dy) && row[x + dx] !== 'T' && !(rows[y + dy] && rows[y + dy][x + dx] === 'T')) { edge = true; break; }
        if (opts.sky) { M.set(x, y, 'sky'); continue; }   // the open air has no walls: only the towers' bodies stand in it
        if (edge) M.setObj(x, y, 'lh_wall'); } });
      if (G.flag('mercury_ply')) rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'S') { M.set(x, y, 'lh_jump'); M.walkable(x, y); } });
      opts.build(M);
    } }, opts.def || {}));
}
// rows drawn with rectangles: set(x0,y0,x1,y1,ch)
function lhGrid(w, h, fn) { const r = []; for (let y = 0; y < h; y++) r.push(new Array(w).fill('k')); const set = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) r[y][x] = c; }; fn(set, r); return r.map(a => a.join('')); }
function lhDoor(M, x, y, to, tx, ty, dir, extra) { M.set(x, y, 'lh_floor'); M.setObj(x, y, 'door_stone'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.UP : dir, Object.assign({ door: true }, extra || {})); }
function lhFall(M, x, y, to, tx, ty, dir) { M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.UP : dir, { door: true }); }
function lhTorches(M, list) { for (const [x, y] of list) { M.setObj(x, y, 'torch'); M.light(x, y, 4); } }
// a thing shoved with Move until it settles where it belongs: a pipe into its seating, the pillar onto its mark, the statue onto the switch
function lhSettle(M, kind, x, y, id, tile, tx, ty, flag, line, after, state) {
  const st = state || 'set';   // 'set' stays solid where it stands; 'seated' lies flush and is walked over
  const opts = { id, onMove: function* (E) { const o = G.map.objects.find(ob => ob.id === id); if (o && o.x === tx && o.y === ty && !G.flag(flag)) { G.set(flag); o.state = st; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: false, state: st }); Audio.sfx('quake'); Engine.doShake(8); if (after) after(); yield E.say(line); } } };
  if (tile) opts.tile = tile;
  M.object(kind, x, y, opts);
}

// ---- the courtyard: the causeway from the shore, the fountain of Hermes, the terrace and the door ----
const LH_OUT = lhGrid(24, 37, (set) => {
  set(0, 18, 3, 36, '~'); set(0, 31, 23, 36, '~'); set(20, 18, 23, 36, '~');                                        // the lake round the foot of the tower
  set(12, 31, 18, 36, '.'); set(13, 32, 13, 36, 'l'); set(17, 32, 17, 36, 'l'); set(14, 31, 16, 36, '.');           // the causeway between its columns
  set(7, 28, 21, 30, '.'); set(8, 23, 20, 27, '.'); set(12, 25, 16, 28, '~'); set(14, 25, 14, 28, '.');              // the court and its pool, the fountain's isle in it
  set(13, 22, 15, 22, 'y'); set(10, 15, 18, 21, '.'); set(14, 14, 14, 14, 'D');                                      // the stair up to the terrace, and the door in the tower
});
lhRoom('mercury_lh_out', 'Mercury Lighthouse', LH_OUT, { def: { enc: [], entry: { x: 15, y: 35 }, retreat: null, indoor: false, bg: 'snow' }, build(M) {
  M.exit(14, 36, 3, 1, 'world_gs1', 72, 4, DIR.DOWN);
  // the fountain of Hermes in the court, dry until the beacon burns
  M.setObj(14, 26, G.flag('mercury_lit') ? 'fountain' : 'statue'); M.object('relief', 14, 26, { id: 'hermes_fountain', script: STORY.hermesWater });
  M.set(14, 25, 'marble'); M.set(14, 27, 'marble'); M.set(14, 28, 'marble');
  M.sign(10, 29, "'The fountain shall be filled as long as light fills the house.'");
  // the door at the top of the terrace, the statue that blocks it, and Mia at her wits' end before it
  lhDoor(M, 14, 14, 'mercury_lh_hall', 7, 8, DIR.UP, { cond: () => G.flag('mia_lh_door') });
  M.object('statue_move', 14, 15, { id: 'lh_door_statue', onMove: STORY.miaDoorStatue });
  M.npc('MiaLH', 14, 17, { look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.UP, cond: () => G.flag('mia_left_for_lh') && !G.flag('mia_lh_door'), script: STORY.miaLighthouse });
  M.trigger(11, 18, 7, 2, STORY.miaLighthouse, { once: 'mia_lh_door_scene', cond: () => G.flag('mia_left_for_lh') && !G.flag('mia_lh_door') });
  for (const [x, y] of [[11, 20], [17, 20], [11, 16], [17, 16], [9, 29], [19, 29]]) M.setObj(x, y, 'bush');
  lhTorches(M, [[10, 15], [18, 15], [7, 28], [21, 28]]);
  M.sign(8, 30, "Mercury Lighthouse. 'None but the Clan of Mercury may pass the door.'");
} });

// ---- the entrance hall: the Lizard Man that bars Mia's way up the middle, and the passages either side ----
const LH_HALL = lhGrid(16, 11, (set) => { set(2, 5, 13, 8, '.'); set(7, 2, 7, 4, '.'); set(7, 1, 7, 1, 'D'); set(1, 6, 1, 6, 'D'); set(14, 6, 14, 6, 'D'); set(7, 9, 8, 9, 'D'); });
lhRoom('mercury_lh_hall', 'Mercury Lighthouse', LH_HALL, { def: { entry: { x: 7, y: 8 } }, build(M) {
  lhDoor(M, 7, 9, 'mercury_lh_out', 14, 15, DIR.DOWN); lhDoor(M, 8, 9, 'mercury_lh_out', 14, 15, DIR.DOWN);
  lhDoor(M, 1, 6, 'mercury_lh_corr', 1, 7, DIR.UP); lhDoor(M, 14, 6, 'mercury_lh_corr', 12, 7, DIR.UP);
  lhDoor(M, 7, 1, 'mercury_lh_corr', 6, 7, DIR.UP, { cond: () => G.flag('lh_lizard_done') });
  const lizard = () => G.flag('mia_lh_door') && !G.flag('lh_lizard_done');
  M.npc('MiaLH2', 7, 2, { look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.DOWN, cond: lizard, text: "It won't let me pass...!" });
  M.npc('lh_lizard', 7, 4, { look: { skin: '#58a848', hair: '#2c6c30', hairStyle: 'wild', top: '#3c8c3c', pants: '#2c6c30', boots: '#204820', eyes: '#f0e040' }, name: 'Lizard Man', dir: DIR.UP, cond: lizard, script: STORY.lhLizard });
  M.trigger(5, 6, 5, 1, STORY.lhLizard, { once: 'lh_lizard_scene', cond: lizard });
  lhTorches(M, [[4, 4], [10, 4]]);
  M.sign(12, 8, "'The two passages meet again above.'");
} });
// the corridor above the hall: the three ways up from it meet round the pool, and its far door goes up to the stairs
const LH_CORR = lhGrid(14, 10, (set) => { set(1, 2, 12, 7, '.'); set(4, 3, 8, 6, 'k'); set(5, 4, 7, 5, '='); set(6, 1, 6, 1, 'D'); set(1, 8, 1, 8, 'D'); set(6, 8, 6, 8, 'D'); set(12, 8, 12, 8, 'D'); });
lhRoom('mercury_lh_corr', 'Mercury Lighthouse', LH_CORR, { def: { entry: { x: 1, y: 7 } }, build(M) {
  lhDoor(M, 1, 8, 'mercury_lh_hall', 2, 6, DIR.DOWN); lhDoor(M, 12, 8, 'mercury_lh_hall', 13, 6, DIR.DOWN); lhDoor(M, 6, 8, 'mercury_lh_hall', 7, 2, DIR.DOWN);
  lhDoor(M, 6, 1, 'mercury_lh_stairs', 6, 14, DIR.UP);
  lhTorches(M, [[3, 1], [10, 1]]);
} });

// ---- the room of the second statue: Mia before the blue statue on the span over the pit, and the way up beyond ----
const LH_STAIRS = lhGrid(14, 17, (set) => {
  set(1, 10, 12, 14, '.'); set(9, 10, 9, 14, 'p'); set(9, 12, 9, 12, 'B');                           // the lower floor, the pit across it (too wide to jump), the one span over it
  set(10, 4, 12, 9, '.'); set(11, 3, 11, 3, 'D'); set(6, 15, 6, 15, 'D');                             // the column up beyond the pit to the door
});
lhRoom('mercury_lh_stairs', 'Mercury Lighthouse', LH_STAIRS, { def: { entry: { x: 6, y: 14 } }, build(M) {
  lhDoor(M, 6, 15, 'mercury_lh_corr', 6, 2, DIR.DOWN);
  lhDoor(M, 11, 3, 'mercury_lh_pipes', 6, 17, DIR.UP);
  for (const y of [5, 7]) for (const x of [10, 11, 12]) { M.setObj(x, y, 'stairs'); M.walkable(x, y); }
  // the blue statue stands on the one span over the pit: Move sends it over the edge
  M.object('statue_move', 9, 12, { id: 'lh_pit_statue', tile: 'statue_blue' });
  M.npc('MiaLH3', 7, 12, { look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.RIGHT, cond: () => G.flag('lh_lizard_done') && !G.flag('mia_joined'), mind: "Alex... it can't be Alex. He'd never... He was always the gentle one. Wasn't he?", script: STORY.miaStatue });
  M.trigger(1, 10, 8, 5, STORY.miaStatue, { once: 'mia_statue_scene', cond: () => G.flag('lh_lizard_done') && !G.flag('mia_joined') });
  lhTorches(M, [[2, 9], [12, 9]]);
  M.def.onPsy = (name, x, y, F, o) => { if (name === 'Move' && o && o.id === 'lh_pit_statue') return STORY.pitStatue; return false; };
} });

// ---- the waterworks: the two pipes shoved into their seatings, and the Psy Crystal in the side chamber ----
const LH_PIPES = lhGrid(14, 20, (set) => {
  set(2, 16, 11, 17, '.'); set(6, 18, 7, 18, 'D');                                            // the landing in from the door
  set(11, 9, 11, 15, '.'); set(11, 9, 11, 9, 'o'); set(11, 3, 11, 8, '.');                     // the east corridor north, the first seating in it
  set(1, 2, 11, 2, '.'); set(6, 1, 6, 1, 'D'); set(1, 3, 1, 13, '.');                          // the top corridor and the door on, the west corridor down
  set(1, 12, 5, 13, '.'); set(6, 12, 6, 12, 'o'); set(7, 11, 9, 13, '.');                      // the second seating, pushed from the far side, and the chamber with the Psy Crystal
  set(3, 4, 9, 8, '='); set(4, 5, 8, 7, 'g');                                                 // the channel the pipes feed
});
lhRoom('mercury_lh_pipes', 'Mercury Lighthouse', LH_PIPES, { def: { entry: { x: 6, y: 17 } }, build(M) {
  lhDoor(M, 6, 18, 'mercury_lh_stairs', 11, 4, DIR.DOWN); lhDoor(M, 7, 18, 'mercury_lh_stairs', 11, 4, DIR.DOWN);
  lhDoor(M, 6, 1, 'mercury_lh_pillar', 5, 17, DIR.UP, { cond: () => G.flag('lh_pipe1_seated') && G.flag('lh_pipe2_seated') });
  // the two loose pipes lie a shove from their seatings: the first up the east corridor, the second across the west chamber
  lhSettle(M, 'crate', 11, 10, 'lh_pipe1', 'pipe_v', 11, 9, 'lh_pipe1_seated', 'The pipe drops into its seating with a clang. Somewhere below, water begins to run.', null, 'seated');
  lhSettle(M, 'crate', 5, 12, 'lh_pipe2', 'pipe_h', 6, 12, 'lh_pipe2_seated', 'The second pipe seats itself. The channel fills, and above, a door grinds open!', null, 'seated');
  M.chest(9, 11, 'Psy Crystal', 1);
  M.sign(2, 17, "'Seat the pipes and the channel runs; when it runs, the way above opens.'");
  lhTorches(M, [[3, 1], [9, 1]]);
} });

// ---- the long room: the pillar set on its mark opens the far door, and the gap across the chamber is jumped ----
const LH_PILLAR = lhGrid(33, 20, (set) => {
  set(3, 14, 28, 15, '.'); set(5, 16, 5, 17, '.'); set(5, 18, 5, 18, 'D');                        // the lower walk in from the door
  set(27, 12, 28, 13, '.'); set(3, 10, 28, 11, '.'); set(3, 4, 4, 9, '.'); set(3, 2, 9, 3, '.');   // the stair at the east end, the upper walk, the west column, the top-left landing
  set(6, 5, 27, 8, '.'); set(5, 6, 5, 6, '.'); set(17, 5, 17, 8, 'i'); set(9, 7, 9, 7, 'x');    // the chamber, its gap, the mark for the pillar
  set(28, 2, 29, 8, '.'); set(25, 2, 29, 3, '.'); set(26, 1, 26, 1, 'D');                       // the far column up to the door
});
lhRoom('mercury_lh_pillar', 'Mercury Lighthouse', LH_PILLAR, { def: { entry: { x: 5, y: 17 } }, build(M) {
  lhDoor(M, 5, 18, 'mercury_lh_pipes', 6, 2, DIR.DOWN);
  for (const [x, y] of [[27, 12], [28, 12], [27, 13], [28, 13]]) { M.setObj(x, y, 'stairs'); M.walkable(x, y); }
  // the pillar that opens the far door: shoved onto its mark
  lhSettle(M, 'pillar', 12, 7, 'lh_pillar', null, 9, 7, 'lh_pillar_set', 'The pillar settles onto the mark. Far over to the right, a door grinds open!');
  lhDoor(M, 26, 1, 'mercury_lh_goddess', 7, 13, DIR.UP, { cond: () => G.flag('lh_pillar_set') });
  M.sign(4, 3, "'The guardian set upon the mark opens the way beyond the gap.'");
  lhTorches(M, [[8, 1], [23, 1], [12, 9], [20, 9]]);
} });

// ---- the goddess: her hands reached over the pool, and the Ply that wakes the jump tiles ----
const LH_GODDESS = [
  'kkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkk',
  'kkDkkk...kkkDkk',
  'k....kk.kk....k',
  'k....kk.kk....k',
  'k.....~.~.....k',
  'k~~~~~~S~~~~~~k',
  'k~~~~~~~~~~~~~k',
  'k~~~~~~S~~~~~~k',
  'k~~~~~~~~~~~~~k',
  'k......m......k',
  'k.............k',
  'kkkkk.....kkkkk',
  'kkkkkk...kkkkkk',
  'kkkkkkkDkkkkkkk',
];
lhRoom('mercury_lh_goddess', 'Mercury Lighthouse', LH_GODDESS, { def: { entry: { x: 7, y: 13 }, enc: [] }, build(M) {
  lhDoor(M, 7, 14, 'mercury_lh_pillar', 26, 2, DIR.DOWN);
  lhDoor(M, 2, 2, 'mercury_lh_cross', 2, 7, DIR.UP); lhDoor(M, 12, 2, 'mercury_lh_cross', 2, 7, DIR.UP);
  // the goddess, her hands over the water; the two pale stones are stepped over on the way to them
  M.setObj(6, 2, 'goddess_tl'); M.setObj(7, 2, 'goddess_tr'); M.setObj(6, 3, 'goddess_bl'); M.setObj(7, 3, 'goddess_br'); M.setObj(8, 2, 'lh_column'); M.setObj(8, 3, 'lh_column');
  M.set(7, 4, 'marble'); M.setObj(7, 4, null); M.walkable(7, 4);
  for (const [x, y] of [[7, 6], [7, 8]]) { M.set(x, y, 'lh_jump'); M.walkable(x, y); }
  M.sign(5, 10, 'He who honors the heart of the goddess shall stand at the center of all, like a swan in the center of a rippling pond.');
  M.object('relief', 7, 3, { id: 'goddess', script: function* (E) { yield E.say(G.flag('mercury_ply') ? '(The goddess seems to smile. The pale stones in the water shine.)' : '(The goddess holds her hands out over the water. Something in the stone waits.)'); } });
  lhTorches(M, [[3, 2], [11, 2]]);
  M.def.onPsy = (name, x, y, F, o) => { if (name === 'Ply' && x === 7 && (y === 3 || y === 2) && !G.flag('mercury_ply')) return STORY.goddessPly; return false; };
} });

// ---- the channel hall above: the jump tiles across the water hold, and the door is on the far right ----
const LH_CROSS = [
  'kkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkk',
  'kllkllkllkllkllkkk',
  'kk..............Dk',
  'kk..............kk',
  'kkSSSSSSSSSSSSSSkk',
  'kkSSSSSSSSSSSSSSkk',
  'kD..............kk',
  'kkkkkkkkkkkkkkkkkk',
];
lhRoom('mercury_lh_cross', 'Mercury Lighthouse', LH_CROSS, { def: { entry: { x: 2, y: 7 } }, build(M) {
  lhDoor(M, 1, 7, 'mercury_lh_goddess', 2, 3, DIR.DOWN);
  lhDoor(M, 16, 3, 'mercury_lh_falls3', 2, 8, DIR.UP);
  M.sign(3, 7, "'Honor the goddess, and the pale stones will bear you.'");
} });

// ---- the three waterfalls: the Mimic's chest on the right, the right-most fall leading to the Psynergy Armor ----
const LH_FALLS3 = [
  'kFFFFFFFFFFFFFFFFFFFFFFFFFFFFFk',
  'kWFFFFFFFFFFFWFFFFFFFFFFFFFFFWk',
  'k.............................k',
  'k..=========...........=======k',
  'k..=========...........=======k',
  'k..=========...........=======k',
  'k..=========...........=======k',
  'k.............................k',
  'k.............................k',
  'kkDkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
];
lhRoom('mercury_lh_falls3', 'Mercury Lighthouse', LH_FALLS3, { def: { entry: { x: 2, y: 8 } }, build(M) {
  lhDoor(M, 2, 9, 'mercury_lh_cross', 15, 4, DIR.DOWN);
  lhFall(M, 1, 1, 'mercury_lh_pool', 13, 16, DIR.UP); lhFall(M, 13, 1, 'mercury_lh_pool', 13, 16, DIR.UP); lhFall(M, 29, 1, 'mercury_lh_armor', 2, 9, DIR.UP);
  // the chest on the very right is a Mimic; the one in the middle is the real thing
  M.chest(27, 8, 'Water of Life', 1, { mimic: 'Mimic #1' }); M.chest(14, 3, 'Elixir', 1);
  for (const x of [5, 9, 17, 21, 25]) M.setObj(x, 0, 'lh_column');
  M.sign(4, 8, "'Two of the falls are doors; the third hides a treasure.'");
} });
const LH_ARMOR = lhGrid(18, 12, (set) => { set(1, 2, 15, 9, '.'); set(2, 2, 13, 8, '='); set(12, 9, 12, 9, '~'); set(2, 10, 2, 10, 'D'); });
lhRoom('mercury_lh_armor', 'Mercury Lighthouse', LH_ARMOR, { def: { entry: { x: 2, y: 9 } }, build(M) {
  lhDoor(M, 2, 10, 'mercury_lh_falls3', 29, 2, DIR.DOWN);
  M.chest(15, 3, 'Psynergy Armor', 1);
  M.sign(1, 8, "'The water is narrow at one place: jump it.'");
} });

// ---- the great pool: the pale stones from the isle in its middle lead round to the north-east, and west to the Sleep Bomb ----
const LH_POOL = lhGrid(28, 26, (set) => {
  set(1, 2, 26, 24, '~');
  set(3, 9, 8, 12, '.'); set(3, 3, 10, 8, 'k');                                                          // the ledge with the chest under its crag
  set(22, 2, 26, 3, '.'); set(23, 1, 23, 1, 'D');                                                       // the corner ledge and the door out
  set(11, 14, 15, 19, 'k'); set(12, 16, 14, 18, '.'); set(13, 15, 13, 15, 'D'); set(13, 19, 13, 19, '.');   // the isle with the door up from below, and its step down to the stones
  // the pale stones: from the isle's foot round east and up the east wall, and west and up to the ledge
  for (const [x, y] of [[13, 21], [15, 21], [17, 21], [19, 21], [21, 21], [23, 21], [25, 21], [25, 19], [25, 17], [25, 15], [25, 13], [25, 11], [25, 9], [25, 7], [25, 5], [25, 4],
                        [11, 21], [9, 21], [7, 21], [5, 21], [3, 21], [3, 19], [3, 17], [3, 15], [3, 13]]) set(x, y, x, y, 'S');
});
lhRoom('mercury_lh_pool', 'Mercury Lighthouse', LH_POOL, { def: { entry: { x: 13, y: 16 } }, build(M) {
  lhDoor(M, 13, 15, 'mercury_lh_falls3', 13, 2, DIR.DOWN);
  lhDoor(M, 23, 1, 'mercury_lh_fallsb', 15, 8, DIR.UP);
  M.chest(6, 10, 'Sleep Bomb', 1);
  M.sign(4, 12, "'From the isle, the pale stones lead round the pool - keep to the east wall for the way up.'");
} });

// ---- another three waterfalls; the right one leads up to the pipeline and its switch ----
const LH_FALLSB = [
  'kFFFFFFFFFFFFFFFFFFFFFFFFFFFFFk',
  'kFFFFFFFFFFFFFFFFFFFFFWFFFFFFFk',
  'kl..l...l...l...l...l...l...lkk',
  'k.............................k',
  'k.............................k',
  'k.ggggggggggggggggggggggggggg.k',
  'k.ggggggggggggggggggggggggggg.k',
  'k.............................k',
  'k.............................k',
  'kkkkkkkkkkkkkkkDkkkkkkkkkkkkkkk',
];
lhRoom('mercury_lh_fallsb', 'Mercury Lighthouse', LH_FALLSB, { def: { entry: { x: 15, y: 8 } }, build(M) {
  lhDoor(M, 15, 9, 'mercury_lh_pool', 23, 2, DIR.DOWN);
  lhFall(M, 22, 1, 'mercury_lh_pipeline', 6, 22, DIR.UP);
  M.sign(3, 3, "'Of the falls, only the one on the right is the way on.'");
} });

// ---- the pipeline: the statue set on the switch, the door beyond it, and the Nut behind the statues ----
const LH_PIPELINE = lhGrid(14, 25, (set) => {
  set(1, 2, 12, 2, '.'); set(5, 2, 6, 3, 'g'); set(1, 3, 1, 6, '.'); set(3, 3, 3, 6, '.'); set(5, 4, 5, 6, '.'); set(7, 3, 7, 6, '.'); set(9, 4, 12, 6, '.'); set(10, 5, 10, 5, 'k');
  set(1, 6, 3, 6, '.'); set(5, 6, 8, 6, '.'); set(3, 7, 3, 7, '.'); set(5, 7, 5, 7, '.'); set(11, 7, 11, 7, '.');
  set(1, 8, 12, 8, '.'); set(6, 8, 7, 9, 'g'); set(1, 9, 1, 11, '.'); set(4, 9, 8, 10, '.'); set(11, 9, 11, 11, '.'); set(1, 11, 4, 11, '.'); set(9, 11, 12, 11, '.');
  set(3, 12, 3, 13, '.'); set(6, 12, 7, 13, '.'); set(11, 12, 11, 13, '.'); set(1, 13, 3, 13, '.'); set(5, 13, 8, 13, '.'); set(10, 13, 12, 13, '.');
  set(1, 14, 1, 22, '.'); set(5, 14, 8, 15, '.'); set(10, 14, 12, 15, '.'); set(1, 15, 8, 15, '.'); set(8, 16, 8, 17, '.'); set(1, 17, 8, 17, '.'); set(10, 16, 12, 18, '.'); set(11, 16, 11, 16, 'D');
  set(7, 18, 8, 18, '.'); set(1, 19, 5, 19, '.'); set(7, 19, 12, 19, '.'); set(11, 19, 11, 19, 'x'); set(2, 20, 2, 21, '.'); set(4, 20, 4, 21, '.'); set(6, 21, 12, 21, '.'); set(1, 22, 12, 22, '.');
  set(6, 23, 6, 23, 'D'); set(6, 1, 6, 1, 'D');
});
lhRoom('mercury_lh_pipeline', 'Mercury Lighthouse', LH_PIPELINE, { def: { entry: { x: 6, y: 22 } }, build(M) {
  lhDoor(M, 6, 23, 'mercury_lh_fallsb', 22, 2, DIR.DOWN);
  lhDoor(M, 11, 16, 'mercury_lh_nut', 7, 8, DIR.UP);
  lhDoor(M, 6, 1, 'mercury_lh_fallsmany', 2, 7, DIR.UP, { cond: () => G.flag('lh_switch_down') });
  // the statue at the foot of the pipeline, and the switch three shoves along the wall
  if (G.flag('lh_switch_down')) M.set(11, 19, 'lh_switch_on');
  lhSettle(M, 'statue_move', 8, 19, 'lh_switch_statue', 'statue_blue', 11, 19, 'lh_switch_down', 'The statue settles onto the switch. Far up the room, a door grinds open!', () => { G.map.set(11, 19, 'lh_switch_on'); });
  M.sign(1, 23, "'The weight of the guardian upon the switch opens the way.'");
  for (const [x, y] of [[4, 4], [4, 12], [9, 9]]) M.setObj(x, y, 'pipe_v');
  lhTorches(M, [[3, 1], [9, 1]]);
} });
const LH_NUT = lhGrid(14, 12, (set) => { set(2, 2, 11, 8, '.'); set(6, 2, 8, 4, 'k'); set(7, 3, 7, 4, '.'); set(3, 7, 4, 7, 'g'); set(9, 7, 10, 7, 'g'); set(7, 9, 7, 9, 'D'); });
lhRoom('mercury_lh_nut', 'Mercury Lighthouse', LH_NUT, { def: { entry: { x: 7, y: 8 } }, build(M) {
  lhDoor(M, 7, 9, 'mercury_lh_pipeline', 11, 17, DIR.DOWN);
  // four statues in a row; the third from the left stands in the mouth of the alcove with the Nut
  for (const [i, x] of [2, 4, 7, 10].entries()) M.object('statue_move', x, 5, { id: 'lh_nut_statue' + i });
  M.chest(7, 3, 'Nut', 1);
  lhTorches(M, [[3, 1], [10, 1]]);
} });

// ---- the wall of waterfalls: the fourth from the right hides Sleet, the last the way on ----
const LH_FALLSMANY = [
  'kFFFFFFFFFFFFFFFFFFFFFFFFFFFFFk',
  'kFFFFFFFFFFFFFWFFFFFFFFFFFWFFFk',
  'kl..l...l...l...l...l...l...lkk',
  'k.............................k',
  'k.............................k',
  'k.ggggggggggggggggggggggggggg.k',
  'k.............................k',
  'k.............................k',
  'kkDkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
];
lhRoom('mercury_lh_fallsmany', 'Mercury Lighthouse', LH_FALLSMANY, { def: { entry: { x: 2, y: 7 } }, build(M) {
  lhDoor(M, 2, 8, 'mercury_lh_pipeline', 6, 2, DIR.DOWN);
  lhFall(M, 14, 1, 'mercury_lh_sleet', 5, 6, DIR.UP);
  lhFall(M, 26, 1, 'mercury_lh_rainbow', 7, 7, DIR.UP);
  M.sign(27, 7, "'Count the falls from the right: the fourth keeps a guest, the last keeps the way.'");
} });
const LH_SLEET = lhGrid(11, 9, (set) => { set(2, 2, 8, 6, '.'); set(3, 4, 7, 5, '~'); set(5, 7, 5, 7, 'D'); });
lhRoom('mercury_lh_sleet', 'Mercury Lighthouse', LH_SLEET, { def: { entry: { x: 5, y: 6 }, enc: [] }, build(M) {
  lhDoor(M, 5, 7, 'mercury_lh_fallsmany', 14, 2, DIR.DOWN);
  M.djinni('Sleet', 5, 3, { fight: true });
} });
// the rainbow over the last fall: Ply on the statue, and the water runs upward to the aerie
const LH_RAINBOW = [
  'kkkkkkkkkkkkk',
  'kkkkkFFFFkkkk',
  'kkkkkFFFFkkkk',
  'kkkkkFFFFkkkk',
  'k....FFFF...k',
  'k...gggg....k',
  'k...gggg....k',
  'k...........k',
  'kkkkkkkDkkkkk',
];
lhRoom('mercury_lh_rainbow', 'Mercury Lighthouse', LH_RAINBOW, { def: { entry: { x: 7, y: 7 }, enc: [] }, build(M) {
  lhDoor(M, 7, 8, 'mercury_lh_fallsmany', 26, 2, DIR.DOWN);
  M.setObj(10, 4, 'statue_blue'); M.object('relief', 10, 4, { id: 'rainbow_statue', script: function* (E) { yield E.say('(A blue statue with its face turned up to the falls. A rainbow hangs in the spray above it.)'); } });
  for (const x of [5, 6, 7, 8]) M.setOver(x, 0, 'rainbow');
  M.sign(2, 4, 'He who honors the goddess of rainbows shall be guided to the heavens upon wings of fluid grace.');
  // once the fall runs upward it is the way up: walk into it
  if (G.flag('lh_rainbow')) { for (const x of [5, 6, 7, 8]) { M.setObj(x, 4, 'lh_fall'); M.walkable(x, 4); } M.exit(5, 4, 4, 1, 'mercury_lh_top', 23, 19, DIR.UP, { door: true }); }
  M.def.onPsy = (name, x, y, F, o) => { if (name === 'Ply' && x === 10 && y === 4 && !G.flag('lh_rainbow')) return STORY.rainbowPly; return false; };
} });

// ---- the aerie: the beacon burning already, the far lift with Jenna and Kraden, Saturos, and Alex ----
const LH_TOP = lhGrid(27, 23, (set) => {
  set(10, 1, 16, 7, '.'); set(9, 2, 17, 6, '.'); set(12, 8, 14, 20, '.');                         // the beacon's platform and the walk down from it
  set(1, 10, 5, 20, '.'); set(21, 10, 25, 20, '.'); set(6, 16, 11, 16, '.'); set(15, 16, 20, 16, '.');   // the two towers and the bridges to them
  set(11, 16, 11, 16, 'i'); set(15, 16, 15, 16, 'i');                                               // each bridge has its gap
  set(9, 8, 17, 22, 'T'); set(12, 8, 14, 20, '.'); set(1, 21, 5, 22, 'T'); set(21, 21, 25, 22, 'T');   // the towers' brick bodies below their tops
  set(11, 16, 11, 16, 'j'); set(15, 16, 15, 16, 'j'); set(9, 16, 10, 16, '.'); set(16, 16, 17, 16, '.');
});
lhRoom('mercury_lh_top', 'Mercury Lighthouse - Aerie', LH_TOP, { sky: true, def: { entry: { x: 23, y: 19 }, enc: [], music: 'lhtop', retreat: null, base: 'sky' }, build(M) {
  // the lift back down on the east tower, the Psynergy Stone beside it, the other lift on the west tower
  M.set(23, 20, 'lh_slide'); M.exit(23, 20, 1, 1, 'mercury_lh_rainbow', 7, 7, DIR.DOWN); M.walkable(23, 20);
  M.set(3, 20, 'lh_slide'); M.setObj(23, 12, 'psystone');
  M.fill(11, 2, 5, 5, 'marble'); M.beacon(12, 3, 'mercury', true);
  M.trigger(12, 15, 3, 3, STORY.mercuryAerie, { once: 'mercury_aerie_scene' });
  M.def.onBeacon = STORY.mercuryBeaconTouch;
} });
