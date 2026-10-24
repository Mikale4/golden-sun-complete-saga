// ---------- Xian ----------
// The village of the Ki masters, traced from the reference rip: blue-tiled red houses in an autumn wood, the stream
// falling from the north over the cliff into the lily pond and running out west under the wooden bridge, Master
// Feh's dojo on the east bank, the pagoda where Feizhi lives beside the pond, the inn to the south-east and the
// fenced training field to the south-west. The sanctum and the shops are cut into the cliff face; Mist waits by the
// pond, and the Lucky Medal lies in the well.
'use strict';

const XIAN_LEGEND = {
  '.': 'grass', ':': 'path', '~': 'water', 'x': 'flowers',
  'W': { ground: 'water', obj: 'waterfall_mid' },
  'B': { ground: 'water', obj: 'bridge_v', walk: true },
  'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' },
  'F': { ground: 'grass', obj: 'fence_v' }, 'f': { ground: 'grass', obj: 'fence' },
  'p': { ground: 'grass', obj: 'pot' }, 'c': { ground: 'grass', obj: 'crate' }, 'b': { ground: 'grass', obj: 'barrel' }, 'w': { ground: 'grass', obj: 'well' }, 'l': { ground: 'grass', obj: 'lantern_stone' }, 's': { ground: 'grass', obj: 'sign' },
  'D': { ground: 'grass', obj: 'door_cave' },
};
// 27 x 30: the houses are set over the '.' blocks left for them (C top left, H top right, G the pagoda, A the inn)
const XIAN_ROWS = [
  'TTTTTTTTTTT~~TTTTTTTTTTTTTT',   // 0
  'TTTT......T~~T.........TTTT',   // 1  house C at 4..9, house H at 14..22
  'TTT.......T~~T.........TTTT',   // 2
  'TT........T~~T..........TTT',   // 3
  'TT........T~~T..........TTT',   // 4
  'TT.........~~...........TTT',   // 5
  'TT.........~~........cb.TTT',   // 6
  'TTT........WW...........TTT',   // 7  (the crate that used to wall off the dojo's yard is gone: the yard opens on the east lane)
  'TT.########WW#########..TTT',   // 8
  '#####D#####WW###D##D##..TTT',   // 9
  '####....~~~~~~......s..TTTT',   // 10
  '####B..~~~~~~~........TTTTT',   // 11
  '~~~~B~~~~~~~~~.....x..TTTTT',   // 12
  '~~~~B~~~~~~~~..........TTTT',   // 13
  'TT......~~~~.p.........TTTT',   // 14
  'TTT.l.................x.TTT',   // 15  the pagoda G over 13..17 rows 12..16, Mist at 22,15
  'TT..w..........:::.....TTTT',   // 16
  'TT.........::::::.......TTT',   // 17
  'TT..Ffffffff.::::........TT',   // 18  the training field 4..12 rows 18..25, the inn A at 16..21 rows 18..22
  'TT..F.v.v.v.F:::.........TT',   // 19
  'TT..F.......F.::.........TT',   // 20
  'TT..F.v.v.v.F..:.........TT',   // 21
  'TT..F.......F::::........TT',   // 22
  'TT..F.v.v.v.F:::::::.....TT',   // 23
  'TTT.F.......F...::....TTTTT',   // 24
  'TTT.Ffffffff....::....TTTTT',   // 25
  'TTTT.T..T..T.T..::.T.TTTTTT',   // 26
  'TTTTTTT.TTTT.TT.::TTTTTTTTT',   // 27
  'TTTTTTTTTTTTTTT.::.TTTTTTTT',   // 28
  'TTTTTTTTTTTTTTTT::TTTTTTTTT',   // 29
];

defineMap('xian', {
  name: 'Xian', w: 27, h: 30, base: 'grass', music: 'town', bg: 'grass', entry: { x: 16, y: 28 },
  build(M) {
    M.paint(0, 0, XIAN_ROWS, XIAN_LEGEND, { set: 'cliff', faces: 2 });
    // the doors in the cliff: the sanctum west of the fall, the armoury and the item shop east of it
    M.exit(5, 9, 1, 1, 'xian_sanctum', 6, 8, DIR.UP, { door: true }); M.exit(16, 9, 1, 1, 'xian_weaponshop', 6, 6, DIR.UP, { door: true }); M.exit(19, 9, 1, 1, 'xian_itemshop', 6, 6, DIR.UP, { door: true });
    M.setObj(4, 9, 'sanctum_sign'); M.setObj(15, 9, 'weapon_sign'); M.setObj(20, 9, 'shop_sign');
    const temple = { wall: 'wall_temple_red', doorTile: 'door_temple_red', windowTile: 'window_temple_red' };
    M.house(4, 1, 6, 5, 'roof_tile_blue', Object.assign({ to: 'xian_house1', tx: 6, ty: 8 }, temple));                     // C: a family's house
    M.house(14, 1, 9, 5, 'roof_tile_blue', Object.assign({ doorX: 4, to: 'xian_dojo', tx: 7, ty: 10 }, temple));          // H: Master Feh's dojo
    M.house(13, 12, 5, 5, 'roof_tile_blue', Object.assign({ wallRows: 2, to: 'xian_house2', tx: 6, ty: 8, windows: false }, temple));   // G: the pagoda, Feizhi's home
    M.house(16, 18, 6, 5, 'roof_tile_blue', Object.assign({ to: 'xian_inn', tx: 7, ty: 8, sign: 'inn_sign' }, temple));    // A: the inn
    // a few of the wood's trees stand tall, the autumn ones among them
    for (const [x, y, red] of [[1, 3, 1], [25, 2, 0], [24, 8, 1], [1, 17, 0], [24, 14, 1], [2, 27, 1], [22, 27, 0], [8, 28, 0], [25, 22, 1], [13, 27, 1]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    M.exit(16, 29, 2, 1, 'world_gs1', 58, 41, DIR.DOWN);
    // Mist by the pond (the Lucky Medal is in the well, through js/data/hidden_items.js)
    M.setObj(22, 14, 'tree'); M.setObj(22, 16, 'tree'); M.set(22, 15, G.flag('xian_hollow_wet') ? 'puddle' : 'puddle_dry'); M.block(22, 15);
    M.djinni('Mist', 23, 15, { fight: false });
    M.npc('xian_water', 20, 15, { type: 'villager_f', name: 'Water Carrier', dir: DIR.LEFT, script: STORY.xianWater });   // resting with her bucket between the pond and the orchard
    M.npc('xian_f1', 3, 5, { type: 'villager_f', move: 'wander', text: "Feizhi has been acting strange. She says she 'hears' someone calling from far away." });
    M.npc('xian_m1', 10, 5, { type: 'monk', name: 'Student', move: 'wander', text: "Master Feh teaches the way of Ki here in Xian. Ki is a lot like Psynergy, I think." });
    M.npc('xian_m2', 13, 6, { type: 'villager_m', text: "The stream comes down from the mountains above Altin. It has been running muddy since the mine flooded." });
    M.npc('xian_old', 3, 10, { type: 'elder_m', text: "Kalay lies to the west across the Lamakan Desert. Don't cross it without preparing - the heat is deadly." });
    M.npc('xian_girl', 11, 10, { type: 'child_f', text: "The lily pond is my favourite place. Sometimes I see something shining at the bottom of the well!" });
    M.npc('xian_m3', 6, 15, { type: 'villager_m', move: 'wander', text: "The training field is for the students. Master Feh has them stand in the river to learn stillness." });
    M.npc('Feizhi', 16, 26, { look: NPC_LOOKS.Feizhi, name: 'Feizhi', dir: DIR.UP, script: STORY.feizhi, cond: () => G.flag('feh_force_done') && !G.flag('feizhi_done') });   // at the gate, after the post falls
    M.npc('xian_kid', 6, 23, { type: 'child_m', move: 'wander', text: "Altin is up in the mountains to the east. They mine there. Or they did, till the flood!" });
    M.npc('xian_m4', 14, 23, { type: 'monk', name: 'Student', text: "Hammet's caravan came through on its way to Lunpa. Master Feh warned him about the road." });
    M.npc('xian_inn_m', 21, 22, { type: 'villager_m', text: "The inn's the blue-roofed house. Ask for a room facing the pond." });
  }
});
Kit.inn('xian_inn', { name: 'Xian Inn', price: 30, back: { map: 'xian', x: 19, y: 23 } });
Kit.shop('xian_itemshop', { name: 'Xian Item Shop', shop: 'xian_item', back: { map: 'xian', x: 19, y: 10 } });
Kit.shop('xian_weaponshop', { name: 'Xian Armory', shop: 'xian_weapon', back: { map: 'xian', x: 16, y: 10 } });
Kit.sanctum('xian_sanctum', { name: 'Xian Sanctum', back: { map: 'xian', x: 5, y: 10 } });
Kit.interior('xian_dojo', { name: 'Xian Dojo', w: 14, h: 12, floor: 'floor_tile', wall: 'wall_in_stone', back: { map: 'xian', x: 18, y: 6 }, furn: [['statue', 2, 2], ['statue', 11, 2], ['torch', 6, 1], ['torch', 7, 1], ['rug', 7, 7]],
  build(M) {
    // the striking post: a trunk set upright before the white line; Force from the line brings it down, and the
    // bolt of the door in the east wall slides with it (Feizhi's room)
    if (!G.flag('feh_force_done')) { M.object('log', 7, 6, { id: 'feh_trunk', len: 1, horiz: false, onForce: STORY.fehForce }); M.object('gate', 12, 5, { id: 'feh_door', tile: 'door_locked', state: 'shut', script: function* (E) { yield E.say('A door in the east wall, bolted from this side. The bolt is worked by something else in the room - the students look at the striking post and say nothing.'); } }); }
    else M.setObj(7, 6, 'stump');
    M.sign(4, 8, 'A white line on the floor before the post. "Strike from here. - Feh"');
  },
  npcs: [
  { id: 'Feh', x: 7, y: 3, type: 'monk', name: 'Master Feh', cond: () => G.flag('feh_force_done'), text: "Ki is the power within; Chi is the body's own strength. Psynergy is the power without. Feizhi has something that is none of the three, and I do not know what to teach her." },
  { id: 'xd1', x: 3, y: 7, type: 'monk', name: 'Student', text: "Hyah! ...Sorry. I'm practising my strikes." }, { id: 'xd2', x: 10, y: 7, type: 'monk', name: 'Student', text: "Master Feh says a still mind hears farther than any ear." }] });
Kit.home('xian_house1', { back: { map: 'xian', x: 7, y: 6 }, chests: [[9, 3, 'Nut', 2]], npcs: [{ id: 'xh1', x: 5, y: 5, type: 'villager_f', text: "We hang the lanterns on the pagoda at festival time. You should see the pond then." }] });
Kit.home('xian_house2', { back: { map: 'xian', x: 15, y: 17 }, chests: [[9, 3, 'Elixir', 1]], npcs: [{ id: 'xh2', x: 5, y: 5, type: 'elder_f', name: "Feizhi's mother", text: "Feizhi is out by the pond again. Ever since Hammet's caravan left she has been restless." }] });
