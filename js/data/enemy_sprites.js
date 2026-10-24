// ---------- Procedural monster sprites ----------
'use strict';
const Monsters = {
  customLooks: {},   // travelers: the look they wore on the field, keyed by their ENEMY_DB name
  cache: {},
  // Determine template + colors from enemy name
  spec(name) {
    const n = name.toLowerCase();
    const r = seededRandom(hashStr(name));
    const has = (...ks) => ks.some(k => n.includes(k));
    let t = 'beast', c1 = '#8a6a48', c2 = '#5a4a38', eye = '#f0e040', size = 1;
    if (Monsters.customLooks[name]) { t = 'human'; }
    else if (has('djinni')) { t = 'djinni'; const el = has('venus') ? 0 : has('mercury') ? 1 : has('mars') ? 2 : 3; c1 = ELCOLOR[el]; }
    else if (has('mimic')) { t = 'mimic'; c1 = '#a06030'; }
    else if (has('saturos', 'menardi', 'alex', 'karst', 'agatio', 'briggs', 'azart', 'satrage', 'navampa', 'moapa', 'knight', 'thief', 'bandit', 'brigand', 'sea fighter', 'assassin', 'slayer', 'wargold', 'mystery', 'puppet warrior')) { t = 'human'; }
    else if (has('dullahan')) { t = 'armor'; c1 = '#303048'; c2 = '#8060c0'; eye = '#ff4040'; size = 2.6; }
    // the class items' guardians (js/maps/class_trials_*.js)
    else if (has('colossus of sol')) { t = 'golem'; c1 = '#e0c060'; c2 = '#fff0b0'; eye = '#ff8020'; size = 2.9; }
    else if (has('void sovereign')) { t = 'demon'; c1 = '#181028'; c2 = '#8040c0'; eye = '#ff40ff'; size = 3.1; }
    else if (has('elder frost dragon')) { t = 'dragon'; c1 = '#b0d8f0'; c2 = '#4060a0'; eye = '#40e0ff'; size = 3; }
    else if (has('leviathan')) { t = 'serpent'; c1 = '#2060a0'; c2 = '#a0e0f0'; size = 2.6; }
    else if (has('eye of chronos')) { t = 'demon'; c1 = '#c0b060'; c2 = '#f0e0a0'; eye = '#40c0ff'; size = 2.4; }
    else if (has('clockwork')) { t = 'armor'; c1 = '#a08040'; c2 = '#e0c060'; eye = '#ff4040'; size = 2.2; }
    else if (has('scorpion queen')) { t = 'scorpion'; c1 = '#803050'; c2 = '#e0a060'; size = 2.2; }
    else if (has('tusked mauler')) { t = 'manticore'; c1 = '#705030'; c2 = '#e0d0a0'; size = 2; }
    else if (has('hama')) { t = 'human'; }
    // the post-game (js/game/story_post.js): the Wise One's stone eye, the four that stayed whole, the first Alchemist
    else if (has('wise one')) { t = 'orb'; c1 = '#8a8070'; c2 = '#c8c0a8'; eye = '#e0c040'; size = 3.2; }
    else if (has('terragon')) { t = 'golem'; c1 = '#8a7040'; c2 = '#c0a060'; eye = '#60e060'; size = 3.2; }
    else if (has('thalassa')) { t = 'serpent'; c1 = '#3070c0'; c2 = '#a0e0ff'; eye = '#ffffff'; size = 3; }
    else if (has('ignis')) { t = 'demon'; c1 = '#c03010'; c2 = '#ffc040'; eye = '#fff0a0'; size = 3; }
    else if (has('zephyros')) { t = 'dragon'; c1 = '#8060d0'; c2 = '#e0d0ff'; eye = '#ffffff'; size = 3.2; }
    else if (has('alkahest')) { t = 'orb'; c1 = '#e0c040'; c2 = '#fff8d0'; eye = '#ffffff'; size = 3.6; }
    else if (has('doom dragon')) { t = 'dragon'; c1 = '#503060'; c2 = '#30a040'; eye = '#ff4040'; size = 3; }
    else if (has('fusion dragon')) { t = 'dragon'; c1 = '#a02040'; c2 = '#e0c040'; eye = '#ffe040'; size = 2.8; }
    else if (has('dragon', 'wyvern', 'pteranodon', 'hydra', 'pyrodra', 'avimander')) { t = 'dragon'; c1 = has('blue') ? '#4070d0' : has('fire', 'flame', 'pyro') ? '#d04020' : has('sea', 'ocean', 'hydra') ? '#3080a0' : has('sky', 'cruel', 'wise') ? '#8060c0' : has('turtle') ? '#408040' : '#50a050'; c2 = '#e0c060'; size = has('chick') ? 0.8 : has('small') ? 1.3 : 1.9; }
    else if (has('serpent', 'snake', 'worm', 'chimera worm')) { t = 'serpent'; c1 = has('fire') ? '#d05020' : has('angle') ? '#c0a080' : '#40a060'; c2 = '#e0d080'; size = has('serpent') && !has('fume') ? 2.4 : 1.1; }
    else if (has('poseidon')) { t = 'merman'; c1 = '#40a0c0'; c2 = '#e0c040'; size = 2.6; }
    else if (has('merman', 'gillman', 'sea hedgehog')) { t = 'merman'; c1 = '#40a080'; c2 = '#a0e0c0'; }
    else if (has('kraken', 'calamar', 'cuttle', 'squid', 'spiral shell', 'urchin')) { t = 'squid'; c1 = has('kraken') ? '#8040a0' : '#c06080'; c2 = '#e0a0c0'; size = has('kraken') ? 2.4 : 1.1; }
    else if (has('jelly', 'man o', "man o'", 'aqua')) { t = 'jelly'; c1 = '#60c0f0'; c2 = '#a0e0ff'; }
    else if (has('star magician', 'refresh ball', 'guardian ball', 'thunder ball', 'anger ball')) { t = 'orb'; c1 = has('refresh') ? '#60d080' : has('guardian') ? '#6080e0' : has('thunder') ? '#e0e040' : has('anger') ? '#e04040' : '#c0a0f0'; size = has('magician') ? 2 : 1; }
    else if (has('sentinel', 'valukar', 'living armor', 'stone soldier', 'earth golem', 'golem', 'grand golem', 'boulder beast', 'raging rock', 'living statue', 'hydros statue', 'statue', 'minos', 'gargoyle', 'macetail')) { t = has('gargoyle') ? 'gargoyle' : 'golem'; c1 = has('ice') ? '#a0c0e0' : has('clay') ? '#c09060' : has('earth', 'boulder', 'raging') ? '#8a7a58' : has('sentinel', 'valukar') ? '#c0a040' : '#8a8a98'; c2 = '#e0c040'; size = has('sentinel', 'valukar', 'hydros', 'grand', 'minos') ? 2.3 : 1.4; }
    else if (has('tret', 'wood walker', 'elder wood')) { t = 'tree'; c1 = '#6a4a2a'; c2 = '#3c8c3c'; size = has('tret') ? 2.6 : 1.5; }
    else if (has('skeleton', 'bone fighter', 'skull warrior', 'undead', 'lich', 'death head', 'grave wight', 'wight', 'little death', 'druj', 'dirge', 'mummy')) { t = 'skeleton'; c1 = has('lich', 'death head') ? '#c0b0e0' : '#e8e0d0'; c2 = has('mummy') ? '#c0b080' : '#a03030'; eye = '#ff4040'; size = has('lich', 'druj') ? 1.5 : 1.1; }
    else if (has('ghost', 'spirit', 'willowisp', 'will head', 'nightmare', 'doomsayer', 'banshee', 'soul', 'phoenix')) { t = has('phoenix') ? 'bird' : 'ghost'; c1 = has('phoenix') ? '#f08030' : has('nightmare') ? '#6040a0' : '#c0d0f0'; c2 = has('phoenix') ? '#f0e040' : '#8090c0'; eye = '#ff4040'; size = has('army', 'phoenix') ? 1.6 : 1; }
    else if (has('zombie', 'ghoul', 'cannibal')) { t = 'zombie'; c1 = '#80a070'; c2 = '#604030'; eye = '#ff4040'; }
    else if (has('slime', 'ooze', 'amaze', 'sticky', 'gel')) { t = 'slime'; c1 = has('ooze') ? '#8040a0' : has('amaze') ? '#e0c040' : '#50c060'; c2 = '#a0f0b0'; }
    else if (has('mushroom', 'death cap', 'mad plant', 'creeper', 'plant', 'needle egg')) { t = has('creeper', 'plant') ? 'plant' : 'mushroom'; c1 = has('death') ? '#8040a0' : has('mad') ? '#d04040' : '#d08040'; c2 = '#f0e0c0'; }
    else if (has('bat', 'momonga')) { t = 'bat'; c1 = has('rabid') ? '#805060' : '#504868'; c2 = '#a090b0'; eye = '#ff4040'; size = has('giant') ? 1.3 : 0.8; }
    else if (has('bee', 'drone', 'wasp', 'harpy', 'harridan', 'siren', 'virago', 'roc', 'gryphon', 'wonder bird', 'seabird', 'seafowl', 'seagull', 'fire bird', 'talon runner', 'emu', 'pixie', 'faery', 'succubus')) { t = has('bee', 'drone', 'wasp') ? 'insect_fly' : 'bird'; c1 = has('gryphon') ? '#c0a060' : has('harpy', 'harridan', 'siren', 'virago', 'succubus') ? '#c07090' : has('roc', 'wonder') ? '#e0a040' : has('fire') ? '#e05020' : has('sea', 'gull', 'fowl') ? '#e0e8f0' : has('pixie', 'faery') ? '#a0e0c0' : '#e0c040'; c2 = '#404040'; size = has('gryphon', 'roc', 'wonder', 'wise') ? 1.9 : has('pixie', 'faery') ? 0.7 : 1; }
    else if (has('ant', 'roach', 'doodle bug', 'maggot', 'grub', 'flash ant', 'numb ant')) { t = 'insect'; c1 = has('fire', 'flash') ? '#d05020' : has('punch', 'numb') ? '#604030' : '#806040'; c2 = '#c0a060'; }
    else if (has('spider', 'tarantula', 'recluse', 'chimera worm')) { t = 'spider'; c1 = '#503030'; c2 = '#c08040'; eye = '#ff4040'; size = has('tarantula') ? 1.4 : 1.1; }
    else if (has('scorpion', 'devil scorpion')) { t = 'scorpion'; c1 = has('king', 'devil') ? '#a03030' : '#c08040'; c2 = '#e0c060'; size = has('king', 'devil') ? 1.8 : 1.1; }
    else if (has('rat', 'vermin', 'mole', 'squirrelfang', 'kobold')) { t = 'rat'; c1 = has('plated', 'armored') ? '#8090a0' : has('mad') ? '#a06040' : '#907050'; c2 = '#d0a080'; size = has('soldier', 'fighter', 'warrior', 'kobold') ? 1.2 : 0.9; }
    else if (has('wolf', 'hound', 'fenrir', 'cerebus', 'cerberus', 'dire', 'wolfkin')) { t = 'wolf'; c1 = has('dread', 'fenrir', 'dire') ? '#404858' : has('cerebus', 'cerberus') ? '#803030' : '#807060'; c2 = '#c0b0a0'; size = has('fenrir', 'cerebus', 'cerberus') ? 1.7 : 1.1; }
    else if (has('ape', 'gorilla', 'chestbeater', 'wild gorilla', 'troll', 'ogre', 'orc', 'goblin', 'hobgoblin', 'minotaur', 'cave troll', 'brutal')) { t = has('ape', 'gorilla', 'chestbeater') ? 'ape' : 'brute'; c1 = has('killer') ? '#805050' : has('dirty') ? '#807060' : has('troll') ? '#608050' : has('orc') ? '#508040' : has('goblin') ? '#60a050' : has('minotaur') ? '#805030' : '#6a5a48'; c2 = '#c0a080'; size = has('killer', 'king', 'lord', 'captain', 'brutal', 'minotaur') ? 1.7 : has('mini') ? 0.8 : 1.3; }
    else if (has('lizard', 'salamander', 'dino', 'raptor', 'toad', 'frog', 'toadonpa', 'devil frog', 'gressil')) { t = has('toad', 'frog') ? 'toad' : 'lizard'; c1 = has('storm', 'thunder', 'tempest') ? '#6080c0' : has('tornado') ? '#80a0c0' : has('salamander', 'fire') ? '#e06020' : has('earth', 'king') ? '#a08040' : has('devil', 'poison') ? '#8040a0' : '#60a060'; c2 = '#e0e080'; size = has('storm', 'tempest', 'thunder', 'toadonpa', 'king', 'dinox') ? 1.9 : 1.2; }
    else if (has('manticore', 'chimera', 'grand chimera', 'ravager', 'mauler', 'bear')) { t = 'manticore'; c1 = has('chimera') ? '#a06040' : '#c08040'; c2 = '#e0c060'; size = has('king', 'grand') ? 1.9 : 1.6; }
    else if (has('eye', 'demon', 'aka manah', 'fiend', 'lesser demon', 'mad demon', 'red demon', 'gnome', 'kobold')) { t = has('gnome') ? 'gnome' : 'demon'; c1 = has('red') ? '#c03030' : has('gnome') ? '#a07050' : '#603080'; c2 = '#e0c040'; eye = '#ff4040'; size = has('mad', 'aka') ? 1.7 : 1.1; }
    else if (has('deadbeard')) { t = 'human'; }
    else if (has('magicore', 'chimera mage', 'gnome mage', 'ghost mage', 'mole mage', 'wizard', 'sage')) { t = 'gnome'; c1 = '#6040a0'; c2 = '#e0c040'; }
    else if (has('fish', 'shark', 'ocean', 'sea', 'hydra', 'turtle', 'crab')) { t = 'fish'; c1 = '#4080c0'; c2 = '#a0d0f0'; }
    else if (has('bombander', 'ball')) { t = 'orb'; c1 = '#606070'; }
    // color variety for generic beasts
    if (t === 'beast') { c1 = ['#8a6a48', '#607050', '#705060', '#6a6a7a'][Math.floor(r() * 4)]; }
    return { t, c1, c2, eye, size, name };
  },
  // Render enemy sprite canvas (frame 0/1). Returns canvas
  sprite(name, frame) {
    const key = name + ':' + frame; if (this.cache[key]) return this.cache[key];
    if (this.customLooks[name] && typeof BattleParty !== 'undefined') return this.cache[key] = BattleParty.sprite(this.customLooks[name], 'front', frame);   // a traveler, as they looked on the road
    const drawn = typeof Foes !== 'undefined' && Foes.sprite(name, frame); if (drawn) return this.cache[key] = drawn;   // the families drawn after the games
    const s = this.spec(name);
    let c;
    if (s.t === 'human') c = this.human(name, frame);
    else if (s.t === 'djinni') c = Gfx.scale(Sprites.animal('djinni', s.c1 === ELCOLOR[0] ? 0 : s.c1 === ELCOLOR[1] ? 1 : s.c1 === ELCOLOR[2] ? 2 : 3, 0, frame), 2);
    else { const base = Math.round(40 * s.size); c = Gfx.canvas(base + 8, base + 8); const g = Gfx.ctx(c); this.draw(g, s, base, frame); c = Gfx.outline(c, '#1a1428'); }
    return this.cache[key] = c;
  },
  human(name, frame) {
    const n = name.toLowerCase();
    let look;
    if (Monsters.customLooks[name]) look = Monsters.customLooks[name];
    else if (n.includes('saturos')) look = NPC_LOOKS.Saturos; else if (n.includes('menardi')) look = NPC_LOOKS.Menardi; else if (n.includes('alex')) look = NPC_LOOKS.Alex;
    else if (n.includes('karst')) look = NPC_LOOKS.Karst; else if (n.includes('agatio')) look = NPC_LOOKS.Agatio; else if (n.includes('briggs')) look = NPC_LOOKS.Briggs; else if (n.includes('moapa')) look = NPC_LOOKS.Moapa;
    else if (n.includes('deadbeard')) look = { skin: '#c0c0b0', hair: '#404040', hairStyle: 'wild', top: '#303040', pants: '#202030', boots: '#101018', beard: '#404040', cape: '#602020', eyes: '#ff4040', hat: 'wide', hatColor: '#202020' };
    else if (n.includes('knight')) look = npcLook('guard', 3); else if (n.includes('mystery woman')) look = NPC_LOOKS.Menardi; else if (n.includes('mystery man')) look = NPC_LOOKS.Saturos;
    else if (n.includes('azart')) look = { skin: '#f0c090', hair: '#302020', hairStyle: 'slick', top: '#c04040', pants: '#404060', boots: '#201020', eyes: '#202020' };
    else if (n.includes('satrage')) look = { skin: '#f0c090', hair: '#c8a060', hairStyle: 'spiky', top: '#40a060', pants: '#404060', boots: '#201020', eyes: '#202020' };
    else if (n.includes('navampa')) look = { skin: '#e0b090', hair: '#604020', hairStyle: 'wild', top: '#6040a0', pants: '#404060', boots: '#201020', eyes: '#202020' };
    else if (n.includes('sea fighter') || n.includes('assassin') || n.includes('slayer')) look = npcLook('pirate', hashStr(name));
    else if (n.includes('puppet')) look = { skin: '#d0c0a0', hair: '#604020', hairStyle: 'short', top: '#806040', pants: '#403830', boots: '#201020', eyes: '#202020' };
    else look = npcLook(n.includes('thief') || n.includes('bandit') || n.includes('brigand') || n.includes('wargold') ? 'pirate' : 'villager_m', hashStr(name));
    const c = Sprites.humanoid(look, DIR.DOWN, frame ? 0 : 0);
    const big = n.includes('saturos') || n.includes('menardi') || n.includes('agatio') || n.includes('karst') || n.includes('alex') || n.includes('deadbeard') || n.includes('briggs') || n.includes('moapa');
    return Gfx.scale(c, 2);
  },
  draw(g, s, S, f) {
    const c1 = s.c1, c2 = s.c2, d1 = shade(c1, 0.7), l1 = tint(c1, 0.25), eye = s.eye;
    const cx = S / 2 + 4, cy = S / 2 + 4, bob = f ? 1 : 0;
    const E = (x, y, rx, ry, col) => Gfx.ellipse(g, Math.round(x), Math.round(y), Math.round(rx), Math.round(ry), col);
    const R = (x, y, w, h, col) => Gfx.rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col);
    const P = (x, y, col) => Gfx.px(g, Math.round(x), Math.round(y), col);
    const T = (x0, y0, x1, y1, x2, y2, col) => Gfx.tri(g, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), col);
    const u = S / 40; // unit
    const eyes = (x, y, w, sep) => { R(x - sep, y, w, w, eye); R(x + sep - w + 1, y, w, w, eye); P(x - sep, y, '#ffffff'); P(x + sep - w + 1, y, '#ffffff'); };
    switch (s.t) {
      case 'beast': case 'wolf': {
        E(cx, cy + 4 * u + bob, 14 * u, 8 * u, c1); E(cx - 2 * u, cy + 1 * u + bob, 9 * u, 5 * u, l1);
        E(cx + 12 * u, cy - 2 * u + bob, 8 * u, 6 * u, c1); // head
        T(cx + 14 * u, cy - 6 * u + bob, cx + 18 * u, cy - 12 * u + bob, cx + 19 * u, cy - 4 * u + bob, c1); T(cx + 6 * u, cy - 6 * u + bob, cx + 8 * u, cy - 12 * u + bob, cx + 11 * u, cy - 5 * u + bob, c1); // ears
        E(cx + 18 * u, cy + bob, 4 * u, 3 * u, d1); P(cx + 21 * u, cy - 1 * u + bob, '#202020');
        eyes(cx + 13 * u, cy - 3 * u + bob, Math.max(1, Math.round(2 * u)), 3 * u);
        R(cx - 10 * u, cy + 9 * u, 4 * u, 8 * u - bob, d1); R(cx - 3 * u, cy + 10 * u, 4 * u, 7 * u, d1); R(cx + 5 * u, cy + 9 * u, 4 * u, 8 * u - bob, d1); R(cx + 11 * u, cy + 10 * u, 4 * u, 7 * u, d1);
        Gfx.line(g, Math.round(cx - 14 * u), Math.round(cy + 2 * u + bob), Math.round(cx - 20 * u), Math.round(cy - 6 * u - bob * 2), c1); Gfx.line(g, Math.round(cx - 14 * u), Math.round(cy + 3 * u + bob), Math.round(cx - 20 * u), Math.round(cy - 5 * u - bob * 2), c1);
        if (s.t === 'wolf') { R(cx + 14 * u, cy + 3 * u + bob, 6 * u, 1, '#ffffff'); }
        break;
      }
      case 'rat': {
        E(cx, cy + 4 * u + bob, 12 * u, 8 * u, c1); E(cx - 2 * u, cy + 2 * u + bob, 7 * u, 4 * u, l1);
        E(cx + 11 * u, cy + bob, 7 * u, 5 * u, c1); E(cx + 17 * u, cy + 1 * u + bob, 3 * u, 2 * u, c2); P(cx + 19 * u, cy + bob, '#f08080');
        E(cx + 8 * u, cy - 6 * u + bob, 4 * u, 4 * u, c1); E(cx + 8 * u, cy - 6 * u + bob, 2 * u, 2 * u, '#f0a0a0'); E(cx + 14 * u, cy - 5 * u + bob, 3 * u, 3 * u, c1);
        eyes(cx + 12 * u, cy - 1 * u + bob, Math.max(1, Math.round(1.5 * u)), 2 * u);
        R(cx - 8 * u, cy + 10 * u, 3 * u, 5 * u, d1); R(cx + 4 * u, cy + 10 * u, 3 * u, 5 * u, d1);
        Gfx.line(g, Math.round(cx - 12 * u), Math.round(cy + 4 * u), Math.round(cx - 22 * u), Math.round(cy - 2 * u), '#f0a0a0');
        break;
      }
      case 'ape': case 'brute': {
        E(cx, cy + 2 * u + bob, 13 * u, 11 * u, c1); E(cx, cy + 4 * u + bob, 8 * u, 7 * u, c2); // body + belly
        E(cx, cy - 10 * u + bob, 8 * u, 7 * u, c1); E(cx, cy - 8 * u + bob, 6 * u, 4 * u, c2);
        eyes(cx, cy - 11 * u + bob, Math.max(1, Math.round(2 * u)), 3 * u); R(cx - 3 * u, cy - 6 * u + bob, 6 * u, 1, '#202020');
        R(cx - 18 * u, cy - 4 * u + bob, 6 * u, 16 * u, c1); R(cx + 12 * u, cy - 4 * u + bob, 6 * u, 16 * u, c1); E(cx - 15 * u, cy + 12 * u + bob, 4 * u, 3 * u, d1); E(cx + 15 * u, cy + 12 * u + bob, 4 * u, 3 * u, d1);
        R(cx - 9 * u, cy + 11 * u, 6 * u, 7 * u, d1); R(cx + 3 * u, cy + 11 * u, 6 * u, 7 * u, d1);
        if (s.t === 'brute') { R(cx + 14 * u, cy - 18 * u + bob, 3 * u, 16 * u, '#8a6a48'); E(cx + 15 * u, cy - 19 * u + bob, 5 * u, 3 * u, '#909098'); T(cx - 7 * u, cy - 17 * u + bob, cx - 5 * u, cy - 24 * u + bob, cx - 3 * u, cy - 17 * u + bob, '#e0d0b0'); T(cx + 3 * u, cy - 17 * u + bob, cx + 5 * u, cy - 24 * u + bob, cx + 7 * u, cy - 17 * u + bob, '#e0d0b0'); }
        break;
      }
      case 'bat': {
        E(cx, cy + bob * 2, 6 * u, 6 * u, c1); T(cx - 4 * u, cy - 2 * u + bob * 2, cx - 20 * u, cy - 10 * u + bob * 4, cx - 18 * u, cy + 6 * u, c1); T(cx + 4 * u, cy - 2 * u + bob * 2, cx + 20 * u, cy - 10 * u + bob * 4, cx + 18 * u, cy + 6 * u, c1);
        T(cx - 3 * u, cy - 5 * u, cx - 4 * u, cy - 11 * u, cx, cy - 5 * u, c1); T(cx + 3 * u, cy - 5 * u, cx + 4 * u, cy - 11 * u, cx, cy - 5 * u, c1);
        eyes(cx, cy - 2 * u + bob * 2, Math.max(1, Math.round(1.5 * u)), 2 * u); P(cx - 1, cy + 2 * u, '#ffffff'); P(cx + 1, cy + 2 * u, '#ffffff');
        break;
      }
      case 'bird': {
        E(cx, cy + 2 * u + bob, 10 * u, 8 * u, c1); E(cx + 8 * u, cy - 6 * u + bob, 6 * u, 5 * u, c1); T(cx + 12 * u, cy - 7 * u + bob, cx + 20 * u, cy - 5 * u + bob, cx + 12 * u, cy - 3 * u + bob, '#f0a020');
        T(cx - 4 * u, cy + bob, cx - 20 * u, cy - 12 * u - bob * 3, cx - 8 * u, cy + 6 * u, l1); T(cx + 2 * u, cy + bob, cx + 4 * u, cy - 14 * u - bob * 3, cx + 8 * u, cy + 4 * u, l1);
        eyes(cx + 9 * u, cy - 8 * u + bob, Math.max(1, Math.round(1.5 * u)), 1.5 * u);
        R(cx - 3 * u, cy + 9 * u, 2 * u, 6 * u, '#f0a020'); R(cx + 3 * u, cy + 9 * u, 2 * u, 6 * u, '#f0a020');
        T(cx - 10 * u, cy + 4 * u, cx - 20 * u, cy + 10 * u, cx - 8 * u, cy + 8 * u, c2);
        break;
      }
      case 'insect': case 'insect_fly': {
        E(cx - 8 * u, cy + 3 * u + bob, 9 * u, 6 * u, c1); E(cx + 2 * u, cy + 1 * u + bob, 6 * u, 5 * u, d1); E(cx + 10 * u, cy - 1 * u + bob, 5 * u, 4 * u, c1);
        eyes(cx + 11 * u, cy - 3 * u + bob, Math.max(1, Math.round(1.5 * u)), 2 * u);
        for (let i = 0; i < 3; i++) { Gfx.line(g, Math.round(cx - 4 * u + i * 5 * u), Math.round(cy + 4 * u), Math.round(cx - 8 * u + i * 6 * u), Math.round(cy + 12 * u), d1); Gfx.line(g, Math.round(cx - 4 * u + i * 5 * u), Math.round(cy + 4 * u), Math.round(cx - 2 * u + i * 6 * u), Math.round(cy - 4 * u), d1); }
        Gfx.line(g, Math.round(cx + 12 * u), Math.round(cy - 4 * u), Math.round(cx + 18 * u), Math.round(cy - 10 * u), d1);
        if (s.t === 'insect_fly') { E(cx - 4 * u, cy - 6 * u - bob * 2, 8 * u, 3 * u, 'rgba(200,220,255,0.8)'); E(cx + 4 * u, cy - 7 * u - bob * 2, 7 * u, 3 * u, 'rgba(200,220,255,0.8)'); R(cx - 12 * u, cy + 2 * u + bob, 8 * u, 2, '#202020'); }
        break;
      }
      case 'spider': {
        E(cx - 2 * u, cy + 2 * u + bob, 11 * u, 9 * u, c1); E(cx + 9 * u, cy + bob, 6 * u, 5 * u, d1); E(cx - 4 * u, cy - 1 * u + bob, 5 * u, 3 * u, c2);
        for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; Gfx.line(g, Math.round(cx), Math.round(cy + 2 * u), Math.round(cx - Math.cos(a) * 20 * u), Math.round(cy + 2 * u - Math.sin(a) * 10 * u + 6 * u), c1); Gfx.line(g, Math.round(cx), Math.round(cy + 2 * u), Math.round(cx + Math.cos(a) * 20 * u), Math.round(cy + 2 * u - Math.sin(a) * 10 * u + 6 * u), c1); }
        for (let i = 0; i < 3; i++) { P(cx + 7 * u + i * 2 * u, cy - 2 * u + bob, eye); P(cx + 8 * u + i * 2 * u, cy + bob, eye); }
        break;
      }
      case 'scorpion': {
        E(cx, cy + 4 * u + bob, 12 * u, 6 * u, c1); E(cx + 10 * u, cy + 2 * u + bob, 5 * u, 4 * u, d1);
        for (let i = 0; i < 4; i++) { Gfx.line(g, Math.round(cx - 6 * u + i * 4 * u), Math.round(cy + 6 * u), Math.round(cx - 10 * u + i * 5 * u), Math.round(cy + 14 * u), d1); }
        Gfx.line(g, Math.round(cx - 12 * u), Math.round(cy + 2 * u), Math.round(cx - 18 * u), Math.round(cy - 8 * u), c1); Gfx.line(g, Math.round(cx - 18 * u), Math.round(cy - 8 * u), Math.round(cx - 12 * u), Math.round(cy - 14 * u - bob * 2), c1); E(cx - 11 * u, cy - 15 * u - bob * 2, 3 * u, 2 * u, c2);
        E(cx + 16 * u, cy - 2 * u + bob, 4 * u, 3 * u, c1); E(cx + 16 * u, cy + 7 * u + bob, 4 * u, 3 * u, c1); eyes(cx + 11 * u, cy + bob, Math.max(1, Math.round(1.5 * u)), 2 * u);
        break;
      }
      case 'serpent': {
        for (let i = 0; i < 6; i++) { const x = cx - 14 * u + i * 5 * u, y = cy + 6 * u + Math.sin(i + f) * 4 * u; E(x, y, 5 * u, 4 * u, i % 2 ? c1 : d1); }
        E(cx + 12 * u, cy - 6 * u + bob, 7 * u, 5 * u, c1); E(cx + 18 * u, cy - 4 * u + bob, 4 * u, 2 * u, d1); eyes(cx + 13 * u, cy - 8 * u + bob, Math.max(1, Math.round(1.5 * u)), 2.5 * u);
        Gfx.line(g, Math.round(cx + 22 * u), Math.round(cy - 4 * u), Math.round(cx + 26 * u), Math.round(cy - 4 * u), '#f04040');
        for (let i = 0; i < 4; i++) P(cx - 10 * u + i * 6 * u, cy + 3 * u, c2);
        break;
      }
      case 'dragon': {
        E(cx, cy + 4 * u + bob, 14 * u, 9 * u, c1); E(cx, cy + 6 * u + bob, 9 * u, 5 * u, c2);
        T(cx - 6 * u, cy - 2 * u + bob, cx - 22 * u, cy - 18 * u - bob * 2, cx - 4 * u, cy + 4 * u, d1); T(cx + 6 * u, cy - 2 * u + bob, cx + 22 * u, cy - 18 * u - bob * 2, cx + 4 * u, cy + 4 * u, d1);
        R(cx + 6 * u, cy - 12 * u + bob, 5 * u, 10 * u, c1); E(cx + 11 * u, cy - 14 * u + bob, 7 * u, 5 * u, c1); E(cx + 17 * u, cy - 12 * u + bob, 4 * u, 2 * u, d1);
        T(cx + 8 * u, cy - 18 * u + bob, cx + 9 * u, cy - 24 * u + bob, cx + 11 * u, cy - 18 * u + bob, c2); T(cx + 13 * u, cy - 18 * u + bob, cx + 15 * u, cy - 23 * u + bob, cx + 16 * u, cy - 17 * u + bob, c2);
        eyes(cx + 12 * u, cy - 16 * u + bob, Math.max(1, Math.round(1.5 * u)), 2 * u);
        R(cx - 10 * u, cy + 10 * u, 5 * u, 8 * u, d1); R(cx + 4 * u, cy + 10 * u, 5 * u, 8 * u, d1);
        Gfx.line(g, Math.round(cx - 14 * u), Math.round(cy + 4 * u), Math.round(cx - 24 * u), Math.round(cy + 12 * u), c1); Gfx.line(g, Math.round(cx - 14 * u), Math.round(cy + 5 * u), Math.round(cx - 24 * u), Math.round(cy + 13 * u), c1);
        for (let i = 0; i < 4; i++) T(cx - 8 * u + i * 4 * u, cy - 5 * u + bob, cx - 6 * u + i * 4 * u, cy - 9 * u + bob, cx - 4 * u + i * 4 * u, cy - 5 * u + bob, c2);
        break;
      }
      case 'lizard': {
        E(cx, cy + 5 * u + bob, 9 * u, 8 * u, c1); E(cx, cy + 7 * u + bob, 5 * u, 5 * u, c2);
        E(cx, cy - 7 * u + bob, 7 * u, 6 * u, c1); E(cx + 5 * u, cy - 5 * u + bob, 4 * u, 3 * u, d1); eyes(cx, cy - 9 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u);
        R(cx - 14 * u, cy - 2 * u + bob, 5 * u, 10 * u, c1); R(cx + 9 * u, cy - 2 * u + bob, 5 * u, 10 * u, c1);
        R(cx - 7 * u, cy + 11 * u, 5 * u, 7 * u, d1); R(cx + 2 * u, cy + 11 * u, 5 * u, 7 * u, d1);
        Gfx.line(g, Math.round(cx - 6 * u), Math.round(cy + 10 * u), Math.round(cx - 18 * u), Math.round(cy + 16 * u), c1);
        T(cx - 3 * u, cy - 13 * u + bob, cx, cy - 18 * u + bob, cx + 3 * u, cy - 13 * u + bob, c2);
        R(cx + 12 * u, cy - 12 * u + bob, 2 * u, 12 * u, '#8a6a48'); E(cx + 13 * u, cy - 13 * u + bob, 4 * u, 2 * u, '#909098');
        break;
      }
      case 'toad': {
        E(cx, cy + 4 * u + bob, 14 * u, 9 * u, c1); E(cx, cy + 7 * u + bob, 9 * u, 5 * u, c2);
        E(cx - 6 * u, cy - 6 * u + bob, 4 * u, 4 * u, c1); E(cx + 6 * u, cy - 6 * u + bob, 4 * u, 4 * u, c1); R(cx - 7 * u, cy - 7 * u + bob, 2 * u, 2 * u, eye); R(cx + 5 * u, cy - 7 * u + bob, 2 * u, 2 * u, eye);
        R(cx - 8 * u, cy - 1 * u + bob, 16 * u, 1, '#202020'); E(cx - 14 * u, cy + 10 * u, 5 * u, 4 * u, d1); E(cx + 14 * u, cy + 10 * u, 5 * u, 4 * u, d1);
        for (let i = 0; i < 5; i++) P(cx - 8 * u + i * 4 * u, cy + 2 * u + bob, d1);
        break;
      }
      case 'slime': {
        E(cx, cy + 6 * u + bob, 14 * u, 9 * u - bob * 2, c1); E(cx - 4 * u, cy + 1 * u + bob, 5 * u, 3 * u, c2);
        eyes(cx, cy + 4 * u + bob, Math.max(1, Math.round(2 * u)), 4 * u); Gfx.line(g, Math.round(cx - 3 * u), Math.round(cy + 9 * u), Math.round(cx + 3 * u), Math.round(cy + 9 * u), d1);
        break;
      }
      case 'mushroom': {
        E(cx, cy - 4 * u + bob, 15 * u, 8 * u, c1); R(cx - 6 * u, cy + bob, 12 * u, 14 * u, c2); E(cx, cy + 14 * u, 7 * u, 3 * u, shade(c2, 0.8));
        for (let i = 0; i < 4; i++) E(cx - 9 * u + i * 6 * u, cy - 6 * u + (i % 2) * 3 * u + bob, 2 * u, 1.5 * u, tint(c1, 0.5));
        eyes(cx, cy + 4 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u); R(cx - 2 * u, cy + 9 * u + bob, 4 * u, 1, '#202020');
        break;
      }
      case 'plant': {
        R(cx - 3 * u, cy - 2 * u, 6 * u, 18 * u, '#3c8c3c'); E(cx, cy + 16 * u, 10 * u, 3 * u, '#6a4a2a');
        E(cx, cy - 8 * u + bob, 11 * u, 8 * u, c1); E(cx, cy - 6 * u + bob, 6 * u, 3 * u, '#301010');
        for (let i = 0; i < 5; i++) T(cx - 10 * u + i * 5 * u, cy - 8 * u + bob, cx - 8 * u + i * 5 * u, cy - 3 * u + bob, cx - 6 * u + i * 5 * u, cy - 8 * u + bob, '#f0f0e0');
        eyes(cx, cy - 12 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u);
        T(cx - 16 * u, cy + 8 * u, cx - 4 * u, cy + 4 * u, cx - 10 * u, cy + 14 * u, '#48a848'); T(cx + 16 * u, cy + 8 * u, cx + 4 * u, cy + 4 * u, cx + 10 * u, cy + 14 * u, '#48a848');
        break;
      }
      case 'ghost': {
        g.globalAlpha = 0.85;
        E(cx, cy - 2 * u + bob * 2, 10 * u, 11 * u, c1); R(cx - 10 * u, cy - 2 * u + bob * 2, 20 * u, 10 * u, c1);
        for (let i = 0; i < 4; i++) T(cx - 10 * u + i * 5 * u, cy + 8 * u + bob * 2, cx - 7.5 * u + i * 5 * u, cy + 14 * u + bob * 2 + (i % 2) * 2, cx - 5 * u + i * 5 * u, cy + 8 * u + bob * 2, c1);
        g.globalAlpha = 1;
        R(cx - 5 * u, cy - 4 * u + bob * 2, 3 * u, 4 * u, eye); R(cx + 2 * u, cy - 4 * u + bob * 2, 3 * u, 4 * u, eye); E(cx, cy + 3 * u + bob * 2, 3 * u, 2 * u, '#202030');
        break;
      }
      case 'skeleton': {
        E(cx, cy - 10 * u + bob, 6 * u, 6 * u, c1); R(cx - 4 * u, cy - 5 * u + bob, 8 * u, 3 * u, c1); R(cx - 3 * u, cy - 9 * u + bob, 2 * u, 2 * u, eye); R(cx + 1 * u, cy - 9 * u + bob, 2 * u, 2 * u, eye);
        for (let i = 0; i < 4; i++) P(cx - 3 * u + i * 2 * u, cy - 3 * u + bob, '#202020');
        R(cx - 1 * u, cy - 2 * u + bob, 2 * u, 14 * u, c1); for (let i = 0; i < 4; i++) R(cx - 7 * u, cy + i * 3 * u + bob, 14 * u, 1.5 * u, c1);
        R(cx - 10 * u, cy - 1 * u + bob, 3 * u, 12 * u, c1); R(cx + 7 * u, cy - 1 * u + bob, 3 * u, 12 * u, c1);
        R(cx - 5 * u, cy + 12 * u, 3 * u, 8 * u, c1); R(cx + 2 * u, cy + 12 * u, 3 * u, 8 * u, c1);
        R(cx + 8 * u, cy - 16 * u + bob, 2 * u, 18 * u, '#8a6a48'); T(cx + 6 * u, cy - 16 * u + bob, cx + 12 * u, cy - 22 * u + bob, cx + 12 * u, cy - 14 * u + bob, '#c0c8d8');
        R(cx - 5 * u, cy - 4 * u + bob, 10 * u, 6 * u, c2 + '88');
        break;
      }
      case 'zombie': {
        E(cx, cy - 10 * u + bob, 6 * u, 6 * u, c1); R(cx - 3 * u, cy - 11 * u + bob, 2 * u, 2 * u, eye); R(cx + 1 * u, cy - 11 * u + bob, 2 * u, 2 * u, eye); R(cx - 2 * u, cy - 6 * u + bob, 4 * u, 1, '#202020');
        R(cx - 6 * u, cy - 4 * u + bob, 12 * u, 14 * u, c2); R(cx - 4 * u, cy - 2 * u + bob, 3 * u, 4 * u, c1);
        R(cx - 12 * u, cy - 2 * u + bob, 6 * u, 3 * u, c1); R(cx + 6 * u, cy - 2 * u + bob, 6 * u, 3 * u, c1);
        R(cx - 5 * u, cy + 10 * u, 4 * u, 8 * u, c2); R(cx + 1 * u, cy + 10 * u, 4 * u, 8 * u, c2);
        break;
      }
      case 'golem': {
        R(cx - 10 * u, cy - 6 * u + bob, 20 * u, 16 * u, c1); R(cx - 8 * u, cy - 4 * u + bob, 6 * u, 6 * u, l1);
        R(cx - 6 * u, cy - 16 * u + bob, 12 * u, 10 * u, c1); R(cx - 4 * u, cy - 13 * u + bob, 3 * u, 3 * u, eye); R(cx + 1 * u, cy - 13 * u + bob, 3 * u, 3 * u, eye);
        R(cx - 18 * u, cy - 4 * u + bob, 7 * u, 14 * u, d1); R(cx + 11 * u, cy - 4 * u + bob, 7 * u, 14 * u, d1);
        R(cx - 9 * u, cy + 10 * u, 7 * u, 8 * u, d1); R(cx + 2 * u, cy + 10 * u, 7 * u, 8 * u, d1);
        for (let i = 0; i < 3; i++) Gfx.line(g, Math.round(cx - 6 * u + i * 6 * u), Math.round(cy - 2 * u), Math.round(cx - 3 * u + i * 6 * u), Math.round(cy + 6 * u), d1);
        R(cx - 3 * u, cy - 8 * u + bob, 6 * u, 1, c2);
        break;
      }
      case 'gargoyle': {
        T(cx - 6 * u, cy - 2 * u + bob, cx - 20 * u, cy - 16 * u - bob * 2, cx - 4 * u, cy + 4 * u, d1); T(cx + 6 * u, cy - 2 * u + bob, cx + 20 * u, cy - 16 * u - bob * 2, cx + 4 * u, cy + 4 * u, d1);
        E(cx, cy + 2 * u + bob, 9 * u, 9 * u, c1); E(cx, cy - 10 * u + bob, 6 * u, 6 * u, c1); T(cx - 5 * u, cy - 14 * u + bob, cx - 6 * u, cy - 20 * u + bob, cx - 2 * u, cy - 14 * u + bob, c1); T(cx + 5 * u, cy - 14 * u + bob, cx + 6 * u, cy - 20 * u + bob, cx + 2 * u, cy - 14 * u + bob, c1);
        eyes(cx, cy - 12 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u); R(cx - 6 * u, cy + 10 * u, 4 * u, 8 * u, d1); R(cx + 2 * u, cy + 10 * u, 4 * u, 8 * u, d1);
        break;
      }
      case 'tree': {
        R(cx - 8 * u, cy - 4 * u, 16 * u, 22 * u, c1); R(cx - 6 * u, cy - 2 * u, 3 * u, 18 * u, tint(c1, 0.2));
        E(cx, cy - 12 * u + bob, 20 * u, 10 * u, c2); E(cx - 6 * u, cy - 16 * u + bob, 10 * u, 6 * u, tint(c2, 0.25)); E(cx + 8 * u, cy - 14 * u + bob, 9 * u, 6 * u, shade(c2, 0.8));
        R(cx - 5 * u, cy + 2 * u, 3 * u, 3 * u, eye); R(cx + 2 * u, cy + 2 * u, 3 * u, 3 * u, eye); E(cx, cy + 9 * u, 4 * u, 2 * u, '#201010');
        R(cx - 14 * u, cy + 16 * u, 6 * u, 4 * u, d1); R(cx + 8 * u, cy + 16 * u, 6 * u, 4 * u, d1);
        break;
      }
      case 'gnome': {
        T(cx - 6 * u, cy - 8 * u + bob, cx, cy - 22 * u + bob, cx + 6 * u, cy - 8 * u + bob, c1); E(cx, cy - 6 * u + bob, 6 * u, 5 * u, '#f0c090'); eyes(cx, cy - 7 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u);
        E(cx, cy - 1 * u + bob, 5 * u, 3 * u, '#e8e8e8'); R(cx - 7 * u, cy + bob, 14 * u, 12 * u, c1); R(cx - 4 * u, cy + 12 * u, 3 * u, 6 * u, d1); R(cx + 1 * u, cy + 12 * u, 3 * u, 6 * u, d1);
        R(cx + 8 * u, cy - 12 * u + bob, 2 * u, 22 * u, '#8a6a48'); E(cx + 9 * u, cy - 14 * u + bob, 3 * u, 3 * u, c2);
        break;
      }
      case 'demon': {
        E(cx, cy + bob, 10 * u, 10 * u, c1); T(cx - 8 * u, cy - 6 * u + bob, cx - 12 * u, cy - 16 * u + bob, cx - 4 * u, cy - 8 * u + bob, c2); T(cx + 8 * u, cy - 6 * u + bob, cx + 12 * u, cy - 16 * u + bob, cx + 4 * u, cy - 8 * u + bob, c2);
        T(cx - 8 * u, cy + 2 * u + bob, cx - 22 * u, cy - 8 * u - bob * 2, cx - 10 * u, cy + 10 * u, d1); T(cx + 8 * u, cy + 2 * u + bob, cx + 22 * u, cy - 8 * u - bob * 2, cx + 10 * u, cy + 10 * u, d1);
        R(cx - 5 * u, cy - 3 * u + bob, 3 * u, 3 * u, eye); R(cx + 2 * u, cy - 3 * u + bob, 3 * u, 3 * u, eye); R(cx - 4 * u, cy + 4 * u + bob, 8 * u, 2 * u, '#201010'); for (let i = 0; i < 4; i++) P(cx - 3 * u + i * 2 * u, cy + 4 * u + bob, '#ffffff');
        R(cx - 6 * u, cy + 9 * u, 4 * u, 8 * u, d1); R(cx + 2 * u, cy + 9 * u, 4 * u, 8 * u, d1);
        break;
      }
      case 'armor': {
        R(cx - 9 * u, cy - 6 * u + bob, 18 * u, 16 * u, c1); R(cx - 7 * u, cy - 4 * u + bob, 14 * u, 2 * u, c2); R(cx - 1 * u, cy - 4 * u + bob, 2 * u, 12 * u, c2);
        R(cx - 6 * u, cy - 16 * u + bob, 12 * u, 10 * u, c1); R(cx - 6 * u, cy - 12 * u + bob, 12 * u, 3 * u, '#101018'); R(cx - 4 * u, cy - 12 * u + bob, 3 * u, 2 * u, eye); R(cx + 1 * u, cy - 12 * u + bob, 3 * u, 2 * u, eye);
        T(cx - 6 * u, cy - 16 * u + bob, cx - 10 * u, cy - 26 * u + bob, cx - 2 * u, cy - 16 * u + bob, c2); T(cx + 6 * u, cy - 16 * u + bob, cx + 10 * u, cy - 26 * u + bob, cx + 2 * u, cy - 16 * u + bob, c2);
        R(cx - 16 * u, cy - 4 * u + bob, 6 * u, 14 * u, d1); R(cx + 10 * u, cy - 4 * u + bob, 6 * u, 14 * u, d1); R(cx - 8 * u, cy + 10 * u, 6 * u, 8 * u, d1); R(cx + 2 * u, cy + 10 * u, 6 * u, 8 * u, d1);
        R(cx + 13 * u, cy - 24 * u + bob, 2 * u, 30 * u, '#c0c8d8'); R(cx + 11 * u, cy - 24 * u + bob, 6 * u, 3 * u, '#c0c8d8');
        break;
      }
      case 'manticore': {
        E(cx, cy + 4 * u + bob, 15 * u, 9 * u, c1); E(cx + 10 * u, cy - 4 * u + bob, 8 * u, 7 * u, c2); E(cx + 10 * u, cy - 4 * u + bob, 5 * u, 5 * u, '#f0c090');
        for (let i = 0; i < 8; i++) { const a = i * 0.8; T(cx + 10 * u + Math.cos(a) * 7 * u, cy - 4 * u + Math.sin(a) * 6 * u, cx + 10 * u + Math.cos(a) * 12 * u, cy - 4 * u + Math.sin(a) * 10 * u, cx + 10 * u + Math.cos(a + 0.4) * 7 * u, cy - 4 * u + Math.sin(a + 0.4) * 6 * u, c2); }
        eyes(cx + 10 * u, cy - 6 * u + bob, Math.max(1, Math.round(1.5 * u)), 2.5 * u); R(cx + 8 * u, cy - 1 * u + bob, 4 * u, 1, '#201010');
        T(cx - 6 * u, cy - 2 * u + bob, cx - 20 * u, cy - 16 * u - bob * 2, cx - 4 * u, cy + 4 * u, d1);
        Gfx.line(g, Math.round(cx - 14 * u), Math.round(cy + 2 * u), Math.round(cx - 22 * u), Math.round(cy - 10 * u), c1); E(cx - 22 * u, cy - 12 * u - bob, 3 * u, 3 * u, '#8040a0');
        R(cx - 10 * u, cy + 10 * u, 4 * u, 8 * u, d1); R(cx - 3 * u, cy + 11 * u, 4 * u, 7 * u, d1); R(cx + 5 * u, cy + 10 * u, 4 * u, 8 * u, d1); R(cx + 11 * u, cy + 11 * u, 4 * u, 7 * u, d1);
        break;
      }
      case 'jelly': {
        g.globalAlpha = 0.8; E(cx, cy - 4 * u + bob, 12 * u, 9 * u, c1); E(cx - 3 * u, cy - 7 * u + bob, 5 * u, 3 * u, c2); g.globalAlpha = 1;
        for (let i = 0; i < 6; i++) Gfx.line(g, Math.round(cx - 9 * u + i * 3.6 * u), Math.round(cy + 4 * u), Math.round(cx - 10 * u + i * 3.6 * u + Math.sin(i + f) * 2), Math.round(cy + 16 * u), c1);
        eyes(cx, cy - 4 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u);
        break;
      }
      case 'squid': {
        E(cx, cy - 6 * u + bob, 9 * u, 12 * u, c1); E(cx - 3 * u, cy - 10 * u + bob, 4 * u, 5 * u, c2);
        eyes(cx, cy - 2 * u + bob, Math.max(1, Math.round(2 * u)), 4 * u);
        for (let i = 0; i < 6; i++) { const x = cx - 10 * u + i * 4 * u; Gfx.line(g, Math.round(x), Math.round(cy + 4 * u), Math.round(x + Math.sin(i * 1.3 + f) * 5 * u), Math.round(cy + 18 * u), c1); }
        break;
      }
      case 'fish': {
        E(cx, cy + bob, 14 * u, 8 * u, c1); E(cx - 2 * u, cy - 2 * u + bob, 8 * u, 3 * u, c2); T(cx - 12 * u, cy + bob, cx - 20 * u, cy - 8 * u + bob, cx - 20 * u, cy + 8 * u + bob, c1);
        T(cx - 2 * u, cy - 7 * u + bob, cx + 4 * u, cy - 14 * u + bob, cx + 6 * u, cy - 7 * u + bob, d1); eyes(cx + 9 * u, cy - 2 * u + bob, Math.max(1, Math.round(1.5 * u)), 1.5 * u);
        break;
      }
      case 'merman': {
        E(cx, cy - 10 * u + bob, 6 * u, 6 * u, '#80c0b0'); eyes(cx, cy - 11 * u + bob, Math.max(1, Math.round(1.5 * u)), 3 * u); R(cx - 7 * u, cy - 4 * u + bob, 14 * u, 12 * u, c1);
        R(cx - 13 * u, cy - 2 * u + bob, 6 * u, 3 * u, '#80c0b0'); R(cx + 7 * u, cy - 2 * u + bob, 6 * u, 3 * u, '#80c0b0');
        E(cx, cy + 12 * u, 8 * u, 6 * u, c1); T(cx - 4 * u, cy + 14 * u, cx - 14 * u, cy + 20 * u, cx + 4 * u, cy + 18 * u, c2);
        R(cx + 12 * u, cy - 20 * u + bob, 2 * u, 26 * u, c2); T(cx + 9 * u, cy - 20 * u + bob, cx + 13 * u, cy - 26 * u + bob, cx + 17 * u, cy - 20 * u + bob, c2);
        for (let i = 0; i < 3; i++) T(cx - 4 * u + i * 4 * u, cy - 16 * u + bob, cx - 2 * u + i * 4 * u, cy - 20 * u + bob, cx + i * 4 * u, cy - 16 * u + bob, c2);
        break;
      }
      case 'orb': {
        E(cx, cy + bob * 2, 12 * u, 12 * u, c1); E(cx - 4 * u, cy - 5 * u + bob * 2, 4 * u, 3 * u, tint(c1, 0.5)); R(cx - 4 * u, cy - 2 * u + bob * 2, 3 * u, 4 * u, eye); R(cx + 1 * u, cy - 2 * u + bob * 2, 3 * u, 4 * u, eye);
        for (let i = 0; i < 4; i++) { const a = i * 1.57 + f * 0.5; E(cx + Math.cos(a) * 16 * u, cy + Math.sin(a) * 16 * u, 3 * u, 3 * u, c2 || c1); }
        break;
      }
      case 'mimic': {
        R(cx - 12 * u, cy - 2 * u + bob, 24 * u, 14 * u, c1); R(cx - 12 * u, cy - 10 * u + bob * 3, 24 * u, 8 * u, tint(c1, 0.2)); R(cx - 11 * u, cy - 3 * u + bob, 22 * u, 4 * u, '#201010');
        for (let i = 0; i < 6; i++) T(cx - 10 * u + i * 4 * u, cy - 2 * u + bob * 3, cx - 8 * u + i * 4 * u, cy + 2 * u + bob * 3, cx - 6 * u + i * 4 * u, cy - 2 * u + bob * 3, '#f0f0e0');
        R(cx - 6 * u, cy - 8 * u + bob * 3, 3 * u, 3 * u, eye); R(cx + 3 * u, cy - 8 * u + bob * 3, 3 * u, 3 * u, eye); R(cx - 12 * u, cy + 4 * u, 24 * u, 2, '#e8c040');
        Gfx.line(g, Math.round(cx - 8 * u), Math.round(cy + 6 * u), Math.round(cx - 14 * u), Math.round(cy + 14 * u), '#f04040'); Gfx.line(g, Math.round(cx + 8 * u), Math.round(cy + 6 * u), Math.round(cx + 14 * u), Math.round(cy + 14 * u), '#f04040');
        break;
      }
    }
  }
};
