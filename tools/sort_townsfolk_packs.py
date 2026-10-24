# Splits ChatGPT's six-character townsfolk packs (assets/sprites/field/townsfolk/townsfolk_NN.png: the six
# characters of prompts/townsfolk_NN.md as two rows of three walking sheets, each a 3x4 grid of figures) into one
# regular 3x4 sheet per character, named as the prompt file names them. The figures are found by their bands of
# non-magenta pixels, so labels between the rows and uneven spacing do not matter; each figure is re-set into an
# even grid so the game's loader cuts it cleanly.
import os, shutil
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'assets', 'sprites', 'field', 'townsfolk'); DONE = os.path.join(ROOT, 'assets', '_dropped', 'townsfolk'); os.makedirs(DONE, exist_ok=True)
TYPES = ['villager_m', 'villager_f', 'child_m', 'child_f', 'elder_m', 'elder_f', 'guard', 'merchant', 'priest', 'sailor', 'scholar', 'tribal', 'tribal_f', 'proxian', 'lemurian', 'werewolf', 'monk', 'pirate', 'noble', 'noble_f']
MAG = (255, 0, 255)
def bands(mask, axis, minlen, gap=1):
    # runs of the profile with content, split only by gaps of at least `gap` empty lines
    prof = mask.sum(axis=axis); out = []; inb = False; empty = 0
    for i, v in enumerate(prof):
        if v > 2:
            if not inb: start = i; inb = True
            empty = 0
        else:
            if inb:
                empty += 1
                if empty >= gap:
                    end = i - empty + 1
                    if end - start >= minlen: out.append((start, end))
                    inb = False; empty = 0
    if inb and len(prof) - start >= minlen: out.append((start, len(prof)))
    return out
def grid(fg, y0, y1, x0, x1, nr, nc):
    # the figures inside one sheet: row and column bands, the biggest gaps first, down to single-pixel gaps
    sub = fg[y0:y1, x0:x1]
    for g in (12, 6, 3, 1):
        rows = bands(sub, 1, 30, g); cols = bands(sub, 0, 20, g)
        if len(rows) == nr and len(cols) == nc: return [(y0 + a, y0 + b) for a, b in rows], [(x0 + a, x0 + b) for a, b in cols]
    # figures that touch their neighbours: the sheet is evenly laid out, so equal cells serve
    ys, xs = np.where(sub); top, bot, left, right = y0 + ys.min(), y0 + ys.max() + 1, x0 + xs.min(), x0 + xs.max() + 1
    ch = (bot - top) / nr; cw = (right - left) / nc
    return [(int(top + r * ch), int(top + (r + 1) * ch)) for r in range(nr)], [(int(left + c * cw), int(left + (c + 1) * cw)) for c in range(nc)]
written = []
for n in range(1, 11):
    f = os.path.join(D, 'townsfolk_%02d.png' % n)
    if not os.path.exists(f): continue
    im = Image.open(f).convert('RGB'); a = np.array(im).astype(int)
    key = (a[..., 0] > 150) & (a[..., 2] > 150) & (a[..., 1] < 120) & (a[..., 0] - a[..., 1] > 80) & (a[..., 2] - a[..., 1] > 80)
    mx = a.max(axis=2); mn = a.min(axis=2)
    dark = mx < 70                                                       # the black label bars
    grey = (mx - mn < 40) & (mn > 150)                                   # white and grey separator lines, and the label text
    fg = ~key & ~dark & ~grey
    # separator lines, whatever their colour, are long straight runs no figure ever makes: cleared along both axes
    def strip_lines(m, minrun=150):
        m = m.copy()
        for arr in (m, m.T):
            for i in range(arr.shape[0]):
                row = arr[i]; j = 0; n = len(row)
                while j < n:
                    if row[j]:
                        k = j
                        while k < n and row[k]: k += 1
                        if k - j >= minrun: row[j:k] = False
                        j = k
                    else: j += 1
        return m
    fg = strip_lines(fg)
    # whatever is neither a figure nor the background (lines, bars, text) becomes background in the copy that is cut
    cleaned = a.copy(); cleaned[~fg & ~key] = MAG; im = Image.fromarray(cleaned.astype(np.uint8))
    # first the six sheets (two rows of three, parted by wide gaps), then the twelve figures inside each
    srows = None
    for g in (60, 40, 25, 15):
        srows = bands(fg, 1, 100, g); scols = bands(fg, 0, 100, g)
        if len(srows) == 2 and len(scols) == 3: break
    # sheets stacked as tightly as their figures show up as eight figure rows or nine figure columns: grouped
    if len(srows) == 8: srows = [(srows[0][0], srows[3][1]), (srows[4][0], srows[7][1])]
    if len(scols) == 9: scols = [(scols[0][0], scols[2][1]), (scols[3][0], scols[5][1]), (scols[6][0], scols[8][1])]
    if not (len(srows) == 2 and len(scols) == 3): print('townsfolk_%02d: found %d sheet rows x %d sheet columns, skipped' % (n, len(srows), len(scols))); continue
    names = [t + '_' + str(k) for t in TYPES[(n - 1) * 2:(n - 1) * 2 + 2] for k in (1, 2, 3)]
    for si in range(6):
        sr, sc = si // 3, si % 3
        rows, cols = grid(fg, srows[sr][0], srows[sr][1], scols[sc][0], scols[sc][1], 4, 3)
        if rows is None: print('townsfolk_%02d: %s: figures not on a 3x4 grid, skipped' % (n, names[si])); continue
        cells = []
        for r in range(4):
            for c in range(3):
                ry = rows[r]; cx = cols[c]
                sub = fg[ry[0]:ry[1], cx[0]:cx[1]]; ys, xs = np.where(sub)
                if not len(xs): cells.append(None); continue
                box = (cx[0] + xs.min(), ry[0] + ys.min(), cx[0] + xs.max() + 1, ry[0] + ys.max() + 1); cells.append(box)
        cw = max(b[2] - b[0] for b in cells if b) + 16; ch = max(b[3] - b[1] for b in cells if b) + 16
        sheet = Image.new('RGB', (cw * 3, ch * 4), MAG)
        for i, box in enumerate(cells):
            if not box: continue
            fig = im.crop(box); r, c = i // 3, i % 3
            sheet.paste(fig, (c * cw + (cw - fig.width) // 2, r * ch + ch - 8 - fig.height))   # centred, feet on a common line
        sheet.save(os.path.join(D, names[si] + '.png')); written.append(names[si])
    shutil.move(f, os.path.join(DONE, 'remake_' + os.path.basename(f)))
print('wrote', len(written), 'sheets:', ', '.join(written))
