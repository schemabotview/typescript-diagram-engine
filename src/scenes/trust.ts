// Course 9, `trust` — strict flags, tests, snapshots, type tests, the linter, one check script.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `trust/${n}`
const run = (n: string) => session(S(n))

const strict = lesson({
  step: S('01-strict'), path: 'tsconfig.json', model: 'The flag adds | undefined to every index',
  focus: ['"noUncheckedIndexedAccess": true'],
  side: [
    { type: 'table', id: 'idx', title: 'what an index gives back', columns: ['expression', 'before', 'with the flag'], rows: [
      ['points[i]', 'Pt', 'Pt | undefined'], ['spread[i]', '{ ta, tb }', '… | undefined'], ['out[p.i]', '{ ta, tb }', '… | undefined'],
    ] },
    { type: 'item', id: 'found', icon: 'search', tone: 'consume', title: `${run('01-strict').split('\n').filter((l) => / error TS/.test(l)).length} places found`, sub: 'in route.ts and render/svg.ts' },
    { type: 'note', id: 'why', text: 'An array index can be past the end. Without the flag, the checker assumes it never is.' },
  ],
})

const vitest = lesson({
  step: S('02-vitest'), path: 'test/route.test.ts', model: 'Arrange, act, assert',
  focus: ["it('bends once, in the middle of the gap', () => {", 'expect(route(a, b)).toEqual('],
  side: [
    { type: 'item', id: 'arrange', icon: 'box', tone: 'store', title: 'arrange', sub: 'two rects, a and b' },
    { type: 'item', id: 'act', icon: 'zap', tone: 'ingest', title: 'act', sub: 'route(a, b)' },
    { type: 'item', id: 'assert', icon: 'check', tone: 'serve', title: 'assert', sub: 'toEqual the four expected points' },
    { type: 'item', id: 'ran', icon: 'activity', tone: 'store', title: grab(run('02-vitest'), /Tests +(\d+ passed)/), sub: 'fit and route, in a fraction of a second' },
  ],
  edges: [{ from: 'arrange', to: 'act' }, { from: 'act', to: 'assert' }],
})

const log3 = file(S('03-fail'), 'test.log')
const failing = lesson({
  step: S('03-fail'), path: 'src/route.ts', model: 'Expected vs received',
  focus: ['if (slot) slot[p.end] = (k + 1) / ends.length'],
  side: [
    { type: 'item', id: 'bug', icon: 'bell', tone: 'consume', title: '(k + 1) / ends.length', sub: 'the off-by-one, in ports()' },
    { type: 'table', id: 'diff', title: 'three ports on one face', columns: ['port', 'expected', 'received'], rows: [
      ['1st', '0.25', '0.33'], ['2nd', '0.5', '0.67'], { cells: ['3rd', '0.75', '1: the corner'], tone: 'consume' },
    ] },
    { type: 'item', id: 'where', icon: 'search', tone: 'serve', title: 'test.log: the whole report', sub: `the failing line: ${grab(log3, /❯ (test\/route\.test\.ts:\d+:\d+)/)}` },
  ],
})

const log4 = file(S('04-snapshot'), 'test.log')
const snapshot = lesson({
  step: S('04-snapshot'), path: 'src/svg-document.ts', model: 'The stored picture vs the new one',
  focus: ['markerWidth="10" markerHeight="10"'],
  side: [
    { type: 'item', id: 'stored', icon: 'archive', tone: 'store', title: 'svg.test.ts.snap', sub: 'the checkout SVG, written on the first run' },
    { type: 'item', id: 'change', icon: 'code', tone: 'ingest', title: 'markerWidth 8 → 10', sub: 'one attribute, in svg-document.ts' },
    { type: 'item', id: 'mismatch', icon: 'bell', tone: 'consume', title: `Snapshot ${grab(log4, /Snapshot `[^`]+` (mismatched)/)}`, sub: 'the diff: the one line that moved' },
    { type: 'note', id: 'u', text: 'Meant it? vitest -u rewrites the stored snapshot. Did not? The test just caught a regression.' },
  ],
})

const t5 = file(S('05-types'), 'test/types.test.ts')
const types = lesson({
  step: S('05-types'), path: 'test/types.test.ts', model: 'A test that must NOT compile',
  focus: ['expectTypeOf(layout).returns.toEqualTypeOf<Map<string, Rect>>()', '// @ts-expect-error: not a tone'],
  show: [[lineOf(t5, "it('layout returns"), lineOf(t5, "it('layout returns") + 2], [lineOf(t5, '// @ts-expect-error'), lineOf(t5, '// @ts-expect-error') + 1]],
  side: [
    { type: 'group', id: 'kinds', bare: true, dir: 'row', children: [
      { type: 'item', id: 'eq', icon: 'check', tone: 'store', title: 'expectTypeOf', sub: 'the type must be exactly this' },
      { type: 'item', id: 'ee', icon: 'shield', tone: 'serve', title: '@ts-expect-error', sub: 'the next line must fail' },
    ] },
    { type: 'item', id: 'unused', icon: 'bell', tone: 'consume', title: "tone: 'store' under it", sub: `${grab(run('05-types'), /error (TS\d+)/)}: unused @ts-expect-error` },
    { type: 'note', id: 'who', text: 'tsc runs these tests: a type test that fails is a compile error, not a red test.' },
  ],
})

const lint = lesson({
  step: S('06-lint'), path: 'src/cli.ts', model: 'A promise nobody awaits',
  focus: ['  writeFile(out, text)'],
  side: [
    { type: 'item', id: 'call', icon: 'file', tone: 'neutral', title: 'writeFile(out, text)', sub: 'returns a Promise<void>' },
    { type: 'group', id: 'paths', bare: true, dir: 'row', children: [
      { type: 'item', id: 'log', icon: 'check', tone: 'consume', title: "console.log('wrote …')", sub: 'runs at once: before the write' },
      { type: 'item', id: 'lost', icon: 'bell', tone: 'consume', title: 'a failed write', sub: 'rejects: and nobody hears it' },
    ] },
    { type: 'item', id: 'rule', icon: 'shield', tone: 'serve', title: 'no-floating-promises', sub: `${grab(run('06-lint'), /src\/cli\.ts:(\d+:\d+)/)}: oxlint, typed by TypeScript 7` },
  ],
  edges: [{ from: 'call', to: 'log' }, { from: 'call', to: 'lost' }],
})

// ── 7 · ◆ how tsc checks a program (lab: --extendedDiagnostics on miniflow) ───────────────────
const diag = run('07-lab')
const how: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'phases', title: 'five phases', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'scan', icon: 'search', tone: 'ingest', title: 'scanner', sub: 'characters → tokens' },
      { type: 'item', id: 'parse', icon: 'branch', tone: 'ingest', title: 'parser', sub: 'tokens → a syntax tree per file' },
      { type: 'item', id: 'bind', icon: 'layers', tone: 'store', title: 'binder', sub: 'names → symbols, scopes' },
      { type: 'item', id: 'check', icon: 'shield', tone: 'serve', title: 'checker', sub: 'every expression gets a type' },
      { type: 'item', id: 'emit', icon: 'file', tone: 'neutral', title: 'emit', sub: 'JavaScript: skipped by --noEmit' },
    ] },
    { type: 'code', id: 'out', console: true, cols: 72, filename: 'terminal — miniflow', code: diag,
      highlight: [lineOf(diag, 'Files:'), lineOf(diag, 'Types:'), lineOf(diag, 'Check time:')] },
  ],
  edges: [{ from: 'scan', to: 'parse' }, { from: 'parse', to: 'bind' }, { from: 'bind', to: 'check' }, { from: 'check', to: 'emit' }],
}

const pkg8 = file(S('08-check'), 'package.json')
const check = lesson({
  step: S('08-check'), path: 'package.json', model: 'The gate, three stages',
  focus: ['"check": '],
  show: [[lineOf(pkg8, '"scripts"'), lineOf(pkg8, '"check"') + 1]],
  side: [
    { type: 'item', id: 'tsc', icon: 'shield', tone: 'serve', title: '1 · tsc --noEmit', sub: 'the types, the strict flags, the type tests' },
    { type: 'item', id: 'ox', icon: 'filter', tone: 'ingest', title: '2 · oxlint --type-aware', sub: 'the floating promise, and its kin' },
    { type: 'item', id: 'vt', icon: 'check', tone: 'store', title: '3 · vitest run', sub: grab(run('08-check'), /Tests +(\d+ passed)/) },
    { type: 'note', id: 'and', text: '&& stops at the first stage that fails, and npm run check exits with its code.' },
  ],
  edges: [{ from: 'tsc', to: 'ox' }, { from: 'ox', to: 'vt' }],
})

export const TRUST: Record<string, SceneModel> = {
  'trust-strict': strict, 'trust-vitest': vitest, 'trust-failing': failing, 'trust-snapshot': snapshot,
  'trust-types': types, 'trust-lint': lint, 'trust-how': how, 'trust-check': check,
}
