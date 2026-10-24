// Paste into the game's console (or run via javascript_exec) to check maps the way the runner walks them: exits are
// never crossed, solid objects block, and every exit, chest, Djinni and lever must touch the floor reachable from the
// map's entry and from every landing other maps send to it. mapCheck(['ssg_1', 'ssg_2']) -> one line per map.
function mapCheck(names) {
  const SOLID_KINDS = new Set(['pillar', 'boulder', 'crate', 'stump', 'statue', 'torch', 'djinni', 'chestobj', 'block', 'container', 'vines', 'crack', 'log', 'hop', 'rope', 'leaves', 'gate', 'lever']);
  const one = (name) => {
    if (!MAPS[name]) return name + ': MISSING';
    const M = buildMap(name); const W = M.w, H = M.h;
    const objAt = new Set((M.objects || []).filter(o => SOLID_KINDS.has(o.kind) && !o.gone).map(o => o.x + ',' + o.y));
    const isExit = (x, y) => M.exits.some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
    const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !M.isSolid(x, y) && !isExit(x, y) && !objAt.has(x + ',' + y);
    const bfs = (sx, sy) => { const seen = new Set([sx + ',' + sy]); const q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!seen.has(k) && walk(nx, ny)) { seen.add(k); q.push([nx, ny]); } } } return seen; };
    const bad = []; const lands = [[M.entry.x, M.entry.y]];
    for (const id of Object.keys(MAPS)) if (id !== name) { try { const T = buildMap(id); for (const e of T.exits) if (e.to === name) lands.push([e.tx, e.ty]); } catch (err) {} }
    for (const [lx, ly] of lands) {
      if (!walk(lx, ly)) { bad.push('landing bad ' + lx + ',' + ly); continue; }
      const seen = bfs(lx, ly);
      const adj = (x, y) => seen.has(x + ',' + y) || [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
      for (const e of M.exits) if (!adj(e.x + Math.floor(e.w / 2), e.y + Math.floor(e.h / 2))) bad.push('from ' + lx + ',' + ly + ' no exit ' + e.to + '@' + e.x + ',' + e.y);
      for (const c of M.chests || []) if (!adj(c.x, c.y)) bad.push('from ' + lx + ',' + ly + ' no chest ' + c.item + '@' + c.x + ',' + c.y);
      for (const o of M.objects || []) if ((o.kind === 'djinni' || o.kind === 'lever') && !adj(o.x, o.y)) bad.push('from ' + lx + ',' + ly + ' no ' + (o.name || o.id));
    }
    return name + ': ' + (bad.length ? bad.join('; ') : 'ok');
  };
  return names.map(one).join('\n');
}
