// ---------- The Lost Age towns ----------
'use strict';
const T2 = STORY_TLA;
// ======================= IDEJIMA =======================
defineMap('idejima', {
  name: 'Idejima', w: 26, h: 20, base: 'grass', music: 'sad', bg: 'grass', entry: { x: 12, y: 16 },
  build(M) {
    M.fill(0, 0, 26, 20, 'water'); M.blob(12, 9, 11, 7, 'grass'); M.blob(12, 9, 9, 5, 'grass2'); M.scatterObj(4, 4, 18, 10, 'palm', 0.12, 3); M.setObj(12, 6, null);
    M.fillObj(0, 0, 26, 20, null); M.scatterObj(4, 4, 18, 10, 'palm', 0.12, 3); M.fillObj(10, 8, 5, 9, null); M.set(12, 9, 'sand'); M.set(13, 9, 'sand');
    M.setObj(12, 5, 'rock_grass'); M.set(6, 12, 'sand'); M.set(18, 12, 'sand');
    if (!G.flag('idejima_broken')) {
      // the neck of land north to Gondowan and the foot of Venus Lighthouse, as they stood before the tower fell
      M.fill(0, 0, 26, 3, 'grass'); M.fill(9, 3, 8, 3, 'grass'); M.fill(8, 5, 10, 1, 'grass');
      if (!G.flag('idejima_broken')) { M.setObj(12, 2, 'door_cave'); M.walkable(12, 2); M.exit(12, 2, 1, 1, 'gateway_cave', 8, 2, DIR.DOWN, { door: true }); } else { M.setObj(12, 2, 'rock_grass'); }   /* once the peninsula tears away, the cave mouth is gone with the mainland */
      if (G.flag('prologue_jenna') && !G.flag('idejima_broken')) M.trigger(11, 3, 3, 2, T3.idejimaArrive, { once: 'idejima_arrived' });
      for (let x = 0; x < 26; x++) if (x < 9 || x > 16) M.setObj(x, 2, 'cliff');
      M.fillObj(10, 0, 6, 2, 'wall_stone'); M.setObj(12, 1, 'door_stone'); M.setObj(13, 1, 'door_stone'); M.setObj(9, 1, 'statue'); M.setObj(16, 1, 'statue');
      M.setObj(3, 1, 'palm'); M.setObj(22, 1, 'palm'); M.setObj(7, 0, 'palm'); M.setObj(19, 0, 'palm');
    }
    if (G.flag('idejima_landed')) { M.fill(11, 15, 4, 2, 'sand'); M.fillObj(11, 15, 4, 2, null); M.walkable(11, 15, 4, 2); } // the beached island touches the shore
    M.exit(11, 16, 4, 1, 'world_tla', 75, 75, DIR.DOWN, { cond: () => G.flag('idejima_landed') });
  }
});
// indra_shore and the Lemurian ship's rooms (lem_*): js/maps/indra_shore.js
// ======================= DAILA =======================
// ======================= DAILA =======================
// Laid out from the reference map: a fishing village walled in by pale cliffs, a stream down its west side, the
// Sanctum of the Sea God at the top of the hill, six thatched huts, ponds left by the tidal wave, a fence and a lane
// down to the south gate. 42 x 38 tiles.
const DAILA_ROWS = [
  'ss...#######TTTTTTTTT#####################',   // 0
  'ss...#######TTTTTTTTT#####################',   // 1
  'ss...#######TTTTTTTTT#####################',   // 2
  'ss...#######TTTTTTTTT####........#########',   // 3
  'ss...#######TTTTTTTTT.........############',   // 4
  'ss...#######TTTTTTTTT.........############',   // 5
  'ss...#######TTTTTTTTT.........############',   // 6
  'ss...#######TTTTTTTTT.........############',   // 7
  'ss...#######:::::::::.........############',   // 8
  'ss....######:::::::::...#.........########',   // 9
  'ss....######:::::~~~~...#.........########',   // 10
  'ss.....#####:::::~~~~...#.........########',   // 11
  'ss............:::~~~~...#.........########',   // 12
  'ss....~~~~....:::.......#.........########',   // 13
  'ss....~~~~....:::.......#.........########',   // 14
  'ss....~~~~....:::.......#####::###########',   // 15
  'ss............:::.......~~~~~::...########',   // 16
  'ss............:::.......~~~~~.....########',   // 17
  'ss.............:::........~~~~....########',   // 18
  'ss..........:::::::::.............########',   // 19
  'ss.........~~~::::::..............########',   // 20
  'ss.........~~~::::::..............########',   // 21
  'ss.............:~~~~..............########',   // 22
  'ss.............:~~~~..............########',   // 23
  'ss.............:..................########',   // 24
  'ss.............:...........~~~~~~.########',   // 25
  'ss.............:...........~~~~~~.########',   // 26
  'ss.............:...........~~~~~~.########',   // 27
  '..............::::...............#########',   // 28
  '..............::::...............#########',   // 29
  '..............::::..........##############',   // 30
  '..............::::..........##############',   // 31
  '........~~~~~..::............#############',   // 32
  '........~~~~~..::............#############',   // 33
  '........~~~~~..::.........................',   // 34
  '...............::.........................',   // 35
  '...............::.........................',   // 36
  '...............::.........................'    // 37
];
defineMap('daila', {
  name: 'Daila', w: 42, h: 38, base: 'grass', music: 'town', bg: 'grass', entry: { x: 15, y: 36 },
  build(M) {
    const dry = G.flag('lash_got');   // the salt water the wave left dries up once the shrine business is done
    M.paint(0, 0, DAILA_ROWS, { '.': 'grass', ':': 'path', '~': 'water', 's': 'water', 'T': { ground: 'stonefloor', obj: 'wall_temple' }, 'D': { ground: 'stonefloor', obj: 'door_stone' } }, { set: 'pcliff', faces: 2 });   // Indra's pale rock, two tiles tall
    // the Sanctum of the Sea God: its golden gate set into the sandstone mass, pillars either side, guardians on the steps
    M.landmark('sea_temple', 14, 4, { to: 'daila_sanctum', tx: 7, ty: 10 });
    M.setObj(12, 6, 'lh_pillar_top'); M.setObj(12, 7, 'lh_pillar_base'); M.setObj(20, 6, 'lh_pillar_top'); M.setObj(20, 7, 'lh_pillar_base');
    M.setObj(13, 8, 'statue'); M.setObj(19, 8, 'statue');
    // the six huts: thatched roofs on mud walls, doors at the bottom
    M.house(5, 16, 5, 6, 'roof_grey', { wall: 'wall_mud', to: 'daila_house1', tx: 6, ty: 8, windows: false });                       // 1
    M.house(10, 12, 5, 6, 'roof_grey', { wall: 'wall_mud', to: 'daila_house2', tx: 6, ty: 8, windows: false });                      // 2
    M.house(18, 14, 6, 7, 'roof_grey', { wall: 'wall_mud', to: 'daila_house3', tx: 6, ty: 8, windows: false });                      // 3
    M.house(26, 9, 7, 6, 'roof_grey', { wall: 'wall_mud', to: 'daila_mayor', tx: 6, ty: 8, windows: false });                        // 4: the mayor, up on the rise
    M.house(9, 22, 6, 6, 'roof_grey', { wall: 'wall_mud', to: 'daila_inn', tx: 7, ty: 8, sign: 'inn_sign', doorX: 4, windows: false }); // 5: the inn
    M.house(22, 22, 6, 6, 'roof_grey', { wall: 'wall_mud', to: 'daila_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false }); // 6: weapons and armor
    // the item seller's stall under its straw awning, between the inn and the smith
    M.setObj(18, 24, 'awning_red'); M.setObj(19, 24, 'awning_red'); M.setObj(20, 24, 'awning_red'); M.setObj(18, 25, 'market_stall'); M.setObj(20, 25, 'market_stall'); M.setObj(21, 25, 'crate');
    M.npc('daila_stall', 19, 25, { type: 'merchant', name: 'Item Seller', shop: 'daila_item', dir: DIR.DOWN, onShop: () => G.set('daila_visited_shop') });
    // the well in the middle of the village
    M.setObj(15, 20, 'well');
    // trees: palms along the stream and the lane, a big red-leafed tree by the well and on the rise
    for (const [x, y] of [[3, 2], [3, 3], [2, 9], [1, 11], [4, 19], [3, 20], [2, 24], [1, 25], [20, 27], [21, 26], [31, 21], [32, 22], [30, 27], [3, 28], [4, 29]]) M.setObj(x, y, 'palm');
    for (const [x, y] of [[30, 6], [31, 7], [17, 21], [18, 22], [2, 29], [3, 30]]) M.setObj(x, y, 'tree_red');   // Indra's red-leafed trees
    for (const [x, y] of [[5, 14], [8, 11], [22, 9], [33, 18], [6, 31], [11, 34], [7, 33]]) M.setObj(x, y, 'rock_small');
    for (const [x, y] of [[4, 21], [5, 21], [4, 22], [6, 23], [5, 24], [4, 25]]) M.setObj(x, y, 'hay');
    // the fence with the gate lane through it
    M.fenceH(8, 31, 7); M.fenceV(14, 32, 3); M.fenceH(17, 31, 11); M.fenceV(17, 32, 3);   // the rails turn the corner into the gate lane
    // jars and barrels; the ones the guidebooks mention have something in them
    M.container(9, 30, 'barrel', 'Smoke Bomb'); M.container(10, 30, 'barrel'); M.container(12, 29, 'crate');
    M.container(22, 4, 'barrel'); M.container(25, 6, 'pot'); M.container(26, 6, 'pot'); M.container(19, 12, 'pot'); M.container(14, 15, 'pot'); M.container(15, 14, 'pot');
    M.container(21, 20, 'pot'); M.container(25, 13, 'pot', 'Coins', 12); M.container(31, 9, 'pot', 'Herb'); M.container(24, 23, 'pot'); M.container(28, 29, 'pot');
    // the salt puddles the wave left: Frost freezes them, and they dry out once the shrine has calmed
    for (const [x, y] of [[8, 17], [21, 22], [12, 24], [26, 19], [16, 27], [7, 28], [23, 30]]) M.set(x, y, dry ? 'puddle_dry' : 'puddle');
    // something buried at the corner of the eastern pond
    M.object('scoop', 33, 25, { id: 'daila_dig', item: 'Psy Crystal' });
    // gates: south to the coast road, north to the mountain path
    M.exit(15, 37, 2, 1, 'world_tla', 66, 71, DIR.DOWN); M.exit(2, 0, 3, 1, 'world_tla', 66, 69, DIR.UP);
    // the villagers, in their own words
    M.npc('daila_m1', 13, 19, { type: 'villager_m', move: 'wander', text: () => dry ? "Everything's drying out, but we still smell like brine." : "We were hit by a gigantic tidal wave, but there were no injuries... It was miraculous!", mind: "That wave turned this place into a swamp! Everything smells like brine!" });
    M.npc('daila_m2', 22, 8, { type: 'villager_m', move: 'wander', text: "I saw a bright light in the northwestern sky earlier... Somewhere over Gondowan. It was right before the tidal wave... I wonder if there's a connection...", mind: "I thought I saw some lights in the northwestern skies... Maybe I just imagined them." });
    M.npc('daila_f1', 16, 13, { type: 'villager_f', move: 'wander', text: "That tidal wave left a lot of standing water in our village... The worst part is that it's all salt water.", mind: "With all this salt water on the ground, what will happen to our crops?" });
    M.npc('daila_f2', 27, 20, { type: 'villager_f', move: 'wander', text: "Thank goodness for that mountain range to the north... If that range weren't there, we would have been washed away for sure...", mind: "The sea god must have saved us from the wave. It's good we have a shrine honoring him." });
    M.npc('daila_sailor', 24, 29, { type: 'sailor', text: "Huh? You want a boat? Everyone knows all our boats were destroyed by the tidal wave!", mind: "With all the boats gone, we sailors are stuck here! What are we supposed to do on dry land? Knit!?" });
    M.npc('daila_kid', 12, 33, { type: 'child_f', move: 'wander', text: dry ? "Aww, the puddles are all gone..." : "Yaaay! Puddles in the village! Yaaay!", mind: "Yay! We never get puddles like this, not even when it rains!" });
    M.npc('daila_kid2', 8, 20, { type: 'child_m', move: 'wander', text: "Bleah! I fell in a puddle and got my clothes dirty! Mom's gonna have a fit!", mind: "Bleccch! This water's saaalty!" });
    M.npc('daila_old', 29, 17, { type: 'elder_m', text: () => G.flag('sea_god_shrine_done') ? "The Dehkan Plateau to the south leads to Madra. Watch your footing - the plateau crumbles." : "The ancient tower to the east? It's the Shrine of the Sea God... Listen, if you're not into being cursed horribly, you should stay away from there.", mind: "I can't believe those children play in the shrine! It's dangerous, and it will only bring them misfortune..." });
    M.npc('daila_f3', 6, 13, { type: 'villager_f', text: "I haven't seen Tavi and Riki around lately... I like those little guys, so I'm kind of worried about 'em.", mind: "I'm sure those two went to the Shrine of the Sea God. They never listen! I told them they were way too small to climb those cliffs..." });
    M.trigger(14, 35, 4, 1, T2.dailaArrive, { once: 'daila_arrived' });
    M.trigger(14, 36, 4, 1, T2.echoJoins, { once: 'echo_joined', cond: () => G.flag('daila_arrived') && G.flag('daila_visited_shop') });
    // Alex is waiting at the mayor's door once the shrine has been seen to
    M.trigger(28, 15, 3, 1, T2.dailaAlex, { once: 'daila_alex', cond: () => G.flag('lash_got') });
  }
});
Kit.home('daila_house1', { name: 'House', back: { map: 'daila', x: 7, y: 22 }, npcs: [{ id: 'daila_h1', x: 4, y: 4, type: 'villager_f', text: "Ohhh... that wave knocked my husband over, and now he can't get up. He must have been born to suffer!", mind: "His hip's killing him, and all he cares about is how muddy his clothes are!" }, { id: 'daila_h1b', x: 8, y: 6, type: 'elder_m', text: "My hip's killing me, and all that woman cares about is how muddy my clothes are! She cares more about the laundry than she does me!" }] });
Kit.home('daila_house2', { name: 'House', back: { map: 'daila', x: 12, y: 18 }, npcs: [{ id: 'daila_h2', x: 5, y: 4, type: 'villager_m', text: "Our village survived the wave, but all our boats were destroyed... We won't be sailing for a while, but we'll pull through somehow...", mind: "That wave was brutal! It smashed my boat to splinters!" }] });
Kit.home('daila_house3', { name: 'House', back: { map: 'daila', x: 21, y: 21 }, npcs: [{ id: 'daila_h3', x: 5, y: 4, type: 'villager_f', text: "Riki and Tavi sure are out late...", mind: "The Shrine of the Sea God stopped the wave, but I'm worried... Riki and Tavi were playing in there, and I'm too scared to tell anyone." }], build(M) { M.container(9, 3, 'pot', 'Coins', 3); } });
Kit.home('daila_mayor', { name: "Mayor's House", back: { map: 'daila', x: 29, y: 15 }, npcs: [{ id: 'daila_mayor', x: 5, y: 5, type: 'noble', name: 'Mayor of Daila', text: () => G.flag('daila_alex') ? "Madra, to the south, is the largest town on Indra. If any boats survived the wave, they will be there." : "Welcome, travelers. Refugees from the tidal wave fill our inn. If you seek passage south, the plateau road is your only way.", mind: "A boat, a boat... Everyone who walks in here wants a boat." }], build(M) { M.container(1, 4, 'pot', 'Coins', 12); } });
Kit.inn('daila_inn', { name: 'Daila Inn', price: 6, back: { map: 'daila', x: 13, y: 28 }, build(M) { M.container(2, 8, 'barrel', 'Sleep Bomb'); } });
Kit.shop('daila_weaponshop', { name: 'Daila Weapon Shop', shop: 'daila_weapon', back: { map: 'daila', x: 25, y: 28 } });
// the Sanctum of the Sea God: the healer keeps the shrine, and behind him the god's statue stands over a pool the wave
// filled. Two of the puddles in it freeze into stepping stones, and the Sea God's Tear waits on the far side.
Kit.interior('daila_sanctum', { name: 'Daila Sanctum', w: 14, h: 12, floor: 'floor_tile', wall: 'wall_in_stone', back: { map: 'daila', x: 15, y: 8 }, doorX: 7,
  furn: [['torch', 2, 1], ['torch', 11, 1], ['statue_mercury', 7, 2], ['lh_pillar_top', 3, 1], ['lh_pillar_top', 10, 1], ['carpet', 6, 7, 3, 3]],
  npcs: [{ id: 'daila_sanctum_priest', x: 7, y: 8, type: 'priest', sanctum: true, name: 'Great Healer', dir: DIR.DOWN, text: "There is nothing left for you in Daila... Please be careful on the road.", mind: "Daila's probably pretty boring for travelers." }],
  build(M) {
    M.fill(3, 4, 8, 2, 'water'); M.set(3, 4, 'puddle_water'); M.set(3, 5, 'puddle_water'); M.set(6, 5, 'puddle_water'); M.set(9, 4, 'puddle_water');
    M.chest(4, 3, "Sea God's Tear", 1);
    M.trigger(2, 6, 10, 1, function* (E) { yield E.say("(A statue of the Sea God stands beyond a pool of seawater. A tear-shaped stone glints at its feet.)"); }, { once: 'daila_sanctum_seen' });
  } });

// ======================= MADRA =======================
// madra: js/maps/madra.js

// ======================= ALHAFRA =======================
// alhafra, alhafra_east, alhafra_cave, alhafra_jail: js/maps/alhafra.js, alhafra_east.js, alhafra_cave.js

// ======================= MIKASALLA / GAROH =======================
// mikasalla: js/maps/mikasalla.js
// garoh, garoh_cave, garoh_cavern, garoh_approach, garoh_path: js/maps/garoh.js
// ======================= NARIBWE / KIBOMBO =======================
// naribwe + its huts: js/maps/naribwe.js
// gondowan_settlement, hesperia_settlement, sw_atteka_islet, kalt: js/maps/western_sea.js
// kibombo, its huts and the vent shaft: js/maps/kibombo.js; the Gabomba Statue: js/maps/gabomba.js

// ======================= YALLAM / IZUMO / CHAMPA =======================
// yallam and its houses: js/maps/yallam.js
// izumo, its houses and the ruins: js/maps/izumo.js
// champa, its houses, rafts, cliff caves and Obaba's forge: js/maps/champa.js

// ======================= LEMURIA =======================
// lemuria (harbour, road, city, palace, houses, Lunpa's tower, Ancient Lemuria): js/maps/lemuria.js

// ======================= SHAMAN VILLAGE / CONTIGO / LOHO / PROX =======================
// contigo and its houses, the tents, the sanctum: js/maps/contigo.js
// shaman (the village, its east screen and houses) and the Shaman Village Cave: js/maps/shaman.js
// atteka_inlet (the garden) and atteka_beach (the berth, the wings): js/maps/atteka_inlet.js
// loho and its houses: js/maps/loho.js
// prox and its houses: js/maps/prox.js

// ======================= ISLETS & MISC =======================
// e_tundaria_islet, se_angara_islet, n_osenia_islet, w_indra_islet, sea_of_time_islet and their huts, islet_cave_isle: js/maps/islets.js
// apojii, apojii_east, apojii_cave(_2) and the huts: js/maps/apojii.js

// ======================= THE CAMP (party hideout) =======================
// Founded once all eight Adepts travel together. The others move about freely here instead of trailing behind, and
// each tent houses one of the things the journey never gave them a quiet moment for: who fights, what they carry,
// which Djinn shape their class, and sending the idle half out to train.
defineMap('camp', {
  name: 'The Camp', w: 26, h: 22, base: 'grass', music: 'vale', bg: 'grass', entry: { x: 13, y: 19 },
  onEnter: function* (E) { E.setFollowers(false); },
  build(M) {
    M.border('pine'); M.scatter(3, 3, 20, 16, 'grass2', 0.28, 5); M.scatter(3, 3, 20, 16, 'flowers', 0.05, 7);
    M.fill(11, 8, 4, 12, 'dirt'); M.fill(5, 12, 16, 2, 'dirt');
    M.fillObj(11, 20, 4, 1, null); M.exit(12, 20, 2, 1, 'world_tla', 14, 61, DIR.DOWN); M.walkable(11, 19, 4, 2);
    // campfire in the middle - resting here is free, this is home
    M.setObj(13, 10, 'fireplace'); M.light(13, 10, 4);
    M.object('camp_fire', 13, 10, { id: 'camp_fire' });
    M.setObj(11, 9, 'crate'); M.setObj(15, 11, 'barrel'); M.setObj(12, 7, 'pot');
    // four tents; stepping into a doorway opens its work
    const tent = (x, y, id, label, script) => {
      M.fillObj(x, y, 3, 2, 'tent'); M.setObj(x + 1, y + 1, null); M.walkable(x + 1, y + 1);
      M.sign(x + 2, y + 2, label);
      M.trigger(x + 1, y + 1, 1, 1, script, { id });
    };
    tent(11, 3, 'tent_summon', "'Summon Circle' - choose the summon each Adept calls on.", T2.campSummon);
    tent(4, 5, 'tent_formation', "'Formation' - who stands in the front rank.", T2.campFormation);
    tent(19, 5, 'tent_class', "'Djinn Tent' - try Djinn on an Adept and see the class it makes.", T2.campClass);
    tent(4, 15, 'tent_armoury', "'Armoury' - try gear on an Adept and compare.", T2.campArmoury);
    tent(19, 15, 'tent_training', "'Training' - send the idle half out to train.", T2.campTraining);
    M.trigger(12, 10, 3, 2, T2.campRest, { id: 'camp_rest' });
    // everyone who is not the one walking mills about the camp on their own
    const spots = [[8, 9], [17, 9], [9, 16], [16, 16], [7, 12], [18, 12], [12, 15], [14, 6], [12, 6]];
    const chat = {
      Isaac: ["It is strange, resting somewhere that is ours.", "Kraden has not stopped taking notes since we pitched the tents."],
      Garet: ["I could get used to a fire that nobody is trying to put out.", "Ask in the training tent if you want me sharper. I will go."],
      Ivan: ["The Djinn tent is worth your time. I was a Magician all this way without knowing I could be more.", "Wind carries odd talk across this plain."],
      Mia: ["Imil feels very far from here.", "Rest by the fire before you go. It costs nothing."],
      Felix: ["Four tents and a fire. It is more than we had on Idejima.", "Say the word and I will stand in the front rank."],
      Jenna: ["Eight of us. I still count twice to be sure.", "Try the armoury - half our bags have never been opened."],
      Sheba: ["I can see the Lighthouse road from the rise.", "Lay the Djinn out before you choose. The numbers surprise people."],
      Piers: ["Lemurian camps were quieter. Not better - quieter.", "The ship is safe at anchor. Rest while we can."],
      Kraden: ["A camp! Now we can finally compare notes properly."]
    };
    M.npc('camp_kraden', 12, 8, { look: NPC_LOOKS.Kraden, name: 'Kraden', move: 'wander', cond: () => !G.party.get('Kraden'), text: ["A camp of our own! Now I can finally lay the notes out properly.", "The Djinn tent is the one that fascinates me. Set them differently and an Adept becomes something else entirely - the same person, a different craft.", "Rest by the fire. Even scholars know that much."] });
    // anyone who walked off after too many picked fights waits here until asked back
    const resting = (G.campResting || []);
    resting.forEach((o, i) => { const spot = [[10, 11], [16, 11], [13, 13]][i % 3]; if (CHARACTERS[o.id]) M.npc('camp_rest_' + o.id, spot[0], spot[1], { look: CHARACTERS[o.id].look, name: CHARACTERS[o.id].name, move: 'wander', cond: () => Reputation.isResting(o.id), script: Reputation.campScript(o.id) }); });
    if (G.party && G.party.members) G.party.members.forEach((m, i) => {
      if (i === 0 || i >= spots.length) return;                       // the first is the one you are walking
      const [x, y] = spots[i];
      M.npc('camp_' + m.id, x, y, { look: CHARACTERS[m.id].look, name: m.name, move: 'wander', cond: () => !Camp.isTraining(m.id), text: chat[m.id] || ['...'] });
    });
  }
});
