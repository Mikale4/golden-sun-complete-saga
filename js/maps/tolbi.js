// ---------- Tolbi ----------
// Babi's city, traced from the reference rip: white marble on green terraces. The town proper is the lower screen -
// the plaza with the Lucky Fountain at its heart, the shops and houses of pale stone with mint-tiled roofs set about
// it on the terraces, marble gates north and south, Ember on the ledge in the east - and above it the palace yard,
// the great outer wall with its gate, the market stalls under the wall and the way east to Colosso.
'use strict';

const TOLBI_LEGEND = {
  '.': 'grass', 'm': 'marble', 'p': 'path', '~': 'water', '=': 'stonefloor', 'S': 'stairs',
  '#': 'cliff', 'k': { ground: 'grass', obj: 'pillar' }, 'D': { ground: 'stonefloor', obj: 'dragon_statue' },
  'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_grass' }, 'j': { ground: 'grass', obj: 'pot' }, 'P': { ground: 'grass', obj: 'psystone' },
};
const TOLBI_ROWS = [
  '...mm.............mm................mm',   // 0   the west arch and the main gate up to the yard; Ember's ledge at 36..37
  '..====...........====.................',   // 1
  '..kmmk...........kmmk........###......',   // 2
  '..kmmk...........kmmk........###......',   // 3   the K house 24..28 rows 1..5
  '##kmmk...........kmmk.......j###......',   // 4
  '##kmmk...........kmmk.......j###......',   // 5
  '#rmmmmmmm.........mm####.....#k#......',   // 6   the F house 9..14 rows 3..7
  '..rSSmmmm.........mm####.....##k......',   // 7
  '...SS..###........mm........vj......#S',   // 8   the G house 25..28 rows 8..11; the corn stall 21..22; the stair up to Ember's ledge
  '...SS..######v##..mm................#S',   // 9
  'r..SS..#########..mm...............j..',   // 10
  '###SSk####k#####..mm............#j##..',   // 11
  '###mmmmmppmmmmmmmmmmmmmmmmmmmmm.####r.',   // 12  the plaza
  '#####mmmmmmmm=~~=D=~~=mmmmmmmmm.##P#..',   // 13  the Lucky Fountain
  '.....mmmmmmmm=~~~~~~~=mmmmmmmmm.##.#..',   // 14  the way to Colosso at 36..37
  '.....mmmmmmmm=~~~~~~~=mmmmmmmmm.....r.',   // 15
  '.....mmmmpmmm=========mmmmmmmmm.######',   // 16  the sanctum 2..7 rows 16..21
  '.........p......mmmmmm..........######',   // 17  the D house 24..29 rows 17..22
  '.........p......mmmmmm........j.######',   // 18
  '.........p......mmmmmm..........######',   // 19
  '.........#........SS..................',   // 20  the armoury 10..15 rows 20..23 over the item shop rows 24..27
  '.........#........SS..............v...',   // 21  the C house 22..25 rows 21..25
  '.........#........SS..........#####v##',   // 22
  '.........#........SS..........###v####',   // 23
  '.r...r...........=mm=.........########',   // 24
  '.rr.r............kmmk.....j####.......',   // 25  the south arch; the C house's door steps out at 21,26
  '######k##........kmmk.....#####.......',   // 26
  '#######k#........kmmk.....#####...v...',   // 27
  '###k#####........kmmk..v########....v.',   // 28
  '...v..v...######..mm....#v###v##......',   // 29
  'T...v.....v..v....mm.......v...T.v...T',   // 30
  '.T.....T.......T..mm..T.....T.......T.',   // 31  the road out to the world
];
const TH = { wall: 'wall_stone', doorTile: 'door_stone', windowTile: 'window_stone' };

defineMap('tolbi', {
  name: 'Tolbi', w: 38, h: 32, base: 'grass', music: 'town', bg: 'grass', entry: { x: 18, y: 30 },
  build(M) {
    M.paint(0, 0, TOLBI_ROWS, TOLBI_LEGEND, { set: 'cliff', faces: 2 });
    // ---- the houses of pale stone ----
    M.house(9, 3, 6, 5, 'roof_teal', Object.assign({ doorX: 1, to: 'tolbi_lucky', tx: 6, ty: 6, sign: 'shop_sign' }, TH));                        // F, the Lucky Wheel
    M.house(24, 1, 5, 5, 'roof_teal', Object.assign({ doorX: 1, to: 'tolbi_house1', tx: 6, ty: 8 }, TH));                                        // K
    M.house(25, 8, 4, 4, 'roof_blue', Object.assign({ doorX: 1, to: 'tolbi_house_g', tx: 6, ty: 8, windows: false }, TH));                       // G, under the blue tent roof
    M.house(32, 1, 4, 5, 'roof_teal', Object.assign({ doorX: 1, to: 'tolbi_house_j', tx: 6, ty: 8 }, TH));                                        // J, up on the inn
    M.house(32, 6, 4, 4, 'roof_teal', Object.assign({ doorX: 1, to: 'tolbi_inn', tx: 7, ty: 8, sign: 'inn_sign' }, TH));                          // H, the inn
    kalayDome(M, 3, 16, 4); M.house(2, 19, 6, 3, 'roof_teal', Object.assign({ wallRows: 2, doorX: 3, to: 'tolbi_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign' }, TH));   // E, the sanctum
    M.house(10, 20, 6, 4, 'roof_teal', Object.assign({ wallRows: 1, doorX: 2, to: 'tolbi_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign' }, TH));   // B, the armoury
    M.house(10, 24, 6, 4, 'roof_teal', Object.assign({ wallRows: 2, doorX: 2, to: 'tolbi_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }, TH));     // A, the item shop under it
    M.house(24, 17, 6, 6, 'roof_teal', Object.assign({ doorX: 4, to: 'tolbi_house_d', tx: 6, ty: 8 }, TH));                                       // D
    M.house(21, 21, 4, 5, 'roof_teal', Object.assign({ doorX: 0, to: 'tolbi_house_c', tx: 6, ty: 8, windows: false }, TH));                       // C
    M.setObj(21, 9, 'awning_red'); M.setObj(22, 9, 'awning_red'); M.setObj(21, 10, 'market_stall'); M.setObj(22, 10, 'market_stall');            // the corn seller's stall
    // ---- the ways in and out ----
    M.exit(18, 0, 2, 1, 'tolbi_yard', 15, 17, DIR.UP); M.exit(3, 0, 2, 1, 'tolbi_yard', 3, 17, DIR.UP); M.exit(36, 0, 2, 1, 'tolbi_yard', 30, 17, DIR.UP);
    M.exit(18, 31, 2, 1, 'world_gs1', 33, 72, DIR.DOWN);
    M.exit(37, 13, 1, 2, 'colosso', 4, 12, DIR.RIGHT); M.walkable(36, 13, 2, 2);
    M.djinni('Ember', 36, 3, { fight: true });
    for (const [x, y, red] of [[1, 30, 0], [8, 30, 1], [24, 30, 0], [33, 31, 1]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    // ---- the people of Tolbi ----
    M.npc('tolbi_g1', 17, 6, { type: 'guard', text: () => G.flag('babi_missing') && !G.flag('babi_found') ? "Lord Babi has gone missing! The palace is in an uproar." : "Lord Babi's palace is up the road. Mind the guards at the wall." });
    M.npc('tolbi_m1', 8, 14, { type: 'villager_m', move: 'wander', text: "Colosso! The greatest tournament in the world! Fighters come from everywhere to compete." });
    M.npc('tolbi_f1', 26, 14, { type: 'villager_f', move: 'wander', text: "Lord Babi is over 150 years old, they say. He drinks a special draught from Lemuria to stay alive." });
    M.npc('tolbi_kid', 20, 18, { type: 'child_m', move: 'wander', text: "Throw a Lucky Medal in the fountain and you might win a prize!" });
    M.npc('tolbi_lucky', 17, 17, { type: 'merchant', name: 'Fountain Keeper', dir: DIR.DOWN, script: STORY.luckyFountain });
    // the dice tent by the west stair, and the pair of guards at the west arch asking after their missing lord
    M.setObj(2, 14, 'tent'); M.setObj(3, 14, 'tent'); M.npc('dice_master', 3, 15, { type: 'merchant', name: 'Dice Master', dir: DIR.DOWN, script: STORY.luckyDice });
    M.npc('tolbi_wg1', 3, 1, { type: 'guard', dir: DIR.DOWN, cond: () => G.flag('iodem_met') && !G.flag('babi_found'), text: "Halt - you there! Have you seen an old man, richly dressed, out on the road north? No? ...Lord Babi. Our lord has gone missing, and Colosso opens in days." });
    M.npc('tolbi_wg2', 4, 1, { type: 'guard', dir: DIR.DOWN, cond: () => G.flag('iodem_met') && !G.flag('babi_found'), text: "He goes off alone, north, to that cave - Altmiller. Never says why. If you are heading that way, and you find him... bring him home." });
    M.npc('tolbi_corn', 22, 11, { type: 'merchant', name: 'Corn Seller', dir: DIR.DOWN, text: "Corn! Roasted corn! Best in Tolbi! ...Only corn in Tolbi, but still." });
    M.npc('tolbi_old', 27, 24, { type: 'elder_m', text: "Altmiller Cave lies to the northwest. Lord Babi often goes there... alone. Strange for a man his age." });
    M.npc('tolbi_w1', 3, 24, { type: 'villager_f', text: "The rocks by the sanctum are what's left of the old chapel. The priest says they're holy. I say they're rocks." });
    M.npc('tolbi_s1', 34, 15, { type: 'scholar', text: "The stone below the rocks gives back Psynergy. The rocks themselves give back nothing, believe me, I've asked." });
    M.npc('tolbi_gate', 19, 26, { type: 'guard', dir: DIR.DOWN, text: "The docks are down the road. Colosso's the other way, past the palace." });
  }
});
// ---- the palace yard: the outer wall and its gate, the stalls under it, the way east to the arena ----
const TY_LEGEND = { '.': 'grass', 'm': 'marble', 'p': 'path', '#': 'cliff', 'W': { ground: 'grass', obj: 'wall_stone' }, 'w': { ground: 'grass', obj: 'window_stone' }, 'k': { ground: 'grass', obj: 'pillar' }, 'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_grass' }, 'j': { ground: 'grass', obj: 'pot' } };
const TY_ROWS = [
  'WWWWWWWWWWWWWWWmmWWWWWWWWWWWWWWW',   // 0   the palace door at 15..16
  'WWWWWWwWWWWWWWWmmWWWWWWWwWWWWWWW',   // 1
  'WWWWWWWWWWWWWWWmmWWWWWWWWWWWWWWW',   // 2
  '.T.....WWWWWWWWmmWWWWWWWWWW.....',   // 3
  '..T.T........k.mm.k.........r...',   // 4
  '.T.T..........Wmm.W.........r...',   // 5
  '...T.....r....Wmm.W.....r....T..',   // 6
  '..............kmmk...........T..',   // 7
  '.....p....######mm######......##',   // 8   the stalls under the wall's terrace
  '....p.....######mm######.....###',   // 9
  '...p.....k....k.mm.k....k....###',   // 10
  '...p..........kmmk...........###',   // 11
  '..p...........kmmk............##',   // 12
  '..p.........v.pmmp.v...........#',   // 13
  '..p....r....v.pmmp.v.....v.....#',   // 14  the way east to Colosso at 31,14..15
  '..p...........pmmp..........r...',   // 15
  '..p...........pmmp..............',   // 16
  '..p..........ppmmpp.............',   // 17
  'TT.TTTTTTTTTTT.mm.TTTTTTTTTT..TT',   // 18  down to the town: the west arch, the main gate, Ember's ledge
];
defineMap('tolbi_yard', {
  name: 'Tolbi', w: 32, h: 19, base: 'grass', music: 'town', bg: 'grass', entry: { x: 15, y: 17 },
  build(M) {
    M.paint(0, 0, TY_ROWS, TY_LEGEND, { set: 'cliff', faces: 2 });
    for (const x of [15, 16]) { M.setObj(x, 0, 'door_stone'); M.walkable(x, 0); }
    M.exit(15, 0, 2, 1, 'tolbi_palace', 8, 14, DIR.UP, { door: true });
    M.setObj(5, 7, 'awning_blue'); M.setObj(6, 7, 'awning_blue'); M.setObj(9, 7, 'awning_blue'); M.setObj(10, 7, 'awning_blue');
    M.setObj(5, 8, null); M.setObj(6, 8, null); M.setObj(9, 8, null); M.setObj(10, 8, null); M.set(5, 8, 'grass'); M.set(6, 8, 'grass'); M.set(9, 8, 'grass'); M.set(10, 8, 'grass');
    M.setObj(5, 8, 'market_stall'); M.setObj(6, 8, 'market_stall'); M.setObj(9, 8, 'market_stall'); M.setObj(10, 8, 'market_stall');
    M.exit(15, 18, 2, 1, 'tolbi', 18, 1, DIR.DOWN); M.exit(2, 18, 1, 1, 'tolbi', 3, 1, DIR.DOWN); M.exit(29, 18, 1, 1, 'tolbi', 36, 1, DIR.DOWN);   /* one cell: the other of the pair is wall */
    M.exit(31, 14, 1, 2, 'colosso', 4, 12, DIR.RIGHT); M.walkable(31, 14, 1, 2);
    M.npc('tolbi_pg1', 14, 4, { type: 'guard', dir: DIR.DOWN, text: "Lord Babi's palace. State your business... Colosso? Then you'll want the arena, east along the wall." });
    M.npc('tolbi_pg2', 17, 4, { type: 'guard', dir: DIR.DOWN, text: "The palace is open to Colosso's fighters. Lord Babi likes to look them over himself." });
    M.npc('Iodem', 18, 9, { look: NPC_LOOKS.Iodem, name: 'Iodem', dir: DIR.DOWN, script: STORY.iodemTolbi });
    M.npc('tolbi_stall1', 5, 9, { type: 'merchant', name: 'Stallholder', dir: DIR.DOWN, text: "Colosso souvenirs! Banners, whistles, little wooden Azarts!" });
    M.npc('tolbi_stall2', 9, 9, { type: 'merchant', name: 'Stallholder', dir: DIR.DOWN, text: "Lucky Medals bought and sold. Well - bought. Nobody sells." });
    M.npc('tolbi_y1', 24, 12, { type: 'villager_m', move: 'wander', text: "Every year the whole world comes to Tolbi for Colosso. Every year the inn is full by noon." });
    M.npc('tolbi_y2', 8, 15, { type: 'elder_f', move: 'wander', text: "That road west of the palace goes up to Altmiller Cave. Lord Babi walks it alone. At his age!" });
  }
});
// the Cloak Ball on the stand by Babi's bed, once he sleeps
function tolbiCloakBall(M) { M.object('catchable', 13, 5, { id: 'cloak_ball', item: 'Cloak Ball', look: 'cloak_ball', script: function* (E) { if (G.flag('cloak_ball_taken')) return; G.set('cloak_ball_taken'); G.inventory.add('Cloak Ball'); Audio.sfx('item'); yield E.say('(Isaac slips the Cloak Ball off the bedside stand. Lord Babi does not stir.)'); yield E.say("Borrowing, Isaac. We're borrowing it.", 'Garet'); const o = G.map.objects.find(ob => ob.id === 'cloak_ball'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } } }); }
Kit.interior('tolbi_palace', { name: "Babi's Palace", w: 16, h: 16, floor: 'carpet_red', wall: 'wall_in_stone', back: { map: 'tolbi_yard', x: 15, y: 1 }, furn: [['statue_gold', 3, 2], ['statue_gold', 12, 2], ['torch', 5, 1], ['torch', 10, 1], ['bookshelf', 1, 3], ['bookshelf', 14, 3], ['table', 7, 6], ['chair', 6, 6], ['chair', 9, 6], ['bed', 12, 4], ['bed_foot', 12, 5]],
  build(M) { M.set(8, 12, 'stairs_down'); M.setObj(8, 12, null); M.walkable(8, 12); M.exit(8, 12, 1, 1, 'tolbi_bedroom', 4, 6, DIR.DOWN, { stairs: true });
    M.setObj(15, 8, 'door'); M.walkable(15, 8); M.exit(15, 8, 1, 1, 'colosso_tribune', 2, 5, DIR.RIGHT, { door: true });   // the passage out to the tribunes over the arena if (G.flag('babi_abed') && !G.flag('cloak_ball_taken')) tolbiCloakBall(M);
    M.npc('ShebaCaptive', 2, 12, { look: CHARACTERS.Sheba.look, name: 'Girl', dir: DIR.DOWN, text: () => G.flag('babi_permission') ? "...You're going to Lalivero? Tell Faran I'm well. Tell him not to come." : "I'm Sheba. Lord Babi keeps me here - a guest, he says. My father Faran of Lalivero thinks it's the price of Babi's lighthouse. ...Don't look at me like that. I can hear what you're thinking.", cond: () => !G.flag('sheba_kidnapped') }); }, npcs: [{ id: 'Babi', x: 8, y: 3, look: NPC_LOOKS.Babi, name: 'Lord Babi', script: STORY.babi, cond: () => (G.flag('babi_found') || !G.flag('babi_missing')) && !G.flag('babi_abed') }, { id: 'BabiAbed', x: 12, y: 5, look: NPC_LOOKS.Babi, name: 'Lord Babi', text: "Zzz... Lemuria... the mists...", cond: () => G.flag('babi_abed') },
    { id: 'palace_talker1', x: 6, y: 8, type: 'noble', name: 'Courtier', text: () => G.flag('babi_found') ? "Lord Babi is back, and Colosso opens. All is as it should be." : "Lord Babi, gone! Off to that cave again, if you ask me. Altmiller, north of the town. He thinks nobody knows.", cond: () => G.flag('babi_missing') },
    { id: 'palace_talker2', x: 7, y: 8, type: 'scholar', name: 'Steward', text: () => G.flag('babi_found') ? "The tournament's patron in his box, as it should be. You have Tolbi's thanks." : "Hush! If the crowd hears the tournament has no patron... Say nothing.", cond: () => G.flag('babi_missing') }, { id: 'tolbi_pg3', x: 4, y: 9, type: 'guard', text: "Lord Babi is the wisest ruler in all Angara." }, { id: 'tolbi_pg4', x: 11, y: 9, type: 'guard', text: "Colosso is Lord Babi's greatest joy. He watches every bout from his box." }] });
Kit.inn('tolbi_inn', { name: 'Tolbi Inn', price: 50, back: { map: 'tolbi', x: 33, y: 10 } });
Kit.shop('tolbi_itemshop', { name: 'Tolbi Item Shop', shop: 'tolbi_item', back: { map: 'tolbi', x: 12, y: 28 } });
Kit.shop('tolbi_weaponshop', { name: 'Tolbi Armory', shop: 'tolbi_weapon', back: { map: 'tolbi', x: 12, y: 24 } });
Kit.sanctum('tolbi_sanctum', { name: 'Tolbi Sanctum', back: { map: 'tolbi', x: 5, y: 22 } });
Kit.interior('tolbi_lucky', { name: 'Lucky Wheel', w: 12, h: 9, back: { map: 'tolbi', x: 10, y: 8 }, furn: [['counter', 3, 3], ['counter', 4, 3], ['counter', 5, 3], ['counter', 6, 3], ['counter', 7, 3], ['shelf', 2, 2], ['shelf', 9, 2]], npcs: [{ id: 'lucky_keeper', x: 5, y: 2, type: 'merchant', name: 'Game Master', script: STORY.luckyWheel }] });
Kit.home('tolbi_house1', { back: { map: 'tolbi', x: 25, y: 6 }, chests: [[9, 3, 'Game Ticket', 3]] });
Kit.home('tolbi_house_g', { back: { map: 'tolbi', x: 26, y: 12 }, npcs: [{ id: 'th_g', x: 5, y: 5, type: 'villager_m', text: "I sell tickets for the Lucky Wheel. I have never once won on it myself. Draw your own conclusions." }] });
Kit.home('tolbi_house_j', { back: { map: 'tolbi', x: 33, y: 6 }, npcs: [{ id: 'th_j', x: 4, y: 4, type: 'villager_f', text: "The ledge outside my door looks straight down on the inn's roof. On Colosso nights I could reach out and touch the noise." }], chests: [[9, 3, 'Lucky Medal', 1]] });
Kit.home('tolbi_house_d', { back: { map: 'tolbi', x: 28, y: 23 }, npcs: [{ id: 'th_d', x: 6, y: 5, type: 'elder_m', text: "Lord Babi built the fountain for the Lemurian who taught him to live long. Or so my grandfather said. He lived to ninety. Never touched the water." }] });
Kit.home('tolbi_house_c', { back: { map: 'tolbi', x: 21, y: 26 }, npcs: [{ id: 'th_c', x: 5, y: 5, type: 'child_f', text: "Daddy fought in Colosso once. He says he came fourth. Mummy says there were four." }], build(M) { M.container(2, 7, 'pot', 'Power Bread'); } });
