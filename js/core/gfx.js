// ---------- Pixel-art graphics helpers ----------
'use strict';
const Gfx = {
  canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return c; },
  ctx(c) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; },
  px(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); },
  rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); },
  hline(g, x, y, w, col) { g.fillStyle = col; g.fillRect(x, y, w, 1); },
  vline(g, x, y, h, col) { g.fillStyle = col; g.fillRect(x, y, 1, h); },
  // Filled ellipse (pixel-perfect)
  ellipse(g, cx, cy, rx, ry, col) {
    g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) {
      const t = 1 - (y * y) / (ry * ry || 1); if (t < 0) continue;
      const w = Math.sqrt(t) * rx;
      g.fillRect(Math.round(cx - w), Math.round(cy + y), Math.round(w * 2) || 1, 1);
    }
  },
  circle(g, cx, cy, r, col) { this.ellipse(g, cx, cy, r, r, col); },
  line(g, x0, y0, x1, y1, col) {
    g.fillStyle = col; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); // Bresenham needs integers or it never terminates
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (; ;) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  },
  tri(g, x0, y0, x1, y1, x2, y2, col) {
    // scanline fill
    const pts = [[x0, y0], [x1, y1], [x2, y2]].sort((a, b) => a[1] - b[1]);
    const [A, B, C] = pts; g.fillStyle = col;
    const xAt = (P, Q, y) => P[1] === Q[1] ? P[0] : P[0] + (Q[0] - P[0]) * (y - P[1]) / (Q[1] - P[1]);
    for (let y = A[1]; y <= C[1]; y++) {
      let xa = xAt(A, C, y), xb = y < B[1] ? xAt(A, B, y) : xAt(B, C, y);
      if (xa > xb) [xa, xb] = [xb, xa];
      g.fillRect(Math.round(xa), y, Math.round(xb) - Math.round(xa) + 1, 1);
    }
  },
  // Paint from a string map. rows: array of strings; pal: {char: color}
  paint(g, rows, pal, ox, oy) {
    ox = ox || 0; oy = oy || 0;
    for (let y = 0; y < rows.length; y++) {
      const r = rows[y];
      for (let x = 0; x < r.length; x++) { const c = pal[r[x]]; if (c) { g.fillStyle = c; g.fillRect(ox + x, oy + y, 1, 1); } }
    }
  },
  sprite(rows, pal) { const w = Math.max(...rows.map(r => r.length)), h = rows.length; const c = this.canvas(w, h); this.paint(this.ctx(c), rows, pal); return c; },
  // Add 1px outline around opaque pixels
  outline(c, col, alphaThresh) {
    col = col || '#1a1428';
    const w = c.width, h = c.height, g = this.ctx(c), d = g.getImageData(0, 0, w, h), a = d.data;
    const out = this.canvas(w, h), og = this.ctx(out);
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > (alphaThresh || 40);
    og.fillStyle = col;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) og.fillRect(x, y, 1, 1);
    }
    og.drawImage(c, 0, 0);
    return out;
  },
  flipH(c) { const o = this.canvas(c.width, c.height), g = this.ctx(o); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return o; },
  scale(c, s) { const o = this.canvas(c.width * s, c.height * s), g = this.ctx(o); g.drawImage(c, 0, 0, o.width, o.height); return o; },
  // Recolor: map each pixel through fn(r,g,b,a)->[r,g,b,a]
  mapPixels(c, fn) {
    const g = this.ctx(c), d = g.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) { if (a[i + 3] === 0) continue; const r = fn(a[i], a[i + 1], a[i + 2], a[i + 3]); a[i] = r[0]; a[i + 1] = r[1]; a[i + 2] = r[2]; a[i + 3] = r[3]; }
    const o = this.canvas(c.width, c.height); this.ctx(o).putImageData(d, 0, 0); return o;
  },
  tinted(c, hex, amt) { const [tr, tg, tb] = hexToRgb(hex); return this.mapPixels(c, (r, g, b, a) => [lerp(r, tr, amt), lerp(g, tg, amt), lerp(b, tb, amt), a]); },
  silhouette(c, hex) { const [tr, tg, tb] = hexToRgb(hex); return this.mapPixels(c, (r, g, b, a) => [tr, tg, tb, a]); },
  // Simple 2D value noise
  noise2(seedFn, x, y) { return seedFn(); },
  // Gradient fill helper for backgrounds
  vgrad(g, x, y, w, h, c0, c1, steps) {
    steps = steps || h;
    for (let i = 0; i < steps; i++) { g.fillStyle = mix(c0, c1, i / (steps - 1 || 1)); g.fillRect(x, y + Math.floor(i * h / steps), w, Math.ceil(h / steps)); }
  }
};
