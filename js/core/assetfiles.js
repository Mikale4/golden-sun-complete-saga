// ---------- Art from files ----------
// assets/ is the game's art folder: every picture the code can draw for itself is also a named PNG there (tools/
// export_assets.js writes the code-drawn versions), and any file in it may be replaced by a drawing made outside the
// game - it is picked up here and takes the place of the code-drawn one. What the folder does not have, the code
// draws. The server's /assets/manifest.json says what exists, so only real files are asked for.
//   tiles/<name>.png              a tile, or a strip of its animation frames; tiles that the drawn sheets in
//                                 js/data/tilesheets.js know how to compose (roads, shores, cliff and fence sets,
//                                 landmarks) are put back together from their pieces through TileSheets.apply
//   sprites/field/<group>/<name>.png   walking sheets (3 columns x 4 rows), handled by SpriteSheets
//   battle/party/<name>/<pose>.png, battle/enemies|bosses|antagonists|djinn/<name>.png, battle/summons/<name>.png,
//   battle/backgrounds/<scene>.png     the battle pictures (strips of frames)
'use strict';
const AssetFiles = {
  files: null, ready: false, loaded: 0,
  slug(name) { return String(name).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); },
  has(path) { return !!(this.files && this.files[path]); },
  img(path) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'assets/' + path; }); },
  // the frames of a strip, each h wide (square frames unless a height is given)
  frames(img, fw, fh) { fw = fw || img.height; fh = fh || img.height; const n = Math.max(1, Math.round(img.width / fw)); const out = []; for (let i = 0; i < n; i++) { const c = Gfx.canvas(fw, fh); Gfx.ctx(c).drawImage(img, i * fw, 0, fw, fh, 0, 0, fw, fh); out.push(c); } return out; },
  async loadAll() {
    let list; try { list = await (await fetch('assets/manifest.json')).json(); } catch (e) { return; }
    this.files = {}; for (const f of list) this.files[f] = true;
    await Promise.all([this.tiles(), this.sheets(), this.fieldSprites(), this.battle()]);
    this.ready = true;
  },
  // ---- tiles: a file per tile replaces the drawn frames in place ----
  async tiles() {
    const jobs = [];
    // pieces of a landmark nobody registered (a building cut from one picture by tools/sort_blocks.py): the top row
    // is walked behind, a piece that is mostly empty is not solid, the rest is
    for (const f of Object.keys(this.files)) {
      const m = f.match(/^tiles\/([a-z0-9_]+)_r(\d+)c(\d+)\.png$/); if (!m || Tiles.defs[m[1] + '_r' + m[2] + 'c' + m[3]]) continue;
      const name = m[1] + '_r' + m[2] + 'c' + m[3], row = +m[2];
      jobs.push(this.img(f).then(im => { if (!im) return; const c = Gfx.canvas(TILE, TILE); Gfx.ctx(c).drawImage(im, 0, 0); const d = Gfx.ctx(c).getImageData(0, 0, TILE, TILE).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; const cover = n / (TILE * TILE);
        Tiles.reg(name, row === 0 ? { kind: 'landmark', solid: false, over: true } : { kind: 'landmark', solid: cover > 0.3 }, g => g.drawImage(c, 0, 0)); this.loaded++; }));
    }
    await Promise.all(jobs); jobs.length = 0;
    for (const t of Tiles.list) {
      const path = 'tiles/' + this.slug(t.name) + '.png'; if (!this.has(path)) continue;
      jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, TILE, TILE); t.frames = fr; t.animFrames = fr.length; this.loaded++; }));
    }
    await Promise.all(jobs);
  },
  // ---- the composed sets: each drawn sheet's cells gathered from their files and handed to TileSheets.apply ----
  async sheets() {
    if (typeof TILE_SHEETS === 'undefined' || typeof TileSheets === 'undefined') return;
    for (const s of TILE_SHEETS) {
      const cell = s.cell || TILE, cols = 8, rows = Math.ceil(s.names.length / cols);
      const canvas = Gfx.canvas(cols * cell, rows * cell), g = Gfx.ctx(canvas); let any = false; const given = new Set();   // only the cells a file really supplied replace the code's drawing
      const alias = s.alias || {};
      const n = cell / TILE; const parts = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) parts.push([n === 2 ? (j ? 'b' : 't') + (i ? 'r' : 'l') : 'r' + j + 'c' + i, i * TILE, j * TILE]);
      await Promise.all(s.names.map(async (drawn, k) => {
        const name = alias[drawn] || drawn; const x = (k % cols) * cell, y = Math.floor(k / cols) * cell;
        if (cell === TILE) {
          let path = 'tiles/' + this.slug(name) + '.png', frame = 0, m;
          if (!this.has(path) && (m = name.match(/^(.*)_(\d+)$/)) && this.has('tiles/' + this.slug(m[1]) + '.png')) { path = 'tiles/' + this.slug(m[1]) + '.png'; frame = +m[2]; }   // one frame of a strip
          if (!this.has(path)) return;
          const im = await this.img(path); if (!im) return; g.drawImage(im, frame * TILE, 0, TILE, TILE, x, y, TILE, TILE); any = true; given.add(drawn);
        } else {
          for (const [q, ox, oy] of parts) { const path = 'tiles/' + this.slug(name + '_' + q) + '.png'; if (!this.has(path)) continue; const im = await this.img(path); if (!im) continue; g.drawImage(im, 0, 0, TILE, TILE, x + ox, y + oy, TILE, TILE); any = true; given.add(drawn); }
        }
      }));
      if (any) { TileSheets.apply(canvas, s, given); this.loaded++; }
    }
  },
  // ---- walking sheets: the party, the named people, the townsfolk ----
  async fieldSprites() {
    if (typeof SpriteSheets === 'undefined') return;
    for (const id in CHARACTERS) { const look = CHARACTERS[id].look; if (!look || !look.sheet) continue; const path = 'sprites/field/party/' + look.sheet + '.png'; if (this.has(path)) { const im = await this.img(path); if (im) { SpriteSheets.apply(look.sheet, im); this.loaded++; } } }
    for (const id in NPC_LOOKS) { const look = NPC_LOOKS[id]; if (!look) continue; const path = 'sprites/field/npcs/' + this.slug(id) + '.png'; if (this.has(path)) { look.sheet = 'npc:' + id; const im = await this.img(path); if (im) { SpriteSheets.apply(look.sheet, im); this.loaded++; } } }
    for (const t in NPC_TYPES) for (let k = 1; k <= 3; k++) { const path = 'sprites/field/townsfolk/' + t + '_' + k + '.png'; if (!this.has(path)) continue; const im = await this.img(path); if (im) { SpriteSheets.apply(t + '_' + k, im); this.loaded++; } }   // the townsfolk: three drawings per type, shared out by npcLook
  },
  // ---- the battle pictures: files replace the drawn ones in the caches the battle reads from ----
  async battle() {
    const jobs = [];
    // the party's poses
    for (const id in CHARACTERS) { const look = CHARACTERS[id].look; for (const pose of ['idle', 'step', 'attack', 'attack2', 'cast', 'cast2', 'hurt', 'guard', 'down', 'win']) { const path = 'battle/party/' + this.slug(id) + '/' + pose + '.png'; if (!this.has(path)) continue; jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, BattleParty.W, BattleParty.H); BattleParty.files = BattleParty.files || {}; BattleParty.files[this.slug(id) + ':' + pose] = fr; this.loaded++; })); } }
    // monsters, by whichever folder holds them
    for (const name of Object.keys(ENEMY_DB)) { const slug = this.slug(name); const path = ['battle/enemies/golden_sun/', 'battle/enemies/the_lost_age/', 'battle/bosses/', 'battle/antagonists/', 'battle/djinn/'].map(d => d + slug + '.png').find(p => this.has(p)); if (!path) continue; jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, im.width / 2, im.height); Monsters.cache[name + ':0'] = fr[0]; Monsters.cache[name + ':1'] = fr[1] || fr[0]; this.loaded++; })); }
    for (const el of ['Venus', 'Mercury', 'Mars', 'Jupiter']) { const path = 'battle/djinn/' + el.toLowerCase() + '_djinni.png'; if (!this.has(path)) continue; jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, im.width / 2, im.height); Foes.cache[el + ' Djinni:0'] = fr[0]; Foes.cache[el + ' Djinni:1'] = fr[1] || fr[0]; this.loaded++; })); }
    for (const name of Object.keys(SUMMONS)) { const path = 'battle/summons/' + this.slug(name) + '.png'; if (!this.has(path)) continue; jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, im.width / 2, im.height); BattleSummons.cache[name + ':0'] = fr[0]; BattleSummons.cache[name + ':1'] = fr[1] || fr[0]; this.loaded++; })); }
    for (const scene of Object.keys(BattleBgs.scenes)) { const path = 'battle/backgrounds/' + scene + '.png'; if (!this.has(path)) continue; jobs.push(this.img(path).then(im => { if (!im) return; const fr = this.frames(im, SCREEN_W, SCREEN_H); BattleBgs.cache[scene + ':0'] = fr[0]; BattleBgs.cache[scene + ':1'] = fr[1] || fr[0]; this.loaded++; })); }
    await Promise.all(jobs);
  },
};
