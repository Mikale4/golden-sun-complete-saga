// Lalivero, traced from its rip (map references/golden-sun-lalivero-gba-map.webp): the walled town of sand brick at the
// desert's southern edge - the inn (A) and its annex (C), the D/F house, the gate tower (H), the I/J house with its
// annex K, the L house, the reservoir (N) under the west wall, the golden obelisk on its purple rock, the south gate.
'use strict';
const LA_ROWS = [
  'PP..............................',   // 0
  'PPP.YYYYYYYYYYYYYYYYYYYYYYYYYYY.',   // 1   the town wall
  'PP..YYYYYYYYYYYYYYYYYYYYYYYYYYY.',   // 2
  '.pppp.........................Y.',   // 3
  '.pp...........j...............Y.',   // 4
  '.pp..........j.........v......Y.',   // 5
  '.pp...........................Y.',   // 6
  '.pp...........................Y.',   // 7
  '.pp.......................ppppY.',   // 8
  '.pp...........................Y.',   // 9
  '.pp......ppppppp..............Y.',   // 10
  '.pp......ppppppp..............Y.',   // 11
  'PP.......pppppppp.............Y.',   // 12
  'PPPPPPPPP...PPPpPPP...........Y.',   // 13
  'PPPPPPPPP...PPPpPPP...........Y.',   // 14
  'PP.......T..PP.p.PP..........vY.',   // 15
  'PY.......v..PP.p.PP..T........Y.',   // 16
  '.Y.............p..............Y.',   // 17
  '.Y.............p..............Y.',   // 18
  '.Y.........YYYYpYYYYY.........Y.',   // 19  the gate-house
  '.Y.........YYYYpYYYYY.........Y.',   // 20
  '.Y.........YYYYpYYYYYYYYYYYYYYY.',   // 21
  '.YYYYYYYYYYYYYYpYYYYYYYYYYYYYYY.',   // 22
  '.YYYYYYYYYYYYYYpYYYYYYYYYYYYYYY.',   // 23
  '...............p....T....v......',   // 24
  '.T.............p..........C.....',   // 25
  '.........T.....p................',   // 26
  'PPPP...........p.........PPPPPPP',   // 27
];
const LA_LEGEND = {
  '.': 'sand', 'p': 'cobble', 'Y': { ground: 'sand', obj: 'wall_sandbrick' }, 'T': { ground: 'sand', obj: 'palm' }, 'v': { ground: 'sand', obj: 'desert_shrub' },
  'j': { ground: 'sand', obj: 'pot' }, 'C': 'sand',
};
const LA_ADOBE = { wall: 'wall_adobe', doorTile: 'door_adobe', windows: false };
const LA_BRICK = { wall: 'wall_sandbrick', doorTile: 'door_adobe', windows: false };
defineMap('lalivero', {
  name: 'Lalivero', w: 32, h: 28, base: 'sand', music: 'desert', bg: 'sand', entry: { x: 15, y: 26 },
  build(M) {
    M.paint(0, 0, LA_ROWS, LA_LEGEND, { cliff: 'P', set: 'purplerock', faces: 2 });
    M.house(0, 6, 6, 5, 'roof_sandbrick', Object.assign({ doorX: 4, to: 'lalivero_reservoir', tx: 8, ty: 12 }, LA_BRICK));                          // N, the reservoir
    M.house(7, 3, 7, 7, 'roof_adobe', Object.assign({ doorX: 5, to: 'lalivero_inn', tx: 7, ty: 8, sign: 'inn_sign' }, LA_ADOBE));                       // A, the inn
    M.house(7, 10, 3, 3, 'roof_adobe', Object.assign({ doorX: 2, to: 'lalivero_house1', tx: 6, ty: 8 }, LA_ADOBE));                                    // C, its annex
    M.house(17, 3, 7, 7, 'roof_adobe', Object.assign({ doorX: 1, to: 'lalivero_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }, LA_ADOBE));               // D
    M.setObj(22, 9, 'door_adobe'); M.walkable(22, 9); M.exit(22, 9, 1, 1, 'lalivero_house2', 6, 8, DIR.UP, { door: true });                            // F, the second door
    M.house(25, 2, 5, 7, 'roof_sandbrick', Object.assign({ doorX: 1, to: 'lalivero_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign' }, LA_BRICK));       // H, the gate tower
    M.house(21, 11, 8, 6, 'roof_adobe', Object.assign({ doorX: 1, to: 'lalivero_faran', tx: 6, ty: 8 }, LA_ADOBE));                                    // I, Faran's house
    M.setObj(26, 16, 'door_adobe'); M.walkable(26, 16); M.exit(26, 16, 1, 1, 'lalivero_sanctum', 6, 8, DIR.UP, { door: true }); M.setObj(25, 16, 'sanctum_sign');   // J
    M.house(25, 17, 4, 3, 'roof_sandbrick', Object.assign({ doorX: 2, to: 'lalivero_house_k', tx: 6, ty: 8 }, LA_BRICK));                              // K
    M.house(1, 15, 7, 5, 'roof_sandbrick', Object.assign({ doorX: 3, to: 'lalivero_house_l', tx: 6, ty: 8 }, LA_BRICK));                               // L
    M.setObj(15, 10, 'obelisk_top'); M.setObj(15, 11, 'obelisk');
    M.exit(15, 27, 1, 1, 'world_gs1', 34, 63, DIR.DOWN);
    M.setObj(30, 16, null); M.setObj(30, 17, null); M.walkable(30, 16, 1, 2); M.exit(31, 16, 1, 2, 'world_gs1', 38, 62, DIR.RIGHT);
    M.chest(16, 3, 'Water of Life', 1); M.chest(26, 25, "Warrior's Helm", 1);
    M.djinni('Torch', 12, 4, { fight: true });
    M.npc('lal_m1', 10, 12, { type: 'villager_m', move: 'wander', text: () => G.flag('sheba_kidnapped') ? "Sheba was taken! Those Proxians took her to the Venus Lighthouse!" : "Lord Babi's men are building a tower near the Venus Lighthouse. They call it Babi Lighthouse." });
    M.npc('lal_f1', 18, 18, { type: 'villager_f', move: 'wander', text: "Sheba fell from the sky when she was a baby. Faran raised her as his own. She is the treasure of Lalivero." });
    M.npc('lal_kid', 12, 17, { type: 'child_f', move: 'wander', text: "Sheba can hear what people are thinking! It's kinda scary but she's really nice." });
    M.npc('lal_worker', 4, 12, { type: 'villager_m', name: 'Laborer', text: "Babi's soldiers forced us to work on his tower. Then those red-haired strangers came..." });
    M.npc('lal_old', 24, 10, { type: 'elder_m', text: "The obelisk marks where Sheba came down from the sky. Faran will tell you it was a star. I say it was a bird's egg. A big bird." });
    M.npc('lal_guard', 16, 24, { type: 'guard', name: 'Gate Guard', dir: DIR.DOWN, text: "Lalivero. Keep to the road south - the Venus Lighthouse is no place for travelers now." });
  }
});
Kit.interior('lalivero_faran', { name: "Faran's House", w: 12, h: 10, back: { map: 'lalivero', x: 22, y: 17 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bookshelf', 9, 2], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4]],
  npcs: [{ id: 'Faran', x: 6, y: 3, look: NPC_LOOKS.Faran, name: 'Faran', script: STORY.faran }] });
Kit.inn('lalivero_inn', { name: 'Lalivero Inn', price: 80, back: { map: 'lalivero', x: 12, y: 10 } });
Kit.shop('lalivero_itemshop', { name: 'Lalivero Item Shop', shop: 'lalivero_item', back: { map: 'lalivero', x: 18, y: 10 } });
Kit.shop('lalivero_weaponshop', { name: 'Lalivero Armory', shop: 'lalivero_weapon', back: { map: 'lalivero', x: 26, y: 9 } });
Kit.sanctum('lalivero_sanctum', { name: 'Lalivero Sanctum', back: { map: 'lalivero', x: 26, y: 17 } });
Kit.home('lalivero_house1', { back: { map: 'lalivero', x: 9, y: 13 }, npcs: [{ id: 'lal_h1', x: 5, y: 5, type: 'villager_f', text: "The inn's full of Babi's soldiers. We rent this room to the ones who snore least." }] });
Kit.home('lalivero_house2', { back: { map: 'lalivero', x: 22, y: 10 }, npcs: [{ id: 'lal_h2', x: 5, y: 5, type: 'villager_m', text: "Antidotes. Keep some. The scorpions here don't care who you are." }], build(M) { M.container(9, 3, 'pot', 'Antidote', 1); } });
Kit.home('lalivero_house_k', { back: { map: 'lalivero', x: 27, y: 20 }, build(M) { M.container(9, 3, 'pot', 'Lucky Medal', 1); } });
Kit.home('lalivero_house_l', { back: { map: 'lalivero', x: 4, y: 20 }, npcs: [{ id: 'lal_hl', x: 4, y: 5, type: 'elder_f', text: "When Sheba was small she would sit by the obelisk and listen. To what, she never said." }] });
// the town's water: a cistern under the west wall, a plank walk out over it to the chest the guards forgot
defineMap('lalivero_reservoir', {
  name: 'Lalivero', w: 17, h: 14, base: 'void', indoor: true, music: 'town', bg: 'grass', entry: { x: 8, y: 12 },
  build(M) {
    M.room(0, 0, 17, 14, 'floor_stone', 'wall_in_stone');
    M.fill(1, 2, 15, 9, 'water'); for (let y = 2; y <= 10; y++) M.set(8, y, 'bridge_v'); M.fill(1, 11, 15, 2, 'floor_stone');
    M.setObj(8, 13, null); M.set(8, 13, 'floor_stone'); M.walkable(8, 13); M.exit(8, 13, 1, 1, 'lalivero', 4, 11, DIR.DOWN, { door: true });
    M.chest(1, 11, 'Lucky Medal', 1); M.setObj(2, 11, 'barrel');   /* in the corner by the barrels: the head of the bridge is Babi's workshop door now (class_trials_gs1) */ M.setObj(3, 11, 'barrel'); M.setObj(14, 11, 'crate');
  }
});
