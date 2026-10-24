// ---------- Field Psynergy animations ----------
// Each utility Psynergy shows its own effect on the map, the way the originals do: the ghostly hand of Move that
// shoves the pillar, the two hands of Lift and Carry that heave a boulder up, the orb of Force, the ice spikes of
// Frost, the vine of Growth, the cyclone of Whirlwind and Gale, the rain of Douse, Halt's open hand, Catch's
// reaching arm, Mind Read's rings, Cloak's shimmer, the falling fist of Pound, Lash's rope, Scoop's flying dirt,
// Tremor's dust, Burst's fireball, Grind's grinding disc, Hover's glow, the light of Teleport and Retreat, Parch's
// draining water, Blaze's flame, Sand's sinking. Anything else spins the element's sparks.
// FieldFX.draw(g, fx, cam) draws one frame; fx = { name, x, y (the target tile), t (frames so far), el, dir, cx, cy
// (the caster's tile) }; FieldFX.done(fx) says when it is over.
'use strict';
const FieldFX = {
  LEN: { Move: 30, Lift: 36, Carry: 36, Force: 26, Frost: 34, Growth: 36, Whirlwind: 36, Gale: 36, Cyclone: 40, Douse: 40, Halt: 28, Catch: 30, 'Mind Read': 36, Reveal: 20, Cloak: 30, Pound: 30, Lash: 30, Scoop: 30, Tremor: 36, Burst: 30, Grind: 36, Hover: 36, Teleport: 40, Retreat: 40, Parch: 36, Blaze: 30, Sand: 30, Ply: 36, 'Ply Well': 36, 'Pure Ply': 36, Wish: 36, 'Wish Well': 36, 'Pure Wish': 36, Cure: 36, 'Cure Well': 36, Potent: 36, Avoid: 30 },
  HAND: '#e8f0ff', HAND_D: '#88a8e0',
  done(fx) { return fx.t > (this.LEN[fx.name] || 24); },
  // a translucent hand, palm down, pointing the way it pushes (dir), drawn about (x, y)
  hand(g, x, y, dir, alpha) {
    g.save(); g.globalAlpha = alpha; g.translate(x, y); g.rotate([Math.PI / 2, Math.PI, 0, -Math.PI / 2][dir] || 0);
    g.fillStyle = this.HAND; g.fillRect(-5, -4, 8, 9); for (let i = 0; i < 4; i++) g.fillRect(-5 + i * 2.2, -8, 2, 5); g.fillRect(3, -3, 3, 5);
    g.fillStyle = this.HAND_D; g.fillRect(-5, 4, 8, 1); g.fillRect(-5, -8, 1, 13);
    g.restore();
  },
  draw(g, fx, cam) {
    const t = fx.t, n = this.LEN[fx.name] || 24, k = Math.min(1, t / n);
    const tx = fx.x * TILE - cam.x + 8, ty = fx.y * TILE - cam.y + 8;   // the target's centre
    const cx = (fx.cx !== undefined ? fx.cx : fx.x) * TILE - cam.x + 8, cy = (fx.cy !== undefined ? fx.cy : fx.y) * TILE - cam.y + 8;
    const d = fx.dir === undefined ? DIR.DOWN : fx.dir; const dx = DX[d], dy = DY[d];
    const spark = (x, y, r, col) => Gfx.circle(g, x, y, r, col);
    switch (fx.name) {
      case 'Move': { // the hand appears on the caster's side of the object and shoves it along
        const push = Math.min(1, Math.max(0, (t - 6) / 14)); const a = t < 6 ? t / 6 : t > n - 8 ? (n - t) / 8 : 1;
        this.hand(g, tx - dx * 10 + dx * 16 * push, ty - dy * 10 + dy * 16 * push, d, a * 0.9);
        if (t > 8 && t < 22) for (let i = 0; i < 3; i++) spark(tx + dx * (12 + i * 3) + (i - 1) * dy * 4, ty + dy * (12 + i * 3) + (i - 1) * dx * 4, 1, '#c0d8ff');
        return; }
      case 'Lift': case 'Carry': { // two hands under the stone heave it up out of the way
        const up = t < 10 ? 0 : Math.min(1, (t - 10) / 18); const a = t > n - 8 ? (n - t) / 8 : 1; const lift = up * 22;
        this.hand(g, tx - 9, ty + 4 - lift, DIR.UP, a * 0.9); this.hand(g, tx + 9, ty + 4 - lift, DIR.UP, a * 0.9);
        if (fx.name === 'Lift') { g.save(); g.globalAlpha = a * (1 - up * 0.7); Gfx.ellipse(g, tx, ty - lift, 7, 5, '#6a6a78'); Gfx.ellipse(g, tx - 2, ty - 2 - lift, 4, 3, '#8a8a98'); g.restore(); }
        return; }
      case 'Force': { // an orb from the caster's hands to the target, and the burst there
        if (t < 10) { const p = t / 10; spark(cx + (tx - cx) * p, cy + (ty - cy) * p - Math.sin(p * Math.PI) * 6, 4, '#c080ff'); spark(cx + (tx - cx) * p, cy + (ty - cy) * p - Math.sin(p * Math.PI) * 6, 2, '#f0e0ff'); return; }
        const r = (t - 10) * 1.6; g.save(); g.globalAlpha = Math.max(0, 1 - (t - 10) / 16); g.strokeStyle = '#d0a0ff'; g.lineWidth = 2; g.beginPath(); g.arc(tx, ty, r, 0, Math.PI * 2); g.stroke(); g.restore();
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.2; spark(tx + Math.cos(a) * r * 0.8, ty + Math.sin(a) * r * 0.8, 1.5, '#e0c0ff'); }
        return; }
      case 'Frost': { // ice spikes grow up out of the puddle
        const h = Math.min(1, t / 18) * 16; const a = t > n - 8 ? (n - t) / 8 : 1; g.save(); g.globalAlpha = a;
        for (let i = 0; i < 5; i++) { const x = tx - 6 + i * 3, hh = h * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7))); Gfx.tri(g, x - 2, ty + 7, x, ty + 7 - hh, x + 2, ty + 7, '#b8e8ff'); Gfx.line(g, x, ty + 7, x, ty + 7 - hh, '#e8f8ff'); }
        for (let i = 0; i < 4; i++) spark(tx + Math.sin(t * 0.4 + i * 2) * 9, ty - 4 - ((t * 0.7 + i * 5) % 16), 1, '#ffffff');
        g.restore(); return; }
      case 'Growth': { // a vine curls up out of the sprout, leaf by leaf
        const h = Math.min(1, t / 24) * 24; g.save(); g.globalAlpha = t > n - 8 ? (n - t) / 8 : 1;
        for (let s = 0; s < h; s += 2) { const x = tx + Math.sin(s * 0.5) * 3; Gfx.rect(g, x - 1, ty + 7 - s, 2, 2, '#48a040'); if (s % 6 === 0) { Gfx.ellipse(g, x + (s % 12 ? 4 : -4), ty + 7 - s, 3, 2, '#70d060'); } }
        g.restore(); return; }
      case 'Whirlwind': case 'Gale': case 'Cyclone': { // a cyclone spinning over the target (Cyclone: round the party)
        const ox = fx.name === 'Cyclone' ? cx : tx, oy = fx.name === 'Cyclone' ? cy : ty; const a = t < 6 ? t / 6 : t > n - 8 ? (n - t) / 8 : 1;
        g.save(); g.globalAlpha = a * 0.85;
        for (let i = 0; i < 6; i++) { const yy = oy + 8 - i * 4, w = 3 + i * 2.2, ph = t * 0.45 + i * 0.9; Gfx.ellipse(g, ox + Math.cos(ph) * 2, yy, w, 2, i % 2 ? '#d8f0f8' : '#a8d8e8'); }
        for (let i = 0; i < 5; i++) { const ph = t * 0.5 + i * 1.3, rr = 10 + (i % 3) * 3; spark(ox + Math.cos(ph) * rr, oy - 4 - i * 3 + Math.sin(ph) * 2, 1, '#ffffff'); }
        g.restore(); return; }
      case 'Douse': { // a small grey cloud over the target, and rain out of it
        const a = t < 6 ? t / 6 : t > n - 8 ? (n - t) / 8 : 1; g.save(); g.globalAlpha = a;
        Gfx.ellipse(g, tx, ty - 14, 9, 4, '#b0b8c8'); Gfx.ellipse(g, tx - 4, ty - 16, 5, 4, '#c8d0dc'); Gfx.ellipse(g, tx + 4, ty - 16, 6, 4, '#c8d0dc');
        if (t > 6) for (let i = 0; i < 8; i++) { const yy = ty - 10 + ((t * 2 + i * 7) % 20); Gfx.rect(g, tx - 7 + i * 2, yy, 1, 3, '#78b8f0'); }
        if (t > 12) Gfx.ellipse(g, tx, ty + 6, 6 + (t % 6), 2, 'rgba(120,184,240,0.5)');
        g.restore(); return; }
      case 'Halt': { // a great open hand held up before the target, and the ring of the command
        const a = t < 5 ? t / 5 : t > n - 10 ? (n - t) / 10 : 1; g.save(); g.globalAlpha = a; g.translate(tx, ty - 6); g.scale(1.6, 1.6); g.translate(-tx, -(ty - 6)); this.hand(g, tx, ty - 6, DIR.UP, 0.9); g.restore();
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n); g.strokeStyle = '#80b0ff'; g.lineWidth = 2; g.beginPath(); g.arc(tx, ty, 4 + t * 0.8, 0, Math.PI * 2); g.stroke(); g.restore(); return; }
      case 'Catch': { // an arm of light reaches from the caster to the target and draws back
        const p = t < 12 ? t / 12 : t < 18 ? 1 : Math.max(0, 1 - (t - 18) / 12); const ex = cx + (tx - cx) * p, ey = cy + (ty - cy) * p;
        g.save(); g.globalAlpha = 0.85; g.strokeStyle = this.HAND_D; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = this.HAND; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke(); g.restore();
        this.hand(g, ex, ey, d, 0.9); return; }
      case 'Mind Read': { // rings of thought widening from the one read
        g.save(); for (let i = 0; i < 3; i++) { const r = ((t + i * 8) % 24) * 0.9; g.globalAlpha = Math.max(0, 1 - r / 22); g.strokeStyle = '#d0a0ff'; g.lineWidth = 1.5; g.beginPath(); g.arc(tx, ty - 8, 3 + r, 0, Math.PI * 2); g.stroke(); } g.restore();
        spark(tx, ty - 8, 2, '#f0e0ff'); return; }
      case 'Cloak': case 'Avoid': { // a shimmer that wraps the caster
        const col = fx.name === 'Cloak' ? '#c090ff' : '#a0e0c0'; g.save(); g.globalAlpha = Math.max(0, 1 - t / n);
        for (let i = 0; i < 10; i++) { const a = i * 0.63 + t * 0.25; spark(cx + Math.cos(a) * 11, cy - 4 + Math.sin(a) * 13, 1.5, col); }
        g.restore(); return; }
      case 'Pound': { // a great fist drops onto the pillar; dust flies where it lands
        const fall = Math.min(1, t / 8); const fy = ty - 40 + fall * 36;
        if (t <= 14) { g.save(); g.globalAlpha = 0.95; Gfx.rect(g, tx - 8, fy - 8, 16, 14, '#d8d8e8'); Gfx.rect(g, tx - 8, fy - 8, 16, 2, '#f0f0ff'); for (let i = 0; i < 4; i++) Gfx.rect(g, tx - 7 + i * 4, fy - 12, 3, 5, '#d8d8e8'); Gfx.rect(g, tx - 8, fy + 4, 16, 2, '#9898b0'); g.restore(); }
        if (t >= 8) { const p = (t - 8) / (n - 8); g.save(); g.globalAlpha = 1 - p; for (let i = 0; i < 8; i++) { const a = i * 0.785; Gfx.ellipse(g, tx + Math.cos(a) * (6 + p * 14), ty + 6 + Math.sin(a) * (2 + p * 4), 3, 2, '#c8b898'); } g.restore(); }
        return; }
      case 'Lash': { // a rope uncoils from the caster's hand toward the post
        const p = Math.min(1, t / 16); g.save(); g.globalAlpha = t > n - 8 ? (n - t) / 8 : 1; g.strokeStyle = '#c8a060'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy);
        for (let s = 0; s <= 10; s++) { const q = s / 10 * p; g.lineTo(cx + (tx - cx) * q + Math.sin(q * 12 + t * 0.5) * 3 * (1 - q), cy + (ty - cy) * q + Math.cos(q * 12 + t * 0.5) * 3 * (1 - q)); }
        g.stroke(); g.restore(); return; }
      case 'Scoop': { // clods of earth thrown up out of the ground
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n); for (let i = 0; i < 7; i++) { const ph = (t + i * 4) % 20 / 20; const x = tx - 8 + i * 2.6, y = ty + 6 - Math.sin(ph * Math.PI) * (14 + i % 3 * 4); Gfx.rect(g, x, y, 3, 3, i % 2 ? '#8a6a40' : '#a88050'); } g.restore(); return; }
      case 'Tremor': case 'Sand': { // dust and grit shaken up round the target
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n); for (let i = 0; i < 10; i++) { const a = i * 0.63 + t * 0.1, r = 6 + ((t + i * 3) % 12); Gfx.ellipse(g, tx + Math.cos(a) * r, ty + 6 + Math.sin(a) * r * 0.4, 3, 2, fx.name === 'Sand' ? '#e0c880' : '#b8a888'); } g.restore(); return; }
      case 'Burst': { // a fireball that bursts on the crack
        const r = t * 1.3; g.save(); g.globalAlpha = Math.max(0, 1 - t / n); Gfx.circle(g, tx, ty, Math.min(10, r), '#ff8020'); Gfx.circle(g, tx, ty, Math.min(6, r * 0.6), '#ffe060'); g.strokeStyle = '#ff5010'; g.lineWidth = 2; g.beginPath(); g.arc(tx, ty, r + 4, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 8; i++) { const a = i * 0.785 + 0.4; spark(tx + Math.cos(a) * (r + 8), ty + Math.sin(a) * (r + 8), 1.5, '#ffb040'); } g.restore(); return; }
      case 'Grind': { // a spinning disc of force bores the stone to grit
        g.save(); g.globalAlpha = t > n - 8 ? (n - t) / 8 : 1; g.translate(tx, ty); g.rotate(t * 0.5); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); Gfx.tri(g, 0, 0, 10, -3, 10, 3, '#f0e0b0'); } g.restore();
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n); for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.3; Gfx.rect(g, tx + Math.cos(a) * (8 + t * 0.5), ty + Math.sin(a) * (6 + t * 0.4), 2, 2, '#9898a0'); } g.restore(); return; }
      case 'Hover': { // a ring of light under the party
        g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 0.4); Gfx.ellipse(g, cx, cy + 7, 9, 3, '#a0e0ff'); g.globalAlpha = 0.9; for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.2; spark(cx + Math.cos(a) * 9, cy + 7 + Math.sin(a) * 3, 1, '#ffffff'); } g.restore(); return; }
      case 'Teleport': case 'Retreat': { // a column of light rises over the party
        const a = t < 10 ? t / 10 : t > n - 12 ? (n - t) / 12 : 1; g.save(); g.globalAlpha = a * 0.6; Gfx.rect(g, cx - 7, cy - 40, 14, 48, fx.name === 'Teleport' ? '#c0a0ff' : '#ffe0a0'); g.globalAlpha = a * 0.9; Gfx.rect(g, cx - 3, cy - 40, 6, 48, '#ffffff');
        for (let i = 0; i < 8; i++) spark(cx - 6 + (i % 4) * 4, cy + 6 - ((t * 2 + i * 6) % 44), 1, '#ffffff'); g.restore(); return; }
      case 'Parch': { // the water swirls in and is gone
        const s = Math.max(0, 1 - t / n); g.save(); g.globalAlpha = 0.9; for (let i = 0; i < 3; i++) { g.strokeStyle = i ? '#78b8f0' : '#c0e8ff'; g.lineWidth = 2; g.beginPath(); g.arc(tx, ty, (10 - i * 3) * s, t * 0.3 + i, t * 0.3 + i + 4); g.stroke(); } g.restore(); return; }
      case 'Blaze': { // a tongue of flame
        g.save(); g.globalAlpha = t > n - 8 ? (n - t) / 8 : 1; for (let i = 0; i < 5; i++) { const x = tx - 6 + i * 3, h = 10 + Math.sin(t * 0.6 + i * 1.5) * 4; Gfx.tri(g, x - 2, ty + 6, x, ty + 6 - h, x + 2, ty + 6, i % 2 ? '#ff6020' : '#ffa020'); } Gfx.tri(g, tx - 2, ty + 4, tx, ty - 2, tx + 2, ty + 4, '#ffe080'); g.restore(); return; }
      case 'Ply': case 'Ply Well': case 'Pure Ply': case 'Wish': case 'Wish Well': case 'Pure Wish': case 'Cure': case 'Cure Well': case 'Potent': { // healing light rising over the party
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n); for (let i = 0; i < 10; i++) { const x = cx - 10 + (i * 7) % 20, y = cy + 8 - ((t * 1.5 + i * 5) % 30); spark(x, y, 1.5, i % 2 ? '#a0e8ff' : '#ffffff'); } g.restore(); return; }
      case 'Reveal': { // the lens does the work; a flash as it opens
        g.save(); g.globalAlpha = Math.max(0, 1 - t / n) * 0.5; Gfx.circle(g, cx, cy, 6 + t * 2, '#ffffff'); g.restore(); return; }
      default: { // the element's sparks
        for (let i = 0; i < 8; i++) { const a = i * 0.785 + t * 0.3; spark(tx + Math.cos(a) * t * 1.2, ty + Math.sin(a) * t * 0.8 - t, 2, ELCOLOR[fx.el]); }
      }
    }
  },
};
