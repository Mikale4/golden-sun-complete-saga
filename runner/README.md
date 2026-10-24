# Playthrough runner

`runner.js` is an autonomous player for the game: it starts a new game and plays it to the ending through the game's
own input path (pathfinding + key holds + frame stepping), fights every battle with a small tactician AI, buys gear,
rests at inns, solves the field puzzles, takes a screenshot of every area, and stops on the first thing that looks
wrong so it can be fixed and the run resumed from the last checkpoint.

* `runner.js` — the runner (ops, pathfinding, sailing, battle AI, checkpoints, screenshots, watchdog)
* `plan_gs1.js` — the Golden Sun half of the playthrough (title screen → Venus Lighthouse → Idejima)
* `plan_tla.js` — the Lost Age half (Idejima → Mars Lighthouse → ending)
* `shots/` — screenshots the runner saved (`NNN_label.png`, 3× upscaled)
* `report.json` — issue list + log after `R.report()`

## Running it

The quickest way is the title screen's **Demo** entry: it fetches the runner and the plans into the game tab and plays
a new game in real time until any key is pressed (`js/game/demo.js`). While it plays, the keyboard and the pad are
shut out (M still mutes, F still goes fullscreen), nothing is saved, the settings are put back afterwards, and its
checkpoints live in memory only - it needs no dev server. The rest of this section is the console way, for testing.

1. Start the dev server: `python serve.py` (it also accepts the `/shot` and `/log` uploads the runner uses).
2. Open <http://localhost:8765> in a browser and, in the DevTools console:

```js
for (const f of ['runner/runner.js', 'runner/plan_gs1.js', 'runner/plan_tla.js']) eval(await (await fetch('/' + f)).text());
R.plan = PLAN_GS1.concat(PLAN_TLA);
R.run(30000);            // plays for ~30 s of CPU time, returns a status object; call again to continue
```

`R.run()` returns `{pc, of, status, issues, log}`. It stops early when a step fails (`issues` explains why); fix
the cause, then `R.restore('<checkpoint label>')` and `R.run()` again. Checkpoints are saved to localStorage at
every `['ckpt', label]` step of the plan; `R.checkpoint('mine')` saves one by hand.

Useful knobs: `R.opts.shots = false` (no screenshots), `R.report()` (writes `runner/report.json`).

## Plan ops

`['talk', npcId]`, `['enter', mapId]` (walk through the exit that leads there), `['world', mapId]` (walk or sail to a
place on the world map), `['trig', 'STORY.name']`, `['use', x, y]`, `['lever', id]`, `['push', pillarId, dir, n]`,
`['cast', psy, x, y, facing]`, `['djinni', name]`, `['chest', x, y]`, `['shop']`, `['inn']`, `['heal']` (walk back to
the nearest inn), `['level', n]` (grind until the average level reaches n, stopping early if exp income stalls),
`['expect', flag]`, `['expectMap', id]`, `['expectParty', [...]]`, `['try', step]` (optional step), `['shot', label]`,
`['ckpt', label]`.
