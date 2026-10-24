// ---------- The summons, drawn in code ----------
// Each summoned spirit fills a 128x112 picture that rises over the battlefield while its name is called: Ramses's
// golden colossus, Cybele's tree-backed beast, Judgment's winged knight and the rest, drawn after the originals'
// silhouettes and colours with the same helpers the monsters use. The one-Djinni summons (Venus, Mercury, Mars,
// Jupiter) are bursts of their element rather than figures and keep their effect.
'use strict';
const BattleSummons = {
  cache: {},
  W: 128, H: 112,
  sprite(name, frame) {
    frame = frame ? 1 : 0; const key = name + ':' + frame;
    if (this.cache[key]) return this.cache[key];
    const fn = this.draw[name]; if (!fn) return null;
    const c = Gfx.canvas(this.W, this.H), g = Gfx.ctx(c);
    const K = Foes.kit(g, { a: '#808080', b: '#505050', c: '#c0c0c0', e: '#202020' });
    // a wider set of colours per figure
    K.col = (hex) => ({ m: hex, d: shade(hex, 0.7), l: tint(hex, 0.25) });
    fn(K, frame);
    return this.cache[key] = Gfx.outline(c, '#1a1428');
  },
  draw: {
    // the golden pharaoh colossus, its fist thrust out
    Ramses(K, f) {
      const { R, P, E, T, L, W } = K; const gold = K.col('#d8b040'), dark = K.col('#a07820'), red = '#e03030', teal = '#40a0a0';
      R(44, 44, 56, 60, gold.m); R(44, 44, 56, 4, gold.l); R(44, 98, 56, 6, gold.d); R(52, 60, 40, 30, dark.m); for (let i = 0; i < 4; i++) R(52, 62 + i * 7, 40, 2, gold.m);   // the torso, banded
      W(48, 56, 20, 76, 14, gold.m); E(14, 78, 12, 10, gold.m); E(12, 76, 8, 6, gold.l); for (let i = 0; i < 4; i++) L(4 + i * 5, 74, 4 + i * 5, 84, gold.d);                 // the arm and fist thrust out to the left
      W(96, 56, 112, 84, 12, gold.m); E(112, 88, 8, 7, gold.m);                                                                                                                   // the other arm at the side
      E(72, 30, 20, 20, gold.m); R(52, 26, 40, 22, gold.m); R(56, 30, 32, 16, '#e0c890'); E(72, 34, 14, 10, '#e0c890');                                                          // the head under the headdress
      R(48, 20, 48, 8, teal); for (let i = 0; i < 6; i++) R(50 + i * 8, 22, 4, 4, gold.m); R(44, 26, 10, 26, teal); R(90, 26, 10, 26, teal); for (let i = 0; i < 4; i++) { R(44, 30 + i * 6, 10, 2, gold.m); R(90, 30 + i * 6, 10, 2, gold.m); }   // the striped nemes
      R(60, 34, 6, 4, '#202020'); R(78, 34, 6, 4, '#202020'); P(61, 35, red); P(79, 35, red); R(66, 42, 12, 2, dark.m); R(70, 12, 4, 10, gold.m); E(72, 12, 5, 5, red); P(70, 10, '#ffffff');   // the eyes, the jewel on the brow
      R(64, 46, 16, 6, '#e0c890'); R(60, 50, 24, 4, gold.l);
    },
    // the wise beast with a tree growing from its back
    Cybele(K, f) {
      const { R, P, E, T, L, W } = K; const fur = K.col('#c89838'), green = K.col('#40a040'), bark = K.col('#7a4a20');
      E(66, 78, 34, 22, fur.m); E(60, 70, 22, 12, fur.l); E(66, 92, 30, 8, fur.d);                                                                                              // the crouched body
      W(40, 86, 30, 104, 9, fur.m); W(92, 86, 102, 104, 9, fur.m); R(24, 100, 14, 5, fur.d); R(96, 100, 14, 5, fur.d);                                                          // legs and paws
      E(42, 62, 16, 13, fur.m); E(38, 58, 10, 7, fur.l); R(28, 64, 20, 6, '#f0e8d8'); T(30, 70, 46, 70, 38, 82, '#f0e8d8'); E(38, 61, 3, 3, '#e04040'); P(37, 60, '#ffffff');     // the head with a white beard, a red eye
      T(30, 54, 24, 44, 34, 50, fur.m); T(50, 54, 56, 44, 46, 50, fur.m);                                                                                                        // ears
      R(64, 40, 12, 30, bark.m); R(64, 40, 4, 30, bark.d); W(66, 44, 52, 30, 5, bark.m); W(74, 42, 90, 28, 5, bark.m);                                                          // the trunk and boughs
      for (const [x, y, r] of [[52, 22, 16], [72, 14, 18], [92, 22, 15], [64, 30, 12], [82, 30, 12]]) { E(x, y, r, r * 0.7, green.m); E(x - 3, y - 3, r * 0.6, r * 0.35, green.l); }   // the canopy
    },
    // the winged knight in blue steel, sword raised, a lion's head on its shield
    Judgment(K, f) {
      const { R, P, E, T, L, W } = K; const steel = K.col('#8090c0'), white = K.col('#f0f0f8'), gold = '#e0b040';
      T(52, 40, 6, 12, 14, 60, white.m); T(52, 40, 14, 60, 40, 60, white.m); T(76, 40, 122, 12, 114, 60, white.m); T(76, 40, 114, 60, 88, 60, white.m); for (let i = 0; i < 5; i++) { L(8 + i * 8, 14 + i * 9, 4 + i * 8, 22 + i * 9, white.d); L(120 - i * 8, 14 + i * 9, 124 - i * 8, 22 + i * 9, white.d); }   // the wings
      R(52, 84, 10, 20, steel.m); R(68, 84, 10, 20, steel.m); R(50, 100, 12, 5, steel.d); R(68, 100, 12, 5, steel.d);                                                          // greaves
      R(50, 44, 30, 40, steel.m); R(50, 44, 30, 4, steel.l); R(56, 54, 18, 12, steel.d); R(58, 56, 14, 4, steel.l); R(54, 80, 22, 4, gold);                                     // the breastplate
      E(48, 46, 10, 7, steel.m); E(82, 46, 10, 7, steel.m); W(44, 50, 30, 70, 8, steel.m); W(86, 50, 100, 60, 8, steel.m);                                                     // pauldrons and arms
      E(26, 72, 12, 12, '#d0a030'); E(26, 72, 8, 8, '#e0c060'); P(23, 70, '#202020'); P(29, 70, '#202020'); R(24, 74, 5, 2, '#803020'); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P(26 + Math.cos(a) * 13, 72 + Math.sin(a) * 13, '#a07020'); }   // the lion shield
      L(102, 58, 120, 10, '#e8e8f8'); L(103, 58, 121, 10, '#a0a0c0'); L(98, 54, 108, 60, gold);                                                                                    // the sword
      R(56, 26, 18, 18, steel.m); R(56, 26, 18, 3, steel.l); R(58, 34, 14, 4, '#101020'); P(60, 35, '#40c0ff'); P(69, 35, '#40c0ff'); T(56, 26, 74, 26, 65, 14, '#e04040');       // the helm
    },
    // the sea maiden with her fan, seated on a sea-worn rock
    Nereid(K, f) {
      const { R, P, E, T, L, W } = K; const robe = K.col('#60c0a0'), pink = K.col('#e07090'), hair = K.col('#6040a0'), rock = K.col('#508060');
      E(66, 92, 40, 14, rock.m); E(60, 86, 28, 8, rock.l); E(66, 100, 36, 6, rock.d); for (let i = 0; i < 5; i++) P(34 + i * 16, 90 + (i % 2) * 4, '#a0e0c0');                    // the rock
      T(46, 60, 96, 60, 100, 92, pink.m); T(46, 60, 100, 92, 40, 92, pink.m); R(40, 88, 60, 4, pink.d);                                                                            // the long skirt
      R(52, 42, 28, 24, robe.m); R(52, 42, 28, 3, robe.l); R(62, 44, 8, 22, '#f0f0e0'); R(52, 62, 28, 5, '#e0c040');                                                             // the kimono, an obi
      W(50, 48, 30, 62, 6, robe.m); W(82, 48, 96, 58, 6, robe.m); R(26, 58, 8, 6, '#f0d8c0'); R(94, 54, 8, 6, '#f0d8c0');                                                        // sleeves and hands
      T(20, 40, 46, 20, 40, 58, '#d0e8f0'); for (let i = 0; i < 5; i++) L(40, 56, 22 + i * 6, 22 + i * 4, '#90b0d0');                                                              // the fan
      E(66, 30, 12, 11, '#f0d8c0'); R(54, 20, 24, 12, hair.m); R(52, 26, 6, 24, hair.m); R(76, 26, 6, 22, hair.m); T(60, 18, 72, 18, 66, 6, hair.m); E(66, 12, 4, 3, '#e04060');   // the face, purple hair, a flower
      P(62, 31, '#202040'); P(70, 31, '#202040'); R(64, 36, 4, 1, '#c04060');
    },
    // the great blue whale leaping
    Neptune(K, f) {
      const { R, P, E, T, L, W } = K; const blue = K.col('#3868d0'), pale = K.col('#a0c8f0');
      E(64, 60, 52, 22, blue.m); E(56, 52, 36, 10, blue.l); E(64, 70, 44, 10, pale.m); for (let i = 0; i < 6; i++) L(30 + i * 12, 64, 30 + i * 12, 78, pale.d);                   // the body with a grooved throat
      T(108, 56, 126, 36, 122, 66, blue.m); T(108, 56, 122, 66, 126, 78, blue.m);                                                                                                  // the tail flukes
      T(56, 72, 40, 92, 70, 80, blue.m); E(20, 62, 12, 10, blue.m); E(16, 60, 6, 5, pale.m);                                                                                       // a fin, the snout
      E(34, 54, 4, 4, '#ffffff'); E(35, 54, 2, 2, '#202040'); R(14, 66, 24, 2, blue.d); for (let i = 0; i < 4; i++) P(50 + i * 10, 48, pale.l);                                     // the eye, the mouth line, spray on the back
      for (let i = 0; i < 7; i++) E(16 + i * 16, 96 + ((i + f) % 2) * 3, 8, 4, '#c0e0ff');                                                                                            // the sea below
    },
    // the frost beast on its ice, a red ribbon flying
    Boreas(K, f) {
      const { R, P, E, T, L, W } = K; const white = K.col('#e8f0f8'), ice = K.col('#60c0f0'), red = '#e03030';
      for (let i = 0; i < 6; i++) T(10 + i * 20, 104, 30 + i * 20, 104, 20 + i * 20, 80 - (i % 2) * 8, ice.m); for (let i = 0; i < 6; i++) L(20 + i * 20, 82 - (i % 2) * 8, 14 + i * 20, 104, ice.l);   // the ice crystals it rides
      E(66, 60, 34, 26, white.m); E(60, 50, 22, 12, '#ffffff'); E(66, 76, 28, 8, white.d);                                                                                               // the shaggy body
      W(44, 70, 30, 96, 10, white.m); W(88, 70, 100, 96, 10, white.m); E(30, 98, 8, 5, white.d); E(100, 98, 8, 5, white.d);                                                            // legs
      E(48, 34, 16, 14, white.m); E(44, 30, 10, 7, '#ffffff'); T(36, 36, 22, 40, 36, 44, white.m); R(24, 40, 12, 2, '#202040'); P(38, 32, '#40c0ff'); P(39, 32, '#40c0ff');            // the head, a long muzzle, an ice-blue eye
      T(50, 24, 46, 8, 56, 22, white.d); T(58, 24, 62, 8, 64, 24, white.d);                                                                                                            // horns of ice
      W(70, 40, 96, 24, 4, red); W(96, 24, 116, 30 + f * 4, 3, red); for (let i = 0; i < 4; i++) P(100 + i * 4, 28 + f * 3 + (i % 2), '#ff8080');                                     // the ribbon streaming back
    },
    // the flaming beast bounding forward
    Kirin(K, f) {
      const { R, P, E, T, L, W } = K; const gold = K.col('#e0a030'), fire = K.col('#e04020'), yellow = '#f0e040';
      for (const [x, y, h] of [[20, 80, 30], [34, 74, 40], [92, 70, 34], [106, 78, 28], [50, 62, 28], [78, 60, 24]]) { T(x - 8, y + 10, x + 8, y + 10, x, y - h + (f ? 4 : 0), fire.m); T(x - 4, y + 10, x + 4, y + 10, x, y - h * 0.6, yellow); }   // flames along the body
      E(64, 72, 38, 18, gold.m); E(58, 66, 26, 9, gold.l); E(64, 84, 34, 7, gold.d);                                                                                                            // the body
      W(36, 84, 22, 102, 8, gold.m); W(52, 86, 44, 104, 8, gold.m); W(84, 84, 96, 102, 8, gold.m); W(100, 82, 112, 100, 8, gold.m); for (const x of [22, 44, 96, 112]) R(x - 4, 100, 9, 4, fire.d);   // legs, hooves of ember
      E(28, 52, 14, 12, gold.m); E(24, 48, 8, 6, gold.l); T(18, 54, 6, 60, 18, 62, gold.m); R(8, 58, 10, 2, gold.d); P(22, 50, '#e03030'); P(23, 50, '#e03030');                                // the head, muzzle, a red eye
      T(30, 42, 26, 22, 36, 40, fire.m); T(36, 42, 40, 24, 44, 42, fire.m); for (let i = 0; i < 5; i++) T(40 + i * 8, 56, 48 + i * 8, 56, 44 + i * 8, 40 - (i % 2) * 6, fire.l);                 // horns of flame, the mane
      W(100, 66, 120, 44, 5, fire.m); T(116, 48, 126, 30, 124, 50, yellow);                                                                                                                     // the tail alight
    },
    // the purple dragon crouched, jaws wide
    Tiamat(K, f) {
      const { R, P, E, T, L, W } = K; const purple = K.col('#7050b0'), pale = K.col('#c0a0e0'), teeth = '#f0f0f0';
      T(64, 50, 100, 14, 112, 60, purple.d); T(64, 50, 112, 60, 90, 66, purple.d); L(64, 50, 100, 15, purple.m); T(70, 48, 40, 18, 44, 52, purple.d); L(70, 48, 41, 19, purple.m);   // the wings
      E(70, 76, 36, 18, purple.m); E(64, 70, 24, 8, pale.m); E(70, 86, 30, 6, purple.d);                                                                                            // the body
      W(96, 80, 122, 96, 6, purple.m); T(118, 92, 126, 104, 112, 100, purple.m);                                                                                                    // the tail
      for (const [x0, x1] of [[50, 40], [62, 58], [86, 92], [96, 106]]) { W(x0, 86, x1, 102, 6, purple.m); for (let i = 0; i < 3; i++) L(x1 - 4 + i * 4, 102, x1 - 5 + i * 4, 106, teeth); }   // legs and claws
      E(36, 56, 18, 14, purple.m); E(32, 50, 12, 8, pale.m); T(22, 52, 2, 56, 20, 64, purple.m); T(20, 64, 2, 74, 24, 70, purple.m); R(4, 62, 18, 3, '#301040');                    // the head and the open jaws
      for (let i = 0; i < 5; i++) { T(6 + i * 4, 62, 9 + i * 4, 62, 7 + i * 4, 58, teeth); T(6 + i * 4, 65, 9 + i * 4, 65, 8 + i * 4, 69, teeth); }                                    // fangs
      P(30, 50, '#40ff40'); P(31, 50, '#40ff40'); T(40, 46, 46, 32, 48, 48, pale.m); T(34, 44, 36, 30, 40, 46, pale.m); for (let i = 0; i < 5; i++) T(52 + i * 8, 62, 58 + i * 8, 62, 55 + i * 8, 54, pale.m);   // eye, horns, spines
    },
    // a burning stone hurled from the sky
    Meteor(K, f) {
      const { R, P, E, T, L, W } = K; const fire = K.col('#e05020'), yellow = '#f0d040', rock = K.col('#604030');
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + f * 0.3; const r = 40 + (i % 3) * 8; T(64 + Math.cos(a - 0.2) * 30, 56 + Math.sin(a - 0.2) * 30, 64 + Math.cos(a + 0.2) * 30, 56 + Math.sin(a + 0.2) * 30, 64 + Math.cos(a) * r, 56 + Math.sin(a) * r, fire.m); }   // tongues of flame all round
      E(64, 56, 32, 30, fire.m); E(64, 56, 26, 24, '#f08030'); E(60, 50, 16, 14, yellow);                                                                                                   // the fireball
      E(66, 60, 16, 14, rock.m); E(62, 56, 9, 7, rock.l); for (const [x, y] of [[58, 66], [72, 52], [74, 64], [60, 54]]) P(x, y, rock.d);                                                    // the stone at its heart
      for (let i = 0; i < 6; i++) { L(90 + i * 6, 14 + i * 4, 110 + i * 6, 0 + i * 4, '#f0a040'); }                                                                                          // the trail behind it
    },
    // the huntress with her bow, kneeling on a cloud
    Atalanta(K, f) {
      const { R, P, E, T, L, W } = K; const hair = K.col('#40b080'), dress = K.col('#c0e080'), skin = '#f0d8c0', gold = '#e0b040';
      for (let i = 0; i < 5; i++) E(30 + i * 16, 100 - (i % 2) * 3, 14, 6, '#e8f0e0');                                                                                              // the cloud
      R(50, 70, 22, 24, dress.m); T(44, 94, 84, 94, 78, 72, dress.m); R(44, 92, 40, 3, dress.d); W(72, 84, 92, 96, 7, skin); R(88, 94, 10, 5, '#a07040');                           // the skirt and a kneeling leg
      R(54, 46, 20, 26, dress.m); R(54, 46, 20, 3, dress.l); R(52, 66, 24, 5, gold); R(60, 50, 8, 14, '#f0f0e0');                                                                    // the bodice
      W(52, 52, 30, 60, 5, skin); W(76, 52, 92, 44, 5, skin); L(26, 30, 30, 90, gold); L(27, 30, 31, 90, shade(gold, 0.7)); L(26, 30, 34, 60, '#f0f0f0'); L(34, 60, 30, 90, '#f0f0f0');   // arms, the bow and its string
      L(34, 60, 88, 46, '#e0e0e0'); T(86, 43, 96, 45, 86, 49, '#c0c0c0');                                                                                                            // the arrow nocked
      E(64, 34, 11, 10, skin); R(52, 24, 24, 10, hair.m); R(50, 30, 6, 30, hair.m); R(74, 30, 6, 26, hair.m); T(50, 60, 40, 76, 56, 62, hair.m); T(80, 56, 90, 70, 74, 60, hair.m); R(56, 20, 16, 5, '#308060');   // the face, long green hair, a cap
      P(60, 35, '#204040'); P(68, 35, '#204040'); R(62, 40, 4, 1, '#c06060');
    },
    // the white great bird, wings raised high
    Procne(K, f) {
      const { R, P, E, T, L, W } = K; const white = K.col('#f0f0f8'), gold = K.col('#e0b040');
      T(56, 56, 18, 8 - f * 3, 30, 70, white.m); T(56, 56, 30, 70, 50, 74, white.m); T(72, 56, 110, 8 - f * 3, 98, 70, white.m); T(72, 56, 98, 70, 78, 74, white.m);                    // the wings
      for (let i = 0; i < 6; i++) { L(20 + i * 6, 12 + i * 8 - f * 2, 14 + i * 6, 20 + i * 8 - f * 2, white.d); L(108 - i * 6, 12 + i * 8 - f * 2, 114 - i * 6, 20 + i * 8 - f * 2, white.d); }   // pinions
      E(64, 66, 16, 22, white.m); E(62, 60, 10, 12, '#ffffff'); T(56, 84, 72, 84, 64, 108, white.d); T(50, 84, 60, 84, 46, 104, white.d); T(68, 84, 78, 84, 82, 104, white.d);         // the body and a long tail
      E(64, 40, 10, 10, white.m); T(56, 42, 44, 46, 56, 48, gold.m); P(60, 38, '#202040'); T(60, 32, 70, 30, 74, 20, gold.m); T(62, 30, 66, 28, 62, 18, gold.m);                        // the head, beak and a golden crest
      L(60, 88, 58, 96, gold.m); L(68, 88, 70, 96, gold.m);
    },
    // the thunder god, hammer raised
    Thor(K, f) {
      const { R, P, E, T, L, W } = K; const skin = '#f0c8a0', blue = K.col('#3050c0'), fur = K.col('#a07040'), steel = K.col('#a0a8c0'), beard = '#e0c890';
      R(52, 84, 10, 18, fur.m); R(68, 84, 10, 18, fur.m); R(48, 98, 14, 7, '#604020'); R(68, 98, 14, 7, '#604020');                                                                    // legs and boots
      R(50, 56, 30, 30, blue.m); R(50, 56, 30, 3, blue.l); T(50, 86, 80, 86, 76, 96, blue.m); R(48, 74, 34, 5, '#e0b040'); R(56, 58, 18, 14, '#c0c8d8'); R(60, 62, 10, 6, steel.d);   // tabard, belt, mail
      R(44, 50, 42, 10, fur.m); W(44, 58, 26, 80, 9, skin); W(86, 58, 100, 40, 9, skin); R(22, 78, 10, 8, skin); R(96, 36, 10, 8, skin);                                              // fur mantle, arms
      L(100, 40, 106, 10, '#7a4a20'); L(101, 40, 107, 10, '#b88650'); R(96, 4, 22, 12, steel.m); R(96, 4, 22, 3, steel.l); R(96, 13, 22, 3, steel.d); P(106, 9, '#40c0ff');            // the hammer, a spark on its head
      E(66, 40, 12, 11, skin); R(56, 44, 20, 10, beard); T(56, 54, 76, 54, 66, 66, beard); R(54, 30, 24, 8, steel.m); T(54, 34, 44, 20, 58, 30, '#f0f0f0'); T(78, 34, 88, 20, 74, 30, '#f0f0f0');   // the bearded face, the horned helm
      P(62, 40, '#204080'); P(70, 40, '#204080'); R(58, 38, 16, 1, beard);
    },
    // the bull demon leaping with a glowing blade
    Zagan(K, f) {
      const { R, P, E, T, L, W } = K; const gold = K.col('#d0a030'), blue = K.col('#4070c0'), blade = '#a0e0ff';
      E(60, 70, 30, 18, gold.m); E(54, 64, 18, 8, gold.l); E(60, 80, 26, 6, gold.d);                                                                                                  // the body
      W(40, 78, 22, 98, 8, gold.m); W(52, 82, 46, 102, 8, gold.m); W(78, 78, 92, 96, 8, gold.m); W(88, 74, 106, 92, 8, gold.m); for (const [x, y] of [[22, 98], [46, 102], [92, 96], [106, 92]]) R(x - 4, y, 9, 4, '#303030');   // legs, black hooves
      E(34, 46, 16, 13, blue.m); E(30, 42, 10, 6, blue.l); T(24, 50, 10, 54, 24, 58, blue.m); R(12, 52, 12, 2, blue.d); P(28, 44, '#ff4040'); P(29, 44, '#ff4040');                     // the blue head
      T(36, 38, 30, 20, 42, 36, '#f0f0f0'); T(44, 38, 52, 22, 50, 40, '#f0f0f0'); for (let i = 0; i < 5; i++) T(46 + i * 8, 54, 54 + i * 8, 54, 50 + i * 8, 42 - (i % 2) * 4, blue.m);   // horns and a mane
      W(70, 60, 90, 40, 5, gold.m); L(90, 40, 118, 12, blade); L(91, 40, 119, 12, '#60a0e0'); L(88, 42, 122, 8, 'rgba(160,224,255,0.4)');                                             // the arm and the glowing blade
      W(88, 76, 114, 70, 4, gold.m); E(116, 68, 4, 3, gold.d);                                                                                                                       // the tail
    },
    // the winged angel with the great sword
    Megaera(K, f) {
      const { R, P, E, T, L, W } = K; const white = K.col('#f0f0f8'), skin = '#f0d8c0', hair = K.col('#c09050'), pink = K.col('#e090b0');
      T(60, 40, 20, 10 - f * 2, 26, 60, white.m); T(60, 40, 26, 60, 50, 60, white.m); T(72, 40, 112, 10 - f * 2, 106, 60, white.m); T(72, 40, 106, 60, 82, 60, white.m);                   // wings
      R(56, 72, 8, 24, skin); R(68, 72, 8, 24, skin); R(54, 94, 10, 6, pink.d); R(68, 94, 10, 6, pink.d);                                                                            // legs
      R(52, 50, 28, 24, white.m); R(52, 50, 28, 3, '#ffffff'); T(52, 74, 80, 74, 76, 84, pink.m); R(50, 70, 32, 4, '#e0b040'); R(60, 52, 12, 12, pink.m);                            // the dress
      W(52, 56, 36, 78, 5, skin); W(80, 56, 100, 70, 5, skin);                                                                                                                       // arms
      R(96, 40, 8, 60, '#e8e8f8'); R(98, 40, 4, 60, '#c0c0e0'); T(96, 40, 104, 40, 100, 26, '#e8e8f8'); R(90, 68, 20, 4, '#e0b040');                                                 // the great sword, point up
      E(66, 36, 10, 10, skin); R(56, 26, 20, 8, hair.m); R(54, 30, 5, 22, hair.m); R(74, 30, 5, 20, hair.m); P(62, 37, '#402040'); P(70, 37, '#402040'); R(64, 41, 4, 1, '#c06080');   // the face and hair
    },
    // the flower spirit, leaf-green hair and pink gown
    Flora(K, f) {
      const { R, P, E, T, L, W } = K; const pink = K.col('#e080b0'), leaf = K.col('#50b060'), skin = '#f0d8c0', purple = K.col('#8050b0');
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + f * 0.2; W(64, 70, 64 + Math.cos(a) * 40, 70 + Math.sin(a) * 24, 2, leaf.m); E(64 + Math.cos(a) * 44, 70 + Math.sin(a) * 26, 5, 3, leaf.l); }   // vines with leaves
      T(50, 60, 78, 60, 86, 100, pink.m); T(50, 60, 86, 100, 42, 100, pink.m); R(42, 96, 44, 4, pink.d); for (let i = 0; i < 4; i++) E(48 + i * 10, 90, 4, 3, purple.m);           // the gown, flowers on its hem
      R(54, 44, 20, 18, pink.l); R(52, 58, 24, 4, purple.m); W(52, 48, 34, 40, 5, skin); W(76, 48, 96, 36, 5, skin); E(32, 38, 4, 3, skin); E(98, 34, 4, 3, skin);                  // bodice and open arms
      E(64, 32, 11, 10, skin); R(52, 20, 24, 10, purple.m); R(50, 26, 6, 26, purple.m); R(72, 26, 6, 22, purple.m); T(56, 18, 50, 4, 60, 14, leaf.m); T(70, 18, 78, 4, 66, 14, leaf.m); E(64, 14, 5, 4, pink.l);   // the face, hair, leaf horns, a flower
      P(60, 33, '#402040'); P(68, 33, '#402040'); R(62, 38, 4, 1, '#c04060');
    },
    // the white behemoth of the ice, red maw gaping
    Moloch(K, f) {
      const { R, P, E, T, L, W } = K; const white = K.col('#f0f4ff'), blue = K.col('#4080c0'), red = '#c02040';
      for (let i = 0; i < 7; i++) E(10 + i * 18, 100 + (i % 2) * 2, 12, 5, '#a0d0f0');                                                                                              // the ice it stands on
      E(68, 62, 42, 32, white.m); E(60, 50, 28, 14, '#ffffff'); E(68, 82, 36, 10, white.d);                                                                                       // the vast body
      W(36, 76, 26, 100, 12, white.m); W(100, 76, 110, 100, 12, white.m); for (const x of [18, 24, 30, 104, 110, 116]) L(x, 100, x, 106, red);                                       // legs with red claws
      for (let i = 0; i < 6; i++) T(64 + i * 8, 36, 72 + i * 8, 36, 68 + i * 8, 22 - (i % 2) * 6, blue.m);                                                                        // a blue mane of spikes
      E(38, 52, 22, 18, white.m); E(34, 46, 14, 8, '#ffffff'); R(18, 58, 30, 12, red); R(18, 62, 30, 4, '#801030'); for (let i = 0; i < 7; i++) { T(18 + i * 4, 58, 22 + i * 4, 58, 20 + i * 4, 63, '#ffffff'); T(18 + i * 4, 70, 22 + i * 4, 70, 20 + i * 4, 65, '#ffffff'); }   // the head with its gaping red maw
      P(32, 48, '#40c0ff'); P(33, 48, '#40c0ff'); T(28, 42, 22, 28, 34, 40, '#e0b040'); T(48, 40, 54, 26, 56, 42, blue.m);                                                          // an eye, a golden horn, a blue one
      T(100, 44, 116, 34, 114, 50, blue.m);                                                                                                                                         // a fin on the back
    },
    // the old wizard in his robes, magic gathering at his hand
    Ulysses(K, f) {
      const { R, P, E, T, L, W } = K; const robe = K.col('#c0a0e0'), pink = K.col('#e070c0'), skin = '#f0d8c0', hair = '#d0d0e0';
      T(48, 50, 80, 50, 90, 104, robe.m); T(48, 50, 90, 104, 38, 104, robe.m); R(38, 100, 52, 4, robe.d); R(62, 54, 4, 46, pink.m);                                                  // the long robe, a bright stripe
      W(48, 56, 30, 74, 6, robe.m); W(80, 56, 100, 50, 6, robe.m); E(28, 76, 5, 4, skin); E(102, 48, 5, 4, skin);                                                                     // sleeves and hands
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + f * 0.5; P(102 + Math.cos(a) * 12, 48 + Math.sin(a) * 10, pink.l); } E(102, 48, 3, 3, '#ffffff');                 // magic at the raised hand
      E(64, 38, 11, 10, skin); R(54, 28, 20, 6, hair); R(52, 32, 5, 14, hair); R(58, 44, 12, 8, hair); P(60, 38, '#404060'); P(68, 38, '#404060');                                    // the face, grey hair and beard
      R(50, 20, 28, 8, pink.m); T(52, 20, 76, 20, 60, 2, pink.m); R(74, 22, 6, 6, pink.l);                                                                                             // a pointed hat
    },
    // the fiery demon beast, mane like flame
    Haures(K, f) {
      const { R, P, E, T, L, W } = K; const red = K.col('#e04030'), blue = K.col('#3060c0'), orange = '#f0a040';
      E(66, 70, 34, 18, blue.m); E(60, 64, 22, 8, blue.l); E(66, 80, 30, 6, blue.d);                                                                                                 // the body
      W(42, 80, 28, 102, 8, blue.m); W(56, 84, 52, 104, 8, blue.m); W(84, 82, 96, 102, 8, blue.m); W(96, 76, 112, 98, 8, blue.m); for (const [x, y] of [[28, 102], [52, 104], [96, 102], [112, 98]]) { for (let i = 0; i < 3; i++) L(x - 4 + i * 4, y, x - 5 + i * 4, y + 4, '#f0f0f0'); }   // legs and claws
      for (let i = 0; i < 9; i++) { const a = -0.3 + i * 0.35; const r = 26 + (i % 2) * 8 + f * 2; T(34 + Math.cos(a) * 12, 48 + Math.sin(a) * 12, 34 + Math.cos(a + 0.3) * 12, 48 + Math.sin(a + 0.3) * 12, 34 + Math.cos(a + 0.15) * r, 48 + Math.sin(a + 0.15) * r, red.m); }   // the flaming mane
      E(34, 48, 16, 14, red.m); E(30, 44, 10, 7, orange); T(22, 52, 6, 56, 22, 60, red.m); R(8, 54, 14, 2, '#301010'); for (let i = 0; i < 4; i++) P(10 + i * 3, 56, '#ffffff'); P(28, 46, '#f0f040'); P(29, 46, '#f0f040');   // the head, jaws and teeth, an eye
      W(100, 66, 122, 46, 5, red.m); T(118, 50, 128, 32, 126, 52, orange);                                                                                                            // a burning tail
    },
    // the golden dragon of the eclipse, wings filling the sky
    Eclipse(K, f) {
      const { R, P, E, T, L, W } = K; const gold = K.col('#d8a030'), dark = K.col('#a06820');
      T(64, 50, 2, 6 - f * 3, 20, 62, dark.m); T(64, 50, 20, 62, 44, 60, dark.m); T(72, 50, 126, 6 - f * 3, 112, 62, dark.m); T(72, 50, 112, 62, 90, 60, dark.m); L(64, 50, 3, 7 - f * 3, gold.m); L(72, 50, 125, 7 - f * 3, gold.m); L(64, 50, 20, 62, gold.m); L(72, 50, 112, 62, gold.m);   // the wings
      E(68, 74, 30, 16, gold.m); E(62, 68, 18, 7, gold.l); E(68, 82, 24, 6, dark.m);                                                                                                 // the body
      W(50, 84, 40, 102, 6, gold.m); W(84, 84, 96, 102, 6, gold.m); for (const x of [36, 40, 44, 92, 96, 100]) L(x, 102, x, 106, '#202020');                                          // legs and black claws
      W(94, 76, 122, 90, 5, gold.m); T(118, 86, 128, 96, 116, 94, gold.d);                                                                                                            // the tail
      W(56, 66, 40, 44, 7, gold.m); E(36, 40, 12, 9, gold.m); T(26, 40, 8, 46, 26, 48, gold.m); R(10, 44, 16, 2, '#301800'); for (let i = 0; i < 4; i++) P(12 + i * 4, 46, '#ffffff'); P(34, 38, '#e03030'); P(35, 38, '#e03030');   // the neck, head, jaws, an eye
      T(40, 36, 46, 22, 48, 38, dark.m); T(32, 34, 30, 22, 38, 36, dark.m); for (let i = 0; i < 4; i++) T(44 + i * 5, 52 + i * 4, 50 + i * 5, 52 + i * 4, 48 + i * 5, 46 + i * 4, dark.m);   // horns and spines
    },
    // the serpent goddess, cream robes and golden hair
    Coatlicue(K, f) {
      const { R, P, E, T, L, W } = K; const robe = K.col('#f0e0d0'), pink = K.col('#e090a0'), hair = K.col('#e0c060'), skin = '#f0d8c0';
      T(48, 56, 80, 56, 92, 104, robe.m); T(48, 56, 92, 104, 36, 104, robe.m); R(36, 100, 56, 4, robe.d); R(60, 60, 8, 40, pink.m); for (let i = 0; i < 3; i++) E(46 + i * 18, 92, 4, 3, pink.l);   // the robe
      R(54, 40, 20, 18, robe.l); R(52, 54, 24, 4, '#e0b040'); W(52, 46, 30, 66, 6, robe.m); W(76, 46, 100, 34, 6, robe.m); E(28, 68, 5, 4, skin); E(102, 32, 5, 4, skin);            // bodice and sleeves
      E(64, 28, 11, 10, skin); R(52, 16, 24, 10, hair.m); R(46, 22, 8, 50, hair.m); R(74, 22, 8, 44, hair.m); R(44, 70, 6, 10, hair.d); T(56, 14, 72, 14, 64, 2, hair.l);           // the face and hair to her waist, a crown of gold
      P(60, 29, '#204080'); P(68, 29, '#204080'); R(62, 34, 4, 1, '#c04060');
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + f * 0.4; P(64 + Math.cos(a) * 36, 60 + Math.sin(a) * 30, '#a0e0ff'); }                                            // motes of healing light
    },
    // the great engine-golem rising from the green earth
    Daedalus(K, f) {
      const { R, P, E, T, L, W } = K; const stone = K.col('#a0a890'), dark = K.col('#606850'), green = K.col('#40c080');
      for (let i = 0; i < 8; i++) E(10 + i * 16, 100 + (i % 2) * 3, 12, 8, green.m); for (let i = 0; i < 8; i++) E(14 + i * 16, 96 + (i % 2) * 3, 6, 3, green.l);                   // the earth it climbs from
      E(66, 60, 38, 36, stone.m); E(60, 46, 24, 16, stone.l); E(66, 80, 34, 12, dark.m);                                                                                            // the domed body
      R(44, 36, 44, 30, stone.d); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) R(48 + i * 10, 40 + j * 8, 6, 5, '#e0c040');                                              // rows of windows glowing
      R(30, 56, 18, 30, stone.m); R(30, 56, 18, 4, stone.l); R(84, 56, 18, 30, stone.m); R(84, 56, 18, 4, stone.l); R(28, 84, 22, 10, dark.m); R(82, 84, 22, 10, dark.m);            // shoulders and arms
      R(56, 24, 20, 14, stone.m); R(58, 28, 16, 6, '#101820'); P(60, 30, '#40ff80'); P(71, 30, '#40ff80'); R(62, 16, 8, 8, dark.m);                                                   // the head and a glowing visor
    },
    // the long sea serpent racing through the sky
    Azul(K, f) {
      const { R, P, E, T, L, W } = K; const blue = K.col('#60a0e0'), pale = K.col('#e0f0ff'), gold = '#e0c040';
      const pts = []; for (let i = 0; i <= 12; i++) pts.push([120 - i * 9, 60 + Math.sin(i * 0.8 + f * 0.6) * 18]);
      for (let i = 0; i < 12; i++) { W(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 12 - i * 0.5, blue.m); }
      for (let i = 0; i < 12; i++) { W(pts[i][0], pts[i][1] + 3, pts[i + 1][0], pts[i + 1][1] + 3, 4, pale.m); }                                                                     // the pale belly
      for (let i = 1; i < 12; i += 2) T(pts[i][0], pts[i][1] - 6, pts[i][0] + 6, pts[i][1] - 6, pts[i][0] + 3, pts[i][1] - 16, pale.m);                                            // fins along the back
      E(pts[12][0], pts[12][1], 12, 9, blue.m); E(pts[12][0] - 2, pts[12][1] - 3, 7, 4, blue.l); T(pts[12][0] - 10, pts[12][1], pts[12][0] - 24, pts[12][1] + 4, pts[12][0] - 10, pts[12][1] + 8, blue.m);   // the head and snout
      P(pts[12][0] - 4, pts[12][1] - 2, '#ff4040'); P(pts[12][0] - 3, pts[12][1] - 2, '#ff4040'); T(pts[12][0] + 4, pts[12][1] - 8, pts[12][0] + 10, pts[12][1] - 20, pts[12][0] + 10, pts[12][1] - 6, gold); L(pts[12][0] - 22, pts[12][1] + 5, pts[12][0] - 30, pts[12][1] + 2, gold);   // eye, horn, whiskers
      T(pts[0][0], pts[0][1] - 8, pts[0][0] + 8, pts[0][1] - 18, pts[0][0] + 8, pts[0][1] + 10, blue.m);                                                                                // the tail fin
    },
    // the dark angel with the colossal sword
    Catastrophe(K, f) {
      const { R, P, E, T, L, W } = K; const black = K.col('#302838'), purple = K.col('#6040a0'), steel = K.col('#d0d0e0'), red = '#e03030';
      T(64, 36, 4, 4 - f * 2, 12, 60, black.m); T(64, 36, 12, 60, 48, 56, black.m); T(72, 36, 124, 4 - f * 2, 116, 60, black.m); T(72, 36, 116, 60, 84, 56, black.m); for (let i = 0; i < 6; i++) { L(8 + i * 8, 6 + i * 9, 4 + i * 8, 14 + i * 9, purple.m); L(120 - i * 8, 6 + i * 9, 124 - i * 8, 14 + i * 9, purple.m); }   // the ragged wings
      R(58, 30, 16, 12, steel.m); R(60, 34, 12, 4, '#101020'); P(62, 35, red); P(69, 35, red); T(58, 30, 74, 30, 66, 18, purple.m);                                                  // a helm with burning eyes
      R(54, 42, 24, 30, black.m); R(54, 42, 24, 3, purple.m); R(58, 50, 16, 10, purple.d); R(52, 70, 28, 4, '#e0b040'); T(54, 74, 78, 74, 66, 104, black.m);                          // the armour and a trailing robe
      E(50, 46, 9, 6, steel.m); E(82, 46, 9, 6, steel.m); W(48, 52, 34, 66, 6, black.m); W(84, 52, 96, 62, 6, black.m);                                                             // pauldrons and arms
      R(30, 10, 10, 90, steel.m); R(33, 10, 4, 90, '#f0f0f8'); T(30, 10, 40, 10, 35, 0, steel.m); R(24, 62, 22, 5, '#e0b040'); R(31, 66, 8, 8, '#402040');                            // the colossal sword, point up
    },
    // the ferryman of the dead in his shroud of dark fire
    Charon(K, f) {
      const { R, P, E, T, L, W } = K; const red = K.col('#c03040'), purple = K.col('#7030a0'), bone = '#e0d8c8';
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + f * 0.4; const r = 34 + (i % 3) * 8; T(64 + Math.cos(a - 0.25) * 24, 60 + Math.sin(a - 0.25) * 22, 64 + Math.cos(a + 0.25) * 24, 60 + Math.sin(a + 0.25) * 22, 64 + Math.cos(a) * r, 60 + Math.sin(a) * r * 0.9, purple.m); }   // the dark flames around him
      T(46, 44, 82, 44, 92, 100, red.m); T(46, 44, 92, 100, 36, 100, red.m); for (let i = 0; i < 7; i++) P(38 + i * 8, 100, red.d); R(56, 50, 16, 40, red.d);                        // the robe
      W(46, 52, 24, 70, 6, red.m); W(82, 52, 100, 40, 6, red.m); E(22, 72, 5, 4, bone); E(102, 38, 5, 4, bone); L(102, 38, 112, 8, '#8a5a2a'); L(103, 38, 113, 8, '#5a3a1a'); T(108, 12, 122, 6, 116, 20, bone);   // sleeves, bony hands, the pole-scythe
      T(46, 44, 82, 44, 64, 14, red.m); E(64, 34, 10, 9, bone); R(56, 38, 16, 5, bone); R(58, 32, 4, 3, '#000000'); R(66, 32, 4, 3, '#000000'); P(59, 33, '#40ff40'); P(67, 33, '#40ff40'); for (let i = 0; i < 5; i++) P(58 + i * 3, 43, '#000000');   // the hood, the skull within
    },
    // the rainbow goddess, pink hair and a robe of many colours
    Iris(K, f) {
      const { R, P, E, T, L, W } = K; const skin = '#f0d8c0', hair = K.col('#e070a0'), white = K.col('#f8f0f8');
      const bands = ['#e04040', '#f0a040', '#f0e040', '#40c060', '#4080e0', '#8040c0'];
      T(46, 52, 82, 52, 94, 104, white.m); T(46, 52, 94, 104, 34, 104, white.m); for (let i = 0; i < 6; i++) L(40 + i * 8, 104, 54 + i * 4, 62, bands[i]);                             // the robe striped in the rainbow
      R(54, 40, 20, 14, white.m); R(52, 52, 24, 4, '#e0b040'); W(52, 46, 30, 30, 5, white.m); W(76, 46, 100, 30, 5, white.m); E(28, 28, 5, 4, skin); E(102, 28, 5, 4, skin);           // bodice and raised arms
      for (let i = 0; i < 6; i++) { const r = 58 - i * 3; for (let k = 0; k < 16; k++) { const a0 = Math.PI + k / 16 * Math.PI, a1 = Math.PI + (k + 1) / 16 * Math.PI; W(64 + Math.cos(a0) * r, 46 + Math.sin(a0) * r * 0.7, 64 + Math.cos(a1) * r, 46 + Math.sin(a1) * r * 0.7, 3, bands[i]); } }   // the rainbow arching over her
      E(64, 30, 11, 10, skin); R(52, 18, 24, 10, hair.m); R(50, 24, 6, 30, hair.m); R(72, 24, 6, 26, hair.m); T(56, 16, 72, 16, 64, 6, '#e0b040'); E(64, 8, 3, 3, '#ffffff');        // the face, pink hair, a golden diadem
      P(60, 31, '#402040'); P(68, 31, '#402040'); R(62, 36, 4, 1, '#c04060');
    },
  },
};
