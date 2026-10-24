// ---------- Lemuria ----------
// After map references/golden-sun-the-lost-age-lemuria-gba-map.webp, condensed: the harbour where the Lemurian ships
// lie (the Mist Potion in the ship's hold, under the water Parch dries), the road of ruins where the blue statue is
// Moved off the ledge and the two guards turn Piers's friends back until Piers speaks for them, and the city on its
// four terraces: the gate house, the spring (the lucky throw), Piers's uncle's house left of it (his mother's death,
// the letter and the bird), the residence east of it, the house of the senate, Lunpa's tower (the broken door, Lash
// to the window, the stairs down to Lunpa), the cemetery, the scoop patches with their butterflies (Lucky Medal, Bone,
// Star Dust, Rusty Sword), the plant Growth climbs to the bushes with the Hard Nut, and the palace: the guards and
// Conservato's council, the hall, the barracks' barrel, King Hydros's chamber - the two maps, the Grindstone - and
// the brown rock Grind sinks for Ancient Lemuria, where Cyclone on the leftmost bush wakes Rime, who hides in the
// blue statue until Tremor. On setting off, Piers's age.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 229, y: 141, dir: DIR.DOWN };
  const LEG = {
    '.': 'grass', 'm': 'marble', 'w': 'water', 'k': 'dock', 'd': 'ship_deck', 'B': 'bridge', 'f': 'flowers', 'p': 'path',
    'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'P': { ground: 'marble', obj: 'pillar_base' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'R': { ground: 'marble', obj: 'ruins_walltop' },
    'G': { ground: 'grass', obj: 'gravestone' }, 'S': { ground: 'marble', obj: 'statue' }, 's': { ground: 'marble', obj: 'stairs_up', walk: true }, 'v': { ground: 'grass', obj: 'vineladder', walk: true }
  };
  const CLIFF = { cliff: '#', set: 'cliff', faces: 1 };
  const BLUE = { wall: 'wall_blue', windows: true };
  // ====================== the harbour ======================
  const H = grid(30, 26, 'w');
  fill(H, 0, 0, 29, 5, '.'); fill(H, 0, 0, 29, 0, 'T'); fill(H, 13, 1, 16, 5, 'm'); fill(H, 12, 6, 17, 8, 'k'); fill(H, 14, 9, 15, 20, 'k');   // the quay and the pier out to the ship
  fill(H, 10, 17, 19, 23, 'd'); fill(H, 10, 17, 19, 17, 'd'); H[16][14] = 'k'; H[16][15] = 'k';   // the party's ship at the pier's end
  fill(H, 2, 8, 6, 12, 'd'); fill(H, 22, 9, 27, 13, 'd'); fill(H, 3, 18, 7, 22, 'd');   // the Lemurian ships lying idle
  for (const [x, y] of [[2, 3], [27, 3], [6, 1], [23, 1]]) H[y][x] = 'T';
  defineMap('lemuria_harbor', {
    name: 'Lemuria - Harbour', w: 30, h: 26, base: 'water', music: 'lemuria', bg: 'water', entry: { x: 14, y: 19 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(H), LEG);
      M.exit(14, 0, 2, 1, 'lemuria_road', 15, 24, DIR.UP); M.walkable(14, 0, 2, 1); M.set(14, 0, 'marble'); M.set(15, 0, 'marble'); M.setObj(14, 0, null); M.setObj(15, 0, null);
      // the ship: its hatch down to the hold, and the way back to sea
      M.setObj(14, 21, 'door'); M.walkable(14, 21); M.exit(14, 21, 1, 1, 'lemuria_ship_hold', 6, 8, DIR.UP, { door: true });
      M.setObj(15, 19, 'mast');
      M.exit(10, 23, 10, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN, { ship: true }); M.walkable(10, 23, 10, 1);
      for (const [x, y] of [[4, 10], [24, 11], [5, 20]]) M.setObj(x, y, 'mast');
      M.npc('lem_h1', 5, 3, { type: 'lemurian', text: 'The ships of Lemuria. None of them has sailed in longer than I care to remember.', mind: '(Why sail? Everything we need is here, and nothing changes.)' });
      M.trigger(10, 22, 10, 1, T3.piersAge, { cond: () => G.flag('lemuria_council') && !G.flag('piers_age') });
      M.sign(17, 3, 'The harbour of Lemuria. The road north leads up through the old quarter to the city.');
    }
  });
  Kit.interior('lemuria_ship_hold', { name: "Piers's Ship - The Hold", w: 12, h: 10, floor: 'floor_wood', wall: 'wall_wood', music: 'lemuria', back: { map: 'lemuria_harbor', x: 14, y: 22 }, doorX: 6, furn: [['barrel', 1, 2], ['crate', 10, 2], ['crate', 1, 6]],
    build(M) {
      // the sea got in: the far end is under water, and the chest with it, until Parch draws the water off
      const tiles = []; for (let y = 2; y <= 5; y++) for (let x = 4; x <= 9; x++) tiles.push([x, y]);
      if (G.flag('lem_hold_dry')) { for (const [x, y] of tiles) M.set(x, y, 'floor_wood'); }
      else { for (const [x, y] of tiles) M.set(x, y, 'water'); M.object('pool', 6, 5, { id: 'lem_hold_pool', tiles, dryTile: 'floor_wood', onParch: function* (E) { G.set('lem_hold_dry'); yield E.say('The water is drawn off the hold. There is a chest in the corner, dripping.'); } }); }
      M.chest(8, 2, 'Mist Potion', 1);
      M.sign(2, 4, 'The hold. The wave that carried the ship out of Lemuria left the sea in its far end.');
    } });
  // ====================== the road of ruins ======================
  const RD = grid(30, 26, '.');
  fill(RD, 0, 0, 29, 0, '#'); fill(RD, 0, 0, 1, 25, '#'); fill(RD, 28, 0, 29, 25, '#'); fill(RD, 13, 1, 16, 25, 'm');
  fill(RD, 2, 8, 27, 11, '#'); fill(RD, 13, 8, 16, 11, '.'); fill(RD, 2, 1, 27, 7, '.');   // the ledge across the road, with a break in it
  for (const [x, y] of [[4, 14], [9, 20], [22, 15], [25, 22], [5, 3], [24, 4]]) RD[y][x] = 'R';
  for (const [x, y] of [[7, 17], [20, 19], [10, 4], [19, 6], [3, 23], [26, 13]]) RD[y][x] = 'r';
  for (const [x, y] of [[11, 14], [18, 22], [8, 5], [21, 2]]) RD[y][x] = 'P';
  for (const [x, y] of [[3, 12], [26, 24], [3, 6]]) RD[y][x] = 'T';
  defineMap('lemuria_road', {
    name: 'Lemuria - Old Quarter', w: 30, h: 26, base: 'grass', music: 'lemuria', bg: 'ruins', entry: { x: 15, y: 24 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(RD), LEG, CLIFF);
      M.exit(14, 25, 2, 1, 'lemuria_harbor', 14, 1, DIR.DOWN); M.walkable(14, 25, 2, 1); M.set(14, 25, 'marble'); M.set(15, 25, 'marble');
      M.exit(14, 0, 2, 1, 'lemuria', 25, 55, DIR.UP); M.walkable(14, 0, 2, 1); M.set(14, 0, 'marble'); M.set(15, 0, 'marble'); M.setObj(14, 0, null); M.setObj(15, 0, null);
      // the blue statue standing in the break of the ledge: Moved aside, the ledge can be climbed; the guards see it done
      if (!G.flag('lemuria_arrived')) { M.object('statue_move', 14, 10, { id: 'lem_statue', tile: 'statue_blue', onMove: T3.lemuriaGuards }); M.object('statue_move', 15, 10, { id: 'lem_statue2', tile: 'statue_blue', fixed: true }); }
      else { M.setObj(13, 10, 'statue_blue'); M.setObj(15, 10, 'statue_blue'); M.block(13, 10); M.block(15, 10); }
      M.npc('lem_g1', 12, 6, { type: 'lemurian', name: 'Guard', dir: DIR.DOWN, text: () => G.flag('lemuria_arrived') ? 'You may go up to the city. Piers vouches for you... and we hold him to it.' : 'The road to the city is closed to outsiders. Turn back to your ship.', mind: '(Outsiders who beat Poseidon... I would sooner they left. But Piers is with them.)' });
      M.npc('lem_g2', 17, 6, { type: 'lemurian', name: 'Guard', dir: DIR.DOWN, text: () => G.flag('lemuria_arrived') ? "Don't do anything rash. If you cause any trouble, we'll hunt you down." : 'Lemuria is closed. It has been closed for longer than you have been alive.', mind: '(How old is that grey one? He speaks to us like children.)' });
      M.trigger(13, 12, 4, 1, function* (E) { if (!G.flag('lem_road_seen')) { G.set('lem_road_seen'); yield E.say('Ruins, all along the road... The old quarter. This was a great city once.', 'Kraden'); yield E.say('A blue statue stands in the only break in the ledge. It will Move.', 'Sheba'); } }, { cond: () => !G.flag('lemuria_arrived') });
      M.trigger(13, 23, 4, 2, function* (E) { yield E.say("Lost already, Felix? That's the way to the boat dock! You can't want to return already! We've only just gotten to Lemuria. We can't leave yet! There's still so much to see!", 'Kraden'); }, { cond: () => G.flag('lemuria_arrived') && !G.flag('lemuria_council') && !G.flag('lem_back_warned') , once: 'lem_back_warned' });
      M.sign(12, 14, 'The ledge across the road. A statue stands in its one break.');
    }
  });
  T3.lemuriaGuards = function* (E) {
    if (G.flag('lemuria_arrived')) return;
    G.set('lemuria_arrived'); E.set('lemuria_arrived');
    yield E.say("Why, that was Psynergy, wasn't it?", 'Guard'); yield E.say('Are they Adepts?', 'Guard'); yield E.say('Who ARE you!?', 'Guard');
    const y1 = yield* E.ask('Are you the ones who defeated Poseidon?', 'Guard', ['Yes', 'No']);
    yield E.say(y1 === 0 ? "That's quite something! Who are you, that you could defeat that leviathan?" : 'But clearly, you are here, and the beast is gone...', 'Guard');
    yield E.say('If you are strong enough to defeat Poseidon, you are too dangerous to enter Lemuria.', 'Guard'); yield E.say("The king's orders are clear! We cannot grant you entry.", 'Guard');
    yield E.say('King? Who is your king?', 'Kraden'); yield E.say('His Highness, King Hydros, of course...', 'Guard'); yield E.say('His Majesty has ruled over Lemuria for centuries.', 'Guard');
    yield E.say('King Hydros has decreed that Lemuria must be kept safe from dangerous outsiders.', 'Guard'); yield E.say('You say that we are dangerous, but do you include me as well?', 'Piers');
    yield E.say('Piers!', 'Guard'); yield E.say('Did you join them in battle against Poseidon?', 'Guard'); yield E.say('(Piers nods.)');
    yield E.say('Impossible! Everyone knows you possess great courage, but you are still a mere Lemurian!', 'Guard'); yield E.say('Such comments do us all a great disservice! I battled fiercely alongside my friends!', 'Piers');
    yield E.say('Leave our landing to me.', 'Piers'); yield E.say('You have my word that we shall create no problems during our stay. Will you not permit us to enter?', 'Piers');
    yield E.say("Piers, I know you are a man of your word, but the king's orders must stand!", 'Guard'); yield E.say("You understand that we cannot simply ignore the king's orders, don't you, Piers?", 'Guard');
    yield E.say('What is King Hydros doing...', 'Piers'); yield E.say("So, you people really take your kings seriously, don't you?", 'Kraden');
    yield E.say('Insolent pup! Do not dishonor the king of Lemuria! We are peaceful, but quick to anger!', 'Guard'); yield E.say('Pup? I must be twice your age! Who are you calling "pup"?', 'Kraden');
    yield E.say('You wish to see Lemuria, and yet you know so little of us! I am far older than you. Show respect!', 'Guard'); yield E.say('Pah! Older than me?! Inconceivable!', 'Kraden');
    yield E.say('Er... Actually, Kraden, these two are perhaps older than all of you combined... Babi must have spoken of this to you. In Lemuria, time passes quite slowly.', 'Piers');
    yield E.say("Ah... Well... I suppose I recall something of that sort or another... Maybe... But to imagine for a moment that these two gentlemen are older than I am? It's a bit much! But perhaps I was rude, and I hope you accept my apology. My ignorance misled me.", 'Kraden');
    yield E.say("Well, just so long as we're clear on that.", 'Guard'); yield E.say("But if your fighting is as skilled as your wordplay, then perhaps you aren't so dangerous to us.", 'Guard');
    yield E.say('I agree. Perhaps His Majesty will provide an exception in their case.', 'Guard'); yield E.say("King Hydros might be willing to reverse his order if we confer with him, wouldn't he?", 'Guard');
    yield E.say('We shall speak with him at once! King Hydros has been seeking news from beyond the Sea of Time. He will want to see you. Wait here.', 'Guard');
    yield E.say("How long do you think we'll be waiting?", 'Kraden'); yield E.say('Good point. Time means little to most Lemurians. Mere moments to us could seem like a lifetime to outsiders.', 'Piers');
    yield E.say('You seem young to me, and yet you are probably an old man among your people... I would imagine that you have probably done enough waiting in your lifetime.', 'Guard');
    yield E.say('King Hydros instructed us to be kind to the elderly at all times. They seem trustworthy enough... Shall we let them in?', 'Guard'); yield E.say("I can see no reason not to. We won't get in trouble, will we?", 'Guard');
    yield E.say('I will be with them! Now, please, let me walk the streets of my home once more! I beseech you!', 'Piers');
    yield E.say("Then we place our trust in each of you. You may enter. But... don't do anything rash!", 'Guard'); yield E.say("If you cause any trouble, we'll hunt you down and exact swift and terrible vengeance.", 'Guard');
    const y2 = yield* E.ask('Do we have your word?', 'Guard', ['Yes', 'No']);
    yield E.say(y2 === 0 ? "Ooo! Ooo! Finally! What could be waiting for me in Lemuria? I can't wait another moment!" : "We've come a long way to see Lemuria. I won't have anything ruin it for me now!", 'Kraden');
    yield E.say("Oh, hush. I'll keep a close eye on them. You have nothing to fear.", 'Piers'); yield E.say('Very well, Piers. We place our faith in you, then. Enter freely and peaceably.', 'Guard');
    yield E.say('You must already be aware of this, but you are not permitted to enter the palace.', 'Guard'); yield E.say("If the king were to find out about this, we'd be in big trouble.", 'Guard'); yield E.say("Don't worry! I won't let that happen.", 'Piers');
    yield E.say('Is this Hydros really so fearsome?', 'Kraden');
    yield E.say("Fearsome isn't the right word... King Hydros has lived longer than anyone. He is most wise. While everyone respects him and holds him in great reverence... It would be a mistake to call it fear. I certainly do not fear him. The king... He...", 'Piers');
    yield E.say('He what?', 'Kraden'); yield E.say("You will understand once you meet the king yourself. But that does not matter now. Let's go! To Lemuria... The city you've all been longing to see...", 'Piers');
  };
  // ====================== the city ======================
  const C = grid(50, 58, '.');
  fill(C, 0, 0, 49, 1, 'w'); fill(C, 0, 0, 3, 57, 'w'); fill(C, 46, 0, 49, 57, 'w'); fill(C, 0, 56, 49, 57, 'w');   // the sea all round
  fill(C, 4, 15, 45, 15, '#'); fill(C, 4, 29, 45, 29, '#'); fill(C, 4, 43, 45, 43, '#');   // the four terraces
  fill(C, 24, 14, 25, 16, 'm'); fill(C, 24, 28, 25, 30, 'm'); fill(C, 24, 42, 25, 44, 'm');   // the stairs up the middle
  fill(C, 24, 2, 25, 55, 'm');   // the way up the middle of the city
  fill(C, 8, 50, 42, 51, 'm'); fill(C, 8, 36, 42, 37, 'm'); fill(C, 8, 22, 42, 23, 'm'); fill(C, 8, 8, 42, 9, 'm');   // the streets across each terrace
  fill(C, 20, 4, 30, 6, 'm');   // the palace forecourt
  for (const [x, y] of [[8, 4], [41, 4], [8, 13], [41, 13], [6, 20], [43, 20], [6, 27], [43, 27], [6, 34], [43, 34], [6, 41], [43, 41], [6, 48], [43, 48], [12, 54], [38, 54]]) C[y][x] = 'T';
  for (const [x, y] of [[10, 12], [16, 3], [34, 3], [38, 12], [14, 33], [30, 40], [20, 47], [36, 53]]) C[y][x] = 'f';
  for (const [x, y] of [[20, 20], [30, 20], [20, 26], [30, 26], [12, 21], [38, 21]]) C[y][x] = 'P';
  fill(C, 22, 17, 23, 21, 'w'); fill(C, 26, 17, 27, 21, 'w');   // the palace's two pools
  fill(C, 22, 33, 27, 34, 'm'); fill(C, 23, 35, 26, 35, 'w'); fill(C, 24, 32, 25, 32, 'm');   // the spring's basin before its house
  fill(C, 36, 44, 44, 55, '.'); for (const [x, y] of [[38, 47], [40, 47], [42, 47], [38, 50], [40, 50], [42, 50]]) C[y][x] = 'G';   // the cemetery
  fill(C, 40, 30, 45, 33, '#'); fill(C, 41, 31, 44, 32, '.');   // the plateau at the east end of the third terrace: the bushes with the Hard Nut
  defineMap('lemuria', {
    name: 'Lemuria', w: 50, h: 58, base: 'grass', music: 'lemuria', bg: 'lighthouse', entry: { x: 25, y: 55 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(C), LEG, CLIFF);
      M.exit(24, 56, 2, 1, 'lemuria_road', 15, 1, DIR.DOWN); M.walkable(24, 56, 2, 1); M.set(24, 56, 'marble'); M.set(25, 56, 'marble');
      // the palace on the top terrace, its guards at the door
      M.house(18, 2, 14, 5, 'roof_teal', Object.assign({}, BLUE, { to: 'lemuria_palace', tx: 12, ty: 22, doorX: 7, wallRows: 3 }));
      M.npc('lem_pg1', 24, 7, { type: 'lemurian', name: 'Guard', dir: DIR.DOWN, text: () => G.flag('lemuria_council') ? "I've never seen Lord Conservato so angry before..." : G.flag('lunpa_council') ? 'King Hydros awaits you. You are free to enter.' : 'The king is holding counsel with Lord Conservato right now. It might be a while before you can see him.', mind: () => G.flag('lemuria_council') ? "(I'm sure the senate has something to say about this. What's going on around here?)" : G.flag('lunpa_council') ? '(They are clearly using Psynergy, which makes them Adepts... But are they so important that His Highness must make time for them right away?)' : "(How much longer will Conservato be in there? They've been talking for ages now.)" });
      M.npc('lem_pg2', 26, 7, { type: 'lemurian', name: 'Guard', dir: DIR.DOWN, text: () => G.flag('lemuria_council') ? 'Lord Conservato has ordered us to prevent you from leaving the island... But I cannot see why he would do something like that.' : G.flag('lunpa_council') ? 'His Highness, the king, has instructed that we let you pass. You are welcome here.' : 'The king will be thrilled to hear his trusted Piers has returned.', mind: () => G.flag('lemuria_council') ? '(How could Lord Conservato expect someone like me to believe that King Hydros... would order Piers to destroy the world?)' : G.flag('lunpa_council') ? '(What does His Highness have in mind? Piers, his friends, and Lunpa are all here.)' : "(I had heard Piers was back, but I didn't believe it until now... You seem much more confident, Piers. Everyone has been noticing it.)" });
      { const e = M.exits.find(e => e.to === 'lemuria_palace'); if (e) e.cond = () => G.flag('lunpa_council'); }
      M.trigger(23, 8, 4, 1, T3.lemuriaPalaceTalk, { once: 'lem_palace_talk', cond: () => !G.flag('lunpa_council') });
      // the third terrace: the house of the senate and the residence east of Piers's; Lunpa's tower at the east end
      M.house(9, 17, 6, 5, 'roof_blue', Object.assign({}, BLUE, { to: 'lemuria_senate', tx: 6, ty: 8, doorX: 3 }));
      M.house(33, 17, 6, 5, 'roof_blue', Object.assign({}, BLUE, { to: 'lemuria_home2', tx: 6, ty: 8, doorX: 3 }));
      { const e = M.exits.find(e => e.to === 'lemuria_senate'); if (e) { e.cond = () => !G.flag('lemuria_council'); } M.trigger(12, 22, 1, 1, function* (E) { yield E.say("The door is locked... It sounds as if there's a raucous caucus going on inside..."); }, { cond: () => G.flag('lemuria_council') }); }
      // Lunpa's tower: the door on the ground floor is broken; the window on the balcony is reached by Lash
      M.house(39, 16, 6, 8, 'roof_teal', Object.assign({}, BLUE, { to: 'lemuria_lunpa', tx: 7, ty: 12, doorX: 3, wallRows: 6, door: false }));
      M.exits = M.exits.filter(e => !(e.to === 'lemuria_lunpa' && e.y === 23)); M.setObj(42, 23, 'door_stone');
      M.setObj(42, 20, 'window_stone'); M.object('rope', 42, 23, { id: 'lem_rope', len: 3, dx: 0, dy: -1, onLash: function* (E) { yield E.say('The rope catches on the stake by the window. It will hold.'); } });
      M.exit(42, 21, 1, 1, 'lemuria_lunpa', 7, 3, DIR.UP, { cond: () => G.flag('obj:lemuria:rope:lem_rope') });
      M.trigger(41, 24, 3, 1, T3.lunpaDoor, { cond: () => G.flag('lunpa_letter') && !G.flag('lunpa_seen') });
      // the second terrace: the spring with its keeper, Piers's uncle's house to its left
      M.house(22, 30, 6, 4, 'roof_teal', Object.assign({}, BLUE, { to: 'lemuria_spring', tx: 6, ty: 8, doorX: 2, wallRows: 2 }));
      { const e = M.exits.find(e => e.to === 'lemuria_spring'); if (e) e.cond = () => G.flag('lem_spring_open'); }
      M.npc('lem_010', 24, 34, { type: 'lemurian', name: 'Keeper', dir: DIR.DOWN, script: function* (E) { if (G.flag('lem_spring_open')) { yield E.say("You look like you're in for a spell of good luck. After all, your aura glows brightly about you!"); return; } const y = yield* E.ask('Do you wish to test your luck at the Spring of Lemuria?', 'Keeper', ['Yes', 'No']); if (y === 0) { G.set('lem_spring_open'); yield E.say('Go ahead. Test your luck!'); const n = G.field.npcs.find(a => a.id === 'lem_010'); if (n) { n.tx = 22; n.ty = 34; n.px = 22 * TILE; n.py = 34 * TILE; } } else yield E.say("Well, then, I'll just take a turn... If you change your mind, let me know, and I will give you a chance."); }, mind: '(No one is luckier than him who believes in his luck and has friends who believe in him.)' });
      M.house(10, 31, 6, 5, 'roof_blue', Object.assign({}, BLUE, { to: 'lemuria_uncle', tx: 6, ty: 8, doorX: 3 }));
      // the scoop patches with their butterflies, the plant Growth climbs, the bushes on the plateau
      M.object('scoop', 30, 37, { id: 'lem_dig1', item: 'Lucky Medal', look: 'dig_spot' }); M.object('scoop', 9, 51, { id: 'lem_dig2', item: 'Bone', look: 'dig_spot' }); M.object('scoop', 14, 8, { id: 'lem_dig3', item: 'Star Dust', look: 'dig_spot' }); M.object('scoop', 40, 23, { id: 'lem_dig4', item: 'Rusty Sword B', look: 'dig_spot' })   /* the Corsair's Edge */;
      M.object('sprout', 42, 34, { id: 'lem_sprout' });
      M.object('leaves', 42, 31, { id: 'lem_bushes', onClear: function* (E) { if (G.flag('lem_hard_nut')) return; G.set('lem_hard_nut'); yield E.give('Hard Nut', 1); } }); M.setObj(41, 31, 'bush'); M.setObj(43, 31, 'bush'); M.setObj(41, 32, 'bush'); M.setObj(43, 32, 'bush');
      // the brown rock at the west end of the top terrace: Grind sinks it, and the way to Ancient Lemuria is open
      M.set(4, 8, 'grass'); M.setObj(4, 8, null); M.walkable(4, 8); M.set(4, 9, 'grass');
      M.object('rock_water', 4, 8, { id: 'lem_grind_rock', look: 'ak_stone_brown' }); M.setObj(4, 9, 'rock_small');
      M.exit(3, 8, 1, 1, 'lemuria_ancient', 27, 9, DIR.LEFT); M.set(3, 8, 'grass'); M.set(3, 9, 'grass'); M.setObj(3, 8, null); M.setObj(3, 9, null); M.walkable(3, 8, 1, 2);
      // Kraden looks about, terrace by terrace
      M.trigger(24, 28, 2, 1, function* (E) { yield E.say('Oh! Goodness!', 'Kraden'); }, { once: 'lem_kraden1', cond: () => G.flag('lemuria_arrived') });
      M.trigger(24, 14, 2, 1, function* (E) { yield E.say('Felix! Look over here! This palace is magnificent!', 'Kraden'); }, { once: 'lem_kraden2', cond: () => G.flag('lemuria_arrived') });
      // the people of Lemuria, who hardly change
      M.npc('lem_001', 14, 51, { type: 'lemurian', move: 'wander', text: 'I cannot remember the last time we had visitors in Lemuria. Not in a great while, certainly.', mind: '(More of the same, today and every day. Nothing around here ever changes.)' });
      M.npc('lem_002', 34, 51, { type: 'lemurian', text: 'In Lemuria, we do not grow old. It must seem quite odd to those from the outside world.', mind: "(I've aged so slowly, I no longer fear death, but at the same time, I have no motivation at all.)" });
      M.npc('lem_003', 28, 35, { type: 'lemurian', text: 'Drinking from this spring restores vigor and vitality! Want a sip?', mind: '(These turtles have lived in the spring forever... It must be the water that does it...)' });
      M.npc('lem_004', 16, 37, { type: 'lemurian', text: 'Lemuria has no disease, no war... Anyone who saw it would think it a paradise. And yet... all who come to our city seek to leave soon after arriving. I, too, wish to leave.', mind: "(I haven't been surprised in ages. I don't know what I'd do if something happened.)" });
      M.npc('lem_005', 36, 23, { type: 'lemurian', text: 'How old am I again? I quit counting after I turned two hundred, and that was long ago.', mind: '(King Hydros is far older even than I am... How old is he?)' });
      M.npc('lem_006', 16, 23, { type: 'lemurian', move: 'wander', text: "Life never changes here in Lemuria. It can get rather dull, you'll find.", mind: '(Sometimes, I think the buildings fall apart faster than we age.)' });
      M.npc('lem_007', 34, 9, { type: 'lemurian', text: "I ought to feel surprised to see outsiders here, but I can't remember how to be surprised.", mind: '(Long ago, a man named Lunpa drifted to our island. That was quite a surprise. Someone else came with him, but he fled so quickly. What was his name again?)' });
      M.npc('lem_008', 20, 52, { type: 'child_f', text: 'It has been many, many years since a new child was born in Lemuria. Lemurians love children, but they only remain children for such a short time.', mind: "(Everyone spoils me so much... I don't ever want to grow up! But in another 20 or 30 years, I will be an adult. Oh well. At least it's some kind of change.)" });
      M.npc('lem_009', 30, 52, { type: 'child_m', text: 'We are the only children in Lemuria. I often wish there were other children to play with.', mind: '(Are there other children in the lands beyond the Sea of Time? Are there other people?)' });
      M.npc('lem_cat', 18, 34, { animal: 'cat', animalCol: '#e8e0d0', name: 'Cat', solid: false, text: 'Meow... Mrrrfle...', mind: "(No one in Lemuria feels any passion for anything. They're lazier than a cat in a sunbeam.)" });
      M.npc('lem_dog', 10, 49, { animal: 'dog', animalCol: '#c8a070', name: 'Dog', solid: false, text: 'Woof! ...rrrrrROOF!', mind: "(There's so much treasure buried here that you could dig almost anywhere and find something... So why doesn't anybody here dig?)" });
      M.npc('lem_chicken', 38, 38, { animal: 'chicken', animalCol: '#f0f0e0', name: 'Chicken', solid: false, text: 'Bukbukbuk...', mind: "(If it weren't for the people in the castle, the Lemurians would probably let themselves starve.)" });
      M.npc('lem_cow', 12, 44, { animal: 'cow', animalCol: '#e0d8c8', name: 'Cow', text: 'Moo.', mind: '(Lemurians are so lazy that they make me look like a dynamo. And they live so long!)' });
      // Piers at his mother's grave
      M.npc('PiersGrave', 40, 48, { look: NPC_LOOKS.Piers, name: 'Piers', dir: DIR.UP, cond: () => G.flag('piers_mother') && !G.flag('lunpa_council'), text: '...', mind: '(Mother... Why have you left me...)' });
      M.sign(20, 54, 'Lemuria. The spring is on the second terrace, the palace of King Hydros at the top.');
      M.sign(36, 46, 'The cemetery of Lemuria. Few new stones are ever set here.');
    }
  });
  // approaching the palace the first time: Conservato has the king's ear
  T3.lemuriaPalaceTalk = function* (E) {
    yield E.say('This place is remarkable... Truly remarkable...', 'Kraden'); yield E.say("Who goes there! I've not seen you in Lemuria before!", 'Guard');
    yield E.say('Wait a moment... You must be the travelers who arrived with Piers. Is your name Felix, perchance?', 'Guard'); yield E.say('Piers? You mean Piers, the Lost One?', 'Guard');
    yield E.say('Have I earned a title in my absence? Well, worry not! Piers is lost no more! I seek counsel with King Hydros. Has His Highness been told of my return?', 'Piers');
    yield E.say('Word was sent, but I do not know if it has reached the king.', 'Guard'); yield E.say('What do you mean?', 'Piers'); yield E.say('Lord Conservato is meeting with His Highness as we speak.', 'Guard');
    yield E.say('Not Conservato...', 'Piers'); yield E.say("What's wrong, Piers? You don't look pleased to hear that name...", 'Kraden');
    yield E.say('Kraden... What do you think of what you have seen of Lemuria?', 'Piers'); yield E.say('It is a magnificent city! Or do you mean the castle? Both are magnificent!', 'Kraden');
    const y = yield* E.ask('And you, Felix? Do you agree?', 'Piers', ['Yes', 'No']);
    yield E.say(y === 0 ? 'Any newcomer to our town would doubtless feel the same at first.' : 'Ah! Yes, you marvel not at the present condition, but at the greater splendor of its past!', 'Piers');
    yield E.say('In ages past, Lemuria was a far lovelier, more grand, and more lively city. His Highness, the king, tells of days gone by, of a more brilliant Lemuria long before my birth. Over the countless years, our people have lost vigor, enthusiasm, creativity... Lemuria has fallen into slow collapse, a city that has lost its spark... Lemuria as you see it is only a shadow of the city of legend.', 'Piers');
    yield E.say('If only I had the chance to see the city in all its splendor. But how does Conservato figure in?', 'Kraden'); yield E.say('King Hydros believes that our decay is related in some way to Alchemy.', 'Piers');
    yield E.say('Alchemy!?', 'Kraden'); yield E.say('King Hydros wants to find a way to stop the ruin of Lemuria.', 'Piers'); yield E.say('If there were anything we could do to help stop it, we would.', 'Guard');
    yield E.say("But the senators are unwilling to take action! They're stubborn, and they fear any change...", 'Guard'); yield E.say('Senate? What is a senate?', 'Kraden');
    yield E.say('The senate is the group of elders who determine policy in Lemuria.', 'Piers'); yield E.say('Lord Conservato holds the highest office in the senate.', 'Guard');
    yield E.say('The senate usually opposes any new ideas or proposals introduced before it...', 'Guard'); yield E.say("Word of our arrival will never reach the king as long as Conservato has his ear.", 'Piers');
    yield E.say('And his conversations with the king are incredibly long.', 'Guard'); yield E.say('We have no choice but to wait patiently here.', 'Guard');
    yield E.say("Why don't we spend our time looking around Lemuria until then...", 'Piers');
    yield E.say("(There is a home to the left of the spring on the terrace below. Someone there may know Piers.)");
  };
  // ====================== the houses ======================
  Kit.interior('lemuria_spring', { name: 'The Spring of Lemuria', w: 14, h: 12, floor: 'marble', wall: 'wall_in_stone', music: 'lemuria', back: { map: 'lemuria', x: 24, y: 34 }, doorX: 6, furn: [['statue_gold', 6, 1], ['torch', 2, 1], ['torch', 11, 1]],
    npcs: [{ id: 'lem_011', x: 2, y: 4, type: 'lemurian', text: "If you face away from the spring, toss in a coin, and land it in the target, good fortune will come. You've traveled a long way to be here. You should give it a try.", mind: "(I'd love to test my luck, but I've used up all my coins. Maybe I'll take one out of the spring!)" },
      { id: 'lem_012', x: 11, y: 4, type: 'lemurian', text: 'I remember an outsider who came to Lemuria and then spent DAYS testing his luck at the spring!', mind: '(He had such a good time, he said he was going to build a spring like this in his hometown.)' },
      { id: 'lem_fountain', x: 6, y: 5, type: 'lemurian', name: 'Fountain Keeper', script: T3.lemuriaFountain }],
    build(M) { M.sign(4, 7, 'The Spring of Lemuria. Face away and toss in a coin to test your luck.'); M.sign(8, 7, 'The Spring of Lemuria. Toss in a Lucky Medal to improve your luck.'); } });
  Kit.home('lemuria_home2', { name: 'Lemurian Residence', back: { map: 'lemuria', x: 36, y: 22 }, npcs: [
    { id: 'lem_013', x: 3, y: 4, type: 'lemurian', text: "I have never been outside of Lemuria. I don't know what the rest of the world is like. If there weren't laws prohibiting us from leaving, I would be gone in an instant.", mind: "(Who knows what wonders lie across the Sea of Time... I'd love to know, but... I can't stand places with little culture and no advanced civilization.)" },
    { id: 'lem_014', x: 8, y: 5, type: 'lemurian', text: "Now that Piers has returned, maybe he'll share his tales of the outside world with me.", mind: "(The senate passed the law that prohibits us from leaving. But Piers was carried out to sea by the tidal wave. He can't be blamed for that...)" }] });
  Kit.interior('lemuria_senate', { name: 'House of the Senate', w: 14, h: 11, floor: 'carpet_blue', wall: 'wall_in_stone', music: 'lemuria', back: { map: 'lemuria', x: 12, y: 22 }, doorX: 6, furn: [['table', 6, 3], ['chair', 5, 3], ['chair', 7, 3], ['bookshelf', 1, 1], ['bookshelf', 12, 1]],
    npcs: [{ id: 'lem_015', x: 3, y: 5, type: 'lemurian', name: 'Senator', script: function* (E) { if (G.flag('lem_015_seen')) { yield E.say('What does Hydros think will happen if he sets Alchemy loose on the world again!?', 'Senator'); return; } G.set('lem_015_seen'); const y = yield* E.ask('Are you the warriors from beyond the Sea of Time who returned with Piers?', 'Senator', ['Yes', 'No']); yield E.say(y === 0 ? 'What can you uncivilized louts hope to bring to Lemuria?' : 'Only savages and barbarians are wont to tell lies when confronted with uncomfortable situations.', 'Senator'); }, mind: '(Was that some form of Psynergy? Ho ho ho! We Lemurians are masters of Psynergy all. Your powers are not special here.)' },
      { id: 'lem_016', x: 10, y: 5, type: 'lemurian', name: 'Senator', text: 'Come what may, I cannot approve of anything setting Alchemy loose on the world.', mind: '(All of the members of the senate must remain opposed to breaking the seal. As long as we remain united, King Hydros cannot take any action to complete his plan.)' },
      { id: 'lem_017', x: 2, y: 8, type: 'lemurian', name: 'Senator', text: 'Long ago, the power of Alchemy was abused in ways that might bring about the end of the world. Because it was sealed away, the king claims, the world has begun to wither and decay.', mind: "(Ever since Alchemy was sealed, time itself has seemed frozen. In my mind's eye, I do not see anyone who will go along with the king's plan.)" },
      { id: 'lem_018', x: 6, y: 6, type: 'lemurian', name: 'Senator', text: 'Has Lemuria fallen into decay, I ask you? Nay! Only by casting aside Alchemy has the world been saved from itself!', mind: '(Certainly, Lemuria has lost some of the splendor that once filled its streets. But to think that Alchemy could restore this is madness itself!)' },
      { id: 'lem_019', x: 11, y: 8, type: 'lemurian', name: 'Senator', text: 'And now, rumors abound of a group of fools who are actually attempting to restore Alchemy. It is only because Alchemy was sealed away that the world has enjoyed this lasting peace.', mind: '(If Alchemy were loosed upon the world, people would fight again to control the Stone of Sages. Alchemy must remain sealed away, if for no other reason than to avoid this strife.)' },
      { id: 'lem_020', x: 8, y: 2, type: 'lemurian', name: 'Senator', script: function* (E) { const y = yield* E.ask('Do you seek to know more about the draughts that provide us with such longevity?', 'Senator', ['Yes', 'No']); yield E.say(y === 0 ? 'Once, Lemurians bottled special draughts to leave here and travel through Weyard... A man named Babi stole the remainder of our precious draughts and fled Lemuria.' : 'Then I shall tell you this: So long as we drink of the Lemurian Spring, we live long. We no longer leave our home, so we have no need to make our draughts of old.', 'Senator'); }, mind: '(Even though we no longer prepare the draught, the water of our spring sustains us...)' }] });
  // Piers's uncle: the news of his mother, and the letter for Lunpa
  Kit.home('lemuria_uncle', { name: "Piers's House", back: { map: 'lemuria', x: 13, y: 36 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['table', 5, 4], ['chair', 4, 4], ['bookshelf', 9, 2], ['shelf', 3, 2], ['pot', 10, 7], ['pot', 8, 7], ['pot', 2, 7]],
    npcs: [{ id: 'PiersUncle', x: 6, y: 3, type: 'lemurian', name: "Piers's Uncle", dir: DIR.DOWN, script: function* (E) { yield* T3.piersUncle(E); }, mind: () => G.flag('lunpa_letter') ? '(Lunpa has given the king tremendous aid on this matter. He will have much to tell them.)' : G.flag('piers_mother') ? '(Poor Piers... Being born in Lemuria and gifted with long life... Only to lose his father in his youth and his mother now. He faces many long years of loneliness.)' : "(I was--what is the word?--surprised when I heard Piers had returned. I hope that I get to see him soon.)" }],
    build(M) { M.trigger(5, 8, 3, 1, T3.piersUncleLeave, { cond: () => G.flag('piers_mother') && !G.flag('lunpa_letter') }); } });
  T3.piersUncle = function* (E) {
    if (G.flag('lunpa_letter')) { yield E.say("Go to Lunpa's tower. He will see you now.", "Piers's Uncle"); return; }
    if (G.flag('piers_mother')) { yield E.say("I'm so relieved that Piers has returned to me alive. He is the last of my relatives. Without him, I would be alone.", "Piers's Uncle"); return; }
    const y = yield* E.ask('Are you the travelers that came here with Piers?', "Piers's Uncle", ['Yes', 'No']);
    if (y !== 0) { yield E.say('No? Ah, interesting. I wonder when Piers will come to see me.', "Piers's Uncle"); return; }
    yield E.say('I am sorry it has taken me so long to visit, Uncle.', 'Piers'); yield E.say('Piers! You are alive!', "Piers's Uncle"); yield E.say("Yes, I've managed to survive against a great many trials.", 'Piers');
    yield E.say("What a fascinating coincidence! We've stumbled across Piers's uncle's house!", 'Kraden'); yield E.say('I must thank you all for looking after my nephew.', "Piers's Uncle");
    yield E.say('This is Felix and Kraden. They are my friends, and have aided me tremendously.', 'Piers'); yield E.say('If my sister could only hear how timid young Piers has become a mighty warrior...', "Piers's Uncle");
    yield E.say("Where is my mother? We've been so busy since we arrived that I haven't had a chance to see her.", 'Piers');
    yield E.say('Now that I think about it, this place is a mess. What happened? Mother is always so neat... ...No! She hasn\'t... fallen ill again, has she?', 'Piers');
    yield E.say('There is still illness in Lemuria?', 'Kraden'); yield E.say('My mother was born with a weak heart...', 'Piers');
    yield E.say("Piers... I'm sorry... Your return comes too late... After the tidal wave washed you to sea, your mother suddenly fell ill... The shock of losing you was too great for her poor heart. She held out hope for your safe return until the very end. Perhaps your mother gave herself up to ensure your survival... Does that not sound like your mother?", "Piers's Uncle");
    yield E.say('Where is she now?', 'Piers'); yield E.say('She rests in the cemetery now. Check the headstones... You will find her.', "Piers's Uncle");
    yield E.say('(Piers rushes out of the house.)'); G.set('piers_mother'); E.set('piers_mother');
    const p = G.party.get('Piers'); if (p && G.party.active.includes(p) && G.party.active.length > 1) { G.party.active = G.party.active.filter(m => m !== p); G.party.reserve.push(p); G.field.rebuildFollowers(); }
    const y2 = yield* E.ask('What should we do, Felix? Should we follow Piers?', 'Kraden', ['Yes', 'No']);
    yield E.say(y2 === 0 ? 'After all we\'ve been through, the least we can do is offer Piers our condolences.' : "You're right. Piers probably needs some time alone right now.", 'Kraden');
  };
  T3.piersUncleLeave = function* (E) {
    yield E.say('Wait... I ask that you leave Piers to his mourning for now... Now he is struggling with the loss of his mother. He needs time.', "Piers's Uncle"); yield E.say('(Felix nods.)');
    yield E.say('You came to Lemuria to learn more of Alchemy, did you not? I suspected as much. Piers was right to bring you here. Piers told me his secret... The mission he was given by His Highness the king. Even had the tidal wave not carried Piers off, he would have left... Such was his fate.', "Piers's Uncle");
    const y1 = yield* E.ask('You look confused... Piers told you about this, did he not?', "Piers's Uncle", ['Yes', 'No']);
    yield E.say(y1 === 0 ? 'Of course... He must trust you a great deal.' : "Curious... I can't understand why he would do that...", "Piers's Uncle");
    yield E.say('If Lord Conservato had not led the senate to oppose him, he would have left sooner. I wonder what news Piers has brought with him. Either way, I do know why he has brought you here.', "Piers's Uncle");
    const y2 = yield* E.ask("Felix... Don't tell me that he hasn't at least told you that much!", "Piers's Uncle", ['Yes', 'No']);
    yield E.say(y2 === 0 ? "You say he's told you, but you look rather confused." : 'Did Piers tell you nothing before bringing you here to Lemuria?', "Piers's Uncle");
    yield E.say('Unfortunately, I know little more than that... While Piers confronts his sorrow over the loss of his mother, you have some time... I shall write you a letter... So that you can see Lunpa... Lunpa has locked himself in his tower and rarely comes out, but if I send him this, he will see you.', "Piers's Uncle");
    yield E.say('(He hands the letter to the bird perched on the table by him. It flies off.)'); Audio.sfx('psy');
    yield E.say('All I need is a bird to carry it to him in his tower. There. You should be able to see him now.', "Piers's Uncle");
    G.set('lunpa_letter'); E.set('lunpa_letter');
    yield E.say("Lunpa's tower is at the east end of the terrace above. Its door is broken - he said so himself, the last time anyone saw him.", 'Kraden');
  };
  // Lunpa at the tower's door
  T3.lunpaDoor = function* (E) {
    G.set('lunpa_seen');
    yield E.say("Are you kids Piers's traveling companions? The door's broken, I'm afraid. But I opened up a window just above the door. Sorry about this, but you'll have to climb through there.", 'Lunpa');
    yield E.say('There is a stake by the window. Lash would tie a rope to it.', 'Sheba');
  };
  // ---- Lunpa's tower: in by the window, down the stairs, Lunpa on the lowest floor ----
  Kit.interior('lemuria_lunpa', { name: "Lunpa's Tower", w: 14, h: 14, floor: 'floor_wood', wall: 'wall_in', music: 'lemuria', back: { map: 'lemuria', x: 42, y: 22 }, doorX: 7, furn: [['bookshelf', 2, 1], ['bookshelf', 11, 1], ['table', 7, 8], ['chair', 6, 8], ['bed', 2, 9], ['bed_foot', 2, 10], ['pot', 11, 11], ['torch', 5, 1], ['torch', 9, 1]],
    npcs: [{ id: 'LunpaL', x: 7, y: 6, look: NPC_LOOKS.Lunpa, name: 'Lunpa', dir: DIR.DOWN, script: function* (E) { yield* T3.lunpaLemuria(E); }, mind: () => G.flag('lunpa_council') ? '(His Majesty has come to this decision on his own, without the counsel of his advisors. This is why I must remain by his side and support his decision.)' : '(Piers brought them. Then it is time.)' }],
    build(M) {
      // the window the rope reaches, up top; the broken door below only opens once Lunpa has put his shoulder to it
      M.setObj(7, 2, 'window_stone'); M.set(7, 3, 'floor_wood');
      { const e = M.exits.find(e => e.to === 'lemuria'); if (e) { e.cond = () => G.flag('lunpa_council'); } }
      M.exit(7, 2, 1, 1, 'lemuria', 42, 22, DIR.DOWN); M.walkable(7, 2);
      M.sign(2, 3, 'A book: "The Great Adventures of Lunpa." ...Written by Lunpa, no less. "When the great flood came, we fled our homes by boat. Waves engulfed our ships. We came to in a strange land called Lemuria."');
      M.sign(11, 3, 'A letter from Babi. On the outside, it reads, "To my dear friend Lunpa." Babi wrote, "Forgive me, Lunpa, but I must leave the island without you."');
    } });
  T3.lunpaLemuria = function* (E) {
    if (G.flag('lunpa_council')) { yield E.say('You must sail to the Western Sea. Do not worry about Lemuria. Ignite the elemental beacons. Conservato lacks the conviction to discuss these matters with the people of Lemuria.', 'Lunpa'); return; }
    yield E.say("Honestly, I'm amazed that anyone can travel so far across the world in this age. Say, Piers isn't with you! Er... why not?", 'Lunpa');
    yield E.say("His mother passed away... He's gone to visit her grave.", 'Sheba'); yield E.say('Of course... His mother... He loved her dearly. A terrible loss... It must be hard on him.', 'Lunpa');
    const y1 = yield* E.ask('Well, Piers may not be here, but we still have much to discuss. If Piers brought you, you must be working to break the seal on Alchemy, right?', 'Lunpa', ['Yes', 'No']);
    yield E.say(y1 === 0 ? 'Ah, Piers has done quite well in finding you!' : "That doesn't make sense... He wouldn't have brought you to Lemuria if you weren't helping.", 'Lunpa');
    yield E.say('What mission could the good King Hydros have assigned to Piers?', 'Kraden'); yield E.say('What? Piers has told you nothing of his mission? ...Really? So you actually have nothing at all to do with Alchemy!?', 'Lunpa');
    yield E.say('Our parents were kidnapped by the Fire Clan, far to the north. We are only firing the lighthouse beacons to gain their freedom...', 'Jenna');
    yield E.say('King Hydros told me that Venus and Mercury have been ignited once again. Was that your doing? ...I\'m afraid I know nothing of any northern "Fire Clan."', 'Lunpa');
    yield E.say("But that doesn't explain you, sir. You're clearly not related to these two. What are your goals?", 'Lunpa'); yield E.say('Kraden joined us on this quest on behalf of Lord Babi of Tolbi.', 'Sheba');
    yield E.say("...Babi? I only know of one man named Babi... But it couldn't...", 'Lunpa'); yield E.say('Master Lunpa, the Babi we speak of is the same man you knew long ago.', 'Kraden');
    yield E.say("Ah! So... he's still out there, living in the outside world?", 'Lunpa'); yield E.say('Well, that might not be the most accurate way of putting it. He was living, yes... Until recently, that is...', 'Kraden');
    yield E.say('So, Babi passed away... But only recently, you say?', 'Lunpa'); yield E.say('When he finally ran out of his mystic draughts, his spirit began to wane.', 'Kraden');
    yield E.say('Then... I no longer know anyone in the world outside.', 'Lunpa'); yield E.say("But... Aren't you Lunpa, the Righteous Thief?", 'Jenna'); yield E.say('I was called that once, long, long ago. Why do you ask?', 'Lunpa');
    yield E.say("I'll bet there's at least one person in the outside world whom you still know. There's a town called Lunpa in northern Angara. A man named Donpa lives there.", 'Jenna');
    yield E.say('I settled that village! And Donpa... He is my son...', 'Lunpa'); yield E.say('Now, your grandson, Dodonpa, rules over your village.', 'Kraden'); yield E.say('Rules? Rules is an ill-sounding word.', 'Lunpa');
    yield E.say("But it's an accurate one, Lunpa. Dodonpa is an evil thief, who has caused much trouble in Angara.", 'Jenna'); yield E.say('What has become of my son? How could he permit such a thing to happen?', 'Lunpa');
    yield E.say("Master Lunpa, don't you have any idea how old Donpa is? He is as I am. An old man... He may be older even than I.", 'Kraden'); yield E.say("If this news outrages you, why don't you go and set Dodonpa straight?", 'Sheba'); yield E.say('If only I could...', 'Lunpa');
    const y2 = yield* E.ask('Is this the only reason we\'re here? To bring news of the outside world?', 'Jenna', ['Yes', 'No']);
    yield E.say(y2 === 0 ? 'You are kind, Felix, but there are much more important matters at hand.' : 'Yes, yes... I am sorry we were sidetracked. We have much more to discuss...', 'Lunpa');
    const y3 = yield* E.ask("But before we begin, there is one thing I must say... You don't mind, do you, Felix?", 'Kraden', ['Yes', 'No']);
    yield E.say(y3 === 0 ? "I knew you'd agree." : 'Clearly, your judgment on this matter is fogged, Felix. I must speak.', 'Kraden');
    yield E.say('I have discussed this with none but Felix, but... I have my own reasons for this quest. Only that I have my own reasons for wanting to see the beacons lit again...', 'Kraden');
    yield E.say('Why are you telling us all of this now?', 'Jenna'); yield E.say('Because I feel this quest is deeply linked to Lemuria. I thought it odd that Lord Babi should order me to research Alchemy.', 'Kraden');
    yield E.say('Hey, wait a minute... Is this what you promised to tell us once we reached Lemuria?', 'Sheba');
    yield E.say("Yes, yes... May I continue? Long ago, before Alchemy's power was sealed... There were many civilizations as advanced and cultivated as Lemuria. At the moment that Alchemy was sealed away, most of those civilizations began to wane... Until eventually, they vanished. I have formed certain theories now, suggesting that this may be related to the seal on Alchemy.", 'Kraden');
    yield E.say("Let me get this straight... You felt you couldn't tell us this until we were in Lemuria?", 'Jenna'); yield E.say('And you only wanted to come to Lemuria to test your theories and see if they were true...', 'Sheba');
    yield E.say('But even if everything you said IS true, what does it all mean?', 'Jenna');
    yield E.say("If your theories are correct, the world itself will wane and vanish... Won't it, Kraden? Piers never spoke of this to you, did he? If you came to this theory on your own, you are indeed a wise scholar. We would do well to trust you.", 'Lunpa');
    yield E.say('What do you mean?', 'Kraden'); yield E.say('King Hydros and I, as well as others in Lemuria, hold the same beliefs that you do, Kraden.', 'Lunpa'); yield E.say('You do!?!', 'Kraden');
    yield E.say('Civilizations thrive by building upon the knowledge of the past. Knowledge gained in one generation should be taken even further by the next. Thus, knowledge and learning continue to grow. This is the natural course of civilization.', 'Lunpa');
    yield E.say('But where is the world today? The great civilizations of old have all withered and vanished. We are all isolated and alone. You have encountered many cultures in your travels. Are any of them capable of building the great sanctums and lighthouses you have seen? No, they are not... But this is not the only sign of the decay you have theorized...', 'Lunpa');
    yield E.say('I think it best that you hear the rest directly from His Majesty, King Hydros. Yes, Kraden! We shall go to visit the king!', 'Lunpa');
    yield E.say('Ah, but King Hydros is in counsel with Lord Conservato. We might not be allowed in.', 'Kraden');
    yield E.say('Conservato? That fool. He refuses to acknowledge what he can see with his own eyes! I will meet with the king and press our evidence upon Conservato. Come with me!', 'Lunpa');
    yield E.say('Gah! Stupid door!', 'Lunpa'); Engine.doShake(12); Audio.sfx('boom'); yield E.say('HAHHH-AHH! ...Pah! At last, you are open!', 'Lunpa'); yield E.say("To the king's chambers!", 'Lunpa');
    G.set('lunpa_council'); E.set('lunpa_council');
    yield E.say('Lunpa ought to be as old as Lord Babi was, but he has so much energy!', 'Sheba'); yield E.say("He's got a fire in him.", 'Jenna');
    yield E.say("I do wish I could have heard more about Lord Babi, though. But come, Felix! To the king's palace we go!", 'Kraden');
    const n = G.field.npcs.find(a => a.id === 'LunpaL'); if (n) n.hidden = true;
  };
  // ====================== the palace ======================
  defineMap('lemuria_palace', {
    name: "King Hydros's Palace", w: 26, h: 26, base: 'void', music: 'lemuria', bg: 'lighthouse', indoor: true, entry: { x: 12, y: 22 }, retreat: WORLD,
    build(M) {
      M.room(0, 0, 26, 26, 'carpet_blue', 'wall_in_stone'); M.open(12, 25, 2, 1); M.walkable(12, 24, 2, 2); M.exit(12, 25, 2, 1, 'lemuria', 25, 8, DIR.DOWN, { door: true });
      // the hall, the barracks off to the right, the hallway up to the king's chamber
      for (let y = 2; y <= 10; y++) { M.setObj(8, y, 'wall_in_stone'); M.setObj(17, y, 'wall_in_stone'); } M.setObj(8, 6, null); M.setObj(17, 6, null);
      for (let x = 9; x <= 16; x++) M.setObj(x, 10, 'wall_in_stone'); M.setObj(12, 10, null); M.setObj(13, 10, null);
      for (let x = 18; x <= 24; x++) M.setObj(x, 12, 'wall_in_stone'); M.setObj(21, 12, null);   // the barracks
      for (const [x, y] of [[2, 1], [23, 1], [5, 12], [20, 12]]) M.setObj(x, y, 'torch'); M.setObj(12, 1, 'statue_gold'); M.setObj(13, 1, 'statue_gold');
      for (const [x, y] of [[3, 14], [22, 14], [3, 16], [22, 16], [1, 20]]) M.setObj(x, y, 'bookshelf'); M.setObj(24, 20, 'wardrobe'); M.setObj(19, 2, 'bed'); M.setObj(19, 3, 'bed_foot');
      M.setObj(20, 8, 'barrel'); M.setObj(23, 9, 'barrel'); M.setObj(19, 10, 'crate');
      // the hallway guard, and the king's chamber beyond him
      M.npc('lem_hguard', 12, 11, { type: 'lemurian', name: 'Guard', dir: DIR.DOWN, cond: () => !G.flag('lemuria_council'), script: function* (E) { const y = yield* E.ask('You are Lord Felix, correct?', 'Guard', ['Yes', 'No']); if (y === 0) { yield E.say('(The guard steps aside.)'); const n = G.field.npcs.find(a => a.id === 'lem_hguard'); if (n) { n.tx = 11; n.px = 11 * TILE; } G.set('lem_hguard_aside'); } else yield E.say('Then you have no business here! His Majesty is involved in a most important meeting right now.', 'Guard'); }, mind: "(I think I overheard something I shouldn't have... I'll forget everything.)" });
      M.trigger(12, 9, 2, 1, T3.hydros, { once: 'lemuria_council' });
      M.npc('Hydros', 12, 4, { look: NPC_LOOKS.Hydros, name: 'King Hydros', dir: DIR.DOWN, cond: () => G.flag('lemuria_council'), text: 'Do not listen to Conservato. We cannot let the world wither and die. Go, brave Adepts! By your hands, may the remaining lighthouses burn bright once more!', mind: '(My people may not desire change, but I cannot let that stop me. I do this not for myself, but for all those yet to be born throughout Weyard.)' });
      M.npc('LunpaP', 10, 5, { look: NPC_LOOKS.Lunpa, name: 'Lunpa', dir: DIR.RIGHT, cond: () => G.flag('lemuria_council'), text: 'You must sail to the Western Sea. Do not worry about Lemuria. Ignite the elemental beacons. Conservato lacks the conviction to discuss these matters with the people of Lemuria.', mind: '(His Majesty has come to this decision on his own, without the counsel of his advisors. This is why I must remain by his side and support his decision.)' });
      const H = () => G.flag('lemuria_council');
      M.npc('lem_021', 4, 18, { type: 'lemurian', text: () => H() ? 'Both Lord Conservato and the king want peace for us, so why must they fight all the time?' : 'If you seek the counsel of His Highness, the king, follow the passage to the doors at the end.', mind: () => H() ? "(The king's leadership is too progressive... It's as though he invites opposition. Of course he doesn't get along with the senate. It's their duty to protect the laws of old!)" : '(Oh, dear! Using Psynergy in the palace of the good King Hydros!? What ill-mannered buffoons!)' });
      M.npc('lem_022', 21, 18, { type: 'lemurian', text: () => H() ? 'Maybe once you have left, the king and Conservato will come to an accord.' : 'His Highness never leaves a meeting with Conservato in a good mood. Good luck.', mind: () => H() ? '(Whenever outsiders arrive in Lemuria, it means trouble. Piers has done nothing but stir up trouble by bringing them here.)' : '(His Highness, the king, is most temperamental, which is a rare trait in Lemurians. Lord Conservato is calm and collected, like a true Lemurian.)' });
      M.npc('lem_023', 7, 22, { type: 'lemurian', text: () => H() ? 'Today, His Highness and Lord Conservato were arguing more loudly than ever before!' : 'Conservato and the king were yelling so loudly, that I could hear them from out here.', mind: () => H() ? '(What will happen to us? Will Lord Conservato be able to stop the king\'s plans?)' : "(Lord Conservato only raises his voice when he speaks with the king. Their debates frighten me. I can't stand the yelling.)" });
      M.npc('lem_024', 18, 22, { type: 'lemurian', text: () => H() ? 'If Hydros plans to unleash Alchemy upon the world again, then I am against it.' : "King Hydros is the wisest of all the Lemurian kings... But I understand why Conservato and his senate oppose the king's plans.", mind: () => H() ? '(As long as I can live in peace, I am happy. I suppose that is a sign of growing old...)' : '(His Highness is worried that Lemuria will wither away. What a ridiculous notion!)' });
      M.npc('lem_025', 3, 9, { type: 'lemurian', text: () => H() ? "If you and Lunpa were all to leave Lemuria, I think we'd have peace and quiet here again." : 'The senate holds King Hydros in poor regard because he favors Lunpa\'s wisdom over their own.', mind: () => H() ? '(I know why Lemuria ended all its dealings with the outside world... Lemurians want peace. We desire no change.)' : '(I trust the king. If His Majesty is wrong, the fault lies with Lunpa, not with him.)' });
      M.npc('lem_026', 22, 5, { type: 'lemurian', name: 'Soldier', text: () => H() ? "Lord Conservato seemed very angry. Maybe that's why he called for a senate meeting." : 'He is still in chambers with Lord Conservato. Why is he granting them entrance?', mind: () => H() ? "(The senate's reports usually tend to influence the popular opinion in Lemuria. I'll bet that is a constant annoyance to the king...)" : "(Lord Conservato holds the most power in Lemuria after the king. I don't think he'll take kindly to the advice of outworlders like these.)" });
      M.sign(3, 14, 'A book: "Alchemy and Ancient Civilization: Part I." "Through the use of Alchemy, civilization undergoes great growth and improvement."'); M.sign(22, 14, 'A book: "Alchemy and Ancient Civilization: Part II." "Those who master Alchemy shall master the world."');
      M.sign(3, 16, 'A book: "The Great Lemurian People." "The chosen master of water will be a native son of Lemuria."'); M.sign(22, 16, 'A book: "Elemental Lighthouses." It reads, "The beacons of the four elemental lighthouses brighten the fringes of Weyard."');
      M.sign(1, 20, 'A book: "The History of Lemuria." An excerpt: "Only traces of the once-brilliant land of Lemuria remain today."'); M.sign(24, 20, 'What the--!!! What\'s with all these bathrobes?!? Where are the baths?');
      M.sign(19, 4, 'A book: "The Diary of Hydros." "Piers is most definitely still alive. I pray for his safe return."');
      M.signs.forEach(s => { M.setObj(s.x, s.y, s.x === 24 && s.y === 20 ? 'wardrobe' : s.x === 19 && s.y === 4 ? 'bookshelf' : 'bookshelf'); });
    }
  });
  // the council: Hydros's two maps, Conservato's fury, the Grindstone
  T3.hydros = function* (E) {
    const p = G.party.get('Piers'); if (p && !G.party.active.includes(p)) { G.party.reserve = G.party.reserve.filter(m => m !== p); if (G.party.active.length < 4) G.party.active.push(p); else G.party.reserve.push(p); G.field.rebuildFollowers(); }
    E.spawn('HydrosS', 12, 4, { look: NPC_LOOKS.Hydros, name: 'King Hydros', dir: DIR.DOWN }); E.spawn('LunpaS', 10, 5, { look: NPC_LOOKS.Lunpa, name: 'Lunpa', dir: DIR.DOWN }); E.spawn('ConservatoS', 15, 5, { type: 'lemurian', name: 'Conservato', dir: DIR.DOWN }); E.spawn('PiersS', 13, 6, { look: NPC_LOOKS.Piers, name: 'Piers', dir: DIR.DOWN });
    yield E.say('It would seem the warriors of which you spoke have arrived.', 'Hydros'); yield E.say('So it would, Your Highness. I shall call them to us immediately.', 'Lunpa'); yield E.say('There is no need, Lunpa. Let us go to them.', 'Hydros');
    yield E.say('Hydros! Would you see me dishonored thus? They ought to present themselves to us!', 'Conservato'); yield E.say('I do not go to present myself to them, Conservato. I am merely going to where they are. I have something that I wish to show everyone.', 'Hydros');
    yield E.say('Regardless of your reasons, sire, I will not go to them!', 'Conservato'); yield E.say('Do as you will, Conservato. However, WE shall go.', 'Hydros');
    yield E.say('I heard of your arrival. It is quite remarkable that you were able to reach Lemuria. Welcome.', 'Hydros'); yield E.say('Allow me to introduce my companions. This is Sheba... Jenna... Felix... ...And Kraden.', 'Piers');
    yield E.say("Kraden is the one who told me of the outside world's civilizations, of their condition...", 'Lunpa'); yield E.say('Ah, Kraden! Lunpa describes you as a remarkable scholar. Your research impressed us.', 'Hydros'); yield E.say('Thank you, Your Highness.', 'Kraden');
    yield E.say('Your theories are correct. Our world is now on a path to destruction.', 'Hydros');
    yield E.say('And who has decided this? You, Hydros? Some civilizations have vanished, surely, but that is the way of the outside world. Look around you: Lemuria remains unchanged!', 'Conservato');
    yield E.say("Don't delude yourself. Lemuria has been in slow decline for ages now, but that can wait. My most trusted scholars have reached this conclusion after extensive research. I sent Piers to confirm this for me...", 'Hydros');
    yield E.say('So you admit it, Hydros! You violated the directive of the senate! You used the tidal wave as your chance to send Piers away, despite our commands!', 'Conservato'); yield E.say('You are incorrect. The tidal wave carried me away by chance alone.', 'Piers');
    yield E.say("Conservato, you must know that the tidal wave was caused by Poseidon's return! Only a fool would have chosen to send a man to sea if he knew that this would have happened.", 'Hydros');
    yield E.say('What was it that you intended to have Piers confirm?', 'Kraden'); Engine.doFlash(10, '#a0c0ff'); yield E.say('(Hydros snaps his fingers. The room darkens, and a map appears under a sheet of glass in the floor.)');
    yield E.say('This map shows the ancient world, when Lemuria still traded with people on the many continents.', 'Hydros'); yield E.say('It was a great age... A time when the world shined brightly.', 'Conservato');
    Engine.doFlash(10, '#a0c0ff'); yield E.say('(A new map appears.)'); yield E.say('And this... is the map Lunpa had with him when he arrived in Lemuria 150 years ago...', 'Hydros'); yield E.say('I used this map to sail around the world. It is quite accurate.', 'Lunpa');
    yield E.say('In-Incredible!', 'Kraden'); yield E.say('You understand, Kraden...', 'Hydros'); yield E.say('What do you understand?', 'Sheba');
    yield E.say('Well, unless my eyes deceive me, the continents have shrunk since the golden age...', 'Kraden'); yield E.say("That's insane!", 'Jenna'); yield E.say('It is not insane! It is true!', 'Lunpa');
    yield E.say('Perhaps this will make the point more clearly. Look at these two maps side by side.', 'Hydros'); yield E.say("There's no mistaking it. The continents on Lunpa's map are clearly smaller...", 'Kraden');
    yield E.say('Lies! Nothing but lies! What do you hope to gain from foisting these lies upon our people?', 'Conservato'); yield E.say('You know well that I hope to gain nothing more than the truth, Conservato.', 'Hydros');
    yield E.say('And who do you expect will believe such nonsense?', 'Conservato'); yield E.say('If you do not believe the evidence before your eyes, what do you believe? Do you believe the Lemurian map to be accurate to this day? Tell me, Piers... You were able to investigate this matter, were you not?', 'Hydros');
    yield E.say('Thanks to Felix and my companions, I was able to travel much of the Eastern Sea. I found, in truth, that Lunpa\'s map is the more accurate of the two. However, the world seems even smaller now than it appears on Lunpa\'s map...', 'Piers');
    yield E.say('What are you saying?', 'Conservato'); yield E.say('Time itself has stopped... Think of Weyard as a living, breathing being, possessing its own life force... The four elements are the nourishment needed to sustain this being.', 'Kraden');
    yield E.say('Kraden... This is exactly what King Hydros himself has said to me!', 'Lunpa'); yield E.say('Ever since Alchemy was sealed away, the world has been cut off from its nourishment. It has gone into a state akin to hibernation.', 'Hydros');
    yield E.say('By using less energy, Weyard prolongs its life...', 'Kraden'); yield E.say('Yet when hibernating, the being has only stopped its own clock... not the flow of time around it.', 'Hydros');
    yield E.say('When a bear sleeps through the winter, it needs only wait for spring to come... When it awakens, it can nourish its weakened body again...', 'Kraden'); yield E.say('But if spring never comes, the bear will eventually die...', 'Piers');
    yield E.say('Weyard is wasting away. Its continents shrinking, because its spring has never come.', 'Lunpa'); yield E.say('Hydros, how can you make such outrageous claims? The world is not alive...', 'Conservato');
    yield E.say('Tell me, Conservato, why do you think Poseidon has returned?', 'Hydros'); yield E.say('Do you have the answer, Hydros?', 'Conservato'); yield E.say('The elemental lighthouses... Felix and his companions have lit the beacons on both Mercury and Venus Lighthouse.', 'Hydros');
    const y1 = yield* E.ask('What!? Have you any idea what will happen if you set that evil loose upon the world again?', 'Conservato', ['Yes', 'No']);
    yield E.say(y1 === 0 ? 'You know that it could bring about the destruction of the world, and yet you did it anyway?' : 'When the four beacons are fired, Alchemy will be released, and our world, destroyed.', 'Conservato');
    yield E.say('My lord, you cannot possibly intend for these people to light the remaining beacons!?', 'Conservato');
    yield E.say('I do indeed, Conservato, and I also fear the possibility that Alchemy will destroy the world. But I cannot stand by, knowing as I do that the world will wither and die if we do not act!', 'Hydros');
    yield E.say('This is madness, Hydros! Does the threat of Alchemy mean so little to you? Would you put the world in even greater danger to satisfy your theories!? With only two of the beacons lit, I assume you intend to send Piers out again?', 'Conservato');
    yield E.say('And I will go, Lord Conservato. Felix has need of my power!', 'Piers');
    yield E.say('Then go, Piers... But if you do, say farewell... for you will never be able to return. You will be banished from Lemuria forever. You know our laws. Are you prepared for the outcome? I myself am disgusted by the whole matter. I take my leave of you, Hydros.', 'Conservato');
    yield E.say('But I warn you... I will NOT permit you to go through with this madness!', 'Conservato'); E.despawn('ConservatoS');
    yield E.say('What will you do, Your Highness?', 'Kraden'); yield E.say('I knew this outcome was inevitable. But I could not sit silent while our world drifted down the path of its destruction. I want you to light the remaining beacons before you return.', 'Hydros');
    yield E.say("That's what we intend to do, but we cannot leave the Eastern Sea... A stone blocks the way at the Gondowan Cliffs, spires of rock stand in the straits, and none of the rivers can be entered.", 'Sheba');
    yield E.say('I have already heard of this problem from Piers...', 'Hydros'); yield E.say('This is something I found by accident in some ruins back in my days as a thief.', 'Lunpa');
    yield E.give('Grindstone', 1);
    yield E.say("I'm not sure what it is, but it seems to contain some powerful Psynergy.", 'Hydros'); yield E.say('Seems to? You are not certain?', 'Piers'); yield E.say('It is a Psynergy that we Lemurians are unable to use. I understand you travel with many different kinds of Adepts, do you not, Felix?', 'Hydros');
    yield E.say('If we include Piers in our numbers, we have one Adept for each of the four elements.', 'Kraden'); yield E.say('Then at least one of you should be able to use the Psynergy that this contains.', 'Hydros');
    yield E.say('King Hydros believes the item can only be used by one who wields Psynergy of the earth.', 'Lunpa');
    yield E.say('If I am not mistaken, it is a powerful Psynergy we call Grind. If you master this Psynergy, the reefs that block your way shall pose no trouble anymore...', 'Hydros'); yield E.say('With Grind, you should be able to create a path by which you can sail into the Western Sea.', 'Lunpa');
    yield E.say('Go, brave Adepts! By your hands, may the remaining lighthouses burn bright once more!', 'Hydros');
    yield E.say('That Psynergy is quite powerful. It can only be trusted to a very few people. That His Highness has given it to you should illustrate how great his expectations are. I have no doubt that your journey will be fraught with ever-increasing danger... But we are counting on you, Felix.', 'Lunpa');
    for (const id of ['HydrosS', 'LunpaS', 'PiersS']) E.despawn(id); G.set('lemuria_council'); E.set('lemuria_council');
    yield* E.chapter('Chapter 5: The Western Sea');
  };
  // setting off from the harbour: how old is Piers?
  T3.piersAge = function* (E) {
    G.set('piers_age');
    yield E.say('Umm... Piers?', 'Sheba'); yield E.say('Yes, Sheba? What is it?', 'Piers'); yield E.say("There's something I've been meaning to ask you... Something I have to ask you...", 'Sheba'); yield E.say('Ask me, Sheba.', 'Piers');
    yield E.say('You and I look roughly the same age, but how old are you, really?', 'Sheba'); yield E.say("Is that your question, Sheba? It's not important!", 'Piers');
    yield E.say("It is to me. If you are much older than us, then I'm afraid we've not shown you the proper respect.", 'Jenna'); yield E.say("She's got a point.", 'Kraden');
    yield E.say("Don't worry about such things. Please, treat me as you have all along.", 'Piers'); yield E.say("No, that won't do. You have to tell us.", 'Kraden'); yield E.say('What!? Come now! This is silly!', 'Piers');
    yield E.say('No, Piers! Tell me!', 'Sheba'); yield E.say("You're afraid you haven't shown me the proper respect, and yet you make demands of me?", 'Piers'); yield E.say('Come on, Piers... You can tell us. How old are you really?', 'Jenna');
    yield E.say('This has nothing to do with respect! You just want to know how old I am, don\'t you!', 'Piers'); yield E.say('Hee hee!', 'Sheba'); yield E.say('Heh heh!', 'Jenna'); yield E.say('Oh ho ho ho!!!', 'Kraden');
    yield E.say("I knew it! Come on, Felix! Can't you get them off my back?", 'Piers'); yield E.say('... ...', 'Felix'); yield E.say("You're in this too, aren't you, Felix? I've had it with your conspiracies! I will not tell you!", 'Piers');
  };
  // ====================== Ancient Lemuria ======================
  const AN = grid(30, 20, 'w');
  fill(AN, 2, 3, 27, 16, '.'); fill(AN, 0, 0, 29, 1, 'w'); for (const [x, y] of [[4, 4], [24, 4], [4, 14], [24, 14]]) AN[y][x] = 'R'; for (const [x, y] of [[8, 5], [20, 5], [8, 13], [20, 13]]) AN[y][x] = 'P';
  fill(AN, 12, 7, 17, 11, 'm'); fill(AN, 28, 8, 29, 10, '.');
  defineMap('lemuria_ancient', {
    name: 'Ancient Lemuria', w: 30, h: 20, base: 'marble', music: 'lemuria', bg: 'ruins', entry: { x: 27, y: 9 }, enc: [['Mimic #5 II'], ['Sea Fighter']], retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(AN), LEG);
      M.exit(29, 8, 1, 3, 'lemuria', 4, 8, DIR.RIGHT); M.walkable(29, 8, 1, 3);
      // the leftmost bush, reached with the wind from the shore; Rime, who hides in the blue statue until the ground shakes
      M.setObj(3, 8, 'bush'); M.setObj(3, 10, 'bush');
      M.object('leaves', 3, 9, { id: 'anc_bush', onClear: function* (E) { if (G.flag('rime_hidden')) return; G.set('rime_hidden'); Audio.sfx('psy'); yield E.say('A Djinni! It springs out of the bush, looks at the party - and darts away into the blue statue in the middle of the ruins!'); } });
      if (!G.party.djinnFound.includes('Rime')) M.object('shakeable', 14, 9, { id: 'anc_statue', tile: 'statue_blue', onShake: function* (E) { if (!G.flag('rime_hidden')) { yield E.say('The statue rattles on its base. Nothing else happens.'); return; } yield E.say('The statue shakes - and the Djinni tumbles out of it!'); yield* E.djinn('Rime'); } });
      M.sign(15, 12, 'Ancient Lemuria. The oldest stones in the city, and a blue statue that has stood here since before the Sea of Time closed.');
    }
  });
}
