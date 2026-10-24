// ---------- The monsters in battle, drawn in code ----------
// Each family is one drawing, the way the originals share one sprite across a family and change its colours: the
// rat that is Vermin in white and Rat in orange, the bee that is Drone, Fighter and Warrior. Small things fill a
// 40x40 canvas, the big ones 72x72, all facing down-left toward the party, with a second frame that breathes,
// flaps or sways. Names not listed here fall back to the older procedural monsters.
'use strict';
const Foes = {
  cache: {},
  SMALL: 40, BIG: 72,
  // ---- who is drawn how: family, palette (a body, b second colour, c cloth or accent, e eyes), and a size ----
  specs: {
    'Vermin': { fam: 'rat', pal: { a: '#e8e8f0', b: '#3868d8', c: '#f0f0a8', e: '#c03030' } },
    'Rat': { fam: 'rat', pal: { a: '#d87038', b: '#a86c30', c: '#f0d0a0', e: '#f0e040' } },
    'Mad Vermin': { fam: 'rat', pal: { a: '#c0c0d0', b: '#a03050', c: '#f0d0a0', e: '#ff4040' } },
    'Plated Rat': { fam: 'rat', pal: { a: '#8858c0', b: '#404880', c: '#c0c0d0', e: '#f0e040' }, plated: true },
    'Armored Rat': { fam: 'rat', pal: { a: '#c06838', b: '#606880', c: '#c0c0d0', e: '#f0e040' }, plated: true },
    'Squirrelfang': { fam: 'rat', pal: { a: '#a07040', b: '#e0b060', c: '#f0e0c0', e: '#f0e040' } },
    'Slime': { fam: 'slime', pal: { a: '#30d830', b: '#00a800', c: '#a0f0a0', e: '#e0a0f0' } },
    'Slime Beast': { fam: 'slime', pal: { a: '#e03030', b: '#a80000', c: '#f0a0a0', e: '#f0e0a0' } },
    'Ooze': { fam: 'slime', pal: { a: '#3838e0', b: '#0000a8', c: '#a0a0f0', e: '#f0c0f0' } },
    'Sticky Gel': { fam: 'slime', pal: { a: '#e0c030', b: '#a08000', c: '#f0f0a0', e: '#f08080' } },
    'Bat': { fam: 'bat', pal: { a: '#a8006c', b: '#6c0030', c: '#40c8c0', e: '#f0f040' } },
    'Rabid Bat': { fam: 'bat', pal: { a: '#2070c0', b: '#00306c', c: '#40d0a0', e: '#ff4040' } },
    'Giant Bat': { fam: 'bat', pal: { a: '#604880', b: '#302050', c: '#c0a0d0', e: '#ff4040' }, scale: 1.4 },
    'Spider': { fam: 'spider', pal: { a: '#f0d060', b: '#d84040', c: '#f0e0d0', e: '#202020' } },
    'Tarantula': { fam: 'spider', pal: { a: '#d8f060', b: '#40a830', c: '#f0e0d0', e: '#202020' } },
    'Recluse': { fam: 'spider', pal: { a: '#e070f0', b: '#5040a8', c: '#f0e0f0', e: '#202020' } },
    'Drone Bee': { fam: 'bee', pal: { a: '#40a870', b: '#d86030', c: '#f0f0f0', e: '#202020' } },
    'Fighter Bee': { fam: 'bee', pal: { a: '#a8407a', b: '#d84080', c: '#f0f0f0', e: '#202020' } },
    'Warrior Bee': { fam: 'bee', pal: { a: '#4060a8', b: '#a8a86c', c: '#f0f0f0', e: '#202020' } },
    'Wild Mushroom': { fam: 'mushroom', pal: { a: '#2888c8', b: '#a8a86c', c: '#f0f0d0', e: '#202020' } },
    'Death Cap': { fam: 'mushroom', pal: { a: '#8040a8', b: '#c0c090', c: '#f0e0f0', e: '#ff4040' } },
    'Mad Plant': { fam: 'mushroom', pal: { a: '#d04040', b: '#60a040', c: '#f0e0a0', e: '#202020' } },
    'Gnome': { fam: 'gnome', pal: { a: '#2040c8', b: '#d0a040', c: '#f060c0', e: '#202020' } },
    'Gnome Mage': { fam: 'gnome', pal: { a: '#30a830', b: '#d0a040', c: '#f060c0', e: '#202020' } },
    'Gnome Wizard': { fam: 'gnome', pal: { a: '#c03030', b: '#d0a040', c: '#f0d040', e: '#202020' } },
    'Mole Mage': { fam: 'gnome', pal: { a: '#6040a0', b: '#a08060', c: '#60e0f0', e: '#202020' } },
    'Cuttle': { fam: 'cuttle', pal: { a: '#70e8e0', b: '#30a8a8', c: '#8050b0', e: '#202020' } },
    'Calamar': { fam: 'cuttle', pal: { a: '#f070f0', b: '#a830a8', c: '#a86c30', e: '#202020' } },
    'Mole': { fam: 'mole', pal: { a: '#c88040', b: '#f0d090', c: '#6c3030', e: '#202020' } },
    'Mad Mole': { fam: 'mole', pal: { a: '#70b040', b: '#d0e090', c: '#306c30', e: '#ff4040' } },
    'Worm': { fam: 'worm', pal: { a: '#70b020', b: '#40a8c8', c: '#c0e060', e: '#202020' } },
    'Fire Worm': { fam: 'worm', pal: { a: '#e05020', b: '#f0a040', c: '#f0e060', e: '#202020' } },
    'Angle Worm': { fam: 'worm', pal: { a: '#c0a080', b: '#e0c0a0', c: '#f0e0c0', e: '#202020' } },
    'Death Head': { fam: 'flameskull', pal: { a: '#d8f000', b: '#a8d800', c: '#f0f0d0', e: '#d8306c' } },
    'Will Head': { fam: 'flameskull', pal: { a: '#20d8f0', b: '#00a8d8', c: '#e0f0f0', e: '#6cd830' } },
    'Willowisp': { fam: 'flameskull', pal: { a: '#e020f0', b: '#a800d8', c: '#f0d0f0', e: '#f0a040' } },
    'Dirge': { fam: 'dirge', pal: { a: '#a8a86c', b: '#484848', c: '#d8a86c', e: '#f0e040' } },
    'Foul Dirge': { fam: 'dirge', pal: { a: '#70a870', b: '#304830', c: '#d8d8a0', e: '#ff4040' } },
    'Vile Dirge': { fam: 'dirge', pal: { a: '#a070a8', b: '#403048', c: '#e0c0e0', e: '#ff4040' } },
    'Amaze': { fam: 'amaze', pal: { a: '#f0f0f0', b: '#d8a8f0', c: '#a86cf0', e: '#f0e040' } },
    'Spirit': { fam: 'amaze', pal: { a: '#f0f0f0', b: '#f0a8d8', c: '#f06ca8', e: '#f0e040' } },
    'Creeper': { fam: 'amaze', pal: { a: '#f0f0f0', b: '#a8d8f0', c: '#6ca8f0', e: '#f0e040' } },
    'Skeleton': { fam: 'skeleton', pal: { a: '#d8d8a8', b: '#a8a86c', c: '#d8a8a8', e: '#ff4040' } },
    'Bone Fighter': { fam: 'skeleton', pal: { a: '#a8d8d8', b: '#6ca8a8', c: '#a8a8d8', e: '#ff4040' } },
    'Skull Warrior': { fam: 'skeleton', pal: { a: '#d8a8d8', b: '#a86ca8', c: '#f0a0c0', e: '#ff4040' } },
    'Undead': { fam: 'skeleton', pal: { a: '#c0c0c0', b: '#808080', c: '#8080a0', e: '#40ff40' } },
    'Ghost': { fam: 'ghost', pal: { a: '#484858', b: '#a86ca8', c: '#c03050', e: '#f0e040' } },
    'Ghost Mage': { fam: 'ghost', pal: { a: '#484858', b: '#7060c0', c: '#3050b0', e: '#f0e040' } },
    'Ghost Army': { fam: 'ghost', pal: { a: '#383848', b: '#6c8ca8', c: '#a03030', e: '#f0e040' } },
    'Zombie': { fam: 'zombie', pal: { a: '#c05030', b: '#a83030', c: '#d0c090', e: '#f0e040' } },
    'Ghoul': { fam: 'zombie', pal: { a: '#60b060', b: '#306c30', c: '#8060b0', e: '#f0e040' } },
    'Fiendish Ghoul': { fam: 'zombie', pal: { a: '#8070b0', b: '#403070', c: '#c0a060', e: '#ff4040' } },
    'Cannibal Ghoul': { fam: 'zombie', pal: { a: '#a09050', b: '#605030', c: '#a03030', e: '#ff4040' } },
    'Troll': { fam: 'troll', pal: { a: '#b8b070', b: '#6c6c30', c: '#a04040', e: '#f0e040' } },
    'Cave Troll': { fam: 'troll', pal: { a: '#70b0b0', b: '#306c6c', c: '#306c30', e: '#f0e040' } },
    'Brutal Troll': { fam: 'troll', pal: { a: '#b07070', b: '#6c3030', c: '#404040', e: '#ff4040' } },
    'Lizard Man': { fam: 'lizardman', pal: { a: '#70b030', b: '#c0c0d0', c: '#a050c0', e: '#f0e040' } },
    'Lizard Fighter': { fam: 'lizardman', pal: { a: '#3070b0', b: '#c0c0d0', c: '#f0a040', e: '#f0e040' } },
    'Lizard King': { fam: 'lizardman', pal: { a: '#c04040', b: '#e0c060', c: '#4040a0', e: '#f0e040' }, scale: 1.2 },
    'Ape': { fam: 'ape', pal: { a: '#e0a830', b: '#a86c30', c: '#f0e0c0', e: '#f0e040' } },
    'Dirty Ape': { fam: 'ape', pal: { a: '#e040a8', b: '#a8306c', c: '#f0e0f0', e: '#f0e040' } },
    'Wild Ape': { fam: 'ape', pal: { a: '#7070b0', b: '#404060', c: '#e0c0c0', e: '#ff4040' } },
    'Wild Gorilla': { fam: 'ape', pal: { a: '#606070', b: '#303040', c: '#c0c0c0', e: '#f0e040' } },
    'Killer Ape': { fam: 'ape', pal: { a: '#c04848', b: '#702030', c: '#f0d0c0', e: '#f0e040' }, scale: 1.3 },
    'Chestbeater': { fam: 'ape', pal: { a: '#e0a830', b: '#a86c30', c: '#f0e0c0', e: '#ff4040' }, scale: 1.4 },
    'Wild Wolf': { fam: 'wolf', pal: { a: '#d0a050', b: '#8a5030', c: '#f0e8d0', e: '#40c0f0' } },
    'Dread Hound': { fam: 'wolf', pal: { a: '#9060b0', b: '#503070', c: '#e0c0f0', e: '#ff4040' } },
    'Dire Wolf': { fam: 'wolf', pal: { a: '#606880', b: '#303848', c: '#e0e0e8', e: '#f0e040' } },
    'Fenrir': { fam: 'wolf', pal: { a: '#a0c8e8', b: '#5080b0', c: '#f0f8ff', e: '#ff4040' }, scale: 1.3 },
    'Cerebus': { fam: 'wolf', pal: { a: '#a03030', b: '#601818', c: '#f0d0c0', e: '#f0e040' }, scale: 1.3 },
    'Wolfkin': { fam: 'wolf', pal: { a: '#807060', b: '#504038', c: '#e0d8c8', e: '#f0e040' } },
    'Wolfkin Cub': { fam: 'wolf', pal: { a: '#a09080', b: '#605040', c: '#f0e8d8', e: '#f0e040' }, scale: 0.8 },
    'Rat Soldier': { fam: 'ratsoldier', pal: { a: '#d87038', b: '#a86c00', c: '#4070c0', e: '#f0e040' } },
    'Rat Fighter': { fam: 'ratsoldier', pal: { a: '#8858c0', b: '#404880', c: '#c0c0d0', e: '#f0e040' } },
    'Rat Warrior': { fam: 'ratsoldier', pal: { a: '#c04040', b: '#602020', c: '#e0c060', e: '#f0e040' } },
    'Kobold': { fam: 'kobold', pal: { a: '#70b040', b: '#405020', c: '#a0a0b0', e: '#f0e040' } },
    'Goblin': { fam: 'kobold', pal: { a: '#60a860', b: '#305030', c: '#8060a0', e: '#f0e040' }, scale: 0.85 },
    'Hobgoblin': { fam: 'kobold', pal: { a: '#c08040', b: '#604020', c: '#a0a0b0', e: '#f0e040' } },
    'Mini-Goblin': { fam: 'kobold', pal: { a: '#80c060', b: '#405020', c: '#a06040', e: '#f0e040' }, scale: 0.7 },
    'Alec Goblin': { fam: 'kobold', pal: { a: '#a0a0c0', b: '#505070', c: '#c0a040', e: '#ff4040' } },
    'Harpy': { fam: 'harpy', pal: { a: '#b0c8f0', b: '#6070c0', c: '#f0e0d0', e: '#f0e040' } },
    'Siren': { fam: 'harpy', pal: { a: '#70c0b0', b: '#3080a0', c: '#f0e0d0', e: '#f0e040' } },
    'Virago': { fam: 'harpy', pal: { a: '#e0a0c0', b: '#a05080', c: '#f0e0d0', e: '#ff4040' } },
    'Harridan': { fam: 'harpy', pal: { a: '#c0b080', b: '#806040', c: '#f0e0d0', e: '#ff4040' } },
    'Mauler': { fam: 'bear', pal: { a: '#907050', b: '#604030', c: '#e0d0b0', e: '#f0e040' } },
    'Ravager': { fam: 'bear', pal: { a: '#70a060', b: '#406030', c: '#e0d0b0', e: '#ff4040' } },
    'Grizzly': { fam: 'bear', pal: { a: '#a07040', b: '#604020', c: '#f0e0c0', e: '#f0e040' }, scale: 1.15 },
    'Grisly': { fam: 'bear', pal: { a: '#a07040', b: '#604020', c: '#f0e0c0', e: '#f0e040' }, scale: 1.15 },
    'Mimic': { fam: 'mimic', pal: { a: '#c04040', b: '#a06030', c: '#e0c060', e: '#f0e040' } },
    'Living Statue': { fam: 'statue', pal: { a: '#60c0a0', b: '#3080a0', c: '#d0e040', e: '#ff4040' } },
    'Stone Soldier': { fam: 'statue', pal: { a: '#a0a0b0', b: '#606070', c: '#c0b060', e: '#f0e040' } },
    'Hydros Statue': { fam: 'statue', pal: { a: '#60a0d0', b: '#3060a0', c: '#e0e0f0', e: '#ff4040' }, scale: 1.5 },
    'Golem': { fam: 'golem', pal: { a: '#d0a850', b: '#906830', c: '#f0e0a0', e: '#40e0c0' } },
    'Grand Golem': { fam: 'golem', pal: { a: '#8090a0', b: '#505868', c: '#c0d0e0', e: '#ff4040' }, scale: 1.3 },
    'Earth Golem': { fam: 'golem', pal: { a: '#a08050', b: '#604830', c: '#d0c090', e: '#f0e040' }, scale: 1.2 },
    'Boulder Beast': { fam: 'golem', pal: { a: '#787070', b: '#484040', c: '#a0a0a0', e: '#f0e040' } },
    'Raging Rock': { fam: 'golem', pal: { a: '#c06040', b: '#803020', c: '#f0a060', e: '#f0e040' } },
    'Gargoyle': { fam: 'gargoyle', pal: { a: '#a0c0e0', b: '#5070b0', c: '#d04040', e: '#ff4040' } },
    'Clay Gargoyle': { fam: 'gargoyle', pal: { a: '#c09060', b: '#805030', c: '#40a0c0', e: '#f0e040' } },
    'Ice Gargoyle': { fam: 'gargoyle', pal: { a: '#c0e8f8', b: '#6090c0', c: '#4060d0', e: '#40c0ff' } },
    'Ant Lion': { fam: 'antlion', pal: { a: '#e0c890', b: '#a08050', c: '#f07070', e: '#202020' } },
    'Salamander': { fam: 'lizard', pal: { a: '#c04070', b: '#8060b0', c: '#60c0a0', e: '#f0e040' } },
    'Earth Lizard': { fam: 'lizard', pal: { a: '#a08040', b: '#605030', c: '#c0c060', e: '#f0e040' } },
    'Thunder Lizard': { fam: 'lizard', pal: { a: '#6080c0', b: '#404880', c: '#f0e060', e: '#f0e040' } },
    'Tornado Lizard': { fam: 'lizard', pal: { a: '#e0a040', b: '#c05030', c: '#f0e0a0', e: '#f0e040' }, frill: true },
    'Tempest Lizard': { fam: 'lizard', pal: { a: '#40a0c0', b: '#2060a0', c: '#f0f0a0', e: '#ff4040' }, frill: true, scale: 1.6 },
    'Storm Lizard': { fam: 'lizard', pal: { a: '#8080d0', b: '#4040a0', c: '#f0f0a0', e: '#ff4040' }, frill: true, scale: 1.6 },
    'Grub': { fam: 'grub', pal: { a: '#60b040', b: '#40a0a0', c: '#f0c040', e: '#202020' } },
    'Doodle Bug': { fam: 'grub', pal: { a: '#c0a040', b: '#806020', c: '#f0e080', e: '#202020' } },
    'Roach': { fam: 'grub', pal: { a: '#804030', b: '#502010', c: '#c0a080', e: '#202020' } },
    'Acid Maggot': { fam: 'grub', pal: { a: '#b0d040', b: '#70a020', c: '#f0f0a0', e: '#202020' } },
    'Orc': { fam: 'orc', pal: { a: '#f0a0b0', b: '#3040a0', c: '#60c060', e: '#f0e040' } },
    'Orc Captain': { fam: 'orc', pal: { a: '#c0d0a0', b: '#a03030', c: '#e0c040', e: '#f0e040' }, scale: 1.1 },
    'Orc Lord': { fam: 'orc', pal: { a: '#c0a0e0', b: '#404040', c: '#e0c040', e: '#ff4040' }, scale: 1.2 },
    'Mummy': { fam: 'mummy', pal: { a: '#e0e0d0', b: '#a0a090', c: '#60a040', e: '#40e040' } },
    'Foul Mummy': { fam: 'mummy', pal: { a: '#c0c0a0', b: '#807860', c: '#a04040', e: '#ff4040' } },
    'Wight': { fam: 'lich', pal: { a: '#7050b0', b: '#402070', c: '#c0a0e0', e: '#ff4040' } },
    'Grave Wight': { fam: 'lich', pal: { a: '#608060', b: '#304030', c: '#a0c0a0', e: '#f0e040' } },
    'Lich': { fam: 'lich', pal: { a: '#403060', b: '#c0a040', c: '#e0e0f0', e: '#ff4040' }, robe: true, scale: 1.1 },
    'Little Death': { fam: 'lich', pal: { a: '#202030', b: '#8060a0', c: '#e0e0f0', e: '#ff4040' }, robe: true },
    'Minos Warrior': { fam: 'minotaur', pal: { a: '#8080d0', b: '#e0e0f0', c: '#404040', e: '#ff4040' } },
    'Minotaurus': { fam: 'minotaur', pal: { a: '#a06040', b: '#e0d0c0', c: '#604020', e: '#f0e040' } },
    'Minos Knight': { fam: 'minotaur', pal: { a: '#c04040', b: '#e0e0f0', c: '#303030', e: '#f0e040' }, scale: 1.2 },
    'Chimera': { fam: 'chimera', pal: { a: '#e0b040', b: '#c04040', c: '#60c0c0', e: '#f0e040' } },
    'Chimera Mage': { fam: 'chimera', pal: { a: '#a080d0', b: '#6040a0', c: '#f0d040', e: '#f0e040' } },
    'Grand Chimera': { fam: 'chimera', pal: { a: '#d08040', b: '#803030', c: '#40a0e0', e: '#ff4040' }, scale: 1.3 },
    'Manticore': { fam: 'chimera', pal: { a: '#c08040', b: '#8040a0', c: '#e0c060', e: '#ff4040' }, scale: 1.4 },
    'Manticore King': { fam: 'chimera', pal: { a: '#d0a040', b: '#a03030', c: '#f0e080', e: '#ff4040' }, scale: 1.5 },
    'Wyvern': { fam: 'dragon', pal: { a: '#e0e0f0', b: '#a0a0c0', c: '#d0a040', e: '#ff4040' } },
    'Wyvern Chick': { fam: 'dragon', pal: { a: '#d0d0e0', b: '#9090b0', c: '#d0a040', e: '#f0e040' }, scale: 0.7 },
    'Cruel Dragon': { fam: 'dragon', pal: { a: '#a05050', b: '#602020', c: '#e0c060', e: '#f0e040' }, scale: 1.3 },
    'Sea Dragon': { fam: 'dragon', pal: { a: '#4080c0', b: '#204080', c: '#a0e0e0', e: '#f0e040' }, scale: 1.2 },
    'Ocean Dragon': { fam: 'dragon', pal: { a: '#40a0a0', b: '#206060', c: '#c0f0e0', e: '#f0e040' }, scale: 1.3 },
    'Sky Dragon': { fam: 'dragon', pal: { a: '#a0c0f0', b: '#6080c0', c: '#f0f0ff', e: '#f0e040' }, scale: 1.3 },
    'Turtle Dragon': { fam: 'dragon', pal: { a: '#60a060', b: '#306030', c: '#c0a060', e: '#f0e040' }, scale: 1.2 },
    'Pyrodra': { fam: 'dragon', pal: { a: '#e06030', b: '#902010', c: '#f0e040', e: '#f0e040' }, scale: 1.2 },
    'Fire Bird': { fam: 'bird', pal: { a: '#f0a030', b: '#d04020', c: '#f0e060', e: '#ff4040' } },
    'Phoenix': { fam: 'bird', pal: { a: '#f0c040', b: '#e06020', c: '#f0f0a0', e: '#ff4040' }, scale: 1.3 },
    'Roc': { fam: 'bird', pal: { a: '#a0a0a0', b: '#606060', c: '#e0e0e0', e: '#f0e040' }, scale: 1.2 },
    'Wonder Bird': { fam: 'bird', pal: { a: '#60c0e0', b: '#3070c0', c: '#f0f0f0', e: '#f0e040' } },
    'Seabird': { fam: 'bird', pal: { a: '#e0e0f0', b: '#8090a0', c: '#f0c040', e: '#202020' }, scale: 0.8 },
    'Seafowl': { fam: 'bird', pal: { a: '#c0d0e0', b: '#6070a0', c: '#f0a040', e: '#202020' }, scale: 0.8 },
    'Emu': { fam: 'runner', pal: { a: '#e0c0d0', b: '#8060a0', c: '#f0c040', e: '#202020' } },
    'Talon Runner': { fam: 'runner', pal: { a: '#a0d080', b: '#508040', c: '#f0c040', e: '#ff4040' } },
    'Punch Ant': { fam: 'ant', pal: { a: '#c04040', b: '#803030', c: '#f0e0c0', e: '#202020' } },
    'Flash Ant': { fam: 'ant', pal: { a: '#e0c040', b: '#a08020', c: '#f0f0d0', e: '#202020' } },
    'Numb Ant': { fam: 'ant', pal: { a: '#8060c0', b: '#503080', c: '#e0d0f0', e: '#202020' } },
    'Sand Scorpion': { fam: 'scorpion', pal: { a: '#d0b070', b: '#a08040', c: '#f0e0a0', e: '#202020' } },
    'Devil Scorpion': { fam: 'scorpion', pal: { a: '#8060c0', b: '#503090', c: '#f080c0', e: '#ff4040' }, scale: 1.2 },
    'King Scorpion': { fam: 'scorpion', pal: { a: '#c04040', b: '#802020', c: '#f0c060', e: '#f0e040' }, scale: 1.3 },
    'Nightmare': { fam: 'nightmare', pal: { a: '#e0b0c0', b: '#c03060', c: '#6040a0', e: '#f0e040' } },
    'Succubus': { fam: 'nightmare', pal: { a: '#e0c0d0', b: '#402040', c: '#a02060', e: '#ff4040' } },
    'Mad Demon': { fam: 'demon', pal: { a: '#5090e0', b: '#3050a0', c: '#60c060', e: '#f0e040' } },
    'Red Demon': { fam: 'demon', pal: { a: '#e04040', b: '#902020', c: '#f0c040', e: '#f0e040' } },
    'Lesser Demon': { fam: 'demon', pal: { a: '#a060c0', b: '#603080', c: '#e0e040', e: '#f0e040' }, scale: 0.85 },
    'Aka Manah': { fam: 'demon', pal: { a: '#404060', b: '#202030', c: '#e04040', e: '#ff4040' }, scale: 1.3 },
    'Faery': { fam: 'faery', pal: { a: '#f0e0a0', b: '#60c060', c: '#f0d040', e: '#202020' } },
    'Pixie': { fam: 'faery', pal: { a: '#f0e0f0', b: '#c060c0', c: '#60d0f0', e: '#202020' } },
    'Wood Walker': { fam: 'treant', pal: { a: '#a06030', b: '#603818', c: '#40a040', e: '#f0e040' } },
    'Elder Wood': { fam: 'treant', pal: { a: '#806040', b: '#403020', c: '#80c060', e: '#f0e040' }, scale: 1.2 },
    'Aqua Jelly': { fam: 'jelly', pal: { a: '#60c0f0', b: '#3080c0', c: '#f080c0', e: '#202020' } },
    "Man o' War": { fam: 'jelly', pal: { a: '#e0e080', b: '#a0c040', c: '#c060c0', e: '#202020' } },
    'Man o War': { fam: 'jelly', pal: { a: '#e0e080', b: '#a0c040', c: '#c060c0', e: '#202020' } },
    'Dino': { fam: 'dino', pal: { a: '#e0c040', b: '#a08020', c: '#f0f0a0', e: '#202020' } },
    'Dinox': { fam: 'dino', pal: { a: '#60a0c0', b: '#306080', c: '#c0e0f0', e: '#ff4040' }, scale: 1.1 },
    'Raptor': { fam: 'dino', pal: { a: '#60b060', b: '#306030', c: '#e0e080', e: '#f0e040' } },
    'Pteranodon': { fam: 'dino', pal: { a: '#c0a060', b: '#806030', c: '#e0e0c0', e: '#ff4040' }, wings: true },
    'Poison Toad': { fam: 'toad', pal: { a: '#e0a040', b: '#a06020', c: '#60c0d0', e: '#f0e040' } },
    'Devil Frog': { fam: 'toad', pal: { a: '#8060c0', b: '#503080', c: '#f0c040', e: '#ff4040' } },
    'Toadonpa': { fam: 'toad', pal: { a: '#a0a040', b: '#606020', c: '#e0e0a0', e: '#ff4040' }, scale: 1.6 },
    'Momonga': { fam: 'momonga', pal: { a: '#c0b090', b: '#806040', c: '#f0e0c0', e: '#ff4040' } },
    'Brigand': { fam: 'human', look: 'bandit' }, 'Thief': { fam: 'human', look: 'thief' }, 'Ruffian': { fam: 'human', look: 'ruffian' },
    'Assassin': { fam: 'human', look: 'assassin' }, 'Slayer': { fam: 'human', look: 'slayer' }, 'Sea Fighter': { fam: 'human', look: 'pirate' }, 'Wargold': { fam: 'human', look: 'wargold' },
    'Wild Gryphon': { fam: 'gryphon', pal: { a: '#e0c060', b: '#c04040', c: '#f0f0f0', e: '#f0e040' } },
    'Gryphon': { fam: 'gryphon', pal: { a: '#d0a040', b: '#803030', c: '#f0e0c0', e: '#f0e040' }, scale: 1.15 },
    'Wise Gryphon': { fam: 'gryphon', pal: { a: '#a0c0e0', b: '#4060a0', c: '#f0f0ff', e: '#ff4040' }, scale: 1.2 },
    'Great Seagull': { fam: 'bird', pal: { a: '#f0f0f8', b: '#8090a0', c: '#f0c040', e: '#202020' } },
    'Tret': { fam: 'tree', pal: { a: '#8a5a2a', b: '#503018', c: '#60b040', e: '#f0e040' }, scale: 1.5 },
    'Kraken': { fam: 'kraken', pal: { a: '#e060a0', b: '#a03070', c: '#f0c0e0', e: '#f0e040' }, scale: 1.6 },
    'Fusion Dragon': { fam: 'twindragon', pal: { a: '#c03050', b: '#e0c040', c: '#6080d0', e: '#f0e040' }, scale: 1.6 },
    'Doom Dragon': { fam: 'twindragon', pal: { a: '#604080', b: '#40a060', c: '#c0c0d0', e: '#ff4040' }, scale: 1.8, heads: 3 },
    'Magicore': { fam: 'magicore', pal: { a: '#60c040', b: '#306020', c: '#c0f0a0', e: '#f0e040' } },
    'Horned Ghost': { fam: 'ghost', pal: { a: '#404050', b: '#a06060', c: '#603040', e: '#ff4040' }, horns: true },
    'Soul Army': { fam: 'ghost', pal: { a: '#383848', b: '#6080a0', c: '#404060', e: '#40ffff' } },
    'Doomsayer': { fam: 'ghost', pal: { a: '#303040', b: '#503080', c: '#202030', e: '#ff4040' }, scale: 1.1 },
    'Aqua Hydra': { fam: 'hydra', pal: { a: '#40a0c0', b: '#2060a0', c: '#c0f0f0', e: '#f0e040' }, scale: 1.4 },
    'Hydra': { fam: 'hydra', pal: { a: '#c0a040', b: '#806020', c: '#f0e0a0', e: '#ff4040' }, scale: 1.2 },
    'Urchin Beast': { fam: 'urchin', pal: { a: '#e040a0', b: '#902060', c: '#f0e0f0', e: '#f0e040' } },
    'Sea Hedgehog': { fam: 'urchin', pal: { a: '#6080c0', b: '#304080', c: '#e0e0f0', e: '#f0e040' } },
    'Needle Egg': { fam: 'egg', pal: { a: '#f0d040', b: '#c09020', c: '#f0f0c0', e: '#202020' } },
    'Merman': { fam: 'merman', pal: { a: '#60c060', b: '#c0e0c0', c: '#a0d0f0', e: '#f0e040' } },
    'Gillman': { fam: 'merman', pal: { a: '#40a0a0', b: '#a0e0e0', c: '#e0c060', e: '#f0e040' } },
    'Gillman Lord': { fam: 'merman', pal: { a: '#4060c0', b: '#a0c0f0', c: '#f0d040', e: '#ff4040' }, scale: 1.2 },
    'Living Armor': { fam: 'armor', pal: { a: '#c0c0d0', b: '#802030', c: '#404050', e: '#ff4040' } },
    'Dullahan': { fam: 'armor', pal: { a: '#404060', b: '#8060c0', c: '#202030', e: '#ff4040' }, scale: 1.6, headless: true },
    'Sentinel': { fam: 'armor', pal: { a: '#60a080', b: '#306050', c: '#c0e0d0', e: '#f0e040' }, scale: 1.7 },
    'Valukar': { fam: 'armor', pal: { a: '#c0a040', b: '#804020', c: '#f0e0a0', e: '#ff4040' }, scale: 1.5 },
    'Puppet Warrior': { fam: 'armor', pal: { a: '#a09080', b: '#605040', c: '#302020', e: '#202020' } },
    'Knight': { fam: 'human', look: 'knight' }, 'Bandit': { fam: 'human', look: 'bandit' },
    'Serpent': { fam: 'serpent', pal: { a: '#40a060', b: '#206040', c: '#e0e080', e: '#ff4040' }, scale: 1.6 },
    'Chimera Worm': { fam: 'serpent', pal: { a: '#c08040', b: '#804020', c: '#e0c060', e: '#f0e040' }, scale: 1.2 },
    'Gressil': { fam: 'lizard', pal: { a: '#8060c0', b: '#503080', c: '#e0c0f0', e: '#ff4040' }, frill: true, scale: 1.3 },
    'Avimander': { fam: 'lizard', pal: { a: '#e06030', b: '#902010', c: '#f0e040', e: '#f0e040' }, scale: 1.6 },
    'Winged Lizard': { fam: 'dino', pal: { a: '#60a060', b: '#306030', c: '#e0e0a0', e: '#f0e040' }, wings: true },
    'Macetail': { fam: 'dino', pal: { a: '#60b040', b: '#306020', c: '#e040a0', e: '#f0e040' }, scale: 1.2 },
    'Blue Dragon': { fam: 'dragon', pal: { a: '#4070d0', b: '#204080', c: '#c0e0ff', e: '#f0e040' }, scale: 1.3 },
    'Flame Dragon (Small)': { fam: 'dragon', pal: { a: '#e05020', b: '#902010', c: '#f0e040', e: '#f0e040' }, scale: 1.2 },
    'Flame Dragon (Big)': { fam: 'dragon', pal: { a: '#e05020', b: '#902010', c: '#f0e040', e: '#f0e040' }, scale: 1.6 },
    'Fire Dragon': { fam: 'dragon', pal: { a: '#d04030', b: '#801010', c: '#f0c040', e: '#f0e040' }, scale: 1.3 },
    'Poseidon': { fam: 'poseidon', pal: { a: '#40a0c0', b: '#e0c040', c: '#f0d0b0', e: '#f0e040' }, scale: 1.7 },
    'Spiral Shell': { fam: 'shell', pal: { a: '#e0e0f0', b: '#6080c0', c: '#f0c040', e: '#f0e040' } },
    'Star Magician': { fam: 'orb', pal: { a: '#8040c0', b: '#f0e040', c: '#f0f0ff', e: '#ff4040' }, mage: true, scale: 1.4 },
    'Refresh Ball': { fam: 'orb', pal: { a: '#60d080', b: '#208040', c: '#e0ffe0', e: '#202020' } },
    'Guardian Ball': { fam: 'orb', pal: { a: '#6080e0', b: '#2040a0', c: '#e0e0ff', e: '#202020' } },
    'Thunder Ball': { fam: 'orb', pal: { a: '#e0e040', b: '#a0a020', c: '#ffffe0', e: '#202020' } },
    'Anger Ball': { fam: 'orb', pal: { a: '#e04040', b: '#a02020', c: '#ffe0e0', e: '#202020' } },
    'Bombander': { fam: 'orb', pal: { a: '#505060', b: '#303040', c: '#f04040', e: '#f0e040' }, bomb: true },
    'Druj': { fam: 'lich', pal: { a: '#a0a0b0', b: '#606080', c: '#e0e0f0', e: '#40ff40' } },
    'Unknown Venus Djinni': { fam: 'djinni', pal: { a: '#d0b040', b: '#907020', c: '#f0e0a0', e: '#202020' } },
    // the antagonists: the party's front-view renderer with their own looks, a size up
    'Saturos': { fam: 'human', look: 'Saturos', scale: 1.2 }, 'Saturos II': { fam: 'human', look: 'Saturos', scale: 1.2 }, 'Mystery Man': { fam: 'human', look: 'Saturos', scale: 1.2 },
    'Menardi': { fam: 'human', look: 'Menardi', scale: 1.2 }, 'Mystery Woman': { fam: 'human', look: 'Menardi', scale: 1.2 },
    'Karst': { fam: 'human', look: 'Karst', scale: 1.2 }, 'Agatio': { fam: 'human', look: 'Agatio', scale: 1.25 },
    'Briggs': { fam: 'human', look: 'Briggs', scale: 1.1 }, 'Moapa': { fam: 'human', look: 'Moapa', scale: 1.15 }, 'Deadbeard': { fam: 'human', look: 'Deadbeard', scale: 1.25 },
    'Azart': { fam: 'human', look: 'Azart', scale: 1.15 }, 'Satrage': { fam: 'human', look: 'Satrage', scale: 1.15 }, 'Navampa': { fam: 'human', look: 'Navampa', scale: 1.15 },
    'Venus Djinni': { fam: 'djinni', pal: { a: '#d0b040', b: '#907020', c: '#f0e0a0', e: '#202020' } },
    'Mercury Djinni': { fam: 'djinni', pal: { a: '#60a0e0', b: '#3060a0', c: '#c0e0ff', e: '#202020' } },
    'Mars Djinni': { fam: 'djinni', pal: { a: '#e05030', b: '#a02010', c: '#f0c060', e: '#202020' } },
    'Jupiter Djinni': { fam: 'djinni', pal: { a: '#b070e0', b: '#7040a0', c: '#e0c0ff', e: '#202020' } },
  },
  spec(name) {
    const n = name.replace(/ II$/, '').replace(/ #\d+$/, '');
    const s = this.specs[n] || (/^(Venus|Mercury|Mars|Jupiter) Djinni/.test(n) ? this.specs[n.split(' ').slice(0, 2).join(' ')] : null);
    if (s) return s;
    let best = null; for (const k in this.specs) if (n.startsWith(k + ' ') && (!best || k.length > best.length)) best = k;
    return best ? this.specs[best] : null;
  },
  sprite(name, frame) {
    const s = this.spec(name); if (!s) return null;
    frame = frame ? 1 : 0; const key = name + ':' + frame;
    if (this.cache[key]) return this.cache[key];
    const fam = this.fam[s.fam]; const big = fam.big; const S = big ? this.BIG : this.SMALL;
    const c = Gfx.canvas(S, S), g = Gfx.ctx(c);
    const P = s.pal || { a: '#808080', b: '#505050', c: '#c0c0c0', e: '#202020' }; const K = this.kit(g, P);
    fam.draw(K, P, frame, s, name);
    let out = fam.noOutline ? c : Gfx.outline(c, '#1a1428');
    if (s.scale && s.scale !== 1) { const w = Math.round(out.width * s.scale), h = Math.round(out.height * s.scale); const c2 = Gfx.canvas(w, h), g2 = Gfx.ctx(c2); g2.imageSmoothingEnabled = false; g2.drawImage(out, 0, 0, w, h); out = c2; }
    return this.cache[key] = out;
  },
  // drawing helpers bound to one canvas, with the palette's shades worked out
  kit(g, P) {
    const K = {
      g,
      R: (x, y, w, h, col) => { if (col && w > 0 && h > 0) Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col); },
      P: (x, y, col) => { if (col) Gfx.px(g, Math.round(x), Math.round(y), col); },
      E: (cx, cy, rx, ry, col) => { if (col) Gfx.ellipse(g, Math.round(cx), Math.round(cy), Math.round(rx), Math.round(ry), col); },
      C: (cx, cy, r, col) => { if (col) Gfx.circle(g, Math.round(cx), Math.round(cy), Math.round(r), col); },
      L: (x0, y0, x1, y1, col) => { if (col) Gfx.line(g, x0, y0, x1, y1, col); },
      T: (x0, y0, x1, y1, x2, y2, col) => { if (col) Gfx.tri(g, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), col); },
      // a thick line, for limbs and tails
      W: (x0, y0, x1, y1, w, col) => { for (let i = 0; i < w; i++) { Gfx.line(g, x0 + (i - (w - 1) / 2), y0, x1 + (i - (w - 1) / 2), y1, col); } },
      shadow: (cx, cy, rx) => Gfx.ellipse(g, Math.round(cx), Math.round(cy), rx, Math.max(2, Math.round(rx / 4)), 'rgba(0,0,0,0.3)'),
      // two eyes: whites or none, a coloured iris, one highlight
      eyes: (x, y, sep, col, size, white) => { for (const dx of [-sep, sep]) { if (white) K.R(x + dx - 1, y - 1, size + 2, size + 1, white); K.R(x + dx, y, size, size, col); K.P(x + dx, y, '#ffffff'); } },
      a: P.a, aD: shade(P.a, 0.7), aL: tint(P.a, 0.25), b: P.b, bD: shade(P.b, 0.7), bL: tint(P.b, 0.25), c: P.c, cD: shade(P.c, 0.7), cL: tint(P.c, 0.25), e: P.e,
    };
    return K;
  },
  fam: {
    // ---- a rodent on all fours, facing down-left: long tail, big ears, a pointed snout with teeth ----
    rat: { draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 35, 13);
      W(31, 26 - bob, 38, 16, 2, K.a); W(37, 17, 39, 13, 1, K.aD);                                      // the tail, curling up behind
      E(21, 26 - bob, 11, 7, K.a); E(19, 24 - bob, 8, 4, K.aL);                                          // the body
      if (s.plated) { E(21, 23 - bob, 10, 5, K.b); R(12, 21 - bob, 18, 1, K.bL); R(13, 25 - bob, 16, 1, K.bD); for (let i = 0; i < 4; i++) X(14 + i * 4, 23 - bob, K.bL); }   // armour plates down the back
      R(12, 30 - bob, 3, 5 + bob, K.aD); R(17, 31 - bob, 3, 4 + bob, K.aD); R(24, 30 - bob, 3, 5 + bob, K.aD); R(28, 31 - bob, 3, 4 + bob, K.aD);   // legs
      for (const x of [12, 17, 24, 28]) { X(x, 35, K.c); X(x + 2, 35, K.c); }                              // claws
      E(11, 22 - bob, 7, 5, K.a); E(6, 24 - bob, 5, 3, K.a); X(2, 24 - bob, '#e070a0');                  // the head and snout, the pink nose
      T(9, 18 - bob, 6, 11 - bob, 12, 16 - bob, K.a); T(13, 17 - bob, 12, 10 - bob, 17, 16 - bob, K.a); X(8, 14 - bob, K.b); X(14, 13 - bob, K.b);   // the ears, their insides
      R(10, 20 - bob, 4, 1, K.b); R(9, 23 - bob, 1, 1, K.b);                                              // a brow, a cheek stripe
      eyes(9, 21 - bob, 0, K.e, 1);
      R(4, 26 - bob, 1, 2, '#ffffff'); R(7, 26 - bob, 1, 2, '#ffffff');                                   // two teeth
      L(3, 22 - bob, 0, 20 - bob, K.c); L(3, 25 - bob, 0, 26 - bob, K.c);                                 // whiskers
      T(18, 19 - bob, 22, 13 - bob, 26, 19 - bob, K.b); T(22, 19 - bob, 25, 14 - bob, 28, 20 - bob, K.b); // a crest of fur down the neck
    } },
    // ---- a tall drop of jelly with a pointed tip, two eyes and a shine ----
    slime: { draw(K, P, f) {
      const { R, P: X, E, T, eyes } = K; const sq = f;   // squashes a little on the second frame
      K.shadow(20, 36, 10);
      E(20, 27 + sq, 10 + sq, 8 - sq, K.a); R(15, 12 + sq * 2, 10, 15, K.a); T(15, 13 + sq * 2, 20, 4 + sq * 2, 25, 13 + sq * 2, K.a); X(20, 3 + sq * 2, K.c);   // the body: a rounded base, a column, a tip
      E(20, 30 + sq, 8, 4, K.aD); R(16, 24 + sq, 8, 4, K.aD); E(17, 16 + sq * 2, 3, 5, K.c); X(17, 14 + sq * 2, '#ffffff');                                       // the shading, the shine
      R(15, 18 + sq * 2, 10, 4, K.aD); eyes(20, 19 + sq * 2, 3, K.e, 2, K.c); X(17, 22 + sq * 2, K.aD); X(23, 22 + sq * 2, K.aD);                                   // a dark band the eyes sit in
      T(21, 6 + sq * 2, 25, 4 + sq * 2, 24, 9 + sq * 2, K.c);                                                                                                        // a bud on the tip
    } },
    // ---- a bat hanging in the air with wings spread wide ----
    bat: { draw(K, P, f) {
      const { R, P: X, E, T, L, eyes } = K; const up = f ? 3 : 0;   // the wings beat
      K.shadow(20, 36, 8);
      const wy = 18 - up;
      T(17, 20, 3, wy - 6, 4, wy + 6, K.a); T(17, 20, 4, wy + 6, 10, wy + 10, K.a); T(23, 20, 37, wy - 6, 36, wy + 6, K.a); T(23, 20, 36, wy + 6, 30, wy + 10, K.a);   // the wing membranes
      L(17, 20, 3, wy - 6, K.aD); L(17, 20, 6, wy + 4, K.aD); L(23, 20, 37, wy - 6, K.aD); L(23, 20, 34, wy + 4, K.aD);                                                // the wing bones
      L(4, wy - 6, 6, wy - 9, K.b); L(36, wy - 6, 34, wy - 9, K.b);                                                                                                    // claws at the wing tips
      E(20, 20, 4, 6, K.b); E(20, 18, 3, 3, K.bL);                                                                                                                     // the body
      E(20, 12, 5, 4, K.a); T(16, 10, 14, 4, 19, 8, K.a); T(24, 10, 26, 4, 21, 8, K.a);                                                                               // head and ears
      eyes(20, 12, 2, K.e, 1); R(18, 15, 1, 2, '#ffffff'); R(21, 15, 1, 2, '#ffffff');                                                                                  // eyes and fangs
      R(19, 26, 2, 4, K.c); X(18, 29, K.c); X(21, 29, K.c);                                                                                                            // the dangling legs
    } },
    // ---- a spider seen from the front: a great round abdomen behind, a skull-marked face, bent legs ----
    spider: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 15);
      E(23, 21 - bob, 12, 9, K.a); E(21, 18 - bob, 8, 5, K.aL); E(23, 26 - bob, 10, 4, K.aD);            // the abdomen
      for (const [x0, x1, y1] of [[10, 2, 34], [11, 4, 36], [30, 38, 34], [29, 36, 36]]) { W(x0, 28 - bob, (x0 + x1) / 2, 20 - bob * 2, 2, K.b); W((x0 + x1) / 2, 20 - bob * 2, x1, y1, 2, K.b); X(x1, y1, K.bD); }   // the legs, knees high
      W(13, 30 - bob, 8, 36, 2, K.b); W(27, 30 - bob, 32, 36, 2, K.b);                                                                                             // the front pair
      E(15, 29 - bob, 8, 6, K.b); E(15, 27 - bob, 6, 3, K.bL);                                                                                                     // the head
      E(15, 29 - bob, 5, 4, K.c); R(11, 30 - bob, 8, 1, K.a); X(12, 32 - bob, K.c); X(14, 32 - bob, K.c); X(16, 32 - bob, K.c); X(18, 32 - bob, K.c);            // the skull face, its teeth
      eyes(15, 28 - bob, 2, K.e, 1);
      R(10, 33 - bob, 2, 3, K.bD); R(18, 33 - bob, 2, 3, K.bD);                                                                                                    // fangs
    } },
    // ---- a wasp hovering, wings out flat, striped body and a stinger ----
    bee: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f ? -1 : 0;
      K.shadow(20, 36, 7);
      const wa = f ? 0.55 : 0.4;   // the wings, blurred by the beat
      for (const sx of [-1, 1]) { const col = f ? 'rgba(240,240,255,0.55)' : 'rgba(240,240,255,0.75)'; K.g.fillStyle = col; K.g.beginPath(); K.g.ellipse(20 + sx * 9, 12 + bob, 9, 3.5, sx * wa, 0, Math.PI * 2); K.g.fill(); K.g.fillStyle = '#ffffff'; K.g.fillRect(20 + sx * 12, 10 + bob, 1, 1); }
      E(22, 22 + bob, 6, 8, K.a); R(17, 20 + bob, 10, 2, K.b); R(17, 24 + bob, 10, 2, K.b); R(18, 28 + bob, 8, 1, K.b);   // the striped abdomen
      T(19, 29 + bob, 25, 29 + bob, 22, 36 + bob, K.b); X(22, 36 + bob, K.c);                                               // the stinger
      E(17, 15 + bob, 5, 4, K.a); E(16, 14 + bob, 3, 2, K.aL);                                                              // the thorax
      E(12, 12 + bob, 5, 4, K.c); eyes(12, 12 + bob, 2, K.e, 1); L(10, 9 + bob, 7, 5 + bob, K.b); L(13, 9 + bob, 13, 4 + bob, K.b);   // head with antennae
      for (let i = 0; i < 3; i++) { L(15 + i * 3, 19 + bob, 12 + i * 4, 25 + bob, K.b); L(12 + i * 4, 25 + bob, 13 + i * 4, 28 + bob, K.b); }   // the legs tucked under
    } },
    // ---- a mushroom on the march: a broad cap, a stalk with a face and two mitten hands ----
    mushroom: { draw(K, P, f) {
      const { R, P: X, E, T, L, eyes } = K; const bob = f;
      K.shadow(20, 36, 10);
      R(16, 18 - bob, 8, 12 + bob, K.b); R(16, 18 - bob, 2, 12 + bob, K.bD); R(21, 18 - bob, 2, 12, K.bL);   // the stalk
      R(14, 28, 4, 6, K.bD); R(22, 27 + bob, 4, 7 - bob, K.bD); R(13, 33, 5, 2, K.bD); R(22, 33, 5, 2, K.bD);    // legs and feet
      E(11, 24 - bob, 4, 3, K.a); E(29, 23 + bob, 4, 3, K.a); X(10, 23 - bob, K.aL); X(28, 22 + bob, K.aL);       // the mitten hands, cap-coloured
      E(20, 13 - bob, 13, 7, K.a); E(20, 10 - bob, 11, 5, K.a); E(18, 8 - bob, 6, 3, K.aL); R(8, 15 - bob, 24, 2, K.aD);   // the cap
      R(17, 20 - bob, 6, 5, '#e8e0c8'); eyes(20, 21 - bob, 2, K.e, 1, '#ffffff'); R(18, 24 - bob, 4, 1, K.e);     // the face on the stalk
      X(13, 11 - bob, K.aL); X(26, 12 - bob, K.aL); X(23, 9 - bob, '#ffffff');                                  // spots on the cap
    } },
    // ---- a little robed wizard with a peaked hat and a staff topped by a jewel ----
    gnome: { draw(K, P, f) {
      const { R, P: X, E, T, L, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      T(11, 34, 29, 34, 20, 14 - bob, K.a); R(11, 30, 18, 4, K.aD); R(13, 22 - bob, 3, 8, K.aD); R(19, 20 - bob, 2, 12 + bob, K.aL);   // the robe
      R(24, 22 - bob, 4, 5, K.a); R(25, 27 - bob, 3, 3, '#f0c090');                                                   // the arm holding the staff
      L(30, 8 - bob, 27, 30 - bob, K.b); L(31, 8 - bob, 28, 30 - bob, K.bD); K.C(30, 6 - bob, 3, K.c); X(29, 5 - bob, '#ffffff');   // the staff and its jewel
      R(13, 24 - bob, 4, 4, K.a); R(12, 28 - bob, 3, 2, '#f0c090');                                                   // the other arm
      E(19, 17 - bob, 5, 4, '#f0c090'); R(15, 19 - bob, 8, 3, K.b); eyes(19, 16 - bob, 2, K.e, 1);                   // face and beard
      T(11, 15 - bob, 29, 15 - bob, 24, 0 - bob, K.a); R(11, 14 - bob, 18, 2, K.aD); T(20, 13 - bob, 26, 1 - bob, 24, 12 - bob, K.aL);   // the peaked hat, drooping right
      R(12, 33, 6, 2, K.b); R(22, 33, 6, 2, K.b);                                                                     // the shoes
    } },
    // ---- a squid upright in the water: a round soft head, big eyes, tentacles hanging below ----
    cuttle: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      for (let i = 0; i < 6; i++) { const x = 13 + i * 3; const sway = (i + f) % 2 ? 1 : -1; W(x, 24, x + sway, 30, 2, K.c); W(x + sway, 30, x + sway * 2, 35 - (i % 2), 1, K.cD); }   // the tentacles
      E(20, 16 - bob, 9, 10, K.a); E(18, 12 - bob, 6, 5, K.aL); E(20, 23 - bob, 8, 3, K.aD);                     // the mantle
      T(12, 12 - bob, 9, 4 - bob, 15, 8 - bob, K.a); T(28, 12 - bob, 31, 4 - bob, 25, 8 - bob, K.a);            // the fins
      eyes(20, 17 - bob, 4, K.e, 2, '#ffffff'); R(18, 21 - bob, 4, 1, K.aD);                                    // the eyes and a small mouth
      X(14, 14 - bob, K.b); X(26, 15 - bob, K.b); X(20, 9 - bob, K.b);                                          // spots
    } },
    // ---- a mole on its hind legs, long snout up, big digging claws ----
    mole: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 10);
      W(26, 30, 34, 26 - bob, 2, K.a); W(34, 26 - bob, 37, 20 - bob, 1, K.aD);                                    // the tail
      E(20, 24 - bob, 8, 9, K.a); E(20, 25 - bob, 5, 6, K.b);                                                    // body with a pale belly
      R(14, 30, 4, 5, K.aD); R(22, 30, 4, 5, K.aD); R(13, 34, 5, 2, K.c); R(22, 34, 5, 2, K.c);                 // legs and feet
      W(12, 22 - bob, 7, 27 - bob, 2, K.a); W(28, 22 - bob, 31, 27 - bob, 2, K.a);                               // the arms
      for (const [x, y] of [[5, 27], [7, 29], [30, 28], [32, 27]]) { L(x, y - bob, x - 1, y + 3 - bob, K.c); }   // the claws
      E(17, 13 - bob, 6, 5, K.a); T(12, 12 - bob, 5, 9 - bob, 13, 15 - bob, K.a); X(5, 9 - bob, '#e070a0');       // the head and long snout, pink nose
      eyes(18, 12 - bob, 2, K.e, 1); R(19, 8 - bob, 3, 2, K.b);                                                    // small eyes, a tuft
    } },
    // ---- a worm reared up in coils, a bright head on top ----
    worm: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 12);
      E(20, 31, 11, 5, K.b); E(20, 30, 8, 3, K.bL); E(22, 25 - bob, 9, 4, K.b); E(22, 24 - bob, 6, 2, K.bL); E(19, 19 - bob, 7, 4, K.b); E(19, 18 - bob, 5, 2, K.bL);   // the coils
      for (let i = 0; i < 5; i++) { X(12 + i * 4, 32, K.bD); X(15 + i * 4, 26 - bob, K.bD); }                    // segment lines
      E(17, 12 - bob, 6, 5, K.a); E(16, 10 - bob, 4, 2, K.aL); T(11, 12 - bob, 6, 14 - bob, 12, 15 - bob, K.a);  // the head, its snout
      eyes(18, 11 - bob, 2, K.e, 1, K.c); R(13, 14 - bob, 4, 1, K.c);                                            // eyes, mouth
      L(20, 8 - bob, 24, 3 - bob, K.c); L(16, 8 - bob, 14, 3 - bob, K.c);                                        // feelers
    } },
    // ---- a skull wreathed in fire ----
    flameskull: { draw(K, P, f) {
      const { R, P: X, E, T, L, eyes } = K; const fl = f;
      K.shadow(20, 36, 7);
      // the flames, licking higher on the second frame
      for (const [x, h] of [[12, 10], [16, 16], [20, 20], [24, 15], [28, 9]]) { const hh = h + (f ? ((x / 4) % 2 ? 3 : -2) : 0); T(x - 3, 24, x + 3, 24, x, 24 - hh, K.a); T(x - 1, 24, x + 1, 24, x, 24 - hh + 4, K.b); }
      E(20, 24, 9, 6, K.a); E(20, 25, 7, 4, K.b);
      E(20, 21, 6, 6, K.c); R(15, 24, 10, 4, K.c); R(16, 26, 8, 3, shade(K.c, 0.8));                                     // the skull
      R(16, 20, 3, 3, K.e); R(21, 20, 3, 3, K.e); X(17, 20, '#000000'); X(22, 20, '#000000'); R(19, 24, 2, 1, '#000000');   // eye sockets glowing, the nose hole
      for (let i = 0; i < 4; i++) X(16 + i * 2, 28, '#000000');                                                          // teeth
    } },
    // ---- a bird of prey, a hooked beak and ragged wings ----
    dirge: { draw(K, P, f) {
      const { R, P: X, E, T, L, eyes } = K; const up = f ? 2 : 0;
      K.shadow(20, 36, 8);
      T(18, 20, 3, 12 - up, 8, 24, K.a); T(22, 20, 37, 12 - up, 32, 24, K.a); L(18, 20, 4, 13 - up, K.aD); L(22, 20, 36, 13 - up, K.aD);   // the wings
      E(20, 22, 6, 7, K.b); E(19, 20, 4, 4, K.a);                                                                                          // the body, breast
      E(19, 13, 4, 4, K.a); T(14, 13, 9, 15, 15, 16, K.c); eyes(20, 12, 1, K.e, 1);                                                        // head and hooked beak
      R(17, 28, 2, 4, K.c); R(21, 28, 2, 4, K.c); L(16, 32, 18, 32, K.cD); L(20, 32, 23, 32, K.cD);                                        // legs and talons
      T(18, 28, 22, 28, 20, 34, K.aD);                                                                                                       // tail feathers
    } },
    // ---- a pale cat-like spirit standing on two legs, long tail, fading feet ----
    amaze: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      W(46, 46 - bob, 60, 40 - bob, 3, K.a); W(60, 40 - bob, 64, 30 - bob, 2, K.b);                                    // the tail
      E(36, 44 - bob, 11, 14, K.a); E(34, 40 - bob, 7, 8, '#ffffff');                                                  // the body
      R(28, 54 - bob, 6, 8 + bob, K.a); R(38, 54 - bob, 6, 8 + bob, K.a); E(31, 63, 5, 2, K.b); E(41, 63, 5, 2, K.b);   // legs fading at the feet
      W(26, 40 - bob, 18, 48 - bob, 3, K.a); W(46, 40 - bob, 54, 46 - bob, 3, K.a); E(17, 49 - bob, 3, 2, K.b); E(55, 47 - bob, 3, 2, K.b);   // the arms
      E(36, 26 - bob, 9, 8, K.a); E(34, 24 - bob, 6, 4, '#ffffff'); T(29, 22 - bob, 27, 12 - bob, 33, 18 - bob, K.a); T(43, 22 - bob, 45, 12 - bob, 39, 18 - bob, K.a);   // head and ears
      X(29, 15 - bob, K.b); X(43, 15 - bob, K.b);
      eyes(36, 27 - bob, 4, K.e, 2); R(35, 31 - bob, 2, 1, K.c);                                                         // the eyes, a small mouth
      R(32, 34 - bob, 8, 2, K.c);                                                                                        // a collar
    } },
    // ---- a skeleton warrior in tattered cloth, sword raised ----
    skeleton: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      R(30, 46, 5, 16, K.a); R(41, 46, 5, 16, K.a); R(28, 60, 8, 4, K.c); R(40, 60, 8, 4, K.c);                                     // leg bones, boots of cloth
      T(28, 40 - bob, 48, 40 - bob, 46, 52 - bob, K.c); T(28, 40 - bob, 46, 52 - bob, 30, 52 - bob, K.c); R(30, 50 - bob, 16, 2, K.cD);   // a ragged kilt
      R(29, 24 - bob, 18, 16, K.a); for (let i = 0; i < 4; i++) { R(30, 26 + i * 3 - bob, 16, 1, K.b); } R(37, 24 - bob, 2, 16, K.b);   // the ribcage
      R(26, 24 - bob, 4, 4, K.a); R(46, 24 - bob, 4, 4, K.a);                                                                         // shoulders
      W(26, 27 - bob, 20, 42 - bob, 3, K.a); R(18, 41 - bob, 5, 4, K.a);                                                              // the left arm hanging
      W(48, 27 - bob, 54, 18 - bob, 3, K.a); R(52, 15 - bob, 5, 4, K.a);                                                              // the right arm raised with the sword
      L(56, 16 - bob, 66, 2 - bob, '#e0e0f0'); L(57, 16 - bob, 67, 2 - bob, '#a0a0c0'); L(52, 12 - bob, 60, 20 - bob, '#d0a040');   // the blade and its guard
      E(37, 14 - bob, 8, 8, K.a); R(31, 18 - bob, 12, 6, K.a); R(32, 23 - bob, 10, 3, shade(K.a, 0.8)); for (let i = 0; i < 5; i++) X(32 + i * 2, 25 - bob, '#000000');   // the skull
      R(32, 12 - bob, 4, 4, '#000000'); R(39, 12 - bob, 4, 4, '#000000'); X(33, 13 - bob, K.e); X(40, 13 - bob, K.e); R(36, 17 - bob, 2, 2, '#000000');   // sockets, glowing, the nose
      R(30, 8 - bob, 14, 2, K.c); T(30, 8 - bob, 22, 4 - bob, 30, 12 - bob, K.c);                                                  // a rag tied round the skull
    } },
    // ---- a hooded specter: a skull in a deep hood, a cloak, one clawed hand reaching ----
    ghost: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 13);
      T(24, 30 - bob, 48, 30 - bob, 52, 60 - bob, K.c); T(24, 30 - bob, 52, 60 - bob, 20, 60 - bob, K.c); R(20, 58 - bob, 32, 2, K.cD);   // the cloak, wide at the hem
      for (let i = 0; i < 8; i++) X(21 + i * 4, 61 - bob, K.c);                                                                            // its ragged edge
      R(28, 46, 6, 14, K.a); R(38, 46, 6, 14, K.a); R(27, 58, 8, 4, K.aD); R(37, 58, 8, 4, K.aD);                                          // grey legs and boots beneath
      R(28, 28 - bob, 16, 20, K.a); R(28, 28 - bob, 16, 3, K.aL); R(30, 40 - bob, 12, 2, K.b);                                              // the tunic, a belt
      W(26, 32 - bob, 16, 44 - bob, 4, K.b); L(13, 44 - bob, 16, 48 - bob, K.aL); L(15, 44 - bob, 16, 49 - bob, K.aL); L(17, 45 - bob, 18, 49 - bob, K.aL);   // the reaching arm, its claws
      W(46, 32 - bob, 54, 40 - bob, 4, K.b); R(52, 38 - bob, 6, 8, '#d0a040'); R(53, 40 - bob, 4, 4, '#f0e080');                              // the other arm holding a lantern
      T(24, 26 - bob, 48, 26 - bob, 36, 4 - bob, K.b); R(24, 24 - bob, 24, 4, K.bD);                                                        // the hood
      E(36, 19 - bob, 7, 7, '#e8e8e0'); R(30, 22 - bob, 12, 5, '#e8e8e0'); R(31, 17 - bob, 4, 3, '#000000'); R(37, 17 - bob, 4, 3, '#000000'); X(32, 18 - bob, K.e); X(38, 18 - bob, K.e);   // the skull in the hood
      for (let i = 0; i < 5; i++) X(31 + i * 2, 26 - bob, '#000000');
    } },
    // ---- a shambling corpse, arms hanging, ragged loincloth ----
    zombie: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      R(29, 44, 7, 18, K.a); R(41, 45, 7, 17, K.a); R(29, 44, 2, 18, K.aD); R(46, 45, 2, 17, K.aD); R(27, 60, 9, 4, K.b); R(41, 61, 9, 3, K.b);   // legs
      R(28, 38 - bob, 20, 8, K.c); T(28, 46 - bob, 48, 46 - bob, 44, 52 - bob, K.c); X(31, 48 - bob, K.c); X(35, 49 - bob, K.c);         // the loincloth
      R(28, 20 - bob, 20, 20, K.a); R(28, 20 - bob, 20, 3, K.aL); R(30, 26 - bob, 16, 1, K.aD); R(36, 22 - bob, 2, 16, K.aD); R(31, 30 - bob, 14, 1, K.aD);   // the torso, ribs showing
      W(26, 24 - bob, 20, 44 - bob, 5, K.a); W(50, 24 - bob, 56, 44 - bob, 5, K.a); R(18, 43 - bob, 5, 5, K.b); R(54, 43 - bob, 5, 5, K.b);   // the arms hanging long
      E(38, 12 - bob, 8, 8, K.a); R(31, 14 - bob, 14, 6, K.a); E(36, 10 - bob, 4, 3, K.aL);                                               // the head
      eyes(38, 12 - bob, 3, K.e, 2, '#000000'); R(33, 18 - bob, 8, 2, '#000000'); X(35, 18 - bob, '#ffffff'); X(38, 18 - bob, '#ffffff');   // sunken eyes, a grin
      X(29, 17 - bob, K.b); X(46, 15 - bob, K.b);                                                                                          // ears
    } },
    // ---- a hunched brute with a great axe over its shoulder ----
    troll: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      W(52, 20 - bob, 30, 50 - bob, 3, '#8a5a2a'); T(50, 14 - bob, 62, 10 - bob, 58, 28 - bob, '#c0c8d0'); T(50, 14 - bob, 44, 16 - bob, 52, 26 - bob, '#c0c8d0'); L(60, 12 - bob, 58, 26 - bob, '#f0f0f8');   // the axe over the shoulder
      R(26, 46, 8, 16, K.a); R(42, 46, 8, 16, K.a); R(24, 60, 10, 4, K.b); R(42, 60, 10, 4, K.b);                                                   // legs
      R(28, 40 - bob, 20, 8, K.c); R(28, 46 - bob, 20, 2, shade(K.c, 0.7));                                                                          // a loincloth
      E(38, 30 - bob, 15, 13, K.a); E(36, 26 - bob, 10, 7, K.aL); E(38, 38 - bob, 12, 5, K.aD);                                                      // the hunched body
      W(24, 30 - bob, 16, 48 - bob, 6, K.a); R(13, 46 - bob, 8, 6, K.b); X(14, 52 - bob, K.b); X(17, 52 - bob, K.b);                                // the near arm, a fist
      W(50, 28 - bob, 56, 40 - bob, 5, K.a); R(54, 38 - bob, 6, 5, K.b);                                                                            // the far arm gripping the haft
      E(32, 18 - bob, 9, 7, K.a); R(24, 20 - bob, 14, 5, K.a); T(24, 22 - bob, 20, 21 - bob, 25, 25 - bob, K.a);                                      // the head thrust forward
      eyes(31, 17 - bob, 3, K.e, 2); R(25, 23 - bob, 10, 1, K.aD); X(27, 24 - bob, '#ffffff'); X(31, 24 - bob, '#ffffff');                            // eyes, a tusked mouth
      T(38, 14 - bob, 44, 8 - bob, 42, 16 - bob, K.b); T(34, 12 - bob, 36, 6 - bob, 38, 13 - bob, K.b);                                              // spikes of hair
    } },
    // ---- an armoured lizard warrior: green hide, steel pauldrons, gauntlets and a loincloth ----
    lizardman: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 15);
      W(46, 46, 62, 56, 4, K.a); W(62, 56, 68, 52, 2, K.aD);                                                                               // the tail
      R(27, 44, 8, 16, K.a); R(41, 44, 8, 16, K.a); R(25, 58, 10, 5, K.b); R(41, 58, 10, 5, K.b);                                          // legs in steel greaves
      R(28, 36 - bob, 20, 10, K.c); T(28, 46 - bob, 48, 46 - bob, 40, 52 - bob, K.c);                                                       // the loincloth
      R(27, 20 - bob, 22, 18, K.a); R(27, 20 - bob, 22, 3, K.aL); R(31, 26 - bob, 14, 8, K.aD); R(33, 28 - bob, 10, 4, K.a);                 // the chest, scaled belly
      E(26, 22 - bob, 7, 5, K.b); E(50, 22 - bob, 7, 5, K.b); X(22, 20 - bob, K.bL); X(52, 19 - bob, K.bL);                                 // pauldrons
      W(24, 26 - bob, 14, 42 - bob, 5, K.a); R(9, 40 - bob, 9, 8, K.b); R(10, 42 - bob, 7, 3, K.bL);                                         // gauntleted arm, a fist forward
      W(52, 26 - bob, 60, 40 - bob, 5, K.a); R(56, 38 - bob, 8, 7, K.b);
      E(40, 12 - bob, 9, 7, K.a); T(30, 12 - bob, 24, 14 - bob, 32, 17 - bob, K.a); R(28, 14 - bob, 8, 3, K.aD);                             // the head, a long snout
      eyes(41, 10 - bob, 3, K.e, 2); for (let i = 0; i < 3; i++) X(29 + i * 2, 15 - bob, '#ffffff');                                         // eyes, teeth
      T(44, 6 - bob, 48, 0 - bob, 48, 8 - bob, K.b); T(38, 6 - bob, 41, 1 - bob, 43, 7 - bob, K.b);                                          // a crest of spines
    } },
    // ---- a hulking ape, arms to the ground, a wide flat face ----
    ape: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      E(38, 36 - bob, 16, 16, K.a); E(36, 30 - bob, 11, 9, K.aL); E(38, 44 - bob, 13, 6, K.aD);                                      // the great body
      R(28, 50, 8, 12, K.a); R(42, 50, 8, 12, K.a); R(26, 59, 10, 5, K.b); R(42, 59, 10, 5, K.b);                                     // short legs
      W(22, 30 - bob, 12, 56 - bob, 8, K.a); W(54, 30 - bob, 62, 56 - bob, 8, K.a);                                                   // arms planted on the ground
      R(8, 54 - bob, 10, 8, K.b); R(58, 54 - bob, 10, 8, K.b); for (let i = 0; i < 3; i++) { X(9 + i * 3, 62 - bob, K.bD); X(59 + i * 3, 62 - bob, K.bD); }   // knuckles
      E(38, 18 - bob, 10, 9, K.a); E(38, 21 - bob, 8, 6, K.c); R(30, 20 - bob, 16, 5, K.c);                                         // the head, a bare face
      eyes(38, 19 - bob, 4, K.e, 2, '#000000'); R(33, 24 - bob, 10, 1, '#000000'); X(36, 22 - bob, K.cD); X(39, 22 - bob, K.cD);       // eyes, nostrils, a wide mouth
      T(30, 12 - bob, 46, 12 - bob, 38, 4 - bob, K.aD); R(28, 14 - bob, 20, 3, K.a);                                                  // a crest
    } },
    // ---- a wolf springing forward, head low and jaws open ----
    wolf: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      W(52, 34 - bob, 64, 20 - bob * 2, 4, K.a); W(64, 20 - bob * 2, 68, 12 - bob * 2, 3, K.aL);                                         // the tail up
      E(40, 40 - bob, 16, 10, K.a); E(38, 36 - bob, 11, 5, K.aL); E(40, 46 - bob, 13, 4, K.aD);                                          // the body
      W(28, 44, 20, 60, 4, K.a); W(34, 46, 30, 62, 4, K.a); W(50, 44, 56, 60, 4, K.a); W(46, 46, 46, 62, 4, K.a);                       // legs
      for (const [x, y] of [[18, 61], [28, 63], [56, 61], [46, 63]]) { R(x - 2, y, 5, 2, K.c); X(x - 2, y + 2, K.cD); X(x + 2, y + 2, K.cD); }   // paws and claws
      E(22, 30 - bob, 10, 8, K.a); E(20, 27 - bob, 6, 4, K.aL); T(14, 30 - bob, 6, 34 - bob, 15, 36 - bob, K.a); R(8, 32 - bob, 8, 3, K.aD);   // head and muzzle
      R(8, 35 - bob, 10, 3, K.c); X(9, 36 - bob, '#ffffff'); X(12, 36 - bob, '#ffffff'); X(15, 36 - bob, '#ffffff'); R(9, 38 - bob, 8, 2, '#c03050');   // open jaws: teeth, tongue
      eyes(22, 29 - bob, 3, K.e, 2); T(18, 24 - bob, 16, 16 - bob, 22, 22 - bob, K.a); T(26, 24 - bob, 28, 17 - bob, 30, 24 - bob, K.a); X(17, 18 - bob, K.b);   // eyes, ears
      T(30, 30 - bob, 36, 24 - bob, 40, 32 - bob, K.b); T(38, 30 - bob, 44, 26 - bob, 48, 32 - bob, K.b);                                // the ruff along the neck
    } },
    // ---- a rat that walks on two legs, with a shield and a spear ----
    ratsoldier: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      W(46, 50, 60, 58, 3, K.a); W(60, 58, 66, 52, 2, K.aD);                                                                     // the tail
      R(30, 48, 6, 12, K.a); R(40, 48, 6, 12, K.a); R(28, 58, 8, 5, K.b); R(40, 58, 8, 5, K.b);                                   // legs and boots
      R(28, 30 - bob, 20, 18, K.b); R(28, 30 - bob, 20, 3, K.bL); R(30, 44 - bob, 16, 2, K.bD); R(35, 32 - bob, 6, 12, K.c);      // a tunic with a bright front
      E(38, 20 - bob, 8, 7, K.a); T(30, 20 - bob, 22, 22 - bob, 30, 25 - bob, K.a); X(21, 22 - bob, '#e070a0');                   // the head, the snout, the nose
      T(38, 14 - bob, 34, 4 - bob, 42, 12 - bob, K.a); T(44, 14 - bob, 44, 4 - bob, 49, 12 - bob, K.a); X(37, 8 - bob, K.b); X(45, 8 - bob, K.b);   // ears
      eyes(38, 19 - bob, 3, K.e, 2); X(28, 24 - bob, '#ffffff'); X(26, 24 - bob, '#ffffff');                                       // eyes, teeth
      L(54, 6 - bob, 50, 46 - bob, '#8a5a2a'); L(55, 6 - bob, 51, 46 - bob, '#b88650'); T(52, 8 - bob, 56, 8 - bob, 54, 0 - bob, '#e0e0f0');   // the spear
      W(48, 32 - bob, 52, 40 - bob, 4, K.a);
      W(26, 32 - bob, 20, 40 - bob, 4, K.a); E(18, 40 - bob, 8, 9, K.c); E(18, 40 - bob, 5, 6, tint(K.c, 0.3)); X(18, 40 - bob, '#f0e080');   // the shield on the near arm
    } },
    // ---- a goblin brute in a horned helmet with a round shield and a club ----
    kobold: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      R(26, 46, 9, 14, K.a); R(41, 46, 9, 14, K.a); R(24, 58, 11, 5, '#8a5a2a'); R(41, 58, 11, 5, '#8a5a2a');                       // legs and boots
      R(26, 34 - bob, 24, 12, K.c); R(26, 44 - bob, 24, 2, shade(K.c, 0.7)); R(30, 36 - bob, 16, 1, K.cL);                            // a belted tunic
      R(26, 22 - bob, 24, 14, K.a); R(26, 22 - bob, 24, 3, K.aL); R(30, 30 - bob, 16, 4, K.aD);                                       // the chest, muscled
      W(24, 28 - bob, 14, 40 - bob, 6, K.a); E(12, 42 - bob, 9, 10, '#a0a0b0'); E(12, 42 - bob, 6, 7, '#c0c0d0'); X(12, 42 - bob, '#606070');   // the arm with the round shield
      W(52, 28 - bob, 58, 42 - bob, 6, K.a); R(56, 40 - bob, 6, 5, K.aD); L(58, 42 - bob, 66, 26 - bob, '#8a5a2a'); E(65, 24 - bob, 4, 5, '#6a4a2a');   // the arm with the club
      E(38, 14 - bob, 10, 8, K.a); R(28, 16 - bob, 20, 6, K.a); eyes(38, 14 - bob, 4, K.e, 2); R(32, 20 - bob, 12, 2, K.aD); X(33, 20 - bob, '#ffffff'); X(42, 20 - bob, '#ffffff');   // the head, tusks
      T(28, 16 - bob, 24, 14 - bob, 29, 19 - bob, K.a); T(48, 16 - bob, 52, 14 - bob, 47, 19 - bob, K.a);                               // pointed ears
      R(28, 6 - bob, 20, 6, '#a0a0b0'); E(38, 7 - bob, 10, 4, '#a0a0b0'); R(30, 7 - bob, 8, 1, '#d0d0e0'); T(28, 8 - bob, 22, 0 - bob, 30, 4 - bob, '#e8e8e0'); T(48, 8 - bob, 54, 0 - bob, 46, 4 - bob, '#e8e8e0');   // the horned helmet
    } },
    // ---- a winged woman with taloned feet, wings mantled behind her ----
    harpy: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      T(30, 26 - bob, 6, 8 - bob * 2, 12, 40 - bob, K.a); T(42, 26 - bob, 66, 8 - bob * 2, 60, 40 - bob, K.a); L(30, 26 - bob, 7, 9 - bob * 2, K.aD); L(42, 26 - bob, 65, 9 - bob * 2, K.aD);   // the wings
      for (let i = 0; i < 4; i++) { L(12 + i * 4, 40 - bob - i, 10 + i * 4, 46 - bob - i, K.aD); L(60 - i * 4, 40 - bob - i, 62 - i * 4, 46 - bob - i, K.aD); }             // trailing feathers
      R(31, 44, 5, 12, K.c); R(40, 44, 5, 12, K.c); for (const x of [29, 33, 38, 42]) { L(x, 56, x - 1, 62, K.b); L(x + 2, 56, x + 3, 62, K.b); }                            // legs and talons
      R(29, 26 - bob, 18, 18, K.b); R(29, 26 - bob, 18, 2, K.bL); T(29, 44 - bob, 47, 44 - bob, 38, 50 - bob, K.b);                                                          // a short dress
      R(30, 30 - bob, 16, 3, K.c); R(24, 27 - bob, 6, 3, K.c); R(46, 27 - bob, 6, 3, K.c);                                                                                   // bare shoulders and arms
      W(25, 30 - bob, 20, 40 - bob, 3, K.c); W(51, 30 - bob, 56, 40 - bob, 3, K.c); X(19, 41 - bob, K.b); X(57, 41 - bob, K.b);
      E(38, 16 - bob, 7, 7, K.c); R(31, 14 - bob, 14, 5, K.a); R(29, 16 - bob, 4, 14, K.a); R(43, 16 - bob, 4, 12, K.a); R(32, 9 - bob, 12, 3, K.a);                          // face framed by long hair
      eyes(38, 17 - bob, 3, K.e, 1); R(36, 21 - bob, 4, 1, K.b);
    } },
    // ---- a bear reared up, shaggy and heavy, claws out ----
    bear: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      R(26, 48, 9, 12, K.a); R(41, 48, 9, 12, K.a); R(24, 58, 11, 5, K.aD); R(41, 58, 11, 5, K.aD); for (let i = 0; i < 3; i++) { X(25 + i * 4, 63, K.c); X(42 + i * 4, 63, K.c); }   // hind legs
      E(38, 32 - bob, 16, 18, K.a); E(36, 26 - bob, 11, 9, K.aL); E(38, 38 - bob, 10, 8, K.b); E(38, 40 - bob, 7, 5, K.bL);                                              // the bulk, a paler chest
      W(24, 26 - bob, 12, 42 - bob, 7, K.a); W(52, 26 - bob, 62, 42 - bob, 7, K.a); for (let i = 0; i < 3; i++) { L(9 + i * 3, 44 - bob, 8 + i * 3, 48 - bob, K.c); L(60 + i * 3, 44 - bob, 61 + i * 3, 48 - bob, K.c); }   // arms and claws
      E(36, 14 - bob, 9, 8, K.a); E(31, 17 - bob, 5, 4, K.b); X(28, 16 - bob, '#201818'); K.C(29, 10 - bob, 3, K.a); K.C(43, 10 - bob, 3, K.a); X(29, 10 - bob, K.b); X(43, 10 - bob, K.b);   // head, muzzle, round ears
      eyes(36, 13 - bob, 3, K.e, 1); R(30, 20 - bob, 4, 1, '#ffffff');
    } },
    // ---- a treasure chest with teeth and a tongue, on spindly legs ----
    mimic: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const open = f ? 3 : 0;
      K.shadow(36, 66, 15);
      for (const [x0, x1] of [[26, 16], [32, 28], [42, 46], [48, 58]]) { W(x0, 52, x1, 62, 2, '#8060a0'); X(x1 - 1, 62, '#402060'); X(x1 + 1, 62, '#402060'); }   // spider legs
      R(22, 34, 32, 18, K.a); R(22, 34, 32, 3, K.aL); R(22, 50, 32, 2, K.aD); R(22, 34, 3, 18, K.b); R(51, 34, 3, 18, K.b); R(36, 34, 4, 18, K.c); R(30, 40, 16, 5, K.c); R(32, 41, 12, 3, K.cD);   // the box with straps and a lock plate
      R(26, 30 - open, 24, 5, '#301010'); for (let i = 0; i < 6; i++) { T(26 + i * 4, 35 - open, 30 + i * 4, 35 - open, 28 + i * 4, 31 - open, '#ffffff'); T(26 + i * 4, 30, 30 + i * 4, 30, 28 + i * 4, 34, '#ffffff'); }   // the maw and its teeth
      R(30, 32 - open, 8, 3, '#e04060');                                                                                                                                       // the tongue
      R(22, 18 - open, 32, 12, K.a); E(38, 18 - open, 16, 5, K.a); R(22, 18 - open, 32, 2, K.aL); R(22, 20 - open, 3, 10, K.b); R(51, 20 - open, 3, 10, K.b); R(36, 16 - open, 4, 14, K.c);   // the lid
      eyes(38, 24 - open, 8, K.e, 3, '#ffffff');
    } },
    // ---- a hulking statue of a horned beast, come to life ----
    statue: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      R(24, 48, 10, 12, K.a); R(42, 48, 10, 12, K.a); R(22, 58, 12, 5, K.aD); R(42, 58, 12, 5, K.aD);                                                       // squat legs
      E(38, 32 - bob, 17, 17, K.a); E(36, 26 - bob, 11, 8, K.aL); R(26, 40 - bob, 24, 8, K.aD); for (let i = 0; i < 3; i++) R(28, 41 + i * 3 - bob, 20, 1, K.a);   // the belly, ridged
      W(22, 28 - bob, 10, 46 - bob, 8, K.a); W(54, 28 - bob, 64, 46 - bob, 8, K.a); R(6, 44 - bob, 10, 8, K.aD); R(58, 44 - bob, 10, 8, K.aD);               // great arms and fists
      for (let i = 0; i < 3; i++) { L(7 + i * 3, 52 - bob, 6 + i * 3, 56 - bob, K.c); L(60 + i * 3, 52 - bob, 61 + i * 3, 56 - bob, K.c); }                 // claws
      E(38, 14 - bob, 10, 8, K.a); R(28, 16 - bob, 20, 6, K.a); R(30, 20 - bob, 16, 3, K.aD); for (let i = 0; i < 4; i++) X(31 + i * 4, 21 - bob, '#ffffff');   // the head and a fanged mouth
      eyes(38, 14 - bob, 4, K.e, 2); T(28, 12 - bob, 20, 2 - bob, 30, 8 - bob, K.c); T(48, 12 - bob, 56, 2 - bob, 46, 8 - bob, K.c);                          // eyes and horns
      T(36, 8 - bob, 40, 8 - bob, 38, 0 - bob, K.b);                                                                                                        // a crest
      R(22, 62, 32, 2, K.b);                                                                                                                                 // the plinth it dragged along
    } },
    // ---- a golem of piled rock, arms like boulders ----
    golem: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      R(24, 46, 10, 14, K.a); R(42, 46, 10, 14, K.a); R(22, 58, 12, 5, K.aD); R(42, 58, 12, 5, K.aD); X(26, 50, K.aL); X(46, 52, K.aL);                      // legs
      R(24, 22 - bob, 28, 26, K.a); R(24, 22 - bob, 28, 3, K.aL); R(24, 44 - bob, 28, 4, K.aD); R(30, 30 - bob, 6, 4, K.b); R(40, 36 - bob, 8, 5, K.b); R(26, 38 - bob, 5, 3, K.b);   // the rocky torso, cracks and dark stones
      W(20, 26 - bob, 8, 50 - bob, 9, K.a); W(56, 26 - bob, 68, 50 - bob, 9, K.a); E(8, 52 - bob, 6, 5, K.aD); E(68, 52 - bob, 6, 5, K.aD);                  // arms ending in fists
      R(28, 10 - bob, 20, 12, K.a); R(28, 10 - bob, 20, 2, K.aL); R(30, 14 - bob, 16, 2, K.aD); R(32, 12 - bob, 3, 3, K.e); R(41, 12 - bob, 3, 3, K.e); X(33, 13 - bob, '#ffffff'); X(42, 13 - bob, '#ffffff');   // a blocky head, glowing eyes
      R(32, 18 - bob, 12, 2, K.b);
    } },
    // ---- a gargoyle crouched with bat wings and a spiked tail ----
    gargoyle: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      T(30, 26 - bob, 6, 10 - bob * 2, 12, 36 - bob, K.b); T(30, 26 - bob, 12, 36 - bob, 20, 28 - bob, K.b); T(42, 26 - bob, 66, 10 - bob * 2, 60, 36 - bob, K.b); T(42, 26 - bob, 60, 36 - bob, 52, 28 - bob, K.b);   // the wings
      L(30, 26 - bob, 6, 10 - bob * 2, K.bD); L(42, 26 - bob, 66, 10 - bob * 2, K.bD);
      W(46, 48, 60, 58, 3, K.a); T(58, 54, 66, 58, 60, 62, K.c);                                                                                                      // the tail with a spade tip
      R(28, 46, 7, 12, K.a); R(41, 46, 7, 12, K.a); for (const x of [27, 31, 40, 44]) L(x, 58, x, 63, K.c);                                                             // legs and claws
      R(28, 24 - bob, 20, 22, K.a); R(28, 24 - bob, 20, 3, K.aL); R(31, 34 - bob, 14, 6, K.aD); R(33, 36 - bob, 10, 2, K.a);                                            // the torso
      W(26, 28 - bob, 18, 44 - bob, 5, K.a); W(50, 28 - bob, 58, 44 - bob, 5, K.a); for (const x of [16, 18, 20, 56, 58, 60]) L(x, 44 - bob, x, 48 - bob, K.c);         // arms and claws
      E(38, 14 - bob, 8, 8, K.a); T(30, 14 - bob, 26, 10 - bob, 30, 18 - bob, K.a); T(46, 14 - bob, 50, 10 - bob, 46, 18 - bob, K.a);                                     // the head, pointed ears
      T(33, 8 - bob, 31, 0 - bob, 36, 7 - bob, K.c); T(43, 8 - bob, 45, 0 - bob, 40, 7 - bob, K.c); eyes(38, 14 - bob, 3, K.e, 2); R(35, 19 - bob, 6, 1, '#ffffff');    // horns, eyes, fangs
    } },
    // ---- an ant lion: a domed sandy shell, small legs, great pincers in front ----
    antlion: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 22);
      E(38, 36 - bob, 22, 16, K.a); E(36, 30 - bob, 16, 9, K.aL); E(38, 44 - bob, 20, 6, K.aD); for (let i = 0; i < 4; i++) L(18 + i * 10, 28 - bob, 20 + i * 10, 48 - bob, K.aD);   // the domed shell, segmented
      for (const x of [22, 32, 44, 54]) { W(x, 50, x - 2, 60, 3, K.b); X(x - 3, 61, K.bD); X(x - 1, 61, K.bD); }                                                                 // stubby legs
      E(20, 44 - bob, 8, 7, K.b); eyes(20, 42 - bob, 3, K.e, 2, '#ffffff');                                                                                                          // the head low in front
      W(14, 46 - bob, 4, 40 - bob, 3, K.c); W(4, 40 - bob, 8, 34 - bob, 2, K.c); W(26, 48 - bob, 32, 56 - bob, 3, K.c); W(32, 56 - bob, 26, 60 - bob, 2, K.c);                     // the pincers, pink
      for (let i = 0; i < 3; i++) { X(6 + i * 2, 38 - bob, '#ffffff'); }
    } },
    // ---- a lizard on four legs, a long tail, spines or a frill ----
    lizard: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      W(52, 40 - bob, 66, 30 - bob, 4, K.a); W(66, 30 - bob, 70, 18 - bob, 2, K.aD);                                                                        // the tail curling up
      E(40, 42 - bob, 16, 11, K.a); E(38, 38 - bob, 11, 5, K.aL); E(40, 48 - bob, 13, 4, K.b);                                                              // the body, a pale belly
      for (let i = 0; i < 5; i++) T(30 + i * 5, 32 - bob, 34 + i * 5, 32 - bob, 32 + i * 5, 25 - bob - (i % 2), K.b);                                        // spines along the back
      for (const [x0, x1] of [[28, 20], [36, 32], [50, 54], [56, 62]]) { W(x0, 48 - bob, x1, 60, 4, K.a); R(x1 - 3, 60, 7, 3, K.aD); X(x1 - 3, 63, K.c); X(x1 + 3, 63, K.c); }   // legs and claws
      E(22, 32 - bob, 10, 8, K.a); T(14, 32 - bob, 4, 36 - bob, 14, 39 - bob, K.a); R(6, 35 - bob, 8, 2, K.aD); for (let i = 0; i < 3; i++) X(7 + i * 3, 37 - bob, '#ffffff');   // the head, the jaws
      eyes(22, 30 - bob, 3, K.e, 2);
      if (s.frill) { T(24, 22 - bob, 12, 12 - bob, 16, 30 - bob, K.c); T(24, 22 - bob, 26, 8 - bob, 32, 24 - bob, K.c); T(30, 24 - bob, 38, 14 - bob, 40, 30 - bob, K.c); L(24, 22 - bob, 13, 13 - bob, K.b); L(24, 22 - bob, 26, 9 - bob, K.b); L(30, 24 - bob, 38, 15 - bob, K.b); }   // a frill flared wide
    } },
    // ---- a grub upright, with a blade and a helmet, an insect footsoldier ----
    grub: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      E(21, 26 - bob, 6, 7, K.b); E(21, 27 - bob, 4, 4, K.bL); for (let i = 0; i < 3; i++) R(16, 22 + i * 3 - bob, 10, 1, K.bD);   // the segmented body
      R(16, 31, 3, 4, K.b); R(23, 31, 3, 4, K.b); R(15, 34, 4, 2, K.bD); R(23, 34, 4, 2, K.bD);                                    // legs
      W(15, 23 - bob, 9, 26 - bob, 2, K.a); W(27, 23 - bob, 31, 20 - bob, 2, K.a); L(31, 20 - bob, 37, 14 - bob, '#e0e0f0'); L(32, 20 - bob, 38, 14 - bob, '#a0a0c0');   // arms, a blade held up
      E(20, 15 - bob, 6, 5, K.a); eyes(20, 15 - bob, 2, K.e, 2, '#ffffff'); R(18, 19 - bob, 4, 1, K.aD);                            // the head
      E(20, 11 - bob, 7, 3, K.c); R(13, 11 - bob, 14, 2, K.cD); T(20, 8 - bob, 22, 8 - bob, 21, 3 - bob, K.c);                     // a helmet with a plume
    } },
    // ---- a muscle-bound orc in trousers and a necklace, a scimitar in one hand ----
    orc: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      R(26, 42, 10, 16, K.b); R(40, 42, 10, 16, K.b); R(26, 42, 10, 2, K.bL); R(24, 56, 12, 6, '#302020'); R(40, 56, 12, 6, '#302020');   // trousers and boots
      R(26, 20 - bob, 24, 22, K.a); R(26, 20 - bob, 24, 3, K.aL); R(30, 28 - bob, 7, 6, K.aD); R(39, 28 - bob, 7, 6, K.aD); R(30, 36 - bob, 16, 1, K.aD);   // a bare, muscled chest
      R(28, 40 - bob, 20, 3, K.c);                                                                                                                                  // a belt
      W(24, 24 - bob, 14, 42 - bob, 7, K.a); R(12, 40 - bob, 7, 6, K.aD); W(52, 24 - bob, 60, 42 - bob, 7, K.a); R(56, 40 - bob, 7, 6, K.aD);                      // heavy arms and fists
      L(60, 44 - bob, 70, 30 - bob, '#e0e0f0'); L(61, 44 - bob, 71, 30 - bob, '#a0a0c0'); L(68, 30 - bob, 70, 26 - bob, '#e0e0f0');                                  // the scimitar curving up
      R(12, 36 - bob, 8, 2, '#e0c040'); R(56, 36 - bob, 8, 2, '#e0c040');                                                                                            // bracelets
      E(38, 12 - bob, 10, 8, K.a); R(28, 14 - bob, 20, 6, K.a); R(31, 18 - bob, 14, 2, K.aD); X(32, 19 - bob, '#ffffff'); X(43, 19 - bob, '#ffffff');               // a broad head with tusks
      eyes(38, 12 - bob, 4, K.e, 2); E(38, 16 - bob, 3, 2, tint(K.a, 0.3)); X(37, 16 - bob, K.aD); X(39, 16 - bob, K.aD);                                          // a pig snout
      T(28, 12 - bob, 24, 10 - bob, 29, 15 - bob, K.a); T(48, 12 - bob, 52, 10 - bob, 47, 15 - bob, K.a);                                                          // ears
      for (let i = 0; i < 6; i++) X(30 + i * 3, 22 - bob + (i % 2), K.c);                                                                                          // a necklace of beads
    } },
    // ---- a mummy wound in bandages, one arm reaching, wrappings trailing ----
    mummy: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      R(29, 44, 7, 16, K.a); R(41, 44, 7, 16, K.a); for (let i = 0; i < 5; i++) { R(29, 46 + i * 3, 7, 1, K.b); R(41, 47 + i * 3, 7, 1, K.b); } R(27, 59, 9, 4, K.b); R(41, 59, 9, 4, K.b);   // wrapped legs
      R(28, 20 - bob, 20, 24, K.a); for (let i = 0; i < 7; i++) R(28, 22 + i * 3 - bob, 20, 1, K.b); R(30, 36 - bob, 16, 5, K.c);                                    // the body, a sash
      W(26, 24 - bob, 12, 30 - bob, 5, K.a); L(12, 28 - bob, 6, 24 - bob, K.a); L(12, 30 - bob, 6, 30 - bob, K.a); L(12, 32 - bob, 7, 36 - bob, K.a);               // the reaching arm, fingers spread
      W(50, 24 - bob, 56, 42 - bob, 5, K.a); L(56, 42 - bob, 60, 52, K.b); L(60, 52, 58, 60, K.b);                                                                    // the other arm, a loose wrapping trailing
      E(38, 12 - bob, 9, 8, K.a); R(29, 14 - bob, 18, 6, K.a); for (let i = 0; i < 3; i++) R(30, 8 + i * 4 - bob, 16, 1, K.b);                                       // the wrapped head
      R(31, 13 - bob, 14, 4, '#201818'); X(33, 14 - bob, K.e); X(42, 14 - bob, K.e); X(34, 14 - bob, K.e); X(43, 14 - bob, K.e);                                    // a slit with glowing eyes
    } },
    // ---- a gaunt undead in purple skin or a robe, clawed hands, a crown of bone ----
    lich: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      if (s.robe) { T(26, 26 - bob, 50, 26 - bob, 54, 62 - bob, K.a); T(26, 26 - bob, 54, 62 - bob, 22, 62 - bob, K.a); R(22, 60 - bob, 32, 2, K.aD); R(36, 30 - bob, 4, 30, K.b); }   // a long robe with a bright stripe
      else { R(30, 44, 6, 16, K.a); R(40, 44, 6, 16, K.a); R(28, 58, 8, 4, K.aD); R(40, 58, 8, 4, K.aD); R(29, 36 - bob, 18, 8, K.c); R(29, 20 - bob, 18, 16, K.a); R(31, 24 - bob, 14, 1, K.aD); R(31, 28 - bob, 14, 1, K.aD); R(37, 22 - bob, 2, 12, K.aD); }   // ribs showing, a loincloth
      W(27, 26 - bob, 18, 40 - bob, 3, K.a); W(49, 26 - bob, 58, 36 - bob, 3, K.a); for (const [x, y] of [[16, 40], [18, 42], [20, 42], [57, 36], [59, 38], [61, 37]]) L(x, y - bob, x - 1, y + 4 - bob, K.c);   // arms with long claws
      E(38, 14 - bob, 8, 8, K.a); R(31, 16 - bob, 14, 5, K.a); R(33, 20 - bob, 10, 2, K.aD); for (let i = 0; i < 4; i++) X(34 + i * 3, 21 - bob, '#ffffff');                      // the head, bared teeth
      eyes(38, 13 - bob, 3, K.e, 2, '#000000'); for (let i = 0; i < 5; i++) T(30 + i * 4, 8 - bob, 33 + i * 4, 8 - bob, 31 + i * 4, 3 - bob - (i % 2) * 2, K.b);                // eyes, a crown of spikes
    } },
    // ---- a bull-headed warrior in a loincloth, horns wide ----
    minotaur: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 17);
      R(26, 44, 9, 14, K.c); R(41, 44, 9, 14, K.c); R(24, 56, 11, 6, K.b); R(41, 56, 11, 6, K.b);                                                  // dark furred legs, hooves
      R(28, 38 - bob, 20, 8, K.b); T(28, 46 - bob, 48, 46 - bob, 40, 52 - bob, K.b);                                                               // a loincloth
      R(26, 18 - bob, 24, 22, K.a); R(26, 18 - bob, 24, 3, K.aL); R(30, 26 - bob, 7, 6, K.aD); R(39, 26 - bob, 7, 6, K.aD); R(32, 34 - bob, 12, 2, K.aD);   // the chest
      W(24, 22 - bob, 12, 40 - bob, 7, K.a); R(10, 38 - bob, 7, 7, K.aD); W(52, 22 - bob, 62, 38 - bob, 7, K.a); R(58, 36 - bob, 7, 7, K.aD);        // arms and fists
      L(62, 40 - bob, 70, 20 - bob, '#8a5a2a'); L(63, 40 - bob, 71, 20 - bob, '#b88650'); T(66, 24 - bob, 74, 20 - bob, 70, 14 - bob, '#c0c8d0');    // an axe over the shoulder
      E(38, 12 - bob, 9, 8, K.a); R(31, 14 - bob, 14, 6, K.a); E(38, 18 - bob, 6, 3, K.b); X(36, 18 - bob, K.bD); X(40, 18 - bob, K.bD); X(38, 20 - bob, '#e0c040');   // the bull head, the muzzle, a nose ring
      eyes(38, 11 - bob, 4, K.e, 2); T(30, 10 - bob, 20, 4 - bob, 30, 6 - bob, K.b); T(46, 10 - bob, 56, 4 - bob, 46, 6 - bob, K.b); X(20, 4 - bob, '#ffffff'); X(56, 4 - bob, '#ffffff');   // wide horns
    } },
    // ---- a chimera: a lion's body, a goat's head at the shoulder, bat wings, a serpent for a tail ----
    chimera: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 20);
      T(34, 26 - bob, 20, 6 - bob * 2, 26, 30 - bob, K.b); T(44, 26 - bob, 62, 6 - bob * 2, 56, 30 - bob, K.b); L(34, 26 - bob, 21, 7 - bob * 2, K.bD); L(44, 26 - bob, 61, 7 - bob * 2, K.bD);   // wings
      W(54, 40 - bob, 66, 32 - bob, 4, K.c); E(68, 28 - bob, 4, 3, K.c); X(70, 27 - bob, K.e); L(71, 29 - bob, 74, 30 - bob, '#e04060');                                                   // the serpent tail
      E(40, 42 - bob, 17, 11, K.a); E(38, 38 - bob, 12, 5, K.aL); E(40, 48 - bob, 14, 4, K.aD);                                                                                                // the body
      for (const [x0, x1] of [[28, 22], [36, 32], [50, 52], [56, 62]]) { W(x0, 48 - bob, x1, 60, 4, K.a); R(x1 - 3, 60, 7, 3, K.aD); X(x1 - 3, 63, K.c); X(x1 + 3, 63, K.c); }                 // legs and claws
      E(22, 30 - bob, 10, 9, K.a); E(20, 33 - bob, 6, 4, K.aL); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; T(22 + Math.cos(a) * 8, 30 - bob + Math.sin(a) * 8, 22 + Math.cos(a + 0.5) * 8, 30 - bob + Math.sin(a + 0.5) * 8, 22 + Math.cos(a + 0.25) * 14, 30 - bob + Math.sin(a + 0.25) * 12, K.b); }   // the lion head in its mane
      E(22, 30 - bob, 8, 7, K.a); eyes(22, 29 - bob, 3, K.e, 2); R(18, 34 - bob, 8, 1, K.aD); X(19, 35 - bob, '#ffffff'); X(24, 35 - bob, '#ffffff');
      E(40, 24 - bob, 6, 5, K.c); T(36, 22 - bob, 32, 14 - bob, 38, 20 - bob, K.c); T(44, 22 - bob, 48, 14 - bob, 42, 20 - bob, K.c); eyes(40, 24 - bob, 2, K.e, 1);   // the goat head with horns, rising from the shoulders
    } },
    // ---- a wyvern: a slender dragon standing tall on two legs, wings half furled ----
    dragon: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      T(40, 26 - bob, 62, 8 - bob * 2, 64, 38 - bob, K.b); T(40, 26 - bob, 64, 38 - bob, 50, 40 - bob, K.b); L(40, 26 - bob, 62, 9 - bob * 2, K.bD); L(64, 38 - bob, 50, 40 - bob, K.bD);   // the wing behind
      T(32, 26 - bob, 12, 12 - bob * 2, 10, 40 - bob, K.b); T(32, 26 - bob, 10, 40 - bob, 24, 42 - bob, K.b); L(32, 26 - bob, 12, 13 - bob * 2, K.bD);                                    // the near wing
      W(44, 46 - bob, 60, 56 - bob, 4, K.a); W(60, 56 - bob, 68, 50 - bob, 2, K.a); X(69, 49 - bob, K.c);                                                                                    // the tail
      E(36, 38 - bob, 11, 13, K.a); E(34, 34 - bob, 7, 7, K.aL); R(31, 40 - bob, 10, 8, K.c); for (let i = 0; i < 3; i++) R(31, 41 + i * 3 - bob, 10, 1, shade(K.c, 0.8));               // the body, a plated belly
      W(30, 50, 26, 62, 4, K.a); W(42, 50, 46, 62, 4, K.a); for (const x of [23, 26, 29, 43, 46, 49]) L(x, 62, x, 65, K.c);                                                                // legs and claws
      W(28, 34 - bob, 22, 42 - bob, 3, K.a); W(44, 34 - bob, 50, 42 - bob, 3, K.a); L(20, 42 - bob, 19, 45 - bob, K.c); L(23, 43 - bob, 23, 46 - bob, K.c);                              // small arms
      W(36, 26 - bob, 34, 14 - bob, 5, K.a); E(32, 10 - bob, 7, 5, K.a); T(26, 10 - bob, 18, 12 - bob, 26, 14 - bob, K.a); R(20, 12 - bob, 6, 1, K.aD); X(21, 13 - bob, '#ffffff'); X(24, 13 - bob, '#ffffff');   // the neck and head, the jaws
      eyes(33, 9 - bob, 2, K.e, 1); T(36, 8 - bob, 42, 2 - bob, 40, 10 - bob, K.c); T(33, 6 - bob, 36, 0 - bob, 38, 7 - bob, K.c);                                                        // eyes and horns
      for (let i = 0; i < 4; i++) T(34 + i * 3, 18 + i * 3 - bob, 38 + i * 3, 18 + i * 3 - bob, 37 + i * 3, 14 + i * 3 - bob, K.c);                                                        // spines down the neck
    } },
    // ---- a great bird swooping, wings raised, tail streaming ----
    bird: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const up = f ? 4 : 0;
      K.shadow(36, 66, 14);
      T(30, 30, 8, 8 - up, 16, 36, K.a); T(30, 30, 16, 36, 24, 40, K.a); T(46, 30, 68, 8 - up, 60, 36, K.a); T(46, 30, 60, 36, 52, 40, K.a); L(30, 30, 9, 9 - up, K.aD); L(46, 30, 67, 9 - up, K.aD);   // the wings
      for (let i = 0; i < 3; i++) { L(10 + i * 3, 10 - up + i * 6, 6 + i * 3, 14 - up + i * 6, K.b); L(66 - i * 3, 10 - up + i * 6, 70 - i * 3, 14 - up + i * 6, K.b); }                  // wingtip feathers
      E(38, 36, 9, 11, K.a); E(37, 32, 6, 6, K.c); R(35, 44, 6, 2, K.b);                                                                                                                      // the body, a bright breast
      T(34, 46, 42, 46, 38, 62, K.b); T(30, 46, 36, 46, 30, 60, K.b); T(40, 46, 46, 46, 46, 60, K.b);                                                                                          // the tail fanned
      E(38, 22, 6, 6, K.a); T(32, 22, 26, 26, 32, 26, K.c); eyes(39, 21, 2, K.e, 1); T(36, 16, 40, 16, 40, 10, K.b); T(38, 15, 42, 14, 44, 9, K.b);                                          // head, beak, a crest
      L(34, 46, 32, 52, K.c); L(42, 46, 44, 52, K.c); L(30, 52, 34, 52, K.c); L(42, 52, 46, 52, K.c);                                                                                        // legs tucked
    } },
    // ---- a long-necked flightless bird on tall legs ----
    runner: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      W(32, 42 - bob, 28, 60, 3, K.c); W(44, 42 - bob, 46, 60, 3, K.c); R(24, 60, 8, 2, K.c); R(43, 60, 8, 2, K.c); X(24, 62, K.cD); X(31, 62, K.cD); X(43, 62, K.cD); X(50, 62, K.cD);   // long legs and toes
      E(38, 36 - bob, 14, 11, K.a); E(36, 32 - bob, 9, 5, K.aL); E(40, 42 - bob, 11, 4, K.aD); for (let i = 0; i < 4; i++) T(46 + i * 3, 30 - bob, 50 + i * 3, 28 - bob, 54 + i * 3, 36 - bob, K.b);   // the round body, tail plumes
      W(30, 30 - bob, 26, 12 - bob, 4, K.a); E(26, 10 - bob, 5, 4, K.a); T(22, 10 - bob, 14, 12 - bob, 22, 13 - bob, K.c); eyes(27, 9 - bob, 2, K.e, 1); T(26, 6 - bob, 30, 6 - bob, 30, 1 - bob, K.b);   // the neck, head, beak, a crest
      T(24, 28 - bob, 30, 34 - bob, 26, 38 - bob, K.b);                                                                                                                                      // a small wing
    } },
    // ---- an ant reared up with mandibles wide, three pairs of legs ----
    ant: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      E(24, 28 - bob, 7, 6, K.a); E(23, 26 - bob, 4, 3, K.aL); E(19, 22 - bob, 4, 3, K.a);                                                    // abdomen and thorax
      for (let i = 0; i < 3; i++) { L(18 + i * 3, 24 - bob, 10 + i * 4, 30 - bob + i, K.b); L(10 + i * 4, 30 - bob + i, 11 + i * 4, 35, K.b); L(22 + i * 3, 25 - bob, 28 + i * 4, 30 - bob + i, K.b); L(28 + i * 4, 30 - bob + i, 30 + i * 4, 35, K.b); }   // legs
      E(15, 15 - bob, 6, 5, K.a); eyes(15, 14 - bob, 3, K.e, 2, '#ffffff'); L(12, 11 - bob, 8, 6 - bob, K.b); L(17, 11 - bob, 19, 5 - bob, K.b);   // the head, big eyes, antennae
      T(10, 17 - bob, 4, 15 - bob, 8, 21 - bob, K.c); T(11, 19 - bob, 6, 24 - bob, 12, 22 - bob, K.c);                                          // mandibles
    } },
    // ---- a scorpion with claws forward and a sting held over its back ----
    scorpion: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 20);
      W(50, 46 - bob, 62, 34 - bob, 5, K.a); W(62, 34 - bob, 56, 18 - bob, 4, K.a); W(56, 18 - bob, 46, 12 - bob, 4, K.a); T(46, 10 - bob, 44, 16 - bob, 38, 12 - bob, K.c); for (let i = 0; i < 4; i++) X(60 - i * 3, 38 - bob - i * 4, K.aD);   // the tail arching over, the sting
      E(38, 46 - bob, 16, 9, K.a); E(36, 42 - bob, 12, 4, K.aL); for (let i = 0; i < 4; i++) L(26 + i * 6, 40 - bob, 26 + i * 6, 52 - bob, K.aD);   // the segmented body
      for (const [x0, x1] of [[26, 14], [30, 20], [46, 54], [50, 60]]) { L(x0, 50 - bob, x1, 44 - bob, K.b); L(x1, 44 - bob, x1 - 2 * Math.sign(x0 - 38), 60, K.b); }   // legs bent high
      E(20, 44 - bob, 7, 5, K.a); eyes(20, 43 - bob, 2, K.e, 1);                                                                                     // the head
      W(14, 46 - bob, 6, 40 - bob, 4, K.a); T(8, 36 - bob, 2, 34 - bob, 6, 42 - bob, K.c); T(8, 40 - bob, 3, 46 - bob, 8, 44 - bob, K.c);           // the near claw
      W(24, 48 - bob, 20, 56 - bob, 4, K.a); T(20, 54 - bob, 14, 54 - bob, 18, 60 - bob, K.c); T(22, 56 - bob, 18, 62 - bob, 24, 60 - bob, K.c);    // the other claw
    } },
    // ---- a woman with flowing hair and horns, in a dark dress: the nightmare ----
    nightmare: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 12);
      R(30, 44, 6, 14, K.c); R(40, 44, 6, 14, K.c); R(28, 57, 8, 5, K.b); R(40, 57, 8, 5, K.b);                                                     // stockinged legs and boots
      T(28, 26 - bob, 48, 26 - bob, 50, 46 - bob, K.b); T(28, 26 - bob, 50, 46 - bob, 26, 46 - bob, K.b); R(28, 26 - bob, 20, 2, K.bL);              // the dress
      W(27, 28 - bob, 20, 40 - bob, 3, K.a); W(49, 28 - bob, 56, 38 - bob, 3, K.a); X(19, 41 - bob, K.aD); X(57, 39 - bob, K.aD);                    // bare arms
      R(26, 12 - bob, 6, 40, K.c); R(44, 12 - bob, 6, 40, K.c); R(24, 20 - bob, 4, 32, shade(K.c, 0.8)); R(48, 20 - bob, 4, 28, shade(K.c, 0.8));   // long hair falling to the knees
      E(38, 14 - bob, 7, 7, K.a); R(31, 8 - bob, 14, 5, K.c); eyes(38, 15 - bob, 3, K.e, 1); R(37, 19 - bob, 2, 1, K.b);                             // the face
      T(31, 8 - bob, 27, 0 - bob, 33, 5 - bob, K.b); T(45, 8 - bob, 49, 0 - bob, 43, 5 - bob, K.b);                                                    // horns
    } },
    // ---- a horned demon with a wide toothy mouth and small wings ----
    demon: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      T(30, 24 - bob, 14, 8 - bob * 2, 18, 32 - bob, K.c); T(46, 24 - bob, 62, 8 - bob * 2, 58, 32 - bob, K.c); L(30, 24 - bob, 15, 9 - bob * 2, shade(K.c, 0.7)); L(46, 24 - bob, 61, 9 - bob * 2, shade(K.c, 0.7));   // the wings
      R(26, 46, 9, 12, K.a); R(41, 46, 9, 12, K.a); R(24, 57, 11, 5, K.b); R(41, 57, 11, 5, K.b);                                                    // legs
      R(28, 40 - bob, 20, 8, K.b);                                                                                                                  // a loincloth
      E(38, 30 - bob, 14, 13, K.a); E(36, 26 - bob, 9, 6, K.aL); R(30, 34 - bob, 16, 6, K.aD); R(32, 36 - bob, 12, 2, K.a);                          // a round belly
      W(24, 28 - bob, 14, 42 - bob, 6, K.a); W(52, 28 - bob, 62, 42 - bob, 6, K.a); for (const x of [12, 15, 18, 58, 61, 64]) L(x, 42 - bob, x, 47 - bob, K.b);   // arms and claws
      E(38, 14 - bob, 10, 9, K.a); R(30, 18 - bob, 16, 5, '#201010'); for (let i = 0; i < 6; i++) { T(30 + i * 3, 18 - bob, 33 + i * 3, 18 - bob, 31 + i * 3, 21 - bob, '#ffffff'); }   // the head, a wide fanged mouth
      eyes(38, 12 - bob, 4, K.e, 2); T(30, 10 - bob, 24, 2 - bob, 32, 6 - bob, K.b); T(46, 10 - bob, 52, 2 - bob, 44, 6 - bob, K.b);                // eyes, horns
    } },
    // ---- a tiny winged sprite in the air, a wand in hand ----
    faery: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const up = f ? 2 : 0;
      K.shadow(20, 36, 6);
      for (const sx of [-1, 1]) { E(20 + sx * 8, 14 - up, 6, 5, 'rgba(220,240,255,0.7)'); E(20 + sx * 7, 22 - up, 4, 3, 'rgba(220,240,255,0.6)'); }   // gauzy wings
      R(17, 18, 6, 10, K.b); T(16, 28, 24, 28, 20, 33, K.b); R(17, 18, 6, 2, tint(K.b, 0.3));                                                          // a leafy dress
      R(15, 20, 2, 6, K.a); R(23, 20, 2, 5, K.a); L(25, 20, 30, 14, K.c); X(30, 13, '#ffffff');                                                        // arms, a wand
      E(20, 13, 5, 5, K.a); R(15, 9, 10, 4, K.c); R(14, 12, 3, 5, K.c); eyes(20, 14, 2, K.e, 1); R(19, 17, 2, 1, K.b);                                // head, hair
      L(15, 29, 14, 34, K.a); L(24, 29, 25, 34, K.a);                                                                                                  // dangling legs
    } },
    // ---- a walking tree, a face in the trunk, roots for feet ----
    treant: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      for (const [x0, x1] of [[28, 16], [34, 30], [42, 46], [48, 60]]) { W(x0, 54, x1, 62, 4, K.b); X(x1 - 2, 63, K.bD); X(x1 + 2, 63, K.bD); }        // roots
      R(26, 22 - bob, 24, 32, K.a); R(26, 22 - bob, 4, 32, K.aD); R(46, 22 - bob, 4, 32, K.aL); for (let i = 0; i < 6; i++) L(30 + (i % 3) * 5, 26 + i * 4 - bob, 31 + (i % 3) * 5, 30 + i * 4 - bob, K.aD);   // the trunk with bark lines
      W(24, 28 - bob, 10, 20 - bob, 5, K.a); W(52, 28 - bob, 64, 22 - bob, 5, K.a); for (const [x, y] of [[8, 18], [10, 16], [12, 17], [64, 20], [66, 18], [68, 21]]) L(x, y - bob, x - 1, y - 4 - bob, K.aD);   // branch arms with twig fingers
      R(30, 34 - bob, 4, 5, '#000000'); R(42, 34 - bob, 4, 5, '#000000'); X(31, 35 - bob, K.e); X(43, 35 - bob, K.e); R(32, 44 - bob, 12, 3, '#000000'); X(34, 45 - bob, K.aL); X(41, 45 - bob, K.aL);   // hollow eyes and a mouth
      for (const [x, y, r] of [[30, 16, 8], [44, 14, 8], [38, 8, 9], [24, 12, 6], [52, 12, 6]]) { E(x, y - bob, r, r * 0.7, K.c); E(x - 2, y - 2 - bob, r * 0.5, r * 0.3, tint(K.c, 0.3)); }   // the canopy
    } },
    // ---- a jellyfish drifting, a domed bell and trailing tentacles ----
    jelly: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f ? 2 : 0;
      K.shadow(20, 36, 8);
      for (let i = 0; i < 7; i++) { const x = 12 + i * 3; const sway = (i + f) % 2 ? 1 : -1; L(x, 20 - bob, x + sway, 28 - bob, K.c); L(x + sway, 28 - bob, x + sway * 2, 34 - (i % 3), shade(K.c, 0.8)); }   // the tentacles
      E(20, 15 - bob, 11, 8, K.a); E(18, 12 - bob, 7, 4, K.aL); R(9, 19 - bob, 22, 2, K.b); for (let i = 0; i < 5; i++) X(11 + i * 4, 21 - bob, K.b);   // the bell, a frilled rim
      eyes(20, 16 - bob, 4, K.e, 1); X(14, 10 - bob, '#ffffff');
    } },
    // ---- a small dinosaur: a raptor on two legs, or a pteranodon with wings ----
    dino: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 16);
      if (s.wings) { T(34, 30 - bob, 6, 12 - bob * 2, 10, 40 - bob, K.b); T(42, 30 - bob, 70, 12 - bob * 2, 66, 40 - bob, K.b); L(34, 30 - bob, 7, 13 - bob * 2, K.bD); L(42, 30 - bob, 69, 13 - bob * 2, K.bD); }   // wings
      W(46, 40 - bob, 66, 48 - bob, 4, K.a); W(66, 48 - bob, 70, 44 - bob, 2, K.aD);                                                                       // the tail out behind
      E(38, 38 - bob, 12, 10, K.a); E(36, 34 - bob, 8, 5, K.aL); E(38, 42 - bob, 8, 5, K.c);                                                                // the body, pale belly
      W(32, 46, 28, 60, 4, K.a); W(44, 46, 46, 60, 4, K.a); R(25, 60, 8, 3, K.aD); R(43, 60, 8, 3, K.aD); for (const x of [25, 28, 31, 43, 46, 49]) X(x, 63, K.b);   // strong legs, claws
      W(30, 36 - bob, 24, 40 - bob, 2, K.a); W(42, 36 - bob, 48, 40 - bob, 2, K.a);                                                                         // small arms
      W(34, 30 - bob, 30, 18 - bob, 5, K.a); E(28, 14 - bob, 7, 5, K.a); T(22, 14 - bob, 12, 16 - bob, 22, 18 - bob, K.a); R(14, 16 - bob, 8, 1, K.aD); for (let i = 0; i < 3; i++) X(15 + i * 3, 17 - bob, '#ffffff');   // neck, head and jaws
      eyes(29, 13 - bob, 2, K.e, 1); if (s.wings) T(32, 12 - bob, 44, 6 - bob, 34, 16 - bob, K.b); else for (let i = 0; i < 3; i++) T(32 + i * 3, 12 - bob, 35 + i * 3, 12 - bob, 33 + i * 3, 8 - bob, K.b);   // a crest or spines
    } },
    // ---- a squat toad, mouth wide, warts and a fin ----
    toad: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const puff = f ? 2 : 0;
      K.shadow(36, 66, 20);
      E(38, 44 - puff, 20, 14 + puff, K.a); E(36, 38 - puff, 14, 7, K.aL); E(38, 50, 16, 8, K.b); E(38, 52, 12, 5, K.bL);                                   // the body, a pale throat
      W(20, 48, 12, 60, 5, K.a); W(56, 48, 64, 60, 5, K.a); R(8, 60, 10, 3, K.aD); R(60, 60, 10, 3, K.aD); for (const x of [8, 12, 16, 60, 64, 68]) X(x, 63, K.b);   // splayed legs and webbed feet
      W(28, 52, 24, 60, 3, K.a); W(48, 52, 52, 60, 3, K.a); R(21, 60, 6, 2, K.aD); R(50, 60, 6, 2, K.aD);                                                    // front legs
      R(22, 40 - puff, 32, 3, '#301010'); for (let i = 0; i < 6; i++) X(24 + i * 5, 42 - puff, '#ffffff');                                                     // the wide mouth
      E(28, 32 - puff, 6, 5, K.a); E(48, 32 - puff, 6, 5, K.a); eyes(38, 32 - puff, 10, K.e, 3, '#ffffff');                                                    // bulging eyes
      for (const [x, y] of [[30, 26], [44, 24], [36, 22], [50, 30]]) X(x, y - puff, K.c); T(34, 24 - puff, 42, 24 - puff, 38, 16 - puff, K.c);                  // warts and a fin
    } },
    // ---- a flying squirrel gliding, its membrane stretched between the paws ----
    momonga: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      T(8, 16 - bob, 32, 16 - bob, 8, 30 - bob, K.b); T(32, 16 - bob, 32, 30 - bob, 8, 30 - bob, K.b);                                                 // the membrane, a square of skin
      E(20, 22 - bob, 8, 7, K.a); E(19, 20 - bob, 5, 4, K.aL); for (const [x, y] of [[8, 16], [32, 16], [8, 30], [32, 30]]) { X(x, y - bob, K.a); X(x - (x < 20 ? 1 : -1), y - bob, K.aD); }   // the body and four paws
      W(26, 26 - bob, 34, 34 - bob, 3, K.a); E(35, 35 - bob, 3, 2, K.aD);                                                                                 // the bushy tail
      E(15, 14 - bob, 5, 4, K.a); T(11, 12 - bob, 10, 8 - bob, 14, 10 - bob, K.a); T(17, 11 - bob, 18, 7 - bob, 20, 10 - bob, K.a); X(11, 15 - bob, '#e070a0');   // head, ears, nose
      eyes(15, 13 - bob, 2, K.e, 1); X(13, 17 - bob, '#ffffff');
    } },
    // ---- a gryphon: an eagle's head and wings on a lion's body ----
    gryphon: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const up = f ? 3 : 0;
      K.shadow(36, 66, 18);
      T(36, 28, 14, 6 - up, 12, 34, K.b); T(36, 28, 12, 34, 24, 36, K.b); T(44, 28, 68, 6 - up, 66, 34, K.b); T(44, 28, 66, 34, 54, 36, K.b); L(36, 28, 15, 7 - up, K.bD); L(44, 28, 67, 7 - up, K.bD);   // wings raised
      W(52, 46, 66, 40, 3, K.a); E(67, 38, 3, 3, K.aD);                                                                                                                                       // a tufted tail
      E(40, 44, 16, 10, K.a); E(38, 40, 11, 5, K.aL); E(40, 50, 13, 4, K.aD);                                                                                                                 // the lion body
      for (const [x0, x1] of [[28, 22], [36, 32], [50, 52], [56, 62]]) { W(x0, 50, x1, 62, 4, K.a); R(x1 - 3, 62, 7, 2, K.aD); X(x1 - 3, 64, K.c); X(x1 + 3, 64, K.c); }                       // legs and claws
      E(24, 30, 9, 8, K.c); E(22, 27, 6, 4, tint(K.c, 0.3)); T(16, 30, 8, 34, 17, 35, '#f0c040'); X(9, 33, '#c08020');                                                                          // the white eagle head, a hooked beak
      eyes(25, 29, 3, K.e, 2); for (let i = 0; i < 4; i++) T(28 + i * 3, 24, 31 + i * 3, 24, 30 + i * 3, 18 - (i % 2) * 2, K.c);                                                             // eyes, a crest of feathers
    } },
    // ---- Tret: the great face in the tree trunk, boughs spreading above ----
    tree: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 24);
      for (const [x0, x1] of [[22, 8], [30, 24], [42, 48], [50, 64]]) { W(x0, 58, x1, 66, 5, K.a); }                                                                                        // roots
      R(20, 20, 32, 40, K.a); R(20, 20, 5, 40, K.aD); R(47, 20, 5, 40, K.aL); for (let i = 0; i < 8; i++) L(26 + (i % 4) * 5, 22 + i * 4, 27 + (i % 4) * 5, 26 + i * 4, K.aD);            // the trunk
      W(20, 26, 4, 10, 5, K.a); W(52, 26, 68, 8, 5, K.a); W(36, 20, 36, 6, 6, K.a); W(24, 22, 14, 6, 4, K.a); W(48, 22, 58, 4, 4, K.a);                                                    // the boughs
      for (const [x, y, r] of [[6, 6, 9], [16, 2, 9], [36, 0, 12], [56, 0, 10], [68, 4, 8], [26, 4, 8], [46, 2, 8]]) { E(x, y + 2 - bob, r, r * 0.7, K.c); E(x - 2, y - bob, r * 0.5, r * 0.3, tint(K.c, 0.3)); }   // the canopy
      E(30, 34 - bob, 5, 4, '#000000'); E(44, 34 - bob, 5, 4, '#000000'); X(31, 34 - bob, K.e); X(45, 34 - bob, K.e); X(32, 34 - bob, K.e); X(46, 34 - bob, K.e);                          // deep hollow eyes
      R(26, 30 - bob, 8, 2, K.b); R(40, 30 - bob, 8, 2, K.b); T(34, 38 - bob, 40, 38 - bob, 37, 44 - bob, K.b);                                                                            // brows, a nose of bark
      R(28, 48 - bob, 18, 4, '#000000'); for (let i = 0; i < 5; i++) X(29 + i * 4, 48 - bob, K.c);                                                                                          // a wide mouth
    } },
    // ---- the Kraken: a vast pink mantle with one great eye, tentacles curling everywhere ----
    kraken: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 26);
      for (let i = 0; i < 7; i++) { const x = 8 + i * 9; const sway = (i + f) % 2 ? 2 : -2; W(x, 44, x + sway, 56, 3, K.b); W(x + sway, 56, x + sway * 2, 64 - (i % 3), 2, K.bD); }         // tentacles below
      W(12, 36, 2, 24 - bob, 4, K.a); W(2, 24 - bob, 6, 12 - bob, 3, K.a); W(60, 36, 70, 22 - bob, 4, K.a); W(70, 22 - bob, 66, 10 - bob, 3, K.a);                                          // two great arms curling up
      E(36, 34 - bob, 24, 16, K.a); E(32, 28 - bob, 16, 8, K.aL); E(36, 44 - bob, 20, 5, K.aD); T(20, 26 - bob, 12, 8 - bob, 26, 20 - bob, K.a); T(52, 26 - bob, 60, 8 - bob, 46, 20 - bob, K.a);   // the mantle, its fins
      E(36, 36 - bob, 9, 7, '#f0f0f0'); E(37, 36 - bob, 5, 5, K.e); E(38, 36 - bob, 2, 2, '#000000'); X(35, 34 - bob, '#ffffff');                                                        // the single eye
      for (let i = 0; i < 6; i++) X(16 + i * 8, 44 - bob, K.c);                                                                                                                              // suckers
    } },
    // ---- the fused dragons: two (or three) long necks from one winged body ----
    twindragon: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f; const heads = s.heads || 2;
      K.shadow(36, 66, 24);
      T(36, 34 - bob, 8, 10 - bob * 2, 12, 40 - bob, K.c); T(36, 34 - bob, 12, 40 - bob, 26, 42 - bob, K.c); T(40, 34 - bob, 68, 10 - bob * 2, 64, 40 - bob, K.c); T(40, 34 - bob, 64, 40 - bob, 50, 42 - bob, K.c);   // wings
      L(36, 34 - bob, 9, 11 - bob * 2, shade(K.c, 0.7)); L(40, 34 - bob, 67, 11 - bob * 2, shade(K.c, 0.7));
      W(48, 50 - bob, 66, 60 - bob, 5, K.a); W(66, 60 - bob, 71, 54 - bob, 3, K.a);                                                                                                        // the tail
      E(38, 48 - bob, 16, 12, K.a); E(36, 44 - bob, 10, 5, K.aL); E(38, 54 - bob, 12, 5, K.b);                                                                                              // the body
      for (const [x0, x1] of [[28, 22], [36, 32], [48, 52], [54, 60]]) { W(x0, 56 - bob, x1, 64, 4, K.a); X(x1 - 2, 65, K.b); X(x1 + 2, 65, K.b); }                                         // legs
      const necks = heads === 3 ? [[28, 12, -1], [38, 4, 0], [48, 12, 1]] : [[30, 8, -1], [46, 8, 1]];
      for (const [nx, ny, side] of necks) {
        const jx = side === 0 ? -1 : -side;   // the jaws point away from the body's centre, the middle head's to the left
        W(38, 42 - bob, nx, ny + 10 - bob, 7, K.a); W(38, 42 - bob, nx, ny + 10 - bob, 3, K.aL); E(nx, ny + 4 - bob, 8, 6, K.a); E(nx - jx * 2, ny + 2 - bob, 5, 3, K.aL); T(nx + jx * 5, ny + 3 - bob, nx + jx * 16, ny + 6 - bob, nx + jx * 5, ny + 9 - bob, K.a);   // neck, head, jaws
        R(nx + jx * 8 - (jx < 0 ? 6 : 0), ny + 6 - bob, 7, 1, K.aD); X(nx + jx * 13, ny + 7 - bob, '#ffffff'); X(nx + jx * 9, ny + 7 - bob, '#ffffff'); eyes(nx - jx * 1, ny + 3 - bob, 0, K.e, 2); T(nx - jx * 4, ny - 1 - bob, nx - jx * 8, ny - 8 - bob, nx - jx * 6, ny + 1 - bob, K.b); T(nx, ny - 2 - bob, nx - jx * 3, ny - 7 - bob, nx - jx * 2, ny - bob, K.b);   // teeth, an eye, two horns
      }
    } },
    // ---- a magicore: a beast of molten rock, glowing cracks, crouched ----
    magicore: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 18);
      E(38, 42 - bob, 16, 13, K.b); E(36, 38 - bob, 11, 6, K.a); for (const [x0, y0, x1, y1] of [[26, 40, 34, 46], [40, 36, 48, 42], [30, 48, 40, 50], [44, 46, 52, 50]]) L(x0, y0 - bob, x1, y1 - bob, K.c);   // a crusted body with glowing cracks
      W(26, 50, 18, 62, 6, K.b); W(50, 50, 58, 62, 6, K.b); R(14, 60, 10, 4, K.bD); R(54, 60, 10, 4, K.bD); for (const x of [14, 18, 22, 54, 58, 62]) X(x, 64, K.c);                         // forelegs and claws
      E(24, 28 - bob, 10, 8, K.b); E(22, 25 - bob, 6, 4, K.a); T(16, 28 - bob, 6, 30 - bob, 15, 34 - bob, K.b); R(8, 31 - bob, 8, 1, K.c);                                                    // the head, a glowing maw
      eyes(25, 27 - bob, 3, K.e, 2); for (let i = 0; i < 4; i++) T(30 + i * 5, 22 - bob, 34 + i * 5, 22 - bob, 32 + i * 5, 14 - bob - (i % 2) * 3, K.a);                                     // eyes, a mane of flame-coloured spikes
      T(28, 22 - bob, 24, 12 - bob, 30, 20 - bob, K.c); T(20, 24 - bob, 14, 16 - bob, 22, 22 - bob, K.c);                                                                                       // flames off the head
    } },
    // ---- a hydra: three serpent necks rising from a coiled body ----
    hydra: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 20);
      E(38, 52, 18, 9, K.a); E(36, 50, 12, 4, K.aL); E(40, 44, 12, 6, K.a); E(38, 42, 8, 3, K.aL);                                                                                         // the coils
      for (const [nx, ny, side] of [[18, 14, -1], [38, 6, 0], [58, 16, 1]]) {
        W(38, 42 - bob, nx, ny + 12 - bob, 5, K.a); W(38, 42 - bob, nx, ny + 12 - bob, 2, K.aL); E(nx, ny + 6 - bob, 6, 5, K.a); T(nx - 4, ny + 6 - bob, nx - 12, ny + 9 - bob, nx - 4, ny + 10 - bob, K.a);   // neck and head, jaws to the left
        X(nx - 10, ny + 9 - bob, '#ffffff'); X(nx - 7, ny + 9 - bob, '#ffffff'); eyes(nx + 1, ny + 5 - bob, 0, K.e, 2); T(nx + 2, ny + 2 - bob, nx + 6, ny - 4 - bob, nx + 6, ny + 3 - bob, K.b);   // teeth, eye, a fin
      }
      for (let i = 0; i < 5; i++) X(24 + i * 7, 56, K.c);                                                                                                                                   // pale belly scales
    } },
    // ---- a ball of spines with an angry face ----
    urchin: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 10);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const r0 = 9, r1 = 15 + ((i + f) % 2) * 2; L(20 + Math.cos(a) * r0, 22 - bob + Math.sin(a) * r0 * 0.9, 20 + Math.cos(a) * r1, 22 - bob + Math.sin(a) * r1 * 0.9, K.b); }   // the spines
      E(20, 22 - bob, 10, 9, K.a); E(18, 19 - bob, 6, 4, K.aL);                                                                                                                             // the body
      eyes(20, 21 - bob, 4, K.e, 2, '#ffffff'); R(17, 26 - bob, 6, 1, K.bD); X(16, 25 - bob, K.bD); X(23, 25 - bob, K.bD);                                                                    // the scowl
    } },
    // ---- an egg bristling with needles, one eye peeping out ----
    egg: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 9);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; L(20 + Math.cos(a) * 8, 21 - bob + Math.sin(a) * 10, 20 + Math.cos(a) * (13 + ((i + f) % 2) * 2), 21 - bob + Math.sin(a) * (15 + ((i + f) % 2) * 2), K.b); }   // needles
      E(20, 21 - bob, 9, 11, K.a); E(18, 17 - bob, 5, 5, K.aL); E(20, 28 - bob, 7, 4, K.aD);                                                                                                // the egg
      R(16, 20 - bob, 8, 5, '#201818'); X(18, 22 - bob, K.c); X(19, 22 - bob, K.e); X(22, 22 - bob, K.c); X(23, 22 - bob, K.e);                                                                // a crack with eyes inside
    } },
    // ---- a merman standing on a fish tail, a trident in hand ----
    merman: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      W(38, 44 - bob, 48, 58, 8, K.a); T(46, 54, 60, 62, 40, 64, K.b); T(46, 54, 40, 64, 30, 60, K.b);                                                                                       // the tail and its fin
      R(28, 22 - bob, 18, 22, K.a); R(28, 22 - bob, 18, 3, K.aL); R(31, 30 - bob, 12, 8, K.b); R(33, 32 - bob, 8, 4, K.a);                                                                      // the scaled torso, a pale belly
      T(24, 24 - bob, 14, 18 - bob, 26, 30 - bob, K.b); T(48, 24 - bob, 58, 18 - bob, 48, 30 - bob, K.b);                                                                                      // fins at the shoulders
      W(26, 28 - bob, 18, 42 - bob, 4, K.a); W(48, 28 - bob, 56, 40 - bob, 4, K.a); L(56, 40 - bob, 60, 8 - bob, '#d0a040'); L(57, 40 - bob, 61, 8 - bob, '#8a6a20'); for (const dx of [-3, 0, 3]) L(60 + dx, 8 - bob, 60 + dx, 2 - bob, '#e0c060');   // arms, the trident
      E(37, 13 - bob, 8, 7, K.a); R(30, 15 - bob, 14, 5, K.a); eyes(37, 13 - bob, 3, K.e, 2); R(33, 18 - bob, 8, 1, K.aD); T(30, 8 - bob, 46, 8 - bob, 38, 0 - bob, K.b); R(30, 6 - bob, 4, 8, K.b); R(42, 6 - bob, 4, 8, K.b);   // the head, a fin crest, gills
    } },
    // ---- an empty suit of armour walking, sword and shield ----
    armor: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 14);
      R(28, 44, 8, 14, K.a); R(40, 44, 8, 14, K.a); R(28, 50, 8, 1, K.aD); R(40, 50, 8, 1, K.aD); R(26, 57, 10, 6, K.a); R(40, 57, 10, 6, K.a); R(26, 62, 10, 1, K.aD);                      // greaves and sabatons
      R(28, 38 - bob, 20, 8, K.c); R(28, 38 - bob, 20, 2, K.b);                                                                                                                             // a tasset with a belt
      R(27, 20 - bob, 22, 18, K.a); R(27, 20 - bob, 22, 3, K.aL); R(31, 26 - bob, 14, 8, K.aD); R(33, 28 - bob, 10, 4, K.a); X(38, 30 - bob, K.b);                                              // the breastplate
      E(26, 22 - bob, 7, 5, K.a); E(50, 22 - bob, 7, 5, K.a); X(22, 20 - bob, K.aL); X(52, 19 - bob, K.aL);                                                                                     // pauldrons
      W(24, 26 - bob, 16, 40 - bob, 5, K.a); E(14, 42 - bob, 8, 9, K.b); E(14, 42 - bob, 5, 6, tint(K.b, 0.3)); X(14, 42 - bob, K.c);                                                          // the shield arm
      W(52, 26 - bob, 58, 40 - bob, 5, K.a); R(56, 38 - bob, 6, 6, K.a); L(60, 38 - bob, 70, 14 - bob, '#e0e0f0'); L(61, 38 - bob, 71, 14 - bob, '#a0a0c0'); L(57, 34 - bob, 65, 40 - bob, '#d0a040');   // the sword arm
      if (s.headless) { R(33, 14 - bob, 10, 6, K.c); E(38, 12 - bob, 5, 3, K.e); R(50, 50, 10, 10, K.a); R(52, 54, 6, 3, '#000000'); X(53, 55, K.e); X(56, 55, K.e); }                          // no head, only a glow, the helm carried at the hip
      else { R(30, 6 - bob, 16, 14, K.a); R(30, 6 - bob, 16, 2, K.aL); R(31, 12 - bob, 14, 3, '#000000'); X(33, 13 - bob, K.e); X(42, 13 - bob, K.e); R(30, 15 - bob, 16, 1, K.aD); T(30, 6 - bob, 46, 6 - bob, 38, 0 - bob, K.b); }   // a helm with a slit visor and a crest
    } },
    // ---- a serpent reared up in a tall S, hood spread ----
    serpent: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(36, 66, 22);
      E(40, 56, 20, 7, K.a); E(38, 54, 14, 3, K.aL); W(24, 52, 40, 40 - bob, 8, K.a); W(40, 40 - bob, 30, 26 - bob, 8, K.a); W(30, 26 - bob, 26, 14 - bob, 7, K.a);                          // the coils rising
      W(24, 52, 40, 40 - bob, 3, K.c); W(40, 40 - bob, 30, 26 - bob, 3, K.c);                                                                                                               // the pale belly line
      T(26, 16 - bob, 10, 10 - bob, 16, 24 - bob, K.b); T(26, 16 - bob, 42, 10 - bob, 36, 24 - bob, K.b);                                                                                    // the hood spread
      E(26, 12 - bob, 8, 6, K.a); T(20, 12 - bob, 10, 15 - bob, 20, 16 - bob, K.a); R(12, 14 - bob, 8, 1, K.aD); X(13, 15 - bob, '#ffffff'); X(16, 15 - bob, '#ffffff'); L(10, 15 - bob, 6, 17 - bob, '#e04060');   // the head, fangs, a forked tongue
      eyes(28, 11 - bob, 3, K.e, 2); for (let i = 0; i < 6; i++) X(28 + i * 3, 48 - (i % 2) * 6, K.b);                                                                                          // eyes, dark scales
    } },
    // ---- Poseidon: a bearded sea king rising from the water, trident raised ----
    poseidon: { big: true, draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      E(36, 60, 30, 6, K.a); E(36, 58, 26, 4, K.aL); for (let i = 0; i < 6; i++) E(10 + i * 10, 58 - ((i + f) % 2) * 2, 5, 2, '#ffffff');                                                   // the swell he rises from
      R(24, 24 - bob, 24, 32, K.a); R(24, 24 - bob, 24, 3, K.aL); R(28, 34 - bob, 16, 10, K.c); R(30, 36 - bob, 12, 6, K.aL);                                                                // the torso, scaled
      T(20, 26 - bob, 8, 20 - bob, 22, 34 - bob, K.a); T(52, 26 - bob, 64, 20 - bob, 50, 34 - bob, K.a);                                                                                    // fins at the shoulders
      W(22, 30 - bob, 10, 46 - bob, 6, K.c); W(50, 30 - bob, 60, 20 - bob, 6, K.c); L(60, 22 - bob, 64, 0 - bob, K.b); L(61, 22 - bob, 65, 0 - bob, shade(K.b, 0.7)); for (const dx of [-4, 0, 4]) L(64 + dx, 4 - bob, 64 + dx, -3 - bob, K.b);   // arms, the trident held high
      E(36, 14 - bob, 9, 8, K.c); R(28, 18 - bob, 16, 12, '#e8e8f0'); R(30, 26 - bob, 12, 6, '#d0d0e0'); eyes(36, 13 - bob, 4, K.e, 2); R(30, 8 - bob, 12, 3, K.b); T(30, 8 - bob, 42, 8 - bob, 36, 0 - bob, K.b);   // the head, a white beard, a crown
    } },
    // ---- a spiral shell with a small creature peering out ----
    shell: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f;
      K.shadow(20, 36, 10);
      E(22, 22 - bob, 11, 10, K.a); E(24, 20 - bob, 7, 6, K.b); E(25, 19 - bob, 4, 3, K.a); E(26, 18 - bob, 2, 2, K.b); T(11, 22 - bob, 8, 12 - bob, 16, 14 - bob, K.a);                    // the spiral, a spire
      for (let i = 0; i < 4; i++) L(14 + i * 5, 24 - bob, 16 + i * 5, 32 - bob, K.aD);                                                                                                       // ridges
      E(12, 28 - bob, 5, 4, K.c); eyes(12, 27 - bob, 2, K.e, 1); L(9, 25 - bob, 7, 21 - bob, K.c); L(13, 25 - bob, 14, 21 - bob, K.c);                                                       // the snail peeping out, with eyestalks
    } },
    // ---- a floating orb: a plain ball of light, a bomb, or the Star Magician's crystal ----
    orb: { big: true, draw(K, P, f, s) {
      const { R, P: X, E, T, L, W, eyes } = K; const bob = f ? 2 : 0;
      K.shadow(36, 66, 10);
      if (s.mage) {
        T(24, 40 - bob, 48, 40 - bob, 52, 62 - bob, K.a); T(24, 40 - bob, 52, 62 - bob, 20, 62 - bob, K.a); R(20, 60 - bob, 32, 2, K.aD);                                                    // robes
        E(36, 34 - bob, 10, 9, K.c); E(34, 30 - bob, 6, 5, '#ffffff'); eyes(36, 35 - bob, 3, K.e, 2);                                                                                            // a moon face
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2 + f * 0.3; X(36 + Math.cos(a) * 15, 34 - bob + Math.sin(a) * 12, K.b); X(36 + Math.cos(a) * 15 + 1, 34 - bob + Math.sin(a) * 12, K.b); }   // stars circling
        T(26, 24 - bob, 46, 24 - bob, 36, 6 - bob, K.a); R(28, 22 - bob, 16, 3, K.b); X(38, 10 - bob, K.b);                                                                                       // a tall hat
      } else {
        E(36, 36 - bob, 12, 12, K.a); E(32, 31 - bob, 6, 5, K.c); E(36, 42 - bob, 8, 4, K.b);                                                                                                    // the ball
        eyes(36, 37 - bob, 4, K.e, 2, s.bomb ? '#ffffff' : null);
        if (s.bomb) { L(40, 24 - bob, 46, 16 - bob, '#8a5a2a'); X(46, 15 - bob, K.c); X(47, 14 - bob, '#ffe080'); X(45, 14 - bob, '#ffe080'); R(30, 40 - bob, 12, 2, K.b); }                    // a fuse, a grin
        else for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + f * 0.5; X(36 + Math.cos(a) * 16, 36 - bob + Math.sin(a) * 15, K.c); }                                               // motes of light around it
      }
    } },
    // ---- the wild Djinni, a little elemental creature bounding in place ----
    djinni: { draw(K, P, f) {
      const { R, P: X, E, T, L, W, eyes } = K; const hop = f ? -2 : 0;
      K.shadow(20, 36, 8);
      E(20, 24 + hop, 9, 8, K.a); E(18, 21 + hop, 6, 4, K.aL); E(20, 28 + hop, 6, 3, K.c);                                                             // the round body, a pale belly
      T(12, 18 + hop, 9, 8 + hop, 16, 16 + hop, K.a); T(28, 18 + hop, 31, 8 + hop, 24, 16 + hop, K.a); X(10, 10 + hop, K.b); X(30, 10 + hop, K.b);      // two horn-like ears
      W(27, 28 + hop, 34, 22 + hop, 3, K.a); E(35, 20 + hop, 3, 2, K.b);                                                                                // the tail with a tuft
      R(14, 31 + hop, 4, 4 - hop, K.aD); R(22, 31 + hop, 4, 4 - hop, K.aD); R(13, 34, 5, 2, K.b); R(22, 34, 5, 2, K.b);                                // stubby legs
      eyes(20, 22 + hop, 4, K.e, 2, '#ffffff'); R(19, 26 + hop, 2, 1, K.aD); X(26, 14 + hop, K.b); X(14, 14 + hop, K.b);                                // big eyes, a small mouth
    } },
    // ---- the human enemies: a bandit or a fighter facing us, drawn by the party's renderer ----
    human: { big: true, noOutline: true, draw(K, P, f, s, name) {
      const looks = {
        bandit: { skin: '#e0b088', hair: '#503020', hairStyle: 'short', top: '#40a060', sleeve: '#40a060', pants: '#404060', boots: '#302020', belt: '#c03030', scarf: '#c03030', eyes: '#202020', weapon: 'lightblade' },
        thief: { skin: '#e8c8a0', hair: '#302040', hairStyle: 'short', top: '#6040a0', sleeve: '#6040a0', pants: '#303040', boots: '#201020', belt: '#e0c040', eyes: '#202020', weapon: 'lightblade', hat: 'hood', hatColor: '#503080' },
        ruffian: { skin: '#d0a080', hair: '#804020', hairStyle: 'wild', top: '#a06030', sleeve: '#a06030', pants: '#504030', boots: '#302020', belt: '#404040', eyes: '#202020', weapon: 'axe' },
        assassin: { skin: '#d8b090', hair: '#202020', hairStyle: 'short', top: '#303040', sleeve: '#303040', pants: '#202030', boots: '#101018', belt: '#a02020', eyes: '#ff4040', weapon: 'lightblade', hat: 'hood', hatColor: '#202030' },
        slayer: { skin: '#d8b090', hair: '#603020', hairStyle: 'ponytail', top: '#802020', sleeve: '#802020', pants: '#303030', boots: '#201818', belt: '#e0c040', eyes: '#202020', weapon: 'sword' },
        pirate: { skin: '#e0b088', hair: '#402020', hairStyle: 'short', top: '#3050a0', sleeve: '#f0f0f0', pants: '#f0f0f0', boots: '#302020', belt: '#c03030', eyes: '#202020', weapon: 'sword', scarf: '#c03030' },
        wargold: { skin: '#d0b090', hair: '#c0a040', hairStyle: 'wild', top: '#a0a0b0', sleeve: '#a0a0b0', pants: '#404050', boots: '#303030', belt: '#e0c040', eyes: '#202020', weapon: 'axe', armor: '#c0c0d0' },
      };
      const named = {
        Saturos: { skin: '#e0c0a0', hair: '#40b0c0', hairStyle: 'spiky', top: '#d0d0e0', sleeve: '#d0d0e0', pants: '#404860', boots: '#303040', cape: '#40a0a0', belt: '#e0c040', armor: '#e8e8f0', eyes: '#c02020', weapon: 'sword', weaponColor: '#f04040' },
        Menardi: { skin: '#f0d0b0', hair: '#f0e070', hairStyle: 'long', top: '#f0f0f0', sleeve: '#f0f0f0', pants: '#c02040', boots: '#803030', dress: '#c02040', belt: '#e0c040', eyes: '#c02020', weapon: 'scythe', weaponColor: '#e03030' },
        Karst: { skin: '#f0d0b0', hair: '#e04060', hairStyle: 'long', top: '#7040a0', sleeve: '#7040a0', pants: '#402040', boots: '#301030', dress: '#a03060', belt: '#e0c040', eyes: '#c02020', weapon: 'scythe', weaponColor: '#f06060' },
        Agatio: { skin: '#e0c0a0', hair: '#a060c0', hairStyle: 'wild', top: '#40a090', sleeve: '#40a090', pants: '#306080', boots: '#203040', belt: '#e0c040', armor: '#60c0b0', eyes: '#c02020', weapon: 'none' },
        Briggs: { skin: '#e0b090', hair: '#302020', hairStyle: 'wild', top: '#a03028', sleeve: '#a03028', pants: '#404060', boots: '#201020', belt: '#e0c040', eyes: '#202020', hat: 'hood', hatColor: '#c02020', weapon: 'sword' },
        Moapa: { skin: '#e0b090', hair: '#302020', hairStyle: 'short', top: '#a06030', sleeve: '#a06030', pants: '#402818', boots: '#402818', belt: '#e0c040', eyes: '#202020', hat: 'helmet', hatColor: '#c0c8d8', weapon: 'sword' },
        Deadbeard: { skin: '#c0c0b0', hair: '#404040', hairStyle: 'short', top: '#404048', sleeve: '#404048', pants: '#303038', boots: '#202028', belt: '#a02020', armor: '#707080', eyes: '#ff4040', hat: 'helmet', hatColor: '#606070', plume: '#c02020', weapon: 'sword' },
        Azart: { skin: '#e0b090', hair: '#302020', hairStyle: 'short', top: '#e08030', sleeve: '#e08030', pants: '#404080', boots: '#302030', belt: '#e0c040', armor: '#f0a040', eyes: '#202020', hat: 'helmet', hatColor: '#e0a040', plume: '#e04040', weapon: 'sword' },
        Satrage: { skin: '#e0b090', hair: '#302020', hairStyle: 'short', top: '#50b050', sleeve: '#50b050', pants: '#404080', boots: '#302030', belt: '#e0c040', armor: '#70d070', eyes: '#202020', hat: 'helmet', hatColor: '#60c060', plume: '#e04040', weapon: 'sword' },
        Navampa: { skin: '#e0b090', hair: '#302020', hairStyle: 'short', top: '#e060a0', sleeve: '#e060a0', pants: '#404080', boots: '#302030', belt: '#e0c040', armor: '#f080c0', eyes: '#202020', hat: 'helmet', hatColor: '#e070b0', plume: '#40c040', weapon: 'sword' },
        knight: { skin: '#e0b090', hair: '#503020', hairStyle: 'short', top: '#a0a0b0', sleeve: '#a0a0b0', pants: '#404050', boots: '#303030', belt: '#c03030', armor: '#c0c0d0', eyes: '#202020', hat: 'helmet', hatColor: '#b0b0c0', weapon: 'sword' },
      };
      const look = (typeof Monsters !== 'undefined' && Monsters.customLooks[name]) || looks[s.look] || named[s.look] || looks.bandit;   // a traveler fought on the road keeps the look it wore there
      const spr = BattleParty.sprite(look, 'front', f);
      K.g.drawImage(spr, 4, 2);
    } },
  },
};
