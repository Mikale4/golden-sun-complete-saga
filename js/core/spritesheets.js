// ---------- Generated sprite sheets ----------
// Walking sheets from assets/sprites/field/ (loaded by AssetFiles; see prompts/overworld_party.md): a 3x4 grid
// of cells (columns standing / step A / step B, rows facing down / left / right / up) on flat magenta, drawn at any
// whole multiple of 16x24. Each cell is keyed and shrunk to the game's 16x24 frame and takes the place of the
// code-drawn sprite for that character; a character without a sheet keeps the drawn one.
'use strict';
const SpriteSheets = {
  sets: {},      // sheet id -> set[dir][frame]
  FW: 16, FH: 24,
  // magenta, and the pinkish fringe where a soft edge blends into it, is the background
  isKey(r, g, b) { return r > 150 && b > 150 && g < 120 && r - g > 80 && b - g > 80; },
  apply(id, img) {
    const cols = 3, rows = 4; const cw = img.width / cols, ch = img.height / rows;
    const src = Gfx.canvas(img.width, img.height), sg = Gfx.ctx(src); sg.drawImage(img, 0, 0);
    const im = sg.getImageData(0, 0, img.width, img.height), data = im.data;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] < 128 || this.isKey(data[i], data[i + 1], data[i + 2])) data[i + 3] = 0;
    sg.putImageData(im, 0, 0);
    const set = [];
    if (cw === this.FW && ch === this.FH) {   // already the game's size: cut as is
      for (let d = 0; d < rows; d++) { set[d] = []; for (let f = 0; f < cols; f++) { const c = Gfx.canvas(this.FW, this.FH); Gfx.ctx(c).drawImage(src, f * cw, d * ch, cw, ch, 0, 0, cw, ch); set[d][f] = c; } }
    } else {
      // a drawing at any size: each cell's figure is found by its bounding box, and the whole sheet is shrunk by one
      // scale (the tallest figure fits 23 pixels) so the walk frames keep their proportions, then stood on the baseline
      const boxes = []; let maxW = 1, maxH = 1;
      for (let d = 0; d < rows; d++) for (let f = 0; f < cols; f++) {
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const bx = Math.floor(f * cw), by = Math.floor(d * ch), bw = Math.floor(cw), bh = Math.floor(ch);
        for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) if (data[(y * img.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        const box = x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; boxes.push(box);
        if (box) { maxW = Math.max(maxW, box.w); maxH = Math.max(maxH, box.h); }
      }
      // the sheet is shrunk so a typical figure stands 22 pixels tall (the party's height) without the tallest
      // pose leaving the frame; a drawing made slimmer than the game's chibi build is widened a little to match
      const med = (a) => { const s = a.slice().sort((u, v) => u - v); return s[Math.floor(s.length / 2)] || 1; };
      const medH = med(boxes.filter(Boolean).map(b => b.h)), medW = med(boxes.filter(Boolean).map(b => b.w));
      const scale = Math.min(1, 22 / medH, (this.FH - 1) / maxH, (this.FW - 1) / maxW);
      const widen = Math.max(1, Math.min(1.4, 11 / (medW * scale)));
      for (let d = 0; d < rows; d++) { set[d] = []; for (let f = 0; f < cols; f++) {
        const c = Gfx.canvas(this.FW, this.FH), g = Gfx.ctx(c); const box = boxes[d * cols + f];
        if (box) {
          const w = Math.min(this.FW, Math.max(1, Math.round(box.w * scale * widen))), h = Math.max(1, Math.round(box.h * scale));
          g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
          g.drawImage(src, box.x, box.y, box.w, box.h, Math.floor((this.FW - w) / 2), this.FH - 1 - h, w, h);
          const o = g.getImageData(0, 0, this.FW, this.FH); for (let i = 3; i < o.data.length; i += 4) o.data[i] = o.data[i] >= 110 ? 255 : 0; g.putImageData(o, 0, 0);   // hard edges again
        }
        set[d][f] = c;
      } }
    }
    this.sets[id] = set;
    // actors already walking about swap their frames in place
    for (const key in Sprites.cache) if (key.startsWith('H') && key.includes('"sheet":"' + id + '"')) { const old = Sprites.cache[key]; for (let d = 0; d < 4; d++) for (let f = 0; f < 3; f++) old[d][f] = set[d][f]; }
  },
  set(look) { return look && look.sheet ? this.sets[look.sheet] || null : null; },
};
