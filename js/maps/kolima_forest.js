// ---------- Kolima Forest and Tret ----------
// The wood north of Kolima, from the reference rip (KFOREST_LAYOUT, tools/town_gen.py kforest): five screens of
// scattered trees, stumps and river, with the felled logs the woodcutters left (rolled where they are pushed; the
// one that reaches the stream floats down it and lodges as a bridge), the pond whose switch drains the water off its
// bed, and the clearing where Laurel and Tret stand. Inside Tret, five hollow rooms climb the trunk, joined by
// vines within and by his branches without, and the drop through their leaves ends at his heart.
'use strict';

const KFOREST_LEGEND = Object.assign({}, VALE_LEGEND, { 'S': 'water', 'h': 'water', 'Q': { ground: 'grass', obj: 'bark' }, 'e': { ground: 'grass', obj: 'bark' }, 'P': { ground: 'grass', obj: 'vine_bark', walk: true }, 'B': { ground: 'water', obj: null, walk: true } });
const KFOREST_ENC = [['Drone Bee', 'Drone Bee'], ['Rat', 'Rat'], ['Rat Soldier'], ['Troll'], ['Creeper', 'Creeper'], ['Spider']];
function kforestGround(M, L) {
  M.paint(0, 0, L.rows, KFOREST_LEGEND, { set: 'cliff', faces: 2 });
  // the logs already lodged in the river read as bridges, lying the way the stream runs past them
  L.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'B') { const v = (L.rows[y - 1] || '')[x] === 'B' || (L.rows[y + 1] || '')[x] === 'B'; M.set(x, y, v ? 'log_float_v' : 'log_float_h'); M.walkable(x, y); } });
  for (const [x, y] of L.canopy) M.setObj(x, y, 'tree_top');
  for (const [x, y, red] of L.trees) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
  for (const [x, y] of L.bushes) M.setObj(x, y, 'bush');
  for (const [x, y] of L.rocks) { const o = M.getObj(x, y); if (!o || o.kind !== 'tall') M.setObj(x, y, 'stump'); }
  for (const lg of L.logs || []) M.object('log', lg.x, lg.y, { id: 'log_' + (lg.id || (lg.x + '_' + lg.y)), len: lg.len, horiz: lg.horiz });
}
// a log the rolling pushes into the stream drifts to where it lodges: the bridge appears there
function kforestLodge(id, cells, horiz) {
  return function* (E) { const M = G.map; for (const [x, y] of cells) { persistGround(M, x, y, horiz ? 'log_float_h' : 'log_float_v'); persistWalkable(M, x, y); } M.finalize(); Audio.sfx('water'); yield E.say('The log tumbles into the stream... and drifts down it, until it lodges across the water.'); };
}

// ---- the way in: the river cuts the wood in two, and only the log rolled into its narrow stretch bridges it ----
const KF_ENTRY_ROWS = [
    'TTTTTTTTTTTTTTTTTTTTTTTTTT~~TTTT',
    'T..TTTT...TTTT..TTTT......~~...T',
    'T..TTTT...TTTT..TTTT.TTTT.~~...T',
    'T..TTTT...TTTT..TTTT.TTTT.~~...T',
    'T....................TTTT.~~...T',
    'T.........................~~...T',
    'T.........................~~...T',
    '::::................TTT...~~...T',
    '::::.......TTT......TTT...~~...T',
    'T..........TTT......TTT...~~...T',
    'T.TTT......TTT............~~...T',
    'T.TTT...................~~.....T',
    'T.TTT.................~~.......T',
    'T.....TTT...........~~.........T',
    'T.....TTT.........~~...........T',
    'T.....TTT........~~............T',
    'T................~........TTTT.T',
    'T..TTT....TTT....~........TTTT.T',
    'T..TTT....TTT....~........TTTT.T',
    'T..TTT....TTT....~........TTTT.T',
    'T................~....TTTT.....T',
    'T................~....TTTT.....T',
    'T......TTT.....~~.....TTTT.....T',
    'T......TTT...~~.......TTTT.....T',
    'T......TTT.~~..............TTTTT',
    'T........~~................TTTTT',
    'T......~~....TTT...........TTTTT',
    'T....~~......TTT...........TTTTT',
    'T..~~........TTT......TTTT.....T',
    'T~~...................TTTT.....T',
    'T~~.TTTT..TTT.........TTTT.....T',
    'T~~.TTTT..TTT.........TTTT.....T',
    'T~~.TTTT.......................T',
    'T~~.TTTT.......................T',
    'T~~......................TTTTT.T',
    'T~~......TT..............TTTTT.T',
    'T~~..TT..TT..:::....TTTT.TTTTT.T',
    'T~~..TT......:::....TTTT.TTTTT.T',
    'T~~..TT......:::....TTTT.......T',
    'T~~..........:::....TTTT.......T',
    'T~~..........:::...............T',
    'T~~TTTTTTTTT:::::TTTTTTTTTTTTTTT'
  ];
const KF_ENTRY_LOGS = [{ id: 'left', x: 19, y: 17, len: 4, horiz: false }, { id: 'right', x: 23, y: 17, len: 4, horiz: false }, { id: 'low', x: 20, y: 33, len: 3, horiz: true }];
const KF_LEGEND2 = { '.': 'grass', ':': 'path', '~': 'water', 'h': 'water', 'T': { ground: 'grass', obj: 'tree' } };
function kfPaint(M, rows, logs) {
  M.paint(0, 0, rows, KF_LEGEND2);
  // the wood: inside each clump some trees stand tall over the rest
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { if (row[x] !== 'T') continue; const T = (xx, yy) => ((rows[yy] || '')[xx]) === 'T'; const below = (rows[y + 1] || '')[x]; if (below !== 'T' && y + 1 < rows.length && T(x + 1, y) && T(x, y - 1) && T(x + 1, y - 1) && x % 2 === 0) M.tall(((x * 7 + y * 13) % 5 === 0) ? 'tree_red_tall' : 'tree_tall', x, y); } });
  for (const lg of logs) M.object('log', lg.x, lg.y, { id: 'log_' + lg.id, len: lg.len, horiz: lg.horiz });
}
defineMap('kolima_forest', {
  name: 'Kolima Forest', w: 32, h: 42, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 14, y: 40 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    kfPaint(M, KF_ENTRY_ROWS, KF_ENTRY_LOGS);
    M.exit(12, 41, 5, 1, 'world_gs1', 74, 21, DIR.DOWN); M.exit(0, 7, 1, 2, 'kolima_forest_w', 30, 22, DIR.LEFT);
    M.trigger(13, 37, 3, 2, STORY.kolimaForestEnter, { once: 'kforest_entered' });
    M.npc('kforest_worker', 9, 38, { type: 'villager_m', name: 'Woodcutter', text: "Tret lives in the great tree at the heart of the forest. His anger cursed us all! The stream cuts the wood in two, and there's no bridge... but a felled log rolled into the water where it runs narrow would do for one.", mind: "I felled that one myself. I can't look at it." });
    M.sign(17, 22, 'The stream runs narrow here, no wider than a log is long.');
  }
});
// ---- the second screen: one corridor through the trees, with the logs the woodcutters left across it ----
const KF_WEST_ROWS = [
    'TTTTTTTTTTTTTTTTTTT::TTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTT..TTTTTTTTTTT',
    'TTTTTTTTTT...TTTTTT..TTTTTTTTTTT',
    'TTTTTTTTTT...TTTTTT..TTTTTTTTTTT',
    'TTTT.................TTTTTTTTTTT',
    'TTTT.................TTTTTTTTTTT',
    'TTTT..TTTT...TTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT..TTTTTTTTTT...............T',
    'TTTT..TTTTTTTTTT...............T',
    'TTTT..TTTTTTTTTT...............:',
    'TTTT..TTTTTTTTTT...............:',
    'TTTT..TTTTTTTTTTTTT...TTTTTTT..:',
    'TTTT..TTTTTTTTTTTTT...TTTTTTTTTT',
    'TTTT..TTTTTTTTTTTTT...TTTTTTTTTT',
    'TTTT..................TTTTTTTTTT',
    'TTTT..................TTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTT...TTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ];
const KF_WEST_LOGS = [{ id: 'a', x: 22, y: 19, len: 4, horiz: false }, { id: 'b', x: 19, y: 26, len: 3, horiz: true }, { id: 'c', x: 10, y: 2, len: 3, horiz: true }];
defineMap('kolima_forest_w', {
  name: 'Kolima Forest', w: 32, h: 30, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 30, y: 22 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    kfPaint(M, KF_WEST_ROWS, KF_WEST_LOGS);
    M.exit(31, 21, 1, 3, 'kolima_forest', 1, 7, DIR.RIGHT); M.exit(19, 0, 2, 1, 'kolima_forest_n', 19, 30, DIR.UP); M.walkable(31, 21, 1, 3); M.walkable(19, 0, 2, 1);
    M.sign(11, 4, 'A log lies on the shelf above the path. Best left where it is.');
  }
});
// ---- the third: the three logs, and the one that goes into the stream and lodges below the pocket ----
defineMap('kolima_forest_n', {
  name: 'Kolima Forest', w: 32, h: 32, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 19, y: 30 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    const L = KFOREST_LAYOUT.north; kforestGround(M, L);
    M.exit(19, 31, 2, 1, 'kolima_forest_w', 19, 1, DIR.DOWN); M.exit(31, 3, 1, 5, 'kolima_forest_pond', 1, 19, DIR.RIGHT); M.walkable(19, 31, 2, 1); M.walkable(31, 3, 1, 5);
    const first = M.objects.find(o => o.id === 'log_first'); if (first) first.onFloat = kforestLodge('first', [[7, 19], [7, 20]], false);
    if (G.flag('obj:' + M.id + ':log:log_first') && G.flag('obj:' + M.id + ':log:log_first').gone) { for (const [x, y] of [[7, 19], [7, 20]]) { M.set(x, y, 'log_float_v'); M.walkable(x, y); } }
  }
});
// ---- the pond: cliffs on three sides; its switch drains it so the logs can be rolled on the bed, and fills it
// again so they float - and afloat, they are the only footing to the ledge with the way on and the ledge with the
// Fur Coat ----
const KF_POND_ROWS = [
    'TTTTTTTTTT:TTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTT...TTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTT...TTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTT...TTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTT...TTTTTTTTTTTTTTTTTTTT',
    'TTTTTThhhhhhhhhhhhhhhTTTTTTTTTTT',
    'TTTTTThhhhhhhhhhhhhhh....TTTTTTT',
    'TTTTTThhhhhhhhhhhhhhh....TTTTTTT',
    'TTTTTThhhhhhhhhhhhhhh....TTTTTTT',
    'TTTTTThhhhhhhhhhhhhhhTTTTTTTTTTT',
    'TTTTTThhhhhhhhhhhhhhhTTTTTTTTTTT',
    'TTTTTThhhhhhhhhhhhhhhTTTTTTTTTTT',
    'TTTTTThhhhhhhhhhhhhhhTTTTTTTTTTT',
    'T.TTT......................TTTTT',
    'T.TTT......................TTTTT',
    'T..............................T',
    'T..............................T',
    'T......................TTT.....T',
    ':......................TTT.....T',
    ':.........................TTTTTT',
    ':.TTTTT...................TTTTTT',
    'T.TTTTT...................TTTTTT',
    'TTTTTTTTTTTT....TTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTT....TTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ];
const KF_POND_LOGS = [{ id: 'v1', x: 15, y: 5, len: 4, horiz: false }, { id: 'v2', x: 10, y: 9, len: 4, horiz: false }, { id: 'h1', x: 11, y: 6, len: 4, horiz: true }, { id: 'h2', x: 17, y: 6, len: 4, horiz: true }];
defineMap('kolima_forest_pond', {
  name: 'Kolima Forest', w: 32, h: 29, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 1, y: 19 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    const drained = !!G.flag('kf_pond_drained');
    M.paint(0, 0, KF_POND_ROWS, KF_LEGEND2);
    // the bed: walked when the pond is drained; the ledges are reached only from the water's level
    KF_POND_ROWS.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'h') { M.set(x, y, drained ? 'pond_bed' : 'water'); if (drained) M.walkable(x, y); } });
    for (const [x, y] of [[9, 7], [9, 10], [18, 12]]) { M.setObj(x, y, 'stump'); M.block(x, y); }
    const LEDGES = [[9, 1, 11, 4], [21, 6, 24, 8]];
    if (drained) for (const [x0, y0, x1, y1] of LEDGES) M.block(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    // the logs: on the bed they roll; afloat they are bridges lying where they were left
    for (const lg of KF_POND_LOGS) {
      const st = G.flags['obj:kolima_forest_pond:log:log_' + lg.id]; const x = st && st.x !== undefined ? st.x : lg.x, y = st && st.y !== undefined ? st.y : lg.y;
      if (drained) M.object('log', x, y, { id: 'log_' + lg.id, len: lg.len, horiz: lg.horiz });
      else for (let k = 0; k < lg.len; k++) { const cx = x + (lg.horiz ? k : 0), cy = y + (lg.horiz ? 0 : k); M.set(cx, cy, lg.horiz ? 'log_float_h' : 'log_float_v'); M.walkable(cx, cy); }
    }
    M.exit(0, 18, 1, 3, 'kolima_forest_n', 30, 5, DIR.LEFT); M.exit(10, 0, 1, 1, 'kolima_forest_top', 8, 26, DIR.UP); M.walkable(0, 18, 1, 3); M.walkable(10, 0);
    M.chest(23, 7, 'Fur Coat', 1);
    // the switch on the south shore: the sluice opens and the pond runs off its bed, or fills again
    M.object('lever', 16, 15, { id: 'kf_sluice', onPull: function* (E) { const d = !G.flag('kf_pond_drained'); G.set('kf_pond_drained', d); Audio.sfx('quake'); Engine.doShake(10); yield E.say(d ? 'The switch grinds over. Somewhere a sluice opens, and the pond drains away off its bed!' : 'The switch grinds back. The pond fills again, and the logs on its bed rise with the water.'); const p = G.field.player; yield Engine.fadeOut(10); E.warpNow('kolima_forest_pond', p.tx, p.ty, p.dir); yield Engine.fadeIn(10); } });
    M.sign(15, 15, 'A rusted switch on a post. "Sluice - DO NOT TOUCH. - McCoy\'s foresters."');
    M.sign(8, 14, 'The pond: cliffs all round it but here. The way on is up on the ledge at its far end, and there is a chest on the ledge to the east - both a stone\'s throw over open water.');
  }
});
// ---- the clearing: Laurel and Tret, and the vine up into him ----
defineMap('kolima_forest_top', {
  name: 'Kolima Forest', w: 32, h: 28, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 8, y: 26 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    const L = KFOREST_LAYOUT.top; kforestGround(M, L);
    // the two great trunks, their faces low on the bark, their roots over the shaded floor
    for (const [x, y] of L.rocks) M.setObj(x, y, 'root_0');
    M.setObj(7, 14, 'face_tl'); M.setObj(8, 14, 'face_tr'); M.setObj(7, 15, 'face_bl'); M.setObj(8, 15, 'face_br');
    M.setObj(19, 11, 'face_tl'); M.setObj(20, 11, 'face_tr'); M.setObj(19, 12, 'face_bl'); M.setObj(20, 12, 'face_br');
    M.setObj(22, 4, 'door_tree'); M.walkable(22, 4); M.exit(22, 4, 1, 1, 'tret_room_5', 8, 14, DIR.UP, { door: true });
    M.exit(7, 27, 2, 1, 'kolima_forest_pond', 10, 1, DIR.DOWN); M.walkable(7, 27, 2, 1);
    M.npc('Laurel', 8, 16, { animal: 'none', name: 'Laurel', dir: DIR.DOWN, script: STORY.laurel, mind: () => G.flag('tret_cured') ? "The forest breathes again. Thank you, children." : "The sacred water of the Mercury Lighthouse... the Hermes' Water that flows from its fountain... it could heal even Tret. But I dare not hope aloud.", solid: false });
    M.npc('TretFace', 20, 12, { animal: 'none', name: 'Tret', dir: DIR.DOWN, script: STORY.tretFace, mind: "HROOM... axes... AXES... they will all be TREES...", solid: false });
    M.trigger(6, 20, 4, 2, STORY.tretClearing, { once: 'tret_clearing' });
  }
});

// ---- inside Tret: five rooms up the hollow trunk, the drop through them, and his heart below ----
// Every room is the same hollow: bark walls round a wood-grain floor, ridges across it, the shaft down its middle.
// The rows: k wall, . floor, r ridge, o the hole down, w web (hopped), l a leaf on the web, v a vine up, D a doorway
const TRET_ROOMS = {
  5: [   // A: in from the vine, the vine B up in the north-west corner
    'kkkkkkkkkkkkkkkkk',
    'kkkvkkkkkkkkkkkkk',
    'kk.......rrrr..kk',
    'k....rrr......r.k',
    'k....r........r.k',
    'k..r.r..rrrr..r.k',
    'k..r..........r.k',
    'k..rrrr.......r.k',
    'k......ro.rrrrr.k',
    'k......r........k',
    'k.rrrr.r.rrrrr..k',
    'k......r........k',
    'kk...rrr..rrr..kk',
    'kkk...........kkk',
    'kkkkkkkkD.kkkkkkk',
    'kkkkkkkkkkkkkkkkk',
  ],
  4: [   // B: the vine's top, the webs and leaves across the middle, the doors C west and D east onto the branches
    'kkkkkkkkkkkkkkkkk',
    'kkkvkkkkkkkkkkkkk',
    'kk.......wwww..kk',
    'k........wlww...k',
    'k..rr....wwwl...k',
    'k..wwww.......r.k',
    'k..wlww..rrrr.r.k',
    'k..wwwl.......r.k',
    'D..wwwwwo.....r.D',
    'k....wlwl.......k',
    'k....wwwwwwwww..k',
    'k......wlwwlw...k',
    'kk.....wwwwww..kk',
    'kkk...........kkk',
    'kkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkk',
  ],
  3: [   // the Psynergy Stone, the Healing Ring on its web island, the vine G up in the north-east, E east, F south
    'kkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkvkkk',
    'kk.............kk',
    'k....s..........k',
    'k..www.rrr.www..k',
    'k..wlw.....wlw..k',
    'k..www..c..www..k',
    'k....r...r......k',
    'k....r..or......D',
    'k..rrr...rrr....k',
    'k...wwww........k',
    'k...wlww..rrrr..k',
    'kk..wwww.......kk',
    'kkk...........kkk',
    'kkkkkkkkD.kkkkkkk',
    'kkkkkkkkkkkkkkkkk',
  ],
  2: [   // the vine G's top, the ridges, J west and H south onto the branches
    'kkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkvkkk',
    'kk.............kk',
    'k..rrrrr..r.....k',
    'k......r..r.....k',
    'k..rr..r..rrrr..k',
    'k..r..........r.k',
    'k..r.rrr.rrrr.r.k',
    'D....r..or......k',
    'k....r...r.rrr..k',
    'k..rrr.r.rr.....k',
    'k......r........k',
    'kk.....r..rrr..kk',
    'kkk...........kkk',
    'kkkkkkkkD.kkkkkkk',
    'kkkkkkkkkkkkkkkkk',
  ],
  1: [   // the top: K west, I east, the Nut chest, the leaves over the webs, and the leaf over the long drop
    'kkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkk',
    'kk.............kk',
    'k....wwwwwww....k',
    'k....wlwwwlw.c..k',
    'k..wwwwwwwwwww..k',
    'k..wlwwwwwwwlw..k',
    'k..wwwwwlwwwww..k',
    'D..wlwlwlwlwlw..D',
    'k..wwwwwwwwwww..k',
    'k....wlwwwlw....k',
    'k....wwwwwww....k',
    'kk.............kk',
    'kkk...........kkk',
    'kkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkk',
  ],
};
const TRET_LEGEND = { '.': 'floor_bark', 'r': { ground: 'floor_bark', obj: 'ridge' }, 'o': 'hole_bark', 'w': 'web', 'l': 'web_leaf', 'v': { ground: 'floor_bark', obj: 'vine_bark', walk: true }, 'D': 'floor_bark', 's': 'floor_bark', 'c': 'floor_bark' };
function tretRoom(n, opts) {
  const rows = TRET_ROOMS[n];
  defineMap('tret_room_' + n, {
    name: 'Inside Tret', w: 17, h: 16, base: 'void', music: 'dungeon', bg: 'forest', indoor: true, entry: opts.entry, enc: [['Creeper', 'Creeper'], ['Drone Bee', 'Drone Bee'], ['Spider'], ['Gnome']], fall: n < 5 ? { map: 'tret_room_' + (n + 1) } : { map: 'tret_heart', x: 8, y: 9 },
    retreat: { map: 'kolima_forest_top', x: 22, y: 13, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, rows, TRET_LEGEND, { cliff: 'k', set: 'cavern', top: 'wall_bark_top', face: 'wall_bark', mid: 'wall_bark_top' });
      rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) {
        if (row[x] === 'l') M.object('leaf', x, y, { id: 'leaf_' + x + '_' + y, under: 'web_torn' });
        if (row[x] === 'D') M.walkable(x, y);
      } });
      // a leaf already torn is the web's hole now
      for (const o of M.objects) if (o.kind === 'leaf' && G.flag('obj:' + o.key) && G.flag('obj:' + o.key).gone) M.set(o.x, o.y, 'web_torn');
      opts.build(M);
    }
  });
}
// the rooms' ways in and out, by the rip's letters
tretRoom(5, { entry: { x: 8, y: 14 }, build(M) {
  M.exit(8, 14, 1, 1, 'kolima_forest_top', 22, 5, DIR.DOWN, { door: true });                   // A
  M.exit(3, 1, 1, 1, 'tret_room_4', 3, 2, DIR.DOWN, { stairs: true });                          // the vine B up
  M.trigger(8, 12, 1, 1, STORY.tretInside, { once: 'tret_inside' });
} });
tretRoom(4, { entry: { x: 3, y: 2 }, build(M) {
  M.exit(3, 1, 1, 1, 'tret_room_5', 3, 2, DIR.DOWN, { stairs: true });                          // the vine B down
  M.exit(0, 8, 1, 1, 'tret_branches', 19, 24, DIR.LEFT, { door: true });                       // C: a branch that leads nowhere
  M.exit(16, 8, 1, 1, 'tret_branches', 27, 24, DIR.RIGHT, { door: true });                     // D: the lower right branch
} });
tretRoom(3, { entry: { x: 15, y: 8 }, build(M) {
  M.exit(16, 8, 1, 1, 'tret_branches', 27, 18, DIR.RIGHT, { door: true });                     // E
  M.exit(8, 14, 1, 1, 'tret_branches', 23, 22, DIR.DOWN, { door: true });                      // F: onto the ledge in the trunk
  M.exit(13, 1, 1, 1, 'tret_room_2', 13, 2, DIR.DOWN, { stairs: true });                        // the vine G up
  M.chest(8, 6, 'Healing Ring', 1); M.setObj(5, 3, 'psystone');
} });
tretRoom(2, { entry: { x: 13, y: 2 }, build(M) {
  M.exit(13, 1, 1, 1, 'tret_room_3', 13, 2, DIR.DOWN, { stairs: true });                        // the vine G down
  M.exit(0, 8, 1, 1, 'tret_branches', 19, 12, DIR.LEFT, { door: true });                       // J
  M.exit(8, 14, 1, 1, 'tret_branches', 23, 16, DIR.DOWN, { door: true });                      // H: onto the ledge in the trunk
} });
tretRoom(1, { entry: { x: 15, y: 8 }, build(M) {
  M.exit(0, 8, 1, 1, 'tret_branches', 19, 6, DIR.LEFT, { door: true });                        // K
  M.exit(16, 8, 1, 1, 'tret_branches', 27, 6, DIR.RIGHT, { door: true });                      // I
  M.chest(13, 4, 'Nut', 1);
} });
// ---- Tret's heart: the end of the drop, and the face that rages until it is beaten ----
defineMap('tret_heart', {
  name: "Tret's Heart", w: 17, h: 16, base: 'void', music: 'dungeon', bg: 'forest', indoor: true, entry: { x: 8, y: 9 }, retreat: { map: 'kolima_forest_top', x: 22, y: 13, dir: DIR.DOWN },
  build(M) {
    const rows = ['kkkkkkkkkkkkkkkkk', 'kkkkkkkFFkkkkkkkk', 'kk.....FF......kk', 'k...rr.....rr...k', 'k...r.......r..vk', 'k...............k', 'k..rr.......rr..k', 'k...............k', 'k...............k', 'k...............k', 'k..rr.......rr..k', 'k...............k', 'k...rr.....rr...k', 'kk.............kk', 'kkkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkkk'];
    M.paint(0, 0, rows, Object.assign({}, TRET_LEGEND, { 'F': { ground: 'floor_bark', obj: 'bark' }, 'v': { ground: 'floor_bark', obj: 'vine_bark', walk: true } }), { cliff: 'k', set: 'cavern', top: 'wall_bark_top', face: 'wall_bark', mid: 'wall_bark_top' });
    M.setObj(7, 1, 'face_tl'); M.setObj(8, 1, 'face_tr'); M.setObj(7, 2, 'face_bl'); M.setObj(8, 2, 'face_br');
    // the vine that drops down the shaft after the fight, the long way back to the rooms above (it comes out in the lowest)
    if (!G.flag('tret_beaten')) M.setObj(15, 4, null);
    M.exit(15, 4, 1, 1, 'tret_room_5', 8, 6, DIR.DOWN, { stairs: true, cond: () => G.flag('tret_beaten') });
    M.npc('Tret', 8, 2, { animal: 'none', name: 'Tret', dir: DIR.DOWN, script: STORY.tret, solid: false });
    M.trigger(7, 8, 3, 2, STORY.tretHeart, { once: 'tret_heart_seen' });
    M.setObj(3, 12, 'psystone');
  }
});

// ---- Tret's branches: the trunk up the middle with the doorways in it, the boughs either side, the vines between ----
const TRET_BRANCHES = (() => {
  const W = 49, H = 32; const rows = []; for (let y = 0; y < H; y++) rows.push(new Array(W).fill(' '));
  const set = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) rows[y][x] = c; };
  set(21, 0, 25, 31, 'k');                                                                 // the trunk
  set(3, 6, 20, 6, 'a'); set(6, 12, 20, 12, 'a'); set(6, 24, 20, 24, 'a'); set(6, 7, 6, 11, 'v'); set(6, 13, 6, 23, 'v');         // the left boughs, and the vines between them
  set(8, 2, 20, 2, 'a'); set(8, 3, 8, 5, 'v');                                                                                     // a high bough on the left, up a vine from the first
  set(26, 2, 44, 2, 'a'); set(26, 6, 44, 6, 'a'); set(44, 3, 44, 5, 'v');                                                          // the right boughs: the top one with the Djinni, up a vine from the second
  set(26, 18, 44, 18, 'a'); set(26, 24, 44, 24, 'a'); set(42, 19, 42, 23, 'v'); set(37, 7, 37, 17, 'v');                            // the lower right boughs, the vines between
  set(22, 16, 36, 16, 'a'); set(22, 22, 41, 22, 'a');                                                                              // the ledges out of the doorways in the trunk face, along to the vines
  set(37, 17, 37, 17, 'v'); set(42, 23, 42, 23, 'v');
  for (const [x, y] of [[20, 6], [20, 12], [20, 24], [26, 6], [26, 18], [26, 24], [23, 16], [23, 22]]) rows[y][x] = 'D';
  for (const [x, y] of [[2, 4], [12, 8], [4, 15], [14, 20], [10, 27], [30, 9], [40, 13], [46, 20], [33, 27], [16, 29], [3, 26], [47, 9]]) rows[y][x] = 't';
  return rows.map(r => r.join(''));
})();
defineMap('tret_branches', {
  name: "Tret's Branches", w: 49, h: 32, base: 'sky', music: 'woods', bg: 'forest', entry: { x: 27, y: 24 }, enc: [['Drone Bee', 'Drone Bee'], ['Spider'], ['Creeper']], retreat: { map: 'kolima_forest_top', x: 22, y: 13, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, TRET_BRANCHES, { 'a': 'branch', 'k': { ground: 'sky', obj: 'trunk_face' }, 'v': 'vine_sky', 'D': { ground: 'branch', obj: 'door_trunk', walk: true }, 't': 'sky_canopy' }, { cliff: null });
    // the boughs' undersides, where the sky shows below them
    TRET_BRANCHES.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'a' && (TRET_BRANCHES[y + 1] || '')[x] === ' ') M.set(x, y, 'branch_edge'); });
    const door = (x, y, to, tx, ty, dir) => M.exit(x, y, 1, 1, to, tx, ty, dir, { door: true });
    door(20, 6, 'tret_room_1', 1, 8, DIR.RIGHT); door(26, 6, 'tret_room_1', 15, 8, DIR.LEFT);       // K, I
    door(20, 12, 'tret_room_2', 1, 8, DIR.RIGHT); door(23, 16, 'tret_room_2', 8, 13, DIR.UP);        // J, H
    door(26, 18, 'tret_room_3', 15, 8, DIR.LEFT); door(23, 22, 'tret_room_3', 8, 13, DIR.UP);        // E, F
    door(20, 24, 'tret_room_4', 1, 8, DIR.RIGHT); door(26, 24, 'tret_room_4', 15, 8, DIR.LEFT);      // C, D
    M.djinni('Breeze', 43, 2, { fight: true });
  }
});
