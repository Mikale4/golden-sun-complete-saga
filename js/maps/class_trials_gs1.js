// ---------- Golden Sun: where the class items are found ----------
// Ten of the twenty-two class items (js/data/class_items.js) belong to Isaac's journey. Four are taught by people who
// want a fight first (Tolo in Lunpa's inn, Dorian who plays Kalay's, Master Poi at Lama Temple, Brannock behind
// Tolbi's arena); five sit behind optional bosses in places of their own, each hung off a map the party already
// walks (the hunting grounds north of Kolima's forest, the wolves' den in Mogall's, the deep shaft under Altin's
// mine, the shrine off the Silk Road at Xian, Babi's workshop under Lalivero's reservoir); and the Crown of Sol waits
// under Sol Sanctum for whoever has found all twenty-eight Djinn - behind a colossus harder than Deadbeard.
// Each place also keeps one prize behind its own item's Psynergy, to be come back for.
'use strict';
{
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => typeof r === 'string' ? r : r.join(''));
  const CAVE = { '.': 'cave', ',': 'cave_pebbles', 'o': { ground: 'cave', obj: 'rock_small' }, 'p': 'pit', '~': 'water', 'L': { ground: 'cave', obj: 'ladder', walk: true } };
  const WOOD = { '.': 'grass', 'd': 'dirt', 'T': { ground: 'grass', obj: 'tree' }, 'b': 'grass', '~': 'water', 'p': 'pit' };   // 'b': where a bush (a leaves object) stands
  const STONE = { '.': 'floor_stone', ',': 'floor_tile', '~': 'water', 'p': 'pit' };
  // a map the party already walks gets a way into the new place (a door on a wall) or somebody new standing in it
  // (idempotent: the test kit re-runs this file; each host keeps one list of this file's additions, replaced on a re-run)
  for (const def of Object.values(MAPS)) if (def._classPatches && def._classPatches.gs1) def._classPatches.gs1 = [];
  const patch = (id, fn) => { const def = MAPS[id]; if (!def) { console.warn('class trials: no host map', id); return; } if (!def._classPatches) { const orig = def.build; def._classPatches = {}; def.build = function (M) { if (orig) orig.call(this, M); for (const list of Object.values(def._classPatches)) for (const f of list) f(M); }; } (def._classPatches.gs1 = def._classPatches.gs1 || []).push(fn); };
  const caveDoor = (M, x, y, to, tx, ty, opts) => { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, Object.assign({ door: true }, opts || {})); };
  const back = (M, x, y, w, to, tx, ty, dir) => { M.walkable(x, y, w, 1); M.exit(x, y, w, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir); };
  // the prize: a boss falls, and the class item is the party's
  const award = function* (E, item, line) { Audio.sfx('levelup'); Engine.doFlash(10, '#ffe080'); yield E.give(item); if (line) yield E.say(line); };

  // ====================== Bilibin Hunting Grounds (the Hunter's Talisman) ======================
  // north of Kolima Forest: a hunters' clearing where a boar the size of a cart has run the hunters off. Bushes to
  // cut, a stream with a hook post on the far side (Grapple, later) and a beast asleep across the side path (Serenade, later).
  const HG = strs([
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T.............bb.......T',
    'T.............TT..TT...T',
    'T..~~~~.......TT....TTTT',
    'T..~~~~~.......T.......T',
    'T...~~~~~......T....TTTT',
    'T....~~~~~.....T.......T',
    'T.....~~~~~....T.......T',
    'T......~~~~~...T.......T',
    'T.......~~~~~..TT......T',
    'T........~~~~~.TTTTTTTTT',
    'T.........~~~~~........T',
    'T..........~~~~~.......T',
    'T...........~~~~~......T',
    'T............~~~~~.....T',
    'T.............~~~~~....T',
    'T..............~~~~~...T',
    'TTd.............~~~~~..T',
    'TTdTTTTTTTTTTTTTTTTTTTTT'
  ]);
  defineMap('hunt_grounds', {
    name: 'Bilibin Hunting Grounds', w: 24, h: 19, base: 'grass', music: 'forest', bg: 'forest', entry: { x: 2, y: 17 }, retreat: { map: 'kolima_forest_n', x: 27, y: 3, dir: DIR.DOWN },
    enc: [['Rat Soldier', 'Rat Soldier'], ['Spider', 'Drone Bee'], ['Mauler'], ['Creeper', 'Creeper']],
    build(M) {
      M.paint(0, 0, HG, WOOD);
      back(M, 2, 18, 1, 'kolima_forest_n', 27, 3, DIR.DOWN);
      // the boar's ground lies east, past the two bushes at the top; the stream is not crossed anywhere - except by a line to the post on the far bank (Grapple, later)
      M.object('leaves', 14, 1, { id: 'hg_bush1' }); M.object('leaves', 15, 1, { id: 'hg_bush2' });
      ClassExt.hookpost(M, 18, 13); ClassExt.hookpost(M, 10, 13); M.chest(20, 13, 'Mythril Silver', 1); ClassExt.lockedChest(M, 2, 2, 'Lucky Medal', 1);   /* a post on either bank: the line goes over and back */
      // the nook in the boar's ground: a bear asleep across it, and a chest behind (Serenade, later)
      ClassExt.sleeper(M, 20, 4, 'A bear sleeps across the way, and stirs when the party comes close. Nothing wakes it kindly.'); M.chest(21, 4, 'Vial', 1);
      M.chest(17, 8, 'Elixir', 1);
      M.boss('Tusked Mauler', 18, 6, { id: 'boss_mauler', done: 'mauler_done', script: STORY.tuskedMauler });
      M.trigger(1, 15, 3, 2, function* (E) { yield E.say("The hunters' clearing. Bilibin's hunters talk of a boar the size of a cart up here - and of the talisman its first hunter wore, lost with him.", 'Ivan'); }, { once: 'hg_seen' });
      M.sign(4, 16, 'Hunting grounds. The boar\'s ground is past the bushes at the top; the stream is not crossed here.');
    }
  });
  STORY.tuskedMauler = function* (E) {
    if (G.flag('mauler_done')) return;
    Audio.play('boss'); yield E.say("(A boar with tusks like scythes wheels round in the clearing. Round its neck, on a cord: a tusk carved into a talisman.)");
    yield E.say("The hunters' talisman! It took it off the man who wore it. Isaac - this is what they meant.", 'Ivan');
    const r = yield* E.battle(['Tusked Mauler'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('mauler_done'); E.despawn('boss_mauler');
    yield* award(E, "Hunter's Talisman", "(The talisman comes free of the cord. Isaac's party can take the Hunter's line now - and Grapple crosses to that hook post on the far bank.)");
  };
  patch('kolima_forest_n', (M) => { caveDoor(M, 27, 2, 'hunt_grounds', 2, 17); M.setObj(27, 2, 'door_tree'); M.sign(26, 3, 'North: the hunting grounds.'); });

  // ====================== Mogall Den (the Wolf Fang Pendant) ======================
  // a wolves' den under Mogall Forest: two caves. Tunnels only a four-legged thing fits through short-cut the second (Prowl, later).
  const MD1 = strs([
    '####################',
    '#......#...........#',
    '#..oo..#...o.......#',
    '#......#.......o...#',
    '#..o...#...........#',
    '####.###.###########',
    '#........#.........#',
    '#..o.....##...#....#',
    '#.........####.....#',
    '#...o..............#',
    '#.......o....o.....#',
    '#########.##########',
    '#........,.........#',
    '#..................#',
    '####################'
  ]);
  defineMap('mogall_den', {
    name: 'Mogall Den', w: 20, h: 15, base: 'void', music: 'cave', bg: 'cave', indoor: true, entry: { x: 9, y: 13 }, retreat: { map: 'mogall', x: 14, y: 5, dir: DIR.DOWN },
    enc: [['Dread Hound'], ['Dread Hound', 'Rat Fighter'], ['Bandit']],
    build(M) {
      M.paint(0, 0, MD1, CAVE, { cliff: '#', set: 'brownrock', faces: 2 });
      back(M, 8, 14, 3, 'mogall', 14, 5, DIR.DOWN);
      M.chest(2, 13, 'Antidote', 1);
      // the way up: overgrowth in the gap at the top of the middle chamber (Whirlwind), then the matriarch's cave
      M.object('leaves', 4, 5, { id: 'md_bush' });   // the overgrowth in the gap up to the matriarch's cave: Whirlwind
      ClassExt.tunnel(M, 8, 5);   // the wolves' own way into the east cave: a low tunnel (Prowl, later) - the chest in there is theirs
      M.chest(17, 2, 'Lucky Medal', 1); ClassExt.lockedChest(M, 1, 1, 'Cookie', 1);
      M.boss('Dire Wolf Matriarch', 3, 2, { id: 'boss_matriarch', done: 'matriarch_done', script: STORY.direMatriarch });
      M.trigger(8, 12, 3, 2, function* (E) { yield E.say('A den. The wolves that harry Mogall Forest come from here - and the biggest of them wears a fang on a cord, the men in Xian said, taken off a hunter it ate.', 'Garet'); }, { once: 'md_seen' });
    }
  });
  STORY.direMatriarch = function* (E) {
    if (G.flag('matriarch_done')) return;
    Audio.play('boss'); yield E.say("(The matriarch of the den rises, grey as slate, a fang on a cord about her neck. One of her pack comes with her.)");
    const r = yield* E.battle(['Dire Wolf Matriarch', 'Dread Hound'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('matriarch_done'); E.despawn('boss_matriarch');
    yield* award(E, 'Wolf Fang Pendant', "(The fang on its cord. Whoever wears it runs with the pack: the Wolf line, and Prowl for the low tunnels.)");
  };
  patch('mogall', (M) => { caveDoor(M, 14, 4, 'mogall_den', 9, 13); });

  // ====================== Altin Deep Shaft (the Miner's Lantern) ======================
  // below the mine's deepest gallery: a shaft the miners closed when something began to walk in it. Dark, and darker
  // the deeper it goes; a hook post over a chasm (Grapple, later) and the Ore Golem at the bottom.
  const AS = strs([
    '######################',
    '#........ppp.........#',
    '#.o......ppp.......o.#',
    '#........ppp.........#',
    '#..##.##.ppp####.####',
    '#..#...#.......#...#.#',
    '#..#.o.#.......#.o.#.#',
    '#..#####.......#####.#',
    '#....................#',
    '#........o...........#',
    '##########.###########',
    '#....................#',
    '#..o.........o.......#',
    '#..........,.........#',
    '#....................#',
    '##########.###########',
    '#........L...........#',
    '######################'
  ]);
  defineMap('altin_shaft', {
    name: 'Altin Deep Shaft', w: 22, h: 18, base: 'void', music: 'cave', bg: 'cave', indoor: true, dark: true, darkLevel: 0.9, entry: { x: 10, y: 16 }, retreat: { map: 'altin_mine_3', x: 10, y: 6, dir: DIR.DOWN },
    enc: [['Mole Mage', 'Mad Mole'], ['Golem'], ['Stone Soldier', 'Stone Soldier'], ['Gnome Wizard']],
    build(M) {
      M.paint(0, 0, AS, CAVE, { cliff: '#', set: 'greyrock', faces: 2 });
      back(M, 9, 17, 3, 'altin_mine_3', 10, 6, DIR.DOWN);
      M.chest(2, 16, 'Psy Crystal', 1);
      // the chasm in the top gallery: the hook post beyond it, and the golem's chest
      ClassExt.hookpost(M, 13, 1); ClassExt.hookpost(M, 7, 1); M.chest(14, 1, 'Mythril Silver', 1);
      M.object('boulder', 10, 9, { id: 'as_boulder' });   // Lift, at the middle gallery's stair
      M.chest(5, 6, 'Vial', 1); M.chest(17, 6, 'Lucky Medal', 1);
      M.boss('Ore Golem', 6, 2, { id: 'boss_ore_golem', done: 'ore_golem_done', script: STORY.oreGolem });
      M.trigger(9, 15, 3, 2, function* (E) { yield E.say("The deep shaft. The miners of Altin sealed it when something started walking down here in the dark - and the foreman's lantern went down with him.", 'Mia'); }, { once: 'as_seen' });
      M.sign(3, 13, 'DEEP SHAFT - CLOSED. Nothing below is worth the dark.');
    }
  });
  STORY.oreGolem = function* (E) {
    if (G.flag('ore_golem_done')) return;
    Audio.play('boss'); yield E.say("(Something the size of the gallery stands up out of the ore. A lantern hangs from one of its hands, still lit.)");
    const r = yield* E.battle(['Ore Golem'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('ore_golem_done'); E.despawn('boss_ore_golem');
    yield* award(E, "Miner's Lantern", "(The lantern, still burning. The Miner's line - and Lantern lights any dark place the party walks into.)");
  };
  patch('altin_mine_3', (M) => { caveDoor(M, 10, 5, 'altin_shaft', 10, 16); M.sign(11, 6, 'The deep shaft. CLOSED.'); });

  // ====================== Silk Road Shrine (the Assassin's Mask) ======================
  // a shrine off the road east of Xian, where the road's assassins once trained: a beam to Force, bars across the
  // inner alcove (Shadow Step, later), and the Shadow that still keeps the shrine.
  const SR = strs([
    '####################',
    '#..,,,,,,,,,,,,,,..#',
    '#..,............,..#',
    '#..,............,..#',
    '#..,....####....,..#',
    '#..,....#..#....,..#',
    '#..,....#.##....,..#',
    '#..,............,..#',
    '#########.##########',
    '#..................#',
    '#..................#',
    '#........,.........#',
    '####################'
  ]);
  defineMap('silk_shrine', {
    name: 'Silk Road Shrine', w: 20, h: 13, base: 'void', music: 'temple', bg: 'temple', indoor: true, entry: { x: 9, y: 11 }, retreat: { map: 'xian', x: 23, y: 4, dir: DIR.DOWN },
    enc: [['Thief', 'Thief'], ['Bandit'], ['Ghost Mage']],
    build(M) {
      M.paint(0, 0, SR, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 8, 12, 3, 'xian', 23, 4, DIR.DOWN);
      // a fallen beam wedged in the doorway of the ring: Force (Xian's own Psynergy) splinters it
      M.walkable(9, 8); M.object('log', 9, 8, { id: 'sr_beam', len: 1, horiz: true, onForce: function* (E) { const o = G.field.map.objects.find(x => x.id === 'sr_beam'); if (o) { o.gone = true; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: true }); } Engine.doShake(8); Audio.sfx('push'); yield E.say('The beam splinters under the blow, and the doorway is clear.'); } });
      ClassExt.bars(M, 9, 6); M.chest(9, 5, 'Ninja Garb', 1);   // the alcove's chest behind bars: a shadow's business
      M.chest(2, 2, 'Smoke Bomb', 1); M.chest(17, 2, 'Sleep Bomb', 1);
      M.boss('Shadow Assassin', 9, 2, { id: 'boss_shadow', done: 'shadow_done', script: STORY.shadowAssassin, look: npcLook('pirate', 7) });
      M.trigger(8, 10, 3, 2, function* (E) { yield E.say('A shrine off the Silk Road. The assassins of the road trained here once, Feizhi said - and one never left.', 'Ivan'); }, { once: 'sr_seen' });
    }
  });
  STORY.shadowAssassin = function* (E) {
    if (G.flag('shadow_done')) return;
    yield E.say("You walk into my shrine as if it were a road. Take the mask off my face, then - if you can find my face.", 'Shadow');
    Audio.play('boss'); const r = yield* E.battle(['Shadow Assassin'], { boss: true, canFlee: false, music: 'bosshuman' }); if (r !== 'win') return;
    G.set('shadow_done'); E.despawn('boss_shadow');
    yield* award(E, "Assassin's Mask", "(A blank mask. The Assassin's line - and Shadow Step passes iron bars, like the ones on the alcove behind.)");
  };
  patch('xian', (M) => { caveDoor(M, 23, 3, 'silk_shrine', 9, 11); M.sign(22, 4, 'The old shrine. Travellers do not go in.'); });

  // ====================== Babi's Workshop (the Engineer's Goggles) ======================
  // under Lalivero's reservoir: where Babi's engineers built the lighthouse's works, and one machine they left running.
  const BW = strs([
    '######################',
    '#....................#',
    '#~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~#',
    '#..,,,,,,,,,,,,,,,,..#',
    '#..,..............,..#',
    '#..,..............,..#',
    '#..,,,,,,,,,,,,,,,,..#',
    '##########.###########',
    '#....................#',
    '#........,...........#',
    '######################'
  ]);
  defineMap('babi_workshop', {
    name: "Babi's Workshop", w: 22, h: 12, base: 'void', music: 'dungeon', bg: 'temple', indoor: true, entry: { x: 10, y: 10 }, retreat: { map: 'lalivero_reservoir', x: 8, y: 4, dir: DIR.DOWN },
    enc: [['Stone Soldier', 'Stone Soldier'], ['Grand Golem'], ['Living Statue']],
    build(M) {
      M.paint(0, 0, BW, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 9, 11, 3, 'lalivero_reservoir', 8, 4, DIR.DOWN);
      // the pool in the middle of the floor: a bridge across it, its middle gone (Repair, later) - the far side's chest
      ClassExt.brokenBridge(M, [[10, 2], [10, 3]]); M.chest(10, 1, 'Golem Core', 1);
      M.object('crate', 10, 8, { id: 'bw_crate' });   // a crate stuck in the doorway of the machine floor: Move it up and through
      M.chest(2, 5, 'Power Bread', 1); M.chest(19, 5, 'Water of Life', 1);
      ClassExt.brokenGear(M, 3, 9, function* (E) { yield E.say('The gear turns - and somewhere under the floor, a pump starts. Babi\'s reservoir will not run dry this year.'); G.set('bw_pump'); G.party.coins += 500; yield E.say('The engineers left their pay in the housing: 500 coins.'); });
      M.boss('Clockwork Sentinel', 6, 5, { id: 'boss_clockwork', done: 'clockwork_done', script: STORY.clockworkSentinel });
      M.trigger(9, 9, 3, 2, function* (E) { yield E.say("Babi's workshop. Here his engineers built the lighthouse's engines, Iodem said - and left a guardian running on the floor when the work was done.", 'Mia'); }, { once: 'bw_seen' });
    }
  });
  STORY.clockworkSentinel = function* (E) {
    if (G.flag('clockwork_done')) return;
    Audio.play('boss'); yield E.say("(A machine of brass and steam unfolds from the far wall, a pair of goggles strapped to what serves it for a head.)");
    const r = yield* E.battle(['Clockwork Sentinel'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('clockwork_done'); E.despawn('boss_clockwork');
    yield* award(E, "Engineer's Goggles", "(Brass goggles. The Engineer's line - and Repair mends what is broken: that bridge, that gear.)");
  };
  patch('lalivero_reservoir', (M) => { caveDoor(M, 8, 3, 'babi_workshop', 10, 10); M.setObj(8, 3, 'stairs_down'); M.sign(9, 4, "Babi's workshop. Engineers only."); });

  // ====================== the Heart of Aleph (the Crown of Sol) ======================
  // under Sol Sanctum's statue chamber: a door that opens only to a party that has found all twenty-eight Djinn of
  // Angara. A chasm crossed by Grapple, and the colossus Sol left to keep its crown.
  const AH = strs([
    '########################',
    '#......................#',
    '#..,,,,,,,,,,,,,,,,,,..#',
    '#..,................,..#',
    '#..,................,..#',
    '#..,,,,,,,,,,,,,,,,,,..#',
    '#......................#',
    '#pppppppppppppppppppppp#',
    '#pppppppppppppppppppppp#',
    '#......................#',
    '#..o..............o....#',
    '#......................#',
    '#..........,...........#',
    '########################'
  ]);
  const gs1Djinn = () => G.party.djinnFound.filter(n => DJINN[n] && (DJINN[n].game === 1 || ['Flint', 'Granite', 'Quartz', 'Vine', 'Sap', 'Ground', 'Bane', 'Fizz', 'Sleet', 'Mist', 'Spritz', 'Hail', 'Tonic', 'Dew', 'Forge', 'Fever', 'Corona', 'Scorch', 'Ember', 'Flash', 'Torch', 'Gust', 'Breeze', 'Zephyr', 'Smog', 'Kite', 'Squall', 'Luff'].includes(n))).length;
  defineMap('aleph_heart', {
    name: 'Heart of Aleph', w: 24, h: 14, base: 'void', music: 'sanctum', bg: 'temple', indoor: true, entry: { x: 11, y: 12 }, retreat: { map: 'sol_sanctum_statues', x: 4, y: 5, dir: DIR.DOWN },
    enc: [],
    build(M) {
      M.paint(0, 0, AH, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 10, 13, 3, 'sol_sanctum_statues', 4, 5, DIR.DOWN);
      ClassExt.hookpost(M, 11, 5); ClassExt.hookpost(M, 11, 10);   // over the chasm: the line catches here - and on the post behind, for the way back
      M.chest(3, 3, 'Psy Crystal', 1); M.chest(20, 3, 'Water of Life', 1);
      M.boss('Colossus of Sol', 11, 3, { id: 'boss_colossus', done: 'colossus_done', script: STORY.colossusOfSol });
      M.trigger(10, 11, 3, 2, function* (E) { yield E.say('The heart of the mountain. The Wise One said nothing of this - a crown, and the thing that keeps it. The chasm has no bridge; a line thrown to that post would hold.', 'Ivan'); }, { once: 'ah_seen' });
    }
  });
  STORY.colossusOfSol = function* (E) {
    if (G.flag('colossus_done')) return;
    if (STORY_TLA.colossusIntro) yield* STORY_TLA.colossusIntro(E);   /* the Wise One names the guardian (js/game/story_post.js) */
    Audio.play('boss'); yield E.say("(A colossus of gold and stone lifts its head. On it: a crown that burns like the sun at noon.)");
    yield E.say("Twenty-eight Djinn brought you this far. It will take all of them.", 'Isaac');
    const r = yield* E.battle(['Colossus of Sol'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('colossus_done'); E.despawn('boss_colossus');
    yield* award(E, 'Crown of Sol', "(The crown, cool now. The Sovereign line: nothing in Angara stands above it.)");
  };
  patch('sol_sanctum_statues', (M) => { M.setObj(4, 4, 'door_stone'); M.walkable(4, 4); M.exit(4, 4, 1, 1, 'aleph_heart', 11, 12, DIR.UP, { door: true, cond: () => gs1Djinn() >= 28 }); M.trigger(3, 5, 3, 1, function* (E) { if (gs1Djinn() >= 28) return; yield E.say('A sealed door in the chamber\'s west wall. Twenty-eight marks are cut round it - one for every Djinni of Angara - and ' + (28 - gs1Djinn()) + ' of them are dark.'); }, { cond: () => gs1Djinn() < 28 }); });

  // ====================== the teachers ======================
  // Tolo, cutpurse of Lunpa: the bandana, to whoever can take it off him
  STORY.tolo = function* (E) {
    if (G.flag('tolo_done')) { yield E.say("Keep the bandana clean. And keep your hand on your purse in this town - I taught half of them.", 'Tolo'); return; }
    yield E.say("Dodonpa's finished, then. Good riddance. I'm Tolo - I ran his cutpurses, before I ran from him.", 'Tolo');
    yield E.say("You want the trade? The bandana teaches it - the locks, the pockets, the shadows. But I don't hand it to anyone who can't take it. Beat me, and it's yours.", 'Tolo');
    const r = yield* E.ask('Fight Tolo for the bandana?', null, ['Yes', 'Not now']); if (r !== 0) return;
    const b = yield* ClassExt.crewBout(E, 'Tolo', ClassExt.CREWS.Tolo || [], { boss: true, canFlee: false, canLose: true, music: 'bosshuman' });
    for (const m of G.party.members) m.fullRestore();
    if (b !== 'win') { yield E.say("Ha! Come back when you can keep your purse.", 'Tolo'); return; }
    G.set('tolo_done'); yield* award(E, "Thief's Bandana", "(Tolo hands the bandana over. The Thief's line - and Lockpick, for every chest with a lock the two of you will ever meet.)");
    yield E.say("There's a chest with a lock behind me. Consider it your first lesson.", 'Tolo');
  };
  patch('lunpa_inn', (M) => { M.npc('tolo', 10, 2, { type: 'villager_m', name: 'Tolo', look: npcLook('pirate', 3), script: STORY.tolo, cond: () => G.flag('hammet_freed') || G.flag('lunpa_gate_propped') }); ClassExt.lockedChest(M, 12, 2, 'Lucky Medal', 1); });
  // Dorian, who plays Kalay's inn: the lyre, if you can outplay him in the only contest he takes seriously
  STORY.dorian = function* (E) {
    if (G.flag('dorian_done')) { yield E.say("Play it gently. Beasts hear more than men do.", 'Dorian'); return; }
    yield E.say("Dorian, of everywhere and nowhere. I play for my supper. This lyre played for kings, once - it puts an army to sleep or a beast, and lifts a line of men that has stopped believing in itself.", 'Dorian');
    yield E.say("I'll teach it to you. But a song is a fight, friend: beat me and the lyre is yours.", 'Dorian');
    const r = yield* E.ask('Take Dorian on for the lyre?', null, ['Yes', 'Not now']); if (r !== 0) return;
    const b = yield* ClassExt.crewBout(E, 'Dorian', ClassExt.CREWS.Dorian || [], { boss: true, canFlee: false, canLose: true, music: 'bosshuman' });
    for (const m of G.party.members) m.fullRestore();
    if (b !== 'win') { yield E.say("A brave try. Come and hear me again.", 'Dorian'); return; }
    G.set('dorian_done'); yield* award(E, "Bard's Lyre", "(Dorian's lyre. The Minstrel line - and Serenade, for whatever sleeps across a road.)");
  };
  patch('kalay_inn', (M) => { M.npc('dorian', 12, 2, { type: 'villager_m', name: 'Dorian', look: npcLook('merchant', 5), script: STORY.dorian }); });
  // Master Poi of Lama Temple: the beads, to a student who can stand
  STORY.masterPoi = function* (E) {
    if (G.flag('poi_done')) { yield E.say("Breathe. Then strike. Then breathe.", 'Master Poi'); return; }
    yield E.say("Hama's guests. I am Poi; I keep the temple's fists, as she keeps its mind. These beads were my master's, and his - they hold the stillness a monk fights from.", 'Master Poi');
    yield E.say("I will give them to a student who can stand against me for a round. Not before.", 'Master Poi');
    const r = yield* E.ask('Spar with Master Poi for the beads?', null, ['Yes', 'Not now']); if (r !== 0) return;
    const b = yield* ClassExt.crewBout(E, 'Master Poi', ClassExt.CREWS['Master Poi'] || [], { boss: true, canFlee: false, canLose: true, music: 'bosshuman' });
    for (const m of G.party.members) m.fullRestore();
    if (b !== 'win') { yield E.say("You fall well. Come back when you stand better.", 'Master Poi'); return; }
    G.set('poi_done'); yield* award(E, "Monk's Prayer Beads", "(The beads. The Monk line - and Stillness, which holds everything on a floor where it stands.)");
  };
  patch('lama_hall', (M) => { M.npc('master_poi', 12, 2, { type: 'villager_m', name: 'Master Poi', look: npcLook('elder', 2), script: STORY.masterPoi, cond: () => G.flag('hama_told') }); });
  // Brannock, champion of Colosso in years past: the emblem, to a champion who can beat one
  STORY.brannock = function* (E) {
    if (G.flag('brannock_done')) { yield E.say("The crowd was mine for ten years. It's yours now. Don't drop it.", 'Brannock'); return; }
    if (!G.flag('colosso_done') && !G.flag('babi_permission')) { yield E.say("Brannock. I won this arena ten years running. Come and talk to me when you've stood in it.", 'Brannock'); return; }
    yield E.say("So you're Babi's champion. I was, ten years running, before my knee went. This emblem was mine for all of them.", 'Brannock');
    yield E.say("It teaches the arena: the roar, the shield, the net and the trident. I'll give it to the one man who can beat me on the sand. The knee's fine today.", 'Brannock');
    const r = yield* E.ask('Fight Brannock for the emblem?', null, ['Yes', 'Not now']); if (r !== 0) return;
    const b = yield* ClassExt.crewBout(E, 'Brannock', ClassExt.CREWS.Brannock || [], { boss: true, canFlee: false, canLose: true, music: 'bosshuman' });
    for (const m of G.party.members) m.fullRestore();
    if (b !== 'win') { yield E.say("Ha! The knee's better than I thought. Again, some day.", 'Brannock'); return; }
    G.set('brannock_done'); yield* award(E, "Gladiator's Emblem", "(The champion's emblem. The Gladiator line - and Shove, for the iron crates no Psynergy shifts.)");
    yield E.say("There's an iron crate in the yard the stagehands could never move. Shove it into the pit and see what it was sitting on.", 'Brannock');
  };
  patch('tolbi_yard', (M) => { M.npc('brannock', 26, 4, { type: 'villager_m', name: 'Brannock', look: npcLook('guard', 9), script: STORY.brannock }); M.chest(23, 5, 'Warrior\'s Helm', 1); ClassExt.heavyCrate(M, 23, 5, 'ty_iron'); });   /* the crate stands on the chest; Shove it off */

  // ====================== the foes ======================
  // (registered once js/game/class_ext.js has loaded - the map files come first)
  const registerFoes = () => { const F = ClassExt.foe;
  F('Tusked Mauler', { hp: 560, pp: 0, atk: 92, def: 26, agi: 38, lck: 8, t: 1, pw: [100, 90, 100, 100], rs: [110, 90, 100, 90], ab: ['Attack', 'Gore', 'Trample', 'Guard'], exp: 420, c: 260, dr: ['Nut', 1] });
  F('Dire Wolf Matriarch', { hp: 640, pp: 40, atk: 104, def: 28, agi: 70, lck: 12, t: 1, pw: [100, 100, 100, 110], rs: [100, 90, 80, 120], ab: ['Attack', 'Rend', 'Howl', 'Fang'], exp: 700, c: 380, dr: ['Elixir', 1] });
  F('Ore Golem', { hp: 1350, pp: 60, atk: 152, def: 92, agi: 28, lck: 10, t: 1, pw: [130, 100, 100, 80], rs: [150, 100, 110, 60], ab: ['Attack', 'Rockfall', 'Quake', 'Cave-in', 'Guard'], exp: 1300, c: 700, dr: ['Golem Core', 1] });
  F('Shadow Assassin', { hp: 1800, pp: 120, atk: 208, def: 58, agi: 132, lck: 20, t: 1, pw: [100, 100, 100, 120], rs: [100, 100, 100, 130], ab: ['Attack', 'Venom Edge', 'Smoke Screen', 'Backstab', 'Shuriken'], exp: 2000, c: 900, dr: ['Ninja Garb', 1] });
  F('Clockwork Sentinel', { hp: 2600, pp: 200, atk: 238, def: 112, agi: 88, lck: 15, t: 1, pw: [100, 80, 120, 130], rs: [120, 70, 130, 150], ab: ['Attack', 'Steam Vent', 'Bolt Thrower', 'Guard', 'Siege Engine'], exp: 2800, c: 1400, dr: ['Mythril Silver', 1] });
  F('Colossus of Sol', { hp: 10000, pp: 800, atk: 500, def: 200, agi: 180, lck: 45, t: 2, pw: [120, 90, 140, 110], rs: [140, 60, 190, 130], ab: ['Attack', 'Solar Flare', 'Sunburst', 'Corona', 'Break', 'Guard', 'Judgement of Sol'], exp: 14000, c: 9000, dr: ['Sol Blade', 1] });
  F('Tolo', { hp: 920, pp: 60, atk: 118, def: 34, agi: 112, lck: 30, t: 1, pw: [100, 100, 100, 110], rs: [100, 100, 100, 110], ab: ['Attack', 'Backstab', 'Smoke Screen', 'Pilfer'], exp: 800, c: 600 }, npcLook('pirate', 3));
  F('Dorian', { hp: 1100, pp: 220, atk: 108, def: 44, agi: 96, lck: 25, t: 1, pw: [100, 100, 100, 120], rs: [100, 110, 100, 130], ab: ['Attack', 'Requiem', 'Dirge', 'Lullaby', 'Cure'], exp: 1100, c: 700 }, npcLook('merchant', 5));
  F('Master Poi', { hp: 1500, pp: 160, atk: 172, def: 62, agi: 118, lck: 30, t: 1, pw: [100, 120, 100, 100], rs: [100, 130, 100, 100], ab: ['Attack', 'Chi Strike', 'Palm Wave', 'Iron Stance', 'Hundred Fists'], exp: 1500, c: 800 }, npcLook('elder', 2));
  ClassExt.CREWS = ClassExt.CREWS || {};
  F('Brannock', { hp: 2400, pp: 100, atk: 262, def: 104, agi: 82, lck: 22, t: 1, pw: [100, 100, 120, 100], rs: [100, 100, 130, 100], ab: ['Attack', 'Shield Bash', 'Net and Trident', 'Arena Roar', 'Guard', 'Chariot Rush'], exp: 2600, c: 1500 }, npcLook('guard', 9));
  ClassExt.CREWS.Tolo = ClassExt.crew('Tolo', [['Cutpurse', 'fighter', 'pirate', 31, 'Backstab'], ['Cutpurse', 'fighter', 'villager_m', 32, 'Backstab'], ['Fence', 'caster', 'merchant', 33, 3]]);
  ClassExt.CREWS.Dorian = ClassExt.crew('Dorian', [['Minstrel', 'caster', 'villager_m', 34, 3], ['Minstrel', 'caster', 'villager_f', 35, 3], ['Dancer', 'fighter', 'villager_f', 36, 'Fan Dance']]);
  ClassExt.CREWS['Master Poi'] = ClassExt.crew('Master Poi', [['Monk', 'fighter', 'elder_m', 37, 'Palm Wave'], ['Monk', 'fighter', 'villager_m', 38, 'Palm Wave'], ['Acolyte', 'healer', 'villager_m', 39]]);
  ClassExt.CREWS.Brannock = ClassExt.crew('Brannock', [['Gladiator', 'fighter', 'guard', 40, 'Shield Bash'], ['Gladiator', 'fighter', 'guard', 41, 'Net and Trident'], ['Arena Medic', 'healer', 'villager_m', 42]]);
  };
  if (typeof ClassExt !== 'undefined') registerFoes(); else (window.__classFoes = window.__classFoes || []).push(registerFoes);
}
