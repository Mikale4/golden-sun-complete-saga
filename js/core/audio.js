// ---------- Audio: the real soundtrack and effects (Web Audio + HTML audio) ----------
// Music streams from audio/bgm through an <audio> element, looping, with a short crossfade between tracks. Effects
// are decoded once into buffers and played through the mixer so the sound setting applies to them. Which file plays
// for which name lives in js/data/audio_map.js. Nothing is synthesized any more.
'use strict';
const Audio = {
  ctx: null, master: null, musicGain: null, sfxGain: null, muted: false, enabled: false,
  playing: null, pending: null, el: null, fading: null, buffers: {}, loading: {},
  musicVol: 0.5, sfxVol: 0.7,
  init() {
    const start = () => {
      if (this.ctx) return;
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      this.master = this.ctx.createGain(); this.master.gain.value = 1; this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 1; this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.sfxVol; this.sfxGain.connect(this.master);
      this.enabled = true;
      if (this.pending) { const p = this.pending; this.pending = null; this.play(p); }
    };
    window.addEventListener('keydown', start, { once: false }); window.addEventListener('pointerdown', start, { once: false });
    const applySettings = () => { if (typeof Settings !== 'undefined') Settings.apply(); };
    window.addEventListener('keydown', applySettings, { once: true }); window.addEventListener('pointerdown', applySettings, { once: true });
  },
  // ---- volume ----
  setVolumes(music, sfx) {
    this.musicVol = clamp(music, 0, 1); this.sfxVol = clamp(sfx, 0, 1);
    if (this.el) this.el.volume = this.muted ? 0 : this.musicVol;
    if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : this.sfxVol;
  },
  toggleMute() { this.muted = !this.muted; this.setVolumes(this.musicVol, this.sfxVol); },
  // ---- music ----
  // the file for a name: a plain path, or one per half of the saga
  fileFor(name) {
    if (typeof SONG_FILES === 'undefined') return null;
    const f = SONG_FILES[name]; if (!f) return null;
    if (typeof f === 'string') return BGM_DIR + f;
    return BGM_DIR + (G.game === 2 ? f.tla : f.gs1);
  },
  play(name) {
    if (!name) return;
    if (!this.enabled) { this.pending = name; return; }
    if (this.playing === name && this.el && !this.el.paused) return;
    const file = this.fileFor(name);
    if (!file) { this.stop(); return; }
    this.fadeOutCurrent();
    const el = document.createElement('audio');
    el.src = encodeURI(file); el.loop = true; el.preload = 'auto'; el.volume = this.muted ? 0 : this.musicVol;
    el.play().catch(() => { });
    this.el = el; this.playing = name; this.file = file;
  },
  // the outgoing track dips over a third of a second rather than cutting dead
  fadeOutCurrent() {
    const old = this.el; if (!old) return;
    this.el = null;
    const v0 = old.volume; let t = 0;
    const tick = setInterval(() => { t++; old.volume = Math.max(0, v0 * (1 - t / 20)); if (t >= 20) { clearInterval(tick); try { old.pause(); old.src = ''; } catch (e) { } } }, 16);
  },
  stop() { this.fadeOutCurrent(); this.playing = null; },
  pause() { if (this.el) this.el.pause(); },
  resume() { if (this.el && this.el.paused) this.el.play().catch(() => { }); },
  // ---- effects ----
  sfxFile(name) {
    if (typeof SFX_FILES === 'undefined') return null;
    let f = SFX_FILES[name]; if (!f) return null;
    if (Array.isArray(f)) f = f[Math.floor(Math.random() * f.length)];
    return SFX_DIR + f;
  },
  // fetch and decode once, then reuse; the first play of a sound may arrive a beat late while it loads
  load(file) {
    if (this.buffers[file]) return Promise.resolve(this.buffers[file]);
    if (this.loading[file]) return this.loading[file];
    const p = fetch(encodeURI(file)).then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b)).then(buf => { this.buffers[file] = buf; delete this.loading[file]; return buf; }).catch(() => { delete this.loading[file]; return null; });
    this.loading[file] = p; return p;
  },
  sfx(name) {
    if (!this.enabled || this.muted) return;
    const file = this.sfxFile(name); if (!file) return;
    this.load(file).then(buf => {
      if (!buf) return;
      const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.sfxGain); s.start();
    });
  },
  // warm the cache so the first menu blip is not late
  preloadSfx() { if (!this.enabled || typeof SFX_FILES === 'undefined') return; for (const k of Object.keys(SFX_FILES)) { const f = SFX_FILES[k]; for (const one of (Array.isArray(f) ? f : [f])) this.load(SFX_DIR + one); } }
};
