// ---------- Cutscene / event script runner ----------
// Scripts are generator functions: function*(E) { yield E.say('...'); ... }
'use strict';
class EventContext {
  constructor(field) { this.field = field; this.textbox = field.textbox; }
  // ---- dialogue ----
  // Alex has a theme of his own (the Tunnel Ruins): it comes in when he speaks and the scene's music returns when the
  // scene ends (FieldScene.update), unless the scene has moved the music on itself
  say(text, name, opts) { if (name === 'Alex' && Audio.playing !== 'tunnel' && this.field.event) { this.field.alexMusicWas = Audio.playing || (this.field.map && this.field.map.music) || null; Audio.play('tunnel'); } return this.textbox.show(text, name, opts); }
  *ask(text, name, choices) { const c = this.textbox.show(text, name, { choice: choices || ['Yes', 'No'] }); yield c; return this.textbox.result; }
  *yesno(text, name) { const r = yield* this.ask(text, name, ['Yes', 'No']); return r === 0; }
  // ---- timing/visual ----
  wait(f) { return f; }
  fadeOut(f) { return Engine.fadeOut(f || 20); }
  fadeIn(f) { return Engine.fadeIn(f || 20); }
  shake(n) { Engine.doShake(n || 16); return n || 16; }
  // glide the camera onto a tile (E.pan) / back onto the player (E.panBack); yields the frames the glide takes
  pan(x, y, f) { this.field.camFocus = { x, y }; this.field.camEase = true; return f || 30; }
  panBack(f) { this.field.camFocus = null; this.field.camEase = true; return f || 30; }
  flash(n, col) { Engine.doFlash(n || 8, col); return 2; }
  music(name) { Audio.play(name); return 0; }
  stopMusic() { Audio.stop(); return 0; }
  sfx(name) { Audio.sfx(name); return 0; }
  // ---- actors ----
  actor(who) { return this.field.findActor(who); }
  face(who, dir) { const a = this.actor(who); if (a) a.dir = dir; return 0; }
  faceEach(a, b) { const A = this.actor(a), B = this.actor(b); if (A && B) { A.dir = this.field.dirTo(A, B); B.dir = this.field.dirTo(B, A); } return 0; }
  lookAt(who, target) { const A = this.actor(who), B = this.actor(target); if (A && B) A.dir = this.field.dirTo(A, B); return 0; }
  // walk an actor n steps in dir (returns condition)
  move(who, dir, steps, speed) { const a = this.actor(who); if (!a) return 0; a.dir = dir; a.path = []; for (let i = 0; i < steps; i++) a.path.push(dir); a.pathSpeed = speed || 1; a.ignoreSolid = true; return () => !a.path.length && !a.moving; }
  // walk to tile (simple L path)
  // Walk an actor to a tile during a scene. This used to lay down a bare L-shaped path with solids switched off, which
  // is how Isaac's mother came to stroll through the wall of her own house. Now it finds a way round; only if there is
  // genuinely no route does it fall back to the old straight line, so a scripted scene can never deadlock.
  walkTo(who, x, y, speed) {
    const a = this.actor(who); if (!a) return 0;
    a.path = []; a.pathSpeed = speed || 1;
    let route = this.routeFor(a, x, y), near = false;
    if (!route) { route = this.routeFor(a, x, y, true); near = !!route; }   // as close as the ground allows
    EventContext.lastWalk = { who: (a.id || who), from: [a.tx, a.ty], to: [x, y], round: !!route, near, len: route ? route.length : 0 };
    if (route) { a.path = route; a.ignoreSolid = false; }
    else {
      const dx = x - a.tx, dy = y - a.ty;
      for (let i = 0; i < Math.abs(dx); i++) a.path.push(dx > 0 ? DIR.RIGHT : DIR.LEFT);
      for (let i = 0; i < Math.abs(dy); i++) a.path.push(dy > 0 ? DIR.DOWN : DIR.UP);
      a.ignoreSolid = true;
    }
    return () => !a.path.length && !a.moving;
  }
  // breadth-first walk around whatever is in the way; the goal tile itself is allowed to be occupied
  routeFor(a, tx, ty, nearest) {
    const F = this.field, M = G.map; if (!M) return null;
    if (a.tx === tx && a.ty === ty) return [];
    const k = (x, y) => x + ',' + y;
    const prev = new Map([[k(a.tx, a.ty), null]]); const q = [[a.tx, a.ty]]; let head = 0;
    const build = (key) => { const out = []; let cur = key; while (prev.get(cur)) { const [px, py, pd] = prev.get(cur); out.push(pd); cur = k(px, py); } return out.reverse(); };
    let best = null, bestD = Infinity;
    while (head < q.length) {
      const [cx, cy] = q[head++];
      for (let d = 0; d < 4; d++) {
        const nx = cx + DX[d], ny = cy + DY[d], key = k(nx, ny);
        if (prev.has(key) || !M.inb(nx, ny)) continue;
        const goal = nx === tx && ny === ty;
        if (!goal && F.blocked(nx, ny, a)) continue;
        prev.set(key, [cx, cy, d]);
        if (goal) return build(key);
        const dist = Math.abs(nx - tx) + Math.abs(ny - ty);
        if (dist < bestD) { bestD = dist; best = key; }
        q.push([nx, ny]);
      }
      if (prev.size > 1200) break;
    }
    return nearest && best ? build(best) : null;
  }
  teleportActor(who, x, y, dir) { const a = this.actor(who); if (a) { a.tx = x; a.ty = y; a.px = x * TILE; a.py = y * TILE; a.moving = false; a.path = []; if (dir !== undefined) a.dir = dir; } return 0; }
  hide(who) { const a = this.actor(who); if (a) a.hidden = true; return 0; }
  show(who) { const a = this.actor(who); if (a) a.hidden = false; return 0; }
  spawn(id, x, y, opts) { return this.field.spawnNpc(id, x, y, opts); }
  despawn(id) { this.field.removeNpc(id); return 0; }
  // a foe shown on the field before it is fought: an actor drawn with the monster's own (scaled) battle sprite
  foe(id, name, x, y, opts) { opts = opts || {}; if (opts.foeScale && typeof Foes !== 'undefined') { const src = Foes.sprite(name, 0); if (src) opts.foeScale = opts.foeScale * (src.width > 48 ? 40 / src.width : 24 / src.width); }   /* foeScale here is relative to the field's usual size for that monster (1 = as usual, 1.3 = a big one) */ return this.spawn(id, x, y, Object.assign({ foe: name, name, dir: DIR.DOWN, solid: true }, opts)); }
  // a fight that would otherwise come out of nowhere shows its foes first: each appears on a free cell beside the party
  // (the one faced, then round about), a beat or a line, then the battle; they are gone from the field after it.
  // opts: at [[x,y],...] for set places instead, scale (sprite size), say (a line while they stand there), sfx
  *ambush(foes, battleOpts, opts) {
    opts = opts || {}; const F = this.field, p = F.player, M = F.map; const ft = F.facingTile(); const taken = [];
    const cand = [[ft.x, ft.y]]; for (const r of [1, 2]) for (const d of [0, 1, 2, 3]) cand.push([p.tx + r * DX[d], p.ty + r * DY[d]]);
    const free = (x, y) => M.inb(x, y) && !M.isSolid(x, y) && !(x === p.tx && y === p.ty) && !F.npcs.some(n => !n.hidden && n.tx === x && n.ty === y) && !taken.some(c => c[0] === x && c[1] === y);
    const ids = []; foes.forEach((name, i) => { const c = (opts.at && opts.at[i]) || cand.find(([x, y]) => free(x, y)) || [ft.x, ft.y]; taken.push(c); const id = '__ambush' + i; this.foe(id, name, c[0], c[1], { foeScale: opts.scale }); ids.push(id); });
    Audio.sfx(opts.sfx || 'jump'); yield 12; if (opts.say) yield this.say(opts.say); else yield 20;
    const r = yield* this.battle(foes, battleOpts); for (const id of ids) this.despawn(id); return r;
  }
  emote(who, kind) { const a = this.actor(who); if (a) { a.emote = kind; a.emoteT = 40; } return 30; }
  jump(who) { const a = this.actor(who); if (a) { a.jumpT = 16; } Audio.sfx('jump'); return 18; }
  // party followers gather behind player
  gather() { this.field.gatherFollowers(); return 0; }
  setFollowers(show) { this.field.showFollowers = show; return 0; }
  // ---- game state ----
  flag(k) { return G.flag(k); }
  set(k, v) { G.set(k, v); this.field.refreshNpcs(); return 0; }
  give(item, qty) { G.inventory.add(item, qty || 1); Audio.sfx('item'); return this.textbox.show('Received ' + (qty > 1 ? qty + ' ' : '') + item + '!', null); }
  giveSilent(item, qty) { G.inventory.add(item, qty || 1); return 0; }
  take(item, qty) { G.inventory.remove(item, qty || 1); return 0; }
  has(item) { return G.inventory.has(item); }
  coins(n) { G.party.coins += n; Audio.sfx('item'); return this.textbox.show('Received ' + n + ' coins!'); }
  heal() { G.party.fullRestore(); Audio.sfx('heal'); return 0; }
  join(id, level, opts) { opts = opts || {}; if (!G.party.get(id)) { const avg = G.party.members.length ? Math.round(G.party.members.reduce((t, m) => t + m.level, 0) / G.party.members.length) : 0; const c = new Character(id, Math.max(level || 1, avg - 1)); if (opts.djinn) for (const d of opts.djinn) { c.setDjinn(d); G.party.djinnFound.push(d); } if (opts.equip) for (const [s, it] of Object.entries(opts.equip)) c.equip[s] = it; if (opts.extraPsy) for (const p of opts.extraPsy) c.learnExtra(p); G.party.add(c); } this.field.rebuildFollowers(); this.field.refreshNpcs(); Audio.sfx('join'); return this.textbox.show(CHARACTERS[id].name + ' joined the party!'); }
  leave(id) { G.party.remove(id); this.field.rebuildFollowers(); return 0; }
  learn(id, psy) { const c = G.party.get(id); if (c) c.learnExtra(psy); Audio.sfx('levelup'); return this.textbox.show(CHARACTERS[id].name + ' learned ' + psy + '!'); }
  learnAll(psy) { for (const m of G.party.members) m.learnExtra(psy); return 0; }
  summon(name) { if (!G.party.summons.includes(name)) G.party.summons.push(name); for (const m of G.party.members) m.validateSummon(); Audio.sfx('summon'); return this.textbox.show('The tablet grants the power to summon ' + name + '! Choose it in the Summon menu.'); }
  *djinn(name) {
    const who = G.party.giveDjinn(name); if (!who) return;
    Audio.sfx('djinnget'); yield 20;
    yield this.textbox.show('The ' + ELNAME[DJINN[name].el] + ' Djinni ' + name + ' joined ' + who.name + '!');
    yield this.textbox.show(DJINN[name].desc);
    Audio.play(this.field.map.music);
  }
  *battle(enemies, opts) {
    opts = opts || {}; let result = null;
    if (typeof ClassExt !== 'undefined') ClassExt.ensureFoes();   // the class items' guardians are in the table whatever reloaded it
    Audio.sfx('encounter');
    const b = new BattleScene(enemies, Object.assign({ onEnd: r => result = r, bg: this.field.battleBgKey() }, opts));
    // the swirl takes the field's place, then hands the screen to the battle when it has spun down to black
    Engine.push(new BattleTransition(() => { Engine.fade = 1; Engine.fadeDir = 0; Engine.replace(b); Engine.fadeIn(12); }));
    yield () => result !== null;
    Engine.fadeIn(20);
    if (result === 'lose' && !opts.canLose) { this.field.gameOver(); yield () => false; }
    Audio.play(this.field.map.music);
    return result;
  }
  *warp(mapId, x, y, dir, opts) { yield Engine.fadeOut(15); this.field.loadMap(mapId, x, y, dir, opts); yield 2; yield Engine.fadeIn(15); }
  warpNow(mapId, x, y, dir) { this.field.loadMap(mapId, x, y, dir); return 0; }
  // Lucky Medal fountain: one medal per throw, the prize depends on where it lands
  *fountain(which) { G.inventory.remove('Lucky Medal'); const s = new FountainScene(which); Engine.push(s); yield () => s.closed; if (s.summonPrize) { G.set(s.summonPrize.toLowerCase() + '_taken'); yield this.say("Something rises out of the spring with the medal's splash - a stone tablet, cut with the sign of a great dragon that hides the sun!"); yield this.summon(s.summonPrize); } if (s.prize) yield this.give(s.prize); }
  *shop(shopId) { const sh = SHOPS[shopId]; if (sh && sh.closed && sh.closed()) { yield this.say(sh.closedText || 'Closed.', 'Shopkeeper'); return; } const s = new ShopScene(shopId); Engine.push(s); yield () => s.closed; }
  *inn(price) { const r = yield* this.ask('Would you like to stay the night? It costs ' + price + ' coins.', 'Innkeeper'); if (r !== 0) { yield this.say('Please come again.', 'Innkeeper'); return; } if (G.party.coins < price) { yield this.say("I'm sorry, you don't have enough coins.", 'Innkeeper'); return; } G.party.coins -= price; if (typeof Reputation !== 'undefined') Reputation.decay(3); yield this.say('Please, rest well.', 'Innkeeper'); yield Engine.fadeOut(30); G.party.fullRestore(); Audio.sfx('rest'); G.set('inn_rested:' + G.map.id); yield 40; yield Engine.fadeIn(30); if (G.field.checkTriggers) G.field.checkTriggers(true); yield this.say('Good morning! Your party is fully rested.', 'Innkeeper'); }
  *sanctum() { const r = yield* this.ask('Welcome to the Sanctum. Shall I revive your fallen and cleanse your ailments?', 'Priest'); if (r !== 0) return; const downed = G.party.members.filter(m => m.status.down); const cost = downed.length * 100 + 20; if (G.party.coins < cost) { yield this.say('The offering is ' + cost + ' coins. You cannot afford it.', 'Priest'); return; } G.party.coins -= cost; for (const m of G.party.members) { if (m.status.down) { m.status.down = false; m.hp = m.maxHp(); } m.status = {}; } Audio.sfx('heal'); yield this.say('May the light guide you.', 'Priest');
    // the cursed gear a sanctum can lift: 100 coins a piece, back into the bag
    const cursed = []; for (const m of G.party.members) for (const [slot, n] of Object.entries(m.equip || {})) if (n && ITEM_DB[n] && ITEM_DB[n].cursed) cursed.push([m, slot, n]);
    if (cursed.length) { const c2 = cursed.length * 100; const r2 = yield* this.ask('I sense a curse on ' + cursed.map(c => c[0].name + "'s " + (ITEM_DB[c[2]].n || c[2])).join(', ') + '. Shall I lift it, for ' + c2 + ' coins?', 'Priest'); if (r2 === 0) { if (G.party.coins < c2) { yield this.say('You cannot afford it.', 'Priest'); return; } G.party.coins -= c2; for (const [m, slot, n] of cursed) { m.equip[slot] = null; G.inventory.add(n, 1); } Audio.sfx('heal'); Engine.doFlash(10, '#ffffff'); yield this.say('The curse is lifted. The items are yours to keep, or to sell - but do not wear them again lightly.', 'Priest'); } } }
  *psyStone() { G.party.fullRestore(); Audio.sfx('save'); Engine.doFlash(10, '#a0e0ff'); yield this.say("The party's Psynergy and HP were fully restored!"); }
  *mindRead(text, name) { Audio.sfx('psy'); yield this.textbox.show('(' + text + ')', name || '???'); }
  *gameSave() { yield* this.field.saveMenu(); }
  *notice(text) { yield this.textbox.show(text); }
  // the sea rises and rolls over the map; the screen is white when it is done
  *wave(frames) { const f = this.field; f.wave = { t: 0, dur: frames || 110 }; Engine.doShake(frames || 110); Audio.sfx('quake'); yield () => f.wave.t >= f.wave.dur; f.wave = null; Engine.fade = 1; Engine.fadeCol = '#ffffff'; }
  // the ground splits: the listed tiles turn to water a few at a time, with the earth shaking as they go
  *crack(tiles, per, into) { const M = this.field.map; per = per || 2; for (let i = 0; i < tiles.length; i += per) { for (const [x, y] of tiles.slice(i, i + per)) { M.set(x, y, into || 'water'); M.setObj(x, y, null); } Audio.sfx('quake'); Engine.doShake(10); yield 6; } M.finalize(); }
  *chapter(title) { this.field.chapterTitle = { text: title, t: 0 }; yield 130; this.field.chapterTitle = null; }
  *levelParty(lvl) { for (const m of G.party.members) if (m.level < lvl) { m.growTo(lvl); m.fullRestore(); } }
}
