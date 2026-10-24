// ---------- Shops ----------
'use strict';
class ShopScene {
  constructor(shopId) {
    this.transparent = true; this.closed = false; this.shop = SHOPS[shopId] || { name: 'Shop', items: ['Herb'] }; this.page = 'main';
    this.shopId = shopId; this.main = new MenuList([{ label: 'Buy', id: 'buy' }, { label: 'Sell', id: 'sell' }, { label: 'Artifacts', id: 'art' }, { label: 'Leave', id: 'leave' }], { x: 10, y: 20, w: 60, rows: 4, lineH: 11 });
    this.textbox = new Textbox(); this.msg = 'Welcome! What can I do for you?'; this.qty = 1;
  }
  buyList() { return this.shop.items.filter(n => ITEM_DB[n]).map(n => ({ label: n, id: n, right: ITEM_DB[n].buy, disabled: G.party.coins < ITEM_DB[n].buy })); }
  artList() { const l = Artifacts.list(); return Artifacts.forShop(this.shopId).map(n => ({ label: n, id: n, right: ITEM_DB[n].buy + (l[n] > 1 ? ' x' + l[n] : ''), disabled: G.party.coins < ITEM_DB[n].buy })); }
  sellList() { return G.inventory.items.filter(s => !ITEM_DB[s.name].key && ITEM_DB[s.name].sell > 0).map(s => ({ label: (ITEM_DB[s.name] && ITEM_DB[s.name].n) || s.name, id: s.name, right: ITEM_DB[s.name].sell + ' x' + s.qty })); }
  update() {
    this.textbox.update(); if (this.textbox.active) return;
    if (this.page === 'main') { this.main.update(); if (this.main.cancelled || (this.main.chosen && this.main.chosen.id === 'leave')) { this.closed = true; Engine.pop(); return; } if (this.main.chosen) { this.page = this.main.chosen.id; this.list = new MenuList(this.page === 'buy' ? this.buyList() : this.page === 'art' ? this.artList() : this.sellList(), { x: 80, y: 20, w: 150, rows: 9, lineH: 11 }); this.msg = this.page === 'buy' ? 'What would you like?' : this.page === 'art' ? 'The artifacts we hold. Rare things - and priced so.' : 'What will you sell?'; if (!this.list.items.length) this.msg = this.page === 'art' ? 'No artifacts have come our way yet.' : 'Nothing to sell.'; } return; }
    if (this.page === 'buy' || this.page === 'sell' || this.page === 'art') {
      this.list.update(); if (this.list.cancelled) { this.page = 'main'; this.msg = 'Anything else?'; return; }
      if (this.list.chosen) {
        if (this.page === 'art') {   // an artifact bought back comes off the shared list
          const n = this.list.chosen.id, it = ITEM_DB[n]; if (it.buy > G.party.coins) { this.msg = "You can't afford that."; Audio.sfx('buzz'); return; }
          if (Artifacts.take(n)) { G.party.coins -= it.buy; G.inventory.add(n, 1); Audio.sfx('shop'); this.msg = 'The ' + n + ' is yours. A fine choice.'; } this.list.reset(this.artList()); return;
        }
        this.item = this.list.chosen.id; this.qty = 1; this.page = this.page === 'buy' ? 'buyQty' : 'sellQty';
      }
      return;
    }
    if (this.page === 'buyQty' || this.page === 'sellQty') {
      const it = ITEM_DB[this.item]; const max = this.page === 'buyQty' ? Math.min(30, Math.floor(G.party.coins / Math.max(1, it.buy))) : G.inventory.count(this.item);
      if (Input.repeat('up') || Input.repeat('right')) { this.qty = Math.min(max, this.qty + 1); Audio.sfx('cursor'); } if (Input.repeat('down') || Input.repeat('left')) { this.qty = Math.max(1, this.qty - 1); Audio.sfx('cursor'); }
      if (Input.pressed('b')) { this.page = this.page === 'buyQty' ? 'buy' : 'sell'; Audio.sfx('cancel'); return; }
      if (Input.pressed('a')) {
        if (this.page === 'buyQty') { const cost = it.buy * this.qty; if (cost > G.party.coins) { this.msg = "You can't afford that."; Audio.sfx('buzz'); return; } G.party.coins -= cost; G.inventory.add(this.item, this.qty); Audio.sfx('shop'); this.msg = 'Thank you! Anything else?';
          this.spent = (this.spent || 0) + cost; if (this.spent >= 400 && chance(0.5)) { this.spent = 0; G.inventory.add('Game Ticket'); this.msg = "Here, take a Game Ticket for the Lucky Wheel in Tolbi. Thanks for your custom!"; Audio.sfx('shop'); } this.page = 'buy'; this.list.reset(this.buyList()); }
        else { const gain = it.sell * this.qty; G.inventory.remove(this.item, this.qty); G.party.coins += gain; Audio.sfx('shop'); Artifacts.add(this.item, this.qty); this.msg = 'Sold for ' + gain + ' coins.' + (Artifacts.isArtifact(this.item) ? ' An artifact - it goes on our list, should you want it back.' : ''); this.page = 'sell'; this.list.reset(this.sellList()); }
      }
    }
  }
  draw(g) {
    UI.window(g, 4, 4, 232, 14); Font.draw(g, this.shop.name, 120, 7, '#ffe080', { align: 'center' });
    UI.window(g, 4, 20, 70, 54); this.main.y = 24; this.main.draw(g);
    UI.window(g, 4, 76, 70, 20); Font.draw(g, 'Coins', 8, 80, '#a0c0ff'); Font.draw(g, String(G.party.coins), 70, 80, '#ffffff', { align: 'right' });
    UI.window(g, 76, 20, 160, 116);
    if (this.page !== 'main') { this.list.y = 24; this.list.x = 82; this.list.draw(g); const cur = this.list.current; if (cur) { const it = ITEM_DB[cur.id]; const d = it.desc || (it.atk ? 'Attack +' + it.atk : it.def ? 'Defense +' + it.def : ''); Font.wrap(d, 150).slice(0, 1).forEach(l => Font.draw(g, l, 82, 122, '#e0e8ff')); if (it.atk || it.def) { const who = G.party.members.filter(m => m.canEquip(cur.id)).map(m => m.name.slice(0, 3)).join(' '); Font.draw(g, 'Equip: ' + (who || 'nobody'), 82, 112, '#a0c0ff'); } } }
    if (this.page === 'buyQty' || this.page === 'sellQty') { const it = ITEM_DB[this.item]; UI.window(g, 90, 60, 120, 40); Font.draw(g, this.item + '  x' + this.qty, 150, 66, '#ffffff', { align: 'center' }); Font.draw(g, 'Total: ' + (this.page === 'buyQty' ? it.buy : it.sell) * this.qty, 150, 78, '#ffe080', { align: 'center' }); Font.draw(g, 'Up/Down: qty  A: confirm', 150, 90, '#a0b0d0', { align: 'center' }); }
    UI.window(g, 4, 138, 232, 18); Font.draw(g, this.msg, 10, 143, '#ffffff');
    this.textbox.draw(g);
  }
}
