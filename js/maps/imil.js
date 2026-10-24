// ---------- Imil ----------
// The snowbound village on the frozen river, from the reference rip (IMIL_LAYOUT, tools/town_gen.py imil): the ice
// runs the length of the town under the wooden bridge, the rocks on it stop a slide, the frozen falls at its head
// hide the cave where the Mars Djinni Fever waits, the homes stand on the banks, the smithy and the item shop are cut
// into the east cliff, the sanctum's gate stands over the graves in the south-west. Mia, the village's healer,
// is found tending the old man in the first house from the south.
'use strict';

const IMIL_LEGEND = { '.': 'snow', ':': 'snow', '~': 'ice', 'B': { ground: 'snow', obj: 'bridge', walk: true }, 'D': 'snow' };
defineMap('imil', {
  name: 'Imil', w: 32, h: 32, base: 'snow', music: 'snow', bg: 'snow', entry: { x: 17, y: 30 },
  build(M) {
    const L = IMIL_LAYOUT.town;
    M.paint(0, 0, L.rows, IMIL_LEGEND, { set: 'snowcliff', faces: 2 }); M.plankBridge(0, 0, L.rows, 'B');
    for (const [x, y] of L.trees) { M.setObj(x, y, 'pinesnow'); M.setObj(x + 1, y, 'pinesnow'); M.setObj(x, y - 1, 'pinesnow'); M.setObj(x + 1, y - 1, 'pinesnow'); }
    for (const [x, y] of L.rocks) M.setObj(x, y, 'rock_snow');
    for (const [x, y] of L.icerocks) M.setObj(x, y, 'rock_ice');
    for (const [x, y] of L.fences) M.setObj(x, y, 'fence_snow');
    // the homes, by the rip's letters: snow-heaped roofs on dark timber
    const house = (letter, opts) => { const h0 = L.houses.find(h => h.letter === letter); const grow = opts && opts.wall ? 0 : Math.max(0, 4 - h0.h); const h = Object.assign({}, h0, { h: h0.h + grow, y: h0.y - grow }); return M.house(h.x, h.y, h.w, h.h, 'roof_snow', Object.assign({ doorX: h.doorX, wall: 'wall_timber', doorTile: 'door_timber', tx: 6, ty: 8 }, opts)); };
    house('A', { to: 'imil_mia_house', chimney: true });                                   // the old couple's, where Mia is found
    house('B', { to: 'imil_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true });        // the inn
    house('F', { to: 'imil_house_f', windows: false });                                   // the home on the upper level
    // the sanctum's gate: a timber arch over the graves' path
    house('G', { to: 'imil_sanctum', tx: 6, ty: 8, windows: false, wall: 'palisade_face', doorTile: 'palisade_gate' });
    // the shops cut into the east cliff
    const cliffDoor = (x, y, to, tx, ty, sign) => { M.setObj(x, y, 'door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true }); if (sign) M.setObj(x - 1, y, sign); };
    cliffDoor(23, 11, 'imil_weaponshop', 6, 6, 'weapon_sign'); cliffDoor(28, 14, 'imil_itemshop', 6, 6, 'shop_sign');
    // the frozen falls at the head of the river, and the cave mouth behind them
    M.setObj(13, 3, 'door_cave'); M.setObj(14, 3, 'ice_fall'); M.walkable(13, 3); M.exit(13, 3, 1, 1, 'imil_falls_cave', 8, 13, DIR.UP, { door: true });
    for (const [x, y] of [[13, 1], [14, 1], [13, 2], [14, 2]]) M.setObj(x, y, 'ice_fall');
    // the snowman on the east bank: Move slides it onto the ice, where it stops the last slide short of the falls
    M.object('statue_move', 16, 4, { id: 'imil_snowman', tile: 'snowman' });
    // the graves, one of them with a Lucky Medal under its snow
    for (const [x, y] of [[7, 24], [9, 24], [7, 26], [9, 26]]) M.setObj(x, y, 'gravestone');
    M.container(9, 24, 'gravestone'); M.container(7, 26, 'gravestone'); M.container(9, 26, 'gravestone');
    M.chest(21, 16, 'Vial', 1);
    M.exit(16, 31, 3, 1, 'world_gs1', 68, 7, DIR.DOWN);
    // the townsfolk, sick and well
    M.npc('imil_sick1', 21, 27, { type: 'villager_m', text: () => G.flag('mercury_lit') ? "The sickness is gone! Mia's healing... and something about the Lighthouse... we're saved!" : "*cough* A terrible sickness has spread through Imil. Only Mia's healing keeps us alive.", mind: "Travelers came up from the south a month ago. The coughing started the week after." });
    M.npc('imil_f1', 17, 19, { type: 'villager_f', move: 'wander', text: () => G.flag('mia_joined') || G.flag('mia_left_for_lh') ? "Mia ran off toward the Lighthouse, white as the snow. What could have frightened her so?" : "Mia is the last of the Mercury Clan. She guards the Lighthouse's secrets... and she's the only healer we have." });
    M.npc('imil_kid', 8, 17, { type: 'child_f', move: 'wander', text: "It's always snowing here! I love it! You can slide all the way down the river if you don't hit the rocks." });
    M.npc('imil_old', 29, 8, { type: 'elder_m', text: "The Mercury Lighthouse must never be lit. That is the sacred law of the Mercury Clan.", mind: "Alex... that boy always looked at the Lighthouse the way other boys look at girls." });
    M.npc('imil_m2', 4, 12, { type: 'villager_m', move: 'wander', text: "Mia's tending the old couple in the first house up from the south. Poor Grandpa Hanan has had that cough for weeks." });
    M.npc('imil_w2', 25, 26, { type: 'villager_f', text: "The item shop and the smithy are dug into the cliff over there, so the snow doesn't bury them." });
    M.trigger(10, 29, 14, 1, STORY.imilArrive, { once: 'imil_arrived' });
  }
});

// ---- the homes and shops ----
Kit.home('imil_mia_house', { name: 'House', back: { map: 'imil', x: 19, y: 26 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bed', 9, 2], ['bed_foot', 9, 3], ['table', 5, 5], ['chair', 4, 5], ['fireplace', 6, 1], ['shelf', 3, 2], ['pot', 10, 7]],
  npcs: [{ id: 'imil_grandpa', x: 1, y: 4, type: 'elder_m', name: 'Old Man', text: () => G.flag('mia_left_for_lh') ? "Cough... I feel much better, thanks to Mia. Where did she run off to?" : "Cough... cough..." },
         { id: 'imil_grandma', x: 8, y: 6, type: 'elder_f', name: 'Old Woman', text: () => G.flag('mia_left_for_lh') ? "Thank you, Mia... I can't imagine how this village would ever manage without her." : "He's been coughing for quite a while now... Mia comes when she can." },
         { id: 'MiaNPC', x: 2, y: 5, look: CHARACTERS.Mia.look, name: 'Mia', dir: DIR.LEFT, hideIf: 'mia_left_for_lh', cond: () => G.flag('imil_kids'), script: STORY.meetMia }],
  chests: [[9, 4, 'Empty Bottle', 1]] });
Kit.home('imil_house_f', { name: 'House', back: { map: 'imil', x: 7, y: 10 }, npcs: [{ id: 'imil_fh', x: 5, y: 5, type: 'villager_m', text: "Up here on the ledge the snow's the worst, but the view of the Lighthouse... on a clear night it used to glow blue. Lately it glows brighter." }] });
Kit.inn('imil_inn', { name: 'Imil Inn', price: 24, back: { map: 'imil', x: 26, y: 24 }, furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['bed', 11, 2], ['bed_foot', 11, 3], ['bed', 9, 2], ['bed_foot', 9, 3], ['table', 5, 6], ['chair', 4, 6], ['chair', 6, 6], ['stove', 7, 1], ['shelf', 1, 2]] });
Kit.shop('imil_itemshop', { name: 'Imil Item Shop', shop: 'imil_item', back: { map: 'imil', x: 28, y: 15 } });
Kit.shop('imil_weaponshop', { name: 'Imil Smithy', shop: 'imil_weapon', back: { map: 'imil', x: 23, y: 12 }, furn: [['counter', 3, 3], ['counter', 4, 3], ['counter', 5, 3], ['counter', 6, 3], ['counter', 7, 3], ['anvil', 2, 2], ['fireplace', 9, 1], ['barrel', 1, 5], ['crate', 10, 6]] });
Kit.sanctum('imil_sanctum', { name: 'Imil Sanctum', back: { map: 'imil', x: 4, y: 21 },
  npcs: [{ id: 'justin', x: 3, y: 6, type: 'child_m', name: 'Justin', script: STORY.imilKids }, { id: 'megan', x: 8, y: 6, type: 'child_f', name: 'Megan', script: STORY.imilKids }] });

// ---- the cave behind the frozen falls: a drift of snow, a pool of ice, and Fever ----
defineMap('imil_falls_cave', {
  name: 'Imil Falls Cave', w: 17, h: 15, base: 'void', music: 'dungeon', bg: 'cave', entry: { x: 8, y: 13 }, retreat: { map: 'imil', x: 13, y: 4, dir: DIR.DOWN },
  build(M) {
    const rows = ['kkkkkkkkkkkkkkkkk', 'kkkkkk.....kkkkkk', 'kkkk.........kkkk', 'kkk...........kkk', 'kk.....~~~.....kk', 'kk....~~~~~....kk', 'kk....~~~~~....kk', 'kk.....~~~.....kk', 'kkk...........kkk', 'kkk...........kkk', 'kkkk.........kkkk', 'kkkkk.......kkkkk', 'kkkkkk.....kkkkkk', 'kkkkkkkk.kkkkkkkk', 'kkkkkkkkkkkkkkkkk'];
    M.paint(0, 0, rows, { '.': 'caveice', '~': 'ice' }, { cliff: 'k', set: 'cavern', top: 'cavewalltopice', face: 'cavewallice', mid: 'cavewalltopice' });
    M.exit(8, 13, 1, 1, 'imil', 13, 4, DIR.DOWN, { door: true });
    M.djinni('Fever', 8, 2, { fight: false });
    for (const [x, y] of [[3, 3], [13, 3], [4, 10], [12, 10]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
  }
});
