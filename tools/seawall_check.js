// Which places each of Weyard's seas reaches, with js/maps/world_tla_seawalls.js laid over the layout:
//   node tools/seawall_check.js
// The Eastern Sea is flooded from the Indra shore's berth, the Western from the Gondowan strait's south mouth, the
// Northern Reaches from beyond the ice; every marker is listed under the sea whose water touches its landing.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'js/maps/world_tla_layout.js'), 'utf8');
const m = src.match(/rows: \[([\s\S]*?)\n  \]/); const rows = m[1].split('\n').map(l => l.trim()).filter(l => l.startsWith("'")).map(l => l.slice(1, l.lastIndexOf("'")));
const places = [...src.matchAll(/name: (?:'([^']+)'|"([^"]+)"), map: '([^']+)', x: (\d+), y: (\d+)/g)].map(a => ({ name: a[1] || a[2], map: a[3], x: +a[4], y: +a[5] }));
const edits = eval(fs.readFileSync(path.join(ROOT, 'js/maps/world_tla_edits.js'), 'utf8').match(/WORLD_TLA_EDITS\s*=\s*(\[[\s\S]*?\]);/)[1]);
for (const [x, y, c] of edits) rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1);
const wallsSrc = fs.readFileSync(path.join(ROOT, 'js/maps/world_tla_seawalls.js'), 'utf8');
const WORLD_TLA_LAYOUT = { rows, places };
const fn = new Function('WORLD_TLA_LAYOUT', wallsSrc + '\nreturn { cells: worldTlaWallCells(WORLD_TLA_LAYOUT.rows), segs: WORLD_TLA_SEAWALLS };');
const { cells } = fn(WORLD_TLA_LAYOUT);
const grid = rows.map(r => r.split(''));
for (const [x, y, ch] of cells) grid[y][x] = ch;
const W = grid[0].length, H = grid.length;
const sail = (x, y, ice) => { const c = grid[y][x]; return '~im'.includes(c) || (ice && c === '%'); };   // rivers are not sailed
function flood(sx, sy, ice) { const seen = new Set([sx + ',' + sy]); const q = [[sx, sy]]; let h = 0; while (h < q.length) { const [x, y] = q[h++]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const k = nx + ',' + ny; if (seen.has(k) || !sail(nx, ny, ice)) continue; seen.add(k); q.push([nx, ny]); } } return seen; }
const E = flood(164, 194, false), Wn = flood(130, 204, false), N = flood(130, 204, true);
console.log('cells walled:', cells.length, ' Eastern:', E.size, ' Western:', Wn.size, ' Western+ice:', N.size);
const near = (p, R) => { for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (R.has((p.x + dx) + ',' + (p.y + dy))) return true; return false; };
const out = { east: [], west: [], north: [], inland: [] };
for (const p of places) { const e = near(p, E), w = near(p, Wn), n = near(p, N); if (e && w) out.east.push(p.name + ' (BOTH!)'); else if (e) out.east.push(p.name); else if (w) out.west.push(p.name); else if (n) out.north.push(p.name); else out.inland.push(p.name); }
for (const k of Object.keys(out)) console.log(k.toUpperCase() + ': ' + out[k].join(', '));
const probes = { 'Wheeze inlet (131,248)': [131, 248], 'tower east water (137,245)': [137, 245], "Pirate's Sabre (157,252)": [157, 252], "Captain's Axe (242,148)": [242, 148], 'Hagbone Mace (276,40)': [276, 40], "Goblin's Rod (69,40)": [69, 40], 'Soul Brand (30,175)': [30, 175], 'strait north mouth (130,198)': [130, 198], 'strait south mouth (130,204)': [130, 204], 'Indra Shore berth (164,194)': [164, 194], 'Northern Reaches landing (107,18)': [107, 18] };
for (const [name, [x, y]] of Object.entries(probes)) { const k = x + ',' + y; console.log('  ' + name.padEnd(36) + (E.has(k) ? 'EAST ' : '') + (Wn.has(k) ? 'WEST ' : '') + (!E.has(k) && !Wn.has(k) && N.has(k) ? 'NORTH ' : '') + (!E.has(k) && !N.has(k) ? '(not water: ' + grid[y][x] + ')' : '')); }
if (process.argv[2] === 'draw') { const x0 = +process.argv[3], y0 = +process.argv[4], w = +process.argv[5] || 80, h = +process.argv[6] || 40; for (let y = y0; y < y0 + h; y++) console.log(String(y).padStart(3), grid[y].slice(x0, x0 + w).join('')); }
// node tools/seawall_check.js leak x y : the sailed path from the Indra berth to (x,y) through cells the previous layout
// (tools/tm/world_tla_layout.prev.js, if kept) did not sail - where a regenerated coast opened a way round a wall
if (process.argv[2] === 'leak') {
  const tx = +process.argv[3], ty = +process.argv[4]; const start = [164, 194];
  const prev = new Map([[start.join(','), null]]); const q = [start]; let h = 0, goal = null;
  while (h < q.length) { const [x, y] = q[h++]; if (x === tx && y === ty) { goal = x + ',' + y; break; } for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (prev.has(k) || nx < 0 || ny < 0 || nx >= W || ny >= H || !sail(nx, ny, false)) continue; prev.set(k, x + ',' + y); q.push([nx, ny]); } }
  if (!goal) { console.log('not reached'); process.exit(0); }
  const cells = []; let k = goal; while (k) { cells.push(k); k = prev.get(k); } cells.reverse();
  let old = null; try { const ps = fs.readFileSync(path.join(__dirname, 'tm', 'world_tla_layout.prev.js'), 'utf8'); const pm = ps.match(/rows: \[([\s\S]*?)\n  \]/); old = pm[1].split('\n').map(l => l.trim()).filter(l => l.startsWith("'")).map(l => l.slice(1, l.lastIndexOf("'"))); } catch (e) { }
  console.log(cells.length + ' cells sailed');
  if (old) console.log('newly sailable on the way: ' + cells.filter(c => { const [x, y] = c.split(',').map(Number); return !'~im'.includes(old[y][x]); }).map(c => { const [x, y] = c.split(',').map(Number); return c + '(' + old[y][x] + '>' + grid[y][x] + ')'; }).join(' '));
  else console.log(cells.filter((c, i) => i % 20 === 0).join(' > '));
}
// node tools/seawall_check.js land <map> [...]: the sea each marker's land region can be reached from (its coast's beaches)
if (process.argv[2] === 'land') {
  const walkC = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !'~i#^*%xrlAF'.includes(grid[y][x]);
  for (const name of process.argv.slice(3)) {
    const p = places.find(q => q.map === name || q.name === name); if (!p) { console.log('no', name); continue; }
    const seen = new Set([p.x + ',' + p.y]); const q = [[p.x, p.y]]; let h = 0; let east = 0, west = 0, north = 0;
    while (h < q.length) { const [x, y] = q[h++]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !walkC(nx, ny)) continue; seen.add(k); q.push([nx, ny]); if (grid[ny][nx] === 'm') { for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (nx + ex) + ',' + (ny + ey); if (E.has(kk)) east++; else if (Wn.has(kk)) west++; else if (N.has(kk)) north++; } } } }
    console.log(p.name.padEnd(24) + ' region ' + String(seen.size).padStart(5) + '  coast: east ' + east + ' west ' + west + ' north-only ' + north);
  }
}
// node tools/seawall_check.js beaches <map> : where that marker's land region meets each sea
if (process.argv[2] === 'beaches') {
  const walkC = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !'~i#^*%xrlAF'.includes(grid[y][x]);
  const p = places.find(q => q.map === process.argv[3] || q.name === process.argv[3]);
  const seen = new Set([p.x + ',' + p.y]); const q = [[p.x, p.y]]; let h = 0; const out = { east: [], west: [], north: [] };
  while (h < q.length) { const [x, y] = q[h++]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !walkC(nx, ny)) continue; seen.add(k); q.push([nx, ny]); if (grid[ny][nx] === 'm') { for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (nx + ex) + ',' + (ny + ey); if (E.has(kk)) out.east.push(k); else if (Wn.has(kk)) out.west.push(k); else if (N.has(kk)) out.north.push(k); } } } }
  for (const s of ['east', 'west', 'north']) console.log(s + ': ' + [...new Set(out[s])].slice(0, 30).join(' '));
}
