// ---------- Madra Drawbridge and the Osenia Cliffs ----------
// After the rips (map references/golden-sun-the-lost-age-mandra-drawbridge-gba-map.webp, 16 x 22, and
// ...osenia-cliffs-gba-map.webp, 37 x 32). The drawbridge is the only way from Madra's side to Osenia: a plank
// bridge over the inlet, the town's two guards at its north end, who let nobody over without the elder's word.
// Beyond it the cliffs: terraces of rock down to a bay full of the Champa ship's wreckage, its rafts and boards
// hopped across from the tip of the central rock, a rope up to the piece that still carries the pirates' chest.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEGEND = { '.': 'grass', ':': 'sand', 'w': 'water', 'T': { ground: 'grass', obj: 'tree' }, 'p': { ground: 'grass', obj: 'palm' }, 'b': 'bridge_v', 'x': { ground: 'grass', obj: 'rock_grass' }, 'f': 'flowers',
    'r': 'raft', 'd': 'flotsam', 's': { ground: 'sand', obj: 'rock_sand' } };

  // ======================= MADRA DRAWBRIDGE =======================
  const D = grid(16, 22, '.');
  fill(D, 0, 8, 15, 21, 'w'); fill(D, 6, 7, 9, 12, 'b'); fill(D, 5, 13, 11, 19, '.'); fill(D, 6, 20, 8, 21, ':'); fill(D, 5, 20, 5, 20, '.'); fill(D, 9, 20, 9, 20, '.');
  fill(D, 0, 4, 5, 7, '#'); fill(D, 10, 4, 15, 7, '#'); fill(D, 5, 5, 5, 6, '.'); fill(D, 10, 5, 10, 6, '.'); fill(D, 6, 4, 9, 6, '.');
  fill(D, 6, 0, 8, 6, ':'); fill(D, 6, 13, 8, 19, ':');
  for (const [x, y] of [[0, 0], [1, 0], [4, 0], [11, 0], [14, 0], [15, 1], [2, 2], [12, 2], [4, 2], [11, 3], [5, 14], [11, 15], [10, 17], [5, 18], [4, 19]]) if (D[y] && D[y][x] !== 'w') D[y][x] = 'T';
  D[2][1] = 'f'; D[5][13] = 'f'; D[13][11] = 'f'; D[15][6] = 'f';
  defineMap('madra_bridge', {
    name: 'Madra Drawbridge', w: 16, h: 22, base: 'water', music: 'overworld2', bg: 'grass', entry: { x: 7, y: 20 },
    build(M) {
      M.paint(0, 0, strs(D), LEGEND, { cliff: '#', set: 'cliff', faces: 1 });
      M.exit(6, 21, 3, 1, 'world_tla', 165, 199, DIR.DOWN); M.walkable(6, 21, 3, 1);
      M.exit(6, 0, 3, 1, 'osenia_cliffs', 1, 17, DIR.RIGHT); M.walkable(6, 0, 3, 1);
      // the guards at the bridge's north end, and the word that lets the party by
      M.npc('db_g1', 5, 6, { type: 'guard', name: 'Guard', dir: DIR.RIGHT, text: () => G.flag('madra_permission') ? "If you try heading straight through Osenia to Alhafra, you'll hit Yampi Desert. You'd be better off avoiding the desert." : "If you have permission, you can cross anytime. But try to cross illegally, and we'll throw you in the hoosegow with Mr. Bluehair!", mind: "I'm startin' to wonder when the elder and the others'll come back from Osenia." });
      M.npc('db_g2', 10, 6, { type: 'guard', name: 'Guard', dir: DIR.LEFT, script: function* (E) { if (G.flag('madra_permission')) { yield E.say("Alhafra is up along the northeast of Osenia... You'll see it eventually.", 'Guard'); return; } const y = yield* E.ask("You goin' to Osenia?", 'Guard', ['Yes', 'No']); yield E.say(y === 0 ? "You'll have to head back to town and get a permit! Just go to the elder's house and ask real nice-like." : "Then get lost, pal. These parts can be dangerous...", 'Guard'); }, mind: "I wish I could tell 'em it's nothing personal... It's for their own good. Who knows what's waiting to gobble 'em up in Osenia!" });
      M.trigger(6, 6, 4, 1, T3.drawbridge, { cond: () => !G.flag('madra_permission') || !G.flag('madra_bridge_told') });
      M.sign(4, 3, 'MADRA DRAWBRIDGE - Osenia beyond. No crossing without the elder\'s leave.');
    }
  });
  T3.drawbridge = function* (E) {
    if (G.flag('madra_permission')) {
      G.set('madra_bridge_told');
      yield E.say("Yeah, we heard about you already. If you're going to Osenia, you'd better get moving.", 'Guard');
      yield E.say("Alhafra is up along the northeast of Osenia... You'll see it eventually.", 'Guard');
      return;
    }
    yield E.say("If you wanna cross here, you'll need permission from the town elder!", 'Guard');
    yield E.say("Without permission, ain't no one's gonna cross this bridge, no matter what!", 'Guard');
    yield E.move('player', DIR.DOWN, 2);
  };

  // ======================= OSENIA CLIFFS =======================
  const C = grid(37, 32, 'w');
  // the west land: terraces from the high wood down to the shore path
  fill(C, 0, 0, 7, 2, '.'); fill(C, 0, 3, 12, 3, '#'); fill(C, 0, 4, 12, 9, '.'); fill(C, 0, 6, 6, 6, '#'); fill(C, 0, 10, 12, 10, '#'); fill(C, 0, 11, 12, 14, '.'); fill(C, 0, 15, 16, 21, '.');
  fill(C, 0, 15, 9, 15, '#'); fill(C, 10, 15, 16, 16, '.'); fill(C, 0, 19, 16, 19, '#'); fill(C, 0, 20, 16, 20, '#'); fill(C, 0, 21, 16, 21, '.'); fill(C, 4, 21, 10, 24, ':'); fill(C, 0, 16, 3, 18, '.');
  fill(C, 8, 0, 12, 2, 'w'); fill(C, 8, 3, 12, 3, 'w');
  // the central rock, the shore path round its foot, the debris and rafts north of its tip
  fill(C, 17, 15, 21, 22, '#'); fill(C, 17, 17, 21, 18, '.'); fill(C, 16, 14, 22, 14, '.'); fill(C, 18, 15, 19, 15, '.'); fill(C, 22, 15, 26, 21, '.'); fill(C, 22, 19, 26, 20, '#'); fill(C, 22, 21, 26, 21, '.');
  C[13][18] = 'd'; fill(C, 15, 10, 19, 12, 'r'); fill(C, 16, 5, 19, 8, 'r'); fill(C, 22, 6, 26, 9, 'r'); fill(C, 21, 11, 23, 13, 'r'); C[3][14] = 'd'; C[2][22] = 'd'; C[1][28] = 'd'; C[12][26] = 'd';
  // the east: beach and grass, the wood, the way out south-east
  fill(C, 27, 10, 36, 21, '.'); fill(C, 27, 10, 31, 16, ':'); fill(C, 29, 3, 36, 9, '.'); fill(C, 29, 2, 36, 2, '#'); fill(C, 33, 0, 36, 1, '.'); fill(C, 32, 19, 36, 19, '#'); fill(C, 32, 20, 36, 20, '#'); fill(C, 27, 21, 36, 27, '.'); fill(C, 27, 22, 31, 22, '#'); fill(C, 27, 26, 30, 27, 'w'); fill(C, 32, 28, 36, 28, '#');
  for (const [x, y] of [[1, 0], [3, 1], [5, 0], [0, 4], [3, 5], [10, 6], [11, 7], [8, 12], [9, 13], [2, 12], [34, 0], [35, 4], [33, 6], [35, 8], [33, 12], [35, 11], [30, 16], [34, 15], [35, 21], [33, 24], [35, 26], [29, 25]]) if (C[y][x] === '.') C[y][x] = 'T';
  for (const [x, y] of [[6, 13], [12, 12], [3, 8], [24, 18], [30, 12], [9, 22], [29, 24], [16, 21]]) if (C[y][x] === '.') C[y][x] = 'x';
  for (const [x, y] of [[28, 13], [31, 15]]) C[y][x] = 's';
  for (const [x, y] of [[11, 5], [2, 17], [25, 16], [33, 10], [28, 23], [12, 21]]) if (C[y][x] === '.') C[y][x] = 'f';
  defineMap('osenia_cliffs', {
    name: 'Osenia Cliffs', w: 37, h: 32, base: 'water', music: 'overworld2', bg: 'grass', entry: { x: 1, y: 17 }, enc: [['Kobold II'], ['Dino'], ['Momonga', 'Momonga']], retreat: { map: 'world_tla', x: 165, y: 199, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(C), LEGEND, { cliff: '#', set: 'cliff', faces: 1 });
      M.exit(0, 16, 1, 3, 'madra_bridge', 7, 1, DIR.DOWN); M.walkable(0, 16, 1, 3);
      M.exit(36, 23, 1, 2, 'world_tla', 171, 199, DIR.RIGHT); M.walkable(36, 23, 1, 2);
      // the wreck: boards to hop from the rock's tip to the raft, the rope up to the piece with the chest
      M.object('hop', 18, 13, { id: 'oc_hop1' }); M.walkable(15, 10, 5, 3);
      M.object('rope', 18, 9, { id: 'oc_rope', len: 1, dx: 0, dy: -1 }); M.walkable(16, 5, 4, 4); M.walkable(22, 6, 5, 4); M.walkable(21, 11, 3, 3);
      M.chest(18, 6, "Pirate's Sword", 1);
      // the people on the shore
      M.npc('oc_m1', 11, 13, { type: 'villager_m', text: "This is a Champa boat... You can see their mark on the flag there. They must have been run aground here by the tidal wave.", mind: "I guess even if they did free Briggs... They wouldn't have been able to go back out to sea..." });
      M.npc('oc_m2', 24, 17, { type: 'sailor', text: "Look at all the damage... That wave must have been gigantic... I wonder how many Champa died in the wreck...", mind: "They still had enough men to dig that hole and attack Madra. And enough to form two attack parties, too..." });
      M.npc('oc_m3', 29, 14, { type: 'villager_m', text: "Wait, if this is the Champa ship, then that must mean Piers isn't a Champa! So... why does the elder still need Briggs to clear his name?", mind: "Briggs must be trying to get a new ship in Alhafra. I hope the elder finds him first!" });
      M.sign(2, 16, 'OSENIA CLIFFS - the shore road east. Mind the wreck; the boards float.');
    }
  });
}
