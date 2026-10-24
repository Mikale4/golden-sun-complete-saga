// Test helpers for the game console / the in-app browser: load with fetch+eval after runner.js and the plans.
//   await TK.setupTLA({ flags: [...], items: [...], level: 12, coins: 2000, map: 'madra', x: 29, y: 31, dir: DIR.UP })
//     starts a fresh Lost Age game, kills the intro, sets flags/items/levels and lands the party on a map
//   TK.runFrom(step, ms) -> runs the plan from the first step matching [op, a] (or a plan index)
window.TK = {
  // files are read with a synchronous request: a hidden tab throttles fetch to a crawl, and these are dev tools
  text(f) { const x = new XMLHttpRequest(); x.open('GET', f + '?v=' + Date.now(), false); x.send(); return x.responseText; },
  async setupTLA(o) {
    o = o || {}; Game.newGameTLA(); await new Promise(r => setTimeout(r, 200)); Engine.fadeCb = null; Engine.fade = 0; Engine.fadeDir = 0;
    await new Promise(r => setTimeout(r, 300)); G.field.event = null; G.field.eventQueue = []; G.field.textbox.active = false;
    for (const f of o.flags || []) G.set(f);
    for (const it of o.items || []) G.inventory.add(it);
    for (const m of G.party.members) { while (m.level < (o.level || 1)) m.levelUp(true); m.status = {}; m.hp = m.maxHp(); m.pp = m.maxPp(); }
    if (o.coins !== undefined) G.party.coins = o.coins;
    if (o.map) { if (MAPS[o.map] && MAPS[o.map].world) G.field.loadMap(o.map, o.x, o.y, o.dir);   /* a world map loaded from a room lands at the room's place; the second load lands where asked */
      G.field.loadMap(o.map, o.x, o.y, o.dir === undefined ? DIR.UP : o.dir); Engine.fade = 0; Engine.fadeDir = 0; await new Promise(r => setTimeout(r, 400)); G.field.event = null; G.field.eventQueue = []; G.field.textbox.active = false; }
    if (typeof R !== 'undefined') { R.installBattleAI(); R.opts.readDelay = 6; R.issues = []; R.log = []; }
    return { map: G.map.id, pos: [G.field.player.tx, G.field.player.ty], party: G.party.members.map(m => m.name + m.level).join(',') };
  },
  planIndex(op, a, after) { return R.plan.findIndex((s, i) => i > (after || -1) && s[0] === op && (a === undefined || s[1] === a)); },
  runFrom(step, ms) {
    const i = typeof step === 'number' ? step : this.planIndex(step[0], step[1], step[2]); if (i < 0) return 'step not found';
    R.pc = i; const r = R.run(ms || 12000);
    return { from: i, pc: R.pc, map: G.map.id, pos: [G.field.player.tx, G.field.player.ty], party: G.party.members.map(m => m.name + m.level + ' hp' + m.hp).join(','), log: (R.log || []).slice(-14), issues: (r.issues || []).slice(-3).map(i => i.msg + ' @' + i.map + ' ' + i.stepDef) };
  }
};
// TK.hotSync(): bring a long-running tab up to date with the files on disk without reloading it - the runner
// (its methods copied onto the live R), the plans, the data tables (a top-level `const` cannot be replaced by eval,
// so each file is evaluated with `const X =` rewritten to `window.__NEW_X =` and its keys copied into the live
// object), the map files (defineMap re-registers), the world entries. Class methods (field.js) stay as they were.
window.TK.hotSync = async function (mapFiles) {
  const out = [];
  let s = TK.text('runner/runner.js'); s = s.replace('window.R = {', 'Object.assign(window.R2 = {}, {'); const i = s.lastIndexOf('};'); s = s.slice(0, i) + '});' + s.slice(i + 2); (0, eval)(s); for (const k of Object.keys(R2)) { if (typeof R2[k] === 'function' || (typeof R2[k] === 'object' && R2[k] && k === k.toUpperCase())) R[k] = R2[k]; }   /* methods, and the UPPERCASE tables */ out.push('runner');
  for (const f of ['runner/plan_gs1.js', 'runner/plan_tla.js']) (0, eval)(TK.text(f)); R.plan = PLAN_GS1.concat(PLAN_TLA); out.push('plans ' + R.plan.length);
  // a data file's tables: the file runs inside a function (its consts stay local), the table it names comes back
  const load = (f, name) => (new Function(TK.text(f) + '\n; return ' + name + ';'))();
  for (const [f, name, live] of [['js/data/enemies_gen.js', 'ENEMY_DB', ENEMY_DB], ['js/data/shops.js', 'SHOPS', SHOPS], ['js/data/hidden_items.js', 'HIDDEN_ITEMS', HIDDEN_ITEMS], ['js/maps/world_tla.js', 'WORLD_TLA_ENTRIES', WORLD_TLA_ENTRIES], ['js/data/audio_map.js', 'SONG_FILES', SONG_FILES], ['js/data/audio_map.js', 'MAP_MUSIC', MAP_MUSIC], ['js/data/audio_map.js', 'MAP_MUSIC_PREFIX', MAP_MUSIC_PREFIX], ['js/data/audio_map.js', 'BOSS_MUSIC', BOSS_MUSIC]]) { try { const nb = load(f, name); if (Array.isArray(live)) { live.length = 0; live.push(...nb); } else { for (const k of Object.keys(live)) if (!(k in nb) && !(live === ENEMY_DB && live[k] && live[k].g && !['gs1', 'tla'].includes(live[k].g))) delete live[k]; for (const k of Object.keys(nb)) live[k] = nb[k]; }   /* the rows made at run time (travelers, rivals, the class items' foes, the post-game's) stay */ out.push(name); } catch (e) { out.push(name + ' ERR ' + e.message); } }
  for (const f of mapFiles || []) { try { if (f.endsWith('world_tla_seawalls.js')) window.worldTlaWallCells = load(f, 'worldTlaWallCells'); else (0, eval)(TK.text(f)); out.push(f); } catch (e) { out.push(f + ' ERR ' + e.message); } }   // the sea walls' function is looked up by name from the world's build
  return out;
};
// TK.hotEngine(files): bring an engine file's CLASSES up to date in a running tab: the file runs inside a function
// (its top-level consts stay local to it, its methods close over them) and every method of every class it declares is
// copied onto the live class's prototype (statics too). Instances already alive pick the new methods up at once.
// Top-level objects (SaveSystem, Tiles...) are not touched; use TK.hotTiles for new tiles.
window.TK.hotEngine = function (files) {
  const out = [];
  for (const f of files || ['js/game/field.js']) {
    try {
      const t = TK.text(f); const names = [...t.matchAll(/^class (\w+)/gm)].map(m => m[1]);
      const N = (new Function(t + '\n; return {' + names.join(',') + '};'))();
      for (const n of names) { let live = null; try { live = (0, eval)(n); } catch (e) { }   /* a class declaration is a global binding, not a window property */ if (!live) { out.push(n + ' not live'); continue; } for (const k of Object.getOwnPropertyNames(N[n].prototype)) if (k !== 'constructor') Object.defineProperty(live.prototype, k, Object.getOwnPropertyDescriptor(N[n].prototype, k)); for (const k of Object.getOwnPropertyNames(N[n])) if (!['length', 'name', 'prototype'].includes(k)) Object.defineProperty(live, k, Object.getOwnPropertyDescriptor(N[n], k)); }
      out.push(f + ': ' + names.join(','));
    } catch (e) { out.push(f + ' ERR ' + e.message); }
  }
  return out;
};
// TK.hotTiles(): register the tiles of js/core/tiles.js's marked hot-syncable blocks (between '// ---- NAME' and
// '// ---- END NAME' markers) in a running tab, with cliffSet and roof from the file in scope. Already-registered
// names are skipped (a re-registration would give them new ids).
window.TK.hotTiles = function (marker) {
  const t = TK.text('js/core/tiles.js'); const out = [];
  const fn = (name) => { const i = t.indexOf('const ' + name + ' = '); let j = t.indexOf('\n    };', i); if (name === 'roof') j = t.indexOf('\n    };', i); return t.slice(i, j + 7); };
  const cliffSet = fn('cliffSet'), roof = fn('roof');
  const re = new RegExp('// ---- ' + (marker || '[A-Z /]+') + ' [(]hot-syncable[^]*?// ---- END ', 'g');
  const blocks = [...t.matchAll(re)].map(m => m[0]);
  for (let b of blocks) {
    b = b.replace(/T\.reg\('([a-z_0-9]+)'/g, (m, nm) => Tiles.defs[nm] ? "T.reg('__skip_" + nm + "'" : m);   // keep old ids for names already there
    try { (new Function('T', 'Gfx', 'seededRandom', 'hashStr', 'mix', 'shade', 'tint', 'pick', cliffSet + '\n' + roof + '\n' + b))(Tiles, Gfx, seededRandom, hashStr, typeof mix === 'function' ? mix : null, typeof shade === 'function' ? shade : null, typeof tint === 'function' ? tint : null, typeof pick === 'function' ? pick : null); out.push('block ok'); } catch (e) { out.push('block ERR ' + e.message); }
  }
  for (const k of Object.keys(Tiles.defs)) if (k.startsWith('__skip_')) { const t2 = Tiles.defs[k]; delete Tiles.defs[k]; Tiles.list[t2.id] = Tiles.defs[k.slice(7)] || t2; }
  return out;
};
'testkit loaded';
