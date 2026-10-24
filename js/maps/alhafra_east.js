// ---------- Eastern Alhafra: the wharf, the ship, the jail ----------
// After the rip's wharf panel (map references/golden-sun-the-lost-age-alhafra-and-alhafra-cave-gba-map.webp, the
// panel right of the town, 40 x 46 used): the lane in from the town on the south-west shore, the plank pier north
// to the ship the wave left with its mast down across the water, the rocky islet the mast's rope caught on, the
// Champa pirates at work on the wreck. Below the deck the cabin where Briggs holds court and the stores behind it.
// The jail under the town's rock (the front cave door) is here too: Briggs' cell, and the visit from Chaucha and
// Eoleo. Story per the script: the pirates' talk on the pier, the eavesdropping in the passage, the fight, the
// mayors' settlement (the ship to Madra, Briggs to the cell, Chaucha and Eoleo aboard), the jail scene.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const E = grid(40, 46, 'w');
  fill(E, 0, 31, 12, 45, '.'); fill(E, 0, 34, 2, 45, '#'); fill(E, 3, 43, 12, 45, '#'); fill(E, 0, 38, 2, 40, '.');   // the shore the lane comes in on
  fill(E, 7, 17, 9, 33, 'p');                                                    // the pier
  fill(E, 13, 10, 19, 34, 'd'); fill(E, 13, 10, 19, 10, 'R'); fill(E, 13, 34, 19, 34, 'R'); fill(E, 13, 11, 13, 33, 'R'); fill(E, 19, 11, 19, 33, 'R');   // the deck and its rails
  fill(E, 10, 17, 12, 17, 'p'); E[17][13] = 'd';                                 // the gangway from the pier's head onto the deck
  // the islet: its main part, the west shore corridor under a spine of rock, the channel across it, the south tip
  fill(E, 29, 4, 38, 33, '#'); fill(E, 30, 6, 37, 19, '.'); fill(E, 30, 20, 30, 26, '.'); fill(E, 30, 28, 37, 31, '.'); fill(E, 30, 27, 37, 27, 'w');
  fill(E, 34, 8, 37, 11, 'w');
  // the mast down across the water off the broken rail, its spur, and the debris the wave left in the water south of it
  fill(E, 20, 23, 25, 23, 'm'); E[23][19] = 'd'; E[24][25] = 'm'; E[25][25] = 'm';
  E[26][26] = 'h'; E[27][26] = 'm'; E[28][26] = 'h'; E[29][26] = 'm'; E[29][27] = 'h'; E[29][28] = 'm'; E[29][29] = 'h';   // hops between the flotsam to the south tip
  for (const [x, y] of [[3, 33], [5, 35], [10, 36], [4, 41], [33, 14], [36, 7]]) E[y][x] = 'T';
  const E_LEGEND = { '.': 'grass', 'w': 'water', 'h': 'water_hop', 'p': 'dock', 'd': 'ship_deck', 'R': { ground: 'ship_deck', obj: 'ship_rail' }, 'm': 'raft', 'T': { ground: 'grass', obj: 'palm' } };
  defineMap('alhafra_east', {
    name: 'Eastern Alhafra', w: 40, h: 46, base: 'water', music: 'alhafra', bg: 'water', entry: { x: 1, y: 39 },
    build(M) {
      M.paint(0, 0, strs(E), E_LEGEND, { cliff: '#', set: 'cliff', faces: 1 });
      M.exit(0, 38, 1, 3, 'alhafra', 50, 38, DIR.LEFT); M.walkable(0, 38, 1, 3);
      M.setObj(16, 11, 'door'); M.walkable(16, 11); M.exit(16, 11, 1, 1, 'alhafra_ship_cabin', 6, 8, DIR.UP, { door: true });   // the hatch down to the cabin
      M.setObj(16, 10, 'mast');
      // the wreck: the rock the wave rolled onto the mast's tip, out in the water; the blocks and the log on the mast, the
      // crates on its spur (Moved into the water they are footing), the log rolled off it, the crate on the islet's south
      // tip Moved into the channel, the cone pillar in the shore corridor (Pound), the rope on the pole (Lash), and Burst
      if (!G.flag('briggs_escaped')) {
        M.object('boulder', 28, 23, { id: 'ae_boulder', script: function* (E) { if (!G.flag('briggs_caught')) { yield E.say('A huge rock, rolled by the wave onto the tip of the mast. Nothing here will shift it.'); return; } if (!G.flag('alhafra_mast_seen')) { G.set('alhafra_mast_seen'); yield E.say("I don't know what we're going to do about this rock... I think we've done all we can do here... Let's get going...", 'Jenna'); return; } if (G.party.members.some(m => m.hasPsy('Burst') || Object.values(m.equip || {}).includes('Burst Brooch')) || G.inventory.has('Burst Brooch')) { yield E.say('Burst!', 'Felix'); yield* T3.alhafraShip(E); return; } yield E.say("The rock. Something more than hands will be needed for it - something that can break it, or burst it.", 'Kraden'); } });
        // the rock is seen from the foot of the mast: the party stands there a moment, and Jenna gives it up for now
        M.trigger(19, 22, 2, 3, function* (E) { G.set('alhafra_mast_seen'); yield E.face('player', DIR.RIGHT); yield E.say("I don't know what we're going to do about this rock... I think we've done all we can do here... Let's get going...", 'Jenna'); }, { cond: () => G.flag('briggs_caught') && !G.flag('alhafra_mast_seen') });
        M.object('crate', 21, 23, { id: 'ae_block1', tile: 'ak_block' }); M.object('crate', 25, 25, { id: 'ae_block2', tile: 'ak_block' }); M.object('crate', 25, 24, { id: 'ae_crate1' });
        M.object('log', 23, 23, { id: 'ae_log', horiz: false, len: 1, onFloat: function* (E) { yield E.say('The log rolls off the mast into the water, and the tide takes it away.'); } });
        M.object('crate', 30, 28, { id: 'ae_crate2' });
        M.object('pillar', 30, 24, { id: 'ae_cone', fixed: true });
        M.object('rope', 29, 23, { id: 'ae_rope', len: 1, dx: -1, dy: 0 });
        if (!G.flag('obj:alhafra_east:rope:ae_rope')) M.block(29, 23);
        M.sign(21, 22, "The mast, down across the water, with the wave's rubbish all over it: blocks, a log, crates. The rock at its tip is in the water, off the islet.");
      } else {
        // the ship is gone: the deck is open water, the pier ends in nothing
        for (let y = 10; y <= 34; y++) for (let x = 13; x <= 19; x++) { M.set(x, y, 'water'); M.setObj(x, y, null); }
        for (let x = 20; x <= 25; x++) M.set(x, 23, 'water'); M.set(25, 24, 'water'); M.set(25, 25, 'water');
      }
      // the pier's stores
      M.container(7, 18, 'pot', 'Smoke Bomb'); M.setObj(9, 18, 'crate'); M.setObj(7, 20, 'barrel'); M.setObj(9, 30, 'crate');
      // the pirates at their work
      M.npc('ae_p1', 8, 22, { type: 'pirate', name: 'Pirate', hideIf: 'briggs_caught', script: function* (E) { const a = yield* E.ask("What's your problem? You're new in town, aren't you?", 'Pirate', ['Yes', 'No']); if (a !== 0) { yield E.say("Well, I've never seen you before, but whatever...", 'Pirate'); return; } const b = yield* E.ask("You're probably curious about this here ship, huh?", 'Pirate', ['Yes', 'No']); if (b !== 0) { yield E.say('Masted ships like this were originally built by the Champa... Oh, forget it. It\'s lost on you.', 'Pirate'); return; } yield E.say('They call this a "sailing" ship... Wind is the only thing that\'ll make it move... Isn\'t that incredible?', 'Pirate'); const c = yield* E.ask('', 'Pirate', ['Yes', 'No']); yield E.say(c === 0 ? 'Yeah, well, think of how surprised we were to find that Alhafra had learned to build sailing ships! I suppose the age when anyone could sail the seas was bound to come someday.' : 'You kids today, with your "been there, done that" attitudes... It\'s a shame...', 'Pirate'); }, mind: "People call us Champa a seafaring people because we make sailboats... And sure, maybe we do a little pillaging on the side..." });
      M.npc('ae_p2', 15, 15, { type: 'pirate', name: 'Pirate', hideIf: 'briggs_caught', text: "We sent my pal into town to get some supplies, but he came back looking pale... He went straight down to talk to Briggs, and I haven't seen him since...", mind: "That lousy rat... If something happened back there, he should have told all of us!" });
      M.npc('ae_p3', 17, 25, { type: 'pirate', name: 'Pirate', hideIf: 'briggs_caught', text: "We paid big money for this ship. It's ours now, so don't you go cryin' about it.", mind: 'I thought it would be easy to right the mast, but I think I must have been crazy....' });
      M.npc('ae_p4', 32, 12, { type: 'pirate', name: 'Pirate', hideIf: 'briggs_caught', text: 'If we could just raise the mast, we could head back to Champa...', mind: "When I think about how long it will be until we go home, I miss Champa all the more. I'm just glad nobody in Champa knows we're pirates." });
      // after: the Madran workers and Chaucha aboard
      M.npc('ae_w1', 8, 24, { type: 'villager_m', name: 'Madran', cond: () => G.flag('briggs_caught') && !G.flag('alhafra_ship_fixed'), text: "The mast won't budge, no matter how many people we get to help us! And that rock...", mind: 'If the elder thinks this ship is sailing home to Madra, he has not looked at the mast.' });
      M.npc('ae_chaucha', 15, 20, { type: 'villager_f', name: 'Chaucha', cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped'), text: "I do get to stay on the boat, right? At least until it's repaired? Yes. That's where I'll be if you need me. ...With Eoleo...", mind: "Briggs... come home to us. Whatever it takes." });
      M.trigger(7, 26, 3, 1, T3.alhafraWharf, { once: 'alhafra_wharf_seen' });
      M.trigger(0, 38, 1, 3, T3.alhafraLeaveWharf, { cond: () => G.flag('alhafra_mast_seen') && !G.flag('alhafra_wharf_left') });
      M.sign(3, 39, () => G.flag('briggs_escaped') ? 'The wharf. The ship is gone.' : 'The wharf. The wave took the boats, and what it left has its mast in the water.');
      // after the escape: the men Briggs's pirates knocked down, and the mayor's tirade at the pier's head
      M.npc('ae_down1', 8, 30, { type: 'villager_m', name: 'Man', cond: () => G.flag('briggs_escaped') && !G.flag('alhafra_tirade'), text: 'Stupid Briggs...', mind: 'Briggs said the boat was his... And, to be honest, they had paid us for it, but...' });
      M.npc('ae_down2', 7, 27, { type: 'villager_m', name: 'Man', cond: () => G.flag('briggs_escaped') && !G.flag('alhafra_tirade'), text: 'Why do these things always happen to me?', mind: 'I just came down to see the repaired mast, and they jumped on me from out of nowhere.' });
      M.npc('ae_down3', 9, 24, { type: 'villager_m', name: 'Man', cond: () => G.flag('briggs_escaped') && !G.flag('alhafra_tirade'), text: 'Oooog... Ow...', mind: "Briggs's pirates... They attacked us and... The ship... The ship..." });
      M.trigger(7, 21, 3, 2, T3.alhafraTirade, { cond: () => G.flag('briggs_escaped') && !G.flag('alhafra_tirade') });
    }
  });
  // the pirates' talk on the pier, overheard on the way up it
  T3.alhafraWharf = function* (E) {
    if (G.flag('briggs_caught')) return;
    yield E.say("It's... It's no use! The mast just won't budge, no matter how many people we get to help us!", 'Pirate');
    yield E.say("We're going to have to get all this junk off the mast first. If we could just get some decent footing, we could have this thing clear in no time!", 'Pirate');
    yield E.say("There's more to it than that, though...", 'Pirate'); yield E.say('We still have to do something about that rope over there.', 'Pirate');
    yield E.say("Untangling that'll be a piece of cake, once we get a boat we can use...", 'Pirate');
    yield E.say('Oh, yeah... A piece of cake... Except for that huge rock over there!', 'Pirate'); yield E.say('Oh yeah... The rock...', 'Pirate');
    yield E.say("How are we supposed to get the mast out from under that thing? It's huge!", 'Pirate'); yield E.say("There's no way we're gonna move it by ourselves...", 'Pirate');
    yield E.say("Well, either way, we can't do anything until Zack finishes the canoe.", 'Pirate');
  };
  // leaving the wharf with the rock unmoved
  T3.alhafraLeaveWharf = function* (E) {
    G.set('alhafra_wharf_left');
    const y = yield* E.ask('Are you finished here, Felix?', 'Kraden', ['Yes', 'No']);
    if (y === 0) { yield E.say('Wait, you wanted to do this, and now you\'re telling me we should just give up?', 'Sheba'); yield E.say("I just don't see how much more help we can be here, Sheba.", 'Jenna'); }
    else { yield E.say("Oh, don't be ridiculous! We've already done so much.", 'Sheba'); yield E.say("I know how you feel, but there's nothing else we can do right now.", 'Jenna'); }
    yield E.say("So... Maybe we should start searching for another ship then... ...Not that I was planning on \"borrowing\" the Madrans' ship! But it doesn't look like the ship will be leaving anytime soon. So I think maybe we should just forget about that and start on our way again, Felix.", 'Kraden');
  };
  // Burst on the rock: the mast is clear; the men run for the mayor, Chaucha and Eoleo are glad, the mayor and Jiya come
  // down to see, and the party is asked to the manor for the night
  T3.alhafraShip = function* (E) {
    Audio.sfx('boom'); Engine.doShake(16); Engine.doFlash(12, '#ffffff');
    const o = G.field.map.objects.find(q => q.id === 'ae_boulder'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); }
    G.set('alhafra_ship_fixed');
    yield E.say('(The rock bursts apart with a crack like thunder, and the mast bobs up free of it!)');
    E.spawn('ae_man1', 8, 30, { type: 'villager_m', name: 'Man', dir: DIR.UP }); E.spawn('ae_man2', 9, 31, { type: 'villager_m', name: 'Man', dir: DIR.UP });
    yield E.say('Hey! That block on the mast has disappeared!', 'Man'); yield E.say('Hey! Now, we can raise the mast and use the sail again!', 'Man');
    yield E.say("Hey, mate, let's go tell the mayor the good news!", 'Man'); yield E.say("Yeah, let's do that!", 'Man'); E.despawn('ae_man1'); E.despawn('ae_man2');
    yield E.say('Baba babubu!!', 'Eoleo'); yield E.say('What is it, Eoleo? What are you so excited about?', 'Chaucha'); yield E.say('Baba babubu!', 'Eoleo');
    yield E.say("It's true! The block that was pinning the mast down is gone!", 'Chaucha');
    const y1 = yield* E.ask("You were the ones who did it, weren't you?", 'Chaucha', ['Yes', 'No']);
    yield E.say(y1 === 0 ? 'I knew you would do it someday.' : "But, of course, I also know that you didn't do it for our benefit.", 'Chaucha');
    yield E.say("Still, Briggs will be pleased when he hears about this. Well then, let's go tell him!", 'Chaucha');
    E.spawn('ae_mayor', 8, 29, { type: 'noble', name: 'Mayor', dir: DIR.UP }); E.spawn('ae_jiya', 9, 30, { type: 'guard', name: 'Jiya', dir: DIR.UP }); E.spawn('ae_man1', 7, 31, { type: 'villager_m', name: 'Man', dir: DIR.UP }); E.spawn('ae_man2', 9, 32, { type: 'villager_m', name: 'Man', dir: DIR.UP });
    yield E.say("I still just can't quite believe that the stone block on top of the mast has totally vanished.", 'Mayor'); yield E.say("I'm telling you, Mayor, I saw it with my own eyes! ...I mean, I didn't see it! It's gone!", 'Man');
    yield E.say("If you don't believe us, you can go see for yourself!", 'Man'); yield E.say("Huh? What? Whoa, hey!!! It's gone! That huge block is really gone!", 'Mayor'); yield E.say('Excellent news, Mayor!', 'Jiya');
    yield E.say('Unfortunately, the mayor of Madra will probably try to take it from us now. But that can wait. Who was able to move the block?', 'Mayor');
    yield E.say('Felix! Felix, did you do this?', 'Mayor'); yield E.say('Surprised to see us, Mayor?', 'Kraden'); yield E.say('Did you do this?', 'Mayor');
    yield E.say('We left Alhafra some time ago, but we just returned and destroyed the stone block.', 'Kraden'); yield E.say('Exploring? What brought you back to Alhafra right now?', 'Mayor'); yield E.say('Felix had a hunch that we might be needed here.', 'Kraden');
    yield E.say("Mayor, not to interrupt, but shouldn't we begin repairs on your ship now?", 'Jiya'); yield E.say("Yes, yes... You're right, of course. Gather the townspeople and get them to work on the mast.", 'Mayor');
    yield E.say("Yes, sir! We're on our way!", 'Man'); yield E.say("We shouldn't need too many people to raise the mast!", 'Man'); yield E.say("All right. I'm counting on you.", 'Mayor'); E.despawn('ae_man1'); E.despawn('ae_man2');
    const y2 = yield* E.ask("Destroying that stone must have been quite a challenge. Why don't you come back to my manor to get some rest?", 'Mayor', ['Yes', 'No']);
    yield E.say(y2 === 0 ? "You're too kind, Mayor. We'd be happy to..." : "We could use the rest, Felix. We should accept the mayor's offer.", 'Kraden');
    E.despawn('ae_mayor'); E.despawn('ae_jiya');
    yield Engine.fadeOut(24); E.warpNow('alhafra_mayor', 8, 8, DIR.UP); yield Engine.fadeIn(24);
    yield* T3.alhafraMorning(E);
  };
  // the next morning at the manor: the guard's news, the mast raised, and the mayor's demand
  T3.alhafraMorning = function* (E) {
    E.spawn('am_mayor', 8, 4, { type: 'noble', name: 'Mayor', dir: DIR.DOWN }); E.spawn('am_jiya', 10, 5, { type: 'guard', name: 'Jiya', dir: DIR.LEFT });
    yield E.say('(The next morning.)'); yield E.say('Thank you again, Mayor. You keep a fine house.', 'Kraden'); yield E.say("Don't be silly. You've done us a great deed. It was the least I could do.", 'Mayor');
    yield E.say("Even if he gets the boat fixed, I don't think he's going to hand it over to Madra...", 'Sheba'); yield E.say("I agree... He's being way too nice for me to not be a little suspicious of him...", 'Jenna');
    yield E.say("I'm sorry, did you girls have something you'd like to share with us?", 'Mayor'); yield E.say('(They shake their heads.)'); yield E.say('I see!', 'Mayor');
    yield Engine.fadeOut(30); yield 30; yield Engine.fadeIn(30); yield E.say('(Some time passes.)');
    yield E.say('Jiya, how are the repairs coming along? Things seem to be moving slowly down there.', 'Mayor'); yield E.say('Milord, these things take time...', 'Jiya');
    E.spawn('am_guard', 8, 11, { type: 'guard', name: 'Guard', dir: DIR.UP }); yield E.say("Sir, there's a problem!", 'Guard'); yield E.say("Calm down, man! You're a soldier! What are you so flustered about!?", 'Mayor');
    yield E.say('Briggs destroyed the prison and escaped with his pirates!', 'Guard'); G.set('briggs_escaped');
    yield E.say('What, were you asleep while this was going on?', 'Mayor'); yield E.say("Don't... Don't be silly!", 'Guard'); yield E.say("How could Briggs possibly break out of our prison? It's one of the strongest in Osenia!", 'Jiya');
    yield E.say("I don't know what happened, but before I knew it, they'd smashed a hole in the wall!", 'Guard');
    E.spawn('am_man', 9, 11, { type: 'villager_m', name: 'Man', dir: DIR.UP }); yield E.say('Mayor! The mast has been raised!', 'Man'); yield E.say("Hey, what's up? Wait, you're supposed to be guarding the prisoners... What happened?", 'Man');
    yield E.say('It appears that Briggs has escaped.', 'Mayor'); yield E.say("That's no good...", 'Man'); yield E.say('What are you standing around for!? Search the area! Find Briggs at once!', 'Jiya');
    yield E.say('It... might not be quite that easy...', 'Guard'); yield E.say('He is a pirate, after all... A famous one!', 'Man'); yield E.say('Enough of that! Move it!', 'Jiya'); E.despawn('am_guard'); E.despawn('am_man');
    yield E.say("Regardless, I'm going to go inspect my boat... Oh, and Felix and his crew were there, too, weren't they? I treated you like an honored guest in my home... Usually, one feels a certain obligation to those who do them such a kind service, am I right?", 'Mayor');
    yield E.say("So, don't just stand there! Return the favor and find my Briggs!", 'Mayor'); yield E.say("Come on! Hurry up! Let's go! Move it!", 'Jiya'); yield E.say("Let's go see the boat.", 'Mayor'); E.despawn('am_mayor'); E.despawn('am_jiya');
    yield E.say("The mayor of Alhafra certainly does know how to look out for his own interest, doesn't he?", 'Piers'); yield E.say("That's one way of putting it!", 'Sheba');
    const y = yield* E.ask('Well, so what do we do? Do we go after Briggs?', 'Jenna', ['Yes', 'No']);
    yield E.say(y === 0 ? "Don't feel like you have to do them any favors!" : "That's right! Why should we help the mayor, after the way he treated you!", 'Sheba');
    yield E.say("Felix can decide for himself what to do... At the very least, I want to go see the sailing ship now that it's fixed. Let's just go outside and take a quick look.", 'Kraden');
  };
  // at the pier's head: the ship pulling away with Briggs at the rail, and the mayor's tirade
  T3.alhafraTirade = function* (E) {
    G.set('alhafra_tirade');
    E.spawn('at_mayor', 8, 19, { type: 'noble', name: 'Mayor', dir: DIR.UP }); E.spawn('at_jiya', 9, 20, { type: 'guard', name: 'Jiya', dir: DIR.UP });
    yield E.say('(The ship is already out on the water, its new mast up and its sail full. Briggs stands at the rail.)');
    yield E.say('Briggs!!! Briggs, where are you taking my boat?', 'Mayor'); yield E.say("He's attempting to steal it! Thief! Thief!", 'Jiya');
    yield E.say("Did you call me a thief? I paid for this boat, fair and square. I'm no thief.", 'Briggs'); yield E.say("You're the thieves! You tried to take our boat away, after we paid you so much for it!", 'Chaucha');
    yield E.say("You're the one who stole OUR boat!", 'Briggs'); yield E.say('Ahoy, Briggs!', 'Kraden'); yield E.say("Uh-oh... It's Felix!", 'Briggs');
    yield E.say("You're not afraid of them, are you? Look how far away they are... There's no way they can catch us now!", 'Chaucha'); yield E.say("You're right... They're stuck on the land, and we've got this boat!", 'Briggs');
    yield E.say("They can't catch us... What would they do, swim?", 'Chaucha'); yield E.say("Hah! You're right! They can't board us from way over there!", 'Briggs');
    yield E.say("Wasn't there something you wanted to do the next time you saw Felix? Don't tell me you forgot... It's all you ever talked about when you were in jail!", 'Chaucha'); yield E.say('Oh yeah... I almost forgot.', 'Briggs');
    yield E.say("So now's your chance! Do what you swore to do!", 'Chaucha'); yield E.say('Bleah!', 'Briggs'); yield E.say('Is that the best you could come up with?', 'Chaucha'); yield E.say("But, Chaucha, they're an awfully tough bunch...", 'Briggs');
    yield E.say("See? It's that attitude right there! That's why you'll never amount to anything!", 'Chaucha'); yield E.say("You know what? You're right! Hey! Felix! You guys take care! And keep Alhafra safe from thieves and pirates! And politicians, too!", 'Briggs');
    yield E.say('What!?!', 'Kraden'); yield E.say("I doubt we'll ever meet again, but if we do, remember this! Neener neener neener! Neener neener neener! Neener neener bleah!", 'Briggs');
    yield E.say('That may have been a bit much. If you make him mad, he might chase us right back to Champa.', 'Chaucha'); yield E.say('(They sail out of sight.)');
    yield E.say("What!!! You let Briggs get away! You and your friends talk a good game, but when trouble happens, where are you!? Well, isn't this a fine mess! My prize ship, stolen by a bunch of filthy pirate scum!", 'Mayor');
    yield E.say("Get up! They're gone, and you let them escape! You guys have royally botched this one. This ruins everything! You all ought to be ashamed! All of you were cowering, while I was the only one to stand up to them! All of you! I'm going back to my manor!", 'Mayor');
    yield E.say("And you, Felix. I am extremely disappointed in you. There will be no reward for you, Felix! You let that Briggs steal MY ship! You're lucky I don't lock you up in his stead! Bah! I've had enough of this! Don't just stand there with your mouths gaping! Get out of here!", 'Mayor');
    yield E.say("We don't have a boat, so there's no reason for anyone to be here at the port. Return to town.", 'Mayor'); E.despawn('at_mayor'); E.despawn('at_jiya'); E.set('alhafra_tirade');
    const y1 = yield* E.ask("What an awful person. Do you suppose he's always this self-centered?", 'Kraden', ['Yes', 'No']);
    yield E.say(y1 === 0 ? "Yes, he's terribly irritating. You're quite right, Felix." : "You can stay calm after listening to that windbag? That's quite mature of you.", 'Kraden');
    const y2 = yield* E.ask("I'll wager Briggs is returning to Champa, personally. Well, it doesn't matter. I think I've had enough of this town. Shall we be leaving?", 'Kraden', ['Yes', 'No']);
    yield E.say(y2 === 0 ? "Great! Let's leave as soon as possible, shall we?" : 'Ah, yes, well... If you still have business to attend to here. All right. But the sooner we leave, the better. Lead on, Felix!', 'Kraden');
  };
  // ---- below deck ----
  Kit.interior('alhafra_ship_cabin', { name: 'The Ship - Below Deck', w: 14, h: 10, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'alhafra_east', x: 16, y: 12 }, doorX: 6, furn: [['table', 3, 3], ['chair', 2, 3], ['chair', 4, 3], ['barrel', 12, 2], ['barrel', 12, 3], ['bed', 9, 2], ['bed_foot', 9, 3], ['shelf', 6, 2], ['crate', 1, 6]],
    build(M) { M.setObj(12, 6, 'door'); M.walkable(12, 6); M.exit(12, 6, 1, 1, 'alhafra_ship_back', 3, 6, DIR.UP, { door: true }); M.trigger(5, 8, 4, 1, T3.briggsCabin, { once: 'briggs_caught' }); },
    npcs: [{ id: 'BriggsHide', x: 4, y: 4, type: 'pirate', name: 'Briggs', dir: DIR.DOWN, cond: () => !G.flag('briggs_caught'), text: '...' }, { id: 'cabin_pirate', x: 6, y: 4, type: 'pirate', name: 'Pirate', dir: DIR.LEFT, cond: () => !G.flag('briggs_caught'), text: '...' },
           { id: 'cabin_eoleo', x: 9, y: 5, type: 'child_m', name: 'Eoleo', cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped'), text: 'Goo. Goo goo ga.', mind: '(A picture, bright and hot: fire, in a small hand. Then the sea, and a face he wants.)' }] });
  Kit.interior('alhafra_ship_back', { name: 'The Ship - Stores', w: 8, h: 9, floor: 'floor_wood', wall: 'wall_wood', back: { map: 'alhafra_ship_cabin', x: 12, y: 7 }, doorX: 3, furn: [['barrel', 1, 2], ['barrel', 2, 2], ['crate', 6, 2], ['crate', 6, 3], ['shelf', 4, 2]],
    build(M) { if (!G.flag('alhafra_bread')) M.object('shakeable', 6, 5, { id: 'ship_box', tile: 'crate', onShake: function* (E) { G.set('alhafra_bread'); yield E.say('The box shakes loose from its lashings and its lid comes off. Inside, wrapped in cloth: a loaf as long as an arm.'); yield E.give('Large Bread'); } }); else M.setObj(6, 5, 'crate');
      M.sign(1, 5, "The stores. A box is lashed to the wall so hard it would take an earthquake to loosen it."); } });
  // the passage under the deck: Briggs and his mate, overheard; then the fight, and everyone with a claim on the ship
  T3.briggsCabin = function* (E) {
    yield E.say('The mayor of Madra? Here? You\'re certain? How did he know we came to Alhafra?', 'Briggs');
    yield E.say('He knew we needed a ship, and he knew we went east. It seems pretty easy to me.', 'Pirate');
    yield E.say('Arr... Well, yeah... When you put it that way, it does make sense...', 'Briggs');
    yield E.say('He was looking to find the mayor of Alhafra...', 'Pirate'); yield E.say('He must be hoping the mayor will tell him where we are...', 'Briggs');
    yield E.say("He'll probably tell the Alhafrans we're pirates, too, huh?", 'Pirate'); yield E.say('Pirates!? That seems a little unfair!', 'Briggs');
    yield E.say("What do you mean? We... are pirates, aren't we? I mean, we've taken all sorts of stuff that didn't belong to us.", 'Pirate');
    yield E.say("That's only because everyone in Champa would starve otherwise! We don't have any choice.", 'Briggs'); yield E.say('Ah...', 'Pirate');
    yield E.say("And even then, it's never a lot.", 'Briggs'); yield E.say("Wha-What's not?", 'Pirate'); yield E.say('The stuff we take. We never take too much from any one town.', 'Briggs');
    yield E.say('Yeah, I guess not...', 'Pirate'); yield E.say('And why do you think that is?', 'Briggs'); yield E.say('Er... Why?', 'Pirate');
    yield E.say("Because you never can tell how these wealthy towns will react. It's too risky, right?", 'Briggs');
    yield E.say("Hey, yeah! Which is why we didn't steal anything from Alhafra...", 'Pirate');
    yield E.say("Right! That's why we avoid the risky towns and just take what we need from the others!", 'Briggs');
    yield E.say("See? That's why you're our captain, Briggs! You've got brains coming out your ears!", 'Pirate');
    yield E.say("Hmph! There's nothing brainy about that!", 'Jenna');
    yield E.say('Did you hear that? It sounded like a girl! Who\'s out there!?', 'Briggs');
    yield E.move('BriggsHide', DIR.DOWN, 2); yield E.move('cabin_pirate', DIR.DOWN, 2);
    yield E.say('What do you think you\'re doing?', 'Pirate');
    yield E.say("Don't you know that someone has been falsely imprisoned for your crimes?", 'Sheba');
    yield E.say("Er... What's your point?", 'Briggs');
    yield E.say("You have to come with us and attest to that man's innocence!", 'Jenna');
    yield E.say('And... why would I want to do something like that?', 'Briggs');
    yield E.say("Oh-ho! I was hoping we could avoid any ugliness, but you leave us no choice! We'll bring you in against your will if we must, but either way, you're coming with us! Isn't that right, Felix?", 'Kraden');
    const y = yield* E.ask('', 'Kraden', ['Yes', 'No']);
    yield E.say(y === 0 ? "Good for you! Let's teach these guys a lesson!" : "After what they've done? Come on, we need to make them fess up!", 'Jenna');
    yield E.say("You don't stand a chance! We're hardened criminal types! We eat punks like you for breakfast!", 'Pirate');
    yield E.say("Watch yourselves, you self-righteous little brats! You're the ones with a lesson to learn!", 'Briggs');
    const r = yield* E.battle(['Briggs', 'Sea Fighter', 'Sea Fighter'], { boss: true, canFlee: false, music: 'boss' });
    if (r !== 'win') { G.flags.briggs_caught = false; return; }
    yield E.say('Well, that takes care of that!', 'Jenna');
    yield E.say("And I'm willing to bet everyone Briggs has been harassing will be quite happy to hear it!", 'Sheba');
    yield E.say('This should set everyone in Indra at ease... They all seemed to fear the pirate Briggs...', 'Kraden');
    yield E.say("We lost... Even pirates have honor... I'll go quietly. I won't make a scene just because I lost... Go on... Hand us over to Madra or Alhafra or whoever...", 'Briggs');
    yield E.say('Good... First off, you can tell the Madrans that the man called Piers is innocent.', 'Jenna');
    const y2 = yield* E.ask("Fine. So, what, I just have to say that Piers isn't one of my men?", 'Briggs', ['Yes', 'No']);
    yield E.say(y2 === 0 ? "That's right. You tell the Madrans that, and they can release their prisoner." : "Saying Piers is innocent won't clear you of your own crimes...", 'Sheba');
    yield E.say("We've secured Briggs's vow... We should take him to the Madrans...", 'Kraden');
    E.spawn('Chaucha', 6, 8, { type: 'villager_f', name: 'Chaucha', dir: DIR.UP }); yield E.move('Chaucha', DIR.UP, 1);
    yield E.say("Wait! Can't you find it in your hearts to forgive Briggs and his men?", 'Chaucha');
    yield E.say('And who are you?', 'Kraden'); yield E.say("My name is Chaucha. I am Briggs's wife.", 'Chaucha'); yield E.say("So you're a pirate, too?", 'Jenna');
    yield E.say("No! Chaucha hasn't done a thing! Let her be!", 'Briggs');
    yield E.say('I know Briggs and his men have caused some great trouble with their piracy... And I know their crimes cannot be ignored...', 'Chaucha');
    yield E.say('If you know all that, then how can you ask us just to forgive him?', 'Sheba');
    yield E.say("The only reason Briggs became a pirate was to help the people of Champa. We Champa are a seafaring folk. Our livelihood depends entirely upon the sea. But in recent years, the sea has changed... We can't live the life we once could.", 'Chaucha');
    yield E.say('The oceans have warmed, and the fish have vanished from our waters.', 'Briggs');
    yield E.say('The soil in Champa is rocky and barren. No crops can grow there.', 'Chaucha');
    yield E.say('No crops? So you have no grains? And no meat? It sounds like life in Champa is hard...', 'Kraden');
    yield E.say("It's not hard! It's unbearable! Our children can't eat! Our village is dying!", 'Briggs');
    yield E.say('These men promised to return with food enough for all our people, but they found none...', 'Chaucha');
    yield E.say('So you became pirates... thieves...', 'Jenna'); yield E.say("We don't know where Champa is...", 'Sheba');
    yield E.say('It sits on the southeast corner of Angara...', 'Kraden'); yield E.say("Southeast Angara? Isn't that near Xian and Lama Temple?", 'Jenna');
    yield E.say("You have a good memory! If you were to head south through the mountains, you'd find it.", 'Kraden');
    yield E.say("That's so far away...", 'Jenna'); yield E.say('Well, yeah! You think we could be successful pirates so close to home?', 'Briggs');
    yield E.say('If they raided any towns near Champa, it would be obvious to all who the attackers were...', 'Chaucha');
    yield E.say('And no one back home could forgive me if they knew. Not even my grandmother...', 'Briggs');
    E.spawn('MM', 5, 8, { type: 'noble', name: 'M. Mayor', dir: DIR.UP }); E.spawn('ME', 7, 8, { type: 'elder_m', name: 'M. Elder', dir: DIR.UP }); E.spawn('AM', 8, 8, { type: 'noble', name: 'A. Mayor', dir: DIR.UP });
    yield E.say('But where does that leave us? Are we simply to accept your looting here on Indra?', 'M. Mayor');
    yield E.say("I'm shocked, I tell you. Shocked!", 'A. Mayor'); yield E.say("What's so shocking?", 'M. Elder');
    yield E.say('It looks like they really are pirates, just like you said...', 'A. Mayor');
    yield E.say('Mister Mayor, I am appalled that you could not take our word for it!', 'M. Mayor');
    yield E.say('Am I supposed to believe the accusations of a complete stranger?', 'A. Mayor');
    yield E.say('How can I be expected to believe a tidal wave could wash Indra into Osenia? Or that a group of men could walk--on foot!--from Madra all the way to Alhafra?', 'A. Mayor');
    yield E.say('It sounds to me like you had forgotten about us altogether!', 'M. Elder');
    yield E.say("I'm not sure you remember the last time we met. Do you?", 'A. Mayor');
    yield E.say('We met when I was just a child... It must have been more than ten years ago now...', 'M. Mayor');
    yield E.say("Twenty years! It's been twenty years since I last saw you.", 'A. Mayor'); yield E.say('Has it really been so long?', 'M. Elder');
    yield E.say("Don't be silly! I didn't forget his face! His face merely... changed!", 'A. Mayor');
    yield E.say('Ahem! Forgive my interrupting your interruption, but... Would I be correct in assuming that I am speaking to the leaders of Madra and Alhafra?', 'Kraden');
    yield E.say('You are correct! I am the mayor of Madra.', 'M. Mayor'); yield E.say('I am the mayor of Alhafra.', 'A. Mayor'); yield E.say("I am Madra's town elder.", 'M. Elder');
    yield E.say('I am the scholar Kraden. He is Felix, the leader of our group.', 'Kraden'); yield E.say("I am Jenna, Felix's sister.", 'Jenna'); yield E.say('I am called Sheba. I come from the town of Lalivero.', 'Sheba');
    yield E.say('Now, what errand has brought you all here?', 'Kraden');
    yield E.say('We followed Briggs here from Madra. Of course, we have good reason to suspect them of being pirates.', 'M. Mayor');
    yield E.say('Ahem! And I was honestly taken aback to hear a businessman being slandered! If they truly are pirates, then why would they go to the trouble of buying a ship from us?', 'A. Mayor');
    yield E.say('Because the very funds they used to purchase the ship were pillaged from our homes!', 'M. Elder');
    yield E.say('If the ship was bought with Madran gold, then it belongs to the Madrans! What do you say? If we give them the ship, will that fix everything?', 'Briggs');
    yield E.say('Then where will you go?', 'M. Mayor'); yield E.say("I won't run, and I won't hide. ...Actually, I don't feel up for much of anything right now.", 'Briggs');
    yield E.say("Then you probably won't mind being locked up, will you?", 'M. Elder'); yield E.say('Briggs...', 'Chaucha');
    yield E.say("Don't worry, Chaucha! I'll be back! Take care of Eoleo!", 'Briggs');
    yield E.say('Your strange powers surprised me, but even without them, you would have overwhelmed us.', 'Briggs');
    yield E.say("We'll be taking that boat, then.", 'M. Mayor'); yield E.say("You're taking our ship!? You're worse than we ever were!", 'Pirate'); yield E.say('Quiet! All of you!', 'Briggs');
    yield E.say("Do as you must, but I have one request... You have to let Chaucha and Eoleo stay in the boat until it's repaired.", 'Briggs');
    yield E.say("You haven't done Alhafra any harm, Briggs...", 'A. Mayor'); yield E.say('At least keep him locked up until the boat is repaired...', 'M. Elder');
    yield E.say("And our prisoner, Piers... Is he one of your men?", 'M. Elder');
    yield E.say("I don't know any Piers! Sounds to me like you've made a pretty big mistake!", 'Briggs');
    yield E.say("See! It's just as I said! Piers is innocent! We must send word to Madra and free him immediately!", 'M. Elder');
    yield E.say("It looks like that wraps this whole mess up... Let us return to my mansion for a nice cup of tea...", 'A. Mayor');
    yield E.say('You say your name is Kraden? Thank you very much for the help with Briggs. If you have time, please come see me at my mansion before you go... I would like to thank you for everything you\'ve done.', 'A. Mayor');
    yield E.say('Thank all of you very much. Due to your efforts, Piers is going to be released. And now, this fine ship belongs to Madra. None of this would have come to pass were it not for you.', 'M. Mayor');
    yield E.say("Oh, pish posh! We don't need any reward, do we, Felix?", 'Kraden');
    const y3 = yield* E.ask('', 'Kraden', ['Yes', 'No']); yield E.say(y3 === 0 ? 'Ha! Your honesty is refreshing, Felix!' : "That's as may be, but I still feel quite indebted to you.", 'M. Mayor');
    yield E.say("So, what shall I do? I know... Come to Madra after our boat has been fixed and we've sailed home. We do want to give you some kind of reward. Well, shall we be going?", 'M. Mayor');
    yield Engine.fadeOut(30); for (const id of ['MM', 'ME', 'AM', 'Chaucha']) E.despawn(id); G.set('briggs_caught'); G.field.refreshNpcs(); yield Engine.fadeIn(30);
    yield E.say('(The guards lead Briggs and his men up and away toward the town. Chaucha stays aboard, with Eoleo.)');
    yield E.say('I feel kind of bad for Chaucha.', 'Sheba'); yield E.say("What can we do about it? After all, she's the one married to a pirate.", 'Jenna');
    yield E.say('So, what should we do now? I suggest that we try to find Piers. He could prove enlightening!', 'Kraden');
    yield E.say("That's true... He seems to be a Water Adept. He might be able to tell us a little about these lands...", 'Sheba');
    yield E.say('Do you think we should help them fix the boat?', 'Jenna');
    yield E.say("Say, if we help with the boat, maybe they'll give us a ride back to Madra! Good idea!", 'Kraden');
    const y4 = yield* E.ask('What do you say, Felix?', 'Sheba', ['Yes', 'No']);
    yield E.say(y4 === 0 ? "All right! Let's go see what we can do to get this thing sailing again!" : "You're opposed to it? Well, since you seem to have your own ideas, let's get going!", 'Jenna');
  };
  // ---- the jail under the town ----
  defineMap('alhafra_jail', {
    name: 'Alhafran Cave - Jail', w: 16, h: 12, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 7, y: 10 }, retreat: { map: 'alhafra', x: 12, y: 34, dir: DIR.DOWN },
    build(M) {
      M.cave(0, 0, 16, 12, 'floor_stone', 'wall_in_stone', 'wall_in_stone_top'); M.open(7, 11); M.fill(7, 11, 1, 1, 'floor_stone'); M.walkable(7, 11); M.exit(7, 11, 1, 1, 'alhafra', 12, 34, DIR.DOWN, { door: true });
      // the cell across the back: bars, the bed, the jar
      for (let x = 1; x < 15; x++) { if (G.flag('briggs_escaped') && x === 7) { M.setObj(x, 5, null); M.walkable(x, 5); continue; } M.setObj(x, 5, 'bars'); M.block(x, 5); }   // the bars, with the gap Briggs' men made M.setObj(12, 2, 'bed'); M.setObj(12, 3, 'bed_foot'); M.setObj(2, 2, 'torch'); M.light(2, 2, 3); M.setObj(13, 7, 'torch'); M.light(13, 7, 3);
      if (G.flag('briggs_escaped')) M.container(1, 3, 'pot', 'Power Bread'); else M.setObj(1, 3, 'pot');
      // the stair up into the caves beyond, open once Briggs has gone that way himself
      M.setObj(14, 2, 'stairs_up'); M.walkable(14, 2); M.exit(14, 2, 1, 1, 'alhafra_cave', 3, 30, DIR.UP, { stairs: true, cond: () => G.flag('briggs_escaped') });
      M.trigger(6, 10, 4, 1, T3.jailVisit, { once: 'alhafra_jail_scene', cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped') });
      M.npc('aj_guard', 4, 8, { type: 'guard', name: 'Guard', dir: DIR.RIGHT, text: () => G.flag('briggs_escaped') ? "They dug out in the night. Through the back, into the caves. I'll be scrubbing floors till I die." : G.flag('briggs_caught') ? "You here to see Briggs? Don't feed him anything. He's had his gruel." : "Everything's so boring here... Why doesn't anybody do anything... criminal?", mind: () => G.flag('briggs_caught') ? 'A pirate captain in my cells! Finally something to tell the wife.' : "I don't know why there are so many outsiders in Alhafra now, but it's bound to mean trouble." });
      M.npc('BriggsCell', 7, 3, { type: 'pirate', name: 'Briggs', dir: DIR.DOWN, cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped'), text: "Even pirates have honor. I said I'd go quietly, and here I am. ...The gruel's a crime, though.", mind: "The boy's hands were hot. Chaucha saw it too. He's like the strangers - he has the power. Eoleo... my son. If we could get out of here, the ship..." });
      M.npc('aj_pirate1', 4, 3, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped'), text: "I'm fine. My only complaint is that the food here is terrible." });
      M.npc('aj_pirate2', 10, 3, { type: 'pirate', name: 'Pirate', dir: DIR.DOWN, cond: () => G.flag('briggs_caught') && !G.flag('briggs_escaped'), text: "Chaucha brought the boy to see the captain. Little Eoleo. He waved his fist at the bars and I swear the torch jumped." });
    }
  });
  // Chaucha and Eoleo at the bars
  T3.jailVisit = function* (E) {
    E.spawn('jv_chaucha', 7, 6, { type: 'villager_f', name: 'Chaucha', dir: DIR.UP }); E.spawn('jv_eoleo', 8, 6, { type: 'child_m', name: 'Eoleo', dir: DIR.UP });
    yield E.say('You here to see Briggs?', 'Guard');
    yield E.say("Chaucha... It's good to see you. And you, too, Eoleo.", 'Briggs'); yield E.say('Goo. Goo goo ga.', 'Eoleo');
    yield E.say('How... is your cell? Is there anything I can do to make this easier on you?', 'Chaucha');
    yield E.say("I'm fine, Chaucha. My only complaint is that the food here is terrible.", 'Pirate');
    yield E.say('What!? Are they forcing you to eat this disgusting gruel?', 'Chaucha');
    yield E.say("Now, wait a second... First of all, it's not disgusting. It's nutritious! And besides... You're IN JAIL! What did you expect, gourmet cuisine?", 'Guard');
    yield E.say('Goo... GA!', 'Eoleo'); Engine.doFlash(8, '#ffc080'); Audio.sfx('psy');
    yield E.say('(The torch by the bars flares up, all at once, and dies back.)');
    yield E.say('...Eoleo? Did you-', 'Chaucha'); yield E.say("He's a spirited boy. Come, Chaucha. Take him back to the ship.", 'Briggs');
    yield E.move('jv_chaucha', DIR.DOWN, 3); yield E.move('jv_eoleo', DIR.DOWN, 3); E.despawn('jv_chaucha'); E.despawn('jv_eoleo'); G.field.refreshNpcs();
    yield E.say("Did you see that? The child. That was Psynergy, Felix - I am sure of it.", 'Kraden');
    yield E.say("A Mars Adept, at that age? Then Briggs' people... Read his mind, Sheba, if you can. I want to know what he knows.", 'Jenna');
  };
}
