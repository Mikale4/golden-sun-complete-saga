// ---------- Colosso ----------
// Tolbi's tournament, after the walkthrough's chapter 11 and the rip (map references/golden-sun-colosso-gba-map.webp):
// Isaac goes into the arena alone. Each round is a run down an obstacle course against a gladiator running the
// far side - a pillar to Move, a lift that rises when a bucket is Doused, a sprout to Grow, a lift operator to
// Halt, a puddle to Frost, a log to Force - with the other three lending a hand from the stands, one to a stage,
// with whatever Psynergy that stage wants (the guide's own setup, as far as the party can manage it). A stage
// nobody helps at costs time: the pillar and the log Isaac must Move himself, the lifts creak up on their own,
// the vine has to be climbed the long way. Whoever reaches the centre first takes the better piece of equipment
// lying there and fights the fresher. Three rounds: Azart, Satrage, Navampa. Win all three and Babi gives the Lure
// Cap. After the last, Isaac collapses and wakes in Babi's palace.
'use strict';
const COLOSSO_ROUNDS = [
  { foe: 'Azart', map: 'colosso_r1', par: 62, gear: ['Iron Shield', 'Padded Gloves'],
    stages: [{ kind: 'pillar', psy: 'Move', who: ['Garet', 'Isaac'], what: 'Move on the central pillar' }, { kind: 'lift', psy: 'Douse', who: ['Mia', 'Ivan'], what: 'Douse to fill the bucket' }, { kind: 'vine', psy: 'Growth', who: ['Ivan', 'Garet', 'Isaac', 'Mia'], what: 'Growth on the sprout' }, { kind: 'log', psy: null, what: 'the log pool - no help possible' }] },
  { foe: 'Satrage', map: 'colosso_r2', par: 66, gear: ['Chain Mail', 'Cotton Shirt'],
    stages: [{ kind: 'pillar', psy: 'Move', who: ['Garet', 'Isaac'], what: 'Move on the middle pillar' }, { kind: 'operator', psy: 'Halt', who: ['Ivan', 'Mia', 'Garet'], what: 'Halt on the lift operator' }, { kind: 'frost', psy: 'Frost', who: ['Mia', 'Ivan', 'Garet'], what: 'Frost on the left puddle' }, { kind: 'climb', psy: null, what: 'the climb - no help possible' }, { kind: 'forcelog', psy: 'Force', who: ['Garet', 'Ivan', 'Mia'], what: 'Force on the log' }] },
  { foe: 'Navampa', map: 'colosso_r3', par: 72, gear: ['Claymore', "Hunter's Sword"],
    stages: [{ kind: 'frost', psy: 'Frost', who: ['Mia', 'Ivan', 'Garet'], what: 'Frost on the hidden puddle under the lift' }, { kind: 'pillar', psy: 'Move', who: ['Garet', 'Isaac'], what: 'Move on the pillar, to the right' }, { kind: 'operator', psy: 'Halt', who: ['Ivan', 'Mia', 'Garet'], what: 'Halt on the operator' }, { kind: 'vine', psy: 'Growth', who: ['Ivan', 'Garet', 'Isaac', 'Mia'], what: 'Growth on the plant' }, { kind: 'forcelog', psy: 'Force', who: ['Ivan', 'Garet', 'Mia'], what: 'Force on the log' }, { kind: 'maze', psy: null, what: 'the last field - no help possible' }] },
];
const colossoRound = () => G.get('colosso_round') || 0;   // rounds finished
const colossoWins = () => G.get('colosso_wins') || 0;
// who lends a hand where this round: each friend takes the first stage on the list that wants a Psynergy they have
function colossoAssign(round) {
  const R = COLOSSO_ROUNDS[round]; const taken = new Set(); const out = [];
  R.stages.forEach((st, i) => {
    if (!st.psy) return;
    for (const name of st.who) { if (name === 'Isaac' || taken.has(name)) continue; const m = G.party.get(name); if (!m || !m.alive || !m.hasPsy(st.psy)) continue; taken.add(name); out.push({ stage: i + 1, who: name, psy: st.psy }); break; }
  });
  return out;
}

// ---- the main hall ----
defineMap('colosso', {
  name: 'Colosso Arena', w: 30, h: 24, base: 'sand', music: 'battle', bg: 'sand', entry: { x: 4, y: 12 },
  build(M) {
    M.fillObj(0, 0, 30, 3, 'wall_stone'); M.fillObj(0, 21, 30, 3, 'wall_stone'); M.fillObj(0, 0, 2, 24, 'wall_stone'); M.fillObj(28, 0, 2, 24, 'wall_stone');
    M.fill(2, 3, 26, 18, 'sand'); M.fill(8, 6, 14, 12, 'cobble');
    M.fillObj(0, 11, 2, 2, null); M.exit(0, 11, 1, 2, 'tolbi_yard', 30, 15, DIR.LEFT); M.walkable(0, 11, 2, 2);
    M.npc('colosso_ref', 15, 5, { type: 'guard', name: 'Referee', script: STORY.colosso });
    M.npc('colosso_guide', 6, 8, { type: 'guard', name: 'Guard', script: STORY.colossoTour });
    // the eight gladiators, ranked as the guide lists them
    const glad = (id, x, y, name, top, line) => M.npc(id, x, y, { type: 'guard', name, look: Object.assign({}, npcLook('guard', hashStr(id)), { top, sleeve: top }), text: line, cond: () => !G.flag('colosso_done') });
    glad('gl_morgan', 10, 16, 'Morgan', '#3060d0', "Morgan, first among the gladiators. Babi's judges pick the finalists as they please. This year they did not pick me.");
    glad('gl_azart', 14, 16, 'Azart', '#e08030', "Azart. I run the first course against you, boy. Try to keep up.");
    glad('gl_galahad', 18, 16, 'Galahad', '#8040c0', "Galahad. I have watched you. You lean on your friends. In the arena there is only you.");
    glad('gl_satrage', 22, 16, 'Satrage', '#40a040', "Satrage. The second course is mine. The time on it is tight. Tighter than you think.");
    glad('gl_dekka', 10, 19, 'Dekka', '#60c0e0', "Dekka. Fifth. The courses are half the fight - the crowd loves a man who arrives first.");
    glad('gl_navampa', 22, 19, 'Navampa', '#d040a0', "Navampa. The last course. If you are still standing by then, I will put you down myself.");
    glad('gl_buford', 26, 19, 'Buford', '#303030', "Buford. Seventh. Nobody remembers the seventh. Nobody will remember the eighth either.");
    M.npc('colosso_fan1', 5, 5, { type: 'villager_m', text: "Go, Isaac! Show them what Vale is made of!" });
    M.npc('colosso_fan2', 24, 5, { type: 'villager_f', text: "The finalists this year are Azart, Satrage and Navampa. Fearsome warriors, all of them!" });
  }
});
STORY.colossoTour = function* (E) {
  yield E.say("You're Lord Babi's fighter? Then hear how the courses run. Two men start at either end; the centre platform is the goal.", 'Guard');
  yield E.say("The first to the centre takes the better piece of equipment lying there, and fights the fresher for it. Along the way there are things to move, to grow, to freeze - and healing items, if you have the time.", 'Guard');
  yield E.say("Your friends may lend a hand from the stands: one to a stage, with whatever Psynergy that stage wants. They cannot come down. Pick well.", 'Guard');
};

// ---- the courses: a lane down the arena, a stage every nine tiles, the centre at the far end ----
// rows: 0-1 the stands, 2 the wall, 3-7 the field (the lane is row 5), 8 the wall, 9-10 the stands
const CO_LEGEND = { '.': 'sand', 'c': 'cobble', 'W': { ground: 'sand', obj: 'wall_stone' }, 'S': { ground: 'cobble', obj: 'wall_in_stone' }, 'D': 'cobble', 'w': 'water', 'L': { ground: 'sand', obj: 'ladder', walk: true } };
function colossoRows(nStages) {
  const W = 8 + nStages * 9 + 4; const rows = [];
  const line = (f) => { let s = ''; for (let x = 0; x < W; x++) s += f(x); return s; };
  rows.push(line(() => 'S')); rows.push(line(() => 'S')); rows.push(line(() => 'W'));
  for (let y = 3; y <= 7; y++) rows.push(line(x => {
    if (x === 0) return y === 5 ? '.' : 'W'; if (x === W - 1) return 'W';
    if (x >= W - 5) return 'c';                                          // the centre platform
    for (let s = 0; s < nStages; s++) { const gx = 8 + s * 9; if (x === gx) return (y === 5 || y === 6) ? '.' : 'W'; }   // a wall with a two-tile gap at every stage (a pillar shoved through it still leaves a way)
    return '.';
  }));
  rows.push(line(() => 'W')); rows.push(line(() => 'S')); rows.push(line(() => 'S'));
  return rows;
}
function colossoCourse(round) {
  const R = COLOSSO_ROUNDS[round]; const rows = colossoRows(R.stages.length); const W = rows[0].length;
  defineMap(R.map, {
    name: 'Colosso - Round ' + (round + 1), w: W, h: rows.length, base: 'sand', music: 'battle', bg: 'sand', indoor: true, entry: { x: 1, y: 5 }, enc: [], noEncounters: true,
    build(M) {
      M.paint(0, 0, rows, CO_LEGEND, { cliff: null });
      for (let i = 0; i < Math.floor(W / 5); i++) { M.npc(R.map + '_fan' + i, 2 + i * 5, 1, { type: i % 2 ? 'villager_m' : 'villager_f', solid: false, text: "Colosso! Colosso!" }); M.npc(R.map + '_fanb' + i, 4 + i * 5, 9, { type: i % 3 ? 'villager_f' : 'villager_m', solid: false, text: "Run, boy, run!" }); }
      M.setObj(W - 3, 4, 'statue_gold');
      R.stages.forEach((st, i) => {
        const gx = 8 + i * 9, n = i + 1; const assisted = G.flag('colosso_assist_' + (round + 1) + '_' + n), cleared = G.flag('colosso_clear_' + (round + 1) + '_' + n);
        const key = [round + 1, n];
        if (st.kind !== 'pillar' && st.kind !== 'log' && st.kind !== 'forcelog') { M.setObj(gx, 6, 'wall_stone'); M.block(gx, 6); }   // only the lane's own cell for these
        switch (st.kind) {
          case 'pillar': if (!cleared) M.object('pillar', gx, 5, { id: 'co_pillar_' + round + '_' + n, onMove: function* (E) { G.set('colosso_clear_' + key[0] + '_' + key[1]); } }); M.trigger(gx - 2, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
          case 'lift': case 'operator': // the gap is a lift shaft: down until it is called, up at once when a friend saw to it
            if (!cleared && !assisted) { M.set(gx, 5, 'chasm'); M.block(gx, 5); } else { M.set(gx, 5, 'stairs'); M.walkable(gx, 5); }
            M.setObj(gx, 3, 'well_rope'); if (st.kind === 'operator') M.npc('co_operator_' + round + '_' + n, gx, 7, { type: 'villager_m', name: 'Operator', solid: false, haltable: true, text: "The lift goes when I say it goes." });
            M.trigger(gx - 1, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
          case 'vine': // the gap is a wall with the sprout at its foot: a vine, or a slow scramble over
            if (!cleared && !assisted) { M.set(gx, 5, 'chasm'); M.block(gx, 5); M.object('sprout', gx - 1, 5, { id: 'co_sprout_' + round + '_' + n, onGrow: function* (E) { G.set('colosso_clear_' + key[0] + '_' + key[1]); const M2 = G.map, x2 = 8 + (key[1] - 1) * 9; M2.set(x2, 5, 'sand'); M2.setObj(x2, 5, 'vines'); M2.walkable(x2, 5); M2.finalize(); } }); } else { M.setObj(gx, 5, 'vines'); M.walkable(gx, 5); }
            M.trigger(gx - 2, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
          case 'frost': // a portcullis across the gap: the ice pillar of the left puddle props it; a hand crank turns slowly
            if (!cleared && !assisted) { M.object('gate', gx, 5, { id: 'co_gate_' + round + '_' + n, state: 'shut' }); M.block(gx, 5); } else M.walkable(gx, 5);
            M.object('puddle', gx - 2, 4, { id: 'co_puddle_l_' + round + '_' + n, onFrost: function* (E) { G.set('colosso_clear_' + key[0] + '_' + key[1]); const g = G.map.objects.find(o => o.id === 'co_gate_' + key[0] + '_' + key[1]); if (g) { g.state = 'open'; G.set('obj:' + g.key, { state: 'open' }); } G.map.walkable(8 + (key[1] - 1) * 9, 5); yield E.say('The ice heaves the portcullis up on its chains.'); } });
            M.object('puddle', gx - 2, 6, { id: 'co_puddle_r_' + round + '_' + n });
            M.trigger(gx - 1, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
          case 'log': case 'forcelog': // a log across the gap: Force breaks it, Move shoves it, either way it costs
            if (!cleared) M.object('log', gx, 5, { id: 'co_log_' + round + '_' + n, len: 1, horiz: false, onMove: function* (E) { G.set('colosso_clear_' + key[0] + '_' + key[1]); }, onForce: function* (E) { G.set('colosso_clear_' + key[0] + '_' + key[1]); } });
            M.trigger(gx - 2, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
          case 'climb': case 'maze': // the wall gap is open but the field before it winds: walls in the way of the lane
            for (let y = 3; y <= 7; y++) if (y !== 3) M.setObj(gx - 4, y, 'wall_stone'); for (let y = 3; y <= 7; y++) if (y !== 7) M.setObj(gx - 2, y, 'wall_stone');
            M.trigger(gx - 6, 5, 1, 1, STORY.colossoStage, { once: 'colosso_seen_' + round + '_' + n, data: key }); break;
        }
        // a healing item beside most stages, off the lane
        if (st.kind === 'climb' || st.kind === 'maze') M.chest(gx - 7, 7, 'Smoke Bomb', 1);   // clear of the winding walls
        else if (i % 2 === 0) M.chest(gx - 5, 7, i === 0 ? 'Nut' : 'Smoke Bomb', 1); else M.chest(gx - 5, 3, 'Nut', 1);
      });
      // the centre: the pedestal with the round's gear, and the trigger that ends the run
      M.trigger(W - 5, 3, 4, 5, STORY.colossoCentre, { once: 'colosso_centre_' + (round + 1) });
      M.sign(1, 4, "Your starting circle. The referee's flag drops, and the run begins.");
    }
  });
}
colossoCourse(0); colossoCourse(1); colossoCourse(2);

// ---- the referee: rounds, the friends' places in the stands, the run ----
STORY.colosso = function* (E) {
  if (G.flag('colosso_done')) { yield E.say(colossoWins() >= 3 ? "The champion of Colosso! Everyone's still talking about your victory." : "Colosso is over for this year. You fought well, for a stranger.", 'Referee'); return; }
  if (!G.flag('babi_found')) { yield E.say("Colosso is for invited fighters only. Lord Babi himself chooses the last entrant - and Lord Babi is not here.", 'Referee'); return; }
  const r = colossoRound(); const R = COLOSSO_ROUNDS[r];
  if (r === 0) { yield E.say("Lord Babi's chosen fighter! The crowd is waiting. Three rounds: Azart, Satrage, and Navampa. Each a course, then a fight - and you run it alone.", 'Referee'); }
  else yield E.say("Round " + (r + 1) + ": " + R.foe + ". " + (r === 2 ? "The last course, and the longest." : "The time on this one is tighter."), 'Referee');
  const assigns = colossoAssign(r);
  yield E.say("The course: " + R.stages.map((s, i) => (i + 1) + ') ' + s.what).join('; ') + '.', 'Referee');
  if (assigns.length) yield E.say("Your friends take their places in the stands - " + assigns.map(a => a.who + ' at stage ' + a.stage + ' with ' + a.psy).join(', ') + '.', 'Referee');
  else yield E.say("None of your friends can help on this course. You run it alone.", 'Referee');
  const go = yield* E.ask('Take your circle and run?', 'Referee', ['Run!', 'Not yet']); if (go !== 0) return;
  for (const a of assigns) G.set('colosso_assist_' + (r + 1) + '_' + a.stage);
  G.set('colosso_assigns_' + (r + 1), assigns);
  const isaac = G.party.get('Isaac'); G.set('colosso_party', G.party.active.map(m => m.name)); G.party.active = [isaac]; G.party.reserve = G.party.members.filter(m => m !== isaac);
  yield Engine.fadeOut(20); E.warpNow(R.map, 1, 5, DIR.RIGHT); G.field.rebuildFollowers(); yield Engine.fadeIn(20);
  yield E.say("Fighters to your circles! " + R.foe + " runs the far side. On my flag -", 'Referee');
  yield E.say("...GO!", 'Referee');
  G.field.race = { t: R.par * 60, total: R.par * 60, foe: R.foe, round: r + 1, late: false };
};
// each stage as Isaac reaches it: the friend set to it acts, or Isaac hears what it will cost him
STORY.colossoStage = function* (E, trig) {
  const [round, n] = trig.data; const R = COLOSSO_ROUNDS[round - 1]; const st = R.stages[n - 1]; const M = G.map; const gx = 8 + (n - 1) * 9;
  const a = (G.get('colosso_assigns_' + round) || []).find(x => x.stage === n);
  if (a && !G.flag('colosso_clear_' + round + '_' + n)) {
    G.set('colosso_clear_' + round + '_' + n);
    G.field.psyFx = { name: a.psy, x: gx, y: 5, t: 0, el: 0, dir: DIR.RIGHT, cx: gx - 1, cy: 5 };
    yield 12; Audio.sfx('psy');
    yield E.say(a.who + ': "' + a.psy + '!"');
    switch (st.kind) {
      case 'pillar': { const o = M.objects.find(ob => ob.id === 'co_pillar_' + (round - 1) + '_' + n); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } break; }
      case 'lift': case 'operator': { M.set(gx, 5, 'stairs'); M.walkable(gx, 5); M.finalize(); if (st.kind === 'operator') { const op = E.actor('co_operator_' + (round - 1) + '_' + n); if (op) op.halted = 600; } break; }
      case 'vine': { M.set(gx, 5, 'sand'); M.setObj(gx, 5, 'vines'); M.walkable(gx, 5); M.finalize(); const o = M.objects.find(ob => ob.id === 'co_sprout_' + (round - 1) + '_' + n); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } break; }
      case 'frost': { const g = M.objects.find(ob => ob.id === 'co_gate_' + (round - 1) + '_' + n); if (g) { g.state = 'open'; G.set('obj:' + g.key, { state: 'open' }); } M.walkable(gx, 5); M.finalize(); break; }
      case 'log': case 'forcelog': { const o = M.objects.find(ob => ob.id === 'co_log_' + (round - 1) + '_' + n); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } break; }
    }
    return;
  }
  if (G.flag('colosso_clear_' + round + '_' + n)) return;
  switch (st.kind) {
    case 'pillar': yield E.say("(A pillar stands in the gap. Nobody in the stands is set to it - Isaac will have to Move it himself.)"); break;
    case 'lift': yield E.say("(The lift is down at the bottom of its shaft, the bucket that raises it empty. It will fill on its own... slowly.)"); yield* STORY.colossoWait(E, 360, 'The bucket fills, drop by drop...'); M.set(gx, 5, 'stairs'); M.walkable(gx, 5); M.finalize(); G.set('colosso_clear_' + round + '_' + n); break;
    case 'operator': yield E.say("(The operator has sent the lift to the far side. He takes his time bringing it back.)"); yield* STORY.colossoWait(E, 360, 'The lift creaks back across...'); M.set(gx, 5, 'stairs'); M.walkable(gx, 5); M.finalize(); G.set('colosso_clear_' + round + '_' + n); break;
    case 'vine': if (G.party.get('Isaac').hasPsy('Growth')) yield E.say("(A sprout at the wall's foot. Isaac could Grow it himself.)"); else { yield E.say("(A sprout at the wall's foot, and a wall too high to vault. Isaac scrambles over it, slowly.)"); yield* STORY.colossoWait(E, 300, 'Isaac claws his way up the stones...'); M.set(gx, 5, 'sand'); M.setObj(gx, 5, 'vines'); M.walkable(gx, 5); M.finalize(); G.set('colosso_clear_' + round + '_' + n); } break;
    case 'frost': yield E.say("(A portcullis bars the gap, a puddle on either side. There is a hand crank... a slow one.)"); yield* STORY.colossoWait(E, 360, 'The crank turns, link by link...'); { const g = M.objects.find(ob => ob.id === 'co_gate_' + (round - 1) + '_' + n); if (g) { g.state = 'open'; G.set('obj:' + g.key, { state: 'open' }); } } M.walkable(gx, 5); M.finalize(); G.set('colosso_clear_' + round + '_' + n); break;
    case 'log': case 'forcelog': yield E.say("(A log lies across the gap. Isaac will have to Move it aside himself.)"); break;
    case 'climb': case 'maze': yield E.say("(The field winds here. No help for it but to run.)"); break;
  }
};
STORY.colossoWait = function* (E, frames, line) { G.field.showNotice(line); for (let i = 0; i < frames; i += 30) { yield 30; if (i % 120 === 0) G.field.showNotice(line); } };
// the centre: whoever is first takes the better piece; then the fight
STORY.colossoCentre = function* (E) {
  const race = G.field.race; const r = race ? race.round - 1 : colossoRound(); const R = COLOSSO_ROUNDS[r]; const late = race ? race.late : true; G.field.race = null;
  const gear = late ? R.gear[1] : R.gear[0];
  yield E.say(late ? R.foe + " is already on the platform, the " + R.gear[0] + " in his hands. Isaac takes the " + gear + " that is left." : "Isaac reaches the centre first! He takes up the " + gear + " from the pedestal - " + R.foe + " comes panting in behind.");
  yield E.give(gear, 1);
  const isaac = G.party.get('Isaac'); isaac.hp = isaac.maxHp(); isaac.pp = isaac.maxPp();
  yield E.say("FIGHT!", 'Referee');
  const res = yield* E.battle([R.foe], { boss: true, canFlee: false, bg: 'sand', canLose: true, weaken: late ? { hp: 1, atk: 1, def: 1 } : { hp: 1, atk: 0.9, def: 0.15 }, fixedWeaken: true });
  const won = res === 'win';
  G.set('colosso_round', r + 1); if (won) G.set('colosso_wins', colossoWins() + 1);
  // the party back together, whole again
  const names = G.get('colosso_party') || ['Isaac']; G.party.active = names.map(n => G.party.get(n)).filter(Boolean); G.party.reserve = G.party.members.filter(m => !G.party.active.includes(m));
  for (const m of G.party.members) { m.hp = m.maxHp(); m.pp = m.maxPp(); if (m.status) m.status = {}; }
  if (r < 2) {
    yield E.say(won ? "Isaac of Vale takes round " + (r + 1) + "! And - he stands, healed, as if he had never fought. The crowd has never seen the like." : "Isaac falls... but breathes. The healers see to him. The tournament goes on.", 'Referee');
    yield Engine.fadeOut(20); E.warpNow('colosso', 15, 7, DIR.UP); G.field.rebuildFollowers(); yield Engine.fadeIn(20);
    yield E.say("Rest a moment. Speak to me when you are ready for the next.", 'Referee');
    return;
  }
  G.set('colosso_done');
  if (won) { Audio.play('victory'); yield E.say("Unbelievable! Isaac of Vale has beaten Navampa! " + (colossoWins() >= 3 ? "Three rounds, three victories - the champion of Colosso!" : "The last round is his!"), 'Referee'); }
  else yield E.say("Navampa stands over him... Isaac of Vale is down. A brave showing, for a stranger.", 'Referee');
  yield E.say("(Isaac sways... and collapses on the sand.)"); yield 40;
  yield E.say("Isaac!", 'Garet'); yield E.say("He's exhausted. Three courses and three fights - anyone would be.", 'Mia'); yield E.say("...Should we carry him? Lord Babi's people are coming.", 'Ivan');
  yield Engine.fadeOut(40); E.warpNow('tolbi_bedroom', 4, 4, DIR.DOWN); G.field.rebuildFollowers(); yield 30; yield Engine.fadeIn(40);
  yield* STORY.colossoWake(E);
};
// Babi's palace: Isaac wakes in a guest bed, the others round him
STORY.colossoWake = function* (E) {
  yield E.say("...where...", 'Isaac');
  yield E.say("You're awake! You slept the whole night. This is Lord Babi's palace - his own people carried you up.", 'Mia');
  yield E.say("Lord Babi wants to see you, when you can stand. His room is up the stairs. He said it was important. He said it twice.", 'Ivan');
  yield E.say("He also said there'd be a reward. I'm just saying.", 'Garet');
  G.set('colosso_woke');
};
// Isaac's guest room in the palace
Kit.interior('tolbi_bedroom', { name: "Babi's Palace - Guest Room", w: 10, h: 8, floor: 'carpet_red', wall: 'wall_in_stone', doorX: 4, back: { map: 'tolbi_palace', x: 8, y: 11 },
  furn: [['bed', 3, 2], ['bed_foot', 3, 3], ['bookshelf', 7, 2], ['table', 7, 5], ['chair', 8, 5]],
  build(M) { M.container(8, 6, 'pot', 'Nut', 1); M.sign(1, 6, 'A guest room of the palace. The sheets are finer than anything in Vale.'); } });

// ---- the tribunes: Lord Babi's stands over the first arena, reached from the palace. Before Colosso the
// gladiators fight their qualifying bouts on the floor below; the party can only watch ----
defineMap('colosso_tribune', {
  name: 'Colosso Tribunes', w: 30, h: 18, base: 'sand', music: 'town', bg: 'sand', entry: { x: 2, y: 5 },
  build(M) {
    M.fillObj(0, 0, 30, 2, 'wall_stone'); M.fillObj(0, 16, 30, 2, 'wall_stone'); M.fillObj(0, 2, 1, 14, 'wall_stone'); M.fillObj(29, 2, 1, 14, 'wall_stone');
    M.fill(1, 2, 28, 5, 'floor_stone'); M.fill(1, 8, 28, 8, 'sand'); M.fill(8, 10, 14, 4, 'cobble');
    for (let x = 1; x <= 28; x++) M.setObj(x, 7, 'fence');                                   // the rail over the drop to the floor
    for (let x = 3; x <= 27; x += 2) { M.setObj(x, 3, 'chair'); M.setObj(x, 5, 'chair'); }   // the benches, an aisle between
    M.setObj(1, 4, 'door'); M.walkable(1, 4); M.exit(1, 4, 1, 1, 'tolbi_palace', 14, 8, DIR.LEFT, { door: true });
    M.setObj(14, 2, 'statue_gold'); M.setObj(15, 2, 'statue_gold');   // Babi's box
    const done = G.flag('colosso_done');
    // the crowd in the stands
    M.npc('tr_fan1', 6, 4, { type: 'villager_m', dir: DIR.DOWN, text: () => done ? "Eight fighters, three courses, and the boy from Vale took them all. I'll be telling my grandchildren." : "Qualifying bouts. The judges seed the eight for the courses by these - though everyone knows Azart, Satrage and Navampa are already picked for the finals." });
    M.npc('tr_fan2', 12, 4, { type: 'villager_f', dir: DIR.DOWN, text: () => done ? "Lord Babi in his box and a champion from nowhere. What a year." : "Lord Babi's box is empty. He has never missed a qualifying day in fifty years. Something is wrong." });
    M.npc('tr_fan3', 20, 6, { type: 'child_m', dir: DIR.DOWN, text: () => done ? "Isaac! Isaac! I saw you jump the pillars!" : "Dekka's going to win! Dekka! Hit him, Dekka!" });
    M.npc('tr_fan4', 24, 4, { type: 'merchant', dir: DIR.DOWN, text: () => done ? "I had money on Navampa. I should have had money on the boy." : "Three to one on Dekka, two to one on Morgan. Morgan's wounded, mind. Don't tell anyone." });
    // the floor: the qualifiers fight until Colosso proper; afterwards the sand is raked and empty
    if (!done) {
      M.npc('q_dekka', 10, 11, { type: 'guard', name: 'Dekka', dir: DIR.RIGHT, look: Object.assign({}, npcLook('guard', hashStr('gl_dekka')), { top: '#60c0e0', sleeve: '#60c0e0' }), text: '' });
      M.npc('q_morgan', 19, 11, { type: 'guard', name: 'Morgan', dir: DIR.LEFT, look: Object.assign({}, npcLook('guard', hashStr('gl_morgan')), { top: '#3060d0', sleeve: '#3060d0' }), text: '' });
      M.npc('q_ref', 15, 13, { type: 'guard', name: 'Referee', dir: DIR.UP, text: '' });
      M.trigger(1, 3, 3, 3, STORY.colossoQualifier, { cond: () => !G.flag('colosso_done') });
    }
  }
});
// a qualifying bout seen from the stands: two of the eight go at it on the floor, the crowd calls the blows
STORY.colossoQualifier = function* (E) {
  if (G.get('colosso_qual_seen') >= 2) return; G.set('colosso_qual_seen', (G.get('colosso_qual_seen') || 0) + 1);
  const A = 'q_dekka', B = 'q_morgan';
  yield E.say("(Below the rail, on the raked sand, two gladiators circle each other. The referee's arm is up.)");
  yield E.say("Fifth seed Dekka against Morgan, first among the eight! A qualifying bout, for the order of the courses - begin!", 'Referee');
  Audio.sfx('cursor');
  for (let round = 0; round < 3; round++) {
    E.move(A, DIR.RIGHT, 2); yield E.move(B, DIR.LEFT, 2);
    Engine.doShake(4); Audio.sfx('hit'); yield 12;
    if (round < 2) { E.move(A, DIR.LEFT, 2); yield E.move(B, DIR.RIGHT, 2); yield 10; }
    if (round === 0) yield E.say("Morgan's slow on that leg - did you see? Dekka saw.", 'Spectator');
    if (round === 1) yield E.say("Hit him! Hit him, Dekka!", 'Spectator');
  }
  Engine.doShake(8); Audio.sfx('hit'); yield 10;
  yield E.move(B, DIR.RIGHT, 3);
  yield E.say("(Morgan goes down on one knee and stays there. The referee's arm comes down.)");
  yield E.say("Dekka! The bout to Dekka!", 'Referee'); Audio.sfx('cheer');
  yield E.say("Every year they seed the courses by these bouts, and every year the judges pick who they like. Azart, Satrage, Navampa - the finals were settled in the palace a month ago.", 'Spectator');
  yield E.say("So the eighth fighter... whoever Babi picks... runs the courses against men like that.", 'Ivan');
  yield E.say("Then he had better be quick.", 'Garet');
  const a = E.actor(A), b = E.actor(B); if (a) { a.tx = 10; a.ty = 11; a.px = a.tx * TILE; a.py = a.ty * TILE; a.dir = DIR.RIGHT; } if (b) { b.tx = 19; b.ty = 11; b.px = b.tx * TILE; b.py = b.ty * TILE; b.dir = DIR.LEFT; }
};
