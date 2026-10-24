// ---------- Sunshine's forge (Yallam) ----------
// The Lost Age's best equipment is not bought or found - it is made. You bring the smith a raw material, he decides
// what to make of it, and you come back later to collect. Rusty weapons are the exception: those always come back as
// the same blade, which is why the originals let you hand them over without saving first.
'use strict';

// What each material can become, with the smith's odds (per cent) from the guide's table. The smith picks one of
// them, not you - and the rarest pieces (Excalibur at 5%) are rare on purpose.
const FORGE_ODDS = {
  'Orihalcon': { 'Excalibur': 5, 'Stellar Axe': 10, 'Nebula Wand': 15, 'Xylion Armor': 20, 'Big Bang Gloves': 15, 'Cosmos Shield': 15, 'Millennium Helm': 20 },
  'Dark Matter': { 'Darksword': 10, 'Stealth Armor': 30, 'Terra Shield': 25, 'Fear Helm': 20, 'Demon Circlet': 15 },
  'Mythril Silver': { 'Levatine': 10, 'Mythril Blade': 20, 'Mythril Clothes': 20, 'Mythril Helm': 15, 'Mythril Armlet': 20, 'Psychic Circlet': 15 },
  'Golem Core': { 'Huge Sword': 15, "Gaia's Axe": 15, 'Tungsten Mace': 15, 'Chronos Mail': 30, 'Titan Gloves': 25 },
  'Salamander Tail': { 'Burning Sword': 15, "Apollo's Axe": 15, 'Salamander Rod': 20, 'Ardagh Robe': 25, 'Flame Shield': 25 },
  'Dragon Skin': { 'Dragon Mail': 20, 'Dragon Robe': 15, 'Dragon Shield': 25, 'Dragon Helm': 25, 'Dragon Boots': 15 },
  'Sylph Feather': { 'Sylph Rapier': 25, 'Faery Vest': 25, 'Aerial Gloves': 25, 'Floating Hat': 25 },
  'Star Dust': { 'Comet Mace': 20, 'Planet Armor': 20, 'Luna Shield': 20, 'Astral Circlet': 20, 'Stardust Ring': 20 },
  'Tear Stone': { 'Cloud Wand': 25, 'Clear Bracelet': 30, 'Pure Circlet': 25, 'Spirit Ring': 20 },
};
const FORGE_TABLE = {};
for (const m of Object.keys(FORGE_ODDS)) FORGE_TABLE[m] = Object.keys(FORGE_ODDS[m]);
// a rusty weapon is never a gamble - the same blade comes back every time
// (each rusty weapon the world holds is its own entry in ITEM_DB, shown as a plain 'Rusty Sword' but remembering
// what it was: Rusty Sword -> Robber's Blade, B -> Corsair's Edge, C -> Pirate's Sabre, D -> Soul Brand, and so on)
for (const k of Object.keys(ITEM_DB)) if (ITEM_DB[k].forgeTo) FORGE_TABLE[k] = [ITEM_DB[k].forgeTo];
const FORGE_MATERIALS = Object.keys(FORGE_TABLE);

const Forge = {
  held() { return FORGE_MATERIALS.filter(m => G.inventory.has(m)); },
  rusty(name) { return name.startsWith('Rusty'); },
  // hand a material over: the smith settles on something and starts work
  take(name) {
    if (!FORGE_TABLE[name] || !G.inventory.has(name)) return null;
    G.inventory.remove(name);
    const pool = FORGE_TABLE[name].filter(n => ITEM_DB[n]);
    const odds = FORGE_ODDS[name];
    let made = null;
    if (pool.length && odds) {   // the guide's rates, not a coin toss between the pieces
      let r = Math.random() * pool.reduce((t, n) => t + (odds[n] || 0), 0);
      for (const n of pool) { r -= odds[n] || 0; if (r < 0) { made = n; break; } }
      if (!made) made = pool[pool.length - 1];
    } else if (pool.length) made = pick(pool);
    G.set('forge_order', made); G.set('forge_from', name); G.set('forge_ready', false);
    return made;
  },
  // what the party would gain by wearing a piece, so the shelf can say whether it is worth taking
  bestGain(name) {
    const it = ITEM_DB[name]; if (!it) return 0;
    let best = 0;
    for (const m of G.party.members) {
      if (!m.canEquip(name)) continue;
      const slot = m.slotFor(name); if (!slot) continue;
      const before = m.stats(); const cur = m.equip[slot];
      m.equip[slot] = name; const after = m.stats(); m.equip[slot] = cur;
      const d = (after.atk - before.atk) + (after.def - before.def) + (after.hp - before.hp) * 0.1;
      if (d > best) best = d;
    }
    return Math.round(best);
  }
};

// The shelf of raw materials, with what each one could turn into. Choosing is the only part that is yours.
class ForgeScene {
  constructor() {
    this.closed = false; this.msg = 'Z: hand it over.  X: keep it.';
    const mats = Forge.held();
    this.menu = new MenuList(mats.map(m => ({ label: m, id: m })), { x: 10, y: 34, w: 110, rows: 8, lineH: 12 });
  }
  update() {
    this.menu.update();
    if (this.menu.cancelled) { this.closed = true; Engine.pop(); return; }
    if (this.menu.chosen) {
      const name = this.menu.chosen.id;
      const made = Forge.take(name);
      this.closed = true; Engine.pop();
      const F = G.field;
      F.run(function* (E) {
        if (!made) { yield E.say("...There is nothing in this I can use. Keep it.", 'Sunshine'); return; }
        if (Forge.rusty(name)) yield E.say("Rust, is it? I know exactly what is under that. Give me the afternoon.", 'Sunshine');
        else yield E.say("Now THAT is a material. Leave it with me - I will know what it wants to be when I have it on the anvil.", 'Sunshine');
        yield E.say("Go on, out. Come back when you have something else to do with your day.", 'Sunshine');
      });
    }
  }
  draw(g) {
    UI.window(g, 2, 2, SCREEN_W - 4, 16); Font.draw(g, "Sunshine's Forge", 8, 6, '#ffe080'); Font.draw(g, 'X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });
    UI.window(g, 4, 20, 116, 116); Font.draw(g, 'Raw materials', 10, 24, '#a0c0ff'); this.menu.draw(g);
    UI.window(g, 124, 20, 112, 116);
    const cur = this.menu.current && this.menu.current.id;
    if (cur) {
      Font.draw(g, Forge.rusty(cur) ? 'Always becomes' : 'Could become', 130, 24, '#a0c0ff');
      const pool = FORGE_TABLE[cur].filter(n => ITEM_DB[n]);
      pool.slice(0, 8).forEach((n, i) => {
        const gain = Forge.bestGain(n);
        Font.draw(g, Font.fit(n, 86), 130, 36 + i * 11, gain > 0 ? '#ffffff' : '#8090b0');
        if (gain > 0) Font.draw(g, '+' + gain, 232, 36 + i * 11, '#80ff80', { align: 'right' });
      });
    }
    UI.window(g, 2, 138, SCREEN_W - 4, 18); Font.draw(g, Font.fit(this.msg, 224), 8, 143, '#ffffff');
  }
}
