// Where the party can walk on a world map without going through any place: the land is flooded on foot from a
// marker, every place marker counts as a wall (walking onto one enters it), and every marker touched by the flood is
// listed. A pass-through area (a bridge, a desert, a cave with a door on each side) gates the road only if the far
// side's markers are NOT in the flood - if they are, the world lets the party walk round it.
//   node tools/land_check.js gs1 vale_south            the markers reachable on foot from Vale, without entering anything
//   node tools/land_check.js tla daila
//   node tools/land_check.js gs1 vale_south path kolima   the walking route the flood found to Kolima (to see where the gap is)
//   node tools/land_check.js gs1 draw 90 30 40 25        a window of the layout with the edits applied
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const world = process.argv[2] || 'gs1';
const src = fs.readFileSync(path.join(ROOT, 'js/maps/world_' + world + '_layout.js'), 'utf8');
const m = src.match(/rows: \[([\s\S]*?)\n  \]/); const rows = m[1].split('\n').map(l => l.trim()).filter(l => l.startsWith("'")).map(l => l.slice(1, l.lastIndexOf("'")));
const places = [...src.matchAll(/name: (?:'([^']+)'|"([^"]+)"), map: '([^']+)', x: (\d+), y: (\d+)/g)].map(a => ({ name: a[1] || a[2], map: a[3], x: +a[4], y: +a[5] }));
const edSrc = fs.readFileSync(path.join(ROOT, 'js/maps/world_' + world + '_edits.js'), 'utf8');
const edits = eval(edSrc.match(/WORLD_[A-Z0-9]+_EDITS\s*=\s*(\[[\s\S]*?\]);/)[1]);
for (const [x, y, c] of edits) rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1);
const grid = rows.map(r => r.split(''));
if (world === 'tla') {
  const wallsSrc = fs.readFileSync(path.join(ROOT, 'js/maps/world_tla_seawalls.js'), 'utf8');
  const fn = new Function('WORLD_TLA_LAYOUT', wallsSrc + '\nreturn { cells: worldTlaWallCells(WORLD_TLA_LAYOUT.rows), segs: WORLD_TLA_SEAWALLS };');
  const { cells } = fn({ rows, places }); for (const [x, y, ch] of cells) grid[y][x] = ch;
  // the seawalls file also moves markers about: apply the same IIFE to our places list
  try { const fn2 = new Function('WORLD_TLA_LAYOUT', wallsSrc + '\nreturn WORLD_TLA_LAYOUT.places;'); const moved = fn2({ rows, places: places.slice() }); places.length = 0; for (const p of moved) places.push(p); } catch (e) { }
}
const W = grid[0].length, H = grid.length;
const SOLID = new Set(['#', '~', 'i', 'r', 'l', 'x', '^', '*', '%', 'A', 'F']);
const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !SOLID.has(grid[y][x]);
const markerAt = new Map(); for (const p of places) markerAt.set(p.x + ',' + p.y, p);
function flood(sx, sy) {
  const prev = new Map(); prev.set(sx + ',' + sy, null); const q = [[sx, sy]]; let h = 0;
  while (h < q.length) { const [x, y] = q[h++]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (prev.has(k) || !walk(nx, ny)) continue; if (markerAt.has(k)) { prev.set(k, [x, y]); continue; } /* a place is touched, never crossed */ prev.set(k, [x, y]); q.push([nx, ny]); } }
  return prev;
}
const cmd = process.argv[3];
if (cmd === 'draw') { const x0 = +process.argv[4], y0 = +process.argv[5], w = +process.argv[6] || 60, h = +process.argv[7] || 30; for (let y = y0; y < y0 + h && y < H; y++) { let s = ''; for (let x = x0; x < x0 + w && x < W; x++) s += markerAt.has(x + ',' + y) ? '@' : grid[y][x]; console.log(String(y).padStart(3) + ' ' + s); } process.exit(0); }
const from = places.find(p => p.map === cmd || p.name === cmd); if (!from) { console.log('markers:', places.map(p => p.map).join(' ')); process.exit(1); }
// start beside the marker, on any walkable neighbour
let start = null; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { if (walk(from.x + dx, from.y + dy) && !markerAt.has((from.x + dx) + ',' + (from.y + dy))) { start = [from.x + dx, from.y + dy]; break; } }
if (!start) { console.log('no walkable cell beside', from.name); process.exit(1); }
const prev = flood(start[0], start[1]);
const reached = places.filter(p => prev.has(p.x + ',' + p.y) && p !== from);
if (process.argv[4] === 'path') {
  const to = places.find(p => p.map === process.argv[5] || p.name === process.argv[5]); if (!to || !prev.has(to.x + ',' + to.y)) { console.log('not reached'); process.exit(0); }
  const cells = []; let k = to.x + ',' + to.y; while (k) { const [x, y] = k.split(',').map(Number); cells.push([x, y]); const pr = prev.get(k); k = pr ? pr[0] + ',' + pr[1] : null; }
  cells.reverse(); console.log(cells.length + ' steps'); const every = Math.max(1, Math.floor(cells.length / 40)); console.log(cells.filter((c, i) => i % every === 0 || i === cells.length - 1).map(c => c.join(',')).join(' > '));
  process.exit(0);
}
console.log('on foot from ' + from.name + ' (' + from.map + '), touching ' + reached.length + ' of ' + (places.length - 1) + ' markers:');
for (const p of reached) console.log('  ' + p.name.padEnd(26) + p.map.padEnd(22) + p.x + ',' + p.y);
const not = places.filter(p => !prev.has(p.x + ',' + p.y) && p !== from);
console.log('NOT reached: ' + not.map(p => p.map).join(', '));
