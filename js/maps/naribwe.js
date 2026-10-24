// ---------- Naribwe ----------
// After map references/golden-sun-the-lost-age-naribwe-gba-map.webp (the town panel, 29 x 28): the painted totems by
// the north way in, the fortune-teller's hut on the rise at the top right, the two homes under the ledge on the
// left, the armory at the bottom left, the inn's double hut at the bottom right, the fire pit and the dancing
// ring in the middle, the well, the item seller's mat, the palms all round. Per the guide: the Elixir jar by the
// armory, the Sleep Bomb jar in the inn, 18 coins in the upper-left home's jar, the Unicorn Ring (the home's
// back yard, Whirlwind on the ivy for the ladder, Reveal on the stone above), the Thorn Crown up the rope on the
// right (Lash); the fortune-teller reads an item for 20 coins; Chill waits on the world map to the south.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'sand', 'd': 'dirt', 'g': 'grass', 't': { ground: 'sand', obj: 'palm' }, 'T': { ground: 'grass', obj: 'palm' }, 'b': { ground: 'sand', obj: 'bush' }, 'o': { ground: 'sand', obj: 'rock_small' },
    'P': { ground: 'sand', obj: 'totem' }, 'f': { ground: 'sand', obj: 'fence' }, 'L': { ground: 'sand', obj: 'ladder', walk: true }, 'm': 'rug', 'k': { ground: 'sand', obj: 'crate' }
  };
  const N = grid(29, 28, '.');
  // the palms round the edge, thicker at the corners
  fill(N, 0, 0, 28, 0, 't'); fill(N, 0, 27, 28, 27, 't'); fill(N, 0, 1, 0, 26, 't'); fill(N, 28, 1, 28, 26, 't');
  for (const [x, y] of [[1, 1], [2, 1], [1, 4], [1, 5], [14, 1], [15, 1], [16, 2], [17, 3], [24, 1], [25, 2], [26, 3], [27, 4], [24, 4], [26, 6], [27, 7], [1, 11], [2, 11], [3, 11], [1, 16], [2, 16], [1, 25], [2, 26], [4, 26], [26, 25], [27, 24], [25, 26], [13, 8], [7, 9], [5, 22], [25, 17], [26, 18], [27, 19], [24, 20], [25, 21], [1, 20], [10, 24], [26, 12], [27, 13], [13, 26], [19, 26], [22, 26], [9, 26], [17, 26]]) N[y][x] = 't';
  for (const [x, y] of [[10, 12], [20, 12], [9, 17], [14, 9], [4, 24], [22, 15], [27, 10]]) N[y][x] = 'b';
  // the rise with the totems and the fortune-teller's hut, walled off from the town by the ledge; the ladder cut under the ivy
  fill(N, 1, 7, 9, 8, 'R'); fill(N, 9, 1, 10, 6, 'R');   // the ledge's face under the rise, the wall between the rise and the north way
  N[7][2] = 'L'; N[8][2] = 'L';
  for (const [x, y] of [[3, 3], [5, 2], [7, 2], [5, 5], [7, 5], [13, 3], [12, 25], [15, 25]]) N[y][x] = 'P';
  fill(N, 14, 5, 16, 7, 'R'); fill(N, 17, 7, 24, 8, 'R'); fill(N, 21, 9, 24, 10, 'R'); fill(N, 25, 7, 27, 8, 'R'); fill(N, 24, 3, 24, 6, 'R'); fill(N, 25, 3, 27, 3, 'R');   // the cliffs that hold the fortune-teller's rise up on the right; the shelf beyond the rope, walled on its own
  fill(N, 25, 4, 27, 6, '.');
  fill(N, 22, 11, 24, 11, 'f');
  // the ground: the beaten dirt of the dancing ring and the paths
  fill(N, 11, 12, 18, 18, 'd'); fill(N, 9, 14, 20, 16, 'd'); fill(N, 12, 19, 13, 24, 'd'); fill(N, 13, 8, 14, 11, 'd'); fill(N, 7, 15, 8, 15, 'd'); fill(N, 19, 12, 20, 13, 'd');
  fill(N, 5, 9, 6, 9, 'g'); fill(N, 24, 24, 27, 26, 'g'); fill(N, 2, 22, 4, 23, 'g'); fill(N, 16, 2, 18, 4, 'g');
  fill(N, 8, 21, 10, 23, 'm');   // the item seller's mat
  N[25][6] = 'k';
  defineMap('naribwe', {
    name: 'Naribwe', w: 29, h: 28, base: 'sand', music: 'desert', bg: 'grass', entry: { x: 13, y: 25 },
    build(M) {
      M.paint(0, 0, strs(N), LEG, { cliff: 'R', set: 'brownrock', faces: 1 });
      for (let y = 0; y < 28; y++) for (let x = 0; x < 29; x++) if (N[y][x] === 'P') M.setObj(x, y - 1, 'totem_top');
      // the two ways in and out: north to the mountains, south to the cliffs
      M.walkable(11, 0, 2, 1); M.setObj(11, 0, null); M.setObj(12, 0, null); M.exit(11, 0, 2, 1, 'world_tla', 125, 184, DIR.UP);
      M.walkable(13, 27, 2, 1); M.setObj(13, 27, null); M.setObj(14, 27, null); M.exit(13, 27, 2, 1, 'world_tla', 125, 186, DIR.DOWN);
      // the huts: the fortune-teller on the rise, the two homes under the ledge, the armory, the inn
      M.house(19, 1, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'naribwe_fortune', tx: 5, ty: 7, windows: false });
      M.house(4, 8, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'naribwe_home1', tx: 5, ty: 7, windows: false, doorX: 1 });
      M.house(7, 10, 4, 4, 'roof_thatch', { wall: 'wall_mud', to: 'naribwe_home2', tx: 5, ty: 7, windows: false, doorX: 2 });
      M.house(2, 16, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'naribwe_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false, doorX: 1 });
      M.house(16, 17, 7, 6, 'roof_thatch', { wall: 'wall_mud', to: 'naribwe_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false, doorX: 4 });
      M.setObj(14, 15, 'firepit'); M.light(14, 15, 3); M.setObj(24, 14, 'well');
      // the back yard behind the first home: the ivy over the ladder cut in the ledge, the stone on the rise above
      M.object('vines', 2, 8, { id: 'nar_ivy', reveal: 'ladder' }); M.exit(3, 10, 1, 1, 'naribwe_home1', 9, 1, DIR.UP, { door: true });   // the home's back door opens on the yard
      M.object('spot', 1, 4, { id: 'nar_ring', hiddenUntilReveal: true, tile: 'grey_rock', script: function* (E) { if (G.flag('naribwe:hidden:1,4')) { yield E.say('A stone, and nothing under it now.'); return; } G.set('naribwe:hidden:1,4'); yield E.say('Under the stone, wrapped in a scrap of hide...'); yield E.give('Unicorn Ring', 1); } });
      // the rope up the cliff on the right, and the chest on the shelf it reaches
      M.object('rope', 26, 9, { id: 'nar_rope', len: 3 }); M.chest(27, 5, 'Thorn Crown', 1);
      // the item seller on the mat (the Elixir jar by the armory is in HIDDEN_ITEMS)
      M.npc('nar_item', 9, 20, { type: 'tribal', name: 'Item Seller', dir: DIR.DOWN, shop: 'naribwe_item', text: 'Herbs, nuts, a few rarer things. Everything on the mat is for sale.' });
      // the people, with the script's lines and their thoughts
      M.npc('nar_001', 13, 22, { type: 'tribal', move: 'wander', text: "Welcome to Naribwe. It's really hot out... You should relax a while.", mind: "(I can hardly stand the heat in Naribwe, and I've lived here my whole life! I can't imagine what travelers must think of it.)" });
      M.npc('nar_002', 21, 15, { type: 'tribal_f', move: 'wander', text: "It's dangerous out ever since the day the gems fell from the sky. After that day, all local creatures suddenly grew more powerful and terrifying.", mind: "(That was the day the wind blew so hard and the dark clouds came from the north. That's when those strange gems fell from above.)" });
      M.npc('nar_003', 10, 8, { type: 'elder_m', dir: DIR.DOWN, script: function* (E) { const r = yield* E.ask("The Kibombo went on an expedition to the east, but they've already returned. Do you know what kind of expedition it was?", 'Elder'); if (r === 0) yield E.say('What? They crossed over to Indra and attacked a town!? The Kibombo are a reckless and dangerous people.', 'Elder'); else yield E.say("Oh, you don't? The Kibombo rarely journey far abroad. It's very worrisome...", 'Elder'); }, mind: '(Akafubu is almost certainly looking for jewels. I cannot understand why a witch doctor needs so many jewels.)' });
      M.npc('nar_004', 6, 14, { type: 'villager_m', move: 'wander', text: "When I climbed the Kibombo Mountains, I had to find a path the Kibombo didn't know about...", mind: "(I remember when I found that path above the pass... Not even the Kibombo knew about it! I'm not even sure I could find the way to the higher pass anymore...)" });
      M.npc('nar_005', 16, 10, { type: 'child_m', move: 'wander', script: function* (E) { const r = yield* E.ask("You don't plan on going to Kibombo, do you, mister?", 'Boy'); if (r === 0) yield E.say("Well, you'll have to find a path through the Kibombo Mountains to get there. The Kibombo warriors keep a close watch on the pass. They won't let you through.", 'Boy'); else yield E.say("That's a wise choice. Nothing good would come to you in a place like that.", 'Boy'); }, mind: '(To get to Kibombo, you have to cross over the Kibombo Mountains. I seem to recall my grandfather telling me about a way past the guards.)' });
      M.npc('nar_006', 11, 4, { type: 'tribal', dir: DIR.DOWN, text: 'I would not venture far north of here if I were you...', mind: "(It is awful to the north of Naribwe... It is hotter, and the creatures are fierce... And worst of all, that's where the Kibombo are!)" });
      M.npc('nar_007', 23, 16, { type: 'elder_f', dir: DIR.LEFT, text: 'When Oeia was their witch doctor, the Kibombo were much more peaceful. Akafubu took over when Oeia passed on, and he is responsible for their warlike ways.', mind: '(Kibombo magic was once widely respected. Now, it is merely feared. That is the way of things since Oeia appointed Akafubu as his successor before dying.)' });
      M.npc('nar_healer', 19, 24, { type: 'monk', name: 'Healer', dir: DIR.UP, sanctum: true, text: 'I am but a humble pilgrim, serving the greater good in the heart of Gondowan. Travelers should know that even in this wild land, aid is not far off.', mind: '(Anywhere I can do some good, I will serve without complaint. Although... it would be nice if it were a little cooler here.)' });
      M.npc('nar_008', 4, 6, { type: 'tribal_f', dir: DIR.RIGHT, script: function* (E) { const r = yield* E.ask('Can you tell me where you have come from?', 'Woman'); if (r === 0) yield E.say("Angara? That is a land far to the north, is it not? I've heard that when it is hot here, it is cold in Angara. The world is a strange place.", 'Woman'); else yield E.say("Why won't you tell me? What are you trying to hide?", 'Woman'); }, mind: '(The warrior who passed through here earlier said he came from an isle in the middle of the sea.)' });
      M.npc('nar_009', 25, 24, { type: 'villager_m', dir: DIR.LEFT, text: 'On the far side of the river lies a huge mountain we call Magma Rock. It is a sacred place that the gods created long ago.', mind: "(Sometimes, you can hear explosions from across the river near Magma Rock. I wonder what's going on over there.)" });
      M.npc('nar_012', 17, 13, { type: 'tribal', move: 'wander', text: 'By painting our bodies, we bring about good luck. You should try it, too.', mind: '(Body painting also protects us from the magic of the witch doctor, or so I\'m told.)' });
      M.sign(15, 24, 'Naribwe. North: the Kibombo Mountains. South: Gondowan Cliffs.');
      M.trigger(12, 24, 4, 2, function* (E) { yield E.say('Naribwe. A village of Gondowan, and the last one before the Kibombo. The heat!', 'Kraden'); yield E.say("Piers came through here - 'the warrior from the isle in the sea', they will say. We are on his road.", 'Sheba'); }, { once: 'naribwe_seen' });
    }
  });
  // the upper-left home: the jar with 18 coins, and the back door on to the yard under the ledge
  Kit.interior('naribwe_home1', { name: 'Home', w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'naribwe', x: 5, y: 13 }, furn: [['bed', 8, 2], ['bed_foot', 8, 3], ['table', 4, 4], ['chair', 3, 4], ['shelf', 2, 2], ['pot', 1, 5]],
    npcs: [{ id: 'nar_010', x: 6, y: 5, type: 'tribal_f', name: 'Woman', text: "The fortune-teller lives at the highest house in Naribwe... He's the closest thing we have to a mayor.", mind: "(The fortune-teller in Naribwe has quite a reputation... His predictions are so accurate! He's always done them for us alone, so I don't understand how he got so famous.)" }],
    build(M) { M.setObj(9, 0, 'door_cave'); M.walkable(9, 0); M.exit(9, 0, 1, 1, 'naribwe', 2, 10, DIR.LEFT, { door: true }); M.sign(9, 1, 'The back door: the yard under the ledge.'); M.setObj(9, 1, null); M.walkable(9, 1); } });
  Kit.interior('naribwe_home2', { name: 'Home', w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'naribwe', x: 9, y: 14 }, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['table', 6, 3], ['chair', 7, 3], ['shelf', 8, 2], ['pot', 9, 5]],
    npcs: [{ id: 'nar_011', x: 5, y: 5, type: 'tribal', name: 'Man', text: "We're a small village, but if we all cooperate, we can get almost anything done.", mind: "(As long as we listen to the words of the fortune-teller, we won't have any worries...)" }, { id: 'nar_013', x: 3, y: 6, type: 'child_f', name: 'Girl', text: 'My father is a fortune-teller, not a witch doctor. There are a great many differences between him and Akafubu of Kibombo.', mind: '(My father may not be a witch doctor, but he could easily defeat Akafubu.)' }] });
  Kit.inn('naribwe_inn', { name: 'Naribwe Inn', price: 30, back: { map: 'naribwe', x: 20, y: 23 } });
  Kit.shop('naribwe_weaponshop', { name: 'Naribwe Armory', shop: 'naribwe_weapon', back: { map: 'naribwe', x: 3, y: 21 } });
  // the seer: 20 coins, an item on the table, and a reading that depends on what it is and how far the road has gone
  T3.fortune = function* (E) {
    const r = yield* E.ask('I am a teller of fortunes. Would you have a reading?', 'Seer'); if (r !== 0) { yield E.say('Then stand back.', 'Seer'); return; }
    const p = yield* E.ask("It's 20 coins to hear what your future holds. Will you pay?", 'Seer'); if (p !== 0) { yield E.say('Then stand back.', 'Seer'); return; }
    if (G.party.coins < 20) { yield E.say('Many want things they cannot afford. If you do not have the money, you will have no reading.', 'Seer'); return; }
    G.party.coins -= 20; Audio.sfx('coin');
    const k = yield* E.ask('Very well. Show me one of your items.', 'Seer', ['A weapon', 'Some armor', 'Another item']);
    yield E.say('Are you prepared? ...I shall begin my reading...', 'Seer'); G.set('fortune_read');
    if (k === 0) yield E.say(G.flag('poseidon_done') ? 'I see... Beyond the weapon you set down lies a terrible foe. None in the eastern world can stand against the power you possess.' : G.flag('piers_joined') ? 'I see... Beyond the weapon you set down lies a terrible foe. In a misty sea, a mighty foe... A fearsome battle awaits you. Gather the pieces of the weapon to defeat him, or drown in defeat yourself.' : 'I see... Beyond the weapon you set down lies a terrible foe. Many enemies await you, far beyond the mountains. If you move to strike them... you will meet with great disaster.', 'Seer');
    else if (k === 1) yield E.say(G.flag('jupiter_lit') ? 'I see... In the item you have placed before me, I can see nothing of the future...' : 'I see... From the garb you have placed before me, I sense the presence of the one you await. To the southeast... in the plains of the southern continent in the Eastern Sea... The one you seek awaits.', 'Seer');
    else yield E.say(G.flag('lemuria_visited') ? 'I see... Beyond the item before me, I see a path for you to follow. The object that you seek lies somewhere in the west. Why do you linger in the eastern world? If your work is done, the west beckons you.' : G.flag('trident_forged') ? 'I see... Beyond the item before me, I see a path for you to follow. You have the weapon you need to defeat the sea beast. Go to the sea of mists and face your foe!' : G.flag('piers_joined') ? 'I see... Beyond the item before me, I see a path for you to follow. You must forge a weapon to defeat a mortal enemy. Seek out the pieces!' : 'I see... Beyond the item before me, I see a path for you to follow. I see you inside a sacred icon. By listening to the voices, you will earn a precious item.', 'Seer');
  };
  Kit.interior('naribwe_fortune', { name: "Fortune Teller's Hut", w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'naribwe', x: 21, y: 6 }, furn: [['table', 5, 3], ['torch', 1, 1], ['torch', 9, 1], ['pot', 9, 6], ['bookshelf', 2, 2]],
    npcs: [{ id: 'fortune', x: 5, y: 2, type: 'elder_m', name: 'Seer', dir: DIR.DOWN, script: T3.fortune, mind: '(The items that one carries are filled with one\'s hopes and desires. I can sense these desires and I can see answers hidden within them.)' }] });
}
