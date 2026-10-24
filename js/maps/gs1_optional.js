// ---------- The optional caves of Golden Sun ----------
// The side places the walkthrough's chapter 8 ("Some Backtracking") and its optional notes describe, none of them
// on the map rips: Vale Cave behind the boulder by Kraden's cabin (a hidden pole Reveal shows, crates walked into
// the pool, the Halt Gem, and Kite, who runs until Halt stops him); Vault Cave under the six gravestones (Reveal
// opens the way; the right branch's chest is a Mimic, the left holds the Vambrace, and Sap waits at the end only
// if the watchtower bell was rung); West Lunpa Cave, the back way into Lunpa with its half-closed gate over a
// puddle that Frost props open; and Gateway Cave off Suhalla Gate, where Iodem tries the Black Orb on a wreck.
'use strict';

// ---- Vale Cave ----
const VC_LEGEND = { '.': 'cave', 'w': 'water', 'D': 'cave', 'L': { ground: 'cave', obj: 'grey_rock' }, 'P': 'cave', 'S': 'stairs' };
const VC_ROWS = [
  '########################',
  '##.......#####.......###',
  '##.......#####.......###',
  '##..wwwww.####.......###',
  '##..wwwww.####..#....###',
  '##..w.....####..#....###',
  '##..wwwww.######.....###',
  '##..wwwww.......#.####..',
  '##..wwwww.......L.......',
  '##..wwwww.####..########',
  '#........#####..........',
  '#........#####..########',
  '#.....###..............#',
  '#.....###..............#',
  '#.....###.wwwwwwwwwww..#',
  '#.....###.wwwwwwwwwww..#',
  '#.....###.wwwwwwwwwww..#',
  '#.....###..............#',
  '#########..............#',
  '#########..#############',
  '#########..#############',
  '######.........#########',
  '######.........#########',
  '######.........#########',
  '######.........#########',
  '########################',
];
defineMap('vale_cave', {
  name: 'Vale Cave', w: 24, h: 26, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 1, y: 10 }, enc: [['Fighter Bee', 'Fighter Bee'], ['Ghost Mage'], ['Mad Vermin', 'Mad Vermin'], ['Ravager']], retreat: { map: 'vale_north', x: 7, y: 9, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, VC_ROWS, VC_LEGEND, { cliff: '#', set: 'greyrock', faces: 2 });
    M.walkable(0, 10); M.exit(0, 10, 1, 1, 'vale_north', 7, 9, DIR.DOWN, { door: true });
    // the hidden pole in the wall east of the pool: seen under Reveal, and then the way east is open
    if (G.flag('vale_pole_seen')) { M.setObj(16, 8, null); M.walkable(16, 8); } else M.hidden.push({ x: 16, y: 8, tile: 'cave' });
    M.trigger(17, 8, 1, 1, function* (E) { G.set('vale_pole_seen'); const M2 = G.map; M2.setObj(16, 8, null); M2.walkable(16, 8); M2.hidden = M2.hidden.filter(h => !(h.x === 16 && h.y === 8)); M2.finalize(); }, { once: 'vale_pole_seen' });
    // two crates on the pool's east bank: Move one into the water and it is a stepping stone across
    M.object('crate', 3, 5, { id: 'vc_crate_1' });
    M.chest(3, 1, 'Nut', 1);
    // the logs across the lower pool: rolled into the water they make the way over to the Halt Gem
    M.object('log', 12, 13, { id: 'vc_log_a', horiz: true, len: 3 }); M.object('log', 12, 17, { id: 'vc_log_b', horiz: true, len: 3 });
    M.chest(21, 12, 'Halt Gem', 1);
    M.chest(1, 12, 'Power Bread', 1);
    // Kite: skittish - he flits away when the party comes near, until Halt holds him still
    if (!(G.party ? G.party.djinnFound : []).includes('Kite')) {
      M.npc('KiteNPC', 10, 22, { animal: 'djinni', animalCol: 3, name: 'Kite', haltable: true, solid: true,
        script: function* (E) { const n = E.actor('KiteNPC'); if (n && n.halted > 0) { yield E.say("The Jupiter Djinni, held fast by Halt, stops struggling... and laughs."); yield E.say("Kite: 'Caught fair! I'm yours - no need to fight me. Let's fly together!'", 'Kite'); n.hidden = true; G.set('kite_caught'); yield* E.djinn('Kite'); return; }
          yield E.say("The Djinni squeaks and darts away across the chamber!"); const a = E.actor('KiteNPC'); if (a) { const spots = [[7, 21], [13, 21], [7, 24], [13, 24], [10, 22]]; const s = spots[Math.floor(Math.random() * spots.length)]; a.tx = s[0]; a.ty = s[1]; a.px = a.tx * TILE; a.py = a.ty * TILE; } } });
    }
    M.sign(10, 20, "Something small and quick is hiding in the chamber below. It won't be caught by hand.");
  }
});

// ---- Vault Cave ----
const VLC_LEGEND = { '.': 'cave', 'S': 'stairs' };
const VLC_ROWS = [
  '##########################',
  '###########.S.############',
  '###########...############',
  '###########...############',
  '###########...############',
  '#####..............#######',
  '#####.########.#..########',
  '#####.########.#..########',
  '#####.########.#..........',
  '#####.########.#...######.',
  '##....###.......####...##.',
  '##....###.....#.####...##.',
  '##....###.....#.####...##.',
  '##....##......#.####...##.',
  '##.......#....#.....#.....',
  '########.#....########....',
  '########.#....############',
  '########.#....############',
  '####......###.############',
  '####......###.############',
  '####......###.############',
  '####......###.############',
  '####......###..###########',
  '####......###...##########',
  '##########################',
];
defineMap('vault_cave', {
  name: 'Vault Cave', w: 26, h: 25, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 2 }, enc: [['Cave Troll'], ['Death Cap', 'Death Cap'], ['Fighter Bee', 'Fighter Bee'], ['Gargoyle'], ['Ghost Mage'], ['Ravager']], retreat: { map: 'vault', x: 13, y: 24, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, VLC_ROWS, VLC_LEGEND, { cliff: '#', set: 'greyrock', faces: 2 });
    M.walkable(12, 1); M.exit(12, 1, 1, 1, 'vault', 13, 24, DIR.DOWN, { stairs: true });
    M.chest(21, 11, 'Herb', 1, { mimic: 'Mimic' });   // the right branch's chest is a Mimic
    M.chest(6, 11, 'Vambrace', 1);
    M.chest(24, 14, 'Lucky Medal', 1);
    // Sap, at the end - if the bell on Vault's watchtower was rung
    if (G.flag('vault_bell')) M.djinni('Sap', 6, 21, { fight: true });
    else M.sign(6, 21, "A hollow in the rock, big enough for something small to sleep in. Empty... for now.");
    M.sign(12, 4, "Bones of Vault's dead lie above. The tunnel was dug by the thieves, or by something older.");
  }
});

// ---- West Lunpa Cave: the back way into Lunpa from the north ----
const WLC_LEGEND = { '.': 'cave', 'D': 'cave' };
const WLC_ROWS = [
  '######################',
  '#...........#....#####',
  '#..########.#.##.#####',
  '#.#########.#.##.#####',
  '#.#########...##......',
  '#.####################',
  '#.....................',
  '#####################.',
  '......................',
  '######################',
];
defineMap('west_lunpa_cave', {
  name: 'West Lunpa Cave', w: 22, h: 10, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 1, y: 8 }, enc: [['Slime Beast'], ['Ravager'], ['Ghost Mage']], retreat: { map: 'world_gs1', x: 64, y: 34, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, WLC_ROWS, WLC_LEGEND, { cliff: '#', set: 'greyrock', faces: 2 });
    M.walkable(0, 8); M.exit(0, 8, 1, 1, 'world_gs1', 64, 34, DIR.LEFT);
    M.trigger(1, 7, 2, 3, STORY.bunzaWagon, { cond: () => G.flag('hammet_freed') && !G.flag('hammet_rescued') });   // Hammet and Bunza's wagon outside the mouth
    M.walkable(21, 4); M.exit(21, 4, 1, 1, 'lunpa', 1, 8, DIR.RIGHT, { door: true, cond: () => G.flag('lunpa_gate_propped') });
    // the half-closed gate at the cave's Lunpa end, a puddle under it: Frost raises a pillar that props it open
    M.object('gate', 21, 4, { id: 'wlc_gate', state: G.flag('lunpa_gate_propped') ? 'open' : 'shut' });
    M.object('puddle', 20, 4, { id: 'wlc_puddle', onFrost: function* (E) { G.set('lunpa_gate_propped'); const o = G.map.objects.find(ob => ob.id === 'wlc_gate'); if (o) { o.state = 'open'; G.set('obj:' + o.key, { state: 'open' }); } yield E.say("The ice pillar shoves the gate up on its hinges and holds it. The way into Lunpa is open."); } });
    M.chest(2, 2, 'Elixir', 1);   // in a niche off the corridor, never in its way
  }
});

// ---- Gateway Cave: the cove off Suhalla Gate with the old wreck ----
const GWC_LEGEND = { '.': 'cave', 'w': 'water', 's': 'sand' };
const GWC_ROWS = [
  '########.#############',
  '#####........#########',   // 1
  '###............#######',
  '##..wwwwwwww....######',   // 3
  '##.wwwwwwwwwww...#####',
  '##.wwwwwwwwwwww...####',   // 5
  '##.wwwwwwwwwwwww..####',
  '##..wwwwwwwwwww...####',   // 7
  '###..wwwwwwwww..s..###',
  '####...wwwww...sss.###',   // 9
  '#####.........sss..###',
  '######.......#####.###',   // 11
  '#######.....##########',
  '########...###########',   // 13
  '########...###########',
  '########.D.###########',   // 15
  '######################',
];
defineMap('gateway_cave', {
  name: 'Gateway Cave', w: 22, h: 17, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 9, y: 14 }, enc: [['Salamander'], ['Fighter Bee', 'Fighter Bee']], retreat: { map: 'suhalla_gate', x: 95, y: 28, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, GWC_ROWS, GWC_LEGEND, { cliff: '#', set: 'brownrock', faces: 2 });
    M.walkable(9, 15); M.exit(9, 15, 1, 1, 'suhalla_gate', 95, 28, DIR.DOWN, { door: true });
    // the cave runs on north to Idejima; a Psynergy Stone on the way, with an ant behind it
    M.set(8, 1, 'cave'); M.setObj(8, 1, null); M.walkable(8, 1); M.exit(8, 1, 1, 1, 'idejima', 12, 3, DIR.DOWN, { cond: () => !G.flag('idejima_broken') });
    M.setObj(10, 1, 'psystone'); M.block(10, 1);
    M.trigger(9, 2, 3, 1, T3.gatewayAnt, { once: 'gateway_ant', cond: () => G.flag('prologue_jenna') });
    // the wreck on the shingle: an old hull, keel up
    M.setObj(15, 8, 'boat_wreck'); M.setObj(16, 9, 'boat_wreck');
    M.chest(3, 9, 'Vial', 1);
    M.trigger(13, 9, 3, 2, STORY.gatewayWreck, { once: 'gateway_wreck', cond: () => G.flag('babi_permission') && !G.flag('venus_lit') });
    M.sign(10, 10, "A cove under the gate, open to the sea. Something has been washed up on the shingle.");
  }
});
STORY.gatewayWreck = function* (E) {
  yield E.say("A wreck! Look at the timbers - that's no fishing boat.", 'Garet');
  E.spawn('IodemGW', 12, 10, { look: NPC_LOOKS.Iodem, name: 'Iodem', dir: DIR.RIGHT });
  yield E.say("Isaac! I followed you down. Lord Babi asked me to look at this hull - he thinks it might be Lemurian, like the ship that once carried him.", 'Iodem');
  yield E.say("He gave me this. The Black Orb. If the wreck is Lemurian, the Orb should wake it.", 'Iodem');
  yield E.say("(Iodem holds the Black Orb out toward the wreck. Nothing. Not a creak.)"); yield 40;
  yield E.say("...No. It's just a wreck. A Lemurian hull would have answered. I'll take the Orb back to Lord Babi - he'll be disappointed.", 'Iodem');
  yield E.say("Go on to Lalivero. I'll follow when I've had a closer look at these timbers.", 'Iodem');
  E.despawn('IodemGW');
};
