// ---------- The party in battle, drawn in code ----------
// Three-quarter back view at the size the originals give their fighters (about 44 pixels tall), after the reference
// sheets: the wide stance with the weapon held up on the right, the scarf or cape trailing, and one drawn frame per
// pose - the breathing idle, the leap and the slash of an attack, the two casting stances, the recoil of a hit, the
// collapse when downed, and the turn to face us when the fight is won. Colours come from each character's look.
'use strict';
const BattleParty = {
  cache: {},
  W: 64, H: 64,
  sprite(p, pose, frame) {
    frame = frame || 0; const key = 'P' + pose + frame + JSON.stringify(p);
    if (this.cache[key]) return this.cache[key];
    if (this.files && p.sheet && this.files[p.sheet + ':' + pose]) { const fr = this.files[p.sheet + ':' + pose]; return fr[frame % fr.length]; }   // a picture from assets/battle/party
    const c = Gfx.canvas(this.W, this.H), g = Gfx.ctx(c);
    this.draw(g, p, pose, frame);
    return this.cache[key] = Gfx.outline(c, '#1a1428');
  },
  draw(g, p, pose, frame) {
    const R = (x, y, w, h, col) => { if (col && w > 0 && h > 0) Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col); };
    const P = (x, y, col) => { if (col) Gfx.px(g, Math.round(x), Math.round(y), col); };
    const E = (cx, cy, rx, ry, col) => { if (col) Gfx.ellipse(g, cx, cy, rx, ry, col); };
    const L = (x0, y0, x1, y1, col) => { if (col) Gfx.line(g, x0, y0, x1, y1, col); };
    const T = (x0, y0, x1, y1, x2, y2, col) => { if (col) Gfx.tri(g, x0, y0, x1, y1, x2, y2, col); };
    const skin = p.skin || '#f0c090', skinD = shade(skin, 0.78), skinL = tint(skin, 0.2);
    const hair = p.hair || '#604020', hairD = shade(hair, 0.7), hairL = tint(hair, 0.25);
    const top = p.top || '#3050c0', topD = shade(top, 0.7), topL = tint(top, 0.18);
    const sleeve = p.sleeve || top, sleeveD = shade(sleeve, 0.7);
    const pants = p.pants || '#404868', pantsD = shade(pants, 0.7), pantsL = tint(pants, 0.15);
    const boots = p.boots || '#583820', bootsD = shade(boots, 0.7), bootsL = tint(boots, 0.2);
    const belt = p.belt || '#805030', beltL = tint(belt, 0.3);
    const cape = p.cape, capeD = cape && shade(cape, 0.7), capeL = cape && tint(cape, 0.15);
    const dress = p.dress, dressD = dress && shade(dress, 0.7), dressL = dress && tint(dress, 0.18);
    const robe = p.robe;
    const child = p.height === 'child';
    const wp = p.weapon || 'sword';
    const side = p.weaponSide === 'left' ? -1 : 1;                // the side the weapon rests on; strikes and casts always reach right, toward the foe
    // the stance: where the figure stands and how it is bent
    const front = pose === 'front';                             // only a foe faces us; the party keeps its back to us even in victory
    let ox = 0, oy = 0, crouch = 0, lean = 0;                 // shifts, knee bend, lean (right = toward the foe)
    let arm = 'hold';                                         // 'hold' (weapon up at the side), 'high' (overhead), 'slash' (down across), 'point' (out in front), 'rest', 'ground', 'shield'
    if (pose === 'win') arm = 'high';                            // the weapon thrust up in triumph
    if (pose === 'attack') { oy = -7; crouch = 3; arm = 'high'; lean = 2; }
    if (pose === 'attack2') { oy = 3; crouch = 4; arm = 'slash'; lean = 4; }
    if (pose === 'cast') { arm = 'point'; lean = 1; }
    if (pose === 'cast2') { arm = 'high'; }
    if (pose === 'hurt') { oy = 2; crouch = 3; lean = -5; arm = 'rest'; }
    if (pose === 'guard') { arm = 'shield'; crouch = 1; }
    if (pose === 'step') { oy = 0; }
    const breathe = pose === 'idle' ? [0, 1, 0][frame % 3] : 0;   // the shoulders drop a pixel mid-breath
    const cx = 26 + ox + lean;                                // the figure's centre line, left of middle: the weapon reaches right
    const ground = 60 + oy;
    if (pose === 'down') { this.downed(g, p, { skin, skinD, hair, hairD, hairL, top, topD, pants, pantsD, boots, bootsD, belt, cape, capeD, dress, dressD, wp }); return; }
    // ---- shadow ----
    E(cx, 60, 14, 3, 'rgba(0,0,0,0.28)');
    // ---- cape, behind everything ----
    const shY = ground - 30 + breathe - (child ? -3 : 0) + crouch;   // shoulder line
    // ---- legs and feet: the wide stance, left foot forward-left, right foot back-right ----
    const hipY = ground - 16 + crouch;
    if (dress || robe) {
      const col = dress || robe, colD = dress ? dressD : shade(robe, 0.7), colL = dress ? dressL : tint(robe, 0.18);
      T(cx - 9, hipY - 2, cx - 13, ground - 2, cx + 13, ground - 2, col); T(cx - 9, hipY - 2, cx + 9, hipY - 2, cx + 13, ground - 2, col);
      R(cx - 12, ground - 3, 24, 1, colD); R(cx - 9, hipY - 2, 18, 1, colL); R(cx - 10, hipY + 2, 1, ground - hipY - 5, colD);
      R(cx - 8, ground - 2, 5, 2, boots); R(cx + 3, ground - 2, 5, 2, boots);   // the toes of the boots under the hem
    } else {
      const lh = ground - hipY;
      // left leg (screen left), planted forward
      R(cx - 9, hipY, 6, lh - 6, pants); R(cx - 9, hipY, 1, lh - 6, pantsD); R(cx - 4, hipY, 1, lh - 6, pantsL);
      R(cx - 10, ground - 7, 7, 5, boots); R(cx - 11, ground - 3, 9, 3, bootsD); R(cx - 9, ground - 7, 5, 1, bootsL);
      // right leg, stepped back
      R(cx + 3, hipY - 1, 6, lh - 6, pants); R(cx + 8, hipY - 1, 1, lh - 6, pantsL); R(cx + 3, hipY - 1, 1, lh - 6, pantsD);
      R(cx + 3, ground - 8, 7, 5, boots); R(cx + 2, ground - 4, 9, 3, bootsD); R(cx + 4, ground - 8, 5, 1, bootsL);
    }
    // ---- torso: broad at the shoulders, belted at the waist ----
    const tw = child ? 14 : 18, th = (child ? 12 : 15) - crouch;
    const tunic = robe || top, tunicD = shade(tunic, 0.7), tunicL = tint(tunic, 0.18);
    T(cx - tw / 2 - 1, shY, cx + tw / 2 + 1, shY, cx + tw / 2 - 2, shY + th, tunic); T(cx - tw / 2 - 1, shY, cx - tw / 2 + 2, shY + th, cx + tw / 2 - 2, shY + th, tunic);
    R(cx - tw / 2, shY, tw, 2, tunicL); R(cx - tw / 2 - 1, shY + 1, 2, th - 3, tunicD);
    if (p.armor) { R(cx - tw / 2 - 2, shY - 1, 6, 4, p.armor); R(cx + tw / 2 - 4, shY - 1, 6, 4, p.armor); R(cx - tw / 2 - 2, shY - 1, 6, 1, tint(p.armor, 0.3)); }   // pauldrons
    R(cx - tw / 2 + 2, shY + th - 3, tw - 4, 2, belt); P(cx + 1, shY + th - 3, beltL);
    if (p.shirt) R(cx - tw / 2 + 3, shY + th - 1, tw - 6, 2, p.shirt);
    // a cape hangs over the back from the shoulders to below the belt, seen whole from behind
    if (cape && !front) {
      const cw = tw - 2, ch = (child ? 17 : 22) - crouch;
      R(cx - cw / 2, shY + 1, cw, ch, cape); R(cx - cw / 2 - 1, shY + 3, cw + 2, ch - 4, cape);
      R(cx - cw / 2, shY + 1, cw, 1, capeL); R(cx - cw / 2 - 1, shY + 3, 1, ch - 4, capeD); R(cx - cw / 2, shY + ch - 1, cw, 1, capeD);
      for (let i = 1; i < cw; i += 4) P(cx - cw / 2 + i + ((frame + i / 4) % 2 ? 1 : 0), shY + ch, cape);   // the hem swings with the breath
      R(cx - tw / 2 + 1, shY, tw - 2, 2, p.capeClasp || tunicL);   // the collar it hangs from
    }
    // ---- scarf: a band round the neck, its tail streaming out to the right behind the shoulder ----
    if (p.scarf) {
      const sc = p.scarf, scD = shade(sc, 0.75); const wave = (frame % 3) - 1;
      R(cx - 6, shY - 2, 12, 3, sc); R(cx - 6, shY, 12, 1, scD);
      if (!front) { R(cx + 5, shY - 1, 5, 3, sc); R(cx + 9, shY + wave, 6, 3, sc); R(cx + 14, shY + 2 + wave * 2, 6, 3, sc); R(cx + 19, shY + 5 + wave * 2, 4, 2, sc); R(cx + 9, shY + 2 + wave, 6, 1, scD); R(cx + 14, shY + 4 + wave * 2, 6, 1, scD); P(cx + 22, shY + 6 + wave * 2, scD); }
    }
    // ---- arms ----
    const armL = child ? 9 : 12;
    // at rest the weapon arm is on its own side and the free arm hangs on the other; a strike or a cast reaches right
    const rested = arm === 'hold' || arm === 'high';
    const fs = rested ? -side : -1;                                     // the free arm's side
    const fx = cx + fs * (tw / 2 + 1) - 2;                              // the free arm's column
    if (arm === 'shield') { R(cx - tw / 2 - 5, shY + 1, 4, 8, sleeve); R(cx - tw / 2 - 10, shY - 2, 8, 12, p.shield || '#8090a8'); R(cx - tw / 2 - 9, shY - 1, 3, 10, tint(p.shield || '#8090a8', 0.3)); }
    else { R(fx, shY + 1, 4, armL, sleeve); R(fx + (fs < 0 ? 0 : 3), shY + 1, 1, armL, sleeveD); R(fx, shY + armL + 1, 4, 3, skin); }
    // the weapon arm: where the hand ends up
    let hx = cx + tw / 2 + 3, hy = shY + 4;
    const ws = side;                                                    // the weapon arm's side while rested
    if (arm === 'hold') { R(cx + ws * (tw / 2 + 1) - 2, shY + 1, 4, 6, sleeve); R(cx + ws * (tw / 2 + 3) - 2, shY - 2, 4, 5, sleeve); hx = cx + ws * (tw / 2 + 3) - 1; hy = shY - 3; }
    if (arm === 'high') { R(cx + ws * (tw / 2 + 1) - 2, shY - 4, 4, 6, sleeve); R(cx + ws * (tw / 2 + 3) - 2, shY - 9, 4, 6, sleeve); hx = cx + ws * (tw / 2 + 3) - 1; hy = shY - 10; }
    if (arm === 'slash') { R(cx + tw / 2 - 1, shY + 2, 5, 5, sleeve); R(cx + tw / 2 + 3, shY + 5, 5, 4, sleeve); hx = cx + tw / 2 + 7; hy = shY + 8; }
    if (arm === 'point') { R(cx + tw / 2 - 1, shY + 2, 6, 4, sleeve); R(cx + tw / 2 + 4, shY + 2, 6, 4, sleeve); hx = cx + tw / 2 + 10; hy = shY + 3; }
    if (arm === 'rest' || arm === 'shield') { R(cx + tw / 2 - 1, shY + 1, 4, armL, sleeve); hx = cx + tw / 2 + 1; hy = shY + armL; }
    R(hx - 1, hy, 4, 3, skin); P(hx + 2, hy, skinL);
    // ---- the weapon in that hand ----
    this.weapon(g, wp, hx + 1, hy + 1, arm, p.weaponColor, rested ? side : 1);
    // ---- head: mostly hair from behind, a cheek on the right; the face when turned to us ----
    const hy2 = shY - 12 + (child ? 1 : 0);   // top of the head
    const hw = child ? 11 : 12;
    if (front) {
      R(cx - hw / 2 + 1, hy2 + 3, hw - 2, 9, skin); R(cx - hw / 2 + 1, hy2 + 11, hw - 2, 1, skinD);
      P(cx - 3, hy2 + 7, p.eyes || '#202040'); P(cx + 2, hy2 + 7, p.eyes || '#202040'); P(cx - 3, hy2 + 6, '#ffffff'); P(cx + 2, hy2 + 6, '#ffffff'); P(cx, hy2 + 10, skinD);
      R(cx - hw / 2, hy2, hw, 4, hair); R(cx - hw / 2, hy2 + 3, 2, 5, hair); R(cx + hw / 2 - 2, hy2 + 3, 2, 5, hair); R(cx - hw / 2 + 2, hy2 - 1, hw - 4, 1, hairL);
    } else {
      R(cx - 2, hy2 + 11, 5, 2, skinD);                                                   // the neck
      R(cx + hw / 2 - 3, hy2 + 6, 4, 6, skin); P(cx + hw / 2 - 1, hy2 + 8, skinD); P(cx + hw / 2 - 3, hy2 + 7, skinD);   // the cheek turned toward the foe, and the ear
      R(cx - hw / 2, hy2 + 1, hw, 9, hair); R(cx - hw / 2 + 1, hy2, hw - 2, 1, hair); R(cx - hw / 2, hy2 + 10, hw - 4, 2, hair); R(cx - hw / 2 + 2, hy2, 5, 1, hairL); R(cx - hw / 2 + 1, hy2 + 1, 3, 2, hairL); R(cx - hw / 2, hy2 + 9, 4, 3, hairD);
    }
    const style = p.hairStyle || 'short';
    if (style === 'spiky') { for (const [dx, dy] of [[-5, -1], [-2, -3], [1, -4], [4, -3], [6, -1]]) { T(cx + dx - 1, hy2 + 1, cx + dx + 1, hy2 + 1, cx + dx, hy2 + dy, hair); } P(cx + 1, hy2 - 3, hairL); P(cx - 2, hy2 - 2, hairL); P(cx + hw / 2 + 1, hy2 + 3, hair); P(cx - hw / 2 - 1, hy2 + 4, hair); }
    if (style === 'wild') { R(cx - hw / 2, hy2 - 2, hw, 3, hair); for (const [dx, dy] of [[-5, -3], [-3, -6], [0, -7], [3, -6], [5, -4], [7, -1]]) { T(cx + dx - 2, hy2 - 1, cx + dx + 2, hy2 - 1, cx + dx, hy2 + dy, hair); } P(cx - 3, hy2 - 4, hairL); P(cx, hy2 - 5, hairL); P(cx + 3, hy2 - 4, hairL); }
    if (style === 'long') { R(cx - hw / 2 - 1, hy2 + 6, 6, 12, hair); R(cx - hw / 2 - 1, hy2 + 17, 6, 1, hairD); R(cx + 1, hy2 + 8, 3, 8, hair); }
    if (style === 'ponytail') { R(cx - 2, hy2 + 8, 4, 14, hair); R(cx - 2, hy2 + 21, 4, 1, hairD); P(cx - 1, hy2 + 9, hairL); R(cx - 4, hy2 + 6, 8, 2, p.headband || hairD); }
    if (style === 'bob') { R(cx - hw / 2 - 1, hy2 + 6, hw + 2, 4, hair); R(cx - hw / 2 - 1, hy2 + 10, hw + 2, 1, hairD); }
    if (style === 'bald') { R(cx - hw / 2, hy2 + 1, hw, 8, skin); R(cx - hw / 2, hy2 + 5, 2, 4, hair); R(cx + hw / 2 - 2, hy2 + 5, 2, 4, hair); }
    if (p.headband) R(cx - hw / 2, hy2 + 4, hw, 2, p.headband);
    if (p.hat === 'helmet') { R(cx - hw / 2 - 1, hy2 - 1, hw + 2, 7, p.hatColor); R(cx - hw / 2, hy2 - 2, hw, 1, p.hatColor); R(cx - hw / 2 + 1, hy2 - 1, 5, 1, tint(p.hatColor, 0.2)); if (p.plume) { R(cx - 2, hy2 - 6, 4, 5, p.plume); R(cx - 1, hy2 - 8, 3, 3, p.plume); P(cx + 1, hy2 - 9, p.plume); } }
    if (p.hat === 'hood') { R(cx - hw / 2 - 1, hy2 - 1, hw + 2, 9, p.hatColor); R(cx - hw / 2, hy2 - 2, hw, 1, p.hatColor); }
  },
  // the weapon in the right hand, at (x, y), by how the arm carries it
  weapon(g, type, x, y, arm, col, side) {
    side = side || 1;
    const R = (x, y, w, h, c) => Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), c), P = (x, y, c) => Gfx.px(g, Math.round(x), Math.round(y), c), L = (x0, y0, x1, y1, c) => Gfx.line(g, x0, y0, x1, y1, c);
    const steel = col || '#c8d0e0', steelL = tint(steel, 0.5), steelD = shade(steel, 0.6), wood = '#8a5a2a', woodL = '#b88650', gold = '#e8c040';
    // the direction the blade or haft runs from the hand
    const dir = arm === 'high' ? [0.8 * side, -1] : arm === 'slash' ? [1, 0.75] : arm === 'point' ? [1, 0] : arm === 'rest' ? [0.2, 1] : arm === 'ground' ? [1, -0.3] : [0.35 * side, -1];
    const len = { sword: 22, lightblade: 16, axe: 18, mace: 16, staff: 28, ankh: 26, orb: 0, scythe: 30 }[type] || 20;
    const nx = dir[0] / Math.hypot(dir[0], dir[1]), ny = dir[1] / Math.hypot(dir[0], dir[1]);
    const at = (d) => [x + nx * d, y + ny * d];
    if (type === 'none') return;
    if (type === 'orb') {   // a sphere of water floating in the open palm
      const o = col || '#60c0f0'; Gfx.circle(g, x + side * 2, y - 5, 5, shade(o, 0.7)); Gfx.circle(g, x + side * 2, y - 5, 4, o); Gfx.circle(g, x + side * 2 - 1, y - 6, 2, tint(o, 0.45)); P(x + side * 2 - 2, y - 7, '#ffffff');
      return;
    }
    if (type === 'sword' || type === 'lightblade') {
      const w = type === 'sword' ? 2 : 1;
      for (let k = 0; k < w; k++) { const [x0, y0] = at(2), [x1, y1] = at(len); L(x0 + k, y0, x1 + k, y1, steel); }
      const [tx, ty] = at(len); P(tx, ty, steelL); const [mx, my] = at(len * 0.6); L(x + nx * 3, y + ny * 3, mx, my, steelL);
      const [gx, gy] = at(1); L(gx - ny * 3, gy + nx * 3, gx + ny * 3, gy - nx * 3, gold); L(gx - ny * 3 + 1, gy + nx * 3, gx + ny * 3 + 1, gy - nx * 3, gold);   // the crossguard
      const [px, py] = at(-3); L(x, y, px, py, wood); P(px, py, gold);
    } else if (type === 'axe') {
      const [x0, y0] = at(-3), [x1, y1] = at(len); L(x0, y0, x1, y1, wood); L(x0 + 1, y0, x1 + 1, y1, woodL);
      // the head: a broad crescent blade on the outer side of the haft, its rim catching the light, a short spike behind
      const [hx, hy] = at(len - 5); const bs = side; const rx = 8, ry = 9;
      for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(1 - (dy / ry) * (dy / ry))); for (let dx = 0; dx <= w; dx++) P(hx + bs * dx, hy + dy, dx === w ? steelL : dx < 2 ? steelD : steel); }
      R(hx - bs * 3 - (bs < 0 ? 0 : 3), hy - 2, 4, 4, steel); P(hx - bs * 4, hy, steelD);
      R(hx - 1, hy - 8, 3, 16, wood); R(hx, hy - 8, 1, 16, woodL); P(hx, hy - 9, gold); P(hx, hy + 8, gold);
    } else if (type === 'mace') {
      const [x0, y0] = at(-3), [x1, y1] = at(len - 4); L(x0, y0, x1, y1, wood); L(x0 + 1, y0, x1 + 1, y1, woodL);
      const [hx, hy] = at(len - 2); Gfx.circle(g, hx, hy, 4, steelD); Gfx.circle(g, hx, hy, 3, steel); P(hx - 1, hy - 1, steelL); for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5], [-4, -4], [4, -4], [-4, 4], [4, 4]]) P(hx + dx, hy + dy, steelD);
    } else if (type === 'scythe') {
      const [x0, y0] = at(-8), [x1, y1] = at(len); L(x0, y0, x1, y1, wood); L(x0 + 1, y0, x1 + 1, y1, woodL);
      const [tx, ty] = at(len - 2); const bl = col || steel;   // the blade sweeps out and down from the top of the haft
      for (let i = 0; i < 12; i++) { const w = i < 4 ? 3 : i < 9 ? 2 : 1; R(tx + side * (2 + i), ty - 2 + Math.round(i * i / 9), w, 1, i % 3 === 0 ? tint(bl, 0.35) : bl); }
      P(tx, ty - 3, gold); P(tx, ty + 2, gold);
    } else if (type === 'staff' || type === 'ankh') {
      const [x0, y0] = at(-6), [x1, y1] = at(len); L(x0, y0, x1, y1, wood); L(x0 + 1, y0, x1 + 1, y1, woodL);
      const [tx, ty] = at(len); const orb = col || '#60c0f0';
      if (type === 'staff') { Gfx.circle(g, tx, ty, 3, gold); Gfx.circle(g, tx, ty, 2, orb); P(tx - 1, ty - 1, '#ffffff'); P(tx - 3, ty + 2, gold); P(tx + 3, ty + 2, gold); }
      else { Gfx.circle(g, tx, ty - 2, 4, gold); Gfx.circle(g, tx, ty - 2, 2, orb); R(tx - 5, ty + 2, 11, 2, gold); P(tx, ty - 3, '#ffffff'); }
    }
  },
  // collapsed on one knee, head down, the weapon fallen beside
  downed(g, p, k) {
    const R = (x, y, w, h, col) => { if (col) Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col); };
    const P = (x, y, col) => { if (col) Gfx.px(g, Math.round(x), Math.round(y), col); };
    const cx = 26; Gfx.ellipse(g, cx, 60, 15, 3, 'rgba(0,0,0,0.28)'); g.translate(0, 12);
    if (k.cape) { R(cx - 12, 30, 24, 14, k.cape); R(cx - 12, 43, 24, 1, k.capeD); }
    // legs folded under, boots out to the sides
    R(cx - 12, 41, 8, 5, k.boots); R(cx + 5, 41, 8, 5, k.boots); R(cx - 13, 45, 9, 2, k.bootsD); R(cx + 5, 45, 9, 2, k.bootsD);
    if (k.dress) { R(cx - 11, 34, 22, 10, k.dress); R(cx - 11, 43, 22, 1, k.dressD); } else { R(cx - 9, 36, 7, 7, k.pants); R(cx + 3, 36, 7, 7, k.pants); }
    // the torso bent forward, shoulders low
    R(cx - 9, 30, 18, 9, k.top); R(cx - 9, 30, 18, 1, tint(k.top, 0.2)); R(cx - 9, 37, 18, 1, k.topD); R(cx - 7, 36, 14, 2, k.belt);
    R(cx - 13, 33, 4, 7, k.top); R(cx - 13, 40, 4, 2, k.skin); R(cx + 9, 33, 4, 7, k.top); R(cx + 9, 40, 4, 2, k.skin);
    // the head hangs forward: the crown of hair shows just above the hunched shoulders
    R(cx - 6, 26, 12, 7, k.hair); R(cx - 5, 25, 10, 1, k.hair); R(cx - 4, 25, 5, 1, k.hairL); R(cx - 6, 31, 12, 2, k.hairD); R(cx - 3, 32, 6, 1, k.skin);
    // the weapon dropped on the ground beside the knee
    if (k.wp !== 'orb') this.weapon(g, k.wp, cx + 12, 47, 'ground', p.weaponColor); g.translate(0, -12);
  },
};
