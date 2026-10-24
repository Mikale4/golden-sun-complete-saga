# The world maps gated the way the guides walk them: every region of a world (the towns and mouths the party can
# reach on foot from one seed) must be cut off from every other region except through the pass maps (a cave through
# a range, a bridge, a desert, a cliff path). The layout is flooded on foot from each region's seed with every place
# marker as a wall; wherever the flood reaches another region's seed, the leak is found (a shortest path) and plugged
# at its narrowest cell with mountains across the corridor, until no region leaks into another. The plugs are written
# into js/maps/world_<w>_edits.js (a block between GATE markers, regenerated each run); conditional gates (a bridge
# that is out until a flag) live in js/maps/world_<w>_gates.js and count as walls here.
#   python tools/world_gate.py gs1        python tools/world_gate.py tla        python tools/world_gate.py gs1 dry
import os, re, sys
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
world = sys.argv[1] if len(sys.argv) > 1 else 'gs1'; dry = 'dry' in sys.argv[2:]
src = open(os.path.join(ROOT, 'js', 'maps', 'world_%s_layout.js' % world), encoding='utf-8').read()
m0 = re.search(r'rows: \[([\s\S]*?)\n  \]', src)
rows = [list(l.strip()[1:l.strip().rindex("'")]) for l in m0.group(1).split('\n') if l.strip().startswith("'")]
H, W = len(rows), len(rows[0])
places = [(m.group(1), int(m.group(2)), int(m.group(3))) for m in re.finditer(r"map: '([^']+)', x: (\d+), y: (\d+)", src)]
edits_path = os.path.join(ROOT, 'js', 'maps', 'world_%s_edits.js' % world)
edits_src = open(edits_path, encoding='utf-8').read()
# the hand edits stay; the gate plugs from the last run are dropped and made again
head, sep, rest = edits_src.partition('  // ---- GATE PLUGS (tools/world_gate.py) ----')
if sep: edits_src = head + rest.split('  // ---- END GATE PLUGS ----\n', 1)[1]
hand = [(int(a), int(b), c) for a, b, c in re.findall(r"\[(\d+), (\d+), '(.)'\]", edits_src.split('EDITS')[1])]
for x, y, c in hand: rows[y][x] = c
SOLID = set('#~irlx^*%AF')
if world == 'tla':
    # the sea walls (spires, reefs, the ice) and the markers they move: the same rasterizer the game runs
    import subprocess, json
    js = ("const fs=require('fs');const src=fs.readFileSync(%r,'utf8');const m=src.match(/rows: \\[([\\s\\S]*?)\\n  \\]/);const rows=m[1].split('\\n').map(l=>l.trim()).filter(l=>l.startsWith(\"'\")).map(l=>l.slice(1,l.lastIndexOf(\"'\")));"
          "const places=[...src.matchAll(/name: (?:'([^']+)'|\"([^\"]+)\"), map: '([^']+)', x: (\\d+), y: (\\d+)/g)].map(a=>({name:a[1]||a[2],map:a[3],x:+a[4],y:+a[5]}));const w=fs.readFileSync(%r,'utf8');"
          "const fn=new Function('WORLD_TLA_LAYOUT',w+'\\nreturn {cells: worldTlaWallCells(WORLD_TLA_LAYOUT.rows), places: WORLD_TLA_LAYOUT.places};');const r=fn({rows,places});console.log(JSON.stringify(r));") % (
          os.path.join(ROOT, 'js/maps/world_tla_layout.js').replace('\\', '/'), os.path.join(ROOT, 'js/maps/world_tla_seawalls.js').replace('\\', '/'))
    out = json.loads(subprocess.check_output(['node', '-e', js]).decode('utf-8'))
    for x, y, ch in out['cells']: rows[y][x] = ch
    places = [(p['map'], p['x'], p['y']) for p in out['places']]
else:
    pass
# the conditional gates: their cells are walls for this purpose
gates_path = os.path.join(ROOT, 'js', 'maps', 'world_%s_gates.js' % world)
gate_cells = set()
if os.path.exists(gates_path):
    for m in re.finditer(r"cells: \[([^\]]*\])\]", open(gates_path, encoding='utf-8').read()):
        for a, b in re.findall(r"\[(\d+), (\d+)\]", m.group(1)): gate_cells.add((int(a), int(b)))
markers = {(x, y): mid for mid, x, y in places}
SIDES = {}
try:
    gen = open(os.path.join(HERE, 'world_gen.py' if world == 'gs1' else 'weyard_gen.py'), encoding='utf-8').read(); exec(gen[gen.index('SIDES = {'):gen.index('}', gen.index('SIDES = {')) + 1])
except Exception as e: print('no SIDES:', e)
def walk(x, y): return 0 <= x < W and 0 <= y < H and rows[y][x] not in SOLID and (x, y) not in gate_cells
# the regions: every marker the party may walk between on foot once it is in the region; the first is the seed.
# A marker on a border (a barricade, a pass) belongs to both sides
REGIONS = {
  'gs1': [('vale', ['vale_south', 'vault', 'lunpa', 'west_lunpa_cave', 'goma_out']), ('bilibin', ['bilibin', 'bilibin_barricade', 'bilibin_cave', 'goma_top']), ('kolima', ['kolima', 'kolima_forest', 'bilibin_barricade']), ('kolima_e', ['kolima_east', 'kolima_bridge']),
          ('imil', ['imil', 'mercury_lh_out', 'bilibin_cave_2']), ('fuchin', ['fuchin', 'mogall', 'kolima_bridge']), ('xian', ['xian', 'mogall_s', 'alpine']), ('altin', ['altin', 'lama', 'lamakan', 'alpine']),
          ('kalay', ['kalay', 'kalay_docks', 'kalay_tunnel', 'gondowan_cave', 'lamakan_w']), ('tolbi', ['tolbi', 'altmiller', 'gondowan_passage']), ('suhalla', ['suhalla', 'suhalla_desert', 'gondowan_passage', 'gondowan_cave_s']),
          ('gate', ['suhalla_desert_s', 'suhalla_gate']), ('lalivero', ['lalivero', 'babi_lh', 'venus_lh_1', 'venus_lh_entry', 'gateway_cave', 'suhalla_gate'])],
  'tla': [('north', ['prox', 'mars_lh_1']), ('angara_n', ['imil', 'mercury_lh_out']), ('daila', ['daila', 'kandorean', 'idejima', 'sea_god_shrine', 'dehkan']), ('madra', ['madra', 'madra_bridge', 'gondowan_cliffs', 'indra_shore', 'dehkan']), ('osenia', ['osenia_cliffs_e', 'yampi', 'yampi_s', 'mikasalla', 'osenia_cavern', 'garoh', 'airs_rock']),
          ('alhafra', ['alhafra', 'alhafran_cave', 'yampi_e']), ('naribwe', ['naribwe', 'kibombo_mtns', 'gondowan_cliffs_w']), ('kibombo', ['kibombo', 'gabomba', 'kibombo_mtns'])],
}[world]
def marker_pos(mid):
    for m, x, y in places:
        if m == mid: return (x, y)
    return None
def seed_of(mid):
    p = marker_pos(mid)
    if not p: return None
    x, y = p
    for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        if walk(x + dx, y + dy) and (x + dx, y + dy) not in markers: return (x + dx, y + dy)
    return None
def flood(sx, sy):
    prev = {(sx, sy): None}; q = deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if (nx, ny) in prev or not walk(nx, ny): continue
            prev[(nx, ny)] = (x, y)
            if (nx, ny) in markers: continue
            q.append((nx, ny))
    return prev
def intact(members):
    # every member still reachable from the region's seed
    s = seed_of(members[0])
    if not s: print('  no walkable cell beside', members[0]); return True
    prev = flood(*s)
    return all((marker_pos(m) is None) or (marker_pos(m) in prev) for m in members)
def near_marker(x, y):
    return any((x + dx, y + dy) in markers for dy in (-1, 0, 1) for dx in (-1, 0, 1))
def corridor(x, y, horiz):
    cells = [(x, y)]
    for sgn in (1, -1):
        k = 1
        while True:
            nx, ny = (x + sgn * k, y) if horiz else (x, y + sgn * k)
            if not walk(nx, ny) or (nx, ny) in markers or k > 40: break
            cells.append((nx, ny)); k += 1
    return cells
def near_cells(members, R, others=()):
    # the doorsteps of a region's markers; a marker that stands close to one of the other region's keeps a small step
    out = set()
    for m in members:
        p = marker_pos(m)
        if not p: continue
        r = R
        for o in others:
            q = marker_pos(o)
            if q and abs(q[0] - p[0]) + abs(q[1] - p[1]) <= 2 * R + 2: r = min(r, max(1, (abs(q[0] - p[0]) + abs(q[1] - p[1])) // 2 - 2))   # the two squares must not touch
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                q = (p[0] + dx, p[1] + dy)
                if walk(*q) and q not in markers: out.add(q)
    return out
EXTRA_PROTECT = set()
def min_cut(src_cells, dst_cells):
    # the fewest cells whose walling parts src from dst (each walkable cell a unit-capacity node; source and sink
    # cells and the doorsteps of markers are uncuttable). Edmonds-Karp on the split-node graph
    protected = set(src_cells) | set(dst_cells) | EXTRA_PROTECT | {(x + dx, y + dy) for (x, y) in markers for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
    INF = 10 ** 6
    cap = {}
    def add(u, v, c): cap[(u, v)] = cap.get((u, v), 0) + c; cap.setdefault((v, u), 0)
    nodes = set()
    for y in range(H):
        for x in range(W):
            if not walk(x, y) or (x, y) in markers: continue
            nodes.add((x, y))
    for (x, y) in nodes:
        add(('i', x, y), ('o', x, y), INF if (x, y) in protected else 1)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n in nodes: add(('o', x, y), ('i',) + n, INF)
    S = ('S',); T = ('T',)
    for c in src_cells: add(S, ('i',) + c, INF)
    for c in dst_cells: add(('o',) + c, T, INF)
    adj = {}
    for (u, v) in cap: adj.setdefault(u, []).append(v)
    flow = 0
    while True:
        parent = {S: None}; q = deque([S]); found = False
        while q and not found:
            u = q.popleft()
            for v in adj.get(u, []):
                if v not in parent and cap[(u, v)] > 0:
                    parent[v] = u
                    if v == T: found = True; break
                    q.append(v)
        if not found: break
        b = INF; v = T
        while parent[v] is not None: b = min(b, cap[(parent[v], v)]); v = parent[v]
        v = T
        while parent[v] is not None: cap[(parent[v], v)] -= b; cap[(v, parent[v])] += b; v = parent[v]
        flow += b
        if flow >= INF:
            v = T; chain = []
            while parent[v] is not None: chain.append(v); v = parent[v]
            print('   INF path through protected cells:', [c for c in chain if c[0] == 'i'][:12]); return None
    # the reachable side of the residual graph: cut edges are i->o edges from reachable to unreachable
    reach = set([S]); q = deque([S])
    while q:
        u = q.popleft()
        for v in adj.get(u, []):
            if v not in reach and cap[(u, v)] > 0: reach.add(v); q.append(v)
    cut = [(u[1], u[2]) for (u, v) in cap if u[0] == 'i' and v[0] == 'o' and u[1:] == v[1:] and u in reach and v not in reach]
    return cut
plugs = []; carved = []
import heapq
def carve(members):
    # a region's own road broken by a cell the picture read wrong (a river across a road, rock over a path): the
    # cheapest way from the seed to the stranded marker breaks through as few blocking cells as it can, and those
    # cells become road (or a bridge where they were water)
    s0 = seed_of(members[0])
    for m in members:
        p = marker_pos(m)
        if not p or p in flood(*s0): continue
        dist = {s0: 0}; prev = {}; pq = [(0, s0)]; goal = None
        while pq:
            d, (x, y) = heapq.heappop(pq)
            if d > dist.get((x, y), 1e9): continue
            if (x, y) == p: goal = p; break
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (x + dx, y + dy)
                if not (0 <= n[0] < W and 0 <= n[1] < H) or n in gate_cells: continue
                if n in markers and n != p: continue
                c = rows[n[1]][n[0]]
                step = 1 if c not in SOLID else (60 if c in '~i' else 40)
                nd = d + step
                if nd < dist.get(n, 1e9): dist[n] = nd; prev[n] = (x, y); heapq.heappush(pq, (nd, n))
        if not goal: print('  cannot heal', members[0], '->', m); continue
        k = prev.get(goal); cells = []
        while k and k != s0:
            if rows[k[1]][k[0]] in SOLID: cells.append(k)
            k = prev.get(k)
        for x, y in cells: rows[y][x] = 'b' if rows[y][x] in '~ir' else '.'; carved.append((x, y, rows[y][x]))
        print('  healed %s -> %s through %d cells %s' % (members[0], m, len(cells), cells[:6]))
for name, members in REGIONS:
    if not intact(members): print('region', name, 'is not whole:', [m for m in members if marker_pos(m) and marker_pos(m) not in flood(*seed_of(members[0]))]); carve(members)
    for m in members:
        if marker_pos(m) and not seed_of(m): print('  marker', m, 'at', marker_pos(m), 'has no walkable cell beside it')
for _round in range(60):
    leak = None
    for name, members in REGIONS:
        s0 = seed_of(members[0])
        if not s0: print('no seed for', members[0]); continue
        prev = flood(*s0)
        for name2, members2 in REGIONS:
            if name2 == name: continue
            t = seed_of(members2[0])
            if t and t in prev: leak = (name, members, name2, members2); break
        if leak: break
    if not leak: break
    name, members, name2, members2 = leak
    shared = set(members) & set(members2)   # a pass or a barricade both sides touch: it is the wall between them
    mA = [m for m in members if m not in shared]; mB = [m for m in members2 if m not in shared]
    src = near_cells(mA, 5, mB + list(shared)); dst = near_cells(mB, 5, mA + list(shared))   # a doorstep never reaches round a shared pass
    # a shared pass's doorsteps: the one on each side belongs to the region on that side
    sA = seed_of(members[0]); sB = seed_of(members2[0])
    for m in shared:
        p = marker_pos(m); sides = SIDES.get(m, '')
        if not p: continue
        for ch, dx, dy in (('n', 0, -1), ('s', 0, 1), ('w', -1, 0), ('e', 1, 0)):
            if ch not in sides: continue
            cell = (p[0] + dx, p[1] + dy)
            if not walk(*cell): continue
            a_side = (sA[1] < sB[1]) if ch == 'n' else (sA[1] > sB[1]) if ch == 's' else (sA[0] < sB[0]) if ch == 'w' else (sA[0] > sB[0])
            (src if a_side else dst).add(cell)
    cut = None
    for attempt in range(40):
        cut = min_cut(src, dst)
        if cut is None: break
        for x, y in cut: rows[y][x] = '#'
        ok = all(intact(mm) for _, mm in REGIONS)   # no region anywhere may come apart
        if ok: break
        # the cut went through a region's own road (a cell it needs to reach one of its markers): keep that cell and cut again
        lost = [m for _, mm in REGIONS for m in mm if marker_pos(m) and marker_pos(m) not in flood(*seed_of(mm[0]))]
        print('   try %d: cut %s strands %s' % (attempt, sorted(cut)[:8], lost))
        for x, y in cut: rows[y][x] = '.'
        EXTRA_PROTECT.update(cut); cut = None
    if cut is None: print('cannot cut', name, 'from', name2, '(their doorsteps touch, or every cut breaks a region)'); break
    plugs.extend(cut)
    print('%s | %s: cut %d cells %s' % (name, name2, len(cut), sorted(cut)))
print('plugs:', len(plugs))
if not dry:
    block = '  // ---- GATE PLUGS (tools/world_gate.py) ----\n' + ''.join("  [%d, %d, '%s'],\n" % (x, y, c) for x, y, c in carved) + ''.join("  [%d, %d, '#'],\n" % (x, y) for x, y in plugs) + '  // ---- END GATE PLUGS ----\n'
    i = edits_src.rindex('];'); new = edits_src[:i] + block + edits_src[i:]
    open(edits_path, 'w', encoding='utf-8', newline='\n').write(new); print('wrote', edits_path)
