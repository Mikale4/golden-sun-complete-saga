// ---------- The three endings (the user's rule): a credits roll and an end scene each, and each leading on ----------
//   1. Golden Sun, after the Fusion Dragon: the roll, then the Lemurian ship at sea, Isaac's party at the rail, and The
//      Lost Age's title.
//   2. The Lost Age, after the Doom Dragon: the roll (js/game/story_mars.js), then Alex on Mt. Aleph and the hill above
//      Vale, then the Wise One's warning that opens the post-game (js/game/story_post.js).
//   3. The Complete Saga, after Alkahest: the gold at the heart of the Cradle splits and a way opens into somewhere else
//      entirely - and from the far side, faces of other worlds' heroes look back: a swordsman whose blade is longer than
//      he is tall, a hunter with a whip and a cross, a small blue thing that smiles, a mage who is a hat and two yellow
//      eyes, a knight with horns and a lance. Then the roll, and TO BE CONTINUED...?
'use strict';

// the credits: a scroll of names; a line beginning with '#' is a title in gold
class CreditsScene {
  constructor(onDone, lines) {
    this.onDone = onDone; this.t = 0;
    this.lines = lines || CreditsScene.TLA;
    this.h = this.lines.length * 12 + SCREEN_H;
  }
  update() { this.t++; if (this.t > this.h + 30 || (this.t > 90 && (Input.pressed('a') || Input.pressed('b')))) { Engine.pop(); if (this.onDone) this.onDone(); } }
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let i = 0; i < this.lines.length; i++) {
      const y = SCREEN_H + i * 12 - this.t * 0.5; if (y < -12 || y > SCREEN_H) continue;
      const ln = this.lines[i]; const title = ln.startsWith('#');
      Font.draw(g, title ? ln.slice(1) : ln, SCREEN_W / 2, Math.round(y), title ? '#ffe080' : ln.startsWith('-') ? '#c0a0ff' : '#f0f0f0', { align: 'center' });
    }
  }
}
CreditsScene.GS1 = ['#GOLDEN SUN', '', 'A fan remake of the Camelot / Nintendo original', 'for one player, and no one else', '', '- THE ADEPTS -', 'Isaac   Garet   Ivan   Mia', '', '- THOSE WHO WENT AHEAD -', 'Felix   Jenna   Sheba   Kraden', '', '- OF PROX -', 'Saturos   Menardi', '', '- THE WISE ONE -', '', '- OF VALE -', 'Kyle   Dora   The Great Healer', '', '- ON THE ROAD -', 'Hammet   Layana   Lord Babi   Master Hama', 'Iodem   Faran   Lady McCoy   Feizhi', 'The Kolima villagers, as trees and as people', '', '- THE DJINN -', 'Twenty-eight of them', '', '- WITH THANKS TO -', 'The guides and scripts that were the source of truth', 'The maps that were the source of every layout', '', 'The beacons of Mercury and Venus burn.', 'Two remain.', '', '', 'TO BE CONTINUED'];
CreditsScene.TLA = ['#GOLDEN SUN', '#THE LOST AGE', '', 'A fan remake of the Camelot / Nintendo originals', 'for one player, and no one else', '', '- THE ADEPTS -', 'Felix   Jenna   Sheba   Piers', 'Isaac   Garet   Ivan   Mia', '', '- THE SCHOLAR -', 'Kraden', '', '- OF PROX -', 'Puelle   Agatio   Karst', 'Saturos   Menardi', '', '- OF LEMURIA -', 'King Hydros   Lunpa   Piers', '', '- THE WISE ONE -', '', '- THE VOICES ON THE WIND -', 'Hamma   Justin   Megan', '', '- THOSE WHO WAITED -', 'Kyle   Dora', "Felix and Jenna's parents", "Garet's family", '', '- THE DJINN -', 'Seventy-two of them', '', '- WITH THANKS TO -', 'The guides and scripts that were the source of truth', 'The maps that were the source of every layout', '', 'Weyard is whole again.', '', '', 'THE END'];
CreditsScene.SAGA = ['#GOLDEN SUN', '#THE COMPLETE SAGA', '', 'Everything there is has been done.', '', '- THE ADEPTS -', 'Felix   Jenna   Sheba   Piers', 'Isaac   Garet   Ivan   Mia', '', '- THE SCHOLAR -', 'Kraden', '', '- AND THE ONE WHO CAME BACK -', 'Alex', '', '- THE WISE ONE -', 'Who kept a man in a mountain, and let him go', '', '- OF LEMURIA -', 'King Hydros, who remembered what Alchemy was', '', '- THE CRADLE -', 'Terragon   Thalassa   Ignis   Zephyros', 'Alkahest, who was shown something it did not know', '', '- THOSE WHO WERE TRAPPED THERE -', 'A girl from Vault   A Lemurian sailor', 'A scholar of Tolbi   A hunter of Prox', 'A corsair of Champa   A priest of Anemos', '', '- THE DJINN -', 'Eighty-one, nine of them made by hand', '', '- THE CLASS ITEMS -', 'Twenty-five, and the teachers who fought for them', '', '- WITH THANKS TO -', 'The guides and scripts that were the source of truth', 'The maps that were the source of every layout', 'And the one player it was all for', '', 'The door at the heart of the world is open.', 'Something on the other side is looking back.', '', '', 'TO BE CONTINUED...?'];

// the rift at the heart of the Cradle: a tear of light that widens, and the ones who look through it from the far side
class RiftScene {
  constructor(onDone) { this.onDone = onDone; this.t = 0; this.seed = 7; }
  update() { this.t++; if (this.t > 760 || (this.t > 300 && (Input.pressed('a') || Input.pressed('b')))) { Engine.pop(); if (this.onDone) this.onDone(); } }
  // a figure of another world, a dark shape against the light, with one or two points of colour - the archetypes only
  figure(g, kind, x, y, a) {
    if (a <= 0) return; g.globalAlpha = a; const S = '#141428', H = '#2a2a48';
    switch (kind) {
      case 'swordsman': { // spiked hair, a blade longer than he is tall over the shoulder
        Gfx.rect(g, x + 4, y - 34, 3, 30, H); Gfx.tri(g, x + 4, y - 36, x + 7, y - 36, x + 5.5, y - 41, H);   // the blade, broad and tall
        Gfx.rect(g, x - 5, y - 16, 10, 16, S); Gfx.rect(g, x - 7, y - 15, 3, 9, S); Gfx.rect(g, x + 4, y - 15, 3, 9, S);
        Gfx.circle(g, x, y - 20, 4, S); for (let i = 0; i < 4; i++) Gfx.tri(g, x - 5 + i * 3, y - 22, x - 2 + i * 3, y - 22, x - 3.5 + i * 3 + (i % 2 ? 2 : -2), y - 29, S);
        Gfx.rect(g, x - 2, y - 20, 1, 1, '#a0e0ff'); Gfx.rect(g, x + 1, y - 20, 1, 1, '#a0e0ff'); break; }
      case 'hunter': { // a long coat that flares, a whip coiled at the hip, a cross at the throat
        Gfx.rect(g, x - 4, y - 18, 8, 18, S); Gfx.tri(g, x - 4, y - 8, x - 8, y, x - 4, y, S); Gfx.tri(g, x + 4, y - 8, x + 8, y, x + 4, y, S);
        Gfx.circle(g, x, y - 22, 4, S); Gfx.rect(g, x - 5, y - 26, 10, 3, S);
        Gfx.circle(g, x + 7, y - 9, 3, H); Gfx.rect(g, x + 9, y - 9, 6, 1, H);
        Gfx.rect(g, x, y - 17, 1, 3, '#ffe080'); Gfx.rect(g, x - 1, y - 16, 3, 1, '#ffe080'); break; }
      case 'slime': { // small, blue, and smiling
        Gfx.circle(g, x, y - 7, 7, '#3070e0'); Gfx.tri(g, x - 3, y - 12, x + 3, y - 12, x, y - 19, '#3070e0');
        Gfx.circle(g, x - 3, y - 8, 1.5, '#ffffff'); Gfx.circle(g, x + 3, y - 8, 1.5, '#ffffff'); Gfx.rect(g, x - 3, y - 8, 1, 1, '#101020'); Gfx.rect(g, x + 3, y - 8, 1, 1, '#101020');
        Gfx.rect(g, x - 2, y - 4, 5, 1, '#101040'); break; }
      case 'mage': { // a wide pointed hat, a short robe, and a face that is only two yellow eyes
        Gfx.rect(g, x - 5, y - 14, 10, 14, '#20205a'); Gfx.rect(g, x - 9, y - 16, 18, 3, S); Gfx.tri(g, x - 6, y - 16, x + 6, y - 16, x + 2, y - 30, S);
        Gfx.rect(g, x - 4, y - 15, 8, 1, '#0a0a18'); Gfx.rect(g, x - 3, y - 19, 1, 1, '#ffe040'); Gfx.rect(g, x + 2, y - 19, 1, 1, '#ffe040'); break; }
      case 'dragoon': { // horns on the helm, a lance taller than the rider
        Gfx.rect(g, x + 6, y - 40, 2, 40, H); Gfx.tri(g, x + 5, y - 40, x + 9, y - 40, x + 7, y - 46, H);
        Gfx.rect(g, x - 5, y - 17, 10, 17, S); Gfx.circle(g, x, y - 21, 4, S);
        Gfx.tri(g, x - 4, y - 23, x - 2, y - 23, x - 6, y - 31, S); Gfx.tri(g, x + 2, y - 23, x + 4, y - 23, x + 6, y - 31, S);
        Gfx.rect(g, x - 2, y - 21, 4, 1, '#ff6060'); break; }
    }
    g.globalAlpha = 1;
  }
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const t = this.t; const open = Math.min(1, Math.max(0, (t - 60) / 200));   // the tear widens over three seconds
    const halfW = 1 + open * 96; const cx = 120;
    // the far side: a light that is not any colour of this world, brightest at the seam
    for (let y = 12; y < 148; y++) {
      const jag = Math.sin(y * 0.37 + this.seed) * 6 + Math.sin(y * 1.9 + t * 0.03) * 2; const w = Math.max(0, halfW * (1 - Math.pow(Math.abs(y - 80) / 68, 2)) + jag * open);
      if (w <= 0) continue; const k = Math.min(1, w / 40);
      Gfx.rect(g, Math.round(cx - w), y, Math.round(w * 2), 1, 'rgb(' + Math.round(120 + 100 * k) + ',' + Math.round(90 + 120 * k) + ',' + Math.round(200 + 55 * k) + ')');
    }
    if (open > 0) { g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.08)); Gfx.rect(g, cx - 1, 12, 2, 136, '#ffffff'); g.globalAlpha = 1; }
    // the ones looking through, one by one
    const figs = [['slime', 120, 118, 260], ['swordsman', 74, 124, 320], ['hunter', 166, 124, 380], ['mage', 44, 120, 440], ['dragoon', 196, 122, 500]];
    for (const [kind, x, y, at] of figs) this.figure(g, kind, x, y, Math.min(1, Math.max(0, (t - at) / 50)));
    if (t > 560) Font.draw(g, '...', 120, 150, '#ffffff', { align: 'center', outline: '#000000' });
  }
}

(function () {
  // ---- 1. Golden Sun: the roll, and the ship ----
  STORY.gs1Ending = function* (E) {
    Audio.play('ending');
    let done = false; Engine.push(new CreditsScene(() => { done = true; }, CreditsScene.GS1)); yield () => done;
    E.warpNow('ship_deck', 10, 6, DIR.UP); E.setFollowers(true); Audio.play('tolbiship'); yield Engine.fadeIn(40);
    yield E.say("(The Lemurian ship, a day out from Lalivero. The coast of Gondowan is a line behind them; ahead there is only sea.)");
    yield E.say("Babi said this ship could cross the Karagol in an afternoon. It's already been a day, and I can't see anything.", 'Garet');
    yield E.say("It isn't the Karagol we're crossing. Iodem said the eastern sea has no far shore that anyone has come back from.", 'Ivan');
    yield E.say("Felix went into that sea with Sheba. If there's a shore, they're on it.", 'Isaac');
    yield E.say("And Jenna, and Kraden. Isaac... whatever Felix is doing, he thinks he's right. I saw his face on the lighthouse.", 'Mia');
    yield E.say("Then we find him and we ask him. And if the answer's no good, we stop him. Either way it ends with all of us in the same place.", 'Isaac');
    yield E.say("(Far to the east, on a broken shard of Idejima drifting on the tide, three others are waking up.)");
    yield Engine.fadeOut(50); E.setFollowers(false);
  };
  // ---- 3. The Complete Saga: the rift, and the roll ----
  STORY_TLA.cradleRift = function* (E) {
    Audio.stop();
    yield E.say("(The gold at the centre of the Heart does not go out. It goes thin. And then, along a line no one drew, it splits.)");
    Audio.sfx('boom'); Engine.doShake(30); Engine.doFlash(30, '#ffffff'); yield 30;
    let done = false; Engine.push(new RiftScene(() => { done = true; })); yield () => done;
    yield Engine.fadeIn(20);
    yield E.say("...That was not a door out of the Cradle.", 'Kraden');
    yield E.say("There were people. On the other side. Looking back at us.", 'Mia');
    yield E.say("Not people of this world. A man with a sword longer than he is tall. A hunter with a whip, and a cross at his throat. A knight with horns on his helm. A mage who was nothing but a hat and two yellow eyes.", 'Alex');
    yield E.say("And something small and blue that was, I am nearly certain, smiling at me.", 'Alex');
    yield E.say("I couldn't read a single one of them. Their minds are the wrong shape for it.", 'Ivan');
    yield E.say("Then there are other worlds than Weyard. And whatever they are, they know about ours now.", 'Isaac');
    yield E.say("Alchemy was the beginning of everything. I suppose I should have expected everything to be on the other side of it.", 'Kraden');
    yield E.say("It isn't closing. But nothing is coming through it either. Not today.", 'Felix');
    yield E.say("Then today we go home. Tomorrow is another story - and I have a feeling it is not only ours.", 'Alex');
    yield E.say("(The tear at the heart of the world stays open. Somewhere past it, other stories are going on - and one of them has just noticed this one.)");
    G.set('saga_complete');
    yield Engine.fadeOut(40);
    let done2 = false; Audio.play('credits'); Engine.push(new CreditsScene(() => { done2 = true; }, CreditsScene.SAGA)); yield () => done2;
    E.warpNow('cradle_shore', 10, 9, DIR.DOWN); E.setFollowers(true); yield Engine.fadeIn(40);
    yield E.say("(The Cradle's shore. The swirl of the portal turns as it always did. The way home is the way you came.)");
  };
})();
