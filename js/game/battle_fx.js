// ---------- Battle visual effects (elemental psynergy, summons) ----------
'use strict';
const BattleFX = {
  make(kind, positions, name) {
    const fx = { kind, pos: positions, t: 0, done: false, dur: 40, parts: [], name };
    const P = (o) => fx.parts.push(o);
    switch (kind) {
      case 'fire': fx.dur = 40; for (const p of positions) for (let i = 0; i < 18; i++) P({ x: p.x + rnd(30) - 15, y: p.y + 10 + rnd(10), vy: -1.2 - Math.random() * 1.5, vx: (Math.random() - 0.5) * 0.6, life: 20 + rnd(20), col: pick(['#ff4020', '#ff8020', '#ffd040', '#ff6030']), r: 2 + rnd(3), delay: rnd(12) }); break;
      case 'water': fx.dur = 42; for (const p of positions) for (let i = 0; i < 16; i++) P({ x: p.x + rnd(36) - 18, y: p.y - 50 - rnd(30), vy: 2.5 + Math.random() * 2, vx: 0, life: 30, col: pick(['#60b0ff', '#a0e0ff', '#ffffff', '#3080e0']), r: 1 + rnd(2), delay: rnd(14), floorY: p.y + 8, splash: true }); break;
      case 'earth': fx.dur = 44; for (const p of positions) for (let i = 0; i < 12; i++) P({ x: p.x + rnd(30) - 15, y: p.y + 12, vy: -3 - Math.random() * 2, vx: (Math.random() - 0.5) * 2, life: 30, col: pick(['#a08050', '#c0a060', '#806040', '#e0c080']), r: 2 + rnd(3), delay: rnd(10), grav: 0.25 }); fx.shake = true; break;
      case 'wind': fx.dur = 40; for (const p of positions) for (let i = 0; i < 14; i++) P({ x: p.x, y: p.y - 10, ang: Math.random() * 6.28, rad: 4 + rnd(10), spin: 0.25 + Math.random() * 0.2, rise: 0.8, life: 34, col: pick(['#c0f0ff', '#d0b0ff', '#ffffff', '#a0d0ff']), r: 1 + rnd(2), delay: rnd(8), orbit: true }); break;
      case 'heal': fx.dur = 36; for (const p of positions) for (let i = 0; i < 12; i++) P({ x: p.x + rnd(24) - 12, y: p.y + 10, vy: -1 - Math.random(), vx: 0, life: 30, col: pick(['#80ff80', '#c0ffc0', '#ffffff', '#60e0a0']), r: 1 + rnd(2), delay: rnd(14), twinkle: true }); break;
      case 'buff': fx.dur = 30; for (const p of positions) for (let i = 0; i < 10; i++) P({ x: p.x + rnd(24) - 12, y: p.y + 10, vy: -2, vx: 0, life: 24, col: pick(['#ffe080', '#ffffff', '#ffc040']), r: 1 + rnd(2), delay: rnd(10), twinkle: true }); break;
      case 'status': fx.dur = 32; for (const p of positions) for (let i = 0; i < 10; i++) P({ x: p.x, y: p.y - 6, ang: Math.random() * 6.28, rad: 8 + rnd(6), spin: 0.15, rise: 0, life: 28, col: pick(['#c080ff', '#8040c0', '#e0c0ff']), r: 2, delay: rnd(8), orbit: true }); break;
    }
    if (name && /Ragnarok|Odyssey|Cutting Edge|Plume Edge|Astral Blast|Heat Wave|Planet Diver|Death Plunge|Shuriken|Quick Strike|Helm Splitter/.test(name)) { fx.slash = true; }
    if (name && /Judgment|Meteor|Thor|Boreas|Charon|Iris|Catastrophe|Eclipse|Haures|Azul|Daedalus|Grand Gaia|Supernova|Pyroclasm|Tempest|Spark Plasma|Freeze Prism|Megacool|Thunderstorm|Thunderhead|Carpet Bomb|Dragon Fume|Searing Beam|Odyssey/.test(name)) { fx.big = true; fx.dur += 16; for (const p of positions) for (let i = 0; i < 20; i++) P({ x: p.x + rnd(60) - 30, y: p.y + 10, vy: -2 - Math.random() * 3, vx: (Math.random() - 0.5) * 3, life: 40, col: fx.parts.length ? fx.parts[0].col : '#ffffff', r: 2 + rnd(3), delay: rnd(20), grav: 0.1 }); }
    fx.update = function () {
      this.t++; if (this.t === 4 && this.shake) Engine.doShake(10); if (this.t === 6 && this.big) { Engine.doFlash(6, '#ffffff'); Engine.doShake(14); }
      for (const p of this.parts) {
        if (p.delay > 0) { p.delay--; continue; }
        p.life--;
        if (p.orbit) { p.ang += p.spin; p.rad += 0.3; p.y -= p.rise; }
        else { p.x += p.vx; p.y += p.vy; if (p.grav) p.vy += p.grav; if (p.floorY !== undefined && p.y >= p.floorY) { p.y = p.floorY; p.vy = -1 - Math.random(); p.vx = (Math.random() - 0.5) * 3; p.floorY = undefined; p.life = Math.min(p.life, 8); } }
      }
      if (this.t >= this.dur) this.done = true;
    };
    fx.draw = function (g) {
      for (const p of this.parts) {
        if (p.delay > 0 || p.life <= 0) continue;
        if (p.twinkle && Math.floor(this.t / 3) % 2) continue;
        const x = p.orbit ? p.x + Math.cos(p.ang) * p.rad : p.x, y = p.orbit ? p.y + Math.sin(p.ang) * p.rad * 0.5 : p.y;
        Gfx.circle(g, Math.round(x), Math.round(y), p.r, p.col);
      }
      if (this.slash && this.t > 4 && this.t < 16) { for (const p of this.pos) { const k = (this.t - 4) / 12; Gfx.line(g, p.x - 18 + k * 8, p.y - 30 + k * 6, p.x + 12 - k * 4, p.y + 4 - k * 4, '#ffffff'); Gfx.line(g, p.x - 17 + k * 8, p.y - 30 + k * 6, p.x + 13 - k * 4, p.y + 4 - k * 4, '#ffe080'); } }
      if (this.kind === 'fire' && this.t < 20) for (const p of this.pos) { Gfx.ellipse(g, p.x, p.y - 6, 10 + this.t / 2, 8 + this.t / 3, 'rgba(255,120,40,' + (0.5 - this.t * 0.025) + ')'); }
      if (this.kind === 'earth' && this.t > 4 && this.t < 24) for (const p of this.pos) { const h = Math.min(20, (this.t - 4) * 3); Gfx.tri(g, p.x - 8, p.y + 10, p.x, p.y + 10 - h, p.x + 8, p.y + 10, '#a08050'); Gfx.tri(g, p.x - 4, p.y + 10, p.x, p.y + 10 - h, p.x + 2, p.y + 10, '#d0b070'); }
      if (this.kind === 'wind' && this.t < 30) for (const p of this.pos) { if (this.t % 4 < 2) Gfx.line(g, p.x + rnd(20) - 10, p.y - 40, p.x + rnd(10) - 5, p.y - 4, '#ffffa0'); }
      if (this.kind === 'water' && this.t > 10 && this.t < 30) for (const p of this.pos) { Gfx.ellipse(g, p.x, p.y + 6, 12, 3, 'rgba(120,200,255,0.5)'); }
    };
    return fx;
  },
  // Big silhouette drawn during summon banner
  drawSummonFigure(g, name, el, cx, cy, s) {
    const col = ELCOLOR[el], l = tint(col, 0.4), d = shade(col, 0.6);
    g.save(); g.translate(cx, cy); g.scale(s, s);
    const R = (x, y, w, h, c) => Gfx.rect(g, x, y, w, h, c), E = (x, y, rx, ry, c) => Gfx.ellipse(g, x, y, rx, ry, c), T = (a, b, c2, d2, e, f, c) => Gfx.tri(g, a, b, c2, d2, e, f, c);
    const n = name;
    if (['Venus', 'Mercury', 'Mars', 'Jupiter'].includes(n)) { E(0, -20, 14, 14, col); E(0, -20, 8, 8, l); for (let i = 0; i < 8; i++) { const a = i * 0.785; E(Math.cos(a) * 26, -20 + Math.sin(a) * 26, 4, 4, l); } }
    else if (n === 'Ramses' || n === 'Cybele' || n === 'Judgment' || n === 'Zagan' || n === 'Haures' || n === 'Charon') { R(-16, -50, 32, 44, col); E(0, -58, 14, 12, l); R(-30, -40, 12, 30, d); R(18, -40, 12, 30, d); R(-8, -60, 4, 4, '#ff4040'); R(4, -60, 4, 4, '#ff4040'); if (n === 'Judgment') { T(-16, -40, -50, -70, -20, -10, l); T(16, -40, 50, -70, 20, -10, l); } if (n === 'Charon') { R(-2, -90, 4, 90, '#404040'); T(-14, -90, 2, -100, 18, -84, '#c0c0c0'); } }
    else if (['Nereid', 'Neptune', 'Boreas', 'Moloch', 'Coatlicue', 'Ulysses', 'Azul'].includes(n)) { E(0, -30, 24, 30, col); E(-8, -40, 6, 6, l); E(8, -40, 6, 6, l); for (let i = 0; i < 6; i++) T(-30 + i * 12, -10, -24 + i * 12, 10 + (i % 2) * 8, -18 + i * 12, -10, d); if (n === 'Azul') { T(-24, -30, -60, -50, -30, -5, d); T(24, -30, 60, -50, 30, -5, d); } }
    else if (['Kirin', 'Tiamat', 'Meteor', 'Megaera', 'Daedalus', 'Iris'].includes(n)) { if (n === 'Meteor') { E(0, -30, 26, 26, col); E(-8, -38, 8, 8, l); for (let i = 0; i < 10; i++) R(-40 + i * 8, -60 - (i % 3) * 8, 3, 20, l); } else { E(0, -20, 30, 16, col); R(10, -40, 16, 20, col); E(20, -44, 10, 8, l); T(-20, -30, -50, -60, -16, -10, d); R(-20, -6, 8, 20, d); R(12, -6, 8, 20, d); } }
    else if (['Atalanta', 'Procne', 'Thor', 'Flora', 'Eclipse', 'Catastrophe'].includes(n)) { E(0, -30, 12, 24, col); E(0, -56, 10, 10, l); T(-12, -40, -60, -60, -14, -10, d); T(12, -40, 60, -60, 14, -10, d); if (n === 'Thor') { R(-30, -50, 6, 40, '#a0a0a0'); E(-27, -54, 10, 6, '#c0c0c0'); } }
    g.restore();
  }
};
