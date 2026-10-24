// ---------- What the class items' Psynergy does: on the field, and in battle ----------
// The items and their classes are data (js/data/class_items.js); this is the machinery behind the Psynergy they teach.
// Field: eighteen things nobody in the two games could do - open a locked chest, fly a line to a hook post, light a dark
// gallery, run a low tunnel on four legs, sing a beast to sleep, hold a floor still, slip through bars, mend a bridge,
// shove an iron crate, dive, blow a drift away, walk a doll, ring a chime, draw a tide out, see the dead, transmute
// lead, uncover a whole floor, walk a blizzard. Each works on an object kind that maps place with the helpers at the
// bottom. Battle: the new Psynergy types - steal, multi-hit, songs, stances, charm, stasis, assassination, doom marks,
// prismatic (the element the foe fears), void (no resistance answers) and a revive for the whole line.
// field.js and battle.js call in through a handful of hooks; everything else is here so nothing of theirs moves.
'use strict';
const ClassExt = {
  // ---------------- field: timers and per-map state ----------------
  TIMED: { prowl: 900, shadow: 420, still: 600, ebb: 720, spiritSight: 900, warm: 720 },
  reset(F) { F.prowl = 0; F.shadow = 0; F.still = 0; F.ebb = 0; F.spiritSight = 0; F.warm = 0; F.lantern = false; F.puppet = null; F._extMap = F.map; },
  tick(F) {
    if (F._extMap !== F.map) this.reset(F);
    for (const k of Object.keys(this.TIMED)) if (F[k] > 0) { F[k]--; if (F[k] === 0) this.expired(F, k); }
    const M = F.map; if (!M) return;
    // the dead show only to Spirit Sight
    for (const n of F.npcs) if (n.data && n.data.spirit) n.hidden = !(F.spiritSight > 0);
    // the tide: the water stands or it does not
    for (const o of M.objects) if (o.kind === 'tide') o.tile = F.ebb > 0 ? (o.lowTile || 'tide_low') : (o.highTile || 'tide_high');
    // Stillness: everyone on the floor holds where they stand
    if (F.still > 0) for (const n of F.npcs) { if (n.move === 'wander' || n.move === 'patrol' || n.move === 'halted') { n.move = 'halted'; n.halted = 2; n.path = []; } }
  },
  expired(F, k) {
    if (k === 'ebb') { const p = F.player; const on = F.map.objects.find(o => o.kind === 'tide' && !o.gone && o.x === p.tx && o.y === p.ty); if (on) { const e = F.map.def.entry || { x: p.tx, y: p.ty }; F.showNotice('The tide came back!'); F.run(function* (E) { yield* E.warp(F.map.id, e.x, e.y, DIR.DOWN); }); } else F.showNotice('The tide comes back in.'); }
    else if (k === 'prowl') F.showNotice('The party stands up again.');
    else if (k === 'shadow') F.showNotice('The shadows let go.');
    else if (k === 'still') F.showNotice('Everything moves again.');
    else if (k === 'spiritSight') F.showNotice('The spirits fade from sight.');
    else if (k === 'warm') F.showNotice('The warmth fades.');
  },
  // the new object kinds' solidity (field.js asks here for any kind it does not know)
  solid(F, o) {
    switch (o.kind) {
      case 'lockedchest': case 'hookpost': case 'sleeper': case 'doll': case 'chime': case 'leadstatue': case 'sanddrift': case 'divespot': case 'gearbroken': return true;
      case 'tunnel': return !(F.prowl > 0);
      case 'bars': return !(F.shadow > 0);
      case 'tide': return !(F.ebb > 0);
      case 'blizzard': return !(F.warm > 0);
      case 'heavycrate': return o.state !== 'sunk';
      case 'floorswitch': return false;
      default: return !!o.solid;
    }
  },
  footSpeed(F, base) { return F.prowl > 0 ? Math.max(base, 2.2) : base; },
  // ---------------- field: the Psynergy ----------------
  // each handler gets the field and { x, y, o, M, spend, fail, saveObj }; it returns 'pass' to let field.js carry on
  field: {
    Lockpick(F, c) { const o = c.o; if (o && o.kind === 'lockedchest' && !o.opened) { c.spend(); o.opened = true; o.tile = 'chest_open'; G.set(o.key + ':opened'); Audio.sfx('item'); F.run(function* (E) { yield E.say('The lock gives. ' + (o.coins ? o.coins + ' coins!' : '')); if (o.coins) G.party.coins += o.coins; else yield E.give(o.item, o.qty || 1); }); return; } c.fail(); },
    Grapple(F, c) {
      const M = c.M, p = F.player, d = p.dir; let x = p.tx, y = p.ty, gaps = 0, post = null, landing = null;
      for (let i = 1; i <= 10; i++) { x += DX[d]; y += DY[d]; if (!M.inb(x, y)) break; const ob = F.objectAt(x, y); if (ob && ob.kind === 'hookpost') { post = ob; break; } if (M.isSolid(x, y) || (ob && F.objectSolid(ob))) { gaps++; landing = null; continue; } landing = { x, y }; }
      if (post && landing && gaps > 0 && !F.blocked(landing.x, landing.y, p)) { c.spend(); F.hop(p, d, landing); p.speed = 3; F.showNotice('The line catches, and pulls.'); return; }
      c.fail();
    },
    Lantern(F, c) { if (F.map.dark && !F.lantern) { c.spend(); F.lantern = true; F.showNotice('The lantern lights the dark.'); return; } c.fail(); },
    Prowl(F, c) { c.spend(); F.prowl = ClassExt.TIMED.prowl; F.showNotice('The party runs on four legs!'); },
    Serenade(F, c) { const o = c.o; if (o && o.kind === 'sleeper') { c.spend(); o.gone = true; c.saveObj(o); Audio.sfx('heal'); F.showNotice('The beast stirs, and wanders off.'); return; } c.fail(); },
    Stillness(F, c) { c.spend(); F.still = ClassExt.TIMED.still; F.showNotice('Everything on the floor holds still.'); },
    'Shadow Step'(F, c) { c.spend(); F.shadow = ClassExt.TIMED.shadow; F.showNotice('The party steps into the shadows.'); },
    Repair(F, c) {
      const M = c.M; let o = c.o;
      if (!o || o.kind !== 'broken') { const b = M.objects.find(ob => ob.kind === 'broken' && !ob.gone && (ob.cells || [[ob.x, ob.y]]).some(cell => cell[0] === c.x && cell[1] === c.y)); if (b) o = b; }   /* a bridge is several cells: any of them is the bridge */
      if (o && o.kind === 'broken') { c.spend(); for (const [x, y] of (o.cells || [[o.x, o.y]])) { persistGround(M, x, y, o.fixTile || 'bridge_fixed'); persistWalkable(M, x, y); } o.gone = true; c.saveObj(o); M.finalize(); Audio.sfx('push'); F.showNotice('Mended.'); if (o.onRepair) F.run(o.onRepair); return; }
      if (o && o.kind === 'gearbroken') { c.spend(); o.kind = 'gearfixed'; o.tile = 'gear_fixed'; o.state = 'fixed'; G.set('obj:' + o.key, { x: o.x, y: o.y, state: 'fixed', kind: 'gearfixed' }); Audio.sfx('push'); if (o.onRepair) F.run(o.onRepair); return; }
      c.fail();
    },
    Shove(F, c) {
      const o = c.o, M = c.M, d = F.player.dir; if (!(o && o.kind === 'heavycrate' && o.state !== 'sunk')) return c.fail();
      const nx = o.x + DX[d], ny = o.y + DY[d]; if (!M.inb(nx, ny)) return c.fail();
      const t = M.get(nx, ny); const other = F.objectAt(nx, ny);
      if (other || F.npcs.some(n => n.tx === nx && n.ty === ny)) return c.fail();
      if (t.water || t.kind === 'pit') { c.spend(); o.x = nx; o.y = ny; o.state = 'sunk'; o.tile = 'crate_iron_sunk'; c.saveObj(o); Engine.doShake(6); Audio.sfx('splash'); F.showNotice('The crate settles in, and can be walked on.'); return; }
      if (M.isSolid(nx, ny)) return c.fail();
      c.spend(); o.x = nx; o.y = ny; c.saveObj(o); Engine.doShake(4); Audio.sfx('push');
    },
    Dive(F, c) { const o = c.o; if (o && o.kind === 'divespot' && o.to) { c.spend(); Audio.sfx('splash'); F.run(function* (E) { yield E.say('The party dives!'); yield* E.warp(o.to.map, o.to.x, o.to.y, o.to.dir === undefined ? DIR.DOWN : o.to.dir); }); return; } c.fail(); },
    Sandstorm(F, c) { const o = c.o; if (o && o.kind === 'sanddrift') { c.spend(); o.gone = true; c.saveObj(o); Engine.doShake(6); F.showNotice('The drift blows away.'); if (o.onClear) F.run(o.onClear); return; } c.fail(); },
    Puppet(F, c) { let o = c.o; if (!o) { const p = F.player, d = p.dir; for (let i = 2; i <= 8 && !o; i++) { const x = p.tx + DX[d] * i, y = p.ty + DY[d] * i; if (!c.M.inb(x, y)) break; const ob = F.objectAt(x, y); if (ob) { if (ob.kind === 'doll') o = ob; break; } if (!c.M.isSolid(x, y) && c.M.get(x, y).kind !== 'pit') break; } }   /* the strings reach across a pit to a doll in line */ if (o && o.kind === 'doll') { c.spend(); F.puppet = { o, t: 0 }; F.camFocus = { x: o.x, y: o.y }; F.camEase = true; F.showNotice('The strings take hold. Walk the doll; X lets go.'); return; } c.fail(); },
    Rhythm(F, c) { const o = c.o; if (o && o.kind === 'chime' && o.state !== 'rung') { c.spend(); o.state = 'rung'; o.tile = 'chime_rung'; c.saveObj(o); Audio.sfx('levelup'); if (o.onRing) F.run(o.onRing); return; } c.fail(); },
    Ebb(F, c) { if (F.map.objects.some(o => o.kind === 'tide' && !o.gone)) { c.spend(); F.ebb = ClassExt.TIMED.ebb; Audio.sfx('splash'); F.showNotice('The tide draws out!'); return; } c.fail(); },
    'Spirit Sight'(F, c) { c.spend(); F.spiritSight = ClassExt.TIMED.spiritSight; F.showNotice(F.npcs.some(n => n.data && n.data.spirit) ? 'Something stands where nothing stood.' : 'Nothing lingers here.'); },
    Transmute(F, c) {
      const o = c.o; if (o && o.kind === 'leadstatue') { c.spend(); Engine.doFlash(8, '#ffe080'); if (o.gold) { o.gone = true; c.saveObj(o); const n = o.gold; G.party.coins += n; F.showNotice('Lead to gold: ' + n + ' coins!'); } else { o.kind = 'crate'; delete o.tile; G.set(o.key + ':transmuted'); F.showNotice('The statue is a plain crate now. Move can shift it.'); } return; }
      c.fail();
    },
    Scry(F, c) { const M = c.M; c.spend(); Engine.doFlash(10, '#c0c0ff'); let n = 0; for (const h of M.hidden || []) { if (!G.flag(M.id + ':scry:' + h.x + ',' + h.y)) n++; G.set(M.id + ':scry:' + h.x + ',' + h.y); } for (const o of M.objects) if (o.hiddenUntilReveal && o.key && !G.flag('obj:' + o.key + ':seen')) { G.set('obj:' + o.key + ':seen'); n++; } F.reveal = 900; F.scryAll = true; F.showNotice(n ? 'The eye uncovers ' + n + ' hidden thing' + (n > 1 ? 's' : '') + ' on this floor.' : 'Nothing on this floor is hidden.'); },
    Warmth(F, c) { c.spend(); F.warm = ClassExt.TIMED.warm; F.showNotice('Warmth spreads through the party.'); }
  },
  // the doll walks where the arrows say, one square a press; a floor switch under it is pressed; X lets the strings go
  updatePuppet(F) {
    const P = F.puppet, o = P.o, M = F.map; if (P.t > 0) P.t--;
    if (Input.pressed('b') || o.gone) { F.puppet = null; F.camFocus = null; F.camEase = true; F.showNotice('The strings go slack.'); return; }
    const d = Input.dirHeld(); if (d < 0 || P.t > 0) return;
    const nx = o.x + DX[d], ny = o.y + DY[d]; if (!M.inb(nx, ny) || F.blocked(nx, ny, null)) { P.t = 6; return; }
    o.x = nx; o.y = ny; P.t = 8; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: o.gone, state: o.state }); F.camFocus = { x: o.x, y: o.y }; F.camEase = true;
    const sw = M.objects.find(s => s.kind === 'floorswitch' && !s.gone && s.x === o.x && s.y === o.y && s.state !== 'down');
    if (sw) { sw.state = 'down'; sw.tile = 'floor_switch_down'; G.set('obj:' + sw.key, { x: sw.x, y: sw.y, state: 'down' }); Audio.sfx('push'); if (sw.onPress) F.run(sw.onPress); }
  },
  // ---------------- map helpers: the things the Psynergy works on ----------------
  lockedChest(M, x, y, item, qty, opts) { const o = { id: 'locked_' + x + '_' + y, tile: 'chest_locked', item, qty: qty || 1, coins: opts && opts.coins, script: function* (E) { const ob = G.field.objectAt(x, y); if (ob && ob.opened) { yield E.say('An empty chest, its lock picked.'); return; } yield E.say('A chest with a heavy lock. No key fits it - only a thief\'s touch would.'); } }; M.object('lockedchest', x, y, o); const ob = M.objects[M.objects.length - 1]; if (G.flag(ob.key + ':opened')) { ob.opened = true; ob.tile = 'chest_open'; } return M; },
  hookpost(M, x, y) { return M.object('hookpost', x, y, { id: 'hook_' + x + '_' + y, tile: 'hookpost', script: function* (E) { yield E.say('A post with an iron ring, across the gap. A line thrown to it would hold.'); } }); },
  tunnel(M, x, y) { return M.object('tunnel', x, y, { id: 'tunnel_' + x + '_' + y, tile: 'tunnel', script: function* (E) { yield E.say('A low tunnel through the rock. Nothing on two legs fits in it.'); } }); },
  sleeper(M, x, y, text) { return M.object('sleeper', x, y, { id: 'sleeper_' + x + '_' + y, tile: 'beast_sleeping', script: function* (E) { yield E.say(text || 'A great beast lies asleep across the way, and stirs when the party comes near. Nothing wakes it kindly - a song might.'); } }); },
  bars(M, x, y) { return M.object('bars', x, y, { id: 'bars_' + x + '_' + y, tile: 'bars', script: function* (E) { yield E.say('Iron bars. Not a lock on them, nothing to force: only a shadow could pass.'); } }); },
  brokenBridge(M, cells, fixTile) { const [x, y] = cells[0]; for (const [cx, cy] of cells) M.set(cx, cy, 'bridge_broken'); return M.object('broken', x, y, { id: 'broken_' + x + '_' + y, cells, fixTile: fixTile || 'bridge_fixed', script: function* (E) { yield E.say('A bridge with its middle gone. The planks are here; only the mending is wanting.'); } }); },
  brokenGear(M, x, y, onRepair) { M.object('gearbroken', x, y, { id: 'gear_' + x + '_' + y, tile: 'gear_broken', onRepair, script: function* (E) { yield E.say('A great gear, its teeth stripped. Repair would set it running.'); } }); const o = M.objects[M.objects.length - 1]; const st = G.flags['obj:' + o.key]; if (st && st.state === 'fixed') { o.kind = 'gearfixed'; o.tile = 'gear_fixed'; o.state = 'fixed'; } return M; },
  heavyCrate(M, x, y, id) { M.object('heavycrate', x, y, { id: id || ('iron_' + x + '_' + y), tile: 'crate_iron', script: function* (E) { yield E.say('An iron crate. Move does not so much as rock it.'); } }); const o = M.objects[M.objects.length - 1]; if (o.state === 'sunk') o.tile = 'crate_iron_sunk'; return M; },
  diveSpot(M, x, y, to, id) { return M.object('divespot', x, y, { id: id || ('dive_' + x + '_' + y), tile: 'dive_spot', to, script: function* (E) { yield E.say('The water turns in a slow ring here, over something deep.'); } }); },
  sandDrift(M, x, y, onClear) { return M.object('sanddrift', x, y, { id: 'drift_' + x + '_' + y, tile: 'sand_drift', onClear, script: function* (E) { yield E.say('A drift of sand fills the way. It would take a wind to shift it.'); } }); },
  doll(M, x, y, id) { return M.object('doll', x, y, { id: id || ('doll_' + x + '_' + y), tile: 'doll', script: function* (E) { yield E.say('A wooden doll on a stand, its strings hanging loose.'); } }); },
  floorSwitch(M, x, y, onPress) { M.object('floorswitch', x, y, { id: 'switch_' + x + '_' + y, tile: 'floor_switch', onPress }); const o = M.objects[M.objects.length - 1]; const st = G.flags['obj:' + o.key]; if (st && st.state === 'down') { o.state = 'down'; o.tile = 'floor_switch_down'; } return M; },
  chime(M, x, y, onRing) { M.object('chime', x, y, { id: 'chime_' + x + '_' + y, tile: 'chime', onRing, script: function* (E) { yield E.say('A bronze chime on a post. Silent, for now.'); } }); const o = M.objects[M.objects.length - 1]; if (o.state === 'rung') o.tile = 'chime_rung'; return M; },
  tide(M, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) M.object('tide', x, y, { id: 'tide_' + x + '_' + y, tile: 'tide_high' }); return M; },
  leadStatue(M, x, y, opts) { opts = opts || {}; M.object('leadstatue', x, y, { id: opts.id || ('lead_' + x + '_' + y), tile: 'lead_statue', gold: opts.gold, script: function* (E) { yield E.say(opts.gold ? 'A statue of dull lead. In the right hands, it would be worth its weight.' : 'A statue of lead, far too heavy to move. It would have to become something else.'); } }); const o = M.objects[M.objects.length - 1]; if (G.flag(o.key + ':transmuted')) { o.kind = 'crate'; delete o.tile; } return M; },
  blizzard(M, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) M.object('blizzard', x, y, { id: 'bliz_' + x + '_' + y, tile: 'blizzard' }); return M; },
  spirit(M, id, x, y, opts) { return M.npc(id, x, y, Object.assign({ type: 'villager_m', spirit: true, solid: false }, opts || {})); },
  // ---------------- battle: the new Psynergy types ----------------
  // each runs inside BattleScene (this): (actor, p, name, target, { isC, el, friendlyList, enemyList })
  battle: {
    *steal(actor, p, name, target, k) {
      if (!target || !target.alive) target = this.retarget(k.enemyList, target); if (!target) return;
      yield* this.playFx('status', [target]);
      if (k.isC && !p.coins && target.drop && !target.stolen && chance(0.6)) { target.stolen = true; const it = target.drop[0]; G.inventory.add(it, 1); yield this.say(actor.name + ' snatched ' + it + '!', 40); return; }
      if (k.isC && (p.coins || target.coins)) { const n = Math.max(1, Math.floor((target.coins || 10) * (0.4 + Math.random() * 0.4))); G.party.coins += n; target.coins = Math.max(0, (target.coins || 0) - n); yield this.say(actor.name + ' snatched ' + n + ' coins!', 40); return; }
      const dmg = this.physical(actor, target, { mult: 0.8 }); this.applyDamage(target, dmg, { from: actor }); yield this.say('Nothing to take - ' + actor.name + ' strikes instead.', 30);
    },
    *multi(actor, p, name, target, k) {
      for (let i = 0; i < (p.hits || 3); i++) { const alive = k.enemyList.filter(t => t.alive); if (!alive.length) break; const t = i === 0 && target && target.alive ? target : pick(alive); yield* this.playFx(['earth', 'water', 'fire', 'wind'][k.el], [t]); if (this.evade(actor, t)) { this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Miss', '#c0c0c0'); continue; } const dmg = this.physical(actor, t, { el: k.el, add: p.add || 0, mult: p.mult || 1 }); this.applyDamage(t, dmg, { from: actor }); Audio.sfx('hit'); yield 6; }
    },
    *song(actor, p, name, target, k) {
      const allies = k.friendlyList.filter(t => t.alive), foes = k.enemyList.filter(t => t.alive);
      if (p.stat) { yield* this.playFx('buff', allies); for (const t of allies) this.buff(t, p.stat, p.amt); }
      if (p.stat2) for (const t of allies) this.buff(t, p.stat2, p.amt3);
      if (p.debuff) { yield* this.playFx('status', foes); for (const t of foes) this.buff(t, p.debuff, p.amt2 !== undefined ? p.amt2 : p.amt); }
      yield this.say('The ' + (name.includes('Dance') || name === 'Trance' ? 'dance' : 'song') + ' turns the battle.', 25);
    },
    *stance(actor, p, name, target, k) { yield* this.playFx('buff', [actor]); actor.status.counter = true; actor.status.stanceT = p.turns || 3; yield this.say(actor.name + ' takes a stance: every blow will be answered.', 30); },
    *charm(actor, p, name, target, k) {
      const ts = p.range === 'all' ? k.enemyList.filter(t => t.alive) : [target && target.alive ? target : this.retarget(k.enemyList, target)];
      yield* this.playFx('status', ts.filter(Boolean));
      for (const t of ts) { if (!t) continue; if (t.boss || (t.statusResist && chance(t.statusResist)) || !chance(p.chance || 0.5)) { this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Resisted', '#c0c0c0'); continue; } t.status.charm = p.turns || 2; this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Charmed', '#ffa0e0'); }
    },
    *stasis(actor, p, name, target, k) {
      const ts = p.range && p.range !== 1 ? this.targetsInRange(k.enemyList, target && target.alive ? target : this.retarget(k.enemyList, target), p.range).map(x => x.t) : [target && target.alive ? target : this.retarget(k.enemyList, target)];
      yield* this.playFx('water', ts.filter(Boolean));
      for (const t of ts) { if (!t) continue; if ((t.boss && chance(0.7)) || (t.statusResist && chance(t.statusResist)) || !chance(p.chance || 0.5)) { this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Resisted', '#c0c0c0'); continue; } t.status.stasis = p.turns || 2; this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Stasis', '#a0e0ff'); }
    },
    *assassinate(actor, p, name, target, k) {
      if (!target || !target.alive) target = this.retarget(k.enemyList, target); if (!target) return;
      yield* this.playFx('status', [target]);
      if (!target.boss && !(target.data && target.data.hp >= 2000) && chance(p.kill || 0.25)) { this.applyDamage(target, target.hp, { from: actor }); yield this.say(target.name + ' never saw it coming!', 40); return; }
      if (this.evade(actor, target)) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Miss', '#c0c0c0'); return; }
      const dmg = this.physical(actor, target, { el: k.el, add: p.add || 0, mult: p.mult || 1 }); this.applyDamage(target, dmg, { from: actor }); Audio.sfx('hit');
    },
    *doom(actor, p, name, target, k) {
      if (!target || !target.alive) target = this.retarget(k.enemyList, target); if (!target) return;
      yield* this.playFx('status', [target]);
      if (target.status.doom) { this.popup(this.posOf(target).x, this.posOf(target).y - 20, 'Marked', '#c0c0c0'); return; }
      target.status.doom = p.turns || 3; target.doomPct = target.boss ? Math.min(p.pct || 0.5, 0.15) : (p.pct || 0.5);
      yield this.say(target.name + ' is marked. ' + target.status.doom + ' turns.', 35);
    },
    *prismatic(actor, p, name, target, k) {
      if (!target || !target.alive) target = this.retarget(k.enemyList, target); if (!target) return;
      const ts = this.targetsInRange(k.enemyList, target, p.range);
      yield* this.playFx('fire', ts.map(t => t.t), name);
      for (const { t, mult } of ts) { let el = 0, worst = -1; for (let e = 0; e < 4; e++) { const r = t.resist(e); if (worst < 0 || r < worst) { worst = r; el = e; } } const dmg = this.magic(actor, t, el, p.base, mult); this.applyDamage(t, dmg, { from: actor }); }
    },
    *void(actor, p, name, target, k) {
      if (!target || !target.alive) target = this.retarget(k.enemyList, target); if (!target) return;
      const ts = this.targetsInRange(k.enemyList, target, p.range);
      yield* this.playFx('status', ts.map(t => t.t), name);
      for (const { t, mult } of ts) { const was = t.resist; t.resist = () => 100; let dmg = this.magic(actor, t, 3, p.base, mult); t.resist = was; dmg = Math.floor(dmg * (k.isC ? 1.15 : 0.85)); this.applyDamage(t, dmg, { from: actor }); }   /* from a foe, the nothing is a little less: the party has no answer to it but HP */
    },
    *reviveall(actor, p, name, target, k) {
      const ts = k.friendlyList.filter(t => !t.alive); yield* this.playFx('heal', ts);
      if (!ts.length) { yield this.say('No one to bring back.', 25); return; }
      for (const t of ts) { t.status.down = false; t.hp = Math.floor((t.maxHpV ? t.maxHpV() : t.maxHp()) * (p.amt || 0.5)); this.popup(this.posOf(t).x, this.posOf(t).y - 20, 'Revived', '#80ff80'); }
      Audio.sfx('heal');
    }
  },
  // before an actor acts: stasis skips the turn; a charmed foe strikes its own side
  *beforeAct(a) {
    const s = a.actor.status;
    if (a.actor.rival && !s.stasis) { yield* ClassExt.rivalAct.call(this, a); return true; }
    if (s.stasis) { yield this.say(a.actor.name + ' is held outside of time.', 30); return true; }
    if (s.charm && !this.isChar(a.actor)) { const allies = this.enemies.filter(e => e.alive && e !== a.actor); if (allies.length) { const t = pick(allies); yield this.say(a.actor.name + ' turns on ' + t.name + '!', 30); const dmg = this.physical(a.actor, t, { mult: 1 }); this.applyDamage(t, dmg, { from: a.actor }); Audio.sfx('hit'); yield 20; return true; } }
    return false;
  },
  // at the turn's end: the marks and holds count down
  *endTurn(a) {
    const s = a.status;
    if (a.rival && a.alive) { for (const k in a.cd) { if (--a.cd[k] <= 0) delete a.cd[k]; } a.gainLimit(4); a.queuedCmd = null; }
    if (s.doom) { s.doom--; if (s.doom <= 0) { delete s.doom; const d = Math.max(1, Math.floor((a.maxHpV ? a.maxHpV() : a.maxHp()) * (a.doomPct || 0.5))); this.applyDamage(a, d); yield this.say(a.name + "'s mark comes due!", 40); } }
    if (s.stasis) { s.stasis--; if (s.stasis <= 0) delete s.stasis; }
    if (s.charm) { s.charm--; if (s.charm <= 0) delete s.charm; }
    if (s.stanceT) { s.stanceT--; if (s.stanceT <= 0) { delete s.stanceT; delete s.counter; } }
  },
  // ---------------- Rivals: Adepts fought as foes, with the player's own mechanics ----------------
  // Isaac's crew at the reunion (and anyone else made with ClassExt.rival): a real Character behind an enemy shell.
  // They fight the way the party's own tactician would - Psynergy, Djinn unleashes with cooldowns, a summon when the
  // gauge fills, items from their own bag - by running the battle's decision and execution code through a mirror in
  // which their side is 'the party' and the player's is 'the enemies'.
  num(n) { const f = () => n; f.valueOf = () => n; f.toString = () => String(n); f.toJSON = () => n; return f; },   // a number that can also be called: Enemy code reads e.maxHp, Character code calls maxHp()
  rival(name, ch, bag, look) {
    const st = ch.stats(); ch.hp = st.hp; ch.pp = st.pp; ch.cd = {}; ch.limit = 0; ch.validateSummon(G.party);
    const usable = ch.psynergy().filter(n => PSY[n] && !PSY[n].fieldOnly && PSY[n].type !== 'field');
    ENEMY_DB[name] = { n: name, hp: st.hp, pp: st.pp, atk: st.atk, def: st.def, agi: st.agi, lck: st.lck, t: 1, pw: [0, 1, 2, 3].map(e => ch.power(e)), rs: [0, 1, 2, 3].map(e => ch.resist(e)), ab: ['Attack'].concat(usable.slice(0, 7)), exp: ch.level * 35, c: 0, dr: null, g: 'rival', weapon: ch.equip.weapon || null, level: ch.level, rival: { ch, bag: bag || null, cls: ch.className() } };
    Monsters.customLooks[name] = look || ch.battleLook();
    return name;
  },
  rivalsInit(scene) {
    for (const e of scene.enemies) { const r = e.data && e.data.rival; if (!r || e.rival) continue; const ch = r.ch;
      e.rival = true; e.ch = ch; e.id = 'rival_' + ch.id; e.level = ch.level;
      e.maxHp = this.num(e.maxHp); e.maxPp = this.num(e.maxPp); e.lck = this.num(e.lck);
      e.djinn = ch.djinn; e.cd = ch.cd; e.summon = ch.summon; e.limit = 0; e.equip = ch.equip; e.base = ch.base; e.el = ch.el;
      e.psynergy = () => ch.psynergy(); e.stats = () => ch.stats(); e.className = () => ch.className(); e.skillReady = (n) => ch.skillReady(n); e.gearSum = (k) => ch.gearSum ? ch.gearSum(k) : 0;
      e.limitReady = () => e.alive && !!e.summon && e.limit >= 100; e.gainLimit = (n) => { e.limit = clamp((e.limit || 0) + n, 0, 100); };
      e.heal = (n) => { if (!e.alive) return 0; const was = e.hp; e.hp = Math.min(+e.maxHp, e.hp + n); return e.hp - was; };
      e.restorePP = (n) => { const was = e.pp; e.pp = Math.min(+e.maxPp, e.pp + n); return e.pp - was; };
      Object.defineProperty(e, 'down', { get() { return !e.alive; } });
      e.validateSummon = () => { ch.validateSummon(G.party); e.summon = ch.summon; };
      e.data.pow = ch.data.pow; e.power = (el) => el > 3 ? 100 : e.pow[el] + (e.tempPower ? (e.tempPower[el] || 0) : 0);   // a summon's power boost lands on them too
      e.availableSummons = () => ch.availableSummons(G.party);
    }
  },
  // the rival's turn: decide as the tactician would, then act through the mirror
  *rivalAct(a) {
    const scene = this, e = a.actor; const mine = (x) => !!(x && x.rival);
    const ov = { front: scene.enemies, enemies: scene.front, back: [], party: { members: scene.enemies }, aliveParty: () => scene.enemies.filter(x => x.alive), aliveEnemies: () => scene.front.filter(m => m.alive), isChar: (x) => mine(x), posOf: (x) => mine(x) ? { x: x.x, y: x.y } : scene.posOf(x), plan: null };
    const mirror = new Proxy(scene, { get: (t, k) => (k in ov) ? ov[k] : t[k], set: (t, k, v) => { if (k === 'plan') ov.plan = v; else t[k] = v; return true; } });
    const bag = e.data.rival.bag; const inv = G.inventory; if (bag) G.inventory = bag;
    let cmd = null;
    const key = (c) => !c ? '' : c.type + ':' + (c.psy || c.ab || c.djinn || c.summon || c.item || '');
    try {
      const decide = () => { mirror.resetPlan(); for (const r of scene.enemies) if (r !== e && r.rival && r.queuedCmd) mirror.notePlan(r, r.queuedCmd); return mirror.autoCommand(e); };
      cmd = decide();
      // a superboss rival never repeats itself: the same thing again is asked for once more with that option out of reach
      if (e.noRepeats && e.noRepeats() && e.lastAct && key(cmd) === e.lastAct) {
        const psyWas = e.psynergy, cdWas = e.cd, limitWas = e.limit; const k = e.lastAct;
        if (cmd.type === 'psy') e.psynergy = () => psyWas().filter(n => n !== cmd.psy);
        else if (cmd.type === 'djinn') e.cd = Object.assign({}, cdWas, { [cmd.djinn]: 1 });
        else if (cmd.type === 'summon') e.limit = 0;
        else if (cmd.type === 'attack') ov.banAttack = true;
        try { let again = decide(); if (key(again) === k) { const ts = scene.front.filter(m => m.alive); const alt = e.psynergy().filter(n => PSY[n] && ['magic', 'epa', 'drain'].includes(PSY[n].type) && PSY[n].pp <= e.pp && 'psy:' + n !== k); again = alt.length ? { type: 'psy', psy: alt[0], target: pick(ts) } : (k === 'attack:' ? { type: 'defend' } : { type: 'attack', target: pick(ts) }); } cmd = again; }
        finally { e.psynergy = psyWas; e.cd = cdWas; e.limit = limitWas; ov.banAttack = false; }
      }
      mirror.notePlan(e, cmd); e.queuedCmd = cmd; if (e.noRepeats && e.noRepeats()) e.lastAct = key(cmd);
    }
    catch (err) { cmd = { type: 'attack', target: pick(scene.front.filter(m => m.alive)) }; }
    try { if (cmd.type === 'summon' && !e.limitReady()) cmd = { type: 'attack', target: pick(scene.front.filter(m => m.alive)) }; yield* mirror.execute(e, cmd); }
    catch (err) { window._rivalErr = (err.stack || err.message); console.warn('rival', e.name, cmd && cmd.type, err); yield scene.say(e.name + ' hesitates. (' + err.message + ')', 20); }
    finally { G.inventory = inv; for (const r of scene.enemies) if (r.rival && r.alive) { r.dead = false; r.alpha = 1; } }
    return true;
  },
  // ---------------- people who teach a class, and beasts who guard one: ENEMY_DB rows made here ----------------
  // def: { hp, pp, atk, def, agi, lck, t, pw, rs, ab, exp, c, dr }; look: a BattleParty look (a person) or a family name
  FOES: {},   // name -> [row, look]: kept here too, so a reloaded ENEMY_DB (the test kit's hot sync) gets them back
  foe(name, def, look) {
    const row = Object.assign({ n: name, hp: 1000, pp: 100, atk: 100, def: 40, agi: 60, lck: 20, t: 1, pw: [100, 100, 100, 100], rs: [100, 100, 100, 100], ab: ['Attack'], exp: 500, c: 300, dr: null, g: 'classitem' }, def);
    ClassExt.FOES[name] = [row, look]; ENEMY_DB[name] = row;
    if (look && typeof look === 'object') Monsters.customLooks[name] = look;
    return name;
  },
  // a teacher's crew: three companions scaled from the teacher's own row (the user's rule: a class-item teacher brings a
  // full party of four). role: 'fighter' (a blade and a technique), 'healer' (mends the teacher), 'caster' (the element's
  // Psynergy); each gets a townsfolk look, and a quarter of the teacher's exp and coins
  ROLE_AB: { fighter: (tech) => ['Attack', tech], healer: () => ['Attack', 'Ply Well', 'Cure Well', 'Restore'], caster: (el) => ['Attack'].concat({ 0: ['Quake Sphere', 'Stone Spire'], 1: ['Ice Missile', 'Glacier'], 2: ['Fireball', 'Volcano'], 3: ['Storm Ray', 'Shine Plasma'] }[el] || ['Storm Ray']) },
  crew(teacher, members) {
    const t = ENEMY_DB[teacher]; if (!t) return [];
    return members.map(([name, role, lookType, seed, extra]) => {
      const k = role === 'healer' ? 0.5 : 0.6; const ab = ClassExt.ROLE_AB[role](extra);
      const row = { hp: Math.round(t.hp * k), pp: role === 'fighter' ? Math.round(t.pp * 0.4) : Math.round(t.pp * 0.9) + 60, atk: Math.round(t.atk * (role === 'fighter' ? 0.9 : 0.75)), def: Math.round(t.def * 0.85), agi: Math.round(t.agi * 0.9), lck: t.lck, t: 1, pw: t.pw.slice(), rs: t.rs.map(r => Math.round(r * 0.9)), ab, exp: Math.round(t.exp * 0.25), c: Math.round(t.c * 0.25) };
      return ClassExt.foe(name, row, npcLook(lookType, seed));
    });
  },
  // the crew stands beside their teacher for the bout, and is gone after it
  *crewBout(E, teacher, crew, battleOpts) {
    const F = E.field, M = F.map, p = F.player; const anchor = F.npcs.find(a => a.npc && a.npc.name === teacher) || p; const taken = [];
    const free = (x, y) => M.inb(x, y) && !M.isSolid(x, y) && !(x === p.tx && y === p.ty) && !F.npcs.some(n => !n.hidden && n.tx === x && n.ty === y) && !taken.some(c => c[0] === x && c[1] === y);
    const cand = []; for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) === r || Math.abs(dy) === r) cand.push([anchor.tx + dx, anchor.ty + dy]);
    const ids = []; crew.forEach((name, i) => { const c = cand.find(([x, y]) => free(x, y)); if (!c) return; taken.push(c); const id = '__crew' + i; E.spawn(id, c[0], c[1], { look: Monsters.customLooks[name] || npcLook('villager_m', i), name, dir: DIR.DOWN }); ids.push(id); });
    Audio.sfx('jump'); yield 24; yield E.say('(' + teacher + "'s companions step up beside " + (crew.length === 3 ? 'their teacher' : teacher) + '.)');
    const r = yield* E.battle([teacher].concat(crew), battleOpts); for (const id of ids) E.despawn(id); return r;
  },
  ensureFoes() { for (const [name, [row, look]] of Object.entries(ClassExt.FOES)) { if (!ENEMY_DB[name]) ENEMY_DB[name] = row; if (look && typeof look === 'object' && !Monsters.customLooks[name]) Monsters.customLooks[name] = look; } }
};
// the field asks these of itself
FieldScene.prototype.updatePuppet = function () { ClassExt.updatePuppet(this); };
// the map files loaded before this one: their foes are registered now
for (const f of (window.__classFoes || [])) f(); window.__classFoes = [];
