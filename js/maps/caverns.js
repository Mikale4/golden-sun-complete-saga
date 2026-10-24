// ---------- The three caverns with tablets: Indra, Angara, Atteka ----------
// After the rips (map references/golden-sun-the-lost-age-indra-cavern-gba-map.webp, ...angara-cavern-gba-map.webp,
// ...atteka-cavern-gba-map.webp), condensed, and the guide (lines 1999-2006, 5676-5699; the summon table at 6656):
// Indra Cavern, the small cave west of the ship's shore - Move on the pillar in the gap, Lash on the rope up the
// cliff, Zagan's tablet lying out in the open on the ledge; Angara Cavern, the big cave north of Loho - four levels
// down, the blocks carried into the gaps (Carry: Isaac's), Haures' tablet; Atteka Cavern, at the continent's south
// tip, reached by air - Parch on the pool from its right side, the ladder up the island, Coatlicue's tablet.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  // a stone tablet standing on the floor: read it, and the summon is the party's
  const tablet = (M, x, y, name, flag, line) => M.object('statue', x, y, { id: 'tablet_' + name.toLowerCase(), tile: 'ar_tablet', script: function* (E) { if (G.flag(flag)) { yield E.say('The tablet of ' + name + '. Its power is already the party\'s.'); return; } yield E.say(line); G.set(flag); Engine.doFlash(14, '#e0d0ff'); Audio.sfx('summon'); yield E.summon(name); } });
  const SAND_LEG = { '.': 'cave_sand', ',': 'cave_pebbles', 'o': { ground: 'cave_sand', obj: 'rock_sand' }, 'L': { ground: 'cave_sand', obj: 'ladder', walk: true }, 'p': 'chasm' };

  // ====================== Indra Cavern: the pillar in the gap, the rope, Zagan ======================
  const IN = grid(24, 24, '#');
  fill(IN, 14, 19, 16, 22, '.'); fill(IN, 7, 14, 19, 18, '.'); fill(IN, 13, 14, 14, 16, '#');   // the way in, the middle room and the rock in it
  fill(IN, 2, 7, 14, 13, '.'); fill(IN, 11, 13, 12, 13, '.');                                  // the big room, joined to the middle one
  fill(IN, 13, 6, 20, 8, '.'); IN[7][12] = '.';                                                  // the east corridor, and the one-cell gap into it from the big room
  fill(IN, 7, 2, 20, 4, '.');                                                                    // the ledge above the corridor: the tablet's
  for (const [x, y] of [[4, 9], [9, 11], [6, 12], [17, 16], [10, 16], [18, 7]]) IN[y][x] = 'o'; for (const [x, y] of [[3, 12], [16, 19], [12, 10]]) IN[y][x] = ',';
  defineMap('indra_cavern', {
    name: 'Indra Cavern', w: 24, h: 24, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry: { x: 15, y: 22 }, retreat: { map: 'world_tla', x: 160, y: 191, dir: DIR.DOWN },
    enc: [['Punch Ant', 'Punch Ant'], ['Giant Bat'], ['Wild Wolf', 'Wild Wolf'], ['Mini-Goblin']],
    build(M) {
      M.paint(0, 0, strs(IN), SAND_LEG, { cliff: '#', set: 'purplerock', faces: 2 });
      M.walkable(14, 23, 3, 1); M.exit(14, 23, 3, 1, 'world_tla', 160, 191, DIR.DOWN);
      // the pillar standing in the gap between the big room and the corridor: Move it on into the corridor
      M.object('pillar', 12, 7, { id: 'inc_pillar', poundable: false });
      // the rope coiled at the corridor's wall: Lash, and it hangs down the cliff to the ledge
      M.object('rope', 16, 5, { id: 'inc_rope', state: 'coiled', len: 1 });
      tablet(M, 9, 3, 'Zagan', 'zagan_taken', 'A stone tablet lies out in the open on the ledge, cut with a horned bull. The party reads it - and a power answers from the sand.');
      M.trigger(14, 20, 3, 2, function* (E) { yield E.say('A small cavern, west of where the ship lies. Sand underfoot, and rooms winding up into the rock.', 'Kraden'); }, { once: 'inc_seen' });
      M.trigger(11, 7, 1, 1, function* (E) { yield E.say('A pillar stands in the one gap through to the next room. Move would shift it.', 'Sheba'); }, { once: 'inc_pillar_seen' });
      M.trigger(15, 6, 3, 1, function* (E) { yield E.say('A rope, coiled at the top of the cliff. Lash, and it would hang down to us.', 'Piers'); }, { once: 'inc_rope_seen', cond: () => !G.flag('zagan_taken') });
      M.sign(3, 8, 'Indra Cavern. Something lies on the ledge above, out in the open.');
    }
  });

  // ====================== Angara Cavern: four levels down, the blocks into the gaps, Haures ======================
  const AC_ENC = [['Minos Warrior'], ['Lesser Demon'], ['Raptor', 'Raptor'], ['Puppet Warrior'], ['Wyvern']];
  const AC_ROCK = { cliff: '#', set: 'lilacrock', faces: 2 };
  const room = (id, name, rows, entry, build) => defineMap(id, { name: 'Angara Cavern' + (name ? ' - ' + name : ''), w: rows[0].length, h: rows.length, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry, enc: AC_ENC, retreat: { map: 'world_tla', x: 124, y: 79, dir: DIR.DOWN }, build(M) { M.paint(0, 0, strs(rows), SAND_LEG, AC_ROCK); build(M); } });
  const stairs = (M, x, y, to, tx, ty, dir, down) => { M.setObj(x, y, down ? 'stairs_down' : 'stairs_up'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, { stairs: true }); };
  // the first cave: a Y of passages up from the mouth to the stair at the top left
  const A1 = grid(20, 22, '#');
  fill(A1, 10, 15, 12, 20, '.'); fill(A1, 8, 9, 13, 14, '.'); fill(A1, 3, 3, 9, 8, '.'); fill(A1, 12, 4, 17, 8, '.'); fill(A1, 9, 8, 12, 9, '.');
  for (const [x, y] of [[5, 6], [15, 5], [9, 12]]) A1[y][x] = 'o'; A1[18][11] = ',';
  room('angara_cavern', null, A1, { x: 11, y: 19 }, (M) => {
    M.walkable(10, 21, 3, 1); M.exit(10, 21, 3, 1, 'world_tla', 124, 79, DIR.DOWN);
    stairs(M, 4, 4, 'angara_cavern_2', 3, 4, DIR.DOWN, true);
    M.chest(15, 7, 'Vial', 1);
    M.trigger(10, 17, 3, 2, function* (E) { yield E.say('The big cave north of Loho. It goes down a long way, they said in the town - level under level.', 'Kraden'); }, { once: 'ac_seen' });
    M.sign(7, 11, 'Angara Cavern. The stairs at the top left go down.');
  });
  // the second: a V that runs from the stair at the top left round to the stair at the far right
  const A2 = grid(22, 14, '#');
  fill(A2, 2, 3, 8, 6, '.'); fill(A2, 7, 6, 12, 10, '.'); fill(A2, 11, 3, 19, 7, '.'); fill(A2, 12, 8, 14, 10, '.');
  for (const [x, y] of [[5, 4], [16, 6], [9, 9]]) A2[y][x] = 'o';
  room('angara_cavern_2', 'Second Level', A2, { x: 3, y: 4 }, (M) => {
    stairs(M, 3, 3, 'angara_cavern', 4, 5, DIR.DOWN, false);
    stairs(M, 18, 4, 'angara_cavern_3', 18, 12, DIR.UP, true);
    M.sign(12, 4, 'The second level. Down again at the east end.');
  });
  // the third: the long way round, from the bottom right up to the stair by the fourth level's door
  const A3 = grid(22, 16, '#');
  fill(A3, 16, 10, 20, 13, '.'); fill(A3, 8, 12, 16, 13, '.'); fill(A3, 4, 5, 9, 12, '.'); fill(A3, 4, 3, 12, 5, '.');
  for (const [x, y] of [[18, 11], [6, 9], [10, 4]]) A3[y][x] = 'o';
  room('angara_cavern_3', 'Third Level', A3, { x: 18, y: 12 }, (M) => {
    stairs(M, 19, 11, 'angara_cavern_2', 18, 5, DIR.DOWN, false);
    stairs(M, 11, 4, 'angara_cavern_4', 8, 16, DIR.UP, true);
    M.chest(5, 11, 'Lucky Medal', 1);
    M.sign(9, 12, 'The third level. The way winds up to the last stair.');
  });
  // the fourth: the chamber of the blocks - the tablet on the far ledge, two gaps between, the blocks that fill them
  const A4 = grid(18, 18, '#');
  fill(A4, 2, 13, 15, 16, '.'); fill(A4, 7, 11, 9, 12, 'p'); fill(A4, 2, 8, 15, 10, '.'); fill(A4, 6, 6, 10, 7, 'p'); fill(A4, 2, 3, 15, 5, '.');   // three ledges, and between them two chasms two cells deep - too wide to hop
  for (const [x, y] of [[3, 15], [14, 9], [4, 4]]) A4[y][x] = 'o';
  room('angara_cavern_4', 'The Deepest Level', A4, { x: 8, y: 16 }, (M) => {
    stairs(M, 8, 17, 'angara_cavern_3', 11, 5, DIR.DOWN, false); M.set(8, 17, 'cave_sand');
    // the blocks: the small grey one by the stair, carried into the first gap's middle; the second one waits on the
    // middle ledge and is carried into the second gap; the third stands on the far ledge, a step from the tablet
    M.object('carriable', 12, 14, { id: 'ac_block1', tile: 'block_grey' }); M.object('carriable', 3, 14, { id: 'ac_block2', tile: 'block_grey' });
    M.object('carriable', 4, 9, { id: 'ac_block3', tile: 'block_grey' }); M.object('carriable', 13, 9, { id: 'ac_block4', tile: 'block_grey' });
    tablet(M, 8, 4, 'Haures', 'haures_taken', 'A tablet on the deepest ledge, cut with a demon lord in his rage. The party reads it, and the rock shakes under them.');
    M.trigger(7, 14, 3, 2, function* (E) { yield E.say('The bottom of the cavern. Ledges, and chasms between them too wide to jump - and blocks standing about, the grey kind Isaac can lift and carry. Two into each chasm, and the far ledge is ours.', 'Kraden'); }, { once: 'ac4_seen' });
    M.sign(2, 12, 'The deepest level. Two chasms between the ledges; blocks set down in them are a way across.');
  });

  // ====================== Atteka Cavern: Parch on the pool, the ladder up the island, Coatlicue ======================
  const AT_LEG = { '.': 'snow', 'w': 'cave_water', 'i': 'ice', 'L': { ground: 'snow', obj: 'ladder', walk: true }, 'o': { ground: 'snow', obj: 'rock_snow' }, 'T': { ground: 'snow', obj: 'pinesnow' } };
  const AT = grid(23, 26, '#');
  fill(AT, 2, 4, 20, 22, '.'); fill(AT, 3, 22, 4, 24, '.'); fill(AT, 2, 4, 6, 8, '#'); fill(AT, 17, 4, 20, 6, '#');
  fill(AT, 9, 8, 16, 18, 'w'); fill(AT, 11, 12, 14, 14, '#'); fill(AT, 12, 13, 13, 13, '.'); AT[14][12] = 'L';   // the pool, the island's rock rising out of it, its top, the ladder up its south face
  for (const [x, y] of [[7, 10], [18, 16], [5, 19], [17, 8]]) AT[y][x] = 'o'; for (const [x, y] of [[3, 10], [19, 20], [8, 20]]) AT[y][x] = 'T';
  defineMap('atteka_cavern', {
    name: 'Atteka Cavern', w: 23, h: 26, base: 'void', music: 'tlacaves', bg: 'snow', indoor: true, entry: { x: 3, y: 23 }, retreat: { map: 'world_tla', x: 36, y: 246, dir: DIR.DOWN },
    enc: [['Talon Runner'], ['Foul Mummy'], ['Grand Chimera'], ['Hydra']],
    build(M) {
      M.paint(0, 0, strs(AT), AT_LEG, { cliff: '#', set: 'snowcliff', faces: 2 });
      M.walkable(3, 25, 2, 1); M.exit(3, 25, 2, 1, 'world_tla', 36, 246, DIR.DOWN);
      // the pool round the island: Parch from its right side, and the bed is walked to the ladder
      const tiles = []; for (let y = 8; y <= 18; y++) for (let x = 9; x <= 16; x++) if (AT[y][x] === 'w') tiles.push([x, y]);
      if (!G.flag('atc_pool_dry')) M.object('pool', 16, 13, { id: 'atc_pool', tiles, dryTile: 'snow', onParch: function* (E) { G.set('atc_pool_dry'); yield E.say('The pool steams away to nothing, and its bed lies bare: a way to the foot of the island.'); } });
      else for (const [x, y] of tiles) M.set(x, y, 'snow');
      tablet(M, 13, 13, 'Coatlicue', 'coatlicue_taken', 'On the island in the pool, a tablet cut with a mother of many arms. The party reads it - and a warmth answers, out of the snow.');
      M.trigger(3, 22, 2, 2, function* (E) { yield E.say('A cavern at the very south of Atteka, under the snow. A pool in the middle of it, and something on the island in the pool.', 'Kraden'); yield E.say('Water. Parch would take it - from the right side, where the bank comes closest.', 'Sheba'); }, { once: 'atc_seen' });
      M.sign(18, 12, 'The pool. From this side the water is closest to the island.');
    }
  });
}
