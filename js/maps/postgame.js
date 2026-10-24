// ============================================================================
// The post-game's places (2026-09-19; the scenes are in js/game/story_post.js):
//   - the eastern way of Sol Sanctum's chamber of statues, open once the game is beaten: down to the Sunken Summit
//     of Mt. Aleph, where the Wise One sealed Alex
//   - the Wise One waiting in the Heart of Aleph once Alex has joined
//   - King Hydros's chamber: the Eyes of Alchemy open the way to the Cradle
//   - the Cradle: one land, no towns, nothing roaming - a shore, four ways to the four that stayed whole, and the
//     heart that opens once the four are met
// Hosts are patched idempotently the way the class trials do it (each host keeps one list of this file's additions).
'use strict';
{
  const ST = STORY_TLA;
  const strs = (rows) => rows.map(r => typeof r === 'string' ? r : r.join(''));
  for (const def of Object.values(MAPS)) if (def._classPatches && def._classPatches.post) def._classPatches.post = [];
  const patch = (id, fn) => { const def = MAPS[id]; if (!def) { console.warn('postgame: no host map', id); return; } if (!def._classPatches) { const orig = def.build; def._classPatches = {}; def.build = function (M) { if (orig) orig.call(this, M); for (const list of Object.values(def._classPatches)) for (const f of list) f(M); }; } (def._classPatches.post = def._classPatches.post || []).push(fn); };
  const caveDoor = (M, x, y, to, tx, ty, opts) => { M.setObj(x, y, 'door_stone'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, Object.assign({ door: true }, opts || {})); };
  const back = (M, x, y, w, to, tx, ty, dir) => { M.walkable(x, y, w, 1); M.exit(x, y, w, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir); };
  const beaten = () => G.flag('game_complete');

  // ====================== the Sunken Summit of Mt. Aleph ======================
  const SUMMIT = { '.': 'cave', ',': 'floor_stone', 'g': 'elem_venus', 'p': 'chasm', 'o': { ground: 'cave', obj: 'rock_small' }, 'P': { ground: 'floor_stone', obj: 'psystone' } };
  const AS = strs([
    '########################',
    '########################',
    '#######P..gggg..P#######',
    '######..gggggggg..######',
    '#####...gg,,,,gg...#####',
    '#####...gg,,,,gg...#####',
    '######..gggggggg..######',
    '#######..gggggg..#######',
    '########........########',
    '#########......#########',
    '#####pppp......pppp#####',
    '####ppppp......ppppp####',
    '###.o....o....o....o.###',
    '###..................###',
    '###..o............o..###',
    '####................####',
    '#####..............#####',
    '######............######',
    '#######..........#######',
    '########........########',
    '#########......#########',
    '########################'
  ]);
  defineMap('aleph_sunken', {
    name: 'Mt. Aleph - The Sunken Summit', w: 24, h: 22, base: 'void', music: 'villain', bg: 'cave', indoor: true, dark: true, darkLevel: 0.35, entry: { x: 11, y: 20 }, retreat: { map: 'sol_sanctum_statues', x: 30, y: 5, dir: DIR.DOWN },
    enc: [],
    build(M) {
      M.paint(0, 0, AS, SUMMIT, { cliff: '#', set: 'greyrock', faces: 2 });
      back(M, 9, 21, 6, 'sol_sanctum_statues', 30, 5, DIR.DOWN);
      M.npc('alex_sealed', 11, 4, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN, cond: () => !G.flag('alex_beaten'), script: ST.alexSealed });
      M.trigger(9, 6, 6, 2, ST.alexSealed, { once: 'alex_sealed_scene', cond: () => !G.flag('alex_beaten') });
      M.trigger(9, 18, 6, 2, function* (E) { yield E.say("(What is left of the summit of Mt. Aleph, drawn down into the earth. Above, the mountain's stump; below, a light that is not quite gone. Somebody is in it.)"); }, { once: 'aleph_sunken_seen' });
      M.sign(4, 12, 'The rock of the summit, folded under the mountain. It still hums.');
    }
  });
  patch('sol_sanctum_statues', (M) => {
    caveDoor(M, 30, 4, 'aleph_sunken', 11, 20, { cond: beaten });
    M.trigger(29, 5, 3, 1, function* (E) { if (beaten()) return; yield E.say("A sealed door in the chamber's east wall, older than the west one. Nothing about it gives."); }, { cond: () => !beaten() });
  });

  // ====================== the Wise One in the Heart of Aleph ======================
  patch('aleph_heart', (M) => {
    M.npc('wise_one_h', 11, 3, { animal: 'wiseone', name: 'The Wise One', dir: DIR.DOWN, solid: true, cond: () => G.flag('alex_joined'), script: ST.wiseOneChallenge });
  });

  // ====================== King Hydros and the way to the Cradle ======================
  patch('lemuria_palace', (M) => {
    M.trigger(12, 5, 2, 1, ST.hydrosEyes, { cond: () => G.flag('lemuria_council') && !G.flag('cradle_open') && G.inventory.has('Eyes of Alchemy') });
    const h = M.npcs.find(n => n.id === 'Hydros'); if (h && !h.script) { const t = h.text; h.script = function* (E) { if (G.inventory.has('Eyes of Alchemy') && !G.flag('cradle_open')) { yield* ST.hydrosEyes(E); return; } if (G.flag('cradle_open')) { yield E.say(G.flag('cradle_done') ? 'You came back. Sit, all of you, and tell an old king everything - slowly.' : 'The way is open, there in my chamber. Go carefully. Go together.', 'King Hydros'); return; } yield E.say(typeof t === 'function' ? t() : t, 'King Hydros'); }; }   /* spoken to, the king takes the Eyes as well */
    if (G.flag('cradle_open')) { M.object('portal', 10, 8, { id: 'cradle_portal', tile: 'whirlwind_big' }); M.exit(10, 8, 1, 1, 'cradle_shore', 10, 9, DIR.UP); }
  });

  // ====================== the Cradle ======================
  // the Cradle's own tiles (tiles.js, the CRADLE block): a world with no sun in it - dark in colour, lit from below,
  // its ground worked over with runes, its water black, its fire a dull red, its cliffs violet-black glass
  const CR = { '.': 'cr_ground', ',': 'cr_rune', 'd': 'cr_ground', 's': 'cr_ground', '~': 'cr_ichor', 'W': 'cr_ichor', 'p': 'cr_void', 'l': 'cr_ember', 'i': 'ice', 'n': 'snow', 'c': 'cr_ground', 'f': 'cr_rune', 'P': { ground: 'cr_ground', obj: 'psystone' }, 'C': { ground: 'cr_ground', obj: 'crystal_rock' }, 'o': { ground: 'cr_ground', obj: 'cr_glass' }, 'T': { ground: 'cr_ground', obj: 'cr_glass' }, 'g': 'elem_venus', 'b': 'elem_mercury', 'r': 'elem_mars', 'j': 'elem_jupiter', 'D': { ground: 'cr_rune', obj: 'door_stone' } };
  const SH = strs([
    '####################',
    '#######....#########',
    '#####........#######',
    '####..........######',
    '###.....P......#####',
    '###............#####',
    '###ssssssssssssss###',
    '##ssssssssssssssss##',
    '##ssssssssssssssss##',
    '##sssssss..sssssss##',
    '##ssssss....ssssss##',
    '##sssssss..sssssss##',
    '###ssssssssssssss###',
    '####################'
  ]);
  defineMap('cradle_shore', {
    name: 'The Cradle - The Shore', w: 20, h: 14, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 10, y: 9 }, noEscape: true, retreat: null,
    enc: [],
    build(M) {
      M.paint(0, 0, SH, CR, { cliff: '#', set: 'voidrock', faces: 1 });
      M.object('portal', 10, 10, { id: 'cradle_home', tile: 'whirlwind_big' }); M.exit(10, 10, 1, 1, 'lemuria_palace', 10, 9, DIR.DOWN);   /* the swirl: back to Hydros's chamber */
      back(M, 7, 1, 4, 'cradle', 24, 37, DIR.UP);
      M.trigger(8, 8, 4, 2, ST.cradleArrive, { once: 'cradle_arrive_scene' });
      M.sign(3, 5, 'The swirl behind is the way home - it stays open. Everything else is ahead.');
      M.npc('cr_lost_child', 14, 4, { type: 'villager_f', name: 'Girl', dir: DIR.DOWN, text: () => G.flag('cradle_done') ? "It's quieter. Is it over? Can I go through the swirly thing with you? I'll be good." : "You came through the swirly thing! Nobody comes through the swirly thing, it only ever spits people OUT. I'm from Vault. I fell in the river. Don't go to the middle - the man from Lemuria says the middle eats people. Oh, and don't be scared of the big ones; being scared makes them bigger.", mind: "(She has been eight years old for longer than Vault has had a name.)" });
    }
  });
  // the land itself: no towns, nothing roaming; a way out at each edge and a closed one in the middle
  const CL = strs([
    '################################################',
    '###########....##################....###########',
    '##########......################......##########',
    '#########........##############........#########',
    '########...TT.....############.....TT...########',
    '#######....TT......##########......TT....#######',
    '######..............########..............######',
    '#####................######................#####',
    '####..................####..................####',
    '###....o..........pp..........~~........o....###',
    '###.......~~......pp.........~~~~.....o......###',
    '###...,,,~~~~..............o..~~.......,,,...###',
    '###...,,,.~~.......ll..................,,,...###',
    '###...........o...lll.........pp.............###',
    '###...........####################...........###',
    '###...........#..................#...........###',
    '###...........#..................#...........###',
    '##............#......ffffff......#............##',
    '#.............#......ffDfff......#.............#',
    '#.............#......ffffff......#.............#',
    '##............#..................#............##',
    '###...........#..................#...........###',
    '###...........####################...........###',
    '###..........pp.............o................###',
    '###...,,,....pp.....~~~...........lll..,,,...###',
    '###...,,,..........~~~~....o......ll...,,,...###',
    '###.......o.........~~..............o........###',
    '###....o................pp..............o....###',
    '####....................pp..................####',
    '#####......................................#####',
    '######....................................######',
    '#######..................................#######',
    '########................................########',
    '#########..............................#########',
    '##########............................##########',
    '###########..........................###########',
    '#################..............#################',
    '####################........####################',
    '#####################......#####################',
    '################################################'
  ]);
  defineMap('cradle', {
    name: 'The Cradle', w: 48, h: 40, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 24, y: 37 }, noEscape: true, retreat: null,
    enc: [],
    build(M) {
      M.paint(0, 0, CL, CR, { cliff: '#', set: 'voidrock', faces: 1 });
      back(M, 22, 38, 3, 'cradle_shore', 9, 2, DIR.DOWN);
      // the four ways: west, north-west, north-east, east
      M.walkable(1, 18, 1, 2); M.exit(1, 18, 1, 2, 'cradle_grove', 20, 12, DIR.LEFT);
      M.walkable(11, 1, 4, 1); M.exit(11, 1, 4, 1, 'cradle_deep', 11, 12, DIR.UP);
      M.walkable(33, 1, 4, 1); M.exit(33, 1, 4, 1, 'cradle_forge', 11, 12, DIR.UP);
      M.walkable(46, 18, 1, 2); M.exit(46, 18, 1, 2, 'cradle_spire', 1, 7, DIR.RIGHT);
      // the heart: the door in the walled centre, closed till the four are met; the wall's own doorway at the south
      M.setObj(23, 22, null); M.set(23, 22, 'floor_stone'); M.walkable(23, 22); M.setObj(24, 22, null); M.set(24, 22, 'floor_stone'); M.walkable(24, 22);
      M.walkable(23, 18); M.exit(23, 18, 1, 1, 'cradle_heart', 11, 12, DIR.UP, { door: true, cond: () => G.flag('cradle_heart_open') });
      M.trigger(22, 19, 4, 1, function* (E) { if (G.flag('cradle_heart_open')) return; yield E.say('(A door of the first stone. It is not locked; it is simply not open, and will not be until the four that stayed whole have been met.)'); }, { cond: () => !G.flag('cradle_heart_open') });
      M.sign(7, 9, 'West: the grove that is stone. Terragon.'); M.sign(40, 9, 'East, up the spire: Zephyros.'); M.sign(7, 27, 'North-west: the deep. Thalassa.'); M.sign(40, 27, 'North-east: the forge. Ignis.');
      M.trigger(21, 36, 6, 2, function* (E) { yield E.say("(The land. It is smaller than a continent and older than a world. Four ways out of the plain, and a walled place in the middle.)"); }, { once: 'cradle_seen' });
      // the trapped: people who came through before there was a door - no settlement, only where each of them stopped
      M.npc('cr_lost_lemurian', 24, 34, { type: 'lemurian', name: 'Lost Lemurian', dir: DIR.DOWN, text: () => G.flag('cradle_done') ? "You met it. The gold one. And you are still here. I think... I think I will try the swirl, after all. Would you walk me to it?" : "Don't - don't be alarmed. I'm as real as you are. Realer, maybe; I've been here longer. Lemuria. I sailed for the wall in the old king's father's time and the sea folded and I was here. There is no night. There is no day. There are THINGS. Four of them, and one that is all four. Whatever you are, you are not ready for the one in the middle.", mind: "(He has not been hungry in a hundred years and it frightens him more than the beings do.)" });
      M.npc('cr_lost_scholar', 6, 12, { type: 'merchant', name: 'Scholar of Tolbi', dir: DIR.RIGHT, text: "Babi sent an expedition for the Lemurian ship, forty years ago - I was its cartographer. We found something else. West of here there is a grove where the trees are stone and the stone gets up and walks. It is Venus. Not a Venus Adept - the thing the Adepts are a shadow of. My whole company went in to map it. I stayed to make a fair copy. That is why I am the one talking to you.", mind: "(He has mapped the whole land. The middle of the map is blank; he will not go there.)" });
      M.npc('cr_lost_hunter', 40, 12, { type: 'guard', name: 'Prox Hunter', dir: DIR.LEFT, text: "Prox. Puelle's father sent us north of north, after the ice took the last hunting. The ice opened. East of here, up the spire, the wind has wings and it TALKS. It knew my name. If you go up, it will know yours. Do not let it; it is worse when it knows.", mind: "(She has stopped counting the years. She counts the times she has heard the wind say her name: eleven.)" });
      M.npc('cr_lost_pirate', 6, 27, { type: 'pirate', name: 'Champa Corsair', dir: DIR.RIGHT, text: "Champa, and proud of it. We ran a ship onto the Sea of Time's teeth chasing a Lemurian and the water went black. North-west of here it is still black. There is a deep with no floor, and what is in it wears the shape of the thing you are most afraid of. For me that was a serpent. Take my advice and be afraid of nothing before you go in.", mind: "(He was afraid of serpents. Now he is afraid of the shape it would take for someone else.)" });
      M.npc('cr_lost_priest', 40, 27, { type: 'elder_m', name: 'Anemos Priest', dir: DIR.LEFT, text: "Anemos. The city that flew. We did not fly by ourselves, child - we came here, once, before we left, to ask the four for the wind. The one in the forge to the north-east gave us fire instead, and it has not stopped giving it since. Do not speak to it. It does not talk. It only burns, and it is happy to.", mind: "(He was there when the city rose. He has been here since before it did.)" });
    }
  });
  // the four grounds, each a short way and a guardian; one thing to do on the way in each
  const GV = strs([
    '######################',
    '#TT.....P....P.....TT#',
    '#T..................T#',
    '#...........o........#',
    '#....................#',
    '#TTTTTTTTT..TTTTTTTTT#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#..T..............T..#',
    '#....................#',
    '#......o......o......#',
    '#....................#',
    '######################'
  ]);
  defineMap('cradle_grove', { name: 'The Cradle - The Grove of Stone', w: 22, h: 14, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 20, y: 12 }, noEscape: true, retreat: null, enc: [],
    build(M) { M.paint(0, 0, GV, CR, { cliff: '#', set: 'voidrock', faces: 1 }); M.walkable(21, 12); M.exit(21, 12, 1, 1, 'cradle', 2, 19, DIR.RIGHT);
      M.object('boulder', 10, 6, { id: 'cg_rock1' }); M.object('boulder', 11, 6, { id: 'cg_rock2' });   /* Lift, on the way through the line of trees */
      M.chest(3, 3, 'Psy Crystal', 1); M.chest(18, 3, 'Water of Life', 1);
      M.boss('Terragon', 11, 2, { id: 'boss_terragon', done: 'terragon_done', script: ST.cradleTerragon, foeScale: 1.2 }); } });
  const DP = strs([
    '######################',
    '#~~~~~~~~..~~~~~~~~~~#',
    '#~~~~~~~~..~~~~~~~~~~#',
    '#~~~~~~~....~~~~~~~~~#',
    '#~~~~~~......~~~~~~~~#',
    '#~~~~~~......~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~....~~~~~~~~#',
    '#~~~~~~......~~~~~~~~#',
    '#~~~~~........~~~~~~~#',
    '#~~~~~........~~~~~~~#',
    '######################'
  ]);
  defineMap('cradle_deep', { name: 'The Cradle - The Deep', w: 22, h: 14, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 11, y: 12 }, noEscape: true, retreat: null, enc: [],
    build(M) { M.paint(0, 0, DP, CR, { cliff: '#', set: 'voidrock', faces: 1 }); M.walkable(10, 13, 3, 1); M.exit(10, 13, 3, 1, 'cradle', 12, 2, DIR.DOWN);
      for (let y = 6; y <= 8; y++) M.object('puddle', 10, y, { id: 'cd_puddle_' + y });   /* Frost: three pillars across the water */
      M.chest(7, 4, 'Psy Crystal', 1); M.chest(12, 4, 'Water of Life', 1);
      M.boss('Thalassa', 9, 2, { id: 'boss_thalassa', done: 'thalassa_done', script: ST.cradleThalassa, foeScale: 1.2 }); } });
  const FG = strs([
    '######################',
    '#llll....llll....llll#',
    '#lll..............lll#',
    '#ll................ll#',
    '#l..................l#',
    '#l....llllllllll....l#',
    '#l....l........l....l#',
    '#l....l........l....l#',
    '#l....llll..llll....l#',
    '#l..................l#',
    '#ll................ll#',
    '#lll..............lll#',
    '#lll..............lll#',
    '######################'
  ]);
  defineMap('cradle_forge', { name: 'The Cradle - The Forge', w: 22, h: 14, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 11, y: 12 }, noEscape: true, retreat: null, enc: [],
    build(M) { M.paint(0, 0, FG, CR, { cliff: '#', set: 'voidrock', faces: 1 }); M.walkable(10, 13, 3, 1); M.exit(10, 13, 3, 1, 'cradle', 34, 2, DIR.DOWN);
      M.object('pillar', 10, 8, { id: 'cf_pillar' });   /* Move: the pillar out of the gap in the ring */
      M.chest(4, 3, 'Psy Crystal', 1); M.chest(17, 3, 'Water of Life', 1);
      M.boss('Ignis', 11, 2, { id: 'boss_ignis', done: 'ignis_done', script: ST.cradleIgnis, foeScale: 1.2 }); } });
  const SP = strs([
    '######################',
    '#####...........######',
    '####....P.P......#####',
    '####.............#####',
    '#####...........######',
    '######pp....pp########',
    '#######......#########',
    '#......pppp....pppp###',
    '#...................##',
    '#####...........######',
    '######ppppppp#########',
    '#######......#########',
    '########....##########',
    '######################'
  ]);
  defineMap('cradle_spire', { name: 'The Cradle - The Spire', w: 22, h: 14, base: 'void', music: 'anemos', bg: 'cave', entry: { x: 1, y: 7 }, noEscape: true, retreat: null, enc: [],
    build(M) { M.paint(0, 0, SP, CR, { cliff: '#', set: 'voidrock', faces: 1 }); M.walkable(0, 7, 1, 2); M.exit(0, 7, 1, 2, 'cradle', 45, 19, DIR.LEFT);
      M.object('leaves', 8, 6, { id: 'cs_leaves' }); M.object('leaves', 11, 6, { id: 'cs_leaves2' });   /* Whirlwind: the growth across the ledge */
      M.chest(5, 2, 'Psy Crystal', 1); M.chest(14, 2, 'Water of Life', 1);
      M.boss('Zephyros', 11, 2, { id: 'boss_zephyros', done: 'zephyros_done', script: ST.cradleZephyros, foeScale: 1.2 }); } });
  const HT = strs([
    '######################',
    '#ffffffffffffffffffff#',
    '#ffffffgbrjffffffffff#',
    '#ffffffffffffffffffff#',
    '#ffffff........ffffff#',
    '#fffff..........fffff#',
    '#fffff..........fffff#',
    '#fffff..........fffff#',
    '#fffff..........fffff#',
    '#ffffff........ffffff#',
    '#ffffffffffffffffffff#',
    '#ffffffffffffffffffff#',
    '#ffffffffffffffffffff#',
    '######################'
  ]);
  defineMap('cradle_heart', { name: 'The Cradle - The Heart', w: 22, h: 14, base: 'void', music: 'anemos', bg: 'temple', indoor: true, entry: { x: 11, y: 12 }, noEscape: true, retreat: null, enc: [],
    build(M) { M.paint(0, 0, HT, CR, { cliff: '#', set: 'voidrock', faces: 1 }); M.walkable(10, 13, 3, 1); M.exit(10, 13, 3, 1, 'cradle', 23, 19, DIR.DOWN);
      M.boss('Alkahest', 11, 2, { id: 'boss_alkahest', done: 'alkahest_done', script: ST.cradleAlkahest, foeScale: 1.4 });
      M.trigger(9, 11, 5, 2, function* (E) { yield E.say("(The centre. Everything here is measured from this point, and something gold is standing on it.)"); }, { once: 'cradle_heart_seen' }); } });
}
