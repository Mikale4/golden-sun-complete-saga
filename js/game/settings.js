// ---------- Settings ----------
// Only things that actually do something: sound, how fast text runs, the colour of every window in the game, whether
// the others trail behind you, and whether the game writes an autosave as you travel.
'use strict';

const WINDOW_SKINS = [
  { name: 'Weyard Blue', c0: '#2048b0', c1: '#102060', border: '#f0f0f8' },
  { name: 'Sanctum Green', c0: '#1f7a55', c1: '#0c3a2a', border: '#f0f8f0' },
  { name: 'Lighthouse Red', c0: '#a83030', c1: '#501414', border: '#f8f0f0' },
  { name: 'Lemurian Teal', c0: '#1d6f8c', c1: '#0b3444', border: '#eef8ff' },
  { name: 'Prox Violet', c0: '#5b3aa8', c1: '#2a1a58', border: '#f4f0ff' },
  { name: 'Slate', c0: '#404858', c1: '#1c2029', border: '#e8e8f0' }
];

const Settings = {
  KEY: 'goldensun_complete_settings',
  data: { music: 5, sfx: 5, textSpeed: 1, skin: 0, followers: true, autosave: true },
  load() {
    try { const s = localStorage.getItem(this.KEY); if (s) Object.assign(this.data, JSON.parse(s)); } catch (e) { }
    this.apply(); return this.data;
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { } },
  // push the values into the systems that use them
  apply() {
    const d = this.data;
    Audio.setVolumes(0.6 * (d.music / 10), 0.8 * (d.sfx / 10));
    UI.skin = WINDOW_SKINS[d.skin] || WINDOW_SKINS[0];
    if (G.field) { G.field.showFollowers = !!d.followers; if (!d.followers) G.field.followers.forEach(f => f.hidden = true); else G.field.rebuildFollowers(), G.field.gatherFollowers(); }
    this.save();
  },
  textChars() { return [0.5, 1, 2, Infinity][this.data.textSpeed] || 1; }   // characters typed per frame; Infinity = the page at once
};

class SettingsScene {
  constructor() {
    this.closed = false;
    this.rows = [
      { id: 'music', label: 'Music', get: () => Settings.data.music, set: (v) => Settings.data.music = clamp(v, 0, 10), show: (v) => v === 0 ? 'Off' : String(v) },
      { id: 'sfx', label: 'Sound', get: () => Settings.data.sfx, set: (v) => Settings.data.sfx = clamp(v, 0, 10), show: (v) => v === 0 ? 'Off' : String(v) },
      { id: 'textSpeed', label: 'Text speed', get: () => Settings.data.textSpeed, set: (v) => Settings.data.textSpeed = clamp(v, 0, 3), show: (v) => ['Slow', 'Normal', 'Fast', 'Instant'][v] },
      { id: 'skin', label: 'Window colour', get: () => Settings.data.skin, set: (v) => Settings.data.skin = (v + WINDOW_SKINS.length) % WINDOW_SKINS.length, show: (v) => WINDOW_SKINS[v].name, wrap: true },
      { id: 'followers', label: 'Party follows you', get: () => Settings.data.followers ? 1 : 0, set: (v) => Settings.data.followers = !!clamp(v, 0, 1), show: (v) => v ? 'Yes' : 'No' },
      { id: 'autosave', label: 'Autosave', get: () => Settings.data.autosave ? 1 : 0, set: (v) => Settings.data.autosave = !!clamp(v, 0, 1), show: (v) => v ? 'On' : 'Off' }
    ];
    this.menu = new MenuList(this.rows.map(r => ({ label: r.label, id: r })), { x: 14, y: 40, w: 200, rows: 6, lineH: 16 });
  }
  nudge(d) {
    const r = this.rows[this.menu.idx]; if (!r) return;
    r.set(r.get() + d); Settings.apply(); Audio.sfx('cursor');
  }
  update() {
    if (Input.pressed('left')) { this.nudge(-1); return; }
    if (Input.pressed('right')) { this.nudge(1); return; }
    this.menu.update();
    if (this.menu.cancelled) { Settings.save(); this.closed = true; Engine.pop(); return; }
    if (this.menu.chosen) this.nudge(1);
  }
  draw(g) {
    UI.window(g, 2, 2, SCREEN_W - 4, 16);
    Font.draw(g, 'Settings', 8, 6, '#ffe080');
    Font.draw(g, 'Arrows: change   X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });   /* the clock is on the foot line: play time to the second, and when the arena's shelf changes */
    UI.window(g, 4, 22, SCREEN_W - 8, 134);
    this.rows.forEach((r, i) => {
      const y = 34 + i * 18, on = i === this.menu.idx;
      Font.draw(g, r.label, 14, y, on ? '#ffe080' : '#c0d0ff');
      const v = r.get();
      Font.draw(g, '< ' + r.show(v) + ' >', SCREEN_W - 16, y, on ? '#ffffff' : '#90a0c0', { align: 'right' });
      if (on) UI.cursor(g, 6, y);
      if (r.id === 'music' || r.id === 'sfx') UI.bar(g, 120, y + 3, 60, 4, v / 10, '#60c0f0');
    });
    // the clock, as the originals kept it: the time played, to the second; and when the arena's shelf next changes
    const pt = G.playtime || 0; const hh = Math.floor(pt / 216000), mm = Math.floor(pt / 3600) % 60, ss = Math.floor(pt / 60) % 60;
    const clock = hh + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    Font.draw(g, 'Time ' + clock + (typeof ARENA !== 'undefined' ? '  Shelf ' + ARENA.minutesLeft() + 'm' : ''), 14, 146, '#c0d0ff');
    Font.draw(g, 'F: full  M: mute', SCREEN_W - 12, 146, '#8090b0', { align: 'right' });
  }
}
