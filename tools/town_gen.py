# A town's districts from its reference rip: the class maps tools/tilemap.py wrote, corrected where the classifier
# cannot know better (the town's config in tools/towns/<town>.py: bridges, stairs, landmarks, doorsteps), become the
# rows and object lists of js/maps/<town>_layout.js. The houses are the roof/wall blobs, each with the door the rip's
# letter marks; the trees are the crown blobs, planted as two-tile trees; bushes and rocks are what is left. Every
# district is flood-filled from its entrance and the places that matter are reported if they cannot be reached.
#   python tools/town_gen.py <town> [map <panel> y0 y1 | cells <panel> x,y ...]
import os, json, sys, importlib
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__)); TM = os.path.join(HERE, 'tm'); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, 'towns')); CFG = importlib.import_module(sys.argv[1])
FIX, POND_BANKS, RESERVED, DOORS, ENTRY, TARGETS = [getattr(CFG, n, {}) for n in ['FIX', 'POND_BANKS', 'RESERVED', 'DOORS', 'ENTRY', 'TARGETS']]

def rows_of(name):
    return [list(l.rstrip('\n')) for l in open(os.path.join(TM, name + '.txt')) if l.strip('\n')]

def setc(rows, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): rows[y][x] = ch

# ---- the corrections, per district: (x0, y0, x1, y1, class char) ----
# the sizes of the bridges' water, so that the pond fix above does not eat the banks
# ---- interiors behind the doors, by the rip's letters ----

def edge_column(rows, name):
    # a panel column the ripper cut short is read again by its colour alone (a config's EDGE_COLUMN)
    ec = (getattr(CFG, 'EDGE_COLUMN', {}) or {}).get(name)
    if not ec: return
    from PIL import Image
    im = np.array(Image.open(os.path.join(ROOT, CFG.SRC)).convert('RGB')).astype(int)
    for j in range(len(rows)):
        r, g, b = im[ec['y0'] + j * 16:ec['y0'] + j * 16 + 16, ec['px'][0]:ec['px'][1]].reshape(-1, 3).mean(axis=0)
        rows[j][ec['x']] = '.' if g > 170 and r < 190 and b < 130 else ('~' if b > 150 and b > r + 40 else ('#' if r > 90 and r > b + 30 and g < 170 else '.'))

def gen(name):
    # a config may draw a panel outright (ROWS) where the rip's classes are not worth correcting
    rows = [list(r) for r in (getattr(CFG, 'ROWS', {}) or {}).get(name, [])] or rows_of(name); H, W = len(rows), len(rows[0]); edge_column(rows, name)
    for y in range(H):
        for x in range(W):
            if rows[y][x] in 'BS': rows[y][x] = '.'
    for f in FIX.get(name, []) + POND_BANKS.get(name, []): setc(rows, *f)
    # crumbs of rock the classifier left where a cliff line runs thin become ground, and pinholes in the rock
    # close, so the cliffs read as bands rather than scattered blocks
    # small things the classifier cannot place cell by cell are found in the picture: stumps drawn astride two cells
    # (STUMPS: one rock per orange stump top, other rock candidates cleared) and rocks lying on ice (ICE_ROCKS: a rock
    # wherever brown shows through the ice)
    picks = []; icerocks = []
    if name in (getattr(CFG, 'STUMPS', ()) or ()): picks.append(('o', lambda r, g, b: (r > 190) & (g > 100) & (g < 170) & (b < 110) & (r - b > 90), 12, True))
    if name in (getattr(CFG, 'ICE_ROCKS', ()) or ()): picks.append(('~', lambda r, g, b: (r > 120) & (r > g + 15) & (g > b + 15) & (r - b > 60), 14, False))
    if picks:
        from PIL import Image
        z = np.load(os.path.join(TM, name + '.npz')); bx, by, bw, bh = map(int, z['box'])
        im = np.array(Image.open(os.path.join(ROOT, str(z['src']))).convert('RGB').crop((bx, by, bx + bw, by + bh))).astype(int)
        r, g, b = im[..., 0], im[..., 1], im[..., 2]
        for cls, test, minpx, clear in picks:
            cand = np.zeros((H, W), bool)
            for y in range(H):
                for x in range(W):
                    if rows[y][x] == cls: cand[y][x] = True
            mask = test(r, g, b) & np.kron(cand, np.ones((16, 16), bool))
            lab, n = ndimage.label(mask); keep = set()
            for k, sl in enumerate(ndimage.find_objects(lab)):
                ys, xs = np.where(lab == k + 1)
                if len(ys) < minpx: continue
                keep.add((int(xs.mean()) // 16, int(ys.mean()) // 16))
            for y in range(H):
                for x in range(W):
                    if rows[y][x] == cls and clear: rows[y][x] = 'o' if (x, y) in keep else '.'
                    elif rows[y][x] == cls and (x, y) in keep: icerocks.append([x, y])   # the ice stays ice under it
    R = np.array([[c for c in r] for r in rows]); rock = R == '#'
    lab, n = ndimage.label(rock)
    for k, sl in enumerate(ndimage.find_objects(lab)):
        if (lab[sl] == k + 1).sum() <= 2:
            for (yy, xx) in zip(*np.where(lab == k + 1)): rows[yy][xx] = '.'
    # a lone patch of path in the grass is the classifier reading a worn spot: it stays grass
    for y in range(H):
        for x in range(W):
            if rows[y][x] == ':' and not any(0 <= y + dy < H and 0 <= x + dx < W and rows[y + dy][x + dx] == ':' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): rows[y][x] = '.'
    R = np.array([[c for c in r] for r in rows]); lab, n = ndimage.label(R == '.')
    for k, sl in enumerate(ndimage.find_objects(lab)):
        if (lab[sl] == k + 1).sum() <= 1:
            for (yy, xx) in zip(*np.where(lab == k + 1)):
                if all(0 <= yy + dy < H and 0 <= xx + dx < W and rows[yy + dy][xx + dx] == '#' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): rows[yy][xx] = '#'
    R = np.array([[c for c in r] for r in rows])
    # houses: blobs of roof and wall; the door sits in the wall's bottom row under the letter, or in the middle
    house = np.isin(R, ['R', 'H', 'D']); lab, n = ndimage.label(house, structure=np.ones((3, 3)))
    houses = []; parts = []
    for k, sl in enumerate(ndimage.find_objects(lab)):
        ys, xs = sl; m = lab[ys, xs] == k + 1; sub = R[ys, xs]
        # two houses one above the other touch in the rip: a roof row right under a wall row starts a new house
        nH = [(sub[j] == 'H').sum() for j in range(m.shape[0])]; nR = [(sub[j] == 'R').sum() for j in range(m.shape[0])]
        cuts = [0]
        for j in range(1, m.shape[0]):
            above = [i for i in range(j - 1, max(-1, j - 4), -1) if nH[i] + nR[i] >= 2]
            if nR[j] >= 2 and nR[j] >= nH[j] and above and nH[above[0]] >= 2 and nH[above[0]] > nR[above[0]]: cuts.append(j)
        cuts.append(m.shape[0])
        for a, b in zip(cuts, cuts[1:]):
            if b - a >= 3: parts.append((ys.start + a, ys.start + b - 1, xs.start, xs.stop - 1, m[a:b]))
    for (y0, y1, x0, x1, m) in parts:
        # a roof rip is wider at the eaves: keep the columns and rows the house really fills
        cols = [x0 + i for i in range(m.shape[1]) if m[:, i].mean() >= 0.2]; rws = [y0 + j for j in range(m.shape[0]) if m[j].mean() >= 0.3]
        if len(cols) < 3 or len(rws) < 3: continue
        x0, x1, y0, y1 = cols[0], cols[-1], rws[0], rws[-1]
        door = None
        for (lx, ly), letter in DOORS.get(name, {}).items():
            if x0 - 1 <= lx <= x1 + 1 and y0 <= ly <= y1 + 1: door = (min(max(lx, x0 + 1), x1 - 1), letter); y1 = max(y1, ly)
        houses.append({ 'x': int(x0), 'y': int(y0), 'w': int(x1 - x0 + 1), 'h': int(y1 - y0 + 1), 'doorX': int(door[0] - x0) if door else int((x1 - x0) // 2), 'letter': door[1] if door else None })
        # the stepping stones in front of every door read as rock: the doorstep is ground
        dx = x0 + houses[-1]['doorX']
        for dy in (1, 2):
            if y1 + dy < H and rows[y1 + dy][dx] in '#o': rows[y1 + dy][dx] = '.'
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): rows[y][x] = '.'
    # houses the config draws by hand (two that touch in the rip, or one the classifier missed) replace whatever was found there
    for o in (getattr(CFG, 'HOUSES', {}) or {}).get(name, []):
        houses = [h for h in houses if h['x'] + h['w'] <= o['x'] or o['x'] + o['w'] <= h['x'] or h['y'] + h['h'] <= o['y'] or o['y'] + o['h'] <= h['y']]
        houses.append(dict(o)); dx = o['x'] + o['doorX']
        for dy in (1, 2):
            if o['y'] + o['h'] - 1 + dy < H and rows[o['y'] + o['h'] - 1 + dy][dx] in '#o': rows[o['y'] + o['h'] - 1 + dy][dx] = '.'
        for y in range(o['y'], o['y'] + o['h']):
            for x in range(o['x'], o['x'] + o['w']): rows[y][x] = '.'
    for y in range(H):
        for x in range(W):
            if rows[y][x] in 'RHD': rows[y][x] = '.'
    # trees: a small crown blob is one tree with its trunk on the blob's bottom row; a bigger one (trees drawn
    # overlapping) gets a tree every two cells along its bottom row and again two rows up, so the crowns, which the
    # player can walk behind, fill the rows between the solid trunk rows the way the rip's forest edges do
    R = np.array([[c for c in r] for r in rows]); tree = R == 'T'; lab, n = ndimage.label(tree, structure=np.ones((3, 3)))
    T = lambda x, y: 0 <= x < W and 0 <= y < H and rows[y][x] == 'T'
    plain = lambda x, y: 0 <= x < W and 0 <= y < H and rows[y][x] in '.Tv'
    used = np.zeros((H, W), bool); trees = []
    for hs in houses:
        used[hs['y']:hs['y'] + hs['h'] + 1, max(0, hs['x'] - 1):hs['x'] + hs['w'] + 1] = True   # the house, its doorstep and its eaves
    # no two trees close enough for one's crown to sit beside the other's trunk or on top of its crown: a planted
    # tree keeps the cells around it (two to the side, one row up and down; one to the side, two rows up and down)
    near = np.zeros((H, W), bool); reserved = np.zeros((H, W), bool)
    for (x0, y0, x1, y1) in RESERVED.get(name, []): reserved[y0:y1 + 1, x0:x1 + 1] = True
    def room(x, y):
        if not (plain(x, y) and plain(x + 1, y) and not used[y, x] and not used[y, x + 1] and not near[y, x] and not near[y, x + 1]): return False
        return not any(0 <= y + dy < H and 0 <= x + dx < W and reserved[y + dy, x + dx] for dx, dy in [(0, 0), (1, 0), (0, -1), (1, -1)])
    def plant(x, y):
        trees.append([x, y])
        for dx, dy in [(0, 0), (1, 0), (0, -1), (1, -1)]:
            if 0 <= y + dy < H and 0 <= x + dx < W: used[y + dy, x + dx] = True
        near[max(0, y - 1):y + 2, max(0, x - 2):x + 4] = True; near[max(0, y - 2):y + 3, max(0, x - 1):x + 3] = True
    for k, sl in enumerate(ndimage.find_objects(lab)):
        ys, xs = sl; w, h = xs.stop - xs.start, ys.stop - ys.start
        if w <= 4:
            # one tree wide: a tree every five rows up from the bottom, trunk in the middle, so the sides stay open
            bx = xs.start + (w - 2) // 2
            for by in range(ys.stop - 1, ys.start - 1, -5):
                for cx, cy in [(bx, by), (bx - 1, by), (bx + 1, by), (bx, by - 1)]:
                    if room(cx, cy): plant(cx, cy); break
            continue
        # a forest: trees three rows apart so no trunk stands on the crown below it, each row shifted like bricks
        for k, y in enumerate(range(ys.stop - 1, ys.start - 1, -3)):
            x = xs.start + (k % 2)
            while x < xs.stop:
                if (T(x, y) or T(x + 1, y)) and room(x, y): plant(x, y); x += 3
                elif T(x, y) and room(x - 1, y): plant(x - 1, y); x += 2
                else: x += 1
    # a tree is red when the rip's crown there is: the mean colour of its four cells
    z = np.load(os.path.join(TM, name + '.npz')); cells = z['cells'].astype(int); cols = int(z['cols'])
    for t in trees:
        x, y = t; px = [cells[cy * cols + cx] for cx, cy in [(x, y), (x + 1, y), (x, y - 1), (x + 1, y - 1)] if 0 <= cy < H and 0 <= cx < W]
        m = np.mean([c.reshape(-1, 3).mean(axis=0) for c in px], axis=0); t.append(1 if m[0] > m[1] else 0)
    # what the trees did not cover stays grass, with a bush where the crown blob had one
    # a bush touching a tree reads as a lump on the tree: those go
    treecells = set((x + dx, y + dy) for x, y, *_ in trees for dx in (0, 1) for dy in (0, -1))
    bushes = [[x, y] for y in range(H) for x in range(W) if rows[y][x] == 'v' and not any((x + dx, y + dy) in treecells for dx in (-1, 0, 1) for dy in (-1, 0, 1))]
    # the crown cells no planted tree covers: a dense wood's filler, so a forest edge reads as forest, not a hedge
    canopy = [[x, y] for y in range(H) for x in range(W) if rows[y][x] == 'T' and (x, y) not in treecells]
    rocks = [[x, y] for y in range(H) for x in range(W) if rows[y][x] == 'o']
    # felled logs (n): each run of cells is one log, lying along or across
    logs = []; R = np.array([[c for c in r] for r in rows]); lab, n = ndimage.label(R == 'n')
    for k, sl in enumerate(ndimage.find_objects(lab)):
        ys, xs = sl; w, h = xs.stop - xs.start, ys.stop - ys.start
        logs.append({ 'x': int(xs.start), 'y': int(ys.start), 'len': int(max(w, h)), 'horiz': bool(w >= h) })
    logs += [dict(l) for l in (getattr(CFG, 'LOGS', {}) or {}).get(name, [])]   # logs the config places, over water or anywhere the rows must keep
    fences = [[x, y] for y in range(H) for x in range(W) if rows[y][x] == 'F']
    for y in range(H):
        for x in range(W):
            if rows[y][x] in 'TvoFn?': rows[y][x] = '.'
            if rows[y][x] == ' ': rows[y][x] = '#'
    return { 'rows': [''.join(r) for r in rows], 'houses': houses, 'trees': trees, 'bushes': bushes, 'rocks': rocks, 'fences': fences, 'canopy': canopy, 'logs': logs, 'icerocks': icerocks }

def reach(name, d):
    from collections import deque
    rows = d['rows']; H, W = len(rows), len(rows[0])
    okc = '.:BSkPh' + ('~' if getattr(CFG, 'ICE', False) else '')   # P: the tops of a log palisade, walked along; h: a pond's bed once drained; ~ is ice where the config says so
    ok = [[c in okc for c in r] for r in rows]
    for h in d['houses']:
        for y in range(h['y'], h['y'] + h['h']):
            for x in range(h['x'], h['x'] + h['w']): ok[y][x] = False
        for x in range(h['x'], h['x'] + h['w']): ok[h['y']][x] = True
        ok[h['y'] + h['h'] - 1][h['x'] + h['doorX']] = True
    for x, y, red in d['trees']:
        for dx in (0, 1):
            if 0 <= x + dx < W: ok[y][x + dx] = False
    # the canopy filler only blocks where the map draws it (a config's CANOPY)
    for x, y in d['bushes'] + d['rocks'] + d['fences'] + (d.get('canopy', []) if getattr(CFG, 'CANOPY', False) else []) + d.get('icerocks', []): ok[y][x] = False
    for lg in d.get('logs', []):
        for i in range(lg['len']): ok[lg['y'] + (0 if lg['horiz'] else i)][lg['x'] + (i if lg['horiz'] else 0)] = False
    start = ENTRY[name]; ok[start[1]][start[0]] = True; seen = { start }; q = deque([start])
    hop = lambda x, y: 0 <= x < W and 0 <= y < H and rows[y][x] == '~' and getattr(CFG, 'HOP_WATER', False)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and ok[ny][nx] and (nx, ny) not in seen: seen.add((nx, ny)); q.append((nx, ny))
            elif hop(nx, ny) and 0 <= nx + dx < W and 0 <= ny + dy < H and ok[ny + dy][nx + dx] and (nx + dx, ny + dy) not in seen: seen.add((nx + dx, ny + dy)); q.append((nx + dx, ny + dy))
    bad = [k for k, p in TARGETS[name].items() if p not in seen]
    print('   ', name, 'reaches', len(seen), 'cells;', ('UNREACHABLE: ' + ', '.join(bad)) if bad else 'everything reachable')
    return ok, seen

def check(name, d):
    ok, seen = reach(name, d)
    # the layout drawn beside the rip, for the eye: cliffs brown, water blue, houses yellow with magenta doors, trees green
    from PIL import Image, ImageDraw
    z = np.load(os.path.join(TM, name + '.npz')); src = str(z['src']); x0, y0, w, h = map(int, z['box'])
    ref = Image.open(src).convert('RGB').crop((x0, y0, x0 + w, y0 + h)).resize((w * 2, h * 2), Image.NEAREST); w, h = w // 16, h // 16
    col = { '.': (110, 200, 90), ':': (225, 200, 130), '~': (50, 100, 220), 'W': (160, 210, 255), '#': (130, 85, 40), 'B': (170, 120, 60), 'S': (255, 140, 0), 'k': (170, 170, 190), 'P': (220, 190, 120), 'Q': (150, 110, 60) }
    out = Image.new('RGB', (w * 32, h * 32)); dr = ImageDraw.Draw(out)
    for j, r in enumerate(d['rows']):
        for i, c in enumerate(r): dr.rectangle([i * 32, j * 32, i * 32 + 31, j * 32 + 31], fill=col.get(c, (255, 0, 0)), outline=(0, 0, 0))
    for hs in d['houses']:
        dr.rectangle([hs['x'] * 32, hs['y'] * 32, (hs['x'] + hs['w']) * 32 - 1, (hs['y'] + hs['h']) * 32 - 1], fill=(240, 210, 60), outline=(120, 80, 0))
        dx, dy = hs['x'] + hs['doorX'], hs['y'] + hs['h'] - 1; dr.rectangle([dx * 32, dy * 32, dx * 32 + 31, dy * 32 + 31], fill=(255, 0, 255))
        if hs['letter']: dr.text((hs['x'] * 32 + 4, hs['y'] * 32 + 4), hs['letter'], fill=(0, 0, 0))
    for x, y, red in d['trees']: dr.ellipse([x * 32 + 2, (y - 1) * 32 + 2, (x + 2) * 32 - 2, (y + 1) * 32 - 2], fill=(180, 60, 20) if red else (20, 110, 30), outline=(0, 60, 0))
    for x, y in d['bushes']: dr.ellipse([x * 32 + 6, y * 32 + 6, x * 32 + 26, y * 32 + 26], fill=(40, 150, 60))
    for x, y in d['rocks']: dr.ellipse([x * 32 + 6, y * 32 + 6, x * 32 + 26, y * 32 + 26], fill=(150, 150, 150))
    for x, y in d['fences']: dr.rectangle([x * 32 + 4, y * 32 + 10, x * 32 + 28, y * 32 + 22], fill=(200, 160, 100))
    for y in range(h):
        for x in range(w):
            if ok[y][x] and (x, y) not in seen: dr.rectangle([x * 32 + 8, y * 32 + 8, x * 32 + 23, y * 32 + 23], fill=(255, 0, 0))
    both = Image.new('RGB', (w * 64 + 8, h * 32)); both.paste(ref, (0, 0)); both.paste(Image.blend(ref, out, 0.55), (w * 32 + 8, 0)); both.save(os.path.join(TM, name + '_layout.png'))

if len(sys.argv) > 2 and sys.argv[2] == 'cells':
    # are these cells open? python tools/town_gen.py vale cells vale_main 18,46 13,47 ...
    d = gen(sys.argv[3]); ok, seen = reach(sys.argv[3], d)
    for a in sys.argv[4:]:
        x, y = map(int, a.split(',')); print(a, 'open' if ok[y][x] else 'BLOCKED (%s)' % d['rows'][y][x], '' if (x, y) in seen or not ok[y][x] else 'but unreached')
    sys.exit(0)
if len(sys.argv) > 2 and sys.argv[2] == 'map':
    # print a district's reachability: '.' reached, '_' open but not reached, '#' blocked
    d = gen(sys.argv[3]); ok, seen = reach(sys.argv[3], d); y0, y1 = int(sys.argv[4]), int(sys.argv[5])
    for y in range(y0, y1 + 1): print('%2d ' % y + ''.join('.' if (x, y) in seen else ('_' if ok[y][x] else '#') for x in range(len(ok[0]))))
    sys.exit(0)
out = { n: gen(n) for n in CFG.PANELS }
for n, d in out.items(): check(n, d)
js = ['// Generated by tools/town_gen.py %s from the reference rip: do not edit by hand, fix the config and rerun it.' % sys.argv[1], "'use strict';", 'const %s = {' % CFG.VAR]
for n, d in out.items():
    js.append('  %s: {' % CFG.KEY[n])
    js.append('    rows: [\n' + ',\n'.join("      '%s'" % r for r in d['rows']) + '\n    ],')
    js.append('    houses: [' + ', '.join(json.dumps(h, separators=(',', ':')) for h in d['houses']) + '],')
    for key in ('trees', 'bushes', 'rocks', 'fences', 'canopy', 'logs', 'icerocks'): js.append('    %s: %s,' % (key, json.dumps(d[key], separators=(',', ':'))))
    js.append('  },')
js.append('};')
open(os.path.join(ROOT, CFG.OUT), 'w', encoding='utf-8').write('\n'.join(js) + '\n')
for n, d in out.items(): print(n, len(d['rows']), 'rows', len(d['houses']), 'houses', [h['letter'] for h in d['houses']], len(d['trees']), 'trees', len(d['bushes']), 'bushes')
