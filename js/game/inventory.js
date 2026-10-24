// ---------- Inventory, item effects, unleashes ----------
'use strict';
// Augment generated ITEM_DB with effects
(function () {
  const X = (n, o) => { if (!ITEM_DB[n]) ITEM_DB[n] = { n, cat: 'misc', buy: 0, sell: 0 }; Object.assign(ITEM_DB[n], o); };
  // Consumables
  X('Herb', { use: { hp: 50 }, desc: 'Restores 50 HP.' }); X('Nut', { use: { hp: 200 }, desc: 'Restores 200 HP.' }); X('Vial', { use: { hp: 500 }, desc: 'Restores 500 HP.' });
  X('Potion', { use: { hpFull: true }, desc: 'Restores all HP.' }); X("Hermes' Water", { use: { hpFull: true, ppPct: 0.5 }, desc: 'Restores all HP and half PP.' });
  X('Psy Crystal', { use: { ppFull: true }, desc: 'Restores all PP.' }); X('Antidote', { use: { cure: ['poison', 'venom'] }, desc: 'Cures poison and venom.' });
  X('Elixir', { use: { cure: ['delusion', 'stun', 'sleep', 'haunt', 'curse', 'seal'] }, desc: 'Cures delusion, stun and sleep.' });
  X('Water of Life', { use: { revive: 1.0 }, desc: 'Revives a downed party member.' }); X('Mist Potion', { use: { hpAll: 300 }, desc: 'Restores 300 HP to the whole party.' });
  X('Power Bread', { use: { statUp: 'hp', amt: 10 }, desc: 'Permanently boosts max HP.' }); X('Cookie', { use: { statUp: 'pp', amt: 5 }, desc: 'Permanently boosts max PP.' });
  X('Apple', { use: { statUp: 'atk', amt: 3 }, desc: 'Permanently boosts Attack.' }); X('Hard Nut', { use: { statUp: 'def', amt: 3 }, desc: 'Permanently boosts Defense.' });
  X('Mint', { use: { statUp: 'agi', amt: 3 }, desc: 'Permanently boosts Agility.' }); X('Lucky Pepper', { use: { statUp: 'lck', amt: 2 }, desc: 'Permanently boosts Luck.' });
  X('Corn', { use: { hp: 100 }, desc: 'Restores 100 HP.' }); X('Sacred Feather', { use: { avoid: 300 }, desc: 'Lowers random encounters for a while.' });
  X('Smoke Bomb', { battle: { status: 'delusion', range: 3 }, desc: 'Deludes enemies.' }); X('Sleep Bomb', { battle: { status: 'sleep', range: 3 }, desc: 'Puts enemies to sleep.' });
  X('Oil Drop', { battle: { dmg: 60, el: 2, range: 1 }, desc: 'Burns an enemy.' }); X("Weasel's Claw", { battle: { dmg: 70, el: 3, range: 1 }, desc: 'Slashes an enemy.' });
  X('Bramble Seed', { battle: { dmg: 80, el: 0, range: 3 }, desc: 'Entangles enemies.' }); X('Crystal Powder', { battle: { dmg: 90, el: 1, range: 3 }, desc: 'Freezes enemies.' });
  // Gear with a 'Use' effect (the guides' tables): rings, armlets, hats, a few weapons and dresses. Not spent when
  // used, but each use may break the piece. buff: [stat, amount, allAllies?] works in battle only.
  const GEAR_USE = {
    'Adept Ring': { use: { pp: 7 } }, 'Aroma Ring': { use: { hpAll: 100 } }, 'Fairy Ring': { use: { cure: ['poison', 'venom', 'delusion', 'stun', 'sleep', 'haunt', 'curse', 'seal'] } },
    'Golden Ring': { use: { buff: ['res', 40, false] } }, 'Healing Ring': { use: { hp: 70 } }, 'Rainbow Ring': { battle: { status: 'delusion', range: 1 } }, 'Sleep Ring': { battle: { status: 'sleep', range: 3 } },
    'Soul Ring': { use: { revive: 0.5 } }, 'Spirit Ring': { use: { hpAll: 160 } }, 'Stardust Ring': { battle: { status: 'seal', range: 3 } }, 'Unicorn Ring': { use: { cure: ['poison', 'venom'] } }, 'War Ring': { use: { buff: ['atk', 0.25, false] } },
    "Captain's Axe": { use: { buff: ['def', 0.25, false] } }, 'Blessed Mace': { use: { hp: 200 } }, "Fireman's Pole": { use: { buff: ['res', 40, true] } }, "Clotho's Distaff": { use: { hp: 1000 } },
    'Phantasmal Mail': { battle: { status: 'delusion', range: 3 } }, 'Faery Vest': { use: { hp: 200 } }, 'Floral Dress': { battle: { status: 'sleep', range: 3 } }, 'China Dress': { battle: { debuff: ['atk', -0.25], range: 1 } },
    'Earth Shield': { use: { hp: 150 } }, 'Mirrored Shield': { battle: { status: 'delusion', range: 3 } }, 'Aura Gloves': { use: { buff: ['res', 40, true] } }, 'Guardian Armlet': { use: { buff: ['def', 0.25, false] } },
    'Virtuous Armlet': { use: { hp: 100 } }, 'Spirit Armlet': { use: { cure: ['poison', 'venom', 'delusion', 'stun', 'sleep', 'haunt', 'curse', 'seal'] } }, "Nurse's Cap": { use: { hp: 50 } }, "Prophet's Hat": { battle: { status: 'curse', range: 1 } },
    'Otafuku Mask': { battle: { dmg: 90, el: 1, range: 3 } }, 'Hiotoko Mask': { battle: { dmg: 90, el: 2, range: 3 } }, "Alastor's Hood": { battle: { status: 'haunt', range: 3 } }, 'Herbed Shirt': { battle: { debuff: ['def', -0.25], range: 1 } },
    'Bone Armlet': { battle: { status: 'haunt', range: 1 } }, 'Glittering Tiara': { use: { buff: ['res', 20, false] } }
  };
  for (const [k, v] of Object.entries(GEAR_USE)) if (ITEM_DB[k]) Object.assign(ITEM_DB[k], v, { gearUse: true, breakChance: 0.25 });
  // the words for the things with none
  const DESC = { 'Empty Bottle': "An empty bottle. It could hold the water of Hermes' spring.", 'Cell Key': "The key to a cell in Alhafra's jail.", 'Healing Fungus': 'A mushroom said to cure any sickness.', 'Laughing Fungus': 'A red mushroom. It is good for nothing but a laugh.',
    'Dancing Idol': 'A small idol of a dancing figure. Uzume of Izumo wants it back.', 'Pretty Stone': 'A pretty stone from the beach. Someone might want it.', 'Red Cloth': 'A scrap of red cloth. Someone might want it.', 'Milk': 'A pail of fresh milk. Someone might want it.', "Li'l Turtle": 'A little turtle. It seems to want to go home.',
    'Large Bread': 'A loaf as long as an arm. A hungry boy would love it.', "Sea God's Tear": 'A blue teardrop of stone from the shrine in Daila. The Sea God statue weeps for it.', 'Ruin Key': 'Opens the sealed door in the Madra Catacombs.', "Layana's Letter": 'A letter from Lady Layana of Kalay.', 'Hermes Water': "Water from Hermes' spring. Restores all HP and half PP.",
    'Black Orb': 'The black crystal from the Great Gabomba. It answers to the Lemurian ship.', 'Signal Whistle': 'A whistle that calls the ship.', 'Game Ticket': "Play the lucky wheel in Tolbi, or Contigo's slot machine.", 'Lucky Medal': 'Toss it into a fountain for luck.' };
  for (const [k, v] of Object.entries(DESC)) if (ITEM_DB[k] && !ITEM_DB[k].desc) ITEM_DB[k].desc = v;
  for (const k of Object.keys(ITEM_DB)) if (k.startsWith('Rusty')) ITEM_DB[k].desc = ITEM_DB[k].desc || 'A rusted weapon. Sunshine, the smith in Yallam, could make something of it.';
  X('Lucky Medal', { desc: 'Toss it into a fountain for luck.' }); X('Game Ticket', { desc: 'Play the lucky wheel in Tolbi.' });
  // gear the guides mark for the girls only (Mia, Jenna, Sheba): the dresses and the like
  for (const n of ['One-Piece Dress', 'China Dress', 'Cocktail Dress', 'Oracle Robe', 'Floral Dress', 'Divine Camisole', 'Otafuku Mask', 'Silk Shirt']) if (ITEM_DB[n]) { ITEM_DB[n].female = true; ITEM_DB[n].desc = (ITEM_DB[n].desc ? ITEM_DB[n].desc + ' ' : '') + '(Ladies only)'; }
  // Psynergy-granting items (equip to learn)
  const grants = { 'Douse Drop': 'Douse', 'Frost Jewel': 'Frost', 'Lifting Gem': 'Lift', 'Halt Gem': 'Halt', 'Cloak Ball': 'Cloak', 'Carry Stone': 'Carry', 'Catch Beads': 'Catch', 'Orb of Force': 'Force', 'Lash Pebble': 'Lash', 'Pound Cube': 'Pound', 'Scoop Gem': 'Scoop', 'Cyclone Chip': 'Cyclone', 'Tremor Bit': 'Tremor', 'Burst Brooch': 'Burst', 'Grindstone': 'Grind', 'Hover Jade': 'Hover', 'Teleport Lapis': 'Teleport' };
  for (const [k, v] of Object.entries(grants)) X(k, { cat: 'psyitem', grants: v, key: true, desc: "Bestows the Psynergy '" + v + "' on whoever carries it. Give it to a party member; they may carry any number." });   /* carried, not worn: as many per Adept as they like, the real games' way */
  // Key items
  ['Venus Star', 'Mercury Star', 'Mars Star', 'Jupiter Star', 'Mythril Bag', 'Small Jewel', "Dragon's Eye", 'Bone', 'Anchor Charm', 'Cell Key', 'Boat Ticket', "Layana's Letter", 'Mystic Draught', 'Black Crystal', 'Red Key', 'Blue Key', 'Hermes Water', 'Shaman\'s Rod', 'Sea God\'s Tear', 'Ruin Key', 'Right Prong', 'Left Prong', 'Center Prong', 'Trident', 'Dancing Idol', 'Healing Fungus', 'Laughing Fungus', 'Black Orb', 'Magma Ball', 'Milk', 'Red Cloth', 'Pretty Stone', "Li'l Turtle", 'Aquarius Stone', 'Large Bread', 'Signal Whistle', 'Mysterious Card', "Trainer's Whip", 'Tomegathericon'].forEach(k => X(k, { key: true }));
  X('Mysterious Card', { cat: 'ring', classItem: 'pierrot', key: true, desc: 'A card that changes your class.' }); X("Trainer's Whip", { cat: 'ring', classItem: 'tamer', key: true, desc: 'A whip that changes your class.' }); X('Tomegathericon', { cat: 'ring', classItem: 'darkmage', key: true, desc: 'A tome that changes your class.' });
  X("Shaman's Rod", { cat: 'staff', atk: 10, key: true, desc: 'A rod entrusted to Ivan by Hammet.' });
  X('Fire Brand', { atk: 115 });   /* the Sol Blade keeps its true edge (200) from the table */
  // Unleash effects: name -> {el, add, mult, status, chance}
  window.UNLEASH = {
    'Rapid Smash': { el: 3, add: 0, mult: 0.9, dbl: 0.5 }, 'Sonic Smash': { el: 3, add: 0, mult: 1, triple: 0.3 }, 'Vorpal Slash': { el: 3, add: 16 }, 'Acid Bath': { el: 2, add: 34, debuff: { stat: 'atk', amt: -0.25 } },
    'Aqua Sock': { el: 1, add: 42 }, 'Purgatory': { el: 2, add: 82 }, 'Blizzard': { el: 1, add: 18, debuff: { stat: 'atk', amt: -0.25 } }, 'Titan Sword': { el: 0, add: 70 }, 'Titan Blade': { el: 0, add: 70 }, 'Megiddo': { el: 0, add: 60, mult: 3 }   /* the Sol Blade: Venus, triple damage - the strongest unleash there is */,
    'Demon Fire': { el: 2, add: 60, status: 'haunt' }, 'Terra Strike': { el: 0, add: 20 }, 'Life Nourish': { el: 0, add: 25, drain: 1 }, 'Mortal Danger': { el: 0, add: 28, status: 'down', chance: 0.3 }, 'Bad Omen': { el: 0, add: 43, status: 'haunt' },
    'Deadly Poison': { el: 0, add: 53, status: 'venom' }, 'Poison Cloud': { el: 0, add: 55, status: 'poison' }, 'Barrage': { el: 2, add: 20, status: 'stun' }, 'Heat Mirage': { el: 2, add: 21, status: 'delusion' }, 'Broil': { el: 2, add: 23 },
    'Meltdown': { el: 2, add: 47, debuff: { stat: 'def', amt: -0.25 } }, 'Murk': { el: 3, add: 10, status: 'sleep' }, 'Stun Voltage': { el: 3, add: 12, status: 'stun' }, 'Psyphon Seal': { el: 3, add: 14, status: 'seal' }, 'Cyclone Slash': { el: 3, add: 38, debuff: { stat: 'res', amt: -40 } },
    'Blinding Smog': { el: 3, add: 49, status: 'delusion' }, 'Shining Star': { el: 3, add: 57, status: 'delusion' }, 'Asura': { el: 3, add: 64, pierce: 0.5 }, 'Frost Bite': { el: 1, add: 28, status: 'stun' }, 'Life Leech': { el: 1, add: 29, drain: 1 },
    // the rest of the guides' unleash table (bonus damage from the weapon's own tier; the effects as listed)
    "Acheron's Grief": { el: 0, add: 115, status: 'venom' },
    'Aging Gas': { el: 3, add: 70, drain: 1 },
    'Apocalypse': { el: 3, add: 97, status: 'curse' },
    'Blaze Rush': { el: 2, add: 86, debuff: { stat: 'def', amt: -0.25 } },
    'Boost Hack': { el: 2, add: 24 },
    'Crucible Fire': { el: 2, add: 79, debuff: { stat: 'agi', amt: -0.25 } },
    'Cyclone Attack': { el: 3, add: 51, debuff: { stat: 'res', amt: -40 } },
    'Dreamtide': { el: 1, add: 20, status: 'sleep' },
    'Evil Eye': { el: 0, add: 63, status: 'delusion' },
    'Fire Dance': { el: 2, add: 85, debuff: { stat: 'atk', amt: -0.25 } },
    'Flare Burst': { el: 2, add: 86, drain: 1 },
    'Flash Edge': { el: 3, add: 73, status: 'delusion' },
    'Flash Force': { el: 1, add: 69, status: 'seal' },
    'Hammersphere': { el: 0, add: 87, debuff: { stat: 'def', amt: -0.25 } },
    'Heartbreak': { el: 0, add: 68, status: 'down', chance: 0.3 },
    'Heat Shatter': { el: 2, add: 78, debuff: { stat: 'res', amt: -40 } },
    'Heavy Divide': { el: 0, add: 85, debuff: { stat: 'def', amt: -0.25 } },
    'High Vitals': { el: 3, add: 83, drain: 1 },
    'Hurricane': { el: 1, add: 33, debuff: { stat: 'atk', amt: -0.25 } },
    'Ice Crush': { el: 1, add: 57, debuff: { stat: 'def', amt: -0.25 } },
    'Lethe Albion': { el: 1, add: 88, status: 'seal' },
    'Life Shear': { el: 2, add: 92, status: 'down', chance: 0.3 },
    'Light Surge': { el: 3, add: 83, status: 'delusion' },
    'Lunar Slash': { el: 3, add: 49, debuff: { stat: 'res', amt: -40 } },
    'Mad Zephyr': { el: 3, add: 68, triple: 0.3 },
    'Moon Air': { el: 3, add: 26, status: 'sleep' },
    'Mother Earth': { el: 0, add: 89, status: 'sleep' },
    'Nirvana': { el: 3, add: 82, ppdrain: true },
    'Poison Death': { el: 0, add: 71, status: 'venom' },
    'Power Drive': { el: 2, add: 41 },
    'Radiant Fire': { el: 2, add: 95, pierce: 0.5 },
    "Raiden's Wrath": { el: 3, add: 71, pierce: 0.5 },
    'Reverse Star': { el: 1, add: 90, ppdrain: true },
    'Rising Dragon': { el: 1, add: 74, dbl: 0.5 },
    'Sarcophagus': { el: 0, add: 45, status: 'haunt' },
    'Sargasso': { el: 1, add: 73, status: 'down', chance: 0.3 },
    'Scorpionfish': { el: 2, add: 74, status: 'venom' },
    'Searing Fog': { el: 1, add: 60, status: 'delusion' },
    'Shred': { el: 2, add: 55, debuff: { stat: 'def', amt: -0.25 } },
    'Soul Shatter': { el: 2, add: 77, ppdrain: true },
    'Stone Justice': { el: 0, add: 20, debuff: { stat: 'agi', amt: -0.25 } },
    'Stun Bolt': { el: 3, add: 75, status: 'stun' },
    'Stun Cloud': { el: 1, add: 53, status: 'stun' },
    'Supernova': { el: 3, add: 94, status: 'stun' },
    'Vein Tap': { el: 0, add: 69, drain: 1 },
    'Vengeance': { el: 0, add: 97, mults: [2, 4, 7] },
    'Void Beam': { el: 3, add: 89, status: 'seal' },
    'Wyrd Curse': { el: 0, add: 59, status: 'haunt' },
    'Psy Leech': { el: 1, add: 22, ppdrain: true }, 'Drown': { el: 1, add: 47, status: 'down', chance: 0.3 }, 'Lightning Bolt': { el: 3, add: 40 }, 'Cataclysm': { el: 0, add: 90 }, 'Star Fire': { el: 2, add: 75 }, 'Legend': { el: 3, add: 100, triple: 0.34 }, 'Ice Missile': { el: 1, add: 60 }
  };
})();

class Inventory {
  constructor() { this.items = []; } // [{name, qty}]
  count(name) { const s = this.items.find(i => i.name === name); return s ? s.qty : 0; }
  has(name) { return this.count(name) > 0; }
  add(name, qty) {
    qty = qty || 1; if (!ITEM_DB[name]) { console.warn('unknown item', name); ITEM_DB[name] = { n: name, cat: 'misc', buy: 0, sell: 0, key: true }; }
    const s = this.items.find(i => i.name === name); if (s) s.qty += qty; else this.items.push({ name, qty }); return true;
  }
  remove(name, qty) { qty = qty || 1; const i = this.items.findIndex(it => it.name === name); if (i < 0) return false; this.items[i].qty -= qty; if (this.items[i].qty <= 0) this.items.splice(i, 1); return true; }
  list(filter) { return this.items.filter(s => !filter || filter(ITEM_DB[s.name], s)); }
  usable() { return this.items.filter(s => ITEM_DB[s.name].use); }
  battleUsable() { return this.items.filter(s => ITEM_DB[s.name] && (ITEM_DB[s.name].use || ITEM_DB[s.name].battle)); }
  equipment() { return this.items.filter(s => { const c = ITEM_DB[s.name].cat; return ['long', 'light', 'axe', 'mace', 'staff', 'armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'helm', 'hat', 'circlet', 'ring', 'shirt', 'boots'].includes(c); }); }
  serialize() { return this.items; }
  static deserialize(a) { const inv = new Inventory(); inv.items = a || []; return inv; }
}
// Apply a consumable item to a character (field or battle). Returns message
function useItemOn(itemName, ch) {
  const it = ITEM_DB[itemName]; const u = it.use; if (!u) return null; let msg = '';
  if (u.revive) { if (!ch.down) return { fail: true, msg: ch.name + ' is not downed.' }; ch.status.down = false; ch.hp = Math.max(1, Math.floor(ch.maxHp() * u.revive)); msg = ch.name + ' was revived!'; }
  else if (ch.down && !u.statUp) return { fail: true, msg: ch.name + ' is downed.' };
  if (u.hp) { const h = ch.heal(u.hp); msg = ch.name + ' recovered ' + h + ' HP.'; }
  if (u.hpFull) { const h = ch.heal(99999); msg = ch.name + ' recovered ' + h + ' HP.'; }
  if (u.hpAll) { const who = (typeof G !== 'undefined' && G.party) ? (G.party.active && G.party.active.length ? G.party.active : G.party.members) : [ch]; let n = 0; for (const m of who) if (m.alive && !(m.status && m.status.down)) { if (m.heal(u.hpAll) > 0) n++; } msg = 'The whole party recovered up to ' + u.hpAll + ' HP.'; if (!n) return { fail: true, msg: 'No one needs healing.' }; }
  if (u.pp) { const p = ch.restorePP(u.pp); msg = ch.name + ' recovered ' + p + ' PP.'; if (!p) return { fail: true, msg: ch.name + "'s PP is full." }; }
  if (u.buff && !u._inBattle) return { fail: true, msg: 'It would do nothing here.' };
  if (u.ppFull) { const p = ch.restorePP(99999); msg = ch.name + ' recovered ' + p + ' PP.'; }
  if (u.ppPct) { ch.restorePP(Math.floor(ch.maxPp() * u.ppPct)); }
  if (u.cure) { let any = false; for (const s of u.cure) if (ch.status[s]) { delete ch.status[s]; any = true; } msg = any ? ch.name + ' was cured.' : ch.name + ' feels fine already.'; if (!any) return { fail: true, msg }; }
  if (u.statUp) { const i = STAT_KEYS.indexOf(u.statUp); ch.base[i] += u.amt; msg = ch.name + "'s " + ({ hp: 'max HP', pp: 'max PP', atk: 'Attack', def: 'Defense', agi: 'Agility', lck: 'Luck' })[u.statUp] + ' rose by ' + u.amt + '!'; }
  if (u.avoid) { G.party.avoidSteps = u.avoid; msg = 'Monsters will avoid you for a while.'; }
  return { msg };
}
