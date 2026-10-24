// ---------- Class-changing items beyond the three the originals had ----------
// The Mysterious Card, the Trainer's Whip and the Tomegathericon were the only things in the two games that rewrote
// an Adept's class outright, and the games barely explored the idea. This remake does: twenty-two more of them, each
// a craft or a calling with its own four-tier line (like the book classes: the tiers come from Djinn of the OTHER
// three elements - 0, 1, 2 and 3 of each; the wearer's own element does not count), its own Psynergy, and for many a
// Psynergy that does something new on the field. They are scattered over both journeys: dug up, won from optional
// bosses in places of their own, or taught by people who hand the thing over only to whoever beats them.
// Item -> class table -> learnset live here; what the new Psynergy DOES lives in js/game/class_ext.js.
'use strict';
{
  const IT = (name, key, desc, extra) => { ITEM_DB[name] = Object.assign({ n: name, cat: 'ring', classItem: key, key: true, buy: 0, sell: 0, desc }, extra || {}); };
  // a four-tier line: stats climb by `grow` per tier, the tiers need 0/1/2/3 Djinn of each other element
  const SERIES = (key, names, base, grow) => {
    names.forEach((n, i) => { C(n, base.map((v, s) => v + grow[s] * i), [i, i, i, i], key, i); });
    CLASS_TABLES[key] = names.slice();
  };
  const CLASS_ITEMS = {};   // key -> item name, for anyone who needs the list (the runner, the menus)

  // ========================= GOLDEN SUN =========================
  // --- the Thief's Bandana: Lunpa's cutpurse teaches the trade. Lockpick opens the locked chests the two games hide.
  IT("Thief's Bandana", 'thief', "A cutpurse's bandana. Changes your class: the Thief line. Lockpick opens locked chests."); CLASS_ITEMS.thief = "Thief's Bandana";
  SERIES('thief', ['Cutpurse', 'Rogue', 'Phantom Thief', 'Master Thief'], [100, 90, 110, 90, 150, 130], [25, 10, 12, 10, 12, 5]);
  L('thief', [{ l: lv('1:Lockpick,2:Pilfer,4:Smoke Screen,8:Backstab,12:Shadow Cut,16:Plunder,20:Cloak,24:Vanish,30:Sleep,36:Death Plunge') }, { l: lv('10:Avoid') }, { l: lv('18:Drain,28:Psy Drain') }, { l: lv('34:Annihilation') }]);
  // --- the Hunter's Talisman: the Great Boar of the Bilibin hunting grounds. Grapple flies a line to a hook post over a gap.
  IT("Hunter's Talisman", 'hunter', "A boar-tusk talisman. Changes your class: the Hunter line. Grapple crosses gaps to a hook post."); CLASS_ITEMS.hunter = "Hunter's Talisman";
  SERIES('hunter', ['Tracker', 'Hunter', 'Stalker', 'Beastbane'], [120, 80, 120, 100, 130, 110], [25, 8, 14, 10, 10, 5]);
  L('hunter', [{ l: lv('1:Grapple,3:Snare,5:Piercing Shot,9:Cure Poison,12:Volley,15:Wolf Pack,18:Bind,24:Sonic Slash,30:Killing Shot,40:Hurricane') }, { l: lv('8:Growth') }, { l: lv('20:Punji Trap') }, { l: lv('36:Tempest') }]);
  // --- the Miner's Lantern: the Ore Golem at the bottom of Altin's deep shaft. Lantern lights a dark place.
  IT("Miner's Lantern", 'miner', "A lantern from Altin's deepest gallery. Changes your class: the Miner line. Lantern lights the dark."); CLASS_ITEMS.miner = "Miner's Lantern";
  SERIES('miner', ['Prospector', 'Digger', 'Deep Delver', 'Mine Lord'], [130, 70, 120, 130, 80, 100], [30, 8, 14, 14, 6, 5]);
  L('miner', [{ l: lv('1:Lantern,2:Pick Strike,5:Quake,8:Rockfall,12:Cave-in,15:Cure Well,20:Earthquake,24:Clay Spire,30:Ore Skin,36:Rockslide,44:Grand Gaia') }, { l: lv('7:Move') }, { l: lv('18:Guard,26:Protect') }, { l: lv('34:Avalanche') }]);
  // --- the Wolf Fang Pendant: the matriarch of Mogall's den. Prowl runs on four legs through the low tunnels.
  IT('Wolf Fang Pendant', 'wolf', "A fang on a cord. Changes your class: the Wolf line. Prowl runs the party through low tunnels."); CLASS_ITEMS.wolf = 'Wolf Fang Pendant';
  SERIES('wolf', ['Wolfling', 'Werewolf', 'Alpha', 'Fenrir'], [120, 60, 130, 90, 160, 90], [30, 6, 16, 10, 12, 4]);
  L('wolf', [{ l: lv('1:Prowl,2:Fang,4:Howl,8:Rend,12:Pack Hunt,16:Blood Scent,20:Feral Rush,26:Moon Fang,34:Ravage,42:Fenrir Fang') }, {}, { l: lv('14:Avoid') }, { l: lv('30:Regeneration') }]);
  // --- the Bard's Lyre: Dorian, who plays Kalay's inn. Serenade puts a beast that blocks the way to sleep.
  IT("Bard's Lyre", 'bard', "A travelling player's lyre. Changes your class: the Minstrel line. Serenade lulls the beasts that block a road."); CLASS_ITEMS.bard = "Bard's Lyre";
  SERIES('bard', ['Minstrel', 'Troubadour', 'Virtuoso', 'Maestro'], [90, 140, 80, 90, 130, 140], [20, 14, 8, 10, 10, 5]);
  L('bard', [{ l: lv('1:Serenade,3:Battle Hymn,6:Lullaby,9:Cure,12:Dirge,15:Ply Well,18:Requiem,22:Anthem,28:Wish,34:Ballad of Ruin,40:Wish Well,48:Symphony') }, {}, { l: lv('20:Restore') }, { l: lv('36:Pure Wish') }]);
  // --- the Monk's Prayer Beads: Master Poi of Lama Temple. Stillness holds every moving thing on a floor for a while.
  IT("Monk's Prayer Beads", 'monk', "Prayer beads worn smooth. Changes your class: the Monk line. Stillness holds everything that moves."); CLASS_ITEMS.monk = "Monk's Prayer Beads";
  SERIES('monk', ['Novice', 'Monk', 'Abbot', 'Enlightened'], [120, 100, 120, 120, 130, 120], [25, 12, 14, 12, 10, 5]);
  L('monk', [{ l: lv('1:Stillness,2:Chi Strike,5:Iron Stance,8:Serenity,12:Palm Wave,16:Cure Well,20:Hundred Fists,24:Restore,28:Inner Fire,34:Revive,40:Nirvana Strike') }, {}, { l: lv('18:Guard') }, { l: lv('30:Pure Ply') }]);
  // --- the Assassin's Mask: the Shadow of the Silk Road shrine. Shadow Step slips through iron bars.
  IT("Assassin's Mask", 'assassin', "A blank mask. Changes your class: the Assassin line. Shadow Step passes iron bars."); CLASS_ITEMS.assassin = "Assassin's Mask";
  SERIES('assassin', ['Shade', 'Assassin', 'Nightblade', "Death's Hand"], [100, 90, 140, 80, 170, 100], [22, 8, 16, 8, 14, 4]);
  L('assassin', [{ l: lv('1:Shadow Step,3:Poison Blade,6:Delude,10:Silent Kill,14:Shuriken,18:Cloak,22:Venom Edge,28:Death Mark,34:Annihilation,42:Final Breath') }, {}, { l: lv('16:Bind') }, { l: lv('38:Condemn') }]);
  // --- the Engineer's Goggles: the Clockwork Sentinel in Babi's workshop. Repair mends what is broken on the way.
  IT("Engineer's Goggles", 'engineer', "Brass goggles from Babi's workshop. Changes your class: the Engineer line. Repair mends broken bridges and gears."); CLASS_ITEMS.engineer = "Engineer's Goggles";
  SERIES('engineer', ['Tinker', 'Engineer', 'Machinist', 'Artificer'], [110, 120, 100, 120, 100, 130], [22, 14, 12, 14, 8, 5]);
  L('engineer', [{ l: lv('1:Repair,2:Wrench,5:Ward,8:Overclock,12:Flash Bolt,16:Bolt Thrower,20:Guard,24:Resist,28:Steam Vent,34:Protect,40:Siege Engine') }, {}, { l: lv('18:Cure Well') }, { l: lv('36:Spark Plasma') }]);
  // --- the Gladiator's Emblem: Brannock, Colosso's champion of years past. Shove moves the iron crates Move cannot.
  IT("Gladiator's Emblem", 'gladiator', "The emblem of a Colosso champion. Changes your class: the Gladiator line. Shove moves the iron crates."); CLASS_ITEMS.gladiator = "Gladiator's Emblem";
  SERIES('gladiator', ['Gladiator', 'Champion of Colosso', 'Arena Lord', 'Colossus'], [140, 60, 140, 130, 110, 110], [30, 6, 16, 14, 10, 4]);
  L('gladiator', [{ l: lv('1:Shove,3:Arena Roar,6:Chariot Rush,10:Shield Bash,14:Guard,18:Crowd Cheer,22:Impact,26:Net and Trident,30:Protect,36:Triumph,44:Colossus Blow') }, {}, { l: lv('20:High Impact') }, { l: lv('40:Quick Strike') }]);
  // --- the Crown of Sol: the Alephian Colossus, deep under Sol Sanctum, once all twenty-eight Djinn are found.
  IT('Crown of Sol', 'sovereign', "The crown from the heart of Mt. Aleph. Changes your class: the Sovereign line - the strongest Golden Sun knows."); CLASS_ITEMS.sovereign = 'Crown of Sol';
  SERIES('sovereign', ['Regent', 'Sovereign', 'Sol Regent', 'Radiant King'], [170, 140, 150, 140, 130, 140], [20, 20, 10, 10, 10, 8]);
  L('sovereign', [{ l: lv('1:Ply,2:Ragnarok,4:Sunburst,6:Wish,8:Royal Decree,10:Cure Poison,12:Fireball,14:Restore,16:Solar Flare,18:Revive,22:Odyssey,26:Wish Well,30:Break,34:Corona,40:Pure Wish,46:Judgement of Sol') }, {}, {}, { l: lv('50:Grand Gaia') }]);

  // ========================= THE LOST AGE =========================
  // --- the Pirate's Bandana: Redbeard, marooned at Champa. Dive goes under the water from a dive spot.
  IT("Pirate's Bandana", 'pirate', "A red bandana. Changes your class: the Corsair line. Dive plunges into deep water from a dive spot."); CLASS_ITEMS.pirate = "Pirate's Bandana";
  SERIES('pirate', ['Deckhand', 'Corsair', 'Sea Wolf', 'Dread Captain'], [130, 70, 130, 110, 130, 130], [26, 8, 14, 12, 10, 4]);
  L('pirate', [{ l: lv('1:Dive,2:Cutlass,5:Plunder,8:Grog,12:Broadside,15:Frost,18:Keelhaul,22:Ply Well,26:Boarding Party,32:Diamond Dust,40:Maelstrom') }, {}, { l: lv('20:Avoid') }, { l: lv('36:Megacool') }]);
  // --- the Nomad's Veil: the Scorpion Queen under Yampi's sands. Sandstorm blows the dunes out of a passage.
  IT("Nomad's Veil", 'nomad', "A veil against the sand. Changes your class: the Nomad line. Sandstorm blows a drift out of the way."); CLASS_ITEMS.nomad = "Nomad's Veil";
  SERIES('nomad', ['Nomad', 'Caravaneer', 'Sand Sage', 'Dune Lord'], [110, 110, 110, 100, 140, 130], [24, 12, 12, 10, 10, 5]);
  L('nomad', [{ l: lv('1:Sandstorm,2:Sand Blast,4:Oasis,8:Mirage,12:Scorpion Sting,16:Dust Devil,20:Cure Well,24:Quicksand,30:Sun Scourge,38:Simoom') }, {}, { l: lv('14:Restore') }, { l: lv('34:Stone Spire') }]);
  // --- the Puppeteer's Strings: Pupetta of Madra. Puppet walks a doll where the party cannot go.
  IT("Puppeteer's Strings", 'puppeteer', "Strings of silk and Psynergy. Changes your class: the Puppeteer line. Puppet walks a doll across a floor."); CLASS_ITEMS.puppeteer = "Puppeteer's Strings";
  SERIES('puppeteer', ['Puppeteer', 'Marionettist', 'Dollmaster', 'Grand Manipulator'], [90, 140, 90, 100, 120, 130], [22, 16, 10, 10, 10, 5]);
  L('puppeteer', [{ l: lv('1:Puppet,3:Tangle,6:Charm,10:Cut Strings,14:Delude,18:Marionette,22:Weaken,26:Enfeeble,30:Mass Charm,36:Curse,44:Grand Guignol') }, {}, { l: lv('16:Cure Well') }, { l: lv('34:Psy Drain') }]);
  // --- the Dancer's Anklet: Susa spars for it after the Serpent. Rhythm rings the chimes that open a door.
  IT("Dancer's Anklet", 'dancer', "A festival anklet of bells. Changes your class: the Dancer line. Rhythm rings the chimes."); CLASS_ITEMS.dancer = "Dancer's Anklet";
  SERIES('dancer', ['Dancer', 'Performer', 'Ceremonial Dancer', 'Kagura Master'], [100, 120, 100, 90, 170, 140], [22, 12, 12, 10, 12, 5]);
  L('dancer', [{ l: lv('1:Rhythm,2:Sword Dance,5:Fan Dance,8:Veil Step,12:Ply,16:Whirling Blades,20:Rain Dance,24:Restore,28:Trance,34:Wish,40:Kagura') }, {}, { l: lv('18:Quick Strike') }, { l: lv('36:Pure Wish') }]);
  // --- the Lemurian Circlet: the Leviathan Spawn in the vault under Lemuria. Ebb draws the tide out of a flooded room.
  IT('Lemurian Circlet', 'lemurian', "A circlet from Lemuria's sunken vault. Changes your class: the Tide line. Ebb draws the water out of a tidal room."); CLASS_ITEMS.lemurian = 'Lemurian Circlet';
  SERIES('lemurian', ['Tide Initiate', 'Tide Priest', 'Sea Sage', "Hydros' Heir"], [110, 150, 90, 110, 110, 140], [24, 18, 10, 12, 10, 5]);
  L('lemurian', [{ l: lv('1:Ebb,2:Ply,4:Tidal Wave,8:Stasis,12:Ply Well,16:Undertow,20:Restore,24:Ice Missile,28:Time Lock,34:Pure Ply,40:Deluge,48:Leviathan') }, {}, { l: lv('22:Wish') }, { l: lv('44:Pure Wish') }]);
  // --- the Shaman's Drum: Whitefeather, eldest of Shaman Village. Spirit Sight shows the dead who still wait.
  IT("Shaman's Drum", 'shaman', "A hide drum painted with spirits. Changes your class: the Spiritcaller line. Spirit Sight shows the dead."); CLASS_ITEMS.shaman = "Shaman's Drum";
  SERIES('shaman', ['Chanter', 'Spiritcaller', 'Totem Master', 'Great Spirit'], [100, 150, 90, 100, 120, 130], [24, 18, 10, 12, 10, 5]);
  L('shaman', [{ l: lv('1:Spirit Sight,2:Cure,4:Totem of Stone,8:Spirit Lash,12:Wish,16:Totem of Flame,20:Restore,24:Ancestor Call,28:Curse,34:Wish Well,40:Great Spirit,48:Pure Wish') }, {}, { l: lv('18:Revive') }, { l: lv('36:Haunt') }]);
  // --- the Mad Alchemist's Vial: Vorn, the hermit alchemist of Loho. Transmute turns lead to gold and stone to a crate.
  IT("Mad Alchemist's Vial", 'alchemy', "A vial of something that will not settle. Changes your class: the Alchemist line. Transmute changes one thing into another."); CLASS_ITEMS.alchemy = "Mad Alchemist's Vial";
  SERIES('alchemy', ['Tinkerer', 'Chemist', 'Transmuter', 'Philosopher King'], [100, 160, 90, 110, 100, 150], [22, 20, 10, 12, 8, 5]);
  L('alchemy', [{ l: lv('1:Transmute,2:Acid Flask,5:Elixir Toss,8:Volatile Mix,12:Cure Well,16:Quicksilver,20:Restore,24:Philosopher Stone,28:Revive,34:Wish Well,40:Magnum Opus') }, {}, { l: lv('18:Ward') }, { l: lv('36:Pure Wish') }]);
  // --- the Oracle's Eye: the Mirror of Hama at the Anemos observatory. Scry shows every hidden thing on a floor.
  IT("Oracle's Eye", 'oracle', "A glass eye that sees ahead. Changes your class: the Augur line. Scry uncovers everything hidden on a floor."); CLASS_ITEMS.oracle = "Oracle's Eye";
  SERIES('oracle', ['Augur', 'Oracle', 'Prophet', 'Fate Weaver'], [90, 170, 80, 100, 140, 160], [22, 20, 8, 12, 12, 5]);
  L('oracle', [{ l: lv('1:Scry,2:Reveal,4:Foresight,8:Ray,12:Doom Prophecy,16:Cure Well,20:Bind,24:Storm Ray,28:Fated Blow,34:Wish,40:Destruct Ray,48:Judgement') }, {}, { l: lv('18:Mind Read') }, { l: lv('36:Revive') }]);
  // --- the Warlord's Helm: Kaldr, champion of Prox. Warmth walks the party through a blizzard.
  IT("Warlord's Helm", 'warlord', "A Proxian war helm. Changes your class: the Frostborn line. Warmth carries the party through a blizzard."); CLASS_ITEMS.warlord = "Warlord's Helm";
  SERIES('warlord', ['Frostborn', 'Ice Warrior', 'Winter Warlord', 'Frost Titan'], [150, 60, 150, 140, 100, 100], [30, 8, 16, 16, 8, 4]);
  L('warlord', [{ l: lv('1:Warmth,2:Frost Axe,5:War Cry,8:Guard,12:Glacier Crush,16:Blaze Edge,20:Protect,24:Frostbite,30:Rime Armor,36:Ragnarok,44:Fimbulwinter') }, {}, { l: lv('18:Impact') }, { l: lv('40:Avalanche') }]);
  // --- the Chronos Sigil: the Watcher in the Halls of Time, under the Sea of Time.
  IT('Chronos Sigil', 'chronos', "A sigil that ticks like a heart. Changes your class: the Chronomancer line."); CLASS_ITEMS.chronos = 'Chronos Sigil';
  SERIES('chronos', ['Timekeeper', 'Chronomancer', 'Epoch Sage', 'Eternal'], [130, 190, 110, 130, 170, 150], [22, 16, 12, 12, 10, 5]);
  L('chronos', [{ l: lv('1:Stasis,2:Ply,4:Haste,8:Time Lock,12:Wish,16:Rewind,20:Restore,24:Hourglass,28:Revive,34:Wish Well,40:Entropy,48:End of Days') }, {}, { l: lv('18:Ray') }, { l: lv('44:Pure Wish') }]);
  // --- the Dragon Scale Amulet: the Elder Frostwyrm in its hollow past Prox. Stronger than Dullahan, for a class to match.
  IT('Dragon Scale Amulet', 'dragon', "A scale the size of a shield, warm to the touch. Changes your class: the Dragon Knight line."); CLASS_ITEMS.dragon = 'Dragon Scale Amulet';
  SERIES('dragon', ['Wyrmling', 'Drake Knight', 'Dragon Knight', 'Dragon Sovereign'], [190, 140, 160, 150, 120, 120], [18, 16, 12, 12, 10, 5]);
  L('dragon', [{ l: lv('1:Dragon Breath,2:Ply,4:Wing Buffet,8:Guard,12:Wish,16:Scale Armor,20:Dragon Claw,24:Restore,28:Revive,32:Inferno,36:Wish Well,40:Draconic Fury,48:Pure Wish') }, {}, {}, { l: lv('44:Grand Gaia') }]);
  // --- the Void Mantle: the Void Sovereign at Weyard's edge. The hardest fight in either game, and the class to show for it.
  IT('Void Mantle', 'void', "A mantle woven from the nothing past the edge of the world. Changes your class: the Void line - beyond anything else."); CLASS_ITEMS.void = 'Void Mantle';
  SERIES('void', ['Voidwalker', 'Abyss Knight', 'Oblivion', 'Worldender'], [210, 170, 180, 170, 160, 130], [18, 16, 10, 8, 8, 6]);
  L('void', [{ l: lv('1:Oblivion,2:Ply,4:Nullify,8:Wish,12:Void Step,16:Restore,20:Event Horizon,24:Revive,28:Wish Well,34:Unmaking,40:Pure Wish,46:Heat Death') }, {}, {}, { l: lv('50:Grand Gaia') }]);

  window.CLASS_ITEMS = CLASS_ITEMS;

  // ========================= the Psynergy the lines know =========================
  // field: what they do on the map (js/game/class_ext.js); the battle ones with new types are worked out there too
  const F = (name, el, pp, desc) => D(name, el, pp, 'field', { desc, fieldOnly: true, classField: true });
  F('Lockpick', 'A', 1, 'Open a locked chest.'); F('Grapple', 'E', 2, 'Fly a line to a hook post over a gap.'); F('Lantern', 'F', 1, 'Light a dark place.');
  F('Prowl', 'E', 3, 'Run on four legs: fast, and through the low tunnels.'); F('Serenade', 'A', 2, 'Lull a beast that blocks the way.'); F('Stillness', 'W', 3, 'Hold everything that moves, for a while.');
  F('Shadow Step', 'A', 3, 'Pass through iron bars, for a while.'); F('Repair', 'E', 2, 'Mend a broken bridge or gear.'); F('Shove', 'F', 2, 'Shove an iron crate one square.');
  F('Dive', 'W', 2, 'Dive under the water from a dive spot.'); F('Sandstorm', 'A', 2, 'Blow a sand drift out of the way.'); F('Puppet', 'A', 2, 'Take the strings of a doll and walk it.');
  F('Rhythm', 'F', 1, 'Ring a chime.'); F('Ebb', 'W', 3, 'Draw the tide out of a flooded room, for a while.'); F('Spirit Sight', 'A', 2, 'See the spirits that linger, for a while.');
  F('Transmute', 'E', 3, 'Change one thing into another.'); F('Scry', 'A', 3, 'Uncover everything hidden on this floor.'); F('Warmth', 'F', 3, 'Walk through a blizzard, for a while.');
  // --- Thief
  D('Pilfer', 'A', 2, 'steal', { desc: 'Snatch what a foe carries.' }); D('Smoke Screen', 'A', 5, 'status', { status: 'delusion', range: 'all', statusChance: 0.7, desc: 'Blind every foe with smoke.' });
  D('Backstab', 'A', 6, 'epa', { add: 30, mult: 1.3, desc: 'A blade in the back: hard, and often critical.', crit: 0.4 }); D('Shadow Cut', 'A', 9, 'epa', { add: 45, mult: 1.2, status: 'delusion', desc: 'Cut from the shadows.' });
  D('Plunder', 'A', 4, 'steal', { coins: true, desc: "Snatch a foe's purse." }); D('Vanish', 'A', 7, 'buff', { stat: 'agi', amt: 0.5, desc: 'Become hard to hit.' });
  // --- Hunter
  D('Snare', 'E', 3, 'status', { status: 'stun', statusChance: 0.6, desc: 'Rope a foe to the ground.' }); D('Piercing Shot', 'E', 5, 'epa', { add: 25, mult: 1.1, pierce: 0.5, desc: 'A shot that ignores half the armor.' });
  D('Volley', 'E', 8, 'multi', { hits: 3, add: 15, mult: 0.9, desc: 'Three arrows at whoever stands there.' }); D('Wolf Pack', 'E', 12, 'multi', { hits: 4, add: 20, mult: 0.9, desc: 'The pack falls on the foes.' });
  D('Killing Shot', 'E', 16, 'epa', { add: 90, mult: 1.4, pierce: 0.5, desc: 'The shot that ends a hunt.' });
  // --- Miner
  D('Pick Strike', 'E', 3, 'epa', { add: 20, mult: 1.2, desc: 'A pick swung at a foe.' }); D('Cave-in', 'E', 10, 'magic', { base: 55, range: 3, status: 'stun', statusChance: 0.3, desc: 'Bring the roof down on the foes.' });
  D('Ore Skin', 'E', 6, 'buff', { stat: 'def', amt: 0.4, range: 'all', desc: 'Skin like ore, for all.' });
  // --- Wolf
  D('Fang', 'E', 2, 'epa', { add: 15, mult: 1.2, desc: 'Bite.' }); D('Howl', 'E', 4, 'buff', { stat: 'atk', amt: 0.25, range: 'all', desc: 'A howl that stirs the pack.' });
  D('Rend', 'E', 6, 'epa', { add: 35, mult: 1.2, status: 'poison', desc: 'Tear a foe open.' }); D('Pack Hunt', 'E', 10, 'multi', { hits: 3, add: 25, mult: 1, desc: 'Fall on the foes as a pack.' });
  D('Blood Scent', 'E', 5, 'debuff', { stat: 'def', amt: -0.3, range: 3, desc: "Smell the foes' fear: their guard drops." }); D('Feral Rush', 'E', 12, 'epa', { add: 60, mult: 1.3, desc: 'A rush on all fours.' });
  D('Moon Fang', 'E', 16, 'epa', { add: 80, mult: 1.4, drain: true, desc: 'A bite that feeds.' }); D('Ravage', 'E', 22, 'multi', { hits: 5, add: 40, mult: 1, desc: 'Ravage the foes.' });
  D('Fenrir Fang', 'E', 30, 'epa', { add: 140, mult: 1.6, status: 'stun', desc: 'The bite of the wolf that eats the sun.' }); D('Regeneration', 'E', 8, 'heal', { base: 120, range: 'all', desc: 'The pack licks its wounds.' });
  // --- Bard
  D('Battle Hymn', 'A', 5, 'song', { stat: 'atk', amt: 0.25, desc: 'A hymn that strengthens all.' }); D('Lullaby', 'A', 6, 'status', { status: 'sleep', range: 'all', statusChance: 0.5, desc: 'A song that puts every foe to sleep.' });
  D('Dirge', 'A', 7, 'song', { debuff: 'atk', amt: -0.25, desc: 'A dirge that saps the foes.' }); D('Requiem', 'A', 10, 'magic', { base: 70, range: 'all', desc: 'A requiem that wounds every foe.' });
  D('Anthem', 'A', 9, 'song', { stat: 'def', amt: 0.3, desc: 'An anthem that hardens all.' }); D('Ballad of Ruin', 'A', 14, 'song', { debuff: 'def', amt: -0.3, desc: 'A ballad that opens every guard.' });
  D('Symphony', 'A', 24, 'song', { stat: 'atk', amt: 0.3, debuff: 'def', amt2: -0.3, desc: 'A symphony that turns the whole battle.' });
  // --- Monk
  D('Chi Strike', 'W', 3, 'epa', { add: 20, mult: 1.2, desc: 'A strike with the breath behind it.' }); D('Iron Stance', 'W', 4, 'stance', { turns: 3, desc: 'Take a stance that returns every blow.' });
  D('Serenity', 'W', 5, 'cure', { cures: ['poison', 'venom', 'stun', 'sleep', 'delusion', 'seal', 'haunt', 'curse'], range: 'all', desc: 'Clear every ailment from the party.' });
  D('Palm Wave', 'W', 8, 'magic', { base: 60, range: 3, desc: 'A wave of force from the palm.' }); D('Hundred Fists', 'W', 12, 'multi', { hits: 4, add: 20, mult: 0.9, desc: 'A hundred blows.' });
  D('Inner Fire', 'W', 6, 'buff', { stat: 'atk', amt: 0.4, desc: 'Kindle the fire within.' }); D('Nirvana Strike', 'W', 20, 'epa', { add: 120, mult: 1.5, pierce: 0.5, desc: 'The one strike that is all strikes.' });
  // --- Assassin
  D('Poison Blade', 'A', 3, 'epa', { add: 15, mult: 1.1, status: 'poison', desc: 'A poisoned edge.' }); D('Silent Kill', 'A', 8, 'assassinate', { add: 30, mult: 1.2, kill: 0.25, desc: 'One in four foes never sees it coming.' });
  D('Venom Edge', 'A', 10, 'epa', { add: 40, mult: 1.2, status: 'venom', desc: 'A venomed edge.' }); D('Death Mark', 'A', 12, 'doom', { turns: 3, pct: 0.5, desc: 'Mark a foe: in three turns, it pays.' });
  D('Final Breath', 'A', 24, 'assassinate', { add: 100, mult: 1.5, kill: 0.45, desc: 'Nearly half of all foes fall on the spot.' });
  // --- Engineer
  D('Wrench', 'E', 2, 'epa', { add: 18, mult: 1.15, desc: 'A wrench, swung.' }); D('Overclock', 'A', 5, 'buff', { stat: 'agi', amt: 0.4, range: 'all', desc: 'Everyone runs faster.' });
  D('Bolt Thrower', 'A', 8, 'magic', { base: 65, range: 1, desc: 'A machine that throws bolts of lightning.' }); D('Steam Vent', 'F', 10, 'magic', { base: 70, range: 3, status: 'delusion', desc: 'Scalding steam over the foes.' });
  D('Siege Engine', 'E', 22, 'magic', { base: 170, range: 5, desc: 'A siege engine, fired.' });
  // --- Gladiator
  D('Arena Roar', 'F', 4, 'buff', { stat: 'atk', amt: 0.3, range: 'all', desc: 'A roar that lifts the whole line.' }); D('Chariot Rush', 'F', 7, 'multi', { hits: 3, add: 20, mult: 1, desc: 'Ride down the foes.' });
  D('Shield Bash', 'F', 5, 'epa', { add: 25, mult: 1.1, status: 'stun', statusChance: 0.4, desc: 'A bash that stuns.' }); D('Crowd Cheer', 'F', 6, 'heal', { base: 90, range: 'all', desc: 'The crowd roars, and the line stands taller.' });
  D('Net and Trident', 'F', 11, 'epa', { add: 55, mult: 1.3, status: 'stun', statusChance: 0.5, desc: 'The net, then the trident.' }); D('Triumph', 'F', 9, 'song', { stat: 'atk', amt: 0.2, stat2: 'def', amt3: 0.2, desc: 'A triumph: the line is lifted twice over.' });
  D('Colossus Blow', 'F', 26, 'epa', { add: 150, mult: 1.6, desc: 'The blow of a colossus.' });
  // --- Sovereign
  D('Sunburst', 'F', 8, 'magic', { base: 60, range: 3, desc: 'A burst of the sun.' }); D('Royal Decree', 'E', 7, 'song', { stat: 'def', amt: 0.3, debuff: 'atk', amt2: -0.2, desc: 'A decree: the line holds, the foes falter.' });
  D('Solar Flare', 'F', 16, 'magic', { base: 120, range: 5, status: 'delusion', desc: 'A flare of the sun over the foes.' }); D('Corona', 'F', 24, 'magic', { base: 180, range: 'all', desc: 'The crown of the sun.' });
  D('Judgement of Sol', 'F', 40, 'prismatic', { base: 320, range: 'all', desc: 'The sun judges every foe by its own weakness.' });
  // --- Pirate
  D('Cutlass', 'W', 3, 'epa', { add: 20, mult: 1.2, desc: 'A cutlass, swung.' }); D('Grog', 'W', 4, 'buff', { stat: 'atk', amt: 0.35, desc: 'A swig of courage.' });
  D('Broadside', 'W', 10, 'magic', { base: 70, range: 5, desc: 'A broadside from the guns.' }); D('Keelhaul', 'W', 9, 'epa', { add: 45, mult: 1.2, status: 'stun', statusChance: 0.4, desc: 'Drag a foe under the keel.' });
  D('Boarding Party', 'W', 14, 'multi', { hits: 4, add: 30, mult: 1, desc: 'The whole crew boards.' }); D('Maelstrom', 'W', 28, 'magic', { base: 210, range: 'all', desc: 'A whirlpool that swallows every foe.' });
  // --- Nomad
  D('Sand Blast', 'E', 4, 'magic', { base: 35, range: 3, status: 'delusion', statusChance: 0.4, desc: 'Sand in the eyes.' }); D('Oasis', 'W', 6, 'heal', { base: 100, range: 'all', desc: 'Water in the waste.' });
  D('Mirage', 'A', 5, 'buff', { stat: 'agi', amt: 0.4, range: 'all', desc: 'The line shimmers and is hard to strike.' }); D('Scorpion Sting', 'E', 7, 'epa', { add: 30, mult: 1.2, status: 'venom', desc: 'A sting with venom in it.' });
  D('Dust Devil', 'A', 10, 'magic', { base: 75, range: 3, desc: 'A twisting devil of dust.' }); D('Quicksand', 'E', 12, 'status', { status: 'stun', range: 3, statusChance: 0.5, desc: 'The ground swallows the foes to the waist.' });
  D('Sun Scourge', 'F', 16, 'magic', { base: 130, range: 5, desc: 'The desert sun, all at once.' }); D('Simoom', 'A', 24, 'magic', { base: 190, range: 'all', status: 'delusion', desc: 'The poison wind of the deep desert.' });
  // --- Puppeteer
  D('Tangle', 'A', 3, 'status', { status: 'stun', statusChance: 0.5, desc: 'Tangle a foe in strings.' }); D('Charm', 'A', 6, 'charm', { turns: 2, chance: 0.6, desc: 'Take the strings of a foe: it fights for you.' });
  D('Cut Strings', 'A', 5, 'break', { range: 'all', desc: 'Cut every foe loose from its bonuses.' }); D('Marionette', 'A', 9, 'magic', { base: 70, range: 1, status: 'stun', statusChance: 0.5, desc: 'Jerk a foe about on strings.' });
  D('Mass Charm', 'A', 16, 'charm', { turns: 2, chance: 0.45, range: 'all', desc: 'Every foe dances to the strings.' }); D('Grand Guignol', 'A', 28, 'magic', { base: 200, range: 'all', status: 'delusion', desc: 'The last act of a puppet play.' });
  // --- Dancer
  D('Sword Dance', 'F', 3, 'epa', { add: 18, mult: 1.2, desc: 'A dance with a blade.' }); D('Fan Dance', 'A', 4, 'buff', { stat: 'agi', amt: 0.35, range: 'all', desc: 'A fan dance: the line quickens.' });
  D('Veil Step', 'A', 5, 'buff', { stat: 'agi', amt: 0.6, desc: 'Step behind a veil.' }); D('Whirling Blades', 'F', 10, 'multi', { hits: 4, add: 22, mult: 0.95, desc: 'Blades in a whirl.' });
  D('Rain Dance', 'W', 9, 'heal', { base: 110, range: 'all', desc: 'A dance that calls the rain down on the party.' }); D('Trance', 'A', 8, 'song', { stat: 'atk', amt: 0.25, stat2: 'agi', amt3: 0.25, desc: 'A trance the whole line falls into.' });
  D('Kagura', 'A', 26, 'magic', { base: 190, range: 'all', desc: 'The dance of the gods.' });
  // --- Lemurian / Chronos
  D('Tidal Wave', 'W', 8, 'magic', { base: 60, range: 5, desc: 'A wave over the foes.' }); D('Stasis', 'W', 7, 'stasis', { turns: 2, chance: 0.6, desc: 'Hold a foe outside of time for two turns.' });
  D('Undertow', 'W', 11, 'magic', { base: 85, range: 3, status: 'stun', statusChance: 0.3, desc: 'The undertow drags the foes down.' }); D('Time Lock', 'W', 15, 'stasis', { turns: 2, chance: 0.45, range: 3, desc: 'Hold three foes outside of time.' });
  D('Leviathan', 'W', 30, 'magic', { base: 230, range: 'all', desc: 'The great beast of the deep rises.' });
  D('Haste', 'A', 6, 'buff', { stat: 'agi', amt: 0.5, range: 'all', desc: 'The party moves before time does.' }); D('Rewind', 'W', 12, 'reviveall', { amt: 0.5, desc: 'Turn the fallen back to a moment before.' });
  D('Hourglass', 'W', 14, 'magic', { base: 110, range: 5, desc: 'The sands run out over the foes.' }); D('Entropy', 'W', 22, 'prismatic', { base: 200, range: 'all', desc: 'Everything wears down at last.' });
  D('End of Days', 'W', 42, 'prismatic', { base: 330, range: 'all', desc: 'The last day, for every foe.' });
  // --- Shaman
  D('Totem of Stone', 'E', 5, 'buff', { stat: 'def', amt: 0.35, range: 'all', desc: 'A totem that hardens the line.' }); D('Spirit Lash', 'A', 6, 'magic', { base: 50, range: 1, status: 'haunt', statusChance: 0.5, desc: 'A lash of spirit that haunts.' });
  D('Totem of Flame', 'F', 8, 'buff', { stat: 'atk', amt: 0.35, range: 'all', desc: 'A totem that fires the line.' }); D('Ancestor Call', 'A', 18, 'reviveall', { amt: 0.6, desc: 'The ancestors send the fallen back.' });
  D('Great Spirit', 'A', 30, 'magic', { base: 220, range: 'all', desc: 'The great spirit walks through the foes.' });
  // --- Alchemist
  D('Acid Flask', 'W', 3, 'magic', { base: 35, range: 1, status: 'poison', statusChance: 0.5, desc: 'A flask of acid.' }); D('Elixir Toss', 'W', 6, 'heal', { base: 100, range: 'all', desc: 'A vial thrown over the party.' });
  D('Volatile Mix', 'F', 8, 'prismatic', { base: 70, range: 3, desc: 'A mix that finds each foe\'s weakness.' }); D('Quicksilver', 'W', 7, 'buff', { stat: 'agi', amt: 0.45, range: 'all', desc: 'Mercury in the veins.' });
  D('Philosopher Stone', 'E', 12, 'song', { stat: 'def', amt: 0.3, stat2: 'atk', amt3: 0.2, desc: 'The stone that perfects the line.' }); D('Magnum Opus', 'F', 32, 'prismatic', { base: 260, range: 'all', desc: 'The great work, finished on the foes.' });
  // --- Oracle
  D('Foresight', 'A', 5, 'buff', { stat: 'agi', amt: 0.5, range: 'all', desc: 'See the blows before they land.' }); D('Doom Prophecy', 'A', 10, 'doom', { turns: 3, pct: 0.45, desc: 'Foretell a foe\'s end: three turns.' });
  D('Fated Blow', 'A', 12, 'epa', { add: 60, mult: 1.3, crit: 0.5, desc: 'A blow that was always going to land.' }); D('Judgement', 'A', 36, 'prismatic', { base: 300, range: 'all', desc: 'The judgement that was written.' });
  // --- Warlord
  D('Frost Axe', 'W', 4, 'epa', { add: 25, mult: 1.2, desc: 'An axe rimed with frost.' }); D('War Cry', 'F', 5, 'buff', { stat: 'atk', amt: 0.3, range: 'all', desc: 'A cry from the north.' });
  D('Glacier Crush', 'W', 10, 'epa', { add: 50, mult: 1.3, status: 'stun', statusChance: 0.4, desc: 'A glacier brought down on a foe.' }); D('Blaze Edge', 'F', 9, 'epa', { add: 45, mult: 1.3, desc: 'An edge on fire.' });
  D('Frostbite', 'W', 12, 'magic', { base: 90, range: 3, status: 'stun', statusChance: 0.4, desc: 'Frost that bites to the bone.' }); D('Rime Armor', 'W', 8, 'buff', { stat: 'def', amt: 0.45, range: 'all', desc: 'Armor of rime for all.' });
  D('Fimbulwinter', 'W', 34, 'magic', { base: 250, range: 'all', status: 'stun', statusChance: 0.3, desc: 'The winter that ends the world.' });
  // --- Dragon
  D('Dragon Breath', 'F', 9, 'prismatic', { base: 65, range: 3, desc: 'Breath of whatever the foes fear.' }); D('Wing Buffet', 'A', 6, 'magic', { base: 45, range: 5, desc: 'A buffet of wings over the foes.' });
  D('Scale Armor', 'E', 8, 'buff', { stat: 'def', amt: 0.5, range: 'all', desc: 'Scales on every back.' }); D('Dragon Claw', 'F', 12, 'epa', { add: 70, mult: 1.4, desc: 'A claw that rends.' });
  D('Draconic Fury', 'F', 36, 'prismatic', { base: 300, range: 'all', desc: 'The fury of the dragon on every foe.' });
  // --- Void
  D('Oblivion', 'A', 12, 'void', { base: 110, range: 1, desc: 'Damage from the nothing: no resistance answers it.' }); D('Nullify', 'A', 8, 'break', { range: 'all', desc: 'Unmake every bonus the foes hold.' });
  D('Void Step', 'A', 7, 'buff', { stat: 'agi', amt: 0.6, range: 'all', desc: 'Step outside of the world.' }); D('Event Horizon', 'A', 24, 'void', { base: 190, range: 5, desc: 'The edge past which nothing returns.' });
  D('Unmaking', 'A', 36, 'void', { base: 280, range: 'all', desc: 'Unmake the foes.' }); D('Heat Death', 'A', 55, 'void', { base: 420, range: 'all', desc: 'The last thing that happens.' });
}
