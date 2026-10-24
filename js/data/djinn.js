// ---------- Djinn database: all 72 Djinn (28 from Golden Sun + 44 from The Lost Age) ----------
// el: 0 Venus, 1 Mercury, 2 Mars, 3 Jupiter. boost: [hp,pp,atk,def,agi,lck]
// fx: battle skill. kinds: epa {add,mult}, heal{pct}, revive{pct}, buffAll{stat,amt}, shield{pct}, status{s}, cure, pp{pct}, special
// Djinn are always set (stats/class); their skill is cast from the Psynergy menu and then rests for a few turns.
'use strict';
const DJINN = {};
// Turns a Djinni's skill needs before it can be used again (the Djinni itself stays set)
function djinnCooldown(name) {
  const fx = DJINN[name].fx, k = fx.k;
  if (k === 'epa') return (fx.status || fx.statusAll || fx.debuff || fx.drain || fx.pierce || fx.flee || fx.doubleChance || fx.mult >= 1.6 || fx.add >= 60) ? 3 : 2;
  return { heal: 3, healAll: 4, revive: 4, reviveAll: 6, buffAll: 4, debuffAll: 4, shield: 4, immune: 5, kite: 5, counter: 3, lull: 6, status: 3, statusAll: 4, cureAll: 3, pp: 4, ppAll: 5, ppdmg: 3, meld: 3, mold: 3, eddy: 4 }[k] || 3;
}
function defDjinn(name, el, boost, fx, desc, game) { DJINN[name] = { name, el, boost, fx, desc, game }; }
const DJ = defDjinn;
// ---------- VENUS ----------
DJ('Flint', 0, [8, 4, 3, 0, 0, 0], { k: 'epa', add: 0, mult: 1.6 }, 'Attack with a powerful blow.', 1);
DJ('Granite', 0, [9, 0, 0, 2, 2, 1], { k: 'shield', pct: 0.5 }, 'Halve damage the party takes this turn.', 1);
DJ('Quartz', 0, [10, 3, 0, 0, 3, 0], { k: 'revive', pct: 0.5 }, 'Revive a downed ally with 50% HP.', 1);
DJ('Vine', 0, [12, 4, 0, 3, 0, 1], { k: 'debuffAll', stat: 'agi', amt: -0.5 }, "Drop all enemies' Agility.", 1);
DJ('Sap', 0, [19, 0, 3, 0, 0, 1], { k: 'epa', add: 50, mult: 1, drain: 0.5 }, 'Attack and absorb half the damage as HP.', 1);
DJ('Ground', 0, [9, 3, 0, 0, 3, 0], { k: 'status', s: 'stun' }, 'Paralyze an enemy.', 1);
DJ('Bane', 0, [12, 0, 4, 0, 0, 0], { k: 'epa', add: 60, mult: 1, status: 'venom' }, 'Attack and inflict deadly poison.', 1);
DJ('Echo', 0, [9, 4, 3, 0, 0, 0], { k: 'epa', add: 0, mult: 1.6 }, 'Attack with a double strike.', 2);
DJ('Iron', 0, [11, 0, 0, 2, 3, 0], { k: 'buffAll', stat: 'def', amt: 0.25 }, "Raise the party's Defense.", 2);
DJ('Steel', 0, [9, 0, 4, 2, 0, 1], { k: 'epa', add: 0, mult: 1.3, drain: 0.5 }, 'Attack and absorb half the damage.', 2);
DJ('Mud', 0, [10, 4, 0, 0, 3, 0], { k: 'debuffAll', stat: 'agi', amt: -0.5 }, "Drop all enemies' Agility.", 2);
DJ('Flower', 0, [12, 4, 0, 0, 0, 0], { k: 'healAll', pct: 0.3 }, "Restore 30% of the party's HP.", 2);
DJ('Meld', 0, [9, 0, 0, 0, 9, 1], { k: 'meld' }, 'Team up with your strongest ally to strike.', 2);
DJ('Petra', 0, [11, 0, 0, 3, 0, 0], { k: 'status', s: 'stun' }, 'Stop an enemy in its tracks.', 2);
DJ('Salt', 0, [9, 5, 0, 0, 0, 1], { k: 'cureAll' }, "Cure the party's ailments.", 2);
DJ('Geode', 0, [12, 0, 6, 0, 0, 0], { k: 'epa', add: 0, mult: 1.9 }, 'Attack with a massive blow.', 2);
DJ('Mold', 0, [8, 0, 4, 0, 2, 1], { k: 'mold', add: 80 }, 'Force an enemy to attack its ally.', 2);
DJ('Crystal', 0, [10, 5, 0, 2, 0, 0], { k: 'healAll', pct: 0.5 }, "Restore 50% of the party's HP.", 2);
// ---------- MERCURY ----------
DJ('Fizz', 1, [9, 4, 0, 3, 0, 0], { k: 'heal', pct: 0.6 }, "Restore 60% of an ally's HP.", 1);
DJ('Sleet', 1, [12, 0, 3, 0, 0, 1], { k: 'epa', add: 30, mult: 1, debuff: { stat: 'atk', amt: -0.25 } }, "Attack and drop the enemy's Attack.", 1);
DJ('Mist', 1, [11, 0, 4, 0, 0, 0], { k: 'epa', add: 0, mult: 1.3, status: 'sleep' }, 'Attack and put the enemy to sleep.', 1);
DJ('Spritz', 1, [8, 4, 0, 0, 3, 0], { k: 'healAll', pct: 0.3 }, "Restore 30% of the party's HP.", 1);
DJ('Hail', 1, [9, 0, 4, 0, 0, 1], { k: 'epa', add: 40, mult: 1, debuff: { stat: 'def', amt: -0.25 } }, "Attack and drop the enemy's Defense.", 1);
DJ('Tonic', 1, [8, 3, 0, 2, 0, 2], { k: 'cureAll' }, "Cure the party's ailments.", 1);
DJ('Dew', 1, [13, 4, 0, 0, 4, 0], { k: 'revive', pct: 0.8 }, 'Revive a downed ally with 80% HP.', 1);
DJ('Fog', 1, [9, 0, 0, 2, 2, 1], { k: 'epa', add: 30, mult: 1, status: 'delusion' }, 'Attack and delude the enemy.', 2);
DJ('Sour', 1, [8, 4, 3, 0, 0, 0], { k: 'epa', add: 0, mult: 1.5, debuff: { stat: 'res', amt: -40 } }, "Attack and drop the enemy's Resistance.", 2);
DJ('Spring', 1, [11, 5, 0, 0, 0, 0], { k: 'heal', pct: 0.7 }, "Restore 70% of an ally's HP.", 2);
DJ('Shade', 1, [9, 0, 0, 3, 0, 2], { k: 'shield', pct: 0.6 }, 'Reduce damage the party takes by 60%.', 2);
DJ('Chill', 1, [10, 3, 0, 2, 0, 0], { k: 'epa', add: 40, mult: 1, debuff: { stat: 'def', amt: -0.25 } }, "Attack and drop the enemy's Defense.", 2);
DJ('Steam', 1, [10, 0, 5, 0, 0, 0], { k: 'buffAll', stat: 'res', amt: 40 }, "Raise the party's Resistance.", 2);
DJ('Rime', 1, [10, 6, 0, 0, 0, 0], { k: 'status', s: 'seal' }, "Seal an enemy's Psynergy.", 2);
DJ('Gel', 1, [9, 0, 5, 0, 2, 0], { k: 'epa', add: 0, mult: 1.5, debuff: { stat: 'atk', amt: -0.25 } }, "Attack and drop the enemy's Attack.", 2);
DJ('Eddy', 1, [9, 0, 0, 0, 3, 2], { k: 'eddy' }, "Hasten the party's resting Djinn skills.", 2);
DJ('Balm', 1, [13, 4, 0, 0, 0, 0], { k: 'reviveAll', pct: 0.6 }, 'Revive all downed allies with 60% HP.', 2);
DJ('Serac', 1, [12, 0, 3, 0, 0, 0], { k: 'epa', add: 70, mult: 1, status: 'down', chance: 0.4 }, 'Attack and may fell the enemy instantly.', 2);
// ---------- MARS ----------
DJ('Forge', 2, [10, 0, 2, 0, 2, 2], { k: 'buffAll', stat: 'atk', amt: 0.25 }, "Raise the party's Attack.", 1);
DJ('Fever', 2, [8, 0, 3, 0, 2, 0], { k: 'epa', add: 30, mult: 1, status: 'delusion' }, 'Attack and delude the enemy.', 1);
DJ('Corona', 2, [12, 3, 0, 3, 0, 1], { k: 'buffAll', stat: 'def', amt: 0.25 }, "Raise the party's Defense.", 1);
DJ('Scorch', 2, [8, 0, 3, 0, 0, 0], { k: 'epa', add: 50, mult: 1, status: 'stun' }, 'Attack and stun the enemy.', 1);
DJ('Ember', 2, [9, 4, 0, 2, 2, 0], { k: 'ppAll', pct: 0.07 }, "Restore 7% of the party's PP.", 1);
DJ('Flash', 2, [14, 3, 0, 2, 0, 0], { k: 'shield', pct: 0.9 }, 'Reduce damage the party takes by 90%.', 1);
DJ('Torch', 2, [9, 0, 3, 0, 0, 0], { k: 'epa', add: 30, mult: 1, pierce: 0.5 }, "Attack, piercing half the enemy's Defense.", 1);
DJ('Cannon', 2, [10, 0, 3, 0, 0, 0], { k: 'epa', add: 40, mult: 1 }, 'Blast an enemy with a fiery cannon.', 2);
DJ('Spark', 2, [11, 6, 0, 0, 0, 0], { k: 'revive', pct: 0.6 }, 'Revive a downed ally with 60% HP.', 2);
DJ('Kindle', 2, [8, 0, 5, 0, 0, 1], { k: 'buffAll', stat: 'atk', amt: 0.25 }, "Raise the party's Attack.", 2);
DJ('Char', 2, [9, 0, 2, 0, 2, 1], { k: 'epa', add: 50, mult: 1, status: 'stun' }, 'Attack and stun the enemy.', 2);
DJ('Coal', 2, [11, 3, 0, 0, 3, 0], { k: 'buffAll', stat: 'agi', amt: 1.0 }, "Double the party's Agility.", 2);
DJ('Reflux', 2, [9, 0, 0, 3, 0, 2], { k: 'counter' }, 'Counter-attack enemies this turn.', 2);
DJ('Core', 2, [8, 0, 4, 2, 0, 0], { k: 'epa', add: 40, mult: 1, pierce: 0.5 }, "Attack, piercing half the enemy's Defense.", 2);
DJ('Tinder', 2, [14, 5, 0, 0, 0, 0], { k: 'revive', pct: 1.0 }, 'Revive a downed ally with full HP.', 2);
DJ('Shine', 2, [9, 0, 2, 3, 2, 0], { k: 'epa', add: 60, mult: 1, statusAll: 'delusion' }, 'Attack and delude all enemies.', 2);
DJ('Fury', 2, [14, 4, 0, 0, 0, 0], { k: 'epa', add: 70, mult: 1, status: 'haunt' }, 'Attack and haunt the enemy.', 2);
DJ('Fugue', 2, [11, 4, 0, 2, 0, 0], { k: 'ppdmg', amt: 18 }, "Damage all enemies' PP.", 2);
// ---------- JUPITER ----------
DJ('Gust', 3, [9, 0, 2, 0, 2, 0], { k: 'epa', add: 10, mult: 1, doubleChance: 0.5 }, 'Attack, sometimes for double damage.', 1);
DJ('Breeze', 3, [12, 5, 0, 2, 0, 1], { k: 'buffAll', stat: 'res', amt: 40 }, "Raise the party's Resistance.", 1);
DJ('Zephyr', 3, [11, 3, 0, 0, 2, 1], { k: 'buffAll', stat: 'agi', amt: 1.0 }, "Double the party's Agility.", 1);
DJ('Smog', 3, [9, 0, 3, 0, 0, 0], { k: 'epa', add: 60, mult: 1, status: 'delusion' }, 'Attack and delude the enemy.', 1);
DJ('Kite', 3, [8, 4, 0, 0, 3, 0], { k: 'kite' }, 'Let an ally act twice next turn.', 1);
DJ('Squall', 3, [10, 0, 5, 0, 0, 0], { k: 'epa', add: 0, mult: 1.4, status: 'stun' }, 'Attack and stun the enemy.', 1);
DJ('Luff', 3, [11, 5, 0, 2, 0, 1], { k: 'status', s: 'seal' }, "Seal an enemy's Psynergy.", 1);
DJ('Breath', 3, [9, 0, 0, 3, 4, 0], { k: 'heal', pct: 0.4 }, "Restore 40% of an ally's HP.", 2);
DJ('Blitz', 3, [10, 4, 3, 0, 0, 0], { k: 'epa', add: 30, mult: 1, status: 'stun' }, 'Attack and stun the enemy.', 2);
DJ('Ether', 3, [8, 4, 0, 0, 3, 2], { k: 'pp', pct: 0.3 }, "Restore 30% of an ally's PP.", 2);
DJ('Waft', 3, [11, 0, 4, 0, 0, 0], { k: 'epa', add: 40, mult: 1, status: 'sleep' }, 'Attack and put the enemy to sleep.', 2);
DJ('Haze', 3, [10, 0, 0, 2, 3, 2], { k: 'immune' }, 'Make an ally immune to damage this turn.', 2);
DJ('Wheeze', 3, [9, 3, 5, 0, 0, 0], { k: 'epa', add: 50, mult: 1, status: 'venom' }, 'Attack and inflict deadly poison.', 2);
DJ('Aroma', 3, [11, 0, 0, 0, 3, 2], { k: 'ppAll', pct: 0.1 }, "Restore 10% of the party's PP.", 2);
DJ('Whorl', 3, [12, 0, 3, 2, 0, 0], { k: 'epa', add: 40, mult: 1, status: 'down', chance: 0.3 }, 'Attack and may fell the enemy instantly.', 2);
DJ('Gasp', 3, [9, 4, 0, 0, 0, 0], { k: 'statusAll', s: 'curse' }, 'Curse all enemies with a countdown.', 2);
DJ('Lull', 3, [11, 6, 0, 0, 0, 0], { k: 'lull' }, 'End the current turn immediately.', 2);
DJ('Gale', 3, [10, 0, 0, 0, 5, 3], { k: 'epa', add: 60, mult: 1, flee: 0.4 }, 'Attack and may blow the enemy away.', 2);
// Order lists (in-game ordering by element)
const DJINN_ORDER = [
  ['Flint', 'Granite', 'Quartz', 'Vine', 'Sap', 'Ground', 'Bane', 'Echo', 'Iron', 'Steel', 'Mud', 'Flower', 'Meld', 'Petra', 'Salt', 'Geode', 'Mold', 'Crystal'],
  ['Fizz', 'Sleet', 'Mist', 'Spritz', 'Hail', 'Tonic', 'Dew', 'Fog', 'Sour', 'Spring', 'Shade', 'Chill', 'Steam', 'Rime', 'Gel', 'Eddy', 'Balm', 'Serac'],
  ['Forge', 'Fever', 'Corona', 'Scorch', 'Ember', 'Flash', 'Torch', 'Cannon', 'Spark', 'Kindle', 'Char', 'Coal', 'Reflux', 'Core', 'Tinder', 'Shine', 'Fury', 'Fugue'],
  ['Gust', 'Breeze', 'Zephyr', 'Smog', 'Kite', 'Squall', 'Luff', 'Breath', 'Blitz', 'Ether', 'Waft', 'Haze', 'Wheeze', 'Aroma', 'Whorl', 'Gasp', 'Lull', 'Gale']
];
