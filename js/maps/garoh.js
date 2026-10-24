// ---------- Garoh ----------
// The werewolves' village in the hills of southern Osenia, after map references/golden-sun-the-lost-age-garoh-gba-
// map.webp: the switchback stair up from the world (garoh_approach), the grove with the pond where the moon shows
// (garoh_path), the village on its terraces in the rock (garoh, 29 x 28), the boulder north-east of it that Reveal
// opens into Maha's cave, and the cavern west of town with the six platforms only Reveal shows (Hypnos' Sword).
// Story per the script: night falls on the stair; the werewolf at the pond runs home; the hooded villagers deny
// everything; Maha peers out of the boulder and is gone; after Air's Rock, Reveal opens the boulder - the little
// werewolf, the dead end, Maha and the talk of Adepts and lycanthropes; a night at the inn; Maha's second talk and
// the Jupiter Djinni Ether.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const night = () => !G.flag('garoh_slept');
  const LEGEND = { '.': 'grass', ':': 'path', 'T': { ground: 'grass', obj: 'tree' }, 'S': { ground: 'stonefloor', obj: 'stairs', walk: true }, 'w': 'water', 'x': { ground: 'grass', obj: 'rock_grass' }, 't': { ground: 'grass', obj: 'torch' }, 'D': { ground: 'grass', obj: 'door_cave', walk: true }, 'f': 'flowers' };
  const GC = { cliff: '#', set: 'greyrock', faces: 1 };
  // ======================= THE STAIR UP =======================
  const A = grid(24, 34, '.');
  fill(A, 0, 0, 23, 33, '#'); fill(A, 2, 1, 21, 32, '.');
  fill(A, 4, 5, 19, 6, '#'); fill(A, 4, 11, 19, 12, '#'); fill(A, 4, 17, 19, 18, '#'); fill(A, 4, 23, 19, 24, '#'); fill(A, 4, 29, 19, 30, '#');   // the terraces
  fill(A, 17, 5, 18, 6, 'S'); fill(A, 5, 11, 6, 12, 'S'); fill(A, 17, 17, 18, 18, 'S'); fill(A, 5, 23, 6, 24, 'S'); fill(A, 17, 29, 18, 30, 'S');   // the switchbacks
  fill(A, 11, 31, 12, 33, ':'); fill(A, 11, 0, 12, 1, ':');
  for (const [x, y] of [[3, 2], [20, 3], [3, 8], [20, 9], [3, 14], [20, 15], [3, 20], [20, 21], [3, 26], [20, 27], [8, 3], [14, 9], [9, 15], [15, 21], [8, 27]]) A[y][x] = 'x';
  defineMap('garoh_approach', {
    name: 'Garoh - The Stair', w: 24, h: 34, base: 'grass', music: 'garoh', bg: 'grass', entry: { x: 11, y: 32 }, night, enc: [['Kobold II'], ['Momonga', 'Momonga'], ['Dino']],
    build(M) { M.paint(0, 0, strs(A), LEGEND, GC); M.exit(11, 33, 2, 1, 'world_tla', 199, 240, DIR.DOWN); M.walkable(11, 33, 2, 1); M.exit(11, 0, 2, 1, 'garoh_path', 8, 27, DIR.UP); M.walkable(11, 0, 2, 1);
      M.trigger(2, 4, 20, 1, T3.garohNightfall, { once: 'garoh_nightfall' }); M.sign(13, 31, 'GAROH - up the stair. Travelers to Air\'s Rock pass through.'); }
  });
  // ======================= THE GROVE AND THE POND =======================
  const P = grid(17, 29, '.');
  fill(P, 0, 0, 16, 28, '#'); fill(P, 2, 1, 14, 27, '.'); fill(P, 6, 6, 10, 9, 'w'); fill(P, 7, 5, 9, 5, 'w'); fill(P, 7, 10, 9, 10, 'w');
  fill(P, 7, 11, 9, 27, ':'); fill(P, 7, 1, 9, 4, ':'); P[3][7] = ':';
  for (const [x, y] of [[3, 2], [13, 3], [3, 12], [13, 13], [3, 20], [13, 22], [4, 26], [12, 26], [3, 7], [13, 8]]) P[y][x] = 'T';
  for (const [x, y] of [[5, 17], [11, 18], [4, 23], [12, 11]]) P[y][x] = 'x';
  P[4][5] = 't'; P[4][11] = 't';
  defineMap('garoh_path', {
    name: 'Garoh - The Grove', w: 17, h: 29, base: 'grass', music: 'garoh', bg: 'grass', entry: { x: 8, y: 27 }, night, enc: [['Kobold II'], ['Momonga', 'Momonga']],
    build(M) { M.paint(0, 0, strs(P), LEGEND, GC); M.exit(7, 28, 3, 1, 'garoh_approach', 11, 1, DIR.DOWN); M.walkable(7, 28, 3, 1); M.exit(7, 0, 3, 1, 'garoh', 12, 26, DIR.UP); M.walkable(7, 0, 3, 1);
      M.trigger(6, 14, 5, 1, T3.garohWerewolf, { once: 'garoh_wolf_seen', cond: () => G.flag('garoh_nightfall') }); M.sign(11, 12, 'The pond. Still enough to hold the moon.'); }
  });
  // ======================= THE VILLAGE =======================
  const V = grid(29, 28, '.');
  fill(V, 0, 0, 28, 0, '#'); fill(V, 0, 1, 1, 27, '#'); fill(V, 27, 1, 28, 27, '#'); fill(V, 0, 27, 28, 27, '#');
  fill(V, 2, 1, 26, 3, '#'); fill(V, 12, 2, 16, 10, '#'); fill(V, 5, 4, 10, 4, '#'); fill(V, 2, 12, 26, 14, '#'); fill(V, 17, 12, 18, 14, 'S'); V[14][9] = '.'; V[14][22] = '.'; fill(V, 13, 13, 13, 14, '.');   // the upper ridge, the spur, the terrace's front with its stair and the doorways' steps
  fill(V, 2, 5, 3, 11, '.'); fill(V, 4, 11, 10, 11, '.');
  fill(V, 20, 4, 24, 9, '#'); fill(V, 19, 10, 25, 10, '.');                                                                    // the boulder's knoll
  fill(V, 2, 20, 4, 23, '#'); fill(V, 26, 15, 26, 27, '#'); fill(V, 2, 24, 26, 26, '.');
  fill(V, 11, 26, 13, 27, ':'); fill(V, 12, 15, 12, 25, ':'); fill(V, 5, 15, 24, 15, ':');
  for (const [x, y] of [[3, 16], [25, 17], [5, 25], [24, 25], [17, 24]]) V[y][x] = 'x';
  V[6][3] = 't'; V[10][11] = 't'; V[16][20] = 't'; V[26][10] = 't';
  V[13][9] = 'D'; V[13][22] = 'D'; V[12][13] = 'D';
  defineMap('garoh', {
    name: 'Garoh', w: 29, h: 28, base: 'grass', music: 'garoh', bg: 'grass', entry: { x: 12, y: 26 }, night,
    build(M) {
      M.paint(0, 0, strs(V), LEGEND, GC);
      const stone = { wall: 'wall_stone', windows: false };
      // the huts: the item shop on the terrace, the smith, a home, the inn
      M.house(5, 6, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 2, to: 'garoh_item', tx: 6, ty: 6, sign: 'shop_sign' }, stone));
      M.house(5, 17, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 2, to: 'garoh_smith', tx: 6, ty: 6, sign: 'weapon_sign' }, stone));
      M.house(13, 16, 5, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 2, to: 'garoh_house', tx: 6, ty: 8 }, stone));
      M.house(19, 18, 6, 5, 'roof_thatch', Object.assign({ wallRows: 2, doorX: 3, to: 'garoh_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true }, stone));
      M.setObj(17, 16, 'well_tl'); M.setObj(18, 16, 'well_tr'); M.setObj(17, 17, 'well_bl'); M.setObj(18, 17, 'well_br');
      // the doors in the rock: the sanctum behind its wooden door, the cavern of the platforms to the west, the way east
      M.exit(13, 12, 1, 1, 'garoh_sanctum', 6, 8, DIR.UP, { door: true }); M.setObj(13, 12, 'door');
      M.exit(9, 13, 1, 1, 'garoh_cavern', 8, 14, DIR.UP, { door: true });
      M.exit(22, 13, 1, 1, 'garoh_cave', 8, 12, DIR.UP, { door: true, cond: () => G.flag('garoh_boulder_open') });
      M.exit(11, 27, 3, 1, 'garoh_path', 8, 1, DIR.DOWN); M.walkable(11, 27, 3, 1);
      // the boulder on the knoll: Maha's door, only Reveal shows it
      M.object('boulder', 22, 9, { id: 'garoh_boulder', script: T3.garohBoulder });
      M.object('spot', 22, 10, { id: 'garoh_crevice', hiddenUntilReveal: true, tile: 'door_cave', onStep: T3.garohCrevice });
      M.trigger(20, 11, 5, 1, T3.garohMahaPeek, { once: 'garoh_maha_peek', cond: () => !G.flag('reveal_tla') });
      // the villagers, hooded at night
      const hood = (id, x, y, o) => M.npc(id, x, y, Object.assign({ type: 'werewolf', name: 'Villager' }, o));
      hood('gar_v1', 8, 24, { move: 'wander', script: function* (E) { const y = yield* E.ask('So, uh... you say you saw a werewolf?', 'Villager', ['Yes', 'No']); yield E.say(y === 0 ? "Don't be ridiculous... There's no such thing as werewolves." : "Of course not... You should know there's no such thing! Not here!", 'Villager'); }, mind: "It's grim luck that brings strangers here in the gloom of the full moon." });
      hood('gar_v2', 21, 24, { text: 'Gaaaroooooo! Gah! Whoops... Heh heh hrrr... I was just calling my dog... Sounded good, huh?', mind: 'Which one of us was it who removed his hood in front of these strangers?' });
      hood('gar_v3', 12, 22, { move: 'wander', text: "You there... Strangers should not go about at night... Guests are welcome in Garoh, but they'd do well to stay in at night.", mind: "Foreigners only come here en route to Air's Rock... Only a chosen few can reach the peak." });
      hood('gar_v4', 16, 25, { script: function* (E) { const y = yield* E.ask("Don't you love the sight of the full moon?", 'Villager', ['Yes', 'No']); yield E.say(y === 0 ? 'Yes, I agree... But it brings me grief. We here cannot enjoy the sight of it directly.' : "Heh hrr hrrr... Don't feel like you must watch your words on my account. The full moon's light gives birth to many strange sights on nights like this.", 'Villager'); }, mind: "The night of the full moon is usually so festive... It's boring having to wear these hoods when strangers come..." });
      hood('gar_v5', 4, 15, { text: "Good evening. Forgive me for not taking my hood off... I just... don't care much for the full moon's light.", mind: 'Such gorgeous moonlight... if only I could take off this hood...' });
      hood('gar_v6', 19, 11, { text: () => G.flag('reveal_tla') ? 'Garoh exists to protect Air\'s Rock... In exchange, we gain its power ourselves...' : 'Master Maha is in the rock. He will not come out while there are strangers about.', mind: "We have other powers than just Whirlwind... I wonder which of us will inherit the powers of Master Maha?" });
      hood('gar_v7', 3, 8, { text: "So you've heard of Whirlwind? Most people haven't... Even in Garoh, only a chosen few can use it.", mind: "And different people use Whirlwind different ways. Master Maha's mastery of Whirlwind would put anyone to shame." });
      M.sign(14, 26, 'GAROH. Air\'s Rock lies north, in the wastes. The village asks that its guests keep indoors after dark.');
    }
  });
  // ---- the scenes ----
  T3.garohNightfall = function* (E) { yield Engine.fadeOut(40); G.set('garoh_nightfall'); yield 20; yield Engine.fadeIn(40); yield E.say('By the top of the stair the day is gone. The moon is full and low over the hills.'); };
  T3.garohWerewolf = function* (E) {
    yield E.say('Gaaaroooooo! Aow-aow-oooo!!!', '?????'); yield E.say('What was that!?', 'Jenna'); yield E.say('Awoooooo!!!', '?????');
    E.spawn('gar_wolf', 8, 2, { type: 'werewolf', name: 'Werewolf', dir: DIR.DOWN }); yield E.move('gar_wolf', DIR.DOWN, 3);
    yield E.say('Awoooooo!!!', 'Werewolf'); yield E.say('(It stares into the pond, at the moon in it.)'); yield E.say('Ah-ah-awoooo!!!', 'Werewolf'); yield E.say('Eeek!', 'Sheba');
    yield E.move('gar_wolf', DIR.UP, 3); E.despawn('gar_wolf'); G.field.refreshNpcs();
    yield E.say("I don't believe it! Was that a--", 'Kraden'); yield E.say('A what? Kraden, do you know what that thing was?', 'Jenna'); yield E.say('Well... Perhaps...', 'Kraden');
    yield E.say('So, what are you waiting for!? Tell us!', 'Sheba'); yield E.say('I suspect it may have been... a lycanthrope.', 'Kraden'); yield E.say('A lycanthwhat?', 'Jenna');
    yield E.say('Just think of them as a race of people born with special powers...', 'Kraden'); yield E.say('Kind of like Adepts, you mean?', 'Sheba');
    yield E.say("Yes, that sounds right. Sheba, you've put it quite well. Adepts borrow their abilities from the power of the elements... While lycanthropes borrow theirs from the power of beasts... This is why they take the forms of animals... They may look frightening... But we must try to communicate with them.", 'Kraden');
    const y = yield* E.ask('Is it just me... Or does Kraden seem a little TOO happy to have found werewolves?', 'Jenna', ['Yes', 'No']);
    yield E.say(y === 0 ? 'What? Me? Happy to find werewolves? You must be joking!' : 'I would love to study them, but still... they do frighten me...', 'Kraden');
    yield E.say("I guess I'm just curious about all the secrets of these new lands...", 'Kraden'); yield E.say('So, are there werewolves only on Osenia?', 'Sheba'); yield E.say('Ummm...', 'Kraden');
    yield E.say('If so, how could you even have known about them, Kraden?', 'Sheba'); yield E.say('Er... I, uh...', 'Kraden'); yield E.say('Yeah... That is weird.', 'Jenna');
    yield E.say("All right, so I lied! I'm glad we found werewolves! There! Are you happy!? And you know what!? I even want to get a closer look if I can! So let's go! Let's find us some werewolves!", 'Kraden');
  };
  T3.garohMahaPeek = function* (E) {
    Engine.doFlash(8, '#c0a0ff'); E.spawn('MahaPeek', 22, 10, { look: NPC_LOOKS.Maha, name: '???', dir: DIR.DOWN });
    yield E.say('What!? Outsiders, here?', '???'); yield 20; E.despawn('MahaPeek'); G.field.refreshNpcs();
    yield E.say('(An old, grey werewolf - and then only a boulder, and the moonlight on it.)');
    yield E.say('He went INTO the rock. Did you see? Something opened in it and closed again.', 'Kraden');
    yield E.say("Whatever that was, we can't follow. Not yet.", 'Sheba');
  };
  T3.garohBoulder = function* (E) { if (G.flag('garoh_boulder_open')) { yield E.say('The crevice in the boulder stands open now.'); return; } yield E.say(G.flag('reveal_tla') ? 'A great round boulder. There is a way into it - Reveal would show it.' : 'A great round boulder in the moonlight. The old werewolf went into it, somehow.'); };
  T3.garohCrevice = function* (E) { if (!G.flag('garoh_boulder_open')) { G.set('garoh_boulder_open'); yield E.say('Reveal shows a crevice in the boulder, wide enough to pass.'); } yield Engine.fadeOut(20); E.warpNow('garoh_cave', 8, 12, DIR.UP); yield Engine.fadeIn(20); };
  // ======================= MAHA'S CAVE =======================
  defineMap('garoh_cave', {
    name: "Maha's Cave", w: 18, h: 16, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 8, y: 12 }, retreat: { map: 'garoh', x: 22, y: 11, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 18, 16); M.open(8, 15); M.walkable(8, 14, 1, 2); M.exit(8, 15, 1, 1, 'garoh', 22, 11, DIR.DOWN, { door: true });
      M.fillObj(4, 6, 3, 4, 'cavewalltop'); M.fillObj(11, 6, 3, 4, 'cavewalltop'); M.fillObj(7, 2, 4, 2, 'cavewalltop');
      M.setObj(2, 2, 'torch'); M.light(2, 2, 3); M.setObj(15, 2, 'torch'); M.light(15, 2, 3); M.setObj(2, 12, 'torch'); M.light(2, 12, 3); M.setObj(15, 12, 'torch'); M.light(15, 12, 3);
      M.trigger(7, 11, 3, 1, T3.garohCaveChase, { once: 'garoh_chase', cond: () => !G.flag('garoh_maha_met') });
      M.trigger(1, 4, 3, 2, T3.garohMahaMeet, { once: 'garoh_maha_met', cond: () => G.flag('garoh_chase') });
      M.npc('Maha', 8, 4, { look: NPC_LOOKS.Maha, name: 'Master Maha', cond: () => G.flag('garoh_maha_met'), script: T3.maha });
      M.npc('gar_pup', 12, 12, { type: 'werewolf', name: 'Werewolf', cond: () => G.flag('garoh_maha_met') && !G.flag('garoh_slept'), text: 'Woof.' });
      M.sign(15, 14, 'Claw marks on the wall, old and deep.'); }
  });
  T3.garohCaveChase = function* (E) {
    E.spawn('gar_pup_run', 8, 8, { type: 'werewolf', name: 'Werewolf', dir: DIR.DOWN });
    yield E.say('Haowooo!!! Aow-aow-oooo!!!', 'Werewolf'); yield E.say("Look! It's that werewolf!", 'Kraden');
    yield E.move('gar_pup_run', DIR.UP, 3); yield E.move('gar_pup_run', DIR.LEFT, 5); E.despawn('gar_pup_run'); G.field.refreshNpcs();
    yield E.say("He was right there! Let's go find him, Felix!", 'Kraden');
  };
  T3.garohMahaMeet = function* (E) {
    const y = yield* E.ask('Felix, wait... Where could that werewolf have gone? Do you think we lost him somewhere?', 'Kraden', ['Yes', 'No']);
    yield E.say(y === 0 ? 'That would be a shame...' : "I hope we didn't... Or rather, I'd be quite unhappy if we did...", 'Kraden');
    yield E.say('Grrrr...', 'Werewolf'); yield E.say('What was that?', 'Jenna'); yield E.say("It sounded like a wolf growling, didn't it?", 'Sheba');
    yield E.say('My hearing is not so very good, but... there was something. Perhaps we should search this area more thoroughly...', 'Kraden');
    yield E.say('There is no need...', 'Maha'); Engine.doFlash(10, '#c0a0ff');
    E.spawn('MahaM', 8, 4, { look: NPC_LOOKS.Maha, name: 'Maha', dir: DIR.DOWN }); E.spawn('PupM', 10, 4, { type: 'werewolf', name: 'Werewolf', dir: DIR.DOWN });
    yield E.say("Look... He's using Psynergy.", 'Jenna'); yield E.say('Garrrrooow...', 'Werewolf'); yield E.say('Fear not... This child is harmless.', 'Maha'); yield E.say('He does look kind of... small...', 'Sheba');
    yield E.say('Tell me, who are you? How did you come to be here?', 'Kraden');
    const y2 = yield* E.ask('I should like to ask you the same question. Could it be? Do you outsiders possess the power to reveal the unseen?', 'Maha', ['Yes', 'No']);
    yield E.say(y2 === 0 ? 'Of course... I was certain that you must.' : 'Impossible... Without Reveal, you could not have entered this cave.', 'Maha');
    yield E.say("Grawooo...", 'Werewolf'); yield E.say("Yes, you are correct. They must have passed the challenge of Air's Rock.", 'Maha');
    yield E.say("Er... How come that kid doesn't talk, like you?", 'Jenna'); yield E.say('When we become werewolves, speaking the human tongue becomes more difficult.', 'Maha');
    yield E.say('But you can... You must be someone special, then...', 'Sheba');
    yield E.say('Hurh hurr hrrr... "Special"? Perhaps. Why don\'t you just call me Maha... So... I assume you also can use Whirlwind... If you learned Reveal on Air\'s Rock, you must also know Whirlwind.', 'Maha');
    yield E.say("That's right... I think we can tell Maha that we're Adepts.", 'Jenna');
    yield E.say('Awooo...', 'Werewolf'); yield E.say("What did he say? I don't understand...", 'Sheba'); yield E.say('He wanted to know what an Adept is... A question I would like answered as well.', 'Maha');
    yield E.say('Adepts tap the power of elemental energies to generate forces like Whirlwind...', 'Kraden');
    yield E.say('Elementals... You mean the four elements, the power of earth and fire, water and wind?', 'Maha'); yield E.say('That is correct. These elements together comprise everything in our world...', 'Kraden');
    yield E.say('Interesting. Very interesting...', 'Maha'); yield E.say('Aaah-Ah-Awoooh! Hawawoooh!', 'Werewolf');
    yield E.say('No doubt, most would find the sight of a werewolf rather unnerving...', 'Kraden'); yield E.say('You are, sadly, correct. Many consider ours an accursed race.', 'Maha');
    yield E.say('And if they found you in your werewolf form?', 'Jenna'); yield E.say('...Once, our people were burned at the stake as abominations... They called this "purification."', 'Maha'); yield E.say('Horrible...', 'Kraden');
    yield E.say("Child, return to your home. Don't worry. We can trust them... They are Adepts, not unlike us werewolves... They guard an ancient secret. They will not betray us to the world.", 'Maha');
    yield E.say('Woof.', 'Werewolf'); yield E.move('PupM', DIR.DOWN, 6); E.despawn('PupM');
    yield E.say('It has grown quite late. Why don\'t you go to the inn and rest...', 'Maha'); yield E.say('But then...', 'Kraden'); yield E.say('I will not leave this place.', 'Maha');
    yield E.say("You aren't going home?", 'Sheba'); yield E.say('When I learned Reveal, I lost my human form. The wild is my home now.', 'Maha');
    yield E.say('So, Master Maha, you always look this way?', 'Kraden'); yield E.say('And the little one?', 'Jenna'); yield E.say('The child changed because he looked directly at the full moon. By morning he will be a boy again. Now, let us retire.', 'Maha');
    E.despawn('MahaM'); G.set('garoh_maha_met'); G.field.refreshNpcs();
  };
  T3.maha = function* (E) {
    if (G.flag('ether_got')) { yield E.say('Why are you able to use Whirlwind, and what is an Adept? I will think on it. Go with the wind, Adepts.', 'Master Maha'); return; }
    if (!G.flag('garoh_slept')) { yield E.say('It has grown quite late. Go to the inn and rest. We will talk in the morning.', 'Master Maha'); return; }
    yield E.say("Ah, you came. I've been waiting for you.", 'Master Maha'); yield E.say('Would you mind telling me a little more about werewolves?', 'Kraden');
    yield E.say('You want to know the reason we possess the power to transform into beasts? Do you find it strange that we can change our shapes?', 'Master Maha'); yield E.say('Well, ummm... Yes.', 'Kraden');
    yield E.say('But surely changing one\'s shape is not really all that unusual. Think about the caterpillar for a moment. When the time is right, does it not transform into a beautiful butterfly?', 'Master Maha');
    yield E.say("Well, yes. It's only natural...", 'Jenna'); yield E.say('And the pill bug and hedgehog? Do they not change their shapes to protect themselves? And many amphibians possess the power to change color at will, correct?', 'Master Maha');
    yield E.say('In light of all this, do you mean to tell me you find werewolves so abnormal?', 'Master Maha'); yield E.say("Hrmm, well... To be honest, I hadn't thought of it that way before...", 'Kraden');
    yield E.say('Perhaps you simply did not give it enough thought.', 'Master Maha'); yield E.say('How insulting! I, sir... am a SCIENTIST!', 'Kraden');
    yield E.say('Indeed! A scientist? That IS impressive. For a time, I even felt cursed to have been born a werewolf... But after taking a more objective look at nature... I realized that weaker species have survived by evolving... by transforming. I believe that evolving into werewolves is just one way for humanity to survive...', 'Master Maha');
    yield E.say('I had thought only the people of Garoh could use Whirlwind. And that only a chosen few could use Reveal... But now I find that you, too, can use these... What does it all mean? Why are you able to use Whirlwind, and what is an Adept?', 'Master Maha');
    yield E.say('Perhaps the answer walks with you. A Djinni came to this cave in the spring and would not leave me. It has been waiting - for you, I think.', 'Master Maha');
    G.set('ether_got'); yield* E.djinn('Ether');
  };
  // ======================= THE CAVERN OF THE PLATFORMS =======================
  defineMap('garoh_cavern', {
    name: 'Garoh - Cavern', w: 18, h: 16, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 8, y: 14 }, retreat: { map: 'garoh', x: 9, y: 14, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 18, 16); M.open(8, 15); M.walkable(8, 14, 1, 2); M.exit(8, 15, 1, 1, 'garoh', 9, 14, DIR.DOWN, { door: true });
      // the chasm across the cave, and the six platforms over it that only Reveal shows
      M.fill(1, 6, 16, 3, 'chasm'); for (const x of [3, 5, 7, 9, 11, 13]) { M.hidden.push({ x, y: 7, tile: 'cave' }); M.walkable(x, 7); }
      M.chest(8, 2, "Hypnos' Sword", 1); M.setObj(3, 2, 'torch'); M.light(3, 2, 3); M.setObj(14, 2, 'torch'); M.light(14, 2, 3);
      M.sign(3, 13, 'The floor ends in a black gap. Something once spanned it: six stumps of stone, the villagers say, that no eye can see.'); }
  });
  // ---- the buildings ----
  Kit.shop('garoh_item', { name: 'Garoh Item Shop', shop: 'garoh_item', back: { map: 'garoh', x: 7, y: 11 }, npcs: [{ id: 'gar_itemtalk', x: 9, y: 5, type: 'werewolf', script: function* (E) { const y = yield* E.ask('Did you come here from Alhafra?', 'Villager', ['Yes', 'No']); yield E.say(y === 0 ? "Really? You must have gone through the cave... You can't go back that way, you know... The return trip is longer." : "Oh, so you must have come by way of Mikasalla. If you're going to Air's Rock, take the crossroads west of Alhafra.", 'Villager'); }, mind: 'I never change my stock, unlike the weapons and armor shopkeeps...' }] });
  Kit.shop('garoh_smith', { name: 'Garoh Smithy', shop: 'garoh_weapon', back: { map: 'garoh', x: 7, y: 22 }, npcs: [{ id: 'gar_armor', x: 9, y: 5, type: 'werewolf', name: 'Armorer', text: () => night() ? 'Unfortunate that you should come on a night of the full moon, sir... Come during the day to see our full range of wares...' : 'Now that is a better hour for trade. Look all you like.', mind: "These strangers seem normal enough... Except that they're up late for outsiders..." }] });
  Kit.home('garoh_house', { name: 'House', back: { map: 'garoh', x: 15, y: 21 }, npcs: [{ id: 'gar_mother', x: 4, y: 5, type: 'villager_f', text: 'Our oldest son is always scampering off late at night... Where is he?', mind: "That pup of mine just won't listen. He went out when he shouldn't have... He just wanted to see the moonlight, and now his father blames me for it!" },
    { id: 'gar_brother', x: 8, y: 6, type: 'child_m', text: 'No fair! My brother always gets to go out late!', mind: 'What made Master Maha take my brother into the rock? I want to see what\'s in there...' }] });
  Kit.inn('garoh_inn', { name: 'Garoh Inn', price: 24, back: { map: 'garoh', x: 22, y: 23 }, w: 14, h: 10, furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['bed', 11, 2], ['bed_foot', 11, 3], ['bed', 9, 2], ['bed_foot', 9, 3], ['pot', 10, 2], ['table', 5, 6], ['chair', 4, 6], ['chair', 6, 6], ['fireplace', 7, 1], ['shelf', 1, 2]],
    build(M) { M.trigger(0, 0, 14, 10, T3.garohInnMorning, { once: 'garoh_slept', cond: () => G.flag('garoh_maha_met') && G.flag('inn_rested:garoh_inn') }); },
    npcs: [{ id: 'gar_guest1', x: 9, y: 4, type: 'villager_m', text: 'Zzzz... Zzzz... What a waste... Just a big rock...', mind: '...Climbed all over that stupid rock, and for what? Nothing!' },
           { id: 'gar_guest2', x: 11, y: 4, type: 'villager_m', text: 'Zzz... Whuzza? Whirlwind? Wind Stone? Zzzzrrrgg...', mind: 'That rock was huge. How was I supposed to make it spin?' },
           { id: 'gar_innwife', x: 6, y: 2, type: 'villager_f', text: "A clear night around here always means fair weather on the morrow... You've come all this way, so you might as well go to Air's Rock, too...", mind: "It only rains a few times a year there... Air's Rock is in a desert, so what else would you expect?" }] });
  T3.garohInnMorning = function* (E) {
    yield E.say("You folks didn't sleep much last night... You don't look like you got any rest at all.", 'Innkeeper');
    yield E.say("Master Maha told us all about you. Don't worry about the bill. It's on us. Farewell, friends.", 'Innkeeper');
    yield E.say('(Morning. Outside, the hoods have come off: the people of Garoh look like anyone.)');
  };
  Kit.sanctum('garoh_sanctum', { name: 'Garoh Sanctum', back: { map: 'garoh', x: 13, y: 13 }, npcs: [{ id: 'gar_healer_talk', x: 3, y: 6, type: 'priest', name: 'Priest', text: 'The people here may be different, but they certainly are nice... And those abilities of theirs are amazing!', mind: 'No matter what it takes, I will save the souls of those poor villagers...' }] });
}
