// ---------- The Battle Arenas: a hall in every major town (the user's rule), and the door into it ----------
// A town is major if it has an inn. Each gets one big hall ('arena_<town>') with the counters, the fountain, the ticket
// games, the bookmaker's window and the pit; the building itself is set down on the largest open ground the town has,
// nearest its entrance, when the town is built (the layouts are hand-drawn: nothing is overwritten but open grass).
// The hall's workings are in js/game/arena.js.
'use strict';
(function () {
  const patch = (id, fn) => { const def = MAPS[id]; if (!def) return; if (!def._classPatches) { const orig = def.build; def._classPatches = {}; def.build = function (M) { if (orig) orig.call(this, M); for (const list of Object.values(def._classPatches)) for (const f of list) f(M); }; } (def._classPatches.arena = def._classPatches.arena || []).push(fn); };
  const towns = Object.keys(MAPS).filter(id => MAPS[id + '_inn'] && !MAPS[id].world && !MAPS[id].indoor);
  ARENA.towns = towns;

  // open ground of w x h plus the row before the door, nearest the town's entrance: level ground, no building, no
  // cliff, no water and nobody's doorstep - a tree or a bush in the way is cleared (the towns are wooded; a hall needs
  // its yard), a wall or a roof is never touched
  const OPEN = new Set(['grass', 'path', 'dirt', 'sand', 'snow', 'grass_dark', 'floor_stone', 'cobble', 'ice', 'stonefloor', 'marble', 'flowers']);
  const CLEAR = new Set(['tree', 'tree_small', 'tree_pine', 'pinesnow', 'bush', 'flowers', 'grass_tuft', 'rock_small', 'shrub', 'palm']);
  function findSpot(M, w, h) {
    const entry = M.def.entry || { x: Math.floor(M.w / 2), y: M.h - 2 }; let best = null;
    const bad = (x, y) => { if (!M.inb(x, y)) return true; const t = M.get(x, y); if (!OPEN.has(t.name) || t.solid || t.water) return true; const o = M.getObj(x, y); if (o && !CLEAR.has(o.name)) return true; if (M.exits.some(e => x >= e.x - 1 && x < e.x + e.w + 1 && y >= e.y - 1 && y < e.y + e.h + 1)) return true; if ((M.npcs || []).some(n => n.x === x && n.y === y)) return true; if ((M.triggers || []).some(t => x >= t.x - 1 && x < t.x + t.w + 1 && y >= t.y - 1 && y < t.y + t.h + 1)) return true;   /* a story's trigger (Prox's welcome at its gate) is never built over */ return false; };
    for (let y = 1; y < M.h - h - 1; y++) for (let x = 1; x < M.w - w - 1; x++) {
      let ok = true; for (let j = 0; j <= h && ok; j++) for (let i = 0; i < w && ok; i++) if (bad(x + i, y + j)) ok = false;   /* the building, and the row before its door */
      if (!ok) continue; const d = Math.abs(x + w / 2 - entry.x) + Math.abs(y + h - entry.y); if (!best || d < best.d) best = { x, y, d };
    }
    return best;
  }
  // a cliff face (or a town wall) with open ground before it, nearest the entrance: where a stone door can go
  const FACE = /cliff|rock|gc_|br_|ak_|wall_adobe|wall_sandbrick|wall_mud|wall_temple|palisade_face|icewall|sandcliff|greyrock|brownrock|purplerock|bark|tree_tall|trunk/;   /* Kolima's hall is in a great tree; Xian's in the temple wall */
  function findGate(M) {
    const entry = M.def.entry || { x: Math.floor(M.w / 2), y: M.h - 2 }; let best = null;
    const open = (x, y) => { if (!M.inb(x, y)) return false; const t = M.get(x, y); if (!OPEN.has(t.name) || t.solid || t.water) return false; const o = M.getObj(x, y); if (o && !CLEAR.has(o.name)) return false; if (M.exits.some(e => x >= e.x - 1 && x < e.x + e.w + 1 && y >= e.y - 1 && y < e.y + e.h + 1)) return false; if ((M.triggers || []).some(t => x >= t.x - 1 && x < t.x + t.w + 1 && y >= t.y - 1 && y < t.y + t.h + 1)) return false; return true; };
    for (let y = 1; y < M.h - 3; y++) for (let x = 1; x < M.w - 1; x++) {
      const o = M.getObj(x, y); if (!o || !FACE.test(o.name) || o.kind === 'furniture') continue;
      if (!open(x, y + 1) || !open(x, y + 2)) continue;   /* the doorstep and the step before it; elbow room at the sides is preferred, not required (Kolima's trunks stand among their own canopies) */
      const d = Math.abs(x - entry.x) + Math.abs(y - entry.y) + ((open(x - 1, y + 1) && open(x + 1, y + 1)) ? 0 : 40); if (!best || d < best.d) best = { x, y, d };
    }
    return best;
  }
  const clearYard = (M, x, y, w, h) => { for (let j = 0; j <= h; j++) for (let i = 0; i < w; i++) { const o = M.getObj(x + i, y + j); if (o && CLEAR.has(o.name)) M.setObj(x + i, y + j, null); } };
  const ROOF = { gs1: 'roof_red', tla: 'roof_blue' };

  for (const town of towns) {
    const arenaId = 'arena_' + town; const W = 40, H = 28;
    // ---- the door in the town ----
    patch(town, (M) => {
      let w = 8, h = 5; let spot = findSpot(M, w, h); if (!spot) { w = 6; h = 4; spot = findSpot(M, w, h); }
      if (!spot) {   // a town on terraces with no yard to spare: the hall is cut into the rock, a stone door in the nearest cliff face
        const g = findGate(M); if (!g) { console.warn('arena: no room in ' + town); return; }
        M.setObj(g.x, g.y, 'door_stone'); M.walkable(g.x, g.y); M.exit(g.x, g.y, 1, 1, arenaId, 20, H - 2, DIR.UP, { door: true });
        if (Tiles.defs.shop_sign && !M.getObj(g.x - 1, g.y + 1) && OPEN.has(M.get(g.x - 1, g.y + 1).name)) M.setObj(g.x - 1, g.y + 1, 'shop_sign');
        ARENA.doors[town] = { x: g.x, y: g.y + 1 }; return;
      }
      const roof = Tiles.defs[ROOF[G.game === 2 ? 'tla' : 'gs1'] + '_peak'] ? ROOF[G.game === 2 ? 'tla' : 'gs1'] : 'roof_red';
      clearYard(M, spot.x, spot.y, w, h);
      const d = M.house(spot.x, spot.y, w, h, roof, { to: arenaId, tx: 20, ty: H - 2, doorX: Math.floor(w / 2), sign: Tiles.defs.shop_sign ? 'shop_sign' : undefined, wall: 'wall_stone' });
      ARENA.doors[town] = { x: d.doorX, y: d.doorY + 1 };
      M.walkable(d.doorX, d.doorY + 1);
    });
    // ---- the hall ----
    ARENA.ensureShops(town);
    defineMap(arenaId, {
      name: 'Battle Arena', w: W, h: H, base: 'void', indoor: true, music: 'colosso', bg: 'temple', entry: { x: 20, y: H - 2 }, retreat: null, noEscape: false,
      build(M) {
        M.room(0, 0, W, H, 'floor_tile', 'wall_in_stone');
        const back = ARENA.doors[town] || MAPS[town].entry || { x: 10, y: 10 };
        M.setObj(20, H - 1, null); M.set(20, H - 1, 'floor_tile'); M.walkable(20, H - 1); M.exit(20, H - 1, 1, 1, town, back.x, back.y, DIR.DOWN, { door: true });
        M.fill(19, 4, 2, H - 5, 'carpet_red');
        for (const [x, y] of [[2, 1], [W - 3, 1], [2, H - 3], [W - 3, H - 3], [12, 1], [27, 1]]) M.setObj(x, y, 'torch');
        for (const [x, y] of [[1, 8], [W - 2, 8], [1, 19], [W - 2, 19]]) M.setObj(x, y, 'pillar');
        // the pit: sand behind a rail, in the middle of the hall
        M.fill(15, 10, 10, 7, 'sand'); for (let x = 15; x < 25; x++) { M.setObj(x, 9, 'rail_h'); M.setObj(x, 17, 'rail_h'); } for (let y = 10; y < 17; y++) { M.setObj(14, y, 'rail_v'); M.setObj(25, y, 'rail_v'); }
        M.setObj(14, 9, 'rail_end_w'); M.setObj(25, 9, 'rail_end_e'); M.setObj(14, 17, 'rail_end_w'); M.setObj(25, 17, 'rail_end_e');
        M.setObj(19, 17, null); M.setObj(20, 17, null);   /* the way in, where the carpet meets the rail */
        M.setObj(17, 13, 'statue_gold'); M.setObj(22, 13, 'statue_gold');
        M.npc('pit_master', 20, 11, { type: 'guard', name: 'Pit Master', dir: DIR.DOWN, script: function* (E) { yield* ARENA.partyBattle(E); } });
        // the armoury (left) and the store (right)
        for (let x = 3; x < 9; x++) M.setObj(x, 4, 'counter'); M.setObj(2, 4, 'weapon_sign'); M.setObj(9, 4, 'armor_sign');
        M.npc('armourer', 5, 3, { type: 'merchant', name: 'Armourer', dir: DIR.DOWN, shop: 'arena_' + town + '_weapon' });
        for (let x = 31; x < 37; x++) M.setObj(x, 4, 'counter'); M.setObj(30, 4, 'shop_sign');
        M.npc('storekeeper', 33, 3, { type: 'merchant', name: 'Storekeeper', dir: DIR.DOWN, shop: 'arena_' + town + '_item' });
        M.setObj(3, 2, 'shelf'); M.setObj(8, 2, 'shelf'); M.setObj(31, 2, 'shelf'); M.setObj(36, 2, 'crate'); M.setObj(37, 2, 'barrel');
        // the quartermaster's counter, between the two, where the carpet starts: Battle Points only
        for (let x = 16; x < 24; x++) if (x < 19 || x > 20) M.setObj(x, 6, 'counter'); M.setObj(15, 6, 'sign');
        M.npc('quartermaster', 22, 5, { type: 'guard', name: 'Quartermaster', dir: DIR.DOWN, script: function* (E) { yield* ARENA.quartermaster(E); } });
        M.npc('arena_fan5', 24, 8, { type: 'villager_m', text: "Battle Points. Only the pit pays them, and only the quartermaster takes them. His shelf changes every quarter of an hour, and there is more on it the further you have been. A second Mysterious Card, once - imagine two Pierrots." });
        // the fountain (left)
        M.setObj(6, 12, 'fountain'); M.fill(4, 11, 5, 4, 'floor_stone'); M.set(6, 12, 'floor_stone');
        M.npc('fountain_keeper', 6, 15, { type: 'merchant', name: 'Fountain Keeper', dir: DIR.DOWN, script: function* (E) { yield* ARENA.fountain(E); } });
        // the ticket games (right): the wheel's booth and the dice tent
        M.setObj(32, 11, 'tent'); M.setObj(33, 11, 'tent');
        M.npc('dice_master', 33, 13, { type: 'merchant', name: 'Dice Master', dir: DIR.DOWN, script: STORY.luckyDice });
        M.setObj(36, 11, 'table'); M.npc('wheel_keeper', 36, 13, { type: 'villager_f', name: 'Wheel Keeper', dir: DIR.DOWN, script: STORY.luckyWheel });
        // the bookmaker (bottom left)
        for (let x = 3; x < 9; x++) M.setObj(x, 22, 'counter'); M.setObj(2, 22, 'sign');
        M.npc('bookmaker', 5, 21, { type: 'merchant', name: 'Bookmaker', dir: DIR.DOWN, script: function* (E) { yield* ARENA.betting(E); } });
        // the crowd
        M.npc('arena_fan1', 12, 20, { type: 'villager_m', move: 'wander', text: "I had a hundred coins on a Wild Wolf last week. It bit the bookmaker instead. I still lost." });
        M.npc('arena_fan2', 28, 20, { type: 'villager_f', move: 'wander', text: "The pit takes four. Only four. I have seen a party come in with eight and go out with the same four bruises." });
        M.npc('arena_fan3', 10, 25, { type: 'child_m', move: 'wander', text: "The Adepts they bring in for the pit aren't from anywhere. They just... turn up. Same level as whoever's best in your lot, every time." });
        M.npc('arena_fan4', 30, 25, { type: 'elder_m', move: 'wander', text: "The armoury stocks whatever the towns you've been through sell. Go further, and there's more on the shelf." });
      }
    });
  }
})();
