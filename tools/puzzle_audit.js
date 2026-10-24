// Puzzle audit: for every map with puzzle objects, can the party walk from where it comes in to every other way out
// without touching a thing? Such a map's puzzle is decoration - the runner (and a player) can skip it. Run in a game
// tab after tools/testboot.js: puzzleAudit() returns the list and posts runner/puzzle_audit.json. Maps are built
// with no flags set (a fresh game), so anything a flag opens is closed.
window.puzzleAudit = function (only) {
  const PUZZLE = ['pillar', 'log', 'vines', 'crack', 'rope', 'sprout', 'puddle', 'lever', 'boulder', 'stump', 'crate', 'updraft', 'statue_move', 'shakeable', 'scoop', 'leaves', 'hop', 'condtile', 'waterstone', 'steam', 'gate', 'carriable', 'catchable', 'rock_water', 'pool', 'windstone', 'twister'];
  const F = G.field; const out = []; const savedFlags = G.flags; G.flags = {};
  const ids = Object.keys(MAPS).filter(id => !MAPS[id].world && (!only || only.test(id)));
  for (const id of ids) {
    let M;
    try { F.loadMap(id, MAPS[id].entry ? MAPS[id].entry.x : 1, MAPS[id].entry ? MAPS[id].entry.y : 1, DIR.UP); M = G.map; } catch (e) { out.push({ map: id, error: e.message }); continue; }
    Engine.fade = 0; Engine.fadeDir = 0; F.event = null; F.eventQueue = []; F.textbox.active = false;
    const puzzles = M.objects.filter(o => PUZZLE.includes(o.kind) && !o.gone);
    if (puzzles.length < 1) continue;
    // every pair of ways out: landing beside one, can the other be reached without touching anything?
    const exits = M.exits.filter(e => !e.cond || e.cond());
    const beside = (e) => { const ex = e.x + Math.floor(e.w / 2), ey = e.y + Math.floor(e.h / 2); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const x = ex + dx, y = ey + dy; if (M.inb(x, y) && !F.blocked(x, y) && !M.exits.some(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h)) return [x, y]; } return null; };
    const reach = []; let total = 0;
    const landings = exits.map(e => [e, beside(e)]).filter(([e, b]) => b);
    for (const [ea, [sx, sy]] of landings) {
      F.player.tx = sx; F.player.ty = sy; F.player.px = sx * TILE; F.player.py = sy * TILE;
      for (const eb of exits) { if (eb === ea || (eb.to === ea.to && eb.tx === ea.tx && eb.ty === ea.ty)) continue; total++; const ex = eb.x + Math.floor(eb.w / 2), ey = eb.y + Math.floor(eb.h / 2); let ok = false; try { ok = !!R.path(ex, ey); } catch (err) { ok = false; } if (ok) reach.push(ea.to + ' -> ' + eb.to + '@' + ex + ',' + ey); }
    }
    const entryLanding = MAPS[id].entry ? [MAPS[id].entry.x, MAPS[id].entry.y] : (landings[0] ? landings[0][1] : null);
    // the chests, too: reachable from the entry without doing anything?
    const chests = [];
    if (entryLanding) { const [sx, sy] = entryLanding; F.player.tx = sx; F.player.ty = sy; F.player.px = sx * TILE; F.player.py = sy * TILE; for (const c of (M.chests || [])) { let ok = false; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const x = c.x + dx, y = c.y + dy; if (M.inb(x, y) && !F.blocked(x, y) && R.path(x, y)) { ok = true; break; } } chests.push((ok ? 'FREE ' : 'gated ') + c.item + '@' + c.x + ',' + c.y); }
      for (const dj of M.objects.filter(o => o.kind === 'djinni' && !o.gone)) { let ok = false; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const x = dj.x + dx, y = dj.y + dy; if (M.inb(x, y) && !F.blocked(x, y) && R.path(x, y)) { ok = true; break; } } chests.push((ok ? 'FREE ' : 'gated ') + 'Djinni ' + dj.name + '@' + dj.x + ',' + dj.y); } }
    out.push({ map: id, puzzles: puzzles.map(p => p.kind + (p.id ? ':' + p.id : '')).slice(0, 12).join(' '), exits: exits.length, freeRoutes: reach.length, ofRoutes: total, allFree: total > 0 && reach.length === total, routes: reach.slice(0, 8), chests });
  }
  G.flags = savedFlags;
  const flagged = out.filter(o => o.allFree);
  const res = { checked: out.length, allFree: flagged.map(o => o.map), detail: out };
  fetch('/log?name=puzzle_audit.json', { method: 'POST', body: JSON.stringify(res, null, 1) });
  return res;
};
'puzzle_audit loaded';
