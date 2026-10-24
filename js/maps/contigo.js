// ---------- Contigo ----------
// After map references/golden-sun-the-lost-age-contigo-and-anemos-sanctum-gba-map.webp (the town at the picture's
// foot, 30x32, with the crater plateau east of it and the sanctum's face to the north), condensed: the village of
// the Anemos' heirs on the yellow grass - the big home of Ivan's story, the inn (its two keepers, the chef and the
// maid, the Corn on the kitchen table), the two tents beside it (Lucky Wheels for Game Tickets, the dice tables),
// the homes (Ahri the baby who furrows her brow and the wind rises; the gold room Hammet emptied), the shops, the
// sanctum (Power Bread in the barrel by it), the bush patch with the open middle where Scoop finds Salt, the bush
// in the top-left corner Cyclone lifts the Bramble Seed from, the stump Force knocks Shine out of once Isaac is
// with the party; east, up on the crater's floor, the Anemos geoglyph of the winged ship with the second wing
// building on it and the villagers at work; north, the sealed sanctum with the scholars and the translated sign.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 81, y: 146, dir: DIR.DOWN };
  const LEG = {
    '.': 'grass', 'p': 'path', 's': 'sand', 'f': 'flowers', 'g': 'geoglyph', 'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'grass', obj: 'rock_grass' },
    'E': { ground: 'grass', obj: 'tent' }, 't': 'tallgrass', 'd': 'dirt', 'j': { ground: 'grass', obj: 'pot' }, 'k': { ground: 'grass', obj: 'crate' }, 'S': { ground: 'grass', obj: 'stump' }, 'W': { ground: 'sand', obj: 'lh_wall_jupiter' }, 'D': { ground: 'sand', obj: 'door_stone', walk: true }, 'C': { ground: 'sand', obj: 'lh_column' }
  };
  const A = grid(46, 42, '.');
  fill(A, 0, 0, 45, 0, 'T'); fill(A, 0, 0, 0, 41, 'T'); fill(A, 45, 0, 45, 41, 'T'); fill(A, 0, 41, 45, 41, 'T');
  // the crater: its rim of cliff, the floor with the geoglyph, the way up from the town
  fill(A, 31, 9, 44, 32, '#'); fill(A, 32, 10, 43, 31, 's'); fill(A, 31, 19, 31, 21, 's'); fill(A, 35, 18, 40, 23, 'g');
  for (const [x, y] of [[33, 12], [42, 13], [33, 29], [42, 28]]) A[y][x] = 'o';
  // the sanctum's face across the top of the crater, the columns and its door
  fill(A, 17, 1, 29, 7, '#'); fill(A, 18, 2, 28, 6, 's'); fill(A, 19, 2, 27, 2, 'W'); A[2][23] = 'D'; A[3][20] = 'C'; A[3][26] = 'C'; fill(A, 22, 7, 24, 8, 's'); fill(A, 22, 8, 24, 9, 'p');
  // the town: paths, trees, flowers
  fill(A, 15, 9, 17, 40, 'p'); fill(A, 6, 24, 30, 25, 'p'); fill(A, 12, 33, 27, 33, 'p'); fill(A, 28, 20, 31, 20, 'p');
  for (const [x, y] of [[3, 4], [8, 3], [12, 5], [2, 14], [3, 22], [2, 35], [6, 38], [12, 38], [24, 38], [29, 37], [30, 28], [28, 12], [8, 16], [26, 9], [40, 3], [36, 6], [43, 36], [38, 38]]) A[y][x] = 'T';
  for (const [x, y] of [[6, 26], [20, 27], [10, 12], [27, 16], [2, 31]]) A[y][x] = 'f';
  A[9][3] = 'b'; A[17][23] = 'b'; A[30][22] = 'b';
  fill(A, 23, 34, 27, 38, 't'); A[36][25] = 'd';   // the bush patch: Salt under its open middle
  A[33][6] = 'S';
  A[21][12] = 'E'; A[21][13] = 'E'; A[21][15] = 'E';   // the tents: Lucky Wheels (the wide one) and the dice
  A[35][8] = 'j'; A[14][13] = 'k'; A[28][20] = 'j';
  defineMap('contigo', {
    name: 'Contigo', w: 46, h: 42, base: 'grass', music: 'contigo', bg: 'grass', entry: { x: 16, y: 39 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(A), LEG, { cliff: '#', set: 'sandcliff', faces: 1 });
      M.walkable(15, 41, 3, 1); M.exit(15, 41, 3, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN);
      // the houses
      M.house(4, 9, 7, 5, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_house1', tx: 6, ty: 8, windows: true, doorX: 3 });
      M.house(19, 11, 4, 4, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_house2', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(24, 11, 4, 4, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_house3', tx: 6, ty: 8, windows: false, doorX: 1 });
      M.house(4, 17, 7, 5, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: true, doorX: 3 });
      M.exit(12, 22, 2, 1, 'contigo_lucky', 5, 6, DIR.UP, { door: true }); M.walkable(12, 22, 2, 1); M.exit(15, 22, 1, 1, 'contigo_dice', 4, 6, DIR.UP, { door: true }); M.walkable(15, 22);
      M.house(21, 19, 5, 4, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false, doorX: 2 });
      M.house(7, 27, 4, 4, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_itemshop', tx: 6, ty: 6, sign: 'shop_sign', windows: false, doorX: 2 });
      M.house(12, 27, 4, 4, 'roof_thatch', { wall: 'wall_plaster', to: 'contigo_house4', tx: 6, ty: 8, windows: false, doorX: 1 });
      M.house(2, 26, 4, 5, 'roof_purple', { wall: 'wall_plaster', to: 'contigo_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign', windows: false, doorX: 1 });
      // the sanctum's sealed door: 72 Djinn open it, and nothing less
      // the sealed door opens on a dead end (the Dragon Skin behind Reveal); the sanctum itself is entered by Teleport on the circle in the town's middle
      M.exit(23, 2, 1, 1, 'anemos_gate', 6, 9, DIR.UP, { door: true });
      M.object('tpcircle', 20, 21, { id: 'contigo_circle', tile: 'ml_circle', to: { map: 'anemos', x: 11, y: 18 } });
      M.trigger(19, 22, 3, 1, function* (E) { yield E.say('A circle cut into the ground in the middle of the town, the kind the old places have. Teleport would answer it - to wherever its twin lies.', 'Kraden'); }, { once: 'contigo_circle_seen', cond: () => G.flag('teleportUnlocked') });
      M.sign(21, 3, "The characters from the wall are translated here. Some of them are gates, and some of them are roads. Search with your heart to find the truest path.");
      // Salt under the open middle of the bush patch; the stump Force knocks Shine out of, once Isaac is here
      M.object('scoop', 25, 36, { id: 'contigo_salt', look: null, onScoop: function* (E) { if (G.party.djinnFound.includes('Salt')) return; G.field.map.objects.push({ kind: 'djinni', x: 25, y: 36, name: 'Salt', key: 'djinn:Salt', fight: false, el: 0 }); Audio.sfx('item'); yield E.say('Something was buried under the bushes - a Venus Djinni, shaking the earth off itself!', 'Felix'); } });
      if (G.flag('obj:contigo:scoop:contigo_salt') && !G.party.djinnFound.includes('Salt')) M.djinni('Salt', 25, 36, { fight: false });
      M.object('stump', 6, 33, { id: 'contigo_stump', onForce: function* (E) { if (G.party.djinnFound.includes('Shine')) { yield E.say('The stump rings hollow.'); return; } G.field.map.objects.push({ kind: 'djinni', x: 6, y: 32, name: 'Shine', key: 'djinn:Shine', fight: false, el: 2 }); Audio.sfx('item'); yield E.say('Something pops out of the stump - a Mars Djinni!', 'Garet'); } });
      // the crater: the second wing building on the geoglyph, and the villagers at work on it
      M.setObj(37, 19, 'anemos_wing_l'); M.setObj(38, 19, 'anemos_wing_r'); M.setObj(37, 20, 'anemos_wing_bl'); M.setObj(38, 20, 'anemos_wing_br'); M.setObj(35, 21, 'crate'); M.setObj(40, 21, 'crate');
      const at = (id, x, y, type, name, text, mind, opts) => M.npc(id, x, y, Object.assign({ type, name, text, mind }, opts || {}));
      at('con_021', 36, 18, 'villager_m', 'Man', "The wings will be finished shortly. Where is the ship they're going to be attached to?", '(What do we do if we made these wings, and then no boat shows up for us to put them on?)', { dir: DIR.RIGHT });
      at('con_022', 39, 22, 'villager_m', 'Man', "Which part goes where? Does this metal feather connect to that wooden post? It's like a puzzle, and it's getting rather complicated.", "(There are too many parts! I think I'm going insane from all these stupid parts!)", { dir: DIR.UP });
      at('con_023', 34, 20, 'villager_f', 'Woman', "You've gotta watch out, 'cause you don't want to break anything... It's delicate work!", '(When I start getting irritated, I just go nuts. I think I should avoid getting irritated.)', { dir: DIR.RIGHT });
      at('con_024', 41, 18, 'villager_m', 'Man', 'Just a few more touches, and the wings are done. All we have left is to assemble them!', "(How long have we been working on these stupid wings? When I see that boat soaring through the skies, I think I'll cry.)", { move: 'wander' });
      at('con_025', 38, 25, 'villager_f', 'Woman', 'The wings are almost done. We just need to get them to the bay and await the ship.', "(I've been really busy lately, but now that the second wing is almost done, I can rest.)", { move: 'wander' });
      at('con_026', 33, 27, 'villager_m', 'Traveler', "I've come a long way to see the flying boat. I hope the prophecies are right.", "(The guys carrying the other wing haven't come back, and we're almost ready to send this one!)", { move: 'wander' });
      M.npc('con_029', 42, 30, { type: 'child_m', name: 'Boy', script: function* (E) { const r = yield* E.ask('Have you taken a good look at the Anemos geoglyph?', 'Boy', ['Yes', 'No']); if (r === 0) yield E.say("You can't see all of it right now, because the wings are covering up the picture...", 'Boy'); else yield E.say("Oh, that's really too bad. The picture of the flying boat looks so cool.", 'Boy'); }, mind: "(I can't even imagine how cool it would be to see a boat like the one in the geoglyph. But it's so big! I doubt there's a boat that big anywhere!)" });
      M.sign(34, 24, 'The Anemos geoglyph: a ship with wings sprouting from its hull, cut into the floor of the crater.');
      // by the sanctum
      at('con_027', 19, 4, 'scholar', 'Scholar', "That sign has a translation of the characters on the wall. If you're interested in studying the sanctum, you should give it a read.", "(I don't know if anyone in Contigo cares about what I'm doing here. But I know that devoted pilgrims will appreciate having this translation.)", { dir: DIR.RIGHT });
      at('con_028', 26, 4, 'scholar', 'Scholar', "I want to get a good look at the inside of the sanctum, but I can't get this door to open. I'm hoping that deciphering these characters on the wall might give me the clue I need.", "(Wouldn't it be terrible if I got the door open and there was nothing on the other side?)", { dir: DIR.LEFT });
      // the town's people
      M.npc('con_001', 13, 12, { type: 'villager_m', name: 'Man', move: 'wander', script: function* (E) { const r = yield* E.ask('Do you know anything about a legend about these people who could control the wind and air?', 'Man', ['Yes', 'No']); if (r === 0) yield E.say('Well, the legend says that these giants from Anemos built Contigo with their wind powers.', 'Man'); else yield E.say('That was the Anemos tribe. They even had the power to fly through the air! The people of Contigo inherited some of their power, and now, we rule over Atteka.', 'Man'); }, mind: '(The Anemos blood in our veins often brings about strange miracles.)' });
      at('con_002', 20, 30, 'villager_f', 'Woman', 'If you want to get a look at the Anemos geoglyphs, you ought to go to the ruins...', "(The Anemos geoglyphs are the most amazing carvings I've ever seen...)", { move: 'wander' });
      at('con_003', 27, 22, 'villager_m', 'Man', 'Our people have labored for some time to build the Wings of the Anemos.', '(We built the Wings of Anemos out of materials we found in the ruins of Anemos Sanctum.)', { move: 'wander' });
      at('con_004', 9, 24, 'elder_m', 'Old Man', 'The beacon within Jupiter Lighthouse will soon be lit. I know this because of a strange premonition I had three years ago.', '(Surely, someone will come soon to light the beacon atop the lighthouse.)', { dir: DIR.DOWN });
      at('con_005', 22, 36, 'villager_m', 'Man', 'I guess the people of Contigo lost the power they inherited from the Anemos tribe.', '(The power of the wind is not all that we\'ve lost. We have lost much of our culture, as well as the technology to rebuild the ruins.)', { move: 'wander' });
      at('con_006', 4, 36, 'elder_f', 'Old Woman', 'When the power of Anemos is lost, a group will come to light the beacon against darkness. We had thought it was nothing but legend, but it is all coming true.', "(I think Jupiter Lighthouse will be lit soon. I don't know when, but it will happen soon.)", { dir: DIR.RIGHT });
      at('con_007', 29, 17, 'villager_m', 'Man', 'The Anemos geoglyphs show a boat with wings sprouting from its hull... The story goes that these wings could make the boat float in the air...', "(It's hard to believe, but the Anemos really did have the power to make ships fly.)", { dir: DIR.RIGHT });
      at('con_008', 12, 36, 'elder_m', 'Old Man', 'The people of Anemos possessed power over the wind. They could also see into the future.', "(There were two siblings born in Contigo. The older held great power. Both are gone now... The younger was only a baby when he left the village. I don't know how strong he became.)", { move: 'wander' });
      at('con_016', 3, 19, 'elder_m', 'Old Man', "I'm afraid I'm too old to help in the construction of the wings, but I so want to see them fly...", "(I threw my back out helping with the wings. I can't touch my toes. I can barely touch my knees.)", { dir: DIR.RIGHT });
      at('con_017', 18, 20, 'villager_f', 'Girl', "When is the miracle of the Anemos gonna hurry up and happen? I can't wait forever!", '(I want to see the boat when it sails through the air on our wings. But even more, I want to see the hero of prophecy... Will he be a real looker, like Yegelos?)', { move: 'wander' });
      M.sign(18, 38, 'Contigo, village of the Anemos. The crater and the sanctum lie to the east and north.');
      M.trigger(15, 38, 3, 2, function* (E) { yield E.say('Contigo! The town Ivan was born in... The Anemos tribe, the people of the wind, came from here.', 'Sheba'); yield E.say('And these people have been building wings for a ship they have never seen. Prophecy is a strange thing to raise a village on.', 'Kraden'); }, { once: 'contigo_seen' });
    }
  });
  // ---- the houses ----
  Kit.home('contigo_house1', { name: 'Home', w: 12, h: 10, wall: 'wall_plaster', back: { map: 'contigo', x: 7, y: 14 }, doorX: 6,
    build(M) { M.trigger(4, 7, 5, 2, T3.contigoReunion, { cond: () => G.flag('jupiter_done') && !G.flag('contigo_reunion') }); M.trigger(4, 7, 5, 2, function* (E) { yield E.say('Hama went on ahead to the inlet. The ship is there - and, she said, a gift three years in the making.', 'Isaac'); }, { cond: () => G.flag('contigo_reunion') && !G.flag('ship_wings') }); },
    npcs: [{ id: 'con_009', x: 3, y: 4, type: 'elder_m', name: 'Old Man', text: "The siblings who inherited the powers of the Anemos aren't in Contigo anymore. The younger brother was just a baby when the merchant known as Hammet took him away.", mind: '(The families of children who inherited those powers lived lives of constant suffering. Eventually, they left Contigo to make their fortunes elsewhere.)' },
      { id: 'con_010', x: 8, y: 5, type: 'villager_f', name: 'Woman', text: "I'm sure the younger brother, Ivan, must be grown up by now... Is he still with Hammet?", mind: '(Ivan\'s mother left him in the care of a kindly merchant. She died shortly afterward. I think she died of sorrow at sending Ivan away. She wanted a better life for him.)' }] });
  Kit.home('contigo_house2', { name: 'Home', wall: 'wall_plaster', back: { map: 'contigo', x: 21, y: 15 },
    npcs: [{ id: 'con_011', x: 4, y: 5, type: 'child_m', name: 'Boy', text: "My father doesn't approve of the way I look up to Yegelos.", mind: '(I wish I could have inherited the power of the Anemos. Then I could be a hero.)' },
      { id: 'con_012', x: 8, y: 4, type: 'villager_m', name: 'Man', text: "Long ago, the people of Hesperia attacked Atteka. Our forefathers were not afraid. With the help of the great hero Yegelos, we drove them off, and they haven't invaded since.", mind: '(For a long time now, Contigo has been without a hero. This depresses our youth, I think.)' }] });
  Kit.home('contigo_house3', { name: 'Home', wall: 'wall_plaster', back: { map: 'contigo', x: 25, y: 15 }, furn: [['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['shelf', 2, 2], ['shelf', 9, 2], ['pot', 10, 7]],
    npcs: [{ id: 'con_013', x: 3, y: 5, type: 'elder_m', name: 'Old Man', text: 'A long time ago, the tribes of Shaman and Contigo were at constant war. Throughout their many battles, the warriors Yegelos and Hoabna formed a friendship.', mind: "(Everybody thinks the people of Contigo are strong, but we just hate to fight. It's strange, because Yegelos loved to fight, and Hoabna was the stronger of the two.)" },
      { id: 'con_030', x: 8, y: 6, type: 'scholar', name: 'Man', text: 'The merchant Hammet took the gold in this room with him when he left Contigo. He vowed to use the money to raise Ivan properly and give him a good life.', mind: '(Someone told me that Hammet went to a town called Kalay and did quite well for himself.)' }] });
  Kit.home('contigo_house4', { name: 'Home', wall: 'wall_plaster', back: { map: 'contigo', x: 13, y: 31 }, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['table', 6, 4], ['pot', 10, 7], ['shelf', 4, 2], ['fireplace', 8, 1]],
    npcs: [{ id: 'con_018', x: 3, y: 5, type: 'villager_f', name: 'Woman', text: 'Soon, the siblings with the power of the Anemos will return and fulfill the legend.', mind: "(I just know Ivan became big and manly, just like Yegelos. I know he'll return...)" },
      { id: 'con_019', x: 8, y: 5, type: 'villager_m', name: 'Man', text: 'The power of the Anemos is all but gone in Contigo. However, it sometimes happens that a newborn suddenly shows power over the wind.', mind: "(A terrible misfortune fell on the family of the siblings... It's a terrible story.)" },
      { id: 'con_020', x: 5, y: 3, type: 'child_f', name: 'Girl', text: "I don't have any powers like the Anemos did, but my sister, Ahri, is different.", mind: '(Whenever my sister furrows her brow like that, strange things happen around here.)' },
      { id: 'con_ahri', x: 6, y: 2, type: 'child_f', name: 'Ahri', dir: DIR.DOWN, script: function* (E) { yield E.say("(The baby's forehead is furrowed, like it's thinking.)"); Audio.sfx('wind'); Engine.doShake(4); yield E.say('(A small gust of wind blows through the house!)'); yield E.say('Babu bawaba bibaw.', 'Ahri'); yield E.say('It sure is drafty in this shabby old house.', 'Woman'); yield E.say("When the Wings of Anemos are complete, let's fix the house!", 'Man'); }, mind: "(Bawaba... It's hot... I want cool wind, babu baba.)" }] });
  Kit.inn('contigo_inn', { name: 'Contigo Inn', price: 80, w: 14, h: 11, wall: 'wall_plaster', back: { map: 'contigo', x: 7, y: 22 },
    build(M) { const k = M.npcs.find(n => n.id === 'contigo_inn_keeper'); if (k) { k.name = 'Innkeeper'; k.text = "We've had so many people coming to Contigo lately that we're full, and I'm beat!"; k.mind = "(It's good to have this much business, but what happens to us when the wings are done?)"; }
      M.npc('con_inn2', 6, 2, { type: 'villager_f', name: 'Innkeeper', text: 'All the work on the wings means that our inn is always full! It\'s a good time for us!', mind: "(Once the wings are finished, all these guests will leave. Until then, I'll work my hardest.)" });
      M.setObj(9, 5, 'table'); M.setObj(10, 5, 'table'); M.npc('con_chef', 10, 4, { type: 'merchant', name: 'Chef', dir: DIR.DOWN, text: "If I don't make dinner now, it won't be ready in time for all our guests to eat!", mind: "(I must be the greatest chef in the world! Look at all this food I've been making! I'm amazing!)" });
      M.npc('con_maid', 3, 7, { type: 'villager_f', name: 'Employee', move: 'wander', text: "Gotta make all the beds before everyone returns from Anemos Sanctum... Then, I've gotta get started setting things up for dinner before they come down to eat!", mind: "(I've got so much to do that I don't even have time to eat! I'm starving!!!)" }); } });
  Kit.shop('contigo_itemshop', { name: 'Contigo Item Shop', shop: 'contigo_item', wall: 'wall_plaster', back: { map: 'contigo', x: 9, y: 31 }, doorX: 6,
    build(M) { M.npc('con_014', 2, 5, { type: 'villager_m', name: 'Man', text: 'The prophecies of the Anemos tell that someday soon, a true miracle will occur...', mind: "(The Wings of Anemos are nearly complete... I think I'll take tomorrow off.)" }); } });
  Kit.shop('contigo_weaponshop', { name: 'Contigo Armory', shop: 'contigo_weapon', wall: 'wall_plaster', back: { map: 'contigo', x: 23, y: 23 }, doorX: 6,
    build(M) { M.npc('con_015', 9, 5, { type: 'villager_m', name: 'Man', text: 'Did you just arrive in Contigo? Are you connected to the prophecy, or are you here to help build the wings?', mind: "(I worked myself half to death yesterday. I feel miserable, but I'll do it again tomorrow.)" }); } });
  Kit.sanctum('contigo_sanctum', { name: 'Contigo Sanctum', wall: 'wall_plaster', back: { map: 'contigo', x: 3, y: 31 }, doorX: 6,
    build(M) { const p = M.npcs.find(n => n.id === 'contigo_sanctum_priest'); if (p) { p.name = 'Great Healer'; p.text = 'The real miracle will be if these wings actually make a boat fly. However, I remain open-minded. I hope we can see this miracle of Anemos soon!'; p.mind = '(If I see the Wings of Anemos make a boat fly through the air, I too shall be a believer.)'; } } });
  // ---- the tents: Lucky Wheels (Tolbi's game, for Game Tickets) and the dice tables (Lucky Dice, and the four-dice Hi-Lo game) ----
  Kit.interior('contigo_lucky', { name: 'Lucky Wheels', w: 11, h: 8, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'contigo', x: 12, y: 23 }, doorX: 5, furn: [['counter', 3, 3], ['counter', 4, 3], ['counter', 5, 3], ['counter', 6, 3], ['counter', 7, 3], ['shelf', 2, 2], ['shelf', 8, 2]],
    npcs: [{ id: 'contigo_game_master', x: 5, y: 2, type: 'merchant', name: 'Game Master', dir: DIR.DOWN, script: STORY.luckyWheel }],
    build(M) { M.sign(1, 4, 'Lucky Wheels: three reels, one Game Ticket a pull. Boots, shirts, rings - or the moon, which is anything. Prizes never repeat.'); } });
  Kit.interior('contigo_dice', { name: 'Lucky Dice', w: 9, h: 8, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'contigo', x: 15, y: 23 }, doorX: 4, furn: [['table', 2, 3], ['table', 6, 3], ['pot', 7, 6]],
    npcs: [{ id: 'contigo_dice_master', x: 2, y: 2, type: 'merchant', name: 'Dice Master', dir: DIR.DOWN, script: STORY.luckyDice }, { id: 'contigo_superdice', x: 6, y: 2, type: 'pirate', name: 'Hi-Lo Master', dir: DIR.DOWN, script: T3.superDice }] });
  // Super Lucky Dice: four dice, and a run of Hi-Lo guesses that doubles the pot on every right call, five at most
  T3.superDice = function* (E) {
    const coins = G.party.coins; if (coins < 50) { yield E.say('Four dice, and then the Hi-Lo game if they show you anything better than a pair. Two of a kind gives your stake back, three alike doubles it, two pair triples it, four alike pays eight times - and every right Hi-Lo call doubles the pot again, five calls at most. Fifty coins to sit.', 'Hi-Lo Master'); return; }
    const bets = [50, 100, 200, 500, 1000].filter(b => b <= coins); const opts = bets.map(b => b + ' coins').concat(['Leave']);
    const c = yield* E.ask('Super Lucky Dice! Four dice, then Hi-Lo. Your stake?', 'Hi-Lo Master', opts); if (c < 0 || c >= bets.length) return;
    const bet = bets[c]; G.party.coins -= bet;
    const dice = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6)); const counts = {}; for (const d of dice) counts[d] = (counts[d] || 0) + 1;
    const groups = Object.values(counts).sort((a, b) => b - a);
    const mult = groups[0] === 4 ? 8 : (groups[0] === 2 && groups[1] === 2) ? 3 : groups[0] === 3 ? 2 : groups[0] === 2 ? 1 : 0;
    const name = mult === 8 ? 'Four of a kind!!!' : mult === 3 ? 'Two pair!' : mult === 2 ? 'Three of a kind!' : mult === 1 ? 'Two of a kind.' : 'Nothing...';
    Audio.sfx('cursor'); yield E.say('(The four dice tumble: ' + dice.join(' - ') + ')   ' + name, 'Hi-Lo Master');
    if (!mult) { yield E.say('The house keeps ' + bet + ' coins. Another throw?', 'Hi-Lo Master'); return; }
    let pot = bet * mult;
    if (mult === 1) { G.party.coins += pot; yield E.say('Your stake back. Better than a pair gets you the Hi-Lo game.', 'Hi-Lo Master'); return; }
    let cur = dice.reduce((a, b) => a + b, 0);
    for (let n = 0; n < 5; n++) {
      const g = yield* E.ask('The pot is ' + pot + ' coins; the dice showed ' + cur + '. The next throw of four: higher or lower?', 'Hi-Lo Master', ['Higher', 'Lower', 'Take the pot']);
      if (g !== 0 && g !== 1) break;
      const next = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6)).reduce((a, b) => a + b, 0);
      yield E.say('(The dice tumble again... ' + next + '.)', 'Hi-Lo Master');
      if (next === cur || (g === 0 ? next < cur : next > cur)) { yield E.say('Wrong call! The pot is the house\'s. Come back with more coins!', 'Hi-Lo Master'); return; }
      pot *= 2; cur = next; yield E.say('Right! The pot doubles: ' + pot + ' coins.', 'Hi-Lo Master');
    }
    G.party.coins += pot; Audio.sfx('item'); yield E.say('Paid out: ' + pot + ' coins!', 'Hi-Lo Master');
  };
}
