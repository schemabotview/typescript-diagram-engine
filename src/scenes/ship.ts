// Course 12, `ship` — ship it as a package.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, grab, lineOf, session } from '../spine'
import { lesson } from './lesson'

const S = (n: string) => `ship/${n}`
const run = (n: string) => session(S(n))

const surface = lesson({
  step: S('01-surface'), path: 'src/index.ts', model: 'Inside vs exported',
  focus: ["export { layout, mono, type Measurer, type Rect, type Size } from './layout.ts'", "export { SvgRenderer } from './render/svg.ts'", "export { defineScene } from './define.ts'"],
  side: [
    { type: 'group', id: 'out', title: 'exported: a promise', tone: 'store', dir: 'grid', cols: 3, children:
      ['layout', 'fit', 'SvgRenderer', 'defineScene', 'validate', 'SceneError'].map((t) => ({ type: 'item' as const, id: `e-${t}`, title: t, chip: true })) },
    { type: 'group', id: 'in', title: 'inside: free to change', tone: 'neutral', dir: 'grid', cols: 3, children:
      ['route', 'ports', 'SvgDocument', 'OutlineRenderer', 'cli', 'watch'].map((t) => ({ type: 'item' as const, id: `i-${t}`, title: t, chip: true, muted: true })) },
    { type: 'note', id: 'types', text: `At run time the module has ${run('01-surface').split('\n').filter((l) => /^ {2}'/.test(l)).length} exports. The types (Scene, Rect, Theme…) are exports too: they exist only for tsc.` },
  ],
})

const dts = lesson({
  step: S('02b-dts'), path: 'tsconfig.build.json', model: '.ts → .js + .d.ts: who reads which',
  focus: ['"declaration": true', '"isolatedDeclarations": true'],
  side: [
    { type: 'item', id: 'ts', icon: 'file', tone: 'neutral', title: 'src/fit.ts', sub: 'types and code together' },
    { type: 'group', id: 'outs', bare: true, dir: 'row', children: [
      { type: 'item', id: 'js', icon: 'cpu', tone: 'infra', title: 'dist/fit.js', sub: 'for Node: the code' },
      { type: 'item', id: 'd', icon: 'shield', tone: 'serve', title: 'dist/fit.d.ts', sub: 'for tsc: the types' },
    ] },
    { type: 'item', id: 'iso', icon: 'bell', tone: 'consume', title: 'isolatedDeclarations', sub: `${grab(run('02a-declarations'), /error (TS\d+)/)} on palette: write the type, so one file is enough` },
  ],
  edges: [{ from: 'ts', to: 'js' }, { from: 'ts', to: 'd' }],
})

const pack3 = run('03-exports'), pkg3 = file(S('03-exports'), 'package.json')
const pack = lesson({
  step: S('03-exports'), path: 'package.json', model: 'The package map: import path → file',
  focus: ['"exports": {', '"files": ['],
  show: [[lineOf(pkg3, '"exports": {'), lineOf(pkg3, '"exports": {') + 4], [lineOf(pkg3, '"files": ['), lineOf(pkg3, '"files": [')]],
  side: [
    { type: 'item', id: 'imp', icon: 'code', tone: 'neutral', title: "import … from 'miniflow'", sub: 'what a user writes' },
    { type: 'group', id: 'map', title: '"exports": { ".": … }', tone: 'ingest', dir: 'row', children: [
      { type: 'item', id: 'types', title: 'types', sub: './dist/index.d.ts' },
      { type: 'item', id: 'imp2', title: 'import', sub: './dist/index.js' },
    ] },
    { type: 'item', id: 'files', icon: 'package', tone: 'store', title: '"files": ["dist"]', sub: `${grab(pack3, /total files: (\d+)/)} files, ${grab(pack3, /package size: ([\d.]+ kB)/)}: no src, no tests` },
  ],
  edges: [{ from: 'imp', to: 'map' }, { from: 'map', to: 'files' }],
})

const smoke = lesson({
  step: S('04-smoke'), path: 'examples/shop/main.ts', model: 'Tarball → fresh install → tsc → run',
  focus: ["import { SvgRenderer, defineScene, layout, type Item } from 'miniflow'"],
  side: [
    { type: 'item', id: 'tgz', icon: 'package', tone: 'store', title: 'miniflow-1.0.0.tgz', sub: 'exactly what the registry would get' },
    { type: 'item', id: 'inst', icon: 'folder', tone: 'neutral', title: 'examples/shop', sub: 'a fresh project: npm install the .tgz' },
    { type: 'item', id: 'tsc', icon: 'shield', tone: 'serve', title: 'tsc --noEmit', sub: 'reads the .d.ts: the types arrived' },
    { type: 'item', id: 'run', icon: 'check', tone: 'store', title: 'node main.ts', sub: grab(run('04-smoke'), /^(shop\.svg drawn with miniflow)$/m) },
  ],
  edges: [{ from: 'tgz', to: 'inst' }, { from: 'inst', to: 'tsc' }, { from: 'tsc', to: 'run' }],
})

const semver = lesson({
  step: S('05-semver'), path: 'src/model.ts', model: 'Patch, minor, major',
  focus: ['subtitle?: string'],
  side: [
    { type: 'table', id: 'kinds', title: 'what a version number promises', columns: ['bump', 'means', 'e.g.'], rows: [
      ['patch', 'a fix', '1.0.1'], ['minor', 'something new', '1.1.0'], { cells: ['major', 'something breaks', grab(run('05-semver'), /^v(\d+\.\d+\.\d+)$/m)], tone: 'consume' },
    ] },
    { type: 'item', id: 'broke', icon: 'bell', tone: 'consume', title: 'the shop, on 2.0.0', sub: `${grab(run('05-semver'), /error (TS\d+)/)}: 'sub' does not exist in type 'Item'` },
    { type: 'item', id: 'ours', icon: 'check', tone: 'store', title: grab(run('05-semver'), /^(miniflow: check passed)$/m), sub: 'our own tests saw nothing wrong' },
  ],
})

const next = lesson({
  step: S('06-next'), path: 'examples/shop/main.ts', model: 'miniflow → <Scene> → graphl-flow',
  focus: ["const web: Item = { type: 'item', id: 'web', title: 'Web shop', subtitle: 'React', tone: 'consume' }"],
  side: [
    { type: 'item', id: 'mf', icon: 'package', tone: 'store', title: 'miniflow 2.0.0', sub: 'typed, tested, shipped: this film' },
    { type: 'item', id: 'react', icon: 'code', tone: 'ingest', title: '<Scene scene={…} />', sub: 'a React component around it: the next film' },
    { type: 'item', id: 'gf', icon: 'screen', tone: 'serve', title: 'graphl-flow', sub: 'the grown-up engine that drew every frame of this one' },
  ],
  edges: [{ from: 'mf', to: 'react' }, { from: 'react', to: 'gf' }],
})

export const SHIP: Record<string, SceneModel> = {
  'ship-surface': surface, 'ship-dts': dts, 'ship-pack': pack, 'ship-smoke': smoke, 'ship-semver': semver, 'ship-next': next,
}
