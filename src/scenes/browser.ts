// Course 11, `browser` — run it in a browser. 11.3–11.6 show the live page from the step's own Vite.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { grab, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `browser/${n}`
const run = (n: string) => session(S(n))

const vite = lesson({
  step: S('01-vite'), path: 'web/index.html', model: 'Page → module graph → served',
  focus: ['<script type="module" src="./main.ts"></script>'],
  side: [
    { type: 'item', id: 'html', icon: 'file', tone: 'neutral', title: 'web/index.html', sub: 'the page, and one module script' },
    { type: 'item', id: 'vite', icon: 'zap', tone: 'ingest', title: grab(run('01-vite'), /(VITE v[\d.]+)/), sub: 'strips the types, serves each module as asked' },
    { type: 'item', id: 'url', icon: 'globe', tone: 'serve', title: grab(run('01-vite'), /Local: +(http:\/\/localhost:\d+\/)/), sub: 'ready in a fraction of a second' },
  ],
  edges: [{ from: 'html', to: 'vite' }, { from: 'vite', to: 'url' }],
})

const dom = lesson({
  step: S('02-dom'), path: 'web/main.ts', model: 'The DOM as a typed tree',
  focus: ["const host = document.querySelector('#scene')", "host.textContent = 'miniflow will draw here'"],
  side: [
    { type: 'item', id: 'q1', icon: 'search', tone: 'ingest', title: "querySelector('main')", sub: grab(run('02-dom'), /Type '(HTMLElement \| null)'/) },
    { type: 'item', id: 'q2', icon: 'search', tone: 'ingest', title: "querySelector('#scene')", sub: 'Element | null' },
    { type: 'item', id: 'q3', icon: 'search', tone: 'ingest', title: 'with a type argument', sub: 'querySelector with <HTMLButtonElement>: HTMLButtonElement | null' },
    { type: 'item', id: 'null', icon: 'bell', tone: 'consume', title: 'host.textContent = …', sub: `${grab(run('02-dom'), /error (TS\d+)/)}: host is possibly null` },
    { type: 'note', id: 'why', text: 'A selector can match nothing. The page could change, the id could be mistyped: null is the honest answer.' },
  ],
})

const svg = lesson({
  step: S('03-svg'), path: 'web/main.ts', model: 'Renderer → SVG string → innerHTML → the DOM',
  focus: ["assertScene(checkout, 'scenes/checkout.json')", 'host.innerHTML = new SvgRenderer().draw(checkout, layout(checkout))'],
  side: [
    { type: 'item', id: 'json', icon: 'file', tone: 'neutral', title: 'checkout.json', sub: "imported as a module: with { type: 'json' }" },
    { type: 'item', id: 'check', icon: 'shield', tone: 'ingest', title: 'assertScene', sub: 'moved to validate.ts: no node:fs in a page' },
    { type: 'item', id: 'render', icon: 'code', tone: 'ingest', title: 'the same SvgRenderer', sub: 'not one line changed for the browser' },
    { type: 'item', id: 'dom', icon: 'screen', tone: 'serve', title: 'host.innerHTML', sub: 'the browser parses the string into elements' },
  ],
  edges: [{ from: 'json', to: 'check' }, { from: 'check', to: 'render' }, { from: 'render', to: 'dom' }],
})

const measure = lesson({
  step: S('04-measure'), path: 'src/layout.ts', model: 'One interface, two measurers',
  focus: ['export interface Measurer {'],
  side: [
    { type: 'item', id: 'iface', icon: 'shield', tone: 'neutral', title: 'Measurer', sub: 'width(text): number' },
    { type: 'group', id: 'impls', bare: true, dir: 'row', children: [
      { type: 'item', id: 'mono', icon: 'terminal', tone: 'ingest', title: 'mono', sub: '9.6 px a character: Node, the CLI' },
      { type: 'item', id: 'canvas', icon: 'screen', tone: 'serve', title: 'canvasMeasurer', sub: 'measureText: the page, any font' },
    ] },
    { type: 'item', id: 'layout', icon: 'layers', tone: 'store', title: 'layout(scene, measure)', sub: 'passed in, never looked up: dependency injection' },
  ],
  edges: [{ from: 'mono', to: 'iface' }, { from: 'canvas', to: 'iface' }],
})

const events = lesson({
  step: S('05-events'), path: 'web/main.ts', model: 'Event → handler → re-render',
  focus: ["button.addEventListener('click', (event: MouseEvent) => {"],
  side: [
    { type: 'item', id: 'click', icon: 'user', tone: 'neutral', title: 'a click on #theme', sub: 'the browser makes a MouseEvent' },
    { type: 'item', id: 'handler', icon: 'zap', tone: 'ingest', title: '(event: MouseEvent) => …', sub: "'click' tells the checker which event: clientX is known" },
    { type: 'item', id: 'draw', icon: 'workflow', tone: 'serve', title: 'draw()', sub: 'the same rects, the other palette' },
  ],
  edges: [{ from: 'click', to: 'handler' }, { from: 'handler', to: 'draw' }],
})

const fit = lesson({
  step: S('06-fit'), path: 'web/main.ts', model: 'Pane size → fit → transform',
  focus: ['const { scale, dx, dy } = fit(content, frame)'],
  side: [
    { type: 'item', id: 'ro', icon: 'screen', tone: 'neutral', title: 'ResizeObserver', sub: 'calls place() whenever #scene changes size' },
    { type: 'item', id: 'fit', icon: 'zap', tone: 'ingest', title: 'fit(content, frame)', sub: 'the pure function from Course 4, tested in Course 9' },
    { type: 'item', id: 'tf', icon: 'layers', tone: 'serve', title: 'translate(dx, dy) scale(s)', sub: 'a CSS transform: no layout redone' },
  ],
  edges: [{ from: 'ro', to: 'fit' }, { from: 'fit', to: 'tf' }],
})

const run7 = run('07-build')
const kb = (re: RegExp) => grab(run7, re)
const build = lesson({
  step: S('07-build'), path: 'web/main.ts', model: 'Dev: unbundled. Build: bundled, hashed',
  focus: ['new ResizeObserver(place).observe(host)'],
  side: [
    { type: 'group', id: 'modes', bare: true, dir: 'row', children: [
      { type: 'item', id: 'dev', icon: 'zap', tone: 'ingest', title: 'vite (dev)', sub: 'one request per module, as written' },
      { type: 'item', id: 'prod', icon: 'package', tone: 'store', title: 'vite build', sub: `${kb(/(\d+ modules) transformed/)} → one script` },
    ] },
    { type: 'table', id: 'out', title: 'web/dist', columns: ['file', 'size', 'gzip'], rows: [
      ['index.html', kb(/index\.html +([\d.]+ kB)/), kb(/index\.html +[\d.]+ kB │ gzip: ([\d.]+ kB)/)],
      ['index-….css', kb(/\.css +([\d.]+ kB)/), kb(/\.css +[\d.]+ kB │ gzip: ([\d.]+ kB)/)],
      ['index-….js', kb(/\.js +([\d.]+ kB)/), kb(/\.js +[\d.]+ kB │ gzip: ([\d.]+ kB)/)],
    ] },
    { type: 'note', id: 'hash', text: 'The hash in each name changes when the content does, so a browser can cache a file forever.' },
  ],
})

export const BROWSER: Record<string, SceneModel> = {
  'browser-vite': vite, 'browser-dom': dom, 'browser-svg': svg, 'browser-measure': measure,
  'browser-events': events, 'browser-fit': fit, 'browser-build': build,
}
