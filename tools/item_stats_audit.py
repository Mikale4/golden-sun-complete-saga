# The guides' equipment tables (the 'Other' column: stat bonuses, elemental power and resistance, crit/unleash rate,
# regen, cursed) against ITEM_DB's fields. Writes runner/item_stats_audit.txt and, with --fix, patches items_gen.js.
import re, sys, json
R = 'C:/Games/Golden Sun/'
G2 = open(R + 'reference game mechanics/txt/guide and walkthrough gs2.txt', encoding='utf-8', errors='replace').read().split('\n')
G1 = open(R + 'reference game mechanics/txt/guide and walkthrough gs1.txt', encoding='utf-8', errors='replace').read().split('\n')
EL = { 'Earth': 'Venus', 'Water': 'Mercury', 'Fire': 'Mars', 'Wind': 'Jupiter', 'Venus': 'Venus', 'Mercury': 'Mercury', 'Mars': 'Mars', 'Jupiter': 'Jupiter' }
ALIAS = { 'Chainmail': 'Chain Mail', 'Knight Shield': "Knight's Shield", 'Nurse Cap': "Nurse's Cap", 'Silk robe': 'Silk Robe', 'Weasel Claw': "Weasel's Claw", 'Floating Cap': 'Floating Hat', 'Meditation Wand': 'Meditation Rod', 'Xylion Mail': 'Xylion Armor', 'Oracle Robe': "Oracle's Robe", 'Silver Sword': 'Silver Blade', "Leda's Bracelet": "Leda's Bracelet", 'Muramase': 'Muramasa', 'Kunasagi': 'Kusanagi' }
def rows(lines, start, end):
    out = {}
    for i in range(start, end):
        L = lines[i].rstrip()
        m = re.match(r"^([A-Z][A-Za-z' .-]*?[A-Za-z'.])([!~*#]*)\s+((?:-?\d|-\s).*)$", L)
        if not m: continue
        nm = m.group(1).strip(); rest = m.group(3)
        if nm in ('Name', 'Note', 'ATK', 'DEF', 'AGL', 'LCK', 'Crit', 'Item', 'Regular'): continue
        out[ALIAS.get(nm, nm)] = rest
    return out
def sections(lines):
    out = []
    for i, L in enumerate(lines):
        if re.match(r'^\s*[2-6]\. [IVX]+ ', L):
            j = i + 1
            while j < len(lines) and not re.match(r'^\s*[2-8]\. [IVX]+ |^= ', lines[j]): j += 1
            out.append((L.strip(), i, j))
    return out
def parse_other(rest):
    """the numbers after the name: atk/def, value, unleash..., then the free-text bonuses"""
    b = {}
    t = rest
    for m in re.finditer(r'(?:Max )?HP \+(\d+)', t): b['hp'] = int(m.group(1))
    for m in re.finditer(r'(?:Max )?PP \+(\d+)', t): b['pp'] = int(m.group(1))
    for m in re.finditer(r'AGL \+(\d+)', t): b['agi'] = int(m.group(1))
    for m in re.finditer(r'AGL \*(0\.\d+)', t): b['agiMult'] = float(m.group(1))
    for m in re.finditer(r'LCK \+(\d+)', t): b['luck'] = int(m.group(1))
    for m in re.finditer(r'ATK \+(\d+)', t): b['atkBonus'] = int(m.group(1))
    for m in re.finditer(r'DEF \+(\d+)', t): b['defBonus'] = int(m.group(1))
    for m in re.finditer(r'Crit\.? \+(\d+)%', t): b['crit'] = int(m.group(1))
    for m in re.finditer(r'HP rec\. \+(\d+)', t): b['hpRegen'] = int(m.group(1))
    for m in re.finditer(r'PP rec\. \+(\d+)', t): b['ppRegen'] = int(m.group(1))
    # 'Earth Pow. +10', 'Fire & Wind Pow. +10', 'Earth/Water/Fire Res. +10', 'All Res. +', 'Elemental Res +'
    for m in re.finditer(r'((?:(?:Earth|Water|Fire|Wind|Venus|Mercury|Mars|Jupiter)(?:\s*[&/,]\s*)?)+)\s*(Pow|Res)\.? \+(\d+)', t):
        els = re.findall(r'Earth|Water|Fire|Wind|Venus|Mercury|Mars|Jupiter', m.group(1)); key = 'pow' if m.group(2) == 'Pow' else 'res'
        b.setdefault(key, {});
        for e in els: b[key][EL[e]] = int(m.group(3))
    for m in re.finditer(r'(?:All|Elemental|Elem\.) (Pow|Res)\.? \+(\d+)', t):
        key = 'pow' if m.group(1) == 'Pow' else 'res'; b.setdefault(key, {})
        for e in ['Venus', 'Mercury', 'Mars', 'Jupiter']: b[key][e] = int(m.group(2))
    if re.search(r'Cursed', t): b['cursed'] = True
    return b
guide = {}
for lines, tag in ((G1, 'gs1'), (G2, 'gs2')):
    for title, a, b in sections(lines):
        for nm, rest in rows(lines, a, b).items():
            bon = parse_other(rest)
            if nm in guide:
                # gs2 wins where both list it (the later game's numbers), but keep any bonus only one names
                for k, v in bon.items(): guide[nm][0].setdefault(k, v)
            else: guide[nm] = (bon, rest, title)
db_src = open(R + 'js/data/items_gen.js', encoding='utf-8').read()
DB = {}
for m in re.finditer(r'^\s*"([^"]+)":(\{.*\}),?$', db_src, re.M):
    try: DB[m.group(1)] = json.loads(m.group(2))
    except Exception as e: pass
report = []; fixes = {}
for nm, (bon, rest, title) in sorted(guide.items()):
    if nm not in DB: continue
    it = DB[nm]; diffs = []
    for k in ('hp', 'pp', 'agi', 'luck', 'crit', 'hpRegen', 'ppRegen', 'agiMult'):
        if k in bon and it.get(k) != bon[k]: diffs.append('%s: guide %s, db %s' % (k, bon[k], it.get(k))); fixes.setdefault(nm, {})[k] = bon[k]
    WEAPON = any(w in title for w in ('Weapons',))
    if 'atkBonus' in bon and not WEAPON and it.get('atk') != bon['atkBonus']: diffs.append('atk bonus: guide %s, db %s' % (bon['atkBonus'], it.get('atk'))); fixes.setdefault(nm, {})['atk'] = bon['atkBonus']
    if 'defBonus' in bon and WEAPON and it.get('def') != bon['defBonus']: diffs.append('def bonus: guide %s, db %s' % (bon['defBonus'], it.get('def'))); fixes.setdefault(nm, {})['def'] = bon['defBonus']
    for k in ('pow', 'res'):
        if k in bon:
            cur = it.get(k, {})
            if any(cur.get(e) != v for e, v in bon[k].items()): diffs.append('%s: guide %s, db %s' % (k, bon[k], cur)); fixes.setdefault(nm, {})[k] = dict(cur, **bon[k])
    if bon.get('cursed') and not it.get('cursed'): diffs.append('cursed in the guide, not in db'); fixes.setdefault(nm, {})['cursed'] = True
    if diffs: report.append('%-20s [%s] %s\n    guide row: %s' % (nm, title[:40], '; '.join(diffs), rest[:90]))
open(R + 'runner/item_stats_audit.txt', 'w', encoding='utf-8').write('ITEM STAT AUDIT: %d guide rows, %d in DB, %d differ\n\n' % (len(guide), len([n for n in guide if n in DB]), len(report)) + '\n'.join(report))
print('rows', len(guide), 'differ', len(report))
if '--fix' in sys.argv:
    s = db_src; n = len(s)
    for nm, f in fixes.items():
        m = re.search(r'^(\s*"' + re.escape(nm) + r'":\{)(.*)(\},?)$', s, re.M)
        if not m: continue
        body = m.group(2)
        for k, v in f.items():
            vs = json.dumps(v)
            if re.search(r'"' + k + r'": ', body): body = re.sub(r'"' + k + r'": (\{[^}]*\}|[^,}]+)', '"' + k + '": ' + vs, body, 1)
            else: body = body + ', "' + k + '": ' + vs
        s = s[:m.start(2)] + body + s[m.end(2):]
    open(R + 'js/data/items_gen.js', 'w', encoding='utf-8').write(s); print('patched', n, len(s), 'items:', len(fixes))
