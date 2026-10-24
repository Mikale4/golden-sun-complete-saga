// ---------- Class system (Golden Sun / The Lost Age rules) ----------
'use strict';
// Each class: mult [hp,pp,atk,def,agi,lck] in %, req [E,W,F,A] minimum element levels, group (learnset chain), tier index in group
const CLASSES = {};
function defClass(name, mult, req, group, tier) { CLASSES[name] = { name, mult, req, group, tier }; }
const C = defClass;
// BASIC ELEMENT CLASSES
C('Squire', [110, 80, 110, 100, 110, 100], [5, 0, 0, 0], 'squire', 0); C('Knight', [130, 90, 120, 110, 120, 100], [7, 0, 0, 0], 'squire', 1); C('Gallant', [150, 100, 130, 120, 130, 100], [9, 0, 0, 0], 'squire', 2); C('Lord', [170, 110, 140, 130, 140, 100], [11, 0, 0, 0], 'squire', 3); C('Slayer', [190, 120, 150, 140, 150, 100], [13, 0, 0, 0], 'squire', 4);
C('Water Seer', [90, 130, 90, 100, 80, 130], [0, 5, 0, 0], 'waterseer', 0); C('Scribe', [100, 140, 100, 110, 90, 130], [0, 7, 0, 0], 'waterseer', 1); C('Cleric', [120, 150, 110, 120, 100, 130], [0, 9, 0, 0], 'waterseer', 2); C('Paragon', [140, 160, 120, 130, 110, 130], [0, 11, 0, 0], 'waterseer', 3); C('Angel', [160, 170, 130, 140, 120, 130], [0, 13, 0, 0], 'waterseer', 4);
C('Guard', [110, 80, 100, 110, 70, 100], [0, 0, 5, 0], 'guard', 0); C('Soldier', [130, 90, 110, 120, 80, 100], [0, 0, 7, 0], 'guard', 1); C('Warrior', [150, 100, 120, 130, 90, 100], [0, 0, 9, 0], 'guard', 2); C('Champion', [170, 110, 130, 140, 100, 100], [0, 0, 11, 0], 'guard', 3); C('Hero', [190, 120, 140, 150, 110, 100], [0, 0, 13, 0], 'guard', 4);
C('Wind Seer', [80, 140, 80, 90, 130, 110], [0, 0, 0, 5], 'windseer', 0); C('Magician', [90, 150, 90, 100, 140, 110], [0, 0, 0, 7], 'windseer', 1); C('Mage', [110, 160, 100, 110, 150, 110], [0, 0, 0, 9], 'windseer', 2); C('Magister', [130, 170, 110, 120, 160, 110], [0, 0, 0, 11], 'windseer', 3); C('Sorcerer', [150, 180, 120, 130, 170, 110], [0, 0, 0, 13], 'windseer', 4);
// LOST AGE NEW (Piers, Jenna)
C('Mariner', [110, 90, 100, 100, 90, 120], [0, 5, 0, 0], 'mariner', 0); C('Privateer', [130, 100, 110, 110, 100, 120], [0, 7, 0, 0], 'mariner', 1); C('Commander', [150, 110, 120, 110, 110, 120], [0, 9, 0, 0], 'mariner', 2); C('Captain', [170, 120, 130, 120, 120, 120], [0, 11, 0, 0], 'mariner', 3); C('Admiral', [190, 130, 140, 130, 130, 120], [0, 13, 0, 0], 'mariner', 4);
C('Flame User', [100, 120, 100, 100, 120, 90], [0, 0, 5, 0], 'flameuser', 0); C('Witch', [110, 130, 110, 110, 130, 90], [0, 0, 7, 0], 'flameuser', 1); C('Hex', [130, 140, 120, 120, 140, 90], [0, 0, 9, 0], 'flameuser', 2); C('Fire Master', [150, 150, 130, 130, 150, 90], [0, 0, 11, 0], 'flameuser', 3); C('Justice', [170, 160, 140, 140, 160, 90], [0, 0, 13, 0], 'flameuser', 4);
// WATER ALIGNED
C('Swordsman (E)', [100, 90, 110, 110, 90, 120], [5, 0, 0, 0], 'swordsmanE', 0); C('Defender (E)', [120, 100, 120, 120, 100, 120], [5, 2, 0, 0], 'swordsmanE', 1); C('Cavalier (E)', [140, 110, 130, 130, 110, 120], [5, 4, 0, 0], 'swordsmanE', 2); C('Guardian', [170, 130, 140, 140, 130, 120], [6, 6, 0, 0], 'swordsmanE', 3); C('Protector', [190, 140, 150, 150, 140, 120], [7, 7, 0, 0], 'swordsmanE', 4);
C('Swordsman (F)', [100, 90, 110, 110, 90, 120], [0, 0, 5, 0], 'swordsmanF', 0); C('Defender (F)', [120, 100, 120, 120, 100, 120], [0, 2, 5, 0], 'swordsmanF', 1); C('Cavalier (F)', [140, 110, 130, 130, 110, 120], [0, 4, 5, 0], 'swordsmanF', 2); C('Luminier', [170, 120, 140, 140, 130, 120], [0, 6, 6, 0], 'swordsmanF', 3); C('Radiant', [190, 140, 150, 150, 140, 120], [0, 7, 7, 0], 'swordsmanF', 4);
C('Dragoon', [160, 130, 140, 140, 110, 130], [3, 3, 3, 0], 'dragoon', 0); C('Templar', [180, 140, 150, 150, 120, 130], [4, 4, 4, 0], 'dragoon', 1); C('Paladin', [200, 150, 160, 160, 130, 130], [4, 5, 4, 0], 'dragoon', 2);
// WIND ALIGNED
C('Apprentice', [100, 120, 110, 100, 120, 90], [5, 0, 0, 0], 'apprentice', 0); C('Illusionist (E)', [120, 130, 120, 110, 130, 90], [5, 0, 0, 2], 'apprentice', 1); C('Enchanter (E)', [140, 140, 130, 120, 140, 90], [5, 0, 0, 4], 'apprentice', 2); C('Conjurer (E)', [170, 160, 140, 130, 160, 90], [6, 0, 0, 6], 'apprentice', 3); C('War Adept (E)', [190, 170, 150, 140, 170, 90], [7, 0, 0, 7], 'apprentice', 4);
C('Page', [100, 120, 110, 100, 120, 90], [0, 0, 5, 0], 'page', 0); C('Illusionist (F)', [120, 130, 120, 110, 130, 90], [0, 0, 5, 2], 'page', 1); C('Enchanter (F)', [140, 140, 130, 120, 140, 90], [0, 0, 5, 4], 'page', 2); C('Conjurer (F)', [170, 160, 140, 130, 160, 90], [0, 0, 6, 6], 'page', 3); C('War Adept (F)', [190, 170, 150, 140, 170, 90], [0, 0, 7, 7], 'page', 4);
C('Ninja', [160, 140, 150, 120, 170, 80], [3, 0, 3, 3], 'ninja', 0); C('Disciple', [180, 150, 160, 130, 180, 80], [4, 0, 4, 4], 'ninja', 1); C('Master', [200, 160, 170, 140, 190, 80], [4, 0, 4, 5], 'ninja', 2);
// EARTH ALIGNED
C('Seer (W)', [90, 130, 90, 90, 110, 100], [0, 5, 0, 0], 'seerW', 0); C('Diviner (W)', [110, 140, 100, 100, 120, 100], [2, 5, 0, 0], 'seerW', 1); C('Shaman (W)', [120, 150, 110, 110, 130, 100], [4, 5, 0, 0], 'seerW', 2); C('Druid (W)', [150, 170, 130, 130, 150, 100], [6, 6, 0, 0], 'seerW', 3); C('Oracle (W)', [170, 180, 140, 140, 160, 100], [7, 7, 0, 0], 'seerW', 4);
C('Seer (A)', [90, 130, 90, 90, 110, 100], [0, 0, 0, 5], 'seerA', 0); C('Diviner (A)', [110, 140, 100, 100, 120, 100], [2, 0, 0, 5], 'seerA', 1); C('Shaman (A)', [120, 150, 110, 110, 130, 100], [4, 0, 0, 5], 'seerA', 2); C('Druid (A)', [150, 170, 130, 130, 150, 100], [6, 0, 0, 6], 'seerA', 3); C('Oracle (A)', [170, 180, 140, 140, 160, 100], [7, 0, 0, 7], 'seerA', 4);
C('Medium', [130, 170, 120, 120, 150, 90], [3, 3, 0, 3], 'medium', 0); C('Conjurer (D)', [150, 180, 130, 130, 160, 90], [4, 4, 0, 4], 'medium', 1); C('Dark Mage (D)', [170, 190, 140, 140, 170, 90], [5, 4, 0, 4], 'medium', 2);
// FIRE ALIGNED
C('Pilgrim (W)', [90, 120, 90, 100, 120, 120], [0, 5, 0, 0], 'pilgrimW', 0); C('Wanderer (W)', [110, 130, 100, 110, 130, 120], [0, 5, 2, 0], 'pilgrimW', 1); C('Ascetic (W)', [120, 140, 110, 120, 140, 120], [0, 5, 4, 0], 'pilgrimW', 2); C('Water Monk', [150, 160, 130, 140, 160, 120], [0, 6, 6, 0], 'pilgrimW', 3); C('Guru (W)', [170, 170, 140, 150, 170, 120], [0, 7, 7, 0], 'pilgrimW', 4);
C('Pilgrim (A)', [90, 120, 90, 100, 120, 120], [0, 0, 0, 5], 'pilgrimA', 0); C('Wanderer (A)', [110, 130, 100, 110, 130, 120], [0, 0, 2, 5], 'pilgrimA', 1); C('Ascetic (A)', [120, 140, 110, 120, 140, 120], [0, 0, 4, 5], 'pilgrimA', 2); C('Fire Monk', [150, 160, 130, 140, 160, 120], [0, 0, 6, 6], 'pilgrimA', 3); C('Guru (A)', [170, 170, 140, 150, 170, 120], [0, 0, 7, 7], 'pilgrimA', 4);
C('Ranger', [130, 160, 120, 120, 160, 120], [0, 3, 3, 3], 'ranger', 0); C('Bard', [150, 170, 130, 130, 170, 120], [0, 4, 4, 4], 'ranger', 1); C('Warlock', [170, 180, 140, 140, 180, 120], [0, 4, 5, 4], 'ranger', 2);
// EARTH/FIRE
C('Brute', [100, 70, 120, 90, 110, 70], [1, 0, 1, 0], 'brute', 0); C('Ruffian', [120, 80, 130, 100, 120, 70], [2, 0, 2, 0], 'brute', 1); C('Savage', [140, 90, 140, 110, 130, 70], [4, 0, 4, 0], 'brute', 2); C('Barbarian', [160, 100, 150, 120, 140, 70], [5, 0, 5, 0], 'brute', 3); C('Berserker', [180, 110, 160, 130, 150, 70], [6, 0, 6, 0], 'brute', 4); C('Chaos Lord', [200, 120, 170, 140, 160, 70], [7, 0, 7, 0], 'brute', 5);
C('Samurai', [190, 130, 150, 140, 140, 90], [4, 0, 4, 3], 'samurai', 0); C('Ronin', [210, 140, 160, 150, 150, 90], [5, 0, 5, 4], 'samurai', 1);
// WATER/WIND
C('Hermit', [80, 140, 80, 90, 130, 120], [0, 1, 0, 1], 'hermit', 0); C('Elder', [90, 150, 90, 100, 140, 120], [0, 2, 0, 2], 'hermit', 1); C('Scholar', [110, 160, 100, 110, 150, 120], [0, 4, 0, 4], 'hermit', 2); C('Savant', [130, 170, 110, 120, 160, 120], [0, 5, 0, 5], 'hermit', 3); C('Sage', [150, 180, 120, 130, 170, 120], [0, 6, 0, 6], 'hermit', 4); C('Wizard', [170, 190, 130, 140, 180, 120], [0, 7, 0, 7], 'hermit', 5);
C('White Mage', [150, 180, 130, 130, 150, 130], [3, 4, 0, 4], 'whitemage', 0); C('Pure Mage', [170, 190, 140, 140, 160, 130], [4, 5, 0, 5], 'whitemage', 1);
// ITEM CLASSES
C('Pierrot', [100, 80, 100, 110, 130, 120], [0, 0, 0, 0], 'pierrot', 0); C('Harlequin', [130, 100, 110, 120, 140, 120], [1, 1, 1, 1], 'pierrot', 1); C('Punchinello', [160, 110, 130, 130, 150, 120], [2, 2, 2, 2], 'pierrot', 2); C('Acrobat', [160, 110, 130, 130, 150, 120], [3, 3, 3, 3], 'pierrot', 3);
C('Tamer', [80, 140, 80, 90, 140, 90], [0, 0, 0, 0], 'tamer', 0); C('Trainer', [100, 160, 100, 110, 150, 90], [1, 1, 1, 1], 'tamer', 1); C('Beastkeeper', [130, 170, 120, 120, 160, 90], [2, 2, 2, 2], 'tamer', 2); C('Beast Lord', [160, 190, 130, 130, 170, 90], [3, 3, 3, 3], 'tamer', 3);
C('Dark Mage', [80, 140, 80, 90, 140, 90], [0, 0, 0, 0], 'darkmage', 0); C('Crypt Lord', [100, 160, 100, 110, 150, 90], [1, 1, 1, 1], 'darkmage', 1); C('Necrolyte', [130, 170, 120, 120, 160, 90], [2, 2, 2, 2], 'darkmage', 2); C('Necromage', [160, 190, 130, 130, 170, 90], [3, 3, 3, 3], 'darkmage', 3);

// Tables in priority order (lowest listed = highest priority when requirements are met)
const CLASS_TABLES = {
  basicE: ['Squire', 'Knight', 'Gallant', 'Lord', 'Slayer'], basicW: ['Water Seer', 'Scribe', 'Cleric', 'Paragon', 'Angel'],
  basicF: ['Guard', 'Soldier', 'Warrior', 'Champion', 'Hero'], basicA: ['Wind Seer', 'Magician', 'Mage', 'Magister', 'Sorcerer'],
  mariner: ['Mariner', 'Privateer', 'Commander', 'Captain', 'Admiral'], flameuser: ['Flame User', 'Witch', 'Hex', 'Fire Master', 'Justice'],
  water: ['Swordsman (E)', 'Defender (E)', 'Cavalier (E)', 'Guardian', 'Protector', 'Swordsman (F)', 'Defender (F)', 'Cavalier (F)', 'Luminier', 'Radiant', 'Dragoon', 'Templar', 'Paladin'],
  wind: ['Apprentice', 'Illusionist (E)', 'Enchanter (E)', 'Conjurer (E)', 'War Adept (E)', 'Page', 'Illusionist (F)', 'Enchanter (F)', 'Conjurer (F)', 'War Adept (F)', 'Ninja', 'Disciple', 'Master'],
  earth: ['Seer (W)', 'Diviner (W)', 'Shaman (W)', 'Druid (W)', 'Oracle (W)', 'Seer (A)', 'Diviner (A)', 'Shaman (A)', 'Druid (A)', 'Oracle (A)', 'Medium', 'Conjurer (D)', 'Dark Mage (D)'],
  fire: ['Pilgrim (W)', 'Wanderer (W)', 'Ascetic (W)', 'Water Monk', 'Guru (W)', 'Pilgrim (A)', 'Wanderer (A)', 'Ascetic (A)', 'Fire Monk', 'Guru (A)', 'Ranger', 'Bard', 'Warlock'],
  earthfire: ['Brute', 'Ruffian', 'Savage', 'Barbarian', 'Berserker', 'Chaos Lord', 'Samurai', 'Ronin'],
  waterwind: ['Hermit', 'Elder', 'Scholar', 'Savant', 'Sage', 'Wizard', 'White Mage', 'Pure Mage'],
  alchemist: ['Lorekeeper', 'Philosopher', 'Alchemist', 'Grand Alchemist'],
  pierrot: ['Pierrot', 'Harlequin', 'Punchinello', 'Acrobat'], tamer: ['Tamer', 'Trainer', 'Beastkeeper', 'Beast Lord'], darkmage: ['Dark Mage', 'Crypt Lord', 'Necrolyte', 'Necromage']
};
// Kraden's own line. He has no elemental specialism, so what he carries only ever deepens the same craft: any Djinn
// at all, of any element, move him along it.
C('Lorekeeper', [95, 150, 90, 110, 95, 140], [0, 0, 0, 0], 'alchemist', 0);
C('Philosopher', [105, 165, 100, 120, 105, 145], [0, 0, 0, 0], 'alchemist', 1);
C('Alchemist', [120, 180, 110, 130, 115, 150], [0, 0, 0, 0], 'alchemist', 2);
C('Grand Alchemist', [135, 200, 120, 140, 125, 160], [0, 0, 0, 0], 'alchemist', 3);

// Element relationships. index: 0 Venus(E) 1 Mercury(W) 2 Mars(F) 3 Jupiter(A). [primary, neutral, weakness, affinity]
const EL_RELATION = { 0: [0, 1, 3, 2], 1: [1, 0, 2, 3], 2: [2, 3, 1, 0], 3: [3, 2, 0, 1] };
// req order in CLASSES is [E,W,F,A] which maps to element index [0,1,2,3] directly.
function classMeets(cls, lv) { const r = cls.req; return lv[0] >= r[0] && lv[1] >= r[1] && lv[2] >= r[2] && lv[3] >= r[3]; }
function pickFromTable(table, lv) { let best = null; for (const n of table) { const c = CLASSES[n]; if (classMeets(c, lv)) best = c; } return best; }
// Determine class name. charEl: primary element idx; lv: element levels [E,W,F,A]; opts: {isJenna,isPiers,classItem}
function determineClass(charEl, lv, opts) {
  opts = opts || {};
  // the scholar answers to no element in particular: it is the number of Djinn he studies that moves him along
  if (opts.isKraden && !opts.classItem) {
    const t = CLASS_TABLES.alchemist;
    const total = lv.reduce((a, b) => a + b, 0) - 5;
    return t[total >= 9 ? 3 : total >= 6 ? 2 : total >= 3 ? 1 : 0];
  }
  // a book class climbs its tiers on the Djinn of the OTHER three elements (1, 2, 3 of each); the wearer's own element does not count either way
  if (opts.classItem) { const t = CLASS_TABLES[opts.classItem] || CLASS_TABLES.pierrot; const c = pickFromTable(t, lv.map((v, i) => i === charEl ? 99 : v)); return c ? c.name : t[0]; }
  const rel = EL_RELATION[charEl];
  const nonPrimary = [0, 1, 2, 3].filter(e => e !== charEl).some(e => lv[e] > 0);
  if (!nonPrimary) {
    const table = opts.isPiers ? CLASS_TABLES.mariner : opts.isJenna ? CLASS_TABLES.flameuser : CLASS_TABLES['basic' + 'EWFA'[charEl]];
    return pickFromTable(table, lv).name;
  }
  // dominance ordering: sort elements by level desc, ties broken by rel order
  const order = [0, 1, 2, 3].sort((a, b) => (lv[b] - lv[a]) || (rel.indexOf(a) - rel.indexOf(b)));
  const first = order[0], second = order[1], affinity = rel[3];
  let table;
  if (first === affinity || second === affinity) table = (charEl === 0 || charEl === 2) ? CLASS_TABLES.earthfire : CLASS_TABLES.waterwind;
  else { const alignEl = second === charEl ? first : second; table = CLASS_TABLES[['earth', 'water', 'fire', 'wind'][alignEl]]; }
  const c = pickFromTable(table, lv);
  if (c) return c.name;
  // fallback to basic
  const basic = opts.isPiers ? CLASS_TABLES.mariner : opts.isJenna ? CLASS_TABLES.flameuser : CLASS_TABLES['basic' + 'EWFA'[charEl]];
  return pickFromTable(basic, lv).name;
}

// ---- Learnsets: group -> tiers -> {learn:{lvl:[psy]}, up:{old:new}} ----
const LEARN = {};
function L(group, tiers) { LEARN[group] = tiers.map(t => ({ learn: t.l || {}, up: t.u || {} })); }
const lv = (s) => { const o = {}; for (const part of s.split(',')) { const [l, n] = part.trim().split(':'); const k = parseInt(l); (o[k] = o[k] || []).push(n); } return o; };
L('squire', [{ l: lv('1:Cure,2:Quake,4:Earthquake,6:Spire,10:Cure Well,13:Ragnarok,14:Quake Sphere,20:Clay Spire,26:Potent Cure,42:Stone Spire') }, {}, { l: lv('7:Gaia,19:Revive,24:Mother Gaia,50:Grand Gaia') }, { u: { 'Ragnarok': 'Odyssey' } }, {}]);
L('guard', [{ l: lv('1:Flare,4:Fire,6:Flare Wall,8:Volcano,12:Heat Wave,14:Fireball,18:Flare Storm,22:Eruption,36:Inferno,48:Pyroclasm') }, {}, { l: lv('3:Guard,9:Impair,15:Protect,26:Debilitate') }, { u: { 'Heat Wave': 'Liquifier' } }, {}]);
L('windseer', [{ l: lv('1:Whirlwind,4:Ray,8:Plasma,12:Sleep,14:Storm Ray,17:Bind,18:Tornado,26:Shine Plasma,36:Destruct Ray,44:Tempest,50:Spark Plasma') }, { l: lv('5:Impact,21:High Impact') }, { l: lv('6:Ward,22:Resist') }, {}, {}]);
L('waterseer', [{ l: lv('1:Ply,2:Frost,4:Ice,5:Cure Poison,9:Tundra,13:Restore,16:Ply Well,17:Ice Horn,24:Glacier,30:Break,34:Pure Ply,42:Ice Missile') }, {}, { l: lv('8:Wish,22:Wish Well,46:Pure Wish') }, {}, {}]);
L('flameuser', [{ l: lv('1:Flare,5:Fume,6:Flare Wall,7:Beam,10:Impair,18:Flare Storm,21:Cycle Beam,23:Debilitate,26:Serpent Fume,41:Searing Beam,47:Dragon Fume') }, {}, { l: lv('9:Aura,16:Healing Aura,33:Cool Aura') }, {}, {}]);
L('mariner', [{ l: lv('1:Frost,2:Ply,4:Cool,5:Cure Poison,8:Tundra,12:Diamond Dust,13:Restore,17:Ply Well,21:Supercool,24:Glacier,30:Break,35:Pure Ply,48:Megacool') }, { l: lv('6:Avoid') }, {}, { u: { 'Diamond Dust': 'Diamond Berg' } }, {}]);
L('swordsmanE', [{ l: lv('4:Thorn,5:Cure Poison,11:Cutting Edge,13:Restore,14:Briar,19:Revive,30:Break,36:Nettle') }, { l: lv('1:Ply,6:Avoid,16:Ply Well,34:Pure Ply') }, { l: lv('8:Wish,22:Wish Well,46:Pure Wish') }, { u: { 'Cutting Edge': 'Plume Edge' } }, {}]);
L('swordsmanF', [{ l: lv('2:Blast,3:Guard,5:Cure Poison,10:Mad Blast,11:Cutting Edge,13:Restore,15:Protect,28:Fiery Blast,30:Break') }, { l: lv('1:Ply,6:Avoid,16:Ply Well,34:Pure Ply') }, { l: lv('8:Wish,22:Wish Well,46:Pure Wish') }, { u: { 'Cutting Edge': 'Plume Edge' } }, {}]);
L('dragoon', [{ l: lv('1:Ply,2:Blast,4:Thorn,5:Cure Poison,6:Avoid,8:Wish,10:Mad Blast,11:Cutting Edge,13:Restore,16:Ply Well,17:Briar,22:Wish Well,27:Fiery Blast,34:Pure Ply,36:Nettle,46:Pure Wish') }, { u: { 'Cutting Edge': 'Plume Edge' } }, {}]);
L('apprentice', [{ l: lv('1:Delude,6:Gaia,9:Weaken,11:Astral Blast,14:Sleep,17:Haunt,20:Curse,24:Mother Gaia,25:Enfeeble,31:Drain,39:Psy Drain,50:Grand Gaia') }, {}, { l: lv('5:Impact,6:Ward,21:High Impact,22:Resist') }, { u: { 'Astral Blast': 'Thunder Mine' } }, {}]);
L('page', [{ l: lv('1:Delude,6:Ward,8:Volcano,9:Weaken,11:Astral Blast,14:Sleep,22:Resist,24:Eruption,25:Enfeeble,31:Drain,39:Psy Drain,48:Pyroclasm') }, {}, { l: lv('3:Guard,5:Impact,15:Protect,21:High Impact') }, { u: { 'Astral Blast': 'Thunder Mine' } }, {}]);
L('ninja', [{ l: lv('1:Gale,4:Punji,6:Fire Bomb,7:Mist,8:Thunderclap,12:Death Plunge,15:Punji Trap,16:Cluster Bomb,18:Typhoon,21:Shuriken,26:Thunderbolt,31:Annihilation,36:Punji Strike,40:Carpet Bomb,44:Hurricane,50:Thunderhead') }, { u: { 'Death Plunge': 'Death Leap' } }, {}]);
L('seerW', [{ l: lv('1:Cure,2:Froth,3:Growth,5:Cure Poison,10:Cure Well,12:Mad Growth,13:Restore,14:Froth Sphere,26:Potent Cure,29:Wild Growth,30:Break,40:Froth Spiral') }, {}, { l: lv('8:Wish,19:Revive,22:Wish Well,46:Pure Wish') }, {}, {}]);
L('seerA', [{ l: lv('1:Cure,2:Bolt,3:Growth,6:Flash Bolt,10:Cure Well,12:Mad Growth,18:Bind,22:Blue Bolt,26:Potent Cure,29:Wild Growth,31:Drain,39:Psy Drain') }, {}, { l: lv('7:Ward,19:Revive,23:Resist') }, {}, {}]);
L('medium', [{ l: lv('1:Bolt,2:Froth,3:Cure,6:Flash Bolt,10:Cure Well,14:Froth Sphere,17:Haunt,19:Revive,20:Curse,22:Blue Bolt,26:Potent Cure,29:Condemn,31:Drain,36:Psy Drain,40:Froth Spiral') }, {}, {}]);
L('pilgrimW', [{ l: lv('1:Douse,5:Cure Poison,6:Prism,12:Drench,13:Restore,20:Hail Prism,30:Deluge,34:Break,48:Freeze Prism') }, {}, { l: lv('8:Volcano,9:Wish,22:Eruption,24:Wish Well,46:Pure Wish,48:Pyroclasm') }, {}, {}]);
L('pilgrimA', [{ l: lv('1:Slash,9:Plasma,10:Wind Slash,18:Bind,26:Shine Plasma,30:Sonic Slash,33:Drain,41:Psy Drain,50:Spark Plasma') }, {}, { l: lv('6:Ward,8:Volcano,22:Eruption,24:Resist,48:Pyroclasm') }, {}, {}]);
L('ranger', [{ l: lv('1:Slash,2:Douse,6:Ward,8:Volcano,10:Wind Slash,12:Drench,18:Bind,22:Eruption,24:Resist,30:Sonic Slash,30:Deluge,33:Drain,34:Break,41:Psy Drain,48:Pyroclasm') }, {}, {}]);
L('brute', [{ l: lv('1:Growth,6:Nova Blast,12:Mad Growth,13:Planet Diver,16:Nova,17:Haunt,24:Curse,28:Wild Growth,29:Condemn,40:Supernova') }, {}, { l: lv('7:Spire,9:Impair,19:Revive,20:Clay Spire,23:Debilitate,42:Stone Spire') }, {}, { u: { 'Planet Diver': 'Planetary' } }, {}]);
L('samurai', [{ l: lv('3:Guardian,5:Demon Spear,6:Rockfall,8:Lava Shower,10:Magic Shell,12:Dragon Cloud,15:Protector,18:Demon Night,21:Angel Spear,24:Rockslide,24:Molten Bath,27:Magic Shield,33:Helm Splitter,40:Quick Strike,48:Magma Storm,50:Avalanche') }, { u: { 'Dragon Cloud': 'Epicenter', 'Demon Night': 'Thorny Grave', 'Helm Splitter': 'Skull Splitter' } }]);
L('hermit', [{ l: lv('1:Impact,6:Prism,8:Plasma,18:Bind,21:High Impact,22:Hail Prism,26:Shine Plasma,30:Break,31:Drain,39:Psy Drain,50:Spark Plasma,48:Freeze Prism') }, {}, { l: lv('12:Wish,24:Wish Well,46:Pure Wish') }, {}, {}, {}]);
L('whitemage', [{ l: lv('1:Cure Poison,6:Prism,8:Plasma,9:Ward,11:Dull,12:Wish,13:Restore,17:Revive,22:Hail Prism,24:Wish Well,26:Shine Plasma,31:Resist,37:Blunt,46:Spark Plasma,46:Pure Wish,48:Freeze Prism') }, {}]);
L('alchemist', [
  { l: lv('1:Cure,1:Mind Read,3:Ward,5:Impact,8:Guard,12:Cure Well,16:Impair,22:Restore,30:Cure Poison') },
  { l: lv('1:Break,4:Wish,9:Debilitate,15:Ply Well,20:Protect,27:Resist,34:Frost') },
  { l: lv('1:Astral Blast,6:Revive,12:Magic Shell,18:Wish Well,24:High Impact,32:Spark Plasma,40:Tundra') },
  { l: lv('1:Pure Ply,10:Magic Shield,16:Protector,24:Pure Wish,33:Ragnarok,45:Grand Gaia') }
]);
L('pierrot', [{ l: lv('3:Delude,5:Fire,6:Avoid,8:Dull,10:Quick Strike,13:Flare Wall,15:Sleep,17:Fireball,22:Fire Breath,25:Blue Bolt,27:Condemn,33:Briar,37:Inferno,46:Ice Missile') }, {}, { l: lv('29:Death Plunge') }, {}]);
L('tamer', [{ l: lv('1:Slash,5:Cure Poison,6:Impact,10:Wind Slash,10:Flare Wall,13:Restore,20:Tornado,22:High Impact,45:Tempest') }, { l: lv('7:Froth,32:Clay Spire') }, { l: lv('15:Mad Growth,28:Curse') }, { l: lv('24:Haunt,38:Wish Well') }]);
L('darkmage', [{ l: lv('1:Haunt,9:Fire,17:Haunt,19:Revive,20:Curse,22:Fireball,24:Curse,29:Condemn,31:Drain,33:Nettle,39:Psy Drain,49:Inferno') }, {}, { l: lv('26:Demon Night') }, { l: lv('47:Thorny Grave') }]);

// Compute list of psynergy for a class at a given level (with upgrades applied)
function classPsynergy(className, level) {
  const cls = CLASSES[className]; if (!cls) return [];
  const tiers = LEARN[cls.group] || []; const list = []; const ups = {};
  for (let t = 0; t <= cls.tier && t < tiers.length; t++) {
    for (const [l, arr] of Object.entries(tiers[t].learn)) if (level >= parseInt(l)) for (const p of arr) if (!list.includes(p)) list.push(p);
    Object.assign(ups, tiers[t].up);
  }
  return list.map(p => ups[p] || p).filter(p => PSY[p]);
}
