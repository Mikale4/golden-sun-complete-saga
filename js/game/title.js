// ---------- Title screen ----------
'use strict';
class TitleScene {
  constructor() {
    // One game, start to finish: there is no separate way in to The Lost Age half
    this.t = 0; const items = [{ label: 'New Game', id: 'new' }, { label: 'Demo', id: 'demo' }];   /* Demo: the game plays itself, start to finish, until a key is pressed */
    if (SaveSystem.exists()) items.unshift({ label: 'Continue', id: 'continue' });
    this.boxW = Math.max(...items.map(i => Font.width(i.label))) + 30; this.boxX = Math.floor((SCREEN_W - this.boxW) / 2);
    this.menu = new MenuList(items, { x: this.boxX + 14, y: 108, w: this.boxW - 20, rows: 3, lineH: 11 });
    this.stars = []; const r = seededRandom(7); for (let i = 0; i < 60; i++) this.stars.push({ x: Math.floor(r() * SCREEN_W), y: Math.floor(r() * 100), b: r() });
  }
  enter() { Audio.play('title'); }
  update() {
    this.t++;
    if (this.t < 30) return;
    if (typeof Demo !== 'undefined' && Demo.loading) return;   /* the runner's files are on their way */
    this.menu.update();
    if (this.menu.chosen) {
      const id = this.menu.chosen.id;
      if (id === 'continue') {
        Engine.push(new SaveSlotScene(null, 'load', (ok, d) => {
          if (!ok || !d) return;
          Engine.replace(new FieldScene()); SaveSystem.apply(d, Engine.top); Engine.fade = 1; Engine.fadeIn(20);
        }));
      }
      else if (id === 'new') { Game.newGame(); }
      else if (id === 'demo') { Demo.start(); }
    }
  }
  draw(g) {
    Gfx.vgrad(g, 0, 0, SCREEN_W, 100, '#0a0820', '#2a2060', 20); Gfx.vgrad(g, 0, 100, SCREEN_W, 60, '#c06020', '#f0c040', 12);
    for (const s of this.stars) { if ((this.t / 20 + s.b * 10) % 2 < 1.2) Gfx.px(g, s.x, s.y, s.b > 0.7 ? '#ffffff' : '#a0a0ff'); }
    // sun on horizon
    const sy = 100 - Math.min(24, this.t / 3);
    Gfx.circle(g, 120, sy + 8, 26, '#ffe060'); Gfx.circle(g, 120, sy + 8, 20, '#fff0a0');
    Gfx.rect(g, 0, 100, SCREEN_W, 60, 'rgba(240,192,64,0)');
    // silhouette mountains / lighthouse
    Gfx.tri(g, -20, 100, 40, 60, 100, 100, '#181030'); Gfx.tri(g, 140, 100, 200, 66, 260, 100, '#181030'); Gfx.rect(g, 176, 30, 8, 70, '#181030'); Gfx.rect(g, 174, 26, 12, 6, '#181030'); Gfx.circle(g, 180, 24, 3, '#ffe080');
    Gfx.rect(g, 0, 100, SCREEN_W, 60, '#100818');
    for (let i = 0; i < 30; i++) Gfx.hline(g, (i * 37) % SCREEN_W, 104 + (i * 13) % 50, 4, '#301838');
    // Title
    const ty = 36;
    Font.draw(g, 'GOLDEN SUN', 121, ty + 1, '#804010', { align: 'center', shadow: null });
    Font.draw(g, 'GOLDEN SUN', 120, ty, '#ffe060', { align: 'center', outline: '#603000' });
    Font.draw(g, 'THE COMPLETE SAGA', 120, ty + 12, '#ffffff', { align: 'center', outline: '#302040' });
    Font.draw(g, 'Golden Sun & The Lost Age', 120, ty + 24, '#c0c8ff', { align: 'center' });
    if (this.t >= 30) { UI.window(g, this.boxX, 100, this.boxW, this.menu.items.length * 11 + 12); this.menu.draw(g); }
    if (typeof Demo !== 'undefined' && (Demo.loading || Demo.error)) Font.draw(g, Demo.error || 'Loading the demo...', 120, 150, Demo.error ? '#e08080' : '#c0c8ff', { align: 'center' });
    else Font.draw(g, 'Fan project - not for distribution', 120, 150, '#806040', { align: 'center', shadow: null });
  }
}
