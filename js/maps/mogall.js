// ---------- Mogall Forest ----------
// The wood between Fuchin and Xian, after the reference rip and the room map: eighteen screens of clearings walled
// in by trees, joined by gaps in the trees, with the wrong ways looping back on themselves the way the forest
// turns travellers round. The stream runs through the big clearings and the felled logs are rolled into it to
// cross; the Psynergy Stone is up a side path, the Apple and the Elven Shirt sit on islands ringed by water, Quartz
// waits in the last log clearing, and the little ape that runs ahead leads to its big brother before the way out.
// Each room is drawn from a short description - the clearing's shape, its paths, stumps and water - rather than
// tile by tile; the trees are everything the clearing is not.
'use strict';

const MOGALL_ENC = [['Ape', 'Ape'], ['Death Head'], ['Spider', 'Spider'], ['Troll'], ['Creeper'], ['Ape', 'Spider']];
const MOG_RETREAT = { map: 'world_gs1', x: 62, y: 37, dir: DIR.DOWN };

// carve the clearing: rectangles and ellipses of open grass in a wood of trees
function mogRoom(id, spec) {
  defineMap(id, {
    name: 'Mogall Forest', w: spec.w, h: spec.h, base: 'grass', music: 'woods', bg: 'forest', entry: spec.entry, enc: MOGALL_ENC, retreat: MOG_RETREAT,
    build(M) {
      const r = seededRandom(hashStr(id));
      const open = []; for (let j = 0; j < M.h; j++) { open[j] = []; for (let i = 0; i < M.w; i++) open[j][i] = false; }
      const mark = (x, y) => { if (x >= 0 && y >= 0 && x < M.w && y < M.h) open[y][x] = true; };
      for (const c of spec.clear || []) {
        if (c[0] === 'e') { const [, cx, cy, rx, ry] = c; for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1.05) mark(cx + i, cy + j); }
        else { const [x, y, w, h] = c; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) mark(i, j); }
      }
      // the gaps in the trees where the paths lead out
      const exits = spec.exits || {};
      const gap = (side, e) => { const len = e.len || 3; if (side === 'n') for (let i = 0; i < len; i++) { mark(e.at + i, 0); mark(e.at + i, 1); mark(e.at + i, 2); } if (side === 's') for (let i = 0; i < len; i++) { mark(e.at + i, M.h - 1); mark(e.at + i, M.h - 2); mark(e.at + i, M.h - 3); } if (side === 'w') for (let i = 0; i < len; i++) { mark(0, e.at + i); mark(1, e.at + i); mark(2, e.at + i); } if (side === 'e') for (let i = 0; i < len; i++) { mark(M.w - 1, e.at + i); mark(M.w - 2, e.at + i); mark(M.w - 3, e.at + i); } };
      for (const side in exits) gap(side, exits[side]);
      // grass everywhere, trees where it is not open; a bush now and then at the wood's edge, a few stumps in the open
      // the wood is one canopy (the canopy cliff set: a leaf roof with trunks along its southern edges), the
      // clearings grass; a bush now and then where the grass meets the trees
      const rows = []; for (let j = 0; j < M.h; j++) { let s = ''; for (let i = 0; i < M.w; i++) s += open[j][i] ? '.' : '#'; rows.push(s); }
      M.paint(0, 0, rows, { '.': 'grass' }, { set: 'canopy', faces: 1 });
      for (let j = 0; j < M.h; j++) for (let i = 0; i < M.w; i++) {
        if (!open[j][i]) continue;
        if (r() < 0.15) M.set(i, j, 'grass2');
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => open[j + dy] && open[j + dy][i + dx] === false); if (edge && r() < 0.12) M.setObj(i, j, 'bush');
      }
      for (const [x, y, w, h] of spec.paths || []) M.fill(x, y, w, h, 'path');
      for (const [x, y, w, h] of spec.water || []) M.fill(x, y, w, h, 'water');
      for (const [x, y] of spec.stumps || []) M.setObj(x, y, 'stump');
      for (const [x, y] of spec.bushes || []) M.setObj(x, y, 'bush');
      for (const [x, y, v] of spec.bridges || []) { M.set(x, y, v ? 'log_float_v' : 'log_float_h'); M.walkable(x, y); }
      for (const lg of spec.logs || []) M.object('log', lg.x, lg.y, { id: lg.id, len: lg.len, horiz: lg.horiz });
      for (const side in exits) { const e = exits[side]; const len = e.len || 3; const to = e.to, tx = e.tx, ty = e.ty;
        if (side === 'n') M.exit(e.at, 0, len, 1, to, tx, ty, DIR.UP); if (side === 's') M.exit(e.at, M.h - 1, len, 1, to, tx, ty, DIR.DOWN);
        if (side === 'w') M.exit(0, e.at, 1, len, to, tx, ty, DIR.LEFT); if (side === 'e') M.exit(M.w - 1, e.at, 1, len, to, tx, ty, DIR.RIGHT); }
      if (spec.build) spec.build(M);
    },
  });
}

// ---- the entrance clearing: the wood opens north to the road; west and east wander back to the way in ----
mogRoom('mogall', {
  w: 24, h: 18, entry: { x: 11, y: 1 },
  clear: [['e', 11, 9, 8, 6], [10, 0, 4, 6], ['e', 5, 8, 4, 3], ['e', 18, 10, 4, 3]],
  paths: [[10, 1, 3, 5], [11, 6, 2, 9]], stumps: [[7, 11], [16, 6], [12, 13]], bushes: [[5, 6], [18, 13]],
  exits: { n: { at: 10, to: 'world_gs1', tx: 62, ty: 37 }, w: { at: 7, to: 'mogall_l1', tx: 18, ty: 8 }, e: { at: 9, to: 'mogall_r1', tx: 1, ty: 8 }, s: { at: 10, to: 'mogall_b', tx: 9, ty: 1 } },
  build(M) { M.trigger(9, 3, 6, 2, STORY.mogallEnter, { once: 'mogall_entered' }); },
});
// west and east of the entrance: dead-end loops that spit the party back out at the way in
mogRoom('mogall_l1', {
  w: 20, h: 16, entry: { x: 18, y: 8 }, clear: [['e', 9, 8, 7, 5], [14, 7, 6, 3]], paths: [[3, 8, 16, 1]], stumps: [[6, 5], [11, 11]],
  exits: { e: { at: 7, to: 'mogall', tx: 1, ty: 7 }, w: { at: 7, to: 'mogall', tx: 11, ty: 2 } },
});
mogRoom('mogall_r1', {
  w: 20, h: 16, entry: { x: 1, y: 8 }, clear: [['e', 10, 8, 7, 5], [0, 7, 6, 3]], paths: [[1, 8, 16, 1]], stumps: [[13, 5], [7, 11]],
  exits: { w: { at: 7, to: 'mogall', tx: 22, ty: 9 }, e: { at: 7, to: 'mogall', tx: 11, ty: 2 } },
});
// ---- the narrow clearing below the entrance; its east gap turns back into itself ----
mogRoom('mogall_b', {
  w: 20, h: 16, entry: { x: 9, y: 1 }, clear: [['e', 9, 8, 6, 5], [8, 0, 4, 5], [8, 11, 4, 5], [12, 7, 8, 3]], paths: [[9, 1, 2, 14]], stumps: [[5, 8], [13, 11]],
  exits: { n: { at: 8, to: 'mogall', tx: 11, ty: 16 }, s: { at: 8, to: 'mogall_c', tx: 9, ty: 1 }, e: { at: 7, to: 'mogall_b', tx: 9, ty: 1 } },
});
// ---- the wide clearing: east to the stumps and the Apple, south to the heart of the wood ----
mogRoom('mogall_c', {
  w: 28, h: 18, entry: { x: 9, y: 1 }, clear: [['e', 12, 9, 10, 6], ['e', 22, 9, 5, 4], [8, 0, 4, 5], [8, 12, 4, 6], [22, 8, 6, 3]],
  paths: [[9, 1, 2, 16], [11, 9, 15, 1]], stumps: [[6, 6], [16, 12], [21, 6], [14, 5]], bushes: [[24, 12]],
  exits: { n: { at: 8, to: 'mogall_b', tx: 9, ty: 14 }, e: { at: 8, to: 'mogall_d', tx: 1, ty: 8 }, s: { at: 8, to: 'mogall_h', tx: 9, ty: 1 } },
  build(M) { M.chest(5, 9, 'Herb', 3); },
});
mogRoom('mogall_d', {
  w: 18, h: 16, entry: { x: 1, y: 8 }, clear: [['e', 9, 8, 6, 4], [0, 7, 6, 3], [12, 7, 6, 3]], paths: [[1, 8, 16, 1]], stumps: [[9, 4], [8, 12]],
  exits: { w: { at: 7, to: 'mogall_c', tx: 26, ty: 9 }, e: { at: 7, to: 'mogall_e', tx: 1, ty: 8 } },
});
// the clearing of stumps: north turns back on itself, east is the Apple, south leads on
mogRoom('mogall_e', {
  w: 20, h: 18, entry: { x: 1, y: 8 }, clear: [['e', 10, 9, 7, 6], [0, 7, 6, 3], [14, 7, 6, 3], [8, 0, 4, 6], [8, 12, 4, 6]],
  paths: [[1, 8, 18, 1], [9, 1, 2, 16]], stumps: [[6, 5], [13, 5], [7, 12], [13, 13], [10, 9]],
  exits: { w: { at: 7, to: 'mogall_d', tx: 16, ty: 8 }, e: { at: 7, to: 'mogall_apple', tx: 1, ty: 9 }, n: { at: 8, to: 'mogall_e', tx: 1, ty: 8 }, s: { at: 8, to: 'mogall_f', tx: 8, ty: 1 } },
});
// the Apple on its island: the stream rings it, and a log is rolled in to reach it
mogRoom('mogall_apple', {
  w: 20, h: 18, entry: { x: 1, y: 9 }, clear: [['e', 10, 9, 8, 6], [0, 8, 6, 3], [1, 6, 4, 3]],
  water: [[6, 5, 9, 1], [6, 5, 1, 8], [14, 5, 1, 8], [6, 12, 9, 1]], paths: [[1, 9, 5, 1]], stumps: [[16, 12], [4, 13]],
  logs: [{ id: 'log_apple', x: 3, y: 7, len: 1, horiz: false }],
  exits: { w: { at: 8, to: 'mogall_e', tx: 18, ty: 8 } },
  build(M) { M.chest(10, 8, 'Apple', 1); M.walkable(10, 8); },
});
mogRoom('mogall_f', {
  w: 18, h: 12, entry: { x: 8, y: 1 }, clear: [['e', 8, 6, 5, 3], [7, 0, 4, 12]], paths: [[8, 1, 2, 10]],
  exits: { n: { at: 7, to: 'mogall_e', tx: 9, ty: 16 }, s: { at: 7, to: 'mogall_g', tx: 12, ty: 1 } },
});
// ---- the great log clearing: the stream winds through, two logs lie on the bank, and Quartz sleeps on the far side ----
mogRoom('mogall_g', {
  // the stream comes down from the north edge west of the way on and turns east across the clearing: the way in
  // (west) and the little clearing south are on one side, the way on north is across the water. It runs narrow for
  // a stretch on the way down - one log's width - and the vertical log on the bank goes into it there, once the
  // horizontal one lying across its path is rolled up out of the way (the guide's dance, in short: horizontal
  // up, vertical right). The Nut is up a tree by the logs (Catch); Force on the stump brings an Ape down on the party.
  w: 28, h: 24, entry: { x: 12, y: 1 },
  clear: [['e', 14, 12, 12, 9], [9, 0, 7, 6], [0, 10, 6, 3], [1, 7, 5, 5], [12, 19, 4, 5]],
  water: [[8, 0, 2, 5], [8, 5, 1, 5], [8, 10, 2, 8], [8, 17, 18, 2]],
  paths: [[12, 1, 2, 5], [1, 11, 6, 1], [13, 19, 2, 5]], stumps: [[4, 12], [24, 8], [24, 16]],
  logs: [{ id: 'log_g1', x: 4, y: 7, len: 3, horiz: false }, { id: 'log_g2', x: 5, y: 8, len: 3, horiz: true }],
  exits: { n: { at: 11, to: 'mogall_f', tx: 8, ty: 10 }, w: { at: 10, to: 'mogall_i', tx: 16, ty: 6 }, s: { at: 12, to: 'mogall_g_s', tx: 9, ty: 1 } },
  build(M) {
    M.setObj(9, 6, null); M.set(9, 6, 'grass'); M.walkable(9, 6, 1, 4);   // the far bank beside the narrow stretch
    M.object('catchable', 3, 6, { id: 'mog_nut', item: 'Nut', look: 'tree' });   // the Nut up the tree beside the logs (Catch from below)
    M.object('stump', 4, 12, { id: 'mog_stump_g', onForce: function* (E) { if (G.flag('mog_ape_g')) { yield E.say('The stump shudders. Nothing else stirs.'); return; } G.set('mog_ape_g'); yield* E.ambush(['Ape', 'Ape'], { canFlee: false }, { say: 'The stump booms - and two Apes drop out of the branches overhead, screaming!' }); } });
    M.sign(2, 9, 'The stream runs narrow here, no wider than a log is long. The way on is across it.');
  },
});
// below it a small clearing whose every gap comes back to the log clearing
mogRoom('mogall_g_s', {
  w: 20, h: 14, entry: { x: 9, y: 1 }, clear: [['e', 9, 7, 6, 4], [8, 0, 4, 5], [12, 6, 8, 3]], paths: [[9, 1, 2, 7]], stumps: [[5, 8], [12, 4]],
  exits: { n: { at: 8, to: 'mogall_g', tx: 13, ty: 22 }, e: { at: 6, to: 'mogall_g', tx: 13, ty: 22 } },
});
// ---- the heart of the wood: the Psynergy Stone up a side path, the Elven Shirt west, the way east to the logs, south to the last clearing ----
mogRoom('mogall_h', {
  w: 22, h: 18, entry: { x: 9, y: 1 },
  clear: [['e', 10, 9, 7, 5], [8, 0, 4, 6], [0, 8, 6, 3], [16, 8, 6, 3], [8, 12, 4, 6], [14, 0, 4, 6]],
  paths: [[9, 1, 2, 16], [1, 9, 20, 1], [15, 1, 2, 6]], stumps: [[5, 12], [15, 13]],
  exits: { n: { at: 8, to: 'mogall_c', tx: 9, ty: 16 }, w: { at: 8, to: 'mogall_shirt', tx: 18, ty: 9 }, e: { at: 8, to: 'mogall_i', tx: 1, ty: 6 }, s: { at: 8, to: 'mogall_j', tx: 13, ty: 1 } },
  build(M) { M.exit(14, 0, 4, 1, 'mogall_p', 8, 12, DIR.UP); },
});
// the Psynergy Stone in its own small hollow, the path back down to the heart
mogRoom('mogall_p', {
  w: 18, h: 14, entry: { x: 8, y: 12 }, clear: [['e', 8, 6, 6, 4], [7, 8, 4, 6]], paths: [[8, 6, 2, 8]], stumps: [[3, 6], [13, 7]],
  exits: { s: { at: 7, to: 'mogall_h', tx: 15, ty: 2 } },
  build(M) { M.setObj(8, 3, 'psystone'); },
});
// the Elven Shirt on its island
mogRoom('mogall_shirt', {
  w: 20, h: 18, entry: { x: 18, y: 9 }, clear: [['e', 9, 9, 8, 6], [14, 8, 6, 3], [14, 5, 5, 3]],
  water: [[5, 5, 9, 1], [5, 5, 1, 8], [13, 5, 1, 8], [5, 12, 9, 1]], paths: [[14, 9, 5, 1]], stumps: [[3, 13], [16, 12]],
  logs: [{ id: 'log_shirt', x: 16, y: 6, len: 1, horiz: false }],
  exits: { e: { at: 8, to: 'mogall_h', tx: 1, ty: 9 } },
  build(M) { M.chest(9, 8, 'Elven Shirt', 1); M.walkable(9, 8); },
});
mogRoom('mogall_i', {
  w: 18, h: 12, entry: { x: 1, y: 6 }, clear: [['e', 9, 6, 5, 3], [0, 5, 18, 3]], paths: [[1, 6, 16, 1]],
  exits: { w: { at: 5, to: 'mogall_h', tx: 20, ty: 9 }, e: { at: 5, to: 'mogall_g', tx: 1, ty: 11 } },
});
// ---- the last log clearing: three logs and the stream between the party and the way on ----
mogRoom('mogall_j', {
  // the stream crosses the clearing from side to side; on the way in (north) a horizontal log lies above it, with
  // a small rock in its way (Move the rock aside, then the log rolls down into the water where the stream runs a
  // single tile deep, and floats there as the bridge). Quartz sleeps at the bottom of the clearing, beyond it, and
  // the way on south and the clearing east are on that side too.
  w: 28, h: 24, entry: { x: 13, y: 1 },
  clear: [['e', 13, 12, 12, 9], [8, 0, 8, 6], [1, 9, 5, 5], [12, 19, 4, 5], [22, 12, 6, 3]],
  water: [[0, 9, 11, 2], [11, 9, 5, 1], [16, 9, 12, 2]],
  paths: [[13, 1, 2, 5], [13, 19, 2, 5], [21, 13, 6, 1]], stumps: [[24, 6], [16, 14], [6, 5]],
  logs: [{ id: 'log_j1', x: 12, y: 4, len: 3, horiz: true }],
  exits: { n: { at: 12, to: 'mogall_h', tx: 9, ty: 16 }, e: { at: 12, to: 'mogall_k', tx: 1, ty: 7 }, s: { at: 12, to: 'mogall_boss', tx: 11, ty: 1 } },
  build(M) {
    M.object('pillar', 13, 6, { id: 'mj_rock', tile: 'rock_small' });   // the small rock in the log's way
    M.djinni('Quartz', 14, 16, { fight: true });
    M.object('stump', 6, 5, { id: 'mog_stump_j', onForce: function* (E) { if (G.flag('mog_ape_j')) { yield E.say('The stump shudders. Nothing else stirs.'); return; } G.set('mog_ape_j'); yield* E.ambush(['Ape'], { canFlee: false }, { say: 'A shriek from the branches - an Ape comes down at the party!' }); } });
    M.sign(10, 7, 'The stream runs a single tile deep in the middle. A log rolled into it there would float as a bridge.');
  },
});
// beside it a small clearing that only turns back
mogRoom('mogall_k', {
  w: 18, h: 14, entry: { x: 1, y: 7 }, clear: [['e', 9, 7, 6, 4], [0, 6, 6, 3], [12, 6, 6, 3]], paths: [[1, 7, 16, 1]], stumps: [[9, 4], [8, 10]],
  exits: { w: { at: 6, to: 'mogall_j', tx: 26, ty: 11 }, e: { at: 6, to: 'mogall_j', tx: 26, ty: 11 } },
});
// ---- the way out: the little ape stops at last, and its big brother drops from the trees ----
mogRoom('mogall_boss', {
  w: 24, h: 18, entry: { x: 11, y: 1 },
  clear: [['e', 12, 8, 9, 5], [10, 0, 4, 5], [10, 12, 4, 6]], paths: [[11, 1, 2, 16]], stumps: [[6, 8], [17, 8]],
  water: [[4, 12, 16, 1]], bridges: [[11, 12, true], [12, 12, true]],
  exits: { n: { at: 10, to: 'mogall_j', tx: 13, ty: 22 }, s: { at: 10, to: 'world_gs1', tx: 60, ty: 40 } },
  build(M) {
    M.trigger(10, 7, 4, 2, STORY.killerApe, { once: 'killer_ape_done' }); M.boss('Killer Ape', 12, 6, { done: 'killer_ape_done' });
    M.npc('mogall_ape', 10, 5, { animal: 'dog', animalCol: '#805030', name: 'Little Ape', text: "Ook! Ook!", solid: false, cond: () => !G.flag('killer_ape_done') });   // the little ape the big one guards
  },
});
