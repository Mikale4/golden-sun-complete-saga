// ---------- Crossbone Isle ----------
// Deadbeard's island, laid out after map references/golden-sun-crossbone-isle-gba-map.webp and the walkthrough's
// Appendix C. It is reached two ways: the Tolbi-bound ship drifts here when all four oarsmen are weak, and the
// Tempest Lizard's tornado at the end of Suhalla Desert carries the party here (and back) if it is left alone.
// Outside: the terraced island under the falls - three sprouts up the west face (Growth), the Nut in the tree by
// the river (Catch), three slides off the top terrace to the ledges below (1 Coin; the log and the Mint; the bush
// that Whirlwind clears from the cave mouth). Inside: a ramp winds down through nine landings, each with a
// skull-carved door the floor's guardians hold, a puzzle room beyond it with four chests, and a pit across the
// ramp that the room's far exit lets you round - a pillar laid across it spares the trip next time. B1 pillars on
// the hopping tiles, B2 the poles around the Mystery Blade, B3 the four Blue Keys caught off their pedestals and
// the Red Key that Reveal shows, B4 the watching statues (Halt when they stand aside; Cloak past the last), B5 the
// poles and the drained pool, B6 Bane fleeing across the pillars and ladders, B7 the block Carried into the gaps,
// B8 the puddles frozen over the cracks, B9 the poles afloat on the two pools; at the bottom the pirate ship, the
// last Mimic, Deadbeard, and the Demon Mail.
'use strict';
const CB_RETREAT = { map: 'crossbone', x: 12, y: 30, dir: DIR.DOWN };
// the guardians behind each door and what beating them leaves on the step
const CB_GUARDS = [null,
  { foes: ['Virago', 'Virago', 'Hobgoblin'], prize: 'Lucky Medal' },
  { foes: ['Grisly', 'Grisly', 'Succubus'], prize: 'Potion' },
  { foes: ['Fiendish Ghoul', 'Fiendish Ghoul', 'Lich'], prize: 'Psy Crystal' },
  { foes: ['Gryphon', 'Gryphon'], prize: 'Potion' },
  { foes: ['Stone Soldier', 'Stone Soldier', 'Harridan', 'Lizard King'], prize: 'Psy Crystal' },
  { foes: ['Chimera', 'Chimera'], prize: 'Potion' },
  { foes: ['Earth Lizard', 'Earth Lizard'], prize: 'Water of Life' },
  { foes: ['Thunder Lizard', 'Thunder Lizard', 'Poison Toad'], prize: 'Water of Life' },
  { foes: ['Cerebus', 'Cerebus'], prize: null }];

// ==================== the island ====================
const CBI_ROWS = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTwwTTT',
  'T##########################wwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGnGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#######s######s#####s#####wwTTT',
  'T#G3G##GBGG##GGGGG####GGG##wwTTT',
  'T#GGG##GGGG##GGGGG####GGG##WWTTT',
  'T#GGG##GGGG##GGGGG####l####WWTTT',
  'T######GGGG##GGGGG##GGGGG##WWTTT',
  'T######GGGG##GGGGG##GGGGG##WWTTT',
  'T#G2G###s######s#####s#####WWTTT',
  'T#GGG######################WWTTT',
  'T#GGG######################WWTTT',
  'T#GGG######################WWTTT',
  'T##########################WWTTT',
  'T##########################wwTTT',
  'T#G1GGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'T#GGGGGGGGGGGGGGGGGGGGGGGGGwwTTT',
  'TSSSSSSSSSSSSSSSSSSSSSSSSSSwwTTT',
  'TSSSSSSSSSSSSSSSSSSSSSSSSSSwwTTT',
  'TSSSSSSSSSSSSSSSSSSSSSSSSSSwwTTT',
  'TTTTTTTTTTTSSTTTTTTTTTTTTTTwwTTT',
];

const CBI_LEGEND = { 'G': 'grass', 'S': 'sand', 'w': 'water', 'W': 'waterfall', 's': 'cb_slide', 'T': { ground: 'grass', obj: 'tree' },
  'n': { ground: 'grass', obj: 'tree' }, 'B': 'grass', 'l': 'grass', '1': 'grass', '2': 'grass', '3': 'grass' };
defineMap('crossbone', {
  name: 'Crossbone Isle', w: 32, h: 34, base: 'grass', music: 'dungeon', bg: 'water', entry: { x: 12, y: 30 }, enc: [], retreat: CB_RETREAT,
  build(M) {
    M.paint(0, 0, CBI_ROWS, CBI_LEGEND, { cliff: '#', set: 'cliff', faces: 2 });
    // the slides: off the top terrace onto the three ledges, off the ledges onto the plain
    M.def.fall = (x, y) => y === 10 ? { map: 'crossbone', x, y: x === 8 ? 13 : x === 15 ? 13 : 14 } : { map: 'crossbone', x, y: 23 };
    // the sprouts up the west face: Growth raises a vine to the terrace above each
    M.object('sprout', 3, 22, { id: 'cb_sprout_1', top: 19 }); M.object('sprout', 3, 16, { id: 'cb_sprout_2', top: 13 }); M.object('sprout', 3, 11, { id: 'cb_sprout_3', top: 9 });
    // the Nut in the tree by the river (Catch), the chests off the slides, the log on ledge R's neck
    M.object('catchable', 25, 2, { id: 'cb_nut', item: 'Nut', look: 'tree' });
    M.chest(15, 12, 'Coins', 1, { coins: 1 }); M.chest(23, 11, 'Mint', 1);
    M.object('log', 22, 13, { id: 'cb_log', len: 1, horiz: true });
    // the bush over the cave mouth on ledge L: Whirlwind clears it and the door is there
    if (!G.flag('cb_mouth_open')) M.object('leaves', 8, 11, { id: 'cb_bush', onClear: function* (E) { G.set('cb_mouth_open'); G.map.setObj(8, 11, 'door_cave'); G.map.walkable(8, 11); G.map.finalize(); yield E.say('Behind the bush, a dark mouth opens into the rock - the way down into Crossbone Isle.'); } });
    else { M.setObj(8, 11, 'door_cave'); M.walkable(8, 11); }
    M.exit(8, 11, 1, 1, 'crossbone_path', 7, 26, DIR.UP, { door: true, cond: () => G.flag('cb_mouth_open') });
    // the beach: the ship's boat waits here when the ship brought you; otherwise the tornado's way back
    M.exit(11, 33, 2, 1, 'suhalla_desert', 23, 65, DIR.DOWN, { cond: () => !G.flag('ship_at_crossbone') }); M.walkable(11, 33, 2, 1);   /* where the tornado sets the party down (the trigger before it does the carrying): the way off the isle leads to the desert, not the open world */
    M.trigger(11, 33, 2, 1, STORY.shipFromCrossbone, { cond: () => G.flag('ship_at_crossbone') });
    M.trigger(11, 32, 2, 1, STORY.cbTornadoBack, { cond: () => !G.flag('ship_at_crossbone') });
    M.sign(14, 29, "Crossbone Isle. Sailors' tale: Deadbeard the pirate sank his own ship in a pit under the island, and sits on his hoard in it still.");
  }
});
// the tornado that brought the party sets them down again outside Suhalla Desert's far end
STORY.cbTornadoBack = function* (E) {
  if (G.flag('ship_at_crossbone')) return;
  const r = yield* E.ask('The tornado still whirls over the water south of the beach. Let it carry you back to Suhalla?', null, ['Yes', 'No']); if (r !== 0) { yield E.move('player', DIR.UP, 1); return; }
  yield E.say('The wind takes the party up, spinning, and the island drops away below...');
  yield Engine.fadeOut(30); E.warpNow('suhalla_desert', 23, 65, DIR.DOWN); yield Engine.fadeIn(30);
};

// ==================== the way down ====================
const CBP_ROWS = [
  '################',
  '############B###',
  '###########...##',
  '###########...##',
  '###########...##',
  '###########...##',
  '###########...##',
  '###########...##',
  '##............##',
  '##............##',
  '##............##',
  '##...###########',
  '##...###########',
  '##...###########',
  '##...###########',
  '##...###########',
  '##...###########',
  '##...###########',
  '##.......#######',
  '##.......#######',
  '##.......#######',
  '######...#######',
  '######...#######',
  '######...#######',
  '######...#######',
  '######...#######',
  '######...#######',
  '#######A########',
];

const CBP_LEGEND = { '.': 'cave', 'A': { ground: 'cave', obj: 'door_cave', walk: true }, 'B': { ground: 'cave', obj: 'stairs_down', walk: true } };
defineMap('crossbone_path', {
  name: 'Crossbone Isle', w: 16, h: 28, base: 'cavewalltop', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 7, y: 26 }, enc: [], retreat: CB_RETREAT,
  build(M) {
    M.paint(0, 0, CBP_ROWS, CBP_LEGEND, { cliff: '#', set: 'brownrock', faces: 2 });
    M.exit(7, 27, 1, 1, 'crossbone', 8, 12, DIR.DOWN, { door: true });
    M.exit(12, 1, 1, 1, 'crossbone_l1', 22, 2, DIR.DOWN, { stairs: true });
    M.setObj(9, 8, 'torch'); M.setObj(3, 19, 'torch'); M.light(9, 8, 3); M.light(3, 19, 3);
    M.sign(12, 3, 'Nine floors down lies the pirate ship. Each door is held by the floor\'s guardians; touch it and they come.');
  }
});

// ==================== the landings ====================
const CBL_ROWS = [
  '############################',
  '######################..####',
  '#####################...####',
  '####################...#####',
  '###################...######',
  '##################...#######',
  '###########pDp###...########',
  '########..........##########',
  '########..........##########',
  '########..........##########',
  '########PPPPPPPPPP##########',
  '########..........##########',
  '########..........##########',
  '######....##################',
  '####....####################',
  '##....######################',
  '....########################',
  '############################',
  '############################',
  '############################',
];

const CBL_LEGEND = { '.': 'cave', 'P': 'pit', 'D': { ground: 'cave', obj: 'door_cave', walk: true }, 'p': { ground: 'cave', obj: 'pillar_top' } };
// touching a floor's door calls its guardians out; beating them opens it and leaves their prize on the step
STORY.cbGuardian = (n) => function* (E) {
  if (G.flag('cb_guard_' + n)) return;
  const gd = CB_GUARDS[n];
  yield E.say(n === 1 ? "A heavy door carved with a grinning skull. As Isaac's hand touches it the carving's eyes glow, and something steps out of the dark!" : 'The skull over the door glows. The floor\'s guardians come out of the dark!');
  const r = yield* E.battle(gd.foes, { boss: true, canFlee: false });
  if (r !== 'win') return;
  G.set('cb_guard_' + n); const o = G.map.objects.find(ob => ob.id === 'cb_gate_' + n); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); }
  yield E.say('The door swings open.'); if (gd.prize) yield E.give(gd.prize);
};
function cbLanding(n) {
  const id = 'crossbone_l' + n, floor = 'crossbone_b' + n;
  defineMap(id, {
    name: 'Crossbone Isle B' + n, w: 28, h: 20, base: 'cavewalltop', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 22, y: 2 }, enc: [], retreat: CB_RETREAT,
    build(M) {
      M.paint(0, 0, CBL_ROWS, CBL_LEGEND, { cliff: '#', set: 'brownrock', faces: 2 });
      // E, the way up; the door; the pit and the pillar below it; F, the way on down
      if (n === 1) M.exit(22, 1, 2, 1, 'crossbone_path', 12, 2, DIR.DOWN, { stairs: true }); else M.exit(22, 1, 2, 1, 'crossbone_l' + (n - 1), 1, 16, DIR.RIGHT);
      if (!G.flag('cb_guard_' + n)) M.object('gate', 12, 6, { id: 'cb_gate_' + n, tile: 'door_locked', state: 'shut', script: STORY.cbGuardian(n) });
      M.exit(12, 6, 1, 1, floor, 12, 20, DIR.UP, { door: true, cond: () => G.flag('cb_guard_' + n) });
      M.object('pillar', 12, 11, { id: 'cb_pillar_' + n });
      M.exit(0, 16, 1, 1, n < 9 ? 'crossbone_l' + (n + 1) : 'crossbone_ship', n < 9 ? 22 : 21, n < 9 ? 2 : 7, n < 9 ? DIR.DOWN : DIR.LEFT);
      M.setObj(9, 6, 'torch'); M.setObj(15, 6, 'torch'); M.light(9, 6, 3); M.light(15, 6, 3);
      M.sign(16, 12, n < 9 ? 'The ramp goes on down past the pit. A pillar laid across it would make the way back easier.' : 'The bottom of the pit. The pirate ship lies beyond - and Deadbeard with it. Turn back if you doubt.');
    }
  });
}
for (let n = 1; n <= 9; n++) cbLanding(n);

// ==================== the puzzle floors ====================
const CBF_LEGEND = { '.': 'cb_floor', 'c': 'chasm', 'P': 'pit', 'g': 'cb_pedestal', 'w': 'water', 'q': 'puddle_gap', 's': 'cb_slide',
  'X': { ground: 'cb_floor', obj: 'stairs_up', walk: true }, 'D': { ground: 'cb_floor', obj: 'door_cave', walk: true }, 'L': { ground: 'cb_floor', obj: 'ladder', walk: true } };
const CBC_LEGEND = Object.assign({}, CBF_LEGEND, { '.': 'cave', 'X': { ground: 'cave', obj: 'stairs_up', walk: true }, 'D': { ground: 'cave', obj: 'door_cave', walk: true }, 'L': { ground: 'cave', obj: 'ladder', walk: true } });
function cbFloor(n, rows, legend, set, build) {
  let ex = null, en = null;
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { if (r[x] === 'X') ex = [x, y]; if (r[x] === 'D') en = [x, y]; } });
  defineMap('crossbone_b' + n, {
    name: 'Crossbone Isle B' + n, w: rows[0].length, h: rows.length, base: 'cavewalltop', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: en[0], y: en[1] - 1 }, enc: [], retreat: CB_RETREAT,
    build(M) {
      M.paint(0, 0, rows, legend, { cliff: '#', set, faces: 2 });
      M.exit(en[0], en[1], 1, 1, 'crossbone_l' + n, 12, 7, DIR.DOWN, { door: true });      // back out to the landing, above the pit
      M.exit(ex[0], ex[1], 1, 1, 'crossbone_l' + n, 12, 12, DIR.DOWN, { stairs: true });   // the far exit: down to the landing below the pit
      build(M);
    }
  });
}

// ---- B1: the hopping tiles and the pillars laid across the wider gaps ----
const CB1_ROWS = (() => { const r = []; for (let y = 0; y < 22; y++) { let s = ''; for (let x = 0; x < 26; x++) s += (y === 0 || y === 21 || x === 0 || x === 25) ? '#' : '.'; r.push(s); } r[0] = r[0].slice(0, 12) + 'X' + r[0].slice(13); r[21] = r[21].slice(0, 12) + 'D' + r[21].slice(13); return r; })();
cbFloor(1, CB1_ROWS, CBF_LEGEND, 'purplerock', (M) => {
  for (let y = 4; y <= 17; y++) for (let x = 1; x <= 24; x++) M.set(x, y, 'chasm');
  for (let y = 18; y <= 20; y++) for (let x = 1; x <= 24; x++) if (x < 10 || x > 14) M.set(x, y, 'chasm');
  const plat = (x, y) => M.set(x, y, 'cb_floor');
  for (let y = 6; y <= 16; y += 2) for (let x = 2; x <= 24; x += 2) plat(x, y);
  // the wider gaps: to the exit, and around the Hard Nut, the 111 Coins and the Nut
  for (const [x, y] of [[4, 6], [2, 8], [4, 16], [2, 14], [22, 16], [24, 14]]) M.set(x, y, 'chasm');
  for (const [x, y] of [[3, 6], [3, 16], [23, 16], [23, 6], [13, 12], [7, 6], [12, 7], [7, 16], [19, 16]]) plat(x, y);
  M.object('pillar', 12, 6, { id: 'cb1_pa' }); M.object('pillar', 6, 6, { id: 'cb1_pb' }); M.object('pillar', 6, 16, { id: 'cb1_pc' }); M.object('pillar', 20, 16, { id: 'cb1_pd' });
  M.chest(24, 6, 'Antidote', 1); M.chest(2, 6, 'Hard Nut', 1); M.chest(2, 16, 'Coins', 1, { coins: 111 }); M.chest(24, 16, 'Nut', 1); M.chest(14, 12, 'Potion', 1, { mimic: 'Mimic #8' });
  M.sign(2, 2, 'The tiles stand over a black drop; hop tile to tile, and lay a pillar where the gap is too wide for a jump.');
});

// ---- B2: the poles about the Mystery Blade ----
const CB2_ROWS = [
  '############X#############',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#........................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '#...#....................#',
  '############D#############',
];
cbFloor(2, CB2_ROWS, CBF_LEGEND, 'purplerock', (M) => {
  M.chest(22, 2, 'Lucky Pepper', 1); M.chest(22, 12, 'Coins', 1, { coins: 222 }); M.chest(12, 18, 'Elixir', 1); M.chest(2, 10, 'Mystery Blade', 1);
  // the pole across the way through the wall, and the two that stand where you would have to stand to roll it
  M.object('log', 5, 10, { id: 'cb2_hb', len: 3, horiz: true });
  M.object('log', 6, 7, { id: 'cb2_vc', len: 3, horiz: false }); M.object('log', 6, 11, { id: 'cb2_vd', len: 3, horiz: false });
  M.object('log', 14, 4, { id: 'cb2_ha', len: 3, horiz: true }); M.object('log', 18, 13, { id: 'cb2_ve', len: 3, horiz: false });
  M.sign(8, 2, 'Poles of stone lie about the hall. They roll when walked into - but not along their length.');
});

// ---- B3: the four Blue Keys on their pedestals, the Red Key that Reveal shows, the five doors ----
const CB3_ROWS = [
  '##########################',
  '####.####.####.####.######',
  '####.####.####.####.######',
  '#X.......................#',
  '##.......................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '############D#############',
];
cbFloor(3, CB3_ROWS, CBC_LEGEND, 'purplerock', (M) => {
  const key = (x, y, item, opts) => { M.set(x, y, 'cb_pedestal'); M.object('catchable', x, y, Object.assign({ id: 'cb3_' + item.replace(' ', '_') + '_' + x, item, look: item === 'Red Key' ? 'key_red' : 'key_blue' }, opts || {})); };
  key(7, 8, 'Blue Key'); key(16, 6, 'Blue Key'); key(20, 12, 'Blue Key'); key(5, 15, 'Blue Key'); key(22, 6, 'Red Key', { hiddenUntilReveal: true });
  // the pedestals nobody reaches on foot: a scatter of them, the keys among them
  for (const [x, y] of [[4, 6], [10, 10], [13, 13], [18, 9], [9, 17], [14, 16], [20, 16], [3, 11], [23, 14], [11, 6]]) M.set(x, y, 'cb_pedestal');
  const door = (x, y, item, id) => M.object('gate', x, y, { id, tile: 'door_locked', state: G.flag('obj:' + id + ':open') ? 'open' : 'shut', script: function* (E) {
    const o = G.map.objects.find(ob => ob.id === id); if (!o || o.state === 'open') return;
    if (!G.inventory.has(item)) { yield E.say(item === 'Red Key' ? 'A red door, locked. A red keyhole.' : 'A blue door, locked. A blue keyhole.'); return; }
    G.inventory.remove(item); o.state = 'open'; G.set('obj:' + o.key, { state: 'open' }); G.set('obj:' + id + ':open'); Audio.sfx('door'); yield E.say('The ' + item + ' turns. The door opens.'); } });
  door(4, 2, 'Blue Key', 'cb3_door_a'); door(9, 2, 'Blue Key', 'cb3_door_b'); door(14, 2, 'Blue Key', 'cb3_door_c'); door(19, 2, 'Blue Key', 'cb3_door_d'); door(2, 3, 'Red Key', 'cb3_door_r');
  M.chest(4, 1, 'Coins', 1, { coins: 333 }); M.chest(9, 1, 'Fairy Ring', 1); M.chest(14, 1, 'Cookie', 1); M.chest(19, 1, 'Smoke Bomb', 1);
  M.sign(12, 19, 'Four blue doors and a red one. The keys lie on pedestals no one can climb - reach for them from the floor.');
});

// ---- B4: the watching statues ----
const CB4_ROWS = [
  '##X#######################',
  '#....#######.#############',
  '#..#########.#############',
  '#..#########.#############',
  '#..#####.........#########',
  '#..#.....................#',
  '#..#.....................#',
  '#..#.....................#',
  '#..#########.#############',
  '#..#########.#############',
  '#..#########.#############',
  '#..#########.#############',
  '#..#########.#############',
  '#..#########.#############',
  '#..##................#####',
  '#..##................#####',
  '#..##................#####',
  '#....................#####',
  '#####................#####',
  '#####................#####',
  '#####................#####',
  '############D#############',
];
// a statue that sees the party throws them back down the hall
STORY.cbStatue = function* (E) {
  yield E.say("The statue's eyes blaze! An unseen force shoves the party back down the passage!");
  Engine.doShake(8); yield Engine.fadeOut(10); E.warpNow('crossbone_b4', 12, 19, DIR.UP); yield Engine.fadeIn(10);
};
cbFloor(4, CB4_ROWS, CBF_LEGEND, 'purplerock', (M) => {
  M.chest(4, 1, 'Psy Crystal', 1); M.chest(12, 1, 'Coins', 1, { coins: 444 }); M.chest(4, 6, 'Sleep Bomb', 1); M.chest(24, 6, 'Storm Gear', 1);
  const statue = (id, x, y, face, patrol) => M.npc(id, x, y, { animal: 'statue', name: 'Statue', dir: face, sight: 6, haltable: true, solid: true, move: patrol ? 'patrol' : 'static', patrol, face, patrolWait: 45, script: STORY.cbStatue, text: '' });
  statue('cb4_s1', 6, 5, DIR.RIGHT, [[6, 5], [6, 7]]); statue('cb4_s2', 10, 4, DIR.DOWN, [[10, 4], [14, 4]]); statue('cb4_s3', 20, 7, DIR.LEFT, [[20, 7], [20, 5]]); statue('cb4_s4', 1, 10, DIR.DOWN, null);
  for (const [x, y] of [[8, 6], [16, 6], [12, 9], [2, 13], [12, 17]]) M.light(x, y, 3);
  M.sign(6, 18, 'The statues watch the passages. What they see, they throw back. Halt one where it stands aside; Cloak, and pass in the dark.');
});

// ---- B5: the poles, and the pool a lever drains ----
const CB5_ROWS = [
  '############X#############',
  '#...#..............#.....#',
  '#...#..............#.....#',
  '#...#..............#.....#',
  '##.##..............#.....#',
  '#..................#.....#',
  '#..................#.....#',
  '#..................#.....#',
  '#...............#wwwwwwww#',
  '#####...........#wwwwwwww#',
  '#...#...........#wwwwwwww#',
  '#...#............wwwwwwww#',
  '#...#...........#wwwwwwww#',
  '##.##...........#wwwwwwww#',
  '#...............#wwwwwwww#',
  '#...............#wwwwwwww#',
  '#................#########',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '############D#############',
];
cbFloor(5, CB5_ROWS, CBC_LEGEND, 'lilacrock', (M) => {
  M.chest(8, 1, 'Coins', 1, { coins: 555 }); M.chest(2, 2, 'Potion', 1); M.chest(2, 11, 'Ninja Garb', 1); M.chest(22, 2, 'Lucky Medal', 1);
  if (G.flag('cb5_drained')) for (let y = 8; y <= 15; y++) for (let x = 17; x <= 24; x++) M.set(x, y, 'cave');
  M.object('log', 2, 5, { id: 'cb5_vb', len: 3, horiz: false }); M.object('log', 2, 14, { id: 'cb5_va', len: 3, horiz: false });
  M.object('log', 8, 8, { id: 'cb5_hd', len: 3, horiz: true }); M.object('log', 12, 13, { id: 'cb5_ve', len: 3, horiz: false });
  M.object('lever', 15, 10, { id: 'cb5_lever', onPull: function* (E) { const d = !G.flag('cb5_drained'); G.set('cb5_drained', d); Audio.sfx('quake'); Engine.doShake(10); yield E.say(d ? 'The lever grinds over. Somewhere below, water roars away - the pool drains to its bed!' : 'The lever grinds back. The pool fills again.'); const p = G.field.player; yield Engine.fadeOut(10); E.warpNow('crossbone_b5', p.tx, p.ty, p.dir); yield Engine.fadeIn(10); } });
  M.sign(14, 18, 'A pool fills the east of the cave. The lever by its wall works a sluice.');
});

// ---- B6: Bane, the pillars, the ladders and the frozen crack ----
const CB6_ROWS = [
  '############X#############',
  '#.................#......#',
  '#.................#......#',
  '###...............#cccccc#',
  '#..cc.....#...#..........#',
  '#..cq.....#...#..........#',
  '#..cc.....#...#..........#',
  '###.......#...#..........#',
  '#........................#',
  '#........................#',
  '###L##################L###',
  '###L##################L###',
  '###L##################L###',
  '#........................#',
  '#..........#.#...........#',
  '#..........#.#...........#',
  '#..........#.#...........#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '############D#############',
];
const CB6_BANE = [[1, 1], [24, 8], [1, 20]];
cbFloor(6, CB6_ROWS, CBF_LEGEND, 'purplerock', (M) => {
  M.chest(24, 1, 'Elixir', 1); M.chest(1, 5, 'Coins', 1, { coins: 666 }); M.chest(12, 4, 'Demon Axe', 1); M.chest(12, 14, 'Water of Life', 1);
  M.object('pillar', 12, 7, { id: 'cb6_p1' }); M.object('pillar', 12, 17, { id: 'cb6_p2' });
  M.setObj(7, 18, 'rock_small');
  // the nooks are entered only past their pillars: the Demon Axe's mouth is one cell wide, the Water of Life's is
  // shut from above; the Elixir's ledge is jumped to from the one place the third pillar stands on
  for (const [x, y] of [[11, 7], [13, 7], [12, 13], [11, 3], [12, 3], [13, 3]]) { M.setObj(x, y, 'pr_face'); M.block(x, y); }
  for (let x = 19; x <= 24; x++) if (x !== 21) { M.set(x, 3, 'pit'); M.block(x, 3); }
  M.object('pillar', 21, 4, { id: 'cb6_p3' });
  // Bane: the last Venus Djinni, who runs at the sight of you until Halt holds him
  if (!(G.party ? G.party.djinnFound : []).includes('Bane')) {
    const st = G.get('cb6_bane') || 0; const [bx, by] = CB6_BANE[Math.min(st, 2)];
    M.npc('BaneNPC', bx, by, { animal: 'djinni', animalCol: 0, name: 'Bane', haltable: true, solid: true, script: function* (E) {
      const n = E.actor('BaneNPC');
      if (n && n.halted > 0) { yield E.say('The Venus Djinni, held fast by Halt, stops squirming... and grins.'); yield E.say("Bane: 'Caught! Fair is fair. Nobody's chased me nine floors down before. I'm yours.'", 'Bane'); n.hidden = true; G.set('bane_caught'); yield* E.djinn('Bane'); return; }
      const s = (G.get('cb6_bane') || 0) + 1; G.set('cb6_bane', s); const to = CB6_BANE[Math.min(s, 2)];
      yield E.say(s === 1 ? 'The Djinni squeaks and bolts across the hall!' : s === 2 ? 'The Djinni darts off again - down the ladder this time!' : 'The Djinni scrambles away to the other side of the hall. It will not be caught by hand.');
      if (n) { n.tx = to[0]; n.ty = to[1]; n.px = n.tx * TILE; n.py = n.ty * TILE; } } });
  }
  M.sign(8, 19, 'Something small and quick is loose in this hall. Halt stops what feet cannot catch.');
});

// ---- B7: the block Carried into the gaps ----
const CB7_ROWS = [
  '############X#############',
  '#...####.................#',
  '#...####.................#',
  '#...####.................#',
  '#...####.................#',
  '#...####.................#',
  '#ccc####.................#',
  '#ccc####.................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#..............###########',
  '#................cc......#',
  '#..............###########',
  '#........................#',
  '###########..............#',
  '#...cc...................#',
  '###########..............#',
  '#........................#',
  '#........................#',
  '#........................#',
  '############D#############',
];
cbFloor(7, CB7_ROWS, CBC_LEGEND, 'crystal', (M) => {
  M.chest(2, 1, 'Psy Crystal', 1); M.chest(24, 12, 'Lucky Medal', 1); M.chest(1, 16, 'Wicked Mace', 1); M.chest(20, 1, 'Coins', 1, { coins: 777 });
  M.object('carriable', 12, 19, { id: 'cb7_block', tile: 'crate' });
  M.sign(9, 18, 'A square block of stone, cut to the width of a crack. Carry lifts it; set it down where the gap is widest, and a jump does the rest.');
});

// ---- B8: the puddles frozen over the cracks, the slides, the pillar laid in the crack ----
const CB8_ROWS = [
  '############X#############',
  '#..cc...............cc...#',
  '#..cc...............cc...#',
  '#..cc...............cc...#',
  '#..cq...............qc...#',
  '#..cc...............cc...#',
  '#..cc...............cc...#',
  '#..cc...............cc...#',
  '#..cc...............cc...#',
  '#####s######L#######s#####',
  '#####s######L#######s#####',
  '#####s######L#######s#####',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '##########...............#',
  '#.....cc.................#',
  '##########...............#',
  '#........................#',
  '############D#############',
];
cbFloor(8, CB8_ROWS, CBC_LEGEND, 'crystal', (M) => {
  M.def.fall = (x, y) => ({ map: 'crossbone_b8', x, y: 13 });
  M.chest(1, 4, 'Potion', 1); M.chest(24, 4, 'Coins', 1, { coins: 888 }); M.chest(16, 1, 'Smoke Bomb', 1); M.chest(1, 18, "Cleric's Ring", 1);
  M.object('pillar', 8, 18, { id: 'cb8_pillar' });
  M.setObj(18, 14, 'dragon_statue'); M.setObj(18, 15, 'statue');
  M.sign(12, 15, 'Cracks split the upper ledge, and water lies in two of them. Frost makes a pillar of a puddle. The slides go down only.');
});

// ---- B9: the poles afloat on the two pools ----
const CB9_ROWS = [
  '############X#############',
  '#...#....................#',
  '#...#....................#',
  '#wwwwwwwwwwwwwwwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwww...wwww#',
  '#wwwwwwwwww...wwww...wwww#',
  '#wwwwwwwwww...wwww...wwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#wwwwwwwwww...wwwwwwwwwww#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '############D#############',
];
cbFloor(9, CB9_ROWS, CBC_LEGEND, 'mossrock', (M) => {
  M.chest(2, 1, 'Muramasa', 1); M.chest(22, 1, 'Sleep Bomb', 1); M.chest(12, 4, 'Water of Life', 1); M.chest(19, 8, 'Coins', 1, { coins: 999 });
  M.object('log', 7, 12, { id: 'cb9_v1', len: 3, horiz: false, afloat: true }); M.object('log', 2, 12, { id: 'cb9_v2', len: 3, horiz: false, afloat: true });
  M.object('log', 14, 9, { id: 'cb9_h1', len: 3, horiz: true, afloat: true });
  M.sign(9, 16, 'Poles float on the pools. Step aboard and walk; the pole goes where you walk, as far as the water lets it.');
});

// ==================== the pirate ship ====================
const CBS_ROWS = [
  '~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~RRRRRRRRRR~~~~~~~',
  '~~~~~~R.WWWWWW...R~~~~~~',
  '~~~~~~R.W....W.m.R~~~~~~',
  '~~~~~~R.WdWWWW...R~~~~~~',
  '~~~~~~R..........R~~~~~~',
  '~~~~~~R..........B~~~~~~',
  '~~~~~~R..........R~~~~~~',
  '~~~~~~R..........R~~~~~~',
  '~~~~~~R..........R~~~~~~',
  '~~~~~~RRRRRRRRRRRR~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~',
];
defineMap('crossbone_ship', {
  name: 'Pirate Ship', w: 24, h: 13, base: 'grass', music: 'dungeon', bg: 'cave', entry: { x: 21, y: 7 }, enc: [], retreat: CB_RETREAT,
  build(M) {
    M.paint(0, 0, CBS_ROWS, { '~': 'grass', '.': 'ship_deck', 'R': { ground: 'ship_deck', obj: 'ship_rail' }, 'W': { ground: 'ship_deck', obj: 'wall_wood' }, 'd': { ground: 'ship_deck', obj: 'door', walk: true }, 'm': { ground: 'ship_deck', obj: 'mast' }, 'h': { ground: 'ship_deck', obj: 'stairs_down' }, 'B': 'bridge' }, { cliff: null });
    for (let y = 0; y < 13; y++) for (let x = 0; x < 24; x++) if (CBS_ROWS[y][x] === '~' && (x < 2 || x > 21 || y < 1 || y > 11) && y !== 7) M.setObj(x, y, 'tree');
    M.walkable(17, 7); M.exit(22, 7, 1, 1, 'crossbone_l9', 1, 16, DIR.RIGHT); M.setObj(23, 7, 'tree');
    // the last Mimic on the deck, Deadbeard's cabin, the Demon Mail in it
    M.chest(13, 9, 'Potion', 1, { mimic: 'Mimic #9' });
    M.walkable(9, 5); M.exit(9, 5, 1, 1, 'crossbone_cabin', 5, 6, DIR.UP, { door: true });
    M.npc('cb_ghost', 12, 4, { type: 'sailor', name: 'Ghost', text: "...the cap'n's below. He don't like visitors. He don't like anything, any more..." });
    M.sign(15, 9, "Deadbeard's ship. The hull is sound and the sails are rags. The cabin door is shut.");
  }
});
Kit.interior('crossbone_cabin', { name: "Deadbeard's Cabin", w: 11, h: 8, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'crossbone_ship', x: 9, y: 6 }, furn: [['bookshelf', 4, 1], ['bookshelf', 6, 1], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['bookshelf', 1, 1], ['barrel', 9, 1]],
  build(M) { M.chest(5, 1, 'Demon Mail', 1); M.boss('Deadbeard', 5, 2, { done: 'deadbeard_done', script: STORY.deadbeard, solid: true }); } });   // the hoard's last chest is behind his chair
