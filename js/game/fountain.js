// ---------- Lucky Medal fountain minigame ----------
// Toss a Lucky Medal: a power meter swings back and forth; press confirm to throw. The medal arcs across the basin and
// lands in one of the rings - the closer to the centre, the better the prize (the centre holds the fountain's best gear).
'use strict';
// Prize pools follow the originals' fountains (Tolbi in Golden Sun, Lemuria in The Lost Age), ordered from the centre outward
const FOUNTAIN_PRIZES = {
  tolbi: { name: 'Tolbi Fountain', center: ['Kikuichimonji', "Asura's Armor", "Warrior's Helm"], inner: ['Silver Vest', 'Spirit Gloves', 'Ninja Garb', 'Lucky Cap', 'War Gloves'], middle: ['Water of Life', 'Psy Crystal', 'Lucky Pepper', 'Elixir'], outer: ['Nut', 'Vial'], short: ['Herb'] },
  // the guide's table for the spring (its rings: the bull's eye, 1st, 2nd, 3rd/4th, out); Eclipse comes once, on the first bull's eye
  lemuria: { name: 'Spring of Lemuria', center: ['Hestia Blade', 'Erebus Armor', 'Aegis Shield'], inner: ['Hestia Blade', 'Mighty Axe', 'Erebus Armor', 'Floral Dress', 'Aegis Shield', 'Minerva Helm'], middle: ['Hestia Blade', 'Mighty Axe', "Fireman's Pole", 'Erebus Armor', 'Floral Dress', 'Aegis Shield', "Leda's Bracelet", 'Minerva Helm', 'Crown of Glory'], outer: ['Hestia Blade', 'Erebus Armor', 'Floral Dress', 'Wild Coat', "Leda's Bracelet", 'Crafted Gloves', 'Brilliant Circlet', 'Minerva Helm', 'Water of Life', 'Potion', 'Psy Crystal'], short: ['Mighty Axe', "Fireman's Pole", 'Floral Dress', 'Wild Coat', 'Crafted Gloves', 'Minerva Helm', 'Crown of Glory', 'Brilliant Circlet', 'Water of Life', 'Potion', 'Psy Crystal'] }
};
class FountainScene {
  constructor(which) {
    this.transparent = false; this.closed = false; this.table = FOUNTAIN_PRIZES[which] || FOUNTAIN_PRIZES.tolbi; this.which = which;
    this.t = 0; this.phase = 'aim'; this.power = 0; this.thrown = 0; this.medal = null; this.result = null; this.prize = null; this.msg = 'Press Z to throw when the power is right!';
  }
  // the meter swings quickly; the centre needs a throw of 90+ and a little luck
  meter() { return 50 + 50 * Math.sin(this.t * 0.11); }
  update() {
    this.t++;
    if (this.phase === 'aim') { this.power = this.meter(); if (Input.pressed('b')) { this.closed = true; this.cancelled = true; Engine.pop(); return; } if (Input.pressed('a')) { this.thrown = clamp(this.power + (Math.random() * 12 - 6), 0, 100); this.phase = 'fly'; this.flyT = 0; Audio.sfx('cursor'); } return; }
    if (this.phase === 'fly') { this.flyT++; if (this.flyT >= 50) { this.phase = 'land'; this.landT = 0; Audio.sfx('water'); const p = this.thrown; this.result = p >= 90 ? 'center' : p >= 75 ? 'inner' : p >= 50 ? 'middle' : p >= 22 ? 'outer' : 'short'; this.prize = pick(this.table[this.result]); if (this.which === 'lemuria' && this.result === 'center' && !G.flag('eclipse_taken')) { this.prize = null; this.summonPrize = 'Eclipse'; } this.msg = { center: 'A perfect throw! The medal sinks into the heart of the fountain!', inner: 'The medal lands in the inner ring!', middle: 'The medal lands in the middle ring.', outer: 'The medal lands at the edge of the basin.', short: 'The medal falls short and clatters on the stone...' }[this.result]; } return; }
    if (this.phase === 'land') { this.landT++; if (this.landT > 20 && Input.pressed('a')) { this.closed = true; Engine.pop(); } }
  }
  // basin geometry: rings as ellipses centred on the fountain
  landingPos(p) { const cx = 120, cy = 62; const dist = (100 - p) / 100 * 58; return { x: cx, y: cy + dist }; }
  draw(g) {
    g.fillStyle = '#20304c'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const cx = 120, cy = 62;
    // stone rim and water rings (outer -> centre)
    Gfx.ellipse(g, cx, cy + 4, 78, 46, '#3a3a4a'); Gfx.ellipse(g, cx, cy, 76, 44, '#8a8aa0'); Gfx.ellipse(g, cx, cy, 70, 40, '#2c6ec0');
    Gfx.ellipse(g, cx, cy, 52, 30, '#3a86d8'); Gfx.ellipse(g, cx, cy, 34, 20, '#56a4ec'); Gfx.ellipse(g, cx, cy, 16, 9, '#a0d8ff');
    g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 10; i++) { const a = i * 0.63 + this.t * 0.03; g.fillRect(Math.round(cx + Math.cos(a) * 60), Math.round(cy + Math.sin(a) * 34), 2, 1); }
    // the statue in the middle
    Gfx.rect(g, cx - 3, cy - 14, 6, 10, '#c0c0d0'); Gfx.circle(g, cx, cy - 16, 3, '#d8d8e8'); Gfx.rect(g, cx - 6, cy - 4, 12, 3, '#9090a8');
    Font.draw(g, this.table.name, cx, 4, '#ffe080', { align: 'center' });
    Font.draw(g, 'Lucky Medals: ' + G.inventory.count('Lucky Medal'), 4, 4, '#ffffff');
    // the medal
    if (this.phase === 'fly' || this.phase === 'land') { const f = this.phase === 'fly' ? this.flyT / 50 : 1; const from = { x: cx, y: 150 }, to = this.landingPos(this.thrown); const x = from.x + (to.x - from.x) * f, y = from.y + (to.y - from.y) * f - Math.sin(f * Math.PI) * 40; const r = this.phase === 'fly' ? 3 + Math.sin(f * Math.PI) * 2 : 3; Gfx.circle(g, Math.round(x), Math.round(y), Math.round(r), '#ffd040'); Gfx.px(g, Math.round(x) - 1, Math.round(y) - 1, '#fff0a0'); }
    // power meter
    if (this.phase === 'aim') { UI.gauge(g, 40, 118, 160, 10, this.power / 100, this.t); g.fillStyle = '#ffe060'; g.fillRect(40 + Math.round(160 * 0.9), 116, 1, 14); Font.draw(g, 'Power', 40, 108, '#a0c0ff'); Font.draw(g, 'centre', 40 + 144, 108, '#ffe060'); }
    UI.window(g, 4, 134, 232, 22); Font.draw(g, Font.fit(this.msg, 220), 10, 140, '#ffffff');
    if (this.phase === 'land' && this.landT > 20) Font.draw(g, 'Z', 228, 148, '#ffe080', { align: 'right' });
  }
}
