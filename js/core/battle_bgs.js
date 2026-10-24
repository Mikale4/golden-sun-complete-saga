// ---------- Battle backdrops, drawn in code ----------
// One scene per place, after the originals' backdrops: Vale's rain-soaked lane, Sol Sanctum's torch-lit stone,
// Kolima's logged clearing, the blue brick of Mercury Lighthouse, the dunes, the ship's deck, the Colosso stands
// and so on, with the world map fought on grass, in woods, on the shore, in snow or sand. Each is a 240x160
// picture: the scenery above a ground that runs down under the party. A map picks its scene by id, else by the
// generic key it declares (grass, cave, forest, ...).
'use strict';
const BattleBgs = {
  cache: {},
  // map id prefixes -> scene (first match wins, longest prefixes first)
  BY_MAP: [
    ['sol_sanctum', 'sol_sanctum'], ['vale_cave', 'cave'], ['vale', 'vale'], ['vault', 'vale'], ['goma', 'cave'], ['bilibin_cave', 'cave'], ['bilibin_barricade', 'world_forest'], ['bilibin', 'world_grass'],
    ['kolima_forest', 'kolima_forest'], ['tret', 'tret_tree'], ['kolima', 'kolima_forest'], ['imil', 'world_snow'], ['mercury', 'mercury_lh'], ['hermes', 'world_snow'], ['fuchin_cave', 'fuchin_cave'], ['fuchin', 'world_forest'],
    ['mogall', 'mogall_forest'], ['xian', 'world_grass'], ['alpine', 'cliffs'], ['altin', 'altin_peak'], ['lama', 'cliffs'], ['lamakan', 'lamakan_desert'], ['lamakan_tunnel', 'cave'], ['kalay', 'world_grass'], ['lunpa', 'cave'],
    ['tolbi_ship', 'ship_deck'], ['ship_below', 'ship_below'], ['ship', 'ship_deck'], ['tolbi', 'world_grass'], ['colosso', 'colosso'], ['altmiller', 'altmiller_cave'], ['gondowan', 'cave'], ['suhalla_desert', 'suhalla_desert'], ['suhalla_gate', 'suhalla_gate'], ['suhalla', 'suhalla_desert'],
    ['lalivero', 'world_grass'], ['babi_lh', 'babi_lighthouse'], ['babi', 'babi_lighthouse'], ['tunnel', 'tunnel_ruins'], ['venus_lh_top', 'venus_aerie'], ['venus_lh_aerie', 'venus_aerie'], ['venus_lh', 'venus_lh'], ['venus', 'venus_lh'], ['crossbone', 'crossbone'], ['deadbeard', 'deadbeard_ship'],
    ['idejima', 'shore'], ['daila', 'world_grass'], ['kandorean', 'temple'], ['dehkan', 'cliffs'], ['madra_cave', 'cave'], ['madra_village', 'cave'], ['madra_ruins', 'tunnel_ruins'], ['madra_bridge', 'world_grass'], ['madra', 'world_grass'], ['osenia_cliffs', 'cliffs'], ['osenia_cavern', 'cave'], ['yampi_cave_in', 'cave'], ['yampi_tunnel', 'cave'], ['yampi', 'yampi_desert'], ['alhafra', 'world_grass'], ['alhafra_cave', 'cave'], ['alhafra_jail', 'cave'], ['alhafra_ship', 'ship_below'],
    ['mikasalla', 'world_grass'], ['garoh', 'cliffs'], ['airs_rock_in', 'airs_rock_inside'], ['airs_rock', 'airs_rock_outside'], ['gondowan_cliffs', 'cliffs'], ['naribwe', 'world_grass'], ['kibombo_mtns', 'kibombo_mtns'], ['kibombo', 'world_grass'], ['gabomba', 'gabomba'],
    ['lemurian_ship', 'lemurian_ship'], ['sea_of_time', 'sea_of_time'], ['lemuria', 'world_grass'], ['yallam', 'world_forest'], ['taopo', 'magma_rock'], ['aqua_rock_in', 'aqua_rock_inside'], ['aqua_rock', 'aqua_rock_outside'], ['izumo', 'world_grass'], ['gaia_rock_in', 'gaia_rock_inside'], ['gaia_rock', 'gaia_rock_outside'],
    ['champa', 'cliffs'], ['ankohl', 'ankohl_ruins'], ['ank_', 'ankohl_ruins'], ['izumo_ruins', 'cave'], ['gaia_maze', 'gaia_rock_inside'], ['tundaria', 'tundaria_tower'], ['shaman', 'cliffs'], ['trial_road', 'cliffs'], ['contigo', 'world_grass'], ['jupiter_lh_top', 'jupiter_aerie'], ['jupiter_lh_aerie', 'jupiter_aerie'], ['jupiter_lh', 'jupiter_lh'], ['anemos', 'anemos'], ['atteka', 'shore'],
    ['gondowan_settlement', 'world_forest'], ['magma_rock', 'magma_rock'], ['loho', 'cliffs'], ['prox', 'prox'], ['mars_lh_top', 'mars_aerie'], ['mars_lh_aerie', 'mars_aerie'], ['mars_lh', 'mars_lh'], ['northern_reaches', 'prox'], ['islet_cave', 'islet_cave'], ['treasure_isle', 'cave'],
  ],
  BY_KEY: { grass: 'world_grass', forest: 'world_forest', cave: 'cave', sand: 'desert', snow: 'world_snow', water: 'shore', ship: 'ship_deck', lighthouse: 'lighthouse', temple: 'temple', ruins: 'ruins', lava: 'magma_rock', swamp: 'swamp', dark: 'dark', desert_world: 'desert', shore: 'shore', sea: 'sea' },
  pick(mapId, bgKey) {
    const id = mapId || '';
    if (id.startsWith('world_')) return this.BY_KEY[bgKey] || 'world_grass';
    let best = null; for (const [pre, scene] of this.BY_MAP) if (id.startsWith(pre) && (!best || pre.length > best[0].length)) best = [pre, scene];
    if (best) return best[1];
    return this.BY_KEY[bgKey] || 'world_grass';
  },
  render(scene, frame) {
    frame = frame ? 1 : 0; const key = scene + ':' + frame;
    if (this.cache[key]) return this.cache[key];
    const fn = this.scenes[scene] || this.scenes.world_grass;
    const c = Gfx.canvas(240, 160), g = Gfx.ctx(c);
    const K = this.kit(g, hashStr(scene));
    fn(K, frame);
    return this.cache[key] = c;
  },
  // ---- the painter's tools: skies, grounds, trees, rocks, walls ----
  kit(g, seed) {
    const r = seededRandom(seed);
    const K = {
      g, r,
      R: (x, y, w, h, col) => { if (col && w > 0 && h > 0) Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col); },
      P: (x, y, col) => { if (col) Gfx.px(g, Math.round(x), Math.round(y), col); },
      E: (cx, cy, rx, ry, col) => { if (col) Gfx.ellipse(g, Math.round(cx), Math.round(cy), Math.round(rx), Math.round(ry), col); },
      T: (x0, y0, x1, y1, x2, y2, col) => { if (col) Gfx.tri(g, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), col); },
      L: (x0, y0, x1, y1, col) => { if (col) Gfx.line(g, x0, y0, x1, y1, col); },
      sky: (top, bottom, h) => Gfx.vgrad(g, 0, 0, 240, h || 100, top, bottom, 24),
      // a ground from y down: a base colour, a lighter horizon line, and a scatter of specks
      ground: (y, col, n) => { K.R(0, y, 240, 160 - y, col); K.R(0, y, 240, 2, tint(col, 0.25)); for (let i = 0; i < (n === undefined ? 40 : n); i++) { const x = Math.floor(r() * 240), yy = y + 4 + Math.floor(r() * (150 - y)); K.R(x, yy, 2 + Math.floor(r() * 4), 1, (i % 3) ? shade(col, 0.8) : tint(col, 0.15)); } },
      // the checkered floor of the originals: tiles in two shades, foreshortened toward the horizon
      tiles: (y, a, b) => { let y0 = y; for (let row = 0; row < 7; row++) { const h = 4 + row * 3; const w = 14 + row * 7; for (let i = -1; i < 240 / w + 2; i++) { const x = Math.round(i * w - row * 9); K.R(x, y0, w, h, (i + row) % 2 ? a : b); K.R(x, y0, w, 1, tint((i + row) % 2 ? a : b, 0.12)); } y0 += h; } K.R(0, y0, 240, 160 - y0, b); },
      // a round-canopied tree
      tree: (x, y, s, leaf, trunk) => { const tr = trunk || '#6a4020'; K.R(x - s * 0.12, y - s * 0.7, s * 0.24, s * 0.72, tr); K.R(x - s * 0.12, y - s * 0.7, s * 0.08, s * 0.7, shade(tr, 0.7)); K.E(x, y - s * 0.95, s * 0.5, s * 0.42, shade(leaf, 0.75)); K.E(x - s * 0.1, y - s * 1.05, s * 0.42, s * 0.36, leaf); K.E(x - s * 0.22, y - s * 1.18, s * 0.22, s * 0.16, tint(leaf, 0.3)); },
      // a low bush
      bush: (x, y, s, leaf) => { K.E(x, y, s, s * 0.6, shade(leaf, 0.75)); K.E(x - s * 0.2, y - s * 0.2, s * 0.7, s * 0.45, leaf); K.E(x - s * 0.4, y - s * 0.35, s * 0.3, s * 0.2, tint(leaf, 0.3)); },
      // a boulder
      rock: (x, y, s, col) => { K.E(x, y, s, s * 0.65, shade(col, 0.7)); K.E(x - s * 0.15, y - s * 0.15, s * 0.8, s * 0.5, col); K.E(x - s * 0.4, y - s * 0.35, s * 0.3, s * 0.18, tint(col, 0.3)); },
      // a mountain range along the horizon
      mountains: (y, col, n, h) => { for (let i = 0; i < n; i++) { const x = -20 + i * (280 / n) + Math.floor(r() * 20), hh = (h || 40) * (0.6 + r() * 0.6); K.T(x - 40, y, x, y - hh, x + 40, y, col); K.T(x - 10, y - hh * 0.7, x, y - hh, x + 14, y - hh * 0.6, tint(col, 0.3)); } },
      // a wall of bricks with a darker mortar
      bricks: (x, y, w, h, col, bw, bh) => { bw = bw || 16; bh = bh || 8; K.R(x, y, w, h, shade(col, 0.6)); for (let row = 0; row * bh < h; row++) for (let i = -1; i * bw < w + bw; i++) { const bx = x + i * bw + (row % 2 ? bw / 2 : 0), by = y + row * bh; const cx0 = Math.max(x, bx), cx1 = Math.min(x + w, bx + bw - 1); if (cx1 > cx0) { K.R(cx0, by, cx1 - cx0, bh - 1, (i + row) % 5 === 0 ? shade(col, 0.85) : col); K.R(cx0, by, cx1 - cx0, 1, tint(col, 0.2)); } } },
      // a stone pillar
      pillar: (x, y0, y1, w, col) => { K.R(x - w / 2, y0, w, y1 - y0, col); K.R(x - w / 2, y0, w * 0.3, y1 - y0, tint(col, 0.2)); K.R(x + w / 2 - w * 0.25, y0, w * 0.25, y1 - y0, shade(col, 0.7)); K.R(x - w / 2 - 2, y0 - 3, w + 4, 4, tint(col, 0.15)); K.R(x - w / 2 - 2, y1 - 3, w + 4, 4, shade(col, 0.8)); },
      // a torch flame on a wall
      torch: (x, y, f) => { K.R(x - 1, y, 3, 8, '#604020'); K.E(x, y - 3 - f, 4, 6, '#f08030'); K.E(x, y - 4 - f, 2, 3, '#ffe060'); K.g.fillStyle = 'rgba(255,180,80,0.18)'; K.g.beginPath(); K.g.ellipse(x, y, 26, 20, 0, 0, Math.PI * 2); K.g.fill(); },
      // an arched doorway into darkness
      arch: (x, y, w, h, col) => { K.R(x - w / 2, y - h, w, h, col); K.E(x, y - h, w / 2, w / 2, col); },
      // clouds
      cloud: (x, y, s, col) => { col = col || '#ffffff'; K.E(x, y, s, s * 0.45, col); K.E(x - s * 0.5, y + s * 0.1, s * 0.6, s * 0.35, col); K.E(x + s * 0.5, y + s * 0.1, s * 0.6, s * 0.35, col); },
      // water: a band with light ripples
      water: (y, h, col, n) => { K.R(0, y, 240, h, col); for (let i = 0; i < (n || 24); i++) { const x = Math.floor(r() * 240), yy = y + 2 + Math.floor(r() * (h - 4)); K.R(x, yy, 6 + Math.floor(r() * 10), 1, tint(col, 0.35)); } },
      // a dune
      dune: (x, y, w, h, col) => { K.E(x, y, w, h, col); K.E(x - w * 0.2, y - h * 0.2, w * 0.6, h * 0.5, tint(col, 0.12)); },
      grass: (y, col, n) => { for (let i = 0; i < n; i++) { const x = Math.floor(r() * 240), yy = y + Math.floor(r() * (150 - y)); K.L(x, yy, x + (i % 2 ? 1 : -1), yy - 3, tint(col, 0.3)); } },
    };
    return K;
  },
  scenes: {
    // ---- the world map: open grass with a great oak, a wood, the shore, snow, sand ----
    world_grass(K, f) {
      K.sky('#5090e0', '#c8e8ff', 96); K.cloud(50, 22, 20); K.cloud(170, 34, 26); K.cloud(220, 18, 14);
      K.mountains(88, '#88b070', 5, 30); K.E(60, 92, 90, 8, '#78b058'); K.E(200, 92, 70, 7, '#78b058');
      K.ground(94, '#5cb04c'); K.grass(100, '#5cb04c', 60);
      K.tree(74, 96, 52, '#3c9040'); K.tree(206, 90, 30, '#48a048'); K.bush(150, 96, 12, '#48a040'); K.bush(20, 100, 9, '#48a040');
      K.rock(120, 128, 8, '#8a9a90'); K.rock(30, 140, 6, '#8a9a90'); K.rock(220, 120, 5, '#8a9a90');
    },
    world_forest(K, f) {
      K.sky('#3860a0', '#98c8a0', 96);
      for (let i = 0; i < 7; i++) K.tree(-10 + i * 40 + Math.floor(K.r() * 14), 92 - Math.floor(K.r() * 6), 44 + Math.floor(K.r() * 16), i % 2 ? '#2c7838' : '#3c8c40', '#5a3818');
      K.ground(94, '#3c8040'); K.grass(100, '#3c8040', 50); K.bush(60, 100, 12, '#2c7030'); K.bush(180, 98, 14, '#2c7030'); K.bush(120, 104, 8, '#2c7030');
      for (let i = 0; i < 12; i++) K.P(Math.floor(K.r() * 240), 100 + Math.floor(K.r() * 50), '#f0e080');
    },
    shore(K, f) {
      K.sky('#4890e0', '#d0ecff', 80); K.cloud(40, 20, 22); K.cloud(190, 30, 20);
      K.water(66, 26, '#3888d8', 40); K.R(0, 66, 240, 1, '#a0d8ff'); for (let i = 0; i < 6; i++) K.R(i * 42 + Math.floor(K.r() * 20), 86 + f * 2, 18, 2, '#ffffff');
      K.ground(92, '#e8d8a0'); for (let i = 0; i < 20; i++) K.P(Math.floor(K.r() * 240), 96 + Math.floor(K.r() * 60), '#f8f0d0');
      K.rock(30, 100, 10, '#9098a0'); K.rock(200, 96, 12, '#9098a0'); K.rock(215, 104, 6, '#9098a0'); K.E(100, 130, 6, 3, '#f0f0f0'); K.E(160, 145, 5, 2, '#f0f0f0');
    },
    sea(K, f) {
      K.sky('#3878d0', '#b8dcff', 70); K.cloud(60, 24, 24); K.cloud(200, 18, 18);
      K.water(64, 96, '#2870c8', 60); for (let i = 0; i < 10; i++) K.R(Math.floor(K.r() * 240), 100 + Math.floor(K.r() * 50) + f, 10 + Math.floor(K.r() * 14), 1, '#ffffff');
      K.R(0, 64, 240, 1, '#90c8ff');
    },
    world_snow(K, f) {
      K.sky('#8098c0', '#e0ecff', 96); K.mountains(90, '#c8d8e8', 5, 40); K.mountains(92, '#b0c0d8', 4, 26);
      K.ground(94, '#e8f0f8', 20);
      for (const x of [40, 150, 230]) { K.R(x - 2, 66, 4, 30, '#503820'); K.L(x, 72, x - 14, 60, '#503820'); K.L(x, 78, x + 12, 66, '#503820'); K.L(x, 68, x + 8, 54, '#503820'); K.L(x - 8, 66, x - 14, 56, '#503820'); }   // bare trees
      K.E(90, 100, 30, 5, '#f8fcff'); K.E(200, 110, 24, 4, '#f8fcff'); for (let i = 0; i < 20; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 96), '#ffffff');
    },
    desert(K, f) {
      K.sky('#6088d8', '#f0e0b0', 72); K.dune(60, 76, 90, 18, '#d8c070'); K.dune(190, 80, 100, 20, '#e0c878'); K.dune(120, 90, 80, 14, '#e8d080');
      K.ground(92, '#ecd890', 30); for (let i = 0; i < 8; i++) K.L(0, 100 + i * 7, 240, 104 + i * 7 + (i % 2) * 3, '#e0c878');
    },
    swamp(K, f) {
      K.sky('#405840', '#90a878', 96); for (let i = 0; i < 5; i++) K.tree(20 + i * 52, 90, 40, '#4a7840', '#403020');
      K.water(88, 24, '#4a6a48', 20); K.ground(110, '#5a6a40', 30); K.bush(60, 112, 10, '#5a8040'); K.bush(190, 116, 12, '#5a8040');
    },
    dark(K, f) {
      K.sky('#100818', '#301838', 100); K.ground(96, '#281830', 20); for (let i = 0; i < 30; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 90), '#807090');
    },
    // ---- Vale under the storm: thatched roofs among the trees, rain slanting down ----
    vale(K, f) {
      K.sky('#203058', '#4058a0', 96);
      K.mountains(70, '#283868', 4, 40);
      for (let i = 0; i < 6; i++) K.tree(10 + i * 44, 88, 36 + (i % 2) * 8, '#2c6848', '#3a2818');
      for (const [x, w] of [[40, 50], [130, 60], [214, 44]]) { K.R(x - w / 2, 62, w, 24, '#c8d0e0'); K.R(x - w / 2 + 6, 70, 8, 8, '#f0e080'); K.R(x + w / 2 - 14, 70, 8, 8, '#f0e080'); K.T(x - w / 2 - 6, 62, x + w / 2 + 6, 62, x, 40, '#a0a848'); K.R(x - w / 2 - 6, 60, w + 12, 3, '#c0c860'); }   // cottages with lit windows
      K.ground(94, '#3c7848', 30); K.E(80, 100, 26, 4, '#4a8858'); K.E(190, 112, 30, 4, '#4a8858');
      for (let i = 0; i < 60; i++) { const x = Math.floor(K.r() * 240), y = Math.floor(K.r() * 150); K.L(x, y + f * 3, x - 2, y + 7 + f * 3, 'rgba(200,220,255,0.45)'); }   // the rain
    },
    // ---- Sol Sanctum: grey stone halls lit by torches ----
    sol_sanctum(K, f) {
      K.bricks(0, 0, 240, 90, '#6870a0', 20, 9); K.R(0, 0, 240, 14, '#383c60');
      K.pillar(28, 6, 92, 14, '#7880b0'); K.pillar(120, 4, 92, 16, '#7880b0'); K.pillar(212, 6, 92, 14, '#7880b0');
      K.arch(74, 92, 26, 40, '#181828'); K.arch(166, 92, 26, 40, '#181828');
      K.torch(52, 40, f); K.torch(96, 44, f); K.torch(144, 44, f); K.torch(190, 40, f);
      K.tiles(92, '#8a80a0', '#6a6488');
    },
    // ---- caves: rough brown rock, a pool of water, a glow in the depths ----
    cave(K, f) {
      K.R(0, 0, 240, 96, '#4a3428'); for (let i = 0; i < 9; i++) { const x = i * 28; K.T(x - 6, 0, x + 22, 0, x + 8, 30 + Math.floor(K.r() * 30), '#5a4030'); }
      for (let i = 0; i < 6; i++) { const x = 10 + i * 44; K.R(x, 40, 22, 56, '#6a4c38'); K.R(x, 40, 6, 56, '#7a5c44'); K.R(x + 16, 40, 6, 56, '#4a3020'); }
      K.arch(120, 92, 44, 40, '#201410'); K.g.fillStyle = 'rgba(255,160,60,0.16)'; K.g.beginPath(); K.g.ellipse(120, 70, 50, 30, 0, 0, Math.PI * 2); K.g.fill();
      K.water(86, 18, '#3878c0', 20); K.E(120, 92, 60, 8, '#4890d8'); K.ground(102, '#6a5040', 30); K.rock(24, 108, 10, '#7a6050'); K.rock(212, 112, 12, '#7a6050');
    },
    fuchin_cave(K, f) {
      K.R(0, 0, 240, 96, '#3a5040'); for (let i = 0; i < 8; i++) { const x = i * 32; K.T(x - 6, 0, x + 26, 0, x + 10, 24 + Math.floor(K.r() * 30), '#4a6048'); }
      for (let i = 0; i < 5; i++) { const x = 14 + i * 50; K.R(x, 30, 26, 60, '#5a6a40'); K.R(x, 30, 8, 60, '#6a7a48'); K.E(x + 13, 40, 14, 10, '#e0a040'); K.E(x + 13, 40, 8, 6, '#f0e060'); }   // glowing fungus
      K.arch(120, 90, 40, 44, '#101810');
      K.water(84, 30, '#38a0c0', 30); for (const x of [40, 110, 180]) K.E(x, 100 + (x % 3), 16, 5, '#7a8850');   // stepping stones
      K.ground(112, '#60a0b0', 20); K.R(0, 112, 240, 40, '#3890b0'); for (let i = 0; i < 14; i++) K.R(Math.floor(K.r() * 240), 116 + Math.floor(K.r() * 36), 10, 1, '#80d0e0');
    },
    altmiller_cave(K, f) {
      K.R(0, 0, 240, 96, '#302848'); for (let i = 0; i < 6; i++) { const x = 10 + i * 42; K.arch(x + 14, 92, 30, 50, '#181030'); K.R(x, 20, 6, 72, '#4a4068'); }
      K.torch(70, 50, f); K.torch(170, 50, f); K.g.fillStyle = 'rgba(255,160,60,0.14)'; K.g.fillRect(0, 60, 240, 36);
      K.tiles(92, '#5a5078', '#403860');
    },
    altin_peak(K, f) {
      K.R(0, 0, 240, 96, '#4a5058'); for (let i = 0; i < 8; i++) { const x = i * 32; K.T(x - 4, 0, x + 26, 0, x + 10, 30 + Math.floor(K.r() * 30), '#5a6068'); }
      for (let i = 0; i < 5; i++) { const x = 18 + i * 50; K.R(x, 36, 20, 60, '#606870'); K.R(x, 36, 5, 60, '#788088'); }
      K.arch(120, 92, 36, 38, '#101418'); K.torch(60, 52, f); K.torch(180, 52, f);
      K.water(88, 14, '#4890d0', 16); K.ground(100, '#6a7078', 30); K.R(0, 100, 240, 3, '#8a9098');
    },
    crossbone(K, f) {
      K.R(0, 0, 240, 96, '#6a3878'); for (let i = 0; i < 8; i++) { const x = i * 32; K.T(x - 4, 0, x + 26, 0, x + 10, 28 + Math.floor(K.r() * 30), '#7a4888'); }
      for (let i = 0; i < 5; i++) { const x = 16 + i * 50; K.R(x, 34, 22, 62, '#8a5898'); K.R(x, 34, 6, 62, '#a070b0'); }
      K.arch(120, 92, 40, 40, '#301040'); K.E(120, 60, 16, 10, '#f0e080'); K.E(120, 60, 8, 5, '#ffffff');
      K.tiles(92, '#a880b0', '#806090');
    },
    islet_cave(K, f) {
      K.R(0, 0, 240, 96, '#405848'); for (let i = 0; i < 6; i++) { const x = 8 + i * 42; K.R(x, 20, 26, 76, '#508060'); K.R(x, 20, 8, 76, '#60a070'); }
      K.arch(120, 92, 36, 44, '#102018'); K.rock(60, 84, 24, '#a08050'); K.rock(180, 86, 26, '#a08050'); K.rock(120, 100, 14, '#b09060');
      K.tiles(94, '#68a880', '#488860');
    },
    // ---- the woods of Kolima and Mogall ----
    kolima_forest(K, f) {
      K.sky('#5090c8', '#a8d8a0', 96);
      for (let i = 0; i < 6; i++) K.tree(-4 + i * 48 + Math.floor(K.r() * 10), 90, 50 + Math.floor(K.r() * 14), i % 2 ? '#3c9040' : '#50a848', '#7a4a20');
      K.tree(190, 100, 70, '#48a040', '#8a5a28');
      K.ground(94, '#78c050'); K.grass(100, '#78c050', 60); for (let i = 0; i < 10; i++) K.P(Math.floor(K.r() * 240), 100 + Math.floor(K.r() * 50), '#ffffff');
      K.R(16, 104, 60, 14, '#a06830'); K.E(16, 111, 5, 7, '#c89050'); K.E(76, 111, 5, 7, '#7a4a20'); K.R(16, 104, 60, 3, '#c08040');   // a felled log
      K.E(140, 130, 10, 5, '#8a5a28'); K.E(140, 128, 8, 3, '#c09050');   // a stump
      K.bush(110, 100, 14, '#48a040'); K.bush(230, 110, 12, '#48a040');
    },
    mogall_forest(K, f) {
      K.sky('#284870', '#88b888', 96);
      for (let i = 0; i < 8; i++) K.tree(-8 + i * 36 + Math.floor(K.r() * 8), 88 + (i % 2) * 6, 48 + Math.floor(K.r() * 20), i % 2 ? '#2c6c38' : '#388040', '#4a3018');
      K.tree(60, 104, 80, '#2c7038', '#5a3a18');
      K.ground(96, '#4c9048'); K.grass(100, '#4c9048', 40); K.bush(150, 104, 16, '#38803c'); K.bush(220, 100, 12, '#38803c'); K.E(120, 134, 8, 4, '#6a4a28');
    },
    tret_tree(K, f) {
      K.R(0, 0, 240, 96, '#6a4830'); for (let i = 0; i < 12; i++) { const x = i * 22; K.R(x, 0, 12, 96, i % 2 ? '#7a5838' : '#5a3c28'); K.R(x + 2, 0, 3, 96, '#8a6848'); }
      K.g.fillStyle = 'rgba(40,20,10,0.35)'; K.g.fillRect(0, 60, 240, 36);
      for (let i = 0; i < 4; i++) { const x = 20 + i * 60; K.L(x, 10, x + 30, 10, '#e0e0e0'); K.L(x, 10, x, 40, '#e0e0e0'); K.L(x, 10, x + 30, 40, '#e0e0e0'); K.L(x + 15, 10, x + 15, 40, '#e0e0e0'); K.L(x, 25, x + 30, 25, '#e0e0e0'); }   // cobwebs
      for (let i = 0; i < 24; i++) { const x = i * 10 + Math.floor(K.r() * 4); K.T(x - 5, 96, x + 5, 96, x, 72 - Math.floor(K.r() * 14), '#e0b040'); K.T(x - 2, 96, x + 2, 96, x, 82, '#f0e080'); }   // dead yellow grass
      K.ground(96, '#c8a040', 30);
    },
    // ---- lighthouses and temples ----
    mercury_lh(K, f) {
      K.bricks(0, 0, 240, 92, '#3860c0', 20, 9); K.R(0, 0, 240, 10, '#202860');
      K.arch(60, 92, 40, 46, '#101848'); K.arch(180, 92, 40, 46, '#101848'); K.pillar(120, 8, 92, 16, '#4870d0');
      K.R(6, 30, 30, 56, '#68b0e0'); for (let i = 0; i < 8; i++) K.R(8 + (i % 3) * 8, 32 + i * 6, 6, 3, '#c0f0ff'); K.E(21, 88, 22, 5, '#a0e0ff');   // a waterfall down the wall
      K.tiles(92, '#5ab060', '#3c8848');
    },
    venus_lh(K, f) {
      K.bricks(0, 0, 240, 92, '#a050c0', 20, 9); K.R(0, 0, 240, 10, '#502870');
      K.arch(46, 92, 34, 46, '#280838'); K.arch(194, 92, 34, 46, '#280838'); K.pillar(120, 8, 92, 18, '#b868d0');
      K.g.fillStyle = 'rgba(255,200,255,0.16)'; K.g.beginPath(); K.g.ellipse(120, 50, 60, 36, 0, 0, Math.PI * 2); K.g.fill();
      K.tiles(92, '#c8b878', '#a89858');
    },
    venus_aerie(K, f) {
      K.sky('#5070d0', '#c0d0f0', 60); K.cloud(40, 20, 20); K.cloud(200, 26, 24);
      K.R(0, 60, 240, 36, '#b0a0d0'); K.R(40, 40, 160, 20, '#c0b0e0'); K.R(60, 30, 120, 10, '#d0c0f0'); for (const x of [56, 120, 184]) { K.R(x - 6, 6, 12, 24, '#c8b8e0'); K.E(x, 4, 6, 5, '#d8c8f0'); }   // the aerie's stair and statues
      K.tiles(92, '#c0b0d8', '#a090c0');
    },
    lighthouse(K, f) {
      K.bricks(0, 0, 240, 92, '#6070a0', 20, 9); K.R(0, 0, 240, 10, '#303860');
      K.arch(60, 92, 40, 46, '#181c38'); K.arch(180, 92, 40, 46, '#181c38'); K.pillar(120, 8, 92, 16, '#7080b0');
      K.tiles(92, '#8890b0', '#687090');
    },
    babi_lighthouse(K, f) {
      K.bricks(0, 0, 240, 92, '#c8b088', 20, 9); K.R(0, 0, 240, 10, '#786040');
      K.arch(70, 92, 36, 46, '#403020'); K.arch(170, 92, 36, 46, '#403020'); K.pillar(20, 8, 92, 14, '#d8c098'); K.pillar(220, 8, 92, 14, '#d8c098'); K.pillar(120, 8, 92, 14, '#d8c098');
      K.tiles(92, '#e0c890', '#c0a870');
    },
    tunnel_ruins(K, f) {
      K.bricks(0, 0, 240, 92, '#60a0b0', 20, 9); K.R(0, 0, 240, 10, '#305060');
      for (let i = 0; i < 5; i++) K.R(80, 40 + i * 10, 80, 10, i % 2 ? '#80c0d0' : '#70b0c0'); K.R(60, 82, 120, 10, '#90d0e0');   // a stair rising in the middle
      K.arch(30, 92, 30, 40, '#183038'); K.arch(210, 92, 30, 40, '#183038');
      K.tiles(92, '#88c0c8', '#68a0a8');
    },
    temple(K, f) {
      K.bricks(0, 0, 240, 92, '#a08860', 20, 9); K.R(0, 0, 240, 10, '#504028');
      K.pillar(30, 8, 92, 14, '#b89870'); K.pillar(120, 8, 92, 16, '#b89870'); K.pillar(210, 8, 92, 14, '#b89870'); K.arch(75, 92, 30, 40, '#302010'); K.arch(165, 92, 30, 40, '#302010');
      K.torch(52, 44, f); K.torch(188, 44, f); K.tiles(92, '#c0a880', '#a08860');
    },
    ruins(K, f) {
      K.sky('#6080b0', '#c0c8d8', 60); K.bricks(0, 50, 240, 42, '#909880', 20, 9); K.pillar(40, 20, 92, 14, '#a0a890'); K.pillar(200, 30, 92, 14, '#a0a890'); K.R(30, 14, 20, 8, '#a0a890'); K.arch(120, 92, 36, 44, '#303830');
      K.tiles(92, '#a8a890', '#888870'); K.bush(70, 100, 10, '#48a040'); K.bush(180, 104, 8, '#48a040');
    },
    jupiter_lh(K, f) {
      K.bricks(0, 0, 240, 92, '#9070c0', 20, 9); K.R(0, 0, 240, 10, '#403060');
      K.arch(60, 92, 40, 46, '#201038'); K.arch(180, 92, 40, 46, '#201038'); K.pillar(120, 8, 92, 16, '#a888d0'); K.R(112, 30, 16, 30, '#c0a0e0'); K.E(120, 28, 8, 6, '#d8c0f0');   // a statue on the pillar
      K.tiles(92, '#b0a0c8', '#9080a8');
    },
    jupiter_aerie(K, f) {
      K.sky('#8060c0', '#e0c8f0', 70); K.cloud(30, 20, 18, '#f0e0ff'); K.cloud(210, 30, 22, '#f0e0ff');
      K.R(0, 70, 240, 26, '#b090d0'); K.R(60, 56, 120, 14, '#c0a0e0'); K.E(120, 44, 26, 22, '#e060e0'); K.E(120, 44, 18, 15, '#f0a0f0'); K.E(112, 38, 6, 5, '#ffffff');   // the great sphere of the beacon
      for (let i = 0; i < 6; i++) K.L(90 + i * 12, 20, 96 + i * 12, 40, '#f0f060');
      K.tiles(92, '#c8b0e0', '#a890c0');
    },
    mars_lh(K, f) {
      K.bricks(0, 0, 240, 92, '#c07040', 20, 9); K.R(0, 0, 240, 10, '#603020');
      K.arch(60, 92, 40, 46, '#301008'); K.arch(180, 92, 40, 46, '#301008'); K.pillar(120, 8, 92, 16, '#d08850'); K.torch(30, 44, f); K.torch(210, 44, f);
      K.water(84, 10, '#e05020', 12); K.tiles(92, '#d0a070', '#b08050');
    },
    mars_aerie(K, f) {
      K.sky('#301848', '#804060', 70); for (let i = 0; i < 20; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 60), '#ffffff');
      K.R(0, 70, 240, 26, '#a05050'); for (const x of [40, 120, 200]) { K.R(x - 8, 40, 16, 30, '#c0c0d0'); K.E(x, 36, 10, 8, '#d0d0e0'); K.T(x - 10, 36, x - 16, 22, x - 4, 30, '#d0d0e0'); K.T(x + 10, 36, x + 16, 22, x + 4, 30, '#d0d0e0'); }   // the dragon statues
      K.E(120, 76, 30, 8, '#f08040'); K.E(120, 76, 18, 5, '#ffe060'); K.tiles(92, '#c07060', '#a05048');
    },
    anemos(K, f) {
      K.bricks(0, 0, 240, 92, '#d09040', 20, 9); K.R(0, 0, 240, 10, '#704820');
      K.pillar(40, 8, 92, 14, '#e0a850'); K.pillar(200, 8, 92, 14, '#e0a850'); K.arch(120, 92, 44, 50, '#402008'); K.E(120, 60, 16, 12, '#f0e080'); K.E(120, 60, 8, 6, '#ffffff');
      K.tiles(92, '#e0b060', '#c09040');
    },
    ankohl_ruins(K, f) {
      K.bricks(0, 0, 240, 92, '#c8b060', 20, 9); K.R(0, 0, 240, 10, '#604818');
      K.arch(50, 92, 36, 46, '#302810'); K.arch(190, 92, 36, 46, '#302810'); K.R(100, 30, 40, 62, '#a89848'); K.E(120, 28, 20, 10, '#a89848'); K.R(110, 44, 20, 14, '#302810');   // the great face
      for (let i = 0; i < 6; i++) K.L(20 + i * 40, 20, 24 + i * 40, 90, '#508040');   // vines
      K.tiles(92, '#d8c078', '#b8a058');
    },
    gabomba(K, f) {
      K.bricks(0, 0, 240, 92, '#c0a060', 20, 9); K.R(0, 0, 240, 12, '#503818');
      for (const [x, c] of [[50, '#40a0c0'], [120, '#c04040'], [190, '#60a060']]) { K.R(x - 16, 50, 32, 42, c); K.E(x, 50, 16, 8, tint(c, 0.2)); }   // the cogs and drums of the statue's insides
      K.tiles(92, '#6ab070', '#4a9050');
    },
    tundaria_tower(K, f) {
      K.bricks(0, 0, 240, 92, '#5878b0', 20, 9); K.R(0, 0, 240, 10, '#283860');
      K.arch(60, 92, 40, 46, '#101830'); K.arch(180, 92, 40, 46, '#101830'); for (let i = 0; i < 12; i++) K.P(Math.floor(K.r() * 240), 12 + Math.floor(K.r() * 60), '#e0f0ff');
      K.tiles(92, '#a0c0e0', '#80a0c0');
    },
    // ---- the Rocks ----
    airs_rock_outside(K, f) {
      K.sky('#5090d8', '#e8e0c0', 70); for (let i = 0; i < 6; i++) { const x = 20 + i * 44; K.R(x - 14, 30 + (i % 2) * 10, 28, 66, '#c07890'); K.R(x - 14, 30 + (i % 2) * 10, 8, 66, '#d898a8'); K.T(x - 16, 30 + (i % 2) * 10, x + 16, 30 + (i % 2) * 10, x, 14 + (i % 2) * 10, '#d090a0'); }
      K.ground(94, '#c8c060', 30); K.bush(60, 100, 10, '#88a048'); K.bush(190, 104, 12, '#88a048');
    },
    airs_rock_inside(K, f) {
      K.bricks(0, 0, 240, 92, '#a07060', 20, 9); K.R(0, 0, 240, 10, '#503028'); K.arch(120, 92, 44, 50, '#301818'); K.pillar(30, 8, 92, 14, '#b08070'); K.pillar(210, 8, 92, 14, '#b08070');
      K.tiles(92, '#b89080', '#987060');
    },
    aqua_rock_outside(K, f) {
      K.sky('#4080d0', '#c0e0f0', 70); for (let i = 0; i < 6; i++) { const x = 20 + i * 44; K.R(x - 14, 26 + (i % 2) * 12, 28, 70, '#6098c0'); K.R(x - 14, 26 + (i % 2) * 12, 8, 70, '#80b8d8'); }
      K.R(40, 20, 16, 76, '#c0f0ff'); for (let i = 0; i < 6; i++) K.R(42 + (i % 2) * 6, 24 + i * 10, 6, 4, '#ffffff'); K.water(88, 8, '#60c0e0', 10);
      K.ground(96, '#e0d090', 30);
    },
    aqua_rock_inside(K, f) {
      K.bricks(0, 0, 240, 92, '#4070b0', 20, 9); K.R(0, 0, 240, 10, '#203058'); K.arch(120, 92, 44, 50, '#101838');
      K.R(20, 20, 20, 72, '#a0e0ff'); for (let i = 0; i < 6; i++) K.R(22 + (i % 2) * 8, 24 + i * 10, 6, 4, '#ffffff'); K.water(84, 12, '#3890d0', 14);
      K.tiles(92, '#6090c0', '#4070a0');
    },
    gaia_rock_outside(K, f) {
      K.sky('#5090d8', '#e0e8c0', 70); for (let i = 0; i < 6; i++) { const x = 20 + i * 44; K.rock(x, 84, 28, '#c8a050'); } K.tree(120, 90, 46, '#3c9040');
      K.ground(94, '#d8c070', 30); K.grass(100, '#c8b860', 30);
    },
    gaia_rock_inside(K, f) {
      K.bricks(0, 0, 240, 92, '#c8a050', 20, 9); K.R(0, 0, 240, 10, '#604818'); K.arch(120, 92, 44, 50, '#302008'); K.pillar(30, 8, 92, 14, '#d8b060'); K.pillar(210, 8, 92, 14, '#d8b060');
      for (let i = 0; i < 5; i++) K.L(30 + i * 45, 14, 34 + i * 45, 88, '#508040');
      K.tiles(92, '#d0b070', '#b09050');
    },
    magma_rock(K, f) {
      K.R(0, 0, 240, 96, '#602818'); for (let i = 0; i < 8; i++) { const x = i * 32; K.T(x - 4, 0, x + 26, 0, x + 10, 30 + Math.floor(K.r() * 30), '#803828'); }
      for (let i = 0; i < 5; i++) { const x = 16 + i * 50; K.R(x, 34, 22, 62, '#904030'); K.R(x, 34, 6, 62, '#a85040'); }
      K.arch(120, 92, 40, 40, '#300808'); K.water(84, 14, '#f06020', 16); K.E(120, 92, 60, 8, '#f08030'); K.E(120, 92, 40, 5, '#ffd040');
      K.ground(100, '#704030', 30); for (let i = 0; i < 12; i++) K.R(Math.floor(K.r() * 240), 104 + Math.floor(K.r() * 50), 6, 2, '#f08030');
    },
    // ---- open country: cliffs, deserts, mountains, snows ----
    cliffs(K, f) {
      K.sky('#5090e0', '#d0e8ff', 80); K.cloud(60, 20, 20); K.cloud(190, 28, 22);
      for (let i = 0; i < 5; i++) { const x = 10 + i * 56; K.R(x - 20, 40 + (i % 2) * 14, 44, 56, '#c08858'); K.R(x - 20, 40 + (i % 2) * 14, 10, 56, '#d8a070'); K.R(x - 20, 40 + (i % 2) * 14, 44, 4, '#e0b080'); }
      K.ground(94, '#88b858', 30); K.grass(100, '#88b858', 40); K.bush(50, 100, 10, '#48a040'); K.bush(200, 104, 12, '#48a040');
    },
    lamakan_desert(K, f) {
      K.sky('#6090e0', '#f0e0b0', 72); K.dune(70, 78, 100, 20, '#e0b060'); K.dune(200, 82, 100, 22, '#e8c070');
      for (const x of [40, 190]) { K.R(x - 10, 40, 20, 50, '#d09050'); K.R(x - 10, 40, 6, 50, '#e0a860'); K.R(x - 14, 38, 28, 4, '#e8b870'); }   // rock spires
      for (const x of [110, 150]) { K.R(x - 2, 70, 4, 22, '#48a048'); K.R(x - 8, 76, 6, 3, '#48a048'); K.R(x + 2, 72, 6, 3, '#48a048'); }   // cacti
      K.ground(92, '#ecd080', 30); for (let i = 0; i < 8; i++) K.L(0, 100 + i * 7, 240, 104 + i * 7 + (i % 2) * 3, '#e0c070');
    },
    suhalla_desert(K, f) {
      K.sky('#5888d8', '#f0e0b8', 72); K.dune(50, 80, 90, 18, '#d8b858'); K.dune(180, 84, 110, 22, '#e0c068'); K.dune(120, 74, 60, 12, '#d0b050');
      K.ground(92, '#e8cc78', 30); for (let i = 0; i < 8; i++) K.L(0, 100 + i * 7, 240, 104 + i * 7 + (i % 2) * 3, '#dcc068'); K.bush(200, 100, 8, '#88a048');
    },
    suhalla_gate(K, f) {
      K.sky('#5080d0', '#e8d8b0', 60); for (let i = 0; i < 6; i++) { const x = 20 + i * 44; K.R(x - 16, 26 + (i % 2) * 12, 32, 70, '#c08850'); K.R(x - 16, 26 + (i % 2) * 12, 8, 70, '#d8a068'); K.R(x - 18, 24 + (i % 2) * 12, 36, 4, '#e0b078'); }
      K.ground(94, '#d8b868', 30); K.bush(90, 100, 10, '#88a048'); K.bush(170, 104, 8, '#88a048');
    },
    yampi_desert(K, f) {
      K.sky('#5888d8', '#e8e0c0', 72); for (let i = 0; i < 6; i++) { const x = 20 + i * 44; K.rock(x, 86, 24, '#c0b090'); }
      K.ground(94, '#e0d090', 30); for (let i = 0; i < 8; i++) K.L(0, 100 + i * 7, 240, 104 + i * 7 + (i % 2) * 3, '#d4c080'); K.bush(120, 104, 8, '#88a048');
    },
    kibombo_mtns(K, f) {
      K.sky('#5090e0', '#e0e8d0', 70); for (let i = 0; i < 5; i++) { const x = 10 + i * 56; K.R(x - 20, 36 + (i % 2) * 14, 44, 60, '#c89860'); K.R(x - 20, 36 + (i % 2) * 14, 10, 60, '#e0b078'); }
      K.tree(120, 94, 44, '#48a848', '#8a5a28'); K.ground(94, '#d8c070', 30); K.bush(50, 100, 12, '#58a848'); K.bush(200, 100, 10, '#58a848');
    },
    prox(K, f) {
      K.sky('#a0b0c8', '#e8f0f8', 96); K.mountains(88, '#c8d4e4', 5, 44); K.ground(94, '#e8f0f8', 20);
      for (const x of [30, 120, 210]) { K.R(x - 2, 60, 4, 36, '#404050'); K.L(x, 66, x - 14, 54, '#404050'); K.L(x, 74, x + 14, 62, '#404050'); K.L(x, 62, x + 8, 48, '#404050'); }
      for (let i = 0; i < 40; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 150) + f * 2, '#ffffff');   // falling snow
    },
    sea_of_time(K, f) {
      K.sky('#282848', '#605890', 70); for (let i = 0; i < 20; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 50), '#ffffff'); K.mountains(70, '#403860', 4, 30);
      K.water(66, 30, '#5040a0', 30); K.ground(96, '#8878a0', 30); K.rock(40, 100, 14, '#a898b0'); K.rock(200, 104, 12, '#a898b0');
    },
    // ---- ships ----
    ship_deck(K, f) {
      K.sky('#4890e0', '#c8e8ff', 70); K.cloud(30, 18, 18); K.cloud(200, 26, 22); K.water(60, 26, '#3888d8', 30);
      K.R(0, 84, 240, 12, '#a07040'); K.R(0, 84, 240, 3, '#c09060'); for (let i = 0; i < 24; i++) K.R(i * 10, 88, 1, 8, '#805030');   // the rail
      K.R(112, 0, 16, 96, '#a07040'); K.R(112, 0, 5, 96, '#c09060'); for (let i = 0; i < 8; i++) K.R(108, 10 + i * 10, 24, 2, '#c09060');   // the mast and its ladder
      K.R(20, 30, 50, 54, '#b08050'); K.R(24, 40, 12, 12, '#402010'); K.R(48, 40, 12, 12, '#402010'); K.R(16, 26, 58, 6, '#c09060');   // the cabin
      K.ground(96, '#c8985c', 0); for (let i = 0; i < 9; i++) K.R(0, 100 + i * 7, 240, 1, '#a07040'); K.R(150, 120, 40, 24, '#48a048'); K.R(154, 124, 32, 16, '#306830');   // planks and a grating
    },
    ship_below(K, f) {
      K.R(0, 0, 240, 96, '#7a5030'); for (let i = 0; i < 10; i++) K.R(0, i * 10, 240, 1, '#5a3820'); for (let i = 0; i < 4; i++) K.R(20 + i * 60, 0, 6, 96, '#5a3820');
      K.torch(60, 40, f); K.torch(180, 40, f); K.E(120, 70, 20, 14, '#8a6a40'); K.R(100, 70, 40, 20, '#8a6a40'); K.R(104, 74, 32, 3, '#6a4a28');   // a barrel
      K.ground(96, '#a07848', 0); for (let i = 0; i < 9; i++) K.R(0, 100 + i * 7, 240, 1, '#7a5030');
    },
    deadbeard_ship(K, f) {
      K.sky('#282040', '#504870', 70); for (let i = 0; i < 16; i++) K.P(Math.floor(K.r() * 240), Math.floor(K.r() * 50), '#ffffff'); K.water(60, 26, '#304078', 20);
      K.R(0, 84, 240, 12, '#605070'); for (let i = 0; i < 24; i++) K.R(i * 10, 88, 1, 8, '#403050'); K.R(112, 0, 16, 96, '#605070'); K.R(20, 30, 50, 54, '#706080'); K.R(24, 40, 12, 12, '#c0e060'); K.R(48, 40, 12, 12, '#c0e060');
      K.ground(96, '#807090', 0); for (let i = 0; i < 9; i++) K.R(0, 100 + i * 7, 240, 1, '#605070');
    },
    lemurian_ship(K, f) {
      K.sky('#4890e0', '#c8e8ff', 70); K.cloud(40, 18, 18); K.cloud(210, 24, 20); K.water(60, 26, '#3888d8', 30);
      K.R(0, 84, 240, 12, '#d8d0b0'); K.R(0, 84, 240, 3, '#f0e8d0'); K.R(40, 20, 60, 64, '#e8e0c8'); K.E(70, 20, 30, 10, '#e8e0c8'); K.R(50, 40, 12, 14, '#4080c0'); K.R(78, 40, 12, 14, '#4080c0');   // the pale hull-house
      K.R(160, 30, 10, 54, '#d0c8a8'); K.T(170, 30, 210, 50, 170, 70, '#f0f0ff');   // a mast with a sail
      K.ground(96, '#d0c8a8', 0); for (let i = 0; i < 9; i++) K.R(0, 100 + i * 7, 240, 1, '#b0a888');
    },
    // ---- Colosso: the arena and its crowded stands ----
    colosso(K, f) {
      K.sky('#5090e0', '#c8e0ff', 50);
      K.R(0, 30, 240, 62, '#d8d0b8'); for (let row = 0; row < 3; row++) { const y = 34 + row * 18; K.R(0, y, 240, 14, row % 2 ? '#c8c0a8' : '#d8d0b8'); for (let i = 0; i < 30; i++) { const x = i * 8 + (row % 2) * 4; K.E(x, y + 8, 3, 3, ['#e04040', '#4060e0', '#e0c040', '#40a040', '#f0d0b0'][(i + row) % 5]); K.R(x - 2, y + 10, 5, 4, ['#a03030', '#3050a0', '#a08020', '#308030', '#c0a080'][(i * 3 + row) % 5]); } for (let i = 0; i < 12; i++) K.R(i * 20, y, 3, 14, '#a09880'); }   // the crowd in the tiers
      K.R(0, 86, 240, 8, '#a0a8c0'); for (let i = 0; i < 20; i++) K.R(i * 12, 86, 1, 8, '#707890');   // the barrier
      K.ground(94, '#e0c880', 30); for (let i = 0; i < 6; i++) K.L(0, 104 + i * 8, 240, 106 + i * 8, '#d0b870');
    },
  },
};
