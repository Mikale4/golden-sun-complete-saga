// ---------- Procedural character sprites (field 16x24 & battle 24x32) ----------
'use strict';
const Sprites = {
  cache: {},
  // ---- Field humanoid ----
  // p: {skin,hair,hairStyle,top,topB,sleeve,pants,boots,scarf,cape,dress,eyes,belt,hat,hatColor,height,beard,glasses,shirt}
  humanoid(p, dir, frame) {
    const c = Gfx.canvas(16, 24), g = Gfx.ctx(c);
    const R = (x, y, w, h, col) => { if (col) Gfx.rect(g, x, y, w, h, col); };
    const P = (x, y, col) => { if (col) Gfx.px(g, x, y, col); };
    const skin = p.skin || '#f0c090', skinD = shade(skin, 0.8);
    const hair = p.hair || '#604020', hairD = shade(hair, 0.75), hairL = tint(hair, 0.2);
    const top = p.top || '#3050c0', topD = shade(top, 0.75), topL = tint(top, 0.15);
    const sleeve = p.sleeve || top, sleeveD = shade(sleeve, 0.75);
    const pants = p.pants || '#404868', pantsD = shade(pants, 0.75);
    const boots = p.boots || '#583820';
    const belt = p.belt || '#805030';
    const eyes = p.eyes || '#182848';
    const style = p.hairStyle || 'short';
    const bob = frame ? 1 : 0;           // body bob on walk frames
    const child = p.height === 'child';
    const oy = child ? 3 : 0;            // children are shorter: shift everything down & shrink legs
    // legs: y offsets by frame
    // ----- Cape (behind body) -----
    const drawCapeBack = () => {
      if (!p.cape) return;
      const cd = shade(p.cape, 0.75);
      if (dir === DIR.UP) { R(3, 10 + oy - bob, 10, 9, p.cape); R(3, 18 + oy - bob, 10, 1, cd); R(4, 10 + oy - bob, 8, 1, tint(p.cape, 0.15)); }
      else if (dir === DIR.DOWN) { R(3, 11 + oy - bob, 1, 7, cd); R(12, 11 + oy - bob, 1, 7, cd); R(3, 17 + oy - bob, 10, 2, cd); }
      else { const bx = dir === DIR.LEFT ? 8 : 3; R(bx, 10 + oy - bob, 5, 9, p.cape); R(bx, 18 + oy - bob, 5, 1, cd); }
    };
    drawCapeBack();
    // ----- Legs -----
    const legY = 17 + oy - bob, legH = child ? 3 : 4;
    const ly = legY;
    if (dir === DIR.DOWN || dir === DIR.UP) {
      const lo = frame === 1 ? -1 : 0, ro = frame === 2 ? -1 : 0; // lifted leg
      if (p.dress) { R(3, ly - 1, 10, 3, p.dress); R(3, ly + 2, 10, 1, shade(p.dress, 0.75)); R(4, ly + 3 + lo, 3, 2, skin); R(9, ly + 3 + ro, 3, 2, skin); }
      else { R(3, ly + lo, 3, legH, pants); R(8, ly + ro, 3, legH, pants); P(5, ly + lo, pantsD); P(10, ly + ro, pantsD); }
      R(3, ly + legH + lo, 3, 2, boots); R(8, ly + legH + ro, 3, 2, boots);
      P(2, ly + legH + 1 + lo, boots); P(11, ly + legH + 1 + ro, boots);
    } else {
      const f = frame === 1 ? 2 : frame === 2 ? -2 : 0; // stride
      const fl = dir === DIR.LEFT ? -1 : 1;
      if (p.dress) { R(4, ly - 1, 8, 3, p.dress); R(4, ly + 2, 8, 1, shade(p.dress, 0.75)); R(5 + f * fl * 0.5, ly + 3, 3, 2, skin); R(8 - f * fl * 0.5, ly + 3, 3, 2, skin); }
      else if (f === 0) { R(5, ly, 6, legH, pants); P(5, ly, pantsD); }
      else { R(5 + f * fl, ly, 3, legH, pantsD); R(8 - f * fl, ly, 3, legH, pants); }
      if (f === 0) { R(5, ly + legH, 6, 2, boots); P(dir === DIR.LEFT ? 4 : 11, ly + legH + 1, boots); }
      else { R(5 + f * fl, ly + legH, 3, 2, boots); R(8 - f * fl, ly + legH, 3, 2, boots); }
    }
    // ----- Torso -----
    const ty = 10 + oy - bob;
    const tunic = p.robe ? p.robe : top;
    if (dir === DIR.DOWN || dir === DIR.UP) {
      R(3, ty, 10, 7, tunic); R(3, ty + 6, 10, 1, shade(tunic, 0.75)); R(4, ty, 8, 1, tint(tunic, 0.15));
      if (p.robe) { R(3, ty + 7, 10, 4, tunic); R(3, ty + 10, 10, 1, shade(tunic, 0.75)); }
      if (dir === DIR.DOWN) { R(5, ty + 4, 6, 1, belt); if (p.shirt) { R(6, ty, 4, 3, p.shirt); } if (p.emblem) P(7, ty + 2, p.emblem); }
      else R(5, ty + 4, 6, 1, shade(belt, 0.8));
      // arms
      const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      R(2, ty + 1 + (dir === DIR.DOWN ? armSwing : -armSwing), 1, 4, sleeve); R(13, ty + 1 - (dir === DIR.DOWN ? armSwing : -armSwing), 1, 4, sleeve);
      P(2, ty + 5 + (dir === DIR.DOWN ? armSwing : -armSwing), skin); P(13, ty + 5 - (dir === DIR.DOWN ? armSwing : -armSwing), skin);
    } else {
      const fl = dir === DIR.LEFT;
      R(4, ty, 8, 7, tunic); R(4, ty + 6, 8, 1, shade(tunic, 0.75)); R(5, ty, 6, 1, tint(tunic, 0.15));
      if (p.robe) { R(4, ty + 7, 8, 4, tunic); R(4, ty + 10, 8, 1, shade(tunic, 0.75)); }
      R(5, ty + 4, 6, 1, belt);
      const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      const ax = fl ? 3 : 12;
      R(ax, ty + 1 + armSwing, 2, 4, sleeve); R(ax, ty + 5 + armSwing, 2, 1, skin);
    }
    // ----- Scarf -----
    if (p.scarf) {
      const sd = shade(p.scarf, 0.75);
      if (dir === DIR.DOWN) { R(4, ty - 1, 8, 2, p.scarf); R(9, ty + 1, 2, 3, p.scarf); P(9, ty + 3, sd); }
      else if (dir === DIR.UP) { R(4, ty - 1, 8, 2, p.scarf); R(5, ty + 1, 2, 4, p.scarf); }
      else { R(5, ty - 1, 6, 2, p.scarf); const tx = dir === DIR.LEFT ? 10 : 4; R(tx, ty + 1, 2, 3, p.scarf); }
    }
    // ----- Head -----
    const hy = 2 + oy - bob;
    if (dir === DIR.DOWN) {
      R(4, hy + 1, 8, 7, skin); R(5, hy + 8, 6, 1, skinD); R(3, hy + 3, 1, 3, skin); R(12, hy + 3, 1, 3, skin);
      // eyes
      P(6, hy + 5, eyes); P(9, hy + 5, eyes); P(6, hy + 4, '#ffffff'); P(9, hy + 4, '#ffffff');
      if (p.blush) { P(5, hy + 6, '#f09090'); P(10, hy + 6, '#f09090'); }
      if (p.beard) { R(5, hy + 7, 6, 2, p.beard); R(6, hy + 9, 4, 1, p.beard); }
      if (p.glasses) { R(5, hy + 4, 3, 1, '#a0b0c0'); R(8, hy + 4, 3, 1, '#a0b0c0'); }
    } else if (dir === DIR.UP) {
      R(4, hy + 1, 8, 7, skin); R(5, hy + 8, 6, 1, skinD);
    } else {
      const fl = dir === DIR.LEFT;
      R(4, hy + 1, 8, 7, skin); R(5, hy + 8, 6, 1, skinD);
      const ex = fl ? 5 : 10; P(ex, hy + 5, eyes); P(ex, hy + 4, '#ffffff');
      if (p.beard) { R(fl ? 4 : 8, hy + 7, 4, 2, p.beard); }
      if (p.glasses) { R(fl ? 4 : 9, hy + 4, 3, 1, '#a0b0c0'); }
    }
    // ----- Hair -----
    this.hair(g, style, dir, hy, hair, hairD, hairL, p, skin);
    // ----- Hat / helmet overlays -----
    if (p.hat) this.hat(g, p.hat, dir, hy, p.hatColor || '#804020');
    return Gfx.outline(c, '#1a1428');
  },
  hair(g, style, dir, hy, hair, hairD, hairL, p, skin) {
    const R = (x, y, w, h, col) => Gfx.rect(g, x, y, w, h, col), P = (x, y, col) => Gfx.px(g, x, y, col);
    const fl = dir === DIR.LEFT, side = dir === DIR.LEFT || dir === DIR.RIGHT;
    if (style === 'bald') { R(5, hy, 6, 1, skin); R(4, hy - 0, 8, 1, skin); if (dir !== DIR.UP) { R(3, hy + 2, 1, 3, hair); R(12, hy + 2, 1, 3, hair); } else R(4, hy + 1, 8, 2, hair); return; }
    // base cap
    R(5, hy - 1, 6, 1, hair); R(4, hy, 8, 2, hair); R(3, hy + 1, 1, 3, hair); R(12, hy + 1, 1, 3, hair);
    R(5, hy - 1, 3, 1, hairL);
    if (dir === DIR.UP) { R(4, hy + 2, 8, 4, hair); R(4, hy + 6, 8, 1, hairD); }
    else if (dir === DIR.DOWN) {
      // bangs
      if (style !== 'slick') { R(4, hy + 2, 8, 1, hair); P(5, hy + 3, hair); P(8, hy + 3, hair); P(11, hy + 3, hair); }
    } else {
      R(4, hy + 2, 8, 1, hair); const bx = fl ? 8 : 4; R(bx, hy + 3, 4, 3, hair); R(bx, hy + 6, 4, 1, hairD);
      P(fl ? 4 : 11, hy + 3, hair);
    }
    switch (style) {
      case 'spiky': // Isaac/Garet
        P(4, hy - 2, hair); P(7, hy - 2, hair); P(10, hy - 2, hair); P(6, hy - 3, hairL); P(9, hy - 3, hair); P(3, hy - 1, hair); P(12, hy - 1, hair);
        if (dir === DIR.DOWN) { P(3, hy + 4, hair); P(12, hy + 4, hair); }
        break;
      case 'wild': // Garet - big spikes up
        R(4, hy - 3, 8, 2, hair); P(3, hy - 3, hair); P(12, hy - 3, hair); P(5, hy - 4, hair); P(8, hy - 4, hair); P(11, hy - 4, hair); P(6, hy - 5, hairL);
        break;
      case 'long': // hair down to shoulders (Mia, Jenna)
        R(3, hy + 2, 1, 6, hair); R(12, hy + 2, 1, 6, hair); R(2, hy + 5, 1, 4, hair); R(13, hy + 5, 1, 4, hair);
        if (dir === DIR.UP) { R(4, hy + 6, 8, 4, hair); R(4, hy + 10, 8, 1, hairD); }
        if (side) { const bx = fl ? 9 : 3; R(bx, hy + 6, 4, 4, hair); R(bx, hy + 10, 4, 1, hairD); }
        break;
      case 'ponytail': // Jenna/Felix
        R(3, hy + 2, 1, 4, hair); R(12, hy + 2, 1, 4, hair);
        if (dir === DIR.UP) { R(6, hy + 6, 4, 8, hair); R(6, hy + 14, 4, 1, hairD); R(7, hy + 6, 1, 8, hairL); }
        if (side) { const bx = fl ? 11 : 3; R(bx, hy + 4, 2, 9, hair); R(bx, hy + 13, 2, 1, hairD); }
        break;
      case 'bob': // Sheba/Ivan (chin-length)
        R(3, hy + 2, 1, 5, hair); R(12, hy + 2, 1, 5, hair); P(4, hy + 7, hair); P(11, hy + 7, hair);
        if (dir === DIR.UP) { R(4, hy + 6, 8, 2, hair); R(4, hy + 8, 8, 1, hairD); }
        if (side) { const bx = fl ? 9 : 3; R(bx, hy + 6, 4, 2, hair); R(bx, hy + 8, 4, 1, hairD); }
        break;
      case 'bun': R(6, hy - 3, 4, 2, hair); P(7, hy - 3, hairL); break;
      case 'slick': R(4, hy + 2, 8, 1, hair); break;
      case 'mohawk': R(7, hy - 4, 2, 4, hair); break;
      case 'braid':
        if (dir === DIR.UP) { R(7, hy + 6, 2, 10, hair); }
        if (side) { const bx = fl ? 11 : 4; R(bx, hy + 4, 1, 10, hair); }
        break;
      case 'short': default: break;
    }
    if (p.headband) { R(3, hy + 2, 10, 1, p.headband); if (side) { const bx = fl ? 12 : 2; R(bx, hy + 3, 1, 3, p.headband); } }
  },
  hat(g, type, dir, hy, col) {
    const R = (x, y, w, h, c) => Gfx.rect(g, x, y, w, h, c), P = (x, y, c) => Gfx.px(g, x, y, c);
    const d = shade(col, 0.75), l = tint(col, 0.2);
    if (type === 'helmet') { R(3, hy - 1, 10, 4, col); R(4, hy - 2, 8, 1, col); R(5, hy - 2, 3, 1, l); R(3, hy + 2, 10, 1, d); if (dir !== DIR.UP) { P(3, hy + 3, col); P(12, hy + 3, col); } }
    else if (type === 'cap') { R(4, hy - 1, 8, 3, col); R(5, hy - 2, 6, 1, col); R(5, hy - 1, 3, 1, l); if (dir === DIR.DOWN) R(3, hy + 2, 10, 1, d); }
    else if (type === 'hood') { R(3, hy - 1, 10, 4, col); R(4, hy - 2, 8, 1, col); R(2, hy + 3, 1, 4, col); R(13, hy + 3, 1, 4, col); R(5, hy - 2, 3, 1, l); if (dir === DIR.UP) R(3, hy + 3, 10, 5, col); }
    else if (type === 'wide') { R(2, hy + 1, 12, 1, col); R(4, hy - 2, 8, 3, col); R(5, hy - 2, 3, 1, l); R(2, hy + 2, 12, 1, d); }
    else if (type === 'bandana') { R(4, hy - 1, 8, 2, col); R(3, hy, 1, 2, col); R(12, hy, 1, 2, col); R(5, hy - 1, 3, 1, l); if (dir !== DIR.DOWN) R(11, hy + 2, 2, 4, d); }
    else if (type === 'crown') { R(4, hy - 1, 8, 2, col); P(4, hy - 2, col); P(7, hy - 3, col); P(8, hy - 3, col); P(11, hy - 2, col); P(7, hy - 1, '#f04040'); }
    else if (type === 'tiara') { R(4, hy, 8, 1, col); P(7, hy - 1, col); P(8, hy - 1, col); }
    else if (type === 'mask') { R(4, hy + 3, 8, 3, col); R(5, hy + 4, 2, 1, '#202020'); R(9, hy + 4, 2, 1, '#202020'); }
    else if (type === 'horns') { P(3, hy - 1, col); P(2, hy - 2, col); P(12, hy - 1, col); P(13, hy - 2, col); }
  },
  // Build full animation set for a character definition: [dir][frame] -> canvas
  buildSet(p) {
    const key = 'H' + JSON.stringify(p);
    if (this.cache[key]) return this.cache[key];
    const set = []; const sheet = typeof SpriteSheets !== 'undefined' ? SpriteSheets.set(p) : null;   // a generated sheet, when one has arrived
    for (let d = 0; d < 4; d++) { set[d] = []; for (let f = 0; f < 3; f++) set[d][f] = sheet ? sheet[d][f] : this.humanoid(p, d, f); }
    return this.cache[key] = set;
  },
  // ---- Battle sprite: a party member in battle, three-quarter back view, drawn by BattleParty ----
  // pose: 'idle','step','attack','attack2','cast','cast2','hurt','down','win','guard'; frame picks the idle breath
  battle(p, pose, frame) { return BattleParty.sprite(p, pose || 'idle', frame || 0); },
  // Simple non-humanoid field sprites (animals etc.), 16x16
  animal(type, col, dir, frame) {
    const key = 'A' + type + col + dir + frame; if (this.cache[key]) return this.cache[key];
    const c = Gfx.canvas(16, 16), g = Gfx.ctx(c); const colHex = typeof col === 'string' ? col : '#a08060'; const d = shade(colHex, 0.75), l = tint(colHex, 0.25); if (typeof col !== 'string') { if (type !== 'djinni') col = colHex; }
    const fl = dir === DIR.LEFT; const f = frame ? 1 : 0;
    if (type === 'none') return this.cache[key] = c;   // a voice in the bark, a face on a trunk: something to talk to that draws nothing of its own
    if (type === 'dog' || type === 'wolf' || type === 'cat') {
      Gfx.ellipse(g, 8, 10, 5, 3, col); Gfx.ellipse(g, fl ? 3 : 13, 8, 3, 3, col); Gfx.px(g, fl ? 2 : 14, 7, '#101010');
      Gfx.rect(g, 4, 12, 2, 3 - f, d); Gfx.rect(g, 10, 12 + f, 2, 3 - f, d); Gfx.rect(g, 6, 13, 2, 2, d); Gfx.rect(g, 8, 13, 2, 2, d);
      Gfx.px(g, fl ? 13 : 2, 8, col); Gfx.px(g, fl ? 14 : 1, 7, col); Gfx.px(g, fl ? 1 : 14, 5, col);
    } else if (type === 'sheep') { Gfx.ellipse(g, 8, 9, 6, 4, '#f0f0f0'); Gfx.ellipse(g, fl ? 3 : 13, 8, 2, 2, '#404040'); Gfx.rect(g, 4, 13, 2, 2, '#404040'); Gfx.rect(g, 10, 13 + f, 2, 2 - f, '#404040'); }
    else if (type === 'chicken') { Gfx.ellipse(g, 8, 10, 4, 3, col); Gfx.circle(g, fl ? 5 : 11, 7, 2, col); Gfx.px(g, fl ? 3 : 13, 7, '#f0a020'); Gfx.px(g, fl ? 5 : 11, 5, '#e03030'); Gfx.rect(g, 7, 13, 1, 2, '#f0a020'); Gfx.rect(g, 9, 13 + f, 1, 2 - f, '#f0a020'); }
    else if (type === 'cow') { Gfx.ellipse(g, 8, 9, 7, 4, col); Gfx.ellipse(g, fl ? 3 : 13, 8, 3, 2, col); Gfx.rect(g, 3, 12, 2, 3, d); Gfx.rect(g, 11, 12 + f, 2, 3 - f, d); Gfx.rect(g, 6, 8, 3, 3, '#ffffff'); }
    else if (type === 'bird') { Gfx.ellipse(g, 8, 9, 4, 2, col); Gfx.circle(g, fl ? 5 : 11, 7, 2, col); Gfx.px(g, fl ? 3 : 13, 7, '#f0a020'); Gfx.rect(g, 4, 7 - f * 2, 8, 1, d); }
    else if (type === 'penguin') { Gfx.ellipse(g, 8, 10, 4, 5, '#202838'); Gfx.ellipse(g, 8, 11, 2, 3, '#f0f0f8'); Gfx.circle(g, 8, 5, 3, '#202838'); Gfx.px(g, fl ? 6 : 10, 4, '#ffffff'); Gfx.rect(g, fl ? 4 : 10, 5, 2, 1, '#f0a020'); Gfx.rect(g, 5, 14 + f, 2, 2 - f, '#f0a020'); Gfx.rect(g, 9, 14, 2, 2, '#f0a020'); Gfx.rect(g, fl ? 11 : 3, 8 + f, 2, 4, '#202838'); }
    else if (type === 'turtle') { Gfx.ellipse(g, 8, 10, 6, 4, '#4a7838'); Gfx.ellipse(g, 8, 9, 5, 3, '#6a9848'); Gfx.px(g, 6, 8, '#3a5828'); Gfx.px(g, 10, 8, '#3a5828'); Gfx.px(g, 8, 10, '#3a5828'); Gfx.ellipse(g, fl ? 2 : 14, 10, 2, 2, '#8ab060'); Gfx.px(g, fl ? 1 : 15, 9, '#101010'); Gfx.rect(g, 3, 13 + f, 2, 2 - f, '#8ab060'); Gfx.rect(g, 11, 13, 2, 2, '#8ab060'); }
    else if (type === 'djinni') {
      const e = ELCOLOR[col] || '#e8c040', ed = shade(e, 0.7), el = tint(e, 0.4);
      Gfx.ellipse(g, 8, 9 + f, 5, 4, e); Gfx.rect(g, 3, 8 + f, 10, 2, e); Gfx.ellipse(g, 8, 7 + f, 4, 3, el);
      Gfx.px(g, 6, 7 + f, '#101010'); Gfx.px(g, 10, 7 + f, '#101010'); Gfx.px(g, 6, 6 + f, '#ffffff'); Gfx.px(g, 10, 6 + f, '#ffffff');
      Gfx.px(g, 4, 4 + f, ed); Gfx.px(g, 3, 3 + f, e); Gfx.px(g, 11, 4 + f, ed); Gfx.px(g, 12, 3 + f, e); // ears/horns
      Gfx.rect(g, 5, 13 + f, 2, 2, ed); Gfx.rect(g, 9, 13 + f, 2, 2, ed); Gfx.rect(g, 13, 10 + f, 2, 1, ed);
    } else if (type === 'boulder') { Gfx.ellipse(g, 8, 9, 6, 5, col); Gfx.ellipse(g, 6, 7, 3, 2, l); Gfx.rect(g, 3, 12, 10, 2, d); }
    else if (type === 'sapling') { // a person turned to a young tree: a thin trunk, a few leaves, and a face in the bark
      Gfx.rect(g, 7, 6, 2, 9, '#8a5a2a'); Gfx.rect(g, 6, 14, 4, 2, '#6a4020'); Gfx.px(g, 5, 8, '#8a5a2a'); Gfx.px(g, 10, 7 + f, '#8a5a2a');
      Gfx.ellipse(g, 8, 3, 4, 3, col); Gfx.ellipse(g, 4, 6 + f, 2, 2, col); Gfx.ellipse(g, 12, 5, 2, 2, col); Gfx.px(g, 8, 1, l);
      Gfx.px(g, 7, 10, '#101010'); Gfx.px(g, 9, 10, '#101010'); Gfx.px(g, 8, 12, '#603018');
    }
    else if (type === 'statue') { // a watching statue of blue stone: a squat figure on a plinth, eyes lit
      const b = '#78b8f0', bd = '#4878a8', bl = '#b8e0ff'; Gfx.rect(g, 3, 13, 10, 3, '#5878a8'); Gfx.rect(g, 5, 5, 6, 8, b); Gfx.rect(g, 5, 5, 2, 8, bd); Gfx.ellipse(g, 8, 4, 3, 3, b); Gfx.px(g, fl ? 6 : 9, 4, '#f0e040'); Gfx.px(g, fl ? 7 : 8, 4, '#f0e040'); Gfx.rect(g, 3, 7, 2, 4, b); Gfx.rect(g, 11, 7, 2, 4, b); Gfx.px(g, 8, 6, bl);
    }
    else if (type === 'wiseone') { // floating one-eyed stone, bobbing
      const r = '#8a8aa0', rd = '#5c5c74', rl = '#b8b8cc'; Gfx.ellipse(g, 8, 7 + f, 7, 6, r); Gfx.ellipse(g, 6, 4 + f, 3, 2, rl); Gfx.rect(g, 2, 10 + f, 12, 2, rd); Gfx.px(g, 1, 8 + f, rd); Gfx.px(g, 14, 8 + f, rd);
      Gfx.ellipse(g, 8, 7 + f, 3, 3, '#ffffff'); Gfx.circle(g, 8, 7 + f, 2, '#2040c0'); Gfx.px(g, 8, 7 + f, '#101010'); Gfx.px(g, 7, 6 + f, '#ffffff');
    }
    return this.cache[key] = Gfx.outline(c, '#1a1428');
  }
};
