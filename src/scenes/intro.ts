// Course 1, `intro` — authored last: it shows the FINISHED miniflow. Concept frames, no side pane.
import type { SceneModel } from '@graphlearning/graphl-flow'
import { file, lineOf, shot } from '../spine'

const src = file('start/03-emit', 'main.ts'), js = file('start/03-emit', 'emit/main.js')

const what: SceneModel = {
  dir: 'row',
  nodes: [
    { type: 'group', id: 'how', title: 'TypeScript = JavaScript + types', tone: 'neutral', spread: true, children: [
      { type: 'item', id: 'ts', icon: 'file', tone: 'ingest', title: 'a .ts file', sub: 'JavaScript, with types written in' },
      { type: 'group', id: 'jobs', bare: true, dir: 'row', children: [
        { type: 'item', id: 'tsc', icon: 'search', tone: 'serve', title: 'tsc checks', sub: 'before anything runs' },
        { type: 'item', id: 'erase', icon: 'cpu', tone: 'infra', title: 'the types are erased', sub: 'by Node, Vite, or tsc' },
      ] },
      { type: 'item', id: 'v8', icon: 'zap', tone: 'infra', title: 'plain JavaScript runs', sub: 'in Node, or in a browser' },
    ] },
    { type: 'group', id: 'right', bare: true, children: [
      { type: 'code', id: 'before', fill: true, filename: 'main.ts', lang: 'ts', code: src, show: [[lineOf(src, 'type Box'), lineOf(src, 'const pad')]], highlight: [lineOf(src, 'type Box'), lineOf(src, 'const box'), lineOf(src, 'const pad')] },
      { type: 'code', id: 'after', fill: true, filename: 'emit/main.js', lang: 'js', code: js, show: [[lineOf(js, 'const box'), lineOf(js, 'const pad')]] },
      { type: 'group', id: 'used', title: 'written in TypeScript', tone: 'store', dir: 'grid', cols: 3, children:
        ['VS Code', 'Angular', 'Vite', 'Playwright', 'graphl-flow', 'miniflow'].map((t) => ({ type: 'item' as const, id: `u-${t}`, title: t, chip: true })) },
    ] },
  ],
  edges: [{ from: 'ts', to: 'tsc' }, { from: 'ts', to: 'erase' }, { from: 'erase', to: 'v8' }],
}

const STAGES = [
  ['box', 'one box', '2'], ['scene', 'a typed scene', '3'], ['layout', 'a layout', '4'], ['svg', 'a picture', '5'],
  ['arrows', 'arrows', '6'], ['files', 'scene files', '7'], ['cli', 'a command', '8'], ['tests', 'tests', '9'],
  ['types', 'types that compute', '10'], ['page', 'a page', '11'], ['pkg', 'a package', '12'],
] as const

const build: SceneModel = {
  nodes: [
    { type: 'group', id: 'twice', bare: true, dir: 'row', children: [
      { type: 'figure', id: 'file', src: shot('intro/01-file', 'out/self.svg'), alt: 'miniflow drawing itself, as an SVG file', title: 'out/self.svg', w: 600, h: 353 },
      { type: 'figure', id: 'page', src: shot('intro/02-page', 'localhost:5173'), alt: 'miniflow drawing itself, live in a page', title: 'localhost:5173', chrome: 'browser', w: 600, h: 353 },
    ] },
    { type: 'group', id: 'map', title: 'miniflow, course by course', tone: 'neutral', dir: 'row', children:
      STAGES.map(([id, title, n]) => ({ type: 'item' as const, id: `s-${id}`, title, sub: `course ${n}`, stack: true })) },
  ],
  edges: STAGES.slice(1).map(([id], i) => ({ from: `s-${STAGES[i]![0]}`, to: `s-${id}` })),
}

export const INTRO: Record<string, SceneModel> = { 'intro-what': what, 'intro-build': build }
