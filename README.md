# Golden Sun: The Complete Saga

A single-player fan remake that joins **Golden Sun** and **Golden Sun: The Lost Age** into one continuous game.
Private practice project — not for distribution.

## How to run

Option A (recommended, avoids browser caching while you tinker):

```bash
python serve.py
```

then open <http://localhost:8765> in Chrome/Edge/Firefox.

Option B: double-click `index.html` (works offline; no server needed).

The game renders at the GBA's 240×160 and integer-scales to your window. Press **F** for fullscreen.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Move, navigate menus |
| Z / Enter | Confirm, talk, open chests, examine |
| X / Esc | Cancel; on the field opens the main menu (Psynergy, Djinn, Items, Equip, Status, Summon, Save, Party) |
| C | Field Psynergy menu (Move, Frost, Growth, Whirlwind, Reveal, Lash, Scoop, …); inside the main menu, next character |
| A / S | Quick Psynergy: with the field Psynergy menu open, press A or S on a Psynergy to bind it to that key; on the field, A or S then casts it straight away. The bound Psynergy shows as `[A]`/`[S]` in the menu and in the corner of the screen |
| F | Fullscreen |
| M | Mute music |

A gamepad also works (D-pad/left stick, A/X = confirm, B = cancel, Y/RB = Psynergy, LB/RB = previous/next character in menus, Start/Select = menu).

## The journey

1. **Golden Sun** — the prologue in Vale, Sol Sanctum, the pursuit of Saturos and Menardi across Angara and Gondowan, Mercury and Venus Lighthouses.
2. **The Lost Age** — after the Venus Lighthouse finale the game continues *seamlessly* as Felix, Jenna and Sheba on Idejima. Isaac's party (levels, Djinn, equipment, inventory) is carried over and rejoins at Jupiter Lighthouse.
3. Mars Lighthouse, the Doom Dragon, and the ending in Vale. Optional post-Lemuria content: Star Magician, Sentinel, Valukar, Dullahan, Anemos Sanctum, the trading quest, and all 72 Djinn / 29 summons.

You can also pick **Start from The Lost Age** on the title screen to begin at Idejima with a default Lost Age party.

## Saving

The main menu (X) has **Save**. There is one manual save slot stored in the browser's localStorage, plus an **autosave** written silently every time you enter a town, house or dungeon map (not on the world map). **Continue** on the title screen loads whichever of the two is newer. Sanctums revive downed party members and cure curses; inns restore HP/PP, and HP/PP also trickle back slowly as you walk.

## Tips

* Djinn: every Djinni you hold is always set - it raises stats and shapes your class. Each Djinni's battle skill appears at the bottom of its owner's Psynergy list in battle; skills cost no PP but rest for 2-6 turns after use (the Djinni itself stays set).
* **The Camp** (new to this remake): once all eight Adepts travel together they raise a camp north of Contigo, marked on the world map. The others walk about it freely, the fire is a free rest, and five tents cover what the originals made you guess at - **Formation** (who fights), the **Djinn Tent** (try any Djinn set on any Adept with a live class and stat preview, or press R for the strongest set the party's Djinn allow), the **Armoury** (try owned gear with stat deltas and see how far the others would benefit), the **Summon Circle** (choose each Adept's limit-break summon), and **Training** (send the reserve out to train as you travel - they cannot pass your strongest fighter's level).
* Reveal uncovers hidden chests: 34 are buried across both halves (dungeons, lighthouses, the optional caves), invisible until you cast it. Psynergy stones dotted around dungeons fully restore HP and PP.
* Lucky Medal fountains in Tolbi and Lemuria: a power meter swings, and where the medal lands sets the prize - the centre holds the best gear (Kikuichimonji, Asura's Armor, Warrior's Helm at Tolbi; Muramasa, Aegis Shield, Cleric's Ring, Dragon Helm at Lemuria).
* The Lucky Wheel in Tolbi trades Game Tickets for prizes up to an Assassin Blade or Lucky Cap. Shopkeepers hand out a ticket now and then when you spend enough with them.
* Auto: the last entry in the battle command menu hands the whole party to the game's tactician (heals, revives, Djinn skills, ready summons, strongest attacks) for this and every following turn; press X while it runs to take control back at the next turn.
* Summons are limit breaks: each character picks one summon in the Summon menu (from those their own Djinn can power - e.g. three Mars Djinn unlock Tiamat). Taking damage fills the summon gauge under their HP; when it is full the Summon command lights up and unleashes the chosen summon without touching your Djinn. No Djinn, no summon.
* Field puzzles: push pillars into pits/water to make bridges, Frost puddles to make ice pillars, Growth on sprouts, Whirlwind on vines, Lash on ropes, Burst on cracks, Parch on pools, Scoop on soft ground, Reveal for hidden paths/items.
* Retreat gets you out of a dungeon; Avoid reduces encounters.
* Random encounters scale by region on the world map; if an area feels tough, explore nearby towns for better gear or fight a little first.

## Project layout

* `js/core` — engine (canvas, input, audio synth, fonts, procedural sprites/tiles, UI)
* `js/data` — enemies, items, Psynergy, Djinn, summons, classes, characters, shops (from the reference guides)
* `js/maps` — map DSL and every town/dungeon/world map of both games
* `js/game` — party/battle/field/menu/shop/title scenes and the story scripts (`story_gs1.js`, `story_tla.js`)
* `runner/` — an autonomous playthrough bot used to test the whole game (see `runner/README.md`)
