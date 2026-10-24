// ---------- Yallam ----------
// After map references/golden-sun-the-lost-age-yallam-gba-map.webp (the village panel, 44 x 24): a green hollow in
// red rock with the road down its east side, the domed stone houses (Sunshine's forge with its chimney at the top
// left, the inn at the top right, the sanctum's purple hut between them), the two little domes and the three leaf
// huts on the lower field beyond the cliff line and its gate, the stump by the forge that Force opens (the
// Masamune, much later), and Yepp's field east of the road where the children sing his songs. Per the guide: 16
// coins in the jar by the inn, Antidote and Nut under the bushes (Cyclone), the Elixir in the inn's box, the Oil
// Drop in Sunshine's barrel; Sunshine forges what is brought to him.
'use strict';
{
  const T2 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = { '.': 'grass', 'd': 'path', 'w': 'water', 't': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'grass', obj: 'rock_small' }, 'f': { ground: 'grass', obj: 'fence' }, 'k': { ground: 'grass', obj: 'stump' }, 'B': { ground: 'grass', obj: 'boulder' } };
  const Y = grid(44, 24, 'R');
  fill(Y, 2, 2, 34, 21, '.'); fill(Y, 36, 0, 37, 23, 'd'); fill(Y, 35, 9, 35, 10, '.');   // the hollow, the road, the way between them
  fill(Y, 2, 11, 34, 11, 'R'); Y[11][19] = '.'; Y[11][20] = '.';   // the cliff line across the hollow, and its gate
  fill(Y, 39, 6, 42, 16, '.'); fill(Y, 38, 10, 38, 11, '.');   // Yepp's field east of the road
  fill(Y, 2, 2, 8, 9, 'R'); fill(Y, 3, 3, 7, 8, '.'); Y[5][9] = 'k'; Y[5][8] = '.';   // the pocket behind the stump by the forge (the way to the Masamune, opened with Force)
  for (const [x, y] of [[3, 13], [9, 20], [16, 21], [22, 13], [33, 20], [3, 20], [23, 8], [33, 3], [40, 7], [42, 15], [9, 9], [31, 9]]) Y[y][x] = 't';
  for (const [x, y] of [[17, 3], [18, 3], [30, 20], [31, 20], [5, 4], [6, 5]]) Y[y][x] = 'b';
  for (const [x, y] of [[26, 9], [10, 12], [40, 9], [41, 13], [39, 12]]) Y[y][x] = 'o';
  fill(Y, 18, 12, 21, 12, 'f'); Y[12][19] = '.'; Y[12][20] = '.';
  defineMap('yallam', {
    name: 'Yallam', w: 44, h: 24, base: 'grass', music: 'yallam', bg: 'forest', entry: { x: 36, y: 22 },
    build(M) {
      M.paint(0, 0, strs(Y), LEG, { cliff: 'R', set: 'brownrock', faces: 2 });
      M.exit(36, 0, 2, 1, 'world_tla', 243, 206, DIR.UP); M.exit(36, 23, 2, 1, 'world_tla', 243, 208, DIR.DOWN);
      // the domes at the top: Sunshine's forge, the sanctum, the inn
      M.house(11, 2, 6, 5, 'roof_grey', { wall: 'wall_stone', to: 'yallam_forge', tx: 6, ty: 8, windows: false, chimney: true });
      M.house(19, 2, 5, 4, 'roof_purple', { wall: 'wall_stone', to: 'yallam_sanctum', tx: 6, ty: 8, windows: false });
      M.house(25, 2, 6, 5, 'roof_grey', { wall: 'wall_stone', to: 'yallam_inn', tx: 7, ty: 8, sign: 'inn_sign', windows: false });
      // the lower field: the item stall's hut, the armory, Yepp's old house, the two little domes
      M.house(4, 14, 5, 5, 'roof_green', { wall: 'wall_wood', to: 'yallam_itemshop', tx: 6, ty: 6, sign: 'shop_sign', windows: false });
      M.house(10, 14, 5, 5, 'roof_green', { wall: 'wall_wood', to: 'yallam_weaponshop', tx: 6, ty: 6, sign: 'weapon_sign', windows: false });
      M.house(16, 15, 5, 5, 'roof_green', { wall: 'wall_wood', to: 'yallam_house3', tx: 5, ty: 7, windows: false });
      M.house(24, 14, 5, 5, 'roof_grey', { wall: 'wall_stone', to: 'yallam_house1', tx: 5, ty: 7, windows: false });
      M.house(30, 14, 5, 5, 'roof_grey', { wall: 'wall_stone', to: 'yallam_house2', tx: 5, ty: 7, windows: false });
      M.setObj(14, 8, 'well');
      // the stump Force moves (Isaac's, much later): the pocket behind it and the chest
      M.object('stump', 9, 5, { id: 'yal_stump', onForce: function* (E) { const o = G.field.map.objects.find(ob => ob.id === 'yal_stump'); if (o) { o.gone = true; G.set('obj:' + o.key, { gone: true }); } Engine.doShake(10); yield E.say('The stump is blasted out of the ground and the way past it is open.'); } });
      M.setObj(9, 5, null); M.chest(4, 4, 'Masamune', 1);
      // the people, with the script's lines
      M.npc('yal_001', 22, 8, { type: 'villager_m', move: 'wander', text: "Yallam doesn't get many visitors. Hasn't for a long time. I'd love to know a little about what's going on in the outside world.", mind: "(Yepp was the one who visited the lands beyond eastern Osenia. Since he died, we've had no news from the outside world at all.)" });
      M.npc('yal_002', 28, 9, { type: 'villager_f', dir: DIR.DOWN, text: 'Our master boatsman, Yepp, died. Now, all we have to remember him are the songs he wrote.', mind: "(Singing with Yepp and all the children in the village helped us remember the songs. It's funny how we all memorized every one of Yepp's songs.)" });
      M.npc('yal_003', 12, 9, { type: 'elder_m', dir: DIR.DOWN, text: 'If Yepp were alive today, our village would be thriving. He brought us lots of work.', mind: "(Those pearls Yepp brought back from the sea were the most marvelous things I've ever seen. If he were still with us, Yallam wouldn't be in this terrible fix.)" });
      M.npc('yal_004', 30, 20, { type: 'sailor', move: 'wander', text: "Yepp was the one who taught me how to handle a boat. That was right before he died... He'd promised to teach me how to dive for pearls... Poor Yepp. I really miss him.", mind: "(I've searched the seas from north to south, and I just can't find those pearls... I wonder if the pearls from his secret place are all gone...)" });
      M.npc('yal_006', 6, 20, { type: 'elder_m', dir: DIR.RIGHT, text: "There used to be a lot of pearl divers here in Yallam. I used to do some diving myself! Yup... They were all younger than me, but I still gave 'em a good run for the money.", mind: '(Yepp was amazing. He could cut clean through the Sea of Time with utter ease. He read those waves like no other sailor on Weyard. He was a true man of the sea.)' });
      M.npc('yal_007', 20, 21, { type: 'villager_m', move: 'wander', text: 'Yepp found this huge bed of pearls and sold them in another town. Then, he bought all kinds of things we needed in Yallam.', mind: "(Yepp never told any of us where he found his bed of pearls, but... I suspect it's somewhere near the center of the Eastern Sea. He knew that area pretty well.)" });
      M.npc('yal_014', 33, 12, { type: 'villager_f', dir: DIR.LEFT, text: "It's been really dry the past few months. Even Taopo Swamp has dried up.", mind: "(When Taopo Swamp dries up, we're in for some serious drought problems this year.)" });
      M.npc('yal_016', 9, 11, { type: 'villager_m', dir: DIR.DOWN, text: "Sunshine has started complaining that he can't work lately. He blames it on the lack of rain.", mind: '(What kind of person only wants to work when it\'s raining? I know Sunshine likes to enjoy his days off, but he needs to find a better excuse not to work.)' });
      M.npc('yal_017', 18, 7, { type: 'villager_f', move: 'wander', text: "Our blacksmith, Sunshine, makes the kinds of items you can't find anywhere else. You wouldn't know it to look at him... or talk to him... but he's an amazing worker...", mind: "(Sunshine's a little eccentric. He disappears into Taopo Swamp for days at a time...)" });
      // Yepp's field: the children and his songs
      M.npc('yal_008', 40, 11, { type: 'child_m', dir: DIR.DOWN, script: function* (E) {
        // Yepp's three songs, as the script gives them: the way through the Sea of Time, sung as a children's game
        const r = yield* E.ask("Do you want to hear one of the songs Yepp wrote?", 'Boy'); if (r !== 0) { yield E.say("Well, that's just fine then. Give me a holler if you ever do.", 'Boy'); return; }
        yield E.say('Here, let me show you!', 'Boy'); Audio.play('yepp'); yield E.say('(He and the other children line up. They do as the song says.)');
        yield E.say("If you want to go to the stars, if you want to go to the stars. Go north past the twins, passing two swirls, run deasil twice 'round the trunk.", 'Boy');
        yield E.say("Haste without waste, and head to the east, past three to the north. There, run 'round thrice and wait for the waves. When they stop, run north and go to the stars.", 'Boy');
        yield E.say("If you race full of folly and take the wrong way, you'll find yourself a watery grave.", 'Boy');
        const r2 = yield* E.ask("Do you wanna hear the second children's song Yepp wrote?", 'Boy'); if (r2 !== 0) { Audio.play('yallam'); yield E.say("Well, that's just fine then. Give me a holler if you ever do.", 'Boy'); return; }
        Audio.play('yepp2');
        yield E.say("If you want to go to the moon, if you want to go to the moon. Face west from the stars and run straight past three swirls, then circle 'round twice.", 'Boy');
        yield E.say("Haste without waste, and head to the south, then one swirl west. There, run 'round thrice and wait for the waves. When they stop, run south and go for the moon.", 'Boy');
        yield E.say("If you race full of folly and take the wrong way, you'll find yourself a watery grave.", 'Boy');
        const r3 = yield* E.ask("OK, so, now do you want to hear the third children's song?", 'Boy'); if (r3 !== 0) { Audio.play('yallam'); yield E.say("Well, that's just fine then. Give me a holler if you ever do.", 'Boy'); return; }
        Audio.play('yepp');
        yield E.say("If you want to go to the sun, if you want to go to the sun. Face south from the moon and run straight through two swirls, then circle 'round twice.", 'Boy');
        yield E.say("Haste without waste, and head to the west, then six to the north. There, run 'round thrice and wait for the waves. When they stop, run north and go for the sun.", 'Boy');
        yield E.say("If you race full of folly and take the wrong way, you'll find yourself a watery grave.", 'Boy');
        G.set('yepp_songs_heard'); Audio.play('yallam');
        yield E.say("That's it. That's all the games we have for the songs... If you want to play some more, just give me a holler.", 'Boy');
        yield E.say('(Stars, moon, sun... twins and swirls and trunks. A boatsman who hid his pearl bed taught the children the way to it, and called it a game.)', 'Kraden');
      }, mind: "(Yepp's songs are a lot of fun, because he made this game that goes along with them...)" });
      M.npc('yal_009', 42, 9, { type: 'child_f', move: 'wander', text: 'Yepp wrote all of his children\'s songs while he was out here in his own private space.', mind: "(The story is that all these objects around here were brought here by Yepp long, long ago. If you look around, you'll see that everything was arranged in accordance with his songs...)" });
      M.npc('yal_012', 41, 15, { type: 'child_m', move: 'wander', text: 'Yepp had three different songs he used to sing. Each song was about a different situation.', mind: '(The songs are supposed to mean something, but none of the other kids knows what...)' });
      M.npc('yal_013', 39, 14, { type: 'child_f', dir: DIR.RIGHT, script: function* (E) { const r = yield* E.ask('Do you like children\'s songs?', 'Girl'); yield E.say(r === 0 ? "Hmmm... Well, I don't care for them so much, myself. I mean, the lyrics make no sense! ...And that stupid dance we have to do when we sing!!" : "Yeah, you're totally right. I just hate those songs. One of these days, I'll write one, and it'll be so much better than this!", 'Girl'); }, mind: '(I wonder why Yepp wanted the children to learn those songs he used to sing...)' });
      M.sign(35, 22, 'Yallam. Sunshine the smith works here - when it rains.');
      M.trigger(35, 20, 3, 3, function* (E) { yield E.say('Yallam. A village in a hollow of red rock, and the air is dry as a bone.', 'Kraden'); yield E.say('A smithy, up there with the chimney. If half of what the sailors said of Sunshine is true, we should meet him.', 'Piers'); }, { once: 'yallam_seen' });
    }
  });
  Kit.inn('yallam_inn', { name: 'Yallam Inn', price: 64, back: { map: 'yallam', x: 27, y: 7 }, npcs: [{ id: 'yallam_inn_keeper', x: 3, y: 2, type: 'merchant', inn: 64, name: 'Innkeeper', text: "It's a bit strange trying to run an inn in a city that never gets tourists, isn't it? Well, sometimes, the locals like to stay here. It's like a little vacation for them, I guess.", mind: '(Yallam was always such a poor town. We had to work hard just to break even.)' }, { id: 'yal_inn2', x: 9, y: 6, type: 'villager_m', text: "Taopo Swamp has dried up, and now it's inaccessible. What's worse, with no water, we can no longer get any more delicious Yallam mountain fish.", mind: "(There weren't a lot of mountain fish after the swamp dried up. We probably won't catch many.)" }] });
  Kit.sanctum('yallam_sanctum', { name: 'Yallam Sanctum', back: { map: 'yallam', x: 21, y: 6 }, npcs: [{ id: 'yallam_sanctum_priest', x: 6, y: 4, type: 'priest', sanctum: true, name: 'Healer', text: 'Even out in these far-off shores, people need the services and hope I bring. I am grateful merely to have the chance to bring them some small relief.', mind: '(Once, this was a thriving village. Now, I look around, and I only see abject poverty and despair.)' }] });
  Kit.shop('yallam_itemshop', { name: 'Yallam Item Shop', shop: 'yallam_item', back: { map: 'yallam', x: 6, y: 19 }, npcs: [{ id: 'yallam_itemshop_keeper', x: 5, y: 2, type: 'merchant', shop: 'yallam_item', name: 'Shopkeeper', dir: DIR.DOWN, text: "If you're looking for Taopo Swamp, head west around the northern mountain range. Sunshine sometimes goes up there by himself on long trips. It's a dangerous place.", mind: "(What does Sunshine want in Taopo Swamp? There's nothing up there but bugs and some odd mountain fish.)" }] });
  Kit.shop('yallam_weaponshop', { name: 'Yallam Armory', shop: 'yallam_weapon', back: { map: 'yallam', x: 12, y: 19 }, npcs: [{ id: 'yallam_weaponshop_keeper', x: 5, y: 2, type: 'merchant', shop: 'yallam_weapon', name: 'Shopkeeper', dir: DIR.DOWN, text: "If the blacksmith isn't willing to work, then how am I supposed to get fine weapons to sell? If you want plain old, boring armor, have a look around.", mind: '(If Sunshine set his mind to it, he could make a lot of money! What a waste of talent...)' }] });
  Kit.home('yallam_house1', { back: { map: 'yallam', x: 26, y: 19 }, npcs: [{ id: 'yal_005', x: 5, y: 5, type: 'villager_f', text: 'Yepp told me the only thing he could teach me was how to sail and how to sing.', mind: '(Yepp always sang such wonderful children\'s songs whenever he played with them.)' }] });
  Kit.home('yallam_house2', { back: { map: 'yallam', x: 32, y: 19 }, npcs: [{ id: 'yal_015', x: 5, y: 5, type: 'elder_f', text: "We're supposed to be right in the middle of the rainy season, but I don't see any rain...", mind: "(I can't stand this drought! How long is the weather going to be like this?)" }] });
  Kit.home('yallam_house3', { back: { map: 'yallam', x: 18, y: 20 }, npcs: [{ id: 'yal_010', x: 4, y: 5, type: 'child_m', text: "Running around in circles here while singing one of Yepp's songs is pretty tough.", mind: "(There's a lot of stuff to remember for each song. It's tough to play without making any mistakes.)" }, { id: 'yal_011', x: 7, y: 5, type: 'child_f', text: "There's a game that goes along with the song, but it's tough. I want to play something else.", mind: "(I once heard that children's songs and stories have hidden meanings. I wonder if Yepp has hidden anything in his songs...)" }] });
  Kit.interior('yallam_forge', { name: "Sunshine's Forge", w: 12, h: 10, floor: 'floor_stone', wall: 'wall_in_stone', back: { map: 'yallam', x: 13, y: 7 }, furn: [['fireplace', 5, 1], ['fireplace', 6, 1], ['counter', 3, 4], ['counter', 4, 4], ['counter', 5, 4], ['barrel', 1, 7], ['crate', 10, 7], ['bed', 9, 2], ['bed_foot', 9, 3]],
    npcs: [{ id: 'Sunshine', x: 5, y: 3, look: NPC_LOOKS.Sunshine, name: 'Sunshine', script: T2.sunshine, mind: "(If it's not raining, I can't get into Taopo Swamp. And if I can't get to Taopo, then I can't get the stuff I need to work, so there's no point!)" },
      { id: 'sun_wife', x: 2, y: 6, type: 'villager_f', name: "Sunshine's Wife", text: "This? This is the blacksmith Sunshine's smithy, the best forge in Weyard! But Sunshine's not taking any jobs right now.", mind: "(Sunshine's a pretty stubborn guy. If he says he isn't going to work, then he's not gonna work.)" },
      { id: 'sun_son', x: 8, y: 6, type: 'child_m', name: "Sunshine's Son", text: "Dad's not doing any work right now, but I'm making some basic things for the villagers. Maybe someday, I'll be able to smith unique weapons, like my dad. That's why I keep practicing!", mind: "(Everyone thinks Dad is stubborn, but he's not... He's a true artist, and so what if he gets a little temperamental from time to time?)" }] });
}
