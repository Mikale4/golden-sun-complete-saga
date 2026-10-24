# Walks the world layouts the way the runner will: every pair of places that the story joins by land must be reachable
# on foot (over grass, road, forest, sand, snow, beach), and reports the pairs that are not. Rivers and sea block.
#   python tools/world_check.py gs1|tla
import os, re, sys
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
which = sys.argv[1] if len(sys.argv) > 1 else 'gs1'
src = open(os.path.join(ROOT, 'js', 'maps', 'world_%s_layout.js' % which), encoding='utf-8').read()
rows = re.findall(r"    '([^']*)',\n", src)
places = { m.group(2): (int(m.group(3)), int(m.group(4))) for m in re.finditer(r"\{ name: '((?:[^'\\]|\\.)*)', map: '([a-z_0-9]*)', x: (\d+), y: (\d+)", src) }
H, W = len(rows), len(rows[0])
WALK = set('.:Tamu')
def region(start):
    seen = set(); q = deque()
    # a place's own tile counts, and any walkable tile beside it
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
        x, y = start[0] + dx, start[1] + dy
        if 0 <= x < W and 0 <= y < H and (rows[y][x] in WALK or (dx == 0 and dy == 0)): seen.add((x, y)); q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and rows[ny][nx] in WALK and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    return seen
ROUTES = {
  'gs1': [('vale_south', 'vault'), ('vault', 'goma_out'), ('goma_top', 'bilibin'), ('bilibin', 'bilibin_barricade'), ('bilibin', 'bilibin_cave'), ('bilibin_barricade', 'kolima'), ('kolima', 'kolima_forest'), ('kolima', 'imil'), ('imil', 'mercury_lh_out'),
          ('kolima', 'kolima_bridge'), ('kolima_bridge', 'fuchin'), ('fuchin', 'mogall'), ('mogall_s', 'xian'), ('xian', 'alpine'), ('alpine', 'altin'), ('altin', 'lama'), ('lama', 'lamakan'), ('lamakan_w', 'kalay'), ('kalay', 'lunpa'), ('kalay', 'kalay_docks'),
          ('tolbi', 'altmiller'), ('tolbi', 'gondowan_passage'), ('gondowan_passage', 'suhalla'), ('suhalla', 'suhalla_desert'), ('suhalla_desert_s', 'lalivero'), ('lalivero', 'babi_lh'), ('lalivero', 'venus_lh_1'), ('kalay_docks', 'gondowan_cave'), ('gondowan_cave_s', 'suhalla'), ('vale_south', 'vale_cave')],
  'tla': [('idejima', 'daila'), ('daila', 'kandorean'), ('daila', 'sea_god_shrine'), ('kandorean', 'dehkan'), ('dehkan', 'madra'), ('madra', 'madra_catacombs'), ('madra', 'osenia_cliffs'), ('osenia_cliffs_e', 'yampi'), ('yampi_e', 'alhafra'), ('alhafra', 'alhafran_cave'), ('alhafra', 'mikasalla'), ('mikasalla', 'garoh'), ('garoh', 'airs_rock'), ('garoh', 'osenia_cavern'),
          ('madra', 'gondowan_cliffs'), ('gondowan_cliffs', 'naribwe'), ('naribwe', 'kibombo_mtns'), ('kibombo_mtns', 'kibombo'), ('kibombo', 'gabomba'), ('madra', 'indra_shore'), ('yallam', 'taopo'), ('yallam', 'aqua_rock'), ('izumo', 'gaia_rock'), ('champa', 'ankohl'),
          ('kibombo', 'gondowan_settlement'), ('gondowan_settlement', 'magma_rock'), ('shaman', 'trial_road'), ('contigo', 'jupiter_lh_1'), ('contigo', 'atteka_inlet'), ('contigo', 'anemos'), ('prox', 'mars_lh_1'), ('prox', 'northern_reaches'), ('northern_reaches', 'vale_south'), ('loho', 'kalay'),
          ('vale_south', 'vault'), ('vault', 'kalay'), ('kalay', 'tolbi'), ('lalivero', 'venus_lh_1'), ('suhalla', 'lalivero'), ('bilibin', 'kolima'), ('imil', 'mercury_lh_out'), ('xian', 'altin')],
}
bad = 0
cache = {}
for a, b in ROUTES[which]:
    if a not in places or b not in places: print('  (no marker for %s or %s)' % (a, b)); continue
    if a not in cache: cache[a] = region(places[a])
    ok = places[b] in cache[a] or any((places[b][0] + dx, places[b][1] + dy) in cache[a] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    if not ok: bad += 1; print('BLOCKED %s %s -> %s %s' % (a, places[a], b, places[b]))
print('%d routes blocked' % bad)
