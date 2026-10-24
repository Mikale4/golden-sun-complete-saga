// ---------- Characters, stats, leveling, Djinn & classes ----------
'use strict';
// Experience curve (levels 1..99); derived from the reference tables
const MAX_LEVEL = 50;   // the user's rule: level 50 is the ceiling (superboss Alex sits at it)
const EXP_TABLE = (() => {
  const t = [0, 0, 24, 67, 144, 283, 519, 873, 1369, 2039, 2910, 3999, 5306, 6861, 8696, 10843, 13334, 16224, 19548, 23371, 27767, 32778, 38491, 45004, 52429, 60893, 70457, 81264, 93476, 107276, 122732, 140043, 159431, 181146, 205467, 232463, 262429, 295691, 332612, 373594, 418674, 468262, 522809, 582811, 648813, 720095, 797080, 880224, 970020, 1067000, 1171738, 1281713, 1397187, 1518435, 1645745, 1775601, 1908054, 2043156, 2180960, 2321520, 2464891];
  for (let l = 61; l <= 100; l++) t[l] = t[l - 1] + 143371;
  return t;
})();
const STAT_KEYS = ['hp', 'pp', 'atk', 'def', 'agi', 'lck'];
const EQUIP_SLOTS = ['weapon', 'body', 'arm', 'head', 'acc'];
const SLOT_CATS = { weapon: ['long', 'light', 'axe', 'mace', 'staff'], body: ['armor', 'cloth', 'robe'], arm: ['shield', 'glove', 'brace'], head: ['helm', 'hat', 'circlet'], acc: ['ring', 'shirt', 'boots'] };

class Character {
  constructor(id, level) {
    const d = CHARACTERS[id]; this.id = id; this.name = d.name; this.el = d.el;
    this.base = d.base.slice(); this.level = 0; this.exp = 0;
    this.djinn = []; // {name} - Djinn are always set; their skills have per-battle cooldowns in this.cd
    this.limit = 0; this.summon = null; this.cd = {}; // summon gauge (0-100), the summon chosen as this character's limit break, skill cooldowns
    this.equip = { weapon: null, body: null, arm: null, head: null, acc: null };
    this.held = [];   // the Psynergy items in this Adept's pack (Lifting Gem, Carry Stone...): each bestows its Psynergy while held, as many as they like - the real games' way
    this.status = {}; this.buffs = { atk: 0, def: 0, agi: 0, res: 0 };
    this.classItem = null; this.extraPsy = [];
    this.hp = 1; this.pp = 1;
    this.growTo(level || 1, true);
    const s = this.stats(); this.hp = s.hp; this.pp = s.pp;
  }
  get data() { return CHARACTERS[this.id]; }
  get look() { return this.data.look; }
  // ---- Leveling (goal system) ----
  growTo(level, silent) {
    while (this.level < Math.min(level, MAX_LEVEL)) this.levelUp(silent);
  }
  goal(stat, lvl) { // stat goal value at a given goal level index
    const g = this.data.goals[stat]; const keys = ['hp', 'pp', 'atk', 'def', 'agi'];
    if (lvl === 0) return this.base[keys.indexOf(stat)] === undefined ? 0 : this.data.base[keys.indexOf(stat)];
    return g[Math.min(4, Math.floor((lvl - 19) / 20))];
  }
  levelUp(silent) {
    const gains = {};
    const keys = ['hp', 'pp', 'atk', 'def', 'agi'];
    const gl = this.level < 19 ? 0 : this.level < 39 ? 19 : this.level < 59 ? 39 : this.level < 79 ? 59 : 79;
    const nl = gl === 0 ? 19 : gl + 20;
    keys.forEach((k, i) => {
      const x = gl === 0 ? this.data.base[i] : this.data.goals[k][Math.floor((gl - 19) / 20)];
      const y = this.data.goals[k][Math.floor((nl - 19) / 20)];
      const d = y - x, b = Math.floor(d / 20), c = (d - 20 * b) / 20;
      const gain = b + (Math.random() < c ? 1 : 0);
      this.base[i] += gain; gains[k] = gain;
    });
    this.level++;
    if (!silent) { this.hp = Math.min(this.stats().hp, this.hp + gains.hp * 2); this.pp = Math.min(this.stats().pp, this.pp + gains.pp * 2); }
    return gains;
  }
  expToNext() { return this.level >= MAX_LEVEL ? 0 : EXP_TABLE[this.level + 1] - this.exp; }
  gainExp(n) { if (this.level >= MAX_LEVEL) return []; this.exp += n; const ups = []; while (this.level < MAX_LEVEL && this.exp >= EXP_TABLE[this.level + 1]) { const before = this.psynergy(); ups.push({ level: this.level + 1, gains: this.levelUp(), before }); } return ups; }
  // ---- Djinn ----
  setDjinn(name) { const d = DJINN[name]; if (!d) return; this.djinn.push({ name }); this.validateSummon(); }
  removeDjinn(name) { const i = this.djinn.findIndex(d => d.name === name); if (i < 0) return; const d = this.djinn.splice(i, 1)[0]; this.validateSummon(); return d; }
  djinnByEl() { const c = [0, 0, 0, 0]; for (const d of this.djinn) c[DJINN[d.name].el]++; return c; }
  elLevels() { const lv = [0, 0, 0, 0]; lv[this.el] = 5; for (const d of this.djinn) lv[DJINN[d.name].el]++; return lv; }
  // ---- Summon as limit break: the gauge fills from damage taken; when full the chosen summon can be unleashed ----
  availableSummons(party) { const P = party || G.party; if (!P) return []; const have = this.djinnByEl(); return SUMMON_ORDER.filter(s => P.summons.includes(s) && SUMMONS[s].req.every((r, i) => have[i] >= r)); }
  // keeps the chosen summon legal; a summon the player never picked by hand is auto-upgraded as stronger ones become available
  validateSummon(party) { const av = this.availableSummons(party); const tot = (s) => SUMMONS[s].req.reduce((x, y) => x + y, 0); if (!av.includes(this.summon) || this.summonAuto !== false) { this.summon = av.length ? av.reduce((b, s) => tot(s) > tot(b) ? s : b, av[0]) : null; if (this.summonAuto === undefined) this.summonAuto = true; } return this.summon; }
  chooseSummon(name) { if (!this.availableSummons().includes(name)) return false; this.summon = name; this.summonAuto = false; return true; }
  limitReady() { return this.alive && !!this.summon && this.limit >= 100; }
  gainLimit(n) { this.limit = clamp((this.limit || 0) + n, 0, 100); }
  skillReady(name) { return !(this.cd && this.cd[name] > 0); }
  className() { return determineClass(this.el, this.elLevels(), { isJenna: this.id === 'Jenna', isPiers: this.id === 'Piers', isKraden: this.id === 'Kraden', classItem: this.classItem }); }
  classDef() { return CLASSES[this.className()]; }
  // ---- Stats ----
  djinnBonus() { const b = [0, 0, 0, 0, 0, 0]; for (const d of this.djinn) { const bo = DJINN[d.name].boost; for (let i = 0; i < 6; i++) b[i] += bo[i]; } return b; }
  equipBonus() { const b = [0, 0, 0, 0, 0, 0]; for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (!it) continue; b[0] += it.hp || 0; b[1] += it.pp || 0; b[2] += it.atk || 0; b[3] += it.def || 0; b[4] += it.agi || 0; b[5] += it.luck || 0; } return b; }
  stats() {
    const cls = this.classDef(), db = this.djinnBonus(), eb = this.equipBonus(); const out = {};
    STAT_KEYS.forEach((k, i) => { out[k] = Math.max(1, Math.floor((this.base[i] + db[i] + eb[i]) * cls.mult[i] / 100)); });
    for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (it && it.agiMult) out.agi = Math.max(1, Math.floor(out.agi * it.agiMult)); }   // the boots that slow their wearer
    return out;
  }
  maxHp() { return this.stats().hp; } maxPp() { return this.stats().pp; }
  // what the gear adds up to: the unleash rate (Crit +n%), HP and PP won back each battle turn
  gearSum(key) { let t = 0; for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (it && it[key]) t += it[key]; } return t; }
  // effective battle stats incl. buffs
  atk() { return Math.max(1, Math.floor(this.stats().atk * (1 + (this.buffs.atk || 0)))); }
  def() { return Math.max(0, Math.floor(this.stats().def * (1 + (this.buffs.def || 0)))); }
  agi() { return Math.max(1, Math.floor(this.stats().agi * (1 + (this.buffs.agi || 0)))); }
  lck() { return this.stats().lck; }
  power(el) { if (el > 3) return 100; let p = this.data.pow[el] + 5 * this.elLevels()[el] + (this.tempPower ? this.tempPower[el] || 0 : 0); for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (it && it.pow && it.pow[ELNAME[el]]) p += it.pow[ELNAME[el]]; } return Math.min(200, p); }
  resist(el) { if (el > 3) return 100; let p = this.data.res[el] + 5 * this.elLevels()[el] + (this.buffs.res || 0); for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (it && it.res && it.res[ELNAME[el]]) p += it.res[ELNAME[el]]; } return p; }
  // ---- Psynergy ----
  psynergy() {
    const list = classPsynergy(this.className(), this.level).slice();
    for (const p of this.data.inherent) if (!list.includes(p)) list.push(p);
    for (const p of this.extraPsy) if (!list.includes(p)) list.push(p);
    // equipment-granted field psynergy
    for (const s of EQUIP_SLOTS) { const it = this.equip[s] && ITEM_DB[this.equip[s]]; if (it && it.grants && !list.includes(it.grants)) list.push(it.grants); }
    for (const n of (this.held || [])) { const it = ITEM_DB[n]; if (it && it.grants && !list.includes(it.grants)) list.push(it.grants); }
    return list;
  }
  // the Psynergy items: taken from the bag into this Adept's pack, or put back
  holds(name) { return (this.held || []).includes(name); }
  hold(name) { const it = ITEM_DB[name]; if (!it || !it.grants || !G.inventory.has(name)) return false; this.held = this.held || []; if (this.held.includes(name)) return false; G.inventory.remove(name); this.held.push(name); return true; }
  release(name) { const i = (this.held || []).indexOf(name); if (i < 0) return false; this.held.splice(i, 1); G.inventory.add(name); return true; }
  hasPsy(name) { return this.psynergy().includes(name); }
  learnExtra(name) { if (!this.extraPsy.includes(name)) this.extraPsy.push(name); }
  canEquip(itemName) { const it = ITEM_DB[itemName]; if (!it) return false; const d = this.data; if (it.female && !['Mia', 'Jenna', 'Sheba'].includes(this.name)) return false; if (d.weapons.includes(it.cat)) return true; if (d.armor.includes(it.cat)) return true; if (d.helm.includes(it.cat)) return true; if (['shield', 'glove', 'brace', 'ring', 'shirt', 'boots'].includes(it.cat)) { if (it.cat === 'shield' && !d.weapons.includes('long') && !d.weapons.includes('axe')) return false; return true; } return false; }
  slotFor(itemName) { const it = ITEM_DB[itemName]; if (!it) return null; for (const s of EQUIP_SLOTS) if (SLOT_CATS[s].includes(it.cat)) return s; return null; }
  weaponType() { const w = this.equip.weapon && ITEM_DB[this.equip.weapon]; if (!w) return 'none'; return { long: 'sword', light: 'lightblade', axe: 'axe', mace: 'mace', staff: 'staff' }[w.cat] || 'sword'; }
  get alive() { return this.hp > 0 && !this.status.down; }
  get down() { return !this.alive; }
  heal(n) { const m = this.maxHp(); const before = this.hp; this.hp = Math.min(m, this.hp + n); return this.hp - before; }
  restorePP(n) { const m = this.maxPp(); const before = this.pp; this.pp = Math.min(m, this.pp + n); return this.pp - before; }
  fullRestore() { const s = this.stats(); this.hp = s.hp; this.pp = s.pp; this.status = {}; this.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; this.cd = {}; }
  clearBattleState() { this.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; this.tempPower = null; for (const k of ['sleep', 'stun', 'delusion', 'seal', 'haunt', 'curse', 'shield', 'immune', 'kite']) delete this.status[k]; this.cd = {}; if (this.hp <= 0) this.status.down = true; }
  serialize() { return { id: this.id, base: this.base, level: this.level, exp: this.exp, djinn: this.djinn.map(d => ({ name: d.name })), equip: this.equip, status: this.status, classItem: this.classItem, extraPsy: this.extraPsy, held: (this.held || []).slice(), hp: this.hp, pp: this.pp, limit: this.limit, summon: this.summon, summonAuto: this.summonAuto !== false }; }
  static deserialize(o) { const c = new Character(o.id, 1); Object.assign(c, { base: o.base, level: o.level, exp: o.exp, djinn: (o.djinn || []).map(d => ({ name: d.name })), equip: o.equip, status: o.status || {}, classItem: o.classItem, extraPsy: o.extraPsy || [], held: (o.held || []).slice(), hp: o.hp, pp: o.pp, limit: o.limit || 0, summon: o.summon || null, summonAuto: o.summonAuto !== false }); c.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; c.cd = {}; Character.packPsyItems(c); return c; }
  // an older save wore its Psynergy items as accessories: they go into the pack, the slot is free again
  static packPsyItems(c) { c.held = c.held || []; for (const s of Object.keys(c.equip || {})) { const n = c.equip[s]; if (n && ITEM_DB[n] && ITEM_DB[n].grants) { c.equip[s] = null; if (!c.held.includes(n)) c.held.push(n); } } }
  // Battle sprite params (with equipped weapon)
  battleLook() { return Object.assign({}, this.look, { weapon: this.weaponType() === 'none' ? (this.look.weapon || 'sword') : this.weaponType() }); }
}

class Party {
  constructor() { this.members = []; this.active = []; this.reserve = []; this.coins = 0; this.summons = ['Venus', 'Ramses', 'Cybele', 'Judgment', 'Mercury', 'Nereid', 'Neptune', 'Boreas', 'Mars', 'Kirin', 'Tiamat', 'Meteor', 'Jupiter', 'Atalanta', 'Procne', 'Thor']; this.djinnFound = []; this.avoidSteps = 0; }
  add(ch) { this.members.push(ch); if (this.active.length < 4) this.active.push(ch); else this.reserve.push(ch); }
  // the one who leads the journey stays in the front rank, as in the games: Isaac on the first, Felix on the second
  get leaderId() { return G.game === 2 ? 'Felix' : 'Isaac'; }
  isLeader(m) { return !!m && m.id === this.leaderId && this.members.includes(m); }
  remove(id) { const i = this.members.findIndex(m => m.id === id); if (i < 0) return null; const ch = this.members.splice(i, 1)[0]; this.active = this.active.filter(m => m !== ch); this.reserve = this.reserve.filter(m => m !== ch); return ch; }
  get(id) { return this.members.find(m => m.id === id); }
  get leader() { return this.active[0]; }
  get aliveActive() { return this.active.filter(m => m.alive); }
  hasPsy(name) { return this.active.some(m => m.alive && m.hasPsy(name)); }
  whoHasPsy(name) { return this.active.filter(m => m.alive && m.hasPsy(name) && m.pp >= PSY[name].pp); }
  allDjinn() { const a = []; for (const m of this.members) for (const d of m.djinn) a.push({ owner: m, d }); return a; }
  djinnCount() { return this.members.reduce((a, m) => a + m.djinn.length, 0); }
  giveDjinn(name) {
    if (this.djinnFound.includes(name)) return null;
    this.djinnFound.push(name);
    const el = DJINN[name].el;
    // prefer a member of the same element with fewest djinn, else fewest overall
    const sorted = this.members.slice().sort((a, b) => (a.djinn.length - b.djinn.length) || ((a.el === el ? 0 : 1) - (b.el === el ? 0 : 1)));
    const same = this.members.filter(m => m.el === el).sort((a, b) => a.djinn.length - b.djinn.length);
    let target = same.length && same[0].djinn.length < 9 ? same[0] : sorted[0];
    if (target.djinn.length >= 9) target = sorted[0];
    target.setDjinn(name); return target;
  }
  fullRestore() { for (const m of this.members) m.fullRestore(); }
  serialize() { return { members: this.members.map(m => m.serialize()), active: this.active.map(m => m.id), reserve: this.reserve.map(m => m.id), coins: this.coins, summons: this.summons, djinnFound: this.djinnFound }; }
  static deserialize(o) { const p = new Party(); p.members = o.members.map(Character.deserialize); p.active = o.active.map(id => p.get(id)).filter(Boolean); p.reserve = o.reserve.map(id => p.get(id)).filter(Boolean); p.active = p.active.filter((m, i) => p.active.indexOf(m) === i); p.reserve = p.reserve.filter((m, i) => p.reserve.indexOf(m) === i && !p.active.includes(m)); for (const m of p.members) if (!p.active.includes(m) && !p.reserve.includes(m)) (p.active.length < 4 ? p.active : p.reserve).push(m);   /* one rank each, nobody in both or in neither */ p.coins = o.coins; p.summons = o.summons; p.djinnFound = o.djinnFound || []; for (const m of p.members) m.validateSummon(p); return p; }
}
