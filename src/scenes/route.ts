// Course 6, `route` — draw the arrows.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `route/${n}`
const run = (n: string) => session(S(n))

const tuples = lesson({
  step: S('01-tuples'), path: 'src/route.ts', model: 'A polyline is a list of points',
  focus: ['export type Pt = readonly [x: number, y: number]'],
  side: [
    { type: 'table', id: 'bend', title: 'bend: Pt[]', columns: ['#', 'x', 'y'], rows: [
      ['0', '620', '32'], ['1', '642', '32'], ['2', '642', '116'], ['3', '664', '116'],
    ] },
    { type: 'item', id: 'len', icon: 'activity', tone: 'ingest', title: `length: ${grab(run('01-tuples'), /length: (\d+)/)}`, sub: 'every step is straight across or straight down' },
    { type: 'group', id: 'rules', bare: true, dir: 'row', children: [
      { type: 'item', id: 'two', icon: 'bell', tone: 'consume', title: '[620, 32, 0]', sub: `${grab(run('01-tuples'), /try\.ts\(5,\d+\): error (TS\d+)/)}: exactly two` },
      { type: 'item', id: 'ro', icon: 'lock', tone: 'consume', title: 'p[0] = 640', sub: `${grab(run('01-tuples'), /try\.ts\(4,\d+\): error (TS\d+)/)}: readonly` },
    ] },
  ],
})

const inter = lesson({
  step: S('02-intersection'), path: 'src/route.ts', model: 'Two shapes joined into one',
  focus: ['export type Placed = Rect & { readonly id: string }'],
  side: [
    { type: 'group', id: 'parts', bare: true, dir: 'row', children: [
      { type: 'item', id: 'rect', icon: 'box', tone: 'store', title: 'Rect', sub: 'x, y, w, h' },
      { type: 'item', id: 'id', icon: 'fingerprint', tone: 'ingest', title: '{ id: string }', sub: 'a name' },
    ] },
    { type: 'item', id: 'placed', icon: 'layers', tone: 'serve', title: 'Placed = Rect & { id }', sub: 'has ALL the fields of both' },
    { type: 'item', id: 'api', icon: 'search', title: grab(run('02-intersection'), /^(api at \d+ \d+)/m), sub: `centre ${grab(run('02-intersection'), /api at \d+ \d+ centre (\[.*\])/)}` },
  ],
  edges: [{ from: 'rect', to: 'placed' }, { from: 'id', to: 'placed' }, { from: 'placed', to: 'api' }],
})

// ── 3 · ◆ how an edge is routed (lab) ────────────────────────────────────────────────────────
const lab = file(S('03-lab'), 'main.ts'), log = run('03-lab')
const how: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'steps', title: 'one edge, five steps', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'r', icon: 'box', tone: 'store', title: '1 · two rects', sub: 'from the layout, by id' },
      { type: 'item', id: 'g', icon: 'search', tone: 'ingest', title: '2 · the gaps', sub: 'side by side, or stacked?' },
      { type: 'item', id: 'f', icon: 'branch', tone: 'ingest', title: '3 · the faces', sub: 'side by side: right face to left face' },
      { type: 'item', id: 'p', icon: 'layers', tone: 'serve', title: '4 · the ports', sub: 'a place along each face' },
      { type: 'item', id: 'o', icon: 'workflow', tone: 'serve', title: '5 · the path', sub: 'out, across the middle of the gap, in' },
    ] },
    { type: 'group', id: 'lab', bare: true, children: [
      { type: 'code', id: 'src', fill: true, filename: 'main.ts', lang: 'ts', code: lab, show: [[lineOf(lab, 'const rects'), lineOf(lab, 'console.log(`path')]], highlight: [lineOf(lab, 'const [sa, sb]')] },
      { type: 'code', id: 'log', fill: true, console: true, cols: 72, filename: 'terminal — miniflow', code: log, highlight: [lineOf(log, 'gaps'), lineOf(log, 'faces'), lineOf(log, 'path')] },
    ] },
  ],
  edges: [{ from: 'r', to: 'g' }, { from: 'g', to: 'f' }, { from: 'f', to: 'p' }, { from: 'p', to: 'o' }],
}

const router = lesson({
  step: S('04-route'), path: 'src/route.ts', model: 'Rects in, points out: no state',
  focus: ['export function route(a: Rect, b: Rect'],
  side: [
    { type: 'group', id: 'ins', bare: true, dir: 'row', children: [
      { type: 'item', id: 'a', icon: 'box', tone: 'store', title: 'a: Rect', sub: 'where it starts' },
      { type: 'item', id: 'b', icon: 'box', tone: 'store', title: 'b: Rect', sub: 'where it ends' },
    ] },
    { type: 'item', id: 'fn', icon: 'zap', tone: 'ingest', title: 'route(a, b)', sub: 'faces, anchors, a bend: nothing remembered' },
    { type: 'item', id: 'out', icon: 'workflow', tone: 'serve', title: 'Pt[]', sub: 'drawn as one <polyline> per edge' },
    { type: 'note', id: 'same', text: 'Same rects in, same points out, every time. That is what makes a router testable.' },
  ],
  edges: [{ from: 'a', to: 'fn' }, { from: 'b', to: 'fn' }, { from: 'fn', to: 'out' }],
})

const ports = lesson({
  step: S('05-ports'), path: 'src/route.ts', model: 'One face, three ports, evenly spaced',
  focus: ['ends.sort((p, q) => p.key - q.key)', 'ends.forEach((p, k)'],
  side: [
    { type: 'table', id: 'face', title: "orders' left face", columns: ['edge from', 'sorted by y', 'port'], rows: [
      ['payments', '1st', '1/4'], ['inventory', '2nd', '2/4'], ['queue', '3rd', '3/4'],
    ] },
    { type: 'group', id: 'vs', bare: true, dir: 'row', children: [
      { type: 'item', id: 'before', icon: 'bell', tone: 'consume', title: 'before: all at 1/2', sub: 'three heads on one point' },
      { type: 'item', id: 'after', icon: 'check', tone: 'store', title: 'after: spread', sub: 'in the order the sources sit' },
    ] },
  ],
})

const overload = lesson({
  step: S('06-overloads'), path: 'src/edge.ts', model: 'Two signatures, one implementation',
  focus: ['export function edge(from: string, to: string): Edge', 'export function edge(spec:'],
  side: [
    { type: 'group', id: 'sigs', bare: true, dir: 'row', children: [
      { type: 'item', id: 's1', icon: 'code', tone: 'ingest', title: "edge('api', 'queue')", sub: 'two ids' },
      { type: 'item', id: 's2', icon: 'code', tone: 'ingest', title: 'edge({ from, to, label })', sub: 'one object, with a label' },
    ] },
    { type: 'item', id: 'impl', icon: 'workflow', tone: 'store', title: 'one implementation', sub: 'a: string | { … }, b?: string' },
    { type: 'item', id: 'bad', icon: 'bell', tone: 'consume', title: "edge('api')", sub: `${grab(run('06-overloads'), /error (TS\d+)/)}: matches neither signature` },
  ],
  edges: [{ from: 's1', to: 'impl' }, { from: 's2', to: 'impl' }],
})

const unknown = lesson({
  step: S('07-unknown'), path: 'scenes/checkout.ts', model: 'The throw unwinds to the top',
  focus: ["edge('api', 'paymnet')"],
  side: [
    { type: 'item', id: 'main', icon: 'terminal', title: 'main.ts', sub: 'draw(checkout, rects)' },
    { type: 'item', id: 'draw', icon: 'file', title: 'SvgRenderer.draw', sub: 'checks every edge end first' },
    { type: 'item', id: 'thrown', icon: 'bell', tone: 'consume', title: 'SceneError', sub: grab(run('07-unknown'), /SceneError: (edge \d+ \(.*\))/) },
    { type: 'item', id: 'cause', icon: 'search', tone: 'consume', title: '[cause]: RangeError', sub: grab(run('07-unknown'), /RangeError: (no node has the id "\w+")/) },
  ],
  edges: [{ from: 'main', to: 'draw', label: 'calls' }, { from: 'draw', to: 'thrown', label: 'throws' }, { from: 'thrown', to: 'cause' }],
})

export const ROUTE: Record<string, SceneModel> = {
  'route-tuples': tuples, 'route-intersection': inter, 'route-how': how, 'route-router': router,
  'route-ports': ports, 'route-overloads': overload, 'route-unknown': unknown,
}
