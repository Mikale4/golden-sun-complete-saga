// ---------- Yampi Desert Cave ----------
// The guide's optional-dungeon section (lines 10060-10160): from the desert's rear entrance, Sand up the leftmost
// sand slide (the arrow of rocks Reveal shows points at it) to the crack in the wall; the outer cave and its one
// chest (Water of Life); the circle for Teleport, and the inner dungeon: Sand at the north to the broken pillar,
// Burst; the back room's logs pushed aside and Sand to the stair; the upper level (Scoop on the left: Mythril
// Silver; Sand to the pillar, Move it onto its tile - the door below wants it), the Dark Matter to the south, the
// logs below (rolled in their order, Sand to get behind them), the ladder and the column beyond, the Orihalcon and
// the cracked pillar; the sand of the first chamber's left stair where Crystal burrows (Scoop as it passes, or
// Halt it); Pound on the cone; and Valukar, the guardian of fire, before Daedalus' tablet. No rip of the cave in
// the references: laid from the text.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC = [['Fire Dragon'], ['Minos Knight'], ['Sand Scorpion', 'Sand Scorpion'], ['Soul Army'], ['Winged Lizard', 'Winged Lizard']];
  const RETREAT = { map: 'yampi_10', x: 9, y: 11, dir: DIR.RIGHT };
  const LEG = {
    '.': 'cave_sand', ',': 'cave_pebbles', 's': 'sandsoft', 'p': 'chasm', 'o': { ground: 'cave_sand', obj: 'rock_sand' },
    'L': { ground: 'cave_sand', obj: 'ladder', walk: true }, 'D': { ground: 'cave_sand', obj: 'door_cave', walk: true }, 'U': { ground: 'cave_sand', obj: 'stairs_up', walk: true }, 'N': { ground: 'cave_sand', obj: 'stairs_down', walk: true }, 'b': 'jl_button'
  };
  const ROCK = { cliff: '#', set: 'brownrock', faces: 2 };
  const room = (id, name, rows, entry, build, opts) => defineMap(id, Object.assign({ name: 'Yampi Desert Cave' + (name ? ' - ' + name : ''), w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry, enc: ENC, retreat: RETREAT }, opts || {}, { build(M) { M.paint(0, 0, strs(rows), LEG, ROCK); build(M); } }));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const gate = (M, id, x, y, flag) => M.object('gate', x, y, { id, tile: 'door_stone', openTile: 'door_stone', state: G.flag(flag) ? 'open' : 'shut', script: function* (E) { if (G.flag(flag)) return; yield E.say('A stone door, shut fast.'); } });

  // ====================== the outer cave: the chest, the circle ======================
  const O = grid(18, 14, '#');
  fill(O, 3, 3, 14, 11, '.'); fill(O, 8, 11, 9, 12, '.'); O[12][8] = 'D';
  for (const [x, y] of [[4, 4], [13, 10]]) O[y][x] = 'o'; O[6][11] = ',';
  room('yampi_cave', null, O, { x: 8, y: 11 }, (M) => {
    door(M, 8, 12, 'yampi_10', 6, 11, DIR.DOWN);
    M.chest(4, 8, 'Water of Life', 1);
    M.object('tpcircle', 9, 5, { id: 'ydc_circle', tile: 'ml_circle', to: { map: 'ydc_1', x: 9, y: 14 } });
    M.trigger(8, 10, 2, 2, function* (E) { yield E.say('A cave behind the crack in the desert wall. One chest - and a circle cut into the floor at the back, of the kind that answers Teleport.', 'Kraden'); }, { once: 'ydc_seen' });
    M.sign(12, 4, 'Yampi Desert Cave. The circle is the way in; nothing else here goes anywhere.');
  }, { enc: [] });
  // ====================== the first chamber: the circle back, Sand to the cracked pillar, the left stair, the cone ======================
  const C1 = grid(20, 18, '#');
  fill(C1, 3, 12, 16, 15, '.'); fill(C1, 3, 6, 16, 11, '.'); fill(C1, 8, 5, 11, 5, 's'); fill(C1, 8, 2, 11, 4, '.'); fill(C1, 3, 6, 6, 11, '.');
  fill(C1, 7, 8, 7, 11, '#'); C1[10][3] = 'N'; C1[3][8] = 'D'; C1[2][15] = 'D'; fill(C1, 14, 2, 16, 5, '.');
  for (const [x, y] of [[5, 14], [14, 13]]) C1[y][x] = 'o';
  room('ydc_1', 'The First Chamber', C1, { x: 9, y: 14 }, (M) => {
    M.object('tpcircle', 9, 14, { id: 'ydc_circle_in', tile: 'ml_circle', to: { map: 'yampi_cave', x: 9, y: 5 } });
    // the north: a strip of soft sand between the floor and the alcove, and the cracked pillar in the alcove's west door
    M.object('crack', 8, 3, { id: 'ydc_crack1', tile: 'pillar_cracked' }); door(M, 8, 3, 'ydc_2', 15, 12, DIR.LEFT);
    // the cone on the east, Pound: the way to the upper door
    M.object('pillar', 15, 5, { id: 'ydc_cone', tile: 'ml_cone', sunkTile: 'ml_shards' });
    door(M, 15, 2, 'ydc_boss', 8, 13, DIR.UP, { cond: () => G.flag('ydc_pillar_tile') });
    M.walkable(3, 10); M.exit(3, 10, 1, 1, 'ydc_djinn', 3, 3, DIR.DOWN, { stairs: true });
    M.trigger(8, 12, 4, 2, function* (E) { yield E.say('The inner cave. Soft sand lies across the way north - Sand takes us through it - and a pillar with a crack in it stands at the far side.', 'Felix'); }, { once: 'ydc1_seen' });
    M.trigger(14, 4, 3, 1, function* (E) { yield E.say('A door at the top of the east side, and a stone cone before it. Pound the cone; but the door itself is shut, and wants something done elsewhere.', 'Sheba'); }, { once: 'ydc1_cone_seen', cond: () => !G.flag('ydc_pillar_tile') });
    M.sign(4, 12, "The first chamber. Three ways: north through the sand, the stair down on the left, and the door up on the right.");
  });
  // ====================== the back room: the logs pushed aside, Sand to the stair ======================
  const C2 = grid(18, 16, '#');
  fill(C2, 3, 11, 15, 13, '.'); fill(C2, 4, 4, 6, 10, '.'); fill(C2, 4, 2, 6, 3, 's'); C2[1][5] = 'U'; C2[12][16] = 'D';   // the way up the west side, three wide; the soft sand at its top, the stair
  for (const [x, y] of [[13, 12], [8, 11]]) C2[y][x] = 'o';
  room('ydc_2', 'The Back Room', C2, { x: 15, y: 12 }, (M) => {
    door(M, 16, 12, 'ydc_1', 9, 3, DIR.RIGHT);
    // a felled log stands up the middle of the way: rolled to the wall, and two columns of the way are free
    M.object('log', 5, 6, { id: 'ydc_log_a', len: 3, horiz: false });
    M.walkable(5, 1); M.exit(5, 1, 1, 1, 'ydc_3', 4, 14, DIR.UP, { stairs: true });
    M.trigger(4, 10, 4, 1, function* (E) { yield E.say('Logs lie across the way. Roll them aside; the soft sand at the top is Sand work again, and the stair is past it.', 'Piers'); }, { once: 'ydc2_seen' });
  });
  // ====================== the upper level: Scoop, Sand to the pillar, the pillar onto its tile; south to the Dark Matter, down to the logs ======================
  const C3 = grid(22, 18, '#');
  fill(C3, 3, 12, 8, 15, '.'); fill(C3, 3, 3, 18, 11, '.'); fill(C3, 9, 5, 9, 11, 's'); fill(C3, 10, 5, 18, 11, '.'); C3[6][14] = 'b'; C3[15][4] = 'N'; C3[16][15] = 'D'; fill(C3, 14, 12, 16, 15, '.'); C3[11][19] = 'N'; C3[2][12] = 'D';
  for (const [x, y] of [[5, 8], [17, 4]]) C3[y][x] = 'o';
  room('ydc_3', 'The Upper Level', C3, { x: 4, y: 14 }, (M) => {
    M.walkable(4, 15); M.exit(4, 15, 1, 1, 'ydc_2', 5, 2, DIR.DOWN, { stairs: true });
    M.object('scoop', 4, 5, { id: 'ydc_dig', item: 'Mythril Silver', look: 'dig_spot' });
    // the pillar on the east side, beyond a strip of soft sand: Move it onto the marked tile, and the door in the first chamber opens
    M.object('pillar', 16, 8, { id: 'ydc_pillar', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ydc_pillar'); if (o && o.x === 14 && o.y === 6 && !G.flag('ydc_pillar_tile')) { G.set('ydc_pillar_tile'); Engine.doShake(10); Audio.sfx('push'); yield E.say('The pillar settles onto the marked tile, and far below a door grinds open.'); } } });
    door(M, 15, 16, 'ydc_4', 8, 3, DIR.DOWN);
    M.walkable(19, 11); M.exit(19, 11, 1, 1, 'ydc_5', 9, 3, DIR.DOWN, { stairs: true });
    door(M, 12, 2, 'ydc_6', 12, 4, DIR.UP);   // the shortcut up from the Orihalcon's raised section
    M.trigger(3, 12, 3, 2, function* (E) { yield E.say('The upper level. Something is buried on the left - Scoop would have it - and a strip of soft sand cuts the room in two.', 'Kraden'); }, { once: 'ydc3_seen' });
    M.trigger(10, 7, 1, 1, function* (E) { yield E.say('A pillar, and a marked tile up and left of it. Move it there. The way on from here: south to a chest, or the stair down on the right.', 'Jenna'); }, { once: 'ydc3_pillar_seen' });
  });
  // ====================== south of the upper level: the Dark Matter ======================
  const C4 = grid(16, 10, '#');
  fill(C4, 3, 3, 12, 7, '.'); C4[2][8] = 'D';
  room('ydc_4', 'The Dark Matter', C4, { x: 8, y: 3 }, (M) => { door(M, 8, 2, 'ydc_3', 15, 15, DIR.UP); M.chest(4, 6, 'Dark Matter', 1); });
  // ====================== below: the logs, in their order; the ladder to the column, the way down to the Orihalcon ======================
  const C5 = grid(20, 18, '#');
  fill(C5, 3, 6, 16, 8, '.'); fill(C5, 8, 2, 10, 15, '.'); C5[2][9] = 'U'; C5[5][15] = 'L'; C5[15][9] = 'D';   // the cross of corridors: the stair in from the top, the ladder up above the east end, the door down at the bottom
  for (const [x, y] of [[8, 13], [10, 3]]) C5[y][x] = 'o';
  room('ydc_5', 'The Logs', C5, { x: 4, y: 3 }, (M) => {
    M.walkable(9, 2); M.exit(9, 2, 1, 1, 'ydc_3', 19, 10, DIR.UP, { stairs: true });
    // two felled logs standing across the corridor, one either side of the crossing: each rolls to the corridor's end, and the way beside it is free
    M.object('log', 6, 6, { id: 'ydc_log3', len: 3, horiz: false }); M.object('log', 13, 6, { id: 'ydc_log4', len: 3, horiz: false });
    M.walkable(15, 5); M.exit(15, 5, 1, 1, 'ydc_col', 4, 8, DIR.UP, { stairs: true });
    door(M, 9, 15, 'ydc_6', 10, 13, DIR.DOWN);
    M.chest(10, 13, 'Water of Life', 1);
    M.trigger(8, 3, 3, 2, function* (E) { yield E.say('A crossing of corridors, and logs standing across the side ways. They roll as far as the wall lets them; the ladder is above the east end, a step short of it.', 'Kraden'); }, { once: 'ydc5_seen' });
  });
  const CC = grid(14, 12, '#');
  fill(CC, 3, 3, 10, 8, '.'); CC[8][4] = 'N';
  room('ydc_col', 'The Column', CC, { x: 4, y: 8 }, (M) => {
    M.walkable(4, 8); M.exit(4, 8, 1, 1, 'ydc_5', 15, 6, DIR.DOWN, { stairs: true });
    M.object('pillar', 8, 5, { id: 'ydc_column', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'ydc_column'); if (o && o.x === 8 && o.y === 3 && !G.flag('ydc_column_done')) { G.set('ydc_column_done'); Audio.sfx('push'); yield E.say('The column slides into its socket in the north wall, and a grinding comes up through the floor: something below has shifted.'); } } });
    M.chest(9, 7, 'Mythril Silver', 1);
    M.sign(3, 4, 'A column in the little room, and a socket for it in the north wall.');
  });
  // ====================== the Orihalcon and the cracked pillar on the raised section ======================
  const C6 = grid(18, 16, '#');
  fill(C6, 3, 3, 14, 13, '.'); fill(C6, 9, 3, 14, 6, '#'); fill(C6, 10, 4, 13, 5, '.'); C6[6][10] = '.'; C6[3][12] = 'D'; C6[14][10] = 'D';   // the raised section in its rock, the one break in its south face (the cracked pillar), its door up
  for (const [x, y] of [[5, 11], [13, 12]]) C6[y][x] = 'o';
  room('ydc_6', 'The Orihalcon', C6, { x: 10, y: 14 }, (M) => {
    door(M, 10, 14, 'ydc_5', 9, 14, DIR.DOWN); door(M, 12, 3, 'ydc_3', 12, 3, DIR.UP);
    M.chest(4, 5, 'Orihalcon', 1);
    // the raised section's cracked pillar: Burst it, and the raised part is stood on from below
    M.object('crack', 10, 6, { id: 'ydc_crack2', tile: 'pillar_cracked' });
    M.trigger(9, 9, 3, 1, function* (E) { yield E.say('The chest on the left, and a raised section with a cracked pillar in its face - Burst it, and the way up through it is ours.', 'Piers'); }, { once: 'ydc6_seen' });
  });
  // ====================== the sand below the first chamber: Crystal burrowing ======================
  const CD = grid(18, 12, '#');
  fill(CD, 3, 3, 14, 9, 's'); fill(CD, 3, 3, 4, 4, '.'); CD[2][3] = 'U';
  room('ydc_djinn', 'The Sand', CD, { x: 3, y: 3 }, (M) => {
    M.walkable(3, 2); M.exit(3, 2, 1, 1, 'ydc_1', 3, 9, DIR.UP, { stairs: true });
    // something moves fast under the sand: Scoop where it passes, and it comes up angry
    if (!G.party.djinnFound.includes('Crystal')) M.object('scoop', 9, 6, { id: 'ydc_crystal_dig', look: 'sand_puddle', onScoop: function* (E) { if (G.party.djinnFound.includes('Crystal')) return; const r = yield* E.ambush(['Venus Djinni Crystal'], { canFlee: false }, { at: [[9, 6]], say: 'The sand heaves, and something comes up out of it in a fury at being woken!' }); if (r === 'win') yield* E.djinn('Crystal'); } });
    M.trigger(3, 4, 2, 1, function* (E) { yield E.say('A room of soft sand. Something is moving through it, fast, just under the top - a ripple that runs and turns and runs again.', 'Sheba'); yield E.say('Dig where it passes. Scoop, the moment it is beside us - or Halt it first, if we have the Halt Gem still.', 'Kraden'); }, { once: 'ydc_djinn_seen', cond: () => !G.party.djinnFound.includes('Crystal') });
  }, { enc: [] });
  // ====================== the guardian of fire ======================
  const CB = grid(16, 16, '#');
  fill(CB, 3, 2, 12, 12, '.'); fill(CB, 7, 12, 9, 14, '.'); fill(CB, 3, 2, 12, 2, ',');
  room('ydc_boss', "Valukar's Crucible", CB, { x: 8, y: 13 }, (M) => {
    door(M, 8, 14, 'ydc_1', 15, 3, DIR.DOWN);
    if (!G.flag('valukar_done')) M.boss('Valukar', 8, 5, { done: 'valukar_done' });
    M.trigger(6, 8, 5, 1, T3.valukar, { once: 'valukar_scene', cond: () => !G.flag('valukar_done') });
    M.object('statue', 8, 3, { id: 'ydc_tablet', tile: 'ar_tablet', script: function* (E) { if (!G.flag('valukar_done')) { yield E.say('The guardian stands between the party and the tablet.'); return; } if (G.flag('daedalus_taken')) { yield E.say("The tablet of Daedalus. Its power is already the party's."); return; } yield E.say('The tablet Valukar kept, cut with a craftsman and his engines. The party reads it - and fire answers.'); G.set('daedalus_taken'); Engine.doFlash(14, '#ffd0a0'); Audio.sfx('summon'); yield E.summon('Daedalus'); } });
  }, { enc: [] });
  T3.valukar = function* (E) {
    if (G.flag('valukar_done')) return;
    yield E.face('player', DIR.UP);
    yield E.say('I am the guardian of fire. If you want my power, prove yourself in my crucible of flame.', 'Valukar');
    yield E.say('(A golden demon rises, wreathed in fire, between the party and the tablet.)');
    const r = yield* E.battle(['Valukar'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('valukar_done'); for (const n of G.field.npcs.slice()) if (/Valukar/.test(n.id)) G.field.removeNpc(n.id);
    yield E.say('The fire goes out of the guardian, and it crumbles where it stands. The tablet is the party\'s to read.');
  };
}
