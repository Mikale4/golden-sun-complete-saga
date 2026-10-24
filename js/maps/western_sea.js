// ---------- The Western Sea's small places: SW Atteka Islet, Kalt Island, Gondowan Settlement, Hesperia Settlement ----------
// After the rips in map references/ (sw-atteka-islet 32x44, kalt-island 24x25, gondowan-settlement 23x22, hesperia-settlement
// 31x32), condensed, and the guide's chapter 12 ("Djinn hunting on the Western Hemisphere"):
//  - SW Atteka Islet, at the edge of the world where the sea spills over the falls: the pillar off the lower terrace into
//    the rapids, the crate off the upper terrace that rides the falls down and wedges behind it, the Dragon Skin on the
//    islet in the rapids; the boulder Lift raises (Isaac) with the missing Golden Sun Jupiter Djinni under it.
//  - Kalt Island: the frozen river (LDRULURULURULDL from its foot), Lash on the rope at its head, Gel on the ledge;
//    the old couple's hut and their word of Prox and the magma balls; the Apple in the tree, Catch.
//  - Gondowan Settlement: Magma Rock's shadow; Cyclone on the leftmost bush for the stair to the Star Dust; the Lucky
//    Medal in the middle-left gravestone.
//  - Hesperia Settlement: the sandstone terraces; the left vine, Growth on the plant, the crate Moved to you, pushed down
//    the leftmost gap, down again, Moved right into the pit at the wall's foot, and over the wall to Tinder and the back
//    room's 166 coins.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const say = (npc, s, m) => ({ text: s, mind: m });

  // ====================== SW Atteka Islet ======================
  // the sea at x 0-8 is the falls' edge: the rapids run down x 9-10 past the island and over the falls at the bottom
  const SA = {
    '.': 'grass', 's': 'sand', '~': 'water', 'r': 'sw_rapids', 'F': 'sw_falls', 'o': { ground: 'grass', obj: 'rock_small' }, 'P': { ground: 'grass', obj: 'palm' },
    'v': { ground: 'grass', obj: 'vineladder', walk: true }, 'E': { ground: 'grass', obj: 'tent' }
  };
  const A = grid(30, 36, '~');
  fill(A, 0, 0, 6, 35, 'F'); fill(A, 0, 34, 29, 35, 'F');   // the great falls west and south: the edge of Weyard
  fill(A, 9, 8, 10, 33, 'r');   // the rapids between the falls and the island
  fill(A, 11, 12, 28, 22, '.'); fill(A, 29, 12, 29, 22, 's'); fill(A, 11, 23, 26, 25, '#'); fill(A, 11, 26, 24, 33, '.');   // the upper terrace and its beach, the cliff, the lower terrace
  fill(A, 25, 26, 26, 33, '#');   // the cliff's east end runs down beside the lower terrace
  fill(A, 7, 24, 9, 28, '.'); A[24][7] = 'F'; A[28][7] = 'F';   // the islet in the rapids, with the Dragon Skin
  fill(A, 12, 13, 14, 14, 's'); fill(A, 24, 19, 27, 21, 's'); fill(A, 15, 30, 18, 31, 's');
  for (const [x, y] of [[13, 13], [16, 12], [14, 17], [18, 15], [19, 19], [24, 13], [13, 32], [22, 32]]) A[y][x] = 'P';
  for (const [x, y] of [[17, 13], [24, 31], [14, 30], [27, 15], [21, 30], [13, 27], [23, 28]]) A[y][x] = 'o';
  fill(A, 20, 23, 20, 25, 'v');   // the vine down the cliff
  A[17][21] = 'E';
  defineMap('sw_atteka_islet', {
    name: 'SW Atteka Islet', w: 30, h: 36, base: 'water', music: 'islet', bg: 'grass', entry: { x: 28, y: 15 }, retreat: { map: 'world_tla', x: 22, y: 220, dir: DIR.RIGHT },
    build(M) {
      M.paint(0, 0, strs(A), SA, { cliff: '#', set: 'brownrock', faces: 3 });
      M.exit(29, 14, 1, 3, 'world_tla', 22, 220, DIR.RIGHT); M.walkable(29, 14, 1, 3);
      M.exit(21, 18, 1, 1, 'swa_tent', 4, 5, DIR.UP, { door: true }); M.walkable(21, 18);
      // the pillar on the lower terrace: into the rapids for the first stone of the way across
      M.object('pillar', 12, 29, { id: 'swa_pillar', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'swa_pillar'); if (o && o.gone) { G.set('swa_pillar_sunk'); yield E.say('The pillar topples into the rapids and lodges there, the water foaming over it.'); } } });
      // the crate on the upper terrace: pushed into the water above, it rides the falls down and wedges behind the pillar
      M.object('crate', 12, 16, { id: 'swa_crate', onMove: function* (E) { const F = G.field, Mp = F.map; const o = Mp.objects.find(ob => ob.id === 'swa_crate'); if (!o || !o.gone) return;
        persistGround(Mp, 10, 16, 'sw_rapids');   // it does not stay where it fell in
        Audio.sfx('water'); yield E.say('The crate hits the water and the current takes it - down the rapids, faster and faster...');
        if (G.flag('swa_pillar_sunk')) { persistGround(Mp, 10, 28, 'crate_float'); persistWalkable(Mp, 10, 28); Mp.finalize(); G.set('swa_crate_done'); yield E.say('...and it jams against the fallen pillar with a crack! Wedged fast, the two of them: a way over to the islet.', 'Sheba'); }
        else { Mp.finalize(); delete G.flags['obj:' + o.key]; yield E.say('...and over the falls, into the mist. Gone.', 'Jenna'); yield E.say('Had something been in the way to catch it... Never mind. The sea will give it back to the shore, in time.', 'Kraden'); } } });
      M.chest(8, 26, 'Dragon Skin', 1);
      // the boulder: Lift, and the Jupiter Djinni that never joined Isaac's party in Angara, if there is one
      M.object('boulder', 26, 20, { id: 'swa_boulder', onLift: function* (E) { const miss = (typeof DJINN_ORDER !== 'undefined' ? DJINN_ORDER : Object.keys(DJINN)).find(n => DJINN[n] && DJINN[n].game === 1 && DJINN[n].el === 3 && !G.party.djinnFound.includes(n)); if (!miss) { yield E.say('Nothing under it but crabs.'); return; }
        G.field.map.objects.push({ kind: 'djinni', x: 26, y: 20, name: miss, key: 'djinn:' + miss, fight: true, el: 3 }); Audio.sfx('item'); yield E.say('Something was hiding under the boulder - a Jupiter Djinni, one that must have crossed the sea from Angara!', 'Sheba'); } });
      M.npc('swa_man1', 23, 14, { type: 'villager_m', name: 'Man', move: 'wander', text: "The sea west of here spills over a massive waterfall. You'll really start to appreciate the grandeur of nature if you see that, I can tell you.", mind: "(My buddy thinks I'm nuts to risk my life for a look at the falls. Actually, I just want to get my hands on some treasure I saw on the way there.)" });
      M.npc('swa_man2', 15, 21, { type: 'villager_m', name: 'Man', dir: DIR.LEFT, text: "There's nothing to the west of here. AND it's really dangerous. You shouldn't go that way.", mind: '(The currents are so strong near the falls that any boat caught in it is doomed.)' });
      M.sign(27, 13, 'SW Atteka Islet. Beyond it the sea falls off the edge of the world.');
      M.trigger(27, 14, 2, 3, function* (E) { yield E.say('Listen to that roar... The sea itself pours over the edge of the world here. Weyard ends at those falls.', 'Kraden'); yield E.say('Then we will not sail any farther west than this.', 'Piers'); }, { once: 'swa_seen' });
    }
  });
  Kit.interior('swa_tent', { name: 'Tent', w: 8, h: 7, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'sw_atteka_islet', x: 21, y: 19 }, doorX: 4, furn: [['barrel', 1, 2], ['barrel', 2, 2], ['pot', 6, 4], ['rug', 3, 3], ['rug', 4, 3], ['crate', 6, 2]] });

  // ====================== Kalt Island ======================
  // the frozen river runs x 6-9 from the falls to the foot of the map; the fences along it keep the slides on the ice
  const KL = {
    'u': 'snow', 'i': 'ice', 'I': 'ice_fall', '~': 'water', 'T': { ground: 'snow', obj: 'pinesnow' }, 'x': { ground: 'snow', obj: 'fence_snow' },
    'o': { ground: 'ice', obj: 'rock_ice' }, 'L': { ground: 'snow', obj: 'ladder', walk: true }, 'c': 'snowcliff_face', 'd': 'snow_gap'
  };
  const K = grid(24, 26, 'u');
  fill(K, 0, 0, 23, 2, '#'); fill(K, 7, 0, 9, 7, 'I');   // the cliff across the top and the frozen falls through it
  fill(K, 0, 3, 5, 9, 'u'); fill(K, 0, 10, 5, 11, '#'); K[10][4] = 'L'; K[11][4] = 'L';   // the terrace top-left, its edge, the ladder down
  fill(K, 10, 3, 23, 8, 'u'); fill(K, 10, 9, 23, 11, '#'); K[9][18] = 'L'; K[10][18] = 'L'; K[11][18] = 'L';   // the terrace top-right and its ladder
  fill(K, 6, 8, 9, 25, 'i');   // the river
  fill(K, 5, 8, 5, 23, 'x'); fill(K, 10, 8, 10, 23, 'x'); K[22][10] = 'u'; K[21][10] = 'u';   // the fences along the banks, open where the hut's path meets the ice and at the river's foot, where the banks are crossed between
  K[22][9] = 'u';   // the foot of the ice: where the slides start
  K[9][6] = 'u';   // the head of the ice: the snow at the rope's foot
  for (const [x, y] of [[7, 8], [8, 10], [6, 11], [7, 16], [9, 17], [8, 18], [6, 19], [9, 23], [6, 24]]) K[y][x] = 'o';   // the rocks in the ice (tools/kalt_ice.py)
  fill(K, 6, 6, 6, 8, 'c'); fill(K, 5, 3, 6, 5, 'u'); fill(K, 4, 3, 4, 6, '#'); K[6][5] = '#'; K[5][5] = 'd';   // the cliff the rope hangs down, the ledge at its head (Gel), and the drop off it back to the terrace
  fill(K, 0, 12, 4, 25, 'u');
  for (const [x, y] of [[1, 4], [3, 6], [12, 4], [15, 5], [20, 4], [22, 7], [2, 15], [1, 19], [3, 22], [16, 19], [19, 21], [21, 17], [22, 23], [18, 24]]) K[y][x] = 'T';
  K[25][7] = 'i'; K[25][8] = 'i';
  defineMap('kalt', {
    name: 'Kalt Island', w: 24, h: 26, base: 'snow', music: 'islet', bg: 'snow', entry: { x: 13, y: 24 }, retreat: { map: 'world_tla', x: 117, y: 50, dir: DIR.DOWN },
    fall: (x, y) => (x === 5 && y === 5) ? { map: 'kalt', x: 3, y: 7 } : null,
    build(M) {
      M.paint(0, 0, strs(K), KL, { cliff: '#', set: 'snowcliff', faces: 2 });
      M.exit(12, 25, 3, 1, 'world_tla', 117, 50, DIR.DOWN); M.walkable(12, 25, 3, 1);
      M.house(11, 12, 5, 4, 'roof_snow', { wall: 'wall_timber', to: 'kalt_hut', tx: 6, ty: 8, windows: true, doorX: 2 });
      // the rope at the river's head, up the cliff to the ledge where Gel sits
      M.setObj(6, 8, 'rope_end'); M.object('rope', 6, 8, { id: 'kalt_rope', len: 3, dx: 0, dy: -1 });
      M.djinni('Gel', 5, 4, { fight: true });
      // the Apple in the tree on the left bank: only Catch brings it down (Isaac's Catch Beads)
      M.setObj(2, 16, 'pinesnow'); if (!G.flag('obj:kalt:catchable:kalt_apple')) M.object('catchable', 2, 16, { id: 'kalt_apple', item: 'Apple', look: null });
      M.sign(15, 22, 'Kalt Island. The river froze one winter and never thawed.');
      M.trigger(12, 22, 3, 2, function* (E) { yield E.say('An island at the edge of the northern ice. That river is frozen solid - and someone has strung a rope up the falls at its head.', 'Kraden'); yield E.say('Frozen rivers are a puzzle of their own. Watch your footing.', 'Piers'); }, { once: 'kalt_seen' });
    }
  });
  Kit.home('kalt_hut', { name: 'Hut', w: 12, h: 10, floor: 'floor_wood', wall: 'wall_timber', back: { map: 'kalt', x: 13, y: 16 }, doorX: 6,
    furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bed', 3, 2], ['bed_foot', 3, 3], ['fireplace', 8, 1], ['table', 6, 5], ['chair', 5, 5], ['chair', 7, 5], ['pot', 10, 7], ['shelf', 9, 2]],
    npcs: [{ id: 'kalt_oldman', x: 5, y: 4, type: 'elder_m', name: 'Old Man', text: "If you want to cross the glaciers of the Northern Sea, you'll need magma balls... They come from volcanoes, but the best place to get them is Magma Rock, to the south.", mind: "(The people of Loho have a legendary weapon called a cannon that fires magma balls. That's supposed to be how they crossed the frozen wastes, but it sounds like a tall tale.)" },
      { id: 'kalt_oldwoman', x: 8, y: 6, type: 'elder_f', name: 'Old Woman', text: 'A long time ago, we used to trade with a village named Prox to the north of us. But the sea freezes in winter, and over time, it just became impossible to get there.', mind: '(The Northern Sea is thick with icebergs in the winter. They can sink a boat in an instant!)' }] });

  // ====================== Gondowan Settlement ======================
  const GL = {
    '.': 'grass', 'p': 'path', 'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'G': { ground: 'grass', obj: 'gravestone' }, 'j': { ground: 'grass', obj: 'pot' },
    'x': { ground: 'grass', obj: 'fence' }, 'L': { ground: 'grass', obj: 'ladder', walk: true }, 'S': { ground: 'grass', obj: 'stump' }, 'f': 'flowers'
  };
  const GS = grid(23, 22, '.');
  fill(GS, 0, 0, 3, 21, 'T'); fill(GS, 12, 0, 22, 1, 'T'); fill(GS, 20, 2, 22, 9, 'T'); fill(GS, 0, 0, 11, 0, 'T');
  for (const [x, y] of [[9, 2], [12, 15], [10, 18], [19, 20], [21, 12], [21, 20]]) GS[y][x] = 'T';
  fill(GS, 9, 12, 11, 21, 'p'); fill(GS, 9, 11, 16, 11, 'p'); fill(GS, 16, 11, 17, 13, 'p'); fill(GS, 6, 4, 8, 11, 'p');   // the paths
  fill(GS, 16, 2, 19, 9, '#'); fill(GS, 17, 3, 18, 7, '.'); GS[8][17] = 'L'; GS[9][17] = 'L'; GS[3][17] = 'S'; GS[6][18] = 'S';   // the stumps' terrace and its ladder
  fill(GS, 14, 13, 21, 19, '#'); fill(GS, 15, 14, 20, 18, '.'); GS[13][17] = '.';   // the graves' plateau, open at the top where the path comes
  for (const [x, y] of [[16, 14], [19, 14], [18, 16], [20, 17], [16, 18], [19, 18]]) GS[y][x] = 'G';
  fill(GS, 8, 3, 11, 3, 'x'); fill(GS, 4, 14, 4, 19, 'x'); fill(GS, 5, 19, 8, 19, 'x');   // the fences
  for (const [x, y] of [[6, 14], [7, 14], [6, 16], [8, 16], [7, 17], [5, 18], [8, 15]]) GS[y][x] = 'b';   // the garden's bushes; the leftmost is the one Cyclone lifts
  GS[9][16] = 'j'; GS[10][16] = 'j'; GS[13][6] = 'f'; GS[2][14] = 'f';
  defineMap('gondowan_settlement', {
    name: 'Gondowan Settlement', w: 23, h: 22, base: 'grass', music: 'town', bg: 'grass', entry: { x: 10, y: 20 }, retreat: { map: 'world_tla', x: 107, y: 135, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(GS), GL, { cliff: '#', set: 'brownrock', faces: 1 });
      M.exit(9, 21, 3, 1, 'world_tla', 107, 135, DIR.DOWN); M.walkable(9, 21, 3, 1);
      M.house(8, 5, 4, 5, 'roof_tile_blue', { wall: 'wall_mud', to: 'gondowan_house1', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(12, 6, 4, 5, 'roof_tile_blue', { wall: 'wall_mud', to: 'gondowan_house2', tx: 6, ty: 8, windows: false, doorX: 1 });
      // the leftmost bush: Cyclone lifts it off a stair down to the cellar with the Star Dust
      M.object('leaves', 5, 15, { id: 'gs_bush', onClear: function* (E) { const Mp = G.field.map; persistGround(Mp, 5, 15, 'stairs_down'); persistWalkable(Mp, 5, 15); Mp.finalize(); G.set('gs_stair_found'); Audio.sfx('item'); yield E.say('Under the bush: a stair, cut into the earth and hidden away!', 'Sheba'); } });
      M.exit(5, 15, 1, 1, 'gondowan_cellar', 4, 1, DIR.DOWN, { stairs: true, cond: () => !!G.flag('gs_stair_found') });
      M.npc('gs_man', 12, 13, { type: 'villager_m', name: 'Man', move: 'wander', script: function* (E) { const r = yield* E.ask("Don't tell me, you're here to solve the riddle of the rock!", 'Man', ['Yes', 'No']); if (r === 0) yield E.say("I don't want to scare you but, I think you should reconsider. Even the warriors who survive to make it back do so by the skin of their teeth.", 'Man'); else yield E.say("Just passing through? Here's some advice for you: Steer clear of the mountain. I don't know what kind of treasure's up there, but it's not worth your life.", 'Man'); }, mind: "(The mountain is called Magma Rock, and it's cursed... No one's supposed to go up there.)" });
      M.npc('gs_woman', 7, 9, { type: 'villager_f', name: 'Woman', text: "I hear Kibombo has finally chosen a new witch doctor. Maybe now, they'll calm down and not be so aggressive...", mind: "(We're lucky the river floods over every season. That's what keeps the Kibombo away. We were fine this year, though. They still hadn't chosen a new witch doctor, so they stayed put.)" });
      M.npc('gs_boy', 18, 4, { type: 'child_m', name: 'Boy', move: 'wander', text: "There was a giant explosion on the rock the other night... I couldn't get back to sleep at all.", mind: "(The explosions within Magma Rock are called magma balls. They're formed natural near the mouth of the volcano. Scary, huh?)" });
      M.sign(12, 19, 'Gondowan Settlement. Magma Rock stands to the north: keep away from it.');
      M.trigger(9, 19, 3, 2, function* (E) { yield E.say('A settlement in the shadow of Magma Rock. Its people would sooner forget the mountain, I think.', 'Kraden'); }, { once: 'gs_seen' });
    }
  });
  Kit.home('gondowan_house1', { name: 'Home', back: { map: 'gondowan_settlement', x: 10, y: 10 }, npcs: [{ id: 'gs_h1', x: 4, y: 5, type: 'elder_m', text: "My grandfather's grandfather buried the first of us up on the hill. We stay because they stay.", mind: "(The rock rumbles more each year. One day it will not be a hill we bury them on.)" }] });
  Kit.home('gondowan_house2', { name: 'Home', back: { map: 'gondowan_settlement', x: 13, y: 11 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['table', 5, 4], ['chair', 4, 4], ['pot', 10, 7], ['fireplace', 8, 1], ['shelf', 3, 2]], npcs: [{ id: 'gs_h2', x: 7, y: 5, type: 'villager_f', text: 'Nobody digs in the garden. My mother said something old was buried under it, and it was better left alone.', mind: '(A stair, she said. To what, she never told me.)' }] });
  Kit.interior('gondowan_cellar', { name: 'Cellar', w: 9, h: 7, floor: 'floor_stone', wall: 'wall_in_stone', back: null, doorX: -1, furn: [['barrel', 1, 2], ['pot', 7, 2]], chests: [[6, 3, 'Star Dust', 1]],
    stairs: { x: 4, y: 1, to: 'gondowan_settlement', tx: 5, ty: 16 } });

  // ====================== Hesperia Settlement ======================
  // the sandstone terraces: H0 the ground with the palms, H1 the terrace up the left vine, the ledge above it up the vine
  // Growth makes; the crate comes down the two gaps to the ground and goes right into the pit at the pen's wall
  const HL = {
    's': 'sand', 'f': 'flowers', 'P': { ground: 'sand', obj: 'palm' }, 'j': { ground: 'sand', obj: 'pot' }, 'S': { ground: 'sand', obj: 'stump' }, 'B': { ground: 'sand', obj: 'barrel' },
    'W': { ground: 'sand', obj: 'wall_sandbrick' }, 'w': 'sand_step', 'p': 'pit', 'h': 'sand_gap',
    'v': { ground: 'sand', obj: 'vineladder', walk: true }, 'o': { ground: 'sand', obj: 'rock_sand' }, 'g': 'grass'
  };
  const H = grid(31, 32, '#'); fill(H, 2, 0, 28, 8, 'g');   // the grassland beyond the mesa's top, out of reach
  fill(H, 2, 24, 28, 31, 's');   // H0: the ground
  fill(H, 3, 16, 27, 21, 's'); fill(H, 3, 22, 27, 23, '#'); fill(H, 8, 22, 8, 23, 'v'); H[22][4] = 'h'; fill(H, 3, 13, 27, 15, '#');   // H1: the terrace, its cliff down with the vine and the second gap, the cliff above it
  fill(H, 3, 10, 8, 13, 's'); fill(H, 3, 14, 8, 14, 'W'); H[14][4] = 'h'; H[14][7] = 'h'; H[14][6] = 's'; H[15][6] = '#';   // the ledge, its parapet with the two gaps (the crate goes down the left one), the vine's top
  fill(H, 9, 9, 27, 12, '#');   // the high ground behind, out of reach
  fill(H, 11, 24, 15, 28, 'W'); fill(H, 12, 25, 14, 27, 's'); H[25][11] = 'w'; H[25][10] = 'p';   // the pen: Tinder inside, the low step in its west wall, the pit before it, the back room's door in the cliff behind
  fill(H, 22, 16, 25, 16, 'f'); fill(H, 24, 26, 27, 26, 'f'); H[17][26] = 'j'; H[18][26] = 'j'; H[27][27] = 'B'; H[18][3] = 'S';
  for (const [x, y] of [[4, 27], [6, 30], [19, 29], [22, 30], [25, 29], [27, 30], [17, 25], [21, 27]]) H[y][x] = 'P';
  for (const [x, y] of [[20, 19], [12, 18], [3, 30], [26, 20]]) H[y][x] = 'o';
  fill(H, 14, 31, 16, 31, 's');
  defineMap('hesperia_settlement', {
    name: 'Hesperia Settlement', w: 31, h: 32, base: 'void', music: 'town', bg: 'sand', entry: { x: 15, y: 30 }, retreat: { map: 'world_tla', x: 37, y: 100, dir: DIR.DOWN },
    fall: (x, y) => ({ '4,14': { map: 'hesperia_settlement', x: 4, y: 17 }, '7,14': { map: 'hesperia_settlement', x: 7, y: 17 }, '4,22': { map: 'hesperia_settlement', x: 4, y: 25 } })[x + ',' + y] || null,
    build(M) {
      M.paint(0, 0, strs(H), HL, { cliff: '#', set: 'sandcliff', faces: 2 });
      M.exit(14, 31, 3, 1, 'world_tla', 37, 100, DIR.DOWN); M.walkable(14, 31, 3, 1);
      M.house(11, 13, 5, 3, 'roof_thatch', { wall: 'wall_sandbrick', to: 'hesperia_home', tx: 6, ty: 8, windows: false, doorX: 2, wallRows: 1 });
      M.setObj(13, 24, 'door_cave'); M.walkable(13, 24); M.set(13, 24, 'sand'); M.exit(13, 24, 1, 1, 'hesperia_back', 4, 5, DIR.UP, { door: true });
      // the plant at the foot of the ledge: Growth climbs it
      M.object('sprout', 6, 16, { id: 'hs_sprout', onGrow: function* (E) { yield E.say('The vine shoots up the rock to the ledge above.', 'Sheba'); } });
      // the crate on the ledge: to you, down the leftmost gap, down again, and right into the pit
      M.object('crate', 4, 11, { id: 'hs_crate', sinkTile: 'crate_sunk', onLand: () => function* (E) { yield E.say('The crate drops through the gap and lands with a thud on the terrace below.'); },
        onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'hs_crate'); if (o && o.gone) { G.set('hs_crate_placed'); yield E.say("The crate settles into the pit, flush with the ground. A step - and the wall is low enough here to climb!", 'Jenna'); } } });
      M.djinni('Tinder', 13, 26, { fight: false });
      M.npc('hs_man', 16, 19, { type: 'villager_m', name: 'Man', move: 'wander', text: 'You must be very brave to come all the way here by boat.', mind: '(For a continent as desolate as this one, there sure have been a lot of boats here lately.)' });
      M.npc('hs_boy', 20, 27, { type: 'child_m', name: 'Boy', move: 'wander', text: 'The people of Shaman Village are very wary of strangers. Be careful if you ever meet them.', mind: '(Long ago, Shaman was ravaged by outsiders. It was terrible. From that day on, they simply have not trusted strangers in their village.)' });
      M.sign(18, 30, 'Hesperia Settlement. The terraces are ours; the high ground is the wind\'s.');
      M.trigger(14, 29, 3, 2, function* (E) { yield E.say('People, living in the very rock of Hesperia. There is a village on this continent, the sailors say - Shaman Village, up one of the rivers.', 'Kraden'); }, { once: 'hs_seen' });
    }
  });
  Kit.home('hesperia_home', { name: 'Home', back: { map: 'hesperia_settlement', x: 13, y: 16 }, floor: 'floor_stone', wall: 'wall_sandbrick', npcs: [{ id: 'hs_woman', x: 5, y: 5, type: 'villager_f', name: 'Woman', text: "There's a place called Shaman Village in the middle of the continent. Supposedly, one of the rivers leads to it. I have no idea which one, though.", mind: "(I think there's a cave at the end of the river. That's the way into Shaman Village. I wonder if I should tell them what the legends say... Nah, they look like a smart group.)" }] });
  Kit.interior('hesperia_back', { name: 'Back Room', w: 9, h: 7, floor: 'cave_sand', wall: 'wall_sandbrick', back: { map: 'hesperia_settlement', x: 13, y: 25 }, doorX: 4, furn: [['pot', 1, 2], ['barrel', 7, 2]], chests: [[3, 2, 'Coins', 166, { coins: 166 }]] });
}
