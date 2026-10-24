// ---------- Trial Road ----------
// After the trial's four stacked stages in map references/golden-sun-the-lost-age-shaman-village-gba-map.webp and
// the guide's chapter 13 (lines 5036-5138): the road north of Shaman Village choked with sand, the Wind Stone Sheba
// works (the sand vanishes, and Moapa still will not have it), the rules at the cave's two mouths (four doors, the
// chests that want the weight of weapons and armour - twice as much at any door Moapa's party reaches first, the
// button that ends it all), then the race up: the left road (Sand up the stream and the overgrowth's vine; the logs
// and the pillar and the log into the water; the bush-hidden pillar, the vines and the gap; the pillar in the centre
// spot and the fountains) and the right road (Pound on the cones, the pillar up to the vine, the pillar that
// crumbles under two treads, the torches and the ice), the summit and Moapa with his two knights, the Hover Jade
// for the Shaman's Rod, and the night at the inn. With Isaac: Hover to the left cavern, Lift, the fountain outside,
// Cyclone on the bushes (Mad Plant, Lucky Pepper), Reveal on the pools, the Elixir and Gasp.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const won = () => !!G.flag('trial_road_won');
  const TR_ENC = [['Pteranodon'], ['Talon Runner', 'Talon Runner'], ['Wargold'], ['Wolfkin', 'Wolfkin'], ['Mole Mage', 'Mole Mage'], ['Nightmare']];
  const LEG = {
    '.': 'sand', 'g': 'grass', 'w': 'water', 'p': 'pit', 'S': 'sandsoft', 'i': 'ice', 'h': 'water_hop',
    'v': { ground: 'sand', obj: 'vineladder', walk: true }, 'r': { ground: 'pit', obj: 'rope', walk: true }, 'T': { ground: 'sand', obj: 'palm' }, 'o': { ground: 'sand', obj: 'rock_sand' }, 'b': { ground: 'grass', obj: 'bush' },
    'C': { ground: 'sand', obj: 'lh_column' }, 'D': { ground: 'sand', obj: 'door_stone', walk: true }, 'B': 'bridge', 'E': { ground: 'sand', obj: 'elem_jupiter' }
  };
  const CLIFF = { cliff: '#', set: 'sandcliff', faces: 2 };
  const RACE = { start: 'tr_start', par: [3600, 7800, 12000, 16200] };   // Moapa's party reaches each door this many frames after the start: be there first, or the chests want twice the weight
  const gearOf = (name) => { const it = ITEM_DB[name]; return !!(it && ['long', 'light', 'axe', 'mace', 'staff', 'rusty', 'armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'hat', 'helm', 'circlet'].includes(it.cat) && !it.key); };
  const behind = (stage) => (Engine.frame - (G.get(RACE.start) || Engine.frame)) > RACE.par[stage];
  // ---- a door and its two chests: the chests take weapons and armour; the door opens at the weight it wants ----
  const doorAndChests = (M, id, stage, x, y, to, tx, ty) => {
    const open = () => !!G.flag(id + '_open');
    M.object('gate', x, y, { id: id + '_door', tile: 'door_stone', openTile: 'door_stone', state: open() ? 'open' : 'shut', script: function* (E) { if (open()) return; yield E.say('The door does not move. The chests beside it want their weight first.'); } });
    M.exit(x, y, 1, 1, to, tx, ty, DIR.UP, { door: true, cond: open });
    const chest = (cx) => M.object('spot', cx, y + 1, { id: id + '_chest_' + cx, tile: 'chest_blue', script: T3.trialChest(id, stage) });
    chest(x - 1); chest(x + 1);
  };
  T3.trialChest = (id, stage) => function* (E) {
    if (G.flag(id + '_open')) { yield E.say('The chest is shut fast on its weight, and the door beside it stands open.'); return; }
    const need = G.get(id + '_need') || (() => { const n = behind(stage) ? 2 : 1; G.set(id + '_need', n); return n; })();
    const filled = G.get(id + '_filled') || 0;
    if (filled === 0 && need === 2) yield E.say("(Moapa's party has been through this door already. The chests want twice the weight.)");
    const spare = []; for (const it of G.inventory.items) if (gearOf(it.name) && !spare.includes(it.name)) spare.push(it.name);
    const worn = []; for (const m of G.party.members) for (const slot of ['weapon', 'body', 'arm', 'head']) { const n = m.equip && m.equip[slot]; if (n && gearOf(n)) worn.push({ m, slot, n }); }
    const opts = spare.slice(0, 4).map(n => n).concat(worn.slice(0, Math.max(0, 6 - Math.min(4, spare.length))).map(w => w.n + ' (' + w.m.name + ')'), ['Nothing']);
    const c = yield* E.ask('The chest waits for weight. Weapons and armour will do; lighter things will not. What goes in?', null, opts);
    if (c < 0 || c >= opts.length - 1) return;
    let name;
    if (c < Math.min(4, spare.length)) { name = spare[c]; G.inventory.remove(name, 1); }
    else { const w = worn[c - Math.min(4, spare.length)]; name = w.n; w.m.equip[w.slot] = null; }
    const dep = G.get('tr_deposits') || []; dep.push(name); G.set('tr_deposits', dep); G.set(id + '_filled', filled + 1); Audio.sfx('item');
    if (filled + 1 >= need) { G.set(id + '_open'); const g = G.field.map.objects.find(o => o.id === id + '_door'); if (g) g.state = 'open'; G.field.map.finalize(); Engine.doShake(8); Audio.sfx('push'); yield E.say('The lid closes on the ' + name + ' - and the door beside the chests grinds open!'); }
    else yield E.say('The lid closes on the ' + name + '. The other chest wants its share yet.');
  };
  // the button that ends the trial: back to the road, and everything the chests took given back
  const quitButton = (M, x, y) => M.object('lever', x, y, { id: 'tr_quit_' + M.id, tile: 'lever', onPull: function* (E) { const r = yield* E.ask('The button Moapa spoke of. Press it, and the trial is over - for good, until it is walked again from its start.', null, ['Press it', 'Leave it']); if (r !== 0) return; yield* T3.trialReturn(E); yield E.say('It would be wise of you to quit. Even if you reach the top, you cannot beat me. You should do well to leave Shaman Village at once.', 'Moapa'); T3.trialReset(); E.warpNow('trial_road', 12, 10, DIR.DOWN); } });
  T3.trialReturn = function* (E) { const dep = G.get('tr_deposits') || []; if (!dep.length) return; for (const n of dep) G.inventory.add(n, 1); G.set('tr_deposits', []); Audio.sfx('item'); yield E.say('(Everything the chests took came back: ' + dep.join(', ') + '.)'); };
  T3.trialReset = () => { for (const k of Object.keys(G.flags)) if (/^tr[lr]_[1-4](_open|_need|_filled)$/.test(k) || /^obj:tr[lr]_/.test(k) || /^(ground|walk|objtile):tr[lr]_/.test(k)) delete G.flags[k]; G.set('tr_started', false); };
  // ====================== the road: the sand, the Wind Stone, the cave's two mouths ======================
  const R = grid(26, 32, '#');
  fill(R, 10, 26, 15, 31, '.'); fill(R, 8, 8, 17, 26, '.'); fill(R, 5, 3, 20, 8, '.'); fill(R, 2, 4, 5, 6, '.'); fill(R, 20, 4, 23, 6, '.');
  for (const [x, y] of [[9, 12], [16, 22], [6, 4], [19, 7]]) R[y][x] = 'C';
  for (const [x, y] of [[3, 5], [22, 5], [11, 24], [14, 10]]) R[y][x] = 'o';
  R[3][8] = 'D'; R[3][17] = 'D'; R[2][8] = '.'; R[2][17] = '.';
  defineMap('trial_road', {
    name: 'Trial Road', w: 26, h: 32, base: 'void', music: 'trialroad', bg: 'sand', entry: { x: 12, y: 30 }, retreat: { map: 'shaman', x: 16, y: 2, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(R), LEG, CLIFF);
      M.walkable(10, 31, 6, 1); M.exit(10, 31, 6, 1, 'shaman', 16, 1, DIR.DOWN);
      // the sand piled between the cliffs, and the Wind Stone before it
      if (!G.flag('tr_sand_gone')) for (let x = 8; x <= 17; x++) for (let y = 16; y <= 18; y++) M.object('sandwall', x, y, { id: 'tr_sand_' + x + '_' + y, tile: 'sandwall' });
      M.object('windstone', 12, 21, { id: 'tr_windstone', onWind: T3.trialSand });
      // Moapa and his two men, waiting at the sand, and later at the cave's mouths
      const stage = G.flag('tr_sand_gone') ? (G.flag('tr_started') ? 'gone' : 'mouths') : 'sand';
      if (stage === 'sand') { M.npc('tr_moapa', 12, 20, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN, text: 'To inherit the stone of Yegelos, you must cause this sand to disappear. If you can manage that feat, then the blood of Contigo runs through your veins.', mind: '(I know the truth. These outlanders stole the rod from Contigo. No matter. Their misdeeds will be revealed to all when they fail the Trial Road.)' });
        M.npc('tr_man1', 10, 20, { type: 'tribal', name: 'Man', dir: DIR.DOWN, text: 'When Yegelos and Hoabna waged their mighty battles here, the sand suddenly vanished.', mind: '(They stand no chance of making the sand vanish. They will give up and go home.)' });
        M.npc('tr_man2', 14, 20, { type: 'tribal', name: 'Man', dir: DIR.DOWN, text: 'Just ahead lies Trial Road, where Hoabna and Yegelos fought their greatest battles. Only superior ones such as they could have followed the road to its end.', mind: '(If they lack the power of Contigo or the power of Shaman Village, they will fail.)' }); }
      if (stage === 'mouths') { M.npc('tr_moapa', 12, 6, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN, script: T3.trialRules, mind: '(I cannot lose. I will not lose. It is my responsibility as head of the Shaman tribe.)' });
        M.npc('tr_man1', 10, 6, { type: 'tribal', name: 'Man', dir: DIR.DOWN, script: T3.trialExplainAgain, mind: "(You don't seem like bad people, for outlanders, but we cannot give you the jade. Only the hero with the blood of Yegelos, the hero of Contigo, can claim the gem.)" });
        M.npc('tr_man2', 14, 6, { type: 'tribal', name: 'Man', dir: DIR.DOWN, script: T3.trialExplainAgain, mind: "(You're doomed. Moapa is the greatest warrior in all of Hesperia.)" }); }
      // the two mouths: choosing one starts the race, and Moapa's party takes the other
      const start = (side) => function* (E) { if (!G.flag('tr_rules_heard')) { yield E.say('Choose the road of your liking? First hear the rules.', 'Moapa'); yield* T3.trialRules(E); if (!G.flag('tr_rules_heard')) return; } if (!G.flag('tr_started')) { yield E.say('If you have chosen, then we shall take the other path. On the count of three, the challenge begins!', 'Moapa'); yield E.say('One... two... THREE!', 'Moapa'); G.set('tr_started', true); G.set(RACE.start, Engine.frame); G.set('tr_side', side); for (const id of ['tr_moapa', 'tr_man1', 'tr_man2']) E.despawn(id); } };
      M.trigger(8, 4, 1, 1, start('left'), { cond: () => G.flag('tr_sand_gone') && !won() });
      M.trigger(17, 4, 1, 1, start('right'), { cond: () => G.flag('tr_sand_gone') && !won() });
      M.exit(8, 3, 1, 1, 'trl_1', 10, 20, DIR.UP, { door: true, cond: () => won() || !!G.flag('tr_started') }); M.exit(17, 3, 1, 1, 'trr_1', 10, 20, DIR.UP, { door: true, cond: () => won() || !!G.flag('tr_started') });
      M.chest(3, 4, 'Hard Nut', 1);
      M.sign(20, 5, 'The columns commemorate Yegelos and Hoabna, who raced one another to the summit. Left or right: the road does not care.');
      M.trigger(10, 30, 6, 2, function* (E) { yield E.say('Trial Road. A wall of sand between the cliffs, and Moapa waiting in front of it.', 'Jenna'); }, { once: 'tr_seen', cond: () => !G.flag('tr_sand_gone') });
      // leaving before it is settled
      M.trigger(10, 27, 6, 1, function* (E) { const r = yield* E.ask('Have you decided to give up this foolishness once and for all?', 'Moapa', ['Yes', 'No']); if (r === 0) { yield E.say('You have chosen wisely, and for your wisdom, you must leave Shaman Village.', 'Moapa'); G.set('tr_gave_up'); } else { yield E.say('Choose the road of your liking. It matters not to us.', 'Moapa'); yield E.move('player', DIR.UP, 1); } }, { cond: () => G.flag('tr_sand_gone') && !G.flag('tr_started') && !won() && !G.flag('tr_gave_up') });
    }
  });
  T3.trialSand = function* (E) {
    if (G.flag('tr_sand_gone')) { yield E.say('The stone hums, but the sand is already gone.'); return; }
    yield E.say('You can do it, Sheba!', 'Jenna'); yield E.say('Leave it to me, Jenna. This will be a breeze.', 'Sheba');
    Engine.doShake(20); Audio.sfx('psy'); yield E.say('(The stone magnifies her power. An enormous cyclone tears down the road - and the sand is gone in moments!)');
    for (const o of G.field.map.objects) if (o.kind === 'sandwall') { o.gone = true; G.set('obj:' + o.key, { gone: true }); } G.set('tr_sand_gone'); G.field.map.finalize();
    yield E.say("I don't believe it. They did it! The sand vanished!", 'Moapa'); yield E.say('The legends... They were all true!', 'Man'); yield E.say("She's the one! She must have come from Contigo!", 'Man');
    yield E.say("Her? She's the one that did it? But she's... just a girl!", 'Moapa'); yield E.say('Well, you wanted the sand to vanish, so...', 'Sheba'); yield E.say('Can we have the Hover Jade now?', 'Piers');
    yield E.say("Nope, you still can't have it.", 'Moapa'); yield E.say('What? Why not?', 'Jenna'); yield E.say('This was just a test to see if you earned the right to take the test to earn the stone.', 'Moapa');
    yield E.say("So, there's more that they have to do before you'll give them the stone?", 'Kraden'); yield E.say('You will have to reach the end of Trial Road.', 'Moapa');
    yield E.say("The girls, too? Surely you can't make them...", 'Man'); yield E.say('I thought that only the chosen hero could travel the road...', 'Man'); yield E.say("What, are you saying I can't be the chosen hero?", 'Sheba');
    yield E.say('The heroes have always been men, ever since the time of Hoabna. It is the way.', 'Moapa'); yield E.say("I don't like your attitude, mister! I can be every bit as heroic as some guy!", 'Sheba');
    yield E.say('That may be true, but you must respect our customs.', 'Man'); yield E.say("It's the same in Contigo, you know. If you don't like it, take it up with Yegelos.", 'Man');
    yield E.say("Hold it, hold it... Moapa, what were you just saying about Trial Road? If we reach the end of Trial Road, won't our names join the ranks of your heroes?", 'Kraden');
    yield E.say("Kraden's right... It shouldn't matter if a girl does it... All that matters is that we finish!", 'Jenna'); yield E.say('If you give us the chance, we will prove it to you.', 'Piers'); yield E.say("Unless you're afraid that a girl like me might become your town's newest hero.", 'Sheba');
    yield E.say('Have they earned the right? Shall we let them onto Trial Road?', 'Man'); yield E.say("I don't like the way these outsiders were talking to me.", 'Man'); yield E.say('I think they need to learn exactly what it takes to be a hero around here!', 'Man'); yield E.say("Yeah, if these guys are so stubborn, let's give them a shot! They'll probably give up!", 'Man');
    yield E.say("You said it yourselves. We're too stubborn to quit.", 'Jenna'); yield E.say('Yeah. If you want us "outlanders" to leave, you\'d better give us a chance to walk Trial Road!', 'Sheba');
    yield E.say("Trial Road is a difficult one... When you reach the top, a terrible battle awaits you. It's difficult enough for me. I expect you will find it quite impossible. Still interested?", 'Moapa');
    const r = yield* E.ask('Still interested?', 'Moapa', ['Yes', 'No']); if (r === 0) yield E.say('You seem confident, but it is your ignorance speaking.', 'Moapa'); else yield E.say('So... You are not as sure of yourselves as you first seemed. But I will permit this. Follow me, and I shall explain.', 'Moapa');
    yield E.say('(Moapa and the two men go up the road to where the sand was, and on to the trial cave and its two mouths. The party follows.)');
    for (const id of ['tr_moapa', 'tr_man1', 'tr_man2']) E.despawn(id); E.spawn('tr_moapa', 12, 6, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN, script: T3.trialRules }); E.spawn('tr_man1', 10, 6, { type: 'tribal', name: 'Man', dir: DIR.DOWN, script: T3.trialExplainAgain }); E.spawn('tr_man2', 14, 6, { type: 'tribal', name: 'Man', dir: DIR.DOWN, script: T3.trialExplainAgain });
    E.warpNow('trial_road', 12, 9, DIR.UP);
    yield* T3.trialRules(E);
  };
  T3.trialRulesText = function* (E) {
    yield E.say('Listen carefully to me. This cave provides you with an opportunity to practice your skills. Legends say that Yegelos and Hoabna once fought here. These columns commemorate this. They raced one another to the summit... And there, they fought with all their might on the peak of the mountain. In honor of their great battle, the leaders of Shaman created this trial.', 'Moapa');
    yield E.say('The rules are simple. The room is filled with traps and snares. Use the power of Contigo to avoid them. This road has four doors. To open them, you will need to place items in these chests.', 'Moapa');
    yield E.say('Why?', 'Felix');
    yield E.say("The door is triggered only when the treasure chests are filled to the correct weight. Try putting heavier items, like weapons and tools, into the chests, or the doors won't open. If you reach the door after your opponents do, you will be at a serious disadvantage. You see, it will take twice the weight to open the doors. If you are last to each of the four doors, you will lose eight items to the chests!", 'Moapa');
    yield E.say('If Trial Road proves too much for you, press this button. This ends the battle, though. A true hero would not surrender so easily. In order to reach the battle at the summit, you cannot fail on Trial Road.', 'Moapa');
  };
  T3.trialRules = function* (E) {
    if (G.flag('tr_started')) { yield E.say('Choose the road of your liking. It matters not to us.', 'Moapa'); return; }
    if (G.flag('tr_rules_heard')) { const r = yield* E.ask('Do you want to challenge me on Trial Road?', 'Moapa', ['Yes', 'No']); if (r !== 0) { yield E.say('You have chosen wisely, and for your wisdom, you must leave Shaman Village.', 'Moapa'); return; } const r2 = yield* E.ask("Do you need to hear Moapa's explanation again?", 'Moapa', ['Yes', 'No']); if (r2 === 0) { yield E.say('Thick-witted outsiders.', 'Moapa'); yield* T3.trialRulesText(E); } yield E.say('Choose the road of your liking. It matters not to us.', 'Moapa'); return; }
    yield* T3.trialRulesText(E);
    let r = yield* E.ask('Do you understand?', 'Moapa', ['Yes', 'No']);
    if (r !== 0) { const r2 = yield* E.ask('Would you like me to explain it to you again?', 'Moapa', ['Yes', 'No']); if (r2 === 0) { yield E.say('Do all outlanders share your thickwittedness?', 'Moapa'); yield* T3.trialRulesText(E); } }
    yield E.say('Then you understand the treacherous path of Trial Road. Will you continue?', 'Moapa');
    r = yield* E.ask('Will you continue?', 'Moapa', ['Yes', 'No']);
    if (r !== 0) { yield E.say('You have chosen wisely, and for your wisdom, you must leave Shaman Village.', 'Moapa'); return; }
    G.set('tr_rules_heard'); yield E.say('You have heard the rules, and you wish to continue. You have been warned. Choose the road of your liking. It matters not to us.', 'Moapa');
  };
  T3.trialExplainAgain = function* (E) { const r = yield* E.ask("Do you need to hear Moapa's explanation again?", 'Man', ['Yes', 'No']); if (r === 0) { yield E.say('Thick-witted outsiders.', 'Moapa'); yield* T3.trialRulesText(E); G.set('tr_rules_heard'); } else yield E.say(G.flag('tr_rules_heard') ? 'Then you must leave Shaman Village and forget about the Hover Jade.' : 'As long as you remain in our village, my people are not free to do as they will. If you are not going to take the challenge of Trial Road, you must leave Shaman Village.', 'Man'); };
  // ====================== the left road ======================
  const stage = (id, name, rows, entry, to, doorX, build) => defineMap(id, {
    name, w: rows[0].length, h: rows.length, base: 'void', music: 'trialroad', bg: 'sand', entry, enc: TR_ENC, retreat: { map: 'trial_road', x: 12, y: 8, dir: DIR.DOWN },
    build(M) { M.paint(0, 0, strs(rows), LEG, CLIFF); build(M); }
  });
  // stage 1: the stream of sand up the middle (Sand), the tightrope round the left, the overgrowth on the right that hides a vine to the top
  const L1 = grid(21, 22, '#');
  fill(L1, 8, 17, 12, 21, '.'); fill(L1, 3, 12, 17, 16, '.'); fill(L1, 10, 6, 10, 11, 'S'); fill(L1, 3, 8, 5, 11, '.'); fill(L1, 3, 5, 5, 7, 'p'); L1[6][4] = 'r'; L1[5][4] = 'r'; L1[7][4] = 'r'; fill(L1, 2, 2, 6, 4, '.');
  fill(L1, 12, 8, 17, 11, '.'); fill(L1, 8, 8, 12, 8, '.'); fill(L1, 7, 2, 18, 4, '.');
  for (const [x, y] of [[6, 14], [14, 15], [16, 9]]) L1[y][x] = 'o';
  L1[1][10] = 'D';
  stage('trl_1', 'Trial Road - Left Road', L1, { x: 10, y: 20 }, 'trl_2', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trial_road', 8, 4, DIR.DOWN);
    M.object('vines', 15, 8, { id: 'trl1_vines', onClear: function* (E) { const Mp = G.field.map; for (const y of [5, 6, 7]) { persistObjTile(Mp, 15, y, 'vineladder'); persistWalkable(Mp, 15, y); } Mp.finalize(); yield E.say('A vine, hidden under the growth - straight up to the door.'); } });
    M.chest(3, 3, 'Potion', 1);
    doorAndChests(M, 'trl_1', 0, 10, 1, 'trl_2', 10, 20); quitButton(M, 17, 3);
    M.sign(8, 15, 'The left road. The stream of sand runs up the middle; the rope goes the long way round.');
  });
  // stage 2: the logs and the pillar: the long log must roll up into the water for the way across, the others out of its road
  const L2 = grid(21, 22, '#');
  fill(L2, 8, 17, 12, 21, '.'); fill(L2, 3, 7, 17, 16, '.'); fill(L2, 3, 6, 17, 6, 'w'); fill(L2, 3, 2, 17, 5, '.'); L2[1][10] = 'D';
  for (const [x, y] of [[4, 15], [16, 15]]) L2[y][x] = 'o';
  stage('trl_2', 'Trial Road - Left Road', L2, { x: 10, y: 20 }, 'trl_3', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trl_1', 10, 2, DIR.DOWN);
    M.object('log', 10, 12, { id: 'trl2_log_h', len: 3, horiz: true });   // the long log across the road: rolled up into the water it is the bridge
    M.object('log', 11, 9, { id: 'trl2_log_v', len: 2, horiz: false });   // the upright log in its way: rolled aside
    M.object('pillar', 10, 8, { id: 'trl2_pillar' });   // and the pillar: Moved off the log's road
    M.chest(16, 3, 'Vial', 1);
    doorAndChests(M, 'trl_2', 1, 10, 1, 'trl_3', 10, 20); quitButton(M, 3, 3);
  });
  // stage 3: the bush-covered pillar on the right pushed up into the gap, the left vine, the gap hopped, the centre vine
  const L3 = grid(21, 22, '#');
  fill(L3, 8, 17, 12, 21, '.'); fill(L3, 3, 12, 17, 16, '.'); L3[11][15] = 'p'; fill(L3, 14, 8, 17, 10, '.'); L3[11][4] = 'v'; L3[10][4] = 'v'; fill(L3, 3, 7, 6, 9, '.'); L3[8][7] = 'p'; fill(L3, 8, 7, 12, 9, '.');
  L3[6][10] = 'v'; L3[5][10] = 'v'; fill(L3, 3, 2, 17, 4, '.'); L3[1][10] = 'D';
  for (const [x, y] of [[9, 14], [16, 13]]) L3[y][x] = 'o';
  stage('trl_3', 'Trial Road - Left Road', L3, { x: 10, y: 20 }, 'trl_4', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trl_2', 10, 2, DIR.DOWN);
    if (G.flag('trl3_bush_off')) M.object('pillar', 15, 13, { id: 'trl3_pillar' });   // pushed up into the gap at (15,11): the way onto the right shelf and its Vial
    else M.object('vines', 15, 13, { id: 'trl3_bush', onClear: function* (E) { G.set('trl3_bush_off'); G.field.map.objects.push({ kind: 'pillar', x: 15, y: 13, id: 'trl3_pillar', key: 'trl_3:pillar:trl3_pillar' }); yield E.say('A pillar under the bush.'); } });
    M.object('hop', 7, 8, { id: 'trl3_hop' });
    M.chest(16, 9, 'Vial', 1);
    doorAndChests(M, 'trl_3', 2, 10, 1, 'trl_4', 10, 20); quitButton(M, 17, 3);
  });
  // stage 4: the pillar in the centre spot, the vine, and the fountains that lift by turns
  const L4 = grid(21, 24, '#');
  fill(L4, 8, 19, 12, 23, '.'); fill(L4, 3, 14, 17, 18, '.'); L4[13][10] = 'p'; fill(L4, 8, 10, 12, 12, '.'); L4[9][10] = 'v'; L4[8][10] = 'v'; fill(L4, 8, 5, 12, 7, '.'); fill(L4, 3, 2, 17, 3, '.'); L4[1][10] = 'D';
  L4[4][8] = '.'; L4[4][10] = '.'; L4[4][12] = '.';   // the three fountains between the shelf and the top
  fill(L4, 14, 5, 17, 12, '.'); L4[13][16] = 'v'; fill(L4, 3, 5, 6, 12, '.'); L4[13][4] = 'p';
  stage('trl_4', 'Trial Road - Left Road', L4, { x: 10, y: 22 }, 'trial_road_top', 10, (M) => {
    M.walkable(8, 23, 5, 1); M.exit(8, 23, 5, 1, 'trl_3', 10, 2, DIR.DOWN);
    M.object('pillar', 6, 16, { id: 'trl4_pillar' });   // into the centre spot (10,13): the way to the vine
    // the fountains: three columns of air between the ledge and the door, each up for a while in turn; the middle one is waited for
    const up = (k) => () => Math.floor(Engine.frame / 90) % 3 === k;
    M.object('updraft', 8, 4, { id: 'trl4_f1', to: { x: 8, y: 3 }, active: up(0), onTile: 'whirlwind', tile: 'fountain_dry' });
    M.object('updraft', 10, 4, { id: 'trl4_f2', to: { x: 10, y: 3 }, active: up(1), onTile: 'whirlwind', tile: 'fountain_dry' });
    M.object('updraft', 12, 4, { id: 'trl4_f3', to: { x: 12, y: 3 }, active: up(2), onTile: 'whirlwind', tile: 'fountain_dry' });
    M.chest(16, 6, 'Potion', 1);
    doorAndChests(M, 'trl_4', 3, 10, 1, 'trial_road_top', 12, 18, 'trial_road_top'); quitButton(M, 3, 3);
  });
  // ====================== the right road ======================
  const R1 = grid(21, 22, '#');
  fill(R1, 8, 17, 12, 21, '.'); fill(R1, 3, 12, 17, 16, '.'); fill(R1, 3, 7, 17, 11, '.'); fill(R1, 3, 2, 17, 4, '.'); R1[1][10] = 'D';
  fill(R1, 3, 5, 17, 6, '#'); R1[5][6] = '.'; R1[6][6] = '.'; R1[5][14] = '.'; R1[6][14] = '.';
  stage('trr_1', 'Trial Road - Right Road', R1, { x: 10, y: 20 }, 'trr_2', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trial_road', 17, 4, DIR.DOWN);
    // the two cones in the wall's gaps: Pound sinks them; the way through is either
    M.object('pillar', 6, 6, { id: 'trr1_cone1', fixed: true }); M.object('pillar', 14, 6, { id: 'trr1_cone2', fixed: true });
    M.object('vines', 10, 9, { id: 'trr1_bush' }); M.chest(10, 9, 'Vial', 1);
    doorAndChests(M, 'trr_1', 0, 10, 1, 'trr_2', 10, 20); quitButton(M, 17, 3);
  });
  const R2 = grid(21, 22, '#');
  fill(R2, 8, 17, 12, 21, '.'); fill(R2, 3, 11, 17, 16, '.'); R2[10][6] = 'p'; fill(R2, 3, 7, 9, 9, '.'); R2[6][6] = 'v'; R2[5][6] = 'v'; fill(R2, 3, 2, 17, 4, '.'); R2[1][10] = 'D';
  fill(R2, 12, 7, 17, 9, '.'); R2[10][15] = 'p';
  stage('trr_2', 'Trial Road - Right Road', R2, { x: 10, y: 20 }, 'trr_3', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trr_1', 10, 2, DIR.DOWN);
    M.object('pillar', 6, 14, { id: 'trr2_pillar' });   // up to the top of its lane and into the gap: the vine beyond
    M.object('pillar', 15, 14, { id: 'trr2_pillar2' }); M.chest(15, 8, 'Vial', 1);
    doorAndChests(M, 'trr_2', 1, 10, 1, 'trr_3', 10, 20); quitButton(M, 3, 3);
  });
  const R3 = grid(21, 22, '#');
  fill(R3, 8, 17, 12, 21, '.'); fill(R3, 3, 12, 17, 16, '.'); R3[11][15] = 'v'; R3[10][15] = 'v'; fill(R3, 12, 7, 17, 9, '.'); R3[5][15] = 'v'; fill(R3, 3, 2, 17, 4, '.'); R3[1][10] = 'D';
  fill(R3, 3, 7, 8, 9, '.');
  stage('trr_3', 'Trial Road - Right Road', R3, { x: 10, y: 20 }, 'trr_4', 10, (M) => {
    M.walkable(8, 21, 5, 1); M.exit(8, 21, 5, 1, 'trr_2', 10, 2, DIR.DOWN);
    // the pillar in front of the upper vine: stood on twice, it crumbles
    M.set(15, 7, 'pillar_top'); M.object('spot', 15, 7, { id: 'trr3_crumble', tile: null, onStep: function* (E) { const n = (G.get('trr3_steps') || 0) + 1; G.set('trr3_steps', n); if (n < 2) { yield E.say('(The pillar top grinds and shifts underfoot.)'); return; } const Mp = G.field.map; persistGround(Mp, 15, 7, 'sand'); persistObjTile(Mp, 15, 6, 'vineladder'); persistWalkable(Mp, 15, 6); Mp.finalize(); const o = Mp.objects.find(ob => ob.id === 'trr3_crumble'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } Engine.doShake(8); yield E.say('(The pillar crumbles to rubble under the party! The vine behind it is clear.)'); } });
    M.chest(3, 8, 'Nut', 1); M.chest(3, 3, 'Potion', 1); M.chest(16, 3, 'Vial', 1);
    doorAndChests(M, 'trr_3', 2, 10, 1, 'trr_4', 10, 20); quitButton(M, 17, 3);
  });
  const R4 = grid(21, 24, '#');
  fill(R4, 8, 19, 12, 23, '.'); fill(R4, 3, 12, 17, 18, '.'); fill(R4, 3, 8, 17, 11, '.'); R4[11][10] = 'p'; fill(R4, 3, 2, 17, 6, '.'); R4[7][10] = 'p'; R4[1][10] = 'D';
  fill(R4, 3, 7, 17, 7, '#'); R4[7][10] = 'p'; R4[12][15] = '#'; R4[12][17] = '#'; R4[11][16] = '#';   // the nook the Vial sits in, shut by the ice
  stage('trr_4', 'Trial Road - Right Road', R4, { x: 10, y: 22 }, 'trial_road_top', 10, (M) => {
    M.walkable(8, 23, 5, 1); M.exit(8, 23, 5, 1, 'trr_3', 10, 2, DIR.DOWN);
    // the torches (Moved like pillars) melt the ice pillars they are pushed against; the puddles Frost fills are the steps up
    const melt = function* (E) { const Mp = G.field.map; for (const t of Mp.objects) { if (t.gone || !t.torchy) continue; for (const ice of Mp.objects) { if (ice.gone || !ice.melts) continue; if (Math.abs(ice.x - t.x) + Math.abs(ice.y - t.y) === 1) { ice.gone = true; G.set('obj:' + ice.key, { gone: true }); Audio.sfx('water'); yield E.say('The torch\'s heat runs the ice to water!'); } } } };
    M.object('pillar', 5, 15, { id: 'trr4_torch1', tile: 'torch', torchy: true, onMove: melt }); M.object('pillar', 15, 15, { id: 'trr4_torch2', tile: 'torch', torchy: true, onMove: melt });
    M.object('pillar', 16, 13, { id: 'trr4_ice1', tile: 'ice_column', fixed: true, poundable: false, melts: true }); M.chest(16, 12, 'Vial', 1);   // the Vial behind the right ice
    M.object('pillar', 10, 12, { id: 'trr4_ice2', tile: 'ice_column', fixed: true, poundable: false, melts: true });   // the ice in the road's middle
    M.object('puddle', 10, 11, { id: 'trr4_puddle' }); M.object('puddle', 10, 7, { id: 'trr4_puddle2' });
    doorAndChests(M, 'trr_4', 3, 10, 1, 'trial_road_top', 12, 18, 'trial_road_top'); quitButton(M, 3, 3);
  });
  // ====================== the summit ======================
  const S = grid(26, 20, '#');
  fill(S, 10, 15, 14, 19, '.'); fill(S, 6, 5, 19, 14, '.'); fill(S, 2, 9, 5, 9, '.'); fill(S, 20, 8, 23, 11, '.'); fill(S, 9, 3, 16, 4, 'g');
  S[9][2] = 'E';   // the two cells between the panels are gap objects on the ground (a pit tile is solid even to Hover)
  for (const [x, y] of [[7, 6], [18, 6], [7, 13], [18, 13]]) S[y][x] = 'C';
  defineMap('trial_road_top', {
    name: 'Trial Road - Summit', w: 26, h: 20, base: 'void', music: 'trialroad', bg: 'sand', entry: { x: 12, y: 18 }, enc: TR_ENC, retreat: { map: 'trial_road', x: 12, y: 8, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(S), LEG, CLIFF);
      M.walkable(10, 19, 5, 1); M.exit(10, 19, 5, 1, 'trl_4', 10, 2, DIR.DOWN, { cond: () => G.get('tr_side') !== 'right' }); M.exit(10, 19, 5, 1, 'trr_4', 10, 2, DIR.DOWN, { cond: () => G.get('tr_side') === 'right' });
      M.trigger(11, 8, 4, 3, T3.trialSummit, { cond: () => !won() });
      // after Isaac: Hover from the panel on the left across the two gaps to the cavern; Lift, the fountain, the Mad Plant in the bushes, Reveal on the pools, the Elixir and Gasp
      M.object('hoverpad', 5, 9, { id: 'tr_hover' }); M.object('hoverpad', 2, 9, { id: 'tr_hover_back' }); M.object('gap', 3, 9, { id: 'tr_gap1' }); M.object('gap', 4, 9, { id: 'tr_gap2' }); M.set(5, 9, 'elem_jupiter'); M.set(2, 9, 'elem_jupiter');
      M.setObj(1, 9, 'door_cave'); M.walkable(1, 9); M.set(1, 9, 'sand'); M.exit(1, 9, 1, 1, 'trial_road_cavern', 14, 12, DIR.LEFT, { door: true });
      M.sign(12, 14, 'The summit. Here Hoabna and Yegelos fought with all their might.');
    }
  });
  T3.trialSummit = function* (E) {
    const slow = behind(3);
    Audio.play('bosshuman'); E.spawn('tr_moapa_s', 12, 6, { look: NPC_LOOKS.Moapa, name: 'Moapa', dir: DIR.DOWN }); E.spawn('tr_k1', 10, 7, { type: 'guard', name: 'Knight', dir: DIR.DOWN }); E.spawn('tr_k2', 14, 7, { type: 'guard', name: 'Knight', dir: DIR.DOWN });
    if (slow) yield E.say("You may have been slow, but you made it through Trial Road to the mountain's peak! Well then... The time is nigh for us to decide who is stronger! Let the battle begin!", 'Moapa');
    else yield E.say("You were quite swift! You may prove a challenge yet! However, just because you're fast doesn't mean you're strong. Challenge or no, I will win. Let the battle begin!", 'Moapa');
    const r = yield* E.battle(['Moapa', 'Knight', 'Knight'], { boss: true, canFlee: false, music: 'bosshuman', weaken: { hp: 0.7, atk: 0.85 } }); if (r !== 'win') return;
    yield E.say("All right, all right. You've proven your strength, and you are heroes indeed. As we promised, you will receive the Hover Jade, and we will take the Shaman's Rod.", 'Moapa');
    if (G.inventory.has("Shaman's Rod")) G.inventory.remove("Shaman's Rod", 1); else for (const m of G.party.members) for (const s of Object.keys(m.equip || {})) if (m.equip[s] === "Shaman's Rod") m.equip[s] = null;
    yield E.give('Hover Jade'); G.set('hover_got'); G.set('trial_road_won');
    yield E.say('After many years, the vow that Hoabna made to Yegelos has at last been fulfilled!', 'Moapa'); yield E.say("I'm tired now. I'll be back in the Shaman Village resting.", 'Moapa');
    for (const id of ['tr_moapa_s', 'tr_k1', 'tr_k2']) E.despawn(id);
    yield* T3.trialReturn(E);
    yield E.say("I'm sure you must be exhausted as well. Let's go back to the village and rest.", 'Kraden');
    yield Engine.fadeOut(30); for (const m of G.party.members) { m.status = {}; m.hp = m.maxHp(); m.pp = m.maxPp(); } Audio.sfx('heal'); G.set('tr_started', false);
    E.warpNow('shaman_inn', 8, 5, DIR.DOWN); yield Engine.fadeIn(30);
    yield E.say('(Felix rests on a bed in the inn. The night passes, and the village wakes to a new hero in it.)');
  };
  // ---- the cavern behind the summit, for Hover and Lift: the rock, the fountain outside, the bushes, the pools ----
  const CV = grid(16, 14, '#');
  fill(CV, 2, 2, 13, 11, '.'); CV[12][14] = '.'; CV[12][13] = '.'; CV[11][14] = '.';
  fill(CV, 2, 3, 13, 5, 'w'); fill(CV, 4, 8, 5, 9, 'b'); fill(CV, 10, 8, 11, 9, 'b');   // the pools across the cavern: the far ledge beyond them, and a way through them Reveal shows
  defineMap('trial_road_cavern', {
    name: 'Trial Road - the Hidden Spring', w: 16, h: 14, base: 'void', music: 'trialroad', bg: 'sand', entry: { x: 14, y: 12 }, enc: [['Mole Mage', 'Mole Mage'], ['Nightmare'], ['Talon Runner']],
    build(M) {
      M.paint(0, 0, strs(CV), Object.assign({}, LEG, { 'b': { ground: 'sand', obj: 'bush' } }), CLIFF);
      M.set(15, 12, 'sand'); M.setObj(15, 12, 'door_cave'); M.walkable(15, 12); M.exit(15, 12, 1, 1, 'trial_road_top', 2, 9, DIR.RIGHT);
      M.object('boulder', 12, 12, { id: 'trc_rock', onLift: function* (E) { yield E.say('The rock comes up, and air moves through the cavern: there is a way out to the open, and water running somewhere.', 'Isaac'); } });
      M.setObj(5, 6, 'fountain'); M.sign(6, 7, "Hoabna's spring. Only he could find it, the village says.");   // the spring beside the pools; the way through them starts at (7,6)
      M.object('leaves', 4, 8, { id: 'trc_bush1', onClear: function* (E) { if (G.flag('trc_plant_done')) return; const r = yield* E.ambush(['Mad Plant #5'], { boss: true, canFlee: false }, { at: [[4, 8]], scale: 1.3, say: 'Something in the bushes rears up - a Mad Plant, and a monstrous one!' }); if (r !== 'win') return; G.set('trc_plant_done'); yield E.give('Lucky Pepper'); } });
      M.object('leaves', 5, 8, { id: 'trc_bush2' }); M.object('leaves', 4, 9, { id: 'trc_bush3' }); M.object('leaves', 5, 9, { id: 'trc_bush4' }); M.object('leaves', 10, 8, { id: 'trc_bush5' }); M.object('leaves', 11, 8, { id: 'trc_bush6' }); M.object('leaves', 10, 9, { id: 'trc_bush7' }); M.object('leaves', 11, 9, { id: 'trc_bush8' });
      // Reveal on the pools: the hidden tiles through them
      for (const y of [3, 4, 5]) M.hidden.push({ x: 7, y, tile: 'sand' });
      M.chest(12, 2, 'Elixir', 1); M.djinni('Gasp', 8, 2, { fight: true });   // it mimics the party's steps in the game; here it stands its ground
    }
  });
}
