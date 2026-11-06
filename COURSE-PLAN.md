# Learn TypeScript by building a diagram engine: full course, beginner to professional — plan

**Plan status:** approved 2026-11-04. Shared rules (section shape, ◆ detours,
packaging, build order) are in `../CLAUDE.md`; this plan states only what is specific to
TypeScript.

## The idea

One application, `miniflow`, a declarative diagram engine. You describe boxes, groups and arrows,
and it draws them. It is a small cousin of `@graphlearning/graphl-flow`, the engine that draws
every frame of this film. It grows from a script that draws one box to a typed, tested npm
package that renders diagrams as SVG files and live in a browser. Every
TypeScript feature is taught **when the engine first needs it**. Background topics (type erasure,
how layout works, the event loop, how `tsc` checks a program) are short detours, placed where they
answer a question already on screen.

Why a diagram engine:

- **The output is a picture.** Every step ends with something the viewer can see, such as a box,
  a row of boxes or an arrow that finally routes around the corner. The payoff is visual from the
  first section.
- **The domain IS the type system.** A scene is a tree of node kinds (a discriminated union), tones
  are a literal union, and an edge address `code.L12` is a template literal type. Layout is
  recursion over that tree, and routing is pure functions over rects. Nothing has to be invented
  as an excuse for a feature.
- **It grows the way TypeScript is used**: a script → a library → a CLI → a browser app → a
  published package with `.d.ts` files.
- **Each need pulls in a feature**: tones need literal unions, node kinds need narrowing and
  exhaustiveness, layout needs generics, generators and `Map`, renderers need classes and then
  interfaces, scene files need `unknown`, type guards and assertion functions, watch mode needs `async` iterators and `AbortController`,
  and the browser needs DOM types and the honest `Element | null`.
- **The film draws itself.** The finished engine renders its own pipeline (model → layout →
  route → draw). That is the opening shot.

**Who it's for:** someone who has written a little JavaScript. JavaScript syntax (`let`/`const`,
arrow functions, destructuring, spread, array methods) is used and named in passing, but never gets
its own section. The film description states this prerequisite.

**The difficulty curve rises once.** Courses 2–9 teach the TypeScript used in everyday code, at
the moment the app needs it. Course 10 is the type-level layer (`keyof`, mapped and conditional
types, `infer`, template literal and branded types). It comes after the viewer has a whole codebase
to derive types from, and it ends with a payoff: a typo in an edge becomes a compile error.

React is a separate concept and a separate film (the sequel). It wraps this package as a `<Scene>`
component. This film is framework-free on purpose. It uses plain DOM in Course 11, which shows
*why* the engine lets the browser measure text.

## Packaging

**One film: "Learn TypeScript by building a diagram engine: full course, beginner to
professional"**. It has 12 courses and 86 sections, about 2 h 12 min at a mean of 92 s. It opens
with the finished `miniflow` drawing a scene two ways: as an SVG file, and live in the browser
with its theme toggled. The last section bridges to the React film.

## Stack and pins

Every output is run. The pins below were checked against the npm registry on 2026-11-04; the
install script pins exact patch versions.

| tool | pin | arrives | used for |
|---|---|---|---|
| Node | 26.13.0 | 2 | runs `.ts` directly (type stripping, `erasableSyntaxOnly`) |
| TypeScript | 7.0.2 | 2 | `tsc` (the native compiler). `--noEmit` checks; Course 8 emits `dist/` for the `bin`; Course 12 emits `.d.ts` files |
| @types/node | 26.6.6 | 2 | `node:fs` (2.2 writes the first SVG), `node:fs/promises`, `node:util` `parseArgs` |
| Vitest | 5.1.0 | 9 | tests, snapshots, `expectTypeOf` |
| typescript-eslint | 8.72.1 | 9 | `strictTypeChecked`: catches the floating promise |
| Vite | 8.3.5 | 11 | dev server and browser build |
| Playwright | 1.64.1 | infra | spine-only: screenshots every picture for the output panel (2.2 on), and Course 11's live page |

The app has **no runtime dependencies**: the engine is plain TypeScript plus Node's standard
library. The tools above are dev dependencies and arrive when a course needs them.

TypeScript features the film relies on: `erasableSyntaxOnly` (which explains why the film has no
`enum` and no parameter properties), `satisfies`, `using` (explicit resource management), `const`
type parameters, `isolatedDeclarations` and `rewriteRelativeImportExtensions`. Each is verified against TypeScript 7.0.2 at the infra stage
(see Open).

## The app: `miniflow`

One name everywhere: the folder, the package and the command are `miniflow`.

```
miniflow/
  package.json          type: module; scripts; bin (8); exports (12)          (2 → 12)
  tsconfig.json         strict, noEmit, erasableSyntaxOnly                    (2 → 12)
  main.ts               the script a beginner runs                            (2 → 4, then gone)
  src/
    model.ts            Scene, SceneNode = Item | Group, Edge, Tone           (3)
    measure.ts          Measurer: monospace cells (4), browser text (11)      (4, 11)
    layout.ts           row / col / grid → Map<string, Rect>; walk generator  (4)
    fit.ts              the pure fit transform                                (4)
    svg-document.ts     SvgDocument: elements in, an SVG string out           (5)
    render/base.ts      the abstract base class, later replaced              (5)
    render/outline.ts   Renderer → an indented text outline (from Course 3)   (5)
    render/svg.ts       Renderer → an SVG document                            (5)
    route.ts            orthogonal edges, faces, ports                        (6)
        load.ts             read + validate a scene file                          (7)
    errors.ts           SceneError, Result<T, E>                              (7)
    cli.ts              render / check / watch                                (8)
    watch.ts            fs.watch, debounce, AbortController                   (8)
    types.ts            derived types: DeepReadonly, NodeOf, NodeId, Address  (10)
    define.ts           defineScene: ids checked at compile time              (10)
    index.ts            the public surface                                    (12)
  web/
    index.html, main.ts DOM measurer, theme toggle, fit to window             (11)
  scenes/*.json         the data                                              (7 →)
  test/*.test.ts                                                              (9 →)
  dist/                 tsc output: the bin (8), .d.ts files (12)
```

| After course | `miniflow` can… |
|---|---|
| 2 Start | draw one box as an SVG file |
| 3 Model | describe a whole scene as typed data, print it as an outline, and refuse a malformed one at compile time |
| 4 Layout | lay out nested groups in rows, columns and grids (printed as a table of rects), then fit them to a frame |
| 5 Draw | draw a scene as an SVG file, or print it as an outline, through one `Renderer` interface |
| 6 Route | draw right-angle arrows between any two nodes, ports spread on a shared face |
| 7 Load | read scene files, and reject bad ones with a path to the bad field |
| 8 Command | run as `miniflow render scenes/checkout.json --svg out.svg`, or `miniflow watch` |
| 9 Trust | pass its strict flags, tests, snapshots, type tests and the linter |
| 10 Types | derive its types from its own values, and catch an edge to an unknown id at COMPILE time |
| 11 Browser | render live in a page with real text measurement, a theme toggle and fit-to-window |
| 12 Ship | install from a tarball with `.d.ts` files, and break a consumer only in a major version |

## The data

Synthetic and owned. Until Course 7, `checkout` and `self` are typed objects in the code (Course 3 onwards); 7.2 moves them to `scenes/*.json`, written by the steps that create them.

| file | what it draws |
|---|---|
| `checkout.json` | a web shop's checkout: browser → API → orders DB and payments, with a queue to email |
| `self.json` | miniflow's own pipeline: model → layout → route → draw (the intro's payoff) |

The faults are real, and each one teaches a lesson:

| fault | where | course |
|---|---|---|
| `"dir": "rows"` | checkout | 7.7: the validator names `nodes[1].dir` |
| an edge to `paymnet` | checkout | 6.7: a runtime `SceneError`; 10.8: a compile error via `defineScene` |
| a duplicate id `api` | checkout | 7.7 |
| `"title": 42` | checkout | 7.4: `any` lets it through, `unknown` does not (7.5) |
| a trailing comma | checkout | 7.3: `JSON.parse`'s real `SyntaxError` and its position |
| the title `<Cart>` | checkout | 5.8: breaks the SVG until it is escaped |
| a 60-character title | self | 4.9: wider than its column; the layout grows the column, never clips |

## Facts

Frozen: frames quote them. Extend; never change a value a frame already quotes.

| fact | value |
|---|---|
| user / home | `ana` / `/home/ana/miniflow` |
| box | padding 12 px; gap between siblings 24 px (32 when an edge crosses) |
| monospace measurer | 9.6 × 20 px per character (Courses 4–10; the browser measures from 11) |
| fit | margin 4% per side, scale clamped 0.05–4 (the same as graphl-flow's `fit.ts`) |
| tones | `neutral source ingest store serve consume infra` (graphl-flow's seven) |
| node kinds | `item`, `group` (Course 3), `note` (added in 3.8 to show exhaustiveness) |

## Frames

The IDE frame (python-expense-tracker's `ide.ts`, frame v2) is used for every step section:
explorer | editor over terminal | side pane titled with the section's mental model. The terminal
shows the real transcript as a `console`; pictures go in the output panel (below).

A concept frame is used for Course 1 and each ◆ full scene, with the real output in a `code` node
from a lab. A ◆ side pane is a small picture of the code on screen: a set of values, a narrowed
union, a type erased.

**Who draws what.** miniflow draws every picture of its own: the spine runs it and saves what it
printed or wrote. graphl-flow only SHOWS that output: text as a `console`, pictures as screenshots.
graphl-flow never redraws miniflow's boxes as its own nodes. miniflow draws in SVG only; there is
no ASCII renderer (Decision 8).

**One bottom panel per section: the terminal OR the output panel, never both.** Under the
editor sits exactly one panel, in the same slot and at the same size:

| the section's result | bottom panel | shows |
|---|---|---|
| text: setup, commands, `tsc` errors, runtime errors, test and lint output, Course 3's outline, Course 4's rect table | **terminal** | the real transcript as a `console` |
| a picture, and the run succeeded (from 2.2) | **output panel** | a headless-Chrome screenshot of what miniflow drew, in a viewer tab titled with the file (`out/checkout.svg`) or the URL (`localhost:5173`) |

- 2.2 is the first picture: one box. Course 3's outline and Course 4's rect table are text, so
  the terminal; from 5.7 the whole scene is drawn. Each section uses whichever panel carries its
  result.
- A failing step always uses the terminal: no new picture exists, and a stale one would be a fake
  output (5.8 `<Cart>`, 6.7 `paymnet`, every `tsc` error).
- The output panel always takes the `run` variant's tall slot (short editor over a tall bottom
  panel, about 715×480 in the 1344×756 frame, about 2040×1370 px at 4K). Every IDE frame keeps one
  scale, which check-render asserts.
- The side pane is always the mental model. miniflow draws boxes and arrows, and so do the
  teaching diagrams, so the app's output never goes on the right: the viewer must always be able to
  tell "what the app drew" from "how it works".
- The command that made a picture is not on screen in an output section. The tab names the file,
  and the narration names the command. Each command is first shown running in a terminal section.

**Screenshots.** The spine opens each captured `out/*.svg` (and Course 11's live page) in headless
Chromium through Playwright, in both themes, at exactly the output panel's pixel size in the 4K
frame, so the PNG is drawn 1:1, never scaled. A screenshot rather than inlined SVG: a real browser
draws miniflow's file, and its ids, styles and fonts cannot leak into the frame's own SVG.

That needs one new graphl-flow leaf, `figure`: a captured PNG at a fixed `w`/`h` like `tty`, with
a title bar (the tab). It is a minor version and a prerequisite for 2.2, so it ships before the pilot (see Open). The only
full-screen output is the intro (1.2), a concept frame with no side pane.

JSON files are drawn with `lang: 'js'` until the engine has `json` (see Open).

## The spine

Port `spine.py` from python-expense-tracker. One step = `project/` + `session.txt` +
`step.json`, cumulative, with `changes` declared. A failure branch is two steps with the same
`from`. Differences from the reference:

- **The toolchain**: `scripts/install-node.sh` pins Node 26.13.0. `node_modules/`, `dist/` and
  `package-lock.json` churn are never compared; the lockfile is compared from the step that adds a
  dependency. `npm install` needs network, and the script keeps npm's real cache across steps,
  as the reference does for pip.
- **No REPL steps**: Node's REPL does not strip types. "Try it" sections run a scratch `try.ts`
  instead, which has the same visual rhythm and real output.
- **`volatile`**: Vitest durations, `tsc --extendedDiagnostics` timings, Vite's startup ms and
  the port line. Narration says "a fraction of a second".
- **`capture`**: `out/*.svg`, each also screenshotted to a PNG for the output panel; Course 11's
  page is screenshotted from the step's real Vite server. Both themes, at the output panel's exact
  4K pixel size (see Frames).
- **`panel`**: `"terminal"` (the default) or `"output"`, the one bottom panel the section shows.
- **Labs** for each ◆ full scene: the real `tsc` emit beside the source (2.3), the real layout
  passes logged (4.9), the real routing steps logged (6.3), the real log order (7.2) and real
  `--extendedDiagnostics` output (9.7).

## The courses

Side pane = the diagram. ◆ = detour.

**1. `intro` · TypeScript, and what we'll build · 2**

| # | Section | Frame | Side pane |
|---|---|---|---|
| 1 | What TypeScript is, and where it's used | concept | JavaScript + types → checked by `tsc`, erased before running; VS Code, Angular, Deno, Playwright, graphl-flow itself |
| 2 | What we'll build | concept | **the app map**: one box → scene → layout → arrows → CLI → browser → package; the finished `self.json` drawn two ways (SVG, the live page) |

**2. `start` · The first file · 6**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Node, npm and a folder | `node --version`, `npm init -y`, `"type": "module"` | Node ⊃ V8 + the standard library; npm → the registry |
| 2 | `main.ts` | `node main.ts` writes `out/box.svg`: one box (output panel) | `.ts` file → Node strips types → V8 → a file |
| 3 | ◆ full scene: where the types go | concept + lab (`tsc` emit beside the source) | source → type check (tsc) ∥ erase (Node) → JavaScript → V8; the emitted file with every type removed |
| 4 | `tsc` and `tsconfig.json` | `npm i -D typescript`, `strict`, `tsc --noEmit` clean | checker reads tsconfig → files → errors or silence |
| 5 | A type error Node still runs | `width: "10"`; `tsc` refuses, `node` draws a box 1024 wide (`"10" + 24`) | two paths from one file: checked vs run; who catches what |
| 6 | Syntax Node refuses | an `enum Tone`: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`; `erasableSyntaxOnly` | erasable (deleted) vs non-erasable (needs emit) syntax |

**3. `model` · Describe a scene in types · 8**

Every section ends by running the app: the printed scene grows as the types do.

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Primitive types and inference | a box's title, width and padding; hover shows what is inferred; prints the item | each value → its inferred type |
| 2 | Literal unions and `as const`: tones | `type Tone = 'source' \| 'store' \| …`; a typo `'stroe'` refused; the item prints `[store]` | a type as a set of values; a literal kept vs widened to `string` |
| 3 | Object types: `interface` and `type` | `Item { id, title, sub?, tone? }`; prints from an `Item` | the shape: required vs optional fields |
| 4 | Optional fields and `undefined` | `item.sub.length` refused; `?.` and `??`; the sub line prints only when present | `string \| undefined` → two branches |
| 5 | Arrays, and a tree of groups | `Group { children: SceneNode[] }`; prints the group and its items, indented | the scene as a tree |
| 6 | Discriminated unions | `SceneNode = Item \| Group` by `type` | the union split by its tag |
| 7 | Narrowing | `switch (node.type)`, `in`, `typeof`; items print as lines, groups as indented headings | control flow: the type at each branch |
| 8 | Exhaustiveness with `never` | add `note`; `tsc` points at the `switch` that missed it; fixed, the note prints | the leftover set shrinks to `never`; the one that doesn't |

**4. `layout` · Lay out the boxes · 9**

The output is the layout itself: a printed table of rects (`console.table`), until Course 5 draws them.

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Functions: parameters, defaults, rest | `measure(item, pad = 1): Size`, `row(...sizes)` | parameters → return type; a function type |
| 2 | Recursion over the tree | `sizeOf(group)` from its children | the call tree mirrors the scene tree |
| 3 | `Map<string, Rect>`, and what `get` returns | rects by id; `rects.get(id)` is `Rect \| undefined`; the `!` that lies | a map's buckets; the `undefined` branch |
| 4 | Higher-order functions | row = sum of widths, col = max: `reduce` with a function | the children folded into one size |
| 5 | Generics | `mapTree<T>(node, f: (n: SceneNode) => T)` | one function, `T` filled per call |
| 6 | Generic constraints | `indexById<N extends { id: string }>` | `T` bounded by a shape |
| 7 | Generators | `function* nodes(scene)`: walk lazily, stop at the first title too wide | values pulled one at a time down the tree |
| 8 | `readonly` and immutable rects | a layout pass mutates a shared `Rect`: refused | two names, one object; readonly blocks the write |
| 9 | ◆ full scene: how layout works | concept + lab (real pass log) | measure (bottom-up) → place (top-down) → fit; the 60-char title growing its column |

**5. `draw` · Draw the scene · 9**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Classes: an SVG document | `new SvgDocument(w, h)`, `.rect()`, `.text()`, `.toString()`; `static empty()` | the document as a list of elements |
| 2 | `#private` vs `private` | read the elements from outside: refused by `tsc` (`private`) or by the runtime too (`#`) | compile-time vs run-time privacy |
| 3 | Methods, `this`, and a lost `this` | `items.map(this.rect)`: real `TypeError`; an arrow function fixes it | `this` bound at the call, not the definition |
| 4 | Inheritance: `extends`, `abstract`, `protected` | `abstract class BaseRenderer`; `SvgRenderer` and `OutlineRenderer` (Course 3's printer) extend it | the class chain; what each level owns |
| 5 | Interfaces as contracts | `interface Renderer`; the base class goes: composition over inheritance | one contract, two implementations |
| 6 | Structural typing | a plain object literal is a `Renderer` too; no `implements` needed (vs Java's nominal) | shapes, not names |
| 7 | Template literals: the whole scene | `out/checkout.svg`: every box laid out by Course 4 (output panel) | rects → `<rect>` / `<text>` elements |
| 8 | Escaping: `<Cart>` breaks the file | the real parse error; `escapeXml` | text vs markup; one function at the boundary |
| 9 | Tones become colours | `Record<Tone, string>` per theme, `satisfies`; a missing tone refused, then the coloured render (output panel) | the palette: tone × theme |

**6. `route` · Draw the arrows · 7**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Points and segments: tuples | `type Pt = readonly [x: number, y: number]` | a polyline as points |
| 2 | Intersection types | `type Placed = Rect & { id: string }` | two shapes joined into one |
| 3 | ◆ full scene: how an edge is routed | concept + lab | the two sides → the lowest common ancestor → the larger gap → faces → an orthogonal path |
| 4 | The router, as pure functions | `route(from, to, rects): Pt[]`; the arrows drawn (output panel) | rects in, points out: no state |
| 5 | Ports on a shared face | three edges into `orders`: sort and spread (output panel) | a face with three ports, evenly spaced |
| 6 | Overloads | `edge('api', 'orders')` and `edge({ from, to, label })` | two signatures, one implementation |
| 7 | An edge to an unknown id | `paymnet`: a custom `SceneError` with `cause` | the throw → the stack unwinds to `main` |

**7. `load` · Read scene files · 8**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | `async` / `await` and `Promise<T>` | `readFile` from `node:fs/promises` | await = pause here, resume with the value |
| 2 | ◆ full scene: the event loop | concept + lab (real log order) | call stack → microtasks → the I/O queue; why `await` doesn't block |
| 3 | `JSON.parse`, and a trailing comma | scenes move to `scenes/*.json`; the real `SyntaxError` with its position | text → parser → value or throw |
| 4 | `any` lets `"title": 42` through | crashes later at `title.length`, far from the cause | `any` turns the checker off |
| 5 | `unknown` and type guards | `isItem(x): x is Item` | unknown → narrowed by evidence |
| 6 | `as` vs assertion functions | `data as Scene` lies; `assertScene(x): asserts x is Scene` checks | a claim vs a proof |
| 7 | A validator with paths | `nodes[1].dir: expected row \| col \| grid, got "rows"`; the duplicate `api` | the walk, with the path at each step |
| 8 | `Result<T, E>`, and `catch (e: unknown)` | `{ ok: true, value } \| { ok: false, errors }` | a discriminated union again; the caller must branch |

**8. `command` · Make it a command · 8**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Modules: `import`, `export`, `import type` | `main.ts` splits into `src/`; `.ts` extensions in imports | the module graph |
| 2 | Arguments with `parseArgs` | `miniflow render scenes/checkout.json --svg out.svg` | argv → options object, typed |
| 3 | Subcommands as a union | `render \| check \| watch`, dispatch with exhaustive `switch` | the command routed to its handler |
| 4 | Exit codes and stderr | `check` exits 1 with the validator's errors | stdout vs stderr vs exit code |
| 5 | A `bin`, and why it must be compiled | Node won't strip types under `node_modules`; `tsc` → `dist/`, `rewriteRelativeImportExtensions` | source → `dist/` → the `bin` link |
| 6 | Watch mode | `for await (const e of watch(dir))` re-renders on save | an async iterator of events |
| 7 | Debounce: closures and timer types | three saves → one render; `ReturnType<typeof setTimeout>` | a closure holding the pending timer |
| 8 | Ctrl-C: `AbortController` and `using` | SIGINT aborts the watcher; `using` disposes it on every exit path | the signal threaded through every await; dispose at scope end |

**9. `trust` · Trust it · 8**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Stricter flags | `noUncheckedIndexedAccess` finds a real bug in `layout.ts` | the flag adds `\| undefined` to every index |
| 2 | Tests with Vitest | `fit` and `route` tested | arrange → act → assert |
| 3 | A failing test | an off-by-one in the port spread: the real diff | expected vs received |
| 4 | Snapshot tests | the SVG of `checkout` snapshotted; a changed attribute breaks it | the stored picture vs the new one |
| 5 | Testing the types | `expectTypeOf` on `layout`'s result; `// @ts-expect-error` on a bad tone | a test that must NOT compile |
| 6 | The linter catches a floating promise | `strictTypeChecked`: an un-awaited `writeFile` | a promise nobody awaits |
| 7 | ◆ full scene: how `tsc` checks a program | concept + lab (`--extendedDiagnostics` on miniflow itself) | scanner → parser → binder → checker → emit; files, types, time |
| 8 | One `check` script | `tsc && eslint && vitest run` in `npm run check` | the gate, three stages |

**10. `types` · Types that compute · 8**

Each section derives a type from code the viewer already has; the course ends with the payoff.

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | `typeof` and `keyof`: types from values | `type Tone = keyof typeof palette`: one source of truth | value → its type → its keys |
| 2 | Indexed access types | `Item['tone']`, `SceneNode['type']` | a type looked up like a property |
| 3 | Mapped types | write `Partial` by hand, then `DeepReadonly<Scene>` | every key of `T` → a new property |
| 4 | Conditional types | `NodeOf<'group'>` is `Group`; distributes over the union | the union filtered, member by member |
| 5 | `infer` | `ElementOf<T>`, a hand-made `ReturnType` | a pattern match on a type |
| 6 | Branded ids | `NodeId` vs `string`; a label passed as an id is refused | a brand: same runtime, different type |
| 7 | Template literal types: addresses | `` `${string}.L${number}` ``; `checkout.L0` ok, `checkout.0` refused | the address grammar |
| 8 | `const` type parameters: the typo caught at compile time | `defineScene({ … })`: the `paymnet` edge from 6.7 is now a COMPILE error | the scene's ids flow into the edge type |

**11. `browser` · Run it in a browser · 7**

Output panel for 11.3–11.6 (the live page); terminal for the dev server, the `null` error and the build.

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | Vite and `index.html` | one page and `vite` as a dev server (no template) | page → module graph → served |
| 2 | DOM types, and `Element \| null` | `querySelector` can return `null`; narrowing it | the DOM as a typed tree |
| 3 | The SVG in the page | the same renderer, now in a page (output panel: `localhost:5173`) | renderer → SVG string → `innerHTML` → the DOM |
| 4 | Measuring real text | a `Measurer` from `getBBox`: proportional fonts change the layout | one interface, two measurers (dependency injection) |
| 5 | Events: a theme toggle | `addEventListener('click', …)` with `MouseEvent`; dark/light | event → handler → re-render |
| 6 | Fit to the window | `ResizeObserver` + the pure `fit` from 4 | pane size → `fit` → transform |
| 7 | A production build | `vite build`: real chunk sizes | dev (unbundled) vs build (bundled, hashed) |

**12. `ship` · Ship it as a package · 6**

| # | Section | Step | Side pane |
|---|---|---|---|
| 1 | The public surface | `src/index.ts`: every export is a promise | inside vs exported |
| 2 | Declaration files | `.d.ts` emitted; `isolatedDeclarations` asks for return types; `declare module` mentioned | `.ts` → `.js` + `.d.ts`; who reads which |
| 3 | `package.json` `exports` and `files` | `npm pack --dry-run` lists the tarball | the package map: import path → file |
| 4 | Smoke-test the tarball | a fresh project installs the `.tgz`, and `defineScene` works there | tarball → fresh install → `tsc` → run |
| 5 | Semver: a breaking change | rename `sub` → `subtitle`; the consumer's `tsc` fails; a major | patch / minor / major |
| 6 | What's next: React | the package wrapped in a `<Scene>` (the sequel) | miniflow → `<Scene>` → graphl-flow |

## Decisions

1. TypeScript and React are separate films; React is the sequel and consumes this package
   (2026-11-04).
2. The engine is framework-free and has no runtime dependencies (2026-11-04).
3. Node runs `.ts` directly until Course 8. `tsc` only checks until Course 8 needs a compiled
   `bin` (2026-11-04).
4. The viewer has written a little JavaScript; JS syntax is named in passing, never taught as a
   section (2026-11-04).
5. Type-level features (`keyof`, mapped, conditional, `infer`, template literal, branded, `const`
   type parameters) get their own course, 10, after `trust`, so the difficulty rises once
   (2026-11-04).
6. Every Course 3 section ends by printing the scene, so the app keeps growing on screen while the
   lessons are pure types (2026-11-04).
7. One bottom panel per section: the terminal (commands, setup, errors, text output) or the output
   panel (a headless-Chrome screenshot of a picture miniflow drew), never both and never in the
   side pane; the side pane is always the mental model (2026-11-04).
8. No ASCII renderer: miniflow draws SVG only. Grid routing, the 72-column limit and the
   box-drawing glyph risk taught no TypeScript; `SvgDocument` and `OutlineRenderer` carry the
   class and interface lessons instead (2026-11-04).

## Open

- **Engine prerequisite: a `figure` leaf** in graphl-flow, from 2.2 (so before the pilot): a captured PNG at a
  fixed `w`/`h` in the bottom panel's slot, with a title bar (the file or the URL). Graphl-flow
  minor, with a fixture and a check (same scale as the terminal it replaces). Also, optionally, a
  `json` language (Course 7).
- **Legibility inside a screenshot.** check-render measures text in the DOM and cannot see inside
  a PNG. The spine must assert instead that miniflow's smallest text lands at ≥ 24 px in the 4K
  frame (its font size × the capture's scale), or the picture fails like an overflowing pane.
- **Version drift**: `../CLAUDE.md` says graphl-flow 0.8.0, its README 0.9.0, its `package.json`
  0.10.0. Confirm which version a new repo pins (and ui-shell's peer range) before infra.
- **To verify at infra against TypeScript 7.0.2**: `erasableSyntaxOnly`,
  `rewriteRelativeImportExtensions`, `isolatedDeclarations`, `--extendedDiagnostics` output, and
  whether typescript-eslint 8.72 supports TS 7. If one is missing, the section falls back to TS 6.
- **Repo name**: `typescript-diagram-engine` (matches `python-expense-tracker`), app `miniflow`.
  OK?
- **Length**: 86 sections is about 2 h 12 min, longer than the reference's 72. Already cut:
  `Promise.all`, loading a dropped file, and a separate `as const` section.
- **Deferred:** React (the sequel), publishing to the real npm registry (the film stops at a
  tarball), decorators, namespaces and declaration merging, variance annotations (`in`/`out`),
  monorepos and project references, Deno/Bun. `declare module` gets one mention in 12.2.
