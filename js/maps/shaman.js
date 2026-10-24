// ---------- Shaman Village Cave and Shaman Village ----------
// After map references/golden-sun-the-lost-age-shaman-village-cave-gba-map.webp (three caves, 65x60 in all) and the
// village at the foot of ...shaman-village-gba-map.webp (33x34 with its east screen), condensed, and the guide's
// chapter 13: the cave on the Hesperian coast (the lower winding cave, the great cave above it with the boulder on
// its middle path and Eddy behind it for Lift, the overgrowth Whirlwind clears on the left path, the cave beyond
// with the brown pillar pushed two spots to the right off its ledge for the shortcut below), and the village of the
// Shaman tribe that will not speak to outsiders (Mind Read tells why): the inn (the Elixir in the white jar in its
// cellar, the cellar's back door out to the river bank, north to the plant Growth climbs for the Spirit Gloves),
// Moapa's house (the Weasel's Claw in the right barrel of its cellar) and Moapa on its step - the rod shown, his
// refusal, the way of the vanishing sand, Trial Road; the tepees, the rightmost home with the stairs to its
// balcony (the Lucky Medal jar, after) and out to the east screen (the pillar Moved into the gap, the Shaman's hut
// with the Lucky Pepper, after), Lash on the rope by Moapa's house to Aroma; the whole village's tongue loosened
// after the trial; and with Isaac: the Colosso gladiators' rematch in the cave (Golden Shirt), the boulders Lift
// raises, Frost on the puddle, the foliage over the stair, and Eddy cornered.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const CAVE_ENC = [['Pteranodon'], ['Slayer'], ['Talon Runner', 'Talon Runner'], ['Wargold', 'Wargold'], ['Wild Gryphon'], ['Wolfkin', 'Wolfkin']];
  const won = () => !!G.flag('trial_road_won');
  const T = (before, later) => () => { const v = won() ? later : before; return typeof v === 'function' ? v() : v; };
  const CL = {
    '.': 'cave_sand', 'w': 'water', 'y': 'puddle_cave', 'o': { ground: 'cave_sand', obj: 'rock_blue' }, 'v': { ground: 'cave_sand', obj: 'vineladder', walk: true }, 'p': 'pit',
    'S': 'stairs_up'
  };
  const ROCK = { cliff: '#', set: 'purplerock', faces: 1 };
  // ====================== the lower cave: in from the coast, three ways on ======================
  const C1 = grid(24, 32, '#');
  fill(C1, 11, 24, 13, 31, '.'); fill(C1, 8, 20, 15, 24, '.'); fill(C1, 3, 18, 11, 20, '.'); fill(C1, 3, 1, 5, 18, '.'); fill(C1, 11, 8, 13, 20, '.'); fill(C1, 10, 1, 14, 8, '.');
  fill(C1, 13, 14, 23, 16, '.'); fill(C1, 16, 9, 18, 14, '.'); fill(C1, 16, 5, 20, 9, '.');
  for (const [x, y] of [[4, 10], [12, 12], [9, 22], [19, 7], [20, 15]]) C1[y][x] = 'o';
  fill(C1, 4, 0, 4, 0, '.'); fill(C1, 12, 0, 12, 0, '.'); C1[15][23] = '.';
  defineMap('shaman_cave', {
    name: 'Shaman Village Cave', w: 24, h: 32, base: 'void', music: 'tlacaves', bg: 'cave', entry: { x: 12, y: 30 }, enc: CAVE_ENC, retreat: { map: 'world_tla', x: 79, y: 77, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(C1), CL, ROCK);
      M.walkable(11, 31, 3, 1); M.exit(11, 31, 3, 1, 'world_tla', 79, 77, DIR.DOWN);
      M.exit(4, 0, 1, 1, 'shaman_cave_3', 4, 24, DIR.UP); M.exit(12, 0, 1, 1, 'shaman_cave_3', 14, 24, DIR.UP); M.exit(23, 15, 1, 1, 'shaman_cave_2', 1, 10, DIR.RIGHT);
      // the Colosso gladiators, come half across Weyard for their rematch with Isaac
      M.trigger(11, 22, 3, 2, T3.colossoRematch, { once: 'colosso_rematch_done', cond: () => !!G.party.get('Isaac') && T3.gs1Done('colosso_done') });
      M.sign(13, 29, 'Shaman Village lies through these caves. Outlanders: turn back.');
      M.trigger(11, 28, 3, 2, function* (E) { yield E.say('The cave the woman in Hesperia Settlement spoke of. Shaman Village must be at the far end of it.', 'Kraden'); yield E.say('Three ways on, by the look of it. The middle one, then?', 'Jenna'); }, { once: 'svc_seen' });
    }
  });
  // ====================== the great cave: the ring path, the overgrowth, the boulder on the middle path and Eddy ======================
  const C3 = grid(28, 26, '#');
  fill(C3, 3, 2, 5, 25, '.'); fill(C3, 3, 2, 25, 4, '.'); fill(C3, 23, 2, 25, 14, '.'); C3[14][26] = '.'; C3[14][27] = '.';   // the ring: up the left, along the top, down the right to the cave beyond
  C3[12][3] = '#'; C3[12][5] = '#';   // the left path narrows where the overgrowth chokes it
  fill(C3, 13, 18, 15, 25, '.'); fill(C3, 11, 12, 17, 16, '.'); C3[17][14] = '.';   // the middle path and the pocket at its end
  fill(C3, 10, 5, 10, 6, '.'); fill(C3, 8, 7, 20, 8, '.');   // the back room off the top of the ring
  fill(C3, 8, 9, 8, 12, '.'); C3[11][8] = 'p'; C3[12][7] = '.';   // its left arm: the boulder, the puddle in the gap, the foliage over the stair
  fill(C3, 20, 9, 20, 12, '.'); fill(C3, 18, 12, 19, 12, '.');   // its right arm: two boulders, and the way round into the pocket behind them
  for (const [x, y] of [[4, 20], [10, 3], [18, 2], [24, 8], [12, 15], [16, 13]]) C3[y][x] = 'o';
  defineMap('shaman_cave_3', {
    name: 'Shaman Village Cave', w: 28, h: 26, base: 'void', music: 'tlacaves', bg: 'cave', entry: { x: 4, y: 24 }, enc: CAVE_ENC, retreat: { map: 'world_tla', x: 79, y: 77, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(C3), CL, ROCK);
      M.exit(4, 25, 1, 1, 'shaman_cave', 4, 1, DIR.DOWN); M.exit(14, 25, 1, 1, 'shaman_cave', 12, 1, DIR.DOWN); M.exit(27, 14, 1, 1, 'shaman_cave_2', 10, 1, DIR.RIGHT);
      // the overgrowth across the left path: Whirlwind
      M.object('vines', 4, 12, { id: 'svc_vines', onClear: function* (E) { yield E.say('The vines tear away. The path runs on behind them.'); } });
      // the middle path: the boulder Eddy hides behind, with the way round to it through the back room once Lift has been at its boulders
      M.object('boulder', 14, 17, { id: 'svc_boulder_mid', onLift: function* (E) { G.set('svc_mid_open'); { const Mp = G.field.map; for (const o of Mp.objects) if (o.id === 'svc_eddy_glimpse') o.gone = true; if (!G.party.djinnFound.includes('Eddy') && !Mp.objects.some(o => o.kind === 'djinni' && o.name === 'Eddy')) Mp.objects.push({ kind: 'djinni', x: 14, y: 14, name: 'Eddy', key: 'djinn:Eddy', fight: true, el: DJINN.Eddy.el }); } yield E.say('The boulder lifts away from the mouth of the pocket. Whatever is in there has nowhere left to run.', 'Isaac'); } });
      M.object('boulder', 20, 9, { id: 'svc_boulder_r', onLift: function* (E) { yield E.say('The right-hand boulder comes up. There is another beyond it.', 'Isaac'); } });
      M.object('boulder', 20, 11, { id: 'svc_boulder_r2', onLift: function* (E) { G.set('svc_back_open'); { const Mp = G.field.map; for (const o of Mp.objects) if (o.id === 'svc_eddy_glimpse') o.gone = true; if (!G.party.djinnFound.includes('Eddy') && !Mp.objects.some(o => o.kind === 'djinni' && o.name === 'Eddy')) Mp.objects.push({ kind: 'djinni', x: 14, y: 14, name: 'Eddy', key: 'djinn:Eddy', fight: true, el: DJINN.Eddy.el }); } yield E.say('And that one. The back of the room opens onto the pocket the middle path ends in.', 'Isaac'); } });
      M.object('boulder', 8, 9, { id: 'svc_boulder_l', onLift: function* (E) { yield E.say('The left boulder lifts. A puddle under it, and foliage on the wall behind.', 'Isaac'); } });
      M.object('puddle', 8, 11, { id: 'svc_puddle' });
      M.object('vines', 7, 12, { id: 'svc_foliage', onClear: function* (E) { const Mp = G.field.map; persistGround(Mp, 6, 12, 'stairs_up'); persistWalkable(Mp, 6, 12); Mp.finalize(); G.set('svc_stair_found'); yield E.say('Stairs, cut into the rock behind the foliage!', 'Sheba'); } });
      M.exit(6, 12, 1, 1, 'shaman_cave_3', 14, 13, DIR.DOWN, { stairs: true, cond: () => !!G.flag('svc_stair_found') });   // up and over: the stair comes out in the pocket
      // Eddy in the pocket at the middle path's end: it flees down the path until the boulder is lifted
      if (!(G.party && G.party.djinnFound.includes('Eddy'))) { if (G.flag('svc_back_open') || G.flag('svc_mid_open')) M.djinni('Eddy', 14, 14, { fight: true }); else M.object('spot', 14, 14, { id: 'svc_eddy_glimpse', tile: null, script: function* (E) { yield E.say('(Something splashes away deeper into the pocket, quick as a fish. It would have to be cornered.)'); } }); }
      M.sign(24, 3, 'The way to Shaman Village: along the top and down the right.');
    }
  });
  // ====================== the cave beyond: the ledge from the great cave, the brown pillar, the lower way from the coast, the village ======================
  const C2 = grid(32, 16, '#');
  fill(C2, 2, 2, 29, 6, '.'); fill(C2, 2, 9, 29, 14, '.'); C2[1][10] = '.'; C2[10][0] = '.'; C2[10][1] = '.';
  fill(C2, 21, 9, 21, 14, '#'); C2[11][21] = 'p';   // the rock across the lower way, with the gap in it
  C2[7][26] = 'v'; C2[8][26] = 'v';   // the vine off the ledge's east end
  fill(C2, 30, 11, 31, 12, '.');
  for (const [x, y] of [[5, 3], [12, 5], [28, 3], [6, 12], [26, 13]]) C2[y][x] = 'o';
  defineMap('shaman_cave_2', {
    name: 'Shaman Village Cave', w: 32, h: 16, base: 'void', music: 'tlacaves', bg: 'cave', entry: { x: 1, y: 10 }, enc: CAVE_ENC, retreat: { map: 'world_tla', x: 79, y: 77, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(C2), CL, ROCK);
      M.exit(0, 10, 1, 1, 'shaman_cave', 22, 15, DIR.LEFT); M.exit(10, 0, 1, 1, 'shaman_cave_3', 26, 14, DIR.UP); M.exit(31, 11, 1, 2, 'shaman', 24, 8, DIR.RIGHT);
      // the brown pillar on the ledge: two spots to the right and it topples off the ledge into the gap below - the shortcut
      M.object('pillar', 17, 4, { id: 'svc_pillar', tile: 'ak_stone_brown', poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'svc_pillar'); if (!o || o.x !== 19 || o.y !== 4) return; const Mp = G.field.map; o.gone = true; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: true, state: o.state }); Engine.doShake(10); Audio.sfx('push'); persistGround(Mp, 21, 11, 'pillar_fallen'); Mp.finalize(); G.set('svc_shortcut'); yield E.say('The pillar tips over the edge of the ledge and crashes into the gap in the rock below. A bridge - the lower way through is open!', 'Piers'); } });
      M.npc('svc_cleric', 27, 4, { type: 'priest', name: 'Cleric', dir: DIR.DOWN, text: T('Shaman Village is beyond, outlanders. I will tell you what no one there will: the village does not speak to strangers. That is Moapa\'s word, and his word is the tribe\'s law.', 'The whole village is speaking of you. Moapa\'s law is bent, if not broken - and I think he does not mind it.'), mind: T('(They will get nothing from the villagers. Nothing but silence. Perhaps Moapa himself...)', '(Hoabna\'s promise, kept at last. Yegelos\'s heirs came, after all.)') });
    }
  });
  // ====================== Shaman Village ======================
  const VL = {
    '.': 'grass', 'd': 'dirt', 'p': 'path', 'w': 'water', 'B': 'bridge_v', 'b': 'bridge', 'f': 'flowers', 'E': { ground: 'grass', obj: 'tent' }, 'o': { ground: 'grass', obj: 'rock_grass' }, 'T': { ground: 'grass', obj: 'tree' },
    'j': { ground: 'grass', obj: 'pot' }, 'x': { ground: 'grass', obj: 'fence' }, 'L': { ground: 'grass', obj: 'ladder', walk: true }, 'D': { ground: 'dirt', obj: 'door_cave', walk: true }, 'g': { ground: 'grass', obj: 'gate_wood' }
  };
  const V = grid(34, 36, '.');
  fill(V, 0, 0, 33, 1, '#'); fill(V, 0, 0, 1, 35, '#'); fill(V, 32, 0, 33, 35, '#'); fill(V, 0, 35, 33, 35, '#');
  fill(V, 14, 2, 15, 18, 'w'); fill(V, 4, 19, 15, 20, 'w'); fill(V, 22, 19, 23, 35, 'w'); fill(V, 22, 25, 31, 26, 'w');   // the river: down from the north, west along the middle, and the east channel
  V[10][14] = 'B'; V[10][15] = 'B'; V[19][8] = 'b'; V[20][8] = 'b'; V[22][22] = 'B'; V[22][23] = 'B'; V[30][22] = 'B'; V[30][23] = 'B';   // the bridges
  fill(V, 2, 2, 12, 12, '#'); fill(V, 3, 3, 11, 10, 'd'); V[11][6] = 'L'; V[12][6] = 'L'; V[10][10] = '#';   // the mesa top-left: Moapa's house on it, the ladder up its face, the rock on its edge above the rope
  fill(V, 2, 12, 3, 12, 'd'); fill(V, 2, 13, 3, 13, '#');   // the shelf under the mesa with the Spirit Gloves: only the vine Growth makes reaches it
  fill(V, 17, 2, 31, 14, '#'); fill(V, 18, 8, 30, 13, 'd'); V[7][23] = 'D'; V[14][20] = 'L';   // the mesa top-right: the cave's mouth in its face, the ladder down to the square, the way east
  fill(V, 2, 14, 3, 20, 'd'); fill(V, 4, 14, 4, 18, 'x');   // the river bank strip below the shelf, fenced off from the square: the inn cellar's back door opens onto it
  fill(V, 2, 21, 12, 24, '#'); fill(V, 5, 22, 11, 23, 'd'); V[21][8] = 'd';   // the inn's terrace, open where the bridge comes up to it
  fill(V, 24, 27, 31, 34, '#'); fill(V, 25, 28, 30, 33, 'd'); V[30][24] = 'd';   // the rightmost home's rise, open where the bridge comes over the channel
  fill(V, 15, 33, 17, 34, 'p'); V[0][15] = 'p'; V[1][15] = 'p'; V[0][16] = 'p'; V[1][16] = 'p'; fill(V, 16, 2, 16, 8, 'p');   // the way in from the south, the way north to Trial Road
  fill(V, 5, 14, 13, 18, 'd'); fill(V, 16, 15, 21, 18, 'd');
  for (const [x, y] of [[4, 28], [11, 32], [19, 22], [3, 33], [29, 21], [12, 4], [28, 4], [20, 24]]) V[y][x] = 'T';
  for (const [x, y] of [[9, 29], [20, 32], [5, 16], [27, 17], [10, 26], [2, 15]]) V[y][x] = 'o';
  V[27][12] = 'E'; V[28][12] = 'E'; V[30][17] = 'E'; V[31][17] = 'E';   // the two tepees on the green
  for (const [x, y] of [[7, 26], [18, 25], [4, 30]]) V[y][x] = 'f';
  fill(V, 13, 3, 13, 9, 'x');
  defineMap('shaman', {
    name: 'Shaman Village', w: 34, h: 36, base: 'grass', music: 'shaman', bg: 'grass', entry: { x: 16, y: 33 }, retreat: { map: 'world_tla', x: 79, y: 77, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(V), VL, { cliff: '#', set: 'brownrock', faces: 1 });
      M.walkable(15, 35, 3, 1); M.exit(15, 35, 3, 1, 'world_tla', 79, 77, DIR.DOWN);
      M.walkable(15, 0, 2, 1); M.exit(15, 0, 2, 1, 'trial_road', 12, 30, DIR.UP, { cond: () => !!G.flag('moapa_trial') || !!G.flag('trial_road_won') });
      M.exit(23, 7, 1, 1, 'shaman_cave_2', 30, 11, DIR.UP, { door: true }); M.walkable(31, 12); M.set(31, 12, 'dirt'); M.setObj(31, 12, null); M.exit(31, 12, 1, 1, 'shaman_east', 1, 10, DIR.RIGHT);
      // the houses: Moapa's on the mesa, the inn on its terrace, the home by the tepees, the two east homes (the rightmost with the balcony), and the sanctum
      M.house(4, 4, 6, 5, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_moapa', tx: 6, ty: 8, windows: true, doorX: 3 });
      M.house(4, 23, 6, 4, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false, doorX: 2, wallRows: 1 });
      M.house(4, 30, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_house3', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(25, 15, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_house7', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(26, 29, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_house8', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(15, 26, 5, 4, 'roof_purple', { wall: 'wall_mud', to: 'shaman_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign', windows: false, doorX: 2 });
      // the tepees: the seer's, and one shut against outsiders until the trial is won
      M.exit(12, 29, 1, 1, 'shaman_tepee_seer', 4, 5, DIR.UP, { door: true }); M.walkable(12, 29); M.exit(17, 32, 1, 1, 'shaman_tepee2', 4, 5, DIR.UP, { door: true, cond: won }); M.walkable(17, 32);
      M.trigger(17, 32, 1, 1, function* (E) { yield E.say('The tepee is laced shut from inside. Someone in there is keeping very still.'); }, { cond: () => !won() });
      // the inn cellar's back door opens on the river bank west of the terrace; the plant north of it, Growth, the Spirit Gloves on the shelf above
      M.setObj(3, 21, 'door_cave'); M.walkable(3, 21); M.exit(3, 21, 1, 1, 'shaman_inn_cellar', 8, 1, DIR.UP, { door: true, cond: () => !!G.flag('sv_cellar_door') });
      M.object('sprout', 3, 14, { id: 'sv_sprout', onGrow: function* (E) { yield E.say('The vine climbs the face of the mesa, up to the shelf under Moapa\'s house.'); } });
      M.chest(2, 12, 'Spirit Gloves', 1);
      // the rope up the mesa's south face by Moapa's house: its head is tied off only once the pillar sits in the gap on the east screen; Aroma at the top
      if (G.flag('sv_pillar_gap')) { M.object('rope', 10, 13, { id: 'sv_rope', len: 2, dx: 0, dy: -1, onLash: function* (E) { yield E.say('The rope pulls taut against the pillar wedged above. It will hold.', 'Felix'); } }); M.set(10, 11, 'dirt'); M.setObj(10, 11, null); M.walkable(10, 11); M.setObj(10, 12, 'rope_end'); }
      else { M.setObj(10, 12, 'rope_end'); M.object('spot', 10, 13, { id: 'sv_rope_slack', tile: null, script: function* (E) { yield E.say('A rope hangs down the mesa\'s face, but its other end lies loose over the top. Lash would only pull it down.'); } }); }
      M.djinni('Aroma', 10, 11, { fight: false, cond: () => !!G.flag('sv_pillar_gap') });
      // Moapa on his doorstep: the scene, and the way onto Trial Road
      M.trigger(6, 9, 3, 2, T3.moapaDoor, { cond: () => !G.flag('moapa_trial') && !won() });
      M.npc('sv_moapa_out', 7, 10, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN, cond: () => !!G.flag('moapa_met') && !G.flag('moapa_trial') && !won(), script: T3.moapaDoor });
      M.npc('sv_man1', 5, 10, { type: 'tribal', name: 'Man', dir: DIR.RIGHT, cond: () => !!G.flag('moapa_met') && !won(), script: function* (E) { yield E.say("If there's something you want to say, say it to Moapa, not to us. We don't want to hear it.", 'Man'); }, mind: "(If it hadn't been for Moapa, I'd have been glad to fling these outlanders into the cold.)" });
      M.npc('sv_man2', 9, 10, { type: 'tribal', name: 'Man', dir: DIR.LEFT, cond: () => !!G.flag('moapa_met') && !won(), script: function* (E) { yield E.say("If you anger Moapa, you'll be in for a little taste of his awesome and terrible power.", 'Man'); }, mind: "(Maybe they're looking for treasure. They ought to be looking in Contigo, not here. The temple near Contigo is filled with treasure beyond belief.)" });
      M.npc('sv_man1b', 5, 10, { type: 'tribal', name: 'Man', dir: DIR.RIGHT, cond: won, text: "I don't think the other villagers will ever forgive us for losing to you on Trial Road. If they had any idea how strong you are, they wouldn't be complaining.", mind: "(That wasn't a fair fight... I was all worn out from the climb... How could I fight? How did Hoabna manage to fight after climbing a mountain like that!?)" });
      M.npc('sv_man2b', 9, 10, { type: 'tribal', name: 'Man', dir: DIR.LEFT, cond: won, text: "Your attacks showed skill and speed, but if we meet in battle again, I won't lose.", mind: '(Just climbing to the top of Trial Road is excruciating. It must have been hard for Yegelos and Hoabna, too.)' });
      // the villagers: silent until the trial is won, their minds open to Sheba
      const v = (id, x, y, type, before, mindBefore, after, mindAfter, opts) => M.npc(id, x, y, Object.assign({ type, name: won() ? 'Villager' : '', text: T(before, after), mind: T(mindBefore, mindAfter) }, opts || {}));
      v('sv_001', 8, 16, 'tribal', '...', "(Hm. Outsiders... I don't like the looks of them. I'm just going to wait until they leave.)", 'So, you rose to the challenge of Trial Road? Moapa was quite impressed with you!', '(Moapa is quite honorable to sing their praises. This is what makes him a leader.)', { move: 'wander' });
      v('sv_002', 19, 16, 'tribal_f', '...', "(Ugh... Foreigners. I'm not going to waste my time even TALKING to them!)", 'Heroes cannot be evil. And now, we have learned that heroes can be foreigners, too.', '(We are too cautious around strangers. The world should not be such an unfriendly place.)', { move: 'wander' });
      v('sv_003', 6, 31, 'tribal', '...', '(Our ancestors learned that we can trust no one but the people of Contigo, our longtime friends!)', "Everyone in town is talking about how you have fulfilled Hoabna's promise.", '(I hope that we remain close friends with the Contigo after this.)', { dir: DIR.RIGHT });
      v('sv_004', 20, 30, 'tribal', '...', "(Until the chief says otherwise, nobody will talk to these outsiders. It's the law.)", 'The people of Shaman Village are normally quiet, valiant, and noble. You defeated Moapa, and we must respect the bravery you demonstrated in fighting him.', "(It's tough to imagine this bunch beating Moapa, but I'm not thinking about it.)", { move: 'wander' });
      v('sv_005', 28, 22, 'tribal_f', '...', '(Who invited these foreigners into our town?)', 'You defeated Moapa, and that is ample proof of your skill as warriors. I think you will find that the people of Shaman Village treat you quite differently now.', '(Someday, a child in Shaman will grow to be stronger even than Moapa. Then, the Shaman tribe will rise up again and reclaim what it once lost to Contigo.)', { dir: DIR.LEFT });
      v('sv_006', 10, 18, 'elder_m', '...', '(Shut your doors tight when outsiders are in sight. If we want to protect ourselves, our culture, we have to keep outsiders OUT.)', 'Some people among the Shaman tribe possess a special power... The story goes that those with this power are the chosen few.', '(People living on the outskirts of Shaman Village have different powers from us. Why would that be?)', { dir: DIR.DOWN });
      M.npc('sv_007', 27, 9, { type: 'tribal', name: T('', 'Villager'), script: function* (E) { if (!won()) { yield E.say('...'); return; } const r = yield* E.ask('After your battle, did you check on the other side of the mountain?', 'Villager', ['Yes', 'No']); if (r === 0) yield E.say("Did you see the spring? There's supposed to be a spring that only Hoabna could find.", 'Villager'); else yield E.say('If you have the same powers Hoabna had, you might be able to get there... Nobody with the powers of the Shaman tribe alone can reach the hidden spring.', 'Villager'); }, mind: T('(These foreigners look trustworthy, but I know better... They may seem nice, but all outsiders are wicked!)', "(If I had the power to break down walls of sand, I'd climb to the other side of the mountain.)") });
      v('sv_008', 3, 17, 'elder_f', '...', '(Our ancestors learned a harsh lesson... Shamans never lie, but outsiders are never honest.)', 'Your battle with Moapa was just like the legendary battle between Hoabna and Yegelos! I would love to have watched, to see a new legend in the making...', "(I never thought I'd live to see the day Hoabna's promise was fulfilled. Of course, I never thought anyone with Contigo blood could defeat a Shaman hero.)", { dir: DIR.RIGHT });
      v('sv_009', 13, 15, 'child_m', '...', '(Nobody talks to outsiders. Nobody. Not even me.)', "I've been locked up inside all day! I'm so glad to get outside and stretch!", "(All of the older people in town are really upset that Moapa lost... It doesn't matter to us kids. I think they're too hung up on tradition.)", { move: 'wander', cond: won });
      v('sv_010', 20, 34, 'child_f', '...', '', "Ah... I've been inside for so long... I think I'll have a little picnic! But what should I eat...", "(I'm starving! I can't wait until dinner! I love my meat and potatoes! And BEANS!!! It must be the spices the chef uses... Lots of salt, and lots of pepper!)", { move: 'wander', cond: won });
      M.trigger(15, 1, 2, 1, function* (E) { yield E.say('A barricade across the road, and a sign on it: "Trial Road. None may enter without permission from Moapa."'); }, { cond: () => !G.flag('moapa_trial') });
      M.sign(18, 33, 'Shaman Village. Outlanders are not spoken to here.');
      M.trigger(15, 33, 3, 2, function* (E) { yield E.say('Shaman Village. Look at them - they see us, and every one of them turns away.', 'Jenna'); yield E.say("The cleric said as much. Moapa's law: no word to outsiders. We will have to find Moapa himself.", 'Kraden'); }, { once: 'sv_seen' });
      M.trigger(23, 8, 1, 1, function* (E) { yield E.say('Out of the caves at last - and into a village that has heard us coming. Not a friendly face among them.', 'Piers'); }, { once: 'sv_seen', cond: () => !G.flag('sv_seen') });
    }
  });
  // ---- the east screen: the pillar for the gap, the Shaman's hut ----
  const EL = Object.assign({}, VL, { 'P': { ground: 'grass', obj: 'pillar_base' } });
  const EV = grid(18, 26, '.');
  fill(EV, 0, 0, 17, 1, '#'); fill(EV, 17, 0, 17, 25, '#'); fill(EV, 0, 25, 17, 25, '#'); fill(EV, 0, 0, 0, 25, '#');
  fill(EV, 1, 9, 1, 11, '.'); fill(EV, 2, 14, 16, 16, '#'); fill(EV, 3, 3, 15, 13, 'd'); fill(EV, 2, 17, 16, 24, '.'); fill(EV, 6, 20, 7, 20, 'w'); EV[20][8] = 'B';
  fill(EV, 4, 5, 5, 6, 'p'); fill(EV, 10, 4, 11, 4, 'd');
  for (const [x, y] of [[13, 19], [3, 22], [14, 23]]) EV[y][x] = 'T';
  defineMap('shaman_east', {
    name: 'Shaman Village - East', w: 18, h: 26, base: 'grass', music: 'shaman', bg: 'grass', entry: { x: 1, y: 10 }, retreat: { map: 'world_tla', x: 79, y: 77, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(EV), EL, { cliff: '#', set: 'brownrock', faces: 1 });
      M.exit(0, 9, 1, 3, 'shaman', 30, 12, DIR.LEFT); M.walkable(0, 9, 1, 3);
      // the balcony of the rightmost home comes out on the lower green; the pillar on the mesa top is Moved into the gap at its edge
      M.setObj(9, 24, 'door_cave'); M.walkable(9, 24); M.exit(9, 24, 1, 1, 'shaman_house8_up', 5, 1, DIR.DOWN, { door: true });
      M.object('pillar', 7, 9, { id: 'sv_pillar', onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'sv_pillar'); if (o && o.gone && !G.flag('sv_pillar_gap')) { G.set('sv_pillar_gap'); yield E.say("The pillar drops into the gap and sits fast in it. Whatever is tied to it now will hold - the rope by Moapa's house, for one.", 'Felix'); } } }); M.set(7, 13, 'pit'); M.setObj(7, 13, null);
      M.house(11, 6, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'shaman_hut', tx: 5, ty: 6, windows: false, doorX: 2 });
      M.trigger(13, 10, 1, 1, function* (E) { yield E.say('The Shaman\'s hut. Its door is barred to outsiders.'); }, { cond: () => !won() });
      M.sign(4, 19, 'The east green. The Shaman\'s hut stands on the mesa above.');
    }
  });
  // ---- the houses ----
  Kit.home('shaman_moapa', { name: "Moapa's House", w: 12, h: 10, wall: 'wall_mud', back: { map: 'shaman', x: 7, y: 9 }, doorX: 6, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['shelf', 9, 2], ['pot', 10, 7], ['fireplace', 7, 1]],
    stairs: { x: 2, y: 7, to: 'shaman_moapa_cellar', tx: 4, ty: 2, down: true },
    npcs: [{ id: 'sv_moapa_in', x: 6, y: 3, look: NPC_LOOKS.Moapa, name: 'Moapa', cond: () => won(), script: function* (E) { if (G.flag('moapa_names')) { yield E.say('Felix, the hero of Contigo! I shall never forget you, the only one that defeated me!', 'Moapa'); return; } const r = yield* E.ask("You have defeated me, and yet I still don't know your names... Would you tell me?", 'Moapa', ['Yes', 'No']); if (r === 0) { G.set('moapa_names'); yield E.say('Felix, Jenna, Sheba, and Piers. I shall remember those names. We do not forget the names of heroes who can defeat me in fair combat.', 'Moapa'); } else yield E.say('A warrior who does not share his name is a humble warrior indeed.', 'Moapa'); }, mind: () => G.flag('moapa_names') ? '(Felix, Jenna, Sheba, and Piers... I won\'t forget those names... Someday, their names will be engraved on the columns leading to Trial Road.)' : '(If a warrior beats you, you must learn his name... Not many people have beaten me, and they deserve my respect.)' },
      { id: 'sv_mwife', x: 3, y: 5, type: 'tribal_f', name: T('', "Moapa's Wife"), text: T('...', "Moapa said that he doesn't even know the names of the heroes who beat him... He feels bad for not having asked. Maybe you should go tell him your names."), mind: T("(Moapa left the door open, and strangers got in... Ah, but they're gone already...)", '(I would feel bad not knowing the name of a warrior who defeated me, I guess...)') },
      { id: 'sv_mson', x: 8, y: 6, type: 'child_m', name: T('', "Moapa's Son"), text: T('...', "In a formal battle, it is both customary and honorable to give your name. It's not too late for you... Please go tell my father your names."), mind: T("(The outlanders look like warriors, but they're nothing next to my father. He's the leader of Shaman Village, but he's also just so strong! He never loses!)", '(What a shame... My own father, losing to some ignorant foreigner with bad manners.)') },
      { id: 'sv_mdau', x: 9, y: 4, type: 'child_f', name: T('', "Moapa's Daughter"), text: T('...', 'Why does it matter if you know the name of someone who beat you or not?'), mind: T("(Those are the first foreigners I've ever seen... They don't look so different from us.)", "(It's so old-fashioned to have to give your name to an opponent before a battle.)") }] });
  Kit.interior('shaman_moapa_cellar', { name: 'Cellar', w: 9, h: 7, floor: 'floor_stone', wall: 'wall_in_stone', back: null, doorX: -1, furn: [['barrel', 6, 2], ['crate', 1, 2], ['shelf', 3, 1]], stairs: { x: 4, y: 1, to: 'shaman_moapa', tx: 2, ty: 8 } });
  Kit.inn('shaman_inn', { name: 'Shaman Inn', price: 80, w: 14, h: 11, wall: 'wall_mud', back: { map: 'shaman', x: 6, y: 27 }, stairs: { x: 12, y: 8, to: 'shaman_inn_cellar', tx: 2, ty: 2, down: true },
    build(M) { const k = M.npcs.find(n => n.id === 'shaman_inn_keeper'); if (k) { k.name = 'Innkeeper'; k.script = function* (E) { if (won()) { const r = yield* E.ask("You've traveled to lots of different lands, haven't you?", 'Innkeeper', ['Yes', 'No']); if (r === 0) yield E.say('That explains it... The only reason you won is because of your travels... Your strange, exotic weapons are what won the day, not your skill.', 'Innkeeper'); else yield E.say("I could have sworn that fancy boat was yours... If you can afford such a nice boat, you can probably afford nice weapons, too.", 'Innkeeper'); } else yield E.say('(He says nothing, but holds up a card: "Put 80 coins on the counter, and you can stay.")'); yield* E.inn(80); }; k.mind = T("(I don't much like strangers, but if they're willing to pay, I'm willing to let them stay.)", '(Moapa has been miserable since his defeat. If only I could have taken his place up there.)'); }
      M.npc('sv_inn2', 6, 2, { type: 'tribal_f', name: T('', 'Innkeeper'), text: T('...', "We're very fond of Moapa here. He's a great leader. If anyone in town says something mean to you, please forgive them."), mind: T("(Moapa ordered us to let them stay. I don't know why, though. It's not like we lock the doors.)", '(It drives me nuts how worked up everyone gets about Moapa around here.)') });
      M.npc('sv_chef', 10, 4, { type: 'merchant', name: T('', 'Chef'), dir: DIR.DOWN, text: T('...', 'Around here, people like a nice hot steak and some potatoes and beans... You foreigners might be used to strange, exotic food, but we like our meals simple.'), mind: T('(Feed them and be rid of them, Moapa says. Fine.)', '(Those fancy foreign chefs use all sorts of spices to hide the flavor of their food. As far as I\'m concerned, there are only two spices: salt and pepper.)') }); } });
  Kit.interior('shaman_inn_cellar', { name: 'Inn Cellar', w: 10, h: 7, floor: 'floor_stone', wall: 'wall_in_stone', back: { map: 'shaman', x: 3, y: 22 }, doorX: 8, furn: [['barrel', 1, 1], ['barrel', 2, 1], ['crate', 6, 4], ['shelf', 4, 1]], stairs: { x: 2, y: 5, to: 'shaman_inn', tx: 12, ty: 9 },
    build(M) { M.exits.forEach(e => { if (e.to === 'shaman') { e.tx = 3; e.ty = 20; e.dir = DIR.UP; } }); M.trigger(8, 5, 1, 1, function* (E) { G.set('sv_cellar_door'); }, { cond: () => !G.flag('sv_cellar_door') }); } });
  Kit.home('shaman_house3', { name: 'Home', wall: 'wall_mud', back: { map: 'shaman', x: 6, y: 34 }, npcs: [
    { id: 'sv_011', x: 4, y: 5, type: 'tribal', name: T('', 'Man'), text: T('...', "I was stunned to hear that Moapa lost his battle... His weapons all came from my own warehouse, so I feel a little responsible."), mind: T('(Say nothing. Say nothing, and they will go.)', "(Although it's not right to blame his loss on the weapons he used. I couldn't afford it if that rumor started going around.)") },
    { id: 'sv_item', x: 8, y: 5, type: 'tribal_f', name: T('', 'Woman'), text: T('...', 'Everyone is depressed that Moapa lost his big fight. They should be glad the hero came!'), mind: T('(The door was open. I should have shut it.)', '(My husband is getting neurotic, worrying about whether his weapons caused the loss.)') }] });
  Kit.home('shaman_house7', { name: 'Home', wall: 'wall_mud', back: { map: 'shaman', x: 27, y: 19 }, npcs: [
    { id: 'sv_012', x: 3, y: 4, type: 'child_m', name: T('', 'Boy'), text: T('...', 'The battles between Shaman and Contigo were terrible, and few warriors ever survived. Eventually, our towns chose Hoabna and Yegelos to fight as our champions.'), mind: T('(Grandma says not one word to them.)', "(Grandma and Grandpa have been in a terrible mood since they heard Moapa lost. They're probably tired of being asked about the ancient war between Atteka and Hesperia.)") },
    { id: 'sv_013', x: 8, y: 4, type: 'child_f', name: T('', 'Girl'), text: T('...', "I've always wondered why the final battle between Hoabna and Yegelos took place here. I think Yegelos was really brave for traveling here all the way from Contigo."), mind: T('(Are they going to hurt us?)', "(Everyone always comes to ask Grandma and Grandpa about the old battles of legend. It's all anyone ever talks to them about anymore. I'll bet they're tired of it.)") },
    { id: 'sv_014', x: 4, y: 7, type: 'elder_m', name: T('', 'Old Man'), text: T('...', 'For years, the people of Hesperia fought against the people of Atteka... Our own Shaman Village was caught up in this war, as were the people of Contigo.'), mind: T('(Outlanders in my house. In MY house.)', "(I had thought that, after Yegelos, Contigo remained without a new hero. Now, suddenly, a hero shows up who is mightier even than Moapa. It's beyond belief!)") },
    { id: 'sv_015', x: 8, y: 7, type: 'elder_f', name: T('', 'Old Woman'), text: T('...', 'In those dark times, Contigo and Shaman fought repeatedly to protect our lands. We fought to no avail, until we decided to let Hoabna and Yegelos fight for the outcome.'), mind: T('(Not a word. Not one.)', "(The stories always said that the heroes of Contigo were inferior to our own. Now, I'm not so sure... It sounded like a fair match, and yet Shaman's hero lost.)") }] });
  Kit.home('shaman_house8', { name: 'Home', wall: 'wall_mud', back: { map: 'shaman', x: 28, y: 33 }, stairs: { x: 9, y: 2, to: 'shaman_house8_up', tx: 2, ty: 5 }, npcs: [
    { id: 'sv_016', x: 4, y: 5, type: 'tribal_f', name: T('', 'Woman'), text: T('...', "I can finally open the door and air the place out. I can't believe Moapa was on the mountain fighting while I was stuck in here."), mind: T('(Lock the door. Why did nobody lock the door?)', "(I thought it was quiet out here. I've been locked inside all day, so I couldn't check... It was all because they were fighting Moapa up on Trial Road...)") },
    { id: 'sv_017', x: 7, y: 6, type: 'tribal', name: T('', 'Man'), text: T('...', "If I'd known that there was going to be a challenge on Trial Road... I wouldn't have locked up. I'd have been right up there, watching the fight!"), mind: T('(They will leave. They always leave.)', '(Nobody got to watch the challenge at Trial Road. It was just too far from town. What a stupid law, that makes us hide away and miss all the battles!)') }] });
  // the balcony: out over the east green, with the Lucky Medal jar once the village is friendly
  Kit.interior('shaman_house8_up', { name: 'Balcony', w: 8, h: 6, floor: 'floor_wood', wall: 'wall_mud', back: { map: 'shaman_east', x: 9, y: 23 }, doorX: 5, furn: [['pot', 1, 3]], stairs: { x: 2, y: 4, to: 'shaman_house8', tx: 9, ty: 3, down: true },
    build(M) { M.exits.forEach(e => { if (e.to === 'shaman_east') { e.dir = DIR.UP; } }); if (won()) M.container(6, 2, 'pot', 'Lucky Medal', 1); else M.setObj(6, 2, 'pot'); } });
  Kit.interior('shaman_tepee_seer', { name: 'Tepee', w: 8, h: 7, floor: 'rug', wall: 'wall_wood', back: { map: 'shaman', x: 12, y: 30 }, doorX: 4, furn: [['pot', 1, 2], ['torch', 6, 1]],
    npcs: [{ id: 'sv_seer', x: 4, y: 2, type: 'monk', name: 'Seer', dir: DIR.DOWN, script: function* (E) { if (!won()) { yield E.say('Hoolabaloo!', 'Seer'); yield E.say('(The seer turns his back and hums to himself. He will say nothing more to outsiders.)'); return; } const r = yield* E.ask("So, you'd like to hear your fortune, would you?", 'Seer', ['Yes', 'No']); if (r !== 0) { yield E.say("That's probably good. The things I see are not for everyone to hear.", 'Seer'); return; } if (G.flag('jupiter_done')) { yield E.say('Wallamafoo! Ballabahoo! Whazupwichoo! I can see it clearly... Your life is thick with danger... Ooo... Wow, that was a strong one... North by northeast is... bad. Bad stuff up there. Wow. Oh, it\'s terrible! Awful beyond words! No more, no more!', 'Seer'); yield E.say("Listen, I want you to promise me you'll NEVER go north by northeast. You got that?", 'Seer'); } else { yield E.say("Well, you caught me in a good mood... I'll do it! Hoolabaloo! Ballabahoo! Hoolabaloola! I can see it clearly... Your life is thick with danger... Ooo... Wow, that was a strong one... Listen, don't go south. Bad stuff down there. Wow. Oh, it's terrible! Awful beyond words! No more, no more!", 'Seer'); yield E.say("You should absolutely not go south. Do you hear me? I'm serious about this...", 'Seer'); } }, mind: "(That's weird... Everything is cloudy... The ether is grey and full of mists... The world is undergoing some sort of change, it seems.)" }] });
  Kit.interior('shaman_tepee2', { name: 'Tepee', w: 8, h: 7, floor: 'rug', wall: 'wall_wood', back: { map: 'shaman', x: 17, y: 33 }, doorX: 4, furn: [['pot', 6, 2], ['bed', 1, 2]],
    npcs: [{ id: 'sv_018', x: 3, y: 3, type: 'tribal', name: 'Man', text: "Don't be too pleased with yourself for beating Moapa. One of these days, we'll come storming into Contigo, and we'll show you what's what!", mind: "(Moapa must have been hungry after climbing the mountain... That's the only way those lousy Contigo nobodies could have beaten him.)" },
      { id: 'sv_019', x: 5, y: 4, type: 'elder_f', name: 'Old Woman', text: 'Oh, please... Let a true warrior be born in Shaman. Let us forget this disgrace!', mind: "(I can't forgive the fact that Contigo's heroes beat our leader, Moapa... I hope a new hero is born in Shaman, one who can crush those Contigo barbarians.)" }] });
  Kit.interior('shaman_hut', { name: "Shaman's Hut", w: 9, h: 7, floor: 'rug', wall: 'wall_wood', back: { map: 'shaman_east', x: 13, y: 10 }, doorX: 4, furn: [['torch', 1, 1], ['torch', 7, 1], ['shelf', 4, 1]],
    build(M) { if (won()) M.container(7, 2, 'pot', 'Lucky Pepper', 1); else M.setObj(7, 2, 'pot'); M.setObj(1, 2, 'pot'); M.exits.forEach(e => { if (e.to === 'shaman_east') e.cond = won; }); } });
  Kit.sanctum('shaman_sanctum', { name: 'Shaman Sanctum', wall: 'wall_mud', back: { map: 'shaman', x: 17, y: 30 },
    build(M) { const p = M.npcs.find(n => n.id === 'shaman_sanctum_priest'); if (p) { p.name = 'Great Healer'; p.text = T("Nothing personal, but nobody in town will talk to you. It may seem weird, but it's a law among the Shaman tribe.", 'You beat Moapa? Incredible! ...Not that I ever doubted you!'); p.mind = T("(They'll need to find Moapa if they want to talk to one of the locals.)", "(The older folks of Shaman are quite upset that Moapa was beaten. I'm afraid this might lead to renewed fighting between Shaman and Contigo.)"); } } });
  // ---- Moapa on his doorstep: the whole scene, and the rod ----
  T3.moapaDoor = function* (E) {
    const first = !G.flag('moapa_met');
    if (first) {
      G.set('moapa_met'); E.spawn('sv_moapa_out', 7, 10, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN }); E.spawn('sv_man1', 5, 10, { type: 'tribal', name: 'Man', dir: DIR.RIGHT }); E.spawn('sv_man2', 9, 10, { type: 'tribal', name: 'Man', dir: DIR.LEFT });
      yield E.say("This is my house. If you're looking for Moapa, here I am. Back up. Give me some room.", 'Moapa'); yield E.move('player', DIR.DOWN, 1);
      yield E.say('Who has we here? Strangers in Shaman Village? What is your purpose in coming here?', 'Moapa');
      yield E.say('Shaman Village does not appreciate intruders.', 'Man'); yield E.say("You're not welcome here, outlander. Leave now, and never come back.", 'Man');
      yield E.say("If there's something you want to say, hurry up and say it. I'll listen, but not for long!", 'Moapa');
    }
    const has = G.inventory.has("Shaman's Rod") || G.party.members.some(m => Object.values(m.equip || {}).includes("Shaman's Rod"));
    const choices = (has ? ["Show him the Shaman's Rod"] : []).concat(['Show him something else', 'Say nothing']);
    const c = yield* E.ask("What's wrong? Nothing to say? Then what are you standing around for? Get out of town!", 'Moapa', choices);
    if (!has || c !== 0) { if (c === choices.length - 2) yield E.say("If you're offering charity, I won't have it... Or do you want to show me something?", 'Moapa'); return; }
    yield E.say("That's the Shaman's Rod!", 'Moapa');
    yield E.say('We thought it was lost forever... It once belonged to the great Hoabna.', 'Man');
    yield E.say("Hoabna's staff was a gift from his great friend in Contigo, Yegelos. When Yegelos gave it to him, Hoabna accepted a great responsibility...", 'Man');
    yield E.say('We vowed to care for the sacred treasure of Contigo, the Hover Jade... When the Shaman\'s Rod returns to us, we are charged to give the bearer the Hover Jade. Have you outlanders come to claim the Hover Jade?', 'Moapa');
    yield E.say('I suppose we have, yes.', 'Kraden');
    yield E.say("That's a shame. We'll never give the Hover Jade to you!", 'Moapa');
    yield E.say("But... we brought you the Shaman's Rod... What's stopping you from giving us the Jade?", 'Kraden');
    yield E.say('Hoabna handed the Hover Jade down from generation to generation for our care. We are to return it to the descendants of Yegelos. And you are clearly not from Contigo.', 'Moapa');
    yield E.say("That's preposterous! We returned your rod! We've come so far already!", 'Sheba'); yield E.say('What difference does it make if we\'re from Contigo or not!?', 'Jenna');
    yield E.say('Make no mistake about it. We are the intended recipients of the stone of Yegelos.', 'Piers'); yield E.say('Is there some way we can get our hands on the Hover Jade?', 'Kraden');
    yield E.say('No. You ask the impossible.', 'Moapa');
    yield E.say('What about... the test? Would that be a bad idea, Moapa?', 'Man'); yield E.say('You know, Trial Road? Only Yegelos could walk that path.', 'Man'); yield E.say('The way of the vanishing sand!', 'Man');
    yield E.say('Yes, if you outlanders intend to claim the Hover Jade, you must fetch it and bring it here! If you people have the courage, follow me!', 'Moapa');
    yield E.say('(Moapa and the two men head off north, toward Trial Road.)'); for (const id of ['sv_moapa_out', 'sv_man1', 'sv_man2']) E.despawn(id);
    yield E.say("If you'd told us there was a test to begin with, we'd have been out of your hair by now.", 'Sheba'); yield E.say('What kind of test is this?', 'Jenna');
    yield E.say("I understand that you're a little concerned, but unless you try it, you'll never know! Give it your best, Felix!", 'Kraden');
    G.set('moapa_trial');
  };
}
