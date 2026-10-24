// Warp audit: the world's doorways, checked for consistency (user: "if the player came through one side of an
// entrance then exiting from that side should keep them on that side, not put them on the other side, skipping the
// whole area"). For every place marker on a world map and every side of it the party can walk up from:
//   1. entering from that side must put the party at THAT side's end of the place: from the entry cell, the nearest
//      way back out onto the world (walking, touching nothing, honouring exit conditions) must land on the same side
//      (the same land region) the party came from;
//   2. every way out onto the world from the place's rooms must land on a walkable cell beside a marker of the
//      place (a landing on rock or in the wrong region strands or teleports the party).
// In a test tab, after testboot: (0, eval)(TK.text('tools/warp_audit.js')); warpAudit('world_gs1'); warpAudit('world_tla')
window.warpAudit = function (worldId) {
  const F = G.field; const out = { world: worldId, problems: [], checked: 0 };
  F.loadMap(worldId, 1, 1, DIR.DOWN); F.loadMap(worldId, 1, 1, DIR.DOWN);   // the world under the field, so the runner's region flood sees it
  const M = G.map; R._regions = null; R._passEdges = null; const R0 = R.worldRegions();
  const landing = (mapId, dir) => worldId === 'world_gs1' ? (typeof worldGs1Landing === 'function' ? worldGs1Landing(mapId, dir) : null) : (typeof worldTlaLanding === 'function' ? worldTlaLanding(mapId, dir, false) : null);
  const SIDE = { [DIR.LEFT]: 'e', [DIR.RIGHT]: 'w', [DIR.UP]: 's', [DIR.DOWN]: 'n' };   // moving this way onto the marker = coming from that side
  const SIDE_CELL = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] };
  // a room, built once: its walkable cells and its doorways
  const rooms = {};
  const room = (id) => { if (rooms[id]) return rooms[id]; let B; try { B = buildMap(id); } catch (e) { return null; } const solid = (x, y) => !B.inb(x, y) || B.isSolid(x, y) || B.objects.some(o => !o.gone && o.x === x && o.y === y && (o.kind !== 'scoop' && o.kind !== 'spot' && o.kind !== 'leaves' && o.kind !== 'hoverpad' ? true : false)); return (rooms[id] = { B, solid }); };
  // from a cell in a room, the nearest world exit by walking through the rooms (doors between rooms followed), honouring conditions
  const nearestWorldExit = (mapId, sx, sy) => {
    const seenRooms = new Set(); const q = [[mapId, sx, sy, 0]]; const best = { d: Infinity, e: null, room: null }; let guard = 0;
    while (q.length && guard++ < 200) {
      const [id, x0, y0, d0] = q.shift(); if (seenRooms.has(id + ':' + x0 + ',' + y0)) continue; seenRooms.add(id + ':' + x0 + ',' + y0);
      const rm = room(id); if (!rm) continue; const { B, solid } = rm;
      const dist = new Map([[x0 + ',' + y0, 0]]); const bfs = [[x0, y0]]; let h = 0;
      const exitAt = (x, y) => B.exits.find(e => x >= e.x && x < e.x + (e.w || 1) && y >= e.y && y < e.y + (e.h || 1) && (!e.cond || e.cond()));
      while (h < bfs.length) {
        const [x, y] = bfs[h++]; const d = dist.get(x + ',' + y);
        const e = exitAt(x, y);
        if (e && !(x === x0 && y === y0 && d === 0 && e.to === id)) {
          if (MAPS[e.to] && MAPS[e.to].world) { if (e.to !== worldId && !(worldId === 'world_tla' && e.to === 'world_gs1')) continue; if (d0 + d < best.d) { best.d = d0 + d; best.e = e; best.room = id; } continue; }
          if (MAPS[e.to] && !seenRooms.has(e.to + ':' + e.tx + ',' + e.ty)) q.push([e.to, e.tx, e.ty, d0 + d + 1]);
          continue;
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (dist.has(k)) continue; if (!B.inb(nx, ny)) continue; const ex = exitAt(nx, ny); if (!ex && solid(nx, ny)) continue; dist.set(k, d + 1); bfs.push([nx, ny]); }
      }
    }
    return best.e ? best : null;
  };
  for (const m of R0.markers) {
    if (m.cond && !m.cond()) continue;
    if (m.ship) continue;   // a berth: the ship puts in, nobody walks up to it
    const target = m.map; if (!MAPS[target]) { out.problems.push({ marker: m.id || m.map, at: [m.x, m.y], kind: 'no-map', detail: target }); continue; }
    for (const side of ['n', 's', 'e', 'w']) {
      const [dx, dy] = SIDE_CELL[side]; const cx = m.x + dx, cy = m.y + dy; const reg = R0.regionAt(cx, cy); if (reg < 0) continue;   // not approachable from this side
      out.checked++;
      const en = (m.from && m.from[side]) || { map: target, tx: m.tx, ty: m.ty, dir: m.dir };
      const enMap = en.map || target; const rm = room(enMap); if (!rm) { out.problems.push({ marker: m.id || m.map, side, kind: 'no-room', detail: enMap }); continue; }
      if (rm.solid(en.tx, en.ty) && !rm.B.exits.some(e => en.tx >= e.x && en.tx < e.x + (e.w || 1) && en.ty >= e.y && en.ty < e.y + (e.h || 1))) out.problems.push({ marker: m.id || m.map, side, kind: 'entry-on-solid', detail: enMap + '@' + en.tx + ',' + en.ty });
      const near = nearestWorldExit(enMap, en.tx, en.ty);
      if (!near) { const anyCond = rm.B.exits.some(e => e.cond && MAPS[e.to] && MAPS[e.to].world); out.problems.push({ marker: m.id || m.map, side, kind: anyCond ? 'only-conditional-way-back' : 'no-way-back', detail: enMap + '@' + en.tx + ',' + en.ty }); continue; }
      const L = landing(near.room, near.e.dir); if (!L) { out.problems.push({ marker: m.id || m.map, side, kind: 'no-landing', detail: near.room }); continue; }
      const lreg = R0.regionAt(L.x, L.y);
      if (lreg !== reg) out.problems.push({ marker: m.id || m.map, side, kind: 'turns-out-elsewhere', detail: 'in from ' + side + ' at ' + enMap + '@' + en.tx + ',' + en.ty + ', nearest way out ' + near.room + '@' + near.e.x + ',' + near.e.y + ' (' + near.d + ' steps) lands at ' + L.x + ',' + L.y + ' region ' + lreg + ' not ' + reg });
    }
    // every way out of the place's rooms: lands beside one of its markers, on walkable ground
    for (const rid of R.mapCluster(target)) {
      const rm = room(rid); if (!rm) continue;
      for (const e of rm.B.exits) {
        if (!MAPS[e.to] || !MAPS[e.to].world || e.to !== worldId) continue;
        const L = landing(rid, e.dir); if (!L) { out.problems.push({ marker: m.id || m.map, kind: 'exit-no-landing', detail: rid + '@' + e.x + ',' + e.y }); continue; }
        const near = R0.markers.filter(k => Math.abs(k.x - L.x) + Math.abs(k.y - L.y) <= 1);
        const seaL = worldId === 'world_tla' && typeof worldTlaLanding === 'function' ? worldTlaLanding(rid, e.dir, true) : null; if (seaL && near.length && M.get(seaL.x, seaL.y).water) continue;   // a way out onto the water: the ship's
        if (!near.length || R.blockedNoNpc(L.x, L.y)) out.problems.push({ marker: m.id || m.map, kind: 'exit-lands-badly', detail: rid + '@' + e.x + ',' + e.y + ' dir ' + e.dir + ' -> ' + L.x + ',' + L.y + (R.blockedNoNpc(L.x, L.y) ? ' (blocked)' : ' (no marker beside)') });
      }
    }
  }
  const seen = new Set(); out.problems = out.problems.filter(p => { const k = JSON.stringify(p); if (seen.has(k)) return false; seen.add(k); return true; });
  return out;
};
'warp audit loaded';
