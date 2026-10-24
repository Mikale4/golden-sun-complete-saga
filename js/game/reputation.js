// ---------- Reputation: what the party thinks of how you treat strangers ----------
// Picking fights with people who did not want one has a cost, and it is paid by the people travelling with you.
// Force enough of them and someone speaks up; keep going and someone walks off to the camp for a while. Nobody
// ever leaves for good - they wait at the hideout until you come and ask them back. This only exists once there
// is a camp for them to go to.
'use strict';

const REP_LINES = {
  Isaac:  { warn: "That one had no quarrel with us.", leave: "I need to think about what we are doing out here. I will be at the camp." },
  Garet:  { warn: "Isaac... they were begging.", leave: "I am not squeamish. That was still enough. Find me at the camp when you are done." },
  Ivan:   { warn: "I could read their mind. They were terrified of us.", leave: "I cannot keep reading that in people. I will wait at the camp." },
  Mia:    { warn: "They asked us to stop. We did not.", leave: "I heal people. I do not stand and watch this. I am going to the camp." },
  Felix:  { warn: "There was no need for that.", leave: "Do what you must. I will be at the camp until it is over." },
  Jenna:  { warn: "Was that necessary?", leave: "I have had enough. The camp. Come and get me when you are yourself again." },
  Sheba:  { warn: "They were scared of us. Did you see?", leave: "I do not want to be the thing people are scared of. I will be at the camp." },
  Piers:  { warn: "That was beneath us.", leave: "Lemuria has a word for this. I will be at the camp until you remember ours." },
  Kraden: { warn: "Alchemy is meant to lift people up, not knock them down.", leave: "I have written enough about violence to know it when I see it. The camp, then." }
};

const Reputation = {
  WARN_AT: 4, LEAVE_AT: 8,
  on() { return G.flag('camp_founded'); },
  score() { return G.get('bully') || 0; },
  // how much a forced fight weighs: nothing if they wanted it, most if they were frightened or paying to avoid it
  weight(d) {
    if (!d) return 0;
    if (d.hunt || d.intent === 'robbery') return 0;
    return { scared: 3, bribe: 3, weary: 2, calm: 2, annoyed: 1, amused: 1, eager: 0 }[d.mood] || 1;
  },
  bullied(d) { if (!this.on()) return; const w = this.weight(d); if (w) G.set('bully', this.score() + w); },
  // time on the road, and nights at an inn, let it fade
  decay(n) { const s = this.score(); if (s > 0) G.set('bully', Math.max(0, s - (n || 1))); },
  // the user's rule: a door off the road wipes the slate - step into any town or area and what was done out there is left out there
  reset() { if (this.score() > 0) G.set('bully', 0); },
  resting() { return G.campResting || (G.campResting = []); },
  isResting(id) { return this.resting().some(o => o.id === id); },
  // who would speak up, or walk: never the one leading the party, gentler souls first
  candidates() {
    const order = ['Mia', 'Sheba', 'Ivan', 'Kraden', 'Piers', 'Isaac', 'Felix', 'Jenna', 'Garet'];
    const P = G.party; const lead = P.leader;
    return P.members.filter(m => m !== lead).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  },
  // called after a fight the player forced on someone who did not want it
  *afterForcedFight(E, d) {
    if (!this.on()) return;
    const w = this.weight(d); if (!w) return;
    const s = this.score();
    const who = this.candidates();
    if (!who.length) return;
    if (s >= this.LEAVE_AT && G.party.members.length > 2) {
      const m = who[Math.random() < 0.6 ? 0 : rnd(who.length)];
      yield E.say(REP_LINES[m.id] ? REP_LINES[m.id].leave : "I will be at the camp.", m.name);
      yield E.say('(' + m.name + ' turns and walks off toward the camp.)');
      this.leave(m);
      G.set('bully', 3);        // the point has been made; it takes real persistence to lose a second one
      return;
    }
    // the first time it gets this far somebody always says something; after that, most of the time
    if (s >= this.WARN_AT && (s - w < this.WARN_AT || Math.random() < 0.7)) {
      const m = who[rnd(Math.min(3, who.length))];
      yield E.say(REP_LINES[m.id] ? REP_LINES[m.id].warn : "...", m.name);
    }
  },
  leave(m) {
    const P = G.party;
    P.remove(m.id);
    this.resting().push(m.serialize());
    if (!P.active.length && P.members.length) P.active.push(P.members[0]);
    if (G.field) { G.field.rebuildFollowers(); G.field.gatherFollowers(); G.field.refreshNpcs(); }
  },
  rejoin(id) {
    const list = this.resting(); const i = list.findIndex(o => o.id === id); if (i < 0) return null;
    const c = Character.deserialize(list.splice(i, 1)[0]);
    c.hp = c.maxHp(); c.pp = c.maxPp(); c.status = {};
    G.party.add(c);
    if (G.field) { G.field.rebuildFollowers(); G.field.gatherFollowers(); G.field.refreshNpcs(); }
    return c;
  },
  // the camp NPC for someone who has walked off: they will come back if asked
  campScript(id) {
    const self = this;
    return function* (E) {
      const o = self.resting().find(x => x.id === id); if (!o) return;
      const name = CHARACTERS[id] ? CHARACTERS[id].name : id;
      const back = self.score() >= self.LEAVE_AT;
      yield E.say(back ? pick(["Not yet. I heard what you have been doing since.", "Ask me again when the road has cooled off."]) : pick(["Been quiet here. Quiet is fine for a while.", "The fire is good. So is the company, mostly."]), name);
      if (back) return;
      const r = yield* E.ask('Come back with us?', name, ['Yes', 'Not yet']);
      if (r !== 0) { yield E.say(pick(["Then not yet.", "Give me a little longer."]), name); return; }
      const c = self.rejoin(id);
      Audio.sfx('levelup');
      yield E.say(pick(["All right. Let us not do that again.", "I am glad you asked. Come on."]), name);
      if (c) yield E.say(c.name + ' rejoined the party!');
    };
  }
};
