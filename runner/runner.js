// Playthrough runner: an autonomous player for the game (see runner/README.md). Reconstructed from the live
// object in the game tab after the source file was lost; the ops, pathfinding, battle AI, checkpoints and
// screenshots are all here.
'use strict';
window.R = {
  plan: [],
  pc: 0,
  log: [],
  issues: [],
  shotsTaken: 0,
  started: false,
  stopped: false,
  opts: {"shots":true,"fightDjinn":true,"chests":true,"autoLevel":true,"grindOnLoss":true,"readDelay":6,"continueOnFail":false},
  say(msg) { this.log.push('[' + this.pc + '] ' + msg); },
  issue(kind, msg) { const s = this.status(); const rec = { kind, msg, step: this.pc, stepDef: JSON.stringify(this.plan[this.pc] || null), map: s.map, pos: s.pos, party: s.party }; this.issues.push(rec); this.log.push('!! ' + kind + ': ' + msg + ' @' + s.map + ' ' + JSON.stringify(s.pos)); return rec; },
  status() { const F = G.field; const p = F && F.player; return { map: G.map && G.map.id, pos: p ? [p.tx, p.ty] : null, dir: p && p.dir, event: !!(F && F.event), tb: !!(F && F.textbox.active), top: Engine.top && Engine.top.constructor.name, party: G.party ? G.party.members.map(m => m.name + 'L' + m.level + (m.alive ? '' : '(down)')) : [], coins: G.party && G.party.coins, ship: !!(F && F.ship) }; },
  trace(fn, extra) { try { localStorage.setItem('rtrace', fn + ' ' + (extra || '') + ' @' + Date.now()); } catch (e) { } },
  *frames(n) { this.trace('frames', n + ' top=' + Engine.top.constructor.name + ' turn=' + (Engine.top.turn || '')); for (let i = 0; i < n; i++) { yield; const tn = Engine.top.constructor.name; if (this._lastTop === 'BattleScene' && tn !== 'BattleScene') Input.holdT = {}; this._lastTop = tn; } /* a key still held from the battle menus must not walk the party on the field */ this._frameBudget = (this._frameBudget === undefined ? 1e9 : this._frameBudget) - n; if (this._frameBudget < 0) throw new Error('watchdog: frame budget exhausted (step is looping)'); if (this.deadline && performance.now() > this.deadline + 20000) throw new Error('watchdog: step exceeded the time budget by 20s'); },
  *shot(label) {
    if (!this.opts.shots) return;
    // let any fade / flash / shake finish first so the capture shows the scene, not the transition
    for (let i = 0; i < 120 && (Engine.fade > 0 || Engine.fadeDir !== 0 || Engine.flash > 0 || Engine.shake > 0); i++) yield;
    Engine.draw();
    try { const src = Engine.canvas; const c = document.createElement('canvas'); c.width = src.width * 3; c.height = src.height * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, c.width, c.height); const data = c.toDataURL('image/png'); this.shotsTaken++; fetch('/shot?name=' + encodeURIComponent(label), { method: 'POST', body: data }); this.say('shot ' + label); } catch (e) { this.say('shot failed: ' + e.message); }
  },
  checkpoint(label) { if (this.opts.noCheckpoints) return; const F = G.field; const data = { v: 1, flags: G.flags, party: G.party.serialize(), inv: G.inventory.serialize(), mapId: G.mapId, x: F.player.tx, y: F.player.ty, dir: F.player.dir, playtime: G.playtime, game: G.game, visited: G.visited, ship: F.ship, pc: this.pc, label, isaacParty: G.isaacParty || null, bestiary: G.bestiary || {}, campResting: G.campResting || [] };   /* the bestiary and the camp's roster travel with the checkpoint, as with a player's save */ const js = JSON.stringify(data); const key = 'runner_ckpt_' + (this.opts.ckptPrefix || '') + label; (this.ckpts = this.ckpts || {})[key] = js; this.ckpts.runner_ckpt = js; if (!this.opts.ckptMemOnly) { try { localStorage.setItem('runner_ckpt', js); localStorage.setItem(key, js); } catch (e) { } } if (!this.opts.noUpload) { try { fetch('/log?name=ckpt_' + (this.opts.ckptPrefix || '') + label + '.json', { method: 'POST', body: js }); } catch (e) { } }   /* mirrored to runner/ckpt_*.json on disk: the browser's storage does not survive a reboot */   /* opts.ckptPrefix keeps one run's checkpoints apart from another's (the real run's from the test runs') */ this.lastCkpt = data; this.say('checkpoint ' + label); },
  checkpointMerge(label) {
    if (this.opts.noCheckpoints) return; const key = 'runner_ckpt_' + (this.opts.ckptPrefix || '') + label; let old = null;
    try { const s = (this.ckpts && this.ckpts[key]) || (this.opts.ckptMemOnly ? null : localStorage.getItem(key)); if (s) old = JSON.parse(s); } catch (e) { }
    if (!old && !this.opts.ckptMemOnly) { try { const x = new XMLHttpRequest(); x.open('GET', '/runner/ckpt_' + (this.opts.ckptPrefix || '') + label + '.json?v=' + Date.now(), false); x.send(); if (x.status === 200 && x.responseText.startsWith('{')) old = JSON.parse(x.responseText); } catch (e) { } }
    if (!old) return;
    const flags = Object.assign({}, G.flags); for (const k of ['shipX', 'shipY', 'onShip', 'ship_on_water']) if (k in old.flags) flags[k] = old.flags[k]; else delete flags[k];   /* the ship stays where the checkpoint had it */
    const data = Object.assign({}, old, { flags, party: G.party.serialize(), inv: G.inventory.serialize(), playtime: G.playtime, visited: G.visited, isaacParty: G.isaacParty || null, pc: old.pc, bestiary: G.bestiary || {}, campResting: G.campResting || [] });
    const js = JSON.stringify(data); (this.ckpts = this.ckpts || {})[key] = js; this.ckpts.runner_ckpt = js; if (!this.opts.ckptMemOnly) { try { localStorage.setItem('runner_ckpt', js); localStorage.setItem(key, js); } catch (e) { } } if (!this.opts.noUpload) { try { fetch('/log?name=ckpt_' + (this.opts.ckptPrefix || '') + label + '.json', { method: 'POST', body: js }); } catch (e) { } }
    this.say('checkpoint ' + label + ' kept up to date (levels, gear, bag)');
  },
  restore(label) { const key = label ? 'runner_ckpt_' + (this.opts.ckptPrefix || '') + label : 'runner_ckpt'; let s = (this.ckpts && this.ckpts[key]) || null; if (!s && !this.opts.ckptMemOnly) s = localStorage.getItem(key) || (label ? localStorage.getItem('runner_ckpt_' + label) : null); if (!s && label && !this.opts.ckptMemOnly) { try { const x = new XMLHttpRequest(); x.open('GET', '/runner/ckpt_' + (this.opts.ckptPrefix || '') + label + '.json?v=' + Date.now(), false); x.send(); if (x.status === 200 && x.responseText.startsWith('{')) s = x.responseText; } catch (e) { } } if (!s) return false; const data = JSON.parse(s); while (Engine.scenes.length > 1) Engine.pop(); let F = Engine.top; if (!(F instanceof FieldScene)) { F = new FieldScene(); Engine.replace(F); } SaveSystem.apply(data, F); if (data.isaacParty) G.isaacParty = data.isaacParty; F.event = null; F.eventQueue = []; F.textbox.active = false; Engine.fade = 0; Engine.fadeDir = 0; this._prowlWear = null; this._classSwap = null;   /* whatever was borrowed on the field is moot in the restored state */ const idx = this.plan.findIndex(st => st[0] === 'ckpt' && st[1] === data.label); this.pc = idx >= 0 ? idx : data.pc; this.stopped = false; this.say('restored ' + data.label + ' pc=' + this.pc); this.lastCkpt = { label: label || 'runner_ckpt', pc: this.pc }; return true; },
  installBattleAI() {
    if (this._aiInstalled) return; this._aiInstalled = true; const self = this;
    const origPush = Engine.push.bind(Engine);
    Engine.push = function (scene) { if (scene instanceof BattleScene && !self.aiPaused) { const tac = self.tactician(scene); scene.autoBattle = (ch, t) => { const cmd = tac(ch, t); self.lastCmd = { who: ch.name, cmd: JSON.stringify(cmd, (k, v) => (k === 'target' && v) ? v.name : (k === 'used' ? undefined : v)) }; return cmd; }; self.battles = (self.battles || 0) + 1; self.lastBattle = { enemies: scene.enemies.map(e => e.name), boss: !!scene.opts.boss, turn: 0 }; } return origPush(scene); };
    G.debugAuto = true;
  },
  // the user's rule: with everyone at the cap (the reserve too) there is nothing left to earn - no training, no strangers
  // asked, and an ordinary monster fight is run from
  allMaxed() { const cap = typeof MAX_LEVEL !== 'undefined' ? MAX_LEVEL : 99; return G.party.members.length > 0 && G.party.members.every(m => m.level >= cap); },
  tactician(b) { return (ch) => (this.allMaxed() && !b.opts.boss && b.opts.canFlee !== false && !b.enemies.some(e => e.boss || e.rival || (e.data && e.data.g === 'traveler'))) ? 'flee' : b.autoCommand(ch); },
  *idle(maxFrames) { this.trace('idle');
    maxFrames = maxFrames || this.opts.idleFrames || 6000; let n = 0, cool = 0, bn = 0;
    while (n < maxFrames && bn < 60000) {
      const F = G.field, top = Engine.top;
      if (top !== F) { const nm = top.constructor.name; if (nm === 'GameOverScene') return 'gameover'; if (nm === 'BattleScene') { this.lastBattle && (this.lastBattle.turn = top.turn); bn++; n--; if (this._stallTurn !== top.turn || this._stallMsg !== top.msg) { this._stallTurn = top.turn; this._stallMsg = top.msg; this._stallN = 0; } else if (++this._stallN > 2500) { this.issue('battle-stalled', 'battle stopped progressing at turn ' + top.turn + ' (' + top.msg + ') last cmd ' + JSON.stringify(this.lastCmd)); while (Engine.top !== F) Engine.pop(); F.event = null; F.eventQueue = []; for (const m of G.party.members) m.clearBattleState && m.clearBattleState(); this._stallN = 0; return 'stalled'; } } if (nm === 'MenuScene' || nm === 'ShopScene' || nm === 'ForgeScene' || nm === 'SaveSlotScene' || nm === 'FountainScene') { this._strayMenu = (this._strayMenu || 0) + 1; if (this._strayMenu % 8 === 1) Input.hold('b', 2); /* a press wants a release before it: not a permanent hold */ if (this._strayMenu > 400) { this.say('note: a stray ' + nm + ' would not close - popped it'); while (Engine.top !== F && Engine.scenes.length > 1) Engine.pop(); this._strayMenu = 0; } } } else this._strayMenu = 0;   // a screen we did not mean to open is backed out of
      const tb = F.textbox;
      // a stranger on the road: never pay a bandit off, and never start a fight with someone who asked for one; walk on
      if (tb.active && tb.choice && tb.waiting) { const c = tb.choice; if (this._wantFight) { const f = c.indexOf('Fight anyway') >= 0 ? c.indexOf('Fight anyway') : c.indexOf('Fight') >= 0 ? c.indexOf('Fight') : c.indexOf('Refuse') >= 0 ? c.indexOf('Refuse') : c.indexOf('Yes'); if (f >= 0) tb.choiceIdx = f; } else { const want = c.indexOf('Refuse') >= 0 ? c.indexOf('Refuse') : c.indexOf('Not today') >= 0 ? c.indexOf('Not today') : c.indexOf('No thanks') >= 0 ? c.indexOf('No thanks') : -1; if (want >= 0) tb.choiceIdx = want; } }   /* a fight the runner picked itself (grindTravelers) is accepted; any other offer is declined */
      if (tb.active && tb.waiting && cool <= 0) { Input.hold('a', 2); cool = Math.max(3, this.opts.readDelay || 8); }   // a release between presses, or the box never sees a new one
      if (!F.event && !tb.active && top === F && !Engine.fadeDir && !F.player.moving && !F.psyMenu) return true;
      (yield* this.frames(1)); n++; cool--;
    }
    return false;
  },
  blockedNoNpc(x, y) { const F = G.field, M = F.map; if (!M.inb(x, y)) return true; if (M.objects.some(o => !o.gone && (o.kind === 'icepillar' || (o.kind === 'carriable' && o.state === 'bridge')) && o.x === x && o.y === y)) return false; if (F.hiddenAt && (F.revealed(x, y) || F.reveal > 0)) { const h = F.hiddenAt(x, y); if (h && !Tiles.get(h.tile).solid && !M.objects.some(o => !o.gone && o.x === x && o.y === y && F.objectSolid(o))) return false; }   /* a hidden way seen under Reveal (the circle of sight walks with the party) */ if (F.floatLogAt && F.floatLogAt(x, y)) return false; /* a pole afloat is walked along */ if (M.world && !F.ship && G.flag('hasShip') && x === G.get('shipX') && y === G.get('shipY')) return false; if (F.ship) { const t = M.get(x, y); const wings = M.world && G.flag('ship_wings'); if (t.river && !wings) return true; const o = M.getObj(x, y); if (o && o.solid) return true; if (M.objects.some(ob => !ob.gone && ob.x === x && ob.y === y && F.objectSolid(ob))) return true; return !(t.water || t.name === 'w_dock' || t.name === 'dock' || t.name === 'w_beach' || t.place || (wings && FieldScene.flyable(t))); } if (M.isSolid(x, y)) { const ot = M.getObj(x, y); if (!(ot && ot.ladder)) { if (!(F.sandForm && M.get(x, y).softsand)) return true; } } for (const o of M.objects) { if (o.gone) continue; if (o.kind === 'log') { if (F.logCells(o).some(c => c[0] === x && c[1] === y)) return true; continue; } if (o.x === x && o.y === y && F.objectSolid(o)) return true; } return false; },
  path(tx, ty, opts) { this.trace('path');
    opts = opts || {}; const F = G.field, M = F.map, p = F.player; const start = p.tx + ',' + p.ty; const goal = tx + ',' + ty;
    const statics = new Set(F.npcs.filter(n => !n.hidden && (opts.avoidNpcs || (n.move !== 'wander' && !n.traveler && !n.trainee)) && !(n.npc && n.npc.solid === false)).map(n => n.tx + ',' + n.ty));
    const twisters = M.objects.filter(o => o.kind === 'tornado' && !o.gone && (typeof o.active === 'function' ? o.active() : o.active !== false));   /* a twister stilled by its statue's shove is walked past */
    const nearTwister = (x, y) => twisters.some(o => (o.x1 !== undefined ? (o.y === y && Math.abs(o.x - x) <= 2) : (o.x === x && Math.abs(o.y - y) <= 2)));
    const trodden = (x, y) => M.objects.some(o => !o.gone && o.x === x && o.y === y && ((o.crackOnce && o.trod) || o.dark));
    const bl = (x, y) => (statics.has(x + ',' + y) && !(x === tx && y === ty)) || (M.inb(x, y) && M.get(x, y).hole && !F.hovering && !M.objects.some(o => !o.gone && o.kind === 'icepillar' && o.x === x && o.y === y) && !(x === tx && y === ty)) || (this.updraftAt(x, y) && !(x === tx && y === ty)) || (opts.avoid && opts.avoid(x, y) && !(x === tx && y === ty)) || (F.ship && M.inb(x, y) && !M.get(x, y).water && !(M.world && G.flag('ship_wings') && FieldScene.flyable(M.get(x, y))) && !(x === tx && y === ty))   /* with the wings the low land, beaches included, is air: the ship sets down only where landShip says */ || ((trodden(x, y) || (!opts.ignoreTwisters && nearTwister(x, y))) && !(x === tx && y === ty)) || (M.world && !opts.allowExits && M.inb(x, y) && M.get(x, y).place && !(x === tx && y === ty)) || this.blockedNoNpc(x, y);   /* on the world, another place's marker is not walked over on the way somewhere: stepping on it enters it */
    const prev = new Map(); prev.set(start, null); const q = [[p.tx, p.ty]]; let head = 0;
    const slip = (x, y) => M.inb(x, y) && !!M.get(x, y).slippery;
    // a hop: the next tile is a gap or a marked stretch of water, the one past it has footing - one edge, two tiles
    const hopOver = (x, y, d) => { if (!M.inb(x, y)) return false; if (M.get(x, y).hop) return true; const o = M.objects.find(ob => ob.x === x && ob.y === y && !ob.gone); return !!(o && (o.kind === 'gap' || o.kind === 'hop') && (o.only === undefined || o.only === d)); };   /* a ledge hop goes one way */
    // standing on a pole afloat, a step into the water rides the pole across: one edge to wherever it comes to rest
    const ride = (x, y, d) => { if (!F.floatLogAt) return null; const fl = F.floatLogAt(x, y); if (!fl) return null; const n = F.logSlideSteps(fl, d); return n ? [x + DX[d] * n, y + DY[d] * n] : null; };
    const rampTo = (x, y, d) => { const o = M.getObj(x, y); const t = { ramp: (o && o.ramp) || M.get(x, y).ramp }; if (!t.ramp) return null; const r = t.ramp === 'ne' ? (d === DIR.RIGHT ? [x + 1, y - 1] : d === DIR.LEFT ? [x - 1, y + 1] : null) : (d === DIR.LEFT ? [x - 1, y - 1] : d === DIR.RIGHT ? [x + 1, y + 1] : null); return r && !bl(r[0], r[1]) ? r : null; };
    while (head < q.length) { const [x, y] = q[head++]; if (x === tx && y === ty) break; for (let d = 0; d < 4; d++) { let nx = x + DX[d], ny = y + DY[d]; const rr = rampTo(x, y, d); if (rr) { nx = rr[0]; ny = rr[1]; } if (bl(nx, ny)) { const rd = ride(x, y, d); if (rd) { const k2 = rd[0] + ',' + rd[1]; if (!prev.has(k2)) { prev.set(k2, [x, y, d]); q.push(rd); } } }
      if (bl(nx, ny) && !(nx === tx && ny === ty) && M.inb(nx, ny) && M.get(nx, ny).hole && M.def.fall && !opts.noDrops && !M.objects.some(o => !o.gone && o.x === nx && o.y === ny && F.objectSolid(o))) {   /* an open hole, not one fenced off (a gap only Hover crosses) */ const dst = typeof M.def.fall === 'function' ? M.def.fall(nx, ny) : M.def.fall; if (dst && (!dst.map || dst.map === M.id) && M.inb(dst.x, dst.y) && !bl(dst.x, dst.y)) { const k2 = dst.x + ',' + dst.y; if (!prev.has(k2)) { prev.set(k2, [x, y, d]); q.push([dst.x, dst.y]); } } continue; }   /* a drop through a hole onto the floor below is a step of its own kind */
      if (bl(nx, ny)) { if (hopOver(nx, ny, d)) { const fx = nx + DX[d], fy = ny + DY[d]; if (!bl(fx, fy)) { const k2 = fx + ',' + fy; if (!prev.has(k2)) { prev.set(k2, [x, y, d]); q.push([fx, fy]); } } } continue; } if (!(nx === tx && ny === ty) && this.isExitTile(nx, ny)) continue; /* never through a doorway or a place that is not the goal, whatever allowExits says: stepping on one leaves the map */ if (slip(nx, ny)) { let g = 0; while (slip(nx, ny) && !bl(nx + DX[d], ny + DY[d]) && g++ < 60) { nx += DX[d]; ny += DY[d]; if (this.isExitTile(nx, ny)) break; } } /* on ice you keep sliding until something stops you - a tile passed over mid-slide is not reached */ const k = nx + ',' + ny; if (prev.has(k)) continue; prev.set(k, [x, y, d]); q.push([nx, ny]); } }
    if (!prev.has(goal)) return null;
    const steps = []; let k = goal; while (prev.get(k)) { const [px, py, d] = prev.get(k); const [kx, ky] = k.split(',').map(Number); steps.push([kx, ky, d]); k = px + ',' + py; } return steps.reverse();
  },
  // a live updraft (a whirl at a statue's mouth, an uncapped vent) is never walked through on the way somewhere else
  updraftAt(x, y) { const F = G.field; const o = G.map.objects.find(ob => ob.kind === 'updraft' && ob.x === x && ob.y === y && !ob.gone); return !!(o && F.updraftOn && F.updraftOn(o)); },
  isExitTile(x, y) { const M = G.map; for (const e of M.exits) { if (e.edge) continue; if (x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) return true; } if (M.world) { const t = M.get(x, y); if (t.place) return true; } return false; },
  OPP: {"0":3,"1":2,"2":1,"3":0},
  *stepTo(nx, ny, d) { this.trace('stepTo');
    const F = G.field, p = F.player; const sx = p.tx, sy = p.ty; const done = (r) => { Input.holdT = {}; return r; };
    if (!p.moving && p.tx === nx && p.ty === ny) return true;
    Input.hold(DIRNAME[d], p.dir === d ? 1 : 5);
    for (let i = 0; i < 150; i++) {
      (yield* this.frames(1));
      if (Engine.top !== F || F.event || F.textbox.active) return done('interrupted');
      if (G.map.id !== this._mapAtStep) return done('mapchanged');
      if (!p.moving && p.tx === nx && p.ty === ny) return done(true);
      if (!p.moving && (p.tx !== sx || p.ty !== sy)) return done(Math.abs(p.tx - nx) + Math.abs(p.ty - ny) === 0);
      if (!p.moving && i > 20 && i % 8 === 0) Input.hold(DIRNAME[d], p.dir === d ? 1 : 5);
    }
    return done(false);
  },
  // ---- Prowl for the road (the user's rule): in a place the party has been before, a long walk goes on four legs.
  // The Wolf Fang Pendant goes on somebody in front for the cast (their own class item's class comes back after the
  // walk); a first visit is walked at a walker's pace, as a player would, and the world map is the ship's business.
  prowlFirstVisit() {
    if (!this._mapSeen) this._mapSeen = new Set(Object.keys(G.visited || {}));   /* what the save remembers: the whole run so far */
    if (this._seenMapId !== G.map.id) { this._firstVisit = !this._mapSeen.has(G.map.id); this._mapSeen.add(G.map.id); this._seenMapId = G.map.id; }
    return this._firstVisit;
  },
  *prowlFor(steps) {
    if (this._prowlWear) yield* this.prowlOff();   /* a walk cut short (a restore, a stop) left the pendant on: off first, whatever comes next */
    const F = G.field; if (this.opts.prowl === false || G.map.world || F.ship || !PSY.Prowl || steps < 10 || this.prowlFirstVisit()) return;
    if ((F.prowl || 0) > steps * 8) return;   /* still running far enough (about seven frames a tile on four legs) */
    const has = () => G.party.active.find(m => m.alive && m.hasPsy('Prowl') && m.pp >= PSY.Prowl.pp);
    if (!has()) {
      if (!G.inventory.has('Wolf Fang Pendant') || this._prowlWear) return;
      const m = G.party.active.find(x => x.alive && !(G.party.isLeader && G.party.isLeader(x))) || G.party.active.find(x => x.alive); if (!m) return;
      this._prowlWear = { m, acc: m.equip.acc || null, ci: m.classItem || null };
      G.inventory.remove('Wolf Fang Pendant'); if (m.equip.acc) G.inventory.add(m.equip.acc); m.equip.acc = 'Wolf Fang Pendant'; m.classItem = ITEM_DB['Wolf Fang Pendant'].classItem;
    }
    const c = has(); if (!c) { yield* this.prowlOff(); return; }
    F.usePsy('Prowl', c); (yield* this.frames(8)); if (F.event || F.textbox.active) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; }
    if (!this._prowlSaid) { this._prowlSaid = true; this.say('Prowl: the party runs the roads it knows'); }
  },
  // Avoid (or a Sacred Feather) on the same known roads: the fights there are time, not levels worth having - unless
  // the party is out to train (the level and grind ops), when every fight is the point
  *avoidFor(steps) {
    const F = G.field; const maxed = this.allMaxed();   /* everyone at the cap: fights are only time - Avoid (or a Feather) everywhere on foot, first visits and the world map too */
    if (this.opts.avoid === false || F.ship || (maxed ? steps < 6 : (this._grinding || G.map.world || steps < 10 || this.prowlFirstVisit()))) return;
    if ((G.party.avoidSteps || 0) >= steps) return;
    const c = PSY.Avoid && G.party.active.find(m => m.alive && m.hasPsy('Avoid') && m.pp >= PSY.Avoid.pp + 6);
    if (c) { F.usePsy('Avoid', c); (yield* this.frames(8)); if (F.event || F.textbox.active) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } }
    else if (G.inventory.has('Sacred Feather')) { const who = G.party.active.find(m => m.alive); if (!who) return; const r = useItemOn('Sacred Feather', who); if (r && !r.fail) { G.inventory.remove('Sacred Feather'); Audio.sfx('item'); } }
    else return;
    if (!this._avoidSaid) { this._avoidSaid = true; this.say('Avoid: no fights on the roads the party knows'); }
  },
  *prowlOff() {
    const w = this._prowlWear; if (!w) return; this._prowlWear = null; const m = w.m;
    if (m.equip.acc === 'Wolf Fang Pendant') { m.equip.acc = null; G.inventory.add('Wolf Fang Pendant'); if (w.acc && G.inventory.has(w.acc)) { G.inventory.remove(w.acc); m.equip.acc = w.acc; } }
    m.classItem = w.ci;
  },
  *go(tx, ty, opts) { const r = yield* this.goWalk(tx, ty, opts); yield* this.prowlOff(); return r; }, /* the pendant comes off again after the walk: the fights are the class item's */
  *goWalk(tx, ty, opts) { this.trace('go');
    opts = opts || {}; const F = G.field; const mapId = G.map.id; this._mapAtStep = mapId;
    // a long walk or voyage is interrupted by every fight on the way: only the tries that get nowhere count against it
    for (let attempt = 0, tries = 0; attempt < 12 && tries < 200; tries++) {
      const p = F.player; if (p.tx === tx && p.ty === ty) return true;
      const from = [p.tx, p.ty];
      let steps = this.path(tx, ty, attempt ? Object.assign({ avoidNpcs: true }, opts) : opts) || this.path(tx, ty, opts);
      // a patrolling statue or guard standing in the one corridor: wait for it to walk on, a few seconds at most
      if (!steps && (F.npcs.some(n => !n.hidden && n.move && n.move !== 'static') || G.map.objects.some(o => o.kind === 'tornado' && !o.gone))) {   /* a wanderer in a doorway counts too: it moves on */ for (let w = 0; w < 12 && !steps; w++) { (yield* this.frames(20)); if (G.map.id !== mapId) return 'mapchanged'; steps = this.path(tx, ty, opts); } }   // a patrolling statue or guard, or a roaming whirlwind, in the one corridor: wait for it to move on
      if (!steps) return 'nopath';
      { const pr = (yield* this.prowlFor(steps.length)); if (pr === 'gameover') return 'gameover'; const av = (yield* this.avoidFor(steps.length)); if (av === 'gameover') return 'gameover'; }
      let progressed = false;
      for (const [nx, ny, d] of steps) { const carrier = (G.map.inb(nx, ny) && G.map.get(nx, ny).hole) || this.updraftAt(nx, ny); const r = (yield* this.stepTo(nx, ny, d)); this._lastStep = [nx, ny, d, r, F.player.tx, F.player.ty]; if (r === true) { progressed = true; continue; } if (r === 'mapchanged') return 'mapchanged'; if (r === 'interrupted') { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== mapId) return 'mapchanged'; if (carrier && (F.player.tx !== nx || F.player.ty !== ny)) return 'warped'; break; } break; }   // a drop or a whirl stepped on carries the party off: that is the end of this walk
      if (F.player.tx === tx && F.player.ty === ty) return true;
      if (!progressed) {
        // a traveler standing in the one cell the road has: challenge them - beaten, they go on their way (the user's
        // rule: never wait on a roaming party, fight through). Anyone else in the way is given a moment to move
        const ls = this._lastStep; const blockerAt = (x, y) => F.npcs.find(n => !n.hidden && ((n.tx === x && n.ty === y) || (n.moving && n.destX === x && n.destY === y)));
        const trav = ls && G.map.world ? blockerAt(ls[0], ls[1]) : null;
        // ...unless there is a camp and they did not want the fight: forcing it costs the party's regard (Reputation), so
        // the frightened are given the moment to step aside instead (they wander; the road opens)
        const costly = trav && trav.traveler && typeof Reputation !== 'undefined' && Reputation.on() && Reputation.weight(trav.traveler) > 0 && Reputation.score() + Reputation.weight(trav.traveler) >= Reputation.LEAVE_AT;   /* only when somebody would walk off over it */
        if (trav && trav.traveler && !trav.traveler.done && !costly && Math.abs(trav.tx - F.player.tx) + Math.abs(trav.ty - F.player.ty) === 1) {
          const b0 = this.battles || 0; F.player.dir = F.dirTo(F.player, trav); this.say('a ' + (trav.name || trav.traveler.label) + ' blocks the road at ' + trav.tx + ',' + trav.ty + ': challenging them');
          this._wantFight = true; F.challenge(); const cr = (yield* this.idle()); this._wantFight = false; if (cr === 'gameover') return 'gameover';
          if ((this.battles || 0) === b0) { trav.traveler.done = true; if (typeof Travelers !== 'undefined' && Travelers.remove) Travelers.remove(trav.traveler); else F.npcs = F.npcs.filter(n => n !== trav); }   /* they would not fight: they step aside */
          if (G.map.id !== mapId) return 'mapchanged'; attempt = 0; continue;
        }
        (yield* this.frames(30));
      }
      if (F.player.tx === from[0] && F.player.ty === from[1]) attempt++;
    }
    if (F.player.tx === tx && F.player.ty === ty) return true; this.say('stuck going to ' + tx + ',' + ty + ' from ' + F.player.tx + ',' + F.player.ty + ' on ' + G.map.id + ' (last step ' + JSON.stringify(this._lastStep) + ')'); return 'stuck';
  },
  // a way that cannot be walked back: a drop off a ledge, a vent's lift, a pole or a slide (the path jumps a cell)
  pathOneWay(steps) { const M = G.map, p = G.field.player; let lx = p.tx, ly = p.ty; for (const [x, y] of steps) { if (Math.abs(x - lx) + Math.abs(y - ly) !== 1) return true; if (M.inb(x, y) && M.get(x, y).hole) return true; lx = x; ly = y; } return false; },
  adjacentReachable(x, y, o) { this.trace('adjacentReachable'); const opts = [[0, 1, DIR.UP], [0, -1, DIR.DOWN], [1, 0, DIR.LEFT], [-1, 0, DIR.RIGHT]]; const p = G.field.player; let best = null; for (const [dx, dy, face] of opts) { const ax = x + dx, ay = y + dy; if (this.blockedNoNpc(ax, ay) || this.updraftAt(ax, ay)) continue; if (this.isExitTile(ax, ay) && !(ax === p.tx && ay === p.ty)) continue;   /* never stand on a doorway to reach a thing: stepping on it leaves the map */ if (G.field.npcs.some(n => !n.hidden && n.tx === ax && n.ty === ay)) continue; if (ax === p.tx && ay === p.ty) return { x: ax, y: ay, face, dist: 0 }; const pth = this.path(ax, ay); if (!pth) continue; if (o && o.noOneWay && this.pathOneWay(pth)) continue; if (!best || pth.length < best.dist) best = { x: ax, y: ay, face, dist: pth.length }; } return best; },
  *face(d) { const p = G.field.player; if (p.dir !== d) { Input.hold(DIRNAME[d], 2); (yield* this.frames(6)); } },
  *pressA() { let g = 0; while ((Input.held('a') || (Input.holdT.a || 0) > 0) && g++ < 12) (yield* this.frames(1)); (yield* this.frames(1)); /* a release first: a press on the heels of the one that closed a textbox has no edge and is never seen */ Input.hold('a', 2); (yield* this.frames(12)); return (yield* this.idle()); },
  *useAt(x, y) {
    const sides = this.standSpots(x, y);
    if (!sides.length) return 'nopath'; let last = 'nopath';
    const snap = () => { const o = G.map.objects.find(ob => ob.x === x && ob.y === y); return o ? JSON.stringify([!!o.gone, o.state || '', o.x, o.y]) : null; };
    for (const a of sides) {
      const r = (yield* this.go(a.x, a.y)); if (r === 'gameover') return 'gameover'; if (r !== true) { last = r; continue; }
      (yield* this.face(a.face));
      const kind = (G.map.objects.find(ob => ob.x === x && ob.y === y && !ob.gone) || {}).kind;
      const was = snap();
      const pr = (yield* this.pressA()); if (pr === 'gameover') return 'gameover';
      // pressing A moves crates and reads signs, but soft ground and cracked walls only answer to Psynergy
      if (was !== null && snap() === was) {
        for (const ps of (this.PSY_FOR_KIND[kind] || [])) {
          const rr = (yield* this.castPsy(ps, a.face)); if (rr === 'gameover') return 'gameover';
          if (snap() !== was) break;
        }
      }
      return pr;
    }
    return last;
  },
  PSY_FOR_KIND: {"scoop":["Scoop"],"crack":["Burst"],"rope":["Lash"],"carriable":["Carry"],"catchable":["Catch"],"pillar":["Pound","Move"],"boulder":["Move","Lift"],"rock_water":["Grind"],"leaves":["Cyclone"],"burnable":["Blaze"],"dryplant":["Growth"],"sandgap":["Sand"],"vines":["Growth"]},
  findNpc(id) { return G.field.npcs.find(n => n.id === id && !n.hidden) || G.field.npcs.find(n => n.id === id); },
  findObj(id) { return G.map.objects.find(o => o.id === id && !o.gone) || G.map.objects.find(o => o.id === id); },
  findTrigger(name) { const fn = name.startsWith('STORY.') ? STORY[name.slice(6)] : name.startsWith('TLA.') ? STORY_TLA[name.slice(4)] : name.startsWith('T3.') && typeof T3 !== 'undefined' ? T3[name.slice(3)] : null; return G.map.triggers.find(t => t.script === fn); },
  // the cell of an exit to walk to: its middle, unless that is walled (a doorway drawn wider than it opens) - then any open cell of it
  exitCell(e) { const M = G.map; const cx = e.x + Math.floor(e.w / 2), cy = e.y + (e.h > 1 ? Math.floor(e.h / 2) : 0); if ((e.w || 1) === 1 && (e.h || 1) === 1) return [cx, cy]; let best = null; for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) { if (!M.inb(x, y) || M.isSolid(x, y)) continue; const p = this.path(x, y, { allowExits: true }); const len = p ? p.length : Infinity; if (!best || len < best.len) best = { x, y, len }; } if (best && best.len < Infinity) return [best.x, best.y]; for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) if (M.inb(x, y) && !M.isSolid(x, y) && this.adjacentReachable(x, y)) return [x, y]; return (!M.inb(cx, cy) || !M.isSolid(cx, cy)) ? [cx, cy] : [e.x, e.y]; },   /* a wide doorway: the cell of it nearest to walk to (the pathfinder does not cross the other cells of an exit) */
  findExit(to) { const all = G.map.exits.filter(e => e.to === to && !(e.cond && !e.cond())); if (all.length <= 1) return all[0] || G.map.exits.find(e => e.to === to); const tgt = MAPS[to] && MAPS[to].world ? this.nextWorldTarget(to) : null; let best = null, bestLen = Infinity; for (const e of all) { const [ex, ey] = this.exitCell(e); const pth = this.path(ex, ey, { allowExits: true }); const len = pth ? pth.length : (this.adjacentReachable(ex, ey) ? 1 : Infinity); if (len === Infinity) continue; let score = len; if (tgt) { const land = this.worldLanding(to, e); if (land) score = (Math.abs(land.x - tgt[0]) + Math.abs(land.y - tgt[1])) * 100 + len; }   /* a town with two gates onto the world: out by the one nearest where the plan goes next (Kolima's east gate is cut off from its west road by the river) */ if (score < bestLen) { best = e; bestLen = score; } } return best || all[0]; },   // several doors to the same place: the nearest one that can be walked to
  // where an exit onto the world map sets the party down (the world's own landing rule), and where the plan's next step wants to be on it
  worldLanding(to, e) { try { const id = G.map.id; if (to === 'world_tla' || (to === 'world_gs1' && G.game === 2 && MAPS.world_tla)) return typeof worldTlaLanding === 'function' ? worldTlaLanding(id, e.dir, false) : null; if (to === 'world_gs1') return typeof worldGs1Landing === 'function' ? worldGs1Landing(id, e.dir) : null; } catch (x) { } return null; },
  nextWorldTarget(to) { for (let i = this.pc + 1; i < Math.min(this.plan.length, this.pc + 4); i++) { const st = this.plan[i]; if (!st) break; const op = st[0]; if (op === 'shot' || op === 'ckpt' || op === 'note' || op === 'idle' || op === 'expect' || op === 'expectMap') continue; if (op === 'go' || op === 'use' || op === 'chest' || op === 'oasis') return [st[1], st[2]]; if (op === 'cast' && typeof st[2] === 'number') return [st[2], st[3]]; if (op === 'world' || op === 'enter') { const P = MAPS[to] && MAPS[to].places; if (P) for (const k of Object.keys(P)) if (P[k].id === st[1] || P[k].map === st[1]) return k.split(',').map(Number); } return null; } return null; },
  onWorld() { return !!G.map.world; },
  equipUtility(name) { // the item that bestows a field Psynergy goes into the pack of somebody in the active party (they carry any number, and keep them: nothing to take off again)
    const P = G.party; const itemName = Object.keys(ITEM_DB).find(k => ITEM_DB[k].grants === name && (G.inventory.has(k) || P.members.some(m => m.holds && m.holds(k)))); if (!itemName) return this.wearClassItemFor(name);
    if (P.active.some(m => m.alive && m.holds(itemName))) return true;
    const from = P.members.find(m => m.holds(itemName)); if (from) from.release(itemName);   /* carried by someone on the bench (or knocked out): handed forward */
    const cands = P.active.filter(m => m.alive); if (!cands.length) { if (from) from.hold(itemName); return false; }
    const m = cands.slice().sort((a, b) => (a.held || []).length - (b.held || []).length)[0];   /* the lightest pack */
    if (!m.hold(itemName)) return false; this.say(m.name + ' carries the ' + itemName + ' for ' + name + (from ? ' (from ' + from.name + ')' : '')); return true;
  },
  // a field Psynergy that only a class item teaches (Grapple, Lockpick, Dive...): the item goes on somebody in front
  wearClassItemFor(name) {
    const itemName = Object.keys(ITEM_DB).find(k => ITEM_DB[k].classItem && G.inventory.has(k) && CLASS_TABLES[ITEM_DB[k].classItem] && classPsynergy(CLASS_TABLES[ITEM_DB[k].classItem][0], 1).includes(name)); if (!itemName) return false;
    const cands = G.party.active.filter(m => m.alive && !this.wornClassItem(m) && !(G.party.isLeader && G.party.isLeader(m))); let m = cands[0] || G.party.active.find(m => m.alive && !this.wornClassItem(m));
    if (!m) {   // everyone in front wears one (the party planner's doing): somebody's comes off for the cast and goes back on after it
      m = G.party.active.find(x => x.alive && !(G.party.isLeader && G.party.isLeader(x))) || G.party.active.find(x => x.alive); if (!m) return false;
      const worn = this.wornClassItem(m); const slot = Object.keys(m.equip).find(k => m.equip[k] === worn);
      this._classSwap = { m, worn, slot, acc: slot === 'acc' ? null : (m.equip.acc || null), ci: m.classItem };
      m.equip[slot] = null; G.inventory.add(worn); if (slot !== 'acc' && m.equip.acc) { G.inventory.add(m.equip.acc); m.equip.acc = null; }
    }
    const cur = m.equip.acc; if (!this._classSwap) this._classSwap = { m, worn: null, slot: null, acc: cur || null, ci: m.classItem, lent: itemName };   /* a borrowed class is for the cast only: it comes off again after (classSwapBack) - the party planner decides who wears what */ G.inventory.remove(itemName); if (cur) G.inventory.add(cur); m.equip.acc = itemName; m.classItem = ITEM_DB[itemName].classItem;
    this.say(m.name + ' puts on the ' + itemName + ' for ' + name + ' (' + m.className() + ')'); return true;
  },
  // ['ride', logId, dir]: stand on the pole afloat and walk it across the water that way
  *ridePole(a, b) {
    const o = this.findObj(a); if (!o) return 'ride: object not found ' + a; const dir = b; const F = G.field;
    if (!F.logSlideSteps(o, dir)) return true; /* it already lies as far that way as it goes (the pathfinder rides poles by itself on the way to things) */
    const cells = F.logCells(o); const mid = (dir === DIR.LEFT || dir === DIR.UP) ? cells[0] : cells[cells.length - 1]; /* board at the end that faces the water */
    const r = (yield* this.go(mid[0], mid[1])); if (r !== true) return 'ride ' + a + ' board(' + mid[0] + ',' + mid[1] + '): ' + r;
    (yield* this.face(dir)); const bx = o.x, by = o.y; Input.hold(DIRNAME[dir], 3); (yield* this.frames(8));
    for (let i = 0; i < 600 && (o.sliding || F.event); i++) (yield* this.frames(1));
    (yield* this.idle()); return (o.x !== bx || o.y !== by) ? true : 'ride ' + a + ': it did not move';
  },
  *castPsy(name, dir, shove) {   // shove: for Move, the way to push (the way we face, if not given)
    if (dir !== undefined) (yield* this.face(dir));
    const F = G.field; const anyone = () => G.party.active.filter(m => m.hasPsy(name));
    if (!anyone().length) this.equipUtility(name);
    if (!anyone().length) this.shedClassItem(name);   // a Pierrot does not whirl the wind: the card comes off again
    if (!anyone().length) this.djinnForPsy(name);   // Growth and its kind come from a mixed class: lend one Djinni across
    // the one who knows it may be lying knocked out, in the front or on the bench: bring them round first
    if (!G.party.members.some(m => m.alive && m.hasPsy(name)) && G.party.members.some(m => m.hasPsy(name) && m.status && m.status.down)) { if (!(yield* this.fieldRevive())) { this.sanctumRevive(); this.say('note: revived the party to keep using field Psynergy (nothing left to revive with)'); } }
    // Field Psynergy only comes from the front rank, and party-building can leave the one Adept who knows Scoop (or
    // Growth, or Lash) sitting in the reserve. Call them forward the way a player would, then put the rank back.
    let restore = null;
    if (!anyone().length) {
      const bench = G.party.members.find(m => !G.party.active.includes(m) && m.alive && m.hasPsy(name));
      if (bench && G.party.active.length < 4) { G.party.active.push(bench); G.party.reserve = G.party.reserve.filter(x => x !== bench); this.say(bench.name + ' rejoins the front rank to use ' + name); }   // a rank left short (a fall, a scene) simply takes them back
      else if (bench) {
        const was = G.party.active.slice(); const want = was.slice(); let oi = want.length - 1; if (G.party.isLeader && G.party.isLeader(want[oi])) oi = want.findIndex(m => !G.party.isLeader(m)); want[oi] = bench;   /* never the leader's place */
        if ((yield* this.setActive(want)) > 0) { restore = was; this.say(bench.name + ' steps forward to use ' + name); }
      }
    }
    if (!anyone().length) { if (restore) yield* this.setActive(restore); return 'nopsy'; }
    if (!anyone().some(m => m.alive)) { this.sanctumRevive(); this.say('note: revived the party to keep using field Psynergy'); }
    const P = PSY[name];
    if (!anyone().some(m => m.alive && m.pp >= P.pp)) { this.restPP(); }
    F.usePsy(name); (yield* this.frames(6));
    if (name === 'Move' && F.moveAim) { Input.hold(DIRNAME[shove !== undefined ? shove : dir !== undefined ? dir : F.player.dir], 1); (yield* this.frames(6)); }   // the hand waits for the way to shove (one frame: a longer hold walks the party after the pillar)
    (yield* this.frames(14));
    const r = (yield* this.idle());
    if (restore) yield* this.setActive(restore);
    this.classSwapBack();   /* a class item that came off for this cast goes back on */
    return r;
  },
  // the Mysterious Card and its kind rewrite the wearer's whole class, field Psynergy included: when a puzzle asks
  // for what the plain class knew, the item goes back in the bag (the party-builder may hand it out again later)
  // the class item that came off for a field cast goes back on (wearClassItemFor)
  classSwapBack() {
    const w = this._classSwap; if (!w) return; this._classSwap = null; const m = w.m;
    if (m.equip.acc && ITEM_DB[m.equip.acc] && ITEM_DB[m.equip.acc].classItem && m.equip.acc !== w.worn) { G.inventory.add(m.equip.acc); m.equip.acc = null; }   /* the borrowed one back in the bag */
    if (w.worn && G.inventory.has(w.worn)) { G.inventory.remove(w.worn); m.equip[w.slot] = w.worn; }
    if (w.acc && G.inventory.has(w.acc)) { G.inventory.remove(w.acc); m.equip.acc = w.acc; }
    m.classItem = w.ci || null; this.say(w.worn ? m.name + ' puts the ' + w.worn + ' back on (' + m.className() + ')' : m.name + ' takes the ' + w.lent + ' off again (' + m.className() + ')');
  },
  shedClassItem(name) {
    for (const m of G.party.members) {
      const slot = Object.keys(m.equip || {}).find(k => ITEM_DB[m.equip[k]] && ITEM_DB[m.equip[k]].classItem); if (!slot) continue;
      const it = m.equip[slot], was = m.classItem; m.equip[slot] = null; m.classItem = null;
      if (m.hasPsy(name)) { G.inventory.add(it); this.say(m.name + ' takes off the ' + it + ' to use ' + name + ' (' + m.className() + ')'); return true; }
      m.equip[slot] = it; m.classItem = was;
    }
    return false;
  },
  djinnForPsy(name) {
    const P = G.party;
    // a mixed class may have lost the Psynergy its plain class knew (a Wanderer no longer whirls the wind): shed the
    // off-element Djinn first, then the rest, onto whoever has room, until the member knows it again
    for (const to of P.active.concat(P.reserve.filter(m => m.alive))) {   /* the bench too: the one whose plain class knows it may be sitting there (castPsy brings them forward) */
      // a class item on them rewrites the class whatever the Djinn say: it comes off for the attempt (and stays off if that is what it took)
      const ciSlot = Object.keys(to.equip || {}).find(k => ITEM_DB[to.equip[k]] && ITEM_DB[to.equip[k]].classItem); const ciItem = ciSlot ? to.equip[ciSlot] : null, ciWas = to.classItem;
      if (ciSlot) { to.equip[ciSlot] = null; to.classItem = null; }
      const held = to.djinn.map(d => d.name).sort((a, b) => (DJINN[a].el === to.el ? 1 : 0) - (DJINN[b].el === to.el ? 1 : 0)); const parked = [];
      const won = () => { if (ciSlot) G.inventory.add(ciItem); this.pickSummons(); this.say((parked.map(x => x[0]).join(', ') || 'nothing') + ' set aside' + (ciSlot ? ' and the ' + ciItem + ' taken off' : '') + ' so ' + to.name + ' knows ' + name + ' again (' + to.className() + ')'); return true; };
      if (ciSlot && to.hasPsy(name)) return won();
      for (const n of held) { const home = P.members.find(m => m !== to && m.djinn.length < 9); if (!home) break; to.removeDjinn(n); home.setDjinn(n); parked.push([n, home]); if (to.hasPsy(name)) return won(); }
      for (const [n, home] of parked.reverse()) { home.removeDjinn(n); to.setDjinn(n); }
      if (ciSlot) { to.equip[ciSlot] = ciItem; to.classItem = ciWas; }
    }
    for (const to of P.active) for (const from of P.members) { if (from === to) continue; for (const d of from.djinn.slice()) { from.removeDjinn(d.name); to.setDjinn(d.name); if (to.hasPsy(name)) { this.say(d.name + ' goes to ' + to.name + ' so someone knows ' + name); return true; } to.removeDjinn(d.name); from.setDjinn(d.name); } }
    return false;
  },
  restPP() { for (const m of G.party.members) { m.pp = m.stats().pp; } this.say('note: PP topped up (Psy Crystal equivalent) to continue a field puzzle'); },
  townOf(mapId) { return mapId.replace(/_(inn|itemshop|weaponshop|sanctum|palace|mayor|house\d*|attic|docks_house|lucky|forge|obaba|uzume|chief|fortune|prison|hideout)$/, ''); },
  *press(k, wait) { Input.hold(k, 1); yield* this.frames(wait || 6); },
  *closeMenus() { let g = 0; while (Engine.top !== G.field && g++ < 14) yield* this.press('b', 6); },
  shopPlan(townId) {
    const town = townId || this.townOf(G.map.id); const shops = [SHOPS[town + '_weapon'], SHOPS[town + '_armor'], SHOPS[town + '_item']].filter(Boolean); if (!shops.length) return null;
    const slotOf = it => ['long', 'axe', 'mace', 'light', 'staff'].includes(it.cat) ? 'weapon' : ['armor', 'cloth', 'robe', 'shirt'].includes(it.cat) ? 'body' : ['shield', 'glove', 'brace'].includes(it.cat) ? 'arm' : ['helm', 'hat', 'circlet'].includes(it.cat) ? 'head' : null;
    let coins = G.party.coins; const buys = [];
    for (const slot of ['weapon', 'body', 'arm', 'head']) for (const m of G.party.members.slice().sort((x, y) => slot === 'weapon' ? x.stats().atk - y.stats().atk : x.stats().def - y.stats().def)) {
      const cur = m.equip[slot] ? ITEM_DB[m.equip[slot]] : null; const curV = cur ? (slot === 'weapon' ? cur.atk || 0 : cur.def || 0) : 0;
      let best = null; for (const sh of shops) for (const n of sh.items.concat(typeof Artifacts !== 'undefined' ? Artifacts.forShop(sh === SHOPS[town + '_weapon'] ? town + '_weapon' : sh === SHOPS[town + '_armor'] ? town + '_armor' : town + '_item') : [])) { const it = ITEM_DB[n]; if (!it || slotOf(it) !== slot || it.cursed || !it.buy) continue; if (!m.canEquip(n) || (m.slotFor && m.slotFor(n) !== slot)) continue; const v = slot === 'weapon' ? it.atk || 0 : it.def || 0; if (v <= curV || it.buy > coins) continue; if (!best || v > best.v) best = { n, v, it, shop: sh }; }
      if (best) { coins -= best.it.buy; if (cur && cur.sell) coins += cur.sell; buys.push({ member: m, slot, item: best.n, old: m.equip[slot], shop: best.shop, art: !best.shop.items.includes(best.n) }); }
    }
    const item = SHOPS[town + '_item']; let herbs = 0; if (item && item.items.includes('Herb')) { herbs = Math.max(0, Math.min(6 - G.inventory.count('Herb'), Math.floor((coins - 20) / ITEM_DB.Herb.buy))); }
    return { town, shops, buys, herbs, itemShop: item, weaponShop: SHOPS[town + '_weapon'] };
  },
  shopWorth(mapId) { const plan = this.shopPlan(); if (!plan) return false; const key = plan.town + (mapId.endsWith('_weaponshop') ? '_weapon' : '_item'); const here = SHOPS[key]; if (!here) return false; return plan.buys.some(b => b.shop === here) || (here === plan.itemShop && plan.herbs > 0); },
  *openShop(id) {
    const npc = G.field.npcs.find(n => n.npc && n.npc.shop && !n.hidden && (!id || n.id === id)); if (!npc) return null;
    const a = this.standSpots(npc.tx, npc.ty)[0]; if (!a) return null; const r = yield* this.go(a.x, a.y); if (r === 'gameover') return 'gameover'; if (r !== true) return null;
    yield* this.face(a.face); Input.hold('a', 2); // talk, then wait for the shop screen (idle() would close it again)
    let g = 0; while (Engine.top.constructor.name !== 'ShopScene' && g++ < 90) { const tb = G.field.textbox; if (tb.active && tb.waiting) Input.hold('a', 2); yield* this.frames(2); }
    return Engine.top.constructor.name === 'ShopScene' ? Engine.top : null;
  },
  *shopBuy(keeper) { this.trace('shopBuy');
    const plan = this.shopPlan(); if (!plan) return 'noshop';
    // the shop at hand: a named stall keeper's, else the weapon shop in a *_weaponshop room, else the item shop
    const kn = keeper && G.field.npcs.find(n => n.id === keeper && n.npc && n.npc.shop);
    const here = kn ? SHOPS[kn.npc.shop] : SHOPS[G.map.id.endsWith('_weaponshop') ? plan.town + '_weapon' : plan.town + '_item']; if (!here) return 'noshop';
    const buys = plan.buys.filter(b => b.shop === here); const herbs = here === plan.itemShop ? plan.herbs : 0;
    const listens = G.field.npcs.some(n => n.npc && n.npc.shop && !n.hidden && (!keeper || n.id === keeper) && n.npc.onShop);   // a keeper the story listens to is visited even with nothing to buy
    if (!buys.length && !herbs && !listens) return true;
    const S = yield* this.openShop(keeper); if (S === 'gameover') return 'gameover'; if (!S) { this.say('shop: no shopkeeper here'); return true; }
    if (!buys.length && !herbs) { yield* this.press('b', 8); if (Engine.top !== G.field) yield* this.press('b', 8); return true; }
    const bought = []; const sells = [];
    const buy = function* (self, name, qty, art) {
      if (art) {   // an artifact off the shop's list: its own page, bought outright
        S.main.idx = 2; yield* self.press('a', 8); if (S.page !== 'art') return false;
        const i = S.list.items.findIndex(it => it.id === name); if (i < 0 || S.list.items[i].disabled) { yield* self.press('b', 6); return false; }
        S.list.idx = i; S.list.fixScroll(); yield* self.frames(10); const before = G.inventory.count(name); yield* self.press('a', 10); const ok = G.inventory.count(name) > before;
        yield* self.press('b', 6); if (S.page !== 'main') yield* self.press('b', 6); return ok;
      }
      S.main.idx = 0; yield* self.press('a', 8); if (S.page !== 'buy') return false;
      const i = S.list.items.findIndex(it => it.id === name); if (i < 0 || S.list.items[i].disabled) { yield* self.press('b', 6); return false; }
      S.list.idx = i; S.list.fixScroll(); yield* self.frames(10); yield* self.press('a', 8); if (S.page !== 'buyQty') { yield* self.press('b', 6); return false; }
      for (let k = 1; k < qty; k++) yield* self.press('up', 4);
      const before = G.inventory.count(name); yield* self.press('a', 10); const ok = G.inventory.count(name) > before;
      yield* self.press('b', 6); if (S.page !== 'main') yield* self.press('b', 6); return ok;
    };
    for (const b of buys) { if (yield* buy(this, b.item, 1, b.art)) { bought.push(b.member.name + ':' + b.item + (b.art ? ' (artifact)' : '')); b.ok = true; } }
    if (herbs > 0 && (yield* buy(this, 'Herb', herbs))) bought.push('Herb x' + herbs);
    // leave the shop, equip the new pieces in the menu, then come back to sell what they replaced
    S.main.idx = 3; yield* this.press('a', 8); yield* this.closeMenus();
    for (const b of buys) if (b.ok) yield* this.equipVia(b.member, b.slot, b.item);
    // junk in the bag: equipment nobody can use, or that is worse than what everyone already wears in that slot
    for (const st of G.inventory.equipment()) { const it = ITEM_DB[st.name]; if (!it || it.key || !it.sell || it.cursed) continue; const slot = G.party.members[0].slotFor(st.name); if (!slot) continue; const v = slot === 'weapon' ? it.atk || 0 : it.def || 0; const useful = G.party.members.some(m => m.canEquip(st.name) && (!m.equip[slot] || (slot === 'weapon' ? ITEM_DB[m.equip[slot]].atk || 0 : ITEM_DB[m.equip[slot]].def || 0) < v)); if (!useful) for (let k = 0; k < st.qty; k++) sells.push(st.name); }
    if (sells.length) { const S2 = yield* this.openShop(); if (S2 && S2 !== 'gameover') { for (const name of sells) { if (S2.page !== 'main') yield* this.press('b', 6); S2.main.idx = 1; yield* this.press('a', 8); if (S2.page !== 'sell') continue; const i = S2.list.items.findIndex(it => it.id === name); if (i < 0) { yield* this.press('b', 6); continue; } S2.list.idx = i; S2.list.fixScroll(); yield* this.frames(8); yield* this.press('a', 8); yield* this.press('a', 10); yield* this.press('b', 6); } S2.main.idx = 3; yield* this.press('a', 8); yield* this.closeMenus(); } }
    for (const name of sells) (this._sold = this._sold || {})[name] = (this._sold[name] || 0) + 1;   /* a thing sold still counts as found (the plan's item checks) */
    if (bought.length || sells.length) this.say((bought.length ? 'bought ' + bought.join(', ') : 'nothing to buy') + (sells.length ? ', sold ' + sells.join(', ') : '') + ' (coins left ' + G.party.coins + ')');
    return true;
  },
  *equipVia(member, slot, item) {
    if (Engine.top !== G.field) yield* this.closeMenus();
    yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') return false;
    M.main.idx = this.menuRow(M, 'equip'); yield* this.press('a', 6); if (M.page !== 'pickChar') { yield* this.closeMenus(); return false; }
    M.charMenu.idx = Math.max(0, M.charMenu.items.findIndex(it => it.id === member)); yield* this.press('a', 6); if (M.page !== 'equip') { yield* this.closeMenus(); return false; }
    M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === slot)); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'equipPick') { yield* this.closeMenus(); return false; }
    const i = M.pickMenu.items.findIndex(it => it.id === item); if (i < 0) { yield* this.closeMenus(); return false; }
    M.pickMenu.idx = i; M.pickMenu.fixScroll(); yield* this.frames(8); yield* this.press('a', 8);
    const ok = member.equip[slot] === item; yield* this.closeMenus(); return ok;
  },
  memberScore(m) {
    if (!m || !m.alive) return 0; const st0 = m.stats(); const psy = m.psynergy();
    // the bench earns half experience, so whoever sits out falls behind and then looks like the weaker choice for
    // ever after. Judge everyone at the front rank's level: a fighter three levels short catches up in a few fights
    const P = G.party; const fr = P.active.filter(x => x.alive); const avg = fr.length ? fr.reduce((t, x) => t + x.level, 0) / fr.length : m.level;
    const k = m.level < avg - 1 ? Math.min(1.35, avg / m.level) : 1;
    const st = k === 1 ? st0 : { hp: st0.hp * k, atk: st0.atk * k, def: st0.def * k, agi: st0.agi * k, pp: st0.pp * k };
    const heals = psy.filter(n => PSY[n] && PSY[n].type === 'heal').length;
    const revives = psy.filter(n => PSY[n] && PSY[n].type === 'revive').length;
    const attacks = psy.filter(n => PSY[n] && (PSY[n].type === 'magic' || PSY[n].type === 'epa')).length;
    return st.hp * 0.45 + st.atk * 1.3 + st.def * 1.1 + st.agi * 0.5 + st.pp * 0.45
      + attacks * 10 + heals * 26 + revives * 34 + m.djinn.length * 6;
  },
  partyScore() {
    const P = G.party; let front = 0, back = 0;
    let weakest = Infinity;
    for (const m of P.members) { const v = this.memberScore(m); if (P.active.includes(m)) { front += v; weakest = Math.min(weakest, v); } else back += v * 0.15; }
    // a front row that cannot heal itself loses fights it should win; and a front row with a passenger in it (nine
    // Djinn on two members, none on the fourth) loses turns to whoever the enemy picks off - the weakest counts extra
    const frontHeals = P.active.some(m => m.alive && m.psynergy().some(n => PSY[n] && PSY[n].type === 'heal'));
    const frontRevive = P.active.some(m => m.alive && m.psynergy().some(n => PSY[n] && PSY[n].type === 'revive'));
    const cover = new Set(); for (const m of P.active) if (m.alive) for (const n of m.psynergy()) if (PSY[n] && (PSY[n].fieldOnly || PSY[n].field)) cover.add(n);
    return front + back + (frontHeals ? 120 : 0) + (frontRevive ? 60 : 0) + (isFinite(weakest) ? weakest * 0.6 : 0) + cover.size * 40;
  },
  planDjinnMoves(maxMoves, keep) {
    const P = G.party; const applied = []; const cap = 9;
    const front = () => P.members.filter(m => P.active.includes(m));
    const move = (name, from, to) => { from.removeDjinn(name); to.setDjinn(name); };
    const bestSingle = () => {
      const base = this.partyScore(); let best = null;
      for (const from of P.members) for (const d of from.djinn.slice()) for (const to of P.members) {
        if (to === from || to.djinn.length >= cap) continue;
        move(d.name, from, to); const v = this.partyScore(); move(d.name, to, from);
        if (v > base + 1 && (!best || v > best.v)) best = { v, kind: 'move', a: { name: d.name, from, to } };
      }
      // swaps keep both members' Djinn counts (and class tiers) intact while changing their elements
      for (let i = 0; i < P.members.length; i++) for (let j = i + 1; j < P.members.length; j++) {
        const A = P.members[i], B = P.members[j];
        for (const da of A.djinn.slice()) for (const db of B.djinn.slice()) {
          if (DJINN[da.name].el === DJINN[db.name].el) continue;
          move(da.name, A, B); move(db.name, B, A);
          const v = this.partyScore();
          move(da.name, B, A); move(db.name, A, B);
          if (v > base + 1 && (!best || v > best.v)) best = { v, kind: 'swap', a: { name: da.name, from: A, to: B }, b: { name: db.name, from: B, to: A } };
        }
      }
      // bulk: hand over every Djinni of one element at once. Crossing a class tier can take three or four Djinn,
      // which no single move or pair would ever reveal - this is what lets a member become a hybrid class.
      for (const from of P.members) for (const to of P.members) {
        if (to === from) continue;
        for (let el = 0; el < 4; el++) {
          const batch = from.djinn.filter(d => DJINN[d.name].el === el).slice(0, cap - to.djinn.length);
          if (batch.length < 2) continue;
          for (const d of batch) move(d.name, from, to);
          const v = this.partyScore();
          for (const d of batch) move(d.name, to, from);
          if (v > base + 1 && (!best || v > best.v)) best = { v, kind: 'bulk', batch: batch.map(d => ({ name: d.name, from, to })) };
        }
      }
      return best;
    };
    // pairs of reserve -> front transfers, for when one move alone looks like a loss
    const bestPair = () => {
      const base = this.partyScore(); const fr = front(); let best = null;
      const donors = []; for (const m of P.members) { if (fr.includes(m)) continue; for (const d of m.djinn.slice()) donors.push({ name: d.name, from: m }); }
      for (let i = 0; i < donors.length; i++) for (const t1 of fr) {
        if (t1.djinn.length >= cap) continue;
        move(donors[i].name, donors[i].from, t1);
        for (let j = 0; j < donors.length; j++) {
          if (j === i || donors[j].from === t1 || !donors[j].from.djinn.some(d => d.name === donors[j].name)) continue;
          for (const t2 of fr) {
            if (t2.djinn.length >= cap) continue;
            move(donors[j].name, donors[j].from, t2); const v = this.partyScore(); move(donors[j].name, t2, donors[j].from);
            if (v > base + 1 && (!best || v > best.v)) best = { v, kind: 'pair', a: donors[i], t1, b: donors[j], t2 };
          }
        }
        move(donors[i].name, t1, donors[i].from);
      }
      return best;
    };
    for (let step = 0; step < (maxMoves || 12); step++) {
      let pick = bestSingle();
      if (!pick) { const pr = bestPair(); if (pr) { move(pr.a.name, pr.a.from, pr.t1); applied.push({ name: pr.a.name, from: pr.a.from, to: pr.t1 }); move(pr.b.name, pr.b.from, pr.t2); applied.push({ name: pr.b.name, from: pr.b.from, to: pr.t2 }); continue; } break; }
      if (pick.kind === 'bulk') { for (const mv of pick.batch) { move(mv.name, mv.from, mv.to); applied.push(mv); } }
      else if (pick.kind === 'swap') { move(pick.a.name, pick.a.from, pick.a.to); move(pick.b.name, pick.b.from, pick.b.to); applied.push(pick.a, pick.b); }
      else { move(pick.a.name, pick.a.from, pick.a.to); applied.push(pick.a); }
    }
    if (!keep) for (let i = applied.length - 1; i >= 0; i--) move(applied[i].name, applied[i].to, applied[i].from); // rewind unless the caller is planning in memory
    return applied;
  },
  djinnPool() {
    const pool = [[], [], [], []];
    for (const m of G.party.members) for (const d of m.djinn) pool[DJINN[d.name].el].push(d.name);
    // strongest first, so the front row gets the better Djinn of each element
    for (const list of pool) list.sort((a, b) => DJINN[b].boost.reduce((x, y) => x + y, 0) - DJINN[a].boost.reduce((x, y) => x + y, 0));
    return pool;
  },
  avgBoost(pool) {
    return pool.map(list => { const v = [0, 0, 0, 0, 0, 0]; if (!list.length) return v; for (const n of list) for (let i = 0; i < 6; i++) v[i] += DJINN[n].boost[i]; return v.map(x => x / list.length); });
  },
  // the class-changing items (the Mysterious Card, the Trainer's Whip, the Tomegathericon): whoever wears one is
  // judged by that item's table instead of the elements'
  classItems() { return Object.keys(ITEM_DB).filter(n => ITEM_DB[n].classItem && (G.inventory.has(n) || G.party.members.some(m => Object.values(m.equip || {}).includes(n)))); },
  classItemCopies(n) { return G.inventory.count(n) + G.party.members.filter(m => Object.values(m.equip || {}).includes(n)).length; },   /* the quartermaster sells second copies: two may wear one */
  wornClassItem(m) { return Object.values(m.equip || {}).find(n => ITEM_DB[n] && ITEM_DB[n].classItem) || null; },
  scoreComposition(m, counts, avg, classItem) {
    const lv = [0, 0, 0, 0]; lv[m.el] = 5;
    for (let e = 0; e < 4; e++) lv[e] += counts[e];
    const cname = determineClass(m.el, lv, { isJenna: m.id === 'Jenna', isPiers: m.id === 'Piers', isKraden: m.id === 'Kraden', classItem: classItem === undefined ? m.classItem : classItem });
    const cls = CLASSES[cname]; if (!cls) return { v: -1, cname };
    const eb = m.equipBonus(); const out = [];
    for (let i = 0; i < 6; i++) {
      let db = 0; for (let e = 0; e < 4; e++) db += counts[e] * avg[e][i];
      out[i] = Math.max(1, Math.floor((m.base[i] + db + eb[i]) * cls.mult[i] / 100));
    }
    const psy = classPsynergy(cname, m.level).concat(m.data.inherent, m.extraPsy || []);
    const uniq = [...new Set(psy)];
    const fields = uniq.filter(n => PSY[n] && (PSY[n].fieldOnly || PSY[n].field) && (PSY[n].classField || ['Move', 'Whirlwind', 'Frost', 'Growth', 'Douse', 'Reveal', 'Cyclone', 'Lift', 'Lash', 'Pound', 'Scoop', 'Tremor', 'Burst', 'Grind', 'Hover', 'Force', 'Carry', 'Catch', 'Sand', 'Blaze', 'Teleport', 'Halt', 'Cloak', 'Avoid', 'Retreat', 'Mind Read', 'Parch'].includes(n)));   // the class items' field Psynergy counts too
    const heals = uniq.filter(n => PSY[n] && PSY[n].type === 'heal').length;
    const revives = uniq.filter(n => PSY[n] && (PSY[n].type === 'revive' || PSY[n].type === 'reviveall')).length;
    const attacks = uniq.filter(n => PSY[n] && ['magic', 'epa', 'drain', 'multi', 'prismatic', 'void', 'assassinate', 'doom'].includes(PSY[n].type)).length;   // the class items' new attack types count as attacks
    const total = counts.reduce((a, b) => a + b, 0);
    const v = out[0] * 0.45 + out[2] * 1.3 + out[3] * 1.1 + out[4] * 0.5 + out[1] * 0.45
      + attacks * 10 + heals * 26 + revives * 34 + total * 6;
    return { v, cname, heals, revives, fields };
  },
  compositions() {
    if (this._comps) return this._comps;
    const out = [];
    for (let a = 0; a <= 9; a++) for (let b = 0; a + b <= 9; b++) for (let c = 0; a + b + c <= 9; c++) for (let d = 0; a + b + c + d <= 9; d++) out.push([a, b, c, d]);
    return (this._comps = out);
  },
  buildBestParty() {
    const P = G.party, members = P.members; if (members.length <= 4) return null;
    const pool = this.djinnPool(); const supply = pool.map(l => l.length); const avg = this.avgBoost(pool);
    const comps = this.compositions();
    const items = this.classItems();
    // cost every (member, composition) pair once, with each class item that would beat the plain class
    const table = members.map(m => { const out = []; comps.forEach((c, ci) => { const t0 = this.scoreComposition(m, c, avg, null); out.push(Object.assign(t0, { ci, item: null })); for (const it of items) { const t = this.scoreComposition(m, c, avg, ITEM_DB[it].classItem); if (t.v > t0.v) out.push(Object.assign(t, { ci, item: it })); } }); return out; });
    const combos = []; const n = members.length;
    const lead = members.findIndex(m => P.isLeader && P.isLeader(m));   // the leader cannot be benched: only the compositions with them in front
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) if (lead < 0 || [i, j, k, l].includes(lead)) combos.push([i, j, k, l]);
    let best = null;
    const totalSupply = supply.reduce((x, y) => x + y, 0); const share = Math.min(9, Math.ceil(totalSupply / 4) + 1);
    const allot = (combo, cap) => {
      // give each member its best affordable composition, strongest candidate first: under a fair-share cap first
      // (so the strongest does not take everything and leave the fourth in rags), then a top-up round with what is
      // left, each keeping what they already hold. cap 9 is the plain greedy
      let left = supply.slice(); const chosen = new Array(4).fill(null); const worn = new Map();
      const order = combo.map((idx, pos) => ({ idx, pos, top: Math.max(...table[idx].map(t => t.v)) })).sort((a, b) => b.top - a.top);
      for (const pass of (cap === 9 ? [9] : [cap, 9])) {
        for (const o of order) {
          const was = chosen[o.pos]; const cur = was ? comps[was.ci] : [0, 0, 0, 0];
          let pick = was ? was.t : null;
          for (const t of table[o.idx]) {
            const c = comps[t.ci]; if (c[0] + c[1] + c[2] + c[3] > pass) continue;
            if (c[0] < cur[0] || c[1] < cur[1] || c[2] < cur[2] || c[3] < cur[3]) continue;
            if (c[0] - cur[0] > left[0] || c[1] - cur[1] > left[1] || c[2] - cur[2] > left[2] || c[3] - cur[3] > left[3]) continue;
            if (t.item && (worn.get(t.item) || 0) >= this.classItemCopies(t.item) && !(was && was.t.item === t.item)) continue;   // one wearer per copy of a class item
            if (!pick || t.v > pick.v) pick = t;
          }
          if (!pick) continue;
          const c = comps[pick.ci]; for (let e = 0; e < 4; e++) left[e] -= c[e] - cur[e];
          if (was && was.t.item) worn.set(was.t.item, Math.max(0, (worn.get(was.t.item) || 1) - 1)); if (pick.item) worn.set(pick.item, (worn.get(pick.item) || 0) + 1);
          chosen[o.pos] = { ci: pick.ci, t: pick };
        }
      }
      let v = 0, heals = 0, revives = 0, weakest = Infinity; const cover = new Set();
      for (const ch of chosen) { if (!ch) continue; v += ch.t.v; heals += ch.t.heals; revives += ch.t.revives; weakest = Math.min(weakest, ch.t.v); for (const f of ch.t.fields) cover.add(f); }
      if (!heals) v -= 200; else v += 120;
      if (revives) v += 60;
      if (isFinite(weakest)) v += weakest * 0.6;   // as partyScore: the weakest member counts extra
      v += cover.size * 40;   // and the field Psynergy the front rank keeps between them: a class that forgets Whirlwind costs a puzzle
      return { v, combo, chosen, left };
    };
    for (const combo of combos) {
      // the fair split and the greedy one: whichever scores higher (the bench takes what is left over either way)
      for (const cand of [allot(combo, share), allot(combo, 9)]) if (!best || cand.v > best.v) best = cand;
    }
    if (!best) return null;
    // turn the winning plan into concrete Djinn assignments
    const take = pool.map(l => l.slice());
    const want = new Map(); // member -> [djinn names]
    const wantClass = new Map(); // member -> the class item to wear, or null
    best.combo.forEach((idx, pos) => {
      const m = members[idx]; if (!best.chosen[pos]) { want.set(m, []); wantClass.set(m, null); return; } const c = comps[best.chosen[pos].ci]; const list = [];
      for (let e = 0; e < 4; e++) for (let q = 0; q < c[e]; q++) { const nm = take[e].shift(); if (nm) list.push(nm); }
      want.set(m, list); wantClass.set(m, best.chosen[pos].t.item || null);
    });
    // the bench takes the remainder, matched to their own element where possible
    const bench = members.filter((m, i) => !best.combo.includes(i));
    for (const m of bench) want.set(m, []);
    for (let e = 0; e < 4; e++) while (take[e].length) {
      const nm = take[e].shift();
      const home = bench.filter(m => want.get(m).length < 9).sort((a, b) => (a.el === e ? 0 : 1) - (b.el === e ? 0 : 1) || want.get(a).length - want.get(b).length)[0];
      if (!home) break;
      want.get(home).push(nm);
    }
    for (const m of bench) wantClass.set(m, null);
    return { want, wantClass, desiredActive: best.combo.map(i => members[i]), score: Math.round(best.v) };
  },
  planParty() {
    const P = G.party;
    const built = this.buildBestParty(); if (!built) return { moves: [], desiredActive: P.active.slice(), score: Math.round(this.partyScore()) };
    // The search scores compositions from the average Djinni of each element, which is close but not exact. Try the
    // winning assignment on the real Adepts and keep what we have if it does not actually come out ahead - a trip to
    // the tents that leaves the party slightly worse is worse than no trip at all.
    const before = this.partyScore();
    const held = P.members.map(m => ({ m, names: m.djinn.map(d => d.name), ci: m.classItem })), wasActive = P.active.slice();
    const setTo = (assign) => { for (const m of P.members) for (const n of m.djinn.map(d => d.name)) m.removeDjinn(n); for (const [m, names] of assign) for (const n of names) m.setDjinn(n); };
    setTo(built.want); P.active = built.desiredActive.slice(); for (const [m, it] of built.wantClass) m.classItem = it ? ITEM_DB[it].classItem : null;
    const after = this.partyScore();
    P.active = wasActive; setTo(held.map(h => [h.m, h.names])); for (const h of held) h.m.classItem = h.ci;
    if (after <= before) return { moves: [], want: null, desiredActive: wasActive, score: Math.round(before), noGain: true };
    const owner = new Map(); for (const m of P.members) for (const d of m.djinn) owner.set(d.name, m);
    const moves = [];
    for (const [to, names] of built.want) for (const nm of names) { const from = owner.get(nm); if (from && from !== to) moves.push({ name: nm, from, to }); }
    const classMoves = [...built.wantClass].filter(([m, it]) => (it || null) !== this.wornClassItem(m));
    return { moves, classMoves, want: built.want, wantClass: built.wantClass, desiredActive: built.desiredActive, score: Math.round(after) };
  },
  // the class items change hands: whoever wears one that should go to somebody else swaps it for any other accessory first
  *wearClassItems(plan) {
    let n = 0; const P = G.party;
    for (const [m, it] of plan.classMoves || []) {
      const cur = this.wornClassItem(m);
      if (cur && cur !== it) { const alt = G.inventory.equipment().find(st => m.slotFor(st.name) === 'acc' && m.canEquip(st.name) && !ITEM_DB[st.name].classItem); if (alt && (yield* this.equipVia(m, 'acc', alt.name))) n++; }
      if (!it) continue;
      const holder = P.members.find(o => o !== m && this.wornClassItem(o) === it);
      if (holder) { const alt = G.inventory.equipment().find(st => holder.slotFor(st.name) === 'acc' && holder.canEquip(st.name) && !ITEM_DB[st.name].classItem); if (!(alt && (yield* this.equipVia(holder, 'acc', alt.name)))) continue; }
      if (G.inventory.has(it) && (yield* this.equipVia(m, 'acc', it))) { n++; this.say(m.name + ' wears the ' + it + ' (' + m.className() + ')'); }
    }
    return n;
  },
  *giveDjinnVia(from, to, name) {
    if (Engine.top !== G.field) yield* this.closeMenus();
    yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') return false;
    M.main.idx = this.menuRow(M, 'djinn'); yield* this.press('a', 6); if (M.page !== 'pickChar') { yield* this.closeMenus(); return false; }
    M.charMenu.idx = Math.max(0, M.charMenu.items.findIndex(it => it.id === from)); yield* this.press('a', 6); if (M.page !== 'djinn') { yield* this.closeMenus(); return false; }
    const di = M.sub.items.findIndex(it => it.id && it.id.name === name); if (di < 0) { yield* this.closeMenus(); return false; }
    M.sub.idx = di; M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'djinnAct') { yield* this.closeMenus(); return false; }
    M.act.idx = Math.max(0, M.act.items.findIndex(it => it.id === 'give')); yield* this.press('a', 6); if (M.page !== 'djinnGive') { yield* this.closeMenus(); return false; }
    const gi = M.giveMenu.items.findIndex(it => it.id === to); if (gi < 0) { yield* this.closeMenus(); return false; }
    M.giveMenu.idx = gi; yield* this.frames(6); yield* this.press('a', 8);
    const ok = to.djinn.some(d => d.name === name); yield* this.closeMenus(); return ok;
  },
  *setActive(want) {
    const P = G.party; if (P.members.length <= 4 || !want || !want.length) return 0;
    let swaps = 0;
    for (let guard = 0; guard < 6; guard++) {
      const inFront = want.filter(m => !P.active.includes(m));
      if (!inFront.length) break;
      const out = P.active.filter(m => !want.includes(m))[0]; if (!out) break;
      if (Engine.top !== G.field) yield* this.closeMenus();
      yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') break;
      M.main.idx = this.menuRow(M, 'party'); yield* this.press('a', 6); if (M.page !== 'party') { yield* this.closeMenus(); break; }
      const ia = M.sub.items.findIndex(it => it.id === inFront[0]); const ib = M.sub.items.findIndex(it => it.id === out);
      if (ia < 0 || ib < 0) { yield* this.closeMenus(); break; }
      M.sub.idx = ia; yield* this.frames(4); yield* this.press('a', 6);
      M.sub.idx = ib; yield* this.frames(4); yield* this.press('a', 8);
      yield* this.closeMenus();
      if (P.active.includes(inFront[0])) swaps++; else break;
    }
    return swaps;
  },
  *enterTent(dx, dy, ax, ay, sceneName) {
    if (G.field.player.tx !== ax || G.field.player.ty !== ay) { const r = yield* this.go(ax, ay); if (r !== true) return null; }
    const d = dy < ay ? DIR.UP : dy > ay ? DIR.DOWN : dx < ax ? DIR.LEFT : DIR.RIGHT;
    this._mapAtStep = G.map.id;
    yield* this.stepTo(dx, dy, d);
    yield* this.frames(16);
    const S = Engine.top;
    return (S && S.constructor.name === sceneName) ? S : null;
  },
  *tentTake(S, name) {
    const i = S.list.items.findIndex(it => it.id === name); if (i < 0) return false;
    S.list.idx = i; S.list.fixScroll(); yield* this.frames(3); yield* this.press('a', 5);
    return true;
  },
  *partyViaCamp(plan) {
    if (!G.flag('camp_founded') || G.mapId === 'camp') return false;
    if (!G.party.active.some(m => m.alive && m.hasPsy('Hideout'))) return false;
    const from = G.mapId;
    if ((yield* this.castPsy('Hideout')) === 'nopsy' || G.mapId !== 'camp') return false;
    let moved = 0, swaps = 0;
    // ---- Djinn tent
    if (plan.want && plan.want.size) {
      const S = yield* this.enterTent(20, 6, 20, 7, 'CampClassScene');
      if (S) {
        // two passes: a Djinni handed away lands on someone who may not want it either
        for (let pass = 0; pass < 2; pass++) {
          let touched = 0;
          for (const [m, names] of plan.want) {
            const held = () => m.djinn.map(d => d.name);
            if (held().length === names.length && names.every(n => held().includes(n))) continue;
            if (S.page !== 'pick') yield* this.press('b', 6);
            const ci = S.charMenu.items.findIndex(it => it.id === m); if (ci < 0) continue;
            S.charMenu.idx = ci; yield* this.frames(3); yield* this.press('a', 6);
            if (S.page !== 'edit') continue;
            for (let g = 0; g < 12; g++) { const extra = held().find(n => !names.includes(n)); if (!extra) break; if (!(yield* this.tentTake(S, extra))) break; moved++; touched++; }
            for (const n of names) { if (held().includes(n)) continue; if (yield* this.tentTake(S, n)) { moved++; touched++; } }
          }
          if (!touched) break;
        }
        yield* this.closeMenus(); yield* this.idle();
      }
    }
    // ---- formation tent
    const want = plan.desiredActive || [];
    if (want.length) {
      const S = yield* this.enterTent(5, 6, 5, 7, 'CampFormationScene');
      if (S) {
        for (let guard = 0; guard < 8; guard++) {
          const out = G.party.active.find(m => !want.includes(m)); const inn = want.find(m => !G.party.active.includes(m));
          if (!out || !inn) break;
          for (const m of [out, inn]) { const i = S.menu.items.findIndex(it => it.id === m); if (i < 0) continue; S.menu.idx = i; yield* this.frames(3); yield* this.press('a', 5); }
          if (G.party.active.includes(inn)) swaps++; else break;
        }
        yield* this.closeMenus(); yield* this.idle();
      }
    }
    // ---- back to the road we left
    yield* this.go(13, 19); this._mapAtStep = G.map.id; yield* this.stepTo(13, 20, DIR.DOWN); yield* this.frames(24); yield* this.idle();
    if (G.mapId === 'camp') { this.say('note: could not walk back out of the camp'); }
    else if (G.mapId !== from) this.say('note: came out of the camp on ' + G.mapId + ', not ' + from);
    return { moved, swaps };
  },
  // a checkpoint is a quiet moment: if the Djinn or the front rank could be clearly better (a member who joined and
  // was never brought forward, Djinn caught since the last look), do what a player would and re-form the party
  *partyCheck() {
    if (this._prowlWear) yield* this.prowlOff(); this.classSwapBack();   /* the planner judges the party as it really is */
    const P = G.party; if (Engine.top !== G.field || G.field.event || G.field.textbox.active || (G.map.world && G.field.ship)) return true;   /* on foot anywhere, the menu is there; not from the ship's deck */
    if (P.members.length <= 4 && P.members.every(m => m.djinn.length < 2)) return true;
    const before = this.partyScore(); const plan = this.planParty();
    if (plan.noGain || !(plan.score > before * 1.04 + 20)) return true;
    this.say('party check: ' + Math.round(before) + ' -> ' + plan.score + ' possible, re-forming');
    return yield* this.optimiseParty();
  },
  *optimiseParty() {
    if (Engine.top !== G.field || G.field.event || G.field.textbox.active) return true;
    const before = Math.round(this.partyScore());
    const plan = this.planParty();
    let done = 0;
    // the tents do in a few presses what the give-menu takes a minute of walking through
    if (plan.noGain) { this.say('party: the Djinn are already where they do the most good (' + before + ')'); return true; }
    const viaCamp = yield* this.partyViaCamp(plan);
    if (viaCamp) {
      yield* this.wearClassItems(plan); this.pickSummons();
      const after = Math.round(this.partyScore());
      this.say('party (camp): ' + viaCamp.moved + ' Djinn placed, ' + viaCamp.swaps + ' front-row changes (' + before + ' -> ' + after + ') | ' + G.party.active.map(m => m.name + ' the ' + m.className() + ' [' + m.djinn.length + ']').join(', '));
      return true;
    }
    // a member can hold nine at most, so keep passing until every move has somewhere to land
    let pending = plan.moves.slice();
    for (let pass = 0; pass < 4 && pending.length; pass++) {
      const left = [];
      for (const mv of pending) {
        if (mv.to.djinn.length >= 9) { left.push(mv); continue; }
        if (!mv.from.djinn.some(d => d.name === mv.name)) continue;
        if (yield* this.giveDjinnVia(mv.from, mv.to, mv.name)) done++; else left.push(mv);
      }
      if (left.length === pending.length) break;
      pending = left;
    }
    const swaps = yield* this.setActive(plan.desiredActive);
    yield* this.wearClassItems(plan); this.pickSummons();
    const after = Math.round(this.partyScore());
    this.say('party: ' + done + ' Djinn moved, ' + swaps + ' front-row changes (' + before + ' -> ' + after + ') | ' + G.party.active.map(m => m.name + ' the ' + m.className() + ' [' + m.djinn.length + ']').join(', '));
    return true;
  },
  *forgeVisit() {
    const n = this.findNpc('Sunshine'); if (!n) return 'nosmith';
    const adj = this.adjacentReachable(n.tx, n.ty); if (!adj) return 'noapproach';
    if (G.field.player.tx !== adj.x || G.field.player.ty !== adj.y) { const r = yield* this.go(adj.x, adj.y); if (r !== true) return 'nopath:' + r; }
    yield* this.face(adj.face);
    yield* this.press('a', 10); yield* this.frames(24);
    if (Engine.top !== G.field && Engine.top.constructor.name === 'ForgeScene') {
      const S = Engine.top;
      // hand over whatever could turn into the biggest upgrade for somebody
      let bi = 0, bv = -1;
      S.menu.items.forEach((it, i) => {
        const outs = (FORGE_TABLE[it.id] || []).filter(x => ITEM_DB[x]);
        const v = outs.length ? Math.max(...outs.map(x => Forge.bestGain(x))) : 0;
        if (v > bv) { bv = v; bi = i; }
      });
      S.menu.idx = bi; if (S.menu.fixScroll) S.menu.fixScroll(); yield* this.frames(5);
      yield* this.press('a', 10);
    }
    let guard = 0;
    while ((G.field.textbox.active || G.field.event) && guard++ < 50) yield* this.press('a', 6);
    yield* this.frames(6);
    return true;
  },
  *forgeAll(limit) {
    let made = 0;
    const rounds = limit || ((typeof Forge !== 'undefined' ? Forge.held().length : 0) * 2 + 4);   // two trips per piece: hand over, then collect
    for (let i = 0; i < rounds; i++) {
      if (!G.get('forge_order') && !(typeof Forge !== 'undefined' && Forge.held().length)) break;
      if (G.mapId !== 'yallam_forge') { const r = yield* this.exec(['enter', 'yallam_forge']); if (r !== true) { this.say('forge: could not reach Sunshine (' + r + ')'); break; } }
      const waiting = G.get('forge_order');
      const r = yield* this.forgeVisit(); if (r !== true) { this.say('forge: ' + r); break; }
      if (waiting && !G.get('forge_order')) { made++; this.say('forged ' + waiting); yield* this.equipFind(waiting); }
      if (G.get('forge_order')) { const rr = yield* this.exec(['enter', 'yallam']); if (rr !== true) break; }   // out, so he can work
    }
    yield* this.gearAll();
    return made;
  },
  OPTIONAL_MAPS: ["alhafran_cave","mikasalla","osenia_cavern","gondowan_settlement","e_tundaria_islet","apojii","treasure_isle","hesperia_settlement","kalt","atteka_inlet","sw_atteka_islet","se_angara_islet","n_osenia_islet","w_indra_islet","sea_of_time_islet","islet_cave","yampi_cave","anemos","vale","vault","bilibin","kolima","imil","xian","altin","kalay","lunpa","tolbi","lalivero","suhalla","idejima"],
  OPTIONAL_BOSSES: {"treasure_isle":{"trig":"TLA.starMagician","flag":"star_magician_done","foes":["Star Magician","Refresh Ball","Thunder Ball","Anger Ball"]},"islet_cave":{"trig":"TLA.sentinel","flag":"sentinel_done","foes":["Sentinel"]},"yampi_cave":{"trig":"TLA.valukar","flag":"valukar_done","foes":["Valukar"]},"anemos":{"trig":"TLA.dullahan","flag":"dullahan_done","foes":["Dullahan"]}},
  foeStub(name) {
    const e = ENEMY_DB[name]; if (!e) return null;
    const at = (a, el) => ((a || [100, 100, 100, 100])[el] === undefined ? 100 : (a || [])[el]);
    return { alive: true, name, hp: e.hp, maxHp: e.hp, t: e.t || 1, atk: () => e.atk, def: () => e.def, agi: () => e.agi, resist: (el) => at(e.rs, el), power: (el) => at(e.pw, el) };
  },
  bestHit(m, foe) {
    const B = BattleScene.prototype, ctx = { aliveParty: () => G.party.active.filter(x => x.alive), aliveEnemies: () => [foe] };
    const swing = B.estAttack.call(ctx, m, foe); let best = swing; const pp = m.stats().pp;
    for (const n of m.psynergy()) { const p = PSY[n]; if (!p || (p.pp || 0) > pp) continue; if (p.type !== 'magic' && p.type !== 'epa' && p.type !== 'drain') continue; const v = B.estPsy.call(ctx, m, p, foe); if (v > best) best = v; }
    for (const d of m.djinn) { let v = 0; try { v = B.estDjinn.call(ctx, m, d.name, foe); } catch (e) { } if (v > best) best = v; }
    return best * 0.7 + swing * 0.3;
  },
  // after the Djinn are rearranged, each member's summon is chosen again: the one that would hit hardest with the
  // Djinn they now hold (a proxy foe with plain resistances), not merely the one with the biggest requirement
  pickSummons() {
    const B = BattleScene.prototype; const foe = { name: 'proxy', hp: 3000, maxHp: 3000, alive: true, level: 30, boss: true, status: {}, buffs: { atk: 0, def: 0, agi: 0, res: 0 }, resist: () => 100, def: () => 120, agi: () => 100, power: () => 100, maxHpV: () => 3000 };
    const ctx = { aliveParty: () => G.party.active.filter(x => x.alive), aliveEnemies: () => [foe] };
    const picks = [];
    for (const m of G.party.members) {
      const av = m.availableSummons(); if (!av.length) { m.summon = null; continue; }
      let best = null, bv = -1; for (const s of av) { let v = 0; try { v = B.estSummon.call(ctx, m, s, foe); } catch (e) { v = SUMMONS[s].req.reduce((x, y) => x + y, 0); } if (v > bv) { bv = v; best = s; } }
      if (best && m.summon !== best) { m.chooseSummon(best); picks.push(m.name + ':' + best); }
    }
    if (picks.length) this.say('summons: ' + picks.join(', '));
  },
  summonBurst(foe) {
    const B = BattleScene.prototype, ctx = { aliveParty: () => G.party.active.filter(x => x.alive), aliveEnemies: () => [foe] };
    let total = 0;
    for (const m of G.party.active.filter(x => x.alive)) { if (!m.summon) continue; let v = 0; try { v = B.estSummon.call(ctx, m, m.summon, foe); } catch (e) { } total += v * 1.5; }
    return total;
  },
  healPerRound() {
    let best = 0;
    for (const m of G.party.active.filter(x => x.alive)) for (const n of m.psynergy()) { const p = PSY[n]; if (!p || p.type !== 'heal' || (p.pp || 0) > m.stats().pp) continue; if ((p.base || 0) > best) best = p.base; }
    return best;
  },
  djinniOk(o) { const foe = ELNAME[o.el] + ' Djinni ' + o.name; return !(o.fight && ENEMY_DB[foe]) || this.canHandle([foe]); },
  canHandle(names) {
    const members = G.party.active.filter(m => m.alive); if (!members.length) return false;
    const foes = names.map(n => this.foeStub(n)).filter(Boolean); if (!foes.length) return false;
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length, avgHp = members.reduce((a, m) => a + m.stats().hp, 0) / members.length;
    let danger = 0, hp = 0, wide = 0; for (const f of foes) { const t = this.foeThreat(f, members); danger += t.one; wide += t.wide; hp += f.hp; }
    const tough = foes.slice().sort((a, b) => b.hp - a.hp)[0];
    const perRound = members.reduce((a, m) => a + this.bestHit(m, tough), 0);
    const rounds = hp / Math.max(1, perRound + this.summonBurst(tough) / 6);
    const minHp = Math.min(...members.map(m => m.stats().hp));
    // one healer keeps up with a single hard hitter, but not with Psynergy that lands on everyone; and something
    // that drops the weakest Adept in a hit had better die fast
    const survives = danger < avgHp * 0.55 + this.healPerRound() * 0.6 && wide < avgHp * 0.6 + this.healPerRound() * 0.25 && !(danger >= minHp && rounds > 3);
    return survives && hp <= perRound * 14 + this.summonBurst(tough);
  },
  foeThreat(f, members) {
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length;
    const res = el => members.reduce((a, m) => a + m.resist(el), 0) / members.length;
    let one = Math.max(0, f.atk() - avgDef) / 2 * f.t, wide = 0;
    const e = ENEMY_DB[f.name] || {};
    for (const ab of (e.ab || [])) {
      const p = PSY[ab]; if (!p || p.type !== 'magic' || !p.base) continue;
      const el = ELCHAR[p.el]; if (el === undefined || el === 4) continue;
      const m = clamp(1 + clamp(f.power(el) - res(el), -200, 200) / 200, 0, 2);
      const centre = p.base * (e.boss ? 0.9 : 0.75) * m;
      if (centre > one) one = centre;
      const n = p.range === 'all' ? members.length : Math.min(members.length, p.range || 1);
      const spread = n > 1 ? centre * (1 + (n - 1) * 0.6) / members.length : 0;   // outer targets take less; averaged over the line
      if (spread > wide) wide = spread;
    }
    return { one, wide };
  },
  optionalValue(id) {
    const d = MAPS[id]; if (!d) return null; let M; try { M = buildMap(id); } catch (e) { return null; }
    const chests = (M.chests || []).filter(c => !G.flag(c.key) && !c.hidden).length, djinn = M.objects.filter(o => o.kind === 'djinni' && !o.gone).length;
    const enc = d.enc || []; const safeEnc = !enc.length || this.canHandle(enc.reduce((best, g) => { const v = g.reduce((a, n) => a + ((ENEMY_DB[n] || {}).atk || 0), 0); return v > best.v ? { v, g } : best; }, { v: -1, g: [] }).g);
    const boss = this.OPTIONAL_BOSSES[id]; const bossOpen = boss && !G.flag(boss.flag); const bossOk = bossOpen && this.canHandle(boss.foes);
    const plan = this.shopPlan(id); const shop = plan && (plan.buys.length > 0 || plan.herbs > 0);
    const fountain = (id === 'tolbi' || id === 'lemuria') && G.inventory.count('Lucky Medal') > 0;
    const wheel = id === 'tolbi' && G.inventory.count('Game Ticket') > 0;
    return { id, chests, djinn, boss: bossOpen ? boss : null, bossOk, shop, fountain, wheel, safeEnc, worth: safeEnc && (chests > 0 || djinn > 0 || bossOk || shop || fountain || wheel) };
  },
  *optionalSweep() {
    if (!G.map.world) { const out = this.mapRoute(G.map.id, (id) => !!(MAPS[id] && MAPS[id].world)); if (!out) return true; const r = yield* this.followRoute(out); if (r !== true) return true; }
    const W = G.map, p = G.field.player; const todo = [];
    for (const [k, v] of Object.entries(W.def.places || {})) { if (!this.OPTIONAL_MAPS.includes(v.map) || (v.cond && !v.cond())) continue; const val = this.optionalValue(v.map); if (!val) continue; const [x, y] = k.split(',').map(Number); if (val.worth) todo.push(Object.assign(val, { x, y, d: Math.abs(x - p.tx) + Math.abs(y - p.ty) })); else if (val.boss && !val.bossOk) this.say('optional: ' + v.map + ' - ' + val.boss.foes[0] + ' is beyond this party for now'); else if (!val.safeEnc && (val.chests || val.djinn)) this.say('optional: ' + v.map + ' - too dangerous for now'); }
    todo.sort((a, b) => a.d - b.d); if (!todo.length) return true;
    this.say('optional sweep: ' + todo.map(t => t.id).join(', '));
    for (const t of todo) {
      const r = yield* this.exec(['world', t.id]); if (r === 'gameover') return 'gameover'; if (r !== true) { this.say('optional: could not reach ' + t.id + ' (' + r + ')'); continue; }
      const e = yield* this.exec(['explore']); if (e === 'gameover') return 'gameover';
      if (t.shop) for (const kind of ['_weaponshop', '_itemshop']) { if (!MAPS[t.id + kind] || !this.shopWorth(t.id + kind)) continue; const a = yield* this.exec(['enter', t.id + kind]); if (a !== true) break; yield* this.shopBuy(); yield* this.exec(['enter', t.id]); }
      const g = yield* this.gamesAt(t.id); if (g === 'gameover') return 'gameover';
      if (t.bossOk) { const h = yield* this.exec(['heal']); if (h === 'gameover') return 'gameover'; const b = yield* this.exec(['try', ['trig', t.boss.trig]]); if (b === 'gameover') return 'gameover'; }
      const back = yield* this.exec(['enter', W.id]); if (back === 'gameover') return 'gameover';
      if (G.map.id !== W.id) { const out = this.mapRoute(G.map.id, (id) => id === W.id); if (out) yield* this.followRoute(out); }
    }
    // medals and tickets are often earned during the sweep itself (shopkeeper gifts, hidden chests), so make one more pass
    for (const id of ['tolbi', 'lemuria']) {
      if (!this.gamesPending(id)) continue;
      if (G.map.id !== W.id) { const back = this.mapRoute(G.map.id, (x) => x === W.id); if (back) yield* this.followRoute(back); }
      const r = yield* this.exec(['world', id]); if (r === 'gameover') return 'gameover'; if (r !== true) continue;
      this.say('back to ' + id + ' to spend what the sweep turned up');
      const g = yield* this.gamesAt(id); if (g === 'gameover') return 'gameover';
      const back = yield* this.exec(['enter', W.id]); if (back === 'gameover') return 'gameover';
    }
    return true;
  },
  gamesPending(id) { return (id === 'tolbi' && (G.inventory.count('Lucky Medal') > 0 || G.inventory.count('Game Ticket') > 0)) || (id === 'lemuria' && G.inventory.count('Lucky Medal') > 0); },
  *gamesAt(id) {
    if ((id === 'tolbi' || id === 'lemuria') && G.inventory.count('Lucky Medal') > 0) { const f = yield* this.exec(['fountain']); if (f === 'gameover') return 'gameover'; }
    if (id === 'tolbi' && G.party.coins >= 3000 && !G.flag('runner_dice_' + Math.floor(G.party.coins / 5000))) { G.set('runner_dice_' + Math.floor(G.party.coins / 5000)); const d = yield* this.exec(['try', ['talk', 'dice_master']]); if (d === 'gameover') return 'gameover'; }   // a throw at the dice tent now and then, when the purse can stand it
    if (id === 'tolbi' && G.inventory.count('Game Ticket') > 0) { const a = yield* this.exec(['enter', 'tolbi_lucky']); if (a === true) { const w = yield* this.exec(['wheel']); if (w === 'gameover') return 'gameover'; yield* this.exec(['enter', 'tolbi']); } }
    return true;
  },
  mapLinks(id) { const def = MAPS[id]; if (!def) return []; let M; try { M = buildMap(id); } catch (e) { return []; } const out = new Set(); for (const e of M.exits) if (e.to && (!e.cond || e.cond())) out.add(e.to); for (const o of M.objects) if (o.kind === 'updraft' && !o.gone && o.to && o.to.map && o.to.map !== id) out.add(o.to.map); /* a vent that carries the party to another map is a way there too */ if (M.world) for (const v of Object.values(M.def.places || {})) if (!v.cond || v.cond()) out.add(v.map); return [...out]; },
  mapRoute(from, isGoal, avoid, badLinks) { const prev = new Map([[from, null]]); const q = [from]; let head = 0; let goal = null; while (head < q.length) { const id = q[head++]; if (id !== from && isGoal(id)) { goal = id; break; } if (prev.size > 2500) break; for (const n of this.mapLinks(id)) if (!prev.has(n) && !(avoid && avoid(n)) && !(badLinks && badLinks.has(id + '>' + n))) { prev.set(n, id); q.push(n); } }   /* avoid: maps not to route through (the world, when walking a pass's rooms) */ if (!goal) return null; const route = []; for (let k = goal; k !== from; k = prev.get(k)) route.push(k); return route.reverse(); },
  nearestTownId() { const W = G.map.world ? G.map : null; let px, py, def; if (W) { px = G.field.player.tx; py = G.field.player.ty; def = W.def; } else { const rt = G.map.def.retreat; if (!rt || !MAPS[rt.map]) return null; px = rt.x; py = rt.y; if (!MAPS[rt.map].places) { try { buildMap(rt.map); } catch (e) { return null; } } def = MAPS[rt.map]; } let best = null; for (const [k, v] of Object.entries(def.places || {})) { if (!MAPS[v.map + '_inn'] || (v.cond && !v.cond())) continue; const [x, y] = k.split(',').map(Number); const d = Math.abs(x - px) + Math.abs(y - py); if (!best || d < best.d) best = { d, map: v.map }; } return best ? best.map : null; },
  nearestInnRoute() { const M = G.map; if (!M.world) return null; let best = null; for (const [k, v] of Object.entries(M.def.places || {})) { if (!MAPS[v.map + '_inn'] || (v.cond && !v.cond())) continue; const [x, y] = k.split(',').map(Number); const pth = this.path(x, y, { allowExits: true }); if (!pth) continue; if (!best || pth.length < best.d) best = { d: pth.length, map: v.map }; } return best ? [best.map, best.map + '_inn'] : null; },
  // a route is a list of maps; a doorway that cannot be reached from where the party stands (a boulder before it, a
  // puzzle not yet done) is remembered, and another way round is looked for when the goal is known
  *followRoute(route, isGoal, avoid) { for (const next of route) { const op = G.map.world && MAPS[next] && !MAPS[next].world ? 'world' : 'enter'; const from = G.map.id; const r = yield* this.exec([op, next]); if (r !== true) { if (isGoal && /exit unreachable|nopath/.test(String(r)) && G.map.id === from) { (this._badLinks = this._badLinks || new Set()).add(from + '>' + next); const alt = this.mapRoute(from, isGoal, avoid, this._badLinks); if (alt) { this.say('no way through ' + from + ' to ' + next + ' (' + r + '); going round by ' + alt.join(' > ')); return yield* this.followRoute(alt, isGoal, avoid); } } return r; } } return true; },
  *healTrip(why) {
    const F = G.field; const fromMap = G.map.id, fx = F.player.tx, fy = F.player.ty; const t0 = this.battles || 0;
    // step 1: get out of the dungeon
    if (!G.map.world && G.map.def.retreat && G.party.active.some(m => m.alive && m.hasPsy('Retreat') && m.pp >= PSY.Retreat.pp)) { const r = yield* this.castPsy('Retreat'); if (r === 'gameover') return 'gameover'; }
    // step 2: find the closest inn by map hops and walk there - a round trip, or not at all: a deck boarded at the
    // captain's word has no door back onto it, so the party rests where it stands rather than be stranded ashore
    const innOf = (id) => MAPS[id + '_inn'] ? id + '_inn' : null;
    let route = null;
    if (!G.map.world) { const probe = this.mapRoute(G.map.id, (id) => id.endsWith('_inn')); if (probe) { const innMap = probe[probe.length - 1]; if (innMap !== fromMap && !this.mapRoute(innMap, (id) => id === fromMap)) { this.say('heal: the inn at ' + innMap + ' has no road back to ' + fromMap + ' - resting in place'); this.restInPlace(why); return true; } } }
    if (!G.map.world) { const inTown = this.mapRoute(G.map.id, (id) => id.endsWith('_inn')); if (inTown && !inTown.some(id => MAPS[id] && MAPS[id].world)) route = inTown; else { const out = this.mapRoute(G.map.id, (id) => !!(MAPS[id] && MAPS[id].world)); if (out) { const ro = yield* this.followRoute(out); if (ro === 'gameover') return 'gameover'; } } }
    if (!route && G.map.world) route = this.nearestInnRoute(); // closest town by walking distance, not by map hops
    // resting in place still has to get back to where the plan stands, if Retreat carried the party out
    const restHere = function* () { self.restInPlace(why); if (G.map.id !== fromMap) { const back = self.mapRoute(G.map.id, (id) => id === fromMap); if (back) { const rb = yield* self.followRoute(back); if (rb !== true) return 'heal: return trip failed (' + rb + ')'; } } return true; }; const self = this;
    if (!route) { this.say('heal: no inn reachable from ' + G.map.id + ' - resting in place'); return yield* restHere(); }
    const r = yield* this.followRoute(route); if (r !== true) { this.say('heal: trip to the inn failed (' + r + ') - resting in place'); return yield* restHere(); }
    const town = this.townOf(G.map.id);
    if (G.party.members.some(m => m.status && m.status.down)) { yield* this.exec(['enter', town]); yield* this.sanctumVisit(); if (G.map.id !== town + '_inn') { const rr = yield* this.exec(['enter', town + '_inn']); if (rr !== true) return this.restInPlace(why); } }
    const ok = yield* this.innRest(); if (ok === 'gameover') return 'gameover'; if (ok !== true) this.restInPlace(why);
    // a shop visit while in town never hurts
    for (const kind of ['_weaponshop', '_itemshop']) { if (!MAPS[town + kind]) continue; const e = yield* this.exec(['enter', town]); if (e !== true) break; if (!this.shopWorth(town + kind)) continue; const e2 = yield* this.exec(['enter', town + kind]); if (e2 !== true) break; yield* this.shopBuy(); }
    // step 3: back to where we were
    const back = this.mapRoute(G.map.id, (id) => id === fromMap);
    if (!back) { this.say('heal: no route back to ' + fromMap); return 'noroute'; }
    const rb = yield* this.followRoute(back, (id) => id === fromMap); if (rb !== true) return 'heal: return trip failed (' + rb + ')';
    const rg = yield* this.go(fx, fy); if (rg === 'gameover') return 'gameover';
    this.say('heal trip to ' + town + ' inn and back (' + why + ', ' + ((this.battles || 0) - t0) + ' fights on the way)'); return true;
  },
  restInPlace(why) { this.sanctumRevive(); for (const m of G.party.members) { if (!m.status.down) { m.hp = m.stats().hp; m.pp = m.stats().pp; m.cd = {}; } } this.say('rested in place (' + why + ') - no inn route'); return true; },
  menuRow(M, id) { const i = M.main.items.findIndex(it => it.id === id); return i < 0 ? 0 : i; },
  *fieldRevive() {
    for (let guard = 0; guard < 6; guard++) {
      const down = G.party.members.filter(m => m.status && m.status.down); if (!down.length) return true;
      const target = down[0];
      let caster = null, psy = null;
      for (const c of G.party.members) { if (!c.alive) continue; for (const n of c.psynergy()) { const p = PSY[n]; if (p && p.type === 'revive' && p.field && c.pp >= p.pp) { if (!caster || p.pp < PSY[psy].pp) { caster = c; psy = n; } } } }   // the menu lets anyone in the party cast, benched or not
      const item = G.inventory.has('Water of Life') ? 'Water of Life' : null;
      if (!caster && !item) return false;
      if (Engine.top !== G.field) yield* this.closeMenus(); yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') return false;
      if (caster) {
        M.main.idx = this.menuRow(M, 'psy'); yield* this.press('a', 6); if (M.page !== 'pickChar') { yield* this.closeMenus(); return false; }
        M.charMenu.idx = Math.max(0, M.charMenu.items.findIndex(it => it.id === caster)); yield* this.press('a', 6); if (M.page !== 'psy') { yield* this.closeMenus(); return false; }
        M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === psy)); M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'psyTarget') { yield* this.closeMenus(); return false; }
        M.targetMenu.idx = Math.max(0, M.targetMenu.items.findIndex(it => it.id === target)); yield* this.frames(6); yield* this.press('a', 8); yield* this.closeMenus();
        if (!target.status.down) this.say(caster.name + ' revived ' + target.name + ' with ' + psy); else return false;
      } else {
        M.main.idx = this.menuRow(M, 'item'); yield* this.press('a', 6); if (M.page !== 'item') { yield* this.closeMenus(); return false; }
        M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === item)); M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'itemAct') { yield* this.closeMenus(); return false; }
        M.act.idx = Math.max(0, M.act.items.findIndex(it => it.id === 'use')); yield* this.frames(4); yield* this.press('a', 6); if (M.page !== 'itemTarget') { yield* this.closeMenus(); return false; }
        M.targetMenu.idx = Math.max(0, M.targetMenu.items.findIndex(it => it.id === target)); yield* this.frames(6); yield* this.press('a', 8); yield* this.closeMenus();
        if (!target.status.down) this.say('used a Water of Life on ' + target.name); else return false;
      }
    }
    return !G.party.members.some(m => m.status && m.status.down);
  },
  *useHealItem(target) {
    const need = target.maxHp() - target.hp; if (need <= 0) return false;
    const opts = ['Herb', 'Nut', 'Vial', 'Potion'].filter(n => G.inventory.has(n)).map(n => ({ n, amt: ITEM_DB[n].use.hpFull ? need : Math.min(ITEM_DB[n].use.hp, need), waste: ITEM_DB[n].use.hpFull ? 0 : Math.max(0, ITEM_DB[n].use.hp - need) }));
    // an item is worth it when most of it is used up; a Potion only when a lot is missing
    const pick = opts.filter(o => o.amt >= 30 && o.waste <= o.amt).sort((a, b) => (ITEM_DB[a.n].buy || 0) - (ITEM_DB[b.n].buy || 0))[0]; if (!pick) return false;
    if (Engine.top !== G.field) yield* this.closeMenus(); yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') return false;
    M.main.idx = this.menuRow(M, 'item'); yield* this.press('a', 6); if (M.page !== 'item') { yield* this.closeMenus(); return false; }
    M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === pick.n)); M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'itemAct') { yield* this.closeMenus(); return false; }
    M.act.idx = Math.max(0, M.act.items.findIndex(it => it.id === 'use')); yield* this.frames(4); yield* this.press('a', 6); if (M.page !== 'itemTarget') { yield* this.closeMenus(); return false; }
    M.targetMenu.idx = Math.max(0, M.targetMenu.items.findIndex(it => it.id === target)); yield* this.frames(6); const hp0 = target.hp; yield* this.press('a', 8); yield* this.closeMenus();
    if (target.hp > hp0) { this.say('used a ' + pick.n + ' on ' + target.name); return true; }
    return false;
  },
  *usePsyStone() {
    const M = G.map; const stones = []; for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) { const o = M.getObj(x, y); if (o && o.psystone) stones.push({ x, y }); }
    if (!stones.length) return false;
    const low = G.party.members.some(m => m.alive && m.pp < m.stats().pp * 0.4) || G.party.members.some(m => m.alive && m.hp < m.maxHp() * 0.5); if (!low) return false;
    const p = G.field.player; stones.sort((a, b) => (Math.abs(a.x - p.tx) + Math.abs(a.y - p.ty)) - (Math.abs(b.x - p.tx) + Math.abs(b.y - p.ty)));
    const r = yield* this.useAt(stones[0].x, stones[0].y); if (r !== true) return false;
    yield* this.idle(); this.say('touched the Psynergy Stone'); return true;
  },
  *fieldHeal() {
    let casts = 0;
    // the stone first if there is one, then what is in the bag, then Psynergy
    if (yield* this.usePsyStone()) return 1;
    for (let guard = 0; guard < 8; guard++) {
      const hurt = G.party.members.filter(m => m.alive && m.hp < m.maxHp() * 0.7).sort((a, b) => a.hp / a.maxHp() - b.hp / b.maxHp()); if (!hurt.length) break;
      if (!(yield* this.useHealItem(hurt[0]))) break; casts++;
    }
    for (let guard = 0; guard < 12; guard++) {
      const hurt = G.party.members.filter(m => m.alive && m.hp < m.maxHp() * 0.7).sort((a, b) => a.hp / a.maxHp() - b.hp / b.maxHp()); if (!hurt.length) break;
      const target = hurt[0]; let best = null;
      for (const c of G.party.members) { if (!c.alive) continue; for (const n of c.psynergy()) { const p = PSY[n]; if (!p || p.type !== 'heal' || c.pp < p.pp) continue; const amt = Math.min(p.base, target.maxHp() - target.hp); if (!best || amt / p.pp > best.v) best = { c, n, v: amt / p.pp }; } }
      if (!best) break;
      if (Engine.top !== G.field) yield* this.closeMenus(); yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') break;
      M.main.idx = this.menuRow(M, 'psy'); yield* this.press('a', 6); if (M.page !== 'pickChar') { yield* this.closeMenus(); break; }
      M.charMenu.idx = Math.max(0, M.charMenu.items.findIndex(it => it.id === best.c)); yield* this.press('a', 6); if (M.page !== 'psy') { yield* this.closeMenus(); break; }
      M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === best.n)); M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'psyTarget') { yield* this.closeMenus(); break; }
      M.targetMenu.idx = Math.max(0, M.targetMenu.items.findIndex(it => it.id === target)); yield* this.frames(6); const hp0 = target.hp; yield* this.press('a', 8); yield* this.closeMenus();
      if (target.hp <= hp0) break; casts++;
    }
    if (casts) this.say('healed up (' + casts + ' items or casts)');
    return casts;
  },
  *equipFind(item) {
    const it = ITEM_DB[item]; if (!it || it.cursed) return false; const m0 = G.party.members[0]; const slot = m0.slotFor(item); if (!slot) return false;
    const v = slot === 'weapon' ? it.atk || 0 : it.def || 0; let best = null;
    for (const rank of [G.party.active, G.party.reserve]) { for (const m of rank) { if (!m.alive || !m.canEquip(item) || m.slotFor(item) !== slot) continue; const cur = m.equip[slot] ? ITEM_DB[m.equip[slot]] : null; if (cur && cur.classItem) continue;   /* a class item stays where the party planner put it */ const cv = cur ? (slot === 'weapon' ? cur.atk || 0 : cur.def || 0) : 0; if (v > cv && (!best || v - cv > best.gain)) best = { m, gain: v - cv }; } if (best) break; }   /* the front first; the rear guard when nobody in front gains */
    if (!best) return false; const ok = yield* this.equipVia(best.m, slot, item); if (ok) this.say(best.m.name + ' equipped the ' + item + ' (+' + best.gain + ')'); return ok;
  },
  // everyone wears the best the bag holds, the front rank served first and the reserve after (they step in when the
  // front falls, and a re-formed party brings them forward): what a member takes off goes to the next in line
  gearPlan() {
    const val = (name, slot) => slot === 'weapon' ? (ITEM_DB[name].atk || 0) : (ITEM_DB[name].def || 0);
    const order = G.party.active.filter(m => m.alive).concat(G.party.reserve.filter(m => m.alive)); const moves = [];
    const bag = new Map(G.inventory.equipment().filter(st => ITEM_DB[st.name] && !ITEM_DB[st.name].cursed && !ITEM_DB[st.name].classItem && !ITEM_DB[st.name].key).map(st => [st.name, st.qty]));
    for (const slot of ['weapon', 'body', 'arm', 'head', 'acc']) for (const m of order) {
      if (m.equip[slot] && ITEM_DB[m.equip[slot]] && ITEM_DB[m.equip[slot]].classItem) continue;   /* the class items are the party planner's, whatever slot they sit in */
      const curV = m.equip[slot] ? val(m.equip[slot], slot) : 0; let best = null;
      for (const [name, qty] of bag) { if (qty <= 0 || m.slotFor(name) !== slot || !m.canEquip(name)) continue; const v = val(name, slot); if (v > curV && (!best || v > best.v)) best = { name, v }; }
      if (!best) continue; moves.push({ m, slot, item: best.name, gain: best.v - curV }); bag.set(best.name, bag.get(best.name) - 1); if (m.equip[slot]) bag.set(m.equip[slot], (bag.get(m.equip[slot]) || 0) + 1);
    }
    return moves;
  },
  *gearAll() {
    if (Engine.top !== G.field || G.field.event || G.field.textbox.active) return 0;
    const moves = this.gearPlan(); if (!moves.length) return 0; let n = 0; const done = [];
    for (const mv of moves) { if (yield* this.equipVia(mv.m, mv.slot, mv.item)) { n++; done.push(mv.m.name + ': ' + mv.item + ' (+' + mv.gain + ')'); } }
    if (n) this.say('gear handed out: ' + done.join(', '));
    return n;
  },
  // the permanent boosts (Power Bread, Cookie, Apple, Hard Nut, Mint, Lucky Pepper) are eaten as soon as they are
  // carried, through the menu like a player would: each to the front-rank member who gets the most from it
  STAT_ITEMS: { 'Power Bread': 'hp', 'Cookie': 'pp', 'Apple': 'atk', 'Hard Nut': 'def', 'Mint': 'agi', 'Lucky Pepper': 'lck' },
  statItemTarget(stat) {
    const front = G.party.active.filter(m => m.alive && !(m.status && m.status.down)); if (!front.length) return null;
    const st = (m) => m.stats(); const I = { hp: 0, pp: 1, atk: 2, def: 3, agi: 4, lck: 5 };
    if (stat === 'pp') { const casters = front.filter(m => m.psynergy().some(n => PSY[n] && PSY[n].type === 'heal')); return (casters.length ? casters : front).sort((a, b) => st(b)[1] - st(a)[1])[0]; }   // the healer who spends the most
    if (stat === 'atk') return front.slice().sort((a, b) => st(b)[2] - st(a)[2])[0];   // the strongest arm gets stronger
    return front.slice().sort((a, b) => st(a)[I[stat]] - st(b)[I[stat]])[0];   // the rest shore up whoever is weakest in it
  },
  *useStatItems() {
    if (Engine.top !== G.field || G.field.event || G.field.textbox.active) return 0;
    let used = 0;
    for (let guard = 0; guard < 12; guard++) {
      const name = Object.keys(this.STAT_ITEMS).find(nm => G.inventory.has(nm)); if (!name) break;
      const target = this.statItemTarget(this.STAT_ITEMS[name]); if (!target) break;
      const before = target.base.slice();
      yield* this.press('b', 8); const M = Engine.top; if (M.constructor.name !== 'MenuScene') { yield* this.closeMenus(); break; }
      M.main.idx = this.menuRow(M, 'item'); yield* this.press('a', 6); if (M.page !== 'item') { yield* this.closeMenus(); break; }
      M.sub.idx = Math.max(0, M.sub.items.findIndex(it => it.id === name)); M.sub.fixScroll(); yield* this.frames(6); yield* this.press('a', 6); if (M.page !== 'itemAct') { yield* this.closeMenus(); break; }
      M.act.idx = Math.max(0, M.act.items.findIndex(it => it.id === 'use')); yield* this.frames(4); yield* this.press('a', 6); if (M.page !== 'itemTarget') { yield* this.closeMenus(); break; }
      M.targetMenu.idx = Math.max(0, M.targetMenu.items.findIndex(it => it.id === target)); yield* this.frames(6); yield* this.press('a', 8); yield* this.closeMenus();
      if (target.base.some((v, i) => v !== before[i])) { used++; this._eaten = this._eaten || {}; this._eaten[name] = (this._eaten[name] || 0) + 1; this.say(target.name + ' ate a ' + name); } else break;
    }
    return used;
  },
  *equipUpgrades() {
    if (Engine.top !== G.field || G.field.event || G.field.textbox.active) return false;
    const sig = G.inventory.equipment().map(st => st.name + st.qty).join('|'); if (sig === this._eqSig) return false; this._eqSig = sig;
    let n = 0;
    for (let guard = 0; guard < 8; guard++) { let did = false; for (const st of G.inventory.equipment()) { if (yield* this.equipFind(st.name)) { did = true; n++; break; } } if (!did) break; }
    this._eqSig = G.inventory.equipment().map(st => st.name + st.qty).join('|'); return n > 0;
  },
  *playFountain() {
    const keeper = G.field.npcs.find(n => n.npc && n.npc.script && /Fountain/.test(n.npc.name || '') && !n.hidden); if (!keeper) { this.say('fountain: no keeper here'); return true; }
    let throws = 0; const prizes = [];
    while (G.inventory.count('Lucky Medal') > 0 && throws < 30) {
      const a = this.adjacentReachable(keeper.tx, keeper.ty); if (!a) break;
      const g = yield* this.go(a.x, a.y); if (g === 'gameover') return 'gameover'; if (g !== true) break;
      yield* this.face(a.face);
      // keep tapping confirm: one press opens the keeper's dialogue, the next answers Yes, and it retries if a press is swallowed
      Input.hold('a', 2);
      let k = 0; while (Engine.top.constructor.name !== 'FountainScene' && k++ < 90) { const tb = G.field.textbox; if (tb.active && tb.waiting) Input.hold('a', 2); yield* this.frames(3); }
      const S = Engine.top; if (S.constructor.name !== 'FountainScene') break;
      const aim = 90 + Math.random() * 8; let w = 0;
      while (S.phase === 'aim' && w++ < 400) { if (S.power >= aim && Math.cos(S.t * 0.11) > 0) Input.hold('a', 1); yield* this.frames(1); }
      while (Engine.top === S && w++ < 600) { if (S.phase === 'land' && S.landT > 22) Input.hold('a', 2); yield* this.frames(2); }
      if (S.prize) prizes.push(S.result + ':' + S.prize); throws++;
      // clear the 'Received ...' message, then step away and back so the next approach starts clean
      let c = 0; while (c++ < 60 && (G.field.event || G.field.textbox.active)) { if (G.field.textbox.active && G.field.textbox.waiting) Input.hold('a', 2); yield* this.frames(2); }
      if (G.inventory.count('Lucky Medal') > 0) { yield* this.stepOffAndBack(); yield* this.frames(6); }
    }
    if (throws) this.say('fountain: ' + throws + ' throw' + (throws > 1 ? 's' : '') + ' - ' + prizes.join(', '));
    yield* this.equipUpgrades(); return true;
  },
  *playWheel() {
    const keeper = G.field.npcs.find(n => n.npc && n.npc.script && /Game Master/.test(n.npc.name || '') && !n.hidden); if (!keeper) return true;
    let spins = 0; const won = [];
    while (G.inventory.count('Game Ticket') > 0 && spins < 30) {
      const before = G.inventory.items.map(i => i.name + i.qty).join('|');
      const r = yield* this.useAt(keeper.tx, keeper.ty); if (r === 'gameover') return 'gameover'; if (r !== true) break;
      yield* this.idle();
      const after = G.inventory.items.filter(i => i.name !== 'Game Ticket' && !before.includes(i.name + i.qty)).map(i => i.name); if (after.length) won.push(after[0]);
      spins++;
    }
    if (spins) this.say('lucky wheel: ' + spins + ' spin' + (spins > 1 ? 's' : '') + (won.length ? ' - ' + won.join(', ') : ''));
    yield* this.equipUpgrades(); return true;
  },
  *sweepReveal() {
    const M = G.map; const hidden = (M.chests || []).filter(c => c.hidden && !G.flag(c.key)); if (!hidden.length) return true;
    if (!G.party.members.some(m => m.alive && m.hasPsy('Reveal'))) return true;
    let got = 0;
    for (const c of hidden) {
      if (!this.adjacentReachable(c.x, c.y)) continue;
      if (G.field.reveal <= 0) { const r = yield* this.castPsy('Reveal'); if (r === 'gameover') return 'gameover'; }
      let u = yield* this.useAt(c.x, c.y); if (u === 'gameover') return 'gameover';
      if (!G.flag(c.key)) { const r2 = yield* this.castPsy('Reveal'); if (r2 === 'gameover') return 'gameover'; u = yield* this.useAt(c.x, c.y); if (u === 'gameover') return 'gameover'; }   // the circle of sight faded on the walk over: cast again beside it
      if (G.flag(c.key)) got++;
    }
    if (got) this.say('Reveal uncovered ' + got + ' hidden chest' + (got > 1 ? 's' : '') + ' in ' + M.name);
    yield* this.equipUpgrades(); return true;
  },
  *openChests() {
    if (!this.opts.chests) return true; const M = G.map; let n = 0;
    for (const ch of (M.chests || []).slice()) {
      if (G.map !== M) break; if (G.field.event || Engine.top !== G.field) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map !== M) break; }   /* a fight on the way to one chest is not the end of the sweep */
      if (G.flag(ch.key) || ch.hidden) continue;
      if (!this.adjacentReachable(ch.x, ch.y, { noOneWay: true })) continue;   /* a chest down a drop or up a vent is the plan's business: the greedy sweep never takes a way it cannot walk back */
      const r = yield* this.useAt(ch.x, ch.y); if (r === 'gameover') return 'gameover'; if (G.flag(ch.key)) { n++; if (ch.item && ITEM_DB[ch.item] && !SUMMONS[ch.item] && !G.field.event) yield* this.equipFind(ch.item); }
    }
    if (n) this.say('opened ' + n + ' chest' + (n > 1 ? 's' : '') + ' in ' + M.name);
    if ((yield* this.sweepReveal()) === 'gameover') return 'gameover';
    if ((yield* this.sweepLoot()) === 'gameover') return 'gameover';
    // any Djinni standing on this map is worth grabbing while we are here, story map or not
    for (const o of G.map.objects.filter(o => o.kind === 'djinni' && !o.gone)) { if (G.map !== M || G.field.event) break; if (!this.adjacentReachable(o.x, o.y, { noOneWay: true })) continue; if (M.world && Math.abs(o.x - G.field.player.tx) + Math.abs(o.y - G.field.player.ty) > 30) continue; /* a world Djinni far off is the plan's business: the road there may be no place for this party */ if (!this.djinniOk(o)) { this.say('leaving Djinni ' + o.name + ' for later - it would beat this party'); continue; } const r = yield* this.exec(['try', ['djinni', o.name]]); if (r === 'gameover') return 'gameover'; }
    yield* this.equipUpgrades(); return true;
  },
  lootObjects(M) {
    const F = G.field; return M.objects.filter(o => !o.gone && (
      (o.kind === 'container' && o.hasItem && !G.flag(o.key)) ||
      (o.kind === 'catchable' && o.item && !(o.hiddenUntilReveal && !(F && F.revealed && F.revealed(o.x, o.y)) && !G.flag('obj:' + o.key + ':seen'))) ||
      (o.kind === 'scoop') || (o.kind === 'spot' && o.item && !G.flag(M.id + ':hidden:' + o.x + ',' + o.y)) || (o.kind === 'leaves' && /^hidden_/.test(o.id || ''))));
  },
  lootLeft(M) { return (M.chests || []).filter(c => !G.flag(c.key)).length + this.lootObjects(M).length; },
  *sweepLoot() {
    if (!this.opts.chests || G.map.world) return true; const M = G.map; let n = 0;   // the world's hidden things are plan steps (a sweep would cross into monsters the party cannot take)
    for (const o of this.lootObjects(M)) {
      if (G.map !== M || G.field.event) break; if (!this.adjacentReachable(o.x, o.y)) continue;
      const before = G.inventory.items.map(i => i.name + i.qty).join('|') + G.party.coins;
      let r;
      if (o.kind === 'container' || o.kind === 'spot') r = yield* this.useAt(o.x, o.y);
      else if (o.kind === 'catchable') r = yield* this.psyAtObject('Catch', o);
      else if (o.kind === 'scoop') r = yield* this.psyAtObject('Scoop', o);
      else if (o.kind === 'leaves') r = yield* this.psyAtObject(['Whirlwind', 'Gale', 'Cyclone'].find(p => G.party.hasPsy(p)) || 'Whirlwind', o);
      if (r === 'gameover') return 'gameover';
      if (G.inventory.items.map(i => i.name + i.qty).join('|') + G.party.coins !== before) n++;
    }
    if (n) this.say('found ' + n + ' hidden item' + (n > 1 ? 's' : '') + ' in ' + M.name);
    return yield* this.lootTour();
  },
  *psyAtObject(name, o) {
    const a = this.adjacentReachable(o.x, o.y); if (!a) return 'noreach'; const r = yield* this.go(a.x, a.y); if (r !== true) return r;
    const rr = yield* this.castPsy(name, a.face); return rr;
  },
  *lootTour() {
    const M = G.map; if (!this.opts.chests || M.world || (M.def.enc && M.def.enc.length) || this._touring) return true;
    this._looted = this._looted || {};
    const doors = M.exits.filter(e => !e.edge && e.door && MAPS[e.to] && MAPS[e.to].indoor && !(MAPS[e.to].enc && MAPS[e.to].enc.length) && !this._looted[e.to] && !(e.cond && !e.cond()));
    const todo = []; for (const e of doors) { let T; try { T = buildMap(e.to); } catch (err) { continue; } if ((T.triggers || []).some(t => t.once && !G.flag(t.once))) continue; /* a story scene waits in there: the plan's business, not the tour's */ if (this.lootLeft(T) > 0 && !todo.some(t => t.to === e.to)) todo.push(e); }
    if (!todo.length) return true;
    this._touring = true; const home = M.id;
    try {
      for (const e of todo) {
        if (G.map.id !== home) break;
        const r = yield* this.exec(['enter', e.to]); if (r === 'gameover') return 'gameover'; if (r !== true) { this._looted[e.to] = true; continue; }
        // inside: the arrival sweep already ran; upper rooms of the house get their own visit
        const inner = yield* this.lootRooms(e.to, home); if (inner === 'gameover') return 'gameover';
        this._looted[e.to] = true;
        if (G.map.id !== home) { const back = yield* this.exec(['enter', home]); if (back === 'gameover') return 'gameover'; if (back !== true) { const out = this.mapRoute(G.map.id, (id) => id === home); if (out) yield* this.followRoute(out); } }
      }
    } finally { this._touring = false; }
    return true;
  },
  *lootRooms(id, home) {
    if (G.map.id !== id) return true; const M = G.map;
    const more = M.exits.filter(e => !e.edge && e.to !== home && MAPS[e.to] && MAPS[e.to].indoor && !this._looted[e.to] && !(e.cond && !e.cond()));
    for (const e of more) { let T; try { T = buildMap(e.to); } catch (err) { continue; } if (this.lootLeft(T) <= 0) { this._looted[e.to] = true; continue; }
      const r = yield* this.exec(['enter', e.to]); if (r === 'gameover') return 'gameover'; if (r !== true) { this._looted[e.to] = true; continue; }
      const deeper = yield* this.lootRooms(e.to, id); if (deeper === 'gameover') return 'gameover'; this._looted[e.to] = true;
      if (G.map.id !== id) { const back = yield* this.exec(['enter', id]); if (back === 'gameover') return 'gameover'; if (back !== true) break; }
    }
    return true;
  },
  *innRest() { const town = this.townOf(G.map.id);
    const npc = G.field.npcs.find(n => n.npc && n.npc.inn && !n.hidden);
    if (!npc) { this.say('inn: no innkeeper on ' + G.map.id); return false; }
    const before = G.party.coins; const r = yield* this.useAt(npc.tx, npc.ty); if (r === 'gameover') return 'gameover'; yield* this.idle();
    if (G.party.coins < before) { this.say('rested at ' + town + ' inn (-' + (before - G.party.coins) + ')'); const at = this.arenaTownHere(); if (at) { const av = (yield* this.arenaVisit(at)); if (av === 'gameover') return 'gameover'; } return true; }
    if (G.party.members.every(m => m.alive && m.hp >= m.maxHp() && m.pp >= m.maxPp())) { this.say('inn: already rested at ' + town); return true; }   // the keeper charges nothing for a party with nothing to heal
    this.say('inn: could not rest at ' + town + ' (' + G.party.coins + ' coins)'); return false;
  },
  *sanctumVisit() {
    const downed = G.party.members.filter(m => m.status && m.status.down); if (!downed.length) return true;
    const priest = G.field.npcs.find(n => n.npc && n.npc.sanctum && !n.hidden);
    if (!priest) { const town = this.townOf(G.map.id); const e = G.map.exits.find(x => x.to === town + '_sanctum'); if (!e) return this.sanctumRevive(); const r = yield* this.exec(['enter', town + '_sanctum']); if (r !== true) return this.sanctumRevive(); const back = G.map.exits.find(x => x.to === town); const pr = G.field.npcs.find(n => n.npc && n.npc.sanctum && !n.hidden); if (pr) { yield* this.useAt(pr.tx, pr.ty); yield* this.idle(); } if (back) yield* this.exec(['enter', town]); if (G.party.members.some(m => m.status && m.status.down)) return this.sanctumRevive(); this.say('sanctum: revived ' + downed.map(m => m.name).join(',')); return true; }
    yield* this.useAt(priest.tx, priest.ty); yield* this.idle(); if (G.party.members.some(m => m.status && m.status.down)) return this.sanctumRevive(); this.say('sanctum: revived ' + downed.map(m => m.name).join(',')); return true;
  },
  sanctumRevive() { const downed = G.party.members.filter(m => m.status && m.status.down); if (!downed.length) return true; const cost = downed.length * 100 + 20; if (G.party.coins < cost) { for (const m of downed) { m.status.down = false; m.hp = Math.max(1, Math.floor(m.stats().hp / 2)); } this.say('sanctum: revived on credit (could not afford ' + cost + ')'); return true; } G.party.coins -= cost; for (const m of downed) { m.status.down = false; m.hp = m.stats().hp; } this.say('sanctum: revived ' + downed.map(m => m.name).join(',')); return true; },
  *roadFights() {
    const F = G.field; if (!G.map.world || F.ship || this._grinding || this._inForge || typeof Travelers === 'undefined') return true;
    const r = (yield* this.grindTravelers(3, { maxDist: 14, noRefresh: true })); return r === 'gameover' ? 'gameover' : true;
  },
  *worldGo(mapId) { this.trace('worldGo');
    const F = G.field, M = G.map; if (!M.world) return 'notworld';
    { const rf = (yield* this.roadFights()); if (rf === 'gameover') return 'gameover'; }   /* whoever is near on the road first (the user's rule: fight the people near you) */
    // a map can have several world entrances (e.g. both ends of a cliff pass): take the nearest one we can actually path to
    const places = M.def.places || {}; const cands = []; for (const [k, v] of Object.entries(places)) { if (v.map === mapId || v.id === mapId) {   /* by the map it opens into, or by the marker's own name */ const [x, y] = k.split(',').map(Number); cands.push({ x, y, v, d: Math.abs(x - F.player.tx) + Math.abs(y - F.player.ty) }); } }
    if (!cands.length) return 'noplace'; cands.sort((p, q) => p.d - q.d);
    // a place with several markers (the cliffs: a bank on either side, a strait mouth at either end): the one for how we travel - a berth when sailing, a landward way on foot
    const open = (c) => !c.v.cond || c.v.cond(); const here = (c) => c.x === F.player.tx && c.y === F.player.ty;
    let tgt = (F.ship ? cands.find(c => open(c) && (c.v.ship || c.v.ashore) && (here(c) || this.path(c.x, c.y))) : null)   /* aboard: the berth the sea actually reaches from here (a strait has one at either end) */
      || cands.find(c => open(c) && (F.ship ? (c.v.ship || c.v.ashore) : (!c.v.ship && (here(c) || this.path(c.x, c.y))))) || cands.find(c => open(c) && (c.v.ship || F.ship || here(c) || this.path(c.x, c.y))) || cands.find(open) || cands[0];
    if (tgt.v.cond && !tgt.v.cond()) return 'placelocked'; this._worldTarget = tgt.v.map; this._worldTargets = [tgt.v.map].concat(Object.values(tgt.v.from || {}).map(f => f.map).filter(Boolean));   /* a pass with a mouth on either side opens into a different map by each */
    const self = this; const arrive = function* () { yield* self.frames(20); yield* self.idle(); return G.map.id !== M.id; };
    if (tgt.v.ship || tgt.v.ashore) { // sea-only destination: sail onto it
      if (!F.ship) { const sx = G.get('shipX'), sy = G.get('shipY'); const rr = (yield* this.go(sx, sy)); if (rr !== true) return 'noship:' + rr; (yield* this.frames(10)); } (yield* this.takeOff());
      if (F.player.tx === tgt.x && F.player.ty === tgt.y) (yield* this.stepOffAndBack());   /* moored on the berth itself: it is stepping onto it that enters */
      const r = (yield* this.go(tgt.x, tgt.y, { allowExits: true })); if (r === 'mapchanged' || G.map.id !== M.id) return true; if (r === true && (yield* arrive())) return true; return 'noenter(sea):' + r;
    }
    // ashore with the winged ship close by and a long walk ahead: fly instead - it crosses water and low land alike,
    // meets nothing in the air, and puts in at the beach nearest the goal (seaPath), so the walk from there is short
    if (!F.ship && G.flag('hasShip') && G.flag('ship_wings') && !(F.player.tx === tgt.x && F.player.ty === tgt.y)) {
      const walk = this.path(tgt.x, tgt.y); const sx = G.get('shipX'), sy = G.get('shipY'); const toShip = this.path(sx, sy);
      if (walk && toShip && walk.length > 24 && toShip.length * 2 < walk.length) { this.say('flying to ' + mapId + ' (' + walk.length + ' steps on foot; the ship is ' + toShip.length + ' away)'); const rr = (yield* this.go(sx, sy)); if (rr === 'gameover') return 'gameover'; (yield* this.frames(10)); }
    }
    if (!F.ship) {
      if (F.player.tx === tgt.x && F.player.ty === tgt.y) (yield* this.stepOffAndBack());
      const r = (yield* this.go(tgt.x, tgt.y)); if (r === 'mapchanged' || G.map.id !== M.id) return true; if (r === true) return (yield* arrive()) ? true : 'noenter';
      // no walk there: the world is gated like the game's - a region is left only through a pass (a cave through a
      // range, a bridge, a desert, a cliff path, a town spanning a river), so find the passes that lead to the
      // target's region and walk them, then walk on. With the ship close at hand, sail instead: the ship then stays
      // with the party rather than being left a continent behind
      let pr = null;
      const shipNear = G.flag('hasShip') && this.path(G.get('shipX'), G.get('shipY'));
      for (let tries = 0; tries < (shipNear ? 0 : 4); tries++) {
        pr = (yield* this.worldViaPasses(tgt)); if (pr === true) break;
        if (!/^pass /.test(pr) || !this._lastPassKey) break;
        // that pass could not be walked (a puzzle not yet solved, a door not yet open): remember it, get back onto the world, look for another way
        (this._badPasses = this._badPasses || new Set()).add(this._lastPassKey); this.say('pass ' + this._lastPassKey + ' is no good for now (' + pr + '), looking for another way');
        if (!G.map.world) { const back = (yield* this.backToWorld()); if (back !== true) return 'nopath (' + pr + '; and no way back to the world: ' + back + ')'; }
      }
      if (pr === true) { if (G.map.id !== M.id) return true; const r2 = (yield* this.go(tgt.x, tgt.y)); if (r2 === 'mapchanged' || G.map.id !== M.id) return true; if (r2 === true) return (yield* arrive()) ? true : 'noenter'; }
      if (!G.flag('hasShip')) return 'nopath' + (pr === true ? '' : ' (' + pr + ')');
      const sx = G.get('shipX'), sy = G.get('shipY'); let rr = (yield* this.go(sx, sy));
      if (rr !== true) { // the ship lies in another region (the party walked on through the passes since it put in): walk the passes back to it
        const shore = [0, 1, 2, 3].map(dd => [sx + DX[dd], sy + DY[dd]]).find(([ax, ay]) => M.inb(ax, ay) && !M.get(ax, ay).water && !this.blockedNoNpc(ax, ay)) || [sx, sy];   /* the passes lead to land: the shore the ship lies against */
        const pr2 = (yield* this.worldViaPasses({ x: shore[0], y: shore[1] })); if (pr2 === 'gameover') return 'gameover'; if (!G.map.world) { const back = (yield* this.backToWorld()); if (back !== true) return 'noship:' + rr + ' (' + pr2 + ')'; } rr = (yield* this.go(sx, sy)); if (rr !== true) return 'noship:' + rr + ' (' + pr2 + ')'; }
      (yield* this.frames(10)); if (!F.ship) return 'notboarded';
    }
    // on the ship: sail to a coast tile from which the target is walkable, land, then walk
    const lr = (yield* this.landAt(tgt.x, tgt.y)); if (lr !== true) return lr;
    const r = (yield* this.go(tgt.x, tgt.y)); if (r === 'mapchanged' || G.map.id !== M.id) return true; if (r === true) return (yield* arrive()) ? true : 'noenter'; return 'landpath:' + r;
  },
  // The world's regions and passes. A region is the land the party walks on foot without entering anything (every
  // place marker is a wall: stepping onto one enters it). A pass is a place whose rooms have a way back out onto the
  // world that lands in another region: a cave through a range, a bridge, a desert crossed screen by screen, a cliff
  // path, a town whose gates open on both banks of a river. Cached per world map and per build of its places.
  worldRegions() { this.trace('worldRegions');
    const F = G.field, M = G.map; if (!M.world) return null;
    const key = M.id + ':' + Object.keys(M.def.places || {}).length + ':' + (G.flag('visited:kalay') ? 1 : 0);
    if (this._regions && this._regions.key === key && this._regions.M === M) return this._regions;   /* a rebuilt world (a gate opened, a road cleared) is flooded again */
    const wasShip = F.ship; F.ship = false;
    const id = new Int32Array(M.w * M.h).fill(-1); let n = 0; const markers = [];
    for (const [k, v] of Object.entries(M.def.places || {})) { const [x, y] = k.split(',').map(Number); if (M.get(x, y).place) markers.push(Object.assign({ x, y }, v)); }
    const isMarker = new Set(markers.map(m => m.x + ',' + m.y));
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
      if (id[y * M.w + x] >= 0 || isMarker.has(x + ',' + y) || this.blockedNoNpc(x, y)) continue;
      const q = [[x, y]]; id[y * M.w + x] = n; let h = 0;
      while (h < q.length) { const [cx, cy] = q[h++]; for (let d = 0; d < 4; d++) { const nx = cx + DX[d], ny = cy + DY[d]; if (!M.inb(nx, ny) || id[ny * M.w + nx] >= 0 || isMarker.has(nx + ',' + ny) || this.blockedNoNpc(nx, ny)) continue; id[ny * M.w + nx] = n; q.push([nx, ny]); } }
      n++;
    }
    F.ship = wasShip;
    const regionAt = (x, y) => (M.inb(x, y) ? id[y * M.w + x] : -1);
    const touching = (x, y) => { const s = new Set(); for (let d = 0; d < 4; d++) { const r = regionAt(x + DX[d], y + DY[d]); if (r >= 0) s.add(r); } return s; };
    for (const m of markers) m.regions = touching(m.x, m.y);
    return (this._regions = { key, M, regionAt, touching, markers, n });
  },
  // the maps joined to a place's map without going out onto the world (a town's houses, a cave's rooms)
  mapCluster(mapId) { this._clusters = this._clusters || {}; if (this._clusters[mapId]) return this._clusters[mapId]; const seen = new Set([mapId]); const q = [mapId]; let h = 0; while (h < q.length) { const cur = q[h++]; for (const nx of this.mapLinks(cur)) { if (seen.has(nx) || !MAPS[nx] || MAPS[nx].world) continue; seen.add(nx); q.push(nx); } if (seen.size > 60) break; } return (this._clusters[mapId] = [...seen]); },
  // every way from a marker back onto the world: (marker, the exit that leads out, where it lands, that landing's region)
  worldPassEdges() { this.trace('worldPassEdges');
    const M = G.map; const R0 = this.worldRegions(); if (!R0) return [];
    const key = M.id + ':' + R0.key; if (this._passEdges && this._passEdges.key === key && this._passEdges.R0 === R0) return this._passEdges.edges;
    const landing = (mapId, dir) => (M.id === 'world_gs1' && typeof worldGs1Landing === 'function') ? worldGs1Landing(mapId, dir) : (typeof worldTlaLanding === 'function' ? worldTlaLanding(mapId, dir, false) : null);
    const edges = [];
    for (const m of R0.markers) {
      if (m.cond && !m.cond()) continue;
      for (const room of this.mapCluster(m.map)) {
        let B; try { B = this._built = this._built || {}; B = B[room] || (B[room] = { exits: buildMap(room).exits }); } catch (e) { continue; }   /* a room's doorways do not change; its build is dear */
        for (const e of B.exits) { if (e.to !== M.id || (e.cond && !e.cond())) continue; const L = landing(room, e.dir); if (!L) continue; const reg = R0.regionAt(L.x, L.y); if (reg < 0) continue; edges.push({ from: m, room, exit: e, land: L, region: reg }); }
      }
    }
    this._passEdges = { key, edges, R0 }; return edges;
  },
  // a way from where the party stands to the target marker through the world's passes; the hops walked one by one
  *worldViaPasses(tgt) { this.trace('worldViaPasses');
    const F = G.field, M = G.map; if (!M.world || F.ship) return 'notafoot';
    let R0 = this.worldRegions(); if (!R0) return 'noregions';
    let start = R0.regionAt(F.player.tx, F.player.ty); if (start < 0) { this._regions = null; R0 = this.worldRegions(); start = R0.regionAt(F.player.tx, F.player.ty); }   /* standing where the flood did not reach: the map changed under the cache */ if (start < 0) return 'nostart';
    const goals = R0.touching(tgt.x, tgt.y); if (!goals.size) return 'nogoal';
    const edges = this.worldPassEdges();
    // BFS over regions: a marker in the region is entered, its rooms walked to an exit that lands in another region
    const prev = new Map([[start, null]]); const q = [start]; let h = 0; let found = goals.has(start) ? start : -1;
    const bad = this._badPasses || new Set(); const ek = (e) => (e.from.id || e.from.map) + '>' + e.room + '@' + e.exit.x + ',' + e.exit.y;
    while (h < q.length && found < 0) { const reg = q[h++]; for (const e of edges) { if (!e.from.regions.has(reg) || prev.has(e.region) || e.region === reg || bad.has(ek(e))) continue; prev.set(e.region, { reg, e }); if (goals.has(e.region)) { found = e.region; break; } q.push(e.region); } }
    if (found < 0) return 'nopassroute';
    const hops = []; for (let r = found; prev.get(r); r = prev.get(r).reg) hops.push(prev.get(r).e); hops.reverse();
    if (!hops.length) return true;
    this.say('through ' + hops.map(e => (e.from.id || e.from.map) + '>' + e.room).join(', ') + ' to ' + ((tgt.v && (tgt.v.id || tgt.v.map)) || tgt.id || tgt.map));
    for (const e of hops) {
      if (!G.map.world) return 'lost: not on the world before ' + e.from.map;
      if (F.player.tx === e.from.x && F.player.ty === e.from.y) (yield* this.stepOffAndBack());
      this._lastPassKey = ek(e);
      const r = (yield* this.go(e.from.x, e.from.y)); (yield* this.idle()); if (r !== 'mapchanged' && G.map.id === M.id) { if (r !== true) return 'pass ' + (e.from.id || e.from.map) + ': ' + r; (yield* this.frames(20)); (yield* this.idle()); if (G.map.id === M.id) return 'pass ' + (e.from.id || e.from.map) + ': noenter'; }
      if (G.map.id !== e.room) { const isGoal = (id) => id === e.room, avoid = (id) => !!(MAPS[id] && MAPS[id].world); const route = this.mapRoute(G.map.id, isGoal, avoid, this._badLinks); if (!route) return 'pass ' + (e.from.id || e.from.map) + ': no way to ' + e.room; const fr = (yield* this.followRoute(route, isGoal, avoid)); if (fr !== true) return 'pass ' + (e.from.id || e.from.map) + ': ' + fr; }
      const out = (yield* this.exec(['enter', M.id, e.exit.x, e.exit.y])); if (out !== true) return 'pass ' + (e.from.id || e.from.map) + ' out: ' + out;
      (yield* this.idle()); if (!G.map.world) return 'pass ' + (e.from.id || e.from.map) + ': did not come out';
    }
    return true;
  },
  // a doorway the party cannot walk to: the things in the way that field Psynergy answers (a boulder to Lift, a crack to
  // Burst, a pillar to Pound...) are dealt with one at a time, nearest first, until the way is open or nothing is left
  *clearTheWay(tx, ty) { this.trace('clearTheWay');
    const F = G.field, M = G.map; let did = false;
    for (let round = 0; round < 6; round++) {
      if (this.path(tx, ty, { allowExits: true }) || this.adjacentReachable(tx, ty)) return did;
      const cands = M.objects.filter(o => !o.gone && o.state !== 'sunk' && o.kind !== 'carriable' && (this.PSY_FOR_KIND[o.kind] || []).length && this.standSpots(o.x, o.y).length && !(o.kind === 'pillar' && o.poundable === false) && !(o.hiddenUntilReveal && !G.flag('obj:' + o.key + ':seen')));
      cands.sort((p, q) => (Math.abs(p.x - F.player.tx) + Math.abs(p.y - F.player.ty)) - (Math.abs(q.x - F.player.tx) + Math.abs(q.y - F.player.ty)));
      let progressed = false;
      for (const o of cands) {
        const psys = (this.PSY_FOR_KIND[o.kind] || []).filter(n => G.party.members.some(m => m.hasPsy(n)) || Object.keys(ITEM_DB).some(k => ITEM_DB[k].grants === n && (G.inventory.has(k) || G.party.members.some(m => Object.values(m.equip || {}).includes(k) || (m.held || []).includes(k)))));
        for (const psy of psys) {
          const before = JSON.stringify([o.gone, o.state, o.x, o.y]);
          const r = (yield* this.psyAtObject(psy, o)); if (r === 'gameover') return 'gameover';
          if (JSON.stringify([o.gone, o.state, o.x, o.y]) !== before) { this.say('cleared the way: ' + psy + ' on ' + (o.id || o.kind) + ' at ' + o.x + ',' + o.y); did = true; progressed = true; break; }
        }
        if (progressed) break;
      }
      if (!progressed) return did;
    }
    return did;
  },
  // from inside a place back onto the world: walk to the nearest way out (through the place's rooms), or Retreat
  *backToWorld() { this.trace('backToWorld');
    for (let k = 0; k < 3 && !G.map.world; k++) {
      const toWorld = (id) => !!(MAPS[id] && MAPS[id].world); const route = this.mapRoute(G.map.id, toWorld, () => false, this._badLinks);
      if (route) { const fr = (yield* this.followRoute(route, toWorld, () => false)); (yield* this.idle()); if (G.map.world) return true; if (fr !== true && k === 2) return 'route: ' + fr; continue; }
      if (G.party.active.some(m => m.alive && m.hasPsy('Retreat') && m.pp >= PSY.Retreat.pp)) { const r = (yield* this.castPsy('Retreat')); (yield* this.idle()); if (r === 'gameover') return 'gameover'; if (G.map.world) return true; continue; }
      return 'no way out';
    }
    return G.map.world ? true : 'still inside';
  },
  // aboard: sail to the coast nearest a land cell and step ashore there (the ship stays parked at the shore)
  // the winged ship is flown, never sailed: if it was set down on the water (the player's doing), A lifts it before any voyage
  *takeOff() { const F = G.field; if (F.ship && G.map.world && G.flag('ship_wings') && G.flag('ship_on_water')) { for (let t = 0; t < 3 && G.flag('ship_on_water'); t++) { Input.hold('a', 2); (yield* this.frames(6)); } } },
  *landAt(tx, ty) { this.trace('landAt');
    const F = G.field, M = G.map; (yield* this.takeOff());
    const landSet = this.landRegion(tx, ty); if (!landSet) return 'nolandregion';
    const tgt = { x: tx, y: ty }; let sea = this.seaPath(landSet, tgt); if (!sea) return 'noseapath';
    this._mapAtStep = M.id;
    // a fight at sea leaves the ship where it was: the way to the shore is planned again from there
    for (let attempt = 0; attempt < 40 && F.ship && sea; attempt++) {   /* a long voyage meets many fights */
      let redo = false;
      for (const [nx, ny, d] of sea) { const rr = (yield* this.stepTo(nx, ny, d)); if (rr === 'interrupted') { if ((yield* this.idle()) === 'gameover') return 'gameover'; redo = true; break; } else if (rr !== true) { redo = true; break; } if (!F.ship) break; }
      if (!F.ship || !redo) break;
      sea = this.seaPath(landSet, tgt);
    }
    if (F.ship && sea) { const last = sea[sea.length - 1]; (yield* this.stepTo(last[0], last[1], last[2])); (yield* this.frames(5)); }
    if (F.ship && F.flying && F.flying()) { for (let t = 0; t < 3 && F.ship; t++) { Input.hold('a', 2); (yield* this.frames(6)); } if (!F.ship) { this.say('the ship set down at ' + F.player.tx + ',' + F.player.ty); const rf = (yield* this.roadFights()); if (rf === 'gameover') return 'gameover'; } }   /* the winged ship: A sets it down on the land under it; then whoever is near on the road */
    if (F.ship) { // parked on a dock: walk off onto adjacent land
      const p = F.player; for (let d = 0; d < 4; d++) { const nx = p.tx + DX[d], ny = p.ty + DY[d]; const t = M.get(nx, ny); if (!M.inb(nx, ny) || t.water || t.name === 'w_dock' || !landSet.has(nx + ',' + ny)) continue; if (M.isSolid(nx, ny) && !t.place) continue; (yield* this.stepTo(nx, ny, d)); (yield* this.frames(5)); if (!F.ship) break; } }
    if (F.ship) return 'stillonship';
    return true;
  },
  *stepOffAndBack() { const F = G.field, p = F.player; const ox = p.tx, oy = p.ty; this._mapAtStep = G.map.id; for (let d = 0; d < 4; d++) { const nx = ox + DX[d], ny = oy + DY[d]; if (this.blockedNoNpc(nx, ny) || this.isExitTile(nx, ny)) continue; const r = (yield* this.stepTo(nx, ny, d)); if (r === 'interrupted') (yield* this.idle()); if (F.player.tx === nx && F.player.ty === ny) { (yield* this.stepTo(ox, oy, R.OPP[d])); (yield* this.frames(10)); (yield* this.idle()); return true; } } return false; },
  landRegion(tx, ty) { this.trace('landRegion'); const M = G.map; const seen = new Set(); const q = [[tx, ty]]; seen.add(tx + ',' + ty); const F = G.field; const wasShip = F.ship; F.ship = false; let head = 0; while (head < q.length) { const [x, y] = q[head++]; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d], k = nx + ',' + ny; if (seen.has(k)) continue; if (this.blockedNoNpc(nx, ny)) continue; if (M.inb(nx, ny) && M.get(nx, ny).water) continue; /* the ship's own cell is walked onto, but it is no part of the land */ seen.add(k); q.push([nx, ny]); } } F.ship = wasShip; return seen.size ? seen : null; },
  seaPath(landSet, tgt) { this.trace('seaPath'); const F = G.field, M = G.map, p = F.player; const start = p.tx + ',' + p.ty; const prev = new Map(); prev.set(start, null); const q = [[p.tx, p.ty]]; let head = 0; let goal = null; const goals = []; const depth = new Map([[start, 0]]); const wings = M.world && G.flag('ship_wings');   /* every beach of that land the ship can reach, then the one nearest the goal on foot: with the wings the ship flies over the low land and puts in close by, instead of at the first shore met */ const isWater = (x, y) => { const t = M.get(x, y); return ((t.water && (!t.river || wings)) || (wings && FieldScene.flyable(t))) && !M.objects.some(ob => !ob.gone && ob.x === x && ob.y === y && F.objectSolid(ob)); };   /* with the wings: reefs, rivers and the low land as well */ while (head < q.length) { const [x, y] = q[head++]; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d], k = nx + ',' + ny; if (prev.has(k) || !M.inb(nx, ny)) continue; if (landSet.has(k)) { const tn = M.get(nx, ny).name; if (wings) { const t = M.get(nx, ny); const o = M.getObj(nx, ny); if (!t.place && !t.river && !(o && o.solid) && FieldScene.flyable(t)) { prev.set(k, [x, y, d]); depth.set(k, depth.get(x + ',' + y) + 1); goals.push({ k, cost: Math.abs(nx - tgt.x) + Math.abs(ny - tgt.y) + depth.get(k) * 0.2 }); q.push([nx, ny]); } continue; }   /* winged: the land itself is flown over, and set down on wherever is nearest the goal */ const dockOff = (tn === 'w_dock' || tn === 'dock') && [0, 1, 2, 3].some(dd => { const ax = nx + DX[dd], ay = ny + DY[dd]; const at = M.inb(ax, ay) ? M.get(ax, ay) : null; return at && landSet.has(ax + ',' + ay) && (at.name === 'w_beach' || at.place); }); /* a dock is a landing only where the party can step off it: onto a beach or a place */ if (tn === 'w_beach' || dockOff) { prev.set(k, [x, y, d]); goals.push({ k, cost: Math.abs(nx - tgt.x) + Math.abs(ny - tgt.y) + (depth.get(x + ',' + y) + 1) * (wings ? 0.2 : 0.5) }); } continue; }   /* a cell of the land we want: a beach is where we put in; the rest of it is not flown over to find one */ if (!isWater(nx, ny)) continue; { const tn = M.get(nx, ny).name; if (!wings && (tn === 'w_beach' || tn === 'w_dock' || tn === 'dock')) continue; }   /* any other shore would land us: not sailed over (in the air it is just crossed) */ const o = M.getObj(nx, ny); if (o && o.solid) continue; prev.set(k, [x, y, d]); depth.set(k, depth.get(x + ',' + y) + 1); q.push([nx, ny]); } } if (goals.length) goal = goals.sort((a, b) => a.cost - b.cost)[0].k; if (!goal) return null; const steps = []; let k = goal; while (prev.get(k)) { const [px, py, d] = prev.get(k); steps.push([px + DX[d], py + DY[d], d]); k = px + ',' + py; } return steps.reverse(); },
  // an op that falls back on other ops (a world walk through a pass's rooms, a door reached round by the map graph) must
  // bottom out: past a dozen nested ops something is chasing its tail, and the step fails instead of the stack
  *exec(step) { this._execDepth = (this._execDepth || 0) + 1; try { if (this._execDepth > 12) return 'nested too deep at ' + (step && step[0]) + ' (' + this._execDepth + ')'; return yield* this.execInner(step); } finally { this._execDepth--; } },
  *execInner(step) {
    if (typeof step === 'string') step = [step];
    const [op, a, b, c, d, e, f, g] = step; const F = G.field;
    if (!['new', 'newTLA', 'shot', 'ckpt', 'idle', 'wait', 'expect', 'expectMap', 'expectParty', 'note', 'try', 'js', 'puppet'].includes(op)) {   /* puppet: a menu opened here would drop the strings */
      yield* this.equipUpgrades(); yield* this.useStatItems();
      if (G.party.members.some(m => m.status && m.status.down) && Engine.top === G.field && !G.field.event) yield* this.fieldRevive();
    }
    switch (op) {
      case 'new': { this.installBattleAI(); const T = Engine.top; if (T && T.constructor.name === 'TitleScene') { yield* this.frames(40); const i = T.menu.items.findIndex(it => it.id === 'new'); T.menu.idx = Math.max(0, i); Input.hold('a', 2); yield* this.frames(10); let g = 0; while (Engine.top === T && g++ < 200) yield* this.frames(1); if (Engine.top === T) return 'title: New Game did not start'; } else { Game.newGame(); Engine.fade = 0; } yield* this.frames(2); return true; }
      case 'newTLA': { Game.newGameTLA(); Engine.fade = 0; this.installBattleAI(); (yield* this.frames(2)); return true; }
      case 'shot': { (yield* this.shot(a || G.map.id)); return true; }
      case 'ckpt': {
        const label = a || ('pc' + this.pc); const again = this._retrying && this.lastCkpt && this.lastCkpt.label === label;
        if (!again) this.checkpoint(label);
        // the party check runs on a retry as well (the checkpoint holds the party as it was before any re-form), and a
        // re-form is saved over the checkpoint so the next retry starts from the better party
        const was = G.party.active.map(m => m.id).join() + '|' + G.party.members.map(m => m.djinn.map(d => d.name).join('/')).join();
        const pr = (yield* this.partyCheck()); if (pr === 'gameover') return 'gameover'; yield* this.gearAll();
        { const at = this.arenaTownHere(); if (at && Engine.top === G.field && !G.field.event) { const av = (yield* this.arenaVisit(at)); if (av === 'gameover') return 'gameover'; } }
        const now = G.party.active.map(m => m.id).join() + '|' + G.party.members.map(m => m.djinn.map(d => d.name).join('/')).join();
        if (now !== was && Engine.top === G.field && !G.field.event) this.checkpoint(label);
        else if (again) this.checkpointMerge(label);   /* a retry's levels, gear and bag are kept for the next one */
        return true; }
      case 'idle': { return (yield* this.idle(b)) === 'gameover' ? 'gameover' : true; }
      case 'wait': { (yield* this.frames(a || 30)); return true; }
      case 'until': { for (let i = 0; i < (b || 900); i++) { if (a()) return true; (yield* this.frames(1)); } return 'until: timed out'; }   // ['until', fn, maxFrames]: idle until fn() holds (the waves of the Sea of Time)
      case 'go': { const r = (yield* this.go(a, b)); if (r === 'mapchanged') { (yield* this.idle()); return true; } return r === true ? true : 'go(' + a + ',' + b + '): ' + r; }
      case 'face': { (yield* this.face(a)); return true; }
      case 'press': { return (yield* this.pressA()) === 'gameover' ? 'gameover' : true; }
      case 'talk': { const n = this.findNpc(a); if (!n) return 'npc not found: ' + a; if (n.hidden) return 'npc hidden: ' + a; const r = (yield* this.useAt(n.tx, n.ty)); return r === true ? true : 'talk ' + a + ': ' + r; }
      case 'use': { const r = (yield* this.useAt(a, b)); return r === true ? true : 'use(' + a + ',' + b + '): ' + r; }
      case 'lever': { const o = this.findObj(a); if (!o) return 'lever not found: ' + a; const r = (yield* this.useAt(o.x, o.y)); return r === true ? true : 'lever ' + a + ': ' + r; }
      case 'revealwalk': { // ['revealwalk', x, y]: to a cell over ground that only Reveal makes solid - cast, step, recast as it fades
        const F = G.field; for (let i = 0; i < 60; i++) { const p = F.player; if (p.tx === a && p.ty === b) return true; if (F.reveal < 60) { const rr = (yield* this.castPsy('Reveal')); if (rr === 'gameover') return 'gameover'; }
          const steps = this.path(a, b); if (!steps || !steps.length) { (yield* this.frames(10)); continue; } const [nx, ny] = steps[0]; const d = nx > p.tx ? DIR.RIGHT : nx < p.tx ? DIR.LEFT : ny > p.ty ? DIR.DOWN : DIR.UP; Input.hold(DIRNAME[d], 4); (yield* this.frames(4)); let g = 0; while (p.moving && g++ < 60) (yield* this.frames(1)); }
        return 'revealwalk: never got there'; }
      case 'ride': case 'drop': { // ['ride', x, y] / ['drop', x, y]: step onto a whirl (or off a ledge) and let it carry the party; done when it has
        if (op === 'ride' && typeof a === 'string') return yield* this.ridePole(a, b);   // ['ride', logId, dir]: a pole afloat, walked across the water
        const mapId = G.map.id; const r = (yield* this.go(a, b)); if (r !== true && r !== 'warped' && r !== 'mapchanged') return op + '(' + a + ',' + b + '): ' + r;
        let n = 0; while (n++ < 400 && (G.field.event || (G.map.id === mapId && G.field.player.tx === a && G.field.player.ty === b))) (yield* this.frames(1));
        const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; return true; }
      case 'lane': { // ['lane', x, y, budget]: walk to (x,y) along a lane of fire (one-way balls that come again and again): the walk is taken a
        // stretch at a time, from one refuge (a cell off the lane: a niche, the way in) to the next, each stretch begun only when the ball's next
        // arrival at it is further off than the stretch takes (plus budget frames at the end, for what follows; default 80)
        const F = G.field, M = G.map; const mapId = M.id; const p = F.player; const budget = c || 80;
        const balls = () => M.objects.filter(o => o.kind === 'tornado' && o.oneway && !o.gone && (o.active === undefined || (typeof o.active === 'function' ? o.active() : o.active)));
        const inLane = (o, x, y) => o.x1 !== undefined ? (o.y === y && x >= o.x0 - 1 && x <= o.x1 + 1) : (o.x === x && y >= o.y0 - 1 && y <= o.y1 + 1);
        const onLane = (x, y) => balls().some(o => inLane(o, x, y));
        // frames until a ball next reaches the stretch of cells [from..to] along its lane (it runs its lane, then starts again from its mouth)
        const arrival = (cells) => Math.min(Infinity, ...balls().map(o => { const hit = cells.filter(([x, y]) => inLane(o, x, y)); if (!hit.length) return Infinity; if (hit.some(([x, y]) => o.x === x && o.y === y)) return 0;   /* it is in the stretch this moment */ const horiz = o.x1 !== undefined; const d = horiz ? (o.dx || 1) : (o.dy || 1); const pos = horiz ? o.x : o.y; const coords = hit.map(([x, y]) => horiz ? x : y); const first = d > 0 ? Math.min(...coords) : Math.max(...coords); const start = horiz ? (o.sx !== undefined ? o.sx : (d > 0 ? o.x0 : o.x1)) : (o.sy !== undefined ? o.sy : (d > 0 ? o.y0 : o.y1)); const end = horiz ? (d > 0 ? o.x1 : o.x0) : (d > 0 ? o.y1 : o.y0); const toFirst = (first - pos) * d; return (toFirst >= 0 ? toFirst : ((end - pos) * d + (first - start) * d)) * (o.speed || 6); }));
        const refugeBeside = () => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const x = p.tx + dx, y = p.ty + dy; if (!onLane(x, y) && !this.blockedNoNpc(x, y)) return [x, y]; } return null; };
        for (let attempt = 0; attempt < 8; attempt++) {
          if (p.tx === a && p.ty === b) return true;
          const steps = this.path(a, b, { ignoreTwisters: true }); if (!steps) return 'lane: nopath';
          let i = 0, broke = false;
          while (i < steps.length) {
            // the stretch ahead: lane cells up to and including the next refuge, or the end
            let j = i; while (j < steps.length - 1 && onLane(steps[j][0], steps[j][1])) j++;
            const stretch = [[p.tx, p.ty]].concat(steps.slice(i, j + 1).map(st => [st[0], st[1]]));
            const need = (j - i + 1) * 8 + (j === steps.length - 1 ? budget : 8);
            let w = 0;
            while (arrival(stretch) < need && w++ < 1500) { if (onLane(p.tx, p.ty)) { const r = refugeBeside(); if (r) { (yield* this.stepTo(r[0], r[1], r[0] < p.tx ? DIR.LEFT : r[0] > p.tx ? DIR.RIGHT : r[1] < p.ty ? DIR.UP : DIR.DOWN)); const back = this.path(a, b, { ignoreTwisters: true }); if (!back) break; steps.splice(0, steps.length, ...back); i = 0; j = i; while (j < steps.length - 1 && onLane(steps[j][0], steps[j][1])) j++; stretch.splice(0, stretch.length, [p.tx, p.ty], ...steps.slice(i, j + 1).map(st => [st[0], st[1]])); continue; } } (yield* this.frames(1)); }
            for (; i <= j; i++) { const [nx, ny, d] = steps[i]; this._mapAtStep = mapId; const r = (yield* this.stepTo(nx, ny, d)); if (r !== true) { broke = true; break; } }
            if (broke) break;
          }
          if (!broke && p.tx === a && p.ty === b) return true;
          if (G.map.id !== mapId) return 'mapchanged';
          const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== mapId) return 'mapchanged';
          if (p.tx === a && p.ty === b) return true;
          this.say('lane: thrown back or blocked, trying again');
        }
        return 'lane: could not get through'; }
      case 'dodge': { // ['dodge', x, y]: walk to (x,y) past the roaming twisters: keep off their rows except where the ledge pinches, and wait there until one is moving away
        const F = G.field, M = G.map; const mapId = M.id;
        const twisters = () => M.objects.filter(o => o.kind === 'tornado' && !o.gone && (o.active === undefined || (typeof o.active === 'function' ? o.active() : o.active)));
        const onRowOf = (x, y) => twisters().some(o => o.x1 !== undefined && o.y === y && x >= o.x0 - 1 && x <= o.x1 + 1);
        const avoid = (x, y) => onRowOf(x, y) && ![x - 1, x, x + 1].some(xx => M.isSolid(xx, y + 1));
        const danger = (nx, ny) => twisters().some(o => { if (o.x1 === undefined || o.y !== ny || nx < o.x0 - 1 || nx > o.x1 + 1) return false; const dist = Math.abs(o.x - nx); if (dist >= 12) return false; const away = Math.sign(o.dx || 1) === Math.sign(o.x - nx); return !(away && dist >= 2); });
        for (let attempt = 0; attempt < 6; attempt++) {
          const p = F.player; if (p.tx === a && p.ty === b) return true;
          const steps = this.path(a, b, { avoid }) || this.path(a, b) || this.path(a, b, { ignoreTwisters: true }); if (!steps) return 'dodge: nopath';   /* a one-wide corridor: the twister sits on the only way, and the timing below is all there is */
          let flung = false;
          for (const [nx, ny, d] of steps) {
            if (!onRowOf(p.tx, p.ty)) { let w = 0; while (w++ < 900 && danger(nx, ny)) (yield* this.frames(1)); }
            this._mapAtStep = mapId; const r = (yield* this.stepTo(nx, ny, d));
            if (r === 'interrupted') { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== mapId) return 'mapchanged'; if (Math.abs(p.tx - nx) + Math.abs(p.ty - ny) > 2) { flung = true; this.say('dodge: flung off the ledge, trying again'); } break; }
            if (r !== true) break;
          }
          if (!flung && F.player.tx === a && F.player.ty === b) return true;
        }
        return F.player.tx === a && F.player.ty === b ? true : 'dodge: stuck'; }
      case 'dropon': { // ['dropon', objId, dir, npcId, when, lx, ly, n]: push a crate/pillar over an edge (n pushes, the last one timed) when the NPC is at (lx,ly) ('at'), or above/below it and moving away
        const o = this.findObj(a); if (!o) return 'dropon: object not found ' + a; const dir = b, when = d || 'at', lx = e, ly = f, n = g || 1; const F = G.field;
        const npc = () => F.npcs.find(x => x.id === c && !x.hidden);
        for (let i = 0; i < n; i++) {
          const sx = o.x - DX[dir], sy = o.y - DY[dir]; const r = (yield* this.go(sx, sy)); if (r !== true) return 'dropon stand(' + sx + ',' + sy + '): ' + r; (yield* this.face(dir));
          if (i === n - 1) { let w = 0; const ok = () => { const x = npc(); if (!x) return true; if (when === 'at') return !x.moving && x.tx === lx && x.ty === ly; if (when === 'above') return x.ty < ly - 1 && x.dir === DIR.UP; if (when === 'below') return x.ty > ly + 1 && x.dir === DIR.DOWN; if (when === 'left') return x.tx < lx - 1 && x.dir === DIR.LEFT; if (when === 'right') return x.tx > lx + 1 && x.dir === DIR.RIGHT; return true; }; while (w++ < 1800 && !ok()) (yield* this.frames(1)); if (w >= 1800) return 'dropon: the timing never came'; }
          const before = [o.x, o.y]; const rr = (yield* this.castPsy('Move', dir)); if (rr !== true) return 'dropon move: ' + rr; if (o.x === before[0] && o.y === before[1]) return 'dropon: it did not move (push ' + i + ')';
        }
        return true; }
      case 'pound': { const o = this.findObj(a); if (!o) return 'pillar not found: ' + a; if (o.state === 'sunk') return true; const r = (yield* this.psyAtObject('Pound', o)); return r === true ? true : 'pound ' + a + ': ' + r; }   // ['pound', pillarId]
      case 'psyat': { const o = this.findObj(b); if (!o) return 'object not found: ' + b; const r = (yield* this.psyAtObject(a, o)); return r === true ? true : 'psyat ' + a + ' ' + b + ': ' + r; }   // ['psyat', psy, objId]
      case 'scorpion': { // Yampi: wait for the thing under the sand to run between the two pillars, then sink both behind and before it
        const M = G.map, F = G.field; const pl = this.findObj('yds3_pL'), pr = this.findObj('yds3_pR'); if (!pl || !pr) return 'scorpion: no pillars';
        for (let tries = 0; tries < 8 && !G.flag('scorp_trapped'); tries++) {
          const s = () => F.npcs.find(n => n.id === 'yd_scorp3'); if (!s()) return 'scorpion: not on this screen';
          let g = 0; while (g++ < 900 && !(s() && s().tx > pl.x + 2 && s().tx < pr.x - 2)) (yield* this.frames(1));
          let r = (yield* this.psyAtObject('Pound', pl)); if (r === 'gameover') return 'gameover';
          r = (yield* this.psyAtObject('Pound', pr)); if (r === 'gameover') return 'gameover';
          const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover';
          if (!G.flag('scorp_trapped')) { this.say('scorpion slipped the trap, trying again'); (yield* this.frames(120)); }
        }
        return G.flag('scorp_trapped') ? true : 'scorpion: never trapped'; }
      case 'trig': { const t = typeof a === 'string' ? this.findTrigger(a) : { x: a, y: b, w: 1, h: 1 }; if (!t) return 'trigger not found: ' + a;
        // a repeatable trigger can carry the party off before this step even runs (the Suhalla tornado does)
        if (typeof a === 'number' && !G.map.inb(a, b)) return 'trig ' + a + ',' + b + ': that tile is not on ' + G.map.id; if (t.cond && !t.cond()) return 'trigger cond false: ' + a; const tx = t.x + Math.floor((t.w || 1) / 2), ty = t.y + Math.floor((t.h || 1) / 2); if (F.player.tx === tx && F.player.ty === ty) { const was = G.map.id; (yield* this.stepOffAndBack()); if (G.map.id !== was) { (yield* this.idle()); return true; } }   // a repeatable trigger can move us elsewhere
        const r = (yield* this.go(tx, ty, { allowExits: true })); if (r !== true && r !== 'mapchanged') return 'trig ' + a + ': ' + r; (yield* this.frames(10)); const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; return true; }
      case 'enter': { if (G.map.id === a) return true; // already there (e.g. a skipped shop visit)
        if (G.map.world && !this.findExit(a) && Object.values(G.map.def.places || {}).some(v => v.map === a)) return yield* this.exec(['world', a]); // out on the map already: sail or walk there instead
        if (/_(weaponshop|itemshop)$/.test(a) && !G.map.world && !this.shopWorth(a)) { this.say('skipping ' + a + ': nothing worth buying'); return true; }
        let e = (b !== undefined) ? G.map.exits.find(e => e.to === a && b >= e.x && b < e.x + e.w && c >= e.y && c < e.y + e.h) : this.findExit(a);
        if (!e && b === undefined) { const up = G.map.objects.find(o => o.kind === 'updraft' && !o.gone && o.to && o.to.map === a); if (up) { const r = (yield* this.exec(['ride', up.x, up.y])); if (r === 'gameover') return 'gameover'; return G.map.id === a ? true : 'enter ' + a + ': the vent did not carry us (' + r + ')'; } }   // a vent to the next map is a doorway of a kind
        if (!e) { // no door from here: walk the map graph instead - out of the town, across the world, and in again
          const route = MAPS[a] ? this.mapRoute(G.map.id, (id) => id === a) : null;
          if (route && route[0] === a) {   // the graph (a fresh build) has a door this map was built without - a flag set since opened it: the map is rebuilt under the party's feet, as re-entering it would
            const F = G.field, p = F.player; F.loadMap(G.map.id, p.tx, p.ty, p.dir, { noAutosave: true, keepShip: true }); Engine.fade = 0; Engine.fadeDir = 0; (yield* this.frames(2)); e = this.findExit(a); if (!e) return 'exit not found: ' + a + ' (not even rebuilt)'; this.say('rebuilt ' + G.map.id + ': the way to ' + a + ' had opened');
          } else {
            if (route) { const rr = yield* this.followRoute(route); if (rr === 'gameover') return 'gameover'; if (G.map.id === a) return true; }
            return 'exit not found: ' + a;
          }
        } if (e.cond && !e.cond()) return 'exit locked: ' + a; const [ex, ey] = this.exitCell(e); let adj = this.adjacentReachable(ex, ey); let near = this.path(ex, ey, { allowExits: true }); if (!near && !adj) { const cleared = (yield* this.clearTheWay(ex, ey)); if (cleared === 'gameover') return 'gameover'; if (cleared) { adj = this.adjacentReachable(ex, ey); near = this.path(ex, ey, { allowExits: true }); } } if (!near && !adj && (G.map.objects.some(o => o.kind === 'tornado' && !o.gone) || G.field.npcs.some(n => !n.hidden && n.move && n.move !== 'static'))) { const mid = G.map.id; for (let w = 0; w < 24 && !near && !adj; w++) { (yield* this.frames(20)); if (G.map.id !== mid) break; adj = this.adjacentReachable(ex, ey); near = this.path(ex, ey, { allowExits: true }); } }   /* the whirl that carried the party in still spins beside it, or a wanderer stands in the doorway: a few seconds, and the way is clear */ if (!near && !adj) return 'exit unreachable: ' + a + ' @' + ex + ',' + ey; if (G.field.player.tx === ex && G.field.player.ty === ey) (yield* this.stepOffAndBack()); const r = G.map.id === a ? 'mapchanged' : (yield* this.go(ex, ey, { allowExits: true })); if (r !== true && r !== 'mapchanged') return 'enter ' + a + ': ' + r; (yield* this.frames(20)); const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== a) { /* maybe standing on the exit tile without transition: nudge */ Input.hold(DIRNAME[e.dir === undefined ? DIR.DOWN : e.dir], 4); (yield* this.frames(30)); (yield* this.idle()); } if (G.map.id !== a) return 'enter ' + a + ': still on ' + G.map.id; if ((yield* this.openChests()) === 'gameover') return 'gameover'; return true; }
      case 'world': {
        if (a !== 'yallam' && this.forgeWorth()) { const fr = (yield* this.forgeTrip()); if (fr === 'gameover') return 'gameover'; }   // the smith on the way: raw material in the bag is gear nobody wears (the user's rule: no hoarding)
        if (!G.map.world) { const out = this.mapRoute(G.map.id, (id) => !!(MAPS[id] && MAPS[id].world)); if (out) { const ro = yield* this.followRoute(out); if (ro === 'gameover') return 'gameover'; } } // step outside first if we are in a dungeon or town
        const r = (yield* this.worldGo(a)); if (r !== true) return 'world ' + a + ': ' + r; const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== a && G.map.id !== this._worldTarget && !(this._worldTargets || []).includes(G.map.id)) return 'world ' + a + ': arrived at ' + G.map.id;   /* a marker named for its place opens into that place's first map */ if ((yield* this.openChests()) === 'gameover') return 'gameover'; return true; }
      case 'psy': { const r = (yield* this.castPsy(a, b, c)); this.classSwapBack(); return r === true ? true : 'psy ' + a + ': ' + r; }   // ['psy', name, faceDir?, shoveDir?]
      case 'hover': { // ['hover', padX, padY, tx, ty]: stand on the violet panel, cast Hover, and walk over the drop to (tx,ty) while it lasts
        const r0 = (yield* this.go(a, b)); if (r0 !== true) return 'hover: pad(' + a + ',' + b + '): ' + r0;
        const F = G.field; if (!F.objectAt(a, b) || F.objectAt(a, b).kind !== 'hoverpad') return 'hover: no live panel at ' + a + ',' + b;
        const r1 = (yield* this.castPsy('Hover')); if (r1 !== true) return 'hover: ' + r1; if (!F.hovering) return 'hover: the panel did not lift the party';
        const r2 = (yield* this.go(c, d)); if (r2 === 'mapchanged') { (yield* this.idle()); return true; } if (r2 !== true) return 'hover: go(' + c + ',' + d + '): ' + r2;
        for (let i = 0; i < 200 && F.hovering; i++) (yield* this.frames(1)); (yield* this.idle());
        return F.player.tx === c && F.player.ty === d ? true : 'hover: fell short (' + F.player.tx + ',' + F.player.ty + ')'; }
      case 'land': { // ['land', x, y]: ashore at a spot on land, sailing to the coast nearest it first if need be, and walking the rest
        const F = G.field; if (!G.map.world) return 'land: not on the world map';
        if (!F.ship && this.path(a, b)) { const r = (yield* this.go(a, b)); return r === true ? true : 'land(' + a + ',' + b + '): ' + r; }
        if (!F.ship) { if (!G.flag('hasShip')) return 'land: no way there'; const sx = G.get('shipX'), sy = G.get('shipY'); const rr = (F.player.tx === sx && F.player.ty === sy) ? (yield* this.stepOffAndBack()) || true : (yield* this.go(sx, sy)); if (rr !== true) return 'land: noship:' + rr; (yield* this.frames(10)); if (!F.ship) return 'land: not boarded'; }   /* standing on the ship's own cell (set down under the party's feet): a step off and back is the boarding */
        const lr = (yield* this.landAt(a, b)); if (lr !== true) return 'land(' + a + ',' + b + '): ' + lr; const r = (yield* this.go(a, b)); return r === true ? true : 'land(' + a + ',' + b + '): ' + r; }
      case 'sail': { // ['sail', x, y]: out to a spot on the sea - back aboard the ship first if the party is ashore
        const F = G.field; if (!G.map.world) return 'sail: not on the world map';
        if (!F.ship) { if (!G.flag('hasShip')) return 'sail: no ship'; const sx = G.get('shipX'), sy = G.get('shipY'); const rr = (F.player.tx === sx && F.player.ty === sy) ? (yield* this.stepOffAndBack()) || true : (yield* this.go(sx, sy)); if (rr !== true) return 'sail: noship:' + rr; (yield* this.frames(10)); if (!F.ship) return 'sail: not boarded'; }
        (yield* this.takeOff()); let tx = a, ty = b; if (!G.map.get(a, b).water) { let best = null; for (let rad = 1; rad <= 3 && !best; rad++) for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const t = G.map.inb(a + dx, b + dy) && G.map.get(a + dx, b + dy); if (t && t.water && !t.river && !G.map.objects.some(o => !o.gone && o.x === a + dx && o.y === b + dy)) {   /* open water: not a glint or a rock */ const d = Math.abs(dx) + Math.abs(dy); if (!best || d < best.d) best = { x: a + dx, y: b + dy, d }; } } if (best) { tx = best.x; ty = best.y; this.say('sail: ' + a + ',' + b + ' is shore now - anchoring at ' + tx + ',' + ty); } }   /* a spot the plan knew as sea is a beach on a redrawn coast: the ship stays on the water beside it */ const r = (yield* this.go(tx, ty)); return r === true ? true : 'sail(' + tx + ',' + ty + '): ' + r; }
      case 'psyAt': { /* stand adjacent to (b,c) opposite to dir a? -> face tile (b,c) from the side given by d (direction to face) */ const tx = b - DX[c], ty = c === undefined ? b : c; return 'psyAt unsupported'; }
      case 'haltnpc': { // ['haltnpc', id]: a skittish creature (Kite) - walk up to it, hold it with Halt, then speak to it
        for (let tries = 0; tries < 6; tries++) {
          const npc = G.field.npcs.find(x => x.id === a && !x.hidden); if (!npc) return 'haltnpc: no ' + a;
          let stood = null; for (let d = 0; d < 4; d++) { const sx = npc.tx - DX[d], sy = npc.ty - DY[d]; if (this.blockedNoNpc(sx, sy)) continue; const r = (yield* this.go(sx, sy)); if (r === true) { stood = d; break; } }
          if (stood === null) return 'haltnpc: no way beside ' + a;
          if (npc.tx !== G.field.player.tx + DX[stood] || npc.ty !== G.field.player.ty + DY[stood]) continue;   // it moved while we walked
          (yield* this.face(stood)); const rr = (yield* this.castPsy('Halt', stood)); if (rr !== true) return 'haltnpc: ' + rr;
          if (!(npc.halted > 0)) continue;
          (yield* this.face(stood)); yield* this.press('a', 8); (yield* this.idle(600)); return true;
        }
        return 'haltnpc: ' + a + ' would not hold still'; }
      case 'oasis': { // ['oasis', x, y]: a rock ring in the desert with a pool hidden in it - stand in the ring's gap, cast Reveal, wade in
        const o = G.map.objects.find(ob => ob.kind === 'oasis' && !ob.gone && Math.abs(ob.x - a) + Math.abs(ob.y - b) <= 2); if (!o) return 'oasis: none near ' + a + ',' + b;
        const cx = o.x, y0 = o.y - 1; const gaps = [[cx, y0 + 2, 3], [cx - 2, y0, 2], [cx + 2, y0, 2], [cx, y0 - 1, 0]];
        let stood = null; for (const [gx, gy, d] of gaps) { if (this.blockedNoNpc(gx, gy)) continue; const r = (yield* this.go(gx, gy)); if (r === true) { stood = d; break; } }
        if (stood === null) return 'oasis: no way into the ring at ' + cx + ',' + y0;
        (yield* this.face(stood)); const rr = (yield* this.castPsy('Reveal', stood)); if (rr !== true) return 'oasis: ' + rr;
        const g2 = (yield* this.go(o.x, o.y)); if (g2 !== true) return 'oasis: wade in: ' + g2; (yield* this.idle(200)); return true; }
      case 'cast': { // ['cast', psy, x, y, faceDir, shoveDir]: stand on the tile behind (x,y) relative to faceDir and cast (Move shoves the way faced, or shoveDir)
        const sx = b - DX[d], sy = c - DY[d]; const r = (yield* this.go(sx, sy)); if (r !== true) return 'cast ' + a + ' stand(' + sx + ',' + sy + '): ' + r; const rr = (yield* this.castPsy(a, d, e)); this.classSwapBack(); return rr === true ? true : 'cast ' + a + ': ' + rr; }
      case 'roll': { // ['roll', logId, dir]: stand against a felled log on the side away from dir and walk into it until it has rolled as far as it goes
        const o = this.findObj(a); if (!o) return 'roll: object not found ' + a; const dir = b; const F = G.field;
        const cells = F.logCells(o); const mid = cells[Math.floor(cells.length / 2)]; const sx = mid[0] - DX[dir], sy = mid[1] - DY[dir];
        const r = (yield* this.go(sx, sy)); if (r !== true) return 'roll ' + a + ' stand(' + sx + ',' + sy + '): ' + r;
        (yield* this.face(dir)); let moved = 0;
        for (let i = 0; i < 40 && !o.gone; i++) { const bx = o.x, by = o.y; Input.hold(DIRNAME[dir], 3); (yield* this.frames(14)); if (o.x !== bx || o.y !== by || o.gone) moved++; else break; if (o.gone) break; const p = F.player; const nsx = F.logCells(o)[Math.floor(cells.length / 2)][0] - DX[dir], nsy = F.logCells(o)[Math.floor(cells.length / 2)][1] - DY[dir]; if (p.tx !== nsx || p.ty !== nsy) { const rr = (yield* this.go(nsx, nsy)); if (rr !== true) break; (yield* this.face(dir)); } }
        (yield* this.idle()); return moved ? true : 'roll ' + a + ': it did not move'; }
      case 'ridepole': { return yield* this.ridePole(a, b); }
      case 'berg': { // ['berg', bergId, tx, ty]: wait for the floe to come alongside, step onto it, ride until (tx,ty) is alongside and step off
        const o = this.findObj(a); if (!o || o.kind !== 'berg') return 'berg: no floe ' + a; const F = G.field, p = F.player;
        const adj = (x, y) => Math.abs(o.x - x) + Math.abs(o.y - y) === 1; const towards = (x, y) => x > p.tx ? DIR.RIGHT : x < p.tx ? DIR.LEFT : y > p.ty ? DIR.DOWN : DIR.UP;
        const step = function* (self, x, y) { (yield* self.face(towards(x, y))); Input.hold(DIRNAME[towards(x, y)], 3); for (let i = 0; i < 40 && !(p.tx === x && p.ty === y && !p.moving); i++) (yield* self.frames(1)); return p.tx === x && p.ty === y; };
        let n = 0; while (n++ < 2400) { if (Engine.top !== F) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; continue; } if (adj(p.tx, p.ty) && (o.t || 0) <= 2 && !p.moving) { if (yield* step(this, o.x, o.y)) break; } (yield* this.frames(1)); }
        if (!(p.tx === o.x && p.ty === o.y)) return 'berg ' + a + ': never came alongside';
        n = 0; while (n++ < 2400) { if (Engine.top !== F) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; continue; } if (!(p.tx === o.x && p.ty === o.y)) return 'berg ' + a + ': fell off at ' + p.tx + ',' + p.ty; if (adj(b, c) && (o.t || 0) <= 2) { if (yield* step(this, b, c)) break; } (yield* this.frames(1)); }
        (yield* this.idle()); return (p.tx === b && p.ty === c) ? true : 'berg ' + a + ': did not reach ' + b + ',' + c; }
      case 'ledge': { // ['ledge', twisterId, [[x,y],...]]: along a one-wide ledge swept by a whirlwind, notch to notch - each dash only once the wind has gone by and cannot be back before we are in the next notch
        const F = G.field, M = G.map, mapId = M.id, p = F.player; const tw = () => M.objects.find(o => o.id === a && !o.gone);
        const eta = (o, lo, hi) => { const spd = o.speed || 10; if (o.x >= lo && o.x <= hi) return 0; const away = o.x < lo ? o.dx < 0 : o.dx > 0; if (!away) return (o.x < lo ? lo - o.x : o.x - hi) * spd; const bound = o.x < lo ? (o.x0 !== undefined ? o.x0 : o.x) : (o.x1 !== undefined ? o.x1 : o.x); return (Math.abs(o.x - bound) + (o.x < lo ? lo - bound : bound - hi)) * spd; };   /* frames until the wind is on the stretch [lo,hi] of its row */
        const safe = (x, y) => { const o = tw(); return !o || y !== o.y || x < o.x0 || x > o.x1; };
        const margin = (tx, ty, steps) => { const o = tw(); return o ? eta(o, Math.min(p.tx, tx), Math.max(p.tx, tx)) - (steps.length * 9 + 30) : 1; };
        let i = 0, restarts = 0;
        while (i < b.length) {
          if (restarts > 12) return 'ledge: could not get along it';
          const [wx, wy] = b[i]; if (p.tx === wx && p.ty === wy) { i++; continue; }
          let tx = wx, ty = wy, steps = this.path(tx, ty, { ignoreTwisters: true }); if (!steps) return 'ledge: nopath to ' + tx + ',' + ty;
          if (safe(p.tx, p.ty)) { let w = 0; while (w++ < 1500 && margin(tx, ty, steps) <= 0) (yield* this.frames(1)); }
          else if (margin(tx, ty, steps) <= 0 && i > 0) { const back = this.path(b[i - 1][0], b[i - 1][1], { ignoreTwisters: true }); if (back && margin(b[i - 1][0], b[i - 1][1], back) > 0) { i--; tx = b[i][0]; ty = b[i][1]; steps = back; this.say('ledge: the wind is back, into the notch behind'); } }   /* caught out on the ledge (a fight ended here): on to the next notch if the wind allows, else back to the last */
          let flung = false, again = false;
          for (const [nx, ny, d] of steps) {
            this._mapAtStep = mapId; const r = (yield* this.stepTo(nx, ny, d));
            if (r === true) continue;
            if (r === 'mapchanged' || G.map.id !== mapId) return 'mapchanged';
            if (r === 'interrupted') { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.map.id !== mapId) return 'mapchanged'; if (Math.abs(p.tx - nx) + Math.abs(p.ty - ny) > 2) { flung = true; this.say('ledge: caught by the wind, from the start again'); } else again = true; break; }
            again = true; break;
          }
          if (flung) i = 0; if (flung || again) { restarts++; continue; }
          if (p.tx === tx && p.ty === ty && tx === wx && ty === wy) i++;
        }
        return true; }
      case 'bossTalk': { // ['bossTalk', npcId, doneFlag]: a boss the story survives losing to (no game over) - a loss still counts as one, and goes the boss-retry road
        if (G.flag(b)) return true;
        const t = (yield* this.exec(['talk', a])); if (t === 'gameover') return 'gameover'; if (t !== true) return 'bossTalk ' + a + ': ' + t;
        const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover';
        if (G.flag(b)) return true;
        if (this.lastBattle) this.lastBattle.boss = true; return 'gameover'; }
      case 'teacher': { // ['teacher', npcId, doneFlag, tries]: a bout for a class item that can be lost - heal, ask again, up to `tries` times
        const tries = c || 3; const F = G.field;
        for (let i = 0; i < tries; i++) {
          if (G.flag(b)) return true;
          const h = (yield* this.exec(['healhere'])); if (h === 'gameover') return 'gameover';
          const t = (yield* this.exec(['talk', a])); if (t === 'gameover') return 'gameover'; if (t !== true) return 'teacher ' + a + ': ' + t;
          const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover';
          if (G.flag(b)) return true;
          this.say('teacher ' + a + ': lost the bout (' + (i + 1) + '/' + tries + ')'); yield* this.partyCheck();
        }
        return G.flag(b) ? true : 'teacher ' + a + ': not won in ' + tries + ' bouts'; }
      case 'puppet': { // ['puppet', 'RRRRD']: with the strings on a doll (Puppet cast first), walk it one cell per letter, then let go
        const F = G.field; const KEY = { U: 'up', D: 'down', L: 'left', R: 'right' };
        if (!F.puppet) return 'puppet: no doll on the strings';
        for (const ch of String(a)) { const k = KEY[ch]; if (!k) return 'puppet: bad direction ' + ch; if (!F.puppet) break; Input.hold(k, 2); (yield* this.frames(12)); if (F.event || F.textbox.active) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } }
        if (F.puppet) { Input.hold('b', 2); (yield* this.frames(8)); } (yield* this.idle()); return true; }
      case 'walk': { // ['walk', 'URRRD']: one cell per letter, the way pressed - for rooms where every step counts (the mimic stones)
        const F = G.field, p = F.player; const KEY = { U: 'up', D: 'down', L: 'left', R: 'right' }; const DD = { U: DIR.UP, D: DIR.DOWN, L: DIR.LEFT, R: DIR.RIGHT };
        for (let i = 0; i < String(a).length; i++) { const ch = String(a)[i]; const k = KEY[ch]; if (!k) return 'walk: bad direction ' + ch; if (Engine.top !== F) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } if (F.event || F.textbox.active) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } const bx = p.tx, by = p.ty; let moved = false; for (let attempt = 0; attempt < 3 && !moved; attempt++) { if (p.dir !== DD[ch]) { Input.hold(k, 2); (yield* this.frames(5)); } Input.hold(k, 3); let n = 0; while (n++ < 60 && (p.moving || (p.tx === bx && p.ty === by) || F.event || F.textbox.active)) { if (Engine.top !== F) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } if (F.event || F.textbox.active) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; } (yield* this.frames(1)); } moved = !(p.tx === bx && p.ty === by); } if (!moved) return 'walk: blocked at step ' + i + ' (' + ch + ') at ' + bx + ',' + by; (yield* this.frames(2)); }
        (yield* this.idle()); return true; }
      case 'slide': { // ['slide', 'RURDL']: on black ice, press each direction in turn and wait for the slide to stop
        const F = G.field, p = F.player; const KEY = { U: 'up', D: 'down', L: 'left', R: 'right' }; const DD = { U: DIR.UP, D: DIR.DOWN, L: DIR.LEFT, R: DIR.RIGHT }; const m0 = G.map.id;
        for (const ch of String(a)) { const k = KEY[ch]; if (!k) return 'slide: bad direction ' + ch; const bx = p.tx, by = p.ty; p.dir = DD[ch]; Input.hold(k, 3); (yield* this.frames(4)); let still = 0, n = 0, lx = p.tx, ly = p.ty; while (n++ < 900 && still < 8) { if (Engine.top !== F) { const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; still = 0; continue; }   /* a fight on the ice: fought, and the slide goes on from where it was */ (yield* this.frames(1)); if (!p.moving && !F.event && p.tx === lx && p.ty === ly) still++; else { still = 0; lx = p.tx; ly = p.ty; } } if (G.map.id !== m0) break; }   /* a slide is over when the party has stood still a while: between two cells of it there is no such pause */
        (yield* this.idle()); return true; }
      case 'push': { // ['push', objId, dir, n]
        let o = this.findObj(a); if (!o) return 'push: object not found ' + a; const dir = b, n = c || 1;
        const fresh = () => { const f = this.findObj(a); if (f) o = f; return o; };   /* the map may be rebuilt under us (a fireball throws the party back): the object is looked up again */
        for (let i = 0; i < n; i++) { fresh(); const sx = o.x - DX[dir], sy = o.y - DY[dir]; const r = (yield* this.go(sx, sy)); if (r !== true) return 'push ' + a + ' step ' + i + ' stand(' + sx + ',' + sy + '): ' + r; fresh(); const before = [o.x, o.y, o.gone]; let rr = (yield* this.castPsy('Move', dir)); if (rr !== true) return 'push ' + a + ': ' + rr; fresh(); for (let again = 0; again < 3 && o.x === before[0] && o.y === before[1] && !o.gone; again++) { (yield* this.frames(20 + again * 20)); const back = (yield* this.go(sx, sy)); if (back !== true) return 'push ' + a + ' stand(' + sx + ',' + sy + '): ' + back; rr = (yield* this.castPsy('Move', dir)); if (rr !== true) return 'push ' + a + ': ' + rr; fresh(); }   /* a few times more: a fireball or a walker may have stood in the way for a moment */ if (o.x === before[0] && o.y === before[1] && !o.gone) return 'push ' + a + ': did not move at step ' + i; if (o.gone) break; }
        return true; }
      case 'djinni': { const o = G.map.objects.find(o => o.kind === 'djinni' && o.name === a && !o.gone); if (!o) { if (G.party.djinnFound.includes(a)) return true; return 'djinni not found: ' + a; } const r = (yield* this.useAt(o.x, o.y)); if (r !== true) return 'djinni ' + a + ': ' + r; (yield* this.idle()); return G.party.djinnFound.includes(a) ? true : 'djinni ' + a + ': not obtained'; }
      case 'chest': { const ch = (G.map.chests || []).find(ch => ch.x === a && ch.y === b); if (!ch) return true; const r = (yield* this.useAt(a, b)); return r === true ? true : 'chest(' + a + ',' + b + '): ' + r; }
      case 'equip': { if (ITEM_DB[a] && ITEM_DB[a].grants) return this.equipUtility(ITEM_DB[a].grants) ? true : 'equip: no ' + a; if (!G.inventory.has(a)) { if (G.party.members.some(m => Object.values(m.equip || {}).includes(a))) return true; return 'equip: no ' + a + ' in the bag'; } const ok = (yield* this.equipFind(a)); if (!ok) this.say('note: nobody gained from wearing the ' + a); return true; }   // ['equip', item]: whoever gains most from it wears it
      case 'shop': { const r = yield* this.shopBuy(a); return r === 'gameover' ? 'gameover' : true; }   // ['shop', keeperId?]: a named stall keeper when a map has several
      case 'inn': { yield* this.sanctumVisit(); const r = yield* this.innRest(); return r === 'gameover' ? 'gameover' : true; }
      case 'sanctum': { yield* this.sanctumVisit(); return true; }
      case 'expect': { if (/^item:/.test(a)) { const nm = a.slice(5); return (G.inventory.has(nm) || G.party.members.some(m => Object.values(m.equip || {}).includes(nm) || (m.held || []).includes(nm)) || (this._eaten && this._eaten[nm]) || (this._sold && this._sold[nm])) ? true : 'expected item ' + nm; }
        if (!G.flag(a) && G.map && Engine.top === G.field && !G.field.event) { const tr = (G.map.triggers || []).find(t => t.once === a && !(t.cond && !t.cond())); if (tr) { /* the scene waits a few tiles in from the door (Sol Sanctum's threshold): walk onto its trigger */ let best = null; for (let y = tr.y; y < tr.y + tr.h; y++) for (let x = tr.x; x < tr.x + tr.w; x++) { const pth = this.path(x, y); if (pth && (!best || pth.length < best.n)) best = { x, y, n: pth.length }; } if (best) { const g = (yield* this.go(best.x, best.y)); if (g === 'gameover') return 'gameover'; const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; if (G.flag(a)) this.say('walked in to the scene (' + a + ')'); } } }
        if (!G.flag(a)) return 'expected flag ' + a; return true; }   // 'item:Name' checks the bag instead of a flag
      case 'expectMap': { return G.map.id === a ? true : 'expected map ' + a + ' but on ' + G.map.id; }
      case 'expectParty': { const names = G.party.members.map(m => m.name); for (const n of a) if (!names.includes(n)) return 'expected ' + n + ' in party (' + names.join(',') + ')'; return true; }
      case 'note': { this.say('NOTE ' + a); return true; }
      case 'try': { const r = (yield* this.exec(a)); if (r !== true) { if (r === 'gameover') return 'gameover'; this.say('optional step skipped (' + JSON.stringify(a) + '): ' + r); } return true; }
      case 'js': { const r = a(this); return r === undefined ? true : r; }
      case 'unless': { // ['unless', flag, [steps]]: the steps only while the flag is not set (a catch-up for something a run passed by)
        if (G.flag(a)) return true; for (const st of b) { const r = yield* this.exec(st); if (r !== true) return r; } return true; }   /* the flag is looked at once, going in: a block whose boss sets it still finishes its loot */
      case 'boss': { // ['boss', trigger, [foes]]: heal up and fight, but only what this party can actually take
        if (b && !this.canHandle(b)) { this.say('skipping ' + a + ' - ' + b.join(', ') + ' is beyond this party for now'); return true; }
        // patch up with what we carry: a boss lair can be somewhere there is no walking back from (Crossbone Isle
        // is reached by tornado), so an inn trip here would strand the run
        yield* this.fieldHeal();
        const r = yield* this.exec(['trig', a]);
        if (r === true) this.say('fought ' + a + (b ? ' (' + b.join(', ') + ')' : ''));
        return r;
      }
      case 'forge': { const n = yield* this.forgeAll(a); this.say('forge: ' + n + ' pieces made'); return true; }
      case 'gear': { yield* this.gearAll(); return true; }   // everyone wears the best the bag holds
      case 'arena': { const at = a || this.arenaTownHere(); if (!at) return 'arena: not in a town with one'; const av = (yield* this.arenaVisit(at)); return av === 'gameover' ? 'gameover' : true; }   // the quartermaster's shelf judged, the pit worked if it is worth it
      case 'party': { const pr = (yield* this.partyCheck()); return pr === 'gameover' ? 'gameover' : true; }   // the party re-formed if it can do better
      case 'optional': { const r = yield* this.optionalSweep(); return r === 'gameover' ? 'gameover' : true; }
      case 'party': { const r = yield* this.optimiseParty(); return r === 'gameover' ? 'gameover' : true; }
      case 'wheel': { const r = yield* this.playWheel(); return r === 'gameover' ? 'gameover' : true; }
      case 'fountain': { const r = yield* this.playFountain(); return r === 'gameover' ? 'gameover' : true; }
      case 'explore': { // pick up whatever this map offers: chests, what Reveal turns up, and every Djinni on it
        if ((yield* this.openChests()) === 'gameover') return 'gameover';
        if ((yield* this.sweepReveal()) === 'gameover') return 'gameover';
        for (const o of G.map.objects.filter(o => o.kind === 'djinni' && !o.gone)) { if (!this.djinniOk(o)) { this.say('leaving Djinni ' + o.name + ' for later - it would beat this party'); continue; } const r = yield* this.exec(['try', ['djinni', o.name]]); if (r === 'gameover') return 'gameover'; }
        return true; }
      case 'grind': { if (this.allMaxed()) return true; return (yield* this.grind(a || 3)); }
      case 'level': { // ['level', n]: a soft target - only grind when clearly under-levelled (2+ levels short), and never more than ~10 fights per session; the story's own fights do the rest
        if (this.allMaxed()) return true;
        const who = () => (b === 'front' && G.party.active.length ? G.party.active : G.party.members);
        const avg = () => who().reduce((t, m) => t + m.level, 0) / who().length; let guard = 0; const l0 = avg();
        const goal = a - 2; if (avg() >= goal) return true;
        // the further behind the party is, the longer it is allowed to train (a boss usually follows): ~10 fights, +6 per level short beyond two
        // hard ceiling: about fifteen fights. Falling behind is the road's problem to fix, not something to stand
        // in a field and solve - a run that stops to grind for twenty minutes stops being a playthrough.
        const maxCycles = this._bossRetry ? 12 : Math.min(5, Math.ceil((10 + 6 * Math.max(0, goal - avg() - 2)) / 3));   /* after a loss to a boss the ceiling lifts: the fight is the point, and it needs the levels */
        let stallStart = avg(), stallCycles = 0;
        while (avg() < goal && guard++ < maxCycles) { if (performance.now() > this.deadline) return 'paused'; if (++stallCycles >= 8) { if (avg() - stallStart < 0.4) break; stallStart = avg(); stallCycles = 0; } const r = (yield* this.grind(3)); if (r === 'gameover') return 'gameover'; if (r === 'paused') return 'paused'; const cw = yield* this.campIfWeak(); if (cw === 'gameover') return 'gameover'; }
        this.say('leveled ' + l0.toFixed(1) + ' -> ' + avg().toFixed(1) + ' (' + (this.battles || 0) + ' battles so far)'); for (const m of G.party.members) { if (!m.status.down) { m.hp = m.stats().hp; m.pp = m.stats().pp; } } if (avg() < goal) this.say('note: still under level ' + goal + ' (' + avg().toFixed(1) + ') - moving on, the road will provide'); return true; }
      case 'healhere': { // boss prep deep in a place no inn is near: field Psynergy, then a camp rest where we stand
        if (G.party.members.every(m => m.alive)) yield* this.fieldHeal();
        if (G.party.members.some(m => !m.alive || m.hp < m.maxHp() * 0.95 || m.pp < m.maxPp() * 0.6)) this.restInPlace('deep in ' + G.map.id); return true; }
      case 'heal': { // boss prep: everyone healthy (field Psynergy first, the inn if that is not enough) and wearing the best gear the nearest town sells
        if (G.party.members.every(m => m.alive)) yield* this.fieldHeal();
        const hurt = G.party.members.some(m => !m.alive || m.hp < m.maxHp() * 0.95 || m.pp < m.maxPp() * 0.6);
        const town = this.nearestTownId(); const upgrades = town ? (this.shopPlan(town) || { buys: [] }).buys.length : 0;
        if (!hurt && !upgrades) return true;
        const r = yield* this.healTrip(hurt ? 'before the boss' : 'gearing up before the boss'); return r === true || r === 'noroute' ? true : r; }
      default: return 'unknown op ' + op;
    }
  },
  *campIfWeak() { const hurt = () => G.party.members.some(m => (m.status && m.status.down) || m.hp < m.stats().hp * 0.5 || m.pp < m.stats().pp * 0.2); if (!hurt()) return false; if (G.party.members.every(m => m.alive)) { yield* this.fieldHeal(); if (!hurt()) return true; } this.camps = (this.camps || 0) + 1; const r = yield* this.healTrip('worn out while grinding'); return r === 'gameover' ? 'gameover' : true; },
  *grind(n) { this._grinding = true; try { if (G.map.world && G.field.ship) { const lz = this.nearestLanding(); if (lz) { const r = (yield* this.landAt(lz.x, lz.y)); if (r === 'gameover') return 'gameover'; } if (G.field.ship) return 'noland'; }   /* nothing is met from the deck of a flying ship: training is done on foot */ return yield* this.grindWalk(n); } finally { this._grinding = false; } },
  nearestLanding() {
    const F = G.field, M = G.map, p = F.player; if (!M.world) return null;
    const ok = (x, y) => { if (!M.inb(x, y)) return false; const t = M.get(x, y); if (t.water || t.river || t.place || t.solid || t.kind === 'mountain' || !t.enc) return false; return [0, 1, 2, 3].some(d => { const nx = x + DX[d], ny = y + DY[d]; return M.inb(nx, ny) && !M.isSolid(nx, ny) && !M.get(nx, ny).water; }); };
    for (let r = 0; r <= 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; const x = p.tx + dx, y = p.ty + dy; if (ok(x, y)) return { x, y }; }
    return null;
  },
  *grindWalk(n) { // walk back and forth on encounter tiles until n battles have been fought
    if (G.map.world) { const t = (yield* this.grindTravelers(n)); if (t === 'gameover' || t === 'paused') return t; if (t === true) return true; (yield* this.grindWorld(n)); return true; }
    // a town, a tunnel, a cleared shrine: nothing spawns here, so go out to where something does
    const D = G.map.def;
    if (!D.encAt && !(D.enc && D.enc.length) && !(G.map.encounters && G.map.encounters.length)) {
      const out = this.mapRoute(G.map.id, (id) => !!(MAPS[id] && MAPS[id].world));
      if (!out) return 'noenc';
      const r = (yield* this.followRoute(out)); if (r === 'gameover') return 'gameover';
      if (G.map.world) { const t = (yield* this.grindTravelers(n)); if (t === 'gameover' || t === 'paused') return t; if (t === true) return true; (yield* this.grindWorld(n)); return true; }
      return 'noenc';
    }
    const F = G.field; const start = [F.player.tx, F.player.ty]; const b0 = this.battles || 0; let guard = 0;
    while ((this.battles || 0) - b0 < n && guard < 60) { guard++; const dirs = [DIR.LEFT, DIR.RIGHT, DIR.UP, DIR.DOWN]; for (const d of dirs) { const p = F.player; const nx = p.tx + DX[d], ny = p.ty + DY[d]; if (this.blockedNoNpc(nx, ny) || this.isExitTile(nx, ny)) continue; const r = (yield* this.stepTo(nx, ny, d)); if (r === 'interrupted') { if ((yield* this.idle()) === 'gameover') return 'gameover'; if (this.zoneTooHot()) return 'rezone'; if ((yield* this.campIfWeak()) === 'gameover') return 'gameover'; } const back = (yield* this.stepTo(p.tx - DX[d], p.ty - DY[d], R.OPP[d])); if (back === 'interrupted') { if ((yield* this.idle()) === 'gameover') return 'gameover'; if (this.zoneTooHot()) return 'rezone'; if ((yield* this.campIfWeak()) === 'gameover') return 'gameover'; } if ((this.battles || 0) - b0 >= n) break; } }
    (yield* this.go(start[0], start[1])); return true;
  },
  pickGrindZone(zone, isEnc) {
    const F = G.field, M = G.map, p = F.player; const groupsAt = (x, y) => F.ship ? (M.def.seaEncAt ? M.def.seaEncAt(x, y) : (M.def.seaEnc || [])) : (M.def.encAt ? M.def.encAt(x, y) : M.encounters);
    const members = G.party.active.filter(m => m.alive); if (!members.length) return null;
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length, avgHp = members.reduce((a, m) => a + m.stats().hp, 0) / members.length, avgAtk = members.reduce((a, m) => a + m.stats().atk, 0) / members.length;
    const seen = new Map([[p.tx + ',' + p.ty, 0]]); const q = [[p.tx, p.ty, 0]]; let head = 0; const zones = new Map();
    while (head < q.length) { const [x, y, d] = q[head++]; if (isEnc(x, y) && !(this.stuckTiles && this.stuckTiles.has(M.id + ':' + x + ',' + y))) { const z = zone(x, y); if (!zones.has(z)) { const groups = groupsAt(x, y) || []; if (groups.length) { let exp = 0, danger = 0, tough = 0; for (const g of groups) { let ge = 0, ga = 0, gh = 0; for (const n of g) { const e = ENEMY_DB[n]; if (!e) continue; ge += e.exp; ga += Math.max(0, e.atk - avgDef) / 2 * (e.t || 1); gh += e.hp; } exp += ge; danger = Math.max(danger, ga); tough = Math.max(tough, gh); } exp /= groups.length; zones.set(z, { x, y, d, exp, danger, tough }); } } } if (d >= 45) continue; for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k], key = nx + ',' + ny; if (seen.has(key) || this.blockedNoNpc(nx, ny) || this.isExitTile(nx, ny)) continue; seen.set(key, d + 1); q.push([nx, ny, d + 1]); } }
    // safe = a focused member survives ~2.5 rounds (the AI heals) and the party kills a group in ~3 rounds; unsafe zones are never chosen while a safe one exists
    const perRound = members.length * avgAtk / 3; let best = null, fallback = null; const bad = this.badZones || new Set();
    for (const [z, v] of zones) { if (bad.has(z)) continue; const safe = v.danger < avgHp * 0.4 && v.tough < perRound * 3; const score = v.exp / (1 + v.d / 60); if (safe) { if (!best || score > best.score) best = Object.assign({ zone: z, score, safe }, v); } else if (!fallback || v.danger < fallback.danger) fallback = Object.assign({ zone: z, score, safe }, v); }
    return best || fallback;
  },
  *grindTravelers(n, o) { this.trace('grindTravelers'); o = o || {};
    const F = G.field, M = G.map; if (!M.world || F.ship || typeof Travelers === 'undefined' || this.allMaxed()) return false;
    const members = G.party.active.filter(m => m.alive); if (!members.length) return false;
    // once there is a camp, a fight forced on somebody who did not want it is paid for in the party's regard (Reputation):
    // only the willing are asked - the eager, the bandits, those offering a duel - and the mildly put out while it costs nothing
    const rep = typeof Reputation !== 'undefined' && Reputation.on(); const willing = (d) => !rep || d.intent === 'duel' || Reputation.score() + Reputation.weight(d) < Reputation.LEAVE_AT;   /* anyone, as long as nobody walks off over it: a grumble (the warning line) costs nothing, and any gate off the road wipes the slate (the user's rule) - the road refresh goes through one whenever the next fight would cost a member */
    let refreshed = 0;
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length, avgHp = members.reduce((a, m) => a + m.stats().hp, 0) / members.length, avgAtk = members.reduce((a, m) => a + m.stats().atk, 0) / members.length;
    const avgLevel = members.reduce((a, m) => a + m.level, 0) / members.length; const perRound = members.length * avgAtk / 3;
    const zone = (x, y) => M.def.encAt ? JSON.stringify(M.def.encAt(x, y)) : ''; const isEnc = (x, y) => !!M.get(x, y).enc;
    const local = this.pickGrindZone(zone, isEnc); const localExp = local ? local.exp : 0;
    const p = F.player; let fights = 0, tries = 0;
    while (fights < n && tries++ < 8) {
      if (performance.now() > this.deadline) return 'paused';
      const cands = F.npcs.filter(a => a.traveler && a.travelerLeader && !a.traveler.done && !a.hidden).map(a => {
        const d = a.traveler; let exp = 0, danger = 0, tough = 0;
        for (const m of d.members) { const e = ENEMY_DB[m.key]; if (!e) continue; exp += e.exp; danger += Math.max(0, e.atk - avgDef) / 2 * (e.t || 1); tough += e.hp; }
        return { a, d, exp, danger, tough, dist: Math.abs(a.tx - p.tx) + Math.abs(a.ty - p.ty) };
      }).filter(c => c.exp >= localExp && c.danger < avgHp * 0.55 && c.tough < perRound * 6 && c.d.level <= avgLevel + 5 && c.dist <= (o.maxDist || 40) && !c.d._skip && willing(c.d) && this.roadSafe(c.a.tx, c.a.ty))   // the road's people spawn within five levels of the party: they are the training ground, monsters are the fallback
        .sort((u, v) => v.exp / (1 + v.dist / 60) - u.exp / (1 + u.dist / 60));
      if (!cands.length) { if (o.noRefresh || refreshed++ >= 2 || fights >= n) break; const rr = (yield* this.refreshRoad()); if (rr === 'gameover') return 'gameover'; if (!rr) break; continue; }   /* nobody left worth asking: new people on the road (a town's door in and out), twice at most */
      const c = cands[0];
      // walk to a tile beside the leader (they wander, so aim again if they moved), then square up
      let beside = false;
      for (let k = 0; k < 4 && !beside; k++) {
        const spots = [0, 1, 2, 3].map(d => [c.a.tx + DX[d], c.a.ty + DY[d]]).filter(([x, y]) => !this.blockedNoNpc(x, y) && !this.isExitTile(x, y)).sort((u, v) => (Math.abs(u[0] - p.tx) + Math.abs(u[1] - p.ty)) - (Math.abs(v[0] - p.tx) + Math.abs(v[1] - p.ty)));
        if (!spots.length) break;
        const r = (yield* this.go(spots[0][0], spots[0][1])); if (r === 'gameover') return 'gameover'; if (r === 'paused') return 'paused';
        if (c.d.done || !F.npcs.includes(c.a)) break;
        beside = Math.abs(c.a.tx - p.tx) + Math.abs(c.a.ty - p.ty) === 1;
      }
      if (!beside) { c.d._skip = true; continue; }
      const b0 = this.battles || 0; p.dir = F.dirTo(p, c.a);
      this.say('challenging ' + (c.a.name || c.d.label) + ' (L' + c.d.level + ', ~' + c.exp + ' exp vs ~' + localExp.toFixed(0) + ' from monsters here)');
      this._wantFight = true; if (c.d.intent === 'duel') { Input.hold('a', 2); (yield* this.frames(4)); } else F.challenge(); const r = (yield* this.idle()); this._wantFight = false;   /* a duel offered is accepted at the word; anyone else is challenged */
      if (r === 'gameover') return 'gameover';
      if ((this.battles || 0) > b0) fights++; else c.d.done = true;   /* nothing came of it: leave them be */
      if (this.zoneTooHot()) break;
      if ((yield* this.campIfWeak()) === 'gameover') return 'gameover';
    }
    return fights > 0;
  },
  *refreshRoad() {
    const F = G.field, M = G.map, p = F.player; if (!M.world || F.ship) return false;
    let best = null;
    const reach = G.flag('ship_wings') ? 120 : 45;   /* with the wings a gate a way off is minutes away */
    for (const [k, v] of Object.entries(M.def.places || {})) { if (v.cond && !v.cond()) continue; if (!MAPS[v.map] || MAPS[v.map].world || v.map === 'camp') continue; const [x, y] = k.split(',').map(Number); const d = Math.abs(x - p.tx) + Math.abs(y - p.ty); const dd = d + (MAPS[v.map + '_inn'] ? 0 : 10); if (d > reach || (best && dd >= best.dd)) continue; if (d > 0 && d <= 45 && !this.path(x, y, { allowExits: true })) continue; best = { d, dd, map: v.map, x, y }; }   /* any gate reloads the road (a town's first: an inn fades the regard spent); the camp opens elsewhere */
    if (!best) return false;
    const back = [p.tx, p.ty];
    this.say('new faces on the road: through ' + best.map + ' and back');
    const r1 = (yield* this.exec(['world', best.map])); if (r1 === 'gameover') return 'gameover'; if (r1 !== true) return false;
    const r2 = (yield* this.exec(['enter', 'world_tla'])); if (r2 === 'gameover') return 'gameover';
    if (G.map.world && !G.field.ship && Math.abs(G.field.player.tx - back[0]) + Math.abs(G.field.player.ty - back[1]) > 60) { this.say('the road refresh came out far away - back to where the training was'); yield* this.go(back[0], back[1]); }
    return G.map.world;
  },
  *grindWorld(n) { this.trace('grindWorld'); // pace between an encounter tile and a neighbour in the same encounter zone
    const F = G.field, M = G.map, p = F.player; const b0 = this.battles || 0;
    // aboard the ship every water tile is an encounter tile (sea monsters), zoned by seaEncAt
    const zone = (x, y) => F.ship ? (M.def.seaEncAt ? JSON.stringify(M.def.seaEncAt(x, y)) : 'sea') : (M.def.encAt ? JSON.stringify(M.def.encAt(x, y)) : '');
    const isEnc = (x, y) => F.ship ? !!M.get(x, y).water : !!M.get(x, y).enc;
    // pick the encounter zone within walking range that pays the most exp per fight and is safe for this party
    let anchor = null; const pick = this.pickGrindZone(zone, isEnc); if (pick) { if (pick.zone !== zone(p.tx, p.ty) || !isEnc(p.tx, p.ty)) { const r0 = yield* this.go(pick.x, pick.y); if (r0 === 'gameover') return 'gameover'; if (r0 === true) anchor = [pick.x, pick.y]; else if (r0 === 'stuck') (this.stuckTiles = this.stuckTiles || new Set()).add(M.id + ':' + pick.x + ',' + pick.y); /* a crowd in a dead-end pass: never that tile again */ } else anchor = [p.tx, p.ty]; if (anchor && pick.zone !== this._grindZone) { this._grindZone = pick.zone; this.say('grinding in ' + (M.def.regionName ? M.def.regionName(anchor[0], anchor[1]) : M.name) + ' (~' + pick.exp.toFixed(0) + ' exp/fight)'); } }
    if (!anchor && isEnc(p.tx, p.ty)) anchor = [p.tx, p.ty];
    if (!anchor) { const seen = new Set([p.tx + ',' + p.ty]); const q = [[p.tx, p.ty]]; let head = 0; while (head < q.length && !anchor) { const [x, y] = q[head++]; if (isEnc(x, y) && !(x === p.tx && y === p.ty)) { anchor = [x, y]; break; } for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d], k = nx + ',' + ny; if (seen.has(k) || this.blockedNoNpc(nx, ny) || this.isExitTile(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } } if (!anchor) return false; const r0 = (yield* this.go(anchor[0], anchor[1])); if (r0 === 'gameover') return 'gameover'; }
    const az = zone(anchor[0], anchor[1]); let dir = -1;
    for (let d = 0; d < 4; d++) { const nx = anchor[0] + DX[d], ny = anchor[1] + DY[d]; if (this.blockedNoNpc(nx, ny) || this.isExitTile(nx, ny) || !isEnc(nx, ny) || zone(nx, ny) !== az) continue; dir = d; break; }
    if (dir < 0) return false;
    let guard = 0;
    while ((this.battles || 0) - b0 < n && guard++ < 150) {
      if (performance.now() > this.deadline) return 'paused';
      if (F.player.tx !== anchor[0] || F.player.ty !== anchor[1]) { const rr = (yield* this.go(anchor[0], anchor[1])); if (rr === 'gameover') return 'gameover'; if (rr !== true) return false; continue; }
      const r = (yield* this.stepTo(anchor[0] + DX[dir], anchor[1] + DY[dir], dir)); if (r === 'interrupted') { if ((yield* this.idle()) === 'gameover') return 'gameover'; if (this.zoneTooHot()) return 'rezone'; if ((yield* this.campIfWeak()) === 'gameover') return 'gameover'; }
      const back = (yield* this.stepTo(anchor[0], anchor[1], R.OPP[dir])); if (back === 'interrupted') { if ((yield* this.idle()) === 'gameover') return 'gameover'; if (this.zoneTooHot()) return 'rezone'; if ((yield* this.campIfWeak()) === 'gameover') return 'gameover'; }
    }
    return true;
  },
  zoneSafeAt(x, y, loose) {   // loose: ground to cross, not to train on
    const M = G.map, F = G.field; if (!M.world) return true; const groups = (F.ship ? (M.def.seaEncAt ? M.def.seaEncAt(x, y) : M.def.seaEnc) : (M.def.encAt ? M.def.encAt(x, y) : M.encounters)) || []; if (!groups.length) return true;
    const members = G.party.active.filter(m => m.alive); if (!members.length) return false;
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length, avgHp = members.reduce((a, m) => a + m.stats().hp, 0) / members.length, avgAtk = members.reduce((a, m) => a + m.stats().atk, 0) / members.length;
    const perRound = members.length * avgAtk / 3; let danger = 0, tough = 0;
    for (const g of groups) { let gd = 0, gt = 0; for (const k of g) { const e = ENEMY_DB[k]; if (!e) continue; gd += Math.max(0, e.atk - avgDef) / 2 * (e.t || 1); gt += e.hp; } danger = Math.max(danger, gd); tough = Math.max(tough, gt); }
    return loose ? (danger < avgHp * 0.6 && tough < perRound * 6) : (danger < avgHp * 0.4 && tough < perRound * 3);
  },
  // the best training ground the party can reach and survive, by experience per fight (the deep places: Anemos, the Islet
  // Cave, the Mars Lighthouse); worth the trip when it pays several times what the nearest field does
  bestGrindMap() {
    if (!G.flag('ship_wings') && !G.flag('hasShip')) return null;
    const members = G.party.active.filter(m => m.alive); if (!members.length) return null;
    const avgDef = members.reduce((a, m) => a + m.stats().def, 0) / members.length, avgHp = members.reduce((a, m) => a + m.stats().hp, 0) / members.length, avgAtk = members.reduce((a, m) => a + m.stats().atk, 0) / members.length; const perRound = members.length * avgAtk / 3;
    let best = null;
    for (const id of ['anemos_observatory', 'islet_corridor_1', 'ml_vstairs', 'mr_mimic', 'treasure_isle_1', 'yampi_cave_1']) {
      const d = MAPS[id]; if (!d || !d.enc || !d.enc.length || (this.badZones && this.badZones.has(JSON.stringify(d.enc)))) continue;
      let exp = 0, danger = 0, tough = 0; for (const g of d.enc) { let ge = 0, ga = 0, gh = 0; for (const n of g) { const e = ENEMY_DB[n]; if (!e) continue; ge += e.exp; ga += Math.max(0, e.atk - avgDef) / 2 * (e.t || 1); gh += e.hp; } exp += ge; danger = Math.max(danger, ga); tough = Math.max(tough, gh); } exp /= d.enc.length;
      if (!(danger < avgHp * 0.5 && tough < perRound * 4)) continue;   /* a shade looser than the field's rule: this party heals, and the fight it trains for is worse */
      if (!this.mapRoute('world_tla', (m) => m === id)) continue;
      if (!best || exp > best.exp) best = { id, exp };
    }
    return best;
  },
  // the smith before the training ground: raw material in the bag is gear the party is not wearing (Sky Dragons drop
  // Orihalcon on the way; a piece from it beats anything bought). Up to a dozen pieces a trip.
  // worth a detour to Yallam: any of the great materials or a rusty weapon, or a few pieces of anything - once the party has
  // the ship; and not again straight after a trip that could not get there
  forgeWorth() {
    if (this._inForge || typeof Forge === 'undefined' || !MAPS.yallam_forge || !G.flag('hasShip') || G.mapId === 'yallam_forge') return false;
    if (this._forgeFailAt !== undefined && this.pc - this._forgeFailAt < 40) return false;
    if (G.get('forge_order')) return true;
    const held = Forge.held(); if (!held.length) return false;
    const big = ['Orihalcon', 'Dark Matter', 'Golem Core', 'Mythril Silver', 'Dragon Skin', 'Salamander Tail', 'Sylph Feather', 'Star Dust', 'Tear Stone'];
    const pieces = held.reduce((t, m) => t + G.inventory.count(m), 0);
    return pieces >= 3 || held.some(m => big.includes(m) || /^Rusty/.test(m));
  },
  // ---- the Battle Arena (the user's rule): if the quartermaster's shelf holds something worth having - gear that
  // beats what somebody wears, a second class item the planner would use, a permanent boost - the pit is worked for
  // the Battle Points and it is bought; if not, the runner moves on (never waiting for the shelf to change)
  arenaTownHere() { const id = G.map.id; if (typeof ARENA === 'undefined' || !ARENA.towns) return null; if (ARENA.towns.includes(id)) return id; const m = id.match(/^arena_([a-z_0-9]+)$/); if (m && ARENA.towns.includes(m[1])) return m[1]; const t = this.townOf(id); return ARENA.towns.includes(t) ? t : null; },
  // what on the shelf is worth Battle Points, and how much it is worth to us
  arenaWants() {
    if (typeof ARENA === 'undefined') return []; const out = []; const val = (n, slot) => slot === 'weapon' ? (ITEM_DB[n].atk || 0) : (ITEM_DB[n].def || 0);
    for (const it of ARENA.stock()) {
      if (it.sold) continue; const item = ITEM_DB[it.id]; if (!item) continue;
      if (it.kind === 'class') {   // a second copy: only if the planner would put both to use
        G.inventory.add(it.id, 1); let gain = 0; try { const b = this.buildBestParty(); gain = b ? b.score - Math.round(this.partyScore()) : 0; } catch (e) { gain = 0; } G.inventory.remove(it.id, 1);
        if (gain > 150) out.push({ it, why: 'a second ' + it.id + ' (+' + gain + ' to the party)', worth: gain / it.bp }); continue;
      }
      if (this.STAT_ITEMS[it.id]) { out.push({ it, why: it.id + ' (permanent)', worth: 40 / it.bp }); continue; }
      if (item.use) { const cap = { 'Water of Life': 3, 'Psy Crystal': 3, 'Potion': 3, 'Mist Potion': 2, 'Lucky Medal': 2 }[it.id]; if (cap && G.inventory.count(it.id) < cap && ARENA.bp() >= it.bp) out.push({ it, why: it.id, worth: 0.1, noGrind: true }); continue; }
      const slot = G.party.members[0].slotFor(it.id); if (!slot || item.cursed) continue;
      let best = 0; for (const m of G.party.members) { if (!m.canEquip(it.id) || m.slotFor(it.id) !== slot) continue; const cur = m.equip[slot]; if (cur && ITEM_DB[cur] && ITEM_DB[cur].classItem) continue; const g = val(it.id, slot) - (cur ? val(cur, slot) : 0); if (g > best) best = g; }
      if (best >= 6) out.push({ it, why: it.id + ' (+' + best + ' for somebody)', worth: best / it.bp });
    }
    return out.sort((a, b) => b.worth - a.worth);
  },
  *arenaVisit(town) {
    if (typeof ARENA === 'undefined' || !MAPS['arena_' + town]) return true;
    const rot = ARENA.rotation(); if (this._arenaRot === rot && this._arenaRotTown === town) return true;   /* this shelf was judged already */
    let wants = this.arenaWants(); this._arenaRot = rot; this._arenaRotTown = town;
    if (!wants.length) { this.say('arena: nothing on the shelf worth the pit (' + ARENA.minutesLeft() + ' min to the next)'); return true; }
    this.say('arena: worth buying - ' + wants.slice(0, 3).map(w => w.why).join('; '));
    const fromMap = G.map.id, fx = G.field.player.tx, fy = G.field.player.ty;
    const r0 = (yield* this.exec(['enter', 'arena_' + town])); if (r0 === 'gameover') return 'gameover'; if (r0 !== true || G.map.id !== 'arena_' + town) { this.say('arena: could not get in (' + r0 + ')'); return true; }
    let fights = 0, losses = 0;
    for (let guard = 0; guard < 20; guard++) {
      wants = this.arenaWants(); if (!wants.length) break;
      const affordable = wants.filter(w => ARENA.bp() >= w.it.bp);
      if (affordable.length) { const w = affordable[0]; const n = this.findNpc('quartermaster'); if (n) { const adj = this.adjacentReachable(n.tx, n.ty); if (adj) { const g = (yield* this.go(adj.x, adj.y)); if (g === 'gameover') return 'gameover'; yield* this.face(adj.face); } } ARENA.buy(w.it); this.say('arena: bought ' + w.it.id + ' for ' + w.it.bp + ' BP (' + ARENA.bp() + ' left)'); Audio.sfx('shop'); if (this.STAT_ITEMS[w.it.id]) yield* this.useStatItems(); else if (!ITEM_DB[w.it.id].classItem && !ITEM_DB[w.it.id].use) yield* this.equipFind(w.it.id); continue; }
      const target = wants.find(w => !w.noGrind); if (!target) break;
      if (ARENA.rotation() !== rot) { this.say('arena: the shelf changed - judging it again'); this._arenaRot = null; break; }
      if (fights >= 12 || losses >= 1) { this.say('arena: enough of the pit for now (' + fights + ' bouts, ' + ARENA.bp() + ' BP)'); break; }   /* a loss says the pit is beyond this party today */
      // a bout for the points: the four strongest, no reserve - and only when they are of a level with each other (the rivals match the best of them)
      const four = G.party.members.filter(m => m.alive).sort((a, b) => b.level - a.level).slice(0, 4); if (four.length < 4) { this.say('arena: not four on their feet for the pit'); break; } if (four[0].level - four[3].level > 3) { this.say('arena: not ready for the pit (' + four[0].name + ' L' + four[0].level + ' would set the rivals against ' + four[3].name + ' L' + four[3].level + ')'); break; }
      ARENA.autoPick = four.map(m => m.id);
      const bp0 = ARENA.bp(); this._wantFight = true; const t = (yield* this.exec(['talk', 'pit_master'])); this._wantFight = false; ARENA.autoPick = null; if (t === 'gameover') return 'gameover'; if (t !== true) { this.say('arena: the pit master would not talk (' + t + ')'); break; }
      const ir = (yield* this.idle()); if (ir === 'gameover') return 'gameover'; fights++;
      if (ARENA.bp() > bp0) this.say('arena: bout ' + fights + ' won, ' + ARENA.bp() + ' BP (need ' + target.it.bp + ' for ' + target.it.id + ')'); else { losses++; this.say('arena: bout ' + fights + ' lost'); }
      yield* this.partyCheck();
    }
    const back = (yield* this.exec(['enter', town])); if (back === 'gameover') return 'gameover';
    if (fromMap !== town && G.map.id !== fromMap) { const rb = (yield* this.exec(['enter', fromMap])); if (rb === 'gameover') return 'gameover'; if (rb === true && fromMap === G.map.id) { const rg = (yield* this.go(fx, fy)); if (rg === 'gameover') return 'gameover'; } }   /* back where the visit began (the inn's room, when the rest there brought it on): the plan goes on from there */
    return true;
  },
  *forgeTrip() {
    if (typeof Forge === 'undefined' || !MAPS.yallam_forge || !G.flag('hasShip')) return true;
    const held = Forge.held(); if (!held.length && !G.get('forge_order')) return true;
    this._forgeTripAt = this.pc; this._inForge = true;
    this.say('forge trip: ' + held.map(m => m + ' x' + G.inventory.count(m)).join(', '));
    let r; try { r = (yield* this.exec(['forge', 60])); } finally { this._inForge = false; } if (r === 'gameover') return 'gameover';
    if (G.mapId !== 'yallam_forge' && G.mapId !== 'yallam' && Forge.held().length) this._forgeFailAt = this.pc;   /* could not get there: not again for a while */
    return true;
  },
  *grindTrip() {
    const fg = (yield* this.forgeTrip()); if (fg === 'gameover') return 'gameover';
    if (this.allMaxed()) return true;
    if (typeof Travelers !== 'undefined') {   /* the level op asks the road's people first - on either world map (Golden Sun's road has its travelers too) */
      const worldId = (G.game === 2 && MAPS.world_tla) ? 'world_tla' : 'world_gs1';
      if (!G.map.world && G.map.def.retreat && G.party.active.some(m => m.alive && m.hasPsy('Retreat') && m.pp >= PSY.Retreat.pp)) { const rr = yield* this.castPsy('Retreat'); if (rr === 'gameover') return 'gameover'; }   /* out of the dungeon the quick way */
      if (!G.map.world) { const out = (yield* this.exec(['enter', worldId])); if (out === 'gameover') return 'gameover'; }
      if (G.map.world) { this.say('training on the road: its people pay best'); return true; }
    }
    const spot = this.bestGrindMap(); if (!spot || spot.exp < 1500 || G.map.id === spot.id) return true;
    this.say('training ground: ' + spot.id + ' (~' + Math.round(spot.exp) + ' exp/fight)');
    const r = (yield* this.exec(['enter', spot.id])); if (r === 'gameover') return 'gameover'; if (r !== true) this.say('could not reach ' + spot.id + ' (' + r + ') - training here instead');
    return true;
  },
  zoneTooHot() { const rough = G.party.active.some(m => !m.alive || m.hp < m.maxHp() * 0.4); this._roughFights = rough ? (this._roughFights || 0) + 1 : 0; if (this._roughFights >= 2 && this._grindZone) { (this.badZones = this.badZones || new Set()).add(this._grindZone); this.say('grind zone too dangerous - moving to a safer one'); this._grindZone = null; this._roughFights = 0; return true; } return false; },
  *main(budgetMs) {
    const t0 = performance.now(); this.installBattleAI(); this.stopped = false; this._execDepth = 0;   /* a run abandoned mid-step (stopRealtime) leaves the nesting count where it was */ this.deadline = budgetMs === Infinity ? Infinity : t0 + (budgetMs || 30000); this._frameBudget = 400000;
    while (this.pc < this.plan.length && (budgetMs === Infinity || performance.now() - t0 < (budgetMs || 30000))) {
      const step = this.plan[this.pc]; let r; this._frameBudget = 400000; // the watchdog budget is per step
      this._badLinks = null; this._badPasses = null;   /* a door or a pass found no good is no good for this step's routing only: from somewhere else it may be the way */
      try { r = yield* this.exec(step); } catch (e) { r = 'EXCEPTION ' + e.message + ' | ' + (e.stack || '').split('\n').slice(0, 3).join(' | '); }
      if (r === 'paused') { this.say('paused mid-step (time budget)'); break; }
      if (typeof r === 'string' && /gameover/.test(r)) r = 'gameover';
      if (Engine.top && Engine.top.constructor.name === 'GameOverScene') r = 'gameover';
      if (r === 'gameover') {
        if (this._grindZone && (step[0] === 'level' || step[0] === 'grind')) { (this.badZones = this.badZones || new Set()).add(this._grindZone); this.say('grind zone marked unsafe after that loss'); this._grindZone = null; }
        const lb = this.lastBattle || {}; this.issue('battle-lost', 'Lost to ' + (lb.enemies || []).join('+') + ' on turn ' + lb.turn + ' (party ' + this.status().party.join(',') + ')');
        this._retries = (this._retries || 0) + 1; const bossLoss = !!(lb.boss); const lossKey = this.pc + ':' + (lb.enemies || []).join('+'); this._lossCount = this._lossCount || {}; const losses = (this._lossCount[lossKey] = (this._lossCount[lossKey] || 0) + 1);   /* losses to this boss, counted across the steps replayed from the checkpoint (a successful step resets _retries, not this) */ if (bossLoss) this._retries = losses; if (this._retries > (bossLoss ? 8 : 4)) { this.stopped = true; this.issue('battle-lost', 'giving up after ' + (this._retries - 1) + ' retries'); break; }
        if (this.opts.grindOnLoss && this.lastCkpt && !this._retrying) { this._retrying = true; if (!this.restore(this.lastCkpt.label)) this.restore(); this.say('retrying from checkpoint after leveling up');   /* the checkpoint this run last wrote (or was rewound to) - not whatever the browser's storage saw last */ this.sanctumRevive(); for (const m of G.party.members) { m.hp = m.stats().hp; m.pp = m.stats().pp; } { if (bossLoss) { const pc0 = (yield* this.partyCheck()); if (pc0 === 'gameover') { this.stopped = true; break; } const fr = G.party.active.filter(m => m.alive); const top = Math.round(fr.reduce((t, m) => t + m.level, 0) / Math.max(1, fr.length)); this._bossRetry = true; const trip = (yield* this.grindTrip()); if (trip === 'gameover') { this.stopped = true; break; } const lr = (yield* this.exec(['level', Math.min(typeof MAX_LEVEL !== 'undefined' ? MAX_LEVEL : 99, top + 2 + 2 * Math.min(4, this._retries)), 'front']));   /* two levels more with every loss: a guardian with ten thousand HP is not a matter of one */ this._bossRetry = false; if (lr === 'gameover') { this.stopped = true; break; } yield* this.gearAll(); this.checkpointMerge(this.lastCkpt.label); } else { const g = (yield* this.grind(6 * Math.min(4, this._retries || 1))); this.checkpointMerge(this.lastCkpt.label); } }   /* a boss that beat us: level up (further with each loss) before going back; anything else: a few fights */ { const lbl = this.lastCkpt.label; if (this.restore(lbl)) this.say('back at ' + lbl + ' with the training kept'); }   /* the training took the party wherever the fights were: the plan goes on from the checkpoint's own spot, with the levels and gear it earned (the merged checkpoint) */ this.sanctumRevive(); for (const m of G.party.members) { m.hp = m.stats().hp; m.pp = m.stats().pp; } continue; }
        this._retrying = false; this.stopped = true; break;
      }
      if (r !== true) { this.issue('step-failed', String(r)); this._failRun = (this._failRun || 0) + 1; if (!this.opts.continueOnFail || this._failRun > (this.opts.maxFailRun || 4) || /^expect/.test(String(r))) { this.stopped = true; break; } this.say('skipping the failed step and going on'); this.pc++; continue; }   // a playthrough keeps going past a failed step (a few in a row, and never a failed story check - that is a run off the rails); a test stops to be looked at
      this._failRun = 0;
      this._retrying = false; this._retries = 0; this.pc++;
    }
    const s = this.status();
    return { pc: this.pc, of: this.plan.length, done: this.pc >= this.plan.length, stopped: this.stopped, status: s, issues: this.issues.slice(-3), shots: this.shotsTaken, battles: this.battles || 0, log: this.log.slice(-12) };
  },
  run(budgetMs) {
    const gen = this.main(budgetMs); this.rt = null;
    for (;;) { const r = gen.next(); if (r.done) return r.value; Engine.step(); this._drawTick = (this._drawTick || 0) + 1; if (this._drawTick % 20 === 0) Engine.draw(); }
  },
  runRealtime(o) {
    this.installBattleAI(); this.aiPaused = false; G.debugAuto = true; if (!(o && o.keepSettings)) this.opts.readDelay = 6; this.opts.continueOnFail = true;
    if (typeof Settings !== 'undefined' && !(o && o.keepSettings)) { Settings.data.textSpeed = 3; Settings.save(); }   // the runner reads at Instant
    const gen = this.main(Infinity); const self = this;
    this.rt = { gen, done: false, result: null, startedAt: Date.now() };
    Engine.afterStep = () => { const rt = self.rt; if (!rt || rt.done) return; let r; try { r = rt.gen.next(); } catch (e) { rt.done = true; rt.error = e.message + ' | ' + (e.stack || '').split(String.fromCharCode(10)).slice(0, 2).join(' | '); Engine.afterStep = null; self.progress(); return; } if (r.done) { rt.done = true; rt.result = r.value; Engine.afterStep = null; self.progress(); } else if (Engine.frame % 1800 === 0) self.progress(); };
    return 'real-time run started (' + this.plan.length + ' steps)';
  },
  stopRealtime() { Engine.afterStep = null; if (this.rt) this.rt.done = true; },
  progress() { if (this.opts.noUpload) return; const rt = this.rt || {}; const body = JSON.stringify({ at: new Date().toISOString(), elapsedMin: rt.startedAt ? Math.round((Date.now() - rt.startedAt) / 60000) : 0, pc: this.pc, of: this.plan.length, done: !!rt.done, error: rt.error || null, result: rt.result ? { stopped: rt.result.stopped, done: rt.result.done } : null, status: this.status(), battles: this.battles || 0, issues: this.issues.length, lastIssue: this.issues[this.issues.length - 1] || null, log: this.log.slice(-8) }); try { fetch('/log?name=progress.json', { method: 'POST', body }); } catch (e) { } },
  report() { const txt = JSON.stringify({ pc: this.pc, of: this.plan.length, status: this.status(), issues: this.issues, battles: this.battles, log: this.log }, null, 1); if (!this.opts.noUpload) fetch('/log?name=report.json', { method: 'POST', body: txt }); return this.issues; },
  _aiInstalled: false,
  rt: null,
  deadline: 0,
  _frameBudget: 0,
  lastCkpt: null,
  _retrying: false,
  _retries: 0,
  _eqSig: '',
  _mapAtStep: null,
  _lastTop: '',
  _lastStep: null,
  battles: 0,
  lastBattle: null,
  _stallTurn: 0,
  _stallMsg: '',
  _stallN: 0,
  _looted: null,
  _touring: false,
  _wantFight: false,
  _roughFights: 0,
  _grindZone: null,
  roadSafe(tx, ty) {
    const steps = this.path(tx, ty); if (!steps) return false; const M = G.map; const zone = (x, y) => M.def.encAt ? JSON.stringify(M.def.encAt(x, y)) : ''; const cache = new Map(); let hot = 0;
    for (const [x, y] of steps) { const z = zone(x, y); if (!cache.has(z)) cache.set(z, this.zoneSafeAt(x, y, true)); if (!cache.get(z)) hot++; }
    return hot <= 8;
  },
  camps: 0,
  standSpots(x, y) {
    const across = (dx, dy) => { const o = G.map.getObj(x + dx, y + dy); return o && (o.name === 'counter' || o.name === 'bars' || o.kind === 'fence') ? 2 : 1; };
    return [[0, 1, DIR.UP], [0, -1, DIR.DOWN], [1, 0, DIR.LEFT], [-1, 0, DIR.RIGHT]].map(([dx, dy, face]) => { const k = across(dx, dy); const ax = x + dx * k, ay = y + dy * k; if (this.blockedNoNpc(ax, ay) || this.updraftAt(ax, ay) || (this.isExitTile(ax, ay) && !(ax === G.field.player.tx && ay === G.field.player.ty)) || (G.map.inb(ax, ay) && G.map.get(ax, ay).hole) || G.field.npcs.some(n => !n.hidden && n.tx === ax && n.ty === ay)) return null;   /* never stand on a drop to reach a thing */ const p = G.field.player; if (ax === p.tx && ay === p.ty) return { x: ax, y: ay, face, dist: 0 }; const pth = this.path(ax, ay); return pth ? { x: ax, y: ay, face, dist: pth.length } : null; }).filter(Boolean).sort((a, b) => a.dist - b.dist);
  },
  badZones: null,   // a Set of the world zones a grind went badly in (made when first needed)
};
