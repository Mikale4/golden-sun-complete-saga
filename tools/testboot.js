// One call to make a fresh game tab a test bench: loads the runner, the plans and the test kit with synchronous
// requests (a hidden tab throttles fetch to a crawl), builds the plan, and defines stepAt/runAt for running a plan
// step by its text. In the tab: (0, eval)((await (await fetch('/tools/testboot.js')).text()))  - or paste it.
(function () {
  const load = (f) => { const x = new XMLHttpRequest(); x.open('GET', '/' + f + '?v=' + Date.now(), false); x.send(); (0, eval)(x.responseText); };
  for (const f of ['runner/runner.js', 'runner/plan_gs1.js', 'runner/plan_tla.js', 'tools/testkit.js', 'tools/map_check.js', 'tools/mapshot.js']) load(f);
  R.plan = PLAN_GS1.concat(PLAN_TLA);
  // the first plan step equal to arr after index `after` (TLA steps by default)
  window.stepAt = (arr, after) => R.plan.findIndex((s, i) => i > (after === undefined ? 1380 : after) && JSON.stringify(s) === JSON.stringify(arr));
  // run the plan from that step for ms of CPU time; returns where it stopped and why
  window.runAt = (arr, ms, after) => { const i = stepAt(arr, after); if (i < 0) return 'not found'; R.issues = []; const res = TK.runFrom(i, ms || 12000); return { res: typeof res === 'object' ? { pc: res.pc, status: res.status, issues: (res.issues || []).slice(-3) } : res, map: G.map.id, pos: [G.field.player.tx, G.field.player.ty], log: R.log.slice(-6) }; };
  // back to the field after a game over, the party on its feet
  window.recover = () => { while (Engine.scenes.length > 1) Engine.pop(); if (!(Engine.top instanceof FieldScene)) { const F = new FieldScene(); Engine.replace(F); G.field = F; } for (const m of G.party.members) { m.status = {}; m.hp = m.maxHp(); m.pp = m.maxPp(); } G.party.active = G.party.members.slice(); G.party.reserve = []; R.stopped = false; R._retries = 0; };
  // Piers into the party, as the story would have him
  window.addPiers = (level) => { if (G.party.get('Piers')) return; const c = new Character('Piers', level || 18); for (const d of ['Spring', 'Shade']) { c.setDjinn(d); G.party.djinnFound.push(d); } c.equip.weapon = 'Long Sword'; c.equip.body = 'Chain Mail'; G.party.add(c); G.field.rebuildFollowers(); };
  return 'test bench ready: ' + R.plan.length + ' steps';
})();
