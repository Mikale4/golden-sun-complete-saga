// ---------- Tundaria Tower ----------
// After map references/golden-sun-the-lost-age-tundaria-tower-gba-map.webp (the white tower on the ice and its
// thirty rooms), condensed to the snowfield and fourteen rooms. Per the guide: Parch on the two pools of the first
// hall; the right door, the 365 coins and the two black-ice fields (the second one's slides to the Mint, the centre
// way up, and the way back); the hub upstairs with its three doors - the icy columns Pound sinks for the Crystal
// Powder and the Hard Nut, the slide down to the third ice field and Reflux, the right way's columns, pillar and
// ladder up to the back room, the icy wall Reveal sees through, and outside the ladder down to the pillar and the
// Burst Brooch, the ladders down, Burst on the brown patch of the wall for a way back in; the ice crystal on the
// centre way (Burst: the Center Prong); the icy wall on the left way (Burst: Lucky Medal, Sylph Feather, Lightning
// Sword, Vial). Wheeze waits in the inlet south-west of the tower, on the world map.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC = [['Dinox'], ['Harridan II'], ['Living Armor'], ['Magicore II'], ['Minotaurus'], ['Needle Egg', 'Needle Egg'], ['Stone Soldier II']];
  const WORLD = { map: 'world_tla', x: 136, y: 246, dir: DIR.DOWN };
  const LEG = {
    '.': 'tt_floor', 'i': 'tt_ice', 'w': 'water', 's': 'snow', 'n': 'snow', 'c': 'ice', 'p': 'pit',
    'D': { ground: 'tt_floor', obj: 'lc_door' }, 'L': { ground: 'tt_floor', obj: 'ladder', walk: true }, 'o': { ground: 'tt_ice', obj: 'rock_small' }, 'r': { ground: 'snow', obj: 'rock_small' }, 't': { ground: 'snow', obj: 'pine' }
  };
  const WALL = { cliff: '#', set: 'icewall', faces: 2 };
  const room = (id, name, rows, entry, build, extra) => defineMap(id, Object.assign({ name: 'Tundaria Tower - ' + name, w: rows[0].length, h: rows.length, base: 'void', music: 'tundaria', bg: 'snow', indoor: true, entry, enc: ENC, retreat: WORLD, build(M) { M.paint(0, 0, strs(rows), LEG, WALL); build(M); } }, extra || {}));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.set(x, y, 'tt_floor'); M.setObj(x, y, 'lc_door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const column = (M, id, x, y) => M.object('pillar', x, y, { id, tile: 'ice_column', fixed: true });   // Pound sinks it; Move does not shift it
  // ====================== the snowfield and the tower's foot ======================
  const X = grid(30, 26, 's');
  fill(X, 8, 6, 22, 19, '#'); X[19][15] = 'D';   // the tower's base, its door at the foot
  fill(X, 23, 8, 27, 10, '.'); X[9][23] = 'D'; fill(X, 23, 8, 23, 10, '#'); X[9][23] = 'D';   // the ledge the back room opens on
  fill(X, 27, 11, 27, 12, 'L'); fill(X, 25, 13, 29, 13, '.'); fill(X, 25, 14, 28, 14, '.'); fill(X, 23, 11, 29, 12, '#'); fill(X, 27, 11, 27, 12, 'L'); fill(X, 23, 13, 24, 14, '#'); X[14][29] = '#';   // the ladder down to the lower ledge; the Brooch's nook at its end, the pillar across its one cell
  fill(X, 26, 15, 26, 19, 'L'); fill(X, 23, 15, 29, 19, '#'); fill(X, 26, 15, 26, 19, 'L');   // the long ladder down to the snow
  fill(X, 0, 23, 29, 25, 'w'); fill(X, 13, 23, 17, 23, 's');   // the sea, the landing
  for (const [x, y] of [[3, 3], [5, 8], [2, 14], [27, 3], [4, 21], [24, 21], [12, 2], [19, 3]]) X[y][x] = 't';
  for (const [x, y] of [[6, 12], [3, 18], [25, 21], [10, 21], [17, 2]]) X[y][x] = 'r';
  defineMap('tundaria', {
    name: 'Tundaria Tower', w: 30, h: 26, base: 'snow', music: 'tundaria', bg: 'snow', entry: { x: 15, y: 22 }, enc: [['Dinox'], ['Needle Egg', 'Needle Egg'], ['Harridan II']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(X), LEG, { cliff: '#', set: 'icewall', faces: 2 });
      M.exit(13, 23, 5, 1, 'world_tla', 136, 246, DIR.DOWN);
      M.exit(15, 19, 1, 1, 'tt_1', 12, 14, DIR.UP, { door: true });
      M.exit(23, 9, 1, 1, 'tt_back', 6, 2, DIR.LEFT, { door: true });
      // the lower ledge: the pillar before the Burst Brooch, shoved aside
      M.object('pillar', 28, 13, { id: 'tt_p_out' }); M.chest(29, 13, 'Burst Brooch', 1);
      // the brown patch of the outer wall: Burst opens a way straight into the first hall
      M.object('crack', 20, 19, { id: 'tt_brown', tile: 'tt_brown', reveal: 'lc_door', onBurst: function* (E) { G.set('tt_shortcut'); yield E.say('The brown stone gives with a crack, and there is a doorway behind it: a way straight into the tower.'); } });
      M.exit(20, 19, 1, 1, 'tt_1', 21, 13, DIR.UP, { door: true, cond: () => !!G.flag('tt_shortcut') });
      M.sign(13, 21, 'Tundaria Tower. The ice of the far south, and a white tower on it. The door is at its foot.');
      M.trigger(13, 21, 5, 2, function* (E) { yield E.say('Tundaria. The whole world is ice down here.', 'Jenna'); yield E.say('The tower of the old Tundarians. The Centre Prong was carried here, the tales say. Inside, then - and keep to the walls; the ice underfoot is black and it does not stop you once it starts.', 'Kraden'); }, { once: 'tundaria_seen' });
    }
  });
  // ====================== 1. the first hall: two pools, three ways ======================
  const H1 = grid(24, 16, '#'); fill(H1, 2, 2, 21, 14, '.'); H1[15][12] = 'D'; H1[1][12] = 'D'; H1[8][1] = 'D'; H1[8][22] = 'D'; H1[13][22] = 'D';
  fill(H1, 2, 6, 6, 10, 'w'); fill(H1, 17, 6, 21, 10, 'w');
  room('tt_1', 'First Hall', H1, { x: 12, y: 14 }, (M) => {
    door(M, 12, 15, 'tundaria', 15, 20, DIR.DOWN); door(M, 12, 1, 'tt_center', 6, 10, DIR.UP); door(M, 1, 8, 'tt_left', 10, 5, DIR.LEFT); door(M, 22, 8, 'tt_2', 2, 12, DIR.RIGHT); door(M, 22, 13, 'tundaria', 20, 20, DIR.RIGHT);
    for (const [id, x0, x1, ox, flag] of [['tt_pool_l', 2, 6, 6, 'tt_pool_l_dry'], ['tt_pool_r', 17, 21, 17, 'tt_pool_r_dry']]) {
      const tiles = []; for (let y = 6; y <= 10; y++) for (let x = x0; x <= x1; x++) tiles.push([x, y]);
      if (G.flag(flag)) { for (const [x, y] of tiles) { M.set(x, y, 'tt_floor'); M.walkable(x, y); } }
      else M.object('pool', ox, 8, { id, tiles, dryTile: 'tt_floor', onParch: function* (E) { G.set(flag); yield E.say('The water is drawn off, and the door behind it stands clear.'); } });
    }
    M.sign(12, 3, 'The first hall. Two pools of standing water, left and right, and doors behind them; the way straight on is up the middle.');
  });
  // ====================== 2. the right way: the branch, the 365 coins ======================
  const H2 = grid(20, 14, '#'); fill(H2, 2, 2, 17, 12, '.'); H2[12][1] = 'D'; H2[1][17] = 'D'; fill(H2, 8, 5, 17, 6, '#'); H2[5][12] = '.'; H2[6][12] = '.';
  room('tt_2', 'Right Way', H2, { x: 2, y: 12 }, (M) => { door(M, 1, 12, 'tt_1', 21, 8, DIR.LEFT); door(M, 17, 1, 'tt_ice1', 2, 10, DIR.UP); M.chest(16, 3, 'Coins', 1, { coins: 365 }); M.sign(3, 3, 'The way branches: up through the gap in the wall, or along the bottom to nowhere.'); });
  // ====================== 3. the first black-ice field: up and across ======================
  const I1 = grid(20, 12, '#'); fill(I1, 2, 2, 17, 9, 'i'); fill(I1, 2, 10, 17, 10, '.'); I1[11][2] = 'D'; I1[1][17] = 'D'; I1[2][17] = '.'; I1[5][10] = 'o'; I1[7][5] = 'o'; I1[3][14] = 'o';
  room('tt_ice1', 'Black Ice', I1, { x: 2, y: 10 }, (M) => { door(M, 2, 11, 'tt_2', 17, 2, DIR.DOWN); door(M, 17, 1, 'tt_ice2', 1, 10, DIR.UP); M.sign(3, 10, 'Black ice. Step onto it and you slide until something stops you.'); });
  // ====================== 4. the second field: the Mint, the centre way, the way back ======================
  const I2 = [
    '######################',
    '#iiiiDiiiiiiiiiiiiiii#',
    '#iioiiiiioiiiiiiiiii.#',
    '#ooiiiiiiiiiiiiiiiiio#',
    '#iiiiiiiiiiiiiiiiiiii#',
    '#iiiiiiiiiiiiiiiiiiii#',
    '#iiiiiiiiiiiiiiiiiiio#',
    '#iiiiiiiiiiiiiiioiiii#',
    '#iiioiiiiiiiiiiiiiii.#',
    '#iiiiiiiiioiiiiiiiioi#',
    '#.iiioiiiioiiiiiiiiii#',
    '#D####################',
    '######################'].map(r => r.split(''));
  room('tt_ice2', 'Black Ice Field', I2, { x: 1, y: 10 }, (M) => {
    door(M, 1, 11, 'tt_ice1', 17, 2, DIR.DOWN); door(M, 5, 1, 'tt_hub', 7, 2, DIR.UP);
    M.chest(20, 8, 'Mint', 1);
    M.setObj(20, 2, 'lc_door'); M.set(20, 2, 'tt_floor'); M.exit(20, 2, 1, 1, 'tt_2', 2, 12, DIR.DOWN, { door: true });   // the right exit: back to the start of the right way
  });
  // ====================== 5. the hub upstairs: three doors ======================
  const HB = grid(16, 12, '#'); fill(HB, 2, 2, 13, 9, '.'); HB[1][7] = 'D'; HB[5][1] = 'D'; HB[5][14] = 'D'; HB[10][7] = '.'; HB[11][7] = 'D';
  room('tt_hub', 'Upper Hall', HB, { x: 7, y: 2 }, (M) => { door(M, 7, 1, 'tt_ice2', 5, 2, DIR.UP); door(M, 1, 5, 'tt_pound', 7, 10, DIR.LEFT); door(M, 14, 5, 'tt_ice4', 2, 11, DIR.RIGHT); door(M, 7, 11, 'tt_ice3', 1, 10, DIR.DOWN); M.sign(4, 3, 'Three doors: left, right, and the stair down to the ice below.'); });
  // ====================== 6. the left door: the icy column, then three more ======================
  const P1 = grid(14, 12, '#'); fill(P1, 6, 2, 8, 10, '.'); P1[11][7] = 'D'; P1[1][7] = 'D'; fill(P1, 2, 2, 11, 3, '.');
  room('tt_pound', 'Icy Column', P1, { x: 7, y: 10 }, (M) => { door(M, 7, 11, 'tt_hub', 2, 5, DIR.DOWN); door(M, 7, 1, 'tt_pound2', 7, 8, DIR.UP); column(M, 'tt_col1', 7, 6); M.setObj(6, 6, 'iw_face'); M.block(6, 6); M.setObj(8, 6, 'iw_face'); M.block(8, 6); M.sign(6, 9, 'A column of ice stands in the corridor. Pound would sink it.'); });
  const P2 = grid(16, 10, '#'); fill(P2, 2, 5, 13, 8, '.'); P2[9][7] = 'D'; fill(P2, 2, 2, 4, 3, '.'); fill(P2, 6, 2, 9, 3, '.'); fill(P2, 11, 2, 13, 3, '.'); P2[4][3] = '.'; P2[4][7] = '.'; P2[4][12] = '.';
  room('tt_pound2', 'Three Columns', P2, { x: 7, y: 8 }, (M) => { door(M, 7, 9, 'tt_pound', 7, 2, DIR.DOWN); column(M, 'tt_col2', 3, 4); column(M, 'tt_col3', 7, 4); column(M, 'tt_col4', 12, 4); M.chest(3, 2, 'Crystal Powder', 1); M.chest(12, 2, 'Hard Nut', 1); M.sign(8, 6, 'Three columns of ice in three gaps of the wall, and something behind each end.'); });
  // ====================== 7. the third field: Reflux ======================
  const I3 = [
    '######################',
    '#iiiiiiiioiiiiiiiiiii#',
    '#iiiiiiiiiiiioiiiiiii#',
    '#iiiiiiiiiiiiiiiiiiio#',
    '#iiiiiiiiiiiiiiiiiiii#',
    '#iiiiiiiiiioiiiiiiiii#',
    '#iiiiiiiiiiiiiiiiiioi#',
    '#iiiiiiiiiiiiiiiiioii#',
    '#iiiiiiiiiiiiioioiiii#',
    '#iiiiiiioiiiiiiiiiioi#',
    '#.iiiiiiiiiiiiiiooiii#',
    '#D####################',
    '######################'].map(r => r.split(''));
  room('tt_ice3', 'Lower Ice', I3, { x: 1, y: 10 }, (M) => { door(M, 1, 11, 'tt_hub', 7, 10, DIR.DOWN); M.djinni('Reflux', 20, 4, { fight: true }); });
  // ====================== 8. the right door: ice, two columns, the pillar under the ladder ======================
  const I4 = grid(20, 14, '#'); fill(I4, 2, 7, 17, 12, '.'); I4[12][1] = 'D'; fill(I4, 2, 11, 5, 12, 'i'); fill(I4, 6, 7, 6, 12, '#'); I4[8][6] = '.'; I4[10][6] = '.'; fill(I4, 2, 2, 17, 3, '.'); I4[1][16] = 'D'; fill(I4, 10, 4, 10, 6, 'L');
  room('tt_ice4', 'Right Way Up', I4, { x: 2, y: 11 }, (M) => {
    door(M, 1, 12, 'tt_hub', 13, 5, DIR.LEFT); door(M, 16, 1, 'tt_back', 6, 12, DIR.UP);
    column(M, 'tt_col5', 6, 8); column(M, 'tt_col6', 6, 10);
    M.object('pillar', 10, 7, { id: 'tt_p4' });
    M.sign(8, 11, 'A wall with two columns of ice in its gaps, and past it a ladder up - with a pillar standing at its foot.');
  });
  // ====================== 9. the back room: up to the icy wall Reveal sees through, and out ======================
  const BK = grid(12, 14, '#'); fill(BK, 5, 2, 7, 12, '.'); BK[13][6] = 'D'; BK[1][6] = 'D';
  room('tt_back', 'Back Room', BK, { x: 6, y: 12 }, (M) => {
    door(M, 6, 13, 'tt_ice4', 16, 2, DIR.DOWN); door(M, 6, 1, 'tundaria', 24, 9, DIR.UP);
    // the icy wall across the corridor: solid to the eye, but Reveal shows the passage through it
    for (const x of [5, 6, 7]) { M.setObj(x, 6, 'ice_wall_crack'); M.block(x, 6); }
    M.hidden.push({ x: 6, y: 6, tile: 'tt_floor' }); M.walkable(6, 6); M.setObj(6, 6, 'ice_wall_crack'); M.block(6, 6);
    M.sign(6, 8, 'A wall of ice across the corridor, a dead end - or so it looks.');
  });
  // ====================== 10. the centre way: the ice crystal ======================
  const CT = grid(12, 12, '#'); fill(CT, 4, 2, 8, 10, '.'); CT[11][6] = 'D';
  room('tt_center', 'Centre Way', CT, { x: 6, y: 10 }, (M) => {
    door(M, 6, 11, 'tt_1', 12, 2, DIR.DOWN);
    if (!G.flag('center_prong_got')) M.object('crack', 6, 4, { id: 'tt_crystal', tile: 'ice_crystal', onBurst: function* (E) { G.set('center_prong_got'); Audio.sfx('item'); yield E.say('The crystal bursts into a glitter of ice - and out of it, into Felix\'s hand, falls a prong of gold.'); yield E.give('Center Prong', 1); yield E.say('The Centre Prong! Two of the three.', 'Kraden'); } });
    M.sign(5, 6, 'An ice crystal as tall as a man, and something golden caught inside it.');
  });
  // ====================== 11. the left way: the icy wall, and the four chests behind it ======================
  const LF = grid(12, 8, '#'); fill(LF, 2, 4, 10, 6, '.'); LF[5][11] = 'D'; LF[3][2] = '.'; LF[2][2] = '.'; LF[1][2] = 'D';
  room('tt_left', 'Left Way', LF, { x: 10, y: 5 }, (M) => {
    door(M, 11, 5, 'tt_1', 2, 8, DIR.RIGHT);
    M.object('crack', 2, 3, { id: 'tt_icewall', tile: 'ice_wall_crack', reveal: null, onBurst: function* (E) { G.set('tt_left_open'); yield E.say('The icy wall shatters. The corridor goes on beyond it.'); } });
    door(M, 2, 1, 'tt_left2', 5, 8, DIR.UP, { cond: () => !!G.flag('tt_left_open') });
    M.sign(9, 4, 'The left way: a corridor to a wall of ice at its far end.');
  });
  const L2 = grid(12, 10, '#'); fill(L2, 2, 2, 9, 8, '.'); L2[9][5] = 'D'; L2[1][5] = 'D';
  room('tt_left2', 'Treasury', L2, { x: 5, y: 8 }, (M) => { door(M, 5, 9, 'tt_left', 2, 2, DIR.DOWN); door(M, 5, 1, 'tt_left3', 5, 8, DIR.UP); M.chest(3, 3, 'Lucky Medal', 1); M.chest(8, 3, 'Sylph Feather', 1); });
  const L3 = grid(12, 10, '#'); fill(L3, 2, 2, 9, 8, '.'); L3[9][5] = 'D';
  room('tt_left3', 'Inner Treasury', L3, { x: 5, y: 8 }, (M) => { door(M, 5, 9, 'tt_left2', 5, 2, DIR.DOWN); M.chest(3, 3, 'Lightning Sword', 1); M.chest(8, 3, 'Vial', 1); });
}
