// Post-game leg: the fifteen Djinn the main run walked past, and the optional bosses.
// Runs from the 'post_game' checkpoint (the world is open, the Teleport Lapis works, every road is walkable).
// Each leg is wrapped in ['try'] so a locked door or an unreachable corner costs one entry, not the whole run.
window.PLAN_POSTGAME = [
  ['note', 'post-game: collecting the rest of the Djinn, then the optional bosses'],

  // ---- the Djinn left behind -------------------------------------------------------------------------------
  // Angara (Golden Sun's half of Weyard, revisited)
  ['try', ['enter', 'vale_cave']], ['try', ['explore']],           // Granite
  ['try', ['enter', 'kolima']], ['try', ['explore']],              // Scorch
  ['try', ['enter', 'mikasalla']], ['try', ['cast', 'Scoop', 8, 17, DIR.UP]],   // digging opens the tunnel under the village
  ['try', ['enter', 'mikasalla_tunnel']], ['try', ['explore']],    // Spark
  // Gondowan and Osenia
  ['try', ['enter', 'gabomba_heart']], ['try', ['explore']],       // Mud
  ['try', ['enter', 'taopo_cave']], ['try', ['explore']],          // Flower
  ['try', ['enter', 'shaman_east']], ['try', ['explore']],         // Aroma
  ['try', ['enter', 'trial_road_cave']], ['try', ['explore']],     // Gasp
  // Indra, Tundaria and the eastern sea
  ['try', ['enter', 'ankohl_inner']], ['try', ['explore']],        // Salt
  ['try', ['enter', 'tundaria']], ['try', ['explore']],            // Geode
  ['try', ['enter', 'aqua_rock_inner']], ['try', ['explore']],     // Steam
  ['try', ['enter', 'yampi']], ['try', ['explore']],               // Blitz
  // Atteka and the north
  ['try', ['enter', 'sw_atteka_islet']], ['try', ['explore']],     // Crystal
  ['try', ['enter', 'jupiter_lh_east']], ['try', ['explore']],     // Whorl
  ['try', ['enter', 'prox_house1']], ['try', ['explore']],         // Mist
  ['try', ['enter', 'mars_lh_side']], ['try', ['explore']],        // Fugue

  // everything the sweep turned up goes to Sunshine in Yallam - the best gear in the game is made, not found
  ['try', ['forge']],

  ['note', 'djinn gathered - rebuilding the party around them'],
  ['party'], ['ckpt', 'all_djinn'], ['shot', 'all_djinn'],

  // ---- optional bosses, weakest first ---------------------------------------------------------------------
  // No grinding on this ladder. ['boss'] measures whether a fight is actually winnable and stands down if it is not,
  // and the party gets stronger the way a player would rather than by pacing a field: better Djinn sets, better gear.
  ['party'], ['heal'],
  // the pink tornado at the end of Suhalla Desert: douse it and the Tempest Lizard steps out
  ['try', ['enter', 'suhalla_desert']], ['try', ['trig', 44, 20]], ['shot', 'tempest_lizard'],
  // and the tornado that rises in its place carries the party off to Crossbone Isle, as it always did - there is
  // no walking back from the isle, so the party goes in rested and geared
  ['heal'], ['try', ['trig', 44, 20]], ['try', ['explore']], ['shot', 'crossbone'],
  ['try', ['boss', 'STORY.deadbeard', ['Deadbeard']]],
  ['try', ['explore']],                                          // the isle's hoard, once its keeper is down
  ['ckpt', 'deadbeard'],

  ['party'],
  ['try', ['enter', 'yampi_cave']], ['try', ['explore']],
  ['try', ['boss', 'TLA.valukar', ['Valukar']]], ['ckpt', 'valukar'],
  ['try', ['enter', 'islet_cave']], ['try', ['explore']],
  ['try', ['boss', 'TLA.sentinel', ['Sentinel']]], ['ckpt', 'sentinel'],

  // the headless knight only stirs for a party carrying all seventy-two
  ['party'], ['heal'],
  ['try', ['enter', 'anemos']], ['try', ['explore']],
  ['try', ['boss', 'TLA.dullahan', ['Dullahan']]],
  ['shot', 'post_game_bosses'], ['ckpt', 'post_game_bosses'],
  ['note', 'post-game leg finished'],
];
'plan postgame loaded';
