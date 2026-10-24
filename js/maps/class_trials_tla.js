// ---------- The Lost Age: where the class items are found ----------
// Twelve of the twenty-two class items (js/data/class_items.js) belong to Felix's journey. Six are taught by people
// who want a fight first (Pupetta in Madra, Redbeard at Champa's dock, Susa at Izumo, Whitefeather in Shaman Village,
// Vorn in Loho, Kaldr in Prox); six sit behind bosses in places of their own: the Scorpion Den under Yampi's sand,
// the vault under Lemuria, the observatory the Anemos left above Contigo, and - for the optional block before the
// Mars aerie - the Halls of Time under the Sea of Time (Dive), the Frostwyrm's hollow past the Mars Lighthouse
// (Warmth), and Weyard's Edge behind Atteka Cavern, where the Void Sovereign is the hardest fight in either game.
'use strict';
{
  const T3 = STORY_TLA;
  const strs = (rows) => rows.map(r => typeof r === 'string' ? r : r.join(''));
  const SANDC = { '.': 'cave_sand', ',': 'cave_pebbles', 'o': { ground: 'cave_sand', obj: 'rock_sand' }, 'p': 'chasm', '~': 'water', 'L': { ground: 'cave_sand', obj: 'ladder', walk: true } };
  const STONE = { '.': 'floor_stone', ',': 'floor_tile', '~': 'water', 'p': 'pit', 's': 'snow', 'i': 'ice' };
  const SNOWC = { '.': 'snow', ',': 'cave', 'o': { ground: 'snow', obj: 'rock_snow' }, 'p': 'chasm', 'i': 'ice' };
  // (idempotent: the test kit re-runs this file; each host keeps one list of this file's additions, replaced on a re-run)
  for (const def of Object.values(MAPS)) if (def._classPatches && def._classPatches.tla) def._classPatches.tla = [];
  const patch = (id, fn) => { const def = MAPS[id]; if (!def) { console.warn('class trials: no host map', id); return; } if (!def._classPatches) { const orig = def.build; def._classPatches = {}; def.build = function (M) { if (orig) orig.call(this, M); for (const list of Object.values(def._classPatches)) for (const f of list) f(M); }; } (def._classPatches.tla = def._classPatches.tla || []).push(fn); };
  const caveDoor = (M, x, y, to, tx, ty, opts) => { M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, Object.assign({ door: true }, opts || {})); };
  const back = (M, x, y, w, to, tx, ty, dir) => { M.walkable(x, y, w, 1); M.exit(x, y, w, 1, to, tx, ty, dir === undefined ? DIR.DOWN : dir); };
  const award = function* (E, item, line) { Audio.sfx('levelup'); Engine.doFlash(10, '#ffe080'); yield E.give(item); if (line) yield E.say(line); };
  // a teacher: a fight, win or lose; the item only for a win
  const teacher = (id, name, opts) => function* (E) {
    if (G.flag(id + '_done')) { yield E.say(opts.after, name); return; }
    if (opts.cond && !opts.cond()) { yield E.say(opts.notYet, name); return; }
    for (const line of opts.intro) yield E.say(line, name);
    const r = yield* E.ask(opts.ask, null, ['Yes', 'Not now']); if (r !== 0) return;
    const b = yield* ClassExt.crewBout(E, name, ClassExt.CREWS[name] || [], { boss: true, canFlee: false, canLose: true, music: 'bosshuman' });
    for (const m of G.party.members) m.fullRestore();
    if (b !== 'win') { yield E.say(opts.lost, name); return; }
    G.set(id + '_done'); yield* award(E, opts.item, opts.won); if (opts.tail) yield E.say(opts.tail, name);
  };

  // ====================== the Scorpion Den (the Nomad's Veil) ======================
  // under the third sweep of Yampi's desert: the queen of the scorpions that trouble the caravans, and the veil of the
  // nomad she took. Drifts of sand fill the side passage (Sandstorm, later).
  const SD = strs([
    '######################',
    '#....................#',
    '#..o........,......o.#',
    '#....................#',
    '#######.##############',
    '#.....#.#............#',
    '#.....#.#..........o.#',
    '#.....#.#............#',
    '#.....#.#............#',
    '#.....#.#########.####',
    '#.....#........#.....#',
    '#.....#........#.....#',
    '#....................#',
    '#.....#..,.....#.....#',
    '######################'
  ]);
  defineMap('scorpion_den', {
    name: 'Scorpion Den', w: 22, h: 15, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry: { x: 10, y: 13 }, retreat: { map: 'yampi_3', x: 9, y: 2, dir: DIR.DOWN },
    enc: [['Momonga', 'Momonga'], ['Dino'], ['Numb Ant', 'Punch Ant'], ['Mummy']],
    build(M) {
      M.paint(0, 0, SD, SANDC, { cliff: '#', set: 'sandcliff', faces: 2 });
      back(M, 9, 14, 3, 'yampi_3', 9, 2, DIR.DOWN);
      // the hall at the bottom; two shafts up to the top gallery, and two side chambers behind drifts of sand (Sandstorm, later)
      M.object('pillar', 7, 4, { id: 'sd_pillar', poundable: true });   // the pillar in the shaft's mouth: Pound it flat, and the shaft is the way up
      ClassExt.sandDrift(M, 6, 12); ClassExt.sandDrift(M, 15, 12);   // the drifts that fill the side chambers' doors (Sandstorm, later)
      M.chest(3, 6, 'Lucky Medal', 1); M.chest(18, 10, 'Star Dust', 1); M.chest(2, 2, 'Vial', 1); M.chest(19, 2, 'Sleep Bomb', 1); M.chest(18, 6, 'Elixir', 1);
      M.boss('Scorpion Queen', 12, 2, { id: 'boss_scorpion_queen', done: 'scorpion_queen_done', script: T3.scorpionQueen });
      M.trigger(9, 12, 3, 2, function* (E) { yield E.say("A den under the sand. The caravans lose a camel a season to what lives here - and a nomad's veil hangs from the roof of it, they say, taken with its wearer.", 'Kraden'); }, { once: 'sd_seen' });
      M.sign(9, 12, 'The pillar in the shaft is the way up. The side chambers are full of sand.');
    }
  });
  T3.scorpionQueen = function* (E) {
    if (G.flag('scorpion_queen_done')) return;
    Audio.play('boss'); yield E.say("(The queen of the den unfolds from the sand, a veil of dark cloth caught on her tail.)");
    const r = yield* E.battle(['Scorpion Queen'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('scorpion_queen_done'); E.despawn('boss_scorpion_queen');
    yield* award(E, "Nomad's Veil", "(The veil, shaken free of sand. The Nomad line - and Sandstorm, for the drifts that fill the side chambers here.)");
  };
  patch('yampi_3', (M) => { caveDoor(M, 9, 1, 'scorpion_den', 10, 13); });

  // ====================== Pupetta's cellar (the Puppeteer's Strings) ======================
  // Madra's puppeteer keeps her theatre in a cellar: a doll on a stand, a switch across a floor the party cannot cross
  const PC = strs([
    '##############',
    '#............#',
    '#pppppppppppp#',
    '#pppppppppppp#',
    '#pppppppppppp#',
    '#............#',
    '#.....,......#',
    '##############'
  ]);
  defineMap('madra_theatre', {
    name: "Pupetta's Theatre", w: 14, h: 8, base: 'void', music: 'town', bg: 'temple', indoor: true, entry: { x: 6, y: 6 }, retreat: { map: 'madra_house1', x: 10, y: 3, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, PC, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 5, 7, 3, 'madra_house1', 10, 3, DIR.DOWN);
      // the doll stands on the far side of the pit; the switch is beside it; the chest opens when it is pressed
      ClassExt.doll(M, 6, 1, 'pupetta_doll'); ClassExt.floorSwitch(M, 11, 1, function* (E) { yield E.say('The doll stands on the switch - and a panel in the near wall slides open.'); G.set('theatre_open'); const Mp = G.field.map; Mp.setObj(12, 5, 'chest'); Mp.chests.push({ x: 12, y: 5, item: 'Lucky Medal', qty: 1, key: 'madra_theatre:chest:12,5' }); Mp.finalize(); });
      if (G.flag('theatre_open')) M.chest(12, 5, 'Lucky Medal', 1);
      M.sign(1, 5, "Pupetta's theatre. The doll walks where the strings say; the party stays on this side.");
    }
  });
  patch('madra_house1', (M) => {
    M.npc('pupetta', 12, 2, { type: 'villager_f', name: 'Pupetta', look: npcLook('noble_f', 4), script: teacher('pupetta', 'Pupetta', {
      cond: () => G.flag('cyclone_got'), notYet: "Come back when the town has stopped shaking, dear. A puppeteer needs a quiet stage.", after: "Walk the doll gently. It has feelings, in its way.",
      intro: ["Pupetta, of the strings. I play the puppet theatre for Madra's children - and for anyone who will pay, once, to see what strings can do to a grown man.", "The strings teach a class, you know. But I give them only to someone who can beat my dolls - and my dolls fight as I do."],
      ask: "Fight Pupetta for the strings?", lost: "Tangled already? Come and see me again.", item: "Puppeteer's Strings", won: "(The silk strings, warm with Psynergy. The Puppeteer line - and Puppet, which walks a doll where the party cannot go. Her theatre is down the stairs.)", tail: "There's a doll on a stand in my theatre, down the stairs. Walk it onto the switch and see what the stage keeps."
    }) });
    M.setObj(10, 2, 'stairs_down'); M.walkable(10, 2); M.exit(10, 2, 1, 1, 'madra_theatre', 6, 6, DIR.UP, { stairs: true, cond: () => G.flag('pupetta_done') });
  });

  // ====================== Redbeard (the Pirate's Bandana) ======================
  patch('champa', (M) => {
    M.npc('redbeard', 25, 35, { type: 'villager_m', name: 'Redbeard', look: npcLook('pirate', 11), script: teacher('redbeard', 'Redbeard', {
      cond: () => G.flag('trident_forged') || G.flag('champa_alex'), notYet: "Briggs' guests. Come and find me once the old woman has finished with her forge; I've a bandana to lose, and I'd sooner lose it to someone who can use it.", after: "Dive deep, and come up with something.",
      intro: ["Redbeard. Marooned, they call it - I call it retired. Briggs's father sailed with me, before the boy took the ship out from under both of us.", "This bandana's the last of my crew. It teaches the trade: the cutlass, the broadside, and how to go under the water and come up somewhere else. Beat me on the dock and it's yours."],
      ask: "Fight Redbeard for the bandana?", lost: "Ha! Salt in your eyes. Again, when you're dry.", item: "Pirate's Bandana", won: "(The red bandana. The Corsair line - and Dive, for the slow rings on deep water: there is one off the Sea of Time islet, they say.)", tail: "There's a ring of slow water off the islet in the Sea of Time. Something is down there that no one has come up with."
    }) });
  });

  // ====================== Susa (the Dancer's Anklet) ======================
  patch('izumo', (M) => {
    M.npc('susa_spar', 24, 5, { type: 'villager_m', name: 'Susa', look: NPC_LOOKS.Susa, script: teacher('susa', 'Susa', {
      cond: () => G.flag('serpent_done'), notYet: "The Serpent first, Felix. Then we will talk about dancing.", after: "The festival is yours as much as ours now. Ring the chimes when you pass them.",
      intro: ["Felix. I owe you the Serpent - and my life, I think. Kushinada says a debt like that is paid with a dance.", "The anklet is the festival's: it teaches the Kagura, the sword dance, the veil step. I will give it to you the way it was given to me: after a bout. Hold nothing back."],
      ask: "Spar with Susa for the anklet?", lost: "You dance well. Not well enough. Again.", item: "Dancer's Anklet", won: "(The anklet of bells. The Dancer line - and Rhythm, which rings the chimes of Izumo's shrine and any others.)", tail: null
    }) });
    // the three chimes on the shrine's terrace: rung all three, the shrine's keeper gives what the festival keeps
    for (const [x, y] of [[20, 5], [21, 5], [27, 5]]) ClassExt.chime(M, x, y, function* (E) { const rung = G.field.map.objects.filter(o => o.kind === 'chime' && o.state === 'rung').length; if (rung >= 3 && !G.flag('izumo_chimes')) { G.set('izumo_chimes'); yield E.say('The third chime rings, and the three ring together. From under the terrace something rolls to the party\'s feet.'); yield E.give('Kikuichimonji'); } else yield E.say('The chime rings. ' + (3 - rung) + ' more.'); });
  });

  // ====================== the Sunken Vault (the Lemurian Circlet) ======================
  // under Lemuria's harbour: the vault of the kings, drowned when the city sank. A tidal hall (Ebb, later) and the Leviathan's spawn.
  const SV = strs([
    '########################',
    '###..................###',
    '#..#................#..#',
    '#..#................#..#',
    '#..#................#..#',
    '#..#................#..#',
    '#......................#',
    '#########.......########',
    '#......................#',
    '#......................#',
    '#......................#',
    '#~~~~~~~~~~~~~~~~~~~~~~#',
    '#......................#',
    '#..........,...........#',
    '########################'
  ]);
  defineMap('sunken_vault', {
    name: 'Sunken Vault', w: 24, h: 15, base: 'void', music: 'lemuria', bg: 'cave', indoor: true, entry: { x: 11, y: 13 }, retreat: { map: 'lemuria', x: 9, y: 3, dir: DIR.DOWN },
    enc: [['Gillman', 'Gillman'], ['Sea Dragon'], ['Aqua Jelly', 'Aqua Jelly'], ['Gillman Lord']],
    build(M) {
      M.paint(0, 0, SV, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 10, 14, 3, 'lemuria', 9, 3, DIR.DOWN);
      // the pool between the lower hall and the vault: a pillar to Move into it, and the tide standing over the steps beyond (Ebb, later)
      M.object('pillar', 4, 12, { id: 'sv_pillar' });   // pushed up into the channel, it is the one dry step across
      ClassExt.tide(M, 1, 5, 2, 5); ClassExt.tide(M, 21, 5, 22, 5);   // the two side alcoves' steps, under the tide (Ebb, later)
      M.chest(1, 3, 'Mythril Silver', 1); M.chest(2, 3, 'Water of Life', 1); M.chest(21, 3, 'Psy Crystal', 1); M.chest(22, 3, 'Dark Matter', 1); M.chest(11, 1, 'Lucky Medal', 1);
      M.boss('Leviathan Spawn', 11, 3, { id: 'boss_leviathan', done: 'leviathan_done', script: T3.leviathanSpawn });
      M.trigger(10, 12, 3, 2, function* (E) { yield E.say("The vault of Lemuria's kings, drowned when the city sank. The channel across the hall: a pillar pushed into it would be a step - and the water in the alcoves beyond will not go out for us.", 'Piers'); }, { once: 'sv_seen' });
    }
  });
  T3.leviathanSpawn = function* (E) {
    if (G.flag('leviathan_done')) return;
    Audio.play('boss'); yield E.say("(The water of the vault heaves, and something the length of the hall lifts its head out of it. On its brow, a circlet.)");
    const r = yield* E.battle(['Leviathan Spawn'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('leviathan_done'); E.despawn('boss_leviathan');
    yield* award(E, 'Lemurian Circlet', "(The circlet, cold and wet. The Tide line - and Ebb, which draws the water out of a tidal room for a while: the steps at the back of this hall, for one.)");
  };
  patch('lemuria', (M) => { caveDoor(M, 9, 2, 'sunken_vault', 11, 13); M.setObj(9, 2, 'stairs_down'); M.sign(10, 3, 'The old vault. Flooded. Keep out.'); });

  // ====================== Whitefeather (the Shaman's Drum) ======================
  patch('shaman', (M) => {
    M.npc('whitefeather', 18, 8, { type: 'villager_m', name: 'Whitefeather', look: npcLook('elder', 6), script: teacher('whitefeather', 'Whitefeather', {
      cond: () => G.flag('moapa_trial') || G.flag('trial_road_won'), notYet: "Moapa's road first. The drum is for those who have walked it.", after: "The dead are patient. Listen to them.",
      intro: ["Whitefeather. I was the village's shaman before Moapa's father was born. This drum called the spirits for sixty winters.", "It will teach you their calling - and to see the ones who still stand among us. But a drum answers a strong hand. Show me yours."],
      ask: "Fight Whitefeather for the drum?", lost: "The spirits are not ready for you. Nor you for them.", item: "Shaman's Drum", won: "(The painted drum. The Spiritcaller line - and Spirit Sight, for the dead who still wait to be spoken to.)", tail: "One of them waits by the hut at the bottom of the village. He has waited a long time."
    }) });
    ClassExt.spirit(M, 'sv_ghost', 20, 8, { type: 'villager_m', name: 'Spirit', text: null, script: function* (E) { if (G.flag('sv_ghost_done')) { yield E.say('...thank you...', 'Spirit'); return; } yield E.say('...you see me. Nobody has, since the winter I did not come back from the road...', 'Spirit'); yield E.say('...my medal. Under the snow, where I fell. Take it - it never brought me luck...', 'Spirit'); G.set('sv_ghost_done'); yield E.give('Lucky Medal'); yield E.give('Water of Life'); } });
  });

  // ====================== Vorn (the Mad Alchemist's Vial) ======================
  patch('loho_house5', (M) => {
    M.npc('vorn', 7, 2, { type: 'villager_m', name: 'Vorn', look: npcLook('elder', 9), script: teacher('vorn', 'Vorn', {
      cond: () => true, notYet: '', after: "Lead into gold, stone into a crate. Never the other way, mind.",
      intro: ["Vorn. Alchemist - the real kind, not the kind that lights beacons. Kraden, is it? I read your monograph on the Lighthouses. Wrong in every particular.", "This vial is my life's work: transmutation, distilled. I will give it to you if you can survive drinking what is in the other one. Or fighting me. Fighting me is safer."],
      ask: "Fight Vorn for the vial?", lost: "Volatile, wasn't it. Come back when you've settled.", item: "Mad Alchemist's Vial", won: "(The vial, which will not stop moving. The Alchemist line - and Transmute: one thing into another. The two lead statues by the wall, for a start.)", tail: null
    }) });
    ClassExt.leadStatue(M, 2, 2, { id: 'vorn_lead1', gold: 800 }); ClassExt.leadStatue(M, 4, 2, { id: 'vorn_lead2', gold: 800 });
  });

  // ====================== the Anemos Observatory (the Oracle's Eye) ======================
  // above Contigo, on the shelf the city rose from: the observatory the Anemos left, and a mirror that kept Hama's likeness
  const AO = strs([
    '####################',
    '#..,,,,,,,,,,,,,,..#',
    '#..,............,..#',
    '#..,....####....,..#',
    '#..,....#..#....,..#',
    '#..,....#.##....,..#',
    '#..,............,..#',
    '#..,,,,,,,,,,,,,,..#',
    '#########.##########',
    '#..................#',
    '#........,.........#',
    '####################'
  ]);
  defineMap('anemos_observatory', {
    name: 'Anemos Observatory', w: 20, h: 12, base: 'void', music: 'anemos', bg: 'temple', indoor: true, entry: { x: 9, y: 10 }, retreat: { map: 'contigo', x: 12, y: 2, dir: DIR.DOWN },
    enc: [['Wonder Bird'], ['Soul Army', 'Soul Army'], ['Grave Wight']],
    build(M) {
      M.paint(0, 0, AO, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 8, 11, 3, 'contigo', 12, 2, DIR.DOWN);
      M.walkable(9, 8); M.object('leaves', 9, 8, { id: 'ao_growth' });   // the doorway grown over: Cyclone
      ClassExt.bars(M, 9, 5); M.chest(9, 4, 'Dark Matter', 1);   // the alcove behind bars (Shadow Step)
      M.chest(2, 2, 'Sylph Feather', 1); M.chest(17, 2, 'Psy Crystal', 1);
      M.boss("Hama's Shade", 9, 2, { id: 'boss_hama_shade', done: 'hama_shade_done', script: T3.hamaShade, look: NPC_LOOKS.Hama });
      M.trigger(8, 9, 3, 2, function* (E) { yield E.say('The observatory. From here the Anemos watched the sky before they went into it. Something still watches from the mirror at the far end.', 'Sheba'); }, { once: 'ao_seen' });
    }
  });
  T3.hamaShade = function* (E) {
    if (G.flag('hama_shade_done')) return;
    yield E.say("(A figure steps out of the mirror wearing Hama's face and Hama's robes - and an eye of glass where one of hers should be.)");
    yield E.say("I am what the mirror kept of her. Take the eye, if you can see far enough ahead to.", "Hama's Shade");
    Audio.play('boss'); const r = yield* E.battle(["Hama's Shade"], { boss: true, canFlee: false, music: 'bosshuman' }); if (r !== 'win') return;
    G.set('hama_shade_done'); E.despawn('boss_hama_shade');
    yield* award(E, "Oracle's Eye", "(The eye of glass. The Augur line - and Scry, which uncovers everything hidden on a floor at once.)");
  };
  patch('contigo', (M) => { caveDoor(M, 12, 1, 'anemos_observatory', 9, 10, { cond: () => G.flag('jupiter_done') }); M.setObj(12, 1, 'door_stone'); M.sign(13, 2, 'The observatory. The stair is sealed until the Lighthouse burns.'); });

  // ====================== Kaldr (the Warlord's Helm) ======================
  patch('prox_house8', (M) => {
    M.npc('kaldr', 7, 2, { type: 'villager_m', name: 'Kaldr', look: npcLook('guard', 13), script: teacher('kaldr', 'Kaldr', {
      cond: () => G.flag('puelle_done') || G.flag('prox_council'), notYet: "Puelle first. Then we will see what the south sends us.", after: "The blizzard past the Lighthouse. Nothing else in the north is worth the helm.",
      intro: ["Kaldr. Champion of Prox, for what the title is worth with the world's edge at the door. Saturos held it before me.", "The helm was his. It teaches the warlord's way - and the warmth that walks a blizzard: there is one past the Lighthouse that nobody has walked through. Beat me, and it is yours."],
      ask: "Fight Kaldr for the helm?", lost: "The cold has you. Warm up, and come again.", item: "Warlord's Helm", won: "(The war helm of Prox. The Frostborn line - and Warmth, which carries the party through a blizzard for a while: the one in the hollow past the Mars Lighthouse.)", tail: null
    }) });
  });

  // ====================== the Halls of Time (the Chronos Sigil) ======================
  // under the Sea of Time islet, through the slow ring off its shore (Dive): the Halls where Lemuria's kings kept time itself
  const HT = strs([
    '######################',
    '#....................#',
    '#..,,,,,,,,,,,,,,,,..#',
    '#..,..............,..#',
    '#..,..............,..#',
    '#..,,,,,,,,,,,,,,,,..#',
    '#....................#',
    '#pppppppppp..pppppppp#',
    '#....................#',
    '#..........,.........#',
    '#.........L..........#',
    '######################'
  ]);
  defineMap('halls_of_time', {
    name: 'Halls of Time', w: 22, h: 12, base: 'void', music: 'lemuria', bg: 'temple', indoor: true, entry: { x: 10, y: 10 }, retreat: { map: 'sea_of_time_islet', x: 2, y: 3, dir: DIR.DOWN },
    enc: [['Ocean Dragon'], ['Cruel Dragon'], ['Druj', 'Druj']],
    build(M) {
      M.setObj(10, 10, 'ladder'); M.walkable(10, 10); M.exit(10, 10, 1, 1, 'sea_of_time_islet', 2, 3, DIR.DOWN, { stairs: true });
      M.paint(0, 0, HT, STONE, { cliff: '#', set: 'cavern', faces: 1 }); M.setObj(10, 10, 'ladder'); M.walkable(10, 10);
      M.chest(3, 3, 'Orihalcon', 1); M.chest(18, 3, 'Dark Matter', 1);
      ClassExt.spirit(M, 'ht_ghost', 4, 9, { type: 'elder', name: 'King', script: function* (E) { yield E.say('...the Eye keeps the hour. It has kept it since I sat the throne. Take the sigil from it, and the hours are yours...', 'King'); } });
      M.boss('Eye of Chronos', 11, 3, { id: 'boss_chronos', done: 'chronos_done', script: T3.eyeOfChronos });
      M.trigger(9, 9, 3, 2, function* (E) { yield E.say("The Halls of Time. Under the islet, under the sea: where Lemuria's first kings kept the hours. The gap across the floor has a way over it in the middle.", 'Piers'); }, { once: 'ht_seen' });
    }
  });
  T3.eyeOfChronos = function* (E) {
    if (G.flag('chronos_done')) return;
    Audio.play('boss'); yield E.say("(An eye the size of a shield opens at the far end of the hall, and the hour stops.)");
    const r = yield* E.battle(['Eye of Chronos'], { boss: true, canFlee: false, music: 'boss' }); if (r !== 'win') return;
    G.set('chronos_done'); E.despawn('boss_chronos');
    yield* award(E, 'Chronos Sigil', "(A sigil that ticks like a heart. The Chronomancer line: Stasis, Haste, Rewind, and at the last, the End of Days.)");
  };
  patch('sea_of_time_islet', (M) => {
    // the slow ring of water off the shore: the first water cell beside walkable ground near the islet's west shore
    let spot = null; for (let y = 1; y < M.h - 1 && !spot; y++) for (let x = 1; x < M.w - 1 && !spot; x++) { if (!M.get(x, y).water) continue; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (M.inb(nx, ny)) { const t = M.get(nx, ny), ot = M.getObj(nx, ny); if (t && !t.solid && !t.water && !(ot && ot.solid)) { spot = [x, y]; break; } } } }
    if (spot) ClassExt.diveSpot(M, spot[0], spot[1], { map: 'halls_of_time', x: 10, y: 9 }, 'sot_dive');
  });

  // ====================== the Frostwyrm Hollow (the Dragon Scale Amulet) ======================
  // past the Mars Lighthouse's foot: a hollow in the ice where the eldest of the frost dragons sleeps, behind a blizzard
  // nobody has walked through (Warmth - Kaldr's helm). Harder than Dullahan.
  const FH = strs([
    '######################',
    '#....................#',
    '#..o..............o..#',
    '#....................#',
    '#....................#',
    '#######........#######',
    '#.....#........#.....#',
    '#.....#........#.....#',
    '#.....#..,.....#.....#',
    '#.....#........#.....#',
    '#.....#........#.....#',
    '#.....#........#.....#',
    '#.....###....###.....#',
    '#....................#',
    '#..........,.........#',
    '######################'
  ]);
  defineMap('frostwyrm_hollow', {
    name: 'Frostwyrm Hollow', w: 22, h: 16, base: 'void', music: 'marslh', bg: 'ice', indoor: true, entry: { x: 11, y: 14 }, retreat: { map: 'mars_lh_1', x: 17, y: 6, dir: DIR.DOWN },
    enc: [['Blue Dragon'], ['Fire Dragon', 'Winged Lizard'], ['Sky Dragon']],
    build(M) {
      M.paint(0, 0, FH, SNOWC, { cliff: '#', set: 'snowcliff', faces: 2 });
      back(M, 10, 15, 3, 'mars_lh_1', 17, 6, DIR.DOWN);
      ClassExt.blizzard(M, 7, 6, 14, 11);   // the blizzard fills the middle chamber: Warmth walks it
      M.chest(2, 13, 'Water of Life', 1); M.chest(19, 13, 'Psy Crystal', 1); M.chest(2, 1, 'Orihalcon', 1); M.chest(19, 1, 'Dark Matter', 1);
      M.boss('Elder Frost Dragon', 11, 2, { id: 'boss_frostwyrm', done: 'frostwyrm_done', script: T3.elderFrostDragon });
      M.trigger(10, 13, 3, 2, function* (E) { yield E.say("The hollow. The blizzard in the middle of it is the one Kaldr meant: nobody walks through that without something to keep the warmth in them.", 'Kraden'); }, { once: 'fh_seen' });
    }
  });
  T3.elderFrostDragon = function* (E) {
    if (G.flag('frostwyrm_done')) return;
    Audio.play('final'); yield E.say("(The ice at the back of the hollow is not ice. It opens an eye older than Prox, and the whole hollow groans as it rises.)");
    yield E.say("It wears a scale on a chain round its neck - a dragon's own. Whoever takes that off it will be a dragon knight in all but name.", 'Kraden');
    const r = yield* E.battle(['Elder Frost Dragon'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('frostwyrm_done'); E.despawn('boss_frostwyrm');
    yield* award(E, 'Dragon Scale Amulet', "(The scale, warm to the touch. The Dragon Knight line - and somewhere south, past the edge of Atteka, something felt the old dragon fall.)");
  };
  patch('mars_lh_1', (M) => { caveDoor(M, 17, 5, 'frostwyrm_hollow', 11, 14, { cond: () => G.flag('teleportUnlocked') || G.flag('puelle_done') }); M.sign(18, 6, 'The hollow. A blizzard fills it that never stops.'); });

  // ====================== Weyard's Edge (the Void Mantle) ======================
  // behind Atteka Cavern, at the continent's south tip, where the world crumbles into nothing: the Void Sovereign,
  // the hardest fight in either game, stirs only once the Elder Frost Dragon has fallen
  const WE = strs([
    '########################',
    '#pppppppppppppppppppppp#',
    '#pppp..............pppp#',
    '#ppp................ppp#',
    '#pp..................pp#',
    '#pp..................pp#',
    '#ppp................ppp#',
    '#pppp..............pppp#',
    '#pppppp..........pppppp#',
    '#ppppppppp....ppppppppp#',
    '#ppppppppp....ppppppppp#',
    '#ppppppppp.,..ppppppppp#',
    '########################'
  ]);
  defineMap('weyard_edge', {
    name: "Weyard's Edge", w: 24, h: 13, base: 'void', music: 'anemos', bg: 'cave', indoor: true, dark: true, darkLevel: 0.5, entry: { x: 11, y: 11 }, retreat: { map: 'atteka_cavern', x: 16, y: 5, dir: DIR.DOWN },
    enc: [],
    build(M) {
      M.paint(0, 0, WE, STONE, { cliff: '#', set: 'cavern', faces: 1 });
      back(M, 10, 12, 4, 'atteka_cavern', 16, 5, DIR.DOWN);
      M.chest(6, 4, 'Orihalcon', 1); M.chest(17, 4, 'Dark Matter', 1);
      M.boss('Void Sovereign', 11, 3, { id: 'boss_void', done: 'void_done', script: T3.voidSovereign });
      M.trigger(10, 10, 4, 2, function* (E) { yield E.say("The edge. Past this there is nothing at all - and something stands on the nothing and looks back at us.", 'Felix'); }, { once: 'we_seen' });
    }
  });
  T3.voidSovereign = function* (E) {
    if (G.flag('void_done')) return;
    Audio.play('final'); yield E.say("(It has no face, only a mantle woven of the dark past the edge, and under the mantle nothing. The nothing speaks.)");
    yield E.say("The wyrm fell, so you come to me. Good. The world ends here; let us see if you do.", 'Void Sovereign');
    const r = yield* E.battle(['Void Sovereign'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('void_done'); E.despawn('boss_void');
    yield* award(E, 'Void Mantle', "(The mantle, weightless and cold. The Void line: beyond anything else in either world.)");
  };
  patch('atteka_cavern', (M) => { caveDoor(M, 16, 4, 'weyard_edge', 11, 11, { cond: () => G.flag('frostwyrm_done') }); M.trigger(15, 5, 3, 1, function* (E) { if (G.flag('frostwyrm_done')) return; yield E.say('A crack in the back wall of the cavern, and past it a cold that is not the cold of stone. Something in the dark beyond it sleeps still.'); }, { cond: () => !G.flag('frostwyrm_done') }); });

  // ====================== the foes ======================
  // (registered once js/game/class_ext.js has loaded - the map files come first)
  const registerFoes = () => { const F = ClassExt.foe;
  F('Scorpion Queen', { hp: 600, pp: 60, atk: 94, def: 30, agi: 56, lck: 14, t: 1, pw: [110, 90, 100, 100], rs: [120, 80, 110, 100], ab: ['Attack', 'Scorpion Sting', 'Sand Blast', 'Quicksand'], exp: 900, c: 500, dr: ['Star Dust', 1] });
  F('Pupetta', { hp: 1500, pp: 300, atk: 150, def: 56, agi: 122, lck: 30, t: 1, pw: [100, 100, 100, 120], rs: [100, 100, 100, 130], ab: ['Attack', 'Marionette', 'Tangle', 'Charm', 'Delude'], exp: 1500, c: 900 }, npcLook('noble_f', 4));
  F('Redbeard', { hp: 2600, pp: 120, atk: 252, def: 92, agi: 118, lck: 28, t: 1, pw: [100, 120, 100, 100], rs: [100, 130, 100, 100], ab: ['Attack', 'Cutlass', 'Broadside', 'Keelhaul', 'Grog'], exp: 2800, c: 1600 }, npcLook('pirate', 11));
  F('Susa', { hp: 2400, pp: 140, atk: 262, def: 96, agi: 134, lck: 30, t: 1, pw: [100, 100, 120, 110], rs: [100, 100, 120, 110], ab: ['Attack', 'Sword Dance', 'Whirling Blades', 'Fan Dance', 'Quick Strike'], exp: 2600, c: 1500 }, NPC_LOOKS.Susa);
  F('Leviathan Spawn', { hp: 3900, pp: 300, atk: 336, def: 118, agi: 124, lck: 30, t: 2, pw: [90, 140, 80, 100], rs: [110, 190, 60, 100], ab: ['Attack', 'Tidal Wave', 'Undertow', 'Stasis', 'Glacier'], exp: 4200, c: 2400, dr: ['Tear Stone', 1] });
  F('Whitefeather', { hp: 3200, pp: 400, atk: 292, def: 112, agi: 138, lck: 35, t: 1, pw: [110, 100, 110, 130], rs: [110, 100, 110, 140], ab: ['Attack', 'Spirit Lash', 'Totem of Flame', 'Curse', 'Wish', 'Great Spirit'], exp: 3600, c: 2000 }, npcLook('elder', 6));
  F('Vorn', { hp: 3800, pp: 420, atk: 322, def: 126, agi: 128, lck: 35, t: 1, pw: [110, 110, 120, 100], rs: [110, 120, 130, 100], ab: ['Attack', 'Acid Flask', 'Volatile Mix', 'Quicksilver', 'Elixir Toss', 'Magnum Opus'], exp: 4200, c: 2400 }, npcLook('elder', 9));
  F("Hama's Shade", { hp: 4200, pp: 500, atk: 318, def: 130, agi: 192, lck: 40, t: 1, pw: [100, 100, 100, 150], rs: [100, 100, 100, 170], ab: ['Attack', 'Storm Ray', 'Doom Prophecy', 'Bind', 'Destruct Ray', 'Foresight'], exp: 4800, c: 2600, dr: ['Sylph Feather', 1] }, NPC_LOOKS.Hama);
  F('Kaldr', { hp: 4600, pp: 200, atk: 400, def: 168, agi: 128, lck: 36, t: 1, pw: [100, 130, 130, 90], rs: [100, 150, 140, 90], ab: ['Attack', 'Glacier Crush', 'Frostbite', 'War Cry', 'Blaze Edge', 'Guard', 'Fimbulwinter'], exp: 6000, c: 3200 }, npcLook('guard', 13));
  F('Eye of Chronos', { hp: 9200, pp: 700, atk: 486, def: 184, agi: 234, lck: 50, t: 2, pw: [100, 140, 100, 130], rs: [120, 170, 100, 150], ab: ['Attack', 'Hourglass', 'Time Lock', 'Entropy', 'Break', 'Haste', 'Guard'], exp: 9000, c: 5000, dr: ['Orihalcon', 1] });
  F('Elder Frost Dragon', { hp: 16500, pp: 900, atk: 650, def: 262, agi: 246, lck: 60, t: 2, pw: [100, 160, 80, 120], rs: [130, 200, 60, 140], ab: ['Attack', 'Dragon Breath', 'Frostbite', 'Fimbulwinter', 'Draconic Fury', 'Break', 'Guard', 'Djinn Storm'], exp: 16000, c: 9000, dr: ['Dragon Skin', 1] });
  ClassExt.CREWS = ClassExt.CREWS || {};
  ClassExt.CREWS.Pupetta = ClassExt.crew('Pupetta', [['Troupe Player', 'fighter', 'villager_m', 21, 'Prop Blade'], ['Troupe Player', 'fighter', 'villager_f', 22, 'Prop Blade'], ['Stagehand', 'healer', 'villager_m', 23]]);
  ClassExt.CREWS.Redbeard = ClassExt.crew('Redbeard', [['Sea Dog', 'fighter', 'pirate', 12, 'Cutlass'], ['Sea Dog', 'fighter', 'pirate', 13, 'Cutlass'], ['Bosun', 'caster', 'pirate', 14, 1]]);
  ClassExt.CREWS.Susa = ClassExt.crew('Susa', [['Izumo Warrior', 'fighter', 'guard', 15, 'Sword Dance'], ['Izumo Warrior', 'fighter', 'guard', 16, 'Sword Dance'], ['Shrine Maiden', 'healer', 'villager_f', 17]]);
  ClassExt.CREWS.Whitefeather = ClassExt.crew('Whitefeather', [['Shaman Hunter', 'fighter', 'villager_m', 18, 'Spear Thrust'], ['Shaman Hunter', 'fighter', 'villager_m', 19, 'Spear Thrust'], ['Shaman Elder', 'caster', 'elder_m', 20, 3]]);
  ClassExt.CREWS.Vorn = ClassExt.crew('Vorn', [['Apprentice', 'caster', 'villager_m', 24, 2], ['Apprentice', 'caster', 'villager_f', 25, 1], ['Homunculus', 'fighter', 'villager_m', 26, 'Acid Flask']]);
  ClassExt.CREWS.Kaldr = ClassExt.crew('Kaldr', [['Prox Warrior', 'fighter', 'guard', 27, 'Glacier Crush'], ['Prox Warrior', 'fighter', 'guard', 28, 'Glacier Crush'], ['Prox Mystic', 'healer', 'elder_m', 29]]);
  F('Void Sovereign', { hp: 22000, pp: 999, atk: 700, def: 290, agi: 268, lck: 70, t: 2, pw: [120, 120, 120, 130], rs: [135, 135, 135, 150], ab: ['Attack', 'Oblivion', 'Event Horizon', 'Break', 'Unmaking', 'Charon', 'Djinn Storm', 'Heat Death'], exp: 25000, c: 15000, dr: ['Orihalcon', 1] });
  };
  if (typeof ClassExt !== 'undefined') registerFoes(); else (window.__classFoes = window.__classFoes || []).push(registerFoes);
}
