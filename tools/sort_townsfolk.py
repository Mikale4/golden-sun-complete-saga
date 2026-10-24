# Sorts the ChatGPT townsfolk images dropped into assets/sprites/field/townsfolk/ into the game's file names: a
# portrait image is one character's 3x4 sheet; a landscape image holds six sheets side by side (one prompt file),
# each with its file name printed under it. The mapping below was read off the images by eye (tools scratch sheets);
# rerun after dropping more, adjusting MAP. Originals are moved to assets/_dropped/townsfolk/ once sorted.
import os, shutil
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'assets', 'sprites', 'field', 'townsfolk'); DONE = os.path.join(ROOT, 'assets', '_dropped', 'townsfolk')
os.makedirs(DONE, exist_ok=True)
files = sorted([f for f in os.listdir(D) if f.startswith('ChatGPT')], key=lambda f: os.path.getmtime(os.path.join(D, f)))
# index in download order -> the character(s): one name for a portrait, six for a landscape sheet (None = a duplicate to skip)
MAP = {
    0: 'villager_m_1', 1: 'villager_f_1', 2: 'villager_m_3', 3: 'villager_m_2', 4: 'villager_f_2',
    5: ['elder_m_1', 'elder_m_2', 'elder_m_3', 'elder_f_1', 'elder_f_2', 'elder_f_3'],
    6: 'child_m_1', 7: 'child_f_1', 8: 'child_m_2', 9: 'child_m_3', 10: 'child_f_2', 11: 'child_f_3',
    12: ['guard_1', 'guard_2', 'guard_3', 'merchant_1', 'merchant_2', 'merchant_3'],
    13: ['noble_1', 'noble_2', 'noble_3', 'noble_f_1', 'noble_f_2', 'noble_f_3'],
    14: ['priest_1', 'priest_2', 'priest_3', 'sailor_1', 'sailor_2', 'sailor_3'], 15: None,
    16: ['scholar_1', 'scholar_2', 'scholar_3', 'tribal_1', 'tribal_2', 'tribal_3'], 17: None,
    18: ['tribal_f_1', 'tribal_f_2', 'tribal_f_3', 'proxian_1', 'proxian_2', 'proxian_3'],
    19: ['lemurian_1', 'lemurian_2', 'lemurian_3', 'werewolf_1', 'werewolf_2', 'werewolf_3'],
    20: None, 21: ['monk_1', 'monk_2', 'monk_3', 'pirate_1', 'pirate_2', 'pirate_3'], 22: None,
}
MAG = (255, 0, 255)
def clean_border(im, m=16):
    # the panel separators (white or dark) along the edges become background; the figures never reach the edge
    px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            if x < m or x >= W - m or y < m or y >= H - m: px[x, y] = MAG
    return im
written = []
for i, f in enumerate(files):
    if i not in MAP: print('unmapped:', i, f); continue
    target = MAP[i]; src = os.path.join(D, f)
    if target is None: shutil.move(src, os.path.join(DONE, f)); continue
    im = Image.open(src).convert('RGB')
    if isinstance(target, str):
        im.save(os.path.join(D, target + '.png')); written.append(target)
    else:
        W, H = im.size; pw = W // 6
        # the four rows of figures are found by their bands, so each cell holds exactly one figure
        import numpy as np
        a = np.array(im).astype(int); key = (a[..., 0] > 150) & (a[..., 2] > 150) & (a[..., 1] < 120); wh = (a[..., 0] > 225) & (a[..., 1] > 225) & (a[..., 2] > 225)
        rs = (~key & ~wh)[:, 8:pw - 8].sum(axis=1); bands = []; inb = False
        for y, v in enumerate(rs):
            if v > 3 and not inb: start = y; inb = True
            if v <= 3 and inb: bands.append((start, y)); inb = False
        bands = [b for b in bands if b[1] - b[0] > 40][:4]
        centres = [(b0 + b1) / 2 for b0, b1 in bands]; pitch = (centres[-1] - centres[0]) / 3
        y0 = max(0, int(round(centres[0] - pitch / 2))); y1 = int(round(centres[-1] + pitch / 2))
        for k, name in enumerate(target):
            panel = im.crop((k * pw + 6, y0, (k + 1) * pw - 6, y1))   # six across; the printed name below the grid is left out
            clean_border(panel).save(os.path.join(D, name + '.png')); written.append(name)
    shutil.move(src, os.path.join(DONE, f))
print('wrote', len(written), 'sheets:', ', '.join(written))
missing = [n for n in ['villager_m', 'villager_f', 'child_m', 'child_f', 'elder_m', 'elder_f', 'guard', 'merchant', 'priest', 'sailor', 'scholar', 'tribal', 'tribal_f', 'proxian', 'lemurian', 'werewolf', 'monk', 'pirate', 'noble', 'noble_f'] for k in (1, 2, 3) if (n + '_' + str(k)) not in written]
print('still code-drawn:', ', '.join(missing) or 'none')
