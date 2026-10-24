// ============================================================================
// After the Golden Sun: the post-game (2026-09-19, the user's design).
//   - the Colossus of Sol gets a proper scene: the Wise One introduces the sanctum's guardian
//   - the Wise One's warning once the credits have rolled (the whole party of nine)
//   - Alex, sealed beneath the sunken summit of Mt. Aleph: a boss as strong as the strongest class-item bosses;
//     beaten, Mia talks him round and he joins at the party's best level with end-game gear and his own Psynergy
//   - the Wise One himself, in the Heart of Aleph: the strongest fight there is; the Eyes of Alchemy for the win
//   - King Hydros and the Eyes: the history of Alchemy, and the way to the Cradle, the world the first Alchemy
//     came from - one continent, no towns, no roaming monsters, and the beings that crossed over at the beginning
// Alex's definition (character, Psynergy, foe rows) lives here too; the maps are in js/maps/postgame.js.
'use strict';
{
  const ST = STORY_TLA;
  const say = (E, t, who) => E.say(t, who);
  const award = function* (E, item, line) { Audio.sfx('levelup'); Engine.doFlash(10, '#ffe080'); yield E.give(item); if (line) yield E.say(line); };
  const has = (n) => G.party.members.some(m => m.name === n);
  const topLevel = () => Math.max(1, ...G.party.members.map(m => m.level));

  // ====================== Alex ======================
  CHARACTERS.Alex = { name: 'Alex', el: 1, base: [31, 27, 12, 6, 10, 6], goals: { hp: [185, 340, 495, 650, 805], pp: [105, 170, 222, 274, 326], atk: [86, 162, 238, 313, 388], def: [39, 72, 106, 139, 172], agi: [92, 175, 258, 341, 424] }, pow: [79, 86, 79, 79], res: [89, 96, 89, 89], inherent: ['Blink', 'Phase Strike', 'Cosmic Ply', 'Retreat'], weapons: ['light', 'staff', 'long'], armor: ['robe', 'cloth', 'armor'], helm: ['circlet', 'hat', 'helm'],
    look: Object.assign({}, NPC_LOOKS.Alex, { weapon: 'lightblade', weaponColor: '#80d0ff' }), desc: 'The Mercury Adept who reached for the Golden Sun - and was talked down from it.' };
  // his Psynergy: the blink he stepped through both journeys with, the strike that comes from nowhere, the great mending
  D('Blink', 'W', 6, 'buff', { stat: 'agi', amt: 0.5, field: true, desc: 'Step through the world: agility up in battle (and Alex always has a chance to blink out of the way of a blow - a better one against a summon); on the field, a blink over a gap or a wall (up to four paces).' });
  D('Phase Strike', 'W', 14, 'epa', { mult: 1.6, pierce: 0.6, desc: 'A strike from a step outside the world: half of the guard means nothing.' });
  D('Cosmic Ply', 'W', 26, 'heal', { base: 320, range: 'all', desc: 'Mend the whole party with the ocean of the sky.' });
  // the bosses' own
  D('Glacial Prison', 'W', 22, 'status', { status: 'stun', statusChance: 0.5, range: 5, desc: 'Ice closes over the foes.' });
  D('Frost Nova', 'W', 30, 'magic', { base: 260, range: 'all', desc: 'Winter bursts outward.' });
  D('Judgment Eye', 'N', 44, 'magic', { base: 360, range: 'all', desc: "The Wise One's gaze, which nothing turns aside." });
  D('Wrath of Sol', 'F', 38, 'magic', { base: 340, range: 'all', desc: 'The sun of Sol Sanctum, brought down.' });
  D('Sanctum Ward', 'E', 20, 'buff', { stat: 'def', amt: 0.35, desc: 'Stone closes about the caster.' });
  D('Stone Gaze', 'E', 18, 'status', { status: 'stun', statusChance: 0.55, range: 3, desc: 'The gaze that stills.' });
  D('Tectonic Crush', 'E', 36, 'magic', { base: 300, range: 'all', desc: 'The ground folds over the foes.' });
  D('Gaia Tremor', 'E', 16, 'magic', { base: 170, range: 5, status: 'stun', statusChance: 0.3, desc: 'The earth shakes them off their feet.' });
  D('Tidal Ruin', 'W', 36, 'magic', { base: 320, range: 'all', desc: 'The whole sea, once.' });
  D('Deep Freeze', 'W', 18, 'status', { status: 'stun', statusChance: 0.7, sure: true, range: 5, desc: 'The cold of the deep: one is always taken, and most of the rest.' });   /* the user's rule: at least one stunned, the others likely */
  D('Pyroclasm', 'F', 36, 'magic', { base: 330, range: 'all', desc: 'The mountain empties itself on the foes.' });
  D('Rage of Flame', 'F', 12, 'buff', { stat: 'atk', amt: 0.35, desc: 'The fire feeds on itself.' });
  D('Tempest Ruin', 'A', 36, 'magic', { base: 320, range: 'all', desc: 'The sky comes down.' });
  D('Whirlwind Lance', 'A', 14, 'epa', { mult: 1.5, desc: 'A lance of wind.' });
  D('Prima Materia', 'N', 48, 'magic', { base: 380, range: 'all', desc: 'The first matter, from which everything was made and to which it can be returned.' });
  D('Element Storm', 'N', 40, 'prismatic', { base: 300, range: 'all', desc: 'All four at once: each foe takes the one it fears.' });
  D('Transmutation', 'N', 16, 'break', { range: 'all', desc: 'Every bonus unmade.' });
  // the field blink: over a gap, a wall, water, whatever blocks - to the first open pace within four
  if (typeof ClassExt !== 'undefined') ClassExt.field.Blink = function (F, c) {
    const M = c.M, p = F.player, d = p.dir; let x = p.tx, y = p.ty, blocked = 0, landing = null;
    for (let i = 1; i <= 4; i++) { x += DX[d]; y += DY[d]; if (!M.inb(x, y)) break; if (F.blocked(x, y, p) || M.get(x, y).hole) { blocked++; continue; } if (blocked > 0) { landing = { x, y }; break; } else break; }
    if (landing) { c.spend(); Audio.sfx('psy'); Engine.doFlash(6, '#a0e0ff'); F.hop(p, d, landing); p.speed = 4; F.showNotice('Alex steps through.'); return; }
    c.fail();
  };
  // ---- Alex's nine Djinn: not found, made - with what the Golden Sun left in him. Mercury, every one, and stronger
  // than any that grew in the world; they come to the party with him
  const ALEX_DJINN = ['Azoth', 'Aqua Regia', 'Quicksilver', 'Tincture', 'Vitriol', 'Nimbus', 'Alkali', 'Panacea', 'Ouroboros'];
  defDjinn('Azoth', 1, [14, 6, 5, 2, 3, 2], { k: 'epa', add: 40, mult: 1.9 }, 'The universal solvent: a blow that goes through everything.', 3);
  defDjinn('Aqua Regia', 1, [12, 5, 6, 2, 2, 1], { k: 'epa', add: 60, mult: 1.3, drain: 0.6 }, 'Royal water: strike, and drink most of the wound.', 3);
  defDjinn('Quicksilver', 1, [10, 6, 2, 2, 6, 2], { k: 'buffAll', stat: 'agi', amt: 0.5 }, "Raise the party's Agility by half.", 3);
  defDjinn('Tincture', 1, [13, 8, 2, 3, 2, 2], { k: 'healAll', pct: 0.5 }, 'Mend the whole party by half.', 3);
  defDjinn('Vitriol', 1, [12, 4, 6, 1, 3, 1], { k: 'epa', add: 50, mult: 1.4, status: 'venom' }, 'A strike that leaves venom in the wound.', 3);
  defDjinn('Nimbus', 1, [15, 5, 1, 5, 2, 2], { k: 'shield', pct: 0.65 }, 'A cloud that takes two thirds of every blow this turn.', 3);
  defDjinn('Alkali', 1, [11, 5, 4, 2, 3, 1], { k: 'debuffAll', stat: 'def', amt: -0.3 }, "Eat through all enemies' Defense.", 3);
  defDjinn('Panacea', 1, [14, 7, 1, 3, 2, 3], { k: 'reviveAll', pct: 0.6 }, 'The cure for everything: every downed ally rises with 60% HP.', 3);
  defDjinn('Ouroboros', 1, [12, 9, 2, 2, 3, 2], { k: 'ppAll', pct: 0.4 }, "Restore 40% of the party's PP.", 3);
  for (const n of ALEX_DJINN) if (!DJINN_ORDER[1].includes(n)) DJINN_ORDER[1].push(n);
  // the boss himself, the way Isaac's crew was fought: a real Character behind the shell - level 50,
  // his gear the Golden Sun's age's, his nine Djinn set, his class the top of the Mercury line, the party's summons and
  // his own bag; decided for by the tactician through the mirror (ClassExt.rival). His HP is his own - what makes him a
  // boss is two actions a round and Blink as a passive (a chance to step out of any blow, a better one against summons). He joins as this same Character afterwards, Djinn and all.
  ST.ALEX_LEVEL = 50;   // the user's rule: superboss Alex is level 50, and that is the level he joins at
  ST.alexRival = () => {
    if (ST._alex && ENEMY_DB[ST._alex.key]) return ST._alex;   /* the row must still be there (a reloaded table drops it); the Character is kept */
    if (ST._alex) { const c0 = ST._alex.c; const key0 = ClassExt.rival('Alex', c0, ST._alex.bag, NPC_LOOKS.Alex); const row0 = ENEMY_DB[key0]; row0.t = 2; row0.nr = true; row0.exp = 24000; row0.c = 12000; return (ST._alex = { c: c0, key: key0, bag: ST._alex.bag }); }
    const c = new Character('Alex', ST.ALEX_LEVEL); c.equip = { weapon: 'Tisiphone Edge', body: 'Xylion Armor', arm: 'Cosmos Shield', head: 'Crown of Glory', acc: 'Ouroboros Ring' };   /* the Crown of Glory mends PP, the ring both */
    for (const n of ALEX_DJINN) c.setDjinn(n); c.validateSummon(G.party); c.fullRestore();
    const bag = new Inventory(); bag.add('Potion', 4); bag.add('Psy Crystal', 3); bag.add('Elixir', 2); bag.add('Water of Life', 2); bag.add('Mist Potion', 2);
    const key = ClassExt.rival('Alex', c, bag, NPC_LOOKS.Alex); const row = ENEMY_DB[key]; row.t = 2; row.nr = true; row.exp = 24000; row.c = 12000;   /* his HP is his own (the user's rule: no boss HP); what makes him a boss is two actions a round and the Blink */
    return (ST._alex = { c, key, bag });
  };
  // the items the Cradle's beings leave, and the Eyes
  const X = (n, o) => { ITEM_DB[n] = Object.assign({ n, cat: 'misc', buy: 0, sell: 0 }, o); };
  X('Ouroboros Ring', { cat: 'ring', def: 24, hpRegen: 100, ppRegen: 14, res: { Mercury: 20 }, desc: 'The serpent that eats its tail: HP and PP come back every turn. Alex made it for himself.' });   /* the user's rule: Alex recovers HP and PP each turn through his gear */
  X('Eyes of Alchemy', { cat: 'misc', key: true, desc: 'What the Wise One saw with. They see the way Alchemy came into the world - and the way back out of it.' });
  X("Terra Band", { cat: 'ring', def: 30, hp: 60, pow: { Venus: 25 }, res: { Venus: 30 }, desc: "Terragon's heart, bound in a band. HP +60, Venus power +25." });
  X("Tide Ring", { cat: 'ring', def: 26, ppRegen: 6, pow: { Mercury: 25 }, res: { Mercury: 30 }, desc: "Thalassa's scale. PP recovers each turn; Mercury power +25." });
  X("Ember Seal", { cat: 'ring', def: 24, crit: 15, pow: { Mars: 25 }, res: { Mars: 30 }, desc: "Ignis's cinder. Criticals rise; Mars power +25." });
  X("Gale Charm", { cat: 'ring', def: 22, agi: 40, pow: { Jupiter: 25 }, res: { Jupiter: 30 }, desc: "Zephyros's feather. Agility +40; Jupiter power +25." });
  X("Alkahest Crown", { cat: 'circlet', def: 62, pow: { Venus: 15, Mercury: 15, Mars: 15, Jupiter: 15 }, res: { Venus: 20, Mercury: 20, Mars: 20, Jupiter: 20 }, hpRegen: 12, ppRegen: 8, desc: 'The crown of the first Alchemist. Every power +15, every resistance +20, and both HP and PP mend each turn.' });
  X("Philosopher's Stone", { cat: 'misc', key: true, desc: 'The thing every alchemist ever looked for. It hums.' });

  // ====================== the foes ======================
  const registerFoes = () => { const F = ClassExt.foe;
    F('The Wise One', { hp: 28000, pp: 999, atk: 720, def: 320, agi: 340, lck: 80, t: 2, pw: [150, 150, 150, 150], rs: [160, 160, 160, 160], ab: ['Attack', 'Judgment Eye', 'Wrath of Sol', 'Charon', 'Stone Gaze', 'Sanctum Ward', 'Djinn Storm', 'Break'], exp: 30000, c: 15000, g: 'post' });
    F('Terragon', { hp: 24000, pp: 800, atk: 700, def: 340, agi: 250, lck: 60, t: 2, pw: [170, 100, 100, 100], rs: [200, 90, 110, 110], ab: ['Attack', 'Tectonic Crush', 'Gaia Tremor', 'Stone Spire', 'Quake Sphere', 'Sanctum Ward', 'Break'], exp: 26000, c: 13000, dr: ['Terra Band', 1], g: 'post', gimmick: 'harden' });
    F('Thalassa', { hp: 23000, pp: 900, atk: 660, def: 290, agi: 330, lck: 60, t: 2, pw: [100, 170, 100, 100], rs: [110, 200, 90, 110], ab: ['Attack', 'Tidal Ruin', 'Glacier', 'Deep Freeze', 'Undertow', 'Cosmic Ply', 'Break'], exp: 26000, c: 13000, dr: ['Tide Ring', 1], g: 'post', gimmick: 'tide' });
    F('Ignis', { hp: 24000, pp: 850, atk: 740, def: 280, agi: 320, lck: 60, t: 2, pw: [100, 100, 170, 100], rs: [110, 90, 200, 110], ab: ['Attack', 'Pyroclasm', 'Inferno', 'Fiery Blast', 'Rage of Flame', 'Break'], exp: 26000, c: 13000, dr: ['Ember Seal', 1], g: 'post', gimmick: 'heat' });   /* Meltdown is the gauge's, not a spell it picks */
    F('Zephyros', { hp: 23500, pp: 900, atk: 690, def: 300, agi: 380, lck: 60, t: 2, pw: [100, 100, 100, 170], rs: [110, 110, 90, 200], ab: ['Attack', 'Tempest Ruin', 'Spark Plasma', 'Whirlwind Lance', 'Storm Ray', 'Djinn Storm', 'Break'], exp: 26000, c: 13000, dr: ['Gale Charm', 1], g: 'post', gimmick: 'aloft' });
    F('Alkahest', { hp: 32000, pp: 999, atk: 760, def: 340, agi: 360, lck: 90, t: 2, pw: [160, 160, 160, 160], rs: [170, 170, 170, 170], ab: ['Attack', 'Element Storm', 'Charon', 'Chaos Magic', 'Cosmic Ply', 'Djinn Storm', 'Break'], exp: 40000, c: 20000, g: 'post', gimmick: 'transmute' });   /* Transmutation and Prima Materia are what it is, not what it casts */
  };
  if (typeof ClassExt !== 'undefined') registerFoes(); else (window.__classFoes = window.__classFoes || []).push(registerFoes);

  // ====================== the Colossus of Sol: the Wise One's introduction ======================
  // played by STORY.colossusOfSol (js/maps/class_trials_gs1.js) before the fight, once
  ST.colossusIntro = function* (E) {
    if (G.flag('colossus_intro')) return; G.set('colossus_intro');
    E.spawn('WiseOneC', 11, 6, { animal: 'wiseone', name: 'The Wise One', solid: false }); Engine.doFlash(15, '#ffffff'); Audio.sfx('psy'); yield 20;
    yield say(E, "You have come a long way down, to stand before it.", 'The Wise One');
    yield say(E, "The Wise One!", has('Isaac') ? 'Isaac' : 'Felix');
    yield say(E, "Here, of all places... This is the heart of the mountain. Below the sanctum's deepest floor.", 'Kraden');
    yield say(E, "It is. And that - " + "(the eye turns toward the golden figure, still as a statue at the chamber's end)" + " - is the Colossus of Sol. One of the great guardians of Sol Sanctum, made by the ones who built it, when the Elemental Stars were first laid down.", 'The Wise One');
    yield say(E, "A guardian... Then the sanctum was never unguarded. Not really.", 'Ivan');
    yield say(E, "It was not. You have wondered, perhaps, why the two from Prox failed the first time they came for the Stars - three years before you followed them in. Saturos and Menardi were strong. Stronger than any of you were, then.", 'The Wise One');
    yield say(E, "The storm... The night of the storm over Vale. The boulder that came down on the village.", has('Garet') ? 'Garet' : 'Jenna');
    yield say(E, "Yes. They came for the Stars, and the guardians woke, and the mountain answered. That storm was the sanctum's answer to them. They fled it with their lives and little else - and it took them three years and a great deal of cunning to come back another way.", 'The Wise One');
    yield say(E, "So when we walked in after them, with the Stars already in Kraden's hands... the guardians had already spent themselves on Saturos.", 'Isaac');
    yield say(E, "Some of them. Not this one. This one does not spend itself. It waits for whoever carries the Stars' light to come and prove they can bear it.", 'The Wise One');
    yield say(E, "And we carry it. All of it, by now.", 'Felix');
    yield say(E, "Then it will not yield to you for the asking. It never has. Show it what you are - and if you are what I think, take what it guards.", 'The Wise One');
    yield say(E, "(The eye closes, and the Wise One is gone. The Colossus opens its eyes.)");
    E.despawn('WiseOneC'); Engine.doFlash(10, '#ffffff'); Audio.sfx('boom'); Engine.doShake(16); yield 20;
  };

  // ====================== the credits have rolled: the Wise One's warning ======================
  // the party of nine gathered at Prox's gate; called by the epilogue, and by the runner for a game finished before this was written
  ST.wiseOneWarning = function* (E) {
    if (G.flag('postgame_open')) return;
    const F = E.field; if (G.map.id !== 'prox') { E.warpNow('prox', 15, 74, DIR.DOWN); yield Engine.fadeIn(30); }
    E.setFollowers(false); const p = F.player;
    const spots = [[13, 74], [17, 74], [12, 75], [18, 75], [14, 76], [16, 76], [13, 77], [17, 77], [15, 77]]; const ids = [];
    let k = 0; for (const m of G.party.members) { if (m === G.party.active[0]) continue; const [x, y] = spots[k++] || spots[0]; E.spawn('W9_' + m.id, x, y, { look: m.look, name: m.name, dir: DIR.UP }); ids.push('W9_' + m.id); }
    yield 20; Audio.play('sanctums');
    yield say(E, "(The nine of them, on Prox's road, with the Mars Lighthouse burning behind them. And then a tenth thing, that was not there a moment ago.)");
    E.spawn('WiseOneW', 15, 71, { animal: 'wiseone', name: 'The Wise One', solid: false }); Engine.doFlash(20, '#ffffff'); Audio.sfx('psy'); yield 30;
    yield say(E, "The Wise One...", 'Isaac');
    yield say(E, "You. After everything - after the dragon, after our parents - you come to us now?", 'Garet');
    yield say(E, "Garet, wait. Let him speak.", 'Jenna');
    yield say(E, "I come now because it is done, and because you should know what you have done. The four beacons burn. The Golden Sun rose over Mt. Aleph. Alchemy is loose in the world again - and the world, which was dying, will live.", 'The Wise One');
    yield say(E, "Then we were right.", 'Felix');
    yield say(E, "You were right about the world. You were not the only ones who wanted the beacons lit. Alex wanted them lit. He stood on the summit when the Golden Sun rose, and it poured itself into him.", 'The Wise One');
    yield say(E, "Alex... He used us. Every step of the way, he was walking a pace ahead of us.", 'Piers');
    yield say(E, "He told me once that he only wanted to see Alchemy returned. I wanted to believe him.", 'Mia');
    yield say(E, "He wanted what every man who has ever read about it wants. Limitless power, and no end to his days. And he very nearly had it. I took a part of the Golden Sun's power beforehand and set it in the Mars Star, and the Mars Star was in Isaac's pack, not on the summit. So Alex has most of it. Not all.", 'The Wise One');
    yield say(E, "The Mars Star... That's why you left it with us. That's why it mattered who carried it.", 'Ivan');
    yield say(E, "Then where is he? Where is Alex now?", 'Sheba');
    yield say(E, "Under the mountain. I held him, and Mt. Aleph sank into the earth with him on it, and I sealed what was left of the summit with the mountain's own stone. He lives. Nearly limitless power keeps a man alive through a great deal.", 'The Wise One');
    yield say(E, "Sealed. Not ended.", 'Felix');
    yield say(E, "Sealed. A binding is not an ending. Stone wears. Given time - and he has a great deal of time - he will find the edge of it. I will not be there every time he does.", 'The Wise One');
    yield say(E, "So you're asking us.", 'Isaac');
    yield say(E, "I am telling you where he is. The eastern way of the sanctum's chamber of statues, which has been sealed as long as Vale has stood, is open. It goes down to what is left of the summit. What you do there is your own affair - you have never been mine to command, whatever you thought. But if you would put an end to Alex's ambition for good, that is where it waits.", 'The Wise One');
    yield say(E, "How strong is he?", 'Garet');
    yield say(E, "Stronger than anything you have fought. Stronger than the dragon you fought on the Mars Lighthouse - by a long way. He has most of the Golden Sun in him, and he has had time to learn what that means. Go with all of you, or do not go.", 'The Wise One');
    yield say(E, "I have read every book about Alchemy that was ever written and half of the ones that were only rumoured, and I could not have told you a tenth of that.", 'Kraden');
    yield say(E, "You will have the chance to learn more. Whatever you decide about Alex - I will be in the heart of the mountain, where the Colossus stood. Come and tell me what you chose.", 'The Wise One');
    yield say(E, "(The eye closes, and it is gone.)");
    E.despawn('WiseOneW'); Engine.doFlash(15, '#ffffff'); yield 20;
    yield say(E, "Well. That's the Wise One for you. Never a plain answer in his life.", 'Garet');
    yield say(E, "It was plain enough. Alex is alive, he is under Mt. Aleph, and he isn't going to stay there.", 'Jenna');
    yield say(E, "Then we go and see him. All of us. There's nothing else the nine of us are for, now.", 'Isaac');
    yield say(E, "(The eastern way of Sol Sanctum's chamber of statues is open. Alex waits at the sunken summit of Mt. Aleph.)");
    for (const id of ids) E.despawn(id); E.setFollowers(true); E.gather();
    G.set('postgame_open'); Audio.play(G.map.music);
  };

  // ====================== Alex, sealed ======================
  ST.alexSealed = function* (E) {
    if (G.flag('alex_beaten')) return;
    Audio.play('villain'); yield E.face('player', DIR.UP);
    yield say(E, "(The summit of Mt. Aleph, drawn down into the earth: the peak's stone cupped in a hollow under the mountain's stump, and at its centre a fading gold - the last of the light that rose here. In it, held in a lattice of the mountain's own rock, a man.)");
    yield say(E, "...Ah. Visitors. And such visitors. I had begun to think the Wise One meant to leave me here until the world forgot my name.", 'Alex');
    yield say(E, "Alex.", 'Mia');
    yield say(E, "Mia. And Isaac, and Felix, and - all of you. The whole company. He told you where I was, then. Of course he did. He never could finish a thing himself.", 'Alex');
    yield say(E, "You lied to every one of us. To Saturos. To Karst and Agatio. To Felix, for three years.", 'Jenna');
    yield say(E, "I told each of you what you needed to hear to do what needed doing. The beacons are lit, are they not? The world lives. You may thank me at your leisure.", 'Alex');
    yield say(E, "You wanted the Golden Sun for yourself. You were never lighting them for the world.", 'Piers');
    yield say(E, "And I have it. Most of it. Enough. Do you know what it is like, to hold that? To feel the whole of Alchemy move when you breathe? The Wise One's little trick with the Mars Star took the edge off it - but only the edge.", 'Alex');
    yield say(E, "Then why are you still in a cage?", 'Garet');
    yield say(E, "...Because the stone is very old, and he is very patient, and I have not yet found the corner of it that gives. I will. Unless, of course, you have come to save me the trouble.", 'Alex');
    yield say(E, "We came to end it. Here.", 'Felix');
    yield say(E, "Alex... it doesn't have to be this way. Whatever you've done, you're still of Imil. You're still of the clan. Come out of there and put it down.", 'Mia');
    yield say(E, "Spare me, Mia. I have heard the sermons of the Mercury Clan since before I could walk. Put it down, she says. The Golden Sun. As if it were a cup I had picked up.", 'Alex');
    yield say(E, "Then we'll take it out of your hands.", 'Isaac');
    yield say(E, "(He smiles. The lattice of stone about him cracks along every line at once.)");
    yield say(E, "Do, then. I have wanted to see what the nine of you are worth since Contigo. Show me.", 'Alex');
    Audio.sfx('boom'); Engine.doShake(30); Engine.doFlash(20, '#a0e0ff');
    const { key } = ST.alexRival();
    const r = yield* E.battle([key], { boss: true, canFlee: false, music: 'saturosmenardi' }); if (r !== 'win') return;
    G.set('alex_beaten');
    yield* ST.alexJoins(E);
  };
  ST.alexJoins = function* (E) {
    if (G.flag('alex_joined')) return;
    Audio.play('sad');
    yield say(E, "(He is on one knee in the gold, and the gold is going out of him - not all of it, but most; it runs off him like water and sinks into the stone.)");
    yield say(E, "...So. That is what the nine of you are worth.", 'Alex');
    yield say(E, "It's over, Alex.", 'Isaac');
    yield say(E, "Is it? Finish it, then. You have beaten me. The Wise One will not hold me twice, and you know it. If you leave me here, I will find the corner that gives, and I will come out, and I will still be Alex.", 'Alex');
    yield say(E, "(Nobody moves. Mia walks past all of them and kneels down in front of him.)");
    yield say(E, "Alex. Look at me.", 'Mia');
    yield say(E, "Mia -", 'Alex');
    yield say(E, "No. You listen, for once. I've listened to you my whole life. You taught me the Ply. You taught me where the spring in Imil comes from, and why the lighthouse mattered, and you were the cleverest person I had ever met, and I would have followed you anywhere.", 'Mia');
    yield say(E, "And then you left. And every time I saw you after that you were standing a little further off, with a little more of that smile, and a little less of the man who taught me the Ply.", 'Mia');
    yield say(E, "The man who taught you the Ply was going to spend his life keeping a lighthouse dark for people who did not know why it mattered.", 'Alex');
    yield say(E, "The lighthouse is LIT, Alex. All four are. The thing you said you wanted - the thing you lied to everyone to get - it's done, and it wasn't you who did it. It was us. It was the nine of us, and Saturos and Menardi, and Karst and Agatio, and even the Wise One. You only ever wanted to be the one who mattered.", 'Mia');
    yield say(E, "...", 'Alex');
    yield say(E, "You could matter. You could come with us. Not as - not as whatever you've been. As what you were. There is a whole world that has to learn to live with Alchemy again, and there is nobody alive who understands it better than you.", 'Mia');
    yield say(E, "You would trust me at your back. After Venus. After Jupiter. After all of it.", 'Alex');
    yield say(E, "I trust that you're tired. I can see it. And I trust that you've just found out that limitless power doesn't stop nine people who've made up their minds. What else are you going to do?", 'Mia');
    yield say(E, "She's right, you know. I've read about a hundred men who reached for what you reached for. None of them got to sit down afterwards and think about it.", 'Kraden');
    yield say(E, "(A long silence. Then - not the smile.)");
    yield say(E, "...Very well. I have nowhere else in this world to go, and nothing left to want that I have not already found the limit of. Let me see what you would do with a world you refused to rule. If it is foolish, I will say so.", 'Alex');
    yield say(E, "That's a yes, from him.", 'Mia');
    yield say(E, "I do not remember agreeing to be shouted at by the whole clan.", 'Alex');
    yield say(E, "You'll get used to it.", 'Jenna');
    yield Engine.fadeOut(20);
    // he joins: the party's best level, the best gear of the age, his own Psynergy
    const c = (ST._alex && ST._alex.c) || ST.alexRival().c; c.fullRestore(); c.cd = {}; c.limit = 0;
    G.party.add(c); for (const d of c.djinn) if (!G.party.djinnFound.includes(d.name)) G.party.djinnFound.push(d.name); for (const m of G.party.members) m.validateSummon(G.party);
    G.set('alex_joined'); Audio.sfx('levelup'); yield Engine.fadeIn(20);
    yield say(E, 'Alex joined the party!');
    yield say(E, "(Alex is at level " + c.level + ", in the gear of the Golden Sun's age, and the nine Djinn he made for himself - Azoth, Aqua Regia, Quicksilver, Tincture, Vitriol, Nimbus, Alkali, Panacea, Ouroboros - are the party's now. His Psynergy is his own: Blink, the step through the world he came and went by, works on the field too - over a gap, a wall, or water, up to four paces.)");
    yield say(E, "The Wise One said he'd be in the heart of the mountain. Where the Colossus was. He said to come and tell him what we chose.", 'Ivan');
    yield say(E, "Then let us go and tell him. I have one or two things to say to him myself.", 'Alex');
    E.field.rebuildFollowers(); E.gather();
  };

  // ====================== the Wise One in the Heart of Aleph ======================
  ST.wiseOneChallenge = function* (E) {
    if (G.flag('wise_one_done')) {
      yield say(E, G.flag('wise_one_beaten') ? "The Eyes are yours. Take them where they can be read - to the one king who still remembers what Alchemy was before it was ours." : "The Eyes are yours; take them to Lemuria. And when you are stronger, come and finish what you started. I should still like to know.", 'The Wise One');
      if (!G.flag('wise_one_beaten')) { const r0 = yield* E.ask("Fight the Wise One again?", null, ['Yes', 'Not now']); if (r0 !== 0) return; const r = yield* E.battle(['The Wise One'], { boss: true, canFlee: false, canLose: true, music: 'final' }); for (const m of G.party.members) m.fullRestore(); if (r === 'win') { G.set('wise_one_beaten'); yield say(E, "...Ah. So that is what it is like. I have wondered for a very long time. Nobody has ever beaten me before. I find I am glad it was you.", 'The Wise One'); } else yield say(E, "Not this time. I am always still here.", 'The Wise One'); }
      return; }
    Audio.play('sanctums');
    yield say(E, "So. You chose. And you chose the harder thing, which I did not expect - I expected you to end him. Alex, standing among them. I have seen a great deal, and not that.", 'The Wise One');
    yield say(E, "I am told I will get used to it.", 'Alex');
    yield say(E, "You will. You have a long time. - The nine of you beat what most of the Golden Sun had made of him. I have watched you since the night of the storm, and I would not have believed it of the two boys I saw run down the mountain path.", 'The Wise One');
    yield say(E, "We had help. Rather a lot of it.", 'Isaac');
    yield say(E, "You did. And now I have a question for you, and you may say no to it, as you may say no to anything I ask. I am the oldest thing in this world. I have never been tested. I should like, once, to be. Will you fight me?", 'The Wise One');
    yield say(E, "Fight - you? The Wise One? Vale's protector?", 'Garet');
    yield say(E, "Vale's protector. Whose protection sank the mountain and emptied the village. Yes. I should like to know what I am worth, against what you have become. And there is something I would give you for it, if you win. Something I cannot simply hand over; it has to be taken.", 'The Wise One');
    yield say(E, "He means it. I can feel it - he means every word.", 'Sheba');
    const r0 = yield* E.ask("Fight the Wise One?", null, ['Yes', 'Not now']); if (r0 !== 0) { yield say(E, "Then not now. I will be here.", 'The Wise One'); return; }
    yield say(E, "Good. Do not hold anything back. I will not.", 'The Wise One');
    Engine.doFlash(30, '#ffffff'); Audio.sfx('boom'); Engine.doShake(24);
    const r = yield* E.battle(['The Wise One'], { boss: true, canFlee: false, canLose: true, music: 'final' });
    const last = (typeof BattleScene !== 'undefined' && BattleScene.last) || null; const foe = last && last.enemies.find(e => e.name === 'The Wise One'); const dealt = foe ? foe.maxHp - foe.hp : 0;
    for (const m of G.party.members) m.fullRestore();
    if (r !== 'win' && dealt < 15000) { yield say(E, "(The party is on the stone, and the eye looks down at them.)"); yield say(E, "Not yet. You did not so much as make me feel it. Go, grow, and come back - I will still be here. I am always still here.", 'The Wise One'); return; }
    if (r !== 'win') { // beaten, but they hurt him past fifteen thousand - more than half of him: that was the test, and he pays for it (the user's rule)
      yield say(E, "(The party is down. The eye looks at them for a long moment - and the pressure lifts.)");
      yield say(E, "Enough. You did not win. You were never going to win - not yet. But you took " + dealt + " from me, and nothing in this world has ever taken a tenth of that. That was the test, whatever you thought it was.", 'The Wise One');
      yield say(E, "Here. This is yours. It was always going to be somebody's - and you have earned it as surely as if I lay in pieces.", 'The Wise One');
      G.set('wise_one_done');
    }
    else {
    G.set('wise_one_done'); G.set('wise_one_beaten');
    yield say(E, "(The eye dims, and brightens again, slower.)");
    yield say(E, "...Ah. So that is what it is like. I have wondered for a very long time.", 'The Wise One');
    yield say(E, "Are you - are you all right?", 'Mia');
    yield say(E, "I am the same as I was. A little wiser, which at my age is a rare thing. Here - this is yours. It was always going to be somebody's.", 'The Wise One');
    }
    yield* award(E, 'Eyes of Alchemy', "(The Eyes of Alchemy: two stones like the Wise One's own eye, cold and heavy and looking at something a long way off.)");
    yield say(E, "What are they?", 'Felix');
    yield say(E, "The way Alchemy came into this world. I have looked through them once, at the beginning, and never since. I do not know all of what they show, and I will not pretend to. Take them to Lemuria. King Hydros has read the oldest books there are, and his people were here when the first of it came through. He will know what to do with them - and whether you should.", 'The Wise One');
    yield say(E, "Lemuria. Hydros. We go home, then, in a manner of speaking.", 'Piers');
    yield say(E, "Go. And - Isaac. Felix. Thank you. Nobody has ever beaten me before. I find I am glad it was you.", 'The Wise One');
  };

  // ====================== King Hydros and the Eyes ======================
  ST.hydrosEyes = function* (E) {
    if (G.flag('cradle_open') || !G.inventory.has('Eyes of Alchemy')) return;
    Audio.play('lemuria');
    yield say(E, "Piers. And - all of you. You come back to us wearing the light of four beacons, and something else besides. Show me what you carry. I have felt it since your ship crossed the wall.", 'Hydros');
    yield say(E, "(Felix sets the Eyes of Alchemy down before the king. Hydros does not touch them for a long moment.)");
    yield say(E, "...The Eyes. The Wise One gave you these? Or you took them?", 'Hydros');
    yield say(E, "Both, he said. He said they had to be taken.", 'Isaac');
    yield say(E, "Then sit. All of you. This will take some time, and I have waited some centuries to say it to anyone who could use it. Kraden - you will want to remember this.", 'Hydros');
    yield say(E, "I always want to remember. Go on.", 'Kraden');
    yield say(E, "You have been told that Alchemy was sealed away by the ancients because men used it for war. That is true, and it is the smallest part of the truth. Alchemy was not born in this world. It came into it.", 'Hydros');
    yield say(E, "Came into it? From where?", 'Jenna');
    yield say(E, "From the Cradle. That is the word the oldest books use, and I have never found a better one. Another world - smaller than ours, older, and made not of stone and water and the rest but of the four powers themselves, before they were ever divided. In the beginning something crossed from there to here. Not one thing. Several.", 'Hydros');
    yield say(E, "The elements. The four elements are things? Beings?", 'Ivan');
    yield say(E, "Where they came from, they are. Here, they came apart. Earth and water and fire and wind, each with a will, each looking for a shape to wear. The places they came through are the places where Alchemy has always run strongest in this world: the four lighthouses were raised on them. The Djinn are what is left of their passing - small pieces, that took the shapes of small things.", 'Hydros');
    yield say(E, "The Djinn are... pieces of them.", 'Sheba');
    yield say(E, "Echoes. And every Adept who has ever lived carries a little of what they brought, in the blood. The ancients learned to use it, and built with it, and fought with it, and in the end they were so afraid of what they had built that they sealed it - the Stars in the sanctum, the beacons dark - and for a thousand years the world forgot it had ever had a door in it.", 'Hydros');
    yield say(E, "And the Wise One? Where does he come from, in all this?", 'Felix');
    yield say(E, "The Wise One was the first of them to cross, and the only one who stayed whole. He has guarded the door ever since - from both sides, I think. He gave you the Eyes because the door is no longer his to guard. You lit the beacons. Alchemy is loose. The way is open again, whether anyone walks it or not.", 'Hydros');
    yield say(E, "The way. You mean we could go there. To the Cradle.", 'Isaac');
    yield say(E, "That is what the Eyes are for. Activate them, here, where the water still remembers the crossing, and they will open the way. I will tell you what I know of what is on the other side, which is little. One land. No towns, no people, nothing that lives as we live. And the ones who did not cross. The ones who stayed whole.", 'Hydros');
    yield say(E, "Beings like the Wise One.", 'Mia');
    yield say(E, "Like him as a river is like the sea. He is one who left. They are the ones who stayed, and grew, and have had the whole of the four powers to themselves since before this world had a name. If you go, you will meet them. I do not think they will be pleased.", 'Hydros');
    yield say(E, "Then why go at all?", 'Garet');
    yield say(E, "Because the door is open, Garet, and what is on the other side of an open door comes through it sooner or later. Better that the first thing through it is you, with the light of four beacons on you, than that the first thing through it is them, with nothing to stop them. And because - I will be honest - I am a king of a people who have sat behind a wall for a thousand years, and I should like, before I die, to know what is on the other side of it.", 'Hydros');
    yield say(E, "He is right, you know. Whatever is there has been there since before Alchemy. It will not be weaker than the Wise One. It may be a great deal stronger.", 'Alex');
    yield say(E, "Coming from you, that is almost a warning.", 'Piers');
    yield say(E, "It is a warning. I have no wish to be the second thing through the door.", 'Alex');
    yield say(E, "Then it's decided. All ten of us. We didn't come this far to leave a door open behind us.", 'Isaac');
    const r = yield* E.ask("Activate the Eyes of Alchemy and open the way to the Cradle? (There is no coming back until whatever waits there is done with.)", null, ['Open the way', 'Not yet']);
    if (r !== 0) { yield say(E, "Then wait, and think. The Eyes will keep. Come back to me when you are ready.", 'Hydros'); return; }
    yield say(E, "(Felix lifts the Eyes. They open.)");
    Audio.sfx('beacon'); Engine.doFlash(40, '#ffffff'); yield E.shake(40);
    yield say(E, "(The water in the palace's channels stands up on end. Something in the air of the king's chamber folds, and keeps folding, and where it was there is a way - a swirl of every colour the four beacons burn, going a long way down.)");
    const M = G.field.map; M.objects.push({ kind: 'portal', x: 10, y: 8, id: 'cradle_portal', tile: 'whirlwind_big' }); M.exits.push({ x: 10, y: 8, w: 1, h: 1, to: 'cradle_shore', tx: 10, ty: 9, dir: DIR.UP }); M.finalize && M.finalize();
    G.set('cradle_open'); G.set('lemuria_palace:portal');
    yield say(E, "There. It will stay open as long as the Eyes are open, which is as long as you need. Step into it, and you are there. Step into it on the other side, and you are here.", 'Hydros');
    yield say(E, "Go carefully. Go together. And come back and tell an old king what you saw.", 'Hydros');
  };

  // ====================== the Cradle ======================
  ST.cradleArrive = function* (E) {
    if (G.flag('cradle_arrived')) return; G.set('cradle_arrived');
    yield say(E, "(A shore. The sand is not sand; it has the colour of every element at once and none of them. The sky is close and has no sun in it, and yet there is light everywhere, as if the ground were lit from below.)");
    yield say(E, "This is... I have no word for what this is.", 'Kraden');
    yield say(E, "It's quiet. There's nothing moving. Nothing at all.", 'Sheba');
    yield say(E, "Nothing has to move here. Everything already is what it will be. Do you feel it? The ground is - it is Venus, all the way down. That water is Mercury and nothing else.", 'Alex');
    yield say(E, "And the ones who stayed whole are somewhere in it. Let's find them before they find us.", 'Felix');
    yield say(E, "(One land, and four ways into it - west, north, east, and one in the middle that is closed. Whatever waits at the four goes first.)");
  };
  const cradleBoss = (name, flag, intro, taunt, after, item) => function* (E) {
    if (G.flag(flag)) return;
    Audio.play('anemos'); for (const line of intro) yield say(E, line[0], line[1]);
    const r = yield* E.battle([name], { boss: true, canFlee: false, music: 'fusiondragon' }); if (r !== 'win') return;   /* the Cradle's superbosses: the Fusion Dragon's theme (the user's rule) */
    G.set(flag); E.despawn('boss_' + name.toLowerCase());
    for (const line of after) yield say(E, line[0], line[1]);
    if (item) yield* award(E, item);
    if (['terragon_done', 'thalassa_done', 'ignis_done', 'zephyros_done'].every(f => G.flag(f)) && !G.flag('cradle_heart_open')) { G.set('cradle_heart_open'); yield say(E, "(Far off, at the centre of the land, something that was closed opens.)"); }
  };
  ST.cradleTerragon = cradleBoss('Terragon', 'terragon_done', [
    ["(The grove is stone that grew like trees. At its heart, something that was a hill stands up, and has a face.)"],
    ["Small things. Small warm things, with our blood in them. You have the smell of the one who left.", 'Terragon'],
    ["We came through the door. We came to see what was on the other side of it.", 'Isaac'],
    ["The door was closed for a reason, small thing. The one who left closed it. He was always the weak one - he wanted to be worn. To be a river, a stone, a field. To be USED. We stayed whole.", 'Terragon'],
    ["And what did staying whole get you? A grove with nothing in it.", 'Garet'],
    ["...Let us see what being worn got you.", 'Terragon'],
  ], null, [
    ["(The hill sits back down and is a hill.)"],
    ["...Warm things. Perhaps he was not the weak one after all.", 'Terragon'],
    ["It's leaving something behind. Like a Djinni does.", 'Felix'],
  ], 'Terra Band');
  ST.cradleThalassa = cradleBoss('Thalassa', 'thalassa_done', [
    ["(A deep that has no bottom, and the water of it is the only water there is. It rises, and takes the shape of a serpent because that is the shape the small warm things fear.)"],
    ["Mercury blood. Two of you - three. One of you had the whole of the Golden Sun in him and let it go. I can taste where it was.", 'Thalassa'],
    ["I put it down. I was talked into it.", 'Alex'],
    ["Then you are the strangest thing that has ever crossed the door. Come. Show me what a thing that puts power DOWN can do.", 'Thalassa'],
  ], null, [
    ["(The serpent comes apart into rain, and the rain is only water.)"],
    ["...Strange. Strange, and not weak. Take the scale. Tell the one who left that the sea remembers him.", 'Thalassa'],
  ], 'Tide Ring');
  ST.cradleIgnis = cradleBoss('Ignis', 'ignis_done', [
    ["(The forge is a mountain turned inside out: the fire is outside and the stone is in it, and the fire has been waiting.)"],
    ["Mars blood! Prox blood, and Vale blood. Good. GOOD. The others talk. I do not talk. Burn or do not.", 'Ignis'],
    ["Finally, one who gets to the point.", 'Jenna'],
  ], null, [
    ["(The fire goes down to a bed of cinders, and the cinders are content.)"],
    ["...Good. Good. Take the cinder. It will burn for you now.", 'Ignis'],
  ], 'Ember Seal');
  ST.cradleZephyros = cradleBoss('Zephyros', 'zephyros_done', [
    ["(A spire with nothing around it but sky, and the sky is moving. The wind has wings.)"],
    ["Jupiter's children. You fell from the sky once, little one - I felt it. And you, the reader of minds. Read this one. I dare you.", 'Zephyros'],
    ["...I can't. There's nothing in it but wind. It doesn't think - it only moves.", 'Sheba'],
    ["Then move with it, or be moved.", 'Zephyros'],
  ], null, [
    ["(The wind lies down. A single feather, that weighs nothing, is left on the spire.)"],
    ["...You moved with it. Take the feather. The sky is yours to fall from as often as you like.", 'Zephyros'],
  ], 'Gale Charm');
  ST.cradleAlkahest = function* (E) {
    if (G.flag('alkahest_done')) return;
    Audio.play('final');
    yield say(E, "(The heart of the land. Not a place so much as the point every place here is measured from. Something waits in it that is all four of the others and none of them - a shape of gold, and a light that does not come from anywhere.)");
    yield say(E, "The four are down. The four were always going to go down, one day, to somebody. I am not the four. I am what they were before they were four, and I have been here since before there was a here.", 'Alkahest');
    yield say(E, "The first Alchemist... The books call it the Alkahest. The thing that dissolves everything into what it was made of.", 'Kraden');
    yield say(E, "Your books are very small. But yes. I unmake. It is what I am for. Everything that crossed the door was made from me, and everything made from me comes back to me, in time. The one who left will. Your world will. You will.", 'Alkahest');
    yield say(E, "Not today.", 'Isaac');
    yield say(E, "Ten of you. Two of you have held the Golden Sun and let it go. One of you is nothing but a scholar and stands here anyway. Every one of you has been the strongest thing in your world and come looking for something stronger. I have never been so interested in anything.", 'Alkahest');
    yield say(E, "Then we'll try not to disappoint you.", 'Felix');
    yield say(E, "You will not. Come. Let us find out what you are made of. I mean that exactly.", 'Alkahest');
    Engine.doFlash(40, '#ffffff'); Audio.sfx('boom'); Engine.doShake(40);
    const r = yield* E.battle(['Alkahest'], { boss: true, canFlee: false, music: 'fusiondragon' }); if (r !== 'win') return;
    G.set('alkahest_done'); E.despawn('boss_alkahest');
    yield say(E, "(The gold does not go out. It goes still, and for the first time since before there was a here, it is looking at something outside itself.)");
    yield say(E, "...Made of that. I see. I could not have unmade that if I had had another age to try.", 'Alkahest');
    yield say(E, "Is it - over? Is it beaten?", 'Mia');
    yield say(E, "It cannot be beaten. It can be shown something it did not know. I think that is what just happened to it.", 'Alex');
    yield say(E, "Take what I leave. The crown is what the four wore before they were four. The stone is what every alchemist in your world ever looked for, and none of them would have known what to do with it. You might.", 'Alkahest');
    yield* award(E, 'Alkahest Crown'); yield* award(E, "Philosopher's Stone");
    yield say(E, "And go home, small warm things. The door will stay open, because it cannot be closed now; but nothing here will come through it. There is nothing here that is stronger than what just walked in.", 'Alkahest');
    G.set('cradle_done');
    yield say(E, "(The Cradle is quiet. Everything that lives in it has been met, and answered.)");
    if (ST.cradleRift) yield* ST.cradleRift(E);   /* the rift, and the Complete Saga's roll (js/game/endings.js) */
  };
}
