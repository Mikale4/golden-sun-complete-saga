// ---------- Prox ----------
// The village of the Fire Clan at the top of the world, after map references/Prox Map.png (rows in
// js/maps/prox_layout.js from tools/towns/prox_build.py): the south road up a fenced lane, the frozen river through
// the middle of the town with its two bridges and the icebound boats, the homes on either bank (the cave houses cut
// into the cliffs, the igloo the children built), and at the north end the frozen pool under the waterfall with the
// mayor's house on its ledge and the north road out to Mars Lighthouse. Per the guide and the script: the snowstorm,
// Mold on the riverbed (it dives into a snow pile, Scoop brings it out; no fight), the missing Mercury Djinni of the
// first journey in the mayor's house, the Sacred Feather in his basement, the Cookie in the jar left of the inn, the
// Potion in the inn's jar, the Dark Matter under the boulder (Lift, Scoop); the man and woman outside the mayor's
// house who cannot find Felix's parents (prox_parents_gone); Puelle, the elder and the villagers at the north road,
// where the party takes on Mars Lighthouse (prox_council). The Teleport Lapis is in the lighthouse, not here.
'use strict';
{
  const T3 = STORY_TLA;
  const LEGEND = {
    ' ': 'void', '.': 'snow', 'i': 'snow_river', 'w': 'pool_ice', 'F': 'ice_fall', 'B': 'bridge',
    'f': { ground: 'snow', obj: 'fence_snow' }, 'T': { ground: 'snow', obj: 'pinesnow' }, 'r': { ground: 'snow', obj: 'rock_snow' },
    'p': { ground: 'pool_ice', obj: 'snow_pile' }, 'b': { ground: 'snow_river', obj: 'boat_ice_top' }, 'v': { ground: 'snow_river', obj: 'boat_ice_hull' },
  };
  const HOUSE = { wall: 'wall_mud', windows: false, wallRows: 2 };
  // the villagers' words, before the council at the north road and after it
  const FOLK = [
    ['prox_v1', 15, 66, 'proxian', "Felix! Welcome back to Prox! It looks like only Mars Lighthouse still needs lighting... Agatio didn't think you'd be coming back here, so I'm a little surprised to see you...", "Agatio and Karst told me that Felix ran away because their quest was too dangerous."],
    ['prox_v2', 12, 30, 'proxian', "Once the final lighthouse is lit, the winds should weaken. They keep getting stronger, though!", "If this weather continues much longer, we'll all be buried under snow in no time."],
    ['prox_v3', 28, 30, 'proxian', "Agatio and Karst left for Mars Lighthouse a little while ago...", "Agatio and Karst are the strongest fighters in Prox... That's why we sent them. But I'm worried... They've been gone for a while now, and the lighthouse still remains dark."],
    ['prox_v4', 30, 48, 'child_m', "Felix, you're back? And you learned how to use Psynergy? I can sense the power inside of you... It's strong!", "If Felix could become an Adept so quickly, so can I!"],
    ['prox_v5', 19, 53, 'proxian', "I'm glad you made it back safely... The ice is making it very difficult for anyone to sail here.", "Ever since Agatio returned from Jupiter Lighthouse, the winds have been stronger than ever..."],
    ['prox_v6', 8, 22, 'elder_m', "I've been keeping a close eye on the northern skies... Once I see a bright flash in the distance, I'll know the last beacon has been lit.", "Everything is supposed to return to normal once Mars Lighthouse is lit again."],
    ['prox_v7', 32, 24, 'villager_f', "We're used to the cold up here in Prox, but lately, it seems to be getting worse.", "It gets cold around here, but this is the first time I've ever seen snow pile up on the river. What if Agatio doesn't reach Mars Lighthouse in time?"],
    ['prox_v8', 14, 22, 'proxian', "Have you seen Saturos or Menardi? People have been saying that they were killed...", "I can't believe anyone could have beaten Saturos and Menardi..."],
  ];
  // Puelle's company at the north road: the elder, three men and three women
  const COUNCIL = [
    ['prox_m1', 5, 3, 'proxian', "Is that you, Felix? When did you return to Prox? You should take your parents back to Vale, so they can at least die in their hometown.", "If the lighthouse isn't lit soon, Prox is doomed... I need to get out of here!"],
    ['prox_m2', 10, 4, 'proxian', "If we were better Adepts, we could try to enter the lighthouse ourselves...", "Neither our elder nor Puelle will tell us what's going on at the lighthouse... Why are we training so much? A lighthouse shouldn't pose that much danger..."],
    ['prox_m3', 12, 6, 'proxian', "I feel so helpless... Agatio has not returned, and the lighthouse beacon remains unlit.", "Puelle is stronger than any of us, and there is nothing he can do to save us... But if we don't take some kind of action, Prox will be destroyed for sure..."],
    ['prox_w1', 4, 6, 'villager_f', "All we can do now is wait for Agatio and his men to return... But no honest soldier can sit idly by while others do all of the work.", "If they didn't light the beacon, and they didn't return home, Agatio's team must have failed."],
    ['prox_w2', 9, 7, 'villager_f', "Our Psynergy feels weak... I can sense it inside me. The water, earth, and wind lighthouses have been lit, and fire alone remains dark.", "If only my fire Psynergy weren't so weak now, I might be able to help..."],
    ['prox_w3', 6, 8, 'villager_f', "Puelle promised that he would return our hostages to Vale. If you don't believe me, ask him yourself.", "Puelle never intended to take hostages. He wanted the people of Vale to be returned safely. Saturos insisted that we hold on to them for our safety, but Puelle disagreed."],
  ];
  defineMap('prox', {
    name: 'Prox', w: 41, h: 78, base: 'void', music: 'prox', bg: 'snow', entry: { x: 15, y: 76 }, retreat: { map: 'world_tla', x: 147, y: 22, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, PROX_ROWS, LEGEND, { cliff: '#', set: 'snowplateau', top: 'snowcliff_top', face: 'snowcliff_face', mid: 'snowcliff_top' });   // snow banks: white on top, a brown face along the foot
      // the houses: 2 (a home), 4 (the inn), 5, 6, 8 (homes), 7 (the mayor's, up on the ledge); the cave houses 1 (the healer) and 3 (the store); the igloo
      M.house(11, 35, 6, 5, 'roof_snow', Object.assign({ doorX: 3, to: 'prox_house2', tx: 6, ty: 8 }, HOUSE));
      M.house(30, 37, 6, 5, 'roof_snow', Object.assign({ doorX: 3, to: 'prox_inn', tx: 7, ty: 8, sign: 'inn_sign', chimney: true }, HOUSE));
      M.house(8, 40, 5, 5, 'roof_snow', Object.assign({ doorX: 2, to: 'prox_house5', tx: 6, ty: 8 }, HOUSE));
      M.house(15, 45, 5, 5, 'roof_snow', Object.assign({ doorX: 2, to: 'prox_house6', tx: 6, ty: 8 }, HOUSE));
      M.house(10, 51, 4, 4, 'roof_snow', Object.assign({ doorX: 1, to: 'prox_house8', tx: 6, ty: 8 }, HOUSE));
      M.house(29, 8, 6, 5, 'roof_snow', Object.assign({ doorX: 2, to: 'prox_mayor', tx: 7, ty: 10, chimney: true }, HOUSE));
      M.setObj(3, 31, 'door_cave'); M.walkable(3, 31); M.exit(3, 31, 1, 1, 'prox_sanctum', 6, 9, DIR.LEFT, { door: true });   // the healer's cave in the west cliff
      M.setObj(32, 35, 'door_cave'); M.walkable(32, 35); M.exit(32, 35, 1, 1, 'prox_shop', 7, 8, DIR.UP, { door: true }); M.setObj(30, 36, 'barrel'); M.setObj(34, 36, 'pot');   // the store's cave in the ridge
      for (const [dx, dy, t] of [[0, 0, 'igloo_ul'], [1, 0, 'igloo_um'], [2, 0, 'igloo_ur'], [0, 1, 'igloo_l'], [1, 1, 'igloo_door'], [2, 1, 'igloo_r']]) M.setObj(35 + dx, 47 + dy, t);
      M.walkable(36, 48); M.exit(36, 48, 1, 1, 'prox_igloo', 5, 6, DIR.UP, { door: true });
      // the ways out: the south road (the world lands the party by Prox's marker) and the north road to the lighthouse
      M.exit(14, 77, 3, 1, 'world_tla', 147, 22, DIR.DOWN); M.walkable(14, 77, 3, 1);
      M.exit(6, 0, 3, 1, 'world_tla', 147, 20, DIR.UP); M.walkable(6, 0, 3, 1);
      // Mold on the snowed-over riverbed north of the bridge: touched, it dives into a snow pile; Scoop brings it out
      if (!G.party.djinnFound.includes('Mold')) {
        if (!G.flag('mold_hidden')) M.npc('mold_npc', 22, 8, { animal: 'djinni', animalCol: 0, name: 'Djinni', solid: true, script: T3.moldDive });
        if (G.flag('mold_hidden')) M.object('scoop', 23, 7, { id: 'prox_mold', look: 'snow_pile', onScoop: function* (E) { if (G.party.djinnFound.includes('Mold')) return; G.field.map.objects.push({ kind: 'djinni', x: 23, y: 7, name: 'Mold', key: 'djinn:Mold', fight: false, el: 0 }); Audio.sfx('item'); yield E.say('The snow flies - and the Venus Djinni shakes itself off, sheepish.', 'Felix'); } });
        if (G.flag('obj:prox:scoop:prox_mold')) M.djinni('Mold', 23, 7, { fight: false });
      }
      // the Dark Matter under the boulder on the east bank: Lift, then Scoop
      M.object('boulder', 37, 26, { id: 'prox_rock' }); M.object('scoop', 37, 26, { id: 'prox_dark', item: 'Dark Matter', look: 'dig_spot' });
      // the folk of the village
      const after = () => G.flag('prox_council');
      for (const [id, x, y, type, text, mind] of FOLK) M.npc(id, x, y, { type, move: 'wander', text, mind });
      for (const [id, x, y, type, text, mind] of COUNCIL) M.npc(id, x, y, { type, text, mind, dir: DIR.DOWN });
      M.npc('prox_elder', 7, 2, { type: 'elder_m', name: 'Elder', dir: DIR.DOWN, text: () => after() ? "Felix, you are the only hope left to us now. Good luck." : "...", mind: () => after() ? "If they were strong enough to defeat Saturos and Menardi, perhaps they can do the job..." : "Puelle... we cannot lose you too." });
      M.npc('Puelle', 8, 3, { look: NPC_LOOKS.Puelle, name: 'Puelle', dir: DIR.DOWN, text: () => after() ? "You must find Karst, get the Mars Star, and light the lighthouse." : "...", mind: () => after() ? "If this doesn't work, we're all finished... Prox, Weyard, even Vale... All will be lost..." : "If Agatio has failed, I must go myself." });
      // the man and woman outside the mayor's house, once they have come out looking for Felix's parents
      if (G.flag('prox_parents_gone')) {
        M.npc('prox_hm', 30, 13, { type: 'proxian', name: 'Man', dir: DIR.RIGHT, text: "Puelle ordered me to set your parents free. That's why I'm here now... The only thing is, no one else is here... I don't know where your parents went!", mind: "Puelle wanted to set Felix's parents free before Prox was destroyed... But if we can't find them, how can we set them free?" });
        M.npc('prox_hw', 33, 13, { type: 'villager_f', name: 'Woman', dir: DIR.LEFT, text: "Felix took the trouble of coming back for his parents, and now they're just gone?", mind: "I can't think of anywhere else Felix's parents might have gone!" });
      }
      M.sign(17, 74, 'PROX - the village of the northern flame. Mars Lighthouse stands beyond the north road.');
      // the scenes: arriving; the mayor's yard; the council at the north road
      M.trigger(14, 70, 3, 1, T3.proxArrive, { once: 'prox_arrived' });
      M.trigger(26, 13, 9, 2, T3.proxParentsGone, { once: 'prox_parents_gone', cond: () => !G.flag('prox_parents_gone') });
      M.trigger(4, 8, 8, 2, T3.proxCouncil, { once: 'prox_council', cond: () => !G.flag('prox_council') });
    }
  });
  // ---- the houses ----
  Kit.inn('prox_inn', { name: 'Prox Inn', price: 200, back: { map: 'prox', x: 33, y: 42 },
    npcs: [{ id: 'prox_inn2', x: 10, y: 6, type: 'villager_f', name: 'Innkeeper', text: "Your mother knows that you're strong and healthy, so I'm sure she's very relieved...", mind: "Felix's parents were so worried about him that they were wasting away..." }],
    build(M) { const k = M.npcs.find(n => n.id === 'prox_inn_keeper'); if (k) { k.text = "Felix, your parents have gone away... They were very worried about you."; k.mind = "Felix's parents were worried about him when they heard Saturos was dead."; } } });
  Kit.interior('prox_shop', { name: 'Prox Store', w: 14, h: 10, doorX: 7, back: { map: 'prox', x: 32, y: 36 }, floor: 'floor_stone', wall: 'wall_in_stone',
    furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['counter', 9, 3], ['counter', 10, 3], ['counter', 11, 3], ['shelf', 1, 2], ['shelf', 12, 2], ['barrel', 1, 7], ['crate', 12, 7]],
    npcs: [{ id: 'prox_item', x: 3, y: 2, type: 'merchant', shop: 'prox_item', name: 'Shopkeeper', dir: DIR.DOWN, text: "You go away for a little while, and you come back a strong and mighty warrior! I'm so proud of you!", mind: "Felix looks so confident, so bold... You can see it in his eyes..." },
      { id: 'prox_armory', x: 10, y: 2, type: 'merchant', shop: 'prox_weapon', name: 'Armorer', dir: DIR.DOWN, text: "When you left Prox, you were so young that you could barely lift a sword! Now, look at you! You could handle any weapon with ease!", mind: "What has he gone through that he's become so strong in such a short time?" }] });
  Kit.sanctum('prox_sanctum', { name: 'Prox Sanctum', back: { map: 'prox', x: 4, y: 31 }, build(M) { const p = M.npcs.find(n => n.id === 'prox_sanctum_priest'); if (p) { p.name = 'Healer'; p.text = "I hear Agatio and Karst have gone to Mars Lighthouse... What if their actions only cause more turmoil? How can we be sure they're right?"; p.mind = "These catastrophes are the result of the lighthouse beacons being rekindled. This snow, this wind, it all started after Jupiter Lighthouse was lit."; } } });
  Kit.home('prox_house2', { name: 'Prox', back: { map: 'prox', x: 14, y: 40 }, npcs: [
    { id: 'prox_h2a', x: 4, y: 5, type: 'proxian', text: "We sent emissaries to Vale to tell them that Weyard was dying. But they wouldn't listen to us... If only they had listened to us...", mind: "At least the journey wasn't for nothing. We learned that Sol Sanctum held a hidden secret." },
    { id: 'prox_h2b', x: 8, y: 6, type: 'elder_m', text: "Vale's elders were stubborn... They refused to listen to us, and they drove us out by force. We had gone in peace, hoping to convince them of the plight our world faces...", mind: "Three years ago, we sent our finest to Sol Sanctum. All but two were killed in a trap. The people of Vale couldn't possibly understand how dire our need was..." }] });
  Kit.home('prox_house5', { name: 'Prox', back: { map: 'prox', x: 10, y: 45 }, npcs: [
    { id: 'prox_h5a', x: 4, y: 5, type: 'proxian', text: "The rift at Mars Lighthouse gets wider every day. If we don't find a way to stop it, I think it's going to devour Prox entirely!", mind: "I thought Prox would be here forever, but now, it looks like it might be destroyed!" },
    { id: 'prox_h5b', x: 8, y: 6, type: 'villager_f', text: "Our chieftain told me that the rift is growing larger by the day, just like Gaia Falls is. We'd better light the Mars beacon soon, or Prox is finished...", mind: "Nobody believed that the rift would go as far south as Prox... They all thought Puelle was being melodramatic... But no one thinks that anymore..." },
    { id: 'prox_h5c', x: 6, y: 3, type: 'child_m', text: "Not too long ago, I climbed the mountains to the north to look at the rift. It was huge!", mind: "The northern rift has gotten so big that I couldn't see the other side..." }] });
  Kit.home('prox_house6', { name: 'Prox', back: { map: 'prox', x: 17, y: 50 }, npcs: [
    { id: 'prox_h6a', x: 4, y: 5, type: 'elder_m', text: "If Mars Lighthouse's fires are not rekindled, Prox will be destroyed, but that's not all... Eventually, Gaia Falls will continue to erode, finally devouring all of Weyard.", mind: "I think it's too late for us already... But if they light the fires, we'll be ready for them." },
    { id: 'prox_h6b', x: 8, y: 6, type: 'proxian', text: "No one thought about our needs when they extinguished the great lighthouses... Now, because of them, our great land is dying, crumbling away at the edges...", mind: "To think that we all once had the power to control nature... What fools we were." },
    { id: 'prox_h6c', x: 6, y: 3, type: 'villager_f', text: "Prox originally flourished because concerned Adepts lit the fires of the Mars Lighthouse. Now, we, the people of the northern flame, have been forgotten by the outside world.", mind: "When the lighthouses were all extinguished, every great civilization faded away..." }] });
  Kit.home('prox_house8', { name: 'Prox', back: { map: 'prox', x: 11, y: 55 }, npcs: [
    { id: 'prox_h8a', x: 4, y: 5, type: 'proxian', text: "The people Saturos rescued from the storm in Vale should be waiting in their room. Once Mars Lighthouse has been lit, they'll be free to return home.", mind: "Mars is the last lighthouse that needs to be rekindled. Once that's been taken care of, the people of Vale will be set free." },
    { id: 'prox_h8b', x: 8, y: 6, type: 'villager_f', text: "Puelle, our chieftain, grew worried about Agatio and Karst. He's gone to the northern edge of town to wait for them.", mind: "Now that Saturos and his team are gone, Agatio is the last of our warriors. If something happens to them, our final hope is lost." },
    { id: 'prox_h8c', x: 6, y: 3, type: 'elder_f', text: "Don't forget, Felix, your mother and father are staying in the north end of Prox.", mind: "Saturos used Felix's parents to force Felix to follow him on his mission. We've fallen on hard times when we need to coerce people to join our cause." }] });
  Kit.interior('prox_igloo', { name: 'Igloo', w: 10, h: 8, doorX: 5, back: { map: 'prox', x: 36, y: 49 }, floor: 'snow', wall: 'wall_in_stone', furn: [['pot', 1, 2], ['crate', 8, 2]],
    npcs: [{ id: 'prox_ig1', x: 3, y: 3, type: 'villager_f', text: "Those poor children. They don't understand what's about to happen to us... I just want them to be happy in the short time left to us.", mind: "I can't bring myself to tell them what's going to happen to us... Oh, please, save us..." },
      { id: 'prox_ig2', x: 6, y: 3, type: 'child_f', text: "The wind is so cold and bitter that we decided to hide out inside our igloo...", mind: "Mama and Papa have been acting really strange lately... They seem so sad. Whenever I ask them what's wrong, they tell me to go outside and play some more." },
      { id: 'prox_ig3', x: 7, y: 5, type: 'child_m', text: "My parents told me that it would do me some good to get some fresh air, but I'm freezing!", mind: "I always catch a cold when I'm outside in weather like this... Does Mom want me to get sick?" },
      { id: 'prox_ig4', x: 2, y: 5, type: 'child_m', script: T3.proxIgloo, mind: "I hate igloos, but at least it's protecting us from the wind..." }] });
  // the mayor's house: the parents' empty room at the back, the first journey's missing Mercury Djinni, the stairs down
  Kit.interior('prox_mayor', { name: "Mayor's House", w: 14, h: 12, doorX: 7, back: { map: 'prox', x: 31, y: 13 }, floor: 'floor_wood', wall: 'wall_in',
    furn: [['carpet', 5, 3, 4, 3], ['table', 6, 4], ['chair', 5, 4], ['chair', 8, 4], ['bookshelf', 1, 2], ['bookshelf', 2, 2], ['fireplace', 10, 1], ['bed', 11, 6], ['bed_foot', 11, 7], ['bed', 9, 6], ['bed_foot', 9, 7], ['pot', 1, 8], ['shelf', 12, 2]],
    stairs: { x: 1, y: 5, down: true, to: 'prox_basement', tx: 2, ty: 3 },
    npcs: [{ id: 'prox_mayor_npc', x: 7, y: 3, type: 'elder_m', name: 'Mayor', text: () => G.flag('prox_parents_gone') ? "Felix... Puelle gave the order to free your parents the moment you returned. We went to their room, and it was empty. Not a footprint in the snow. I am sorry." : "Felix! You've come back to Prox. Your parents... they have been our guests. Puelle will want to speak with you at the north road.", mind: "Where could they have gone in this storm? Unless... no. No one goes to the lighthouse." }],
    build(M) { const missing = ['Fizz', 'Sleet', 'Mist', 'Spritz', 'Hail', 'Tonic', 'Dew'].find(n => !G.party.djinnFound.includes(n)); if (missing) M.djinni(missing, 11, 4, { fight: false }); } });
  Kit.interior('prox_basement', { name: "Mayor's Cellar", w: 10, h: 7, doorX: -1, floor: 'floor_stone', wall: 'wall_in_stone', furn: [['barrel', 7, 2], ['barrel', 8, 2], ['shelf', 4, 1]],
    stairs: { x: 2, y: 2, down: false, to: 'prox_mayor', tx: 1, ty: 6 } });

  // ---- the story ----
  // the child in the igloo asks after igloos
  T3.proxIgloo = function* (E) {
    const r = yield* E.ask('Felix, you like igloos, right?', 'Child', ['Yes', 'No']);
    if (r === 0) yield E.say("You WOULD say that... You come from somewhere warm and sunny! We didn't have anything to play with, so we just decided to make this thing...", 'Child');
    else yield E.say("Well, if you don't like cold things, you're in the wrong place! We just built this so that we'd have something to do to keep us warm...", 'Child');
  };
  // Mold, met on the riverbed: it dives into the snow
  T3.moldDive = function* (E) {
    yield E.say('The Venus Djinni starts, and dives headlong into the snow!'); Audio.sfx('jump'); E.despawn('mold_npc'); G.set('mold_hidden');
    const p = G.field.player; yield Engine.fadeOut(10); E.warpNow('prox', p.tx, p.ty, p.dir); yield Engine.fadeIn(10);   /* the pile it went under appears on the ice */
    yield E.say('A little pile of snow stirs where it went under.');
  };
  // coming up the lane into the storm
  T3.proxArrive = function* (E) {
    yield E.say("Prox. It's been three years since I left with Saturos and Menardi... The wind was never like this.", 'Felix');
    yield E.say("Look at the snow on the river, Felix. The Northern Reaches are freezing over. If the Mars beacon is not lit soon, this village will not see spring.", 'Kraden');
  };
  // the mayor's yard: a man comes out of the house to a waiting woman - Felix's parents are nowhere to be found
  T3.proxParentsGone = function* (E) {
    E.spawn('prox_hw', 33, 13, { type: 'villager_f', name: 'Woman', dir: DIR.LEFT }); yield 10;
    E.spawn('prox_hm', 31, 13, { type: 'proxian', name: 'Man', dir: DIR.DOWN }); yield E.walkTo('prox_hm', 30, 13, 1); E.face('prox_hm', DIR.RIGHT);
    yield E.say("They're not here...", 'Man');
    yield E.say("Strange... We looked all over the village, and we can't find any trace of them at all...", 'Woman');
    yield E.say("Everyone says they've practically vanished without a trace... It's so strange.", 'Man');
    yield E.say("You don't think they...", 'Woman'); yield E.say("They wouldn't have gone to the lighthouse...", 'Man'); yield E.say("Yeah, you're probably right.", 'Woman');
    yield E.say("Puelle's going to be upset that we didn't follow his order to free them, though.", 'Man');
    yield E.say('He was clear about it, too... "When Felix returns to Prox, set his parents free."', 'Woman');
    E.set('prox_parents_gone');
    yield E.say("(Felix's parents... and Isaac's father, gone from the room they were kept in. Nobody saw them leave.)");
  };
  // the council at the north road: Puelle, the elder and the villagers; the party takes on the lighthouse
  T3.proxCouncil = function* (E) {
    const has = (id) => !!G.party.get(id); const isaac = has('Isaac');
    E.pan(8, 4, 20); yield 20;
    yield E.say("We can't wait for Agatio and his men any longer... If we wait much longer, this wind and snow will make it impossible to reach the lighthouse. I'm going to the lighthouse... Will any of you come with me?", 'Puelle');
    yield E.say("Puelle, I can't let you go on your own...", 'Man'); yield E.say("If something were to happen to you, who would lead our village?", 'Man');
    yield E.say("Please, you must let us go in your stead.", 'Woman'); yield E.say("How can you expect to accomplish what Agatio and Karst could not?", 'Puelle');
    yield E.say("They may have been more powerful than any of us, but we can't just stand by!", 'Woman'); yield E.say("They're not coming back, just like Saturos... You have to let us try.", 'Man');
    yield E.say("I can't. I can't allow it.", 'Elder'); yield E.say("Listen to your elder... He speaks wisely.", 'Puelle');
    yield E.say("I'm speaking to you too, Puelle. If Agatio and Karst cannot do the task, how can you, a single man, hope to do it?", 'Elder');
    yield E.say("What are you saying? If we stand around debating, our town is doomed for certain!", 'Puelle'); yield E.say("We can't risk sacrificing any more lives.", 'Elder');
    yield E.say("So, we must sit here and wait for a miracle to come.", 'Puelle');
    E.panBack(20); yield 20; E.face('prox_elder', DIR.DOWN); E.face('Puelle', DIR.DOWN);
    yield E.say("You... Felix, it's you...", 'Elder'); yield E.say("I'd heard that you had returned to us... You look so much stronger than when you left.", 'Puelle');
    yield E.say("It seems he has brought some allies with him.", 'Elder'); yield E.say("Yes... I am Kraden.", 'Kraden');
    if (isaac) {
      yield E.say("My name is Isaac.", 'Isaac'); yield E.say("Isaac... Isn't that...", 'Elder'); yield E.say("That is the name of the one Agatio said had killed Saturos and Menardi.", 'Puelle');
      yield E.say("Isaac, stop that... You are correct, but Isaac had reasons for fighting them. Saturos and Menardi had invaded Vale, stolen its sacred treasure, triggered a volcano... You cannot blame Isaac for pursuing them and fighting to regain what they had stolen.", 'Kraden');
      yield E.say("We only wanted to stop them... We didn't think they'd fight us to the death. They flung themselves into the opening of Venus Lighthouse's beacon...", 'Isaac');
      yield E.say("Did... Saturos and Menardi put up a good fight?", 'Man'); yield E.say("I'll bet you thought you didn't stand a chance against them, huh? You were probably really tense the whole time...", 'Woman');
      yield E.say("Saturos and Menardi had a job to do... That was all.", 'Woman'); yield E.say("If I'd been in your shoes, I'd have done the same thing... I can't blame you.", 'Man');
      yield E.say("And in the end, you were stronger than they were... You should be proud of that.", 'Woman');
    }
    yield E.say("I am sad that they lost their lives in their quest, but there was no avoiding it.", 'Elder'); yield E.say("What has happened cannot be undone. We should cooperate to find a way to save Weyard.", 'Puelle');
    yield E.say("We understand that Agatio and Karst have made for Mars Lighthouse and not returned.", 'Kraden'); yield E.say("Then all that remains for us is to wait until Gaia Falls carries us all to our doom.", 'Elder');
    yield E.say("It seems that Mars Lighthouse is as dangerous as all the rest.", isaac ? 'Isaac' : 'Jenna'); yield E.say("We have only a few soldiers remaining, and none who can make the climb to the aerie.", 'Puelle');
    yield E.say("Only Saturos and perhaps Agatio were strong enough to reach the top...", 'Kraden'); yield E.say("And none of them can help us now.", 'Elder');
    const r = yield* E.ask('You think we can do it?', isaac ? 'Isaac' : 'Jenna', ['Yes', 'No']);
    yield E.say(r === 0 ? "I agree, Felix..." : "Felix, what are you thinking?", isaac ? 'Isaac' : 'Jenna');
    yield E.say("We've climbed three lighthouses already... What's one more? Let's go to Mars Lighthouse!", 'Kraden');
    yield E.say("They've proven themselves strong enough! I say we trust in Felix to do this!", 'Puelle'); yield E.say("This is an unexpected turn of events, but yes, I think you can light the lighthouse.", 'Elder');
    yield E.say("Off to Mars Lighthouse! Let's go, Felix!" + (isaac ? " Come on, Isaac!" : ""), 'Kraden');
    yield E.say("There is one thing that I don't want you to forget. In order to light the beacon at Mars Lighthouse, you will need to have the Mars Star.", 'Puelle');
    yield E.say("Ah! And Agatio and Karst have the Mars Star now!", 'Elder'); yield E.say("You must find Agatio and Karst, and you must take the Mars Star from them.", 'Puelle');
    yield E.say("Thanks for your help. The future of Weyard rests in your hands.", 'Elder');
    E.set('prox_council'); yield* E.chapter('Chapter 7: The Mars Lighthouse');
  };
}
