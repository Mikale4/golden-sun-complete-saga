// ---------- Apojii Islands ----------
// The easternmost island of the Eastern Sea, a stone's throw from Gaia Falls: a village of thatched huts on the
// sand, palms all round, the spring in the middle with the Aqua Stone at its head. Per the guide: the inn (56
// coins), the merchant with the Dragon Axe, Douse on the Aqua Stone (rain falls, and across the sea the five moai
// of Aqua Rock move aside); the 182 coins in the brown jar at the south end, 32 coins in the upper-right hut's
// barrel, Mint in the bush at the lower right, the Herb under the Aqua Stone's bushes; the beach a screen to the
// east (Bramble Seed in the bushes; Sand on the soft sand to pass under the rocks; the cascade down to the cave)
// and the cave where Whirlwind on the third patch of overgrowth opens the way to Haze, who joins for nothing.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'sand', 'g': 'grass', 'd': 'dirt', 'w': 'water', 's': 'sandsoft', 'S': 'lc_slide',
    't': { ground: 'sand', obj: 'palm' }, 'T': { ground: 'grass', obj: 'palm' }, 'b': { ground: 'grass', obj: 'bush' }, 'B': { ground: 'sand', obj: 'bush' }, 'o': { ground: 'sand', obj: 'rock_small' },
    'p': { ground: 'sand', obj: 'pot' }, 'k': { ground: 'sand', obj: 'crate' }, 'f': { ground: 'sand', obj: 'fence' }, 'c': 'lc_floor', 'D': { ground: 'sand', obj: 'lc_door' }
  };
  const WORLD = { map: 'world_tla', x: 295, y: 166, dir: DIR.DOWN };
  // ====================== the village ======================
  const A = grid(30, 28, '.');
  fill(A, 0, 24, 29, 27, 'w'); fill(A, 0, 23, 29, 23, '.');   // the sea along the south
  fill(A, 0, 0, 29, 0, 't'); fill(A, 0, 1, 0, 22, 't'); fill(A, 29, 1, 29, 22, 't');   // the palms round the edge
  for (const [x, y] of [[1, 1], [2, 2], [1, 5], [27, 1], [28, 2], [28, 5], [1, 10], [28, 10], [1, 18], [2, 21], [28, 21], [27, 18], [12, 1], [18, 1], [6, 22], [23, 22], [15, 2]]) A[y][x] = 't';
  fill(A, 4, 4, 25, 20, 'g');   // the green heart of the village
  fill(A, 13, 3, 16, 3, 'g'); fill(A, 14, 21, 15, 22, 'd');   // the way down to the beach
  for (const [x, y] of [[5, 5], [24, 5], [5, 19], [24, 19], [9, 8], [20, 8], [9, 16], [20, 16]]) A[y][x] = 'T';
  // the spring: a pool with the Aqua Stone at its head, on its own bank of stone
  fill(A, 12, 10, 17, 13, 'w'); fill(A, 11, 9, 18, 9, 'd'); fill(A, 11, 14, 18, 14, 'd'); fill(A, 11, 10, 11, 13, 'd'); fill(A, 18, 10, 18, 13, 'd');
  for (const [x, y] of [[7, 12], [22, 12], [12, 16], [17, 16], [25, 17], [24, 17]]) A[y][x] = 'b';   // the bushes: the ones under the stone, the Mint's at the lower right
  A[22][3] = 'p'; A[22][4] = 'p';   // the jars at the south end by the way in
  A[21][26] = 'k'; A[22][27] = 'o'; A[3][3] = 'o'; A[3][26] = 'o';
  defineMap('apojii', {
    name: 'Apojii Islands', w: 30, h: 28, base: 'sand', music: 'apojii', bg: 'sand', entry: { x: 14, y: 22 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(A), LEG);
      // the beach landing (the ship) south, the way east to the far beach
      M.walkable(13, 23, 4, 1); M.exit(13, 23, 4, 1, 'world_tla', 295, 166, DIR.DOWN);
      M.setObj(29, 11, null); M.setObj(29, 12, null); M.walkable(29, 11, 1, 2); M.exit(29, 11, 1, 2, 'apojii_east', 1, 11, DIR.RIGHT);
      // the huts: the inn at the top left, the merchant at the top right, the healer, and the homes
      M.house(4, 1, 6, 5, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false, doorX: 3 });
      M.house(20, 1, 6, 5, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_shop', tx: 6, ty: 6, sign: 'shop_sign', windows: false, doorX: 2 });
      M.house(22, 8, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_house1', tx: 5, ty: 7, windows: false, doorX: 2 });   // the upper-right hut: the barrel with 32 coins
      M.house(3, 8, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_sanctum', tx: 6, ty: 7, sign: 'sanctum_sign', windows: false, doorX: 2 });
      M.house(3, 14, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_house2', tx: 5, ty: 7, windows: false, doorX: 2 });
      M.house(22, 14, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_house3', tx: 5, ty: 7, windows: false, doorX: 2 });
      M.house(12, 17, 6, 4, 'roof_thatch', { wall: 'wall_mud', to: 'apojii_house4', tx: 5, ty: 7, windows: false, doorX: 3 });
      // the Aqua Stone at the head of the spring: Douse wakes it, and the rain comes
      M.object('waterstone', 14, 9, { id: 'apo_stone', onDouse: T3.apojiiStone });
      M.sign(17, 9, 'The Aqua Stone. The islanders say it is the key to Aqua Island - that it wakes when it is made damp, but not with spring water.');
      // the man who stares at the stone, the wife who is fed up with him, and the others of the script
      M.npc('apo_004', 15, 15, { type: 'elder_m', dir: DIR.UP, text: 'On Aqua Island, you can see the guardian moai. Because of the moai, no one can climb the craggy mountain.', mind: "(Why would anyone build a guardian statue out on Aqua Island? What's to guard?)" });
      M.npc('apo_001', 14, 21, { type: 'villager_m', dir: DIR.DOWN, text: "This is Apojii, the easternmost island in the Eastern Sea! Wherever you're from, you've come a long way. You must be here to see Gaia Falls!", mind: '(Looking over Gaia Falls really makes you feel small and insignificant.)' });
      M.npc('apo_002', 8, 20, { type: 'tribal', move: 'wander', text: "I don't know what brings you to Apojii, but you'd better not be planning anything stupid.", mind: '(Apojii has so many nice sights... Gaia Falls to the east, and Aqua Rock to the south.)' });
      M.npc('apo_003', 26, 21, { type: 'sailor', dir: DIR.LEFT, text: "Whatever you do, don't sail out to the eastern edge of the sea... That's where the world ends. No one knows where the falls go, but you won't come back!", mind: "(The currents near Apojii run swiftly because we're so near to Gaia Falls.)" });
      M.npc('apo_005', 20, 6, { type: 'villager_f', move: 'wander', text: 'Have you any idea what it\'s like living on the edge of the world? One wrong step, and down you go!', mind: "(Well, at least Gaia Falls will put an end to a few silly arguments. After all, if it's got an edge and you can fall off it, the world is clearly FLAT!)" });
      M.npc('apo_006', 26, 12, { type: 'elder_f', dir: DIR.RIGHT, text: 'The huge waterfall at the edge of the world is known as Gaia Falls.', mind: "(All of the ocean's water is spilling over Gaia Falls... Where does it all go? And more importantly, what happens when all the water's gone over the edge?)" });
      M.npc('apo_007', 10, 12, { type: 'villager_m', dir: DIR.RIGHT, script: function* (E) { if (G.flag('apojii_stone_doused')) { yield E.say("What... What just happened? That rock couldn't have heard my wishes... That's impossible! It's got to be. Well, OK then... Maybe we should try putting some more of our wishes into the rock."); return; } yield E.say("If there's nothing on Aqua Island, then what are those moai guarding, anyway?"); }, mind: "(Aqua Rock must be the secret hidden on Aqua Island. One day, I'll have to scale its peak.)" });
      M.npc('apo_008', 18, 19, { type: 'child_m', move: 'wander', text: 'Do you think if you fall off of Gaia Falls that you keep on falling forever and ever?', mind: "(I wonder where I'd be if I fell off Gaia Falls... I'd like to know, but I don't want to find out firsthand!)" });
      M.npc('apo_009', 7, 6, { type: 'child_m', move: 'wander', text: 'When they come of age, all the men of Apojii go to Aqua Island. Will I, too?', mind: "(Aqua Island is supposed to be dangerous, but that's why I want to go!)" });
      M.npc('apo_013', 21, 20, { type: 'child_f', move: 'wander', script: function* (E) { if (G.party.djinnFound.includes('Haze')) { yield E.say('Hey, mister! Did you know that all the kids are calling you their hero?'); return; } yield E.say("I'm not allowed to go into the ocean."); }, mind: "(It's stupid that I'm not allowed to swim just because Dad doesn't know how... Someday, I'll show him... I'll show them all!)" });
      M.trigger(13, 21, 4, 2, function* (E) { yield E.say("Apojii. The last island before the edge of the world, and Gaia Falls beyond it.", 'Piers'); yield E.say('Aqua Rock is on the island to the south. The islanders say a ring of moai keeps everyone off it... and that the stone by their spring is the key to them.', 'Kraden'); }, { once: 'apojii_seen' });
    }
  });
  // the rain, and the moai across the sea
  T3.apojiiStone = function* (E) {
    if (G.flag('apojii_stone_doused')) return;
    G.set('apojii_stone_doused'); Audio.sfx('water'); Engine.doFlash(12, '#80c0ff');
    yield E.say('The stone drinks the water and shines - and out of a clear sky, rain begins to fall!');
    yield 30; Engine.doShake(8);
    yield E.say('A current of light runs from the stone, down the spring and out across the sea toward the island to the south...');
    yield E.say('Something answered it. Far off, on Aqua Island - I would swear the ground moved.', 'Sheba');
    yield E.say('The moai. If the stone is the key the islanders speak of, the way onto Aqua Rock is open. Let us go and see.', 'Kraden');
  };
  Kit.inn('apojii_inn', { name: 'Apojii Inn', price: 56, back: { map: 'apojii', x: 7, y: 6 }, npcs: [{ id: 'apojii_inn_keeper', x: 3, y: 2, type: 'merchant', inn: 56, name: 'Innkeeper', text: "Wow! You look just like the guy who showed up in the fancy boat. He slept for a long time... He must've had a really long trip.", mind: "(I'm sure that boat is quite comfortable... But no matter how nice your boat is, you can't beat sleeping in a nice, dry bed on land.)" },
    { id: 'apojii_inn_old', x: 8, y: 4, type: 'elder_f', script: function* (E) { const r = yield* E.ask("You guys aren't the warriors who came in that boat, are you?", 'Old Woman'); if (r === 0) yield E.say("Hmm... A while ago, some others came in a boat much like yours... I'm sure back on the mainland that those boats are all very popular, aren't they?", 'Old Woman'); else yield E.say("It's not nice to tease an old lady! If that's not your boat, then how did you get here?", 'Old Woman'); }, mind: '(Those guys on the other boat must have been pretty well off...)' }] });
  Kit.shop('apojii_shop', { name: 'Apojii General Store', shop: 'apojii_item', back: { map: 'apojii', x: 22, y: 6 }, npcs: [{ id: 'apojii_shop_keeper', x: 5, y: 2, type: 'merchant', shop: 'apojii_item', name: 'Merchant', dir: DIR.DOWN, text: "It'd be nice if we could import some items that our visitors would like.", mind: "(No one ships to Garapas so I wonder if wares are scarce. On the other hand, I suppose some wares are unique to Garapas.)" }] });
  Kit.sanctum('apojii_sanctum', { name: 'Apojii Sanctum', back: { map: 'apojii', x: 5, y: 12 }, npcs: [{ id: 'apojii_sanctum_priest', x: 6, y: 4, type: 'priest', sanctum: true, name: 'Healer', text: 'This little island must seem quite boring to you sophisticated mainlander types. But we have our share of hardships and trials.', mind: "(Whenever visitors come out, the islanders start to complain about their lives. But they don't realize that they live better here than they ever could in Osenia.)" },
    { id: 'apo_s007', x: 2, y: 6, type: 'villager_m', text: "I'd love to go to the mainland. I want to go somewhere without any ocean!", mind: "(I wonder what it's like, standing in the middle of a vast ocean of grass or sand.)" }, { id: 'apo_s008', x: 9, y: 6, type: 'villager_f', text: "I'm sick of living on this boring island paradise! Ah! Does thinking that make me a bad person?", mind: "(Maybe they'll take me with them if I ask for a job! I can swab a mean deck!)" }] });
  Kit.home('apojii_house1', { back: { map: 'apojii', x: 24, y: 12 }, npcs: [{ id: 'apo_h004', x: 4, y: 4, type: 'elder_f', text: 'He\'s too old to try now, but my husband used to dream of scaling Aqua Rock.', mind: '(He always wanted to climb to the peak of the mountain on Aqua Rock. But he spent all his time studying that Aqua Stone instead. I always wondered why.)' }, { id: 'apo_h005', x: 7, y: 5, type: 'elder_m', text: 'That old Aqua Stone is supposed to be the key to getting onto Aqua Island.', mind: "(You unlock the Aqua Stone by making it damp, but splashing spring water on it won't work.)" }] });
  Kit.home('apojii_house2', { back: { map: 'apojii', x: 5, y: 18 }, npcs: [{ id: 'apo_h009', x: 4, y: 4, type: 'villager_f', text: "There's this guy in town who spends his time at the spring, staring at the Aqua Stone.", mind: "(I just wish he'd spend some time at home. I'm fed up with his nonsense!)" }, { id: 'apo_h010', x: 7, y: 5, type: 'child_f', text: 'Why does my father keep staring at that rock every day?', mind: "(I can't ever tell what kind of mood Mom and Dad are in. At least they're not fighting.)" }] });
  Kit.home('apojii_house3', { back: { map: 'apojii', x: 24, y: 18 }, npcs: [{ id: 'apo_h011', x: 4, y: 4, type: 'villager_m', text: 'I absolutely refuse to let my son swim in the ocean until he is an adult.', mind: "(I sink like a rock. It always embarrasses my son to see me try to swim. I'm afraid he's no better than I am, but he still wants to practice and get better!)" }, { id: 'apo_h012', x: 7, y: 5, type: 'villager_f', text: "The currents around Apojii are just too strong to let children swim on their own. They're too strong for a lot of the adults, too... They can just wash a person away!", mind: "(Poor boy... His father sinks like a rock, and I know it's genetic. So he's not allowed to swim!)" }] });
  Kit.home('apojii_house4', { back: { map: 'apojii', x: 15, y: 21 }, npcs: [{ id: 'apo_h014', x: 5, y: 4, type: 'child_m', script: function* (E) { if (G.party.djinnFound.includes('Haze')) { yield E.say('Wow! You swam in the ocean and survived the currents! All the kids are talking about it!', 'Boy'); return; } yield E.say("I'm not allowed to go into the ocean.", 'Boy'); }, mind: "(Someday, I'll show him... I'll show them all!)" }] });
  // ====================== the beach to the east ======================
  // soft sand along the shore; the rocks across it that only Sand passes under; the cascade at the far end, down to
  // the ledge with the cave's mouth
  const B = grid(28, 18, '.');
  fill(B, 0, 0, 27, 0, 't'); fill(B, 0, 1, 0, 9, 't'); fill(B, 1, 1, 27, 6, 'g'); fill(B, 1, 1, 27, 1, 'T');
  fill(B, 0, 14, 27, 17, 'w'); fill(B, 1, 12, 27, 13, 's');   // the sea, the soft sand along it
  fill(B, 14, 7, 27, 11, 'R'); fill(B, 14, 12, 15, 13, 'R');   // the rocks: a headland down to the water, its foot on the soft sand
  fill(B, 16, 12, 22, 13, 's'); fill(B, 23, 12, 27, 13, '.'); fill(B, 23, 10, 27, 11, '.'); B[11][23] = 'R'; B[10][23] = 'R'; fill(B, 24, 7, 27, 9, 'R');
  B[12][27] = 'S';   // the cascade: off the end of the beach and down
  fill(B, 20, 15, 27, 17, '.'); fill(B, 20, 14, 27, 14, '.'); B[15][25] = 'D';   // the ledge below the fall, the cave's mouth in the rock
  fill(B, 20, 14, 27, 14, 'R'); B[14][27] = '.';
  for (const [x, y] of [[4, 4], [8, 3], [12, 5], [4, 9], [9, 10]]) B[y][x] = 'b'; for (const [x, y] of [[3, 7], [7, 8], [11, 8]]) B[y][x] = 'B';
  defineMap('apojii_east', {
    name: 'Apojii Islands - Beach', w: 28, h: 18, base: 'sand', music: 'apojii', bg: 'sand', entry: { x: 1, y: 11 }, retreat: WORLD,
    fall: (x, y) => ({ map: 'apojii_east', x: 27, y: 15 }),
    build(M) {
      M.paint(0, 0, strs(B), LEG, { cliff: 'R', set: 'sandcliff', faces: 1 });
      for (const [x, y] of [[14, 12], [15, 12], [14, 13], [15, 13]]) M.set(x, y, 'sandsoft');   // the rocks stand on the soft sand: Sand goes under them
      M.walkable(0, 10, 1, 2); M.setObj(0, 10, null); M.setObj(0, 11, null); M.exit(0, 10, 1, 2, 'apojii', 28, 11, DIR.LEFT);
      M.exit(25, 15, 1, 1, 'apojii_cave', 2, 10, DIR.UP, { door: true });
      M.sign(2, 10, 'The beach runs east under the rocks to the edge of the world. Beyond the headland the sea falls away - Gaia Falls.');
      M.sign(24, 12, 'The end of the beach: the water pours over the edge here in a cascade, down onto a ledge below.');
      M.trigger(23, 10, 5, 4, function* (E) { yield E.say('The edge of the world. Gaia Falls, going down forever into the mist...', 'Jenna'); yield E.say('Do not stand so close to it, please.', 'Piers'); }, { once: 'gaia_falls_seen' });
    }
  });
  // ====================== the cave under the falls ======================
  const C = grid(22, 12, '#');
  fill(C, 2, 3, 19, 9, 'c'); C[10][2] = 'c'; C[11][2] = 'D';
  fill(C, 15, 1, 17, 2, 'c');   // the hidden passage behind the third overgrowth
  defineMap('apojii_cave', {
    name: 'Apojii Cave', w: 22, h: 12, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 2, y: 10 }, enc: [['Faery', 'Faery'], ["Man o' War"], ['Roc']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C), LEG, { cliff: '#', set: 'greyrock', faces: 1 });
      M.set(2, 11, 'lc_floor'); M.setObj(2, 11, 'lc_door'); M.exit(2, 11, 1, 1, 'apojii_east', 25, 16, DIR.DOWN, { door: true });
      // three patches of overgrowth on the north wall: the first two hide nothing, the third the passage
      M.set(6, 2, 'lc_floor'); M.object('vines', 6, 2, { id: 'apc_ivy1', reveal: null, onClear: function* (E) { yield E.say('Bare rock behind it.'); } });
      M.set(11, 2, 'lc_floor'); M.object('vines', 11, 2, { id: 'apc_ivy2', reveal: null, onClear: function* (E) { yield E.say('Bare rock behind it.'); } });
      M.block(6, 2); M.block(11, 2);
      M.object('vines', 16, 2, { id: 'apc_ivy3', reveal: null, onClear: function* (E) { yield E.say('The overgrowth tears away, and behind it the wall opens: a passage, and a little light at the end of it.'); } });
      M.exit(16, 1, 1, 1, 'apojii_cave_2', 5, 8, DIR.UP, { cond: () => !M.objects.find(o => o.id === 'apc_ivy3' && !o.gone) });
      M.sign(3, 4, 'Overgrowth hangs on the north wall in three places. The sea roars somewhere above.');
    }
  });
  const C2 = grid(12, 10, '#');
  fill(C2, 2, 2, 9, 7, 'c'); C2[8][5] = 'c'; C2[9][5] = 'c';
  defineMap('apojii_cave_2', {
    name: 'Apojii Cave', w: 12, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 5, y: 8 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C2), LEG, { cliff: '#', set: 'greyrock', faces: 1 });
      M.exit(5, 9, 1, 1, 'apojii_cave', 16, 3, DIR.DOWN);
      M.djinni('Haze', 5, 3, { fight: false });
    }
  });
}
