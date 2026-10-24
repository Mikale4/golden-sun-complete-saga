# Kolima Forest's first, second and pond screens, laid out so their log puzzles cannot be walked around: the river
# splits the first screen and only the log rolled into its narrow stretch bridges it; the second screen is one
# corridor with a log across it (and another below); the pond is walled by cliffs on three sides so the exit ledge
# and the Fur Coat's ledge are reached only across the logs afloat. Rewrites the three defineMaps in
# js/maps/kolima_forest.js (the third screen and the clearing stay as they are).
import re
R = 'C:/Games/Golden Sun/'
def grid(w, h, ch): return [[ch] * w for _ in range(h)]
def fill(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = ch
def js_rows(g): return '[\n' + ',\n'.join("    '" + ''.join(r) + "'" for r in g) + '\n  ]'

# ---------------- the first screen (32 x 42) ----------------
E = grid(32, 42, '.')
fill(E, 0, 0, 31, 0, 'T'); fill(E, 0, 41, 31, 41, 'T'); fill(E, 0, 0, 0, 41, 'T'); fill(E, 31, 0, 31, 41, 'T')
# the river: down from the top right, a long diagonal, the one narrow stretch, and away to the bottom left
fill(E, 26, 0, 27, 10, '~')
for y, x0 in ((11, 24), (12, 22), (13, 20), (14, 18)): fill(E, x0, y, x0 + 1, y, '~')
fill(E, 17, 15, 18, 15, '~')
fill(E, 17, 16, 17, 21, '~')          # the narrow stretch: one log's width, four rows of it
for y, x0 in ((22, 15), (23, 13), (24, 11), (25, 9), (26, 7), (27, 5), (28, 3)): fill(E, x0, y, x0 + 1, y, '~')
fill(E, 1, 29, 2, 41, '~')
# clumps of trees on both banks (none on the routes: entry -> the log; the log -> the west exit)
for x0, y0, x1, y1 in [(4, 30, 7, 33), (10, 30, 12, 31), (22, 28, 25, 31), (27, 24, 30, 27), (25, 34, 29, 37), (20, 36, 23, 39), (5, 36, 6, 38), (9, 35, 10, 36),
                       (22, 20, 25, 23), (26, 16, 29, 19), (21, 2, 24, 4), (16, 1, 19, 3), (10, 1, 13, 3), (3, 1, 6, 3), (2, 10, 4, 12), (6, 13, 8, 15), (10, 17, 12, 19), (3, 17, 5, 19),
                       (11, 8, 13, 10), (20, 7, 22, 9), (7, 22, 9, 24), (13, 26, 15, 28)]:
    fill(E, x0, y0, x1, y1, 'T')
fill(E, 12, 41, 16, 41, ':'); fill(E, 13, 36, 15, 40, ':')   # the way in from the road
fill(E, 0, 7, 0, 8, ':'); fill(E, 1, 7, 3, 8, ':')          # the way on to the west
ENTRY_LOGS = [dict(id='left', x=19, y=17, len=4, horiz=False), dict(id='right', x=23, y=17, len=4, horiz=False), dict(id='low', x=20, y=33, len=3, horiz=True)]

# ---------------- the second screen (32 x 30) ----------------
W = grid(32, 30, 'T')
fill(W, 16, 19, 30, 22, '.'); fill(W, 31, 21, 31, 23, ':'); fill(W, 29, 23, 30, 23, '.')   # corridor 1: in from the east, west to the first log
fill(W, 19, 23, 21, 26, '.')                                     # down past it
fill(W, 4, 26, 21, 27, '.'); fill(W, 19, 28, 21, 28, '.')       # the low way west (the second log rolls down into the pocket below)
fill(W, 4, 4, 5, 26, '.')                                        # north up the west side
fill(W, 4, 4, 20, 5, '.'); fill(W, 10, 6, 12, 6, '.')            # east along the top (the pocket under the third log, to roll it back if it is moved)
fill(W, 10, 2, 12, 3, '.')                                       # the third log's shelf
fill(W, 19, 1, 20, 3, '.'); fill(W, 19, 0, 20, 0, ':')           # north to the third screen
WEST_LOGS = [dict(id='a', x=22, y=19, len=4, horiz=False), dict(id='b', x=19, y=26, len=3, horiz=True), dict(id='c', x=10, y=2, len=3, horiz=True)]
# the Nut's tree: left of the first log, over the corridor (HIDDEN_ITEMS kolima_forest_w at [19, 18])

# ---------------- the pond (32 x 29) ----------------
P = grid(32, 29, 'T')
fill(P, 9, 1, 11, 4, '.'); P[0][10] = ':'                        # the north ledge and the way on to the clearing
fill(P, 6, 5, 20, 12, 'h')                                       # the pond
fill(P, 21, 6, 24, 8, '.')                                       # the east ledge (the Fur Coat)
fill(P, 1, 13, 30, 21, '.'); fill(P, 0, 18, 0, 20, ':')          # the south shore, in from the west
for x0, y0, x1, y1 in [(2, 13, 4, 14), (27, 13, 30, 14), (26, 19, 30, 21), (2, 20, 6, 21), (23, 17, 25, 18)]: fill(P, x0, y0, x1, y1, 'T')
fill(P, 12, 22, 15, 23, '.'); fill(P, 26, 16, 28, 16, '.')
POND_LOGS = [dict(id='v1', x=15, y=5, len=4, horiz=False), dict(id='v2', x=10, y=9, len=4, horiz=False), dict(id='h1', x=11, y=6, len=4, horiz=True), dict(id='h2', x=17, y=6, len=4, horiz=True)]
POND_STUMPS = [(9, 7), (9, 10), (18, 12)]

def logs_js(lst): return '[' + ', '.join("{ id: '%s', x: %d, y: %d, len: %d, horiz: %s }" % (l['id'], l['x'], l['y'], l['len'], 'true' if l['horiz'] else 'false') for l in lst) + ']'

NEW = r"""// ---- the way in: the river cuts the wood in two, and only the log rolled into its narrow stretch bridges it ----
const KF_ENTRY_ROWS = %s;
const KF_ENTRY_LOGS = %s;
const KF_LEGEND2 = { '.': 'grass', ':': 'path', '~': 'water', 'h': 'water', 'T': { ground: 'grass', obj: 'tree' } };
function kfPaint(M, rows, logs) {
  M.paint(0, 0, rows, KF_LEGEND2);
  // the wood: inside each clump some trees stand tall over the rest
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { if (row[x] !== 'T') continue; const T = (xx, yy) => ((rows[yy] || '')[xx]) === 'T'; const below = (rows[y + 1] || '')[x]; if (below !== 'T' && y + 1 < rows.length && T(x + 1, y) && T(x, y - 1) && T(x + 1, y - 1) && x % 2 === 0) M.tall(((x * 7 + y * 13) % 5 === 0) ? 'tree_red_tall' : 'tree_tall', x, y); } });
  for (const lg of logs) M.object('log', lg.x, lg.y, { id: 'log_' + lg.id, len: lg.len, horiz: lg.horiz });
}
defineMap('kolima_forest', {
  name: 'Kolima Forest', w: 32, h: 42, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 14, y: 40 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    kfPaint(M, KF_ENTRY_ROWS, KF_ENTRY_LOGS);
    M.exit(12, 41, 5, 1, 'world_gs1', 74, 21, DIR.DOWN); M.exit(0, 7, 1, 2, 'kolima_forest_w', 30, 22, DIR.LEFT);
    M.trigger(13, 37, 3, 2, STORY.kolimaForestEnter, { once: 'kforest_entered' });
    M.npc('kforest_worker', 9, 38, { type: 'villager_m', name: 'Woodcutter', text: "Tret lives in the great tree at the heart of the forest. His anger cursed us all! The stream cuts the wood in two, and there's no bridge... but a felled log rolled into the water where it runs narrow would do for one.", mind: "I felled that one myself. I can't look at it." });
    M.sign(17, 22, 'The stream runs narrow here, no wider than a log is long.');
  }
});
// ---- the second screen: one corridor through the trees, with the logs the woodcutters left across it ----
const KF_WEST_ROWS = %s;
const KF_WEST_LOGS = %s;
defineMap('kolima_forest_w', {
  name: 'Kolima Forest', w: 32, h: 30, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 30, y: 22 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    kfPaint(M, KF_WEST_ROWS, KF_WEST_LOGS);
    M.exit(31, 21, 1, 3, 'kolima_forest', 1, 7, DIR.RIGHT); M.exit(19, 0, 2, 1, 'kolima_forest_n', 19, 30, DIR.UP); M.walkable(31, 21, 1, 3); M.walkable(19, 0, 2, 1);
    M.sign(11, 4, 'A log lies on the shelf above the path. Best left where it is.');
  }
});
"""
POND = r"""// ---- the pond: cliffs on three sides; its switch drains it so the logs can be rolled on the bed, and fills it
// again so they float - and afloat, they are the only footing to the ledge with the way on and the ledge with the
// Fur Coat ----
const KF_POND_ROWS = %s;
const KF_POND_LOGS = %s;
defineMap('kolima_forest_pond', {
  name: 'Kolima Forest', w: 32, h: 29, base: 'grass', music: 'woods', bg: 'forest', entry: { x: 1, y: 19 }, enc: KFOREST_ENC, retreat: { map: 'world_gs1', x: 74, y: 21, dir: DIR.DOWN },
  build(M) {
    const drained = !!G.flag('kf_pond_drained');
    M.paint(0, 0, KF_POND_ROWS, KF_LEGEND2);
    // the bed: walked when the pond is drained; the ledges are reached only from the water's level
    KF_POND_ROWS.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'h') { M.set(x, y, drained ? 'pond_bed' : 'water'); if (drained) M.walkable(x, y); } });
    for (const [x, y] of %s) { M.setObj(x, y, 'stump'); M.block(x, y); }
    const LEDGES = [[9, 1, 11, 4], [21, 6, 24, 8]];
    if (drained) for (const [x0, y0, x1, y1] of LEDGES) M.block(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    // the logs: on the bed they roll; afloat they are bridges lying where they were left
    for (const lg of KF_POND_LOGS) {
      const st = G.flags['obj:kolima_forest_pond:log:log_' + lg.id]; const x = st && st.x !== undefined ? st.x : lg.x, y = st && st.y !== undefined ? st.y : lg.y;
      if (drained) M.object('log', x, y, { id: 'log_' + lg.id, len: lg.len, horiz: lg.horiz });
      else for (let k = 0; k < lg.len; k++) { const cx = x + (lg.horiz ? k : 0), cy = y + (lg.horiz ? 0 : k); M.set(cx, cy, lg.horiz ? 'log_float_h' : 'log_float_v'); M.walkable(cx, cy); }
    }
    M.exit(0, 18, 1, 3, 'kolima_forest_n', 30, 5, DIR.LEFT); M.exit(10, 0, 1, 1, 'kolima_forest_top', 8, 26, DIR.UP); M.walkable(0, 18, 1, 3); M.walkable(10, 0);
    M.chest(23, 7, 'Fur Coat', 1);
    // the switch on the south shore: the sluice opens and the pond runs off its bed, or fills again
    M.object('lever', 16, 15, { id: 'kf_sluice', onPull: function* (E) { const d = !G.flag('kf_pond_drained'); G.set('kf_pond_drained', d); Audio.sfx('quake'); Engine.doShake(10); yield E.say(d ? 'The switch grinds over. Somewhere a sluice opens, and the pond drains away off its bed!' : 'The switch grinds back. The pond fills again, and the logs on its bed rise with the water.'); const p = G.field.player; yield Engine.fadeOut(10); E.warpNow('kolima_forest_pond', p.tx, p.ty, p.dir); yield Engine.fadeIn(10); } });
    M.sign(15, 15, 'A rusted switch on a post. "Sluice - DO NOT TOUCH. - McCoy\'s foresters."');
    M.sign(8, 14, 'The pond: cliffs all round it but here. The way on is up on the ledge at its far end, and there is a chest on the ledge to the east - both a stone\'s throw over open water.');
  }
});
"""
new_block = NEW % (js_rows(E), logs_js(ENTRY_LOGS), js_rows(W), logs_js(WEST_LOGS))
pond_block = POND % (js_rows(P), logs_js(POND_LOGS), '[' + ', '.join('[%d, %d]' % s for s in POND_STUMPS) + ']')
p = R + 'js/maps/kolima_forest.js'; s = open(p, encoding='utf-8').read(); n = len(s)
a = s.index("// ---- the way in: the river winds across the wood"); b = s.index("// ---- the third: the three logs")
s = s[:a] + new_block + s[b:]
a = s.index("// ---- the pond: its switch drains it"); b = s.index("// ---- the clearing: Laurel and Tret")
s = s[:a] + pond_block + s[b:]
open(p, 'w', encoding='utf-8').write(s); print('kolima_forest.js', n, len(s))
