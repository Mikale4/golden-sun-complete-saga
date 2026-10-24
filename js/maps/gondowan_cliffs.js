// ---------- Gondowan Cliffs ----------
// After map references/golden-sun-the-lost-age-gondowan-cliffs-gba-map.webp (120 x 85), condensed: lilac terraces
// stepping down to the river on the west, sand and grass between, vines up the faces, the rocks in the water that
// are hopped between. Per the guide: the men of Kibombo in the cave behind the foliage by the start, the dog with a
// thought to read, Scoop on the yellow sand for the geyser that lifts the party to the terrace, the three slides
// (the middle one to the pocket with the pillar for the water), the vine down, the jumping field, the vines up to
// the Sleep Bomb, Kindle on the top terrace, the Laughing Fungus, the tightrope out to Gondowan; and on the way
// back with Piers, Frost on the puddle under the top terrace's east end for the Healing Fungus (Char's price).
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEG = {
    '.': 'sand', 'g': 'grass', 'y': 'sand_puddle', 'w': 'water', 'h': 'water_hop', 's': 'stepstone', 'S': 'lc_slide', 'p': 'pit',
    'v': { ground: 'sand', obj: 'vineladder', walk: true }, 'r': { ground: 'water', obj: 'ropeh_open', walk: true }, 't': { ground: 'grass', obj: 'tree' }, 'b': { ground: 'grass', obj: 'bush' }, 'o': { ground: 'sand', obj: 'rock_small' },
    'D': { ground: 'sand', obj: 'lc_door' }
  };
  const LILAC = { cliff: '#', set: 'lilacrock', faces: 2 };
  const G_ENC = [['Wild Gorilla'], ['Wolfkin Cub', 'Wolfkin Cub'], ['Wyvern Chick']];
  const C = grid(50, 32, '#');
  // the lowest level: in from the east, the dog, the foliage over the cave door, the yellow sand
  fill(C, 23, 22, 49, 27, '.'); fill(C, 44, 22, 48, 23, 'g'); fill(C, 24, 26, 30, 27, 'g'); C[22][41] = '.'; C[21][41] = 'D';
  for (const [x, y] of [[46, 22], [26, 27], [37, 26]]) C[y][x] = 't'; for (const [x, y] of [[44, 27], [35, 22]]) C[y][x] = 'b'; C[25][32] = 'y';
  // the middle terrace: the geyser's landing, the mushrooms, the three slides off its west end; the pocket under the middle one
  fill(C, 18, 13, 40, 16, '.'); fill(C, 34, 13, 39, 14, 'g'); C[17][18] = 'S'; C[17][20] = 'S'; C[17][22] = 'S'; C[14][36] = 'b';
  fill(C, 19, 20, 21, 21, '.'); C[21][18] = 'p'; fill(C, 14, 20, 17, 22, '.'); fill(C, 13, 19, 13, 23, 'w'); fill(C, 10, 20, 12, 22, '.');   // the pocket, the gap, the pillar's yard, the water, the far bank
  fill(C, 11, 23, 11, 24, 'v'); fill(C, 8, 25, 12, 27, '.');   // the vine down to the river bank
  // the river and its rocks: the jumping field
  fill(C, 1, 20, 9, 30, 'w'); fill(C, 1, 31, 12, 31, 'w'); fill(C, 1, 18, 1, 19, 'w'); fill(C, 1, 3, 1, 17, 'w');
  fill(C, 8, 25, 9, 27, 'w'); for (const [x, y, ch] of [[9, 26, 'h'], [8, 26, 's'], [7, 26, 'h'], [6, 26, 's'], [6, 25, 'h'], [6, 24, 's'], [6, 23, 'h'], [6, 22, 's'], [5, 22, 'h'], [4, 22, 's']]) C[y][x] = ch; fill(C, 2, 20, 3, 24, '.');   // the stones, hopped between, and the west bank
  fill(C, 3, 17, 3, 19, 'v'); fill(C, 2, 13, 8, 16, '.'); fill(C, 4, 10, 4, 12, 'v'); C[9][4] = 'p'; fill(C, 2, 4, 12, 8, '.'); fill(C, 10, 5, 10, 6, 'v'); fill(C, 9, 3, 11, 4, '.');   // the vines up the west side, the gap, the chest's shelf
  fill(C, 13, 4, 42, 7, '.'); fill(C, 28, 4, 33, 5, 'g'); for (const [x, y] of [[16, 7], [30, 4], [41, 7]]) C[y][x] = 't'; for (const [x, y] of [[22, 5], [38, 6]]) C[y][x] = 'o';   // the top terrace east to Kindle
  C[8][38] = 'p'; fill(C, 36, 9, 40, 11, '.'); C[12][38] = 'S';   // the puddle in the gap below the top terrace, the fungus's ledge, the slide off it
  // the terraces are not ruled lines: rock noses into them and sand runs out past them
  for (const [x0, y0, x1, y1] of [[28, 22, 29, 22], [38, 23, 39, 23], [30, 16, 31, 16], [19, 7, 19, 7], [33, 4, 33, 4], [24, 13, 24, 13], [6, 13, 6, 13]]) fill(C, x0, y0, x1, y1, '#');
  for (const [x0, y0, x1, y1] of [[45, 21, 47, 21], [24, 28, 27, 28], [33, 28, 34, 28], [26, 12, 29, 12], [32, 17, 33, 17], [14, 3, 18, 3], [26, 8, 29, 8], [2, 12, 4, 12], [2, 9, 3, 9], [10, 27, 12, 28]]) fill(C, x0, y0, x1, y1, '.');
  C[28][25] = 'g'; C[12][27] = 'g'; C[3][16] = 'b'; C[21][46] = 't'; C[28][34] = 'o';
  C[5][1] = 'r'; C[5][0] = '.';   // the tightrope out west
  fill(C, 1, 0, 1, 2, 'w');   // the river runs out at the top of the map: the strait the ship sails, in from the bay to the north and out to the sea to the south
  defineMap('gondowan_cliffs', {
    name: 'Gondowan Cliffs', w: 50, h: 32, base: 'void', music: 'overworld2', bg: 'grass', entry: { x: 48, y: 25 }, enc: G_ENC, retreat: { map: 'world_tla', x: 132, y: 201, dir: DIR.RIGHT },
    fall: (x, y) => ({ 18: { map: 'gondowan_cliffs', x: 25, y: 23 }, 20: { map: 'gondowan_cliffs', x: 20, y: 20 }, 22: { map: 'gondowan_cliffs', x: 26, y: 23 }, 38: { map: 'gondowan_cliffs', x: 38, y: 15 } })[x] || null,
    build(M) {
      M.paint(0, 0, strs(C), LEG, LILAC);
      M.exit(49, 24, 1, 3, 'world_tla', 132, 201, DIR.RIGHT); M.walkable(49, 24, 1, 3); M.exit(0, 5, 1, 1, 'world_tla', 128, 201, DIR.LEFT);
      // the strait: the ship comes down the river from the bay north of the cliffs (the Eastern Sea) and, once the rock
      // in it is ground away, goes on south to the sea beyond (the Western Sea) - the way west the Grindstone opens
      M.exit(1, 0, 1, 1, 'world_tla', 130, 198, DIR.UP, { ship: true }); M.exit(1, 31, 1, 1, 'world_tla', 130, 204, DIR.DOWN, { ship: true });
      M.object('rock_water', 1, 12, { id: 'gc_strait_rock', look: 'ak_stone_brown', sunkGround: null, flag: 'gc_strait_open' });
      M.trigger(1, 1, 1, 2, function* (E) { yield E.say('The Gondowan Cliffs. The river runs right through them, out to the western sea... and there is the rock that blocks it.', 'Kraden'); if (G.inventory.has('Grindstone')) { yield E.say('Not for long. The Grindstone!', 'Felix'); G.set('gc_strait_seen'); } else yield E.say('Nothing we have will move that. The way west is shut to us.', 'Piers'); }, { cond: () => !!G.field.ship && !G.flag('gc_strait_seen') && !G.flag('gc_strait_open') });
      // the cave behind the foliage; the dog by the way in
      M.object('vines', 41, 21, { id: 'gc_vines', reveal: 'lc_door' }); M.exit(41, 21, 1, 1, 'gondowan_cliffs_cave', 6, 12, DIR.UP, { door: true, cond: () => !M.objects.find(o => o.id === 'gc_vines' && !o.gone) });
      M.npc('gc_dog', 44, 25, { animal: 'dog', animalCol: '#c8a070', name: 'Dog', move: 'wander', text: 'Rrruff! Rrruff!', mind: () => G.flag('gc_geyser') ? '(I knew it! I knew there was something there, and he dug it up! Look at that!)' : '(Dig here, you dig? Rrruff!)' });
      // the yellow sand: Scoop, and the geyser under it lifts whoever stands there to the terrace
      M.object('scoop', 32, 25, { id: 'gc_dig', onScoop: function* (E) { G.set('gc_geyser'); Audio.sfx('water'); yield E.say('The sand gives way and a jet of air roars up out of the ground - a geyser of wind!'); } });
      M.object('updraft', 32, 25, { id: 'gc_geyser', to: { x: 32, y: 15 }, active: () => !!G.flag('gc_geyser') });
      // the mushrooms are picked where they grow
      const shroom = (id, x, y, item, look) => M.object('spot', x, y, { id, tile: look, script: function* (E) { const key = 'gondowan_cliffs:hidden:' + x + ',' + y; if (G.flag(key)) { yield E.say('Only the stalk is left.'); return; } G.set(key); yield E.say('A mushroom grows here, fat and pale in the shade of the rock.'); yield E.give(item, 1); const o = G.field.map.objects.find(ob => ob.id === id); if (o) o.gone = true; } });
      shroom('gc_fungus', 36, 10, 'Healing Fungus', 'mushroom'); shroom('gc_fungus2', 40, 5, 'Laughing Fungus', 'mushroom_red');
      M.object('puddle', 38, 8, { id: 'gc_puddle' });
      // the pocket under the middle slide: the gap, the pillar for the water
      M.object('hop', 18, 21, { id: 'gc_hop' }); M.object('pillar', 16, 21, { id: 'gc_pillar' });
      M.object('hop', 4, 9, { id: 'gc_hop2' });
      M.chest(10, 3, 'Sleep Bomb', 1);
      M.djinni('Kindle', 36, 5, { fight: true });
      M.sign(47, 23, 'Gondowan Cliffs. West to Gondowan, east to Osenia. The terraces are the way: up by the vines, down by the slopes.');
      M.sign(24, 14, 'Three slopes off the west end of this terrace. The outer two go down to the start; the middle one goes somewhere else.');
      M.trigger(46, 24, 3, 3, function* (E) { yield E.say("Gondowan Cliffs. Piers came this way, they said in Madra - after the Kibombo who took his ship's orb.", 'Kraden'); yield E.say('Then we follow. Gondowan is across these cliffs.', 'Felix'); }, { once: 'gc_seen' });
    }
  });
  // the cave: four men of Kibombo, on the run after the raid on Madra, pretending to camp (the script's lines; Mind Read tells the truth)
  const CV = grid(14, 14, '#');
  fill(CV, 2, 2, 11, 11, '.'); fill(CV, 5, 12, 7, 12, '.'); CV[13][6] = 'D';
  defineMap('gondowan_cliffs_cave', {
    name: 'Gondowan Cliffs - Cave', w: 14, h: 14, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 6, y: 12 },
    build(M) {
      M.paint(0, 0, strs(CV), Object.assign({}, LEG, { '.': 'cave_sand' }), { cliff: '#', set: 'lilacrock', faces: 1 });
      M.setObj(6, 13, 'lc_door'); M.exit(6, 13, 1, 1, 'gondowan_cliffs', 41, 22, DIR.DOWN, { door: true });
      M.setObj(6, 6, 'campfire'); M.light(6, 6, 4);
      M.npc('gc_warrior1', 5, 5, { type: 'tribal', name: 'Man', dir: DIR.RIGHT, text: "I'm, uh, from Kibombo... It's, er... nice to meet you.", mind: "(Oh, tense... We're busted! They're on to us, I know it! We never should have launched that raid on Madra without the others!)" });
      M.npc('gc_warrior2', 8, 7, { type: 'tribal', name: 'Man', dir: DIR.LEFT, text: "Hey, we're just here to finish what you guys started, OK? You guys are the ones who rammed into our continent, and don't you forget it!", mind: "(My family lost its entire store of food - months' worth, gone in a flash! Well, we'll show those foreigners what happens when they mess with us!)" });
      M.npc('gc_warrior3', 6, 9, { type: 'tribal', name: 'Man', dir: DIR.UP, text: "Hey, we're just out here, uh... camping... Yup. If you want good camping, go to Indra. We're just here to, you know, see the sights and stuff.", mind: "(And once Kibombo warriors swarm over your town, we'll all be real good friends...)" });
      M.npc('gc_warrior4', 9, 4, { type: 'tribal', name: 'Man', dir: DIR.DOWN, text: "Our friends from Kibombo are coming soon. When they get here, we'll all come say hello.", mind: "(It was a good raid, but after all that work, we didn't find a thing... I wonder what happened to those people who fled from the jail we broke into.)" });
      M.trigger(5, 11, 3, 2, function* (E) { yield E.say("We've been found!", 'Man'); yield E.say('You wanna fight, punk?', 'Man'); yield E.say("No one said anything about fighting yet! We haven't done anything to you!", 'Man'); yield E.say('And if you think we did, then prove it!', 'Man'); yield E.say('(Kibombo men. The ones who raided Madra, I would say - and not happy to be found.)', 'Kraden'); }, { once: 'gc_cave_seen' });
    }
  });
}
