// ---------- Taopo Swamp ----------
// After map references/golden-sun-the-lost-age-taopo-swamp-gba-map.webp (the swamp and its fourteen cave rooms),
// condensed to the swamp and four caves. Per the guide: the small pillar Moved into its pit, the west overgrowth
// (Whirlwind) and the Tear Stone under the cave's floor (Scoop); the mud, which the party sinks into a step at a
// time, and the bubbles that lift them out; the Cookie up the west stairs; the east overgrowth and the cave with
// the vents (a pillar over one stops it; the pillar over the Djinni's vent blows Flower down a level, and the slide
// follows him), the Bramble Seed in the foliage, the second Tear Stone; Growth on the sprout and the third
// overgrowth into the caves under the hill: the steam vent capped with Douse and Frost, the lava room and the
// rock cooled and pushed in for a stepping stone, the Vial behind another cooled rock, Tremor on the pillar under
// the boulder, the dark room, and Star Dust under the light the last cooled rock shows.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const ENC = [['Mad Plant #1'], ['Cave Troll'], ['Death Cap II', 'Death Cap II'], ['Dire Wolf'], ['Faery', 'Faery'], ['Ghost Mage II'], ['Mad Vermin', 'Mad Vermin'], ['Undead']];
  const WORLD = { map: 'world_tla', x: 238, y: 227, dir: DIR.DOWN };
  const LEG = {
    '.': 'grass', 'g': 'swamp', 'm': 'swamp_mud', 'o': 'swamp_bubble', 'w': 'water', 'p': 'pit', 'S': 'lc_slide', 'd': 'dirt',
    't': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'D': { ground: 'grass', obj: 'lc_door' },
    'L': { ground: 'grass', obj: 'ladder', walk: true }, 'T': { ground: 'swamp_mud', obj: 'tree' }, 'c': 'lc_floor', 'k': 'lc_dark', 'l': 'lava', 'v': 'vent', 'x': 'chasm'
  };
  const ROCK = { cliff: '#', set: 'cliff', faces: 2 };
  // ====================== the swamp ======================
  const S = grid(44, 30, '#');
  fill(S, 1, 12, 8, 15, '.'); fill(S, 0, 14, 0, 15, '.');   // the way in from the west, the first hollow
  fill(S, 9, 14, 12, 14, '.'); S[14][11] = 'p';   // the neck, one cell wide, with the little pillar's pit across it
  fill(S, 13, 8, 40, 26, 'm');   // the pan of mud
  fill(S, 13, 13, 14, 15, 'g'); fill(S, 13, 19, 14, 22, 'g'); fill(S, 39, 17, 40, 19, 'g'); fill(S, 26, 8, 32, 9, 'g');   // the firm islets: where the neck comes in, under the west stairs, under the east ledge, under the hill
  // the bubbles: the way across the mud east along the middle, and up to the hill
  for (const [x, y] of [[18, 14], [22, 14], [26, 14], [30, 14], [34, 14], [38, 14], [30, 11], [22, 18], [18, 22], [26, 22], [34, 20], [36, 10], [20, 10]]) S[y][x] = 'o';
  // dead trees and pools of standing water in the mud, off the bubbles' lines
  for (const [x, y] of [[16, 11], [23, 11], [35, 12], [20, 24], [28, 25], [37, 21], [16, 25], [24, 9], [36, 8], [21, 20], [32, 18], [27, 17]]) S[y][x] = 'T';
  for (const [x0, y0] of [[18, 9], [25, 19], [33, 24], [38, 20], [15, 17], [22, 25]]) fill(S, x0, y0, x0 + 1, y0 + 1, 'w');
  fill(S, 9, 19, 12, 22, '.'); S[18][10] = 'L'; fill(S, 9, 16, 12, 17, '.');   // the west stairs: the ledge off the mud, the ladder up to the Cookie's shelf
  fill(S, 41, 17, 43, 19, '.'); S[16][42] = 'D';   // the east ledge, and the overgrowth over the east cave's door above it
  fill(S, 25, 2, 33, 6, '.'); S[1][29] = 'D';   // the hill above the swamp: the sprout climbs to it, the third overgrowth is at its top
  S[11][5] = 'D';   // the west cave, behind the first overgrowth
  for (const [x, y] of [[2, 13], [6, 15], [27, 3], [32, 5], [3, 16], [11, 22], [43, 19]]) S[y][x] = 't';
  for (const [x, y] of [[4, 12], [10, 21], [26, 5]]) S[y][x] = 'b'; for (const [x, y] of [[7, 13], [41, 19], [31, 3]]) S[y][x] = 'r';
  defineMap('taopo', {
    name: 'Taopo Swamp', w: 44, h: 30, base: 'void', music: 'taopo', bg: 'swamp', entry: { x: 1, y: 14 }, enc: ENC, retreat: WORLD, mudStart: { x: 14, y: 14 }, sinkDepth: 5,
    build(M) {
      M.paint(0, 0, strs(S), LEG, ROCK);
      M.exit(0, 14, 1, 2, 'world_tla', 238, 227, DIR.DOWN);
      // the little pillar that goes into its pit, and the first overgrowth over the west cave's door
      M.object('pillar', 10, 14, { id: 'tao_p1' });
      M.object('vines', 5, 11, { id: 'tao_ivy1', reveal: 'lc_door' }); M.exit(5, 11, 1, 1, 'taopo_cave_w', 4, 8, DIR.UP, { door: true, cond: () => !M.objects.find(o => o.id === 'tao_ivy1' && !o.gone) });
      M.chest(10, 16, 'Cookie', 1);
      M.object('vines', 42, 16, { id: 'tao_ivy2', reveal: 'lc_door' }); M.exit(42, 16, 1, 1, 'taopo_cave_e', 3, 13, DIR.UP, { door: true, cond: () => !M.objects.find(o => o.id === 'tao_ivy2' && !o.gone) });
      // the hill: the sprout that Growth raises up its face, and the overgrowth at its top over the caves under the hill
      M.object('sprout', 29, 8, { id: 'tao_sprout', top: 7 });
      M.object('vines', 29, 1, { id: 'tao_ivy3', reveal: 'lc_door' }); M.exit(29, 1, 1, 1, 'taopo_cave_c1', 3, 12, DIR.UP, { door: true, cond: () => !M.objects.find(o => o.id === 'tao_ivy3' && !o.gone) });
      M.sign(3, 12, 'Taopo Swamp. The mud takes whatever stands still on it. Keep to the bubbles.');
      M.sign(13, 13, 'The mud: every step sinks you deeper. The bubbles bring you up again, and firm ground steadies you.');
      M.trigger(1, 13, 3, 4, function* (E) { yield E.say('Taopo Swamp. Dried up, the woman in Yallam said... it does not look dry to me.', 'Jenna'); yield E.say('Steam, under the ground. Sunshine comes here for what the earth throws up: stones for his forge. Mind the mud.', 'Kraden'); }, { once: 'taopo_seen' });
    }
  });
  // ====================== the west cave: the first Tear Stone ======================
  const CW = grid(12, 10, '#');
  fill(CW, 2, 2, 9, 7, 'c'); CW[8][4] = 'c'; CW[9][4] = 'D';
  defineMap('taopo_cave_w', {
    name: 'Taopo Swamp - Cave', w: 12, h: 10, base: 'void', music: 'taopo', bg: 'cave', indoor: true, entry: { x: 4, y: 8 }, enc: [['Mad Vermin', 'Mad Vermin'], ['Undead']], retreat: WORLD,
    build(M) { M.paint(0, 0, strs(CW), LEG, { cliff: '#', set: 'lilacrock', faces: 1 }); M.setObj(4, 9, 'lc_door'); M.exit(4, 9, 1, 1, 'taopo', 5, 12, DIR.DOWN, { door: true });
      M.object('scoop', 7, 4, { id: 'tao_dig1', item: 'Tear Stone', look: 'dig_spot' }); M.sign(3, 3, 'The floor here is soft, and something in it catches the light.'); }
  });
  // ====================== the east cave: the vents, the Bramble Seed, Flower ======================
  // The lower floor has two vents. The first blows whoever steps on it up to the upper floor (the foliage with the
  // Bramble Seed, the passage north to the second Tear Stone; the slide is the way back down). The second, under the
  // ledge Flower sits on, is dead until the first is stopped with the pillar: then the air comes up through it instead,
  // throws the Djinni off his ledge onto the floor, and carries the party up to where he was.
  const CE = grid(26, 18, '#');
  fill(CE, 2, 12, 23, 15, 'c'); CE[16][3] = 'c'; CE[17][3] = 'D';   // the lower floor, in from the swamp
  CE[13][8] = 'v'; CE[13][20] = 'v';   // the vents in the floor
  fill(CE, 2, 3, 15, 8, 'c'); fill(CE, 2, 9, 15, 11, 'p'); CE[9][6] = 'S';   // the upper floor, the slide off it, the drop between
  fill(CE, 18, 4, 23, 9, 'c'); fill(CE, 18, 10, 23, 11, 'p'); CE[10][22] = 'S';   // Flower's ledge over the second vent, its own slide down
  fill(CE, 2, 1, 4, 2, 'c'); CE[0][3] = 'D';   // the passage north to the second Tear Stone
  defineMap('taopo_cave_e', {
    name: 'Taopo Swamp - East Cave', w: 26, h: 18, base: 'void', music: 'taopo', bg: 'cave', indoor: true, entry: { x: 3, y: 13 }, enc: [['Cave Troll'], ['Ghost Mage II'], ['Faery', 'Faery']], retreat: WORLD,
    fall: (x, y) => ({ map: 'taopo_cave_e', x, y: 13 }),
    build(M) {
      M.paint(0, 0, strs(CE), LEG, { cliff: '#', set: 'lilacrock', faces: 2 });
      M.setObj(3, 17, 'lc_door'); M.exit(3, 17, 1, 1, 'taopo', 42, 18, DIR.DOWN, { door: true });
      M.setObj(3, 0, 'lc_door'); M.exit(3, 0, 1, 1, 'taopo_cave_n', 5, 8, DIR.UP, { door: true });
      M.object('updraft', 8, 13, { id: 'tao_v1', tile: 'vent', to: { x: 8, y: 7 } });
      M.object('updraft', 20, 13, { id: 'tao_v2', tile: 'vent', to: { x: 20, y: 6 }, active: () => !!G.flag('tao_vent_redirect') });
      // the pillar: pushed over the first vent it stops it, and the air finds the second
      M.object('pillar', 6, 14, { id: 'tao_pv', onMove: function* (E) { const F = G.field, o = F.map.objects.find(ob => ob.id === 'tao_pv'); const capped = !!(o && !o.gone && o.x === 8 && o.y === 13); if (capped && !G.flag('tao_vent_redirect')) { G.set('tao_vent_redirect'); Engine.doShake(10); Audio.sfx('psy'); yield E.say('The vent, stopped, goes quiet - and across the cave the air roars up out of the other one, hard enough to lift a man.'); if (!G.flag('tao_flower_down')) { G.set('tao_flower_down'); const d = F.map.objects.find(ob => ob.kind === 'djinni' && ob.name === 'Flower'); if (d) { d.x = 22; d.y = 14; } yield E.say('Something small and bright is thrown off the ledge above it and lands on the floor with a squeak: a Djinni!'); } } else if (!capped && G.flag('tao_vent_redirect')) { G.flags['tao_vent_redirect'] = false; yield E.say('The first vent blows again, and the second falls quiet.'); } } });
      // the foliage with the Bramble Seed, on the upper floor
      M.object('leaves', 13, 4, { id: 'tao_leaves', onClear: function* (E) { if (G.flag('taopo:hidden:13,4')) return; G.set('taopo:hidden:13,4'); yield E.give('Bramble Seed', 1); } });
      const down = !!G.flag('tao_flower_down');
      M.djinni('Flower', down ? 22 : 21, down ? 14 : 6, { fight: true });
      // the leftmost bush on the lower floor: a Mad Plant in it, and a Lucky Medal on the Mad Plant
      if (!G.flag('tao_madplant')) M.object('leaves', 2, 15, { id: 'tao_bush', onClear: function* (E) { if (G.flag('tao_madplant')) return; const r = yield* E.ambush(['Mad Plant #2'], { canFlee: false }, { at: [[2, 15]], say: 'The bush shakes itself free of the wind - and comes at the party, all teeth!' }); if (r === 'win') G.set('tao_madplant'); } });
      M.sign(4, 12, 'Vents in the floor: the air comes up through them hard enough to throw a man. Something heavy over a vent stops it - and the air must go somewhere.');
      M.sign(19, 4, 'The ledge where the Djinni sat. The slide at its end goes back down to the floor.');
    }
  });
  // the passage north: the second Tear Stone
  const CN = grid(12, 10, '#');
  fill(CN, 3, 2, 8, 7, 'c'); CN[8][5] = 'c'; CN[9][5] = 'D';
  defineMap('taopo_cave_n', {
    name: 'Taopo Swamp - North Passage', w: 12, h: 10, base: 'void', music: 'taopo', bg: 'cave', indoor: true, entry: { x: 5, y: 8 }, enc: [['Mad Vermin', 'Mad Vermin']], retreat: WORLD,
    build(M) { M.paint(0, 0, strs(CN), LEG, { cliff: '#', set: 'lilacrock', faces: 1 }); M.setObj(5, 9, 'lc_door'); M.exit(5, 9, 1, 1, 'taopo_cave_e', 3, 1, DIR.DOWN, { door: true });
      M.object('scoop', 6, 3, { id: 'tao_dig2', item: 'Tear Stone', look: 'dig_spot' }); M.sign(4, 3, 'A dead end, and the ground is soft here too.'); }
  });
  // ====================== the caves under the hill ======================
  // the first: the steam vent that Douse and Frost cap for the way east, the lava room and the rock for a stepping stone
  const C1 = grid(24, 14, '#');
  fill(C1, 2, 10, 5, 12, 'c'); C1[13][3] = 'D';   // in from the hill
  fill(C1, 6, 11, 12, 11, 'c'); C1[11][9] = 'x';   // the passage east with the steam vent in it
  fill(C1, 13, 4, 21, 12, 'c'); fill(C1, 16, 4, 17, 12, 'l');   // the lava room: a river of it across the middle, the way on beyond
  fill(C1, 20, 2, 22, 3, 'c'); C1[1][21] = 'D';
  defineMap('taopo_cave_c1', {
    name: 'Taopo Swamp - Caves', w: 24, h: 14, base: 'void', music: 'taopo', bg: 'cave', indoor: true, entry: { x: 3, y: 12 }, enc: [['Cave Troll'], ['Death Cap II', 'Death Cap II'], ['Ghost Mage II']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C1), LEG, { cliff: '#', set: 'lilacrock', faces: 2 });
      M.setObj(3, 13, 'lc_door'); M.exit(3, 13, 1, 1, 'taopo', 29, 2, DIR.DOWN, { door: true }); M.setObj(21, 1, 'lc_door'); M.exit(21, 1, 1, 1, 'taopo_cave_c2', 3, 12, DIR.UP, { door: true });
      // the steam vent across the passage: Douse fills it, and the water boils off in a moment unless Frost takes it first
      M.object('steam', 9, 11, { id: 'tao_steam' });
      // the rock that glows by the lava: cooled, it can be pushed in, and the far bank is a hop from the stone it makes
      M.object('pillar', 14, 7, { id: 'tao_rock1', hot: true }); M.object('hop', 17, 7, { id: 'tao_lavahop' });
      M.sign(4, 11, 'Steam comes up through a hole in the floor here, too hot to cross. Water would cap it - if it stayed water long enough.');
      M.sign(14, 5, 'Lava, right across the room. A rock by the shore glows with the heat of it.');
    }
  });
  // the second: the gap hopped, the Vial behind a cooled rock, Tremor on the boulder for the way on
  const C2 = grid(22, 14, '#');
  fill(C2, 2, 2, 19, 11, 'c'); C2[12][3] = 'c'; C2[13][3] = 'D';
  fill(C2, 9, 2, 9, 11, 'p');   // the gap down the middle of the room
  C2[2][5] = '#'; C2[4][5] = '#'; fill(C2, 2, 5, 4, 5, '#');   // the Vial's corner, walled but for one doorway, and the glowing rock before it
  defineMap('taopo_cave_c2', {
    name: 'Taopo Swamp - Caves', w: 22, h: 14, base: 'void', music: 'taopo', bg: 'cave', indoor: true, entry: { x: 3, y: 12 }, enc: [['Cave Troll'], ['Undead', 'Undead']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C2), LEG, { cliff: '#', set: 'lilacrock', faces: 2 });
      M.setObj(3, 13, 'lc_door'); M.exit(3, 13, 1, 1, 'taopo_cave_c1', 21, 2, DIR.DOWN, { door: true });
      M.object('pillar', 6, 3, { id: 'tao_rock2', hot: true }); M.chest(3, 3, 'Vial', 1);   // the rock stands before the corner's one doorway; cooled and pushed aside, the way in is clear
      M.object('hop', 9, 9, { id: 'tao_hop' });
      // the boulder on the far side: Tremor brings it down through the wall behind it
      M.object('shakeable', 17, 3, { id: 'tao_shake', tile: 'boulder', onShake: function* (E) { G.set('tao_wall_open'); Engine.doShake(14); Audio.sfx('push'); const MM = G.field.map; MM.setObj(17, 1, 'lc_door'); MM.walkable(17, 1); MM.finalize(); yield E.say('The boulder rocks, tips, and goes through the wall behind it - a passage!'); } });
      if (G.flag('tao_wall_open')) { M.setObj(17, 1, 'lc_door'); M.walkable(17, 1); }
      M.exit(17, 1, 1, 1, 'taopo_cave_c3', 3, 12, DIR.UP, { door: true, cond: () => !!G.flag('tao_wall_open') });
      M.sign(11, 11, 'A gap runs up the room. At its foot the party can jump it; the corner past it holds a chest, behind a rock that glows.');
    }
  });
  // the third: the dark room, where the cooled rock's light shows the Star Dust
  const C3 = grid(20, 14, '#');
  fill(C3, 2, 2, 17, 11, 'k'); C3[12][3] = 'k'; C3[13][3] = 'D'; fill(C3, 8, 2, 11, 8, '#');
  defineMap('taopo_cave_c3', {
    name: 'Taopo Swamp - Dark Chamber', w: 20, h: 14, base: 'void', music: 'taopo', bg: 'dark', indoor: true, entry: { x: 3, y: 12 }, enc: [['Ghost Mage II'], ['Undead', 'Undead']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C3), LEG, { cliff: '#', set: 'lilacrock', faces: 2 });
      M.setObj(3, 13, 'lc_door'); M.exit(3, 13, 1, 1, 'taopo_cave_c2', 17, 2, DIR.DOWN, { door: true });
      M.object('pillar', 14, 9, { id: 'tao_rock3', hot: true, onDouse: function* (E) { if (G.flag('tao_light')) return; G.set('tao_light'); const MM = G.field.map; MM.object('scoop', 16, 4, { id: 'tao_dig3', item: 'Star Dust', look: 'dig_spot' }); yield E.say('The rock goes dark, and in the dark a faint light shows on the floor at the far end of the chamber.'); } });
      if (G.flag('tao_light')) M.object('scoop', 16, 4, { id: 'tao_dig3', item: 'Star Dust', look: 'dig_spot' });
      // the rope by the door, for Lash: up the shaft to the hill
      M.object('rope', 2, 2, { id: 'tao_rope', len: 2 }); M.exit(2, 1, 1, 1, 'taopo', 29, 2, DIR.DOWN, { stairs: true, cond: () => !!G.flags['obj:taopo_cave_c3:rope:tao_rope'] });
      M.sign(4, 3, 'The last chamber. A rock glows red at the far side; the rest is dark. A rope hangs down a shaft in the roof by the door.');
    }
  });
}
