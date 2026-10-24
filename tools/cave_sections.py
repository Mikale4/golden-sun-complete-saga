# Cave rips -> layout rows. Splits a rip (map references/*.webp) into its sections by connected components, then
# classes every 16 px cell of each section: '.' floor, '#' rock, 'w' water, 'o' a rock cluster on the floor, 'f' fire
# (a torch or a red label - check), ' ' void. Sub-cell sampling keeps narrow corridors open. Prints the rows to stdout
# (redirect to tools/tm/<prefix>_rows.txt) and writes tools/tm/<prefix>_sec<n>.png (the rip gridded) and
# <prefix>_sec<n>_cls.png (the classes as colours) for checking. A profile names the colour tests:
#   python tools/cave_sections.py "map references/golden-sun-altmiller-cave-gba-map.webp" alt altmiller > tools/tm/alt_rows.txt
#   python tools/cave_sections.py "map references/golden-sun-gondowan-cave-gba-map.webp" gc gondowan > tools/tm/gc_rows.txt
# Then a tools/caves/<area>_build.py turns the rows into js/maps/<area>.js with the doors, chests and carved fixes, and
# connect() joins every walkable pocket to the entry through the cheapest rock. Check reachability in the browser after.
import os, sys
import numpy as np
from PIL import Image, ImageDraw
import scipy.ndimage as nd
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sp = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools', 'tm')   # review pictures land in tools/tm
PROFILE = sys.argv[3] if len(sys.argv) > 3 else 'altmiller'
JOIN = int(sys.argv[4]) if len(sys.argv) > 4 else 2   # how far apart two pieces may sit and still be one section: rips whose arrows run over their rooms cut them, so those need more
PREFIX = sys.argv[2] if len(sys.argv) > 2 else 'alt'
im = Image.open(sys.argv[1] if len(sys.argv) > 1 else 'map references/golden-sun-altmiller-cave-gba-map.webp').convert('RGB'); A = np.array(im).astype(int)
R0, G0, B0 = A[..., 0], A[..., 1], A[..., 2]
backing = ((R0 < 110) & (G0 < 40) & (B0 > 30) & (B0 >= G0 + 20)) | ((R0 < 50) & (G0 < 60) & (B0 > 50) & (B0 < 110) & (B0 > R0 + 25))   # the rips' purple or navy backing
arrows = ((R0 > 190) & (G0 > 190) & (B0 < 90)) | ((G0 > 190) & (R0 < 150) & (B0 < 90) & (G0 > R0 + 60)) | ((R0 < 60) & (G0 > 190) & (B0 > 190)) | ((R0 > 200) & (G0 > 90) & (G0 < 190) & (B0 < 80)) | ((R0 > 200) & (G0 < 130) & (B0 > 150)) | ((R0 < 130) & (B0 > 170) & (B0 > R0 + 60) & (G0 < 205) & (G0 > 60)) | ((R0 > 215) & (G0 > 215) & (B0 > 215)) | ((R0 > 170) & (G0 > 170) & (B0 > 225) & (B0 > R0 + 25))   # the link arrows some rips draw between rooms: yellow, green, cyan, orange, pink, blue
A[nd.binary_dilation(arrows, iterations=3)] = 0   # and their soft edges, which would tie rooms together
mask = (A.sum(axis=2) > 90) & ~backing   # not black, not the backing
lab, n = nd.label(nd.binary_dilation(mask, iterations=JOIN), structure=np.ones((3, 3)))
objs = nd.find_objects(lab)
sizes = [(int((lab == i + 1).sum()), i + 1) for i in range(n)]
sizes.sort(reverse=True)
NAMES = {}
def phase(S):
    gx = np.abs(np.diff(S, axis=1)).sum(axis=2).sum(axis=0); gy = np.abs(np.diff(S, axis=0)).sum(axis=2).sum(axis=1)
    px = [gx[i::16].sum() for i in range(16)]; py = [gy[i::16].sum() for i in range(16)]
    return (int(np.argmax(px)) + 1) % 16, (int(np.argmax(py)) + 1) % 16
def classify(cell):
    r, g, b = cell[..., 0], cell[..., 1], cell[..., 2]
    black = (cell.sum(axis=2) < 90)
    blue = (b > r + 25) & (b > g)
    sand = (r > 130) & (g > 120) & (b < 160) & (r + g > 2 * b + 50)
    fire = (r > 200) & (g < 140) & (b < 90)
    grey = (abs(r - g) < 18) & (abs(g - b) < 18) & (r > 150)
    n = cell.shape[0] * cell.shape[1]
    return black.sum() / n, blue.sum() / n, sand.sum() / n, fire.sum() / n, grey.sum() / n
out = []
for k, (sz, i) in enumerate(sizes[:24]):
    sl = objs[i - 1]; y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    if sz < 5000: continue
    sub = A[y0:y1, x0:x1].copy(); sub[lab[y0:y1, x0:x1] != i] = 0
    px, py = phase(sub)
    # align: shift so that the grid starts at (px, py); pad the front so nothing is lost
    padx, pady = (16 - px) % 16, (16 - py) % 16
    S = np.zeros((sub.shape[0] + pady + 16, sub.shape[1] + padx + 16, 3), int); S[pady:pady + sub.shape[0], padx:padx + sub.shape[1]] = sub
    H, W = S.shape[0] // 16, S.shape[1] // 16
    r_, g_, b_ = S[..., 0], S[..., 1], S[..., 2]
    if PROFILE == 'gondowan':
        sandM = (g_ > r_ + 8) & (g_ > b_ + 30) & (g_ > 70)            # the mossy floor
        waterM = (b_ > 95) & (g_ > 95) & (r_ < 60) & (b_ > r_ + 50)  # the channels
    elif PROFILE == 'ruins':
        sandM = (r_ > 180) & (g_ > 185) & (b_ < 175) & (b_ > 120) & (abs(r_ - g_) < 25)   # the pale yellow-green floor (wall tops are darker green)
        waterM = (b_ > 150) & (b_ > r_ + 40) & (g_ > 100)
        siteM = (r_ > 195) & (g_ > 170) & (b_ < 165) & (r_ > g_ + 10)                  # the site's sand reads as floor too
        sandM = sandM | siteM
    elif PROFILE == 'forest':
        pathM = (r_ > 140) & (g_ > 110) & (b_ < 125) & (r_ > b_ + 40) & (r_ > g_ - 10)   # the tan path and rock
        plazaM = (b_ > 140) & (r_ > 150) & (abs(r_ - b_) < 45) & (g_ > 130)              # the lavender plaza
        sandM = pathM | plazaM
        waterM = (b_ > 150) & (b_ > r_ + 60) & (b_ > g_ + 20)
    elif PROFILE == 'plateau':
        edgeM = (r_ < 112) & (b_ >= g_) & (b_ > 50)   # the dark purple-brown rim along every terrace's drop
        grassM = (g_ > r_ + 8) & (g_ > 125) & (b_ < 135) & (r_ > 100)   # Dehkan's grass patches
        sandM = ((r_ > 122) & (g_ > 122) & (b_ < 135) & (b_ < g_ - 12) & (g_ >= r_ - 14)) | ((r_ > 118) & (g_ > 100) & (b_ < 135) & (b_ < r_ - 25) & (g_ >= r_ * 0.82))   # Dehkan's grass, and its tan floor; the faces are dark purple-brown
        waterM = np.zeros_like(sandM)
    elif PROFILE == 'lilac':
        sandM = (b_ >= 183) & (r_ >= 148) & (g_ >= r_ - 10) & (b_ >= g_ + 8)   # the pale lilac floor of Dehkan's caves (the rock is purple, g well under r)
        waterM = np.zeros_like(sandM)
    elif PROFILE == 'mosscave':
        sandM = (r_ > 128) & (g_ > 188) & (b_ < 180) & (g_ > b_ + 30)             # the pale green cave floor (the rock is teal, r < 120)
        waterM = (b_ > 200) & (g_ > 170) & (r_ < 165) & (b_ > r_ + 40)
    elif PROFILE == 'purplecave':
        sandM = (r_ > 95) & (b_ > 85) & (g_ > 80) & (r_ < 190) & (abs(r_ - b_) < 40) & (r_ >= g_)   # the mauve floor
        waterM = (b_ > 95) & (b_ > r_ + 50) & (g_ > 60)
    elif PROFILE == 'mountain':
        sandM = (r_ > 196) & (g_ > 175) & (b_ < 170) & (r_ > b_ + 40)   # the pale sand of the pass (the rock's tan stripes stay darker)
        waterM = np.zeros_like(sandM)
        grassM = (g_ > r_ + 5) & (g_ > 120) & (b_ < 120)
    elif PROFILE == 'desert':
        sandM = (r_ > 205) & (g_ > 178) & (b_ < 170)                    # the pale sand, floor and plateau alike
        waterM = np.zeros_like(sandM)
        cactusM = (g_ > r_ + 10) & (g_ > 95) & (b_ < 140)
    else:
        sandM = (r_ > 110) & (g_ > 110) & (b_ < 165) & (g_ >= b_ + 20) & (r_ + g_ > 2 * b_ + 30)
        waterM = (g_ > 175) & (b_ > 150) & (r_ < 200) & (g_ > r_ + 15) & (g_ >= b_ - 10)   # the mint pools of the sea shrine
    blackM = (S.sum(axis=2) < 90) | ((r_ < 110) & (g_ < 40) & (b_ > 30) & (b_ >= g_ + 20)) | ((r_ < 50) & (g_ < 60) & (b_ > 50) & (b_ < 110) & (b_ > r_ + 25)) | ((PROFILE == 'plateau') & (b_ > 150) & (b_ > r_ + 40))   # black, the rips' purple/navy backing, a plateau's sky
    fireM = (r_ > 200) & (g_ < 140) & (b_ < 90)
    if PROFILE == 'mountain':
        otherM = ~sandM & ~blackM & ~grassM
    elif PROFILE == 'desert':
        # the terrace faces are the only rock; cacti are their own class; label boxes count as sand so they vanish
        faceM = (r_ < 205) & (r_ > 90) & (g_ > 70) & (b_ < 90) & (r_ > b_ + 60) & ~cactusM
        otherM = faceM | cactusM
    else:
        otherM = ~sandM & ~blackM & ~waterM
    labO, nO = nd.label(otherM, structure=np.ones((3, 3)))
    areas = nd.sum(otherM, labO, index=np.arange(1, nO + 1))
    bigIds = set(int(i) + 1 for i in np.nonzero(areas >= 1400)[0])
    wallM = np.isin(labO, list(bigIds)) if bigIds else np.zeros_like(otherM)
    blobM = otherM & ~wallM
    rows = []
    for j in range(H):
        row = ''
        for ii in range(W):
            sl_ = (slice(j * 16, (j + 1) * 16), slice(ii * 16, (ii + 1) * 16))
            fw, fb, fs, fk, ff = wallM[sl_].mean(), blobM[sl_].mean(), sandM[sl_].mean(), blackM[sl_].mean(), fireM[sl_].mean()
            sub = max(sandM[j * 16 + a:j * 16 + a + 8, ii * 16 + c_:ii * 16 + c_ + 8].mean() for a in (0, 8) for c_ in (0, 8))
            fwat = waterM[sl_].mean()
            if PROFILE == 'plateau':
                fe = edgeM[sl_].mean(); fg = grassM[sl_].mean()
                if fk >= 0.6: ch = ' '
                elif fe >= 0.14: ch = '#'          # the dark rim of a terrace runs through this cell: a drop
                elif fg >= 0.5: ch = 'g'
                elif fs >= 0.3 or sub >= 0.55: ch = '.'
                elif fb >= 0.4: ch = 'o'
                else: ch = '#'
                row += ch; continue
            if PROFILE == 'lilac':
                if fk >= 0.6: ch = ' '
                elif sub >= 0.6 or fs >= 0.4: ch = '.'
                else: ch = '#'
                row += ch; continue
            if PROFILE == 'mountain':
                fg = grassM[sl_].mean()
                if fk >= 0.6: ch = ' '
                elif sub >= 0.55 or fs >= 0.3: ch = '.'
                elif fg >= 0.3: ch = 'g'
                elif fw >= 0.3: ch = '#'
                else: ch = '#'
                row += ch; continue
            if PROFILE == 'desert':
                fc = cactusM[sl_].mean(); ffc = faceM[sl_].mean()
                if fk >= 0.6: ch = ' '
                elif fc >= 0.3: ch = 'c'
                elif ffc >= 0.3: ch = '#'
                else: ch = '.'
                row += ch; continue
            if ff > 0.03: ch = 'f'
            elif fwat >= 0.45: ch = 'w'
            elif fb >= 0.42: ch = 'o'
            elif sub >= 0.55 or fs >= 0.3: ch = '.'
            elif fw >= 0.3: ch = '#'
            elif fk >= 0.6: ch = ' '
            else: ch = '#'
            row += ch
        rows.append(row)
    # trim empty rows/cols
    top = 0
    while rows and rows[0].strip() == '': rows.pop(0); top += 1
    while rows and rows[-1].strip() == '': rows.pop()
    if not rows: continue
    lead = min(len(r) - len(r.lstrip()) for r in rows); rows = [r[lead:] for r in rows]; padx -= lead * 16
    wmax = max(len(r.rstrip()) for r in rows); rows = [r[:wmax].ljust(wmax) for r in rows]
    name = f'sec{k}'; out.append((name, x0, y0, px, py, rows))
    print(f'// {name}: bbox ({x0},{y0})-({x1},{y1}) phase {px},{py} size {wmax}x{len(rows)}')
    for r in rows: print("  '" + r + "',")
    # gridded zoom of the section, 3x, with labels every 4 tiles
    crop = Image.fromarray(S.astype(np.uint8)).crop((-padx if padx < 0 else 0, 0, wmax * 16 + max(0, -padx), len(rows) * 16))
    # simpler: rebuild from S with the lead trimmed
    Sx = S[top * 16:(top + len(rows)) * 16, lead * 16:(lead + wmax) * 16]
    big = Image.fromarray(Sx.astype(np.uint8)).resize((wmax * 48, len(rows) * 48), Image.NEAREST).convert('RGBA'); ov = Image.new('RGBA', big.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            col = {'.': (255, 255, 0, 70), 'o': (255, 0, 255, 110), 'f': (255, 80, 0, 140), 'g': (0, 255, 255, 110)}.get(ch)
            if col: d.rectangle((x * 48 + 2, y * 48 + 2, x * 48 + 45, y * 48 + 45), fill=col)
    big = big.convert('RGB'); d = ImageDraw.Draw(big)
    cm = Image.new('RGB', big.size, (0, 0, 0)); dc = ImageDraw.Draw(cm)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            col = {'.': (220, 200, 120), 'o': (200, 0, 200), 'f': (255, 120, 0), 'g': (0, 200, 200), '#': (40, 60, 160), 'w': (40, 180, 220), 'c': (40, 160, 60)}.get(ch)
            if col: dc.rectangle((x * 48, y * 48, x * 48 + 47, y * 48 + 47), fill=col)
    for x in range(0, wmax + 1): dc.line([(x * 48, 0), (x * 48, len(rows) * 48)], fill=(255, 0, 0) if x % 4 == 0 else (90, 90, 90), width=1)
    for y in range(0, len(rows) + 1): dc.line([(0, y * 48), (wmax * 48, y * 48)], fill=(255, 0, 0) if y % 4 == 0 else (90, 90, 90), width=1)
    for x in range(0, wmax, 4):
        for y in range(0, len(rows), 4): dc.text((x * 48 + 2, y * 48 + 2), f'{x},{y}', fill=(255, 255, 0))
    cm.save(os.path.join(sp, f'{PREFIX}_{name}_cls.png'))
    for x in range(0, wmax + 1): d.line([(x * 48, 0), (x * 48, len(rows) * 48)], fill=(255, 0, 0) if x % 4 == 0 else (255, 255, 255), width=1)
    for y in range(0, len(rows) + 1): d.line([(0, y * 48), (wmax * 48, y * 48)], fill=(255, 0, 0) if y % 4 == 0 else (255, 255, 255), width=1)
    for x in range(0, wmax, 4):
        for y in range(0, len(rows), 4): d.text((x * 48 + 2, y * 48 + 2), f'{x},{y}', fill=(255, 255, 0))

    big.save(os.path.join(sp, f'{PREFIX}_{name}.png'))
