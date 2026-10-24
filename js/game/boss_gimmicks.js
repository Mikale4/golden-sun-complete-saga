// ---------- The Cradle's superbosses: a gimmick each (the user's rule) ----------
// Every superboss of the origin world fights by a rule of its own, so that no two of them are answered the same way:
//   Terragon  - HARDENING: every hit it takes in a turn lands for half of the one before (1, 1/2, 1/4...). Hit it hard, once.
//               And a bar that charges with every hit it takes: full (eight hits), it throws everything it has taken
//               back at the party, spread over the front rank, and mends itself for a tenth of what that did.
//   Thalassa  - THE TIDE: three turns high (her spells sweep the whole party, she mends 3% a turn), three turns low
//               (she only strikes, and every blow she lands mends her for what it did; a third of every blow she takes
//               she drinks back). Hit her on the high tide, and hold on the low.
//   Ignis     - HEAT: a gauge climbs a point a turn and a point for every fire spell it casts; at five, MELTDOWN scours
//               the whole party, the rear guard included. Mercury damage quenches it a point a hit - the water Adepts
//               keep the forge from boiling over. And the forge cracks as it breaks: a Meltdown of its own at three
//               quarters, half and a quarter of its life, gauge or no gauge.
//   Zephyros  - ALOFT: it rides the storm; blades and Psynergy blows (attacks, EPA) pass through nothing. Only spells,
//               Djinn and summons reach it - until every third turn, when it DIVES: a storm-strike on the whole party,
//               and then it is grounded for two turns. Grounded it is harder (defence, resistance and speed up) and it
//               can only strike - but those strikes hit harder - and every blade lands on it, and lands hard.
//   Alkahest  - TRANSMUTATION: its element turns every two turns, to any of the four at random: strong in the one it
//               wears, weak to the one that counters it. At a quarter of its life it seals itself: two turns in which no
//               blow can mark it (ailments still take), and from then on CHAOTIC ALCHEMY: whoever strikes it suffers a
//               random ailment for two turns. And it works CHAOS MAGIC: one or two of the party turn on their own for
//               two turns - resisted by luck, and paid for in PP.
// The battle asks the module at a hit (onHit), at the start of a turn (onTurn), after a foe's action (onActed), and for
// the label under the foe (label); the tactician asks estMult for what a kind of blow would be worth right now.
'use strict';

const BossGimmicks = {
  ELN: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
  COUNTER: { 0: 3, 1: 2, 2: 1, 3: 0 },   // what beats what: Jupiter over Venus, Mars over Mercury, Mercury over Mars, Venus over Jupiter
  kind(e) { return e && e.data && e.data.gimmick ? e.data.gimmick : null; },
  st(scene, e) { if (!e._gim) e._gim = { hits: 0, charge: 0, stored: 0, releaseNow: false, tide: 'high', tideT: 0, heat: 0, melts: [0.75, 0.5, 0.25], meltNow: false, aloft: true, diveT: 0, el: rnd(4), elT: 0, sealed: 0, sealedOnce: false }; return e._gim; },
  // the forge boils over: fire on everyone, the rear guard too (the user's rule)
  *meltdown(scene, e) {
    yield scene.say('MELTDOWN! The forge boils over!', 50); const all = scene.front.concat(scene.back).filter(m => m.alive); yield* scene.playFx('fire', scene.aliveParty());
    for (const t of all) { const d = scene.magic(e, t, 2, 300, 1); scene.applyDamage(t, d, { from: e }); } yield 20;
  },
  // ---- a hit on the foe: the damage it really takes (0 = nothing at all); hit = { kind, el, from } ----
  onHit(scene, e, dmg, hit) {
    const g = this.kind(e); if (!g || dmg <= 0) return dmg; const s = this.st(scene, e); hit = hit || {};
    switch (g) {
      case 'harden': { const k = Math.pow(0.5, s.hits); s.hits++; const d = Math.max(1, Math.floor(dmg * k)); if (s.hits > 1) scene.popup(e.x + 20, e.y - 34, 'Hardened x' + (1 / k), '#c0b090'); s.stored += d; if (++s.charge >= 8) s.releaseNow = true; return d; }
      case 'tide': { if (s.tide === 'low') { const back = Math.floor(dmg / 3); if (back > 0) { e.hp = Math.min(e.maxHp, e.hp + back); scene.popup(e.x + 20, e.y - 34, '+' + back, '#80ff80'); } } return dmg; }
      case 'heat': { if (hit.el === 1 && s.heat > 0) { s.heat--; scene.popup(e.x + 20, e.y - 34, 'Quenched', '#80c0ff'); } const after = e.hp - dmg; while (s.melts.length && after <= e.maxHp * s.melts[0]) { s.melts.shift(); s.meltNow = true; } return dmg; }   /* a threshold crossed: the forge cracks right after this blow */
      case 'aloft': { if (s.aloft && (hit.kind === 'attack' || hit.kind === 'epa' || hit.kind === 'item')) { scene.popup(e.x, e.y - 24, 'Aloft', '#c0e0ff'); return 0; } if (!s.aloft && (hit.kind === 'attack' || hit.kind === 'epa')) return Math.floor(dmg * 1.5); return dmg; }
      case 'transmute': {
        if (s.sealedOnce && hit.from && scene.isChar(hit.from) && hit.from.alive) this.chaoticAlchemy(scene, hit.from);   /* past the quarter: whoever strikes it pays in an ailment */
        if (s.sealed > 0) { scene.popup(e.x, e.y - 24, 'Sealed', '#e0c0ff'); return 0; } return dmg; }   // its element does the work (res/pow are set on the turn); sealed, nothing marks it
    }
    return dmg;
  },
  // Alkahest's Chaotic Alchemy: a random ailment on the striker, two turns (kept in _timed so it lifts by itself)
  chaoticAlchemy(scene, who) {
    const pool = ['poison', 'venom', 'stun', 'sleep', 'delusion', 'seal', 'haunt', 'curse'].filter(st => !who.status[st]); if (!pool.length) return;
    const st = pick(pool); who.status[st] = true; who._timed = who._timed || {}; who._timed[st] = 2;
    const p = scene.posOf(who); scene.popup(p.x, p.y - 30, st.charAt(0).toUpperCase() + st.slice(1) + '!', '#ff80ff');
  },
  // ---- the start of a turn: the states move on (messages yielded) ----
  *onTurn(scene) {
    for (const e of scene.enemies) {
      const g = this.kind(e); if (!g || !e.alive) continue; const s = this.st(scene, e);
      switch (g) {
        case 'harden': s.hits = 0; break;
        case 'tide': {
          if (scene.turn === 1) { yield scene.say('The tide is high: Thalassa is at her strongest.', 40); break; }
          if (++s.tideT >= 3) { s.tideT = 0; s.tide = s.tide === 'high' ? 'low' : 'high'; yield scene.say(s.tide === 'low' ? 'The tide goes out! Thalassa draws the sea - and every wound - back into herself.' : 'The tide rises! Thalassa is at her strongest.', 45); }
          if (s.tide === 'high' && e.hp < e.maxHp) { const h = Math.min(e.maxHp - e.hp, Math.floor(e.maxHp * 0.03)); e.hp += h; scene.popup(e.x, e.y - 20, '+' + h, '#80ff80'); }
          break; }
        case 'heat': {
          if (scene.turn === 1) { yield scene.say("Ignis burns hotter by the turn, and with every flame it casts. Mercury cools it.", 40); break; }
          s.heat = Math.min(5, s.heat + 1);
          if (s.heat >= 5) { s.heat = 0; yield* this.meltdown(scene, e); }
          break; }
        case 'aloft': {
          if (scene.turn === 1) { yield scene.say('Zephyros rides the storm: only Psynergy, Djinn and summons reach it.', 45); break; }
          if (s.aloft) { if (++s.diveT >= 3) {
            s.diveT = 0; yield scene.say('Zephyros DIVES! The storm comes down on everyone!', 45); const all = scene.aliveParty(); yield* scene.playFx('wind', all);
            for (const t of all) { const d = scene.physical(e, t, { el: 3, mult: 1.15, add: 40 }); scene.applyDamage(t, d, { from: e }); } yield 16;
            s.aloft = false; s.groundT = 2; e.buffs.def += 0.35; e.buffs.agi += 0.3; e.buffs.res += 40; e.buffs.atk += 0.25;   /* grounded for two turns: braced, quicker, and its blows the heavier */
            yield scene.say('Zephyros is grounded - braced, quick and heavy of arm, but within reach of every blade.', 45); } }
          else if (--s.groundT <= 0) { s.aloft = true; e.buffs.def -= 0.35; e.buffs.agi -= 0.3; e.buffs.res -= 40; e.buffs.atk -= 0.25; yield scene.say('Zephyros takes to the air again.', 35); }
          else yield scene.say('Zephyros is still grounded.', 25);
          break; }
        case 'transmute': {
          if (s.sealed > 0) { s.sealed--; if (s.sealed === 0) yield scene.say('The seal on Alkahest breaks.', 35); else yield scene.say('Alkahest is sealed: nothing marks it.', 30); }
          else if (!s.sealedOnce && e.hp <= e.maxHp * 0.25) { s.sealedOnce = true; s.sealed = 2; yield scene.say('Alkahest seals itself in prima materia! For two turns no blow can mark it.', 55); break; }
          if (scene.turn === 1 || ++s.elT >= 2) { s.elT = 0; if (scene.turn > 1) { let n = rnd(4); if (n === s.el) n = (n + 1 + rnd(3)) % 4; s.el = n; } const w = this.COUNTER[s.el]; e.res = [170, 170, 170, 170]; e.res[s.el] = 260; e.res[w] = 50; e.pow = [110, 110, 110, 110]; e.pow[s.el] = 210; yield scene.say('Alkahest transmutes: it is ' + this.ELN[s.el] + ' now, and ' + this.ELN[w] + ' undoes it.', 45); }
          break; }
      }
    }
  },
  // ---- right after any action: a rule that fires on a threshold (Ignis's cracks) ----
  *afterAction(scene) {
    for (const e of scene.enemies) {
      if (!e.alive || !e._gim) continue; const s = e._gim;
      if (s.meltNow) { s.meltNow = false; yield* this.meltdown(scene, e); }
      if (s.releaseNow) {   // Terragon: everything it has taken, thrown back
        s.releaseNow = false; s.charge = 0; const total = s.stored; s.stored = 0; const party = scene.aliveParty(); if (!party.length || total <= 0) continue;
        yield scene.say('Terragon releases every blow it has taken!', 50); yield* scene.playFx('earth', party); let did = 0;
        const each = Math.max(1, Math.floor(total / party.length)); for (const t of party) did += scene.applyDamage(t, each, { from: e });
        const h = Math.min(e.maxHp - e.hp, Math.floor(did * 0.1)); if (h > 0) { e.hp += h; scene.popup(e.x, e.y - 20, '+' + h, '#80ff80'); } yield 20;
      }
    }
  },
  // ---- what a boss must do this action, if its rule says so (null: its own choice) ----
  forceCmd(scene, e) {
    const g = this.kind(e); if (!g) return null; const s = this.st(scene, e);
    if (g === 'tide' && s.tide === 'low') { const party = scene.aliveParty(); if (party.length) return { type: 'attack', target: pick(party) }; }   /* the low tide: only blows, each of which mends her */
    if (g === 'aloft' && !s.aloft) { const party = scene.aliveParty(); if (party.length) return { type: 'attack', target: pick(party) }; }   /* grounded: only blows */
    return null;
  },
  // ---- damage a boss has just dealt ----
  onDealt(scene, e, target, dmg) {
    const g = this.kind(e); if (!g || dmg <= 0) return; const s = this.st(scene, e);
    if (g === 'tide' && s.tide === 'low') { const h = Math.min(e.maxHp - e.hp, dmg); if (h > 0) { e.hp += h; scene.popup(e.x, e.y - 20, '+' + h, '#80ff80'); } }
  },
  // ---- after a foe's own action ----
  onActed(scene, e, cmd) {
    const g = this.kind(e); if (!g) return; const s = this.st(scene, e);
    if (g === 'heat') { const fire = (cmd && cmd.type === 'psy' && PSY[cmd.psy] && psyEl(PSY[cmd.psy]) === 2) || (cmd && cmd.type === 'monster' && /flame|fire|pyro|inferno|blast/i.test(cmd.ab || '')); if (fire) s.heat = Math.min(5, s.heat + 1); }
  },
  // ---- what the tactician should expect a kind of blow to be worth right now (a multiplier), and a hint ----
  estMult(scene, e, kind, el, hitsPlanned) {
    const g = this.kind(e); if (!g) return 1; const s = this.st(scene, e);
    switch (g) {
      case 'harden': return Math.pow(0.5, hitsPlanned || 0) * (s.charge >= 6 ? 0.6 : 1);   /* the bar near full: what is dealt now comes straight back - mend first */
      case 'tide': return s.tide === 'low' ? 0.67 : 1;   /* on the low tide a third of every blow comes back to her: hold the big ones for the high */
      case 'heat': return el === 1 && s.heat >= 3 ? 1.6 : 1;   /* a water blow that keeps the forge from boiling over */
      case 'aloft': { const phys = kind === 'attack' || kind === 'epa' || kind === 'item'; return s.aloft ? (phys ? 0 : 1) : (phys ? 1.5 : 1); }   /* grounded, its defence and resistance are up: the estimators read those; the blades' 1.5x is on top */
      case 'transmute': return s.sealed > 0 ? 0 : 1;   /* its resistances are live: the estimators read them; sealed, nothing is worth a blow */
    }
    return 1;
  },
  // a bar for the rules that fill: Terragon's charge, Ignis's heat, Alkahest's seal; null for the rest
  gauge(scene, e) {
    const g = this.kind(e); if (!g || !e.alive) return null; const s = this.st(scene, e);
    switch (g) {
      case 'harden': return { frac: s.charge / 8, col: s.charge >= 6 ? '#ff8040' : '#d0b060', text: s.charge + '/8' };
      case 'heat': return { frac: s.heat / 5, col: s.heat >= 4 ? '#ff4020' : '#ff9040', text: s.heat + '/5' };
      case 'tide': return { frac: (s.tideT + 1) / 3, col: s.tide === 'high' ? '#60a0ff' : '#80e0c0', text: (3 - s.tideT) + 't' };
      case 'aloft': return s.aloft ? { frac: (s.diveT + 1) / 3, col: '#c0e0ff', text: (3 - s.diveT) + 't' } : { frac: (s.groundT || 0) / 2, col: '#ffd080', text: (s.groundT || 0) + 't' };
      case 'transmute': return s.sealed > 0 ? { frac: s.sealed / 2, col: '#e0c0ff', text: s.sealed + 't' } : { frac: (s.elT + 1) / 2, col: '#e0e0e0', text: (2 - s.elT) + 't' };
    }
    return null;
  },
  label(scene, e) {
    const g = this.kind(e); if (!g || !e.alive) return null; const s = this.st(scene, e);
    switch (g) {
      case 'harden': return s.hits ? 'Hardened x' + Math.pow(2, s.hits) : 'Hardening';
      case 'tide': return s.tide === 'low' ? 'Low tide: drinks wounds' : 'HIGH TIDE';
      case 'heat': return 'Heat';
      case 'aloft': return s.aloft ? 'Aloft' : 'GROUNDED';
      case 'transmute': return s.sealed > 0 ? 'SEALED' : this.ELN[s.el] + ' / weak: ' + this.ELN[this.COUNTER[s.el]];
    }
    return null;
  }
};
