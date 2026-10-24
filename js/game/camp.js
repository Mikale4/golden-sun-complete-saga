// ---------- The Camp: party-building tents ----------
// The original games make you plan a party blind - you set Djinn and only afterwards discover the class you made.
// Each tent here is a workbench for one of those decisions, with the numbers on screen before you commit.
'use strict';

// one pace of a training trip; the Adepts out there take a step each time, so a 600-pace trip runs about four minutes
const TRAIN_STEP_FRAMES = 24;

// What an Adept says when you find them out on the plain. Two moods each - still at it, and nearly done - because
// they are training, not reading a counter off the screen.
const TRAINING_TALK = {
  Isaac: {
    on: ["The swing still drifts when I get tired. So I keep swinging until it stops drifting.",
         "Go on ahead. I have spent enough of this journey being carried by the rest of you."],
    end: ["That is the last of it. My arms have stopped arguing with me."]
  },
  Garet: {
    on: ["Fire is easy. Holding it back until the right moment - that is the part I keep getting wrong.",
         "Do not wait on me. I am going to hit that rock until one of us gives in."],
    end: ["Right. I am done. Someone put something in front of me and I will knock it over."]
  },
  Ivan: {
    on: ["The wind tells me where a blow is coming from. Now I have to teach my feet to listen.",
         "I read about footwork once. It turns out reading about it is not the same thing at all."],
    end: ["There. My feet finally agree with the wind. Mostly."]
  },
  Mia: {
    on: ["Healing is simple when nobody is shouting. Out here I practise with the wind in my ears instead.",
         "In Imil we trained on the ice. This grass is almost unfair."],
    end: ["I can hold the light steady now, however loud it gets. Shall we?"]
  },
  Felix: {
    on: ["It is quiet out here. That is the whole point.",
         "Go on. I will know when I am finished."],
    end: ["Finished. The quiet did its work."]
  },
  Jenna: {
    on: ["Do not wait on me - I have a few things to burn off, and this field volunteered.",
         "Three years of standing still. I am making up for it."],
    end: ["Done, and the field survived. Barely."]
  },
  Sheba: {
    on: ["The plain is a good teacher. It does not flatter you and it does not explain twice.",
         "Everyone assumes I am the one who needs looking after. I would rather settle that out here."],
    end: ["Settled. Nobody needs to look after me."]
  },
  Piers: {
    on: ["Ship's drills, on dry land. It is stranger than it sounds, and it works.",
         "A Lemurian trains for a century. I would like to manage a little of it this afternoon."],
    end: ["That will do. A century's worth it is not, but it will do."]
  },
  Kraden: {
    on: ["I have written four hundred pages on what Psynergy does. Rather late in life I am finding out what it feels like.",
         "Do not laugh. An old man out here alone is exactly how one stops being an old man who is carried everywhere."],
    end: ["There. Theory and practice, reconciled at last. My knees have opinions about it."]
  }
};

// Shared helpers -------------------------------------------------------------------------------------------------
const Camp = {
  // where the camp stands on Weyard's map - the plains the training party walks
  WORLD: { map: 'world_tla', x: 81, y: 141 },
  // an Adept who is away training is not in the camp and cannot be called into the front rank
  isTraining(id) { const t = G.get('training'); return !!(t && !t.done && t.stepsLeft > 0 && t.ids.includes(id)); },
  STAT_KEYS: ['hp', 'pp', 'atk', 'def', 'agi', 'lck'],
  STAT_LABEL: { hp: 'HP', pp: 'PP', atk: 'Attack', def: 'Defense', agi: 'Agility', lck: 'Luck' },
  // what a character would be with a given set of Djinn names, without disturbing them
  preview(m, djinnNames) {
    const lv = [0, 0, 0, 0]; lv[m.el] = 5;
    const boost = [0, 0, 0, 0, 0, 0];
    for (const n of djinnNames) { const d = DJINN[n]; if (!d) continue; lv[d.el]++; for (let i = 0; i < 6; i++) boost[i] += d.boost[i]; }
    const cname = determineClass(m.el, lv, { isJenna: m.id === 'Jenna', isPiers: m.id === 'Piers', isKraden: m.id === 'Kraden', classItem: m.classItem });
    const cls = CLASSES[cname] || { mult: [100, 100, 100, 100, 100, 100] };
    const eb = m.equipBonus(); const st = {};
    Camp.STAT_KEYS.forEach((k, i) => { st[k] = Math.max(1, Math.floor((m.base[i] + boost[i] + eb[i]) * cls.mult[i] / 100)); });
    const psy = [...new Set(classPsynergy(cname, m.level).concat(m.data.inherent, m.extraPsy || []))];
    return { cls: cname, stats: st, psy, elLevels: lv };
  },
  // what a character would be wearing a different item in one slot
  previewEquip(m, slot, item) {
    const old = m.equip[slot]; m.equip[slot] = item;
    const st = m.stats(); const cls = m.className();
    m.equip[slot] = old;
    return { stats: st, cls };
  },
  colourFor(a, b) { return a > b ? '#80ff80' : a < b ? '#ff8080' : '#ffffff'; },
  // every Djinni the party holds, grouped by element
  pool() { const out = [[], [], [], []]; for (const m of G.party.members) for (const d of m.djinn) out[DJINN[d.name].el].push({ name: d.name, owner: m }); return out; },
  drawHeader(g, title, hint) {
    UI.window(g, 2, 2, SCREEN_W - 4, 14); Font.draw(g, title, 8, 5, '#ffe080');
    if (hint) Font.draw(g, hint, SCREEN_W - 8, 5, '#8090b0', { align: 'right' });
  },
  drawStats(g, x, y, st, ref, label) {
    if (label) Font.draw(g, label, x, y - 10, '#a0c0ff');
    Camp.STAT_KEYS.forEach((k, i) => {
      const yy = y + i * 10;
      Font.draw(g, Camp.STAT_LABEL[k], x, yy, '#a0c0ff');
      const col = ref ? Camp.colourFor(st[k], ref[k]) : '#ffffff';
      Font.draw(g, String(st[k]), x + 62, yy, col, { align: 'right' });
      if (ref && st[k] !== ref[k]) Font.draw(g, (st[k] > ref[k] ? '+' : '') + (st[k] - ref[k]), x + 96, yy, col, { align: 'right' });
    });
  }
};

// Formation tent: choose the four who fight ------------------------------------------------------------------------
class CampFormationScene {
  constructor() {
    this.closed = false; this.msg = 'Z: move between front and reserve.  X: done.';
    this.menu = new MenuList(G.party.members.map(m => ({ label: m.name, id: m })), { x: 10, y: 34, w: 96, rows: 9, lineH: 11 });
  }
  update() {
    this.menu.update();
    if (this.menu.cancelled) { this.closed = true; Engine.pop(); return; }
    if (this.menu.chosen) {
      const m = this.menu.chosen.id, P = G.party;
      if (P.active.includes(m)) {
        if (P.active.length <= 1) { this.msg = 'Someone has to fight.'; Audio.sfx('buzz'); return; }
        if (P.isLeader(m)) { this.msg = m.name + ' leads the party and stays in front.'; Audio.sfx('buzz'); return; }
        P.active = P.active.filter(x => x !== m); P.reserve.unshift(m); Audio.sfx('cancel'); this.msg = m.name + ' falls back to the reserve.';
      } else {
        if (P.active.length >= 4) { this.msg = 'The front rank is full - stand someone down first.'; Audio.sfx('buzz'); return; }
        if (Camp.isTraining(m.id)) { this.msg = m.name + ' is out training. Wait for them to come back.'; Audio.sfx('buzz'); return; }
        P.reserve = P.reserve.filter(x => x !== m); P.active.push(m); Audio.sfx('confirm'); this.msg = m.name + ' joins the front rank.';
      }
    }
  }
  draw(g) {
    Camp.drawHeader(g, 'Formation Tent', 'X: leave');
    UI.window(g, 4, 20, 108, 112);
    Font.draw(g, 'Party', 10, 24, '#a0c0ff'); this.menu.draw(g);
    // mark who is in front
    G.party.members.forEach((m, i) => { if (i >= 10) return; const front = G.party.active.includes(m); Font.draw(g, front ? 'FRONT' : '', 104, 34 + i * 11, '#ffe080', { align: 'right' }); });
    const cur = this.menu.current && this.menu.current.id;
    UI.window(g, 116, 20, 120, 112);
    if (cur) {
      const st = cur.stats();
      Font.draw(g, Font.fit(cur.name + ' Lv' + cur.level, 112), 122, 24, '#ffe080');
      Font.draw(g, Font.fit(cur.className(), 112), 122, 34, '#c0d0ff');
      Camp.drawStats(g, 122, 48, st, null);
      Font.draw(g, 'Djinn ' + cur.djinn.length, 122, 112, '#a0c0ff');
      Font.draw(g, cur.djinn.map(d => 'EWFA'[DJINN[d.name].el]).join(''), 122, 122, '#e0e8ff');
    }
    UI.window(g, 2, 136, SCREEN_W - 4, 20); Font.draw(g, Font.fit(this.msg, 224), 8, 142, '#ffffff');
  }
}

// Djinn tent: try Djinn on an Adept and watch the class change -----------------------------------------------------
class CampClassScene {
  constructor() {
    this.closed = false; this.page = 'pick'; this.msg = 'Choose an Adept to work with.';
    this.charMenu = new MenuList(G.party.members.map(m => ({ label: m.name, id: m })), { x: 10, y: 34, w: 96, rows: 9, lineH: 11 });
  }
  openFor(m) {
    this.ch = m; this.page = 'edit';
    this.base = m.djinn.map(d => d.name);          // what they started with, for comparison
    this.held = this.base.slice();                  // the set being tried
    this.rebuild();
    this.msg = 'Z: take a Djinni for ' + m.name + '.  C: best set.  X: back.';
  }
  // the pool is every Djinni in the party; ones held by others are marked
  rebuild() {
    const pool = Camp.pool().flat();
    const items = pool.map(p => {
      const mine = this.held.includes(p.name);
      const el = 'EWFA'[DJINN[p.name].el];
      return { label: (mine ? '* ' : '  ') + p.name, id: p.name, right: el + (p.owner === this.ch ? '' : ' ' + p.owner.name.slice(0, 4)), color: tint(ELCOLOR[DJINN[p.name].el], 0.3) };
    });
    const idx = this.list ? this.list.idx : 0;
    this.list = new MenuList(items, { x: 8, y: 34, w: 104, rows: 9, lineH: 11 });
    this.list.idx = Math.min(idx, Math.max(0, items.length - 1)); this.list.fixScroll();
  }
  update() {
    if (this.page === 'pick') {
      this.charMenu.update();
      if (this.charMenu.cancelled) { this.closed = true; Engine.pop(); return; }
      if (this.charMenu.chosen) this.openFor(this.charMenu.chosen.id);
      return;
    }
    // C suggests the strongest set this Adept could hold from the party's pool
    if (Input.pressed('r')) { this.suggest(); return; }
    this.list.update();
    if (this.list.cancelled) {
      if (this.changed()) this.msg = this.ch.name + ' is now a ' + this.ch.className() + '.';
      this.page = 'pick'; return;
    }
    if (this.list.chosen) { this.take(this.list.chosen.id); this.rebuild(); }
  }
  // Put a Djinni straight onto this Adept: it leaves whoever was holding it there and then. If this Adept already
  // carries nine, the two trade - the old holder gets one back, so nobody is left standing empty-handed.
  take(name) {
    const me = this.ch, from = G.party.members.find(m => m.djinn.some(d => d.name === name));
    if (from === me) {                                            // pressing one of their own hands it on
      const home = this.homeFor(name, me);
      if (!home) { this.msg = 'Nobody else has room for ' + name + '.'; Audio.sfx('buzz'); return; }
      me.removeDjinn(name); home.setDjinn(name);
      this.msg = name + ' passed to ' + home.name + '.'; Audio.sfx('cancel');
    } else {
      let trade = null;
      if (me.djinn.length >= 9) {
        // full, so the two trade - give back whichever of theirs this Adept can most afford to lose, judged the same
        // way the tent judges everything else: what the set is worth with it gone
        const held = me.djinn.map(d => d.name); let best = null;
        for (const n of held) {
          const set = held.filter(x => x !== n).concat(name);
          const pv = Camp.preview(me, set);
          const v = pv.stats.hp * 0.45 + pv.stats.atk * 1.3 + pv.stats.def * 1.1 + pv.stats.agi * 0.5 + pv.stats.pp * 0.45 + pv.psy.length * 10;
          if (!best || v > best.v) best = { v, n };
        }
        trade = best && me.djinn.find(d => d.name === best.n);
        if (!trade) { this.msg = 'Nine Djinn is all anyone can carry.'; Audio.sfx('buzz'); return; }
      }
      if (from) from.removeDjinn(name);
      if (trade) me.removeDjinn(trade.name);
      me.setDjinn(name);
      if (trade) { const back = from || this.homeFor(trade.name, me); if (back) back.setDjinn(trade.name); else me.setDjinn(trade.name); }
      this.msg = trade ? me.name + ' traded ' + trade.name + ' for ' + name + (from ? ' with ' + from.name : '') + '.'
        : from ? 'Took ' + name + ' from ' + from.name + '.' : me.name + ' takes ' + name + '.';
      Audio.sfx('confirm');
    }
    this.held = me.djinn.map(d => d.name);
    this.clampVitals();
  }
  // whoever can best look after a Djinni nobody wants: same element first, then whoever carries least
  homeFor(name, notMe) {
    return G.party.members.filter(m => m !== notMe && m.djinn.length < 9)
      .sort((a, b) => (a.el === DJINN[name].el ? 0 : 1) - (b.el === DJINN[name].el ? 0 : 1) || a.djinn.length - b.djinn.length)[0];
  }
  clampVitals() { for (const m of G.party.members) { const st = m.stats(); if (m.hp > st.hp) m.hp = st.hp; if (m.pp > st.pp) m.pp = st.pp; } }
  changed() { const a = this.base.slice().sort().join(), b = this.held.slice().sort().join(); return a !== b; }
  suggest() {
    // try every composition of the available pool and keep the best for this Adept
    const pool = Camp.pool().flat().map(p => p.name);
    const byEl = [[], [], [], []]; for (const n of pool) byEl[DJINN[n].el].push(n);
    let best = null;
    for (let a = 0; a <= Math.min(9, byEl[0].length); a++) for (let b = 0; a + b <= 9 && b <= byEl[1].length; b++)
      for (let c = 0; a + b + c <= 9 && c <= byEl[2].length; c++) for (let d = 0; a + b + c + d <= 9 && d <= byEl[3].length; d++) {
        const set = [...byEl[0].slice(0, a), ...byEl[1].slice(0, b), ...byEl[2].slice(0, c), ...byEl[3].slice(0, d)];
        const pv = Camp.preview(this.ch, set);
        const v = pv.stats.hp * 0.45 + pv.stats.atk * 1.3 + pv.stats.def * 1.1 + pv.stats.agi * 0.5 + pv.stats.pp * 0.45 + pv.psy.length * 10;
        if (!best || v > best.v) best = { v, set, cls: pv.cls };
      }
    if (best) { this.applySet(best.set); this.rebuild(); Audio.sfx('confirm'); this.msg = 'Best set found: ' + best.cls + '.'; }
  }
  // hand this Adept a whole set at once: anything held elsewhere changes hands, the rest goes back to the party
  applySet(want) {
    // first hand back what this Adept no longer wants, to whoever has room
    for (const n of this.ch.djinn.map(d => d.name)) {
      if (want.includes(n)) continue;
      this.ch.removeDjinn(n);
      const home = this.homeFor(n, this.ch);
      if (home) home.setDjinn(n); else this.ch.setDjinn(n);
    }
    // then take what is wanted from wherever it sits
    for (const n of want) {
      if (this.ch.djinn.some(d => d.name === n)) continue;
      const from = G.party.members.find(m => m.djinn.some(d => d.name === n));
      if (from) from.removeDjinn(n);
      this.ch.setDjinn(n);
    }
    this.held = this.ch.djinn.map(d => d.name);
    this.clampVitals();
    Audio.sfx('levelup');
  }
  draw(g) {
    if (this.page === 'pick') {
      Camp.drawHeader(g, 'Djinn Tent', 'X: leave');
      UI.window(g, 4, 20, 108, 112); Font.draw(g, 'Adepts', 10, 24, '#a0c0ff'); this.charMenu.draw(g);
      const cur = this.charMenu.current && this.charMenu.current.id;
      UI.window(g, 116, 20, 120, 112);
      if (cur) { Font.draw(g, Font.fit(cur.name + ' Lv' + cur.level, 112), 122, 24, '#ffe080'); Font.draw(g, Font.fit(cur.className(), 112), 122, 34, '#c0d0ff'); Camp.drawStats(g, 122, 48, cur.stats(), null); Font.draw(g, 'Djinn ' + cur.djinn.map(d => 'EWFA'[DJINN[d.name].el]).join(''), 122, 116, '#e0e8ff'); }
      UI.window(g, 2, 136, SCREEN_W - 4, 20); Font.draw(g, Font.fit(this.msg, 224), 8, 142, '#ffffff');
      return;
    }
    const now = Camp.preview(this.ch, this.held), was = Camp.preview(this.ch, this.base);
    Camp.drawHeader(g, this.ch.name + ' - Djinn Tent', 'C: best  X: back');
    UI.window(g, 4, 20, 112, 116); Font.draw(g, 'Party Djinn (' + this.held.length + '/9)', 10, 24, '#a0c0ff'); this.list.draw(g);
    UI.window(g, 120, 20, 116, 116);
    Font.draw(g, was.cls === now.cls ? now.cls : was.cls + ' -> ' + now.cls, 126, 24, now.cls === was.cls ? '#c0d0ff' : '#ffe080');
    const lv = now.elLevels; Font.draw(g, 'E' + lv[0] + ' W' + lv[1] + ' F' + lv[2] + ' A' + lv[3], 126, 34, '#c0d0ff');
    Camp.drawStats(g, 126, 50, now.stats, was.stats);
    Font.draw(g, 'Psynergy ' + now.psy.length + (now.psy.length !== was.psy.length ? ' (' + (now.psy.length > was.psy.length ? '+' : '') + (now.psy.length - was.psy.length) + ')' : ''), 126, 114, Camp.colourFor(now.psy.length, was.psy.length));
    UI.window(g, 2, 138, SCREEN_W - 4, 18); Font.draw(g, Font.fit(this.msg, 224), 8, 143, '#ffffff');
  }
}

// Armoury tent: try gear and compare ------------------------------------------------------------------------------
class CampArmouryScene {
  constructor() {
    this.closed = false; this.page = 'pick'; this.slot = 'weapon'; this.msg = 'Choose an Adept to outfit.';
    this.charMenu = new MenuList(G.party.members.map(m => ({ label: m.name, id: m })), { x: 10, y: 34, w: 96, rows: 9, lineH: 11 });
  }
  openSlots(m) {
    this.ch = m; this.page = 'slot';
    this.slotMenu = new MenuList(EQUIP_SLOTS.map(s => ({ label: { weapon: 'Weapon', body: 'Body', arm: 'Arm', head: 'Head', acc: 'Extra' }[s], id: s, right: m.equip[s] || '---' })), { x: 10, y: 34, w: 100, rows: 5, lineH: 12 });
    this.msg = 'Which slot?';
  }
  openItems() {
    const m = this.ch, slot = this.slot;
    const owned = G.inventory.equipment().filter(st => m.slotFor(st.name) === slot && m.canEquip(st.name));
    const items = owned.map(st => ({ label: (ITEM_DB[st.name] && ITEM_DB[st.name].n) || st.name, id: st.name }));
    items.unshift({ label: '(nothing)', id: null });
    this.itemMenu = new MenuList(items, { x: 8, y: 34, w: 108, rows: 9, lineH: 11 });
    this.page = 'item'; this.msg = owned.length ? 'Z: put it on.  X: back.' : 'Nothing in the bags fits that slot.';
  }
  update() {
    if (this.page === 'pick') {
      this.charMenu.update();
      if (this.charMenu.cancelled) { this.closed = true; Engine.pop(); return; }
      if (this.charMenu.chosen) this.openSlots(this.charMenu.chosen.id);
      return;
    }
    if (this.page === 'slot') {
      this.slotMenu.update();
      if (this.slotMenu.cancelled) { this.page = 'pick'; return; }
      if (this.slotMenu.chosen) { this.slot = this.slotMenu.chosen.id; this.openItems(); }
      return;
    }
    this.itemMenu.update();
    if (this.itemMenu.cancelled) { this.openSlots(this.ch); return; }
    if (this.itemMenu.chosen) {
      const name = this.itemMenu.chosen.id; const cur = this.ch.equip[this.slot];
      if (cur && ITEM_DB[cur] && ITEM_DB[cur].cursed) { this.msg = "It's cursed - it won't come off."; Audio.sfx('buzz'); return; }
      if (cur) G.inventory.add(cur);
      if (name) G.inventory.remove(name);
      this.ch.equip[this.slot] = name;
      if (name && ITEM_DB[name].classItem) this.ch.classItem = ITEM_DB[name].classItem;
      else if (cur && ITEM_DB[cur] && ITEM_DB[cur].classItem) this.ch.classItem = null;
      const s = this.ch.stats(); if (this.ch.hp > s.hp) this.ch.hp = s.hp; if (this.ch.pp > s.pp) this.ch.pp = s.pp;
      Audio.sfx('item'); this.msg = this.ch.name + ' equips ' + (name || 'nothing') + '.';
      this.openItems();
    }
  }
  draw(g) {
    if (this.page === 'pick') {
      Camp.drawHeader(g, 'Armoury Tent', 'X: leave');
      UI.window(g, 4, 20, 108, 112); Font.draw(g, 'Adepts', 10, 24, '#a0c0ff'); this.charMenu.draw(g);
      const cur = this.charMenu.current && this.charMenu.current.id;
      UI.window(g, 116, 20, 120, 112);
      if (cur) { Font.draw(g, Font.fit(cur.name + ' Lv' + cur.level, 112), 122, 24, '#ffe080'); Camp.drawStats(g, 122, 44, cur.stats(), null); EQUIP_SLOTS.forEach((s, i) => Font.draw(g, Font.fit(cur.equip[s] || '---', 112), 122, 106 + i * 0, '#c0d0ff')); }
      UI.window(g, 2, 136, SCREEN_W - 4, 20); Font.draw(g, Font.fit(this.msg, 224), 8, 142, '#ffffff');
      return;
    }
    Camp.drawHeader(g, this.ch.name + ' - Armoury', 'X: back');
    if (this.page === 'slot') {
      UI.window(g, 4, 20, 112, 90); Font.draw(g, 'Slots', 10, 24, '#a0c0ff'); this.slotMenu.draw(g);
      UI.window(g, 120, 20, 116, 116); Camp.drawStats(g, 126, 34, this.ch.stats(), null, this.ch.className());
    } else {
      UI.window(g, 4, 20, 112, 116); Font.draw(g, 'Fits ' + this.slot, 10, 24, '#a0c0ff'); this.itemMenu.draw(g);
      const pick = this.itemMenu.current ? this.itemMenu.current.id : undefined;
      const now = Camp.previewEquip(this.ch, this.slot, pick === undefined ? this.ch.equip[this.slot] : pick);
      const was = this.ch.stats();
      UI.window(g, 120, 20, 116, 116);
      Font.draw(g, Font.fit(now.cls, 112), 126, 24, '#ffe080');
      Font.draw(g, 'now: ' + Font.fit(this.ch.equip[this.slot] || '---', 80), 126, 34, '#c0d0ff');
      Camp.drawStats(g, 126, 50, now.stats, was);
      // how the others would do with the same piece
      if (pick) { const others = G.party.members.filter(m => m !== this.ch && m.canEquip(pick) && m.slotFor(pick) === this.slot).slice(0, 3); others.forEach((m, i) => { const p = Camp.previewEquip(m, this.slot, pick); const d = p.stats.atk - m.stats().atk + p.stats.def - m.stats().def; Font.draw(g, Font.fit(m.name + ' ' + (d >= 0 ? '+' : '') + d, 108), 126, 112 + i * 8, d > 0 ? '#80ff80' : '#8090b0'); }); }
    }
    UI.window(g, 2, 138, SCREEN_W - 4, 18); Font.draw(g, Font.fit(this.msg, 224), 8, 143, '#ffffff');
  }
}

// Training tent: send the idle half out to catch up ----------------------------------------------------------------
class CampTrainingScene {
  constructor() {
    this.closed = false; this.page = 'pick'; this.chosen = new Set();
    const t = G.get('training');
    this.msg = t && t.stepsLeft > 0 ? 'A party is already out on the plains.' : 'Z: pick who trains.  C: send them out.  X: leave.';
    this.menu = new MenuList(G.party.members.map(m => ({ label: m.name, id: m })), { x: 10, y: 34, w: 96, rows: 9, lineH: 11 });
  }
  cap() { return G.party.active.reduce((a, m) => Math.max(a, m.level), 1); }
  cost() { return this.chosen.size * 120; }
  update() {
    if (Input.pressed('r')) return this.send();
    this.menu.update();
    if (this.menu.cancelled) { this.closed = true; Engine.pop(); return; }
    if (this.menu.chosen) {
      const m = this.menu.chosen.id;
      if (G.party.active.includes(m)) { this.msg = m.name + ' is needed in the front rank.'; Audio.sfx('buzz'); return; }
      if (m.level >= this.cap()) { this.msg = m.name + ' has nothing left to learn from training.'; Audio.sfx('buzz'); return; }
      if (this.chosen.has(m)) this.chosen.delete(m); else this.chosen.add(m);
      Audio.sfx('cursor');
    }
  }
  send() {
    if (!this.chosen.size) { this.msg = 'Pick who should go first.'; Audio.sfx('buzz'); return; }
    const c = this.cost();
    if (G.party.coins < c) { this.msg = 'Supplies for the trip cost ' + c + ' coins.'; Audio.sfx('buzz'); return; }
    G.party.coins -= c;
    const ids = [...this.chosen].map(m => m.id); const startLv = {}; for (const m of this.chosen) startLv[m.id] = m.level;
    G.set('training', {
      ids, startLv, steps: 0, stepsLeft: 600, cap: this.cap(), t: 0,
      // they set off from the camp and walk the plains around it until the trip is done
      walkers: ids.map(id => ({ id, x: Camp.WORLD.x, y: Camp.WORLD.y, dir: DIR.DOWN }))
    });
    Audio.sfx('confirm');
    // they walk out of the camp there and then
    if (G.field && G.mapId === 'camp') G.field.refreshNpcs();
    this.msg = [...this.chosen].map(m => m.name).join(', ') + ' set out to train.';
    this.chosen = new Set();
  }
  draw(g) {
    Camp.drawHeader(g, 'Training Tent', 'C: send  X: leave');
    UI.window(g, 4, 20, 108, 112); Font.draw(g, 'Reserve', 10, 24, '#a0c0ff'); this.menu.draw(g);
    G.party.members.forEach((m, i) => { if (i >= 10) return; const mark = this.chosen.has(m) ? 'GO' : G.party.active.includes(m) ? 'front' : ''; Font.draw(g, mark, 104, 34 + i * 11, mark === 'GO' ? '#ffe080' : '#8090b0', { align: 'right' }); });
    UI.window(g, 116, 20, 120, 112);
    const t = G.get('training');
    Font.draw(g, 'Training cap  Lv' + this.cap(), 122, 24, '#a0c0ff');
    Font.draw(g, 'Cost  ' + this.cost() + ' coins', 122, 34, G.party.coins >= this.cost() ? '#ffffff' : '#ff8080');
    Font.draw(g, 'Coins ' + G.party.coins, 122, 44, '#ffffff');
    if (t && t.stepsLeft > 0) {
      Font.draw(g, 'Out now:', 122, 62, '#a0c0ff');
      t.ids.forEach((id, i) => { const m = G.party.get(id); if (m) Font.draw(g, Font.fit(m.name + ' Lv' + m.level, 108), 122, 72 + i * 10, '#e0e8ff'); });
      Font.draw(g, 'Back in ' + t.stepsLeft + ' paces', 122, 118, '#c0d0ff');
    } else {
      Font.wrap('Adepts sent out walk the plains by the camp, and return when the trip is done. They cannot pass the level of your strongest fighter.', 108).slice(0, 5).forEach((l, i) => Font.draw(g, l, 122, 64 + i * 10, '#c0d0ff'));
    }
    UI.window(g, 2, 136, SCREEN_W - 4, 20); Font.draw(g, Font.fit(this.msg, 224), 8, 142, '#ffffff');
  }
}

// Summon circle: choose the summon each Adept calls on when their gauge fills -------------------------------------
class CampSummonScene {
  constructor() {
    this.closed = false; this.page = 'pick'; this.msg = 'Choose an Adept.';
    this.charMenu = new MenuList(G.party.members.map(m => ({ label: m.name, id: m })), { x: 10, y: 34, w: 96, rows: 9, lineH: 11 });
  }
  openFor(m) {
    this.ch = m; m.validateSummon();
    const av = m.availableSummons();
    this.list = new MenuList(av.map(s => ({ label: (m.summon === s ? '* ' : '  ') + s, id: s, right: SUMMONS[s].req.map((r, i) => r ? r + 'EWFA'[i] : '').join(''), color: tint(ELCOLOR[SUMMONS[s].el], 0.3) })), { x: 8, y: 34, w: 108, rows: 9, lineH: 11 });
    this.page = 'edit';
    this.msg = av.length ? 'Z: set as ' + m.name + "'s summon.  X: back." : m.name + "'s Djinn cannot power any summon yet.";
  }
  update() {
    if (this.page === 'pick') {
      this.charMenu.update();
      if (this.charMenu.cancelled) { this.closed = true; Engine.pop(); return; }
      if (this.charMenu.chosen) this.openFor(this.charMenu.chosen.id);
      return;
    }
    this.list.update();
    if (this.list.cancelled) { this.page = 'pick'; return; }
    if (this.list.chosen) {
      const s = this.list.chosen.id;
      if (this.ch.chooseSummon(s)) { Audio.sfx('summon'); this.msg = this.ch.name + ' will call on ' + s + '.'; this.openFor(this.ch); }
      else { Audio.sfx('buzz'); this.msg = this.ch.name + "'s Djinn cannot power that."; }
    }
  }
  draw(g) {
    if (this.page === 'pick') {
      Camp.drawHeader(g, 'Summon Circle', 'X: leave');
      UI.window(g, 4, 20, 108, 112); Font.draw(g, 'Adepts', 10, 24, '#a0c0ff'); this.charMenu.draw(g);
      const cur = this.charMenu.current && this.charMenu.current.id;
      UI.window(g, 116, 20, 120, 112);
      if (cur) {
        Font.draw(g, Font.fit(cur.name + ' Lv' + cur.level, 112), 122, 24, '#ffe080');
        Font.draw(g, Font.fit(cur.className(), 112), 122, 34, '#c0d0ff');
        Font.draw(g, 'Djinn ' + cur.djinn.map(d => 'EWFA'[DJINN[d.name].el]).join(''), 122, 48, '#e0e8ff');
        Font.draw(g, cur.summon ? 'Summon: ' + cur.summon : 'No summon', 122, 62, cur.summon ? '#ffe080' : '#8090b0');
        Font.draw(g, 'Gauge', 122, 76, '#a0c0ff'); UI.gauge(g, 160, 76, 68, 7, (cur.limit || 0) / 100, Engine.frame);
        Font.wrap('The gauge fills as they take punishment. When it is full, Summon is theirs to spend.', 108).slice(0, 4).forEach((l, i) => Font.draw(g, l, 122, 92 + i * 10, '#c0d0ff'));
      }
      UI.window(g, 2, 136, SCREEN_W - 4, 20); Font.draw(g, Font.fit(this.msg, 224), 8, 142, '#ffffff');
      return;
    }
    Camp.drawHeader(g, this.ch.name + ' - Summon Circle', 'X: back');
    UI.window(g, 4, 20, 112, 116); Font.draw(g, 'Can call on', 10, 24, '#a0c0ff'); this.list.draw(g);
    UI.window(g, 120, 20, 116, 116);
    const cur = this.list.current && this.list.current.id;
    if (cur) {
      const S = SUMMONS[cur];
      Font.draw(g, cur, 126, 24, tint(ELCOLOR[S.el], 0.4));
      Font.draw(g, 'Needs ' + S.req.map((r, i) => r ? r + ' ' + ELNAME[i] : '').filter(Boolean).join(', '), 126, 36, '#c0d0ff');
      Font.wrap(S.desc, 104).slice(0, 3).forEach((l, i) => Font.draw(g, l, 126, 50 + i * 10, '#e0e8ff'));
      if (!S.heal) { Font.draw(g, 'Power ' + S.base, 126, 86, '#a0c0ff'); Font.draw(g, '+' + S.hpPct + '% of foe HP', 126, 96, '#a0c0ff'); }
      else { Font.draw(g, 'Restores the party', 126, 86, '#a0c0ff'); }
    }
    Font.draw(g, this.ch.summon ? 'Chosen: ' + this.ch.summon : 'None chosen', 126, 104, '#ffe080');
    Font.draw(g, 'Gauge', 126, 118, '#a0c0ff'); UI.gauge(g, 164, 118, 64, 7, (this.ch.limit || 0) / 100, Engine.frame);
    UI.window(g, 2, 138, SCREEN_W - 4, 18); Font.draw(g, Font.fit(this.msg, 224), 8, 143, '#ffffff');
  }
}
