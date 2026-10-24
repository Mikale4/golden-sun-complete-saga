// The walls of Weyard's seas: the rock spires no ship sails past, the reefs the ship with wings flies over, and the
// ice the Northern Reaches are shut behind. The rip drew none of them (they are sprites in the game), so they are
// laid here by the guide's maps: the Eastern Sea is the ship's world until the Grindstone opens the Gondowan
// Cliffs' strait; the Western Sea lies beyond it; the Northern Reaches and Prox behind the ice the cannon breaks.
// Each segment is a 4-connected line on the sea, [char, x0, y0, x1, y1] - '^' a spire, '*' a reef, '%' the ice wall;
// land cells on the way keep their ground, beaches (which the ship could slip over) do not; '#' is a mountain and
// takes plain land too.
'use strict';
const WORLD_TLA_SEAWALLS = [
  // ---- the Eastern Sea's southern bounds: the spires north of the Tundaria Tower and along Tundaria's coast, the
  // channel under them (the tower, Wheeze's dead-end inlet at its west end) sailed in from the east past E Tundaria
  // Islet; the sea south of Indra above them is the Western Sea, where the Pirate's Sabre lies among the rocks ----
  ['^', 117, 246, 117, 256], ['^', 117, 246, 130, 246], ['^', 130, 246, 130, 242], ['^', 130, 242, 141, 242],
  ['^', 141, 242, 148, 249], ['^', 148, 249, 163, 258], ['^', 163, 258, 163, 249], ['^', 163, 249, 178, 249],
  // ---- the Gondowan Cliffs: the cliffs themselves ('#' takes the land too) between the strait's two mouths - the
  // river through the map is the only way across, by ship or by the tightrope ----
  ['#', 129, 200, 129, 202], ['#', 130, 200, 130, 202], ['#', 131, 200, 131, 202],
  // ---- the reef belt north of Hesperia: the Western Sea's northern bound, with the Northern Reaches' one passage
  // through it iced over until the cannon ----
  ['^', 82, 30, 94, 30], ['%', 95, 30, 95, 30], ['^', 96, 30, 111, 30],
  // ---- the ring of reefs round the Soul Brand's glint west of Atteka: the ship flies over them once it has wings ----
  ['*', 28, 173, 32, 173], ['*', 32, 173, 32, 177], ['*', 32, 177, 28, 177], ['*', 28, 177, 28, 173],
  // ---- the northern waters' eastern bound: spires from the Prox coast up to the top of the world, so they do not
  // run round into the Eastern Sea by Treasure Isle ----
  ['^', 154, 20, 154, 0],
];
// the cells the segments cover, on the layout as it stands (the editor's corrections already in it)
function worldTlaWallCells(rows) {
  const at = (x, y) => (y >= 0 && y < rows.length && x >= 0 && x < rows[0].length) ? rows[y][x] : 'x';
  const out = []; const seen = new Set();
  const put = (x, y, ch) => { const k = x + ',' + y; if (seen.has(k)) return; seen.add(k); if ((ch === '#' ? '~irm.:' : '~irm').includes(at(x, y))) out.push([x, y, ch]); };
  for (const [ch, x0, y0, x1, y1] of WORLD_TLA_SEAWALLS) {
    // a 4-connected walk from one end to the other: every step is one cell across or down, never diagonal
    let x = x0, y = y0; put(x, y, ch); const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0); const nx = Math.abs(x1 - x0), ny = Math.abs(y1 - y0);
    let ex = 0, ey = 0; while (x !== x1 || y !== y1) { const fx = nx ? (ex + 1) / nx : 2, fy = ny ? (ey + 1) / ny : 2; if (fx <= fy) { x += dx; ex++; } else { y += dy; ey++; } put(x, y, ch); }
  }
  return out;
}
// the places the walls need: the strait's two mouths, and the cliffs' land entrances on either bank (the layout put
// its one marker in the water between); the Northern Reaches are met from the sea on the west coast of Prox's land
(() => { const L = typeof WORLD_TLA_LAYOUT !== 'undefined' ? WORLD_TLA_LAYOUT : null; if (!L || L._walls) return; L._walls = true;
  const gc = L.places.find(p => p.map === 'gondowan_cliffs'); if (gc) { gc.x = 132; gc.y = 201; }
  const is = L.places.find(p => p.map === 'indra_shore'); if (is) { is.x = 163; is.y = 194; }
  const tr = L.places.findIndex(p => p.map === 'trial_road'); if (tr >= 0) L.places.splice(tr, 1);   // Trial Road is walked from Shaman Village, not from the sea   // the East Indra Shore: on Indra's east coast, on the Eastern Sea, not the beach south of Madra
  const add = (p) => { if (!L.places.some(q => q.map === p.map)) L.places.push(p); };
  [{ name: 'Gondowan Cliffs west', map: 'gondowan_cliffs_w', x: 128, y: 201, tile: 'w_cave' },
    { name: 'Gondowan Cliffs strait', map: 'gondowan_cliffs_n', x: 130, y: 199, tile: 'w_strait' },
    { name: 'Gondowan Cliffs strait', map: 'gondowan_cliffs_s', x: 130, y: 203, tile: 'w_strait' },
    { name: 'Atteka Inlet', map: 'atteka_inlet_n', x: 67, y: 159, tile: 'w_gate' }].forEach(add);   // the road down into the inlet's garden from Contigo's side; the berth itself is the marker below
})();
