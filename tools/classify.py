# Draft an ASCII layout of a reference map region by colour: each 16px tile becomes the class most of its pixels are
# nearest to. Prototypes are sampled from the region itself at the tile coordinates given (class:x,y ...), so each
# map's palette is its own. Usage:
#   python tools/classify.py <ref> x0 y0 w h out.txt "grass:2,4 cliff:1,6 water:10,14 path:6,27 roof:22,29 tree:27,4"
import sys, numpy as np
from PIL import Image
src, x0, y0, w, h, out, protos = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6], sys.argv[7]
im = np.array(Image.open(src).convert('RGB').crop((x0, y0, x0 + w, y0 + h))).astype(int)
CH = { 'grass': '.', 'cliff': '#', 'water': '~', 'path': ':', 'roof': 'R', 'tree': 'T', 'sand': 's', 'dark': 'x', 'floor': 'f', 'wall': 'W', 'snow': 'n', 'stone': 'o', 'red': 'r', 'wood': 'd' }
pal = []; names = []
for spec in protos.split():
    name, xy = spec.split(':'); tx, ty = map(int, xy.split(','))
    block = im[ty * 16:(ty + 1) * 16, tx * 16:(tx + 1) * 16].reshape(-1, 3)
    # every distinct colour in the sample block is a prototype of that class
    for c in np.unique(block, axis=0): pal.append(c); names.append(name)
pal = np.array(pal)
H, W, _ = im.shape; th, tw = H // 16, W // 16
rows = []
for j in range(th):
    row = ''
    for i in range(tw):
        b = im[j * 16:(j + 1) * 16, i * 16:(i + 1) * 16].reshape(-1, 3)
        d = ((b[:, None, :] - pal[None, :, :]) ** 2).sum(axis=2); lab = d.argmin(axis=1)
        counts = {}
        for l in lab: counts[names[l]] = counts.get(names[l], 0) + 1
        best = max(counts, key=counts.get); row += CH.get(best, '?')
    rows.append(row)
open(out, 'w').write('\n'.join(rows) + '\n'); print('\n'.join(rows))
