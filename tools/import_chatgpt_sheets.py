# Cuts the ChatGPT-drawn tile sheets in art/ into single named PNGs under assets/tiles/, using the cell -> tile-name
# map in js/data/tilesheets.js (the order each sheet was asked for). A cell whose name is a tile the game has
# replaces that tile's file; a cell the game has no tile for is written too and listed in assets/tiles/tiles.json so
# the game registers it (as a solid prop, or walk-over where the sheet said so). Big objects (32/48/64 px cells) are
# cut into 16x16 pieces named by corner (_tl _tr _bl _br) or row/column (_r0c0 ...) as the game names them.
#   python tools/import_chatgpt_sheets.py            (writes; --dry to only report)
import os, sys, re, json, subprocess
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
TILE = 16
dry = '--dry' in sys.argv
# the sheet map, straight from the game's own data file
js = ("global.ART_MODE='classic'; const fs=require('fs');"
      "eval(fs.readFileSync('js/data/tilesheets.js','utf8').replace(\"'use strict';\",'').replace('const ART_MODE','var ART_MODE').replace('const TILE_SHEETS','global.TILE_SHEETS'));"
      "process.stdout.write(JSON.stringify(TILE_SHEETS));")
sheets = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT).decode('utf-8'))
# which tile names the game draws itself (the exported originals)
have = set(f[:-4] for f in os.listdir(os.path.join(ROOT, 'assets_backup', 'tiles')) if f.endswith('.png'))
out_dir = os.path.join(ROOT, 'assets', 'tiles')
meta_path = os.path.join(out_dir, 'tiles.json')
meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
replaced, added, pieces, strips = [], [], [], {}
def save(name, im, props):
    fn = os.path.join(out_dir, name + '.png')
    if not dry: im.save(fn)
    if props: meta[name] = props
    (replaced if name in have else added).append(name)
def transparent(im):
    return any(a == 0 for a in im.getchannel('A').getdata())
for s in sheets:
    png = os.path.join(ROOT, s['png'])
    if not os.path.exists(png): print('missing', s['png']); continue
    img = Image.open(png).convert('RGBA'); cell = s.get('cell', 16); cols = img.width // cell
    alias = s.get('alias', {}); overlay = set(s.get('overlay', [])); extras = set(s.get('extras', [])); walk = set(s.get('walkOver', []))
    for k, drawn in enumerate(s['names']):
        x, y = (k % cols) * cell, (k // cols) * cell
        if y + cell > img.height: break
        name = alias.get(drawn, drawn)
        if cell == TILE:
            im = img.crop((x, y, x + TILE, y + TILE))
            m = re.match(r'^(.*)_(\d+)$', name)
            if m and m.group(1) in have:   # a frame of a tile the game animates: gathered into the tile's strip
                strips.setdefault(m.group(1), {})[int(m.group(2))] = im; continue
            props = {}
            if drawn in overlay or transparent(im): props['overlay'] = True
            if name not in have:
                base = name.rsplit('_', 1)[0]
                props.update({'kind': 'tall' if s.get('kind') == 'tall' else 'furniture', 'solid': not (name in walk or base in walk), 'new': True})
            save(name, im, props)
        else:
            n = cell // TILE
            for j in range(n):
                for i in range(n):
                    q = ('b' if j else 't') + ('r' if i else 'l') if n == 2 else 'r%dc%d' % (j, i)
                    im = img.crop((x + i * TILE, y + j * TILE, x + i * TILE + TILE, y + j * TILE + TILE))
                    pn = name + '_' + q
                    if s.get('kind') == 'tall': props = {'kind': 'tall', 'overlay': True, 'over': j == 0, 'solid': j > 0}
                    elif n == 2: props = {'kind': 'beacon_fx', 'overlay': True, 'over': True, 'solid': False}
                    else: props = {'kind': 'landmark', 'overlay': True, 'over': j == 0 and n == 4, 'solid': not (j == 0 and n == 4)}
                    if pn not in have: props['new'] = True
                    save(pn, im, props); pieces.append(pn)
for base, frames in strips.items():
    n = max(frames) + 1; strip = Image.new('RGBA', (TILE * n, TILE))
    for i in range(n): strip.paste(frames.get(i, frames[min(frames)]), (i * TILE, 0))
    save(base, strip, {})
if not dry:
    json.dump(meta, open(meta_path, 'w'), indent=0, sort_keys=True)
print('replaced %d game tiles with ChatGPT drawings: %s' % (len(replaced), ', '.join(sorted(set(replaced)))))
print('added %d new tiles (pieces of big objects: %d): %s' % (len(added), len(pieces), ', '.join(sorted(set(added) - set(pieces)))))
