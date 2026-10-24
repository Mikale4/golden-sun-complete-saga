// ---------- Golden Sun towns ----------
'use strict';
// Vale lives in vale.js
// ======================= VAULT =======================
// Vault, from the reference rip (VAULT_LAYOUT, tools/town_gen.py vault): the mayor's house up on the north ledge
// with the watchtower and its bell beside it, the inn and the homes on the terrace below, the sanctum, the jail and
// the two shops cut into the cliff faces, the graveyard, the rope bridge east over the gully, and the way out south
const VAULT_LEGEND = Object.assign({}, VALE_LEGEND, { 'B': { ground: 'chasm', obj: 'rope_bridge', walk: true }, '~': 'chasm', 'D': { obj: 'door' } });
defineMap('vault', {
  name: 'Vault', w: 32, h: 32, base: 'grass', music: 'town', bg: 'grass', entry: { x: 25, y: 30 },
  build(M) {
    const L = VAULT_LAYOUT.town;
    M.paint(0, 0, L.rows, VAULT_LEGEND, { set: 'cliff', faces: 2 });
    // Sap waits at the end of Vault Cave (js/maps/gs1_optional.js), for those who rang the bell
    for (let x = 24; x <= 28; x++) { M.set(x, 24, 'chasm'); M.setObj(x, 24, x === 24 ? 'plank_h_ns_l' : x === 28 ? 'plank_h_ns_r' : 'plank_h_ns_'); M.walkable(x, 24); }   // the rope bridge over the gully
    for (const [x, y, red] of L.trees) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    for (const [x, y] of L.bushes) M.setObj(x, y, 'bush');
    for (const [x, y] of L.rocks) M.setObj(x, y, 'rock_grass');
    for (const [x, y] of L.fences) M.setObj(x, y, 'fence');
    const house = (letter, opts) => { const h = L.houses.find(h => h.letter === letter); return M.house(h.x, h.y, h.w, h.h, opts.roof || 'roof_brown', Object.assign({ doorX: h.doorX, tx: 6, ty: 8 }, opts)); };
    house('I', { to: 'vault_mayor', chimney: true });                                   // the mayor's, with the Nut box outside
    house('J', { to: 'vault_house_j', tx: 4, ty: 5, windows: false });                                // the storage hut
    house('C', { to: 'vault_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true });      // the inn
    house('B', { to: 'vault_house_b', chimney: true });                                 // the home in the middle of town
    { const h = L.houses.find(h => h.letter === 'A'); house('A', { to: 'vault_house_a', doorX: Math.max(0, h.doorX - 1) }); }   // the home nearest the gate; its door one tile west of the layout's, which opens on the chasm
    // the doors cut into the cliffs: the sanctum, the jail, the armoury, the item shop
    const cliffDoor = (x, y, to, tx, ty) => { M.setObj(x, y, 'door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true }); };
    cliffDoor(3, 17, 'vault_sanctum', 6, 8); cliffDoor(4, 10, 'vault_jail', 6, 6); cliffDoor(18, 10, 'vault_weaponshop', 6, 6); cliffDoor(23, 14, 'vault_itemshop', 6, 6);
    // the cave up on the north-east ledge, and the way in to the village from the south
    M.setObj(26, 4, 'door_cave'); M.sign(26, 5, 'Rubble chokes the cave mouth. Nothing short of a landslide would shift it.');
    M.exit(24, 31, 3, 1, 'world_gs1', 44, 19, DIR.DOWN);
    // the watchtower: a wooden frame with the bell on top, a ladder up its side
    M.fillObj(16, 5, 4, 4, 'wall_wood'); M.fillObj(16, 3, 4, 2, 'wooden_platform'); M.setObj(19, 6, 'ladder'); M.setObj(19, 7, 'ladder'); M.setObj(19, 8, 'ladder');
    M.walkable(19, 6, 1, 3); M.walkable(16, 3, 4, 2); M.setObj(19, 5, null); M.walkable(19, 5);
    M.object('bell', 17, 3, { id: 'vault_bell', script: function* (E) { Audio.sfx('confirm'); yield E.say('(The bell rings out over Vault.)'); G.set('vault_bell'); } });
    // the graveyard: six stones round a patch of turned earth
    for (const [x, y] of [[12, 22], [14, 22], [11, 23], [15, 23], [12, 24], [14, 24]]) M.setObj(x, y, 'gravestone');
    M.set(13, 23, 'dirt');
    // the turned earth between the stones: under Reveal, a stair down into Vault Cave
    M.object('vault_stairs', 13, 23, { id: 'vault_stairs', hiddenUntilReveal: true, tile: 'stairs_down', onStep: function* (E) { yield Engine.fadeOut(20); E.warpNow('vault_cave', 12, 2, DIR.DOWN); yield Engine.fadeIn(20); } });
    M.npc('vault_dog', 16, 23, { animal: 'dog', animalCol: '#c8a070', name: 'Dog', move: 'wander', solid: false, text: () => G.flag('obj:vault:vault_stairs:vault_stairs:seen') ? "Woof! (The dog wags at the open stair.)" : "Woof... (The dog sniffs at the earth between the six stones, and whines.)" });
    // the townsfolk
    M.npc('vault_mayorN', 1, 9, { type: 'noble', name: 'Mayor of Vault', text: () => G.flag('vault_thieves_done') ? "Thank you for catching those thieves! Vault is in your debt." : G.flag('ivan_joined') ? "Those thieves took Master Hammet's rod! They must be hiding somewhere in town." : "Welcome to Vault, travelers. Forgive the mood - there have been burglaries.", mind: "If Hammet's caravan leaves without paying its bill, the council will have my head." });
    M.npc('vault_w1', 12, 16, { type: 'villager_f', move: 'wander', text: "My husband is the innkeeper. He's been so nervous since the thefts." });
    M.npc('vault_m1', 15, 11, { type: 'villager_m', move: 'wander', text: "The bridge to the south collapsed in the earthquake. Master Hammet's caravan is stuck here.", mind: "I hope the earthquake didn't wake anything up in Mt. Aleph..." });
    M.npc('vault_kid', 6, 20, { type: 'child_m', move: 'wander', text: "I saw some scary men sneak into the inn's attic!", mind: "They had a Shaman's Rod! I saw it!" });
    M.npc('vault_watch', 16, 2, { type: 'guard', name: 'Watchman', dir: DIR.DOWN, text: "I keep watch from up here. Nothing gets past me... except, apparently, thieves." });
    M.npc('vault_gravekeeper', 9, 24, { type: 'elder_m', text: "Six stones for six founders of Vault. They say the graveyard hides an old passage, but I've never found it.", mind: "Some nights the stones hum. I don't tell anyone." });
    M.npc('vault_old', 21, 27, { type: 'elder_m', text: "Bilibin lies to the east, past Goma Cave. The cave is full of monsters these days." });
    M.npc('vault_dog', 20, 20, { animal: 'dog', animalCol: '#a08060', move: 'wander', text: 'Woof!', solid: true });
  }
});
Kit.home('vault_house_a', { name: 'House', back: { map: 'vault', x: 24, y: 21 }, npcs: [{ id: 'v_a', x: 5, y: 5, type: 'villager_f', text: "You came in by the south gate? Then you saw the broken bridge. We're cut off from Kalay until it's mended." }] });
Kit.home('vault_house_b', { name: 'House', back: { map: 'vault', x: 19, y: 20 }, npcs: [{ id: 'v_b', x: 5, y: 5, type: 'villager_m', text: "Burglars, in Vault! In my father's day the doors didn't even have locks.", mind: "I've started keeping my coins in the barrel. Don't tell anyone." }] });
Kit.interior('vault_house_j', { name: 'Storehouse', w: 8, h: 7, furn: [['crate', 1, 2], ['crate', 2, 2], ['barrel', 6, 2], ['shelf', 4, 2], ['crate_stack', 6, 4]], back: { map: 'vault', x: 9, y: 16 } });
Kit.interior('vault_jail', { name: 'Vault Jail', w: 12, h: 8, floor: 'floor_stone', wall: 'wall_in_stone', furn: [['torch', 3, 1], ['torch', 8, 1], ['hay', 1, 2], ['hay', 10, 2], ['bench_stone', 5, 3]], back: { map: 'vault', x: 4, y: 11 }, npcs: [{ id: 'vault_jailer', x: 6, y: 3, type: 'guard', name: 'Jailer', text: () => G.flag('vault_thieves_done') ? "Those three are locked up tight now, thanks to you." : "Empty cells, for once. Vault's a quiet town... was a quiet town." }] });
Kit.inn('vault_inn', { name: 'Vault Inn', price: 12, back: { map: 'vault', x: 13, y: 19 }, stairs: { x: 12, y: 5, to: 'vault_inn_attic', tx: 3, ty: 7 }, npcs: [{ id: 'vault_innkeep2', x: 8, y: 6, type: 'villager_m', name: 'Innkeeper\'s Son', text: "Some travelers rented the attic room, but they never come down. Strange..." }] });
defineMap('vault_inn_attic', {
  name: 'Vault Inn - Attic', w: 12, h: 9, base: 'void', indoor: true, music: 'town', entry: { x: 3, y: 7 },
  build(M) {
    M.room(0, 0, 12, 9, 'floor_wood', 'wall_in'); M.setObj(3, 8, null); M.set(3, 8, 'stairs_down'); M.walkable(3, 8); M.exit(3, 8, 1, 1, 'vault_inn', 12, 6, DIR.DOWN, { stairs: true });
    M.setObj(1, 2, 'crate'); M.setObj(2, 2, 'barrel'); M.setObj(9, 2, 'bed'); M.setObj(9, 3, 'bed_foot'); M.setObj(6, 4, 'table');
    M.chest(10, 6, 'Elixir', 1);
    M.npc('thief1', 5, 3, { type: 'pirate', name: 'Bandit', hideIf: 'vault_thieves_done', script: STORY.vaultThieves });
    M.npc('thief2', 7, 5, { type: 'villager_m', name: 'Thief', hideIf: 'vault_thieves_done', script: STORY.vaultThieves });
  }
});
Kit.shop('vault_itemshop', { name: 'Vault Item Shop', shop: 'vault_item', back: { map: 'vault', x: 23, y: 15 } });
Kit.shop('vault_weaponshop', { name: 'Vault Weapon Shop', shop: 'vault_weapon', back: { map: 'vault', x: 18, y: 11 } });
Kit.home('vault_mayor', { name: "Mayor's House", back: { map: 'vault', x: 8, y: 8 }, npcs: [{ id: 'Hammet', x: 5, y: 5, look: NPC_LOOKS.Hammet, name: 'Master Hammet', text: () => G.flag('vault_thieves_done') ? "You recovered my Shaman's Rod! Ivan, go with these young men. I have a feeling your destiny lies with them." : "I am Hammet, a merchant of Kalay. My caravan is stranded here. Worse, my Shaman's Rod was stolen!", cond: () => !G.flag('hammet_left') }, { id: 'IvanNPC', x: 7, y: 6, look: CHARACTERS.Ivan.look, name: 'Ivan', hideIf: 'ivan_joined', script: STORY.meetIvan }], chests: [[9, 3, 'Nut', 1]] });
Kit.sanctum('vault_sanctum', { name: 'Vault Sanctum', back: { map: 'vault', x: 3, y: 18 } });


// ======================= KOLIMA =======================
// ======================= XIAN =======================
// ======================= ALTIN =======================
// ======================= KALAY =======================

// ======================= LUNPA =======================
// ======================= TOLBI =======================
// colosso: js/maps/colosso.js

// ======================= SUHALLA / LALIVERO =======================
