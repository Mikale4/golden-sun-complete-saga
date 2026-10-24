// ---------- Fuchin Temple and Fuchin Falls Cave ----------
// The shrine at the head of the falls, from the reference rip (FUCHIN_LAYOUT, tools/town_gen.py fuchin): the great
// fall down the middle into its pool and again into the plunge pool, whose poles are hopped to the cave mouth behind
// the water; Master Nyunpa's house on the terrace with its lanterns and the Psynergy Stone; the ramp down the east
// cliff to the meadow. The grotto behind the falls is the trial of Ki: its pools are crossed on poles afloat that
// carry whoever stands on them, the Mimic's chest, the Arctic Blade, Zephyr, the Dragon's Eye for the dragon's
// empty socket, and the hidden path it shows to the Orb of Force.
'use strict';

defineMap('fuchin', {
  name: 'Fuchin Temple', w: 28, h: 33, base: 'grass', music: 'east', bg: 'grass', entry: { x: 19, y: 31 },
  build(M) {
    const L = FUCHIN_LAYOUT.town;
    valeGround(M, L, { legend: { 'S': 'post_water' } });
    for (const [x, y] of [[13, 26], [11, 26], [10, 25]]) M.set(x, y, 'water_hop');   // the water between the poles is hopped
    // the cave mouth behind the lower fall, reached over the poles in the plunge pool; sealed until Nyunpa allows the trial
    M.set(10, 22, 'water'); M.setObj(10, 22, 'door_cave'); M.walkable(10, 22);
    M.exit(10, 22, 1, 1, 'fuchin_cave_1', 11, 15, DIR.UP, { door: true, cond: () => G.flag('nyunpa_trial') });
    M.trigger(10, 23, 1, 1, function* (E) { if (!G.flag('nyunpa_trial')) { yield E.say("(The mouth of the grotto is shut with a stone. Something in it hums, like a held breath.)"); yield E.say("The monks said the trial is only for those the master permits. Nyunpa's house is up on the terrace.", 'Garet'); } }, { cond: () => !G.flag('nyunpa_trial') });
    // Master Nyunpa's house on the terrace, its lanterns, the Psynergy Stone, the jar beside it
    M.house(14, 5, 10, 5, 'roof_tile_blue', { wall: 'wall_temple_red', doorTile: 'door_temple_red', windowTile: 'window_temple_red', doorX: 4, to: 'fuchin_hall', tx: 7, ty: 10 });
    for (const [x, y] of [[15, 11], [21, 11], [15, 13], [21, 13]]) M.setObj(x, y, 'lantern_stone');
    M.setObj(24, 8, 'psystone'); M.setObj(24, 10, 'pot');
    M.exit(18, 32, 3, 1, 'world_gs1', 68, 31, DIR.DOWN);
    M.sign(20, 30, "Fuchin Temple. 'The way of Ki is the way of the still water: it moves only when it must.'");
    // the monks and the pilgrims
    M.npc('fuchin_monk1', 17, 12, { type: 'monk', text: () => G.flag('nyunpa_done') ? "You have the master's blessing. Mogall's woods will still test you, but you have the means to pass them now." : "Master Nyunpa meditates within. He has not spoken in three years. Or eaten. Or... anything. He hears, though. Not with his ears.", mind: "Three years of silence, and I still burn the incense every morning. What if he never comes back to us?" });
    M.npc('fuchin_monk2', 22, 12, { type: 'monk', text: "The cave behind the falls is the trial of Ki. Only those the master permits may enter. He permits almost no one.", mind: "I failed the trial twice. The poles in the water... you must trust them to carry you." });
    M.npc('fuchin_monk3', 21, 26, { type: 'monk', move: 'wander', text: "Mogall Forest sprouted from the soil in a single night. Trees do not do that. Something fell from the sky the night before, they say - a stone that glowed.", mind: "The apes came with the forest. Before it, there were no apes in these hills at all." });
    M.npc('fuchin_woman', 16, 28, { type: 'villager_f', text: "The falls never run dry, not even in the driest summer. The monks say the mountain itself is praying.", mind: "The travellers who came through last week - the tall one with the red hair - they didn't even stop to pray." });
    M.npc('fuchin_child', 24, 20, { type: 'child_m', move: 'wander', text: "You can jump on the poles in the pool! The monks get mad, though. There's a door behind the waterfall, I saw it!" });
    M.trigger(17, 30, 5, 1, STORY.fuchinArrive, { once: 'fuchin_arrived' });
  }
});
// Master Nyunpa's hall: the altar, the lamps, and the master on his mat before it, three years into his silence
Kit.interior('fuchin_hall', { name: "Nyunpa's House", w: 14, h: 12, floor: 'floor_tile', wall: 'wall_in_stone', back: { map: 'fuchin', x: 18, y: 10 },
  furn: [['statue_gold', 6, 2], ['statue_gold', 7, 2], ['torch', 2, 1], ['torch', 11, 1], ['carpet', 5, 3, 4, 6], ['torch', 2, 8], ['torch', 11, 8], ['shelf', 9, 2], ['pot', 12, 8]],
  npcs: [{ id: 'Nyunpa', x: 6, y: 4, type: 'elder_m', name: 'Master Nyunpa', dir: DIR.UP, solid: true, script: STORY.nyunpa, mind: () => G.flag('nyunpa_trial') ? "The young ones are in the grotto. The poles will know them." : "Mmmm... Who is that? Who speaks to my mind?", onMind: STORY.nyunpaMind }] });

// ---- the grotto ----
const FC_LEGEND = { '.': 'cave_sand', 'p': 'cave_pebbles', '~': 'water', 'H': 'cave_hidden', 'o': 'post_water', 'D': 'cave_sand', 'S': { ground: 'cave_sand', obj: 'stairs', walk: true }, 'u': 'stonefloor' };
const FC_ENC = [['Bone Fighter'], ['Dirge'], ['Mole', 'Mole'], ['Spirit'], ['Mole', 'Bone Fighter']];
function fcRoom(id, rows, opts) {
  defineMap(id, Object.assign({ name: 'Fuchin Falls Cave', w: rows[0].length, h: rows.length, base: 'mosscliff_mid', music: 'dungeon', bg: 'cave', indoor: true, enc: FC_ENC, retreat: { map: 'fuchin', x: 16, y: 26, dir: DIR.DOWN },
    build(M) { M.paint(0, 0, rows, FC_LEGEND, opts.dark ? { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' } : { cliff: 'k', set: 'mosscliff', faces: 2 }); opts.build(M); } }, opts.def || {}));
}
function fcDoor(M, x, y, to, tx, ty, dir, extra) { M.set(x, y, 'cave_sand'); M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.UP : dir, Object.assign({ door: true }, extra || {})); }
function fcPole(M, x, y, horiz, id) { M.object('log', x, y, { id, horiz, len: 3, afloat: true }); }
function fcTorches(M, list) { for (const [x, y] of list) { M.setObj(x, y, 'torch'); M.light(x, y, 4); } }
const fcGrid = lhGrid;

// the first cavern: the pool with a pole at either end of its bank - the right one to the Mimic's ledge and the way
// on east, the left one to the way west
const FC1 = [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkk......kk',
  'kD..kkkkkkkkkkkk......Dk',
  'kk..kkkk~~~~kkkk......kk',
  'kk~~~~~~~~~~~~~~~~~~~kkk',
  'kk~~~~~~~~~~~~~~~~~~~~kk',
  'k~~~~~~~~~~~~~~~~~~~~~kk',
  'k~~~~~~~kkk~~~~~~~~~~~kk',
  'kk~~~~~~kkk~~~~~~~~~~~kk',
  'kk~~~~~~~~~~~~~~~~~~~~kk',
  'kk~~~~~~~~~~~~~~~~~~~kkk',
  'kk~~~~~~~~~~~~~~~~~~~~kk',
  'kk......~~~~~.........kk',
  'kk...................kkk',
  'kk....................kk',
  'kkkkkkkkkkkDkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
];
fcRoom('fuchin_cave_1', FC1, { def: { entry: { x: 11, y: 15 } }, build(M) {
  fcDoor(M, 11, 16, 'fuchin', 10, 23, DIR.DOWN); fcDoor(M, 1, 3, 'fuchin_cave_2', 19, 17, DIR.UP); fcDoor(M, 22, 3, 'fuchin_cave_5', 3, 17, DIR.UP);
  fcPole(M, 3, 10, false, 'fc1_left'); fcPole(M, 18, 10, false, 'fc1_right');
  M.chest(19, 3, 'Game Ticket', 1, { mimic: 'Mimic #2' });
  M.sign(5, 14, "'The poles of the pool bear the still of heart. Stand upon one and walk toward the far shore, and it will carry you.'");
  fcTorches(M, [[8, 4], [13, 4]]);
} });
// the second cavern, west: two poles up the pool, one to the Arctic Blade's ledge, one to the way up to the dragon
const FC2 = [
  'kkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkDkkkkkkkkk',
  'kk....kkk.........kkkk',
  'kk....kk...........kkk',
  'kk...kkk..........kkkk',
  'kk~~~~~~~~~~~~~~~~~kkk',
  'k~~~~~~~~~~~~~~~~~~~kk',
  'k~~~~~~~~~~~~~~~~~~~kk',
  'kk~~~~~~~kk~~~~~~~~~kk',
  'kk~~~~~~kkk~~~~~~~~~kk',
  'kk~~~~~~~~~~~~~~~~~~kk',
  'k~~~~~~~~~~~~~~~~~~~kk',
  'k~~~~~~~~~~~~~~~~~~~kk',
  'kk~~~~~~~~~~~~~~~~~~kk',
  'kk~~~~~~~~~~~~~~~~~~kk',
  'kk.....~~~~~........kk',
  'kk..................kk',
  'kk...................k',
  'kkkkkkkkkkkkkkkkkkkDkk',
  'kkkkkkkkkkkkkkkkkkkkkk',
];
fcRoom('fuchin_cave_2', FC2, { def: { entry: { x: 19, y: 17 } }, build(M) {
  fcDoor(M, 19, 18, 'fuchin_cave_1', 2, 3, DIR.DOWN); fcDoor(M, 12, 1, 'fuchin_cave_3', 12, 16, DIR.UP);
  fcPole(M, 14, 12, false, 'fc2_a'); fcPole(M, 3, 12, false, 'fc2_b');
  M.chest(3, 3, 'Arctic Blade', 1);
  fcTorches(M, [[6, 1], [18, 1]]);
} });
// the dragon's cavern: the statue with the empty socket on the west bank, the Orb of Force on the isle east, and the
// path under the water between them that the dragon's eye shows
const FC3 = [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkuuu~~~~~~~~~~~~uuuuukk',
  'kkuuuHHHHHHHHHHHHuuuuukk',
  'kkuu~~~~~~~~~~~~~~uuuukk',
  'kkuu~~~~~~~~~~~~~~~~kkkk',
  'kkuu~~~~~~~~~~~~~~~~~kkk',
  'kkuuu~~~~~~~~~~~~~~~~~kk',
  'kkuu~~~~~~kk~~~~~~~~~~kk',
  'kkuu~~~~~~kk~~~~~~~~~~kk',
  'kkuu~~~~~~~~~~~~~~~~~kkk',
  'kkuu~~~~~~~~~~~~~~~~~~kk',
  'kkuuuuuuu~~~~uuuuuuuuukk',
  'kkuuuuuuuuuuuuuuuuuuuukk',
  'kuuuuuuuuuuuuuuuuuuuuukk',
  'kkuuuuuuuuuuuuuuuuuuukkk',
  'kkuuuuuuuuuuuuuuuuuuuukk',
  'kkkkkkkkkkkkDkkkkkkkkkkk',
];
fcRoom('fuchin_cave_3', FC3, { dark: true, def: { entry: { x: 12, y: 16 }, enc: [] }, build(M) {
  fcDoor(M, 12, 17, 'fuchin_cave_2', 12, 2, DIR.DOWN);
  const eye = G.flag('fuchin_dragon_eye');
  M.setObj(3, 2, eye ? 'dragon_statue_eye' : 'dragon_statue'); M.object('relief', 3, 2, { id: 'fuchin_dragon', script: STORY.fuchinDragon });
  if (eye) for (let x = 5; x <= 16; x++) { M.set(x, 3, 'cave_shown'); M.walkable(x, 3); }
  M.chest(20, 3, 'Orb of Force', 1);
  M.sign(18, 3, "'Ki is the force that moves without moving. He who walks where there is no path has found it. Take the orb, and carry it in the hand, not the pack.'");
  M.sign(2, 11, "'The dragon sees for those who give it sight.'");
  fcTorches(M, [[6, 12], [17, 12], [2, 5], [2, 9]]);
} });
// the cavern east: Zephyr on the pebbled ledge across the pool, and the pole up to the room of the eye
const FC5 = [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkDkkkkkkkkkkk',
  'kkkkkkkk.........kkkkkkk',
  'kkkkkkk...........kkkkkk',
  'kkkkkkkk.........kkkkkkk',
  'kk..~~~~~~~~~~~~~~~~~kkk',
  'kk..~~~~~~~~~~~~~~~~~~kk',
  'kk..~~~~~~~~~~~~~~~~~~kk',
  'kk..~~~~~~~~~~~~~~~pppkk',
  'kk..~~~~~~~~~~~~~~~pppkk',
  'kk..~~~~~~~~~~~~~~~pppkk',
  'kk..~~~~kkk~~~~~~~~~~kkk',
  'kk..~~~~kkk~~~~~~~~~~~kk',
  'kk..~~~~~~~~~~~~~~~~~~kk',
  'kk..~~~~~~~~~~~~~~~~~~kk',
  'kk....~~~~~~...........k',
  'kk.....................k',
  'kk....................kk',
  'kkDkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
];
fcRoom('fuchin_cave_5', FC5, { def: { entry: { x: 3, y: 17 } }, build(M) {
  fcDoor(M, 2, 18, 'fuchin_cave_1', 21, 3, DIR.DOWN); fcDoor(M, 12, 1, 'fuchin_cave_6', 7, 8, DIR.UP);
  fcPole(M, 4, 9, true, 'fc5_v'); fcPole(M, 12, 12, false, 'fc5_h');
  M.djinni('Zephyr', 20, 9, { fight: true });
  fcTorches(M, [[6, 4], [17, 4]]);
} });
// the room of the eye: the dragon's eye lies on a little table, as if set down by someone who meant to come back
const FC6 = fcGrid(14, 12, (set) => { set(2, 2, 11, 8, '.'); set(7, 9, 7, 9, 'D'); set(6, 4, 8, 4, 'p'); });
fcRoom('fuchin_cave_6', FC6, { def: { entry: { x: 7, y: 8 }, enc: [] }, build(M) {
  fcDoor(M, 7, 9, 'fuchin_cave_5', 12, 2, DIR.DOWN);
  M.container(7, 4, 'table', "Dragon's Eye", 1);
  M.sign(4, 4, "'What the dragon lost, the dragon wants back.'");
  fcTorches(M, [[3, 1], [10, 1]]);
} });
