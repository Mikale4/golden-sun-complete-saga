// ---------- Lamakan Desert ----------
// The crossing between Lama and Kalay, after the rip's three stretches: the long defile in from the east, walled by
// wind-cut ridges of sandstone and pierced by a tunnel; the great open basin beyond it, where the oases lie among
// the ridges and the mirages; and the broken country at the far end, where the Manticore waits by the way out.
// Each stretch is drawn from a description - ridges, oases, cacti, bones - on sand, the way Mogall's clearings are.
'use strict';

const LAMAKAN_ENC = [['Ant Lion'], ['Salamander', 'Salamander'], ['Grub', 'Grub'], ['Orc'], ['Fighter Bee', 'Fighter Bee'], ['Mad Mole']];
const LK_RETREAT = { map: 'world_gs1', x: 93, y: 60, dir: DIR.DOWN };

// a ring of stones on the sand, as in the original desert: what lies in it shows only under Reveal. An oasis - the
// pool the party wades into to cool the heat gauge and recover; an Ant Lion waiting under the sand, which fights
// whoever treads on it, seen or not; or nothing at all. The ring is open on its south side
function lkOasis(M, x, y, id, kind) {
  kind = kind === true ? 'antlion' : kind === false ? 'oasis' : (kind || 'empty');
  for (let i = -2; i <= 2; i++) { M.setObj(x + i, y - 1, 'dune_rock'); M.setObj(x + i, y + 2, 'dune_rock'); }
  for (let j = 0; j <= 1; j++) { M.setObj(x - 2, y + j, 'dune_rock'); M.setObj(x + 2, y + j, 'dune_rock'); }
  for (let j = 0; j <= 1; j++) for (let i = -1; i <= 1; i++) M.set(x + i, y + j, 'sand');
  // the ring opens on the first side with open sand beyond it: south, west, east, then north
  const open = (gx, gy, ox, oy) => { if (!M.inb(ox, oy) || M.getObj(ox, oy) || M.get(ox, oy).solid) return false; M.setObj(gx, gy, null); return true; };
  open(x, y + 2, x, y + 3) || open(x - 2, y, x - 3, y) || open(x + 2, y, x + 3, y) || open(x, y - 1, x, y - 2) || open(x, y + 2, x, y + 3);
  if (kind === 'oasis') {
    for (let j = 0; j <= 1; j++) for (let i = -1; i <= 1; i++) M.hidden.push({ x: x + i, y: y + j, tile: 'shallow' });
    M.setObj(x - 2, y - 1, 'palm');   // a palm at the ring's corner, in a rock's place, so it never narrows a way
    M.object('oasis', x, y + 1, { id, hiddenUntilReveal: true, onStep: function* (E) { if (G.field.heat <= 0 && G.party.members.every(m => !m.alive || m.hp >= m.maxHp())) return; G.field.heat = 0; yield E.say('An oasis! The party wades in and drinks deeply - the heat lifts, and they recover.'); G.party.fullRestore(); Audio.sfx('heal'); } });
  } else if (kind === 'antlion') {
    M.object('antlion', x, y, { id, hiddenUntilReveal: true, tile: 'antlion_pit', onStep: function* (E) { if (G.flag(id + '_done')) return; const r = yield* E.ambush(['Ant Lion'], { canFlee: true }, { say: 'The sand shifts underfoot... An Ant Lion!' }); if (r === 'win') G.set(id + '_done'); } });
  }
}
function lkStretch(id, spec) {
  defineMap(id, {
    name: 'Lamakan Desert', w: spec.w, h: spec.h, base: 'sand', music: 'desert', bg: 'lamakan_desert', entry: spec.entry, enc: LAMAKAN_ENC, retreat: LK_RETREAT, heat: true,
    build(M) {
      const r = seededRandom(hashStr(id));
      const rows = []; for (let j = 0; j < M.h; j++) rows.push(new Array(M.w).fill('.'));
      const ridge = (x, y, w, h) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (j >= 0 && i >= 0 && j < M.h && i < M.w) rows[j][i] = '#'; };
      // the edges of the picture are rock, except where the ways in and out cut through
      ridge(0, 0, M.w, 2); ridge(0, M.h - 2, M.w, 2); ridge(0, 0, 2, M.h); ridge(M.w - 2, 0, 2, M.h);
      for (const [x, y, w, h] of spec.ridges || []) ridge(x, y, w, h);
      for (const g of spec.gaps || []) { const [x, y, w, h] = g; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) rows[j][i] = '.'; }
      M.paint(0, 0, rows.map(a => a.join('')), { '.': 'sand' }, { set: 'sandcliff', faces: 2 });
      for (let j = 2; j < M.h - 2; j++) for (let i = 2; i < M.w - 2; i++) if (rows[j][i] === '.' && r() < 0.12) M.set(i, j, 'sandsoft');
      // what the stretch is about goes down first: chests, stones, Djinn, the oases, the ways out
      if (spec.build) spec.build(M);
      for (const [x, y, mirage] of spec.oases || []) lkOasis(M, x, y, id + '_oasis_' + x + '_' + y, mirage);
      for (const e of spec.exits || []) {
        if (e.door) { M.setObj(e.x, e.y, 'door_cave'); M.walkable(e.x, e.y); }   // a cave mouth in a ridge's face
        else for (let j = e.y; j < e.y + (e.h || 1); j++) for (let i = e.x; i < e.x + (e.w || 1); i++) { M.set(i, j, 'sand'); M.setObj(i, j, null); M.walkable(i, j); }
        M.exit(e.x, e.y, e.w || 1, e.h || 1, e.to, e.tx, e.ty, e.dir, e.door ? { door: true } : undefined);
      }
      // then the desert's dressing, scattered clear of everything that matters and of the tiles beside it
      const keep = new Set(); const mark = (x, y) => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) keep.add((x + dx) + ',' + (y + dy)); };
      for (let j = 0; j < M.h; j++) for (let i = 0; i < M.w; i++) if (M.getObj(i, j) || M.get(i, j).water) mark(i, j);
      for (const o of M.objects) mark(o.x, o.y);
      for (const e of M.exits) for (let j = e.y; j < e.y + e.h; j++) for (let i = e.x; i < e.x + e.w; i++) mark(i, j);
      for (const t of M.triggers) for (let j = t.y; j < t.y + t.h; j++) for (let i = t.x; i < t.x + t.w; i++) mark(i, j);
      mark(M.entry.x, M.entry.y);
      const props = new Set(); let placed = 0, tries = 0;
      while (placed < (spec.props || 20) && tries++ < 2000) { const x = 2 + Math.floor(r() * (M.w - 4)), y = 2 + Math.floor(r() * (M.h - 4)); if (rows[y][x] !== '.' || keep.has(x + ',' + y) || M.getObj(x, y) || M.get(x, y).water) continue; const k = r(); M.setObj(x, y, k < 0.45 ? 'cactus' : k < 0.65 ? 'cactus_small' : k < 0.8 ? 'bones_desert' : k < 0.9 ? 'dune_rock' : 'rock_sand'); props.add(x + ',' + y); placed++; }
      // and no cactus or bone ever walls off a way: any prop standing between the reached and the unreached comes out
      const solidAt = (x, y) => { const i = M.idx(x, y); if (M.solidOverride[i] === 0) return false; if (M.solidOverride[i] === 1) return true; const ot = M.obj[i] ? Tiles.byId[M.obj[i]] : null; return !!(Tiles.byId[M.ground[i]].solid || (ot && ot.solid && !ot.door)); };   // the map is not finalized yet
      const blocked = (x, y) => !M.inb(x, y) || solidAt(x, y) || M.objects.some(o => o.kind === 'djinni' && o.x === x && o.y === y);
      const goal = (x, y) => M.getObj(x, y) || M.exits.some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);   // chests, stones, doors: reached, not passed
      for (let pass = 0; pass < 40; pass++) {
        const seen = new Set([M.entry.x + ',' + M.entry.y]); const q = [[M.entry.x, M.entry.y]];
        while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k)) continue; if (goal(nx, ny) && !props.has(k)) { seen.add(k); continue; } if (blocked(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } }
        let cut = null;
        for (const k of props) { const [x, y] = k.split(',').map(Number); let near = false, beyond = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nk = (x + dx) + ',' + (y + dy); if (seen.has(nk)) near = true; else if (M.inb(x + dx, y + dy) && !props.has(nk) && (goal(x + dx, y + dy) || !blocked(x + dx, y + dy))) beyond = true; } if (near && beyond) { cut = k; break; } }
        if (!cut) break;
        const [cx, cy] = cut.split(',').map(Number); M.setObj(cx, cy, null); props.delete(cut);
      }
    },
  });
}
// the tunnels through the ridges: short torch-lit passages
function lkTunnel(id, rows, a, b) {
  defineMap(id, {
    name: 'Lamakan Desert', w: rows[0].length, h: rows.length, base: 'cavewalltop', music: 'dungeon', bg: 'cave', indoor: true, enc: LAMAKAN_ENC, retreat: LK_RETREAT, entry: { x: a.x, y: a.y },
    build(M) {
      M.paint(0, 0, rows, { '.': 'cave_sand', 'T': { ground: 'cave_sand', obj: 'torch' } }, { cliff: 'k', set: 'cavern', top: 'cavewalltop', face: 'cavewall', mid: 'cavewalltop' });
      rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'T') M.light(x, y, 4); });
      for (const d of [a, b]) { M.setObj(d.x, d.y, 'door_cave'); M.walkable(d.x, d.y); M.exit(d.x, d.y, 1, 1, d.to, d.tx, d.ty, d.dir, { door: true }); }
    },
  });
}

// ---- the defile: in from the east along the foot of the ridges, west to the tunnel ----
lkStretch('lamakan', {
  w: 46, h: 18, entry: { x: 43, y: 8 },
  ridges: [[2, 2, 44, 3], [8, 5, 3, 6], [14, 5, 3, 6], [20, 5, 5, 4], [28, 2, 3, 9], [34, 5, 4, 5], [2, 13, 12, 3], [18, 13, 10, 3], [32, 12, 12, 4]],
  gaps: [[44, 7, 2, 3]],
  oases: [[5, 8, false], [26, 8, true]], props: 26,
  exits: [{ x: 45, y: 7, w: 1, h: 3, to: 'world_gs1', tx: 93, ty: 60, dir: DIR.RIGHT }, { x: 21, y: 8, to: 'lamakan_tunnel_1', tx: 2, ty: 9, dir: DIR.UP, door: true }],
  build(M) {
    M.trigger(41, 7, 2, 3, STORY.lamakanEnter, { once: 'lamakan_entered' });
    M.chest(5, 6, 'Mint', 1); M.chest(30, 11, 'Vial', 2);
    M.setObj(38, 6, 'psystone');
  },
});
lkTunnel('lamakan_tunnel_1', [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkk..........kkkkkkkkk',
  'kkkkk.T......T.kkkkkkkkk',
  'kkkkk..kkkkkk..kkkkkkkkk',
  'kkkkk..kkkkkk..kkkkkkkkk',
  'kkkkk..kkkkkk..kkkkkkkkk',
  'kkkkk..kkkkkk..kkkkkkkkk',
  'kk.....kkkkkk......Tkkkk',
  'kk.....kkkkkk........kkk',
  'kkkkkkkkkkkkkk.......kkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
], { x: 2, y: 9, to: 'lamakan', tx: 21, ty: 9, dir: DIR.DOWN }, { x: 20, y: 10, to: 'lamakan_2', tx: 4, ty: 28, dir: DIR.UP });

// ---- the basin: the widest stretch, ridges standing in it like islands, the oases between them ----
lkStretch('lamakan_2', {
  w: 36, h: 32, entry: { x: 4, y: 28 },
  ridges: [[2, 2, 10, 4], [16, 2, 6, 5], [26, 2, 8, 6], [6, 10, 5, 4], [14, 9, 7, 3], [24, 12, 6, 4], [2, 18, 6, 5], [12, 20, 8, 3], [26, 22, 8, 4], [2, 26, 5, 2], [10, 27, 10, 3], [30, 28, 4, 2]],
  oases: [[14, 6, false], [30, 17, true], [8, 16, true], [22, 27, false]], props: 40,
  exits: [{ x: 4, y: 27, to: 'lamakan_tunnel_1', tx: 20, ty: 9, dir: DIR.DOWN, door: true }, { x: 32, y: 7, to: 'lamakan_tunnel_2', tx: 2, ty: 3, dir: DIR.UP, door: true }],
  build(M) {
    M.chest(4, 7, 'Lucky Pepper', 1); M.chest(13, 17, 'Coins', 1, { coins: 777 }); M.chest(27, 29, 'Potion', 1);
    M.setObj(31, 10, 'psystone');
    M.djinni('Smog', 20, 15, { fight: true });
  },
});
lkTunnel('lamakan_tunnel_2', [
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
  'kk......kkkkkkkkkkkkkkkk',
  'kk..T...kkkkkkkkkkkkkkkk',
  'kkkkk...kkkkkkkkkkkkkkkk',
  'kkkkk...kkkkkkkkkkkkkkkk',
  'kkkkk......T....kkkkkkkk',
  'kkkkk...........kkkkkkkk',
  'kkkkkkkkkkkk........kkkk',
  'kkkkkkkkkkkk...T....kkkk',
  'kkkkkkkkkkkk........kkkk',
  'kkkkkkkkkkkkkkkkkkkkkkkk',
], { x: 2, y: 3, to: 'lamakan_2', tx: 32, ty: 8, dir: DIR.DOWN }, { x: 19, y: 10, to: 'lamakan_3', tx: 3, ty: 2, dir: DIR.UP });

// ---- the broken country: ridges and dead ends, Vine on the last ledge, the Manticore at the way out ----
lkStretch('lamakan_3', {
  w: 36, h: 32, entry: { x: 3, y: 2 },
  ridges: [[6, 2, 10, 4], [20, 2, 14, 3], [4, 8, 4, 6], [12, 8, 6, 3], [22, 7, 5, 5], [30, 8, 4, 8], [2, 16, 8, 3], [14, 14, 6, 5], [24, 16, 6, 3], [8, 22, 10, 3], [22, 22, 6, 4], [2, 27, 24, 3]],
  gaps: [[32, 16, 4, 3], [26, 27, 8, 3]],
  oases: [[10, 12, true], [28, 13, false], [6, 24, false]], props: 40,
  exits: [{ x: 3, y: 1, to: 'lamakan_tunnel_2', tx: 19, ty: 9, dir: DIR.DOWN, door: true }, { x: 35, y: 16, w: 1, h: 3, to: 'world_gs1', tx: 73, ty: 69, dir: DIR.RIGHT }],
  build(M) {
    M.chest(4, 5, 'Vulcan Axe', 1); M.chest(20, 20, 'Psy Crystal', 1, { hidden: true }); M.chest(28, 26, 'Nut', 2);
    M.setObj(9, 25, 'psystone');
    M.djinni('Vine', 28, 24, { fight: true });
    M.trigger(31, 16, 2, 3, STORY.manticore, { once: 'manticore_done' }); M.boss('Manticore', 32, 15, { done: 'manticore_done' });
  },
});
