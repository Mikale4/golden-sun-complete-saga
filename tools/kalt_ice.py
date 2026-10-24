# Kalt Island's frozen river: the guide's way up it is LDRULURULURULDL from the river's foot to the rope at its head.
# Searches for a rock layout on a narrow strip of ice that makes exactly that sequence the way (and no much shorter
# one), printing the field for js/maps/western_sea.js.
#   python tools/kalt_ice.py [width] [height]
import random, sys
from collections import deque
D = { 'U': (0, -1), 'D': (0, 1), 'L': (-1, 0), 'R': (1, 0) }
def slide(g, x, y, d):
    dx, dy = D[d]; nx, ny = x + dx, y + dy
    if not (0 <= ny < len(g) and 0 <= nx < len(g[0])) or g[ny][nx] in '#o': return None
    while True:
        x, y = nx, ny
        if g[y][x] != 'i': return (x, y)
        nx, ny = x + dx, y + dy
        if not (0 <= ny < len(g) and 0 <= nx < len(g[0])) or g[ny][nx] in '#o': return (x, y)
def solve(g, start, goal_char):
    q = deque([(start, '')]); seen = { start }
    while q:
        (x, y), path = q.popleft()
        if g[y][x] == goal_char: return path, (x, y)
        for d in 'URDL':
            r = slide(g, x, y, d)
            if r and r not in seen: seen.add(r); q.append((r, path + d))
    return None, None
def show(g): print('\n'.join(''.join(r) for r in g))
SEQ = 'LDRULURULURULDL'
W = int(sys.argv[1]) if len(sys.argv) > 1 else 5
H = int(sys.argv[2]) if len(sys.argv) > 2 else 22   # the ice strip inside its banks (columns 1..W, rows 1..H); the foot at the bottom, the head at the top
def build(seed):
    rnd = random.Random(seed)
    g = [['#'] * (W + 2) for _ in range(H + 2)]
    for y in range(1, H + 1):
        for x in range(1, W + 1): g[y][x] = 'i'
    sx, sy = rnd.randint(2, W), H - rnd.randint(1, 4); g[sy][sx] = 'S'   # the start: a floor cell near the river's foot, stepped onto the ice from
    x, y = sx, sy
    for i, d in enumerate(SEQ):
        dx, dy = D[d]
        cells = []; nx, ny = x + dx, y + dy
        while 1 <= nx <= W and 1 <= ny <= H and g[ny][nx] == 'i': cells.append((nx, ny)); nx += dx; ny += dy
        if not cells: return None
        n = rnd.randint(1, len(cells)); ex, ey = cells[n - 1]
        px, py = ex + dx, ey + dy   # the stopper past the slide's end: a rock, unless the bank is there already
        if 1 <= px <= W and 1 <= py <= H:
            if g[py][px] not in 'io': return None
            g[py][px] = 'o'
        x, y = ex, ey
        if i == len(SEQ) - 1: g[y][x] = 'G'   # the rope's foot: the last slide ends here
    return g
def runs(g, seq):
    s = next((x, y) for y, r in enumerate(g) for x, c in enumerate(r) if c == 'S'); x, y = s
    for d in seq:
        r = slide(g, x, y, d)
        if not r: return False
        x, y = r
    return g[y][x] == 'G'
best = None
for seed in range(60000):
    g = build(seed)
    if not g or not runs(g, SEQ): continue
    s = next((x, y) for y, r in enumerate(g) for x, c in enumerate(r) if c == 'S')
    path, _ = solve(g, s, 'G')
    if not path: continue
    rocks = sum(1 for r in g for c in r if c == 'o')
    score = len(path) - rocks * 0.01
    if best is None or score > best[0]: best = (score, seed, path, g)
    if len(path) >= len(SEQ): break
if not best: print('no layout found'); sys.exit(1)
score, seed, path, g = best
print('seed', seed, 'shortest', path, len(path), 'rocks', sum(1 for r in g for c in r if c == 'o')); show(g)
