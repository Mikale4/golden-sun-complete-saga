// ---------- The Gabomba Statue ----------
// After map references/golden-sun-the-lost-age-kibombo-gba-map.webp (the statue's green rooms), condensed. Per the guide
// and the script: in by the ventilation shaft; the gear room with the Mimic and the Bone Armlet, Lash on the rope to
// stop the gears and reach the ladder; the cog room where the cogs are hopped, the mouse shows the way, Pound on the
// two cones turns every cog the other way and the pink cog drops the party on Steel (Lash out); the room of the
// little idol with the groove in its floor; the eyes, where Akafubu's Psynergy runs along the conduit and the broken
// blocks are raised with Pound, turned with the arrow panel and pounded home - the tongue takes the orb, Akafubu
// comes in, the orb rolled into the hole, Akafubu opens the idol's passage; the chamber below where the Gabomba
// speaks, Akafubu leaves too soon, and the black orb is Felix's to take (black_orb_got); the message to Akafubu's
// hut ends the night (gabomba_done, in kibombo.js).
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'gab_floor', 'p': 'gab_pit', 'g': 'pit', 'c': 'cog', 'C': 'cog_pink', 'k': 'conduit', 'K': 'conduit_v', 'm': 'marble',
    'L': { ground: 'gab_floor', obj: 'ladder', walk: true }, 'D': { ground: 'gab_floor', obj: 'lc_door' }, 'S': 'cb_slide', 'o': { ground: 'gab_floor', obj: 'grey_rock' }, 'G': { ground: 'gab_floor', obj: 'cog' }
  };
  const WALL = { cliff: '#', set: 'gabwall', faces: 2 };
  const G_ENC = [['Bone Fighter II'], ['Death Head II', 'Death Head II'], ['Doomsayer'], ['Salamander II'], ['Spirit', 'Spirit']];
  const RETREAT = { map: 'kibombo', x: 14, y: 12, dir: DIR.DOWN };
  const room = (id, name, rows, opts, build) => defineMap(id, Object.assign({ name: 'Gabomba Statue - ' + name, w: rows[0].length, h: rows.length, base: 'void', music: 'gabomba', bg: 'temple', indoor: true, enc: G_ENC, retreat: RETREAT }, opts, { build(M) { M.paint(0, 0, strs(rows), LEG, WALL); build(M); } }));
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.setObj(x, y, 'lc_door'); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  const ladder = (M, x, y, to, tx, ty, dir, opts) => { M.setObj(x, y, 'ladder'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ stairs: true }, opts || {})); };
  // ====================== the entry hall: in by the shaft, the pinions, the stair up ======================
  const H = grid(18, 14, '#');
  fill(H, 2, 2, 15, 11, '.'); fill(H, 6, 5, 11, 8, 'G'); fill(H, 8, 5, 9, 8, '.'); H[1][9] = 'D';
  room('gabomba', 'Entry', H, { entry: { x: 3, y: 9 } }, (M) => {
    ladder(M, 3, 10, 'kibombo_vent', 17, 3, DIR.DOWN); door(M, 9, 1, 'gabomba_gears', 12, 13, DIR.UP);
    M.setObj(8, 12, 'lc_door'); M.setObj(9, 12, 'lc_door'); M.exit(8, 12, 2, 1, 'kibombo', 14, 6, DIR.DOWN, { door: true, cond: () => !!G.flag('gabomba_done') });   // the mouth, once the tongue is out
    M.sign(4, 3, 'Gears, pinions, chains: the inside of the Great Gabomba is a machine.');
    M.trigger(3, 9, 2, 2, function* (E) { yield E.say('Inside the statue. Gears, and pinions, and a smell of oil. Someone built this, a long time ago.', 'Kraden'); yield E.say('The orb went in at the top. Then that is where we go.', 'Piers'); }, { once: 'gab_entered' });
  });
  // ====================== the gear room: the Mimic, the Bone Armlet, the rope that stops the gears ======================
  const R1 = grid(26, 16, '#');
  fill(R1, 2, 2, 23, 3, '.'); fill(R1, 3, 4, 4, 12, '.'); fill(R1, 8, 4, 9, 12, '.'); fill(R1, 13, 4, 14, 12, '.'); fill(R1, 18, 4, 19, 8, '.'); fill(R1, 2, 12, 15, 13, '.'); fill(R1, 11, 13, 13, 14, '.');   // the corridor along the top, the four ways down off it, the low wall's passage
  fill(R1, 21, 5, 23, 11, '.'); fill(R1, 18, 9, 19, 11, 'G'); R1[4][22] = 'L';   // the gears' pit on the right, the rope's post, the ladder up
  room('gabomba_gears', 'Gear Room', R1, { entry: { x: 12, y: 13 } }, (M) => {
    door(M, 12, 15, 'gabomba', 9, 2, DIR.DOWN);
    M.chest(3, 12, 'Hard Nut', 1, { mimic: 'Mimic #3 II' }); M.chest(14, 12, 'Bone Armlet', 1);
    // the gears turn across the way to the ladder until the rope is lashed to the post: a chain on the wheel, and they stop
    M.object('rope', 20, 8, { id: 'gab_rope', len: 2, dx: 1, dy: 0, onLash: function* (E) { G.set('gab_gears_stopped'); Engine.doShake(10); Audio.sfx('push'); yield E.say('The rope catches in the wheel and the gears shudder to a stop. The way to the ladder is open.'); } });
    ladder(M, 22, 4, 'gabomba_cogs', 23, 15, DIR.UP, { cond: () => !!G.flag('gab_gears_stopped') });
    M.sign(6, 3, 'The gears on the right turn without rest. A rope, made fast to the post beside them, might foul them.');
  });
  // ====================== the cog room: hops from cog to cog, the mouse, the two cones, the pink cog over Steel ======================
  const R2 = grid(26, 18, '#');
  fill(R2, 2, 2, 23, 15, 'p'); fill(R2, 20, 12, 23, 15, '.'); fill(R2, 2, 2, 6, 5, '.'); fill(R2, 19, 2, 23, 5, '.'); fill(R2, 2, 12, 6, 15, '.');   // the pit, the four corners of floor
  for (const [x, y] of [[18, 13], [16, 13], [14, 13], [12, 13], [10, 13], [8, 13], [12, 11], [12, 7], [12, 5], [10, 5], [8, 5], [14, 5], [16, 5], [18, 5]]) R2[y][x] = 'c';   // the cogs, hopped between, two apart
  R2[9][12] = 'C';   // the pink cog
  R2[16][23] = 'L'; R2[16][13] = 'L';
  room('gabomba_cogs', 'Cog Room', R2, { entry: { x: 23, y: 15 } }, (M) => {
    ladder(M, 23, 16, 'gabomba_gears', 22, 5, DIR.DOWN); ladder(M, 13, 16, 'gabomba_shrine', 8, 9, DIR.UP);
    M.setObj(13, 15, null); M.walkable(13, 15); M.set(13, 15, 'gab_floor'); M.set(13, 14, 'gab_floor'); M.set(14, 14, 'gab_floor'); M.set(12, 14, 'gab_floor');   // the bit of floor at the second ladder's foot, reached across the cogs
    M.object('pillar', 4, 3, { id: 'gab_cone1', tile: 'cone', onPound: T3.gabombaCone }); M.object('pillar', 21, 3, { id: 'gab_cone2', tile: 'cone', onPound: T3.gabombaCone });
    M.chest(3, 13, 'Elixir', 1);
    // the pink cog: once the cogs turn the other way it lets go, and the party drops into the pit below
    M.exit(12, 9, 1, 1, 'gabomba_pit', 6, 3, DIR.DOWN, { cond: () => !!G.flag('gab_cogs_reversed') });
    M.npc('gab_mouse', 5, 12, { animal: 'cat', animalCol: '#a09080', name: 'Mouse', move: 'wander', text: 'Squeak! Squeak!', mind: '(Cog to cog, cog to cog. Never the pit. The pink one turns the wrong way for me.)' });
    M.sign(22, 14, 'The cogs stand in the pit like stepping stones. The pink one in the middle turns against the rest.');
    M.trigger(20, 12, 2, 2, function* (E) { yield E.say('A little mouse pops up at the far side, hops cog to cog across the pit, and is gone up the wall.'); yield E.say('So that is how it is crossed. Cog to cog, and mind the gaps.', 'Sheba'); }, { once: 'gab_mouse_seen' });
  });
  T3.gabombaCone = function* (E) {
    const MM = G.field.map; const both = ['gab_cone1', 'gab_cone2'].every(id => { const o = MM.objects.find(ob => ob.id === id); return o && o.state === 'sunk'; });
    if (!both) { yield E.say('The cone sinks into the floor and the cogs beside it miss a beat - and turn on as before.'); return; }
    if (G.flag('gab_cogs_reversed')) return; G.set('gab_cogs_reversed'); Engine.doShake(14); Audio.sfx('push');
    yield E.say('The second cone sinks, and with a groan every cog in the room stops - and turns the other way!'); yield E.say('The pink one too. It was holding itself up against the rest; now it will not hold anything.', 'Kraden');
  };
  // ====================== the pit under the pink cog: Steel, and the rope out ======================
  const P = grid(12, 10, '#');
  fill(P, 2, 2, 9, 8, '.'); P[1][5] = 'L';
  room('gabomba_pit', 'Pit', P, { entry: { x: 6, y: 3 }, enc: [] }, (M) => {
    M.djinni('Steel', 5, 5, { fight: true });
    M.object('rope', 5, 2, { id: 'gab_rope2', len: 1 }); ladder(M, 5, 1, 'gabomba_cogs', 20, 13, DIR.UP, { cond: () => !!G.flags['obj:gabomba_pit:rope:gab_rope2'] });
    M.trigger(5, 3, 3, 2, function* (E) { yield E.say('The party lands in a heap at the bottom of the shaft - on top of something that squeaks, and bites.'); }, { once: 'gab_pit_seen', cond: () => !G.party.djinnFound.includes('Steel') });
    M.sign(8, 3, 'A rope hangs from the hole above, a little too short to reach. Lash would take it.');
  });
  // ====================== the room of the little idol: the groove, the hole, the passage Akafubu opens ======================
  const SH = grid(16, 12, '#');
  fill(SH, 2, 2, 13, 9, '.'); SH[1][8] = 'D'; SH[10][8] = 'L'; for (let y = 2; y <= 6; y++) SH[y][8] = 'K'; SH[7][8] = '.'; SH[9][2] = 'L'; SH[5][14] = 'D';
  room('gabomba_shrine', 'Idol Room', SH, { entry: { x: 8, y: 9 } }, (M) => {
    ladder(M, 8, 10, 'gabomba_cogs', 13, 15, DIR.DOWN); ladder(M, 2, 9, 'gabomba_eyes', 2, 9, DIR.UP);
    M.set(8, 7, 'gab_hole');   // the hole the orb went down: a dark mouth in the floor (no fall: the room has none)
    M.setObj(8, 1, G.flag('gab_ceremony_done') ? 'lc_door' : 'mini_gabomba'); M.walkable(8, 1);
    door(M, 14, 5, 'gabomba_heart', 1, 6, DIR.RIGHT, { cond: () => !!G.flag('gab_passage_open') });
    M.trigger(7, 4, 3, 1, T3.gabombaOrbRolled, { once: 'gab_orb_seen', cond: () => !!G.flag('gab_ceremony_done') });
    M.sign(4, 3, 'A little idol of the Great Gabomba sits at the top of the room. A groove runs from it down the floor to a hole.');
  });
  // ====================== the eyes: the conduit, the blocks, the panel, the cone ======================
  const EY = grid(16, 12, '#');
  fill(EY, 1, 1, 14, 10, '.'); for (let x = 3; x <= 13; x++) EY[5][x] = 'k'; EY[4][8] = 'K'; fill(EY, 7, 2, 9, 3, 'm'); EY[10][2] = 'L';
  room('gabomba_eyes', 'Eyes', EY, { entry: { x: 2, y: 9 }, enc: [] }, (M) => {
    ladder(M, 2, 10, 'gabomba_shrine', 2, 8, DIR.DOWN);
    M.setObj(8, 2, 'mini_gabomba'); M.setObj(3, 5, 'statue'); M.setObj(13, 5, 'statue');   // the head at the top, the two sources either end of the conduit
    // the three blocks in the conduit, each with its arrow; the panel that turns the floating ones; the cone that lifts them all
    const need = { a: 2, b: 3, c: 1 }; const start = { a: 1, b: 2, c: 3 };
    for (const [id, x] of [['a', 5], ['b', 8], ['c', 11]]) { const st = G.get('gab_tile_' + id) || { d: start[id], up: false }; const obj = { id: 'gab_tile_' + id, tid: id, d: st.d, up: st.up, need: need[id] }; obj.onPound = function* (E) { const o = G.field.map.objects.find(t => t.id === obj.id); if (o) yield* T3.gabombaSet(E, o); }; M.object('condtile', x, 5, obj); }
    M.object('pillar', 4, 8, { id: 'gab_cone3', tile: 'cone', onPound: T3.gabombaLift });
    M.set(8, 8, 'arrow_panel'); M.object('spot', 8, 8, { id: 'gab_panel', onStep: T3.gabombaTurn });
    M.trigger(1, 8, 3, 2, T3.gabombaEyesArrive, { once: 'gab_eyes_seen' });
    M.sign(12, 8, 'Three blocks sit in the conduit, each cut with an arrow. A panel on the floor, and a cone beside it.');
  });
  // the blocks: drawn by their arrow, floating ones solid; Pound sets a floating one down; the panel turns every floating one
  const tileState = (o) => G.set('gab_tile_' + o.tid, { d: o.d, up: o.up });
  T3.gabombaLift = function* (E) {
    if (G.flag('gab_ceremony_done')) return;
    for (const o of G.field.map.objects) if (o.kind === 'condtile') { o.up = true; tileState(o); }
    Engine.doShake(8); yield E.say('The cone sinks, and the three blocks rise out of the conduit and hang in the air, turning slowly.');
  };
  T3.gabombaTurn = function* (E) {
    const ts = G.field.map.objects.filter(o => o.kind === 'condtile' && o.up); if (!ts.length) { yield E.say('The panel clicks under the party\'s feet. Nothing moves: the blocks are all set in the floor.'); return; }
    for (const o of ts) { o.d = (o.d + 1) % 4; tileState(o); } Audio.sfx('push'); yield E.say('The panel clicks, and the floating blocks turn a quarter round.');
  };
  T3.gabombaSet = function* (E, o) {
    o.up = false; tileState(o); Engine.doShake(6); yield E.say('The block drops back into the conduit.');
    const all = G.field.map.objects.filter(t => t.kind === 'condtile'); if (all.every(t => !t.up && t.d === t.need) && !G.flag('gab_ceremony_done')) yield* T3.gabombaCeremonyEnd(E);
  };
  T3.gabombaEyesArrive = function* (E) {
    yield E.say('Focus your energies!', 'Akafubu'); yield E.say('Everyone! Look over here!', 'Kraden');
    yield E.say('The eyes of the Great Gabomba. From here the whole plaza can be seen below - and Akafubu, with the orb lifted in the air before the statue.');
    yield E.say('Let us now present our jewel to the Great Gabomba! O Great Gabomba! Please accept this, our humble gift!', 'Akafubu');
    yield E.say('Two lights - one red, one blue - come up out of the floor at either end of the room and run along the conduit... and die at the broken blocks in the middle.');
    yield E.say('You are still not pleased? No! This time, he seemed almost like he might... We must continue! Drums! More drums!', 'Akafubu');
    yield E.say("Ah! So that's how it works!", 'Kraden'); yield E.say("He's been failing because the conduit that channels his Psynergy is broken.", 'Sheba');
    yield E.say('Should we reconnect the conduit so he can complete the ceremony?', 'Jenna'); yield E.say("I won't help them, Felix! They're the ones who stole my orb from the Madrans!", 'Piers');
    yield E.say('Piers, think about it... Akafubu stole the orb solely to perform this ceremony... He means to give it to the Great Gabomba. If his ceremony succeeds, the orb will be taken into the statue...', 'Kraden');
    yield E.say("And we're INSIDE the statue! If the ceremony succeeds, we can go find the orb!", 'Kraden'); yield E.say("You're right, Sheba. Let's see if we can't help him finish his little ceremony.", 'Piers');
    yield E.say('These panels have arrows on them... Look at the directions they point... The panel on the floor will turn the blocks, I\'ll wager. And to set them back in place?', 'Kraden'); yield E.say('Just Pound them in!', 'Jenna');
  };
  T3.gabombaCeremonyEnd = function* (E) {
    G.set('gab_ceremony_done');
    yield E.say('The red light and the blue run the whole conduit to the head, and the eyes of the Great Gabomba flash white!'); Engine.doFlash(20, '#ffffff'); Engine.doShake(20);
    yield E.say('Look! The Great Gabomba has responded to our gift!', 'Akafubu');
    yield E.say('The statue puts out its tongue, takes the black orb into its mouth, and puts its tongue out again for Akafubu to walk up.');
    yield E.say('Did you see it, people? At last! The Great Gabomba accepts me! I shall answer his call! I shall enter the Great Gabomba! Wait for me, my people!', 'Akafubu');
    yield Engine.fadeOut(20); E.warpNow('gabomba_shrine', 8, 4, DIR.UP); yield 10; yield Engine.fadeIn(20);
  };
  T3.gabombaOrbRolled = function* (E) {
    yield E.say('The black orb... Where is it?', 'Piers'); yield E.say('I saw it roll in there...', 'Sheba'); yield E.say('It came in through there and rolled along the groove in the floor...', 'Jenna');
    yield E.say('It vanished into that hole!', 'Kraden'); yield E.say('It looks pretty deep... No, I can\'t even see it.', 'Sheba');
    yield E.say("It's no use... Now, I'll never see Lemuria again... I am lost forever from my homeland!", 'Piers');
    yield E.say('Wait, hold on... I can see light on the other side of this hole... There must be a room on the other side of this statue.', 'Kraden');
    E.spawn('AkafubuS', 8, 2, { look: NPC_LOOKS.Akafubu, name: 'Akafubu', dir: DIR.DOWN });
    yield E.say('Who... Who are you!? What are you doing here? Are you Kibombo!?', 'Akafubu'); yield E.say("We've come to reclaim the black orb you stole!", 'Piers');
    yield E.say('Do you really believe I would permit you to take it!?', 'Akafubu'); yield E.say("Hey, watch it! You wouldn't even be in here if it weren't for us! We saw your magic energy flowing past us - the circuit was broken, right there. So we completed it so that your magic energy could go where it needed to go.", 'Jenna');
    yield E.say('But... if you truly did this, then why? Why did you help me?', 'Akafubu'); yield E.say('We were sort of hoping that we could take the orb if your ceremony succeeded... It rolled through this groove and right through this hole. We saw a light through there.', 'Kraden');
    yield E.say('Akafubu takes a red jewel from his neck and sets it in the hands of the little idol. The idol slides aside, and a passage opens in the east wall.');
    yield E.say('I might be able to retrieve the orb.', 'Akafubu'); E.despawn('AkafubuS'); G.set('gab_passage_open'); const MM = G.field.map; MM.setObj(8, 1, 'lc_door'); MM.finalize();
    yield E.say('Do you think Akafubu will really return the orb to us?', 'Jenna'); yield E.say("I think Jenna is right. It sounds like he's going to return what he has stolen.", 'Piers');
    yield E.say("We have little choice but to trust that he will return it. Come on! Let's go, Felix!", 'Kraden');
  };
  // ====================== the chamber below: the Gabomba speaks ======================
  const HT = grid(18, 12, '#');
  fill(HT, 1, 2, 16, 9, 'm'); HT[6][0] = 'D'; HT[10][2] = 'L';
  room('gabomba_heart', 'Inner Chamber', HT, { entry: { x: 1, y: 6 }, enc: [] }, (M) => {
    door(M, 0, 6, 'gabomba_shrine', 13, 5, DIR.LEFT);
    M.setObj(14, 3, 'statue_gold'); M.setObj(15, 3, 'statue_gold'); M.setObj(14, 4, 'statue_gold'); M.setObj(15, 4, 'statue_gold');
    M.object('spot', 14, 5, { id: 'gab_orb', tile: G.flag('black_orb_got') ? null : 'cloak_ball', script: T3.gabombaOrb });
    if (!G.flag('gab_statue_spoke')) M.npc('AkafubuH', 11, 6, { look: NPC_LOOKS.Akafubu, name: 'Akafubu', dir: DIR.RIGHT, text: 'Your black orb rests in the hands of the statue before you. Go on, take it.', mind: '(Oeia... What am I to do now?)' });
    M.trigger(1, 5, 2, 3, function* (E) { yield E.say("I have followed Oeia's instructions and entered the final chamber! He told me that if I reached this chamber, I would become Kibombo's witch doctor. But what must I do here to become a witch doctor? I do not know...", 'Akafubu'); }, { once: 'gab_heart_seen', cond: () => !G.flag('gab_statue_spoke') });
    ladder(M, 2, 10, 'gabomba_catacombs', 4, 3, DIR.DOWN, { cond: () => !!G.flag('gab_statue_spoke') });
    if (!G.flag('gab_statue_spoke')) { M.setObj(2, 10, null); M.set(2, 10, 'marble'); }
    M.sign(8, 3, 'The inner chamber. A statue of the Great Gabomba holds out its hands.');
  });
  T3.gabombaOrb = function* (E) {
    if (G.flag('black_orb_got')) { yield E.say('The statue\'s hands are empty now.'); return; }
    if (!G.flag('gab_statue_spoke')) {
      G.set('gab_statue_spoke'); Engine.doFlash(12, '#60c0ff'); Audio.sfx('psy'); yield E.say('The eyes of the statue glow, and the orb rises out of its hands into the air.');
      yield E.say('Oh, young witch doctor... You have succeeded in your task. You have found this chamber.', '?????'); yield E.say('Wh-Who speaks?', 'Akafubu'); yield E.say('It sounded like it was the statue of the Great Gabomba.', 'Kraden');
      yield E.say('Akafubu! Your magic has grown strong! At last, you are worthy of the title witch doctor. I give you the feathers and gown that are the badges of your office! From this day forward, you shall be Kibombo\'s witch doctor.', 'Gabomba');
      yield E.say("I've done it! I've finally earned the right to be witch doctor! At last! Yes!", 'Akafubu'); yield E.say('He runs for the passage, to tell the village.');
      const a = E.field.npcs.find(n => n.id === 'AkafubuH'); if (a) a.hidden = true;
      yield E.say('And there is one thing that remains for me to give you... Akafubu... You hasty fool... I had something else to give you, and in your haste, you left too soon.', 'Gabomba');
      yield E.say('Say, you there... Yes! You! I have magic for Akafubu, magic that he will soon need, ...but he is not ready for it. Tell this to Akafubu: If he desires this new magic, then he must earn it himself! This power shall not be realized until he ceases living only for himself... And instead lives his life to benefit others. Tell him so!', 'Gabomba');
      yield E.say("I don't suppose you could just... give that magic to us?", 'Kraden'); yield E.say('The power can be claimed by another, but only if Akafubu lacks the will to earn it himself. But before you do this thing, you must convey to Akafubu all that I have told you.', 'Gabomba');
      yield E.say("Oh, of course! We wouldn't dream of cheating him... We will tell him all you have told us.", 'Kraden');
      yield E.say('Follow that path, and you will find a cavern... But now, I shall sleep... until the time comes when I must anoint a new witch doctor.', 'Gabomba');
      const MM = G.field.map; MM.setObj(2, 10, 'ladder'); MM.set(2, 10, 'gab_floor'); MM.walkable(2, 10); MM.finalize();
      yield E.say('A tile of the floor at the west end slides away: a ladder, going down. The orb drops back into the statue\'s hands.');
      yield E.say("Felix... Go get Piers's precious orb.", 'Kraden');
    }
    G.set('black_orb_got'); yield E.give('Black Crystal', 1); const o = G.field.map.objects.find(ob => ob.id === 'gab_orb'); if (o) o.tile = null;
    yield E.say('Felix got the Black Crystal.');
    yield E.say('Felix... Do you have any idea exactly what this "Great Gabomba" really is? But doesn\'t this witch doctor magic seem not unlike some kind of Psynergy? Either way, we are obligated to deliver the Gabomba\'s message. Then, maybe we can come back inside this Gabomba statue some other time to get it.', 'Kraden');
  };
}
