# Class-changing items (2026-09-19)

The originals had three (Mysterious Card, Trainer's Whip, Tomegathericon). This remake has twenty-five: the three plus
twenty-two new ones, each a four-tier line that climbs on Djinn of the OTHER three elements (0/1/2/3 of each; the
wearer's own element does not count - `determineClass` in `js/data/classes.js`, fixed 2026-09-19 so the tiers are
actually reachable). Data: `js/data/class_items.js` (items, classes, learnsets, 148 new Psynergy). Machinery:
`js/game/class_ext.js` (field mechanics, battle types, rivals, foes). Places: `js/maps/class_trials_gs1.js`,
`js/maps/class_trials_tla.js`. The runner collects every one (`runner/plan_gs1.js`, `runner/plan_tla.js`; a catch-up
block before the Halls of Time re-visits any TLA item a run passed by).

## Golden Sun

| Item | Line | Where / how | Field Psynergy | Level |
|---|---|---|---|---|
| Hunter's Talisman | Tracker > Hunter > Stalker > Beastbane | Bilibin Hunting Grounds (door at the top of Kolima Forest N, 27,2): Tusked Mauler | Grapple: a line to a hook post over a gap | ~L10 |
| Wolf Fang Pendant | Wolfling > Werewolf > Alpha > Fenrir | Mogall Den (door in Mogall Forest 14,4): Dire Wolf Matriarch + Dread Hound | Prowl: four legs, fast, through low tunnels | ~L13 |
| Bard's Lyre | Minstrel > Troubadour > Virtuoso > Maestro | Dorian in Kalay's inn (12,2), a duel | Serenade: a sleeping beast wanders off | ~L14 |
| Miner's Lantern | Prospector > Digger > Deep Delver > Mine Lord | Altin Deep Shaft (door in Altin mine 3 at 10,5), dark: Ore Golem | Lantern: lights a dark floor | ~L17 |
| Assassin's Mask | Shade > Assassin > Nightblade > Death's Hand | Silk Road Shrine (door in Xian 23,3; Force on the beam): Shadow Assassin | Shadow Step: through iron bars for a while | ~L18 |
| Monk's Prayer Beads | Novice > Monk > Abbot > Enlightened | Master Poi at Lama Temple (12,2), after Hama | Stillness: everything on a floor holds still | ~L20 |
| Gladiator's Emblem | Gladiator > Champion of Colosso > Arena Lord > Colossus | Brannock in Tolbi's yard (26,4), after Colosso; iron crate on a chest (23,5) | Shove: iron crates | ~L22 |
| Thief's Bandana | Cutpurse > Rogue > Phantom Thief > Master Thief | Tolo in Lunpa's inn (10,2); locked chest beside him | Lockpick: locked chests | ~L23 |
| Engineer's Goggles | Tinker > Engineer > Machinist > Artificer | Babi's Workshop (stair in Lalivero reservoir 8,3): Clockwork Sentinel | Repair: broken bridges and gears | ~L26 |
| Crown of Sol | Regent > Sovereign > Sol Regent > Radiant King | Heart of Aleph (sealed door in Sol Sanctum's statue chamber 4,4, all 28 Djinn; Grapple over the chasm): Colossus of Sol, 10000 HP - harder than Deadbeard, won at L31 | - | L31+ |

## The Lost Age

| Item | Line | Where / how | Field Psynergy | Level |
|---|---|---|---|---|
| Nomad's Veil | Nomad > Caravaneer > Sand Sage > Dune Lord | Scorpion Den (door in Yampi 3 at 9,1; Pound the pillar): Scorpion Queen | Sandstorm: blows a sand drift away | ~L12 |
| Puppeteer's Strings | Puppeteer > Marionettist > Dollmaster > Grand Manipulator | Pupetta in Madra's first house (after Cyclone); her theatre below | Puppet: walk a doll (across a pit) onto a switch | ~L17 |
| Pirate's Bandana | Deckhand > Corsair > Sea Wolf > Dread Captain | Redbeard at Champa's dock (25,35), after the Trident | Dive: under the water from a dive spot | ~L26 |
| Dancer's Anklet | Dancer > Performer > Ceremonial Dancer > Kagura Master | Susa at Izumo (24,5), after the Serpent; three chimes (20,5 21,5 27,5) | Rhythm: rings a chime (all three: Kikuichimonji) | ~L25 |
| Lemurian Circlet | Tide Initiate > Tide Priest > Sea Sage > Hydros' Heir | Sunken Vault (stair in Lemuria 9,2; pillar into the channel): Leviathan Spawn | Ebb: draws the tide out of a room for a while | ~L28 |
| Shaman's Drum | Chanter > Spiritcaller > Totem Master > Great Spirit | Whitefeather in Shaman Village (18,8), after Trial Road; a spirit by the hut | Spirit Sight: see and speak to the dead | ~L33 |
| Mad Alchemist's Vial | Tinkerer > Chemist > Transmuter > Philosopher King | Vorn in Loho's fifth house; two lead statues (800 coins each) | Transmute: lead to gold, stone to a crate | ~L36 |
| Oracle's Eye | Augur > Oracle > Prophet > Fate Weaver | Anemos Observatory (door in Contigo 12,1 after Jupiter; Cyclone on the growth): Hama's Shade | Scry: uncovers everything hidden on a floor | ~L36 |
| Warlord's Helm | Frostborn > Ice Warrior > Winter Warlord > Frost Titan | Kaldr in Prox's eighth house, after Puelle | Warmth: through a blizzard for a while | ~L40 |
| Chronos Sigil | Timekeeper > Chronomancer > Epoch Sage > Eternal | Halls of Time (Dive at the Sea of Time islet's shore): Eye of Chronos | - | L50+ |
| Dragon Scale Amulet | Wyrmling > Drake Knight > Dragon Knight > Dragon Sovereign | Frostwyrm Hollow (door in Mars LH exterior 17,5; Warmth through the blizzard): Elder Frost Dragon 16500 HP, t2, 900 PP - harder than Dullahan (the user's rule: the superbosses stay at full strength; the runner levels until it can take them) | - | L52+ |
| Void Mantle | Voidwalker > Abyss Knight > Oblivion > Worldender | Weyard's Edge (crack in Atteka Cavern 16,4, once the wyrm has fallen): Void Sovereign 22000 HP, 999 PP, void damage - the hardest fight, kept at full strength | - | L55+ |

## New mechanics

Field (`ClassExt.field`, hooked in `FieldScene.usePsy`): Lockpick, Grapple, Lantern, Prowl, Serenade, Stillness,
Shadow Step, Repair, Shove, Dive, Sandstorm, Puppet (arrow keys walk the doll; X lets go), Rhythm, Ebb, Spirit Sight,
Transmute, Scry, Warmth. Object kinds + helpers: `ClassExt.lockedChest/hookpost/tunnel/sleeper/bars/brokenBridge/
brokenGear/heavyCrate/diveSpot/sandDrift/doll/floorSwitch/chime/tide/leadStatue/blizzard/spirit`. Tiles in the
CLASSITEMS hot block of `js/core/tiles.js`.

Battle (`ClassExt.battle`, hooked in `BattleScene.castPsy`): steal, multi (several hits), song (buff us / debuff them),
stance (counter for N turns), charm (a foe strikes its own side), stasis (skip turns), assassinate (instant KO chance,
never on bosses), doom (a mark that pays after N turns), prismatic (the element the target fears), void (no
resistance answers; x0.85 from a foe), reviveall. `beforeAct`/`endTurn` hooks run the marks and holds. Epa Psynergy
gained crit/pierce/drain fields.

Teachers' crews (`ClassExt.crew`, `ClassExt.crewBout`, `ClassExt.CREWS`; user rule 2026-09-19): every human teacher
fights with a full party of four - three companions scaled from the teacher's own row (fighters at 60% HP / 90% attack
with a technique, a healer at 50% HP with Ply Well / Cure Well / Restore, or a caster with the element's Psynergy),
each with a townsfolk look, standing beside the teacher on the field for the bout and gone after it. Tolo: two
Cutpurses and a Fence; Dorian: two Minstrels and a Dancer; Master Poi: two Monks and an Acolyte; Brannock: two
Gladiators and an Arena Medic; Pupetta: two Troupe Players and a Stagehand; Redbeard: two Sea Dogs and a Bosun; Susa:
two Izumo Warriors and a Shrine Maiden; Whitefeather: two Shaman Hunters and a Shaman Elder; Vorn: two Apprentices and
a Homunculus; Kaldr: two Prox Warriors and a Prox Mystic. The monster bosses fight alone as before.

Rivals (`ClassExt.rival`): Adepts fought as foes with the party's own mechanics - Isaac's crew at the reunion
(`ST.crewAsFoes`): a real Character behind each enemy shell, at the level of the player's strongest Adept, 7 Djinn of
their own element each (top classes, the four great summons), their GS1 gear, a bag of items; they decide with the
party's tactician through a mirror and act through the battle's own code (Psynergy, Djinn unleashes, summons with a
gauge, items). Their fight level persists when they join. Music: the Saturos and Menardi battle theme.

Runner: `classItems()` covers every class item; `wearClassItemFor(name)` puts one on for a field Psynergy;
`shedClassItem`/`djinnForPsy` take one off (with Djinn) when the plain class is needed; `pickSummons()` re-picks every
member's summon after Djinn move; ops `teacher` (a bout that can be lost, up to 3 tries), `puppet`, `unless`,
`ledge` (a whirlwind-swept ledge crossed notch to notch, each dash only when the wind cannot be back in time -
Jupiter Lighthouse's windward ledge).

## The post-game (2026-09-19, the user's design; `js/game/story_post.js`, `js/maps/postgame.js`)

- The Colossus of Sol now has its scene: the Wise One appears in the Heart of Aleph, names the Colossus as one of the
  sanctum's great guardians, and tells why Saturos and Menardi failed the first time (the guardians woke, the mountain
  answered - the storm over Vale).
- Once the credits have rolled and control is back, the Wise One speaks to the whole party of nine at Prox: Alex took
  most of the Golden Sun; he is sealed under the sunken summit of Mt. Aleph; the sanctum's eastern way is open.
- **Alex** (Mt. Aleph - The Sunken Summit, through the east door of the chamber of statues): fought like Isaac's crew (ClassExt.rival): a real level-50 Angel with his gear, his nine
  Alchemy-made Djinn (Azoth, Aqua Regia, Quicksilver, Tincture, Vitriol, Nimbus, Alkali, Panacea, Ouroboros), the
  party's summons and a bag; his own HP (no boss HP), two actions a round, and Blink as a passive (30% to step out
  of any blow, 60% against a summon). Beaten, Mia talks
  him round: he joins at the party's best level with end-game gear (Tisiphone Edge, Xylion Armor, Cosmos Shield, Crown
  of Glory, Ouroboros Ring - 220 HP and 14 PP back every turn, plus the Crown's 8 PP) and his own Psynergy - Blink (agility in battle; on the field a step over a gap, wall or water,
  up to four paces), Phase Strike, Cosmic Ply. Ten in the party from then on (the menus fit ten).
- **The Wise One** (the Heart of Aleph, where the Colossus stood, once Alex has joined): the strongest fight there is
  (28000 HP, Judgment Eye / Wrath of Sol / Charon / Stone Gaze / Sanctum Ward / Djinn Storm). He gives the **Eyes of
  Alchemy** (key item) for a win - or for a loss in which the party dealt him over 15,000 damage (the user's rule); a
  true win can still be gone back for afterwards.
- **King Hydros** and the Eyes: the history of Alchemy - it came from the Cradle, another world of the four powers
  before they were divided; the beings that crossed over are what Alchemy, Psynergy and the Djinn came from; the
  lighthouses stand where they crossed; the Wise One was the first to cross and the only one who stayed whole. On a
  yes the Eyes open a lasting portal in his chamber (it stays; the shore's swirl brings the party back any time).
- **The Cradle**: one land, no towns, nothing roaming. A sunless world, dark in colour (the CRADLE block of tiles.js:
  violet ground worked with runes, black ichor, dull embers, void cracks, glass shards, violet-black cliffs). Six
  people trapped there over the centuries (a Lemurian sailor, a Tolbi cartographer, a Prox hunter, a Champa corsair,
  an Anemos priest, a girl from Vault) each warn of what is ahead. Four grounds - the Grove of Stone (Terragon, Venus;
  Lift the boulders), the Deep (Thalassa, Mercury; Frost the puddles across the water), the Forge (Ignis, Mars; Move
  the pillar), the Spire (Zephyros, Jupiter; Whirlwind the growth) - each ~24000 HP, each leaving a relic (Terra Band,
  Tide Ring, Ember Seal, Gale Charm). The Heart opens once all four are met: **Alkahest**, the first Alchemist (32000
  HP, Prima Materia / Element Storm / Charon / Transmutation / Cosmic Ply / Djinn Storm); it leaves the Alkahest Crown
  and the Philosopher's Stone. The runner does all of it after the credits (plan_tla.js's last section).

