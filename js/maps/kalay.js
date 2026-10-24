// ---------- Kalay ----------
// Hammet's merchant town, traced from the reference rip's two screens stacked: the palace grounds on the bluff
// above (the three-domed palace in its wood, ringed by cliffs) and the town below them, reached by the long stair
// that comes down between the two fountain pools. Pink stone houses with slate roofs stand about the crossroads;
// the road runs south to the world. The Nut, Vial and Sleep Bomb sit in jars where the guide's map has them.
'use strict';

const KALAY_LEGEND = {
  '.': 'grass', ':': 'cobble', 'p': 'path', '~': 'water', '=': 'stonefloor', 'c': 'carpet_red',
  'S': 'stairs', 's': 'stairs_wood',
  'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'j': { ground: 'grass', obj: 'pot' }, 'r': { ground: 'grass', obj: 'rock_small' },
  'F': { ground: 'grass', obj: 'fence' }, 'G': { ground: 'grass', obj: 'fence_v' }, 'W': { ground: 'grass', obj: 'fountain' },
  'k': { ground: 'floor_wood', obj: 'market_stall' }, 'f': 'floor_wood', 'w': 'grass',
};
// 32 x 54: rows 0-21 the palace grounds, rows 22-53 the town. Houses, domes and the well go over the '.' cells in code.
const KALAY_ROWS = [
  '##TTTT###TTTTTTTTT##TTTTTTTT####',   // 0
  '##..TT##.TTT.......##.TTT...####',   // 1
  '####TTT..TT.........##TTT...####',   // 2
  '####TTT..TT..........#TTT...####',   // 3
  '####.TT.TTT.........TT##....####',   // 4
  '####.T..TT..........TT.##...####',   // 5   the palace 7..20 rows 5..12
  '##.T................TT..##..####',   // 6
  '##.T..................TT.##.####',   // 7
  '##.TT.................TT..######',   // 8
  '##....................TT...#####',   // 9
  '##.TTT...............jj.....####',   // 10
  '##.TTT...............jj.....####',   // 11
  '##.TTT..................TTT.####',   // 12
  '##.TTGjj.....pp.........TTT.####',   // 13  the guards at 12,13 and 15,13
  '##.TTG.......pp......v..TTT.####',   // 14
  '##...G.......pp.............####',   // 15
  '##...G..TTT..pp..TTT....v..#####',   // 16
  '#####FFFTTT..pp..TTT.....#######',   // 17
  '#######.TTT..SS..TTTj###.#######',   // 18  the stair down to the pools
  '#######.TTT..SS..TTT.###########',   // 19
  '#############SS#####TT##########',   // 20
  '#############SS#################',   // 21
  '##TT.TTT#####SS#################',   // 22  the town: the pools either side of the stair; the tunnel's door at 27,23
  '##TT.TT.#####SS#######...#####TT',   // 23
  '##T.....#.W..SS..W.###.j......TT',   // 24
  '##......#~~~.SS.~~~#########.###',   // 25
  '##......#~~~.SS.~~~#########.###',   // 26
  '#########===.SS.===###........##',   // 27  house K 22..27 rows 27..30
  '#########....SS....###........##',   // 28
  '........#####SS#######........##',   // 29  house E 2..5 rows 29..33
  '........####::::######.......###',   // 30
  '............::........======.###',   // 31  the item shop 6..11 rows 31..35; K's terrace
  '............::........ss.....###',   // 32  the inn 14..20 rows 32..37; house J 24..27 rows 32..34
  '............::........ss.....###',   // 33
  '............::...............###',   // 34
  '............::.......j.......###',   // 35
  '.........fkk::.......j........##',   // 36  the item stall
  '.........fff::................##',   // 37
  '::::::::::::::::::::::::::::ww##',   // 38  the crossroads; the well at 28,38
  '::::::::::::::::::::::::::::ww##',   // 39
  'TTTTTT..TTT.::::k.............##',   // 40  the fruit seller's stall and rug
  'TTTTTT..TTT.::::k.cc..........G#',   // 41
  'TTT.TT..TTT.::::..cc..........G#',   // 42  house D 24..28 rows 42..46; the Nut jar at 3,42
  'TTT.TT......::::.............jG#',   // 43  the sanctum 6..11 rows 43..48; the armory 16..21 rows 43..46
  'TFF.FF......::::.............jGT',   // 44
  'TG..........::::.............jGT',   // 45
  'TG..........::::..............GT',   // 46
  'TGr.j.j.....::::kff...........GT',   // 47  the weapon stall; the Vial jar at 5,47; the weapon shop 19..21 rows 47..48
  'TG...jj.....::::kff...........GT',   // 48
  'TG...........:::..............GT',   // 49
  'TGvv.........:::.......FFFFFF.TT',   // 50
  'TFFFF........:::.........TTTTTTT',   // 51
  'TT.....FFFFF.:::FFFFFF...TTTTTTT',   // 52
  'TTTTTTTTTTTTT:::TTTTTTTTTTTTTTTT',   // 53  the road out
];

// a peach dome, w x 3 tiles, drawn from the nine dome tiles (edges curve, the middle is flat)
function kalayDome(M, x, y, w) {
  const crown = (i) => w % 2 === 1 ? (i === (w - 1) / 2 ? 'c' : 'm') : i === w / 2 - 1 ? 'cl' : i === w / 2 ? 'cr' : 'm';   // the finial sits on the crown's middle, or astride it
  for (let j = 0; j < 3; j++) for (let i = 0; i < w; i++) M.setObj(x + i, y + j, 'dome_' + j + (i === 0 ? 'l' : i === w - 1 ? 'r' : j === 0 ? crown(i) : 'm'));
}
const KH = { wall: 'wall_kalay', doorTile: 'door_kalay', windowTile: 'window_kalay' };

defineMap('kalay', {
  name: 'Kalay', w: 32, h: 54, base: 'grass', music: 'town', bg: 'grass', entry: { x: 14, y: 52 },
  build(M) {
    M.paint(0, 0, KALAY_ROWS, KALAY_LEGEND, { set: 'cliff', faces: 2 });
    // ---- the palace: two domed wings about the keep, a double door under the great dome ----
    M.house(7, 10, 4, 3, 'roof_slate', Object.assign({ wallRows: 2, door: false }, KH)); kalayDome(M, 7, 7, 4);
    M.house(17, 10, 4, 3, 'roof_slate', Object.assign({ wallRows: 2, door: false }, KH)); kalayDome(M, 17, 7, 4);
    M.house(11, 8, 6, 5, 'roof_slate', Object.assign({ wallRows: 5, doorX: 2, to: 'kalay_palace', tx: 8, ty: 12 }, KH)); kalayDome(M, 11, 5, 6);
    M.setObj(14, 12, 'door_kalay'); M.walkable(14, 12); M.exit(14, 12, 1, 1, 'kalay_palace', 8, 12, DIR.UP, { door: true });
    M.setObj(12, 9, 'window_kalay'); M.setObj(15, 9, 'window_kalay'); M.setObj(13, 9, 'window_kalay'); M.setObj(14, 9, 'window_kalay');
    M.setObj(7, 12, 'window_kalay'); M.setObj(10, 12, 'window_kalay'); M.setObj(17, 12, 'window_kalay'); M.setObj(20, 12, 'window_kalay');
    // ---- the town's houses ----
    M.house(2, 29, 4, 5, 'roof_slate', Object.assign({ doorX: 2, to: 'kalay_house3', tx: 6, ty: 8 }, KH));                                  // E
    M.house(6, 31, 6, 5, 'roof_slate', Object.assign({ doorX: 3, to: 'kalay_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }, KH));              // G, the item shop
    M.house(6, 36, 3, 2, 'roof_slate', Object.assign({ wallRows: 2, doorX: 1, to: 'kalay_house1', tx: 6, ty: 8, windows: false }, KH));     // F, under it
    M.house(14, 32, 7, 6, 'roof_slate', Object.assign({ doorX: 5, to: 'kalay_inn', tx: 7, ty: 8, sign: 'inn_sign' }, KH));                   // H, the inn
    M.house(22, 27, 6, 4, 'roof_slate', Object.assign({ wallRows: 1, doorX: 3, to: 'kalay_house2', tx: 6, ty: 8 }, KH));                    // K, up on the terrace
    M.house(24, 32, 4, 3, 'roof_slate', Object.assign({ wallRows: 2, doorX: 1, to: 'kalay_house4', tx: 6, ty: 8 }, KH));                    // J, below it
    M.house(24, 42, 5, 5, 'roof_slate', Object.assign({ doorX: 1, to: 'kalay_house5', tx: 6, ty: 8 }, KH));                                 // D
    M.house(6, 46, 6, 3, 'roof_slate', Object.assign({ wallRows: 2, doorX: 3, to: 'kalay_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign' }, KH)); kalayDome(M, 7, 43, 4);   // A, the sanctum
    M.house(16, 43, 6, 4, 'roof_slate', Object.assign({ wallRows: 1, doorX: 2, to: 'kalay_armory', tx: 6, ty: 6, sign: 'armor_sign' }, KH));   // C, the armory
    M.house(19, 47, 3, 2, 'roof_slate', Object.assign({ wallRows: 2, doorX: 1, to: 'kalay_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false }, KH));   // B, the weapon shop
    M.setObj(27, 23, 'door_cave'); M.walkable(27, 23); M.exit(27, 23, 1, 1, 'kalay_tunnel_2', 18, 52, DIR.UP, { door: true });   // the thieves' way out of the tunnel
    M.setObj(28, 38, 'well_tl'); M.setObj(29, 38, 'well_tr'); M.setObj(28, 39, 'well_bl'); M.setObj(29, 39, 'well_br');
    for (const [x, y, red] of [[12, 2, 1], [18, 4, 0], [26, 2, 1], [10, 11, 0], [22, 15, 1], [6, 16, 0], [21, 17, 1], [22, 24, 0], [2, 49, 1], [28, 49, 0], [23, 52, 1], [11, 50, 0]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    M.exit(13, 53, 3, 1, 'world_gs1', 56, 67, DIR.DOWN);
    M.trigger(12, 50, 5, 2, STORY.kalayTourists, { cond: () => G.flag('layana_met') && !G.flag('kalay_tourists') });   // the carnival crowd sets off for Tolbi
    // ---- the people of Kalay ----
    M.npc('kalay_pg1', 12, 13, { type: 'guard', text: "This is the palace of Master Hammet, the great merchant of Kalay. Lady Layana receives visitors within." });
    M.npc('kalay_pg2', 15, 13, { type: 'guard', text: () => G.flag('hammet_rescued') ? "Master Hammet is home. The whole palace breathes again." : "The master set out for Vault with a caravan and never came back. The guards talk of nothing else." });
    M.npc('kalay_gard', 20, 15, { type: 'elder_m', move: 'wander', text: "Master Hammet planted every tree on this bluff himself. A merchant who loves shade, he says." });
    M.npc('kalay_pool1', 11, 26, { type: 'villager_f', text: "The pools are fed from the palace spring. Cold as snow, even in summer." });
    M.npc('kalay_pool2', 16, 24, { type: 'child_f', move: 'wander', text: "I'm not allowed in the pool. I'm only allowed to LOOK at the pool." });
    M.npc('kalay_m1', 3, 34, { type: 'villager_m', move: 'wander', text: () => G.flag('hammet_rescued') ? "Master Hammet is home safe! Kalay rejoices!" : "Master Hammet never returned from Vault. Lady Layana is beside herself with worry." });
    M.npc('kalay_stall1', 10, 37, { type: 'merchant', name: 'Grocer', dir: DIR.DOWN, text: "Fruit from Xian, herbs from Kolima. The shop inside has the medicines." });
    M.npc('kalay_f1', 22, 36, { type: 'villager_f', move: 'wander', text: "Ships to Tolbi leave from Kalay Docks, south of here. Colosso is coming up - the whole world is going!" });
    M.npc('kalay_old', 26, 39, { type: 'elder_f', text: "Long ago, Kalay was founded by Adepts of the Jupiter Clan. Lady Layana carries their blood." });
    M.npc('kalay_rug', 17, 41, { type: 'merchant', name: 'Peddler', dir: DIR.RIGHT, text: "Carpets from Tolbi, cheap! Well... not cheap. But from Tolbi." });
    M.npc('kalay_kid', 22, 49, { type: 'child_m', move: 'wander', text: "Lunpa is a town of thieves! Dodonpa's gang runs it. Don't go there!" });
    M.npc('kalay_smith', 17, 48, { type: 'merchant', name: 'Smith', dir: DIR.RIGHT, text: "Blades out here, mail in the shop behind me. The armory upstairs has the good plate." });
    M.npc('kalay_priest', 4, 49, { type: 'priest', move: 'wander', text: "The sanctum is open to all. Even to those who bring their troubles in sacks." });
    M.npc('kalay_far', 22, 50, { type: 'villager_m', text: "Follow the road south and west for the docks. Mind the Kalay Tunnel on the way - thieves use it." });
  }
});
Kit.interior('kalay_palace', { name: "Hammet's Palace", w: 16, h: 14, floor: 'carpet_red', wall: 'wall_in_stone', back: { map: 'kalay', x: 13, y: 13 }, furn: [['statue', 3, 2], ['statue', 12, 2], ['torch', 5, 1], ['torch', 10, 1], ['bookshelf', 1, 3], ['bookshelf', 14, 3], ['table', 7, 5], ['chair', 6, 5], ['chair', 9, 5]], npcs: [{ id: 'Layana', x: 8, y: 3, look: NPC_LOOKS.Layana, name: 'Lady Layana', script: STORY.layana }, { id: 'kalay_pg', x: 4, y: 8, type: 'guard', text: "Lady Layana awaits news of Master Hammet." }, { id: 'HammetHome', x: 10, y: 3, look: NPC_LOOKS.Hammet, name: 'Master Hammet', showIf: 'hammet_rescued', script: STORY.hammetHome }], chests: [[13, 9, 'Water Jacket', 1]] });
Kit.inn('kalay_inn', { name: 'Kalay Inn', price: 40, back: { map: 'kalay', x: 19, y: 38 } });
Kit.shop('kalay_itemshop', { name: 'Kalay Item Shop', shop: 'kalay_item', back: { map: 'kalay', x: 9, y: 36 } });
Kit.shop('kalay_armory', { name: 'Kalay Armory', shop: 'kalay_armor', back: { map: 'kalay', x: 18, y: 47 } });
Kit.shop('kalay_weaponshop', { name: 'Kalay Weapon Shop', shop: 'kalay_weapon', back: { map: 'kalay', x: 20, y: 49 } });
Kit.sanctum('kalay_sanctum', { name: 'Kalay Sanctum', back: { map: 'kalay', x: 9, y: 49 } });
Kit.home('kalay_house1', { back: { map: 'kalay', x: 7, y: 38 }, chests: [[9, 3, 'Potion', 1]] });
Kit.home('kalay_house2', { back: { map: 'kalay', x: 25, y: 31 }, npcs: [{ id: 'kh2', x: 5, y: 5, type: 'sailor', text: "I sail the Kalay-Tolbi route. Lately a great sea monster has been sighted... the Kraken!" }] });
Kit.home('kalay_house3', { back: { map: 'kalay', x: 4, y: 34 }, npcs: [{ id: 'kh3', x: 5, y: 5, type: 'elder_m', text: "The palace stair has two hundred steps. I counted them every day for forty years, carrying the master's letters." }] });
Kit.home('kalay_house4', { back: { map: 'kalay', x: 25, y: 35 }, npcs: [{ id: 'kh4', x: 4, y: 5, type: 'villager_f', text: "My husband is up on the terrace mending the roof. He mends it every spring and it leaks every winter." }] });
Kit.home('kalay_house5', { back: { map: 'kalay', x: 25, y: 47 }, npcs: [{ id: 'kh5', x: 6, y: 5, type: 'scholar', text: "The Jupiter Adepts who founded Kalay could read the wind. Their descendants read ledgers. Progress, of a kind." }] });

// ---------- Kalay Docks ----------
// The landing south-west of Kalay, from its rip: the sea on the west, the long wooden pier with its barrels and the
// gangplank to the Tolbi ship, the shore climbing in narrow ridges of cliff to the plateau where Ground hides in a
// cleft, and the sailors' thatched house by the sandy path that comes up from the world in the south.
const KD_LEGEND = {
  '.': 'grass', 'p': 'path', '~': 'water', 'd': 'dock', 's': 'ship_deck',
  'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'B': { ground: 'grass', obj: 'rock_grass' },
  'j': { ground: 'dock', obj: 'pot' }, 'b': { ground: 'dock', obj: 'barrel' }, 'R': { ground: 'ship_deck', obj: 'ship_rail' },
};
const KD_ROWS = [
  '~~~~~~##.....#...#.#TT',   // 0
  '~~~~~~##...###...#.#TT',   // 1
  '~~~~~~##..T###...#.#TT',   // 2
  '~~~~~~##..T###...#.#..',   // 3
  '~~~~~~##.v.###...#TTTT',   // 4
  '~~~~~~##...###....TTTT',   // 5
  '~~~~~~##...###....TTTT',   // 6
  '~~~~~~##.....#....TTTT',   // 7
  '~~~~~~~#.v...#.#....TT',   // 8   Ground's cleft: x14 rows 8..11
  '~~~~~~~#.....#.#....TT',   // 9
  '~~~~~~~~#....#.#....TT',   // 10
  '~~~~~~~~#..B.#.#....TT',   // 11
  '~~dddb~~#......#....TT',   // 12  the pier head
  '~~dddj~~#......#....TT',   // 13
  '~~dddd~~#..........TTT',   // 14
  'R~dddd~~#..........TTT',   // 15  the ship's stern at x0
  'sdjddd~~#.ppp.vvvv..TT',   // 16  the gangplank
  'sddddd~~#.ppp.vvvv..TT',   // 17
  'sdbddd~~#.ppp.......TT',   // 18
  'R~jddd~~#.ppp.......TT',   // 19
  '~~dddddd..ppp.......TT',   // 20  the pier's arm to the shore; the house 14..19 rows 20..25
  '~~dddddd..ppp.......TT',   // 21
  '~~dddddd..ppp.......TT',   // 22
  '~~dddddd..ppp.......TT',   // 23
  '~~~~~~~~##ppp.......TT',   // 24
  '~~~~~~~~##.pp.......jT',   // 25
  '~~~~~~~~~#.pp...p....T',   // 26
  '~~~~~~~~~#.ppp..p..TTT',   // 27
  '~~~~~~~~~~#ppp..v.rTTT',   // 28
  '~~~~~~~~~~#ppp.....TTT',   // 29
  '~~~~~~~~~~#ppp..TTTTTT',   // 30
  '~~~~~~~~~~#pppTTTTTTTT',   // 31  the road out
];
defineMap('kalay_docks', {
  name: 'Kalay Docks', w: 22, h: 32, base: 'grass', music: 'town', bg: 'water', entry: { x: 12, y: 30 },
  build(M) {
    M.paint(0, 0, KD_ROWS, KD_LEGEND, { set: 'cliff', faces: 2 });
    M.house(14, 20, 6, 6, 'roof_thatch', { wall: 'wall_wood', doorX: 2, to: 'kalay_docks_house', tx: 6, ty: 8, chimney: true });
    for (const [x, y, red] of [[20, 5, 0], [19, 9, 1], [20, 12, 1], [19, 29, 0], [17, 31, 1]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    M.exit(11, 31, 3, 1, 'world_gs1', 50, 71, DIR.DOWN);
    M.npc('dock_captain', 3, 18, { type: 'sailor', name: 'Captain', dir: DIR.RIGHT, script: STORY.boardShip });
    M.trigger(10, 27, 6, 3, STORY.docksOcean, { cond: () => !G.flag('docks_ocean') });   // the first look at the sea from the landing
    M.npc('dock_sailor', 0, 17, { type: 'sailor', dir: DIR.RIGHT, text: "Fine weather for a crossing. Unless the Kraken shows up, that is." });
    M.npc('dock_hand', 4, 21, { type: 'sailor', move: 'wander', text: "Barrels of Kalay wine for Tolbi. Colosso drinks the town dry every year." });
    M.npc('dock_old', 12, 18, { type: 'elder_m', text: "I've watched the ships from this shore for sixty years. The sea was never this restless." });
    M.npc('dock_kid', 12, 14, { type: 'child_m', move: 'wander', text: "I wanna go to Colosso in Tolbi too!" });
    M.npc('dock_f', 14, 26, { type: 'villager_f', move: 'wander', text: "Up in the cliffs there's a cleft the goats use. Something glows in it at night." });
    M.djinni('Ground', 14, 9, { fight: true });
  }
});
Kit.home('kalay_docks_house', { back: { map: 'kalay_docks', x: 16, y: 26 }, npcs: [{ id: 'dh', x: 5, y: 5, type: 'sailor', name: 'Clerk', script: STORY.ticketOffice, text: "A ticket to Tolbi costs a fortune normally, but the captain owes Master Hammet a favor." }], chests: [[9, 3, 'Sacred Feather', 1]] });
