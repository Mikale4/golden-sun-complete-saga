// ---------- Vale ----------
// The town is built from VALE_LAYOUT (js/maps/vale_layout.js), which tools/vale_gen.py reads off the reference
// rips: every cliff line, the river and its three rope bridges, the houses with their doors, the trees. Four
// districts, as the rip is cut: the long northern town round the river (Sol Sanctum's stairs at the top, the
// sanctum, the houses on the east bank, the falls at the bottom), the plaza and gate to the east of the lower
// river, Kraden's terraces to the west, and the road north to the cave. The storm of the prologue is the same
// town in the rain, with the river in flood and a rockfall across the middle bridge.
'use strict';

// '.' grass, ':' path, '~' water, 'W' waterfall, 'B' rope bridge, 'S' steps cut into a cliff, 'k' stone,
// '#' cliff (auto-edged), 'D' a cave mouth, 'C' stacked crates, 'L' a rolled log
const VALE_LEGEND = {
  '.': 'grass', ':': 'path', '~': 'water', 'k': 'stonefloor',
  'W': { ground: 'water', obj: 'waterfall_mid' },
  'B': { ground: 'water', obj: 'rope_bridge', walk: true },
  'S': { ground: 'grass', obj: 'stairs', walk: true },
  'D': { ground: 'grass', obj: 'door_cave' },
  'C': { ground: 'grass', obj: 'crate_stack' }, 'L': { ground: 'grass', obj: 'log_roll' }
};

// the ground, cliffs, trees, bushes and rocks of a district, straight from the layout
function valeGround(M, L, opts) {
  opts = opts || {};
  M.paint(0, 0, L.rows, Object.assign({}, VALE_LEGEND, opts.legend || {}), { set: 'cliff', faces: 2 });
  M.plankBridge(0, 0, L.rows, 'B');
  // a fall's first row is its lip and its last the plunge pool
  // the fall's lip and foam come from the waterfall pieces themselves (field.js autoPiece)
  for (const [x, y, red] of L.trees) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
  for (const [x, y] of L.bushes) M.setObj(x, y, 'bush');
  for (const [x, y] of L.rocks) M.setObj(x, y, 'rock_grass');
  for (const [x, y] of (L.fences || [])) M.setObj(x, y, 'fence');
}
// a house from the layout, by the letter the rip gives its door
function valeHouse(M, L, letter, opts) {
  const h = L.houses.find(h => h.letter === letter); if (!h) return null;
  return M.house(h.x, h.y, h.w, h.h, 'roof_thatch', Object.assign({ doorX: h.doorX, tx: 6, ty: 8 }, opts || {}));
}
// the night of the storm: every house, shop, the inn and the sanctum are shut, their people gone to the plaza or
// hiding indoors; only the streets, the bridges and the terraces are open
function valeLockDoors(M) {
  const outdoor = new Set(['vale_past', 'vale_west_past', 'vale_south_past', 'vale_north', 'sol_sanctum_1', 'world_gs1']);
  const shut = M.exits.filter(e => !outdoor.has(e.to)); M.exits = M.exits.filter(e => outdoor.has(e.to));
  for (const e of shut) {
    const line = e.to === 'vale_isaac_house_past' ? "The door has shut behind them. Mom has gone on ahead - there is nothing to go back for tonight." : e.to === 'vale_kraden_house' ? "The door is barred, and Kraden's lamp is out. He must have gone up to the plaza with the elders." : e.to === 'vale_sanctum' ? 'The sanctum is shut. The healers are up on the mountain with the elders.' : e.to === 'vale_inn' ? 'The inn is bolted. Nobody is taking travelers in tonight.' : 'The door is locked. Everyone has run for the plaza, or is hiding from the storm.';
    M.trigger(e.x, e.y, e.w, e.h, function* (E) { yield E.say(line); yield E.move('player', DIR.DOWN, 1); });
  }
}
// The terraces of Vale climb by ramps cut slantwise into the cliff faces, as in the game. The layout has each
// passage as a straight gap through the face; here every such gap becomes a diagonal run of ramp cells, one per
// face row, with the gap's other cells closed back into rock. A ramp rises to the north-east when the terrace
// above has footing to the right of the run, to the north-west otherwise. `keep` lists the stairs left as stairs.
function valeRamps(M, keep) {
  keep = keep || [];
  // solidity as finalize() will compute it (the map is still being built)
  const solid = (x, y) => { if (!M.inb(x, y)) return true; const i = M.idx(x, y); const gt = Tiles.byId[M.ground[i]], ot = M.obj[i] ? Tiles.byId[M.obj[i]] : null; let s = gt.solid ? 1 : 0; if (ot && ot.solid) s = 1; if (ot && ot.door) s = 0; if (M.solidOverride[i] === 0) s = 0; else if (M.solidOverride[i] === 1) s = 1; return s === 1; };
  const cliff = (x, y) => M.inb(x, y) && solid(x, y) && /cliff/.test((M.getObj(x, y) || M.get(x, y)).name);
  const onExit = (x, y) => M.exits.some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
  const walk = (x, y) => M.inb(x, y) && !solid(x, y) && !onExit(x, y) && !M.objects.some(o => !o.gone && o.x === x && o.y === y) && !M.npcs.some(n => n.x === x && n.y === y);
  // the runs: cells walkable on two rows with rock at both ends
  const runs = [];
  for (let y = 1; y < M.h - 2; y++) { let x = 1; while (x < M.w - 1) {
    if (walk(x, y) && walk(x, y + 1) && cliff(x - 1, y) && cliff(x - 1, y + 1)) {
      let x1 = x; while (x1 + 1 < M.w - 1 && walk(x1 + 1, y) && walk(x1 + 1, y + 1)) x1++;
      if (cliff(x1 + 1, y) && cliff(x1 + 1, y + 1) && x1 - x < 4) { let top = 0, bot = 0; for (let k = x; k <= x1; k++) { if (walk(k, y - 1)) top++; if (walk(k, y + 2)) bot++; } if (top && bot) runs.push({ x0: x, x1, y0: y, y1: y + 1 }); }
      x = x1 + 1;
    } else x++;
  } }
  // runs stacked on the same columns are one taller gap
  const gaps = []; for (const r of runs) { const g = gaps.find(q => q.x0 === r.x0 && q.x1 === r.x1 && r.y0 <= q.y1 + 1 && r.y0 >= q.y0); if (g) g.y1 = Math.max(g.y1, r.y1); else gaps.push(Object.assign({}, r)); }
  for (const gp of gaps) {
    if (keep.some(k => k[0] === gp.x0 && k[1] === gp.y0)) continue;
    if (gp.x1 !== gp.x0) continue;   // a wide break in the terrace is open ground, not a ramp
    const h = gp.y1 - gp.y0 + 1; let dir = null;
    if (walk(gp.x0, gp.y1 + 1) && walk(gp.x0 + h, gp.y0 - 1) && (cliff(gp.x0 + h - 1, gp.y0) || walk(gp.x0 + h - 1, gp.y0))) dir = 'ne';
    else if (walk(gp.x1, gp.y1 + 1) && walk(gp.x1 - h, gp.y0 - 1) && (cliff(gp.x1 - h + 1, gp.y0) || walk(gp.x1 - h + 1, gp.y0))) dir = 'nw';
    if (!dir) continue;
    const cells = []; for (let k = 0; k < h; k++) cells.push(dir === 'ne' ? [gp.x0 + k, gp.y1 - k] : [gp.x1 - k, gp.y1 - k]);
    const face = M.getObj(gp.x0 - 1, gp.y1) ? null : M.get(gp.x0 - 1, gp.y1).name;   // the rock the gap's other cells close into
    const lo = Math.min(gp.x0, ...cells.map(c => c[0])), hi = Math.max(gp.x1, ...cells.map(c => c[0]));
    for (let y = gp.y0; y <= gp.y1; y++) for (let x = lo; x <= hi; x++) {
      if (cells.some(c => c[0] === x && c[1] === y)) { M.set(x, y, dir === 'ne' ? 'ramp_ne' : 'ramp_nw'); M.setObj(x, y, null); M.walkable(x, y); }
      else if (x >= gp.x0 && x <= gp.x1) { M.set(x, y, face && /cliff/.test(face) ? face : 'cliff_mid'); M.setObj(x, y, null); M.block(x, y); }
    }
  }
}
// one slope cut slantwise into a cliff: `cells` climb it from the bottom up, `rock` are the cells of the old
// straight cut that close back into the face
function valeRampAt(M, dir, cells) {
  for (const [x, y] of cells) { M.setObj(x, y, dir === 'ne' ? 'ramp_ne' : 'ramp_nw'); M.walkable(x, y); }
}
// the layout with a cut closed into rock, so paint() draws the face whole across it
function valeRowsWithRock(L, cells) { const rows = L.rows.map(r => r.split('')); for (const [x, y] of cells) rows[y][x] = '#'; return Object.assign({}, L, { rows: rows.map(r => r.join('')) }); }
// where the player stands after stepping out of a door
function valeDoorstep(L, letter) { const h = L.houses.find(h => letter ? h.letter === letter : !h.letter); return { x: h.x + h.doorX, y: h.y + h.h }; }

// ---- the northern town: 30 x 93 ----
function valeNorthHouses(M, past) {
  const L = VALE_LAYOUT.main;
  valeHouse(M, L, 'D', { to: 'vale_house_above' });                       // the home on the terrace above the river
  valeHouse(M, L, 'C', { to: 'vale_garet_house', chimney: true });        // Garet's family, right above Isaac's
  valeHouse(M, L, 'A', { to: 'vale_isaac_house', chimney: true });        // Isaac's
  valeHouse(M, L, 'G', { to: 'vale_jenna_house' });                       // Jenna's grandparents', by the falls
  valeHouse(M, L, 'F', { to: 'vale_house_f' });                           // the house below it
  const dock = L.houses.find(h => !h.letter);                              // the house with the pier on the west bank
  M.house(dock.x, dock.y, dock.w, dock.h, 'roof_thatch', { doorX: dock.doorX, to: 'vale_mill_house', tx: 6, ty: 8 });
  M.fill(8, 72, 3, 1, 'dock'); M.fillObj(8, 72, 3, 1, null); M.walkable(8, 72, 3, 1);                   // its pier out over the river
  // the sanctum, set into the cliff above the river's first fall
  M.landmark('vale_sanctum', 14, 10, { to: 'vale_sanctum', tx: 6, ty: 8 });
  // Sol Sanctum: up the stairs at the top of the town, past the guard
  M.exit(6, 0, 2, 1, 'sol_sanctum_1', 44, 37, DIR.UP, { door: true, cond: () => past ? false : G.flag('sanctum_open') });
  if (!past) M.trigger(6, 1, 2, 1, function* (E) { if (!G.flag('sanctum_open')) { yield E.say('Sol Sanctum is forbidden! Only the elders may enter.', 'Guard'); yield E.move('player', DIR.DOWN, 1); } }, { cond: () => !G.flag('sanctum_open') });
  // pots and barrels by the doors
  M.container(27, 33, 'pot'); M.container(27, 34, 'pot'); M.container(26, 44, 'barrel'); M.container(25, 72, 'pot'); M.container(20, 77, 'crate');
  // the Nut in the tree on the tongue of land below the middle bridge: Catch brings it down
  M.object('catchable', 9, 56, { id: 'vale_nut', item: 'Nut', look: null });
}

defineMap('vale', {
  name: 'Vale', w: 30, h: 93, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 21, y: 46 },
  build(M) {
    valeGround(M, VALE_LAYOUT.main);
    valeNorthHouses(M, false);
    const S = STORY;
    // ways out: west to Kraden's terraces (two paths), east below the falls to the plaza
    M.exit(0, 28, 1, 2, 'vale_west', 28, 15, DIR.LEFT); M.exit(0, 41, 1, 2, 'vale_west', 28, 28, DIR.LEFT); M.exit(29, 84, 1, 1, 'vale_south', 1, 11, DIR.RIGHT);
    // the townsfolk
    M.npc('Dora', 24, 47, { look: NPC_LOOKS.Dora, name: 'Dora', move: 'wander', cond: () => G.flag('vale_morning'), text: () => G.flag('sanctum_done') ? "Isaac... please be careful out there. Your father would be proud of you." : G.flag('kraden_met') ? "You're off to see Kraden? Don't let him talk your ear off." : "Isaac, dear. You've grown so much since... that night.", mind: () => G.flag('sanctum_done') ? "I lost Kyle to that storm. I couldn't bear to lose Isaac too..." : "He looks more like his father every day." });
    M.npc('elder', 18, 14, { type: 'elder_m', name: 'Great Healer', text: () => G.flag('sanctum_done') ? "The Wise One has spoken. Isaac, Garet... the fate of Weyard rests with you." : "Mt. Aleph has been restless lately. Sol Sanctum must not be disturbed." });
    M.npc('vale_guard', 8, 1, { type: 'guard', name: 'Guard', text: () => G.flag('sanctum_done') ? "Go on through. The elders have given permission." : "Sol Sanctum is forbidden! Only the elders may enter." });
    M.npc('vale_woman1', 24, 24, { type: 'villager_f', move: 'wander', text: "Three years ago, the Mt. Aleph Boulder nearly destroyed our village. Isaac's father Kyle, and Jenna's parents... we lost so many.", mind: "Poor Dora. She still waits by the window at night." });
    M.npc('vale_man1', 24, 38, { type: 'villager_m', move: 'wander', text: "Kraden lives up on the western terraces. He's a scholar from Tolbi who came to study Alchemy... whatever that is.", mind: "Alchemy, alchemy. The man never talks about anything else." });
    M.npc('vale_man2', 21, 72, { type: 'villager_m', move: 'wander', text: "Did you know? Everyone in Vale has a little Psynergy. It's the blessing of Mt. Aleph.", mind: "Mine only ever seems to work on the laundry." });
    M.npc('vale_fisher', 10, 72, { type: 'villager_m', dir: DIR.RIGHT, text: "The river's been kind since the flood. Fat trout, all summer.", mind: "Nothing bites when the boy from the big house is watching." });
    M.npc('vale_dog', 22, 49, { animal: 'dog', animalCol: '#c09060', move: 'wander', text: 'Woof!', solid: true });
    // the puppies planted across the road up to Sol Sanctum, until the morning the strangers came through
    for (const [i, [x, y]] of [[6, 2], [7, 2], [9, 2]].entries()) M.npc('vale_pup' + i, x, y, { animal: 'dog', animalCol: ['#d8b080', '#a07040', '#e8d0a0'][i], name: 'Puppy', dir: DIR.DOWN, solid: true, cond: () => !G.flag('vale_saturos_scene'), text: 'Arf! Arf! (The puppies have planted themselves across the path and will not budge.)' });
    // the adept who hides behind the tree on the sanctum road and paces to the little shrine: pass while his back is turned
    M.setObj(9, 6, 'statue'); M.walkable(9, 6, 1, 1); M.block(9, 6);
    M.npc('AlexHide', 3, 6, { look: NPC_LOOKS.Alex, name: '???', dir: DIR.DOWN, sight: 3, move: 'patrol', patrol: [[3, 6], [8, 6]], face: DIR.DOWN, patrolWait: 60, cond: () => G.flag('sanctum_open') && !G.flag('sanctum_done'),
      script: function* (E) { yield E.say('(A figure in blue steps out from behind the tree, sees the party - and is behind the little shrine before anyone can speak.)'); yield E.say("Somebody's watching the road. Somebody who doesn't want to be seen.", 'Garet'); G.set('alex_glimpsed'); yield E.move('player', DIR.DOWN, 1); } });
    // Garet, waiting in Isaac's yard, before he joins
    M.npc('GaretNPC', 23, 46, { look: CHARACTERS.Garet.look, name: 'Garet', hideIf: 'garet_joined', text: "Isaac! Kraden wants to see us. Let's go to his cottage!", script: S.garetJoins });
    // after Sol Sanctum the whole town gathers in front of the sanctum
    M.trigger(12, 12, 17, 4, S.afterSanctum, { once: 'after_sanctum_scene', cond: () => G.flag('sanctum_escaped') });
  }
});
defineMap('vale_past', {
  name: 'Vale', w: 30, h: 93, base: 'grass', music: 'storm', bg: 'grass', tint: 'rgba(10,10,60,0.45)', rain: true, entry: { x: 21, y: 46 },
  build(M) {
    valeGround(M, VALE_LAYOUT.main, { legend: { '~': 'deepwater', 'W': { ground: 'deepwater', obj: 'waterfall_mid' }, 'B': { ground: 'deepwater', obj: 'rope_bridge', walk: true } } });   // the river in flood
    valeNorthHouses(M, true);
    M.exit(0, 28, 1, 2, 'vale_west_past', 28, 15, DIR.LEFT); M.exit(0, 41, 1, 2, 'vale_west_past', 28, 28, DIR.LEFT); M.exit(29, 84, 1, 1, 'vale_south_past', 1, 11, DIR.RIGHT);
    // the elders up on the mountain with the Boulder held over the sanctum, and the man who calls down to the boys
    for (const [x, y] of [[15, 7], [16, 7], [15, 8], [16, 8]]) M.npc('bigrock_' + x + '_' + y, x, y, { animal: 'boulder', animalCol: '#6a6a78', name: 'Boulder', solid: false, text: '' });
    M.npc('storm_elder1', 14, 14, { type: 'elder_m', name: 'Elder', dir: DIR.UP, text: "Ugh... It's too heavy! We can't hold it for long!" });
    M.npc('storm_elder2', 18, 14, { type: 'priest', name: 'Elder', dir: DIR.UP, text: "If our Psynergy runs out, Vale will be destroyed!" });
    M.npc('storm_man', 16, 14, { type: 'villager_m', name: 'Man', dir: DIR.UP, text: "Hurry, boys! Run!!! It's just a little farther!" });
    for (const [x, y] of [[20, 11], [21, 11], [11, 9], [12, 9]]) M.setObj(x, y, 'rock_grass');   // the storm has brought the slopes down across both ways up past the sanctum
    // Garet outside his family's house, tugging at a chest with a rope round it
    M.npc('GaretNPC', 17, 42, { look: CHARACTERS.Garet.look, name: 'Garet', dir: DIR.RIGHT, script: STORY.stormGaret, hideIf: 'garet_joined' });
    M.setObj(18, 42, 'chest');
    // the rocks that come down in the storm stay where they fell
    if (G.flag('storm_rock1')) for (const x of [12, 13, 14]) M.object('boulder', x, 48, { id: 'storm_rock_' + x + '_48' });
    if (G.flag('storm_rock2')) M.object('boulder', 6, 39, { id: 'storm_rock_6_39' });
    M.trigger(13, 46, 2, 1, STORY.stormRock1, { once: 'storm_rock1', cond: () => G.flag('storm_alone') });
    M.trigger(3, 35, 4, 2, STORY.stormRock2, { once: 'storm_rock2', cond: () => G.flag('storm_bridge') });
    M.trigger(7, 21, 7, 1, STORY.stormBridge, { once: 'storm_bridge', cond: () => G.flag('garet_joined') });
    // the river below the falls: Felix off the end of the pier, his family and Isaac's on the boards
    const atRiver = () => G.flag('storm_battle1') && !G.flag('boulder_fell');
    M.setObj(12, 72, 'stake');
    M.npc('FelixNPC', 12, 73, { look: CHARACTERS.Felix.look, name: 'Felix', dir: DIR.LEFT, text: "Help...!", solid: false, cond: atRiver });
    M.npc('KyleRiver', 10, 72, { look: NPC_LOOKS.Kyle, name: 'Kyle', dir: DIR.RIGHT, text: "Hang on, Felix! Isaac, get to the plaza!", cond: atRiver });
    M.npc('ManRiver', 9, 72, { type: 'villager_m', name: 'Man', dir: DIR.RIGHT, text: "My boy... hold on, Felix!", cond: atRiver });
    M.npc('DoraP', 9, 71, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.RIGHT, text: "Felix will be all right...", cond: () => atRiver() && !G.flag('felix_seen') });
    M.npc('JennaP', 8, 71, { look: CHARACTERS.Jenna.look, name: 'Jenna', dir: DIR.RIGHT, text: "My brother...!", cond: () => atRiver() && !G.flag('felix_seen') });
    M.trigger(0, 65, 4, 4, STORY.stormFelix, { once: 'storm_felix', cond: () => G.flag('storm_battle1') });
    M.trigger(12, 82, 4, 1, STORY.stormReturn, { once: 'storm_return', cond: () => G.flag('jenna_help') });
    valeLockDoors(M);
  }
});

// ---- the plaza and the gate, east of the lower river: 30 x 57 ----
defineMap('vale_south', {
  name: 'Vale', w: 30, h: 57, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 13, y: 55 },
  build(M) { valeSouth(M, false); }
});
defineMap('vale_south_past', {
  name: 'Vale', w: 30, h: 57, base: 'grass', music: 'storm', bg: 'grass', tint: 'rgba(10,10,60,0.45)', rain: true, entry: { x: 1, y: 11 },
  build(M) { valeSouth(M, true); valeLockDoors(M); }
});
function valeSouth(M, past) {
  const L = VALE_LAYOUT.south; valeGround(M, L);
  const S = STORY;
  // the houses of the terraces, the shop and the inn round the plaza
  valeHouse(M, L, 'H', { to: 'vale_house_h', chimney: true });                                   // the highest home on the east side
  valeHouse(M, L, 'Q', { to: 'vale_shack_q', tx: 5, ty: 7 });                                                  // the shack with the Psynergy Stone
  valeHouse(M, L, 'I', { to: 'vale_house_i', chimney: true });
  valeHouse(M, L, 'J', { to: 'vale_house_j', chimney: true });                                   // a plateau lower
  valeHouse(M, L, 'K', { to: 'vale_shop', tx: 6, ty: 6, sign: 'shop_sign', chimney: true });     // the shop: items, weapons, armour
  valeHouse(M, L, 'L', { to: 'vale_smith_house', chimney: true });                               // the smith's home
  valeHouse(M, L, 'M', { to: 'vale_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true });      // the inn
  M.setObj(25, 6, 'barrel'); M.setObj(25, 7, 'crate'); M.setObj(19, 15, 'pot');                 // by the doors
  // the Psynergy Stone on its rock in the plaza pond, reached over two stepping stones
  M.setObj(13, 42, 'crystal_large'); M.setObj(14, 42, 'psystone');
  // the village gate
  M.setObj(12, 52, 'wooden_arch_l'); M.setObj(13, 52, 'wooden_arch_r'); M.walkable(12, 52, 2, 1);
  M.exit(12, 56, 3, 1, 'world_gs1', 44, 11, DIR.DOWN); M.exit(0, 11, 1, 1, past ? 'vale_past' : 'vale', 28, 84, DIR.LEFT);
  // the bush behind the shop hides the mouth of a little cavern (Whirlwind clears it); a Power Bread waits inside
  M.object('leaves', 11, 28, { id: 'vale_cavern_bush' });
  M.setObj(8, 16, null); M.object('leaves', 8, 16, { id: 'vale_foliage_a', onClear: function* (E) { yield E.say('The leaves scatter. Nothing behind them but the bank.'); } });
  M.setObj(28, 17, null); M.object('leaves', 28, 17, { id: 'vale_foliage_b', onClear: function* (E) { yield E.say('The leaves scatter. Nothing behind them but the bank.'); } });
  M.walkable(11, 27); M.exit(11, 27, 1, 1, 'vale_cavern', 4, 8, DIR.UP, { door: true });
  if (past) {
    // the plaza the night of the storm: Garet's grandfather with the men, Jenna come for help, the one man with
    // Psynergy left up on the stone in the pond
    const plaza = () => G.flag('felix_seen') && !G.flag('jenna_help');
    M.npc('JennaNPC', 12, 48, { look: CHARACTERS.Jenna.look, name: 'Jenna', dir: DIR.UP, text: "Grandpa, please... my brother's in the river!", cond: plaza });
    M.npc('storm_mayor', 14, 47, { type: 'elder_m', name: "Garet's Grandfather", dir: DIR.DOWN, text: () => G.flag('jenna_help') ? "Hurry back to the river, boys. And be careful of the rocks!" : "Go aid the elders! The Boulder is too heavy for them to hold much longer." });
    M.npc('storm_man1', 11, 47, { type: 'villager_m', name: 'Man', dir: DIR.DOWN, text: "We can't let the Mt. Aleph Boulder destroy our village.", cond: plaza });
    M.npc('storm_man2', 16, 47, { type: 'villager_m', name: 'Other Man', dir: DIR.DOWN, text: "Let's go help the elders.", cond: plaza });
    M.npc('charged', 13, 44, { type: 'villager_m', name: 'Man', dir: DIR.UP, text: "Just a little longer on the stone...", cond: plaza });
    M.npc('storm_f1', 7, 40, { type: 'villager_f', text: "The plaza is the only safe place... Mt. Aleph is angry tonight." });
    M.npc('storm_kid', 19, 44, { type: 'child_f', text: "I'm scared! The ground keeps shaking!" });
    M.trigger(2, 10, 1, 3, STORY.stormBattle4, { once: 'storm_battle4', cond: () => G.flag('felix_seen') && !G.flag('jenna_help') });   // over the bridge from the river, one more fight
    M.trigger(9, 46, 8, 4, STORY.stormJenna, { once: 'storm_plaza', cond: () => G.flag('felix_seen') });
    // the town gate is barred against the storm: nobody leaves Vale tonight
    M.exits = M.exits.filter(e => e.to !== 'world_gs1');
    M.trigger(9, 54, 9, 2, function* (E) { yield E.say(G.flag('garet_joined') ? "The gate's barred, Isaac! Nobody's getting out of Vale tonight - and we're supposed to be at the plaza, not out there!" : "The gate is barred against the storm. Mom said the plaza. Not out there."); yield E.move('player', DIR.UP, 1); });
    return;
  }
  M.npc('vale_kid1', 7, 47, { type: 'child_m', move: 'wander', text: "Garet's grandpa is the mayor! That means Garet's gonna be mayor someday. Scary!", mind: "Garet as mayor... we'd all have to eat as much as he does!" });
  M.npc('vale_kid2', 19, 44, { type: 'child_f', move: 'wander', text: "The Psynergy Stone makes me feel all tingly!", mind: "If I touch it enough times, maybe I'll get Psynergy too!" });
  M.npc('vale_woman2', 24, 21, { type: 'villager_f', move: 'wander', text: "A group of men came into town the other day. Rude ones - they never even paid their respects to the mayor.", mind: "One of them wore a mask. In this heat! What is he hiding?" });
  M.npc('vale_elder2', 6, 16, { type: 'elder_f', text: "The Boulder never fell. The elders held it, that night, with their Psynergy... and it cost them dearly.", mind: "Three years, and I still hear the mountain groan in my sleep." });
  M.npc('vale_man3', 26, 33, { type: 'villager_m', move: 'wander', text: "Master Hammet's merchant wagons pass through Vault sometimes. Fine goods from Kalay.", mind: "One day I'll see Kalay for myself. One day." });
  M.npc('vale_shop_lady', 16, 32, { type: 'villager_f', dir: DIR.LEFT, name: 'Shop Lady', text: () => G.flag('sanctum_done') ? "You're off on a journey? Here, take this for the road." : "Business is slow today. Everyone's talking about those strangers.", script: function* (E) { if (G.flag('sanctum_done') && !G.flag('vale_shop_herb')) { G.set('vale_shop_herb'); yield E.give('Herb'); } } });
  // the whole approach to the gate, so a walk under the trees beside it cannot slip past
  M.trigger(9, 53, 9, 3, S.leaveVale, { once: 'left_vale_first', cond: () => G.flag('sanctum_done') });
  M.trigger(9, 54, 9, 2, S.cantLeaveVale, { cond: () => G.game === 1 && !G.flag('sanctum_done') });   // only blocks during the Golden Sun prologue, never on a Lost Age revisit
}
// the cavern behind the shop
defineMap('vale_cavern', {
  name: 'Vale', w: 9, h: 10, base: 'void', indoor: true, music: 'cave', bg: 'cave', entry: { x: 4, y: 8 },
  build(M) { M.cave(0, 0, 9, 10); M.open(4, 9, 1, 1); M.walkable(4, 9); M.exit(4, 9, 1, 1, 'vale_south', 11, 28, DIR.DOWN); M.chest(4, 3, 'Power Bread', 1); }
});

// ---- Kraden's terraces, west of the river: 30 x 35 ----
defineMap('vale_west', {
  name: 'Vale', w: 30, h: 35, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 28, y: 15 },
  build(M) { valeWest(M, false); }
});
defineMap('vale_west_past', {
  name: 'Vale', w: 30, h: 35, base: 'grass', music: 'storm', bg: 'grass', tint: 'rgba(10,10,60,0.45)', rain: true, entry: { x: 28, y: 15 },
  build(M) { valeWest(M, true); }
});
function valeWest(M, past) {
  const L = VALE_LAYOUT.west; valeGround(M, L);
  const S = STORY;
  // Kraden's cabin on the upper terrace, the Elixir in the upper of the two jars beside it
  valeHouse(M, L, 'O', { to: 'vale_kraden_house', chimney: true });
  M.container(16, 8, 'pot', 'Elixir'); M.container(16, 9, 'pot');
  M.exit(29, 15, 1, 2, past ? 'vale_past' : 'vale', 1, 28, DIR.RIGHT); M.exit(29, 27, 1, 3, past ? 'vale_past' : 'vale', 1, 41, DIR.RIGHT); M.exit(0, 0, 7, 1, 'vale_north', 3, 19, DIR.UP);
  // the boulder in the gap of the wall beside the cabin: the pocket behind it, and the road north to the cave, are
  // reached only once Lift has moved it - the rest of the terrace is walled off from that pocket
  for (const [x, y] of [[8, 4], [8, 5], [8, 8], [8, 9], [7, 10], [7, 11]]) M.setObj(x, y, 'rock_grass');
  M.object('boulder', 4, 13, { id: 'vale_cave_rock' });
  if (past) {
    M.npc('injured', 5, 14, { type: 'villager_m', name: 'Injured Man', dir: DIR.DOWN, script: STORY.stormInjured });
    // the first monsters of the game wait on the way up to the cabin
    M.trigger(22, 16, 1, 2, STORY.stormBattle1, { once: 'storm_battle1' });
    M.trigger(16, 11, 1, 2, STORY.stormBattle2, { once: 'storm_battle2' });
    M.trigger(8, 10, 1, 2, STORY.stormBattle3, { once: 'storm_battle3' });
    valeLockDoors(M);
    return;
  }
  // Jenna waits outside Kraden's cabin; Saturos and Menardi are met on the way up from the town
  M.npc('JennaNPC', 16, 10, { look: CHARACTERS.Jenna.look, name: 'Jenna', showIf: 'garet_joined', hideIf: 'jenna_joined', script: S.meetJennaKraden });
  M.trigger(24, 15, 2, 2, S.valeSaturosMenardi, { once: 'vale_saturos_scene', cond: () => G.flag('garet_joined') && !G.flag('kraden_met') });
  M.npc('vale_man4', 5, 14, { type: 'villager_m', text: "Kraden's always got his nose in a book. He came all the way from Tolbi to study Mt. Aleph.", mind: "Three years ago I was sure I'd die right here. Now look at me: hoeing beans." });
  M.npc('vale_kid3', 20, 25, { type: 'child_m', move: 'wander', text: "There's a cave up past Kraden's, behind a big rock. Nobody's strong enough to move it.", mind: "I bet there's treasure behind it." });
}

// ---- the road north to the cave: 20 x 21 ----
defineMap('vale_north', {
  name: 'Vale', w: 20, h: 21, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 3, y: 19 },
  build(M) {
    valeGround(M, VALE_LAYOUT.north);
    M.exit(0, 20, 9, 1, 'vale_west', 3, 1, DIR.DOWN);
    // the cave in the cliff, its crates and logs beside it
    M.walkable(7, 8); M.exit(7, 8, 1, 1, 'vale_cave', 1, 10, DIR.RIGHT, { door: true });
    M.npc('vale_north_man', 6, 12, { type: 'villager_m', text: "Bees nest in that cave. Big ones. Take a torch if you go in... and something to swat with.", mind: "Some nights I hear something moving around in there." });
  }
});

// ---- inside the houses ----
const VL = VALE_LAYOUT;
// Isaac's house: the kitchen downstairs, his room up the stairs. The night of the storm the same rooms open onto
// the town in the rain, so both floors exist for either era
for (const era of ['', '_past']) {
  const town = era ? 'vale_past' : 'vale';
  Kit.home('vale_isaac_house' + era, { name: "Isaac's House", back: Object.assign({ map: town }, valeDoorstep(VL.main, 'A')), stairs: { x: 10, y: 3, to: 'vale_isaac_room' + era, tx: 8, ty: 5 },
    npcs: era ? [] : [{ id: 'dora_home', x: 4, y: 4, look: NPC_LOOKS.Dora, name: 'Dora', script: STORY.doraHome, cond: () => G.flag('kraden_met') }],
    chests: era ? [] : [[9, 3, 'Herb', 2]], build(M) { M.container(2, 7, 'barrel'); } });
  Kit.interior('vale_isaac_room' + era, { name: "Isaac's Room", w: 10, h: 8, furn: [['bed', 4, 2], ['bed_foot', 4, 3], ['shelf', 1, 2], ['bookshelf', 7, 2], ['table', 2, 5], ['chair', 3, 5], ['wardrobe', 6, 2]],
    stairs: { x: 8, y: 5, to: 'vale_isaac_house' + era, tx: 10, ty: 4, down: true }, doorX: -1 });
}
Kit.home('vale_house_above', { name: 'House', back: Object.assign({ map: 'vale' }, valeDoorstep(VL.main, 'D')), npcs: [{ id: 'v_above', x: 5, y: 5, type: 'villager_f', text: "Isaac's mother has been so much brighter since he took up with Kraden's studies. It gives them both something to think about.", mind: "Poor Dora. Poor, poor Dora." }], build(M) { M.container(9, 7, 'pot', 'Coins', 6); } });
Kit.home('vale_garet_house', { name: "Garet's House", back: Object.assign({ map: 'vale' }, valeDoorstep(VL.main, 'C')), npcs: [{ id: 'garet_mom', x: 4, y: 4, type: 'villager_f', name: "Garet's Mother", script: STORY.garetFamily, mind: "He eats for three and thinks for half of one. But he has a good heart." }, { id: 'garet_dad', x: 7, y: 3, type: 'villager_m', name: "Garet's Father", text: "That boy. Off with Isaac again, I suppose.", mind: "He'll make something of himself yet. I hope." }, { id: 'garet_gramp', x: 9, y: 5, type: 'elder_m', name: 'Mayor', text: () => G.flag('sanctum_done') ? "Isaac, Garet. The elders have spoken. Go, and may the blessing of Vale go with you." : "Welcome, Isaac. Garet's not here, if that's what you're after. He never is.", mind: "The boy will be mayor after me, heaven help this village." }, { id: 'garet_sis', x: 8, y: 6, type: 'child_f', name: "Garet's Sister", text: () => G.flag('sanctum_done') ? "Big brother's going on a journey? Take this, then... and bring him back!" : "Big brother says he's going to be the strongest Adept in Vale. As if!", script: function* (E) { if (G.flag('sanctum_done') && !G.flag('garet_sis_herb')) { G.set('garet_sis_herb'); yield E.give('Herb'); } } }] });
Kit.home('vale_jenna_house', { name: "Jenna's Grandparents' House", back: Object.assign({ map: 'vale' }, valeDoorstep(VL.main, 'G')), npcs: [{ id: 'jenna_gran', x: 4, y: 4, type: 'elder_f', name: "Jenna's Grandmother", text: "Since that night, Jenna has been all we have left. She puts on a brave face.", mind: "Felix... my grandson. The river never gave him back." }, { id: 'jenna_gramp', x: 8, y: 5, type: 'elder_m', name: "Jenna's Grandfather", text: "Kraden's a good man. He's given the girl something to hold on to.", mind: "If those two young fools get her hurt on that mountain, I'll never forgive them." }], build(M) { M.container(1, 7, 'barrel', 'Antidote'); } });
Kit.home('vale_mill_house', { name: 'House', back: Object.assign({ map: 'vale' }, valeDoorstep(VL.main, null)), npcs: [{ id: 'v_mill', x: 5, y: 4, type: 'villager_m', text: "The river turns my wheel and keeps the whole village in flour. No river, no bread.", mind: "The flood three years back took the old wheel clean off." }, { id: 'v_mill_w', x: 8, y: 6, type: 'villager_f', text: "Isaac's mother is a fine woman. We all look out for each other here." }] });
Kit.home('vale_house_f', { name: 'House', back: Object.assign({ map: 'vale' }, valeDoorstep(VL.main, 'F')), npcs: [{ id: 'v_f', x: 5, y: 5, type: 'elder_f', text: "They say a Djinni is a spirit of the elements. I saw one once, on Mt. Aleph, long ago. Like a little animal made of light.", mind: "Nobody believed me then, and nobody will now." }] });
Kit.interior('vale_kraden_house', { name: "Kraden's Cottage", back: Object.assign({ map: 'vale_west' }, valeDoorstep(VL.west, 'O')), doorX: 5, furn: [['bookshelf', 1, 2], ['bookshelf', 2, 2], ['bookshelf', 3, 2], ['bookshelf', 8, 2], ['bookshelf', 9, 2], ['bookshelf', 10, 2], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['shelf', 1, 5], ['candle', 5, 4]], npcs: [{ id: 'Kraden', x: 5, y: 3, look: NPC_LOOKS.Kraden, name: 'Kraden', script: STORY.kradenHouse, hideIf: 'kraden_met' }], build(M) { M.container(10, 7, 'pot', 'Coins', 5); } });
Kit.sanctum('vale_sanctum', { name: 'Vale Sanctum', back: { map: 'vale', x: 15, y: 14 } });
Kit.inn('vale_inn', { name: 'Vale Inn', price: 6, back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'M')), build(M) { M.container(12, 2, 'barrel', 'Coins', 1); M.npc('vale_masked', 10, 5, { type: 'pirate', name: 'Masked Man', text: "......", mind: "(He does not want to be looked at. He does not want to be here.)", cond: () => !G.flag('sanctum_done') }); } });
Kit.shop('vale_shop', { name: 'Vale Shop', shop: 'vale_item', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'K')), npcs: [{ id: 'vale_shop_smith', x: 8, y: 2, type: 'merchant', shop: 'vale_weapon', name: 'Weaponsmith', dir: DIR.DOWN }] });
Kit.home('vale_smith_house', { name: 'House', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'L')), furn: [['anvil', 3, 2], ['fireplace', 8, 1], ['table', 5, 5], ['chair', 4, 5], ['bed', 9, 3], ['bed_foot', 9, 4], ['shelf', 1, 2]], npcs: [{ id: 'v_smith', x: 5, y: 4, type: 'villager_m', name: 'Smith', text: "Every blade in the shop next door came off my anvil. Vale iron, Vale hands.", mind: "Those strangers had swords I've never seen the like of." }], build(M) { M.container(1, 7, 'crate', 'Herb'); } });
Kit.home('vale_house_h', { name: 'House', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'H')), npcs: [{ id: 'v_h', x: 5, y: 5, type: 'villager_m', text: "Ivan? Never heard of him. But Master Hammet's merchant wagons pass by Vault sometimes.", mind: "Hammet pays in gold. Real gold, from Kalay." }], build(M) { M.container(9, 7, 'pot', 'Coins', 3); } });
Kit.interior('vale_shack_q', { name: 'Shack', w: 10, h: 9, floor: 'cave', wall: 'cavewall', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'Q')), furn: [['table', 4, 3], ['shelf', 7, 2]], npcs: [{ id: 'v_q', x: 2, y: 4, type: 'villager_m', text: "A shard of the Psynergy Stone from the plaza. Stand near it and feel your strength come back.", mind: "The elders let me keep it. As long as I don't sell it." }], build(M) { M.setObj(5, 2, 'psystone'); M.container(8, 6, 'pot', 'Vial'); M.container(1, 6, 'barrel', 'Coins', 123); } });
Kit.home('vale_house_i', { name: 'House', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'I')), npcs: [{ id: 'v_i', x: 5, y: 5, type: 'elder_m', text: "In my day, Sol Sanctum was a place of prayer. Now the elders keep it locked tight.", mind: "They are right to. Something in there is not for us." }] });
Kit.home('vale_house_j', { name: 'House', back: Object.assign({ map: 'vale_south' }, valeDoorstep(VL.south, 'J')), npcs: [{ id: 'v_j', x: 5, y: 4, type: 'villager_f', text: "The men who came into town - they went straight up toward the mountain. What business could they have up there?", mind: "Nothing good. Nothing good at all." }], build(M) { M.container(2, 7, 'pot', 'Smoke Bomb'); } });
