# Turn a reference map rip into a tile grid the game can build from.
#
# The rips are lossy and Golden Sun's maps are drawn from thousands of tile variants, so tiles are not matched
# exactly: every 16x16 cell gets a feature vector (colour layout + colour histogram), the cells are clustered, each
# cluster is labelled once with a terrain class from a contact sheet, and every labelled cell is kept as training
# data (tools/tiletrain.npz) so the next map is classified by nearest neighbour and only needs review.
#
#   python tools/tilemap.py extract <ref> x0 y0 w h <name> [K]  cut the region into cells and cluster them (K clusters,
#                                                                 tm/<name>_clusters.png to label from); K = 0 skips the
#                                                                 clustering and classifies every cell from the training set
#   python tools/tilemap.py group <group> K <name> <name> ...       cluster several extracted panels together (a dungeon's rooms)
#   python tools/tilemap.py label <name> "0:g 1:c 2-5:w ..."      label clusters (n-m:c for a run); a grouped panel labels its group
#   python tools/tilemap.py fix <name> "x,y:c x,y:c ..."           per-cell overrides after review
#   python tools/tilemap.py emit <name>                            write tm/<name>.txt (ASCII rows) and tm/<name>_check.png
#                                                                 (the rip beside its class tint) and add the map to the training set
#
# classes: g grass  c cliff face  w water  f waterfall  p path  b bridge  s stairs  t tree crown  r roof  h house wall
#          d door  o prop (fence, sign, rock, well)  x outside  k stone floor  n snow  a sand  v bush  ? unknown
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__)); TM = os.path.join(HERE, 'tm'); os.makedirs(TM, exist_ok=True)
TRAIN = os.path.join(HERE, 'tiletrain.npz')
CH = { 'g': '.', 'c': '#', 'w': '~', 'f': 'W', 'p': ':', 'b': 'B', 's': 'S', 't': 'T', 'r': 'R', 'h': 'H', 'd': 'D', 'o': 'o', 'x': ' ', 'k': 'k', 'n': 'n', 'a': 'a', 'v': 'v', '?': '?',
       # dungeons: e blue tiled floor, i a pit or gap, u purple floor, m a relief on the wall, l a lit torch or pillar, y stairs
       'e': 'e', 'i': 'i', 'u': 'u', 'm': 'm', 'l': 'l', 'y': 'y',
       'F': 'F',    # a fence
       'q': 'c' }   # a cave floor
COLOR = { 'g': (60, 200, 60), 'c': (140, 90, 40), 'w': (40, 90, 220), 'f': (150, 200, 255), 'p': (230, 200, 120), 'b': (170, 120, 60), 's': (255, 120, 0),
          't': (0, 100, 0), 'r': (250, 230, 40), 'h': (250, 250, 250), 'd': (255, 0, 255), 'o': (120, 120, 120), 'x': (0, 0, 0), 'k': (160, 160, 180),
          'n': (240, 240, 255), 'a': (230, 220, 160), 'v': (0, 160, 90), '?': (255, 0, 0),
          'e': (80, 120, 220), 'i': (20, 20, 60), 'u': (150, 60, 200), 'm': (255, 255, 0), 'l': (255, 180, 60), 'y': (255, 120, 0), 'F': (200, 160, 100), 'q': (110, 130, 90) }

def features(cells):
    # cells: (N,16,16,3) float. 4x4 block means keep the layout (a rim on top is not a rim on the bottom), the
    # histogram keeps the palette; both scaled so neither dominates the distance
    N = len(cells); blk = cells.reshape(N, 4, 4, 4, 4, 3).mean(axis=(2, 4)).reshape(N, -1) / 255.0
    q = np.clip((cells // 64).astype(int), 0, 3); idx = q[..., 0] * 16 + q[..., 1] * 4 + q[..., 2]
    hist = np.stack([np.bincount(idx[i].reshape(-1), minlength=64) for i in range(N)]) / 256.0
    return np.hstack([blk, hist * 4.0]).astype(np.float32)

def kmeans(F, K, iters=30, seed=1):
    rng = np.random.default_rng(seed); C = F[rng.choice(len(F), K, replace=False)].copy()
    for _ in range(iters):
        d = ((F[:, None, :] - C[None, :, :]) ** 2).sum(axis=2); a = d.argmin(axis=1)
        for k in range(K):
            m = a == k
            if m.any(): C[k] = F[m].mean(axis=0)
            else: C[k] = F[rng.integers(len(F))]
    d = ((F[:, None, :] - C[None, :, :]) ** 2).sum(axis=2); return d.argmin(axis=1), C

def load(name):
    z = np.load(os.path.join(TM, name + '.npz'), allow_pickle=True); return { k: z[k] for k in z.files }

def extract(src, x0, y0, w, h, name, K=48):
    im = np.array(Image.open(src).convert('RGB').crop((x0, y0, x0 + w, y0 + h))).astype(np.float32)
    rows, cols = h // 16, w // 16
    cells = np.stack([im[j * 16:(j + 1) * 16, i * 16:(i + 1) * 16] for j in range(rows) for i in range(cols)])
    F = features(cells); a, C = kmeans(F, K) if K > 0 else (np.zeros(len(F), int) - 1, None)
    np.savez_compressed(os.path.join(TM, name + '.npz'), cells=cells.astype(np.uint8), F=F, cluster=a, rows=rows, cols=cols, box=np.array([x0, y0, w, h]), src=np.array(src))
    # the contact sheet: one row per cluster, its id at the left, up to 14 example cells (the closest to the centre first)
    if K <= 0: print(rows, 'x', cols, 'cells, classified from the training set'); return
    per = 14; cell = 36; out = Image.new('RGB', (40 + per * cell, K * cell), (30, 30, 30)); d = ImageDraw.Draw(out)
    for k in range(K):
        members = np.where(a == k)[0]
        if len(members) == 0: continue
        order = members[np.argsort(((F[members] - C[k]) ** 2).sum(axis=1))]
        pick = list(order[:per // 2]) + list(order[-(per - per // 2):]) if len(order) > per else list(order)
        d.text((4, k * cell + 10), '%d (%d)' % (k, len(members)), fill=(255, 255, 0))
        for n, i in enumerate(pick): out.paste(Image.fromarray(cells[i].astype(np.uint8)).resize((32, 32), Image.NEAREST), (40 + n * cell, k * cell + 2))
    out.save(os.path.join(TM, name + '_clusters.png')); print(rows, 'x', cols, 'cells,', K, 'clusters ->', os.path.join(TM, name + '_clusters.png'))

def group(gname, K, names):
    # several panels of one rip clustered together, so a dungeon's tiles are labelled once for all its rooms
    zs = [load(n) for n in names]; F = np.vstack([z['F'] for z in zs]); cells = np.vstack([z['cells'] for z in zs])
    a, C = kmeans(F, K); at = 0
    for n, z in zip(names, zs):
        cl = a[at:at + len(z['F'])]; at += len(z['F'])
        np.savez_compressed(os.path.join(TM, n + '.npz'), cells=z['cells'], F=z['F'], cluster=cl, rows=z['rows'], cols=z['cols'], box=z['box'], src=z['src'])
        json.dump({ 'group': gname }, open(os.path.join(TM, n + '.meta.json'), 'w'))
    per = 14; cell = 36; out = Image.new('RGB', (40 + per * cell, K * cell), (30, 30, 30)); d = ImageDraw.Draw(out)
    for k in range(K):
        members = np.where(a == k)[0]
        if len(members) == 0: continue
        order = members[np.argsort(((F[members] - C[k]) ** 2).sum(axis=1))]
        pick = list(order[:per // 2]) + list(order[-(per - per // 2):]) if len(order) > per else list(order)
        d.text((4, k * cell + 10), '%d (%d)' % (k, len(members)), fill=(255, 255, 0))
        for m, i in enumerate(pick): out.paste(Image.fromarray(cells[i].astype(np.uint8)).resize((32, 32), Image.NEAREST), (40 + m * cell, k * cell + 2))
    out.save(os.path.join(TM, gname + '_clusters.png')); print(len(F), 'cells in', len(names), 'panels,', K, 'clusters ->', os.path.join(TM, gname + '_clusters.png'))

def labels_file(name):
    meta = os.path.join(TM, name + '.meta.json')
    g = json.load(open(meta))['group'] if os.path.exists(meta) else name
    return os.path.join(TM, g + '_labels.json')

def label(name, spec):
    lp = labels_file(name); lab = json.load(open(lp)) if os.path.exists(lp) else {}
    z = None
    for item in spec.split():
        rng, cls = item.split(':'); a, b = rng.split('-') if '-' in rng else (rng, rng)
        for k in range(int(a), int(b) + 1): lab[str(k)] = cls
    json.dump(lab, open(lp, 'w')); print('clusters labelled', len(lab), '->', lp)

def classes(name):
    # each cell's class: a per-cell fix, else its cluster's label, else nearest neighbour from the training set
    z = load(name); N = len(z['cells']); cls = ['?'] * N
    labp = labels_file(name); lab = json.load(open(labp)) if os.path.exists(labp) else {}
    for i in range(N):
        if str(z['cluster'][i]) in lab: cls[i] = lab[str(z['cluster'][i])]
    if os.path.exists(TRAIN) and '?' in cls:
        t = np.load(TRAIN); TF, TL = t['F'], t['L']; F = z['F']
        for i in range(N):
            if cls[i] != '?': continue
            d = ((TF - F[i]) ** 2).sum(axis=1); cls[i] = str(TL[d.argmin()])
    if 'c' in cls or 't' in cls: cls = refine(z, cls)   # the pixel pass knows cliffs and trees
    if 'q' in cls: cls = refine_cave(z, cls)              # ...and cave floor from cave rock
    fixp = os.path.join(TM, name + '_fix.json')
    if os.path.exists(fixp):
        for key, c in json.load(open(fixp)).items(): x, y = map(int, key.split(',')); cls[y * int(z['cols']) + x] = c
    return z, cls

def refine(z, cls):
    # A cluster label is the cell's dominant look, but a cliff wall that crosses a cell corner still has to block it.
    # Every colour (8x8x8 bins) learns which class it belongs to from the labelled cells, then each cell is re-read
    # pixel by pixel: enough cliff colour makes it a cliff, a 'cliff' with hardly any makes it grass, and a tree
    # crown needs to cover most of the cell before the cell counts as tree.
    cells = z['cells'].astype(int); N = len(cells); q = cells // 32; bins = (q[..., 0] * 64 + q[..., 1] * 8 + q[..., 2]).reshape(N, -1)
    names = sorted(set(cls) - {'?'}); idx = { c: k for k, c in enumerate(names) }
    P = np.ones((512, len(names))) * 0.01
    for i in range(N):
        if cls[i] == '?': continue
        P[:, idx[cls[i]]] += np.bincount(bins[i], minlength=512)
    P /= P.sum(axis=1, keepdims=True)
    out = list(cls)
    for i in range(N):
        f = P[bins[i]].mean(axis=0)
        fc = f[idx['c']] if 'c' in idx else 0; ft = f[idx['t']] if 't' in idx else 0; fw = f[idx['w']] if 'w' in idx else 0
        if cls[i] in ('g', 'v', 'c', 't', 'p'):
            if fc >= 0.34: out[i] = 'c'
            elif cls[i] == 'c' and fc < 0.18: out[i] = 'g'
            elif cls[i] == 't' and ft < 0.45: out[i] = 'g'
            elif cls[i] == 'g' and ft >= 0.6: out[i] = 't'
        if cls[i] in ('g', 'c') and fw >= 0.5: out[i] = 'w'
    return out

def refine_cave(z, cls):
    # underground the question is rock or floor: every colour learns which it belongs to from the labelled cells,
    # and a cell mostly rock-coloured is rock, mostly floor-coloured is floor, whatever its cluster said
    cells = z['cells'].astype(int); N = len(cells); q = cells // 32; bins = (q[..., 0] * 64 + q[..., 1] * 8 + q[..., 2]).reshape(N, -1)
    names = sorted(set(cls) - {'?'}); idx = { c: k for k, c in enumerate(names) }
    P = np.ones((512, len(names))) * 0.01
    for i in range(N):
        if cls[i] == '?': continue
        P[:, idx[cls[i]]] += np.bincount(bins[i], minlength=512)
    P /= P.sum(axis=1, keepdims=True)
    out = list(cls)
    for i in range(N):
        if cls[i] not in ('k', 'q', 'x'): continue
        f = P[bins[i]].mean(axis=0); fk = f[idx['k']] if 'k' in idx else 0; fq = f[idx['q']] if 'q' in idx else 0; fx = f[idx['x']] if 'x' in idx else 0
        if fq >= 0.5 and fq > fk: out[i] = 'q'
        elif fk >= 0.55 and fk > fq: out[i] = 'k'
    return out

def train(name):
    # every classified cell of this map joins the training set, replacing what this map contributed before
    z, cls = classes(name); keep = [i for i in range(len(cls)) if cls[i] != '?']
    F, L, S = z['F'][keep], np.array([cls[i] for i in keep]), np.array([name] * len(keep))
    if os.path.exists(TRAIN):
        t = np.load(TRAIN); m = t['S'] != name; F = np.vstack([t['F'][m], F]); L = np.concatenate([t['L'][m], L]); S = np.concatenate([t['S'][m], S])
    np.savez_compressed(TRAIN, F=F, L=L, S=S); print('training set', len(L), 'cells')

def fix(name, spec):
    p = os.path.join(TM, name + '_fix.json'); f = json.load(open(p)) if os.path.exists(p) else {}
    for item in spec.split():
        xy, c = item.split(':'); f[xy] = c
    json.dump(f, open(p, 'w')); print('fixes', len(f))

def emit(name):
    z, cls = classes(name); rows, cols = int(z['rows']), int(z['cols'])
    lines = [''.join(CH[cls[j * cols + i]] for i in range(cols)) for j in range(rows)]
    open(os.path.join(TM, name + '.txt'), 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
    print(sum(c == '?' for c in cls), 'unknown cells')
    # the check picture: the reference beside the same region tinted by class, 2x, with a grid
    src = str(z['src']); x0, y0, w, h = map(int, z['box']); ref = Image.open(src).convert('RGB').crop((x0, y0, x0 + w, y0 + h)).resize((w * 2, h * 2), Image.NEAREST)
    tint = ref.copy(); d = ImageDraw.Draw(tint, 'RGBA')
    for j in range(rows):
        for i in range(cols):
            c = COLOR[cls[j * cols + i]]; d.rectangle([i * 32, j * 32, i * 32 + 31, j * 32 + 31], fill=c + (150,), outline=(0, 0, 0, 60))
    out = Image.new('RGB', (w * 4 + 8, h * 2)); out.paste(ref, (0, 0)); out.paste(tint, (w * 2 + 8, 0)); out.save(os.path.join(TM, name + '_check.png'))
    train(name)

def compose(name, W, H, parts):
    # a map the ripper cut into overlapping screenshots becomes one panel: each part's class map and cells are laid
    # at its cell offset (later parts over earlier), with a stitched reference picture for the layout check
    #   python tools/tilemap.py compose bilibin 34 50 bilibin_top:0,0 bilibin_town:6,18
    txt = [[' '] * W for _ in range(H)]; cells = np.zeros((H * W, 16, 16, 3), np.uint8); ref = Image.new('RGB', (W * 16, H * 16))
    for part in parts:
        pn, off = part.split(':'); ox, oy = map(int, off.split(',')); z = load(pn); rows, cols = int(z['rows']), int(z['cols'])
        lines = [l.rstrip('\n') for l in open(os.path.join(TM, pn + '.txt')) if l.strip('\n')]
        x0, y0, w, h = map(int, z['box']); im = Image.open(str(z['src'])).convert('RGB').crop((x0, y0, x0 + w, y0 + h)); ref.paste(im, (ox * 16, oy * 16))
        for j in range(rows):
            for i in range(cols):
                if 0 <= oy + j < H and 0 <= ox + i < W: txt[oy + j][ox + i] = lines[j][i]; cells[(oy + j) * W + ox + i] = z['cells'][j * cols + i]
    open(os.path.join(TM, name + '.txt'), 'w').write('\n'.join(''.join(r) for r in txt) + '\n')
    rp = os.path.join(TM, name + '_ref.png'); ref.save(rp)
    np.savez_compressed(os.path.join(TM, name + '.npz'), cells=cells, F=features(cells.astype(np.float32)), cluster=np.zeros(H * W, int) - 1, rows=H, cols=W, box=np.array([0, 0, W * 16, H * 16]), src=np.array(rp))
    print('composed', name, W, 'x', H, 'from', len(parts), 'parts')

cmd = sys.argv[1]
if cmd == 'compose': compose(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5:])
elif cmd == 'group': group(sys.argv[2], int(sys.argv[3]), sys.argv[4:])
elif cmd == 'extract': extract(sys.argv[2], *map(int, sys.argv[3:7]), sys.argv[7], int(sys.argv[8]) if len(sys.argv) > 8 else 48)
elif cmd == 'label': label(sys.argv[2], sys.argv[3])
elif cmd == 'fix': fix(sys.argv[2], sys.argv[3])
elif cmd == 'emit': emit(sys.argv[2])
elif cmd == 'train': train(sys.argv[2])
