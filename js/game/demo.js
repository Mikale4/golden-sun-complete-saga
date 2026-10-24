// ---------- Demo: the title screen's attract mode ----------
// The playthrough runner (runner/runner.js and its plans) plays the game from the first night in Vale for as long as
// you care to watch: it walks, talks, fights, shops, rests and solves the puzzles through the game's own input path,
// so what you see is the game as a player would play it. Any key ends it and returns to the title. While it plays the
// keyboard and the pad are shut out, nothing is saved (the player's files and settings are left as they were), and
// the runner's checkpoints live in memory only.
'use strict';
const Demo = {
  running: false, loading: false, loaded: false, error: null, t: 0, msg: '', doneAt: 0, saved: null, prevAfterDraw: null,
  FILES: ['runner/runner.js', 'runner/plan_gs1.js', 'runner/plan_tla.js'],
  // the runner is not part of the game's load: fetched the first time the demo is asked for
  load(cb) {
    if (this.loaded || (typeof window.R !== 'undefined' && window.PLAN_GS1 && window.PLAN_TLA)) { this.loaded = true; cb(true); return; }
    if (this.loading) return; this.loading = true; this.error = null;
    const v = location.protocol === 'file:' ? '' : '?v=' + Date.now(); let i = 0;
    const next = () => {
      if (i >= this.FILES.length) { this.loading = false; this.loaded = true; cb(true); return; }
      const f = this.FILES[i++]; const s = document.createElement('script'); s.src = f + v; s.async = false;
      s.onload = next; s.onerror = () => { this.loading = false; this.error = 'The demo could not load (' + f + ')'; cb(false); };
      document.body.appendChild(s);
    };
    next();
  },
  start() { if (this.running || this.loading) return; this.load(ok => { if (ok) this.begin(); }); },
  begin() {
    if (this.running) return; this.running = true; this.t = 0; this.doneAt = 0; this.msg = '';
    // the player's settings are set aside: the text at Fast (the demo is watched), no autosave
    this.saved = { textSpeed: Settings.data.textSpeed, autosave: Settings.data.autosave };
    Settings.data.textSpeed = 2; Settings.data.autosave = false;
    R.plan = PLAN_GS1.concat(PLAN_TLA); R.pc = 0; R.log = []; R.issues = []; R.stopped = false; R._retries = 0; R._retrying = false; R.lastCkpt = null; R.ckpts = {}; R.battles = 0;
    Object.assign(R.opts, { shots: false, ckptPrefix: 'demo_', ckptMemOnly: true, noUpload: true, readDelay: 36, idleFrames: 24000, continueOnFail: true });
    Input.blocked = true; Input.holdT = {}; Input.clear();
    this.prevAfterDraw = Engine.afterDraw || null; Engine.afterDraw = (g) => { if (this.prevAfterDraw) this.prevAfterDraw(g); this.draw(g); };
    R.runRealtime({ keepSettings: true });
  },
  stop() {
    if (!this.running) return; this.running = false;
    R.stopRealtime(); R.aiPaused = true; G.debugAuto = false;   /* the player's battles are the player's again */
    Input.blocked = false; Input.holdT = {}; Input.clear();
    Engine.afterDraw = this.prevAfterDraw; this.prevAfterDraw = null;
    if (this.saved) { Settings.data.textSpeed = this.saved.textSpeed; Settings.data.autosave = this.saved.autosave; this.saved = null; }
    Engine.scenes.length = 0; Engine.push(new TitleScene()); Engine.fade = 1; Engine.fadeIn(20);
  },
  // the run's state, watched once a frame: a finished (or stuck) run shows its last word for ten seconds, then the title
  tick() {
    if (Object.keys(Input.gpk).some(k => Input.gpk[k])) { this.stop(); return; }   /* the pad ends it too */
    const rt = R.rt; if (!rt || !rt.done) return;
    if (!this.doneAt) {
      this.doneAt = this.t; const last = R.issues[R.issues.length - 1];
      this.msg = rt.error ? 'The demo hit a snag: ' + rt.error.split(' | ')[0] : (rt.result && rt.result.done) ? 'The demo played the whole saga.' : 'The demo stopped: ' + (last ? last.msg : 'no more steps');
    }
    if (this.t - this.doneAt > 600) this.stop();
  },
  lastLog() { for (let i = R.log.length - 1; i >= 0 && i > R.log.length - 6; i--) { const l = R.log[i].replace(/^\[\d+\] /, ''); if (!/^(checkpoint|restored|NOTE)/.test(l)) return l; } return ''; },
  fit(s, w) { if (Font.width(s) <= w) return s; while (s.length && Font.width(s + '..') > w) s = s.slice(0, -1); return s + '..'; },
  // a band along the top: what the runner is up to, and DEMO (the way out, for the first while)
  draw(g) {
    this.t++; this.tick(); if (!this.running) return;
    const hint = this.t < 600 && (this.t % 120) < 60 ? 'any key: stop' : 'DEMO';
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, SCREEN_W, 10);
    const line = this.msg || this.lastLog(); const rw = Font.width(hint) + 8;
    if (line) Font.draw(g, this.fit(line, SCREEN_W - rw - 6), 3, 1, this.msg ? '#ffe060' : '#d0d8f0', { shadow: null });
    if ((this.t % 60) < 48 || this.msg) Font.draw(g, hint, SCREEN_W - 3, 1, '#ffe060', { align: 'right', shadow: null });
  }
};
// any game key ends the demo; F (fullscreen) and M (mute) are still the player's
window.addEventListener('keydown', (e) => { if (!Demo.running) return; const k = Input.keyOf(e); if (k && k !== 'mute' && k !== 'fs') Demo.stop(); });
