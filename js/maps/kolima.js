// ---------- Kolima ----------
// The woodcutters' village in the forest east of Bilibin, from the reference rip (KOLIMA_LAYOUT, tools/town_gen.py
// kolima): four hollowed trunks with their roots spread over the grass, the wood pressing close on every side, and the
// villagers standing about as the trees Tret made of them. Under the village runs a cave (KOLIMA_CAVE_LAYOUT,
// tools/dungeon_gen.py kolima) from the back room of the stump home round to the fenced pen where Granite waits.
'use strict';

// the village as ChatGPT drew it whole (prompts/area_kolima.md), cut into its own tiles: the stumps, wood, crates
// and pots are in the picture; the doors, the jars' contents, the pen's stair, the Djinni and the people are ours
function kolimaFromPicture(M) {
  const P = KOLIMA_PICTURE; M.picture(P);
  const grass = P.names.find(n => /_grass_0$/.test(n)) || 'grass';
  const clear = (x, y) => { M.set(x, y, grass); M.walkable(x, y); P.solid[y][x] = 0; };
  // the roads in through the wood, west and east: cut until the clearing is reached
  for (const y of [15, 16]) for (let x = 0; x < P.w && P.solid[y][x]; x++) clear(x, y);
  for (const y of [17, 18]) for (let x = P.w - 1; x >= 0 && P.solid[y][x]; x--) clear(x, y);
  M.exit(0, 15, 1, 2, 'world_gs1', 71, 14, DIR.LEFT); M.exit(28, 17, 1, 2, 'world_gs1', 73, 14, DIR.RIGHT);
  // the doors in the stumps: the picture has them, the map only knows where they lead
  const reserved = new Set();
  const door = (x, y, to, tx, ty) => { M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true }); for (let j = y + 1; j <= y + 3 && j < P.h; j++) { M.walkable(x, j); P.solid[j][x] = 0; reserved.add(x + ',' + j); } };   // three steps over the roots to the grass, kept clear
  door(7, 10, 'kolima_inn', 7, 8); door(19, 12, 'kolima_weaponshop', 6, 6); door(9, 18, 'kolima_itemshop', 6, 6); door(16, 22, 'kolima_house_d', 6, 8);
  M.setObj(8, 11, 'inn_sign'); M.setObj(20, 13, 'weapon_sign'); M.setObj(10, 19, 'shop_sign');
  // the stump home's back way, on its cut top, to the room with the ladder down
  M.setObj(16, 18, 'door_tree'); M.walkable(16, 18); M.exit(16, 18, 1, 1, 'kolima_house_e', 4, 6, DIR.DOWN, { door: true }); for (let j = 17; j >= 0 && P.solid[j][16]; j--) { M.walkable(16, j); P.solid[j][16] = 0; }
  // the jars and barrels with something in them stand where the drawing put its pots: ours over plain grass
  const reach = new Set(['1,16']); { const q = [[1, 16]]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!M.inb(nx, ny) || P.solid[ny][nx] || reach.has(k)) continue; reach.add(k); q.push([nx, ny]); } } }
  for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) if (!P.solid[y][x] && !reach.has(x + ',' + y)) { M.block(x, y); P.solid[y][x] = 1; }   // pockets of open ground inside the wood are wood too
  const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = x + dx, ny = y + dy; if (M.inb(nx, ny) && !P.solid[ny][nx] && !reserved.has(nx + ',' + ny) && !M.exits.some(e => nx >= e.x && nx < e.x + e.w && ny >= e.y && ny < e.y + e.h) && !M.objects.some(o => o.x === nx && o.y === ny) && !M.npcs.some(n => n.x === nx && n.y === ny)) return [nx, ny]; } return [x, y]; };
  for (const [x0, y0, t] of [[13, 6, 'pot'], [3, 7, 'barrel'], [4, 8, 'pot'], [22, 9, 'pot'], [23, 10, 'barrel'], [10, 20, 'pot'], [19, 24, 'pot']]) { const [x, y] = near(x0, y0); M.set(x, y, grass); M.setObj(x, y, t); M.container(x, y, t); P.solid[y][x] = 1; }
  // the fenced pen with the Venus Djinni, reached only from below
  M.set(20, 20, 'stairs_down'); M.walkable(20, 20); M.exit(20, 20, 1, 1, 'kolima_cave', 18, 16, DIR.DOWN, { stairs: true }); for (let j = 20; j <= 22; j++) for (let i = 20; i <= 21; i++) { M.walkable(i, j); P.solid[j][i] = 0; }
  M.djinni('Granite', 21, 21, { fight: false });
  // the villagers: trees, until Tret is himself again; each one on the nearest open cell to where the old map had them
  const cured = G.flag('tret_cured');
  for (const t of KOLIMA_TREEFOLK) { const [x, y] = near(t.x, t.y); if (cured) M.npc(t.id, x, y, { type: t.cured.type, move: 'wander', text: t.cured.text }); else M.npc(t.id, x, y, { animal: 'sapling', animalCol: ['#58a848', '#68a850', '#88b048', '#4c9848'][t.x % 4], name: 'Tree', text: t.text }); }
  if (cured) { const [x, y] = near(9, 22); M.npc('kolima_dog', x, y, { animal: 'dog', animalCol: '#805030', move: 'wander', text: 'Woof!' }); }
  M.trigger(1, 15, 3, 3, STORY.kolimaArrive, { once: 'kolima_arrived', cond: () => !G.flag('tret_cured') });
}
const KOLIMA_TREEFOLK = [
  { id: 'k_tree1', x: 14, y: 7, text: "We were felling by the river when the sparkles came down. I never even dropped my axe.", cured: { type: 'villager_m', text: "We were trees! Actual trees! I could feel the wind in my leaves..." } },
  { id: 'k_tree2', x: 15, y: 10, text: "My boy... he was playing by the crates. Is he a tree too? I can't turn my head to look.", cured: { type: 'villager_f', text: "Thank you for saving Tret and lifting the curse! My boy is a boy again." } },
  { id: 'k_tree3', x: 6, y: 10, text: "The inn's been empty for weeks. Nobody comes to Kolima now. Nobody leaves, either.", cured: { type: 'villager_m', text: "The inn's open again! Thirty-two coins a night, and worth every one after what we've been through." } },
  { id: 'k_tree4', x: 12, y: 16, text: "Tret's eyes opened. That's the last thing I remember. The great tree's eyes, opening.", cured: { type: 'elder_m', text: "Tret and Laurel have watched over Kolima Forest for a thousand years. We must respect them." } },
  { id: 'k_tree5', x: 14, y: 16, text: "Being a tree isn't so bad. Except for the woodpeckers.", cured: { type: 'child_m', text: "Being a tree was kinda fun! Except for the woodpeckers." } },
  { id: 'k_tree6', x: 21, y: 16, text: "The Djinni in the pen... it watches me. I think it feels sorry for us.", cured: { type: 'villager_f', text: "The little creature in the pen is gone. I hope it went somewhere it can be happy." } },
  { id: 'k_tree7', x: 10, y: 21, text: "Bilibin sent men to help us. They're trees now too, out by the barricade.", cured: { type: 'villager_m', text: "Lord McCoy's men came to help us and paid for it. I hear they're on their feet again." } },
  { id: 'k_tree8', x: 5, y: 17, text: "So thirsty. So very thirsty. Is it going to rain?", cured: { type: 'elder_f', text: "I dreamt of rain the whole time. Rain and worms." } },
];
defineMap('kolima', {
  name: 'Kolima', w: 29, h: 30, base: 'grass', music: 'vale', bg: 'forest', entry: { x: 1, y: 16 },
  build(M) {
    if (typeof KOLIMA_PICTURE !== 'undefined') { kolimaFromPicture(M); return; }
    const L = KOLIMA_LAYOUT.town;
    M.paint(0, 0, L.rows, VALE_LEGEND, { set: 'cliff', faces: 2 });
    for (const [x, y] of L.canopy) M.setObj(x, y, 'tree_top');
    for (const [x, y, red] of L.trees) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    const crates = new Set(['13,8', '15,8', '13,9', '14,9', '15,9']);
    // the roots: each cell joins on to the roots and trunks beside it (N 1, S 2, E 4, W 8)
    const roots = new Set(L.rocks.filter(([x, y]) => !crates.has(x + ',' + y) && !(x === 14 && y === 6) && !(y <= 2 || y >= 27 || x <= 1 || x >= 27)).map(([x, y]) => x + ',' + y));
    const trunk = (x, y) => L.houses.some(h => x >= h.x && x < h.x + h.w && y >= h.y + 2 && y < h.y + h.h);
    const joins = (x, y) => roots.has(x + ',' + y) || trunk(x, y);
    const drawnTree = (x, y) => false && ['C', 'D'].some(l => { const h = L.houses.find(h => h.letter === l); const big = Tiles.defs.stump_big_r0c0 && (l === 'A' || l === 'B'); const lx = h.x + h.doorX - (big ? 4 : 3), ly = h.y + h.h - (big ? 11 : 6) - 1; return x >= lx && x < lx + (big ? 9 : 7) && y >= ly && y < ly + (big ? 13 : 8); });   // a house drawn whole has its own roots
    for (const [x, y] of L.rocks) if (!drawnTree(x, y)) M.setObj(x, y, crates.has(x + ',' + y) ? 'crate' : x === 14 && y === 6 ? 'pot' : !roots.has(x + ',' + y) ? 'stump' : 'root_' + ((joins(x, y - 1) ? 1 : 0) | (joins(x, y + 1) ? 2 : 0) | (joins(x + 1, y) ? 4 : 0) | (joins(x - 1, y) ? 8 : 0)));
    M.container(14, 6, 'pot');
    // the tree-houses: a hollowed trunk with its cut top for a roof and a door in the bark, by the rip's letters
    const treeHouse = (letter, opts) => { const h = L.houses.find(h => h.letter === letter); M.house(h.x, h.y, h.w, h.h, 'bark_top', Object.assign({ wall: 'bark', wallRows: h.h - 2, doorX: h.doorX, doorTile: 'door_tree', windows: false, tx: 6, ty: 8 }, opts)); if (h.h >= 8) { M.setObj(h.x + 1, h.y + 3, 'window_tree'); M.setObj(h.x + 1, h.y + 6, 'window_tree'); } return h; };
    // the great hollowed stumps of the rip (stump_big 7 x 10, stump_small 5 x 5: prompts/tiles_batch3.md) stand in
    // for the drawn boxes as soon as their pictures are in assets/tiles
    const stumpHouse = (letter, kind, opts) => { const h = L.houses.find(h => h.letter === letter); const [w, hh, dx] = kind === 'stump_big' ? [7, 11, 3] : [5, 6, 2]; const lx = h.x + h.doorX - dx, ly = h.y + h.h - hh; M.landmark(kind, lx, ly, Object.assign({ w, h: hh, doorX: dx, tx: 6, ty: 8 }, opts)); if (opts.sign) M.setObj(lx + dx + 1, ly + hh - 1, opts.sign); return { x: lx, y: ly, w, h: hh }; };
    const bigStump = false, smallStump = false;   // the drawn stumps are out (user, 2026-09-17): Kolima keeps the game's own tree-houses
    if (bigStump) { stumpHouse('A', 'stump_big', { to: 'kolima_inn', tx: 7, ty: 8, sign: 'inn_sign' }); stumpHouse('B', 'stump_big', { to: 'kolima_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign' }); }
    else { treeHouse('A', { to: 'kolima_inn', tx: 7, ty: 8, sign: 'inn_sign' }); treeHouse('B', { to: 'kolima_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign' }); }
    // the two small houses are whole trees (the treehouse landmark, 5 x 4, its door at the foot of the trunk)
    const smallTree = (letter, opts) => { const h = L.houses.find(h => h.letter === letter); const lx = h.x + h.doorX - 2, ly = h.y + h.h - 4; M.landmark('treehouse', lx, ly, Object.assign({ w: 5, h: 4, doorX: 2, tx: 6, ty: 8 }, opts)); return { x: lx, y: ly, w: 5, h: 4 }; };
    let d;
    if (smallStump) { stumpHouse('C', 'stump_small', { to: 'kolima_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }); d = stumpHouse('D', 'stump_small', { to: 'kolima_house_d' }); }
    else { treeHouse('C', { to: 'kolima_itemshop', tx: 6, ty: 6, sign: 'shop_sign' }); d = treeHouse('D', { to: 'kolima_house_d' }); }
    // the stump home's back door, on its far side: the way to the room with the ladder down
    M.setObj(d.x + 1, d.y, 'door_tree'); M.walkable(d.x + 1, d.y); M.exit(d.x + 1, d.y, 1, 1, 'kolima_house_e', 4, 6, DIR.DOWN, { door: true });
    // the fenced pen with the Venus Djinni, reached only from below
    for (let x = 19; x <= 23; x++) { M.setObj(x, 19, 'fence'); M.setObj(x, 23, 'fence'); }
    for (let y = 20; y <= 22; y++) { M.setObj(19, y, 'fence_v'); M.setObj(23, y, 'fence_v'); }
    M.set(22, 20, 'stairs_down'); M.exit(22, 20, 1, 1, 'kolima_cave', 18, 16, DIR.DOWN, { stairs: true });
    M.djinni('Granite', 21, 21, { fight: false });
    // the barrels in the corner east of the armoury's tree, and the one outside the stump home
    for (const [x, y, t] of [[23, 8, 'barrel'], [24, 8, 'pot'], [23, 9, 'pot'], [24, 9, 'barrel'], [23, 10, 'barrel'], [24, 10, 'pot']]) { M.setObj(x, y, t); if (!(x === 23 && y === 8)) M.container(x, y, t); }
    // the ways out: west to the road, east toward the forest
    M.exit(0, 15, 1, 3, 'world_gs1', 71, 14, DIR.LEFT); M.exit(28, 17, 1, 2, 'world_gs1', 73, 14, DIR.RIGHT); M.walkable(0, 15, 1, 3); M.walkable(28, 17, 1, 2);
    // the villagers: trees, until Tret is himself again
    const cured = G.flag('tret_cured');
    for (const t of KOLIMA_TREEFOLK) { if (cured) M.npc(t.id, t.x, t.y, { type: t.cured.type, move: 'wander', text: t.cured.text }); else M.npc(t.id, t.x, t.y, { animal: 'sapling', animalCol: ['#58a848', '#68a850', '#88b048', '#4c9848'][t.x % 4], name: 'Tree', text: '(A young tree, about the height of a person. It does not move.)', mind: t.text }); }
    if (cured) M.npc('kolima_dog', 9, 22, { animal: 'dog', animalCol: '#805030', move: 'wander', text: 'Woof!' });
    M.trigger(1, 15, 3, 3, STORY.kolimaArrive, { once: 'kolima_arrived', cond: () => !G.flag('tret_cured') });
  }
});

// ---- the tree-houses inside: the inn and the armoury have an upper floor each ----
Kit.inn('kolima_inn', { name: 'Kolima Inn', price: 32, w: 12, h: 10, back: { map: 'kolima', x: 7, y: 11 }, stairs: { x: 10, y: 2, to: 'kolima_inn_2', tx: 9, ty: 3 },
  npcs: [{ id: 'kolima_inn_guest', x: 8, y: 6, type: 'villager_m', cond: () => G.flag('tret_cured'), text: "First guest since the curse lifted. The bed's a little woody, but so was I, for a while." }] });
Kit.interior('kolima_inn_2', { name: 'Kolima Inn', w: 12, h: 8, doorX: -1, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['bed', 5, 2], ['bed_foot', 5, 3], ['shelf', 8, 2], ['table', 4, 5], ['chair', 3, 5]], stairs: { x: 9, y: 2, down: true, to: 'kolima_inn', tx: 10, ty: 3 } });
Kit.shop('kolima_weaponshop', { name: 'Kolima Armoury', shop: 'kolima_weapon', w: 12, h: 9, back: { map: 'kolima', x: 20, y: 14 }, stairs: { x: 10, y: 2, to: 'kolima_weaponshop_2', tx: 9, ty: 3 } });
Kit.interior('kolima_weaponshop_2', { name: 'Kolima Armoury', w: 12, h: 8, doorX: -1, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['bookshelf', 6, 2], ['bookshelf', 7, 2], ['table', 4, 5], ['chair', 5, 5]], stairs: { x: 9, y: 2, down: true, to: 'kolima_weaponshop', tx: 10, ty: 3 } });
Kit.shop('kolima_itemshop', { name: 'Kolima Item Shop', shop: 'kolima_item', back: { map: 'kolima', x: 9, y: 19 } });
Kit.home('kolima_house_d', { name: 'House', back: { map: 'kolima', x: 16, y: 23 }, npcs: [{ id: 'kh_d', x: 5, y: 5, type: 'villager_f', cond: () => G.flag('tret_cured'), text: "The back room? Oh, that's just the cellar hatch. It goes down under the whole village, if you can believe it." }] });
Kit.interior('kolima_house_e', { name: 'House', w: 9, h: 8, doorX: 4, furn: [['shelf', 1, 2], ['crate', 7, 2], ['barrel', 7, 3], ['table', 3, 4], ['chair', 2, 4]], back: { map: 'kolima', x: 16, y: 17 },
  build(M) { M.set(5, 2, 'stairs_down'); M.setObj(5, 2, null); M.walkable(5, 2); M.exit(5, 2, 1, 1, 'kolima_cave', 12, 17, DIR.DOWN, { stairs: true }); } });

// ---- the cave under the village ----
defineMap('kolima_cave', {
  name: 'Kolima', w: 32, h: 29, base: 'void', music: 'dungeon', bg: 'cave', entry: { x: 12, y: 18 }, enc: [['Rat', 'Rat'], ['Bat', 'Bat'], ['Slime', 'Slime', 'Slime']], retreat: { map: 'kolima', x: 16, y: 17, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, KOLIMA_CAVE_LAYOUT.cave, { 'c': 'cave', 'w': 'cave_water', 'y': { ground: 'cave', obj: 'ladder', walk: true }, 'l': { obj: 'torch' } }, { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' });
    for (const [x, y] of [[11, 1], [26, 8], [22, 17]]) M.light(x, y, 3);
    // the ladder down from the stump home's back room, and the one up into the pen
    M.exit(12, 16, 1, 1, 'kolima_house_e', 5, 3, DIR.DOWN, { stairs: true });
    M.exit(18, 15, 1, 1, 'kolima', typeof KOLIMA_PICTURE !== 'undefined' ? 20 : 22, 21, DIR.DOWN, { stairs: true });   // up into the pen, beside its stair
  }
});
