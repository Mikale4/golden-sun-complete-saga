// ---------- Main menu (field) ----------
'use strict';
class MenuScene {
  constructor(field, opts) {
    this.field = field; this.transparent = true; this.opts = opts || {}; this.page = 'main'; this.stack = [];
    this.main = new MenuList([{ label: 'Psynergy', id: 'psy' }, { label: 'Djinn', id: 'djinn' }, { label: 'Items', id: 'item' }, { label: 'Equip', id: 'equip' }, { label: 'Status', id: 'status' }, { label: 'Summon', id: 'summon' }, { label: 'Quests', id: 'quests' }, { label: 'Bestiary', id: 'bestiary' }, { label: 'Party', id: 'party' }, { label: 'Settings', id: 'settings' }, { label: 'Save', id: 'save' }], { x: 8, y: 8, w: 70, rows: 11, lineH: 11 });
    this.charIdx = 0; this.sub = null; this.msg = ''; this.msgT = 0; this.textbox = new Textbox(); this.co = null;
    if (this.opts.psyField) { this.page = 'psyTarget'; this.psyName = this.opts.psyField; this.caster = this.opts.caster; this.targetMenu = this.makeTargetMenu(); }
  }
  enter() { Audio.sfx('confirm'); }
  get members() { return G.party.members; }
  say(t) { this.msg = t; this.msgT = 90; }
  makeTargetMenu() { return new MenuList(this.members.map(m => ({ label: m.name + '  HP ' + m.hp + '/' + m.maxHp() + (m.down ? ' (Down)' : ''), id: m })), { x: 100, y: 20, w: 130, rows: 8, lineH: 11 }); }
  update() {
    if (this.msgT > 0) this.msgT--;
    this.textbox.update(); if (this.textbox.active) return;
    if (this.co) { if (this.co.update()) this.co = null; return; }
    const P = this.page;
    if (P === 'main') {
      this.main.update();
      if (this.main.cancelled) { Engine.pop(); return; }
      if (this.main.chosen) { const id = this.main.chosen.id; this.charIdx = 0;
        if (id === 'save') { Engine.push(new SaveSlotScene(this.field, 'save')); return; }
        if (id === 'quests') { Engine.push(new QuestScene()); return; }
        if (id === 'bestiary') { Engine.push(new BestiaryScene()); return; }
        if (id === 'settings') { Engine.push(new SettingsScene()); return; }
        if (id === 'party') { if (this.members.length <= 4) { this.say('No reserve members.'); return; } this.page = 'party'; this.sub = new MenuList(this.members.map(m => ({ label: m.name, id: m, right: G.party.active.includes(m) ? 'Front' : 'Back' })), { x: 90, y: 12, w: 140, rows: 8, lineH: 11 }); this.swapFirst = null; return; }
        if (id === 'item') { this.openItemPage(); return; }
        this.page = 'pickChar'; this.pickFor = id; this.charMenu = new MenuList(this.members.map(m => ({ label: m.name, id: m })), { x: 90, y: 12, w: 140, rows: 8, lineH: 11 });
      }
      return;
    }
    if (P === 'pickChar') {
      if (this.pickFor === 'djinn' && Input.pressed('r')) { const sc = new DjinnDexScene(); Engine.push(sc); return; }
      this.charMenu.update(); if (this.charMenu.cancelled) { this.page = 'main'; return; }
      if (this.charMenu.chosen) { this.ch = this.charMenu.chosen.id; this.charIdx = this.members.indexOf(this.ch); this.openCharPage(this.pickFor); }
      return;
    }
    if (P === 'psy') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'pickChar'; return; }
      if (Input.pressed('l') || Input.pressed('r')) { this.cycleChar(Input.pressed('r') ? 1 : -1); this.openCharPage('psy'); return; }
      if (this.sub.chosen) { const name = this.sub.chosen.id; const p = PSY[name]; if (this.ch.pp < p.pp) { this.say('Not enough PP.'); return; } if (p.type === 'heal' || p.type === 'cure' || p.type === 'revive') { this.psyName = name; this.caster = this.ch; this.page = 'psyTarget'; this.targetMenu = this.makeTargetMenu(); return; } if (p.fieldOnly || p.field) { Engine.pop(); this.field.usePsy(name, this.ch); return; } this.say("Can't use that here."); }
      return;
    }
    if (P === 'psyTarget') {
      this.targetMenu.update(); if (this.targetMenu.cancelled) { if (this.opts.psyField) { Engine.pop(); return; } this.page = 'psy'; return; }
      if (this.targetMenu.chosen) {
        const p = PSY[this.psyName]; const c = this.caster;
        if (c.pp < p.pp) { this.say('Not enough PP.'); return; }
        const targets = p.range === 'all' ? this.members.filter(m => m.alive) : [this.targetMenu.chosen.id];
        let any = false;
        for (const t of targets) {
          if (p.type === 'heal') { if (!t.alive || t.hp >= t.maxHp()) continue; t.heal(p.base); any = true; }
          else if (p.type === 'cure') { let did = false; for (const s of p.cures) if (t.status[s]) { delete t.status[s]; did = true; } if (did) any = true; }
          else if (p.type === 'revive') { if (!t.down) continue; t.status.down = false; t.hp = Math.floor(t.maxHp() * p.amt); any = true; }
        }
        if (!any) { this.say('No effect.'); Audio.sfx('buzz'); return; }
        c.pp -= p.pp; Audio.sfx('heal'); this.targetMenu = this.makeTargetMenu(); this.say(c.name + ' used ' + this.psyName + '.');
      }
      return;
    }
    if (P === 'djinn') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'pickChar'; return; }
      if (Input.pressed('l') || Input.pressed('r')) { this.cycleChar(Input.pressed('r') ? 1 : -1); this.openCharPage('djinn'); return; }
      if (this.sub.chosen) { const d = this.sub.chosen.id; this.page = 'djinnAct'; this.dj = d; this.act = new MenuList([{ label: 'Give', id: 'give' }, { label: 'Info', id: 'info' }], { x: 150, y: 64, w: 80, rows: 2, lineH: 11 }); }
      return;
    }
    if (P === 'djinnAct') {
      this.act.update(); if (this.act.cancelled) { this.page = 'djinn'; return; }
      if (this.act.chosen) {
        const id = this.act.chosen.id, d = this.dj;
        if (id === 'info') { this.say(DJINN[d.name].desc + ' Rests ' + djinnCooldown(d.name) + ' turns.'); this.page = 'djinn'; }
        else if (id === 'give') { const others = this.members.filter(m => m !== this.ch && m.djinn.length < 9); if (!others.length) { this.say('No one can take it.'); return; } this.page = 'djinnGive'; this.giveMenu = new MenuList(others.map(m => ({ label: m.name + ' (' + m.djinn.length + ')', id: m })), { x: 150, y: 90, w: 80, rows: 7, lineH: 11 }); }
      }
      return;
    }
    if (P === 'djinnGive') {
      this.giveMenu.update(); if (this.giveMenu.cancelled) { this.page = 'djinnAct'; return; }
      if (this.giveMenu.chosen) { const to = this.giveMenu.chosen.id; this.ch.removeDjinn(this.dj.name); to.setDjinn(this.dj.name); for (const m of [this.ch, to]) { const s = m.stats(); if (m.hp > s.hp) m.hp = s.hp; if (m.pp > s.pp) m.pp = s.pp; } Audio.sfx('confirm'); this.say(this.dj.name + ' was given to ' + to.name + '.'); this.openCharPage('djinn'); }
      return;
    }
    if (P === 'item') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'main'; return; }
      if (this.sub.chosen) { const name = this.sub.chosen.id; const it = ITEM_DB[name]; this.itemName = name; this.itemHolder = this.sub.chosen.holder || null; const acts = []; if (it.grants) acts.push({ label: 'Give', id: 'give' }); if (it.use) acts.push({ label: 'Use', id: 'use' }); const eq = ['long', 'light', 'axe', 'mace', 'staff', 'armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'helm', 'hat', 'circlet', 'ring', 'shirt', 'boots'].includes(it.cat); if (eq) acts.push({ label: 'Equip', id: 'equip' }); if (!it.key && !this.itemHolder) acts.push({ label: 'Drop', id: 'drop' }); acts.push({ label: 'Info', id: 'info' }); this.page = 'itemAct'; this.act = new MenuList(acts, { x: 150, y: 100, w: 80, rows: 4, lineH: 11 }); }
      return;
    }
    if (P === 'itemAct') {
      this.act.update(); if (this.act.cancelled) { this.page = 'item'; return; }
      if (this.act.chosen) {
        const id = this.act.chosen.id, name = this.itemName, it = ITEM_DB[name];
        if (id === 'info') { this.say(it.desc || (it.atk ? 'Attack +' + it.atk : it.def ? 'Defense +' + it.def : 'A useful item.')); this.page = 'item'; }
        else if (id === 'drop') { G.inventory.remove(name); if (typeof Artifacts !== 'undefined') Artifacts.add(name, 1); this.say('Dropped ' + name + '.' + (typeof Artifacts !== 'undefined' && Artifacts.isArtifact(name) ? ' (An artifact: the shops will have it.)' : '')); this.openItemPage(); }
        else if (id === 'give') { this.page = 'itemTarget'; this.itemAction = id; const rows = this.members.filter(m => m !== this.itemHolder).map(m => ({ label: m.name + (m.holds(name) ? ' (has one)' : '') + '  ' + (m.held || []).length + ' carried', id: m, disabled: m.holds(name) })); if (this.itemHolder) rows.push({ label: '(Back to the bag)', id: null }); this.targetMenu = new MenuList(rows, { x: 100, y: 20, w: 130, rows: 9, lineH: 11 }); }
        else if (id === 'use' || id === 'equip') { this.page = 'itemTarget'; this.itemAction = id; this.targetMenu = new MenuList(this.members.map(m => ({ label: m.name + (id === 'equip' ? (m.canEquip(name) ? '' : ' (cannot equip)') : '  HP ' + m.hp + '/' + m.maxHp()), id: m, disabled: id === 'equip' && !m.canEquip(name) })), { x: 100, y: 20, w: 130, rows: 8, lineH: 11 }); }
      }
      return;
    }
    if (P === 'itemTarget') {
      this.targetMenu.update(); if (this.targetMenu.cancelled) { this.page = 'item'; return; }
      if (this.targetMenu.chosen) {
        const m = this.targetMenu.chosen.id, name = this.itemName;
        if (this.itemAction === 'give') { const from = this.itemHolder; if (from) from.release(name); if (m) { m.hold(name); Audio.sfx('item'); this.say(m.name + ' carries the ' + name + ' (' + ITEM_DB[name].grants + ').'); } else this.say('The ' + name + ' is back in the bag.'); this.openItemPage(); }
        else if (this.itemAction === 'use') { const r = useItemOn(name, m); if (r && !r.fail) { if (!ITEM_DB[name].gearUse) G.inventory.remove(name); else if (Math.random() < (ITEM_DB[name].breakChance || 0.25)) { G.inventory.remove(name); r.msg += ' The ' + (ITEM_DB[name].n || name) + ' broke!'; } Audio.sfx('heal'); } else Audio.sfx('buzz'); this.say(r ? r.msg : 'No effect.'); if (!G.inventory.has(name)) { this.openItemPage(); } else this.targetMenu = new MenuList(this.members.map(mm => ({ label: mm.name + '  HP ' + mm.hp + '/' + mm.maxHp(), id: mm })), { x: 100, y: 20, w: 130, rows: 8, lineH: 11 }); }
        else { this.equipItem(m, name); this.openItemPage(); }
      }
      return;
    }
    if (P === 'equip') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'pickChar'; return; }
      if (Input.pressed('l') || Input.pressed('r')) { this.cycleChar(Input.pressed('r') ? 1 : -1); this.openCharPage('equip'); return; }
      if (this.sub.chosen) { const slot = this.sub.chosen.id; const cands = G.inventory.equipment().filter(s => this.ch.slotFor(s.name) === slot && this.ch.canEquip(s.name)); const items = cands.map(s => { const it = ITEM_DB[s.name]; const cur = this.ch.equip[slot] && ITEM_DB[this.ch.equip[slot]]; const diff = (it.atk || it.def || 0) - (cur ? (cur.atk || cur.def || 0) : 0); return { label: s.name, id: s.name, right: (it.atk ? 'A' + it.atk : it.def ? 'D' + it.def : '') + (diff ? (diff > 0 ? ' +' : ' ') + diff : ''), rightColor: diff > 0 ? '#80ff80' : diff < 0 ? '#ff8080' : '#ffffff' }; }); items.unshift({ label: '(Remove)', id: null }); this.page = 'equipPick'; this.slot = slot; this.pickMenu = new MenuList(items, { x: 100, y: 70, w: 130, rows: 7, lineH: 11 }); }
      return;
    }
    if (P === 'equipPick') {
      this.pickMenu.update(); if (this.pickMenu.cancelled) { this.page = 'equip'; return; }
      if (this.pickMenu.chosen) { const name = this.pickMenu.chosen.id; if (name === null) { const cur = this.ch.equip[this.slot]; if (cur) { if (ITEM_DB[cur].cursed) { this.say("It's cursed! It won't come off!"); Audio.sfx('buzz'); return; } G.inventory.add(cur); this.ch.equip[this.slot] = null; } } else this.equipItem(this.ch, name); this.openCharPage('equip'); }
      return;
    }
    if (P === 'status') { if (Input.pressed('b')) { this.page = 'pickChar'; Audio.sfx('cancel'); } if (Input.pressed('l') || Input.pressed('left')) { this.cycleChar(-1); } if (Input.pressed('r') || Input.pressed('right')) { this.cycleChar(1); } return; }
    if (P === 'summon') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'pickChar'; return; }
      if (Input.pressed('l') || Input.pressed('r')) { this.cycleChar(Input.pressed('r') ? 1 : -1); this.openCharPage('summon'); return; }
      if (this.sub.chosen) { this.ch.chooseSummon(this.sub.chosen.id); Audio.sfx('summon'); this.say(this.ch.name + ' will summon ' + this.ch.summon + ' when the gauge is full.'); this.openCharPage('summon'); }
      return;
    }
    if (P === 'party') {
      this.sub.update(); if (this.sub.cancelled) { this.page = 'main'; this.swapFirst = null; return; }
      if (this.sub.chosen) { const m = this.sub.chosen.id; if (typeof Camp !== 'undefined' && Camp.isTraining(m.id)) { this.say(m.name + ' is away training.'); Audio.sfx('buzz'); return; } if (!this.swapFirst) { this.swapFirst = m; this.say('Swap ' + m.name + ' with...'); } else { const a = this.swapFirst, b = m; this.swapFirst = null; if (a === b) return; const A = G.party.active, R = G.party.reserve; if ((G.party.isLeader(a) && A.includes(a) && !A.includes(b)) || (G.party.isLeader(b) && A.includes(b) && !A.includes(a))) { this.say(G.party.leaderId + ' leads the party and stays in front.'); Audio.sfx('buzz'); return; } const ia = A.indexOf(a), ib = A.indexOf(b), ra = R.indexOf(a), rb = R.indexOf(b); if (ia >= 0 && ib >= 0) { A[ia] = b; A[ib] = a; } else if (ra >= 0 && rb >= 0) { R[ra] = b; R[rb] = a; } else if (ia >= 0 && rb >= 0) { A[ia] = b; R[rb] = a; } else if (ra >= 0 && ib >= 0) { A[ib] = a; R[ra] = b; } this.field.rebuildFollowers(); this.field.gatherFollowers(); this.sub = new MenuList(this.members.map(mm => ({ label: mm.name, id: mm, right: G.party.active.includes(mm) ? 'Front' : 'Back' })), { x: 90, y: 12, w: 140, rows: 8, lineH: 11 }); this.say('Swapped.'); } }
      return;
    }
  }
  cycleChar(d) { this.charIdx = (this.charIdx + d + this.members.length) % this.members.length; this.ch = this.members[this.charIdx]; Audio.sfx('cursor'); }
  equipItem(m, name) {
    const slot = m.slotFor(name); if (!slot || !m.canEquip(name)) { this.say(m.name + " can't equip that."); Audio.sfx('buzz'); return; }
    const cur = m.equip[slot]; if (cur && ITEM_DB[cur].cursed) { this.say("The cursed " + cur + " won't come off!"); Audio.sfx('buzz'); return; }
    G.inventory.remove(name); if (cur) G.inventory.add(cur); m.equip[slot] = name; Audio.sfx('confirm'); this.say(m.name + ' equipped ' + name + '.');
    const s = m.stats(); if (m.hp > s.hp) m.hp = s.hp; if (m.pp > s.pp) m.pp = s.pp;
    if (ITEM_DB[name].classItem) m.classItem = ITEM_DB[name].classItem; if (cur && ITEM_DB[cur].classItem && !ITEM_DB[name].classItem) m.classItem = null;
  }
  openCharPage(kind) {
    this.ch = this.members[this.charIdx]; const ch = this.ch; this.page = kind;
    if (kind === 'psy') this.sub = new MenuList(ch.psynergy().map(p => ({ label: p, id: p, right: PSY[p].pp, disabled: ch.pp < PSY[p].pp, color: tint(ELCOLOR[psyEl(PSY[p])], 0.4) })), { x: 90, y: 24, w: 140, rows: 8, lineH: 11 });   /* eight rows: the description below stays inside the window, off the foot strip */
    if (kind === 'djinn') this.sub = new MenuList(ch.djinn.map(d => ({ label: d.name, id: d, right: ELNAME[DJINN[d.name].el], color: tint(ELCOLOR[DJINN[d.name].el], 0.3) })), { x: 90, y: 24, w: 140, rows: 7, lineH: 11 });
    if (kind === 'summon') { ch.validateSummon(); const av = ch.availableSummons(); this.sub = new MenuList(av.map(s => ({ label: (ch.summon === s ? '* ' : '') + s, id: s, right: SUMMONS[s].req.map((r, i) => r ? r + 'EWFA'[i] : '').join(''), color: tint(ELCOLOR[SUMMONS[s].el], 0.3) })), { x: 90, y: 24, w: 140, rows: 8, lineH: 11 }); if (!av.length) this.say(ch.djinn.length ? 'No summon matches ' + ch.name + "'s Djinn." : ch.name + ' has no Djinn - no summon.'); }
    if (kind === 'equip') this.sub = new MenuList(EQUIP_SLOTS.map(s => ({ label: { weapon: 'Weapon', body: 'Body', arm: 'Arm', head: 'Head', acc: 'Extra' }[s], id: s, right: ch.equip[s] || '---' })), { x: 90, y: 24, w: 140, rows: 5, lineH: 11 });
    if (kind === 'item') this.openItemPage();
    if (kind === 'status') { }
  }
  openItemPage() { this.page = 'item'; const items = G.inventory.items.map(s => ({ label: (ITEM_DB[s.name] && ITEM_DB[s.name].n) || s.name, id: s.name, right: 'x' + s.qty, color: ITEM_DB[s.name].key ? '#ffe080' : '#ffffff' })); for (const m of G.party.members) for (const n of (m.held || [])) items.push({ label: n, id: n, holder: m, right: m.name.slice(0, 5), rightColor: '#a0e0a0', color: '#c0ffc0' });   /* the Psynergy items each Adept carries, after the bag */ this.sub = new MenuList(items, { x: 90, y: 12, w: 140, rows: 11, lineH: 11 }); if (!items.length) this.say('No items.'); }
  draw(g) {
    UI.window(g, 4, 4, 80, 134); this.main.draw(g);
    // coins, clock, Djinn and where you are: a strip along the foot, so the column has room for eleven entries
    UI.window(g, 4, 138, SCREEN_W - 8, 18);
    const pt = G.playtime; const h = Math.floor(pt / 216000), mm = Math.floor(pt / 3600) % 60;
    Font.draw(g, 'Coins', 10, 143, '#a0c0ff'); Font.draw(g, String(G.party.coins), 66, 143, '#ffffff', { align: 'right' });
    Font.draw(g, 'Time', 78, 143, '#a0c0ff'); Font.draw(g, h + ':' + pad(mm, 2, '0'), 122, 143, '#ffffff', { align: 'right' });
    Font.draw(g, 'Djinn', 130, 143, '#a0c0ff'); Font.draw(g, DjinnDex.tally().have + '/' + DjinnDex.tally().total, 188, 143, '#ffffff', { align: 'right' });
    const locName = G.map ? ((G.map.world && G.map.def.regionName && G.field) ? G.map.def.regionName(G.field.player.tx, G.field.player.ty) : G.map.name) : '';
    Font.draw(g, Font.fit(locName, 44), SCREEN_W - 10, 143, '#e0e0e0', { align: 'right' });
    const P = this.page;
    if (P === 'main') { UI.window(g, 88, 4, 148, 130); const lh = this.members.length > 9 ? 12 : 14; this.members.forEach((m, i) => { const y = 8 + i * lh; if (i >= 10) return; Font.draw(g, m.name, 94, y, m.alive ? '#ffffff' : '#ff8080'); Font.draw(g, 'Lv ' + m.level, 140, y, '#ffe080'); Font.draw(g, m.className(), 170, y, '#c0d0ff'); Font.draw(g, 'HP ' + m.hp + '/' + m.maxHp(), 94, y + 9, '#a0ffa0'); Font.draw(g, 'PP ' + m.pp + '/' + m.maxPp(), 170, y + 9, '#a0c0ff'); }); }
    else if (P === 'pickChar' || P === 'party') { UI.window(g, 88, 4, 148, 130); Font.draw(g, P === 'party' ? 'Swap party members' : 'Choose a character', 162, 8, '#ffe080', { align: 'center' }); if (P === 'pickChar' && this.pickFor === 'djinn') Font.draw(g, 'C: the whole list', 230, 148, '#8090b0', { align: 'right' }); (P === 'pickChar' ? this.charMenu : this.sub).y = 20; (P === 'pickChar' ? this.charMenu : this.sub).draw(g); }
    else if (P === 'psy' || P === 'psyTarget' || P === 'djinn' || P === 'djinnAct' || P === 'djinnGive' || P === 'equip' || P === 'equipPick' || P === 'status' || P === 'summon') {
      UI.window(g, 88, 4, 148, 130); const ch = this.ch || this.caster;
      if (ch) { Font.draw(g, Font.fit(ch.name + ' Lv' + ch.level + ' ' + ch.className(), 112), 94, 8, '#ffe080'); Font.draw(g, 'C: next', 230, 8, '#8090b0', { align: 'right' }); }
      if (P === 'psy') { this.sub.draw(g); if (this.sub.current) { const p = PSY[this.sub.current.id]; const lines = Font.wrap(p.desc + (p.type === 'magic' ? ' (' + ELNAME[psyEl(p)] + ')' : ''), 136); lines.slice(0, 2).forEach((l, i) => Font.draw(g, l, 94, 114 + i * 10, '#e0e8ff')); } }
      if (P === 'psyTarget') { Font.draw(g, 'Use ' + this.psyName + ' on whom?', 94, 8, '#ffe080'); this.targetMenu.draw(g); }
      if (P === 'djinn' || P === 'djinnAct' || P === 'djinnGive') { this.sub.draw(g); const lv = ch.elLevels(); Font.draw(g, 'Element levels: E' + lv[0] + ' W' + lv[1] + ' F' + lv[2] + ' A' + lv[3], 94, 104, '#c0d0ff'); if (this.sub.current) Font.wrap(DJINN[this.sub.current.id.name].desc, 136).slice(0, 2).forEach((l, i) => Font.draw(g, l, 94, 114 + i * 10, '#e0e8ff')); if (P === 'djinnAct') { UI.window(g, 146, 60, 88, 30); this.act.draw(g); } if (P === 'djinnGive') { UI.window(g, 146, 86, 88, 60); this.giveMenu.draw(g); } }
      if (P === 'summon') { this.sub.draw(g); const f = Math.min(1, (ch.limit || 0) / 100); Font.draw(g, 'Gauge', 94, 116, '#a0c0ff'); UI.gauge(g, 128, 116, 72, 7, f, Engine.frame); Font.draw(g, f >= 1 ? 'FULL' : Math.floor(f * 100) + '%', 230, 116, f >= 1 ? '#ffe060' : '#ffffff', { align: 'right' }); Font.draw(g, ch.summon ? 'Chosen: ' + ch.summon : 'No summon chosen', 94, 126, '#ffe080'); if (this.sub.current) Font.wrap(SUMMONS[this.sub.current.id].desc, 136).slice(0, 2).forEach((l, i) => Font.draw(g, l, 94, 136 + i * 10, '#e0e8ff')); }
      if (P === 'equip' || P === 'equipPick') { this.sub.draw(g); const s = ch.stats(); Font.draw(g, 'ATK ' + s.atk + '  DEF ' + s.def + '  AGI ' + s.agi + '  LCK ' + s.lck, 94, 88, '#c0d0ff'); if (P === 'equipPick') { UI.window(g, 96, 64, 138, 88); this.pickMenu.draw(g); } }
      if (P === 'status') { const s = ch.stats(); const rows = [['HP', ch.hp + '/' + s.hp], ['PP', ch.pp + '/' + s.pp], ['Attack', s.atk], ['Defense', s.def], ['Agility', s.agi], ['Luck', s.lck], ['Exp', ch.exp], ['To next', ch.expToNext()]]; rows.forEach((r, i) => { Font.draw(g, r[0], 94, 22 + i * 10, '#a0c0ff'); Font.draw(g, String(r[1]), 160, 22 + i * 10, '#ffffff', { align: 'right' }); }); Font.draw(g, 'Power / Resist', 168, 22, '#a0c0ff'); for (let e = 0; e < 4; e++) { Font.draw(g, ELNAME[e], 168, 32 + e * 10, tint(ELCOLOR[e], 0.3)); Font.draw(g, ch.power(e) + '/' + ch.resist(e), 230, 32 + e * 10, '#ffffff', { align: 'right' }); } const st = Object.keys(ch.status).filter(k => ch.status[k]).map(k => STATUS_NAMES[k] || k); Font.draw(g, 'Status: ' + (st.length ? st.join(', ') : 'Normal'), 94, 104, '#e0e8ff'); Font.draw(g, 'Weapon: ' + (ch.equip.weapon || '---'), 94, 116, '#c0d0ff'); Font.draw(g, 'Body: ' + (ch.equip.body || '---') + '  Head: ' + (ch.equip.head || '---'), 94, 126, '#c0d0ff'); Font.draw(g, 'Arm: ' + (ch.equip.arm || '---') + '  Extra: ' + (ch.equip.acc || '---'), 94, 136, '#c0d0ff'); Font.draw(g, (ch.held && ch.held.length) ? 'Carries: ' + ch.held.map(n => ITEM_DB[n] && ITEM_DB[n].grants || n).join(', ') : CHARACTERS[ch.id].desc, 94, 146, (ch.held && ch.held.length) ? '#c0ffc0' : '#a0b0d0'); const spr = Sprites.battle(ch.battleLook(), 'idle', Math.floor(Engine.frame / 22) % 3); g.imageSmoothingEnabled = false; g.drawImage(spr, 186, 58, 48, 48); }
    }
    else if (P === 'item' || P === 'itemAct' || P === 'itemTarget') { UI.window(g, 88, 4, 148, 130); if (P === 'itemTarget') { Font.draw(g, this.itemAction === 'give' ? 'Who carries the ' + this.itemName + '?' : (this.itemAction === 'use' ? 'Use ' : 'Equip ') + this.itemName + ' on whom?', 94, 8, '#ffe080'); this.targetMenu.draw(g); } else { this.sub.draw(g); if (this.sub.current) { const it = ITEM_DB[this.sub.current.id]; const d = it.desc || (it.atk ? 'Attack +' + it.atk : it.def ? 'Defense +' + it.def : ''); Font.wrap(d, 136).slice(0, 2).forEach((l, i) => Font.draw(g, l, 94, 136 + i * 10, '#e0e8ff')); } if (P === 'itemAct') { UI.window(g, 146, 96, 88, 50); this.act.draw(g); } } }
    if (this.msgT > 0) { const w = Math.min(230, Font.width(this.msg) + 12); UI.window(g, 120 - w / 2, 142, w, 16, { c0: '#3050a0', c1: '#203070' }); Font.draw(g, this.msg, 120, 146, '#ffffff', { align: 'center' }); }
    this.textbox.draw(g);
  }
}
