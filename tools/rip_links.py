# The links a rip draws between its rooms. Some of the Lost Age rips (Shrine of the Sea God, the temples) join their
# sections with coloured arrows: yellow, green or cyan lines whose ends touch the rooms they connect. This finds every
# such line, the two places it touches a room, and which section and cell (in that section's own grid, as
# tools/cave_sections.py numbers them) each end lands on. Prints JSON: [{a: {sec, x, y}, b: {sec, x, y}, colour}].
#   python tools/rip_links.py "map references/<rip>.webp" <prefix>
# The prefix names the tools/tm/<prefix>_rows.txt written by cave_sections.py, whose section bboxes and phases place
# the cells. An end that touches no section is reported with sec -1 (an arrow into the sky, or a mouth in the backing).
import os, sys, re, json
import numpy as np
from PIL import Image
import scipy.ndimage as nd
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
path, prefix = sys.argv[1], sys.argv[2]
A = np.array(Image.open(path).convert('RGB')).astype(int)
R, G, B = A[..., 0], A[..., 1], A[..., 2]
COLOURS = {
    'yellow': (R > 170) & (G > 170) & (B < 110) & (abs(R - G) < 70),
    'green': (G > 170) & (G > R + 40) & (G > B + 100),
    'cyan': (R < 80) & (G > 170) & (B > 170),
    'orange': (R > 200) & (G > 90) & (G < 190) & (B < 80),
    'pink': (R > 200) & (G < 130) & (B > 150),
    'blue': (R < 130) & (B > 170) & (B > R + 60) & (G < 205) & (G > 60),
    'white': (R > 215) & (G > 215) & (B > 215),
    'pale': (R > 170) & (G > 170) & (B > 225) & (B > R + 25),
}
backing = (A.sum(axis=2) < 90) | ((R < 110) & (G < 40) & (B > 30) & (B >= G + 20)) | ((R < 50) & (G < 60) & (B > 50) & (B < 110) & (B > R + 25))
arrows = np.zeros(R.shape, bool)
for m in COLOURS.values(): arrows |= m
rooms = ~backing & ~nd.binary_dilation(arrows, iterations=2)
# the sections, as cave_sections.py found them
secs = []
for line in open(os.path.join('tools', 'tm', prefix + '_rows.txt')):
    m = re.match(r'// (sec\d+): bbox \((\d+),(\d+)\)-\((\d+),(\d+)\) phase (\d+),(\d+)', line)
    if m: secs.append((m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4)), int(m.group(5)), int(m.group(6)), int(m.group(7))))
def locate(px, py):
    best = None
    for name, x0, y0, x1, y1, phx, phy in secs:
        d = max(x0 - px, px - x1 + 1, y0 - py, py - y1 + 1, 0)
        if best is None or d < best[0]: best = (d, name, x0, y0, x1, y1, phx, phy)
    if best and best[0] <= 40:
        d, name, x0, y0, x1, y1, phx, phy = best
        if True:
            # cave_sections pads the crop so its grid starts at the phase, then trims empty leading rows/cols; the
            # trim is not recorded, so cells here are relative to the padded grid (fix by eye if a section was trimmed)
            padx, pady = (16 - phx) % 16, (16 - phy) % 16
            return { 'sec': name, 'x': (px - x0 + padx) // 16, 'y': (py - y0 + pady) // 16 }
    return { 'sec': -1, 'x': px // 16, 'y': py // 16 }
links = []
for colour, m in COLOURS.items():
    lab, n = nd.label(nd.binary_dilation(m, iterations=1), structure=np.ones((3, 3)))
    for i in range(1, n + 1):
        comp = lab == i
        cnt = int(comp.sum())
        if cnt < 60: continue
        ys, xs = np.nonzero(comp); bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if max(bw, bh) < 60 or cnt / float(bw * bh) > 0.35: continue   # a line, not a blob of foliage
        # where the line touches a room: line pixels with room pixels within 4 px
        near = nd.binary_dilation(comp, iterations=4) & rooms
        if not near.any(): continue
        clab, cn = nd.label(near, structure=np.ones((3, 3)))
        ends = []
        for j in range(1, cn + 1):
            ys, xs = np.nonzero(clab == j)
            if len(xs) < 4: continue
            ends.append((int(xs.mean()), int(ys.mean()), len(xs)))
        if len(ends) < 2: continue
        # the two contact patches farthest apart are the line's ends (a line may brush past a third room)
        best = None
        for p in ends:
            for q in ends:
                d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
                if best is None or d > best[0]: best = (d, p, q)
        (ax, ay, _), (bx, by, _) = best[1], best[2]
        links.append({ 'colour': colour, 'a': dict(locate(ax, ay), px=ax, py=ay), 'b': dict(locate(bx, by), px=bx, py=by) })
print(json.dumps(links, indent=1))
