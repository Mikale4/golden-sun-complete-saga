// ---------- Madra ----------
// The port town on the isthmus between Indra and Osenia, laid out after map references/golden-sun-the-lost-age-
// mandra-and-mandra-catacombs-gba-map.webp (the town panel, 50 x 34): a bowl of terraces walled in cliff and autumn
// trees, the seven stone houses of the town with the market tents under the inn, the town wall along the south with
// the broad stair down to the gate, the graveyard to the east and the two ladders into the catacombs (the main one
// in the rock pocket north of the plaza, the other behind the graves), the road east over the bridge toward Iron.
'use strict';
const MD_LEGEND = { '.': 'grass', ':': 'path', 'T': { ground: 'grass', obj: 'tree' }, 'W': { ground: 'grass', obj: 'wall_stone' }, 'S': { ground: 'stonefloor', obj: 'stairs', walk: true }, 's': 'stonefloor',
  'A': { ground: 'grass', obj: 'awning_teal', walk: true }, 'C': { ground: 'path', obj: 'counter' }, 'L': { ground: 'grass', obj: 'ladder', walk: true }, 'g': { ground: 'grass', obj: 'gravestone' }, 'f': 'flowers', 'E': 'path',
  'D': { ground: 'grass', obj: 'door_cave', walk: true }, 'b': { ground: 'grass', obj: 'barrel' }, 'k': 'grass', 'h': 'grass' };
const MADRA_ROWS = [
  'TTTTT......................TTT...TTTTTT.....TTTTTT',
  'TTTTT........#############.TTT...TTTTTT.TTT.TTTTTT',
  'TTTTT........#############.TTT...TTTTTT.TTT.TTTTTT',
  '.............#############..........TTT.TTT#######',
  '..TTTT......T#############.....TTT..TTT....#######',
  '..TTTT......T####D##D#####.....TTT..TTT.TTT#######',
  '..TTTT......T#.hAAAAAAAAA......TTT..TTT.TTT#######',
  '..TTTT.......#.#AAAAAAAAA.......###.TTT.TTT#######',
  '..TTTT.......###kkkkkkkkkb......###TT......#######',
  '###....:.....###CCCCCCCCCb......###TT......#######',
  '###....:::::..::::::::::::......#L#........###D###',
  '###########S::::::::::::::........:::::::::::::::E',
  '###########S:::::::::::::::::......###.....TTT....',
  '###.......................:::......###.....TTT.TTT',
  '###.......................:::......###.....TTT.TTT',
  '###.......................:::.........###......TTT',
  '###.......................:::.........###..#g.g###',
  '###:......................:::.........###..#fff###',
  '###:#.....................WW::::WWWWW......#g.g###',
  '##D:#.....................WW::::WWWWW..TTT.#...###',
  '###:#.....................###SS###..###TTT..TTT...',
  '###:#.....................###SS###..###TTT..TTTTTT',
  '###:#.....................###SS###..###.....TTTTTT',
  '###:#.....................###ss###..........TTTTTT',
  '###:#.W...................###SS###...TTT###....TTT',
  '###:#.W...................###SS###...TTT###...####',
  '###:#.W...................###SS###...TTT###...####',
  '###:..W...................###SS###...###.TTT.TTT..',
  '###...WWWWWWWWWWWWWWWWWWWWWW::::.....###.TTT.TTT..',
  '###...WWWWWWWWWWWWWWWWWWWWWW::::.....###.TTT.TTT..',
  '###...WWWWWWWWWWWWWWWWWWWWWW::::..###...TTT.......',
  '############################::::..###...TTT...TTT.',
  '############################::::..###...TTT...TTT.',
  '############################:EE:..###.........TTT.',
];

defineMap('madra', {
  name: 'Madra', w: 50, h: 34, base: 'grass', music: 'town', bg: 'grass', entry: { x: 29, y: 32 },
  build(M) {
    M.paint(0, 0, MADRA_ROWS, MD_LEGEND, { cliff: '#', set: 'cliff', faces: 2 });
    const stone = { wall: 'wall_stone', windows: true };
    // the houses: the old man's big house on its terrace, the inn with its balcony, three homes, the jail, the elder's hall
    M.house(6, 1, 6, 8, 'roof_blue', Object.assign({ wallRows: 5, doorX: 1, to: 'madra_house1', tx: 7, ty: 8, chimney: true }, stone));
    M.house(26, 4, 5, 8, 'roof_blue', Object.assign({ wallRows: 5, doorX: 3, to: 'madra_inn', tx: 8, ty: 8, sign: 'inn_sign' }, stone));
    M.house(5, 13, 4, 6, 'roof_grey', Object.assign({ wallRows: 3, doorX: 1, to: 'madra_house3', tx: 6, ty: 8 }, stone));
    M.house(13, 13, 5, 6, 'roof_grey', Object.assign({ wallRows: 3, doorX: 2, to: 'madra_house4', tx: 6, ty: 8 }, stone));
    M.house(21, 15, 5, 6, 'roof_grey', Object.assign({ wallRows: 3, doorX: 2, to: 'madra_house5', tx: 6, ty: 8 }, stone));
    M.house(12, 20, 4, 6, 'roof_grey', Object.assign({ wallRows: 3, doorX: 1, to: 'madra_prison', tx: 5, ty: 8, windows: false }, stone));
    M.house(17, 21, 5, 6, 'roof_blue', Object.assign({ wallRows: 3, doorX: 2, to: 'madra_mayor', tx: 8, ty: 12 }, stone));
    // the market: three stalls under their awnings, the keepers behind their counters; the awnings are walked over
    // from the inn's balcony, and past their west end a hop lands on the ledge with the Nurse's Cap
    for (let x = 16; x <= 24; x++) M.setObj(x, 7, 'awning_teal_edge');
    for (const x of [16, 18, 19, 21, 22, 24]) M.setObj(x, 8, 'crate');
    M.npc('madra_stall_item', 17, 8, { type: 'villager_f', name: 'Item Seller', dir: DIR.DOWN, shop: 'madra_item', text: () => G.flag('kibombo_raid') ? "All my injuries have healed up pretty nicely... It made for a nice vacation, but now, it's time to get back to work." : "My sister was hurt when the Champa attacked... She's recovering, but I sure hope Shin gets the guy who did it." });
    M.npc('madra_stall_weapon', 20, 8, { type: 'merchant', name: 'Weapon Seller', dir: DIR.DOWN, shop: 'madra_weapon', text: () => G.flag('kibombo_raid') ? "The armorer and I are busy researching the equipment the Kibombo left behind. They dropped a lot of strange weapons..." : "After the Champa opened the jail cells, they came over here... All of us merchants grabbed our own swords and started fighting..." });
    M.npc('madra_stall_armor', 23, 8, { type: 'merchant', name: 'Armor Seller', dir: DIR.DOWN, shop: 'madra_armor', text: () => G.flag('kibombo_raid') ? "I knew there was something strange about the pirates attacking us like that... I think those weapons we found are going to be the key to the mystery..." : "Ow. Ow. Ow... I think I got a bone bruise. I hate those..." });
    M.object('hop', 15, 6, { id: 'madra_ledge_gap' }); M.chest(14, 7, "Nurse's Cap", 1);
    M.setObj(26, 7, 'door'); M.walkable(26, 7); M.exit(26, 7, 1, 1, 'madra_inn_up', 1, 6, DIR.RIGHT, { door: true });   // the balcony door in the inn's west wall, off the awnings
    // the cavern home dug into the west cliff, off the ledge lane
    M.exit(2, 19, 1, 1, 'madra_cave_home', 6, 8, DIR.UP, { door: true });
    // the ways into the catacombs: the ladder in the pocket by the inn, which the watch keeps until the gate has
    // cleared the party; the door under the rock knot behind the graves, filled in after the first visit; and the
    // two doorways in the market pocket's face, where the catacombs' upper galleries come out
    M.exit(33, 10, 1, 1, 'madra_cave_a', 5, 2, DIR.DOWN, { stairs: true, cond: () => G.flag('madra_gate_checked') });
    M.npc('madra_watch', 33, 12, { type: 'villager_m', name: 'Man', dir: DIR.UP, cond: () => !G.flag('madra_grave_shut'), text: () => G.flag('kibombo_raid') ? "There are still plenty of things I want to go investigate in this cave. And until I do, there's no way I'm going to seal the entire thing off." : G.flag('madra_gate_checked') ? "I can't believe the Champa just stumbled onto this cave accidentally... That's like winning the lottery or something!" : "We're workin' in the hole right now, so... Until we're done here, you're gonna have to enter Madra through the gates.", mind: () => G.flag('madra_gate_checked') ? 'Who dug this cave? And why?' : "The Champa dug this hole when they raided our town, but there's more to it... The hole they dug uncovered a cave that runs all the way under our town!" });
    M.npc('madra_holeman', 42, 12, { type: 'villager_m', name: 'Man', dir: DIR.UP, cond: () => !G.flag('madra_grave_shut'), text: () => G.flag('kibombo_raid') ? "Now that we're sealing off the other end of this hole, maybe we won't have any more surprises!" : "I got someone to show me around inside... It's just a really big hole. Nobody could dig that much in such a short time without us noticing, you'd think...", mind: "I'm not sure the Champa actually dug this hole..." });
    M.exit(46, 10, 1, 1, 'madra_cave_c', 13, 2, DIR.DOWN, { door: true, cond: () => !G.flag('madra_grave_shut') });
    M.trigger(46, 10, 1, 1, function* (E) { yield E.say('The way under the rock has been filled in with earth and stones. The town saw to it after the raid.'); yield E.move('player', DIR.DOWN, 1); }, { cond: () => G.flag('madra_grave_shut') });
    M.exit(17, 5, 1, 1, 'madra_store', 3, 6, DIR.UP, { door: true }); M.exit(20, 5, 1, 1, 'madra_store', 10, 6, DIR.UP, { door: true });
    // the gate: two of the town watch look the party over on the landing of the stair
    M.npc('Karst', 23, 27, { look: NPC_LOOKS.Karst, name: 'Karst', dir: DIR.LEFT, showIf: 'piers_joined', hideIf: 'karst_gone', script: T2.karstTalk, mind: "(Using Psynergy on me? Are you so dense that you don't know when to be afraid? I don't have time to play games with you. Now, leave me to my thoughts!)" });
    M.trigger(17, 27, 8, 2, function* (E) { yield E.say('Where could Menardi have gone? Where are you, my sister?', 'Karst'); yield E.say('(A young woman with red hair, and red eyes... Menardi. She said Menardi.)', 'Jenna'); }, { once: 'karst_seen', cond: () => G.flag('piers_joined') && !G.flag('karst_gone') });
    M.trigger(18, 27, 3, 1, T2.madraCyclone, { once: 'cyclone_scene', cond: () => G.flag('madra_revisited') && !G.flag('cyclone_got') });
    M.trigger(29, 23, 2, 1, T2.madraGate, { once: 'madra_gate_checked' });
    M.trigger(29, 23, 2, 1, T2.madraGateKibombo, { once: 'madra_kibombo_told', cond: () => G.flag('briggs_caught') && G.flag('madra_gate_checked') });
    M.trigger(47, 11, 1, 1, T2.madraBridge, { cond: () => !G.flag('madra_permission') || !G.flag('madra_bridge_told') });
    M.npc('bridge_g1', 48, 12, { type: 'guard', name: 'Guard', dir: DIR.UP, text: () => G.flag('madra_permission') ? "If you try heading straight through Osenia to Alhafra, you'll hit Yampi Desert. You'd be better off avoiding the desert." : "If you have permission, you can cross anytime. But try to cross illegally, and we'll throw you in the hoosegow with Mr. Bluehair!", mind: "I'm startin' to wonder when the elder and the others'll come back from Osenia." });
    M.npc('bridge_g2', 47, 12, { type: 'guard', name: 'Guard', dir: DIR.UP, text: () => G.flag('madra_permission') ? "Alhafra is up along the northeast of Osenia... You'll see it eventually." : "You goin' to Osenia? You'll have to head back to town and get a permit! Just go to the elder's house and ask real nice-like.", mind: "I wish I could tell 'em it's nothing personal... Who knows what's waiting to gobble 'em up in Osenia!" });
    M.exit(29, 33, 2, 1, 'world_tla', 66, 81, DIR.DOWN); M.exit(49, 11, 1, 1, 'world_tla', 70, 79, DIR.RIGHT);
    M.trigger(48, 11, 1, 1, function* (E) { G.set('madra_grave_shut'); }, { once: 'madra_grave_shut' });   // once the party has gone on east, the town fills the graveyard way in
    M.trigger(28, 29, 4, 1, T2.vaultBandits, { once: 'vault_bandits_done', cond: () => G.flag('piers_freed') && ST.gs1Done('vault_thieves_done') });
    // the people
    M.npc('madra_g1', 30, 17, { type: 'guard', text: () => G.flag('kibombo_raid') ? "My guess is the Kibombo have long since fled the area. Still, considering the way things have been going, we still want to have guards at the gates." : "All of Indra shifted and collided with Osenia... Everyone's talking about it. As if dealing with invading pirate soldiers wasn't enough!", mind: () => G.flag('kibombo_raid') ? "I've been standing for so long, I wish they could give us little stools we could sit on." : "These are rough times... We don't have nearly enough people to help us." });
    M.npc('madra_g2', 28, 17, { type: 'guard', text: () => G.flag('kibombo_raid') ? "First, pirates raid our town, then the Kibombo come storming in... Things have been going horribly for Madra lately..." : "There's no way those pirates are coming back... Not after Indra slammed into Osenia. I hear you can even walk there if you want.", mind: () => G.flag('kibombo_raid') ? "The way things have been going, I'm so scared I can hardly sleep at night... Is our town cursed?" : "It's so weird that we can just walk to Osenia now. Crazy, crazy world..." });
    M.npc('madra_m1', 20, 11, { type: 'villager_m', move: 'wander', text: () => G.flag('kibombo_raid') ? "So... The Kibombo got into Madra from Gondowan, right? Well, doesn't that mean that we can cross into Gondowan from Madra, too?" : "You picked the wrong time to come to Madra... We've had disasters, pirate attacks, all sorts of nonsense...", mind: () => G.flag('kibombo_raid') ? "If Gondowan is really that much bigger than Indra, then I should go check it out." : "The town elder is getting pretty elderly. I hope he's OK traveling out there..." });
    M.npc('madra_m2', 40, 13, { type: 'villager_m', text: () => G.flag('kibombo_raid') ? "Briggs didn't have nearly as many pirates under him as we thought he did. He did an amazing job of flanking the town, considering how few men he had." : "Those Champa curs dug a hole here to sneak into Madra... And to think, it was just a decoy so they could break into the prison... What a crazy plan!", mind: () => G.flag('kibombo_raid') ? "Well, if Briggs only has four crew members, then they couldn't have outflanked us... They must have had help from someone else..." : "The Champa must have known exactly where Briggs was... But how did they know the layout of the town?" });
    M.npc('madra_f1', 24, 13, { type: 'villager_f', move: 'wander', text: () => G.flag('kibombo_raid') ? "The Kibombo came in through the broken wall to the west." : "That big wave moved the whole continent of Indra to the south. Now, we're sandwiched between the two continents of Gondowan and Osenia.", mind: () => G.flag('kibombo_raid') ? "It's strange... It's almost as though the Kibombo knew that the wall was broken... unless the pirates told them..." : "If a big wave can move the whole continent of Indra... Does that mean that all of Indra is just floating on the water?" });
    M.npc('madra_f2', 9, 22, { type: 'villager_f', text: () => G.flag('piers_freed') ? "Oh, Piers? We released him as soon as we heard. He stopped by the mayor's house and then left town." : "We took that unconscious guy from the boat and tossed him in jail. He keeps saying that he's not a Champa, though.", mind: () => G.flag('piers_freed') ? "Piers was so happy to get out of jail... But after he spoke to the mayor's wife, he looked unhappy. I wonder what she told him." : "I looked into that man's eyes. He looked so serene and calm... No one with such pretty eyes could be a liar." });
    M.npc('madra_m3', 24, 24, { type: 'villager_m', text: () => G.flag('piers_freed') ? "That guy Piers wasn't one of Briggs's men after all. I can't believe we locked him up without any evidence..." : "I don't care what the elder says... That prisoner is filthy Champa scum! Until someone proves otherwise, I say, let him rot!", mind: () => G.flag('piers_freed') ? "Piers didn't seem like he was in a very good mood when he left town." : "I'll never forgive those dogs for what they've done to our village." });
    M.npc('jail_g3', 11, 25, { type: 'guard', name: 'Guard', dir: DIR.RIGHT, text: () => G.flag('kibombo_raid') ? "You shoulda seen my partner in that fight! He was in the mix right up until they took him down... Man... That takes courage!" : "My partner was guarding the prison... When the Champa attacked, he was so scared, he ran off. Disgraceful!", mind: () => G.flag('kibombo_raid') ? "I can't believe nobody seems impressed that my partner fought the Kibombo so bravely." : "I miss my partner... But who knows? Maybe I would have done the same thing in his place." });
    M.npc('jail_shin_out', 16, 25, { type: 'villager_m', name: 'Shin', dir: DIR.LEFT, cond: () => G.flag('madra_jail_seen'), text: () => G.flag('piers_freed') ? "Piers wasn't one of the Champa... That's why they let him go. You shouldn't just keep an innocent man in prison for no reason." : "Even if we tried to tell someone what we saw... Who would believe us!? I think I'll just guard him from out here, where it's safe.", mind: () => G.flag('piers_freed') ? "There was something really frightening about Piers... I'm glad to be rid of him..." : "My sore bottom tells me it was all real... But I'm not about to say that out loud..." });
    M.npc('madra_kid', 10, 16, { type: 'child_m', move: 'wander', text: "My grandpa is sick. He needs a Healing Fungus from the Gondowan Cliffs, but the path is flooded!" });
    M.npc('madra_old', 9, 9, { type: 'elder_m', name: 'Old Man', script: T2.madraFungus });
    M.npc('madra_djinn_pet', 10, 9, { animal: 'djinni', animalCol: 2, name: 'Pet Djinni', hideIf: 'char_given', text: "(The little Mars Djinni hops happily around the old man.)" });
    M.npc('madra_grave', 45, 15, { type: 'elder_f', dir: DIR.DOWN, text: () => G.flag('kibombo_raid') ? "The Kibombo apparently used ropes to climb down the cliffs. But we can't climb back up the cliffs from this side." : "Did you come here over the Dehkan Plateau? You must have seen that boat grounded near the cave. I hear it was a Champa boat! And on it, they found an unconscious Champa! So they tossed him in our jail!", mind: () => G.flag('kibombo_raid') ? "If I were just a little bit younger, I think I might have been able to catch those Kibombo." : "I bet Briggs went to Osenia to find himself a new boat." });
    M.npc('madra_boy', 27, 15, { type: 'child_m', name: 'Boy', move: 'wander', script: function* (E) { if (G.flag('kibombo_raid')) { const y = yield* E.ask('Hey, mister! Are you the guy who beat up Briggs?', 'Boy', ['Yes', 'No']); yield E.say(y === 0 ? "So does that mean you'll go thump the Kibombo, too?" : "You're not? Someone told me it was a young warrior... That sounded a bit like you.", 'Boy'); } else yield E.say("The Champa were swarming over the village... But I screamed like the dickens and scared 'em off! It's true! Heh!", 'Boy'); }, mind: () => G.flag('kibombo_raid') ? "I heard the guys who captured Briggs were just a bunch of feeble-looking kids..." : "When I saw those Champa, I was so surprised that I let out a yelp... I must have startled them, because they all ran away!" });
    M.npc('madra_east', 38, 12, { type: 'villager_m', text: () => G.flag('kibombo_raid') ? "I heard that the elder got us a boat in Alhafra... I wonder if it's true..." : "The town elder took off to deal with Briggs... I wonder where he is now.", mind: () => G.flag('kibombo_raid') ? "The mayor is supposed to be coming back with that boat... I wonder when that will be..." : "Everyone thinks Briggs fled to the east after the breakout... I think that must be where the elder went with the others." });
    M.sign(31, 17, 'MADRA - gateway to Gondowan and Osenia. Catacombs closed by order of the elder.');
  }
});
// the watch at the gate: nobody comes in unlooked-at while Champa's pirates are loose
STORY_TLA.madraGate = function* (E) {
  E.spawn('mg_a', 29, 22, { type: 'guard', name: 'Guard', dir: DIR.DOWN }); E.spawn('mg_b', 30, 22, { type: 'guard', name: 'Guard', dir: DIR.DOWN });
  yield E.say('You there! Hold your ground!', 'Guard');
  yield E.say('What seems to be the trouble?', 'Kraden');
  yield E.say('Just wait there...', 'Guard');
  yield E.move('mg_a', DIR.DOWN, 1); yield 20; yield E.move('mg_a', DIR.UP, 1);
  yield E.say("They don't look like they're Champa...", 'Guard'); yield E.say('I agree.', 'Guard');
  yield E.say('Sorry for the delay. You may pass.', 'Guard');
  yield E.say('What were you checking us for?', 'Kraden');
  yield E.say('Our town was sacked by pirates...', 'Guard');
  yield E.say("They'd come to free their leader, Briggs. They came from the east, a small party, and we repelled them with ease... But then, foreigners struck from the west, exploiting a weak point near our prison.", 'Guard');
  yield E.say("That's over now, though... Feel free to relax and enjoy your time here safely.", 'Guard');
  E.despawn('mg_a'); E.despawn('mg_b'); G.field.refreshNpcs();
};
// back from Osenia with Briggs caught: the Kibombo have been through Madra, and the black orb is gone
STORY_TLA.madraGateKibombo = function* (E) {
  E.spawn('mg_a', 29, 22, { type: 'guard', name: 'Guard', dir: DIR.DOWN }); E.spawn('mg_b', 30, 22, { type: 'guard', name: 'Guard', dir: DIR.DOWN });
  yield E.say('Hey! You lot! Hold it right there!', 'Guard');
  yield E.say("Hang on, there's no need to stop them. They couldn't be involved in this mess...", 'Guard');
  yield E.say("If you're talking about the pirate incident, I believe we resolved that to everyone's satisfaction.", 'Kraden');
  yield E.say('This has nothing to do with the Champa this time, old man! This time, the Kibombo attacked us!', 'Guard');
  yield E.say('"Old man"?!? Hmph! Wait... Did you say you were attacked again? By the Kibombo?', 'Kraden');
  const k = yield* E.ask('Do you know about the Kibombo?', 'Guard', ['Yes', 'No']);
  if (k === 0) yield E.say("You must be pretty worldly, considering that they rarely leave the heart of Gondowan.", 'Guard');
  else yield E.say("Not many people do... They're a barbaric tribe from central Gondowan! Watch out for them!", 'Guard');
  yield E.say('When did all this happen?!', 'Kraden');
  yield E.say('Not too long ago...', 'Guard'); yield E.say('Right after the mayor left, actually...', 'Guard');
  yield E.say('Was anything stolen?', 'Kraden');
  yield E.say('Only a single black orb... Everything else was untouched.', 'Guard');
  yield E.say('A black orb...', 'Kraden');
  yield E.say("I'm afraid we don't have much more information than that.", 'Guard');
  yield E.say("You helped us with the Champa, so, I'll tell you what... Maybe you could look around at the mayor's house. It's the only one that was robbed.", 'Guard');
  G.set('kibombo_raid'); G.set('piers_freed');
  E.despawn('mg_a'); E.despawn('mg_b'); G.field.refreshNpcs();
  yield* E.chapter('Chapter 2: Gondowan');
};
// the prison: two of the town at the cell, and Piers' patience running out
STORY_TLA.madraJail = function* (E) {
  yield E.say("Admit it! You're one of the Champa, aren't you, Piers?", 'Man');
  yield E.say('Speak! Or let your silence condemn you!', 'Shin');
  yield E.say("I told you already... I'm not a Champa.", 'Piers');
  yield E.say('Then where did you come from?', 'Shin');
  yield E.say("The heart of the Eastern Sea... If I told you where, you'd never believe me.", 'Piers');
  yield E.say("Look at me when I'm talking to you! Are you trying to mock me!?", 'Shin');
  yield E.say('I implore you, do not anger me.', 'Piers');
  yield E.say("Oh, do you? So what's going to happen if I make you angry?", 'Shin');
  yield E.say('Hey, Shin... Maybe we should go easy on him.', 'Man');
  yield E.say("Hey, it wasn't your girlfriend who got hurt!", 'Shin');
  yield E.say('I am sorry she was injured, but I cannot--', 'Piers');
  yield E.say("I don't want your sympathy, freak! I want you to get angry for me!", 'Shin');
  yield E.say('Stop, please... Even my patience has its limits.', 'Piers');
  yield E.say("Hey, don't you want to see what he'll do?", 'Shin');
  yield E.say('I think we should just stop...', 'Man');
  yield E.say('If my words will not cool your temper, then...', 'Piers');
  // Frost: the puddle under Shin's feet becomes a pillar of ice, and Shin comes off the top of it
  Audio.sfx('psy'); Engine.doFlash(8, '#c0e8ff'); const pud = G.field.objectAt(4, 5); if (pud) { pud.kind = 'icepillar'; pud.state = 'ice'; }
  const shin = G.field.npcs.find(n => n.id === 'jail_shin'); if (shin) { shin.py -= 12; } yield 24; if (shin) { shin.py += 12; } yield E.move('jail_shin', DIR.RIGHT, 1);
  yield E.say('Oh! That was Psynergy!', 'Kraden');
  yield E.say('Waaaaaaaaaahh!', 'Shin');
  yield E.move('jail_shin', DIR.DOWN, 3); E.despawn('jail_shin'); G.field.refreshNpcs();
  yield E.say('Did you do that?', 'Man');
  yield E.say('What did your friend expect?', 'Piers');
  yield E.say('You monster!', 'Man');
  yield E.say('I... I am no monster.', 'Piers');
  yield E.move('jail_man', DIR.DOWN, 1);
  yield E.say('Help!!!', 'Man');
  yield E.move('jail_man', DIR.DOWN, 2); E.despawn('jail_man'); G.field.refreshNpcs();
  yield E.say('This man... He must be an Adept!', 'Kraden');
  const y = yield* E.ask('', 'Kraden', ['Yes', 'No']);
  if (y === 0) yield E.say('Of course! That was clearly Psynergy he used...', 'Kraden');
  else yield E.say("You're right... We only know what we just saw.", 'Kraden');
  yield E.say('Perhaps we should try to learn a little more about him.', 'Kraden');
  G.set('madra_jail_seen');
};
// leaving the prison: the elder's daughter, and leave to cross to Osenia
STORY_TLA.madraJailExit = function* (E) {
  E.spawn('jx_dau', 4, 9, { type: 'noble_f', name: "Elder's Daughter", dir: DIR.UP }); E.spawn('jx_man', 5, 9, { type: 'villager_m', name: 'Man', dir: DIR.UP });
  yield E.say('Has Piers escaped!?', "Elder's Daughter");
  yield E.move('jx_dau', DIR.UP, 1); yield E.move('jx_man', DIR.UP, 1);
  yield E.say("Oh, I'm so relieved... So Piers hasn't escaped?", "Elder's Daughter");
  yield E.say('If he had escaped, the elder would no longer be able to protect him.', 'Man');
  yield E.say('But... from the look of things, it seems there was a scuffle...', "Elder's Daughter");
  yield E.say('The cell is in disarray...', 'Man');
  yield E.say('What happened in there, I wonder?', "Elder's Daughter");
  yield E.say('It seems Piers is a man of many mysteries.', 'Man');
  yield E.say('Not the least of which being that boat he arrived in...', "Elder's Daughter");
  yield E.say('Oh, you there... You look like travelers.', "Elder's Daughter");
  yield E.say('Milady, now is not the time to be speaking with strangers!', 'Man');
  yield E.say("It's all right... This one has such kind eyes. When did you arrive? And where are you going?", "Elder's Daughter");
  yield E.say('My lady, please...', 'Man');
  const y = yield* E.ask('Are you... going to Osenia?', "Elder's Daughter", ['Yes', 'No']);
  if (y === 0) yield E.say('I knew it!', "Elder's Daughter"); else yield E.say('No need to be shy, my friends.', "Elder's Daughter");
  yield E.say('One requires permission to cross the bridge to Osenia, correct?', "Elder's Daughter");
  yield E.say('(The man nods.)');
  yield E.say('Then I hereby grant my permission to these travelers! Relay that message at once!', "Elder's Daughter");
  yield E.move('jx_man', DIR.DOWN, 2); E.despawn('jx_man');
  yield E.say('You may all continue your journey and cross into Osenia.', "Elder's Daughter");
  E.despawn('jx_dau'); G.set('madra_permission'); G.field.refreshNpcs();
};
// the drawbridge east: nobody crosses without the elder's word
STORY_TLA.madraBridge = function* (E) {
  if (G.flag('madra_permission')) {
    if (!G.flag('madra_bridge_told')) { G.set('madra_bridge_told'); yield E.say("Yeah, we heard about you already. If you're going to Osenia, you'd better get moving.", 'Guard'); yield E.say("Alhafra is up along the northeast of Osenia... You'll see it eventually.", 'Guard'); }
    return;
  }
  yield E.say("If you wanna cross here, you'll need permission from the town elder!", 'Guard');
  yield E.say("Without permission, ain't no one's gonna cross this bridge, no matter what!", 'Guard');
  yield E.move('player', DIR.LEFT, 1);
};
// Piers in his cell: his words, and what Sheba hears under them
STORY_TLA.piersJail = function* (E) {
  yield E.say("Ah... When will that kindly elder return and end my imprisonment? I have no time to wait, but I don't want to have to hurt anyone...", 'Piers');
};
// ---- the houses ----
Kit.home('madra_house1', { name: 'House', back: { map: 'madra', x: 7, y: 9 }, w: 14, h: 11, furn: [['bed', 1, 2], ['bed_foot', 1, 3], ['bed', 11, 2], ['bed_foot', 11, 3], ['table', 6, 5], ['chair', 5, 5], ['chair', 7, 5], ['bookshelf', 4, 2], ['fireplace', 7, 1], ['shelf', 9, 2]],
  npcs: [{ id: 'mh1_wife', x: 3, y: 6, type: 'villager_f', text: "My father-in-law is out by the door with that Djinni of his. The boy is upstairs, feverish. If only the cliffs weren't flooded..." }] });
Kit.inn('madra_inn', { name: 'Madra Inn', price: 12, back: { map: 'madra', x: 29, y: 12 }, w: 16, h: 11, stairs: { x: 14, y: 5, to: 'madra_inn_up', tx: 12, ty: 5 },
  npcs: [{ id: 'inn_sailor', x: 9, y: 6, type: 'sailor', text: "The boat on the shore south of here? Champa built, I'd swear it. Or something older." }] });
Kit.interior('madra_inn_up', { name: 'Madra Inn - Upstairs', w: 16, h: 9, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['bed', 5, 2], ['bed_foot', 5, 3], ['table', 9, 4], ['chair', 8, 4], ['pot', 14, 6]], doorX: -1,
  stairs: { x: 12, y: 4, to: 'madra_inn', tx: 13, ty: 5, down: true },
  build(M) { M.setObj(0, 6, 'door'); M.walkable(0, 6); M.exit(0, 6, 1, 1, 'madra', 25, 7, DIR.LEFT, { door: true }); /* out onto the awnings */ M.sign(1, 5, 'The balcony door. Below it, the awnings of the market run west along the wall.'); },
  npcs: [{ id: 'inn_guest', x: 7, y: 6, type: 'merchant', text: "A balcony over the market! I take the air out there. The tent roofs would hold a man, if a man were fool enough." }] });
Kit.home('madra_house3', { name: 'House', back: { map: 'madra', x: 6, y: 19 }, npcs: [{ id: 'mh3', x: 5, y: 5, type: 'villager_m', text: "The elder keeps a gem on his mantel that came out of the catacombs, years ago. He won't say what it is." }] });
Kit.home('madra_house4', { name: 'House', back: { map: 'madra', x: 15, y: 19 }, npcs: [{ id: 'mh4', x: 5, y: 5, type: 'scholar', text: "The catacombs beneath Madra hold a Summon Tablet, they say. But the deep way is flooded, and the doors want Psynergy nobody here has." }] });
Kit.home('madra_house5', { name: 'House', back: { map: 'madra', x: 23, y: 21 }, npcs: [{ id: 'mh5', x: 4, y: 5, type: 'villager_f', text: "Osenia's over the bridge to the east. Nobody's crossed since the raid; the elder wants the pirates found first." }] });
Kit.interior('madra_cave_home', { name: 'Cavern Home', w: 12, h: 10, floor: 'cave', wall: 'cavewall', back: { map: 'madra', x: 3, y: 19 }, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['table', 6, 4], ['chair', 5, 4], ['pot', 9, 2]],
  npcs: [{ id: 'mch_sick', x: 3, y: 4, type: 'villager_m', name: 'Sick Man', dir: DIR.DOWN, text: "...cough... the sea... something is coming up out of the sea...", mind: "(Fever-dreams: a ship with a black jewel at its heart... men in feathers, and the jewel gone... and then a tide that will not stop rising.)" },
         { id: 'mch_wife', x: 8, y: 5, type: 'villager_f', text: "He took a chill the night of the raid, out on the shore. Don't mind what he says; the fever talks." }] });
// Piers's return to Madra: the girl with red hair outside the mayor's residence, the reunion inside, the mayor's
// reward on the doorstep, and Karst hearing Felix's name
STORY_TLA.karstTalk = function* (E) {
  const r = yield* E.ask('Have you by chance seen a girl named Menardi?', 'Karst');
  if (r === 0) { const r2 = yield* E.ask("You have? And... And you're telling me that my sister is... dead?", 'Karst'); yield E.say(r2 === 0 ? 'If you continue these lies, I might take it upon myself to shut you up. Get out of my sight!' : "If you don't know my sister, then I have nothing to say to you. Get out of my sight!", 'Karst'); }
  else yield E.say("If you don't know my sister, then I have nothing to say to you. Get out of my sight!", 'Karst');
};
STORY_TLA.madraReunion = function* (E) {
  E.spawn('MayorR', 7, 5, { type: 'noble', name: 'Mayor', dir: DIR.DOWN }); E.spawn('ElderR', 9, 5, { type: 'elder_m', name: 'Elder', dir: DIR.DOWN });
  yield E.say("Felix! You're back!", 'Mayor'); yield E.say("And you've brought Piers with you!", "Elder's Daughter");
  yield E.say("Oh! Piers! Piers, I must apologize for the trouble we've caused you. I'm sorry we lost your jewel...", 'Elder'); yield E.say("Don't be. Everything worked out for the best.", 'Piers');
  yield E.say('Piers, you said you were going to go to Gondowan. Did you make it?', "Mayor's Daughter"); yield E.say('Yes. In fact, we have just returned.', 'Piers'); yield E.say('And your jewel...', 'Mayor');
  yield E.say('You actually got it back from the Kibombo? Incredible...', 'Elder'); yield E.say('I was able to recover it with the help of Felix and his friends.', 'Piers');
  yield E.say("That's wonderful! I'm so relieved! I was worried that you might never get it back!", "Elder's Daughter"); yield E.say("That's why we came back... To let you know that we've recovered it. Worry no more.", 'Kraden');
  yield E.say("If you've already recovered your jewel, why don't you stay here for a bit longer?", "Mayor's Son"); yield E.say("Unfortunately, we can't...", 'Jenna');
  yield E.say('We must go... to the island that is my home. I have made my decision. And the sooner we depart, the better, right, Kraden? We shall set sail, Felix! To my ship! To the Eastern Sea!', 'Piers');
  yield E.say('Do you truly mean to leave so soon, Piers?', "Elder's Daughter"); yield E.say('I may yet again have reason to visit your town, but... yes, I must go.', 'Piers'); yield E.say('You seem quite busy.', 'Elder');
  yield E.say('It is their youth that allows them to be so busy.', 'Kraden'); yield E.say("But we'll be back, I promise. Maybe we'll be able to visit at a more leisurely pace...", 'Jenna'); yield E.say("I'd like that... So would I!", "Mayor's Son");
};
STORY_TLA.madraCyclone = function* (E) {
  E.spawn('MayorOut', 19, 26, { type: 'noble', name: 'Mayor', dir: DIR.DOWN });
  yield E.say("Felix, wait! I believe I promised you a reward for helping with the boat, didn't I? Imagine! You came all this way to put us at ease, and I totally forgot to give this to you!", 'Mayor');
  yield E.say("Regardless, I told you that I would reward you when the boat was fixed... That may take quite a while now, it seems... That being the case, I'd like to give you that reward now.", 'Mayor');
  yield E.say("We can't accept it now, though, could we, Jenna?", 'Sheba'); yield E.say("Madra is still in shambles from the disaster... We couldn't possibly accept any gifts...", 'Jenna');
  yield E.say('Nonsense! Misfortune or no, a promise is a promise!', 'Mayor'); yield E.give('Cyclone Chip', 1); G.set('cyclone_got');
  yield E.say('I am glad that I was able to give it to you before you left. Your travels seem to take you from danger into greater danger. Please be careful.', 'Mayor'); E.despawn('MayorOut'); yield E.say('Thank you, Mr. Mayor.', 'Kraden');
  const k = E.field.npcs.find(n => n.id === 'Karst'); if (k) { k.hidden = false; k.tx = 22; k.ty = 27; k.px = 22 * TILE; k.py = 27 * TILE; k.dir = DIR.LEFT; }
  yield E.say("...Felix? You... He just called you Felix, didn't he? Why didn't I see it before? You are Felix! Then Menardi should be somewhere around here, too... And yet...", 'Karst');
  yield E.say("You won't see Menardi or Saturos again. Isaac killed them. They're probably at the bottom of the sea by now...", 'Sheba'); yield E.say('Sheba! Quiet!', 'Jenna');
  yield E.say('Hmph! I heard that, you wretched little thing! Can it be true? Is my sister dead?', 'Karst');
  yield E.say("I can't believe it... No one has the power to defeat Saturos and my sister... Yet you all avoid my gaze... And that look on your faces... It... is true...", 'Karst');
  yield E.say("Who is this Isaac? What? You feign ignorance? Why? Would you protect him from my fury!? Never mind. I believe I've heard some rumors of a traveler named Isaac lately. If he is pursuing you, then this Isaac should show up here sooner or later.", 'Karst');
  yield E.say("How do you know it wasn't Felix who defeated your sister?", 'Kraden');
  yield E.say("What do you take me for? I'm a warrior, like my sister... I can gauge a man's strength at a single glance. Even if you doubled Felix's power, he would still be no match for my sister.", 'Karst');
  yield E.say('But I must congratulate you on your successes at both the Mercury and Venus Lighthouses. Although your success there now prevents us from returning to the Western Sea... You would have failed, of course, had we not researched how to climb those lighthouses...', 'Karst');
  yield E.say("Regardless, Isaac won't be getting in my way. You will have to find your own way to the Western Sea. And if you make the journey, you'll have to light Jupiter on your own as well! We have our own work to do, and number one on the list is taking care of Isaac! Are we clear on this, Felix?", 'Karst');
  yield E.say("No, thank you. I believe we'll just find Jupiter Lighthouse on our own, if it's all the same.", 'Kraden');
  yield E.say("I see. Just don't let us down. I'm going to find this Isaac... And I swear that the last thing he sees will be Karst avenging the death of her dear sister!", 'Karst');
  if (k) k.hidden = true; G.set('karst_gone');
  yield E.say('Wow. And I thought Saturos and Menardi had issues.', 'Sheba'); yield E.say("We shouldn't take Karst too lightly...", 'Jenna');
  yield E.say('Wait a moment... Karst did say "we," didn\'t she?', 'Piers'); yield E.say('Yes. Saturos and Menardi traveled as a pair. Perhaps she has a partner as well.', 'Kraden');
  yield E.say('We ought to warn Isaac that Karst is after him. Maybe we should try to find him first.', 'Sheba'); yield E.say("Believe me, I'd love to see Isaac again, but we just don't have time to look for him.", 'Jenna');
  yield E.say("But, Jenna... Aren't you and Isaac an item? Couldn't you, you know, do something?", 'Sheba'); yield E.say("A... An item? No! I mean... It's not like that! Not... really... ...Stupid Sheba...", 'Jenna');
  yield E.say("*Ahem!* They were strong enough to defeat Saturos and Menardi. They won't be beaten easily. We should continue on ahead, just as Saturos and Menardi would have. Then we should be going, right, Felix?", 'Kraden');
};
Kit.interior('madra_mayor', { name: "Madra - Mayor's Residence", w: 16, h: 14, floor: 'carpet_red', wall: 'wall_in_stone', back: { map: 'madra', x: 19, y: 27 }, furn: [['statue', 3, 2], ['statue', 12, 2], ['torch', 5, 1], ['torch', 10, 1], ['fireplace', 7, 1], ['table', 7, 6], ['chair', 6, 6], ['chair', 9, 6], ['bookshelf', 1, 3], ['bookshelf', 14, 3]],
  build(M) {
    M.trigger(6, 10, 5, 3, T2.madraReunion, { once: 'madra_revisited', cond: () => G.flag('piers_joined') });
    // the black orb on the mantel - Piers' orb, kept for him by the elder - until the Kibombo take it
    if (!G.flag('kibombo_raid')) M.object('statue', 8, 1, { id: 'madra_gem', tile: 'cloak_ball', script: function* (E) { yield E.say("Don't touch that gem! The elder gave us strict orders to protect it!", "Mayor's Wife"); yield E.say('(A black orb, the size of a fist, sits on the mantel in an iron stand. A light moves in it.)'); } });
    else M.sign(8, 1, 'The iron stand on the mantel is empty.');
  },
  npcs: [{ id: 'mayor_wife', x: 6, y: 3, type: 'villager_f', name: "Mayor's Wife", text: () => G.flag('kibombo_raid') ? "All the Kibombo wanted when they attacked us was the black orb that sat above the fireplace. We're just lucky no one was hurt." : "Milady and I have been told to guard that jewel on the mantel.", mind: () => G.flag('kibombo_raid') ? "When my husband hears that the orb he was keeping was stolen, he'll be quite angry..." : "I wish I knew why the elder wanted us to protect this thing..." },
         { id: 'madra_daughter', x: 10, y: 3, type: 'noble_f', name: "Elder's Daughter", text: () => G.flag('kibombo_raid') ? "My father was holding on to that orb for Piers, and the Kibombo stole it... No matter how much he apologizes for losing it, it won't make things right." : "My father was opposed to arresting the man we found on the boat... But the townspeople were in an uproar about the Champa, and they locked him up.", mind: () => G.flag('kibombo_raid') ? "I won't ever forget the look on Piers's face when he heard his orb was stolen. He was so sad... It was like he'd lost a part of himself..." : "Until my father returns, I'll protect this gem with my life." },
         { id: 'mayor_son', x: 3, y: 8, type: 'child_m', name: "Mayor's Son", text: () => G.flag('kibombo_raid') ? "If my father'd been in town, I wouldn't have been scared when the Kibombo attacked." : "Dad and Grandpa have gone to Osenia to look for Briggs...", mind: () => G.flag('kibombo_raid') ? "Dad always knows what to do... He'd never have let those Kibombo barge in here..." : "If Dad has to fight, I wonder if he'll go..." },
         { id: 'mayor_dau', x: 12, y: 8, type: 'child_f', name: "Mayor's Daughter", text: () => G.flag('kibombo_raid') ? "My father hasn't come home yet, even though Briggs has been captured. I'm scared that something happened to him..." : "Whenever Dad goes on trips, he brings back presents! I wonder what he'll bring back this time...", mind: () => G.flag('kibombo_raid') ? "I hope he's just late because he's looking for a good souvenir to bring me..." : "I hope he brings me a nice doll. I want a wooden one!" },
         { id: 'elder_wife', x: 8, y: 10, type: 'elder_f', name: "Elder's Wife", text: () => G.flag('kibombo_raid') ? "Piers went to Kibombo to get his orb back. We told him that central Gondowan is very dangerous, but he wouldn't listen." : "When the elder gets back, I'm sure he will prove that young man innocent.", mind: () => G.flag('kibombo_raid') ? "When Piers left, he said he was going to pursue the Kibombo, but I wonder... What if he reached the cliffs and then couldn't climb them. I hope he's not stuck." : "He intends to find Briggs and prove that young man's innocence." }] });
Kit.interior('madra_prison', { name: 'Madra Jail', w: 10, h: 11, floor: 'floor_stone', wall: 'wall_in_stone', back: { map: 'madra', x: 13, y: 26 }, furn: [['torch', 2, 1], ['torch', 7, 1], ['barrel', 1, 8], ['bed', 7, 2], ['bed_foot', 7, 3]],
  build(M) {
    // the cell across the back of the room: bars along row 4, Piers behind them
    for (let x = 1; x < 9; x++) { M.setObj(x, 4, 'bars'); M.block(x, 4); }
    M.fill(1, 2, 8, 2, 'floor_stone');
    // the puddle under Shin's feet: Piers' Frost stands him on a pillar of ice
    if (!G.flag('madra_jail_seen')) { M.fill(4, 5, 1, 1, 'puddle'); M.object('puddle', 4, 5, { id: 'jail_puddle' }); }
    M.trigger(3, 8, 4, 1, T2.madraJail, { once: 'madra_jail_seen' });
    M.trigger(4, 9, 2, 1, T2.madraJailExit, { once: 'madra_permission', cond: () => G.flag('madra_jail_seen') });
  },
  npcs: [{ id: 'PiersJail', x: 5, y: 3, look: CHARACTERS.Piers.look, name: 'Piers', dir: DIR.DOWN, hideIf: 'piers_freed', script: T2.piersJail, mind: "Why did I use my Psynergy in anger? I must maintain control... My actions should never cause regret-- I... sense someone... using Psynergy... That person... Could he be--no, he is not of my people... When will I be freed?" },
         { id: 'jail_shin', x: 4, y: 5, type: 'villager_m', name: 'Shin', dir: DIR.UP, cond: () => !G.flag('madra_jail_seen'), text: "Speak, Champa! Or let your silence condemn you!" },
         { id: 'jail_man', x: 6, y: 6, type: 'villager_m', name: 'Man', dir: DIR.UP, cond: () => !G.flag('madra_jail_seen'), text: "Admit it! You're one of the Champa!" },
         { id: 'jail_man_after', x: 2, y: 7, type: 'villager_m', name: 'Man', dir: DIR.RIGHT, cond: () => G.flag('madra_jail_seen'), script: function* (E) { if (G.flag('piers_freed')) { yield E.say("So, that Piers guy wasn't a pirate after all, huh? That still doesn't answer where that ice came from... That freaked me out...", 'Man'); return; } const y = yield* E.ask('Was I just dreaming when that shaft of ice appeared?', 'Man', ['Yes', 'No']); yield E.say(y === 0 ? "Yeah! That's what it was... It was all just a dream..." : "What!? Oh! Oh... You're just... You're joking with me, right? Yeah... joking...", 'Man'); }, mind: () => G.flag('piers_freed') ? "That Piers was a strange fellow. Shin was terrified of him. He let him go as soon as we learned he was innocent." : "It was all just a dream... If I keep on saying it, maybe I'll believe it..." },
         { id: 'jail_shin_after', x: 7, y: 7, type: 'villager_m', name: 'Shin', dir: DIR.LEFT, cond: () => G.flag('piers_freed'), text: "Piers wasn't one of the Champa... That's why they let him go. You shouldn't just keep an innocent man in prison for no reason.", mind: "There was something really frightening about Piers... I'm glad to be rid of him... He went after the Kibombo, but I doubt he'll make it back from Gondowan alive." }] });
