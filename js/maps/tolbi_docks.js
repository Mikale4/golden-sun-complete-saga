// ---------- Tolbi Docks ----------
// Traced from map references/golden-sun-tolbi-docks-gba-map.webp (the dock panel, grid phase (0,12)): the wooded
// terrace above the sea with the sailors' thatched house, the crate pen in the north-west corner that walls off
// the Potion (walk the crates north to open it), the stair down to the lower field, and the long wooden pier with
// its barrels and the box of coins at its head, where the Tolbi-bound ship ties up. The road out runs west.
'use strict';
const TD_LEGEND = {
  '.': 'grass', 'p': 'path', '~': 'water', 'd': 'dock', 'b': 'bridge',
  'T': { ground: 'grass', obj: 'tree' }, 'R': { ground: 'grass', obj: 'tree_red' }, 'v': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'w': { ground: 'grass', obj: 'flower' },
  'f': { ground: 'grass', obj: 'fence' }, 'g': { ground: 'grass', obj: 'fence_v' }, 'k': { ground: 'grass', obj: 'crate' }, 'o': { ground: 'grass', obj: 'pot' },
  'j': { ground: 'dock', obj: 'pot' }, 'B': { ground: 'dock', obj: 'barrel' }, 'K': { ground: 'dock', obj: 'crate' }, 'S': 'stairs',
};
const TD_ROWS = [
  'TTTTTTTTTTTTTTTTTTTTTT~~~~~~',   // 0
  'TT...TTTTTTTTTTTTTTTT#~~~~~~',   // 1   the Potion's pocket
  'TT...TTTTTTTTTTTTTTTT#~~~~~~',   // 2
  'R....R...kk.......R.T#~~~~~~',   // 3
  '....f..f.............#~~~~~~',   // 4   the pen's mouth at x5..6
  'R...g..g....o.......k#~~~~~~',   // 5
  '....g..g............k#~~~~~~',   // 6
  '....g..g....o.........#~~~~~',   // 7
  '....g..g............o.#~~~~~',   // 8
  '....g..g.............##~~~~~',   // 9   the pen opens south
  '.....................#~~~~~~',   // 10
  '......w.........w....#~~~~~~',   // 11
  '#############S####...#~dd~~~',   // 12  the stair down; the coin box at the pier head
  '#############S####...#~dd~~~',   // 13
  '.............S...###.#~dd~~~',   // 14
  '....ppppppp..S...####~~dd~~~',   // 15
  'pppp.......ppp.......~~ddb~~',   // 16  the road in from the west; the gangplank to the ship at x25..26
  '.......w...ppp.......~~ddb~~',   // 17
  '....v......ppp.......~~jd~~~',   // 18
  '.R.........ppp...r...~~dd~~~',   // 19
  '...........ppp.......~~Bd~~~',   // 20
  '.....R.....ppp.......~~dd~~~',   // 21
  'R.....R....ppp....bbbbbdd~~~',   // 22  the planks from the field to the pier
  '..R........ppp.......~~dj~~~',   // 23
  '...........###.......~~jd~~~',   // 24
  'R..R.......####r.....~~dB~~~',   // 25
  'TTTTTTTTTTT####TTTTTT~~dd~~~',   // 26
];
defineMap('tolbi_docks', {
  name: 'Tolbi Docks', w: 28, h: 27, base: 'grass', music: 'town', bg: 'water', entry: { x: 1, y: 16 },
  build(M) {
    M.paint(0, 0, TD_ROWS, TD_LEGEND, { set: 'cliff', faces: 2 });
    M.house(13, 4, 6, 6, 'roof_thatch', { wall: 'wall_wood', doorX: 2, to: 'tolbi_docks_house', tx: 6, ty: 8, chimney: true });
    M.tall('tree_red_tall', 0, 3); M.tall('tree_red_tall', 5, 3); M.tall('tree_red_tall', 18, 3); M.tall('tree_red_tall', 1, 19); M.tall('tree_red_tall', 5, 21); M.tall('tree_red_tall', 6, 22); M.tall('tree_red_tall', 2, 23); M.tall('tree_red_tall', 3, 25);
    // the stair cut into the terrace
    for (let y = 12; y <= 15; y++) { M.set(13, y, 'stairs'); M.setObj(13, y, null); M.walkable(13, y); }
    // the crate pen: two crates in the way of the pocket where the Potion is; they walk north
    M.object('crate', 5, 7, { id: 'td_crate_l' }); M.object('crate', 6, 7, { id: 'td_crate_r' });
    M.chest(3, 1, 'Potion', 1);
    M.container(23, 12, 'crate', 'Coins', 35); M.setObj(24, 12, 'crate');
    // the ship, when it lies at the pier: the gangplank at the pier's east side
    M.exit(0, 16, 1, 1, 'world_gs1', 38, 73, DIR.LEFT); M.walkable(0, 16);
    M.exit(25, 16, 1, 2, 'ship_deck', 19, 6, DIR.RIGHT, { cond: () => G.flag('ship_at_tolbi') });
    M.npc('td_girl', 18, 10, { type: 'villager_f', name: 'Girl', dir: DIR.LEFT, text: "The ship from Kalay came in this morning! Papa says a Kraken was seen on the crossing." });
    M.npc('td_man', 17, 12, { type: 'villager_m', name: 'Dock Hand', dir: DIR.DOWN, text: "Tolbi's up the road to the west, past the bridge. Colosso's begun - the whole city's in the stands." });
    M.npc('td_sailor1', 24, 15, { type: 'sailor', name: 'Sailor', dir: DIR.DOWN, text: "Tolbi Docks. The finest pier on the Karagol - and the only one." });
    M.npc('td_sailor2', 24, 24, { type: 'sailor', name: 'Sailor', dir: DIR.UP, text: "That box at the pier head? The harbourmaster's. Don't tell him I said to look in it." });
    M.npc('td_boy', 13, 17, { type: 'child_m', name: 'Boy', move: 'wander', text: "There's a chest up in the corner of the field, behind the crates! Nobody can get to it." });
    M.npc('td_old', 18, 20, { type: 'elder_m', name: 'Old Sailor', dir: DIR.LEFT, text: "West over the bridge, then follow the path east along the north shore, and you'll come to the docks of Kalay on foot. Odd, for a sea that took a ship a night and a day to cross." });
    M.sign(12, 17, 'Tolbi Docks. West: Tolbi. The pier is for the Kalay ship.');
  }
});
Kit.home('tolbi_docks_house', { name: "Dock House", back: { map: 'tolbi_docks', x: 15, y: 10 }, npcs: [{ id: 'tdh_w', x: 5, y: 5, type: 'villager_f', name: 'Harbourmaster\'s Wife', text: "My husband keeps the pier. He says the Kalay captain won't sail without his lucky charm - imagine!" }] });
