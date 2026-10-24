// ---------- Osenia Cavern ----------
// After map references/golden-sun-the-lost-age-osenia-cavern-gba-map.webp (41 x 46): the hall with its maze of rock
// blocks, the two pits down to the lower gallery, the little room off to the east. Per the guide: Scoop on the
// marked sand in the right-hand pocket opens the way down; the lower gallery's east ladder comes up in the room with
// the stone tablet - Megaera, a Mars and a Jupiter Djinni's summon. The west ladder is the way back into the hall.
'use strict';
{
  const T3 = STORY_TLA;
  const grid = (w, h, ch) => { const rows = []; for (let y = 0; y < h; y++) rows.push(new Array(w).fill(ch)); return rows; };
  const fill = (rows, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch; };
  const strs = (rows) => rows.map(r => r.join(''));
  const LEGEND = { '.': 'cave_sand', 'o': { ground: 'cave_sand', obj: 'grey_rock' }, 'L': { ground: 'cave_sand', obj: 'ladder', walk: true }, 's': 'cave_pebbles' };
  // the hall: (0,0) is the rip's (3,2)
  const H = grid(22, 24, '#');
  fill(H, 2, 2, 19, 13, '.'); fill(H, 1, 6, 1, 11, '.'); fill(H, 20, 6, 20, 11, '.'); fill(H, 9, 14, 13, 21, '.'); fill(H, 10, 22, 12, 23, '.');
  // the rock blocks of the maze, as the picture has them
  for (const [x, y] of [[9, 3], [9, 4], [9, 5], [16, 3], [16, 4], [12, 4], [12, 5], [11, 5], [13, 5], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [12, 7], [13, 7], [16, 7], [17, 7], [18, 7], [19, 7], [5, 8], [10, 8], [12, 8], [16, 8], [5, 9], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [16, 9], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10], [17, 10], [18, 10], [12, 12], [10, 17], [11, 18]]) H[y][x] = 'o';
  H[9][7] = 's'; H[9][17] = 's';
  defineMap('osenia_cavern', {
    name: 'Osenia Cavern', w: 22, h: 24, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 11, y: 22 }, enc: [['Alec Goblin'], ['Numb Ant', 'Numb Ant'], ['Mad Mole II']], retreat: { map: 'world_tla', x: 202, y: 223, dir: DIR.DOWN },
    build(M) {
      M.paint(0, 0, strs(H), LEGEND, { cliff: '#', set: 'sandcliff', faces: 1 });
      M.exit(10, 23, 3, 1, 'world_tla', 202, 223, DIR.DOWN); M.walkable(10, 23, 3, 1);
      // the marked sand in the right pocket: Scoop, and the floor gives way to the gallery below
      M.object('scoop', 17, 9, { id: 'oc_dig', hole: true, look: 'sand_puddle' }); M.exit(17, 9, 1, 1, 'osenia_cavern_low', 12, 3, DIR.DOWN, { cond: () => G.flag('obj:osenia_cavern:scoop:oc_dig:open') });
      M.sign(7, 9, 'Someone has scratched a cross into the sand here, and another over there, by the right-hand wall.');
      M.sign(4, 3, 'Osenia Cavern. The rock blocks were set here by hands, a long time ago.');
    }
  });
  // the lower gallery: the fall lands in its middle; its east ladder climbs to the tablet's room, its west ladder to the hall
  defineMap('osenia_cavern_low', {
    name: 'Osenia Cavern - Below', w: 18, h: 9, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 12, y: 3 }, enc: [['Alec Goblin'], ['Numb Ant', 'Numb Ant']], retreat: { map: 'world_tla', x: 202, y: 223, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 18, 9, 'cave_sand', 'sandcliff_face', 'sandcliff_top'); M.fillObj(7, 3, 2, 3, 'sandcliff_top');
      M.setObj(2, 2, 'ladder'); M.walkable(2, 2); M.exit(2, 2, 1, 1, 'osenia_cavern', 3, 12, DIR.UP, { stairs: true });
      M.setObj(15, 2, 'ladder'); M.walkable(15, 2); M.exit(15, 2, 1, 1, 'osenia_cavern_tablet', 4, 6, DIR.UP, { stairs: true });
      M.setObj(12, 6, 'grey_rock'); M.setObj(4, 6, 'grey_rock'); M.sign(9, 7, 'Sand has drifted in from above. Two ladders, east and west.'); }
  });
  // the tablet's room
  defineMap('osenia_cavern_tablet', {
    name: 'Osenia Cavern - Shrine', w: 9, h: 9, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 4, y: 6 }, retreat: { map: 'world_tla', x: 202, y: 223, dir: DIR.DOWN },
    build(M) { M.cave(0, 0, 9, 9, 'cave_sand', 'sandcliff_face', 'sandcliff_top'); M.setObj(4, 7, 'ladder'); M.walkable(4, 7); M.exit(4, 7, 1, 1, 'osenia_cavern_low', 15, 3, DIR.DOWN, { stairs: true });
      M.fill(3, 2, 3, 2, 'marble'); M.object('statue', 4, 2, { id: 'megaera_tablet', tile: G.flag('megaera_taken') ? 'statue_gold' : 'psystone', script: T3.megaeraTablet });
      for (const [x, y] of [[1, 2], [7, 2]]) M.setObj(x, y, 'grey_rock'); }
  });
  T3.megaeraTablet = function* (E) {
    if (G.flag('megaera_taken')) { yield E.say('The dais is empty; the tablet\'s words are in Felix\'s head now.'); return; }
    yield E.say('A stone tablet, carved with a winged woman in fire. The rock around it is warm.');
    G.set('megaera_taken'); Engine.doFlash(14, '#ffd0a0'); Audio.sfx('summon'); yield E.summon('Megaera');
    yield E.say("Megaera... a Mars summon, with a Jupiter Djinni's help. She raises the arm of everyone who fights beside her.", 'Sheba');
    const o = G.field.objectAt(4, 2); if (o) o.tile = 'statue_gold';
  };
}
