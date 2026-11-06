# CLAUDE.md — typescript-diagram-engine

> Shared rules (pipeline, invariants, frames, how a section teaches, coupled values): the workspace
> `../CLAUDE.md`. What is taught: `COURSE-PLAN.md`. This file holds only what differs.

**Concept:** "Learn TypeScript by building a diagram engine" — the app is `miniflow`.
Published at `graphl.in/typescript-diagram-engine`. Pins: graphl-flow 0.11.0, shell 1.1.0.

## Status

| course | sections | spine | scenes + narration | checked + looked at | audio | recorded |
|---|---|---|---|---|---|---|
| 1 `intro` | 2 | ✓ 2 lab steps | ✓ | ✓ 2026-11-06 | — | — |
| 2 `start` | 7 | ✓ | ✓ | ✓ (pilot, approved) | — | — |
| 3 `model` … 12 `ship` | 78 | ✓ | ✓ | ✓ 2026-11-06 | — | — |

All 87 sections authored; 94 spine steps current. Awaiting owner review of courses 3–12 and 1;
then stages 6–10 (audio, record, film, publish kit).

## Repo-only commands

```sh
scripts/install-node.sh                    # the spine's Node 26.13.0 → .toolchain/ (gitignored)
npm run spine -- record start              # record a course (or start/04-tsc: a step and its parents)
npm run spine -- replay start              # run again and compare, volatile spans masked
npm run check:spine                        # recorded, current, untouched — no run, no network
PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run check   # in a cloud container
```

`npm run shots -- <course> [--only id,id]` is `scripts/shots.mjs` (out: `scripts/out/shots-4k/<course>/`),
not the shell's `graphl-shots-4k`: that bin reads `window.__scene.plan()` from the catalog, which lists
only the FIRST course, so it shot nothing for any other (worth fixing in ui-shell). `scripts/sheet.sh
<course>` tiles a course's shots 2×2 to look at quickly. `npm run check:render -- <course>` checks one.

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
- `page`: a step's live page — spine.py starts `serve` hidden after the commands and shoots `url`
  with `scripts/shoot-url.cjs` at 1.6× browser zoom (light: after clicking `#theme`). `shot`
  overrides the size for a concept frame (the intro). Shot files never hold `:` (Vite 403s them).
- `dist/` at any depth and `*.tgz` are never snapshotted; a later step re-makes them (`setup`).
- `record` re-records a step's parents only when they are stale. Each authored step's `edits/` is
  the source; the scratch authoring scripts that wrote them are not kept.

## Frames

- `src/scenes/ide.ts` is frame v2 ported from graphl-flow's `dev/fixtures/studies/ide-frame.ts`
  (the reference repo was not reachable when this was built). It THROWS when a transcript has more
  rows than the variant's terminal shows: `code` 8, `run` 17 (with the explorer).
- `src/spine.ts` is the only way a scene reads the spine: `file`, `session`, `shot`, `tree`,
  `lineOf`/`linesOf`, and `grab` for a value quoted in a side pane (never typed). The explorer
  opens only folders holding the active or a new file; a folder of modified files shows `M` closed.
- `src/scenes/lesson.ts` builds a step section from its `step.json`: explorer marks, terminal or
  output panel, variant, and an editor window around `focus` (the editor wraps at 71 columns).
- `src/scenes/console.ts`: the console frame (Decision 12) for a transcript too long for any IDE
  terminal (9.3, 9.4, 12.3); ≤ 52 rows keeps text ≥ 24 px.
- Course 10 shows computed types with a probe: `const p: 'probe' = value` in `try.ts`.

## Gotchas found authoring

- TS 7 `tsc` exits **1** on a type error (TS 5 exited 2).
- npm 11's `npm init -y` writes `"type": "commonjs"`; `--init-type=module` gives module. It prints
  the whole file even with `--silent`, so 2.1 sends it to `/dev/null` (the editor shows it).
- Node 26's unsupported-syntax error is 24 rows; `--stack-trace-limit=0` drops only its internal
  frames (Decision 10).
- A flow of unlabelled edges in a non-spread group fails check-render's `short` edge: put it
  straight in the (spread) side pane, label it, or `spread` its group.
- TS 7's npm package has no JS API (main export = version): typescript-eslint cannot run, so the
  linter is oxlint `--type-aware` (Decision 11). TS 7 error messages widen literal unions when the
  target is `number`: probe against a literal type instead.
- `const` type parameters skip excess-property checks: a stale `sub` inside `defineScene` compiles,
  so the 12.5 consumer writes one node as an explicit `Item`.
- Narrowing from an assertion does not survive into a later function: capture it in a `const`.
- No TypeScript / Node / npm brand icons in graphl-flow yet; generic keys stand in (`code`, `cpu`,
  `package`). Adding `typescript`, `nodedotjs`, `npm` is an engine minor.

## Not built yet

The Colab notebook (`scripts/colab_generate_audio.ipynb`, ported with `REPO` changed), the `film`
and `thumb:film` scripts — all from the reference repo, which this session could not reach.
