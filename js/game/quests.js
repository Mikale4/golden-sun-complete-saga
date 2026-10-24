// ---------- Quest log ----------
// Two games' worth of story is a lot to hold in your head after a week away. The flags already know exactly where
// you stand, so this reads them back: the thread you are on, everything you have already done, and the side work
// that is open somewhere behind you.
'use strict';

// Each entry is { t: what to do, done: the flag that means it happened, at: where it happens }
const QUEST_MAIN = [
  { t: 'Escape the storm above Vale', done: 'prologue_done', at: 'Vale' },
  { t: 'Follow Kraden into Sol Sanctum', done: 'sanctum_done', at: 'Sol Sanctum' },
  { t: 'Recover what the thieves took in Vault', done: 'vault_thieves_done', at: 'Vault' },
  { t: 'Break the curse on Kolima Forest', done: 'tret_cured', at: 'Kolima Forest' },
  { t: 'Stop Saturos at the Mercury Lighthouse', done: 'mercury_lit', at: 'Imil' },
  { t: 'Clear the beast from Mogall Forest', done: 'killer_ape_done', at: 'Mogall Forest' },
  { t: 'Drain the flooded mine at Altin', done: 'hydros_done', at: 'Altin' },
  { t: 'Cross the Lamakan Desert', done: 'manticore_done', at: 'Lamakan Desert' },
  { t: 'Free Hammet from the fortress of Lunpa', done: 'hammet_rescued', at: 'Lunpa' },
  { t: 'Take ship from Kalay to Tolbi', done: 'kraken_done', at: 'Kalay' },
  { t: 'Win Colosso and earn Babi\'s audience', done: 'colosso_done', at: 'Tolbi' },
  { t: 'Find Lord Babi in Altmiller Cave', done: 'babi_found', at: 'Altmiller Cave' },
  { t: 'Cross Suhalla and reach Lalivero', done: 'gate_opened', at: 'Suhalla Desert' },
  { t: 'Climb the Venus Lighthouse after Saturos and Menardi', done: 'venus_lit', at: 'Venus Lighthouse' },
  { t: 'Wake on Idejima and reach Daila', done: 'daila_arrived', at: 'Daila' },
  { t: 'Climb the Dehkan Plateau', done: 'chestbeater_done', at: 'Dehkan Plateau' },
  { t: 'Cross Yampi Desert to Alhafra', done: 'king_scorpion_done', at: 'Yampi Desert' },
  { t: 'Answer for Briggs in Madra', done: 'briggs_caught', at: 'Madra' },
  { t: 'Clear Piers of the charge against him', done: 'piers_freed', at: 'Madra' },
  { t: 'Wake the Great Gabomba for the Kibombo', done: 'gabomba_open', at: 'Gabomba Statue' },
  { t: 'Sail with Piers for the open sea', done: 'piers_joined', at: 'Madra' },
  { t: 'Recover the Shaman\'s Rod for Champa', done: 'char_given', at: 'Gondowan Cliffs' },
  { t: 'Take the Right Prong from the Sea God\'s Shrine', done: 'sea_god_tear', at: 'Sea God\'s Shrine' },
  { t: 'Learn Parch beneath Aqua Rock', done: 'parch_learned', at: 'Aqua Rock' },
  { t: 'Slay the Serpent in Gaia Rock for Izumo', done: 'serpent_done', at: 'Gaia Rock' },
  { t: 'Gather the three prongs and have Obaba forge the Trident', done: 'trident_forged', at: 'Champa' },
  { t: 'Strike Poseidon and open the Sea of Time', done: 'poseidon_done', at: 'Sea of Time' },
  { t: 'Earn the trust of Lemuria', done: 'hover_got', at: 'Lemuria' },
  { t: 'Walk the Trial Road to Shaman Village', done: 'trial_road_won', at: 'Trial Road' },
  { t: 'Light the Jupiter Lighthouse and find the others', done: 'jupiter_lit', at: 'Jupiter Lighthouse' },
  { t: 'Blast the way through to Loho', done: 'loho_blasted', at: 'Loho' },
  { t: 'Thaw the road north through Magma Rock', done: 'mars_thawed', at: 'Magma Rock' },
  { t: 'Take the Mars Lighthouse and end it', done: 'game_complete', at: 'Mars Lighthouse' }
];

// Side work. `open` says when it becomes findable at all - before that it is not listed, because knowing it exists
// is half the spoiler.
const QUEST_SIDE = [
  { t: 'Cure Tret and the trees of Kolima', done: 'tret_cured', open: () => G.flag('kolima_arrived'), at: 'Kolima Forest' },
  { t: 'Learn the Art of Ki from Master Nyunpa', done: 'nyunpa_done', open: () => G.flag('barricade_open'), at: 'Xian' },
  { t: 'Return Feizhi\'s rescue with a word to Hsu', done: 'feizhi_done', open: () => G.flag('kolima_bridge_fixed'), at: 'Xian' },
  { t: 'Face Deadbeard beneath Crossbone Isle', done: 'deadbeard_done', open: () => G.flag('tempest_lizard_done') || G.flag('gs1_complete'), at: 'Crossbone Isle' },
  { t: 'Douse the tornado at the end of Suhalla Desert', done: 'tempest_lizard_done', open: () => G.flag('babi_permission'), at: 'Suhalla Desert' },
  { t: 'Raise a camp for all eight Adepts', done: 'camp_founded', open: () => G.flag('jupiter_lit'), at: 'Atteka' },
  { t: 'Let Sunshine forge something out of what you carry', done: 'forged_once', open: () => !!(typeof Forge !== 'undefined' && (Forge.held().length || G.get('forge_order'))), at: 'Yallam' },
  { t: 'Trade a pretty stone up and up until a turtle is home', done: 'islet_open', open: () => G.flag('poseidon_done'), at: 'the islets' },
  { t: 'Settle with the bandits Vault ran out of town', done: 'vault_bandits_done', open: () => G.flag('piers_freed') && (G.flag('vault_thieves_done') || G.flag('gs1_complete')), at: 'Madra' },
  { t: 'Carry a ring from Feizhi to a boy she never saw', done: 'feizhi_ring', open: () => G.flag('feizhi_done') || G.flag('gs1_complete'), at: 'Champa' },
  { t: 'Answer the Colosso champions who cried foul', done: 'colosso_rematch_done', open: () => !!G.party.get('Isaac') && (G.flag('colosso_done') || G.flag('gs1_complete')), at: 'Trial Road' },
  { t: 'Take the Star Magician\'s treasure', done: 'star_magician_done', open: () => G.flag('poseidon_done'), at: 'Treasure Isle' },
  { t: 'Put Valukar back to sleep', done: 'valukar_done', open: () => G.flag('teleportUnlocked'), at: 'Yampi Desert Cave' },
  { t: 'Face the Sentinel under the islet', done: 'sentinel_done', open: () => G.flag('islet_open'), at: 'Islet Cave' },
  { t: 'Bring all seventy-two Djinn to the Anemos Sanctum', done: 'dullahan_done', open: () => G.flag('islet_open'), at: 'Anemos Sanctum' }
];

const Quests = {
  main() { return QUEST_MAIN.filter(q => G.flag(q.done) || QUEST_MAIN.indexOf(q) === this.currentIdx()); },
  // where you are is the first unfinished beat AFTER the last one you finished - a save that skipped a flag along the
  // way should not send you back to the start of the game
  currentIdx() {
    let last = -1;
    for (let i = 0; i < QUEST_MAIN.length; i++) if (G.flag(QUEST_MAIN[i].done)) last = i;
    for (let i = last + 1; i < QUEST_MAIN.length; i++) if (!G.flag(QUEST_MAIN[i].done)) return i;
    return -1;
  },
  current() { const i = this.currentIdx(); return i < 0 ? null : QUEST_MAIN[i]; },
  // everything already behind you, newest first
  doneList() { return QUEST_MAIN.filter(q => G.flag(q.done)).reverse(); },
  side() { return QUEST_SIDE.filter(q => G.flag(q.done) || (q.open ? safeCall(q.open) : true)); }
};
function safeCall(f) { try { return !!f(); } catch (e) { return false; } }

class QuestScene {
  constructor() {
    this.closed = false; this.tab = 0;            // 0 = the road ahead, 1 = side work, 2 = done
    this.build();
  }
  build() {
    let rows;
    const fit = (t) => Font.fit(t, 202);
    if (this.tab === 0) { const c = Quests.current(); rows = c ? [{ label: fit(c.t), id: c, right: '' }] : [{ label: 'The journey is over.', id: null, right: '' }]; }
    else if (this.tab === 1) rows = Quests.side().map(q => ({ label: fit((G.flag(q.done) ? '* ' : '  ') + q.t), id: q, right: '', color: G.flag(q.done) ? '#80b080' : '#ffffff' }));
    else rows = Quests.doneList().map(q => ({ label: fit(q.t), id: q, right: '', color: '#90a0c0' }));
    this.list = new MenuList(rows, { x: 8, y: 40, w: 214, rows: 8, lineH: 12 });
  }
  update() {
    if (Input.pressed('left')) { this.tab = (this.tab + 2) % 3; this.build(); Audio.sfx('cursor'); return; }
    if (Input.pressed('right')) { this.tab = (this.tab + 1) % 3; this.build(); Audio.sfx('cursor'); return; }
    this.list.update();
    if (this.list.cancelled) { this.closed = true; Engine.pop(); return; }
  }
  draw(g) {
    UI.window(g, 2, 2, SCREEN_W - 4, 16);
    Font.draw(g, 'Quests', 8, 6, '#ffe080');
    const i = Quests.currentIdx();
    Font.draw(g, i < 0 ? 'Complete' : 'Chapter ' + (i + 1) + ' of ' + QUEST_MAIN.length, 150, 6, '#c0d0ff', { align: 'right' });
    Font.draw(g, 'X: back', SCREEN_W - 8, 6, '#8090b0', { align: 'right' });
    ['Current', 'Side work', 'Behind you'].forEach((nm, k) => {
      const x = 14 + k * 78, on = k === this.tab;
      if (on) UI.panel(g, x - 6, 20, 72, 14);
      Font.draw(g, nm, x, 23, on ? '#ffe080' : '#7080a0');
    });
    UI.window(g, 4, 36, SCREEN_W - 8, 120);
    this.list.draw(g);
    const cur = this.list.current && this.list.current.id;
    if (cur && cur.at) Font.draw(g, cur.at, SCREEN_W - 12, 146, '#a0c0ff', { align: 'right' });
    if (this.tab === 1 && !this.list.items.length) Font.draw(g, 'Nothing open that you know of.', 12, 44, '#8090b0');
  }
}
