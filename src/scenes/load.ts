// Course 7, `load` — read scene files, and refuse bad ones.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `load/${n}`
const run = (n: string) => session(S(n))

const asyncScene = lesson({
  step: S('01-async'), path: 'main.ts', model: 'await: pause here, resume with the value',
  focus: ['async function save(', 'await writeFile(', 'const text = await pending'],
  side: [
    { type: 'item', id: 'call', icon: 'file', tone: 'ingest', title: "readFile('scenes/self.json')", sub: 'returns at once: a Promise<string>' },
    { type: 'item', id: 'pend', icon: 'clock', tone: 'neutral', title: grab(run('01-async'), /^(Promise \{ <pending> \})$/m), sub: 'the file is not here yet' },
    { type: 'item', id: 'await', icon: 'timer', tone: 'serve', title: 'await pending', sub: 'this function pauses, everything else runs' },
    { type: 'item', id: 'val', icon: 'check', tone: 'store', title: 'text: string', sub: `resumed with the value: ${grab(run('01-async'), /read back: (\d+ lines)/)}` },
  ],
  edges: [{ from: 'call', to: 'pend' }, { from: 'pend', to: 'await' }, { from: 'await', to: 'val' }],
})

// ── 2 · ◆ the event loop (lab: real log order) ───────────────────────────────────────────────
const lab2 = file(S('02-lab'), 'main.ts'), log2 = run('02-lab')
const loop: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'parts', title: 'one thread, three queues', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'stack', icon: 'layers', tone: 'serve', title: 'the call stack', sub: 'runs the script to its end, without a break' },
      { type: 'item', id: 'micro', icon: 'zap', tone: 'ingest', title: 'microtasks', sub: 'promise callbacks: run as soon as the stack is empty' },
      { type: 'item', id: 'timers', icon: 'timer', tone: 'store', title: 'timers', sub: 'setTimeout: on the next turn of the loop' },
      { type: 'item', id: 'io', icon: 'disk', tone: 'source', title: 'I/O', sub: 'when the disk answers: later still' },
    ] },
    { type: 'group', id: 'lab', bare: true, children: [
      { type: 'code', id: 'src', fill: true, filename: 'main.ts', lang: 'ts', code: lab2 },
      { type: 'code', id: 'log', fill: true, console: true, cols: 72, filename: 'terminal — miniflow', code: log2,
        highlight: [lineOf(log2, 'the script ends'), lineOf(log2, 'a resolved promise'), lineOf(log2, 'setTimeout(0) fires')] },
    ] },
  ],
  edges: [{ from: 'stack', to: 'micro' }, { from: 'micro', to: 'timers' }, { from: 'timers', to: 'io' }],
}

const parse = lesson({
  step: S('03-parse'), path: 'scenes/checkout.json', model: 'Text in: a value out, or a throw',
  focus: [lineOf(file(S('03-parse'), 'scenes/checkout.json'), '"to": "email"') + 1],
  side: [
    { type: 'item', id: 'text', icon: 'file', tone: 'neutral', title: 'scenes/checkout.json', sub: 'just text, written by hand' },
    { type: 'item', id: 'parser', icon: 'cpu', tone: 'ingest', title: 'JSON.parse(text)', sub: 'stricter than JavaScript: no trailing comma' },
    { type: 'group', id: 'ends', bare: true, dir: 'row', children: [
      { type: 'item', id: 'value', icon: 'check', tone: 'store', title: 'a value', sub: 'self.json' },
      { type: 'item', id: 'throw', icon: 'bell', tone: 'consume', title: 'SyntaxError', sub: `checkout.json, line ${grab(run('03-parse'), /<anonymous_script>:(\d+)/)}` },
    ] },
  ],
  edges: [{ from: 'text', to: 'parser' }, { from: 'parser', to: 'value' }, { from: 'parser', to: 'throw' }],
})

const anyScene = lesson({
  step: S('04-any'), path: 'scenes/checkout.json', model: 'any turns the checker off',
  focus: ['"title": 42'],
  side: [
    { type: 'item', id: 'json', icon: 'file', tone: 'neutral', title: '"title": 42', sub: 'a number, in the file' },
    { type: 'item', id: 'parse', icon: 'cpu', tone: 'consume', title: 'JSON.parse returns any', sub: 'so loadScene returns any' },
    { type: 'item', id: 'flow', icon: 'workflow', tone: 'consume', title: 'layout, draw, …', sub: 'no check anywhere along the way' },
    { type: 'item', id: 'crash', icon: 'bell', tone: 'consume', title: 'escapeXml(text)', sub: grab(run('04-any'), /TypeError: (text\.replaceAll is not a function)/) },
  ],
  edges: [{ from: 'json', to: 'parse' }, { from: 'parse', to: 'flow' }, { from: 'flow', to: 'crash' }],
})

const unknown = lesson({
  step: S('05-unknown'), path: 'src/load.ts', model: 'unknown, narrowed by evidence',
  focus: ['export function isScene(x: unknown): x is Scene {', 'export async function loadScene(path: string): Promise<unknown> {'],
  side: [
    { type: 'item', id: 'u', icon: 'search', tone: 'neutral', title: 'data: unknown', sub: 'nothing may be read from it yet' },
    { type: 'item', id: 'guard', icon: 'shield', tone: 'ingest', title: 'isScene(data)', sub: 'returns x is Scene: checks, then vouches' },
    { type: 'group', id: 'out', bare: true, dir: 'row', children: [
      { type: 'item', id: 'yes', icon: 'check', tone: 'store', title: 'true: data is Scene', sub: 'self.json is drawn' },
      { type: 'item', id: 'no', icon: 'bell', tone: 'consume', title: 'false: skipped', sub: grab(run('05-unknown'), /checkout\.json: (not a scene)/) },
    ] },
  ],
  edges: [{ from: 'u', to: 'guard' }, { from: 'guard', to: 'yes' }, { from: 'guard', to: 'no' }],
})

const assert = lesson({
  step: S('06-assert'), path: 'src/load.ts', model: 'A claim vs a proof',
  focus: ['export function assertScene(x: unknown, path: string): asserts x is Scene {'],
  side: [
    { type: 'group', id: 'claim', title: 'as Scene: a claim', tone: 'consume', children: [
      { type: 'item', id: 'c', title: 'tsc believes it', sub: `the bad file goes through: ${grab(run('06-assert'), /(\d+ nodes \d+)/)}` },
    ] },
    { type: 'group', id: 'proof', title: 'asserts x is Scene: a proof', tone: 'store', children: [
      { type: 'item', id: 'p', title: 'checked at run time', sub: grab(run('06-assert'), /TypeError: (scenes\/checkout\.json is not a scene)/) },
    ] },
    { type: 'note', id: 'after', text: 'After assertScene returns, the checker knows scene is a Scene: on every line below it.' },
  ],
})

const run7 = run('07-validate'), v7 = file(S('07-validate'), 'src/load.ts')
const validate = lesson({
  step: S('07-validate'), path: 'src/load.ts', model: 'The walk, with the path at each step',
  focus: ['function checkNode(', "x.children.forEach((c, i) => checkNode(c, `${at}.children[${i}]`, errors, ids))"],
  show: [[lineOf(v7, 'function checkNode('), lineOf(v7, 'function checkNode(') + 2], [lineOf(v7, "case 'group':"), lineOf(v7, 'x.children.forEach') + 1]],
  side: [
    { type: 'item', id: 'root', icon: 'file', tone: 'neutral', title: 'nodes', sub: 'each node checked with its path' },
    { type: 'item', id: 'n1', icon: 'folder', tone: 'consume', title: 'nodes[1]', sub: grab(run7, /nodes\[1\]\.dir: (expected row \| col, got "rows")/) },
    { type: 'item', id: 'n4', icon: 'folder', tone: 'consume', title: 'nodes[4].children[1]', sub: grab(run7, /children\[1\]\.id: (duplicate id "api")/) },
    { type: 'item', id: 'e8', icon: 'workflow', tone: 'consume', title: 'edges[8]', sub: grab(run7, /edges\[8\]\.to: (no node "email")/) },
  ],
  edges: [{ from: 'root', to: 'n1' }, { from: 'n1', to: 'n4' }, { from: 'n4', to: 'e8' }],
})

const result = lesson({
  step: S('08-result'), path: 'src/errors.ts', model: 'The caller must branch',
  focus: ['export type Result<T, E> ='],
  side: [
    { type: 'item', id: 'r', icon: 'boxes', tone: 'neutral', title: 'Result<Scene, string[]>', sub: 'a discriminated union, again' },
    { type: 'group', id: 'arms', bare: true, dir: 'row', children: [
      { type: 'item', id: 'ok', icon: 'check', tone: 'store', title: 'ok: true', sub: 'value: Scene' },
      { type: 'item', id: 'err', icon: 'bell', tone: 'consume', title: 'ok: false', sub: 'errors: string[]' },
    ] },
    { type: 'table', id: 'runs', title: 'this run', columns: ['file', 'result'], rows: [
      { cells: ['self.json', 'drawn'], tone: 'store' }, { cells: ['checkout.json', 'drawn'], tone: 'store' },
      { cells: ['shop.json', grab(run('08-result'), /shop\.json: (ENOENT)/)], tone: 'consume' },
    ] },
  ],
  edges: [{ from: 'r', to: 'ok' }, { from: 'r', to: 'err' }],
})

export const LOAD: Record<string, SceneModel> = {
  'load-async': asyncScene, 'load-loop': loop, 'load-parse': parse, 'load-any': anyScene,
  'load-unknown': unknown, 'load-assert': assert, 'load-validate': validate, 'load-result': result,
}
