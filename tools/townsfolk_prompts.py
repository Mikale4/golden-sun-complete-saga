# Writes prompts/townsfolk_01.md .. townsfolk_10.md: ChatGPT prompts for the sixty townsfolk walking sheets
# (twenty types, three variations each), each described from the exact look the game rolls for that variation
# (js/data/characters.js NPC_TYPES through npcLook), so the drawings match the people the maps place.
import os, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
js = r"""
const fs = require('fs');
eval(fs.readFileSync('js/core/util.js', 'utf8').replace("'use strict';", ''));
global.DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
eval(fs.readFileSync('js/data/characters.js', 'utf8').replace("'use strict';", '').replace('const NPC_TYPES', 'global.NPC_TYPES').replace('const NPC_LOOKS', 'global.NPC_LOOKS').replace('const CHARACTERS', 'global.CHARACTERS').replace('function npcLook', 'global.npcLook = function npcLook'));
const out = {};
for (const t of Object.keys(NPC_TYPES)) for (let seed = 1; seed <= 3; seed++) out[t + '_' + seed] = npcLook(t, seed);
process.stdout.write(JSON.stringify(out));
"""
looks = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT).decode('utf-8'))

# the nearest plain name for a colour
NAMES = {
    '#604020': 'dark brown', '#302020': 'near-black', '#c8a060': 'sandy blond', '#a06030': 'auburn', '#c04838': 'red', '#f0e070': 'pale blond', '#e04020': 'bright red',
    '#d8d8d8': 'white', '#a8a8a8': 'grey', '#202020': 'black', '#5090e0': 'sky blue', '#f08030': 'orange', '#40a0d0': 'teal blue', '#68b0e8': 'light blue', '#606060': 'dark grey', '#404040': 'charcoal',
    '#4060a0': 'blue', '#a05030': 'rust brown', '#3c8850': 'green', '#806040': 'brown', '#a08050': 'tan', '#d05080': 'rose pink', '#4090c0': 'sea blue', '#c0a040': 'mustard yellow', '#8060c0': 'violet', '#e08040': 'orange',
    '#f080a0': 'pink', '#80c0e0': 'pale blue', '#e0c040': 'yellow', '#604060': 'plum', '#405080': 'navy', '#806080': 'mauve', '#608060': 'sage green', '#806030': 'olive brown', '#c08040': 'ochre', '#a04040': 'dark red',
    '#f0f0f8': 'white', '#3060c0': 'royal blue', '#3050a0': 'deep blue', '#604080': 'purple', '#c04040': 'red', '#40a060': 'green', '#802828': 'crimson', '#603030': 'maroon', '#e8f0f8': 'white', '#3068c0': 'blue',
    '#805030': 'brown', '#7040a0': 'purple', '#c05080': 'magenta', '#605040': 'dusty brown', '#404060': 'slate blue', '#403830': 'dark brown', '#3050a0': 'deep blue', '#402818': 'dark brown', '#302030': 'charcoal', '#e08040': 'orange',
    '#f0e8d8': 'cream', '#b0b8c8': 'steel grey', '#c02020': 'red', '#e8c040': 'gold', '#f0c090': 'fair', '#f8d8b0': 'pale', '#e0b090': 'tanned', '#805030': 'dark brown', '#e0c0a0': 'pale olive', '#f0d0b0': 'fair', '#a08060': 'weathered brown',
}
def cname(hexv):
    if not hexv: return None
    if hexv in NAMES: return NAMES[hexv]
    r, g, b = int(hexv[1:3], 16), int(hexv[3:5], 16), int(hexv[5:7], 16)
    best = min(NAMES, key=lambda k: (int(k[1:3], 16) - r) ** 2 + (int(k[3:5], 16) - g) ** 2 + (int(k[5:7], 16) - b) ** 2)
    return NAMES[best]
SKIN = { '#f0c090': 'fair skin', '#f8d8b0': 'pale skin', '#e0b090': 'tanned skin', '#805030': 'dark brown skin', '#e0c0a0': 'pale olive skin', '#f0d0b0': 'fair skin', '#a08060': 'weathered brown skin' }
HAIR = { 'short': 'short hair', 'slick': 'slicked-back hair', 'spiky': 'spiky hair', 'long': 'long hair past the shoulders', 'bun': 'hair in a bun', 'bob': 'a bob cut', 'braid': 'a long braid', 'bald': 'a bald head with hair only at the sides', 'wild': 'wild shaggy hair', 'ponytail': 'a ponytail', 'mohawk': 'a mohawk' }
HAT = { 'helmet': 'a rounded steel-grey helmet', 'cap': 'a soft brown cap', 'bandana': 'a red bandana tied over the head', 'tiara': 'a small gold tiara' }
ROLE = {
    'villager_m': ('Villager (man)', 'an ordinary townsman of Vale or Kalay: a plain tunic with a belt, trousers, boots'),
    'villager_f': ('Villager (woman)', 'an ordinary townswoman: a long simple dress with an apron-front, a belt'),
    'child_m': ('Boy', 'a small boy (draw him about 2.2 heads tall, clearly shorter than an adult): a short tunic, trousers'),
    'child_f': ('Girl', 'a small girl (draw her about 2.2 heads tall): a short dress'),
    'elder_m': ('Old man', 'an elderly man, slightly stooped: a long coat over trousers, a full white beard'),
    'elder_f': ('Old woman', 'an elderly woman, slightly stooped: a long dress and shawl, hair in a bun'),
    'guard': ('Guard', 'a town guard in a padded tunic and a rounded steel helmet, a spear-less watchful stance, boots'),
    'merchant': ('Merchant', 'a shopkeeper in a vest and apron over his tunic, a soft cap'),
    'priest': ('Priest', 'a temple priest in a long white robe with a pale blue trim'),
    'sailor': ('Sailor', 'a sailor in a striped or plain shirt with rolled sleeves, blue trousers, a red bandana'),
    'scholar': ('Scholar', 'a scholar in a long blue robe with round spectacles'),
    'tribal': ('Nomad (man)', 'a plainsman of the southern tribes: a bright wrap and sash, bare arms, dark brown skin'),
    'tribal_f': ('Nomad (woman)', 'a plainswoman of the southern tribes: a bright wrapped dress, dark brown skin'),
    'proxian': ('Proxian', 'a tall northerner of Prox with faintly pointed ears and pale olive skin: a dark crimson tunic with fur at the collar, dark trousers'),
    'lemurian': ('Lemurian', 'a person of Lemuria with blue-green hair and fair skin: a pale robe or blue tunic with white trim'),
    'werewolf': ('Werewolf', 'a person of Garoh, half-turned: brownish fur on the face and arms, a snout, wild grey hair, a brown tunic'),
    'monk': ('Monk', 'a monk of Xian in an orange robe, bald, sandals'),
    'pirate': ('Pirate', 'a rough sea-raider of Champa: a red bandana, an open vest over a dark shirt, dark trousers, boots'),
    'noble': ('Noble (man)', 'a wealthy man in a fine purple coat with gold trim over matching trousers'),
    'noble_f': ('Noble (woman)', 'a fine lady in a long elegant dress, a small gold tiara'),
}
STYLE = """```
Pixel-art sprite sheet for a Game Boy Advance JRPG in the exact style of Golden Sun (2001): chibi proportions about
2.5 heads tall with a large head and short legs, 3/4 top-down overworld view, 1-pixel dark plum outline (#1A1428),
flat colours with a single darker shade for shading, no anti-aliasing, no gradients, no lighting effects, at most
16 colours for the character.

Layout: a grid of 3 columns by 4 rows of equal cells. Each cell is 128 by 192 pixels (the sprite will be shrunk to
16 by 24, so draw with big square 8-pixel blocks and keep every edge crisp). Whole image 384 by 768 pixels.
Rows, top to bottom: facing DOWN (toward the viewer), facing LEFT, facing RIGHT, facing UP (back to the viewer).
Columns, left to right: STANDING still, WALKING step A (left foot forward), WALKING step B (right foot forward).
The character stands on the same baseline near the bottom of every cell, centred horizontally, with a little empty
space on all sides. The LEFT and RIGHT rows are mirror images of each other. The UP row shows the back of the head
and clothes, no face.

Background: flat solid magenta #FF00FF everywhere outside the character. No ground shadow, no grid lines, no borders,
no text, no labels, no watermark. Nothing else in the picture.
```"""
def describe(key, look):
    t = key.rsplit('_', 1)[0]; n = key.rsplit('_', 1)[1]
    role, base = ROLE[t]
    parts = [base + '.']
    parts.append('%s, %s.' % (SKIN.get(look.get('skin'), 'fair skin').capitalize(), (cname(look.get('hair')) + ' ' + HAIR.get(look.get('hairStyle'), 'short hair')) if look.get('hairStyle') != 'bald' else 'a bald head with ' + cname(look.get('hair')) + ' hair at the sides'))
    if look.get('dress'): parts.append('The dress is %s with a %s underskirt.' % (cname(look.get('dress') or look.get('top')), cname(look.get('pants'))))
    elif look.get('robe'): parts.append('The robe is %s.' % cname(look.get('robe')))
    else: parts.append('The top is %s, the trousers %s.' % (cname(look.get('top')), cname(look.get('pants'))))
    parts.append('Boots %s.' % cname(look.get('boots') or '#402818'))
    if look.get('hat'): parts.append('Wearing ' + HAT.get(look['hat'], look['hat']) + '.')
    if look.get('beard'): parts.append('A full %s beard.' % cname(look['beard']))
    if look.get('glasses'): parts.append('Round spectacles.')
    parts.insert(0, 'an anonymous townsperson of Weyard, NOT Isaac or any Golden Sun hero (no yellow scarf, no spiky blond hair, no blue tunic unless stated below):')
    return role + ' #' + n, ' '.join(parts)
keys = list(looks.keys())
os.makedirs(os.path.join(ROOT, 'prompts'), exist_ok=True)
for f in range(10):
    chunk = keys[f * 6:(f + 1) * 6]
    lines = ['# ChatGPT prompt — townsfolk walking sheets, part %d of 10' % (f + 1), '',
             'Same sheet format as the party (3 columns × 4 rows, magenta background; see overworld_party.md). One character per',
             'image. **Start a NEW chat** (a chat that already drew Isaac keeps drawing Isaac) and **paste the text** - attaching',
             'this file does not reach the image model. Paste the style block, then one character block, as one message; ask for',
             'the next character in the next message. Save each as `assets/sprites/field/townsfolk/<file>.png` (the file name is',
             'given with each character) - the game picks it up in place of the drawn one on the next load.', '',
             '## Style block (paste first, every time)', '', STYLE, '', '## Characters', '']
    for k in chunk:
        title, desc = describe(k, looks[k])
        lines += ['### %s — save as `%s.png`' % (title, k), '```', 'Character: ' + desc, '```', '']
    open(os.path.join(ROOT, 'prompts', 'townsfolk_%02d.md' % (f + 1)), 'w', encoding='utf-8').write('\n'.join(lines))
print('wrote 10 prompt files for', len(keys), 'characters')
