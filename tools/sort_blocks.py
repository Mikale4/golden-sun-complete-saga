# Cut the tile blocks ChatGPT draws from prompts/tiles_stairs_interiors.md into assets/tiles/<piece>.png.
#
#   python tools/sort_blocks.py            every block found in assets/_drop/blocks/
#   python tools/sort_blocks.py stairs     one block (by its file name without .png)
#   python tools/sort_blocks.py --sheet <image> [batch1|batch2]   all the blocks drawn on one picture, in that prompt's order
#
# A block is one picture on flat magenta: its content box is found, split evenly into the block's grid, and every
# cell shrunk to 16x16 by sampling the centre of each 16th (the drawing is asked for in crisp 8-pixel blocks, so
# nearest-neighbour keeps the edges hard). Cells named None are skipped (the floor inside a room block).
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DROP = os.path.join(ROOT, 'assets', '_drop', 'blocks'); OUT = os.path.join(ROOT, 'assets', 'tiles'); DONE = os.path.join(ROOT, 'assets', '_dropped', 'blocks')

def stair(name):
    return [(f'{name}_tl', f'{name}_tc', f'{name}_tr'), (f'{name}_ml', f'{name}_mc', f'{name}_mr'), (f'{name}_bl', f'{name}_bc', f'{name}_br')]
def single(name):
    return [(f'{name}_ts',), (f'{name}_ms',), (f'{name}_bs',)]
def room(wall):
    return [(f'{wall}_tl', f'{wall}_top', f'{wall}_top', f'{wall}_tr'), (f'{wall}_l2', wall, wall, f'{wall}_r2'), (f'{wall}_l', None, None, f'{wall}_r'), (f'{wall}_bl', f'{wall}_b', f'{wall}_b', f'{wall}_br')]
def cliff(name):   # a 3x3 plateau over a row of faces: the family of edge pieces is derived from it (see derive_cliff)
    return [(f'{name}_nw', f'{name}_n', f'{name}_ne'), (f'{name}_w', f'{name}_top', f'{name}_e'), (f'{name}_sw', f'{name}_s', f'{name}_se'), (f'{name}_face_w', f'{name}_face', f'{name}_face_e')]
def room_with(wall, floor, top=None):
    top = top or f'{wall}_top'
    return [(f'{wall}_tl', top, top, f'{wall}_tr'), (f'{wall}_l2', wall, wall, f'{wall}_r2'), (f'{wall}_l', floor, floor, f'{wall}_r'), (f'{wall}_bl', f'{wall}_b', f'{wall}_b', f'{wall}_br')]
def landmark(name, cols, rows):
    return [tuple(f'{name}_r{j}c{i}' for i in range(cols)) for j in range(rows)]
BLOCKS = {
    # ---- batch 3: prompts/tiles_batch3.md ----
    'stump_big': landmark('stump_big', 7, 11), 'stump_small': landmark('stump_small', 5, 6),
    # ---- batch 2: prompts/tiles_batch2.md ----
    'kalay_house': [('roof_slate_peak',) * 4, ('roof_slate',) * 4, ('roof_slate_edge',) * 4, ('wall_kalay', 'window_kalay', 'door_kalay', 'wall_kalay')],
    'dome': [('dome_0l', 'dome_0m', 'dome_0r'), ('dome_1l', 'dome_1m', 'dome_1r'), ('dome_2l', 'dome_2m', 'dome_2r')],
    'sandcliff': cliff('sandcliff'), 'canopy': cliff('canopy'),
    'cavewall': room_with('cavewall', 'cave', 'cavewalltop'), 'lf_wall': room_with('lf_wall', 'kt_floor', 'lf_walltop'), 'kt_wall': room_with('kt_wall', 'kt_floor', 'kt_walltop'),
    'kt_floors': [('kt_floor', 'kt_moss')],
    'rails': [('rail_nw', 'rail_h', 'rail_ne'), ('rail_v', 'cart', 'rail_v'), ('rail_sw', 'rail_h', 'rail_se')], 'rail_ends': [('rail_end_w', 'rail_end_e', 'rail_end_n')],
    'log_h': [('log_h_a', 'log_h_b', 'log_h_c')], 'log_v': [('log_v_a',), ('log_v_b',), ('log_v_c',)], 'log_float': [('log_float_h', 'log_float_v')],
    'deepwater': [('deepwater@0', 'deepwater@1')],
    'snow_rocks': [('rock_snow', 'rock_ice')],
    'fence_block': [('fence_se', 'fence_ew', 'fence_sw'), ('fence_ns', 'fence_nsew', 'fence_ns'), ('fence_ne', 'fence_ew', 'fence_nw')], 'fence_bits': [('fence_e', 'fence_w', 'fence_gate', 'fence_v')],
    'palisade': [('palisade_top', 'palisade_face', 'palisade_gate')],
    'drawgate': [('drawgate_post', 'drawgate_bar', 'drawgate_post'), ('winch', 'drawbridge_up', None)],
    'temple_pillar': [('pillar_top',), ('pillar',), ('pillar_base',)], 'temple_wall': room_with('wall_temple', 'stonefloor', 'ruins_walltop'),
    'lh_pillar': [('lh_pillar_top',), ('lh_column',), ('lh_pillar_base',)],
    'ship_bits': [('ship_deck', 'ship_rail', 'mast')],
    'wall_bark': room_with('wall_bark', 'floor_bark'),
    'treehouse': landmark('treehouse', 4, 5),
    # ---- batch 1: prompts/tiles_stairs_interiors.md ----
    'stairs': stair('stairs'), 'stairs_single': single('stairs'),
    'stairs_wood': stair('stairs_wood'), 'stairs_wood_single': single('stairs_wood'),
    'stairs_diag_r': [('stairs_diag_r_tl', 'stairs_diag_r_tc', 'stairs_diag_r_tr'), ('stairs_diag_r_ml', 'stairs_diag_r_mc', 'stairs_diag_r_mr'), ('stairs_diag_r_bl', 'stairs_diag_r_bc', 'stairs_diag_r_br')],
    'stairs_diag_l': [('stairs_diag_l_tl', 'stairs_diag_l_tc', 'stairs_diag_l_tr'), ('stairs_diag_l_ml', 'stairs_diag_l_mc', 'stairs_diag_l_mr'), ('stairs_diag_l_bl', 'stairs_diag_l_bc', 'stairs_diag_l_br')],
    'wall_in': room('wall_in'), 'wall_in_stone': room('wall_in_stone'),
    'stairs_inner': [('stairs_down', 'stairs_up')],
    'waterfall': stair('waterfall_mid'), 'waterfall_single': single('waterfall_mid'),
}
ANIMATED = ('waterfall_mid',)   # the fall's middle row rolls downward: two frames, the second shifted by half a tile

def is_magenta(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 150) & (b > 150) & (g < 120) & (r - g > 80) & (b - g > 80)

SHEET_ORDERS = {
    'batch1': ['stairs', 'stairs_single', 'stairs_wood', 'stairs_wood_single', 'stairs_diag_r', 'stairs_diag_l', 'wall_in', 'wall_in_stone', 'stairs_inner', 'waterfall', 'waterfall_single'],
    'batch3': ['stump_big', 'stump_small'],
    'batch2': ['kalay_house', 'dome', 'sandcliff', 'canopy', 'cavewall', 'lf_wall', 'kt_wall', 'kt_floors', 'rails', 'rail_ends', 'log_h', 'log_v', 'log_float', 'deepwater', 'snow_rocks', 'fence_block', 'fence_bits', 'palisade', 'drawgate', 'temple_pillar', 'temple_wall', 'lh_pillar', 'ship_bits', 'wall_bark', 'treehouse'],
}

def cut(path, grid, box=None):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    if box is not None: a = a[box[1]:box[3], box[0]:box[2]]
    content = ~is_magenta(a) & (a[..., 3] > 0)
    ys, xs = np.where(content)
    if len(ys) == 0: print('  nothing but magenta in', path); return 0
    # the content box, ignoring stray specks: rows/columns with a real run of content
    rows = np.where(content.sum(axis=1) > 8)[0]; cols = np.where(content.sum(axis=0) > 8)[0]
    y0, y1, x0, x1 = rows.min(), rows.max() + 1, cols.min(), cols.max() + 1
    nrows, ncols = len(grid), len(grid[0]); cw, ch = (x1 - x0) / ncols, (y1 - y0) / nrows
    print(f'  block {x1 - x0}x{y1 - y0} px -> cells {cw:.1f}x{ch:.1f}')
    n = 0; frames = {}; made = {}
    for j, row in enumerate(grid):
        for i, name in enumerate(row):
            if not name: continue
            tile = np.zeros((16, 16, 4), np.uint8)
            for ty in range(16):
                for tx in range(16):
                    sx = int(x0 + (i + (tx + 0.5) / 16) * cw); sy = int(y0 + (j + (ty + 0.5) / 16) * ch)
                    px = a[min(sy, a.shape[0] - 1), min(sx, a.shape[1] - 1)]
                    tile[ty, tx] = (0, 0, 0, 0) if is_magenta(px[None, None])[0, 0] else px
            if '@' in name: base, k = name.split('@'); frames.setdefault(base, []).append(tile); continue   # one frame of an animated tile
            made[name] = tile
            if name.startswith(ANIMATED) and name.endswith(('_mc', '_ml', '_mr', '_ms')):
                strip = np.concatenate([tile, np.roll(tile, 8, axis=0)], axis=1); Image.fromarray(strip).save(os.path.join(OUT, name + '.png'))
            else: Image.fromarray(tile).save(os.path.join(OUT, name + '.png'))
            n += 1
    for base, fr in frames.items(): Image.fromarray(np.concatenate(fr, axis=1)).save(os.path.join(OUT, base + '.png')); n += 1
    n += derive_cliff(made)
    return n

# a cliff family from its plateau: the pieces with two or more edges are the halves and quarters of the corner pieces
def derive_cliff(made):
    names = [k for k in made if k.endswith('_top')]
    if not names: return 0
    name = names[0][:-4]; g = lambda k: made.get(name + '_' + k)
    if not all(g(k) is not None for k in ['nw', 'n', 'ne', 'w', 'top', 'e', 'sw', 's', 'se']): return 0
    def halves_v(a, b): return np.concatenate([a[:8], b[8:]], axis=0)         # top half of a, bottom half of b
    def halves_h(a, b): return np.concatenate([a[:, :8], b[:, 8:]], axis=1)   # left half of a, right half of b
    out = { 'mid': g('top').copy(), 'ns': halves_v(g('n'), g('s')), 'ew': halves_h(g('w'), g('e')), 'nse': halves_v(g('ne'), g('se')), 'nsw': halves_v(g('nw'), g('sw')),
            'new': halves_h(g('nw'), g('ne')), 'sew': halves_h(g('sw'), g('se')), 'nsew': halves_v(halves_h(g('nw'), g('ne')), halves_h(g('sw'), g('se'))) }
    for k, t in out.items(): Image.fromarray(t).save(os.path.join(OUT, f'{name}_{k}.png'))
    return len(out)

# ChatGPT sometimes draws every block on one picture: the blocks are found as separate blobs on the magenta, read
# in rows left to right, and taken to be in the prompt's order
def sheet(path, order='batch1'):
    from scipy import ndimage
    a = np.array(Image.open(path).convert('RGBA')); content = ndimage.binary_closing(~is_magenta(a) & (a[..., 3] > 0), iterations=6)
    lab, n = ndimage.label(content); boxes = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) < 3000: continue
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    boxes.sort(key=lambda b: (b[1] // 200, b[0]))
    SHEET_ORDER = SHEET_ORDERS[order]
    print(f'{len(boxes)} blocks on the sheet' + ('' if len(boxes) == len(SHEET_ORDER) else f' - expected {len(SHEET_ORDER)}, matching the first ones in order'))
    total = 0
    for name, box in zip(SHEET_ORDER, boxes):
        print(name, box); total += cut(path, BLOCKS[name], box)
    return total

def main():
    os.makedirs(DROP, exist_ok=True); os.makedirs(DONE, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == '--sheet':
        n = sheet(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'batch1'); print(n, 'tiles written'); return
    want = sys.argv[1:]
    files = sorted(f for f in os.listdir(DROP) if f.lower().endswith('.png'))
    if not files: print('nothing in', DROP); return
    for f in files:
        key = os.path.splitext(f)[0].lower()
        if want and key not in want: continue
        if key not in BLOCKS: print('skip', f, '- not a known block (' + ', '.join(BLOCKS) + ')'); continue
        print(f)
        n = cut(os.path.join(DROP, f), BLOCKS[key])
        if n: os.replace(os.path.join(DROP, f), os.path.join(DONE, f)); print(f'  {n} tiles written, block moved to assets/_dropped/blocks/')

if __name__ == '__main__': main()
