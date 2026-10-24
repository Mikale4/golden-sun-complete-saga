// ---------- Field scene: towns, dungeons, world map ----------
// Movement speeds, in half-pixels per frame (updateActor doubles them). 1 = one 16px tile every 8 frames.
const WALK_SPEED = 1, SAIL_SPEED = 1.5, SLIDE_SPEED = 2;
// Hold a direction across open ground and the walk eases into a run; stop or turn and it drops back. No key needed.
const DASH_AFTER = 6, DASH_SPEED = 1.5;
'use strict';
const REVEAL_FRAMES = 360, REVEAL_R = 44;   // Reveal: six seconds of true sight, a circle of about three tiles around the party
const HEAT_MAX = 100;                        // the desert's heat gauge
class Actor {
  // a monster standing on the field - a boss seen before it is fought - is its battle picture shrunk to the tiles:
  // the small ones to a tile and a half, the big ones to two and a half, feet on the tile it stands on
  static foeSprite(name, frame, scale) {
    const key = name + ':' + frame + ':' + (scale || ''); Actor._foeCache = Actor._foeCache || {};
    if (Actor._foeCache[key]) return Actor._foeCache[key];
    const src = (typeof Foes !== 'undefined' && Foes.sprite(name, frame)) || null;
    if (!src) return Actor._foeCache[key] = Gfx.canvas(16, 24);
    const k = scale || (src.width > 48 ? 40 / src.width : 24 / src.width); const w = Math.max(8, Math.round(src.width * k)), h = Math.max(8, Math.round(src.height * k));
    const c = Gfx.canvas(w, h), g = Gfx.ctx(c); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, w, h);
    return Actor._foeCache[key] = c;
  }
  constructor(id, x, y, look, opts) {
    opts = opts || {};
    this.id = id; this.tx = x; this.ty = y; this.px = x * TILE; this.py = y * TILE; this.dir = opts.dir === undefined ? DIR.DOWN : opts.dir;
    this.look = look; this.animal = opts.animal; this.animalCol = opts.animalCol; this.set = this.animal ? null : Sprites.buildSet(look);
    this.moving = false; this.frame = 0; this.animT = 0; this.path = []; this.pathSpeed = 1; this.ignoreSolid = false; this.hidden = false; this.emote = null; this.emoteT = 0; this.jumpT = 0;
    this.move = opts.move || 'static'; this.wanderT = rnd(60); this.home = { x, y }; this.data = opts; this.speed = opts.speed || 1;
  }
  sprite() {
    if (this.data && this.data.foe) return Actor.foeSprite(this.data.foe, Math.floor(Engine.frame / 24) % 2, this.data.foeScale);
    if (this.animal) return Sprites.animal(this.animal, this.animalCol, this.dir, this.moving ? Math.floor(this.animT / 8) % 2 : 0);
    const f = this.moving ? [1, 0, 2, 0][Math.floor(this.animT / 6) % 4] : 0;
    return this.set[this.dir][f];
  }
  get x() { return this.px + 8; } get y() { return this.py + 16; }
}

class FieldScene {
  constructor() {
    G.field = this; this.textbox = new Textbox(); this.event = null; this.eventQueue = []; this.npcs = []; this.followers = []; this.showFollowers = true; this.cam = { x: 0, y: 0 }; this.frame = 0; this.steps = 0; this.encCounter = 0;
    this.player = null; this.map = null; this.psyMenu = null; this.reveal = 0; this.chapterTitle = null; this.areaTitle = null; this.hoverT = 0; this.sandForm = false; this.cloaked = false; this.ship = false; this.notice = null; this.noticeT = 0;
    this.shipActor = null;
  }
  get inEvent() { return !!this.event; }
  // ---------- map loading ----------
  loadMap(mapId, x, y, dir, opts) {
    opts = opts || {}; this.camFocus = null; this.camEase = false; this.camFx = this.camFy = undefined;
    // the night of the storm: until the prologue is over, every door in Vale opens back onto the town in the rain,
    // not the town of the morning after (the houses' own maps only know the present-day town)
    if (!G.flag('prologue_done') && G.game !== 2 && MAPS[mapId + '_past']) mapId += '_past';
    // Angara's towns and dungeons were built for the Golden Sun world map; in The Lost Age their exits must land on Weyard's full map instead
    if (mapId === 'world_tla' && typeof worldTlaLanding === 'function' && this.map && !this.map.world && this.map.id !== 'camp') { const land = worldTlaLanding(this.map.id, dir, !!(opts.ship)); if (land) { x = land.x; y = land.y; dir = land.dir; } }
    if (mapId === 'world_gs1' && typeof worldGs1Landing === 'function' && this.map && !this.map.world) { const land = worldGs1Landing(this.map.id, dir); if (land) { x = land.x; y = land.y; dir = land.dir; } }
    if (mapId === 'world_gs1' && G.game === 2 && !G.flag('prologue_jenna') && MAPS.world_tla) { const land = tlaLandingFor(this.map && this.map.id); mapId = 'world_tla'; if (land) { x = land.x; y = land.y; dir = land.dir; } }
    const prevMusic = this.map ? this.map.music : null; const prevWorld = !!(this.map && this.map.world);
    const M = buildMap(mapId); this.map = M; G.map = M; G.mapId = mapId; this.cloaked = 0;
    if (x === undefined) { const e = M.entry; x = e.x; y = e.y; }
    if (!this.player) { this.player = new Actor('player', x, y, G.party.leader.look); }
    this.player.tx = x; this.player.ty = y; this.player.px = x * TILE; this.player.py = y * TILE; this.player.moving = false; this.player.path = []; if (dir !== undefined) this.player.dir = dir;
    this.player.look = G.party.leader.look; this.player.set = Sprites.buildSet(this.player.look);
    this.rebuildFollowers(); this.gatherFollowers();
    // a person placed on a wall, a cliff or a roof (a layout redrawn under them) steps to the nearest open ground; the
    // scenery ones (solid: false - a face in a tree, a boulder) and anyone sitting on a chair or a bed stay put
    const settle = (n) => { if (!M.inb(n.x, n.y) || !M.isSolid(n.x, n.y) || n.solid === false || n.fixed) return [n.x, n.y]; /* n.fixed: stays where it is put, even over a gap (a jelly over the hold's bilge) */ const o = M.getObj(n.x, n.y); if (o && /^(chair|bed|stool|bench)/.test(o.name)) return [n.x, n.y]; for (let r = 1; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.abs(dx) + Math.abs(dy) !== r) continue; const x = n.x + dx, y = n.y + dy; if (M.inb(x, y) && !M.isSolid(x, y) && !M.exits.some(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h)) return [x, y]; } return [n.x, n.y]; };
    this.npcs = M.npcs.filter(n => this.npcVisible(n)).map(n => { const [x, y] = settle(n); const a = new Actor(n.id, x, y, n.look, n); a.npc = n; a.fromMap = true; return a; });
    this.spawnTrainees();
    if (M.world && typeof Travelers !== 'undefined') Travelers.spawnAll(this);
    if (!M.world && prevWorld && typeof Reputation !== 'undefined' && Reputation.on()) Reputation.reset();   /* in off the road: the regard spent out there is forgotten (the user's rule) */
    if (M.music && M.music !== prevMusic) Audio.play(M.music); else if (M.music && Audio.playing !== M.music) Audio.play(M.music);
    this.encCounter = 20 + rnd(30); this.reveal = 0; this.sandForm = false; if (!(M.def && M.def.heat)) this.heat = 0; if (!/^colosso_r/.test(M.id)) this.race = null;
    G.set('visited:' + M.id);   // the towns reached so far (the artifact lists grow with them)
    this.lastSea = null;
    if (M.world) { this.ship = !!opts.ship || (G.flag('onShip') && !!opts.keepShip); if (!this.ship && G.flag('hasShip') && ((x === G.get('shipX') && y === G.get('shipY')) || M.get(x, y).water)) { this.ship = true; } if (this.ship && !opts.keepShip) { G.set('shipX', x); G.set('shipY', y); } if (!opts.keepShip) G.set('onShip', this.ship); } else this.ship = !!opts.ship; // arriving by ship: the ship is wherever the party is
    if (M.world && G.flag('hasShip')) { if (!this.shipActor) this.shipActor = { x: G.get('shipX') || 0, y: G.get('shipY') || 0 }; }
    this.updateCamera(true);
    if (!opts.keepShip && !opts.noAutosave) SaveSystem.autosave(this);
    if (!G.visited) G.visited = {}; G.visited[mapId] = true;
    if (G.flag('camp_founded')) for (const id of ['Felix', 'Isaac']) { const m = G.party.get(id); if (m) m.learnExtra('Hideout'); }
    if (G.flag('islet_open') && !G.flag('anemos_open') && G.party.djinnCount() >= 72) G.set('anemos_open');
    if (G.get('forge_order') && mapId !== 'yallam_forge') G.set('forge_ready', true);   // out of his forge, and he can work
    const areaName = M.world ? (M.def.regionName ? M.def.regionName(x, y) : M.name) : M.name;
    if (areaName && !M.world && areaName !== this._lastAreaName && !(M.indoor && M.h <= 14 && !M.def.enc)) this.areaTitle = { text: areaName, t: 0 };   // the world map keeps its own region panel
    this._lastAreaName = areaName;
    if (M.def.onEnter) this.run(M.def.onEnter);
    // check standing trigger immediately (map entrance events)
    this.checkTriggers(true);
  }
  npcVisible(n) { if (n.hideIf && G.flag(n.hideIf)) return false; if (n.showIf && !G.flag(n.showIf)) return false; if (n.cond && !n.cond()) return false; return true; }
  refreshNpcs() { const spawned = this.npcs.filter(a => !a.fromMap); this.npcs = this.map.npcs.filter(n => this.npcVisible(n)).map(n => { const ex = this.npcs.find(a => a.id === n.id && a.fromMap); if (ex) return ex; const a = new Actor(n.id, n.x, n.y, n.look, n); a.npc = n; a.fromMap = true; return a; }).concat(spawned); }
  spawnNpc(id, x, y, opts) { opts = opts || {}; const look = opts.look || (NPC_LOOKS[id] || npcLook(opts.type || 'villager_m', hashStr(id))); const a = new Actor(id, x, y, look, opts); a.npc = Object.assign({ id, x, y, name: id }, opts); this.npcs.push(a); return a; }
  removeNpc(id) { this.npcs = this.npcs.filter(a => a.id !== id); }
  rebuildFollowers() {
    const members = G.party.active.slice(1);
    this.followers = members.map((m, i) => { const ex = this.followers[i]; const a = new Actor('follow' + i, this.player.tx, this.player.ty, m.look, {}); a.member = m; a.trail = []; if (ex) { a.tx = ex.tx; a.ty = ex.ty; a.px = ex.px; a.py = ex.py; a.dir = ex.dir; } return a; });
    if (this.player) { this.player.look = G.party.leader.look; this.player.set = Sprites.buildSet(this.player.look); }
  }
  gatherFollowers() {
    const p = this.player; const bx = -DX[p.dir], by = -DY[p.dir]; this.trail = [];
    this.followers.forEach((f, i) => {
      let x = p.tx, y = p.ty; const cx = p.tx + bx * (i + 1), cy = p.ty + by * (i + 1);
      if (this.map && this.map.inb(cx, cy) && !this.map.isSolid(cx, cy) && !this.objectAt(cx, cy)) { x = cx; y = cy; }
      f.tx = x; f.ty = y; f.px = x * TILE; f.py = y * TILE; f.dir = p.dir; f.moving = false; f.path = [];
      this.trail.push({ x, y, dir: p.dir });
    });
  }
  findActor(who) {
    if (who === 'player' || who === G.party.leader.id || who === G.party.leader.name) return this.player;
    const f = this.followers.find(f => f.member.id === who || f.member.name === who); if (f) return f;
    return this.npcs.find(n => n.id === who || (n.npc && n.npc.name === who));
  }
  dirTo(a, b) { const dx = b.tx - a.tx, dy = b.ty - a.ty; if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? DIR.RIGHT : DIR.LEFT; return dy > 0 ? DIR.DOWN : DIR.UP; }
  run(gen) { const ctx = new EventContext(this); const g = gen(ctx); if (this.event) { this.eventQueue.push(g); return; } this.event = new Coroutine(g); }
  // ---------- collision ----------
  // Reveal, as in the originals: a circle of true sight around the party, going with them as they walk and fading
  // after a few seconds. Only what lies inside it is seen for what it is - hidden chests, the sand under a mirage,
  // the water in a rock ring, sparkles on a jar that holds something, a floor over a gap - and only there can it be
  // opened or walked on
  revealed(x, y) { if (this.reveal <= 0) return false; const p = this.player; const dx = x * TILE + 8 - (p.px + 8), dy = y * TILE + 8 - (p.py + 8); return dx * dx + dy * dy <= REVEAL_R * REVEAL_R; }
  hiddenAt(x, y) { const M = this.map; if (!M.hidden || !M.hidden.length) return null; for (const h of M.hidden) if (h.x === x && h.y === y) return h; return null; }
  blocked(x, y, actor) {
    const M = this.map;
    if (!M.inb(x, y)) return true;
    if (M.objects.some(o => !o.gone && ((o.kind === 'icepillar') || (o.kind === 'carriable' && o.state === 'bridge') || o.kind === 'berg' || (o.kind === 'heavycrate' && o.state === 'sunk')) && o.x === x && o.y === y)) return false;   // a pillar of ice frozen over a crack, a block set down in a gap, or an ice floe adrift, is stood on
    // a hidden thing seen for what it is: the sand of a mirage, the floor across a gap - passable if the truth is
    if (actor === this.player || !actor) { const h = this.hiddenAt(x, y); if (h && (this.revealed(x, y) || (this.player.tx === x && this.player.ty === y)) && !Tiles.get(h.tile).solid && !M.objects.some(o => !o.gone && o.x === x && o.y === y && this.objectSolid(o))) return false; }
    if (M.world && !this.ship && G.flag('hasShip') && x === G.get('shipX') && y === G.get('shipY')) return false;
    if (this.ship) { const t = M.get(x, y); const wings = M.world && G.flag('ship_wings') && !G.flag('ship_on_water'); if (t.river && !wings) return true; /* rivers are not sailed */ if (M.getObj(x, y) && M.getObj(x, y).solid) return true; if (M.objects.some(o => !o.gone && o.x === x && o.y === y && this.objectSolid(o))) return true; /* a rock in the strait */ if (t.water || t.name === 'w_dock' || t.name === 'dock' || t.name === 'w_beach' || t.place) return false; if (wings && FieldScene.flyable(t)) return false; /* the Wings of Anemos: reefs and the low land are crossed in the air */ return true; }
    const afloat = this.floatLogAt(x, y);   // a log afloat on the water is a bridge: it is walked along
    if (M.isSolid(x, y) && !afloat) {
      // ladders/ice pillars etc. are walkable objects
      const ot = M.getObj(x, y);
      if (!(ot && (ot.ladder))) { if (!(this.sandForm && this.map.get(x, y).softsand)) return true; }   // any soft sand (the desert's, the ruins') is slipped through in Sand form
    }
    // hidden tiles solid until revealed? no
    for (const o of M.objects) { if (o.gone) continue; if (o.kind === 'log') { if (!o.afloat && !o.sliding && this.logCells(o).some(c => c[0] === x && c[1] === y)) return true; continue; } if (o.x === x && o.y === y && this.objectSolid(o)) return true; }
    if (actor !== this.player && this.player.tx === x && this.player.ty === y) return true;
    for (const n of this.npcs) { if (n === actor || n.hidden) continue; if (n.npc && n.npc.solid === false) continue; if (n.tx === x && n.ty === y) return true; if (n.moving && n.destX === x && n.destY === y) return true; }
    return false;
  }
  // The mimic stones of the Anemos sanctum: a stone that steps whenever the party steps - the same way up and down,
  // the opposite way across (`mirror`: true). A wall or a thing in its way holds it still; a gap under it takes it
  // (it is set back where it began); on its button (`button: {x, y}`) it runs `onButton` once.
  tickMimics() {
    const M = this.map, p = this.player; if (!M) return;
    const d = p.dir; const dx = DX[d], dy = DY[d];
    for (const o of M.objects) {
      if (o.kind !== 'mimic' || o.gone) continue;
      const mx = o.mirror === false ? dx : -dx, my = dy; const nx = o.x + mx, ny = o.y + my;
      if (!M.inb(nx, ny)) continue; const t = M.get(nx, ny);
      if (t.kind === 'pit' || t.kind === 'gap' || t.hole) { o.x = o.sx === undefined ? o.x : o.sx; o.y = o.sy === undefined ? o.y : o.sy; Audio.sfx('cancel'); this.showNotice('The stone drops into the gap - and is back where it began.'); continue; }
      if (M.isSolid(nx, ny) || this.npcs.some(n => !n.hidden && n.tx === nx && n.ty === ny) || (p.tx === nx && p.ty === ny) || M.objects.some(ob => ob !== o && !ob.gone && ob.x === nx && ob.y === ny && this.objectSolid(ob))) continue;
      o.x = nx; o.y = ny;
      if (o.button && o.x === o.button.x && o.y === o.button.y && !o.pressed) { o.pressed = true; if (o.onButton) this.run(o.onButton); }
    }
  }
  // Ice floes adrift (E Tundaria Islet): each glides to and fro along its lane - `lane: [x0, x1]` across or
  // `vlane: [y0, y1]` up and down - one cell every `speed` frames, turning at the ends and where another floe or
  // a solid thing lies; whoever stands on it goes with it (the party walks onto a floe when it comes alongside).
  tickBergs() {
    const M = this.map, p = this.player;
    for (const o of M.objects) {
      if (o.kind !== 'berg' || o.gone) continue;
      if (o.dir === undefined) o.dir = 1; if (o.t === undefined) o.t = 0;
      const speed = o.speed || 40, horiz = !!o.lane, lo = horiz ? o.lane[0] : o.vlane[0], hi = horiz ? o.lane[1] : o.vlane[1];
      const riding = p.tx === o.x && p.ty === o.y && !p.moving && !p.hopping;
      if (o.t === 0) {   // choose the next cell, turning at the lane's end or before an obstacle
        const step = () => { const nx = o.x + (horiz ? o.dir : 0), ny = o.y + (horiz ? 0 : o.dir); const at = horiz ? nx : ny; if (at < lo || at > hi) return false; const t = M.get(nx, ny); if (!t || !t.water) return false; if (M.objects.some(ob => ob !== o && !ob.gone && ob.x === nx && ob.y === ny && ob.kind !== 'berg' ? this.objectSolid(ob) : ob !== o && !ob.gone && ob.kind === 'berg' && ob.x === nx && ob.y === ny)) return false; if (this.npcs.some(n => !n.hidden && n.tx === nx && n.ty === ny)) return false; return true; };
        if (!step()) { o.dir = -o.dir; if (!step()) { continue; } }
        o.nx = o.x + (horiz ? o.dir : 0); o.ny = o.y + (horiz ? 0 : o.dir);
      }
      o.t++;
      const f = Math.min(1, o.t / speed); o.ox = Math.round((o.nx - o.x) * f * TILE); o.oy = Math.round((o.ny - o.y) * f * TILE);
      if (riding) { p.px = p.tx * TILE + o.ox; p.py = p.ty * TILE + o.oy; }
      if (o.t >= speed) { o.x = o.nx; o.y = o.ny; o.ox = 0; o.oy = 0; o.t = 0; if (riding) { p.tx = o.x; p.ty = o.y; p.px = p.tx * TILE; p.py = p.ty * TILE; this.gatherFollowers(); } }
    }
  }
  objectSolid(o) {
    switch (o.kind) {
      case 'pillar': case 'crate': case 'block': if (this.sandForm && !o.fixed && this.map.get(o.x, o.y).softsand) return false;   // a loose pillar or block standing on soft sand is slipped under in Sand form (Ankohl's square blocks)
      case 'boulder': case 'stump': case 'statue': case 'statue_move': case 'torch': case 'djinni': case 'chestobj': case 'container': return o.state !== 'sunk' && o.state !== 'fallen' && o.state !== 'seated';
      case 'vines': return true; case 'crack': return true; case 'windstone': return true; case 'twister': return true; case 'sandwall': return true; case 'updraft': return o.passable ? false : !this.updraftOn(o); case 'condtile': return !!o.up; case 'steam': return true; case 'waterstone': return true; case 'icepillar': return false; case 'rock_water': return o.state !== 'sunk';
      case 'log': return true; case 'leaf': return false; case 'sprout': return false; case 'puddle': return false; case 'hop': return true; case 'rope': return o.state !== 'tied'; case 'scoop': return false; case 'leaves': return o.state === 'cleared' ? false : true; case 'hoverpad': return false; case 'gap': return !this.hovering; case 'sandgap': return !this.sandForm; case 'lever': return true; case 'gate': return o.state !== 'open'; case 'ice_slide': return false; case 'catchable': return true; case 'carriable': return o.state !== 'carried' && o.state !== 'bridge';
      case 'spot': return !!o.tile && !o.hiddenUntilReveal;
      case 'berg': return false;
      case 'mimic': return true;
      default: return typeof ClassExt !== 'undefined' ? ClassExt.solid(this, o) : false;
    }
  }
  objectAt(x, y) { let draft = null; for (const o of this.map.objects) { if (o.gone) continue; if (o.kind === 'log' ? this.logCells(o).some(c => c[0] === x && c[1] === y) : (o.x === x && o.y === y)) { if (o.kind === 'updraft' || o.kind === 'tornado') { draft = draft || o; continue; } return o; } } return draft; }   // a pillar standing on a vent is the thing at that cell; the vent only when nothing sits on it
  // a felled log lies across several tiles, from its x,y along its length
  logCells(o) { const out = []; for (let i = 0; i < (o.len || 3); i++) out.push(o.horiz ? [o.x + i, o.y] : [o.x, o.y + i]); return out; }
  floatLogAt(x, y) { return this.map.objects.find(o => !o.gone && o.kind === 'log' && o.afloat && !o.sliding && this.logCells(o).some(c => c[0] === x && c[1] === y)); }
  // a log afloat on the water - the poles of Fuchin Falls Cave: the party stands on it and walks it across the water,
  // and it drifts that way until something stops it, to be walked along wherever it lies
  logSlideSteps(o, d) {
    const M = this.map; if (o.horiz ? (d === DIR.UP || d === DIR.DOWN) : (d === DIR.LEFT || d === DIR.RIGHT)) return 0;   // a pole drifts along its length, like a boat
    const clear = (cells) => cells.every(([x, y]) => M.inb(x, y) && M.get(x, y).water && !M.getObj(x, y) && !this.map.objects.some(ob => ob !== o && !ob.gone && (ob.kind === 'log' ? this.logCells(ob) : [[ob.x, ob.y]]).some(c => c[0] === x && c[1] === y)) && !this.npcs.some(n => n.tx === x && n.ty === y));
    let steps = 0, ox = o.x, oy = o.y;
    for (; steps < 32; steps++) { const cells = this.logCells({ x: ox + DX[d], y: oy + DY[d], len: o.len, horiz: o.horiz }); if (!clear(cells)) break; ox += DX[d]; oy += DY[d]; }
    return steps;
  }
  rideLog(o, d) {
    if (o.sliding) return false; const steps = this.logSlideSteps(o, d); if (!steps) return false;
    const p = this.player; o.sliding = true; p.dir = d; Audio.sfx('water'); const self = this;
    this.run(function* (E) {
      for (let i = 0; i < steps; i++) {
        for (let f = 1; f <= 6; f++) { o.ox = Math.round(DX[d] * f * 16 / 6); o.oy = Math.round(DY[d] * f * 16 / 6); p.px = p.tx * TILE + o.ox; p.py = p.ty * TILE + o.oy; yield 1; }
        o.x += DX[d]; o.y += DY[d]; o.ox = 0; o.oy = 0; p.tx += DX[d]; p.ty += DY[d]; p.px = p.tx * TILE; p.py = p.ty * TILE;
      }
      o.sliding = false; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: false, state: o.state }); Audio.sfx('push'); self.gatherFollowers();
      if (o.onSlide) yield* o.onSlide(E);
    });
    return true;
  }
  // walking into a log from the side rolls it one tile; rolled into water it floats there and is walked across
  rollLog(o, d) {
    const M = this.map; if (o.horiz ? (d === DIR.LEFT || d === DIR.RIGHT) : (d === DIR.UP || d === DIR.DOWN)) return false;   // no rolling along its length
    if (o.rolling) return false;
    if (this.logCells(o).some(([x, y]) => M.get(x, y).water)) return false;   // afloat, it only bobs
    const clear = (cells) => cells.every(([x, y]) => M.inb(x, y) && !(M.isSolid(x, y) && !M.get(x, y).water) && !this.map.objects.some(ob => ob !== o && !ob.gone && this.objectSolid(ob) && (ob.kind === 'log' ? this.logCells(ob) : [[ob.x, ob.y]]).some(c => c[0] === x && c[1] === y)) && !this.npcs.some(n => n.tx === x && n.ty === y));
    // how far it rolls: until something stops it, or the stream takes it the moment it reaches the water
    let steps = 0, lands = false; let ox = o.x, oy = o.y;
    for (; steps < 32; steps++) {
      const cells = this.logCells({ x: ox + DX[d], y: oy + DY[d], len: o.len, horiz: o.horiz });
      if (!clear(cells)) break;
      const water = cells.filter(([x, y]) => M.get(x, y).water);
      if (water.length && water.length < cells.length) break;   // half in the water: it lodges on the bank instead
      ox += DX[d]; oy += DY[d];
      if (water.length) { steps++; lands = true; break; }
    }
    if (!steps) return false;
    // the roll itself is a little scene: the log turns over one tile at a time, and the party waits for it
    const self = this; o.rolling = true; Audio.sfx('push');
    this.run(function* (E) {
      for (let i = 0; i < steps; i++) {
        for (let f = 1; f <= 6; f++) { o.ox = Math.round(DX[d] * f * 16 / 6); o.oy = Math.round(DY[d] * f * 16 / 6); o.phase = (o.phase || 0) + 1; yield 1; }
        o.x += DX[d]; o.y += DY[d]; o.ox = 0; o.oy = 0;
        if (i < steps - 1 && i % 2 === 1) Audio.sfx('push');
      }
      o.rolling = false; o.phase = 0;
      if (lands) {
        // the whole log lands in the river: it floats there as a bridge from now on, or drifts where the map says
        const cells = self.logCells(o); o.gone = true; o.state = 'floating'; G.set('obj:' + o.key, { x: o.x, y: o.y, gone: true, state: 'floating' });
        if (!o.onFloat) for (const [x, y] of cells) { persistGround(M, x, y, o.horiz ? 'log_float_h' : 'log_float_v'); persistWalkable(M, x, y); }
        M.finalize(); Audio.sfx('water'); if (o.onFloat) yield* o.onFloat(E);
      } else G.set('obj:' + o.key, { x: o.x, y: o.y, gone: false, state: o.state });
    });
    return true;
  }
  // ---------- update ----------
  update() {
    this.frame++; G.playtime++;
    if (this.chapterTitle) { this.chapterTitle.t++; if (this.chapterTitle.t > 140) this.chapterTitle = null; }
    if (this.areaTitle) { this.areaTitle.t++; if (this.areaTitle.t > 210) this.areaTitle = null; }
    if (this.noticeT > 0) this.noticeT--;
    if (this.wave) this.wave.t++;
    if (G.flag('venus_escape') && !this.event && this.frame % 75 === 0) { Engine.doShake(10); Audio.sfx('quake'); }
    const busy = !!this.event || this.textbox.active;
    this.textbox.update();
    if (this.event) { if (this.event.update()) { this.event = null; if (this.eventQueue.length) this.event = new Coroutine(this.eventQueue.shift()); else { if (this.camFocus) { this.camFocus = null; this.camEase = true; } if (this.alexMusicWas !== undefined) { if (Audio.playing === 'tunnel' && Engine.top === this) Audio.play(this.map && this.map.music && this.map.music !== 'tunnel' ? this.map.music : this.alexMusicWas); delete this.alexMusicWas; } } } }   /* Alex's theme ends with his scene */
    if (this.psyMenu) { this.updatePsyMenu(); }
    else if (this.moveAim) { this.updateMoveAim(); }
    else if (this.puppet && !busy) { this.updatePuppet(); }
    else if (!busy && !this.event && !this.textbox.active) this.playerControl();
    this.updateActor(this.player);
    if (!this.player.moving && Input.dirHeld() < 0) { this.player.stride = 0; this.player.lastDir = -1; }   // a pause ends the run
    this.updateFollowers();
    for (const n of this.npcs) { if (!this.event && n.move === 'wander' && !n.path.length) this.wander(n); if (!this.event && n.move === 'patrol' && !n.path.length) this.patrol(n); if (n.move === 'halted' && n.halted <= 0) n.move = 'patrol'; this.updateActor(n); }
    this.watchGuards();
    this.tickTwisters();
    this.tickTraining();
    if (typeof Travelers !== 'undefined') Travelers.tick(this);
    if (this.reveal > 0) this.reveal--;
    if (this.cloaked > 0) this.cloaked--;   // Cloak wears off; it never outlasts the map it was cast on
    if (typeof ClassExt !== 'undefined') ClassExt.tick(this);   // Prowl, Shadow Step, the tide and the rest of the class items' timers
    if (this.race && !this.race.late) { this.race.t--; if (this.race.t <= 0) { this.race.late = true; this.showNotice(this.race.foe + ' has reached the centre!'); } }
    // Hover lasts a few seconds whether the party walks or not; when it gives out over a gap they fall (the map's
    // def.fall, or back to the pad they rose from)
    if (this.hovering) { this.hoverT--; if (this.hoverT <= 0 && !this.player.moving) { this.hovering = false; const p = this.player, M = this.map; const here = this.objectAt(p.tx, p.ty); const t = M.get(p.tx, p.ty); if ((here && here.kind === 'gap') || t.hole) { const self = this; const d = typeof M.def.fall === 'function' ? M.def.fall(p.tx, p.ty) : M.def.fall; const back = d || this.hoverFrom; if (back) this.run(function* (E) { Audio.sfx('jump'); yield Engine.fadeOut(10); E.warpNow(back.map || M.id, back.x, back.y, DIR.DOWN); yield Engine.fadeIn(10); }); } } }
    this.updateCamera();
  }
  playerControl() {
    const p = this.player;
    if (Input.pressed('b')) { Engine.push(new MenuScene(this)); return; }
    if (Input.pressed('select') && !p.moving) { this.challenge(); return; }
    if (Input.pressed('r')) { this.openPsyMenu(); return; }
    for (const q of ['q1', 'q2']) if (Input.pressed(q) && !p.moving) { if (G.quick[q]) this.usePsy(G.quick[q]); else this.showNotice('No quick Psynergy set. Press C, then ' + (q === 'q1' ? 'A' : 'S') + '.'); return; }
    if (Input.pressed('a') && !p.moving) { this.interact(); return; }
    if (p.moving || p.path.length) return;
    const d = Input.dirHeld(); if (d < 0) return;
    // face first if changing direction (small delay like GS)
    if (p.dir !== d) { p.dir = d; p.turnT = 3; return; }
    if (p.turnT > 0) { p.turnT--; return; }
    let nx = p.tx + DX[d], ny = p.ty + DY[d];
    const rt = this.rampTarget(p.tx, p.ty, d); if (rt) { nx = rt.x; ny = rt.y; }   // a ramp is climbed slantwise
    const ride = this.floatLogAt(p.tx, p.ty); if (ride && this.blocked(nx, ny, p) && this.rideLog(ride, d)) { p.turnT = 10; return; }
    // jump down small cliffs? (skip). Ice slide
    if (!this.blocked(nx, ny, p) && !this.exitBlocked(nx, ny)) { this.startMove(p, d, this.ship ? SAIL_SPEED : this.footSpeed(d), rt ? nx : undefined, rt ? ny : undefined); }
    else { const lg = this.objectAt(nx, ny); if (lg && lg.kind === 'log') { if (this.rollLog(lg, d)) { p.turnT = 10; } return; } const hop = this.hopTarget(p, d); if (hop) this.hop(p, d, hop); else this.makeWay(nx, ny, d); }
  }
  // someone who only wanders (a traveler, a villager on a stroll) steps aside when the party keeps pushing into them,
  // so a crowd in a one-tile pass never boxes the party in; folk with a place to stand keep it
  makeWay(nx, ny, d) {
    const n = this.npcs.find(n => !n.hidden && !n.moving && n.tx === nx && n.ty === ny); if (!n || !(n.traveler || n.move === 'wander')) return;
    n.pushT = (n.pushT || 0) + 1; if (n.pushT < 24) return; n.pushT = 0;
    const side = [0, 1, 2, 3].filter(dd => DX[dd] * DX[d] + DY[dd] * DY[d] === 0); side.push(d);   // sideways first, straight on if there is no room
    const dd = side.find(dd => this.trainWalkable(n.tx + DX[dd], n.ty + DY[dd]) && !this.map.exits.some(e => n.tx + DX[dd] >= e.x && n.tx + DX[dd] < e.x + e.w && n.ty + DY[dd] >= e.y && n.ty + DY[dd] < e.y + e.h));
    if (dd !== undefined) { n.path = [dd]; n.pathSpeed = 0.7; n.ignoreSolid = false; }
  }
  // Hopping: a one-tile gap, ledge or stretch of water marked for it is cleared in a single bound when there is
  // footing on the far side - the originals' way across chasms and between stepping stones
  hopTarget(a, d) {
    const nx = a.tx + DX[d], ny = a.ty + DY[d]; const M = this.map; if (!M.inb(nx, ny)) return null;
    const t = M.get(nx, ny), o = this.objectAt(nx, ny);
    if (!((o && (o.kind === 'gap' || o.kind === 'hop') && !this.hovering) || t.hop)) return null;
    if (o && o.kind === 'hop' && o.only !== undefined && o.only !== d) return null;   /* a ledge: down it, never up */
    const fx = nx + DX[d], fy = ny + DY[d]; if (!M.inb(fx, fy) || this.blocked(fx, fy, a)) return null;
    return { x: fx, y: fy };
  }
  hop(a, d, to) { a.dir = d; a.moving = true; a.destX = to.x; a.destY = to.y; a.speed = 1.5; a.jumpT = 16; a.hopping = true; Audio.sfx('jump'); if (a === this.player) { this.trail = this.trail || []; this.trail.unshift({ x: a.tx, y: a.ty, dir: d, hop: true }); if (this.trail.length > 12) this.trail.length = 12; } }
  exitBlocked() { return false; }
  footSpeed(d) { const p = this.player; p.stride = (p.lastDir === d) ? (p.stride || 0) + 1 : 1; p.lastDir = d; const base = p.stride > DASH_AFTER ? DASH_SPEED : WALK_SPEED; return typeof ClassExt !== 'undefined' ? ClassExt.footSpeed(this, base) : base; }
  // from a ramp cell, the way pressed across the slope leads to the next cell up or down the slant (if it is free)
  rampTarget(x, y, d) {
    const o = this.map.getObj(x, y); const t = { ramp: (o && o.ramp) || this.map.get(x, y).ramp }; if (!t.ramp) return null;
    let tx, ty; if (t.ramp === 'ne') { if (d === DIR.RIGHT) { tx = x + 1; ty = y - 1; } else if (d === DIR.LEFT) { tx = x - 1; ty = y + 1; } else return null; }
    else { if (d === DIR.LEFT) { tx = x - 1; ty = y - 1; } else if (d === DIR.RIGHT) { tx = x + 1; ty = y + 1; } else return null; }
    return this.blocked(tx, ty, this.player) ? null : { x: tx, y: ty };
  }
  startMove(a, d, speed, toX, toY) { a.dir = d; a.moving = true; a.destX = toX !== undefined ? toX : a.tx + DX[d]; a.destY = toY !== undefined ? toY : a.ty + DY[d]; a.speed = speed || 1; if (a === this.player) { this.trail = this.trail || []; this.trail.unshift({ x: a.tx, y: a.ty, dir: d }); if (this.trail.length > 12) this.trail.length = 12; } }
  updateActor(a) {
    if (a.emoteT > 0) a.emoteT--; if (a.jumpT > 0) a.jumpT--;
    if (!a.moving && a.path.length) { const d = a.path.shift(); a.dir = d; const nx = a.tx + DX[d], ny = a.ty + DY[d]; if (a.ignoreSolid || !this.blocked(nx, ny, a)) { a.moving = true; a.destX = nx; a.destY = ny; a.speed = a.pathSpeed || 1; } else a.path = []; }
    if (a.moving) {
      a.animT++;
      const spd = 2 * (a.speed || 1);
      const dx = a.destX * TILE - a.px, dy = a.destY * TILE - a.py;
      a.px += clamp(dx, -spd, spd); a.py += clamp(dy, -spd, spd);
      if (a.px === a.destX * TILE && a.py === a.destY * TILE) {
        a.tx = a.destX; a.ty = a.destY; a.moving = false; a.hopping = false;   // a hop is over when its feet are down (the flag was never cleared before: every later check of it read a hop that had long ended)
        if (a === this.player) this.onPlayerStep();
        if (a === this.player && Input.dirHeld() === a.dir && !this.event && !this.textbox.active && !this.psyMenu) { const nx = a.tx + DX[a.dir], ny = a.ty + DY[a.dir]; if (!this.blocked(nx, ny, a)) { this.startMove(a, a.dir, this.ship ? SAIL_SPEED : this.footSpeed(a.dir)); } }
      }
    } else a.animT = 0;
    if (a.moving && a === this.player) { const t = this.map.get(a.tx, a.ty); if (t.slippery && !a.path.length) { } }
  }
  updateFollowers() {
    if (!this.showFollowers) return;
    const p = this.player; const trail = this.trail || [];
    this.followers.forEach((f, i) => {
      const gap = (i + 1) * 1; const node = trail[gap - 1];
      if (this.event && f.path.length) { this.updateActor(f); return; }
      if (node && (f.tx !== node.x || f.ty !== node.y) && !f.moving) { const dx = node.x - f.tx, dy = node.y - f.ty; if (Math.abs(dx) + Math.abs(dy) === 1) { f.dir = dx > 0 ? DIR.RIGHT : dx < 0 ? DIR.LEFT : dy > 0 ? DIR.DOWN : DIR.UP; f.moving = true; f.destX = node.x; f.destY = node.y; f.speed = p.speed; } else if ((dx === 0 || dy === 0) && Math.abs(dx) + Math.abs(dy) === 2) { f.dir = dx > 0 ? DIR.RIGHT : dx < 0 ? DIR.LEFT : dy > 0 ? DIR.DOWN : DIR.UP; f.moving = true; f.destX = node.x; f.destY = node.y; f.speed = 1.5; f.jumpT = 16; } else { f.tx = node.x; f.ty = node.y; f.px = node.x * TILE; f.py = node.y * TILE; } }
      if (f.moving) { f.animT++; const spd = 2 * (f.speed || 1); f.px += clamp(f.destX * TILE - f.px, -spd, spd); f.py += clamp(f.destY * TILE - f.py, -spd, spd); if (f.px === f.destX * TILE && f.py === f.destY * TILE) { f.tx = f.destX; f.ty = f.destY; f.moving = false; } } else { f.animT = 0; if (node) f.dir = node.dir; }
    });
  }
  wander(n) { n.wanderT--; if (n.wanderT > 0) return; n.wanderT = 40 + rnd(90); const d = rnd(4); const nx = n.tx + DX[d], ny = n.ty + DY[d]; if (Math.abs(nx - n.home.x) > 3 || Math.abs(ny - n.home.y) > 3) { n.dir = d; return; } if (!this.blocked(nx, ny, n) && !this.map.exits.some(e => nx >= e.x && nx < e.x + e.w && ny >= e.y && ny < e.y + e.h)) { n.path = [d]; n.pathSpeed = 0.5; n.ignoreSolid = false; } else n.dir = d; }
  // an updraft blows unless it is switched off (o.active false, or a function saying so) or something heavy sits on it
  updraftOn(o) { if (o.gone) return false; const a = typeof o.active === 'function' ? o.active() : o.active; if (a === false) return false; return !this.map.objects.some(p => p !== o && !p.gone && p.x === o.x && p.y === o.y && this.objectSolid(p)); }
  // an updraft (a whirl at a statue's mouth, a vent in a floor) carries the party to o.to (on this map, or o.to.map)
  rideUpdraft(o) {
    const self = this, dest = typeof o.to === 'function' ? o.to() : o.to;   // a stream may run the other way once something changes
    return function* (E) { const wasShip = self.ship; if (!o.quiet) { Audio.sfx('psy'); self.psyFx = { name: 'Whirlwind', x: o.x, y: o.y, t: 0, el: 3, dir: DIR.UP, cx: o.x, cy: o.y }; } yield o.quiet ? 6 : 20; yield Engine.fadeOut(12); E.warpNow(dest.map || G.map.id, dest.x, dest.y, dest.dir === undefined ? DIR.UP : dest.dir); if (wasShip && !G.map.world) self.ship = true;   /* a current at sea carries the ship, not the party */ yield 4; yield Engine.fadeIn(12); if (o.onRide) yield* o.onRide(E); };
  }
  // a roaming twister: every o.speed frames it slides a cell along its ledge (o.x0..o.x1, or o.y0..o.y1) and turns at the
  // ends; if it meets the party, o.onHit runs (a tumble off the ledge, at Air's Rock)
  tickTwisters() {
    const M = this.map, p = this.player; if (!M) return;
    this.tickBergs();
    for (const o of M.objects) if (o.kind === 'steam' && o.state === 'wet' && !o.gone) { if (--o.evap <= 0) { o.state = null; delete o.evap; this.showNotice('The water boils away in the steam.'); } }
    for (const o of M.objects) {
      if (o.kind !== 'tornado' || o.gone || o.active === false || (typeof o.active === 'function' && !o.active())) continue;
      o.t = (o.t || 0) + 1;
      if (o.t % (o.speed || 10) === 0) {
        if (o.oneway) {   // a fireball, a dragon's head: from its start to the end of its lane, then again from the start; anything solid in the lane stops it short (a statue shoved into a flame's path blocks it)
          const nx = o.x + (o.dx || 0), ny = o.y + (o.dy || 0);
          const parked = M.objects.some(b => b !== o && !b.gone && b.x === o.x && b.y === o.y && this.objectSolid(b));   // something stands in the mouth it comes from: nothing comes out
          const past = o.x1 !== undefined ? (nx > o.x1 || nx < o.x0) : (ny > o.y1 || ny < o.y0);
          const hit = !past && !o.ghost && (!M.inb(nx, ny) || M.isSolid(nx, ny) || M.objects.some(b => b !== o && !b.gone && b.x === nx && b.y === ny && this.objectSolid(b)));
          if (parked) { if (o.sx !== undefined) { o.x = o.sx; o.y = o.sy; } }   /* never left behind whatever stood on it */
          else if (past || hit) { if (past && o.onEnd && !this.event) this.run(o.onEnd); o.x = o.sx !== undefined ? o.sx : (o.x0 !== undefined ? (o.dx < 0 ? o.x1 : o.x0) : o.x); o.y = o.sy !== undefined ? o.sy : (o.y0 !== undefined ? (o.dy < 0 ? o.y1 : o.y0) : o.y); }
          else { o.x = nx; o.y = ny; }
        }
        else if (o.x1 !== undefined) { o.dx = o.dx || 1; o.x += o.dx; if (o.x < o.x0 || o.x > o.x1) { o.dx = -o.dx; o.x += 2 * o.dx; } }
        else if (o.y1 !== undefined) { o.dy = o.dy || 1; o.y += o.dy; if (o.y < o.y0 || o.y > o.y1) { o.dy = -o.dy; o.y += 2 * o.dy; } }
      }
      if (!this.event && !this.textbox.active && o.onHit && !p.hopping && !this.sandForm && !(o.oneway && M.objects.some(b => b !== o && !b.gone && b.x === o.x && b.y === o.y && this.objectSolid(b))) && Math.abs(p.px / TILE - o.x) < 0.6 && Math.abs(p.py / TILE - o.y) < 0.6) this.run(o.onHit);   // sunk into the sand, the party is passed over
    }
  }
  patrol(n) {
    const pts = n.data.patrol; if (!pts || !pts.length) return;
    if (!n.moving && n.data.face !== undefined) n.dir = n.data.face;
    n.wanderT--; if (n.wanderT > 0) return; n.wanderT = n.data.patrolWait || 30;
    n.pi = n.pi || 0; const t = pts[n.pi]; if (n.tx === t[0] && n.ty === t[1]) { n.pi = (n.pi + 1) % pts.length; return; }
    const dx = Math.sign(t[0] - n.tx), dy = Math.sign(t[1] - n.ty); const d = dx ? (dx > 0 ? DIR.RIGHT : DIR.LEFT) : (dy > 0 ? DIR.DOWN : DIR.UP);
    const nx = n.tx + DX[d], ny = n.ty + DY[d];
    if (!this.blocked(nx, ny, n) && !(this.player.tx === nx && this.player.ty === ny)) { n.path = [d]; n.pathSpeed = 0.5; n.ignoreSolid = false; }
  }
  // Move, once the hand is on the object: shove it one tile the way pressed; into water or a pit it lies as a bridge
  moveObject(o, d) {
    const M = this.map; const nx = o.x + DX[d], ny = o.y + DY[d]; if (!M.inb(nx, ny)) return false;
    const saveObj = (ob) => G.set('obj:' + ob.key, { x: ob.x, y: ob.y, gone: ob.gone, state: ob.state });
    const t = M.get(nx, ny);
    let under = this.objectAt(nx, ny); if (under && under.kind === 'rock_water' && under.state === 'sunk') under = null;   // a spiky rock ground down is level floor: a thing shoved over it
    if (t.hole && M.def.fall && !M.isSolid(nx, ny) && !under) { const d = typeof M.def.fall === 'function' ? M.def.fall(nx, ny) : M.def.fall; if (d && (!d.map || d.map === M.id) && !M.isSolid(d.x, d.y) && !this.objectAt(d.x, d.y)) { const hit = this.npcs.find(n => !n.hidden && n.tx === d.x && n.ty === d.y); o.x = d.x; o.y = d.y; saveObj(o); Audio.sfx('push'); Engine.doShake(6); if (o.onLand) this.run(o.onLand(hit)); else if (o.onMove) this.run(o.onMove); return true; } return false; }
    if (!M.isSolid(nx, ny) && (!under || under.kind === 'updraft' || under.kind === 'tornado') && !this.npcs.some(n => !n.hidden && n.tx === nx && n.ty === ny) && !(this.player.tx === nx && this.player.ty === ny) && !t.water) { o.x = nx; o.y = ny; if (o.slides) { for (let k = 0; k < 40; k++) { const mx = o.x + DX[d], my = o.y + DY[d]; if (!M.inb(mx, my)) break; const mt = M.get(mx, my); const ob = this.objectAt(mx, my); if (M.isSolid(mx, my) || mt.water || mt.hole || (ob && (this.objectSolid(ob) || ob.kind === 'icepillar')) || this.npcs.some(n => !n.hidden && n.tx === mx && n.ty === my) || (this.player.tx === mx && this.player.ty === my)) break; o.x = mx; o.y = my; } }   /* a pipe on ice slides on until it meets something solid (a puddle frozen to a pillar counts; a puddle does not) */ saveObj(o); Audio.sfx('push'); if (o.onMove) this.run(o.onMove); return true; }
    if (t.water || t.name === 'pit' || (t.kind === 'pit' && !t.puddle) || t.kind === 'lava') { if (this.objectAt(nx, ny)) return false; o.gone = true; saveObj(o); Audio.sfx('push'); persistGround(M, nx, ny, t.kind === 'lava' ? 'lava_stone' : (o.sinkTile || 'pillar_fallen')); M.finalize(); if (o.onMove) this.run(o.onMove); return true; }
    return false;
  }
  updateMoveAim() {
    const a = this.moveAim; a.t++; if (a.o.gone) { this.moveAim = null; return; }
    if (Input.pressed('b') || Input.pressed('a')) { this.moveAim = null; return; }
    const d = Input.dirPressed(); if (d < 0) return;
    const ox = a.o.x, oy = a.o.y;
    if (this.moveObject(a.o, d)) { this.psyFx = { name: 'Move', x: ox, y: oy, t: 0, el: 0, dir: d, cx: ox - DX[d], cy: oy - DY[d] }; this.player.dir = (ox === this.player.tx || oy === this.player.ty) ? this.player.dir : this.player.dir; }
    else { this.showNotice("It won't go that way."); Audio.sfx('buzz'); }
    this.moveAim = null;
  }
  // ---------- guards who watch ----------
  // an NPC with `sight` looks that many tiles the way it faces, in a narrow cone with nothing solid between; an
  // uncloaked party stepping into it sets the NPC's script off (the guard's challenge). Cloak walks past them.
  watchGuards() {
    if (this.event || this.textbox.active || this.psyMenu) return;
    const p = this.player, M = this.map;
    for (const n of this.npcs) {
      const sight = n.npc && n.npc.sight; if (!sight || n.hidden || n.moving || n.halted > 0) continue;
      if (n.sightT > 0) { n.sightT--; continue; }
      const dx = p.tx - n.tx, dy = p.ty - n.ty, fx = DX[n.dir], fy = DY[n.dir];
      const ahead = dx * fx + dy * fy, aside = Math.abs(dx * fy - dy * fx);
      if (ahead < 1 || ahead > sight || aside > (ahead <= 2 ? 0 : 1)) continue;
      let clear = true; for (let k = 1; k < ahead; k++) { const cx = n.tx + fx * k, cy = n.ty + fy * k; if (M.isSolid(cx, cy) || M.objects.some(o => !o.gone && o.x === cx && o.y === cy && this.objectSolid(o))) { clear = false; break; } }
      if (!clear) continue;
      n.sightT = 180; if (this.cloaked) continue;   // seen through: the guard blinks and looks again later
      if (n.npc.script) { p.moving = false; p.path = []; this.run(n.npc.script); }
    }
  }
  // ---------- camp training ----------
  // Adepts sent out from the training tent are really out there: they walk the plains around the camp in their own
  // time, and it is their steps - not the player's - that run the trip down. Off the world map they keep walking
  // unseen, so a trip finishes just the same while you are deep in a lighthouse.
  tickTraining() {
    const tr = G.get('training'); if (!tr) return;
    if (tr.done) { this.finishTraining(tr); return; }
    if (tr.stepsLeft <= 0) return;
    // someone stops to talk to you: they stand still and the paces stop counting, because they are not walking them
    if (this.event || this.textbox.active || this.psyMenu) return;
    tr.t = (tr.t || 0) + 1; if (tr.t % TRAIN_STEP_FRAMES) return;
    tr.stepsLeft--; tr.steps = (tr.steps || 0) + 1;
    for (const w of tr.walkers || []) this.stepTrainee(w);
    if (tr.steps % 5 === 0) {
      const cap = Math.max(tr.cap || 1, G.party.active.reduce((a, m) => Math.max(a, m.level), 1));
      for (const id of tr.ids) { const m = G.party.get(id); if (!m || m.level >= cap) continue; m.gainExp(Math.max(8, Math.floor((EXP_TABLE[Math.min(99, m.level + 1)] - EXP_TABLE[m.level]) / 24))); if (m.level > cap) m.level = cap; }
    }
    if (tr.stepsLeft <= 0) tr.done = true;
  }
  // can a trainee stand here? deliberately not blocked(), which answers for the player and their ship
  trainWalkable(x, y) {
    const M = this.map; if (!M.inb(x, y)) return false;
    const t = M.get(x, y); if (t.water || t.place || M.isSolid(x, y)) return false;
    if (M.objects.some(o => !o.gone && o.x === x && o.y === y && this.objectSolid(o))) return false;
    if (this.player.tx === x && this.player.ty === y) return false;
    return !this.npcs.some(n => n.tx === x && n.ty === y);
  }
  // one step of a trainee's own wandering, on a leash around the camp
  stepTrainee(w) {
    const a = this.npcs.find(n => n.trainee && n.id === 'train_' + w.id);
    if (!a || G.mapId !== Camp.WORLD.map) return;
    const A = Camp.WORLD, far = Math.abs(a.tx - A.x) > 6 || Math.abs(a.ty - A.y) > 6;
    // they work in bursts and stand about between them, like anyone else you meet in a field
    if (!far && rnd(5) < 2) { if (!rnd(3)) a.dir = rnd(4); w.dir = a.dir; return; }
    const d = far ? this.dirTo(a, { tx: A.x, ty: A.y }) : rnd(4);
    if (this.trainWalkable(a.tx + DX[d], a.ty + DY[d])) { a.path = [d]; a.pathSpeed = 0.6; }
    else a.dir = d;
    w.x = a.tx; w.y = a.ty; w.dir = a.dir;
  }
  // a free tile to drop a trainee on, working outwards from wherever they were last seen
  trainSpot(x, y) {
    for (let r = 0; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (this.trainWalkable(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    }
    return null;
  }
  spawnTrainees() {
    const tr = G.get('training'); if (!tr || tr.done || tr.stepsLeft <= 0) return;
    if (G.mapId !== Camp.WORLD.map) return;
    for (const w of tr.walkers || []) {
      const m = G.party.get(w.id); if (!m || !CHARACTERS[w.id]) continue;
      const spot = this.trainSpot(w.x, w.y); if (!spot) continue;
      w.x = spot.x; w.y = spot.y;
      const a = this.spawnNpc('train_' + w.id, spot.x, spot.y, {
        look: CHARACTERS[w.id].look, name: m.name,   // solid, like anyone else standing in a field
        text: () => { const t = G.get('training'); const lines = (typeof TRAINING_TALK !== 'undefined' && TRAINING_TALK[w.id]) || { on: ['...'], end: ['...'] }; return pick(t && t.stepsLeft > 90 ? lines.on : lines.end); }
      });
      a.trainee = true; a.dir = w.dir === undefined ? DIR.DOWN : w.dir;
    }
  }
  // the trip is over: they make their own way back to the camp and word reaches the party wherever it is
  finishTraining(tr) {
    if (this.event || this.textbox.active || this.psyMenu || this.player.moving || Engine.top !== this) return;
    const back = tr.ids.map(id => G.party.get(id)).filter(Boolean);
    const start = tr.startLv || {};
    G.set('training', null);
    this.npcs = this.npcs.filter(n => !n.trainee);
    for (const m of back) m.fullRestore();
    if (G.mapId === 'camp') this.refreshNpcs();               // and they are among the tents again
    Audio.sfx('levelup');
    const names = back.map(m => m.name); const who = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
    const gains = back.map(m => m.name + ' Lv' + (start[m.id] === undefined ? m.level : start[m.id]) + ' to Lv' + m.level).join(', ');
    this.run(function* (E) {
      yield E.say(who + ' returned to the camp from training, rested and ready.');
      yield E.say(gains + '.');
    });
  }
  onPlayerStep() {
    const p = this.player, M = this.map;
    this.steps++;
    this.tickMimics();
    // the desert's heat, as in Lamakan: every step on the sand fills the gauge; when it is full the whole party
    // loses half its HP and it starts over; water - an oasis - cools them at once
    if (M.def.heat) {
      const t0 = M.get(p.tx, p.ty); const o0 = this.objectAt(p.tx, p.ty);
      if (t0.water || t0.kind === 'water' || (o0 && o0.kind === 'oasis' && (this.revealed(p.tx, p.ty) || G.flag('obj:' + o0.key + ':seen')))) this.heat = 0;
      else if (t0.kind === 'sand') { this.heat = Math.min(HEAT_MAX, (this.heat || 0) + (t0.softsand ? 3 : 2)); if (this.heat >= HEAT_MAX) { this.heat = 0; Engine.doShake(4); Audio.sfx('hit'); for (const m of G.party.members) if (m.alive) m.hp = Math.max(1, m.hp - Math.floor(m.hp / 2)); this.showNotice('The heat is unbearable!'); } }
    }
    // like the originals, HP and PP trickle back while walking: about 1% of each every 10 steps
    if (this.steps % 10 === 0) for (const m of G.party.members) { if (!m.alive) continue; m.heal(Math.max(1, Math.floor(m.maxHp() * 0.01))); m.restorePP(Math.max(1, Math.floor(m.maxPp() * 0.01))); }
    if (this.steps % 60 === 0 && typeof Reputation !== 'undefined') Reputation.decay(1);
    if (M.world && G.flag('hasShip')) {
      if (!this.ship && p.tx === G.get('shipX') && p.ty === G.get('shipY')) { this.ship = true; this.lastSea = { x: p.tx, y: p.ty }; G.set('onShip', true); Audio.play('sailing'); this.showNotice('Boarded the ship'); return; }
      if (this.ship && (M.get(p.tx, p.ty).water || M.get(p.tx, p.ty).name === 'w_dock')) this.lastSea = { x: p.tx, y: p.ty };   // where the ship last floated: where it stays when the party steps ashore
      if (this.ship && !M.get(p.tx, p.ty).water && M.get(p.tx, p.ty).name !== 'w_dock' && !(M.world && G.flag('ship_wings') && !G.flag('ship_on_water') && FieldScene.flyable(M.get(p.tx, p.ty)))) {   /* with the Wings of Anemos nothing puts the ship down but the player (A over land: landShip) - a beach crossed in the air is just crossed */ const prev = this.lastSea || { x: p.tx, y: p.ty }; this.ship = false; G.set('onShip', false); G.set('shipX', prev.x); G.set('shipY', prev.y); Audio.play(M.music); }
    }
    // a leaf over a web holds once: the step off it tears it, and the web below gives way from then on
    if (this.lastLeaf && !(this.lastLeaf.x === p.tx && this.lastLeaf.y === p.ty)) { const lf = this.lastLeaf; this.lastLeaf = null; if (!lf.gone) { lf.gone = true; G.set('obj:' + lf.key, { gone: true }); persistGround(M, lf.x, lf.y, lf.under || 'hole'); M.finalize(); Audio.sfx('cancel'); } }
    { const lf = this.objectAt(p.tx, p.ty); if (lf && lf.kind === 'leaf') this.lastLeaf = lf; }
    // exits
    for (const e of M.exits) {
      if (e.edge) continue;
      if (p.tx >= e.x && p.tx < e.x + e.w && p.ty >= e.y && p.ty < e.y + e.h) { if (e.cond && !e.cond()) continue; this.takeExit(e); return; }
    }
    // place tiles on world map
    const t = M.get(p.tx, p.ty);
    if (t.place && M.world) { const pl = (M.def.places || {})[p.tx + ',' + p.ty]; if (pl && (!this.ship || pl.ship || pl.ashore)) { if (pl.cond && !pl.cond()) { } else { if (this.ship) { G.set('shipX', p.tx); G.set('shipY', p.ty); } /* the ship stays parked where we went ashore */ const side = { [DIR.LEFT]: 'e', [DIR.RIGHT]: 'w', [DIR.UP]: 's', [DIR.DOWN]: 'n' }[p.dir]; const en = pl.from && pl.from[side]; /* a pass with a mouth on either side of its marker: the party comes in by the mouth it walked up to (from the east, moving west) */ this.takeExit(Object.assign({}, pl, { to: (en && en.map) || pl.map, tx: en ? en.tx : pl.tx, ty: en ? en.ty : pl.ty, dir: en ? en.dir : (pl.dir === undefined ? DIR.UP : pl.dir) })); return; } } }
    // triggers
    if (this.checkTriggers()) return;
    // the swamp's mud: every step in it sinks the party further; a bubble lifts them out, firm ground steadies them
    if (this.sandForm && !M.get(p.tx, p.ty).softsand) { this.sandForm = false; Audio.sfx('psy'); }   // Sand form ends where the soft sand does
    { const tt = M.get(p.tx, p.ty); if (tt.mud) { if (tt.bubble) { if (this.sink) Audio.sfx('water'); this.sink = 0; } else { this.sink = (this.sink || 0) + 1; if (this.sink >= (M.def.sinkDepth || 5)) { const self = this; this.sink = 0; this.run(function* (E) { Audio.sfx('push'); yield E.say('The mud closes over the party\'s heads!'); yield Engine.fadeOut(15); const d = M.def.mudStart || M.def.entry; E.warpNow(M.id, d.x, d.y, DIR.DOWN); yield 5; yield Engine.fadeIn(15); }); return; } } } else this.sink = 0; }
    // objects stepped on
    const o = this.objectAt(p.tx, p.ty);
    if (o) {
      if (o.kind === 'hoverpad' && G.party.hasPsy('Hover')) { }
      if (o.kind === 'djinni') { this.encounterDjinni(o); return; }
      // something that acts when trodden on: an oasis seen under Reveal, an Ant Lion under the sand (seen or not)
      if (o.kind === 'updraft' && this.updraftOn(o) && o.to && !this.event) { this.run(this.rideUpdraft(o)); return; }
      if (o.onStep && (o.kind === 'antlion' || !o.hiddenUntilReveal || this.revealed(o.x, o.y) || G.flag('obj:' + o.key + ':seen'))) { if (o.hiddenUntilReveal && o.key) G.set('obj:' + o.key + ':seen'); this.run(o.onStep); return; }
      if (o.kind === 'ice_slide') { }
      if (o.kind === 'hole') { }
    }
    // ladder/holes: falling
    if (t.hole && !this.hovering && !(this.sandForm && t.name === 'yd_slide') && !M.objects.some(ob => !ob.gone && ob.kind === 'icepillar' && ob.x === p.tx && ob.y === p.ty)) { const fallAt = (MM, q) => typeof MM.def.fall === 'function' ? MM.def.fall(q.tx, q.ty) : MM.def.fall; const dest = fallAt(M, this.player); if (dest) { const self = this; this.run(function* (E) { let d = dest, n = 0; while (d && n++ < 8) { Audio.sfx('jump'); yield Engine.fadeOut(10); E.warpNow(d.map || self.map.id, d.x !== undefined ? d.x : self.player.tx, d.y !== undefined ? d.y : self.player.ty, DIR.DOWN);   /* a fall with no map named lands on this one (a slide's foot) */ yield Engine.fadeIn(10); const M2 = self.map, q = self.player; if (!(M2.get(q.tx, q.ty).hole && M2.def.fall)) break; yield 10; d = fallAt(M2, q); } const u = self.objectAt(self.player.tx, self.player.ty); if (u && u.kind === 'updraft' && self.updraftOn(u) && u.to) { yield 10; yield* self.rideUpdraft(u)(E); } self.checkTriggers(); }); return; } }
    // ice sliding
    if (t.slippery && !this.event) { const d = p.dir; const nx = p.tx + DX[d], ny = p.ty + DY[d]; if (!this.blocked(nx, ny, p)) { this.startMove(p, d, SLIDE_SPEED); return; } }
    // encounters (none in the air: the winged ship over a reef or the land is out of any monster's reach)
    if (this.ship && !M.def.seaEnc) return;
    if (this.ship && this.flying()) return;
    const encList = this.ship ? (M.def.seaEncAt ? M.def.seaEncAt(p.tx, p.ty) : (M.def.seaEnc || [])) : (M.def.encAt ? M.def.encAt(p.tx, p.ty) : M.encounters);
    if (encList.length && (t.enc || this.ship || (!M.world && M.encounters && M.encounters.length)) && !this.event) {   // a dungeon with a monster list is dangerous on every floor it has
      if (G.party.avoidSteps > 0) { G.party.avoidSteps--; return; }
      if (G.flag('prologue_jenna')) return;   // The Lost Age's prologue: no random battles, only the Ruffians in the way
      this.encCounter -= t.encHigh ? 2 : 1;
      if (this.encCounter <= 0) { this.encCounter = 18 + rnd(30) + (M.encRate ? -M.encRate : 0); if (!G.noEncounters) this.randomEncounter(encList); }   // G.noEncounters: the world editor's peace
    }
  }
  checkTriggers(entering) {
    const p = this.player, M = this.map;
    for (const tr of M.triggers) {
      if (p.tx >= tr.x && p.tx < tr.x + tr.w && p.ty >= tr.y && p.ty < tr.y + tr.h) {
        if (tr.once && G.flag(tr.once)) continue; if (tr.cond && !tr.cond()) continue; if (tr.onEnterOnly && !entering) continue;
        if (tr.once) G.set(tr.once); const sc = tr.script; this.run(sc.length > 1 ? function* (E) { yield* sc(E, tr); } : sc); return true;
      }
    }
    return false;
  }
  takeExit(e) {
    const self = this;
    // walking out of the camp after a Hideout cast returns the party to the spot it left
    if (G.mapId === 'camp' && e.to !== 'camp') { const back = G.get('campReturn'); if (back) { G.set('campReturn', null); e = { to: back.map, tx: back.x, ty: back.y, dir: back.dir, ship: back.ship, keepShip: back.ship }; } }
    this.run(function* (E) { if (e.door) Audio.sfx('door'); else if (e.stairs) Audio.sfx('stairs'); yield Engine.fadeOut(e.door || e.stairs ? 10 : 14); self.loadMap(e.to, e.tx, e.ty, e.dir, { ship: e.ship, keepShip: e.keepShip }); yield 1; yield Engine.fadeIn(14); });
  }
  // the backdrop of a fight: the map's own, or on the world map whatever the party stands on - woods, snow, sand, the shore, the deck
  battleBgKey() {
    const M = this.map; if (!M || !M.world) return M ? M.battleBg : 'grass';
    if (this.ship) return 'water';
    const p = this.player; const t = M.get(p.tx, p.ty); const n = t.name;
    if (n === 'w_forest') return 'forest'; if (n === 'w_snow' || n === 'w_snowmtn') return 'snow'; if (n === 'w_desert') return 'desert_world'; if (n === 'w_beach') return 'shore';
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = M.inb(p.tx + dx, p.ty + dy) && M.get(p.tx + dx, p.ty + dy); if (q && q.water) return 'shore'; }
    return 'grass';
  }
  randomEncounter(list) {
    const groups = list; const pickGroup = pick(groups); const names = Array.isArray(pickGroup) ? pickGroup : [pickGroup];
    // group size 1-3 with duplicates
    const enemies = []; const n = names.length === 1 ? 1 + rnd(2) : names.length; for (let i = 0; i < n; i++) enemies.push(names.length === 1 ? names[0] : names[i]);
    const self = this;
    this.run(function* (E) { const r = yield* E.battle(enemies.slice(0, 5), { canFlee: true }); });
  }
  encounterDjinni(o) {
    const self = this;
    this.run(function* (E) {
      yield E.say('A ' + ELNAME[o.el] + ' Djinni! It wants to test your strength!');
      if (o.fight && ENEMY_DB[ELNAME[o.el] + ' Djinni ' + o.name]) { const r = yield* E.battle([ELNAME[o.el] + ' Djinni ' + o.name], { canFlee: false, bg: self.map.battleBg, boss: false }); if (r !== 'win') return; }
      o.gone = true; G.set('obj:' + o.key, { gone: true });
      yield* E.djinn(o.name);
    });
  }
  gameOver() { Engine.push(new GameOverScene()); }
  // ---------- interaction ----------
  facingTile() { const p = this.player; return { x: p.tx + DX[p.dir], y: p.ty + DY[p.dir] }; }
  challenge() {
    const { x, y } = this.facingTile();
    const n = this.npcs.find(a => !a.hidden && a.traveler && (a.tx === x && a.ty === y || (a.moving && a.destX === x && a.destY === y)));
    // facing one, or failing that standing beside one
    const near = n || this.npcs.find(a => !a.hidden && a.traveler && Math.abs(a.tx - this.player.tx) + Math.abs(a.ty - this.player.ty) === 1);
    if (near) this.challengeNpc(near);
  }
  challengeNpc(n) { n.dir = oppDir(this.player.dir); const d = n.traveler; this.run(function* (E) { yield* Travelers.challengeScript(E, d); }); }
  interact() {
    if (this.ship && this.map.world && G.flag('ship_wings') && !this.player.moving && this.map.get(this.player.tx, this.player.ty).water) { const down = !G.flag('ship_on_water'); G.set('ship_on_water', down); Audio.sfx('jump'); this.showNotice(down ? 'The ship settles onto the water. (A lifts it again.)' : 'The ship lifts into the air.'); return; }   /* over the sea: down onto the water to sail and fight, or up again */
    if (this.flying() && this.landShip()) return;   /* the winged ship sets down where it is: on any low land, the party steps off there and the ship waits on the spot */
    const { x, y } = this.facingTile(); const p = this.player; const M = this.map;
    // NPC
    let n = this.npcs.find(a => !a.hidden && a.tx === x && a.ty === y) || this.npcs.find(a => !a.hidden && a.moving && a.destX === x && a.destY === y);
    // across a counter or through bars: the one standing just beyond them
    if (!n) { const bo = M.getObj(x, y); if (bo && (bo.name === 'counter' || bo.name === 'bars' || bo.kind === 'fence')) {   /* across a counter, or through the bars of a cell */ const x2 = x + DX[p.dir], y2 = y + DY[p.dir]; n = this.npcs.find(a => !a.hidden && a.tx === x2 && a.ty === y2); } }
    if (n) { this.talk(n); return; }
    // chest
    const ch = M.chests.find(c => c.x === x && c.y === y);
    if (ch && !(ch.hidden && !G.flag(ch.key) && !this.revealed(ch.x, ch.y))) { this.openChest(ch); return; }
    // sign
    const sg = M.signs.find(s => s.x === x && s.y === y);
    if (sg) { this.run(function* (E) { yield E.say(typeof sg.text === 'function' ? sg.text() : sg.text); }); return; }
    // objects (one that Reveal has not shown yet is not there to be touched)
    const o0 = this.objectAt(x, y); const o = o0 && o0.hiddenUntilReveal && !this.revealed(x, y) && !G.flag('obj:' + o0.key + ':seen') ? null : o0;
    if (o && o.hiddenUntilReveal && o.key) G.set('obj:' + o.key + ':seen');
    if (o) { if (o.script) { this.run(o.script); return; } if (o.kind === 'gate' && o.state !== 'open') { this.run(function* (E) { yield E.say('A sealed stone door. It does not move; something else must open it.'); }); return; } if (o.kind === 'pillar' || o.kind === 'crate') { this.run(function* (E) { yield E.say("A heavy " + (o.kind === 'pillar' ? 'stone pillar' : 'crate') + ". Maybe Psynergy could move it."); }); return; } if (o.kind === 'boulder') { this.run(function* (E) { yield E.say("A large boulder blocks the way."); }); return; } if (o.kind === 'stump') { this.run(function* (E) { yield E.say("A hollow tree stump."); }); return; } if (o.kind === 'djinni') { this.encounterDjinni(o); return; } if (o.kind === 'lever') { this.run(o.onPull || function* (E) { yield E.say('A lever.'); }); return; } if (o.kind === 'catchable') { const saveObj = (ob) => G.set('obj:' + ob.key, { x: ob.x, y: ob.y, gone: ob.gone, state: ob.state }); o.gone = true; saveObj(o); G.inventory.add(o.item); Audio.sfx('item'); this.run(function* (E) { yield E.say('Picked up ' + o.item + '!'); }); return; } }
    // tile interactions
    const t = M.get(x, y), ot = M.getObj(x, y);
    if (ot && ot.psystone) { this.run(function* (E) { yield* E.psyStone(); }); return; }
    if (ot && ot.book) { this.run(function* (E) { yield E.say(pick(["It's a book about Alchemy.", "'The four elements: Venus, Mercury, Mars and Jupiter...'", "'Adepts draw power from the elements through Psynergy.'", "'Long ago, the world was ruled by Alchemy...'"])); }); return; }
    if (ot && ot.bed) { this.run(function* (E) { yield E.say("A comfortable-looking bed."); }); return; }
    if (t.save) { this.run(function* (E) { yield* E.gameSave(); }); return; }
    const beaconTile = ot && ot.beacon !== undefined ? ot : (t.beacon !== undefined ? t : null);
    if (beaconTile && M.def.onBeacon) { this.run(M.def.onBeacon); return; }
    if (M.def.onInteract) { const r = M.def.onInteract(x, y, this); if (r) { this.run(r); return; } }
  }
  talk(n) {
    const npc = n.npc; if (!npc) return; const self = this;
    n.dir = oppDir(this.player.dir);
    if (npc.script) { this.run(npc.script); return; }
    if (npc.shop) { this.run(function* (E) { if (npc.onShop) npc.onShop(); yield* E.shop(npc.shop); }); return; }
    if (npc.inn) { this.run(function* (E) { yield* E.inn(npc.inn); }); return; }
    if (npc.sanctum) { this.run(function* (E) { yield* E.sanctum(); }); return; }
    let text = npc.text; if (typeof text === 'function') text = text();
    if (text === undefined || text === null) text = '...';
    const name = npc.name || (NPC_LOOKS[npc.id] ? npc.id : null);
    this.run(function* (E) { const lines = Array.isArray(text) ? text : [text]; for (const l of lines) yield E.say(l, name); });
  }
  openChest(ch) {
    if (G.flag(ch.key)) { this.run(function* (E) { yield E.say('The chest is empty.'); }); return; }
    const self = this;
    this.run(function* (E) {
      if (ch.mimic) { yield E.say("It's a Mimic!"); const r = yield* E.battle([ch.mimic], { canFlee: false }); if (r !== 'win') return; }
      G.set(ch.key); self.map.setObj(ch.x, ch.y, 'chest_open'); Audio.sfx('chest');
      if (ch.coins) { G.party.coins += ch.coins; yield E.say('Found ' + ch.coins + ' coins!'); }
      else if (SUMMONS[ch.item]) { yield E.say('Found a Summon Tablet!'); yield E.summon(ch.item); }
      else { G.inventory.add(ch.item, ch.qty); yield E.say('Found ' + (ch.qty > 1 ? ch.qty + ' ' : '') + ch.item + '!'); if (ITEM_DB[ch.item].grants) yield E.say('Give the ' + ch.item + ' to a party member to bestow the Psynergy ' + ITEM_DB[ch.item].grants + '.'); }
      if (ch.onOpen) yield* ch.onOpen(E);
    });
  }
  // ---------- field psynergy ----------
  openPsyMenu() {
    const list = [];
    const tag = (p) => G.quick.q1 === p ? '[A] ' : G.quick.q2 === p ? '[S] ' : '';
    for (const m of G.party.active) { if (!m.alive) continue; for (const p of m.psynergy()) { const P = PSY[p]; if ((P.field || P.fieldOnly) && !list.some(l => l.id === p)) list.push({ label: tag(p) + p, id: p, right: P.pp, disabled: m.pp < P.pp, who: m, color: tint(ELCOLOR[psyEl(P)], 0.4) }); } }
    if (!list.length) { this.showNotice('No field Psynergy available.'); return; }
    this.psyMenu = new MenuList(list, { x: 8, y: 8, w: 100, rows: 8, lineH: 10 }); this.noticeT = 0; Audio.sfx('confirm');
  }
  updatePsyMenu() {
    const m = this.psyMenu;
    for (const q of ['q1', 'q2']) if (Input.pressed(q)) { const it = m.current; if (!it) return; for (const o of ['q1', 'q2']) if (G.quick[o] === it.id) delete G.quick[o]; G.quick[q] = it.id; Audio.sfx('confirm'); this.psyMenu = null; this.showNotice(it.id + ' set to ' + (q === 'q1' ? 'A' : 'S') + '.'); return; }
    m.update();
    if (m.cancelled) { this.psyMenu = null; return; }
    if (m.chosen) { const it = m.chosen; this.psyMenu = null; this.usePsy(it.id, it.who); }
  }
  showNotice(t) { this.notice = t; this.noticeT = 90; }
  usePsy(name, who) {
    const P = PSY[name]; const self = this; const { x, y } = this.facingTile(); const M = this.map; const o = this.objectAt(x, y);
    const caster = who || G.party.whoHasPsy(name)[0]; if (!caster || caster.pp < P.pp) { this.showNotice(G.party.active.some(m => m.alive && m.hasPsy(name)) ? 'Not enough PP.' : 'No one can use ' + name + '.'); return; }
    const spend = () => { caster.pp -= P.pp; Audio.sfx('psy'); this.psyFx = { name, x, y, t: 0, el: psyEl(P), dir: this.player.dir, cx: this.player.tx, cy: this.player.ty }; if (name === 'Pound' || name === 'Tremor') Engine.doShake(name === 'Pound' ? 8 : 14); };
    const fail = () => { this.showNotice('Nothing happened.'); Audio.sfx('buzz'); };
    const saveObj = (ob) => G.set('obj:' + ob.key, { x: ob.x, y: ob.y, gone: ob.gone, state: ob.state });
    // map-specific hooks first
    if (M.def.onPsy) { const r = M.def.onPsy(name, x, y, this, o); if (r === true) { spend(); return; } if (r && typeof r === 'function') { spend(); this.run(r); return; } }
    // the class items' Psynergy (Lockpick, Grapple, Lantern...: js/game/class_ext.js)
    if (typeof ClassExt !== 'undefined' && ClassExt.field[name]) { if (ClassExt.field[name](this, { x, y, o, M, spend, fail, saveObj, caster }) !== 'pass') return; }
    switch (name) {
      case 'Move': {
        // as in the games: the hand settles on the thing, and the next direction pressed is the way it is shoved
        const movable = (ob) => ob && (ob.kind === 'pillar' || ob.kind === 'crate' || ob.kind === 'statue_move') && !ob.fixed && ob.state !== 'sunk' && ob.state !== 'seated' && ob.state !== 'set' && !(ob.hot && ob.state !== 'cool');
        if (movable(o)) { spend(); this.psyFx = null; this.moveAim = { o, t: 0, saveObj }; return; }
        // the hand reaches over a gap: a thing on the far side of a pit or a stretch of water can be moved too
        const t0 = M.get(x, y); if (!o && (t0.kind === 'pit' || t0.water)) { const d = this.player.dir; const o2 = this.objectAt(x + DX[d], y + DY[d]); if (movable(o2)) { spend(); this.psyFx = null; this.moveAim = { o: o2, t: 0, saveObj }; return; } }
        fail(); return;
      }
      case 'Lift': { if (o && o.kind === 'boulder') { spend(); o.gone = true; saveObj(o); Audio.sfx('push'); if (o.onLift) this.run(o.onLift); return; } fail(); return; }
      case 'Frost': { if (o && o.kind === 'steam' && o.state === 'wet') { spend(); o.kind = 'icepillar'; o.state = 'ice'; delete o.evap; G.set('obj:' + o.key, { state: 'ice', kind: 'icepillar' }); return; }
        if (o && o.kind === 'puddle') { spend(); o.kind = 'icepillar'; o.state = 'ice'; G.set('obj:' + o.key, { state: 'ice', kind: 'icepillar' }); if (o.onFrost) this.run(o.onFrost); return; } if (M.get(x, y).puddle) { spend(); M.objects.push({ kind: 'icepillar', x, y, key: M.id + ':ice:' + x + ',' + y, state: 'ice' }); persistGround(M, x, y, (M.get(this.player.tx, this.player.ty).puddle ? null : M.get(this.player.tx, this.player.ty).name) || (M.get(x, y).name === 'puddle_cave' ? 'cave' : 'grass')); persistObjTile(M, x, y, 'icepillar'); persistWalkable(M, x, y); M.finalize(); return; } fail(); return; }
      case 'Growth': { if (o && o.kind === 'sprout') { spend(); o.gone = true; saveObj(o); if (o.onGrow) this.run(o.onGrow); let yy = y; while (yy >= 0 && M.isSolid(x, yy - 1) && (M.getObj(x, yy - 1) && (M.getObj(x, yy - 1).kind === 'wall' || M.getObj(x, yy - 1).kind === 'walltop' || M.getObj(x, yy - 1).kind === 'clifftop' || M.getObj(x, yy - 1).kind === 'cliff' || M.getObj(x, yy - 1).name === 'cliff'))) { persistObjTile(M, x, yy, 'vineladder'); persistWalkable(M, x, yy); yy--; } persistObjTile(M, x, yy, 'vineladder'); persistWalkable(M, x, yy); if (o.top !== undefined) { for (let k = o.top; k <= y; k++) { persistObjTile(M, x, k, 'vineladder'); persistWalkable(M, x, k); } } M.finalize(); return; } fail(); return; }
      case 'Whirlwind': case 'Gale': case 'Cyclone': { if (o && (o.kind === 'windstone' || o.kind === 'twister')) { spend(); Engine.doShake(6); Audio.sfx('psy'); if (o.onWind) this.run(o.onWind); return; }
        // Cyclone sweeps the whole patch round the party (two squares out, over rocks and gaps), as in The Lost Age; Whirlwind and Gale take the one thing in front
        const swept = name === 'Cyclone' ? M.objects.filter(ob => !ob.gone && ob.kind === 'leaves' && ob !== o && Math.max(Math.abs(ob.x - this.player.tx), Math.abs(ob.y - this.player.ty)) <= 2) : [];
        const clear = (ob) => { ob.gone = true; saveObj(ob); if (ob.kind === 'vines') { persistObjTile(M, ob.x, ob.y, ob.reveal || null); M.finalize(); } if (ob.onClear) this.run(ob.onClear); };
        if (o && (o.kind === 'vines' || o.kind === 'leaves')) { spend(); clear(o); for (const ob of swept) clear(ob); return; }
        if (swept.length) { spend(); for (const ob of swept) clear(ob); return; }
        fail(); return; }
      case 'Douse': { if (o && o.kind === 'waterstone' && o.state !== 'wet') { spend(); o.state = 'wet'; saveObj(o); Audio.sfx('water'); if (o.onDouse) this.run(o.onDouse); return; }
        if (o && o.kind === 'pillar' && o.hot && o.state !== 'cool') { spend(); o.state = 'cool'; saveObj(o); Audio.sfx('water'); if (o.onDouse) this.run(o.onDouse); return; }
        if (o && o.kind === 'steam' && o.state !== 'wet') { spend(); Audio.sfx('water'); o.state = 'wet'; o.evap = 150; return; }
        if (o && o.kind === 'pillar' && o.douseable && o.state !== 'wet') { spend(); o.state = 'wet'; saveObj(o); Audio.sfx('water'); if (o.onDouse) this.run(o.onDouse); return; } if (o && o.kind === 'fire') { spend(); o.gone = true; saveObj(o); if (o.onDouse) this.run(o.onDouse); return; } if (o && o.kind === 'dryplant') { spend(); o.gone = true; saveObj(o); if (o.onDouse) this.run(o.onDouse); return; } fail(); return; }
      case 'Force': { if (o && o.kind === 'log' && o.onForce) { spend(); Engine.doShake(8); o.gone = true; saveObj(o); this.run(o.onForce); return; } if (o && (o.kind === 'stump' || o.kind === 'block')) { spend(); Engine.doShake(8); if (o.onForce) this.run(o.onForce); else if (o.kind === 'block') { o.gone = true; saveObj(o); } return; } fail(); return; }
      case 'Reveal': { spend(); this.reveal = REVEAL_FRAMES; for (const ob of M.objects) { if (ob.hiddenUntilReveal && ob.key && !ob.gone && this.revealed(ob.x, ob.y)) G.set('obj:' + ob.key + ':seen'); }   /* what true sight has shown once stays known */ return; }
      case 'Mind Read': { const n = this.npcs.find(a => a.tx === x && a.ty === y); if (n && n.npc) { spend(); if (n.npc.onMind) { this.run(n.npc.onMind); return; } const mind = n.npc.mind || "I can't read anything in this one's heart."; this.run(function* (E) { yield* E.mindRead(typeof mind === 'function' ? mind() : mind, n.npc.name || n.id); }); return; } fail(); return; }
      case 'Catch': { if (o && o.kind === 'catchable' && !(o.hiddenUntilReveal && !this.revealed(x, y) && !G.flag('obj:' + o.key + ':seen'))) { spend(); o.gone = true; saveObj(o); G.inventory.add(o.item); Audio.sfx('item'); this.run(function* (E) { yield E.say('Caught ' + o.item + '!'); }); return; } fail(); return; }
      case 'Carry': { if (this.carrying) { const t = M.get(x, y); if (!o && t.hop && (t.kind === 'pit' || t.kind === 'gap')) { spend(); const c = this.carrying; c.x = x; c.y = y; c.state = 'bridge'; this.carrying = null; saveObj(c); Audio.sfx('push'); if (c.onPlace) this.run(c.onPlace); return; } if (!this.blocked(x, y) && !o) { spend(); const c = this.carrying; c.x = x; c.y = y; c.state = 'placed'; this.carrying = null; saveObj(c); if (c.onPlace) this.run(c.onPlace); return; } fail(); return; } if (o && o.kind === 'carriable') { spend(); o.state = 'carried'; this.carrying = o; o.x = -1; o.y = -1; return; } fail(); return; }
      case 'Halt': { const n = this.npcs.find(a => a.tx === x && a.ty === y || (a.moving && a.destX === x && a.destY === y)); if (n && n.npc && n.npc.haltable) { spend(); n.halted = 300; n.path = []; n.move = n.npc.move === 'patrol' ? 'halted' : 'static'; if (n.npc.onHalt) this.run(n.npc.onHalt); return; } fail(); return; }
      case 'Cloak': { spend(); this.cloaked = 900; return; }
      case 'Avoid': { spend(); G.party.avoidSteps = 200; this.showNotice('Monsters will avoid you.'); return; }
      // Felix and Isaac know the road back to the camp from anywhere; stepping out of it puts you where you stood
      case 'Hideout': {
        if (!G.flag('camp_founded') || G.mapId === 'camp' || M.noEscape) { fail(); return; }
        spend();
        G.set('campReturn', { map: G.mapId, x: this.player.tx, y: this.player.ty, dir: this.player.dir, ship: !!this.ship });
        this.run(function* (E) { yield Engine.fadeOut(20); E.warpNow('camp', 13, 19, DIR.UP); yield Engine.fadeIn(20); });
        return;
      }
      case 'Retreat': {
        // to the place the map names, else out through its door to the world, else back to where the party came in
        let rt = M.def.retreat; if (!rt) { const ex = M.exits.find(e => /^world_/.test(e.to)); if (ex) rt = { map: ex.to, x: ex.tx, y: ex.ty, dir: ex.dir === undefined ? DIR.DOWN : ex.dir }; else if (M.def.entry) rt = { map: M.id, x: M.def.entry.x, y: M.def.entry.y, dir: DIR.DOWN }; }
        if (rt && !M.noEscape) { spend(); this.run(function* (E) { yield Engine.fadeOut(15); E.warpNow(rt.map, rt.x, rt.y, rt.dir); yield Engine.fadeIn(15); }); return; } fail(); return; }
      case 'Lash': { if (o && o.kind === 'rope') { spend(); o.state = 'tied'; saveObj(o); for (let k = 0; k < (o.len || 3); k++) { const rx = o.x + (o.dx || 0) * k, ry = o.y + (o.dy === undefined ? -1 : o.dy) * k; persistObjTile(M, rx, ry, o.dx ? 'ropeh' : 'rope'); persistWalkable(M, rx, ry); } M.finalize(); if (o.onLash) this.run(o.onLash); return; } fail(); return; }
      case 'Pound': { if (o && o.kind === 'condtile') { if (o.up && o.onPound) { spend(); this.run(o.onPound); } else fail(); return; } if (o && o.kind === 'pillar' && o.poundable !== false) { spend(); o.state = 'sunk'; saveObj(o); Engine.doShake(6); Audio.sfx('push'); if (o.onPound) this.run(o.onPound); return; } fail(); return; }
      case 'Scoop': { if (o && o.kind === 'scoop') { spend(); o.gone = true; saveObj(o); if (o.item) { G.inventory.add(o.item); this.run(function* (E) { yield E.say('Dug up ' + o.item + '!'); }); } if (o.coins) { G.party.coins += o.coins; Audio.sfx('item'); this.run(function* (E) { yield E.say('Dug up ' + o.coins + ' coins!'); }); } if (o.onScoop) this.run(o.onScoop); if (o.hole) { persistGround(M, x, y, 'dk_hole'); persistWalkable(M, x, y); G.set('obj:' + o.key + ':open'); M.finalize(); } if (o.ladder) { persistGround(M, x, y, 'stairs_down'); M.finalize(); } return; } fail(); return; }
      case 'Sand': { if (M.get(this.player.tx, this.player.ty).softsand || M.get(x, y).softsand) { spend(); this.sandForm = true; return; } fail(); return; }
      case 'Burst': { if (o && o.kind === 'crack') { spend(); o.gone = true; saveObj(o); Engine.doShake(10); Audio.sfx('boom'); persistObjTile(M, o.x, o.y, o.reveal || null); M.finalize(); if (o.onBurst) this.run(o.onBurst); return; } fail(); return; }
      case 'Grind': { if (o && o.kind === 'rock_water') { spend(); o.state = 'sunk'; saveObj(o); Audio.sfx('water'); if (o.sunkGround !== null) persistGround(M, o.x, o.y, o.sunkGround || 'pillar_fallen'); if (o.flag) G.set(o.flag); M.finalize(); return; }   /* sunkGround: what the rock leaves - a stepping stone, or (null) the water it sank in */ fail(); return; }
      case 'Hover': { const here = this.objectAt(this.player.tx, this.player.ty); if (here && here.kind === 'hoverpad') { spend(); this.hovering = true; this.hoverT = 180; this.hoverFrom = { x: this.player.tx, y: this.player.ty }; if (here.onHover) this.run(here.onHover); return; } fail(); return; }
      case 'Parch': { if (o && (o.kind === 'waterstone' || o.kind === 'pillar') && o.parchable && o.state !== 'dry') { spend(); o.state = 'dry'; saveObj(o); Audio.sfx('psy'); if (o.onParch) this.run(o.onParch); return; }
        if (o && o.kind === 'pool') { spend(); o.gone = true; saveObj(o); if (o.dryTile) { for (const [px, py] of o.tiles || [[x, y]]) persistGround(M, px, py, o.dryTile); M.finalize(); } if (o.onParch) this.run(o.onParch); return; } fail(); return; }
      case 'Blaze': { if (o && o.kind === 'torch') { spend(); o.state = 'lit'; saveObj(o); if (o.onLit) this.run(o.onLit); return; } if (o && o.kind === 'burnable') { spend(); o.gone = true; saveObj(o); if (o.onBurn) this.run(o.onBurn); return; } fail(); return; }
      case 'Tremor': { if (o && o.kind === 'shakeable') { spend(); Engine.doShake(10); o.gone = true; saveObj(o); if (o.onShake) this.run(o.onShake); return; } fail(); return; }
      case 'Teleport': { const here = this.objectAt(this.player.tx, this.player.ty); const c = (o && o.kind === 'tpcircle') ? o : (here && here.kind === 'tpcircle') ? here : null; if (c && !(c.hiddenUntilReveal && !this.revealed(c.x, c.y) && !G.flag('obj:' + c.key + ':seen'))) { spend(); if (c.onTeleport) this.run(c.onTeleport); else this.run(function* (E) { Audio.sfx('psy'); yield Engine.fadeOut(12); E.warpNow(c.to.map, c.to.x, c.to.y, c.to.dir === undefined ? DIR.DOWN : c.to.dir); yield Engine.fadeIn(12); }); return; }   /* a circle in the floor carries the party to its twin */ if (G.flag('teleportUnlocked')) { spend(); Engine.push(new TeleportScene(this)); return; } fail(); return; }
      default: {
        if (P.type === 'heal' || P.type === 'cure' || P.type === 'revive') { Engine.push(new MenuScene(this, { psyField: name, caster })); return; }
        fail();
      }
    }
  }
  // ---------- camera & draw ----------
  updateCamera(snap) {
    // camFocus (tile coords, set by E.pan) overrides the player as the camera target; camEase glides between targets
    const p = this.player, fo = this.camFocus; const tx = (fo ? fo.x * TILE + 8 : p.px + 8) - SCREEN_W / 2, ty = (fo ? fo.y * TILE + 8 : p.py + 8) - SCREEN_H / 2;
    const mx = Math.max(0, this.map.w * TILE - SCREEN_W), my = Math.max(0, this.map.h * TILE - SCREEN_H);
    const cx = clamp(tx, 0, mx), cy = clamp(ty, 0, my);
    if (snap || !this.camEase) { this.cam.x = cx; this.cam.y = cy; this.camEase = false; return; }
    const fx = this.camFx === undefined ? this.cam.x : this.camFx, fy = this.camFy === undefined ? this.cam.y : this.camFy;
    this.camFx = fx + (cx - fx) * 0.12; this.camFy = fy + (cy - fy) * 0.12; this.cam.x = Math.round(this.camFx); this.cam.y = Math.round(this.camFy);
    if (Math.abs(cx - this.camFx) < 0.5 && Math.abs(cy - this.camFy) < 0.5) { this.cam.x = cx; this.cam.y = cy; this.camEase = false; this.camFx = this.camFy = undefined; }
  }
  // a tsunami crest sweeping from the top of the screen to the bottom, deep water behind it, spray ahead of it
  drawWave(g) {
    const w = this.wave, k = w.t / w.dur; const crest = -40 + k * (SCREEN_H + 100);
    g.fillStyle = '#1c48a8'; g.fillRect(0, -10, SCREEN_W, crest + 10);
    for (let x = 0; x < SCREEN_W; x += 4) {
      const lift = Math.sin(x * 0.11 + w.t * 0.3) * 3 + Math.sin(x * 0.037 - w.t * 0.2) * 5;
      g.fillStyle = '#3070d0'; g.fillRect(x, crest + lift - 12, 4, 20);
      g.fillStyle = '#9ad0ff'; g.fillRect(x, crest + lift + 4, 4, 6);
      g.fillStyle = '#ffffff'; g.fillRect(x, crest + lift + 8, 4, 4 + ((x >> 2) % 3));
      if (((x >> 2) + w.t) % 5 === 0) { g.fillRect(x + 1, crest + lift + 16 + ((x * 7 + w.t * 3) % 14), 2, 2); }   // flung spray
    }
    if (w.t > w.dur - 12) { g.fillStyle = '#ffffff'; g.globalAlpha = (w.t - (w.dur - 12)) / 12; g.fillRect(0, 0, SCREEN_W, SCREEN_H); g.globalAlpha = 1; }
  }
  // the piece of a fence set for this tile: rails run toward every neighbour that is the same fence or its gate
  // a stair or a waterfall is one thing, not a stack of copies: the piece drawn for a tile is chosen by which of
  // its neighbours (in the same layer) are the same tile - rows t/m/b by columns l/c/r/s (s = a single column)
  autoPiece(M, x, y, t, layer) {
    const same = (dx, dy) => { if (!M.inb(x + dx, y + dy)) return false; const i = M.idx(x + dx, y + dy); const id = layer === 'obj' ? M.obj[i] : M.ground[i]; return !!id && Tiles.byId[id].name === t.name; };
    const n = same(0, -1), so = same(0, 1), e = same(1, 0), w = same(-1, 0);
    const piece = (n && so ? 'm' : n ? 'b' : so ? 't' : 'm') + (e && w ? 'c' : w ? 'r' : e ? 'l' : 's');
    return Tiles.defs[t.name + '_' + piece] || null;
  }
  fencePiece(M, x, y, set) {
    const same = (dx, dy) => { if (!M.inb(x + dx, y + dy)) return false; const o = M.obj[M.idx(x + dx, y + dy)]; if (!o) return false; const t = Tiles.byId[o]; return t.autofence === set || t.name.startsWith(set + '_gate') || (set === 'fence' && t.name.startsWith('wooden_arch')); };
    const edges = (same(0, -1) ? 'n' : '') + (same(0, 1) ? 's' : '') + (same(1, 0) ? 'e' : '') + (same(-1, 0) ? 'w' : '');
    if (set === 'hedge') { const pick = { ns: 'hedge_ns', ew: 'hedge_ew', ne: 'hedge_ne', nw: 'hedge_nw', se: 'hedge_se', sw: 'hedge_sw' }[edges]; return Tiles.defs[pick || (edges === 'n' || edges === 's' ? 'hedge_ns' : 'hedge_ew')] || null; }
    return Tiles.defs[set + '_' + (edges || 'o')] || null;
  }
  drawTile(g, tile, sx, sy) { const f = tile.frames.length > 1 ? Math.floor(this.frame / 12) % tile.frames.length : 0; g.drawImage(tile.frames[f], sx, sy); }
  draw(g) {
    const M = this.map, cam = this.cam; const x0 = Math.floor(cam.x / TILE), y0 = Math.floor(cam.y / TILE), x1 = Math.min(M.w - 1, x0 + Math.ceil(SCREEN_W / TILE)), y1 = Math.min(M.h - 1, y0 + Math.ceil(SCREEN_H / TILE));
    g.fillStyle = M.indoor ? '#000' : (M.world ? '#2858c8' : '#101018'); g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    // ground
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = M.idx(x, y); const t = Tiles.byId[M.ground[i]]; const sx = x * TILE - cam.x, sy = y * TILE - cam.y;
      // a drawn road turns to follow its neighbours; a drawn alternate lands on roughly a quarter of the tiles, fixed
      // by position, so wide fields do not visibly repeat
      let road = null;
      if (t.name === 'w_road' && M.world) {
        const rd = (dx, dy) => { if (!M.inb(x + dx, y + dy)) return false; const n = M.get(x + dx, y + dy); return n.name === 'w_road' || n.place || n.kind === 'bridge'; };
        const n = rd(0, -1), s = rd(0, 1), e = rd(1, 0), w = rd(-1, 0);
        if (Tiles.roads) {
          // the piece whose name lists the sides the road runs on, on whatever ground surrounds it most
          let sand = 0, snow = 0, other = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if ((dx || dy) && M.inb(x + dx, y + dy)) { const q = M.get(x + dx, y + dy); if (q.name === 'w_road' || q.place) continue; if (q.kind === 'sand') sand++; else if (q.kind === 'snow' || q.name === 'w_snowmtn') snow++; else other++; } }
          const set = sand > other && sand >= snow ? 'sand' : snow > other ? 'snow' : 'grass';
          road = (Tiles.roads[set] || Tiles.roads.grass || {})[((n ? 'n' : '') + (s ? 's' : '') + (e ? 'e' : '') + (w ? 'w' : '')) || 'o'] || null;
        }
        if (!road && t.across) { const h = e || w, v = n || s; road = h && v ? t.cross : h ? t.across : null; }   // only the first sheet: turn the strip
      }
      if (road) g.drawImage(road, sx, sy);
      // a stair is one flight, not a stack of crates: its piece is chosen by which sides of it are stair too
      else if (t.auto) { const pt = this.autoPiece(M, x, y, t, 'ground'); if (pt) { this.drawTile(g, pt, sx, sy); continue; } }
      else if (t.variant && ((x * 7 + y * 13 + x * y) % 9) < 2) g.drawImage(t.variant, sx, sy); else this.drawTile(g, t, sx, sy);
      // autotile edges: foam on the side of water that touches land; the world map's drawn set has corner pieces too
      if (t.water) {
        const land = (dx, dy) => { const n = M.inb(x + dx, y + dy) ? Tiles.byId[M.ground[M.idx(x + dx, y + dy)]] : t; return !n.water && n.kind !== 'bridge'; };
        const E = Tiles.edges, n = land(0, -1), s = land(0, 1), w = land(-1, 0), e = land(1, 0);
        if (M.world && E.w_shore_n) {
          const nw = n && w, ne = n && e, sw = s && w, se = s && e;
          if (nw) g.drawImage(E.w_shore_nw, sx, sy); if (ne) g.drawImage(E.w_shore_ne, sx, sy); if (sw) g.drawImage(E.w_shore_sw, sx, sy); if (se) g.drawImage(E.w_shore_se, sx, sy);
          if (n && !nw && !ne) g.drawImage(E.w_shore_n, sx, sy); if (s && !sw && !se) g.drawImage(E.w_shore_s, sx, sy);
          if (w && !nw && !sw) g.drawImage(E.w_shore_w, sx, sy); if (e && !ne && !se) g.drawImage(E.w_shore_e, sx, sy);
          if (!n && !w && land(-1, -1)) g.drawImage(E.w_shore_in_nw, sx, sy); if (!n && !e && land(1, -1)) g.drawImage(E.w_shore_in_ne, sx, sy);
          if (!s && !w && land(-1, 1)) g.drawImage(E.w_shore_in_sw, sx, sy); if (!s && !e && land(1, 1)) g.drawImage(E.w_shore_in_se, sx, sy);
        } else if (E.pond_n) {
          const nw = n && w, ne = n && e, sw = s && w, se = s && e;
          if (nw) g.drawImage(E.pond_nw, sx, sy); if (ne) g.drawImage(E.pond_ne, sx, sy); if (sw) g.drawImage(E.pond_sw, sx, sy); if (se) g.drawImage(E.pond_se, sx, sy);
          if (n && !nw && !ne) g.drawImage(E.pond_n, sx, sy); if (s && !sw && !se) g.drawImage(E.pond_s, sx, sy);
          if (w && !nw && !sw) g.drawImage(E.pond_w, sx, sy); if (e && !ne && !se) g.drawImage(E.pond_e, sx, sy);
          if (!n && !w && land(-1, -1)) g.drawImage(E.pond_in_nw, sx, sy); if (!n && !e && land(1, -1)) g.drawImage(E.pond_in_ne, sx, sy);
          if (!s && !w && land(-1, 1)) g.drawImage(E.pond_in_sw, sx, sy); if (!s && !e && land(1, 1)) g.drawImage(E.pond_in_se, sx, sy);
        } else { if (n) g.drawImage(E.water_n, sx, sy); if (s) g.drawImage(E.water_s, sx, sy); if (w) g.drawImage(E.water_w, sx, sy); if (e) g.drawImage(E.water_e, sx, sy); }
      }
    }
    // objects layer with cliff faces
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = M.idx(x, y); const oid = M.obj[i]; const sx = x * TILE - cam.x, sy = y * TILE - cam.y;
      if (oid) { const t = Tiles.byId[oid]; if (!t.over) { this.drawTile(g, (t.autofence && this.fencePiece(M, x, y, t.autofence)) || (t.auto && this.autoPiece(M, x, y, t, 'obj')) || t, sx, sy); if (t.kind === 'wall' && y + 1 < M.h && !M.obj[M.idx(x, y + 1)]) g.drawImage(Tiles.edges.wall_shadow, sx, sy + TILE); } }
    }
    // hidden things (reveal): the truth shows only inside the circle of sight
    if (this.reveal > 0) { for (const h of M.hidden) { if (!this.revealed(h.x, h.y)) continue; const sx = h.x * TILE - cam.x, sy = h.y * TILE - cam.y; this.drawTile(g, Tiles.get(h.tile), sx, sy); } }
    // puzzle objects
    const objSprites = [];
    for (const o of M.objects) {
      if (o.gone) continue; const sx = o.x * TILE - cam.x, sy = o.y * TILE - cam.y; if (sx < -16 || sy < -16 || sx > SCREEN_W || sy > SCREEN_H) continue;
      if (o.hiddenUntilReveal && !this.revealed(o.x, o.y) && !G.flag('obj:' + o.key + ':seen')) continue;
      let tile = null;
      switch (o.kind) {
        case 'pillar': tile = o.state === 'sunk' ? (o.sunkTile !== undefined ? o.sunkTile : 'pillar_sunk') : o.tile ? (o.state === 'wet' ? (o.wetTile || o.tile) : o.tile) : o.state === 'wet' ? 'pillar_wet' : o.hot ? (o.state === 'cool' ? 'rock_cool' : 'rock_hot') : 'pillar'; break; case 'waterstone': tile = o.state === 'wet' ? (o.wetTile || 'aqua_stone_wet') : (o.tile || 'aqua_stone'); break; case 'steam': tile = o.state === 'wet' ? 'puddle_cave' : 'steam_vent'; break; case 'boulder': tile = M.get(o.x, o.y).kind === 'grass' ? 'boulder_grass' : 'boulder'; break; case 'crate': tile = 'crate'; break; case 'stump': tile = o.state === 'hole' ? 'stumphole' : 'stump'; break; case 'sprout': tile = 'sprout'; break; case 'vines': tile = 'vines'; break; case 'puddle': tile = M.get(o.x, o.y).kind === 'cave' ? 'puddle_cave' : 'puddle_top'; break; case 'icepillar': tile = 'icepillar'; break; case 'rope': if (o.state !== 'tied') tile = null; break; case 'crack': tile = o.tile || 'crack'; break; case 'scoop': tile = o.look || null; break; case 'leaves': tile = o.state === 'cleared' ? null : 'bush'; break; case 'hoverpad': tile = 'elem_jupiter'; break; case 'statue': case 'statue_move': tile = o.tile || 'statue'; break; case 'torch': tile = o.state === 'lit' ? (o.litTile || 'torch') : (o.tile || null); break; case 'rock_water': tile = o.state === 'sunk' ? null : (o.look || 'boulder'); break; case 'pool': tile = null; break; case 'chestobj': tile = 'chest'; break; case 'block': tile = 'rock_small'; break; case 'fire': tile = 'torch'; break; case 'gate': tile = o.state === 'open' ? (o.openTile || null) : (o.tile || 'gate_stone'); break; case 'lever': tile = 'lever'; break; case 'shakeable': tile = o.tile || 'statue'; break; case 'windstone': tile = o.tile || 'psystone'; break; case 'twister': tile = o.tile || 'obelisk'; break; case 'updraft': tile = this.updraftOn(o) ? (o.onTile || 'whirlwind') : (o.tile || null); break; case 'tornado': if (o.active === false || (typeof o.active === 'function' && !o.active())) continue; tile = o.tile || 'tornado'; break; case 'condtile': tile = 'cond_tile_' + (o.d || 0) + (o.up ? '_up' : ''); break; case 'sandwall': tile = o.tile || 'sandcliff_top'; break; case 'catchable': tile = o.look !== undefined ? o.look : 'pot'; break; case 'carriable': tile = o.state === 'carried' ? null : (o.state === 'bridge' ? 'pillar_fallen' : (o.tile || 'crate')); break; case 'burnable': tile = o.look || 'bush'; break; case 'dryplant': tile = 'sprout'; break; case 'gap': tile = null; break; case 'sandgap': tile = null; break;
        case 'berg': tile = o.tile || 'berg'; break;
        case 'mimic': tile = o.tile || 'block_grey'; break;
        case 'leaf': tile = 'leaf'; break;
        case 'log': { const cells = this.logCells(o); const turn = o.rolling ? ['', '', '2', '2'][Math.floor((o.phase || 0) / 3) % 4] : ''; cells.forEach(([x, y], i) => this.drawTile(g, Tiles.get((o.horiz ? 'log_h_' : 'log_v_') + (i === 0 ? 'a' : i === cells.length - 1 ? 'c' : 'b') + turn), x * TILE - cam.x + (o.ox || 0), y * TILE - cam.y + (o.oy || 0))); continue; }
        case 'djinni': objSprites.push({ y: o.y * TILE + 16, draw: () => { const s = Sprites.animal('djinni', o.el, DIR.DOWN, Math.floor(this.frame / 16) % 2); g.drawImage(s, sx, sy - 2); } }); continue;
      }
      if (o.tile && o.kind !== 'updraft' && !(o.kind === 'pillar' && o.state === 'sunk')) tile = o.tile;
      if (tile) this.drawTile(g, Tiles.get(tile), sx + (o.kind === 'berg' ? (o.ox || 0) : 0), sy + (o.kind === 'berg' ? (o.oy || 0) : 0));
      if ((o.kind === 'scoop' || (o.kind === 'container' && o.hasItem && !G.flag(o.key)) || o.kind === 'catchable' || (o.kind === 'spot' && o.item && !G.flag(G.map.id + ':hidden:' + o.x + ',' + o.y))) && this.revealed(o.x, o.y)) { const tw = this.frame; for (let k = 0; k < 3; k++) { const a = tw * 0.15 + k * 2.1; Gfx.circle(g, sx + 8 + Math.cos(a) * 4, sy + 6 + Math.sin(a) * 3, 1, '#fff8c0'); } Gfx.circle(g, sx + 8, sy + 7, 1.5, '#ffffff'); }
    }
    // actors (y-sorted)
    const actors = [];
    if (!this.player.hidden) actors.push(this.player);
    if (this.showFollowers && !this.ship) for (const f of this.followers) if (!f.hidden) actors.push(f);
    for (const n of this.npcs) if (!n.hidden) actors.push(n);
    const drawables = actors.map(a => ({ y: a.py + 16, pri: a === this.player ? 1 : 0, draw: () => this.drawActor(g, a) })).concat(objSprites);
    drawables.sort((a, b) => (a.y - b.y) || ((a.pri || 0) - (b.pri || 0)));
    for (const d of drawables) d.draw();
    // the circle of Reveal: the world inside it drained of colour, its rim shimmering, fading out at the end
    if (this.reveal > 0) {
      const cx = this.player.px + 8 - cam.x, cy = this.player.py + 8 - cam.y; const fade = Math.min(1, this.reveal / 30); const r = Math.max(2, REVEAL_R * (0.6 + 0.4 * fade) * Math.max(0.1, Math.min(1, (REVEAL_FRAMES - this.reveal + 6) / 12)));
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
      if ('filter' in g) { g.filter = 'grayscale(0.85) brightness(1.08)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none'; }
      else { g.fillStyle = 'rgba(200,200,220,0.25)'; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,' + (0.35 + 0.25 * Math.sin(this.frame * 0.25)) * fade + ')'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(180,220,255,' + 0.3 * fade + ')'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r + 3, 0, Math.PI * 2); g.stroke();
    }
    // over layer
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = M.idx(x, y); const oid = M.obj[i]; if (oid && Tiles.byId[oid].over) this.drawTile(g, Tiles.byId[oid], x * TILE - cam.x, y * TILE - cam.y); const ov = M.over[i]; if (ov) this.drawTile(g, Tiles.byId[ov], x * TILE - cam.x, y * TILE - cam.y); }
    // psynergy fx
    if (this.moveAim && typeof FieldFX !== 'undefined') { const o = this.moveAim.o; FieldFX.hand(g, o.x * TILE - cam.x + 8, o.y * TILE - cam.y - 4 + Math.round(Math.sin(this.moveAim.t / 5) * 2), DIR.DOWN, 0.95); }
    if (this.psyFx) { const f = this.psyFx; f.t++; if (typeof FieldFX !== 'undefined') { FieldFX.draw(g, f, cam); if (FieldFX.done(f)) this.psyFx = null; } else { const sx = f.x * TILE - cam.x + 8, sy = f.y * TILE - cam.y + 8; for (let i = 0; i < 8; i++) { const a = i * 0.785 + f.t * 0.3; Gfx.circle(g, sx + Math.cos(a) * f.t * 1.2, sy + Math.sin(a) * f.t * 0.8 - f.t, 2, ELCOLOR[f.el]); } if (f.t > 24) this.psyFx = null; } }
    // the tidal wave: a wall of sea that rolls down the screen over everything on the island
    if (this.wave) this.drawWave(g);
    // darkness
    // the dark is drawn on its own layer, holes punched around the player and the torches, then laid over the frame:
    // punching holes in the frame itself would erase the map and leave the party standing in the blackest spot
    if (M.dark && !this.lantern) {   // a Miner's Lantern lights the whole floor
      if (!this.darkCv) { this.darkCv = Gfx.canvas(SCREEN_W, SCREEN_H); }
      const d = Gfx.ctx(this.darkCv); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, SCREEN_W, SCREEN_H);
      const lv = M.darkLevel === undefined ? 0.8 : M.darkLevel; d.fillStyle = 'rgba(0,0,10,' + lv + ')'; d.fillRect(0, 0, SCREEN_W, SCREEN_H);   // darkLevel: how deep the dark is (the Islet Cave's corridors, each darker than the last)
      d.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r0, r) => { const grd = d.createRadialGradient(x, y, r0, x, y, r); grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = grd; d.fillRect(x - r, y - r, r * 2, r * 2); };
      hole(this.player.px + 8 - cam.x, this.player.py + 8 - cam.y, 8, Math.round(48 * (1.2 - lv * 0.5)));
      for (const l of M.lights) hole(l.x * TILE + 8 - cam.x, l.y * TILE + 8 - cam.y, 4, l.r * TILE);
      d.globalCompositeOperation = 'source-over';
      g.drawImage(this.darkCv, 0, 0);
    }
    if (M.tint) { g.fillStyle = M.tint; g.fillRect(0, 0, SCREEN_W, SCREEN_H); }
    if (M.rain) { const t = this.frame; g.fillStyle = 'rgba(210,225,255,0.5)'; for (let i = 0; i < 56; i++) { const sx = (i * 97 + t * 5) % (SCREEN_W + 30) - 15, sy = (i * 61 + t * 11) % (SCREEN_H + 20) - 10; for (let k = 0; k < 6; k++) g.fillRect(sx - k, sy + k * 2, 1, 2); } }
    if (M.world && G.flag('hasShip') && !this.ship) { const sx = G.get('shipX') * TILE - cam.x, sy = G.get('shipY') * TILE - cam.y; if (sx > -32 && sy > -32 && sx < SCREEN_W + 16 && sy < SCREEN_H + 16) this.drawShip(g, sx, sy + 8, DIR.RIGHT); }
    // UI
    if (this.psyMenu) { UI.window(g, 4, 4, 110, this.psyMenu.rows * 10 + 8); this.psyMenu.draw(g); const cur = this.psyMenu.current; if (cur) { UI.window(g, 118, 4, 118, 52); const lines = Font.wrap(PSY[cur.id].desc, 108); lines.slice(0, 2).forEach((l, i) => Font.draw(g, l, 122, 8 + i * 10, '#e0e8ff')); Font.draw(g, cur.who.name + ' PP ' + cur.who.pp, 122, 32, '#a0c0ff'); Font.draw(g, 'A/S: bind to key', 122, 44, '#8090b0'); } }
    else if (!this.textbox.active && !this.event && (G.quick.q1 || G.quick.q2)) { const parts = []; if (G.quick.q1) parts.push('A:' + G.quick.q1); if (G.quick.q2) parts.push('S:' + G.quick.q2); const t = parts.join('  '); UI.panel(g, 2, SCREEN_H - 13, Font.width(t) + 8, 11); Font.draw(g, t, 6, SCREEN_H - 11, '#d0d8f0'); }
    if (M.def.night && (typeof M.def.night === 'function' ? M.def.night() : true)) { g.fillStyle = 'rgba(8,16,56,0.42)'; g.fillRect(0, 0, SCREEN_W, SCREEN_H); }   // night: the moon's light on everything
    if (M.def.heat && !this.textbox.active) { const hv = (this.heat || 0) / HEAT_MAX; UI.panel(g, 2, 30, 10, 64); g.fillStyle = '#301818'; g.fillRect(5, 33, 4, 58); g.fillStyle = hv > 0.75 ? '#ff5030' : hv > 0.45 ? '#ffa030' : '#ffe060'; g.fillRect(5, 33 + Math.round(58 * (1 - hv)), 4, Math.round(58 * hv)); Gfx.circle(g, 7, 91, 3, hv > 0.75 ? '#ff5030' : '#ffe060'); }
    if (this.race && !this.textbox.active) { const rc = this.race; const p = rc.late ? 1 : 1 - rc.t / rc.total; UI.panel(g, 150, 2, 88, 14); Font.draw(g, rc.foe, 154, 5, '#ffe080'); g.fillStyle = '#302020'; g.fillRect(190, 5, 44, 6); g.fillStyle = rc.late ? '#ff4040' : p > 0.7 ? '#ffa030' : '#80d080'; g.fillRect(190, 5, Math.round(44 * p), 6); }
    if (this.noticeT > 0) { const w = Font.width(this.notice) + 12; UI.window(g, 120 - w / 2, 6, w, 14); Font.draw(g, this.notice, 120, 9, '#ffffff', { align: 'center' }); }
    if (M.world && !this.textbox.active && !this.event) { const nm = M.def.regionName ? M.def.regionName(this.player.tx, this.player.ty) : M.name; if (nm) { UI.panel(g, 2, 2, Font.width(nm) + 8, 12); Font.draw(g, nm, 6, 4, '#ffffff'); } }
    this.textbox.draw(g);
    if (this.areaTitle && !this.chapterTitle && this.noticeT <= 0) { const c = this.areaTitle; const a = c.t < 12 ? c.t / 12 : c.t > 190 ? (210 - c.t) / 20 : 1; const w = Font.width(c.text) + 16; g.globalAlpha = a; UI.window(g, 6, 6, w, 16, { c0: '#3060c0', c1: '#204090' }); Font.draw(g, c.text, 14, 10, '#f8f0c0'); g.globalAlpha = 1; }
    if (this.chapterTitle) { const c = this.chapterTitle; const a = c.t < 20 ? c.t / 20 : c.t > 110 ? (130 - c.t) / 20 : 1; g.fillStyle = 'rgba(0,0,0,' + (0.7 * a) + ')'; g.fillRect(0, 60, SCREEN_W, 40); g.globalAlpha = a; Font.draw(g, c.text, 120, 76, '#ffe080', { align: 'center', outline: '#402000' }); g.globalAlpha = 1; }
  }
  drawActor(g, a) {
    const cam = this.cam; const s = a.sprite(); const jump = a.jumpT > 0 ? Math.round(Math.sin(a.jumpT / 16 * Math.PI) * 8) : 0;
    let sx = Math.round(a.px - cam.x), sy = Math.round(a.py - cam.y - (a.animal ? 0 : 8) - jump); if (a === this.player && this.sink) sy += Math.min(6, this.sink * 2);
    if (a.data && a.data.foe) { sx = Math.round(a.px + 8 - s.width / 2 - cam.x); sy = Math.round(a.py + 16 - s.height - cam.y - jump); }
    if (this.cloaked && a === this.player) g.globalAlpha = 0.5;
    if (this.sandForm && a === this.player) { Gfx.ellipse(g, sx + 8, sy + 20, 7, 3, '#d8c070'); g.globalAlpha = 0.3; }
    if (this.ship && a === this.player) { this.drawShip(g, sx, sy + 8, a.dir); g.globalAlpha = 1; return; }
    if (a.halted) { a.halted--; g.globalAlpha = 0.8; }
    g.drawImage(s, sx, sy); g.globalAlpha = 1;
    if (a.emoteT > 0 && a.emote) { const ex = sx + 12, ey = sy - 10; UI.window(g, ex - 2, ey - 2, 12, 12, { c0: '#ffffff', c1: '#e0e0e0', border: '#404040' }); Font.draw(g, a.emote, ex + 1, ey, '#202020', { shadow: null }); }
    if (a === this.player && this.carrying) { g.drawImage(Tiles.get('crate').frames[0], sx, sy - 12); }
  }
  // aloft: the winged ship over anything that is not open water
  flying() { const M = this.map, p = this.player; if (!(this.ship && M && M.world && G.flag('ship_wings'))) return false; return !M.get(p.tx, p.ty).water || !G.flag('ship_on_water'); }   /* with the wings the ship is always in the air - over the sea too (nothing meets it there) - unless the player set it down on the water (A over the sea) to sail and fight the old way; A again lifts it */
  // the winged ship sets down on the land it hovers over (not a place's marker, not a river, and somewhere the party
  // can walk off): the ship waits there, on land, and stepping back onto it takes off again
  canLandShip() { const M = this.map, p = this.player; if (!this.flying() || p.moving) return false; const t = M.get(p.tx, p.ty); if (t.water || t.river || t.place || t.solid || t.kind === 'mountain') return false; return [0, 1, 2, 3].some(d => { const nx = p.tx + DX[d], ny = p.ty + DY[d]; return M.inb(nx, ny) && !M.get(nx, ny).water && (M.get(nx, ny).place || !this.blockedNoShip(nx, ny)); }); }   /* somewhere to step off to: open ground, or a place's marker (an islet that is all marker and beach) */
  blockedNoShip(x, y) { const was = this.ship; this.ship = false; const b = this.blocked(x, y); this.ship = was; return b; }
  landShip() { if (!this.canLandShip()) return false; const p = this.player; this.ship = false; G.set('onShip', false); G.set('shipX', p.tx); G.set('shipY', p.ty); this.lastSea = null; Audio.sfx('jump'); Audio.play(this.map.music); this.showNotice('The ship sets down.'); return true; }
  static flyable(t) { return !!(t.reef || (t.world && !t.solid && !t.place && t.kind !== 'mountain') || (t.river && t.world)); }
  drawShip(g, sx, sy, dir) {
    // the Lemurian ship, 24x16, seen side-on when it sails east or west (mirrored) and end-on when it sails north or
    // south (the bow toward the viewer going south); with the Wings of Anemos it rides higher when aloft, its shadow
    // on the ground below and the wings beating
    const wings = G.flag('ship_wings'), aloft = this.flying(), up = aloft && Math.floor(this.frame / 8) % 2 === 0;
    if (aloft) { g.globalAlpha = 0.35; Gfx.ellipse(g, sx + 8, sy + 12, 12, 3, '#101020'); g.globalAlpha = 1; sy -= 6; }
    const x = sx - 4, y = sy - 4;
    if (dir === DIR.LEFT || dir === DIR.RIGHT) {
      const X = dir === DIR.LEFT ? (dx) => x + 24 - dx : (dx) => x + dx;
      if (wings) { Gfx.tri(g, X(6), y + 7, X(-7), y + (up ? -3 : 5), X(4), y + 11, '#f0f0f8'); Gfx.tri(g, X(18), y + 7, X(31), y + (up ? -3 : 5), X(20), y + 11, '#f0f0f8'); Gfx.tri(g, X(6), y + 8, X(-5), y + (up ? -1 : 6), X(5), y + 11, '#c8c8e0'); Gfx.tri(g, X(18), y + 8, X(29), y + (up ? -1 : 6), X(19), y + 11, '#c8c8e0'); }
      if (!aloft) Gfx.ellipse(g, x + 12, y + 12, 12, 4, '#3050a0');
      Gfx.rect(g, x + 2, y + 6, 20, 6, '#c0b090'); Gfx.rect(g, x + 2, y + 6, 20, 1, '#e0d0b0'); Gfx.rect(g, x + 2, y + 11, 20, 1, '#8a7a58');
      Gfx.tri(g, X(22), y + 6, X(27), y + 9, X(22), y + 12, '#c0b090'); Gfx.tri(g, X(2), y + 6, X(-1), y + 9, X(2), y + 12, '#a89870');   // the bow forward, the blunt stern behind
      Gfx.rect(g, x + 11, y - 6, 2, 12, '#604020'); Gfx.tri(g, X(13), y - 5, X(22), y + 2, X(13), y + 4, '#f0f0f8'); Gfx.tri(g, X(11), y - 5, X(4), y + 2, X(11), y + 4, '#e0e0ec');
      Gfx.rect(g, x + 6, y + 8, 3, 2, '#4080d0'); Gfx.rect(g, x + 15, y + 8, 3, 2, '#4080d0'); Gfx.px(g, x + 12, y - 7, '#f0d040');
    } else {
      const bow = dir === DIR.DOWN;
      if (wings) { Gfx.tri(g, x + 8, y + 7, x - 9, y + (up ? -2 : 6), x + 8, y + 11, '#f0f0f8'); Gfx.tri(g, x + 16, y + 7, x + 33, y + (up ? -2 : 6), x + 16, y + 11, '#f0f0f8'); Gfx.tri(g, x + 8, y + 8, x - 7, y + (up ? 0 : 7), x + 8, y + 11, '#c8c8e0'); Gfx.tri(g, x + 16, y + 8, x + 31, y + (up ? 0 : 7), x + 16, y + 11, '#c8c8e0'); }
      if (!aloft) Gfx.ellipse(g, x + 12, y + 13, 8, 3, '#3050a0');
      Gfx.rect(g, x + 7, y + 3, 10, 10, '#c0b090'); Gfx.rect(g, x + 7, y + 3, 10, 1, '#e0d0b0'); Gfx.rect(g, x + 7, y + 3, 1, 10, '#8a7a58'); Gfx.rect(g, x + 16, y + 3, 1, 10, '#8a7a58');
      Gfx.tri(g, x + 7, y + 13, x + 12, y + 16, x + 17, y + 13, bow ? '#a89870' : '#8a7a58');   // the bow's stem or the stern's transom
      Gfx.rect(g, x + 11, y - 6, 2, 12, '#604020'); Gfx.rect(g, x + 5, y - 4, 14, 7, bow ? '#f0f0f8' : '#dcdce6'); Gfx.rect(g, x + 5, y - 4, 14, 1, '#ffffff');
      if (bow) { Gfx.rect(g, x + 9, y + 8, 2, 2, '#4080d0'); Gfx.rect(g, x + 13, y + 8, 2, 2, '#4080d0'); } else Gfx.rect(g, x + 9, y + 9, 6, 2, '#4080d0');
      Gfx.px(g, x + 12, y - 7, '#f0d040');
    }
  }
  // ---------- save ----------
  *saveMenu() {
    const sc = new SaveSlotScene(this, 'save');
    Engine.push(sc);
    yield () => sc.closed;
  }
}

// ---------- Save system ----------
const SaveSystem = {
  key: 'goldensun_complete_save1',
  data(field, auto) { return { v: 1, auto: !!auto, bestiary: G.bestiary || {}, campResting: G.campResting || [], flags: G.flags, party: G.party.serialize(), inv: G.inventory.serialize(), mapId: G.mapId, x: field.player.tx, y: field.player.ty, dir: field.player.dir, playtime: G.playtime, game: G.game, visited: G.visited, ship: field.ship, quick: G.quick, isaacParty: G.isaacParty || null, time: Date.now() }; },
  save(field, slot) { if (typeof Demo !== 'undefined' && Demo.running) return false; try { localStorage.setItem(SaveSlots.key(slot || 1), JSON.stringify(this.data(field, false))); return true; } catch (e) { console.error(e); return false; } },
  // autosave: written whenever a new map is entered (not the world map), kept apart from the manual save; Continue loads whichever is newer
  autoKey: 'goldensun_complete_autosave',
  autosave(field) { if (typeof Settings !== 'undefined' && !Settings.data.autosave) return; if (typeof Demo !== 'undefined' && Demo.running) return;
    if (!G.party || !G.party.members.length || (G.map && G.map.world)) return; try { localStorage.setItem(this.autoKey, JSON.stringify(this.data(field, true))); } catch (e) { } },
  load() { SaveSlots.migrate(); return SaveSlots.newest(); },
  exists() { SaveSlots.migrate(); return SaveSlots.any(); },
  apply(data, field) {
    G.flags = data.flags || {}; G.bestiary = data.bestiary || {}; G.campResting = data.campResting || []; G.party = Party.deserialize(data.party); G.inventory = Inventory.deserialize(data.inv); G.playtime = data.playtime || 0; G.game = data.game || 1; G.visited = data.visited || {}; G.quick = data.quick || {};
    if (data.isaacParty) G.isaacParty = data.isaacParty;
    field.loadMap(data.mapId, data.x, data.y, data.dir, { ship: data.ship, keepShip: true }); field.ship = !!data.ship;
  }
};

class GameOverScene {
  constructor() { this.t = 0; this.menu = new MenuList([{ label: 'Load last save', id: 'load' }, { label: 'Return to title', id: 'title' }], { x: 80, y: 90, w: 100, rows: 2 }); }
  enter() { Audio.play('gameover'); }
  update() { this.t++; if (this.t < 60) return; this.menu.update(); if (this.menu.chosen) { const id = this.menu.chosen.id; if (id === 'load' && SaveSystem.exists()) { Engine.push(new SaveSlotScene(null, 'load', (ok, d) => { if (!ok || !d) return; Engine.scenes.length = 0; const f = new FieldScene(); Engine.push(f); SaveSystem.apply(d, f); Engine.fade = 1; Engine.fadeIn(20); })); } else { Engine.scenes.length = 0; Engine.push(new TitleScene()); Engine.fade = 1; Engine.fadeIn(20); } } }
  draw(g) { g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H); Font.draw(g, 'The party has fallen...', 120, 50, '#c04040', { align: 'center' }); if (this.t >= 60) { UI.window(g, 70, 84, 120, 34); this.menu.draw(g); } }
}

// Teleport destination picker
class TeleportScene {
  constructor(field) { this.field = field; this.transparent = true; const dests = TELEPORT_DESTS.filter(d => G.visited && G.visited[d.map] || G.flag(d.flag || '')); this.menu = new MenuList(dests.map(d => ({ label: d.label, id: d })), { x: 40, y: 20, w: 160, rows: 10, lineH: 10 }); this.closed = false; }
  update() { this.menu.update(); if (this.menu.cancelled) { Engine.pop(); return; } if (this.menu.chosen) { const d = this.menu.chosen.id; const f = this.field; Engine.pop(); f.run(function* (E) { yield Engine.fadeOut(20); E.warpNow(d.map, d.x, d.y, DIR.DOWN); yield Engine.fadeIn(20); }); } }
  draw(g) { UI.window(g, 30, 12, 180, 120); Font.draw(g, 'Teleport to...', 120, 16, '#ffe080', { align: 'center' }); this.menu.y = 28; this.menu.draw(g); }
}
