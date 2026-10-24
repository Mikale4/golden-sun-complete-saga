# Which items do the guides name, which are in ITEM_DB, and which can the player actually get (a chest, a shop, a
# hidden item, a monster drop, Sunshine's forge, a scripted gift)? Writes runner/item_coverage.txt.
import re, os, json, glob
R = 'C:/Games/Golden Sun/'
G2 = open(R + 'reference game mechanics/txt/guide and walkthrough gs2.txt', encoding='utf-8', errors='replace').read().split('\n')
G1 = open(R + 'reference game mechanics/txt/guide and walkthrough gs1.txt', encoding='utf-8', errors='replace').read().split('\n')

def table_names(lines, start, end):
    """item names from the appendix tables: 'Name!~*# stat stat ...' rows - the name is everything before the first
    number column (or a lone '-'), with the artifact/transfer/gender marks stripped"""
    names = {}
    for i in range(start, end):
        L = lines[i].rstrip()
        if not L or L.startswith('-') or L.startswith('Name ') or L.startswith('=') or L.startswith(' ') and not re.match(r' [A-Z]', L): continue
        m = re.match(r"^([A-Z][A-Za-z' .-]*?[A-Za-z'.])([!~*#]*)\s+(-?\d|-\s)", L)
        if not m: continue
        nm = m.group(1).strip(); marks = m.group(2)
        if nm in ('Name', 'Note', 'ATK', 'DEF', 'AGL', 'LCK', 'Crit'): continue
        names[nm] = { 'marks': marks, 'line': i + 1, 'row': L }
    return names

def section_bounds(lines, header_re, stop_re):
    out = []
    for i, L in enumerate(lines):
        if re.match(header_re, L):
            j = i + 1
            while j < len(lines) and not re.match(stop_re, lines[j]): j += 1
            out.append((L.strip(), i, j))
    return out

# gs2: the appendix tables 1.I .. 6.III
items2 = {}
for title, a, b in section_bounds(G2, r'^[1-6]\. [IVX]+ ', r'^[1-8]\. [IVX]+ |^= ') :
    # a table runs until the next table's header; the dashed rule right after the header is skipped by table_names
    for nm, info in table_names(G2, a, b).items():
        info['table'] = title; items2.setdefault(nm, info)
# the scenario/psynergy items are 'Name - description' rows without numbers: take them too
for i in range(7757, 7803):
    L = G2[i]
    m = re.match(r"^([A-Z][A-Za-z' ]+?)([!~]*)\s+(-|\d+)\s", L)
    if m: items2.setdefault(m.group(1).strip(), { 'marks': m.group(2), 'line': i + 1, 'row': L, 'table': 'scenario' })
# gs1: find its tables the same way
items1 = {}
for title, a, b in section_bounds(G1, r'^\s*[1-6]\. [IVX]+ |^[1-6]\. [IVX]+ ', r'^\s*[1-8]\. [IVX]+ |^= '):
    for nm, info in table_names(G1, a, b).items():
        info['table'] = title; items1.setdefault(nm, info)

# the game's DB
db = open(R + 'js/data/items_gen.js', encoding='utf-8').read()
DB = set(re.findall(r'^\s*"([^"]+)":\{"n"', db, re.M))
inv = open(R + 'js/game/inventory.js', encoding='utf-8').read()
DB |= set(re.findall(r"X\('([^']+)'", inv)) | set(re.findall(r'X\("([^"]+)"', inv))
for m in re.finditer(r"\['([^\]]+)'\]\.forEach|for \(const n of \[([^\]]+)\]\)", inv):
    pass
# every place the world hands an item out
code = ''
for f in glob.glob(R + 'js/**/*.js', recursive=True):
    if 'items_gen' in f: continue
    code += open(f, encoding='utf-8', errors='replace').read() + '\n'
def obtainable(nm):
    q = re.escape(nm)
    pats = [r"chest\([^)]*['\"]" + q + r"['\"]", r"E\.give\(['\"]" + q + r"['\"]", r"give\(['\"]" + q + r"['\"]", r"item: ['\"]" + q + r"['\"]", r"items: \[[^\]]*['\"]" + q + r"['\"]", r"dr:\[\"" + q + r"\"", r"['\"]" + q + r"['\"]\s*,\s*\d+\s*\]", r"inventory\.add\(['\"]" + q + r"['\"]", r"forge|FORGE"]
    where = []
    if re.search(r"chest\([^)]*['\"]" + q + r"['\"]", code): where.append('chest')
    if re.search(r"(E\.give|give|inventory\.add)\(['\"]" + q + r"['\"]", code): where.append('gift')
    if re.search(r"item: ['\"]" + q + r"['\"]", code): where.append('hidden/scoop')
    if re.search(r"items: \[[^\]]*['\"]" + q + r"['\"]", code): where.append('shop')
    if re.search(r'dr:\["' + q + '"', code): where.append('drop')
    # anything else that names it in a map, a story script or a data table (a Kit chest list, a helper) counts as placed
    if not where:
        for f in sorted(glob.glob(R + 'js/maps/*.js') + glob.glob(R + 'js/game/story*.js') + glob.glob(R + 'js/game/forge.js') + glob.glob(R + 'js/game/fountain.js') + glob.glob(R + 'js/game/travelers.js')):
            t = open(f, encoding='utf-8', errors='replace').read()
            if ("'" + nm + "'" in t) or ('"' + nm + '"' in t): where.append(os.path.basename(f)); 
    return where
forge_src = ''
for f in glob.glob(R + 'js/game/forge.js'): forge_src = open(f, encoding='utf-8').read()
def in_forge(nm): return ("'" + nm + "'" in forge_src) or ('"' + nm + '"' in forge_src)

lines = []
allnames = {}
for nm, info in items1.items(): allnames.setdefault(nm, {})['gs1'] = info
for nm, info in items2.items(): allnames.setdefault(nm, {})['gs2'] = info
missing_db, unobtainable, ok = [], [], []
for nm in sorted(allnames):
    info = allnames[nm]; marks = ''.join(v.get('marks', '') for v in info.values())
    transfer_only = '~' in (info.get('gs2', {}).get('marks', '')) and 'gs1' not in info
    dummied = any('Dummied' in v.get('row', '') for v in info.values())
    if nm not in DB:
        missing_db.append((nm, marks, dummied, ' | '.join(k + ':' + v['table'] for k, v in info.items())))
        continue
    w = obtainable(nm)
    if in_forge(nm): w.append('forge')
    if not w: unobtainable.append((nm, marks, dummied, ' | '.join(k + ':' + v['table'] for k, v in info.items())))
    else: ok.append((nm, w))
out = []
out.append('ITEM COVERAGE - %d names in the guides (gs1 %d, gs2 %d); ITEM_DB has %d' % (len(allnames), len(items1), len(items2), len(DB)))
out.append('\n== NOT IN ITEM_DB (%d) ==' % len(missing_db))
for nm, marks, dummied, t in missing_db: out.append('  %-22s %-4s %s%s' % (nm, marks, '(dummied out) ' if dummied else '', t))
out.append('\n== IN ITEM_DB BUT NOWHERE TO GET IT (%d): no chest, shop, hidden item, drop, gift or forge names it ==' % len(unobtainable))
for nm, marks, dummied, t in unobtainable: out.append('  %-22s %-4s %s%s' % (nm, marks, '(dummied out) ' if dummied else '', t))
out.append('\n== OBTAINABLE (%d) ==' % len(ok))
for nm, w in ok: out.append('  %-22s %s' % (nm, ','.join(w)))
# and the other way: DB items the guides never name
extra = sorted(n for n in DB if n not in allnames)
out.append('\n== IN ITEM_DB BUT NOT IN EITHER GUIDE TABLE (%d) ==' % len(extra))
out.append('  ' + ', '.join(extra))
open(R + 'runner/item_coverage.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('\n'.join(out[:3])); print('unobtainable:', len(unobtainable), 'missing:', len(missing_db), 'extra:', len(extra))
