// ---------- Mikasalla ----------
// The farming village of southern Osenia, after map references/golden-sun-the-lost-age-mikasalla-gba-map.webp
// (the town panel 29 x 26 at (49,26) of the rip, the northern meadow 18 x 18 at (57,6), the four round huts, the
// passage under the fields). Per the guide: the inn (hut 1 with the chimney), the wooden tower whose first level is
// climbed and jumped from to reach the northern meadow and its 82 coins, the Scoop spot in the lower-left field by
// the sheep and the chicken that opens a ladder down into the passage, which comes up in the inn's backyard where
// Spark waits and joins without a fight. Hidden: a Nut in the box by the sheep, an Elixir in the lower-right barrel,
// an Herb in the lower-right home's jar, a Lucky Pepper in the inn's barrel by the oven.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEGEND = { '.': 'grass', ':': 'path', 'T': { ground: 'grass', obj: 'tree' }, 'F': { ground: 'grass', obj: 'fence' }, 'f': { ground: 'grass', obj: 'fence_v' }, 'w': 'water', 'h': { ground: 'grass', obj: 'logpile' },
    'W': { ground: 'grass', obj: 'floor_wood', walk: true }, 'L': { ground: 'grass', obj: 'ladder', walk: true }, 'D': { ground: 'grass', obj: 'door_cave', walk: true }, 'b': { ground: 'grass', obj: 'barrel' }, 'c': { ground: 'grass', obj: 'crate' }, 'x': { ground: 'grass', obj: 'rock_grass' } };
  // the town: (0,0) is the rip's (49,26)
  const T = grid(29, 26, '.');
  fill(T, 0, 1, 7, 4, '#'); fill(T, 3, 7, 11, 9, '#'); fill(T, 4, 7, 5, 9, '.'); fill(T, 5, 1, 9, 5, '#');            // the rock in the north-west, the ladder's dig spot in the band below it
  fill(T, 12, 0, 13, 9, '#'); fill(T, 14, 1, 17, 4, '#'); fill(T, 9, 0, 11, 2, '#'); fill(T, 19, 1, 20, 3, '#');       // the rock spurs above the huts
  fill(T, 20, 3, 27, 5, '#'); fill(T, 21, 3, 22, 6, '.'); fill(T, 18, 0, 28, 2, '.'); fill(T, 18, 1, 18, 4, '#');   // the ledge along the north-east, its face, the gap the tower's top opens on
  fill(T, 21, 7, 23, 11, 'W'); T[12][22] = 'L';                                                                          // the wooden tower, its ladder
  fill(T, 5, 12, 10, 14, '#'); fill(T, 12, 12, 16, 13, '#');                                                            // the low rims across the middle
  for (const [x, y] of [[1, 3], [3, 5], [0, 17], [1, 20], [2, 23], [27, 17], [28, 20], [26, 23], [4, 25], [24, 25], [27, 25], [1, 0], [3, 0], [26, 0], [28, 0]]) T[y][x] = 'T';
  fill(T, 2, 19, 7, 19, 'F'); T[19][6] = '.'; fill(T, 7, 24, 25, 24, 'F'); fill(T, 7, 24, 10, 24, '.');   // the pen's gate fill(T, 1, 12, 1, 23, 'f'); fill(T, 9, 25, 15, 25, 'F');     // the fences
  fill(T, 12, 24, 14, 24, 'w'); fill(T, 21, 23, 23, 23, 'w');                                                            // the troughs
  for (const [x, y] of [[10, 8], [6, 15], [3, 24], [23, 20]]) T[y][x] = 'h';                                             // the hay
  for (const [x, y] of [[17, 8], [13, 10], [2, 4], [25, 12]]) T[y][x] = 'x';
  fill(T, 20, 14, 21, 16, ':'); fill(T, 8, 16, 19, 16, ':'); fill(T, 14, 17, 14, 21, ':'); fill(T, 27, 14, 28, 16, ':');    // the lanes
  defineMap('mikasalla', {
    name: 'Mikasalla', w: 29, h: 26, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 27, y: 15 },
    build(M) {
      M.paint(0, 0, strs(T), LEGEND, { cliff: '#', set: 'cliff', faces: 1 });
      const thatch = { wall: 'wall_mud', windows: false };
      // the four huts: the inn under the chimney, three homes
      M.house(16, 6, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 1, to: 'mikasalla_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true }, thatch));
      M.house(11, 12, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 2, to: 'mikasalla_h2', tx: 6, ty: 8 }, thatch));
      M.house(19, 16, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 3, to: 'mikasalla_h3', tx: 6, ty: 8 }, thatch));
      M.house(8, 19, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 1, to: 'mikasalla_h4', tx: 6, ty: 8 }, thatch));
      M.setObj(19, 21, 'well_tl'); M.setObj(20, 21, 'well_tr'); M.setObj(19, 22, 'well_bl'); M.setObj(20, 22, 'well_br');
      // the way in from the world, the way north from the ledge
      M.exit(28, 14, 1, 3, 'world_tla', 190, 232, DIR.RIGHT); M.walkable(28, 14, 1, 3);
      M.exit(18, 0, 1, 1, 'mikasalla_north', 10, 16, DIR.UP); M.walkable(18, 0);
      // the dig spot: Scoop opens the ladder down into the passage under the fields
      M.object('scoop', 4, 8, { id: 'mik_dig', hole: true, look: 'sand_puddle' }); M.exit(4, 8, 1, 1, 'mikasalla_under', 2, 11, DIR.DOWN, { cond: () => G.flag('obj:mikasalla:scoop:mik_dig:open') });
      // the animals and the folk
      M.npc('mik_sheep', 3, 21, { animal: 'sheep', animalCol: '#f0f0f0', name: 'Sheep', move: 'wander', text: 'Baa.' });
      M.npc('mik_chicken', 5, 22, { animal: 'chicken', animalCol: '#f0f0f0', name: 'Chicken', move: 'wander', text: 'Bok.' });
      M.npc('mik_cow', 24, 22, { animal: 'cow', animalCol: '#f0f0f0', name: 'Cow', text: 'Moo.' });
      M.npc('mik_m1', 17, 15, { type: 'villager_m', move: 'wander', text: "Garoh is east of here. Don't go there at night - and don't go there in the day, either, if you ask me.", mind: 'They say the people of Garoh howl. My cousin heard them once.' });
      M.npc('mik_f1', 9, 15, { type: 'villager_f', move: 'wander', text: "The Yampi Desert is north of us. Nobody crosses it who doesn't have to.", mind: 'Those travelers look like they crossed it. They look half dead.' });
      M.npc('mik_old', 25, 13, { type: 'elder_m', text: "Air's Rock stands in the wastes north of Garoh. The Wind Clan raised it, long ago. The people of Garoh keep it now, or say they do.", mind: 'My grandfather said a wind blew out of Air\'s Rock that could speak. Foolishness.' });
      M.npc('mik_kid', 6, 18, { type: 'child_m', move: 'wander', text: "There's something buried by the sheep pen. I dug and dug, but the dirt's too hard for me!", mind: "If I had a shovel... a big one..." });
      M.npc('mik_f2', 16, 21, { type: 'villager_f', text: 'Buy some armor while you are here. The beasts of the wastes are worse than anything on the coast.', mind: "Our smith is the only one for a hundred miles. He knows it, too." });
      M.npc('mik_smith', 26, 19, { type: 'merchant', name: 'Smith', shop: 'mikasalla_weapon', dir: DIR.UP, text: 'Weapons and armor. What I have is what there is.' });
      M.sign(26, 14, 'MIKASALLA. Garoh lies east. The desert north. Air\'s Rock beyond both.');
    }
  });
  // the northern meadow: the chest at its top, reached down from the ledge
  const N = grid(18, 18, '.');
  fill(N, 0, 0, 17, 0, '#'); fill(N, 0, 1, 0, 17, '#'); fill(N, 17, 1, 17, 17, '#'); fill(N, 4, 6, 9, 8, '#'); fill(N, 11, 4, 14, 5, '#'); fill(N, 2, 12, 4, 13, '#'); fill(N, 12, 11, 15, 12, '#');
  for (const [x, y] of [[1, 2], [15, 2], [2, 16], [15, 16], [8, 3], [10, 14]]) N[y][x] = 'T';
  fill(N, 10, 9, 10, 17, ':');
  defineMap('mikasalla_north', {
    name: 'Mikasalla - North Meadow', w: 18, h: 18, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 10, y: 16 },
    build(M) { M.paint(0, 0, strs(N), LEGEND, { cliff: '#', set: 'cliff', faces: 1 }); M.exit(10, 17, 1, 1, 'mikasalla', 19, 1, DIR.DOWN); M.walkable(10, 17); M.chest(8, 2, 'Coins', 82, { coins: 82 }); M.sign(11, 16, 'The meadow above the village. The cows come up here in summer.'); }
  });
  // the passage under the fields: from the dug ladder to the inn's backyard
  defineMap('mikasalla_under', {
    name: 'Mikasalla - Under the Fields', w: 22, h: 16, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 2, y: 12 }, retreat: { map: 'mikasalla', x: 5, y: 8, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 22, 16); M.fill(1, 2, 20, 12, 'cave'); M.fillObj(1, 2, 20, 12, null); M.fillObj(5, 2, 4, 6, 'cavewalltop'); M.fillObj(12, 6, 5, 6, 'cavewalltop');
      M.setObj(2, 12, 'ladder'); M.walkable(2, 12); M.exit(2, 12, 1, 1, 'mikasalla', 5, 8, DIR.DOWN, { stairs: true });
      M.setObj(18, 3, 'ladder'); M.walkable(18, 3); M.exit(18, 3, 1, 1, 'mikasalla_yard', 4, 5, DIR.UP, { stairs: true });
      M.setObj(3, 4, 'torch'); M.light(3, 4, 3); M.setObj(17, 10, 'torch'); M.light(17, 10, 3); M.chest(10, 11, 'Herb', 2);
      M.sign(4, 12, 'An old smugglers\' way, by the look of it. It runs toward the inn.'); }
  });
  // the inn's backyard, walled in: Spark
  defineMap('mikasalla_yard', {
    name: "Mikasalla - Inn's Backyard", w: 9, h: 8, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 4, y: 5 },
    build(M) { M.border('fence'); M.setObj(4, 6, 'ladder'); M.walkable(4, 6); M.exit(4, 6, 1, 1, 'mikasalla_under', 18, 4, DIR.DOWN, { stairs: true }); M.setObj(1, 1, 'logpile'); M.setObj(7, 1, 'barrel');
      M.djinni('Spark', 4, 2, { fight: false }); M.sign(7, 6, 'The inn\'s yard. The fence has no gate; the only way in is the way you came.'); }
  });
  // ---- the huts ----
  Kit.inn('mikasalla_inn', { name: 'Mikasalla Inn', price: 24, back: { map: 'mikasalla', x: 17, y: 11 }, w: 14, h: 10, furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['bed', 11, 2], ['bed_foot', 11, 3], ['bed', 9, 2], ['bed_foot', 9, 3], ['table', 5, 6], ['chair', 4, 6], ['chair', 6, 6], ['fireplace', 7, 1], ['barrel', 8, 2], ['shelf', 1, 2]],
    npcs: [{ id: 'mik_guest', x: 9, y: 6, type: 'villager_m', text: "I came down from Alhafra. Half the town's living in their inn. Ours has room, at least.", mind: 'The keeper here bakes. Alhafra\'s keeper boils cabbage.' },
           { id: 'Galahad', x: 11, y: 6, type: 'guard', name: 'Galahad', cond: () => !!G.party.get('Isaac') && ST.gs1Done('colosso_done'), script: function* (E) { const y = yield* E.ask('You there. Do you know Isaac, the knight who took the Colosso?', 'Galahad', ['Yes', 'No']); yield E.say(y === 0 ? 'Then tell him this: Satrage, Navampa and Azart - the three he beat - have left Tolbi. They mean to have their revenge on him. Galahad warned you.' : "No matter. If you meet him, tell him Galahad said Satrage, Navampa and Azart are hunting him.", 'Galahad'); } }] });
  Kit.home('mikasalla_h2', { name: 'House', back: { map: 'mikasalla', x: 13, y: 17 }, npcs: [{ id: 'mik_h2', x: 5, y: 5, type: 'villager_f', text: 'My husband went to Garoh to sell wool and came back white as the wool. He will not say what he saw.', mind: 'Howling, he said, once, in his sleep. Howling in the town.' }] });
  Kit.home('mikasalla_h3', { name: 'House', back: { map: 'mikasalla', x: 22, y: 21 }, npcs: [{ id: 'mik_h3', x: 5, y: 5, type: 'elder_f', text: 'The purple rock in the wastes - Air\'s Rock - the Wind Clan of old carved their teachings into it, they say. Nobody reads them now.', mind: 'A girl of the Wind Clan once passed through. Lavender hair. She read the sky like a book.' }] });
  Kit.home('mikasalla_h4', { name: 'House', back: { map: 'mikasalla', x: 9, y: 24 }, npcs: [{ id: 'mik_h4', x: 4, y: 5, type: 'villager_m', text: "The sheep are restless at night. Something walks the ridge east of here on two legs, and it isn't a man.", mind: 'A wolf that walks. My father saw one. My father drank.' }] });
}
