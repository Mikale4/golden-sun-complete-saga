// ---------- Playable characters & named NPC appearances ----------
'use strict';
// base: level-0 base stats [hp,pp,atk,def,agi,lck]; goals: stats at L19,L39,L59,L79,L99 for hp,pp,atk,def,agi
// pow/res: base elemental power/resist [Venus, Mercury, Mars, Jupiter]
const CHARACTERS = {
  Isaac: { name: 'Isaac', el: 0, base: [30, 20, 13, 6, 8, 3], goals: { hp: [182, 334, 486, 638, 790], pp: [80, 130, 170, 210, 250], atk: [86, 162, 237, 313, 388], def: [38, 69, 102, 134, 166], agi: [86, 163, 241, 318, 396] }, pow: [79, 78, 76, 77], res: [89, 88, 86, 87], inherent: ['Move', 'Retreat'], weapons: ['long', 'light', 'axe', 'mace'], armor: ['armor', 'cloth'], helm: ['helm', 'hat'],
    look: { sheet: 'isaac',  skin: '#f0c090', hair: '#f0b838', hairStyle: 'spiky', top: '#3058c0', sleeve: '#3058c0', pants: '#485090', boots: '#7a4a28', scarf: '#f0d040', belt: '#c05030', eyes: '#2050a0', weapon: 'sword', weaponSide: 'left' }, desc: 'A Venus Adept from Vale.' },
  Garet: { name: 'Garet', el: 2, base: [33, 18, 11, 8, 6, 2], goals: { hp: [191, 351, 510, 670, 830], pp: [76, 124, 162, 200, 238], atk: [83, 156, 228, 301, 373], def: [41, 75, 110, 144, 179], agi: [76, 144, 212, 281, 349] }, pow: [76, 77, 79, 78], res: [86, 87, 89, 88], inherent: ['Move'], weapons: ['long', 'axe', 'mace', 'light'], armor: ['armor', 'cloth'], helm: ['helm', 'hat'],
    look: { sheet: 'garet',  skin: '#f0c090', hair: '#e85020', hairStyle: 'wild', top: '#8a6a40', sleeve: '#8a6a40', pants: '#403848', boots: '#c8a050', belt: '#e0a030', armor: '#e0b040', eyes: '#603020', weapon: 'axe', headband: '#f0d040' }, desc: 'A hot-headed Mars Adept, Isaac\'s best friend.' },
  Ivan: { name: 'Ivan', el: 3, base: [28, 24, 8, 4, 11, 4], goals: { hp: [166, 304, 442, 581, 719], pp: [92, 150, 196, 242, 288], atk: [76, 144, 211, 277, 344], def: [35, 65, 95, 124, 155], agi: [91, 173, 255, 337, 419] }, pow: [77, 76, 78, 79], res: [87, 86, 88, 89], inherent: ['Mind Read'], weapons: ['light', 'staff'], armor: ['cloth', 'robe'], helm: ['hat', 'circlet'],
    look: { sheet: 'ivan',  skin: '#f8d8b0', hair: '#f0e070', hairStyle: 'bob', top: '#d0b048', sleeve: '#d0b048', pants: '#c05070', boots: '#7a4028', cape: '#48b848', belt: '#805030', eyes: '#8040a0', weapon: 'staff', weaponColor: '#e04040', weaponSide: 'left', height: 'child' }, desc: 'A young Jupiter Adept in the service of Hammet.' },
  Mia: { name: 'Mia', el: 1, base: [29, 23, 9, 5, 7, 5], goals: { hp: [173, 317, 462, 606, 751], pp: [90, 146, 190, 235, 280], atk: [79, 150, 220, 289, 359], def: [37, 68, 100, 131, 163], agi: [80, 152, 224, 296, 369] }, pow: [78, 79, 77, 76], res: [88, 89, 87, 86], inherent: [], weapons: ['staff', 'mace', 'light'], armor: ['robe', 'cloth'], helm: ['circlet', 'hat'],
    look: { sheet: 'mia',  skin: '#f8d8b0', hair: '#50b8c8', hairStyle: 'long', top: '#d0ecf8', sleeve: '#d0ecf8', pants: '#f0f0f8', boots: '#f0f0f8', dress: '#d0ecf8', belt: '#4878d0', eyes: '#3060c0', weapon: 'orb', weaponColor: '#60c0f0', weaponSide: 'left' }, desc: 'The Mercury Clan healer of Imil.' },
  Felix: { name: 'Felix', el: 0, base: [32, 19, 13, 6, 7, 2], goals: { hp: [187, 342, 498, 654, 810], pp: [78, 127, 166, 205, 244], atk: [87, 164, 240, 316, 392], def: [38, 70, 103, 135, 168], agi: [83, 158, 232, 307, 382] }, pow: [79, 78, 76, 77], res: [89, 88, 86, 87], inherent: ['Move', 'Retreat'], weapons: ['long', 'light', 'axe', 'mace'], armor: ['armor', 'cloth'], helm: ['helm', 'hat'],
    look: { sheet: 'felix',  skin: '#f0c090', hair: '#8a5028', hairStyle: 'ponytail', top: '#508850', sleeve: '#508850', pants: '#c0a870', boots: '#7a4a28', cape: '#3868c8', belt: '#805030', eyes: '#603020', weapon: 'sword', headband: '#f0d040' }, desc: "Jenna's brother, a Venus Adept raised in Prox." },
  Jenna: { name: 'Jenna', el: 2, base: [29, 21, 10, 5, 8, 4], goals: { hp: [177, 326, 474, 622, 770], pp: [85, 138, 180, 223, 265], atk: [81, 153, 224, 295, 366], def: [37, 69, 101, 132, 165], agi: [85, 162, 238, 315, 392] }, pow: [76, 77, 79, 78], res: [86, 87, 89, 88], inherent: [], weapons: ['staff', 'light', 'mace'], armor: ['cloth', 'robe'], helm: ['hat', 'circlet'],
    look: { sheet: 'jenna',  skin: '#f8d8b0', hair: '#8a3838', hairStyle: 'ponytail', top: '#8848a8', sleeve: '#8848a8', pants: '#e090b0', boots: '#6030a0', dress: '#d05080', belt: '#f0d040', eyes: '#c03030', weapon: 'staff', weaponColor: '#f0d040' }, desc: 'A Mars Adept from Vale, taken by Saturos.' },
  Sheba: { name: 'Sheba', el: 3, base: [28, 24, 8, 4, 10, 5], goals: { hp: [169, 311, 452, 593, 735], pp: [91, 148, 193, 238, 284], atk: [78, 147, 215, 283, 351], def: [36, 66, 98, 128, 159], agi: [88, 168, 248, 328, 407] }, pow: [77, 76, 78, 79], res: [87, 86, 88, 89], inherent: ['Mind Read'], weapons: ['staff', 'light', 'mace'], armor: ['cloth', 'robe'], helm: ['hat', 'circlet'],   // Reveal comes to her at Air's Rock, not from birth
    look: { sheet: 'sheba',  skin: '#f8d8b0', hair: '#f0e080', hairStyle: 'bob', top: '#58a058', sleeve: '#58a058', pants: '#e8e0c8', boots: '#7a5030', cape: '#9060c8', belt: '#f0d040', eyes: '#7040b0', weapon: 'staff', weaponColor: '#f0a040', weaponSide: 'left', height: 'child' }, desc: 'A Jupiter Adept who fell from the sky.' },
  Piers: { name: 'Piers', el: 1, base: [30, 19, 11, 7, 6, 3], goals: { hp: [184, 337, 491, 644, 798], pp: [79, 129, 168, 208, 248], atk: [82, 155, 226, 298, 370], def: [39, 72, 106, 139, 173], agi: [78, 148, 218, 289, 359] }, pow: [78, 79, 77, 76], res: [88, 89, 87, 86], inherent: ['Douse'], weapons: ['long', 'light', 'mace', 'axe'], armor: ['armor', 'cloth'], helm: ['helm', 'hat'],
    look: { sheet: 'piers',  skin: '#f0d0b0', hair: '#48c0a8', hairStyle: 'ponytail', top: '#f0f0e8', sleeve: '#f0f0e8', pants: '#4050c0', boots: '#3040a0', belt: '#c03040', eyes: '#2050a0', weapon: 'mace', shirt: '#4050c0' }, desc: 'A Lemurian Mercury Adept.' },
  Kraden: { name: 'Kraden', el: 1, base: [26, 30, 9, 7, 6, 8], goals: { hp: [150, 280, 410, 540, 670], pp: [110, 178, 232, 286, 340], atk: [66, 126, 186, 245, 304], def: [40, 74, 108, 142, 176], agi: [66, 126, 185, 243, 302] }, pow: [78, 78, 78, 78], res: [88, 88, 88, 88], inherent: ['Mind Read', 'Retreat'], weapons: ['staff', 'mace'], armor: ['robe', 'cloth'], helm: ['hat', 'circlet'],
    look: { sheet: 'kraden',  skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'bald', top: '#3050a0', robe: '#3050a0', pants: '#3050a0', boots: '#402818', beard: '#d8d8d8', glasses: true, eyes: '#404040', weapon: 'staff', weaponColor: '#c0a060' }, desc: 'The scholar who spent his life reading Alchemy, and finally had to use it.' }
};
// Named NPC / villain appearances for the field and battle
const NPC_LOOKS = {
  Kraden: { skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'bald', top: '#3050a0', robe: '#3050a0', pants: '#3050a0', boots: '#402818', beard: '#d8d8d8', glasses: true, eyes: '#404040' },
  Dora: { skin: '#f8d8b0', hair: '#c8a060', hairStyle: 'bun', top: '#d0a060', dress: '#d0a060', pants: '#f0e8d8', boots: '#604020', belt: '#f0f0f0', eyes: '#603020' },
  Kyle: { skin: '#f0c090', hair: '#c89040', hairStyle: 'short', top: '#4060a0', pants: '#605040', boots: '#402818', belt: '#805030', eyes: '#402818' },
  Saturos: { skin: '#e0c0a0', hair: '#5090e0', hairStyle: 'spiky', top: '#802828', sleeve: '#802828', pants: '#302030', boots: '#201020', cape: '#401828', belt: '#e0c040', eyes: '#c02020', weapon: 'sword', weaponColor: '#f08040' },
  Menardi: { skin: '#f0d0b0', hair: '#f0e060', hairStyle: 'long', top: '#b02040', sleeve: '#b02040', pants: '#302030', boots: '#201020', dress: '#b02040', belt: '#e0c040', eyes: '#c02020', weapon: 'staff', weaponColor: '#c03030' },
  Alex: { skin: '#f0d0b0', hair: '#68b0e8', hairStyle: 'long', top: '#e8f0f8', sleeve: '#e8f0f8', pants: '#3060c0', boots: '#203070', cape: '#4080d0', belt: '#4080d0', eyes: '#3060c0', weapon: 'none' },
  Karst: { skin: '#f0d0b0', hair: '#e03050', hairStyle: 'long', top: '#c02040', sleeve: '#c02040', pants: '#302030', boots: '#201020', dress: '#c02040', belt: '#e0c040', eyes: '#c02020', weapon: 'staff', weaponColor: '#f04040' },
  Agatio: { skin: '#e0c0a0', hair: '#f08030', hairStyle: 'wild', top: '#903030', sleeve: '#903030', pants: '#302030', boots: '#201020', belt: '#e0c040', eyes: '#c02020', weapon: 'axe' },
  Babi: { skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'bald', top: '#7040a0', robe: '#7040a0', pants: '#7040a0', boots: '#402818', beard: '#d8d8d8', eyes: '#404040', hat: 'crown', hatColor: '#e8c040' },
  Hammet: { skin: '#f0c090', hair: '#604020', hairStyle: 'short', top: '#a06030', robe: '#a06030', pants: '#a06030', boots: '#402818', belt: '#e0c040', eyes: '#402818', hat: 'wide', hatColor: '#805030' },
  Layana: { skin: '#f8d8b0', hair: '#402818', hairStyle: 'long', top: '#c05080', dress: '#c05080', pants: '#f0e8d8', boots: '#604020', eyes: '#402818' },
  Feizhi: { skin: '#f8d8b0', hair: '#302020', hairStyle: 'long', top: '#e0a0c0', dress: '#e0a0c0', pants: '#f0e8d8', boots: '#604020', eyes: '#302020' },
  Hama: { skin: '#f8d8b0', hair: '#f0e070', hairStyle: 'long', top: '#8060c0', dress: '#8060c0', pants: '#e8e0f0', boots: '#603060', eyes: '#7040b0' },
  Tret: null,
  Iodem: { skin: '#f0c090', hair: '#c8a060', hairStyle: 'short', top: '#7040a0', pants: '#605040', boots: '#402818', belt: '#e0c040', eyes: '#402818', hat: 'helmet', hatColor: '#c0c8d8' },
  Faran: { skin: '#f0c090', hair: '#604020', hairStyle: 'short', top: '#c0a060', pants: '#a08050', boots: '#402818', eyes: '#402818' },
  Puelle: { skin: '#f0d0b0', hair: '#404040', hairStyle: 'short', top: '#805030', pants: '#402818', boots: '#402818', eyes: '#402818', hat: 'wide', hatColor: '#604020' },
  Briggs: { skin: '#e0b090', hair: '#302020', hairStyle: 'mohawk', top: '#a03028', pants: '#404060', boots: '#201020', belt: '#e0c040', eyes: '#202020', hat: 'bandana', hatColor: '#c02020', weapon: 'sword' },
  Chaucha: { skin: '#f8d8b0', hair: '#302020', hairStyle: 'long', top: '#d08040', dress: '#d08040', pants: '#f0e8d8', boots: '#604020', eyes: '#302020' },
  Akafubu: { skin: '#805030', hair: '#202020', hairStyle: 'short', top: '#e0c040', pants: '#c04040', boots: '#402818', eyes: '#202020', hat: 'mask', hatColor: '#f0f0f0' },
  Hydros: { skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'long', top: '#3068c0', robe: '#3068c0', pants: '#3068c0', boots: '#203070', beard: '#d8d8d8', eyes: '#404040', hat: 'crown', hatColor: '#e8c040' },
  Lunpa: { skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'bald', top: '#603030', robe: '#603030', pants: '#603030', boots: '#402818', beard: '#d8d8d8', eyes: '#404040' },
  Moapa: { skin: '#e0b090', hair: '#302020', hairStyle: 'short', top: '#a06030', pants: '#402818', boots: '#402818', belt: '#e0c040', eyes: '#202020', hat: 'helmet', hatColor: '#c0c8d8', weapon: 'sword' },
  Maha: { skin: '#a08060', hair: '#606060', hairStyle: 'wild', top: '#805030', pants: '#402818', boots: '#402818', eyes: '#e0c040' },
  Puelle2: null,
  WiseOne: null,
  Dodonpa: { skin: '#f0c090', hair: '#302020', hairStyle: 'slick', top: '#602060', pants: '#302030', boots: '#201020', belt: '#e0c040', eyes: '#202020' },
  Ouranos: { skin: '#f0d0b0', hair: '#d8d8d8', hairStyle: 'bald', top: '#8060c0', robe: '#8060c0', pants: '#8060c0', boots: '#402818', beard: '#d8d8d8', eyes: '#404040' },
  Uzume: { skin: '#f8d8b0', hair: '#302020', hairStyle: 'long', top: '#f0f0f8', dress: '#c03030', pants: '#f0e8d8', boots: '#604020', eyes: '#302020' },
  Susa: { skin: '#f0c090', hair: '#302020', hairStyle: 'ponytail', top: '#4060a0', pants: '#e8e0d0', boots: '#402818', belt: '#e0c040', eyes: '#302020', weapon: 'sword' },
  Kushinada: { skin: '#f8d8b0', hair: '#302020', hairStyle: 'long', top: '#f0a0c0', dress: '#f0a0c0', pants: '#f0e8d8', boots: '#604020', eyes: '#302020' },
  Obaba: { skin: '#e0b090', hair: '#d8d8d8', hairStyle: 'bun', top: '#805030', dress: '#805030', pants: '#f0e8d8', boots: '#402818', eyes: '#302020' },
  Eoleo: { skin: '#f0c090', hair: '#c04838', hairStyle: 'wild', top: '#c04040', pants: '#404060', boots: '#201020', eyes: '#202020', height: 'child' },
  Ivan_old: null,
  Sunshine: { skin: '#f0c090', hair: '#604020', hairStyle: 'bald', top: '#805030', pants: '#402818', boots: '#402818', beard: '#604020', eyes: '#402818', hat: 'bandana', hatColor: '#c04040' },
  Puelle3: null
};
// Generic NPC archetypes (seeded variation)
const NPC_TYPES = {
  villager_m: { hair: ['#604020', '#302020', '#c8a060', '#a06030'], top: ['#4060a0', '#a05030', '#3c8850', '#806040', '#a08050'], pants: ['#605040', '#404060'], hairStyle: ['short', 'slick', 'spiky'] },
  villager_f: { hair: ['#604020', '#302020', '#c8a060', '#c04838', '#f0e070'], top: ['#d05080', '#4090c0', '#c0a040', '#8060c0', '#e08040'], dress: true, hairStyle: ['long', 'bun', 'bob', 'braid'] },
  child_m: { hair: ['#604020', '#c8a060', '#e04020'], top: ['#4060a0', '#3c8850', '#e08040'], pants: ['#605040'], hairStyle: ['short', 'spiky'], height: 'child' },
  child_f: { hair: ['#c8a060', '#c04838', '#302020'], top: ['#f080a0', '#80c0e0', '#e0c040'], dress: true, hairStyle: ['bob', 'braid', 'long'], height: 'child' },
  elder_m: { hair: ['#d8d8d8', '#a8a8a8'], top: ['#806040', '#604060', '#405080'], pants: ['#403830'], hairStyle: ['bald', 'short'], beard: '#d8d8d8' },
  elder_f: { hair: ['#d8d8d8', '#a8a8a8'], top: ['#806080', '#608060', '#a08050'], dress: true, hairStyle: ['bun'] },
  guard: { hair: ['#604020', '#302020'], top: ['#4060a0', '#806030'], pants: ['#403830'], hairStyle: ['short'], hat: 'helmet', hatColor: '#b0b8c8' },
  merchant: { hair: ['#604020', '#302020'], top: ['#c08040', '#a04040'], pants: ['#403830'], hairStyle: ['short', 'bald'], hat: 'cap', hatColor: '#604020' },
  priest: { hair: ['#d8d8d8', '#c8a060'], top: ['#f0f0f8'], robe: '#f0f0f8', pants: ['#f0f0f8'], hairStyle: ['bald', 'short'] },
  sailor: { hair: ['#302020', '#c8a060'], top: ['#f0f0f8', '#3060c0'], pants: ['#3050a0'], hairStyle: ['short'], hat: 'bandana', hatColor: '#c02020' },
  scholar: { hair: ['#604020', '#d8d8d8'], top: ['#3050a0', '#604080'], robe: '#3050a0', pants: ['#3050a0'], hairStyle: ['short', 'bald'], glasses: true },
  tribal: { skin: '#805030', hair: ['#202020'], top: ['#e0c040', '#c04040', '#40a060'], pants: ['#c04040', '#e0c040'], hairStyle: ['short', 'braid'] },
  tribal_f: { skin: '#805030', hair: ['#202020'], top: ['#e0c040', '#c04040'], dress: true, hairStyle: ['braid', 'bun'] },
  proxian: { skin: '#e0c0a0', hair: ['#5090e0', '#f08030'], top: ['#802828', '#603030'], pants: ['#302030'], hairStyle: ['spiky', 'long'] },
  lemurian: { skin: '#f0d0b0', hair: ['#40a0d0', '#68b0e8'], top: ['#e8f0f8', '#3068c0'], pants: ['#3050a0'], hairStyle: ['long', 'ponytail', 'short'] },
  werewolf: { skin: '#a08060', hair: ['#606060', '#404040'], top: ['#805030'], pants: ['#402818'], hairStyle: ['wild'] },
  monk: { hair: ['#302020'], top: ['#e08040'], robe: '#e08040', pants: ['#e08040'], hairStyle: ['bald'] },
  pirate: { skin: '#e0b090', hair: ['#302020'], top: ['#a03028', '#404060'], pants: ['#404060'], hairStyle: ['short'], hat: 'bandana', hatColor: '#c02020' },
  noble: { hair: ['#c8a060', '#604020'], top: ['#7040a0', '#c0a040'], robe: '#7040a0', pants: ['#7040a0'], hairStyle: ['slick', 'short'] },
  noble_f: { hair: ['#c8a060', '#302020'], top: ['#c05080', '#8060c0'], dress: true, hairStyle: ['long', 'bun'], hat: 'tiara', hatColor: '#e8c040' }
};
function npcLook(type, seed) {
  if (NPC_LOOKS[type]) return NPC_LOOKS[type];
  const t = NPC_TYPES[type] || NPC_TYPES.villager_m; const r = seededRandom(hashStr(type + (seed || 0)));
  const pk = a => Array.isArray(a) ? a[Math.floor(r() * a.length)] : a;
  const look = { skin: t.skin || pick.call(null, ['#f0c090', '#f8d8b0', '#e0b090']), hair: pk(t.hair), hairStyle: pk(t.hairStyle), top: pk(t.top), pants: t.pants ? pk(t.pants) : '#605040', boots: '#402818', eyes: '#302020', height: t.height };
  look.skin = ['#f0c090', '#f8d8b0', '#e0b090'][Math.floor(r() * 3)]; if (t.skin) look.skin = t.skin;
  if (t.dress) { look.dress = look.top; look.pants = '#f0e8d8'; }
  if (t.robe) look.robe = look.top; if (t.beard) look.beard = t.beard; if (t.glasses) look.glasses = true; if (t.hat) { look.hat = t.hat; look.hatColor = t.hatColor; }
  // which of the type's three drawn sheets (assets/sprites/field/townsfolk/<type>_<1-3>.png) stands in for this person, when it exists
  look.sheet = type + '_' + (seed >= 1 && seed <= 3 ? seed : 1 + (hashStr(type + ':' + (seed || 0)) % 3));
  return look;
}
