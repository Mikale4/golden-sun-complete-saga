// ---------- Gaia Rock (Mt. Mikage) ----------
// After map references/golden-sun-the-lost-age-gaia-rock-gba-map.webp, condensed: the torii path through the wood
// to the cave mouth at the foot of the rock, then the tan faces climbed hold by hold, ledge by ledge - the pillar
// pushed off its ledge and Moved into the gap, the right wall to the Nut and the slide, the vine swung across on
// Whirlwind, the brown pillar dropped and Moved into the lower gap, the wall the carved faces push out of (touched,
// the party falls all the way), the summit's little maze (a pillar to jump, the Apple, the pillar Moved to its
// lowest place) and the altar where Reveal shows the Dancing Idol. Inside: the idol on the first altar moves the
// dragon heads aside; the right way's bushes (Cyclone) raise the green platforms the left way walks; the great
// hall's ways to the Mad Plant, the first altar, the junctions to the cobweb (Cyclone drops the altar a floor),
// the bushes and the two altars below; the centre way's two rocks, the twelve-room maze each plant (Growth) opens,
// Mimic 5 and the Rusty Mace, and the Serpent's lair: Susa, the Serpent as weak as the lights make it, the Sand
// tablet, and the Cloud Brand under the water behind the petrified serpent (Sand goes under its tail).
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 262, y: 98, dir: DIR.DOWN };
  const OUT_ENC = [['Clay Gargoyle II'], ['Fire Worm', 'Fire Worm'], ['Golem II'], ['Gnome Mage II', 'Gnome Mage II'], ['Wight II']];
  const IN_ENC = [['Mad Vermin II', 'Mad Vermin II'], ['Clay Gargoyle II'], ['Dread Hound II'], ['Fire Worm', 'Gnome Mage II'], ['Golem II'], ['Wood Walker', 'Wood Walker']];
  const LEG = {
    'L': 'gr_ledge', 'v': 'gr_drop', 'p': 'gr_pit', 'g': 'grass', 'd': 'path', 'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' },
    'c': { ground: 'gr_mid', obj: 'gr_climb', walk: true }, 'D': { ground: 'gr_mid', obj: 'gr_door', walk: true },
    '.': 'gr_floor', 'x': 'gr_pit', 'P': 'gr_platform', 's': 'sandsoft', 'S': 'gr_slide', 'w': 'water', 'i': 'ir_sand'
  };
  const ROCK = { cliff: '#', set: 'gaiarock', faces: 1 };
  // a face seen side-on (the exterior): rock everywhere, ledges cut across it; rock over a ledge is drawn as a face
  // down to it, rock under a ledge's lip carries the rim
  const faceMap = (M, rows) => {
    M.paint(0, 0, strs(rows), Object.assign({ '#': { ground: 'gr_mid' } }, LEG), { cliff: null });
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] !== '#') continue; const above = y > 0 ? rows[y - 1][x] : '#', below = y < rows.length - 1 ? rows[y + 1][x] : '#';
      if (above !== '#' && above !== 'c') M.setObj(x, y, 'gaiarock_n'); else if (below !== '#' && below !== 'c') M.setObj(x, y, 'gr_face');
    }
  };
  const fallBelow = (id, rows) => (x, y) => { for (let yy = y + 1; yy < rows.length; yy++) if ('Lg'.includes(rows[yy][x])) return { map: id, x, y: yy }; return null; };
  // ====================== the foot of the rock: the torii path, the cave mouth, the first pillar ======================
  const A = grid(30, 34, '#');
  fill(A, 0, 26, 29, 33, 'T'); fill(A, 1, 26, 28, 26, 'g'); fill(A, 13, 27, 16, 33, 'g'); fill(A, 14, 27, 15, 33, 'd');   // the wood, the strip under the cliff, the path
  fill(A, 1, 25, 28, 25, 'L'); A[24][14] = 'D'; A[24][15] = 'D';   // the foot ledge and the mouth of the cave
  fill(A, 3, 21, 3, 24, 'c'); fill(A, 2, 20, 12, 20, 'L'); A[20][9] = 'p';   // the left climb, the first ledge and the gap in it
  fill(A, 2, 17, 2, 19, 'c'); fill(A, 2, 16, 7, 16, 'L'); A[16][7] = 'v';   // the climb to the pillar's ledge; its worn edge drops onto the ledge below
  fill(A, 12, 15, 12, 19, 'c'); fill(A, 10, 14, 27, 14, 'L'); fill(A, 26, 0, 26, 13, 'c');   // past the gap, the climb to the long ledge and the long climb to the next face
  for (const [x, y] of [[5, 26], [22, 26], [9, 33], [20, 33]]) A[y][x] = 'b';
  defineMap('gaia_rock', {
    name: 'Gaia Rock', w: 30, h: 34, base: 'void', music: 'gaiarock', bg: 'gaia_rock_outside', entry: { x: 14, y: 32 }, enc: OUT_ENC, retreat: WORLD,
    fall: fallBelow('gaia_rock', A),
    build(M) {
      faceMap(M, A);
      for (const y of [28, 31]) { M.setObj(13, y, 'torii_post'); M.setObj(16, y, 'torii_post'); M.setOver(14, y - 1, 'torii_beam'); M.setOver(15, y - 1, 'torii_beam'); }
      M.walkable(14, 33, 2, 1); M.exit(14, 33, 2, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN);
      M.exit(14, 24, 2, 1, 'gaia_rock_in_1', 10, 18, DIR.UP, { door: true });
      M.exit(26, 0, 1, 1, 'gaia_rock_2', 2, 24, DIR.UP);
      // the pillar: off the worn edge onto the ledge below, then into the gap
      M.object('pillar', 5, 16, { id: 'gr_p1' });
      M.sign(8, 24, 'Mt. Mikage - the undying mountain. The serpent of Izumo sleeps on its peak. Faces watch from the rock: take care on the ledges.');
      M.trigger(13, 27, 4, 2, T3.gaiaEnter, { once: 'gaia_entered' });
      M.npc('SusaOut', 18, 25, { look: NPC_LOOKS.Susa, name: 'Susa', dir: DIR.DOWN, showIf: 'serpent_done', hideIf: 'izumo_after', script: T3.susaOutside });
    }
  });
  T3.gaiaEnter = function* (E) {
    yield E.say("Gaia Rock. Mt. Mikage, the people of Izumo call it - and the serpent they fear is somewhere inside.", 'Kraden');
    yield E.say('The rock is Venus. Whatever it keeps for me, it is at the top.', 'Felix');
    yield E.say("Susa came this way alone... Let's find him before the serpent does.", 'Jenna');
  };
  // ====================== the second face: the right wall, the slide, the vine and the brown pillar ======================
  const B = grid(36, 26, '#');
  fill(B, 1, 24, 34, 24, 'L'); B[25][2] = 'L';   // the foot, the way down to the first face
  fill(B, 33, 19, 33, 23, 'c'); fill(B, 24, 18, 34, 18, 'L'); fill(B, 33, 13, 33, 17, 'c'); fill(B, 23, 12, 34, 12, 'L'); B[12][23] = 'v';   // the right wall: two ledges, as high as it goes; the slide off the top one's end
  fill(B, 26, 13, 26, 15, 'c'); fill(B, 24, 16, 28, 16, 'L');   // down the centre to the Nut's pocket
  fill(B, 1, 19, 1, 23, 'c'); fill(B, 1, 18, 6, 18, 'L'); fill(B, 1, 13, 1, 17, 'c'); fill(B, 1, 12, 6, 12, 'L'); fill(B, 1, 7, 1, 11, 'c'); fill(B, 1, 6, 12, 6, 'L');   // the leftmost route, three ledges up
  fill(B, 12, 7, 12, 8, 'c'); fill(B, 9, 9, 12, 9, 'L'); B[9][13] = 'p'; B[9][14] = 'p';   // down to the vine's ledge, the gap it hangs over
  fill(B, 15, 9, 22, 9, 'L'); B[9][15] = 'v';   // the far side: the brown pillar's ledge, its worn edge over the lower ledge
  fill(B, 22, 10, 22, 14, 'c'); fill(B, 5, 15, 22, 15, 'L'); B[15][12] = 'p'; B[14][5] = 'D';   // down to the lower ledge, its gap, and the passage on through the rock
  defineMap('gaia_rock_2', {
    name: 'Gaia Rock - The Wall', w: 36, h: 26, base: 'void', music: 'gaiarock', bg: 'gaia_rock_outside', entry: { x: 2, y: 24 }, enc: OUT_ENC, retreat: WORLD,
    fall: fallBelow('gaia_rock_2', B),
    build(M) {
      faceMap(M, B);
      M.exit(2, 25, 1, 1, 'gaia_rock', 26, 1, DIR.DOWN); M.exit(5, 14, 1, 1, 'gaia_rock_3', 3, 36, DIR.UP, { door: true });
      M.chest(25, 16, 'Nut', 1);
      // the statue that blows on a vine, up on the left: a hint of what the wind does to them
      M.setObj(2, 5, 'wind_statue'); M.setOver(5, 5, 'vine_deco'); M.setOver(6, 5, 'vine_deco');
      // the vine over the gap: Whirlwind on it and the party swings across, Tarzan style
      M.object('windstone', 13, 9, { id: 'gr_vine', tile: 'vine_hang', onWind: function* (E) { Audio.sfx('jump'); yield E.say('Felix catches the swinging vine and the party swings across the gap!'); yield Engine.fadeOut(8); E.warpNow('gaia_rock_2', 21, 9, DIR.LEFT); yield Engine.fadeIn(8); } });
      // the brown pillar: off the worn edge onto the ledge below, then Moved into that ledge's gap
      M.object('pillar', 18, 9, { id: 'gr_p2', tile: 'gr_rock' });
      M.sign(4, 23, 'The right wall goes highest, but not to the top. The left wall goes to the vine.');
    }
  });
  // ====================== the third face: the faces in the wall ======================
  const C = grid(34, 38, '#');
  fill(C, 1, 36, 32, 36, 'L'); C[35][3] = 'D';   // the foot, the passage back down
  fill(C, 31, 31, 31, 35, 'c'); fill(C, 6, 30, 32, 30, 'L'); fill(C, 31, 25, 31, 29, 'c'); fill(C, 4, 24, 32, 24, 'L');   // the right-hand climbs: the safe way up the first two ledges
  fill(C, 6, 19, 6, 23, 'c'); fill(C, 3, 18, 9, 18, 'L'); fill(C, 18, 19, 18, 23, 'c'); fill(C, 15, 18, 21, 18, 'L'); fill(C, 30, 19, 30, 23, 'c'); fill(C, 27, 18, 32, 18, 'L');   // three ways up off the second ledge
  fill(C, 18, 13, 18, 17, 'c'); fill(C, 14, 12, 22, 12, 'L'); fill(C, 18, 7, 18, 11, 'c'); fill(C, 12, 6, 24, 6, 'L'); fill(C, 18, 0, 18, 5, 'c');   // the centre way, on up to the summit
  defineMap('gaia_rock_3', {
    name: 'Gaia Rock - The Faces', w: 34, h: 38, base: 'void', music: 'gaiarock', bg: 'gaia_rock_outside', entry: { x: 3, y: 36 }, enc: OUT_ENC, retreat: WORLD,
    fall: fallBelow('gaia_rock_3', C),
    build(M) {
      faceMap(M, C);
      M.exit(3, 35, 1, 1, 'gaia_rock_2', 5, 15, DIR.DOWN, { door: true }); M.exit(18, 0, 1, 1, 'gaia_rock_top', 15, 23, DIR.UP);
      for (const [x, y] of [[5, 17], [31, 17], [13, 5], [23, 5]]) M.setObj(x, y, 'wind_statue');
      // the carved faces that push out of the wall along the ledges: touched, the party is knocked off and falls all the way
      const knocked = function* (E) { Audio.sfx('push'); Engine.doShake(10); yield E.say('A stone face pushes out of the wall and knocks the party off the ledge!'); yield Engine.fadeOut(12); E.warpNow('gaia_rock_3', 16, 36, DIR.UP); yield Engine.fadeIn(12); };
      M.object('tornado', 8, 30, { id: 'gr_f1', tile: 'statue_face', x0: 8, x1: 24, speed: 9, onHit: knocked });
      M.object('tornado', 22, 24, { id: 'gr_f2', tile: 'statue_face', x0: 6, x1: 22, speed: 8, dx: -1, onHit: knocked });
      M.object('tornado', 14, 12, { id: 'gr_f3', tile: 'statue_face', x0: 14, x1: 22, speed: 10, onHit: knocked });
      M.sign(6, 35, 'The faces in the wall are not carvings. Keep to the right, and up the centre.');
    }
  });
  // ====================== the summit: the little maze, the Apple, the altar ======================
  const S = grid(30, 26, '#');
  fill(S, 15, 22, 15, 25, 'L'); fill(S, 2, 19, 27, 21, 'L');   // the way up onto the terrace
  fill(S, 15, 15, 15, 18, 'L'); fill(S, 2, 14, 27, 14, 'L'); S[15][2] = 'L'; S[16][2] = 'L'; S[17][2] = 'L';   // the gap into the corridor across, and the notch under its west end
  fill(S, 27, 6, 27, 13, 'L'); fill(S, 4, 5, 27, 5, 'L'); fill(S, 4, 6, 4, 9, 'L');   // the northern path: up the east side, along the top, down to the Apple
  fill(S, 2, 6, 2, 13, 'L'); S[5][2] = 'L';   // the way up to the altar
  fill(S, 8, 8, 12, 11, 'L'); fill(S, 16, 8, 22, 11, 'L'); fill(S, 12, 10, 16, 10, 'L');   // hollows in the rock, for the look of a maze
  defineMap('gaia_rock_top', {
    name: 'Gaia Rock - Summit', w: 30, h: 26, base: 'void', music: 'gaiarock', bg: 'gaia_rock_outside', entry: { x: 15, y: 23 }, enc: [['Wight II', 'Wight II'], ['Clay Gargoyle II']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(S), LEG, ROCK);
      M.exit(15, 25, 1, 1, 'gaia_rock_3', 18, 1, DIR.DOWN);
      // the northern path: a pillar to jump, the Apple beyond it
      M.object('hop', 4, 7, { id: 'gr_hop' }); M.setObj(4, 7, 'pillar_sunk'); M.chest(4, 9, 'Apple', 1);
      // the pillar at the corridor's west end: Moved down into its notch (the lowest position) it clears the way to the altar;
      // the sunk pillar at the altar way's mouth is jumped, and keeps the pillar out of the passage
      M.object('pillar', 2, 14, { id: 'gr_p3' }); M.object('hop', 2, 13, { id: 'gr_hop2' }); M.setObj(2, 13, 'pillar_sunk');
      // the altar, and the Dancing Idol Reveal shows on it
      M.setObj(2, 5, 'altar_stone');
      M.object('spot', 2, 5, { id: 'gr_idol', tile: 'dancing_idol', hiddenUntilReveal: true, script: function* (E) { const o = G.map.objects.find(q => q.id === 'gr_idol'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } yield E.say('An odd little figure, brown with age, dancing on the altar... It stops as Felix lifts it.'); yield E.give('Dancing Idol', 1); G.set('dancing_idol_found'); yield E.say('The Dancing Idol. Izumo\'s lost treasure - and the key to whatever waits inside the rock.', 'Kraden'); } });
      M.def.onInteract = (x, y) => (x === 2 && y === 5) ? function* (E) { yield E.say(G.flag('dancing_idol_found') ? "Altar: I can't feel anything..." : "Altar: I'm... sensing something..."); if (!G.flag('dancing_idol_found')) yield E.say('There is something on the altar that eyes alone do not see. Reveal would show it.', 'Sheba'); } : null;
      M.sign(17, 20, 'The summit of Mt. Mikage. The altar is at the far west; the northern path winds to it the long way.');
    }
  });
  // ====================== inside: the entrance hall ======================
  const inRoom = (id, w, h, rows, opts) => defineMap(id, Object.assign({ name: 'Gaia Rock', w, h, base: 'void', music: 'gaiarock', bg: 'gaia_rock_inside', indoor: true, enc: IN_ENC, retreat: WORLD }, opts, { build(M) { M.paint(0, 0, strs(rows), LEG, ROCK); if (opts.build) opts.build(M); } }));
  const H1 = grid(22, 20, '#');
  fill(H1, 2, 5, 19, 17, '.'); fill(H1, 10, 18, 11, 19, '.'); for (const x of [4, 10, 16]) H1[4][x] = '.', H1[3][x] = '.';
  inRoom('gaia_rock_in_1', 22, 20, H1, {
    name: 'Gaia Rock - Entrance', entry: { x: 10, y: 18 },
    build(M) {
      M.exit(10, 19, 2, 1, 'gaia_rock', 14, 25, DIR.DOWN, { door: true });
      M.exit(4, 3, 1, 1, 'gaia_rock_in_l', 6, 20, DIR.UP); M.exit(10, 3, 1, 1, 'gaia_rock_in_c', 8, 16, DIR.UP); M.exit(16, 3, 1, 1, 'gaia_rock_in_r', 19, 12, DIR.UP);
      // the dragon heads in the two side doorways and the stone in the centre one: the idol on the altar moves them aside
      const open = G.flag('gaia_idol_placed') ? 'open' : null;
      M.object('gate', 4, 4, { id: 'gr_dh1', tile: 'dragon_head', state: open, script: function* (E) { yield E.say("A dragon's head, carved in the stone, fills the doorway. Its red eyes are on the altar."); } });
      M.object('gate', 16, 4, { id: 'gr_dh2', tile: 'dragon_head', state: open, script: function* (E) { yield E.say("A dragon's head, carved in the stone, fills the doorway. Its red eyes are on the altar."); } });
      M.object('gate', 10, 4, { id: 'gr_dh3', tile: 'gate_stone', state: open });
      M.setObj(10, 10, 'altar_stone'); M.object('spot', 10, 10, { id: 'gr_altar0', script: T3.gaiaAltar0 });
      M.sign(6, 16, 'Three ways in, and the heads of dragons in two of them. The altar in the middle of the hall wants something.');
    }
  });
  T3.gaiaAltar0 = function* (E) {
    if (G.flag('gaia_idol_placed')) { yield E.say('The altar. The dragon heads have moved aside; the three ways are open.'); return; }
    if (!G.inventory.has('Dancing Idol')) { yield E.say('Altar: It looks like something can be placed here.'); return; }
    yield E.say('Felix set the Dancing Idol on the altar.'); Audio.sfx('psy'); yield 20;
    yield E.say('The idol begins to dance! ...and the dragon heads grind aside, each one showing a passage behind it. The stone in the centre door sinks away.');
    Engine.doShake(14); Audio.sfx('push'); G.set('gaia_idol_placed');
    for (const o of G.field.map.objects) if (['gr_dh1', 'gr_dh2', 'gr_dh3'].includes(o.id)) { o.state = 'open'; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: o.gone, state: 'open' }); }
    yield E.say('The idol stops, and Felix takes it up again. It will dance on other altars, too, I think.', 'Kraden');
  };
  // ====================== the right way: the bushes that raise the platforms ======================
  const HR = grid(22, 14, '#');
  fill(HR, 17, 3, 19, 12, '.'); fill(HR, 19, 13, 19, 13, '.'); fill(HR, 3, 3, 19, 4, '.'); fill(HR, 3, 3, 6, 12, '.'); HR[5][2] = '.';
  inRoom('gaia_rock_in_r', 22, 14, HR, {
    name: 'Gaia Rock - Right Way', entry: { x: 19, y: 12 },
    build(M) {
      M.exit(19, 13, 1, 1, 'gaia_rock_in_1', 16, 4, DIR.DOWN); M.exit(2, 5, 1, 1, 'gaia_rock_in_p', 23, 5, DIR.LEFT);
      M.setObj(3, 9, 'bush'); M.setObj(5, 9, 'bush'); M.setObj(4, 8, 'bush');
      M.object('leaves', 4, 9, { id: 'gr_bushes_r', onClear: function* (E) { if (G.flag('gaia_platforms')) return; G.set('gaia_platforms'); Engine.doShake(10); Audio.sfx('push'); yield E.say('The bushes are torn away - and beneath them a great stone slab tilts! A rumble of stone from the west: something rises out of the pit.'); } });
      M.sign(18, 6, 'The pit beyond the west door has no floor. Whatever crosses it must rise from below.');
    }
  });
  // ====================== the platform room ======================
  const HP = grid(26, 18, '#');
  fill(HP, 1, 3, 4, 14, '.'); fill(HP, 5, 2, 19, 15, 'x'); fill(HP, 20, 2, 24, 8, '.'); fill(HP, 20, 12, 24, 15, '.'); HP[8][0] = '.'; HP[5][25] = '.'; HP[14][25] = '.';
  defineMap('gaia_rock_in_p', {
    name: 'Gaia Rock - The Pit', w: 26, h: 18, base: 'void', music: 'gaiarock', bg: 'gaia_rock_inside', indoor: true, entry: { x: 23, y: 5 }, enc: IN_ENC, retreat: WORLD,
    build(M) {
      const R = HP.map(r => r.slice()); if (G.flag('gaia_platforms')) { fill(R, 5, 5, 15, 5, 'P'); fill(R, 5, 13, 19, 13, 'P'); }
      M.paint(0, 0, strs(R), LEG, ROCK);
      M.exit(25, 5, 1, 1, 'gaia_rock_in_r', 3, 5, DIR.RIGHT); M.exit(0, 8, 1, 1, 'gaia_rock_in_l', 6, 2, DIR.LEFT); M.exit(25, 14, 1, 1, 'gaia_rock_in_hub', 2, 13, DIR.RIGHT);
      M.sign(22, 3, G.flag('gaia_platforms') ? 'Green platforms stand out of the pit now - but none of them reach this side. The lower row runs from the west.' : 'A pit with no floor. There is no way across from here.');
    }
  });
  // ====================== the left way ======================
  const HL = grid(14, 22, '#');
  fill(HL, 5, 15, 7, 20, '.'); fill(HL, 5, 14, 11, 15, '.'); fill(HL, 10, 8, 11, 14, '.'); fill(HL, 3, 8, 11, 9, '.'); fill(HL, 3, 3, 4, 8, '.'); fill(HL, 3, 2, 7, 3, '.'); HL[1][6] = '.'; HL[21][6] = '.';
  inRoom('gaia_rock_in_l', 14, 22, HL, {
    name: 'Gaia Rock - Left Way', entry: { x: 6, y: 20 },
    build(M) { M.exit(6, 21, 1, 1, 'gaia_rock_in_1', 4, 4, DIR.DOWN); M.exit(6, 1, 1, 1, 'gaia_rock_in_p', 2, 8, DIR.UP); }
  });
  // ====================== the great hall ======================
  const HH = grid(30, 24, '#');
  fill(HH, 2, 12, 27, 21, '.'); fill(HH, 16, 4, 27, 9, '.'); HH[13][1] = '.'; HH[19][1] = '.'; HH[22][14] = '.'; HH[6][28] = '.'; HH[20][28] = '.';
  inRoom('gaia_rock_in_hub', 30, 24, HH, {
    name: 'Gaia Rock - Great Hall', entry: { x: 2, y: 13 },
    build(M) {
      M.exit(1, 13, 1, 1, 'gaia_rock_in_p', 23, 14, DIR.LEFT); M.exit(1, 19, 1, 1, 'gaia_rock_in_plant', 11, 5, DIR.LEFT); M.exit(14, 22, 1, 1, 'gaia_rock_in_a1', 7, 2, DIR.DOWN);
      M.exit(28, 6, 1, 1, 'gaia_rock_in_x', 1, 12, DIR.RIGHT); M.exit(28, 20, 1, 1, 'gaia_rock_in_a2', 9, 12, DIR.RIGHT);
      // the wall over to the right: climbed
      M.setObj(21, 10, 'gr_climb'); M.walkable(21, 10); M.setObj(21, 11, 'gr_climb'); M.walkable(21, 11);
      M.sign(4, 14, 'A hall with many ways. West: a room of bushes. South: the first altar, in a back room. Over the wall east: the junctions, and the cobweb.');
    }
  });
  // ====================== the bushes and the Mad Plant ======================
  const HB = grid(14, 12, '#');
  fill(HB, 2, 2, 11, 9, '.'); HB[5][12] = '.';
  inRoom('gaia_rock_in_plant', 14, 12, HB, {
    name: 'Gaia Rock - Bushes', entry: { x: 11, y: 5 },
    build(M) {
      M.exit(12, 5, 1, 1, 'gaia_rock_in_hub', 2, 19, DIR.RIGHT);
      M.setObj(5, 5, 'bush'); M.setObj(7, 5, 'bush'); M.setObj(6, 4, 'bush'); M.setObj(3, 8, 'bush'); M.setObj(9, 3, 'bush');
      M.object('leaves', 6, 5, { id: 'gr_mad', onClear: function* (E) { if (G.flag('gaia_mad_plant')) return; const r = yield* E.ambush(['Mad Plant #3'], { canFlee: false }, { at: [[6, 5]], say: 'The bushes fly apart - and something in the middle of them was not a bush!' }); if (r !== 'win') return; G.set('gaia_mad_plant'); } });
    }
  });
  // ====================== the first altar's room ======================
  const HA1 = grid(16, 16, '#');
  fill(HA1, 2, 2, 13, 13, '.'); HA1[1][7] = '.'; fill(HA1, 5, 9, 5, 13, '#'); HA1[12][5] = '.';   // the wall of the back room, with its gap
  inRoom('gaia_rock_in_a1', 16, 16, HA1, {
    name: 'Gaia Rock - First Altar', entry: { x: 7, y: 2 },
    build(M) {
      M.exit(7, 1, 1, 1, 'gaia_rock_in_hub', 14, 21, DIR.UP);
      M.setObj(3, 10, G.flag('gaia_light1') ? 'altar_lit' : 'altar_stone'); M.object('spot', 3, 10, { id: 'gr_altar1', script: T3.gaiaAltar('gaia_light1', 3, 10) });
      M.sign(9, 4, 'A back room, walled off but for a gap at the bottom. An altar stands in it.');
    }
  });
  // an altar the idol dances on: a light is opened above it, and in the lair an orb takes the sun
  T3.gaiaAltar = (flag, x, y) => function* (E) {
    if (G.flag(flag)) { yield E.say('The idol danced here. Sunlight pours down the shaft it opened; somewhere below, an orb holds the light.'); return; }
    if (!G.inventory.has('Dancing Idol')) { yield E.say('Altar: It looks like something can be placed here.'); return; }
    yield E.say('Felix set the Dancing Idol on the altar. It begins to dance...'); Audio.sfx('psy'); yield 20;
    Engine.doFlash(16, '#fff0a0'); Engine.doShake(8); G.set(flag);
    const MM = G.field.map; persistObjTile(MM, x, y, 'altar_lit'); MM.finalize();
    const n = [1, 2, 3, 4].filter(i => G.flag('gaia_light' + i)).length;
    yield E.say('A shaft opens in the rock above, and sunlight streams down! ' + (n >= 4 ? 'That is the fourth light. Nothing in the dark below can bear all four.' : n + ' of the four lights now shine into the serpent\'s lair.'));
    yield E.say('Felix takes the idol up again.');
  };
  // ====================== the junctions ======================
  const HX = grid(28, 16, '#');
  fill(HX, 1, 12, 14, 12, '.'); fill(HX, 8, 3, 8, 11, '.'); fill(HX, 8, 3, 12, 3, '.'); HX[12][0] = '.';   // the first junction: the way up is a dead end
  fill(HX, 14, 4, 14, 12, '.'); fill(HX, 14, 4, 26, 4, '.'); fill(HX, 14, 8, 24, 8, '.'); fill(HX, 14, 12, 24, 12, '.'); HX[4][27] = '.';   // the second part: three ways, the top one goes on
  inRoom('gaia_rock_in_x', 28, 16, HX, {
    name: 'Gaia Rock - Junctions', entry: { x: 1, y: 12 },
    build(M) { M.exit(0, 12, 1, 1, 'gaia_rock_in_hub', 27, 6, DIR.LEFT); M.exit(27, 4, 1, 1, 'gaia_rock_in_web', 7, 12, DIR.RIGHT); M.sign(24, 9, 'The middle and lower ways end in the rock. The topmost goes on.'); }
  });
  // ====================== the cobweb and the altar it holds up ======================
  const HW = grid(16, 14, '#');
  fill(HW, 2, 5, 13, 12, '.'); fill(HW, 6, 2, 8, 4, '.'); HW[13][7] = '.'; HW[3][7] = 'S';
  defineMap('gaia_rock_in_web', {
    name: 'Gaia Rock - The Cobweb', w: 16, h: 14, base: 'void', music: 'gaiarock', bg: 'gaia_rock_inside', indoor: true, entry: { x: 7, y: 12 }, enc: IN_ENC, retreat: WORLD,
    fall: { map: 'gaia_rock_in_a2', x: 7, y: 2 },
    build(M) {
      M.paint(0, 0, strs(HW), LEG, ROCK);
      M.exit(7, 13, 1, 1, 'gaia_rock_in_x', 26, 4, DIR.DOWN);
      if (!G.flag('gaia_altar_fell')) M.object('spot', 7, 3, { id: 'gr_altar2', tile: 'altar_stone', script: function* (E) { yield E.say('An altar, in a nook behind a great cobweb. The floor under it does not look sound.'); } });
      M.object('vines', 7, 5, { id: 'gr_web', tile: 'cobweb', onClear: function* (E) { if (G.flag('gaia_altar_fell')) return; G.set('gaia_altar_fell'); Engine.doShake(16); Audio.sfx('push'); const o = G.field.map.objects.find(q => q.id === 'gr_altar2'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } yield E.say('The web tears away - and the altar behind it lurches, and drops through the floor! A slide runs down into the dark where it stood.'); } });
      M.sign(4, 7, 'A cobweb thick as a curtain, and an altar behind it. Wind would take the web.');
    }
  });
  // ====================== the room below: the fallen altar, the bushes' light, the last altar ======================
  const HA2 = grid(18, 14, '#');
  fill(HA2, 2, 2, 15, 11, '.'); HA2[12][9] = '.'; HA2[13][9] = '.';
  inRoom('gaia_rock_in_a2', 18, 14, HA2, {
    name: 'Gaia Rock - Below the Web', entry: { x: 9, y: 12 },
    build(M) {
      M.exit(9, 13, 1, 1, 'gaia_rock_in_hub', 27, 20, DIR.DOWN);
      if (G.flag('gaia_altar_fell')) { M.setObj(7, 4, G.flag('gaia_light3') ? 'altar_lit' : 'altar_stone'); M.object('spot', 7, 4, { id: 'gr_altar2f', script: T3.gaiaAltar('gaia_light3', 7, 4) }); }
      M.setObj(3, 10, G.flag('gaia_light4') ? 'altar_lit' : 'altar_stone'); M.object('spot', 3, 10, { id: 'gr_altar3', script: T3.gaiaAltar('gaia_light4', 3, 10) });
      M.setObj(11, 8, 'bush'); M.setObj(13, 8, 'bush'); M.setObj(12, 7, 'bush');
      M.object('leaves', 12, 8, { id: 'gr_bushes_2', onClear: function* (E) { if (G.flag('gaia_light2')) return; G.set('gaia_light2'); Engine.doFlash(16, '#fff0a0'); yield E.say('The bushes blow away from a hole in the floor, and light that came down a shaft above pours on through it! An orb in the lair below takes the sun.'); const n = [1, 2, 3, 4].filter(i => G.flag('gaia_light' + i)).length; yield E.say(n + ' of the four lights now shine into the serpent\'s lair.'); } });
      M.sign(14, 3, G.flag('gaia_altar_fell') ? 'The altar that fell from above stands here now, unbroken. Bushes choke a hole in the floor; another altar waits at the west wall.' : 'Bushes choke a hole in the floor here; an altar waits at the west wall. Something above is meant to come down.');
    }
  });
  // ====================== the centre way: the two rocks ======================
  const HC = grid(18, 18, '#');
  fill(HC, 7, 13, 9, 16, '.'); fill(HC, 8, 2, 8, 12, '.'); HC[10][9] = '.'; HC[5][7] = '.'; HC[1][8] = '.'; HC[17][8] = '.';
  inRoom('gaia_rock_in_c', 18, 18, HC, {
    name: 'Gaia Rock - Centre Way', entry: { x: 8, y: 16 },
    build(M) {
      M.exit(8, 17, 1, 1, 'gaia_rock_in_1', 10, 4, DIR.DOWN); M.exit(8, 1, 1, 1, 'gaia_maze_1', 5, 8, DIR.UP);
      M.object('pillar', 8, 12, { id: 'gr_rock1', tile: 'gr_rock' }); M.object('pillar', 8, 5, { id: 'gr_rock2', tile: 'gr_rock' });
      M.sign(7, 14, 'Two rocks in a passage a man wide. There are notches in its sides.');
    }
  });
  // ====================== the maze: twelve rooms, a plant in each ======================
  // each room has three doors north; the plant, grown, opens the right one (its tendrils reach for it), the others
  // bend back to the room before. The Mimic waits in the third room, the Rusty Mace in the seventh.
  const MAZE_DOORS = [0, 2, 1, 0, 2, 2, 1, 0, 1, 2, 0, 1], DOOR_X = [3, 6, 9], DOOR_NAME = ['left', 'centre', 'right'];
  for (let k = 1; k <= 12; k++) {
    const R = grid(12, 10, '#'); fill(R, 2, 2, 9, 8, '.'); R[9][5] = '.'; for (const x of DOOR_X) R[1][x] = '.';
    const right = MAZE_DOORS[k - 1], prev = k === 1 ? 'gaia_maze_1' : 'gaia_maze_' + (k - 1), next = k === 12 ? 'gaia_rock_in_lair' : 'gaia_maze_' + (k + 1);
    const flag = 'gaia_maze_' + k;
    inRoom('gaia_maze_' + k, 12, 10, R, {
      name: 'Gaia Rock - Maze ' + k, entry: { x: 5, y: 8 },
      build(M) {
        M.exit(5, 9, 1, 1, k === 1 ? 'gaia_rock_in_c' : prev, k === 1 ? 8 : 5, k === 1 ? 2 : 8, DIR.DOWN);
        for (let i = 0; i < 3; i++) {
          if (i === right) { M.exit(DOOR_X[i], 1, 1, 1, next, k === 12 ? 14 : 5, k === 12 ? 19 : 8, DIR.UP, { cond: () => G.flag(flag) }); M.object('gate', DOOR_X[i], 1, { id: 'gm_gate' + k, tile: 'vines', state: G.flag(flag) ? 'open' : null, script: function* (E) { yield E.say('Thick creepers choke this doorway. Nothing but growth moves growth.'); } }); }
          else M.exit(DOOR_X[i], 1, 1, 1, prev, 5, 8, DIR.UP);
        }
        M.object('sprout', 6, 5, { id: 'gm_sprout' + k, onGrow: function* (E) { G.set(flag); const o = G.field.map.objects.find(q => q.id === 'gm_gate' + k); if (o) { o.state = 'open'; G.set('obj:' + o.key, { x: o.x, y: o.y, state: 'open' }); } yield E.say('The plant shoots up, and its tendrils stretch toward the ' + DOOR_NAME[right] + ' door - the creepers in it wither away!'); } });
        if (k === 3) M.chest(2, 7, 'Game Ticket', 1, { mimic: 'Mimic #5 II' });
        if (k === 7) M.chest(9, 7, 'Rusty Mace B', 1);   /* the Demon Mace, at Sunshine's forge */
        if (k === 1) M.sign(2, 3, 'A plant in the middle of the floor, and three doors. The wrong ones bend back the way you came. Growth would tell the plant to choose.');
      }
    });
  }
  // ====================== the Serpent's lair ======================
  const HS = grid(28, 22, '#');
  fill(HS, 2, 3, 25, 19, '.'); fill(HS, 14, 20, 14, 21, '.'); fill(HS, 18, 5, 25, 6, 'w'); fill(HS, 18, 8, 25, 8, '#'); fill(HS, 20, 8, 22, 11, 's'); HS[8][21] = 's';   // the pool behind the serpent, the soft sand under its tail
  defineMap('gaia_rock_in_lair', {
    name: "Gaia Rock - Serpent's Lair", w: 28, h: 22, base: 'void', music: 'gaiarock', bg: 'gaia_rock_inside', indoor: true, entry: { x: 14, y: 19 }, enc: [], retreat: WORLD,
    build(M) {
      const R = HS.map(r => r.slice());
      M.paint(0, 0, strs(R), LEG, ROCK);
      M.walkable(14, 21); M.exit(14, 21, 1, 1, 'gaia_maze_12', 6, 2, DIR.DOWN);
      // the four orbs in the corners, lit as the lights above are opened, and the sun that falls on them
      for (const [i, x, y] of [[1, 4, 4], [2, 23, 4], [3, 4, 16], [4, 23, 16]]) { const lit = G.flag('gaia_light' + i); M.setObj(x, y, lit ? 'light_orb_lit' : 'light_orb'); if (lit) { M.setOver(x, y - 1, 'sunbeam'); M.setOver(x, y - 2, 'sunbeam'); } }
      if (!G.flag('serpent_done')) {
        M.boss('Serpent', 13, 8, { done: 'serpent_done', scale: 2.2 });
        M.npc('SusaS', 16, 10, { look: NPC_LOOKS.Susa, name: 'Susa', dir: DIR.LEFT, hideIf: 'serpent_done', text: "I'm done for... That dragon has finished me off...", mind: "(Who do they think they are? I'm the only one who can save Kushinada.)" });
        M.object('gate', 21, 8, { id: 'gr_lair_rock', tile: 'gr_rock', script: function* (E) { yield E.say('A boulder wedged in the gap, and the serpent coiled beside it.'); } });
        M.trigger(9, 12, 10, 1, T3.serpent, { once: 'serpent_done' });
      } else {
        // the petrified serpent across the back of the lair: its body over the soft sand, Sand goes under its tail
        M.setObj(12, 8, 'serpent_head'); for (let x = 13; x <= 21; x++) M.setObj(x, 8, 'serpent_body'); M.setObj(22, 8, 'serpent_tail');
        M.setObj(14, 12, 'sand_tablet'); M.object('spot', 14, 12, { id: 'gr_sand_tablet', script: T3.gaiaSand });
        M.object('spot', 25, 6, { id: 'gr_cloud_brand', script: function* (E) { if (G.flag('cloud_brand_found')) { yield E.say('The pool behind the serpent. Nothing else lies in it.'); return; } yield E.say('Something glints under the water at the very end of the pool, by the serpent\'s tail...'); G.set('cloud_brand_found'); yield E.give('Cloud Brand', 1); yield E.say("The Cloud Brand! The sword of the legend - the serpent slept across the river, and where its tail lay, this was hidden.", 'Kraden'); } });
        M.sign(4, 18, 'The serpent lies petrified across the back of the lair, its tail over the soft sand. There is water behind it.');
      }
    }
  });
  const LIGHT_TABLE = [[3, 2430], [3, 810], [3, 270], [3, 90], [2, 30]];   // the serpent's turns each round and the HP it mends, by the lights shining on it
  T3.serpent = function* (E) {
    const lights = [1, 2, 3, 4].filter(i => G.flag('gaia_light' + i)).length;
    Audio.play('boss');
    yield E.say('At last... The serpent has finally had its fill. This is the chance I\'d hoped for. I will defeat you before the next full moon and rescue Kushinada myself!', 'Susa');
    yield E.say('(Susa draws his sword.)'); yield E.say("All right, you so-called guardian! Let's see what you've got!", 'Susa');
    yield E.say("(He lunges at the serpent. It doesn't so much as flinch. He tries again - nothing.)"); yield E.say("That's weird... It didn't even react...", 'Susa');
    Engine.doFlash(12, '#ff8040'); Engine.doShake(10); yield E.say('(The serpent spits a fireball, and Susa is knocked to the ground!)');
    yield E.say("Feeding the serpent Dragonsbane isn't weakening it enough for me to beat it!", 'Susa');
    yield E.say(lights >= 4 ? 'Four shafts of sunlight fall on the orbs, and the beast writhes in the glare - it cannot bear the light! Now, Felix!' : lights > 0 ? lights + ' of the four lights burn in the lair. The serpent is weakened, but not enough - it heals in the dark between the beams!' : 'No light reaches the lair. The serpent is at its full, terrible strength - it mends faster than anything can wound it!', 'Kraden');
    const r = yield* E.battle(['Serpent'], { boss: true, canFlee: false, music: 'boss', weaken: { hp: 0.75, atk: 0.85 }, turns: LIGHT_TABLE[lights][0], enemyRegen: LIGHT_TABLE[lights][1] });
    if (r !== 'win') return;
    yield E.say("It looks like the dragon is in bad shape, but it doesn't seem like it's close to dying...", 'Kraden');
    yield E.say("Even though the serpent's been defeated, I can't rest! Be still, serpent, and I will grant you peace.", 'Susa');
    Engine.doFlash(14, '#ffffff'); Engine.doShake(16); yield E.say('(Susa lunges at the beast; too weak to defend itself, it is felled - and its body goes grey and still as stone.)');
    yield E.say("With this, Kushinada's life has been spared. You have my sincerest thanks.", 'Susa');
    yield E.say('Where are you going?', 'Kraden'); yield E.say('To Kushinada, of course.', 'Susa');
    G.set('serpent_done'); yield E.coins(2898);
    yield E.say('(Susa departs. As the party turns to go, a tablet rises out of the sand by the felled dragon.)');
    Audio.play('gaiarock');
    E.warpNow('gaia_rock_in_lair', 14, 14, DIR.UP);
  };
  T3.gaiaSand = function* (E) {
    if (G.flag('sand_learned')) { yield E.say('The slate. Its power has passed to Felix.'); return; }
    yield E.say('Felix searched the slate. There is an inscription.');
    yield E.say('"Wielder of Earth\'s might, lay your hands upon this stone. I shall grant thee the power to melt into the earth, the power of Sand!"');
    yield E.say("Wielder of Earth's might... That'd be you, Felix. Touch it. Go on, don't worry!", 'Kraden');
    yield E.say('(Felix nods, and touches the rock. It rises into the air - and so does Felix, as the tablet\'s energy surrounds him!)');
    Engine.doFlash(15, '#e8c040'); Audio.sfx('earth'); yield 20; const f = G.party.get('Felix'); if (f) f.learnExtra('Sand'); G.set('sand_learned');
    yield E.say('Felix learned Sand!');
    yield E.say('With Sand, Felix can sink into soft sand and slip beneath whatever stands on it. The serpent\'s tail lies over the sand at the back...', 'Kraden');
  };
  // Susa lying at the foot of the rock afterwards
  T3.susaOutside = function* (E) {
    if (G.flag('susa_out_talked')) { yield E.say("Kushinada's safe... She's safe! Nothing else matters.", 'Susa'); return; }
    G.set('susa_out_talked');
    yield E.say("I'm not dying... I'm just so tired... I'm going to lie down for a bit.", 'Susa');
    yield E.say("If you're going to Izumo, tell my sister that I'm still alive.", 'Susa');
    const yes = yield* E.ask("You're going to tell Kushinada that you defeated the serpent, aren't you?", 'Susa', ['Yes', 'No']);
    if (yes === 0) yield E.say("Ha ha ha! Of course! That's exactly what happened!", 'Susa');
    else yield E.say('Please, you were the ones to defeat it, so you should be honest and accept credit.', 'Susa');
  };
}
