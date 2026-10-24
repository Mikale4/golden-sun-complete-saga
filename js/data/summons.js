// ---------- Summons: basic (per element, 1-4 Djinn) and combo tablets ----------
// req: [venus, mercury, mars, jupiter] standby Djinn required. base: added dmg, hp: % of target max HP per point
'use strict';
const SUMMONS = {};
function defSum(name, el, req, base, hpPct, o) { SUMMONS[name] = Object.assign({ name, el, req, base, hpPct, range: 'all', desc: '' }, o); }
const SM = defSum;
SM('Venus', 0, [1, 0, 0, 0], 30, 3, { desc: 'The spirit of earth strikes all foes.' });
SM('Ramses', 0, [2, 0, 0, 0], 60, 6, { desc: 'A colossal pharaoh crushes foes with stone fists.' });
SM('Cybele', 0, [3, 0, 0, 0], 120, 9, { desc: 'The earth mother tears the ground asunder.' });
SM('Judgment', 0, [4, 0, 0, 0], 240, 12, { desc: 'A winged knight unleashes a blast of judgment.' });
SM('Mercury', 1, [0, 1, 0, 0], 30, 3, { desc: 'The spirit of water floods all foes.' });
SM('Nereid', 1, [0, 2, 0, 0], 60, 6, { desc: 'A sea nymph shatters foes with an ice mirror.' });
SM('Neptune', 1, [0, 3, 0, 0], 120, 9, { desc: 'The sea god summons a crushing tidal wave.' });
SM('Boreas', 1, [0, 4, 0, 0], 240, 12, { desc: 'The north wind buries foes in an avalanche.' });
SM('Mars', 2, [0, 0, 1, 0], 30, 3, { desc: 'The spirit of fire scorches all foes.' });
SM('Kirin', 2, [0, 0, 2, 0], 60, 6, { desc: 'A fiery beast tramples the enemy.' });
SM('Tiamat', 2, [0, 0, 3, 0], 120, 9, { desc: 'A great dragon breathes searing flame.' });
SM('Meteor', 2, [0, 0, 4, 0], 240, 12, { desc: 'A meteor crashes down from the heavens.' });
SM('Jupiter', 3, [0, 0, 0, 1], 30, 3, { desc: 'The spirit of wind lashes all foes.' });
SM('Atalanta', 3, [0, 0, 0, 2], 60, 6, { desc: 'A huntress looses a rain of arrows.' });
SM('Procne', 3, [0, 0, 0, 3], 120, 9, { desc: 'A great bird cuts foes with its wings.' });
SM('Thor', 3, [0, 0, 0, 4], 240, 12, { desc: 'The thunder god hurls lightning.' });
// ---- Combo tablets (The Lost Age) ----
SM('Zagan', 0, [1, 0, 1, 0], 50, 6, { tablet: true, debuff: { stat: 'def', amt: -0.25 }, desc: 'A demon bull gores foes and weakens their defense.' });
SM('Megaera', 2, [0, 0, 1, 1], 40, 6, { tablet: true, buffParty: { stat: 'atk', amt: 0.125 }, desc: 'A fury boosts the party\'s attack.' });
SM('Flora', 3, [1, 0, 0, 2], 80, 9, { tablet: true, status: 'sleep', desc: 'A flower spirit lulls foes to sleep.' });
SM('Moloch', 1, [0, 2, 0, 1], 100, 9, { tablet: true, debuff: { stat: 'agi', amt: -0.5 }, desc: 'A frost beast slows foes with frigid breath.' });
SM('Ulysses', 1, [0, 2, 2, 0], 160, 12, { tablet: true, status: 'stun', desc: 'A hero fires arrows that stop foes cold.' });
SM('Haures', 0, [3, 0, 2, 0], 270, 15, { tablet: true, status: 'venom', desc: 'A demon lord rends foes with venomous claws.' });
SM('Eclipse', 3, [0, 2, 0, 3], 300, 15, { tablet: true, debuff: { stat: 'atk', amt: -0.25 }, desc: 'A great dragon eclipses the sun.' });
SM('Coatlicue', 1, [0, 3, 0, 3], 60, 0, { tablet: true, heal: true, regen: true, desc: 'The mother goddess restores and regenerates the party.' });
SM('Daedalus', 2, [3, 0, 4, 0], 100, 7, { tablet: true, missile: true, desc: 'A craftsman launches missiles that strike again next turn.' });
SM('Azul', 1, [3, 4, 0, 0], 330, 21, { tablet: true, status: 'stun', desc: 'A sea dragon crushes foes beneath the waves.' });
SM('Catastrophe', 3, [0, 0, 3, 5], 400, 24, { tablet: true, ppDrain: 0.1, desc: 'A herald of doom drains foes of Psynergy.' });
SM('Charon', 0, [8, 0, 0, 2], 500, 30, { tablet: true, status: 'down', chance: 0.3, desc: 'The ferryman of the dead claims the fallen.' });
SM('Iris', 2, [0, 4, 9, 0], 800, 40, { tablet: true, reviveAll: true, desc: 'The goddess of the rainbow revives and heals all.' });
const SUMMON_ORDER = ['Venus', 'Ramses', 'Cybele', 'Judgment', 'Mercury', 'Nereid', 'Neptune', 'Boreas', 'Mars', 'Kirin', 'Tiamat', 'Meteor', 'Jupiter', 'Atalanta', 'Procne', 'Thor', 'Zagan', 'Megaera', 'Flora', 'Moloch', 'Ulysses', 'Haures', 'Eclipse', 'Coatlicue', 'Daedalus', 'Azul', 'Catastrophe', 'Charon', 'Iris'];
