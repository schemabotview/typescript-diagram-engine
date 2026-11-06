// Course 5, `draw` — draw the scene. From 5.7 the output panel shows what miniflow drew.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `draw/${n}`
const run = (n: string) => session(S(n))
/** A dark-theme stroke, read from the step's own palette.ts (dark comes first in the file). */
const stroke = (tone: string) => grab(file(S('09-tones'), 'src/palette.ts'), new RegExp(`${tone}: \\{ fill: '[^']+', stroke: '([^']+)'`))

const klass = lesson({
  step: S('01-class'), path: 'src/svg-document.ts', model: 'The document is a list of elements',
  focus: ['export class SvgDocument', '#elements: string[] = []', 'constructor(width'],
  side: [
    { type: 'item', id: 'doc', icon: 'file', tone: 'ingest', title: 'new SvgDocument(200, 80)', sub: 'width, height, and #elements' },
    { type: 'table', id: 'els', title: '#elements', columns: ['#', 'element'], rows: [['0', '<rect … />'], ['1', '<text>checkout</text>']] },
    { type: 'group', id: 'calls', bare: true, dir: 'row', children: [
      { type: 'item', id: 'chain', icon: 'workflow', title: '.rect().text()', sub: 'each returns this' },
      { type: 'item', id: 'stat', icon: 'box', title: 'SvgDocument.empty()', sub: `static: ${grab(run('01-class'), /empty: (\d+)/)} elements` },
    ] },
  ],
  edges: [{ from: 'doc', to: 'els' }],
})

const priv = lesson({
  step: S('02-private'), path: 'src/svg-document.ts', model: 'Private at compile time, or at run time too',
  focus: ['#elements: string[] = []'],
  side: [
    { type: 'table', id: 'who', title: 'reading the field from outside', columns: ['', 'tsc', 'node'], rows: [
      { cells: ['private elements', grab(run('02-private'), /try-private\.ts\(\d+,\d+\): error (TS\d+)/), 'reads it'], tone: 'serve' },
      { cells: ['#elements', grab(run('02-private'), /try-hash\.ts\(\d+,\d+\): error (TS\d+)/), 'SyntaxError'], tone: 'store' },
    ] },
    { type: 'group', id: 'kinds', bare: true, dir: 'row', children: [
      { type: 'item', id: 'p', icon: 'search', tone: 'serve', title: 'private', sub: 'a type: erased with the rest' },
      { type: 'item', id: 'h', icon: 'lock', tone: 'store', title: '#elements', sub: 'JavaScript itself: kept at run time' },
    ] },
  ],
})

const thisScene = lesson({
  step: S('03-this'), path: 'src/svg-document.ts', model: 'this is set by the call, not the definition',
  focus: ['return this.rect(r)', 'list.forEach(this.box)'],
  side: [
    { type: 'group', id: 'calls', bare: true, dir: 'row', children: [
      { type: 'group', id: 'method', title: 'doc.box(r)', tone: 'store', children: [
        { type: 'item', id: 'm', title: 'this = doc', sub: 'called on the object' },
      ] },
      { type: 'group', id: 'bare', title: 'forEach calls box(r)', tone: 'consume', children: [
        { type: 'item', id: 'b', title: 'this = undefined', sub: 'called on nothing' },
      ] },
    ] },
    { type: 'item', id: 'err', icon: 'bell', tone: 'consume', title: 'TypeError', sub: grab(run('03-this'), /\[TypeError: (Cannot read properties of undefined)/) },
    { type: 'item', id: 'fix', icon: 'check', tone: 'store', title: '(r) => this.box(r)', sub: "an arrow function keeps its method's this" },
  ],
  edges: [{ from: 'bare', to: 'err' }],
})

const extend = lesson({
  step: S('04-extends'), path: 'src/render/base.ts', model: 'The class chain: what each level owns',
  focus: ['export abstract class BaseRenderer', 'abstract draw(', 'protected label('],
  side: [
    { type: 'item', id: 'base', icon: 'layers', tone: 'neutral', title: 'abstract BaseRenderer', sub: 'abstract draw, protected label, describe' },
    { type: 'group', id: 'kids', bare: true, dir: 'row', children: [
      { type: 'item', id: 'outline', icon: 'file', tone: 'ingest', title: 'OutlineRenderer', sub: 'draw: the outline text' },
      { type: 'item', id: 'svg', icon: 'file', tone: 'serve', title: 'SvgRenderer', sub: `draw: ${grab(run('04-extends'), /svg: (\d+ lines)/)} of SVG` },
    ] },
    { type: 'note', id: 'new', text: 'new BaseRenderer() is refused: an abstract class only exists to be extended.' },
  ],
  edges: [{ from: 'outline', to: 'base', label: 'extends' }, { from: 'svg', to: 'base', label: 'extends' }],
})

const iface = lesson({
  step: S('05-interface'), path: 'src/render/renderer.ts', model: 'One contract, two implementations',
  focus: ['export interface Renderer', 'draw(scene: Scene'],
  side: [
    { type: 'item', id: 'contract', icon: 'shield', tone: 'neutral', title: 'interface Renderer', sub: 'a name, and draw(scene, rects): string' },
    { type: 'group', id: 'impls', bare: true, dir: 'row', children: [
      { type: 'item', id: 'o', icon: 'file', tone: 'ingest', title: 'OutlineRenderer', sub: `${grab(run('05-interface'), /outline: (\d+) chars/)} chars` },
      { type: 'item', id: 's', icon: 'file', tone: 'serve', title: 'SvgRenderer', sub: `${grab(run('05-interface'), /svg: (\d+) chars/)} chars` },
    ] },
    { type: 'item', id: 'shared', icon: 'code', title: 'label(title, sub)', sub: 'a plain function now, not an inherited method' },
  ],
  edges: [{ from: 'o', to: 'contract', label: 'implements' }, { from: 's', to: 'contract', label: 'implements' }],
})

const structural = lesson({
  step: S('06-structural'), path: 'main.ts', model: 'Shapes, not names',
  focus: ['class Stats {', 'const counter = {', 'new OutlineRenderer(), new SvgRenderer(), new Stats(), counter'],
  side: [
    { type: 'table', id: 'fit', title: 'is it a Renderer?', columns: ['value', 'implements?', 'fits?'], rows: [
      ['OutlineRenderer', 'yes', 'yes'], ['Stats', 'no', 'yes'], ['counter { }', 'no', 'yes'],
    ] },
    { type: 'group', id: 'vs', bare: true, dir: 'row', children: [
      { type: 'item', id: 'ts', icon: 'boxes', tone: 'store', title: 'TypeScript', sub: 'structural: the shape is enough' },
      { type: 'item', id: 'java', icon: 'java', tone: 'neutral', title: 'Java, C#', sub: 'nominal: it must say implements' },
    ] },
  ],
})

const scene = lesson({
  step: S('07-scene'), path: 'src/render/svg.ts', model: 'Rects become elements',
  focus: ["case 'item':", 'doc.rect(r,', 'doc.text(x, y, `${node.title}`'],
  side: [
    { type: 'item', id: 'rects', icon: 'table', tone: 'store', title: 'Map<string, Rect>', sub: 'from layout(checkout)' },
    { type: 'item', id: 'visit', icon: 'workflow', tone: 'ingest', title: 'visit(node)', sub: 'a rect, then text from template literals' },
    { type: 'item', id: 'svg', icon: 'file', tone: 'serve', title: 'out/checkout.svg', sub: `${grab(run('07-scene'), /: (\d+) chars/)} characters of SVG` },
  ],
  edges: [{ from: 'rects', to: 'visit' }, { from: 'visit', to: 'svg' }],
})

const escape = lesson({
  step: S('08-escape'), path: 'scenes/checkout.ts', model: 'Text vs markup',
  focus: ["title: '<Cart>'"],
  side: [
    { type: 'group', id: 'meant', title: 'what the author meant', tone: 'store', children: [
      { type: 'item', id: 'a', title: 'text: <Cart>', sub: 'six characters to show' },
    ] },
    { type: 'group', id: 'read', title: 'what the parser read', tone: 'consume', children: [
      { type: 'item', id: 'b', title: 'a <Cart> element', sub: 'opened, never closed' },
    ] },
    { type: 'item', id: 'err', icon: 'bell', tone: 'consume', title: 'parser error', sub: `line ${grab(run('08-escape'), /svg:(\d+): parser error/)}: tag mismatch` },
  ],
  edges: [{ from: 'meant', to: 'read', label: 'pasted raw' }, { from: 'read', to: 'err' }],
})

const tones = lesson({
  step: S('09-tones'), path: 'src/palette.ts', model: 'The palette: tone × theme',
  focus: ['} satisfies Record<Theme, ThemeColors>'],
  side: [
    { type: 'table', id: 'pal', title: 'palette.dark.tones', columns: ['tone', 'stroke'], rows: [
      { cells: ['source', stroke('source')], tone: 'source' }, { cells: ['ingest', stroke('ingest')], tone: 'ingest' },
      { cells: ['store', stroke('store')], tone: 'store' }, { cells: ['serve', stroke('serve')], tone: 'serve' },
      { cells: ['consume', stroke('consume')], tone: 'consume' }, { cells: ['infra', stroke('infra')], tone: 'infra' },
    ] },
    { type: 'item', id: 'miss', icon: 'bell', tone: 'consume', title: "a palette without 'infra'", sub: `${grab(run('09-tones'), /error (TS\d+)/)}: satisfies needs all seven` },
    { type: 'item', id: 'esc', icon: 'check', tone: 'store', title: 'escapeXml(text)', sub: '<Cart> is drawn as text now' },
  ],
})

export const DRAW: Record<string, SceneModel> = {
  'draw-class': klass, 'draw-private': priv, 'draw-this': thisScene, 'draw-extends': extend,
  'draw-interface': iface, 'draw-structural': structural, 'draw-scene': scene, 'draw-escape': escape,
  'draw-tones': tones,
}
