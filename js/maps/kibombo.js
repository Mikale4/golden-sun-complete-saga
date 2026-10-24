// ---------- Kibombo ----------
// After map references/golden-sun-the-lost-age-kibombo-gba-map.webp (the village's two screens, day and night),
// condensed to one map: the huts round their clearing at the south, the plaza before the Great Gabomba at the
// north, the ledge along the west cliff. Per the guide and the script: it is night, the whole village packed before
// the statue for Akafubu's ceremony; the way to the plaza is blocked by the crowd, so Lash on the rope in the
// lower left corner, up the ledge and over the poles to the cliff above the statue, where the ceremony is watched
// and Piers found; Move on the stump across the gap for the way to the statue's back; Piers joins; Scoop on the
// marked patch behind the statue for the ventilation shaft into it. After the Gabomba has spoken and the message
// is carried to Akafubu's hut, dawn: the crowd gone, the tongue out for the way in, the Frost Wand in the armory.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'grass', 'd': 'dirt', 's': 'sand', 'm': 'marble', 'p': 'pit', 'y': 'sand_puddle',
    't': { ground: 'grass', obj: 'palm' }, 'b': { ground: 'grass', obj: 'bush' }, 'P': { ground: 'grass', obj: 'totem' }, 'T': { ground: 'grass', obj: 'torch' }, 'o': { ground: 'grass', obj: 'rock_small' }
  };
  const done = () => !!G.flag('gabomba_done');
  const K = grid(30, 44, '.');
  fill(K, 0, 0, 29, 0, 'R'); fill(K, 0, 1, 0, 43, 'R'); fill(K, 29, 1, 29, 43, 'R'); fill(K, 0, 43, 29, 43, 'R'); fill(K, 14, 43, 15, 43, 'd');   // the rock all round, the way in at the bottom
  fill(K, 4, 2, 4, 36, 'R'); K[7][4] = 'p';   // the cliff between the west ledge and the village; the gap at the viewpoint
  fill(K, 1, 37, 3, 39, 'R');   // the rock under the ledge's south end: the rope goes up it
  fill(K, 5, 1, 28, 2, 'R'); fill(K, 11, 2, 18, 8, 'm'); fill(K, 5, 3, 10, 8, 's');   // the rock behind the plaza, the statue's dais, the sand behind the statue
  K[4][9] = 'y';   // the marked patch: the vent shaft under it
  fill(K, 12, 9, 17, 19, 'd'); fill(K, 6, 12, 23, 19, 'd');   // the beaten ground before the statue where the village dances
  fill(K, 5, 20, 24, 22, 'R'); fill(K, 14, 20, 15, 22, 'd'); fill(K, 13, 23, 16, 25, 'd'); fill(K, 14, 26, 15, 42, 'd');   // the neck between the plaza and the huts, two wide, where the warriors stand; the way down to the huts
  for (const [x, y] of [[6, 10], [24, 10], [7, 21], [23, 21], [8, 24], [22, 24], [3, 42], [26, 42], [27, 28], [6, 41], [24, 41], [12, 30], [18, 30]]) K[y][x] = 't';
  for (const [x, y] of [[9, 9], [21, 9], [10, 19], [20, 19], [11, 24], [19, 24], [4, 38], [26, 38], [7, 41], [23, 41]]) K[y][x] = 'P';
  for (const [x, y] of [[10, 5], [19, 5], [8, 15], [22, 15]]) K[y][x] = 'T';
  for (const [x, y] of [[2, 34], [2, 30], [2, 27]]) K[y][x] = 'P';   // the poles on the ledge, hopped over
  defineMap('kibombo', {
    name: 'Kibombo', w: 30, h: 44, base: 'grass', music: 'desert', bg: 'grass', entry: { x: 14, y: 42 }, night: () => !done(),
    build(M) {
      M.paint(0, 0, strs(K), LEG, { cliff: 'R', set: 'brownrock', faces: 2 });
      for (let y = 0; y < 44; y++) for (let x = 0; x < 30; x++) if (K[y][x] === 'P' && !(x === 2 && y >= 27)) M.setObj(x, y - 1, 'totem_top');
      M.exit(14, 43, 2, 1, 'world_tla', 125, 154, DIR.DOWN);
      // the Great Gabomba on its dais: the face, the torches, the mouth that is the way in once its tongue is out
      M.setObj(14, 3, 'gab_tl'); M.setObj(15, 3, 'gab_tr'); M.setObj(14, 4, 'gab_bl'); M.setObj(15, 4, 'gab_br');
      for (const [x, y] of [[12, 3], [17, 3], [12, 6], [17, 6]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      M.setObj(14, 5, done() ? 'lc_door' : 'statue'); M.setObj(15, 5, done() ? 'lc_door' : 'statue'); if (done()) M.exit(14, 5, 2, 1, 'gabomba', 8, 11, DIR.UP, { door: true });
      M.sign(16, 8, 'The Great Gabomba. It is said its mouth opens for the one it accepts as witch doctor.');
      // the huts: Akafubu's, the inn, the item shop, the home with the jar, the armory, the second home
      M.house(5, 26, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_akafubu', tx: 5, ty: 7, windows: false, doorX: 2 });
      M.house(19, 26, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false, doorX: 2 });
      M.house(23, 31, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_itemshop', tx: 6, ty: 6, sign: 'shop_sign', windows: false, doorX: 2 });
      M.house(3, 32, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_house1', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(9, 36, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false, doorX: 2 });
      M.house(17, 36, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'kibombo_house2', tx: 6, ty: 8, windows: false, doorX: 2 });
      if (!done()) for (const [x, y] of [[4, 30], [10, 30], [18, 30], [22, 36], [8, 40], [16, 40], [22, 40]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
      // the rope at the lower left corner, up to the ledge; the poles along it are hopped
      M.object('rope', 2, 39, { id: 'kib_rope', len: 3 });
      for (const y of [34, 30, 27]) M.object('hop', 2, y, { id: 'kib_pole' + y });
      // the cliff above the statue: the ceremony seen from here, Piers found here; the stump across the gap
      M.trigger(1, 6, 3, 3, T3.kibomboCeremony, { once: 'kib_ceremony_seen' });
      M.object('pillar', 5, 7, { id: 'kib_stump', tile: 'stump', onMove: function* (E) { if (!G.flag('kib_stump_down')) { G.set('kib_stump_down'); yield* T3.kibomboPiersJoins(E); } } });
      M.npc('PiersK', 2, 6, { look: CHARACTERS.Piers.look, name: 'Piers', dir: DIR.RIGHT, showIf: 'kib_ceremony_seen', hideIf: 'piers_joined', text: 'The orb is right before me, and yet I cannot reach it...', mind: "(I am certain I just sensed the power of Psynergy, but that can't possibly be...)" });
      // the marked patch behind the statue: Scoop, and the shaft down into the Gabomba
      M.object('scoop', 9, 4, { id: 'kib_dig', hole: true, look: 'sand_puddle', onScoop: function* (E) { yield E.say('The sand goes down into the dark, and warm air comes up out of it: a shaft, and it runs under the statue.'); yield E.say('A ventilation shaft. Into the Great Gabomba itself, I should think. After you, Felix.', 'Kraden'); } });
      M.exit(9, 4, 1, 1, 'kibombo_vent', 2, 9, DIR.DOWN, { cond: () => G.flag('obj:kibombo:scoop:kib_dig:open') });
      M.trigger(6, 5, 4, 3, function* (E) { yield E.say("Behind the Gabomba. A dead end... but look at the ground here, Felix. Those markings.", 'Kraden'); yield E.say('Sand, softer than the rest, and marked. Something is under it.', 'Sheba'); }, { once: 'kib_back_seen', cond: () => G.flag('piers_joined') });
      // the village: the crowd before the statue while the ceremony runs, the folk about afterwards
      const crowd = [[13, 12, 'tribal', "Hey, no pushing! You're not going to get any closer, with all these people packed in here.", "(There are so many people here! If I want to see the ceremony, I'll have to climb the posts!)"], [16, 12, 'tribal_f', "If the Great Gabomba likes the jewel, his mouth will open and his tongue will stick out. It sounds weird, but it's a sign that the Gabomba accepts the offering.", '(If the Great Gabomba actually moves and sticks out his tongue... I might just faint!)'],
        [10, 14, 'tribal', 'Is making the jewel float with the power of his mind all there is to it? I would have thought a ceremony like this would have required a little more effort.', "(He's failed so many times already... Won't the same thing happen again if he tries it another time?)"], [19, 14, 'tribal_f', 'I hope the Great Gabomba is satisfied by Akafubu\'s jewel and opens his mouth this time.', '(If the Great Gabomba opens his mouth, he will have acknowledged Akafubu\'s power. When the Great Gabomba accepts the jewel, the door will open.)'],
        [12, 16, 'tribal', 'Akafubu looks really confident tonight. I think he just might succeed this time!', '(He travels to Madra and returns with a stolen gem, and now he expects us to call him a hero?)'], [17, 16, 'tribal', 'He who is the witch doctor of Kibombo holds the most revered office in our whole town.', '(If only Oeia had taught his magic to someone else... If he had another pupil, this would go more easily on poor Akafubu. He would not be alone.)'],
        [8, 17, 'tribal_f', 'Akafubu has tried this before, but he has always failed. Tonight is different, though. With this new gem, he may succeed.', '(As a child, Akafubu was every bit as horrible. He always cried when he had to share his toys. When he was good, he was very, very good... but when he was bad, he was AWFUL.)'], [21, 17, 'tribal', 'During the last ceremony, Akafubu made the jewel float in the air... But the mouth of the Great Gabomba did not open.', '(The Great Gabomba is supposed to open his mouth if Akafubu is worthy.)'],
        [14, 18, 'tribal', "This isn't a bad way to spend an evening, when you get right down to it. I could dance all night and all day tomorrow, too.", '(Sure, this is fun, but my feet hurt! I never want to hear an irresistible dance beat again!)'], [15, 19, 'tribal_f', 'It is proper for a warrior to be a man of few words. It is the fearful dog who barks the loudest.', '(*Koff! Koff!* All this chanting is making my throat hurt! No more singing in the shower for me.)']];
      crowd.forEach(([x, y, type, text, mind], i) => M.npc('kib_crowd' + i, x, y, { type, dir: DIR.UP, text, mind, hideIf: 'gabomba_done' }));
      M.npc('kib_guardA', 14, 21, { type: 'tribal', name: 'Warrior', dir: DIR.DOWN, hideIf: 'gabomba_done', text: "It seems these beasts want to pass through... Can't you see we are in the midst of our ceremony!? None shall pass until it is complete!", mind: "(Look at these guys. They think they're so hot... I bet they think they're gonna get past me... They have no idea how long I can stand here, saying the same thing to them, over and over.)" });
      M.npc('kib_guardB', 15, 21, { type: 'tribal', name: 'Warrior', dir: DIR.DOWN, hideIf: 'gabomba_done', text: 'Men or gods, we fear you not! The Kibombo fear nothing!', mind: '(What if the Great Gabomba only opened its mouth to lure Akafubu in and... crush him like a grape!)' });
      M.npc('kib_akafubuP', 14, 9, { look: NPC_LOOKS.Akafubu, name: 'Akafubu', dir: DIR.UP, hideIf: 'kib_ceremony_seen', text: 'At last, the sacred night has come! Tonight, Akafubu becomes the Kibombo\'s new witch doctor!' });
      M.npc('kib_akafubuC', 14, 9, { look: NPC_LOOKS.Akafubu, name: 'Akafubu', dir: DIR.UP, showIf: 'kib_ceremony_seen', hideIf: 'gab_ceremony_done', text: 'Your prayers were weak! Open your hearts to the Great Gabomba! Sing your praises and dance for the Great Gabomba until your prayers reach his ears!' });
      M.npc('kib_001', 14, 24, { type: 'elder_m', dir: DIR.DOWN, text: () => done() ? "They say the Great Gabomba's great jaw finally opened. I wish I could have gone up front and got a better view." : "Akafubu sees the future... That's how he knew to find the jewel in Madra.", mind: () => done() ? "(They're saying the Great Gabomba opened his mouth, but I'll just have to take their word for it.)" : '(I really wonder how accurate Akafubu\'s farsight is. If his skills were stronger, he should be able to prophesy the outcome of this ceremony.)' });
      M.npc('kib_002', 12, 33, { type: 'child_m', move: 'wander', text: () => done() ? 'Whew! Thank goodness those drums have stopped. They were rattling my brain!' : "They told me I had to stay awake until the ceremony's over. Usually, they tell me I have to go to bed early! Make up your minds already!", mind: () => done() ? "(Am I going to have to play drums all night? Can't they just... dance without them?)" : "(As long as this ceremony's going on, I get to stay up! Normally, I get in trouble for trying to stay up this late.)" });
      M.npc('kib_003', 24, 28, { type: 'tribal_f', move: 'wander', text: () => done() ? 'Once the ceremony is complete, Kibombo will be like a village reborn. Peace will come again.' : "Akafubu's ceremony is set to begin soon. I wonder if he'll succeed this time.", mind: () => done() ? '(Kibombo was so much better when Oeia was our leader. I wish we could return to that life once again...)' : "(It's strange that Akafubu decided to try again tonight. What bolstered his confidence?)" });
      M.npc('kib_004', 8, 34, { type: 'tribal', dir: DIR.RIGHT, text: () => done() ? "Oeia's death was so sudden. It's been hard on Akafubu." : 'Akafubu was a good man when he was training with Oeia... After Oeia died, Akafubu was simply no longer the same.', mind: () => done() ? '(I suspect Akafubu never really wanted to become the Kibombo witch doctor. Poor boy.)' : '(Akafubu has not yet attained the magical skill that Oeia possessed. I worry for our future if Akafubu\'s character is as weak as his magic.)' });
      M.npc('kib_healer', 22, 33, { type: 'monk', name: 'Healer', dir: DIR.LEFT, sanctum: true, text: "Oh... Oh my... I've heard of ceremonies like these... Foreign deities are so frightening...", mind: '(I wonder if a man in my position should really be in a place like this.)' });
      M.sign(16, 41, 'Kibombo. The Great Gabomba stands at the north end of the village.');
      M.trigger(13, 41, 4, 2, function* (E) { yield E.say('Kibombo... and it is night. Torches at every door, and drums. Every soul in the village is up at the north end.', 'Kraden'); yield E.say("Akafubu's ceremony. Piers will be up there somewhere - we have to get through that crowd.", 'Jenna'); }, { once: 'kibombo_seen', cond: () => !done() });
    }
  });
  // the ceremony, watched from the cliff; Piers is there already
  T3.kibomboCeremony = function* (E) {
    yield E.say('At last, the sacred night has come!', 'Akafubu');
    yield E.say('The jewel from Madra, the black orb off Piers\'s ship, has been set in the Gabomba\'s hands below.');
    yield E.say("Tonight, Akafubu becomes the Kibombo's new witch doctor! All of you, pray in the depths of your hearts for my success!", 'Akafubu');
    yield E.say("It looks like the initiation ceremony is beginning. I'm not sure what will happen, but we'd better hurry, Felix.", 'Kraden');
    const p = E.field.npcs.find(n => n.id === 'PiersK'); if (p) p.hidden = false;
    yield E.say('Wh-Who are you?!? What... What are your intentions?', 'Piers');
    yield E.say('It looks like Piers has already forgotten us, huh?', 'Sheba');
    yield E.say("I know! We met Piers when he was in JAIL! And it's not like he had lots of visitors, either!", 'Jenna');
    yield E.say("Wait a second... I know you... You're the travelers who came seeking me when I was in jail.", 'Piers');
    yield E.say('So, you DO remember!', 'Kraden'); yield E.say('What are you doing in this place?', 'Piers'); yield E.say("Actually, that's what we wanted to ask you...", 'Sheba');
    yield E.say('We were worried about you, Piers, so we followed you here...', 'Jenna'); yield E.say("And that's what brings you to this dangerous place? Tell me something... Exactly when did I ask you for your help?", 'Piers');
    yield E.say('SILENCE! I shall now present our jewel to the Great Gabomba!', 'Akafubu');
    Engine.doFlash(10, '#c0d0ff'); yield 20; yield E.say('Akafubu raises the jewel into the air with the power of his mind.'); yield E.say('!!!', 'Piers');
    yield E.say('O Great Gabomba! Please accept this, our humble gift! Please, Great Gabomba! Accept this jewel!', 'Akafubu');
    yield E.say('The Gabomba opens its eyes... and shuts them again.'); yield E.say('Why, Great Gabomba?', 'Akafubu');
    yield E.say('Your prayers were weak! Open your hearts to the Great Gabomba! Sing your praises and dance for the Great Gabomba until your prayers reach his ears!', 'Akafubu');
    yield E.say("Akafubu is no witch doctor! He's an Adept! I may have to confront him to get my orb back... I will do whatever it takes, but I will have my black orb back again.", 'Piers');
    yield E.say("It's no use. We can't get to Akafubu from here. This won't work, either... What are we going to do? We can't get over there!", 'Piers');
    yield E.say("Piers is in trouble. Shouldn't we try to help him?", 'Jenna');
    yield E.say("Two ledges, and a gap between them... and a stump on the far one, out of reach. Maybe if we could do something about that stump, we could reach the backside of Gabomba. We've got to help Piers. Right, Felix?", 'Kraden');
    yield E.say('Then hop to it!', 'Kraden');
  };
  // the stump dropped into the gap by Move: Piers knows Psynergy when he sees it, and joins
  T3.kibomboPiersJoins = function* (E) {
    yield E.say('?!? That power... Was that Psynergy?', 'Piers'); yield E.say("I knew it! I should have spotted it at once! You're Adepts!", 'Piers');
    yield E.say("Wait, so does that mean you're--", 'Jenna'); yield E.say('Yes, my name is Piers, and I too am an Adept. To be honest, everyone in Lemuria is an Adept, and not just me.', 'Piers');
    yield E.say("What's Lemuria?", 'Sheba'); yield E.say('Lemuria is an island that lies in the center of the Eastern Sea.', 'Piers');
    yield E.say("Wait a second... You said Lemuria? I've heard that name before... Of course! It was Lord Babi! He often spoke to me of Lemuria. He said it was so advanced that we can scarcely begin to imagine what it must have been like...", 'Kraden');
    yield E.say('You are correct. My home was and is all that you say. Whoever told you this knows much of Lemuria.', 'Piers');
    yield E.say("Babi... I've heard that name somewhere before... Ah, yes! A man named Babi came to Lemuria long ago... He stole one of our ships and fled the isle...", 'Piers');
    yield E.say('If what Babi told me is true, Lemuria is all that remains of a once great civilization. Babi believed that, in Lemuria alone, the power of Alchemy remains unbound.', 'Kraden');
    yield E.say('The waters around Lemuria are wrapped in a perpetual fog... and the currents are swift and treacherous. Only one who can sail a Lemurian ship can complete the journey - and Lemurian ships can only be helmed by Adepts. Which is why I have to get my black orb back! I must be able to captain my ship!', 'Piers');
    yield E.say('Wait a moment, Piers... We want to help you get your orb back. I am on this quest for many reasons... one of them being that I wish to see Lemuria.', 'Kraden');
    yield E.say('I appreciate your offer, but...', 'Piers'); yield E.say("I understand, Piers... You're not sure if you'll be able to take us to Lemuria, is that it?", 'Jenna');
    yield E.say("Can't we talk about this later?", 'Sheba'); yield E.say("Yes, yes, of course! For now, let's just get that orb back for Piers!", 'Kraden');
    const p = E.field.npcs.find(n => n.id === 'PiersK'); if (p) p.hidden = true;
    yield E.join('Piers', Math.max(15, G.party.leader.level + 1), { djinn: ['Spring', 'Shade'], equip: { weapon: 'Long Sword', body: 'Chain Mail', arm: 'Iron Shield' } });
    G.set('piers_joined'); yield E.say('Piers joined your party.'); Audio.sfx('item');
    yield E.say("Now that I know the orb is here, I won't leave this village without it! There is a way behind the statue - let's go.", 'Piers');
  };
  // Akafubu's hut: the message from the Gabomba carried to him, and dawn
  Kit.interior('kibombo_akafubu', { name: "Akafubu's Hut", w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'kibombo', x: 7, y: 31 }, furn: [['table', 5, 3], ['torch', 1, 1], ['torch', 9, 1], ['pot', 9, 6], ['bookshelf', 2, 2], ['bed', 8, 2], ['bed_foot', 8, 3]],
    npcs: [{ id: 'AkafubuF', x: 4, y: 3, type: 'elder_m', name: "Akafubu's Father", dir: DIR.DOWN, text: () => G.flag('gabomba_done') ? 'You are virtuous men, coming here to deliver this message. My son and I thank you.' : 'My son is at the Great Gabomba. Tonight he tries the ceremony again.', mind: '(He may look like a man, but before me, he acts like a child. No matter what I say, he won\'t listen to me right now.)' },
      { id: 'Akafubu', x: 6, y: 4, look: NPC_LOOKS.Akafubu, name: 'Akafubu', dir: DIR.DOWN, showIf: 'black_orb_got', text: "But, Father! These people are trying to steal the magic of our people! It should be mine! Mine, I tell you! That power belongs to me! I'm going to be the one to get the Great Gabomba's magic! You'll see!", mind: '(Oeia... What am I to do now?)' }],
    build(M) { M.trigger(3, 4, 5, 4, T3.kibomboMessage, { once: 'gabomba_done', cond: () => G.flag('black_orb_got') }); } });
  T3.kibomboMessage = function* (E) {
    yield E.say('Felix carried the message of the Gabomba to Akafubu. By the time Felix finished his story, dawn had broken.');
    yield E.say("Right... Well, I guess that's that!", 'Kraden');
    yield E.say('You are virtuous men, coming here to deliver this message. My son and I thank you.', "Akafubu's Father");
    yield E.say("What do we have to be thankful of? If they had just stopped me from leaving the Great Gabomba, this wouldn't have happened!", 'Akafubu');
    yield E.say('What!? If you had been more interested in your duty, you would not have left so quickly...', "Akafubu's Father");
    yield E.say("But, Father! These people are trying to steal the magic of our people! It should be mine! Mine, I tell you! That power belongs to me! I'm going to be the one to get the Great Gabomba's magic! You'll see!", 'Akafubu');
    yield E.say('My son, you have much to learn. He may look like a man, but before me, he acts like a child. I think he has had enough for today...', "Akafubu's Father");
    yield E.say('I see your point. Well! I suppose we should be leaving then. After all, our journey has only just begun. We cannot remain idle much longer.', 'Kraden');
    Engine.doFlash(20, '#fff0c0'); yield E.say('Day breaks over Kibombo. The drums are silent; the village sleeps at last.');
  };
  Kit.inn('kibombo_inn', { name: 'Kibombo Inn', price: 48, back: { map: 'kibombo', x: 21, y: 31 } });
  Kit.shop('kibombo_itemshop', { name: 'Kibombo Item Shop', shop: 'kibombo_item', back: { map: 'kibombo', x: 25, y: 36 } });
  Kit.shop('kibombo_weaponshop', { name: 'Kibombo Armory', shop: 'kibombo_weapon', back: { map: 'kibombo', x: 11, y: 41 } });
  Kit.home('kibombo_house1', { back: { map: 'kibombo', x: 5, y: 37 }, npcs: [{ id: 'kh1', x: 5, y: 5, type: 'tribal_f', text: 'I believe in Akafubu. I believe he will surpass Oeia and become a great witch doctor.', mind: '(Akafubu and Oeia are so different... How can he ever hope to replace Oeia? Ah, why did Oeia have to die? What are we to do?)' }] });
  Kit.home('kibombo_house2', { back: { map: 'kibombo', x: 19, y: 41 }, npcs: [{ id: 'kh2', x: 5, y: 5, type: 'tribal', text: "Beyond the Kibombo Mountains lies Naribwe. The pass is guarded, but a hidden path climbs the cliffs." }] });
  // the ventilation shaft under the marked sand: a crooked brown maze up into the statue
  const V = grid(20, 12, 'R');
  fill(V, 2, 9, 2, 10, '.'); fill(V, 2, 7, 8, 8, '.'); fill(V, 7, 3, 8, 6, '.'); fill(V, 7, 2, 14, 3, '.'); fill(V, 13, 4, 14, 9, '.'); fill(V, 13, 9, 17, 10, '.'); fill(V, 16, 2, 17, 8, '.');
  defineMap('kibombo_vent', {
    name: 'Kibombo - Ventilation Shaft', w: 20, h: 12, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 2, y: 9 }, retreat: { map: 'kibombo', x: 14, y: 12, dir: DIR.DOWN },
    build(M) { M.paint(0, 0, strs(V), Object.assign({}, LEG, { '.': 'cave_sand' }), { cliff: 'R', set: 'brownrock', faces: 1 });
      M.setObj(2, 10, 'ladder'); M.walkable(2, 10); M.exit(2, 10, 1, 1, 'kibombo', 9, 5, DIR.DOWN, { stairs: true });
      M.setObj(17, 2, 'ladder'); M.walkable(17, 2); M.exit(17, 2, 1, 1, 'gabomba', 3, 9, DIR.UP, { stairs: true });
      M.sign(8, 3, 'The air moves up the shaft, warm and slow. Something breathes above.'); }
  });
}
