// ---------- Goma Cave ----------
// The pass between Vault's side of the range and Bilibin's, from the reference rip (GOMA_LAYOUT and GOMA_OUT_LAYOUT,
// tools/dungeon_gen.py goma and tools/town_gen.py goma_out): the falls outside its mouth where Ivan catches the party
// up, the long cavern with the stream and the pebbled ledge, the great cavern east with the Lucky Medal's ledge, the
// pillar that opens the way to the Djinni Forge, the pool below, and the upper cavern with its bridge and the way out
// to Bilibin.
'use strict';

const GOMA_LEGEND = {
  'c': 'cave', ':': 'cave', '~': 'cave_water', 'B': { ground: 'cave', obj: 'log_bridge', walk: true },
  'S': { ground: 'stonefloor', walk: true }, 'l': { obj: 'torch' }
};
const GOMA_ENC = [['Bat II', 'Bat II'], ['Skeleton'], ['Ghost'], ['Slime', 'Slime'], ['Will Head'], ['Zombie']];
const GOMA_RETREAT = { map: 'goma_out', x: 12, y: 6, dir: DIR.DOWN };
function gomaCave(id, name, rows, entry, build) {
  defineMap(id, { name, w: rows[0].length, h: rows.length, base: 'void', music: 'dungeon', bg: 'cave', entry, enc: GOMA_ENC, retreat: GOMA_RETREAT,
    build(M) {
      M.paint(0, 0, rows, GOMA_LEGEND, { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' });
      // a cave mouth in the rock: the doorway cell keeps the wall's look but lets the player through
      build(M);
    } });
}
// a doorway in a cave wall: a dark opening and the way through it
function gomaDoor(M, x, y, to, tx, ty, dir) { M.set(x, y, 'cave'); M.setObj(x, y, 'door_cave'); M.walkable(x, y); M.exit(x, y, 1, 1, to, tx, ty, dir, { door: true }); }

// ---- the falls outside: the river to jump, the pillars, the ivy over the cave mouth ----
defineMap('goma_out', {
  name: 'Goma Cave', w: 31, h: 25, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 5, y: 24 }, enc: [['Vermin', 'Vermin'], ['Bat', 'Bat'], ['Wild Mushroom']],
  build(M) {
    const L = GOMA_OUT_LAYOUT.out;
    M.paint(0, 0, L.rows, Object.assign({}, VALE_LEGEND, { 'D': { ground: 'grass', obj: 'door_cave' } }), { set: 'cliff', faces: 2 });
    // the fall's lip and foam come from the waterfall pieces themselves (field.js autoPiece)
    for (const [x, y, red] of L.trees) M.tall(red ? 'tree_red_tall' : 'tree_tall', x, y);
    for (const [x, y] of L.bushes) M.setObj(x, y, 'bush');
    // the river is jumped where it runs one tile wide
    M.set(9, 17, 'cave_water');
    M.exit(3, 24, 5, 1, 'world_gs1', 51, 19, DIR.DOWN);
    M.walkable(12, 2); M.exit(12, 2, 1, 1, 'goma_left', 16, 46, DIR.UP, { door: true, cond: () => G.flag('goma_ivy_cleared') });
    // the two pillars on the terraces, and the stump caught in the ivy before the cave mouth
    M.object('pillar', 14, 8, { id: 'goma_p1' }); M.object('pillar', 24, 11, { id: 'goma_p2' });
    M.object('vines', 12, 3, { id: 'goma_ivy', reveal: null, onClear: function* (E) { G.set('goma_ivy_cleared'); yield E.say('The ivy tears away and the stump rolls aside. The mouth of Goma Cave stands open.'); } });
    M.trigger(11, 4, 3, 2, STORY.gomaIvan, { once: 'goma_ivan_scene', cond: () => !G.flag('goma_ivy_cleared') });
    M.npc('goma_traveler', 4, 20, { type: 'villager_m', text: "The cave leads through to Bilibin, but the mouth's all grown over. Nobody's been through in months.", mind: "Probably for the best. There are things in that cave." });
  }
});

// ---- the long cavern: in from the falls, the stream, the pebbled ledge north, doors east and west ----
gomaCave('goma_left', 'Goma Cave', GOMA_LAYOUT.left, { x: 16, y: 46 }, M => {
  M.exit(16, 48, 1, 1, 'goma_out', 12, 3, DIR.DOWN, { door: true });
  gomaDoor(M, 16, 4, 'goma_top', 7, 16, DIR.UP); gomaDoor(M, 3, 29, 'goma_right', 3, 7, DIR.DOWN); gomaDoor(M, 30, 26, 'goma_right', 34, 7, DIR.DOWN);
  for (const [x, y] of [[9, 14], [10, 23], [23, 10], [27, 10], [30, 26]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
  M.trigger(15, 44, 3, 2, STORY.gomaEnter, { once: 'goma_entered' });
});
// ---- the upper cavern: the bridge over the pool and the way out to Bilibin ----
gomaCave('goma_top', 'Goma Cave', GOMA_LAYOUT.top, { x: 7, y: 16 }, M => {
  gomaDoor(M, 7, 16, 'goma_left', 16, 5, DIR.DOWN);
  M.exit(32, 17, 1, 1, 'world_gs1', 53, 19, DIR.DOWN);
  M.setObj(33, 7, 'torch'); M.light(33, 7, 3);
});
// ---- the great cavern east: the pillar that opens the Djinni's alcove, the Lucky Medal's ledge ----
gomaCave('goma_right', 'Goma Cave', GOMA_LAYOUT.right, { x: 3, y: 7 }, M => {
  gomaDoor(M, 3, 6, 'goma_left', 3, 30, DIR.DOWN); gomaDoor(M, 34, 6, 'goma_left', 30, 27, DIR.DOWN);
  gomaDoor(M, 12, 6, 'goma_pool', 5, 3, DIR.DOWN); gomaDoor(M, 30, 9, 'goma_pool', 23, 6, DIR.DOWN); gomaDoor(M, 31, 22, 'goma_pool', 24, 19, DIR.DOWN);
  for (const [x, y] of [[15, 1], [22, 1], [6, 11], [17, 11], [31, 12], [21, 15], [25, 24], [30, 22]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
  M.chest(25, 4, 'Lucky Medal', 1);
  // the Lucky Medal's ledge: reached by a jump from the one cell the tall pillar stands on - Move it aside first
  for (const [x, y] of [[23, 6], [25, 6]]) { M.setObj(x, y, 'cavewall'); M.block(x, y); }
  M.set(24, 6, 'pit'); M.setObj(24, 6, null); M.block(24, 6); M.object('hop', 24, 6, { id: 'goma_hop' });
  M.object('pillar', 24, 7, { id: 'goma_tall' });
  // the small fat pillar and its place: on the mark it opens the gate to the Djinni's alcove
  M.set(22, 10, 'elem_mars');
  M.object('pillar', 22, 7, { id: 'goma_pillar', onMove: function* (E) { const o = G.map.objects.find(ob => ob.id === 'goma_pillar'); if (o && o.x === 22 && o.y === 10 && !G.flag('goma_gate')) { G.set('goma_gate'); const g = G.map.objects.find(ob => ob.id === 'goma_gate'); if (g) { g.state = 'open'; G.set('obj:' + g.key, { state: 'open' }); } Engine.doShake(8); Audio.sfx('quake'); yield E.say('The pillar settles onto the mark. Along the wall, a stone door slides open!'); } } });
  M.object('gate', 36, 9, { id: 'goma_gate', state: G.flag('goma_gate') ? 'open' : 'closed' });
  M.djinni('Forge', 39, 9, { fight: true });
  M.npc('goma_man', 34, 14, { type: 'villager_m', name: 'Man', text: () => G.party.djinnFound.includes('Forge') ? "You caught that little fire spirit? Well done! I'll be heading on to Bilibin, then." : "There's a little creature of fire hiding behind that door. I've been trying to work out the pillar for an hour.", mind: "If those kids can shift that pillar, the door will open. I'm sure of it." });
});
// ---- the pool below, crossed on the stones ----
gomaCave('goma_pool', 'Goma Cave', GOMA_LAYOUT.pool, { x: 5, y: 3 }, M => {
  gomaDoor(M, 5, 2, 'goma_right', 12, 7, DIR.DOWN); gomaDoor(M, 23, 5, 'goma_right', 30, 10, DIR.DOWN); gomaDoor(M, 24, 18, 'goma_right', 31, 23, DIR.DOWN);
  for (const [x, y] of [[9, 1], [20, 4], [1, 9], [23, 17]]) { M.setObj(x, y, 'torch'); M.light(x, y, 3); }
});
