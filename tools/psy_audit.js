// Field-Psynergy audit: a scratch map with one target of every kind, and each field spell cast at its target from
// the tile beside it; the effect is checked afterwards. Run in a game tab after tools/testboot.js: psyAudit()
// returns { ok: [...], bad: [...] } and posts runner/psy_audit.json. The party is given every spell for the test.
window.psyAudit = function () {
  const W = 48, H = 12;
  const targets = [];   // [name of spell, x, y, place(M), check(F, M)]
  const at = (i) => 2 + i * 2;   // targets stand in a row along y = 4; the caster stands at y = 5 under each
  const add = (spell, place, check) => targets.push([spell, at(targets.length), 4, place, check]);
  const obj = (M, kind, x, y, o) => M.object(kind, x, y, Object.assign({ id: 'pa_' + kind + '_' + x }, o || {}));
  const find = (M, id) => M.objects.find(o => o.id === id);
  add('Move', (M, x, y) => obj(M, 'pillar', x, y), (F, M, x, y) => { const o = find(M, 'pa_pillar_' + x); return o && o.x === x && o.y === y - 1 ? true : 'pillar did not move (' + (o && (o.x + ',' + o.y)) + ')'; });
  add('Frost', (M, x, y) => obj(M, 'puddle', x, y), (F, M, x, y) => { const o = find(M, 'pa_puddle_' + x); return o && o.kind === 'icepillar' ? true : 'puddle not frozen'; });
  add('Growth', (M, x, y) => { obj(M, 'sprout', x, y); }, (F, M, x, y) => { const o = find(M, 'pa_sprout_' + x); const ot = M.getObj(x, y); return o && o.gone && ot && ot.name === 'vineladder' ? true : 'no vine grew'; });
  add('Whirlwind', (M, x, y) => obj(M, 'vines', x, y, { reveal: 'lc_door' }), (F, M, x, y) => { const o = find(M, 'pa_vines_' + x); const ot = M.getObj(x, y); return o && o.gone && ot && ot.name === 'lc_door' ? true : 'vines not cleared'; });
  add('Gale', (M, x, y) => obj(M, 'leaves', x, y), (F, M, x, y) => { const o = find(M, 'pa_leaves_' + x); return o && o.gone ? true : 'leaves not cleared'; });
  add('Cyclone', (M, x, y) => obj(M, 'leaves', x, y, { onClear: function* (E) { G.set('pa_cyclone_ok'); } }), (F, M, x, y) => G.flag('pa_cyclone_ok') ? true : 'leaves not cleared / onClear not run');
  add('Douse', (M, x, y) => obj(M, 'fire', x, y), (F, M, x, y) => { const o = find(M, 'pa_fire_' + x); return o && o.gone ? true : 'fire not doused'; });
  add('Lash', (M, x, y) => obj(M, 'rope', x, y, { len: 2 }), (F, M, x, y) => { const o = find(M, 'pa_rope_' + x); return o && o.state === 'tied' && !M.isSolid(x, y - 1) ? true : 'rope not tied / cell above not walkable'; });
  add('Pound', (M, x, y) => obj(M, 'pillar', x, y), (F, M, x, y) => { const o = find(M, 'pa_pillar_' + x); return o && o.state === 'sunk' ? true : 'pillar not sunk'; });
  add('Scoop', (M, x, y) => obj(M, 'scoop', x, y, { item: 'Nut' }), (F, M, x, y) => { const o = find(M, 'pa_scoop_' + x); return o && o.gone && G.inventory.has('Nut') ? true : 'nothing dug up'; });
  add('Tremor', (M, x, y) => obj(M, 'shakeable', x, y, { tile: 'crate', onShake: function* (E) { G.set('pa_tremor_ok'); } }), (F, M, x, y) => G.flag('pa_tremor_ok') ? true : 'shakeable did not shake');
  add('Burst', (M, x, y) => obj(M, 'crack', x, y, { reveal: 'lc_door' }), (F, M, x, y) => { const o = find(M, 'pa_crack_' + x); return o && o.gone ? true : 'crack not burst'; });
  add('Lift', (M, x, y) => obj(M, 'boulder', x, y), (F, M, x, y) => { const o = find(M, 'pa_boulder_' + x); return o && o.gone ? true : 'boulder not lifted'; });
  add('Force', (M, x, y) => obj(M, 'stump', x, y, { onForce: function* (E) { G.set('pa_force_ok'); } }), (F, M, x, y) => G.flag('pa_force_ok') ? true : 'stump did not take Force');
  add('Catch', (M, x, y) => obj(M, 'catchable', x, y, { item: 'Herb' }), (F, M, x, y) => { const o = find(M, 'pa_catchable_' + x); return o && o.gone && G.inventory.has('Herb') ? true : 'nothing caught'; });
  add('Blaze', (M, x, y) => obj(M, 'torch', x, y), (F, M, x, y) => { const o = find(M, 'pa_torch_' + x); return o && o.state === 'lit' ? true : 'torch not lit'; });
  add('Parch', (M, x, y) => { M.set(x, y, 'water'); obj(M, 'pool', x, y, { tiles: [[x, y]], dryTile: 'cave' }); }, (F, M, x, y) => { const o = find(M, 'pa_pool_' + x); return o && o.gone && !M.isSolid(x, y) ? true : 'pool not dried'; });
  add('Halt', (M, x, y) => M.npc('pa_halt_npc', x, y, { type: 'villager_m', move: 'wander', haltable: true, text: '...' }), (F, M, x, y) => { const n = F.npcs.find(n => n.id === 'pa_halt_npc'); return n && n.halted > 0 ? true : 'npc not halted'; });
  add('Mind Read', (M, x, y) => M.npc('pa_mind_npc', x, y, { type: 'villager_f', dir: DIR.DOWN, text: 'Hello.', mind: '(a thought)' }), (F, M, x, y) => F.event || F.textbox.active ? true : 'no thought shown');
  add('Grind', (M, x, y) => obj(M, 'rock_water', x, y), (F, M, x, y) => { const o = find(M, 'pa_rock_water_' + x); return o && o.state === 'sunk' ? true : 'rock not ground down'; });
  add('Carry', (M, x, y) => obj(M, 'carriable', x, y, { tile: 'crate' }), (F, M, x, y) => F.carrying ? true : 'nothing picked up');
  // the self-cast spells: checked on the caster's state
  const selfSpells = { Reveal: (F) => F.reveal > 0 ? true : 'reveal timer not set', Cloak: (F) => F.cloaked > 0 ? true : 'not cloaked', Avoid: (F) => G.party.avoidSteps > 0 ? true : 'avoid not set',
    Sand: (F) => F.sandForm ? true : 'not in sand form', Hover: (F) => F.hovering ? true : 'not hovering', Retreat: (F) => F.event ? true : 'no retreat scene', Teleport: () => Engine.top && Engine.top.constructor.name === 'TeleportScene' ? true : 'no teleport menu' };
  defineMap('psy_audit', { name: 'Psynergy Audit', w: W, h: H, base: 'cave', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 2, y: 8 }, retreat: { map: 'psy_audit', x: 2, y: 8, dir: DIR.DOWN },
    build(M) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) M.set(x, y, 'cave'); M.set(1, 8, 'sandsoft'); M.object('hoverpad', 3, 8, { id: 'pa_hoverpad' }); for (const [spell, x, y, place] of targets) place(M, x, y); } });
  const F = G.field; const results = { ok: [], bad: [] };
  // everyone knows everything for the test
  const ALL = [...targets.map(t => t[0]), ...Object.keys(selfSpells)];
  for (const m of G.party.members) { for (const n of ALL) if (PSY[n]) m.learnExtra(n); m.pp = 999; }
  G.set('teleportUnlocked');
  const cast = (name) => { try { F.usePsy(name); } catch (e) { return 'threw ' + e.message; } return null; };
  F.loadMap('psy_audit', 2, 8, DIR.UP); Engine.fade = 0; Engine.fadeDir = 0; F.event = null; F.eventQueue = []; F.textbox.active = false;
  const M = G.map;
  for (const [spell, x, y, place, check] of targets) {
    if (!PSY[spell]) { results.bad.push(spell + ': not in PSY table'); continue; }
    F.player.tx = x; F.player.ty = y + 1; F.player.px = x * TILE; F.player.py = (y + 1) * TILE; F.player.dir = DIR.UP; F.player.moving = false; F.event = null; F.textbox.active = false;
    const err = cast(spell); if (err) { results.bad.push(spell + ': ' + err); continue; }
    if (spell === 'Move' && F.moveAim) { Input.hold('up', 2); try { F.updateMoveAim ? F.updateMoveAim() : null; } catch (e) { } const o = F.moveAim && F.moveAim.o; if (o && F.moveObject) { try { F.moveObject(o, DIR.UP); } catch (e) { } } F.moveAim = null; }
    for (let i = 0; i < 12; i++) { try { if (F.event) F.tickEvent ? F.tickEvent() : F.update(); } catch (e) { break; } }   // let a scene the spell started run its first lines
    const r = check(F, M, x, y); if (r === true) results.ok.push(spell); else results.bad.push(spell + ': ' + r);
    F.event = null; F.eventQueue = []; F.textbox.active = false; F.psyFx = null;
  }
  for (const [spell, chk] of Object.entries(selfSpells)) {
    if (!PSY[spell]) { results.bad.push(spell + ': not in PSY table'); continue; }
    F.player.tx = spell === 'Sand' ? 1 : spell === 'Hover' ? 3 : 2; F.player.ty = 8; F.player.px = F.player.tx * TILE; F.player.py = 8 * TILE; F.player.dir = DIR.UP; F.player.moving = false; F.event = null; F.textbox.active = false;
    const err = cast(spell); if (err) { results.bad.push(spell + ': ' + err); continue; }
    const r = chk(F); if (r === true) results.ok.push(spell); else results.bad.push(spell + ': ' + r);
    while (Engine.top !== F && Engine.scenes.length > 1) Engine.pop(); F.event = null; F.eventQueue = []; F.textbox.active = false; F.hovering = false; F.sandForm = false; F.cloaked = 0; F.reveal = 0;
  }
  // the table: every field spell has a PP cost and an element
  for (const n of ALL) if (PSY[n] && !(PSY[n].pp >= 0)) results.bad.push(n + ': no PP cost in PSY');
  results.summary = results.ok.length + ' ok, ' + results.bad.length + ' bad';
  fetch('/log?name=psy_audit.json', { method: 'POST', body: JSON.stringify(results, null, 1) });
  return results;
};
'psy_audit loaded';
