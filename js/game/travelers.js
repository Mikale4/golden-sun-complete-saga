// ---------- Travelers: the people on the road ----------
// Weyard's overworld was empty between towns. Now it has traffic: soldiers, merchants, pilgrims, bandits, tribes on
// the move, nobles with their escorts, scholars who are lost. A fresh crowd is rolled every time the party steps out
// onto the world map. Each one is a real Adept - stats grown to a level, Djinn, a class, gear - built the same way
// the party is, so a fight with one is a fight with a person rather than a monster.
'use strict';

const TRAVELER_NAMES = ['Aldo', 'Bram', 'Cato', 'Dorin', 'Elric', 'Fenn', 'Gavric', 'Hale', 'Ivo', 'Jorah', 'Kessa', 'Lira', 'Maud', 'Nessa', 'Orla', 'Pell', 'Quill', 'Rurik', 'Sable', 'Tamsin', 'Ulf', 'Vela', 'Wren', 'Yorick', 'Zev', 'Anwen', 'Bors', 'Cael', 'Dasha', 'Emre', 'Frey', 'Galen', 'Hesper', 'Idris', 'Jun', 'Kiran', 'Leif', 'Mira', 'Nico', 'Odile', 'Petra', 'Rhea', 'Soren', 'Tove', 'Una', 'Varr', 'Wyn', 'Zara'];

// element -> the party members whose growth curves stand in for a stranger of that element
const TRAVELER_TEMPLATES = { 0: ['Isaac', 'Felix'], 1: ['Mia', 'Piers'], 2: ['Garet', 'Jenna'], 3: ['Ivan', 'Sheba'] };

// Each kind: how they look, what they tend to be, how they feel about a fight, what they say.
// mood weights: scared, bribe, annoyed, eager, calm, weary, amused
const TRAVELER_KINDS = {
  soldier:  { label: 'Soldier', look: ['guard'], el: [0, 2, 1], party: [1, 1, 2], intents: { flavour: 4, directions: 1, duel: 2 }, moods: [0, 0, 3, 4, 4, 1, 1], gear: 1.0,
    greet: ["Move along. This road is watched.", "Deserted my post? No. Reassigned. There is a difference, whatever the captain says.", "You carry yourselves like people who have been in a fight. Good. Keep it that way out here.", "Two more days to the garrison. Two more days of my boots.", "If you see a wagon with a broken axle, it is ours. Do not touch it."] },
  warrior:  { label: 'Warrior', look: ['pirate', 'villager_m'], el: [0, 2, 3, 1], party: [1, 1, 1, 2], intents: { flavour: 3, duel: 4, trade: 1 }, moods: [0, 0, 1, 6, 3, 0, 2], gear: 1.15,
    greet: ["I have fought in six countries and lost in two. Guess which.", "There is a monster north of here the size of a house. I am going to see about it.", "You have the look of a fighter. So do I. That is usually where the conversation ends.", "My blade has a name. I will not tell you what it is.", "Coin runs out. Reputation does not. That is why I am walking and not riding."] },
  mercenary:{ label: 'Mercenary', look: ['pirate'], el: [2, 0, 3], party: [1, 2, 2, 3], intents: { flavour: 2, duel: 3, sell: 1, robbery: 1 }, moods: [0, 1, 2, 4, 3, 0, 1], gear: 1.1,
    greet: ["Work is work. Ask me what I am for and I will ask what you are paying.", "The last man who hired us is dead. Not our doing. Mostly.", "Do not look at the scars. They are not the interesting part.", "We were promised a war. We got a road. Same thing in the end."] },
  tourist:  { label: 'Traveler', look: ['villager_m', 'villager_f', 'noble_f'], el: [3, 1, 0, 2], party: [1, 1, 2], intents: { flavour: 4, directions: 4, trade: 1 }, moods: [5, 3, 1, 0, 1, 2, 1], gear: 0.6,
    greet: ["Is it far to the next inn? My feet have opinions.", "I came to see the Lighthouse. I did not expect it to be so... tall.", "They say the roads are safer than they were. They did not say safe.", "I write everything down. Someone should, and it is not going to be my brother.", "Have you eaten? I have far too much bread. Everyone said bring bread."] },
  merchant: { label: 'Merchant', look: ['merchant'], el: [1, 3, 0], party: [1, 2, 2], intents: { sell: 6, flavour: 2, directions: 1 }, moods: [3, 5, 1, 0, 1, 1, 0], gear: 0.8,
    greet: ["Wares, friend, wares! Everything a traveller forgets to pack.", "The prices are fair. The road is not. I am only responsible for one of those.", "I was robbed twice on this road. The third time I started selling to the robbers.", "Look, touch, ask - buying is optional. Mostly."] },
  pilgrim:  { label: 'Pilgrim', look: ['priest', 'monk'], el: [1, 3], party: [1, 1, 2], intents: { heal: 5, flavour: 3, directions: 1 }, moods: [2, 1, 1, 1, 5, 2, 1], gear: 0.5,
    greet: ["The road is the prayer. Walking it is enough.", "Peace on you. You look as if you could use some.", "I have walked from the Mercury Lighthouse. Or towards it. It changes.", "Sit, if you like. Nobody is counting the miles but us."] },
  scholar:  { label: 'Scholar', look: ['scholar', 'elder_m'], el: [1, 3], party: [1], intents: { directions: 5, flavour: 3, trade: 1 }, moods: [4, 3, 1, 0, 2, 2, 1], gear: 0.5,
    greet: ["I am cataloguing the Djinn. It is going slowly. They keep moving.", "Kraden sent me. Well - his letters did. He is very hard to say no to on paper.", "This map is wrong. This map is wrong in three places. Who draws these?", "Do not mind the notebook. Mind the ink; it is the last of it."] },
  bandit:   { label: 'Bandit', look: ['pirate'], el: [2, 0, 3], party: [1, 2, 2, 3], intents: { robbery: 7, flavour: 1 }, moods: [1, 1, 3, 4, 1, 0, 2], gear: 0.9, hunt: true,
    greet: ["Well now. Look what the road brought us.", "Coins first. Then we talk about the rest of it.", "Nothing personal. Everything is personal. Give us the bags.", "You walked right up. That saves us the running."] },
  hunter:   { label: 'Hunter', look: ['villager_m', 'tribal'], el: [0, 3], party: [1, 1, 2], intents: { trade: 5, flavour: 3, directions: 1 }, moods: [1, 1, 2, 2, 4, 2, 1], gear: 0.9,
    greet: ["Tracks up ahead. Big. I would keep to the road if I were you.", "I trade. Pelts, herbs, whatever the forest gave me this week.", "The birds went quiet an hour ago. That is never nothing.", "Do not step there. No - there. Good."] },
  tribe:    { label: 'Nomad', look: ['tribal', 'tribal_f'], el: [0, 2, 3, 1], party: [2, 3, 3], intents: { trade: 4, flavour: 4, heal: 1 }, moods: [1, 0, 2, 2, 4, 3, 1], gear: 0.8,
    greet: ["We are moving south with the season. Everyone we own is on our backs.", "The elders say the ground here remembers the old fire. I say the ground is cold.", "Trade? We have what the plains gave us. It is more than it looks.", "You are far from any village. So are we. That makes us neighbours."] },
  noble:    { label: 'Noble', look: ['noble', 'noble_f'], el: [1, 3, 0], party: [2, 3, 3], intents: { flavour: 4, directions: 2, robbery: 0, duel: 1 }, moods: [3, 5, 3, 0, 1, 0, 1], gear: 1.3,
    greet: ["Do you know who my family is? No. Of course. Nobody does out here, it is marvellous.", "My guards insist on walking. I insist on complaining. We get on.", "Tolbi was gaudy, Kalay was damp, and I am told Lemuria is a rumour.", "You may pass. I was going to say that either way."] },
  monk:     { label: 'Monk', look: ['monk'], el: [2, 0, 3], party: [1, 1, 2], intents: { duel: 5, flavour: 3, heal: 1 }, moods: [0, 0, 0, 6, 4, 0, 2], gear: 0.7,
    greet: ["The Art of Ki is learned on the road, not in the temple. Master Nyunpa says so, and then he goes back inside.", "I am looking for a worthy opponent. I keep finding trees.", "Breath in. Hold. That is the whole secret. Nobody believes me.", "Do you spar? I ask everyone. Most people say no. Some people say it with a sword."] },
  proxian:  { label: 'Proxian', look: ['proxian'], el: [2, 0], party: [1, 2], intents: { flavour: 5, duel: 2, trade: 1 }, moods: [0, 0, 2, 5, 3, 1, 1], gear: 1.1,
    greet: ["The cold here is nothing. You should feel home.", "We came south to see what the world is like before the edge takes it. It is like this.", "Saturos walked this road once. I do not say his name lightly.", "Fire is easy in Prox. It is warmth that is hard."] }
};

const TRAVELER_MOODS = ['scared', 'bribe', 'annoyed', 'eager', 'calm', 'weary', 'amused'];

// What they say when you square up to them. Composed from these, with names and numbers dropped in, so the same
// stranger never quite says the same thing twice.
const CHALLENGE_LINES = {
  scared: ["W-wait! I do not want any trouble! Look at me, I am nobody!", "Please. I have a family. I have two families, actually, it is a long story.", "You are joking. Tell me you are joking.", "I cannot fight you. I cannot fight anyone. I once lost to a goat.", "No no no - I will give you the road, the whole road, take it!", "Is this about the inn bill? I paid the inn bill."],
  bribe:  ["Let us not. I have {coins} coins that say we do not.", "Everyone has a price. Mine is that you walk away, and yours is {coins} coins. Deal?", "I will pay you {coins} to pretend this never happened.", "Coins are cheaper than surgeons. {coins}, and we part as friends.", "Wait - here. {coins}. It is what I would have spent on a healer anyway."],
  annoyed:["Really? Right now? I am busy.", "I have walked all day and now this. Fine. FINE.", "You people. You see a stranger and you see a target. Draw, then.", "Is this how they raise children in Vale? Never mind. Come on.", "If you must. Make it quick, I have somewhere to be.", "You will regret asking. Most do."],
  eager:  ["Ha! I was hoping someone would ask!", "Finally! Do you know how long I have been walking without a proper fight?", "Yes. Yes! No holding back, agreed?", "You saw the blade and you still asked. I like you already.", "Oh, this is going to be a good day after all.", "Draw, then. Let us see what the road has taught you."],
  calm:   ["If you want it, you may have it. I will not go easy.", "Very well. Steel decides what words cannot.", "I have no quarrel with you. But I will not refuse one.", "Are you certain? There is no shame in walking on.", "So be it. Ready when you are."],
  weary:  ["Must we? ...We must, then. Come on.", "I am too old for this and too proud to say no.", "You know I was going to make camp. Now look.", "Alright. But afterwards, one of us buys the drinks."],
  amused: ["You? Fight me? ...No, no, that is wonderful. Go on.", "What did I do to deserve this? Never mind, I am curious now.", "I will give you this: you have nerve. Let us see if you have anything else.", "Heh. Alright, little Adept. Show me."]
};
const WON_LINES = {
  scared: ["Told you. Told you I was nobody.", "I yield! I yielded before we started!"],
  bribe:  ["Should have taken the coins. I certainly should have offered more.", "Fine. Fine! You win. Coins would have been cheaper for us both."],
  annoyed:["Unbelievable. Get on with your day.", "There. Are you satisfied? Because I am late."],
  eager:  ["Ha! Worth it. Every bruise. Same time next year?", "Now THAT was a fight. Thank you. Genuinely."],
  calm:   ["Well fought. The road is yours.", "As I said - no shame in either outcome."],
  weary:  ["...Drinks are on you, then.", "Right. Now I really am making camp."],
  amused: ["Well. Colour me corrected.", "Alright, alright - you have something else too."]
};

const Travelers = {
  MAX: 9,
  seq: 0,
  // ---- rolling one up ---------------------------------------------------------------------------------------
  // How tough this stretch of road is: the enemies that spawn here, read as a level the way the battle does it
  zoneLevel(x, y) {
    const M = G.map; if (!M) return 5;
    const groups = M.def.encAt ? M.def.encAt(x, y) : (M.encounters || []);
    const lv = [];
    for (const gp of groups || []) for (const n of gp) { const e = ENEMY_DB[n]; if (e) lv.push(clamp(Math.floor(Math.sqrt(e.hp) * 0.9), 1, 99)); }
    if (!lv.length) return Math.max(3, Math.round(G.party.members.reduce((a, m) => a + m.level, 0) / Math.max(1, G.party.members.length)) - 2);
    return clamp(Math.round(lv.reduce((a, b) => a + b, 0) / lv.length), 1, 45);
  },
  // most are about the road they are on; one in eight is well beyond it; one in fifty has nothing left to learn
  // Strangers keep pace with the party: their level is the party's average give or take five. One in four is
  // a "strong" traveler - anywhere from the party's level up to the cap of 50 - so the road always has someone worth
  // being wary of, and worth the fight when it goes well.
  STRONG_CHANCE: 0.25,
  partyLevel() { const ms = G.party ? G.party.members : []; return ms.length ? Math.round(ms.reduce((a, m) => a + m.level, 0) / ms.length) : 5; },
  rollLevel(zone) {
    const base = this.partyLevel();
    if (Math.random() < this.STRONG_CHANCE) return clamp(base + rnd(51 - base), 1, 50);
    return clamp(base + rnd(11) - 5, 1, 50);
  },
  pickWeighted(pairs) { let t = 0; for (const [, w] of pairs) t += w; let r = Math.random() * t; for (const [k, w] of pairs) { r -= w; if (r <= 0) return k; } return pairs[pairs.length - 1][0]; },
  // a real Adept: grown to level on one of the party's own curves, with Djinn, a class and gear to match the level
  makeCombatant(kindKey, level) {
    const kind = TRAVELER_KINDS[kindKey];
    const el = kind.el[Math.floor(Math.random() * kind.el.length)];
    const tmpl = pick(TRAVELER_TEMPLATES[el]);
    const c = new Character(tmpl, level);
    c.name = pick(TRAVELER_NAMES);
    // Djinn: mostly their own element, sometimes another - which is what gives them a class of their own
    const count = clamp(Math.floor(level / 6) + rnd(3) - 1, 0, 9);
    const pool = Object.keys(DJINN);
    for (let i = 0; i < count; i++) {
      const wantEl = Math.random() < 0.7 ? el : rnd(4);
      const opts = pool.filter(n => DJINN[n].el === wantEl && !c.djinn.some(d => d.name === n));
      if (opts.length) c.setDjinn(pick(opts));
    }
    // gear: the best they could afford at their level, with a little noise, in every slot they can use
    const budget = Math.floor(15 * level * level * (kind.gear || 1)) + 60;
    for (const slot of ['weapon', 'body', 'arm', 'head']) {
      const fits = Object.keys(ITEM_DB).filter(n => { const it = ITEM_DB[n]; return it.buy > 0 && it.buy <= budget && c.canEquip(n) && c.slotFor(n) === slot && !it.key; })
        .sort((a, b) => ITEM_DB[b].buy - ITEM_DB[a].buy);
      if (fits.length) c.equip[slot] = fits[rnd(Math.min(3, fits.length))];
    }
    c.hp = c.stats().hp; c.pp = c.stats().pp;
    return c;
  },
  // the battle only knows ENEMY_DB rows, so each combatant is written into it under its own key for the fight
  register(c, kindKey, level, look) {
    const key = 'Wayfarer ' + (++this.seq) + ' ' + c.name;
    const st = c.stats();
    const psy = c.psynergy().filter(n => PSY[n] && ['magic', 'epa', 'heal', 'status', 'buff'].includes(PSY[n].type) && (PSY[n].pp || 0) <= st.pp / 3);
    const ab = ['Attack', 'Attack'];
    for (const n of psy.sort(() => Math.random() - 0.5).slice(0, 5)) ab.push(n);
    const exp = Math.max(6, Math.floor((EXP_TABLE[Math.min(99, level + 1)] - EXP_TABLE[level]) / 5));
    // what they leave behind: often nothing but the lesson; sometimes their purse; sometimes what they were wearing
    let dr = null; const r = Math.random();
    if (r < 0.28) { const worn = ['weapon', 'body', 'arm', 'head'].map(s => c.equip[s]).filter(Boolean); if (worn.length) dr = [pick(worn), 1]; }
    else if (r < 0.6) dr = [pick(['Herb', 'Nut', 'Vial', 'Antidote', 'Elixir', 'Psy Crystal', 'Potion']), 1];
    ENEMY_DB[key] = {
      n: key, hp: st.hp, pp: st.pp, atk: st.atk, def: st.def, agi: st.agi, lck: st.lck, t: level >= 36 ? 2 : 1,
      pw: [0, 1, 2, 3].map(e => c.power(e)), rs: [0, 1, 2, 3].map(e => c.resist(e)), ab, exp, c: Math.random() < 0.55 ? level * (6 + rnd(9)) : 0, dr, g: 'traveler',
      traveler: { kind: kindKey, level, cls: c.className(), name: c.name }
    };
    Monsters.customLooks[key] = look;
    return key;
  },
  // ---- the crowd on the map ------------------------------------------------------------------------------------
  spawnAll(F) {
    if (!G.map || !G.map.world || !G.party || !G.party.members.length) return;
    this.clear(F);
    const n = 5 + rnd(this.MAX - 4);
    const kinds = Object.keys(TRAVELER_KINDS);
    for (let i = 0; i < n; i++) {
      const kindKey = kinds[rnd(kinds.length)];
      const spot = this.spotNear(F, F.player.tx, F.player.ty, 6, 26); if (!spot) continue;
      this.spawnGroup(F, kindKey, spot.x, spot.y);
    }
  },
  clear(F) { F.npcs = F.npcs.filter(n => !n.traveler); for (const k of Object.keys(ENEMY_DB)) if (ENEMY_DB[k].g === 'traveler') { delete ENEMY_DB[k]; delete Monsters.customLooks[k]; } },
  spotNear(F, cx, cy, minD, maxD) {
    for (let t = 0; t < 60; t++) {
      const x = cx + rnd(maxD * 2 + 1) - maxD, y = cy + rnd(maxD * 2 + 1) - maxD;
      const d = Math.abs(x - cx) + Math.abs(y - cy);
      if (d < minD || d > maxD) continue;
      if (F.trainWalkable(x, y)) return { x, y };
    }
    return null;
  },
  spawnGroup(F, kindKey, x, y) {
    const kind = TRAVELER_KINDS[kindKey];
    const size = kind.party[rnd(kind.party.length)];
    const zone = this.zoneLevel(x, y), level = this.rollLevel(zone);
    const members = [];
    for (let i = 0; i < size; i++) {
      const lookType = kind.look[rnd(kind.look.length)];
      const look = npcLook(lookType, rnd(100000));
      const c = this.makeCombatant(kindKey, i === 0 ? level : clamp(level - rnd(3), 1, 50));
      members.push({ c, look, key: this.register(c, kindKey, c.level, look) });
    }
    const lead = members[0];
    const intent = this.pickWeighted(Object.entries(kind.intents));
    const mood = TRAVELER_MOODS[this.pickWeighted(TRAVELER_MOODS.map((m, i) => [i, kind.moods[i]]))];
    const data = { id: 'trav_' + this.seq, kind: kindKey, label: kind.label, members, level, intent, mood, hunt: !!kind.hunt, done: false, bribe: Math.max(20, Math.floor(level * (8 + rnd(12)) * (mood === 'bribe' ? 2.5 : 1))) };
    const self = this;
    const leader = F.spawnNpc(data.id, x, y, { look: lead.look, name: lead.c.name + ' the ' + kind.label, script: function* (E) { yield* self.talkScript(E, data); } });
    leader.traveler = data; leader.travelerLeader = true; leader.dir = rnd(4);
    // the rest of a party stands with its leader and drifts along after them
    let placed = 0;
    for (let i = 1; i < members.length; i++) {
      const s = this.spotNear(F, x, y, 1, 2); if (!s) continue;
      const m = members[i];
      const a = F.spawnNpc(data.id + '_' + i, s.x, s.y, { look: m.look, name: m.c.name, script: function* (E) { yield* self.talkScript(E, data); } });
      a.traveler = data; a.travelerFollow = leader; placed++;
    }
    return leader;
  },
  // ---- moving about ----------------------------------------------------------------------------------------------
  tick(F) {
    if (G.noEncounters) return;   // the world editor's peace
    if (!G.map || !G.map.world) return;
    if (F.event || F.textbox.active || F.psyMenu) return;
    F._travT = (F._travT || 0) + 1;
    if (F._travT % 26) return;
    const p = F.player;
    for (const a of F.npcs) {
      if (!a.traveler || a.moving || a.path.length) continue;
      const d = a.traveler;
      if (a.travelerFollow) {                                  // keep near the leader
        const L = a.travelerFollow; const dist = Math.abs(a.tx - L.tx) + Math.abs(a.ty - L.ty);
        if (dist > 2) { const dir = F.dirTo(a, L); if (F.trainWalkable(a.tx + DX[dir], a.ty + DY[dir])) { a.path = [dir]; a.pathSpeed = 0.5; } }
        else if (!rnd(3)) a.dir = rnd(4);
        continue;
      }
      const toPlayer = Math.abs(a.tx - p.tx) + Math.abs(a.ty - p.ty);
      if (d.hunt && !d.done && toPlayer <= 12) {               // bandits close in
        if (toPlayer === 1) { a.dir = F.dirTo(a, p); F.run(function* (E) { yield* Travelers.ambushScript(E, d, a); }); continue; }
        const dir = F.dirTo(a, p);
        // straight at them, or sidestep - never the way back (direction indices are not in clockwise order here)
        const side = [0, 1, 2, 3].filter(dd => DX[dd] * DX[dir] + DY[dd] * DY[dir] === 0);
        const alt = [dir, ...side].find(dd => F.trainWalkable(a.tx + DX[dd], a.ty + DY[dd]));
        if (alt !== undefined) { a.path = [alt]; a.pathSpeed = 0.7; }
        continue;
      }
      if (rnd(5) < 2) { if (!rnd(3)) a.dir = rnd(4); continue; }  // stand about
      const dir = rnd(4);
      if (F.trainWalkable(a.tx + DX[dir], a.ty + DY[dir])) { a.path = [dir]; a.pathSpeed = 0.5; } else a.dir = dir;
    }
  },
  // ---- what they say ----------------------------------------------------------------------------------------------
  fill(line, d) { return line.replace('{coins}', String(d.bribe)).replace('{name}', d.members[0].c.name); },
  who(d) { return d.members[0].c.name; },
  *talkScript(E, d) {
    const kind = TRAVELER_KINDS[d.kind];
    if (d.done) { yield E.say(pick(["...", "We have said what we have to say.", "Go on, then."]), this.who(d)); return; }
    yield E.say(pick(kind.greet), this.who(d));
    switch (d.intent) {
      case 'sell': yield* this.sellFlow(E, d); break;
      case 'trade': yield* this.tradeFlow(E, d); break;
      case 'heal': yield* this.healFlow(E, d); break;
      case 'directions': yield* this.directionsFlow(E, d); break;
      case 'duel': yield* this.duelFlow(E, d); break;
      case 'robbery': yield* this.robberyFlow(E, d); break;
      default: if (Math.random() < 0.5) yield E.say(pick(["Safe roads.", "Well. Good luck to you.", "Do not let me keep you.", "Watch the weather."]), this.who(d));
    }
  },
  *sellFlow(E, d) {
    const lv = d.level;
    const stock = new Set(['Herb', 'Antidote']);
    if (lv >= 8) stock.add('Nut'); if (lv >= 14) stock.add('Vial'); if (lv >= 20) stock.add('Elixir'); if (lv >= 26) stock.add('Psy Crystal'); if (lv >= 32) stock.add('Potion');
    for (const s of ['weapon', 'body', 'arm', 'head']) { const it = d.members[0].c.equip[s]; if (it && Math.random() < 0.5) stock.add(it); }
    if (Math.random() < 0.3) stock.add(pick(['Smoke Bomb', 'Sleep Bomb', 'Oil Drop', 'Bramble Seed', 'Crystal Powder', 'Sacred Feather']));
    const id = 'traveler_' + d.id;
    SHOPS[id] = { name: this.who(d) + "'s pack", items: [...stock].filter(n => ITEM_DB[n]) };
    yield E.say("Have a look, then. It is all I can carry.", this.who(d));
    yield* E.shop(id);
    delete SHOPS[id];
  },
  *tradeFlow(E, d) {
    const c = d.members[0].c;
    const offers = ['weapon', 'body', 'arm', 'head'].map(s => c.equip[s]).filter(Boolean);
    const give = offers.length && Math.random() < 0.6 ? pick(offers) : pick(['Nut', 'Vial', 'Elixir', 'Psy Crystal', 'Lucky Medal', 'Power Bread', 'Cookie']);
    const mine = (G.inventory.items || []).filter(s => ITEM_DB[s.name] && !ITEM_DB[s.name].key && s.name !== give);
    if (!mine.length) { yield E.say("I would trade, but you have nothing I want. No offence.", this.who(d)); return; }
    const want = pick(mine).name;
    const r = yield* E.ask("I will give you my " + give + " for your " + want + ". Fair?", this.who(d), ['Trade', 'No thanks']);
    if (r !== 0) { yield E.say(pick(["Suit yourself.", "Your loss. Or mine. Hard to say."]), this.who(d)); return; }
    G.inventory.remove(want); yield E.give(give);
    yield E.say(pick(["Pleasure doing business.", "Good. Now we are both slightly different people."]), this.who(d));
    d.done = true;
  },
  *healFlow(E, d) {
    const hurt = G.party.members.some(m => !m.alive || m.hp < m.maxHp() || m.pp < m.maxPp());
    if (!hurt) { yield E.say("You look well enough. Keep it so.", this.who(d)); return; }
    const fee = Math.random() < 0.4 ? Math.max(10, d.level * 4) : 0;
    const r = yield* E.ask(fee ? "You are hurt. I can tend to that, for " + fee + " coins toward the road." : "You are hurt. Sit. This costs nothing.", this.who(d), ['Yes', 'No']);
    if (r !== 0) return;
    if (fee && G.party.coins < fee) { yield E.say("Then we will call it a gift. Sit.", this.who(d)); } else G.party.coins -= fee;
    for (const m of G.party.members) { if (!m.alive) m.status.down = false; m.hp = m.maxHp(); m.pp = m.maxPp(); m.status = {}; }
    Audio.sfx('heal'); Engine.doFlash(8, '#c0ffd0');
    yield E.say(pick(["There. Whole again.", "The road takes; someone has to give back.", "Go carefully. I will not be here twice."]), this.who(d));
    d.done = true;
  },
  // they name a place on this map and ask which way; the map knows the truth
  *directionsFlow(E, d) {
    const M = G.map, F = G.field; const places = Object.entries(M.def.places || {}).filter(([, v]) => MAPS[v.map] && !(v.cond && !v.cond()));
    if (!places.length) { yield E.say("...Never mind. I do not think anyone knows where anything is.", this.who(d)); return; }
    const [k, v] = pick(places); const [px, py] = k.split(',').map(Number);
    const dx = px - F.player.tx, dy = py - F.player.ty;
    const truth = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'East' : 'West') : (dy > 0 ? 'South' : 'North');
    const target = MAPS[v.map].name || v.map;
    const r = yield* E.ask("Which way to " + target + "? I have been walking in circles.", this.who(d), ['North', 'South', 'East', 'West']);
    const said = ['North', 'South', 'East', 'West'][r];
    if (said === truth) {
      const reward = Math.random() < 0.5 ? { coins: Math.max(15, d.level * (5 + rnd(10))) } : { item: pick(['Nut', 'Vial', 'Elixir', 'Lucky Medal', 'Sacred Feather', 'Power Bread', 'Cookie', 'Apple']) };
      yield E.say(pick([truth + ". Of course. Thank you - here, for your trouble.", "Then I have been walking the wrong way for a day. Take this, and my thanks."]), this.who(d));
      if (reward.coins) { G.party.coins += reward.coins; Audio.sfx('item'); yield E.say('Received ' + reward.coins + ' coins.'); } else yield E.give(reward.item);
    } else {
      yield E.say(pick(["Hm. That does not feel right, but I will try it.", "If you say so. If I end up in the sea I am blaming you."]), this.who(d));
    }
    d.done = true;
  },
  *duelFlow(E, d) {
    const r = yield* E.ask(pick(["Spar with me? Nothing to lose but pride.", "You look capable. A bout, here, now?", "I have a rule: everyone I meet gets one chance to knock me down."]), this.who(d), ['Fight', 'Not today']);
    if (r !== 0) { yield E.say(pick(["Another time, then.", "Sensible. Boring, but sensible."]), this.who(d)); return; }
    yield* this.fight(E, d, { duel: true });
  },
  *robberyFlow(E, d) {
    const take = Math.min(G.party.coins, Math.max(30, d.level * (10 + rnd(20))));
    const r = yield* E.ask(take > 0 ? "Hand over " + take + " coins and nobody bleeds." : "Empty pockets? Then we take it out of your hide.", this.who(d), take > 0 ? ['Pay', 'Refuse'] : ['Fight']);
    if (take > 0 && r === 0) { G.party.coins -= take; yield E.say(pick(["Smart. Walk on.", "See? Painless. Mostly."]), this.who(d)); d.done = true; return; }
    yield E.say(pick(["Wrong answer.", "Ha! I was hoping you would say that."]), this.who(d));
    yield* this.fight(E, d, { hostile: true });
  },
  *ambushScript(E, d, a) {
    if (d.done) return;
    yield E.say(pick(TRAVELER_KINDS.bandit.greet), this.who(d));
    yield* this.robberyFlow(E, d);
  },
  // ---- squaring up (Select) --------------------------------------------------------------------------------------
  *challengeScript(E, d) {
    if (d.done) { yield E.say(pick(["We have settled that.", "Once was enough."]), this.who(d)); return; }
    const mood = d.mood; const line = this.fill(pick(CHALLENGE_LINES[mood]), d);
    yield E.say(line, this.who(d));
    if (mood === 'bribe' || (mood === 'scared' && Math.random() < 0.5)) {
      const offer = d.bribe;
      const r = yield* E.ask(mood === 'bribe' ? "So? " + offer + " coins to walk away." : "I have " + offer + " coins. Take them and go. Please.", this.who(d), ['Take the coins', 'Fight anyway', 'Leave them be']);
      if (r === 0) { G.party.coins += offer; Audio.sfx('item'); yield E.say(pick(["Thank you. Thank you. Go.", "Never let it be said I cannot be reasoned with."]), this.who(d)); yield E.say('Received ' + offer + ' coins.'); d.done = true; return; }
      if (r === 2) { yield E.say(pick(["Oh - oh, thank you.", "...Right. Right. Good day."]), this.who(d)); return; }
      yield E.say(pick(["Then you are a fool and a bully. Come on!", "No? Fine. FINE."]), this.who(d));
    } else {
      const r = yield* E.ask(mood === 'scared' ? "Fight them?" : "Fight " + this.who(d) + "?", null, ['Yes', 'No']);
      if (r !== 0) { yield E.say(pick({ scared: ["Oh thank goodness.", "Bless you. Bless you."], annoyed: ["Wasting my time.", "Then why ASK."], eager: ["Aw. Next time, then.", "Coward! ...Kidding. Mostly."], calm: ["A wise choice, or a kind one.", "Safe roads."], weary: ["Good. Good.", "Thank the elders."], amused: ["Ha! You should see your face.", "Another day, little Adept."], bribe: ["Sensible.", "Good."] }[mood]), this.who(d)); return; }
    }
    yield* this.fight(E, d, { forced: true });
  },
  *fight(E, d, opts) {
    const names = d.members.map(m => m.key);
    const r = yield* E.battle(names, { canFlee: !opts.hostile, music: d.level >= 40 ? 'boss' : undefined });
    if (r !== 'win') { if (r === 'fled') yield E.say(pick(["Ha! Run, then!", "Come back when you mean it."]), this.who(d)); return; }
    d.done = true;
    yield E.say(pick(WON_LINES[d.mood]), this.who(d));
    // the beaten go on their way
    const F = G.field; F.npcs = F.npcs.filter(n => !(n.traveler && n.traveler.id === d.id));
    // and the party remembers who started it
    if (opts.forced && typeof Reputation !== 'undefined') { Reputation.bullied(d); yield* Reputation.afterForcedFight(E, d); }
  }
};
