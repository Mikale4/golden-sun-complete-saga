// Suhalla, traced from its rip (map references/golden-sun-suhalla-gba-map.webp): a handful of adobe and sand-brick houses
// on the sand between the purple rock streams, the cobbled lane down to the desert gate, jars and crates stacked at
// the doors. The inn (A) with its annex, the store (B), the item shop (C), and the two houses D and E.
'use strict';
const SU_ROWS = [
  '.........T...v........T.',   // 0
  '.C.......T..............',   // 1   the Hard Nut
  '...................PP...',   // 2
  '..................PP....',   // 3
  '...........PP......PP.T.',   // 4
  '...........PP......PP...',   // 5
  '...........PP......PP...',   // 6
  '.j.........PP......PP...',   // 7
  '.j.....A...PPPP..PPPPPP.',   // 8   A: the inn's door
  '.x.x.j.....PPPP..PPPPPPP',   // 9
  'pppppppppppp............',   // 10  the cobbled lane
  'pppppppppppp..........PP',   // 11
  '........ppp...........PP',   // 12
  '........ppp...........PP',   // 13
  '........ppp...........PP',   // 14
  '........ppp...........PP',   // 15
  '........ppp...........PP',   // 16
  '.jjx....ppp...........PP',   // 17
  '.jjx....ppp...v.......PP',   // 18
  '.j.j....ppp...........PP',   // 19
  '.......P....P.........PP',   // 20  the way out under the rocks
  'PPPPPPPP....PPPPPPPPPPPP',   // 21
  'PPPPPPPP....PPPPPPPPPPPP',   // 22
  '........................',   // 23
];
const SU_LEGEND = {
  '.': 'sand', 'p': 'cobble', 'T': { ground: 'sand', obj: 'palm' }, 'v': { ground: 'sand', obj: 'desert_shrub' },
  'j': { ground: 'sand', obj: 'pot' }, 'x': { ground: 'sand', obj: 'crate' }, 'C': 'sand', 'A': 'sand',
};
const SU_ADOBE = { wall: 'wall_adobe', doorTile: 'door_adobe', windows: false };
const SU_BRICK = { wall: 'wall_sandbrick', doorTile: 'door_adobe', windows: false };
defineMap('suhalla', {
  name: 'Suhalla', w: 24, h: 24, base: 'sand', music: 'desert', bg: 'sand', entry: { x: 9, y: 22 },
  build(M) {
    M.paint(0, 0, SU_ROWS, SU_LEGEND, { cliff: 'P', set: 'purplerock', faces: 2 });
    M.house(2, 2, 5, 7, 'roof_adobe', Object.assign({ door: false }, SU_ADOBE));                                                              // A, the inn
    M.house(7, 4, 3, 4, 'roof_grey', Object.assign({ doorX: 1, to: 'suhalla_inn', tx: 7, ty: 8, sign: 'inn_sign' }, SU_ADOBE));               // its annex, with the door
    M.house(14, 2, 4, 5, 'roof_sandbrick', Object.assign({ doorX: 2, to: 'suhalla_store', tx: 6, ty: 8 }, SU_BRICK));                          // B, the store
    M.house(1, 12, 6, 5, 'roof_adobe', Object.assign({ doorX: 4, to: 'suhalla_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }, SU_ADOBE));         // C, the item shop
    M.house(11, 11, 5, 5, 'roof_adobe', Object.assign({ doorX: 2, to: 'suhalla_house1', tx: 6, ty: 8 }, SU_ADOBE));                             // D
    M.house(15, 12, 6, 5, 'roof_sandbrick', Object.assign({ doorX: 3, to: 'suhalla_house2', tx: 6, ty: 8 }, SU_BRICK));                         // E
    M.exit(8, 23, 4, 1, 'world_gs1', 22, 55, DIR.DOWN);
    M.npc('suhalla_m1', 15, 9, { type: 'elder_m', text: "The Suhalla Desert to the south is deadly. Sandstorms and tornado lizards... Only a fool crosses it." });
    M.npc('suhalla_f1', 6, 10, { type: 'villager_f', move: 'wander', text: "Two strange travelers with a girl and an old man passed through recently. They headed into the desert!" });
    M.npc('suhalla_girl', 11, 12, { type: 'child_f', move: 'wander', text: "The purple rocks are soft! You can scratch your name in them. Don't tell my mom." });
    M.npc('suhalla_old', 4, 18, { type: 'elder_m', text: "Beyond the desert lies Lalivero, and the Venus Lighthouse. Lord Babi has been building a tower there." });
    M.npc('suhalla_w2', 7, 18, { type: 'villager_f', text: "Water is dearer than gold here. The item shop sells it by the jar." });
    M.npc('suhalla_trav', 18, 18, { type: 'monk', name: 'Traveler', text: "I came up through the desert. The winds there... they carry you off if you stand in them. Keep moving, and keep to the rocks." });
  }
});
Kit.inn('suhalla_inn', { name: 'Suhalla Inn', price: 60, back: { map: 'suhalla', x: 8, y: 8 } });
Kit.shop('suhalla_itemshop', { name: 'Suhalla Item Shop', shop: 'suhalla_item', back: { map: 'suhalla', x: 5, y: 17 } });
Kit.home('suhalla_store', { back: { map: 'suhalla', x: 16, y: 7 }, furn: [['barrel', 2, 2], ['barrel', 3, 2], ['crate', 8, 2], ['crate', 8, 3]], npcs: [{ id: 'su_store', x: 5, y: 4, type: 'villager_m', text: "Grain from Tolbi, cloth from Kalay... all of it comes down the passage now that Lord Babi's gate is open." }] });
Kit.home('suhalla_house1', { back: { map: 'suhalla', x: 13, y: 16 }, chests: [[9, 3, 'Vial', 2]] });
Kit.home('suhalla_house2', { back: { map: 'suhalla', x: 18, y: 17 }, npcs: [{ id: 'sh2', x: 5, y: 5, type: 'villager_m', text: "Suhalla Gate blocks the way to Lalivero. Only those with Lord Babi's permission may pass." }] });
