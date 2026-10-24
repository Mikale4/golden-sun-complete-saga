// ---------- Kolima Bridge ----------
// The drawbridge over the river south-east of Kolima, from the reference rip (KBRIDGE_LAYOUT, tools/town_gen.py
// kbridge): the road comes down between the cliffs to the purple gate, whose deck of logs stands raised inside the
// frame until the keeper works the winch beside it - and the keeper is a tree until Tret's curse lifts.
'use strict';

defineMap('kolima_bridge', {
  name: 'Kolima Bridge', w: 18, h: 26, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 10, y: 1 },
  build(M) {
    const L = KBRIDGE_LAYOUT.bridge; const down = G.flag('kolima_bridge_fixed');
    valeGround(M, L, { legend: { 'B': 'water' } });
    // the frame of the gate, the bar over the road, the winch on the right post
    for (const y of [9, 10, 11, 12]) { M.setObj(8, y, 'drawgate_post'); M.setObj(12, y, 'drawgate_post'); }
    for (const x of [9, 10, 11]) M.setOver(x, 9, 'drawgate_bar');
    M.setObj(13, 10, 'winch');
    kbridgeDeck(M, down);
    M.exit(9, 0, 3, 1, 'world_gs1', 70, 22, DIR.UP); M.exit(9, 25, 3, 1, 'world_gs1', 70, 26, DIR.DOWN);
    // the keeper: one of Kolima's people, rooted at his post until the curse lifts
    if (G.flag('tret_cured')) M.npc('bridge_keeper', 13, 11, { type: 'villager_m', name: 'Bridge Keeper', dir: DIR.LEFT, text: () => G.flag('kolima_bridge_fixed') ? "The road south is open again. Mind the planks, they're older than I am." : "Are you going to cross the bridge?", script: G.flag('kolima_bridge_fixed') ? undefined : STORY.kolimaBridge });
    else M.npc('bridge_keeper_tree', 13, 11, { animal: 'sapling', animalCol: '#68a850', name: 'Tree', text: '(A young tree stands at the winch, one branch resting on the drum as though it had been turning it when it stopped being a man.)', mind: "The bridge... I must raise the bridge before dark. Why won't my arms move?" });
    M.trigger(9, 8, 3, 1, STORY.kolimaBridge, { cond: () => !G.flag('kolima_bridge_fixed') });
    M.sign(7, 8, () => G.flag('kolima_bridge_fixed') ? "Kolima Bridge. South to Fuchin and the Mogall woods." : "Kolima Bridge. 'The keeper lowers the deck for travellers. Call across if he is at his post.'");
  }
});
// the deck: raised, it is a wall of logs inside the frame; lowered, it lies over the bank and the water to the far side
function kbridgeDeck(M, down) {
  for (const x of [9, 10, 11]) {
    for (const y of [9, 10, 11]) { if (down) { M.setObj(x, y, null); M.walkable(x, y); } else { M.setObj(x, y, 'drawbridge_up'); M.block(x, y); } }
    for (const y of [12, 13, 14, 15]) { if (down) { M.setObj(x, y, 'plank_v_' + (x === 9 ? 'w' : x === 11 ? 'e' : '') + '_' + (y === 12 ? 't' : y === 15 ? 'b' : '')); M.walkable(x, y); } else { M.setObj(x, y, null); M.block(x, y); } }
  }
}
