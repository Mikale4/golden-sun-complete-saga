// ---------- Altin Peak ----------
// The mine under the village, after the rip's galleries: three caverns joined by rails and ladders, each half
// drowned by the water a Living Statue spews until the statue is stopped, and at the bottom the Hydros Statue that
// is the source of it all. The first statue gives up the Frost Jewel; Spritz sleeps on a ledge in the entrance
// gallery; the Lifting Gem waits in the purple-floored chamber off the deep gallery, along with the mine's chests.
'use strict';

const AM_LEGEND = {
  '.': 'cave', 'p': 'cave_pebbles', '~': 'water', 'u': 'stonefloor', 'k': 'cavewalltop',
  'S': { ground: 'cave', obj: 'stairs', walk: true }, 'D': 'cave',
  'L': { ground: 'cave', obj: 'ladder', walk: true },
  '-': { ground: 'cave', obj: 'rail_h', walk: true }, '|': { ground: 'cave', obj: 'rail_v', walk: true },
  '1': { ground: 'cave', obj: 'rail_sw', walk: true }, '2': { ground: 'cave', obj: 'rail_se', walk: true }, '3': { ground: 'cave', obj: 'rail_nw', walk: true }, '4': { ground: 'cave', obj: 'rail_ne', walk: true },
  '<': { ground: 'cave', obj: 'rail_end_w', walk: true }, '>': { ground: 'cave', obj: 'rail_end_e', walk: true }, '^': { ground: 'cave', obj: 'rail_end_n', walk: true },
  'o': { ground: 'cave', obj: 'rock_small' }, 'T': { ground: 'cave', obj: 'torch' }, 'c': { ground: 'cave', obj: 'cart' },
};
const AM_ENC = [['Living Statue'], ['Slime Beast', 'Slime Beast'], ['Tarantula'], ['Calamar'], ['Bone Fighter'], ['Dirge'], ['Rat Fighter', 'Rat Fighter']];
const AM_RETREAT = { map: 'altin', x: 16, y: 11, dir: DIR.DOWN };
function amRoom(id, name, rows, opts) {
  defineMap(id, Object.assign({ name, w: rows[0].length, h: rows.length, base: 'cavewalltop', music: 'dungeon', bg: 'altin_peak', indoor: true, enc: AM_ENC, retreat: AM_RETREAT,
    build(M) { M.paint(0, 0, rows, AM_LEGEND, { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' }); for (const [x, y] of opts.torches || []) M.light(x, y, 4); opts.build(M); } }, opts.def || {}));
}
function amDoor(M, x, y, to, tx, ty, dir, extra) { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir === undefined ? DIR.UP : dir, Object.assign({ door: true }, extra || {})); }
// a Living Statue on its ledge: spoken to, it wakes and fights; beaten, its water stops and a flag opens the way on
function amStatue(M, x, y, id, flag, firstLine, wonLine, after) {
  M.object('statue', x, y, { id, script: function* (E) {
    if (G.flag(flag)) { yield E.say('The statue is silent now. Water no longer pours from its mouth.'); return; }
    yield E.say(firstLine, 'Mia');
    const r = yield* E.ambush(['Living Statue'], { canFlee: false }, { say: '(The statue grinds round on its base and comes down at the party!)' }); if (r !== 'win') return;
    G.set(flag); yield E.say(wonLine); if (after) yield* after(E);
    G.field.loadMap(G.map.id, G.field.player.tx, G.field.player.ty, G.field.player.dir, { noAutosave: true });   // the cavern is drawn again with the water gone
  } });
}
// the water a statue keeps up: laid over the floor until its flag is set
function amFlood(M, flag, cells) { if (G.flag(flag)) return; for (const [x0, y0, x1, y1] of cells) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const o = M.getObj(x, y); if (!o || /^rail|^ladder|^rock/.test(o.name)) { M.set(x, y, 'water'); M.setObj(x, y, null); } } }

// ---- the entrance gallery: the rails come in from the village, the first statue floods the floor between the
// party and the way up, Spritz waits on the ledge behind the ladder ----
const AM1 = [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkD.kkkkkkkkkkk',
  'kkkkkkkk.....kkkk.....kk',
  'kkkkTkk........kk.....kk',
  'kkk...........kkk....okk',
  'kk....o.......kkkkk|kkkk',
  'kk.....kkkk........|kkkk',
  'kk....kkkkkk.......|..kk',
  'kk...kkkkkkkk......|..kk',
  'kk...kkkkkkkk........Tkk',
  'kk...........p......kkkk',
  'kk...............o..kkkk',
  'kkk......p..........kkkk',
  'kkkk...........o...kkkkk',
  'kkkk.............kkkkkkk',
  'kkkkkkkk.^..kkkkkkkkkkkk',
  'kkkkkkkk.|..kkkkkkkkkkkk',
  'kkkkkkkkT|...kkkkkkkkkkk',
  'kkkkkkkk.|....kkkkkkkkkk',
  'kkkkkkkk.|..kkkkkkkkkkkk',
  'kkkkkkkkD|Dkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
];
amRoom('altin_mine_1', 'Altin Peak', AM1, { torches: [[4, 3], [21, 9], [8, 17]], def: { entry: { x: 9, y: 19 } }, build(M) {
  M.set(9, 20, 'cave'); M.setObj(9, 20, null); M.walkable(9, 20); M.exit(8, 20, 3, 1, 'altin', 16, 11, DIR.DOWN);   // back out to the village
  amDoor(M, 11, 1, 'altin_mine_2', 12, 22, DIR.UP, { cond: () => G.flag('altin_statue1') });
  M.trigger(11, 2, 2, 1, function* (E) { if (!G.flag('altin_statue1')) { yield E.say('Water pours down from the gallery above. The statue must be stopped first.'); yield E.move('player', DIR.DOWN, 1); } });
  amFlood(M, 'altin_statue1', [[6, 10, 19, 13]]);
  amStatue(M, 3, 3, 'ls1', 'altin_statue1', "A Living Statue! It spits water endlessly - that's what drowned the village!", 'The statue crumbles. The water level drops, and something glints in the rubble...', function* (E) { yield E.give('Frost Jewel'); yield E.say('The Frost Jewel can be equipped to grant the Frost Psynergy.'); });
  M.djinni('Spritz', 19, 3, { fight: true });
  M.chest(21, 4, 'Vial', 1); M.chest(6, 4, 'Nut', 1); M.object('crate', 12, 18, { id: 'am1_c1' });
  // the mine cart on the spur up to the ledge: the points by the foot of the rail must be thrown first, then the
  // cart runs up (and back down) at a touch; the rail itself is too steep to climb
  M.setObj(19, 4, 'rail_end_n'); M.setObj(19, 9, 'rail_v'); M.walkable(19, 4); M.walkable(19, 9); for (let y = 5; y <= 8; y++) M.block(19, y);
  const up = G.flag('am1_cart_up'); M.object('statue', 19, up ? 4 : 9, { id: 'am1_cart', tile: 'cart', script: STORY.altinCart });
  M.object('lever', 17, 9, { id: 'am1_switch', onPull: function* (E) { if (G.flag('altin_points')) { yield E.say('The points are thrown toward the ledge spur. The cart will run.'); return; } G.set('altin_points'); Audio.sfx('push'); yield E.say('The lever grinds over and the points clank across: the spur up to the ledge is open to the cart.'); } });
  M.sign(16, 10, 'ORE SPUR - throw points before running the cart. Do not ride the cart. - Foreman');
} });

// ---- the pool cavern: the second statue's water fills the middle, the stairs down are on the far side ----
const AM2 = [
  'kkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkSkkkk',
  'kkkk......kkkkkkk......kkk',
  'kkT.......kkkkk........kkk',
  'kk...oo.....kkk.......kkkk',
  'kk..........kk........kkkk',
  'kkk..........k.......kkkkk',
  'kkkk.....................k',
  'kkkk..................o..k',
  'kkkk.....................k',
  'kkkk............p........k',
  'kkkk....................kk',
  'kkkk...................kkk',
  'kkkk..................kkkk',
  'kkkk................kkkkkk',
  'kkkk..................kkkk',
  'kkkkkkk.................kk',
  'kkkkkkT.................Tk',
  'kkkkkk...........o.......k',
  'kkkkkkk.................kk',
  'kkkkkkkkk.............kkkk',
  'kkkkkkkkkkk...........kkkk',
  'kkkkkkkkkkkkD.........kkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkk',
];
amRoom('altin_mine_2', 'Altin Peak', AM2, { torches: [[2, 3], [6, 17], [24, 17]], def: { entry: { x: 12, y: 21 } }, build(M) {
  amDoor(M, 12, 22, 'altin_mine_1', 11, 2, DIR.DOWN);
  amFlood(M, 'altin_statue2', [[7, 7, 24, 14]]);
  amStatue(M, 3, 3, 'ls2', 'altin_statue2', 'Another Living Statue! The whole cavern is filling from its mouth!', 'The statue crumbles and the water drains away. Stairs lead down on the far side.');
  // the way down is not a stair but the hole the boulder makes: the sign at the top, the cracked post beside it,
  // and the ledge it holds up
  if (G.flag('altin_gap')) { M.set(21, 1, 'hole'); M.setObj(21, 1, null); M.walkable(21, 1); M.def.fall = { map: 'altin_mine_3', x: 3, y: 2 }; M.exit(21, 1, 1, 1, 'altin_mine_3', 3, 2, DIR.UP); }
  else { M.object('block', 21, 2, { id: 'am2_post', tile: 'pillar', onForce: STORY.altinBoulder, script: STORY.altinPost }); }
  M.sign(20, 2, 'DANGER - loose rock above. Do not strike the post. - Foreman');
  M.trigger(19, 2, 2, 1, function* (E) { if (!G.flag('altin_statue2')) { yield E.say('The upper gallery is under water still. The second statue must be stopped first.'); yield E.move('player', DIR.DOWN, 1); } }, { cond: () => !G.flag('altin_statue2') });
  M.chest(8, 3, 'Cookie', 1); M.chest(23, 8, 'Dragon Shield', 1); M.chest(8, 18, 'Lucky Medal', 1, { hidden: true });
  M.object('boulder', 8, 4, { id: 'am2_b1' }); M.setObj(7, 3, 'rock_small'); M.setObj(9, 3, 'rock_small'); M.setObj(8, 2, 'rock_small');   // the Cookie sits behind a boulder Lift moves, on the way back
} });

// ---- the deep gallery: the Lifting Gem's chamber off to the east, the Psy Crystal, and at the bottom the
// Hydros Statue in its pool; once it is broken the old shaft opens to the village's lowest door ----
const AM3 = [
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kkS.....kkkkkkkkkkkkkkkkkkkk',
  'kk......kkkkkkkkkkkkkkkkkkkk',
  'kkk.....kkkkkkkkkkkkkkkkkkkk',
  'kkkk.......kkkkkkkkkkkkkkkkk',
  'kkkkk........kkkkkkkkkkkkkkk',
  'kkkkkk.........kkkkkkkkkkkkk',
  'kkkkkkk.........kkkkkkkkkkkk',
  'kkkkkkk.T........kkkkkkkkkkk',
  'kkkkkkk.........kkkkkkkkkkkk',
  'kkkkkkk........kkkkkkkkkkkkk',
  'kkkkkk.......kkkkkkkkkkkkkkk',
  'kkkkk.......kkkkkkkkkkkkkkkk',
  'kkkkk.......kkkkkkkuuuuuuukk',
  'kkkkk......kkkkkkkkuuuuuuukk',
  'kkkkk......kkkkkkkkuuuuuuukk',
  'kkkkk...........kkkuuuuuuukk',
  'kkkkkT................uuuukk',
  'kkkkk.............kkkkkkkkkk',
  'kkkk...........kkkkkkkkkkkkk',
  'kkkk.........kkkkkkkkkkkkkkk',
  'kkkD..........kkkkkkkkkkkkkk',
  'kkkkk..........kkkkkkkkkkkkk',
  'kkkkkk~~~~~~~~kkkkkkkkkkkkkk',
  'kkkkkk~~~~~~~~kkkkkkkkkkkkkk',
  'kkkkkk~~~~~~~~kkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkk',
];
amRoom('altin_mine_3', 'Altin Peak', AM3, { torches: [[8, 9], [5, 18]], def: { entry: { x: 3, y: 2 } }, build(M) {
  M.setObj(2, 2, 'stairs'); M.walkable(2, 2); M.exit(2, 2, 1, 1, 'altin_mine_2', 21, 2, DIR.DOWN, { stairs: true });
  amDoor(M, 3, 22, 'altin', 1, 24, DIR.LEFT, { cond: () => G.flag('altin_drained') });                              // the old shaft to the village's lowest door
  M.trigger(4, 22, 1, 1, function* (E) { if (!G.flag('altin_drained')) { yield E.say('The shaft beyond is flooded to the roof.'); yield E.move('player', DIR.RIGHT, 1); } });
  // the Lifting Gem chamber: the purple floor and the chest on its dais
  for (let y = 14; y <= 18; y++) for (let x = 19; x <= 25; x++) if (M.get(x, y).name === 'stonefloor') M.set(x, y, 'lh_floor');
  M.chest(22, 15, 'Lifting Gem', 1); M.chest(25, 17, 'Psy Crystal', 1);
  M.chest(8, 6, 'Vial', 1);
  // the round brown boulders only Lift moves: one shuts the crevice with the Vial, one sits in the way out to the village
  M.object('boulder', 8, 7, { id: 'am3_b1' }); M.setObj(7, 6, 'rock_small'); M.setObj(9, 6, 'rock_small'); M.setObj(8, 5, 'rock_small'); M.object('boulder', 4, 22, { id: 'am3_b2' });
  if (!G.flag('hydros_done')) M.object('statue', 10, 23, { id: 'hydros', script: function* (E) { yield* STORY.hydrosStatue(E); if (G.flag('altin_drained')) { G.set('hydros_done'); G.field.loadMap(G.map.id, G.field.player.tx, G.field.player.ty, G.field.player.dir, { noAutosave: true }); } } });
  if (G.flag('hydros_done')) for (let y = 24; y <= 26; y++) for (let x = 6; x <= 13; x++) M.set(x, y, 'cave');   // the pool drains once the statue is broken
} });
