// ---------- Artifacts ----------
// The rare equipment of the originals, after the Artifacts Guide (reference game mechanics/txt/artifacts.txt):
// unlike ordinary stock, an artifact sold or dropped goes onto the shops' shared Artifact List and can be bought
// back from any shop of the right kind; and as the party reaches new towns, that town's artifacts appear on the
// list (the Shamshir once Lunpa is reached, the Silver Blade at Lalivero...). The list keeps a count of each.
// Weapons sit on the weapon shops' list, armor on the weapon shops' (and Kalay's armory's), rings, boots and
// shirts on the item shops'. The Fur Coat and the Psynergy Armor never come back once sold, as in the original.
'use strict';
const ARTIFACT_NAMES = new Set([
  'Shamshir', 'Silver Blade', 'Arctic Blade', 'Gaia Blade', 'Muramasa', 'Ninja Blade', 'Swift Sword', 'Elven Rapier', 'Assassin Blade', 'Mystery Blade', 'Kikuichimonji', "Bandit's Sword",
  'Dragon Axe', 'Giant Axe', 'Vulcan Axe', 'Burning Axe', 'Demon Axe', 'Righteous Mace', 'Grievous Mace', 'Blessed Mace', 'Wicked Mace',
  'Magic Rod', "Witch's Wand", 'Blessed Ankh', 'Psynergy Rod', 'Frost Wand', 'Angelic Ankh', 'Demonic Staff', 'Crystal Rod', 'Zodiac Wand', "Shaman's Rod",
  'Spirit Armor', 'Dragon Scales', 'Demon Mail', "Asura's Armor", 'Spiked Armor', 'Elven Shirt', 'Water Jacket', 'Storm Gear', 'Kimono', 'Ninja Garb', 'China Dress', 'Cocktail Dress',
  'Blessed Robe', 'Magical Cassock', 'Feathered Robe', "Oracle's Robe", 'Mirrored Shield', 'Dragon Shield', 'Earth Shield', 'Vambrace', 'War Gloves', 'Spirit Gloves', 'Battle Gloves', 'Aura Gloves',
  'Spirit Armlet', 'Virtuous Armlet', 'Guardian Armlet', "Warrior's Helm", "Adept's Helm", 'Jeweled Crown', 'Lucky Cap', 'Thunder Crown', 'Ninja Hood', "Prophet's Hat", 'Lure Cap', 'Mythril Circlet', 'Glittering Tiara',
  'Mythril Shirt', 'Silk Shirt', 'Running Shirt', 'Hyper Boots', 'Quick Boots', 'Fur Boots', 'Turtle Boots',
  'Adept Ring', 'War Ring', 'Sleep Ring', 'Healing Ring', 'Unicorn Ring', 'Fairy Ring', "Cleric's Ring",
]);
const ARTIFACT_UNIQUE = new Set(['Fur Coat', 'Psynergy Armor']);   // gone for good once sold
// what each town brings onto the list when the party first reaches it
const ARTIFACT_LISTS = {
  vault: ['Magic Rod'],
  bilibin: ["Witch's Wand"],
  imil: ['Blessed Ankh'],
  xian: ['China Dress'],
  altin: ['Psynergy Rod'],
  kalay: ['Frost Wand'],
  lunpa: ['Shamshir', 'Ninja Blade', 'Dragon Axe', 'Demonic Staff', 'Blessed Robe', 'War Gloves'],
  tolbi: ['Angelic Ankh'],
  lalivero: ['Silver Blade', 'Swift Sword', 'Righteous Mace', 'Crystal Rod', 'Magical Cassock', 'Mirrored Shield', 'Spirit Armlet', 'Jeweled Crown'],
};
const Artifacts = {
  isArtifact(name) { return ARTIFACT_NAMES.has(name); },
  kind(name) {
    const it = ITEM_DB[name]; if (!it) return 'item';
    if (['long', 'light', 'axe', 'mace', 'staff'].includes(it.cat)) return 'weapon';
    if (['armor', 'cloth', 'robe', 'hat', 'helm', 'circlet', 'shield', 'glove', 'brace'].includes(it.cat)) return 'armor';
    return 'item';
  },
  // which kinds a shop's list shows: weapon shops carry weapons and armor, an armory armor, item shops the rest
  shopKinds(shopId) { return /_armor$/.test(shopId) ? ['armor'] : /_weapon|_weaponshop|armory|armoury/.test(shopId) ? ['weapon', 'armor'] : ['item']; },
  list() { return G.get('artifact_list') || {}; },
  add(name, n) { if (!this.isArtifact(name)) return; const l = this.list(); l[name] = (l[name] || 0) + (n || 1); G.set('artifact_list', l); },
  take(name) { const l = this.list(); if (!l[name]) return false; l[name]--; if (l[name] <= 0) delete l[name]; G.set('artifact_list', l); return true; },
  // the towns reached so far bring their artifacts onto the list, once each
  unlock() { for (const town in ARTIFACT_LISTS) { if (!G.flag('visited:' + town) || G.flag('artifacts_unlocked:' + town)) continue; G.set('artifacts_unlocked:' + town); for (const n of ARTIFACT_LISTS[town]) this.add(n, 1); } },
  forShop(shopId) { this.unlock(); const kinds = this.shopKinds(shopId); const l = this.list(); return Object.keys(l).filter(n => l[n] > 0 && ITEM_DB[n] && kinds.includes(this.kind(n))).sort((a, b) => ITEM_DB[a].buy - ITEM_DB[b].buy); },
};
