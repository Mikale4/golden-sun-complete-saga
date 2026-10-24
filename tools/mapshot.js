// Full-map screenshot: draws the current field map screen by screen with the camera stepped across it, stitches
// the pieces and posts the PNG to serve.py (runner/shots/<name>.png). Load with fetch+eval in the game tab, then
// mapShot('madra'). Sprites and the HUD draw as they are at the moment; the textbox is skipped.
window.mapShot = async function (name, scale) {
  const F = G.field, M = F.map; scale = scale || 1;
  const W = M.w * TILE, H = M.h * TILE; const out = document.createElement('canvas'); out.width = W * scale; out.height = H * scale; const og = out.getContext('2d'); og.imageSmoothingEnabled = false;
  const piece = document.createElement('canvas'); piece.width = SCREEN_W; piece.height = SCREEN_H; const pg = piece.getContext('2d'); pg.imageSmoothingEnabled = false;
  const saveCam = { x: F.cam.x, y: F.cam.y }; const tb = F.textbox; const tbActive = tb.active; tb.active = false; const at = F.areaTitle; F.areaTitle = null; const ct = F.chapterTitle; F.chapterTitle = null;
  for (let cy = 0; cy < H; cy += SCREEN_H) for (let cx = 0; cx < W; cx += SCREEN_W) {
    F.cam.x = cx; F.cam.y = cy; pg.clearRect(0, 0, SCREEN_W, SCREEN_H); F.draw(pg);
    og.drawImage(piece, 0, 0, SCREEN_W, SCREEN_H, cx * scale, cy * scale, SCREEN_W * scale, SCREEN_H * scale);
  }
  F.cam.x = saveCam.x; F.cam.y = saveCam.y; tb.active = tbActive; F.areaTitle = at; F.chapterTitle = ct;
  const url = out.toDataURL('image/png');
  await fetch('/shot?name=' + encodeURIComponent(name || M.id), { method: 'POST', body: url });
  return name + ': ' + W + 'x' + H;
};
