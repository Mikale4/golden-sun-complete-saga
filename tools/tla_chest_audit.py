# The Lost Age guide's per-area 'Hidden Items' / 'Chests' / 'Djinn' lists against the map files: which items each
# area should hold, and whether the code for that area names them. Writes runner/tla_chest_audit.txt.
import re, glob, os
R = 'C:/Games/Golden Sun/'
G = open(R + 'reference game mechanics/txt/guide and walkthrough gs2.txt', encoding='utf-8', errors='replace').read().split('\n')
# guide heading -> the map files (basenames) and map-id prefixes that hold the area
AREAS = {
  'Venus Lighthouse': (['venus.js', 'story_tla.js'], ['venus']), 'Suhalla Gate': (['suhalla_gate.js'], ['suhalla_gate']), 'Gateway Cave': (['tla_dungeons.js', 'gs1_dungeons.js'], ['gateway']),
  'Idejima': (['tla_towns.js', 'story_tla.js'], ['idejima']), 'Daila': (['tla_towns.js', 'story_tla.js'], ['daila']), 'Kandorean Temple': (['kandorean.js'], ['kandorean']),
  'Shrine of the Sea God (first visit)': (['sea_god_shrine.js'], ['sea_god', 'ssg']), 'Shrine of the Sea God (second run)': (['sea_god_shrine.js'], ['sea_god', 'ssg']),
  'Dehkan Plateau': (['dehkan.js'], ['dehkan']), 'East Indra Shore': (['indra_shore.js'], ['indra_shore']), 'Indra Cavern': (['tla_dungeons.js', 'gs1_optional.js'], ['indra_cavern']),
  'Madra': (['madra.js'], ['madra']), 'Madra Catacombs': (['madra_catacombs.js'], ['madra_catacombs', 'mv_', 'mr_']), 'Osenia Cliffs': (['osenia_cliffs.js'], ['osenia_cliffs']),
  'Yampi Desert (Exterior)': (['yampi.js'], ['yampi']), 'Yampi Desert (Interior)': (['yampi.js'], ['yampi']), 'Alhafra': (['alhafra.js'], ['alhafra']), 'Eastern Alhafra': (['alhafra_east.js'], ['alhafra_east', 'alhafra_ship']),
  'Alhafran Cave (rear entrance)': (['alhafra_cave.js'], ['alhafra_cave']), 'Mikasalla': (['mikasalla.js'], ['mikasalla']), 'Osenia Cave': (['osenia_cavern.js'], ['osenia_cavern']),
  'Garoh': (['garoh.js'], ['garoh']), "Air's Rock (Exterior)": (['airs_rock.js'], ['airs_rock']), "Air's Rock (Interior)": (['airs_rock_inside.js'], ['airs_rock_in']),
  'Gondowan Cliffs': (['gondowan_cliffs.js'], ['gondowan_cliffs']), 'Naribwe': (['naribwe.js'], ['naribwe']), 'Kibombo Mountains': (['kibombo_mtns.js'], ['kibombo_mtns']), 'Kibombo': (['kibombo.js'], ['kibombo']),
  'Gabomba Statue': (['gabomba.js'], ['gabomba']), 'Lemurian Ship': (['indra_shore.js'], ['lem_']), 'Gabomba Catacombs': (['tla_dungeons.js'], ['gabomba_catacombs']), 'Yallam': (['yallam.js'], ['yallam']),
  'Taopo Swamp': (['taopo.js'], ['taopo']), 'E Tundaria Islet': (['tla_towns.js'], ['e_tundaria']), 'SE Angara Islet': (['tla_towns.js'], ['se_angara']), 'N Osenia Islet': (['tla_towns.js'], ['n_osenia']),
  'West Indra Islet': (['tla_towns.js'], ['w_indra']), 'Sea of Time Islet': (['tla_towns.js'], ['sea_of_time_islet']), 'Islet Cave': (['tla_dungeons.js'], ['islet_cave']),
  'Apojii Islands': (['apojii.js'], ['apojii']), 'Apojii Islands Cave': (['apojii.js'], ['apojii_cave']), 'Aqua Rock (Exterior)': (['aqua_rock.js', 'tla_dungeons.js'], ['aqua_rock']), 'Aqua Rock (Interior)': (['aqua_rock.js', 'tla_dungeons.js'], ['aqua_rock']),
  'Tundaria Tower': (['tla_dungeons.js', 'tundaria.js'], ['tundaria']), 'Izumo': (['tla_towns.js', 'izumo.js'], ['izumo']), 'Gaia Rock (Exterior)': (['tla_dungeons.js', 'gaia_rock.js'], ['gaia_rock']), 'Gaia Rock (Interior)': (['tla_dungeons.js', 'gaia_rock.js'], ['gaia_rock']),
  'Izumo Ruins': (['tla_dungeons.js', 'izumo.js'], ['izumo_ruins']), 'Ankohl Ruins': (['tla_dungeons.js', 'ankohl.js'], ['ankohl']), 'Champa': (['tla_towns.js', 'champa.js'], ['champa']), 'Sea of Time': (['tla_dungeons.js', 'sea_of_time.js'], ['sea_of_time']),
  'Lemuria': (['tla_towns.js', 'lemuria.js'], ['lemuria']), 'Lemuria (main city)': (['tla_towns.js', 'lemuria.js'], ['lemuria']), "Hydros' Castle": (['tla_towns.js', 'lemuria.js'], ['lemuria']), 'Ancient Lemuria': (['tla_dungeons.js', 'lemuria.js'], ['lemuria_ancient']),
  'SW Atteka Islet': (['tla_towns.js'], ['sw_atteka']), 'Kalt Island': (['tla_towns.js'], ['kalt']), 'Gondowan Settlement': (['tla_towns.js'], ['gondowan_settlement']), 'Hesperia Settlement': (['tla_towns.js'], ['hesperia']),
  'Atteka Inlet': (['tla_towns.js'], ['atteka_inlet']), 'Contigo': (['tla_towns.js', 'contigo.js'], ['contigo']), 'Shaman Village Cave': (['tla_towns.js', 'shaman.js'], ['shaman']), 'Shaman Village': (['tla_towns.js', 'shaman.js'], ['shaman']),
  'Trial Road': (['tla_dungeons.js', 'trial_road.js'], ['trial_road']), 'Jupiter Lighthouse': (['tla_dungeons.js', 'jupiter.js'], ['jupiter']), 'Jupiter Lighthouse (Entrance)': (['tla_dungeons.js', 'jupiter.js'], ['jupiter']),
  'Jupiter Lighthouse (Left Tower)': (['tla_dungeons.js', 'jupiter.js'], ['jupiter']), 'Jupiter Lighthouse (Right Tower)': (['tla_dungeons.js', 'jupiter.js'], ['jupiter']), 'Atteka Islet': (['tla_towns.js'], ['atteka_islet']),
  'Angara Cavern': (['tla_dungeons.js', 'gs1_optional.js'], ['angara_cavern']), 'Atteka Cavern': (['tla_dungeons.js'], ['atteka_cavern']), 'Magma Rock (Exterior)': (['tla_dungeons.js', 'magma_rock.js'], ['magma_rock']), 'Magma Rock (Interior)': (['tla_dungeons.js', 'magma_rock.js'], ['magma_rock']),
  'Northern Reaches': (['tla_dungeons.js'], ['northern_reaches']), 'Prox': (['tla_towns.js', 'prox.js'], ['prox']), 'Mars Lighthouse': (['tla_dungeons.js', 'mars.js'], ['mars_lh']), 'Mars Lighthouse Aerie': (['tla_dungeons.js', 'mars.js'], ['mars_lh']),
  'Treasure Island': (['tla_dungeons.js', 'treasure_isle.js'], ['treasure']), 'Yampi Desert Cave': (['tla_dungeons.js', 'yampi.js'], ['yampi_cave']), 'Yampi Desert Cave (Inner Dungeon)': (['tla_dungeons.js', 'yampi.js'], ['yampi_cave']),
  'Islet Cave (Corridor)': (['tla_dungeons.js'], ['islet_cave']), 'Anemos Inner Sanctum': (['tla_dungeons.js'], ['anemos']), 'Loho': (['tla_towns.js'], ['loho']),
}
def read_list(i):
    """items after a 'Hidden Items:' / 'Chests:' / 'Djinn:' line: the indented lines until the next label"""
    out = []; j = i + 1
    while j < len(G) and G[j].startswith(' ') and not re.match(r'^\s*(Hidden Items|Chests|Djinn|Monsters|Boss|Inn|Enemies|Summon|Stone Tablet)', G[j]):
        L = G[j].strip(); j += 1
        if not L or L.startswith('*') or L.startswith('-'): continue
        # 'Name - how' or 'Name, Name, Name'; strip the '(n)' counters and the '*' marks
        L = re.sub(r'\s*\(\d+\)\s*$', '', L)
        if ' - ' in L and ',' not in L.split(' - ')[0]: out.append((L.split(' - ')[0].strip(' *'), L.split(' - ', 1)[1].strip()))
        else:
            for part in L.split(','):
                part = part.strip(' *')
                if part: out.append((re.sub(r'\s*\(.*\)$', '', part), ''))
    return out, j
hidden = open(R + 'js/data/hidden_items.js', encoding='utf-8').read()
def src_for(files):
    t = ''
    for f in files:
        for p in glob.glob(R + 'js/**/' + f, recursive=True): t += open(p, encoding='utf-8', errors='replace').read() + '\n'
    return t
def hidden_for(prefixes):
    t = ''
    for m in re.finditer(r'^\s*([a-z_0-9]+): \[(.*)\]', hidden, re.M):
        if any(m.group(1).startswith(p) for p in prefixes): t += m.group(2) + '\n'
    return t
report = []; totals = { 'areas': 0, 'items': 0, 'missing': 0, 'extra': 0 }
# gather every heading's lists first, grouped by the files that hold the area (an area the guide visits twice is one set)
groups = {}
i = 0
while i < len(G):
    m = re.match(r'^--(.+)--$', G[i])
    if not m or m.group(1) not in AREAS: i += 1; continue
    name = m.group(1); files, prefixes = AREAS[name]
    lists = { 'Hidden Items': [], 'Chests': [], 'Djinn': [] }
    j = i + 1
    while j < len(G) and not G[j].startswith('--') and j < i + 40:
        mm = re.match(r'^\s?(Hidden Items|Chests|Djinn):', G[j])
        if mm: items, j = read_list(j); lists[mm.group(1)] += items; continue
        j += 1
    key = tuple(files)
    g = groups.setdefault(key, { 'names': [], 'prefixes': set(), 'lists': { 'Hidden Items': [], 'Chests': [], 'Djinn': [] } })
    g['names'].append(name); g['prefixes'] |= set(prefixes)
    for k in lists: g['lists'][k] += lists[k]
    i = j
for files, g in groups.items():
    src = src_for(list(files)); hid = hidden_for(list(g['prefixes'])); lines = []; totals['areas'] += 1
    want_names = []
    for kind, items in g['lists'].items():
        for nm, how in items:
            key = nm.replace('Djinni', '').strip()
            if kind == 'Djinn': key = (how or nm).split('(')[0].strip(); key = re.sub(r'^(Venus|Mercury|Mars|Jupiter)\s*(Djinni)?\s*-?\s*', '', key).strip(); how = ''
            key = re.sub(r'[*~]+$', '', key).strip()
            if not re.match(r"^[A-Z][A-Za-z' .-]{1,24}$", key) and not re.match(r'^\d+ Coins$', key): continue   # a sentence fragment, not an item
            if re.match(r'^\d+ Coins$', key): qty = key.split()[0]; found = ('qty: ' + qty) in hid or ('coins: ' + qty) in src or ('Coins', qty) in [(x, y) for x, y in re.findall(r"'(Coins)', (\d+)", src)]
            else:
                found = ("'" + key + "'" in src) or ('"' + key + '"' in src) or ("'" + key + "'" in hid) or ('"' + key + '"' in hid)
                if key in ('Tear Drop',): found = found or ("'Tear Stone'" in src)
            if kind != 'Djinn': want_names.append(key)
            totals['items'] += 1
            if not found: totals['missing'] += 1
            lines.append('   %s %-8s %-24s %s' % ('ok ' if found else 'MISSING', kind.split()[0].lower(), key, ('- ' + how) if how else ''))
    own = src_for([f for f in files if f not in ('tla_towns.js', 'tla_dungeons.js', 'story_tla.js', 'gs1_dungeons.js', 'gs1_optional.js', 'venus.js')])
    placed = [(x, y, a or b) for x, y, a, b in re.findall(r"""chest\((\d+), (\d+), (?:"([^"]+)"|'([^']+)')""", own)] + [(0, 0, a or b) for a, b in re.findall(r"""\[\d+, \d+, (?:"([^"]+)"|'([^']+)'), \d+\]""", own)]
    want = list(want_names)
    for x, y, nm in placed:
        if nm in want: want.remove(nm)
        elif nm != 'Coins': lines.append('   EXTRA   chest    %-24s at %s,%s (not in the guide)' % (nm, x, y)); totals['extra'] += 1
    stub = all(f in ('tla_towns.js', 'tla_dungeons.js') or not glob.glob(R + 'js/**/' + f, recursive=True) for f in files)
    report.append('== %s  [%s]%s' % (' / '.join(g['names']), ', '.join(files), '  (STUB AREA)' if stub else ''))
    report += lines
report.insert(0, 'TLA CHEST/HIDDEN/DJINN AUDIT: %d area groups, %d entries, %d missing, %d extra chests' % (totals['areas'], totals['items'], totals['missing'], totals['extra']))
open(R + 'runner/tla_chest_audit.txt', 'w', encoding='utf-8').write('\n'.join(report))
print(report[0])
