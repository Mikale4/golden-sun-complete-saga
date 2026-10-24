// ---------- Export of the generated art ----------
// Everything the game draws in code - tiles, field sprites, the battle party, monsters, summons, backdrops, the
// maps and the UI pieces - written out as PNG files under assets/, named after what they are. Run from the game
// itself (it needs the canvases): open http://localhost:8765/?export=assets - only files not yet in assets/ are written,
// so art dropped in by hand stays; ?export=assets&force=1 rewrites everything with the code-drawn versions. Or in the
// console: fetch('/tools/export_assets.js').then(r => r.text()).then(eval).then(() => ExportAssets.run({ force: false }))
// The dev server's POST /asset does the writing. Animated pieces are strips, frames left to right.
'use strict';
const ExportAssets = {
  batch: [], sent: 0, log: [],
  // ---- names and files ----
  slug(name) { return String(name).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); },
  strip(frames) {
    const w = Math.max(...frames.map(f => f.width)), h = Math.max(...frames.map(f => f.height));
    const c = Gfx.canvas(w * frames.length, h), g = Gfx.ctx(c); frames.forEach((f, i) => g.drawImage(f, i * w, h - f.height)); return c;
  },
  add(path, canvas) { if (!this.force && this.existing && this.existing[path]) { this.skipped++; return; } this.batch.push({ path, data: canvas.toDataURL('image/png') }); },   // a file already there is someone's art: left alone unless forced
  addText(path, text) { this.batch.push({ path, data: text }); },
  async flush() { if (!this.batch.length) return; const b = this.batch; this.batch = []; const r = await fetch('/asset', { method: 'POST', body: JSON.stringify(b) }); this.sent += Number(await r.text()) || 0; },
  async push(path, canvas) { this.add(path, canvas); if (this.batch.length >= 40) await this.flush(); },
  // ---- the sections ----
  async tiles() {
    let n = 0;
    for (const t of Tiles.list) { if (t.name === 'void' || t.name === 'black') continue; await this.push('tiles/' + this.slug(t.name) + '.png', t.frames.length > 1 ? this.strip(t.frames) : t.frames[0]); n++; }
    for (const k in Tiles.edges) { await this.push('tiles/edges/' + this.slug(k) + '.png', Tiles.edges[k]); n++; }
    this.log.push('tiles: ' + n);
  },
  // a walking sheet: a row per direction (down, left, right, up), a column per frame
  sheet(look) {
    const rows = [DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UP].map(d => this.strip([0, 1, 2].map(f => Sprites.humanoid(look, d, f))));
    const c = Gfx.canvas(rows[0].width, rows[0].height * 4), g = Gfx.ctx(c); rows.forEach((r, i) => g.drawImage(r, 0, i * rows[0].height)); return c;
  },
  async fieldSprites() {
    let n = 0;
    for (const id in CHARACTERS) { await this.push('sprites/field/party/' + this.slug(id) + '.png', this.sheet(CHARACTERS[id].look)); n++; }
    for (const id in NPC_LOOKS) { if (!NPC_LOOKS[id]) continue; await this.push('sprites/field/npcs/' + this.slug(id) + '.png', this.sheet(NPC_LOOKS[id])); n++; }   // a null look is a creature drawn another way
    for (const t in NPC_TYPES) for (let seed = 1; seed <= 3; seed++) { await this.push('sprites/field/townsfolk/' + this.slug(t) + '_' + seed + '.png', this.sheet(npcLook(t, seed))); n++; }
    const animals = { dog: '#a08060', wolf: '#807060', cat: '#909090', sheep: '#f0f0f0', cow: '#f0f0f0', chicken: '#f0f0f0', bird: '#5090e0', boulder: '#8a8a90', sapling: '#48a048', wiseone: '#8090a0' };
    for (const type in animals) { const rows = [DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UP].map(d => this.strip([0, 1].map(f => Sprites.animal(type, animals[type], d, f)))); const c = Gfx.canvas(rows[0].width, 64), g = Gfx.ctx(c); rows.forEach((r, i) => g.drawImage(r, 0, i * 16)); await this.push('sprites/field/animals/' + type + '.png', c); n++; }
    for (let el = 0; el < 4; el++) { const rows = [DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UP].map(d => this.strip([0, 1].map(f => Sprites.animal('djinni', el, d, f)))); const c = Gfx.canvas(rows[0].width, 64), g = Gfx.ctx(c); rows.forEach((r, i) => g.drawImage(r, 0, i * 16)); await this.push('sprites/field/djinn/' + ['venus', 'mercury', 'mars', 'jupiter'][el] + '_djinni.png', c); n++; }
    this.log.push('field sprites: ' + n);
  },
  async battleParty() {
    let n = 0;
    const poses = ['step', 'attack', 'attack2', 'cast', 'cast2', 'hurt', 'guard', 'down', 'win'];
    for (const id in CHARACTERS) {
      const look = CHARACTERS[id].look, dir = 'battle/party/' + this.slug(id) + '/';
      await this.push(dir + 'idle.png', this.strip([0, 1, 2].map(f => BattleParty.sprite(look, 'idle', f)))); n++;
      for (const p of poses) { await this.push(dir + p + '.png', BattleParty.sprite(look, p, 0)); n++; }
    }
    this.log.push('battle party: ' + n);
  },
  async foes() {
    let n = 0;
    const antagonists = /^(Saturos|Menardi|Mystery (Man|Woman)|Karst|Agatio|Alex|Briggs|Moapa)\b/;
    const bossNames = /^(Tret|Kraken|Hydros Statue|Manticore|Azart|Satrage|Navampa|Tempest Lizard|Storm Lizard|Deadbeard|Fusion Dragon|Killer Ape|Chestbeater|Toadonpa|Poseidon|Sentinel|Valukar|Star Magician|Dullahan|Doom Dragon|Aqua Hydra|Serpent|Avimander|Flame Dragon|Blue Dragon|Refresh Ball|Guardian Ball|Thunder Ball|Anger Ball|Mimic|Minos Knight|Lizard King|Gillman Lord)\b/;
    for (const name of Object.keys(ENEMY_DB)) {
      const d = ENEMY_DB[name]; if (d.g === 'traveler') continue;
      const folder = antagonists.test(name) ? 'battle/antagonists/' : (bossNames.test(name) || d.hp >= 1500) ? 'battle/bosses/' : /Djinni/.test(name) ? 'battle/djinn/' : 'battle/enemies/' + (d.g === 'tla' ? 'the_lost_age/' : 'golden_sun/');
      await this.push(folder + this.slug(name) + '.png', this.strip([0, 1].map(f => Monsters.sprite(name, f)))); n++;
    }
    for (const el of ['Venus', 'Mercury', 'Mars', 'Jupiter']) { await this.push('battle/djinn/' + el.toLowerCase() + '_djinni.png', this.strip([0, 1].map(f => Foes.sprite(el + ' Djinni', f)))); n++; }
    this.log.push('monsters: ' + n);
  },
  async summons() {
    let n = 0;
    for (const name of Object.keys(SUMMONS)) { const s = BattleSummons.sprite(name, 0); if (!s) continue; await this.push('battle/summons/' + this.slug(name) + '.png', this.strip([0, 1].map(f => BattleSummons.sprite(name, f)))); n++; }
    this.log.push('summons: ' + n);
  },
  async backgrounds() {
    let n = 0;
    for (const scene of Object.keys(BattleBgs.scenes)) { await this.push('battle/backgrounds/' + scene + '.png', this.strip([0, 1].map(f => BattleBgs.render(scene, f)))); n++; }
    this.log.push('battle backgrounds: ' + n);
  },
  async ui() {
    let n = 0;
    const win = Gfx.canvas(120, 64), wg = Gfx.ctx(win); UI.window(wg, 2, 2, 116, 60); await this.push('ui/window.png', win); n++;
    const chars = []; for (let c = 32; c < 127; c++) chars.push(String.fromCharCode(c));
    const glyphs = chars.map(ch => Font.glyph(ch, '#ffffff')); const fw = glyphs.reduce((a, gl) => a + gl.width + 1, 0);
    const fc = Gfx.canvas(fw, 8), fg = Gfx.ctx(fc); let x = 0; for (const gl of glyphs) { fg.drawImage(gl, x, 0); x += gl.width + 1; } await this.push('ui/font.png', fc); n++;
    this.addText('ui/font.txt', 'Glyphs left to right, one pixel apart, for the characters ' + JSON.stringify(chars.join('')) + '\n');
    if (typeof TitleScene !== 'undefined') { const tc = Gfx.canvas(SCREEN_W, SCREEN_H), tg = Gfx.ctx(tc); const t = new TitleScene(); if (t.enter) t.enter(); t.draw(tg); await this.push('ui/title_screen.png', tc); n++; }
    this.log.push('ui: ' + n);
  },
  // every map drawn whole with the field's own renderer, at the game's current flags
  async maps() {
    let n = 0; const F = G.field; if (!F) { this.log.push('maps: skipped (no field)'); return; }
    const keep = { map: F.map, mapId: G.mapId, cam: Object.assign({}, F.cam), px: F.player.px, py: F.player.py, tx: F.player.tx, ty: F.player.ty, npcs: F.npcs, event: F.event, followers: F.followers, ship: F.ship, hidden: F.player.hidden, areaTitle: F.areaTitle };
    const muted = Audio.muted; Audio.muted = true; const savedFrame = F.frame; F.player.hidden = true;
    for (const id of Object.keys(MAPS)) {
      try {
        const M = buildMap(id); F.map = M; G.map = M; G.mapId = id; F.event = null; F.npcs = M.npcs.map(nn => { const a = new Actor(nn.id, nn.x, nn.y, nn.look, nn); a.npc = nn; return a; }); F.followers = []; F.ship = false; F.areaTitle = null; F.frame = 0;
        const W = M.w * TILE, H = M.h * TILE; if (W * H > 40000000) { this.log.push('maps: ' + id + ' too large, skipped'); continue; }
        const c = Gfx.canvas(W, H), g = Gfx.ctx(c);
        for (let cy = 0; cy < H; cy += SCREEN_H) for (let cx = 0; cx < W; cx += SCREEN_W) {
          F.cam.x = cx; F.cam.y = cy; const part = Gfx.canvas(SCREEN_W, SCREEN_H), pg = Gfx.ctx(part); F.draw(pg); g.drawImage(part, cx, cy);
        }
        await this.push('maps/' + (M.world ? 'world/' : M.indoor ? 'interiors/' : 'places/') + this.slug(id) + '.png', c); n++;
      } catch (e) { this.log.push('maps: ' + id + ' failed: ' + e.message); }
      await this.flush();
    }
    Object.assign(F, { map: keep.map, npcs: keep.npcs, event: keep.event, followers: keep.followers, ship: keep.ship, areaTitle: keep.areaTitle, frame: savedFrame }); F.cam.x = keep.cam.x; F.cam.y = keep.cam.y; G.map = keep.map; G.mapId = keep.mapId; F.player.hidden = keep.hidden; Audio.muted = muted;
    this.log.push('maps: ' + n);
  },
  readme() {
    return `# Generated art

This folder is the game's art. Every picture here started as the code-drawn version (written by tools/export_assets.js,
open the game with ?export=assets to fill in anything missing; &force=1 rewrites all of it from the code), and the
game loads whatever is here in place of the code-drawn art - so replacing a file changes the game, and deleting one
puts the code-drawn picture back. assets_backup/ keeps the original code-drawn set. Animated pieces are strips with
the frames left to right. The maps/ and ui/ folders are renders for reference only; the game does not load them.

- tiles/            every map tile (16x16; animated tiles as strips), tiles/edges/ the shadow and edge overlays
- sprites/field/    walking sheets, 16x24 per frame: a row per facing (down, left, right, up), three frames across
    party/          Isaac, Garet, Ivan, Mia, Felix, Jenna, Sheba, Piers, Kraden
    npcs/           the named people (Dora, Kyle, Saturos, Babi, Hama, ...)
    townsfolk/      the generated villager types, three variations each
    animals/, djinn/  the creatures of the field (two frames across)
- battle/party/<name>/  the back-view battle poses (64x64): idle (3 frames), step, attack, attack2, cast, cast2, hurt, guard, down, win
- battle/enemies/golden_sun/, battle/enemies/the_lost_age/  every monster, two idle frames (40x40 small, 72x72 large)
- battle/bosses/, battle/antagonists/, battle/djinn/  the bosses, Saturos and the other adepts, the wild Djinn
- battle/summons/   the summoned spirits (128x112, two frames)
- battle/backgrounds/  the battle backdrops by place (240x160, two frames)
- maps/             every map drawn whole (world/, places/, interiors/), as it stands at the current story flags
- ui/               the window frame, the bitmap font, the title screen
`;
  },
  async run(opts) {
    opts = opts || {}; this.batch = []; this.sent = 0; this.skipped = 0; this.log = []; this.force = !!opts.force;
    this.existing = {}; try { for (const f of await (await fetch('assets/manifest.json')).json()) this.existing[f] = true; } catch (e) { }
    this.addText('README.md', this.readme());
    for (const step of ['tiles', 'fieldSprites', 'battleParty', 'foes', 'summons', 'backgrounds', 'ui'].concat(opts.maps === false ? [] : ['maps'])) { try { await this[step](); } catch (e) { this.log.push(step + ' failed: ' + e.message); console.error(step, e); } }
    await this.flush();
    this.log.push('files written: ' + this.sent + (this.skipped ? ', left alone (already there): ' + this.skipped : ''));
    console.log(this.log.join('\n')); return this.log;
  },
};
window.ExportAssets = ExportAssets;   // reachable from the console and from Game.exportAssets, wherever this was evaluated
'export loaded';
