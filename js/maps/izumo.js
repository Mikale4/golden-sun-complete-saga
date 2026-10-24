// ---------- Izumo, and Izumo Ruins ----------
// After map references/golden-sun-the-lost-age-izumo-and-izumo-ruins-gba-map.webp: the village of pink-roofed
// stilt-houses on the bends of its river - Kushinada's house and Uzume's residence on the west bank over the plank
// bridge, the ring of giant stones on the island in the river's crook (one stone out of its place: Move sets it
// back, and Reveal finds the way down to the ruins), the market stand in the middle of town, the inn and the
// sanctum, the homes. Per the guide: the inn (60 coins); Festival Coat in the south-east home's box, Antidotes
// under the bushes at the lower right, the Lucky Medal under the bushes on the north-west rise, Elixir in the right
// jar outside Uzume's, Water of Life in the jar across the river (a jump from the island), Smoke Bomb in the most
// eastern home's jar; the Dancing Idol to Uzume for Coal once the serpent is dead. The ruins: Sand across the
// central sand under the columns, Frost on the two puddles in the crack, Pound on the column and Sand under the
// rock, the brown pillar Moved five times into the gap for the ladder down; Phantasmal Mail up the ladder, Pound
// on either column, Parch on the pool for the back room and Ulysses.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const WORLD = { map: 'world_tla', x: 259, y: 95, dir: DIR.DOWN };
  const LEG = {
    '.': 'grass', 'p': 'path', 'w': 'water', 'W': 'water_hop', 'B': 'bridge', 'V': 'bridge_v', 'f': 'flowers',
    'T': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'r': { ground: 'grass', obj: 'rock_small' }, 'j': { ground: 'grass', obj: 'pot' }, 's': { ground: 'grass', obj: 'stilt_steps' }
  };
  const HOUSE = { wall: 'wall_izumo', doorTile: 'door_izumo', windowTile: 'window_izumo' };
  // ====================== the village ======================
  const A = grid(34, 44, '.');
  fill(A, 0, 0, 33, 1, 'T'); fill(A, 0, 40, 33, 43, 'T'); fill(A, 0, 2, 1, 39, 'T'); fill(A, 32, 2, 33, 39, 'T'); A[30][0] = 'p'; A[30][1] = 'p';   // the wood all round, the way in from the west
  fill(A, 2, 2, 2, 12, 'T'); fill(A, 31, 2, 31, 4, 'T'); for (const [x, y] of [[3, 14], [2, 24], [30, 22], [31, 30], [29, 37], [8, 37], [16, 38], [24, 38], [3, 37], [14, 2], [19, 2], [6, 12], [30, 16], [2, 33]]) A[y][x] = 'T';
  // the river: down from the wood at the top right, west along the top, down the middle past the bridge, west
  // again, down the west side past the way in, and east along the bottom; the arm that ends by the third house
  fill(A, 28, 2, 30, 3, 'w'); fill(A, 17, 4, 30, 4, 'w'); fill(A, 17, 5, 19, 17, 'w'); fill(A, 6, 18, 19, 19, 'w'); fill(A, 4, 18, 5, 39, 'w'); fill(A, 4, 38, 33, 39, 'w');
  fill(A, 28, 5, 30, 11, 'w'); fill(A, 20, 12, 30, 13, 'w');
  A[4][24] = 'W'; fill(A, 17, 12, 19, 12, 'B'); fill(A, 28, 7, 30, 7, 'B'); A[18][13] = 'V'; A[19][13] = 'V'; A[30][4] = 'B'; A[30][5] = 'B';   // the jump across, the bridges
  // paths: from the way in to the market, up to the plank bridge, over to the west bank and the houses
  fill(A, 2, 30, 8, 30, 'p'); fill(A, 8, 29, 22, 31, 'p'); fill(A, 14, 22, 22, 28, 'p'); fill(A, 13, 20, 13, 21, 'p'); fill(A, 10, 11, 16, 17, 'p'); fill(A, 12, 10, 12, 10, 'p'); fill(A, 20, 14, 22, 21, 'p'); fill(A, 23, 20, 27, 21, 'p');
  fill(A, 5, 7, 5, 10, 'p'); fill(A, 5, 10, 10, 10, 'p'); fill(A, 24, 29, 25, 30, 'p'); fill(A, 21, 32, 22, 37, 'p'); fill(A, 11, 35, 13, 36, 'p'); fill(A, 9, 28, 13, 29, 'p');
  for (const [x, y] of [[6, 17], [7, 17], [7, 18], [8, 17], [12, 17], [13, 17], [21, 19], [22, 19], [26, 20], [27, 19], [28, 18], [29, 16], [3, 22], [3, 27]]) A[y][x] = 'r';   // the boulders along the banks
  for (const [x, y] of [[26, 33], [28, 33], [30, 33], [27, 35], [29, 35], [9, 13], [11, 13], [10, 14], [26, 36], [30, 36]]) A[y][x] = 'b';   // the bushes: the lower right corner, the north-west rise
  for (const [x, y] of [[8, 21], [23, 22], [15, 33], [29, 25], [7, 33], [17, 9]]) A[y][x] = 'f';
  A[10][14] = 'j';   // the left jar outside Uzume's (empty); the right jar and the jar across the river come from HIDDEN_ITEMS
  defineMap('izumo', {
    name: 'Izumo', w: 34, h: 44, base: 'grass', music: 'izumo', bg: 'grass', entry: { x: 2, y: 30 }, retreat: WORLD,
    build(M) {
      M.paint(0, 0, strs(A), LEG);
      M.walkable(0, 30); M.exit(0, 30, 1, 1, 'world_tla', WORLD.x, WORLD.y, DIR.LEFT);
      // the houses on their stilts: Kushinada's, Uzume's residence, the home over the arm of the river, the inn,
      // the most eastern home, the sanctum, the south-east home; steps up to every door
      const house = (x, y, w, h, opts) => { const d = M.house(x, y, w, h, 'roof_pink', Object.assign({}, HOUSE, opts)); M.setObj(d.doorX, d.doorY + 1, 'stilt_steps'); return d; };
      house(3, 2, 5, 5, { to: 'izumo_house1', tx: 6, ty: 8, doorX: 2 });
      house(8, 3, 9, 7, { to: 'izumo_uzume', tx: 8, ty: 13, doorX: 4, wallRows: 3 });
      house(23, 14, 5, 5, { to: 'izumo_house3', tx: 6, ty: 8, doorX: 2 });
      house(8, 23, 6, 5, { to: 'izumo_inn', tx: 7, ty: 8, doorX: 2, sign: 'inn_sign' });
      house(23, 24, 5, 5, { to: 'izumo_house5', tx: 6, ty: 8, doorX: 2 });
      house(9, 30, 5, 5, { to: 'izumo_sanctum', tx: 6, ty: 8, doorX: 2, sign: 'sanctum_sign' });
      house(19, 32, 5, 5, { to: 'izumo_house7', tx: 6, ty: 8, doorX: 2 });
      // the market stand in the middle of town: the item seller and the armourer under one awning
      for (let x = 16; x <= 19; x++) { M.setObj(x, 25, 'awning_teal_edge'); M.setObj(x, 27, 'counter'); }
      M.npc('izumo_item_seller', 17, 26, { type: 'merchant', name: 'Merchant', shop: 'izumo_item', dir: DIR.DOWN, text: 'Herbs, Antidotes, Elixirs... Stock up before the mountain.', mind: "(Business is terrible with everyone in mourning before the fact.)" });
      M.npc('izumo_weapon_seller', 18, 26, { type: 'merchant', name: 'Armourer', shop: 'izumo_weapon', dir: DIR.DOWN, text: 'The Kikuichimonji and the Shamshir - the finest blades east of Gondowan.', mind: "(Susa bought nothing from me. He said his own sword would do. I hope he's right.)" });
      // the ring of giant stones on the island: one out of its place, Moved back; the way down shows to Reveal
      for (const [x, y] of [[23, 5], [25, 5], [22, 6], [26, 6], [27, 8], [22, 10], [26, 10], [23, 11], [25, 11]]) M.object('pillar', x, y, { id: 'iz_stone_' + x + '_' + y, tile: 'ring_stone', fixed: true, poundable: false });
      const placed = G.flag('izumo_ring');
      M.object('pillar', placed ? 21 : 20, 8, { id: 'iz_stone_x', tile: 'ring_stone', fixed: placed, poundable: false, onMove: function* (E) { const o = G.field.map.objects.find(q => q.id === 'iz_stone_x'); if (!o || G.flag('izumo_ring')) return; if (o.x === 21 && o.y === 8) { G.set('izumo_ring'); o.fixed = true; Engine.doShake(14); Audio.sfx('push'); yield E.say('The stone settles into its place in the ring. Somewhere close, stone grinds on stone... a tile in the middle of the ring slid aside!'); const MM = G.field.map; if (!MM.objects.some(q => q.id === 'iz_ruins_way')) MM.objects.push({ kind: 'spot', x: 24, y: 8, key: 'izumo:spot:iz_ruins_way', id: 'iz_ruins_way', tile: 'stairs_down', hiddenUntilReveal: true, onStep: T3.izumoRuinsWay }); MM.finalize(); } } });
      if (placed) M.object('spot', 24, 8, { id: 'iz_ruins_way', tile: 'stairs_down', hiddenUntilReveal: true, onStep: T3.izumoRuinsWay });
      // the people of Izumo, before and after the serpent
      const before = () => !G.flag('serpent_done');
      M.npc('iz_001', 7, 30, { type: 'villager_m', move: 'wander', text: () => before() ? "We've had a lot of trouble here in Izumo lately. I don't want to scare you, but... you should leave, and fast. Right now. Seriously. Run." : 'Those screams from Mt. Mikage... They must have come from the serpent. That means Susa must have saved Kushinada!', mind: () => before() ? '(The Great Serpent of Mikage has awakened... What does it all mean? That dragon is the guardian of the island, so why is it treating us so cruelly?)' : "(I had always thought Susa was nothing but a troublemaker, but he's proven himself a hero now!)" });
      M.npc('iz_002', 15, 30, { type: 'villager_f', move: 'wander', text: () => before() ? "Lady Uzume doesn't want to sacrifice Kushinada. But that's the only way to appease the serpent..." : "Susa has changed so much from the wild youth we once feared. He's saved our village.", mind: () => before() ? "(I'm sure that kindhearted Lady Uzume doesn't want to sacrifice anyone.)" : "(It's odd to think that so many in the village once despised Susa...)" });
      M.npc('iz_003', 25, 21, { type: 'elder_m', text: () => before() ? 'Choosing the next sacrifice by lottery seems such a harsh method. I am far too old to understand the ideas of these modern times. They seem far too extreme.' : 'Susa has grown so much to fight for his beloved Kushinada so gallantly.', mind: () => before() ? '(Sacrifices as great as this should not be determined by chance alone...)' : '(All the girls must be so relieved now that that awful lottery has been ended forever.)' });
      M.npc('iz_004', 27, 30, { type: 'villager_f', text: () => before() ? 'The daughters of the family in that home requested that we use a lottery to choose the victims.' : 'Susa has put the serpent back to rest, but not everyone seems happy...', mind: () => before() ? "(Kushinada's always had bad luck at games of chance. I'll bet those girls were counting on it.)" : '(The girls who wanted the lottery are hiding in their house. They know what everyone thinks of them now.)' });
      M.npc('Okuni', 21, 23, { type: 'villager_f', name: 'Okuni', text: () => before() ? "My name's Okuni. I'm a great dancer... Except I don't feel much like dancing these days." : "I'm Okuni! There's going to be dancing tonight - the first festival since the serpent came. You'll stay, won't you?", mind: () => before() ? "(I'm not going to be sacrificed, but that doesn't mean I'm happy. My dear friend Kushinada doesn't deserve this, either...)" : '(Kushinada is safe. I could dance for a week.)' });
      M.npc('iz_005', 12, 20, { type: 'villager_m', text: () => before() ? "Susa's going to try to kill the serpent and save his beloved Kushinada. He's so fearless!" : 'Susa came down the mountain alive! I saw him go into Lady Uzume\'s house.', mind: () => before() ? "(What if losing Kushinada makes Susa return to his wild ways? I hope he fights the serpent... If he loses, at least he won't have to bear living without Kushinada.)" : '(He looked half dead on his feet, but he was grinning.)' });
      M.npc('iz_006', 21, 16, { type: 'elder_f', text: () => before() ? "A brave warrior will appear to defeat the serpent by the next full moon... It's just a legend, though. No one believes that. No one." : 'A brave warrior appeared to defeat the serpent by the full moon, just as the legend said. Lady Uzume was right all along.', mind: () => before() ? "(Why won't anybody listen to Lady Uzume? They've always trusted her, at least up until now...)" : '(Whether the warrior was Susa or the strangers from over the sea, the legend held.)' });
      M.npc('iz_007', 9, 15, { type: 'villager_m', text: () => before() ? 'As a child, Susa was as wild as could be and brought his elder sibling, Lady Uzume, much strife. Kushinada is the one who tamed his wild ways. Of course, no one wants to see her sacrificed.' : 'Lady Uzume must be beside herself with relief. Both of them, back safe...', mind: () => before() ? "(Lady Uzume loves her brother dearly... I'm sure she'd take Kushinada's place if she could.)" : '(I remember Susa setting fire to the festival stage as a boy. Look at him now.)' });
      M.npc('iz_008', 24, 10, { type: 'guard', name: 'Guard', dir: DIR.UP, script: T3.izumoRingGuard, mind: () => G.flag('izumo_ring') ? '(Can you imagine what it must be like to have the power to move stones without touching them? That anyone should possess that power is truly amazing.)' : '(Why does Lady Uzume have me guarding these ruins? What a waste of time...)' });
      M.npc('iz_guard1', 4, 8, { type: 'guard', name: 'Guard', dir: DIR.RIGHT, text: () => before() ? "Even if Susa tried to rescue Kushinada, she wouldn't just run away with him. I think she still believes that a hero will appear and defeat the serpent. That must be it." : "Lady Kushinada is with Lady Uzume now. I've never seen the village so glad.", mind: () => before() ? "(Lady Uzume says that a hero would appear, but I don't know... There's no hero coming... If Susa came running past me with Kushinada, I wouldn't stop them.)" : '(A hero came. Maybe two, or six. I owe Lady Uzume an apology for doubting her.)' });
      M.npc('iz_guard2', 7, 8, { type: 'guard', name: 'Guard', dir: DIR.LEFT, text: () => before() ? 'Yeah, Susa came through here on his way to save Kushinada. The jerk knocked me flat and just kept on going... He was totally wild...' : "Susa knocked me flat on his way up the mountain, and he'll get a hero's welcome for it. That's Izumo for you.", mind: () => before() ? "(You know, I can't stand Susa, but I understand how he feels. Kushinada's a really sweet girl.)" : '(I still can\'t stand him. But he did it.)' });
      M.sign(9, 31, 'Izumo. The market stand is in the middle of town; the priestess Uzume\'s residence stands on the far bank, over the plank bridge.');
      M.sign(21, 11, 'The ring of stones. They have stood on this island longer than the village.');
      // outside Uzume's after the scene within: Susa runs out with a word of thanks, and the legend of the Cloud Brand
      M.trigger(11, 10, 3, 2, T3.susaToken, { cond: () => G.flag('izumo_after') && !G.flag('susa_token') });
    }
  });
  // the guard by the ring of stones, and the stone Susa moved
  T3.izumoRingGuard = function* (E) {
    if (G.flag('izumo_ring')) {
      if (!G.flag('izumo_ring_seen')) { G.set('izumo_ring_seen'); yield E.say('The misaligned stone! It\'s back in its original position! How did this happen!? Hmmm... Either Susa or Kushinada must have moved it when I wasn\'t looking.', 'Guard'); return; }
      yield E.say('Can you imagine what it must be like to have the power to move stones without touching them? That anyone should possess that power is truly amazing.', 'Guard'); return;
    }
    const y = yield* E.ask("See this ring of giant stones? They've been here for ages. No one knows who put them here. See how they make this beautiful circle? Except for that one, right?", 'Guard', ['Yes', 'No']);
    if (y === 0) yield E.say("Susa moved it... He didn't even use his hands. He surely holds the secrets to a great power.", 'Guard');
    else yield E.say("You're... not terribly observant, are you?", 'Guard');
  };
  T3.izumoRuinsWay = function* (E) { yield E.say('A ladder, under the tile that slid aside - down into the old ruins beneath the island.'); yield Engine.fadeOut(16); E.warpNow('izumo_ruins', 5, 3, DIR.DOWN); yield Engine.fadeIn(16); };
  T3.susaToken = function* (E) {
    E.spawn('SusaRun', 13, 11, { look: NPC_LOOKS.Susa, name: 'Susa', dir: DIR.LEFT });
    yield E.say("Felix, wait! It troubled me to let you leave like this... I owe you much for your help, but I didn't have any way to thank you... And then I thought of something. You're a warrior, and warriors need weapons. Wouldn't you agree?", 'Susa');
    let y = yield* E.ask('Wouldn\'t you agree?', 'Susa', ['Yes', 'No']);
    while (y !== 0) { yield E.say('Are you sure about that? I was only hoping to show you my appreciation.', 'Susa'); y = yield* E.ask('Would you be willing to accept a token of my gratitude?', 'Susa', ['Yes', 'No']); }
    yield E.say("This token isn't something I possess. It's a legend, one that might be of use to you. Long ago, the Great Serpent of Mikage would sleep with its body crossing the river... Where its tail fell, the Cloud Brand lay hidden. That's the legend, anyway.", 'Susa');
    yield E.say("The serpent was once the sword's protector, but it lost the sword many ages past. Anyway, maybe you want to go check out the dragon again... I left something there for you... just as a way of saying thank you.", 'Susa');
    yield E.say("Well, I've said what I came to say. I'm going back to Kushinada. I hope you are successful in your quest.", 'Susa');
    G.set('susa_token'); E.despawn('SusaRun');
  };
  // ====================== the houses ======================
  // Kushinada's house: she sits on the floor in tears, and speaks at the sound of footsteps
  Kit.home('izumo_house1', { name: "Kushinada's House", back: { map: 'izumo', x: 5, y: 7 }, npcs: [{ id: 'Kushinada', x: 4, y: 4, look: NPC_LOOKS.Kushinada, name: 'Kushinada', dir: DIR.DOWN, hideIf: 'serpent_done', text: "Susa, don't come for me... If I see you, I'll surely lose the courage to sacrifice myself for Izumo. If I run, Lady Uzume and all of Izumo will suffer greatly... Please... Don't come for me. Lady Uzume has foretold the coming of a hero, and I believe her... And so I shall remain here, until the coming of the next full moon... and the hero.", mind: "(A hero... Uzume believes it. I have to believe it too, or I'll run to Susa and doom us all.)" }],
    furn: [['bed', 2, 2], ['table', 6, 3], ['pot', 8, 2]], build(M) { M.trigger(5, 7, 3, 2, function* (E) { if (G.flag('serpent_done')) return; yield E.say("(A girl sits on the floor, in tears. Hearing Felix's footsteps, she speaks without looking up.)"); yield E.say("Susa, don't come for me... If I see you, I'll surely lose the courage to sacrifice myself for Izumo. If I run, Lady Uzume and all of Izumo will suffer greatly... Please... Don't come for me.", 'Kushinada'); yield E.say('Lady Uzume has foretold the coming of a hero, and I believe her... And so I shall remain here, until the coming of the next full moon... and the hero.', 'Kushinada'); }, { once: 'kushinada_seen' }); } });
  Kit.home('izumo_house3', { name: 'Izumo Home', back: { map: 'izumo', x: 25, y: 19 }, npcs: [
    { id: 'iz_general', x: 3, y: 4, type: 'elder_m', text: "Izumo's leaders have always possessed certain special powers. Always. And let me tell you, the combined power of Susa and Lady Uzume is stunning to see.", mind: '(The power that Lady Uzume and Susa possess comes from their ancestors. It cannot be learned, and it cannot be imitated.)' },
    { id: 'iz_009', x: 7, y: 5, type: 'villager_m', text: "One day, Kushinada put on a display of power so great that it almost rivaled Susa's! It's such a shame... I really wanted to see how strong she might have become.", mind: "(It was the day those bright rocks fell from the sky... That's when Kushinada gained her powers.)" }] });
  Kit.home('izumo_house5', { name: 'Izumo Home', back: { map: 'izumo', x: 25, y: 29 }, npcs: [
    { id: 'iz_016', x: 3, y: 4, type: 'villager_f', text: "I'm so relieved that I'm not this year's sacrifice, but what happens next year?", mind: "(I only suggested this lottery idea because I didn't want to be sacrificed. It looks like Kushinada really does have bad luck, like everyone says...)" },
    { id: 'iz_017', x: 7, y: 3, type: 'villager_f', text: "Okuni, Kushinada, and Lady Uzume all drew in the lottery to choose the next sacrifice with us... I can't believe we drew Kushinada. Is that chance? Fate? I guess you never know...", mind: "(Susa's been so sad all the time, ever since Kushinada was named the next sacrifice. I never liked the old, wild Susa, but he's so different now. Maybe I can be his new girlfriend.)" },
    { id: 'iz_018', x: 5, y: 6, type: 'child_f', text: "If Lady Uzume's name had been drawn in the lottery, would she have been the next sacrifice?", mind: "(Lady Uzume's been able to focus on governing Izumo lately. I think it's because Susa's calmed down.)" }] });
  Kit.home('izumo_house7', { name: 'Izumo Home', back: { map: 'izumo', x: 21, y: 37 }, npcs: [
    { id: 'iz_010', x: 3, y: 3, type: 'villager_m', text: 'What I want to know is, what caused our legendary guardian to awaken?', mind: '(The serpent is only supposed to awaken if the land is in grave danger. I wonder what calamity is going to befall us...)' },
    { id: 'iz_011', x: 7, y: 4, type: 'elder_m', text: 'The Dragonsbane seems to have put the serpent under... but for how long?', mind: '(The serpent will drink as much Dragonsbane as it can find, right down to the last drop. Nobody knows why they like it so much, considering how much it weakens them... It must be like catnip to them.)' },
    { id: 'iz_012', x: 5, y: 6, type: 'villager_f', text: 'A while back, the volcano erupted on the mainland. We saw brilliant flashes of light to the west. The great dragon awoke shortly afterward. It caused a terrible panic through the island.', mind: '(I wonder if all the recent disasters aroused the dragon from his slumber on the mountain.)' },
    { id: 'iz_013', x: 8, y: 6, type: 'villager_m', text: "I can't find my dagger... I had it earlier... Where did it-- I wonder if Susa...", mind: "(According to legend, that's the only thing that can put the serpent back to sleep. As for the dagger... I'll bet Susa's planning on using it to save Kushinada.)" },
    { id: 'iz_014', x: 2, y: 6, type: 'elder_f', text: "I am old, and I've had enough of this world. Why wouldn't I make a good sacrifice for the dragon?", mind: '(Our guardian serpent is really just a dragon. Why do dragons always want maiden sacrifices?)' },
    { id: 'iz_015', x: 8, y: 2, type: 'villager_m', text: "The serpent can't stand sunlight, so it only shows up in the village at night. Just as the legend says.", mind: "(There's no way to get sunlight into the serpent's cave on Mt. Mikage. Just no way...)" }] });
  Kit.inn('izumo_inn', { name: 'Izumo Inn', price: 60, back: { map: 'izumo', x: 10, y: 28 }, build(M) { const k = M.npcs.find(n => n.id === 'izumo_inn_keeper'); if (k) { k.text = "Of course, I knew the legend of the great serpent... Everyone does! But I didn't believe it! Sacrificing a young girl to the serpent year after year? It's too cruel to be true!"; k.mind = '(Things like this are really going to hurt the inn... we get few enough travelers as it is!)'; } }, npcs: [
    { id: 'izumo_inn_2', x: 8, y: 5, type: 'villager_f', text: "If I were younger, I might have been the sacrifice... Ahh... It's so horrible!", mind: "(What does that serpent plan on doing with those young women? Surely, it doesn't intend to marry all of them!)" }] });
  Kit.sanctum('izumo_sanctum', { name: 'Izumo Sanctum', back: { map: 'izumo', x: 11, y: 35 }, build(M) { const k = M.npcs.find(n => n.id === 'izumo_sanctum_priest'); if (k) { k.name = 'Healer'; k.text = "Why would our guardian spirit demand a sacrifice? It's inexcusable! A true guardian would never require such a cruel tribute."; k.mind = '(If only I possessed the power to prevent this from happening. Please grant me strength...)'; } }, npcs: [
    { id: 'iz_019', x: 3, y: 6, type: 'child_m', text: 'When I get older, I might have to be a sacrifice, too... ...What\'s a sacrifice?', mind: '(Nobody wants to be a sacrifice, so a sacrifice must be something pretty scary.)' },
    { id: 'iz_020', x: 9, y: 6, type: 'villager_f', text: "*Sniff* How could we sacrifice our beloved Kushinada? It's not fair!", mind: "(I don't want the serpent of Mt. Mikage to eat Kushinada. Oh, won't somebody help her?)" }] });
  // Uzume's residence: the drummers and dancers of the festival that the serpent ruined; after the serpent, the
  // scene of the heroes' welcome, and the Dancing Idol given for Coal
  Kit.interior('izumo_uzume', { name: "Uzume's Residence", w: 16, h: 15, floor: 'floor_wood', wall: 'wall_in', back: { map: 'izumo', x: 12, y: 10 },
    furn: [['carpet', 6, 3, 4, 8], ['torch', 3, 1], ['torch', 12, 1], ['statue', 2, 2], ['statue', 13, 2], ['pot', 1, 12], ['pot', 14, 12], ['table', 11, 8], ['bed', 12, 4]],
    npcs: [
      { id: 'Uzume', x: 8, y: 4, look: NPC_LOOKS.Uzume, name: 'Uzume', dir: DIR.DOWN, script: function* (E) { yield* T3.uzume(E); }, mind: () => G.flag('serpent_done') ? '(Felix, our gratitude to you and your friends grows deeper each passing moment.)' : "(I pray that our guardian's anger is not aroused and that Susa will be protected...)" },
      { id: 'iz_drum1', x: 3, y: 6, type: 'villager_m', hideIf: 'serpent_done', text: 'The serpent ate all our food and vanished into the darkness. It ruined the festival.', mind: "(Before the serpent ate all our food, it was a terror to behold... But afterwards? He wasn't so bad. No doubt about it, that serpent sure knows good food when he eats it.)" },
      { id: 'iz_drum2', x: 3, y: 9, type: 'villager_m', hideIf: 'serpent_done', text: 'The serpent lives on Mt. Mikage. In our tongue, its original name meant "the undying mountain." As long as the serpent lives on its peak, I doubt the serpent will ever die, either.', mind: "(Legend has it that Mt. Mikage is enshrouded by a mysterious power. I wonder if that's the source of the serpent's eternal life.)" },
      { id: 'iz_dance1', x: 12, y: 7, type: 'villager_f', hideIf: 'serpent_done', text: "There's no point dancing if Okuni's not here...", mind: "(Okuni's such a great dancer. It's just so much more fun when she's here to dance with us.)" },
      { id: 'iz_dance2', x: 12, y: 10, type: 'villager_f', hideIf: 'serpent_done', text: "The serpent attacked the town one night during a festival. It didn't leave until it had eaten all of the food we'd prepared for our feast...", mind: '(The serpent would eat up anything we put in front of it! Its hunger knows no bounds.)' },
      { id: 'KushinadaU', x: 6, y: 5, look: NPC_LOOKS.Kushinada, name: 'Kushinada', dir: DIR.RIGHT, showIf: 'serpent_done', text: () => G.flag('izumo_after') ? "You're leaving so soon? Then you must return to Izumo someday. I shall accept that as your oath!" : '...', mind: '(Susa... So, you lived after all, Susa...)' },
      { id: 'iz_man', x: 10, y: 6, type: 'villager_m', name: 'Man', dir: DIR.LEFT, showIf: 'serpent_done', text: 'There can be no doubt... These are the heroes who appeared on Mt. Mikage.', mind: '(Warriors, from within Mt. Mikage. After the serpent\'s roar.)' },
      { id: 'SusaU', x: 8, y: 9, look: NPC_LOOKS.Susa, name: 'Susa', dir: DIR.UP, showIf: 'izumo_after', text: "Their powers are different from our own. There seem to be many forms of Psynergy.", mind: "(I'm going back to Kushinada. I hope you are successful in your quest.)" }],
    build(M) { M.trigger(7, 12, 3, 2, T3.izumoAfter, { cond: () => G.flag('serpent_done') && !G.flag('izumo_after') }); } });
  T3.uzume = function* (E) {
    if (G.flag('coal_got')) { yield E.say("We'll be waiting. Return to Izumo someday - that is your oath.", 'Uzume'); return; }
    if (G.flag('serpent_done')) {
      if (G.inventory.has('Dancing Idol')) { yield E.say('The Dancing Idol! Our sacred treasure, that the serpent took to its mountain... You have returned it to Izumo. Please, take this in thanks - a spirit of fire that has served my family for generations.', 'Uzume'); G.inventory.remove('Dancing Idol'); G.set('coal_got'); yield* E.djinn('Coal'); return; }
      yield E.say("Felix, our gratitude to you and your friends grows deeper each passing moment. If ever you find the idol the serpent carried off - our Dancing Idol - I would give much to have it home.", 'Uzume'); return;
    }
    yield E.say("Susa's not here. I believe he went to Mt. Mikage. He believes he can save Kushinada, and so he has gone to fight the serpent. He truly believes he can defeat the Great Serpent of Mikage.", 'Uzume');
    yield E.say("It's all for naught, though, as a hero will certainly appear and destroy the great serpent. If the serpent defeats Susa, I'll... be alone.", 'Uzume');
  };
  // the heroes' welcome, as the script has it
  T3.izumoAfter = function* (E) {
    yield E.say('(A man has come to Uzume and Kushinada with the news from the mountain.)');
    yield E.say('Warriors appeared from within Mt. Mikage?', 'Uzume'); yield E.say("Yes... After the serpent's roar, these warriors appeared.", 'Man');
    yield E.say("So, it wasn't Susa who defeated the serpent, but those heroes...", 'Uzume'); yield E.say('It might have been...', 'Man'); yield E.say('Lady Kushinada, please forgive me...', 'Man');
    yield E.say("I don't care who defeated the serpent... I'm more worried about what happened to Susa.", 'Kushinada');
    yield E.say('So, Susa never came down from Mt. Mikage?', 'Uzume'); yield E.say('He returned to the village after the heroes appeared, and he knew the serpent was defeated.', 'Man'); yield E.say('Oh, Susa...', 'Kushinada');
    yield E.say('(Uzume notices the party.)'); yield E.say('Who are you? This is my home, and I am having a private conversation. Leave at once!', 'Uzume');
    yield E.say('What is it?', 'Kushinada'); yield E.say('There can be no doubt... These are the heroes who appeared on Mt. Mikage.', 'Man');
    yield E.say('Are you the ones who defeated the serpent?', 'Uzume'); yield E.say('So it was you...', 'Kushinada'); yield E.say('My apologies... You are welcome here.', 'Uzume');
    yield E.say('Who are you?', 'Kushinada'); yield E.say("I'm Kraden, and this is Felix. Behind him is Piers.", 'Kraden'); yield E.say('Pleased to meet you.', 'Piers'); yield E.say("I'm Jenna, and this is Sheba.", 'Jenna');
    yield E.say("We're on a quest. Our travels across the Great Eastern Sea brought us here.", 'Kraden');
    yield E.say('You were seen coming down from Mt. Mikage. What brought you to such a dangerous place?', 'Kushinada'); yield E.say('To complete our quest, we need many types of Psynergy.', 'Sheba');
    yield E.say('Psynergy?', 'Uzume'); yield E.say('What is Psynergy?', 'Kushinada'); yield E.say('Psynergy is many things... The power to move things with one\'s mind, to heal, to create.', 'Kraden');
    yield E.say("All with one's mind? Tell me, is it something like... this?", 'Uzume'); Audio.sfx('psy'); Engine.doShake(6); yield E.say('(Uzume lifts a jar from the floor with a wave of her hand, and sets it down again.)');
    yield E.say('Is that the power you\'re talking about?', 'Uzume'); yield E.say('That power? Lady Uzume?', 'Jenna'); yield E.say("It's not mine alone. Kushinada and Susa possess it as well.", 'Uzume');
    const y1 = yield* E.ask('This is the power we possess. I assume you have something like it yourselves?', 'Kushinada', ['Yes', 'No']);
    if (y1 !== 0) { yield E.say('I thought so. Only those who can wield the power can see it. And you did see it, didn\'t you?', 'Kushinada'); yield E.say("Felix, there's no need to hide our abilities from them, is there?", 'Piers'); }
    yield E.say('So, you call what we do "Psynergy," and you can do it, too?', 'Kushinada'); yield E.say('If you already have Psynergy, why do you need more of this power?', 'Kushinada');
    E.spawn('SusaU', 8, 11, { look: NPC_LOOKS.Susa, name: 'Susa', dir: DIR.UP });
    yield E.say('Their powers are different from our own. There seem to be many forms of Psynergy.', 'Susa'); yield E.say('Susa!', 'Uzume'); yield E.say('Susa... So, you lived after all, Susa...', 'Kushinada');
    yield E.say("Yes, I've survived, and I've made it home to you both. Thanks to them, actually...", 'Susa');
    yield E.say('Felix, our gratitude to you and your friends grows deeper each passing moment. Susa, you spoke of different types of power. Tell me, what did you mean?', 'Uzume');
    yield E.say('I can only describe what I saw, my sister. Ask Felix here about it.', 'Susa');
    yield E.say('Ah, yes. Psynergy... I have dedicated most of my life to its study... The power of Psynergy comes from the four basic forces of earth, fire, water, and wind. These energies, the foundations of Alchemy, are called "Elementals."', 'Kraden');
    yield E.say("You don't know Alchemy? The four elements? Why, they're the building blocks of all matter on Weyard.", 'Kraden');
    yield E.say('All existing matter comes from Alchemy and this Psynergy?', 'Susa'); yield E.say("Yes, that's right. Everything you see around you is some combination of these elements.", 'Kraden');
    yield E.say('Does this mean that there are as many types of Psynergy as there are types of elements?', 'Kushinada');
    yield E.say("That's right, Kushinada. You're a smart lass. Mt. Mikage was a place of great earth powers. I'd imagine your powers are earth based.", 'Kraden');
    yield E.say("That's right, but how did you know this?", 'Uzume'); yield E.say("Kraden... Mt. Mikage is Gaia Rock, isn't it?", 'Piers'); yield E.say('(Kraden nods.)');
    yield E.say('...Gaia Rock? Mt. Mikage is the sacred mount of our people!', 'Uzume');
    yield E.say('Yes, but there are many mountains like your Mt. Mikage all across the Eastern Sea. Mt. Mikage is a source of earth power, and therefore, it must be Gaia Rock.', 'Sheba');
    yield E.say('You have seen other mountains like our Mt. Mikage?', 'Susa'); yield E.say('Yes! In fact, it seems that each of these rocks contains a different elemental power.', 'Jenna');
    yield E.say('And now, you are questing to gather the power of these elements, yes?', 'Kushinada'); yield E.say('(The party nods.)');
    const y2 = yield* E.ask('And you only defeated the Great Serpent of Mikage to accomplish this goal?', 'Uzume', ['Yes', 'No']);
    yield E.say(y2 === 0 ? 'Regardless of your motives, you have saved us all.' : 'You took pity on Kushinada? You are very kind to help Susa, Felix.', 'Uzume');
    yield E.say("You're... not implying that we defeated the serpent, are you? It's true that we did fight the creature... But without Susa's power, the battle might not have ended so happily.", 'Kraden');
    yield E.say('What... What are you--', 'Susa'); yield E.say('Susa had given the beast a lot of Dragonsbane in order to weaken it.', 'Piers');
    yield E.say('We could never have beaten the beast if it had not been in a... weakened state.', 'Sheba'); yield E.say('We were victorious only because Susa risked everything to weaken the dragon.', 'Jenna');
    yield E.say('Susa, perhaps, after all, you are...', 'Uzume'); yield E.say("No, I didn't...", 'Susa');
    const y3 = yield* E.ask("Don't forget, Susa dealt the finishing blow, didn't he?", 'Sheba', ['Yes', 'No']);
    yield E.say(y3 === 0 ? 'Finishing blow? All I did was stab it with the Cloud Brand.' : "That's right. Piercing it with the Cloud Brand was hardly a finishing blow.", 'Susa');
    const y4 = yield* E.ask("I disagree... You weakened the serpent. You dealt the final blow. I'd say you were essential. So, Lady Uzume, wouldn't you say that Susa deserves the reward for this feat? Even Felix agrees, don't you, Felix?", 'Kraden', ['Yes', 'No']);
    if (y4 === 0) { yield E.say('I do, too.', 'Jenna'); yield E.say("We weren't fighting in hopes of getting a reward, were we?", 'Sheba'); yield E.say("We'll be satisfied just learning your Psynergy.", 'Piers'); }
    else { yield E.say("Are you asking for a reward? That's just plain greedy!", 'Jenna'); yield E.say("We couldn't possibly take any sort of reward.", 'Sheba'); yield E.say('Learning new Psynergy will be reward enough.', 'Piers'); }
    yield E.say("As you can see. Now, it's about time for us to leave Izumo Village. Yes, indeed! We're on our way to Lemuria.", 'Kraden');
    yield E.say("You're leaving so soon?", 'Kushinada'); yield E.say('We are in a great hurry.', 'Kraden'); yield E.say('Then you must return to Izumo someday.', 'Uzume');
    yield E.say("I'm sure we'll be back once our mission is completed.", 'Jenna'); yield E.say('Excellent! I shall accept that as your oath!', 'Kushinada');
    yield E.say("...Oath? Oh, by promising to return, we'll be ensuring that our quest will end successfully...", 'Sheba'); yield E.say('I understand... We must vow to return, everyone.', 'Piers'); yield E.say("We'll be waiting.", 'Uzume');
    G.set('izumo_after'); E.set('izumo_after');
    yield E.say('(Uzume looks at the little figure Felix carries. Her eyes widen.)', null); yield E.say('That idol... Felix, may I see it? Speak with me before you go.', 'Uzume');
  };
  // ====================== Izumo Ruins ======================
  const RLEG = { '.': 'lc_floor', 'x': 'gr_pit', 'i': 'ir_sand', 'w': 'water', 'l': { ground: 'lc_floor', obj: 'ladder', walk: true }, 'u': { ground: 'lc_floor', obj: 'stairs_up', walk: true }, 'd': { ground: 'lc_floor', obj: 'stairs_down', walk: true } };
  const RROCK = { cliff: '#', set: 'mossrock', faces: 1 };
  const R_ENC = [['Fire Worm', 'Fire Worm'], ['Golem II'], ['Gressil'], ['Wight II', 'Wight II'], ['Wood Walker']];
  const RUINS_OUT = { map: 'izumo', x: 24, y: 9, dir: DIR.DOWN };
  // 1. the crack across the first hall: the sand under the columns, the puddles in the crack
  const R1 = grid(24, 18, '#');
  fill(R1, 2, 3, 8, 14, '.'); R1[2][5] = 'u'; fill(R1, 9, 3, 12, 14, 'i'); fill(R1, 13, 3, 17, 14, '.'); fill(R1, 18, 3, 19, 14, 'x'); fill(R1, 20, 3, 21, 14, '.'); R1[9][22] = '.';
  defineMap('izumo_ruins', {
    name: 'Izumo Ruins', w: 24, h: 18, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry: { x: 5, y: 3 }, enc: R_ENC, retreat: RUINS_OUT,
    build(M) {
      M.paint(0, 0, strs(R1), RLEG, RROCK);
      M.exit(5, 2, 1, 1, 'izumo', 24, 9, DIR.DOWN, { stairs: true }); M.exit(22, 9, 1, 1, 'izumo_ruins_2', 2, 9, DIR.RIGHT);
      // the columns standing on the sand across the middle of the hall: Sand goes under them
      for (let y = 3; y <= 14; y++) M.setObj(11, y, 'ice_column');
      M.sign(4, 5, 'A row of stone columns stands across the hall on a bed of soft sand, and beyond them a crack too wide to jump.');
      M.object('puddle', 18, 9, { id: 'ir_puddle1' }); M.object('puddle', 19, 9, { id: 'ir_puddle2' });
      M.sign(14, 5, 'Two puddles lie in the crack. Ice would stand where water lies.');
    }
  });
  // 2. the column and the sand, the brown pillar into the gap for the way down
  const R2 = grid(24, 18, '#');
  fill(R2, 2, 3, 5, 15, '.'); R2[9][1] = '.'; fill(R2, 6, 4, 19, 4, '.'); fill(R2, 19, 5, 19, 7, '.');   // the hall, the upper way to a ledge over the gap
  fill(R2, 6, 12, 9, 12, '.'); R2[13][9] = 'l'; R2[14][9] = 'l'; fill(R2, 9, 15, 21, 15, '.'); fill(R2, 15, 15, 17, 15, 'i');   // the lower way: down the ladder, along the bottom
  fill(R2, 21, 10, 21, 14, '.'); R2[9][21] = 'x'; fill(R2, 21, 5, 23, 8, '.'); R2[6][23] = 'd';   // the column up to the gap, and the pocket with the ladder down beyond it
  defineMap('izumo_ruins_2', {
    name: 'Izumo Ruins - Lower Hall', w: 24, h: 18, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry: { x: 2, y: 9 }, enc: R_ENC, retreat: RUINS_OUT,
    build(M) {
      M.paint(0, 0, strs(R2), RLEG, RROCK);
      M.exit(1, 9, 1, 1, 'izumo_ruins', 21, 9, DIR.LEFT); M.exit(23, 6, 1, 1, 'izumo_ruins_3', 12, 14, DIR.DOWN, { stairs: true });
      M.object('pillar', 12, 15, { id: 'ir_col', fixed: true }); M.setObj(16, 15, 'rock_small');   // the column Pound sinks, the rock Sand goes under
      M.object('pillar', 21, 14, { id: 'ir_brown', tile: 'gr_rock', poundable: false });   // the brown pillar, Moved up into the gap
      M.sign(3, 5, 'Two ways: along the top to a ledge over a gap, or down the ladder and along the bottom. The ladder down is in the pocket past the gap.');
      M.sign(19, 8, 'The gap. The pocket with the ladder is across it, and nothing here bridges it.');
    }
  });
  // 3. the Phantasmal Mail's ledge, the two columns, the pool before the back room and Ulysses
  const R3 = grid(24, 18, '#');
  fill(R3, 2, 12, 22, 15, '.'); R3[16][12] = 'u'; R3[12][20] = 'l'; R3[13][20] = 'l'; fill(R3, 18, 8, 22, 11, '.');   // the floor, the way up, the ladder to the ledge
  fill(R3, 2, 4, 16, 10, '.'); R3[11][8] = '.'; R3[11][10] = '.'; fill(R3, 2, 5, 6, 9, 'w'); fill(R3, 2, 1, 6, 4, '.'); fill(R3, 7, 1, 16, 3, '#');   // the pool and the back room behind it
  defineMap('izumo_ruins_3', {
    name: 'Izumo Ruins - Depths', w: 24, h: 18, base: 'void', music: 'tlacaves', bg: 'cave', indoor: true, entry: { x: 12, y: 14 }, enc: R_ENC, retreat: RUINS_OUT,
    build(M) {
      M.paint(0, 0, strs(R3), RLEG, RROCK);
      M.exit(12, 16, 1, 1, 'izumo_ruins_2', 23, 7, DIR.DOWN, { stairs: true });
      M.chest(21, 9, 'Phantasmal Mail', 1);
      M.object('pillar', 8, 11, { id: 'ir_col2', fixed: true }); M.object('pillar', 10, 11, { id: 'ir_col3', fixed: true });   // either one, Pound
      const tiles = []; for (let y = 5; y <= 9; y++) for (let x = 2; x <= 6; x++) tiles.push([x, y]);
      if (G.flag('ir_pool_dry')) { for (const [x, y] of tiles) M.set(x, y, 'lc_floor'); }
      else M.object('pool', 6, 9, { id: 'ir_pool', tiles, dryTile: 'lc_floor', onParch: function* (E) { G.set('ir_pool_dry'); yield E.say('The pool is drawn off, and the back room behind it stands open.'); } });
      M.object('statue', 4, 2, { id: 'ir_tablet', tile: 'ar_tablet', script: function* (E) { if (G.flag('ulysses_taken')) { yield E.say('The stone tablet. Its power has passed to the party.'); return; } yield E.say('A stone tablet, carved with the figure of a warrior of the sea, wreathed in lightning...'); G.set('ulysses_taken'); Engine.doFlash(14, '#c0d0ff'); Audio.sfx('summon'); yield E.summon('Ulysses'); } });
      M.sign(14, 13, 'Two columns stand in the wall to the north; past them, a pool, and a room behind the pool.');
    }
  });
}
