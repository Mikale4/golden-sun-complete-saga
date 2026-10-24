// ---------- East Indra Shore and the Lemurian Ship ----------
// After map references/golden-sun-the-lost-age-east-indra-shore-gba-map.webp: the beach where the ship lies with its
// bow out over the water, the ledge on the left with the puddle and the box (Frost, and a Cookie), and the rooms
// below its deck, condensed. Per the guide and the script: the first time here with Piers he asks to see Madra's
// mayor before leaving; the second time he opens the sealed door with the Black Crystal, and the ship is full of
// Aqua Jellies - the two on the way down (the second leaves the puddle to freeze for the Potion), the crate room, the
// second crate room (the Antidote in its box), the jelly that runs for the lower level and the platform its puddle
// fixes, the Oil Drop, the jelly that merges into the Aqua Hydra, the flood, Douse on the right-hand pillar and the
// pillar pushed onto the mark, and the power chamber where Piers sets the orb: the ship sails, and Felix takes the
// tiller.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  // ====================== the shore ======================
  const LEG = { '.': 'sand', 'g': 'grass', 'w': 'water', 'i': 'water_hop', 'd': 'ship_deck', 'p': 'pit', 't': { ground: 'grass', obj: 'palm' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'sand', obj: 'rock_small' }, 'k': { ground: 'ship_deck', obj: 'ship_rail' } };
  const S = grid(36, 26, 'w');
  fill(S, 0, 0, 35, 9, 'g'); fill(S, 0, 10, 35, 15, '.'); fill(S, 0, 16, 9, 19, '.'); fill(S, 26, 16, 35, 17, '.');   // the grass, the beach, the sand running down each side
  fill(S, 3, 1, 32, 1, '.'); fill(S, 14, 0, 16, 0, '.');   // the way in from the north
  for (const [x, y] of [[2, 2], [6, 2], [10, 4], [22, 3], [27, 2], [31, 4], [1, 8], [33, 8], [12, 7]]) S[y][x] = 't'; for (const [x, y] of [[8, 5], [24, 6], [29, 9], [3, 12], [32, 13]]) S[y][x] = 'b'; for (const [x, y] of [[6, 13], [20, 11], [28, 14]]) S[y][x] = 'o';
  fill(S, 2, 3, 7, 6, 'R'); fill(S, 3, 4, 6, 5, '.'); S[6][4] = 'p';   // the ledge on the left: rock round a shelf, the gap in its foot with the puddle
  fill(S, 12, 17, 23, 22, 'd'); fill(S, 12, 17, 23, 17, 'k'); fill(S, 12, 22, 23, 22, 'k'); fill(S, 12, 18, 12, 21, 'k'); S[17][17] = 'd';   // the ship's deck and its rails; the gangway comes over the bow rail
  fill(S, 24, 18, 27, 21, 'd'); fill(S, 24, 18, 27, 18, 'k'); fill(S, 24, 21, 27, 21, 'k'); S[19][27] = 'k'; S[20][27] = 'k';   // the stern
  defineMap('indra_shore', {
    name: 'East Indra Shore', w: 36, h: 26, base: 'water', music: 'sailing', bg: 'water', entry: { x: 15, y: 1 },
    build(M) {
      M.paint(0, 0, strs(S), LEG, { cliff: 'R', set: 'sandcliff', faces: 1 });
      M.exit(14, 0, 3, 1, 'world_tla', 156, 208, DIR.UP);
      M.object('puddle', 4, 6, { id: 'shore_puddle' }); M.container(4, 4, 'crate', 'Cookie', 1);
      if (G.flag('hasShip')) { M.fill(12, 16, 16, 7, 'water'); M.fillObj(12, 16, 16, 7, null); M.sign(17, 15, 'The Lemurian ship lies at anchor out on the water now.'); }
      else {
        M.walkable(17, 17); M.setObj(17, 17, null); M.setObj(17, 16, 'dock'); M.set(17, 16, 'dock'); M.walkable(17, 16);   // the gangway
        M.setObj(15, 19, 'mast'); M.setObj(21, 19, 'lc_door'); M.walkable(21, 19); M.exit(21, 19, 1, 1, 'lem_1', 7, 8, DIR.UP, { door: true, cond: () => !!G.flag('ship_door_open') });
        M.trigger(19, 18, 4, 4, T3.shipDoor, { cond: () => G.flag('piers_joined') && G.flag('madra_revisited') && !G.flag('ship_door_open') });
        M.trigger(16, 16, 3, 3, function* (E) { yield E.say("Then let's waste no time! We should set out for Madra at once!", 'Piers'); }, { cond: () => G.flag('shore_visited') && !G.flag('madra_revisited') });
        M.trigger(14, 9, 8, 3, T3.shoreArrival, { once: 'shore_visited', cond: () => G.flag('piers_joined') });
        M.trigger(14, 9, 8, 3, function* (E) { yield E.say("That ship... it has a bow like a sea-dragon. Madra's people said it was found here with a blue-haired man aboard.", 'Sheba'); yield E.say('Piers\'s ship, then. And it will not sail without its orb.', 'Kraden'); }, { once: 'shore_seen', cond: () => !G.flag('piers_joined') });
      }
      M.npc('shore_kid', 4, 8, { type: 'child_m', move: 'wander', text: () => G.flag('hasShip') ? 'The dragon ship sailed! I saw it go!' : 'That ship washed up here with a blue-haired man aboard. The Madra guards took him away!' });
      M.sign(9, 12, 'East Indra Shore. The ship that came out of the sea lies here.');
    }
  });
  T3.shoreArrival = function* (E) {
    yield E.say('My ship! At long last... I have returned to my ship.', 'Piers'); yield E.say('Well, Piers?', 'Kraden'); yield E.say("I'm thrilled... I'm just happy to be back with my ship.", 'Piers');
    yield E.say("Uh, that's not what Kraden's asking...", 'Sheba'); yield E.say('You forgot, didn\'t you, Piers? When we talked in Kibombo? Remember what Kraden asked? He wanted you to take us to your home... To Lemuria.', 'Jenna');
    yield E.say('Oh... Is it? I suppose we have to talk about it sooner or later. You shall have your answer.', 'Piers');
    yield E.say("Piers... if you do not wish to take us, you do not have to. Just tell me honestly. And if not, well, we'll just have to get ourselves a boat and find our own way to Lemuria.", 'Kraden');
    yield E.say('Kraden! Felix! Stop trying to pressure Piers!', 'Sheba'); yield E.say("Don't worry, Sheba... I've actually been thinking about this quite a bit. We will go to Lemuria, Kraden.", 'Piers');
    yield E.say('I figured it was too much to... What did you just say!?', 'Kraden'); yield E.say('I will take you to Lemuria. After what we\'ve been through, it would be wrong to deny you. You are truly good people.', 'Piers');
    yield E.say('So at long last I will finally reach Lemuria...', 'Kraden'); yield E.say("I'm actually excited to find out!", 'Jenna');
    if (G.flag('madra_revisited')) { yield E.say("We have said our goodbyes in Madra. Then let us waste no time, Felix! To my ship!", 'Piers'); return; }
    yield E.say("It just occurred to me... The mayor of Madra and his wife must be worried about me. I'd feel bad if I didn't let them know I was all right before leaving Indra. Can we stop by Madra briefly before we leave for Lemuria?", 'Piers');
    yield E.say("I have no objection, so why not? Let's go. But we must depart as soon as we're done at the mayor's house, Piers.", 'Kraden'); yield E.say('Oh, thank you!', 'Piers');
  };
  T3.shipDoor = function* (E) {
    yield E.say('At last, I\'m back on my ship. Finally, I can return to my beloved Lemuria. Wait there a moment.', 'Piers');
    Audio.sfx('psy'); Engine.doFlash(10, '#a0e0ff'); yield E.say('Piers holds the Black Crystal to the cabin door, and the seal on it fades.');
    yield E.say('To set sail, we must go down to the power chamber belowdecks. Let\'s head down.', 'Piers'); G.set('ship_door_open');
  };
  // ====================== below decks ======================
  const IL = { '.': 'floor_wood', 'p': 'pit', 'w': 'water', 'S': 'stairs_down', 'U': 'stairs_up', 'L': { ground: 'floor_wood', obj: 'ladder', walk: true }, 'D': { ground: 'floor_wood', obj: 'door' }, 'k': { ground: 'floor_wood', obj: 'crate' }, 'b': { ground: 'floor_wood', obj: 'barrel' }, 'h': 'cb_slide', 'm': 'marble', 'e': 'elem_mercury' };
  const room = (id, name, rows, opts, build) => defineMap(id, Object.assign({ name: 'Lemurian Ship - ' + name, w: rows[0].length, h: rows.length, base: 'void', music: 'sailing', bg: 'ship', indoor: true, enc: [], retreat: { map: 'indra_shore', x: 17, y: 15, dir: DIR.DOWN } }, opts, {
    build(M) { M.room(0, 0, rows[0].length, rows.length, 'floor_wood', 'wall_in'); M.paint(0, 0, strs(rows), IL, { cliff: null }); rows.forEach((r, y) => r.forEach((ch, x) => { if (ch === '#') M.setObj(x, y, 'wall_in'); })); build(M); }
  }));
  const stairs = (M, x, y, to, tx, ty, down) => { M.set(x, y, down ? 'stairs_down' : 'stairs_up'); M.setObj(x, y, null); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, DIR.DOWN, { stairs: true }); };
  const door = (M, x, y, to, tx, ty, dir, opts) => { M.setObj(x, y, 'door'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, Object.assign({ door: true }, opts || {})); };
  // an Aqua Jelly: touched, it fights; beaten, it is gone, and where it sat a puddle of it is left (if it sat over a gap)
  const jelly = (M, id, x, y, opts) => {
    opts = opts || {}; const flag = 'lem_jelly_' + id;
    if (G.flag(flag)) { if (opts.puddle) M.object('puddle', x, y, { id: 'lem_pud_' + id }); return; }
    M.npc('jelly_' + id, x, y, { foe: 'Aqua Jelly', name: 'Aqua Jelly', foeScale: 0.6, dir: DIR.DOWN, solid: true, fixed: true, script: function* (E) {
      const r = yield* E.battle(opts.pair ? ['Aqua Jelly', 'Aqua Jelly'] : ['Aqua Jelly'], { canFlee: false }); if (r !== 'win') return; G.set(flag);
      const n = E.field.npcs.find(a => a.id === 'jelly_' + id); if (n) n.hidden = true;
      if (opts.puddle) { const MM = G.field.map; MM.object('puddle', x, y, { id: 'lem_pud_' + id }); yield E.say('The jelly bursts, and what is left of it lies in a puddle where it was.'); }
      if (opts.after) yield* opts.after(E);
    } });
  };
  // the first room: the captain's cabin
  const R1 = grid(14, 10, '.');
  room('lem_1', 'Cabin', R1, { entry: { x: 7, y: 8 } }, (M) => {
    door(M, 7, 9, 'indra_shore', 21, 20, DIR.DOWN); stairs(M, 11, 7, 'lem_2', 3, 2, true);
    M.setObj(2, 2, 'bookshelf'); M.setObj(3, 2, 'bookshelf'); M.setObj(10, 2, 'shelf'); M.setObj(6, 4, 'table'); M.setObj(5, 4, 'chair'); M.setObj(1, 6, 'bed'); M.setObj(1, 7, 'bed_foot');
    M.signs.push({ x: 2, y: 2, text: "It looks like there's a captain's logbook in here. There's something about an unreported trip to Lemuria in here... I guess they were rushed." }); M.signs.push({ x: 10, y: 2, text: "It's pleasantly cool." });
    M.container(2, 8, 'barrel', 'Elixir', 1);
  });
  // the second: two jellies, the second over the gap before the Potion
  const R2 = grid(18, 12, '.');
  fill(R2, 13, 2, 13, 4, 'p'); fill(R2, 14, 1, 16, 1, '#'); fill(R2, 14, 5, 16, 5, '#');   // the nook with the chest, walled but for the gap
  room('lem_2', 'Below', R2, { entry: { x: 3, y: 2 } }, (M) => {
    stairs(M, 3, 1, 'lem_1', 11, 8, false); stairs(M, 3, 10, 'lem_3', 2, 2, true);
    jelly(M, 'a', 7, 6); jelly(M, 'b', 13, 3, { puddle: true });
    M.chest(16, 3, 'Potion', 1);
    M.setObj(9, 1, 'barrel'); M.setObj(10, 1, 'crate'); M.sign(5, 1, 'Water on the boards, and things that squelch in the dark. The hold is not empty.');
  });
  // the third: six jellies, the gap across the room, the lowest two sat over it; the crate for a third way over
  const R3 = grid(20, 14, '.');
  fill(R3, 1, 7, 18, 7, 'p');
  room('lem_3', 'Hold', R3, { entry: { x: 2, y: 2 } }, (M) => {
    stairs(M, 2, 1, 'lem_2', 3, 9, false); door(M, 17, 13, 'lem_4', 17, 10, DIR.DOWN);
    jelly(M, 'c', 5, 3); jelly(M, 'd', 10, 3); jelly(M, 'e', 15, 3); jelly(M, 'f', 12, 5); jelly(M, 'g', 6, 7, { puddle: true }); jelly(M, 'h', 13, 7, { puddle: true });
    M.object('crate', 9, 4, { id: 'lem_crate1' });
    M.sign(18, 3, 'The boards are gone across the middle of the hold; the bilge is a long way down.');
  });
  // the fourth: the way out is the door in the top left corner, past a gap the crate must be moved away from
  const R4 = grid(20, 12, '.');
  fill(R4, 4, 2, 4, 8, 'p'); fill(R4, 1, 9, 4, 9, '#');
  room('lem_4', 'Hold', R4, { entry: { x: 17, y: 10 } }, (M) => {
    door(M, 17, 11, 'lem_3', 17, 12, DIR.DOWN); door(M, 2, 1, 'lem_5', 2, 10, DIR.UP);
    jelly(M, 'i', 4, 4, { puddle: true }); jelly(M, 'j', 9, 6); jelly(M, 'k', 13, 3);
    M.object('crate', 5, 4, { id: 'lem_crate2' }); M.container(16, 2, 'crate', 'Antidote', 1);
    M.sign(7, 9, 'The door out is in the far corner, over the gap. The crate in front of it is in the way.');
  });
  // the fifth: the jelly that runs, and the ladder it runs down
  const R5 = grid(18, 12, '.');
  room('lem_5', 'Passage', R5, { entry: { x: 2, y: 9 } }, (M) => {
    door(M, 2, 11, 'lem_4', 2, 2, DIR.DOWN);
    if (!G.flag('lem_j9_fled')) M.npc('jelly_run', 9, 5, { foe: 'Aqua Jelly', name: 'Aqua Jelly', foeScale: 0.6, dir: DIR.DOWN, solid: true, text: '...' });
    M.trigger(6, 3, 3, 6, function* (E) { const n = E.field.npcs.find(a => a.id === 'jelly_run'); if (n) { yield E.say('The jelly quivers at the sight of the party - and slithers away down the ladder!'); n.hidden = true; } G.set('lem_j9_fled'); }, { once: 'lem_j9_fled_seen' });
    M.setObj(14, 8, 'ladder'); M.walkable(14, 8); M.exit(14, 8, 1, 1, 'lem_5b', 3, 3, DIR.DOWN, { stairs: true, cond: () => !!G.flag('lem_j9_fled') });
    M.sign(15, 2, 'A ladder goes down to the lower level.');
  });
  // the lower level: the jelly cornered on the platform's cell; frozen, the platform stays up
  const R5b = grid(18, 10, '.');
  R5b[5][9] = 'h'; fill(R5b, 9, 1, 9, 4, '#'); fill(R5b, 9, 6, 9, 8, '#');
  room('lem_5b', 'Lower Level', R5b, { entry: { x: 3, y: 3 }, fall: () => ({ map: 'lem_5b', x: 3, y: 5 }) }, (M) => {
    M.setObj(3, 2, 'ladder'); M.walkable(3, 2); M.exit(3, 2, 1, 1, 'lem_5', 14, 7, DIR.UP, { stairs: true });
    jelly(M, 'l', 9, 5, { puddle: true, after: function* (E) { yield E.say('The platform in the gap sinks and rises under the puddle it left. Frozen, it would hold.', 'Piers'); } });
    door(M, 17, 5, 'lem_6', 1, 5, DIR.RIGHT);
    M.sign(5, 2, 'A moving platform crosses the gap, and it drops away under any weight.');
  });
  // the sixth: the barrel with the Oil Drop, and the stair down to the flooded deck
  const R6 = grid(14, 10, '.');
  room('lem_6', 'Store', R6, { entry: { x: 1, y: 5 } }, (M) => {
    door(M, 0, 5, 'lem_5b', 16, 5, DIR.LEFT); stairs(M, 11, 8, 'lem_7', 3, 2, true);
    M.container(11, 2, 'barrel', 'Oil Drop', 1); M.setObj(3, 1, 'crate'); M.setObj(4, 1, 'crate'); M.setObj(8, 1, 'barrel');
  });
  // the seventh: the jelly that is all the jellies - the Aqua Hydra; then the water
  const R7 = grid(20, 14, '.');
  room('lem_7', 'Bilge', R7, { entry: { x: 3, y: 2 } }, (M) => {
    stairs(M, 3, 1, 'lem_6', 11, 7, false); door(M, 0, 4, 'lem_8', 8, 2, DIR.LEFT);
    if (G.flag('aqua_hydra_done')) { M.fill(1, 6, 18, 7, 'water'); M.fillObj(1, 6, 18, 7, null); M.sign(2, 5, 'The water stands where the Hydra fell; a chest is lost under it, for now.'); }
    else { M.chest(16, 10, 'Mist Potion', 1); M.boss('Aqua Jelly', 10, 7, { id: 'jelly_hydra', foeScale: 0.7, done: 'aqua_hydra_done', script: T3.aquaHydra }); }

  });
  T3.aquaHydra = function* (E) {
    yield E.say('The jelly does not run. It swells - and every jelly in the ship comes squelching down the stair to it, and they melt together into one thing, heads and all!');
    { const j = E.field.npcs.find(a => a.id === 'jelly_hydra'); if (j) j.hidden = true; }   /* the jelly is the hydra now */
    const r = yield* E.ambush(['Aqua Hydra'], { boss: true, canFlee: false, music: 'boss' }, { at: [[10, 7]], scale: 1.2, sfx: 'boom', say: 'An Aqua Hydra! Fire, everyone - it hates fire!' }); if (r !== 'win') { const j = E.field.npcs.find(a => a.id === 'jelly_hydra'); if (j) j.hidden = false; return; }
    G.set('aqua_hydra_done'); const n = E.field.npcs.find(a => a.id === 'jelly_hydra'); if (n) n.hidden = true;
    Engine.doShake(20); Audio.sfx('water'); yield E.say('The Hydra bursts, and all the water that was in it floods the lower deck to the knee!');
    const MM = G.field.map; MM.fill(1, 6, 18, 7, 'water'); MM.fillObj(1, 6, 18, 7, null); MM.finalize();
    if (E.field.player.ty >= 6) { yield E.say('(The party splashes back up to the dry boards by the stair!)'); E.warpNow('lem_7', 10, 5, DIR.DOWN); }   // whoever fought it from below is not left standing in the flood
    yield E.say('The chest by the far wall is under it now. We will not get at that until the ship is dry - or Piers has a way to make it so.', 'Kraden');
    yield E.say('The bilge stair is on this side of the water, Felix. Down to the power chamber.', 'Piers');
  };
  // the eighth: the two pillars, Douse on the right one, the mark on the floor
  const R8 = grid(16, 12, '.');
  room('lem_8', 'Bilge Stair', R8, { entry: { x: 8, y: 1 } }, (M) => {
    door(M, 8, 1, 'lem_7', 1, 4, DIR.UP); door(M, 8, 11, 'lem_engine', 8, 2, DIR.DOWN, { cond: () => !!G.flag('lem_corridor_open') });
    M.set(8, 8, 'elem_mercury');
    M.object('pillar', 5, 5, { id: 'lem_pil_l', tile: 'pillar' });
    M.object('pillar', 11, 5, { id: 'lem_pil_r', douseable: true, onMove: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'lem_pil_r'); if (o && o.state === 'wet' && o.x === 8 && o.y === 8 && !G.flag('lem_corridor_open')) { G.set('lem_corridor_open'); Engine.doShake(12); Audio.sfx('push'); yield E.say('The full pillar settles on the mark, and the water in it runs down into the floor. Something below groans, and the door to the corridor slides open.'); } } });
    M.sign(2, 2, 'Two pillars of the same stone, hollow. One is dry, one has a crack. A mark of a drop of water is on the floor between them.');
  });
  // the power chamber
  const R9 = grid(16, 10, '.');
  fill(R9, 6, 3, 9, 5, 'm'); R9[4][7] = 'e'; R9[4][8] = 'e';
  room('lem_engine', 'Power Chamber', R9, { entry: { x: 8, y: 2 } }, (M) => {
    door(M, 8, 1, 'lem_8', 8, 10, DIR.UP);
    M.setObj(7, 3, 'psystone'); M.setObj(8, 3, 'psystone');
    M.trigger(6, 5, 4, 2, T3.shipEngine, { once: 'ship_engine_on' });
  });
  T3.shipEngine = function* (E) {
    yield E.say("How did all these monsters get on board? I could swear I locked the door when I left... It doesn't matter. Once I get this ship moving, I'm sure they'll all jump ship. OK, now, I must set the black orb into this pedestal.", 'Piers');
    G.inventory.remove('Black Crystal'); Engine.doFlash(20, '#a0e0ff'); Audio.sfx('psy'); Engine.doShake(20); yield 20;
    yield E.say('The chamber lights from end to end, and the whole ship shudders and lifts. Everyone runs up on deck.');
    yield E.say('Take the tiller, Felix!', 'Piers'); yield E.say("If you hope to reach Lemuria, you'll have to learn a few things about handling a ship. I think we ought to sail the Eastern Sea until you get the hang of it.", 'Piers');
    yield E.say("Kraden, shouldn't we be heading straight for Lemuria?", 'Sheba'); yield E.say("Well, I suppose if we have to learn to sail, it's better to do it sooner than later...", 'Kraden');
    yield E.say('Then I want to go to Lalivero! And Tolbi! Oh! And Vale! Can we go to Vale?', 'Jenna'); yield E.say("I don't think that's a good idea. The coastline of Angara is surrounded by rocky cliffs... and as for Gondowan, I would guess the people from Lalivero are looking for us.", 'Kraden');
    yield E.say("And then they'd make me stay in Lalivero! Would you just leave me there, Felix?", 'Sheba'); yield E.say("Oh yeah... Maybe that wouldn't be such a good idea after all...", 'Jenna');
    yield E.say("The sea is vast... We can go wherever we please! So, let's explore a bit, Felix!", 'Kraden'); yield E.say("That's a great idea! I'm sure there's even more out there waiting for us to find it!", 'Sheba');
    if (!G.flag('hasShip')) { G.set('hasShip'); const berth = worldTlaLanding('indra_shore', DIR.DOWN, true) || { x: 156, y: 210 }; G.set('shipX', berth.x); G.set('shipY', berth.y); yield* E.chapter('Chapter 3: The Open Sea'); }
    yield Engine.fadeOut(20); G.set('onShip', true); E.field.loadMap('world_tla', G.get('shipX'), G.get('shipY'), DIR.DOWN, { ship: true, keepShip: true }); Audio.play('sailing'); yield Engine.fadeIn(20);
  };
}
