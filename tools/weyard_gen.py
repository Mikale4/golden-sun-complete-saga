# Weyard, The Lost Age's overworld, from its reference rip: tools/tilemap.py classified every 16px cell of
# map references/golden-sun-the-lost-age-weyard-gba-map.webp into tools/tm/weyard.txt (t forest, c mountain, w ocean,
# i shallow, g grass, p road, a desert, u snow, m beach). This writes js/maps/world_tla_layout.js: the world's rim of
# white (the falls at the edge of Weyard) becomes the edge, the rip's own insets become sea, inland water becomes
# river, and every place gets its marker - the ones the rip labels at their labels, the Golden Sun towns of Angara
# carried over from the Golden Sun rip (the two rips agree on Angara's shape tile for tile, shifted by 87, 32).
#   python tools/weyard_gen.py
import os
from collections import deque, Counter
HERE = os.path.dirname(os.path.abspath(__file__)); TM = os.path.join(HERE, 'tm'); ROOT = os.path.dirname(HERE)

rows = [list(l.rstrip('\n')) for l in open(os.path.join(TM, 'weyard.txt')) if l.strip('\n')]
TM0 = [row[:] for row in rows]   # the classifier's own reading, before any rule touches it
H, W = len(rows), len(rows[0])
def inb(x, y): return 0 <= x < W and 0 <= y < H
def setc(x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if inb(x, y): rows[y][x] = ch
# the rip's insets: the little world in the corner, the logo and legend at the bottom
setc(0, 0, 42, 42, 'u'); setc(0, 288, 46, 319, 'u')   # (white, so the rim flood below makes them edge)
# the rim: white and blank cells that touch the picture's edge are the falls at the edge of the world
edge = set(); q = deque()
for y in range(H):
    for x in range(W):
        if (x in (0, W - 1) or y in (0, H - 1)) and rows[y][x] in 'u ': edge.add((x, y)); q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if inb(nx, ny) and rows[ny][nx] in 'u ' and (nx, ny) not in edge: edge.add((nx, ny)); q.append((nx, ny))
for x, y in edge: rows[y][x] = 'x'
# the ranges, the water and the bridges straight from the picture (see tools/world_gen.py for the rule)
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
# whatever the rip left blank inside is filled from around it
def inpaint():
    for _ in range(12):
        todo = [(x, y) for y in range(H) for x in range(W) if rows[y][x] == ' ']
        if not todo: return
        fills = {}
        for x, y in todo:
            c = Counter(rows[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if inb(x + dx, y + dy) and rows[y + dy][x + dx] not in ' x')
            if c: fills[(x, y)] = c.most_common(1)[0][0]
        for k, v in fills.items(): rows[k[1]][k[0]] = v
inpaint()
GS = (87, 32)   # where a Golden Sun world tile lies on Weyard
def gs(x, y): return (x + GS[0], y + GS[1])
PLACES = [
  # The Lost Age's own places, at the rip's labels (label column, two rows under the label)
  ('Treasure Isle', 'treasure_isle', 234, 40, 'w_island'), ('Kalt Island', 'kalt', 117, 48, 'w_island'),
  ('Shaman Village', 'shaman', 74, 80, 'w_cave'), ('Loho', 'loho', 120, 86, 'w_village'), ('Ankohl Ruins', 'ankohl', 189, 92, 'w_ruins'), ('Izumo', 'izumo', 259, 94, 'w_town'),
  ('Hesperia Settlement', 'hesperia_settlement', 37, 98, 'w_village'), ('Gaia Rock', 'gaia_rock', 262, 97, 'w_rock'), ('Champa', 'champa', 180, 99, 'w_town'), ('SE Angara Islet', 'se_angara_islet', 205, 111, 'w_island'),
  ('Jupiter Lighthouse', 'jupiter_lh', 68, 130, 'w_lh_jupiter'), ('Sea of Time', 'sea_of_time', 222, 129, 'w_dock'), ('Gondowan Settlement', 'gondowan_settlement', 107, 134, 'w_village'), ('Magma Rock', 'magma_rock', 120, 137, 'w_rock'),
  ('Lemuria', 'lemuria', 229, 139, 'w_city'), ('Sea of Time Islet', 'sea_of_time_islet', 261, 139, 'w_island'), ('Islet Cave', 'islet_cave', 261, 143, 'w_cave'), ('Contigo', 'contigo', 81, 145, 'w_town'),
  ('Gabomba Statue', 'gabomba', 128, 148, 'w_temple'), ('Kibombo', 'kibombo', 125, 153, 'w_village'), ('N Osenia Islet', 'n_osenia_islet', 206, 155, 'w_island'), ('Atteka Inlet', 'atteka_inlet', 67, 161, 'w_dock'),
  ('West Indra Islet', 'w_indra_islet', 137, 163, 'w_island'), ('Daila', 'daila', 157, 163, 'w_village'), ('Kibombo Mountains', 'kibombo_mtns', 122, 167, 'w_cave'), ('Shrine of the Sea God', 'sea_god_shrine', 166, 165, 'w_ruins'),
  ('Apojii Islands', 'apojii', 295, 165, 'w_island'), ('Kandorean Temple', 'kandorean', 155, 172, 'w_temple'), ('Aqua Rock', 'aqua_rock', 285, 176, 'w_rock'), ('Naribwe', 'naribwe', 125, 185, 'w_village'),
  ('Dehkan Plateau', 'dehkan', 164, 184, 'w_cave'), ('Alhafra', 'alhafra', 203, 196, 'w_city'), ('Madra Drawbridge', 'madra_bridge', 163, 197, 'w_bridge_v'), ('Osenia Cliffs east', 'osenia_cliffs_e', 171, 198, 'w_cave'),
  ('Gondowan Cliffs', 'gondowan_cliffs', 132, 201, 'w_cave'), ('Gondowan Cliffs west', 'gondowan_cliffs_w', 128, 201, 'w_cave'), ('Gondowan Cliffs strait', 'gondowan_cliffs_n', 130, 199, 'w_strait'), ('Gondowan Cliffs strait', 'gondowan_cliffs_s', 130, 203, 'w_strait'), ('Madra', 'madra', 157, 204, 'w_town'), ('Yampi Desert east', 'yampi_e', 204, 205, 'w_cave_sand'), 
  ('Yallam', 'yallam', 243, 207, 'w_village'), ('Yampi Desert', 'yampi', 185, 216, 'w_cave_sand'), ('Yampi Desert south', 'yampi_s', 203, 215, 'w_cave_sand'), ('SW Atteka Islet', 'sw_atteka_islet', 21, 220, 'w_island'), ("Air's Rock", 'airs_rock', 211, 218, 'w_rock'),
  ('Osenia Cavern', 'osenia_cavern', 202, 222, 'w_cave'), ('Taopo Swamp', 'taopo', 238, 226, 'w_cave'), ('Garoh', 'garoh', 216, 230, 'w_village'), ('Mikasalla', 'mikasalla', 187, 236, 'w_village'),
  ('Tundaria Tower', 'tundaria', 136, 245, 'w_tower_snow'), ('E Tundaria Islet', 'e_tundaria_islet', 239, 264, 'w_island'),
  # the ones the rip does not label, set beside their neighbours
  ('Prox', 'prox', 147, 21, 'w_village'), ('Mars Lighthouse', 'mars_lh_1', 142, 12, 'w_lh_mars'), ('Idejima', 'idejima', 169, 158, 'w_island'), ('Indra Shore', 'indra_shore', 163, 194, 'w_dock'), ('Indra Cavern', 'indra_cavern', 160, 189, 'w_cave'), ('Angara Cavern', 'angara_cavern', 124, 77, 'w_cave'), ('Atteka Cavern', 'atteka_cavern', 36, 244, 'w_cave'), ('Atteka Inlet', 'atteka_inlet_n', 67, 159, 'w_gate'),
  ('Madra Catacombs', 'madra_catacombs', 161, 207, 'w_cave'), ('Alhafran Cave', 'alhafran_cave', 208, 198, 'w_cave'), ('Camp', 'camp', 81, 140, 'w_village'), ('Anemos Sanctum', 'anemos', 84, 143, 'w_ruins'),
  # Golden Sun's Angara, carried over
  ('Vale', 'vale_south', *gs(56, 39), 'w_town'), ('Vault', 'vault', *gs(64, 49), 'w_village'), ('Lunpa', 'lunpa', *gs(65, 35), 'w_village'), ('West Lunpa Cave', 'west_lunpa_cave', *gs(64, 37), 'w_cave'),   # Vale Cave opens off Vale itself, not the world
  ('Bilibin', 'bilibin', *gs(87, 37), 'w_city'), ('Kolima', 'kolima', *gs(110, 38), 'w_village'), ('Kolima Forest', 'kolima_forest', *gs(104, 33), 'w_town'), ('Mogall Forest', 'mogall', *gs(126, 58), 'w_town'), ('Imil', 'imil', *gs(66, 7), 'w_village'), ('Mercury Lighthouse', 'mercury_lh_out', *gs(69, 4), 'w_lh_mercury'),
  ('Xian', 'xian', *gs(116, 61), 'w_town'), ('Altin', 'altin', *gs(98, 51), 'w_village'), ('Lama Temple', 'lama', *gs(91, 54), 'w_temple'), ('Kalay', 'kalay', *gs(56, 66), 'w_city'),
  ('Tolbi', 'tolbi', *gs(33, 71), 'w_city'), ('Suhalla', 'suhalla', *gs(50, 89), 'w_village'), ('Lalivero', 'lalivero', *gs(65, 91), 'w_village'), ('Venus Lighthouse', 'venus_lh_1', *gs(71, 98), 'w_lh_venus'),
]
# water that reaches the rim is the sea; water shut in by land is river or lake
sea = set(); q = deque()
for y in range(H):
    for x in range(W):
        if rows[y][x] in '~i' and any(inb(x + dx, y + dy) and rows[y + dy][x + dx] == 'x' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): sea.add((x, y)); q.append((x, y))
        if rows[y][x] in '~i' and (x in (0, W - 1) or y in (0, H - 1)): sea.add((x, y)); q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if inb(nx, ny) and rows[ny][nx] in '~i' and (nx, ny) not in sea: sea.add((nx, ny)); q.append((nx, ny))
for y in range(H):
    for x in range(W):
        if rows[y][x] in '~i' and (x, y) not in sea: rows[y][x] = 'r'
rip_overlay(os.path.join(ROOT, 'map references', 'golden-sun-the-lost-age-weyard-gba-map.webp'))
# shallows are the fringe of a coast; a shallow with no land within two is open sea
LAND = set('.T#:aum')
for y in range(H):
    for x in range(W):
        if rows[y][x] == 'i' and not any(inb(x + dx, y + dy) and rows[y + dy][x + dx] in LAND for dy in range(-2, 3) for dx in range(-2, 3)): rows[y][x] = '~'

# the Northern Reaches: the ice fields read as shallows - within their bounds, shallow that does not touch open sea is snow
for _ in range(3):
    for y in range(6, 50):
        for x in range(108, 178):
            if rows[y][x] == 'i' and not any(inb(x + dx, y + dy) and rows[y + dy][x + dx] == '~' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): rows[y][x] = 'u'
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
# a pass (a plateau, a bridge, a cliff path, a desert's mouth, a mountain cave) opens only on the sides it is walked in
# from: the rest of the picture round its marker stays rock, so the party cannot walk round it on the world
SIDES = { 'west_lunpa_cave': 'w', 'shaman': 'w', 'yampi_s': 'e', 'dehkan': 'ns', 'madra_bridge': 'w', 'osenia_cliffs_e': 'e', 'yampi': 'nw', 'yampi_e': 'n', 'gondowan_cliffs': 'e', 'gondowan_cliffs_w': 'w', 'kibombo_mtns': 'ws' }
for name, mid, x, y, tile in PLACES:
    sides = SIDES.get(mid)
    for dy in (-2, -1, 0, 1):
        for dx in (-1, 0, 1):
            if not inb(x + dx, y + dy): continue
            if (dx or dy) and any(abs(x + dx - mx_) <= 1 and abs(y + dy - my_) <= 1 for _, mid_, mx_, my_, _ in PLACES if mid_ != mid): continue   # another marker's own ground is its to clear
            if sides is None:
                if rows[y + dy][x + dx] not in '~irxm': rows[y + dy][x + dx] = '.'
                continue
            keep = (dx == 0 and dy == 0) or (dx == 0 and dy < 0 and 'n' in sides) or (dx == 0 and dy > 0 and 's' in sides) or (dy == 0 and dx < 0 and 'w' in sides) or (dy == 0 and dx > 0 and 'e' in sides)
            rows[y + dy][x + dx] = '.' if keep else '#'
    if sides is not None:
        for dx, dy, side in ((0, -1, 'n'), (0, 1, 's'), (-1, 0, 'w'), (1, 0, 'e')):
            if side not in sides: continue
            for k in range(1, 8):
                cx, cy = x + dx * k, y + dy * k
                if not inb(cx, cy) or rows[cy][cx] in '~irx': break   # a mouth's road stops at water: a river is crossed by a bridge or not at all
                was = rows[cy][cx]; rows[cy][cx] = '.'
                nx_, ny_ = x + dx * (k + 1), y + dy * (k + 1)
                if k >= 2 and was not in '# ' and inb(nx_, ny_) and rows[ny_][nx_] not in '# ': break   # open ground reached
    if inb(x, y) and rows[y][x] in '~irx' and tile not in ('w_dock', 'w_island', 'w_strait'): rows[y][x] = '.'
    if inb(x, y) and tile == 'w_island' and rows[y][x] in '~irx': rows[y][x] = '.'   # an islet's marker stands on its sand
POSMAP = { mid: (x, y) for name, mid, x, y, tile in PLACES }

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
dunes(['yampi', 'yampi_e'])
# the roads the picture leaves at a river bank: bridges, as the game has them (the guide walks south from the Osenia
# Cliffs to Mikasalla without the desert; the road from the cliffs plain ends at the river and starts again beyond it)
FIX = [(175, 216, 175, 217, 'b'),   # the road south from the cliffs plain, over the river onto the wooded island
       (35, 243, 37, 245, 'g'), (38, 243, 38, 245, 'm'),   # the Atteka Cavern's mouth at the continent's south tip: a patch of ground, and the beach the flying ship puts in at
       (176, 221, 176, 222, 'b'),   # and off the island, over the loop, onto the road to Mikasalla
       (164, 195, 165, 197, 'r'), (164, 198, 164, 198, 'r'),   # the rapids under the Osenia Cliffs: the river from the inlet to Madra's east, white water the picture's rule misses
       (157, 157, 157, 157, 'm'),   # the beach north of Daila, the way round the rocks to Idejima
       (83, 70, 83, 70, 'm'),   # Hesperia North: Petra's pocket between the rivers gets a beach, so the flying ship can put in beside it (Isaac's day)
       (135, 161, 139, 161, 'i'),   # the strait north of the West Indra Islet: an islet, put in at by ship, not a spit walked to from Kibombo

       (152, 122, 152, 122, '.'), (151, 123, 151, 123, '.'), (150, 68, 150, 68, '.'),   # Lunpa's yard joins the plain west of the cave, as on the Golden Sun map (else the cave's mouth is a back door round a shut valley)
         # Lalivero's bank: the rip's delta laps the marker on every side; the town is walked up to from the north, off the Suhalla road
      ]
for f in FIX: setc(*f)
# the shores: open ground on the sea is beach, where the ship can put in
for y in range(H):
    for x in range(W):
        if rows[y][x] == '.' and any(inb(x + dx, y + dy) and rows[y + dy][x + dx] in '~i' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): rows[y][x] = 'm'

# the passes the classifier closed: where the story joins two places by land and the rock is in the way, the road
# is cut through by the cheapest line (over open ground when it can, through the range where it must)
import heapq
PASSES = [('kandorean', 'dehkan'), ('dehkan', 'madra'), ('alhafra', 'alhafran_cave'), ('madra', 'indra_shore'), ('champa', 'ankohl'), ('prox', 'mars_lh_1'), ('loho', 'kalay'),
          ('garoh', 'airs_rock'), ('mikasalla', 'garoh'), ('naribwe', 'kibombo_mtns'), ('contigo', 'jupiter_lh'), ('hesperia_settlement', 'shaman'), ('contigo', 'atteka_inlet'), ('izumo', 'gaia_rock'), ('yallam', 'taopo')]
POS = { mid: (x, y) for name, mid, x, y, tile in PLACES }
WALK = set('.:Tamu')
def carve(a, b):
    (ax, ay), (bx, by) = POS[a], POS[b]
    dist = { (ax, ay): 0 }; prev = {}; pq = [(0, ax, ay)]
    while pq:
        d, x, y = heapq.heappop(pq)
        if (x, y) == (bx, by): break
        if d > dist.get((x, y), 1e9): continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not inb(nx, ny): continue
            c = rows[ny][nx]
            step = 1 if c in WALK else 12 if c == '#' else 6 if c == 'r' else None
            if (nx, ny) == (bx, by): step = 1
            if step is None: continue
            nd = d + step
            if nd < dist.get((nx, ny), 1e9): dist[(nx, ny)] = nd; prev[(nx, ny)] = (x, y); heapq.heappush(pq, (nd, nx, ny))
    if (bx, by) not in prev: print('  no way to cut from', a, 'to', b); return
    cur = (bx, by); cut = 0
    while cur != (ax, ay):
        x, y = cur
        if rows[y][x] in '#r': rows[y][x] = ':'; cut += 1
        cur = prev[cur]
    if cut: print('  cut a pass of %d cells between %s and %s' % (cut, a, b))
for a, b in PASSES: carve(a, b)

out = os.path.join(ROOT, 'js', 'maps', 'world_tla_layout.js')
with open(out, 'w', encoding='utf-8') as fh:
    fh.write("// Generated by tools/weyard_gen.py from the reference rip: do not edit by hand, fix the tool and rerun it.\n'use strict';\n")
    fh.write("const WORLD_TLA_LAYOUT = {\n  rows: [\n")
    for r in rows: fh.write("    '%s',\n" % ''.join(r))
    fh.write("  ],\n  places: [\n")
    for name, mid, x, y, tile in PLACES: fh.write("    { name: %r, map: %r, x: %d, y: %d, tile: %r },\n" % (name, mid, x, y, tile))
    fh.write("  ],\n};\n")
cnt = Counter(c for r in rows for c in r)
print('wrote', out, W, 'x', H, dict(cnt))
