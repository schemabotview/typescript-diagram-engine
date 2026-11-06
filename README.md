# Learn TypeScript by building a diagram engine

A GraphL concept: one film that teaches TypeScript by building `miniflow`, a small declarative
diagram engine, from one box drawn by a script to a typed, tested npm package.

**Status:** Course 2 (the pilot) authored and checked; the rest follow `COURSE-PLAN.md`.

## Run

```sh
npm install
npm run dev        # http://localhost:5173/typescript-diagram-engine/ — #/ catalog, #/start-node a section
npm run build && npx tsc --noEmit && npm run check
npm run check:spine
```

## Layout

- `COURSE-PLAN.md` — what is taught
- `spine/<course>/<NN-step>/` — miniflow's real files and transcript at every step
- `src/content/` — sections and narration · `src/scenes/` — the frames, read from the spine
- `scripts/` — `spine.py`, checks, `concept.json`, `titles.json`, `audio-manifest.json`
