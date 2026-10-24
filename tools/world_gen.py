# The Golden Sun overworld from its reference rip: tools/tilemap.py classified every 16px cell of
# map references/golden-sun-world-gba-map.webp into tools/tm/world.txt (t forest, c mountain, w ocean, i shallow,
# g grass, p road, a desert, u snow, m beach, x the rip's label boxes). This turns that into js/maps/world_gs1_layout.js:
# the label boxes are filled in from their surroundings, the location pictures are cleared to grass with the place
# marker on their tile, water that does not touch the sea becomes river, and a few passes the classifier missed are
# opened by hand.
#   python tools/world_gen.py
import os, sys
from collections import deque, Counter
HERE = os.path.dirname(os.path.abspath(__file__)); TM = os.path.join(HERE, 'tm'); ROOT = os.path.dirname(HERE)

rows = [list(l.rstrip('\n')) for l in open(os.path.join(TM, 'world.txt')) if l.strip('\n')]
TM0 = [row[:] for row in rows]   # the classifier's own reading, before any rule touches it
H, W = len(rows), len(rows[0])
def inb(x, y): return 0 <= x < W and 0 <= y < H
def setc(x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if inb(x, y): rows[y][x] = ch

# the rip's own furniture: the unexplored fog west of Angara and the logo panel in the corner are open sea
for l in open(os.path.join(TM, 'world_fog.txt')):
    fx, fy = map(int, l.split(','))
    if fx < 40: rows[fy][fx] = '~'
setc(0, 110, 34, 127, '~')   # the logo panel in the corner
# the ranges and the water straight from the picture: the classifier lost most of the mountains (a range came out as a
# scatter of peaks with grass between, and the party walked round every pass). Every 16px cell whose pixels are mostly
# the rip's blue-grey rock becomes mountain, and one that is mostly its saturated blue becomes water (sea or river is
# decided below). Label boxes and the fog are left to the inpainting.
def rip_overlay(rip, rock_at=0.4, water_at=0.6):
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(rip).convert('RGB')).astype(float) / 255
    hh_, ww_ = a.shape[0] // 16, a.shape[1] // 16
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); v = mx; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    d = np.maximum(mx - mn, 1e-6); hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    rock = (hue > 0.48) & (hue < 0.8) & (s > 0.12) & (s < 0.5) & (v > 0.28) & (v < 0.88)
    water = (hue > 0.52) & (hue < 0.72) & (s > 0.55) & (v > 0.4)
    grey = (s < 0.22) & (v > 0.5)   # the pale highlights of a peak: the dark pine forests match the rock rule too, but have none
    plank = (r >= 0.84) & (g >= 0.55) & (g <= 0.85) & (b <= 0.57) & (r > g) & (g > b)   # the light orange planks of a bridge
    cellmean = lambda m: m[:hh_ * 16, :ww_ * 16].reshape(hh_, 16, ww_, 16).mean(axis=(1, 3))
    fr = cellmean(rock); fw = cellmean(water); fp = cellmean(plank); fg = cellmean(grey)
    # the classifier's inland shallows are not to be trusted: an 'i' it read where the picture has no water at all is
    # the shore's pattern on dry ground, and stays the ground round it (a real river shows its water, or is added below)
    dried = 0
    for y in range(min(H, hh_)):
        for x in range(min(W, ww_)):
            if rows[y][x] == 'r' and TM0[y][x] == 'i' and fw[y, x] < 0.05:
                c = Counter(rows[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if inb(x + dx, y + dy) and rows[y + dy][x + dx] in '.T:amu')
                rows[y][x] = c.most_common(1)[0][0] if c else '.'; dried += 1
    print('dry shallows:', dried)
    n = 0; nb = 0
    for y in range(min(H, hh_)):
        for x in range(min(W, ww_)):
            if rows[y][x] == ' ' or TM0[y][x] == ' ': continue   # a label box: the picture under it is the label, not the land (it is filled in from around it)
            if fp[y, x] >= 0.12 and fw[y, x] >= 0.06: rows[y][x] = 'b'; nb += 1   # a bridge: walked, and the river runs under it
            elif fr[y, x] >= rock_at and fg[y, x] >= 0.02 and rows[y][x] in '.T:ahmu': rows[y][x] = '#'; n += 1
            elif fr[y, x] >= rock_at and rows[y][x] == '.': rows[y][x] = 'T'   # a pine forest the classifier read as plain: walked, as every forest is
            elif fw[y, x] >= water_at and rows[y][x] in '.T:ahmu#': rows[y][x] = '?'; n += 1   # water: river or sea, by the water beside it (below)
    print('bridges:', nb)
    # the water the picture added takes the class of the water it touches: a river's missing cells are river, the sea's
    # fringe is sea; a cell with no water beside it is a river the classifier missed. A river wins over the sea where both
    # touch, so no river becomes a sailed channel round a wall
    for _ in range(6):
        left = 0
        for y in range(H):
            for x in range(W):
                if rows[y][x] != '?': continue
                nb = [rows[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if inb(x + dx, y + dy)]
                if 'r' in nb: rows[y][x] = 'r'
                elif '~' in nb or 'i' in nb: rows[y][x] = '~'
                else: left += 1
        if not left: break
    for y in range(H):
        for x in range(W):
            if rows[y][x] == '?': rows[y][x] = 'r'
    # a river drawn a cell wide runs diagonally through cells it only part-fills, and the classifier read those as
    # land: a cell with a river's water in it beside a river cell is river too, so a river is the wall it is in the
    # game from its spring to its mouth. Never on the coast, where the sea's fringe would creep along the shore
    sea_beside = lambda x, y: any(inb(x + dx, y + dy) and rows[y + dy][x + dx] in '~i' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    for _ in range(12):
        grew = 0
        for y in range(1, min(H, hh_) - 1):
            for x in range(1, min(W, ww_) - 1):
                if rows[y][x] not in '.T:ahmu' or TM0[y][x] == ' ' or fw[y, x] < 0.12 or fp[y, x] >= 0.12 or sea_beside(x, y): continue
                if any(rows[y + dy][x + dx] == 'r' for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dx or dy): rows[y][x] = 'r'; grew += 1
        if not grew: break
    # a bridge is walked end to end: the river runs under it across its axis, and the bank at either end is land even
    # where the picture's water spills a little onto it
    for y in range(1, min(H, hh_) - 1):
        for x in range(1, min(W, ww_) - 1):
            if rows[y][x] != 'b': continue
            h = sum(rows[y][x + dx] in 'ri~' for dx in (-1, 1)); v = sum(rows[y + dy][x] in 'ri~' for dy in (-1, 1))
            ends = ((x, y - 1), (x, y + 1)) if h >= v else ((x - 1, y), (x + 1, y))
            for ex, ey in ends:
                if rows[ey][ex] == 'r' and fw[ey, ex] < 0.5: rows[ey][ex] = '.'
    # a river drawn on the diagonal leaves two water cells touching only at a corner, and the party slips between
    # them: the wetter of the two cells that would join them becomes water, so every river is a wall four ways
    WATER = set('~ir'); joined = 0
    for _ in range(3):
        for y in range(min(H, hh_) - 1):
            for x in range(min(W, ww_) - 1):
                for dx in (1, -1):
                    if not inb(x + dx, y + 1) or rows[y][x] not in WATER or rows[y + 1][x + dx] not in WATER: continue
                    a_, b_ = (x + dx, y), (x, y + 1)
                    if rows[a_[1]][a_[0]] in WATER or rows[b_[1]][b_[0]] in WATER: continue
                    pick = a_ if fw[a_[1], a_[0]] >= fw[b_[1], b_[0]] else b_
                    if rows[pick[1]][pick[0]] in '.T:ahmu': rows[pick[1]][pick[0]] = 'r' if (rows[y][x] == 'r' or rows[y + 1][x + dx] == 'r') else '~'; joined += 1
    print('rip overlay:', n, 'cells; rivers joined at', joined, 'corners')
# the location pictures and their label boxes: cleared to grass round the marker, so the roads reach them
PLACES = [
  # name, map, x, y, tile
  ('Vale', 'vale_south', 56, 39, 'w_town'), ('Vault', 'vault', 64, 49, 'w_village'), ('Lunpa', 'lunpa', 65, 35, 'w_village'),
  ('Goma Cave', 'goma_out', 82, 41, 'w_cave'), ('Goma Cave north', 'goma_top', 82, 37, 'w_cave'),
  ('Bilibin', 'bilibin', 87, 37, 'w_city'), ('Bilibin Barricade', 'bilibin_barricade', 98, 43, 'w_gate'), ('Bilibin Cave', 'bilibin_cave', 68, 24, 'w_cave'), ('Bilibin Cave north', 'bilibin_cave_2', 74, 17, 'w_cave_snow'),   # the cave's far mouth, on the Imil snowfield
  ('Kolima', 'kolima', 110, 38, 'w_village'), ('Kolima east gate', 'kolima_east', 116, 39, 'w_gate'), ('Kolima Forest', 'kolima_forest', 104, 33, 'w_town'), ('Kolima Bridge', 'kolima_bridge', 117, 43, 'w_bridge_v'),   # the town spans the river: its east gate opens on the bridge's bank
  ('Imil', 'imil', 66, 7, 'w_village'), ('Mercury Lighthouse', 'mercury_lh_out', 69, 4, 'w_lh_mercury'),
  ('Fuchin Temple', 'fuchin', 127, 49, 'w_temple'), ('Mogall Forest', 'mogall', 126, 58, 'w_town'), ('Mogall Forest south', 'mogall_s', 124, 65, 'w_town'),
  ('Xian', 'xian', 116, 61, 'w_town'), ('Alpine Crossing', 'alpine', 102, 56, 'w_cave'), ('Altin', 'altin', 98, 51, 'w_village'), ('Lama Temple', 'lama', 91, 54, 'w_temple'),
  ('Lamakan Desert', 'lamakan', 93, 59, 'w_cave_sand'), ('Lamakan Desert west', 'lamakan_w', 73, 69, 'w_cave_sand'),
  ('Kalay', 'kalay', 56, 66, 'w_city'), ('Kalay Docks', 'kalay_docks', 50, 70, 'w_dock'), ('Kalay Tunnel', 'kalay_tunnel', 49, 65, 'w_cave'),
  ('Tolbi', 'tolbi', 33, 71, 'w_city'), ('Tolbi Docks', 'tolbi_docks', 39, 73, 'w_dock'), ('Altmiller Cave', 'altmiller', 32, 61, 'w_cave'),
  ('Gondowan Cave', 'gondowan_cave', 56, 75, 'w_cave'), ('Gondowan Cave south', 'gondowan_cave_s', 52, 81, 'w_cave'), ('Gondowan Passage', 'gondowan_passage', 35, 84, 'w_bridge_v'),
  ('Suhalla', 'suhalla', 50, 89, 'w_village'), ('Suhalla Desert', 'suhalla_desert', 52, 95, 'w_cave_sand'), ('Suhalla Desert south', 'suhalla_desert_s', 48, 105, 'w_cave_sand'), ('Suhalla Gate', 'suhalla_gate', 64, 104, 'w_gate'),
  ('Lalivero', 'lalivero', 65, 91, 'w_village'), ('Babi Lighthouse', 'babi_lh', 68, 87, 'w_tower'), ('Venus Lighthouse', 'venus_lh_1', 71, 98, 'w_lh_venus'), ('Venus Lighthouse entry', 'venus_lh_entry', 73, 103, 'w_cave'), ('Gateway Cave', 'gateway_cave', 68, 106, 'w_cave'),
  ('Crossbone Isle', 'crossbone', 24, 15, 'w_island'),
  ('West Lunpa Cave', 'west_lunpa_cave', 64, 37, 'w_cave'),
]
# the label boxes (x) and whatever else is unclassified take the commonest class round them, until none are left
def inpaint():
    for _ in range(12):
        todo = [(x, y) for y in range(H) for x in range(W) if rows[y][x] == ' ']
        if not todo: return
        fills = {}
        for x, y in todo:
            c = Counter(rows[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if inb(x + dx, y + dy) and rows[y + dy][x + dx] != ' ')
            if c: fills[(x, y)] = c.most_common(1)[0][0]
        for k, v in fills.items(): rows[k[1]][k[0]] = v
inpaint()
# water that touches the edge of the picture is the sea (sailed); water that does not is river and lake
sea = set(); q = deque()
for y in range(H):
    for x in range(W):
        if (x in (0, W - 1) or y in (0, H - 1)) and rows[y][x] in '~i': sea.add((x, y)); q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if inb(nx, ny) and rows[ny][nx] in '~i' and (nx, ny) not in sea: sea.add((nx, ny)); q.append((nx, ny))
for y in range(H):
    for x in range(W):
        if rows[y][x] in '~i' and (x, y) not in sea: rows[y][x] = 'r'
# a lake big enough to sail is sea after all (the Karagol Sea between Kalay and Tolbi is closed off in the picture)
seen = set()
for y in range(H):
    for x in range(W):
        if rows[y][x] != 'r' or (x, y) in seen: continue
        body = [(x, y)]; seen.add((x, y)); q = deque([(x, y)])
        while q:
            cx, cy = q.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = cx + dx, cy + dy
                if inb(nx, ny) and rows[ny][nx] == 'r' and (nx, ny) not in seen: seen.add((nx, ny)); body.append((nx, ny)); q.append((nx, ny))
        if len(body) >= 250:
            for bx, by in body: rows[by][bx] = 'i'
rip_overlay(os.path.join(ROOT, 'map references', 'golden-sun-world-gba-map.webp'))
# shallows are the fringe of a coast: a shallow cell with no land within two is open sea (the fog's edge read as coast)
LAND = set('.T#:aum')
for y in range(H):
    for x in range(W):
        if rows[y][x] != 'i': continue
        if not any(inb(x + dx, y + dy) and rows[y + dy][x + dx] in LAND for dy in range(-2, 3) for dx in range(-2, 3)): rows[y][x] = '~'
# snow belongs to the north: a white cell south of the ranges is a label border or a wave-cap read wrong
for y in range(34, H):
    for x in range(W):
        if rows[y][x] == 'u': rows[y][x] = '.'
# the classifier's crumbs: a river of one or two cells is a shadow, a lone peak is a rock - both become the ground round them
def despeckle(chars, maxsize, fill):
    seen = set()
    for y in range(H):
        for x in range(W):
            if rows[y][x] not in chars or (x, y) in seen: continue
            body = [(x, y)]; seen.add((x, y)); q = deque([(x, y)])
            while q:
                cx, cy = q.popleft()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if inb(nx, ny) and rows[ny][nx] in chars and (nx, ny) not in seen: seen.add((nx, ny)); body.append((nx, ny)); q.append((nx, ny))
            if len(body) <= maxsize:
                for bx, by in body: rows[by][bx] = fill
despeckle('r', 3, '.'); despeckle('#', 1, '.')
POSMAP = { mid: (x, y) for name, mid, x, y, tile in PLACES }

# a pass (a cave through a range, a bridge, a gate, a desert's mouth) opens only on the sides it is walked in from:
# the rest of the picture round its marker stays rock, so the party cannot walk round it on the world
SIDES = { 'west_lunpa_cave': 'w', 'goma_out': 'w', 'goma_top': 'ne', 'bilibin_cave': 'w', 'bilibin_cave_2': 'n', 'kolima_bridge': 'ns', 'kolima_east': 'e', 'bilibin_barricade': 'ew', 'alpine': 'ew', 'kolima_forest': 's',
          'lamakan': 'n', 'lamakan_w': 'sw', 'mogall': 'n', 'mogall_s': 's', 'gondowan_cave': 'n', 'gondowan_cave_s': 's', 'gondowan_passage': 'ns', 'suhalla_desert': 'n', 'suhalla_desert_s': 'e', 'suhalla_gate': 'ew', 'kalay_tunnel': 's' }
for name, mid, x, y, tile in PLACES:
    sides = SIDES.get(mid)
    for dy in (-2, -1, 0, 1):
        for dx in (-1, 0, 1):
            if not inb(x + dx, y + dy): continue
            if (dx or dy) and any(abs(x + dx - mx_) <= 1 and abs(y + dy - my_) <= 1 for _, mid_, mx_, my_, _ in PLACES if mid_ != mid): continue   # another marker's own ground is its to clear
            if sides is None:
                if rows[y + dy][x + dx] not in '~i': rows[y + dy][x + dx] = '.'
                continue
            keep = (dx == 0 and dy == 0) or (dx == 0 and dy < 0 and 'n' in sides) or (dx == 0 and dy > 0 and 's' in sides) or (dy == 0 and dx < 0 and 'w' in sides) or (dy == 0 and dx > 0 and 'e' in sides)
            rows[y + dy][x + dx] = '.' if keep else '#'
    if sides is not None:
        # the road to the mouth: out from the marker on each open side, through whatever rock the picture put there, until open ground
        for dx, dy, side in ((0, -1, 'n'), (0, 1, 's'), (-1, 0, 'w'), (1, 0, 'e')):
            if side not in sides: continue
            for k in range(1, 8):
                cx, cy = x + dx * k, y + dy * k
                if not inb(cx, cy) or rows[cy][cx] in '~irx': break   # a mouth's road stops at water: a river is crossed by a bridge or not at all
                was = rows[cy][cx]; rows[cy][cx] = '.'
                nx_, ny_ = x + dx * (k + 1), y + dy * (k + 1)
                if k >= 2 and was not in '# ' and inb(nx_, ny_) and rows[ny_][nx_] not in '# ': break   # open ground reached (a label box counts as rock: it is inpainted later)
    if inb(x, y) and rows[y][x] in '~i' and tile not in ('w_dock', 'w_island'): rows[y][x] = '.'
# a desert's interior is dunes, crossed only through the desert's own maps: the sand between a desert's mouths is
# flooded from each mouth's inner side (the side away from the road that leads to it) and made 'A' (w_dunes, solid).
# Sand elsewhere (a town on the desert's edge, a beach's hinterland) stays walkable
def dunes(mouths):
    seen = set(); q = deque()
    for mid in mouths:
        p = POSMAP.get(mid); sides = SIDES.get(mid, '')
        if not p: continue
        x, y = p
        for ch, dx, dy in (('n', 0, -1), ('s', 0, 1), ('w', -1, 0), ('e', 1, 0)):
            if ch in sides: continue   # an open side is the road in; the others face the sand
            for k in (1, 2):
                nx, ny = x + dx * k, y + dy * k
                if inb(nx, ny) and rows[ny][nx] == 'a' and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if inb(nx, ny) and rows[ny][nx] == 'a' and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    for x, y in seen: rows[y][x] = 'A'
    print('  dunes:', len(seen), 'cells inside', '/'.join(mouths))
# a forest pass's footprint the same way: the wood between its mouths is dense ('F', w_forest_dense, solid), walked
# only through the forest's own maps; the light woods elsewhere stay walked
def forest(mouths):
    seen = set(); q = deque()
    for mid in mouths:
        p = POSMAP.get(mid); sides = SIDES.get(mid, '')
        if not p: continue
        x, y = p
        for ch, dx, dy in (('n', 0, -1), ('s', 0, 1), ('w', -1, 0), ('e', 1, 0)):
            if ch in sides: continue
            for k in (1, 2):
                nx, ny = x + dx * k, y + dy * k
                if inb(nx, ny) and rows[ny][nx] == 'T' and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if inb(nx, ny) and rows[ny][nx] == 'T' and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
    for x, y in seen: rows[y][x] = 'F'
    print('  dense wood:', len(seen), 'cells inside', '/'.join(mouths))
forest(['mogall', 'mogall_s'])
dunes(['lamakan', 'lamakan_w'])
dunes(['suhalla_desert', 'suhalla_desert_s'])
# the roads the classifier broke, the passes through the ranges, the bridges: opened by hand
FIX = [(94, 52, 95, 52, '.'),   # the road between Altin and Lama Temple
       (91, 41, 96, 41, '.'), (93, 42, 94, 43, '.'),   # the road from Bilibin to the Barricade's west gate, where the Barricade's label hides it
       (94, 40, 101, 40, 'r'), (92, 38, 93, 39, 'r'), (91, 36, 95, 36, 'r'),   # the river the Barricade guards, from the pool east of Bilibin along the Barricade's label to the bridge: the Turtle Boots plain is its north bank, Kolima's side
       (101, 41, 103, 41, '.'),   # the Barricade's east road to the bridge
       (31, 81, 34, 82, 'r'), (36, 81, 38, 82, 'r'), (39, 82, 40, 82, 'r'),   # the pool the Gondowan Passage bridges, where its label hides it: the bridge's north approach is the causeway at x=35
       (110, 40, 114, 40, 'r'), (109, 41, 113, 41, 'r'),   # Kolima's river where the Coroma label hides it: it rounds the town's south and shuts the Djinni's islet off from the town
       (61, 44, 62, 44, 'b'),   # the small bridge east of Vale, over the brook from West Lunpa Cave (the first bridge on the road to Vault)
       (64, 39, 66, 39, 'r'), (65, 38, 66, 38, 'r'),   # that brook where the cave's label hides it: from the cave's mouth down to the bridge
       (49, 104, 63, 104, '.'),   # the road from the Suhalla Desert's south mouth east to the Suhalla Gate
       (114, 43, 115, 43, 'r'), (119, 43, 121, 43, 'r'),   # the river under the Kolima Bridge, either side of it (the picture's shallows read as sand)
      ]
for f in FIX: setc(*f)

out = os.path.join(ROOT, 'js', 'maps', 'world_gs1_layout.js')
with open(out, 'w', encoding='utf-8') as fh:
    fh.write("// Generated by tools/world_gen.py from the reference rip: do not edit by hand, fix the tool and rerun it.\n'use strict';\n")
    fh.write("const WORLD_GS1_LAYOUT = {\n  rows: [\n")
    for r in rows: fh.write("    '%s',\n" % ''.join(r))
    fh.write("  ],\n  places: [\n")
    for name, mid, x, y, tile in PLACES: fh.write("    { name: %r, map: %r, x: %d, y: %d, tile: %r },\n" % (name, mid, x, y, tile))
    fh.write("  ],\n};\n")
cnt = Counter(c for r in rows for c in r)
print('wrote', out, W, 'x', H, dict(cnt))
