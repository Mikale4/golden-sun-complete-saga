// ---------- Alpine Crossing ----------
// The mountain road between Xian's valley and Altin, laid out after map references/golden-sun-alpine-crossing-gba-map.webp:
// brown terraces stepping down from the north, the road winding through them from the west to the east, the two
// cave mouths A and B in the cliff face joined by a short tunnel, boulders everywhere, a sprout that Growth makes
// a vine of, a puddle that Frost makes a stepping pillar of. On the ledge west of the road lies Hsu of Xian under
// a fallen boulder: Feizhi foresaw it, Hama went with her, and neither can shift the stone. Reveal shows the way
// onto the ledge, Lift frees him. (The guide: chapter 7, Alpine Crossing (Optional).)
'use strict';
const AL_LEGEND = {
  '.': 'grass', 'p': 'path', 'w': 'water', 'd': 'dirt',
  'T': { ground: 'grass', obj: 'tree' }, 'R': { ground: 'grass', obj: 'tree_red' }, 'o': { ground: 'grass', obj: 'rock_grass' }, 'v': { ground: 'grass', obj: 'bush' }, 'f': { ground: 'grass', obj: 'flower' },
  'D': 'dirt', 'H': 'grass', 'S': 'grass', 'P': 'grass', 'C': 'grass', 'L': { ground: 'grass', obj: 'rock_grass' },
};
const AL_ROWS = [
  '################.....###........',   // 0
  'R##..........###......##....##R.',   // 1
  '###..T#####.###...v...........#.',   // 2
  '###.#.#########.######..f...####',   // 3
  '#.o.#.#########..####..oo######T',   // 4
  '##...##ppp#####.....##.o.####...',   // 5
  '.....##p.##.####..####.##.....o.',   // 6
  '.#.##..p.###..###.##..Spp.......',   // 7
  '##....#pp.....#.#####.pp.#####o.',   // 8
  '###.#####.#.##.###.o.pp.#####.##',   // 9
  '#########.#.###..#..pp.#.pppppp.',   // 10
  '####D...##..D....pp..##pp.....pp',   // 11
  '#######o##........p....o......p.',   // 12
  '####......###...pp...#......pp..',   // 13
  '....oHo.o.#..o.p.##.P...oo..p...',   // 14
  'p...o####L....p.#.#.........p..#',   // 15
  'p.###..pp.o.######.....T....pp.#',   // 16
  '.....##pp..##..####.o......T.p.#',   // 17
  '.......pp...T.#..p......######p.',   // 18
  '......T...ppp##.ppp..T..########',   // 19
  '...T......p...T.p.......#.C...##',   // 20
  '....#.....pp..........T#....T...',   // 21
  '....#.....pp....T...............',   // 22
  '....#.....pp....T...............',   // 23
];
defineMap('alpine', {
  name: 'Alpine Crossing', w: 32, h: 24, base: 'grass', music: 'overworld', bg: 'grass', entry: { x: 1, y: 15 }, enc: [['Slime Beast'], ['Tarantula'], ['Rat Fighter', 'Rat Fighter'], ['Calamar']], retreat: { map: 'world_gs1', x: 65, y: 42, dir: DIR.DOWN },
  build(M) {
    M.paint(0, 0, AL_ROWS, AL_LEGEND, { set: 'cliff', faces: 2 });
    M.exit(0, 15, 1, 2, 'world_gs1', 65, 42, DIR.LEFT); M.walkable(0, 15, 1, 2);
    M.exit(31, 11, 1, 1, 'world_gs1', 67, 42, DIR.RIGHT); M.walkable(31, 11);
    // the two cave mouths, joined by the tunnel under the terrace
    M.setObj(4, 11, 'door_cave'); M.walkable(4, 11); M.exit(4, 11, 1, 1, 'alpine_tunnel', 2, 3, DIR.UP, { door: true });
    M.setObj(12, 11, 'door_cave'); M.walkable(12, 11); M.exit(12, 11, 1, 1, 'alpine_tunnel', 13, 3, DIR.UP, { door: true });
    // the sprout Growth raises to a vine up the terrace, the puddle Frost freezes into a pillar across the stream
    M.object('sprout', 22, 7, { id: 'al_sprout' });
    M.fill(20, 14, 1, 2, 'water'); M.object('puddle', 20, 14, { id: 'al_puddle' });
    M.chest(26, 20, 'Power Bread', 1); M.chest(26, 6, 'Vial', 1); M.chest(7, 11, 'Nut', 1);   // the Nut in the pocket the tunnel opens on
    M.chest(18, 2, 'Lucky Medal', 1);
    M.djinni('Corona', 29, 6, { fight: false });
    M.npc('alpine_traveler', 16, 13, { type: 'villager_m', text: () => G.flag('hsu_rescued') ? "They carried the Xian man down the mountain on a litter. Alive, thanks to you." : G.flag('hama_hsu') ? "A woman from the temple and a girl went up onto the west ledge. Someone's trapped under a rock there, they say, and no way up to him that I can see." : "Boulders come down off these terraces every spring. Mind your head." });
    // Hsu under the boulder, Hama and Feizhi beside him, once they have left the temple for him
    if (G.flag('hsu_rescued')) { M.setObj(9, 15, null); M.walkable(9, 15); }   // the rock was rolled away carrying Hsu down
    else M.hidden.push({ x: 9, y: 15, tile: 'grass' });   // the way onto the ledge: a rock that Reveal sees through
    if (G.flag('hama_hsu') && !G.flag('hsu_rescued')) {
      M.object('boulder', 5, 14, { id: 'hsu_boulder', onLift: STORY.hsuRescue, script: function* (E) { yield E.say("(A groan comes from under the boulder. Someone is pinned beneath it.)"); } });
      M.npc('HamaNPC', 7, 14, { look: NPC_LOOKS.Hama, name: 'Hama', dir: DIR.DOWN, script: STORY.hamaAlpine });
      M.npc('FeizhiNPC', 4, 13, { look: NPC_LOOKS.Feizhi, name: 'Feizhi', dir: DIR.DOWN, script: STORY.feizhiAlpine });
    }
  }
});
// the tunnel between the cave mouths
defineMap('alpine_tunnel', {
  name: 'Alpine Crossing', w: 16, h: 6, base: 'void', music: 'dungeon', bg: 'cave', indoor: true, entry: { x: 2, y: 3 }, enc: [['Rat Fighter'], ['Tarantula']],
  build(M) {
    M.cave(0, 0, 16, 6); M.setObj(2, 4, 'door_cave'); M.walkable(2, 4); M.exit(2, 4, 1, 1, 'alpine', 5, 11, DIR.RIGHT, { door: true }); M.setObj(13, 4, 'door_cave'); M.walkable(13, 4); M.exit(13, 4, 1, 1, 'alpine', 12, 12, DIR.DOWN, { door: true });
    M.chest(8, 2, 'Elixir', 1);
  }
});
// ---- Hsu's rescue ----
STORY.hamaAlpine = function* (E) {
  yield E.say("Isaac... you came. Hsu lies under that stone. Feizhi saw it happen from a hundred miles away - and I could not lift it. My Psynergy is of the wind; it does not move mountains.", 'Hama');
  if (G.party.hasPsy && G.party.hasPsy('Lift')) yield E.say("You carry a Lifting Gem? Then raise it. Quickly - he has been under there since dawn.", 'Hama');
  else yield E.say("Earth Psynergy might raise it. The miners of Altin speak of a gem that lifts stone...", 'Hama');
};
STORY.feizhiAlpine = function* (E) {
  yield E.say("Hsu! Hsu, hold on! ...I saw it, Isaac. I saw the rock fall on him. That's why I ran to Master Hama. Please - can you help him?", 'Feizhi');
};
STORY.hsuRescue = function* (E) {
  Engine.doShake(8); yield 20;
  E.spawn('HsuNPC', 5, 14, { look: npcLook('villager_m', 41), name: 'Hsu', dir: DIR.DOWN, solid: false });
  yield E.say("(The boulder rises and rolls aside. Hsu draws a great breath.)");
  yield E.say("Hsu!", 'Feizhi'); yield 20;
  yield E.say("...Feizhi? You... you were right. About the rock. About all of it.", 'Hsu');
  yield E.say("You saw it before it happened, Feizhi. Not in a dream - awake, and from Xian. That is not the Ki that Master Feh teaches.", 'Hama');
  yield E.say("I was hit on the head by a stone the day Mt. Aleph erupted... Since then I see things. Far things.", 'Feizhi');
  yield E.say("The stones that fell that day carried the mountain's power. It woke something in you.", 'Hama');
  yield E.say("(Hama looks at Ivan for a long moment, and then away.)");
  yield E.say("We will carry Hsu down to Xian. Thank you, Isaac. All of you.", 'Hama');
  G.set('hsu_rescued'); G.set('feizhi_done');
  { const M = G.map; M.setObj(9, 15, null); M.walkable(9, 15); M.hidden = M.hidden.filter(h => !(h.x === 9 && h.y === 15)); M.finalize(); }   // the way off the ledge stays open
  E.despawn && E.despawn('HsuNPC'); E.despawn && E.despawn('HamaNPC'); E.despawn && E.despawn('FeizhiNPC');
  yield E.say("(Hama and Feizhi help Hsu up and start down the mountain road.)");
};
