// ---------- Djinn compendium ----------
// Seventy-two of them are scattered across two continents, and the Anemos Sanctum only opens for a party carrying
// every one. A count in the corner of the menu is no help for that, so this is the checklist: what you hold, who is
// carrying it, and - for the ones still out there - where you last saw one, but only in places you have actually been.
'use strict';

const DjinnDex = {
  EL_NAMES: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
  // every Djinni still loose, and the map it sits on - looked up only among places the party has already walked
  locations() {
    const out = {};
    for (const id of Object.keys(G.visited || {})) {
      let M; try { M = buildMap(id); } catch (e) { continue; }
      for (const o of M.objects) if (o.kind === 'djinni' && o.name && !o.gone) out[o.name] = M.name || id;
    }
    return out;
  },
  holder(name) { for (const m of G.party.members) if (m.djinn.some(d => d.name === name)) return m; return null; },
  found(name) { return (G.party.djinnFound || []).includes(name); },
  ofElement(el) { return Object.keys(DJINN).filter(n => DJINN[n].el === el); },
  tally() { const all = Object.keys(DJINN); return { have: all.filter(n => this.found(n)).length, total: all.length }; }
};

class DjinnDexScene {
  constructor() {
    this.closed = false; this.el = 0; this.where = DjinnDex.locations();
    this.build();
  }
  build() {
    const names = DjinnDex.ofElement(this.el);
    const items = names.map(n => {
      const have = DjinnDex.found(n), who = have ? DjinnDex.holder(n) : null;
      return {
        label: (have ? '* ' : '  ') + n, id: n,
        right: have ? (who ? who.name.slice(0, 5) : 'set') : '- -',
        color: have ? tint(ELCOLOR[this.el], 0.35) : '#60708c'
      };
    });
    const idx = this.list ? Math.min(this.list.idx, items.length - 1) : 0;
    this.list = new MenuList(items, { x: 8, y: 52, w: 106, rows: 9, lineH: 11 });
    this.list.idx = Math.max(0, idx); this.list.fixScroll();
  }
  update() {
    if (Input.pressed('left')) { this.el = (this.el + 3) % 4; this.build(); Audio.sfx('cursor'); return; }
    if (Input.pressed('right')) { this.el = (this.el + 1) % 4; this.build(); Audio.sfx('cursor'); return; }
    this.list.update();
    if (this.list.cancelled) { this.closed = true; Engine.pop(); return; }
    if (this.list.chosen) Audio.sfx('cursor');   // nothing to pick: this is a record, not a menu
  }
  draw(g) {
    const t = DjinnDex.tally();
    UI.window(g, 2, 2, SCREEN_W - 4, 16);
    Font.draw(g, 'Djinn Compendium', 8, 6, '#ffe080');
    Font.draw(g, t.have + ' / ' + t.total, 168, 6, t.have >= t.total ? '#80ff80' : '#ffffff', { align: 'right' });
    Font.draw(g, 'X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });
    // element tabs: arrows walk between them
    DjinnDex.EL_NAMES.forEach((nm, i) => {
      const x = 10 + i * 58, on = i === this.el;
      if (on) UI.panel(g, x - 6, 20, 56, 14);
      Font.draw(g, nm, x, 23, on ? tint(ELCOLOR[i], 0.5) : '#7080a0');
    });
    UI.window(g, 4, 38, 112, 118);
    const mine = DjinnDex.ofElement(this.el).filter(n => DjinnDex.found(n)).length, all = DjinnDex.ofElement(this.el).length;
    Font.draw(g, DjinnDex.EL_NAMES[this.el], 10, 42, '#a0c0ff');
    Font.draw(g, mine + '/' + all, 110, 42, mine >= all ? '#80ff80' : '#ffffff', { align: 'right' });
    this.list.draw(g);
    // the one under the cursor
    UI.window(g, 120, 38, 116, 118);
    const cur = this.list.current && this.list.current.id;
    if (cur) {
      const d = DJINN[cur], have = DjinnDex.found(cur), who = have ? DjinnDex.holder(cur) : null;
      Font.draw(g, cur, 126, 42, tint(ELCOLOR[d.el], 0.5));
      Font.draw(g, DjinnDex.EL_NAMES[d.el], 230, 42, '#8090b0', { align: 'right' });
      if (have) {
        Font.draw(g, who ? 'Carried by ' + who.name : 'In reserve', 126, 54, '#c0d0ff');
        const B = d.boost || [];
        const labels = ['HP', 'PP', 'Atk', 'Def', 'Agi', 'Lck'];
        let row = 0;
        labels.forEach((l, i) => { if (!B[i]) return; Font.draw(g, l + ' +' + B[i], 126 + (row % 2) * 56, 66 + Math.floor(row / 2) * 10, '#e0e8ff'); row++; });
        const y0 = 66 + Math.ceil(Math.max(1, row) / 2) * 10 + 4;
        Font.wrap(d.desc || '', 104).slice(0, 4).forEach((l, i) => Font.draw(g, l, 126, y0 + i * 10, '#ffffff'));
        Font.draw(g, 'Rests ' + djinnCooldown(cur) + ' turns', 126, 144, '#a0c0ff');
      } else {
        const seen = this.where[cur];
        Font.wrap(seen ? 'Still out there. You last passed one in ' + seen + '.' : 'Not found. Nowhere you have been so far.', 104)
          .slice(0, 4).forEach((l, i) => Font.draw(g, l, 126, 60 + i * 10, seen ? '#ffe080' : '#8090b0'));
      }
    }
  }
}
