// ---------- The Lost Age story events ----------
'use strict';
const STORY_TLA = {};
const ST = STORY_TLA;
// ============ PROLOGUE: the fall of Venus Lighthouse, seen from the other side ============
// Jenna, Kraden and Alex are still on the aerie when the tower starts to come down. The way out is played, not
// told: down from the aerie, through the lighthouse, out onto the neck of Idejima - which the beacon's power then
// tears from the continent. The escape sets 'venus_escape'; the lighthouse maps read it to hold their doors open
// and keep their monsters away, and the field shakes the ground now and then while it is set.
ST.begin = function* (E) {
  // The Lost Age opens in the Venus Lighthouse's lower hall, before the beacon is lit, with Jenna in the player's
  // hands: Felix goes up to the aerie, Alex meets them below, and the three agree to wait for Felix at Idejima
  G.set('venus_escape'); G.set('prologue_jenna');
  const P = G.party; const jenna = P.get('Jenna'); P.active = [jenna]; P.reserve = P.members.filter(m => m !== jenna);
  E.warpNow('venus_lh_1', 12, 5, DIR.UP); E.setFollowers(false); Audio.play('lighthouse');
  E.spawn('FelixP', 12, 3, { look: CHARACTERS.Felix.look, name: 'Felix', dir: DIR.DOWN }); E.spawn('KradenP', 13, 6, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.UP });
  yield Engine.fadeIn(30);
  yield E.say("Jenna. Kraden. This is as far as you come.", 'Felix');
  yield E.say("Felix, no - I'm coming up with you. Saturos and Menardi are up there, and if Isaac follows -", 'Jenna');
  yield E.say("If Isaac follows, I would rather you were not between us. Go down. Wait for me at Idejima, the point south-west of the gate. I will come when the beacon is lit.", 'Felix');
  yield E.say("And if it is not lit?", 'Kraden');
  yield E.say("It will be.", 'Felix');
  yield E.walkTo('FelixP', 12, 1, 2); E.despawn('FelixP');
  yield E.say("(Felix climbs toward the aerie without looking back.)");
  yield E.say("He has made up his mind, girl, and I have known him longer than you think. Come. Alex said he would find us below.", 'Kraden');
  Engine.doFlash(8, '#a0e0ff'); E.spawn('AlexP', 11, 8, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.UP });
  yield E.say("And so I have. Felix has gone up? Then it is nearly done. Saturos and Menardi will light the beacon within the hour, and this tower is no place to be when they do.", 'Alex');
  yield E.say("You say that as if you knew what a lit beacon does to a tower.", 'Kraden');
  yield E.say("I know what it does to the land under one. Idejima, Kraden. The peninsula beyond Suhalla Gate. Wait there. Felix will find you - and so will I.", 'Alex');
  yield E.say("You're not coming with us?", 'Jenna');
  yield E.say("I have other business. Babi's soldiers are all over the road; I would not want them to trouble you.", 'Alex');
  Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexP');
  yield E.say("(Alex is simply gone.)");
  yield E.say("I do not like that man. I have never liked that man. ...Well, Jenna. The great doors are at the bottom of the hall. Lead on; my knees will follow.", 'Kraden');
  yield E.say('(You have Jenna now. The way out of the Lighthouse is down the hall, past the sealed doors by the side passages, and out through the great doors. Kraden keeps up as best he can.)');
  E.despawn('KradenP');
};
// out through the doors: Babi's soldiers, and Alex again
ST.escapeOut = function* (E) {
  yield Engine.fadeOut(20);
  E.warpNow('venus_forest', 23, 6, DIR.DOWN); yield Engine.fadeIn(20);
  E.spawn('KradenP', 22, 5, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.DOWN });
  E.spawn('SoldierA', 22, 9, { type: 'guard', name: 'Soldier', dir: DIR.UP }); E.spawn('SoldierB', 23, 9, { type: 'guard', name: 'Soldier', dir: DIR.UP }); E.spawn('SoldierC', 24, 9, { type: 'guard', name: 'Soldier', dir: DIR.UP });
  yield E.say("There! Two of them, coming out of the tower! Lord Babi's orders - nobody leaves the Lighthouse!", 'Soldier');
  yield E.say("Stand back. I am Kraden of Vale, a scholar, and this girl is -", 'Kraden');
  yield E.say("- coming with us. Take them!", 'Soldier');
  Engine.doFlash(8, '#a0e0ff'); E.spawn('AlexP', 23, 8, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN });
  yield E.say("I think not.", 'Alex');
  Audio.sfx('psy'); Engine.doFlash(14, '#c0f0ff'); yield E.shake(10);
  yield E.say("(A wall of water sweeps across the plaza. The soldiers are swept off their feet and out of sight.)");
  E.despawn('SoldierA'); E.despawn('SoldierB'); E.despawn('SoldierC');
  yield E.say("There will be more of them on the road to the gate. I will see to those. Go west - Suhalla Gate, and beyond it the crevice down to the Gateway Cave. The cave comes out on Idejima.", 'Alex');
  yield E.say("You could simply come with us.", 'Kraden');
  yield E.say("I could.", 'Alex'); Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexP');
  yield E.say("(Alex is gone again.)"); E.despawn('KradenP');
  G.set('prologue_out');
  yield E.say('(West through the wood to the road, then west again to Suhalla Gate. Kraden follows.)');
};
// the Ruffians on the road: Babi's soldiers have a rougher sort with them
ST.ruffian = function* (E, trig) {
  const n = (trig && trig.data) || 1;
  yield E.say(n >= 3 ? "Three of them, out of the rocks by the crevice!" : "A Ruffian! One of Babi's hired men, by the look of him.", 'Kraden');
  const r = yield* E.battle(n >= 3 ? ['Ruffian', 'Ruffian', 'Ruffian'] : ['Ruffian'], { canFlee: false });
  if (r !== 'win') return;
  yield E.say(n >= 3 ? "The crevice is clear. Down we go - mind the loose stones." : "Well struck, girl. On - the gate is not far.", 'Kraden');
};
// the Psynergy Stone in Gateway Cave, and the ant that guards it
ST.gatewayAnt = function* (E) {
  yield E.say("A Psynergy Stone! Touch it, Jenna, and your Psynergy will be whole again - ", 'Kraden');
  const r = yield* E.ambush(['Punch Ant'], { canFlee: false }, { say: "(Something scuttles out from behind the stone!)" });
  if (r !== 'win') return;
  yield E.say("An ant. In a cave. Guarding a stone. The world is a very strange place, Jenna, and I have spent my life writing down why.", 'Kraden');
  yield E.say("The cave goes on north. Idejima should be at the end of it.", 'Jenna');
};
// Idejima: the beacon lights, and the peninsula tears away
ST.idejimaArrive = function* (E) {
  yield E.say("(The cave opens on a windy point of land. The sea on three sides, and the Venus Lighthouse standing over it all to the north.)");
  E.spawn('KradenP', 11, 4, { look: NPC_LOOKS.Kraden, name: 'Kraden', dir: DIR.DOWN }); Engine.doFlash(8, '#a0e0ff'); E.spawn('AlexP', 13, 4, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN });
  yield E.say("You made good time. Watch the tower.", 'Alex');
  yield E.walkTo('AlexP', 13, 8, 2); yield E.walkTo('KradenP', 11, 8, 2); yield E.walkTo('player', 12, 8, 2);
  E.face('player', DIR.UP); E.face('KradenP', DIR.UP); E.face('AlexP', DIR.UP);
  yield E.pan(12, 3); yield 30; Engine.doFlash(30, '#ffe080'); Audio.sfx('quake'); yield E.shake(40);
  yield E.say("(A column of golden light climbs from the Venus Lighthouse into the sky. The beacon is lit.)");
  yield E.say("Felix... he did it.", 'Jenna');
  yield E.say("(The light does not fade. It grows - and the ground begins to shake.)");
  const foot = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 26; x++) foot.push([x, y]);
  yield* E.crack(foot.sort(() => Math.random() - 0.5), 6, 'water');
  yield E.panBack();
  yield E.say("The ground... Kraden, the ground is moving!", 'Jenna');
  yield E.say("It is more than the tower. The Venus beacon has poured its power into the earth, and the earth is answering. Idejima is tearing away from Gondowan!", 'Alex');
  const M = G.map, neck = [];
  for (let y = 3; y <= 5; y++) for (let x = 0; x < 26; x++) if (!M.get(x, y).water) neck.push([x, y]);
  neck.sort((p, q) => (p[0] + (p[1] === 4 ? 0 : 9)) - (q[0] + (q[1] === 4 ? 0 : 9)));
  yield* E.crack(neck, 2, 'water');
  yield E.shake(30);
  yield E.say("(The peninsula shears away from the continent. Slowly, then not slowly at all, the sea opens between them.)");
  yield E.say("We are adrift.", 'Alex');
  yield E.say("Then we are alive, which is more than I expected an hour ago. Sit down, both of you. There is nothing to do now but wait for the sea to decide.", 'Kraden');
  G.set('idejima_broken'); G.flags.venus_escape = false; G.flags.prologue_jenna = false;
  yield Engine.fadeOut(60);
  E.despawn('KradenP'); E.despawn('AlexP');
  E.warpNow('idejima', 12, 8, DIR.DOWN); yield 2;
  yield* ST.prologue(E);
};
// ============ PROLOGUE: Idejima adrift ============
ST.prologue = function* (E) {
  E.setFollowers(false); Audio.play('sad');
  E.spawn('KradenP', 14, 8, { look: NPC_LOOKS.Kraden, name: 'Kraden' }); E.spawn('AlexP', 10, 7, { look: NPC_LOOKS.Alex, name: 'Alex' });
  E.spawn('FelixW', 12, 14, { look: CHARACTERS.Felix.look, name: 'Felix', dir: DIR.DOWN }); E.spawn('ShebaW', 13, 14, { look: CHARACTERS.Sheba.look, name: 'Sheba', dir: DIR.DOWN });
  yield Engine.fadeIn(40);
  yield E.say("(Torn loose by the Lighthouse's fall, the island of Idejima drifts out onto the open sea. Days pass...)");
  yield E.say("Ugh... How long have we been drifting? Kraden, the water - is there anything at all?", 'Jenna');
  yield E.say("Sea, sea and more sea. Four days now, by my count, and the current has carried us east the whole time.", 'Kraden');
  yield E.say("Jenna. On the south shore. Look.", 'Alex');
  yield E.pan(12, 13); yield 20;
  yield E.say("(Two figures lie on the sand at the water's edge, half in the surf...)");
  yield E.panBack();
  yield E.walkTo('player', 12, 12, 2); E.face('player', DIR.DOWN);
  yield E.say("Felix! Sheba! You're both alive... I saw you fall from the aerie!", 'Jenna');
  E.face('FelixW', DIR.UP); yield E.say("The sea caught us. I held on to Sheba the whole way down... and then I held on to a piece of the lighthouse.", 'Felix');
  E.face('ShebaW', DIR.UP); yield E.say("You saved my life, Felix. Whatever happens now, I'm with you.", 'Sheba');
  E.despawn('FelixW'); E.despawn('ShebaW');
  // Felix takes the lead of the party from here
  const P = G.party, felix = P.get('Felix'), jenna = P.get('Jenna'), sheba = P.get('Sheba');
  P.members = [felix, jenna, sheba]; P.active = [felix, jenna, sheba]; P.reserve = [];
  E.field.rebuildFollowers(); E.setFollowers(true); E.gather(); Audio.sfx('join');
  yield E.say('Felix and Sheba rejoined the party!');
  yield E.walkTo('AlexP', 11, 10, 2); yield E.walkTo('KradenP', 14, 10, 2);
  yield E.say("Touching. But we have work to do. Two beacons remain: Jupiter and Mars. Felix, you carry the Jupiter Star. And Isaac still holds the Mars Star.", 'Alex');
  yield E.say("Saturos and Menardi are dead, Alex. Why should we go on?", 'Jenna');
  yield E.say("Because Prox is dying, Jenna. The edge of the world eats the north a little more each year. Only Alchemy's return can stop it. That is why Saturos began this.", 'Felix');
  yield E.say("Felix speaks truly. I will go ahead and... prepare the way. We shall meet again at the Jupiter Lighthouse.", 'Alex');
  Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexP');
  yield E.say("He's gone. Just like that. I never trusted him.", 'Jenna');
  // the wave
  yield E.say("...Do you hear that? The sea has gone quiet.", 'Sheba');
  yield E.pan(12, 2); yield 30;
  yield E.say("(To the north the water is drawing back from the island, further and further, until a dark line rises along the whole horizon...)");
  yield E.panBack();
  yield E.say("Gods above. A wave! RUN! Get to the high ground!", 'Kraden');
  yield E.walkTo('KradenP', 13, 13, 2);
  yield E.walkTo('player', 12, 13, 2); E.face('player', DIR.UP); E.face('KradenP', DIR.UP);
  yield* E.wave(120);
  G.set('idejima_landed'); G.set('tla_started');
  E.despawn('KradenP');
  E.warpNow('idejima', 12, 10, DIR.DOWN); E.field.rebuildFollowers(); E.gather(); yield 2;
  E.spawn('KradenP', 14, 8, { look: NPC_LOOKS.Kraden, name: 'Kraden' });
  Audio.play('sad'); Engine.fadeCol = '#ffffff'; yield Engine.fadeIn(60); Engine.fadeCol = '#000000';
  yield E.say("(The wave lifts the island like a leaf and hurls it across the Eastern Sea...)");
  yield E.say("Ugh... Is everyone... Where are we?", 'Jenna');
  yield E.say("Alive, all of us. And look - the island has struck land! A shore, and a road. Unless I am very much mistaken, we have reached the continent of Indra.", 'Kraden');
  yield E.say("Then we had better move. The three of you cannot hold a road between you.", 'Kraden');
  yield E.say("The three of us? Kraden, you have never so much as carried a pack.", 'Jenna');
  yield E.say("I have crossed Gondowan twice, girl, and Angara before you were born. I have read every word written on Alchemy and watched two Lighthouses light. I am old, I am slow, and I could not stand a minute against Saturos - but I am not helpless, and I am not staying behind.", 'Kraden');
  yield E.say("(Kraden takes up a staff. He is far older than any of you, and it shows in more ways than one.)");
  Audio.sfx('levelup'); Engine.doFlash(12, '#ffe080');
  // Thirty years in the field before he ever met a single one of them: he starts far above the others and climbs
  // very slowly from there, so the three of them have overtaken him long before the end.
  yield E.join('Kraden', 20);   // two years a prisoner, hauled to Mercury and Venus: he has seen things since Sol Sanctum
  E.despawn('KradenP');
  yield E.say("Let's go. There should be a village nearby.", 'Felix');
  yield E.say('(Tip: Felix knows Move and Retreat. Press C to use field Psynergy. Jenna casts fire; Sheba can Mind Read; Kraden knows a little of everything.)');
};
// Alex is waiting at the mayor's house once Felix has been to the shrine: he has been looking for a ship
ST.dailaAlex = function* (E) {
  E.spawn('AlexD', 29, 14, { look: NPC_LOOKS.Alex, name: 'Alex', dir: DIR.DOWN });
  yield E.say("Felix... Well, well... Our happy little family is back together again.", 'Alex');
  yield E.say("Alex... Where did you go?", 'Jenna');
  yield E.say("To look for a ship, of course.", 'Alex');
  yield E.say("That's what Kraden said...", 'Sheba');
  yield E.say("And did you find one?", 'Kraden');
  yield E.say("Unfortunately, there are none to be had. I spoke to the mayor, and he suggested that we try the large town south of us.", 'Alex');
  yield E.say("Is that where you're going?", 'Kraden');
  yield E.say("Yes. Madra may have boats available. That would be the most logical move.", 'Alex');
  const r = yield* E.ask("So what do you think? Should we go to Madra with Alex?", 'Jenna', ['Yes', 'No']);
  if (r === 0) { yield E.say("Ah... You... want to travel with me?", 'Alex'); yield E.say("What, you don't like that idea?", 'Jenna'); }
  else { yield E.say("Ah. Felix doesn't think it's a good idea.", 'Alex'); yield E.say("You seem awfully pleased about that...", 'Jenna'); }
  yield E.say("No, that's not it. I'm just... preoccupied.", 'Alex');
  yield E.say("Self-absorbed is more like it!", 'Sheba');
  yield E.say("I simply prefer to work alone.", 'Alex');
  yield E.say("If that's the case, we'll let you be...", 'Kraden');
  yield E.say("Perhaps you will see me in Madra...", 'Alex');
  Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexD');
  yield E.say("Gah! The nerve of that guy!", 'Jenna');
  yield E.say("Yeah, I know... Now, I just want to find a boat before he does!", 'Sheba');
  yield E.say("Let's be on our way.", 'Kraden');
};
ST.dailaArrive = function* (E) { yield E.say("A village! Daila, according to the sign. Let's rest and find out where we are.", 'Jenna'); Audio.play('town'); };
ST.echoJoins = function* (E) { yield E.say("Hm? Something is following us... A Djinni!", 'Sheba'); yield* E.djinn('Echo'); yield E.say("Djinn draw power from the four elements. Set them to a character to change their class - or unleash them in battle and summon!", 'Kraden'); };
// ============ KANDOREAN / SEA GOD / DEHKAN ============
ST.kandoreanMaster = function* (E) {
  if (G.flag('lash_got')) { yield E.say("Bind your spirit as you bind the rope. Go in peace.", 'Master Poi'); return; }
  yield E.say("Travelers... You seek the way south? Then you will need the art of Lash. Take this Pebble - it will bind ropes to your will.", 'Master Poi');
  yield E.give('Lash Pebble'); G.set('lash_got');
  yield E.say("Equip the Lash Pebble to use Lash on coiled ropes. The cave below this temple holds a Djinni that tests the worthy.", 'Master Poi');
};
ST.chestbeater = function* (E) { yield E.say("A huge ape blocks the way, beating its chest!"); const r = yield* E.battle(['Chestbeater'], { boss: true, canFlee: false }); if (r !== 'win') return; yield E.say('The Chestbeater flees into the dark!'); };
ST.seaGodTear = function* (E) {
  if (G.flag('sea_god_tear')) { yield E.say('The altar is quiet.'); return; }
  if (!G.flag('piers_joined')) { yield E.say("An altar to the Sea God. A dry basin sits before it. 'Only the tear of the sea shall wake me.'"); return; }
  yield E.say("Piers pours a Lemurian tear into the basin... The Sea God's statue weeps!", 'Piers'); Engine.doFlash(10, '#a0e0ff'); Audio.sfx('water');
  G.set('sea_god_tear'); yield E.give("Sea God's Tear");
};
ST.cannonDjinni = function* (E) { yield E.say("A Mars Djinni! It leaps away and pounds a pillar into the ground with a strange cube!", 'Jenna'); yield E.say("It dropped something down the hole... Follow it!", 'Sheba'); };
// the bottom of the pit: the King Scorpion, and the Scoop Gem it was sitting on
ST.kingScorpion = function* (E) {
  yield E.say('The party lands in a bowl of soft sand. The walls are sheer. And the sand in the middle is moving...');
  const r = yield* E.ambush(['King Scorpion'], { boss: true, canFlee: false, music: 'boss' }, { say: "The sand shifts... A King Scorpion rises!", scale: 1.3 }); if (r !== 'win') return;
  yield E.say('The King Scorpion sinks into the sand and does not rise again.');
  yield E.say('Something glints where it lay - a gem, cut like a scoop.'); yield E.give('Scoop Gem');
  yield E.say("The Scoop Gem. Equip it and we can dig - and this sand is soft enough to dig our way out of.", 'Sheba');
};
// ============ MADRA ============
// madraGate, madraGateKibombo, madraJail, madraJailExit, madraBridge, piersJail: js/maps/madra.js
ST.madraFungus = function* (E) {
  if (G.flag('char_given')) { yield E.say("My grandson is well again, thanks to you.", 'Old Man'); return; }
  if (G.inventory.has('Healing Fungus')) { const r = yield* E.ask("A Healing Fungus! Would you give it to my sick grandson?", 'Old Man'); if (r !== 0) return; G.inventory.remove('Healing Fungus'); yield E.say("Bless you! Take my pet Djinni in return - it deserves a life of adventure.", 'Old Man'); G.set('char_given'); yield* E.djinn('Char'); return; }
  yield E.say("My grandson is ill. Only a Healing Fungus from the Gondowan Cliffs can cure him... but the path there is flooded.", 'Old Man');
};
// ============ ALHAFRA ============
ST.alhafraMayor = function* (E) {
  if (G.flag('briggs_escaped')) { yield E.say("Briggs escaped in the night! He took the ship we had just repaired! Curse those Champa!", 'Mayor of Alhafra'); return; }
  if (G.flag('briggs_caught')) { yield E.say("Briggs is locked up. But the ship in the harbor - its mast was crushed by a boulder in the wave. If only it could be fixed...", 'Mayor of Alhafra'); return; }
  yield E.say("Thank you very much for the help with Briggs. It's nothing special, but... take this, with Alhafra's thanks.", 'Mayor of Alhafra'); if (!G.flag('alhafra_thanks')) { G.set('alhafra_thanks'); yield E.coins(300); }
  yield E.say("As for the ship - I sold it in good faith, and now it belongs to Madra. If you could get that rock off its mast, everyone would be grateful. But I don't see how anyone could.", 'Mayor of Alhafra');
};
// briggsCabin (the fight below deck), jailVisit: js/maps/alhafra_east.js
// alhafraShip / alhafraMorning / alhafraTirade: js/maps/alhafra_east.js
// ============ GAROH / AIR'S ROCK ============
// garohNightfall/garohWerewolf/garohMahaPeek/garohCrevice/garohCaveChase/garohMahaMeet/maha: js/maps/garoh.js
// ============ KIBOMBO / GABOMBA ============
// ============ YALLAM / AQUA ROCK / GAIA ROCK ============
ST.sunshine = function* (E) {
  // something on the anvil? that comes first
  const order = G.get('forge_order');
  if (order) {
    if (!G.flag('forge_ready')) { yield E.say("It is on the anvil. Go and do something with your day - it will be here when you get back.", 'Sunshine'); return; }
    G.set('forge_order', null); G.set('forge_ready', false); G.set('forge_from', null);
    yield E.say("There you are. Look at it. I have outdone myself again.", 'Sunshine');
    yield E.give(order);
    return;
  }
  if (!Forge.held().length) {
    yield E.say("Bah. I am Sunshine, the greatest smith alive, and I have nothing worth forging. Bring me rare stuff - star dust, dragon skin, orihalcon - and I will make you something legendary.", 'Sunshine');
    yield E.say("Rusty old weapons too. People throw away better steel than they know.", 'Sunshine');
    return;
  }
  yield E.say("Let me see what you are carrying, then.", 'Sunshine');
  const sc = new ForgeScene(); Engine.push(sc); yield () => sc.closed;
};
// ST.aquaRockParch: js/maps/aqua_rock.js
// Gaia Rock and Izumo scenes (susa, serpent, gaiaSand, uzume, izumoAfter...): js/maps/gaia_rock.js and js/maps/izumo.js
// ============ CHAMPA / TRIDENT / SEA OF TIME ============
// briggsChampa/obaba/obabaForge/champaSpotted/champaAlex: js/maps/champa.js
// poseidon, seaCurrent, seaWaves, seaOfTimeEnter: js/maps/sea_of_time.js

// lemuriaGuards/hydros/lunpaLemuria/piersUncle/piersAge: js/maps/lemuria.js

// ============ SHAMAN VILLAGE / TRIAL ROAD ============
ST.moapa = function* (E) { Audio.play('boss'); E.spawn('MoapaT', 12, 3, { look: NPC_LOOKS.Moapa, name: 'Moapa' }); yield E.say("You have climbed the Trial Road. I am Moapa, champion of Shaman Village. Prove yourselves against my knights and me!", 'Moapa'); const r = yield* E.battle(['Moapa', 'Knight', 'Knight'], { boss: true, canFlee: false, music: 'boss', weaken: { hp: 0.7, atk: 0.85 } }); if (r !== 'win') return; yield E.say("Well fought! Never have outsiders bested me. Shaman Village is open to you. Speak with the chief.", 'Moapa'); E.despawn('MoapaT'); G.set('trial_road_won'); Audio.play('overworld2'); };
ST.shamanChief = function* (E) {
  if (G.flag('hover_got')) { yield E.say("The Hover Jade is yours. Use it on the marked panels to float.", 'Chief'); return; }
  if (!G.flag('trial_road_won')) { yield E.say("Outsiders. You must conquer the Trial Road before I will speak with you.", 'Chief'); return; }
  yield E.say("You bested Moapa. Then you are worthy of our clan's treasure: the Hover Jade, handed down from Anemos itself.", 'Chief');
  yield E.give('Hover Jade'); G.set('hover_got');
  yield E.say("Equip it, and use Hover on the marked panels to float across gaps. The Jupiter Lighthouse in Atteka cannot be climbed without it.", 'Chief');
  yield E.say("And take this as well - the tablet of Coatlicue, kept by our shamans for the ones who would walk the Trial Road.", 'Chief'); yield E.summon('Coatlicue');
  if (G.inventory.has("Shaman's Rod") || G.isaacParty) { yield E.say("...That rod. The Shaman's Rod! It was Hama's. She left our village years ago with a great merchant. Take this - she will know what it means.", 'Chief'); }
};
// ============ JUPITER LIGHTHOUSE ============
ST.jupiterEnter = function* (E) { yield E.say("The Jupiter Lighthouse. This is where Alex said he'd meet us. And Isaac's party... they'll be close behind.", 'Felix'); yield E.say("Karst and Agatio came from Prox to finish what Saturos started. They won't be friendly to Isaac.", 'Jenna'); };
ST.jupiterAerie = function* (E) {
  Audio.play('villain');
  E.spawn('KarstJ', 10, 12, { look: NPC_LOOKS.Karst, name: 'Karst' }); E.spawn('AgatioJ', 15, 12, { look: NPC_LOOKS.Agatio, name: 'Agatio' }); E.spawn('AlexJ', 13, 11, { look: NPC_LOOKS.Alex, name: 'Alex' });
  yield E.say("Felix. You took your time.", 'Karst');
  yield E.say("Karst... Agatio. You made it from Prox.", 'Felix');
  yield E.say("My sister Menardi died at the hands of Isaac's party. I will have my revenge before this is over.", 'Karst');
  yield E.say("Enough. Felix, the Jupiter Star. Light the beacon.", 'Alex');
  yield E.pan(12, 9); yield E.say("(Felix casts the Jupiter Star into the beacon!)"); Engine.doFlash(20, '#c070f0'); Audio.sfx('beacon'); yield E.shake(30);
  G.set('jupiter_lit'); G.map.beacon(12, 7, 'jupiter', true); G.map.finalize(); yield E.say('(A pillar of violet light erupts from the Jupiter Lighthouse!)'); yield E.panBack();
  E.spawn('IsaacJ', 12, 18, { look: CHARACTERS.Isaac.look, name: 'Isaac' }); E.spawn('GaretJ', 11, 19, { look: CHARACTERS.Garet.look, name: 'Garet' }); E.spawn('IvanJ', 13, 19, { look: CHARACTERS.Ivan.look, name: 'Ivan' }); E.spawn('MiaJ', 14, 19, { look: CHARACTERS.Mia.look, name: 'Mia' });
  Audio.play('boss');
  yield E.say("Felix! Stop! ...We're too late again.", 'Isaac');
  yield E.say("Isaac! Garet! You're alive!", 'Jenna');
  yield E.say("Isaac of Vale. You killed Menardi. Now you die!", 'Karst');
  yield E.say("Karst, wait! They didn't-", 'Felix');
  yield E.say("Agatio! Take the Mars Star from the boy!", 'Karst');
  yield E.say("(Karst and Agatio attack Isaac's exhausted party! Felix's party leaps to their defense!)");
  const r = yield* E.battle(['Karst', 'Agatio'], { boss: true, canFlee: false, music: 'boss', weaken: { hp: 0.5, atk: 0.75 } });
  if (r !== 'win') return;
  yield E.say("Ugh... Felix, you would side with them?!", 'Karst');
  yield E.say("I side with Weyard, Karst. Go home to Prox. We will light the Mars beacon ourselves.", 'Felix');
  yield E.say("The Mars Star... we'll take it from you at the Mars Lighthouse! Come, Karst.", 'Agatio');
  E.despawn('KarstJ'); E.despawn('AgatioJ');
  yield E.say("It seems your parties have found each other. I will go on ahead... to Mars. Farewell, Felix.", 'Alex'); Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexJ');
  Audio.play('sad');
  yield E.say("Felix... why? Why light the beacons? The Wise One said Alchemy would destroy the world!", 'Isaac');
  yield E.say("The Wise One lied, Isaac. Or told half the truth. Weyard is dying WITHOUT Alchemy. The edges of the world are crumbling into nothing. Prox has watched it for years.", 'Felix');
  yield E.say("King Hydros of Lemuria confirmed it. Alchemy's seal is what's killing the world. The beacons must be lit.", 'Kraden');
  yield E.say("...I need to hear this from someone I trust. Ivan? Mia?", 'Isaac');
  yield E.say("I've read Felix's heart, Isaac. He's telling the truth. He always was.", 'Ivan');
  yield E.say("Then... we've been on the same side all along. We should have talked at the Venus Lighthouse.", 'Isaac');
  yield E.say("Kyle - your father, Isaac - and my parents are alive. They're in Prox. Saturos saved them from the river.", 'Felix');
  yield E.say("My father is... alive? Then let's go to Prox. Together. All of us.", 'Isaac');
  for (const id of ['IsaacJ', 'GaretJ', 'IvanJ', 'MiaJ']) E.despawn(id);
  yield* ST.isaacJoins(E);
  G.set('jupiter_done');
  yield* E.chapter('Chapter 6: Reunion');
};
// ============ ISAAC'S TEST ============
// Before the two parties raise one camp, Isaac wants to see what three years made of Felix's. His crew fights as
// the four stood when the Fusion Dragon fell - their levels, their gear, their Djinn, the Psynergy their classes
// knew - and the bout is only a test: win or lose, the camp goes up afterwards.
// the four as they are from the reunion on: at the level of the strongest Adept the player has (the user's rule -
// and the level they fought at is the level they join at), their GS1 gear, the Djinn of their own element each.
// Built once; the fight and the joining use the same four.
ST.crewCharacters = function (saved) {
  if (ST._crew && ST._crew.key === saved) return ST._crew.chars;
  const lvl = Math.max(...G.party.members.map(m => m.level), 1);
  const pool = []; for (const m of saved.members) for (const d of (m.djinn || [])) pool.push(d.name);
  const chars = saved.members.map(m => { const c = new Character(m.id, lvl); c.equip = Object.assign({}, m.equip || {}); c.held = (m.held || []).slice(); Character.packPsyItems(c); c.classItem = m.classItem || null; c.extraPsy = (m.extraPsy || []).slice(); if (m.summonAuto === false && m.summon) { c.summon = m.summon; c.summonAuto = false; } return c; });
  const own = (c) => pool.filter(n => DJINN[n] && DJINN[n].el === c.el);
  const taken = new Set();
  for (const c of chars) for (const n of own(c)) { if (taken.has(n) || c.djinn.length >= 9) continue; taken.add(n); c.setDjinn(n); }
  for (const n of pool) { if (taken.has(n)) continue; const home = chars.find(c => c.djinn.length < 9); if (!home) break; taken.add(n); home.setDjinn(n); }
  for (const c of chars) { c.validateSummon(G.party); c.fullRestore(); }
  ST._crew = { key: saved, chars };
  return chars;
};
ST.crewAsFoes = function (saved) {
  // the four as Characters: at the level of the strongest Adept the player has (the user's rule), their GS1 gear, and
  // the best build of what they carry - each with the Djinn of their own element (the strongest end-of-Golden-Sun
  // arrangement: the top class of each line and the four great summons), the summons the two journeys have found,
  // and a bag of their own. They fight with the party's own mechanics (ClassExt.rival): Psynergy, Djinn, summons, items.
  const chars = ST.crewCharacters(saved);
  const keys = [];
  for (const c of chars) {
    const bag = new Inventory(); bag.add('Potion', 3); bag.add('Psy Crystal', 2); bag.add('Elixir', 2); bag.add('Water of Life', 1); bag.add('Herb', 3);
    if (typeof ClassExt !== 'undefined' && ClassExt.rival) { keys.push(ClassExt.rival(c.name, c, bag)); continue; }
    const st = c.stats(); const usable = c.psynergy().filter(n => PSY[n] && ['magic', 'epa', 'heal', 'buff', 'status'].includes(PSY[n].type) && !PSY[n].fieldOnly);
    ENEMY_DB[c.name] = { n: c.name, hp: st.hp, pp: st.pp, atk: st.atk, def: st.def, agi: st.agi, lck: st.lck, t: 1, pw: [0, 1, 2, 3].map(e => c.power(e)), rs: [0, 1, 2, 3].map(e => c.resist(e)), ab: ['Attack'].concat(usable.slice(0, 6)), exp: c.level * 35, c: 0, dr: null, g: 'rival', weapon: c.equip.weapon || null, level: c.level };
    Monsters.customLooks[c.name] = c.battleLook(); keys.push(c.name);
  }
  return keys;
};
ST.isaacsTest = function* (E, saved) {
  if (G.flag('isaac_test_done')) return;
  yield E.say("Eight Adepts on one road, then. We will want somewhere to stand still before Prox - a camp, with room to think.", 'Kraden');
  yield E.say("We will. But before we raise a single tent... Felix. Three years. Show me what they made of you.", 'Isaac');
  yield E.say("Isaac, you can't be serious. We just-", 'Jenna');
  yield E.say("Relax, Jenna. It's a test, not a grudge. Nobody's dying today - Mia's here.", 'Garet');
  yield E.say("I would like to see it too. The Lighthouses you lit were not lit by children.", 'Ivan');
  yield E.say("Garet, Ivan, Mia - with me. Everything you've got, Felix. Hold nothing back.", 'Isaac');
  const keys = ST.crewAsFoes(saved);
  const r = yield* E.battle(keys, { boss: true, canFlee: false, canLose: true, music: 'saturosmenardi' });   // the user's pick: the Saturos and Menardi battle theme
  for (const k of keys) { delete ENEMY_DB[k]; delete Monsters.customLooks[k]; }
  G.set('isaac_test_done'); G.set('isaac_test_result', r);
  Audio.play('contigo');
  if (r === 'win') {
    yield E.say("...Good. Better than good. You'd have beaten the four of us at Venus, Felix.", 'Isaac');
    yield E.say("Ow. Somebody tell Jenna she doesn't have to prove anything ELSE.", 'Garet');
    yield E.say("Then it is settled twice over. Together, Isaac.", 'Felix');
  } else {
    yield E.say("Hold still, all of you. Nobody leaves this room bruised.", 'Mia');
    yield E.say("That was closer than it looked, Felix - and you carried three Lighthouses on it. By the time we reach Mars, you'll be past us. We'll see to that.", 'Isaac');
    yield E.say("Next time, Isaac.", 'Felix'); yield E.say("Count on it.", 'Isaac');
  }
  for (const m of G.party.members) m.fullRestore(); Audio.sfx('heal'); Engine.doFlash(8, '#ffd090');
};
ST.isaacJoins = function* (E) {
  const P = G.party;
  let saved = G.isaacParty;
  if (!saved) { // fresh TLA start: build Isaac's party at Lv 28 with default djinn
    const mk = (id, dj, eq) => { const c = new Character(id, 28); for (const d of dj) if (!P.djinnFound.includes(d)) { c.setDjinn(d); P.djinnFound.push(d); } Object.assign(c.equip, eq); return c.serialize(); };
    saved = { members: [mk('Isaac', ['Flint', 'Granite', 'Quartz', 'Vine', 'Sap', 'Ground', 'Bane'], { weapon: 'Gaia Blade', body: 'Spirit Armor', arm: 'Mirrored Shield', head: "Knight's Helm" }), mk('Garet', ['Forge', 'Fever', 'Corona', 'Scorch', 'Ember', 'Flash', 'Torch'], { weapon: 'Giant Axe', body: 'Steel Armor', arm: "Knight's Shield", head: 'Silver Helm' }), mk('Ivan', ['Gust', 'Breeze', 'Zephyr', 'Smog', 'Kite', 'Squall', 'Luff'], { weapon: "Shaman's Rod", body: 'Kimono', head: "Prophet's Hat" }), mk('Mia', ['Fizz', 'Sleet', 'Mist', 'Spritz', 'Hail', 'Tonic', 'Dew'], { weapon: 'Angelic Ankh', body: 'Cocktail Dress', head: 'Mythril Circlet' })] };
  }
  if (!saved.members.every(m => P.get(m.id))) yield* ST.isaacsTest(E, saved);
  const crew = ST.crewCharacters(saved);
  for (const m of saved.members) { if (P.get(m.id)) continue; const c = crew.find(x => x.id === m.id) || Character.deserialize(m); c.fullRestore(); c.cd = {}; c.limit = 0; P.add(c); for (const d of c.djinn) if (!P.djinnFound.includes(d.name)) P.djinnFound.push(d.name); }
  if (saved.summons) for (const s of saved.summons) if (!P.summons.includes(s)) P.summons.push(s);
  if (saved.coins) P.coins += saved.coins;
  if (G.isaacParty && G.isaacParty.inv) for (const it of G.isaacParty.inv) G.inventory.add(it.name, it.qty);
  const carried = (it) => P.members.some(m => Object.values(m.equip || {}).includes(it) || (m.held || []).includes(it));
  for (const it of ['Lifting Gem', 'Carry Stone', 'Catch Beads', 'Orb of Force', 'Frost Jewel', 'Douse Drop', 'Halt Gem', 'Cloak Ball']) if (!G.inventory.has(it) && !carried(it)) G.inventory.add(it);   // the first journey's Psynergy stones come with Isaac either way (the guide: the Lifting Gem, the Carry Stone and the Catch Beads transfer even unlinked)
  Audio.sfx('levelup'); yield E.say("Isaac, Garet, Ivan and Mia joined the party! (Use the Party menu to swap between the front and back rows. Up to 8 members travel together.)");
  yield E.say("(Isaac brought the Lifting Gem, the Carry Stone and the Catch Beads. Isaac's Djinn from the first journey are with him.)");
  if (!G.flag('camp_founded')) yield* ST.campFounded(E);
  E.field.rebuildFollowers(); E.gather();
};
// ============ MAGMA ROCK / LOHO / PROX / MARS ============
ST.magmaBlaze = function* (E) { yield E.say("The mark of Mars... Fire answers me!", 'Jenna'); Engine.doFlash(15, '#ff6030'); Audio.sfx('fire'); yield 20; const j = G.party.get('Jenna'); if (j) j.learnExtra('Blaze'); yield E.say('Jenna learned Blaze!'); yield E.say("Blaze lights torches and burns away obstacles. And that great sphere of magma... it will make fine cannon shot.", 'Kraden'); };
ST.lohoCannon = function* (E) {
  if (G.flag('loho_blasted')) { yield E.say('The wall lies in rubble.'); return; }
  if (!G.inventory.has('Magma Ball')) { yield E.say("An ancient cannon. It needs a ball of magma to fire."); return; }
  const r = yield* E.ask('Load the Magma Ball and fire the cannon?', null, ['Fire!', 'Not yet']); if (r !== 0) return;
  G.inventory.remove('Magma Ball'); Engine.doShake(30); Audio.sfx('boom'); Engine.doFlash(15, '#ffffff'); yield 30;
  yield E.say('BOOM! The wall crumbles! A path opens beyond.'); G.set('loho_blasted');
  G.map.fillObj(16, 12, 6, 1, null); G.map.finalize();
  yield* E.djinn('Lull');
};
// the ice wall across the Northern Reaches, met from the ship: without the cannon the party turns back; with it,
// they shelter between two blocks of ice and fire (ice_wall_broken: the wall's cell is sea from then on)
ST.iceWall = function* (E) {
  const F = G.field; if (!F.ship) return;
  E.pan(95, 29, 20); yield 20;
  yield E.say("Kraden, come look at this... There's a huge ice wall blocking our path...", 'Jenna');
  if (!G.flag('ship_cannon')) { yield E.say("Hm... If we can't do something about that wall, we're not going any farther, Felix.", 'Kraden'); G.set('ice_wall_seen'); E.panBack(20); yield 20; return; }
  yield E.say("Nothing to worry about, Jenna. We'll just have to use that cannon we got in Loho!", 'Kraden');
  yield E.say("That's right! If the cannon can blast away a stone wall, think what it'll do to ice!", 'Sheba');
  yield E.say("Felix, take us between those two blocks of ice for shelter when you fire the cannon.", 'Kraden');
  yield E.say("We should be safe if we fire from this distance.", 'Piers');
  yield E.say("OK, here we go! Felix, aim right at the ice wall and fire when ready!", 'Kraden');
  const r = yield* E.ask('Fire the cannon?', null, ['Yes', 'No']);
  if (r !== 0) { yield E.say("What? You're not ready yet? Take your time and get into position then... But as soon as you're ready, fire!", 'Kraden'); E.panBack(20); yield 20; return; }
  yield E.say('Fire the Magma Ball!', 'Kraden'); Audio.sfx('boom'); Engine.doFlash(12, '#ffffff'); Engine.doShake(40); yield 30;
  const M = G.map; M.set(95, 30, 'w_sea'); M.finalize(); G.set('ice_wall_broken'); yield 20;
  yield E.say('Great! We did it! We can keep going now!', 'Jenna'); yield E.say("All right, let's head for the Northern Seas.", 'Kraden'); yield E.say("Let's go!", 'Sheba');
  E.panBack(20); yield 20;
};
ST.northernReaches = function* (E) { yield E.say("The Northern Reaches. Beyond this frozen waste lies Prox... and the edge of the world.", 'Felix'); yield E.say("Look at the horizon. There's... nothing. The world just ends. That's what Felix meant.", 'Garet'); };
ST.proxArrive = function* (E) { Audio.play('snow'); yield E.say("Prox. It's been three years since I left with Saturos and Menardi.", 'Felix'); yield E.say("Felix! You've returned! And these must be the Adepts of Vale. Come - Puelle, our chief, must see you. And your parents...", 'Villager'); };
ST.puelle = function* (E) {
  if (G.flag('puelle_done')) { yield E.say("The Mars Lighthouse awaits. May the flames of Prox burn in your hearts.", 'Puelle'); return; }
  yield E.say("Felix. Jenna. And Isaac of Vale... Saturos told me of you. I am Puelle, elder of Prox.", 'Puelle');
  yield E.say("You have seen the edge. Every year it creeps closer. Only the Mars beacon can halt it. Karst and Agatio went ahead to the Lighthouse... in anger. I fear for them.", 'Puelle');
  E.spawn('KyleP', 10, 6, { look: NPC_LOOKS.Kyle, name: 'Kyle' });
  yield E.say("Isaac... My son. Look how you've grown.", 'Kyle');
  yield E.say("Father! You're alive! Mother... she never stopped waiting for you.", 'Isaac');
  yield E.say("Saturos pulled us from the river. Jenna, Felix - your parents rest inside. We have been well cared for. But the Proxians need the beacon lit, Isaac. Help them.", 'Kyle');
  E.despawn('KyleP'); G.set('puelle_done');
  yield E.give('Teleport Lapis'); G.set('teleportUnlocked');
  yield E.say("Take the Teleport Lapis, an heirloom of Prox. It will carry you to any town you have visited. Now go - the Mars Lighthouse is north.", 'Puelle');
  yield* E.chapter('Chapter 7: The Mars Lighthouse');
};
ST.marsEnter = function* (E) { yield E.say("The Mars Lighthouse... it's frozen solid. The beacon's fire has been cold too long.", 'Jenna'); yield E.say("The ice wall ahead - Blaze can melt it. And the Lighthouse's own flame will warm as we climb.", 'Kraden'); };
ST.flameDragons = function* (E) {
  Audio.play('boss'); yield E.say("Two dragons of living flame block the stairs! Their eyes... they seem almost human.", 'Mia');
  const r = yield* E.battle(['Flame Dragon (Small)', 'Flame Dragon (Big)'], { boss: true, canFlee: false, music: 'boss', weaken: { hp: 0.6, atk: 0.75 } });
  if (r !== 'win') return;
  Audio.play('sad');
  yield E.say("(The dragons collapse... and their forms shrink into Karst and Agatio!)");
  yield E.say("Felix... it was Alex. He told us the dragon's power would let us light the beacon ourselves... We were fools.", 'Agatio');
  yield E.say("Take the Mars Star... light the beacon... for Prox... Menardi, I'm sorry...", 'Karst');
  yield E.say("(Karst and Agatio breathe their last. The party carries on in silence.)"); Audio.play('lighthouse');
};
ST.marsAerie = function* (E) {
  Audio.play('villain');
  E.spawn('AlexM', 12, 12, { look: NPC_LOOKS.Alex, name: 'Alex' });
  yield E.say("At last. The final beacon. Isaac - the Mars Star, if you please.", 'Alex');
  yield E.say("Why, Alex? What do you gain from all this?", 'Isaac');
  yield E.say("When all four beacons burn, the Golden Sun will rise over Mt. Aleph and bestow the power of Alchemy on whoever stands there. I intend to be that person. Now - the Star.", 'Alex');
  yield E.pan(12, 9); yield E.say("(Isaac casts the Mars Star into the beacon!)"); Engine.doFlash(25, '#ff6030'); Audio.sfx('beacon'); yield E.shake(40);
  G.set('mars_lit'); G.map.beacon(12, 7, 'mars', true); G.map.finalize(); yield E.say('(A pillar of crimson fire erupts from the Mars Lighthouse! Far away, the four beacons converge on Mt. Aleph...)'); yield E.panBack();
  yield E.say("It is done! I go to claim what is mine. Farewell, Adepts.", 'Alex'); Engine.doFlash(8, '#a0e0ff'); E.despawn('AlexM');
  Engine.doFlash(15, '#ffffff'); Audio.play('final');
  yield E.say("(The ground shakes. A monstrous three-headed dragon rises from the beacon's light!)");
  yield E.say("It's the Wise One's doing! He fused... Isaac, those faces! It's Kyle! And Felix's parents!", 'Kraden');
  yield E.say("The Wise One turned our parents into THAT? To stop us?!", 'Jenna');
  yield E.say("If we don't fight, it kills us. If we do... Isaac, I'm sorry. There's no other way.", 'Felix');
  const r = yield* E.battle(['Doom Dragon'], { boss: true, canFlee: false, music: 'final', weaken: { hp: 0.65, atk: 0.8 } });
  if (r !== 'win') return;
  Audio.play('sad');
  yield E.say("(The Doom Dragon falls. Three bodies lie where it stood... Kyle, and Felix and Jenna's parents.)");
  yield E.say("Father... Father, no...", 'Isaac');
  Engine.doFlash(20, '#ffffff'); Audio.play('lighthouse');
  yield E.say("(The Wise One appears above the aerie.)");
  yield E.say("You have chosen. Alchemy returns to Weyard. I tested you so that you would understand the weight of your choice... but those you love need not be the price.", 'The Wise One');
  yield E.say("The Golden Sun rises. Its light restores what was taken. Go home, Adepts of Vale.", 'The Wise One');
  Engine.doFlash(30, '#ffe060'); Audio.sfx('heal'); yield 30;
  yield E.say("They're... breathing! Father! Kyle is alive! They're all alive!", 'Isaac');
  yield E.say("(A golden light spreads across the world. The edge of Weyard stops crumbling. Alchemy has returned.)");
  yield Engine.fadeOut(60); G.set('game_complete');
  yield* ST.ending(E);
};
ST.ending = function* (E) {
  Audio.play('ending');
  E.warpNow('vale', 15, 20, DIR.DOWN); yield Engine.fadeIn(60);
  yield* E.chapter('Epilogue');
  yield E.say("(Weeks later. Vale... or what remains of it. Mt. Aleph has vanished, and with it the village. But the people of Vale are safe, gathered on the plain where their homes once stood.)");
  E.spawn('DoraE', 19, 22, { look: NPC_LOOKS.Dora, name: 'Dora' }); E.spawn('KyleE', 21, 22, { look: NPC_LOOKS.Kyle, name: 'Kyle' });
  yield E.say("Isaac! Kyle! Oh, I never thought I would see you both again!", 'Dora');
  yield E.say("Vale is gone. But we're alive. All of us. We'll rebuild.", 'Kyle');
  yield E.pan(20, 4, 50); Engine.doFlash(30, '#ffd040');
  yield E.say("The Golden Sun shines over Mt. Aleph's crater. Alex stood there when it rose... The Wise One says the mountain took him. Whether he lives, no one knows.", 'Kraden');
  yield E.panBack(40);
  yield E.say("Alchemy has returned to the world. Prox is saved. Lemuria is free. The world is whole again... and it is ours to protect.", 'Felix');
  yield E.say("So... what now? More adventures?", 'Garet');
  yield E.say("Now we go home. Wherever that turns out to be.", 'Isaac');
  yield E.say("(Golden Sun: The Complete Saga - THE END. Thank you for playing!)");
  yield E.say("(You may continue exploring Weyard. The Teleport Lapis will take you anywhere. Optional dungeons: Treasure Isle, Yampi Desert Cave, Islet Cave and the Anemos Inner Sanctum await the strongest Adepts.)");
  G.set('islet_open'); if (G.party.djinnCount() >= 72) G.set('anemos_open');
  E.despawn('DoraE'); E.despawn('KyleE');
};
// ============ WHAT GOLDEN SUN LEFT BEHIND ============
// Four threads the originals only opened if you carried a save from the first game across. Here there is nothing to
// carry - it is one journey - so they simply happen, gated on what Isaac's half of it actually did.
ST.gs1Done = (flag) => G.flag(flag) || G.flag('gs1_complete');

ST.vaultBandits = function* (E) {
  yield E.say("Hold it! You there - the one with the sword.", 'Bandit');
  yield E.say("We are the pride of Vault, and we have been run out of every town between here and Angara by a yellow-haired boy with a blade just like that one.", 'Bandit');
  yield E.say("You have me confused with someone else.", 'Felix');
  yield E.say("Close enough!", 'Bandit');
  const r = yield* E.battle(['Bandit', 'Brigand', 'Brigand'], { boss: true, canFlee: false });
  if (r !== 'win') return;
  yield E.say("(The bandits scatter into the hills. One of them leaves his boots behind in the rush.)");
  yield E.give('Golden Boots');
};

ST.feizhi = function* (E) {
  yield E.say("Excuse me! Excuse me - are you Isaac?", 'Feizhi');
  yield E.say("...No.", 'Felix');
  yield E.say("Oh. You have the same look about you. The serious one, I mean.", 'Feizhi');
  yield E.say("I am Feizhi, of Xian. A boy named Isaac saved my Hsu when a boulder pinned him on the mountain road, and I have been carrying this since, meaning to thank him properly.", 'Feizhi');
  yield E.say("If you ever meet him - and I think you will, the way people talk - please give him this.", 'Feizhi');
  yield E.give('Golden Ring');
  yield E.say("(She turns very red and hurries away before anyone can ask anything else.)");
  yield E.say("Fascinating. She has never seen his face, and she has crossed an ocean to find it.", 'Kraden');
  G.set('feizhi_ring');
};

ST.colossoRematch = function* (E) {
  yield E.say("That is him! The yellow hair - that is the one!", 'Azart');
  yield E.say("You. Colosso. Tolbi. You do remember.", 'Satrage');
  yield E.say("I remember winning, if that is what you mean.", 'Isaac');
  yield E.say("You cheated! Nobody swings like that! We have crossed half of Weyard to say so!", 'Navampa');
  const r = yield* E.battle(['Azart', 'Satrage', 'Navampa'], { boss: true, canFlee: false });
  if (r !== 'win') return;
  yield E.say("...All right. All right! You did not cheat.", 'Azart');
  yield E.say("Take this. We found it in the caves back there and it does not suit any of us.", 'Satrage');
  yield E.give('Golden Shirt');
  yield E.say("(The three of them trudge back down the road, arguing about who lost hardest.)");
};

ST.alhafraPirates = function* (E) {
  yield E.say("...picked clean, I tell you. Crossbone Isle. Not a coin left in the place.", 'Pirate');
  yield E.say("And the ghost?", 'Pirate');
  yield E.say("Beaten. Whoever did it is the king of pirates now, that is the rule, and the rule is older than either of us.", 'Pirate');
  yield E.say("Then we had better find him before someone else swears loyalty first. They say he is travelling with a scholar and a girl from Imil.", 'Pirate');
  yield E.say("(Isaac makes a point of studying the ceiling.)");
};

// ============ OPTIONAL BOSSES / TRADE QUEST ============
ST.lemuriaFountain = function* (E) {
  if (!G.inventory.has('Lucky Medal')) { yield E.say("The Fountain of Lemuria rewards those who offer it a Lucky Medal. Its heart holds treasures from the age of Alchemy.", 'Fountain Keeper'); return; }
  const r = yield* E.ask('Toss a Lucky Medal into the fountain?', 'Fountain Keeper', ['Yes', 'No']); if (r !== 0) return;
  yield* E.fountain('lemuria');
};
// the islets' animal trade (Pengus, the bird, the cow, the dog, Lonesome George): js/maps/islets.js
// Ankohl's faces and rooms: js/maps/ankohl.js

// ============ THE CAMP ============
// Eight Adepts cannot all trail behind one leader, so they make somewhere to stand still for a while.
ST.campFounded = function* (E) {
  yield E.say("Eight of us now. We trip over each other on the road, and nobody can hear themselves think.", 'Garet');
  yield E.say("Then let us stop pretending we are one party. We make a camp - somewhere to leave our packs, argue about Djinn, and let the ones not fighting keep their edge.", 'Kraden');
  yield E.say("There is level ground north of Contigo. Sheltered, and close to the Lighthouse road.", 'Piers');
  yield E.say('(The party raises a camp on the Atteka plain.)'); Audio.sfx('levelup'); Engine.doFlash(12, '#ffe080');
  G.set('camp_founded');
  yield E.say("Four tents: formation, Djinn, arms, and a training ground. Come back whenever the road allows - it is marked on your map now.", 'Kraden');
  // the two who led the parties here can find their way back from anywhere
  for (const id of ['Felix', 'Isaac']) { const m = G.party.get(id); if (m) m.learnExtra('Hideout'); }
  yield E.say("And we need not walk it every time. Isaac - between us we can hold the way back in mind. Hideout, call it.", 'Felix');
  yield E.say('Felix and Isaac learned the Hideout Psynergy!');
};
ST.campRest = function* (E) { for (const m of G.party.members) { m.status = {}; m.hp = m.stats().hp; m.pp = m.stats().pp; m.cd = {}; } Audio.sfx('heal'); Engine.doFlash(8, '#ffd090'); yield E.say('(The party rests by the campfire. Everyone is restored.)'); };
ST.campFormation = function* (E) { const s = new CampFormationScene(); Engine.push(s); yield () => s.closed; yield E.move('player', DIR.DOWN, 1); };
ST.campClass = function* (E) { const s = new CampClassScene(); Engine.push(s); yield () => s.closed; yield E.move('player', DIR.DOWN, 1); };
ST.campArmoury = function* (E) { const s = new CampArmouryScene(); Engine.push(s); yield () => s.closed; yield E.move('player', DIR.DOWN, 1); };
ST.campSummon = function* (E) { const s = new CampSummonScene(); Engine.push(s); yield () => s.closed; yield E.move('player', DIR.DOWN, 1); };
ST.campTraining = function* (E) { const s = new CampTrainingScene(); Engine.push(s); yield () => s.closed; yield E.move('player', DIR.DOWN, 1); };
