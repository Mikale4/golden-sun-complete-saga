// ---------- Kibombo Mountains ----------
// After map references/golden-sun-the-lost-age-kibombo-mountains-gba-map.webp (63 x 116, two screens and the caves),
// condensed. The pass is watched: a warrior who sees the party raises the alarm and they are put back at the
// start of that screen. Per the guide: the crates into the gap after the first vine, the pillar for the shortcut,
// the crate pushed along under the watcher's nose (a crate between him and the party hides them), the Disk Axe
// down the slide, the crate pushed ahead as a shield past the second watcher, Lash up the rope, the tight edge
// north; on the second screen the crate dropped on the warrior below for the Power Bread, the watchdog's corridor
// and the pillar dropped into it to pen the dog (above: the Tear Stone; below: the way north), the Smoke Bomb in
// the cavern's crate, the pillar back up on the way out, Tremor on the crate for the bone that keeps the dog
// busy, Whirlwind on the overgrowth for the second cavern, out to the river, Waft on his ledge (Frost and Growth,
// later), the hop over the river and the way out west.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'sand', 'g': 'grass', 'w': 'water', 'h': 'water_hop', 'S': 'lc_slide', 'p': 'pit',
    'v': { ground: 'sand', obj: 'vineladder', walk: true }, 't': { ground: 'grass', obj: 'palm' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'sand', obj: 'rock_small' },
    'D': { ground: 'sand', obj: 'lc_door' }, 'G': { ground: 'sand', obj: 'gate_wood' }
  };
  const BROWN = { cliff: 'R', set: 'brownrock', faces: 2 };
  const KM_ENC = [['Wild Gorilla'], ['Pixie', 'Pixie'], ['Assassin'], ['Dirge II', 'Dirge II']];
  const WORLD_S = { map: 'world_tla', x: 122, y: 168, dir: DIR.DOWN };
  // a watcher who sees the party: the alarm, and the party put back at the start of the screen
  const alarm = (mapId, sx, sy, who) => function* (E) {
    Audio.sfx('push'); yield E.say(who === 'dog' ? 'Grrrrr! Rrrruff! Rrufff!' : 'Guards! An intruder! Someone is trying to pass! To arms, Kibombo warriors! To arms!', who === 'dog' ? 'Watchdog' : 'Guard');
    if (who === 'dog') yield E.say('An intruder! Repel the intruder immediately!', 'Guard');
    yield E.say('Here! The intruder is here! Kibombo does not permit visitors! You just follow this road right back to where you came from!', 'Guard');
    yield Engine.fadeOut(15); E.warpNow(mapId, sx, sy, DIR.UP); yield 5; yield Engine.fadeIn(15);
  };
  const warrior = (M, id, x, y, dir, sight, mapId, sx, sy, opts) => M.npc(id, x, y, Object.assign({ type: 'tribal', name: 'Kibombo Warrior', dir, face: dir, sight, script: alarm(mapId, sx, sy), text: '', hideIf: 'piers_joined' }, opts || {}));
  // ====================== the first screen: the pass ======================
  const A = grid(34, 42, 'R');
  fill(A, 2, 33, 31, 39, '.'); fill(A, 29, 40, 31, 41, '.'); fill(A, 2, 33, 8, 34, 'g'); fill(A, 22, 37, 31, 39, 'g');   // the meadow before the pass, the way in from the south
  for (const [x, y] of [[3, 36], [6, 38], [12, 34], [24, 38], [27, 36], [30, 34], [20, 33], [4, 33]]) A[y][x] = 't'; for (const [x, y] of [[10, 37], [17, 38], [26, 34]]) A[y][x] = 'b';
  fill(A, 16, 26, 17, 32, '.'); A[25][16] = 'G'; A[25][17] = 'G';   // the road up to the gate
  fill(A, 30, 30, 30, 32, 'v'); fill(A, 20, 28, 31, 29, '.'); A[28][24] = 'p'; A[29][24] = 'p';   // the first vine, the first ledge (two deep) and its gap
  fill(A, 20, 24, 20, 27, 'v'); fill(A, 8, 22, 20, 23, '.'); A[23][10] = 'p'; A[22][10] = 'R'; fill(A, 9, 24, 9, 32, 'v');   // the second vine, the second ledge, the gap for the pillar, the shortcut vine
  fill(A, 14, 18, 14, 21, 'v'); fill(A, 4, 16, 30, 17, '.'); fill(A, 22, 13, 22, 15, '.'); A[17][30] = 'S';   // the third vine, the long ledge under the first watcher's nook, the slide off its end
  fill(A, 26, 20, 31, 21, '.'); fill(A, 27, 22, 27, 27, 'v');   // the pocket with the Disk Axe and the vine back down to the first ledge
  fill(A, 6, 12, 6, 15, 'v'); fill(A, 5, 11, 13, 11, '.'); fill(A, 11, 9, 11, 10, 'v'); fill(A, 8, 7, 14, 8, '.');   // the fourth vine, the second watcher's ledge, the vine up to the rope's ledge
  fill(A, 4, 1, 30, 3, '.'); fill(A, 16, 0, 17, 0, '.'); fill(A, 20, 1, 30, 1, 'g');   // the tight edge along the top, the way north
  for (const [x, y] of [[6, 2], [24, 2], [28, 1]]) A[y][x] = 'b';
  defineMap('kibombo_mtns', {
    name: 'Kibombo Mountains', w: 34, h: 42, base: 'void', music: 'kibombomtns', bg: 'grass', entry: { x: 30, y: 40 }, enc: KM_ENC, retreat: WORLD_S,
    fall: (x, y) => (x === 30 && y === 17) ? { map: 'kibombo_mtns', x: 30, y: 20 } : null,
    build(M) {
      M.paint(0, 0, strs(A), LEG, BROWN);
      M.exit(29, 41, 3, 1, 'world_tla', 122, 168, DIR.DOWN); M.exit(16, 0, 2, 1, 'kibombo_mtns_2', 16, 30, DIR.UP);
      // the gate and its watcher; the two who talk when the party first comes up the road
      warrior(M, 'kib_g0', 17, 26, DIR.DOWN, 5, 'kibombo_mtns', 30, 38);
      M.trigger(16, 32, 2, 1, T3.kibomboPass, { once: 'kib_pass_seen' });
      // the crates for the gap, the pillar for the shortcut
      M.object('crate', 28, 28, { id: 'kib_c1' }); M.object('crate', 28, 29, { id: 'kib_c2' }); M.object('pillar', 12, 23, { id: 'kib_p1' });
      // the first watcher in his nook over the long ledge, and the crate that walks under his nose
      warrior(M, 'kib_g1', 22, 14, DIR.DOWN, 4, 'kibombo_mtns', 30, 38); M.object('crate', 14, 16, { id: 'kib_c3' });
      M.chest(31, 20, 'Disk Axe', 1);
      // the second watcher, looking along his ledge at the vine's top; the crate pushed ahead of the party hides them
      warrior(M, 'kib_g2', 13, 11, DIR.LEFT, 8, 'kibombo_mtns', 30, 38); M.object('crate', 7, 11, { id: 'kib_c4' });
      // the rope up to the tight edge
      M.object('rope', 11, 6, { id: 'kib_rope', len: 3 });
      M.sign(28, 37, 'The Kibombo Mountains. The pass is closed: Kibombo warriors hold the gate.');
      M.sign(21, 27, 'A gap in the ledge, a crate deep on each row.');
    }
  });
  T3.kibomboPass = function* (E) {
    yield E.say('Is the way clear?', 'Guard 1'); yield E.say('This area is clear! The strange one has not been seen! And there?', 'Guard 2');
    yield E.say('We have not seen the stranger near the village. Do you believe he was truly headed toward Kibombo?', 'Guard 1');
    yield E.say('The guards here were only recently knocked unconscious.', 'Guard 2');
    yield E.say('Correct. We were under strict orders to maintain a strict watch over the mountain pass.', 'Guard 1');
    yield E.say('No one must be permitted into Kibombo until Akafubu has completed his ceremony.', 'Guard 2');
    yield E.say('Then we had better hurry to find the one who attacked our guards.', 'Guard 1');
    yield E.say('Keep a good watch. Do not permit anyone to pass. If anyone interrupts Akafubu\'s ceremony, he will hold you responsible...', 'Guard 2');
    yield E.say("Piers, ahead of us - and he did not go through that gate politely. Nor will we. The warrior faces the road; we go round, over the ledges, and we stay out of his sight.", 'Kraden');
  };
  // ====================== the second screen: the watchdog's corridor and the caverns ======================
  const B = grid(40, 32, 'R');
  fill(B, 4, 29, 20, 30, '.'); fill(B, 16, 31, 17, 31, '.'); fill(B, 4, 25, 4, 28, 'v');   // the pocket the party arrives in, the vine up out of it
  fill(B, 4, 23, 24, 24, '.'); B[25][16] = 'S'; fill(B, 8, 26, 24, 27, '.'); B[25][8] = 'v';   // the ledge, the edge the crate goes over, the corridor below where the warrior walks
  fill(B, 8, 18, 29, 22, '.'); B[22][20] = 'v'; fill(B, 12, 18, 16, 19, 'g'); fill(B, 24, 12, 28, 16, '.'); B[17][26] = 'v'; B[14][29] = 'S';   // the middle band, the ledge over the dog's corridor, the edge the pillar goes over
  fill(B, 30, 6, 30, 22, '.'); fill(B, 31, 20, 33, 20, '.');   // the dog's corridor, the Tear Stone's nook off it
  fill(B, 26, 8, 26, 11, 'v'); fill(B, 26, 7, 29, 7, '.');   // the vine to the shelf at the corridor's top
  fill(B, 16, 2, 36, 5, '.'); fill(B, 30, 5, 30, 5, '.'); B[2][18] = 'D'; B[2][36] = 'D'; fill(B, 20, 2, 24, 3, 'g');   // the caverns' terrace
  fill(B, 34, 6, 34, 10, 'v'); fill(B, 32, 11, 36, 13, '.');   // the vine down to the bone crate's ledge
  fill(B, 9, 4, 14, 7, '.'); B[3][12] = 'D'; fill(B, 9, 8, 9, 11, 'v'); fill(B, 7, 12, 14, 20, '.'); fill(B, 8, 18, 14, 20, 'g');   // the shelf the second cavern comes out on, the east bank
  fill(B, 6, 9, 6, 21, 'w'); B[18][6] = 'h'; fill(B, 1, 12, 5, 20, '.'); fill(B, 0, 18, 0, 18, '.'); fill(B, 1, 19, 5, 20, 'g');   // the river, the hop, the west bank and the way out
  B[11][3] = 'p'; B[10][3] = '.'; fill(B, 2, 4, 4, 7, '.'); B[9][3] = '.'; B[8][3] = '.';   // the puddle in the gap, the step, the sprout's cells up to Waft's ledge
  for (const [x, y] of [[2, 20], [11, 19], [21, 3], [23, 2], [13, 13], [3, 15]]) B[y][x] = 't'; for (const [x, y] of [[36, 4], [17, 4], [11, 5], [2, 13]]) B[y][x] = 'b';
  defineMap('kibombo_mtns_2', {
    name: 'Kibombo Mountains', w: 40, h: 32, base: 'void', music: 'kibombomtns', bg: 'grass', entry: { x: 16, y: 30 }, enc: KM_ENC, retreat: WORLD_S,
    fall: (x, y) => (x === 16 && y === 25) ? { map: 'kibombo_mtns_2', x: 16, y: 26 } : (x === 29 && y === 14) ? { map: 'kibombo_mtns_2', x: 30, y: 14 } : null,
    build(M) {
      M.paint(0, 0, strs(B), LEG, BROWN);
      M.exit(16, 31, 2, 1, 'kibombo_mtns', 16, 1, DIR.DOWN); M.exit(0, 18, 1, 1, 'world_tla', 121, 166, DIR.LEFT);
      M.exit(18, 2, 1, 1, 'kibombo_mtns_cave', 5, 8, DIR.UP, { door: true });
      M.object('vines', 36, 2, { id: 'kib_ivy', reveal: 'lc_door' }); M.exit(36, 2, 1, 1, 'kibombo_mtns_cave2', 12, 9, DIR.UP, { door: true, cond: () => !M.objects.find(o => o.id === 'kib_ivy' && !o.gone) });
      M.exit(12, 3, 1, 1, 'kibombo_mtns_cave2', 2, 3, DIR.UP, { door: true });
      // the crate over the corridor: it drops when pushed off the edge, and the warrior under it goes down
      if (!G.flag('kib_g3_out')) delete G.flags['obj:kibombo_mtns_2:crate:kib_c5'];
      M.object('crate', 16, 24, { id: 'kib_c5', onLand: (hit) => function* (E) { if (hit && hit.id === 'kib_g3') { hit.hidden = true; G.set('kib_g3_out'); yield E.say('The crate comes down square on the warrior. He drops without a sound.'); } else yield E.say('The crate lands in the corridor below with a crash. The warrior is not under it.'); } });
      if (!G.flag('kib_g3_out')) M.npc('kib_g3', 12, 26, { type: 'tribal', name: 'Kibombo Warrior', move: 'patrol', patrol: [[9, 26], [23, 26]], patrolWait: 24, sight: 6, script: alarm('kibombo_mtns_2', 16, 30), text: '', hideIf: 'piers_joined' });
      M.chest(24, 27, 'Power Bread', 1);
      // the dog's corridor, the pillar that pens it in (back on its ledge every time the screen is entered), the bone
      delete G.flags['obj:kibombo_mtns_2:pillar:kib_p2'];
      M.object('pillar', 27, 14, { id: 'kib_p2' });
      const bone = !!G.flag('kib_bone');
      if (bone && !G.flag('obj:kibombo_mtns_2:catchable:kib_bonepick')) M.object('catchable', 31, 10, { id: 'kib_bonepick', item: 'Bone', look: null });
      M.npc('kib_dog', 30, 10, bone ? { animal: 'dog', animalCol: '#a08050', name: 'Watchdog', dir: DIR.RIGHT, text: 'Sniff sniff... Lick lick lick!!', mind: "(A bone! That's my favruff! Lick lick... It's deruffcious!)" }
        : { animal: 'dog', animalCol: '#a08050', name: 'Watchdog', move: 'patrol', patrol: [[30, 7], [30, 21]], patrolWait: 16, sight: 5, script: alarm('kibombo_mtns_2', 16, 30, 'dog'), text: 'Grrrrr!', hideIf: 'piers_joined' });
      if (bone) M.setObj(31, 10, 'bone');
      M.chest(33, 20, 'Tear Stone', 1);
      // the crate with the bone in it: Tremor shakes it out
      if (G.flag('kib_bone')) M.object('crate', 34, 12, { id: 'kib_c6' }); else M.object('shakeable', 34, 12, { id: 'kib_c6', tile: 'crate', onShake: function* (E) { if (G.flag('kib_bone')) { yield E.say('The crate rattles. It is empty now.'); return; } G.set('kib_bone'); Audio.sfx('push'); yield E.say('The crate shudders and a great bone tumbles out of it, down the ledge and into the corridor below!'); const d = G.field.npcs.find(n => n.id === 'kib_dog'); if (d) { d.move = 'static'; d.path = []; d.npc.sight = 0; d.npc.script = null; d.npc.text = 'Sniff sniff... Lick lick lick!!'; d.tx = 30; d.ty = 10; d.px = 30 * TILE; d.py = 10 * TILE; d.dir = DIR.RIGHT; } G.field.map.setObj(31, 10, 'bone'); G.field.map.object('catchable', 31, 10, { id: 'kib_bonepick', item: 'Bone', look: null }); const c = G.field.map.objects.find(ob => ob.id === 'kib_c6'); if (c) { c.gone = false; c.kind = 'crate'; } yield E.say('Sniff sniff... Lick lick lick!!', 'Watchdog'); yield E.say('That will keep it busy for as long as we are on this side of the mountain.', 'Sheba'); } });
      // Waft's ledge: the puddle in the gap, the sprout up the face
      M.object('puddle', 3, 11, { id: 'kib_puddle' }); M.object('sprout', 3, 9, { id: 'kib_sprout', top: 7 }); M.setObj(3, 8, null);
      M.djinni('Waft', 3, 5, { fight: true });
      M.sign(6, 30, 'The far side of the pass. Warriors walk the corridor below the ledge, and the dog walks its own.');
      M.sign(25, 13, 'The dog\'s corridor runs below this ledge. Something heavy, dropped into it, would pen the dog on one side.');
    }
  });
  // ====================== the caverns ======================
  const C1 = grid(12, 10, 'R');
  fill(C1, 2, 2, 9, 7, '.'); fill(C1, 4, 8, 6, 8, '.'); C1[9][5] = 'D';
  defineMap('kibombo_mtns_cave', {
    name: 'Kibombo Mountains - Cavern', w: 12, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 5, y: 8 },
    build(M) { M.paint(0, 0, strs(C1), Object.assign({}, LEG, { '.': 'cave_sand' }), { cliff: 'R', set: 'brownrock', faces: 1 }); M.setObj(5, 9, 'lc_door'); M.exit(5, 9, 1, 1, 'kibombo_mtns_2', 18, 3, DIR.DOWN, { door: true });
      M.setObj(3, 3, 'crate'); M.container(8, 3, 'crate', 'Smoke Bomb', 1); M.setObj(8, 6, 'pot'); M.sign(5, 3, 'Crates and jars: the warriors\' stores for the watch.'); }
  });
  const C2 = grid(14, 11, 'R');
  fill(C2, 2, 4, 11, 6, '.'); fill(C2, 2, 2, 2, 3, '.'); fill(C2, 11, 7, 12, 9, '.'); C2[1][2] = 'D'; C2[10][12] = 'D';
  defineMap('kibombo_mtns_cave2', {
    name: 'Kibombo Mountains - Cavern', w: 14, h: 11, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 9 },
    build(M) { M.paint(0, 0, strs(C2), Object.assign({}, LEG, { '.': 'cave_sand' }), { cliff: 'R', set: 'brownrock', faces: 1 });
      M.setObj(12, 10, 'lc_door'); M.exit(12, 10, 1, 1, 'kibombo_mtns_2', 36, 3, DIR.DOWN, { door: true }); M.setObj(2, 1, 'lc_door'); M.exit(2, 1, 1, 1, 'kibombo_mtns_2', 12, 4, DIR.UP, { door: true });
      M.setObj(6, 5, 'grey_rock'); M.sign(9, 4, 'The passage bends west under the rock and comes out above the river.'); }
  });
}
