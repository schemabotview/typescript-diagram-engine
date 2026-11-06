# CLAUDE.md — typescript-diagram-engine

> Shared rules (pipeline, invariants, frames, how a section teaches, coupled values): the workspace
> `../CLAUDE.md`. What is taught: `COURSE-PLAN.md`. This file holds only what differs.

**Concept:** "Learn TypeScript by building a diagram engine" — the app is `miniflow`.
Published at `graphl.in/typescript-diagram-engine`. Pins: graphl-flow 0.11.0, shell 1.1.0.

## Status

| course | spine | scenes + narration | checked + looked at | audio | recorded |
|---|---|---|---|---|---|
| 2 `start` (pilot, 8 sections) | ✓ 8 steps | ✓ | ✓ 2026-11-06 | — | — |
| 1, 3–12 | — | — | — | — | — |

Pilot Course 2 is awaiting owner review (workspace checklist, step 4).

## Repo-only commands

```sh
scripts/install-node.sh                    # the spine's Node 26.13.0 → .toolchain/ (gitignored)
npm run spine -- record start              # record a course (or start/04-tsc: a step and its parents)
npm run spine -- replay start              # run again and compare, volatile spans masked
npm run check:spine                        # recorded, current, untouched — no run, no network
PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run check   # in a cloud container
```

`npm run shots -- <course>` is the shell's `graphl-shots-4k` (out: `scripts/out/shots-4k/`; with
`--only` the files are numbered from 01). It leaves its vite child running: `pkill -f
node_modules/.bin/vite` after, or the next run's shots come from the stale server.

## The spine (differences from the reference)

- `scripts/spine.py`: one step = `step.json` + `edits/` (exactly `changes`) → `project/` +
  `session.txt` (+ `shots/`). `record` writes a fingerprint of inputs and outputs into step.json;
  `check` recomputes both, so a stale step and a hand-edited output both fail.
- Steps run in a REAL `/home/ana/miniflow` (`SPINE_HOME` overrides the home), so absolute paths in
  output are the facts' paths. The prompt `ana@laptop:~/miniflow$` is drawn by spine.py.
- 72 columns (the IDE terminal's width): a longer row is cut into rows, as the terminal wraps it.
- `setup` commands run hidden before `commands` (a lab installing its tools). `exit` names a
  command's expected non-zero exit; anything else non-zero aborts the record.
- `capture` → `scripts/shoot-svg.cjs`: headless Chromium (the preinstalled Playwright) shoots each
  SVG at EXACTLY `scripts/frame.json`'s figure size (1997×1245, the output panel's body at 4K, which
  check-render measures), zoomed to fit at most 4×, and fails if miniflow's smallest text lands
  under 24 px.
- Labs are steps with `"lab": true`, a branch off the step they explain (03-emit off 02-main).

## Frames

- `src/scenes/ide.ts` is frame v2 ported from graphl-flow's `dev/fixtures/studies/ide-frame.ts`
  (the reference repo was not reachable when this was built). It THROWS when a transcript has more
  rows than the variant's terminal shows: `code` 8, `run` 17 (with the explorer).
- `src/scenes/opener.ts` is the opener frame (Decision 9): every course from 2 starts with a
  `recap` section, focus on its own course id. check-content fails a course without one.
- `src/spine.ts` is the only way a scene reads the spine: `file`, `session`, `shot`, `tree`,
  `lineOf`/`linesOf`, and `grab` for a value quoted in a side pane (never typed).

## Gotchas found authoring Course 2

- TS 7 `tsc` exits **1** on a type error (TS 5 exited 2).
- npm 11's `npm init -y` writes `"type": "commonjs"`; `--init-type=module` gives module. It prints
  the whole file even with `--silent`, so 2.1 sends it to `/dev/null` (the editor shows it).
- Node 26's unsupported-syntax error is 24 rows; `--stack-trace-limit=0` drops only its internal
  frames (Decision 10).
- A flow of unlabelled edges in a non-spread group fails check-render's `short` edge: put it
  straight in the (spread) side pane, label it, or `spread` its group.
- No TypeScript / Node / npm brand icons in graphl-flow yet; generic keys stand in (`code`, `cpu`,
  `package`). Adding `typescript`, `nodedotjs`, `npm` is an engine minor.

## Not built yet

The Colab notebook (`scripts/colab_generate_audio.ipynb`, ported with `REPO` changed), the `film`
and `thumb:film` scripts — all from the reference repo, which this session could not reach.
