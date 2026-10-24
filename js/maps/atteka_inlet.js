// ---------- Atteka Inlet ----------
// After map references/golden-sun-the-lost-age-atteka-inlet-gba-map.webp (two screens, 27x31 and 50x32), condensed:
// the garden of old columns and blossom trees under the gate on the road down from Contigo, the little shrine on its
// terrace (the ladder up to it, and along it east onto the cliff above the beach), and the beach where the Lemurian
// ship ties up - the great wings the people of Contigo carried down here and stand guard over until the day Mt.
// Jupiter burns, the vine off the cliff to the ledge with the Vial, and the round boulder Lift raises (Isaac) with the
// bush behind it that Cyclone lifts Geode out of. Hamma's wings are fitted to the ship here after the lighthouse.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'grass', 's': 'sand', 'p': 'path', '~': 'water', 'k': 'dock', 'd': 'ship_deck', 'r': { ground: 'ship_deck', obj: 'ship_rail' }, 'm': { ground: 'ship_deck', obj: 'mast' },
    'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'grass', obj: 'rock_grass' }, 'O': { ground: 'sand', obj: 'rock_sand' }, 'P': { ground: 'grass', obj: 'palm' },
    'c': { ground: 'grass', obj: 'pillar_brown' }, 'C': { ground: 'path', obj: 'lh_column' }, 'j': { ground: 'grass', obj: 'pot' }, 'f': 'flowers',
    'L': { ground: 'grass', obj: 'ladder', walk: true }, 'v': { ground: 'grass', obj: 'vineladder', walk: true }
  };
  const CLIFF = { cliff: '#', set: 'sandcliff', faces: 1 };
  // ====================== the garden under the road ======================
  const A = grid(27, 31, '.');
  fill(A, 0, 0, 26, 0, 'T'); fill(A, 0, 1, 0, 30, 'T'); fill(A, 26, 1, 26, 30, 'T'); fill(A, 0, 30, 26, 30, 'T');
  fill(A, 8, 0, 10, 12, 'p'); fill(A, 9, 0, 9, 0, 'p'); A[7][7] = 'C'; A[7][11] = 'C';   // the road down from Contigo, through the gate of two columns
  fill(A, 1, 3, 6, 9, '#'); fill(A, 2, 4, 5, 8, '.'); A[5][3] = 'T'; A[7][4] = 'T';   // the terrace west of the road: blossom trees, no way up
  fill(A, 12, 3, 25, 10, '#'); fill(A, 13, 4, 25, 9, '.'); A[10][14] = 'L'; A[11][14] = 'L'; A[8][13] = 'j'; A[8][22] = 'j';   // the shrine's terrace, the ladder up to it; it runs off the east edge onto the cliff above the beach
  fill(A, 26, 4, 26, 8, '.');
  fill(A, 4, 20, 22, 21, '#'); fill(A, 11, 20, 13, 21, '.'); fill(A, 3, 22, 24, 28, '.');   // the lower garden, and the opening down to it
  for (const [x, y] of [[3, 12], [6, 13], [4, 16], [2, 24], [6, 26], [21, 26], [24, 25], [2, 19], [23, 13]]) A[y][x] = 'T';
  for (const [x, y] of [[13, 14], [15, 16], [8, 18], [22, 17], [9, 24], [19, 23], [6, 23]]) A[y][x] = 'c';
  for (const [x, y] of [[2, 14], [17, 19], [22, 24], [7, 27]]) A[y][x] = 'o';
  for (const [x, y] of [[12, 3], [17, 13]]) A[y][x] = 'b';
  fill(A, 10, 15, 13, 17, 's'); fill(A, 12, 23, 17, 25, 's'); fill(A, 18, 26, 20, 27, 's'); A[13][13] = 'f'; A[18][20] = 'f';
  fill(A, 24, 16, 26, 18, '.');
  defineMap('atteka_inlet', {
    name: 'Atteka Inlet', w: 27, h: 31, base: 'grass', music: 'contigo', bg: 'grass', entry: { x: 9, y: 1 }, retreat: { map: 'world_tla', x: 67, y: 158, dir: DIR.UP },
    build(M) {
      M.paint(0, 0, strs(A), LEG, CLIFF);
      M.walkable(9, 0); M.exit(9, 0, 1, 1, 'world_tla', 67, 158, DIR.UP);
      M.walkable(26, 16, 1, 3); M.exit(26, 16, 1, 3, 'atteka_beach', 1, 17, DIR.RIGHT); M.walkable(26, 4, 1, 5); M.exit(26, 4, 1, 5, 'atteka_beach', 1, 5, DIR.RIGHT);
      M.house(16, 4, 5, 5, 'roof_purple', { wall: 'wall_temple', to: 'atteka_shrine', tx: 5, ty: 6, windows: false, doorX: 2 });
      M.sign(11, 12, 'Atteka Inlet. The road climbs north to Contigo; the shore lies east.');
      M.sign(7, 8, 'The gate of the old garden. Its columns stood before Contigo did.');
      M.trigger(8, 1, 3, 2, function* (E) { yield E.say('The Atteka Inlet. A garden of old stone, going down to the shore... and Contigo lies up the road behind us.', 'Kraden'); }, { once: 'ai_seen', cond: () => !G.flag('ai_seen_beach') });
    }
  });
  Kit.interior('atteka_shrine', { name: 'Shrine', w: 10, h: 8, floor: 'floor_tile', wall: 'wall_temple', back: { map: 'atteka_inlet', x: 18, y: 9 }, doorX: 5, furn: [['torch', 2, 1], ['torch', 7, 1], ['pot', 1, 5], ['statue', 4, 2]],
    build(M) { M.sign(5, 2, "A tablet of the Anemos: 'Those who would ride the wind must first build the wings. Those who would build the wings must first know the wind.'"); } });
  // ====================== the shore ======================
  const B = grid(50, 32, '~');
  fill(B, 0, 0, 24, 11, '#'); fill(B, 1, 1, 23, 9, '.'); fill(B, 0, 4, 0, 6, '.');   // the cliff above the beach, come along from the shrine's terrace
  fill(B, 24, 12, 29, 15, '#'); fill(B, 25, 12, 28, 14, '.'); B[10][26] = 'v'; B[11][26] = 'v'; B[9][26] = '.';   // the ledge under the cliff's east end, the vine down to it: the Vial
  fill(B, 0, 12, 23, 31, 's'); fill(B, 24, 16, 32, 31, 's'); fill(B, 0, 12, 0, 31, '.'); fill(B, 0, 12, 0, 14, '#');   // the beach
  fill(B, 0, 16, 0, 18, 's');
  fill(B, 33, 22, 49, 31, '~'); fill(B, 24, 29, 32, 31, '~'); fill(B, 30, 12, 33, 15, '~');
  fill(B, 34, 13, 46, 19, 'd'); fill(B, 34, 13, 46, 13, 'r'); fill(B, 34, 19, 46, 19, 'r'); fill(B, 34, 14, 34, 16, 'r'); fill(B, 34, 18, 34, 18, 'r'); fill(B, 46, 14, 46, 18, 'r'); B[15][40] = 'm';   // the Lemurian ship at its berth, the gap in the rail at the gangway
  fill(B, 32, 17, 33, 17, 'k'); B[17][34] = 'd';   // the gangway to the sand
  for (const [x, y] of [[3, 2], [8, 4], [14, 2], [20, 3], [17, 7], [5, 7]]) B[y][x] = 'T';
  for (const [x, y] of [[11, 5], [22, 8]]) B[y][x] = 'o';
  for (const [x, y] of [[4, 27], [9, 29], [28, 27], [16, 29], [24, 24]]) B[y][x] = 'P';
  for (const [x, y] of [[7, 14], [19, 27], [29, 19], [3, 20], [19, 24], [21, 24], [20, 23]]) B[y][x] = 'O';   // the rocks round the bush behind the boulder: only the boulder's side is open
  T3.attekaWings = function* (E) {
    if (G.flag('ship_wings')) return; G.set('ship_wings');
    if (!E.field.npcs.some(n => n.id === 'ai_hama')) E.spawn('ai_hama', 15, 24, { look: NPC_LOOKS.Hama, name: 'Hama', dir: DIR.RIGHT });
    Audio.play('contigo');
    yield E.say('You came. Good - the prophecy of the Anemos is three years waiting for this hour.', 'Hama');
    yield E.say('Three years ago the seers of Contigo saw it: when Mt. Jupiter is in flames, a sacred vessel will come to this inlet, and the wings built for it will carry the Adepts to the end of the world.', 'Hama');
    yield E.say('The Lemurian ship... a sacred vessel? Well, it is older than any of us, and it has been to the bottom of the sea and back.', 'Piers');
    yield E.say('The seas between here and the north are walled with reef and ice - no keel passes them. But wings do. Men of Contigo! It is time.', 'Hama');
    yield E.say("(The four who guarded the wings come running. Rope, beams, the long day's work of a village: the great wings are carried to the water and fitted to the Lemurian ship's sides.)");
    Engine.doShake(10); Audio.sfx('push'); yield 30;
    for (const [x, y] of [[13, 22], [14, 22], [13, 23], [14, 23]]) E.field.map.setObj(x, y, null); E.field.map.finalize();
    yield E.say("(The wings stand out from the ship like a gull's. When the wind takes them, the whole hull lifts against its ropes.)");
    yield E.say('It flies! Look at it - it really flies!', 'Garet');
    yield E.say('The Wings of Anemos are yours now. In the air nothing on Weyard can reach you: not the reefs, not the rivers, not the beasts of the sea. Only the mountains are higher than you will fly. Go to Prox, all eight of you - and come back.', 'Hama');
    yield E.say('Hama... thank you.', 'Ivan');
    yield E.say('(Sheba has gone quiet, at the edge of the water.)'); yield E.say('The Jupiter Lighthouse... I thought, when it was lit, I would know. Where I came from. Why I fell out of the sky into Lalivero. But there was nothing there for me, was there? Only a beacon.', 'Sheba');
    yield E.say('Sheba... the Anemos rose into the sky with their whole city. Somewhere above us, there may still be people who know your name. The beacons are not finished, and neither is your story.', 'Hama');
    yield E.say("...Then let's finish them.", 'Sheba');
    E.despawn('ai_hama'); G.set('wings_fitted'); Audio.sfx('levelup');
    yield E.say("The Lemurian ship has the Wings of Anemos! At sea, the ship now flies over reefs, rivers and low land, and no monster can reach it in the air. (The ring of reef round the glint in the western sea: a keel could never pass it. Wings can. The ice wall in the north is another matter - that will want Loho's cannon.)");
  };
  defineMap('atteka_beach', {
    name: 'Atteka Inlet', w: 50, h: 32, base: 'water', music: 'contigo', bg: 'water', entry: { x: 40, y: 16 }, retreat: { map: 'world_tla', x: 67, y: 158, dir: DIR.UP },
    build(M) {
      M.paint(0, 0, strs(B), LEG, CLIFF);
      M.exit(0, 16, 1, 3, 'atteka_inlet', 25, 17, DIR.LEFT); M.exit(0, 4, 1, 3, 'atteka_inlet', 25, 5, DIR.LEFT);
      // the ship at its berth: the party comes ashore down the gangway, and goes back up it to put to sea
      M.exit(33, 17, 1, 1, 'world_tla', 67, 162, DIR.DOWN, { ship: true });
      M.chest(27, 13, 'Vial', 1);
      // the round boulder on the sand and the bush behind it: Lift, then Cyclone, and Geode comes out of it (Isaac's day)
      M.object('boulder', 20, 25, { id: 'ai_boulder', onLift: function* (E) { G.set('ai_boulder_lifted'); yield E.say('The boulder comes up - and there is a bush behind it, growing in its shade.', 'Isaac'); } });
      if (((G.flags['obj:atteka_beach:leaves:ai_bush'] || {}).state) === 'cleared') M.djinni('Geode', 20, 24, { fight: false });   // lifted out and left behind: it waits
      M.object('leaves', 20, 24, { id: 'ai_bush', onClear: function* (E) { if (G.party.djinnFound.includes('Geode')) return; G.field.map.objects.push({ kind: 'djinni', x: 20, y: 24, name: 'Geode', key: 'djinn:Geode', fight: false, el: 0 }); Audio.sfx('item'); yield E.say('The leaves whirl away - and something was hiding in them! A Venus Djinni!', 'Felix'); } });
      // the Wings of Anemos, and the four who brought them down from Contigo to wait for the sacred vessel
      M.setObj(13, 22, 'anemos_wing_l'); M.setObj(14, 22, 'anemos_wing_r'); M.setObj(13, 23, 'anemos_wing_bl'); M.setObj(14, 23, 'anemos_wing_br');
      M.npc('ai_g1', 11, 23, { type: 'villager_m', name: 'Man', dir: DIR.RIGHT, text: "We've made these wings and carried them here just to fulfill a great prophecy.", mind: '(We first heard the prophecy three years ago... The wings have come a long way since then.)' });
      M.npc('ai_g2', 16, 22, { type: 'villager_m', name: 'Man', dir: DIR.LEFT, text: 'We must be prepared to attach these wings to the sacred vessel. It is said that we will know the time has come when Mt. Jupiter is in flames.', mind: '(These wings are so heavy that they would sink an ordinary ship. I wonder what kind of ship the sacred vessel is.)' });
      M.npc('ai_g3', 13, 25, { type: 'villager_m', name: 'Man', dir: DIR.UP, move: 'wander', text: "We brought these wings from Contigo, and now we're guarding them. If they were damaged or broken, the prophecy might never be fulfilled.", mind: '(I doubt anyone could hurt these sturdy wings, but we must guard them just the same.)' });
      M.npc('ai_g4', 17, 26, { type: 'villager_f', name: 'Woman', move: 'wander', text: "I wonder if these giant wings will really make it fly... I'd like to see that.", mind: "(It's kind of hard to imagine what these wings would look like actually flapping.)" });
      M.sign(30, 20, 'The Lemurian ship lies at the Atteka Inlet. Contigo is up the road to the north.');
      M.trigger(30, 16, 3, 3, function* (E) { yield E.say('Atteka. And look there, on the sand - wings! Great artificial wings, big enough for a ship!', 'Sheba'); yield E.say('The Wings of Anemos, if the tales of Contigo are true. Someone here has been busy with a prophecy.', 'Kraden'); }, { once: 'ai_seen_beach' });
      // after the reunion: Hama by the wings, and the people of Contigo fit them to the ship
      if (G.flag('hama_inlet_waiting') && !G.flag('ship_wings')) M.npc('ai_hama', 15, 24, { look: NPC_LOOKS.Hama, name: 'Hama', dir: DIR.RIGHT, script: T3.attekaWings });
      M.trigger(0, 15, 2, 5, T3.attekaWings, { cond: () => G.flag('hama_inlet_waiting') && !G.flag('ship_wings') });
      M.trigger(0, 3, 2, 5, T3.attekaWings, { cond: () => G.flag('hama_inlet_waiting') && !G.flag('ship_wings') });
      M.trigger(31, 16, 3, 3, T3.attekaWings, { cond: () => G.flag('hama_inlet_waiting') && !G.flag('ship_wings') });
    }
  });
}
