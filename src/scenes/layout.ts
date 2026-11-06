// Course 4, `layout` — lay out the boxes. The output is the layout itself: sizes and rects, printed.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `layout/${n}`
const run = (n: string) => session(S(n))

/** A rect's row of the real console.table in 4.4: x, y, w, h. */
const rectOf = (id: string) => {
  const m = run('04-reduce').match(new RegExp(`'${id}'\\s*│\\s*(\\d+)\\s*│\\s*(\\d+)\\s*│\\s*(\\d+)\\s*│\\s*(\\d+)`))
  if (!m) throw new Error(`no rect ${id} in the table`)
  const [x, y, w, h] = m.slice(1).map(Number)
  return { x, y, w, h }
}
const wh = (id: string) => `${rectOf(id).w} x ${rectOf(id).h}`

const measure = lesson({
  step: S('01-measure'), path: 'src/measure.ts', model: 'Parameters in, a Size out',
  focus: ['export function measure', 'export function row'],
  side: [
    { type: 'item', id: 'sig', icon: 'code', title: 'measure(item, pad = 12)', sub: '(item: Item, pad?: number) => Size' },
    { type: 'table', id: 'calls', title: 'the calls', columns: ['call', 'returns'], rows: [
      ['measure(browser)', `{ w: ${grab(run('01-measure'), /browser \{ w: (\d+)/)}, h: 64 }`],
      ['measure(email, 0)', `{ w: ${grab(run('01-measure'), /no padding: \{ w: (\d+)/)}, h: 20 }`],
      ['row(24, ...sizes)', `{ w: ${grab(run('01-measure'), /row of items: \{ w: (\d+)/)}, h: 64 }`],
    ] },
    { type: 'item', id: 'rest', icon: 'layers', tone: 'ingest', title: '...sizes', sub: 'a rest parameter: any number of Sizes, as an array' },
  ],
})

const recurse = lesson({
  step: S('02-recurse'), path: 'src/layout.ts', model: 'The call tree mirrors the scene tree',
  focus: ["case 'group': {", 'const s = sizeOf(child)'],
  side: [
    { type: 'group', id: 'svc', icon: 'workflow', tone: 'ingest', title: 'sizeOf(services)', sub: `returns ${grab(run('02-recurse'), /group services (\d+ x \d+)/)}, last`, children: [
      { type: 'item', id: 'pay', title: 'sizeOf(payments)', sub: 'an item: returns at once' },
      { type: 'item', id: 'inv', title: 'sizeOf(inventory)', sub: 'an item: returns at once' },
      { type: 'item', id: 'q', title: 'sizeOf(queue)', sub: 'an item: returns at once' },
    ] },
    { type: 'note', id: 'base', text: 'An item is the base case: it returns at once. A group waits for every child first.' },
  ],
})

const map = lesson({
  step: S('03-map'), path: 'try.ts', model: "A map's get can come back empty",
  focus: ["get('cart')!"],
  side: [
    { type: 'table', id: 'rects', title: 'Map<string, Rect>', columns: ['key', 'value'], rows: [
      { id: 'k-orders', cells: ["'orders'", `{ x: ${grab(run('03-map'), /orders at (\d+)/)}, y: ${grab(run('03-map'), /orders at \d+ (\d+)/)}, … }`] },
      { id: 'k-api', cells: ["'api'", '{ x, y, w, h }'] },
      { id: 'k-more', cells: ['…', `${grab(run('03-map'), /^(\d+) rects/m)} keys in all`] },
    ] },
    { type: 'item', id: 'get', icon: 'search', title: "rects.get('cart')", sub: 'Rect | undefined' },
    { type: 'group', id: 'ways', bare: true, dir: 'row', children: [
      { type: 'item', id: 'narrow', icon: 'check', tone: 'store', title: 'if (orders)', sub: 'narrowed to Rect' },
      { type: 'item', id: 'bang', icon: 'bell', tone: 'consume', title: "get('cart')!", sub: 'a promise that lied' },
    ] },
  ],
  edges: [{ from: 'get', to: 'narrow' }, { from: 'get', to: 'bang' }],
})

const reduce = lesson({
  step: S('04-reduce'), path: 'src/layout.ts', model: 'The children folded into one size',
  focus: ['const join', 'const inner = '],
  side: [
    { type: 'group', id: 'kids', title: 'services: three children', tone: 'neutral', dir: 'row', children: [
      { type: 'item', id: 'p', title: 'payments', sub: wh('payments') },
      { type: 'item', id: 'i', title: 'inventory', sub: wh('inventory') },
      { type: 'item', id: 'q', title: 'queue', sub: wh('queue') },
    ] },
    { type: 'item', id: 'fold', icon: 'filter', tone: 'ingest', title: '.reduce(col)', sub: 'col(col(payments, inventory), queue)' },
    { type: 'item', id: 'inner', icon: 'layers', tone: 'store', title: `inner: ${rectOf('services').w - 24} x ${rectOf('services').h - 24 - 32}`, sub: 'the widest, and the heights plus two gaps' },
  ],
  edges: [{ from: 'kids', to: 'fold' }, { from: 'fold', to: 'inner' }],
})

const generic = lesson({
  step: S('05-generic'), path: 'src/tree.ts', model: 'One function, T filled in per call',
  focus: ['export function mapTree<T>(', '): T[] {'],
  side: [
    { type: 'item', id: 'fn', icon: 'code', title: 'mapTree<T>', sub: 'f: (n: SceneNode) => T, returns T[]' },
    { type: 'group', id: 'calls', bare: true, dir: 'row', children: [
      { type: 'item', id: 'ids', tone: 'store', title: 'T = string', sub: "(m) => m.id: string[]" },
      { type: 'item', id: 'ws', tone: 'ingest', title: 'T = number', sub: '(m) => sizeOf(m).w: number[]' },
    ] },
    { type: 'item', id: 'widest', icon: 'chart', title: `widest: ${grab(run('05-generic'), /widest: (\d+)/)}`, sub: 'Math.max of the number[]' },
  ],
  edges: [{ from: 'fn', to: 'ids' }, { from: 'fn', to: 'ws' }, { from: 'ws', to: 'widest' }],
})

const constraint = lesson({
  step: S('06-constraint'), path: 'src/tree.ts', model: 'T bounded by a shape',
  focus: ['export function indexById<N extends { id: string }>('],
  side: [
    { type: 'item', id: 'bound', icon: 'shield', title: 'N extends { id: string }', sub: 'anything, as long as it has an id' },
    { type: 'table', id: 'args', title: 'what may be passed', columns: ['nodes', 'N is', ''], rows: [
      ['SceneNode[]', 'SceneNode', 'ok'], ['{ id, w }[]', '{ id; w }', 'ok'],
      { cells: ['{ name }[]', 'no id', grab(run('06-constraint'), /error (TS\d+)/)], tone: 'consume' },
    ] },
    { type: 'item', id: 'keeps', icon: 'check', tone: 'store', title: 'the type comes back whole', sub: `sizes.get('queue')?.w is ${grab(run('06-constraint'), /^(\d+)$/m)}: still a number` },
  ],
})

const gen7 = run('07-generator')
const generator = lesson({
  step: S('07-generator'), path: 'src/tree.ts', model: 'Values pulled one at a time',
  focus: ['export function* walk', 'yield node', 'yield* walk'],
  side: [
    { type: 'item', id: 'loop', icon: 'activity', title: 'for … of walk(nodes)', sub: 'asks for the next node' },
    { type: 'group', id: 'pulled', title: `pulled: ${grab(gen7, /^(\d+) visited/m)}`, tone: 'store', dir: 'grid', cols: 3, children:
      ['why', 'browser', 'api', 'services', 'payments', 'inventory'].map((id) => ({ type: 'item' as const, id: `v-${id}`, title: id, chip: true })) },
    { type: 'group', id: 'never', title: 'never walked', tone: 'neutral', dir: 'row', children:
      ['queue', 'data', 'orders', 'email'].map((id) => ({ type: 'item' as const, id: `n-${id}`, title: id, chip: true, muted: true })) },
  ],
  edges: [{ from: 'loop', to: 'pulled' }],
})

const readonly = lesson({
  step: S('08-readonly'), path: 'src/layout.ts', model: 'Two names, one object',
  focus: ['readonly x: number', 'readonly y: number'],
  side: [
    { type: 'group', id: 'names', bare: true, dir: 'row', children: [
      { type: 'item', id: 'inMap', icon: 'table', title: 'rects', sub: "the map's value" },
      { type: 'item', id: 'loopVar', icon: 'activity', title: 'r', sub: 'the loop variable' },
    ] },
    { type: 'item', id: 'obj', icon: 'box', tone: 'store', title: 'one Rect object', sub: 'readonly x, y, w, h' },
    { type: 'item', id: 'write', icon: 'bell', tone: 'consume', title: 'r.x += 40', sub: `${grab(run('08-readonly'), /error (TS\d+)/)}: a read-only property` },
    { type: 'item', id: 'fit', icon: 'zap', tone: 'ingest', title: 'fit(content, frame)', sub: 'returns a NEW Transform instead' },
  ],
  edges: [{ from: 'inMap', to: 'obj' }, { from: 'loopVar', to: 'obj' }],
})

// ── 9 · ◆ how layout works (lab: the passes logged) ──────────────────────────────────────────
const self9 = file(S('09-lab'), 'scenes/self.ts'), log9 = run('09-lab')
const passes: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'how', title: 'three passes over the tree', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'm', icon: 'layers', tone: 'ingest', title: '1 · measure, bottom-up', sub: 'children first: a parent needs their sizes' },
      { type: 'item', id: 'p', icon: 'workflow', tone: 'store', title: '2 · place, top-down', sub: 'a parent gives each child its x and y' },
      { type: 'item', id: 'f', icon: 'zap', tone: 'serve', title: '3 · fit', sub: 'one scale and offset for the whole picture' },
      { type: 'note', id: 'grow', text: 'A title wider than its column grows the column, and every box after it moves over. Nothing is ever clipped.' },
    ] },
    { type: 'group', id: 'lab', bare: true, children: [
      { type: 'code', id: 'scene', fill: true, wrap: true, filename: 'scenes/self.ts', lang: 'ts', code: self9, show: [[lineOf(self9, 'nodes: ['), lineOf(self9, "id: 'route'")]], highlight: [lineOf(self9, "title: 'Layout:")] },
      { type: 'code', id: 'log', fill: true, console: true, cols: 72, filename: 'terminal — miniflow', code: log9, highlight: [lineOf(log9, 'measure layout'), lineOf(log9, 'measure engine'), lineOf(log9, 'place   draw')] },
    ] },
  ],
  edges: [{ from: 'm', to: 'p' }, { from: 'p', to: 'f' }],
}

export const LAYOUT: Record<string, SceneModel> = {
  'layout-measure': measure, 'layout-recurse': recurse, 'layout-map': map, 'layout-reduce': reduce,
  'layout-generic': generic, 'layout-constraint': constraint, 'layout-generator': generator,
  'layout-readonly': readonly, 'layout-passes': passes,
}
