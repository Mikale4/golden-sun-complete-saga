# Tundaria's black-ice fields: a grid with rocks, and the slide sequences that reach each goal, found by search.
# Sliding: from a cell, pressing a direction moves until the next cell is blocked ('#', a rock 'o', or off-grid);
# floor cells '.' stop the slide after one step (they are not ice). Prints the fields and the sequences.
import sys
from collections import deque
D = { 'U': (0, -1), 'D': (0, 1), 'L': (-1, 0), 'R': (1, 0) }
def slide(g, x, y, d):
    dx, dy = D[d]; nx, ny = x + dx, y + dy
    if not (0 <= ny < len(g) and 0 <= nx < len(g[0])) or g[ny][nx] in '#o': return None
    while True:
        x, y = nx, ny
        if g[y][x] != 'i': return (x, y)   # stepped onto floor (or a goal letter): stop
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
# field 2: the Mint chest (M), the center exit (C) up top, the right exit (X) that goes back to the start
F2 = [
  '######################',
  '#####C################',
  '#iiiiiiiiiiiiiiiiiii.#',
  '#iiioiiiiiiiiiiiiiii.#',
  '#iiiiiiiiioiiiiiiiii.#',
  '#iiiiiiiiiiiiiiiioii.#',
  '#ioiiiiiiiiiiiiiiiii.#',
  '#iiiiiiiiiiiiiiiiiiiX#',
  '#iiiiioiiiiiiioiiiiiiM',
  '#iiiiiiiiiiiiiiiiiii.#',
  '#iiiiiiiiiiiiiiiiiii.#',
  '#S####################',
  '######################',
]
F2 = [list(r) for r in F2]
start = (1, 11)
show(F2)
for goal in 'MCX':
    p, at = solve(F2, start, goal); print(goal, p, at)
# field 3: Reflux (J) at the far end
F3 = [
  '######################',
  '#iiiiiiiiiiiiiiiiiiii#',
  '#iiiioiiiiiiiiiiioiii#',
  '#iiiiiiiiiiiiiiiiiiii#',
  '#ioiiiiiiiiiiiiiiiiiJ#',
  '#iiiiiiiiiiiiioiiiiii#',
  '#iiiiiiiiioiiiiiiiiii#',
  '#iiiiiiiiiiiiiiiiiioi#',
  '#iiiiiiiiiiiiiiiiiiii#',
  '#iiioiiiiiiiiiiiiiiii#',
  '#iiiiiiiiiiiiiiiiiiii#',
  '#S####################',
  '######################',
]
F3 = [list(r) for r in F3]
show(F3)
p, at = solve(F3, (1, 11), 'J'); print('J', p, at)
