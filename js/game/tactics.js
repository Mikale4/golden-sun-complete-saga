// ---------- Auto-battle tactician ----------
// Plans one party member's action with full knowledge of the battle: everyone's current HP/PP and ailments, what the
// other party members have already queued this turn (so two people never heal the same ally, revive the same body or
// stack the same buff), the damage every option is expected to deal to every enemy (the battle's own formulas, minus the
// random roll), which enemies are already going to die from queued actions (no overkill), and how hard the enemies can
// hit each ally in the coming round (so healing is pre-emptive, not just reactive).
'use strict';
(function () {
  const P = BattleScene.prototype;
  const capStat = (v) => clamp(v, -200, 200);

  // ---- the turn plan: what is already queued by earlier commands this turn ----
  P.resetPlan = function () { this.plan = { heal: new Map(), healFast: new Map(), revive: new Set(), dmg: new Map(), hits: new Map(), buffs: new Set(), shield: false, cure: new Set(), summons: 0, status: new Set() }; };
  // the Cradle's superbosses (BossGimmicks): what a kind of blow is worth against them right now
  P.gimMult = function (t, kind, el) { return typeof BossGimmicks !== 'undefined' && t && t.data && t.data.gimmick ? BossGimmicks.estMult(this, t, kind, el, (this.plan && this.plan.hits && this.plan.hits.get(t)) || 0) : 1; };
  P.notePlan = function (ch, cmd) {
    if (!this.plan) this.resetPlan(); if (!cmd || typeof cmd !== 'object') return; const pl = this.plan;
    const addDmg = (t, d) => { if (t) pl.dmg.set(t, (pl.dmg.get(t) || 0) + d);  pl.hits.set(t, (pl.hits.get(t) || 0) + 1); };
    // a heal counts against this round's danger only if the healer moves before the foes do: one queued by somebody slower
    // lands after the blow it was meant to soften (the Colossus, faster than Isaac, killed him under a Nut he never ate)
    const foeAgi = Math.max(0, ...this.aliveEnemies().map(e => e.agi())); const fast = ch.agi() >= foeAgi || cmd.type === 'djinn' || cmd.type === 'summon';   /* a Djinni or a summon always goes first */
    const addHeal = (t, h) => { if (t) { pl.heal.set(t, (pl.heal.get(t) || 0) + h); if (fast) pl.healFast.set(t, (pl.healFast.get(t) || 0) + h); } };
    if (cmd.type === 'attack') addDmg(cmd.target, this.estAttack(ch, cmd.target));
    else if (cmd.type === 'psy') {
      const p = PSY[cmd.psy]; if (!p) return;
      if (p.type === 'heal') { if (p.range === 'all') for (const m of this.aliveParty()) addHeal(m, this.healAmt(ch, psyEl(p), p.base)); else addHeal(cmd.target, this.healAmt(ch, psyEl(p), p.base)); }
      else if (p.type === 'revive') pl.revive.add(cmd.target);
      else if (p.type === 'buff') pl.buffs.add(p.stat);
      else if (p.type === 'cure') pl.cure.add(cmd.target);
      else if (p.type === 'status') pl.status.add(cmd.target);
      else if (p.type === 'magic' || p.type === 'epa' || p.type === 'drain') for (const { t, mult } of this.targetsInRange(this.enemies, cmd.target, p.range)) addDmg(t, this.estPsy(ch, p, t) * mult);
    }
    else if (cmd.type === 'djinn') {
      const fx = DJINN[cmd.djinn].fx, k = fx.k;
      if (k === 'epa' || k === 'meld' || k === 'mold') addDmg(cmd.target, this.estDjinn(ch, cmd.djinn, cmd.target));
      else if (k === 'heal') addHeal(cmd.target, Math.floor(cmd.target.maxHp() * fx.pct));
      else if (k === 'healAll') for (const m of this.aliveParty()) addHeal(m, Math.floor(m.maxHp() * fx.pct));
      else if (k === 'revive') pl.revive.add(cmd.target);
      else if (k === 'reviveAll') for (const m of this.reviveList()) if (!m.alive) pl.revive.add(m);
      else if (k === 'buffAll') pl.buffs.add(fx.stat);
      else if (k === 'shield' || k === 'immune') pl.shield = true;
      else if (k === 'cureAll') for (const m of this.aliveParty()) pl.cure.add(m);
      else if (k === 'status') pl.status.add(cmd.target);
    }
    else if (cmd.type === 'summon') { const S = SUMMONS[cmd.summon]; pl.summons++; if (S.heal) for (const m of this.aliveParty()) addHeal(m, this.healAmt(ch, S.el, S.base)); else for (const e of this.aliveEnemies()) addDmg(e, this.estSummon(ch, cmd.summon, e)); }
    else if (cmd.type === 'item') { const bt = ITEM_DB[cmd.item] && ITEM_DB[cmd.item].battle; if (bt) { if (bt.dmg) for (const { t, mult } of this.targetsInRange(this.enemies, cmd.target, bt.range || 1)) addDmg(t, this.estItem(ch, cmd.item, t) * mult); if (bt.status) for (const { t } of this.targetsInRange(this.enemies, cmd.target, bt.range || 1)) pl.status.add(t); return; } const u = ITEM_DB[cmd.item] && ITEM_DB[cmd.item].use; if (!u) return; if (u.hpFull) addHeal(cmd.target, 99999); else if (u.hp) addHeal(cmd.target, u.hp); if (u.hpAll) for (const m of this.aliveParty()) addHeal(m, u.hpAll); if (u.revive) pl.revive.add(cmd.target); if (u.cure) pl.cure.add(cmd.target); }
  };

  // ---- expected values of the battle's damage formulas (no random roll, crits averaged out) ----
  P.estAttack = function (ch, t) {
    if (!t || !t.alive) return 0; const relAtk = Math.max(0, ch.atk() - t.def()); let base = relAtk / 2 + 1.5;
    const w = ch.equip.weapon && ITEM_DB[ch.equip.weapon];
    if (w && w.unleash && UNLEASH[w.unleash]) { const u = UNLEASH[w.unleash]; let ub = relAtk / 2 * (u.mult || 1) + (u.add || 0); if (u.el !== undefined && u.el < 4) ub *= 1 + capStat(ch.power(u.el) - t.resist(u.el)) / 400; base = base * 0.65 + ub * 0.35; }
    return base * 0.95; // ~5% misses
  };
  P.estPsy = function (ch, p, t) {
    const el = psyEl(p);
    if (p.type === 'magic' || p.type === 'drain') return Math.max(1, p.base * clamp(1 + capStat(ch.power(el) - t.resist(el)) / 200, 0, 2));
    if (p.type === 'epa') { let base = Math.max(0, ch.atk() - t.def()) / 2 * (p.mult || 1) + (p.add || 0); if (el < 4) base *= 1 + capStat(ch.power(el) - t.resist(el)) / 400; return base * 0.95; }
    return 0;
  };
  P.estDjinn = function (ch, name, t) {
    const D = DJINN[name], fx = D.fx;
    if (fx.k === 'epa') { const def = fx.pierce ? Math.floor(t.def() * (1 - fx.pierce)) : t.def(); let base = Math.max(0, ch.atk() - def) / 2 * (fx.mult || 1) + (fx.add || 0); base *= 1 + capStat(ch.power(D.el) - t.resist(D.el)) / 400; if (fx.doubleChance) base *= 1 + fx.doubleChance; return base * 0.95; }
    if (fx.k === 'meld') { const ally = this.aliveParty().filter(m => m !== ch).sort((a, b) => b.atk() - a.atk())[0] || ch; return Math.max(0, ally.atk() + ch.atk() * 0.25 - t.def()) / 2 * (1 + capStat(ally.power(0) - t.resist(0)) / 400); }
    if (fx.k === 'mold') return Math.max(0, t.atk() - t.def()) / 2 + (fx.add || 0);
    return 0;
  };
  P.estItem = function (ch, name, t) { const b = ITEM_DB[name] && ITEM_DB[name].battle; if (!b || !b.dmg) return 0; return Math.max(1, b.dmg * clamp(1 + capStat(ch.power(b.el) - t.resist(b.el)) / 200, 0, 2)); };
  P.estSummon = function (ch, name, e) { const S = SUMMONS[name]; if (S.heal) return 0; const base = S.base + e.maxHp * S.hpPct / 100; return Math.max(1, base * clamp(1 + capStat(ch.power(S.el) - e.resist(S.el)) / 200, 0, 2)); };
  // how hard the enemies could hit one ally in a round: every enemy action, plain hits and their best spell weighed by how often they use it
  P.threatTo = function (ally) {
    let total = 0;
    for (const e of this.aliveEnemies()) {
      if (e.status.stun || e.status.sleep) continue;
      const phys = Math.max(0, e.atk() - ally.def()) / 2 * 1.15; let spell = 0;
      for (const ab of e.abilities || []) { const p = PSY[ab]; if (!p) continue; let d = 0; if (p.type === 'magic') { const el = psyEl(p); d = p.base * (e.boss ? 0.9 : 0.75) * clamp(1 + capStat(e.power(el) - ally.resist(el)) / 200, 0, 2); } else if (p.type === 'epa') d = Math.max(0, e.atk() - ally.def()) / 2 * (p.mult || 1) + (p.add || 0); spell = Math.max(spell, d); }
      total += (e.turns || 1) * (phys * 0.55 + Math.max(phys, spell) * 0.45);
    }
    return total;
  };

  // ---- the decision ----
  P.autoCommand = function (ch) {
    if (!this.plan) this.resetPlan(); const pl = this.plan;
    const alive = this.aliveParty(), enemies = this.aliveEnemies(), boss = !!this.opts.boss;
    if (!enemies.length) return { type: 'defend' };
    const psy = ch.psynergy().map(n => PSY[n]).filter(p => p && p.pp <= ch.pp && !p.fieldOnly && p.type !== 'field');
    const ready = ch.djinn.filter(d => ch.skillReady(d.name)).map(d => ({ name: d.name, fx: DJINN[d.name].fx }));
    const byKind = (k) => ready.find(d => d.fx.k === k);
    const planned = (m) => pl.heal.get(m) || 0;
    const remaining = (e) => e.hp - (pl.dmg.get(e) || 0); // HP an enemy still has once the queued actions land
    const live = enemies.filter(e => remaining(e) > 0);
    const cmd = (c) => c;

    // 1. revive - one reviver per downed ally
    const downed = this.front.filter(m => !m.alive && !pl.revive.has(m));
    if (downed.length) {
      const rv = byKind('reviveAll') || byKind('revive'); if (rv) return cmd({ type: 'djinn', djinn: rv.name, target: downed[0] });
      const rp = psy.find(p => p.type === 'revive'); if (rp) return cmd({ type: 'psy', psy: rp.name, target: downed[0] });
      if (G.inventory.count('Water of Life') > 0) return cmd({ type: 'item', item: 'Water of Life', target: downed[0] });
    }
    // 2. healing - only allies still short after the heals already queued, judged against what the enemies can deal next round
    const plannedFast = (m) => (pl.healFast && pl.healFast.get(m)) || 0;
    const need = alive.map(m => { const max = m.maxHp(), hpAfter = Math.min(max, m.hp + planned(m)), hpBeforeFoes = Math.min(max, m.hp + plannedFast(m)); const danger = Math.max(this.threatTo(m) * 0.9, max * 0.3); return { m, max, hpAfter, missing: max - hpAfter, urgent: hpBeforeFoes < danger, ratio: hpAfter / max }; })
      .filter(n => n.missing > n.max * 0.12 && (n.urgent || n.ratio < 0.5)).sort((a, b) => a.ratio - b.ratio);
    if (need.length) {
      const top = need[0];
      if (need.length >= 2) {
        const hA = byKind('healAll'); if (hA) return cmd({ type: 'djinn', djinn: hA.name, target: ch });
        const multi = psy.filter(p => p.type === 'heal' && (p.range === 'all' || p.range > 1)).sort((a, b) => b.base - a.base)[0];
        if (multi && this.healAmt(ch, psyEl(multi), multi.base) >= top.missing * 0.4) return cmd({ type: 'psy', psy: multi.name, target: top.m });
      }
      // single target: the smallest heal that covers most of the deficit; a Djinn heal is free, so it wins when it is about as good
      const singles = psy.filter(p => p.type === 'heal').map(p => ({ p, amt: this.healAmt(ch, psyEl(p), p.base) })).sort((a, b) => a.amt - b.amt);
      const enough = singles.find(s => s.amt >= top.missing * 0.7) || singles[singles.length - 1];
      const h1 = byKind('heal');
      if (h1 && (!enough || Math.floor(top.max * h1.fx.pct) >= Math.min(top.missing, enough.amt) * 0.8)) return cmd({ type: 'djinn', djinn: h1.name, target: top.m });
      if (enough) return cmd({ type: 'psy', psy: enough.p.name, target: top.m });
      const it = ['Potion', 'Vial', 'Nut', 'Corn', 'Herb'].find(i => { const u = ITEM_DB[i] && ITEM_DB[i].use; return G.inventory.count(i) > 0 && u && (u.hpFull || (u.hp || 0) >= top.missing * 0.5); });
      if (it) return cmd({ type: 'item', item: it, target: top.m });
    }
    // 2b. the party's only healer is out of PP in a fight that will go on: a Psy Crystal is worth more than one more attack
    if (boss && ch.pp < ch.maxPp() * 0.1 && psy.length === 0 && ch.psynergy().some(n => PSY[n] && PSY[n].type === 'heal') && G.inventory.count('Psy Crystal') > 0 && !pl.cure.has(ch)) { pl.cure.add(ch); return cmd({ type: 'item', item: 'Psy Crystal', target: ch }); }
    // 3. crippling ailments nobody is already curing
    const ail = alive.find(m => !pl.cure.has(m) && (m.status.venom || m.status.poison || m.status.delusion || m.status.seal || m.status.haunt || m.status.curse));
    if (ail) {
      const cA = byKind('cureAll'); if (cA) return cmd({ type: 'djinn', djinn: cA.name, target: ch });
      const cp = psy.find(p => p.type === 'cure' && p.cures && Object.keys(ail.status).some(s => ail.status[s] && p.cures.includes(s))); if (cp) return cmd({ type: 'psy', psy: cp.name, target: ail });
      const ci = ['Antidote', 'Elixir'].find(i => G.inventory.count(i) > 0 && ITEM_DB[i].use.cure.some(s => ail.status[s])); if (ci) return cmd({ type: 'item', item: ci, target: ail });
    }
    // 3b. the rear guard's fallen, once the front is on its feet and nobody is in danger: a revive now is a reserve
    // that steps forward if the front falls (a Water of Life is kept for the front)
    const backDown = this.back.filter(m => !m.alive && !pl.revive.has(m));
    if (backDown.length && alive.length === this.front.length && !alive.some(m => m.hp + planned(m) < m.maxHp() * 0.5)) {
      const rp = psy.find(p => p.type === 'revive'); if (rp) return cmd({ type: 'psy', psy: rp.name, target: backDown[0] });
      const rv = byKind('revive'); if (rv && this.opts.boss && ch.limit < 90) return cmd({ type: 'djinn', djinn: rv.name, target: backDown[0] });   /* a Djinni (and the class it holds up) only in a fight that matters */
    }
    // 4. the summon (limit break) when it does real work: a boss, a kill nobody else has lined up, or a big chunk of the group
    if (ch.limitReady()) {
      const S = SUMMONS[ch.summon]; const sEl = S.req.reduce((best, r, i) => r > best.r ? { r, i } : best, { r: 0, i: 0 }).i;
      if (S.heal) { if (need.length >= 2 || alive.some(m => m.hp + planned(m) < m.maxHp() * 0.5)) return cmd({ type: 'summon', summon: ch.summon, target: enemies[0] }); }
      else if (live.length) {
        const kills = live.filter(e => this.estSummon(ch, ch.summon, e) >= remaining(e)).length;
        const dealt = live.reduce((a, e) => a + Math.min(remaining(e), this.estSummon(ch, ch.summon, e) * this.gimMult(e, 'summon', S.el)), 0), left = live.reduce((a, e) => a + remaining(e), 0);
        const held = live.some(e => this.gimMult(e, 'summon', S.el) < 1);   /* a gimmick that halves it now (the high tide): the gauge keeps until it is worth full */
        const resisted = live.every(e => e.resist(sEl) >= 150) && dealt < left * 0.08;   /* a summon the foe shrugs off is kept back - unless it still takes a real bite (a full gauge is worth more than a swing) */
        if (!resisted && !held && (boss || kills >= 1 || dealt > left * 0.35 || this.turn >= 4)) return cmd({ type: 'summon', summon: ch.summon, target: live[0] });
      }
    }
    // 5. serious fights: a shield when the round ahead is dangerous, one party buff of each kind
    if (boss || enemies.length >= 3) {
      const heavy = alive.filter(m => this.threatTo(m) > (m.hp + planned(m)) * 0.6).length;
      if (heavy >= 2 && !pl.shield) { const sh = byKind('shield'); if (sh) return cmd({ type: 'djinn', djinn: sh.name, target: ch }); }
      const roundDmg = alive.reduce((a, m) => a + this.estAttack(m, live[0] || enemies[0]) * 1.6, 0), leftHp = live.reduce((a, e) => a + remaining(e), 0);
      if (this.turn <= 3 && leftHp > roundDmg * 1.5) { const bf = ready.find(d => d.fx.k === 'buffAll' && ['def', 'atk'].includes(d.fx.stat) && !pl.buffs.has(d.fx.stat) && (alive[0].buffs[d.fx.stat] || 0) < 0.2); if (bf) return cmd({ type: 'djinn', djinn: bf.name, target: ch }); }
    }
    // 6. disable a dangerous ordinary enemy that will still be standing and isn't already handled
    if (!boss) {
      const st = ready.find(d => d.fx.k === 'status' && ['stun', 'sleep', 'seal'].includes(d.fx.s));
      if (st) { const victim = live.filter(e => !e.status.stun && !e.status.sleep && !e.status.seal && !pl.status.has(e) && remaining(e) > this.estAttack(ch, e) * 2).sort((a, b) => b.atk() - a.atk())[0]; if (victim && victim.atk() > alive[0].def() * 1.4) return cmd({ type: 'djinn', djinn: st.name, target: victim }); }
    }
    // 6b. a Sleep/Smoke Bomb when two or more dangerous enemies will still be standing after this round and nobody has disabled them
    if (!boss) for (const bomb of ['Sleep Bomb', 'Smoke Bomb']) { if (G.inventory.count(bomb) < 1) continue; const st = ITEM_DB[bomb].battle.status; const threats = live.filter(e => !e.status[st] && !pl.status.has(e) && remaining(e) > this.estAttack(ch, e) * 2 && e.atk() > alive[0].def() * 1.4); if (threats.length >= 2) { const centre = threats.sort((a, b) => this.enemies.indexOf(a) - this.enemies.indexOf(b))[Math.floor(threats.length / 2)]; return cmd({ type: 'item', item: bomb, target: centre }); } }
    // 7. offense: the option with the best expected damage against enemies that will still be standing; damage past a kill is wasted
    const cands = (live.length ? live : enemies).slice().sort((a, b) => remaining(a) - remaining(b));
    const ppFloor = ch.stats().pp * (boss ? 0.15 : 0.35); // keep PP for healing
    let best = null; const consider = (v, c) => { if (!best || v > best.v) best = { v, cmd: c }; };
    const prio = (e) => /Refresh Ball|Guardian Ball/.test(e.name) ? 1.7 : /Ball$/.test(e.name) ? 1.15 : 1;   /* the Star Magician's ring: its healer and its guard first (the guide's counsel), the rest of the balls before the magician */
    for (const t of cands) {
      const cap = (d, e) => Math.max(0, Math.min(d, remaining(e || t) + 10)) * prio(e || t); // nothing gained on an enemy already going down
      if (!this.banAttack) consider(cap(this.estAttack(ch, t) * this.gimMult(t, 'attack', ch.weaponEl ? ch.weaponEl() : 4)), { type: 'attack', target: t });
      for (const d of ready) if (['epa', 'meld', 'mold'].includes(d.fx.k)) { let v = cap(this.estDjinn(ch, d.name, t) * this.gimMult(t, 'djinn', DJINN[d.name].el)); if (d.fx.status && !t.boss && !t.status[d.fx.status]) v *= 1.15; consider(v * 1.05, { type: 'djinn', djinn: d.name, target: t }); }
      // never burn a consumable on foes already going down
      if (live.length) for (const st of G.inventory.items) { const b = ITEM_DB[st.name] && ITEM_DB[st.name].battle; if (!b || !b.dmg) continue; let v = 0; for (const { t: tt, mult } of this.targetsInRange(this.enemies, t, b.range || 1)) v += cap(this.estItem(ch, st.name, tt) * mult * this.gimMult(tt, 'item', b.el), tt); v *= 0.8; consider(v, { type: 'item', item: st.name, target: t }); }
      for (const p of psy) { if (p.type !== 'magic' && p.type !== 'epa' && p.type !== 'drain') continue; if (ch.pp - p.pp < ppFloor) continue; let v = 0; for (const { t: tt, mult } of this.targetsInRange(this.enemies, t, p.range)) v += cap(this.estPsy(ch, p, tt) * mult * this.gimMult(tt, p.type === 'epa' ? 'epa' : 'psy', psyEl(p)), tt); v -= p.pp * 0.6; consider(v, { type: 'psy', psy: p.name, target: t }); }
    }
    return best ? best.cmd : (this.banAttack ? { type: 'defend' } : { type: 'attack', target: cands[0] || enemies[0] });
  };
})();
