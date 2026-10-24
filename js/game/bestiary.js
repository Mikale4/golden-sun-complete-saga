// ---------- Bestiary ----------
// Every enemy in the game already carries its own numbers - what it hits for, what it shrugs off, what it drops.
// This writes down whatever you have actually met, so the elemental maths that the fights are built on is something
// you can read rather than guess at.
'use strict';

const Bestiary = {
  // G.bestiary: name -> { seen, killed }
  rec(name) { if (!G.bestiary) G.bestiary = {}; return (G.bestiary[name] = G.bestiary[name] || { seen: 0, killed: 0 }); },
  see(name) { if (!ENEMY_DB[name]) return; this.rec(name).seen++; },
  kill(name) { if (!ENEMY_DB[name]) { if (ENEMY_DB[name + ' II']) name = name + ' II'; else return; } this.rec(name).killed++; },   /* the display name drops the ' II': the row is found either way */
  known(name) { return !!(G.bestiary && G.bestiary[name]); },
  // display names drop the overworld " II" suffix, so both variants count as the one creature
  base(name) { return name.replace(/ II$/, ''); },
  list() {
    const out = [];
    for (const n of Object.keys(ENEMY_DB)) if (this.known(n)) out.push(n);
    return out.sort((a, b) => (ENEMY_DB[a].hp || 0) - (ENEMY_DB[b].hp || 0));
  },
  total() { return Object.keys(ENEMY_DB).length; },
  // which element it fears most: the lowest resistance, and only if it is a real weakness
  weakness(e) {
    const rs = e.rs || [100, 100, 100, 100];
    let lo = 0; for (let i = 1; i < 4; i++) if (rs[i] < rs[lo]) lo = i;
    return rs[lo] < 100 ? lo : -1;
  }
};

class BestiaryScene {
  constructor() {
    this.closed = false;
    const names = Bestiary.list();
    this.list = new MenuList(names.map(n => {
      const e = ENEMY_DB[n], w = Bestiary.weakness(e);
      return { label: Bestiary.base(n), id: n, right: String(e.hp), color: w >= 0 ? tint(ELCOLOR[w], 0.3) : '#ffffff' };
    }), { x: 8, y: 40, w: 104, rows: 10, lineH: 11 });
  }
  update() {
    this.list.update();
    if (this.list.cancelled) { this.closed = true; Engine.pop(); return; }
  }
  draw(g) {
    UI.window(g, 2, 2, SCREEN_W - 4, 16);
    Font.draw(g, 'Bestiary', 8, 6, '#ffe080');
    Font.draw(g, this.list.items.length + ' of ' + Bestiary.total() + ' recorded', 170, 6, '#c0d0ff', { align: 'right' });
    Font.draw(g, 'X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });
    UI.window(g, 4, 22, 112, 134);
    Font.draw(g, 'Met so far', 10, 26, '#a0c0ff'); Font.draw(g, 'HP', 110, 26, '#a0c0ff', { align: 'right' });
    this.list.draw(g);
    UI.window(g, 120, 22, 116, 134);
    const n = this.list.current && this.list.current.id;
    if (!n) { Font.draw(g, 'Nothing fought yet.', 126, 30, '#8090b0'); return; }
    const e = ENEMY_DB[n], r = (G.bestiary && G.bestiary[n]) || { seen: 0, killed: 0 };
    Font.draw(g, Font.fit(Bestiary.base(n), 108), 126, 26, '#ffe080');
    Font.draw(g, 'HP ' + e.hp, 126, 38, '#e0e8ff'); Font.draw(g, 'PP ' + (e.pp || 0), 190, 38, '#e0e8ff');
    Font.draw(g, 'Atk ' + e.atk, 126, 48, '#e0e8ff'); Font.draw(g, 'Def ' + e.def, 190, 48, '#e0e8ff');
    Font.draw(g, 'Agi ' + e.agi, 126, 58, '#e0e8ff'); Font.draw(g, 'Lck ' + (e.lck || 0), 190, 58, '#e0e8ff');
    // resistances, lowest first so the soft spot is obvious
    Font.draw(g, 'Resists', 126, 72, '#a0c0ff');
    const rs = e.rs || [100, 100, 100, 100], w = Bestiary.weakness(e);
    ['Venus', 'Merc', 'Mars', 'Jup'].forEach((el, i) => {
      const x = 126 + (i % 2) * 56, y = 82 + Math.floor(i / 2) * 10;
      Font.draw(g, el, x, y, i === w ? '#ff9090' : '#8090b0');
      Font.draw(g, String(rs[i]), x + 50, y, i === w ? '#ff9090' : '#ffffff', { align: 'right' });
    });
    if (w >= 0) Font.draw(g, 'Weak to ' + ['Venus', 'Mercury', 'Mars', 'Jupiter'][w], 126, 104, tint(ELCOLOR[w], 0.5));
    Font.draw(g, 'Exp ' + (e.exp || 0), 126, 118, '#e0e8ff');
    Font.draw(g, (e.c || 0) + ' coins', 190, 118, '#e0e8ff');
    if (e.dr && e.dr[0]) Font.draw(g, Font.fit('Drops ' + e.dr[0], 104), 126, 128, '#ffe080');
    Font.draw(g, 'Met ' + r.seen + '   Felled ' + r.killed, 126, 144, '#a0c0ff');
  }
}
