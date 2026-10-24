// ---------- Save slots ----------
// Three slots plus the autosave. Saving and loading share one screen: each row says who is leading, where they are,
// how long the journey has taken and when it was written, so overwriting the wrong file takes real effort.
'use strict';

const SaveSlots = {
  COUNT: 3,
  key(i) { return 'goldensun_complete_save' + i; },          // 1..3
  autoKey: 'goldensun_complete_autosave',
  // the single-file save the game used before slots existed becomes slot 1
  migrate() {
    const old = localStorage.getItem('goldensun_complete_save');
    if (old && !localStorage.getItem(this.key(1))) { try { localStorage.setItem(this.key(1), old); } catch (e) { } }
    if (old) { try { localStorage.removeItem('goldensun_complete_save'); } catch (e) { } }
  },
  read(k) { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
  slot(i) { return this.read(this.key(i)); },
  auto() { return this.read(this.autoKey); },
  any() { for (let i = 1; i <= this.COUNT; i++) if (localStorage.getItem(this.key(i))) return true; return !!localStorage.getItem(this.autoKey); },
  // the newest file of any kind, which is what Continue should open
  newest() {
    let best = null;
    for (let i = 1; i <= this.COUNT; i++) { const d = this.slot(i); if (d && (!best || (d.time || 0) > (best.time || 0))) best = d; }
    const a = this.auto(); if (a && (!best || (a.time || 0) > (best.time || 0))) best = a;
    return best;
  },
  // one line about a file, for the slot list
  describe(d) {
    if (!d) return null;
    const p = (d.party && d.party.members) || [];
    const lead = p[0] || {};
    const pt = d.playtime || 0, h = Math.floor(pt / 216000), mm = Math.floor(pt / 3600) % 60;
    const place = (MAPS[d.mapId] && MAPS[d.mapId].name) || d.mapId || '?';
    const when = d.time ? new Date(d.time) : null;
    return {
      who: (CHARACTERS[lead.id] ? CHARACTERS[lead.id].name : lead.id || '?') + ' Lv' + (lead.level || 1),
      party: p.length, place, time: h + ':' + pad(mm, 2, '0'),
      when: when ? (pad(when.getDate(), 2, '0') + '/' + pad(when.getMonth() + 1, 2, '0') + ' ' + pad(when.getHours(), 2, '0') + ':' + pad(when.getMinutes(), 2, '0')) : '',
      djinn: (d.party && d.party.members) ? d.party.members.reduce((a, m) => a + ((m.djinn || []).length), 0) : 0
    };
  }
};

// mode 'save' writes the current game into the chosen slot; mode 'load' opens the chosen file
class SaveSlotScene {
  constructor(field, mode, onDone) {
    this.field = field; this.mode = mode || 'load'; this.onDone = onDone; this.closed = false; this.msg = '';
    SaveSlots.migrate();
    const items = [];
    for (let i = 1; i <= SaveSlots.COUNT; i++) items.push({ label: 'File ' + i, id: i });
    if (this.mode === 'load' && SaveSlots.auto()) items.push({ label: 'Autosave', id: 'auto' });
    this.menu = new MenuList(items, { x: 14, y: 40, w: 84, rows: 4, lineH: 26 });
    this.confirm = null;
    if (this.mode === 'load' && !field) { this.wasPlaying = Audio.playing; Audio.play('loadscreen'); }
  }
  // read each file once when the screen opens: parsing four saves every frame is how a menu starts to crawl
  refresh() { this.cache = {}; for (const it of this.menu.items) this.cache[it.id] = it.id === 'auto' ? SaveSlots.auto() : SaveSlots.slot(it.id); }
  dataFor(id) { if (!this.cache) this.refresh(); return this.cache[id] || null; }
  update() {
    if (this.confirm) {
      this.confirm.update();
      if (this.confirm.cancelled) { this.confirm = null; return; }
      if (this.confirm.chosen) {
        const yes = this.confirm.chosen.id === 'yes'; const id = this.confirm.id; this.confirm = null;
        if (yes) this.act(id);
      }
      return;
    }
    this.menu.update();
    if (this.menu.cancelled) { this.close(false); return; }
    if (this.menu.chosen) {
      const id = this.menu.chosen.id, has = !!this.dataFor(id);
      if (this.mode === 'load' && !has) { this.msg = 'That file is empty.'; Audio.sfx('buzz'); return; }
      if (this.mode === 'save' && has) { this.confirm = new MenuList([{ label: 'Overwrite', id: 'yes' }, { label: 'Keep it', id: 'no' }], { x: 150, y: 120, w: 76, rows: 2 }); this.confirm.id = id; return; }
      this.act(id);
    }
  }
  act(id) {
    if (this.mode === 'save') {
      const ok = SaveSystem.save(this.field, id);
      this.cache = null;
      Audio.sfx(ok ? 'save' : 'buzz');
      this.msg = ok ? 'Saved to File ' + id + '.' : 'Could not write that file.';
      this.close(ok);
      return;
    }
    const d = this.dataFor(id); if (!d) return;
    Audio.sfx('confirm'); this.close(true, d);
  }
  close(done, data) {
    this.closed = true; Engine.pop();
    if (this.wasPlaying && !(done && data)) Audio.play(this.wasPlaying);
    if (this.onDone) this.onDone(done, data);
  }
  draw(g) {
    if (this.mode === 'load') { g.fillStyle = '#101018'; g.fillRect(0, 0, SCREEN_W, SCREEN_H); }
    UI.window(g, 2, 2, SCREEN_W - 4, 16);
    Font.draw(g, this.mode === 'save' ? 'Save your journey' : 'Load a journey', 8, 6, '#ffe080');
    Font.draw(g, 'X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });
    this.menu.items.forEach((it, i) => {
      const y = 22 + i * 32, on = i === this.menu.idx;
      UI.window(g, 4, y, SCREEN_W - 8, 30, on ? { c0: '#3060c0', c1: '#204090' } : undefined);
      Font.draw(g, it.label, 10, y + 4, on ? '#ffe080' : '#c0d0ff');
      const d = this.describe(it.id);
      if (!d) { Font.draw(g, 'Empty', 10, y + 16, '#60708c'); return; }
      Font.draw(g, d.who, 62, y + 4, '#ffffff');
      Font.draw(g, d.when, SCREEN_W - 10, y + 4, '#8090b0', { align: 'right' });
      Font.draw(g, Font.fit(d.place, 96), 10, y + 16, '#e0e8ff');
      Font.draw(g, d.party + ' Adepts  ' + d.djinn + ' Djinn', 110, y + 16, '#a0c0ff');
      Font.draw(g, d.time, SCREEN_W - 10, y + 16, '#ffffff', { align: 'right' });
    });
    if (this.confirm) { UI.window(g, 146, 114, 84, 30); this.confirm.draw(g); }
    if (this.msg) { UI.window(g, 2, SCREEN_H - 16, SCREEN_W - 4, 14); Font.draw(g, this.msg, 8, SCREEN_H - 13, '#ffffff'); }
  }
  describe(id) { return SaveSlots.describe(this.dataFor(id)); }
}
