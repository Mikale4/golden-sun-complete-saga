// ---------- The Battle Arenas (the user's rule): a hall in every major town of both games ----------
// Inside: an armoury and a store that stock everything the towns seen so far sell; a Lucky Medal fountain; the ticket
// games (the Lucky Wheel, the dice); a betting counter where two of the road's monsters fight and a stake rides on the
// winner (Dragon Warrior's arena: the prize is a random piece of equipment from the whole game, a random permanent
// boost, or coins); and the pit, where four of the party - no reserve - fight four Adepts made for the bout, at the
// party's best level, with as many Djinn as the four carry (any of the world's Djinn but Alex's own), and gear and
// Psynergy to match. The pit pays in BATTLE POINTS, not coins or experience; the quartermaster's counter takes them for
// the age's rarest gear, the rarest consumables, and second copies of the great class items (two Adepts in one class);
// the shelf grows with the beacons and changes every quarter of an hour.
// The maps and the doors are in js/maps/arena.js.
'use strict';

const ARENA = {
  doors: {},   // town -> { x, y }: the tile in front of the arena's door, set when the town is built
  // ---- the counters: what every town seen so far sells, in one place ----
  stock(kind) {
    const out = new Set();
    for (const [id, sh] of Object.entries(SHOPS)) { if (id.startsWith('arena_')) continue; const m = id.match(/^([a-z_0-9]+)_(weapon|armor|item)$/); if (!m || m[2] !== kind) continue; const desc = Object.getOwnPropertyDescriptor(sh, 'items'); if (!desc || !Array.isArray(desc.value)) continue; if (!(G.visited && G.visited[m[1]])) continue; for (const n of sh.items) if (ITEM_DB[n] && ITEM_DB[n].buy) out.add(n); }
    return [...out].sort((a, b) => (ITEM_DB[a].buy || 0) - (ITEM_DB[b].buy || 0));
  },
  ensureShops(town) {
    if (!SHOPS['arena_' + town + '_weapon']) SHOPS['arena_' + town + '_weapon'] = { name: 'Arena Armoury', get items() { return ARENA.stock('weapon').concat(ARENA.stock('armor')); } };
    if (!SHOPS['arena_' + town + '_item']) SHOPS['arena_' + town + '_item'] = { name: 'Arena Store', get items() { const l = ARENA.stock('item'); return l.length ? l : ['Herb', 'Antidote', 'Elixir', 'Nut']; } };
  },
  // ---- the pools the prizes draw from ----
  equipment() { const cats = new Set(['long', 'light', 'axe', 'mace', 'staff', 'armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'helm', 'hat', 'circlet', 'shirt', 'boots', 'ring']); return Object.keys(ITEM_DB).filter(n => { const it = ITEM_DB[n]; return cats.has(it.cat) && !it.key && !it.classItem && !it.cursed && !/^Rusty/.test(n); }); },
  STAT_ITEMS: ['Power Bread', 'Cookie', 'Apple', 'Hard Nut', 'Mint', 'Lucky Pepper'],
  // every boss, mini-boss and story foe (the bookmaker's pit is for the road's monsters only)
  BOSSES: new Set(["Agatio", "Alex", "Alkahest", "Anger Ball", "Aqua Hydra", "Avimander", "Azart", "Bandit", "Blue Dragon", "Brigand", "Briggs", "Chestbeater", "Clockwork Sentinel", "Colossus of Sol", "Deadbeard", "Dire Wolf Matriarch", "Dodonpa", "Doom Dragon", "Dread Hound", "Dullahan", "Elder Frost Dragon", "Eye of Chronos", "Flame Dragon (Big)", "Flame Dragon (Small)", "Fusion Dragon", "Guardian Ball", "Hydros Statue", "Karst", "Killer Ape", "Knight", "Kraken", "Leviathan Spawn", "Living Statue", "Mad Plant", "Manticore", "Menardi", "Mimic", "Moapa", "Mystery Man", "Mystery Woman", "Navampa", "Ore Golem", "Poseidon", "Refresh Ball", "Satrage", "Saturos", "Saturos II", "Scorpion Queen", "Sea Fighter", "Sentinel", "Serpent", "Shadow Assassin", "Star Magician", "Storm Lizard", "Tempest Lizard", "The Wise One", "Thief", "Thunder Ball", "Toadonpa", "Tret", "Tusked Mauler", "Valukar", "Void Sovereign"]),
  // the road's monsters of this game near the party's level: the three or four that fight
  fighters(n) {
    const game = G.game === 2 ? 'tla' : 'gs1'; const lv = G.party.active.reduce((a, m) => a + m.level, 0) / Math.max(1, G.party.active.length);
    const cands = Object.keys(ENEMY_DB).filter(k => { const e = ENEMY_DB[k]; const base = e.n.replace(/ II$/, '').replace(/ \(.*$/, ''); if (e.g !== game || e.rival || e.traveler || this.BOSSES.has(e.n) || this.BOSSES.has(base) || / \(vs /.test(e.n) || /Djinni|Mimic|#/.test(e.n)) return false; if (!e.ab || e.hp < 20) return false; return typeof Foes !== 'undefined' && !!Foes.sprite(e.n, 0); });   /* no bosses, no Djinn, no mimics: the road's monsters */
    const el = (k) => clamp(Math.floor(Math.sqrt(ENEMY_DB[k].hp) * 0.9), 1, 99);
    const pool = cands.sort((x, y) => Math.abs(el(x) - lv) - Math.abs(el(y) - lv) || Math.random() - 0.5).slice(0, 30);   /* the thirty nearest the party's level: at the cap, the road's strongest */
    if (pool.length < n) return null; const out = []; while (out.length < n) { const k = pick(pool); if (!out.includes(k)) out.push(k); } return out;
  },
  // ---- the fight itself: the battle engine's own monsters, AI and formulas, every one against every other ----
  // A headless battle scene: for the one acting, 'enemies' is itself and 'front' is everybody else (the engine's monster
  // AI picks its ability and its target from those, and execute resolves it - abilities, damage, ailments, all as in a
  // real fight). What the scene would show is kept as events for the pit to replay.
  duel(keys, wantEvents) {
    const NO = /Djinn|Mystic Call|Chaos Magic|Flee|Element Swap|Ally Search|Search for Help|Cage/;
    const foes = keys.map((k, i) => { const e = new Enemy(k, i); e.abilities = e.abilities.filter(a => !NO.test(a)); e.x = 40 + i * (160 / Math.max(1, keys.length - 1)); e.y = 108; e._arena = i; return e; });
    const ev = []; const S = Object.create(BattleScene.prototype);
    Object.assign(S, { opts: {}, turn: 0, front: [], enemies: [], popups: [], fx: [], actorAnim: {}, msg: '', msgTimer: 0, party: { members: [] }, back: [] });
    S.isChar = () => false; S.aliveParty = () => S.front.filter(x => x.alive); S.aliveEnemies = () => S.enemies.filter(x => x.alive);
    S.say = (t) => { if (wantEvents) ev.push({ k: 'say', t }); return 0; }; S.popup = (x, y, text, col) => { if (wantEvents) { const who = foes.find(f => Math.abs(f.x - x) < 14); ev.push({ k: 'pop', who: who ? who._arena : -1, text, col, hp: foes.map(f => f.hp) }); } };
    S.playFx = function* () { }; S.animAttack = function* () { }; S.posOf = (a) => ({ x: a.x, y: a.y }); S.retarget = (list) => pick(list.filter(x => x.alive)) || null;
    S.checkEnd = () => foes.filter(f => f.alive).length <= 1;
    const run = (gen) => { let g = 0; let r = gen.next(); while (!r.done && g++ < 2000) r = gen.next(); };
    for (S.turn = 1; S.turn <= 40 && foes.filter(f => f.alive).length > 1; S.turn++) {
      if (wantEvents) ev.push({ k: 'turn', t: S.turn });
      const order = foes.filter(f => f.alive).sort((a, b) => b.agi() - a.agi());
      for (const f of order) {
        if (!f.alive || foes.filter(x => x.alive).length <= 1) break;
        for (let k = 0; k < (f.turns || 1); k++) {
          if (!f.alive || foes.filter(x => x.alive).length <= 1) break;
          if (f.status.stun || f.status.sleep) { if (wantEvents) ev.push({ k: 'say', t: f.name + (f.status.sleep ? ' is asleep.' : ' cannot move!') }); break; }
          S.enemies = [f]; S.front = foes.filter(x => x !== f);
          let cmd; try { cmd = S.enemyChoose(f); } catch (e) { cmd = { type: 'attack' }; }
          if (cmd.type === 'attack' || cmd.type === 'monster') { if (!cmd.target || !cmd.target.alive || cmd.target === f) cmd.target = pick(S.aliveParty()); }
          try { run(S.execute(f, cmd)); } catch (e) { if (wantEvents) ev.push({ k: 'say', t: f.name + ' falters.' }); }
          f.defending = false;
        }
      }
      S.front = foes; S.enemies = []; try { run(S.endOfTurn()); } catch (e) { }
      for (const f of foes) f.defending = false;
    }
    const alive = foes.filter(f => f.alive); const winner = alive.length === 1 ? alive[0] : foes.slice().sort((a, b) => b.hp / b.maxHp - a.hp / a.maxHp)[0];
    if (wantEvents) ev.push({ k: 'end', who: winner._arena });
    return { winner: keys[winner._arena], events: ev, hp: foes.map(f => f.hp), max: foes.map(f => f.maxHp) };
  },
  odds(keys) { const wins = keys.map(() => 0); const N = 40; for (let i = 0; i < N; i++) { const r = this.duel(keys, false); wins[keys.indexOf(r.winner)]++; } return wins.map(w => w / N); },
  *betting(E) {
    const coins = G.party.coins;
    if (!this._said) { this._said = true; yield E.say("Three or four beasts from the roads outside, in the pit together, every one against every other, until one of them is still standing. You put coins on one before they start. If yours is the last one up, you take a prize off the shelf - a piece of gear from anywhere in the world, something that makes one of you stronger for good, or your coins back with interest. If it isn't... well.", 'Bookmaker'); }
    if (coins < 100) { yield E.say("A hundred coins is the smallest stake I take. Come back with a purse.", 'Bookmaker'); return; }
    const keys = this.fighters(3 + rnd(2)); if (!keys) { yield E.say("Nothing worth watching has come in off the roads today. Try again another time.", 'Bookmaker'); return; }
    const p = this.odds(keys); const pay = p.map(x => Math.max(1.2, Math.round(10 * 0.9 / Math.max(0.04, x)) / 10));
    const nm = (k) => ENEMY_DB[k].n.replace(/ II$/, '');
    const side = yield* E.ask("Today's pit: " + keys.map((k, i) => nm(k) + ' (' + pay[i] + ' to 1)').join(', ') + ". Your coin on which?", 'Bookmaker', keys.map(nm).concat(['Not today']));
    if (side < 0 || side >= keys.length) { yield E.say("Suit yourself. They fight either way.", 'Bookmaker'); return; }
    const tiers = [100, 500, 2000, 10000].filter(t => t <= coins); const ti = yield* E.ask('How much?', 'Bookmaker', tiers.map(t => t + ' coins').concat(['Never mind']));
    if (ti < 0 || ti >= tiers.length) return;
    const bet = tiers[ti]; G.party.coins -= bet; const mine = keys[side];
    yield E.say("Done. " + bet + " on " + nm(mine) + ". To the pit!", 'Bookmaker');
    const fight = this.duel(keys, true); let done = false; Engine.push(new ArenaFightScene(keys, fight, () => { done = true; })); yield () => done;
    if (fight.winner !== mine) { yield E.say(nm(fight.winner) + " is the last one standing. Your " + bet + " stays with me. There is always tomorrow.", 'Bookmaker'); return; }
    yield E.say(nm(mine) + " takes it! Your prize, then - let's see what fortune has for you.", 'Bookmaker');
    const r = Math.random(); const tier = tiers.indexOf(bet);
    if (r < 0.4) { const won = Math.floor(bet * pay[side]); G.party.coins += won; Audio.sfx('item'); yield E.say('Won ' + won + ' coins!'); }
    else if (r < 0.75) { const pool = this.equipment().filter(n => (ITEM_DB[n].buy || 0) >= [0, 1000, 4000, 9000][tier]); const it = pick(pool.length ? pool : this.equipment()); Audio.sfx('levelup'); yield E.give(it); }
    else { const it = pick(this.STAT_ITEMS); Audio.sfx('levelup'); yield E.give(it, tier >= 2 ? 2 : 1); }
  },
  // ---- the pit: four against four Adepts made for the bout ----
  ALEX_DJINN: ['Azoth', 'Aqua Regia', 'Quicksilver', 'Tincture', 'Vitriol', 'Nimbus', 'Alkali', 'Panacea', 'Ouroboros'],
  *pick4(E) {
    const ms = G.party.members.filter(m => m.alive); if (ms.length < 4) { yield E.say("Four fighters. You do not have four on their feet.", 'Pit Master'); return null; }
    if (this.autoPick) { const c = this.autoPick.map(id => G.party.get(id)).filter(m => m && m.alive).slice(0, 4); if (c.length === 4) return c; }   /* named beforehand (the runner) */
    const chosen = []; let rest = ms.slice();
    while (chosen.length < 4) {
      let page = 0; let picked = null;
      while (picked === null) {
        const slice = rest.slice(page * 4, page * 4 + 4); const more = rest.length > (page + 1) * 4; const opts = slice.map(m => m.name + ' L' + m.level).concat(more ? ['More...'] : [], ['Never mind']);
        const r = yield* E.ask('Fighter ' + (chosen.length + 1) + ' of 4' + (chosen.length ? ' (' + chosen.map(m => m.name).join(', ') + ')' : '') + '?', 'Pit Master', opts);
        if (r < 0 || r === opts.length - 1) return null; if (more && r === slice.length) { page++; continue; } picked = slice[r];
      }
      chosen.push(picked); rest = rest.filter(m => m !== picked);
    }
    return chosen;
  },
  makeRivals(chosen) {
    const level = Math.max(...chosen.map(m => m.level));   /* the four who go in set the bar, not a guest left at the rail */ const total = chosen.reduce((a, m) => a + m.djinn.length, 0);
    const pool = Object.keys(DJINN).filter(n => !this.ALEX_DJINN.includes(n)).sort(() => Math.random() - 0.5);   /* any of the world's Djinn but Alex's own */
    const kinds = ['warrior', 'soldier', 'monk', 'proxian', 'mercenary', 'hunter', 'tribe', 'noble']; const keys = [];
    for (let i = 0; i < 4; i++) {
      const kind = pick(kinds); const c = Travelers.makeCombatant(kind, level);
      for (const d of c.djinn.slice()) c.removeDjinn(d.name);
      // as many as their share of the party's: drawn at random, most of them of the challenger's own element (the way the road's Adepts are made), so the draw lands them in a real class
      const n = Math.floor(total / 4) + (i < total % 4 ? 1 : 0);
      for (let k = 0; k < n && pool.length; k++) { const own = pool.filter(nm => DJINN[nm].el === c.el); const from = (Math.random() < 0.7 && own.length) ? own : pool; const nm = pick(from); pool.splice(pool.indexOf(nm), 1); c.setDjinn(nm); }
      c.hp = c.stats().hp; c.pp = c.stats().pp;
      const bag = new Inventory(); bag.add('Herb', 3); bag.add('Psy Crystal', 1); if (level >= 30) bag.add('Potion', 2); if (level >= 40) bag.add('Water of Life', 1);
      const key = ClassExt.rival('Challenger ' + (i + 1) + ' ' + c.name, c, bag, c.battleLook()); ENEMY_DB[key].t = 1; ENEMY_DB[key].exp = 0; ENEMY_DB[key].c = 0; keys.push(key);   /* the pit pays in Battle Points, nothing else */
    }
    return keys;
  },
  *partyBattle(E) {
    if (!this._pitSaid) { this._pitSaid = true; yield E.say("The pit takes four. Four of yours against four I bring in - Adepts as good as your best, with as many Djinn between them as your four carry. Nobody waits in reserve; whoever you pick is all you get. Win, and the purse is yours with something from the shelf. Lose, and you walk out with your lives, which is more than the pit usually gives.", 'Pit Master'); }
    const r0 = yield* E.ask('Four into the pit?', 'Pit Master', ['Yes', 'Not now']); if (r0 !== 0) return;
    const chosen = yield* this.pick4(E); if (!chosen) return;
    const keys = this.makeRivals(chosen); const level = Math.max(...chosen.map(m => m.level));
    yield E.say("Your four: " + chosen.map(m => m.name).join(', ') + ". Theirs: " + keys.map(k => ENEMY_DB[k].rival.ch.name + ' the ' + ENEMY_DB[k].rival.cls).join(', ') + ". Begin!", 'Pit Master');
    const active = G.party.active.slice(), reserve = G.party.reserve.slice();
    G.party.active = chosen.slice(); G.party.reserve = [];
    let r; try { r = yield* E.battle(keys, { boss: true, canFlee: false, canLose: true, music: 'bosshuman' }); }
    finally { G.party.active = active; G.party.reserve = reserve; for (const m of G.party.members) m.fullRestore(); for (const k of keys) { delete ENEMY_DB[k]; delete Monsters.customLooks[k]; } }
    if (r !== 'win') { yield E.say("The pit keeps its winners. Come back when you have thought about it.", 'Pit Master'); return; }
    const clean = chosen.every(m => m.alive); const bp = 10 + Math.floor(level / 5) + (clean ? 5 : 0); this.addBP(bp); Audio.sfx('levelup');
    yield E.say('Won ' + bp + ' Battle Points' + (clean ? ' - not one of yours went down!' : '!') + ' (' + this.bp() + ' in all)');
    yield E.say("Four of the best I could find, and you walked over them. The quartermaster's counter takes those points - the rarest gear there is, and one or two things you will not find anywhere else. Come back whenever you want the pit to remember your names.", 'Pit Master');
  },
  // ---- Battle Points: the pit's own coin ----
  bp() { return G.get('battle_points') || 0; },
  addBP(n) { G.set('battle_points', this.bp() + n); },
  // the quartermaster's pool: [item, points]. The counter shows a fresh draw every fifteen real minutes - a few
  // consumables, a few pieces of gear, one of the age's great pieces and one class item (a second copy) - and each is
  // one only: bought, it is sold out until the next draw.
  // A class item bought is gone from the pool for good.
  // Every entry carries the stage it enters the pool at (the user's rule: the shelf starts weak and grows with the
  // journey, a step at a time). The stages are the road's milestones, in order:
  //   0 Vale  1 Sol Sanctum done  2 Kolima's bridge  3 Mercury's beacon  4 Altin drained  5 Colosso  6 Venus's beacon
  //   7 Alhafra (Briggs)  8 Gaia Rock (the Serpent)  9 the Lemurian ship  10 Poseidon  11 Jupiter's beacon
  //   12 Mars's beacon  13 The Lost Age done  14 the post-game
  STAGES: ['', 'sanctum_done', 'kolima_bridge_fixed', 'mercury_lit', 'altin_drained', 'colosso_done', 'venus_lit', 'briggs_done', 'serpent_done', 'hasShip', 'poseidon_done', 'jupiter_lit', 'mars_lit', 'game_complete', 'postgame_open'],
  stage() { let st = 0; this.STAGES.forEach((f, i) => { if (f && (G.flag(f) || (f === 'venus_lit' && G.flag('gs1_complete')))) st = Math.max(st, i); }); if (G.game === 2) st = Math.max(st, 6); return st; },
  POOL: {
    goods: [['Herb', 1, 0], ['Antidote', 1, 0], ['Sacred Feather', 2, 0], ['Nut', 2, 1], ['Vial', 3, 2], ['Game Ticket', 4, 2], ['Elixir', 3, 3], ['Potion', 5, 4], ['Psy Crystal', 6, 5], ['Lucky Medal', 15, 5], ['Water of Life', 8, 6], ['Power Bread', 25, 7], ['Cookie', 25, 8], ['Apple', 25, 9], ['Hard Nut', 25, 10], ['Mist Potion', 12, 11], ['Mint', 25, 11], ['Lucky Pepper', 25, 12]],
    gear: [['Elven Rapier', 10, 0], ['Broad Sword', 10, 0], ['Heavy Mace', 8, 0], ['Leather Gloves', 6, 0], ['Wooden Cap', 6, 0], ['Battle Axe', 8, 1], ['Chain Mail', 10, 1], ['Great Sword', 20, 2], ['Vulcan Axe', 20, 3], ['Master Rapier', 20, 3], ['Spiked Armor', 20, 4], ['Silver Blade', 30, 5], ['Assassin Blade', 30, 6], ['Mystery Blade', 30, 6], ['Mythril Armlet', 30, 7], ['Psychic Circlet', 30, 8], ['Mythril Helm', 30, 9], ['Mythril Clothes', 30, 9], ['Mythril Blade', 30, 10], ['Burning Sword', 60, 11], ["Apollo's Axe", 60, 11], ['Titan Gloves', 60, 11], ['Dragon Shield', 60, 12], ['Dragon Helm', 60, 12], ['Dragon Mail', 60, 12], ['Chronos Mail', 60, 12], ['Levatine', 60, 12]],
    great: [['Gaia Blade', 60, 6], ['Kikuichimonji', 80, 8], ['Masamune', 80, 10], ['Millennium Helm', 120, 12], ['Big Bang Gloves', 120, 12], ['Cosmos Shield', 120, 12], ['Xylion Armor', 120, 13], ['Stellar Axe', 120, 13], ['Nebula Wand', 120, 13], ['Tisiphone Edge', 120, 13], ['Excalibur', 120, 14]],
    classItems: [['Mysterious Card', 200, 5], ["Trainer's Whip", 200, 6], ['Tomegathericon', 200, 8], ["Hunter's Talisman", 250, 9], ['Wolf Fang Pendant', 250, 10], ["Warlord's Helm", 300, 12], ['Crown of Sol', 300, 13], ['Dragon Scale Amulet', 300, 14], ['Void Mantle', 300, 14]]
  },
  ROTATION_MS: 15 * 60 * 1000,
  rotation() { return Math.floor(Date.now() / this.ROTATION_MS); },
  minutesLeft() { return Math.max(1, Math.ceil((this.ROTATION_MS - (Date.now() % this.ROTATION_MS)) / 60000)); },
  // the draw is the same for the whole quarter-hour (seeded by it), whichever town's counter you stand at
  stock() {
    const rot = this.rotation(); let seed = (rot * 2654435761) >>> 0; const rnd01 = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const st = this.stage();
    const draw = (list, n) => { const l = list.filter(([nm, , need]) => ITEM_DB[nm] && (need || 0) <= st).sort((a, b) => (b[2] || 0) - (a[2] || 0)); const recent = l.filter(x => (x[2] || 0) === st); const out = []; while (out.length < n && l.length) { const from = (recent.length && rnd01() < 0.5) ? recent : l; const k = from.splice(Math.floor(rnd01() * from.length), 1)[0]; if (!k) break; const li = l.indexOf(k); if (li >= 0) l.splice(li, 1); const ri = recent.indexOf(k); if (ri >= 0) recent.splice(ri, 1); out.push(k); } return out; };   /* what the stage allows, with a lean to what the latest beacon opened */
    const P = this.POOL; const items = [];
    for (const [n, bp] of draw(P.goods, 4)) items.push({ id: n, bp, kind: 'goods' });
    for (const [n, bp] of draw(P.gear, 3)) items.push({ id: n, bp, kind: 'gear' });
    for (const [n, bp] of draw(P.great, 1)) items.push({ id: n, bp, kind: 'great' });
    for (const [n, bp] of draw(P.classItems.filter(([nm]) => !G.flag('bp_bought:' + nm)), 1)) items.push({ id: n, bp, kind: 'class', uniq: true });
    // (no Djinn on the shelf: the world's Djinn are found, not bought)
    for (const it of items) it.sold = it.sold || !!G.flag('bp_sold:' + rot + ':' + it.id);
    return items;
  },
  buy(it) {
    const rot = this.rotation(); if (it.sold || this.bp() < it.bp) return false;
    G.set('battle_points', this.bp() - it.bp); G.set('bp_sold:' + rot + ':' + it.id); if (it.uniq) G.set('bp_bought:' + it.id);
    G.inventory.add(it.id, 1);
    return true;
  },
  *quartermaster(E) {
    if (!this._qmSaid) { this._qmSaid = true; yield E.say("Battle Points. The pit pays them and nothing else takes them but me. Gear the smiths of this age are proud of, the things that make an Adept stronger for good, and a great class item a second time over, so two of yours can walk the same road. One of each, and the shelf changes every quarter of an hour. Look.", 'Quartermaster'); }
    const s = new BPShopScene(); Engine.push(s); yield () => s.closed;
  },
  *fountain(E) {
    if (!G.inventory.has('Lucky Medal')) { yield E.say("Toss a Lucky Medal into the fountain and fortune may smile on you!", 'Fountain Keeper'); return; }
    const r = yield* E.ask('Toss a Lucky Medal into the fountain?', 'Fountain Keeper', ['Yes', 'No']); if (r !== 0) return;
    yield* E.fountain(G.game === 2 ? 'lemuria' : 'tolbi');
  }
};

// the pit, from the rail: the road's monsters, every one against every other, as the battle engine fought it
class ArenaFightScene {
  constructor(keys, fight, onDone) {
    this.onDone = onDone; this.keys = keys; this.foes = keys.map((k, i) => { const e = new Enemy(k, i); e.x = 40 + i * (160 / Math.max(1, keys.length - 1)); e.y = 108; return e; });
    this.hp = this.foes.map(f => f.maxHp); this.events = fight.events; this.i = 0; this.t = 0; this.wait = 60; this.popups = []; this.msg = 'FIGHT!'; this.end = 0; this.winner = fight.winner; this.turn = 0;
  }
  update() {
    this.t++; for (const p of this.popups) p.t++; this.popups = this.popups.filter(p => p.t < 40); for (const f of this.foes) if (f.shake > 0) f.shake--;
    if (this.i >= this.events.length) { this.end++; if (this.end > 100 || Input.pressed('a')) { Engine.pop(); if (this.onDone) this.onDone(); } return; }
    if (Input.pressed('b') && this.t > 120) { while (this.i < this.events.length) this.step(); this.msg = ''; return; }   /* B: straight to the end */
    if (this.wait > 0) { this.wait--; return; }
    this.step();
  }
  step() {
    const e = this.events[this.i++]; if (!e) return;
    if (e.k === 'turn') { this.turn = e.t; this.wait = 6; }
    else if (e.k === 'say') { this.msg = e.t; this.wait = 34; }
    else if (e.k === 'pop') { if (e.who >= 0) { const f = this.foes[e.who]; this.popups.push({ x: f.x, y: f.y - 30, t: 0, text: e.text, col: e.col || '#ffffff' }); if (/^\d+$/.test(e.text)) { f.shake = 12; Audio.sfx('hit'); } } this.hp = e.hp.slice(); this.wait = 10; }
    else if (e.k === 'end') { this.msg = ''; this.wait = 0; }
  }
  draw(g) {
    Gfx.rect(g, 0, 0, SCREEN_W, SCREEN_H, '#3a2a20'); Gfx.rect(g, 0, 40, SCREEN_W, 120, '#c8a870'); Gfx.rect(g, 0, 36, SCREEN_W, 4, '#806040');
    for (let i = 0; i < 12; i++) Gfx.ellipse(g, 20 + i * 20, 20 + (i % 2) * 6, 7, 5, i % 3 ? '#605040' : '#807060');   // the crowd at the rail
    this.foes.forEach((e, i) => {
      const spr = e.sprite(Math.floor(this.t / 30) % 2); const ox = e.shake > 0 ? (rnd(5) - 2) : 0; const down = this.hp[i] <= 0;
      g.globalAlpha = down ? 0.35 : 1; g.drawImage(spr, Math.round(e.x - spr.width / 2) + ox, Math.round(e.y - spr.height + 12)); g.globalAlpha = 1;
      const ny = i % 2 ? 130 : 121;   /* four names across 240px: staggered on two rows */
      Font.draw(g, e.name, Math.round(e.x), ny, down ? '#a0a0a0' : '#ffffff', { align: 'center', outline: '#101020' }); UI.bar(g, Math.round(e.x) - 20, ny + 8, 40, 3, this.hp[i] / e.maxHp, this.hp[i] > e.maxHp * 0.3 ? '#60e060' : '#e06060', '#101830');
    });
    for (const p of this.popups) Font.draw(g, p.text, p.x, p.y - Math.min(12, p.t * 1.2), p.col, { outline: '#101020' });
    if (this.i >= this.events.length) { const w = ENEMY_DB[this.winner]; UI.window(g, 30, 140, 180, 18); Font.draw(g, (w ? w.n.replace(/ II$/, '') : '?') + ' is the last one standing!', 120, 145, '#ffe080', { align: 'center' }); }
    else if (this.msg) { UI.window(g, 4, 140, SCREEN_W - 8, 18); Font.draw(g, this.msg, 10, 145, '#ffffff'); }
    if (this.turn) Font.draw(g, 'Turn ' + this.turn, SCREEN_W - 6, 4, '#ffe080', { align: 'right', outline: '#101020' });
  }
}

// the quartermaster's counter: this quarter-hour's draw, paid in Battle Points; one of each, sold out once bought
class BPShopScene {
  constructor() { this.transparent = true; this.closed = false; this.rot = ARENA.rotation(); this.msg = 'The shelf as it stands. Battle Points only.'; this.list = new MenuList(this.items(), { x: 80, y: 20, w: 150, rows: 9, lineH: 11 }); }
  items() { return ARENA.stock().map(it => ({ label: it.id, id: it.id, right: it.sold ? 'SOLD' : it.bp + ' BP', it, disabled: it.sold || ARENA.bp() < it.bp })); }
  update() {
    if (ARENA.rotation() !== this.rot) { this.rot = ARENA.rotation(); this.list.reset(this.items()); this.msg = 'New stock on the shelf.'; }
    this.list.update(); if (this.list.cancelled) { this.closed = true; Engine.pop(); return; }
    if (this.list.chosen) {
      const c = this.list.chosen; if (c.it.sold) { this.msg = 'Sold out. The shelf changes in ' + ARENA.minutesLeft() + ' min.'; Audio.sfx('buzz'); this.list.reset(this.items()); return; }
      if (ARENA.bp() < c.it.bp) { this.msg = 'Not enough Battle Points. The pit pays them.'; Audio.sfx('buzz'); this.list.reset(this.items()); return; }
      ARENA.buy(c.it); Audio.sfx('shop'); this.msg = 'The ' + c.id + ' is yours.' + (c.it.uniq ? ' There will not be another.' : ''); this.list.reset(this.items());
    }
  }
  draw(g) {
    UI.window(g, 4, 4, 232, 14); Font.draw(g, "Quartermaster's Counter", 120, 7, '#ffe080', { align: 'center' });
    UI.window(g, 4, 20, 70, 42); Font.draw(g, 'Battle', 8, 24, '#a0c0ff'); Font.draw(g, 'Points', 8, 33, '#a0c0ff'); Font.draw(g, String(ARENA.bp()), 70, 42, '#ffffff', { align: 'right' }); Font.draw(g, 'new in ' + ARENA.minutesLeft() + 'm', 8, 52, '#c0a0ff');
    UI.window(g, 76, 20, 160, 116); this.list.y = 24; this.list.x = 82; this.list.draw(g);
    const cur = this.list.current; if (cur) { const d = ITEM_DB[cur.id].desc || (ITEM_DB[cur.id].atk ? 'Attack +' + ITEM_DB[cur.id].atk : ITEM_DB[cur.id].def ? 'Defense +' + ITEM_DB[cur.id].def : ''); Font.wrap(d || '', 150).slice(0, 1).forEach(l => Font.draw(g, l, 82, 122, '#e0e8ff')); }
    UI.window(g, 4, 138, 232, 18); Font.draw(g, this.msg, 10, 143, '#ffffff');
  }
}
