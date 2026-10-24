// ---------- Boot & new game setup ----------
'use strict';
const Game = {
  start() {
    if (typeof Settings !== 'undefined') Settings.load();   // volumes, window colour and text speed before anything is drawn

    Engine.init();
    Engine.push(new TitleScene());
    Engine.fade = 1; Engine.fadeIn(30);
    if (/[?&]export=assets/.test(location.search)) this.exportAssets();   // write the generated art out as PNGs under assets/ (see tools/export_assets.js)
  },
  // a fresh game gives the map export its flags; the prologue is not run
  exportAssets() {
    Audio.muted = true;
    this.resetState(); G.party.add(new Character('Isaac', 1)); const f = new FieldScene(); Engine.replace(f); f.loadMap('vale', undefined, undefined, undefined, { noAutosave: true }); f.event = null; Engine.fade = 0;
    fetch('/tools/export_assets.js').then(r => r.text()).then(t => { eval(t); return ExportAssets.run({ force: /[?&]force=1/.test(location.search) }); }).then(log => { document.title = 'assets exported'; console.log(log.join(String.fromCharCode(10))); });
  },
  resetState() { G.flags = {}; G.party = new Party(); G.inventory = new Inventory(); G.playtime = 0; G.visited = {}; G.game = 1; G.quick = {}; },
  newGame() {
    this.resetState();
    const isaac = new Character('Isaac', 1); isaac.equip.weapon = 'Wooden Stick'; isaac.equip.body = 'Cotton Shirt'; isaac.equip.arm = 'Leather Gloves';
    G.party.add(isaac); G.party.coins = 0;
    G.inventory.add('Herb', 3);
    const f = new FieldScene(); Engine.replace(f);
    f.loadMap('vale_isaac_room_past', 5, 3, DIR.LEFT);   // asleep, the night of the storm
    Engine.fade = 1;
    f.run(STORY.prologue);
  },
  loadSettings() { if (typeof Settings !== 'undefined') Settings.load(); },
  newGameTLA() {
    this.resetState(); G.game = 2;
    G.set('gs1_complete'); G.set('venus_lit'); G.set('mercury_lit');
    this.tlaParty(G.party); G.party.coins = 200;
    G.inventory.add('Herb', 5); G.inventory.add('Antidote', 2); G.inventory.add('Mythril Bag'); G.inventory.add('Jupiter Star'); G.inventory.add("Shaman's Rod");   // the bag with the last star in it; Ivan's rod, claimed by Felix at the Venus Lighthouse: the Shaman tribe of Hesperia will want it back
    const f = new FieldScene(); Engine.replace(f);
    f.loadMap('venus_lh_top', 12, 14, DIR.UP);
    Engine.fade = 1;
    f.run(function* (E) { yield* E.chapter('The Lost Age'); yield* STORY_TLA.begin(E); });
  },
  // The Lost Age's party as it stands at the foot of Venus Lighthouse: Jenna leads the way down; Felix and Sheba
  // are in the sea below and take their places once they wash ashore
  tlaParty(party) {
    const felix = new Character('Felix', 5); felix.equip.weapon = 'Short Sword'; felix.equip.body = 'Leather Armor'; felix.equip.arm = 'Leather Gloves';
    const jenna = new Character('Jenna', 6); jenna.equip.weapon = 'Wooden Stick'; jenna.equip.body = 'Cotton Shirt';
    const sheba = new Character('Sheba', 5); sheba.equip.weapon = 'Wooden Stick'; sheba.equip.body = 'Cotton Shirt';
    party.add(jenna); party.add(felix); party.add(sheba);
  }
};
if (document.readyState === 'complete') Game.start(); else window.addEventListener('load', () => Game.start());
