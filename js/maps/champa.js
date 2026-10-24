// ---------- Champa ----------
// After map references/golden-sun-the-lost-age-champa-gba-map.webp, condensed: the poor harbour town on the eastern
// edge of Angara - the canal down the west side and the rafts the poorest live on (the tightrope to the first
// raft, the Smoke Bomb in its box), the thatched houses (the inn with the Elixir, the item shop, two homes, the
// sanctum with the 12 coins outside), the six graves to the east (Reveal shows the Viking Helm), and the yellow
// cliff the sailors live in: the lower cave door, the caves stacked up three levels (the girls' rooms, the Sleep
// Bomb in the rightmost room, the balcony out onto the highest ledge with the Lucky Medal jar) and Obaba's forge at
// the top. Story per the script: the hungry village before Briggs returns and Obaba who will see no one; then the
// crates of food and gems, the pirates who spot Felix at the cave door and run in with Briggs, the pirates in the
// caves, Obaba's Avimander out of the forge (one chance to leave), the reconciliation and Chaucha, Obaba keeping the
// prongs and forging the Trident from the three, and Alex, Karst and Agatio on the way out of town.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 180, y: 101, dir: DIR.DOWN };
  const after = () => G.flag('briggs_escaped');   // Briggs is home: the food, the gems, the pirates
  const T = (before, later) => () => { const v = after() ? later : before; return typeof v === 'function' ? v() : v; };
  const LEG = {
    '.': 'grass', 'p': 'path', 'w': 'water', 'k': 'dock', 'B': 'bridge', 'V': 'bridge_v', 's': 'sand', 'f': 'flowers',
    'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'G': { ground: 'grass', obj: 'gravestone' }, 'c': { ground: 'grass', obj: 'crate' }, 'j': { ground: 'grass', obj: 'pot' },
    'D': { ground: 'grass', obj: 'ak_door', walk: true }
  };
  const CLIFF = { cliff: '#', set: 'ankohl', faces: 2 };
  // ====================== the town ======================
  const A = grid(40, 42, '.');
  fill(A, 0, 0, 39, 0, 'T'); fill(A, 0, 0, 2, 24, 'T'); fill(A, 6, 0, 8, 0, 'T');
  fill(A, 3, 0, 5, 24, 'w'); fill(A, 0, 25, 15, 41, 'w'); fill(A, 16, 36, 39, 41, 'w');   // the canal, the harbour, the sea
  fill(A, 29, 0, 39, 35, '#');   // the cliff
  fill(A, 29, 26, 36, 27, '.'); fill(A, 31, 16, 38, 17, '.');   // the lower ledge, and the highest ledge (no way up to it from outside)
  A[25][32] = 'D'; A[15][35] = 'D';   // the cave doors
  fill(A, 27, 36, 28, 41, 'k'); fill(A, 6, 9, 6, 9, 'B'); fill(A, 3, 9, 5, 9, 'B'); fill(A, 3, 19, 5, 19, 'B');   // the pier out, the plank bridges over the canal
  fill(A, 8, 27, 13, 30, 'k'); fill(A, 2, 29, 5, 32, 'k'); A[28][14] = 'B'; A[28][15] = 'B'; A[30][6] = 'B'; A[30][7] = 'B';   // the rafts and the ropes to them
  fill(A, 12, 17, 13, 24, 'p'); fill(A, 8, 17, 27, 18, 'p'); fill(A, 12, 8, 13, 17, 'p'); fill(A, 8, 8, 27, 9, 'p'); fill(A, 24, 18, 25, 27, 'p'); fill(A, 16, 28, 27, 28, 'p'); fill(A, 27, 28, 28, 35, 'p');
  for (const [x, y] of [[7, 3], [26, 2], [8, 21], [22, 21], [17, 31], [21, 33], [9, 23], [16, 3], [23, 12]]) A[y][x] = 'T';
  for (const [x, y] of [[10, 20], [15, 22], [26, 21], [18, 30]]) A[y][x] = 'b';
  for (const [x, y] of [[19, 22], [21, 22], [23, 22], [19, 24], [21, 24], [23, 24]]) A[y][x] = 'G';   // the six graves
  for (const [x, y] of [[8, 11], [15, 11], [22, 11], [15, 20]]) A[y][x] = 'f';
  defineMap('champa', {
    name: 'Champa', w: 40, h: 42, base: 'grass', music: 'champa', bg: 'water', entry: { x: 27, y: 35 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(A), LEG, CLIFF);
      M.walkable(27, 40, 2, 2); M.exit(27, 41, 2, 1, 'world_tla', WORLD.x, WORLD.y, DIR.DOWN);
      M.exit(32, 25, 1, 1, 'champa_cliff_1', 10, 10, DIR.UP, { door: true }); M.exit(35, 15, 1, 1, 'champa_cliff_3', 20, 3, DIR.UP, { door: true });
      // the houses: the inn, the item shop, two homes, the sanctum; the tents on the rafts
      M.house(8, 3, 6, 5, 'roof_thatch', { wall: 'wall_mud', to: 'champa_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false, doorX: 3 });
      M.house(17, 4, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'champa_itemshop', tx: 6, ty: 6, sign: 'shop_sign', windows: false, doorX: 2 });
      M.house(23, 4, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'champa_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign', windows: false, doorX: 2 });
      M.house(7, 12, 5, 4, 'roof_thatch', { wall: 'wall_mud', to: 'champa_house3', tx: 6, ty: 8, windows: false, doorX: 2 });
      M.house(16, 12, 6, 4, 'roof_thatch', { wall: 'wall_mud', to: 'champa_house4', tx: 6, ty: 8, windows: false, doorX: 3 });
      M.house(8, 27, 3, 3, 'roof_thatch', { wall: 'wall_mud', to: 'champa_raft1', tx: 4, ty: 5, windows: false, doorX: 1 });
      M.house(2, 29, 3, 3, 'roof_thatch', { wall: 'wall_mud', to: 'champa_raft2', tx: 4, ty: 5, windows: false, doorX: 1 });
      // the Viking Helm under the graves, for Reveal
      M.chest(21, 23, 'Viking Helm', 1, { hidden: true });
      // Briggs's cargo, once he is home
      if (after()) { for (const [x, y] of [[27, 22], [28, 22], [27, 24], [28, 24], [26, 23]]) M.setObj(x, y, 'crate'); }
      // the people of Champa, hungry and then fed
      M.npc('cha_001', 14, 20, { type: 'villager_m', move: 'wander', text: T("Oh, I'm so hungry... And there won't be anything to eat until Briggs returns.", "Briggs came back with a giant load of food! I've never been so full! It feels great!"), mind: T('(Where could Briggs be wasting his time now?)', '(Briggs is so generous! He told me to eat and eat and eat, so I did!)') });
      M.npc('cha_002', 20, 30, { type: 'elder_m', text: T('How did you find your way here, to the edge of Angara? Champa is hidden by mountains. No one ever climbs over to see us, except for the monks of the Fuchin Temple.', "Let's see them call Champa poor now! Ever since Briggs came back with a cargo of gems, we've been filthy stinking rich!"), mind: T("(Champa is all alone on the eastern edge of Angara. That's why we took to the sea. We had to learn to fend for ourselves... That's why we are seafaring people today.)", '(Gosh... How much are all those jewels worth? More than I can figure, I know that.)') });
      M.npc('cha_003', 26, 25, { type: 'child_m', text: T("Eoleo, Briggs's son, has a really strange ability... I'll bet if I keep practicing, I'll be able to do it, too, so I'm giving it my all.", 'Those bags are full of food for the people of Champa. Briggs gave them to us.'), mind: T('(If I could pick up things without using my hands, life would be so much easier.)', "(All of our stockhouses are so full of food that they've just left the extra out here...)") });
      M.npc('cha_004', 10, 25, { type: 'child_f', text: T('Once Briggs comes back, I can play with Eoleo again... I hope they come back soon.', 'I want to play with Eoleo, but he never comes down to the harbor anymore.'), mind: T("(Eoleo's so much younger than I am, but I can't stop thinking about him... Is that... love?)", "(Eoleo said he couldn't play with us anymore, even though he's younger than we are...)") });
      M.npc('cha_005', 17, 22, { type: 'villager_f', text: T("When is Briggs going to return with food for the village? We can't wait much longer.", "Don't talk to me about food... I feel like I'm gonna be sick."), mind: T('(Briggs promised to bring enough food for the whole village.)', "(Errrrg... I was so full, and I just kept eating. I think I'm going to explode now.)") });
      M.npc('cha_006', 9, 19, { type: 'villager_m', script: function* (E) { if (!after()) { yield E.say('Champa is impoverished, but soon, we will prosper again. All our hopes rest on Briggs returning with a ship filled with treasures!'); return; } const y = yield* E.ask("Hey, you just came to Champa not too long ago, didn't you?", null, ['Yes', 'No']); yield E.say(y === 0 ? "You'll be pleased to know that Briggs found ancient pirate treasure and bought us all food!" : "Well, you wouldn't know it to look at us now, but Champa was quite poor until recently. Now, thanks to Briggs, we're all so wealthy, it's disgusting!"); }, mind: T('(I bet Briggs has already dug up his treasure and is on his way back home.)', "(Things are going to be different around here. Things are going to be better. I can't wait.)") });
      M.npc('cha_007', 22, 26, { type: 'elder_m', script: function* (E) { if (!after()) { const y = yield* E.ask("You've the look of a traveler about you... Have you been to Ankohl Ruins?", null, ['Yes', 'No']); yield E.say(y === 0 ? 'Only those who have mastered the powers of the earth can enter the ruins.' : "My mistake... These old eyes aren't what they used to be. Anyway, the ruins are just a little ways northeast of here. You should go see them."); return; } const y = yield* E.ask('Briggs took a long time to return to us. You want to know why?', null, ['Yes', 'No']); yield E.say(y === 0 ? "He was being held by an evil man who stole his money and made him a prisoner! They were probably trying to find Briggs's jewels... The sea is a rough place." : 'Briggs overcame great danger to return home to us. I admire him. I really do.'); }, mind: T("(I want someone to solve the riddle of Ankohl Ruins before I die... It's my one wish!)", "(We're lucky Briggs hadn't found the jewels when he was caught. That would have been the end of Champa.)") });
      M.npc('cha_008', 26, 12, { type: 'elder_f', text: T('The ruins at Ankohl are all that remains of a great sanctum our ancestors built. They must have been quite wealthy to build such a massive building.', "Briggs looks so reliable, so sure of himself. I've never seen him like this before."), mind: T('(They say the chamber at the top of the ruins is decorated in the purest gold. Our ancestors must have been wealthy to afford such extravagant decor.)', '(Briggs was always such a brat, but now he\'s saved the village! What a turnaround!)') });
      M.npc('cha_009', 30, 27, { type: 'pirate', name: 'Sailor', text: T("The cliff caves are a lot quieter with Briggs gone... It's a little lonely without him here.", "Now, nobody has to do anything he or she doesn't want to do! We owe Briggs a lot of thanks."), mind: T("(Why haven't Briggs and his men returned yet? Obaba said not to go looking for them, but what if they're in trouble?)", "(Nobody really likes to play the role of a pirate. I'm sure everyone is glad they don't have to anymore.)") });
      M.npc('cha_010', 20, 10, { type: 'villager_f', script: function* (E) { if (!after()) { yield E.say("Our matriarch is the last successor of the Ankohl. She's a master of the forge. It was the ancient gift of the Ankohl... There's nothing broken that they couldn't fix."); return; } if (!G.flag('cha_010_seen')) { G.set('cha_010_seen'); yield E.say("Obaba is the last possessor of the ancient secrets of Ankohl, a long-lost civilization... There's nothing she can't fix, no matter how broken it is. She's quite the blacksmith!"); return; } yield E.say("You'd think Obaba would be glad that Briggs was back. She acts like nothing's changed."); }, mind: T("(Obaba's locked herself in her room until her grandson, Briggs, returns from sea. She's so worried... She hasn't even been eating. I hope she's all right.)", "(Is Obaba in a good mood now, or what? I noticed the change as soon as Briggs returned. If you've got something to ask her, now's the time to ask.)") });
      M.npc('cha_011', 24, 30, { type: 'pirate', name: 'Sailor', script: function* (E) { if (after()) { yield E.say("Briggs fought the odds to bring us jewels and food! He's an amazing leader!"); return; } const y = yield* E.ask("The Champa sailors aren't... well liked outside of here, are we?", null, ['Yes', 'No']); yield E.say(y === 0 ? "Hey, that hurts... You could at least lie to me, just to be polite... If you keep spreading rumors like that, you'll have a rough time around here." : "Really? That's nice to hear. But if you do hear anything, don't believe a word of it."); }, mind: T('(If Briggs would just bring the treasure he found back to Champa, we could all prosper. Then we could put this pirate business behind us for good.)', '(If Champa gets enough money, maybe we can stop with the looting and pillaging...)') });
      M.npc('FeizhiC', 10, 30, { look: NPC_LOOKS.Feizhi, name: 'Feizhi', cond: () => !G.flag('feizhi_ring') && T3.gs1Done('feizhi_done'), script: T3.feizhi });
      // the pirates at the cave door, the day Briggs comes home: Felix is spotted, and everyone runs inside
      M.npc('cha_pir1', 30, 26, { type: 'pirate', name: 'Pirate', dir: DIR.LEFT, cond: () => after() && !G.flag('champa_briggs_run'), text: 'Whoa! You... You\'re Felix!' });
      M.npc('cha_pir2', 34, 27, { type: 'pirate', name: 'Pirate', dir: DIR.LEFT, cond: () => after() && !G.flag('champa_briggs_run'), text: 'What? Really? It\'s Felix?' });
      M.npc('BriggsDoor', 32, 26, { look: NPC_LOOKS.Briggs, name: 'Briggs', dir: DIR.DOWN, cond: () => after() && !G.flag('champa_briggs_run'), text: 'What was that!? Felix? Here?' });
      M.trigger(27, 26, 2, 3, T3.champaSpotted, { cond: () => after() && !G.flag('champa_briggs_run') });
      // leaving town after the forge: Alex, Karst and Agatio
      M.trigger(27, 33, 2, 2, T3.champaAlex, { cond: () => G.flag('champa_avimander') && !G.flag('champa_alex') });
      M.sign(15, 34, 'Champa. The sailors live in the cliff; the rest of us on the shore, or on the water.');
      M.sign(26, 20, T('The graves of Champa\'s sailors. Six stones.', 'The graves of Champa\'s sailors. Six stones.')());
    }
  });
  T3.champaSpotted = function* (E) {
    yield E.say("Whoa! You... You're Felix!", 'Pirate'); yield E.say("What? Really? It's Felix?", 'Pirate');
    yield E.say("You're awfully persistent, aren't you?", 'Pirate'); yield E.say('Briggs, get outta here! Felix is here to finish you off!', 'Pirate');
    yield E.say('What was that!? Felix? Here?', 'Briggs'); yield E.say("Oh no! It's really him! I've got to get out of here!!!", 'Briggs');
    G.set('champa_briggs_run'); E.set('champa_briggs_run');
    yield E.say('(Briggs and his two men bolt through the door into the caves.)');
    yield E.say('He is quick, for a man who says he is not afraid of us.', 'Piers'); yield E.say('After him. If Obaba is up there, we will need to explain ourselves before Briggs does.', 'Kraden');
  };
  // ---- Alex, Karst and Agatio on the way out ----
  T3.champaAlex = function* (E) {
    G.set('champa_alex');
    E.spawn('AlexC', 27, 30, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN });
    yield E.say("I see you've caught up with me again, Felix.", 'Alex'); yield E.say('Alex!', 'Sheba'); yield E.say('Alex? Who is Alex?', 'Piers');
    yield E.say('Alex is a Water Adept. We had been traveling together, but he left us when we landed on Indra.', 'Kraden'); yield E.say('A Water Adept?', 'Piers');
    const y1 = yield* E.ask("Ah, and I see you've made a new friend! You have been busy, haven't you?", 'Alex', ['Yes', 'No']);
    yield E.say(y1 === 0 ? "And you've found yourself a new Water Adept! Do you mean to cast me away, like old trash?" : "Please... It's quite obvious that you decided to replace me with a new Water Adept. I expect you thought you'd never see me again!", 'Alex');
    yield E.say('What do you want with us now, Alex? Or did you forget you were the one who abandoned US?', 'Jenna');
    const y2 = yield* E.ask('My dear Jenna... Have you come to despise me so, after all we\'ve been through?', 'Alex', ['Yes', 'No']);
    yield E.say(y2 === 0 ? "That's right, Felix! Why should we care about someone who just left us behind like that!?" : "Duh! You're the one who left us. It's pretty clear who despises whom here.", 'Sheba');
    yield E.say("My, aren't we a bitter bunch? And I was just trying to help you with your little task.", 'Alex'); yield E.say('We have no need of your help. We can light the lighthouses without you.', 'Kraden');
    E.spawn('KarstC', 26, 31, { look: NPC_LOOKS.Karst, name: 'Karst', dir: DIR.RIGHT }); yield E.say('Oh... Can you really?', 'Karst'); yield E.say('Karst!', 'Sheba'); yield E.say("That's right, Karst! I'm flattered that you remember!", 'Karst');
    yield E.say("What is this, Alex? What's going on?", 'Jenna'); yield E.say('Ah, how can I explain this...', 'Alex');
    E.spawn('AgatioC', 29, 31, { look: NPC_LOOKS.Agatio, name: 'Agatio', dir: DIR.LEFT }); yield E.say("What's going on is Alex is demonstrating his remarkable foresight once again!", 'Agatio');
    yield E.say('Oh, have you not had the pleasure of an introduction?', 'Alex'); yield E.say('He stayed back at the ship when I saw them in Madra.', 'Karst');
    yield E.say("I am Agatio. Let's see... That guy's Felix, and the girls are Jenna and Sheba, which makes him... Kraden. They look like an unreliable bunch of ragamuffins.", 'Agatio');
    yield E.say("Yes, they are rather useless, aren't they? That's why I finally had to abandon them, of course. But now, I believe I may have been... hasty in my judgment. You are Piers?", 'Alex');
    yield E.say('H-How do you know my name?', 'Piers'); yield E.say('How soon they forget! We met you before, when you were being... detained. Who could forget the amateur Adept changing water into ice in that strange little town?', 'Alex');
    yield E.say('Ah! You saw that! That must be how you knew Piers was a Water Adept.', 'Kraden'); yield E.say('In fact, I was even thinking of borrowing his ship at one point.', 'Alex');
    yield E.say("You would steal someone's boat? That's so typical, Alex!", 'Jenna'); yield E.say('You wound me, Jenna... I only meant to borrow it.', 'Alex'); yield E.say("Whatever you might have meant, that doesn't make it right!", 'Sheba');
    yield E.say('And just when I was about to seize the opportunity, you had to come back.', 'Alex'); yield E.say('You mean from Kibombo...', 'Piers'); yield E.say('I was mere moments too late.', 'Alex'); yield E.say("Isn't that a shame.", 'Kraden');
    yield E.say('Still, because of that, I did meet Karst and Agatio, so perhaps it was my fate...', 'Alex'); yield E.say("Can't you just stop talking about yourself for one second, Alex?", 'Jenna');
    yield E.say('Enough of your childish gibes! Alex, I want to know what makes these punks useful!', 'Karst'); yield E.say('Because they brought us the orb that Akafubu had taken. That shows some resourcefulness.', 'Alex');
    yield E.say('How so?', 'Agatio'); yield E.say('The Kibombo are quite warlike... or were, at any rate. Recovering the orb was most likely not easy.', 'Alex');
    yield E.say('They were just typical villagers, easily frightened with a small display of Psynergy...', 'Karst'); yield E.say('No... They would have used less abrupt methods than those you favor...', 'Alex');
    yield E.say('Oh? What methods would those be?', 'Agatio'); yield E.say("Alex said it clearly enough. We wouldn't terrorize people into doing what we wanted.", 'Kraden');
    yield E.say('Enough of this! Stop changing the subject! When are you going to light the remaining lighthouses?', 'Karst'); yield E.say('Yes! Our patience is beginning to wear thin!', 'Agatio');
    yield E.say("If you waste much more of our time, we'll take those Elemental Stars and do it ourselves!", 'Karst'); yield E.say("If we had a Wind Adept like Sheba and the Elemental Stars, we wouldn't need you.", 'Agatio'); yield E.say('Excuse me?', 'Sheba');
    yield E.say('I am, of course, opposed to their line of thinking. My experience with Saturos and Menardi suggests that, while they were fierce warriors... They are somewhat lacking when it comes to solving the mysteries of the lighthouses...', 'Alex');
    yield E.say('You mean to say that they failed to solve the riddles?', 'Karst'); yield E.say('Miserably...', 'Alex');
    yield E.say('Are you suggesting they were simply brutes, incapable of logic and intelligence? And are you saying the same of us!?', 'Agatio'); yield E.say("I'm afraid so...", 'Alex');
    yield E.say('Alex... Whose side are you on?', 'Karst'); yield E.say("I am on no one's side. My only concern is to see the lighthouse beacons lit once again.", 'Alex');
    yield E.say('So you mean to leave the task to Felix?', 'Agatio'); yield E.say('(Alex nods.)'); yield E.say('Then why have we come all this way looking for Felix?', 'Karst');
    yield E.say('I merely wanted to confirm that he and his companions had not forgotten their quest.', 'Alex'); yield E.say('Is that truly all?', 'Agatio'); yield E.say('I also wanted to introduce Felix to the two of you.', 'Alex');
    yield E.say('Why would you want to do that?', 'Jenna'); yield E.say('With Saturos and Menardi gone, you probably felt very little pressure to complete your task. I cannot have that.', 'Alex');
    yield E.say('What do you mean by that!?', 'Sheba'); yield E.say('With Saturos and Menardi gone, I felt another pair might... How shall I put this... Provide you with the proper incentive to complete your task.', 'Alex');
    yield E.say('Is that some kind of threat?', 'Piers'); yield E.say('Take it as you wish. I just wanted to provide you with the proper encouragement.', 'Alex');
    yield E.say("So, what? You've used us to your satisfaction, and now, our role is done?", 'Karst'); yield E.say('(Alex nods.)');
    yield E.say('You only wanted us around to flex a little muscle and scare them into action? Fine. I suppose we will let you go today...', 'Agatio'); E.despawn('AgatioC');
    yield E.say('But we will always be nearby... pushing you to make your way to Jupiter Lighthouse swiftly.', 'Karst'); E.despawn('KarstC');
    yield E.say('I look forward to seeing you soon, Felix, somewhere very near Jupiter Lighthouse.', 'Alex');
    yield E.say("Kraden, am I right in recalling that you pursue this quest on the behalf of Tolbi's ruler, Babi?", 'Alex'); yield E.say("This is true. I'm studying Alchemy because Lord Babi has ordered it. What about it?", 'Kraden');
    yield E.say('Ah, what a pity. It would seem all your studies... have been for naught.', 'Alex'); yield E.say('What are you getting at, Alex?', 'Kraden');
    yield E.say('Only that it seems your Lord Babi has at last succumbed to the ravages of time.', 'Alex'); yield E.say('Lord Babi is dead?', 'Kraden'); yield E.say("Oh, so you didn't know?", 'Alex');
    yield E.say('Lord Babi? Dead? Could that really be true?', 'Sheba'); yield E.say('Alex! How would you know such a thing?', 'Jenna');
    yield E.say("Do not mistake me! We had no hand in Babi's passing. However, the people of Tolbi may be under the impression that our presence led to his death.", 'Alex');
    yield E.say('Alex! Cut the melodrama and get to the point for a change!', 'Piers');
    yield E.say('Simply put, I would recommend against traveling to north Gondowan for a while. I just thought it might be better if you focused on your quest, instead of exploration, for now...', 'Alex');
    yield E.say('How kind of you.', 'Sheba'); yield E.say('Take it as you will... Very well. May we meet again.', 'Alex'); E.despawn('AlexC'); G.set('babi_dead');
    yield E.say('So the only reason Alex came here was to threaten us?', 'Jenna'); yield E.say("And to bring us news of Babi's death, despite the fact that we asked for no such news!", 'Sheba');
    yield E.say('Perhaps he had his own reasons for telling Kraden...', 'Piers'); yield E.say('What do you mean, Piers?', 'Sheba');
    yield E.say('If Kraden undertook this quest on behalf of Babi, then he no longer has any need--', 'Piers'); yield E.say('Oh. Of course! I hadn\'t thought of that. Your orders were to find Lemuria, right, Kraden?', 'Jenna');
    yield E.say("That's right. But if Babi really has died, you're free to go where you will, Kraden.", 'Sheba');
    yield E.say("That's not true, Sheba. Certainly, my original reason for researching Alchemy was for Lord Babi...", 'Kraden'); yield E.say('"Was for Lord Babi?" That\'s the past tense! What are your reasons now?', 'Piers');
    yield E.say("This is no longer solely for research... I do this because of what I've learned on this quest.", 'Kraden'); yield E.say('Your research?', 'Jenna'); yield E.say('What you learned on this quest?', 'Sheba');
    yield E.say("I'm not following you at all!", 'Jenna'); yield E.say("I don't understand a word of this.", 'Sheba'); yield E.say("Of course you don't! Felix is the only one I've spoken to about any of this...", 'Kraden');
    yield E.say('What!? You knew!?', 'Jenna'); const y3 = yield* E.ask("That's not fair! Tell us!", 'Sheba', ['Yes', 'No']);
    yield E.say(y3 === 0 ? "Please, Felix... Let's not say too much about it just yet." : 'Felix is right. Now is not the time to tell you about it all...', 'Kraden');
    yield E.say("It's... far too complicated.", 'Kraden'); yield E.say('Well, when WILL you tell us?', 'Jenna'); yield E.say('I am sure we will tell you once we get to Lemuria.', 'Kraden');
    yield E.say('Do you promise?', 'Sheba'); yield E.say("I promise... Piers? You don't mind waiting?", 'Kraden');
    yield E.say("I cannot read minds, like Sheba, but I have a guess at what you're thinking...", 'Piers'); yield E.say('A guess? What do you mean?', 'Kraden');
    yield E.say('You are a great scholar, Kraden, are you not? I believe your theory is correct. And to prove it, I want to return to Lemuria as soon as possible.', 'Piers');
  };
  // ====================== the houses ======================
  Kit.inn('champa_inn', { name: 'Champa Inn', price: 71, back: { map: 'champa', x: 11, y: 8 }, build(M) { const k = M.npcs.find(n => n.id === 'champa_inn_keeper'); if (k) { k.text = T("Listen, if you came to Champa looking for good seafood, you came to the wrong place. We haven't had a decent catch in months. It's like all the fish are just... gone.", "We still haven't been able to catch any fish for dinner. Not to worry, though. We'll serve up the meat that Briggs bought for us!"); k.mind = T("(It's a shame that we can't offer any fish to our customers. Ah, how I long for the days when we had fish enough for everyone.)", '(Most people here would love a nice fish meal, but having red meat is a nice change.)'); } },
    npcs: [{ id: 'cha_inn2', x: 8, y: 5, type: 'villager_f', text: T("We used to do good trade with an island east of us. They bought all our surplus fish. We don't have any surplus anymore. We don't even have enough for ourselves.", "It's nice not having to work, but it gets a little boring after a while."), mind: T('(Watching our catches dwindle with every day... It\'s a nightmare! Where have all the fish gone?)', '(The only way to find your special purpose in life is to work hard.)') }] });
  Kit.shop('champa_itemshop', { name: 'Champa Item Shop', shop: 'champa_item', back: { map: 'champa', x: 19, y: 8 }, build(M) { const k = M.npcs.find(n => n.id === 'champa_itemshop_keeper'); if (k) { k.text = T("I have some lovely artifacts, but it's only because I've been to the Ankohl Ruins.", 'The jewels Briggs found are truly remarkable. I wonder if there are any more like these in that cave.'); k.mind = T("(Our products cost what they cost for a reason: they're all rare and valuable treasures from Ankohl. If I risk my life to get something nice, of course I'm going to ask a higher price for it!)", "(Briggs's men said they found amazing weapons and things in the cave, too... I wish I'd been there. I would like to have seen them...)"); } },
    npcs: [{ id: 'cha_019', x: 8, y: 6, type: 'villager_m', text: T('If you go to Ankohl Ruins, you might find some nice artifacts for yourself.', 'Thanks to Briggs, the Champa can eat again! Unfortunately, all that food is going to run out someday. Then, what do we do?'), mind: T("(The stuff in the ruins just sits there waiting for someone to come along and take it. But if it's broken, I'm the only guy in town who can fix it.)", "(Now's the time we ought to be working hardest. While we can eat, Champa can flourish.)") }] });
  Kit.sanctum('champa_sanctum', { name: 'Champa Sanctum', back: { map: 'champa', x: 25, y: 9 }, build(M) { const k = M.npcs.find(n => n.id === 'champa_sanctum_priest'); if (k) { k.name = 'Healer'; k.text = T('Briggs bears the weight of hope for our struggling, impoverished village. He must return home soon, before all the villagers lose hope and fall into despair.', "Briggs's jewels have turned this poor town into a wealthy place, but he brought too many. Now, the hardworking people of Champa have learned to be lazy louts."); k.mind = T('(I hope Briggs brings something home for us... If not, it might be the end of Champa...)', "(All the people in town think they can live without ever having to work again. They've quit their jobs, and they rely too heavily on Briggs's find.)"); } },
    npcs: [{ id: 'cha_022', x: 3, y: 6, type: 'elder_m', text: T("The ocean has been a lot warmer lately, and the fish population is decreasing. It's not natural for the ocean to be so warm. What's causing it?", 'It seems the elders are considering appointing Briggs the first-ever chief of Champa.'), mind: T("(We Champa rely entirely on the ocean for our survival. It's all we've ever known... I wish the Eastern Sea would return to its bountiful days of overflowing nets and smooth seas.)", '(Sure, Briggs saved the village. But saving it from despair is not the same as governing it...)') },
      { id: 'cha_023', x: 9, y: 6, type: 'villager_f', text: T("I've heard rumors of a terrible tidal wave striking the lands south of us. I sure hope Briggs and his men weren't engulfed by it...", 'I, for one, think a person who can bring the people of Champa together will do us some good.'), mind: T("(All the sailors are saying the tidal wave down south was unbelievably huge. If Briggs were caught up in it, I don't think he could have survived.)", '(Supporting an entire village through fishing from the sea is next to impossible. We need new sources of income. Briggs is on the right path, finding us all those lovely jewels.)') }] });
  Kit.home('champa_house3', { name: 'Champa Home', back: { map: 'champa', x: 9, y: 16 }, npcs: [
    { id: 'cha_020', x: 3, y: 4, type: 'villager_m', text: T("We've seen a lot of traveling warriors in Champa of late. We never used to... I wonder if it's just a coincidence that we've seen so many lately...", "I've been wondering about finding a chief for Champa, since we don't have one. If so, then Briggs would be the favorite, since he's given so much to the village."), mind: T("(More visitors means more money for our village... Maybe we'll even get tourists soon!)", '(A new image for Champa will reflect the time we live in... Any new visitors will like it...)') },
    { id: 'cha_021', x: 7, y: 5, type: 'elder_m', text: T('A group of travelers came here looking for a Felix. He seems to be a fairly popular guy.', "We village elders have guided Champa for so many years... Yes, times are changing. Perhaps it's time Champa's leadership was given to the sailors."), mind: T("(Now that I think about it, someone else was looking for a Felix, too. I'll bet that guy is probably still somewhere in town...)", '(Observing Briggs recently, the limits of Champa as a village are very apparent. From now on, the village will develop through trade. I guess that\'s the era we\'ve come to.)') }] });
  Kit.home('champa_house4', { name: 'Champa Home', back: { map: 'champa', x: 19, y: 16 }, npcs: [
    { id: 'cha_h4a', x: 4, y: 4, type: 'villager_f', text: T('My husband is out with the fishing boats. He comes back with less every day.', "My husband quit the boats the day Briggs came home. He says there's no point."), mind: T('(If the sea gives us nothing, what then?)', "(A house full of food and a man with nothing to do. I don't know which is worse.)") },
    { id: 'cha_h4b', x: 8, y: 6, type: 'child_m', text: T("I'm hungry. Mama says wait for Briggs.", 'I ate three whole bowls! Briggs is the best!'), mind: T('(Wait, wait, wait. That\'s all anyone says.)', "(I'm going to be a sailor like Briggs and bring home MOUNTAINS of food.)") }] });
  // the tents on the rafts
  Kit.interior('champa_raft1', { name: 'Raft Tent', w: 8, h: 7, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'champa', x: 9, y: 30 }, doorX: 4, furn: [['bed', 1, 2], ['pot', 6, 2], ['table', 3, 3]],
    npcs: [{ id: 'cha_012', x: 2, y: 4, type: 'pirate', name: 'Sailor', text: T("It looked to me like the wave came from the Sea of Time. What's in there? What caused it?", "While I'm grateful for the food, it's somewhat annoying knowing that Briggs saved the day."), mind: T('(Something must have blown up in the Sea of Time. That would explain the tidal wave.)', "(I should just sign up with Briggs's crew and stop all my complaining. Oh, but my shipmates would never forgive me if I bailed on them like that.)") },
      { id: 'cha_013', x: 5, y: 4, type: 'villager_f', text: T('The tidal wave was terrible... It... It nearly swallowed me whole!', 'I hear that Briggs sold the jewels he found for cash and then acquired a boat.'), mind: T("(The fish are vanishing. I'm sailing farther and farther for fewer and fewer fish.)", "(The nerve of that Briggs! He's gone for a bit, and he comes back in a bigger boat! I'll bet he only did it to show us up, too!)") },
      { id: 'cha_014', x: 6, y: 4, type: 'elder_m', text: T("Most of the sailors here live in the cliff dwellings, but I don't like those caves. They're dank! And what's worse, the people living in the harbor really resent the cliff-dwellers.", "Briggs really saved our hides this time, but I'm not about to join his crew! Yeah, maybe I do owe him for this, but I'll find a way to pay him back legitimately."), mind: T("(You have to be one of the pirates to live in the cliffs... I just can't do it...)", '(I refuse to live in the cliffs, and therefore I am against Briggs. I have accepted his food, but that is as far as I will let myself slip.)') }] });
  Kit.interior('champa_raft2', { name: 'Raft Tent', w: 8, h: 7, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'champa', x: 3, y: 32 }, doorX: 4, furn: [['bed', 1, 2], ['barrel', 6, 2]],
    npcs: [{ id: 'cha_015', x: 2, y: 4, type: 'pirate', name: 'Fisherman', text: T("There's not much space in the cliff caves. That's why we have to live out here on the boats.", "We don't need to live off fish anymore, so we don't need any fishermen, do we? That does it. I'm not working anymore. What would be the point?"), mind: T("(These rafts are all we have! There's no place left for us on dry land!)", "(I'd rather spend my time sleeping than passing it chasing fish that can't be caught. Why go after food, when Briggs can give it to you?)") },
      { id: 'cha_016', x: 5, y: 3, type: 'child_f', text: T('Everyone in Champa is poor, but the poorest of us all live on rafts... I want to live on land.', "It's true! It's true! Briggs did return with the jewels! He's really going to have more friends than he did before!"), mind: T("(If Dad hadn't been opposed to Briggs becoming a pirate, we'd still be living on land.)", '(Briggs is a hero for saving the village. But will Father lose his motivation to be productive?)') },
      { id: 'cha_017', x: 6, y: 4, type: 'child_m', text: T('My dad went out to fish, but there were no fish to be caught, so he had to come back empty-handed.', 'When Briggs returned with the jewels, the adults quit working. I hope I don\'t become like them.'), mind: T('(Father worries so much about the lack of fish... He used to come back with fish jumping out of his nets. Why can\'t he catch fish anymore?)', "(Quitting their jobs makes the adults just like us kids. It's getting really weird around here.)") }] });
  // ====================== the cliff caves ======================
  const CLEG = { '.': 'grass', '#': 'grass', 'p': 'path', 'j': { ground: 'grass', obj: 'pot' }, 'b': { ground: 'grass', obj: 'barrel' }, 'u': { ground: 'grass', obj: 'stairs_up', walk: true }, 'd': { ground: 'grass', obj: 'stairs_down', walk: true }, 'D': { ground: 'grass', obj: 'door_cave', walk: true }, 'k': { ground: 'grass', obj: 'crate' } };
  const CAVE = { cliff: '#', set: 'purplerock', faces: 1 };
  const cave = (id, rows, opts) => defineMap(id, Object.assign({ name: 'Champa - The Cliff', w: rows[0].length, h: rows.length, base: 'void', music: 'champa', bg: 'cave', indoor: true, retreat: WORLD }, opts, { build(M) { M.paint(0, 0, rows, Object.assign({}, CLEG, { '#': undefined }), CAVE); if (opts.build) opts.build(M); } }));
  // the lowest caves: the corridor in from the lower door, the side rooms, the stair up
  cave('champa_cliff_1', [
    '######################',
    '#....#.........#.....#',
    '#....#.........#.....#',
    '#....D.........D.....#',
    '#....#.........#.....#',
    '######.........#######',
    '#..............u.....#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '######################'], {
    entry: { x: 10, y: 10 },
    build(M) {
      M.exit(10, 11, 1, 1, 'champa', 32, 26, DIR.DOWN, { door: true }); M.setObj(10, 11, 'door_cave'); M.walkable(10, 11);
      M.exit(15, 6, 1, 1, 'champa_cliff_2', 2, 8, DIR.UP, { stairs: true });
      M.npc('cha_024', 2, 3, { type: 'villager_f', script: function* (E) { if (!after()) { yield E.say("The Champa sailors who don't live in the cliffs are no better than cowards. The ones living in the caves will protect Briggs and Obaba without a second thought."); return; } if (G.flag('champa_avimander')) { yield E.say("I think those guys down in the harbor wanted to come up here and join us... All they had to do is ask, but I think they're chicken..."); return; } const y = yield* E.ask('What, you want to come in?', null, ['Yes', 'No']); yield E.say(y === 0 ? "As if! I'm a nice girl, and I'm not about to let some masher come storming into my room!" : "Yeah? So what do you want? You're wasting my time."); }, mind: T("(If you live up in the cliffs, that means you've proven that you can travel far across the seas. If you call yourself a sailor without ever going anywhere, you're not worthy of the title.)", "(Tough or not, he's not getting past me without a beating.)") });
      M.npc('cha_025', 18, 3, { type: 'villager_f', cond: () => !after() || G.flag('champa_avimander'), text: T('All of our men went to sea with Briggs--even my sweetheart! I hope they return soon.', "Aren't you the ones who caught Briggs in Alhafra? You don't look it, but you're pretty strong."), mind: T("(Briggs is the greatest among all our sailors. As long as he is leading our men, they'll make it back to Champa just fine.)", '(That Felix sure comes off high and mighty. I hate those self-righteous types.)') });
      M.npc('cha_pir1c', 7, 7, { type: 'pirate', name: 'Pirate', cond: () => G.flag('champa_briggs_run'), text: () => G.flag('champa_avimander') ? "We're going to wait until Briggs feels better before we go out to sea again." : 'Why do you have to be so stubborn? Quit following us, you big bully!', mind: () => G.flag('champa_avimander') ? '(Suppose we went to get the jewels... How would we gather them, with that trap in the way?)' : "(Maybe if I pretend he's not there, he'll go away. I don't want to fight him... He's got creepy powers!)" });
      M.npc('cha_pir2c', 13, 8, { type: 'pirate', name: 'Pirate', cond: () => G.flag('champa_briggs_run'), text: () => G.flag('champa_avimander') ? "It's all my fault. If I hadn't messed with that switch, we'd have gotten everything." : "All right, I surrender! I'll go back to Alhafra... but only if Briggs is going.", mind: () => G.flag('champa_avimander') ? '(At least we got some of the jewels before that stupid switch blocked us off.)' : "(He's after our ship, isn't he? That no-good thief mayor must have sent him.)" });
      M.sign(3, 8, 'The lowest of the cliff caves. The sailors\' families live up here; the stair climbs to the next level.');
    }
  });
  // the middle caves: the pirates across two doorways, the rightmost room and its barrel, the stair up
  cave('champa_cliff_2', [
    '########################',
    '#....#..........#......#',
    '#....#..........#......#',
    '#....D..........D......#',
    '#....#..........#......#',
    '######..........########',
    '#...............u......#',
    '#......................#',
    '#d.....................#',
    '########################'], {
    entry: { x: 2, y: 8 },
    build(M) {
      M.exit(1, 8, 1, 1, 'champa_cliff_1', 15, 7, DIR.DOWN, { stairs: true }); M.exit(16, 6, 1, 1, 'champa_cliff_3', 2, 8, DIR.UP, { stairs: true });
      M.npc('cha_026', 2, 2, { type: 'elder_f', text: T("I bet you're wondering why only sailors and their families get to live in the cliff dwellings. Well, from up here on the cliffs, families can look out to sea and await the return of their sailors.", "When Briggs set sail, we thought we'd never see him again. Now, all of a sudden, he shows up, and with enough food to save our town forever!"), mind: T("(Standing here, staring across the sea from these cliffs, makes me feel like I'm helping our sailors.)", "(I was just gazing out at sea, and then I saw Briggs's ship... I got all choked up.)") });
      M.npc('cha_027', 19, 2, { type: 'pirate', name: 'Sailor', text: T('Before he left, Briggs ordered me to keep watch in his absence. If Obaba is so worried about Briggs, she ought to send someone out to look for him.', "Why did you have to go and tell Obaba that we were pirates? I'll bet that really upset her."), mind: T("(Briggs may be our captain, but at least he's not all full of himself. I hate people like that.)", "(I just know she's going to yell at us. The waiting is the worst part. Next to the yelling.)") });
      M.npc('cha_pir3c', 5, 4, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander'), text: "I'd rather fight than go back to jail. Bring it on, sissyboy!", mind: "(It would be so much easier just to go back to jail. Yeah... They can't beat me up if I surrender!)" });
      M.npc('cha_pir4c', 16, 4, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander'), text: "You're Felix, aren't you? You've come to bring in Briggs, haven't you?", mind: "(Briggs said the guy who captured him was some amazingly tough thug named Felix. But I don't know... If this really is him, he doesn't look like the bad guy Briggs said he was.)" });
      M.npc('cha_pir3d', 8, 7, { type: 'pirate', name: 'Pirate', cond: () => G.flag('champa_avimander'), text: 'We really want to make amends. We just need Briggs to get better.', mind: "(I was as shocked as the next guy that we couldn't reach those treasure chests...)" });
      M.npc('cha_pir4d', 20, 7, { type: 'pirate', name: 'Pirate', cond: () => G.flag('champa_avimander'), text: 'There were plenty of treasures on that island in the middle of the sea. If we get tired of waiting for Briggs, maybe you could come with us.', mind: "(Briggs is just pretending to be sick because he doesn't want to follow up on his promise.)" });
      M.sign(10, 7, 'The middle caves. The rightmost room is a store; the stair climbs to Obaba\'s level.');
    }
  });
  // the top caves: the families, the guard at Obaba's door, the balcony onto the highest ledge, Obaba's forge
  cave('champa_cliff_3', [
    '########################',
    '#....#.....D....#......#',
    '#....#..........#......#',
    '#....D..........D......#',
    '#....#..........#......#',
    '######..........########',
    '#....................D.#',
    '#......................#',
    '#d.....................#',
    '########################'], {
    entry: { x: 2, y: 8 },
    build(M) {
      M.exit(1, 8, 1, 1, 'champa_cliff_2', 16, 7, DIR.DOWN, { stairs: true }); M.exit(21, 6, 1, 1, 'champa', 35, 16, DIR.RIGHT, { door: true }); M.exit(11, 1, 1, 1, 'champa_obaba', 8, 12, DIR.UP, { door: true });
      M.npc('cha_028', 2, 2, { type: 'villager_f', text: T("My husband wants our children to be sailors like him, but I simply won't have it.", 'We have so much food everywhere now! I hope Briggs goes off soon to bring us even more jewels and treats!'), mind: T("(When I married a sailor, I knew how cruel the sea could be. I can't stop my husband from sailing, but I don't want our children to follow that path.)", "(Briggs says he's sick and can't go to sea right now. But how can he not go? He has to make up for all of his evil deeds...)") });
      M.npc('cha_029', 3, 3, { type: 'child_f', text: T("Mom's had it pretty rough. I hope I meet a sailor with a future, so I don't have to work so hard.", () => G.flag('champa_avimander') ? "Eoleo still won't come down and play with us. I'm getting really cheesed off at him." : "If you so much as TOUCH me, I'll bite your nose off!"), mind: T('(Eoleo is the only boy in town who will amount to anything... He will be mine!)', "(What's he staring at? Sheesh! This guy's a total lech!)") });
      M.npc('cha_030', 19, 2, { type: 'child_m', text: T("Someday, I want to be a sailor, like my father before me. My mother hates the idea, though. She'd rather have me study and become a scholar or something.", () => G.flag('champa_avimander') ? "Briggs came down with a cold. I guess that means he won't be sailing for a while." : "Why's everyone so scared of you? You don't look so tough."), mind: T("(Has Mom forgotten that I am my father's son? If she knew anything about me, she'd never ask me to give up the sailor's life.)", "(He's not so tough! Why's everyone running away? Just thump him good and be done with it.)") });
      M.npc('cha_031', 11, 2, { type: 'pirate', name: 'Sailor', dir: DIR.DOWN, cond: () => !after(), text: "Obaba's not seeing anyone right now. She's concerned about her grandson, and she doesn't want to be bothered.", mind: "(I've never seen Obaba like this before. She must be really worried about Briggs...)" });
      M.npc('cha_032', 18, 7, { type: 'villager_m', text: T("That pit is Obaba's forge. She uses it when she's working metal into weapons and equipment.", () => G.flag('champa_avimander') ? "You guys don't look much like warriors, but you sure are brave to fight your way in here." : "Aw, come on! I'm not doing anything! Leave me alone!"), mind: T("(I wonder how deep this forge goes. It's supposed to reach right into the mountain's heart. Obaba must be a master of the forge if she's the only one who can call up its flames.)", '(Felix must be incredibly strong to get Briggs all worked up like that.)') });
      M.npc('cha_pir5c', 10, 4, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander'), text: "Did you really think you could come storming into Champa, Briggs's home, without a fight?", mind: '(Why would Briggs run away like a little baby just because this guy showed up?)' });
      M.npc('cha_pir6c', 12, 4, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander'), text: "Leave the women and the children alone. They've got nothing to do with this.", mind: '(What are they doing here? Do they mean to capture us?)' });
      // Obaba comes out when the door is approached, before Briggs is home
      M.trigger(10, 2, 3, 1, T3.obabaDoor, { cond: () => !after() });
      M.sign(15, 7, 'The top of the cliff caves. The door at the top of the hall is Obaba\'s; the door on the right leads out onto the highest ledge.');
    }
  });
  T3.obabaDoor = function* (E) {
    E.spawn('ObabaOut', 11, 1, { look: NPC_LOOKS.Obaba, name: 'Obaba', dir: DIR.DOWN });
    const y = yield* E.ask('Has my grandson returned? Has my Briggs come home?', 'Obaba', ['Yes', 'No']);
    yield E.say(y === 0 ? 'You lie! If Briggs had truly returned, he would have come to see me first!' : 'I asked not to be disturbed until my grandson has returned home! Now, let me be!', 'Obaba');
    E.despawn('ObabaOut'); yield E.move('player', DIR.DOWN, 1);
    if (!G.flag('obaba_refused')) { G.set('obaba_refused'); yield E.say('She will see no one until Briggs is back. And Briggs is in a cell in Alhafra, waiting on a ship with its mast in the water...', 'Kraden'); yield E.say('Then we go back to Alhafra, and we raise that mast.', 'Felix'); }
  };
  // ====================== Obaba's forge ======================
  defineMap('champa_obaba', {
    name: "Obaba's Forge", w: 16, h: 14, base: 'void', music: 'champa', bg: 'cave', indoor: true, entry: { x: 8, y: 12 }, retreat: WORLD,
    build(M) {
      M.cave(0, 0, 16, 14, 'floor_stone', 'wall_in_stone', 'wall_in_stone_top'); M.open(8, 13); M.walkable(8, 13); M.exit(8, 13, 1, 1, 'champa_cliff_3', 11, 2, DIR.DOWN, { door: true });
      // the forge: a ring of stone round a pit of fire, reaching into the mountain's heart
      for (let y = 4; y <= 9; y++) for (let x = 5; x <= 10; x++) { const edge = y === 4 || y === 9 || x === 5 || x === 10; M.setObj(x, y, edge ? 'forge_rim' : 'forge_fire'); }
      M.setObj(1, 1, 'torch'); M.setObj(14, 1, 'torch'); M.setObj(1, 11, 'barrel'); M.setObj(14, 11, 'crate'); M.setObj(2, 2, 'bed'); M.setObj(13, 2, 'shelf');
      M.npc('Obaba', 8, 2, { look: NPC_LOOKS.Obaba, name: 'Obaba', dir: DIR.DOWN, cond: () => after(), script: function* (E) { yield* T3.obaba(E); } });
      M.npc('BriggsO', 4, 3, { look: NPC_LOOKS.Briggs, name: 'Briggs', dir: DIR.DOWN, cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander'), text: 'Hold it right there! So, Felix, you\'ve come. Don\'t assume I\'ll go so easy on you this time!' });
      M.npc('BriggsSick', 3, 11, { look: NPC_LOOKS.Briggs, name: 'Briggs', dir: DIR.RIGHT, cond: () => G.flag('champa_avimander'), text: "Once I'm over my cold, I'm setting out to get more jewels and make amends with Madra and Daila.", mind: "(I'm certain that there are even more jewels back in that cave! If only I'd had the chance to grab a few more before that trap blocked our way!)" });
      M.npc('ChauchaO', 12, 11, { look: NPC_LOOKS.Chaucha, name: 'Chaucha', dir: DIR.LEFT, cond: () => G.flag('champa_avimander'), text: "I wonder what's wrong with Briggs. He was feeling so healthy and happy. He doesn't have a fever, and he's not coughing, but he says he's too weak to go out.", mind: "(There is absolutely nothing wrong with Briggs. I just know he's hiding something from me...)" });
      M.npc('EoleoO', 13, 10, { look: NPC_LOOKS.Eoleo, name: 'Eoleo', dir: DIR.LEFT, cond: () => G.flag('champa_avimander'), text: 'Babu ba bubabu...', mind: "(One of Papa's men touched a trap, and that's why Papa couldn't get all the jewels. Papa, I think you should tell Felix about that.)" });
      M.trigger(7, 10, 3, 3, T3.obabaForge, { cond: () => G.flag('champa_briggs_run') && !G.flag('champa_avimander') });
      M.sign(12, 8, 'The forge of Ankohl. Its fire reaches into the heart of the mountain; only Obaba can call it up.');
    }
  });
  // Briggs at bay, Obaba's salamander, and the truth of the pirates
  T3.obabaForge = function* (E) {
    yield E.say("Hold it right there! So, Felix, you've come. Don't assume I'll go so easy on you this time!", 'Briggs');
    yield E.say('Is that boy him? The "mighty warrior" you told me about?', 'Obaba'); yield E.say("I told you he didn't look like much, Grandma... Weren't you even listening to me?", 'Briggs');
    yield E.say('All you told me is that his name is Felix and that he is a "mighty warrior." Hmph. He doesn\'t look like the sort of person who\'s interested in stealing our jewels, though.', 'Obaba');
    yield E.say("But that's not the point, Grandma! If you don't destroy him now, he's going to take me far away, and you won't ever see me again!", 'Briggs');
    yield E.say("Oh, now he doesn't look like the kind of boy who would do that...", 'Obaba'); yield E.say('If he takes me away, poor Eoleo will be so sad! What do you say about that, huh?', 'Briggs');
    yield E.say("Oh, that's just not fair. You know I can't deny my great-grandson! I don't see why I should be the one to get you out of this mess, but I can't bear to see Eoleo sad.", 'Obaba');
    yield E.say('Grandma, please!', 'Briggs'); yield E.say('Oh, all right.', 'Obaba'); yield E.say('(Obaba draws something from her sleeve, and turns to the party.)');
    const leave = yield* E.ask("Listen, you have no idea what you're getting into. I think you'd better leave.", 'Obaba', ['Stay', 'Leave']);
    if (leave === 1) { yield E.say("Ah, you've made a good decision. You seem like a reasonable boy. Reasonable boys live longer.", 'Obaba'); yield Engine.fadeOut(12); E.warpNow('champa_cliff_3', 11, 2, DIR.DOWN); yield Engine.fadeIn(12); yield E.say('We can come back when we are ready for her. Whatever she means to throw at us, it will not be small.', 'Kraden'); return; }
    yield E.say("Stubborn, are you? Ah, well. If that's the way it's going to be, get ready for your medicine! Heart of the earth, fury of the forge's flames, grant me power!", 'Obaba');
    Engine.doFlash(16, '#ff8040'); Engine.doShake(14); Audio.sfx('boom'); const r = yield* E.ambush(['Avimander'], { boss: true, canFlee: false, music: 'boss', weaken: { hp: 0.8, atk: 0.85 } }, { say: "(She tosses it into the forge - and a great salamander of the forge's own colour bursts out of the flames!)", scale: 1.2 });
    if (r !== 'win') return;
    yield E.say('My salamander! You... beat my salamander... I thought he was unbeatable... How could this be? How did you do that? What... What are you?', 'Obaba');
    yield E.say("Grandma, what's going on!? I thought you were going to protect me!", 'Briggs'); yield E.say("What do you mean, what am I doing? I've done everything I can!", 'Obaba');
    yield E.say("Grandma!!! He's going to take me away! He's a bad guy! You have to do SOMETHING!", 'Briggs'); yield E.say("I'm sorry, Briggs, but you'll have to fight him yourself.", 'Obaba');
    yield E.say('Wha-What!?', 'Briggs'); yield E.say("You heard me. I'm through pampering you. You have to get out of this yourself!", 'Obaba');
    yield E.say('But... Grandma... Look at him! I mean, look what he can do!', 'Briggs'); yield E.say("I know, dear, but there's nothing I can do to help. You don't want him to take you away, do you?", 'Obaba');
    yield E.say('But... what about poor Eoleo?', 'Briggs'); yield E.say('*Sigh* All right, all right.', 'Obaba');
    yield E.say('Um. Excuse me... There seems to be a small misunderstanding.', 'Kraden'); yield E.say("Yeah! I don't like standing here listening to a pirate call US the bad guys!", 'Sheba');
    yield E.say('Pirate! My Briggs?', 'Obaba'); yield E.say('He stole a ship from Alhafra and escaped from their jail! A ship WE helped fix!', 'Jenna');
    yield E.say('Briggs, is this true?', 'Obaba'); yield E.say('Aw... But, Grandma, they...', 'Briggs'); yield E.say("We should tell you, we're not here to take Briggs back to Alhafra.", 'Piers');
    const y1 = yield* E.ask("So you've decided you don't want to run errands for the mayor of Alhafra?", 'Kraden', ['Yes', 'No']);
    yield E.say(y1 === 0 ? 'Good. That greedy bag of hot air can do his own dirty work, for all I care.' : "Felix, I know you can't mean that. We didn't come to Champa for that bloated gasbag.", 'Sheba');
    yield E.say('Briggs... Piracy? Why?', 'Obaba'); yield E.say("Grandma, it's not what you think! These guys, they...", 'Briggs');
    yield E.say('Briggs, you just hush up!!! ...It all makes sense now. The gems, the food, your absence...', 'Obaba'); yield E.say('What do you mean? What makes sense?', 'Briggs');
    yield E.say("They're telling the truth! And you, Briggs! You've been lying to me this whole time!", 'Obaba'); yield E.say("You're going to take their word over your own grandson's?", 'Briggs');
    yield E.say('You got that right! I should have known better than to believe you, you scoundrel!', 'Obaba');
    E.spawn('ChauchaIn', 8, 12, { look: NPC_LOOKS.Chaucha, name: 'Chaucha', dir: DIR.UP }); yield E.say('He only did it for Champa!', 'Chaucha'); yield E.say('Chaucha! You came!', 'Briggs');
    yield E.say('I heard Felix had shown up looking for you. I was worried...', 'Chaucha'); yield E.say('What do you mean, Briggs did it for Champa? All of that food... Stolen goods?', 'Obaba');
    yield E.say('No, we paid for everything we brought back with us.', 'Chaucha'); yield E.say("But you stole a boat to do it, didn't you?", 'Obaba');
    const y2 = yield* E.ask("Grandma, we found those jewels ourselves, and we paid Alhafra well for that ship, didn't we?", 'Briggs', ['Yes', 'No']);
    if (y2 === 0) { yield E.say('Your story has the ring of truth to it.', 'Obaba'); yield E.say('Thank you, Felix. Your honesty speaks well of you.', 'Briggs'); } else { yield E.say("So he's lying again?", 'Obaba'); yield E.say("Dang it, Felix, I'm not lying!", 'Briggs'); }
    yield E.say('We... were pirates, for a short while. Until we found the jewels. But if not for our efforts, Champa would have starved away long ago.', 'Chaucha');
    yield E.say("But that doesn't excuse resorting to piracy!", 'Obaba'); yield E.say("Hey, it's not like we were doing it for the money! We wanted to save Champa!", 'Briggs');
    yield E.say("Those jewels we found are very valuable. We intend to repay each town we... borrowed from. Isn't that true?", 'Chaucha'); yield E.say('(Briggs pauses.)');
    yield E.say('What\'s the matter with you!? You said on the boat that we would repay every last town!', 'Chaucha'); yield E.say("Oh yeah... You're right... We really ought to try to make amends for what we've done.", 'Briggs');
    yield E.say("That's the truth, Grandmother. Can you find it in your heart to forgive your only grandson?", 'Chaucha'); yield E.say("All right, all right. I'm too old for grudges. But what about Felix?", 'Obaba');
    const y3 = yield* E.ask('What do you say, Felix? Can you forgive my husband?', 'Chaucha', ['Yes', 'No']);
    yield E.say(y3 === 0 ? 'I agree, Felix. If each town is repaid what was stolen, I see no reason for complaint.' : "I don't know, Felix. We didn't come to capture Briggs. Why should we care?", 'Kraden');
    yield E.say('Do you hear that? They forgive you, too. That means you can leave Eoleo with nothing to fear.', 'Chaucha'); yield E.say("I... I don't know what to say...", 'Briggs');
    yield E.say('You know, you look a little strange... You haven\'t caught a cold, have you? Do you have a fever?', 'Chaucha'); yield E.say('What are you talking about?', 'Briggs');
    yield E.say("No, I'm positive... You look flush, too... You'd better lie down before it gets worse.", 'Chaucha'); yield E.say('She... worries about me.', 'Briggs');
    yield E.say('Hurry up and get into bed so you can get some rest! Oh, for goodness\' sake! You don\'t want to give them your cold, do you? Come on!', 'Chaucha');
    E.despawn('ChauchaIn'); G.set('champa_avimander'); E.set('champa_avimander'); G.set('briggs_done'); yield E.coins(1330);
    yield E.say("So... what brings you to Champa? I mean, you didn't come here to catch Briggs, from what I gathered... Ah, well... To be young and foolish again. If you ever need to consult with me on any number of subjects, you're welcome anytime.", 'Obaba');
  };
  // Obaba, the prongs and the trident
  T3.obaba = function* (E) {
    if (G.flag('trident_forged')) { yield E.say('The trident seems to have some amazing power... The legends must be true... No matter what you encounter at sea, no monster can stand against you with that trident.', 'Obaba'); return; }
    if (!G.flag('champa_avimander')) { yield E.say("I wouldn't be doing this if it weren't for Eoleo, you know. I'm sorry. You look like quite a nice boy, but I just can't allow you to take my Briggs away.", 'Obaba'); return; }
    const held = G.get('obaba_prongs') || []; const carried = ['Right Prong', 'Center Prong', 'Left Prong'].filter(p => G.inventory.has(p) && !held.includes(p));
    if (!carried.length) {
      if (!held.length) { yield E.say("I mean it. If there's ever anything you need, just call on me. I'm always here.", 'Obaba'); return; }
      yield E.say(held.length === 1 ? 'The legend says that anyone who holds the whole lance has nothing to fear from the sea. Bring me the other two pieces.' : 'Yes, there\'s no doubt about it. Those must truly be fragments of the legendary trident. Only one to go!', 'Obaba'); return;
    }
    for (const p of carried) {
      G.inventory.remove(p); held.push(p); G.set('obaba_prongs', held.slice());
      if (held.length === 1) {
        yield E.say("This looks like a weapon! It looks like part of a trident, but it's only one third of the whole thing, it seems... Why... Could it be? Is this the legendary trident of Ankohl? I'll hold on to this for you. It won't do you any good like this, and I'll keep it safe here.", 'Obaba');
        const y = yield* E.ask("You seem unsure... You don't think I'll pull a fast one on you, do you?", 'Obaba', ['Yes', 'No']); yield E.say(y === 0 ? 'Kids today. So mistrustful.' : "Ah, that's nice. Don't you worry!", 'Obaba');
        if (held.length < 3 && carried.length === 1) { yield E.say("If you bring me the other two pieces, I'll be happy to rebuild it for you.", 'Obaba'); }
      } else if (held.length === 2) { yield E.say("Ah, have you found the second piece, dear? It's magnificent! I'll hold on to this as well. Wouldn't want it getting lost, now would we? Only one to go!", 'Obaba'); }
    }
    if (held.length < 3) return;
    yield E.say('Well done! You found all three pieces of the trident! That means I can begin work reforging the ancient trident of Ankohl! At last!', 'Obaba');
    const y = yield* E.ask("We'll just toss all three pieces in here, shall we?", 'Obaba', ['Yes', 'No']); yield E.say(y === 0 ? 'Just leave it to me...' : "There's nothing to be afraid of, dear. Just leave it to me.", 'Obaba');
    yield E.say("Heart of the earth, fury of the forge's flames, grant me power!", 'Obaba'); Audio.sfx('boom'); yield 20; yield E.say("That's funny... Nothing happened.", 'Obaba');
    Engine.doFlash(20, '#ffe080'); Engine.doShake(16); yield E.say("What's going on?", 'Obaba'); yield E.say('(Light fills the forge, then flame - a pillar of fire rises out of the middle of it!)');
    yield E.say("Something's happening! Is that... the legendary trident?", 'Obaba'); Audio.sfx('summon'); yield 20;
    G.set('trident_forged'); yield E.give('Trident');
    yield E.say("After all these years, the trident is complete again. But what's making it float like that? Regardless, the trident has been fixed. It belongs to you now, Felix. Use it well.", 'Obaba');
    yield E.say('Reveal shows why it floats: the legend is true, and no monster of the sea can stand against it.', 'Sheba');
    yield* E.chapter('Chapter 4: The Sea of Time');
  };
}
