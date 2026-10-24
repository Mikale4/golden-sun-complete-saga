// ---------- Golden Sun story events ----------
'use strict';
const STORY = {};
// ============ PROLOGUE: The storm over Vale ============
STORY.prologue = function* (E) {
  E.setFollowers(false); Audio.play('storm');
  // the middle of the night: a voice in the dark, then the room comes up around Isaac's bed
  const room = G.map; room.tint = 'rgba(0,0,8,0.97)'; Engine.fade = 0; Engine.fadeDir = 0;
  yield 30; yield E.say('Isaac, wake up! Please, dear, wake up!', 'Voice');
  E.spawn('DoraP', 6, 3, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.LEFT });
  for (let a = 0.97; a > 0; a -= 0.025) { room.tint = 'rgba(0,0,8,' + a.toFixed(3) + ')'; yield 1; }
  room.tint = null;
  yield* E.chapter('Prologue: The Disastrous Day');
  yield E.say('The Mt. Aleph Boulder is going to fall! Come on, Isaac. We have to go... now!', 'Dora');
  yield E.move('player', DIR.DOWN, 1); yield E.face('player', DIR.RIGHT); yield 10;   // out of bed
  yield E.say('Isaac! You forgot something!', 'Dora');
  yield E.face('DoraP', DIR.UP); Audio.sfx('psy'); Engine.doFlash(8, '#ffffff'); yield 12;
  yield E.say("(With a flick of Psynergy, Dora plucks Isaac's tunic from its peg on the wall.)");
  yield E.say("It's pouring outside! Don't go out without your tunic!", 'Dora');
  // to the stairs
  yield E.walkTo('DoraP', 7, 5); yield E.walkTo('player', 6, 5); yield E.face('DoraP', DIR.LEFT); yield E.face('player', DIR.RIGHT);
  const r = yield* E.ask('Have you got everything you need?', 'Dora', ['Yes', 'No']);
  if (r === 0) yield E.say("Good for you, Isaac. A lost possession can be replaced; a lost life can't.", 'Dora');
  else yield E.say("I'm sorry, but we don't have time... You'll have to leave it behind.", 'Dora');
  yield E.walkTo('DoraP', 8, 5); E.despawn('DoraP');
  // down the stairs: Kyle bursts in at the door
  yield Engine.fadeOut(20); E.warpNow('vale_isaac_house_past', 9, 4, DIR.DOWN); yield 2;
  E.spawn('DoraP', 8, 4, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.DOWN }); E.spawn('KyleP', 6, 9, { look: NPC_LOOKS.Kyle, name: 'Kyle', dir: DIR.UP });
  yield Engine.fadeIn(20);
  Audio.sfx('door'); yield E.walkTo('KyleP', 6, 6);
  yield E.say('Isaac, Dora, hurry! The Boulder could fall at any second!', 'Kyle');
  yield E.walkTo('KyleP', 6, 9); E.despawn('KyleP');
  yield E.walkTo('DoraP', 6, 8); yield E.walkTo('DoraP', 6, 9); E.despawn('DoraP');
  yield E.walkTo('player', 6, 8); yield E.walkTo('player', 6, 9);
  // out into the rain
  yield Engine.fadeOut(20); E.warpNow('vale_past', 21, 46, DIR.DOWN); yield 2;
  E.spawn('DoraP', 22, 47, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.LEFT }); E.spawn('KyleP', 23, 47, { look: NPC_LOOKS.Kyle, name: 'Kyle', dir: DIR.LEFT });
  E.hide('Dora'); yield Engine.fadeIn(20); yield E.move('player', DIR.DOWN, 1); yield E.face('player', DIR.RIGHT);
  yield E.say('Kyle... Will they be able to stop the Boulder?', 'Dora');
  yield E.say("I don't think so... Not for long, anyway. You two go on ahead and take refuge in the plaza.", 'Kyle');
  yield E.say("Aren't you coming?", 'Dora');
  yield E.say('I need to help evacuate the other villagers.', 'Kyle');
  yield E.say('Let me help you, Kyle!', 'Dora');
  yield E.say("It's too dangerous, Dora. Please, just take good care of Isaac!", 'Kyle');
  for (;;) {
    const a = yield* E.ask("Isaac is old enough to get to the plaza on his own. You can find your way, can't you, Isaac?", 'Dora', ['Yes', 'No']);
    if (a === 0) { yield E.say('You know the way -- just go south to get to the plaza. Be careful!', 'Dora'); break; }
    yield E.say("You're a big boy, now, Isaac. Why don't you go on your own?", 'Dora');
  }
  // Kyle runs off to the other houses, Dora after him; Isaac is left in the rain
  yield E.walkTo('KyleP', 28, 46, 2); E.despawn('KyleP'); yield E.walkTo('DoraP', 28, 46, 2); E.despawn('DoraP');
  G.set('storm_alone');
};
// a rock the size of a house drops out of the dark and lands where the party was about to go: the road south
// from Isaac's, then the west bank below the top bridge
STORY.dropRocks = function* (E, cells, big) {
  Audio.sfx('quake'); E.shake(30);
  const ids = cells.map(([x, y], i) => { const id = 'falling_rock_' + i; E.spawn(id, x, y - 7, { animal: 'boulder', animalCol: big ? '#6a6a78' : '#8a8a98', name: 'Rock', solid: false }); return id; });
  for (const id of ids) E.move(id, DIR.DOWN, 7, 4);
  yield 28; Engine.doShake(20); Audio.sfx('boom'); Engine.doFlash(6, '#ffffff');
  for (const id of ids) E.despawn(id);
  for (const [x, y] of cells) { G.map.objects.push({ kind: 'boulder', x, y, key: G.map.id + ':boulder:storm_' + x + '_' + y, id: 'storm_rock_' + x + '_' + y }); }
  yield 20;
};
STORY.stormRock1 = function* (E) {
  yield* STORY.dropRocks(E, [[12, 48], [13, 48], [14, 48]]);
  yield E.say('(Rocks crash down across the road to the bridge! There is no way south... Isaac will have to go round by the north.)');
};
STORY.stormRock2 = function* (E) {
  yield* STORY.dropRocks(E, [[6, 39]]);
  yield E.say("We can't get around this rock! We'll have to find another way.", 'Garet');
  yield E.say("Back up the bank - the path west, past the fields! Come on!", 'Garet');
};
STORY.stormGaret = function* (E) {
  yield E.say("Ugh... Hrnghhh... Isaac, what do you want? I'm trying to save my things! What, you want me to just dump my stuff?", 'Garet');
  const r = yield* E.ask('Should Garet leave his things?', 'Garet', ['Yes', 'No']);
  if (r === 0) yield E.say("You think I should forget these things and save my own life? You know, you're right. OK! Let's get out of here!", 'Garet');
  else yield E.say("Hmm... If a rock hits me now, I'll lose both my chest and my life. You're right -- I should just ditch my stuff. Let's get out of here.", 'Garet');
  E.despawn('GaretNPC'); G.set('garet_joined');
  yield E.join('Garet', 1, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt' } });
  E.setFollowers(true); E.gather();
  yield E.say("The road south's blocked, so it's over the top bridge and round by the west. Stick with me!", 'Garet');
};
// crossing the upper bridge: the elders are seen up on the mountain, holding the Boulder over the sanctum
STORY.stormBridge = function* (E) {
  yield E.say("Ahhh! The Boulder! It's falling!", 'Voice');
  yield E.pan(16, 11); Audio.sfx('quake'); yield E.shake(30);
  yield E.say("Ugh... Ughnn... It's too heavy! We can't hold it for long! If our Psynergy runs out, Vale will be destroyed! We have to hold on until the villagers are safe!", 'Elder');
  yield E.face('storm_man', DIR.DOWN);
  yield E.say("Hurry, boys! Run!!! It's just a little farther!", 'Man');
  yield E.face('storm_man', DIR.UP);
  yield E.panBack();
  yield E.say('Come on, Isaac, run! The Boulder is coming!', 'Garet');
};
STORY.stormInjured = function* (E) {
  if (G.flag('storm_injured_done')) { yield E.say("Be careful on your way to the plaza!", 'Injured Man'); return; }
  yield E.say("Rockslide... destroyed fence... Monsters everywhere... I'm hurt pretty badly... Do you think I'll die?", 'Injured Man');
  const r = yield* E.ask("Do you think he'll die?", 'Injured Man', ['Yes', 'No']);
  if (r === 0) yield E.say("I knew it... This is the end for me. Save yourselves...", 'Injured Man');
  else { yield E.say("This is awful. I'm left here for the monsters to... Wait... That's strange... I'm not hurt at all!", 'Injured Man'); yield E.say("But I'm serious about the monsters, so be careful on your way to the plaza!", 'Injured Man'); }
  G.set('storm_injured_done'); if (r !== 0) E.despawn('injured');
};
STORY.stormBattle1 = function* (E) { yield* E.ambush(['Vermin'], { canFlee: false }, { say: '(Something scurries out of the rain!)' }); };
STORY.stormBattle2 = function* (E) { yield* E.ambush(['Bat'], { canFlee: false }, { say: '(A bat wheels down out of the storm!)' }); };
STORY.stormBattle3 = function* (E) { yield* E.ambush(['Wild Mushroom', 'Wild Mushroom'], { canFlee: false }, { say: '(Two mushrooms uproot themselves from the mud!)' }); };
STORY.stormBattle4 = function* (E) { yield* E.ambush(['Bat', 'Vermin'], { canFlee: false }, { say: '(Something drops from the bridge rail!)' }); };
// the river below the falls: Felix clings to a post off the end of the pier, his family and Isaac's on the boards
STORY.stormFelix = function* (E) {
  yield E.say('Oh no! My brother!', 'Jenna');
  yield E.pan(10, 71); yield 20;
  yield E.say('Hang on, Felix!', 'Kyle');
  yield E.say("Felix will be all right. We'll find a way to save him...", 'Dora');
  E.hide('FelixNPC'); yield 30; yield E.say('Nooooo! Felix!', 'Jenna'); E.show('FelixNPC'); yield 20;
  yield E.say("The rope won't reach... We should use Psynergy. Do you have any left?", 'Kyle');
  yield E.say("I've used all mine up. What about you, Kyle?", 'Man');
  yield E.say("I'm drained from helping the other villagers...", 'Kyle');
  yield E.say('We have to get help.', 'Dora');
  yield E.say('Can Felix hang on long enough for us to find help?', 'Kyle');
  yield E.say("There's nothing else we can do for him here, is there?", 'Dora');
  yield E.say('Then go get help, but be as quick as possible!', 'Kyle');
  yield E.say("Jenna, can you go too? You'll go find help, right?", 'Man');
  yield E.say("Your brother's counting on you, Jenna. All right, let's get going!", 'Dora');
  // the two run up to the cottage and part there
  yield E.walkTo('DoraP', 4, 69, 2); yield E.walkTo('JennaP', 5, 70, 2); yield E.faceEach('DoraP', 'JennaP');
  yield E.say("I'll go look up north... You head for the plaza, all right?", 'Dora');
  yield E.say("Yes, ma'am. We're looking for anyone with any Psynergy left, right?", 'Jenna');
  yield E.walkTo('JennaP', 10, 79, 2); yield E.walkTo('JennaP', 17, 82, 2); yield E.walkTo('JennaP', 28, 84, 2); E.despawn('JennaP');
  yield E.panBack();
  // Dora turns and sees the boys
  yield E.walkTo('DoraP', 3, 67, 2); yield E.lookAt('DoraP', 'player');
  const r = yield* E.ask('Isaac! You saw what happened?', 'Dora', ['Yes', 'No']);
  if (r === 0) yield E.say("I have to go get help before Felix drowns! I don't suppose... Could the two of you help me?", 'Dora');
  else yield E.say("I'm looking for someone who can help Felix. He's fallen into the river. I don't suppose... Could the two of you help me?", 'Dora');
  const r2 = yield* E.ask('Will you help?', 'Dora', ['Yes', 'No']);
  if (r2 === 0) yield E.say('Jenna has gone to the plaza to get help. Go join her.', 'Dora');
  else yield E.say("You don't have to if you don't want to... Just get yourselves to the plaza.", 'Dora');
  yield E.walkTo('DoraP', 0, 64, 2); yield E.walkTo('DoraP', 0, 58, 2); E.despawn('DoraP'); G.set('felix_seen');
  yield E.say("The plaza's over the bridge and out the east side of town. Let's go, Isaac!", 'Garet');
};
// the plaza: Garet's grandfather sends the men to the elders, and the one man with Psynergy left comes down off the stone
STORY.stormJenna = function* (E) {
  yield E.say('Go aid the elders! The Boulder is too heavy for them to hold much longer.', "Garet's Grandfather");
  yield E.say("We can't let the Mt. Aleph Boulder destroy our village.", 'Man');
  yield E.say("Let's go help the elders.", 'Other Man');
  yield E.say("We're counting on you.", "Garet's Grandfather");
  yield E.walkTo('storm_man1', 2, 12, 2); yield E.walkTo('storm_man2', 2, 12, 2); E.despawn('storm_man1'); E.despawn('storm_man2');
  yield E.say('Grandpa! Jenna!', 'Garet');
  yield E.lookAt('JennaNPC', 'player');
  yield E.say('Garet, Isaac... You came to help me?', 'Jenna');
  const r = yield* E.ask('Jenna told me about Felix. Is that why you\'re here?', "Garet's Grandfather", ['Yes', 'No']);
  if (r === 0) yield E.say('Good boys! Jenna could use a hand.', "Garet's Grandfather"); else yield E.say('Well, regardless, I want you two to help Jenna.', "Garet's Grandfather");
  yield E.pan(13, 44); yield E.face('charged', DIR.DOWN); yield 10;
  yield E.say("Great! I'm all charged up!", 'Man');
  yield E.panBack();
  yield E.say('How are you? Have you recovered your Psynergy?', "Garet's Grandfather");
  yield E.walkTo('charged', 13, 47, 2);
  yield E.say('Enough to save Felix, thanks to the Psynergy Stone.', 'Man');
  yield E.say('OK, Jenna, you heard him. Now hurry back! The path may be blocked by fallen rocks. You two can show them the way!', "Garet's Grandfather");
  yield E.lookAt('JennaNPC', 'player');
  yield E.say('...Thank you, Isaac.', 'Jenna');
  yield E.say("Back to the bridge, then. They're right behind us - let's go!", 'Garet');
  E.despawn('charged'); E.despawn('JennaNPC');
  G.set('jenna_help');
};
// the lower bridge on the way back: the Boulder comes down on the pier, and the strangers wait in the plaza
STORY.stormReturn = function* (E) {
  E.spawn('JennaP', 16, 82, { look: CHARACTERS.Jenna.look, name: 'Jenna', dir: DIR.LEFT }); E.spawn('ManP2', 17, 82, { type: 'villager_m', name: 'Man', dir: DIR.LEFT });
  E.spawn('DoraP', 9, 71, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.RIGHT });
  yield E.face('player', DIR.UP); yield E.pan(11, 74); yield 20;
  yield E.say("Mom! Dad! We're back!", 'Jenna');
  yield E.face('DoraP', DIR.DOWN);
  yield E.say('Is that you, Jenna?', 'Dora');
  yield E.say('Yes, ma\'am...', 'Jenna');
  yield E.say("I couldn't find anyone who could help... How did you do? You're just in time.", 'Dora');
  yield E.say('Then my brother is still...', 'Jenna');
  yield E.say("Felix is all right. He's hanging in there. Come down here, so we can save Felix!", 'Dora');
  Audio.play('danger'); Audio.sfx('quake'); yield E.shake(50);
  yield E.say('(The ground heaves. Up on the mountain, the Mt. Aleph Boulder tears loose and comes bounding down the cliffs!)');
  yield E.pan(10, 66); yield 10;
  yield* STORY.dropRocks(E, [[9, 71], [10, 71], [9, 72], [10, 72]], true);
  for (const id of ['KyleRiver', 'ManRiver', 'FelixNPC', 'DoraP']) E.despawn(id);
  G.set('boulder_fell');
  yield 20; yield E.say('(The Boulder crashes down on the pier. When the spray clears there is nothing where Kyle, Felix and the others stood - only the flood.)');
  yield E.say('Dad! Mom! FELIX!', 'Jenna');
  yield E.panBack();
  yield E.say('(Isaac turns and runs back across the bridge, toward the plaza.)');
  yield E.say("Isaac... I can't let him go alone... It's times like these that we men have to stand together!", 'Garet');
  E.despawn('JennaP'); E.despawn('ManP2');
  // the plaza: two strangers in the rain, talking of the sanctum
  yield Engine.fadeOut(30); E.warpNow('vale_south_past', 2, 11, DIR.RIGHT); yield 2; E.setFollowers(false); yield Engine.fadeIn(30);
  E.spawn('MysteryM', 9, 13, { look: NPC_LOOKS.Saturos, name: 'Foreign Man', dir: DIR.LEFT }); E.spawn('MysteryW', 10, 13, { look: NPC_LOOKS.Menardi, name: 'Foreign Woman', dir: DIR.LEFT });
  yield E.walkTo('player', 5, 12);
  Audio.play('villain');
  yield E.say('Only the two of us survived...', 'Foreign Man');
  yield E.say('How could we have anticipated Sol Sanctum would unleash such fury?', 'Foreign Woman');
  yield E.say("It's a miracle that even the two of us were spared...", 'Foreign Man');
  yield E.say('That switch... It must have been a trap...', 'Foreign Woman');
  yield E.say('But to think it could conjure up a storm this powerful!', 'Foreign Man');
  yield E.say('...Another demonstration of the awesome powers of Alchemy.', 'Foreign Woman');
  yield E.say('Regardless, we must not fail the next time we challenge Sol Sanctum.', 'Foreign Man');
  yield E.say('Next time, we shall certainly...', 'Foreign Woman');
  E.spawn('GaretP', 1, 11, { look: CHARACTERS.Garet.look, name: 'Garet', dir: DIR.RIGHT });
  yield E.say('Isaac! Wait!', 'Garet');
  yield E.walkTo('GaretP', 4, 12, 2);
  yield E.faceEach('MysteryM', 'player');
  const r = yield* E.ask("You were eavesdropping on us just now... weren't you?", 'Foreign Man', ['Yes', 'No']);
  yield E.say("Isaac... Isaac, they look scary... Are you sure you should be talking to them?", 'Garet');
  yield E.say('You must forget everything you heard.', 'Foreign Woman');
  yield E.say("Don't worry... We'll help you forget!", 'Foreign Man');
  E.despawn('GaretP'); E.setFollowers(true); E.gather();
  const b = yield* E.battle(['Mystery Man', 'Mystery Woman'], { canFlee: false, canLose: true, boss: true, music: 'villain' });
  Audio.play('storm');
  yield E.say('Hmph. Not even worth the effort.', 'Foreign Woman');
  yield E.say('Come. The mountain grows angry.', 'Foreign Man');
  E.despawn('MysteryM'); E.despawn('MysteryW');
  yield E.shake(40); Audio.sfx('quake');
  yield E.say('(A deafening roar... The Mt. Aleph Boulder settles, and the storm howls on over Vale.)');
  yield Engine.fadeOut(60);
  // reset to present day
  G.flags = {}; G.set('prologue_done');
  const isaac = G.party.get('Isaac'); if (isaac) { isaac.growTo(2); isaac.fullRestore(); }
  G.party.remove('Garet');
  yield 30;
  E.warpNow('vale', 21, 46, DIR.DOWN); E.setFollowers(true);
  yield* E.chapter('Three years later...');
  yield* STORY.valeMorning(E);
};
// Three years on: the morning of the roof. Isaac is up on his mother's roof with Move and straw; Jenna comes by,
// finds Garet training on the stump in his yard, and the two of them climb up to fetch Isaac - Dora's talk of Kyle,
// her step onto the patch, Garet through both holes - before the three set off for Kraden's (the game script's
// Vale (Present) scene).
STORY.valeMorning = function* (E) {
  if (G.flag('vale_morning')) return;
  const F = G.field, p = F.player; const put = (a, x, y, d) => { if (!a) return; a.tx = x; a.ty = y; a.px = x * TILE; a.py = y * TILE; a.path = []; a.moving = false; if (d !== undefined) a.dir = d; };
  const fx = (name, x, y) => { F.psyFx = { name, x, y, t: 0, el: 0, dir: DIR.DOWN, cx: x, cy: y }; };
  E.despawn('GaretNPC'); E.despawn('Dora'); E.setFollowers(false);
  put(p, 22, 42, DIR.DOWN);   // Isaac on the roof of his house, straw in hand
  E.spawn('DoraM', 21, 46, { look: NPC_LOOKS.Dora, name: 'Dora', dir: DIR.UP });
  E.spawn('JennaM', 23, 51, { look: CHARACTERS.Jenna.look, name: 'Jenna', dir: DIR.UP });
  Audio.play('vale'); yield Engine.fadeIn(60);
  yield E.move('JennaM', DIR.UP, 5); E.face('JennaM', DIR.LEFT);
  yield E.say("Isaac! Haven't you finished mending the roof yet? You're almost done? OK! Keep at it!", 'Dora');
  yield E.say("(Isaac sets the next bundle of straw over the hole and reaches for the Psynergy that will press it flat.)");
  yield E.move('JennaM', DIR.RIGHT, 4); yield E.move('JennaM', DIR.UP, 5); yield E.move('JennaM', DIR.LEFT, 1); yield E.move('JennaM', DIR.UP, 2);
  // Garet in his yard, shoving the stump at the cliff foot with Move
  E.spawn('GaretM', 20, 39, { look: CHARACTERS.Garet.look, name: 'Garet', dir: DIR.UP });
  F.map.object('stump', 20, 38, { id: 'garet_stump' }); const stump = F.map.objects.find(o => o.id === 'garet_stump');
  yield E.move('JennaM', DIR.LEFT, 4); E.face('JennaM', DIR.LEFT);
  yield E.say('Hyaa!', 'Garet'); fx('Move', 20, 38); yield 24; if (stump) { stump.x = 21; F.map.finalize(); } Audio.sfx('push'); yield 10;
  yield E.say('Hee hee... Still training, Garet?', 'Jenna');
  yield E.say('Hyaa!', 'Garet'); fx('Move', 21, 38); yield 24; if (stump) { stump.x = 22; F.map.finalize(); } Audio.sfx('push'); yield 10;
  yield E.say('You sure do put your heart into it, Garet!', 'Jenna');
  E.face('GaretM', DIR.RIGHT);
  yield E.say("Oh, I'm just finishing up.", 'Garet');
  yield E.say("That's good. It's time to go, and I was about to leave you behind. Say, what exactly happened to you two? The accident three years ago... Is that why you've been studying Psynergy?", 'Jenna');
  yield E.say("I appreciate your concern, but... my family's never coming back, and neither is Isaac's father. I just want to forget that day. I wish everyone would...", 'Jenna');
  yield E.say('That awful day... We went to get help, but they found us unconscious...', 'Garet');
  yield E.say("Well, let's get Isaac and go to Kraden's... What, Garet? Huh? You were about to say something, weren't you? Don't be weird, Garet! Whatever...", 'Jenna');
  yield E.say('Jenna, are you mad at me?', 'Garet');
  yield E.say("I don't want to talk about it. Come on!!!", 'Jenna');
  yield E.say('Huh?', 'Garet');
  yield E.say("Isaac's waiting for us.", 'Jenna');
  yield E.say('But, Jenna...!', 'Garet');
  yield E.say("I'll leave you behind if you're too slow.", 'Jenna');
  yield E.say('Jenna...', 'Garet');
  // back round to Isaac's, where the last hole gets its straw
  E.move('JennaM', DIR.RIGHT, 5); yield E.move('GaretM', DIR.RIGHT, 5); E.move('JennaM', DIR.DOWN, 2); yield E.move('GaretM', DIR.DOWN, 2);
  E.move('JennaM', DIR.RIGHT, 1); yield E.move('GaretM', DIR.RIGHT, 1); E.move('JennaM', DIR.DOWN, 5); yield E.move('GaretM', DIR.DOWN, 5);
  E.move('JennaM', DIR.LEFT, 3); yield E.move('GaretM', DIR.LEFT, 2); E.face('JennaM', DIR.UP); E.face('GaretM', DIR.UP);
  fx('Move', 20, 42); Audio.sfx('psy'); yield 30;
  yield E.say('Good job, Isaac.', 'Dora');
  yield E.move('DoraM', DIR.LEFT, 3); yield E.move('DoraM', DIR.UP, 3); yield E.move('DoraM', DIR.RIGHT, 2); E.face('DoraM', DIR.RIGHT); E.face('player', DIR.LEFT);
  yield E.say("You patched it nicely. All right. You're all done. You're very reliable, Isaac... just like your father was.", 'Dora');
  const r1 = yield* E.ask('What is it, Isaac? Do you still think about the accident?', 'Dora', ['Yes', 'No']);
  const r2 = yield* E.ask((r1 === 0 ? 'I thought so... Isaac...' : "I don't believe you...") + ' You and Garet have been working yourselves to the bone studying Psynergy. Do you think things would be any different if you\'d had stronger abilities?', 'Dora', ['Yes', 'No']);
  yield E.say(r2 === 0 ? "That's what I thought." : 'Hmm... I wonder...', 'Dora');
  yield E.say("I was devastated when Kyle died. I felt all alone... It's taken some time, but I'm better now. I still have you, Isaac. You're almost seventeen. You're so much like Kyle was when he was young. I'm looking forward to seeing where life takes you.", 'Dora');
  // the two who were listening below come up the ladder
  yield E.move('JennaM', DIR.LEFT, 3); yield E.move('JennaM', DIR.UP, 3); yield E.move('JennaM', DIR.RIGHT, 1); E.face('JennaM', DIR.RIGHT);
  yield E.say("MA'AAAAM!!!", 'Jenna');
  E.face('DoraM', DIR.LEFT); yield E.say('Hello, Jenna.', 'Dora');
  yield E.say('Good morning.', 'Jenna');
  yield E.say('Yes, yes... Good morning.', 'Dora');
  yield E.move('GaretM', DIR.LEFT, 2); yield E.move('GaretM', DIR.UP, 2); E.face('GaretM', DIR.UP);
  yield E.say("Well, if it isn't Garet, too! Where do you all plan to go today?", 'Dora');
  yield E.say("We're going to Mt. Aleph with Kraden.", 'Garet');
  yield E.say('Mountain climbing with Kraden, eh? Kids and their games...', 'Dora');
  yield E.say("No! It's part of our studies...", 'Jenna');
  yield E.say('Ah, yes... Alchemy. Alchemy is the foundation of all Psynergy... And you all know Mt. Aleph is the greatest source of Alchemy. They say Kraden is the best teacher around.', 'Dora');
  const r3 = yield* E.ask("Alchemy... I wonder what use it all is? Your mother would rather see you grow up to be a happy, ordinary man. But I suppose you want to go...", 'Dora', ['Yes', 'No']);
  yield E.say(r3 === 0 ? "Well, if that won't persuade you, I guess nothing will!" : "It's nice of you to humor me, but I know you don't mean it.", 'Dora');
  yield E.say("You're just as stubborn as your father!", 'Dora');
  // the step back onto the patch
  yield E.move('DoraM', DIR.UP, 1); yield 10;
  yield E.say('Ahhh!', 'Dora'); Engine.doShake(6);
  yield E.say('Be careful, ma\'am!', 'Garet');
  E.move('DoraM', DIR.DOWN, 4); Audio.sfx('jump'); yield E.move('GaretM', DIR.UP, 2); yield E.move('GaretM', DIR.RIGHT, 1);
  yield E.say("Garet, don't!", 'Jenna');
  Engine.doShake(10); Audio.sfx('quake'); E.hide('GaretM'); yield 20;
  yield E.move('DoraM', DIR.UP, 3); yield E.move('DoraM', DIR.RIGHT, 2); E.face('DoraM', DIR.RIGHT);
  yield E.say("Oh! That was exciting! I'm sorry I scared you like that. Well!", 'Dora');
  E.show('GaretM'); yield E.say("I... I'm sorry, ma'am. I'll get out of your way right away!", 'Garet');
  yield E.move('GaretM', DIR.RIGHT, 3); Audio.sfx('jump');
  yield E.say('Wait! Not there!', 'Jenna');
  yield E.say("Huh? What's wrong with--", 'Garet');
  Engine.doShake(10); Audio.sfx('quake'); E.hide('GaretM'); yield 20;
  yield E.say("Oh, never mind... But you'd better get going... This old house will fall apart if you stay much longer. I'll get this fixed up. You don't have to hang around here.", 'Dora');
  E.show('GaretM'); yield E.say('Thank you, ma\'am.', 'Jenna');
  yield E.say('Please, call me Dora.', 'Dora');
  yield E.say("We'll get going right away!", 'Garet');
  yield E.say('Wait, Garet... Just watch your step.', 'Dora');
  // down the ladder and away: Garet and Jenna are with Isaac from here
  E.despawn('JennaM'); E.despawn('GaretM'); E.despawn('DoraM');
  yield Engine.fadeOut(20); put(p, 21, 46, DIR.DOWN); if (stump) { stump.gone = true; } yield Engine.fadeIn(20);
  G.set('vale_morning'); G.set('garet_joined'); G.set('jenna_joined'); G.set('kraden_met_hint');
  yield E.join('Garet', 2, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt', arm: 'Padded Gloves' } });
  yield E.join('Jenna', 2, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt' } });
  E.setFollowers(true); E.gather(); G.field.refreshNpcs();
  yield E.say("(Dora waves from the roof. Kraden's cottage is up on the west terrace, past the bridge.)");
};
// the strangers on the way up to Kraden's cabin, three years on
STORY.valeSaturosMenardi = function* (E) {
  E.spawn('SatV', 22, 9, { look: NPC_LOOKS.Saturos, name: 'Foreign Man', dir: DIR.LEFT }); E.spawn('MenV', 22, 11, { look: NPC_LOOKS.Menardi, name: 'Foreign Woman', dir: DIR.LEFT });
  Audio.play('villain');
  yield E.say('Kraden... Can we use him?', 'Foreign Woman');
  yield E.say('Hmm... His knowledge is no meager thing. ...We can use him.', 'Foreign Man');
  yield E.say("But he's more stubborn than we expected...", 'Foreign Woman');
  yield E.say('And cunning, too... Cunning beyond measure.', 'Foreign Man');
  yield E.say("If he won't go willingly, then we can always...", 'Foreign Woman');
  E.face('SatV', DIR.RIGHT); E.face('MenV', DIR.RIGHT);
  yield E.say('You there! What are you doing?', 'Foreign Man');
  yield E.say('What are we doing?', 'Garet');
  const r = yield* E.ask('Were you eavesdropping on our conversation?', 'Foreign Woman', ['Yes', 'No']);
  if (r === 0) yield E.say("Oh ho! Well... I can't permit you to continue your spying.", 'Foreign Woman'); else yield E.say('Hmph! I guess that I should take you at your word...', 'Foreign Woman');
  yield E.say("Hey, you're the ones who were sneaking around!", 'Garet');
  yield E.say('Sneaking... Who are you, to accuse me!', 'Foreign Man');
  yield E.say("So Kraden's engagement was with you...", 'Foreign Woman');
  yield E.say("Yeah, we're off to meet him right now.", 'Garet');
  const r2 = yield* E.ask('And this appointment is important enough to drive us away?', 'Foreign Man', ['Yes', 'No']);
  if (r2 === 0) yield E.say('Pfeh! If your errand is more important than our own, then... Go...', 'Foreign Man'); else yield E.say('Nevertheless, Kraden sent us away. He awaits you. Go...', 'Foreign Man');
  yield E.say("You're letting us go?", 'Garet');
  yield E.say('Are you sure, Saturos?', 'Foreign Woman');
  yield E.say('Menardi, we have no reason to delay these children any further.', 'Saturos');
  yield E.say("Let's... Let's go, Isaac.", 'Garet');
  yield E.walkTo('SatV', 28, 10, 2); yield E.walkTo('MenV', 28, 11, 2); E.despawn('SatV'); E.despawn('MenV');
  Audio.play('vale');
};
STORY.garetJoins = function* (E) {
  yield E.say("Isaac! There you are. Kraden asked us to come to his cottage today. Jenna's already there. Let's go!", 'Garet');
  E.despawn('GaretNPC'); G.set('garet_joined');
  yield E.join('Garet', 2, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt', arm: 'Padded Gloves' } });
  G.set('kraden_met_hint');
};
STORY.meetJennaKraden = function* (E) {
  yield E.say("Oh, Isaac, Garet! Kraden's inside. He's been going on about Sol Sanctum all morning.", 'Jenna');
  yield E.say('He wants to actually go IN there. The elders would have a fit! ...But I admit, I want to see it too.', 'Jenna');
};
STORY.kradenHouse = function* (E) {
  if (!G.flag('garet_joined')) { yield E.say('Ah, Isaac! Come back with Garet and Jenna. I have something important to discuss.', 'Kraden'); return; }
  yield E.say("Ah, you're all here! Excellent! I have been studying the mysteries of Alchemy for years, and Sol Sanctum holds the key.", 'Kraden');
  yield E.say('The elders forbid it, but... What if we just took a peek? A small expedition. Purely for scholarship!', 'Kraden');
  const r = yield* E.ask('Will you go into Sol Sanctum with Kraden?', 'Kraden', ['Yes', 'No']);
  if (r !== 0) { yield E.say("Oh, but you must! Think of the knowledge! Come now, don't be timid.", 'Kraden'); }
  yield E.say('Splendid! Meet me at the entrance to Sol Sanctum. I shall handle the guard.', 'Kraden');
  yield E.say("Well, I'm not letting you two have all the fun. I'm coming too!", 'Jenna');
  G.set('jenna_joined'); G.set('kraden_met');
  if (!G.party.get('Jenna')) yield E.join('Jenna', 2, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt' } });
  yield E.say("And I shall walk in front, if nobody minds. I have been in worse holes than this one, on three continents.", 'Kraden');
  yield E.say("You? Kraden, you are a scholar.", 'Garet');
  yield E.say("I am a scholar who has spent thirty years in ruins that did not want him there. Stay behind me and try to keep up.", 'Kraden');
  // A taste of what he is, before the story takes him away again: far above the boys, and only here for the sanctum.
  yield E.join('Kraden', 18, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt' } });
  yield E.say('(Kraden and Jenna hurry ahead toward Mt. Aleph.)');
  G.set('sanctum_open');
};
STORY.sanctumEnter = function* (E) {
  if (!G.party.get('Kraden')) E.spawn('KradenS', 44, 35, { look: NPC_LOOKS.Kraden, name: 'Kraden' });
  yield E.say('Here we are... Sol Sanctum! Can you feel it? The very air hums with Psynergy!', 'Kraden');
  yield E.say('Legend says the ancient civilization sealed the power of Alchemy away in here. The Elemental Stars...', 'Kraden');
  yield E.say("Stay close. There are said to be traps, and the monsters of Mt. Aleph roam these halls.", 'Kraden');
  yield E.say("Use your Psynergy, Isaac. 'Move' can shift these stone pillars. Press the C key or open the menu to use Psynergy on the field.", 'Kraden');
  if (!G.party.get('Kraden')) E.despawn('KradenS');
  const isaac = G.party.get('Isaac'); isaac.learnExtra('Move');
};
// the hall of statues: Kraden stops to look for the hidden way
STORY.sanctumHall = function* (E) {
  const K = !G.party.get('Kraden'); if (K) E.spawn('KradenS', 12, 18, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.UP });
  yield E.say("What's wrong, Kraden?", 'Garet');
  yield E.say("Hmm... Those two said there was a hidden passage leading deeper into the sanctum. I've come here many times, and I've always thought it looked... strange.", 'Kraden');
  yield E.say('What do you mean?', 'Jenna');
  yield E.say("Sol Sanctum was built in honor of the sun. There ought to be something here to reflect that. If there is a hidden passage, then maybe it leads to... Well! Let's see if we can find it!", 'Kraden');
  const r = yield* E.ask('I think he\'s serious! Should we help him, Isaac?', 'Garet', ['Yes', 'No']);
  if (r === 0) yield E.say("But it's too dangerous for us to split up. We should stay together.", 'Garet');
  else { yield E.say("You can't seriously want to turn back after we've come this far.", 'Jenna'); yield E.say("Let's help Kraden. We should stick together, after all.", 'Garet'); }
  yield E.say("(The statues at the ends of the hall stand a little apart from the wall. 'Move' could shift them.)");
  if (K) E.despawn('KradenS');
};
// the corridor of statues across the moat
STORY.sanctumMino = function* (E) {
  yield E.say("More statues... Hmm... It doesn't look like we can reach them from here. Perhaps Psynergy is the key... Isaac, try to use your Psynergy!", 'Kraden');
};
// the central chamber: the mark of the sun
STORY.sanctumSunChamber = function* (E) {
  yield E.say("This is it! We've found it! Clearly, this is the mark of the sun... the heart of Sol Sanctum. It's just as I'd imagined... which means those two were telling the truth!", 'Kraden');
  yield E.say('But if what they said was true, then that means they must have been...', 'Jenna');
  yield E.say('They were thieves! They came to rob the sanctum!', 'Garet');
  yield E.say("Let's hurry back to the village and tell everybody!", 'Jenna');
  yield E.say('Kraden? What\'s the matter?', 'Garet');
  yield E.say("We're so close... We've come all the way to the heart of Sol Sanctum. To turn our backs on it and leave...", 'Kraden');
  const r = yield* E.ask('Sol Sanctum holds the origins of Alchemy. It would be a waste to... What do you think? Shall we go a little farther?', 'Kraden', ['Yes', 'No']);
  yield E.say(r === 0 ? 'Thank you!' : 'Then you can all go back to the village without me.', 'Kraden');
  yield E.say("If you put it that way, we don't have much choice.", 'Jenna');
  yield E.say("I'm with Kraden. I want to look inside...", 'Garet');
  yield E.say("Really? We'll just go a little bit further! Good! It's decided. Let's move ahead!", 'Kraden');
  yield E.say("(A room lies beyond the passage to the east, and a corridor leads down from it.)");
};
// the crack in the north wall, before and after the statues have turned the Moon to the Sun
STORY.sanctumCrack = function* (E) {
  yield E.say('A crack runs down the wall here. A thin beam of light comes through it... but the wall is solid.');
  if (!G.flag('sanctum_luna_seen')) { G.set('sanctum_luna_seen'); yield E.say("Kraden: 'A beam of light... Isaac, the room to the east - the one with the Moon. These rooms must be connected somehow. Would you look farther up the passage from there?'", 'Kraden'); }
  yield E.move('player', DIR.DOWN, 1);
};
// the rooms of statues: what the three are for
STORY.sanctumStatueRooms = function* (E) {
  yield E.say("(Three statues stand in this room, and three marks on the floor a step south of each. In the room beyond, four more, and the crest of the Moon between them.)");
  yield E.say("Kraden: 'Light must be the key to this secret... Try the statues, Isaac. I'll keep watch in the Luna room.'", 'Kraden');
};
// Kraden comes running when the first of the four moves
STORY.sanctumKradenReturns = function* (E) {
  G.set('sanctum_kraden_returns');
  const K = !G.party.get('Kraden'); if (K) E.spawn('KradenR', 25, 11, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.UP });
  yield E.say('Wait, Isaac!', 'Kraden');
  yield E.say("What's wrong, Kraden?", 'Jenna');
  yield E.say('This is a most interesting mechanism you\'ve found, Isaac. But this is clearly... some kind of trap.', 'Kraden');
  yield E.say('This is... a trap?', 'Garet');
  yield E.say("You've done well. Finding this means you're looking in the right place. Move the statues onto their marks, all four... and mind the light.", 'Kraden');
  if (K) E.despawn('KradenR');
};
STORY.sanctumChamber = function* (E) {
  if (!G.party.get('Kraden')) E.spawn('KradenC', 24, 20, { look: NPC_LOOKS.Kraden, name: 'Kraden' });
  yield E.say('Incredible... The Elemental Stars! Venus, Mercury, Mars, Jupiter! Each pulses with the raw power of its element!', 'Kraden');
  yield E.say("Look at them, shining on their islands in the dark... Isaac, take the Venus Star! Jump across the crystal pillars. Careful now!", 'Kraden');
  yield E.say("Wow... they're beautiful.", 'Jenna');
  if (!G.party.get('Kraden')) E.despawn('KradenC');
  G.set('sanctum_chamber_intro');
};
STORY.sanctumStars = function* (E) {
  const { x, y } = G.field.facingTile(); const t = G.map.get(x, y);
  const el = t.beacon; const names = ['Venus Star', 'Mercury Star', 'Mars Star', 'Jupiter Star'];
  if (el === undefined) return;
  const name = names[el];
  if (G.flag('got_' + name)) { yield E.say('The pedestal is empty.'); return; }
  if (el === 2 && !(G.flag('got_Venus Star') && G.flag('got_Mercury Star') && G.flag('got_Jupiter Star'))) { yield E.say("Kraden: 'Leave the Mars Star for last, Isaac. Fetch the others first!'", 'Kraden'); return; }
  if (el === 2) { yield* STORY.sanctumClimax(E); return; }
  Audio.sfx('item'); Engine.doFlash(8, tint(ELCOLOR[el], 0.5));
  G.set('got_' + name); G.inventory.add(name);
  yield E.say('Isaac obtained the ' + name + '!');
  yield E.say('Good, good! Now, go fetch the others!', 'Kraden');
  if (G.flag('got_Venus Star') && G.flag('got_Mercury Star') && G.flag('got_Jupiter Star')) { yield* STORY.sanctumSaturos(E); }
};
STORY.sanctumSaturos = function* (E) {
  Audio.play('villain');
  yield E.say("(The boys turn back... and find two strangers standing behind Kraden and Jenna.)");
  // stage the confrontation on the central platform so everyone is on screen
  yield Engine.fadeOut(15); E.teleportActor('player', 25, 19, DIR.UP); E.gather(); G.field.updateCamera(true);
  if (G.party.get('Kraden')) { G.party.remove('Kraden'); G.field.rebuildFollowers(); }   // seized along with Jenna
  E.spawn('SaturosS', 23, 16, { look: NPC_LOOKS.Saturos, name: 'Saturos', dir: DIR.DOWN }); E.spawn('MenardiS', 27, 16, { look: NPC_LOOKS.Menardi, name: 'Menardi', dir: DIR.DOWN }); E.spawn('KradenH', 24, 17, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.DOWN });
  yield 5; yield Engine.fadeIn(15);
  yield E.say("It looks like they've spotted us.", 'Saturos');
  yield E.say("I thought we'd be safe until they'd gotten all the Elemental Stars.", 'Menardi');
  yield E.say('You! You mean to steal the Elemental Stars!', 'Kraden');
  yield E.say('Master Kraden... Are you calling us thieves? As I recall, aren\'t you the one who stole our information?', 'Saturos');
  yield E.say("What will you do with us once you've got the Elemental Stars?", 'Jenna');
  E.spawn('MaskedS', 26, 17, { look: Object.assign({}, CHARACTERS.Felix.look, { hat: 'mask', hatColor: '#e0e0f0' }), name: 'Masked Man', dir: DIR.DOWN });
  yield E.say('Relax... You will not be hurt. That was our agreement, was it not?', 'Masked Man');
  yield E.say("That all depends on how well they cooperate. You heard us... If you wish to save your friends, then give us the Elemental Stars!", 'Saturos');
  yield E.say('What guarantee do we have once we\'ve given you the Elemental Stars?', 'Kraden');
  yield E.say('Guarantee... Ah. I have one. You will have to remove your mask.', 'Menardi');
  yield E.say('Ah, of course. A fine idea... He will be our guarantee. Felix! Remove your mask!', 'Saturos');
  yield E.say("What? What did he say? He called that guy Felix... That day... The Boulder... We saw him die, didn't we?", 'Garet');
  yield E.say("I'll do it. I'll... take off my mask.", 'Masked Man');
  E.despawn('MaskedS'); E.spawn('FelixS', 26, 17, { look: CHARACTERS.Felix.look, name: 'Felix', dir: DIR.DOWN });
  yield E.say("I-It's not possible...", 'Jenna');
  yield E.say("I know I've caused you much grief, Jenna. It was a miracle that I survived that day... I've been with them ever since.", 'Felix');
  yield E.say('But why? Why did you leave me all alone... My own brother... I thought you were dead!', 'Jenna');
  yield E.say("Save this teary reunion for later. Felix will be our guarantee. Now, give us the Elemental Stars!", 'Menardi');
  yield E.say("We don't have any choice. Should we give them the Elemental Stars?", 'Garet');
  E.spawn('AlexS', 25, 17, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN }); Engine.doFlash(6, '#a0e0ff');
  yield E.say('Will you permit me to relieve you of those Elemental Stars?', 'Alex');
  yield E.say("Oh, Alex... You're late! Alex is another of our companions. Hand the stones over to him.", 'Saturos');
  G.inventory.remove('Venus Star'); G.inventory.remove('Mercury Star'); G.inventory.remove('Jupiter Star');
  yield E.say('(Garet hands over the Venus, Mercury and Jupiter Stars.)');
  yield E.say("I'm afraid I must apologize in advance... For you will be bringing us the remaining Elemental Star, as well.", 'Alex');
  yield E.say("No, my friend... We want you to bring us ALL the Elemental Stars! Stop grumbling and bring us the last Star!", 'Saturos');
  // clear the walkway north so the party can reach the Mars Star
  yield E.move('KradenH', DIR.LEFT, 2); yield E.move('FelixS', DIR.RIGHT, 2); yield E.move('AlexS', DIR.UP, 2);
  E.face('KradenH', DIR.DOWN); E.face('FelixS', DIR.DOWN); E.face('AlexS', DIR.DOWN);
  G.set('saturos_waiting');
};
STORY.sanctumClimax = function* (E) {
  Audio.sfx('item'); Engine.doFlash(8, '#ff8060');
  G.set('got_Mars Star'); G.inventory.add('Mars Star');
  yield E.say('Isaac obtained the Mars Star!');
  yield E.shake(40); Audio.sfx('quake');
  yield Engine.fadeOut(15); E.teleportActor('player', 25, 19, DIR.UP); E.gather(); G.field.updateCamera(true); yield 5; yield Engine.fadeIn(15);
  yield E.say("What's the matter? What happened?", 'Menardi');
  yield E.say('No! Not again!', 'Saturos');
  yield E.say("Without the energy of the Elemental Stars, the chamber is collapsing!", 'Alex');
  yield E.shake(30);
  yield E.say('What is that?!?', 'Jenna');
  yield E.pan(12, 11); Engine.doFlash(12, '#ffffff'); Audio.play('lighthouse');
  E.spawn('WiseOneS', 25, 11, { animal: 'wiseone', name: 'The Wise One', solid: false }); // hovering over the dark above the portal, clear of the group
  yield E.say('(A great stone with a single eye floats above the lava...)');
  yield E.say('Could that be... the Wise One?!?', 'Kraden');
  yield E.say('It must be the guardian of the Elemental Stars!', 'Saturos');
  yield E.say("This doesn't look good... Maybe we should just escape while we can.", 'Felix');
  yield E.say('The Mars Star will have to wait for another day. Forget about them. They won\'t make it out alive.', 'Saturos');
  yield E.say("We take this 'Jenna' with us... If they survive, they will want her back. And if they want her back, they will bring us the Star. Regardless, Kraden must come with us.", 'Alex');
  yield E.say("Alex... Are you breaking our promise? Jenna's not any part of this. I won't let you hurt her!", 'Felix');
  yield E.say("If we leave Jenna, she will surely die. Is that what you want, Felix? Let's make haste!", 'Menardi');
  yield E.say("Isaac, Garet! Don't die!", 'Jenna');
  for (const id of ['SaturosS', 'MenardiS', 'KradenH', 'FelixS', 'AlexS']) E.despawn(id);
  G.party.remove('Jenna'); G.party.remove('Kraden'); E.setFollowers(true); G.field.rebuildFollowers(); E.gather();
  yield E.say('Well, this turned out badly, wouldn\'t you say? Jenna and Kraden are gone!', 'Garet');
  E.face('player', DIR.UP);
  yield E.say("Why are you standing there? This place has become dangerous... The volcano will soon erupt... I cannot hold it long.", 'The Wise One');
  yield E.say('The Elemental Djinn... They have returned... Take out the Elemental Star... Return it to its bag.', 'The Wise One');
  G.inventory.remove('Mars Star'); G.inventory.add('Mythril Bag');
  yield E.say('(Isaac places the Mars Star in the Mythril Bag.)');
  yield E.say("Without the power of the Elemental Stars to contain it, the magma flows freely once again. There will be no chamber for the Elemental Stars to return to... The world will be exposed to the threat of Alchemy.", 'The Wise One');
  yield E.say("It can be a dangerous power if it is misused... If the Elemental Stars ignite the flames of the four lighthouses, that power will be released. As long as the four lighthouses remain unlit...", 'The Wise One');
  yield E.say("The volcano... It's erupting... Flee, now! Ah. I see. I will help you...", 'The Wise One');
  Engine.doFlash(10, '#ff6030'); Audio.sfx('quake'); yield E.shake(40);
  Engine.doFlash(20, '#ffffff'); yield Engine.fadeOut(30); E.despawn('WiseOneS');
  G.set('sanctum_escaped'); G.set('sanctum_done');
  E.warpNow('vale', 6, 2, DIR.DOWN); yield 10; yield Engine.fadeIn(30);
};
STORY.afterSanctum = function* (E) {
  Audio.play('sad');
  E.spawn('elder2', 16, 13, { type: 'priest', name: 'Great Healer' }); E.spawn('DoraA', 18, 13, { look: NPC_LOOKS.Dora, name: 'Dora' });
  yield E.say('Isaac! Garet! Thank goodness you\'re alive! The mountain... it shook so violently!', 'Dora');
  yield E.say("I thought Mt. Aleph was inactive... Tell us what happened in the sanctum, boys.", 'Great Healer');
  yield E.say('(Isaac and Garet tell of Saturos, Menardi, Felix, Alex... and the Wise One.)');
  yield E.pan(20, 3, 40); Audio.sfx('quake'); yield E.shake(24);
  yield E.say('(Smoke pours from the peak of Mt. Aleph. The ground has not stopped trembling.)');
  Engine.doFlash(12, '#ffffff'); Audio.play('lighthouse'); E.spawn('WiseOneV', 20, 1, { animal: 'wiseone', name: 'The Wise One', solid: false });
  yield E.say('(The Wise One appears above the sanctum!)');
  yield E.say("The Elemental Stars have been taken. If the lighthouses are lit, Alchemy will be unleashed upon Weyard. Isaac, Garet... You must pursue them. Stop them from lighting the beacons.", 'The Wise One');
  Engine.doFlash(12, '#ffffff'); E.despawn('WiseOneV'); yield E.say('(The Wise One vanishes.)'); yield E.panBack(30);
  yield E.say('Are you suggesting we place the fate of the world... in the hands of Isaac and Garet?', 'Dora');
  yield E.say("Garet is only a child. You can't expect him to bear such a burden...", 'Old Man');
  yield E.say('The Wise One has spoken. Each of you shares responsibility for this. Now, each of you must make your own decision!', 'Great Healer');
  yield E.say("I don't know what to do. Isaac, you decide.", 'Garet');
  let yes = (yield* E.ask('Isaac, will you accept responsibility for the fate of the land?', 'Great Healer', ['Yes', 'No'])) === 0;
  if (!yes) {
    yield E.say("I can't blame you... I couldn't do it if I were in your shoes.", 'Old Man');
    yield E.say('Think again, Isaac. The stars are already on the road. There is no one else.', 'Great Healer');
    yes = (yield* E.ask('Isaac, will you accept responsibility for the fate of the land?', 'Great Healer', ['Yes', 'No'])) === 0;
    if (!yes) {
      yield E.say('...So be it. Then the stars go to the lighthouses, and Weyard waits for its end.', 'Great Healer');
      yield Engine.fadeOut(60); yield E.say('The four beacons were lit one by one, and the world was drawn back into the chaos it had been saved from. Vale was the first to go.');
      yield E.say("THE END... is not what the Wise One had in mind. Try again, Isaac.");
      G.field.gameOver(); yield () => false;
    }
  }
  yield E.say("You accept? Oh, Isaac... You can't mean it...", 'Garet');
  yield E.say('You chose to leave your decision to Isaac. There shall be no further discussion.', 'Old Man');
  yield E.say('O, Wise One, these two have accepted your quest. Give us your next command!', 'Great Healer');
  Engine.doFlash(12, '#ffffff'); E.spawn('WiseOneV', 20, 1, { animal: 'wiseone', name: 'The Wise One', solid: false });
  yield E.say('You two are quite brave to take on this quest. I shall be watching you. Choose your destiny wisely, young ones.', 'The Wise One');
  Engine.doFlash(12, '#ffffff'); E.despawn('WiseOneV');
  yield E.say('That was the Wise One...', 'Dora');
  yield E.say('Seek out the elemental Djinn on your road; the Wise One spoke of them. More than that even I cannot tell you. Rest tonight. Vale will see you off in the morning.', 'Great Healer');
  yield E.say('Tomorrow? ...Yes.', 'Dora');
  E.despawn('elder2'); E.despawn('DoraA'); G.field.refreshNpcs();
  Audio.play('vale');
  yield* E.chapter('Chapter 1: The Pursuit Begins');
};
// the next morning at the town gate: the whole village to see the boys off, Garet's sister's herb, the Catch Beads
// Dora sends by Isaac's nephew, the Mayor's farewell - and, outside, the first Djinni
STORY.leaveVale = function* (E) {
  if (!G.flag('vale_farewell')) {
    G.set('vale_farewell');
    yield Engine.fadeOut(30); Audio.play('vale');
    const p = G.field.player; p.tx = 13; p.ty = 51; p.px = 13 * TILE; p.py = 51 * TILE; p.dir = DIR.DOWN; E.gather();
    E.spawn('fw_healer', 13, 54, { type: 'priest', name: 'Great Healer', dir: DIR.UP }); E.spawn('fw_priest', 11, 54, { type: 'priest', name: 'Priest', dir: DIR.UP });
    E.spawn('fw_sis', 10, 52, { type: 'villager_f', name: "Garet's Sister", dir: DIR.RIGHT }); E.spawn('fw_mom', 9, 53, { type: 'villager_f', name: "Garet's Mother", dir: DIR.RIGHT });
    E.spawn('fw_boy', 16, 52, { type: 'child_m', name: 'Boy', dir: DIR.LEFT }); E.spawn('fw_mayor', 15, 54, { type: 'elder_m', name: 'Mayor', dir: DIR.UP });
    E.spawn('fw_kid1', 19, 48, { type: 'child_f', name: 'Girl', dir: DIR.DOWN }); E.spawn('fw_kid2', 20, 48, { type: 'child_m', name: 'Boy', dir: DIR.DOWN });
    yield Engine.fadeIn(30);
    yield E.say("Why's everyone hanging around the town gate?", 'Girl');
    yield E.say("What, didn't you hear? Isaac and Garet are leaving Vale on a journey.", 'Boy');
    yield E.say('I wish I could go!', 'Girl'); yield E.say("I heard it's going to be really dangerous!", 'Boy');
    yield E.say("Weird. Isaac's mother isn't there to see him off! ...Hey, should we go say good-bye, too?", 'Girl');
    yield E.say("Sure! Let's go!", 'Boy'); E.move('fw_kid1', DIR.DOWN, 3); yield E.move('fw_kid2', DIR.DOWN, 3);
    yield E.say('We are counting on you, Isaac. Oh, and you, too, Garet.', 'Great Healer');
    yield E.say("Don't drink the water if it smells funny. And... take this with you, too.", "Garet's Sister"); yield E.give('Herb');
    yield E.say('I know not to drink stagnant water, Sis!', 'Garet');
    yield E.say("Don't listen to him, Isaac! He's a pig! He'll eat anything that's not tied down!", 'Boy');
    yield E.say('Hmm... Dora is very late...', 'Priest');
    yield E.say("Oh! That's right! Aunty Dora asked me to give this to you, Isaac.", 'Boy'); yield E.give('Catch Beads');
    yield E.say("I guess we're all set to go, huh, Isaac?", 'Garet');
    yield E.say('Think again, Garet! It must be very difficult for Dora...', "Garet's Sister");
    yield E.say("As Garet's mother, I know how Dora must be feeling. But I still have Garet's father, while Dora has only Isaac. She doesn't want you to go, Isaac, but she knows you have to, and it hurts to see you leave.", "Garet's Mother");
    yield E.say("They can't keep standing around here like this, or they'll never leave. So, one final farewell!", 'Mayor');
    yield E.say('Farewell!', 'Villagers');
    yield Engine.fadeOut(40); for (const id of ['fw_healer', 'fw_priest', 'fw_sis', 'fw_mom', 'fw_boy', 'fw_mayor', 'fw_kid1', 'fw_kid2']) E.despawn(id);
    E.warpNow('world_gs1', 44, 12, DIR.DOWN); yield 10; yield Engine.fadeIn(40);
  }
  yield E.say("Saturos and Menardi headed south toward Vault. Let's go, Isaac!", 'Garet'); yield E.say("Wait... something's following us. A little creature!", 'Garet'); yield E.say("I am Flint, a Venus Djinni! The Elemental Stars set us free from Sol Sanctum. Take me with you - I'll lend you my power!", 'Flint'); yield* E.djinn('Flint'); yield E.say('(Tip: Press X or Esc to open the menu. Set Djinn to change your class and Psynergy, or put them on Standby to summon in battle!)'); };
STORY.cantLeaveVale = function* (E) { yield E.say("We can't leave yet! Kraden's waiting for us.", 'Garet'); yield E.move('player', DIR.UP, 1); };
// ============ VAULT ============
STORY.gomaEnter = function* (E) { yield E.say("Goma Cave... It's dark in here. Watch out for bats!", 'Garet'); };
STORY.meetIvan = function* (E) {
  yield E.say("Um... excuse me. You're travelers too, aren't you? My name is Ivan. I serve Master Hammet of Kalay.", 'Ivan');
  yield E.say("Master Hammet's caravan is stranded here since the bridge collapsed. And worse... his precious Shaman's Rod was stolen by thieves!", 'Ivan');
  yield E.say("I can... read minds, you see. It's my Psynergy. The thieves are hiding in the inn's attic! But I'm not strong enough to face them alone.", 'Ivan');
  yield E.say('Will you help me?', 'Ivan');
  const r = yield* E.ask('Help Ivan catch the thieves?', 'Ivan', ['Yes', 'No']);
  if (r !== 0) { yield E.say('Please... reconsider. I will wait here.', 'Ivan'); return; }
  yield E.say('Thank you! Let me come with you!', 'Ivan');
  E.despawn('IvanNPC'); G.set('ivan_joined');
  yield E.join('Ivan', 3, { equip: { weapon: 'Wooden Stick', body: 'Cotton Shirt' } });
  yield E.say("The thieves are in the attic of the inn. Let's go!", 'Ivan');
};
STORY.vaultThieves = function* (E) {
  if (!G.flag('ivan_joined')) { yield E.say("Beat it, kid. We rented this room.", 'Bandit'); return; }
  yield E.say("Hey! Who let you in here?!", 'Bandit');
  yield E.say("(Ivan reads the bandit's mind...) 'The Shaman's Rod is hidden under the floorboards. If they find it, we're done for!'", 'Ivan');
  yield E.say("You're the thieves who stole from Master Hammet! Return the Shaman's Rod!", 'Ivan');
  yield E.say("Grr... You asked for it!", 'Bandit');
  const r = yield* E.battle(['Bandit', 'Thief', 'Thief'], { canFlee: false, boss: true });
  if (r !== 'win') return;
  G.set('vault_thieves_done'); G.field.refreshNpcs();
  yield E.say("We give up! The rod is under the floorboards... take it!", 'Bandit');
  yield E.give("Shaman's Rod"); yield E.give("Bandit's Sword");
  yield E.say("Master Hammet will be so relieved! I must return the rod to him at once.", 'Ivan');
  yield E.say("Thank you, Isaac, Garet. I'll stay here with Master Hammet until his caravan can move again. I hope we meet again... somewhere on the road.", 'Ivan');
  G.party.remove('Ivan'); G.field.rebuildFollowers(); G.set('ivan_left'); G.set('hammet_left');
};
// the falls outside Goma Cave: the stump caught in the ivy, and Ivan's Whirlwind
STORY.gomaIvan = function* (E) {
  yield E.say("It's no use. Our Psynergy isn't strong enough to free that stump.", 'Garet');
  E.spawn('IvanG', 12, 7, { look: CHARACTERS.Ivan.look, name: 'Ivan', dir: DIR.UP }); yield E.walkTo('IvanG', 12, 5); yield E.face('IvanG', DIR.UP);
  yield E.say("You want to move that stump, right? It looks like it's trapped in the ivy. Isn't there anything we can do? I know! I have a great idea. Leave it to me!", 'Ivan');
  Audio.sfx('wind'); Engine.doFlash(8, '#e0ffe0'); yield 20;
  const ivy = G.map.objects.find(o => o.id === 'goma_ivy'); if (ivy) { ivy.gone = true; G.set('obj:' + ivy.key, { gone: true }); } G.set('goma_ivy_cleared');
  yield E.say("(Ivan's Whirlwind tears the ivy from the stump, and it rolls aside.)");
  yield E.say('All right, Ivan!', 'Garet');
  yield E.say('I did it!', 'Ivan');
  yield E.say("...Thanks for the help. But why are you here, Ivan?", 'Garet');
  yield E.say("I couldn't get into Lunpa... Don't get me wrong! I didn't come here to ask for your help. Your quest has been on my mind ever since I left Vault. Remember? I read everything that happened in your minds.", 'Ivan');
  yield E.say("I couldn't just leave, not with all these terrible things happening. If I can't rescue Master Hammet, then I want to help you... Please, allow me to join your quest.", 'Ivan');
  E.despawn('IvanG'); G.set('ivan_joined');
  yield E.join('Ivan', 3, { equip: { weapon: G.inventory.has("Shaman's Rod") ? "Shaman's Rod" : 'Wooden Stick', body: 'Cotton Shirt' } });
  yield E.say("Are you trying to get to Bilibin through this cave? Then let's go!", 'Ivan');
  E.gather();
};
// ============ BILIBIN / KOLIMA ============
// the captain at the palace door sizes the party up and, if they hold their nerve, takes them up to the lord
STORY.mccoyGuard = function* (E) {
  if (G.flag('tret_cured')) { yield E.say(G.flag('mccoy_reward') ? "Lord McCoy is a man of his word, whatever else he is. Safe travels." : "You cured Kolima? Then the lord will want to see you. Go on up, he's in his office.", 'Guard'); return; }
  if (G.flag('mccoy_refused')) { yield E.say("I'm sorry. The lord has made up his mind... about the key, at least. I said nothing about the barricade.", 'Guard'); return; }
  yield E.say("The lord will only meet with brave and mighty warriors. You don't seem the type. Think you're up to it?", 'Guard');
  const r = yield* E.ask('Are you up to it?', 'Guard', ['Yes', 'No']);
  if (r !== 0) { yield E.say("Your honesty is good. But I can't send such inexperienced children to see my lord.", 'Guard'); return; }
  yield E.say("Hmmm, I see... You seem pretty confident...", 'Guard');
  yield E.say("What do you say? They look a little young to get involved in this ugly mess.", 'Other Guard');
  yield E.say("Nobody else seems up to the challenge, though. What do we have to lose?", 'Guard');
  yield E.say("All right. I shall let you pass. Follow me!", 'Other Guard');
  yield* E.warp('bilibin_palace_2', 7, 7, DIR.UP);
  yield* STORY.mccoyAudience(E);
};
// the audience: McCoy weighs the key against the children in front of him, and keeps the key
STORY.mccoyAudience = function* (E) {
  const ivan = !!G.party.get('Ivan');
  yield E.say("What's the matter, then?", 'Lord McCoy');
  yield E.say("Sir! Some new warriors have just arrived in the palace!", 'Guard');
  yield E.say("New warriors, yeh say? We've sent many a man intae Kolima Forest, but not one has returned. These warriors... Did yeh get a good look at 'em?", 'Lord McCoy');
  yield E.say("Come closer, laddy.", 'Lord McCoy'); yield E.walkTo('player', 7, 4);
  yield E.say("Hey... Are these the ones yeh were talking about? They're but children! And yeh expect me to believe yeh can save Kolima?", 'Lord McCoy');
  let r = yield* E.ask('Can you save Kolima?', 'Lord McCoy', ['Yes', 'No']);
  if (r !== 0) yield E.say("Bah! Yeh're too young. Yeh cannae handle the job... Och, but there's nobody else. Say it again, and mean it.", 'Lord McCoy');
  yield E.say("Hmmm. Well, I'll grant yeh're a brave lot. Here. This key'll get yeh past the barricades tae the east... Even with the key, such wee lads as yerselves'll never reach Kolima.", 'Lord McCoy');
  yield E.say("He's making fun of us! Calling us children! That's just irritating, don't you think, Isaac?", 'Garet');
  r = yield* E.ask("Does it bother you?", 'Garet', ['Yes', 'No']);
  yield E.say(r === 0 ? "Well, don't let him get to you. We'll just have to prove we can handle the job, whatever it is!" : "Are you serious, Isaac? It doesn't bother you? ...Fine. Then we'll just prove we can handle it.", 'Garet');
  yield E.say("So, yeh've decided to accept our little job?", 'Lord McCoy');
  if (ivan) {
    yield E.say("Hey, Ivan! You... You don't look too enthusiastic.", 'Garet');
    yield E.say("That curse can turn a man into a tree! You think we stand a chance?", 'Ivan');
    yield E.say("What? Yeah, of course we do! You know we do, right, Isaac?", 'Garet');
    yield E.say("Well, if Isaac's going, I guess I'm in, too.", 'Ivan');
  }
  yield E.say("At least we all agree on something!", 'Lord McCoy');
  yield E.say("What troubles you, Milord? They seem willing enough...", 'Guard');
  yield E.say("They call themselves warriors... but they're naught but wee children! Aye, these are desperate times, but I cannae send such wee lads tae their doom!", 'Lord McCoy');
  yield E.say("Then what will happen to Kolima Forest?", 'Guard');
  yield E.say("We cannae give up hope on our other champions!", 'Lord McCoy');
  yield E.say(ivan ? "But... But what about us?" : "But what about us?", ivan ? 'Ivan' : 'Garet');
  yield E.say("We cannae send yeh intae certain doom.", 'Lord McCoy');
  yield E.say("What if we said that we were going east anyway?", 'Garet');
  yield E.say("Yeh can go once things have settled down.", 'Lord McCoy');
  yield E.say("But that means... you're not going to let us go?", ivan ? 'Ivan' : 'Garet');
  yield E.say("Ach, it's fer yer own good, lad. I dinnae want tae talk about it anymore. Captain?", 'Lord McCoy');
  yield E.say("I'm sorry, but you should leave now.", 'Guard');
  G.set('mccoy_refused');
  yield* E.warp('bilibin', 20, 15, DIR.DOWN);
  yield E.say("Your name was... Isaac? I'm sorry you were rejected. I never, ever, expected anything like this to happen to Bilibin. Will you promise me you won't go to Kolima?", 'Guard');
  r = yield* E.ask("Promise not to go to Kolima?", 'Guard', ['Yes', 'No']);
  yield E.say((r === 0 ? "That's good. " : "You are persistent, aren't you? ") + "That barricade... You may not need a key. Oops... I shouldn't have said anything. Well, I'm going to go now.", 'Guard');
  G.set('barricade_hint'); E.gather();
};
STORY.mccoy = function* (E) {
  if (G.flag('tret_cured')) {
    if (!G.flag('mccoy_reward')) { G.set('mccoy_reward'); yield E.say("Yeh lifted the curse of Kolima? Ach, and I called yeh children! Well, McCoy pays his debts. Go down tae my cellar and take a treasure - one, mind - any one yeh like.", 'Lord McCoy'); yield E.say("The stairs are at the far end of the hall below. The captain's unlocked them.", 'Lord McCoy'); return; }
    yield E.say(G.flag('mccoy_chest') ? "Yeh chose well enough. The road east is open. Safe travels!" : "One treasure from the cellar, laddy. Off yeh go.", 'Lord McCoy'); return;
  }
  if (G.flag('mccoy_refused')) { yield E.say("I said yeh can leave now. It's fer yer own good.", 'Lord McCoy'); return; }
  yield* STORY.mccoyAudience(E);
};
// Kolima: the silent village of tree-people, the sparkles that fall from the sky, the barrier the party's own
// Psynergy throws up without being asked, and the two voices of the forest
STORY.kolimaArrive = function* (E) {
  const ivan = !!G.party.get('Ivan'), who = ivan ? 'Ivan' : 'Garet';
  yield E.say("It's so quiet...", 'Garet');
  if (ivan) { yield E.say("What's the matter, Ivan?", 'Garet'); Audio.sfx('psy'); yield 20; yield E.say("This tree... was a person.", 'Ivan'); }
  else yield E.say("These trees... Isaac, they're shaped like people. They ARE people!", 'Garet');
  yield E.say("Everyone in Kolima has been turned into a tree. Why? Do you know why this happened?", 'Garet');
  let r = yield* E.ask('Do you know why?', 'Garet', ['Yes', 'No']);
  yield E.say(r === 0 ? "I see... It was because they hurt the holy tree?" : "I see... Who could have known?", 'Garet');
  yield E.say("That sparkly stuff on the ground... What is it?", who);
  Engine.doFlash(20, '#e0f0ff'); Audio.sfx('quake'); Engine.doShake(20); yield 30;
  yield E.say("Aaah! What's happening!?", 'Garet');
  yield E.say(ivan ? "My mind!!! Someone is attacking my--" : "Isaac! I can't... I can't move!", who);
  yield E.say("(Paralyzed, they fall. A strange glow comes over the town, and glittering dust begins to drift down across it.)");
  yield E.say("What is that? Something's falling from the sky!", 'Garet');
  yield E.say("It's sparkling! Could this be what turned those people into... We've got to get out of here!", who);
  yield E.say("I can't! I can't move!!", 'Garet');
  Engine.doFlash(30, '#a0e0ff'); Audio.sfx('heal'); yield 40;
  yield E.say("(The dust settles over them... and slides off domes of light that close over each of them.)");
  yield E.say("Isaac... What just happened to us? That barrier... Did it save us?", 'Garet');
  r = yield* E.ask('Did the barrier save us?', 'Garet', ['Yes', 'No']);
  yield E.say((r === 0 ? "I think so, too, Isaac. " : "No, I think Garet is right. ") + "I think I know what those domes were... It was our Psynergy.", who);
  yield E.say("What are you, crazy? I didn't use any Psynergy! Hey... I can stand... I can move again!", 'Garet');
  yield E.say("Those barriers... We thought that Psynergy was only used when we concentrate, right? Some Psynergy must act only when it's needed.", who);
  yield E.say("You mean, like when we're in danger? I think it's like when we strike critical hits in battle. We can't control it, but it's there when we need it.", 'Garet');
  Engine.doFlash(20, '#e0f0ff'); yield 20;
  yield E.say("Watch out! It's happening again!", who);
  yield E.say("(This time they raise the barriers themselves. From somewhere, a voice rumbles...)");
  yield E.say("Hroom! Why? Why don't they turn into trees...?", 'Voice');
  yield E.say("Who are they? What people are these, who are immune to Tret's glamour? Have they come to save that village with their strange powers? It will not be enough to save the people of Kolima.", "Woman's Voice");
  yield E.say("They have earned their fate... Kolima took their axes to me, and now I shall take mine to them!", 'Voice');
  yield E.say("You children may not know this... but we are dying. And Kolima Forest will wither and die when we are gone.", "Woman's Voice");
  yield E.say("Tret was once a kindly forest king. But he is slowly dying, and his heart has torn in two... His wrathful side turned the people of Kolima into trees. The kind Tret speaks no more.", "Woman's Voice");
  yield E.say("Hroom! The kindly heart invites destruction... I need no kindness!", 'Voice');
  yield E.say("If you wish to save those whom Tret turned into trees, you must reawaken his gentle side. But... if you cannot stop Tret from withering, we all will... Look for Tret deep within the forest.", "Woman's Voice");
  yield E.say("It's no use, Laurel. Humans cannot be trusted! I shall die... and the rest of the forest will die with me!", 'Voice');
  yield E.say("Tret... and Laurel. The forest itself is asking for help. Let's find this Tret, deep in the forest.", 'Garet');
};
STORY.kolimaForestEnter = function* (E) { yield E.say("Kolima Forest. The trees here are enormous... and they watch us.", 'Ivan'); yield E.say("(Ivan senses:) 'Whirlwind can clear the vines that block the path. Use it on them.'", 'Ivan'); };
// the clearing: the two great trees, one gentle, one raging
STORY.tretClearing = function* (E) {
  if (G.flag('tret_cured')) return;
  yield E.say("Look at those trees! They're... they have faces!", 'Garet');
  yield E.say("The one on the left is the woman's voice we heard. Laurel. And the other must be Tret.", G.party.get('Ivan') ? 'Ivan' : 'Garet');
};
STORY.laurel = function* (E) {
  if (G.flag('tret_cured')) { yield E.say("Tret has been healed. The forest breathes easy once more. Thank you, Adepts.", 'Laurel'); return; }
  if (G.flag('tret_beaten')) { yield E.say("You have calmed his rage, but he is dying still. Only the sacred water of the Mercury Lighthouse could restore him now... the Hermes' Water, from the fountain at its top.", 'Laurel'); return; }
  yield E.say("You have come this far... but Tret cannot be saved. His heart is torn, and the wrathful half holds him. I am sorry, children.", 'Laurel');
  yield E.say("If you would try anyway, the way into him is the vine on his trunk. But his rage will meet you before his kindness ever could.", 'Laurel');
};
STORY.tretFace = function* (E) {
  if (G.flag('tret_cured')) { yield E.say("Hroom... the forest lives, and so do I, a while yet. Go with my thanks, Adepts.", 'Tret'); return; }
  if (G.flag('tret_beaten')) { yield E.say("Hroom... I have no power left to reach Kolima. Bring me the water Laurel spoke of, if you can.", 'Tret'); return; }
  yield E.say("Hroom! Who dares stand before me? Humans... the same who cut my kin!", 'Tret');
  yield E.say("(Tret's eyes blaze, and the bark of his face knots with rage. Whatever kindness is in him is far below.)");
};
STORY.tretInside = function* (E) { yield E.say("We're inside the tree! Look at the size of this hollow... and there are vines, and webs. He goes up a long way.", 'Garet'); yield E.say("Laurel said his rage would meet us first. Let's be careful where we step.", G.party.get('Ivan') ? 'Ivan' : 'Garet'); };
STORY.tretHeart = function* (E) {
  if (G.flag('tret_beaten')) return;
  yield E.say("(The party lands hard at the bottom of the shaft. The wood here pulses, slow and dark.)");
  yield E.say("Hm HROOOM!!! You! You hoped to find my kindly self? Fools! You should never have come here, and now, you shall never leave!", 'Tret');
  yield E.say("Your powers protected you in the forest, but now you are in the heart of my power! Here, you will all become trees, and you'll wither with the rest of us!", 'Tret');
  yield* STORY.tret(E);
};
STORY.tret = function* (E) {
  if (G.flag('tret_cured')) { yield E.say("The waters of Mercury have healed me. I have lifted the curse. Go, Adepts, with my thanks.", 'Tret'); return; }
  if (G.flag('hermes_water')) {
    yield E.say("You have returned... with the Hermes' Water? I feel its purity...", 'Tret');
    Engine.doFlash(15, '#a0e0ff'); Audio.sfx('heal'); yield 20;
    yield E.say("Ahh... The poison leaves me. My anger fades. I was wrong to curse the innocent. I release them all!", 'Tret');
    G.set('tret_cured'); G.inventory.remove("Hermes' Water");
    yield E.say('(The curse over Kolima is lifted!)');
    yield E.give('Nut', 2); yield E.coins(700);
    return;
  }
  if (G.flag('tret_beaten')) { yield E.say("I can't do it... My power no longer reaches Kolima... People of Kolima... Forgive me...", 'Tret'); return; }
  const r = yield* E.ambush(['Tret'], { boss: true, canFlee: false }, { say: '(The great face in the bark opens its eyes, and the whole tree leans down at the party!)', scale: 1.2 });
  if (r !== 'win') return;
  G.set('tret_beaten'); G.set('barricade_open');
  G.map.setObj(15, 4, 'vine_bark'); G.map.walkable(15, 4); G.map.finalize();
  yield E.say("(A vine tumbles down the shaft and hangs in the corner, the way back up.)");
  yield E.say("Oh... Mmmmm... What has happened to me? Was I... I see... My heart was all but lost in my rage. And you defeated the evil within me? I thank you.", 'Tret');
  yield E.say("I could not leave this world with so much evil in my heart. I am free now to leave the world without regret. Good-bye, great warriors.", 'Tret');
  yield E.say("Hey! Wait a minute! We can't let Tret die like this!", 'Garet');
  if (G.party.get('Ivan')) yield E.say("That's right, Isaac. We still need his help!!", 'Ivan');
  yield E.say("...What? Why have you not left me to my dying? Do you need something?", 'Tret');
  const q = yield* E.ask('Do you need something of Tret?', 'Tret', ['Yes', 'No']);
  if (q !== 0) { yield E.say("What are you doing, Isaac! Now's not the time to fool around!", 'Garet'); yield E.say("We have to save everyone in Kolima!", G.party.get('Ivan') ? 'Ivan' : 'Garet'); }
  yield E.say("I turned the people of Kolima into trees? Hroom! I must release them before they die with the forest!", 'Tret');
  Engine.doFlash(10, '#c0f0a0'); yield 30;
  yield E.say("I can't do it... My power no longer reaches Kolima... People of Kolima... Forgive me...", 'Tret');
  yield E.say("Tret's too weak! He doesn't have the power to save Kolima.", 'Garet');
  yield E.say("No! We have to heal him! We can't let the people of Kolima die with the forest!", G.party.get('Ivan') ? 'Ivan' : 'Garet');
  yield E.say("Laurel spoke of the Mercury Lighthouse... the Hermes' Water. North, past Imil. That's where we're going.", 'Garet');
  G.map.setObj(15, 4, 'vine_bark'); G.map.walkable(15, 4); G.map.finalize();
};
// Kolima Bridge: the deck stands raised until the keeper is a man again and works the winch
STORY.kolimaBridge = function* (E) {
  if (G.flag('kolima_bridge_fixed')) return;
  if (!G.flag('tret_cured')) {
    if (G.flag('kbridge_seen')) { yield E.say("Still up. Nobody at the winch but that tree.", 'Garet'); return; }
    G.set('kbridge_seen');
    yield E.say("A drawbridge... and it's up. Who lowers it?", 'Garet');
    yield E.say("There's a winch on the far post, and a tree standing beside it. The keeper of the bridge, if I had to guess... one more of Kolima's people.", G.party.get('Ivan') ? 'Ivan' : 'Garet');
    yield E.say("Then it stays up until Tret is cured. Back to the forest.", 'Garet');
    return;
  }
  yield E.face('bridge_keeper', DIR.LEFT);
  yield E.say("Are you going to cross the bridge?", 'Bridge Keeper');
  const r = yield* E.ask('Cross the bridge?', 'Bridge Keeper', ['Yes', 'No']);
  if (r !== 0) { yield E.say("Then stand back from the gate. It's a heavy thing when it comes down.", 'Bridge Keeper'); return; }
  yield E.say("Oh... Right! Go on ahead!", 'Bridge Keeper');
  yield E.face('bridge_keeper', DIR.UP); Audio.sfx('quake'); Engine.doShake(10); yield 30;
  G.set('kolima_bridge_fixed'); kbridgeDeck(G.map, true); G.map.finalize(); Audio.sfx('boom'); Engine.doShake(6); yield 20;
  yield E.face('bridge_keeper', DIR.LEFT);
  yield E.say("There. I'd have had it down sooner, but... I wasn't myself for a while. You'd know about that, I hear. Fuchin's temple is south, past the bend.", 'Bridge Keeper');
};
// ============ IMIL / MERCURY LIGHTHOUSE ============
// Imil: the sick village, the children in the sanctum who know where the healer is, and Mia at the old man's bedside
STORY.imilArrive = function* (E) {
  yield E.say("(A cough carries over the snow. Then another, from the next house.)");
  yield E.say("Everyone's sick... The whole village sounds like it's coughing.", 'Garet');
  yield E.say("Tret's cure is up at the Lighthouse, Laurel said. But let's ask around here first - somebody must know the way.", G.party.get('Ivan') ? 'Ivan' : 'Garet');
};
STORY.imilKids = function* (E) {
  if (G.flag('imil_kids')) { yield E.say("Did you find Mia? She's at Grandpa Hanan's, the first house up from the south gate.", 'Justin'); return; }
  yield E.say("We come to the sanctum to pray for everyone. Mia says prayers help, a little.", 'Megan');
  yield E.say("Mia's the healer. She's the only one who can make the coughing stop... but she's just one person, and there are so many sick.", 'Justin');
  yield E.say("She's at Grandpa Hanan's house right now. The first house up from the south gate, by the river. She'd know about the Lighthouse, too - her family's always guarded it.", 'Megan');
  G.set('imil_kids');
};
STORY.meetMia = function* (E) {
  yield E.say("How are you feeling?", 'Mia');
  yield E.say("Cough... Cough...", 'Old Man');
  yield E.say("He's been coughing for quite a while, now...", 'Old Woman');
  yield E.say("You'll feel better soon.", 'Mia');
  Audio.sfx('heal'); Engine.doFlash(12, '#a0e0ff'); yield 30;
  yield E.say("Cough cough... Cough... Cough... Cough...", 'Old Man');
  yield E.say("How do you feel now?", 'Mia');
  yield E.say("Much better...", 'Old Man');
  yield E.say("No, Grandpa. You mustn't push yourself too hard!", 'Mia');
  yield E.say("Thank you, Mia... I can't imagine how this village would ever manage without you... Cough...", 'Old Woman');
  yield E.say("Don't mention it... You should rest in bed, too, ma'am.", 'Mia');
  yield E.face('MiaNPC', DIR.DOWN);
  yield E.say("Who are you? Can I help you?", 'Mia');
  Engine.doFlash(30, '#c0e8ff'); Audio.sfx('psy'); yield 40;
  yield E.say("(A bright light shines outside. Mia runs to the window.)");
  yield E.say("Was that the lighthouse? It can't be... Only I can... Oh, no... Alex!!!", 'Mia');
  yield E.walkTo('MiaNPC', 6, 8); E.despawn('MiaNPC'); G.set('mia_left_for_lh');
  yield E.say("She's gone! Straight out the door!", 'Garet');
  yield E.say("The Mercury Lighthouse... that light came from the north. If she's going there, so are we.", G.party.get('Ivan') ? 'Ivan' : 'Garet');
};
// the foot of the Lighthouse: Mia at the sealed door, the statue in her way, and the Ply that opens the way in
STORY.miaLighthouse = function* (E) {
  if (G.flag('mia_lh_door_talked')) { yield E.say("This statue... I can't get past it. And the door only answers to my clan's Psynergy.", 'Mia'); return; }
  G.set('mia_lh_door_talked'); G.set('mia_lh_door_scene');
  yield E.say("Somebody... is here. Someone is here... Can you hear it, too?", 'Mia');
  const r = yield* E.ask('Can you hear it?', 'Mia', ['Yes', 'No']);
  if (r !== 0) yield E.say("You can't hear it? Well, I can.", 'Mia');
  yield E.say("Alex is the only one other than I who can enter Mercury Lighthouse. But this statue is blocking my way...", 'Mia');
  yield E.face('MiaLH', DIR.UP); yield E.emote('MiaLH', '...'); yield 20;
  yield E.say("It won't budge. Not an inch...", 'Mia');
};
// Isaac's Move shoves the statue aside: Mia saw the force that did it, and she opens the door
STORY.miaDoorStatue = function* (E) {
  if (G.flag('mia_lh_door') || !G.flag('mia_left_for_lh')) return;
  yield E.face('MiaLH', DIR.DOWN); yield E.emote('MiaLH', '!'); yield 20;
  yield E.say("Did you do that?", 'Mia');
  const r = yield* E.ask('Did you do that?', 'Mia', ['Yes', 'No']);
  yield E.say(r === 0 ? "I knew it... I saw a ghostly force pushing it!" : "No, I saw it! I'm certain that flow of force came from you.", 'Mia');
  yield E.say("You... You could see our Psynergy?", 'Garet');
  yield E.say("Psynergy... Is that what you call that power?", 'Mia');
  yield E.say("We had thought you were using Psynergy when you healed that old man, Mia.", 'Ivan');
  yield E.say("That's a special power, handed down to members of the Mercury Clan from generation to generation. It is called Ply, a power generated through meditation. It was once much stronger...", 'Mia');
  yield E.say("This Mercury Clan sounds a little like people of Vale, don't you think?", 'Garet');
  const r2 = yield* E.ask('Like Vale?', 'Garet', ['Yes', 'No']);
  yield E.say(r2 === 0 ? "Sure... They're the sworn protectors of a special power, just like us!" : "Oh, come on! Both of them are protectors of special powers! It's just the names that are different!", 'Garet');
  yield E.say("I have to go... I have to find whoever entered the lighthouse.", 'Mia');
  yield E.walkTo('MiaLH', 14, 15); yield E.face('MiaLH', DIR.UP);
  Audio.sfx('heal'); Engine.doFlash(15, '#a0e0ff'); yield 30; Audio.sfx('dooropen');
  G.set('mia_lh_door'); G.map.finalize();
  yield E.walkTo('MiaLH', 14, 14); E.despawn('MiaLH');
  yield E.say("She opened it! The door... it answered her Psynergy.", 'Garet');
  yield E.say("Then we can follow her in. Whoever's up there, she shouldn't face them alone.", 'Ivan');
};
// the Lizard Man in the entrance hall, and Mia going on ahead once it is beaten
STORY.lhLizard = function* (E) {
  if (G.flag('lh_lizard_done')) return;
  yield E.say("It won't let me pass...! Please, get away from me!", 'Mia');
  yield E.face('lh_lizard', DIR.DOWN); Audio.sfx('encounter'); yield E.emote('lh_lizard', '!'); yield 20;
  yield E.say("It's turned on us! Isaac, look out!", 'Garet');
  const r = yield* E.battle(['Lizard Man'], { boss: false, canFlee: false });
  if (r !== 'win') return;
  G.set('lh_lizard_done'); E.despawn('lh_lizard');
  yield E.say("Thank you... You've saved me. But I can't stop - I have to catch up with Alex before he reaches the aerie.", 'Mia');
  yield E.walkTo('MiaLH2', 7, 1); E.despawn('MiaLH2'); G.map.finalize();
  yield E.say("She's off again. Well, it's a lighthouse - there's only one way to go. Up.", 'Garet');
};
// the blue statue on the span over the pit: Isaac's Move sends it over the edge, and Mia has decided
STORY.miaStatue = function* (E) {
  if (G.flag('mia_joined')) return;
  yield E.say("It's you again... This statue is standing right on the bridge. There's no other way across the pit.", 'Mia');
  yield E.say("If it would only move... but it's stone, and I'm not strong enough to push it.", 'Mia');
  yield E.say("Leave it to us.", 'Garet');
};
STORY.pitStatue = function* (E) {
  const o = G.map.objects.find(ob => ob.id === 'lh_pit_statue'); if (!o) return;
  Audio.sfx('push'); yield 10; o.gone = true; G.set('obj:' + o.key, { gone: true }); Audio.sfx('boom'); Engine.doShake(8); yield 30;
  yield E.say("(The statue tips over the edge of the span and drops out of sight into the pit.)");
  if (G.flag('mia_joined')) return;
  yield E.face('MiaLH3', DIR.LEFT);
  yield E.say("You've saved me again, haven't you! Do you have business in the lighthouse, too?", 'Mia');
  for (let i = 0; ; i++) {
    const r = yield* E.ask('Do you have business here?', 'Mia', ['Yes', 'No']);
    if (r === 0) break;
    yield E.say(i === 0 ? "Please tell the truth! I can't believe you'd go so far to help someone you just met. You have some errand in this lighthouse, don't you?" : i === 1 ? "Please tell the truth!" : "Please, don't hide anything. Just tell me the truth!", 'Mia');
  }
  yield E.say("I thought so... I am sure there will be more places ahead that I cannot pass alone. Only those of the Mercury Clan are permitted to enter this place.", 'Mia');
  yield E.say("However, I sense there is something special about you. I feel that I can trust you!", 'Mia');
  E.despawn('MiaLH3'); G.set('mia_joined');
  yield E.join('Mia', 4, { equip: { weapon: 'Wooden Stick', body: 'One-Piece Dress' }, djinn: ['Fizz'] });
  yield E.say("(A Mercury Djinni peeks out from behind Mia's cloak.)");
  yield E.say("Oh - this is Fizz. It's been following me since I was small. It seems to like you, too.", 'Mia');
  yield E.say("The Mercury Djinni Fizz is set to Mia!");
  yield E.say("The waters of this house answer to my clan's Ply. Where the way seems closed, let me try it.", 'Mia');
};
// the goddess of the pool: Ply on her heart, and the pale stones in the water come alive
STORY.goddessPly = function* (E) {
  Audio.sfx('heal'); Engine.doFlash(20, '#a0e0ff'); yield 30;
  G.set('mercury_ply'); Audio.sfx('psy'); Engine.doShake(6); yield 20;
  yield E.say("(A light passes down through the goddess into the water. All through the house, the pale stones in the pools begin to shine!)");
  yield E.say("'He who honors the heart of the goddess shall stand at the center of all'... The stones will hold us now, for a few steps at a time.", G.party.get('Mia') ? 'Mia' : 'Ivan');
  yield E.say("Then the water's a floor. Let's go.", 'Garet');
};
// the rainbow's statue: Ply on it, and the last fall runs upward to the aerie
STORY.rainbowPly = function* (E) {
  Audio.sfx('heal'); Engine.doFlash(20, '#a0e0ff'); yield 30;
  G.set('lh_rainbow'); Audio.sfx('water'); Engine.doShake(10); yield 30;
  yield E.say("(The waterfall shudders... and reverses! The water climbs upward into the light.)");
  yield E.say("'Guided to the heavens upon wings of fluid grace.' The fall will carry us up. Step into it.", G.party.get('Mia') ? 'Mia' : 'Ivan');
  const M = G.map; for (const x of [5, 6, 7, 8]) { M.setObj(x, 4, 'lh_fall'); M.walkable(x, 4); } M.exit(5, 4, 4, 1, 'mercury_lh_top', 23, 19, DIR.UP, { door: true }); M.finalize();
};
// the fountain of Hermes in the court: dry while the beacon is dark, brimming once it burns
STORY.hermesWater = function* (E) {
  if (!G.flag('mercury_lit')) { yield E.say("(A dry fountain. The basin is cracked and dusty; the statue over it holds an empty ewer.)"); yield E.say("'The fountain shall be filled as long as light fills the house'... but there's no light, and no water.", G.party.get('Mia') ? 'Mia' : 'Garet'); return; }
  if (!G.inventory.has('Empty Bottle')) { yield E.say("The fountain of Hermes runs over with clear water. It is the Hermes' Water of the old tales - but the party has nothing to carry it in."); yield E.say("An Empty Bottle would do it. There was one in Imil, I'm sure of it.", 'Ivan'); return; }
  G.inventory.remove('Empty Bottle'); Audio.sfx('water'); Engine.doFlash(10, '#a0e0ff'); yield 20;
  G.set('hermes_water'); yield E.give("Hermes' Water");
  yield E.say("The Water of Hermes... It can cure any ailment. This is what Laurel meant - this will heal Tret.", 'Mia');
};
// the aerie: too late - the beacon burns; Jenna and Kraden on the far lift, Saturos alone, and Alex
STORY.mercuryAerie = function* (E) {
  yield E.pan(13, 4); yield 30;
  yield E.say("It's too late! The lighthouse has already been lit!", 'Garet');
  yield E.say("It... It can't be! The beacon cannot be lit without the Mercury Star...", 'Mia');
  yield E.panBack();
  yield E.say("...The Elemental Stars were stolen from Sol Sanctum, on Mt. Aleph.", 'Ivan');
  yield E.say("Mt. Aleph... Sol Sanctum... Are you healers from Sol Sanctum?", 'Mia');
  const r = yield* E.ask('Healers from Sol Sanctum?', 'Mia', ['Yes', 'No']);
  yield E.say(r === 0 ? "We came from a village called Vale to recover the three Elemental Stars. But, unlike you, we are not healers." : "We came from Mt. Aleph, but we're not healers. We came from a village called Vale to recover the three Elemental Stars.", 'Garet');
  yield E.say("Did you say Vale?", 'Mia');
  yield E.say("Our village was there to protect Sol Sanctum, but the Stars were stolen.", 'Garet');
  yield E.say("That sounds just like my clan... I have failed in the one duty placed upon me... This is terrible.", 'Mia');
  // the far lift comes up with the hostages and Menardi
  E.spawn('MenardiA', 2, 18, { look: NPC_LOOKS.Menardi, name: 'Menardi', dir: DIR.RIGHT }); E.spawn('FelixA', 4, 18, { look: NPC_LOOKS.Felix, name: 'Felix', dir: DIR.RIGHT });
  E.spawn('JennaA', 3, 19, { look: NPC_LOOKS.Jenna, name: 'Jenna', dir: DIR.RIGHT }); E.spawn('KradenA', 4, 19, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.RIGHT });
  Audio.sfx('stairs'); yield E.pan(4, 17); yield 20;
  yield E.say("Isaac! Garet!", 'Jenna');
  yield E.say("So it's you, Isaac!", 'Felix');
  yield E.say("Heh heh! Those kids are still alive? You came all this way to save Jenna and Kraden?", 'Menardi');
  yield E.panBack();
  yield E.say("That's not all... We're after the Elemental Stars!", 'Garet');
  yield E.pan(4, 17);
  yield E.say("In other words, they've come to stop us. Then we have no choice... Let's take care of them now, before they can do any harm!", 'Menardi');
  Audio.play('villain');
  E.spawn('SatA', 13, 7, { look: NPC_LOOKS.Saturos, name: 'Saturos', dir: DIR.DOWN });
  yield E.pan(13, 8); yield E.say("Menardi... Wait!", 'Saturos');
  yield E.walkTo('SatA', 13, 11);
  yield E.say("Oh, Saturos... They want to...", 'Menardi');
  yield E.say("I heard everything. They were lucky to survive the eruption of Mt. Aleph. You have endured so much, and now you want to throw your lives away? Fine. If that is your wish, prepare to have it granted.", 'Saturos');
  yield E.say("Saturos... Are you going to fight them alone?", 'Menardi');
  yield E.say("Menardi, I can't expect you to leave our hostages alone and help me, can I?", 'Saturos');
  yield E.say("Umm... That's true...", 'Menardi');
  yield E.say("Besides, I want to see how much their powers have developed.", 'Saturos');
  yield E.say("Are you sure about this, Saturos?", 'Menardi');
  yield E.say("Leave me be! Head for the next lighthouse - now!", 'Saturos');
  yield E.pan(4, 17); yield E.face('MenardiA', DIR.RIGHT);
  yield E.say("Come here, child...", 'Menardi');
  yield 20; yield E.emote('JennaA', '...');
  yield E.say("Do you mean to defy me? I should teach you a lesson, child, but... Felix, I'd get your sister to obey me, if you hope to keep her from harm.", 'Menardi');
  yield E.say("Jenna, please... Just do as she says for now.", 'Felix');
  yield E.say("Felix...", 'Jenna');
  yield E.say("It's all right, Jenna.", 'Kraden');
  yield E.say("Isaac and Garet shouldn't have come after us...", 'Felix');
  yield E.say("I'm sorry, Isaac, Garet...", 'Jenna');
  yield E.say("I'm counting on you!", 'Menardi');
  yield E.say("Isaac! Garet! Don't die!", 'Kraden');
  Audio.sfx('stairs'); Engine.doFlash(8, '#ffffff'); for (const id of ['MenardiA', 'FelixA', 'JennaA', 'KradenA']) E.despawn(id); yield 20;
  yield E.panBack();
  yield E.say("Jenna... Kraden!", 'Garet');
  yield E.pan(13, 11);
  yield E.say("If you want to save them, you'll have to beat me, first!", 'Saturos');
  yield E.panBack();
  yield E.say("No! Get back!", 'Mia');
  yield E.say("Saturos is extremely powerful. I could sense it when I faced him.", 'Garet');
  yield E.say("You have to be very careful when fighting him... We have to match his strength...", 'Ivan');
  yield E.pan(13, 11);
  yield E.say("Match me? Pah! You think you can match the great Saturos?", 'Saturos');
  const r2 = yield* E.ask('Can you match him?', 'Saturos', ['Yes', 'No']);
  yield E.say(r2 === 0 ? "You overestimate your chances. Fine then... I'll just teach you all a lesson!" : "And yet you still want to fight? Ship of fools... Fine then... I'll just teach you all a lesson!", 'Saturos');
  yield E.walkTo('SatA', 13, 13); yield E.face('SatA', DIR.UP); yield 20; yield E.face('SatA', DIR.DOWN);
  yield E.say("What's happened? Saturos is moving strangely.", 'Mia');
  yield E.say("What's this!? The light of Mercury... It's weakening my Psynergy! I must finish this quickly... Come on, fools!", 'Saturos');
  yield E.panBack();
  const rb = yield* E.battle(['Saturos'], { boss: true, canFlee: false, music: 'boss' });
  if (rb !== 'win') return;
  yield E.say("Isaac, we got him!", 'Garet');
  yield E.say("Who would have thought that Mercury Lighthouse held such great power? If only my Psynergy had been at its full power...", 'Saturos');
  yield E.say("Saturos... You said you were weakened. What did you mean?", 'Ivan');
  yield E.say("I... I meant nothing...", 'Saturos');
  yield E.say("I shall tell you what he means...", 'Alex');
  yield E.say("That voice! Could it be?", 'Mia');
  E.spawn('AlexA', 13, 7, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN }); yield E.pan(13, 8); yield E.walkTo('AlexA', 13, 12);
  yield E.say("Alex!", 'Mia');
  yield E.say("It's been a while, Mia.", 'Alex');
  yield E.say("Alex, do you realize what you've done?", 'Mia');
  yield E.say("Ha! Of course... I have freed a great power that has long been sealed away. Mercury, the lighthouse of Water... What a mighty force.", 'Alex');
  yield E.say("Alex, you... Are you mad?", 'Mia');
  yield E.say("No, Mia... Don't you understand? The lighthouse granted you great power during your battle with Saturos.", 'Alex');
  yield E.say("It's true... I could use my power without ever depleting it.", 'Mia');
  yield E.say("Don't you see? The Mercury Lighthouse supplied you with limitless Psynergy.", 'Alex');
  yield E.say("Psynergy? Are you telling me my powers come from Psynergy?", 'Mia');
  yield E.say("You and I are both members of the Mercury Clan... Masters of Water Psynergy.", 'Alex');
  yield E.panBack();
  yield E.say("Mia is an Adept too, isn't she?", 'Garet');
  const r3 = yield* E.ask('Is Mia an Adept?', 'Garet', ['Yes', 'No']);
  yield E.say(r3 === 0 ? "Geez, Isaac, you knew all along, and you didn't tell us?" : "I know it's hard to believe, but it looks like Mia's one of us.", 'Garet');
  yield E.say("Tell me, Alex... Why wasn't Saturos able to use his full power?", 'Ivan');
  yield E.pan(13, 11);
  yield E.say("Ah, yes... I shall explain it all. Saturos is aligned with Mars, the clan of fire. Fire and water are opposing elements... His full power was bound by the Water Psynergy of the lighthouse.", 'Alex');
  yield E.say("Didn't Saturos know that?", 'Mia');
  yield E.say("Of course he knew. However, he failed to appreciate the power of this lighthouse. As did I...", 'Alex');
  yield E.say("Is that why we were able to defeat Saturos?", 'Garet');
  yield E.say("No... There is more to it. I stood by, watching your battle from afar...", 'Alex');
  yield E.say("You were watching us?", 'Ivan');
  yield E.say("Yes. I did not help Saturos, because I was certain he would win. But I was wrong... You have become such great fighters in a short time.", 'Alex');
  yield E.jump('SatA'); yield 10;
  yield E.say("Saturos is up again!? But we beat him!", 'Ivan');
  yield E.say("Me? Beaten? Never! I lost to this lighthouse, not to you!", 'Saturos');
  yield E.say("I was merely stalling you until Saturos regained his strength.", 'Alex');
  yield E.say("You were just buying time! That's not fair, Alex!", 'Mia');
  yield E.say("I won't let Saturos escape!", 'Garet');
  yield E.say("And just what are you going to do? Will you finish him off?", 'Alex');
  const r4 = yield* E.ask('Finish him off?', 'Alex', ['Yes', 'No']);
  yield E.say(r4 === 0 ? "If that's the case, you will have to fight me, as well. I've seen how you fight. You cannot hope to win. And I doubt you are the type to 'finish' anyone off!" : "Yes, Isaac. You seem like a smart warrior. You can't beat our combined might, now that we've seen how you fight. And I doubt you are the type to 'finish' anyone off!", 'Alex');
  yield E.say("Of course, you are welcome to believe anything you want.", 'Saturos');
  Audio.sfx('psy'); Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexA'); yield 25; E.spawn('AlexA', 10, 12, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN }); Engine.doFlash(8, '#a0e0ff'); yield 20;
  yield E.say("He warped again!", 'Garet');
  yield E.say("Again? He's done that before?", 'Mia');
  yield E.say("Yeah, in Sol Sanctum...", 'Garet');
  yield E.say("That Psynergy... the warp. Does that mean Mia can use it?", 'Ivan');
  yield E.say("No, it's impossible. Even Alex didn't have that kind of power before.", 'Mia');
  yield E.say("Ah, well... I can't stay the same Alex you knew forever...", 'Alex');
  Audio.sfx('stairs'); yield 20;
  yield E.say("Well, it seems that my ride has returned while we were speaking. And so, I bid you adieu.", 'Alex');
  yield E.say("Isaac, Saturos still has the Elemental Stars!", 'Ivan');
  yield E.say("That's right! We can't let them leave now!", 'Garet');
  yield E.say("Oh? And you want to take the Elemental Stars from Saturos?", 'Alex');
  const r5 = yield* E.ask('Take the Stars?', 'Alex', ['Yes', 'No']);
  yield E.say(r5 === 0 ? "Ha! Too bad! Menardi has them. You'll have to ask her!" : "Ha! You're right... Menardi has the Elemental Stars!", 'Saturos');
  yield E.say("That reminds me... Do you still have the Mars Star?", 'Alex');
  const r6 = yield* E.ask('Still have the Mars Star?', 'Alex', ['Yes', 'No']);
  yield E.say(r6 === 0 ? "I appreciate your honesty." : "Are you telling the truth? Well, I shall believe you for now.", 'Alex');
  Audio.sfx('psy'); Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexA'); E.despawn('SatA'); yield 20;
  E.spawn('AlexA', 2, 18, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.RIGHT }); E.spawn('SatA', 3, 19, { look: NPC_LOOKS.Saturos, name: 'Saturos', dir: DIR.RIGHT }); Engine.doFlash(8, '#a0e0ff');
  yield E.pan(4, 17); yield 20;
  yield E.say("I suppose you'll be willing to pursue us for the Elemental Stars?", 'Alex');
  const r7 = yield* E.ask('Will you pursue them?', 'Alex', ['Yes', 'No']);
  yield E.say(r7 === 0 ? "I look forward to it. I shall see you soon, then. Good-bye." : "That's too bad... I shall look forward to seeing you again. Good-bye.", 'Alex');
  yield E.say("I look forward to our next battle.", 'Saturos');
  Audio.sfx('stairs'); Engine.doFlash(8, '#ffffff'); E.despawn('AlexA'); E.despawn('SatA'); yield 30; yield E.panBack();
  Audio.play('lhtop');
  yield E.say("They're gone...", 'Ivan');
  yield E.say("Shoot... We couldn't even save Jenna...", 'Garet');
  yield E.say("I don't deserve to be a healer... We couldn't stop them from lighting the beacon. I've failed my clan, failed in my duty...", 'Mia');
  yield E.say("That's not true! We can still best them, right, Isaac?", 'Ivan');
  const r8 = yield* E.ask('Can you still best them?', 'Ivan', ['Yes', 'No']);
  yield E.say(r8 === 0 ? "That's right, Isaac! All we have to do is stop them from lighting all the lighthouses! The beacon of Mercury Lighthouse has been lit, but we'll stop them next time." : "You're not helping here! We're fine as long as the lighthouses aren't all lit! The beacon of Mercury Lighthouse has been lit, but we'll stop them next time.", 'Ivan');
  yield E.say("That's right. We can save Jenna at the next lighthouse.", 'Garet');
  yield E.say("Yes. We won't let Alex get away with this... Let's go after them now! What's the matter? We should hurry!", 'Mia');
  yield E.say("We? Mia, are you coming along with us?", 'Garet');
  yield E.say("But the people of Imil need you, Mia.", 'Ivan');
  yield E.say("It's okay. 'The fountain shall be filled as long as light fills the house.' That's an old saying. The fountain will run over with healing waters now.", 'Mia');
  yield E.say("I have mixed feelings about leaving, but Imil will be fine as long as the fountain continues to flow with the Water of Hermes. We should hurry if we're going to follow them.", 'Mia');
  G.set('mercury_lit'); G.set('mercury_done');
  yield E.say("(The fountain of Hermes in the court below will be flowing now. Tret's cure is in it - if there is a bottle to carry it in.)");
  yield* E.chapter('Chapter 2: The Journey South');
};
STORY.mercuryBeaconTouch = function* (E) { yield E.say("The Mercury beacon burns with a cold blue light. Its warmth is not warmth at all, but something clearer."); };
// ============ FUCHIN / MOGALL / XIAN ============
// Fuchin: the master who answers only the mind, the trial in the grotto, and the way through Mogall he teaches after it
STORY.fuchinArrive = function* (E) {
  yield E.say("(Incense on the air, and the roar of the falls under it. Stone lanterns climb the terrace to a house with a blue-tiled roof.)");
  yield E.say("A temple. Somebody here must know the way through the woods to the south.", 'Garet');
};
STORY.nyunpa = function* (E) {
  if (G.flag('nyunpa_done')) { yield E.say("Force the stumps of Mogall, and follow where the apes flee. The way of Ki is the way of the heart. Go in peace.", 'Master Nyunpa'); return; }
  if (G.inventory.has('Orb of Force') || G.flag('force_learned')) {
    yield E.say("You have returned... and you carry the orb. Then the grotto has judged you, and I need not.", 'Master Nyunpa');
    yield E.say("Mogall Forest is endless to those who walk it by the eye alone. The apes know its paths; they hide in the stumps. Strike a stump with the Force the orb gives you, and the ape within will run - and where it runs, the path lies.", 'Master Nyunpa');
    yield E.say("Set the orb in your hand, not your pack: Force is not Psynergy of any element, and it answers only to the one who holds it. Go, Isaac. The ones you follow went south three days ago.", 'Master Nyunpa');
    G.set('nyunpa_done'); return;
  }
  if (G.flag('nyunpa_trial')) { yield E.say("(Master Nyunpa's eyes are closed. Nothing about him moves but the smoke of the incense.)"); yield E.say("(The grotto behind the falls is open to you. The trial waits there.)"); return; }
  yield E.say("(Master Nyunpa sits before the altar with his eyes closed. He does not answer. He does not seem to breathe.)");
  yield E.say("He's like a statue. Hey - Ivan, the monks said he hears without his ears. Maybe that's a hint.", 'Garet');
  yield E.say("Mind Read. If he listens with his mind, that's how we speak to him.", G.party.get('Ivan') ? 'Ivan' : 'Garet');
};
STORY.nyunpaMind = function* (E) {
  if (G.flag('nyunpa_trial')) { yield* E.mindRead("The young ones have the grotto. The poles will know them.", 'Master Nyunpa'); return; }
  yield* E.mindRead("Mmmm... Who is that? Who speaks to my mind?", 'Master Nyunpa');
  yield E.face('Nyunpa', DIR.DOWN); yield E.emote('Nyunpa', '!'); yield 20;
  yield E.say("Young master... Was that your voice I heard in my mind just now?", 'Master Nyunpa');
  let r = yield* E.ask('Was it your voice?', 'Master Nyunpa', ['Yes', 'No']);
  if (r !== 0) { yield E.say("Speak no lies to me!", 'Master Nyunpa'); Audio.sfx('psy'); yield 20; yield E.say("(Master Nyunpa reads Isaac's mind in turn.)"); }
  yield E.say("I knew it! You follow them, do you not?", 'Master Nyunpa');
  r = yield* E.ask('Do you follow them?', 'Master Nyunpa', ['Yes', 'No']);
  if (r !== 0) { Audio.sfx('psy'); yield 20; yield E.say("You speak lies... You are indeed following them!", 'Master Nyunpa'); }
  yield E.say("I knew it! But you must go through Mogall Forest, the endless woods. The forest itself is a mystery, and its paths even more so... No ordinary man can pass from one side to the other.", 'Master Nyunpa');
  yield E.say("But perhaps I could, young master. If you can endure the trials in the waterfall grotto, I will tell you. Will you take the test?", 'Master Nyunpa');
  r = yield* E.ask('Take the test?', 'Master Nyunpa', ['Yes', 'No']);
  if (r !== 0) { yield E.say("Then I cannot tell you. Give up and go back from whence you came.", 'Master Nyunpa'); yield E.face('Nyunpa', DIR.UP); return; }
  Audio.sfx('psy'); Engine.doFlash(8, '#e0d0ff'); yield 20;
  yield E.say("(The master's brow furrows. He is speaking to someone - somewhere - without a word.)");
  yield E.say("Do not worry. You will be permitted to enter the grotto. Go now, Isaac! Just remember, you are not the only ones who can read minds.", 'Master Nyunpa');
  G.set('nyunpa_trial'); yield E.face('Nyunpa', DIR.UP);
  yield E.say("The grotto's behind the falls, down in the plunge pool. The kid outside said there's a door there. Let's go.", 'Garet');
};
STORY.fuchinDragon = function* (E) {
  if (G.flag('fuchin_dragon_eye')) { yield E.say("(The dragon's eyes burn red. The stones of the hidden path lie just under the surface of the water, plain to see.)"); return; }
  if (!G.inventory.has("Dragon's Eye")) { yield E.say("(A stone dragon coiled on the bank, its head turned toward the water. Where its eyes should be there are two empty sockets.)"); yield E.say("It's looking at the water. At nothing, I mean - it hasn't got eyes. Maybe that's the point.", 'Garet'); return; }
  yield E.say("(Isaac sets the Dragon's Eye into the socket.)"); G.inventory.remove("Dragon's Eye");
  Audio.sfx('psy'); Engine.doFlash(12, '#ff8080'); yield 20; G.set('fuchin_dragon_eye');
  const M = G.map; M.setObj(3, 2, 'dragon_statue_eye'); for (let x = 5; x <= 16; x++) { M.set(x, 3, 'cave_shown'); M.walkable(x, 3); } M.finalize();
  Audio.sfx('water'); Engine.doShake(6); yield 20;
  yield E.say("(The dragon's eyes light... and along its gaze, stones show through the water: a path, just under the surface, out to the isle.)");
  yield E.say("'He who walks where there is no path'... It was there the whole time. We just couldn't see it.", G.party.get('Mia') ? 'Mia' : 'Garet');
};
STORY.mogallEnter = function* (E) {
  yield E.say("Mogall Forest... The paths here are said to turn back on themselves. Keep your bearings.", 'Ivan');
  yield E.say("Look - a little ape, watching us from the trees. It ran off south. Let's follow it.", 'Garet');
};
STORY.killerApe = function* (E) {
  yield E.say("The little ape led us here... and its big brother is waiting!", 'Garet');
  const r = yield* E.battle(['Killer Ape'], { boss: true, canFlee: false });
  if (r !== 'win') return;
  yield E.say("The Killer Ape is defeated! Something fell from its fur...");
  yield E.give('Douse Drop'); yield E.say("Douse Drop can be equipped to grant the Douse Psynergy.");
};
// the striking post in Feh's dojo comes down under Force; the door it bolted opens on Feizhi, who has seen something
STORY.fehForce = function* (E) {
  G.set('feh_force_done');
  Engine.doShake(10); yield E.say('The trunk cracks at the base and crashes to the floor! Somewhere in the wall a bolt slides back with a clack.');
  const d = G.map.objects.find(o => o.id === 'feh_door'); if (d) { d.gone = true; G.set('obj:' + d.key, { gone: true }); }
  E.spawn('FeizhiD', 12, 5, { look: NPC_LOOKS.Feizhi, name: 'Feizhi', dir: DIR.LEFT }); yield E.move('FeizhiD', DIR.LEFT, 3);
  yield E.say("The post - somebody struck the post! Master Feh, the door's open - I have to go, I have to go NOW!", 'Feizhi');
  E.spawn('FehD', 12, 5, { type: 'monk', name: 'Master Feh', dir: DIR.LEFT }); yield E.move('FehD', DIR.LEFT, 1);
  yield E.say("Feizhi. Breathe. Where is it you have to go?", 'Master Feh');
  yield E.say("The Alpine Crossing. Hsu is there - I SAW him, under a rock as big as this room, and nobody with him. I saw it the way you see a thing in front of your face.", 'Feizhi');
  yield E.say("The crossing is a day's walk. You cannot have seen -", 'Master Feh');
  yield E.say("Then I'll walk a day. Strangers - if you're going west, come as fast as you can. Please.", 'Feizhi');
  yield E.move('FeizhiD', DIR.DOWN, 5); E.despawn('FeizhiD');
  yield E.say("(Feizhi is out of the door before anyone can answer.)");
  yield E.say("...Forgive her. And forgive me the bolted door: I shut her in so she would sit still long enough to learn stillness. It seems she has learned something else.", 'Master Feh');
  yield E.say("You wonder what we teach here. Ki is the power of the heart, as Master Nyunpa of Fuchin has it - the stillness that hears far. Chi is the body's strength, the striking arm. They are not your Psynergy, though they touch it.", 'Master Feh');
  yield E.say("What Feizhi has is none of those. A rock struck her the day the mountain to the north burned. Since then she sees. If Hsu truly lies under a stone on the crossing, then she is right, and I am a fool, and you should hurry.", 'Master Feh');
  E.despawn('FehD'); G.set('feizhi_seen_hsu'); G.field.refreshNpcs();
};
// the water carrier by the pond: startled, she spills, and the hollow by the east wall fills
STORY.xianWater = function* (E) {
  if (G.flag('xian_hollow_wet')) { yield E.say("I'll be carrying water to the orchard all day at this rate. Mind the wet ground by the east wall - it never drains.", 'Water Carrier'); return; }
  yield E.say("Oh! You startled me - careful, I'll spill the - ", 'Water Carrier');
  Audio.sfx('water'); yield E.say('(The bucket tips. Water runs off across the grass and settles in the hollow by the east wall.)');
  yield E.say("...There. Now I have to go back to the pond. And that hollow will hold it for a week; it always does.", 'Water Carrier');
  G.set('xian_hollow_wet'); persistGround(G.map, 22, 15, 'puddle'); G.map.finalize();
};
STORY.feizhi = function* (E) {
  yield E.say("You - you're the strangers from the dojo. I'm going to the Alpine Crossing, to Hsu. But before I go...", 'Feizhi');
  yield E.say("You... you're travelers from the north? I keep hearing a voice... calling from far away. 'Isaac... Isaac...'", 'Feizhi');
  yield E.say("Is that your name? Then the voice is for you! It says... 'Lama Temple. Hama waits.' I don't understand it, but I feel it's important.", 'Feizhi');
  yield E.say("Master Feh says my Ki is strong, but untrained. If you reach Lama Temple before I do, tell Master Hama what I saw. Now - Hsu.", 'Feizhi');
  G.set('feizhi_done');
  yield E.say('(Feizhi runs off down the road toward the mountains.)');
};
// the mine cart on the spur: it runs up to the ledge and back down, once the points are thrown
STORY.altinCart = function* (E) {
  const o = G.map.objects.find(ob => ob.id === 'am1_cart'); if (!o) return;
  if (!G.flag('altin_points')) { yield E.say('An ore cart on the rails. The points at the foot of the spur are set against it; it goes nowhere.'); return; }
  const r = yield* E.ask('Ride the cart?', null, ['Yes', 'No']); if (r !== 0) return;
  const up = !G.flag('am1_cart_up'); const p = G.field.player; const y0 = up ? 9 : 4, y1 = up ? 4 : 9;
  Audio.sfx('push'); p.tx = 19; p.ty = y0; p.px = 19 * TILE; p.py = y0 * TILE; p.dir = up ? DIR.UP : DIR.DOWN; o.x = 19; o.y = y0;
  const step = up ? -1 : 1; for (let y = y0; y !== y1; y += step) { for (let f = 0; f < 6; f++) { p.py = (y + step * f / 6) * TILE; o.y = y; yield 1; } p.ty = y + step; p.py = p.ty * TILE; o.y = p.ty; }
  p.tx = 19; p.ty = y1; p.px = 19 * TILE; p.py = y1 * TILE; o.y = y1; G.set('am1_cart_up', up); G.set('obj:' + o.key, { x: 19, y: y1 });
  Engine.doShake(4); yield E.say(up ? 'The cart rattles up the spur and bangs into the buffer on the ledge.' : 'The cart rolls down the spur and bumps to a stop at the foot.');
  const off = up ? [19, 3] : [19, 10]; if (!G.field.blocked(off[0], off[1])) { p.tx = off[0]; p.ty = off[1]; p.px = p.tx * TILE; p.py = p.ty * TILE; }
};
// the post at the top of the pool cavern: struck, the loose rock above comes down as one boulder
STORY.altinPost = function* (E) {
  if (G.party.hasPsy('Force')) { yield E.say('A cracked post props the ledge over the gallery. Something heavy rests on that ledge. Force would knock the post out.'); return; }
  yield E.say("A cracked post props the ledge over the gallery. Something heavy rests up there.");
  yield E.say("No Orb of Force? No problem. Stand back.", 'Garet');
  yield E.say('(Garet plants his feet and kicks the post with everything he has.)'); Engine.doShake(8);
  yield* STORY.altinBoulder(E);
};
STORY.altinBoulder = function* (E) {
  if (G.flag('altin_gap')) return;
  const o = G.map.objects.find(ob => ob.id === 'am2_post'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); }
  Engine.doShake(20); Audio.sfx('quake'); yield E.say('The post snaps - and the ledge above lets go. A boulder the size of a house comes down the gallery, straight at the party!');
  yield E.say('RUN!', 'Garet');
  // Isaac takes the right way down without being asked: back along the ledge as the boulder thunders past
  const p = G.field.player; const path = [DIR.LEFT, DIR.LEFT, DIR.DOWN, DIR.DOWN, DIR.DOWN, DIR.LEFT, DIR.LEFT];
  for (const d of path) { const nx = p.tx + DX[d], ny = p.ty + DY[d]; if (G.field.blocked(nx, ny)) continue; yield E.move('player', d, 1); }
  Engine.doShake(30); Audio.sfx('quake'); yield 30;
  yield E.say('(The boulder smashes through the floor where the stair used to be and goes on down into the dark. The crash echoes for a long time.)');
  yield E.say('...Everyone still here? Good. That hole goes down. Deep down, by the sound of it.', 'Ivan');
  yield E.say("Then that's where the water is coming from. Let's go.", 'Mia');
  G.set('altin_gap'); G.field.loadMap(G.map.id, G.field.player.tx, G.field.player.ty, G.field.player.dir, { noAutosave: true });
};
STORY.hydrosStatue = function* (E) {
  yield E.say("There! The source of the flooding - a great statue, spewing water!", 'Mia');
  const r = yield* E.ambush(['Hydros Statue'], { boss: true, canFlee: false }, { at: [[10, 23]], scale: 1.2, say: '(The statue turns its head - and the water it spews turns on the party!)' });
  if (r !== 'win') return;
  G.set('altin_drained');
  yield E.say("The Hydros Statue crumbles. The water begins to drain from the mine!");
  yield E.coins(300);
};
STORY.hama = function* (E) {
  if (G.flag('reveal_learned')) { yield E.say("Use Reveal wisely, Ivan. It shows the truth hidden beneath illusion.", 'Hama'); return; }
  yield E.say("Ivan... At last. I have waited long for you. I am Hama, of the Jupiter Clan. I sense Feizhi sent you.", 'Hama');
  yield E.say("You and I share blood, Ivan. But that story is for another day. You will need the power of Reveal to cross the Lamakan Desert. Let me awaken it in you.", 'Hama');
  Engine.doFlash(15, '#c0a0ff'); Audio.sfx('psy'); yield 20;
  const ivan = G.party.get('Ivan'); if (ivan) ivan.learnExtra('Reveal');
  G.set('reveal_learned');
  yield E.say('Ivan learned Reveal!');
  yield E.say("The desert's mirages hide oases and the true path. Use Reveal, and you will not be lost.", 'Hama');
  // Feizhi bursts in: she has seen Hsu pinned under a rock on the mountain road, from Xian, awake
  E.spawn('FeizhiL', 6, 9, { look: NPC_LOOKS.Feizhi, name: 'Feizhi', dir: DIR.UP }); yield E.move('FeizhiL', DIR.UP, 3);
  yield E.say("Master Hama! Master Hama! It's Hsu - a boulder came down on the Alpine Crossing, and he's under it! I saw it!", 'Feizhi');
  yield E.say("Saw it? Feizhi, the crossing is a day from Xian. You could not have -", 'Hama');
  yield E.say("I saw it from the training yard. Like a picture behind my eyes. I know it's true!", 'Feizhi');
  yield E.say("...I taught you to still your mind, child. I never thought it would open like this. You are no Adept - and yet.", 'Hama');
  yield E.say("A rock struck my head the day Mt. Aleph erupted. Since then I... see things.", 'Feizhi');
  yield E.say("The mountain's stones carry its power. Come - if Hsu lives, every hour matters. Ivan, forgive me. Go west; we will speak again.", 'Hama');
  G.set('hama_hsu');
  yield E.move('FeizhiL', DIR.DOWN, 3); E.despawn('FeizhiL'); E.despawn('Hama');
  yield E.say("(Hama and Feizhi hurry out toward the mountains.)");
};
// Hama back at the temple after Hsu is freed: she cannot quite meet Ivan's eyes
STORY.hamaAfter = function* (E) {
  if (G.flag('hama_told')) { yield E.say("Go, Ivan. The road west is long. We will meet again - I have seen it.", 'Hama'); return; }
  G.set('hama_told');
  yield E.say("Hsu is home in Xian, thanks to you. Feizhi will not leave his side.", 'Hama');
  yield E.say("(Hama looks past Ivan as she speaks, and does not meet his eyes.)");
  yield E.say("Master Hama... is something wrong? You haven't looked at me since the mountain.", 'Ivan');
  yield E.say("...Nothing is wrong, Ivan. Some things are not yet ready to be said. Go west. Your friends need you more than I do.", 'Hama');
};
STORY.lamakanEnter = function* (E) { yield E.say("The Lamakan Desert... The heat is unbearable! We must find the oases, or we'll never make it across.", 'Ivan'); yield E.say("Use Reveal to see the hidden oases and the true path through the mirages.", 'Ivan'); };
STORY.manticore = function* (E) {
  yield E.say("The end of the desert! But... something stands in our way. A Manticore!", 'Garet');
  const r = yield* E.battle(['Manticore'], { boss: true, canFlee: false });
  if (r !== 'win') return;
  yield E.say("The Manticore is slain! Kalay lies just beyond the desert.");
  yield E.give('Psy Crystal');
};
// ============ KALAY / TOLBI ============
// the crowd off to Tolbi's carnival and Colosso passes the party at the gate
STORY.kalayTourists = function* (E) {
  if (G.flag('kalay_tourists')) return; G.set('kalay_tourists');
  const ids = ['tour1', 'tour2', 'tour3', 'tour4']; const looks = [['villager_m'], ['villager_f'], ['child_m'], ['merchant']];
  ids.forEach((id, i) => E.spawn(id, 10 + i, 46, { type: looks[i][0], name: 'Traveler', dir: DIR.DOWN }));
  yield E.say("Colosso! Colosso! Hurry, or every inn in Tolbi will be full before we're over the sea!", 'Traveler');
  yield E.say("Eight fighters this year, they say, and Lord Babi in his box, and the carnival for a week after. I have waited all year for this.", 'Traveler');
  yield E.say("Papa, will there be the lucky fountain? And the dice?", 'Traveler');
  yield E.say("Colosso... a tournament? In Tolbi?", 'Garet');
  yield E.say("Tolbi is where we are going, Garet. And where the ships from the docks go. It seems we will have company.", 'Mia');
  for (let k = 0; k < 4; k++) { for (const id of ids) E.move(id, DIR.DOWN, 1); yield 14; }
  yield E.say("(The travelers hurry off south toward the docks, bags bouncing.)");
  ids.forEach(id => E.despawn(id));
};
// the first sight of the Karagol from the docks
STORY.docksOcean = function* (E) {
  if (G.flag('docks_ocean')) return; G.set('docks_ocean');
  yield E.say("Whoa... whoa! Look at that! Is that... is that the OCEAN?", 'Garet');
  yield E.say("It's the Karagol Sea, Garet. An inland sea. You can see the far shore on a clear day, they say.", 'Ivan');
  yield E.say("It's the ocean. Look at it! It goes on forever! I always wanted to see the ocean!", 'Garet');
  yield E.say("...Let him have it, Ivan.", 'Mia');
  yield E.say("The ship to Tolbi sails from the pier. The ticket office is the only building - Lady Layana's letter should see us aboard.", 'Isaac');
};
// the ticket office: Layana's letter buys the passage
STORY.ticketOffice = function* (E) {
  if (G.inventory.has('Boat Ticket') || G.flag('ship_sailed') || G.flag('ship_at_tolbi')) { yield E.say("You've your tickets. The captain on the pier will see you aboard - if his anchor charm's turned up, that is.", 'Clerk'); return; }
  if (!G.inventory.has("Layana's Letter") && !G.flag('layana_met')) { yield E.say("Passage to Tolbi? Five hundred a head, and the ship's full to the rails for Colosso. Unless you know somebody.", 'Clerk'); return; }
  yield E.say("A letter under Master Hammet's seal... from Lady Layana herself! Why didn't you say so? Passage for four, on the house's account.", 'Clerk');
  if (G.inventory.has("Layana's Letter")) G.inventory.remove("Layana's Letter"); yield E.give('Boat Ticket');
  yield E.say("The captain's on the pier. Mind, he won't cast off without his anchor charm, and he's been in a temper about it all morning.", 'Clerk');
};
STORY.layana = function* (E) {
  if (G.flag('hammet_rescued')) { yield E.say("Thank you for bringing my husband home. Kalay owes you a great debt.", 'Lady Layana'); return; }
  yield E.say("Ivan! You've returned! And these are... Isaac, Garet, Mia? Hammet told me of you in his last letter.", 'Lady Layana');
  yield E.say("But where is my husband? He left Vault to return home, but never arrived... I fear Dodonpa's thieves of Lunpa have taken him.", 'Lady Layana');
  yield E.say("I know you pursue Saturos. Please, go on to Tolbi - the ships leave from Kalay Docks. But if you can... help Hammet.", 'Lady Layana');
  yield E.say("Take this letter to the ticket office at Kalay Docks. Hammet's name still carries weight on the Karagol, whatever Dodonpa thinks.", 'Lady Layana');
  yield E.give("Layana's Letter"); G.set('layana_met');
  const ivan = G.party.get('Ivan'); if (ivan) { yield E.say("(Ivan looks troubled. 'Master Hammet... I will save you. I promise.')", 'Ivan'); }
};
// STORY.boardShip and the ship itself: js/maps/ship.js
STORY.luckyFountain = function* (E) {
  if (!G.inventory.has('Lucky Medal')) { yield E.say("Toss a Lucky Medal into the fountain and fortune may smile on you!", 'Fountain Keeper'); return; }
  const r = yield* E.ask('Toss a Lucky Medal into the fountain?', 'Fountain Keeper', ['Yes', 'No']); if (r !== 0) return;
  yield* E.fountain('tolbi');
};
// the Lucky Wheel above the inn: a slot machine of three reels. A Game Ticket buys a pull; more tickets buy more
// pulls in one game, and between pulls the reels that already agree can be held. Three of a kind pays out in that
// symbol's kind - boots, shirts, rings, or a healing item for the stars and hearts - and the moon stands for
// anything. The first prize of a game is never the best boots or shirt, and no prize comes twice running.
const WHEEL_SYMBOLS = ['boots', 'shirt', 'ring', 'star', 'heart', 'moon'];
const WHEEL_PRIZES = { boots: ['Fur Boots', 'Quick Boots', 'Hyper Boots'], shirt: ['Silk Shirt', 'Running Shirt', 'Mythril Shirt'], ring: ['Adept Ring', 'Sleep Ring', 'War Ring'], star: ['Vial', 'Water of Life', 'Potion'], heart: ['Vial', 'Water of Life', 'Potion'] };
const WHEEL_GLYPH = { boots: '[boots]', shirt: '[shirt]', ring: '[ring]', star: '[star]', heart: '[heart]', moon: '[moon]' };
STORY.luckyWheel = function* (E) {
  const tickets = G.inventory.count('Game Ticket');
  if (!tickets) { yield E.say("Three reels, three symbols, one prize - boots, shirts, rings, or a little something for the road. A Game Ticket a pull. No tickets, no pull.", 'Game Master'); return; }
  const opts = ['1 ticket', '2 tickets', '3 tickets', '4 tickets'].slice(0, Math.min(4, tickets)).concat(['Leave']);
  const c = yield* E.ask('Pull the Lucky Wheel? More tickets, more pulls in one game.', 'Game Master', opts); if (c < 0 || c >= opts.length - 1) return;
  const pulls = c + 1; G.inventory.remove('Game Ticket', pulls);
  const roll = () => WHEEL_SYMBOLS[Math.floor(Math.random() * WHEEL_SYMBOLS.length)];
  let reels = [roll(), roll(), roll()]; const show = () => reels.map(r => WHEEL_GLYPH[r]).join('  ');
  const kindOf = (rs) => { const real = rs.filter(r => r !== 'moon'); if (!real.length) return 'star'; const first = real[0]; return real.every(r => r === first) ? first : null; };
  for (let pull = 1; pull <= pulls; pull++) {
    Audio.sfx('cursor'); yield E.say('(The reels spin... and stop.)   ' + show());
    if (kindOf(reels)) break;
    if (pull === pulls) break;
    // the held reels: whichever symbol the reels agree on most (a moon counts with anything)
    const counts = {}; for (const r of reels) if (r !== 'moon') counts[r] = (counts[r] || 0) + 1;
    let best = null; for (const k in counts) if (!best || counts[k] > counts[best]) best = k;
    const h = yield* E.ask('Pull ' + (pull + 1) + ' of ' + pulls + '. Hold the reels that agree?', 'Game Master', ['Hold them', 'Spin all three']);
    reels = reels.map(r => (h === 0 && best && (r === best || r === 'moon')) ? r : roll());
  }
  const kind = kindOf(reels);
  if (!kind) { yield E.say("No line. The wheel keeps its prizes today. Come back with more tickets!", 'Game Master'); return; }
  let pool = WHEEL_PRIZES[kind].slice(); const last = G.get('wheel_last'); const firstWin = !G.flag('wheel_won');
  if (firstWin) pool = pool.filter(p => p !== 'Hyper Boots' && p !== 'Mythril Shirt');
  if (pool.length > 1) pool = pool.filter(p => p !== last);
  const prize = pool[Math.floor(Math.random() * pool.length)]; G.set('wheel_won'); G.set('wheel_last', prize);
  yield E.say('Three ' + kind + (kind === 'moon' ? 's' : 's') + '! A winner!', 'Game Master'); Audio.sfx('item'); yield E.give(prize);
};
// Lucky Dice, in the tent on the plaza: four dice thrown for a bet of coins. A pair returns the stake, two pair
// doubles it, three of a kind triples it, four of a kind pays five times over
STORY.luckyDice = function* (E) {
  const coins = G.party.coins; if (coins < 20) { yield E.say("Four dice, and coins on the table. A pair gives you your stake back, two pair doubles it, three alike triples it, and four alike - five times over! But you need at least twenty coins to sit down.", 'Dice Master'); return; }
  const bets = [20, 50, 100, 200, 500].filter(b => b <= coins); const opts = bets.map(b => b + ' coins').concat(['Leave']);
  const c = yield* E.ask('Lucky Dice! Four dice, one throw. How much do you stake?', 'Dice Master', opts); if (c < 0 || c >= bets.length) return;
  const bet = bets[c]; G.party.coins -= bet;
  const dice = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6)); const counts = {}; for (const d of dice) counts[d] = (counts[d] || 0) + 1;
  const groups = Object.values(counts).sort((a, b) => b - a);
  const mult = groups[0] === 4 ? 5 : groups[0] === 3 ? 3 : (groups[0] === 2 && groups[1] === 2) ? 2 : groups[0] === 2 ? 1 : 0;
  const name = mult === 5 ? 'Perfect!!!' : mult === 3 ? 'Three of a kind!' : mult === 2 ? 'Two pair!' : mult === 1 ? 'One pair!' : 'Nothing...';
  Audio.sfx('cursor'); yield E.say('(The dice rattle across the table: ' + dice.join(' - ') + ')   ' + name, 'Dice Master');
  if (!mult) { yield E.say('The house keeps ' + bet + ' coins. Another throw?', 'Dice Master'); return; }
  const win = bet * mult; G.party.coins += win; Audio.sfx('item'); yield E.say((mult === 1 ? 'Your stake back: ' : mult + ' times the stake: ') + win + ' coins!', 'Dice Master');
};
STORY.iodemTolbi = function* (E) {
  if (G.flag('babi_permission')) { yield E.say("Lord Babi awaits you at the Venus Lighthouse. I ride ahead to the Gondowan bridge - I will meet you there.", 'Iodem'); return; }
  if (G.flag('colosso_done')) { yield E.say("Lord Babi is waiting for you in his room, up the stairs. He would not be put off.", 'Iodem'); return; }
  if (G.flag('babi_found')) { yield E.say("Thanks to you, Lord Babi is safe - and he has entered you in Colosso! The referee at the arena is waiting for you.", 'Iodem'); return; }
  yield E.say("I am Iodem, aide to Lord Babi, ruler of Tolbi. Welcome... though you find us in a poor state.", 'Iodem');
  yield E.say("Lord Babi has gone missing. Colosso is about to begin and its patron is nowhere! He goes alone, sometimes, to Altmiller Cave north of the town... he will not say why.", 'Iodem');
  yield E.say("You are Adepts, Lady Layana's letter says. If you would look for him in that cave, Tolbi would be in your debt.", 'Iodem');
  G.set('iodem_met'); G.set('babi_missing');
};
// the figure on the cavern floor: unseen until he has his draught back
STORY.findBabi = function* (E) {
  if (!G.flag('babi_asked')) {
    yield E.say("...Who's there? ...No - don't come closer. I can't... move...");
    yield E.say("A voice! But there's nobody... Isaac, the floor - there's someone lying there. I can feel them, but I can't see them!", 'Ivan');
    yield E.say("Listen to me. At the bottom of this cavern there is a draught... a medicine. Without it I am finished. Bring it to me and I will explain everything.");
    yield E.say("A pharmacy, at the bottom of a cave?", 'Mia');
    yield E.say("Hah... no. Behind five stones, girl. Blue, green, white, yellow, red - turn the outer stones and lights will show you the order. Strike them in it and the way opens. The draught is on a table beyond. Go...");
    G.set('babi_asked'); return;
  }
  if (!G.inventory.has('Mystic Draught')) { yield E.say("...Have you found it? Five stones... blue, green, white, yellow, red... hurry..."); return; }
  yield E.say("(Isaac holds out the Mystic Draught. An unseen hand takes it. A long swallow -)"); G.inventory.remove('Mystic Draught'); Audio.sfx('heal');
  Engine.doFlash(12, '#ffffff'); yield 20;
  E.despawn('BabiCave'); E.spawn('BabiSeen', 26, 12, { look: NPC_LOOKS.Babi, name: 'Lord Babi', dir: DIR.DOWN });
  yield E.say("(An old man in fine robes sits up, quite visible, colour coming back into his face.)");
  yield E.say("Lord Babi! The ruler of Tolbi!", 'Ivan');
  yield E.say("The same. And you are Layana's Adepts - I know that look. Cloak Psynergy; a trick I learned long ago, in a place called Lemuria. It hid me, but it could not carry me. This draught can. It is the last of what I brought from there.", 'Lord Babi');
  yield E.say("Lemuria...?", 'Isaac');
  yield E.say("A story for the palace, not a cave floor. Ah - my guards. They always find me in the end.", 'Lord Babi');
  E.spawn('BabiGuard1', 24, 12, { type: 'guard', name: 'Guard', dir: DIR.RIGHT }); E.spawn('BabiGuard2', 28, 12, { type: 'guard', name: 'Guard', dir: DIR.LEFT });
  yield E.say("Lord Babi! We have searched every gallery - the tournament cannot open without you!", 'Guard');
  yield E.say("Then it opens today. Isaac - Colosso needs an eighth fighter. I choose you. Come to the arena when you have caught your breath; the referee will know you.", 'Lord Babi');
  yield E.say("(Babi's guards help him up and lead him out toward Tolbi.)");
  E.despawn('BabiSeen'); E.despawn('BabiGuard1'); E.despawn('BabiGuard2');
  G.set('babi_found'); G.field.refreshNpcs();
};
// Babi in his palace: before Colosso, the invitation; after it, the tale of Lemuria, the Lure Cap, and his bed
STORY.babi = function* (E) {
  if (G.flag('babi_permission')) { yield E.say("Go to the Venus Lighthouse. My tower connects to it from below. Find the Proxians... and find my Lemurian ship, if you can.", 'Lord Babi'); return; }
  if (!G.flag('colosso_done')) { yield E.say("The arena is waiting, Isaac. Fight in Colosso, and prove what Layana wrote of you. Then we will talk.", 'Lord Babi'); return; }
  const champ = (G.get('colosso_wins') || 0) >= 3;
  yield E.say(champ ? "Three rounds, three victories. I have watched Colosso for longer than you would believe, and I have not seen the like. Take this - a champion's due." : "You fell in the arena, but you stood in it, which is more than most. I keep my word to those who fight for me.", 'Lord Babi');
  if (champ) yield E.give('Lure Cap', 1); else yield E.coins(500);
  yield E.say("Now sit. You will want to know why an old man was lying unseen on a cave floor.", 'Lord Babi');
  yield E.say("I am one hundred and fifty years old, give or take. When I was young I sailed with a pirate named Lunpa - yes, the Lunpa the town is named for - and in the Great Flood our ship was carried to a land no chart shows. Lemuria.", 'Lord Babi');
  yield E.say("The Lemurians live for centuries. They have a draught, and I stole a cask of it, and a ship of theirs to leave in - a ship that answers to Psynergy, which I had learned a little of. It has kept me alive ever since. And now it is gone.", 'Lord Babi');
  yield E.say("I have sent fleet after fleet to find Lemuria again. The mists turn them round. The currents change under them. So I am building a lighthouse at Lalivero, a beacon to steer by... but it is not finished, and I am out of time.", 'Lord Babi');
  yield E.say("Then the Lemurian ship-", 'Ivan');
  yield E.say("Needs Adepts to sail it. Which is why an old man is so very glad to have met you. I ask you to go to Lemuria for me. Not today - first the Venus Lighthouse, where my ship lies moored below Lalivero, and where those Proxians of yours have gone.", 'Lord Babi');
  yield E.say("You have my leave to pass Suhalla Gate. Iodem will ride ahead and meet you at the Gondowan bridge south of the town. Now... I must rest. Even the draught cannot argue with the hour.", 'Lord Babi');
  G.set('babi_permission');
  yield E.move('Babi', DIR.LEFT, 2); yield E.move('Babi', DIR.UP, 1);
  yield E.say("(Lord Babi lies down. On the stand beside his bed a small black sphere gleams - the Cloak Ball.)");
  G.set('babi_abed'); G.field.refreshNpcs(); if (typeof tolbiCloakBall === 'function') tolbiCloakBall(G.map);
};
// STORY.colosso: js/maps/colosso.js
STORY.dodonpa = function* (E) {
  if (G.flag('hammet_freed')) return;
  yield E.say("Well, well. Sneaking into MY fortress, past MY guards? Nobody steals from Dodonpa. Not even a merchant.", 'Dodonpa');
  yield E.say("Release Master Hammet!", 'Ivan');
  yield E.say("Release him? I'm going to ransom him for every coin in Kalay! Toadonpa - my pet - EAT them.", 'Dodonpa');
  const r = yield* E.battle(['Toadonpa'], { boss: true, canFlee: false });
  if (r !== 'win') return;
  G.set('hammet_freed');
  yield E.say("(The great toad sways, topples - and lands flat on its back, square on top of Dodonpa.)");
  yield E.say("Mmmf! Get it OFF me! Toadonpa, you useless lump - mmmf!", 'Dodonpa');
  yield E.say("...Do we help him?", 'Garet');
  yield E.say("(Isaac and Garet heave the toad aside. Dodonpa crawls out from under it and stays low to the ground, glaring.)");
  yield E.say("You'll regret this. Every one of you. When my men -", 'Dodonpa');
  E.spawn('Donpa', 12, 8, { look: NPC_LOOKS.Lunpa, name: 'Donpa', dir: DIR.UP }); yield E.move('Donpa', DIR.UP, 3);
  yield E.say("Your MEN, Dodonpa? Your men are my men, and my father's before me, and they are tired of your ransoms.", 'Donpa');
  yield E.say("F-father!", 'Dodonpa');
  yield E.say("I am Donpa, and this fool is my son. I spoiled him. That is my fault, and I will mend it now.", 'Donpa');
  yield E.say("Master Hammet goes free, tonight. The shops reopen to travelers. Lunpa was built by my father as a haven for the poor - not a cage for the rich.", 'Donpa');
  yield E.say("(Donpa unlocks the cell. Master Hammet steps out, thin and grey, and bows to Ivan.)");
  E.spawn('HammetFree', 13, 6, { look: NPC_LOOKS.Hammet, name: 'Master Hammet', dir: DIR.DOWN });
  yield E.say("Ivan... you came for me. Through all of this. I am prouder than I can say.", 'Master Hammet');
  yield E.say("A warning, all of you. Some of my son's men will not hear me tonight - the ones with red caps are his creatures, and they hold the halls below. You will have to leave the way you came: quietly.", 'Donpa');
  yield E.say("I will slip out through the old cave west of the town. Meet me outside it, Ivan - I would rather not be seen leaving by the gate.", 'Master Hammet');
  E.despawn('HammetFree'); E.despawn('Donpa');
  yield E.say("(Hammet hurries out. Dodonpa sulks on his carpet, and Donpa settles into the chair beside it like a man who means to stay.)");
  G.field.refreshNpcs();
};
// outside West Lunpa Cave: Bunza's wagon, and the choice to ride to Kalay with Hammet or stay behind
STORY.bunzaWagon = function* (E) {
  if (!G.flag('hammet_freed') || G.flag('hammet_rescued')) return;
  yield E.say("(Master Hammet is waiting outside the cave mouth - and beside him a covered wagon, its driver arguing with him.)");
  yield E.say("...trade with LUNPA, Bunza? With the thieves who kept me in a cell for a month?", 'Master Hammet');
  yield E.say("Master! You're alive! I - well, sir, their coin's as good as anyone's, and the road's been quiet since they took you, and -", 'Bunza');
  yield E.say("Bunza is one of my drivers. Not a subtle one. But he has a wagon, and I have no wish to walk past Dodonpa's gate in daylight.", 'Master Hammet');
  yield E.say("Isaac, Ivan - ride with us to Kalay. Bunza will have us there by dark, and Layana will want to see you.", 'Master Hammet');
  const ride = yield* E.ask('Ride the wagon to Kalay?', 'Garet', ['Yes', 'No']);
  G.set('hammet_rescued');
  if (ride !== 0) {
    yield E.say("You have things to finish here? Then we part for now. Come to the palace when you reach Kalay - the secret way is open to you.", 'Master Hammet');
    yield E.say("(The wagon rattles off south with Master Hammet inside.)"); G.set('hammet_stayed'); return;
  }
  yield E.say("(The party climbs in among the bolts of silk. The wagon rattles south, the mountains fall behind, and Master Hammet sleeps for the first time in a month.)");
  yield Engine.fadeOut(40); yield 20;
  E.warpNow('kalay', 13, 51, DIR.UP); yield Engine.fadeIn(40);
  yield E.say("Kalay, sir. I'll take the master round to the tunnel - he'd sooner not be seen at the gate by any of Dodonpa's lot that might be about.", 'Bunza');
  yield E.say("The secret entrance under the palace, Ivan. You will find the gates in the tunnel open now. Come and see us.", 'Master Hammet');
  yield E.say("(Master Hammet goes on toward the palace by the tunnel. Bunza sets the party down at the end of the line.)");
};
// Hammet home in his palace: the Shaman's Rod, and a name for Ivan to remember
STORY.hammetHome = function* (E) {
  if (G.flag('hammet_hesperia')) { yield E.say("Hesperia, Ivan. West across the sea. When your road is done, take the rod there.", 'Master Hammet'); return; }
  G.set('hammet_hesperia');
  yield E.say("You freed me from Lunpa Fortress. I owe you my life, all of you - and Layana owes you her husband.", 'Master Hammet');
  yield E.say("I will not keep you from Saturos. But Ivan - one thing before you go. The Shaman's Rod I gave you.", 'Master Hammet');
  yield E.say("I found it in Hesperia, the continent west of Angara across the sea, in the hands of a shaman's tribe who did not want to part with it. I bought it, and I have never been sure I should have.", 'Master Hammet');
  yield E.say("It belongs with them. When your road allows, carry it back to Hesperia. Remember that name well.", 'Master Hammet');
  yield E.say("Hesperia... I will, Master Hammet.", 'Ivan');
  yield E.say("The ship from Kalay Docks is yours whenever you want it - the captain knows my name.", 'Master Hammet');
};
// ============ SUHALLA / LALIVERO / VENUS ============
STORY.suhallaDesertEnter = function* (E) { yield E.say("The Suhalla Desert. Sandstorms rage across it... and those storms aren't natural. Tornado Lizards!", 'Mia'); };
// The pink tornado at the desert's end. Douse it and the Tempest Lizard steps out; leave it and it carries the
// party off to Crossbone Isle, which is how the original lets you reach the isle before you own a ship.
STORY.tempestLizard = function* (E) {
  const beaten = G.flag('tempest_lizard_done');
  yield E.say("A towering pink tornado whirls across the sand, going nowhere.");
  if (!beaten && G.party.active.some(m => m.hasPsy('Douse'))) {
    const fight = yield* E.yesno('Douse the tornado?');
    if (fight) {
      Engine.doFlash(10, '#a0d0ff');
      const r = yield* E.ambush(['Tempest Lizard'], { boss: true, canFlee: false }, { say: "The water tears the storm apart - and something inside it is furious." });
      if (r !== 'win') return;
      G.set('tempest_lizard_done');
      yield E.say('The Tempest Lizard falls.');
      yield E.give('Potion');
      return;
    }
  }
  const ride = yield* E.yesno(beaten ? 'Another tornado has risen in its place. Let it carry you off?' : 'Let the tornado carry you off?');
  if (!ride) { yield E.say('The party backs away from the storm.'); return; }
  yield E.say('The wind lifts the party off the sand and flings them out over the sea...');
  yield Engine.fadeOut(30); Audio.sfx('wind');
  E.warpNow('crossbone', 12, 23, DIR.UP);
  yield 20; yield Engine.fadeIn(30);
  yield E.say('...and drops them on a bone-white island. Crossbone Isle.');
};
STORY.stormLizard = function* (E) {
  yield E.say("The sandstorm thickens... something is inside it!", 'Ivan');
  const r = yield* E.ambush(['Storm Lizard'], { boss: true, canFlee: false }, { say: '(A Storm Lizard steps out of the whirling sand!)' });
  if (r !== 'win') return;
  yield E.say("The Storm Lizard falls and the sandstorm dies away. The way east is clear!");
};
STORY.suhallaGate = function* (E) {
  if (G.flag('babi_permission')) { if (!G.flag('gate_opened')) { G.set('gate_opened'); yield E.say("Lord Babi's seal! Open the gate! You may pass to Lalivero.", 'Gate Guard'); const gt = G.map; for (const x of [5, 6]) gt.setObj(x, 14, 'palisade_gate'); gt.finalize(); Audio.sfx('door'); } else yield E.say('The gate stands open for you.', 'Gate Guard'); return; }
  yield E.say("Halt! None may pass Suhalla Gate without Lord Babi's permission!", 'Gate Guard');
};
STORY.faran = function* (E) {
  if (G.flag('venus_done')) { yield E.say("Sheba is safe, thanks to you. Lalivero will never forget it.", 'Faran'); return; }
  if (G.flag('sheba_kidnapped')) { yield E.say("They took Sheba into the Venus Lighthouse! Babi's tower to the north connects to it through the Tunnel Ruins. Please, save my daughter!", 'Faran'); return; }
  yield E.say("I am Faran, leader of Lalivero. You are the Adepts Lord Babi spoke of? Then hear me.", 'Faran');
  yield E.say("The strangers, Saturos and Menardi, came with a girl and an old man. They demanded Sheba - my adopted daughter, a child who fell from the sky. She has the power to read minds...", 'Faran');
  yield E.say("Babi's soldiers handed her over! They took her to the Venus Lighthouse as a hostage. Please, I beg you - bring Sheba back!", 'Faran');
  G.set('sheba_kidnapped'); G.set('babi_permission');
  yield* E.chapter('Chapter 4: The Venus Lighthouse');
};
STORY.venusDeadEnd = function* (E) { yield E.say("The door is sealed from the other side. We can't get in this way.", 'Garet'); yield E.say("Faran said Babi's tower connects to the Lighthouse through the Tunnel Ruins. Let's go around!", 'Ivan'); };
STORY.venusInnerEnter = function* (E) { yield E.say("We're inside the Venus Lighthouse! Saturos and Menardi must be near the aerie by now.", 'Mia'); yield E.say("Jenna, Kraden, Sheba... hold on. We're coming!", 'Garet'); };
STORY.venusAerie = function* (E) {
  Audio.play('villain');
  E.spawn('SatV', 11, 12, { look: NPC_LOOKS.Saturos, name: 'Saturos' }); E.spawn('MenV', 14, 12, { look: NPC_LOOKS.Menardi, name: 'Menardi' });
  E.spawn('FelixV', 8, 11, { look: CHARACTERS.Felix.look, name: 'Felix' }); E.spawn('JennaV', 7, 12, { look: CHARACTERS.Jenna.look, name: 'Jenna' }); E.spawn('ShebaV', 17, 11, { look: CHARACTERS.Sheba.look, name: 'Sheba' }); E.spawn('KradenV', 18, 12, { look: NPC_LOOKS.Kraden, name: 'Kraden' });
  yield E.say("You again. Persistent, aren't you? But you are too late, once more.", 'Menardi');
  yield E.pan(12, 9); yield E.say("(Saturos casts the Venus Star into the beacon!)");
  Engine.doFlash(20, '#ffe060'); Audio.sfx('beacon'); yield E.shake(30);
  G.set('venus_lit'); G.map.beacon(12, 7, 'venus', true); G.map.finalize();
  yield E.say('(A pillar of golden light erupts from the Venus Lighthouse! The earth trembles!)'); yield E.panBack();
  yield E.say("Isaac! Garet! You came!", 'Jenna');
  yield E.say("Felix! Jenna! We're taking you home!", 'Garet');
  yield E.say("Isaac... I can't go back. Not yet. There is a reason we light the beacons. Prox... my home for three years... is dying.", 'Felix');
  yield E.say("Enough talk. Menardi, these two have troubled us since Vale. Here, at the height of my power, we end it.", 'Saturos');
  yield E.say("With pleasure.", 'Menardi');
  const r = yield* E.battle(['Saturos II', 'Menardi'], { boss: true, canFlee: false, music: 'boss' });
  if (r !== 'win') return;
  yield E.say("Impossible... Beaten... by children...", 'Saturos');
  yield E.say("Saturos... We have no choice. We must use... the power of the beacon.", 'Menardi');
  Engine.doFlash(30, '#ff4020'); Audio.play('final'); yield E.shake(40);
  for (const id of ['SatV', 'MenV']) E.despawn(id); E.foe('FusionV', 'Fusion Dragon', 12, 10, { foeScale: 1.4, solid: false }); Audio.sfx('boom'); yield 20;
  yield E.say("(Saturos and Menardi hurl themselves into the beacon's light... and emerge fused into a monstrous two-headed dragon!)");
  yield E.say("Everyone, quickly - while it takes shape! Ply!", 'Mia'); Audio.sfx('heal'); Engine.doFlash(10, '#a0e0ff');
  for (const m of G.party.members) { if (!m.status.down) { m.hp = m.stats().hp; m.pp = Math.max(m.pp, Math.floor(m.stats().pp * 0.6)); } m.gainLimit(50); }
  yield E.say("(The party recovers its strength and readies its Djinn.)");
  const r2 = yield* E.battle(['Fusion Dragon'], { boss: true, canFlee: false, music: 'final' });
  E.despawn('FusionV');
  if (r2 !== 'win') return;
  Audio.play('sad');
  yield E.say("(The Fusion Dragon collapses. The forms of Saturos and Menardi lie still.)");
  yield E.say("It's... over. Saturos... Menardi...", 'Felix');
  E.despawn('SatV'); E.despawn('MenV');
  yield E.shake(30);
  yield E.say("The lighthouse is shaking! The aerie is collapsing!", 'Kraden');
  yield E.say("Sheba! Hold on!", 'Felix');
  yield E.say("(The platform crumbles. Sheba tumbles toward the edge -- and Felix leaps after her! Both vanish into the sea far below.)");
  yield E.say("FELIX!", 'Jenna');
  yield E.say("Jenna, we have to go! The whole tower is coming down!", 'Kraden');
  yield E.say("Isaac... I'm going with Kraden. I have to find my brother. Please understand...", 'Jenna');
  E.despawn('FelixV'); E.despawn('ShebaV'); E.despawn('JennaV'); E.despawn('KradenV');
  yield Engine.fadeOut(40); G.set('venus_done');
  E.warpNow('lalivero', 15, 17, DIR.DOWN); yield Engine.fadeIn(40); Audio.play('ending');
  yield E.say("(Isaac's party escapes the collapsing Lighthouse. Felix and Sheba are nowhere to be found... Lord Babi's Lemurian ship waits at the shore.)");
  yield E.say("Felix was alive... all this time. And now he and Sheba are gone, and Jenna went after them.", 'Garet');
  yield E.say("Felix said Prox is dying. What did he mean? Why do they need to light the beacons?", 'Ivan');
  yield E.say("There are two beacons left: Jupiter and Mars. We must find Felix's party before they can light them... The Lemurian ship will take us across the sea.", 'Mia');
  yield E.say("Wherever they've gone, we'll find them. Jenna, Kraden, Sheba... and Felix. This isn't over.", 'Isaac');
  yield E.say("(Golden Sun - Part One - Complete.)");
  yield Engine.fadeOut(40);
  if (STORY.gs1Ending) yield* STORY.gs1Ending(E);   /* the credits, and the ship at sea (js/game/endings.js) */
  yield* E.chapter('THE LOST AGE');
  yield* STORY.transitionToTLA(E);
};
STORY.transitionToTLA = function* (E) {
  yield Engine.fadeOut(40);
  // Preserve Isaac's party data for later reunion
  G.isaacParty = G.party.serialize(); G.isaacParty.inv = G.inventory.serialize().filter(i => ITEM_DB[i.name] && (!ITEM_DB[i.name].key || ITEM_DB[i.name].grants || ITEM_DB[i.name].classItem));   /* the Psynergy stones travel with them: the Orb of Force, the Catch Beads, the Frost Jewel... - and the class items won in Angara's trials (the Assassin's Mask, the Crown of Sol) */
  G.set('gs1_complete'); G.game = 2;
  // Golden Sun's story flags, chests and puzzles stay done - Angara is revisited later in The Lost Age; only the ship state belongs to the old party
  const keep = Object.assign({}, G.flags); for (const k of ['hasShip', 'onShip', 'shipX', 'shipY']) delete keep[k];
  G.flags = keep; G.set('gs1_complete');
  const newParty = new Party(); newParty.coins = Math.floor(G.party.coins / 4);
  Game.tlaParty(newParty);
  newParty.djinnFound = (G.isaacParty.djinnFound || []).slice();
  G.party = newParty; G.inventory = new Inventory(); G.inventory.add('Herb', 5); G.inventory.add('Antidote', 3); G.inventory.add('Mythril Bag'); G.inventory.add('Jupiter Star'); G.inventory.add("Shaman's Rod");   // the last star, and Ivan's rod goes over to Felix: the Shaman tribe of Hesperia will want it back
  yield* STORY_TLA.begin(E);
};
STORY.deadbeard = function* (E) {
  if (G.flag('deadbeard_done')) return;
  yield E.say("In the captain's chair sits a figure in a rotted coat and a great black beard, quite still. Then the head lifts, and two lights burn where eyes were.");
  yield E.say("'Nine doors, and ye came through every one. Nobody comes through every one.' The voice is dry as sailcloth. 'Then ye'll know what a pirate does with folk who reach his hoard.'", 'Deadbeard');
  const r = yield* E.battle(['Deadbeard'], { boss: true, canFlee: false, music: 'final', canLose: true });
  if (r !== 'win') {
    // an optional terror: a loss throws the party out onto the deck, alive, to come back stronger
    for (const m of G.party.members) { if (m.status) m.status.down = false; m.hp = Math.max(1, m.hp | 0); if (m.hp < 1) m.hp = 1; }
    yield Engine.fadeOut(30); E.warpNow('crossbone_ship', 12, 7, DIR.DOWN); yield Engine.fadeIn(30);
    yield E.say("The party comes to on the deck, thrown out of the cabin like so much ballast. Deadbeard's laugh rattles in the timbers. He is still in there.");
    return;
  }
  G.set('deadbeard_done');
  yield E.say("The lights in the skull gutter out. The figure slumps in its chair and does not move again. Deadbeard's hoard - what is left of it - is in the chest behind him.");
};

// ---- Vale, revisited (the guide's chapter 8.A): the families meet the friends Isaac and Garet made on the road ----
STORY.doraHome = function* (E) {
  if (!G.flag('sanctum_done')) { yield E.say("Garet is waiting outside, dear. Off you go.", 'Dora'); return; }
  const back = G.party.members.some(m => m.name === 'Ivan' || m.name === 'Mia');
  if (back && !G.flag('dora_revisit')) {
    G.set('dora_revisit');
    yield E.say("Isaac! You're... you're back. Let me look at you.", 'Dora');
    yield E.say("(Dora holds Isaac at arm's length for a long moment.)");
    yield E.say("And who are these? Friends of yours?", 'Dora');
    if (G.party.members.some(m => m.name === 'Ivan')) yield E.say("I'm Ivan, ma'am. Of Kalay - well, of nowhere in particular. Isaac took me in on the road.", 'Ivan');
    if (G.party.members.some(m => m.name === 'Mia')) yield E.say("Mia, of Imil. Your son has done a great deal of good already, Mrs. Dora. More than he'll tell you.", 'Mia');
    yield E.say("Then you're welcome in this house, both of you. Isaac - your father would have been proud. Go carefully. And come home.", 'Dora');
    return;
  }
  yield E.say(G.flag('dora_revisit') ? "There's always a bed here, Isaac. Whatever happens out there." : "Take care of yourself, Isaac. Come home safe.", 'Dora');
};
STORY.garetFamily = function* (E) {
  const back = G.flag('sanctum_done') && G.party.members.some(m => m.name === 'Ivan' || m.name === 'Mia');
  if (back && !G.flag('garet_revisit')) {
    G.set('garet_revisit');
    yield E.say("Garet! Look at the state of you. Have you been eating?", "Garet's Mother");
    yield E.say("Mom! I'm fine. I'm... we're on an important mission. Look - this is Ivan, and this is Mia. They're Adepts too.", 'Garet');
    if (G.party.members.some(m => m.name === 'Ivan')) yield E.say("Pleased to meet you. Garet talks about your cooking constantly.", 'Ivan');
    if (G.party.members.some(m => m.name === 'Mia')) yield E.say("He's been very brave, ma'am. Reckless, but brave.", 'Mia');
    yield E.say("Reckless, that's my boy. Well - sit down, all of you. Nobody leaves this house hungry.", "Garet's Mother");
    yield E.say("(A long, loud meal. Garet's father asks about Mt. Aleph twice and forgets the answer twice. Garet's grandfather says nothing and watches Isaac.)");
    yield E.say("Go on then, if you must. Keep an eye on him, Isaac.", "Garet's Mother");
    return;
  }
  yield E.say(G.flag('garet_revisit') ? "Come back for supper whenever you're passing, all of you." : "Garet is always getting into trouble. Keep an eye on him, Isaac.", "Garet's Mother");
};
