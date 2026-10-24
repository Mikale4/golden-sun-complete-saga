// ---------- Altin ----------
// The mining village on the mountainside, traced from the reference rip: terraces of rock climbed by ladders, the
// thatched houses set on the ledges, the mine's two mouths with their cart rails running out across the middle
// ground, the sanctum statue on the top terrace, and the shops and homes cut into the cliff faces. Until the
// Living Statues in the mine are stopped the middle of the village lies under the water they spew.
'use strict';

const ALTIN_LEGEND = {
  '.': 'grass', ':': 'dirt', 'k': 'cobble',
  'L': { ground: 'dirt', obj: 'ladder', walk: true },
  'o': { ground: 'grass', obj: 'rock_small' }, 'b': { ground: 'grass', obj: 'boulder' },
  'D': { ground: 'dirt', obj: 'door_cave' },
  '-': { ground: 'dirt', obj: 'rail_h', walk: true }, '|': { ground: 'dirt', obj: 'rail_v', walk: true },
  '1': { ground: 'dirt', obj: 'rail_sw', walk: true }, '2': { ground: 'dirt', obj: 'rail_se', walk: true }, '3': { ground: 'dirt', obj: 'rail_nw', walk: true }, '4': { ground: 'dirt', obj: 'rail_ne', walk: true },
  '<': { ground: 'dirt', obj: 'rail_end_w', walk: true }, '>': { ground: 'dirt', obj: 'rail_end_e', walk: true }, '^': { ground: 'dirt', obj: 'rail_end_n', walk: true },
  'p': { ground: 'grass', obj: 'pot' }, 'c': { ground: 'grass', obj: 'crate' }, 'w': { ground: 'grass', obj: 'barrel' },
  'S': { ground: 'cobble', obj: 'statue' },
};
// 32 x 32; the houses (C inn, G, J, L) are set over the '.' blocks left for them
const ALTIN_ROWS = [
  '###############...##......######',   // 0
  '########......#####.......######',   // 1   inn C 8..13 rows 1..6
  '.....##.......####.......o......',   // 2
  '.b.b.##.......####...S..........',   // 3   the sanctum's statue A on the top terrace
  '.....##.......####..............',   // 4
  '.b.b.##.......####.:::::::::::::',   // 5
  '.....##.......####.#####L#####..',   // 6
  '.b...##.......#.##.#D###L#####..',   // 7   door B (the item shop); the ladder down to the east ledge
  '.....##.......#.............###.',   // 8
  '.....####.....#.............#.##',   // 9
  '.....#######..##D#########.#D###',   // 10  mine mouth F; door H
  '.....########.##|########.......',   // 11
  '.......<--------3#..............',   // 12  house G 24..28 rows 12..18
  '....#.........:###.....o........',   // 13
  '.#..#.#.......:##..#............',   // 14
  '##..#.#.......:##..#............',   // 15
  '###.#.#.......####.#............',   // 16
  '..#.#..#######.####.D#..........',   // 17  mine mouth M
  '.##...##D#####.#....|##.........',   // 18  door I; house J 9..13 rows 19..24
  '##....#.......#.....|#..........',   // 19
  '##.#..#.......#.....|#..#...L..#',   // 20
  '.#.#.##.......#.....|#..#...L..#',   // 21
  '####.##.......#.....|###########',   // 22  house L 15..19 rows 22..27
  '####.#.#......#.....|......^####',   // 23
  'D.............#.....|......|.###',   // 24  door D, the way down to the lower mine
  '##b.##........#.....|......|...#',   // 25
  '####L.#.......#.....4------3...#',   // 26
  '####L.#.......#.....:..........#',   // 27
  '###L..#..D###...................',   // 28  door K, the armoury
  '####.##.###########.......######',   // 29
  '##################.....#########',   // 30
  '################.......#########',   // 31
];

defineMap('altin', {
  name: 'Altin', w: 32, h: 32, base: 'grass', music: 'town', bg: 'cliffs', entry: { x: 19, y: 30 },
  build(M) {
    M.paint(0, 0, ALTIN_ROWS, ALTIN_LEGEND, { set: 'cliff', faces: 2 });
    const thatch = { wall: 'wall_wood' };
    M.house(8, 1, 6, 6, 'roof_thatch', Object.assign({ doorX: 2, to: 'altin_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true }, thatch));   // C: the inn
    M.house(24, 12, 5, 7, 'roof_thatch', Object.assign({ doorX: 2, to: 'altin_house1', tx: 6, ty: 8 }, thatch));                          // G
    M.house(9, 19, 5, 6, 'roof_thatch', Object.assign({ doorX: 2, to: 'altin_house2', tx: 6, ty: 8 }, thatch));                           // J
    M.house(15, 22, 5, 6, 'roof_thatch', Object.assign({ doorX: 2, to: 'altin_house3', tx: 6, ty: 8 }, thatch));                          // L
    // the doors in the rock
    M.exit(20, 7, 1, 1, 'altin_itemshop', 6, 6, DIR.UP, { door: true }); M.setObj(19, 7, 'shop_sign');                                  // B
    M.exit(28, 10, 1, 1, 'altin_house4', 6, 8, DIR.UP, { door: true });                                                                 // H
    M.exit(8, 18, 1, 1, 'altin_house5', 6, 8, DIR.UP, { door: true });                                                                  // I
    M.exit(9, 28, 1, 1, 'altin_weaponshop', 6, 6, DIR.UP, { door: true }); M.setObj(10, 28, 'weapon_sign');                             // K
    M.exit(16, 10, 1, 1, 'altin_mine_1', 9, 19, DIR.UP, { door: true });                                                                // F: the upper mine mouth
    M.exit(20, 17, 1, 1, 'altin_mine_1', 9, 19, DIR.UP, { door: true });                                                                // M: the lower one
    M.exit(0, 24, 1, 1, 'altin_mine_3', 4, 22, DIR.LEFT, { door: true, cond: () => G.flag('altin_drained') });                          // D: the deep way, once the water is gone
    M.set(21, 4, 'cobble'); M.exit(21, 4, 1, 1, 'altin_sanctum', 6, 8, DIR.UP);                                                          // A: the sanctum is entered at the statue's feet
    M.exit(16, 31, 7, 1, 'world_gs1', 72, 43, DIR.DOWN);
    // the flood: until the statues are stopped, the middle ground and its rails are under water
    if (!G.flag('altin_drained')) { const flood = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = M.get(x, y), o = M.getObj(x, y); if (t.name === 'grass' || t.name === 'dirt' || (o && /^rail/.test(o.name))) { M.set(x, y, 'water'); M.setObj(x, y, null); } } }; flood(5, 13, 13, 16); flood(15, 18, 19, 21); }
    M.npc('altin_old', 3, 5, { type: 'elder_m', text: () => G.flag('altin_drained') ? "The water's gone at last. I can see my garden again." : "Look at it. The whole middle of the village drowned. Those statues in the mine never stop." });
    M.npc('altin_m1', 15, 4, { type: 'villager_m', name: 'Miner', text: () => G.flag('altin_drained') ? "The water's gone! Those Living Statues in the mine were spitting it out. Thank you!" : "The mine flooded overnight. Statues came to life inside and started spewing water. We can't get near them." });
    M.npc('altin_f1', 19, 9, { type: 'villager_f', move: 'wander', text: "Master Hammet of Kalay owns this mine. His caravan took the last of the ore south before the flood." });
    M.npc('altin_m2', 27, 5, { type: 'elder_m', text: "Up here we're above the water, at least. My house has been dry for sixty years and I mean to keep it so." });
    M.npc('altin_m3', 26, 9, { type: 'villager_m', name: 'Foreman', text: () => G.flag('altin_drained') ? "We can finally reopen the mine. Master Hammet will be pleased." : "We can't get into the mine with all this water. If only someone could stop those statues..." });
    M.npc('altin_kid', 11, 15, { type: 'child_m', move: 'wander', text: () => G.flag('altin_drained') ? "The carts run again! Can I ride one?" : "The carts are underwater. I wanted to ride one.", cond: () => G.flag('altin_drained') });
    M.npc('altin_f2', 22, 19, { type: 'villager_f', text: "The lower mine mouth is nearer the statues, but it's the deeper one, and the water fills it first." });
    M.npc('altin_m4', 3, 20, { type: 'elder_m', text: "The old shaft by my door goes down to the peak's heart. Flooded, the whole way. Don't." });
    M.npc('altin_m5', 8, 27, { type: 'villager_m', name: 'Smith', text: "Broad axes, bottle maces. Good iron, for miners who need it." });
  }
});
Kit.inn('altin_inn', { name: 'Altin Inn', price: 40, back: { map: 'altin', x: 10, y: 7 } });
Kit.sanctum('altin_sanctum', { name: 'Altin Sanctum', back: { map: 'altin', x: 21, y: 5 } });
Kit.shop('altin_itemshop', { name: 'Altin Item Shop', shop: 'altin_item', back: { map: 'altin', x: 20, y: 8 } });
Kit.shop('altin_weaponshop', { name: 'Altin Armory', shop: 'altin_weapon', back: { map: 'altin', x: 8, y: 28 } });
Kit.home('altin_house1', { back: { map: 'altin', x: 26, y: 19 }, chests: [[9, 3, 'Nut', 1]], npcs: [{ id: 'ah1', x: 5, y: 5, type: 'villager_f', text: "My husband is down the mine every day. Was, till the water came." }] });
Kit.home('altin_house2', { back: { map: 'altin', x: 11, y: 25 }, npcs: [{ id: 'ah2', x: 4, y: 5, type: 'elder_f', text: "Sixty years I've lived on this ledge. The mountain shakes sometimes. That's the mine, my husband says." }] });
Kit.home('altin_house3', { back: { map: 'altin', x: 17, y: 28 }, chests: [[9, 3, 'Sleep Bomb', 1]], npcs: [{ id: 'ah3', x: 5, y: 4, type: 'villager_m', text: "There's a Psynergy Stone somewhere up the peak, the old miners say. Nobody's seen it since the flood." }] });
Kit.home('altin_house4', { back: { map: 'altin', x: 28, y: 11 }, chests: [[9, 3, 'Elixir', 1]], npcs: [{ id: 'ah4', x: 5, y: 5, type: 'villager_m', text: "I keep my tools in here. No sense taking them down a flooded shaft." }] });
Kit.home('altin_house5', { back: { map: 'altin', x: 8, y: 19 }, npcs: [{ id: 'ah5', x: 5, y: 4, type: 'child_f', text: "Mama says the statues in the mine are alive. I think she's teasing." }] });
