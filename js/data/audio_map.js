// ---------- The real soundtrack: which recording plays for what ----------
// The engine asks for music by a short name ('town', 'boss', 'lighthouse'). Each name maps to a file here - one file,
// or a pair keyed by which half of the saga is playing. Maps that had a song of their own in the originals get it
// back through MAP_MUSIC; bosses with their own theme through BOSS_MUSIC. Placements follow the track guide in
// `reference game mechanics/music.htm` (its track N is file N+1 in audio/bgm), which trumps the file names where the
// two disagree. Nothing is synthesized: a name with no file here is silent.
'use strict';

const BGM_DIR = 'audio/bgm/', SFX_DIR = 'audio/sfx/';

const SONG_FILES = {
  // ---- the names the engine already uses
  title: '41 The Title Screen.mp3',
  loadscreen: '03 Main Menu.mp3',
  vale: '70 Vale And Vault.mp3',
  town: { gs1: '71 City Theme.mp3', tla: '17 Quiet City Theme.mp3' },
  overworld: { gs1: '91 World Map.mp3', tla: '43 World Map 1.mp3' },
  overworld2: '44 World Map 2.mp3',
  battle: { gs1: '93 Enemy Battle.mp3', tla: '49 Enemy Battle.mp3' },
  gsbattle: '93 Enemy Battle.mp3',
  boss: { gs1: '95 Boss Battle.mp3', tla: '51 Boss Battle.mp3' },
  victory: '56 Fanfare.mp3',
  gameover: '57 Game Over.mp3',
  dungeon: '84 Cave Theme.mp3',
  lighthouse: '04 Lighthouse Theme.mp3',
  sad: { gs1: '62 Doom Dragon Slain.mp3', tla: '12 Sad Theme.mp3' },
  storm: "83 Lunpa's Hideout.mp3",   // the night of the storm over Vale, as in the original's prologue
  villain: '59 Villain Theme.mp3',      // Saturos and Menardi (and the other villains) whenever they are on screen
  trouble: '40 Trouble Brewing.mp3',    // the thieves' town and other bad company
  foreboding: '59 Villain Theme.mp3',
  danger: '61 Lighting The Beacons.mp3',
  sailing: '42 Sailing.mp3',
  lemuria: '16 Peaceful Lemuria.mp3',
  final: { gs1: '97 Fusion Dragon.mp3', tla: '55 Doom Dragon Battle.mp3' },
  ending: { gs1: '02 Main Theme.mp3', tla: '45 The Credits.mp3' },
  desert: '85 Deserts.mp3',
  snow: '60 Prox In Trouble.mp3',
  // ---- battles with a theme of their own
  bosshuman: '50 Boss Battle Human.mp3', seabattle: '52 Sailing Battle.mp3',
  saturos: '94 Battle With Saturos.mp3', saturosmenardi: '96 Saturos And Menardi Battle.mp3', fusiondragon: '97 Fusion Dragon.mp3',
  karstagatio: '53 Karst And Agatio Battle.mp3', flamedragons: '54 Flame Dragons.mp3', doomdragon: '55 Doom Dragon Battle.mp3', gsboss: '95 Boss Battle.mp3',
  // ---- places and moments
  sanctums: '80 The Sanctums.mp3', lhtop: '82 Sol Sanctum.mp3', solsanctum: '82 Sol Sanctum.mp3', castle: '73 Castle.mp3', sadtown: '72 Sad Town.mp3', prosperous: '71 City Theme.mp3',
  imil: '86 Imil.mp3', lalivero: '86 Imil.mp3', tolbi: '79 Tolbi.mp3', colosso: '77 Colosso 1.mp3', colosso2: '78 Colosso 2.mp3', kalay: '76 Kalay Celebrations.mp3',
  altin: '74 Flooded Altin.mp3', altinmines: "83 Lunpa's Hideout.mp3", east: '75 Lama Temple.mp3', woods: '81 Contigo.mp3',
  tunnel: '88 Tunnel Ruins.mp3', venuslh: '92 Venus Lighthouse.mp3', isle: "87 Babi's Lighthouse.mp3", tolbiship: '90 Tolbi Bound Ship.mp3',
  babi: "89 Babi's Theme.mp3", ivan: "58 Ivan's Theme.mp3", karsttheme: "35 Karst And Agatio's Theme.mp3", briggsruns: '36 Briggs!.mp3', wiseone: "37 Karst's Appearance.mp3", sheba: '39 Crying In Sorrow.mp3',
  alhafra: '06 Bustling City Theme.mp3', champa: '07 Champa.mp3', daila: '08 Daila Drums.mp3', apojii: '09 Tropical Paradise.mp3',
  izumo: '10 Izumo Festivals.mp3', izumoserpent: '11 Izumo Under The Serpent.mp3', kandorean: '13 The Kandorean Temple.mp3', kibombomtns: '14 Kimbombo Ceremony.mp3', gabombarite: "15 Akafubu's Ceremony.mp3",
  madra: '17 Quiet City Theme.mp3', islet: '18 Kalt Island.mp3', garoh: '19 Garoh.mp3', yallam: '20 Yallam.mp3', yepp: "21 Yepp's Song 1.mp3", yepp2: "22 Yepp's Song 2.mp3", jennabattle: "48 Jenna's Battle Theme.mp3", sunrises: '64 Golden Sun Rises.mp3', marsbeacon: '66 Lighting The Mars Beacon.mp3', themevar: '67 Golden Sun Theme Variation.mp3', wrongend: '68 Wrong Happy End.mp3',
  airsrock: "23 Air's Rock.mp3", aquarock: '24 Aqua Rock.mp3', isletcave: '25 Islet Cave.mp3', seagod: '26 TLA Caves.mp3', tlacaves: '26 TLA Caves.mp3', gaiarock: '27 Gaia Rock.mp3', gabomba: '28 Inside The Great Gabomba.mp3',
  jupiterlh: '29 Jupiter Lighthouse.mp3', magmarock: '30 Magma Rock.mp3', marslh: '31 Mars Lighthouse.mp3', tundaria: '32 Tundaria Tower.mp3', taopo: '33 Taopo Swamp.mp3', ankohl: '34 Ankohl Ruins.mp3',
  shaman: '38 Shaman Village.mp3', trialroad: '47 Trial Road.mp3', seaoftime: "63 Poseidon's Realm.mp3", contigo: '81 Contigo.mp3', prox: '60 Prox In Trouble.mp3',
  minigame: '01 The Lucky Slots.mp3', dice: '05 Hi-Lo Dice.mp3', suspense: '46 Suspense.mp3', credits: '45 The Credits.mp3', tobecontinued: '69 Golden Sun Sets.mp3'
};

// Maps that had a song of their own. A function picks by story state; a town's interiors inherit its song by prefix.
const MAP_MUSIC = {
  sol_sanctum: 'sanctums', sol_sanctum_1: 'sanctums', anemos: 'sanctums',   // the outer halls (the prefix covers the hall, the maze, the corridor of statues, the loop)
  sol_sanctum_2: 'solsanctum', sol_sanctum_statues: 'solsanctum', sol_sanctum_3: 'solsanctum',   // the inner sanctum: the sun crest, the sun and moon rooms, the elemental chamber
  mercury_lh_top: 'lhtop', venus_lh_1: 'venuslh', venus_lh_2: 'venuslh', venus_lh_top: 'venuslh',
  bilibin_palace: 'castle', bilibin_palace_2: 'castle', bilibin_palace_cellar: 'castle', bilibin_gust_cave: 'dungeon', bilibin_barricade: 'overworld', kalay_palace: 'castle', tolbi_palace: 'castle', lemuria_palace: 'castle', vault_mayor: 'castle', daila_mayor: 'castle', madra_mayor: 'castle', alhafra_mayor: 'castle',
  imil: 'imil', kolima: () => G.flag('tret_cured') ? 'prosperous' : 'sadtown', bilibin: () => G.flag('tret_cured') ? 'prosperous' : 'town',
  lalivero: 'lalivero', tolbi: 'tolbi', colosso: 'colosso', kalay: 'kalay', kalay_docks: 'kalay', ship_deck: 'tolbiship',
  altin: 'altin', tret_tree: 'altin', altin_mine_1: 'altinmines', altin_mine_2: 'altinmines', kolima_forest: 'woods', kolima_forest_w: 'woods', kolima_forest_n: 'woods', kolima_forest_pond: 'woods', kolima_forest_top: 'woods', tret_branches: 'woods', tret_heart: 'altin', mogall: 'woods', kolima_bridge: 'woods',
  xian: 'east', fuchin: 'east', fuchin_cave_1: 'dungeon', fuchin_cave_2: 'dungeon', fuchin_cave_3: 'dungeon', fuchin_cave_5: 'dungeon', fuchin_cave_6: 'dungeon', lama: 'east', alpine: 'east',
  tunnel_ruins: 'tunnel', gondowan_passage: 'tunnel', babi_lh: 'tunnel', lunpa_fortress: 'altinmines', lunpa: 'town',
  crossbone: 'isle', treasure_isle: 'isle', dehkan: 'isle', dehkan_mid: 'isle', dehkan_east: 'isle', tolbi_lucky: 'minigame',
  alhafra: 'alhafra', alhafra_east: 'alhafra', alhafra_cave: 'dungeon', alhafra_cave_1: 'dungeon', alhafra_jail: 'dungeon', alhafra_ship_cabin: 'alhafra', alhafra_ship_back: 'alhafra', champa: 'champa', daila: 'daila', apojii: 'apojii', apojii_east: 'apojii', apojii_cave: 'dungeon', apojii_cave_2: 'dungeon',
  izumo: () => G.flag('serpent_done') ? 'izumo' : 'izumoserpent', kandorean: 'kandorean', kandorean_inner: 'kandorean', kandorean_cave: 'kandorean',
  kibombo_mtns: 'kibombomtns', gabomba: 'gabomba', gabomba_gears: 'gabomba', gabomba_cogs: 'gabomba', gabomba_pit: 'gabomba', gabomba_shrine: 'gabomba', gabomba_eyes: 'gabomba', gabomba_heart: 'gabomba', gabomba_catacombs: 'gabomba', kibombo_vent: 'gabomba', indra_shore: 'sailing', lem_1: 'sailing', lem_2: 'sailing', lem_3: 'sailing', lem_4: 'sailing', lem_5: 'sailing', lem_5b: 'sailing', lem_6: 'sailing', lem_7: 'sailing', lem_8: 'sailing', lem_engine: 'sailing', madra: 'madra', madra_bridge: 'overworld2', osenia_cliffs: 'overworld2', madra_cave_a: 'dungeon', madra_cave_b: 'dungeon', madra_cave_c: 'dungeon', madra_village: 'dungeon', madra_ruins_1: 'dungeon', madra_ruins_up: 'dungeon', madra_ruins_b1: 'dungeon', madra_ruins_b2: 'dungeon', madra_ruins_tablet: 'dungeon', madra_store: 'madra',
  e_tundaria_islet: 'islet', se_angara_islet: 'islet', n_osenia_islet: 'islet', w_indra_islet: 'islet', sea_of_time_islet: 'islet', sw_atteka_islet: 'islet', kalt: 'islet',
  garoh: 'garoh', garoh_cave: 'garoh', garoh_cavern: 'dungeon', garoh_approach: 'garoh', garoh_path: 'garoh', yallam: 'yallam', airs_rock: 'airsrock', airs_rock_wall: 'airsrock', airs_rock_wall2: 'airsrock', airs_rock_summit: 'airsrock', airs_rock_in_entry: 'airsrock', airs_rock_in_hall: 'airsrock', airs_rock_in_cones: 'airsrock', airs_rock_in_red3: 'airsrock', airs_rock_in_blue3: 'airsrock', airs_rock_in_blue4: 'airsrock', airs_rock_in_crystal: 'airsrock', airs_rock_in_vial: 'airsrock', airs_rock_in_left: 'airsrock', airs_rock_in_blue5: 'airsrock', airs_rock_in_center: 'airsrock', aqua_rock: 'aquarock', aqua_rock_in_1: 'aquarock', aqua_rock_in_2: 'aquarock', aqua_rock_in_3: 'aquarock', aqua_rock_in_4: 'aquarock', aqua_rock_in_5: 'aquarock', aqua_rock_in_6: 'aquarock', aqua_rock_in_7: 'aquarock', aqua_rock_in_8: 'aquarock', aqua_rock_in_9: 'aquarock', aqua_rock_in_10: 'aquarock', aqua_rock_in_11: 'aquarock', aqua_rock_in_12: 'aquarock', aqua_rock_in_13: 'aquarock', aqua_rock_in_14: 'aquarock', aqua_rock_in_15: 'aquarock', aqua_rock_in_16: 'aquarock', aqua_rock_in_psy: 'aquarock',
  islet_cave: 'isletcave', sea_god_shrine: 'seagod', gaia_rock: 'gaiarock', gaia_rock_2: 'gaiarock', gaia_rock_3: 'gaiarock', gaia_rock_top: 'gaiarock', gaia_rock_in_1: 'gaiarock', gaia_rock_in_r: 'gaiarock', gaia_rock_in_p: 'gaiarock', gaia_rock_in_l: 'gaiarock', gaia_rock_in_hub: 'gaiarock', gaia_rock_in_plant: 'gaiarock', gaia_rock_in_a1: 'gaiarock', gaia_rock_in_x: 'gaiarock', gaia_rock_in_web: 'gaiarock', gaia_rock_in_a2: 'gaiarock', gaia_rock_in_c: 'gaiarock', gaia_rock_in_lair: 'gaiarock', gaia_maze: 'gaiarock', ank: 'ankohl', izumo_ruins: 'tlacaves', izumo_ruins_2: 'tlacaves', izumo_ruins_3: 'tlacaves',
  jupiter_lh: 'jupiterlh', magma_rock: 'magmarock',
  ml: 'marslh', mars_lh_1: 'marslh', northern_reaches: 'snow', mt_aleph_peak: 'villain', vale_after: 'ending',
  tundaria: 'tundaria', tt_1: 'tundaria', tt_2: 'tundaria', tt_ice1: 'tundaria', tt_ice2: 'tundaria', tt_hub: 'tundaria', tt_pound: 'tundaria', tt_pound2: 'tundaria', tt_ice3: 'tundaria', tt_ice4: 'tundaria', tt_back: 'tundaria', tt_center: 'tundaria', tt_left: 'tundaria', tt_left2: 'tundaria', tt_left3: 'tundaria', taopo: 'taopo', taopo_cave_w: 'taopo', taopo_cave_e: 'taopo', taopo_cave_n: 'taopo', taopo_cave_c1: 'taopo', taopo_cave_c2: 'taopo', taopo_cave_c3: 'taopo', ankohl: 'ankohl', ank: 'ankohl', ankohl_top: 'ankohl',
  shaman: 'shaman', shaman_east: 'shaman', loho: 'alhafra', trial_road: 'trialroad', trial_road_cave: 'trialroad', sea_of_time: 'seaoftime', sea_of_time_2: 'seaoftime', sea_of_time_3: 'seaoftime', sea_of_time_4: 'seaoftime',
  contigo: 'contigo', prox: 'prox', lemuria: 'lemuria', lemuria_ancient: 'lemuria', camp: 'vale', vault: 'vale', vault_inn_attic: 'vale'
};
// a map id that starts with one of these owns the same song as the town it belongs to
const MAP_MUSIC_PREFIX = ['ml', 'gaia_maze', 'ank', 'ankohl', 'sol_sanctum', 'imil', 'kolima', 'bilibin', 'lalivero', 'tolbi', 'kalay', 'altin', 'xian', 'alhafra', 'champa', 'daila', 'izumo', 'garoh', 'yallam', 'shaman', 'contigo', 'prox', 'lemuria', 'madra', 'loho', 'vault', 'apojii'];

// Bosses with a theme of their own; the battle looks its enemies up here first
const BOSS_MUSIC = {
  'Mystery Man': 'saturos', 'Mystery Woman': 'saturos', 'Saturos': 'saturos', 'Star Magician': 'saturos',
  'Saturos II': 'saturosmenardi', 'Menardi': 'saturosmenardi', 'Deadbeard': 'saturosmenardi', 'Sentinel': 'saturosmenardi',
  'Fusion Dragon': 'fusiondragon', 'Valukar': 'gsboss',
  'Briggs': 'bosshuman', 'Sea Fighter': 'bosshuman', 'Moapa': 'bosshuman', 'Knight': 'bosshuman',
  'Karst': 'karstagatio', 'Agatio': 'karstagatio', 'Flame Dragon (Small)': 'flamedragons', 'Flame Dragon (Big)': 'flamedragons', 'Doom Dragon': 'doomdragon',
  'Bandit': 'gsbattle', 'Brigand': 'gsbattle', 'Thief': 'gsbattle'
};

// Sound effects. Every name the game uses is here; the closest recording stands in where there is no exact one.
const SFX_FILES = {
  cursor: 'MenuMove.wav', confirm: 'MenuPositive.wav', cancel: 'MenuNegative.wav', buzz: 'MenuNegative.wav', error: 'MenuNegative.wav',
  hit: 'Hit.wav', hit2: 'Damage.wav', crit: 'Damage.wav', death: 'Damage.wav', status: 'Damage.wav',
  heal: 'Heal.wav', revive: 'PartyMemberRevive.wav', cure: 'CurseCured.wav', buff: 'MenuPositive2.wav', debuff: 'MenuNegative.wav',
  psy: ['Psynergy1.wav', 'Psynergy2.wav', 'Psynergy3.wav', 'Psynergy4.wav'], earth: 'Psynergy1.wav', water: 'Psynergy2.wav', fire: 'Psynergy3.wav', wind: 'Psynergy4.wav',
  summon: 'Psynergy4.wav', lightning: 'Hit.wav', boom: 'Damage.wav', quake: 'Damage.wav',
  // no recording fits these, so they are silent rather than wrong: the battle music starting is the encounter cue
  encounter: 'Psynergy4.wav',   // the one-second rising spiral - the encounter swirl
  miss: null, flee: null, jump: null, stairs: null, beacon: null,
  chest: 'ItemGet.wav', item: 'ItemGet.wav', treasure: '101. Acquired Item.mp3', door: 'UseDoor.wav', dooropen: '98. A Door Opens.mp3', push: 'PushObject.wav',
  levelup: '107. Level Up!.mp3', save: '103. Saving.mp3', djinnget: '99. Acquired Djinn.mp3', unleash: 'Psynergy4.wav', join: 'PartyMemberJoin.wav', shop: 'StoreTransaction.wav', rest: '104. Rested and Refreshed.mp3',
  win: '108. Winner!.mp3', luckywin: '109. Lucky Winner!.mp3', superwin: '110. Super Lucky Winner!.mp3', mystery: "106. It's a Mystery.mp3", satisfied: '105. Unknown Satisfaction.mp3'
};
