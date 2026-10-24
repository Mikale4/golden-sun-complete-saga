// ---------- Battle system ----------
'use strict';
const STATUS_NAMES = { poison: 'Poison', venom: 'Venom', stun: 'Stun', sleep: 'Sleep', delusion: 'Delusion', seal: 'Seal', haunt: 'Haunt', curse: 'Curse', down: 'Down' };

// ---------- Bosses with more than one head ----------
// The Doom Dragon fights as three heads on one body: every live head acts once a turn from its own list, and as the
// body's HP falls a head at a time goes limp - the survivors angrier for it, and the last one striking twice.
const BOSS_HEADS = {
  'Doom Dragon': [
    { name: 'earth head', dieAt: 2 / 3, ab: ['Stone Spire', 'Gravel Blow', 'Clay Spire', 'Earth Force', 'Quake Sphere', 'Nettle'] },
    { name: 'flame head', dieAt: 1 / 3, ab: ['Inferno', 'Serpent Fume', 'Blast Breath', 'Fiery Blast', 'Desert Gasp', 'Flare Storm'] },
    { name: 'dark head', dieAt: 0, ab: ['Cruel Ruin', 'Djinn Blast', 'Darksol Gasp', 'Haunt', 'Curse', 'Cure', 'Psy Boost'], last: ['Cruel Ruin', 'Darksol Gasp', 'Cruel Ruin', 'Djinn Blast', 'Djinn Storm', 'Cure'] }
  ]
};
// The superbosses (the user's rule): they keep their several actions a round, but never use the same action twice in
// a row - the second action of a round differs from the first, and the next round's first from the last. Alex's row
// carries the flag itself (nr), being made at run time.
const SUPERBOSSES = new Set(['Dullahan', 'Star Magician', 'Sentinel', 'Valukar', 'Deadbeard', 'The Wise One', 'Terragon', 'Thalassa', 'Ignis', 'Zephyros', 'Alkahest', 'Eye of Chronos', 'Elder Frost Dragon', 'Void Sovereign']);
const actKey = (cmd) => !cmd ? '' : cmd.type + ':' + (cmd.psy || cmd.ab || cmd.djinn || cmd.summon || cmd.item || '');
class Enemy {
  noRepeats() { return !!(this.data && (this.data.nr || SUPERBOSSES.has(this.data.n))); }   // a superboss never does the same thing twice running
  constructor(name, idx) {
    const d = ENEMY_DB[name] || ENEMY_DB['Vermin'];
    this.name = d.n.replace(/ II$/, ''); this.dbName = d.n; this.idx = idx; // ' II' marks the stronger overworld variant of an early enemy; players see the plain name
    this.maxHp = G.debugWeak ? 1 : d.hp; this.hp = this.maxHp; this.maxPp = d.pp; this.pp = d.pp;
    this.baseAtk = d.atk; this.baseDef = d.def; this.baseAgi = d.agi; this.lck = d.lck; this.turns = d.t; this.pow = d.pw.slice(); this.res = d.rs.slice();
    this.abilities = d.ab.filter(a => a !== 'Flee' && a !== 'Element Swap'); this.exp = d.exp; this.coins = d.c; this.drop = d.dr; this.data = d;
    this.lastAct = '';
    if (BOSS_HEADS[this.name]) { this.heads = BOSS_HEADS[this.name].map(h => Object.assign({ dead: false }, h)); this.turns = this.heads.length; this.headIdx = 0; }
    this.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; this.status = {}; this.level = clamp(Math.floor(Math.sqrt(d.hp) * 0.9), 1, typeof MAX_LEVEL !== 'undefined' ? MAX_LEVEL : 99);
    this.spec = Monsters.spec(this.name); this.boss = false; this.statusResist = this.spec.t === 'human' || d.hp >= 2000 ? 0.75 : 0;
    this.x = 0; this.y = 0; this.shake = 0; this.flash = 0; this.dead = false; this.alpha = 1; this.defending = false; this.idx = idx || 0; this.pose = null;
  }
  atk() { return Math.max(1, Math.floor(this.baseAtk * (1 + this.buffs.atk))); }
  def() { return Math.max(0, Math.floor(this.baseDef * (1 + this.buffs.def) * (this.defending ? 1.5 : 1))); }
  agi() { return Math.max(1, Math.floor(this.baseAgi * (1 + this.buffs.agi))); }
  lckV() { return this.lck; }
  power(el) { return el > 3 ? 100 : this.pow[el]; }
  resist(el) { return el > 3 ? 100 : this.res[el] + this.buffs.res; }
  get alive() { return this.hp > 0; }
  maxHpV() { return this.maxHp; }
  sprite(f) { return Monsters.sprite(this.name, f); }
}

// ---------- The swirl into battle ----------
// The field freezes and blinks twice under the encounter chime, then the whole picture spins and dives into the
// centre of the screen the way the originals did; the battle fades up out of the black that is left behind.
class BattleTransition {
  constructor(onDone) {
    this.t = 0; this.done = false; this.onDone = onDone;
    this.snap = document.createElement('canvas'); this.snap.width = SCREEN_W; this.snap.height = SCREEN_H;
    this.snap.getContext('2d').drawImage(Engine.canvas, 0, 0);
  }
  update() { this.t++; if (this.t >= 60 && !this.done) { this.done = true; if (this.onDone) this.onDone(); } }
  draw(g) {
    const t = this.t;
    g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    if (t < 20) {
      g.drawImage(this.snap, 0, 0);
      const p = t < 10 ? t : t - 10, a = p < 3 ? 0.85 : Math.max(0, 0.85 - (p - 3) * 0.2);
      if (a > 0) { g.fillStyle = '#ffffff'; g.globalAlpha = a; g.fillRect(0, 0, SCREEN_W, SCREEN_H); g.globalAlpha = 1; }
      return;
    }
    const k = Math.pow((t - 20) / 40, 2);            // eases in: slow start, then the picture whips round
    const ang = k * 6, z = 1.1 + k * 2.4;
    g.save(); g.translate(SCREEN_W / 2, SCREEN_H / 2);
    for (let i = 3; i >= 0; i--) {                   // ghost copies trailing behind give it the smear of a real spin
      g.save(); g.rotate(ang - i * 0.1 * (1 + k * 4)); g.scale(z, z); g.globalAlpha = i ? 0.3 : 1;
      g.drawImage(this.snap, -SCREEN_W / 2, -SCREEN_H / 2); g.restore();
    }
    g.restore();
    g.fillStyle = '#000'; g.globalAlpha = Math.min(1, k * 1.25); g.fillRect(0, 0, SCREEN_W, SCREEN_H); g.globalAlpha = 1;
  }
}

// the top of a fighter's HP: a party member's is a method, a foe's a number (maxHpV() is its method form) - the rival
// Adepts of the arena and the road cast Revive and carry regen like the party, so the healing code asks this way
const mhpOf = (x) => typeof x.maxHp === 'function' ? x.maxHp() : (x.maxHpV ? x.maxHpV() : x.maxHp);
class BattleScene {
  static scaleWeaken(w) {
    const n = G.party.members.length || 1, per = G.party.djinnCount() / n, t = clamp((per - 4) / 4, 0, 1);
    const mix = (m) => (m === undefined ? 1 : m + (1 - m) * t);
    return { hp: mix(w.hp), atk: mix(w.atk), def: mix(w.def), turns: w.turns, t };
  }
  constructor(enemyNames, opts) {
    this.opts = opts || {};
    // Boss 'weaken' multipliers are a safety net for a Djinn-light party: they apply in full at <=4 Djinn per party
    // member and fade out completely by 8 per member, so a party that hunted Djinn gets the boss at its real stats.
    const wk = this.opts.weaken ? (this.opts.fixedWeaken ? Object.assign({ hp: 1, atk: 1, def: 1 }, this.opts.weaken) : BattleScene.scaleWeaken(this.opts.weaken)) : null;
    if (typeof Bestiary !== 'undefined') for (const n of enemyNames) Bestiary.see(n);
    this.enemies = enemyNames.map((n, i) => { const e = new Enemy(n, i); if (this.opts.boss) { e.boss = true; e.statusResist = Math.max(e.statusResist, 0.6); } if (wk) { e.maxHp = Math.max(1, Math.floor(e.maxHp * wk.hp)); e.hp = e.maxHp; e.baseAtk = Math.floor(e.baseAtk * wk.atk); e.baseDef = Math.floor(e.baseDef * wk.def); if (wk.turns) e.turns = wk.turns; } if (this.opts.turns) e.turns = this.opts.turns; if (this.opts.enemyRegen) e.regenHp = this.opts.enemyRegen; return e; });   // a boss whose turns and per-turn recovery the story sets (the Serpent under its lights)
    this.party = G.party; this.front = this.party.active.slice(); this.back = this.party.reserve.slice(); this.front0 = this.front.slice(); this.back0 = this.back.slice();
    for (const m of this.party.members) { m.cd = {}; m.validateSummon(); }
    if (typeof ClassExt !== 'undefined') ClassExt.rivalsInit(this);   // Adepts on the other side get the party's own mechanics
    this.msg = ''; this.msgTimer = 0; this.state = 'intro'; this.turn = 0; this.frame = 0; this.co = null; this.popups = []; this.fx = []; this.menu = null; this.cursorTarget = null; this.cursorSide = null; this.showStatus = true;
    this.result = null; this.bg = this.opts.bg || (G.map && G.map.battleBg) || 'grass'; this.mapId = this.opts.mapId || (G.map && G.map.id) || ''; this.escapeTries = 0;
    this.layout();
    this.co = new Coroutine(this.main());
    this.fled = false; this.commands = []; this.summonBanner = null; this.intro = 0;
    this.actorAnim = {}; // id -> {pose, dx, dy}
    this.daedalus = null;
  }
  enter() {
    let name = this.opts.boss ? (this.opts.music || 'boss') : (G.flag('prologue_jenna') ? 'jennabattle' : 'battle');   // Jenna's own battle theme while she leads the prologue
    if (typeof BOSS_MUSIC !== 'undefined') {
      // an enemy's own name first ('Saturos II' has its own theme), then the name without its numeral
      const own = this.enemies.map(e => e.data && (BOSS_MUSIC[e.data.n] || BOSS_MUSIC[e.data.n.replace(/ II$/, '')])).find(Boolean);
      if (own) name = own;
      else if (this.opts.boss && name === 'boss' && this.enemies.some(e => e.spec && e.spec.t === 'human')) name = 'bosshuman';
      else if (!this.opts.boss && G.field && G.field.ship) name = 'seabattle';
    }
    Audio.play(name);
  }
  layout() {
    const n = this.enemies.length; const spacing = Math.min(64, Math.floor(200 / n));
    this.enemies.forEach((e, i) => { e.x = 120 + (i - (n - 1) / 2) * spacing; e.y = 84; });   // the foes' ground line sits mid-screen, the party's below it
  }
  partyPos(i, count) { const n = count || this.front.length; const spacing = Math.min(52, Math.floor(180 / Math.max(1, n))); return { x: 120 + (i - (n - 1) / 2) * spacing, y: 132 }; }
  // whoever can be revived: the front rank, then the rear guard's fallen (as in The Lost Age, a downed member in the back
  // can be raised from the front; they stay in the back until the front falls)
  reviveList() { return this.front.concat(this.back.filter(m => !m.alive)); }
  backPos(m) { const j = this.back.filter(x => !x.alive).indexOf(m); return { x: 218 + j * 14, y: 136 }; }
  // ---------- helpers ----------
  say(t, frames) { this.msg = t; this.msgTimer = frames || 40; return frames || 40; }
  popup(x, y, text, col) { this.popups.push({ x, y, text, col: col || '#ffffff', t: 0 }); }
  aliveEnemies() { return this.enemies.filter(e => e.alive); }
  aliveParty() { return this.front.filter(m => m.alive); }
  targetsInRange(list, center, range) {
    if (range === 'all' || range >= 99) return list.filter(t => t.alive).map(t => ({ t, mult: 1 }));
    const idx = list.indexOf(center); const half = Math.floor(range / 2); const out = [];
    for (let i = idx - half; i <= idx + half; i++) { const t = list[i]; if (!t || !t.alive) continue; out.push({ t, mult: 1 - 0.2 * Math.abs(i - idx) }); }
    return out;
  }
  isChar(a) { return a instanceof Character || !!(a && !a.rival && a.constructor && a.constructor.name === 'Character'); }   /* by name too: a party restored through a hot-swapped class is still the party */
  // ---------- damage formulas (from the mechanics guide) ----------
  physical(att, def, opts) {
    opts = opts || {};
    const relAtk = Math.max(0, att.atk() - (opts.pierce ? Math.floor(def.def() * (1 - opts.pierce)) : def.def()));
    let base = relAtk / 2;
    if (opts.crit) base = base * 1.25 + (def.level || 10) / 5 + 6;
    if (opts.mult !== undefined) base = base * opts.mult + (opts.add || 0);
    if (opts.el !== undefined && opts.el < 4) { const rp = clamp(att.power(opts.el) - def.resist(opts.el), -200, 200); base *= 1 + rp / 400; }
    return Math.max(1, Math.floor(base) + rnd(4));
  }
  magic(att, def, el, base, areaMult) {
    if (!this.isChar(att)) base *= att.boss ? 0.9 : 0.75; // monsters' Psynergy is tuned a little below the player's
    const rp = clamp(att.power(el) - def.resist(el), -200, 200); let m = clamp(1 + rp / 200, 0, 2);
    return Math.max(1, Math.floor(base * m * (areaMult || 1)) + rnd(4));
  }
  healAmt(att, el, base) { const m = Math.min(2, att.power(el) / 100); return Math.floor(base * m) + rnd(4); }
  applyDamage(target, dmg, opts) {
    opts = opts || {};
    // Haunt: whoever struck this blow sometimes takes a quarter of the damage back (reference: battle mechanics)
    if (opts.from && opts.from !== target && opts.from.status && opts.from.status.haunt && dmg > 0 && chance(0.5)) { const back = Math.max(1, Math.floor(dmg * 0.25)); opts.from.hp = Math.max(0, opts.from.hp - back); const p = this.posOf(opts.from); this.popup(p.x, p.y - 20, String(back), '#c080ff'); if (opts.from.hp <= 0 && this.isChar(opts.from)) { opts.from.status.down = true; } }
    if (target.status.immune) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Immune', '#a0e0ff'); return 0; }
    // Alex's Blink as a passive: a chance to step out of the way of any blow - a better one against a summon (the user's rule); as a foe and as a friend alike
    // Alex's Blink (the user's rule): the step through the world starts certain (100%) and halves with every hit it
    // slips; a hit that lands resets it to a ceiling that itself sinks each time (95, 90, 85... five points a reset for
    // ordinary hits; 90, 80, 70... ten for summons) - the trick
    // wears out under persistence. One state for the whole fight; the summons have a state of their own, same rules.
    if (dmg > 0 && !opts.noBlink && this.isAlex(target)) {
      const k = this._summoning ? '_blinkSummon' : '_blink'; const b = this[k] || (this[k] = { chance: 1, ceiling: this._summoning ? 0.9 : 0.95, step: this._summoning ? 0.1 : 0.05 }); const p = this.posOf(target);   /* the summons wear their own copy of the trick down, separately, and faster (ten points a reset; five for ordinary hits) */
      if (chance(b.chance)) { b.chance = b.chance / 2; this.popup(p.x, p.y - 20, 'Blink ' + Math.round(b.chance * 100) + '%', '#a0e0ff'); Audio.sfx('psy'); return 0; }
      b.chance = b.ceiling; b.ceiling = Math.max(0, b.ceiling - b.step); if (b.chance > 0) this.popup(p.x + 18, p.y - 30, 'Blink ' + Math.round(b.chance * 100) + '%', '#a0e0ff');
    }
    if (!this.isChar(target) && typeof BossGimmicks !== 'undefined' && target.data && target.data.gimmick) { dmg = BossGimmicks.onHit(this, target, dmg, this._hit || {}); if (dmg <= 0) return 0; }   /* the Cradle's superbosses: their rule on this blow */
    if (target.status.shield) dmg = Math.floor(dmg * (1 - target.status.shield));
    if (this.isChar(target) && target.status.defending) dmg = Math.floor(dmg / 2);
    dmg = Math.max(0, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    if (this.isChar(target) && dmg > 0) target.gainLimit(dmg / target.maxHp() * 80); // ~1.25x max HP of punishment fills the gauge
    else if (target.rival && dmg > 0) target.gainLimit(dmg / target.maxHp * 80);
    if (target.status.sleep && dmg > 0 && chance(0.7)) delete target.status.sleep;
    const p = this.posOf(target); this.popup(p.x, p.y - 20, String(dmg), opts.crit ? '#ffe040' : '#ffffff');
    if (opts.from && !this.isChar(opts.from) && opts.from.data && opts.from.data.gimmick && typeof BossGimmicks !== 'undefined') BossGimmicks.onDealt(this, opts.from, target, dmg);   /* a Cradle superboss fed by its own blows */
    if (this.isChar(target)) { this.actorAnim[target.id] = { pose: 'hurt', t: 14 }; } else { target.shake = 12; target.flash = 6; }
    if (target.hp <= 0) { if (this.isChar(target)) { target.status.down = true; target.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; Audio.sfx('death'); } else { if (!target.dead && typeof Bestiary !== 'undefined') Bestiary.kill(target.dbName || target.name); target.dead = true; } }
    return dmg;
  }
  posOf(a) { const lift = 0; if (this.isChar(a)) { const i = this.front.indexOf(a); const p = i < 0 ? this.backPos(a) : this.partyPos(i); const an = this.actorAnim[a.id]; return { x: p.x + (an ? an.dx || 0 : 0), y: p.y - 8 - lift + (an ? an.dy || 0 : 0) }; } return { x: a.x, y: a.y - lift }; }
  tryStatus(target, st, chanceBase) {
    if (!target.alive) return false;
    if (st === 'down' && target.boss) return false;
    let ch = chanceBase !== undefined ? chanceBase : 0.6;
    ch -= (target.lckV ? target.lckV() : target.lck()) * 0.008;
    if (target.statusResist) ch *= (1 - target.statusResist);
    if (this.isChar(target)) ch *= 0.7;
    if (Math.random() > ch) return false;
    if (st === 'down') { this.applyDamage(target, target.hp); return true; }
    if (st === 'curse') target.status.curse = 7; else if (st === 'stun') target.status.stun = 2; else if (st === 'sleep') target.status.sleep = 3; else target.status[st] = true;
    const p = this.posOf(target); this.popup(p.x, p.y - 28, STATUS_NAMES[st] || st, '#e0a0ff'); Audio.sfx('status');
    return true;
  }
  buff(target, stat, amt) {
    const max = stat === 'res' ? 80 : stat === 'agi' ? 1.0 : 0.5, min = stat === 'res' ? -80 : -0.5;
    const before = target.buffs[stat] || 0; target.buffs[stat] = clamp(before + amt, min, max);
    const p = this.posOf(target); const label = { atk: 'Attack', def: 'Defense', agi: 'Agility', res: 'Resist' }[stat];
    this.popup(p.x, p.y - 28, label + (amt > 0 ? ' up' : ' down'), amt > 0 ? '#80ff80' : '#ff9060'); Audio.sfx(amt > 0 ? 'buff' : 'debuff');
    if (this.isChar(target)) { }
  }
  // ---------- main coroutine ----------
  *main() {
    Engine.fade = 1; Engine.fadeIn(15);
    yield 10;
    this.intro = 1;
    if (this.opts.intro) yield* this.opts.intro(this);
    else yield this.say(this.enemies.length === 1 ? this.enemies[0].name + ' appeared!' : 'Monsters appeared!', 50);
    while (true) {
      this.turn++;
      if (typeof BossGimmicks !== 'undefined') { yield* BossGimmicks.onTurn(this); if (this.checkEnd()) { yield* this.finish(); return; } }   /* the Cradle's superbosses: their rule turns over */
      if (this.opts.joinAt) for (const [nm, at] of Object.entries(this.opts.joinAt)) { if (this.turn !== at) continue; const m = this.party.get(nm); if (!m || this.front.includes(m) || this.front.length >= 4) continue; this.back = this.back.filter(x => x !== m); this.front.push(m); if (!this.party.active.includes(m)) this.party.active.push(m); this.party.reserve = this.party.reserve.filter(x => x !== m); m.cd = {}; Audio.sfx('join'); yield this.say(m.name + ' joins the battle!', 50); }
      // ---- command phase ----
      this.commands = []; this.resetPlan();
      let i = 0;
      while (i < this.front.length) {
        const ch = this.front[i];
        if (!ch.alive || ch.status.stun || ch.status.sleep) { this.commands[i] = null; i++; continue; }
        const cmd = yield* this.commandPhase(ch, i);
        if (cmd === 'back') { i = Math.max(0, i - 1); while (i > 0 && (!this.front[i].alive || this.front[i].status.stun || this.front[i].status.sleep)) i--; if (!this.front[i].alive) i = 0; continue; }
        if (cmd === 'flee') { const ok = yield* this.tryFlee(); if (ok) return; this.commands = []; i = 0; continue; }
        this.commands[i] = cmd; this.notePlan(ch, cmd); i++;
        if (cmd.kite) { }
      }
      this.menu = null; this.cursorTarget = null;
      // ---- enemy commands ----
      const acts = [];
      this.front.forEach((ch, i) => { if (this.commands[i]) acts.push({ actor: ch, cmd: this.commands[i] }); });
      for (const e of this.aliveEnemies()) for (let t = 0; t < e.turns; t++) acts.push({ actor: e, cmd: this.enemyChoose(e) });
      // extra actions from Kite
      for (const ch of this.front) if (ch.status.kite && this.commands[this.front.indexOf(ch)]) { acts.push({ actor: ch, cmd: this.commands[this.front.indexOf(ch)] }); delete ch.status.kite; }
      // sort by agility (djinn/summon go slightly earlier as in GS, defend first)
      acts.forEach(a => { a.spd = a.actor.agi() * (0.9 + Math.random() * 0.2); if (a.cmd.type === 'defend') a.spd += 9999; if (a.cmd.type === 'summon' || a.cmd.type === 'djinn') a.spd += 500; });
      acts.sort((a, b) => b.spd - a.spd);
      // ---- resolve ----
      let lullEnded = false;
      for (const a of acts) {
        if (lullEnded) break;
        if (this.checkEnd()) break;
        if (!a.actor.alive) continue;
        if (a.actor.status.stun) { yield this.say(a.actor.name + ' is stunned!', 30); continue; }
        if (a.actor.status.sleep) { yield this.say(a.actor.name + ' is asleep...', 30); continue; }
        if (typeof ClassExt !== 'undefined' && (yield* ClassExt.beforeAct.call(this, a))) continue;   // held in stasis, or charmed onto its own side
        // cursed gear now and then holds its wearer fast for a turn; a Cleric's Ring nullifies that
        if (this.isChar(a.actor) && a.actor.equip && Object.values(a.actor.equip).some(n => n && ITEM_DB[n] && ITEM_DB[n].cursed) && !Object.values(a.actor.equip).includes("Cleric's Ring") && chance(0.25)) { yield this.say(a.actor.name + ' is bound by the curse!', 35); continue; }
        if (this.isChar(a.actor) && a.actor.status.seal && (a.cmd.type === 'psy')) { yield this.say(a.actor.name + "'s Psynergy is sealed!", 35); continue; }
        if (this.isChar(a.actor) && a.actor.status.chaos) { const others = this.aliveParty().filter(t => t !== a.actor); if (others.length) { a.cmd = { type: 'attack', target: pick(others) }; yield this.say(a.actor.name + ' is in chaos and turns on ' + a.cmd.target.name + '!', 35); } }   /* Alkahest's Chaos Magic */
        if (!this.isChar(a.actor) && (a.actor.boss || this.opts.boss) && !a.actor.rival && a.cmd.type !== 'defend') a.cmd = this.enemyChoose(a.actor);   /* a boss decides as its turn comes, on the state as it is then (its second and third turns of a round see what the first did) */
        const r = yield* this.execute(a.actor, a.cmd);
        if (!this.isChar(a.actor) && typeof BossGimmicks !== 'undefined') BossGimmicks.onActed(this, a.actor, a.cmd);
        if (typeof BossGimmicks !== 'undefined') yield* BossGimmicks.afterAction(this);   /* a threshold crossed by that blow (Ignis cracks) */
        if (r === 'lull') lullEnded = true;
        if (r === 'fled') return;
        yield* this.checkHeads(); yield* this.deathBursts();
        yield 6;
      }
      if (this.checkEnd()) { yield* this.finish(); return; }
      // ---- end of turn effects ----
      yield* this.endOfTurn(); yield* this.deathBursts();
      if (this.checkEnd()) { yield* this.finish(); return; }
      // The Lost Age's rule: whoever falls in the front rank is replaced by the next of the rear guard at the end of the
      // turn (the fallen go to the back, where a revive still reaches them), and a short front fills up to four
      if (this.back.some(m => m.alive) && (this.front.some(m => !m.alive) || this.front.length < 4)) {
        const swapped = [];
        for (let i = 0; i < this.front.length; i++) { const m = this.front[i]; if (m.alive) continue; const sub = this.back.find(b => b.alive); if (!sub) break; this.back = this.back.filter(b => b !== sub); this.back.push(m); this.front[i] = sub; swapped.push(sub.name); }
        while (this.front.length < 4) { const sub = this.back.find(b => b.alive); if (!sub) break; this.back = this.back.filter(b => b !== sub); this.front.push(sub); swapped.push(sub.name); }
        if (swapped.length) { for (const n of swapped) { const m = this.front.find(x => x.name === n); if (m) m.cd = m.cd || {}; } yield this.say((swapped.length === 1 ? swapped[0] + ' steps' : swapped.join(', ') + ' step') + ' forward!', 45); }
        this.party.active = this.front.slice(); this.party.reserve = this.back.slice();
      }
    }
  }
  checkEnd() { return this.aliveEnemies().length === 0 || (this.aliveParty().length === 0 && !this.back.some(m => m.alive)) || (this.aliveParty().length === 0 && !this.back.length); }
  *endOfTurn() {
    for (const a of [...this.front, ...this.enemies]) {
      if (!a.alive) continue;
      if (a.gearSum) { const hr = a.gearSum('hpRegen'), pr = a.gearSum('ppRegen'); if (hr && a.hp < mhpOf(a)) { const h = a.heal(hr); if (h > 0) this.popup(this.posOf(a).x, this.posOf(a).y - 20, '+' + h, '#80ff80'); } if (pr && a.pp < a.maxPp()) { const g = a.restorePP(pr); if (g > 0) this.popup(this.posOf(a).x + (hr ? 18 : 0), this.posOf(a).y - 20, '+' + g + 'PP', '#c0a0ff'); } }   // the gear that mends its wearer each turn - both shown, the PP beside the HP
      if (!a.gearSum && /Ball$/.test(a.name) && a.pp < a.maxPp) a.pp = Math.min(a.maxPp, a.pp + 10);   /* the Star Magician's balls recover 10 PP a turn (the guide), so they keep to their work */
      if (a.regenHp && !a.status.stone && a.hp < a.maxHpV()) { const h = Math.min(a.regenHp, a.maxHpV() - a.hp); a.hp += h; this.popup(this.posOf(a).x, this.posOf(a).y - 20, '+' + h, '#80ff80'); yield this.say(a.name + ' recovers ' + h + ' HP!', 25); }   // the Serpent drinks in the dark: the fewer lights, the more it mends
      if (a.status.chaos) { a.status.chaos--; if (a.status.chaos <= 0) { delete a.status.chaos; yield this.say(a.name + ' comes back to their senses.', 25); } }
      if (a._timed) for (const st of Object.keys(a._timed)) { if (--a._timed[st] <= 0) { delete a._timed[st]; if (a.status[st]) { delete a.status[st]; yield this.say(a.name + "'s " + st + ' passes.', 20); } } }   /* the ailments Chaotic Alchemy lays on lift by themselves */
      if (a.status.poison) { const d = Math.max(1, Math.floor(a.maxHpV ? a.maxHpV() * 0.1 : a.maxHp() * 0.1)); this.applyDamage(a, d); yield this.say(a.name + ' takes poison damage!', 25); }
      if (a.status.venom) { const d = Math.max(1, Math.floor(a.maxHpV ? a.maxHpV() * 0.2 : a.maxHp() * 0.2)); this.applyDamage(a, d); yield this.say(a.name + ' takes venom damage!', 25); }
      if (a.status.curse) { a.status.curse--; if (a.status.curse <= 0) { delete a.status.curse; this.applyDamage(a, a.hp); yield this.say(a.name + ' was claimed by the curse!', 40); } }
      if (a.status.stun) { a.status.stun--; if (a.status.stun <= 0) delete a.status.stun; }
      if (a.status.sleep) { a.status.sleep--; if (a.status.sleep <= 0) delete a.status.sleep; }
      if (typeof ClassExt !== 'undefined') yield* ClassExt.endTurn.call(this, a);
      delete a.status.shield; delete a.status.immune; delete a.status.defending; if (!this.isChar(a)) a.defending = false;
      if (a.status.regen) { const h = Math.floor(mhpOf(a) * 0.6); a.heal(h); this.popup(this.posOf(a).x, this.posOf(a).y - 20, '+' + h, '#80ff80'); a.status.regen--; if (a.status.regen <= 0) delete a.status.regen; }
    }
    // Djinn skill cooldowns and the summon gauge
    for (const m of this.front) { if (!m.alive) continue; for (const k in m.cd) { if (--m.cd[k] <= 0) delete m.cd[k]; } m.gainLimit(4); }
    // Daedalus missile
    if (this.daedalus) { const a = this.daedalus; this.daedalus = null; yield this.say('Missiles rain down!', 30); yield* this.playFx('fire', this.aliveEnemies()); for (const e of this.aliveEnemies()) { const rp = clamp(78 - e.resist(2), -200, 200); const d = Math.max(1, Math.floor((250 + e.maxHp * 0.15) * clamp(1 + rp / 200, 0, 2))); this.applyDamage(e, d); } yield 30; }
  }
  clampStats(m) { const s = m.stats(); if (m.hp > s.hp) m.hp = s.hp; if (m.pp > s.pp) m.pp = s.pp; }
  djinnScatter(m, turns, gaugeLoss) { for (const d of m.djinn) m.cd[d.name] = Math.max(m.cd[d.name] || 0, turns); m.gainLimit(-gaugeLoss); }
  // ---------- command phase ----------
  *commandPhase(ch, idx) {
    this.current = ch;
    if (this.autoBattle || G.debugAuto) { const t = this.retarget(this.enemies); return (this.autoBattle && this.autoBattle(ch, t)) || { type: 'attack', target: t }; }
    if (this.auto) { if (this.autoStop) { this.auto = false; this.autoStop = false; yield this.say('Auto battle off.', 20); } else return this.autoCommand(ch); }
    this.actorAnim[ch.id] = { pose: 'step', t: 9999 };
    const mainItems = [{ label: 'Attack', id: 'attack' }, { label: 'Psynergy', id: 'psy' }, { label: 'Summon', id: 'summon', disabled: !ch.limitReady(), color: ch.limitReady() ? '#ffe060' : undefined }, { label: 'Item', id: 'item' }, { label: 'Defend', id: 'defend' }, { label: 'Auto', id: 'auto' }];
    if (idx === 0 && this.opts.canFlee !== false) mainItems.push({ label: 'Flee', id: 'flee' });
    const main = new MenuList(mainItems, { x: 6, y: 120, w: 108, rows: 4, cols: 2, colW: 52, lineH: 9 });
    main.idx = this.lastMain || 0; if (mainItems[main.idx] && mainItems[main.idx].disabled) main.idx = 0;
    this.menu = main; this.menuKind = 'main';
    while (true) {
      yield 1; main.update();
      if (main.cancelled) { this.actorAnim[ch.id] = null; this.menu = null; return 'back'; }
      if (!main.chosen) continue;
      const c = main.chosen.id; this.lastMain = main.idx;
      if (c === 'attack') { const t = yield* this.pickTarget(this.enemies, 1); if (t === null) { this.menu = main; continue; } this.menu = null; this.actorAnim[ch.id] = null; return { type: 'attack', target: t }; }
      if (c === 'defend') { this.menu = null; this.actorAnim[ch.id] = null; return { type: 'defend' }; }
      if (c === 'auto') { this.auto = true; this.autoStop = false; this.menu = null; this.actorAnim[ch.id] = null; return this.autoCommand(ch); } // the rest of the party (and later turns) act on their own until X is pressed
      if (c === 'flee') { this.menu = null; this.actorAnim[ch.id] = null; return 'flee'; }
      if (c === 'psy') {
        const list = ch.psynergy().filter(p => !PSY[p].fieldOnly && !PSY[p].field || (PSY[p].field && !PSY[p].fieldOnly)).filter(p => PSY[p].type !== 'field').map(p => ({ label: p, id: p, right: PSY[p].pp, disabled: ch.pp < PSY[p].pp, color: ELCOLOR[psyEl(PSY[p])] === undefined ? '#fff' : tint(ELCOLOR[psyEl(PSY[p])], 0.4) }));
        // Djinn skills sit under the Psynergy list: no PP, but each rests for a few turns after use
        for (const d of ch.djinn) { const cd = ch.cd[d.name] || 0; list.push({ label: d.name, id: 'dj:' + d.name, djinn: d.name, right: cd ? 'Wait ' + cd : 'Djinn', disabled: cd > 0, color: tint(ELCOLOR[DJINN[d.name].el], 0.3) }); }
        if (!list.length) { yield this.say(ch.name + ' has no Psynergy.', 30); this.menu = main; continue; }
        const sub = new MenuList(list, { x: 8, y: 108, w: 120, rows: 5, lineH: 10 }); this.menu = sub; this.menuKind = 'psy';
        let picked = null, pickedDjinn = null;
        while (true) { yield 1; sub.update(); const cur = sub.current; this.subDesc = !cur ? '' : cur.djinn ? DJINN[cur.djinn].desc + ' (rests ' + djinnCooldown(cur.djinn) + ' turns)' : PSY[cur.id].desc; if (sub.cancelled) break; if (sub.chosen) { picked = sub.chosen.id; pickedDjinn = sub.chosen.djinn || null; break; } }
        this.subDesc = '';
        if (!picked) { this.menu = main; continue; }
        if (pickedDjinn) {
          const fx = DJINN[pickedDjinn].fx; const friendly = ['heal', 'revive', 'healAll', 'reviveAll', 'buffAll', 'shield', 'cureAll', 'pp', 'ppAll', 'kite', 'immune', 'eddy', 'counter', 'lull'].includes(fx.k);
          let t = null;
          if (['heal', 'revive', 'pp', 'kite', 'immune'].includes(fx.k)) t = yield* this.pickTarget(fx.k === 'revive' ? this.reviveList() : this.front, 1, true);
          else if (friendly) t = ch;
          else t = yield* this.pickTarget(this.enemies, 1);
          if (t === null) { this.menu = main; continue; }
          this.menu = null; this.actorAnim[ch.id] = null; return { type: 'djinn', djinn: pickedDjinn, target: t };
        }
        const p = PSY[picked]; const friendly = ['heal', 'cure', 'revive', 'buff'].includes(p.type);
        const list2 = friendly ? (p.type === 'revive' ? this.reviveList() : this.front) : this.enemies;
        const t = p.range === 'all' ? (friendly ? this.front[0] : this.enemies[0]) : yield* this.pickTarget(list2, p.range, friendly);
        if (t === null) { this.menu = sub; this.menu = main; continue; }
        this.menu = null; this.actorAnim[ch.id] = null; return { type: 'psy', psy: picked, target: t };
      }
      if (c === 'summon') { // the limit break: the summon chosen in the field menu, once the gauge is full
        if (!ch.summon) { yield this.say(ch.name + ' has no Djinn, so no summon.', 30); this.menu = main; continue; }
        if (!ch.limitReady()) { yield this.say(ch.name + "'s summon gauge is at " + Math.floor(ch.limit) + '%.', 30); this.menu = main; continue; }
        this.menu = null; this.actorAnim[ch.id] = null; return { type: 'summon', summon: ch.summon, target: this.enemies[0] };
      }
      if (c === 'item') {
        const inv = G.inventory.battleUsable().map(s => ({ label: (ITEM_DB[s.name] && ITEM_DB[s.name].n) || s.name, id: s.name, right: 'x' + s.qty }));
        for (const [slot, nm] of Object.entries(ch.equip || {})) if (nm && ITEM_DB[nm] && ITEM_DB[nm].gearUse) inv.push({ label: (ITEM_DB[nm].n || nm), id: nm, right: 'E', equipped: slot });
        if (!inv.length) { yield this.say('No usable items.', 30); this.menu = main; continue; }
        const sub = new MenuList(inv, { x: 8, y: 108, w: 120, rows: 5, lineH: 10 }); this.menu = sub; this.menuKind = 'item';
        let picked = null;
        while (true) { yield 1; sub.update(); this.subDesc = sub.current ? (ITEM_DB[sub.current.id].desc || '') : ''; if (sub.cancelled) break; if (sub.chosen) { picked = sub.chosen.id; break; } }
        this.subDesc = '';
        if (!picked) { this.menu = main; continue; }
        const it = ITEM_DB[picked]; let t;
        if (it.battle) t = yield* this.pickTarget(this.enemies, it.battle.range || 1); else t = yield* this.pickTarget(it.use && it.use.revive ? this.reviveList() : this.front, 1, true, true);
        if (t === null) { this.menu = main; continue; }
        this.menu = null; this.actorAnim[ch.id] = null; return { type: 'item', item: picked, target: t, equipped: (inv.find(i => i.id === picked) || {}).equipped };
      }
    }
  }
  *pickTarget(list, range, friendly, allowDown) {
    const cand = list.filter(t => friendly ? (allowDown || t.alive || true) : t.alive);
    if (!cand.length) return null;
    let idx = Math.min(cand.length - 1, Math.floor(cand.length / 2)); if (friendly) idx = 0;
    this.cursorSide = friendly ? 'party' : 'enemy';
    const menuBak = this.menu; this.menu = null;
    while (true) {
      yield 1;
      this.cursorTarget = cand[idx]; this.cursorRange = range;
      if (Input.repeat('left') || Input.repeat('up')) { idx = (idx + cand.length - 1) % cand.length; Audio.sfx('cursor'); }
      if (Input.repeat('right') || Input.repeat('down')) { idx = (idx + 1) % cand.length; Audio.sfx('cursor'); }
      if (Input.pressed('a')) { Audio.sfx('confirm'); this.cursorTarget = null; this.cursorSide = null; return cand[idx]; }
      if (Input.pressed('b')) { Audio.sfx('cancel'); this.cursorTarget = null; this.cursorSide = null; this.menu = menuBak; return null; }
    }
  }
  *tryFlee() {
    if (this.opts.boss || this.opts.canFlee === false) { yield this.say("You can't escape!", 40); return false; }
    const partyAgi = Math.max(...this.aliveParty().map(m => m.agi())), enAgi = Math.max(...this.aliveEnemies().map(e => e.agi()));
    const p = clamp(0.5 + (partyAgi - enAgi) / 100 + this.escapeTries * 0.15, 0.2, 0.95); this.escapeTries++;
    if (chance(p)) { Audio.sfx('flee'); yield this.say('The party fled!', 40); this.fled = true; this.result = 'fled'; yield Engine.fadeOut(15); Engine.pop(); if (this.opts.onEnd) this.opts.onEnd(this.result); return true; }   // the field is waiting on onEnd: without it the screen stayed black
    yield this.say("Couldn't escape!", 40);
    // enemies get a free round
    for (const e of this.aliveEnemies()) { const r = yield* this.execute(e, this.enemyChoose(e)); yield* this.deathBursts(); if (this.checkEnd()) { yield* this.finish(); return true; } }
    return false;
  }
  // ---------- enemy AI ----------
  enemyChoose(e) {
    if (!e.abilities.length) return { type: 'attack' };
    // the healers among a group (the Star Magician's Refresh Ball) mend whoever of their side is worst off
    const allies = this.aliveEnemies(); const master = /Ball$/.test(e.name) ? allies.find(x => x.name === 'Star Magician') : null;   /* a ball of the ring serves the Star Magician alone */
    const worst = master || allies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const hurt = e.hp < e.maxHp * 0.4 || (allies.length > 1 && worst && worst.hp < worst.maxHp * (/Ball$/.test(e.name) ? 0.9 : 0.6));   /* the Refresh Ball mends at the first scratch */
    let pool = e.heads ? this.headPool(e) : e.abilities.slice();
    // the Star Magician: a ball of its ring gone, it calls another far more often than not; all four there, no call at all
    if (e.name === 'Star Magician') { // an optional boss plays its best: a ball gone, the call, always; else the great spell the party resists least; the Mine Ball when the PP is spent
      const dead = this.enemies.filter(x => /Ball$/.test(x.name) && x.dead); if (dead.length && !(e.noRepeats() && e.lastAct === 'monster:Mystic Call')) return { type: 'monster', ab: 'Mystic Call', target: null };
      const party = this.aliveParty(); const avgRes = (el) => party.reduce((a, m) => a + m.resist(el), 0) / Math.max(1, party.length);
      const spells = ['Megacool', 'Spark Plasma'].filter(n => PSY[n] && PSY[n].pp <= e.pp).sort((a, b) => avgRes(psyEl(PSY[a])) - avgRes(psyEl(PSY[b])));
      const okSpells = e.noRepeats() ? spells.filter(n => 'psy:' + n !== e.lastAct) : spells; if (okSpells.length) return { type: 'psy', psy: okSpells[0], target: pick(party) };
      if (e.noRepeats() && e.lastAct === 'monster:Mine Ball' && spells.length) return { type: 'psy', psy: spells[0], target: pick(party) };
      return { type: 'monster', ab: 'Mine Ball', target: pick(party) }; }
    // weight: Attack common; healing only when hurt; a cure only when somebody on this side has something to cure
    const heals = ['Regen Dance', 'Recovery', 'Cure', 'Cure Well', 'Potent Cure', 'Ply', 'Ply Well', 'Wish', 'Healing Aura', 'Earnest Ply', 'Vital Moon', 'Revive'];
    if (!hurt) pool = pool.filter(a => !heals.includes(a) && !(PSY[a] && PSY[a].type === 'heal'));
    const cureTarget = (ab) => { const p = PSY[ab]; if (!p || p.type !== 'cure') return null; return (master ? [master] : allies).find(al => (p.cures || []).some(st => al.status[st])) || null; };
    pool = pool.filter(a => !(PSY[a] && PSY[a].type === 'cure') || cureTarget(a));
    // the Star Magician's balls never swing: each does its own work (the guide lists no plain attack for them) - the
    // Anger Ball its mine, the Thunder Ball its bolts, the Guardian Ball its aura, the Refresh Ball its mending; with
    // nothing of that to do (nobody hurt, nothing to cure, no PP yet), a ball holds and guards
    if (/Ball$/.test(e.name)) { pool = pool.filter(a => a !== 'Attack' && !(PSY[a] && PSY[a].pp > e.pp)); if (!pool.length) return { type: 'defend' }; }
    if (!pool.length) pool = ['Attack'];
    if (typeof BossGimmicks !== 'undefined' && e.data && e.data.gimmick) { const fc = BossGimmicks.forceCmd(this, e); if (fc) return fc; }   /* a Cradle superboss whose rule decides this action (Thalassa on the low tide) */
    if (e.boss || this.opts.boss) return this.bossChoose(e, pool, allies, worst, cureTarget);   // every boss - story, optional, secret, class-item, event - plays its best
    // Like the original, the ability list is ordered by frequency: the first slot (usually Attack) is used far more
    // often than the last, so bosses mostly swing and only occasionally spend a round on their biggest spells.
    const passive = ['Defend', 'Fortify', 'Total Defense', 'Stand Ready', 'Ally Search', 'Search for Help', 'Cage'];
    const W = [8, 5, 4, 3, 2, 2, 1, 1]; let tot = 0; const ws = pool.map((a, i) => { const w = passive.includes(a) ? 1 : W[Math.min(i, W.length - 1)]; tot += w; return w; });
    let roll = Math.random() * tot, ab = pool[pool.length - 1]; for (let i = 0; i < pool.length; i++) { roll -= ws[i]; if (roll < 0) { ab = pool[i]; break; } }
    const p = PSY[ab];
    if (p && p.pp > e.pp) ab = 'Attack';
    if (!p && ab !== 'Attack' && !passive.includes(ab) && this.monsterCost(this.monsterAbility(ab, e)) > e.pp) ab = 'Attack';
    if (ab === 'Attack') return { type: 'attack' };
    if (passive.includes(ab)) return { type: 'defend' };
    if (p) { const friendly = ['heal', 'cure', 'revive', 'buff'].includes(p.type); const ft = p.type === 'heal' ? (worst || e) : p.type === 'cure' ? (cureTarget(ab) || e) : e; return { type: 'psy', psy: ab, target: friendly ? ft : pick(this.aliveParty()) }; }
    return { type: 'monster', ab, target: pick(this.aliveParty()) };
  }
  // ---------- the bosses' play ----------
  // Every boss weighs each of its options by what it would actually do this turn - damage capped at what is left to
  // take (a kill is worth extra), a status on somebody not yet under it, mending when hurt, a boost before it is up,
  // a Djinn storm while the party's Djinn are set - and takes the best, with a hair of chance between near-equals.
  bossChoose(e, pool, allies, worst, cureTarget) {
    const party = this.aliveParty(); if (!party.length) return { type: 'defend' };
    const kill = (t, d) => d >= t.hp ? t.maxHp() * 0.4 : 0; const dmgVal = (t, d) => Math.min(d, t.hp) + kill(t, d);
    const stVal = (t, st) => (!st || t.status[st] || !t.alive) ? 0 : t.maxHp() * ({ sleep: 0.45, stun: 0.45, seal: 0.4, down: 0.6, delusion: 0.2, haunt: 0.2, curse: 0.3, poison: 0.15, venom: 0.2 }[st] || 0.15) * (1 - (t.statusResist || 0));
    const opts = []; const consider = (v, cmd) => opts.push({ v: v * (0.93 + Math.random() * 0.14), cmd });
    const hasAttack = pool.includes('Attack') || !pool.length;
    if (hasAttack) for (const t of party) consider(dmgVal(t, this.physical(e, t, {})), { type: 'attack', target: t });
    for (const ab of pool) {
      if (ab === 'Attack') continue;
      const p = PSY[ab];
      if (p) {
        if (p.pp > e.pp) continue; const el = psyEl(p);
        if (p.type === 'magic' || p.type === 'drain') for (const c of party) { let v = 0; for (const { t, mult } of this.targetsInRange(this.front, c, p.range || 1)) v += dmgVal(t, this.magic(e, t, el, p.base, mult)) + stVal(t, p.status) * (p.statusChance || 0.3) * 2; consider(v - p.pp * 0.2, { type: 'psy', psy: ab, target: c }); }
        else if (p.type === 'epa') for (const t of party) consider(dmgVal(t, this.physical(e, t, { el, add: p.add || 0, mult: p.mult || 1 })) + stVal(t, p.status), { type: 'psy', psy: ab, target: t });
        else if (p.type === 'status') for (const c of party) { let v = 0; for (const { t } of this.targetsInRange(this.front, c, p.range || 1)) v += stVal(t, p.status) * (p.statusChance || 0.55) * 1.6; if (v > 0) consider(v - p.pp * 0.2, { type: 'psy', psy: ab, target: c }); }
        else if (p.type === 'heal') { const tgt = worst || e; if (tgt.hp < tgt.maxHp * 0.6) consider(Math.min(this.healAmt(e, el, p.base), tgt.maxHp - tgt.hp) * 1.4, { type: 'psy', psy: ab, target: tgt }); }
        else if (p.type === 'cure') { const tgt = cureTarget(ab); if (tgt) consider(tgt.maxHp * 0.25, { type: 'psy', psy: ab, target: tgt }); }
        else if (p.type === 'revive') { const dead = this.enemies.find(x => x.dead && !x.fledAway && !x.burst); if (dead) consider(dead.maxHp * 0.6, { type: 'psy', psy: ab, target: dead }); }
        else if (p.type === 'buff') { const st = p.stat || 'atk'; const ts = p.range === 'all' ? allies : [e]; const need = ts.filter(t => (t.buffs[st] || 0) < (st === 'res' ? 30 : 0.24)); if (need.length) consider(need.reduce((a, t) => a + (st === 'atk' ? t.atk() * 0.7 : t.maxHp * 0.06), 0), { type: 'psy', psy: ab, target: e }); }
        else if (p.type === 'debuff') for (const c of party) { let v = 0; for (const { t } of this.targetsInRange(this.front, c, p.range || 1)) if ((t.buffs[p.stat] || 0) > (p.stat === 'res' ? -30 : -0.24)) v += t.maxHp() * 0.12; if (v > 0) consider(v - p.pp * 0.2, { type: 'psy', psy: ab, target: c }); }
        else if (p.type === 'break') { if (party.some(t => Object.values(t.buffs).some(b => b > 0))) consider(party.reduce((a, t) => a + (t.buffs.atk > 0 || t.buffs.def > 0 ? t.maxHp() * 0.15 : 0), 0), { type: 'psy', psy: ab, target: party[0] }); }
        else if (p.type === 'special' && p.special === 'djinnstorm') { const set = party.reduce((a, m) => a + m.djinn.filter(d => !(m.cd || {})[d.name]).length + (m.limit >= 60 ? 3 : 0), 0); if (set >= 5) consider(set * 50, { type: 'psy', psy: ab, target: party[0] }); }
        continue;
      }
      const m = this.monsterAbility(ab, e); if (this.monsterCost(m) > e.pp) continue;
      switch (m.kind) {
        case 'heal': if (e.hp < e.maxHp * 0.6) consider(Math.min(Math.floor(e.maxHp * m.pct), e.maxHp - e.hp) * 1.4, { type: 'monster', ab, target: e }); break;
        case 'buff': if ((e.buffs.atk || 0) < 0.24) consider(e.atk() * 0.7, { type: 'monster', ab, target: e }); break;
        case 'guardaura': if (allies.some(t => (t.buffs.def || 0) < 0.24)) consider(allies.reduce((a, t) => a + t.maxHp * 0.06, 0), { type: 'monster', ab, target: e }); break;
        case 'call': if (this.enemies.some(x => /Ball$/.test(x.name) && x.dead)) consider(1e6, { type: 'monster', ab, target: null }); break;
        case 'chaos': { const free = party.filter(t => !t.status.chaos); if (free.length >= 2) consider(free.reduce((a, t) => a + t.maxHp() * 0.3, 0) * 0.5, { type: 'monster', ab, target: null }); break; }
        case 'djinnstorm': { const set = party.reduce((a, mm) => a + mm.djinn.filter(d => !(mm.cd || {})[d.name]).length + (mm.limit >= 60 ? 3 : 0), 0); if (set >= 5) consider(set * 50, { type: 'monster', ab, target: null }); break; }
        case 'djinnblast': for (const t of party) consider(dmgVal(t, this.physical(e, t, { mult: 1.2 })) + (t.djinn.length ? 70 : 0), { type: 'monster', ab, target: t }); break;
        case 'status': for (const c of party) { let v = 0; for (const { t } of this.targetsInRange(this.front, c, m.range || 1)) v += stVal(t, m.status) * 0.5 * 1.6; if (v > 0) consider(v, { type: 'monster', ab, target: c }); } break;
        case 'magic': case 'kamikaze': for (const c of party) { let v = 0; for (const { t, mult } of this.targetsInRange(this.front, c, m.range || 1)) v += dmgVal(t, this.magic(e, t, m.el, m.base, mult)) + stVal(t, m.status) * 0.35 * 2; if (m.kind === 'kamikaze') v -= e.hp * 0.6; consider(v, { type: 'monster', ab, target: c }); } break;
        default: for (const t of party) consider(dmgVal(t, this.physical(e, t, { el: m.el, mult: m.mult, add: m.add, pierce: m.pierce })) + stVal(t, m.status) * 0.4, { type: 'monster', ab, target: t }); break;
      }
    }
    if (!opts.length) return { type: 'attack', target: pick(party) };
    opts.sort((a, b) => b.v - a.v);
    if (e.noRepeats() && e.lastAct) { const other = opts.filter(o => actKey(o.cmd) !== e.lastAct); if (other.length) return other[0].cmd; }
    return opts[0].cmd;
  }
  // the next live head to act, and what it knows; alone, the last head fights from its angrier list
  headPool(e) {
    const live = e.heads.filter(h => !h.dead); const h = live[e.headIdx++ % live.length];
    return (live.length === 1 && h.last ? h.last : h.ab).slice();
  }
  // the Anger Ball bursts whenever it goes down - struck down as much as by its own Angry Mine: the whole front rank takes the fire
  *deathBursts() {
    for (const e of this.enemies) {
      if (e.name !== 'Anger Ball' || !e.dead || e.burst) continue; e.burst = true;
      const ts = this.aliveParty(); if (!ts.length) continue;
      Audio.sfx('boom'); Engine.doShake(12); yield this.say('The Anger Ball bursts as it falls!', 36);
      yield* this.playFx('fire', ts); const base = Math.min(320, Math.round(e.atk() * 0.75));
      for (const t of ts) { if (this.evade(e, t, true)) continue; this.applyDamage(t, this.magic(e, t, 2, base, 1)); }
      yield 24;
    }
  }
  *checkHeads() {
    for (const e of this.enemies) {
      if (!e.heads || !e.alive) continue;
      for (const h of e.heads) {
        if (h.dead || !(h.dieAt > 0) || e.hp > e.maxHp * h.dieAt) continue;
        h.dead = true; const live = e.heads.filter(x => !x.dead).length;
        e.turns = Math.max(2, live); e.baseAtk = Math.floor(e.baseAtk * 1.15); e.hp = Math.min(e.maxHp, e.hp + Math.floor(e.maxHp * 0.05));   // the survivors rage, and the body knits a little e.shake = 20; Engine.doShake(20); Audio.sfx('boom');
        yield this.say('The ' + e.name + "'s " + h.name + ' falls limp!', 60);
        if (live === 1) yield this.say('The last head rears up, its eyes blazing!', 50);
      }
    }
  }
  // a monster's own technique costs PP by its weight, as the originals' do: the great all-target blows are not free,
  // so a boss opens with its best and has to husband it (Dullahan's Charon six times, not every turn for ever)
  monsterCost(m) { switch (m.kind) { case 'chaos': return 36; case 'magic': return clamp(Math.round((m.base || 40) / 8 * (m.range === 'all' || m.range >= 5 ? 1.5 : m.range >= 3 ? 1.2 : 1)), 4, 48); case 'status': return 8; case 'heal': return 12; case 'buff': case 'guardaura': return 6; case 'djinnstorm': return 30; case 'djinnblast': return 12; case 'call': return 15; default: return 0; } }
  monsterAbility(name, actor) {
    // Derive an effect from the ability name; magic bases scale with the user's attack so early monsters stay survivable
    const A = actor ? actor.atk() : 60;
    const n = name.toLowerCase(); const has = (...k) => k.some(x => n.includes(x));
    // the Star Magician's ring (the guide's fight): the call for another ball, the Anger Ball's kamikaze, the Guardian Ball's aura, the Mine Ball
    if (n === 'mystic call') return { kind: 'call' };
    if (n === 'chaos magic') return { kind: 'chaos' };   /* Alkahest: one or two of the party turn on their own for two turns */
    if (n === 'angry mine') return { kind: 'kamikaze', el: 2, base: Math.min(320, Math.round(A * 0.75)), range: 3 };
    if (n === 'guard aura') return { kind: 'guardaura' };
    if (n === 'mine ball') return { kind: 'magic', el: 2, base: Math.min(240, Math.round(A * 0.5)), range: 1 };
    const el = has('fire', 'flame', 'heat', 'burn', 'blaze', 'magma', 'rolling', 'inferno', 'crucible') ? 2 : has('ice', 'frost', 'chill', 'water', 'aqua', 'hydro', 'ocean', 'flood', 'black ice', 'watery') ? 1 : has('thunder', 'storm', 'electric', 'shock', 'wind', 'typhoon', 'sonic', 'bolt', 'star') ? 3 : has('earth', 'rock', 'gravel', 'stone', 'quake', 'rumble', 'tremble', 'sand', 'meteor', 'grave', 'bone') ? 0 : 4;
    const status = has('poison', 'venom', 'toxic', 'acid', 'formic') ? (has('deadly', 'venom', 'kill') ? 'venom' : 'poison') : has('numb', 'stun', 'paraly', 'spasm', 'crusher') ? 'stun' : has('sleep', 'lull', 'soothing') ? 'sleep' : has('delude', 'blind', 'mist', 'dark', 'haze', 'evil', 'demon eye') ? 'delusion' : has('haunt', 'banshee', 'wicked', 'crazy', 'shriek') ? 'haunt' : has('death', 'mortal', 'kill', 'darksol', 'severe') ? 'down' : has('seal', 'bind', 'cage') ? 'seal' : has('curse', 'lucid') ? 'curse' : null;
    if (has('breath', 'blessing', 'gasp', 'flow', 'flood', 'howl', 'cry', 'shriek', 'voice', 'dance', 'wave', 'storm', 'rush', 'onslaught', 'army', 'worms', 'raging')) {
      if (has('regen', 'recovery', 'heal', 'vital')) return { kind: 'heal', pct: 0.3 };
      if (has('threaten', 'war cry', 'howl', 'shriek', 'voice', 'crazy', 'wicked', 'banshee')) return { kind: 'status', status: status || 'delusion', range: 3 };
      return { kind: 'magic', el, base: Math.min(300, Math.round(A * 0.4)), range: 3, status };
    }
    if (has('djinn storm')) return { kind: 'djinnstorm' };
    if (has('djinn')) return { kind: 'djinnblast' };
    if (has('charon')) return { kind: 'magic', el: 0, base: Math.min(400, Math.round(A * 0.7)), range: 'all', status: 'down' };
    if (has('formina', 'collide', 'cruel ruin', 'outer space', 'star mine', 'mine ball', 'angry mine')) return { kind: 'magic', el, base: Math.min(300, Math.round(A * 0.42)), range: 5, status };
    if (has('mystic', 'ray', 'beam', 'nova', 'blast', 'sonic', 'shock', 'bolt', 'spark', 'wave')) return { kind: 'magic', el, base: Math.min(260, Math.round(A * 0.55)), range: 1, status };
    if (has('psy boost', 'speed surge', 'berserk')) return { kind: 'buff' };
    if (has('flash', 'eye', 'threaten', 'demon')) return { kind: 'status', status: status || 'delusion', range: 1 };
    // physical
    const mult = has('mega', 'mighty', 'power', 'brute', 'crush', 'severe', 'mortal', 'true', 'grip', 'driver') ? 1.6 : has('double', 'twin', 'triple') ? 1.4 : 1.25;
    return { kind: 'epa', el, mult, add: 0, status, pierce: has('armor', 'pierce') ? 0.5 : 0 };
  }
  // ---------- action execution ----------
  *execute(actor, cmd) {
    const isC = this.isChar(actor); if (!isC && actor.noRepeats && actor.noRepeats()) actor.lastAct = actKey(cmd);
    this._hit = { kind: cmd.type === 'psy' ? (PSY[cmd.psy] && PSY[cmd.psy].type === 'epa' ? 'epa' : 'psy') : cmd.type, el: cmd.type === 'psy' && PSY[cmd.psy] ? psyEl(PSY[cmd.psy]) : cmd.type === 'djinn' && DJINN[cmd.djinn] ? DJINN[cmd.djinn].el : cmd.type === 'attack' && isC && actor.weaponEl ? actor.weaponEl() : 4, from: actor };   /* the Cradle's gimmicks read this at the hit */
    if (cmd.type === 'defend') { actor.status.defending = true; if (!isC) actor.defending = true; yield this.say(actor.name + ' defends.', 25); return; }
    if (cmd.type === 'attack' || cmd.type === 'monster') {
      let target = cmd.target;
      if (!target || !target.alive) target = isC ? this.retarget(this.enemies, target) : pick(this.aliveParty());
      if (!target) return;
      if (isC) { yield* this.animAttack(actor, target); } else { actor.shake = 6; yield 8; }
      // unleash?
      if ((isC || actor.data.weapon) && cmd.type === 'attack') {   // an Adept fought as a foe (Isaac's crew, a wayfarer) swings the blade it wore, unleash and all
        const w = isC ? actor.equip.weapon && ITEM_DB[actor.equip.weapon] : ITEM_DB[actor.data.weapon];
        if (w && w.unleash && UNLEASH[w.unleash] && chance(0.35 + (actor.gearSum ? actor.gearSum('crit') / 100 : 0))) { const u = UNLEASH[w.unleash]; yield this.say(actor.name + ' unleashes ' + w.unleash + '!', 30); yield* this.playFx(['earth', 'water', 'fire', 'wind'][u.el], [target]); let dmg = this.physical(actor, target, { el: u.el, add: u.add || 0, mult: u.mult || 1, pierce: u.pierce }); if (u.dbl && chance(u.dbl)) dmg *= 2; if (u.triple && chance(u.triple)) dmg *= 3; if (u.mults) dmg *= u.mults[Math.floor(Math.random() * u.mults.length)]; this.applyDamage(target, dmg); if (u.ppdrain && target.pp > 0) { const dp = Math.min(target.pp, Math.max(1, Math.floor(dmg / 10))); target.pp -= dp; if (actor.restorePP) actor.restorePP(dp); else actor.pp = Math.min(actor.maxPp, actor.pp + dp); this.popup(this.posOf(actor).x, this.posOf(actor).y - 20, '+' + dp + ' PP', '#a0c0ff'); } Audio.sfx('crit'); if (u.status) this.tryStatus(target, u.status, u.chance || 0.5); if (u.debuff) this.buff(target, u.debuff.stat, u.debuff.amt); if (u.drain) { if (actor.heal) actor.heal(dmg); else actor.hp = Math.min(actor.maxHp, actor.hp + dmg); this.popup(this.posOf(actor).x, this.posOf(actor).y - 20, '+' + dmg, '#80ff80'); } yield 24; return; }
      }
      if (cmd.type === 'monster') {
        const m = this.monsterAbility(cmd.ab, actor); const cost = this.monsterCost(m);
        if (cost > actor.pp) { yield this.say(actor.name + ' has no strength left for ' + cmd.ab + ' and strikes instead!', 30); if (this.evade(actor, target)) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Miss', '#c0c0c0'); yield 20; return; } this.applyDamage(target, this.physical(actor, target, {})); Audio.sfx('hit2'); yield 24; return; }
        actor.pp -= cost;
        yield this.say(actor.name + ' uses ' + cmd.ab + '!', 28);
        if (m.kind === 'heal') { const h = Math.floor(actor.maxHp * m.pct); actor.hp = Math.min(actor.maxHp, actor.hp + h); this.popup(actor.x, actor.y - 20, '+' + h, '#80ff80'); Audio.sfx('heal'); yield 24; return; }
        if (m.kind === 'buff') { this.buff(actor, 'atk', 0.25); yield 20; return; }
        if (m.kind === 'guardaura') { for (const al of this.aliveEnemies()) { this.buff(al, 'def', 0.25); this.buff(al, 'res', 20); } yield 24; return; }   /* the whole side guarded */
        if (m.kind === 'chaos') { const cands = this.aliveParty().filter(t => !t.status.chaos).sort(() => Math.random() - 0.5).slice(0, 1 + rnd(2)); yield* this.playFx('status', cands); let hit = 0; for (const t of cands) { if (this.tryStatus(t, 'chaos', 0.85)) { t.status.chaos = 2; hit++; this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Chaos!', '#ff80ff'); } else this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Resisted', '#c0c0c0'); } yield this.say(hit ? (hit === 1 ? 'A mind is turned against its own!' : 'Minds are turned against their own!') : 'The party holds its mind.', 35); yield 16; return; }
        if (m.kind === 'call') { // a fallen ball of the ring answers as a new one (any of the four kinds), in its old place
          const dead = this.enemies.filter(x => /Ball$/.test(x.name) && x.dead); if (!dead.length) { yield this.say('...but nothing answers.', 30); return; }
          const slot = pick(dead); const kind = pick(['Anger Ball', 'Guardian Ball', 'Refresh Ball', 'Thunder Ball']); this.bonusExp = (this.bonusExp || 0) + (slot.exp || 0); this.bonusCoins = (this.bonusCoins || 0) + (slot.coins || 0);
          const nb = new Enemy(kind, slot.idx); nb.x = slot.x; nb.y = slot.y; this.enemies[this.enemies.indexOf(slot)] = nb; Audio.sfx('summon'); yield* this.playFx('status', [nb]); yield this.say((/^[AEIOU]/.test(kind) ? 'An ' : 'A ') + kind + ' answers the call!', 40);
          yield 6; yield* this.execute(nb, this.enemyChoose(nb)); yield* this.deathBursts(); return; }   /* the called ball acts the moment it arrives */
        if (m.kind === 'kamikaze') { // the ball hurls itself at the party and bursts
          const ts = this.targetsInRange(this.front, target, m.range); yield* this.playFx('fire', ts.map(t => t.t)); for (const t of ts) { if (this.evade(actor, t.t, true)) continue; this.applyDamage(t.t, this.magic(actor, t.t, m.el, m.base, t.mult)); }
          actor.hp = 0; if (!actor.dead && typeof Bestiary !== 'undefined') Bestiary.kill(actor.dbName || actor.name); actor.dead = true; actor.burst = true; Audio.sfx('boom'); Engine.doShake(12); yield this.say(actor.name + ' blows itself apart!', 40); return; }
        if (m.kind === 'djinnblast') { yield* this.playFx('wind', [target]); const dmg = this.physical(actor, target, { mult: 1.2 }); this.applyDamage(target, dmg); if (target.alive && target.djinn.length) { this.djinnScatter(target, 2, 40); yield this.say(target.name + "'s Djinn are shaken - their skills rest and the summon gauge drops!", 35); } yield 20; return; }
        if (m.kind === 'djinnstorm') { yield* this.playFx('wind', this.aliveParty()); for (const mm of this.aliveParty()) this.djinnScatter(mm, 3, 100); yield this.say('All Djinn were scattered! Skills rest and the summon gauges empty!', 40); return; }
        if (m.kind === 'status') { const ts = this.targetsInRange(this.front, target, m.range); yield* this.playFx('status', ts.map(t => t.t)); for (const t of ts) this.tryStatus(t.t, m.status, 0.5); yield 20; return; }
        if (m.kind === 'magic') { const ts = this.targetsInRange(this.front, target, m.range); yield* this.playFx(['earth', 'water', 'fire', 'wind', 'status'][m.el], ts.map(t => t.t)); for (const t of ts) { if (this.evade(actor, t.t, true)) continue; this.applyDamage(t.t, this.magic(actor, t.t, m.el, m.base, t.mult)); if (m.status) this.tryStatus(t.t, m.status, m.status === 'down' ? 0.1 : 0.35); } yield 24; return; }
        // epa
        if (this.evade(actor, target)) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Miss', '#c0c0c0'); yield 20; return; }
        const dmg = this.physical(actor, target, { el: m.el, mult: m.mult, add: m.add, pierce: m.pierce }); this.applyDamage(target, dmg); Audio.sfx('hit2'); if (m.status) this.tryStatus(target, m.status, m.status === 'down' ? 0.12 : 0.4); yield 24; return;
      }
      // normal attack
      if (this.evade(actor, target)) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Miss', '#c0c0c0'); Audio.sfx('miss'); yield this.say(actor.name + ' attacks... but misses!', 26); return; }
      const crit = chance(0.08 + (isC ? actor.lck() : actor.lck) * 0.003);
      const wEl = isC && actor.equip.weapon && ITEM_DB[actor.equip.weapon].pow ? ELNAME.indexOf(Object.keys(ITEM_DB[actor.equip.weapon].pow)[0]) : undefined;
      const dmg = this.physical(actor, target, { crit, el: wEl });
      yield this.say(actor.name + ' attacks!' + (crit ? ' Critical hit!' : ''), 8);
      this.applyDamage(target, dmg, { from: actor, crit }); Audio.sfx(crit ? 'crit' : 'hit');
      // Reflux counter
      if (!isC && target.status.counter && target.alive) { yield 12; yield this.say(target.name + ' counters!', 20); yield* this.animAttack(target, actor); this.applyDamage(actor, this.physical(target, actor, { el: 2, add: 0, mult: 1 })); Audio.sfx('hit'); }
      yield 24; return;
    }
    if (cmd.type === 'psy') return yield* this.castPsy(actor, cmd.psy, cmd.target);
    if (cmd.type === 'djinn') return yield* this.unleashDjinn(actor, cmd.djinn, cmd.target);
    if (cmd.type === 'summon') return yield* this.doSummon(actor, cmd.summon);
    if (cmd.type === 'item') {
      const it = ITEM_DB[cmd.item]; if (!G.inventory.has(cmd.item)) { yield this.say('The item is gone!', 25); return; }
      // gear with a use effect is not spent, but each use may break it (the guides' 'It might break if used in battle')
      const gear = !!it.gearUse; const spend = () => { if (!gear) { G.inventory.remove(cmd.item); return; } if (Math.random() < (it.breakChance || 0.25)) { if (cmd.equipped && actor.equip && actor.equip[cmd.equipped] === cmd.item) actor.equip[cmd.equipped] = null; else G.inventory.remove(cmd.item); this.broke = (ITEM_DB[cmd.item].n || cmd.item) + ' broke!'; } };
      const shown = ITEM_DB[cmd.item].n || cmd.item;
      if (it.battle) { spend(); yield this.say(actor.name + ' uses the ' + shown + '!', 25); const b = it.battle; let target = cmd.target; if (!target.alive) target = this.retarget(this.enemies, target); if (!target) return; const ts = this.targetsInRange(this.enemies, target, b.range || 1); if (b.dmg) { yield* this.playFx(['earth', 'water', 'fire', 'wind'][b.el], ts.map(t => t.t)); for (const t of ts) this.applyDamage(t.t, this.magic(actor, t.t, b.el, b.dmg, t.mult)); } if (b.status) { yield* this.playFx('status', ts.map(t => t.t)); for (const t of ts) this.tryStatus(t.t, b.status, 0.6); } if (b.debuff) { yield* this.playFx('status', ts.map(t => t.t)); for (const t of ts) this.buff(t.t, b.debuff[0], b.debuff[1]); } yield 24; if (this.broke) { yield this.say(this.broke, 30); this.broke = null; } return; }
      if (it.use && it.use.buff) { spend(); const [stat, amt, all] = it.use.buff; yield this.say(actor.name + ' uses the ' + shown + '!', 25); const who = all ? this.front.filter(m => m.alive) : [cmd.target]; for (const m of who) this.buff(m, stat, amt); yield 24; if (this.broke) { yield this.say(this.broke, 30); this.broke = null; } return; }
      const r = useItemOn(cmd.item, cmd.target); if (r && !r.fail) { spend(); Audio.sfx('heal'); this.popup(this.posOf(cmd.target).x, this.posOf(cmd.target).y - 20, 'OK', '#80ff80'); } yield this.say(actor.name + ' uses the ' + shown + '. ' + (r ? r.msg : ''), 40); if (this.broke) { yield this.say(this.broke, 30); this.broke = null; } return;
    }
  }
  retarget(list, old) { const alive = list.filter(t => t.alive); if (!alive.length) return null; if (!old) return alive[0]; const oi = list.indexOf(old); return alive.sort((a, b) => Math.abs(list.indexOf(a) - oi) - Math.abs(list.indexOf(b) - oi))[0]; }
  evade(att, def, isMagic) {
    if (def.status.immune) return true;
    if (isMagic) return false;
    let hit = 0.95; if (att.status.delusion) hit -= 0.45; const da = def.agi(), aa = att.agi(); if (da > aa * 1.5) hit -= 0.15; if (def.status.sleep || def.status.stun) hit = 1;
    return !chance(hit);
  }
  *animAttack(actor, target) {
    if (this.isChar(actor)) {
      const from = this.partyPos(this.front.indexOf(actor)); const to = this.posOf(target);
      const dx = (to.x - from.x) * 0.55, dy = (to.y + 16 - (from.y - 8)) * 0.55;
      for (let t = 0; t <= 6; t++) { this.actorAnim[actor.id] = { pose: 'step', dx: dx * t / 6, dy: dy * t / 6, t: 999 }; yield 1; }
      this.actorAnim[actor.id] = { pose: 'attack', dx, dy, t: 999 }; yield 4;
      this.actorAnim[actor.id] = { pose: 'attack2', dx, dy, t: 999 }; Engine.doFlash(3, '#ffffff'); yield 6;
      for (let t = 6; t >= 0; t--) { this.actorAnim[actor.id] = { pose: 'step', dx: dx * t / 6, dy: dy * t / 6, t: 999 }; yield 1; }
      this.actorAnim[actor.id] = null;
    } else { const ox = actor.x, oy = actor.y; for (let t = 0; t < 5; t++) { actor.y = oy + t * 3; yield 1; } yield 3; for (let t = 5; t >= 0; t--) { actor.y = oy + t * 3; yield 1; } actor.y = oy; }
  }
  *castPsy(actor, name, target) {
    const p = PSY[name]; const isC = this.isChar(actor);
    if (isC) { if (actor.pp < p.pp) { yield this.say('Not enough PP!', 30); return; } actor.pp -= p.pp; } else actor.pp = Math.max(0, actor.pp - p.pp);
    yield this.say(actor.name + ' casts ' + name + '!', 10);
    if (isC) { this.actorAnim[actor.id] = { pose: 'cast', t: 999 }; }
    Audio.sfx('psy'); yield 14;
    const el = psyEl(p);
    const friendlyList = isC ? this.front : this.enemies.filter(e => true), enemyList = isC ? this.enemies : this.front;
    if (p.type === 'heal' || p.type === 'cure' || p.type === 'revive') {
      const ts = p.range === 'all' ? friendlyList.filter(t => t.alive) : [target && (target.alive || p.type === 'revive') ? target : friendlyList.find(t => t.alive)];
      yield* this.playFx('heal', ts);
      for (const t of ts) {
        if (!t) continue;
        if (p.type === 'heal') { if (!t.alive) continue; const h = this.healAmt(actor, el, p.base); const got = isC ? t.heal(h) : (t.hp = Math.min(t.maxHp, t.hp + h), h); this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + got, '#80ff80'); }
        else if (p.type === 'cure') { for (const s of p.cures) delete t.status[s]; this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Cured', '#80ff80'); }
        else if (p.type === 'revive') { if (t.alive) { this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'No effect', '#c0c0c0'); continue; } t.status.down = false; t.hp = Math.floor(mhpOf(t) * p.amt); this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Revived!', '#80ff80'); }
      }
      Audio.sfx('heal'); if (isC) this.actorAnim[actor.id] = null; yield 20; return;
    }
    if (p.type === 'buff') { const ts = p.range === 'all' ? friendlyList.filter(t => t.alive) : [target && target.alive ? target : actor]; yield* this.playFx('buff', ts); for (const t of ts) this.buff(t, p.stat, p.amt); if (isC) this.actorAnim[actor.id] = null; yield 20; return; }
    if (p.type === 'special') { if (p.special === 'djinnstorm') { yield* this.playFx('wind', this.aliveParty()); for (const mm of this.aliveParty()) this.djinnScatter(mm, 3, 100); yield this.say('All Djinn were scattered! Skills rest and the summon gauges empty!', 40); } return; }
    // the class items' Psynergy types (steal, songs, charm, stasis, doom marks...: js/game/class_ext.js)
    if (typeof ClassExt !== 'undefined' && ClassExt.battle[p.type]) { yield* ClassExt.battle[p.type].call(this, actor, p, name, target, { isC, el, friendlyList, enemyList }); if (isC) this.actorAnim[actor.id] = null; yield 20; return; }
    // offensive
    if (!target || !target.alive) target = this.retarget(enemyList, target); if (!target) { if (isC) this.actorAnim[actor.id] = null; return; }
    const wide = !isC && typeof BossGimmicks !== 'undefined' && actor.data && actor.data.gimmick === 'tide' && actor._gim && actor._gim.tide === 'high';   /* Thalassa on the high tide: every spell sweeps the whole party */
    const ts = this.targetsInRange(enemyList, target, wide ? 'all' : p.range); this._sureExtra = false;
    const fxName = p.type === 'break' ? 'status' : p.type === 'status' ? 'status' : p.type === 'debuff' ? 'status' : ['earth', 'water', 'fire', 'wind', 'status'][el];
    yield* this.playFx(fxName, ts.map(t => t.t), name);
    for (const { t, mult } of ts) {
      if (p.type === 'magic') { const dmg = this.magic(actor, t, el, p.base, mult); this.applyDamage(t, dmg, { from: actor }); if (p.status && t.alive) this.tryStatus(t, p.status, p.statusChance || 0.3); }
      else if (p.type === 'epa') { if (this.evade(actor, t)) { this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Miss', '#c0c0c0'); continue; } const dmg = this.physical(actor, t, { el, add: p.add || 0, mult: p.mult || 1, crit: !!(p.crit && chance(p.crit)), pierce: p.pierce }); this.applyDamage(t, dmg, { from: actor }); if (p.drain && dmg > 0) { const h = Math.floor(dmg * 0.5); if (isC) actor.heal(h); else actor.hp = Math.min(actor.maxHp, actor.hp + h); this.popup(this.posOf(actor).x, this.posOf(actor).y - 20, '+' + h, '#80ff80'); } if (p.status && t.alive) this.tryStatus(t, p.status, p.statusChance || 0.3); }
      else if (p.type === 'drain') { const dmg = this.magic(actor, t, el, p.base, mult); if (p.drainPP) { const d = Math.min(t.pp, dmg); t.pp -= d; if (isC) actor.restorePP(d); else actor.pp += d; this.popup(this.posOf(t).x, this.posOf(t).y - 20, '-' + d + 'PP', '#c0a0ff'); } else { this.applyDamage(t, dmg); if (isC) actor.heal(dmg); else actor.hp = Math.min(actor.maxHp, actor.hp + dmg); this.popup(this.posOf(actor).x, this.posOf(actor).y - 20, '+' + dmg, '#80ff80'); } }
      else if (p.type === 'status') {
        if (p.sure) {   // Thalassa's Deep Freeze (the user's rule): its mark is always taken, and one more at most
          const ok = t.alive && !t.status[p.status] && !(p.status === 'down' && t.boss);
          if (t === target) { if (ok) { t.status[p.status] = true; this.popup(this.posOf(t).x, this.posOf(t).y - 20, p.status.charAt(0).toUpperCase() + p.status.slice(1), '#e0e040'); } }
          else if (ok && !this._sureExtra && chance(p.statusChance || 0.6)) { t.status[p.status] = true; this._sureExtra = true; this.popup(this.posOf(t).x, this.posOf(t).y - 20, p.status.charAt(0).toUpperCase() + p.status.slice(1), '#e0e040'); }
        }
        else if (!this.tryStatus(t, p.status, p.statusChance || 0.55)) this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Resisted', '#c0c0c0');
      }
      else if (p.type === 'debuff') { this.buff(t, p.stat, p.amt); }
      else if (p.type === 'break') { t.buffs = { atk: 0, def: 0, agi: 0, res: 0 }; this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Bonuses gone', '#c0c0c0'); }
    }
    Audio.sfx(['earth', 'water', 'fire', 'wind', 'psy'][el]);
    if (isC) this.actorAnim[actor.id] = null; yield 24;
  }
  *unleashDjinn(actor, name, target) {
    const dj = actor.djinn.find(d => d.name === name); const D = DJINN[name]; const fx = D.fx;
    if (!dj) { yield this.say(actor.name + ' does not have ' + name + '.', 25); return; }
    if (!actor.skillReady(name)) { yield this.say(name + ' is still resting.', 25); return; }
    actor.cd[name] = djinnCooldown(name) + 1; // +1: the tick at the end of this turn
    yield this.say(actor.name + ' unleashes ' + name + '!', 10); Audio.sfx('unleash');
    this.actorAnim[actor.id] = { pose: 'cast', t: 999 };
    this.djinnFx = { el: D.el, t: 0, x: this.posOf(actor).x, y: this.posOf(actor).y }; yield 32; this.djinnFx = null;
    const el = D.el;
    if (fx.k === 'epa') {
      if (!target || !target.alive) target = this.retarget(this.enemies, target); if (!target) { this.actorAnim[actor.id] = null; return; }
      yield* this.playFx(['earth', 'water', 'fire', 'wind'][el], [target]);
      let dmg = this.physical(actor, target, { el, add: fx.add, mult: fx.mult, pierce: fx.pierce }); if (fx.doubleChance && chance(fx.doubleChance)) dmg *= 2;
      this.applyDamage(target, dmg);
      if (fx.drain) { const h = Math.floor(dmg * fx.drain); actor.heal(h); this.popup(this.posOf(actor).x, this.posOf(actor).y - 20, '+' + h, '#80ff80'); }
      if (fx.status && target.alive) this.tryStatus(target, fx.status, fx.chance || 0.6);
      if (fx.statusAll) for (const e of this.aliveEnemies()) this.tryStatus(e, fx.statusAll, 0.5);
      if (fx.debuff) this.buff(target, fx.debuff.stat, fx.debuff.amt);
      if (fx.flee && chance(fx.flee) && !target.boss) { target.hp = 0; target.dead = true; target.fledAway = true; this.popup(target.x, target.y - 28, 'Blown away!', '#c0c0ff'); }
    }
    else if (fx.k === 'heal') { const t = target && target.alive && this.isChar(target) ? target : actor; const h = Math.floor(mhpOf(t) * fx.pct); yield* this.playFx('heal', [t]); t.heal(h); this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + h, '#80ff80'); }
    else if (fx.k === 'healAll') { const ts = this.aliveParty(); yield* this.playFx('heal', ts); for (const t of ts) { const h = Math.floor(t.maxHp() * fx.pct); t.heal(h); this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + h, '#80ff80'); } }
    else if (fx.k === 'revive') { const t = (target && this.isChar(target)) ? target : this.front.find(m => !m.alive); if (!t || t.alive) { yield this.say('No effect...', 25); } else { yield* this.playFx('heal', [t]); t.status.down = false; t.hp = Math.floor(t.maxHp() * fx.pct); this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Revived!', '#80ff80'); } }
    else if (fx.k === 'reviveAll') { for (const t of this.reviveList()) if (!t.alive) { t.status.down = false; t.hp = Math.floor(t.maxHp() * fx.pct); this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Revived!', '#80ff80'); } yield* this.playFx('heal', this.front); }
    else if (fx.k === 'buffAll') { const ts = this.aliveParty(); yield* this.playFx('buff', ts); for (const t of ts) this.buff(t, fx.stat, fx.amt); }
    else if (fx.k === 'debuffAll') { const ts = this.aliveEnemies(); yield* this.playFx('status', ts); for (const t of ts) this.buff(t, fx.stat, fx.amt); }
    else if (fx.k === 'shield') { for (const t of this.aliveParty()) t.status.shield = fx.pct; yield* this.playFx('buff', this.aliveParty()); yield this.say('The party is shielded!', 25); }
    else if (fx.k === 'status') { if (!target || !target.alive) target = this.retarget(this.enemies, target); if (target) { yield* this.playFx('status', [target]); if (!this.tryStatus(target, fx.s, 0.7)) this.popup(target.x, target.y - 20, 'Resisted', '#c0c0c0'); } }
    else if (fx.k === 'statusAll') { const ts = this.aliveEnemies(); yield* this.playFx('status', ts); for (const t of ts) this.tryStatus(t, fx.s, 0.5); }
    else if (fx.k === 'cureAll') { for (const t of this.aliveParty()) for (const s of ['poison', 'venom', 'stun', 'sleep', 'delusion', 'seal', 'haunt', 'curse']) delete t.status[s]; yield* this.playFx('heal', this.aliveParty()); yield this.say('Ailments were cured!', 25); }
    else if (fx.k === 'pp') { const t = target && target.alive && this.isChar(target) ? target : actor; const p = Math.floor(t.maxPp() * fx.pct); t.restorePP(p); this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + p + 'PP', '#c0a0ff'); }
    else if (fx.k === 'ppAll') { for (const t of this.aliveParty()) { const p = Math.floor(t.maxPp() * fx.pct); t.restorePP(p); this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + p + 'PP', '#c0a0ff'); } }
    else if (fx.k === 'kite') { const t = target && target.alive && this.isChar(target) ? target : actor; t.status.kite = true; yield this.say(t.name + ' will act twice next turn!', 30); }
    else if (fx.k === 'immune') { const t = target && target.alive && this.isChar(target) ? target : actor; t.status.immune = true; yield this.say(t.name + ' is shielded from all harm!', 30); }
    else if (fx.k === 'eddy') { for (const m of this.aliveParty()) for (const k in m.cd) { if (k !== name && --m.cd[k] <= 0) delete m.cd[k]; } yield this.say("The party's Djinn skills recover more quickly!", 30); }
    else if (fx.k === 'counter') { actor.status.counter = true; yield this.say(actor.name + ' prepares to counter!', 30); }
    else if (fx.k === 'lull') { yield this.say('The turn ends immediately!', 30); this.actorAnim[actor.id] = null; return 'lull'; }
    else if (fx.k === 'ppdmg') { const ts = this.aliveEnemies(); yield* this.playFx('fire', ts); for (const t of ts) { const d = Math.min(t.pp, fx.amt); t.pp -= d; this.popup(t.x, t.y - 20, '-' + d + 'PP', '#c0a0ff'); } }
    else if (fx.k === 'meld') { if (!target || !target.alive) target = this.retarget(this.enemies, target); const ally = this.aliveParty().filter(m => m !== actor).sort((a, b) => b.atk() - a.atk())[0] || actor; yield this.say(ally.name + ' joins the attack!', 25); yield* this.animAttack(ally, target); const bonus = Math.floor(actor.atk() * 0.25); const relAtk = Math.max(0, ally.atk() + bonus - target.def()); const rp = clamp(ally.power(0) - target.resist(0), -200, 200); this.applyDamage(target, Math.max(1, Math.floor(relAtk / 2 * (1 + rp / 400))) + rnd(4)); Audio.sfx('hit2'); }
    else if (fx.k === 'mold') { if (!target || !target.alive) target = this.retarget(this.enemies, target); const others = this.aliveEnemies().filter(e => e !== target); const victim = others.length ? pick(others) : target; yield this.say(target.name + ' is forced to attack ' + victim.name + '!', 30); const relAtk = Math.max(0, target.atk() - victim.def()); const rp = clamp(target.power(0) - victim.resist(0), -200, 200); this.applyDamage(victim, Math.max(1, Math.floor((relAtk / 2 + fx.add) * (1 + rp / 400))) + rnd(4)); Audio.sfx('hit2'); }
    this.actorAnim[actor.id] = null; yield 24;
  }
  isAlex(t) { return !!(t && t.alive && ((t.id === 'Alex' && this.isChar(t)) || (t.rival && t.ch && t.ch.id === 'Alex'))); }
  *doSummon(actor, name) {
    const S = SUMMONS[name]; actor.limit = 0; this._summoning = true; this._hit = { kind: 'summon', el: S.el, from: actor }; try { yield* this.doSummonInner(actor, name, S); } finally { this._summoning = false; } }
  *doSummonInner(actor, name, S) {
    yield this.say(actor.name + ' summons ' + name + '!', 10); Audio.sfx('summon');
    this.actorAnim[actor.id] = { pose: 'cast', t: 999 };
    this.summonBanner = { name, el: S.el, t: 0 };
    for (let t = 0; t < 70; t++) { this.summonBanner.t = t; if (t === 40) Engine.doFlash(10, tint(ELCOLOR[S.el], 0.5)); if (t === 44) Engine.doShake(20); yield 1; }
    this.summonBanner = null;
    if (S.heal) { for (const t of this.aliveParty()) { const h = this.healAmt(actor, S.el, S.base); t.heal(h); t.status.regen = 2; this.popup(this.posOf(t).x, this.posOf(t).y - 20, '+' + h, '#80ff80'); } yield this.say('The party is bathed in restoring light!', 30); }
    else {
      const ts = this.aliveEnemies();
      yield* this.playFx(['earth', 'water', 'fire', 'wind'][S.el], ts, name);
      for (const e of ts) { const base = S.base + (typeof e.maxHp === 'function' && !e.maxHp.valueOf ? e.maxHp() : (e.maxHpV ? +e.maxHpV() : e.maxHp())) * S.hpPct / 100; const dmg = this.magic(actor, e, S.el, base, 1); this.applyDamage(e, dmg); if (S.status && e.alive) this.tryStatus(e, S.status, S.chance || 0.5); if (S.debuff && e.alive) this.buff(e, S.debuff.stat, S.debuff.amt); if (S.ppDrain && e.alive) e.pp = Math.max(0, e.pp - Math.floor(e.maxPp * S.ppDrain)); }
      if (S.buffParty) for (const t of this.aliveParty()) this.buff(t, S.buffParty.stat, S.buffParty.amt);
      if (S.missile) this.daedalus = actor;
      if (S.reviveAll) { for (const m of this.party.members) { if (!m.alive) { m.status.down = false; m.hp = m.maxHp(); } else m.heal(9999); } yield this.say('Everyone is fully restored!', 30); }
    }
    // power boost
    const n = S.req.reduce((x, y) => x + y, 0); const boost = n >= 4 ? 100 : n === 3 ? 60 : n === 2 ? 30 : 10;
    actor.tempPower = actor.tempPower || [0, 0, 0, 0]; for (let el = 0; el < 4; el++) if (S.req[el]) actor.tempPower[el] = Math.min(200 - actor.data.pow[el] - 25, (actor.tempPower[el] || 0) + boost);
    this.popup(this.posOf(actor).x, this.posOf(actor).y - 28, ELNAME[S.el] + ' Power up', tint(ELCOLOR[S.el], 0.4));
    this.actorAnim[actor.id] = null; yield 24;
  }
  *playFx(kind, targets, name) { const fx = BattleFX.make(kind, targets.map(t => this.posOf(t)), name); this.fx.push(fx); Audio.sfx({ earth: 'earth', water: 'water', fire: 'fire', wind: 'wind', heal: 'heal', buff: 'buff', status: 'status' }[kind] || 'psy'); while (!fx.done) yield 1; }
  // ---------- end ----------
  *finish() {
    this.menu = null;
    BattleScene.last = { enemies: this.enemies.map(e => ({ name: e.name, hp: Math.max(0, e.hp), maxHp: +e.maxHp, dead: !!e.dead })), turn: this.turn, won: this.aliveEnemies().length === 0 };   /* what a story can read afterwards: how the foes stood when it ended (the Wise One pays for damage even in a loss) */
    if (this.aliveEnemies().length === 0) {
      Audio.play('victory');
      let exp = 0, coins = 0; const drops = [];
      for (const e of this.enemies) { if (e.fledAway) continue; exp += e.exp; coins += e.coins; if (e.drop && chance(Math.max(0.05, 1 / (e.drop[1] * 8)))) drops.push(e.drop[0]); }
      exp += this.bonusExp || 0; coins += this.bonusCoins || 0;   /* the balls the Star Magician replaced mid-fight */
      if (this.opts.expMult) exp = Math.floor(exp * this.opts.expMult);
      for (const m of this.front) { this.actorAnim[m.id] = m.alive ? { pose: 'win', t: 999 } : null; }
      yield this.say('Victory!', 50);
      const alive = this.party.members.filter(m => m.alive);
      const share = exp; // each character receives the full experience, as in the original
      yield this.say('Gained ' + exp + ' experience and ' + coins + ' coins!', 60);
      this.party.coins += coins;
      for (const m of this.front) {
        if (!m.alive) continue;
        const ups = m.gainExp(share);
        for (const u of ups) {
          Audio.sfx('levelup'); yield this.say(m.name + ' reached level ' + u.level + '!', 50);
          const after = m.psynergy(); const learned = after.filter(p => !u.before.includes(p));
          for (const p of learned) yield this.say(m.name + ' learned ' + p + '!', 45);
        }
      }
      // reserve members get half exp
      for (const m of this.back) if (m.alive) m.gainExp(Math.floor(share / 2));
      for (const d of drops) { G.inventory.add(d); Audio.sfx('item'); yield this.say('Found ' + d + '!', 45); }
      this.result = 'win';
    } else { if (this.opts.canLose) Audio.stop(); else Audio.play('gameover'); yield this.say('The party was defeated...', 90); this.result = 'lose'; if (this.opts.canLose) { this.party.active = this.front0.slice(); this.party.reserve = this.back0.slice(); } }   // the game over theme starts as the party falls, not after the fade; a bout the story survives leaves the party in the order it went in
    for (const m of this.party.members) m.clearBattleState();
    yield Engine.fadeOut(20);
    Engine.pop();
    if (this.opts.onEnd) this.opts.onEnd(this.result);
  }
  // ---------- update / draw ----------
  update() {
    this.frame++;
    if (this.auto && !this.menu && Input.pressed('b')) { this.autoStop = true; Audio.sfx('cancel'); }
    if (this.co) this.co.update();
    if (this.msgTimer > 0) this.msgTimer--;
    for (const p of this.popups) p.t++; this.popups = this.popups.filter(p => p.t < 40);
    for (const f of this.fx) f.update(); this.fx = this.fx.filter(f => !f.done);
    for (const e of this.enemies) { if (e.shake > 0) e.shake--; if (e.flash > 0) e.flash--; if (e.dead && e.alpha > 0) e.alpha -= 0.08; }
    for (const id in this.actorAnim) { const a = this.actorAnim[id]; if (a && a.t !== 999) { a.t--; if (a.t <= 0) this.actorAnim[id] = null; } }
  }
  drawBg(g) {
    // the place's own scene, when one is drawn for it
    if (typeof BattleBgs !== 'undefined') { const scene = BattleBgs.pick(this.mapId, this.bg); const pic = scene && BattleBgs.render(scene, Math.floor(this.frame / 20) % 2); if (pic) { g.drawImage(pic, 0, 0); return; } }
    const bgs = { grass: ['#78b8f0', '#c8e8ff', '#5cb04c', '#3c8040'], cave: ['#302838', '#484058', '#5a5060', '#3a3048'], sand: ['#f0d8a0', '#ffe8c0', '#ecd890', '#c8a860'], snow: ['#a0c0e0', '#e0f0ff', '#f0f4ff', '#b8c8e0'], water: ['#3878d8', '#60a0f0', '#2860c0', '#204890'], lava: ['#402020', '#803020', '#584040', '#a04020'], temple: ['#403050', '#6050a0', '#c8b898', '#a09070'], forest: ['#2c6c30', '#48a048', '#3c8c3c', '#2c5c30'], swamp: ['#405838', '#587848', '#587848', '#384830'], ship: ['#78b8f0', '#c8e8ff', '#b08858', '#886038'], lighthouse: ['#2848a0', '#6080d0', '#c0c8e0', '#8898c0'], ruins: ['#605878', '#a098b8', '#b0a890', '#8a8270'], dark: ['#100818', '#301838', '#282030', '#181020'] };
    const b = bgs[this.bg] || bgs.grass;
    Gfx.vgrad(g, 0, 0, SCREEN_W, 96, b[0], b[1], 24);
    Gfx.rect(g, 0, 96, SCREEN_W, 64, b[2]);
    Gfx.rect(g, 0, 96, SCREEN_W, 2, tint(b[2], 0.3));
    const r = seededRandom(hashStr(this.bg));
    for (let i = 0; i < 30; i++) { const x = Math.floor(r() * SCREEN_W), y = 100 + Math.floor(r() * 56); Gfx.rect(g, x, y, 2 + Math.floor(r() * 4), 1, b[3]); }
    if (this.bg === 'grass' || this.bg === 'forest') { for (let i = 0; i < 6; i++) { const x = 10 + i * 42 + Math.floor(r() * 20); Gfx.ellipse(g, x, 92, 14, 6, '#3c8c3c'); Gfx.ellipse(g, x, 88, 9, 6, '#48a048'); } }
    if (this.bg === 'cave' || this.bg === 'dark') { for (let i = 0; i < 8; i++) { const x = i * 32 + Math.floor(r() * 10); Gfx.tri(g, x, 96, x + 8, 60 + Math.floor(r() * 20), x + 18, 96, '#3a3048'); } }
    if (this.bg === 'snow') { for (let i = 0; i < 5; i++) { const x = i * 55 + Math.floor(r() * 20); Gfx.tri(g, x, 96, x + 20, 50, x + 44, 96, '#b8c8e0'); Gfx.tri(g, x + 12, 66, x + 20, 50, x + 28, 66, '#ffffff'); } }
    if (this.bg === 'sand') { for (let i = 0; i < 4; i++) { const x = i * 70 + Math.floor(r() * 20); Gfx.ellipse(g, x, 96, 40, 10, '#d8c070'); } }
    if (this.bg === 'water' || this.bg === 'ship') { for (let i = 0; i < 12; i++) Gfx.hline(g, Math.floor(r() * SCREEN_W), 70 + Math.floor(r() * 24), 6, '#a0d0ff'); }
    if (this.bg === 'lighthouse' || this.bg === 'temple' || this.bg === 'ruins') { for (let i = 0; i < 5; i++) { const x = 20 + i * 50; Gfx.rect(g, x, 40, 8, 56, tint(b[2], 0.1)); Gfx.rect(g, x - 2, 38, 12, 4, b[3]); } }
    if (this.bg === 'lava') { for (let i = 0; i < 10; i++) Gfx.rect(g, Math.floor(r() * SCREEN_W), 100 + Math.floor(r() * 50), 6, 2, '#f08030'); }
  }
  draw(g) {
    this.drawBg(g);
    // enemies
    for (const e of this.enemies) {
      if (e.alpha <= 0) continue;
      const spr = e.sprite(Math.floor(this.frame / 30) % 2);
      const ox = e.shake > 0 ? (rnd(5) - 2) : 0;
      g.globalAlpha = e.alpha;
      g.drawImage(spr, Math.round(e.x - spr.width / 2) + ox, Math.round(e.y - spr.height + 12));
      if (e.flash > 0 && this.frame % 2) { g.globalAlpha = 0.6; g.drawImage(Gfx.silhouette(spr, '#ffffff'), Math.round(e.x - spr.width / 2) + ox, Math.round(e.y - spr.height + 12)); }
      g.globalAlpha = 1;
      // status icons
      let sx = e.x - 10; for (const s of ['poison', 'venom', 'stun', 'sleep', 'delusion', 'seal', 'haunt', 'curse']) if (e.status[s]) { Gfx.rect(g, sx, e.y + 14, 5, 5, { poison: '#a040c0', venom: '#602080', stun: '#e0e040', sleep: '#8080e0', delusion: '#a0a0a0', seal: '#c04040', haunt: '#c060e0', curse: '#404040' }[s]); sx += 6; }
    }
    // party sprites
    this.front.forEach((m, i) => {
      const p = this.partyPos(i); const an = this.actorAnim[m.id];
      let pose = m.alive ? 'idle' : 'down';
      if (an) pose = an.pose; else if (m.alive && Math.floor(this.frame / 40) % 2) pose = 'idle';
      if (pose === 'cast' && an && an.t === 999 && Math.floor(this.frame / 10) % 2) pose = 'cast2';   // the weapon swings up and down while the psynergy gathers
      const spr = Sprites.battle(m.battleLook(), pose, Math.floor((this.frame + i * 11) / 22) % 3);
      const dx = an ? an.dx || 0 : 0, dy = an ? an.dy || 0 : 0;
      g.drawImage(spr, Math.round(p.x - spr.width / 2 + dx), Math.round(p.y - spr.height + 4 + dy));
      let sx = p.x - 10; for (const s of ['poison', 'venom', 'stun', 'sleep', 'delusion', 'seal', 'haunt', 'curse', 'chaos']) if (m.status[s]) { Gfx.rect(g, sx, p.y + 6, 5, 5, { poison: '#a040c0', venom: '#602080', stun: '#e0e040', sleep: '#8080e0', delusion: '#a0a0a0', seal: '#c04040', haunt: '#c060e0', curse: '#404040', chaos: '#ff60ff' }[s]); sx += 6; }
    });
    // the rear guard's fallen, small and pale at the edge of the line - they can be revived from here
    this.back.filter(m => !m.alive).forEach((m) => { const p = this.backPos(m); const spr = Sprites.battle(m.battleLook(), 'down', 0); g.globalAlpha = this.cursorTarget === m ? 0.9 : 0.45; g.drawImage(spr, Math.round(p.x - spr.width / 2), Math.round(p.y - spr.height + 4)); g.globalAlpha = 1; });
    // djinn unleash glow
    if (this.djinnFx) { const d = this.djinnFx; d.t++; const dj = typeof Foes !== 'undefined' && Foes.sprite(['Venus', 'Mercury', 'Mars', 'Jupiter'][d.el] + ' Djinni', Math.floor(d.t / 6) % 2); if (dj) { const hop = Math.round(Math.sin(Math.min(1, d.t / 28) * Math.PI) * 26); g.drawImage(dj, Math.round(d.x - dj.width / 2 + 10), Math.round(d.y - dj.height + 8 - hop)); }   // the Djinni itself springs up from its Adept
      for (let i = 0; i < 8; i++) { const a = i * 0.785 + d.t * 0.2; Gfx.circle(g, d.x + Math.cos(a) * (6 + d.t), d.y - 10 + Math.sin(a) * (4 + d.t * 0.6), 2, ELCOLOR[d.el]); } }
    // the Cradle's superbosses wear their state - over the party, under the popups: a line above the foe, and a bar for
    // the ones with a gauge (Terragon's charge, Ignis's heat, Alkahest's seal)
    if (typeof BossGimmicks !== 'undefined') for (const e of this.enemies) {
      if (!e.alive || !e.data || !e.data.gimmick) continue; const lb = BossGimmicks.label(this, e); const ga = BossGimmicks.gauge(this, e); const spr = e.sprite(0);
      const top = Math.max(42, Math.round(e.y - spr.height + 12) - 14); const x = Math.round(e.x);
      if (lb) { const w = Font.width(lb) + 8; UI.panel(g, x - w / 2, top - 2, w, 12); Font.draw(g, lb, x, top, '#ffe0a0', { align: 'center' }); }
      if (ga) { UI.bar(g, x - 30, top + 11, 60, 4, ga.frac, ga.col, '#101830'); Font.draw(g, ga.text, x + 34, top + 8, ga.col, { outline: '#101020' }); }
    }
    // effects
    for (const f of this.fx) f.draw(g);
    // popups
    for (const p of this.popups) { const y = p.y - Math.min(12, p.t * 1.2); Font.draw(g, p.text, p.x, y, p.col, { outline: '#101020' }); }
    // summon banner
    if (this.summonBanner) { const b = this.summonBanner; g.fillStyle = 'rgba(0,0,0,' + Math.min(0.7, b.t / 20) + ')'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      // the summoned one rises into the sky above the field while its name is called along the bottom
      const pic = typeof BattleSummons !== 'undefined' && b.t > 6 ? BattleSummons.sprite(b.name, Math.floor(b.t / 10) % 2) : null;
      if (pic) { const k = Math.min(1, (b.t - 6) / 16); const rise = Math.round((1 - k) * 36); g.globalAlpha = k; g.drawImage(pic, Math.round(120 - pic.width / 2), 4 + rise); g.globalAlpha = 1; }
      const w = Math.min(SCREEN_W, b.t * 12); Gfx.rect(g, 120 - w / 2, 112, w, 22, ELCOLOR[b.el]); Gfx.rect(g, 120 - w / 2, 114, w, 18, shade(ELCOLOR[b.el], 0.6)); if (b.t > 15) Font.draw(g, b.name.toUpperCase(), 120, 119, '#ffffff', { align: 'center', outline: '#000000' });
      if (!pic && b.t > 30) { const s = Math.min(1, (b.t - 30) / 15); BattleFX.drawSummonFigure(g, b.name, b.el, 120, 100, s); } }
    // status header
    if (this.menu || this.cursorTarget) {
      this.front.forEach((m, i) => {
        const w = Math.floor(232 / this.front.length), x = 4 + i * w;
        UI.window(g, x, 2, w - 2, 36, { c0: m === this.current ? '#3060c0' : '#2048b0' });
        Font.draw(g, m.name, x + 4, 4, m.alive ? '#ffffff' : '#ff8080');
        Font.draw(g, 'HP', x + 4, 12, '#a0c0ff'); Font.draw(g, String(m.hp), x + w - 6, 12, m.hp < m.maxHp() * 0.25 ? '#ff8080' : '#ffffff', { align: 'right' });
        Font.draw(g, 'PP', x + 4, 20, '#a0c0ff'); Font.draw(g, String(m.pp), x + w - 6, 20, '#ffffff', { align: 'right' });
        if (m.summon) UI.gauge(g, x + 4, 29, w - 10, 6, (m.limit || 0) / 100, this.frame);
      });
    }
    // Aiming, drawn after the party's boxes so neither the arrow nor the name ends up behind them - enemies stand
    // high on the screen and the top of the field is where the status windows live.
    if (this.cursorTarget) {
      const tc = this.cursorTarget; const bob = Math.floor(this.frame / 8) % 2;
      const targets = this.cursorSide === 'party' ? [tc] : this.targetsInRange(this.enemies, tc, this.cursorRange || 1).map(x => x.t);
      for (const tt of targets) { const pp = this.posOf(tt); const main = tt === tc; Gfx.tri(g, pp.x - 4, pp.y - 30 - bob, pp.x + 4, pp.y - 30 - bob, pp.x, pp.y - 25 - bob, main ? '#ffe040' : '#ffffff'); }
    }
    if (this.cursorTarget) {
      const t = this.cursorTarget, nm = t.name, foe = !this.isChar(t);
      // a foe you have met before shows what it fears - the bestiary earns its keep in the middle of a fight
      let weak = null;
      if (foe && typeof Bestiary !== 'undefined' && t.data && Bestiary.known(t.data.n) && (G.bestiary[t.data.n].killed || 0) > 0) { const wi = Bestiary.weakness(t.data); if (wi >= 0) weak = ['Venus', 'Mercury', 'Mars', 'Jupiter'][wi]; }
      const w = Math.max(80, Font.width(nm) + (weak ? Font.width('Weak: ' + weak) + 30 : 20));
      UI.window(g, 120 - w / 2, foe ? 136 : 140, w, foe ? 22 : 18);
      if (weak) { Font.draw(g, nm, 120 - w / 2 + 8, foe ? 140 : 144, '#ffffff'); Font.draw(g, 'Weak: ' + weak, 120 + w / 2 - 8, 140, tint(ELCOLOR[['Venus', 'Mercury', 'Mars', 'Jupiter'].indexOf(weak)], 0.5), { align: 'right' }); }
      else Font.draw(g, !foe && !this.front.includes(t) ? nm + ' (rear guard)' : nm, 120, foe ? 140 : 144, '#ffffff', { align: 'center' });
      if (foe) UI.bar(g, 120 - 28, 151, 56, 3, t.hp / t.maxHp, '#60e060');
    }
    if (this.auto && !this.menu) { const t = this.autoStop ? 'AUTO stopping...' : 'AUTO  X: stop'; UI.panel(g, SCREEN_W - Font.width(t) - 14, 2, Font.width(t) + 12, 14); Font.draw(g, t, SCREEN_W - 8, 5, this.autoStop ? '#ffc080' : '#ffe060', { align: 'right' }); }
    // message
    if (this.msgTimer > 0 || (this.msg && !this.menu && !this.cursorTarget && this.co && !this.co.done)) { UI.window(g, 4, 138, SCREEN_W - 8, 20); Font.draw(g, this.msg, 12, 144, '#ffffff'); }
    // menu
    if (this.menu) {
      const isMain = this.menuKind === 'main';
      if (isMain) { UI.window(g, 4, 116, 116, 42); this.menu.draw(g); }
      else { UI.window(g, 4, 104, 132, 54); this.menu.draw(g); UI.window(g, 138, 104, 98, 54); const lines = Font.wrap(this.subDesc || '', 88); lines.slice(0, 4).forEach((l, i) => Font.draw(g, l, 142, 109 + i * 10, '#e0e8ff')); }
      if (isMain && this.current) { const c = this.current; UI.window(g, 122, 116, 114, 42); Font.draw(g, Font.fit(c.name, 44), 127, 119, '#ffe080'); Font.draw(g, Font.fit(c.className(), 58), 231, 119, '#ffe080', { align: 'right' }); Font.draw(g, 'HP ' + c.hp + '/' + c.maxHp(), 127, 128, '#ffffff'); Font.draw(g, 'T' + this.turn, 231, 128, '#c0d0ff', { align: 'right' }); Font.draw(g, 'PP ' + c.pp + '/' + c.maxPp(), 127, 137, '#ffffff'); if (c.summon) { Font.draw(g, Font.fit(c.summon, 56), 127, 146, c.limitReady() ? '#ffe060' : '#c0d0ff'); UI.gauge(g, 186, 147, 45, 6, (c.limit || 0) / 100, this.frame); } else Font.draw(g, 'No summon', 127, 146, '#8090b0'); }
    }
  }
}
