// ---------- Lunpa ----------
// The thieves' town on its hill, from the reference rip: houses cut into the terraces of brown rock, the sandy
// lanes winding between them, the well, the Psynergy Stone, a log palisade with an iron gate across the road in
// from the south and the way out at the top to Dodonpa's yard. Beyond the yard's palisades the fortress itself:
// mossy halls under purple rock where the guards WATCH - walk into a guard's sight uncloaked and it is a fight;
// Cloak (the Cloak Ball from old Lunpa's house) takes the party past them to Tonic, the cell key, Hammet's cell
// and Dodonpa's hall.
'use strict';

const LUNPA_LEGEND = {
  '.': 'grass', 'p': 'path', 'l': 'ladder', 'G': 'palisade_gate',
  '#': 'cliff', 'L': { ground: 'grass', obj: 'palisade_face' }, 'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' },
  'j': { ground: 'grass', obj: 'pot' }, 'c': { ground: 'grass', obj: 'crate' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'S': { ground: 'grass', obj: 'psystone' }, 'w': 'grass',
};
const LUNPA_ROWS = [
  '..T#########....####..##v...',   // 0   the north gate to the yard at 12..15
  '...#########pppp####..####..',   // 1
  '...#########.pp.LL##..####..',   // 2
  '...########l.pp.LL....##...T',   // 3   A's door at 7,3
  '####....###l.pp.LL#####.v...',   // 4
  '#v##r....v..pppp.######.....',   // 5
  '########...###c#.########.j.',   // 6   E's door at 20,6
  '.#######j..##c.v.....####...',   // 7   B's door at 2,7
  '....####j..##..c.....j####..',   // 8
  '.r..####....####.....j.###.v',   // 9
  '....####....####....cc...T..',   // 10  C's door at 6,10
  '.r..........####..#####.....',   // 11  D's door at 15,11
  '###.vj..ppppr.....#####.....',   // 12
  '###...pppppp....ww#####.....',   // 13  F's door at 21,13
  '###T..pppppp....ww.....r....',   // 14
  '###......pvp....ppp.v.......',   // 15
  '###....STppp###.ppcc........',   // 16  J's door at 2,16; the Psynergy Stone
  '##..#####...###.c..###...T..',   // 17
  '##..#######.###....###......',   // 18  I's door at 13,18
  '##..########.....j.###.....T',   // 19
  '..T.....########..####....v.',   // 20  G's door at 21,20
  '.v....T.....###ppp......####',   // 21  H's door at 14,21
  '####.....T.....ppp....v.####',   // 22
  '####.r.........ppp......####',   // 23
  '####.....LLLLLLLLLL..#######',   // 24  the south palisade and its gate
  '..####..rLLLGGGGLLL..####...',   // 25
  '..####...LLLGGGGLLL..####..T',   // 26
  '....##.......ppp...####.....',   // 27
  '...v##.......ppp...####.####',   // 28
  '###..T.......pppppp.....####',   // 29
  '###...T......ppppppT...v####',   // 30
  '###....T.....ppp....T...####',   // 31  the road out
];
defineMap('lunpa', {
  name: 'Lunpa', w: 28, h: 32, base: 'grass', music: 'trouble', bg: 'grass', entry: { x: 14, y: 30 },
  build(M) {
    M.walkable(0, 8); M.exit(0, 8, 1, 1, 'west_lunpa_cave', 20, 4, DIR.LEFT);   // the back way out through West Lunpa Cave
    M.paint(0, 0, LUNPA_ROWS, LUNPA_LEGEND, { set: 'cliff', faces: 2 });
    M.setObj(16, 13, 'well_tl'); M.setObj(17, 13, 'well_tr'); M.setObj(16, 14, 'well_bl'); M.setObj(17, 14, 'well_br');
    const door = (x, y, to, tx, ty) => { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true }); };
    door(7, 3, 'lunpa_house_a', 6, 8); door(2, 7, 'lunpa_house1', 6, 8); door(6, 10, 'lunpa_itemshop', 6, 6); door(15, 11, 'lunpa_house_d', 6, 8);
    door(20, 6, 'lunpa_inn', 7, 8); door(21, 13, 'lunpa_house2', 6, 8); door(2, 16, 'lunpa_weaponshop', 6, 7); door(13, 18, 'lunpa_house_i', 6, 8);
    door(21, 20, 'lunpa_house_g', 6, 8); door(14, 21, 'lunpa_house_h', 6, 8);
    M.exit(12, 0, 4, 1, 'lunpa_yard', 7, 16, DIR.UP);
    // the ladder's foot by the north gate is a crack with water lying in it: Frost makes a pillar of it, the ladder
    // climbs to a ledge, and Reveal shows the way into the rock - the thieves' secret cavern and its six chests
    M.set(11, 5, 'puddle_gap'); M.set(11, 2, 'grass'); M.setObj(11, 2, null); M.walkable(11, 2);
    if (G.flag('lunpa_secret_found')) { M.set(10, 2, 'grass'); M.setObj(10, 2, 'door_cave'); M.walkable(10, 2); }
    else { M.hidden.push({ x: 10, y: 2, tile: 'cave' }); M.trigger(10, 2, 1, 1, function* (E) { G.set('lunpa_secret_found'); yield E.say('The rock is only a picture of rock: a low passage runs into the hill behind it.'); yield Engine.fadeOut(10); E.warpNow('lunpa_secret', 6, 6, DIR.UP); yield Engine.fadeIn(10); }); }
    M.exit(10, 2, 1, 1, 'lunpa_secret', 6, 6, DIR.UP, { door: true, cond: () => G.flag('lunpa_secret_found') });
    M.exit(13, 31, 3, 1, 'world_gs1', 65, 36, DIR.DOWN);
    for (const [x, y, red] of [[25, 3, 1], [4, 14, 1], [26, 12, 0], [9, 22, 1], [22, 22, 0], [26, 27, 1], [6, 30, 0], [20, 31, 1]]) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    M.npc('lunpa_gate1', 12, 27, { type: 'pirate', name: 'Gate Thug', dir: DIR.DOWN, text: () => G.flag('hammet_rescued') ? "The boss says let 'em through. The boss says a lot of things lately." : "Lunpa's a free town. Free to come in, free to get robbed. Ha!" });
    M.npc('lunpa_gate2', 15, 27, { type: 'pirate', name: 'Gate Thug', dir: DIR.DOWN, text: "Don't go bothering Dodonpa. He's up top, behind more walls than you've got Psynergy." });
    M.npc('lunpa_thug1', 10, 13, { type: 'pirate', name: 'Thug', move: 'wander', text: "Dodonpa runs this town. Mind your business, stranger." });
    M.npc('lunpa_thug2', 17, 16, { type: 'pirate', name: 'Thug', move: 'wander', text: "Heard the boss caught some rich merchant. Gonna ransom him for a fortune!" });
    M.npc('lunpa_f1', 8, 22, { type: 'villager_f', move: 'wander', text: "Old Lunpa founded this town as a haven for the poor. His grandson Dodonpa turned it into a den of thieves." });
    M.npc('lunpa_old', 5, 5, { type: 'elder_m', text: "The houses are cut into the hill. Cool in summer, and nothing to burn when the raiders came. That was the idea, once." });
    M.npc('lunpa_kid', 23, 16, { type: 'child_m', move: 'wander', text: "The guards at the yard gate can see REALLY far. Unless you're invisible. Are you invisible?" });
    M.npc('lunpa_north', 12, 2, { type: 'pirate', name: 'Guard', dir: DIR.DOWN, text: "The yard's past here. Dodonpa's fortress. You don't want to go in there. ...Suit yourself." });
  }
});
Kit.inn('lunpa_inn', { name: 'Lunpa Inn', price: 30, floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 20, y: 7 } });
Kit.shop('lunpa_itemshop', { name: 'Lunpa Item Shop', shop: 'lunpa_item', floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 6, y: 11 } });
Kit.home('lunpa_house1', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 2, y: 8 }, npcs: [{ id: 'Lunpa', x: 5, y: 5, look: NPC_LOOKS.Lunpa, name: 'Old Lunpa', text: "I am Lunpa, founder of this town. My grandson Dodonpa has shamed our name. If you can free the merchant he holds, I will help you sneak inside. Use Cloak to hide in the shadows from the guards." }] });
Kit.home('lunpa_house2', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 21, y: 14 }, chests: [[9, 3, 'Lucky Medal', 1]] });
Kit.home('lunpa_house_a', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 7, y: 4 }, npcs: [{ id: 'lh_a', x: 5, y: 5, type: 'villager_m', text: "Up here we hear the fortress bells. Two rings, a prisoner. Three rings, dinner. Dodonpa loves his bells." }] });
Kit.home('lunpa_house_d', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 15, y: 12 }, npcs: [{ id: 'lh_d', x: 4, y: 4, type: 'villager_f', text: "My husband is one of Dodonpa's men. He says it's honest work. He says it with his eyes shut." }], chests: [[9, 3, 'Sleep Bomb', 1]] });
Kit.home('lunpa_house_g', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 21, y: 21 }, npcs: [{ id: 'lh_g', x: 6, y: 5, type: 'elder_f', text: "Old Lunpa was a thief too, you know. He stole from the rich. His grandson is less particular." }] });
Kit.home('lunpa_house_h', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 14, y: 22 }, npcs: [{ id: 'lh_h', x: 5, y: 5, type: 'scholar', text: "The Cloak Ball lets an Adept slip past eyes. The guards up in the yard rely on theirs. Draw your own conclusions." }] });
Kit.home('lunpa_house_i', { floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 13, y: 19 }, chests: [[9, 3, 'Nut', 2]] });
Kit.shop('lunpa_weaponshop', { name: 'Lunpa Armory', shop: 'lunpa_weapon', floor: 'cave', wall: 'cavewall', back: { map: 'lunpa', x: 2, y: 17 }, npcs: [{ id: 'lh_j', x: 8, y: 5, type: 'merchant', text: "I sell to the thieves. Someone has to. They pay in things I would rather not ask about." }], build(M) { M.container(2, 7, 'pot'); M.container(9, 7, 'barrel', 'Vial'); M.container(10, 4, 'pot'); } });   // the Vial in the armory's barrel

// ---- the yard before the fortress: two palisades across it, and the guards who watch the gap ----
const LY_LEGEND = { '.': 'grass', 'p': 'path', '#': 'cliff', 'P': { ground: 'grass', obj: 'palisade_face' }, 'T': { ground: 'grass', obj: 'tree' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_small' } };
const LY_ROWS = [
  'T..###########.',   // 0
  'T..###########T',   // 1
  '...###########.',   // 2   the fortress door at 8,2
  'T......pp......',   // 3
  '.##...PppP...T.',   // 4
  '.##PPPP..PPPP##',   // 5   the first palisade
  '.##PPPP..PPPP##',   // 6
  '.##PPPPppPPPP##',   // 7
  '.##...rpp....##',   // 8   the gap the guards watch
  '.##....pp......',   // 9
  '.##.PPPppPPP...',   // 10  the second palisade
  '.##.PPPppPPP...',   // 11
  '....PPPppPPP...',   // 12
  '....PPPppPPP...',   // 13
  '.......pp...r..',   // 14
  '..v...ppp..v...',   // 15
  'T.....ppp.....T',   // 16
  'TTTTTT...TTTTTT',   // 17  the way back down to the town
];
defineMap('lunpa_yard', {
  name: 'Lunpa', w: 15, h: 18, base: 'grass', music: 'trouble', bg: 'grass', entry: { x: 7, y: 16 },
  build(M) {
    M.paint(0, 0, LY_ROWS, LY_LEGEND, { set: 'cliff', faces: 2 });
    for (let x = 6; x <= 8; x++) { M.walkable(x, 17); }
    M.exit(6, 17, 3, 1, 'lunpa', 13, 1, DIR.DOWN);
    M.setObj(8, 2, 'door_cave'); M.walkable(8, 2); M.exit(8, 2, 1, 1, 'lunpa_fortress', 10, 15, DIR.UP, { door: true });
    lunpaGuard(M, 'ly_guard1', 5, 8, DIR.RIGHT, 5, ['Brigand', 'Thief']); lunpaGuard(M, 'ly_guard2', 10, 8, DIR.LEFT, 5, ['Thief', 'Thief']);
    lunpaGuard(M, 'ly_guard3', 7, 3, DIR.DOWN, 4, ['Brigand']);
  }
});
// a guard who looks along the way he faces: an uncloaked party that steps into his sight is caught. Beaten, he
// runs for it and the way is clear (a flag per guard)
function lunpaGuard(M, id, x, y, dir, sight, foes) {
  M.npc(id, x, y, { type: 'guard', name: 'Guard', dir, sight, hideIf: 'lunpa_' + id, script: function* (E) {
    if (G.field.cloaked) { yield E.say("...Huh? Thought I saw something. Must be the wind.", 'Guard'); return; }
    yield E.say("Intruder! Nobody gets past ME!", 'Guard');
    const r = yield* E.battle(foes, { canFlee: false }); if (r !== 'win') return;
    yield E.say("Y-you're too strong! I'm outta here!", 'Guard'); G.set('lunpa_' + id); G.field.refreshNpcs();
  } });
}

// ---- the fortress: carved halls of green stone under purple rock ----
const LF_ENC = [['Thief', 'Thief'], ['Brigand'], ['Brigand', 'Thief']];
function lfGrid(w, h) { const g = []; for (let j = 0; j < h; j++) g.push(new Array(w).fill('#')); return g; }
function lfCarve(g, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < g[j].length) g[j][i] = ch || '.'; }
function lfPaint(M, g, seed) {
  const r = seededRandom(hashStr(seed));
  for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '.' && r() < 0.1) g[j][i] = ',';
  M.paint(0, 0, g.map(a => a.join('')), { '.': 'kt_floor', ',': 'kt_moss', 'c': 'carpet_red', 'j': { ground: 'kt_floor', obj: 'pot' }, 'b': { ground: 'kt_floor', obj: 'barrel' }, 'x': { ground: 'kt_floor', obj: 'crate' }, 'S': { ground: 'kt_floor', obj: 'statue' } }, { cliff: '#', set: 'lfrock', top: 'lf_walltop', face: 'lf_wall', mid: 'lf_walltop' });
}
function lfDoor(M, x, y, to, tx, ty, dir, opts) { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); }
function lfTorch(M, x, y) { M.setObj(x, y, 'torch'); M.light(x, y, 4); }

// the entrance hall: a guard room either side, the stair up at the back
defineMap('lunpa_fortress', {
  name: 'Lunpa Fortress', w: 22, h: 18, base: 'cavewalltop', music: 'trouble', bg: 'cave', indoor: true, enc: LF_ENC, entry: { x: 10, y: 15 },
  build(M) {
    const g = lfGrid(22, 18);
    lfCarve(g, 7, 3, 8, 13); lfCarve(g, 2, 6, 5, 5); lfCarve(g, 15, 6, 5, 5); lfCarve(g, 9, 2, 4, 1);
    g[7][3] = 'x'; g[8][3] = 'x'; g[9][17] = 'b'; g[10][18] = 'j';
    lfPaint(M, g, 'lunpa_fortress');
    lfDoor(M, 10, 16, 'lunpa_yard', 8, 3, DIR.DOWN);
    lfDoor(M, 11, 1, 'lunpa_fortress_2', 3, 25, DIR.UP);
    for (const [x, y] of [[6, 4], [15, 4], [6, 12], [15, 12], [1, 8], [20, 8]]) lfTorch(M, x, y);
    lunpaGuard(M, 'lf_guard1', 4, 9, DIR.RIGHT, 4, ['Brigand', 'Thief']); lunpaGuard(M, 'lf_guard2', 17, 7, DIR.LEFT, 4, ['Thief', 'Thief']);
    M.chest(3, 6, 'Elixir', 2); M.chest(19, 6, 'Vial', 2);
  }
});
// the galleries: three tiers of passages the patrols walk, Tonic in the far cell
defineMap('lunpa_fortress_2', {
  name: 'Lunpa Fortress', w: 30, h: 28, base: 'cavewalltop', music: 'trouble', bg: 'cave', indoor: true, enc: LF_ENC, entry: { x: 3, y: 25 },
  build(M) {
    const g = lfGrid(30, 28);
    lfCarve(g, 2, 22, 26, 4); lfCarve(g, 25, 14, 3, 8); lfCarve(g, 2, 14, 26, 3); lfCarve(g, 2, 6, 3, 8); lfCarve(g, 2, 3, 26, 3);
    lfCarve(g, 12, 9, 6, 5); lfCarve(g, 14, 8, 2, 1);        // the strong-room off the middle tier
    lfCarve(g, 22, 8, 6, 3); lfCarve(g, 24, 11, 2, 3);        // Tonic's cell off the top tier
    lfCarve(g, 8, 17, 3, 5); lfCarve(g, 18, 17, 3, 5);        // the two short cuts between the lower tiers
    g[23][26] = 'b'; g[24][26] = 'b'; g[10][13] = 'x'; g[12][16] = 'j';
    lfPaint(M, g, 'lunpa_fortress_2');
    lfDoor(M, 3, 26, 'lunpa_fortress', 11, 2, DIR.DOWN);
    lfDoor(M, 26, 2, 'lunpa_fortress_3', 4, 19, DIR.UP);
    for (const [x, y] of [[6, 21], [14, 21], [22, 21], [1, 15], [10, 13], [20, 13], [6, 2], [14, 2], [22, 2], [11, 8], [18, 8]]) lfTorch(M, x, y);
    lunpaGuard(M, 'lf_guard3', 14, 24, DIR.LEFT, 6, ['Brigand', 'Brigand']); lunpaGuard(M, 'lf_guard4', 9, 15, DIR.RIGHT, 6, ['Thief', 'Brigand']);
    lunpaGuard(M, 'lf_guard5', 19, 15, DIR.LEFT, 6, ['Brigand']); lunpaGuard(M, 'lf_guard6', 13, 4, DIR.RIGHT, 6, ['Brigand', 'Thief', 'Thief']);
    M.chest(13, 12, 'Mythril Circlet', 1); M.chest(16, 10, 'Coins', 1, { coins: 100 }); M.chest(27, 22, 'Lucky Medal', 1); M.chest(2, 6, 'Power Bread', 1);
    M.djinni('Tonic', 25, 13, { fight: false });
  }
});
// the cells and Dodonpa's hall: the key in the guard's room, Hammet behind bars, the boss on his carpet
defineMap('lunpa_fortress_3', {
  name: 'Lunpa Fortress', w: 24, h: 22, base: 'cavewalltop', music: 'trouble', bg: 'cave', indoor: true, enc: LF_ENC, entry: { x: 4, y: 19 },
  build(M) {
    const g = lfGrid(24, 22);
    lfCarve(g, 2, 16, 20, 4); lfCarve(g, 3, 12, 4, 4); lfCarve(g, 18, 11, 4, 5); lfCarve(g, 10, 8, 4, 8);
    lfCarve(g, 6, 2, 12, 6); lfCarve(g, 9, 3, 6, 5, 'c'); g[2][7] = 'S'; g[2][16] = 'S'; g[13][19] = 'x'; g[13][20] = 'x'; g[19][3] = 'b';
    lfPaint(M, g, 'lunpa_fortress_3');
    lfDoor(M, 4, 20, 'lunpa_fortress_2', 26, 3, DIR.DOWN);
    lfDoor(M, 19, 10, 'lunpa_cell', 4, 5, DIR.UP, { cond: () => G.inventory.has('Cell Key') || G.flag('hammet_freed') });
    M.trigger(19, 11, 1, 1, function* (E) { if (G.inventory.has('Cell Key') || G.flag('hammet_freed')) return; yield E.say("(The cell is locked. A heavy iron key would open it.)"); }, { cond: () => !G.inventory.has('Cell Key') && !G.flag('hammet_freed') });
    for (const [x, y] of [[2, 15], [21, 15], [9, 7], [14, 7], [5, 1], [18, 1], [9, 11], [14, 11]]) lfTorch(M, x, y);
    lunpaGuard(M, 'lf_guard7', 12, 15, DIR.DOWN, 5, ['Brigand', 'Brigand']);
    M.chest(4, 12, 'Cell Key', 1); M.chest(6, 12, 'Water of Life', 1);
    M.npc('Dodonpa', 12, 3, { look: NPC_LOOKS.Dodonpa, name: 'Dodonpa', dir: DIR.DOWN, script: G.flag('hammet_freed') ? undefined : STORY.dodonpa, text: "...Father's word is law. Fine. FINE. Get out of my hall." });
    M.boss('Toadonpa', 14, 3, { done: 'hammet_freed', script: STORY.dodonpa });   // Dodonpa's pet toad squats beside him
    M.npc('Donpa', 11, 5, { look: NPC_LOOKS.Lunpa, name: 'Donpa', dir: DIR.DOWN, cond: () => G.flag('hammet_freed'), text: () => G.flag('hammet_rescued') ? "Master Hammet is safe? Good. Lunpa will be a haven again, if I live long enough to make it one. Take the Mercury Djinni from the back room - I have no use for such things." : "Go quietly, and go now. My son's red-capped men hold the lower halls, and they do not answer to me tonight." });
    M.npc('lf_toad', 10, 4, { type: 'pirate', name: 'Henchman', dir: DIR.DOWN, hideIf: 'hammet_freed', text: "The boss is busy. Counting. He's always counting." });
  }
});
Kit.interior('lunpa_cell', { name: 'Lunpa Fortress', w: 9, h: 8, floor: 'floor_stone', wall: 'wall_in_stone', back: { map: 'lunpa_fortress_3', x: 19, y: 11 }, furn: [['bed', 6, 2], ['bed_foot', 6, 3], ['pot', 1, 5]], npcs: [{ id: 'HammetCell', x: 4, y: 3, look: NPC_LOOKS.Hammet, name: 'Master Hammet', hideIf: 'hammet_freed', text: "Isaac! Ivan! You came for me! Dodonpa is in his hall past the cells. Beat him and he will have to let me go." }] });

// the thieves' secret cavern behind the picture of rock above the north gate: six chests, nothing else
defineMap('lunpa_secret', {
  name: 'Lunpa', w: 13, h: 9, base: 'cavewalltop', music: 'trouble', bg: 'cave', indoor: true, entry: { x: 6, y: 6 },
  build(M) {
    M.cave(1, 1, 11, 7); M.walkable(6, 7); M.setObj(6, 7, 'door_cave'); M.exit(6, 7, 1, 1, 'lunpa', 11, 2, DIR.RIGHT, { door: true });
    M.chest(2, 2, 'Coins', 1, { coins: 44 }); M.chest(4, 2, 'Antidote', 1); M.chest(6, 2, 'Elixir', 1); M.chest(8, 2, 'Lucky Medal', 1); M.chest(10, 2, 'Smoke Bomb', 1); M.chest(6, 5, 'Water of Life', 1);
    M.setObj(1, 4, 'torch'); M.setObj(11, 4, 'torch'); M.light(1, 4, 3); M.light(11, 4, 3);
  }
});
