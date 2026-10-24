// ---------- Alhafra ----------
// The port of western Osenia, laid out after map references/golden-sun-the-lost-age-alhafra-and-alhafra-cave-gba-
// map.webp (the town panel, 52 x 53, classed by tools/towns/alhafra_build.py into js/maps/alhafra_layout.js, the
// houses and terraces laid over it here). The mayor's mansion on its terrace over the sea, the two cave doors in the
// rock (the rear one by the mansion, the front one under the stairs west of the plaza), the market tents, the double
// house and the homes on the plaza, the inn by the beach lane, the houses the wave broke on the shore, the beach
// with its tide pools, the gate road south and the lane east to the wharf. Story per the script: the Madrans arrive
// behind the party; the pirate lookout on the mansion road; Alex upstairs at the inn; the mayor's guards keep the
// door until Briggs is taken; below the ship's deck the party eavesdrops on Briggs, fights him, and the mayors of
// Madra and Alhafra settle the ship and the prisoner; Chaucha and Eoleo visit Briggs in the jail under the town.
'use strict';
{
  const T3 = STORY_TLA;
  const AL_LEGEND = { '.': 'grass', ':': 'path', 's': 'sand', 'w': 'water', 'T': { ground: 'grass', obj: 'tree' }, 'S': { ground: 'stonefloor', obj: 'stairs', walk: true }, 'F': { ground: 'grass', obj: 'fence' },
    'A': { ground: 'grass', obj: 'awning_teal', walk: true }, 'C': { ground: 'path', obj: 'counter' }, 'D': { ground: 'grass', obj: 'door_cave', walk: true }, 'H': { ground: 'sand', obj: 'wall_stone' }, 'Q': 'grass' };
  defineMap('alhafra', {
    name: 'Alhafra', w: 52, h: 53, base: 'grass', music: 'alhafra', bg: 'grass', entry: { x: 25, y: 51 },
    build(M) {
      M.paint(0, 0, ALHAFRA_ROWS, AL_LEGEND, { cliff: '#', set: 'cliff', faces: 2 });
      const stone = { wall: 'wall_stone', windows: true };
      // the mansion: a walled house with its tower, the door in the middle of its front
      M.house(13, 3, 8, 9, 'roof_thatch', Object.assign({ wallRows: 5, doorX: 4, to: 'alhafra_mayor', tx: 8, ty: 12, chimney: true }, stone));
      M.house(20, 2, 4, 9, 'roof_grey', Object.assign({ wallRows: 6, door: false, windows: false }, stone)); M.setObj(21, 2, 'roof_grey_peak'); M.setObj(22, 2, 'roof_grey_peak');
      // the houses on the plaza: the item shop, the double house (upper and lower), the sanctum; the inn by the beach lane
      M.house(18, 34, 6, 5, 'roof_thatch', Object.assign({ wallRows: 3, doorX: 4, to: 'alhafra_item', tx: 6, ty: 6, sign: 'shop_sign' }, stone));
      M.house(27, 35, 5, 5, 'roof_thatch', Object.assign({ wallRows: 3, doorX: 2, to: 'alhafra_house2', tx: 6, ty: 8 }, stone));
      M.house(27, 41, 5, 5, 'roof_thatch', Object.assign({ wallRows: 3, doorX: 3, to: 'alhafra_house4', tx: 6, ty: 8 }, stone));
      M.house(18, 40, 7, 7, 'roof_thatch', Object.assign({ wallRows: 4, doorX: 4, to: 'alhafra_sanctum', tx: 6, ty: 8, sign: 'sanctum_sign' }, stone));
      M.house(38, 42, 7, 7, 'roof_thatch', Object.assign({ wallRows: 4, doorX: 4, to: 'alhafra_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true }, stone));
      // the market: the weapon and armor stalls under their awnings
      for (let x = 24; x <= 26; x++) M.setObj(x, 30, 'awning_teal_edge'); for (let x = 28; x <= 30; x++) M.setObj(x, 30, 'awning_teal_edge');
      for (const x of [24, 26, 28, 30]) M.setObj(x, 31, 'crate');
      M.npc('alh_stall_weapon', 25, 31, { type: 'merchant', name: 'Weapon Seller', dir: DIR.DOWN, shop: 'alhafra_weapon', text: "We were hit by a wave so strong that it swept homes off their foundations! What's worse is, all my best weapons were washed out to sea!", mind: 'Losing all my most expensive items may well ruin my business entirely...' });
      M.npc('alh_stall_armor', 29, 31, { type: 'merchant', name: 'Armor Seller', dir: DIR.DOWN, shop: 'alhafra_armor', text: "That tidal wave may well wash out both my business and the weapon shopkeeper's!", mind: "It doesn't matter how well-crafted a suit of armor is... If you soak it in seawater, it's junk. All my furs are ruined... All my steel is rusted." });
      // the well, the broken houses' jar, the graves the wave made
      M.setObj(10, 45, 'well_tl'); M.setObj(11, 45, 'well_tr'); M.setObj(10, 46, 'well_bl'); M.setObj(11, 46, 'well_br');
      for (const [x, y] of [[44, 36], [45, 36], [46, 36], [44, 38], [45, 38], [46, 38]]) M.setObj(x, y, 'gravestone');
      M.chest(45, 37, 'Psy Crystal', 1, { hidden: true });
      // the cave doors: the rear one on the mansion's terrace (the boy's father keeps it), the front one under the little stairs (the jail)
      M.exit(6, 9, 1, 1, 'alhafra_cave_1', 6, 8, DIR.UP, { door: true, cond: () => G.flag('alhafra_boy_fed') }); M.block(12, 34); M.walkable(12, 34);
      M.npc('alh_father', 7, 8, { type: 'villager_m', name: 'Father', dir: DIR.LEFT, cond: () => !G.flag('alhafra_boy_fed'), text: "That's the back way into the caves under the mansion. Nobody goes in - my boy's been crying his eyes out and I've no time to watch the door and him both." });
      M.exit(12, 33, 1, 1, 'alhafra_jail', 7, 10, DIR.UP, { door: true, cond: () => G.flag('briggs_caught') });
      M.npc('alh_caveguard', 13, 34, { type: 'guard', name: 'Guard', dir: DIR.LEFT, cond: () => !G.flag('briggs_caught'), text: "No one is allowed beyond this point. Don't even think about it.", mind: 'The mayor said no one goes through, and I mean to make sure no one goes through!' });
      // the ways out: the gate south, the lane east to the wharf
      M.exit(24, 52, 4, 1, 'world_tla', 203, 197, DIR.DOWN); M.walkable(24, 52, 4, 1);
      M.exit(51, 37, 1, 3, 'alhafra_east', 1, 39, DIR.RIGHT); M.walkable(51, 37, 1, 3);
      // the mansion's guards, until Briggs is taken
      M.npc('alh_mg1', 16, 12, { type: 'guard', name: 'Guard', dir: DIR.DOWN, cond: () => !G.flag('briggs_caught'), text: "Listen, you look like an OK guy, and I'd love to let you through, but I just can't... I mean, if I let you in, then I'd have to let everyone in, right? I'm sorry, but it wouldn't be fair.", mind: "My partner's always in such a bad mood... Maybe I should bake him a cake..." });
      M.npc('alh_mg2', 18, 12, { type: 'guard', name: 'Guard', dir: DIR.DOWN, cond: () => !G.flag('briggs_caught'), script: function* (E) { const y = yield* E.ask('Did you want to see the mayor?', 'Guard', ['Yes', 'No']); yield E.say(y === 0 ? "Sorry, but he's meeting with some visitors from Madra right now... Maybe you can see him once he's finished with them." : "The mayor is very open to meeting visitors, but he's in an important meeting now... So it's probably good that you're not here to see him...", 'Guard'); }, mind: 'I hate my job. I always have to be so tough and secretive around people. Deep down inside, all I really want to do is read them some of my poetry...' });
      M.block(17, 12); if (G.flag('briggs_caught')) M.walkable(17, 12);
      // the scenes: the Madrans arriving behind the party, the lookout on the mansion road
      M.trigger(22, 48, 8, 2, T3.alhafraArrive, { once: 'alhafra_arrived' });
      M.trigger(14, 15, 6, 2, T3.alhafraLookout, { once: 'alhafra_lookout', cond: () => G.flag('alhafra_arrived') && !G.flag('briggs_caught') });
      // the people
      M.npc('alh_m1', 27, 44, { type: 'villager_m', move: 'wander', text: "Welcome to Alhafra. This is the largest town in western Osenia... You can find anything you need here! ...Unless you need a boat, that is...", mind: "This guy's probably wondering about that boat sitting down at the pier... It still floats, but I don't think the thing can move..." });
      M.npc('alh_m2', 33, 40, { type: 'sailor', text: 'A massive tidal wave hit us and destroyed every ship in Alhafra.', mind: 'Losing our boats was awful... But I feel so bad for all the people whose houses were destroyed by the tidal wave.' });
      M.npc('alh_m3', 36, 31, { type: 'villager_m', text: 'Right after my boat got crushed, a group of men came by asking if I had one for sale. They were pretty swarthy, like they might have been sailors or something.', mind: 'Those guys looking for a boat sure were in a hurry. I wonder why... Hey, at least I was able to unload that boat with the busted mast on them.' });
      M.npc('alh_m4', 8, 40, { type: 'villager_m', move: 'wander', script: function* (E) { const y = yield* E.ask('I hear the tidal wave knocked Indra into Osenia. Is that true?', 'Man', ['Yes', 'No']); yield E.say(y === 0 ? "Really? It's just so hard to believe, you know? Still, that would explain the massive jolt we felt right after the tidal wave hit." : "I was hoping a traveler like you might have a better idea of what happened... Oh well...", 'Man'); }, mind: "I just can't believe a single tidal wave could cause an entire continent to move like that. But I used to be able to see Indra to the north of us, and it's definitely not there..." });
      M.npc('alh_m5', 4, 38, { type: 'elder_m', text: "Those men didn't look like they were from Osenia... I wonder what business they have in Alhafra...", mind: "If this guy's looking to buy a boat, he's looking in the wrong town... I already sold the last boat in town, and it had a broken mast!" });
      M.npc('alh_f1', 15, 22, { type: 'villager_f', move: 'wander', text: "Those people that just came through looked totally exhausted. You don't suppose they passed through Yampi Desert to get here, do you?", mind: "Who would come to Alhafra across the Yampi Desert? It's way too dangerous! Anyone with half a brain would've just taken the bridge to the northwest..." });
      M.npc('alh_kid', 31, 22, { type: 'child_m', move: 'wander', text: "Our port was ruined by the tidal wave, so kids aren't allowed there anymore... But all I want to do is just see what kind of wind is blowing in off the sea...", mind: "I don't know why they won't let us kids go down to see the dock... I wanna see what kind of damage the tidal wave did!" });
      M.npc('alh_f2', 21, 24, { type: 'villager_f', text: "We've had a lot of strangers coming through here lately.", mind: "This tidal wave's actually been good for Alhafra. The town is bustling with activity... I think I'll steer clear of those swarthy men at the wharf, though... They're a scary lot!" });
      M.npc('alh_canoe', 40, 39, { type: 'villager_m', name: 'Boatwright', script: function* (E) { const y = yield* E.ask("Let me guess... You're here because you want to buy a canoe, right?", 'Boatwright', ['Yes', 'No']); yield E.say(y === 0 ? "Sorry, but I'm totally backlogged with preorders. I'm gonna be up late finishing these as it is..." : "That's good, because I've got a ton of work to do already... And then I have to head down to the wharf and help clean up the wreck...", 'Boatwright'); }, mind: "We can't raise the mast until we get rid of the debris. But I can't help get rid of the debris until I finish at least this one last canoe!" });
      M.npc('alh_m6', 47, 41, { type: 'sailor', text: "That boat at the wharf uses a sail, so it's more efficient than any galley. But since the mast is broken, it's not going anywhere. What a waste.", mind: "I still can't believe those guys wanted to buy my busted boat! One man's junk..." });
      M.npc('alh_f3', 34, 47, { type: 'villager_f', text: "Why would the mayor go and sell our boat to a bunch of foreigners? I know it's got a broken mast, but come on!", mind: "It may be newfangled, but it's no good if it's broken. Forget technology! I'm sticking with boats with oars! No masts for me!" });
      // the crying boy on the lower east side, and the bread that stops him
      M.npc('alh_boy', 47, 45, { type: 'child_m', name: 'Boy', script: T3.alhafraBoy, mind: () => G.flag('alhafra_boy_fed') ? 'That was the best bread ever. Ever.' : "I'm so hungry... Everyone's eating vegetables... I want bread, real bread..." });
      // the Madrans, once they have come through the desert
      M.npc('alh_meg1', 21, 30, { type: 'villager_m', name: 'Madran', cond: () => G.flag('alhafra_arrived') && !G.flag('briggs_caught'), text: "Haaa hoo hooo... Are we... here? I feel like I just walked 500 miles. I'm fine... I feel like I could walk 500 more!" });
      M.npc('alh_meg2', 23, 30, { type: 'villager_m', name: 'Madran', cond: () => G.flag('alhafra_arrived') && !G.flag('briggs_caught'), text: "We're in no shape to go present ourselves to the mayor right now!" });
      M.sign(25, 48, 'ALHAFRA - the port of western Osenia. The wharf lies east along the shore.');
      M.sign(14, 12, 'The mayor of Alhafra. Visitors by appointment.');
    }
  });
  // ---- the scenes of the town ----
  // the Madran party arrives behind Felix's, and asks the way to the mayor
  T3.alhafraArrive = function* (E) {
    E.spawn('am_7', 25, 51, { type: 'villager_m', name: 'Madran', dir: DIR.UP }); E.spawn('am_6', 26, 51, { type: 'villager_m', name: 'Madran', dir: DIR.UP });
    yield E.move('am_7', DIR.UP, 2); yield E.say('Finally! We made it!', 'Madran'); yield E.move('am_6', DIR.UP, 2); yield E.say('We-We\'re here?', 'Madran');
    E.spawn('am_3', 25, 51, { type: 'villager_m', name: 'Madran', dir: DIR.UP }); E.spawn('am_4', 26, 51, { type: 'villager_m', name: 'Madran', dir: DIR.UP }); yield E.move('am_3', DIR.UP, 1); yield E.move('am_4', DIR.UP, 1);
    yield E.say("Where's the Elder?", 'Madran'); yield E.say("He's coming now...", 'Madran');
    E.spawn('am_elder', 25, 52, { type: 'elder_m', name: 'M. Elder', dir: DIR.UP }); E.spawn('am_mayor', 26, 52, { type: 'noble', name: 'M. Mayor', dir: DIR.UP });
    yield E.say("So... is this Alhafra? Madra's a pretty big place, but this town is huge!", 'M. Mayor');
    yield E.say("We didn't come to Alhafra to shop, Mister Mayor. We're here to bring in Briggs the Champa.", 'M. Elder');
    yield E.say('I know that!', 'M. Mayor');
    yield E.say("Then we should go straight to speak with Alhafra's mayor.", 'M. Elder');
    yield E.say("We're in no shape to go present ourselves to the mayor right now!", 'Madran');
    yield E.say('Look, Briggs is obviously not here, and besides, we already know Piers is--', 'Madran');
    yield E.say('Silence!', 'M. Elder');
    yield E.say('It seems Alhafra has felt the effects of the tidal wave as well...', 'M. Elder');
    yield E.say("That would explain why Alhafra doesn't seem to have any boats for sale, either!", 'M. Elder');
    yield E.say('You know, just looking around, I get the impression they only had one boat to begin with!', 'Madran');
    yield E.say('So if you really needed a boat, the only way to get one would be to steal it. Hmmm... But wouldn\'t that cause quite an uproar?', 'M. Elder');
    yield E.say('...Which means the pirates must still be here, trying to get a boat!', 'M. Mayor');
    yield E.say("That's why I want to meet the mayor of Alhafra before the Champa steal a ship.", 'M. Elder');
    yield E.say("Oh yeah... I get it now. In that case, let's go see Alhafra's mayor right away.", 'M. Mayor');
    yield E.say("Um... Say, excuse me... Where would we find the mayor of Alhafra?", 'M. Mayor');
    yield E.say("Uh... The mayor? Just keep going up this road. It's the last house. You can't miss it.", 'Man');
    yield Engine.fadeOut(30); for (const id of ['am_7', 'am_6', 'am_3', 'am_4', 'am_elder', 'am_mayor']) E.despawn(id); G.field.refreshNpcs(); yield Engine.fadeIn(30);
    yield E.say('(The Madrans hurry off up the road toward the mansion.)');
  };
  // the pirate lookout among the trees on the mansion road
  T3.alhafraLookout = function* (E) {
    E.spawn('al_pirate', 12, 17, { type: 'pirate', name: 'Pirate', dir: DIR.RIGHT });
    yield E.say("Ooo... This ain't good! That guy looked like the mayor of Madra... He must have come here looking for Briggs. I'd better go tell the others!", 'Pirate');
    const p = G.field.player; if (Math.abs(p.tx - 12) <= 1 && p.ty >= 16 && p.ty <= 18) {
      const y = yield* E.ask("What's your problem? What are you, some kind of freak? Well? What!? You got a problem with me?", 'Pirate', ['Yes', 'No']);
      yield E.say(y === 0 ? "Ah, who cares what you think? I've got stuff to do, so scram, kid!" : "So where do you get off invading my personal space, huh? Scram, stinkbreath!", 'Pirate');
      yield E.say('Where was I? Oh yeah, I was going to tell them about the mayor of Madra!', 'Pirate');
    }
    yield E.move('al_pirate', DIR.DOWN, 4); E.despawn('al_pirate'); G.field.refreshNpcs();
  };
  // the crying boy: the Large Bread from the ship's stores quiets him, and his father opens the back way into the caves
  T3.alhafraBoy = function* (E) {
    if (G.flag('alhafra_boy_fed')) { yield E.say("*munch* ...Dad says you can go in the caves whenever you want. *munch*", 'Boy'); return; }
    if (!G.inventory.has('Large Bread')) { yield E.say("Waaah! I'm hungry! Everyone's eating vegetables and I want bread! *sniff* Real bread!", 'Boy'); return; }
    const y = yield* E.ask("*sniff* ...Is that... bread? Real bread? Can I have it?", 'Boy', ['Yes', 'No']);
    if (y !== 0) { yield E.say("Waaaah!", 'Boy'); return; }
    G.inventory.remove('Large Bread'); Audio.sfx('item'); yield E.say('Felix hands over the Large Bread.'); yield E.say("*munch munch* ...It's the best bread ever! Ever! Dad! DAD! Look what they gave me!", 'Boy');
    yield E.say("Well, I'll be. Quiet at last. You've done me a kindness, stranger - go on into the caves by the back way if you've a mind to. I'll not stand in your road.", 'Father');
    G.set('alhafra_boy_fed'); G.field.refreshNpcs();
  };
  // ---- the buildings ----
  Kit.interior('alhafra_mayor', { name: "Alhafra Mayor's Mansion", w: 16, h: 14, floor: 'carpet_red', wall: 'wall_in_stone', back: { map: 'alhafra', x: 17, y: 12 }, furn: [['statue_gold', 3, 2], ['statue_gold', 12, 2], ['torch', 5, 1], ['torch', 10, 1], ['fireplace', 7, 1], ['table', 7, 6], ['chair', 6, 6], ['chair', 9, 6], ['bookshelf', 1, 3], ['bookshelf', 14, 3], ['crate', 14, 10], ['barrel', 1, 10]],
    npcs: [{ id: 'alh_mayor', x: 8, y: 3, type: 'noble', name: 'Mayor of Alhafra', script: T3.alhafraMayor },
           { id: 'alh_melder', x: 5, y: 4, type: 'elder_m', name: 'M. Elder', cond: () => G.flag('briggs_caught') && !G.flag('alhafra_ship_fixed'), text: "Piers will be freed the moment word reaches Madra. And the ship is ours, once it sails again. A good day's work, for an old man.", mind: "Twenty years, he says. I don't remember him at all." },
           { id: 'alh_mmayor', x: 10, y: 4, type: 'noble', name: 'M. Mayor', cond: () => G.flag('briggs_caught') && !G.flag('alhafra_ship_fixed'), text: "Come to Madra once our boat is fixed and we've sailed home. We are still recovering from the tidal wave, so it won't be much... But we do want to give you some kind of reward.", mind: "Why do I get the feeling the mayor of Alhafra prefers to deal with my father over me?" },
           { id: 'alh_butler', x: 3, y: 9, type: 'villager_m', name: 'Servant', text: () => G.flag('briggs_caught') ? "The mayor's treasure is kept underground, they say. South of the mansion. I wouldn't know." : "The mayor is with the visitors from Madra. Please wait.", mind: "Everyone says the hill beneath the mayor's mansion is full of tunnels. I wonder if that's true." }] });
  Kit.inn('alhafra_inn', { name: 'Alhafra Inn', price: 21, back: { map: 'alhafra', x: 42, y: 49 }, w: 16, h: 11, stairs: { x: 14, y: 5, to: 'alhafra_inn_up', tx: 12, ty: 5 },
    npcs: [{ id: 'alh_chef', x: 8, y: 2, type: 'villager_f', name: 'Chef', text: 'The innkeeper told me to use only the cheapest ingredients to help save money.', mind: "I can't believe I'm only supposed to feed the villagers vegetable dishes." },
           { id: 'alh_guest1', x: 9, y: 6, type: 'villager_m', text: "We're all guests in the same inn, so why is my meal so awful? At the very least, they should let us go back for seconds of that stinking slop!", mind: "I think I've lost weight from all these vegetables!" },
           { id: 'alh_guest2', x: 11, y: 7, type: 'villager_f', text: "I don't think I've had a bite of meat or fish ever since setting foot in this inn.", mind: "*Sniff sniff* That smell! That's the smell of fish... No! Now I'm drooling!" },
           { id: 'alh_guest3', x: 4, y: 7, type: 'child_m', text: "Ohhh... I'm hungry... My tummy hurts... When's dinnertime?", mind: "Maybe I'm just hungry, but everything they put in front of me looks delicious." },
           { id: 'alh_guest4', x: 12, y: 3, type: 'elder_m', text: "I'll never forgive the mayor for failing to come to our aid when we were all suffering... I wonder what I can do to make him suffer...", mind: "I hope the mayor's treasure room doesn't run too close to the prison... If those thieves found out about it, they'd dig their way out in no time flat!" }] });
  Kit.interior('alhafra_inn_up', { name: 'Alhafra Inn - Upstairs', w: 16, h: 9, furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['bed', 5, 2], ['bed_foot', 5, 3], ['bed', 11, 2], ['bed_foot', 11, 3], ['table', 8, 5], ['chair', 7, 5], ['pot', 1, 6], ['pot', 14, 6]], doorX: -1,
    stairs: { x: 12, y: 4, to: 'alhafra_inn', tx: 13, ty: 5, down: true },
    npcs: [{ id: 'AlexInn', x: 3, y: 5, look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN, cond: () => !G.flag('champa_visited'), script: T3.alexInn, mind: 'Really, I do wish you would quit using your Mind Read on me... Trust me, my thoughts will become all too clear in due time...' },
           { id: 'alh_pirate1', x: 8, y: 6, type: 'pirate', name: 'Pirate', cond: () => G.flag('champa_visited') && !!G.party.get('Isaac') && ST.gs1Done('deadbeard_done'), script: T3.alhafraPirates },
           { id: 'alh_pirate2', x: 10, y: 6, type: 'pirate', name: 'Pirate', dir: DIR.LEFT, cond: () => G.flag('champa_visited') && !!G.party.get('Isaac') && ST.gs1Done('deadbeard_done'), text: 'Crossbone Isle has a new king and we have never even seen his face.' },
           { id: 'alh_guest5', x: 13, y: 6, type: 'villager_f', text: "I heard there's only one person staying in the room next door. Can't they just move one more person into that room? Like me?", mind: "That warrior next door is so suave and handsome, just how I like 'em. I hope we can be friends." }] });
  T3.alexInn = function* (E) {
    if (!G.flag('alex_alhafra')) { G.set('alex_alhafra'); yield E.say("So, you've finally come. I had suspected we might run into each other again, since we both are looking for boats. Unfortunately, the only boat this town possesses has already been sold.", 'Alex'); yield E.say('I will be resting here in Alhafra a bit longer. I have traveled long and hard, and I am weary. Perhaps we can get along at least until we both depart.', 'Alex'); return; }
    yield E.say("The broken mast on the ship they sold won't be easily fixed. That is, as long as we Adepts don't do anything about it.", 'Alex');
  };
  Kit.shop('alhafra_item', { name: 'Alhafra Item Shop', shop: 'alhafra_item', back: { map: 'alhafra', x: 22, y: 39 }, npcs: [{ id: 'alh_itemkeeper2', x: 9, y: 5, type: 'villager_m', text: "Don't mention the tidal wave to the other merchants... It did a lot of damage, and we'd really just rather not talk about it, you know?", mind: "If all my goods were damaged by seawater, they'd be useless. I'm lucky the wave missed my shop." }] });
  Kit.home('alhafra_house2', { name: 'House', back: { map: 'alhafra', x: 29, y: 40 }, npcs: [{ id: 'alh_h2a', x: 3, y: 5, type: 'villager_m', text: "We're taking care of some people whose house was destroyed by the tidal wave. But... they're just so demanding! My wife feels so overwhelmed that she can't take it anymore!", mind: 'I just wish that old man would stop pestering my wife all the time!' },
    { id: 'alh_h2b', x: 8, y: 4, type: 'villager_f', text: 'Augh! With all these demanding houseguests, I feel like I\'ve lost control of my own house!', mind: "I don't mind helping people in need, but I won't be taken advantage of..." },
    { id: 'alh_h2c', x: 6, y: 6, type: 'elder_m', script: function* (E) { if (!G.flag('alh_tea')) { G.set('alh_tea'); yield E.say("Aren't you thirsty, my dear?", 'Old Man'); yield E.say("Oh, you're right, dear. I am!", 'Old Woman'); yield E.say("Sorry to bother you, but we'd like some tea.", 'Old Man'); yield E.say('Are you talking to me?! If you want tea, you can go right ahead and fix it yourself!', 'Woman'); } yield E.say('Well! I say! It seems the lady of the house is no lady at all!', 'Old Man'); }, mind: "All I ask is for a little tea, and that's the behavior I get!?" },
    { id: 'alh_h2d', x: 9, y: 6, type: 'elder_f', text: "When we lost our house in the tidal wave, the master of this house offered his home to us. But living with another family isn't easy. Hahhh... They're absolutely exhausting!", mind: 'Is this how a young bride treats her husband these days? Back in my day, we were never like that!' }] });
  Kit.home('alhafra_house4', { name: 'House', back: { map: 'alhafra', x: 30, y: 46 }, npcs: [{ id: 'alh_h4a', x: 4, y: 5, type: 'villager_m', text: "Those guys who bought the boat looked kinda shabby... But I hear they paid the mayor a whole wad of cash for it...", mind: "Why would anyone pay so much for a broken old boat? There's something odd about them..." },
    { id: 'alh_h4b', x: 8, y: 5, type: 'villager_f', text: "I don't care if it WAS broken! The mayor shouldn't have up and sold the town's only boat!", mind: 'I wonder if the mayor will use that money to repair our poor town...' }] });
  Kit.sanctum('alhafra_sanctum', { name: 'Alhafra Sanctum', back: { map: 'alhafra', x: 22, y: 47 }, npcs: [{ id: 'alh_healer_talk', x: 3, y: 6, type: 'priest', name: 'Priest', text: "In the middle of Osenia, there's a terrible village where they worship a foul and vengeful god.", mind: 'The people of Garoh brought the curse upon themselves for worshipping their wicked god...' }] });
  // the vestibule under the rear door, a stair down into the big cave
  defineMap('alhafra_cave_1', {
    name: 'Alhafran Cave', w: 12, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 6, y: 8 }, retreat: { map: 'alhafra', x: 6, y: 10, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 12, 10, 'cave_sand', 'sandcliff_face', 'sandcliff_top'); M.open(6, 9); M.fill(6, 9, 1, 1, 'cave_sand'); M.walkable(6, 9); M.exit(6, 9, 1, 1, 'alhafra', 6, 8, DIR.UP, { door: true });
      M.setObj(6, 2, 'stairs_down'); M.walkable(6, 2); M.exit(6, 2, 1, 1, 'alhafra_cave', 9, 5, DIR.DOWN, { stairs: true }); M.setObj(2, 2, 'torch'); M.light(2, 2, 3); M.setObj(9, 2, 'torch'); M.light(9, 2, 3);
      M.container(1, 7, 'pot', 'Sleep Bomb');
      M.sign(9, 7, 'The stair goes down under the mansion. The air comes up cold.'); }
  });
}
