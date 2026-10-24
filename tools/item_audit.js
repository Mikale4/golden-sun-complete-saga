// Item audit: every entry of ITEM_DB checked for what it claims against what the engine implements. Run in a game
// tab (after tools/testboot.js): itemAudit() returns the report and posts it to runner/item_audit.json.
window.itemAudit = function () {
  const EQUIP = ['long', 'light', 'axe', 'mace', 'staff', 'armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'helm', 'hat', 'circlet', 'ring', 'shirt', 'boots'];
  const WEAPON = ['long', 'light', 'axe', 'mace', 'staff'];
  const out = { total: 0, byCat: {}, issues: [], ok: [] };
  const referenced = new Set();
  // everything the world hands out or sells
  for (const id of Object.keys(SHOPS || {})) for (const n of (SHOPS[id].items || [])) referenced.add(n);
  for (const id of Object.keys(HIDDEN_ITEMS || {})) for (const h of HIDDEN_ITEMS[id]) if (h.item) referenced.add(h.item);
  for (const id of Object.keys(ENEMY_DB || {})) { const dr = ENEMY_DB[id].dr; if (dr && dr[0]) referenced.add(dr[0]); }
  if (typeof FORGE !== 'undefined') for (const k of Object.keys(FORGE)) for (const r of (FORGE[k] || [])) referenced.add(r.item || r[0]);
  for (const name of Object.keys(ITEM_DB)) {
    const it = ITEM_DB[name]; out.total++; out.byCat[it.cat] = (out.byCat[it.cat] || 0) + 1;
    const desc = (it.desc || '').toLowerCase();
    const issue = (m) => out.issues.push({ item: name, cat: it.cat, msg: m });
    if (EQUIP.includes(it.cat)) {
      if (WEAPON.includes(it.cat) && !(it.atk > 0)) issue('weapon with no attack value');
      if (['armor', 'cloth', 'robe', 'shield', 'glove', 'brace', 'helm', 'hat', 'circlet', 'shirt', 'boots'].includes(it.cat) && !(it.def > 0) && !it.key && !it.grants && !it.classItem) issue('armour with no defense value');
      if (it.unleash && !(UNLEASH && UNLEASH[it.unleash])) issue('unleash "' + it.unleash + '" not defined in UNLEASH');
      if (WEAPON.includes(it.cat) && !it.unleash && it.buy > 3000 && !it.key) issue('costly weapon with no unleash (artifact weapons all unleash)');
      if (it.grants && !PSY[it.grants]) issue('grants unknown Psynergy ' + it.grants);
      // rings and the like that say they do something when used
      if (/cure|restore|revive|heal|use(d)? in battle|when used/.test(desc) && !it.use && !it.battle && !it.grants) issue('desc promises a use effect ("' + (it.desc || '').slice(0, 60) + '") but no use/battle effect is implemented');
      if (/curse/.test(desc) && !it.cursed && !/cures|removes|prevent|resist/.test(desc)) issue('desc says cursed but no cursed flag');
      // a stat bonus the description names but the entry lacks
      for (const [word, key] of [['hp', 'hp'], ['pp', 'pp'], ['agility', 'agi'], ['luck', 'lck'], ['attack', 'atk'], ['defense', 'def']]) if (new RegExp('(\\+\\d+|boosts|raises|increases)[^.]{0,20}' + word).test(desc) && !(it[key] || (it.stat && it.stat[key]) || it.bonus)) issue('desc names a ' + word + ' bonus the entry lacks');
    } else if (it.cat === 'consume' || it.cat === 'misc') {
      if (!it.use && !it.battle && !it.key && !/medal|ticket|forge|material/.test(desc) && !['forge'].includes(it.cat)) issue('consumable with no use or battle effect');
      if (it.use && it.use.cure && !it.use.cure.length) issue('cure list empty');
    } else if (it.cat === 'forge') { /* materials: Sunshine's tables handle them */ }
    else if (it.cat === 'key') { /* story items */ }
    if (!it.desc && !EQUIP.includes(it.cat) && it.cat !== 'forge') issue('no description');
  }
  // things referenced that the DB lacks
  for (const n of referenced) if (!ITEM_DB[n] && n !== 'Coins') out.issues.push({ item: n, cat: '?', msg: 'referenced (shop/hidden/drop/forge) but not in ITEM_DB' });
  // a functional pass: use every consumable on a test copy of the leader, equip every piece on whoever can wear it
  const lead = G.party.members[0]; const snap = JSON.stringify(lead.serialize ? lead.serialize() : lead);
  for (const name of Object.keys(ITEM_DB)) {
    const it = ITEM_DB[name];
    if (it.use) { try { lead.hp = 1; lead.status = {}; const r = useItemOn(name, lead); if (!r) out.issues.push({ item: name, cat: it.cat, msg: 'useItemOn returned nothing' }); } catch (e) { out.issues.push({ item: name, cat: it.cat, msg: 'useItemOn threw: ' + e.message }); } }
    if (EQUIP.includes(it.cat) && !it.key && !it.classItem) {
      const who = G.party.members.find(m => m.canEquip && m.canEquip(name)); if (!who) { if (!it.female) out.issues.push({ item: name, cat: it.cat, msg: 'no party member can equip it (class rules?)' }); continue; }
      try { const slot = who.slotFor ? who.slotFor(name) : null; const S = () => { const o = who.stats(); return [o.hp, o.pp, o.atk, o.def, o.agi, o.lck, who.power(0), who.power(1), who.power(2), who.power(3), who.resist(0), who.resist(1), who.resist(2), who.resist(3)]; }; const before = S(); const old = slot ? who.equip[slot] : null; if (slot) who.equip[slot] = name; const after = S(); if (slot) who.equip[slot] = old; if (before.every((v, i) => v === after[i]) && !it.grants && !it.gearUse && !it.crit && !it.hpRegen && !it.ppRegen) out.issues.push({ item: name, cat: it.cat, msg: 'equipping it changes no stat' }); } catch (e) { out.issues.push({ item: name, cat: it.cat, msg: 'equip test threw: ' + e.message }); }
    }
  }
  try { const back = JSON.parse(snap); if (lead.hp !== undefined) { lead.hp = back.hp || lead.maxHp(); lead.status = {}; } } catch (e) { }
  out.issueCount = out.issues.length;
  fetch('/log?name=item_audit.json', { method: 'POST', body: JSON.stringify(out, null, 1) });
  return out;
};
'item_audit loaded';
