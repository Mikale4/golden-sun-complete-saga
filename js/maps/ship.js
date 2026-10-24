// ---------- The Tolbi-bound ship ----------
// The crossing of the Karagol Sea, as the original plays it: the ship waits at Kalay Docks until the captain's
// Anchor Charm is found (a shady passenger slipped into his cabin; the charm turns up in a barrel in the crow's
// nest), the passengers gossip in their room, the rowing crew below wants a look at the Adepts, and then four
// attacks on the way - three Man o' Wars, a Lizard Fighter with two Rabid Bats, a Virago with two more Man o'
// Wars, and the Kraken - each leaving an oarsman hurt and Kaja asking who takes the oar. Pick the four weak
// passengers (the balding man, the old man, the young man at the back, the girl in green) and the rowing is so
// unbalanced the ship drifts to Crossbone Isle, where Sean and Ouranos offer a look at the shore before the crew
// sorts the oars and rows on to Tolbi.
'use strict';

const SHIP_ROWERS = [
  { id: 'p_sean', name: 'Sean', weak: false }, { id: 'p_ouranos', name: 'Ouranos', weak: false },
  { id: 'p_merchant', name: 'Merchant', weak: false }, { id: 'p_seaman', name: 'Seaman', weak: false },
  { id: 'p_bald', name: 'Balding Man', weak: true }, { id: 'p_old', name: 'Old Man', weak: true },
  { id: 'p_young', name: 'Young Man', weak: true }, { id: 'p_green', name: 'Girl in Green', weak: true },
];
const shipPicks = () => G.get('ship_picks') || [];
const rowerLeft = () => SHIP_ROWERS.filter(r => !shipPicks().includes(r.id));

// the captain on deck: no charm, no sailing; the charm back, the crew wants a look at the passengers who fight;
// then the ship leaves
STORY.shipCaptain = function* (E) {
  if (G.flag('ship_sailed')) { yield E.say("Tolbi's not far now. Keep your eyes on the water.", 'Captain'); return; }
  if (G.flag('crew_met')) {
    const r = yield* E.ask("The rowers are ready and the charm's back on its hook. Bound for Tolbi - cast off?", 'Captain', ['Cast off', 'Not yet']);
    if (r === 0) yield* STORY.shipVoyage(E);
    return;
  }
  if (G.flag('charm_returned')) { yield E.say("Before we leave, go below and show yourselves to the rowing crew. They row better knowing who's aboard to fight for them.", 'Captain'); return; }
  if (G.inventory.has('Anchor Charm')) {
    yield E.say("My Anchor Charm! Where did you find it?", 'Captain');
    yield E.say("In a barrel, up in the crow's nest.", 'Isaac');
    yield E.say("The crow's nest! Someone hid it there so we'd never sail... That charm has guarded this ship for thirty years. I'll not leave the dock without it.", 'Captain');
    G.inventory.remove('Anchor Charm'); G.set('charm_returned'); Audio.sfx('item');
    yield E.say("(Isaac hands over the Anchor Charm.)");
    yield E.say("Now - the rowing crew below the passenger room asked to see the Adepts who'll be sailing with them. Go and show yourselves, then we cast off.", 'Captain');
    return;
  }
  yield E.say("We're not going anywhere. The Anchor Charm is gone from my cabin - it's guarded this ship from the Kraken for thirty years, and I'll not sail without it.", 'Captain');
  yield E.say("Someone aboard took it. Have a look around, would you? Ask the passengers.", 'Captain');
  G.set('charm_missing');
};
// the shady passenger by the cabin door: he slips inside as the party comes near, and comes out swearing innocence
STORY.shipShady = function* (E) {
  if (G.flag('charm_returned')) { yield E.say("...I told you. I never touched the thing.", 'Shady Man'); return; }
  yield E.say("(The man glances at the party, then slips into the captain's cabin.)");
  E.hide('ship_shady'); yield 40;
  yield E.say("Hey! What's he doing in there?", 'Garet');
  yield 30; E.show('ship_shady');
  yield E.say("I didn't do a thing! I was just... looking for the captain. That's all. Nothing to do with any charm!", 'Shady Man');
  yield E.say("Nobody said anything about a charm.", 'Ivan');
  yield E.say("(He hurries off along the rail without another word.)");
  const a = E.actor('ship_shady'); if (a) { a.tx = 17; a.ty = 8; a.px = a.tx * TILE; a.py = a.ty * TILE; a.dir = DIR.DOWN; }
  G.set('shady_seen');
};
// the passengers' room: a conversation overheard on the way in
STORY.shipRoomTalk = function* (E) {
  yield E.say("...gone from his cabin, they say. The captain's charm! And that man in the grey cloak was seen going in there.", 'Passenger');
  yield E.say("Hush. If we never sail, we never sail. Tolbi's Colosso can do without me.", 'Old Man');
  yield E.say("I'd not put it past him to hide it somewhere high up, where nobody looks.", 'Girl in Green');
  yield E.say("High up... the crow's nest?", 'Mia');
};
// the rowing crew below: they wanted a look at the Adepts before the crossing
STORY.rowingMaster = function* (E) {
  if (!G.flag('charm_returned')) { yield E.say("We row when the captain says row. And he says nothing until his charm's found.", 'Rowing Master'); return; }
  if (G.flag('crew_met')) { yield E.say("Back on deck with you. We'll do the rowing.", 'Rowing Master'); return; }
  yield E.say("So you're the Adepts. Good. It's Kraken water between here and Tolbi, and the crew rows easier knowing there's someone aboard who can fight.", 'Rowing Master');
  yield E.say("Tell the captain we're ready.", 'Rowing Master');
  G.set('crew_met');
};
// who takes the hurt oarsman's place: Kaja asks after every attack
STORY.shipPickOar = function* (E, round) {
  const left = rowerLeft();
  yield E.say(round === 4 ? "That was the Kraken itself... and you beat it. The crew will sing of this. But one more rower is down - the last oar. Who takes it?" : "One of the rowers is hurt. Someone has to take his oar. Who do you choose?", 'Kaja');
  const r = yield* E.ask('Who takes the oar?', 'Kaja', left.map(p => p.name));
  const pick = left[Math.max(0, Math.min(left.length - 1, r === null || r === undefined ? 0 : r))];
  G.set('ship_picks', shipPicks().concat([pick.id]));
  yield E.say(pick.name + ' takes the oar.' + (pick.weak ? ' The stroke falters a little...' : ' The ship holds its course.'), 'Kaja');
};
// the crossing itself: four attacks on the rowers, then Tolbi - or Crossbone Isle if the oars were badly filled
STORY.shipVoyage = function* (E) {
  G.set('ship_sailed'); G.set('ship_picks', []);
  yield Engine.fadeOut(30); E.warpNow('ship_deck', 10, 6, DIR.UP); yield Engine.fadeIn(30);
  yield E.say("(The ship casts off from Kalay Docks and sets out across the Karagol Sea.)");
  const fight = function* (foes, line, round) {
    yield 60; yield E.shake(12); Audio.sfx('quake');
    yield E.say(line, 'Kaja');
    const r = yield* E.battle(foes, { canFlee: false, bg: 'ship' });
    if (r !== 'win') return false;
    yield* STORY.shipPickOar(E, round); return true;
  };
  if (!(yield* fight(["Man o' War", "Man o' War", "Man o' War"], "Something's climbing the hull - Man o' Wars! They're going for the oarsmen!", 1))) return;
  if (!(yield* fight(['Lizard Fighter', 'Rabid Bat', 'Rabid Bat'], "Again! A Lizard Fighter, and bats with it - below, to the rowers!", 2))) return;
  if (!(yield* fight(['Virago', "Man o' War", "Man o' War"], "They keep coming! A Virago this time, and more of those jellies!", 3))) return;
  yield 60; yield E.shake(30); Audio.sfx('quake');
  yield E.say("The water... look at the water!", 'Ivan');
  const res = yield* E.ambush(['Kraken'], { boss: true, canFlee: false, bg: 'ship' }, { scale: 1.4, sfx: 'quake', say: "K-Kraken! The Kraken has found us! Fight, or we're all sunk!" });
  if (res !== 'win') return;
  G.set('kraken_done');
  yield E.say("The Kraken sinks beneath the waves! The ship is saved!", 'Captain');
  yield* STORY.shipPickOar(E, 4);
  const picks = shipPicks(); const unbalanced = picks.length >= 4 && picks.every(id => (SHIP_ROWERS.find(p => p.id === id) || {}).weak);
  if (unbalanced && !G.flag('crossbone_visited_ship')) {
    yield E.say("(The oars pull unevenly... the ship swings off its course, and the crew cannot bring it back. A day and a night pass.)");
    yield E.say("Land! But that's no harbour... bone-white cliffs, and a cave. Crossbone Isle, if the old charts are right.", 'Captain');
    yield E.say("Crossbone Isle! They say Deadbeard's treasure is still there. We'd go ashore - want to come and look?", 'Sean');
    const go = yield* E.yesno('Explore the shore?', 'Ouranos');
    G.set('ship_at_crossbone'); G.set('crossbone_visited_ship');
    if (go) {
      yield E.say("Mind you come back. The crew will have the oars sorted by then.", 'Captain');
      yield Engine.fadeOut(30); E.warpNow('crossbone', 12, 23, DIR.UP); yield Engine.fadeIn(30);
      yield E.say("(The ship's boat puts the party ashore on Crossbone Isle. The way back to the ship is the beach to the south.)");
      return;
    }
    yield E.say("Suit yourselves. Rowers - sort those oars, and take us to Tolbi.", 'Captain');
  }
  yield* STORY.shipArrive(E);
};
STORY.shipArrive = function* (E) {
  G.set('ship_at_crossbone', false); G.set('ship_at_tolbi');
  yield E.say("(A night and a day on the Karagol, and the ship ties up at Tolbi Docks.)");
  yield Engine.fadeOut(30); E.warpNow('tolbi_docks', 24, 16, DIR.LEFT); Audio.play('town'); yield Engine.fadeIn(30);
  yield E.say("Tolbi's up the road west of here. Colosso will have begun by now - go on, we'll see to the ship.", 'Captain');
  yield* E.chapter('Chapter 3: Tolbi and Colosso');
};
// back aboard from Crossbone Isle's beach
STORY.shipFromCrossbone = function* (E) {
  yield Engine.fadeOut(30); E.warpNow('ship_deck', 10, 6, DIR.UP); Audio.play('sailing'); yield Engine.fadeIn(30);
  yield E.say("Everyone aboard? The oars are sorted - Tolbi next, and no more detours.", 'Captain');
  yield* STORY.shipArrive(E);
};
// boarding at Kalay Docks (the ticket from Lady Layana)
STORY.boardShip = function* (E) {
  if (!G.inventory.has('Boat Ticket') && !G.flag('boarded_ship')) { yield E.say("A ticket to Tolbi? You'll need a Boat Ticket from the office there. Lady Layana of Kalay might help you with the fare.", 'Captain'); return; }
  if (G.flag('kraken_done')) { yield E.say("Tolbi again? Colosso's over, but the ship still sails.", 'Captain'); }
  const r = yield* E.ask("Bound for Tolbi! Colosso's about to begin. All aboard?", 'Captain', ['Board', 'Not yet']);
  if (r !== 0) return;
  if (G.inventory.has('Boat Ticket')) G.inventory.remove('Boat Ticket');
  G.set('boarded_ship');
  yield Engine.fadeOut(30); E.warpNow('ship_deck', 4, 8, DIR.RIGHT); Audio.play('sailing'); yield Engine.fadeIn(30);
  if (!G.flag('charm_missing')) yield E.say("(The ship rides at the dock, its sails furled. Nobody seems in a hurry to leave.)");
};

// ---- the deck ----
const SHIP_DECK_ROWS = [
  '~~~~~~~~~~~~~~~~~~~~~~',
  '~~~RRRRRRRRRRRRRRRRR~~',
  '~~R.WWWW........WWWW.R',
  '~~R.WWWW...m....WWWW.R',
  '~~R.WdWW...l....WWdW.R',
  '~~R.................R~',
  '~~R.................R~',
  '~~R........h........R~',
  '~~R.................R~',
  '~~R.................R~',
  '~~~RRRRRRRRRRRRRRRRR~~',
  '~~~~~~~~~~~~~~~~~~~~~~',
];
defineMap('ship_deck', {
  name: 'Tolbi-bound Ship', w: 22, h: 12, base: 'water', music: 'sailing', bg: 'ship', entry: { x: 10, y: 6 },
  build(M) {
    M.paint(0, 0, SHIP_DECK_ROWS, { '.': 'ship_deck', 'R': { ground: 'ship_deck', obj: 'ship_rail' }, 'W': { ground: 'ship_deck', obj: 'wall_wood' }, 'd': { ground: 'ship_deck', obj: 'door', walk: true }, 'm': { ground: 'ship_deck', obj: 'mast' }, 'l': { ground: 'ship_deck', obj: 'ladder', walk: true }, 'h': { ground: 'ship_deck', obj: 'stairs_down', walk: true } });
    M.walkable(11, 4); M.exit(11, 4, 1, 1, 'ship_nest', 2, 2, DIR.UP, { stairs: true });
    M.walkable(11, 7); M.exit(11, 7, 1, 1, 'ship_hold', 8, 2, DIR.DOWN, { stairs: true });
    M.walkable(5, 4); M.exit(5, 4, 1, 1, 'ship_room', 6, 7, DIR.UP, { door: true });
    M.walkable(18, 4); M.exit(18, 4, 1, 1, 'ship_cabin', 5, 6, DIR.UP, { door: true });
    // the gangplank, while the ship is at the dock
    if (!G.flag('ship_sailed')) { M.setObj(2, 8, null); M.walkable(2, 8); M.exit(2, 8, 1, 1, 'kalay_docks', 4, 18, DIR.RIGHT); }
    if (G.flag('ship_at_tolbi')) { M.setObj(20, 6, null); M.walkable(20, 6); M.exit(20, 6, 1, 1, 'tolbi_docks', 24, 16, DIR.LEFT); }   // and at Tolbi's pier, on the other side
    M.npc('ship_captain', 14, 6, { type: 'sailor', name: 'Captain', dir: DIR.LEFT, script: STORY.shipCaptain });
    M.npc('ship_kaja', 8, 5, { type: 'sailor', name: 'Kaja', look: npcLook('villager_f', 7), dir: DIR.DOWN, text: () => G.flag('ship_sailed') ? "I'm Kaja, the captain's mate. If the rowers take hurt, it's me who asks who fills the oar. Choose well - the stroke has to stay even." : "The rowers are grumbling. A ship that doesn't sail is a ship that doesn't pay." });
    M.npc('p_sean', 6, 8, { type: 'guard', name: 'Sean', dir: DIR.RIGHT, text: () => G.flag('ship_at_crossbone') ? "Crossbone Isle! Deadbeard's hoard is somewhere under those cliffs." : "Sean, sword for hire. Ouranos and I are bound for Colosso. Lord Babi pays well for a good fight." });
    M.npc('p_ouranos', 7, 8, { type: 'guard', name: 'Ouranos', dir: DIR.LEFT, text: () => G.flag('ship_at_crossbone') ? "The beach south of the cave is where the boat waits. Don't dawdle." : "Ouranos. If anything climbs the hull, you'll find us at the rail." });
    M.npc('p_merchant', 15, 8, { type: 'merchant', name: 'Merchant', text: "I've a stall to set up in Tolbi before Colosso starts. Every day at this dock costs me money." });
    M.npc('p_seaman', 4, 6, { type: 'sailor', name: 'Seaman', dir: DIR.RIGHT, text: "Signed on at Kalay for the crossing. I've rowed worse water than the Karagol." });
    if (!G.flag('shady_seen')) M.npc('ship_shady', 16, 5, { type: 'scholar', name: 'Shady Man', dir: DIR.DOWN, script: STORY.shipShady, cond: () => !G.flag('ship_sailed') });
    else M.npc('ship_shady', 17, 8, { type: 'scholar', name: 'Shady Man', dir: DIR.DOWN, script: STORY.shipShady, cond: () => !G.flag('ship_sailed') });
    M.trigger(15, 4, 3, 2, STORY.shipShady, { once: 'shady_seen', cond: () => G.flag('charm_missing') && !G.flag('charm_returned') });
    M.sign(12, 9, "The Karagol Sea. Kraken water, the old hands say.");
  }
});
// ---- the crow's nest: a barrel with the charm in it ----
defineMap('ship_nest', {
  name: "Crow's Nest", w: 5, h: 5, base: 'void', music: 'sailing', bg: 'ship', indoor: true, entry: { x: 2, y: 2 },
  build(M) {
    M.fill(1, 1, 3, 3, 'ship_deck'); M.fillObj(1, 0, 3, 1, 'ship_rail'); M.setObj(0, 1, 'ship_rail'); M.setObj(0, 2, 'ship_rail'); M.setObj(0, 3, 'ship_rail'); M.setObj(4, 1, 'ship_rail'); M.setObj(4, 2, 'ship_rail'); M.setObj(4, 3, 'ship_rail'); M.fillObj(1, 4, 3, 1, 'ship_rail');
    M.setObj(2, 3, 'ladder'); M.walkable(2, 3); M.exit(2, 3, 1, 1, 'ship_deck', 11, 5, DIR.DOWN, { stairs: true });
    M.container(1, 1, 'barrel', 'Anchor Charm', 1);
    M.sign(3, 1, "From up here you can see the whole Karagol. And the barrel nobody ever opens.");
  }
});
// ---- the captain's cabin: the jar with the Nut; the shady man's excuse ----
Kit.interior('ship_cabin', { name: "Captain's Cabin", w: 10, h: 8, music: 'sailing', bg: 'ship', floor: 'floor_wood', wall: 'wall_wood', doorX: 5, back: { map: 'ship_deck', x: 18, y: 5 },
  furn: [['table', 4, 3], ['chair', 3, 3], ['chair', 5, 3], ['bed', 7, 2], ['bed_foot', 7, 3], ['bookshelf', 1, 2], ['shelf', 2, 2]],
  build(M) { M.container(8, 5, 'pot', 'Nut', 1); M.sign(1, 5, "The captain's log: 'Thirty years with the charm on its hook, and never a scratch from the Kraken.'"); M.trigger(4, 5, 3, 1, function* (E) { if (G.flag('charm_returned')) return; yield E.say("An empty hook on the wall, where something used to hang.", 'Mia'); }, { once: 'cabin_hook' }); } });
// ---- the passengers' room ----
Kit.interior('ship_room', { name: "Passengers' Room", w: 12, h: 9, music: 'sailing', bg: 'ship', floor: 'floor_wood', wall: 'wall_wood', doorX: 6, back: { map: 'ship_deck', x: 5, y: 5 },
  furn: [['table', 3, 3], ['chair', 2, 3], ['chair', 4, 3], ['table', 8, 3], ['chair', 7, 3], ['chair', 9, 3], ['shelf', 1, 2], ['shelf', 10, 2]],
  npcs: [
    { id: 'p_bald', x: 2, y: 5, type: 'villager_m', name: 'Balding Man', dir: DIR.RIGHT, text: "I've never rowed a day in my life. Merchants don't." },
    { id: 'p_old', x: 9, y: 5, type: 'elder_m', name: 'Old Man', dir: DIR.LEFT, text: "These old arms couldn't pull an oar if the Kraken itself asked." },
    { id: 'p_young', x: 6, y: 2, type: 'villager_m', name: 'Young Man', dir: DIR.DOWN, text: "...I'd rather stay back here, if it's all the same. The sea makes me ill." },
    { id: 'p_green', x: 4, y: 6, type: 'villager_f', name: 'Girl in Green', dir: DIR.DOWN, text: "Colosso! I want to see the champion crowned. Do you think Lord Babi will be there?" },
  ],
  build(M) { M.container(10, 6, 'crate', 'Coins', 23); M.trigger(5, 7, 3, 1, STORY.shipRoomTalk, { once: 'ship_room_talk', cond: () => G.flag('charm_missing') && !G.flag('charm_returned') }); } });
// ---- the hold: the rowing benches, and a barrel with a Lucky Medal ----
defineMap('ship_hold', {
  name: "Ship's Hold", w: 16, h: 9, base: 'void', music: 'sailing', bg: 'ship', indoor: true, entry: { x: 8, y: 2 },
  build(M) {
    M.room(0, 0, 16, 9, 'floor_wood', 'wall_wood');
    M.set(8, 1, 'stairs_up'); M.setObj(8, 1, null); M.walkable(8, 1); M.exit(8, 1, 1, 1, 'ship_deck', 11, 8, DIR.DOWN, { stairs: true });
    for (let i = 0; i < 5; i++) { M.setObj(2 + i * 3, 3, 'chair'); M.setObj(2 + i * 3, 6, 'chair'); }
    const rower = (id, x, y) => M.npc(id, x, y, { type: 'sailor', name: 'Oarsman', dir: y < 5 ? DIR.DOWN : DIR.UP, text: () => G.flag('crew_met') ? "Back on deck. We'll get you to Tolbi." : "Kraken water, this crossing. We'd feel better with fighters aboard." });
    rower('rower_1', 3, 4); rower('rower_2', 6, 4); rower('rower_3', 9, 4); rower('rower_4', 12, 4); rower('rower_5', 5, 5); rower('rower_6', 11, 5);
    M.npc('rowing_master', 8, 4, { type: 'pirate', name: 'Rowing Master', dir: DIR.UP, script: STORY.rowingMaster });
    M.container(1, 7, 'barrel', 'Lucky Medal', 1);
  }
});
