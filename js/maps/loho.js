// ---------- Loho ----------
// The diggers' colony on the west coast of Angara, after map references/golden-sun-the-lost-age-loho-gba-map.webp
// (rows in js/maps/loho_layout.js from tools/towns/loho_build.py): a mining camp on three brown terraces round the
// blue-stone ruins the settlers moved into - the inn and store (1), the courtyard ruin and its hall (2), two homes on
// the east terrace (3, 4), a home by the ladder (5) and the healer's house (6) - with the colonnades and the dig hole
// of the excavations below, and up on the right-hand terrace the ancient cannon the diggers hauled up to knock down
// the wall to the north. Per the guide and the script: the cannon is empty until the Magma Ball; fired, it blasts
// the wall (loho_blasted), the three diggers give the cannon away and carry it to the ship (loho_cannon_given), and on
// leaving town they report it aboard (ship_cannon, loho_cannon_aboard) - the Northern Reaches' ice wall needs it.
// Beyond the wall: the Jupiter Djinni Lull and a Golem Core under Scoop; in town a Golem Core under a Lift boulder
// and Scoop, Mythril Silver under Scoop by the lower-left ruin, Crystal Powder in the barrel by the healer's house.
'use strict';
{
  const T3 = STORY_TLA;
  const LEGEND = {
    ' ': 'void', '.': 'grass', ':': 'sand', 'b': 'lo_floor', 'x': 'lo_rubble', 'h': 'lo_hole',
    'c': { ground: 'sand', obj: 'lo_block' }, 'u': { ground: 'sand', obj: 'lo_urn' }, 'r': { ground: 'sand', obj: 'rock_sand' }, 'R': { ground: 'grass', obj: 'rock_sand' },
    'L': { ground: 'sand', obj: 'ladder', walk: true }, 'D': { ground: 'lo_floor', obj: 'door_stone', walk: true },
  };
  const LOHO_ENC = [['Grand Chimera'], ['Wolfkin', 'Wolfkin'], ['Minos Knight']];   // never fought: no encounters in town, but the world outside uses Angara's
  // the diggers' words, before the wall comes down and after (the script's [001]..[008])
  const say = (before, after) => () => G.flag('loho_blasted') ? after : before;
  const FOLK = [
    ['loho_v1', 3, 20, 'villager_m', say("Welcome to Loho! We've been excavating all sorts of ores to get the metals inside! The metal used to make the ancient ruins might have come from these very rocks!", "Was that you that fired the cannon earlier? If you know how to use the cannon, you'll be able to sail in the Northern Sea."),
      say("We only settled here a short while ago, and we found all those ruins here... We named our settlement Loho, but I've been wondering what it used to be called...", "That cannon can shatter any of the ice floes that keep the ships from trying to sail north.")],
    ['loho_v2', 15, 29, 'villager_m', say("We have a lot of important excavations going on, but we're also doing some mining.", "That cannon sure gives off a serious bang! Everyone in Loho was totally shocked!"),
      say("Everyone in Loho sure loves digging. It's not all mining... We're interested in history, too.", "That cannon was really loud... Imagine if you were standing right next to it!")],
    ['loho_v3', 9, 27, 'villager_m', say("Once we can get through the wall, there will be enough work for everyone in town!", "I've gotta go stake myself a claim on the other side of the wall! We've found some valuable metals out here; think what we'll find inside!"),
      say("If you live in Loho and you don't dig, you're not one of us... You don't belong.", "I just need to stick to this one spot. Eventually, I'll dig up something valuable!")],
    ['loho_v4', 30, 13, 'villager_f', say("If you want to be a miner, you have to know the earth... You have to know where to dig.", "You probably only want the cannon so that you can force other people to obey your will."),
      say("Real experts can find the best spots to dig in a single glance.", "These guys must be really busy, sailing around all over the world like that.")],
    ['loho_v5', 7, 36, 'elder_m', say("I haven't found anything worth the trouble of digging up. It's time to find another spot.", "I think we've dug up all that there is out here. I'm going to find myself a new spot inside the wall."),
      say("I think I'm starting to lose my touch... None of my digs has produced anything at all.", "Even at my age, I just love the feel of digging into the earth. Still, when you're not digging up anything good, you start to feel a little frustrated.")],
    ['loho_v7', 22, 21, 'villager_m', say("That wall seems indestructible! We've been trying to dig through it for a while now. We're pretty sure there are some valuable metals and minerals on the other side.", "When we found that cannon at the dig, I thought it was just useless junk. If you know how to use it, it can be a pretty potent tool!"),
      say("If we can't get through that wall, we'll never know what's on the other side...", "I don't think we should have given the cannon away. We should have sold it to Tolbi.")],
  ];
  const v8 = () => !G.flag('loho_blasted') ? "Some of the miners found an ancient cannon when they were digging a while back. If you want to see it, it's over by the wall near the ruins." : !G.flag('loho_cannon_aboard') ? "I saw some of the village men carrying the cannon out of town..." : "Now that the wall's been breached, we can get on with the mining! Good work!";
  const v8m = () => !G.flag('loho_blasted') ? "All we need is a way to use the cannon to knock down the wall... That would be great. Then, we could get rid of the cannon altogether. We don't have any use for weapons here." : !G.flag('loho_cannon_aboard') ? "I don't know where they were taking it, but I'm glad the cannon's gone... I think they just wanted to make some room for us to begin mining again." : "We don't have anything to worry about, now that we can start mining in the ruins...";
  defineMap('loho', {
    name: 'Loho', w: 42, h: 44, base: 'void', music: 'town', bg: 'sand', entry: { x: 1, y: 19 }, retreat: { map: 'world_tla', x: 120, y: 87, dir: DIR.DOWN },
    build(M) {
      const blasted = G.flag('loho_blasted');
      const rows = LOHO_ROWS.map(r => r.replace(/X/g, blasted ? 'x' : '#'));
      M.paint(0, 0, rows, LEGEND, { cliff: '#', set: 'cliff', faces: 1 }); M.paint(0, 0, rows, {}, { cliff: 'W', set: 'lohostone', faces: 1 });
      // the doors: the inn and store (1), the hall behind the courtyard (2), the homes (3, 4, 5), the healer (6)
      M.exit(5, 14, 1, 1, 'loho_inn', 7, 8, DIR.UP, { door: true }); M.exit(17, 18, 1, 1, 'loho_hall', 6, 8, DIR.UP, { door: true });
      M.exit(36, 14, 1, 1, 'loho_house3', 6, 8, DIR.UP, { door: true }); M.exit(36, 19, 1, 1, 'loho_house4', 6, 8, DIR.UP, { door: true });
      M.exit(5, 25, 1, 1, 'loho_house5', 6, 8, DIR.UP, { door: true }); M.exit(24, 28, 1, 1, 'loho_sanctum', 6, 8, DIR.UP, { door: true });
      // the way in from the beach (the world lands the party beside Loho's marker)
      M.exit(0, 19, 1, 2, 'world_tla', 120, 87, DIR.LEFT); M.walkable(0, 19, 1, 2);
      // the cannon, up on the terrace and aimed at the wall; the marks its wheels left once the diggers carried it off
      if (!G.flag('loho_cannon_given')) M.object('spot', 31, 10, { id: 'loho_cannon', tile: 'lo_cannon', script: T3.lohoCannon }); else { M.set(31, 10, 'lo_cannon_gone'); M.setObj(31, 10, null); }
      // beyond the wall: Lull, and the Golem Core under the dirt (the wall keeps the plateau shut until it is blasted)
      M.djinni('Lull', 26, 4, { fight: true });
      // the Golem Core under the boulder on the slope: Lift it, then Scoop
      M.object('boulder', 10, 10, { id: 'loho_rock' }); M.object('scoop', 10, 10, { id: 'loho_core2', item: 'Golem Core', look: 'dig_spot' });   // the boulder first: Scoop finds it, not the dirt, until Lift
      // the three diggers by the cannon - and after the blast, past the wall with their picks
      const men = blasted ? [[29, 4, DIR.DOWN], [33, 5, DIR.LEFT], [31, 3, DIR.DOWN]] : [[29, 10, DIR.RIGHT], [33, 10, DIR.LEFT], [30, 11, DIR.UP]];
      const lines = blasted ? [
        ["Ha ha ha! I've got this giddy feeling, like I'm going to dig up a mountain of money! Whenever I get this feeling, I always dig out a fortune!", "It doesn't matter how old you get... Nothing beats the feeling of digging a new mine."],
        ["I keep digging up little, tiny gems and metals... But when I get enough, I'll be rich! After all, when you pile up enough dirt, you eventually make a mighty mountain!", "I've hit the mother lode! I keep on digging, and I keep getting more and more!"],
        ["Thanks for opening up the wall... There are some great places to dig out here!", "I only just started digging, and I'm already wealthy beyond my wildest dreams!"]] : [
        [null, "All right, we figured out that you need to put a steel ball in there, but what do you do then? You stick a ball in there just fine, but I don't think it'll be coming out on its own..."],
        ["We brought the cannon up here to break down the old wall, but we don't have any ammunition...", "Cannons are so heavy! Why did we bring it up here if we're not going to use it?"],
        ["You can put metal balls in the barrel, but what makes them come out again? It looks a little like an old ballista, but the way it works is totally different.", "What idiot said that we'd be able to destroy that wall if we dragged the cannon up here?"]];
      men.forEach(([x, y, dir], i) => M.npc('loho_d' + (i + 1), x, y, { type: i === 1 ? 'villager_m' : 'sailor', name: 'Digger', dir, text: lines[i][0] || undefined, script: i === 0 && !blasted ? T3.lohoCannonOffer : undefined, mind: lines[i][1] }));
      for (const [id, x, y, type, text, mind] of FOLK) M.npc(id, x, y, { type, move: 'wander', text, mind });
      M.npc('loho_v8', 13, 20, { type: 'villager_m', text: v8, mind: v8m });
      M.sign(2, 21, 'LOHO. The diggers\' town. The beach lies west; the wall of the old city stands north.');
      // leaving town once the cannon is given: the diggers report it aboard
      const aboard = { cond: () => G.flag('loho_cannon_given') && !G.flag('loho_cannon_aboard') }; M.trigger(1, 19, 1, 2, T3.lohoCannonAboard, aboard); M.trigger(0, 21, 2, 3, T3.lohoCannonAboard, aboard);   /* every way to the exit: beside it, and the strip below it (a walk up the west edge from the fifth house) */
    }
  });
  // (1) the inn and the store share one house: two counters, one keeper for each (the script's [012])
  Kit.interior('loho_inn', { name: 'Loho Inn', w: 14, h: 11, doorX: 7, back: { map: 'loho', x: 5, y: 15 },
    furn: [['counter', 2, 3], ['counter', 3, 3], ['counter', 4, 3], ['counter', 9, 3], ['counter', 10, 3], ['counter', 11, 3], ['bed', 11, 6], ['bed_foot', 11, 7], ['bed', 9, 6], ['bed_foot', 9, 7], ['table', 4, 6], ['chair', 3, 6], ['chair', 5, 6], ['pot', 1, 8], ['shelf', 1, 2], ['shelf', 12, 2], ['barrel', 12, 8]],
    npcs: [{ id: 'loho_inn_keeper', x: 3, y: 2, type: 'merchant', inn: 88, name: 'Innkeeper', dir: DIR.DOWN }, { id: 'loho_shop', x: 10, y: 2, type: 'merchant', shop: 'loho_item', name: 'Storekeeper', dir: DIR.DOWN,
      text: () => G.flag('loho_cannon_given') ? "I hear you took our cannon in exchange for knocking down that ancient wall. I'll be sorry to see it go... That cannon was going to make Loho famous." : "Commerce really took off when we started this mining colony in Loho. You just have to know how to make the most out of what's around you...",
      mind: () => G.flag('loho_cannon_given') ? "Now, we don't have a symbol anymore... We just have a town full of holes." : "Whenever someone strikes gold, we get a rush of visitors, and business just takes off." }],
    build(M) { M.sign(6, 3, 'It reads "People staying at the inn can check in at the counter."'); } });
  // (2) the hall behind the courtyard: the foreman's, with the finds laid out
  Kit.interior('loho_hall', { name: 'Loho', w: 12, h: 10, back: { map: 'loho', x: 17, y: 17 }, floor: 'floor_stone', wall: 'wall_in_stone',
    furn: [['carpet', 4, 3, 4, 4], ['table', 2, 3], ['shelf', 1, 2], ['shelf', 9, 2], ['bookshelf', 10, 2], ['crate', 1, 7], ['crate', 10, 7], ['pot', 9, 7]],
    npcs: [{ id: 'loho_v6', x: 5, y: 4, type: 'elder_m', name: 'Foreman', dir: DIR.DOWN, text: () => G.flag('loho_blasted') ? "Ah, so you have a quest to fulfill, do you? I guess that means you're leaving soon. When I was your age, I used to love the life of danger and adventure." : "This is the spot. A good hole here, and you'll dig up some fantastic ore...",
      mind: () => G.flag('loho_blasted') ? "When they get wherever they're going, they'll tell the world that Loho's got the best metal!" : "Once you've been mining for a while, it's like the ground says to you, \"Hey! Hey, you! Dig here!\"" }] });
  Kit.home('loho_house3', { name: 'Loho', back: { map: 'loho', x: 36, y: 15 } });
  Kit.home('loho_house4', { name: 'Loho', back: { map: 'loho', x: 36, y: 20 }, chests: [[9, 3, 'Antidote', 1]] });
  Kit.home('loho_house5', { name: 'Loho', back: { map: 'loho', x: 5, y: 26 } });
  Kit.sanctum('loho_sanctum', { name: 'Loho Sanctum', back: { map: 'loho', x: 24, y: 29 }, npcs: [] });
  // the healer's own words (the sanctum's priest keeps the rites; the script's Healer is this house's keeper)
  (function () { const def = MAPS.loho_sanctum; const b0 = def.build; def.build = function (M) { b0.call(this, M); const p = M.npcs.find(n => n.id === 'loho_sanctum_priest'); if (p) { p.name = 'Healer'; p.text = () => G.flag('loho_cannon_given') ? "You've acquired a splendid cannon. Just be sure that you use it wisely." : "If you're only here for the cannon, you can forget about it."; p.mind = () => G.flag('loho_cannon_given') ? "It worries me to no end, thinking of the evils one could do with that cannon." : "If the cannon is truly as powerful as the people say, we can't just give it away."; } }; })();

  // ---- the story ----
  // [009] by the cannon: the offer
  T3.lohoCannonOffer = function* (E) {
    if (G.flag('loho_blasted')) return;
    const r = yield* E.ask('Did you want this cannon?', 'Digger', ['Yes', 'No']);
    if (r === 0) yield E.say("Well, if you can figure out a way to break down this wall, it's all yours.", 'Digger');
    else { yield E.say("All we really want to do is break down that wall right there...", 'Digger'); yield E.say("If we can find someone to do that, we'll give 'im the cannon.", 'Digger'); }
  };
  // the cannon itself: empty until the Magma Ball; fired, the wall comes down and the diggers give it away
  T3.lohoCannon = function* (E) {
    if (G.flag('loho_blasted')) { yield E.say('The old cannon, still warm. The wall it faced lies in rubble.'); return; }
    if (!G.inventory.has('Magma Ball')) { yield E.say("It looks like it's empty."); return; }
    const r = yield* E.ask('Load the Magma Ball and fire the cannon at the wall?', null, ['Fire', 'Not yet']); if (r !== 0) return;
    G.inventory.remove('Magma Ball'); yield E.say('Felix loads the Magma Ball into the cannon...');
    E.pan(31, 8, 20); yield 20; Audio.sfx('boom'); Engine.doFlash(12, '#ffffff'); Engine.doShake(40); yield 30;
    const M = G.map; for (const [x, y] of [[30, 7], [31, 7], [32, 7], [30, 8], [31, 8], [32, 8]]) { M.set(x, y, 'lo_rubble'); M.setObj(x, y, null); M.walkable(x, y); }
    M.finalize(); G.set('loho_blasted'); yield 20; E.panBack(20); yield 20;
    yield E.say('Is everyone all right?', 'Digger'); yield E.say("Did you hear that? That sound was incredible!", 'Digger');
    E.face('loho_d2', DIR.DOWN); yield E.say("What do you think you're doing, making all that noise?", 'Digger');
    E.face('loho_d3', DIR.UP); yield E.say('Hey, look at that!', 'Digger'); E.face('loho_d1', DIR.UP); E.face('loho_d2', DIR.UP);
    yield E.say("What are you looking at? It wasn't me! It was the wall! Look at the wall!", 'Digger');
    yield E.say('The wall... It\'s gone!', 'Digger'); yield E.say("Well, it's mostly gone, yeah... You can get through to the other side now!", 'Digger');
    E.face('loho_d3', DIR.DOWN); yield E.say('How did you manage to break down the wall?', 'Digger');
    yield E.say("Ah, never mind... What's important here is that we can dig on the other side of the wall now!", 'Digger'); yield E.say("Yeah, who cares how it happened? We can dig again!", 'Digger');
    yield E.say("Well, you did what we asked, so the cannon's all yours!", 'Digger'); yield E.say("Hmmm... It's gonna be tough carrying that thing around...", 'Digger');
    yield E.say("Those guys are new in town, aren't they? Do you think they came from Atteka or Hesperia?", 'Digger'); yield E.say("I don't know, but I can tell you they came by boat...", 'Digger');
    yield E.walkTo('loho_d2', 36, 15, 2); yield 10; E.emote('loho_d2', '!'); yield E.say('Yeah, I saw one anchored off the beach!', 'Digger'); yield E.walkTo('loho_d2', 33, 10, 2);
    const yes = yield* E.ask("That boat's yours, isn't it?", 'Digger', ['Yes', 'No']);
    if (yes === 0) yield E.say("Well, why don't you let us get that cannon onto your boat for you, hm?", 'Digger');
    else { yield E.say("Look, the only way to get here is by boat, and I see a boat right there! Don't tell me it's not yours!", 'Digger'); yield E.say("I don't know why I'm offering, but why don't you let us put it aboard your boat for you?", 'Digger'); }
    yield E.say('(The three diggers heave the cannon onto a cart and trundle it away down the terrace, toward the beach.)');
    yield Engine.fadeOut(25); const c = M.objects.find(o => o.id === 'loho_cannon'); if (c) { c.gone = true; G.set('obj:loho:spot:loho_cannon', { gone: true }); } M.set(31, 10, 'lo_cannon_gone'); M.finalize();
    for (const id of ['loho_d1', 'loho_d2', 'loho_d3']) E.despawn(id);
    G.set('loho_cannon_given'); G.field.refreshNpcs(); yield Engine.fadeIn(25);
    yield E.say("(Felix's ship now carries a cannon.)");
  };
  // leaving Loho with the cannon given: the diggers catch the party at the gate
  T3.lohoCannonAboard = function* (E) {
    E.spawn('loho_d1x', 2, 21, { type: 'sailor', name: 'Digger', dir: DIR.UP }); E.spawn('loho_d2x', 3, 21, { type: 'villager_m', name: 'Digger', dir: DIR.UP });
    yield E.say("You don't have anything to worry about. We got the cannon onto your ship with no problems.", 'Digger');
    yield E.say("Now, we're going to start excavating the ground north of the wall you knocked a hole in.", 'Digger');
    yield E.walkTo('loho_d1x', 8, 21, 2); yield E.walkTo('loho_d2x', 9, 21, 2); E.despawn('loho_d1x'); E.despawn('loho_d2x');
    G.set('ship_cannon'); G.set('loho_cannon_aboard');
  };
}
