// ---------- The islets of the Eastern Sea, and the Islet Cave ----------
// After the rips (map references/golden-sun-the-lost-age-e-tundra-islet-gba-map.webp, ...se-angara-islet-and-west-
// indra-islet-gba-map.webp, ...n-osenia-islet-gba-map.webp, ...sea-of-time-islet-gba-map.webp), condensed, and the
// guide's chapter 8C (lines 3505-3600) with the script's [02'26] islet scenes. The animal trade: Pengus and
// Pengulina on E Tundaria Islet (the floes adrift across the cold sea, the log rolled into the channel: the Pretty
// Stone), the fancy bird of SE Angara Islet (the crate into the gap, Frost on the puddle, the vines to the nest:
// the Red Cloth), the low-spirited cow in N Osenia Islet's fenced yard (Sand under the fence: Milk), the dog in the
// salt water off West Indra Islet's piers (the Li'l Turtle), and Lonesome George off the Sea of Time Islet, who
// carries the party to his secret spot: the rock-ringed islet with the Islet Cave (Turtle Boots, Meld on the pole
// ridden up the pool, the Rusty Staff past the second pole; the circles wait for Teleport).
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const T = (s, m) => s;   // a line that reads the same before and after (kept for symmetry with the towns' T(before, after))
  const worldExit = (M, x, y, w, h, wx, wy, dir) => { M.walkable(x, y, w, h); M.exit(x, y, w, h, 'world_tla', wx, wy, dir); };

  // ====================== E Tundaria Islet: the penguins, the floes, the log ======================
  const ET_LEG = {
    '.': 'snow', 'w': 'icewater', 'T': { ground: 'snow', obj: 'pinesnow' }, 'o': { ground: 'snow', obj: 'rock_snow' }, 'f': { ground: 'snow', obj: 'fence_snow' }
  };
  const ET_CLIFF = { cliff: '#', set: 'snowcliff', faces: 2 };
  const ET = grid(24, 21, '#');
  fill(ET, 1, 2, 22, 19, '.');
  fill(ET, 5, 6, 5, 19, 'w'); fill(ET, 6, 12, 16, 19, 'w'); fill(ET, 1, 12, 4, 19, '.'); fill(ET, 1, 8, 4, 11, '.'); fill(ET, 1, 2, 4, 7, '#');   // the river down from the cliff, the sea, the west bank under the north cliff
  fill(ET, 10, 15, 11, 15, '.');   // the islet between the floes' lanes
  for (const [x, y] of [[9, 3], [13, 4], [11, 10], [19, 10], [21, 13], [18, 16], [22, 3], [2, 17]]) ET[y][x] = 'T';
  for (const [x, y] of [[14, 8], [21, 8], [3, 12]]) ET[y][x] = 'o';
  defineMap('e_tundaria_islet', {
    name: 'E Tundaria Islet', w: 24, h: 21, base: 'snow', music: 'islet', bg: 'snow', entry: { x: 20, y: 18 }, retreat: { map: 'world_tla', x: 239, y: 266, dir: DIR.DOWN },
    enc: [['Wolfkin', 'Wolfkin'], ['Great Seagull'], ['Doodle Bug', 'Doodle Bug']],
    build(M) {
      M.paint(0, 0, strs(ET), ET_LEG, ET_CLIFF);
      worldExit(M, 19, 20, 3, 1, 239, 266, DIR.DOWN);
      // the two igloos: the hut (the healer's fire, the Lucky Medal jar) and the store dome beside it
      for (const [dx, dy, t] of [[0, 0, 'igloo_ul'], [1, 0, 'igloo_um'], [2, 0, 'igloo_ur'], [0, 1, 'igloo_l'], [1, 1, 'igloo_door'], [2, 1, 'igloo_r']]) M.setObj(15 + dx, 4 + dy, t);
      for (const [dx, dy, t] of [[0, 0, 'igloo_ul'], [1, 0, 'igloo_um'], [2, 0, 'igloo_ur'], [0, 1, 'igloo_l'], [1, 1, 'igloo_um'], [2, 1, 'igloo_r']]) M.setObj(18 + dx, 3 + dy, t);
      M.walkable(16, 5); M.exit(16, 5, 1, 1, 'e_tundaria_hut', 6, 7, DIR.UP, { door: true });
      // the floes adrift on the cold sea: one lane from the east shore to the islet, one from the islet to the west bank
      M.object('berg', 16, 15, { id: 'et_berg1', lane: [12, 16], speed: 40, dir: -1 });
      M.object('berg', 9, 15, { id: 'et_berg2', lane: [5, 9], speed: 40, dir: -1 });
      // the log on the west bank, rolled into the channel for Pengulina's way back
      M.object('log', 4, 7, { id: 'et_log', len: 3, horiz: false, onFloat: T3.etLogLands });   // a felled trunk on the bank, rolled sideways into the river; once it has landed the river keeps its planks (the ground persists)
      // the penguins: Pengus on the north shore, Pengulina hurt on the west bank until she is helped across
      const home = G.flag('pengulina_home');
      M.npc('pengus', 8, 8, { animal: 'penguin', name: 'Pengus', dir: DIR.LEFT, script: T3.pengus, mind: home ? "I'm so happy my lovely little Pengulina is all right." : "My darling Pengulina hurt her leg on the far shore and can't swim back. Somebody, please... Help her!" });
      M.npc('pengulina', home ? 7 : 2, home ? 9 : 10, { animal: 'penguin', animalCol: '#303848', name: 'Pengulina', dir: home ? DIR.RIGHT : DIR.UP, script: T3.pengulina, mind: home ? "I'm so glad to be back on this side again, with my precious Pengus." : "Ohh... My leg... I can't get back to my dearest Pengus..." });
      M.trigger(19, 17, 3, 2, function* (E) { yield E.say('Snow, and a cold sea with ice adrift on it. Two penguins - one on this side, one on the far bank, and water between them.', 'Kraden'); yield E.say('The floes drift back and forth across the water. If one came alongside, a person could step onto it and ride.', 'Piers'); }, { once: 'et_seen' });
      M.sign(18, 8, 'E Tundaria Islet. The cold sea to the west, the floes on it, and the river that cuts the west bank off.');
    }
  });
  T3.etLogLands = function* (E) { const F = G.field, M = F.map; const o = M.objects.find(x => x.id === 'et_log'); for (const [x, y] of (o ? F.logCells(o) : [[5, 7], [5, 8], [5, 9]])) { persistGround(M, x, y, 'log_float_v'); persistWalkable(M, x, y); } M.finalize(); G.set('et_log_rolled'); yield E.say('The log rolls into the river and lies in it, bobbing. A bridge - from the west bank to the shore Pengus stands on.'); };
  T3.pengulina = function* (E) {
    if (G.flag('pengulina_home')) { yield E.say('Pen pen.', 'Pengulina'); return; }
    if (!G.flag('et_log_rolled')) { yield E.say('Pen pen pehnnn!', 'Pengulina'); yield E.say('(She holds one flipper off the snow, and looks across the channel.)'); return; }
    yield E.say('Pen pen pehnnn!', 'Pengulina'); yield E.say("The log lies across the channel now. Go on - one step at a time, and you're home.", 'Jenna');
    // she waddles over the log to the north shore, and Pengus meets her
    const p = G.field.npcs.find(n => n.id === 'pengulina'); if (p) { p.dir = DIR.UP; }
    yield E.move('pengulina', DIR.UP, 2); yield E.move('pengulina', DIR.RIGHT, 5); yield E.move('pengulina', DIR.DOWN, 1); yield E.face('pengulina', DIR.RIGHT);   // (2,10) up to the bank's edge, over the planks to (7,8), and down beside Pengus
    G.set('pengulina_home'); const q = G.field.npcs.find(n => n.id === 'pengulina'); if (q) { q.mind = "I'm so glad to be back on this side again, with my precious Pengus."; }
    const g = G.field.npcs.find(n => n.id === 'pengus'); if (g) { g.mind = "I'm so happy my lovely little Pengulina is all right."; }
    yield E.say('Pen pen!', 'Pengus'); yield E.say('Pen pen.', 'Pengulina');
  };
  T3.pengus = function* (E) {
    if (G.flag('pretty_stone')) { yield E.say('Pen pen.', 'Pengus'); return; }
    if (!G.flag('pengulina_home')) { yield E.say('Pen pen!', 'Pengus'); yield E.say('(He looks across the water at the far bank, and back at the party.)'); return; }
    yield E.say('Thank you so much for saving my sweet Pengulina. Allow me to give you this in return for your help.', 'Pengus');
    yield E.give('Pretty Stone'); G.set('pretty_stone');
  };
  Kit.interior('e_tundaria_hut', { name: 'E Tundaria Islet - Hut', w: 13, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'e_tundaria_islet', x: 16, y: 6 }, music: 'islet',
    furn: [['fireplace', 6, 1], ['pot', 2, 2], ['pot', 3, 2], ['barrel', 10, 2], ['table', 6, 4], ['chair', 5, 4], ['chair', 7, 4], ['bed', 10, 5], ['bed_foot', 10, 6], ['crate', 1, 6]],
    npcs: [
      { id: 'et_healer', x: 8, y: 2, type: 'priest', name: 'G. Healer', text: 'I am here to tend to any travelers who come to this place.', mind: "May these travelers' journey end in peace and safety...", healer: true },
      { id: 'et_man', x: 3, y: 5, type: 'villager_m', name: 'Man', text: "My mom says there's this strange tower on the northern cape of Tundaria.", mind: 'Who in Weyard would have built a tower in the middle of that frozen nowhere?' },
      { id: 'et_oldman', x: 9, y: 4, type: 'elder', name: 'Old Man', text: "Used to be, you could sail to the other side of Gondowan by skirting the coast of Tundaria. Now, the whole area's got these rocky spires... You just can't work a boat around 'em.", mind: "Tundaria is the southernmost continent in Weyard. I hear that if you head east far enough... There's an incredible waterfall at the edge of the Eastern Sea. It sounds like hokum to me." },
      { id: 'et_oldwoman', x: 5, y: 2, type: 'elder_f', name: 'Old Woman', text: 'You must be cold, dressed in those thin clothes... Come warm yourselves by the fire...', mind: "Around here, it doesn't matter what season it is... It's always the cold season. I can't even go outside without first covering myself in fur." }
    ] });

  // ====================== SE Angara Islet: the terraces, the crate and the puddle, the nest ======================
  const SA_LEG = {
    '.': 'grass', ',': 'dirt', 'w': 'water', 'p': 'pit', 'd': 'dock', 'v': { ground: 'grass', obj: 'vineladder', walk: true },
    'T': { ground: 'grass', obj: 'tree' }, 'P': { ground: 'grass', obj: 'tree' }, 'o': { ground: 'grass', obj: 'grey_rock' }, 'f': { ground: 'grass', obj: 'flowers' }, 'Y': { ground: 'grass', obj: 'palm' }, 'S': { ground: 'grass', obj: 'post_water' }
  };
  const SA_CLIFF = { cliff: '#', set: 'greyrock', faces: 2 };
  const SA = grid(24, 30, 'w');
  fill(SA, 1, 1, 18, 27, '.'); fill(SA, 19, 1, 22, 6, '.'); fill(SA, 1, 28, 12, 28, '.');
  fill(SA, 4, 8, 16, 14, '#'); fill(SA, 5, 9, 15, 13, '.');                  // the upper terrace's rock ring, the camp inside it
  fill(SA, 3, 14, 9, 19, '#'); fill(SA, 5, 15, 7, 17, '.'); SA[18][6] = 'v'; SA[19][6] = 'v';   // the nest's rock: the ledge on top (closed on every side), the vines down its south face
  fill(SA, 2, 20, 14, 20, '#'); SA[20][6] = '.';                             // the terrace's foot: a wall along the lower level with one break at the vines' foot
  SA[21][6] = 'p'; SA[22][6] = 'p';                                          // the gap under the break
  fill(SA, 17, 22, 19, 29, 'd'); fill(SA, 13, 26, 16, 26, 'd');              // the dock and its walk
  for (const [x, y] of [[2, 3], [6, 2], [12, 4], [2, 11], [15, 4]]) SA[y][x] = 'P'; for (const [x, y] of [[9, 5], [4, 6], [16, 8], [20, 3]]) SA[y][x] = 'T';
  for (const [x, y] of [[3, 24], [11, 23], [15, 20], [2, 26]]) SA[y][x] = 'o'; for (const [x, y] of [[8, 3], [11, 25], [17, 18]]) SA[y][x] = 'f';
  fill(SA, 10, 8, 12, 8, '.'); fill(SA, 10, 14, 12, 14, '.');   // the terrace's two gates, north and south
  defineMap('se_angara_islet', {
    name: 'SE Angara Islet', w: 24, h: 30, base: 'grass', music: 'islet', bg: 'grass', entry: { x: 2, y: 27 }, retreat: { map: 'world_tla', x: 203, y: 111, dir: DIR.LEFT },
    enc: [['Wild Gorilla'], ['Wyvern Chick'], ['Numb Ant', 'Numb Ant']],
    build(M) {
      M.paint(0, 0, strs(SA), SA_LEG, SA_CLIFF);
      worldExit(M, 0, 26, 1, 3, 203, 111, DIR.LEFT);
      // the camp on the terrace: the tent and its fire, the two who are not looking for Treasure Isle
      M.setObj(10, 10, 'tent'); M.setObj(10, 11, 'door'); M.walkable(10, 11); M.exit(10, 11, 1, 1, 'se_angara_tent', 5, 7, DIR.UP, { door: true });
      M.setObj(13, 11, 'campfire');
      M.npc('sa_man1', 13, 12, { type: 'villager_m', name: 'Man', dir: DIR.LEFT, script: T3.treasureMen, mind: "If we're supposed to be partners in this crazy treasure hunt, why am I the one doing all the cooking?" });
      M.npc('sa_man2', 14, 10, { type: 'villager_m', name: 'Man', dir: DIR.DOWN, text: "The Eastern Sea is huge, even if you don't add the Sea of Time, which I guess you've got to do. You don't look like much of a sailor. You're not a treasure hunter, are you? Because you won't find any in the waters around here, let me tell you!", mind: "Sure, there are legends about how there's treasure hidden north of the Sea of Time. But have WE found any? I just hope it's not on the seafloor! What would we do then?" });
      // the crate for the gap's far cell, the puddle in its near one under the vines; the second crate by the dock
      M.object('pillar', 9, 25, { id: 'sa_crate', tile: 'crate', sinkTile: 'crate_sunk' });
      M.object('pillar', 13, 22, { id: 'sa_crate2', tile: 'crate', sinkTile: 'crate_sunk' });
      M.object('puddle', 6, 21, { id: 'sa_puddle' });
      // the nest on the ledge, and the bird that hops back onto it when the party comes near
      M.setObj(6, 15, 'nest');
      M.npc('sa_bird', 6, 16, { animal: 'bird', animalCol: '#e04848', name: 'Bird', dir: DIR.DOWN, script: T3.fancyBird, mind: G.flag('red_cloth') ? "What do you think? Don't I look fancy! I sure feel fancy! And that's all that matters! But I think this looks fabulous on me! I love fancy accessories!" : 'I love feeling fancy! I want a really fancy accessory to make me feel extra fancy!' });
      M.trigger(1, 26, 2, 3, function* (E) { yield E.say('A rocky little island, terraced like steps. Someone has made camp up on the rock in the middle.', 'Sheba'); }, { once: 'sa_seen' });
      M.trigger(5, 23, 3, 1, function* (E) { yield E.say('The rock with the nest on it. Vines hang down its face - but there is a gap in the ground under them, two squares of it, and a puddle lying in the near one.', 'Piers'); yield E.say('A crate would fill the far square, if we could get one to it. And the puddle...', 'Jenna'); }, { once: 'sa_gap_seen' });
      M.sign(16, 27, 'The dock. A crate of the campers\' stores sits at its end.');
    }
  });
  T3.treasureMen = function* (E) {
    if (G.flag('sa_men_met')) { yield E.say("Look, we're busy... We can't talk now... Catch us some other time...", 'Man'); return; }
    G.set('sa_men_met');
    yield E.say("We like this island. A lot... That's why we're here... Because we like it. We aren't looking for Treasure Isle! Nope!", 'Man');
    yield E.say("What are you saying? Idiot!", 'Man'); yield E.say("Don't listen to that guy. He didn't say anything about Treasure Isle. Nothing at all.", 'Man');
    yield E.say("Look, we're busy... We can't talk now... Catch us some other time...", 'Man');
  };
  T3.fancyBird = function* (E) {
    if (G.flag('red_cloth')) { yield E.say('Chirp chirp!', 'Bird'); return; }
    if (!G.inventory.has('Pretty Stone')) { yield E.say('Chirp chirp!', 'Bird'); yield E.say('(It preens, and eyes the party for anything that glitters.)'); return; }
    yield E.say("Oh my! That stone you have! It's divine! Simply divine! I must have it! MUST! I'll give you my very fancy neckerchief for that fancy stone of yours!", 'Bird');
    G.inventory.remove('Pretty Stone', 1); yield E.say('Felix traded his stone for the very fancy neckerchief.'); yield E.give('Red Cloth'); G.set('red_cloth');
    const b = G.field.npcs.find(n => n.id === 'sa_bird'); if (b) b.mind = "What do you think? Don't I look fancy! I sure feel fancy! And that's all that matters! But I think this looks fabulous on me! I love fancy accessories!";
  };
  Kit.interior('se_angara_tent', { name: 'SE Angara Islet - Tent', w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'se_angara_islet', x: 10, y: 12 }, music: 'islet',
    furn: [['pot', 2, 2], ['pot', 8, 2], ['crate', 2, 5], ['barrel', 8, 5], ['bed', 5, 2], ['bed_foot', 5, 3]] });

  // ====================== N Osenia Islet: the lonely home, the yard, the cow ======================
  const NO_LEG = {
    '.': 'grass', ',': 'dirt', 'w': 'water', 's': 'sandsoft', 'Y': { ground: 'grass', obj: 'palm' }, 'T': { ground: 'grass', obj: 'tree' }, 'f': { ground: 'grass', obj: 'fence' }, 'F': { ground: 'sandsoft', obj: 'fence' },
    'o': { ground: 'grass', obj: 'grey_rock' }, 'l': { ground: 'grass', obj: 'logpile' }, 'b': { ground: 'grass', obj: 'bush' }, 'x': { ground: 'grass', obj: 'flowers' }
  };
  const NO_CLIFF = { cliff: '#', set: 'cliff', faces: 2 };
  const NO = grid(24, 24, '#');
  fill(NO, 1, 2, 22, 21, '.'); fill(NO, 4, 9, 20, 10, ','); fill(NO, 11, 10, 12, 22, ','); fill(NO, 1, 2, 3, 6, '#'); fill(NO, 20, 18, 22, 21, '#');   // the path runs out through the cliff at the bottom
  fill(NO, 14, 3, 19, 3, 'f'); fill(NO, 14, 8, 19, 8, 'f'); fill(NO, 19, 4, 19, 7, 'f'); fill(NO, 14, 4, 14, 5, 'f'); fill(NO, 14, 7, 14, 7, 'f'); NO[6][14] = 'F'; fill(NO, 12, 6, 13, 6, 's'); fill(NO, 15, 6, 16, 6, 's');   // the yard's fence, the strip of soft sand under its west side
  for (const [x, y] of [[4, 3], [21, 3], [3, 13], [8, 15], [17, 13], [20, 5], [5, 18], [16, 19]]) NO[y][x] = 'Y'; for (const [x, y] of [[9, 3], [21, 12]]) NO[y][x] = 'T';
  for (const [x, y] of [[2, 15], [19, 16]]) NO[y][x] = 'o'; NO[16][20] = 'l'; NO[17][20] = 'l'; for (const [x, y] of [[6, 12], [15, 15], [8, 20]]) NO[y][x] = 'x'; for (const [x, y] of [[3, 8], [7, 7]]) NO[y][x] = 'b';
  defineMap('n_osenia_islet', {
    name: 'North Osenia Islet', w: 24, h: 24, base: 'grass', music: 'islet', bg: 'grass', entry: { x: 12, y: 21 }, retreat: { map: 'world_tla', x: 206, y: 157, dir: DIR.DOWN },
    enc: [['Emu'], ['Dino'], ['Kobold II', 'Kobold II']],
    build(M) {
      M.paint(0, 0, strs(NO), NO_LEG, NO_CLIFF);
      worldExit(M, 11, 23, 2, 1, 206, 157, DIR.DOWN);
      M.house(7, 4, 5, 5, 'roof_thatch', { wall: 'wall_mud', to: 'n_osenia_home', tx: 6, ty: 7, windows: false });
      // the cow in the yard: the fence goes all round, and only the soft sand under its west side lets anyone in
      M.npc('no_cow', 17, 5, { animal: 'cow', animalCol: '#e8d8c0', name: 'Cow', dir: DIR.LEFT, script: T3.lowCow, mind: G.flag('milk') ? 'Yup. A nice, red neckerchief will never steer you wrong!' : "I've been feeling so low lately... I long to feel the utter joy of... something. I just don't know what." });
      M.npc('no_youngman', 5, 11, { type: 'villager_m', name: 'Young Man', dir: DIR.DOWN, text: "I just want to know what's on the other side of that sea of fog... No one has ever crossed through it, but one day, I just know I'll do it!", mind: "Dad and Grandpa haven't been able to cross the Sea of Time. They're so old now... I will be the one to make their dreams come true." });
      M.npc('no_man', 19, 15, { type: 'villager_m', name: 'Man', dir: DIR.LEFT, text: "The Sea of Time... A massive bank of fog that lies over the sea... All sailors fear it, and rightly so! I don't know if I'll ever make it through, but I'm certain my son will do it someday.", mind: 'I remember once, an entire fleet of ships entered the Sea of Time. They vanished into the mists. Every last one of the vessels was destroyed by the currents.' });
      M.npc('no_woman', 14, 12, { type: 'villager_f', name: 'Woman', dir: DIR.DOWN, text: 'Sailors tell of terrible currents and vortexes that can tear a boat to shreds in the Sea of Time.', mind: "Once, long ago, my husband entered the Sea of Time without being destroyed. The whirlpools spun him around and he got so dizzy he couldn't stand. I wonder if he remembers." });
      M.npc('no_oldman', 4, 16, { type: 'elder', name: 'Old Man', dir: DIR.RIGHT, text: "When you enter the sea of fog... enter the currents from the direction of the red rocks. Then, your ship won't be destroyed. But that's all I know. And it might not even be right!", mind: "I didn't really discover the secret of the red rocks... It was Yepp, the great explorer from Yallam, who told me. I should fess up." });
      M.trigger(11, 20, 2, 2, function* (E) { yield E.say('One home on the whole island, and a fenced yard behind it. Something is lowing back there.', 'Jenna'); }, { once: 'no_seen' });
      M.trigger(12, 6, 1, 1, function* (E) { yield E.say('The fence runs right round the yard - but the ground under it here is soft sand. Sand would take us under it.', 'Felix'); }, { once: 'no_fence_seen', cond: () => !G.flag('milk') });
      M.sign(9, 12, 'North Osenia Islet. Three generations here have sworn to cross the sea of fog.');
    }
  });
  T3.lowCow = function* (E) {
    if (G.flag('milk')) { yield E.say('Moo! Moo!', 'Cow'); return; }
    if (!G.inventory.has('Red Cloth')) { yield E.say('Moo! Moo!', 'Cow'); yield E.say('(She lows, low and long, and looks at nothing in particular.)'); return; }
    yield E.say('Oh! That red neckerchief is quite nice indeed. That would lift my spirits. This really brightens my moooood!', 'Cow');
    yield E.say('Felix tied the neckerchief to the tree.');
    const r = yield* E.ask('Are you giving that lovely thing to moooooi?', 'Cow', ['Yes', 'No']);
    if (r !== 0) { yield E.say("I'm sorry to hear that. Come see me if you don't want it anymore.", 'Cow'); return; }
    yield E.say("That's so kind of you! I should repay you! Have some milk!", 'Cow');
    G.inventory.remove('Red Cloth', 1); yield E.give('Milk'); G.set('milk');
    const c = G.field.npcs.find(n => n.id === 'no_cow'); if (c) c.mind = 'Yup. A nice, red neckerchief will never steer you wrong!';
  };
  Kit.interior('n_osenia_home', { name: 'North Osenia Islet - Home', w: 13, h: 9, floor: 'floor_wood', wall: 'wall_in', back: { map: 'n_osenia_islet', x: 9, y: 9 }, music: 'islet',
    furn: [['barrel', 1, 2], ['barrel', 2, 2], ['barrel', 3, 2], ['crate', 10, 2], ['table', 6, 4], ['chair', 5, 4], ['chair', 7, 4], ['bed', 10, 5], ['bed_foot', 10, 6], ['shelf', 6, 1]],
    npcs: [{ id: 'no_oldwoman', x: 4, y: 5, type: 'elder_f', name: 'Old Woman', text: 'Ours is a sad lineage... Three generations of sons have sworn their lives to trying to pass through the sea of fog.', mind: 'And just what will happen once they get through the sea of fog? I wish they would just give up.' }] });

  // ====================== West Indra Islet: the piers over the water, the dog ======================
  const WI_LEG = { 'w': 'water', 'd': 'dock', '.': 'grass', 'Y': { ground: 'grass', obj: 'palm' }, 'S': 'post_water', 'b': { ground: 'dock', obj: 'barrel' }, 'c': { ground: 'dock', obj: 'crate' } };
  const WI = grid(24, 26, 'w');
  fill(WI, 2, 4, 5, 12, 'd'); fill(WI, 7, 4, 8, 21, 'd'); fill(WI, 5, 8, 6, 8, 'd');            // the platform at the top left, the long pier, the plank between
  fill(WI, 8, 13, 13, 14, 'd'); fill(WI, 13, 8, 14, 17, 'd'); fill(WI, 12, 5, 14, 7, 'd');       // the walk to the hut's pier, the pier under the hut
  fill(WI, 5, 19, 21, 20, 'd'); fill(WI, 20, 9, 21, 21, 'd'); fill(WI, 15, 16, 16, 16, 'd');     // the long walk along the bottom, the east pier, the stub the dog lies off
  fill(WI, 18, 22, 22, 24, '.'); fill(WI, 20, 21, 21, 21, 'd');                                  // the landing's grass
  for (const [x, y] of [[9, 3], [16, 4], [18, 8], [3, 15], [10, 22], [22, 17]]) WI[y][x] = 'S';
  WI[22][19] = 'Y'; WI[23][22] = 'Y';
  defineMap('w_indra_islet', {
    name: 'West Indra Islet', w: 24, h: 26, base: 'water', music: 'islet', bg: 'water', entry: { x: 20, y: 23 }, retreat: { map: 'world_tla', x: 137, y: 165, dir: DIR.DOWN },
    enc: [['Punch Ant', 'Punch Ant'], ['Giant Bat'], ['Angle Worm']],
    build(M) {
      M.paint(0, 0, strs(WI), WI_LEG, null);
      worldExit(M, 19, 25, 3, 1, 137, 165, DIR.DOWN); M.walkable(19, 24, 3, 1);
      M.house(12, 2, 3, 4, 'roof_thatch', { wall: 'wall_mud', to: 'w_indra_hut', tx: 5, ty: 7, windows: false });
      M.setObj(3, 5, 'barrel'); M.setObj(4, 5, 'crate'); M.setObj(2, 11, 'crate'); M.setObj(21, 10, 'barrel');
      // the dog in the salt water off the stub of pier
      M.npc('wi_dog', 17, 16, { animal: 'dog', animalCol: '#c8a060', name: 'Dog', dir: DIR.LEFT, script: T3.saltyDog, mind: G.flag('turtle') ? "I don't like to waste. I'll just take little tiny laps." : 'The water here is so salty! I wish someone would bring me something tasty to drink.' });
      M.npc('wi_man', 8, 9, { type: 'villager_m', name: 'Man', dir: DIR.DOWN, text: "Ever since the tidal wave moved Indra, we haven't been able to go to Gondowan's western shores.", mind: 'The waterways north of Tundaria would have been the perfect place to teach my sons to sail...' });
      M.npc('wi_woman', 13, 16, { type: 'villager_f', name: 'Woman', dir: DIR.DOWN, text: "Did you know Indra moved? It was quite a shock to all of us here... We haven't been able to use the waterways to the south ever since.", mind: "I'm so grateful our little island wasn't damaged in the tidal wave... It was a miracle." });
      M.npc('wi_child1', 10, 19, { type: 'child', name: 'Child', dir: DIR.UP, text: "My pop's the best sailor in all the Eastern Sea! That's why he can go anywhere, even in that tiny boat of his!", mind: "I can't wait until Dad teaches me how to sail..." });
      M.npc('wi_child2', 20, 15, { type: 'child', name: 'Child', dir: DIR.DOWN, text: "You're lucky, mister. You get to ride your boat out on the open sea all you want... My dad'll be done with his boat soon, and together, we'll be able to sail anywhere we want...", mind: "I can't wait until the day I can sail far away with Dad and Kirt..." });
      M.trigger(19, 22, 3, 2, function* (E) { yield E.say('A village on stilts - piers and planks over the water, and one round hut in the middle of it all.', 'Sheba'); }, { once: 'wi_seen' });
      M.sign(6, 19, 'West Indra Islet. Since the tidal wave the waterways south are closed, and the boats stay near.');
    }
  });
  T3.saltyDog = function* (E) {
    if (G.flag('turtle')) { yield E.say('Arff! Arff!', 'Dog'); return; }
    if (!G.inventory.has('Milk')) { yield E.say('Arff! Arff!', 'Dog'); yield E.say('(It paddles in place, and sneezes at the salt.)'); return; }
    yield E.say("Sniff! Sniff! I smell fresh milk! Hah hah hah! Are you going to give me that milk? Are you? Huh? Huh!? I'll trade you this for it! I caught it myself!", 'Dog');
    G.inventory.remove('Milk', 1); yield E.say("Felix traded his milk for the dog's turtle!"); yield E.give("Li'l Turtle"); G.set('turtle');
    const d = G.field.npcs.find(n => n.id === 'wi_dog'); if (d) d.mind = "I don't like to waste. I'll just take little tiny laps.";
  };
  Kit.interior('w_indra_hut', { name: 'West Indra Islet - Hut', w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'w_indra_islet', x: 13, y: 6 }, music: 'islet',
    furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['pot', 8, 2], ['barrel', 8, 5], ['shelf', 5, 1]] });

  // ====================== Sea of Time Islet: the hut, the beach, Lonesome George ======================
  const ST_LEG = { '.': 'grass', ',': 'dirt', 's': 'sand', 'w': 'water', 'Y': { ground: 'grass', obj: 'palm' }, 'y': { ground: 'sand', obj: 'palm' }, 'o': { ground: 'sand', obj: 'rock_sand' }, 'b': { ground: 'grass', obj: 'bush' }, 'x': { ground: 'grass', obj: 'flowers' } };
  const ST_CLIFF = { cliff: '#', set: 'cliff', faces: 2 };
  const SO = grid(16, 16, '#');
  fill(SO, 1, 1, 14, 6, '.'); fill(SO, 1, 7, 14, 7, '#'); fill(SO, 6, 7, 7, 7, ','); fill(SO, 1, 8, 14, 10, 's'); fill(SO, 1, 11, 14, 14, 'w'); fill(SO, 12, 11, 14, 12, 's');
  for (const [x, y] of [[1, 1], [3, 2], [12, 1], [13, 3], [1, 5], [14, 5]]) SO[y][x] = 'Y'; SO[9][2] = 'y'; for (const [x, y] of [[9, 9], [4, 10]]) SO[y][x] = 'o'; SO[3][10] = 'x'; SO[5][12] = 'b';
  defineMap('sea_of_time_islet', {
    name: 'Sea of Time Islet', w: 16, h: 16, base: 'grass', music: 'islet', bg: 'grass', entry: { x: 2, y: 3 }, retreat: { map: 'world_tla', x: 261, y: 141, dir: DIR.DOWN },
    enc: [['Sea Dragon'], ['Gillman', 'Gillman']],
    build(M) {
      M.paint(0, 0, strs(SO), ST_LEG, ST_CLIFF);
      worldExit(M, 1, 0, 3, 1, 261, 141, DIR.UP);
      M.house(6, 1, 4, 4, 'roof_thatch', { wall: 'wall_mud', to: 'sea_of_time_hut', tx: 5, ty: 7, windows: false });
      M.setObj(5, 4, 'barrel'); M.setObj(11, 4, 'pot');
      // Lonesome George in the shallows off the beach
      M.npc('lonesome_george', 8, 11, { animal: 'turtle', name: 'Turtle', dir: DIR.UP, script: T3.lonesomeGeorge, mind: G.flag('islet_open') ? 'Want to go to my secret spot again?' : "I'm so very... very lonely. I could sure use a friend." });
      M.npc('st_oldman1', 12, 3, { type: 'elder', name: 'Old Man', dir: DIR.LEFT, text: 'You used to be able to dive into the ocean and find all sorts of treasure in the reefs. I liked to think all that stuff was a gift from the deep... A gift for me!', mind: 'I remember how we used to dredge up treasure by looking for shadows in the reefs...' });
      M.npc('st_oldman2', 3, 9, { type: 'elder', name: 'Old Man', dir: DIR.RIGHT, text: "The temperature of the ocean has been rising. The waters are hottest at the Sea of Time. I sure hope Poseidon hasn't surfaced again! He was once a king, but now, he's a monster!", mind: 'Long ago, Poseidon ruled over all the oceans as the one true king of the sea. Legends say the only way to defeat him is to stab him with a trident...' });
      M.trigger(1, 1, 3, 2, function* (E) { yield E.say('One hut under the palms, a beach below the cliff, and a great old turtle in the shallows, going nowhere.', 'Kraden'); }, { once: 'st_seen' });
      M.sign(10, 8, 'Sea of Time Islet. The fog lies to the west; the reefs south are full of rocks.');
    }
  });
  T3.lonesomeGeorge = function* (E) {
    const ride = function* () { yield E.say("And we're off!", 'Turtle'); yield Engine.fadeOut(30); E.warpNow('islet_cave_isle', 8, 10, DIR.UP); yield Engine.fadeIn(30); yield E.say('Well, here we are. When you want to go back to the island, just let me know.', 'Turtle'); };
    if (G.flag('islet_open')) {
      yield E.say('Yup!', 'Turtle');
      const r = yield* E.ask('Want to go to my secret spot again?', 'Turtle', ['Yes', 'No']);
      if (r === 0) { yield* ride(); } else yield E.say('Anytime you want me to take you to my secret spot, just say the word.', 'Turtle');
      return;
    }
    if (!G.inventory.has("Li'l Turtle")) { yield E.say('...', 'Turtle'); yield E.say('(The old turtle blinks, slowly, at the sea.)'); return; }
    yield E.say(G.flag('george_asked') ? "Oh! You're really going to let me take care of your li'l turtle?" : "I'm so very sad and lonely. I wish I had a friend to call my own... Hey! You've got an itty-bitty turtle tot, don't you? Why don't you set that li'l guy free with me?", 'Turtle');
    G.set('george_asked');
    const r = yield* E.ask('Set the Li\'l Turtle free with him?', null, ['Yes', 'No']);
    if (r !== 0) { yield E.say("No? Oh... Then lonely I shall stay. But if you change your mind, you know where to find me.", 'Turtle'); return; }
    G.inventory.remove("Li'l Turtle", 1); G.set('islet_open'); if (G.party.djinnCount && G.party.djinnCount() >= 72) G.set('anemos_open');
    const g = G.field.npcs.find(n => n.id === 'lonesome_george'); if (g) g.mind = 'Want to go to my secret spot again?';
    yield E.say("At long last, I have a friend! Lonesome George I am no more! I'm so happy! I don't have much to offer you in return, but I can show you... my secret spot. Hop on my back!", 'Turtle');
    yield* ride();
  };
  Kit.interior('sea_of_time_hut', { name: 'Sea of Time Islet - Hut', w: 11, h: 9, floor: 'rug', wall: 'wall_in', back: { map: 'sea_of_time_islet', x: 8, y: 5 }, music: 'islet',
    furn: [['bed', 2, 2], ['bed_foot', 2, 3], ['table', 5, 4], ['chair', 4, 4], ['chair', 6, 4], ['barrel', 8, 2], ['pot', 8, 5], ['shelf', 5, 1]] });

  // ====================== the secret spot: the rock-ringed islet with the cave ======================
  const IS = grid(16, 14, 'w');
  fill(IS, 4, 3, 11, 9, '.'); fill(IS, 4, 3, 11, 5, '#'); fill(IS, 6, 9, 9, 9, 's'); fill(IS, 6, 10, 9, 10, 's');
  for (const [x, y] of [[1, 1], [14, 2], [2, 7], [13, 8], [3, 12], [12, 12], [7, 1], [9, 13]]) IS[y][x] = 'R'; IS[6][4] = 'Y'; IS[7][11] = 'Y';
  defineMap('islet_cave_isle', {
    name: 'Islet Cave', w: 16, h: 14, base: 'water', music: 'islet', bg: 'water', entry: { x: 8, y: 10 }, retreat: { map: 'sea_of_time_islet', x: 8, y: 9, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(IS), Object.assign({}, ST_LEG, { 'R': { ground: 'water', obj: 'rock_small' } }), ST_CLIFF);
      M.setObj(8, 5, 'door_cave'); M.walkable(8, 5); M.set(8, 5, 'grass'); M.exit(8, 5, 1, 1, 'islet_cave', 14, 3, DIR.UP, { door: true });
      M.npc('george_here', 8, 11, { animal: 'turtle', name: 'Turtle', dir: DIR.UP, script: T3.georgeBack, mind: 'You all set to go back to the island?' });
      M.trigger(7, 9, 3, 2, function* (E) { yield E.say('A speck of an island, ringed with rocks - no ship could come near it. And in the middle of it, a cave.', 'Piers'); }, { once: 'isle_seen' });
    }
  });
  T3.georgeBack = function* (E) {
    yield E.say('Yup!', 'Turtle');
    const r = yield* E.ask('You all set to go back to the island?', 'Turtle', ['Yes', 'No']);
    if (r !== 0) { yield E.say("Take your time! I don't like to rush...", 'Turtle'); return; }
    yield E.say('Then back we go!', 'Turtle'); yield Engine.fadeOut(30); E.warpNow('sea_of_time_islet', 8, 9, DIR.DOWN); yield Engine.fadeIn(30);
    yield E.say('Here we are! If you want to go to my secret spot again, just let me know.', 'Turtle');
  };

  // ====================== the Islet Cave: the hall and its pool, the east room and its poles ======================
  const IC_ENC = [['Dinox'], ['Harridan', 'Harridan'], ['Magicore'], ['Squirrelfang', 'Squirrelfang'], ['Stone Soldier']];
  const IC_LEG = { '.': 'cave_sand', ',': 'cave_pebbles', '~': 'cave_water', 'D': { ground: 'cave_sand', obj: 'door_cave', walk: true }, 'o': { ground: 'cave_sand', obj: 'rock_sand' } };
  const IC_CLIFF = { cliff: '#', set: 'lilacrock', faces: 2 };
  const IC = grid(30, 32, '#');
  fill(IC, 10, 2, 18, 7, '.'); IC[1][14] = 'D';                                   // the top chamber, the circle's
  fill(IC, 2, 8, 27, 29, '.'); fill(IC, 9, 10, 20, 27, '~'); fill(IC, 13, 25, 15, 27, '.');   // the hall, the pool, the circle's ledge at the pool's south end
  fill(IC, 21, 10, 27, 12, '.'); IC[11][28] = 'D';                                // the east passage
  for (const [x, y] of [[4, 12], [24, 20], [6, 26], [22, 27]]) IC[y][x] = 'o'; for (const [x, y] of [[3, 20], [25, 15], [12, 29]]) IC[y][x] = ',';
  defineMap('islet_cave', {
    name: 'Islet Cave', w: 30, h: 32, base: 'void', music: 'isletcave', bg: 'cave', indoor: true, entry: { x: 14, y: 3 }, enc: IC_ENC, retreat: { map: 'islet_cave_isle', x: 8, y: 7, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(IC), IC_LEG, IC_CLIFF);
      M.exit(14, 1, 1, 1, 'islet_cave_isle', 8, 6, DIR.DOWN, { door: true });
      M.exit(28, 11, 1, 1, 'islet_cave_e', 2, 11, DIR.RIGHT, { door: true });
      // the two circles: one in the top chamber, one on the ledge at the pool's south end - each the other's twin, for Teleport
      M.object('tpcircle', 14, 5, { id: 'ic_circle_top', tile: 'ml_circle', to: { map: 'islet_corridor_1', x: 5, y: 37 } });   // Teleport: to the inner corridors
      M.object('tpcircle', 14, 26, { id: 'ic_circle_low', tile: 'ml_circle', to: { map: 'islet_cave', x: 14, y: 5 } });
      M.chest(4, 20, 'Turtle Boots', 1);
      M.trigger(13, 2, 3, 2, function* (E) { yield E.say('A cave under the islet - and a circle cut into the floor, like the ones in the old places. Nothing wakes it now.', 'Kraden'); }, { once: 'ic_seen' });
      M.trigger(21, 11, 1, 1, function* (E) { yield E.say('The water fills the hall. A way runs east; the chest stands over on the left side of the pool.', 'Sheba'); }, { once: 'ic_hall_seen' });
      M.sign(3, 9, 'The Islet Cave. Two circles, a pool, and rooms beyond it.');
    }
  });
  const IE = grid(26, 30, '#');
  fill(IE, 2, 6, 7, 27, '.'); fill(IE, 21, 6, 24, 27, '.'); fill(IE, 8, 2, 24, 4, '.');   // the west side (the way in), the east side, the north shore - none touching another
  fill(IE, 2, 2, 3, 4, '.'); fill(IE, 4, 2, 7, 4, '~'); fill(IE, 8, 5, 20, 27, '~'); IE[11][1] = 'D';   // the pocket at the north-west, the inlet before it, the pool
  for (const [x, y] of [[3, 20], [23, 8], [12, 3]]) IE[y][x] = 'o'; for (const [x, y] of [[5, 14], [22, 24], [16, 2]]) IE[y][x] = ',';
  defineMap('islet_cave_e', {
    name: 'Islet Cave - East Room', w: 26, h: 30, base: 'void', music: 'isletcave', bg: 'cave', indoor: true, entry: { x: 2, y: 11 }, enc: IC_ENC, retreat: { map: 'islet_cave_isle', x: 8, y: 7, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(IE), IC_LEG, IC_CLIFF);
      M.exit(1, 11, 1, 1, 'islet_cave', 27, 11, DIR.LEFT, { door: true });
      // the pole across the pool from the west shore, the pole up its east side to the north shore, the pole in the inlet
      M.object('log', 8, 26, { id: 'ice_pole1', len: 3, horiz: true, afloat: true });
      M.object('log', 20, 20, { id: 'ice_pole2', len: 3, horiz: false, afloat: true });
      M.object('log', 5, 3, { id: 'ice_pole3', len: 3, horiz: true, afloat: true });
      M.djinni('Meld', 18, 3, { fight: true });
      M.chest(2, 3, 'Rusty Staff', 1);
      M.trigger(7, 25, 1, 3, function* (E) { yield E.say('A pole lies in the pool off this bank, at its foot - step onto it and push, and it will carry us over to the east side.', 'Piers'); }, { once: 'ice_pole_seen' });
      M.trigger(21, 19, 1, 3, function* (E) { yield E.say('Another pole, standing in the water along this side. The same again: it will carry us the whole length of the pool, up to the north shore.', 'Jenna'); }, { once: 'ice_pole2_seen' });
      M.sign(22, 3, "The Djinni's shore. A pole floats in the inlet at the room's north-west corner.");
    }
  });
  // ====================== the inner corridors: five of them, each darker than the last; Serac; the Sentinel ======================
  const CO_ENC = [['Chimera Worm', 'Chimera Worm'], ['Cruel Dragon'], ['Druj', 'Druj'], ['Wonder Bird']];
  const corridor = (n, dark, build) => {
    const C = grid(10, 40, '#'); fill(C, 3, 2, 6, 37, '.'); fill(C, 2, 8, 7, 12, '.'); fill(C, 2, 20, 7, 24, '.'); fill(C, 2, 30, 7, 33, '.'); C[1][4] = 'D'; C[1][5] = 'D';
    for (const [x, y] of [[3, 15], [6, 27], [2, 22]]) C[y][x] = 'o'; for (const [x, y] of [[5, 5], [4, 35]]) C[y][x] = ',';
    defineMap('islet_corridor_' + n, {
      name: 'Islet Cave - Corridor ' + n, w: 10, h: 40, base: 'void', music: 'isletcave', bg: 'dark', indoor: true, dark: true, darkLevel: dark, entry: { x: 5, y: 37 }, enc: CO_ENC, retreat: { map: 'islet_cave_isle', x: 8, y: 7, dir: DIR.DOWN },
      build(M) {
        M.paint(0, 0, strs(C), IC_LEG, IC_CLIFF);
        M.walkable(4, 1, 2, 1); M.exit(4, 1, 2, 1, n < 5 ? 'islet_corridor_' + (n + 1) : 'islet_shrine', n < 5 ? 5 : 8, n < 5 ? 37 : 13, DIR.UP, { door: true });
        if (build) build(M);
      }
    });
  };
  corridor(1, 0.55, (M) => { M.trigger(4, 35, 2, 2, function* (E) { yield E.say('The circle set the party down in a corridor under the cave - long, and dim, and going one way: up. The ones beyond it will be darker, if the sailors are right.', 'Kraden'); }, { once: 'ico_seen' }); });
  corridor(2, 0.68, (M) => { M.object('shakeable', 5, 22, { id: 'ico_serac_rock', tile: 'rock_sand', onShake: function* (E) { if (G.party.djinnFound.includes('Serac')) return; G.field.map.objects.push({ kind: 'djinni', x: 5, y: 21, name: 'Serac', key: 'djinn:Serac', fight: true, el: DJINN.Serac.el }); yield E.say('The rock shakes apart under Tremor - and something that was asleep under it is not any more. A Mercury Djinni, and an angry one.'); } }); M.trigger(4, 24, 2, 1, function* (E) { yield E.say('A rock in the wide part of the corridor, and a chill off it. Tremor would shake it.', 'Sheba'); }, { once: 'ico_rock_seen', cond: () => !G.party.djinnFound.includes('Serac') }); });
  corridor(3, 0.78); corridor(4, 0.86); corridor(5, 0.92);
  const SH = grid(16, 16, '#');
  fill(SH, 3, 2, 12, 12, '.'); fill(SH, 7, 12, 9, 14, '.'); fill(SH, 3, 2, 12, 2, ',');
  defineMap('islet_shrine', {
    name: "Islet Cave - The Sentinel's Chamber", w: 16, h: 16, base: 'void', music: 'isletcave', bg: 'dark', indoor: true, entry: { x: 8, y: 13 }, enc: [], retreat: { map: 'islet_cave_isle', x: 8, y: 7, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(SH), IC_LEG, IC_CLIFF);
      M.walkable(7, 15, 3, 1); M.exit(7, 15, 3, 1, 'islet_corridor_5', 5, 3, DIR.DOWN, { door: true });
      if (!G.flag('sentinel_done')) M.boss('Sentinel', 8, 5, { done: 'sentinel_done' });
      M.trigger(6, 8, 5, 1, T3.sentinel, { once: 'sentinel_scene', cond: () => !G.flag('sentinel_done') });
      M.object('statue', 8, 3, { id: 'ico_tablet', tile: 'ar_tablet', script: function* (E) { if (!G.flag('sentinel_done')) { yield E.say('The knight stands between the party and the tablet.'); return; } if (G.flag('catastrophe_taken')) { yield E.say("The tablet of Catastrophe. Its power is already the party's."); return; } yield E.say('The tablet the Sentinel kept, cut with a herald of ruin. The party reads it - and the air itself answers.'); G.set('catastrophe_taken'); Engine.doFlash(14, '#e0e0ff'); Audio.sfx('summon'); yield E.summon('Catastrophe'); } });
    }
  });
  T3.sentinel = function* (E) {
    if (G.flag('sentinel_done')) return;
    yield E.face('player', DIR.UP);
    yield E.say('I am the guardian of wind. If you would claim my power, you must prove your worth.', 'Sentinel');
    yield E.say('(A knight of gold, taller than a man, steps forward out of the dark.)');
    const r = yield* E.battle(['Sentinel'], { boss: true, canFlee: false, music: 'final' }); if (r !== 'win') return;
    G.set('sentinel_done'); for (const n of G.field.npcs.slice()) if (/Sentinel/.test(n.id)) G.field.removeNpc(n.id);
    yield E.say('The Sentinel sinks to one knee, and then to the floor, and is still. Behind where it stood, the tablet.');
  };

}
