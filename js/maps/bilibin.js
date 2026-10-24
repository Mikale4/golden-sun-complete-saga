// ---------- Bilibin ----------
// Lord McCoy's town, from the reference rip (BILIBIN_LAYOUT, tools/town_gen.py bilibin): the palace and the lumber
// yard on the ledge north, the log stairs down to the town, the plaza with its golden statue, the homes, the inn, the
// item shop and the sanctum cut into the cliffs, and the log palisade round the south side whose tops are walked from
// the sanctum's ledge right round to the vined door on the north-west ledge, behind which the Jupiter Djinni Gust
// waits in a little cave. East of town, McCoy's barricade closes the road to Kolima.
'use strict';

const BILIBIN_LEGEND = Object.assign({}, VALE_LEGEND, {
  'P': { ground: 'palisade_top', walk: true }, 'Q': { ground: 'grass', obj: 'palisade_face' }, 'B': { ground: 'palisade_gate', walk: true }
});
// the log stacks of the lumber yard, and the stump by the sanctum: rocks the rip shows as cut timber
const BILIBIN_LOGS = (x, y) => (x <= 11 && y <= 14) || (x === 28 && (y === 11 || y === 12));

defineMap('bilibin', {
  name: 'Bilibin', w: 34, h: 50, base: 'grass', music: 'town', bg: 'grass', entry: { x: 20, y: 48 },
  build(M) {
    const L = BILIBIN_LAYOUT.town;
    M.paint(0, 0, L.rows, BILIBIN_LEGEND, { set: 'cliff', faces: 2 });
    for (const [x, y, red] of L.trees) M.tall(red || (x === 13 && y === 17) ? 'tree_red_tall' : 'tree_tall', x, y);   // the Nut tree left of the palace is the red one
    for (const [x, y] of L.bushes) M.setObj(x, y, 'bush');
    for (const [x, y] of L.rocks) M.setObj(x, y, BILIBIN_LOGS(x, y) ? 'logpile' : x === 32 && y === 28 ? 'stump' : 'rock_grass');
    // the lumber yard's timber frame: posts where the beams cross, beams between them
    const F = new Set(L.fences.map(([x, y]) => x + ',' + y));
    for (const [x, y] of L.fences) { const h = F.has((x - 1) + ',' + y) || F.has((x + 1) + ',' + y), v = F.has(x + ',' + (y - 1)) || F.has(x + ',' + (y + 1)); M.setObj(x, y, h && v ? 'timber_x' : h ? 'timber_h' : 'timber_v'); }
    // the houses, by the rip's letters
    const house = (letter, opts) => { const h = L.houses.find(h => h.letter === letter); return M.house(h.x, h.y, h.w, h.h, opts.roof || 'roof_thatch', Object.assign({ doorX: h.doorX, tx: 6, ty: 8 }, opts)); };
    house('A', { to: 'bilibin_house_a', chimney: true });                                    // the home by the gate
    house('B', { to: 'bilibin_house_b', chimney: true });                                    // the home beside the inn
    house('C', { to: 'bilibin_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true });        // the inn
    house('F', { to: 'bilibin_house_f', chimney: true });                                    // the home beside the statue
    house('G', { to: 'bilibin_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', chimney: true });   // the armoury
    // Lord McCoy's palace: blue tiled roofs on two towers and the hall between, stone walls with tall windows
    M.house(14, 5, 13, 9, 'roof_blue', { wall: 'wall_stone', wallRows: 5, doorX: 6, windows: true, to: 'bilibin_palace', tx: 10, ty: 12 });
    for (const x of [14, 15, 16, 24, 25, 26]) M.setObj(x, 4, 'roof_blue_peak');
    for (let y = 10; y <= 13; y++) for (let x = 17; x <= 23; x++) M.setObj(x, y, 'wall_brick');   // the red-brick hall between the two stone towers
    M.setObj(20, 13, 'door_brick'); M.walkable(20, 13);
    for (const [x, y] of [[15, 11], [25, 11], [15, 13], [25, 13]]) M.setObj(x, y, 'window_stone');
    for (const [x, y] of [[18, 11], [22, 11], [18, 13], [22, 13]]) M.setObj(x, y, 'window_brick');
    // the doors cut into the cliffs: the item shop west, the sanctum on its ledge east
    const cliffDoor = (x, y, to, tx, ty) => { M.setObj(x, y, 'door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true }); };
    cliffDoor(10, 30, 'bilibin_itemshop', 6, 6); cliffDoor(30, 25, 'bilibin_sanctum', 6, 8);
    M.setObj(28, 26, 'pot'); M.container(28, 26, 'pot');
    // the vined door on the north-west ledge, reached along the palisade: Whirlwind opens the way to Gust's cave
    M.setObj(8, 24, 'door_cave'); M.walkable(8, 24); M.exit(8, 24, 1, 1, 'bilibin_gust_cave', 7, 15, DIR.UP, { door: true, cond: () => G.flag('bilibin_ivy_cleared') });
    M.object('vines', 8, 24, { id: 'bilibin_ivy', reveal: 'door_cave', onClear: function* (E) { G.set('bilibin_ivy_cleared'); yield E.say('The ivy tears away. A little door stands open in the rock!'); } });
    // the wells, the log stairs, the way in from the world
    for (const [x, y] of [[28, 14], [26, 31]]) { M.setObj(x, y, 'well_tl'); M.setObj(x + 1, y, 'well_tr'); M.setObj(x, y + 1, 'well_bl'); M.setObj(x + 1, y + 1, 'well_br'); }
    for (let y = 19; y <= 22; y++) for (const x of [19, 20]) { M.set(x, y, 'grass'); M.setObj(x, y, 'stairs_wood'); M.walkable(x, y); }
    M.exit(20, 49, 2, 1, 'world_gs1', 66, 17, DIR.DOWN);
    // the golden statue on the plaza stands over a ladder from Gust's cave: nobody shifts it from above, but climbing
    // up from below slides it aside, and the ladder stays open after that as the short way in
    const moved = G.flag('bilibin_statue_moved');
    M.object('statue', moved ? 23 : 22, 31, { id: 'bilibin_statue', script: function* (E) { yield E.say(moved ? "The golden statue, shoved aside. It rings hollow." : "A golden statue of a woodcutter. It rings hollow when you knock on it... and it will not budge."); } });
    if (moved) { M.set(22, 31, 'stairs_down'); M.walkable(22, 31); M.exit(22, 31, 1, 1, 'bilibin_gust_cave', 18, 12, DIR.DOWN, { stairs: true }); }
    // the barrels and the jar beside the inn
    M.setObj(31, 39, 'barrel'); M.container(31, 39, 'barrel'); M.setObj(31, 40, 'pot'); M.container(31, 40, 'pot'); M.setObj(30, 41, 'barrel'); M.container(30, 41, 'barrel');
    // the guards at the palace door, and the townsfolk
    M.npc('bilibin_guard_r', 21, 14, { type: 'guard', name: 'Guard', dir: DIR.DOWN, script: STORY.mccoyGuard, mind: "They're children... but nobody else has come forward." });
    M.npc('bilibin_guard_l', 19, 14, { type: 'guard', name: 'Guard', dir: DIR.DOWN, text: () => G.flag('mccoy_refused') ? "Lord McCoy won't be moved. Not even by the likes of you." : "This is the palace of Lord McCoy, ruler of Bilibin. Speak to the captain if you have business with him.", mind: "Kolima... my brother went with the second party. He hasn't come back." });
    M.npc('bilibin_sawyer', 6, 12, { type: 'villager_m', name: 'Sawyer', text: "This frame's for the lord's new hall. The timber's all from Kolima Forest... or it was, before the woodcutters stopped coming back.", mind: "Cursed wood, they say. I'm not touching another log of it." });
    M.npc('bilibin_carpenter', 12, 8, { type: 'villager_m', name: 'Carpenter', move: 'wander', text: "Lord McCoy wants his palace bigger. Where does he think the wood's going to come from now?" });
    M.npc('bilibin_kid_top', 7, 15, { type: 'child_f', move: 'wander', text: "The men who went to Kolima came back as trees! Trees! Isn't that scary?", mind: "I want to see a tree-man. Just once." });
    M.npc('bilibin_elder1', 17, 23, { type: 'elder_m', text: "The fountains of the Mercury Lighthouse, up north past Imil... they say the Hermes' Water there can cure any ill. Even a curse, perhaps." });
    M.npc('bilibin_elder2', 18, 23, { type: 'elder_f', text: "That poor thing by the gate came back from Kolima Forest looking like that. A sprout, with a man's soul inside it." });
    M.npc('bilibin_w1', 13, 30, { type: 'villager_f', move: 'wander', text: "Kolima's to the east, but the road's barricaded. Lord McCoy sealed it after the curse started." });
    M.npc('bilibin_m1', 19, 29, { type: 'villager_m', move: 'wander', text: () => G.flag('tret_cured') ? "The curse on Kolima was lifted! Lord McCoy has ordered the barricade opened." : "Everyone in Kolima has been turned into trees! The lord's champions went into the forest and never came back." });
    M.npc('bilibin_kid', 20, 30, { type: 'child_m', move: 'wander', text: "A great big tree in Kolima Forest cursed everybody! Tret, they call him!" });
    M.npc('bilibin_soldier', 25, 32, { type: 'guard', name: 'Soldier', text: "The statue on the plaza was a gift from Kolima's woodcutters, years ago. Solid gold, they say. Nobody's ever managed to shift it.", mind: "If it's solid gold, why does it ring hollow when you knock on it?" });
    M.npc('bilibin_old', 22, 37, { type: 'elder_m', text: "Imil lies to the north, in the frozen lands. They say the Mercury Lighthouse looms over it." });
    M.npc('bilibin_f2', 16, 39, { type: 'villager_f', move: 'wander', text: "The inn's the big house on the right. My husband keeps it. Twenty-one coins a night and worth every one." });
    M.npc('bilibin_woodcutter', 31, 38, { type: 'villager_m', name: 'Woodcutter', text: () => G.flag('tret_cured') ? "I'll never cut another tree in Kolima Forest. Lesson learned." : "Lord McCoy sent us to cut trees in Kolima Forest for his palace... and the forest fought back!", mind: "It was my axe that struck Tret first. This is my fault..." });
    M.npc('bilibin_sprout', 21, 44, { animal: 'sapling', animalCol: '#58a848', name: 'Sprout', text: "(The little tree rustles, though there is no wind.)", mind: "Help me... I was a man. I walked into Kolima Forest, and the great tree's anger... it turned me into this. Ivan? Someone hears me?" });
    M.npc('bilibin_gatekeep', 18, 45, { type: 'villager_m', text: "Bilibin's palisade was built when the wolves came down from the mountains. Nowadays the children run along the top of it." });
  }
});

// ---- the homes ----
Kit.home('bilibin_house_a', { name: 'House', back: { map: 'bilibin', x: 12, y: 39 }, npcs: [{ id: 'bh_a', x: 5, y: 5, type: 'villager_f', text: "You came in by the gate? Then you saw that poor sprout. He was our neighbour, once." }] });
Kit.home('bilibin_house_b', { name: 'House', back: { map: 'bilibin', x: 18, y: 38 }, npcs: [{ id: 'bh_b', x: 5, y: 5, type: 'villager_m', text: "The Kolima Bridge to the south was washed out. You'd have to go around through Kolima Forest.", mind: "As if anyone would go through that forest now." }] });
Kit.home('bilibin_house_f', { name: 'House', back: { map: 'bilibin', x: 16, y: 31 }, npcs: [{ id: 'bh_f', x: 5, y: 5, type: 'scholar', text: "In the old days, Adepts could summon great spirits by gathering Djinn. Or so the legends say.", mind: "The little creature I saw in the cliffs... could that have been one?" }] });
Kit.inn('bilibin_inn', { name: 'Bilibin Inn', price: 21, back: { map: 'bilibin', x: 29, y: 40 } });
Kit.shop('bilibin_itemshop', { name: 'Bilibin Item Shop', shop: 'bilibin_item', back: { map: 'bilibin', x: 10, y: 31 } });
Kit.shop('bilibin_weaponshop', { name: 'Bilibin Armoury', shop: 'bilibin_weapon', back: { map: 'bilibin', x: 24, y: 29 } });
Kit.sanctum('bilibin_sanctum', { name: 'Bilibin Sanctum', back: { map: 'bilibin', x: 30, y: 26 } });

// ---- Lord McCoy's palace: the great hall, his office upstairs, and the cellar with his reward ----
Kit.interior('bilibin_palace', { name: "Lord McCoy's Palace", w: 20, h: 14, floor: 'floor_tile', wall: 'wall_in_stone', doorX: 10, back: { map: 'bilibin', x: 20, y: 14 },
  furn: [['carpet', 9, 2, 3, 11], ['statue', 4, 2], ['statue', 15, 2], ['torch', 7, 1], ['torch', 12, 1], ['torch', 2, 1], ['torch', 17, 1], ['bookshelf', 1, 2], ['bookshelf', 18, 2], ['fireplace', 3, 1], ['table', 14, 6], ['chair', 13, 6], ['chair', 15, 6], ['table', 5, 6], ['chair', 4, 6], ['chair', 6, 6]],
  stairs: { x: 17, y: 3, to: 'bilibin_palace_2', tx: 11, ty: 7 },
  npcs: [{ id: 'palace_guard', x: 10, y: 3, type: 'guard', name: 'Captain', text: () => G.flag('mccoy_refused') ? "Lord McCoy is upstairs. He has said his piece, I'm afraid." : "Lord McCoy's office is up the stairs. Mind your manners before him." },
         { id: 'palace_maid', x: 5, y: 8, type: 'villager_f', name: 'Maid', move: 'wander', text: "The lord's been in a black mood since Kolima. Nobody dares light the fires without asking." },
         { id: 'palace_steward', x: 2, y: 4, type: 'scholar', name: 'Steward', text: "The cellar holds what the lord calls his treasury. Between us, it is four chests and a great many cobwebs." }],
  build(M) {
    // the cellar stairs open only when McCoy has sent the party down for its reward
    M.set(2, 10, 'stairs_down'); M.setObj(2, 10, null); M.walkable(2, 10); M.exit(2, 10, 1, 1, 'bilibin_palace_cellar', 6, 6, DIR.DOWN, { stairs: true, cond: () => G.flag('mccoy_reward') });
  } });
Kit.interior('bilibin_palace_2', { name: "Lord McCoy's Office", w: 14, h: 10, floor: 'floor_tile', wall: 'wall_in_stone', doorX: -1,
  furn: [['carpet', 6, 2, 3, 6], ['table', 3, 3], ['chair', 3, 4], ['bookshelf', 1, 2], ['bookshelf', 2, 2], ['bookshelf', 11, 2], ['bookshelf', 12, 2], ['torch', 4, 1], ['torch', 9, 1], ['fireplace', 11, 1], ['bed', 11, 5], ['bed_foot', 11, 6]],
  stairs: { x: 11, y: 8, down: true, to: 'bilibin_palace', tx: 17, ty: 4 },
  npcs: [{ id: 'McCoy', x: 7, y: 2, type: 'noble', name: 'Lord McCoy', dir: DIR.DOWN, script: STORY.mccoy }, { id: 'lady_mccoy', x: 4, y: 6, type: 'noble_f', name: 'Lady McCoy', text: "My husband frets so over Kolima. He sent his best men, and the forest swallowed them." }] });
Kit.interior('bilibin_palace_cellar', { name: "McCoy's Treasury", w: 12, h: 8, floor: 'floor_stone', wall: 'wall_in_stone', doorX: -1, furn: [['torch', 2, 1], ['torch', 9, 1], ['crate', 1, 5], ['barrel', 10, 5]],
  stairs: { x: 6, y: 6, to: 'bilibin_palace', tx: 2, ty: 11 },
  build(M) {
    // four chests, of which the lord allows one: the rest lock the moment a choice is made
    [['Vial', 3], ['Potion', 5], ['Psy Crystal', 7], ['Water of Life', 9]].forEach(([item, x]) => M.object('chestobj', x, 3, { id: 'mccoy_chest_' + x, script: function* (E) {
      if (G.flag('mccoy_chest')) { yield E.say('The chest is locked. Lord McCoy said one, and he meant it.'); return; }
      G.set('mccoy_chest', item); const o = G.map.objects.find(ob => ob.id === 'mccoy_chest_' + x); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } persistObjTile(G.map, x, 3, 'chest_open'); G.map.finalize();
      yield E.give(item); Audio.sfx('buzz'); yield E.say('(The other chests click shut.)');
    } }));
  } });

// ---- the cave under the plaza: the Jupiter Djinni Gust, past the statue in the pool ----
const GUST_CAVE_ROWS = [
  'kkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkccccccckkkcccccck',
  'kkkkkcccccccc~ccccccck',
  'kcccccckkk~~~c~~~kckkk',
  'kcccccckkk~~~c~~~kccck',
  'kcccccckkk~~~c~~~kccck',
  'kkkkkkkkkk~~~c~~~kccck',
  'kkkkkkkkkk~~~c~~~kkkkk',
  'kkkkkkkkkkkkkckkcccckk',
  'kkkkkkcckkkkkckkcccckk',
  'kkkkkkcckkkkkcccccc:kk',
  'kkkkkkcckkkkkcccccckkk',
  'kkkkkkcckkkkkkkkkkkkkk',
  'kkkkkkcckkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkk',
];
defineMap('bilibin_gust_cave', {
  name: 'Bilibin', w: 22, h: 17, base: 'void', music: 'dungeon', bg: 'cave', entry: { x: 7, y: 15 }, retreat: { map: 'bilibin', x: 8, y: 25, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, GUST_CAVE_ROWS, { 'c': 'cave', ':': 'cave', '~': 'cave_water' }, { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' });
    // the little chamber under the vined door, and the ladder up from it into the cave proper
    M.exit(7, 15, 1, 1, 'bilibin', 8, 25, DIR.DOWN, { door: true }); M.set(7, 15, 'cave'); M.setObj(7, 15, 'door_cave'); M.walkable(7, 15);
    M.setObj(6, 11, 'ladder'); M.walkable(6, 11); M.exit(6, 11, 1, 1, 'bilibin_gust_cave', 1, 6, DIR.RIGHT, { stairs: true });
    M.setObj(1, 5, 'ladder'); M.walkable(1, 5); M.exit(1, 5, 1, 1, 'bilibin_gust_cave', 6, 12, DIR.DOWN, { stairs: true });
    // the ladder up to the plaza: it comes up under the golden statue, which slides aside the first time
    M.setObj(19, 12, 'ladder'); M.walkable(19, 12);
    M.trigger(19, 12, 1, 1, function* (E) { const first = !G.flag('bilibin_statue_moved'); G.set('bilibin_statue_moved'); Audio.sfx('stairs'); yield Engine.fadeOut(10); E.warpNow('bilibin', 22, 31, DIR.DOWN); yield 1; yield Engine.fadeIn(14); if (first) { Audio.sfx('push'); yield E.say('The golden statue grinds aside as the trapdoor lifts. So that is why it rang hollow!'); } });
    for (const [x, y] of [[6, 3], [17, 3], [1, 7], [20, 6], [15, 13]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
    // the golden statue on the ledge: pushed into the pool, it is the stepping stone across
    M.object('statue_move', 12, 4, { id: 'gust_statue' });
    M.djinni('Gust', 19, 7, { fight: true });
  }
});

// ---- the barricade on the road to Kolima, from the reference rip: the river with its stepping stones, the crate
// wall across the neck of land between the water and the cliff, the meadow beyond and the forest east ----
const BARRICADE_ROWS = [
  '..........~~~~~~........',
  '##########~~~~~~########',
  '~~~~S~S~~~~~~~..........',
  '~~~~~~~~~~~~~~...T...T..',
  'S~~~~~~~~~~~~~.....T....',
  '~~~~~~~~~~~~~~~~..T...T.',
  '~~~~~~~~~~S~~S~..#######',
  '~~~~~~~..~~~~~~..#######',
  '.~~~~~~.................',
  '.~~~~~~..::::...........',
  '.~~S~~~..:..:...........',
  '.hhhh~~.........v.......',
  '~~~h~~~.KKK##...TT.TT.T.',
  '~~~h~~~.KKK##..TTTTTTTTT',
  '~~~h~~~~KKK##.TTTTTTTTTT',
  '~~~S~S~CCCC##.TTTTTTTTTT',
  '~~~h~~~....##..TTTTTTTTT',
  '~~Sh~~.....##.TTTTTTTTTT',
  '~~~h~~....o##.TTTTTTTTTT',
  '~~~hL~~.......TTTTTTTTTT',
  '::.......::...TTTTTTTTTT',
  '::..............TTTTTTTT',
  '..............TTTTTTTTTT',
  'vvv......v..vTTTTT.T.TTT',
];
defineMap('bilibin_barricade', {
  name: 'Bilibin Barricade', w: 24, h: 24, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 6, y: 23 }, enc: [['Rat Soldier'], ['Drone Bee', 'Drone Bee'], ['Spider']],
  build(M) {
    M.paint(0, 0, BARRICADE_ROWS, Object.assign({}, VALE_LEGEND, { 'S': 'stepstone', 'h': 'shallow', 'K': { ground: 'grass', obj: 'crate' }, 'C': { ground: 'grass', obj: 'crate' }, 'L': { ground: 'grass', obj: 'logpile' } }), { set: 'cliff', faces: 2 });
    M.exit(4, 23, 5, 1, 'world_gs1', 65, 16, DIR.LEFT); M.exit(23, 8, 1, 4, 'world_gs1', 67, 16, DIR.RIGHT);
    // the feeble wooden barricade: crates stacked across the neck of land; the left one stands where the river laps
    // at the bank, and Move tips it in, which makes the stepping stone the guard pretends not to see
    M.setObj(7, 15, null); M.object('crate', 7, 15, { id: 'barricade_crate' });
    // the barricade proper runs from the crate's wall clear across the neck of land to the cliff: crates, stacked,
    // with a logpile at the end - the way past is the river's edge, over the crate Move tips in
    for (let x = 8; x <= 23; x++) if (!M.getObj(x, 13) || M.getObj(x, 13).name !== 'rock_grass') { M.setObj(x, 13, x % 3 === 2 ? 'logpile' : 'crate'); M.block(x, 13); }
    for (let x = 8; x <= 23; x++) M.block(x, 12);
    for (const [x, y] of [[13, 3], [12, 11], [9, 20], [19, 13]]) M.setObj(x, y, 'rock_grass');
    M.npc('barricade_guard', 9, 17, { type: 'guard', name: 'Guard', text: () => G.flag('tret_cured') ? "Lord McCoy has opened the road. Kolima's people are back to being people, thanks to you." : G.flag('mccoy_refused') ? "The barricade stays up on the lord's orders. Nobody goes to Kolima... Say, that left crate wobbles something awful, right by the water. Not that I noticed." : "The road to Kolima is closed by order of Lord McCoy. The curse is on the other side of these crates.", mind: "If those kids shove the crate into the river I'm not going to see a thing." });
    M.sign(8, 17, "ROAD CLOSED by order of Lord McCoy of Bilibin. Kolima Forest lies under a curse. Turn back.");
    // the woodcutters who never made it home: two stand bent by the river, tree-shaped, and after the Lighthouse a
    // third lies in the stream below the ford, to be righted with Move; once Tret's curse lifts she waits here
    M.npc('barricade_tree1', 7, 7, { animal: 'sapling', animalCol: '#68a850', name: 'Tree', text: '(The little tree leans toward the water, as if reaching for something.)', mind: "The river... we were felling by the river when the curse came. My brothers... where are my brothers?" });
    M.npc('barricade_tree2', 15, 6, { animal: 'sapling', animalCol: '#88b048', name: 'Tree', text: '(A young tree stands on the bank, its branches bent like a man shielding his face.)', mind: "Tret's eyes... I saw the great tree's eyes open, and then I could not move my feet." });
    if (G.flag('mercury_lit') && !G.flag('tret_cured') && !G.flag('barricade_tree_saved')) M.object('rock_water', 3, 10, { id: 'barricade_tree', look: 'logpile' });
    if (G.flag('tret_cured') && G.flag('barricade_tree_saved')) M.npc('barricade_woman', 3, 11, { type: 'villager_f', name: 'Woman', script: function* (E) { if (G.flag('barricade_nut')) { yield E.say("I still dream I'm a tree. But I wake up, and that's the main thing.", 'Woman'); return; } yield E.say("You... you're the ones who pulled me out of the river! When I was a tree, I mean. I'd have floated all the way to the sea.", 'Woman'); yield E.say("Please, take this. It's all I have on me.", 'Woman'); G.set('barricade_nut'); yield E.give('Hard Nut'); } });
  },
  onPsy(name, x, y, F, o) {
    // Move on the tree in the water rights it against the bank
    if (name === 'Move' && o && o.id === 'barricade_tree') { return function* (E) { o.gone = true; G.set('obj:' + o.key, { gone: true }); G.set('barricade_tree_saved'); Audio.sfx('push'); yield E.say('The tree rolls up onto the stones. Its branches... they almost look like arms, reaching.'); }; }
    return false;
  }
});
